<template>
	<div id="podWarehouseInplan">
		<div class="row-tit" id="saveBar">
			<span class="tit ft12 bold">实际进仓信息</span>
			<div class="row-tit-operate">
				<el-button type="default" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'cancel' })">取消</el-button>
				<el-button type="primary" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'save' })" :disabled="isBd || isDisabledEdit">保存</el-button>
			</div>
		</div>
		<div class="row-tit isFixed" :style="styleObject" id="fixedSaveBar" v-if="saveBarFixed">
			<span class="tit ft12 bold">实际进仓信息</span>
			<div class="row-tit-operate">
				<el-button type="default" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'cancel' })">取消</el-button>
				<el-button type="primary" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'save' })" :disabled="isBd || isDisabledEdit">保存</el-button>
			</div>
		</div>
		<div class="row-body">
			<el-form ref="form" :rules="rules" :model="formData" class="form-body" label-width="90px">
				<el-row>
					<el-col :span="6">
						<el-form-item label="计划进仓编号" prop="planNo" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.planNo" disabled clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="进仓实际编号" prop="batchNo" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.batchNo" disabled clearable></el-input>
						</el-form-item>
					</el-col>

					<el-col :span="6">
						<el-form-item label="实际进仓时间" prop="realEnterTime" :show-message="false">
							<elDatePickerLimit noCanFuture size="mini" v-model="formData.realEnterTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="仓位编码" prop="positionNo">
							<el-input size="mini" placeholder="请输入" v-model="formData.positionNo" clearable></el-input>
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
						<el-form-item label="海外代理" prop="overseaAgentSupplierId">
							<el-select v-model="formData.overseaAgentSupplierId" size="mini" clearable placeholder="请选择" style="width: 100%" remote filterable :remote-method="supplierFilterMehod" @change="handleSelectSupplierName">
								<el-option v-for="(item, index) in supplierList" :key="index" :label="item.label" :value="item.value"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="海外分公司" prop="overseasCompanyCode">
							<el-select clearable="" v-model="formData.overseasCompanyCode" size="mini" placeholder="请选择" style="width: 100%" @change="val => changeOverseasCompany(val)">
								<el-option v-for="(item, index) in abroadCompanyList" :label="item.overseasCompanyName" :value="item.overseasCompanyCode" :key="index"> </el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="实际进仓要求" prop="remark">
							<el-input size="mini" placeholder="请输入" v-model="formData.remark" clearable maxlength="512" show-word-limit></el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<div class="row-tit h32">
					<div class="ft14 tit"></div>
					<div class="row-tit-operate">
						<el-button size="mini" type="primary" @click="handleAddCargo" :disabled="formData.isCargoEdit === 'y' || isDisabledEdit">添加进仓货品</el-button>
					</div>
				</div>
				<div class="table-com-layout">
					<el-table ref="inPlanBox" fit highlight-current-row stripe style="width: 100%" class="inPlanBoxTable" :data="tableData">
						<el-table-column prop="cname" label="品名" align="center">
							<template slot-scope="scope">
								<span v-if="scope.row.type === 'summary'">{{ scope.row.cname }}</span>
								<el-input v-else size="mini" placeholder="点击添加品名" v-model="scope.row.cname" :disabled="!!scope.row.cargoId" clearable @focus="cnameClick(scope.row, scope.$index)"></el-input>
							</template>
						</el-table-column>
						<el-table-column prop="mark" label="唛头" align="center">
							<template slot-scope="scope">
								<span v-if="scope.row.type === 'summary'">{{ scope.row.mark }}</span>
								<el-input v-else size="mini" placeholder="请输入唛头" v-model="scope.row.mark" clearable disabled></el-input>
							</template>
						</el-table-column>
						<el-table-column prop="quantity" label="实际进仓件数" align="center">
							<template slot-scope="scope">
								<span v-if="scope.row.type === 'summary'">{{ scope.row.quantity }}</span>
								<el-input v-else size="mini" placeholder="请输入件数" v-model.number="scope.row.quantity" :disabled="formData.isCargoEdit === 'y' || isDisabledEdit" clearable @blur="validateQuantity('quantity', scope.row)"></el-input>
							</template>
						</el-table-column>
						<el-table-column prop="weight" label="实际进仓毛重(KGS)" align="center" width="140">
							<template slot-scope="scope">
								<span v-if="scope.row.type === 'summary'">{{ scope.row.weight }}</span>
								<el-input v-else size="mini" placeholder="请输入毛重" v-model="scope.row.weight" :disabled="formData.isCargoEdit === 'y' || isDisabledEdit" clearable @blur="validateVolumeWeight('weight', scope.row)"></el-input>
							</template>
						</el-table-column>
						<el-table-column prop="volume" label="实际进仓体积(CBM)" align="center" width="140">
							<template slot-scope="scope">
								<span v-if="scope.row.type === 'summary'">{{ scope.row.volume }}</span>
								<el-input v-else size="mini" placeholder="请输入体积" v-model="scope.row.volume" :disabled="formData.isCargoEdit === 'y' || isDisabledEdit" clearable @blur="validateVolumeWeight('volume', scope.row)"></el-input>
							</template>
						</el-table-column>
						<el-table-column prop="packageType" label="实际进仓包装" align="center">
							<template slot-scope="scope">
								<span v-if="scope.row.type === 'summary'">{{ scope.row.packageType }}</span>
								<el-select v-else size="mini" v-model="scope.row.packageType" placeholder="请选择包装" :disabled="formData.isCargoEdit === 'y' || isDisabledEdit" clearable filterable>
									<el-option v-for="(item, index) in dictMap.packageType" :key="index" :label="item.label" :value="item.value"></el-option>
								</el-select>
							</template>
						</el-table-column>
						<el-table-column label="操作" width="150" align="center" fixed="right">
							<template slot-scope="scope">
								<span v-if="scope.row.type === 'summary'"></span>
								<div class="operate-group" v-else>
									<!-- <el-button @click="handleAddCargo(scope.row, item)" type="text" size="mini" :disabled="formData.isCargoEdit === 'y'" v-if="!scope.$index">添加货物箱号</el-button> -->
									<el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="formData.isCargoEdit === 'y' || isDisabledEdit">删除</el-button>
								</div>
							</template>
						</el-table-column>
					</el-table>
				</div>
			</el-form>
		</div>
		<div v-if="showCnameDialog">
			<Cname :clickType="'planIn'" @close="closeCnameDialog" @handleConfirm="handleConfirm"></Cname>
		</div>
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import { quantityMixin } from '@/views/order/order/mixins/quantityMixin'
import { copyArry, getDictMap, accAdd } from '@/utils/tools'
import { warehouseList } from '@/api/order/warehouse'
import Cname from '../../components/cname'
import { overSeaMixin } from '@/views/order/order/mixins/overSeaMixin'

