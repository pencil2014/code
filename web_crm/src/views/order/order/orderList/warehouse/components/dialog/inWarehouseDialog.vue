<template>
	<div>
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<el-form id="addWarehouseIn" ref="form" :rules="rules" :model="formData" label-width="90px">
				<el-row>
					<el-col v-for="(ele, index) in inputItem" :span="ele.span || 6" :key="index">
						<FormItem :item="ele" :form="formData" />
					</el-col>
				</el-row>
				<DefaultTableComp @currentChange="handleCurrentChange" @sizeChange="handleSizeChange" ref="defaultTableComp" :tableInfo="tableInfo" :tableConfig="tableConfig" @tableClick="tableClick"></DefaultTableComp>
			</el-form>
		</BaseDialog>
		<div v-if="showCnameDialog">
			<CnameDialog :clickType="'planin'" @close="closeCnameDialog" @handleConfirm="handleConfirm"></CnameDialog>
		</div>
	</div>
</template>

<script>
import store from '@/store'
import { copyArry } from '@/utils/tools'
import FormItem from '@/components/Form/elFormItem'
import BaseDialog from '@/components/Base/Dialog/index'
import DefaultTableComp from '@/views/order/order/components/defaultTableComp'
import { handleWarehouseData } from '../../../../js/handleData'
import CnameDialog from './cnameDialog'
import { warehouseList } from '@/api/order/warehouse'
import { warehouseInCreateSerialNo } from '@/api/order/list'

