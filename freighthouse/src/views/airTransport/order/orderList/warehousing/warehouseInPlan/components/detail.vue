<template>
	<div id="podWarehouseInplan">
		<div class="row-tit" id="saveBar">
			<span class="tit ft12 bold">计划进仓信息</span>
			<div class="row-tit-operate">
				<el-button type="default" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'cancel' })">取消</el-button>
				<el-button type="primary" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'save' })" :disabled="(isBd && !isImportJoint) || isDisabledEdit">保存</el-button>
			</div>
		</div>
		<div class="row-tit isFixed" :style="styleObject" id="fixedSaveBar" v-if="saveBarFixed">
			<span class="tit ft12 bold">计划进仓信息</span>
			<div class="row-tit-operate">
				<el-button type="default" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'cancel' })">取消</el-button>
				<el-button type="primary" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'save' })" :disabled="(isBd && !isImportJoint) || isDisabledEdit">保存</el-button>
			</div>
		</div>
		<div class="row-body">
			<el-form ref="form" :rules="rules" :model="formData" class="form-body" label-width="90px">
				<el-row>
					<el-col :span="6">
						<el-form-item label="进仓计划编号" prop="planNo" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.planNo" disabled clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="预计进仓时间" prop="planEnterTime" :show-message="false">
							<elDatePickerLimit size="mini" v-model="formData.planEnterTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="进仓仓库" prop="whId">
							<el-select v-model="formData.whId" size="mini" clearable :filterable="true" @visible-change="whVisibleChange" :filter-method="whFilterMehod" placeholder="请选择" @change="handleSelectWhid" style="width: 100%">
								<el-option v-for="(item, index) in whOptions" :label="item.label" :value="item.value" :key="index"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="仓位编码" prop="positionNo">
							<el-input size="mini" placeholder="请输入" v-model="formData.positionNo" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="客户名称" prop="custid" :show-message="false">
							<el-select v-model="formData.custid" size="mini" clearable :filterable="true" @visible-change="custVisibleChange" disabled :filter-method="custFilterMehod" placeholder="请选择" @change="handleSelectCust" style="width: 100%">
								<el-option v-for="(item, index) in custOptions" :label="item.label" :value="item.value" :key="index"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="客户姓名" prop="custContact">
							<el-input size="mini" placeholder="请输入" v-model="formData.custContact" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="客户联系电话" prop="custContactPhone">
							<el-input size="mini" placeholder="请输入" v-model="formData.custContactPhone" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="进仓要求" prop="remark">
							<el-input size="mini" placeholder="请输入" v-model="formData.remark" clearable maxlength="512" show-word-limit></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<div class="row-tit h32">
					<div class="ft14 tit"></div>
					<div class="row-tit-operate">
						<el-button size="mini" type="primary" @click="handleAddBox" :disabled="(isBd && !isImportJoint) || isDisabledEdit">添加集装箱</el-button>
					</div>
				</div>
				<div class="table-com-layout">
					<el-table ref="inPlanBox" fit style="width: 100%" class="inPlanBoxTable" v-for="(item, index) in tableData" :key="index" :data="item" :show-header="!index">
						<el-table-column prop="cn" label="集装箱号" align="center">
							<template slot-scope="scope">
								<span v-if="!scope.$index">{{ scope.row.cn }}</span>
							</template>
						</el-table-column>
						<el-table-column prop="boxNo" label="货物箱号" align="center">
							<template slot-scope="scope">
								<span v-if="scope.row.type === 'summary'">{{ scope.row.boxNo }}</span>
								<el-input v-else size="mini" placeholder="请输入货物箱号" v-model.number="scope.row.boxNo" clearable></el-input>
							</template>
						</el-table-column>
						<el-table-column prop="cname" label="品名" align="center">
							<template slot-scope="scope">
								<span v-if="scope.row.type === 'summary'">{{ scope.row.cname }}</span>
								<el-input
									v-else
									size="mini"
									placeholder="点击添加品名"
									v-model="scope.row.cname"
									clearable
									@focus="cnameClick(scope.row, index, scope.$index)"
									@blur="val => handleChangeCname(val, scope.row, index, scope.$index)"
									@change="val => handleChangeCname(val, scope.row, index, scope.$index)"
								></el-input>
							</template>
						</el-table-column>
						<el-table-column prop="mark" label="唛头" align="center">
							<template slot-scope="scope">
								<span v-if="scope.row.type === 'summary'">{{ scope.row.mark }}</span>
								<el-input v-else size="mini" placeholder="请输入唛头" v-model="scope.row.mark" clearable disabled></el-input>
							</template>
						</el-table-column>
						<el-table-column prop="quantity" label="预计进仓件数" align="center">
							<template slot-scope="scope">
								<span v-if="scope.row.type === 'summary'">{{ scope.row.quantity }}</span>
								<el-input v-else size="mini" placeholder="请输入件数" v-model.number="scope.row.quantity" clearable @blur="validateNum('quantity', scope.row)"></el-input>
							</template>
						</el-table-column>
						<el-table-column prop="weight" label="预计进仓毛重(KGS)" align="center" width="130">
							<template slot-scope="scope">
								<span v-if="scope.row.type === 'summary'">{{ scope.row.weight }}</span>
								<el-input v-else size="mini" placeholder="请输入毛重" v-model="scope.row.weight" clearable @blur="validateVolumeWeight('weight', scope.row)"></el-input>
							</template>
						</el-table-column>
						<el-table-column prop="volume" label="预计进仓体积(CBM)" align="center" width="130">
							<template slot-scope="scope">
								<span v-if="scope.row.type === 'summary'">{{ scope.row.volume }}</span>
								<el-input v-else size="mini" placeholder="请输入体积" v-model="scope.row.volume" clearable @blur="validateVolumeWeight('volume', scope.row)"></el-input>
							</template>
						</el-table-column>
						<el-table-column prop="packageType" label="预计进仓包装" align="center">
							<template slot-scope="scope">
								<span v-if="scope.row.type === 'summary'">{{ scope.row.packageType }}</span>
								<el-select v-else size="mini" v-model="scope.row.packageType" placeholder="请选择包装" clearable filterable>
									<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
								</el-select>
							</template>
						</el-table-column>
						<el-table-column label="操作" width="150" align="center" fixed="right">
							<template slot-scope="scope">
								<span v-if="scope.row.type === 'summary'"></span>
								<div class="operate-group" v-else>
									<el-button @click="handleAddCargo(scope.row, item)" type="text" size="mini" :disabled="(isBd && !isImportJoint) || isDisabledEdit" v-if="!scope.$index">添加货物箱号</el-button>
									<el-button @click="handleDelete(scope.row, scope.$index, index)" type="text" size="mini" :disabled="(isBd && !isImportJoint) || isDisabledEdit">删除</el-button>
								</div>
							</template>
						</el-table-column>
					</el-table>
				</div>
			</el-form>
		</div>
		<div v-if="popContainerShow">
			<PopContainer @close="popContainerClose" :bindContainerList="boxList" />
		</div>
		<div v-if="showCnameDialog">
			<Cname :clickType="'planIn'" @close="closeCnameDialog" @handleConfirm="handleConfirm"></Cname>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { quantityMixin } from '@/views/order/order/mixins/quantityMixin'
