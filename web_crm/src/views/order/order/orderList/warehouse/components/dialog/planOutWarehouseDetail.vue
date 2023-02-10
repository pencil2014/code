<template>
	<div id="warehouseOutplanDetail">
		<div :class="['row-tit', { isFixed: saveBarFixed }]" :style="styleObject" id="saveBar">
			<span class="tit">计划出仓信息</span>
			<div class="row-tit-operate">
				<el-button type="default" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'cancel' })">取消</el-button>
				<el-button type="primary" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'save' })" :disabled="(!isOpTruck && !isOp) || isDisabledEdit">保存</el-button>
			</div>
		</div>
		<div class="row-body">
			<el-form ref="form" :rules="rules" :model="formData" label-width="90px">
				<el-row>
					<el-col :span="ele.span || 6" v-for="(ele, index) in inputItem" :key="index">
						<FormItem :item="ele" :form="formData" />
					</el-col>
				</el-row>
				<CargoPop
					:status="status"
					:isJoint="isJoint"
					ref="cargoPop"
					:tableInfo="tableInfo"
					:tableConfig="tableConfig"
					@tableClick="tableClick"
					@cnameClick="cnameClick"
					@handleValidateNum="handleValidateNum"
					@addCargo="handleAddCargo"
					@delete="handleDelete"
				>
				</CargoPop>
			</el-form>
			<div v-if="showCnameDialog">
				<CnameDialog :clickType="'planOut'" @close="closeCnameDialog" @handleConfirm="handleConfirm"></CnameDialog>
			</div>
			<div v-if="popContainerShow">
				<PopContainer @close="popContainerClose" :bindContainerList="containerIds" />
			</div>
		</div>
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import { copyArry } from '@/utils/tools'
import { validateBox } from '@/utils/validate'
import FormItem from '@/components/Form/elFormItem'
import BaseDialog from '@/components/Base/Dialog/index'
import CargoPop from './planOutWarehousePop'
import { handleWarehouseData } from '../../../../js/handleData'
import { orderContainerList } from '@/api/order/list'
import CnameDialog from './cnameDialog'
import { warehouseList } from '@/api/order/warehouse'
import PopContainer from './popContainer'

