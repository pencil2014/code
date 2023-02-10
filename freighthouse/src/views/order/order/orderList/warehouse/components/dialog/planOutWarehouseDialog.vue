<template>
	<div>
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<el-form id="addWarehouseOutplan" ref="form" :rules="rules" :model="formData" label-width="90px">
				<el-row>
					<el-col :span="ele.span || 6" v-for="(ele, index) in inputItem" :key="index">
						<FormItem :item="ele" :form="formData" />
					</el-col>
				</el-row>
				<CargoPop ref="cargoPop" :tableInfo="tableInfo" :tableConfig="tableConfig" @tableClick="tableClick" @cnameClick="cnameClick" @handleValidateNum="handleValidateNum" @delete="handleDelete" @addCargo="handleAddCargo"> </CargoPop>
			</el-form>
		</BaseDialog>
		<div v-if="showCnameDialog">
			<CnameDialog :clickType="'planOut'" @close="closeCnameDialog" @handleConfirm="handleConfirm"></CnameDialog>
		</div>
		<div v-if="popContainerShow">
			<PopContainer @close="popContainerClose" :bindContainerList="containerIds" />
		</div>
	</div>
</template>

<script>
import store from '@/store'
import { copyArry } from '@/utils/tools'
import { validateBox } from '@/utils/validate'
import FormItem from '@/components/Form/elFormItem'
import BaseDialog from '@/components/Base/Dialog/index'
import CargoPop from './planOutWarehousePop'
import { handleWarehouseData } from '../../../../js/handleData'
import CnameDialog from './cnameDialog'
import { warehouseList } from '@/api/order/warehouse'
import PopContainer from './popContainer'

