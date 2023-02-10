<template>
	<div id="warehouseOutDetail">
		<div :class="['row-tit',{'isFixed': saveBarFixed}]" :style="styleObject" id="saveBar">
			<span class="tit">出仓信息</span>
			<div class="row-tit-operate">
				<el-button type="default" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'cancel' })">取消</el-button>
				<el-button type="primary" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'save' })" :disabled="!isOpTruck || isJoint || isFinish || isDisabledEdit" v-if="isOpTruck">保存</el-button>
			</div>
		</div>
		<div class="row-body">
			<el-form ref="form" :rules="rules" :model="formData" label-width="90px">
				<el-row>
					<el-col :span="ele.span || 6" v-for="(ele, index) in inputItem" :key="index">
						<FormItem :item="ele" :form="formData" />
					</el-col>
				</el-row>
				<DefaultTableComp class="warehouse-out-table-tip" ref="defaultTableComp" :tableInfo="tableInfo" :tableConfig="tableConfig" @tableClick="tableClick"></DefaultTableComp>
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
import FormItem from '@/components/Form/elFormItem'
import BaseDialog from '@/components/Base/Dialog/index'
import DefaultTableComp from '../../../../components/defaultTableComp'
import { handleWarehouseData } from '../../../../js/handleData'
import CnameDialog from './cnameDialog'
import { warehouseList } from '@/api/order/warehouse'
import PopContainer from './popContainer'

