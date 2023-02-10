<template>
	<div class="ltlDelivery-container">
		<div class="row-tit h32 mt10" id="saveBar">
			<div class="ft14 tit">{{ type === 'add' ? '新增散车派送委托' : '散车派送委托详情' }}</div>
			<div class="row-tit-operate">
				<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
				<el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="isBd || createItem.status === 'finish'">保存</el-button>
			</div>
		</div>
		<div class="row-tit h32 mt10 isFixed" :style="styleObject" id="fixedSaveBar" v-if="saveBarFixed">
			<div class="ft14 tit">{{ type === 'add' ? '新增散车派送委托' : '散车派送委托详情' }}</div>
			<div class="row-tit-operate">
				<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
				<el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="isBd || createItem.status === 'finish'">保存</el-button>
			</div>
		</div>
		<el-form ref="ltlSave" :rules="rules" :model="detailData" class="form-body mt10" label-width="90px">
			<el-row>
				<el-col :span="6">
					<el-form-item label="委托编号" prop="intrustNo" :show-message="false">
						<el-input size="mini" placeholder="请输入" v-model="detailData.intrustNo" disabled clearable></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="车队" prop="supplierId">
						<el-select
							style="width: 100%"
							placeholder="请选择"
							size="mini"
							v-model="detailData.supplierId"
							clearable
							:filterable="true"
							@visible-change="supplierVisibleChange"
							:filter-method="supplierFilterMehod"
							@change="handleSelectSupplierName"
							:disabled="isDisabled"
						>
							<el-option v-for="(item, index) in supplierList" :key="index" :label="item.label" :value="item.value"></el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="车队联系人" prop="supplierContact">
						<el-autocomplete
							style="width: 100%"
							size="mini"
							clearable
							v-model="detailData.supplierContact"
							:fetch-suggestions="(queryString, cb) => querySearchContact(queryString, cb)"
							placeholder="请输入车队联系人"
							:disabled="isDisabled"
							@select="value => handleSelectContact(value)"
						></el-autocomplete>
						<!-- <el-input size="mini" placeholder="请输入车队联系人" v-model="detailData.supplierContact" clearable :disabled="isDisabled"></el-input> -->
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="车队联系人电话" prop="supplierContactPhone">
						<el-input size="mini" placeholder="请输入车队联系人电话" v-model="detailData.supplierContactPhone" clearable :disabled="isDisabled"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="车队联系电话" prop="supplierPhone">
						<el-input size="mini" placeholder="请输入车队联系电话" v-model="detailData.supplierPhone" clearable :disabled="isDisabled"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="6">
					<el-form-item label="派车类型" prop="intrustType_cn" :show-message="false">
						<el-input size="mini" placeholder="请输入派车类型" v-model="detailData.intrustType_cn" disabled clearable></el-input>
					</el-form-item>
				</el-col>
				<!-- <el-col :span="4">
        <el-form-item label="委托状态" prop="status">
          <el-select v-model="detailData.status" size="mini" placeholder="请选择" clearable style="width: 100%">
            <el-option v-for="item in dictMap.podDeliveryLtlStatus" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-col> -->
				<el-col :span="12">
					<el-form-item label="注意事项" prop="remark">
						<el-input size="mini" placeholder="请输入" v-model="detailData.remark" clearable :disabled="isDisabled" maxlength="512" show-word-limit></el-input>
					</el-form-item>
				</el-col>
			</el-row>
			<div class="row-tit h32" style="border-bottom: 0">
				<div class="ft14 tit"></div>
				<div class="row-tit-operate">
					<el-button size="mini" type="primary" @click="handleAddOutPlan" :disabled="isBd || createItem.status === 'finish' || detailData.status !== 'init'">添加出仓计划</el-button>
				</div>
			</div>
			<div class="">
				<el-table ref="outPlanBox" border fit highlight-current-row stripe style="width: 100%;" class="outPlanBoxTable" :data="tableData" :span-method="objectSpanMethod">
					<el-table-column prop="outPlanNo" label="出仓计划编号" align="center" width="120"></el-table-column>
					<el-table-column prop="whName" label="出仓仓库" align="center"></el-table-column>
					<el-table-column prop="custName" label="客户名称" align="center" width="150"></el-table-column>
					<el-table-column label="装货地点" width="150" align="center">
						<template slot-scope="scope">
							{{ scope.row.loadProvince + scope.row.loadCity }}
						</template>
					</el-table-column>
					<el-table-column prop="loadAddress" label="装货详细地址" align="center" width="150"></el-table-column>
					<el-table-column prop="loadContact" label="装货人" align="center"> </el-table-column>
					<el-table-column prop="loadContactPhone" label="装货人电话" align="center" width="120"> </el-table-column>
					<el-table-column prop="preLoadTime" label="委托装柜时间" align="center" width="120"> </el-table-column>
					<el-table-column prop="loadTime" label="实际到场时间" align="center" width="120"> </el-table-column>
					<el-table-column prop="unloadContact" label="卸货人" align="center"> </el-table-column>
					<el-table-column prop="unloadContactPhone" label="卸货电话" align="center" width="120"> </el-table-column>
					<el-table-column label="卸货地点" align="center" width="150">
						<template slot-scope="scope">
							{{ scope.row.unloadProvince + scope.row.unloadCity }}
						</template>
					</el-table-column>
					<el-table-column prop="unloadAddress" label="卸货详细地址" align="center" width="120"> </el-table-column>
					<el-table-column prop="postcode" label="邮政编码" align="center" width="120"> </el-table-column>
					<el-table-column prop="" label="货品信息" align="center" width="120">
						<template slot-scope="scope">
							<el-button :disabled="!scope.row.loadContact" @click="handleViewCargos(scope.row)" type="text" size="mini">查看</el-button>
						</template>
					</el-table-column>
					<el-table-column prop="driverName" label="司机姓名" align="center"> </el-table-column>
					<el-table-column prop="driverPhone" label="司机电话" align="center"> </el-table-column>
					<el-table-column prop="licensePlate" label="车牌号" align="center"> </el-table-column>
					<el-table-column label="签收信息" align="center" width="250" v-if="signShow">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button type="text" size="mini" @click="handleViewFile(scope.row)" v-if="scope.row.signFileName">{{ scope.row.signFileName }}</el-button>
								<el-button @click="handleUpload(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd || createItem.status === 'finish'" v-if="!scope.row.signFileNo && createItem.status === 'dispatched'">上传签收信息</el-button>
								<el-button @click="handleDeleteFile(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd || createItem.status === 'finish'" v-if="scope.row.signFileNo && detailData.status === 'dispatched'">删除签收信息</el-button>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="signTime" label="签收时间" align="center" width="150" v-if="signShow"></el-table-column>
					<el-table-column fixed="right" label="操作" width="180" align="center">
						<template slot-scope="scope">
							<div class="operate-group">
								<el-button v-if="outPlanNoSpanArr[scope.$index] && detailData.status === 'init'" @click="handleInfo('add', scope.row, scope.$index)" type="text" size="mini" :disabled="isBd || createItem.status === 'finish'">添加地址</el-button>
								<el-button :disabled="!scope.row.loadContact" @click="handleInfo('info', scope.row, scope.$index)" type="text" size="mini">详情</el-button>
								<el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd || createItem.status === 'finish' || detailData.status !== 'init'">删除</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</el-form>
		<div v-if="outPlanShow">
			<OutPlan :outPlanList="tableData" @close="outPlanPopClose"></OutPlan>
		</div>
		<div v-if="ltlDeliveryInfoShow">
			<LtlDeliveryInfo @close="ltlDeliveryInfoClose" :addressData="addressData" />
		</div>
		<div v-if="showCargoDialog">
			<CargosDialog :cargosList="cargosList" @close="closeDialog"></CargosDialog>
		</div>
		<div v-if="uploadFileShow">
			<FileUpload :param="uploadFileQuery" @close="uploadFilePopClose"></FileUpload>
		</div>
	</div>
