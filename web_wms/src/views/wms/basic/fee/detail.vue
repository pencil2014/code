<template>
	<div class="detail-wrap">
		<div class="detail-header">
			<div class="header-left">{{ $route.query.type === 'add' ? '新增' : $route.query.type === 'modify' ? '修改' : '' }}费用模板</div>
			<div class="header-right">
				<el-button v-if="!isDetail" @click="handleSubmit" size="mini" type="success">提交</el-button>
				<el-button v-if="!isDetail" @click="handleCancel" size="mini">取消</el-button>
				<el-button v-if="isDetail" @click="handleCancel" size="mini">返回</el-button>
			</div>
		</div>
		<el-form ref="validForm" :show-message="false" :rules="rules" label-width="85px" :inline="true" :model="formInline">
			<div class="top-form">
				<el-form-item prop="templateName" label="模板名称">
					<el-input maxlength="64" :disabled="isDetail" size="mini" placeholder="请输入" v-model="formInline.templateName"> </el-input>
				</el-form-item>
				<el-form-item prop="templateType" label="模板类型">
					<el-select :disabled="isDetail" size="mini" v-model="formInline.templateType" placeholder="请选择">
						<el-option v-for="item in templateTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="warehouseId" label="仓库名称">
					<el-select filterable="" clearable="" :disabled="isDetail" size="mini" v-model="formInline.warehouseId" placeholder="请选择">
						<el-option v-for="item in warehouseOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="customerId" label="客户名称">
					<el-select
						:disabled="isDetail"
						size="mini"
						v-model="formInline.customerId"
						filterable
						remote
						reserve-keyword
						placeholder="请输入"
						@change="
							val => {
								customerChange(val)
							}
						"
						:remote-method="
							val => {
								customerMethod(val)
							}
						"
					>
						<el-option v-for="item in customerOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="enabled" label="启用状态">
					<el-select :disabled="isDetail" size="mini" v-model="formInline.enabled" placeholder="请选择">
						<el-option v-for="item in dictMap.openOrClose" :key="item.value" :label="item.label" :value="item.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="priority" label="优先级">
					<el-input maxlength="6" :disabled="isDetail" size="mini" placeholder="数字越大，显示约靠前" v-model="formInline.priority"> </el-input>
				</el-form-item>
				<el-form-item class="w100" prop="remark" label="备注">
					<el-input size="mini" maxlength="128" :disabled="isDetail" show-word-limit type="textarea" :rows="2" placeholder="请输入备注" v-model="formInline.remark"> </el-input>
				</el-form-item>
			</div>
			<div class="table-wrap">
				<div class="table-title">
					<div class="title-left">模板费用明细</div>
					<div class="title-right">
						<span v-if="!isDetail" @click="handleAdd" class="add-btn">新增</span><span @click="handleFold" class="arrow-btn">{{ arrowText }} <i :class="arrowDown ? 'el-icon-caret-top' : 'el-icon-caret-bottom'"></i></span>
					</div>
				</div>
				<div v-if="arrowDown" class="table-content">
					<el-table :header-cell-style="{ color: '#222222' }" :data="formInline.fees" border>
						<el-table-column align="center" prop="settlementType" label="结算单位类型">
							<template slot="header"> <span style="color: #e63923">*</span>结算单位类型 </template>
							<template slot-scope="scope">
								<el-form-item :prop="'fees.' + scope.$index + '.settlementType'" :rules="rules.settlementType">
									<el-select v-if="scope.row.isEdit" size="mini" v-model="scope.row.settlementType" placeholder="请选择">
										<el-option v-for="item in dictMap.wmsSettleUnitType" :key="item.value" :label="item.label" :value="item.value"></el-option>
									</el-select>
									<span v-else>{{ dictMapObj['wmsSettleUnitType'][scope.row.settlementType] }}</span>
								</el-form-item>
							</template>
						</el-table-column>
						<el-table-column align="center" prop="settlementFixedValue" label="结算单位固定值" width="220">
							<template slot="header"> <span style="color: #e63923">*</span>结算单位固定值 </template>
							<template slot-scope="scope">
								<el-form-item :prop="'fees.' + scope.$index + '.settlementFixedValue'" :rules="[{ required: scope.row.settlementType === 'fixed', message: '请选择', trigger: 'change' }]">
									<el-select
										v-if="scope.row.isEdit"
										size="mini"
										v-model="scope.row.settlementFixedValue"
										filterable
										remote
										reserve-keyword
										placeholder="请输入"
										@change="
											val => {
												fixedValueChange(val, scope.row)
											}
										"
										:remote-method="
											val => {
												fixedValueMethod(val, scope.row)
											}
										"
									>
										<el-option v-for="item in scope.row.fixedValueOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
									</el-select>
									<span v-else>{{ scope.row.settlementUnitName }}</span>
								</el-form-item>
							</template>
						</el-table-column>
						<el-table-column align="center" prop="feeName" label="费用名称">
							<template slot="header"> <span style="color: #e63923">*</span>费用名称 </template>
							<template slot-scope="scope">
								<el-form-item :prop="'fees.' + scope.$index + '.feeName'" :rules="rules.feeName">
									<el-select
										v-if="scope.row.isEdit"
										size="mini"
										v-model="scope.row.feeName"
										filterable
										remote
										reserve-keyword
										placeholder="请输入"
										@change="
											val => {
												feeNameChange(val, scope.row)
											}
										"
										:remote-method="
											val => {
												feeNameMethod(val, scope.row)
											}
										"
									>
										<el-option v-for="item in scope.row.feeNameOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
									</el-select>
									<span v-else>{{ scope.row.feeName }}</span>
								</el-form-item>
							</template>
						</el-table-column>
						<el-table-column align="center" prop="billingUnit" label="计费单位">
							<template slot="header"> <span style="color: #e63923">*</span>计费单位 </template>
							<template slot-scope="scope">
								<el-form-item :prop="'fees.' + scope.$index + '.billingUnit'" :rules="rules.billingUnit">
									<el-select v-if="scope.row.isEdit" size="mini" v-model="scope.row.billingUnit" placeholder="请选择">
										<el-option v-for="item in dictMap['wmsBillingUnit']" :key="item.value" :label="item.label" :value="item.value"></el-option>
									</el-select>
									<span v-else>{{ dictMapObj['wmsBillingUnit'][scope.row.billingUnit] }}</span>
								</el-form-item>
							</template>
						</el-table-column>
						<el-table-column align="center" prop="containerType" label="柜型" width="100">
							<template slot="header"> <span style="color: #e63923">*</span>柜型 </template>
							<template slot-scope="scope">
								<el-form-item :prop="'fees.' + scope.$index + '.containerType'" :rules="[{ required: scope.row.billingUnit === 'container', message: '请选择', trigger: 'change' }]">
									<el-select v-if="scope.row.isEdit" size="mini" v-model="scope.row.containerType" placeholder="请选择">
										<el-option v-for="item in dictMap['wmsContainerType']" :key="item.value" :label="item.label" :value="item.value"></el-option>
									</el-select>
									<span v-else>{{ dictMapObj['wmsContainerType'][scope.row.containerType] }}</span>
								</el-form-item>
							</template>
						</el-table-column>
						<el-table-column align="center" prop="unitPrince" label="单价" width="100">
							<template slot="header"> <span style="color: #e63923">*</span>单价 </template>
							<template slot-scope="scope">
								<el-form-item :prop="'fees.' + scope.$index + '.unitPrince'" :rules="rules.unitPrince">
									<el-input v-if="scope.row.isEdit" maxlength="16" :disabled="isDetail" size="mini" placeholder="请输入" v-model="scope.row.unitPrince"> </el-input>
									<span v-else>{{ scope.row.unitPrince }}</span>
								</el-form-item>
							</template>
						</el-table-column>
						<el-table-column align="center" prop="discountRate" label="折扣" width="100">
							<template slot="header"> <span style="color: #e63923">*</span>折扣 </template>
							<template slot-scope="scope">
								<el-form-item :prop="'fees.' + scope.$index + '.discountRate'" :rules="rules.discountRate">
									<el-input v-if="scope.row.isEdit" maxlength="16" :disabled="isDetail" size="mini" placeholder="请输入" v-model="scope.row.discountRate"> </el-input>
									<span v-else>{{ scope.row.discountRate }}</span>
								</el-form-item>
							</template>
						</el-table-column>
						<el-table-column align="center" prop="currency" label="币种" width="100">
							<template slot="header"> <span style="color: #e63923">*</span>币种 </template>
							<template slot-scope="scope">
								<el-form-item :prop="'fees.' + scope.$index + '.currency'" :rules="rules.currency">
									<el-select v-if="scope.row.isEdit" size="mini" v-model="scope.row.currency" placeholder="请选择">
										<el-option v-for="item in dictMap.wmsCurrency" :key="item.value" :label="item.label" :value="item.value"></el-option>
									</el-select>
									<span v-else>{{ dictMapObj['wmsCurrency'][scope.row.currency] }}</span>
								</el-form-item>
							</template>
						</el-table-column>
						<el-table-column v-if="!isDetail" align="center" label="操作">
							<template slot-scope="scope"
								><span v-if="scope.row.isEdit" @click="handleSave(scope.row)" class="save-btn">保存</span><span v-else @click="scope.row.isEdit = true" class="modify-btn">修改</span
								><span @click="handleDelete(scope.$index)" class="delete-btn">删除</span>
							</template>
						</el-table-column>
					</el-table>
				</div>
			</div>
		</el-form>
	</div>