import { accAdd } from '@/utils/tools'
import { warehouseList } from '@/api/order/warehouse'
import PopContainer from '../../components/popContainer'
import Cname from '../../components/cname'

export default {
	mixins: [quantityMixin],
	data() {
		return {
			oQuery: this.$route.query,
			formData: JSON.parse(JSON.stringify(this.detailData)),
			rules: {
				planNo: [{ required: true, message: '进仓计划编号不能为空', trigger: 'blur' }],
				custid: [{ required: true, message: '客户名称不能为空', trigger: 'change' }],
				planEnterTime: [{ required: true, message: '预计进仓时间不能为空', trigger: 'change' }]
			},
			whOptions: [],
			custOptions: [],
			boxList: [],
			tableData: [],
			popContainerShow: false, // 集装箱弹窗
			boxListItemQuery: {
				itemId: undefined,
				cn: '',
				containerId: null,
				boxNo: null,
				cargoId: '',
				mark: '',
				cname: '',
				packageType: '',
				quantity: '',
				volume: '',
				weight: ''
			},
			showCnameDialog: false,
			containerIndex: '',
			cargoIndex: ''
		}
	},
	props: {
		isDisabledEdit: {
			type: Boolean,
			default: false
		},
		detailData: {
			type: Object,
			default: () => ({})
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		}
	},
	created() {},
	watch: {
		detailData: {
			handler(newValue) {
				console.log(newValue)
				this.formData = JSON.parse(JSON.stringify(newValue))
				this.whOptions = [{ label: newValue.whName, value: newValue.whId }]
				this.custOptions = [{ label: newValue.custName, value: newValue.custid }]
				let boxList = []
				this.formData.cargoInfoList.map(item => {
					let itemQuery = {}
					for (let i in this.boxListItemQuery) {
						itemQuery[i] = item[i]
					}
					boxList.push(itemQuery)
				})
				this.boxList = JSON.parse(JSON.stringify(boxList))
				this.setInitTableData(this.boxList)
			},
			deep: true
		},
		tableData: {
			handler(newValue) {
				console.log(newValue)
				newValue.map((item, index) => {
					item.map(ele => {
						let quantity = 0,
							weight = 0,
							volume = 0
						if (ele.type === 'summary') {
							let filterData = newValue[index - 1]
							console.log(filterData)
							filterData.map(o => {
								quantity = accAdd(quantity, o.quantity)
								weight = accAdd(weight, o.weight)
								volume = accAdd(volume, o.volume)
							})
							ele.quantity = quantity
							ele.weight = weight
							ele.volume = volume
						}
					})
				})
			},
			deep: true
		}
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			serviceInfoList: state => state.order.serviceInfoList,
			airOrderInfo: state => state.airTransport.airOrderInfo || {},
		}),
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		isEpricing() {
			return this.ordDetRole === 'epricing'
		},
		isEcs() {
			return this.ordDetRole === 'ecs'
		},
		isBd() {
			let isJoint = this.isJoint
			if (this.$route.query.jointNo) {
				isJoint = false
			}
			return isJoint
		},
		isJoint() {
			let serviceInfo = this.airOrderInfo.serviceInfoList.find(item => item.serviceCode === 'pod_warehouse')
			let isJoint = serviceInfo ? serviceInfo.isJoint : ''
			return isJoint === 'y' && !this.$route.query.jointNo ? true : false
		},
		// 20220509特殊处理为进口协同单的服务项权限都放开
		isImportJoint() {
			return false
		},
		styleObject() {
			// 顶部距离文档
			let offsetTop = document.querySelector('.tabs-container').offsetTop
			return this.saveBarFixed
				? {
						left: '120px',
						top: offsetTop + 24 + 'px'
				  }
				: {}
		}
	},
	components: {
		PopContainer,
		Cname
	},
	methods: {
		/*
      boxList数组转成格式为[[],[]]的tableData数组，有几个不同的containerId箱子,tableData内就有几个数组。每个箱子数组后面插入一个小计的数组
      如果是第一个table，则显示表头
      如果不是第一个table，则隐藏表头
      把同一个containerId的组成为一个数组table，小计也组成为一个数组table.
      循环tableData生成多个table,显示带有小计的table
    */
		setInitTableData(values) {
			values = values || []
			let tableData = []
			if (!values.length) return (this.tableData = [[]])

			let tempContainerIds = []
			values.map(item => {
				tempContainerIds.push(item.containerId)
			})
			// 数组去重
			tempContainerIds = new Set(tempContainerIds)
			tempContainerIds = Array.from(tempContainerIds)
			tempContainerIds.map(item => {
				let quantity = '',
					weight = '',
					volume = ''
				let filterData = values.filter(ele => ele.containerId === item)
				let countData = [{ type: 'summary', containerId: filterData[0].containerId, cn: '', mark: '小计', quantity, weight, volume }]
				tableData.push(filterData)
				tableData.push(countData)
			})
			this.tableData = tableData
			console.log('tableData', tableData)
		},
		// 添加货物箱号
		handleAddCargo(row, item) {
			let { cn, containerId } = row
			let tempRowVal = { cn, containerId, cname: '', mark: '', quantity: '', weight: '', volume: '' }
			item.push(tempRowVal)
			let boxList = []
			this.tableData.map(item => {
				item.map(ele => {
					if (ele.type !== 'summary') {
						boxList.push(ele)
					}
				})
			})
			this.boxList = boxList
			// console.log(this.tableData)
			// console.log('boxList', this.boxList)
		},
		// 删除货物箱
		handleDelete(row, cargoIndex, containerIndex) {
			let { containerId } = row
			let boxArray = this.tableData[containerIndex].filter((ele, index) => index !== cargoIndex)
			this.$set(this.tableData, containerIndex, boxArray)
			// 同一个箱号的数组删除为空时，小计数组也要过滤掉
			if (!boxArray.length) {
				this.tableData = this.tableData.filter(item => item.length && item[0].containerId !== containerId)
			}
			if (!this.tableData.length) {
				this.tableData = [[]]
			}
			let boxList = []
			this.tableData.map(item => {
				item.map(ele => {
					if (ele.type !== 'summary') {
						boxList.push(ele)
					}
				})
			})
			this.boxList = boxList
			console.log(boxArray, this.tableData)
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		// 点击品名
		cnameClick(row, containerIndex, cargoIndex) {
			this.containerIndex = containerIndex
			this.cargoIndex = cargoIndex
			this.showCnameDialog = true
		},
		handleChangeCname(val, row, containerIndex, cargoIndex) {
			if (!val) {
				this.tableData[this.containerIndex][this.cargoIndex].cargoId = ''
				this.tableData[this.containerIndex][this.cargoIndex].cname = ''
				this.tableData[this.containerIndex][this.cargoIndex].mark = ''
			}
		},
		closeCnameDialog() {
			this.showCnameDialog = false
		},
		handleConfirm(data) {
			console.log(data, this.containerIndex, this.cargoIndex)
			this.tableData[this.containerIndex][this.cargoIndex].cargoId = data.cargoId
			this.tableData[this.containerIndex][this.cargoIndex].cname = data.cname
			this.tableData[this.containerIndex][this.cargoIndex].mark = data.mark
		},
		// 箱子校验
		validate(values) {
			let numberReg = /^[0-9]+$/,
				reg = /^\d+(\.\d+)?$/
			let boxValid = values.some(item => !numberReg.test(item.boxNo))
			let weightValid = values.some(item => !reg.test(item.weight))
			let volumeValid = values.some(item => !reg.test(item.volume))
			let quantityValid = values.some(item => !numberReg.test(item.quantity))

			if (!values.length) {
				this.$message({ type: 'error', message: '请选择集装箱' })
				return false
			}
			if (values.some(item => !item.containerId)) {
				this.$message({ type: 'error', message: '请选择正确的集装箱' })
				return false
			}
			if (values.some(item => !item.boxNo || boxValid)) {
				this.$message({ type: 'error', message: '请填写正确的货物箱号' })
				return false
			}
			if (values.some(item => !item.cargoId)) {
				this.$message({ type: 'error', message: '请选择正确的货品' })
				return false
			}
			if (values.some(item => !item.quantity || quantityValid)) {
				this.$message({ type: 'error', message: '请填写正确的货品件数' })
				return false
			}
			if (values.some(item => !item.weight || weightValid)) {
				this.$message({ type: 'error', message: '请填写正确的货品毛重' })
				return false
			}
			if (values.some(item => !item.volume || volumeValid)) {
				this.$message({ type: 'error', message: '请填写正确的货品体积' })
				return false
			}
			if (values.some(item => !item.packageType)) {
				this.$message({ type: 'error', message: '请选择正确的货品包装' })
				return false
			}
			return true
		},
		// 详情取消保存回调
		callBack(data) {
			if (data.type == 'save') {
				this.$refs.form.validate(valid => {
					if (valid) {
						let data = { ...this.formData }
						let tableList = []
						this.tableData.map(item => {
							item.map(ele => {
								tableList.push(ele)
							})
						})
						tableList = tableList.filter(item => item.type !== 'summary')
						data.cargoInfoList = tableList
						if (!this.validate(tableList)) return
						this.$emit('handleConfirm', data)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		// 选择集装箱
		handleAddBox() {
			this.popContainerShow = true
		},
		// 集装箱关闭回调
		popContainerClose(action, values) {
			console.log(action, values)
			this.popContainerShow = false
			values = values || []
			if (action === 'Confirm') {
				if (!values.length) return
				let containerIds = []
				this.boxList.map(item => {
					containerIds.push(item.containerId)
				})
				// 过滤掉详情已有的箱子，只取新增的箱子并默认显示添加箱号、件毛体包装等
				let addContainerData = values.filter(item => !containerIds.includes(item.containerId))
				this.boxList = this.boxList.concat(addContainerData)
				this.setInitTableData(this.boxList)
			}
		},
		whVisibleChange(val) {
			if (val) this.wareHouseSearch('')
		},
		whFilterMehod(val) {
			this.wareHouseSearch(val)
		},
		// 仓库模糊查询
		wareHouseSearch(queryString) {
			let data = {
				currPage: 1,
				pageSize: 50,
				warehouseName: queryString
			}
			warehouseList(data).then(res => {
				let list = res.data.list
				this.whOptions = list
					.filter(item => item.state === 'valid')
					.map(item => {
						return Object.assign(item, {
							value: item.whId,
							label: item.warehouseName
						})
					})
			})
		},
		handleSelectWhid(val) {
			if (val) {
				let label = this.whOptions.filter(o => o.value === val)[0].label
				this.formData.whName = label
			} else {
				this.formData.whName = ''
			}
		},
		custVisibleChange(val) {
			if (val) this.customerSearch('')
		},
		custFilterMehod(val) {
			this.customerSearch(val)
		},
		// 客户模糊查询
		customerSearch(val) {
			this.$store.dispatch('dict/queryCustomerList', val || '').then(data => {
				let list = data.list
				this.custOptions = list.map(o => {
					return Object.assign(o, {
						value: o.custid ? Number(o.custid) : '',
						label: this.$language == 'en' ? o.ename : o.name
					})
				})
			})
		},
		handleSelectCust(val) {
			if (val) {
				let label = this.custOptions.filter(o => o.value === val)[0].label
				this.formData.custName = label
			} else {
				this.formData.custName = ''
			}
		}
	}
}
</script>

<style lang="scss">
#podWarehouseInplan {
	.row-body {
		margin-top: 8px;
	}
	.el-collapse-item__content {
		padding-top: 10px;
		font-size: 12px;
	}
	.el-form-item {
		margin-bottom: 4px;
	}
	.el-form-item__label {
		padding-right: 4px;
		line-height: 20px;
	}
	.el-form-item__content {
		margin-right: 10px;
		line-height: 20px;
	}
	.row-tit {
		padding: 0 0 !important;
		&.isFixed {
			position: fixed;
			background-color: #fff;
			z-index: 999;
			padding: 5px 20px !important;
			height: 30px;
			box-shadow: 4px 0px 10px 0px #e9e9e9;
			top: 24px;
			right: 0;
			.tit {
				line-height: 20px;
			}
		}
	}
	.inPlanBoxTable {
		margin-top: -1px;
	}
}
</style>
