<template>
	<div>
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<el-form id="podAddWarehouseOut" ref="form" :rules="rules" :model="formData" label-width="90px">
				<el-row>
					<el-col :span="6">
						<el-form-item label="出仓计划编号" prop="outPlanNo" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.outPlanNo" disabled clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="出仓仓库" prop="whId" :show-message="false">
							<el-select v-model="formData.whId" size="mini" clearable :filterable="true" @visible-change="whVisibleChange" remote :remote-method="whFilterMehod" placeholder="请选择" @change="handleSelectWhid" style="width: 100%">
								<el-option :disabled="item.disabled" v-for="(item, index) in whOptions" :label="item.label" :value="item.value" :key="index"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="供应商" prop="whSupplierName" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.whSupplierName" disabled></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="预计出仓时间" prop="outPlanTime" :show-message="false">
							<elDatePickerLimit size="mini" v-model="formData.outPlanTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="客户名称" prop="custid" :show-message="false">
							<el-select v-model="formData.custid" size="mini" clearable disabled :filterable="true" @visible-change="custVisibleChange" :filter-method="custFilterMehod" placeholder="请选择" @change="handleSelectCust" style="width: 100%">
								<el-option v-for="(item, index) in custOptions" :label="item.label" :value="item.value" :key="index"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="客户联系人姓名" prop="custContact">
							<el-input size="mini" placeholder="请输入" v-model="formData.custContact" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="客户联系电话" prop="custContactPhone">
							<el-input size="mini" placeholder="请输入" v-model="formData.custContactPhone" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="出仓要求" prop="remark">
							<el-input size="mini" placeholder="请输入" v-model="formData.remark" clearable maxlength="512" show-word-limit></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<div class="row-tit h32">
					<div class="ft14 tit"></div>
					<div class="row-tit-operate">
						<el-button size="mini" type="primary" @click="handleAddBox" :disabled="isBd && !isImportJoint">添加出仓货物</el-button>
					</div>
				</div>
				<div class="table-com-layout">
					<el-table ref="outPlanBox" fit highlight-current-row stripe style="width: 100%" class="outPlanBoxTable" :data="tableData" show-summary :summary-method="getSummaries">
						<el-table-column prop="batchNo" label="进仓编号" align="center" width="140"></el-table-column>
						<!-- <el-table-column prop="boxNo" label="货物箱号" align="center"></el-table-column> -->
						<el-table-column prop="cname" label="品名" align="center"></el-table-column>
						<el-table-column prop="mark" label="唛头" align="center"></el-table-column>
						<el-table-column prop="lastQuantity" label="剩余库存件数" align="center" width="100"></el-table-column>
						<el-table-column prop="quantity" label="预计出仓件数" align="center" width="100">
							<template slot-scope="scope">
								<el-input size="mini" placeholder="请输入件数" v-model.number="scope.row.quantity" clearable @blur="validateNum('quantity', scope.row)"></el-input>
							</template>
						</el-table-column>
						<el-table-column prop="lastWeight" label="剩余库存毛重(KGS)" align="center" width="130">
							<template slot-scope="scope">
								<el-input disabled size="mini" placeholder="请输入毛重" v-model="scope.row.lastWeight" clearable @blur="validateVolumeWeight('lastWeight', scope.row)"></el-input>
							</template>
						</el-table-column>
						<el-table-column prop="weight" label="预计出仓毛重(KGS)" align="center" width="130">
							<template slot-scope="scope">
								<el-input size="mini" placeholder="请输入毛重" v-model="scope.row.weight" clearable @blur="validateVolumeWeight('weight', scope.row)"></el-input>
							</template>
						</el-table-column>
						<el-table-column prop="lastVolume" label="剩余库存体积" align="center" width="100"></el-table-column>
						<el-table-column prop="volume" label="预计出仓体积(CBM)" align="center" width="130">
							<template slot-scope="scope">
								<el-input size="mini" placeholder="请输入体积" v-model="scope.row.volume" clearable @blur="validateVolumeWeight('volume', scope.row)"></el-input>
							</template>
						</el-table-column>
						<el-table-column prop="packageType" label="预计出仓包装" align="center" width="120">
							<template slot-scope="scope">
								<el-select size="mini" v-model="scope.row.packageType" placeholder="请选择包装" clearable filterable>
									<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
								</el-select>
							</template>
						</el-table-column>
						<el-table-column label="操作" width="150" align="center" fixed="right">
							<template slot-scope="scope">
								<div class="operate-group">
									<el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd && !isImportJoint">删除</el-button>
								</div>
							</template>
						</el-table-column>
					</el-table>
				</div>
			</el-form>
		</BaseDialog>
		<div v-if="popCargoShow">
			<PopCargo @close="popCargoClose" :bindCargoList="tableData" :param="formData" />
		</div>
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import { quantityMixin } from '@/views/order/order/mixins/quantityMixin'
import { copyArry } from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'
import PopCargo from '../../components/popCargo'
import Cname from '../../components/cname'
import { warehouseList } from '@/api/order/warehouse'
import { outplanReqno } from '@/api/order/podService/warehouse'