var defaultTableList = {
	containerType: '',
	so: '',
	containerId: '',
	inBatchNo: '',
	cname: '',
	mark: '',
	lastQuantity: '',
	packageType: '',
	quantity: ''
}
var defaultFormData = {
	planNo: '',
	warehouseName: '',
	planTime: '',
	remark: ''
}
export default {
	data() {
		return {
			popContainerShow: false, // 集装箱弹窗
			containerIds: [],
			dialogConfig: {
				title: '计划出仓信息',
				show: true,
				size: 'medium',
				width: '80%'
			},
			formData: Object.assign({}, defaultFormData, this.detailData),
			inputItem: [
				{ label: '出仓计划编码', key: 'planNo', prop: 'planNo', type: 'input', inputType: 'text', disabled: true },
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
						// let label = item.options.filter(o => o.value === val)[0].label
						// this.formData.warehouseName = label
						
						let wareHouse = item.options.filter(o => o.value === val)[0]
						this.formData.warehouseName = wareHouse.label
						this.formData.whSupplierName = wareHouse.supplierName
					}
				},
				{ label: '供应商', key: 'whSupplierName', type: 'input', inputType: 'text', disabled: true },
				{ label: '预计出仓时间', key: 'planTime', prop: 'planTime', type: 'dateLimit', inputType: 'text' },
				{ label: '合同号', key: 'contractNo', type: 'input', inputType: 'text', maxlength: '128', showWordLimit: true },
				{ label: '出仓要求', key: 'remark', prop: 'remark', type: 'input', inputType: 'textarea', span: 24, row: '2', maxlength: '512', showWordLimit: true }
			],
			rules: {
				planNo: [{ required: true, message: '出仓计划编码不能为空', trigger: 'blur' }],
				warehouseName: [{ required: true, message: '仓库名称不能为空', trigger: 'blur' }],
				planTime: [{ required: true, message: '预计出仓时间不能为空', trigger: 'blur' }],
				remark: [{ required: true, message: '出仓要求不能为空', trigger: 'blur' }]
			},
			tableInfo: {
				title: '货品列表',
				titleBtnList: [
					// { label: '添加出仓货品', key: 'add', type: 'primary' },
					{ label: '添加集装箱', key: 'add', type: 'primary' },
					{ label: '关联集装箱', key: 'relate', type: 'primary' }
				]
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
				columns: handleWarehouseData.PlanOutWarehouseColumn(this.cnameClick, this.handleValidateNum), //  表格显示的表头
				list: (this.detailData && copyArry(this.detailData.warehouseInItems)) || [],
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
					total: 0
				}
			},
			showCnameDialog: false, // 显示品名弹窗
			clickCnameIndex: '' // 点击品名的下标
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
	},
	mounted() {},
	computed: {},
	components: {
		BaseDialog,
		CargoPop,
		// DefaultTableComp,
		FormItem,
		CnameDialog,
		PopContainer
	},
	methods: {
		// 新增货品
		handleAddCargo(row, index) {
			let item = { ...defaultTableList, containerId: row.containerId }
			this.tableConfig.list.splice(index + 1, 0, item)
		},
		// 选择集装箱关闭回调
		popContainerClose(action, values) {
			console.log('🚀 ~ values', values)
			console.log('🚀 ~ action', action)
			this.popContainerShow = false
			values = values || []
			console.log('🚀 ~ this.tableConfig.list', this.tableConfig.list)
			if (action === 'Confirm') {
				if (!values.length) return
				let relateObj = values[0]
				console.log('🚀 ~ values', values)
				this.tableConfig.list = this.tableConfig.list.map(item => {
					item.containerId === null ? (item.containerId = '') : ''
					return item
				})
				// 过滤掉详情已有的箱子
				let editData = JSON.parse(JSON.stringify(this.tableConfig.list.filter(item => this.containerIds.includes(item.containerId))))
				editData = editData.map(item => {
					item.so = relateObj.so
					item.containerId = relateObj.oid
					item.containerType = relateObj.containerType
					return item
				})
				console.log('🚀 ~ editData', editData)
				let filterData = JSON.parse(JSON.stringify(this.tableConfig.list.filter(item => !this.containerIds.includes(item.containerId))))
				console.log('🚀 ~ filterData', filterData)
				this.tableConfig.list = [...filterData, ...editData]
			}
		},

		validate(data) {
			let warehouseOutplanItems = [...data]
			let quanityCompare = warehouseOutplanItems.some(item => {
				return item.quantity && item.quantity > item.lastQuantity
			})
			let weightCompare = warehouseOutplanItems.some(item => {
				return item.weight && item.weight > item.lastWeight
			})
			let volumeCompare = warehouseOutplanItems.some(item => {
				return item.volume && item.volume > item.lastVolume
			})
			if (quanityCompare) {
				this.$message.error('计划出仓件数不能大于剩余库存件数')
				return false
			}
			if (weightCompare) {
				this.$message.error('计划出仓毛重不能大于剩余库存毛重')
				return false
			}
			if (volumeCompare) {
				this.$message.error('计划出仓体积不能大于剩余库存体积')
				return false
			}
			return true
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.form.validate(valid => {
					if (valid) {
						if (!validateBox(this.tableConfig.list)) return
						if (!this.validate(this.tableConfig.list)) return
						if (!this.detailData.realEnterTime) return this.$message.error('请先填写实际进仓时间!')
						let data = { ...this.formData }
						data.warehouseOutplanItems = [
							...this.tableConfig.list.map(item => {
								item.inBatchNo = item.batchNo
								return item
							})
						]
						this.$emit('handleConfirm', data)
						console.log('🚀 ~ data', data)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		tableClick(type, id) {
			// 新增关联集装箱
			if (type == 'add') {
				// let containerId = this.tableConfig.list.length == 0 ? 0 : this.tableConfig.list[this.tableConfig.list.length - 1].containerId + 1
				let containerId = Math.floor((Math.random()+Math.floor(Math.random()*9+1))*Math.pow(10,8))
				this.tableConfig.list.push({ ...defaultTableList, containerId: containerId })
			}
			if (type === 'relate') {
				if (this.$refs.cargoPop.multipleSelection.length === 0) return this.$message.error('请先选择一条数据!')

				this.containerIds = this.$refs.cargoPop.multipleSelection.map(item => {
					if (item.containerId>100000000||! item.containerId) {
						item.containerId=''
					}					
					 return item.containerId
				})
				this.popContainerShow = true
			}
			if (type === 'cell') {
				this.containerIds = [id]
				this.popContainerShow = true
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
				Object.assign(this.tableConfig.list[this.clickCnameIndex], data, {
					containerType: this.tableConfig.list[this.clickCnameIndex].containerType,
					containerId: this.tableConfig.list[this.clickCnameIndex].containerId,
					so: this.tableConfig.list[this.clickCnameIndex].so,
					inBatchNo: data.batchNo,
					quantity: data.lastQuantity,
					weight: data.lastWeight,
					volume: data.lastVolume
				})
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
				pageSize: 200,
				warehouseName: queryString,
				
			}
			warehouseList(data).then(res => {
				let list = res.data.list
				item.options = list
					.filter(item => item.state === 'valid')
					.map(item => {
						return {
							value: item.whId,
							label: item.warehouseName,
							supplierName: item.supplierName,
							disabled: item.status == 'no_effect'
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
#addWarehouseOutplan {
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
