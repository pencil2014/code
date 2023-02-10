<template>
	<div id="podWarehouseInplan">
		<div class="row-tit" id="saveBar">
			<span class="tit ft12 bold">计划出仓信息</span>
			<div class="row-tit-operate">
				<el-button type="default" size="mini" style="margin-left: 10px" @click="callBack({ type: 'cancel' })">取消</el-button>
				<ButtonTip btnType="primary" :btnDisabled="(isBd && !isImportJoint) || isDisabledEdit" btnText="保存" :tipContent="isDocTip || isJointTip || isFinishTip || statusTip" class="operateBtn-tip ml10" @click="callBack({ type: 'save' })">
				</ButtonTip>
				<!-- <el-button type="primary" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'save' })" :disabled="(isBd && !isImportJoint) || isDisabledEdit">保存</el-button> -->
			</div>
		</div>
		<div class="row-tit isFixed" :style="styleObject" id="fixedSaveBar" v-if="saveBarFixed">
			<span class="tit ft12 bold">计划出仓信息</span>
			<div class="row-tit-operate">
				<el-button type="default" size="mini" style="margin-left: 10px" @click="callBack({ type: 'cancel' })">取消</el-button>
				<ButtonTip btnType="primary" :btnDisabled="(isBd && !isImportJoint) || isDisabledEdit" btnText="保存" :tipContent="isDocTip || isJointTip || isFinishTip || statusTip" class="operateBtn-tip ml10" @click="callBack({ type: 'save' })">
				</ButtonTip>
				<!-- <el-button type="primary" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'save' })" :disabled="(isBd && !isImportJoint) || isDisabledEdit">保存</el-button> -->
			</div>
		</div>
		<div class="row-body">
			<el-form ref="form" :rules="rules" :model="formData" class="form-body" label-width="90px">
				<el-row>
					<el-col :span="6">
						<el-form-item label="出仓计划编号" prop="outPlanNo" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.outPlanNo" disabled clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="预计出仓时间" prop="outPlanTime" :show-message="false">
							<elDatePickerLimit size="mini" v-model="formData.outPlanTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
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
							<el-input size="mini" placeholder="" v-model="formData.whSupplierName" disabled></el-input>
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
						<el-form-item label="客户姓名" prop="custContact">
							<el-input size="mini" placeholder="请输入" v-model="formData.custContact" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="客户联系电话" prop="custContactPhone">
							<el-input size="mini" placeholder="请输入" v-model="formData.custContactPhone" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item v-if="$route.query.isPendding != 'pendding'" label="海外代理" prop="overseaAgentSupplierId">
							<el-select v-model="formData.overseaAgentSupplierId" size="mini" clearable placeholder="请选择" style="width: 100%" remote filterable :remote-method="supplierFilterMehod" @change="handleSelectSupplierName">
								<el-option v-for="(item, index) in supplierList" :key="index" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item v-if="$route.query.isPendding != 'pendding'" label="海外分公司" prop="overseasCompanyCode">
							<el-select clearable="" v-model="formData.overseasCompanyCode" size="mini" placeholder="请选择" style="width: 100%" @change="val => changeOverseasCompany(val)">
								<el-option v-for="(item, index) in abroadCompanyList" :label="item.overseasCompanyName" :value="item.overseasCompanyCode" :key="index"> </el-option>
							</el-select>
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
						<ButtonTip btnType="primary" :btnDisabled="(isBd && !isImportJoint) || isDisabledEdit" btnText="添加出仓货物" :tipContent="isDocTip || isJointTip || isFinishTip || statusTip" class="operateBtn-tip ml10" @click="handleAddCargo">
						</ButtonTip>
						<!-- <el-button size="mini" type="primary" @click="handleAddCargo" :disabled="(isBd && !isImportJoint) || isDisabledEdit">添加出仓货物</el-button> -->
					</div>
				</div>
				<div class="table-com-layout">
					<el-table ref="outPlanBox" fit highlight-current-row style="width: 100%" class="outPlanBoxTable" :data="tableData" show-summary :summary-method="getSummaries">
						<el-table-column prop="inBatchNo" label="进仓编号" align="center"></el-table-column>
						<el-table-column prop="boxNo" label="货物箱号" align="center"></el-table-column>
						<el-table-column prop="cname" label="品名" align="center"></el-table-column>
						<el-table-column prop="mark" label="唛头" align="center"></el-table-column>
						<el-table-column prop="lastQuantity" label="剩余库存件数" align="center" width="100"></el-table-column>
						<el-table-column prop="quantity" label="预计出仓件数" align="center" width="120">
							<template slot-scope="scope">
								<el-input size="mini" placeholder="请输入件数" v-model.number="scope.row.quantity" clearable @blur="validateNum('quantity', scope.row)"></el-input>
							</template>
						</el-table-column>
						<el-table-column prop="lastWeight" label="剩余库存毛重(KGS)" align="center" width="150"></el-table-column>
						<el-table-column prop="weight" label="预计出仓毛重(KGS)" align="center" width="150">
							<template slot-scope="scope">
								<el-input size="mini" placeholder="请输入毛重" v-model="scope.row.weight" clearable @blur="validateVolumeWeight('weight', scope.row)"></el-input>
							</template>
						</el-table-column>
						<el-table-column prop="lastVolume" label="剩余库存体积" align="center" width="100"></el-table-column>
						<el-table-column prop="volume" label="预计出仓体积(CBM)" align="center" width="150">
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
									<ButtonTip
										btnType="text"
										:btnDisabled="(isBd && !isImportJoint) || isDisabledEdit"
										btnText="删除"
										:tipContent="isDocTip || isJointTip || isFinishTip || statusTip"
										class="operateBtn-tip ml10"
										btnClassName="red"
										@click="handleDelete(scope.row, scope.$index)"
									>
									</ButtonTip>
									<!-- <el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="(isBd && !isImportJoint) || isDisabledEdit">删除</el-button> -->
								</div>
							</template>
						</el-table-column>
					</el-table>
				</div>
			</el-form>
		</div>
		<div v-if="popCargoShow">
			<PopCargo @close="popCargoClose" :bindCargoList="tableData" :param="formData" />
		</div>
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import { quantityMixin } from '@/views/order/order/mixins/quantityMixin'
import { copyArry, getDictMap } from '@/utils/tools'
import { warehouseList } from '@/api/order/warehouse'
import PopCargo from '../../components/popCargo'
import { overSeaMixin } from '@/views/order/order/mixins/overSeaMixin'

