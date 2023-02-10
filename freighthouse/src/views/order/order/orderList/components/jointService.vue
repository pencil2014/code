<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<div class="joint-service-cont">
			<div class="between h20">
				<div class="ft14"></div>
				<el-button type="primary" size="mini" @click="handleCreateJoint">添加协同信息</el-button>
			</div>
			<el-table fit highlight-current-row style="width: 100%" :data="jointServiceList" class="joint-service-table">
				<el-table-column prop="companyName" label="协同公司" align="center"> </el-table-column>
				<el-table-column prop="serviceName" label="协同项" align="center"> </el-table-column>
				<el-table-column prop="employeeName" label="协同人员" align="center"> </el-table-column>
				<el-table-column prop="jointNo" label="协同单号" align="center" width="150px"> </el-table-column>
				<el-table-column prop="serviceStatus" label="服务项状态" align="center">
					<template slot-scope="scope">
						{{ scope.row.serviceStatus | serviceStatusFilter }}
						<span v-if="scope.row.serviceStatus === 'cancel'">({{ scope.row.cancelReason | cancelReasonFilter }})</span>
						<span v-if="scope.row.serviceStatus === 'refuse'">({{ scope.row.refuseReason | refuseReasonFilter }})</span>
					</template>
				</el-table-column>
				<el-table-column prop="cancelApplyStatus" label="撤回状态" align="center">
					<template slot-scope="scope">
						{{ scope.row.cancelApplyStatus | cancelApplyStatusFilter }}
					</template>
				</el-table-column>
				<!-- <el-table-column prop="remark" label="协同备注" align="center" width="200px"> </el-table-column> -->
				<el-table-column label="操作" width="100" align="center" fixed="right">
					<template slot-scope="scope">
						<div class="operate-group">
							<!-- <el-button @click="handleJointDelete(scope.row)" type="text" size="mini">删除</el-button> -->
							<el-button @click="handleOpenJointCancelPop(scope.row)" type="text" size="mini" v-if="!scope.row.cancelApplyStatus && ['init', 'processing'].includes(scope.row.serviceStatus)">撤回</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<!-- 新增 -->
		<template v-if="showJointService">
			<div class="joint-form-cont">
				<div class="between tit">
					<div class="lab">添加协同信息</div>
					<div class="">
						<el-button type="primary" size="mini" :loading="formSubmiting" @click="handleSave">保存</el-button>
						<el-button type="default" size="mini" @click="handleCancel">取消</el-button>
					</div>
				</div>
				<div class="">
					<el-form :model="createJointItem" ref="jointForm" :rules="jointRules" label-width="70px" class="row-flex">
						<el-row>
							<el-col :span="12">
								<el-form-item label="协同公司" prop="companyCode" :show-message="false">
									<el-select size="mini" v-model="createJointItem.companyCode" style="width: 100%" clearable filterable placeholder="请选择" @change="handleChangeCompany">
										<el-option v-for="item in companyListOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
									</el-select>
								</el-form-item>
							</el-col>
							<el-col :span="6">
								<el-form-item label="协同项" prop="serviceCode" :show-message="false">
									<el-select size="mini" v-model="createJointItem.serviceCode" style="width: 100%" clearable placeholder="请选择" @change="handleChangeServiceCode">
										<el-option v-for="(item, index) in serviceListOptions" :disabled="['book', 'proxy_book', 'proxy_whbook', 'whbook'].includes(item.serviceCode)" :key="index" :label="item.serviceName" :value="item.serviceCode"> </el-option>
									</el-select>
								</el-form-item>
							</el-col>
							<el-col :span="6">
								<el-form-item label="协同人员" prop="employeeId" :show-message="false">
									<el-select
										size="mini"
										remote
										filterable
										clearable
										v-model="createJointItem.employeeId"
										style="width: 100%"
										placeholder="请选择"
										@visible-change="
											val => {
												visibleChange(val)
											}
										"
										:filter-method="
											val => {
												filterMehod(val)
											}
										"
										@change="
											val => {
												handleChangeEmployee(val)
											}
										"
									>
										<el-option v-for="o in employeeOptions" :key="o.employeeId" :label="o.cname" :value="o.employeeId"> </el-option>
									</el-select>
								</el-form-item>
							</el-col>
							<el-col :span="24">
								<el-form-item label="协同备注" prop="remark">
									<el-input type="textarea" :rows="3" size="mini" v-model="createJointItem.remark" style="width: 100%" clearable placeholder="请输入协同备注" maxlength="512" show-word-limit> </el-input>
								</el-form-item>
							</el-col>
						</el-row>
					</el-form>
				</div>
			</div>
		</template>
		<!-- 嵌套撤回弹窗 -->
		<el-dialog width="40%" title="协同撤回" :visible.sync="innerVisible" append-to-body custom-class="joint-cancel-dialog">
			<el-form ref="calcelForm" :rules="rules" :model="cancelItem" label-position="right" label-width="70px" class="create-form">
				<el-form-item label="撤回原因" prop="cancelReason" :show-message="false">
					<el-select v-model="cancelItem.cancelReason" size="mini" clearable placeholder="请选择" @change="handleSelectReason" style="width: 100%">
						<el-option v-for="(item, index) in dictMap.jointCancelReason" :label="item.label" :value="item.value" :key="index"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="撤回备注" prop="cancelRemark">
					<el-input type="textarea" size="mini" :rows="4" placeholder="请输入" v-model="cancelItem.cancelRemark"></el-input>
				</el-form-item>
			</el-form>
			<div class="ali-rt">
				<el-button size="mini" type="default" @click="innerVisible = false">取消</el-button>
				<el-button size="mini" type="primary" @click="handleJointCancel">确定</el-button>
			</div>
		</el-dialog>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'