</template>
<script>
import { feeTemplateDetail, feeTemplateModify, feeTemplateAdd, querySettleUnit, feeItemList, warehouseList, customerList, queryWarehousePage } from '@/api/wms'
import { mapGetters } from 'vuex'
export default {
	data() {
		return {
			customerOptions: [],
			warehouseOptions: [],
			templateTypeOptions: [
				{ label: '客户模板', value: 'customer_template' },
				{ label: '通用模板', value: 'common_template' }
			],
			containerTypeObj: {
				_20GP: '20GP',
				_40GP: '40GP',
				_40HQ: '40HQ'
			},
			containerTypeOptions: [
				{ label: '20GP', value: '_20GP' },
				{ label: '40GP', value: '_40GP' },
				{ label: '40HQ', value: '_40HQ' }
			],

			arrowText: '收起',
			arrowDown: true,
			rules: {
				templateName: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
				templateType: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
				warehouseId: [{ required: true, message: '请选择仓库名称', trigger: 'change' }],
				enabled: [{ required: true, message: '请选择启用状态', trigger: 'change' }],
				priority: [{ required: true, message: '请输入优先级', trigger: 'blur' }],
				settlementType: [{ required: true, message: '请选择', trigger: 'change' }],
				feeName: [{ required: true, message: '请选择', trigger: 'change' }],
				billingUnit: [{ required: true, message: '请选择', trigger: 'change' }],
				unitPrince: [{ required: true, message: '请输入', trigger: 'blur' }],
				discountRate: [{ required: true, message: '请输入', trigger: 'blur' }],
				currency: [{ required: true, message: '请选择', trigger: 'change' }]
			},
			formInline: {
				templateId: '',
				templateName: '',
				templateType: '',
				warehouseId: '',
				warehouseName: '',
				customerId: '',
				customerName: '',
				priority: '',
				enabled: 'yes',
				remark: '',
				fees: []
			}
		}
	},
	created() {
		this.getWarehouseOptions()
	},
	activated() {
		// 详情 修改
		if (['detail', 'modify'].includes(this.$route.query.type)) {
			this.getDetail()
		} else {
			// 重置校验
			this.$refs.validForm.resetFields()
			// 新增
			this.formInline = {
				templateName: '',
				templateType: '',
				warehouseId: '',
				warehouseName: '',
				customerId: '',
				customerName: '',
				priority: '',
				enabled: 'yes',
				remark: '',
				fees: [
					{
						settlementType: '',
						settlementFixedValue: '',
						settlementUnitName: '',
						feeName: '',
						feeCode: '',
						billingUnit: '',
						containerType: '',
						unitPrince: '',
						currency: 'CNY',
						discountRate: '1',
						isEdit: true,
						fixedValueOptions: [],
						feeNameOptions: []
					}
				]
			}
		}
	},
	mounted() {},
	computed: {
		...mapGetters(['dictMap', 'dictMapObj']),
		isDetail() {
			return this.$route.query.type === 'detail'
		}
	},
	watch: {},
	components: {},
	methods: {
		// 选择结算单位
		fixedValueChange(val, row) {
			let fix = row.fixedValueOptions.find(item => item.value === val)
			row.settlementUnitName = fix?.label
		},
		// 选择客户
		customerChange(val) {
			let cus = this.customerOptions.find(item => item.custid === val)
			this.formInline.customerName = cus?.name
		},
		// 客户列表
		customerMethod(val) {
			console.log('🚀 ~ val', val)
			customerList({ name: val }).then(res => {
				this.customerOptions = res.data.map(item => {
					return { ...item, label: item.name, value: item.custid }
				})
			})
		},
		// 仓库列表
		getWarehouseOptions() {
      let data = {
        currPage: 1,
        pageSize: 30,
        query: [
          {
            column: "employeeId",
            type: "eq",
            value: JSON.parse(localStorage.getItem('userInfo')).sysUserId
          },
          {
            column: "warehouseName",
            type: "like",
            value: ''
          }
        ]
      }
      queryWarehousePage(data)
        .then(({ data: { list } }) => {
          this.warehouseOptions.splice(
            0,
            1000,
            ...list.map((v) => ({
              ...v,
              label: v.warehouseName,
              value: v.wmsWarehouseId
            }))
          )
        })
			// warehouseList({ warehouseName: '' }).then(res => {
			// 	this.warehouseOptions = res.data.map(item => {
			// 		return { ...item, label: item.warehouseName, value: item.wmsWarehouseId }
			// 	})
			// })
		},
		// 选择费用
		feeNameChange(val, row) {
			let fee = row.feeNameOptions.find(item => item.value === val)
			row.feeCode = fee?.feeCode
		},
		// 费用名称
		feeNameMethod(val, row) {
			feeItemList({ name: val, businessType: 'ship_export_fcl', serviceType: 'st02', size: 20 }).then(res => {
				row.feeNameOptions = res.data.map(item => {
					return { ...item, label: item.feeName, value: item.feeName }
				})
			})
		},
		// 结算单位固定值
		fixedValueMethod(val, row) {
			console.log('🚀 ~ row', row)
			console.log('🚀 ~ val', val)
			querySettleUnit({ name: val }).then(res => {
				row.fixedValueOptions = res.data.map(item => {
					return { ...item, label: item.unitName, value: item.settleUnitId }
				})
			})
		},
		// 保存
		handleSave(row) {
			this.$refs['validForm'].validate((valid, obj) => {
				console.log('🚀 ~ obj', obj)
				console.log('🚀 ~ valid', valid)
				// 非空 验证
				if (Object.keys(obj).some(item => item.includes('fees'))) return false
				// 单价 验证
				if (!/((^[1-9]\d*)|^0)(\.\d{0,2}){0,1}$/.test(row.unitPrince)) return this.$message.error('单价只能填写最多包含两位小数的数字!')
				// 折扣 验证
				if (!/((^[1-9]\d*)|^0)(\.\d{0,2}){0,1}$/.test(row.discountRate)) return this.$message.error('折扣只能填写最多包含两位小数的数字!')

				row.isEdit = false
			})
		},
		// 提交
		handleSubmit() {
			this.$refs['validForm'].validate(valid => {
				if (valid) {
					// 优先级 验证
					if (!/(^[1-9]\d*$)/.test(this.formInline.priority)) return this.$message.error('优先级只能填写正整数!')
					// 单价 验证
					if (this.formInline.fees.some(item => !/((^[1-9]\d*)|^0)(\.\d{0,2}){0,1}$/.test(item.unitPrince))) return this.$message.error('单价只能填写最多包含两位小数的数字!')
					// 折扣 验证
					if (this.formInline.fees.some(item => !/((^[1-9]\d*)|^0)(\.\d{0,2}){0,1}$/.test(item.discountRate))) return this.$message.error('折扣只能填写最多包含两位小数的数字!')
					// 清除下拉数据源
					this.formInline.fees.map(item => {
						delete item.feeNameOptions
						delete item.fixedValueOptions
					})
					let data = this.formInline
					let fn = null
					if (this.$route.query.type === 'add') {
						fn = feeTemplateAdd
					} else {
						fn = feeTemplateModify
					}
					fn(data).then(() => {
						this.$router.push({ name: 'Fee' })
						this.$message.success('提交成功!')
					})
				} else {
					this.$message.error('请填写必填项!')
				}
			})
		},
		// 获取详情
		getDetail() {
			feeTemplateDetail({ feeTemplateId: this.$route.query.feeTemplateId }).then(res => {
				console.log('🚀 ~ res', res)
				this.formInline = res?.data
				this.formInline.fees = res?.data?.fees?.map(item => {
					return { ...item, isEdit: false, fixedValueOptions: [], feeNameOptions: [] }
				})
				// 请求客户接口
				this.customerMethod(this.formInline.customerName)
			})
		},
		// 取消
		handleCancel() {
			this.$router.push({ name: 'Fee' })
		},
		// 新增一行
		handleAdd() {
			this.formInline.fees.push({
				settlementType: '',
				settlementFixedValue: '',
				settlementUnitName: '',
				feeName: '',
				feeCode: '',
				billingUnit: '',
				containerType: '',
				unitPrince: '',
				currency: 'CNY',
				discountRate: '1',
				templateDetailId: '',
				isEdit: true,
				fixedValueOptions: [],
				feeNameOptions: []
			})
		},
		// 删除一行
		handleDelete(index) {
			console.log('🚀 ~ index', index)
			this.formInline.fees.splice(index, 1)
		},
		// 点击收起
		handleFold() {
			this.arrowDown = !this.arrowDown
			this.arrowText = this.arrowDown ? '收起' : '展开'
		}
	}
}
</script>
<style lang="scss">
.detail-wrap {
	min-height: calc(100vh - 62px);
	background: #ffffff;
	.table-wrap {
		margin: 0 16px;
		border: 1px solid #d9d9d9;
		.table-content {
			padding: 16px;
			span {
				font-size: 12px;
			}
			.el-form-item,
			.el-form-item__content,
			.el-select {
				display: block;
			}
			.el-form-item {
				margin: 0;
			}
			.el-table--border th,
			.el-table--border td {
				border-right: 1px solid #dfe6ec !important;
				height: 30px;
				padding: 0;
			}
			.delete-btn {
				color: #cd4130;
				cursor: pointer;
				margin-left: 16px;
			}
			.modify-btn {
				color: #e9851f;
				cursor: pointer;
			}
			.save-btn {
				color: #3e80f5;
				cursor: pointer;
			}
		}
		.table-title {
			background: #ebeef3;
			height: 40px;
			display: flex;
			justify-content: space-between;
			padding: 10px 15px;
			.title-left {
				font-size: 12px;
				font-weight: bold;
				color: #222222;
			}
			.title-right {
				display: flex;
				align-items: center;
				.add-btn {
					display: inline-block;
					width: 56px;
					height: 28px;
					line-height: 28px;
					background: #3e80f5;
					border-radius: 2px;
					margin-right: 40px;
					color: #ffffff;
					text-align: center;
					cursor: pointer;
				}
				.arrow-btn {
					cursor: pointer;
				}
			}
		}
	}
	.top-form {
		padding: 24px 0;
		.el-form-item {
			&.w100 {
				width: calc(100% - 20px);
			}
			width: calc((100% - 40px) / 3);
			.el-form-item__content {
				width: calc(100% - 85px);
				.el-select,
				.el-date-editor--datetime {
					width: 100%;
				}
			}
		}
	}
	.detail-header {
		padding: 10px 16px;
		height: 40px;
		border-bottom: 1px solid #d9d9d9;
		display: flex;
		justify-content: space-between;
		align-items: center;
		.header-left {
			font-size: 14px;
			font-weight: bold;
			color: #222222;
		}
	}
}
</style>
