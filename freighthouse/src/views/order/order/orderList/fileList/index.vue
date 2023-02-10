<template>
	<div class="edit-container order-book fullWrap" id="fileList">
		<div class="order-container">
			<!-- 订单已取消提示 -->
			<CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
			<!-- 订单拒绝提示 -->
			<RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
			<div class="tabs-container">
				<TopNav :serviceType="orderInfo.serviceType" :activityKey="activityKey" :custid="orderInfo.custid" @routerPush="handleToRoute" />
				<div class="detail-container flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="activityKey" @routerPush="handleToRoute" @getOceanManifestIsJoint="getOceanManifestIsJoint" />
					<div class="flex1 component-main-cont">
						<div class="service-container">
							<CustInfo :orderInfo="orderInfo" />
							<div class="fileList-cont table-com-layout" style="margin-top: 0">
								<el-tabs v-model="fileStatus" @tab-click="getFileList">
									<el-tab-pane label="有效" name="effect"></el-tab-pane>
									<el-tab-pane label="无效" name="no_effect"></el-tab-pane>
								</el-tabs>

								<div class="fileList-row">
									<div class="ft14">附件列表</div>
									<div>
										<el-button type="primary" size="mini" @click="handleBatchDown" v-if="fileList.length && fileStatus === 'effect'" :loading="downloadLoading">批量下载</el-button>
										<el-button type="primary" size="mini" @click="handleAdd" v-if="isEditView && fileStatus === 'effect'">新增附件</el-button>
										<el-button type="primary" size="mini" @click="handleCommand">常用保函下载</el-button>
									</div>
								</div>
								<el-table
									style="width: 100%"
									fit
									highlight-current-row
									:data="fileList"
									@selection-change="handleSelectionChange"
									v-loading="lsLoading"
									:element-loading-text="eLoadingText"
									:element-loading-spinner="eLoadingSpinner"
									:element-loading-background="eLoadingBackground"
								>
									<!-- <el-table-column prop="fileNo" label="附件编号" align="left" width="260px"> </el-table-column> -->
									<el-table-column type="selection" :selectable="selected" width="55"> </el-table-column>
									<el-table-column width="100px" prop="serviceName" label="业务模块" align="left"> </el-table-column>
									<el-table-column width="200px" prop="typeName" label="附件类别" align="left"> </el-table-column>
									<el-table-column prop="name" label="附件名称" align="left" min-width="200px">
										<template slot-scope="scope">
											<div class="operate-group">
												<el-button type="text" size="mini" v-if="!scope.row.name || !scope.row.fileNo">
													<el-tooltip class="item" effect="dark" placement="top-start" :content="bookReleaseCheckMsg">
														<span class="file-disabled-style width-100">{{ scope.row.name }}</span>
													</el-tooltip>
												</el-button>
												<el-button @click="handleView(scope.row)" type="text" size="mini" v-else>
													<el-tooltip class="item" effect="dark" :content="scope.row.name" placement="top-start">
														<span class="file-name-style">{{ scope.row.name }}</span>
													</el-tooltip>
												</el-button>
											</div>
										</template>
									</el-table-column>
									<el-table-column prop="size" label="附件大小(kb)" align="left" width="120px"> </el-table-column>
									<el-table-column prop="createdName" label="上传人" align="left" width="150px"> </el-table-column>
									<el-table-column prop="createdTime" label="上传时间" align="left" min-width="160px"> </el-table-column>
									<el-table-column prop="auditEmployeeName" label="审核人" align="center" width="150px"> </el-table-column>
									<el-table-column prop="auditEmployeeDeptName" label="审核人部门" align="center" width="150px"> </el-table-column>
									<el-table-column prop="auditTime" label="审核时间" align="center" width="150px"> </el-table-column>
									<el-table-column prop="auditStatus" label="审核状态" align="center" width="100px">
										<template slot-scope="scope">
											<span v-if="scope.row.auditStatus === 'SUBMIT'">待审核</span>
											<span v-if="scope.row.auditStatus === 'PASS'">通过</span>
											<span v-if="scope.row.auditStatus === 'REFUSE'">拒绝</span>
										</template>
									</el-table-column>
									<el-table-column prop="auditRemark" label="审核备注" align="center" width="200"></el-table-column>
									<el-table-column v-if="fileStatus === 'no_effect'" prop="updatedName" label="失效人" align="center" width="150"></el-table-column>
									<el-table-column v-if="fileStatus === 'no_effect'" prop="updatedTime" label="失效时间" align="center" width="150"></el-table-column>
									<el-table-column v-if="fileStatus === 'effect'" label="操作" width="180" align="left" fixed="right">
										<template v-if="fileStatus === 'effect'" slot-scope="scope">
											<div class="operate-group">
												<template v-if="scope.row.auditStatus === 'SUBMIT'">
													<ButtonTip :btnDisabled="scope.row.auditEmployeeId !== userId" btnText="通过" btnType="text" tipContent="非审核人，不允许该操作" class="table-operateBtn-tip" @click="handleAudit(scope.row, 'PASS')"></ButtonTip>
													<ButtonTip
														:btnDisabled="scope.row.auditEmployeeId !== userId"
														btnText="拒绝"
														btnType="text"
														tipContent="非审核人，不允许该操作"
														btnClassName="red"
														class="table-operateBtn-tip"
														@click="handleAudit(scope.row, 'REFUSE')"
													></ButtonTip>
												</template>
												<!-- <el-button v-if="scope.row.auditStatus==='SUBMIT'" :disabled="scope.row.auditEmployeeId !== userId" @click="handleAudit(scope.row,'PASS')" type="text" size="mini" style="padding:0">通过</el-button>
                        <el-button v-if="scope.row.auditStatus==='SUBMIT'" :disabled="scope.row.auditEmployeeId !== userId" @click="handleAudit(scope.row,'REFUSE')" type="text" class="red" size="mini" style="padding:0">拒绝</el-button> -->
												<el-button v-if="scope.row.createdBy === userId && (scope.row.auditStatus === 'PASS' || scope.row.auditStatus === 'REFUSE')" @click="handleInvalid(scope.row)" type="text" size="mini" style="padding: 0">失效</el-button>
												<span v-if="scope.row.name">
													<el-tooltip effect="dark" placement="top-start" v-if="noCanDownload(scope.row)" :content="bookReleaseCheckMsg">
														<el-button type="text" size="mini" class="file-disabled-style-con">下载</el-button>
													</el-tooltip>
													<el-button @click="handleDownload(scope.row)" type="text" size="mini" v-else>下载</el-button>
												</span>
												<el-button
													@click="handleDelete(scope.row)"
													type="text"
													class="red"
													size="mini"
													v-if="!scope.row.isProhibitDel && !(scope.row.serviceCode === 'ocean_manifest' && oceanManifestIsJoint) && isEditView && isEditView && isSelfFile(scope.row) && bookingDelStatus(scope.row)"
													>删除</el-button
												>
											</div>
										</template>
									</el-table-column>
								</el-table>
							</div>
							<!-- 上传 -->
							<div v-if="uploadPopShow">
								<FileUpload @close="uploadPopClose" :isAc="isAc" :compensaAgreementIsEditView="compensaAgreementIsEditView" :oceanManifestIsJoint="oceanManifestIsJoint" :orderInfo="orderInfo" />
							</div>
							<div v-if="auditPopShow">
								<AuditDialog @close="auditPopClose" />
							</div>
							<div v-if="exportEntrustedPopShow">
								<exportEntrustedPop @close="exportPopClose" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import { mapState, mapGetters } from 'vuex'