import { baseEmployeeListName, baseCompanyList, baseCompanySettleList, baseBusinessServiceList, baseDeptSettleList, baseDeptParticipants } from '@/api/base'
import { orderJointServiceList, orderJointServiceCreate, orderJointServiceDelete, orderJointServiceCancel } from '@/api/order/list'
import { orderFileList } from '@/api/order/book/list'
const defaultCreateJointQuery = {
	companyCode: '', // 公司编号
	serviceCode: '', // 服务项编号
	employeeId: '', // 员工ID
	remark: '' // 撤回备注
}

export default {
	filters: {
		cancelApplyStatusFilter(cancelApplyStatus) {
			return getDictLabel('serviceCancelStatus', cancelApplyStatus)
		},
		serviceStatusFilter(status) {
			return getDictLabel('serviceStatus', status)
		},
		cancelReasonFilter(cancelReason) {
			return getDictLabel('jointCancelReason', cancelReason)
		},
		refuseReasonFilter(refuseReason) {
			return getDictLabel('jointRefuseReason', refuseReason)
		}
	},
	data() {
		return {
			dialogConfig: {
				title: '协同详情',
				show: true,
				showBtns: false, // 隐藏el-dialog底部操作按钮
				size: 'medium',
				width: '1120px'
			},

			showJointService: false, // 协同信息详情
			jointServiceList: [],
			createJointItem: Object.assign({}, defaultCreateJointQuery),
			formSubmiting: false,

			// 下拉数据
			companyListOptions: [],
			serviceListOptions: [],
			employeeOptions: [],

			// 嵌套协同撤回弹窗
			innerVisible: false,
			rules: {
				cancelReason: [{ required: true, message: '请选择撤回原因', trigger: 'change' }]
			},
			cancelItem: {
				id: '',
				orderNo: '',
				jointNo: '',
				cancelReason: '',
				cancelRemark: ''
			},
			roleCode: '', // 角色岗位代码
			jointRules: {
				companyCode: [{ required: true, message: '请选择协同公司', trigger: 'change' }],
				serviceCode: [{ required: true, message: '请选择服务项', trigger: 'change' }],
				employeeId: [{ required: true, message: '请选择协同人员', trigger: 'change' }]
			},
			notJointService: ['book', 'proxy_book', 'proxy_whbook', 'whbook'] // 不可协同的服务项: 'pod_change_doc', 'pod_comm_clearance', 'pod_fcl_delivery', 'pod_warehouse', 'pod_wh_matter', 'pod_ltl_delivery'
		}
	},
	props: {
		createItem: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		this.serviceListOptions = this.createItem.serviceInfoList.filter(item => !this.notJointService.includes(item.serviceCode))
		this.getJointServiceList()
		this.getCompanyList()
		//this.getServiceTypes()
		// this.getFileList()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo
		})
	},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
		getFileList() {
			let query = [
				{ column: 'orderNo', type: 'eq', value: this.$route.query.orderNo },
				{ column: 'typeCode', type: 'in', value: 'afr,ams,emain,isf,ocean_manifest' }
			]
			let listQuery = {
				columns: [],
				ascColumns: [],
				descColumns: [],
				query,
				pageSize: -1,
				currPage: 1
			}
			// 舱单附件
			orderFileList(listQuery).then(res => {
				let { list } = res.data
				if (!res.data || (Array.isArray(list) && !list.length)) {
					this.serviceListOptions = this.serviceListOptions.filter(item => item.serviceCode !== 'ocean_manifest')
				}
			})
		},
		// 获取所有公司
		getCompanyList() {
			baseDeptSettleList().then(res => {
				this.companyListOptions = res.data
					// .filter(item => !item.deptCname.includes('鼎帆')) // 过滤掉深圳市鼎帆供应链
					.filter(item => item.deptCode != '000039') // 过滤掉深圳市鼎帆供应链 显示上海
					.map(item => {
						return Object.assign({}, item, {
							// label: item.name,
							// value: item.companyCode
							label: item.deptCname,
							value: item.deptCode
						})
					})
			})
		},

		// 获取服务项列表
		// getServiceTypes() {
		//   let param = {
		//     businessType: this.createItem.businessType,
		//     serviceType: this.createItem.serviceType,
		//   }

		//   baseBusinessServiceList(param).then(res => {
		//     this.serviceListOptions = res.data
		//     console.log(res.data)
		//   })
		// },

		// 选择分公司
		handleChangeCompany() {
			this.createJointItem.employeeId = ''
		},

		// 选择服务项
		handleChangeServiceCode(val) {
			this.createJointItem.employeeId = ''
			let tempItem = this.serviceListOptions.find(item => item.serviceCode === val)
			this.roleCode = tempItem ? tempItem.jobCode : ''
		},

		// 下拉搜索自定义查询
		filterMehod(val) {
			this.getEmployeeName(val)
		},

		// 下拉展开
		visibleChange(val) {
			if (val) {
				this.getEmployeeName()
			} else {
			}
		},

		// 选中协同人员下拉
		handleChangeEmployee(val) {
			console.log(this.createJointItem)
		},

		// 获取姓名
		getEmployeeName(val = '') {
			let data = {
				name: val ? val.replace(/^\s+|\s+$/g, '') : '',
				deptCode: this.createJointItem.companyCode,
				roleCode: this.roleCode
			}
			baseDeptParticipants(data, true).then(res => {
				this.employeeOptions = res.data
				// this.employeeOptions = res.data.filter(item => item.status === 'on')
			})
		},

		// 协同信息列表
		getJointServiceList() {
			orderJointServiceList({ orderNo: this.$route.query.orderNo }).then(res => {
				this.jointServiceList = res.data
			})
		},

		// 添加协同信息
		handleCreateJoint() {
			this.showJointService = true
			this.formSubmiting = false
			Object.assign(this.createJointItem, {}, defaultCreateJointQuery)
		},

		// 删除
		handleJointDelete(row) {
			let data = {
				orderNo: this.$route.query.orderNo,
				id: row.id,
				jointNo: row.jointNo
			}

			this.$confirm('是否确认删除该条协同信息?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return orderJointServiceDelete(data)
				})
				.then(response => {
					this.getJointServiceList()
					this.$message({ message: '删除成功', type: 'success' })
				})
				.catch(() => {})
		},

		// 打开撤回弹窗
		handleOpenJointCancelPop(row) {
			this.innerVisible = true
			this.cancelItem.cancelReason = ''
			this.cancelItem.cancelRemark = ''
			this.cancelItem.orderNo = this.$route.query.orderNo
			this.cancelItem.id = row.id
			this.cancelItem.jointNo = row.jointNo
		},

		// 选择原因
		handleSelectReason(val) {},

		// 撤回
		handleJointCancel() {
			this.$refs.calcelForm.validate(valid => {
				if (valid) {
					orderJointServiceCancel(this.cancelItem).then(res => {
						this.$message({
							type: 'success',
							message: '发起撤回成功',
							duration: 1000,
							onClose: () => {
								this.innerVisible = false
								this.getJointServiceList()
							}
						})
					})
				} else {
					console.log('error submit!!')
					return false
				}
			})
		},

		// 打开撤回弹窗
		handleCancel() {
			this.formSubmiting = false
			this.showJointService = false
		},

		// 保存
		handleSave() {
			this.formSubmiting = true
			this.createJointItem.orderNo = this.$route.query.orderNo

			// if (!this.validate()) return (this.formSubmiting = false)
			this.$refs.jointForm.validate(valid => {
				if (valid) {
					orderJointServiceCreate(this.createJointItem)
						.then(res => {
							this.$message({
								type: 'success',
								message: '创建成功',
								duration: 1000,
								onClose: () => {
									this.formSubmiting = false
									this.showJointService = false
									this.getJointServiceList()
								}
							})
						})
						.catch(error => {
							this.formSubmiting = false
						})
				} else {
					this.formSubmiting = false
					console.log('error submit!!')
					return false
				}
			})
		},

		validate() {
			if (!this.createJointItem.companyCode) {
				this.$message.warning('请选择协同公司')
				return false
			}
			if (!this.createJointItem.serviceCode) {
				this.$message.warning('请选择协同项')
				return false
			}
			if (!this.createJointItem.employeeId) {
				this.$message.warning('请选择协同人员')
				return false
			}
			return true
		},

		dialogCallback(action, done) {
			if (action === 'Confirm') {
			} else {
				this.close('Cancel')
			}
		},

		close(action) {
			this.$emit('close', action)
		}
	}
}
</script>

<style lang="scss">
.joint-service-cont {
	.joint-service-table {
		margin-top: 4px;
		th,
		td {
			padding: 4px 0;
		}
	}
}
.joint-form-cont {
	border: 1px solid #e9e9e9;
	border-radius: 2px;
	margin-top: 10px;
	.tit {
		height: 24px;
		line-height: 24px;
		background-color: #f8f9fd;
		padding: 0 8px;
		.lab {
			font-size: 12px;
			font-weight: bold;
			line-height: 24px;
		}
	}
	.row-flex {
		margin: 10px 0 10px 10px;
	}
	.el-form-item {
		margin-bottom: 4px;
	}
	.el-form-item__label {
		padding-right: 4px;
	}
	.el-form-item__content {
		margin-right: 10px;
	}
	.el-form-item__label,
	.el-form-item__content {
		line-height: 20px;
	}
}
</style>
