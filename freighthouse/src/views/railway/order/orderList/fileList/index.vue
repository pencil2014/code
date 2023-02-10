<template>
	<div class="edit-container order-book" id="fileList" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<div style="margin:0;" class="order-container">
			<!-- 订单已取消提示 -->
			<CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
			<!-- 订单拒绝提示 -->
			<RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
			<div class="tabs-container">
				<TopNav :serviceType="orderInfo.serviceType" :activityKey="activityKey" @routerPush="handleToRoute" />
				<div class="detail-container flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="'RailwayFileList'" @routerPush="handleToRoute" @getOceanManifestIsJoint="getOceanManifestIsJoint" />
					<div class="flex1 component-main-cont">
						<div class="service-container">
							<CustInfo :orderInfo="orderInfo.main" />
							<div class="fileList-cont table-com-layout" style="margin-top:0">
								<el-tabs v-model="fileStatus" @tab-click="getFileList">
                  <el-tab-pane label="有效" name="effect"></el-tab-pane>
                  <el-tab-pane label="无效" name="no_effect"></el-tab-pane>
                </el-tabs>
								<div class="fileList-row">
									<div class="ft14">附件列表</div>
									<div>
                     <el-button type="primary" size="mini" @click="handleBatchDown" v-if="fileList.length && fileStatus ==='effect'" :loading="downloadLoading">批量下载</el-button>
									   <el-button type="primary" size="mini" @click="handleAdd" v-if="isEditView && fileStatus ==='effect'">新增附件</el-button>
									</div>
								</div>
								<el-table style="width: 100%" fit highlight-current-row :data="fileList" @selection-change="handleSelectionChange">
									<!-- <el-table-column prop="fileNo" label="附件编号" align="left" width="260px"> </el-table-column> -->
									<el-table-column
										type="selection"
										:selectable="selected"
										width="55">
									</el-table-column>
									<el-table-column width="100px" prop="serviceName" label="业务模块" align="left"> </el-table-column>
									<el-table-column width="200px" prop="typeName" label="附件类别" align="left"> </el-table-column>
									<el-table-column prop="name" label="附件名称" align="left" min-width="200px">
										<template slot-scope="scope">
											<div class="operate-group">
												<el-tooltip effect="dark" placement="top-start" v-if="noCanDownload">
													<div slot="content">该订单客户为非正式客户，不可预览该附件</div>
													<span class="file-disabled-style">{{ scope.row.name }}</span>
												</el-tooltip>
												<el-button @click="handleView(scope.row)" type="text" size="mini" v-else>
													<el-tooltip class="item" effect="dark" :content="scope.row.name" placement="top-start">
														<span class="file-name-style">{{ scope.row.name }}</span>
													</el-tooltip>
												</el-button>
											</div>
										</template>
									</el-table-column>
									<el-table-column prop="size" label="附件大小(kb)" align="left" width="150px"> </el-table-column>
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
												<el-button v-if="scope.row.auditStatus === 'SUBMIT'" :disabled="scope.row.auditEmployeeId !== userId" @click="handleAudit(scope.row, 'PASS')" type="text" size="mini" style="padding:0">通过</el-button>
												<el-button v-if="scope.row.auditStatus === 'SUBMIT'" :disabled="scope.row.auditEmployeeId !== userId" @click="handleAudit(scope.row, 'REFUSE')" type="text" class="red" size="mini" style="padding:0">拒绝</el-button>
												<el-button v-if="scope.row.createdBy === userId && (scope.row.auditStatus==='PASS' || scope.row.auditStatus==='REFUSE')" @click="handleInvalid(scope.row)" type="text" size="mini" style="padding:0">失效</el-button>
												<el-tooltip effect="dark" placement="top-start" v-if="orderInfo.isDraftCust === 'Y'">
													<div slot="content">该订单客户为非正式客户，不可下载该附件</div>
													<el-button type="text" size="mini" class="file-disabled-style">下载</el-button>
												</el-tooltip>
												<el-button @click="handleDownload(scope.row)" type="text" size="mini" v-else>下载</el-button>
												<el-button @click="handleDelete(scope.row)" type="text" class="red" size="mini" v-if="!(scope.row.serviceCode === 'ocean_manifest' && oceanManifestIsJoint) && isEditView && isSelfFile(scope.row) && bookingDelStatus(scope.row)">删除</el-button>
											</div>
										</template>
									</el-table-column>
								</el-table>
							</div>
							<!-- 上传 -->
							<div v-if="uploadPopShow">
								<FileUpload @close="uploadPopClose" :isAc="isAc" :compensaAgreementIsEditView="compensaAgreementIsEditView" :oceanManifestIsJoint="oceanManifestIsJoint" />
							</div>
							<div v-if="auditPopShow">
								<AuditDialog @close="auditPopClose" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { orderMixin } from '@/views/railway/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import {jointWork, orderInfo, orderFileList, orderFileDelete } from '@/api/railway/list'