export default {
	mixins: [quantityMixin, overSeaMixin],
	data() {
		return {
			oQuery: this.$route.query,
			formData: JSON.parse(JSON.stringify(this.detailData)),
			rules: {
				whId: [{ required: true, message: '', trigger: 'change' }],
				outPlanNo: [{ required: true, message: '出仓计划编号不能为空', trigger: 'blur' }],
				outPlanTime: [{ required: true, message: '预计出仓时间不能为空', trigger: 'change' }],
				// whId: [{ required: true, message: '出仓仓库不能为空', trigger: 'change'}],
				custid: [{ required: true, message: '客户名称不能为空', trigger: 'change' }]
			},
			whOptions: [],
			custOptions: [],
			tableData: [],
			popCargoShow: false // 添加货品弹窗
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
		},
		isDocTip: {
			type: String,
			default: ''
		},
		isJointTip: {
			type: String,
			default: ''
		},
		isFinishTip: {
			type: String,
			default: ''
		},
		statusTip: {
			type: String,
			default: ''
		}
	},
	created() {},
	watch: {
		detailData: {
			handler(newValue) {
				console.log(newValue)
				// this.formData = {...newValue}
				this.formData = JSON.parse(JSON.stringify(newValue))
				this.whOptions = [{ label: newValue.whName, value: newValue.whId }]
				this.custOptions = [{ label: newValue.custName, value: newValue.custid }]
				// this.tableData = this.formData.cargoInfoList
				this.tableData = JSON.parse(JSON.stringify(this.formData.cargoInfoList))
			},
			deep: true,
			immediate: true
		}
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			userEditRoles: state => state.order.orderList.userEditRoles,
			serviceInfoList: state => state.order.serviceInfoList,
			orderInfoDataObj: state => state.order.orderInfoDataObj,
			specialEditRoles: state => state.order.orderList.specialEditRoles,
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
		isOpWh() {
			return (this.specialEditRoles.includes('op_wh') || this.specialEditRoles.includes('op_customs')) && this.isImport
		},
		isImport() {
			return ['ship_import_fcl', 'ship_import_lcl', 'ship_oversea_wh','ship_customs','ship_export_customs','ship_import_customs'].includes(this.orderInfoDataObj.businessType)
		},
		isEpricing() {
			return this.userEditRoles.includes('epricing')
		},
		isEcs() {
			return this.userEditRoles.includes('ecs')
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || (!this.isDoc && !this.isEpricing && !this.isEcs && !this.isOpWh) || this.isJoint
		},
		// 20220509特殊处理为进口协同单的服务项权限都放开
		isImportJoint() {
			return ['ship_import_fcl', 'ship_import_lcl', 'ship_oversea_wh'].includes(this.orderInfoDataObj.businessType) && ['jointList', 'whJointList'].includes(this.$route.query.source)
		},
		isJoint() {
			let serviceInfo = this.serviceInfoList.find(item => item.serviceCode === 'pod_warehouse')
			let isJoint = serviceInfo ? serviceInfo.isJoint : ''
			return isJoint === 'y' && !this.$route.query.jointNo ? true : false
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
		PopCargo
	},
	methods: {
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
			let quantityValid = values.some(item => !numberReg.test(item.quantity))
			let weightValid = values.some(item => !reg.test(item.weight))
			let volumeValid = values.some(item => !reg.test(item.volume))
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
		// 详情取消保存回调
		callBack(data) {
			if (data.type == 'save') {
				this.$refs.form.validate(valid => {
					if (valid) {
						let data = { ...this.formData }
						data.cargoInfoList = this.tableData
						if (!this.validate(this.tableData)) return
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
		// 选择货品
		handleAddCargo() {
			this.popCargoShow = true
		},
		// 货品关闭回调
		popCargoClose(action, values) {
			console.log(action, values)
			this.popCargoShow = false
			values = values || []
			if (action === 'Confirm') {
				if (!values.length) return
				values = values.map(item => {
					return Object.assign(item, {
						inBatchNo: item.batchNo,
						quantity: item.lastQuantity,
						weight: item.lastWeight,
						volume: item.lastVolume
					})
				})
				let itemIds = []
				this.tableData.map(item => {
					itemIds.push(item.inItemId)
				})
				// 过滤掉table已有的货品，只取新增的货品并默认显示添加箱号、件毛体包装等
				let addCargoData = values.filter(item => !itemIds.includes(item.inItemId))
				this.tableData = this.tableData.concat(addCargoData)
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

<style lang="scss">
#podWarehouseInplan {
	// border-top: 12px solid #f5f7f9;
	// .el-row {
	//   padding: 10px 0 0 0;
	// }
	.el-collapse-item__content {
		padding-top: 10px;
		font-size: 12px;
	}
	.el-form-item {
		margin-bottom: 4px;
	}
	.el-form-item__label {
		padding-right: 4px;
	}
	.el-form-item__content {
		margin-right: 10px;
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
			// top: 64px;
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