export default {
	mixins: [quantityMixin],
	data() {
		return {
			dialogConfig: {
				title: '出仓计划信息',
				show: true,
				size: 'medium',
				width: '80%'
			},
			formData: {
				outPlanNo: this.detailData.outPlanNo || '',
				outPlanTime: '',
				whId: this.detailData.whId || '',
				whName: this.detailData.whName || '',
				custid: this.detailData.custid || '',
				custName: this.detailData.custName || '',
				custContact: this.detailData.custContact || '',
				custContactPhone: this.detailData.custContactPhone || '',
				orderNo: this.detailData.orderNo || '',
				remark: '',
				cargoInfoList: this.detailData.cargoInfoList || [],
				overseaAgentSupplierId: this.detailData.overseaAgentSupplierId || '',
				overseaAgentSupplierName: this.detailData.overseaAgentSupplierName || '',
				overseasCompanyCode: this.detailData.overseasCompanyCode || '',
				overseasCompanyName: this.detailData.overseasCompanyName || '',
				whSupplierName: this.detailData.whSupplierName || ''
			},
			whOptions: [{ label: this.detailData.whName, value: this.detailData.whId }],
			custOptions: [{ label: this.detailData.custName, value: this.detailData.custid }],
			rules: {
				whId: [{ required: true, message: '', trigger: 'change' }],
				outPlanNo: [{ required: true, message: '出仓计划编号不能为空', trigger: 'blur' }],
				outPlanTime: [{ required: true, message: '预计出仓时间不能为空', trigger: 'change' }],
				custid: [{ required: true, message: '客户名称不能为空', trigger: 'change' }]
			},
			tableData: [],
			countData: [],
			popCargoShow: false // 添加货品弹窗
		}
	},
	props: {
		detailData: {
			type: Object,
			default() {
				{
				}
			}
		}
	},
	watch: {
		// tableData: {
		//   handler(newValue) {
		//     console.log(newValue);
		//     newValue.map((item, index) => {
		//       item.map(ele => {
		//         let quantity = 0,
		//         weight = 0,
		//         volume = 0
		//         if (ele.type === 'summary') {
		//           let filterData = newValue[index -1]
		//           console.log(filterData);
		//           filterData.map(o => {
		//             quantity += Number(o.quantity)
		//             weight += Number(o.weight)
		//             volume += Number(o.volume)
		//           })
		//           ele.quantity = quantity
		//           ele.weight = weight
		//           ele.volume = volume
		//         }
		//       })
		//     })
		//   },
		//   deep: true
		// }
	},
	created() {
		this.init()
		this.createSerialNo()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			orderInfoDataObj: state => state.order.orderInfoDataObj
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
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
		// 20220509特殊处理为进口协同单的服务项权限都放开
		isImportJoint() {
			return ['ship_import_fcl', 'ship_import_lcl', 'ship_oversea_wh'].includes(this.orderInfoDataObj.businessType) && ['jointList', 'whJointList'].includes(this.$route.query.source)
		}
	},
	components: {
		BaseDialog,
		PopCargo,
		Cname
	},
	methods: {
		init() {
			this.tableData = this.formData.cargoInfoList.map(item => {
				delete item.itemId
				return item
			})
		},
		getSummaries(param) {
			const { columns, data } = param
			const sums = []
			columns.forEach((column, index) => {
				if (index === 4) {
					return (sums[index] = '合计')
				}
				const values = data.map(item => Number(item[column.property]))
				if (column.property === 'quantity' || column.property === 'weight' || column.property === 'volume') {
					sums[index] = values.reduce((prev, curr) => {
						const value = Number(curr)
						if (!isNaN(value)) {
							return prev + curr
						} else {
							return prev
						}
					}, 0)
					sums[index]
				}
			})
			return sums
		},
		// 获取出仓计划编号
		createSerialNo() {
			outplanReqno().then(res => {
				this.formData.outPlanNo = res.data.seqNo
			})
		},
		// 选择集装箱
		handleAddBox() {
			this.popCargoShow = true
		},
		// 集装箱关闭回调
		popCargoClose(action, values) {
			console.log(action, values)
			this.popCargoShow = false
			values = values || []
			if (action === 'Confirm') {
				if (!values.length) return
				let itemIds = []
				this.tableData.map(item => {
					itemIds.push(item.inItemId)
				})
				// 过滤掉table已有的货品，只取新增的货品并默认显示添加箱号、件毛体包装等
				let addCargoData = values.filter(item => !itemIds.includes(item.inItemId))
				this.tableData = this.tableData.concat(addCargoData)
			}
		},
		// 删除货物箱
		handleDelete(row, sIndex) {
			this.tableData = this.tableData.filter((item, index) => index !== sIndex)
			console.log(this.tableData)
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		// 箱子校验
		validate(values) {
			let numberReg = /^[0-9]+$/,
				reg = /^\d+(\.\d+)?$/
			let weightValid = values.some(item => !reg.test(item.weight))
			let volumeValid = values.some(item => !reg.test(item.volume))
			let quantityValid = values.some(item => !numberReg.test(item.quantity))
			if (!values.length) {
				this.$message({ type: 'error', message: '请选择货品' })
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
		dialogCallback(action, done) {
			// 保存
			if (action === 'Confirm') {
				this.$refs.form.validate(valid => {
					if (valid) {
						let data = { ...this.formData }
						data.cargoInfoList = this.tableData
						if (!this.validate(this.tableData)) return
						if (!this.detailData.realEnterTime) return this.$message.error('请先填写实际进仓时间!')
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
				pageSize: 200,
				warehouseName: queryString,
				
			}
			warehouseList(data).then(res => {
				let list = res.data.list
				this.whOptions = list
					.filter(item => item.state === 'valid')
					.map(item => {
						return Object.assign(item, {
							value: item.whId,
							label: item.warehouseName,
							supplierName: item.supplierName,
							disabled: item.status == 'no_effect'
						})
					})
			})
		},
		handleSelectWhid(val) {
			if (val) {
				// let label = this.whOptions.filter(o => o.value === val)[0].label
				// this.formData.whName = label
				let wareHouse = this.whOptions.filter(o => o.value === val)[0]
				this.formData.whName = wareHouse.label
				this.formData.whSupplierName = wareHouse.supplierName
			} else {
				this.formData.whName = ''
				this.formData.whSupplierName = ''
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

<style lang="scss" scoped>
#podAddWarehouseOut {
	.el-row {
		// padding: 10px 0 0 0;
	}
	.el-collapse-item__content {
		padding-top: 10px;
		font-size: 12px;
	}
	/deep/ .el-form-item {
		margin-bottom: 4px;
	}
	/deep/ .el-form-item__label {
		line-height: 20px;
		padding-right: 4px;
	}
	/deep/ .el-form-item__content {
		line-height: 20px;
		margin-right: 10px;
	}
	.row-tit {
		padding: 0 0 !important;
	}
	.inPlanBoxTable {
		margin-top: -1px;
	}
	.outPlanBoxTable td {
		border-right: 1px solid #dfe6ec !important;
	}
}
</style>