</template>

<script>
import { mapState } from 'vuex'
import { ltlFileDelete } from '@/api/order/podService/ltlDelivery'
import { supplierInfo } from '@/api/crm/supplier'
import LtlDeliveryInfo from './ltlDeliveryInfo'
import CargosDialog from './cargosDialog'
import OutPlan from './popOutPlan'
import FileUpload from './fileUpload'

export default {
	filters: {},
	props: {
		createItem: {
			type: Object,
			default: () => ({})
		},
		signShow: {
			type: Boolean,
			default: true
		},
		type: {
			type: String,
			default: ''
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			state: 'valid',
			oQuery: this.$route.query,
			supplierList: [],
			detailData: {},
			rules: {
				intrustNo: [{ required: true, message: '请输入委托编号', trigger: 'blur' }],
				intrustType_cn: [{ required: true, message: '请输入派车类型', trigger: 'blur' }]
			},
			outPlanNoSpanArr: [],
			pos: 0,
			tableData: [],
			ltlDeliveryInfoShow: false, // 添加货品弹窗
			addressData: {},
			clickRowIndex: '', // 点击的row索引
			addressType: 'add',
			showCargoDialog: false, // 显示商品信息弹窗
			cargosList: [], // 商品信息表格数据
			outPlanShow: false,
			uploadFileShow: false,
			uploadFileQuery: {},
			restaurants: [], // 供应商所有值
			contactInfo: []
		}
	},
	created() {},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo,
			custid: state => state.order.custid,
			ordDetRole: state => state.order.orderList.ordDetRole,
			serviceInfoList: state => state.order.serviceInfoList
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
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || (!this.isDoc && !this.isEpricing && !this.isEcs) || this.isJoint
		},
		isJoint() {
			let serviceInfo = this.serviceInfoList.find(item => item.serviceCode === 'pod_wh_matter')
			let isJoint = serviceInfo ? serviceInfo.isJoint : ''
			return isJoint === 'y' && !this.$route.query.jointNo ? true : false
		},
		viewState() {
			return this.oQuery.action === 'view' && !this.isOp
		},
		jointState() {
			return this.oQuery.jointNo ? true : false
		},
		isDisabled() {
			return this.detailData.status !== 'init'
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
		LtlDeliveryInfo,
		CargosDialog,
		OutPlan,
		FileUpload
	},
	watch: {
		createItem: {
			handler(newVal) {
				this.detailData = { ...newVal }
				Object.assign(this.detailData, {
					supplierId: newVal.supplierId === 0 ? '' : newVal.supplierId
				})
				this.supplierList = [{ label: this.detailData.supplierName, value: this.detailData.supplierId }]
				// 获取报检公司联系人信息
				if (this.detailData.supplierId) {
					supplierInfo({ supplierId: this.detailData.supplierId }).then(res => {
						let { contact } = res.data
						this.restaurants = this.loadAll(contact)
					})
				}
				this.tableData = [...this.detailData.loadInfoList]
				this.getSpanArr(this.tableData)
			},
			deep: true,
			immediate: true
		}
	},
	methods: {
		// 储存合并相同的箱号的id
		getSpanArr(data) {
			/*  
        如果是第一条记录（索引为0），向数组中加入1，并设置索引位置；
        如果不是第一条记录，则判断它与前一条记录是否相等，
        如果相等，则向spanArr中添入元素0，并将前一位元素+1，表示合并行数+1，
        以此往复，得到所有行的合并数，0即表示该行不显示。
    */
			this.outPlanNoSpanArr = []
			for (var i = 0; i < data.length; i++) {
				if (i === 0) {
					this.outPlanNoSpanArr.push(1) //outPlanNoSpanArr是一个空数组，用于存放每一行记录的合并数
					this.pos = 0 //pos是outPlanNoSpanArr的索引
				} else {
					// 判断出仓计划编号当前元素与上一个元素是否相同
					if (data[i].outPlanNo === data[i - 1].outPlanNo) {
						this.outPlanNoSpanArr[this.pos] += 1
						this.outPlanNoSpanArr.push(0)
					} else {
						this.outPlanNoSpanArr.push(1)
						this.pos = i
					}
				}
			}
			console.log(this.outPlanNoSpanArr)
		},
		// 合并单元格
		objectSpanMethod({ row, column, rowIndex, columnIndex }) {
			// 箱号，附件列需合并
			if ([0, 1].includes(columnIndex)) {
				//用于设置要合并的列
				const _row = this.outPlanNoSpanArr[rowIndex]
				const _col = _row > 0 ? 1 : 0
				return {
					rowspan: _row, //合并的行数
					colspan: _col //合并的列数，设为0则直接不显示
				}
			}
		},
		// 新增出仓计划
		handleAddOutPlan() {
			this.outPlanShow = true
		},
		outPlanPopClose(action, values) {
			console.log(action, values)
			this.outPlanShow = false
			if (action === 'Confirm') {
				// if (!values.length) return
				let outPlanNos = []
				this.tableData.map(item => {
					outPlanNos.push(item.outPlanNo)
				})
				// // 过滤掉详情已有的出仓计划编号，只取新增的出仓计划编号
				// let addTableData = values.filter(item => !outPlanNos.includes(item.outPlanNo))
				// this.tableData = this.tableData.concat(addTableData)

				//
				let list = []
				values.forEach(item => {
					let row = this.tableData.find(ele => ele.outPlanNo === item.outPlanNo)
					if (row) {
						list.push(row)
					} else {
						list.push(item)
					}
				})
				console.log(list)
				this.tableData = list
				this.getSpanArr(this.tableData)
			}
		},
		handleInfo(type, row, index) {
			console.log('🚀 ~ row', row)
			this.clickRowIndex = index
			this.addressType = type
			this.ltlDeliveryInfoShow = true
			let loadInfoList = this.detailData.loadInfoList.filter(item => item.outPlanNo === row.outPlanNo)
			let cargoInfoList = loadInfoList.length ? loadInfoList[0].cargoInfoList : []
			if (type === 'add') {
				this.addressData = {
					status: this.detailData.status,
					outPlanNo: row.outPlanNo,
					custid: row.custid,
					custName: row.custName,
					whName: row.whName,
					whId: row.whId,
					cargoInfoList: cargoInfoList
				}
			} else {
				//点击详情反显地点数据 只有国家时 数组只添加国家
				row.loadPlace = row.loadCity ? [row.loadProvince, row.loadCity] : [row.loadProvince]
				row.unloadPlace = row.unloadCity ? [row.unloadProvince, row.unloadCity] : [row.unloadProvince]
				Object.assign(this.addressData, row, {
					status: this.detailData.status
				})
			}
		},
		// 货品关闭回调
		ltlDeliveryInfoClose(action, values) {
			console.log('🚀 ~ values', values)
			this.ltlDeliveryInfoShow = false
			if (action === 'Confirm') {
				// 详情
				if (this.addressType === 'info') {
					this.$set(this.tableData, this.clickRowIndex, values)
				} else {
					// 添加地址,如果无装货信息的要先赋给该行的装货信息，如果有装货信息的就添加一行地址
					if (!this.tableData[this.clickRowIndex].loadContact) {
						this.$set(this.tableData, this.clickRowIndex, values)
					} else {
						let posIndex = this.clickRowIndex + this.outPlanNoSpanArr[this.clickRowIndex]
						this.tableData.splice(posIndex, 0, values)
						this.getSpanArr(this.tableData)
					}
				}
			}
		},
		// 删除货物箱
		handleDelete(row, sIndex) {
			this.tableData = this.tableData.filter((item, index) => index !== sIndex)
			this.getSpanArr(this.tableData)
		},
		// 查看货品
		handleViewCargos(row) {
			this.cargosList = row.cargoInfoList
			this.showCargoDialog = true
		},
		closeDialog() {
			this.showCargoDialog = false
		},
		handleUpload(row, index) {
			this.uploadFileShow = true
			this.clickRowIndex = index
			Object.assign(this.uploadFileQuery, row, {
				intrustNo: this.detailData.intrustNo
			})
		},
		uploadFilePopClose(action, values) {
			console.log(action, values)
			this.uploadFileShow = false
			if (action === 'Confirm') {
				this.$emit('importFile', this.detailData.intrustNo)
			}
		},
		handleDeleteFile(row, index) {
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let data = {
						intrustNo: this.detailData.intrustNo,
						loadId: row.loadId,
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo
					}
					return ltlFileDelete(data)
				})
				.then(response => {
					this.$message({
						message: '删除成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							this.$emit('importFile', this.detailData.intrustNo)
						}
					})
				})
				.catch(() => {})
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		supplierFilterMehod(val) {
			this.getSupplierList(val)
		},
		supplierVisibleChange(val) {
			if (val && !this.detailData.supplierId) {
				this.getSupplierList()
			}
		},
		getSupplierList(val = '') {
			this.$store.dispatch('dict/querySupplierList', { category: 'serviceCode', value: 'truck', queryString: val }).then(data => {
				this.supplierList = data.list.map(item => {
					return Object.assign(item, {
						label: item.name,
						value: item.supplierId ? Number(item.supplierId) : ''
					})
				})
			})
		},
		// 选择车队下拉，自动填充车队联系人，联系电话
		handleSelectSupplierName(val) {
			if (val) {
				let label = this.supplierList.filter(o => o.value === val)[0].label
				this.detailData.supplierName = label
				supplierInfo({ supplierId: val }).then(res => {
					let { contact } = res.data
					Object.assign(this.detailData, {
						supplierContact: contact && contact.length ? contact[0].name || contact[0].ename : '',
						supplierContactPhone: contact && contact.length ? contact[0].mobileNo : ''
					})
					this.restaurants = this.loadAll(contact)
				})
			} else {
				Object.assign(this.detailData, {
					supplierId: '',
					supplierName: '',
					supplierContact: '',
					supplierContactPhone: ''
				})
			}
		},
		querySearchContact(queryString, cb) {
			let restaurants = this.restaurants
			let results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
			cb(results)
		},
		handleSelectContact(item) {
			if (item.value) {
				for (let i = 0; i < this.contactInfo.length; i++) {
					if (item.value === this.contactInfo[i].value) {
						Object.assign(this.detailData, {
							supplierContactPhone: this.contactInfo[i].mobileNo
						})
						return
					}
				}
			}
		},
		createFilter(queryString) {
			return restaurant => {
				return restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
			}
		},
		loadAll(data) {
			let arr = []
			for (let i = 0; i < data.length; i++) {
				let obj = {}
				obj.value = data[i].name || data[i].ename
				obj.mobileNo = data[i].mobileNo
				arr.push(obj)
			}
			this.contactInfo = arr
			return arr
		},
		handleCancel() {
			this.$emit('cancel')
		},
		// 箱子校验
		validate(values) {
			console.log(values)
			if (values.length) {
				if (values.some(item => !item.loadContact)) {
					this.$message({ type: 'error', message: '请填写正确的装货人' })
					return false
				}
				if (values.some(item => !item.loadContactPhone)) {
					this.$message({ type: 'error', message: '请填写正确的装货人联系方式' })
					return false
				}
				if (values.some(item => !item.unloadContact)) {
					this.$message({ type: 'error', message: '请填写正确的卸货人' })
					return false
				}
				if (values.some(item => !item.unloadContactPhone)) {
					this.$message({ type: 'error', message: '请选择正确的卸货人联系方式' })
					return false
				}
			}
			return true
		},
		handleSave() {
			this.$refs.ltlSave.validate(valid => {
				if (valid) {
					// if (!this.tableData.length) {
					//   return this.$message({
					//     type: 'warning',
					//     message: '请填写配载信息',
					//     duration: 1000,
					//     onClose: () => {}
					//   })
					// }
					let data = { ...this.detailData }
					data.loadInfoList = this.tableData
					if (!this.validate(this.tableData)) return
					this.$emit('save', data)
				} else {
					console.log('error submit!!')
					return false
				}
			})
		},
		handleViewFile(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.signFileNo, fileName: row.signFileName })
		}
	}
}
</script>
<style lang="scss">
// @import '../../../../../less/index.scss';
.ltlDelivery-container {
	.row-tit {
		padding: 0 !important;
		&.isFixed {
			position: fixed;
			background-color: #fff;
			z-index: 999;
			padding: 5px 20px !important;
			height: 30px !important;
			line-height: 20px !important;
			box-shadow: 4px 0px 10px 0px #e9e9e9;
			top: 24px;
			// top: 64px;
			right: 0;
			margin-top: 0;
			.tit {
				line-height: 20px;
			}
		}
	}
	.form-body {
		.el-form-item {
			margin-bottom: 4px;
		}
		.el-form-item__label {
			padding-right: 4px;
		}
		.el-form-item__content {
			margin-right: 10px;
		}
	}
}
</style>