var defaultTableList = {
	cname: '',
	mark: '',
	totalQuantity: '',
	totalWeight: '',
	totalVolume: ''
}
var defaultFormData = {
	planNo: '',
	positionNo: '',
	warehouseName: '',
	deliveryCustName: '',
	deliveryContact: '',
	inRemark: ''
}
export default {
	data() {
		return {
			currentPage: 1,
			pageSize: 10000,
			originTable: this.detailData && copyArry(this.detailData.warehouseInplanItems),
			dialogConfig: {
				title: '实际进仓信息',
				show: true,
				size: 'medium',
				width: '80%'
			},
			formData: {
				batchNo: this.detailData.batchNo || '',
				positionNo: this.detailData.positionNo || '',
				deliveryContact: this.detailData.deliveryContact || '',
				deliveryContactPhone: this.detailData.deliveryContactPhone || '',
				deliveryCustName: this.detailData.deliveryCustName || '',
				deliveryCustid: this.detailData.deliveryCustid || '',
				planNo: this.detailData.planNo || '',
				realEnterTime: this.detailData.realEnterTime || '',
				inRemark: this.detailData.inRemark || '',
				whId: this.detailData.whId || '',
				orderNo: this.detailData.orderNo || '',
				warehouseInItems: [],
				warehouseName: this.detailData.warehouseName || ''
			},
			inputItem: [
				{ label: '进仓计划编号', key: 'planNo', prop: 'planNo', type: 'input', inputType: 'text', disabled: true },
				{ label: '进仓编码', key: 'batchNo', prop: 'batchNo', type: 'input', inputType: 'text', disabled: true },
				// {label: "外部仓库编码", key: "whBatchNo", prop: "whBatchNo", type: "input", inputType: "text", },
				{ label: '实际进仓时间', key: 'realEnterTime', prop: 'realEnterTime', type: 'dateLimit', inputType: 'text' },
				{ label: '仓位编码', key: 'positionNo', prop: 'positionNo', type: 'input', inputType: 'text' },
				{
					label: '仓库名称',
					key: 'whId',
					prop: 'whId',
					type: 'select',
					filterable: true,
					options: [{ label: this.detailData.warehouseName, value: this.detailData.whId }],
					visibleChange: (val, item) => {
						if (val) this.wareHouseSearch('', item)
					},
					filterMethod: (val, item) => {
						this.wareHouseSearch(val, item)
					},
					change: (val, item) => {
						let label = item.options.filter(o => o.value === val)[0].label
						this.formData.warehouseName = label
					}
				},
				{
					label: '客户名称',
					key: 'deliveryCustid',
					prop: 'deliveryCustid',
					type: 'select',
					disabled: true,
					// filterable:true,
					options: [{ label: this.detailData.deliveryCustName, value: this.detailData.deliveryCustid }],
					// visibleChange: (val, item) => {
					//   if(val) this.customerSearch('', item)
					// }, filterMethod: (val, item) => {
					//   this.customerSearch(val, item)
					// },
					change: (val, item) => {
						let label = item.options.filter(o => o.value === val)[0].label
						this.formData.deliveryCustName = label
					}
				},
				{ label: '客户姓名', key: 'deliveryContact', type: 'input', inputType: 'text' },
				{ label: '客户联系方式', key: 'deliveryContactPhone', type: 'input', inputType: 'text' },
				{ label: '实际进仓要求', key: 'inRemark', prop: 'inRemark', type: 'input', rows: '2', inputType: 'textarea', maxlength: '512', showWordLimit: true, span: 24 }
			],
			rules: {
				planNo: [{ required: true, message: '进仓计划编号不能为空', trigger: 'blur' }],
				batchNo: [{ required: true, message: '进仓编码不能为空', trigger: 'blur' }],
				// positionNo: [
				//   { required: true, message: '仓位编码不能为空', trigger: 'blur' },
				// ],
				realEnterTime: [{ required: true, message: '实际进仓时间不能为空', trigger: 'blur' }],
				warehouseName: [{ required: true, message: '仓库名称不能为空', trigger: 'blur' }],
				deliveryCustName: [{ required: true, message: '客户名称不能为空', trigger: 'blur' }]
			},
			tableInfo: {
				title: '货品列表',
				titleBtnList: [{ label: '添加进仓货品', key: 'add', type: 'primary' }]
			},
			// 表格配置项
			tableConfig: {
				style: {},
				tableIndex: {
					show: false
				},
				options: {
					// 是否支持解锁列表修改,默认锁定列表不可更改
					lockState: false
				},
				columns: handleWarehouseData.InWarehouseColumn(this.cnameClick, this.handleValidateNum, this.detailData.warehouseInplanItems), //  表格显示的表头
				list: (this.detailData && copyArry(this.detailData.warehouseInplanItems)) || [],
				// 操作按钮组
				operationBtns: { show: false },
				// 操作提示
				tips: {
					text: '',
					show: false
				},
				// 操作按钮组
				operationBtns: {
					width: '150px',
					fixed: 'right',
					show: true,
					callback: (action, $index, row, item) => {
						let fn = this['handle' + action]
						if (typeof fn !== 'function') return
						this['handle' + action](row, $index)
					},
					data: [
						{
							label: '删除',
							type: 'text',
							show: true,
							action: 'Delete'
						}
					]
				},

				// 分页
				pagination: {
					show: false,
					total: (this.detailData && copyArry(this.detailData.warehouseInplanItems).length) || 0
				}
			},
			warehouseInplanStatus: store.state.dict.dictMap.warehouseInplanStatus, // 进仓状态
			showCnameDialog: false, // 显示品名弹窗
			clickCnameIndex: '' // 点击品名下标
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
	created() {
		console.log(this.detailData)
		this.createSerialNo()
		this.getList()
	},
	mounted() {},
	computed: {},
	components: {
		BaseDialog,
		DefaultTableComp,
		FormItem,
		CnameDialog
	},
	methods: {
		handleSizeChange(val) {
			this.pageSize = val
			this.getList()
		},
		handleCurrentChange(val) {
			this.currentPage = val
			this.getList()
		},
		getList() {
			this.tableConfig.list = this.originTable
		},
		// 获取进仓编码
		createSerialNo() {
			warehouseInCreateSerialNo().then(res => {
				this.formData.batchNo = res.data.serialNo
			})
		},
		dialogCallback(action, done) {
			// 保存
			if (action === 'Confirm') {
				this.$refs.form.validate(valid => {
					if (valid) {
						if (this.tableConfig.list.find(item => !item.quantity)) {
							return this.$message.error('请填写实际进仓件数')
						}
						let data = { ...this.formData }
						console.log(data)
						data.warehouseInItems = [...this.tableConfig.list]
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
		tableClick(type) {
			// 表格添加行
			if (type == 'add') {
				this.tableConfig.list.push({ ...defaultTableList })
			}
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		handleDelete(row, index) {
			this.tableConfig.list.splice(index, 1)
		},
		handleConfirm(data) {
			let isItem = this.tableConfig.list.find(item => item.cargoId === data.cargoId)
			if (!isItem) {
				this.tableConfig.list[this.clickCnameIndex].cargoId = data.cargoId
				this.tableConfig.list[this.clickCnameIndex].cname = data.cname
				this.tableConfig.list[this.clickCnameIndex].mark = data.mark
			} else {
				return this.$message.error('该货品已添加过了，不能重复添加')
			}
		},
		// 点击品名
		cnameClick(index) {
			this.clickCnameIndex = index
			this.showCnameDialog = true
		},
		closeCnameDialog() {
			this.showCnameDialog = false
		},
		handleValidateNum(index, val) {
			const intReg= /^[0-9]\d*$/
			let tableData = this.tableConfig.list
			if (tableData[index][val] && !intReg.test(tableData[index][val])) {
				tableData[index][val] = ''
				return this.$message.error('请输入正确的件数')
			}
			if (tableData[index][val] > 9999999) {
				tableData[index][val] = 9999999
				this.$message.error('最大不能超过9999999!')
			}
		},
		// 仓库模糊查询
		wareHouseSearch(queryString, item) {
			let data = {
				currPage: 1,
				pageSize: 50,
				warehouseName: queryString
			}
			warehouseList(data).then(res => {
				let list = res.data.list
				item.options = list
					.filter(item => item.state === 'valid')
					.map(item => {
						return {
							value: item.whId,
							label: item.warehouseName
						}
					})
			})
		},
		// 客户模糊查询
		customerSearch(val, item) {
			this.$store.dispatch('dict/queryCustomerList', val || '').then(data => {
				let list = data.list
				item.options = list.map(o => {
					return {
						value: o.custid ? Number(o.custid) : '',
						label: this.$language == 'en' ? o.ename : o.name
					}
				})
			})
		}
	}
}
</script>

<style lang="scss">
.dialog-layout .row-tit {
	border-bottom: unset !important;
}
#addWarehouseIn {
	.el-row {
		padding: 0;
	}
	.default-table {
		padding: 0;
		.row-tit,
		.row-table {
			padding: 0;
		}
	}
	.el-collapse-item__content {
		padding-top: 10px;
		font-size: 12px;
	}
	.el-form-item__content {
		margin-right: 10px;
	}
	// .row-tit {
	// 	padding: 0 20px !important;
	// }
	.el-form-item {
		margin-bottom: 4px;
	}
	.el-form-item__label{
		padding-right: 4px;
	}
	.el-form-item__label,
	.el-form-item__content {
		line-height: 20px;
	}
}
#deliveryContact {
	display: inline-block;
	.deliveryContact {
		width: 30%;
	}
	span {
		width: 10%;
		padding: 2%;
	}
	.deliveryContactPhone {
		width: 60%;
	}
}
</style>
