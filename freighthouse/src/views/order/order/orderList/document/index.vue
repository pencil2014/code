<template>
	<div class="edit-container order-book fullWrap" id="document" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<div class="order-container">
			<!-- 协同撤回申请提示 -->
			<CancelApplyAlert v-if="jointShow && isCancelApply && serviceCode !== 'book'" :serviceInfo="serviceInfo" :serviceList="orderInfo.serviceList" @callback="getOrderInfo" />
			<!-- 订单已取消提示 -->
			<CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
			<!-- 订单拒绝提示 -->
			<RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
			<div class="tabs-container">
				<TopNav :serviceType="orderInfo.serviceType" :activityKey="activityKey" :custid="orderInfo.custid" @routerPush="handleToRoute" />
				<div class="detail-container flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="routeName" @routerPush="handleToRoute" />
					<div class="flex1 component-main-cont">
						<div class="service-container">
							<ServiceCustInfo :orderInfo="orderInfo" :serviceCode="serviceCode" @info="getOrderInfo" @routerPush="handleToRoute"></ServiceCustInfo>
							<div class="component-cont table-com-layout">
								<div class="between h28">
									<div class="ft12 bold">贸易单证</div>
									<div>
										<!-- <span class="mr10">单证进度</span> 
                  <el-select v-model="statusValue" size="mini" placeholder="请选择" clearable style="width:120px" @change="handleUpdateStatus">
                    <el-option v-for="item in dictMap.docTradeStatus" :key="item.value" :label="item.label" :value="item.value"></el-option>
                  </el-select> -->
										<div class="el-button-group">
											<!-- <el-button size="mini" type="default" class="ml10" @click="handleExportPdf" :disabled="isBd">输出</el-button> -->
											<el-button size="mini" type="default" @click="handleBlDeliveryApprove">放单申请</el-button>
											<el-button size="mini" type="primary" class="ml10" @click="handleAddRow" :disabled="isBd || !(orderInfo.orderStatus != 'cancel' && orderInfo.orderStatus != 'close')">新增贸易单证</el-button>
										</div>
									</div>
								</div>
								<el-table ref="multipleTable" fit style="width: 100%" :data="list" @selection-change="handleSelectionChange" class="mt04">
									<el-table-column prop="docName" width="100" label="贸易单证类别" align="center">
										<span v-if="scope.row.docId" slot-scope="scope">
											{{ scope.row.docName | docNameFilter }}
										</span>
										<span v-else slot-scope="scope">
											<el-select v-model="scope.row.docName" size="mini" clearable placeholder="请选择" style="width: 100%">
												<el-option v-for="item in dictMap.tradeDocName" :label="item.label" :value="item.value" :key="item.value"></el-option>
											</el-select>
										</span>
									</el-table-column>
									<el-table-column  prop="invoiceNo" label="编号/发票号">
										<span style="padding-left:7px;" v-if="scope.row.docId && scope.row.putStatus === 'finish'" slot-scope="scope">
											{{ scope.row.invoiceNo }}
										</span>
										<span v-else slot-scope="scope">
											<el-input @blur="handleEdit(scope.row)" style="font-size:12px;" v-model="scope.row.invoiceNo"></el-input>
										</span>
									</el-table-column>
									<el-table-column width="200" prop="documentRemark" label="备注">
										<span style="padding-left:7px;" v-if="scope.row.docId && scope.row.putStatus === 'finish'" slot-scope="scope">
											{{ scope.row.documentRemark }}
										</span>
										<span v-else slot-scope="scope">
											<el-input @clear="handleEdit(scope.row)" @blur="handleEdit(scope.row)" maxlength="128" clearable style="font-size:12px;" v-model="scope.row.documentRemark"></el-input>
										</span>
									</el-table-column>
									<el-table-column prop="isValid" label="是否有效" align="center">
										<span slot-scope="scope">{{ scope.row.isValid === 'y' ? '有效' : scope.row.isValid === 'n' ? '无效' : '' }}</span>
									</el-table-column>
									<el-table-column prop="retrieveStatus" label="取单状态" align="center">
										<span slot-scope="scope">{{ scope.row.retrieveStatus === 'retrieved' ? '已取单' : '未取单' }}</span>
									</el-table-column>
									<el-table-column prop="retrieveFinishTime" width="100" label="取单完成时间" align="center"> </el-table-column>
									<el-table-column prop="putStatus" label="放单状态" align="center">
										<span slot-scope="scope">{{ scope.row.putStatus === 'finish' ? '已放单' : '未放单' }}</span>
									</el-table-column>
									<el-table-column prop="putFinishTime" width="100" label="放单完成时间" align="center"> </el-table-column>
									<el-table-column prop="expressNo" label="快递单号" align="center"> </el-table-column>

									<el-table-column prop="fileName" label="附件" align="center">
										<span slot-scope="scope">
											<div class="operate-group">
												<el-button @click="handleView(scope.row)" type="text" size="mini">
													<el-tooltip class="item" effect="dark" :content="scope.row.fileName" placement="top-start">
														<span class="file-name-style">{{ scope.row.fileName }}</span>
													</el-tooltip>
												</el-button>
											</div>
										</span>
									</el-table-column>

									<el-table-column fixed="right" width="130" label="操作" align="center">
										<template slot-scope="scope">
											<div class="operate-group">
												<el-button type="text" size="mini" @click="handleDownload(scope.row)" v-if="scope.row.fileName && scope.row.isValid === 'y'">下载</el-button>
												<el-button v-if="!scope.row.fileName" @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="isBd">删除</el-button>
												<el-button v-if="scope.row.docId && scope.row.fileName && scope.row.isValid != 'n'" @click="handleInvalid(scope.row)" type="text" size="mini">失效</el-button>
												<el-button v-if="!scope.row.docId" @click="handleSave(scope.row)" type="text" size="mini">保存</el-button>
												<!-- <el-button v-if="scope.row.docId && scope.row.putStatus != 'finish'" @click="handleEdit(scope.row)" type="text" size="mini">更新</el-button> -->
											</div>
										</template>
									</el-table-column>

									<!-- <el-table-column type="selection" width="50"></el-table-column>
									<el-table-column prop="blNo" label="提单号" align="center" width="150" v-if="isNotSelf"></el-table-column>
									<el-table-column prop="docName" label="贸易单证类别" align="center">
										<template slot-scope="scope">
											{{ scope.row.docName | docNameFilter }}
										</template>
									</el-table-column>
									<el-table-column prop="retrieveStatus_cn" label="取单状态" align="center"> </el-table-column>
									<el-table-column prop="retrieveFinishTime" label="取单完成时间" align="center"></el-table-column>
									<el-table-column prop="postStatus_cn" label="寄单状态" align="center"> </el-table-column>
									<el-table-column prop="" label="附件类型" align="center"></el-table-column>
									<el-table-column prop="" label="附件" align="center" width="320">
										<template slot-scope="scope">
											<div class="operate-group">
												<el-button type="text" size="mini" class="link-file" @click="handleView(scope.row.documentFile)">
													{{ scope.row.documentFile ? scope.row.documentFile.fileName : ''}}</el-button>
												<el-button type="text" size="mini" class="link-file" @click="handleDownloadFile(scope.row.documentFile)" 
												v-if="scope.row.documentFile && scope.row.documentFile.fileName">下载</el-button>
											</div>
										</template>
									</el-table-column>
									<el-table-column prop="remark" label="备注" align="center"></el-table-column>
									<el-table-column label="操作" width="80" align="center" fixed="right">
										<template slot-scope="scope">
											<div class="operate-group">
												<el-button @click="handleInfo(scope.row)" type="text" size="mini" v-if="scope.row.docName !== 'container_list_invoice' && scope.row.docName !== 'other'" :disabled="isBd">详情</el-button>
												<el-button @click="handleExport(scope.row)" type="text" size="mini">输出</el-button>
												<el-button @click="handleDelete(scope.row)" type="text" size="mini" :disabled="isBd">删除</el-button>
											</div>
										</template>
									</el-table-column> -->
								</el-table>
							</div>
							<!-- 详情 -->
							<div class="component-cont" v-if="showDetail">
								<div class="mb10 between h32 border-bt">
									<div class="ft14">贸易单证详情</div>
									<div class="el-button-group">
										<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
										<el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="isBd">保存</el-button>
									</div>
								</div>
								<div class="row-flex">
									<div class="flex-item col-6">
										<div class="item-label">贸易单证类别</div>
										<el-select v-model="saveDocData.docName" size="mini" clearable disabled placeholder="请选择" style="width: 100%">
											<el-option v-for="item in dictMap.tradeDocName" :label="item.label" :value="item.value" :key="item.value"></el-option>
										</el-select>
									</div>
									<component :is="componentName" :ref="componentName" :docData="saveDocData.docData" />
								</div>
							</div>
							<!-- <OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="'doc'" /> -->
							<!-- 上传 -->
							<div v-if="uploadPopShow">
								<FileUpload :orderInfo="orderInfo" @close="uploadPopClose" />
							</div>
						</div>
						<JointWorkAssign :jointServiceWorkList="jointServiceWorkList" :serviceCode="serviceCode" @callback="jointWorkAssignCallback" />
					</div>
				</div>
			</div>
		</div>
		<!-- 放货申请弹窗 -->
		<div v-if="blDeliveryApproveShow">
			<BlDeliveryApprove @close="blDeliveryApprovePopClose" />
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { parseTime } from '@/utils'
import { getDictLabel, getServiceCode } from '@/utils/tools'
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { orderInfo, orderJointInfo } from '@/api/order/list'
import { tradeDocList, tradeDocSave, updateInvoiceNo, tradeDocDelete, tradeDocUpdateStatus, tradeDocDocDataDetail, tradeDocSaveDocData, documentInvalid, documentPut } from '@/api/order/document'
import CancelApplyAlert from '../components/cancelApplyAlert'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import ServiceCustInfo from '../components/serviceCustInfo'
import FileUpload from './components/fileUpload'
import Trade from './components/trade'
import Guarantee from './components/guarantee'
import GuaranteeShip from './components/guaranteeShip'
import Certificate from './components/certificate'
import From from './components/from'
import JointWorkAssign from '@/views/order/order/jointList/components/workAssign'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'
import BlDeliveryApprove from '@/views/order/order/orderList/components/applyPut.vue'

