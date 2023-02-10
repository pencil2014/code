<template>
	<div>
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<el-form id="podAddWarehouseIn" ref="form" :rules="rules" :model="formData" label-width="90px">
				<el-row>
					<el-col :span="6">
						<el-form-item label="进仓计划编号" prop="planNo" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.planNo" disabled clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="进仓编码" prop="batchNo" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.batchNo" disabled clearable></el-input>
						</el-form-item>
					</el-col>
					<!-- <el-col :span="4">
          <el-form-item label="外部仓库编码" prop="whBatchNo">
            <el-input size="mini" placeholder="请输入" v-model="formData.whBatchNo" clearable></el-input>
          </el-form-item>
        </el-col> -->
					<el-col :span="6">
						<el-form-item label="实际进仓时间" prop="realEnterTime" :show-message="false">
							<elDatePickerLimit noCanFuture size="mini" v-model="formData.realEnterTime" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="仓位编码" prop="positionNo" :show-message="false">
							<el-input size="mini" placeholder="请输入" v-model="formData.positionNo" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="进仓仓库" prop="whId" :show-message="false">
							<el-select v-model="formData.whId" size="mini" clearable :filterable="true" @visible-change="whVisibleChange" :filter-method="whFilterMehod" placeholder="请选择" @change="handleSelectWhid" style="width: 100%">
								<el-option v-for="(item, index) in whOptions" :label="item.label" :value="item.value" :key="index"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="6">
						<el-form-item label="客户名称" prop="custid">
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
					<el-col :span="24">
						<el-form-item label="实际进仓要求" prop="remark">
							<el-input size="mini" placeholder="请输入" v-model="formData.remark" clearable maxlength="512" show-word-limit></el-input>
						</el-form-item>
					</el-col>
					<!-- <el-col v-for="(ele, index) in inputItem" :span="ele.span || 4" :key="index">
          <FormItem :item="ele" :form="formData" />
        </el-col> -->
				</el-row>
				<div class="row-tit h32">
					<div class="ft14 tit"></div>
					<div class="row-tit-operate">
						<el-button size="mini" type="primary" @click="handleAddCargo" :disabled="isBd">添加进仓货品</el-button>
					</div>
				</div>
				<div>
					<el-table ref="inPlanBox" border fit highlight-current-row stripe style="width: 100%" class="inPlanBoxTable" :data="tableData">
						<el-table-column prop="cname" label="品名" align="center">
							<template slot-scope="scope">
								<span v-if="scope.row.type === 'summary'">{{ scope.row.cname }}</span>
								<el-input
									:disabled="disableFunc(scope.row)"
									v-else
									size="mini"
									placeholder="点击添加品名"
									v-model="scope.row.cname"
									clearable
									@focus="cnameClick(scope.row, scope.$index)"
									@blur="val => handleChangeCname(val, scope.row, scope.$index)"
									@change="val => handleChangeCname(val, scope.row, scope.$index)"
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
						<el-table-column prop="weight" label="预计进仓毛重(KGS)" align="center" width="150">
							<template slot-scope="scope">
								<span v-if="scope.row.type === 'summary'">{{ scope.row.weight }}</span>
								<el-input v-else size="mini" placeholder="请输入毛重" v-model="scope.row.weight" clearable @blur="validateVolumeWeight('weight', scope.row)"></el-input>
							</template>
						</el-table-column>
						<el-table-column prop="volume" label="预计进仓体积(CBM)" align="center" width="150">
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
									<!-- <el-button @click="handleAddCargo(scope.row, item)" type="text" size="mini" :disabled="isBd" v-if="!scope.$index">添加货物箱号</el-button> -->
									<el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd">删除</el-button>
								</div>
							</template>
						</el-table-column>
					</el-table>
				</div>
			</el-form>
		</BaseDialog>
		<div v-if="showCnameDialog">
			<Cname :clickType="'planIn'" @close="closeCnameDialog" @handleConfirm="handleConfirm"></Cname>
		</div>
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import { quantityMixin } from '@/views/order/order/mixins/quantityMixin'
import { copyArry, accAdd } from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'
import Cname from '../../components/cname'
import { warehouseList } from '@/api/order/warehouse'
import { inReqno } from '@/api/order/podService/warehouse'