export default {
	mixins: [quantityMixin, overSeaMixin],
	data() {
		return {
			oQuery: this.$route.query,
			formData: JSON.parse(JSON.stringify(this.detailData)),
			rules: {
				planNo: [{ required: true, message: '进仓计划编号不能为空', trigger: 'blur' }],
				batchNo: [{ required: true, message: '进仓编码不能为空', trigger: 'blur' }],
				realEnterTime: [{ required: true, message: '实际进仓时间不能为空', trigger: 'blur' }],
				// positionNo: [{ required: true, message: '仓位编码不能为空', trigger: 'blur' }],
				// whId: [{ required: true, message: '仓库名称不能为空', trigger: 'change' }],
				custid: [{ required: true, message: '客户名称不能为空', trigger: 'change' }]
			},
			whOptions: [],
			custOptions: [],
			tableData: [],
			showCnameDialog: false,
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
				// this.formData = { ...newValue }
				this.formData = JSON.parse(JSON.stringify(newValue))
				this.whOptions = [{ label: newValue.whName, value: newValue.whId }]
				this.custOptions = [{ label: newValue.custName, value: newValue.custid }]
				// this.tableData = newValue.cargoInfoList
				this.tableData = JSON.parse(JSON.stringify(this.formData.cargoInfoList))
			},
			deep: true,
			immediate: true
		}
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.railway.ordDetRole,
			orderInfoDataObj: state => state.railway.orderInfoDataObj
		}),
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isBkg() {
			return this.ordDetRole === 'bkg'
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
			let isBd = !this.isBkg && !this.isEpricing && !this.isEcs
			return isBd
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
		Cname
	},
	methods: {
		// 添加货物箱号
		handleAddCargo() {
			let tempRowVal = { cname: '', mark: '', quantity: '', weight: '', volume: '' }
			this.tableData.push(tempRowVal)
		},
		// 删除货物箱
		handleDelete(row, cargoIndex) {
			this.tableData = this.tableData.filter((item, index) => index !== cargoIndex)
			console.log('this.tableDat', this.tableData)
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		// 点击品名
		cnameClick(row, cargoIndex) {
			this.cargoIndex = cargoIndex
			this.showCnameDialog = true
		},
		closeCnameDialog() {
			this.showCnameDialog = false
		},
		handleConfirm(data) {
			console.log(data, this.cargoIndex)
			this.tableData[this.cargoIndex].cargoId = data.cargoId
			this.tableData[this.cargoIndex].cname = data.cname
			this.tableData[this.cargoIndex].mark = data.mark
		},
		// 箱子校验
		validate(values) {
			if (!values.length) {
				this.$message({ type: 'error', message: '请添加进仓货品' })
				return false
			}
			// if (values.some(item => !item.quantity)) {
			//   this.$message({type: 'error', message: '请填写正确的货品件数'})
			//   return false
			// }
			// if (values.some(item => !item.weight)) {
			//   this.$message({type: 'error', message: '请填写正确的货品毛重'})
			//   return false
			// }
			// if (values.some(item => !item.volume)) {
			//   this.$message({type: 'error', message: '请填写正确的货品体积'})
			//   return false
			// }
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
						if (this.formData.isCargoEdit === 'y') return this.$emit('handleConfirm', data)
						this.$confirm('货物信息是否确认，保存后不可进行编辑?', '警告', {
							confirmButtonText: '确定',
							cancelButtonText: '取消',
							type: 'warning'
						})
							.then(() => {
								this.$emit('handleConfirm', data)
							})
							.catch(err => {})
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

<style lang="scss" scoped>
#podWarehouseInplan {
	// border-top: 12px solid #f5f7f9;
	// .el-row {
	//   padding: 10px 0 0 0;
	// }
	.row-body {
		margin-top: 8px;
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
		.el-date-editor .el-input__prefix{
			left: 0;
		}
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