export default {
	filters: {
		docNameFilter(docName) {
			return getDictLabel('tradeDocName', docName)
		}
	},
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			originTableData: [],
			blDeliveryApproveShow: false,
			oQuery: this.$route.query,
			statusValue: '',
			list: [],
			multipleSelection: [],
			showDetail: false,
			docId: undefined,
			oid: undefined,
			saveDocData: {},
			uploadPopShow: false,
			componentName: '',
			// cust: {},
			componentObj: {
				guarantee_slip: 'GuaranteeShip', // 保单
				co: 'From', // 产地证
				// container_list_invoice: 'Trade',
				ship_paper: 'Trade' // 船证
			},
			routeName: 'Document',
			activityKey: 'Document',
			serviceCode: 'doc',
			isNotSelf: false
		}
	},
	async created() {
		// this.getOrderInfo()
		let { params, query } = this.$route
		let orderNo = query.orderNo
		let jointNo = query.jointNo
		let fn = jointNo ? orderJointInfo : orderInfo
		let data = jointNo ? { jointNo } : { orderNo }
		let res = await fn(data)
		this.orderInfo = res.data
		this.isNotSelf = !['st02', 'st16', 'st17'].includes(this.orderInfo.serviceType) && ['st04', 'st19'].includes(this.orderInfo.serviceType)
		this.setServiceList(res.data.serviceList)
		this.setServiceInfoList(res.data.serviceInfoList)
		this.getInit(this.orderInfo)
		console.log('this.orderInfo', this.orderInfo)
		this.getDocumentList()
		if (this.jointShow) {
			this.getJointServiceWorkList(this.serviceCode)
		}
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
		// 不可编辑的角色
		isBd() {
			console.log(this.ordDetRole, this.isDoc)
			let notDoc = this.ordDetRole === 'ac' || this.ordDetRole === 'op' || !this.ordDetRole || this.ordDetRole === 'op_truck'
			let isBd = this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || notDoc
			return isBd || this.isJoint || this.isFinish
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === this.serviceCode)
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		}
	},
	components: {
		CancelApplyAlert,
		CancelAlert,
		RefuseAlert,
		TopNav,
		LeftNav,
		ServiceCustInfo,
		FileUpload,
		Trade,
		Guarantee,
		Certificate,
		GuaranteeShip,
		From,
		JointWorkAssign,
		// OneServiceFee,
		BlDeliveryApprove
	},
	props: {},
	watch: {},
	methods: {
		handleInvalid(row) {
			let data = {
				docId: row.docId
			}
			documentInvalid(data).then(res => {
				if (res.code === 0) {
					this.$message.success('操作成功!')
					this.getDocumentList()
				}
			})
		},
		handleSave(row) {
			// if (!row.docName) return this.$message.warning('请选择贸易单证类别!')
			// if (!row.invoiceNo) return this.$message.warning('请填写发票号!')
			let data = {
				orderNo: this.oQuery.orderNo,
				docName: row.docName,
				blId: 0,
				invoiceNo: row.invoiceNo,
				documentRemark: row.documentRemark
			}
			tradeDocSave(data).then(res => {
				this.$message.success('添加成功!')
				this.getDocumentList()
			})
		},
		//更新
		handleEdit(row) {
			if (!row.docId) return
			// 没有改变原值 不调接口
			if (this.originTableData.some(item => item.docId === row.docId && item.invoiceNo === row.invoiceNo && item.documentRemark === row.documentRemark)) return
			let data = {
				docId: row.docId,
				invoiceNo: row.invoiceNo,
				documentRemark: row.documentRemark
			}
			updateInvoiceNo(data).then(res => {
				this.$message.success('更新成功!')
				this.getDocumentList()
			})
		},
		// 客户同意放货弹窗关闭回调
		blDeliveryApprovePopClose(action, value) {
			this.blDeliveryApproveShow = false
			if (action === 'Confirm') {
				console.log('🚀 ~ value', value)
				let data = {
					orderNo: this.oQuery.orderNo,
					receiveName: value.receiveName,
					receivePhone: value.receivePhone,
					receiveAddress: value.receiveAddress,
					receiveRemark: value.receiveRemark,
					blId: 0
				}
				documentPut(data).then(res => {
					this.$message.success('申请成功!')
					this.getDocumentList()
				})
			}
		},
		// 打开放货申请弹窗
		handleBlDeliveryApprove(row) {
			if (this.list.every(item => item.isValid === 'n')) {
				return this.$message.warning('没有有效数据,不能发起申请!')
			}

			this.blDeliveryApproveShow = true
		},
		handleAddRow() {
			if (this.list.some(item => !item.docId)) {
				return this.$message.warning('有未保存的数据,请先保存!')
			}
			this.list.push({ docName: '', documentRemark: '', invoiceNo: '' })
		},
		// 列表
		getDocumentList() {
			this.lsLoading = true
			let data = {
				orderNo: this.oQuery.orderNo
			}
			tradeDocList(data).then(res => {
				this.list =
					res.data &&
					res.data.map(item => {
						return Object.assign(item, {
							postStatus_cn: getDictLabel('postStatus', item.postStatus),
							retrieveStatus_cn: getDictLabel('documentRetrieveStatus', item.retrieveStatus)
						})
					})
				this.originTableData = JSON.parse(JSON.stringify(this.list))
			}).finally(() => {
				this.lsLoading = false
			})
		},

		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
			console.log(this.multipleSelection)
		},

		handleDownloadFile(item) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: item.fileNo
					}
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = item.fileName
					link.click()
				})
		},

		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
		},

		validate() {
			return true
		},

		// 取消
		handleCancel() {
			this.showDetail = false
		},

		portValidate(data) {
			if (data.polCode && data.podCode && data.podCode === data.polCode) {
				this.$message.error('目的港不能和大船起运港相同')
				return false
			}
			if (data.transitPortCode && data.polCode && data.transitPortCode.includes(data.polCode)) {
				this.$message.error('中转港不能包含大船起运港')
				return false
			}
			if (data.transitPortCode && data.podCode && data.transitPortCode.includes(data.podCode)) {
				this.$message.error('中转港不能包含目的港')
				return false
			}
			return true
		},

		// 保存数据
		// handleSave() {
		// 	console.log(this.$refs[this.componentName])
		// 	let data = this.$refs[this.componentName].tradeItem
		// 	// 保单的目的港不能和大船起运港相同，中转港不能包含大船起运港和目的港的判断
		// 	if (this.componentName === 'GuaranteeShip' && !this.portValidate(data)) return
		// 	tradeDocSaveDocData({
		// 		orderNo: this.oQuery.orderNo,
		// 		jointNo: this.oQuery.jointNo,
		// 		oid: this.oid,
		// 		docId: this.docId,
		// 		docData: JSON.stringify(data)
		// 	}).then(res => {
		// 		this.$message({
		// 			type: 'success',
		// 			message: '保存成功',
		// 			duration: 1000,
		// 			onClose: () => {
		// 				this.getDocumentList()
		// 				this.showDetail = false
		// 			}
		// 		})
		// 	})
		// },

		// 详情
		handleInfo(row) {
			tradeDocDocDataDetail({ docId: row.docId, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				//let {docData} = res.data
				this.componentName = this.componentObj[row.docName]
				this.showDetail = true
				this.docId = row.docId

				if (res.data) {
					this.oid = res.data.oid
					let tempData = JSON.parse(res.data.docData)
					this.saveDocData = Object.assign(
						{},
						{
							docData: tempData,
							docName: row.docName
						}
					)
				} else {
					this.saveDocData = Object.assign(
						{},
						{
							docName: row.docName,
							docData: {}
						}
					)
				}
				console.log(this.saveDocData.docData)
			})
		},

		// 删除
		handleDelete(row, index) {
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					if (!row.docId) {
						this.list.splice(index, 1)
					} else {
						tradeDocDelete({ orderNo: this.oQuery.orderNo, docId: row.docId }).then(response => {
							this.getDocumentList()
							this.$message({ message: '删除成功', type: 'success' })
						})
					}
				})
				// .then(() => {

				// 	return tradeDocDelete({ orderNo: this.oQuery.orderNo, docId: row.docId })
				// })
				// .then(response => {
				// 	// 删除和打开详情的信息为同一条时，该条信息的详情则不显示
				// 	if (this.docId === row.docId) {
				// 		this.showDetail = false
				// 	}
				// 	this.getDocumentList()
				// 	this.$message({ message: '删除成功', type: 'success' })
				// })
				.catch(() => {})
		},

		//输出pdf
		// handleExportPdf() {
		// 	this.$router.push({
		// 		path: 'docPdf'
		// 	})
		// },

		// 打开上传附件弹窗
		handleAddFile() {
			this.oid = undefined
			this.docId = undefined
			this.uploadPopShow = true
		},

		// 上传弹窗关闭回调
		uploadPopClose(action, value) {
			this.uploadPopShow = false
			if (action === 'Confirm') {
				this.getDocumentList()
			}
		},

		// 选择单证类型
		handleChangeDocName(val) {
			console.log(val)
		},

		// 获取docIds
		getDocIds() {
			let docIds = []
			this.multipleSelection.map(item => {
				docIds.push(item.docId)
			})
			return docIds
		},

		// 更新状态
		handleUpdateStatus(val) {
			if (this.multipleSelection.length === 0) {
				return this.$message.error('请勾选一条要更新状态的贸易单证')
			}
			let docIds = this.getDocIds()
			tradeDocUpdateStatus({
				docId: docIds,
				orderNo: this.oQuery.orderNo,
				jointNo: this.oQuery.jointNo,
				statusType: 'retrieve_status',
				statusValue: val,
				statusTime: parseTime(new Date().getTime())
			}).then(res => {
				this.$message({
					type: 'success',
					message: '更新状态成功',
					duration: 1000,
					onClose: () => {
						this.getList()
					}
				})
			})
		},
		jointWorkAssignCallback() {
			this.getJointServiceWorkList(this.serviceCode)
		}
	}
}
</script>
<style lang="scss">
@import '../../less/index.scss';
#document {
	.component-cont {
		padding: 10px 20px !important;
	}
}
</style>