var defaultTableList = {
	containerId: '',
	containerType: '',
	so: '',
	inBatchNo: '',
	cname: '',
	mark: '',
	packageType: '',
	quantity: '',
	weight: '',
	volume: ''
}
var defaultFormData = {
	planNo: '',
	// whBatchNo: "",
	warehouseName: '',
	outTime: '',
	remark: ''
}
export default {
	data() {
		return {
			containerIds: [],
			popContainerShow: false,
			pos: 0,
			containerIdSpanArr: [],
			formData: Object.assign({
				oid: this.detailData.oid || '',
				planNo: this.detailData.planNo || '',
				batchNo: this.detailData.batchNo || '',
				whId: this.detailData.whId || '',
				warehouseName: this.detailData.warehouseName || '',
				// whBatchNo: this.detailData.whBatchNo || '',
				outTime: this.detailData.outTime || '',
				remark: this.detailData.remark || '',
				positionNo: this.detailData.positionNo || '',
				warehouseOutItems: []
			}),
			inputItem: [
				{ label: '出仓计划编码', key: 'planNo', prop: 'planNo', type: 'input', inputType: 'text', disabled: true },
				{ label: '出仓编码', key: 'batchNo', prop: 'batchNo', type: 'input', inputType: 'text', disabled: true },
				// {label: "外部仓库编码", key: "whBatchNo", prop: "whBatchNo", type: "input", inputType: "text", disabled: true, },
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
				{ label: '实际出仓时间', key: 'outTime', prop: 'outTime', type: 'dateLimit', inputType: 'text' },
				{ label: '实际出仓要求', key: 'remark', prop: 'remark', type: 'input', inputType: 'textarea', row: '2', span: 24, maxlength: '512', showWordLimit: true }
			],
			rules: {
				planNo: [{ required: true, message: '出仓计划编码不能为空', trigger: 'blur' }],
				batchNo: [{ required: true, message: '仓库名称不能为空', trigger: 'blur' }],
				whId: [{ required: true, message: '仓库名称不能为空', trigger: 'blur' }],
				outTime: [{ required: true, message: '预计出仓时间不能为空', trigger: 'blur' }]
				// remark: [{ required: true, message: '出仓要求不能为空', trigger: 'blur' }]
			},
			tableInfo: {
				title: '货品列表',
				titleBtnList: [
					// {label: "添加出仓货品", key: "add"},
					{ label: '添加集装箱', key: 'add', disabled: this.detailData.isCargoEdit === 'y', type: 'primary' },
					{ label: '关联集装箱', key: 'relate', disabled: this.detailData.isCargoEdit === 'y', type: 'primary' }
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
					lockState: false,
					mutiSelect: true,
					checkSelectable() {
						return true
					}
				},
				columns: handleWarehouseData.OutWarehouseDetailColumn(this.cnameClick, this.handleValidateNum, this.detailData.isCargoEdit, this.containerClick, this.detailData.warehouseOutItems), //  表格显示的表头
				list: (this.detailData && copyArry(this.detailData.warehouseOutItems)) || [],
				objectSpanMethod: this.objectSpanMethod,
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
							label: '添加出仓货品',
							type: 'text',
							show:true,
							disabled: (item, row) => {
								if (this.detailData.isCargoEdit !== 'n'  || this.isDisabledEdit) {
									return true
								}
								return false
							},
							action: 'Add'
						},
						{
							label: '删除',
							type: 'text',
							show:true,
							disabled: (item, row) => {
								if (this.detailData.isCargoEdit !== 'n'  || this.isDisabledEdit) {
									return true
								}
								return false
							},
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
		isDisabledEdit: {
			type: Boolean,
			default: false
		},
		detailData: {
			type: Object,
			default() {
				{
				}
			}
		},
		isJoint: {
			type: Boolean,
			default: false
		},
		isFinish: {
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
				this.tableConfig.columns = handleWarehouseData.OutWarehouseDetailColumn(this.cnameClick, this.handleValidateNum, newValue.isCargoEdit, this.containerClick, newValue.warehouseOutItems)
				this.tableConfig.list = (newValue && copyArry(newValue.warehouseOutItems)) || []
				this.inputItem.map(item => {
					if (item.key === 'whId') {
						return Object.assign(item, {
							options: [{ label: newValue.warehouseName, value: newValue.whId }]
						})
					}
				})
				if (this.isOpTruck) {
					this.tableInfo.titleBtnList = [
						{ label: '添加集装箱', key: 'add', disabled: this.detailData.isCargoEdit === 'y', type: 'primary' },
						{ label: '关联集装箱', key: 'relate', disabled: this.detailData.isCargoEdit === 'y', type: 'primary' }
					]
				} else {
					this.tableInfo.titleBtnList = []
				}
			},
			deep: true
		},
		'tableConfig.list': {
			handler(newVal) {
				this.getSpanArr(newVal)
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
			return this.saveBarFixed ? {
				left: '120px',
				top: offsetTop + 24 + 'px'
			} : {}
		}
	},
	components: {
		BaseDialog,
		DefaultTableComp,
		FormItem,
		CnameDialog,
		PopContainer
	},
	methods: {
		containerClick(index, row) {
			this.containerIds = [row.containerId]
			this.popContainerShow = true
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
			}
		},
		// 储存合并相同的箱号的id
		getSpanArr(data) {
			/*  
        如果是第一条记录（索引为0），向数组中加入1，并设置索引位置；
        如果不是第一条记录，则判断它与前一条记录是否相等，
        如果相等，则向spanArr中添入元素0，并将前一位元素+1，表示合并行数+1，
        以此往复，得到所有行的合并数，0即表示该行不显示。
    */
			this.containerIdSpanArr = []
			for (var i = 0; i < data.length; i++) {
				if (i === 0) {
					this.containerIdSpanArr.push(1) //containerIdSpanArr是一个空数组，用于存放每一行记录的合并数
					this.pos = 0 //pos是containerIdSpanArr的索引
				} else {
					// 判断箱号当前元素与上一个元素是否相同
					if (data[i].containerId === data[i - 1].containerId) {
						this.containerIdSpanArr[this.pos] += 1
						this.containerIdSpanArr.push(0)
					} else {
						this.containerIdSpanArr.push(1)
						this.pos = i
					}
				}
			}
			console.log(this.containerIdSpanArr)
		},
		// 合并单元格
		objectSpanMethod({ column, row, columnIndex, rowIndex }) {
			if ([0, 1, 2].includes(columnIndex)) {
				//用于设置要合并的列
				const _row = this.containerIdSpanArr[rowIndex]
				const _col = _row > 0 ? 1 : 0
				return {
					rowspan: _row, //合并的行数
					colspan: _col //合并的列数，设为0则直接不显示
				}
			}
		},
		tableClick(type) {
			if (type == 'add') {
				// let containerId = this.tableConfig.list.length == 0 ? 0 : this.tableConfig.list[this.tableConfig.list.length - 1].containerId + 1
				let containerId = Math.floor((Math.random() + Math.floor(Math.random() * 9 + 1)) * Math.pow(10, 8))
				this.tableConfig.list.push({ ...defaultTableList, containerId: containerId })
			}
			if (type === 'relate') {
				if (this.$refs.defaultTableComp.selectedCheckbox.length === 0) return this.$message.error('请先选择一条数据!')
				this.containerIds = this.$refs.defaultTableComp.selectedCheckbox.map(item => {
					if (item.containerId > 100000000 || !item.containerId) {
						item.containerId = ''
					}
					return item.containerId
				})
				this.popContainerShow = true
			}
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		handleDelete(row, index) {
			this.tableConfig.list.splice(index, 1)
		},
		handleAdd(row, index) {
			this.tableConfig.list.splice(index + 1, 0, { ...defaultTableList, containerId: row.containerId })
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
		// 详情取消保存回调
		callBack(data) {
			if (data.type == 'save') {
				this.$refs.form.validate(valid => {
					if (valid) {
						let data = { ...this.formData }
						data.warehouseOutItems = [...this.tableConfig.list]
						console.log('🚀 ~ data', data)
						//编辑过就不再提示
						if (this.detailData.isCargoEdit === 'y') return this.$emit('handleConfirm', data)

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
#warehouseOutDetail {
	.warehouse-out-table-tip {
		.container-type-cell {
			color: #1890ff;
			cursor: pointer;
		}
		.cell.el-tooltip > div {
			width: 100%;
			.column-text-btn {
				width: 100%;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}
		.operate-group {
			.el-button:nth-child(2) {
				color: #f00;
			}
		}
	}
	border-top: 12px solid #f5f7f9;
	.el-row {
		padding: 0 20px;
		margin-top: 10px;
		.el-form-item {
			margin-bottom: 4px;
		}
		.el-form-item__label,
		.el-form-item__content {
			line-height: 20px;
		}
	}
	.default-table .row-table {
		padding: 0 20px;
	}
	.el-collapse-item__content {
		padding-top: 10px;
		font-size: 12px;
	}
	.el-form-item__label {
		padding-right: 4px;
		line-height: 20px;
	}
	.el-form-item__content {
		margin-right: 10px;
		line-height: 20px;
	}
	.row-tit {
		padding: 0 20px !important;
		line-height: 36px;
		height: 36px;
		.tit {
			font-size: 12px;
			line-height: 36px;
		}
		&.isFixed{
			position: fixed;
			background-color: #fff;
			z-index: 999;
			padding: 5px 20px !important;
			height: 30px;
			box-shadow: 4px 0px 10px 0px #e9e9e9;
			top: 24px;
			// top: 64px;
			right: 0;
			.tit{
				line-height: 20px;
			}
		}
	}
	// .el-input__prefix {
	// 	margin-top: 4px;
	// }
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
