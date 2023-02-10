<template>
	<div class="yardBoxDetail">
		<el-form ref="form" :rules="rules" :model="formData" label-position="left" label-width="100px">
			<div class="info-tit" id="saveBar">
				<span class="tit">堆场信息详情</span>
				<div class="row-tit-operate">
					<el-button type="default" size="mini" style="margin-left: 10px;" @click="callBack('cancel')">取消</el-button>
					<ButtonTip
						btnType="primary" 
						:btnDisabled="(!isOp && !isOpTruck) || isBd || isDisabledEdit" 
						btnText="保存" 
						:tipContent="isOpTruckAndOpTip || statusTip || isFinishTip || isJointTip" 
						class="operateBtn-tip ml10" 
						@click="callBack('save')">
					</ButtonTip>
					<!-- <el-button type="primary" size="mini" style="margin-left: 10px;" @click="callBack('save')" :disabled="isBd || isDisabledEdit">保存</el-button> -->
				</div>
			</div>
			<div class="info-tit isFixed" :style="styleObject" id="fixedSaveBar" v-if="saveBarFixed">
				<span class="tit">堆场信息详情</span>
				<div class="row-tit-operate">
					<el-button type="default" size="mini" style="margin-left: 10px;" @click="callBack('cancel')">取消</el-button>
					<ButtonTip
						btnType="primary" 
						:btnDisabled="(!isOp && !isOpTruck) || isBd || isDisabledEdit" 
						btnText="保存" 
						:tipContent="isOpTruckAndOpTip || statusTip || isFinishTip || isJointTip" 
						class="operateBtn-tip ml10" 
						@click="callBack('save')">
					</ButtonTip>
					<!-- <el-button type="primary" size="mini" style="margin-left: 10px;" @click="callBack('save')" :disabled="isBd || isDisabledEdit">保存</el-button> -->
				</div>
			</div>
			<div class="row-body">
				<el-row>
					<el-col :span="ele.key === 'boxRemark' ? 24 : 6" v-for="(ele, index) in inputItem" :key="index">
						<FormItem :item="ele" :form="formData" />
					</el-col>
				</el-row>
				<!-- 装箱明细  -->
				<div>
					<div class="soContainer-tit">
						<span class="tit">装箱明细</span>
						<ButtonTip
							btnType="primary" 
							:btnDisabled="(!isOp && !isOpTruck) || isBd || isDisabledEdit" 
							btnText="新增装箱明细" 
							:tipContent="isOpTruckAndOpTip || statusTip || isFinishTip || isJointTip" 
							class="operateBtn-tip" 
							@click="handleAdd">
						</ButtonTip>
						<!-- <el-button @click="handleAdd" type="primary" size="mini" style="margin-top: 0;" :disabled="isBd || isDisabledEdit">新增装箱明细</el-button> -->
					</div>
					<el-table :data="tableData" :span-method="objectSpanMethod" border style="display: grid;width: 100%">
						<!-- <el-table-column fixed type="index"></el-table-column> -->
						<el-table-column fixed prop="so" label="SO" width="120" align="center"> </el-table-column>
						<el-table-column fixed prop="containerType" label="箱型" width="80" align="center"></el-table-column>
						<el-table-column fixed prop="cn" label="箱号" width="100" align="center"></el-table-column>
						<el-table-column fixed prop="sn" label="封号" width="100" align="center"></el-table-column>
						<el-table-column prop="cname" label="品名" align="center"></el-table-column>
						<el-table-column prop="hscode" label="HSCODE" align="center" width="150"></el-table-column>
						<el-table-column prop="mark" label="唛头" align="center"></el-table-column>
						<el-table-column prop="quantity" label="件数" align="center"></el-table-column>
						<el-table-column prop="weight" label="毛重(KGS)" align="center"></el-table-column>
						<el-table-column prop="volume" label="体积(CBM)" align="center" width="100"></el-table-column>
						<el-table-column prop="packageType" label="包装" align="center">
							<template slot-scope="scope">
								{{ scope.row.packageType | packageTypeFilter }}
							</template>
						</el-table-column>
						<el-table-column fixed="right" label="操作" width="120" align="center">
							<template slot-scope="scope" v-if="scope.row.length || scope.row.length === 0">
								<div class="operate-group">
									<el-button @click="handleInfo(scope.row, scope.$index)" type="text" size="mini">详情</el-button>
									<ButtonTip
										btnType="text" 
										:btnDisabled="(!isOp && !isOpTruck) || isBd || isDisabledEdit" 
										btnText="删除" 
										:tipContent="isOpTruckAndOpTip || statusTip || isFinishTip || isJointTip" 
										class="operateBtn-tip" 
										btnClassName="red"
										@click="handleDelete(scope.row, scope.$index)">
									</ButtonTip>
									<!-- <el-button @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd || isDisabledEdit">删除</el-button> -->
								</div>
							</template>
						</el-table-column>
					</el-table>
				</div>
				<!-- <DefaultTableComp class="agent-table" :tableInfo="tableInfo" :tableConfig="tableConfig" @tableClick="tableClick" /> -->
			</div>
		</el-form>
		<!-- 集装箱弹窗 -->
		<div v-if="showYardDialog">
			<YardDialog :yardDialogItem="yardDialogItem" @addYardFun="addYardBackFunc" @close="closeDialog"></YardDialog>
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { handleData } from '../../../js/handleData'
import FormItem from '@/components/Form/elFormItem'
import { yardBoxDetail, yardList } from '@/api/order/list'
import { employeeSelectlist } from '@/api/companyResource'
import YardDialog from './yardDialog'
import { copyArry, getDictLabel } from '@/utils/tools'

