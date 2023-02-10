<template>
	<div id="yardDialog">
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<div class="ft12 mb10"><b>集装箱信息</b></div>
			<el-form style="padding:0" ref="createForm" :rules="rules" :model="formData" class="create-form" label-width="50px">
				<el-row>
					<el-col :span="4">
						<el-form-item prop="so" label="so" :required="isFcl" style="margin-right: 10px;" :show-message="false">
							<el-select v-model="formData.so" size="mini">
								<el-option v-for="(item, index) in soOptions" :label="item" :value="item" :key="index"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="4">
						<el-form-item prop="containerType" label="箱型" :required="isFcl" style="margin-right: 10px;" :show-message="false">
							<el-select v-model="formData.containerType" size="mini">
								<el-option v-for="(item, index) in containerTypeOptions" :label="item" :value="item" :key="index"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="4">
						<el-form-item label="箱号" style="margin-right: 10px;">
							<el-input v-model="formData.cn" size="mini"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="4">
						<el-form-item label="封号">
							<el-input v-model="formData.sn" size="mini"></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8" class="addCont">
						<el-button type="primary" size="mini" @click="handleAdd">新增装箱信息</el-button>
					</el-col>
				</el-row>
			</el-form>
			<!-- 报关委托单  -->
			<TableComp 
				class="agent-table" 
				:tableConfig="tableConfig" 
				@cnameClick="cnameClick"
				@delete="handleDelete"/>
		</BaseDialog>
		<div v-if="showCnameDialog">
			<CnameDialog :clickType="'in'" @close="closeCnameDialog" @handleConfirm="handleConfirm"></CnameDialog>
		</div>
	</div>
</template>

<script>
import store from '@/store'
import { handleData } from '../../../js/handleData'
import BaseDialog from '@/components/Base/Dialog/index'
import FormItem from '@/components/Form/elFormItem'
import { getDictMap } from '@/utils/tools'
import { cargoHscodeList } from '@/api/base'
import TableComp from './tableComp'
// import DefaultTableComp from '../../../components/defaultTableComp'
import CnameDialog from './cnameDialog'
import { getBookSoList, bookAllSo } from '@/api/order/book/list'