import { getServicChilds, getDictLabel, getServiceCode } from '@/utils/tools'
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { jointWork, orderInfo, orderJointInfo, orderFileList, orderFileDelete, bookReleaseCheck, fileAudit, fileNoeffect, fileWmsList } from '@/api/order/list'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import CustInfo from '../components/custInfo'
import FileUpload from './components/fileUpload'
import AuditDialog from '@/views/airTransport/order/orderList/fileList/components/auditDialog'
import exportEntrustedPop from './components/exportEntrustedPop'
export default {
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			exportEntrustedPopShow: false,
			fileStatus: 'effect',
			auditPopShow: false,
			auditType: '',
			auditDate: null,
			oQuery: this.$route.query,
			fileList: [],
			resList: [],
			uploadPopShow: false,
			activityKey: 'FileList',
			oceanManifestIsJoint: false, // 舱单服务是否协同
			bookReleaseCheck: false, // 放舱检验标识
			bookReleaseCheckMsg: '', // 放舱检验信息
			dnBillTypeList: ['dn', 'dn_back', 'dn_back_empty', 'dn_change', 'dn_import_bill', 'dn_local'], // bd,obd,asst需要屏蔽掉海运账单附件类型
			billOfLoadingRoleList: ['pricing', 'csc', 'ac', 'eac'], // 单证人员从补料详情、船东账单列表上传的账单附件，调整为仅商务、单证、财务岗位可以查看
			multipleSelection: [],
			downloadLoading: false,
			jointWorkData: []
		}
	},
	created() {
		this.getOrderInfo()
		// this.getFileList()
		this.getBookReleaseCheck()
		this.getJointWork()
	},
	mounted() {
		if (window.history && window.history.pushState) {
			history.pushState(null, null, document.URL)
			window.addEventListener('popstate', this.browserBack, false)
		}
	},
	destroyed() {
		window.removeEventListener('popstate', this.browserBack, false)
	},
	computed: {
		...mapGetters(['dictMapObj']),
		...mapState({
			roles: state => state.user.roles,
			userId: state => state.user.userId
		}),
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isEpricing() {
			return this.userEditRoles.includes('epricing')
		},
		isEcs() {
			return this.userEditRoles.includes('ecs')
		},
		isJointWork() {
			return this.jointWorkData.some(item => item.employeeId === this.userId)
		},
		isEditView() {
			return (
				this.isEpricing ||
				this.isEcs ||
				this.ordDetRole === 'bd' ||
				this.ordDetRole === 'obd' ||
				this.ordDetRole === 'op' ||
				this.ordDetRole === 'doc' ||
				this.ordDetRole === 'op_truck' ||
				this.ordDetRole === 'ac' ||
				this.roles.includes('eac') ||
				this.isJointWork
			)
		},
		compensaAgreementIsEditView() {
			// 订单的销售、销售助理、下单助理、操作岗位人员，以及对应的管理者 可以上传 “应收赔偿协议”、“应付赔偿协议”附件；
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'asst' || this.ordDetRole === 'op' || (this.ordDetRole === 'doc' && this.orderInfo.businessType === 'ship_oversea_wh')
		},
		// 用户含有bd,obd,asst
		isSales() {
			return this.userEditRoles.includes('bd') || this.userEditRoles.includes('obd') || this.userEditRoles.includes('asst')
		}
	},
	watch: {
		// resList: {
		// 	handler(newVal) {
		// 		if (this.userEditRoles.includes('bd') || this.userEditRoles.includes('obd') || this.userEditRoles.includes('asst')) {
		// 			this.fileList = newVal.filter(item => !this.dnBillTypeList.includes(item.typeCode))
		// 		} else {
		// 			this.fileList = newVal
		// 		}
		// 	},
		// 	deep: true,
		// 	immediate: true
		// }
	},
	components: {
		CancelAlert,
		RefuseAlert,
		TopNav,
		LeftNav,
		CustInfo,
		FileUpload,
		AuditDialog,
		exportEntrustedPop
	},
	methods: {
		handleCommand() {
			this.exportEntrustedPopShow = true
		},
		exportPopClose(action, value) {
			if (action === 'Confirm') {
				this.handleExport(value)
			} else {
				this.exportEntrustedPopShow = false
			}
		},
		handleExport(obj) {
			console.log('🚀 ~ obj', obj)
			let params = {
				...obj,
				orderNo: this.$route.query.orderNo
			}
			this.$store
				.dispatch('order/exportBlobFile', {
					uri: '/order/shiporder/file/downloadGuarantee',
					data: params
				})
				.then(res => {
					console.log(res)

					this.exportEntrustedPopShow = false
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = `${params.orderNo}${this.dictMapObj.downloadGuaranteeType[params.guaranteeType]}.doc`
					link.click()
				})
		},
		// 获取协同岗位分配
		getJointWork() {
			jointWork({
				orderNo: this.$route.query.orderNo
			}).then(res => {
				if (res.data && res.data.length) {
					res.data.forEach(item => {
						this.jointWorkData = this.jointWorkData.concat(item.jobUserList)
					})
				}
			})
		},
		isSelfFile(row){
			// 自己上传附件才能删除
			return row.createdBy === this.userId
		},
		bookingDelStatus(row){
			// 非托书过。。托书附件未审核和审核拒绝时候可以删除啊
			if(!['booking','cust_booking','ls_booking'].includes(row.typeCode)){
				return true
			}else{
				return !row.auditStatus || row.auditStatus === 'REFUSE' || row.auditStatus === 'SUBMIT'
			}
		},
		isBookingSelf(row) {
			return (
				row.createdBy === this.userId && // 附件上传人是否是当前登录人
				row.auditStatus === 'SUBMIT' && // 未审核
				['booking','cust_booking','ls_booking'].includes(row.typeCode)
			) // 托书
		},
		handleInvalid(row) {
			fileNoeffect([row.oid]).then(res => {
				this.$message.success('该附件已执行失效')
				this.getFileList()
			})
		},
		noCanDownload(row) {
			return !this.bookReleaseCheck && ['st01', 'st15', 'st09'].includes(this.orderInfo.serviceType) && row.typeCode === 'so'
		},
		selected(row) {
			return !this.noCanDownload(row)
		},
		auditPopClose(action, value) {
			if (action === 'Confirm') {
				let data = {
					orderNo: this.$route.query.orderNo,
					fileNo: this.auditDate.fileNo,
					auditStatus: this.auditType,
					auditRemark: value
				}
				fileAudit(data).then(res => {
					this.$message({
						type: 'success',
						message: `审核成功`,
						duration: 1000,
						onClose: () => {
							this.getFileList()
							this.auditPopShow = false
						}
					})
				})
			} else {
				this.auditPopShow = false
			}
		},
		handleAudit(row, type) {
			this.auditType = type
			this.auditDate = row
			if (type === 'REFUSE') {
				this.auditPopShow = true
			} else {
				let txt = ''
				if (row.bkAttentionCheckStatus === 'fail') {
					txt = `请注意，该${row.typeName}的“注意事项”的内容跟我司格式件里的不一致，是否确定要审核通过？`
				} else {
					txt = `确定要通过该条${row.typeName}吗?`
				}
				this.$confirm(txt, '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				})
					.then(() => {
						let data = {
							orderNo: this.$route.query.orderNo,
							fileNo: this.auditDate.fileNo,
							auditStatus: this.auditType
						}
						fileAudit(data).then(res => {
							this.$message({
								type: 'success',
								message: `审核成功`,
								duration: 1000,
								onClose: () => {
									this.getFileList()
								}
							})
						})
					})
					.catch(() => {})
			}
		},
		// 获取订单详情
		getOrderInfo() {
			let { source, orderNo, jointNo } = this.$route.query
			if (jointNo) {
				return orderJointInfo({ jointNo: jointNo }).then(res => {
					this.orderInfo = res.data
					this.setServiceList(res.data.serviceList)
					this.setServiceInfoList(res.data.serviceInfoList)
					this.getInit()
				})
			}
			orderInfo({ orderNo: orderNo }).then(res => {
				this.orderInfo = res.data
				this.setServiceList(res.data.serviceList)
				this.setServiceInfoList(res.data.serviceInfoList)
				this.getInit()
			})
		},
		getInit() {
			if (!this.orderInfo) return
			this.currServiceCode = getServiceCode(this.$route.name, this.orderInfo.serviceList)
			sessionStorage.setItem('serviceCode', this.currServiceCode)
			this.handleIsCancelApply(this.currServiceCode)
			// 获取业务发起取消的订单的取消原因备注等信息
			if (this.orderInfo.cancelApplyStatus === 'applied') {
				this.getCancel(this.orderInfo)
			}
			// 获取已拒绝的信息
			if (this.orderInfo.orderStatus === 'refuse') {
				this.getRefuse(this.orderInfo)
			}
			// 获取登录用户拥有可编辑订单的角色集合
			this.getUserEditRoles(this.orderInfo)
			this.getFileList()
		},
		// 放舱校验
		getBookReleaseCheck() {
			bookReleaseCheck({ orderNo: this.$route.query.orderNo }).then(res => {
				let { checkResult, checkMsg } = res.data
				this.bookReleaseCheck = checkResult
				this.bookReleaseCheckMsg = checkMsg
			})
		},
		getOceanManifestIsJoint(val) {
			this.oceanManifestIsJoint = val
		},
		getFileList() {
			this.lsLoading = true
			console.log('当前角色UserEditRoles：', this.userEditRoles)
			if(this.fileStatus==='no_effect'){
				orderFileList({ orderNo: this.$route.query.orderNo, status: this.fileStatus })
				.then(res => {
					this.fileList = res.data
					// console.log('当前角色id', this.userId)
					// if (this.userEditRoles.includes('bd') || this.userEditRoles.includes('obd') || this.userEditRoles.includes('asst')) {
					// 	this.fileList = this.fileList.filter(item => !this.dnBillTypeList.includes(item.typeCode))
					// }
					if (!this.userEditRoles.some(item => this.billOfLoadingRoleList.includes(item))) {
						this.fileList = this.fileList.filter(
							item =>
								item.createdBy === this.userId || // 可以查看自己上传的附件
								!this.dnBillTypeList.includes(item.typeCode)
						)
					}
				})
				.finally(() => {
					this.lsLoading = false
				})
			} else{
				// 有效的附件要加上仓库的附件
				Promise.all([orderFileList({ orderNo: this.$route.query.orderNo, status: this.fileStatus }),fileWmsList({ orderNo: this.$route.query.orderNo })]).then(res=>{
					let fileList1 = res[0].data || []
					let fileList2 = res[1].data || []
					for(let i=0;i<fileList2.length;i++){
						fileList2[i].isProhibitDel = true
					}
					if (!this.userEditRoles.some(item => this.billOfLoadingRoleList.includes(item))) {
						fileList1 = fileList1.filter(
							item =>
								item.createdBy === this.userId || // 可以查看自己上传的附件
								!this.dnBillTypeList.includes(item.typeCode)
						)
					}
					
					this.fileList=[...fileList1, ...fileList2]
				}).finally(() => {
					this.lsLoading = false
				})
			}
			
		},
		handleDownload(row) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: row.fileNo
					}
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = row.name
					link.click()
				})
		},
		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.name })
		},
		handleDelete(row) {
			let data = {
				orderNo: row.orderNo,
				oid: row.oid
			}
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return orderFileDelete(data)
				})
				.then(response => {
					this.getFileList()
					this.getBookReleaseCheck()
					this.$message({ message: '删除成功', type: 'success' })
				})
				.catch(() => {})
		},
		// 新增上传附件
		handleAdd() {
			this.uploadPopShow = true
		},
		handleBatchDown() {
			// 批量下载
			if (!this.multipleSelection.length) {
				this.$message.error('请选择至少一条下载')
				return
			}
			this.downloadLoading = true
			let fileNos = this.multipleSelection
				.map(item => {
					return item.fileNo
				})
				.join(',')
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/zipDownload',
					params: {
						fileNos
					}
				})
				.then(res => {
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = '附件.zip'
					link.click()
				})
				.finally(() => {
					this.downloadLoading = false
				})
		},
		handleSelectionChange(val) {
			this.multipleSelection = val
		},
		// 上传弹窗关闭回调
		uploadPopClose(action) {
			this.uploadPopShow = false
			if (action === 'Confirm') {
				this.fileStatus = 'effect'
				this.getFileList()
				this.getBookReleaseCheck()
			}
		}
	}
}
</script>

<style lang="scss">
@import '../../less/index.scss';
.fileList-row {
	display: flex;
	justify-content: space-between;
	margin-bottom: 10px;
	line-height: 20px;
	height: 20px;
}
.width-100 {
	width: 100%;
}
.file-status {
	display: flex;
	justify-content: flex-end;
	margin-bottom: 12px;
}
.file-disabled-style-con {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	display: inline-block;
	/* width: 100%; */
	color: #c0c4c0;
	&:hover {
		color: #c0c4c0;
	}
}
.table-operateBtn-tip {
	padding: 0;
	display: inline-block;
}
</style>
