<template>
	<div id="planInDetail">
		<div :class="['row-tit', { isFixed: saveBarFixed }]" :style="styleObject" id="saveBar">
			<span class="tit">计划进仓信息</span>
			<div class="row-tit-operate">
				<el-button type="default" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'cancel' })">取消</el-button>
				<el-button type="primary" size="mini" style="margin-left: 10px;" @click="callBack({ type: 'save' })" :disabled="(!isOp && !isOpTruck) || status === 'finish'" v-if="isOpTruck || isOp || isBd || isDisabledEdit">保存</el-button>
			</div>
		</div>
		<div class="row-body">
			<el-form ref="form" :rules="rules" :model="formData" label-width="90px">
				<el-row>
					<el-col v-for="(ele, index) in inputItem" :span="ele.span || 6" :key="index">
						<FormItem :item="ele" :form="formData" />
					</el-col>
				</el-row>
				<Cargo ref="cargo" :status="status" :isJoint="isJoint" :tableInfo="tableInfo" :tableConfig="tableConfig" @tableClick="tableClick" @cnameClick="cnameClick" @delete="handleDelete"> </Cargo>
			</el-form>
		</div>
		<div v-if="showCnameDialog">
			<CnameDialog :clickType="'planIn'" @close="closeCnameDialog" @handleConfirm="handleConfirm"> </CnameDialog>
		</div>
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import { copyArry, getDictMap } from '@/utils/tools'
import { validateBox } from '@/utils/validate'
import FormItem from '@/components/Form/elFormItem'
import BaseDialog from '@/components/Base/Dialog/index'
import Cargo from './planInWarehouseCargo'
import { handleWarehouseData } from '../../../../js/handleData'
import { orderContainerList } from '@/api/order/list'
import CnameDialog from './cnameDialog'
import { warehouseList } from '@/api/order/warehouse'

var defaultTableList = {
	cname: '',
	mark: '',
	planEnterTime: '',
	totalQuantity: '',
	totalWeight: '',
	totalVolume: '',
	packageType: ''
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
			oQuery: this.$route.query,
			formData: JSON.parse(JSON.stringify(this.detailData)),
			inputItem: [
				{ label: '进仓计划编号', key: 'planNo', prop: 'planNo', type: 'input', inputType: 'text', disabled: true },
				{ label: '仓位编码', key: 'positionNo', type: 'input', inputType: 'text' },
				{ label: '预计进仓时间', key: 'planEnterTime', prop: 'planEnterTime', type: 'dateLimit', inputType: 'text' },
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
				{ label: '进仓要求', key: 'inRemark', prop: 'inRemark', type: 'input', inputType: 'textarea', show: '2', span: 24, maxlength: '512', showWordLimit: true }
			],
			rules: {
				planNo: [{ required: true, message: '进仓计划编号不能为空', trigger: 'blur' }],
				whId: [{ required: true, message: '仓库名称不能为空', trigger: 'blur' }],
				deliveryCustid: [{ required: true, message: '客户名称不能为空', trigger: 'blur' }],
				planEnterTime: [{ required: true, message: '预计进仓时间不能为空', trigger: 'change' }]
			},
			tableInfo: {
				title: '货品列表',
				titleBtnList: [{ label: '添加进仓货品', key: 'add', type: 'primary' }]
			},
			// 表格配置项
			tableConfig: {
				style: {
					height: 400
				},
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
					total: 0
				}
			},
			warehouseInplanStatus: store.state.dict.dictMap.warehouseInplanStatus, // 进仓状态
			showCnameDialog: false, // 显示品名弹窗
			clickCnameIndex: '', // 点击品名下标
			whOptions: []
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
	created() {},
	mounted() {
		console.log('🚀 ~ detailData', this.detailData)
	},
	watch: {
		detailData: {
			handler(newValue) {
				this.formData = { ...newValue }
				this.tableConfig.list = (newValue && copyArry(newValue.warehouseInplanItems)) || [{ ...defaultTableList }]
				this.inputItem.map(item => {
					if (item.key === 'whId') {
						return Object.assign(item, {
							options: [{ label: newValue.warehouseName, value: newValue.whId }]
						})
					}
					if (item.key === 'deliveryCustid') {
						return Object.assign(item, {
							options: [{ label: newValue.deliveryCustName, value: newValue.deliveryCustid }]
						})
					}
				})
			},
			deep: true
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
		Cargo,
		// DefaultTableComp,
		FormItem,
		CnameDialog
	},
	methods: {
		tableClick(type) {
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
				return this.$message.warning('该货品已添加过了，不能重复添加')
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
		// 详情取消保存回调
		callBack(data) {
			if (data.type == 'save') {
				this.$refs.form.validate(valid => {
					if (valid) {
						if (!validateBox(this.tableConfig.list, ['quantity'])) return
						let data = { ...this.formData }
						data.warehouseInplanItems = [...this.tableConfig.list]
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
#planInDetail {
	border-top: 12px solid #f5f7f9;
	.row-tit {
		line-height: 36px;
		height: 36px;
		padding: 0 20px;
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
	.el-row {
		padding: 0 20px;
		margin-top: 10px;
	}
	.default-table {
		padding: 0 20px;
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
	.el-form-item__label {
		padding-right: 4px;
	}
	.el-form-item__label,
	.el-form-item__content {
		line-height: 20px;
	}
	.el-input__prefix {
		margin-top: 0;
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