import { fileAudit,fileNoeffect } from '@/api/order/list'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import CustInfo from '../components/custInfo'
import FileUpload from './components/fileUpload'
import AuditDialog from '@/views/airTransport/order/orderList/fileList/components/auditDialog'

export default {
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			fileStatus:'effect',
			auditPopShow: false,
			auditType: '',
			auditDate: null,
			oQuery: this.$route.query,
			fileList: [],
			uploadPopShow: false,
			activityKey: 'FileList',
			oceanManifestIsJoint: false, // 舱单服务是否协同
			multipleSelection: [],
			downloadLoading: false,
			jointWorkData: []
		}
	},
	created() {
		this.getOrderInfo()
		this.getFileList()
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
		...mapState({
			roles: state => state.user.roles,
			orderInfoDataObj: state => state.railway.orderInfoDataObj
		}),
		acId() {
			let { workAssign } = this.orderInfoDataObj
			let item = workAssign && workAssign.find(el => el.jobCode === 'ac')
			if (item && item.employeeId) {
				return item.employeeId
			}
			return ''
		},
		isAc() {
			return (this.roles.includes('ac') && (this.roles.includes('manager') || this.roles.includes('duty'))) || this.acId === this.userId
		},
		isJointWork() {
       return this.jointWorkData.some(item => item.employeeId === this.userId)
		},
		isEditView() {
			return (
				this.roles.includes('bd') || this.roles.includes('obd') || this.roles.includes('op') || this.roles.includes('ac') || this.roles.includes('eac') || this.roles.includes('bkg') || this.roles.includes('ecs') || this.roles.includes('epricing') || this.isJointWork
			)
		},
		compensaAgreementIsEditView() {
			// 订单的销售、销售助理、下单助理、操作岗位人员，以及对应的管理者 可以上传 “应收赔偿协议”、“应付赔偿协议”附件；
			return this.roles.includes('bd') || this.roles.includes('obd') || this.roles.includes('asst') || this.roles.includes('op') || this.roles.includes('bkg')
		},
		noCanDownload() {
			return this.orderInfo.isDraftCust === 'Y'
		}
	},
	components: {
		CancelAlert,
		RefuseAlert,
		TopNav,
		LeftNav,
		CustInfo,
		FileUpload,
		AuditDialog
	},
	methods: {
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
			return row.createdBy === this.userId && // 附件上传人是否是当前登录人
			       row.auditStatus === 'SUBMIT' && // 未审核
						 ['booking','cust_booking','ls_booking'].includes(row.typeCode) // 托书
		},
		handleInvalid(row){
			fileNoeffect([row.oid]).then(res=>{
				this.$message.success('该附件已执行失效')
				this.getFileList()
			})
		},
		selected() {
       return !this.noCanDownload
		},
		handleBatchDown() {
			// 批量下载
      if (!this.multipleSelection.length) {
				this.$message.error('请选择至少一条下载')
				return
			}
			this.downloadLoading = true
			let fileNos = this.multipleSelection.map(item => {
        return item.fileNo
			}).join(',')
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
		getOceanManifestIsJoint(val) {
			this.oceanManifestIsJoint = val
		},
		getFileList() {
			orderFileList({ orderNo: this.$route.query.orderNo,status: this.fileStatus }).then(res => {
				this.fileList = res.data
			})
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
					this.$message({ message: '删除成功', type: 'success' })
				})
				.catch(() => {})
		},
		// 新增上传附件
		handleAdd() {
			this.uploadPopShow = true
		},
		// 上传弹窗关闭回调
		uploadPopClose(action) {
			this.uploadPopShow = false
			if (action === 'Confirm') {
				this.fileStatus ='effect'
				this.getFileList()
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
.file-status{
	display: flex;
	justify-content: flex-end;
	margin-bottom: 12px;
}
</style>