let DefaultTableComp = {
	so: '',
	containerType: '',
	cn: '',
	sn: '',
	cname: '',
	hscode: '',
	mark: '',
	quantity: '',
	weight: '',
	volume: '',
	packageType: ''
}

export default {
	filters: {
		packageTypeFilter(packageType) {
			return getDictLabel('packageType', packageType)
		}
	},
	data() {
		return {
			formData: {
				boxId: (this.detailData && this.detailData.boxId) || undefined,
				yardId: (this.detailData && this.detailData.yardId) || '',
				yardName: (this.detailData && this.detailData.yardName) || '',
				yardAddress: (this.detailData && this.detailData.yardAddress) || '',
				yardContact: (this.detailData && this.detailData.yardContact) || '',
				yardContactPhone: (this.detailData && this.detailData.yardContactPhone) || '',
				chargeEmployeeId: (this.detailData && this.detailData.chargeEmployeeId) || '',
				chargeEmployee: (this.detailData && this.detailData.chargeEmployee) || {},
				cname: (this.detailData && this.detailData.chargeEmployee && this.detailData.chargeEmployee.cname) || '',
				chargePhone: (this.detailData && this.detailData.chargePhone) || '',
				chargeEmail: (this.detailData && this.detailData.chargeEmail) || '',
				boxRemark: (this.detailData && this.detailData.boxRemark) || '',
				packTime: (this.detailData && this.detailData.packTime) || ''
				// expectArrivalTime: this.detailData && this.detailData.expectArrivalTime || "",
				// yardBoxContainers: this.detailData && this.detailData.yardBoxContainers || []
			},
			inputItem: [
				{
					label: '堆场名称',
					key: 'yardId',
					prop: 'yardId',
					type: 'select',
					clearable: true,
					filterable: true,
					options: [{ label: (this.detailData && this.detailData.yardName) || '', value: (this.detailData && this.detailData.yardId) || '' }],
					visibleChange: (val, item) => {
						if (val) this.yardList('', item)
					},
					filterMethod: (queryString, item) => {
						this.yardList(queryString, item)
					},
					change: (val, item) => {
						if (val) {
							let sItem = item.options.find(o => o.value === val)
							Object.assign(this.formData, {
								yardName: sItem ? sItem.label : '',
								yardAddress: sItem ? sItem.address : '',
								yardContact: sItem ? sItem.contact : '',
								yardContactPhone: sItem ? sItem.contactPhone : ''
							})
						} else {
							Object.assign(this.formData, {
								yardName: '',
								yardAddress: '',
								yardContact: '',
								yardContactPhone: ''
							})
						}
					}
				},
				// {label: "堆场地址", key: "yardAddress", type: "input" },
				{ label: '堆场联系人', key: 'yardContact', prop: 'yardContact', type: 'input' },
				{ label: '堆场联系人电话', key: 'yardContactPhone', prop: 'yardContactPhone', type: 'input' },
				{
					label: '我司负责人',
					key: 'chargeEmployeeId',
					prop: 'chargeEmployeeId',
					type: 'select',
					clearable: true,
					filterable: true,
					options: [
						{
							label: (this.detailData && this.detailData.chargeEmployee && this.detailData.chargeEmployee.cname) || '',
							value: (this.detailData && this.detailData.chargeEmployeeId) || ''
						}
					],
					visibleChange: (val, item) => {
						if (val) this.employeeSelectlist('', item)
					},
					filterMethod: (queryString, item) => {
						this.employeeSelectlist(queryString, item)
					},
					change: (val, item) => {
						if (val) {
							let sItem = item.options.find(o => o.value === val)
							Object.assign(this.formData, {
								chargePhone: sItem ? sItem.mobileNo : '',
								chargeEmail: sItem ? sItem.email : ''
							})
						} else {
							Object.assign(this.formData, {
								chargePhone: '',
								chargeEmail: ''
							})
						}
					}
				},
				{ label: '我司负责人电话', key: 'chargePhone', prop: 'chargePhone', type: 'input' },
				{ label: '我司负责人邮箱', key: 'chargeEmail', prop: 'chargeEmail', type: 'input' },
				{ label: "装箱时间", key: "packTime", type: "dateLimit", inputType: "text" },
				{ label: '装箱要求', key: 'boxRemark', type: 'input', maxlength: '512' }
			],
			rules: {
				yardId: [{ required: true, message: '堆场名称不能为空', trigger: 'change' }],
				yardContact: [{ required: true, message: '堆场联系人不能为空', trigger: 'blur' }],
				yardContactPhone: [{ required: true, message: '堆场联系人电话不能为空', trigger: 'blur' }],
				chargeEmployeeId: [{ required: true, message: '我司负责人不能为空', trigger: 'change' }],
				chargePhone: [{ required: true, message: '我司负责人电话不能为空', trigger: 'blur' }],
				chargeEmail: [{ required: true, message: '我司负责人邮箱不能为空', trigger: 'blur' }]
			},
			yardBoxContainersId: '', // 作为区分是新增还是详情的标识
			yardDialogItem: {}, // 装箱明细弹窗详情
			showYardDialog: false, // 显示装箱明细弹窗
			tableData: [] // table列表数据
		}
	},
	props: {
		detailData: {
			type: Object,
			default: () => {
				{
				}
			}
		},
		saveBarFixed: {
			type: Boolean,
			default: false
		},
		isDisabledEdit: {
			type: Boolean,
			default: false
		},
		isOpTruckAndOpTip: {
			type: String,
			default: ''
		},
		isFinishTip: {
			type: String,
			default: ''
		},
		statusTip: {
			type: String,
			default: ''
		}
	},
	created() {
		if (this.detailData.yardBoxContainers) {
			this.arrTableData()
		}
		// console.log(this.detailData)
	},
	mounted() {},
	watch: {
		'detailData.boxId': {
			handler(newVal, oldVal) {
				// this.formData = {...newVal}
				for (let i in this.formData) {
					this.formData[i] = this.detailData[i]
				}
				this.arrTableData()
			},
			deep: true
		}
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo,
			custid: state => state.order.custid,
			ordDetRole: state => state.order.orderList.ordDetRole,
			userEditRoles: state => state.order.orderList.userEditRoles,
			serviceList: state => state.order.serviceList,
			serviceInfoList: state => state.order.serviceInfoList
		}),
		isOp() {
			return this.userEditRoles.includes('op') || this.userEditRoles.includes('line_cs')
		},
		isOpTruck() {
			return this.userEditRoles.includes('op_truck')
		},
		isBd() {
		  return !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'ac' || this.ordDetRole === 'doc' || this.isJoint || this.isFinish
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === this.serviceCode)
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
		isJoint() {
			let serviceInfo = this.serviceInfoList.find(item => item.serviceCode === 'pol_warehouse')
			let isJoint = serviceInfo ? serviceInfo.isJoint : ''
			return isJoint === 'y' ? true : false
		},
		styleObject() {
			// 顶部距离文档
			let offsetTop = document.querySelector('.tabs-container').offsetTop
			return this.saveBarFixed ? {
				left: '120px',
				top: offsetTop + 24 + 'px'
			} : {}
		},
		isJointTip() {
			if (this.isJoint) {
				return '该服务项被协同，不允许操作'
			}
		},
	},
	components: {
		FormItem,
		YardDialog
	},
	methods: {
		// 初始化表格数据
		arrTableData() {
			this.tableData = []
			this.detailData &&
				this.detailData.yardBoxContainers &&
				this.detailData.yardBoxContainers.forEach(item => {
					item.boxContainerId_copy = item.boxContainerId_copy ? item.boxContainerId_copy : item.boxContainerId || item.so + Math.random() * 10
					let data = Object.assign({}, item, { length: item.yardBoxCargos.length })
					if (item.yardBoxCargos && item.yardBoxCargos.length) {
						item.yardBoxCargos.forEach((o, index) => {
							o.boxContainerId_copy = o.boxContainerId_copy ? o.boxContainerId_copy : data.boxContainerId || item.so + Math.random() * 10
							let tempData = Object.assign({}, o)
							if (index == 0) {
								// console.log(data)
								Object.assign(tempData, data)
							}
							this.tableData.push(tempData)
						})
					} else {
						this.tableData.push(
							Object.assign({}, DefaultTableComp, {
								containerId: item.containerId,
								oid: item.oid,
								boxContainerId_copy: item.boxContainerId_copy,
								cn: item.cn,
								containerType: item.containerType,
								length: item.yardBoxCargos.length,
								sn: item.sn,
								so: item.so,
								yardBoxCargos: item.yardBoxCargos
							})
						)
						// this.tableData.push(Object.assign({}, DefaultTableComp, data))
					}
				})

			// this.detailData && this.detailData.yardBoxContainers && this.detailData.yardBoxContainers.forEach(item => {
			//   // item.boxContainerId_copy = item.boxContainerId_copy?item.boxContainerId_copy : (item.boxContainerId || parseInt(item.so + (Math.random()*10)))
			//   let data = Object.assign({}, item, {length: item.yardBoxCargos.length})
			//   if(item.yardBoxCargos && item.yardBoxCargos.length > 0){
			//     item.yardBoxCargos.forEach((o, index) => {
			//       // o.boxContainerId_copy = o.boxContainerId_copy? o.boxContainerId_copy : (data.boxContainerId || parseInt(item.so + (Math.random()*10)))
			//       if(index == 0) Object.assign(o, data)
			//       this.tableData.push(o)
			//     })
			//   }else {
			//     this.tableData.push(Object.assign({}, DefaultTableComp, data))
			//   }
			// })
			console.log('tableData:', this.tableData)
		},
		// 合并单元格
		objectSpanMethod({ row, column, rowIndex, columnIndex }) {
			if (columnIndex < 4 || columnIndex == 11) {
				if (row.length || row.length === 0) {
					return {
						rowspan: row.length === 0 ? 1 : row.length,
						colspan: 1
					}
				} else {
					return {
						rowspan: 0,
						colspan: 0
					}
				}
			}
		},
		// 装箱明细dialog回调
		addYardBackFunc(data) {
			console.log('回调', data)
			if (this.yardBoxContainersId !== '') {
				this.detailData.yardBoxContainers.forEach((item, index) => {
					// if (item.boxContainerId_copy === data.boxContainerId_copy) Object.assign(item, data)
					this.yardBoxContainersId === index && Object.assign(item, data)
				})
			} else {
				this.detailData.yardBoxContainers = this.detailData.yardBoxContainers || []
				// this.detailData.yardBoxContainers.push(data)
				this.detailData.yardBoxContainers.push(Object.assign(data, { boxContainerId_copy: data.so + Math.random() * 10 }))
			}
			console.log(this.detailData.yardBoxContainers)
			this.arrTableData()
		},
		// 新增装箱明细
		handleAdd(type) {
			this.yardDialogItem = {}
			this.yardBoxContainersId = ''
			this.showYardDialog = true
		},
		// 详情-装箱明细
		handleInfo(row, index) {
			console.log(index, this.detailData.yardBoxContainers)
			// this.yardDialogItem = this.detailData.yardBoxContainers.filter(item => item.boxContainerId_copy === row.boxContainerId_copy)[0]
			this.yardDialogItem = this.tableData[index]
			this.yardBoxContainersId = index
			this.showYardDialog = true
		},
		// 删除装箱明细
		handleDelete(row, index) {
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					//this.tableData.splice(index, 1)
					// this.detailData.yardBoxContainers = this.detailData.yardBoxContainers.filter(item => {
					// 	return item.boxContainerId_copy !== row.boxContainerId_copy
					// })
					this.detailData.yardBoxContainers.splice(index, 1)
					console.log('delete', this.detailData.yardBoxContainers)
					this.arrTableData()
				})
				.catch(() => {})
		},
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
			// if (values.some(item => !reg.test(item.weight))) {
			//   this.$message({type: 'error', message: '请输入正确的毛重'})
			//   return false
			// }
			// if (values.some(item => !reg.test(item.volume))) {
			//   this.$message({type: 'error', message: '请输入正确的体积'})
			//   return false
			// }
			if (values.some(item => !item.packageType)) {
				this.$message({ type: 'error', message: '包装不能为空' })
				return false
			}
			return true
		},
		// 表头按钮回调
		callBack(type) {
			let data = {}
			if (type == 'save') {
				this.$refs.form.validate(valid => {
					if (valid) {
						data = Object.assign({}, this.formData, {
							yardBoxContainers: this.detailData.yardBoxContainers || []
						})
						console.log('submit', data)
						if (!data.yardBoxContainers.length) {
							return this.$message({ type: 'error', message: '缺少装箱明细' })
						}
						if (!this.validate(this.tableData)) return
						data.yardBoxContainers.map(item => {
							item.yardBoxCargos && item.yardBoxCargos.map(o => o.yardBoxCargos && delete o.yardBoxCargos)
						})
						data.type = type
						this.$emit('callBack', data)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				data.type = type
				this.$emit('callBack', data)
			}
		},
		// 堆场模糊查询
		yardList(queryString, item) {
			yardList({ name: queryString }).then(res => {
				item.options =
					res.data &&
					res.data.list.map(o => {
						return Object.assign(o, {
							label: o.name,
							value: o.yardId
						})
					})
			})
		},
		// 员工模糊查询
		employeeSelectlist(queryString, item) {
			let data = {
				state: 'valid',
				name: queryString
			}
			employeeSelectlist(data).then(res => {
				let list = res.data
				if (list && list.length) {
					item.options = list.map(item => {
						return Object.assign(item, {
							label: this.$language === 'en' ? item.ename : item.cname,
							value: item.employeeId
						})
					})
				} else {
					item.options = []
				}
			})
		},
		closeDialog() {
			this.showYardDialog = false
		}
	}
}
</script>
<style lang="scss">
.yardBoxDetail {
	border-top: 12px solid #f5f7f9;
	.info-tit{
		display: flex;
		justify-content: space-between;
		height: 40px;
    line-height: 20px;
    margin-bottom: 10px;
		padding: 10px 20px !important;
		border-bottom: 1px solid #e9e9e9;
		.tit{
			line-height: 20px !important;
			font-weight: bold;
			font-size: 12px;
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
	.el-checkbox__label {
		display: inline-block;
		padding-left: 6px;
		line-height: 19px;
		font-size: 12px;
	}
	.el-table--border td {
		border-right: 1px solid #dfe6ec !important;
	}
	.row-body {
		padding: 10px 20px;
		.el-form-item__content {
			margin-right: 10px;
		}
		.el-form-item__label {
			padding: 0;
			text-align: right;
			padding-right: 4px;
		}
		.row-tit,
		.row-table {
			padding: 0 !important;
		}
		.el-form-item{
			margin-bottom: 4px !important;
		}
		.el-form-item__label, .el-form-item__content{
			line-height: 20px;
		}
		.soContainer-tit{
			display: flex;
			justify-content: space-between;
			height: 40px;
			line-height: 20px;
			padding: 10px 0 !important;
			.tit{
				line-height: 20px !important;
				font-weight: bold;
				font-size: 12px;
			}
	}
	}
	.operateBtn-tip{
		padding: 0; 
		display: inline-block;
	}
}
</style>