var defaultTableList = {
	cname: '',
	hscode: '',
	mark: '',
	quantity: '',
	weight: '',
	volume: '',
	packageType: ''
}
import { mapState } from 'vuex'
export default {
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '装箱明细',
				show: true,
				size: 'medium',
				width: '80% '
			},
			formData: Object.assign(
				{},
				{
					boxContainerId_copy: this.yardDialogItem.boxContainerId_copy,
					boxContainerId: this.yardDialogItem.boxContainerId,
					boxId: this.yardDialogItem.boxId,
					so: this.yardDialogItem.so,
					containerType: this.yardDialogItem.containerType,
					cn: this.yardDialogItem.cn,
					sn: this.yardDialogItem.sn
				}
			),
			rules: {},
			// 装箱明细 输入框信息
			tableInfo: {
				// title: '',
				// titleBtnList: [{ label: '新增装箱信息', key: 'add', type: 'primary' }]
			},
			// 表格配置项
			tableConfig: {
				style: {},
				tableIndex: {
					show: false
				},
				summary: {
					showSummary: true,
					summaryMethod: this.getSummaries
				},
				options: {
					// 是否支持解锁列表修改,默认锁定列表不可更改
					lockState: false
				},
				columns: handleData.yardBoxCargosColumn(this.cnameClick, this.hscodeQuerySearch), //  表格显示的表头
				list: this.yardDialogItem && this.yardDialogItem.yardBoxCargos ? JSON.parse(JSON.stringify(this.yardDialogItem.yardBoxCargos)) : [],
				// 操作按钮组
				operationBtns: {
					width: '120px',
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
				// 操作提示
				tips: {
					text: '',
					show: false
				},
				// 分页
				pagination: {
					show: false,
					total: 0
				}
			},
			showCnameDialog: false,
			containerTypeOptions: [], // 箱型下拉选项
			soOptions: [] // so下拉选项
		}
	},
	props: {
		yardDialogItem: {
			type: Object,
			default() {
				{
				}
			}
		}
	},
	created() {
		console.log('tableList', this.tableConfig.list)
		this.getSoList()
	},
	computed: {
		...mapState({
			orderInfoDataObj: state => state.order.orderInfoDataObj
		}),
		isFcl() {
			// 整箱
			return ['ship_export_fcl', 'ship_import_fcl'].includes(this.orderInfoDataObj.businessType)
		},
		showConfirm() {
			let formDataCheck = false
			for (let key in this.formData) {
				if (this.formData[key]) {
           formDataCheck = true
				}
			}
			return formDataCheck || (this.tableConfig.list && this.tableConfig.list.length)
		}
	},
	components: {
		BaseDialog,
		FormItem,
		TableComp,
		// DefaultTableComp,
		CnameDialog
	},
	methods: {
		// 箱子校验
		validate(values) {
			let reg = /^\d+(\.\d+)?$/,
				numberReg = /^\d+(?=\.{0,1}\d+$|$)/
			if (values.some(item => !item.cname)) {
				this.$message({ type: 'error', message: '缺少品名' })
				return false
			}
			if (values.some(item => !numberReg.test(item.quantity))) {
				this.$message({ type: 'error', message: '请输入正确的件数' })
				return false
			}
			// if (values.some(item => item.quantity < 1)) {
			// 	this.$message({ type: 'error', message: '件数不能小于1' })
			// 	return false
			// }
			if (values.some(item => !reg.test(item.weight))) {
			  this.$message({type: 'error', message: '请输入正确的毛重'})
			  return false
			}
			if (values.some(item => !reg.test(item.volume))) {
			  this.$message({type: 'error', message: '请输入正确的体积'})
			  return false
			}
			if (values.some(item => !item.packageType)) {
				this.$message({ type: 'error', message: '包装不能为空' })
				return false
			}
			return true
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.createForm.validate(valid => {
					if (valid) {
						if (!this.validate(this.tableConfig.list)) return
						if (!this.showConfirm) return this.$message.error('装箱信息不能为空!')
						let values = Object.assign({}, this.formData, { yardBoxCargos: this.tableConfig.list })
						console.log('values', values)
						this.$emit('addYardFun', values)
						this.close('Confirm')
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		// // 表格按钮回调
		// tableClick(type) {
		// 	if (type == 'add') {
		// 		this.tableConfig.list.push({ ...defaultTableList })
		// 	}
		// },
		handleAdd() {
			this.tableConfig.list.push({ ...defaultTableList })
		},
		// 点击品名
		cnameClick(index) {
			this.clickCnameIndex = index
			this.showCnameDialog = true
		},
		// 获取so列表
		getSoList() {
			// let data = this.$route.query.jointNo ? this.$route.query.jointNo : this.$route.query.orderNo
			bookAllSo(this.$route.query.orderNo).then(res => {
				if (res.data && res.data.containerTypeList) {
					this.containerTypeOptions = [...res.data.containerTypeList]
					this.soOptions = [...res.data.soList]
				}
			})
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		closeCnameDialog() {
			this.showCnameDialog = false
		},
		handleDelete(row, index) {
			this.tableConfig.list.splice(index, 1)
		},
		handleConfirm(data) {
			this.tableConfig.list[this.clickCnameIndex].cargoId = data.cargoId
			this.tableConfig.list[this.clickCnameIndex].cname = data.cname
			this.tableConfig.list[this.clickCnameIndex].mark = data.mark
			this.tableConfig.list[this.clickCnameIndex].hscode = data.hscode
		},
		// hscode模糊查询
		hscodeQuerySearch(queryString, item) {
			let data = queryString && queryString !== true ? { keyword: queryString } : ''
			cargoHscodeList(data).then(res => {
				item.data =
					(res.data &&
						res.data.map(o => {
							return {
								label: o.cargoDesc,
								value: o.hscode
							}
						})) ||
					[]
			})
		},
		// 合计
		getSummaries(param) {
			const { columns, data } = param
			const sums = []
			columns.forEach((column, index) => {
				if (index === 0) {
					sums[index] = '合计'
					return
				}
				if (index > 2 && index < 6) {
					const values = data.map(item => Number(item[column.property]))
					sums[index] = values.reduce((prev, curr) => {
						const value = Number(curr)
						if (!isNaN(value)) {
							return prev + curr
						} else {
							return prev
						}
					}, 0)
				} else {
					sums[index] = ''
				}
			})
			return sums
		}
	}
}
</script>

<style lang="scss">
.dialog-layout .row-tit {
	border-bottom: unset !important;
}
#yardDialog{
	.addCont{
		text-align: right;
		line-height: 30px;
	}
}
</style>