var defaultTableList = {
	containerType: '',
	so: '',
	containerId: '',
	inBatchNo: '',
	inItemId: '',
	cargoId: '',
	cname: '',
	mark: '',
	packageType: '',
	quantity: '',
	weight: '',
	volume: '',
	cargoVo: {}
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
			containerIds: [],
			popContainerShow: false,
			oQuery: this.$route.query,
			// formData: JSON.parse(JSON.stringify(this.detailData)),
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
						let label = item.options.filter(o => o.value === val)[0].label
						this.formData.warehouseName = label
					}
				},
				{ label: '预计出仓时间', key: 'planTime', prop: 'planTime', type: 'dateLimit', inputType: 'text' },
				{ label: '预计出仓要求', key: 'remark', prop: 'remark', type: 'input', inputType: 'textarea', row: '2', span: 24, maxlength: '512', showWordLimit: true }
			],
			rules: {
				planNo: [{ required: true, message: '出仓计划编码不能为空', trigger: 'blur' }],
				whId: [{ required: true, message: '仓库名称不能为空', trigger: 'blur' }],
				custid: [{ required: true, message: '客户名称不能为空', trigger: 'blur' }],
				planTime: [{ required: true, message: '预计出仓时间不能为空', trigger: 'blur' }]
				// remark: [{ required: true, message: '出仓要求不能为空', trigger: 'blur' }]
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
				style: {
					height: 400
				},
				tableIndex: {
					show: false
				},
				options: {
					// 是否支持解锁列表修改,默认锁定列表不可更改
					lockState: false
				},
				columns: handleWarehouseData.PlanOutWarehouseColumn(this.cnameClick, this.handleValidateNum), //  表格显示的表头
				list: (this.detailData && copyArry(this.detailData.warehouseOutplanItems)) || [],
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
			clickCnameIndex: '' // 点击品名下标
		}
	},
	props: {
		isDisabledEdit: {
			type: Boolean,
			default: false
		},
		detailData: {},
		status: '',
		isJoint: {
			type: Boolean,
			default: false
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		}
	},
	created() {
		console.log(this.detailData)
	},
	mounted() {},
	watch: {
		detailData: {
			handler(newValue) {
				this.formData = { ...newValue }
				this.tableConfig.list = (newValue && copyArry(newValue.warehouseOutplanItems)) || [{ ...defaultTableList }]
				this.inputItem.map(item => {
					if (item.key === 'whId') {
						return Object.assign(item, {
							options: [{ label: newValue.warehouseName, value: newValue.whId }]
						})
					}
				})
				if (this.isOp || this.isOpTruck) {
					this.tableInfo.titleBtnList = [
						{ label: '添加集装箱', key: 'add', type: 'primary' },
						{ label: '关联集装箱', key: 'relate', type: 'primary' }
					]
				} else {
					this.tableInfo.titleBtnList = []
				}
			},
			deep: true,
			immediate: true
		}
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			userEditRoles: state => state.order.orderList.userEditRoles
		}),
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.userEditRoles.includes('op') || this.userEditRoles.includes('line_cs')
		},
		isOpTruck() {
			return this.userEditRoles.includes('op_truck')
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.isDoc || this.isAc
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
			this.popContainerShow = false
			values = values || []

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
				console.log('🚀 ~ this.tableConfig.list', this.tableConfig.list)
			}
		},
		tableClick(type, id) {
			if (type == 'add') {
				// let containerId = this.tableConfig.list.length == 0 ? 0 : this.tableConfig.list[this.tableConfig.list.length - 1].containerId + 1
				let containerId = Math.floor((Math.random() + Math.floor(Math.random() * 9 + 1)) * Math.pow(10, 8))
				this.tableConfig.list.push({ ...defaultTableList, containerId: containerId })
			}
			if (type === 'relate') {
				if (this.$refs.cargoPop.multipleSelection.length === 0) return this.$message.error('请先选择一条数据!')
				this.containerIds = this.$refs.cargoPop.multipleSelection.map(item => {
					if (item.containerId > 100000000 || !item.containerId) {
						item.containerId = ''
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
			console.log('🚀 ~ data', data)

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
		// 件毛体blur失焦
		quantityBlur(val, row, type) {
			if (type === 'quantity') {
				let reg = /^[0-9]\d*$/
				if (!reg.test(val)) {
					Object.assign(row, { quantity: '' })
					val = ''
				}
				// else if (Number(val) > Number(row.lastQuantity)) {
				//   Object.assign(row, {quantity: '',})
				//   val = ''
				//   return this.$message({type: 'error', message: '计划出仓件数不能大于剩余库存件数'})
				// }
			}
			if (type === 'weight') {
				let reg = /^\d+(?=\.{0,1}\d+$|$)/
				if (!reg.test(val)) {
					val = ''
					Object.assign(row, { weight: '' })
				}
				// else if (Number(val) > Number(row.lastWeight)) {
				//   val = ''
				//   Object.assign(row, {weight: '',})
				//   return this.$message({type: 'error', message: '计划出仓毛重不能大于剩余库存毛重'})
				// }
			}
			if (type === 'volume') {
				let reg = /^\d+(?=\.{0,1}\d+$|$)/
				if (!reg.test(val)) {
					val = ''
					Object.assign(row, { volume: '' })
				}
				// else if (Number(val) > Number(row.lastVolume)) {
				//   val = ''
				//   Object.assign(row, {volume: '',})
				//   return this.$message({type: 'error', message: '计划出仓体积不能大于剩余库存体积'})
				// }
			}
		},
		closeCnameDialog() {
			this.showCnameDialog = false
		},
		handleValidateNum(index, val) {
			const intReg = /^[0-9]\d*$/
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
		// 详情取消保存回调
		callBack(data) {
			if (data.type == 'save') {
				this.$refs.form.validate(valid => {
					if (valid) {
						if (!validateBox(this.tableConfig.list)) return
						let data = { ...this.formData }
						data.warehouseOutplanItems = [...this.tableConfig.list]
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
		}
	}
}
</script>

<style lang="scss">
.dialog-layout .row-tit {
	border-bottom: unset !important;
}
#warehouseOutplanDetail {
	border-top: 12px solid #f5f7f9;
	.el-row {
		padding: 0 20px;
		margin-top: 10px;
		.el-form-item {
			margin-bottom: 4px;
		}
		.el-form-item__label {
			padding-right: 4px;
		}
		.el-form-item__label,
		.el-form-item__content {
			line-height: 20px;
		}
	}
	.el-collapse-item__content {
		padding-top: 10px;
		font-size: 12px;
	}
	.el-form-item__content {
		margin-right: 10px;
	}
	.row-tit {
		padding: 0 20px !important;
		line-height: 36px;
		height: 36px;
		.tit {
			font-size: 12px;
			line-height: 36px;
		}
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
	.default-table {
		padding: 0 20px;
		.row-tit,
		.row-table {
			padding: 0 !important;
		}
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
