<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="createOrderForm" :rules="rules" :model="createdItem" label-position="right" label-width="70px" class="create-order-form">
			<el-form-item label="业务类型" prop="businessType">
				<el-select v-model="createdItem.businessType" size="mini" clearable placeholder="请选择" @change="handleSelectBusinessType" style="width: 100%">
					<el-option v-for="(item, index) in businessTypeOptions" :label="item.label" :value="item.value" :key="index"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="销售" prop="seller">
				<el-select v-model="createdItem.seller" size="mini" clearable filterable placeholder="请选择" @focus="handleClickSeller" @change="handleSelectSeller" @clear="handleClear" style="width: 100%">
					<el-option v-for="item in sellerOptions" :label="item.employeeName" :value="item.employeeId" :key="item.employeeId"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="委托单位" prop="custid">
				<el-select v-model="createdItem.custid" size="mini" remote clearable :filterable="true" @visible-change="custVisibleChange" :remote-method="custFilterMehod" placeholder="请选择" @change="handleSelectCustid" style="width: 100%">
					<el-option v-for="(item, index) in custidOptions" :label="item.label" :value="item.value" :key="index"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="客户委托号" prop="custIntrustNo">
				<el-input size="mini" placeholder="请输入1-128位字符的客户委托号" clearable v-model="createdItem.custIntrustNo"></el-input>
			</el-form-item>
			<!-- <el-form-item label="货物来源" prop="cargoSource">
				<el-select v-model="createdItem.cargoSource" size="mini" clearable placeholder="请选择" @change="handleSelectCargoSource" style="width: 100%">
					<el-option v-for="item in dictMap.cargoSource" :label="item.label" :value="item.value" :key="item.value"></el-option>
				</el-select>
			</el-form-item> -->
			<el-form-item label="服务类型" prop="serviceType">
				<el-select read disabled v-model="createdItem.serviceType" size="mini" clearable placeholder="请选择" @change="handleSelectServiceType" style="width: 100%">
					<el-option v-for="item in serviceTypeOptions" :label="item.name" :value="item.serviceType" :key="item.serviceType"></el-option>
				</el-select>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { baseBusinessList, baseEmployeeListName } from '@/api/base'
import { customerList } from '@/api/crm/supplier'
import { orderSellers } from '@/api/order/list'

const defaultCreate = {
	businessType: '',
	seller: null,
	custid: null,
	custIntrustNo: '',
	// cargoSource: '',
	serviceType: ''
}

export default {
	data() {
		return {
			dialogConfig: {
				title: '创建订单',
				show: true,
				size: 'medium',
				width: '400px'
			},

			createdItem: Object.assign({}, defaultCreate),

			businessTypeOptions: [],
			sellerOptions: [],
			custidOptions: [],
			serviceTypeOptions: [],

			rules: {
				businessType: [{ required: true, message: ' ', trigger: 'change' }],
				seller: [{ required: true, message: ' ', trigger: 'change' }],
				custid: [{ required: true, message: ' ', trigger: 'change' }],
				// cargoSource: [{ required: true, message: ' ', trigger: 'change' }],
				serviceType: [{ required: true, message: ' ', trigger: 'change' }],
				custIntrustNo: [
					{ required: false, message: ' ', trigger: 'change' },
					{ max: 128, message: ' ', trigger: 'change' }
				]
			},
			timerTr: null
		}
	},
	props: {
		param: {
			type: Object
		}
	},
	created() {
		this.getBusinessType()
	},
	mounted() {},

	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
      userId: (state) => state.user.userId,
      roles: (state) => state.user.roles
		})
	},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
		getBusinessType() {
			baseBusinessList().then(res => {
				let { data } = res
				this.businessTypeOptions = data
					.filter(item => item.business === 'rail')
					.map(item => {
						return Object.assign(item, {
							label: item.name,
							value: item.businessType
						})
					})
			})
		},

		close(action, value, type) {
			this.$emit('close', action, value, type)
		},

		validate() {
			return true
		},

		handleSelectBusinessType(val) {
			console.log('🚀 ~ val', val)
			console.log('🚀 ~ this.businessTypeOptions', this.businessTypeOptions)
			if (val) {
				this.businessTypeOptions.map(item => {
					if (item.businessType === val) {
						this.serviceTypeOptions = item.serviceTypeList
						// this.createdItem.serviceType = 'st07'
					}
				})
				if (val === 'rail_export_lcl') {
					this.createdItem.serviceType = 'st08'
				} else {
					this.createdItem.serviceType = 'st07'
				}
				this.getSellers(val)
			} else {
				this.sellerOptions = []
				this.serviceTypeOptions = []
				this.createdItem.serviceType = ''
			}
		},

		handleClickSeller() {
			if (!this.createdItem.businessType) {
				return this.$message.warning('请先选择业务类型')
			}
		},

		handleSelectSeller(val) {},
		handleClear() {
			this.createdItem.seller = ''
			this.createdItem.custid = ''
			this.custidOptions = []
		},

		// 获取销售
		getSellers(val = '') {
			let data = {
				businessType: val
			}
			orderSellers(data).then(res => {
				this.sellerOptions = res.data
				if (this.roles.includes('bd')) {
          this.createdItem.seller = this.userId
        }
			})
		},

		custFilterMehod(val) {
			this.debounceLxz(() => {
				this.getCustList(val)
			})
		},

		custVisibleChange(val) {
			if (val) {
				if (!this.createdItem.seller) {
					return this.$message.warning('请先选择销售')
				}
				this.getCustList()
			}
		},

		handleSelectCustid() {},
		debounceLxz(fn, time = 800) {
			clearTimeout(this.timerTr)
			this.timerTr = setTimeout(() => {
				if (!fn || !(fn instanceof Function)) {
					this.$message({ message: '参数错误！', type: 'error', showClose: true })
				} else {
					fn()
				}
			}, time)
		},
		// 获取委托单位
		getCustList(val = '') {
			console.log(this.createdItem.seller)
			if (!this.createdItem.seller || !val) return
			let data = {
				currPage: 1,
				pageSize: 50,
				query: val
					? [
							{ column: 'name', type: 'like', value: val },
							{ column: 'bdEmployeeId', type: 'eq', value: this.createdItem.seller },
							{ column: 'roleType', type: 'eq', value: 'client' }
					  ]
					: [
							{ column: 'bdEmployeeId', type: 'eq', value: this.createdItem.seller },
							{ column: 'roleType', type: 'eq', value: 'client' }
					  ]
			}
			customerList(data).then(res => {
				this.custidOptions = res.data.list.map(o => {
					return {
						value: o.custid,
						label: o.name
					}
				})
			})
		},

		handleSelectCargoSource() {},

		handleClickServiceType() {
			if (!this.createdItem.businessType) {
				return this.$message.warning('请先选择业务类型')
			}
		},

		handleSelectServiceType(val) {
			console.log('🚀 ~ val', val)
		},

		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.createOrderForm.validate(valid => {
					if (valid) {
						this.handleCreateOrder(done)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},

		// 新建订单
		handleCreateOrder(done) {
			done()
			this.close('Confirm', this.createdItem)
		}
	}
}
</script>

<style lang="scss"></style>