var defaultTableList = {
	cname: '',
	mark: '',
	totalQuantity: '',
	totalWeight: '',
	totalVolume: ''
}
export default {
	mixins: [quantityMixin],
	data() {
		return {
			originTable: this.detailData.cargoInfoList,
			dialogConfig: {
				title: '实际进仓信息',
				show: true,
				size: 'medium',
				width: '80%'
			},
			formData: {
				planNo: this.detailData.planNo || '',
				batchNo: this.detailData.batchNo || '',
				// whBatchNo: this.detailData.whBatchNo || '',
				realEnterTime: this.detailData.realEnterTime || '',
				positionNo: this.detailData.positionNo || '',
				whId: this.detailData.whId || '',
				whName: this.detailData.whName || '',
				custid: this.detailData.custid || '',
				custName: this.detailData.custName || '',
				custContact: this.detailData.custContact || '',
				custContactPhone: this.detailData.custContactPhone || '',
				orderNo: this.detailData.orderNo || '',
				remark: this.detailData.remark,
				cargoInfoList: [...this.detailData.cargoInfoList] || [],
				overseaAgentSupplierId: this.detailData.overseaAgentSupplierId || '',
				overseaAgentSupplierName: this.detailData.overseaAgentSupplierName || '',
				overseasCompanyCode: this.detailData.overseasCompanyCode || '',
				overseasCompanyName: this.detailData.overseasCompanyName || ''
			},
			whOptions: [{ label: this.detailData.whName, value: this.detailData.whId }],
			custOptions: [{ label: this.detailData.custName, value: this.detailData.custid }],
			rules: {
				planNo: [{ required: true, message: '进仓计划编号不能为空', trigger: 'blur' }],
				batchNo: [{ required: true, message: '进仓编码不能为空', trigger: 'blur' }],
				// whBatchNo: [{ required: true, message: '外部仓库编码不能为空', trigger: 'blur' }],
				realEnterTime: [{ required: true, message: '实际进仓时间不能为空', trigger: 'change' }],
				// positionNo: [{ required: true, message: '仓位编码不能为空', trigger: 'blur' }],
				// whId: [{ required: true, message: '仓库名称不能为空', trigger: 'change' }],
				custid: [{ required: true, message: '客户名称不能为空', trigger: 'change' }]
			},
			tableData: [],
			showCnameDialog: false,
			cargoIndex: ''
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
	watch: {},
	created() {
		this.init()
		this.createSerialNo()
		console.log('🚀 ~ this.detailData', this.detailData)
	},

	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.railway.ordDetRole
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
		}
	},
	components: {
		BaseDialog,
		Cname
	},
	methods: {
		disableFunc(row) {
			console.log('row', row.cargoId, this.originTable)
			return this.originTable.some(item => item.cargoId === row.cargoId)
		},
		init() {
			this.tableData = [...this.formData.cargoInfoList]
		},
		// 获取进仓编码
		createSerialNo() {
			inReqno().then(res => {
				// this.formData.batchNo = res.data.seqNo
				Object.assign(this.formData, {
					batchNo: res.data.seqNo
				})
				console.log(this.formData)
			})
		},
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
		handleChangeCname(val, row, cargoIndex) {
			if (!val) {
				this.tableData[this.cargoIndex].cargoId = ''
				this.tableData[this.cargoIndex].cname = ''
				this.tableData[this.cargoIndex].mark = ''
			}
		},
		closeCnameDialog() {
			this.showCnameDialog = false
		},
		handleConfirm(data) {
			this.tableData[this.cargoIndex].cargoId = data.cargoId
			this.tableData[this.cargoIndex].cname = data.cname
			this.tableData[this.cargoIndex].mark = data.mark
		},
		// 箱子校验
		validate(values) {
			let numberReg = /^[0-9]+$/,
				reg = /^\d+(\.\d+)?$/
			let quantityValid = values.some(item => !numberReg.test(item.quantity))
			let weightValid = values.some(item => !reg.test(item.weight))
			let volumeValid = values.some(item => !reg.test(item.volume))

			if (!values.length) {
				this.$message({ type: 'error', message: '请添加进仓货品' })
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
		dialogCallback(action, done) {
			// 保存
			if (action === 'Confirm') {
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
#podAddWarehouseIn {
	.el-row {
		padding: 10px 0 0 0;
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
	}
	.inPlanBoxTable {
		margin-top: -1px;
	}
}
</style>
