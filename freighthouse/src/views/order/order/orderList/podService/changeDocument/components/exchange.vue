<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="exchangeForm" :model="createdItem" label-position="right" label-width="100px" class="exchange-form">
			<el-form-item :label="exchangeData.isShipImport ? '代理' : '海外代理'" prop="overseasAgentId">
				<el-select v-model="createdItem.overseasAgentId" remote size="mini" clearable placeholder="请选择" style="width: 100%" filterable @visible-change="supplierVisibleChange" :filter-method="supplierFilterMehod" @change="handleSelectSupplierName">
					<el-option v-for="(item, index) in supplierList" :key="index" :label="item.label" :value="item.value"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item v-if="!exchangeData.isShipImport" label="海外分公司" prop="overseasCompanyCode">
				<el-select v-model="createdItem.overseasCompanyCode" size="mini" clearable placeholder="请选择" style="width: 100%" @change="val => changeOverseasCompany(val)">
					<el-option v-for="(item, index) in abroadCompanyList" :label="item.companyName" :value="item.companyCode" :key="index"> </el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="换单完成时间" required :show-message="false" prop="exchangeCompleteTime">
				<elDatePickerLimit noCanFuture type="datetime" v-model="createdItem.exchangeCompleteTime" value-format="yyyy-MM-dd hh:mm:ss" clearable placeholder="选择时间" size="mini" style="width: 100%"> </elDatePickerLimit>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { abroadCompanyList } from '@/api/order/list'
import { arrayHasDuplicateValue, unique } from '@/utils/index'
import { blExchangeUpdateStatus } from '@/api/order/podService/blExchange'

const defaultCreate = {
	overseasAgentId: '',
	overseasAgentName: '',
	overseasCompanyCode: '',
	overseasCompanyName: '',
	exchangeCompleteTime: ''
}

export default {
	data() {
		return {
			overseasAgentList: [],
			abroadCompanyList: [],
			supplierList: [],
			dialogConfig: {
				title: '修改换单状态',
				show: true,
				size: 'medium',
				width: '560px'
			},

			createdItem: Object.assign({}, defaultCreate),
			rules: {
				exchangeCompleteTime: [{ required: true, message: '请选择换单完成时间', trigger: 'change' }]
			}
		}
	},
	props: {
		exchangeData: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},
	created() {
		this.getAbroadCompanyList()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo,
			custid: state => state.order.custid
		})
	},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
		handleSelectSupplierName(val) {
			let item = this.supplierList.find(item => item.value == val)
			this.createdItem.overseasAgentName = item ? item.label : ''
		},
		supplierFilterMehod(val) {
			console.log('🚀 ~ val', val)
			if (this.createdItem.overseasAgentName && !val) {
				val = this.createdItem.overseasAgentName
			}
			this.getSupplierList(val)
		},
		supplierVisibleChange(val) {
			// if (val) {
			// 	this.getSupplierList()
			// }
		},
		getSupplierList(val = '') {
			this.$store
				.dispatch('dict/querySeviceOverseaList', {
					category: 'category',
					value: 'overseas_agent',
					queryString: val
				})
				.then(data => {
					this.supplierList = data.list
					this.supplierList.forEach(item => {
						Object.assign(item, {
							label: item.name,
							value: item.supplierId
						})
					})
				})
		},
		getAbroadCompanyList() {
			// 海外分公司
			abroadCompanyList({ isAbroad: 'yes' }).then(res => {
				if (res.data) {
					this.abroadCompanyList = res.data
				}
			})
		},
		// 选择海外分公司
		changeOverseasCompany(val) {
			let item = this.abroadCompanyList.find(item => item.companyCode == val)
			this.createdItem.overseasCompanyName = item ? item.companyName : ''
		},

		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.exchangeForm.validate(valid => {
					if (valid) {
						blExchangeUpdateStatus({
							...this.exchangeData,
							...this.createdItem
						}).then(response => {
							this.$message({
								type: 'success',
								message: '修改换单状态成功',
								duration: 1000,
								onClose: () => {
									this.$emit('close', 'Confirm')
								}
							})
						})
					}
				})
			} else {
				this.$emit('close', 'Cancel')
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.exchange-form {
	/deep/ .el-form-item {
		margin-bottom: 4px;
		.el-form-item__label,
		.el-form-item__content {
			line-height: 20px;
		}
	}
}
</style>
