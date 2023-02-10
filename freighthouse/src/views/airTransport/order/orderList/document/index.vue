<template>
	<div class="edit-container order-book fullWrap" id="document">
		<div class="order-container">
			<div class="tabs-container">
				<!-- <TopNav :serviceType="orderInfo.serviceType" :activityKey="activityKey" @routerPush="handleToRoute" /> -->
				<div class="detail-container flex">
					<!-- <LeftNav :orderInfo="orderInfo" :activityKey="routeName" @routerPush="handleToRoute" /> -->
					<div class="flex1 component-main-cont">
						<div class="service-container">
							<ServiceCustInfo :serverIsJoint="isJoint" :orderInfo="orderInfo" :serviceCode="serviceCode" @info="getOrderInfo" @routerPush="handleToRoute"></ServiceCustInfo>
							<div class="component-cont table-com-layout">
								<div class="mb10 between h28">
									<div class="ft12 doc-title">贸易单证</div>
									<div>
										<div class="el-button-group">
											<!-- <el-button size="mini" type="default" @click="handleBlDeliveryApprove" :disabled="!isOp || isJoint || progressValue === 'finish'">放单申请</el-button> -->
											<el-button size="mini" type="default" @click="handlePost" :disabled="!isOp || isJoint || progressValue === 'finish'">新增寄单任务</el-button>
											<el-button :disabled="!isOp || isJoint || progressValue === 'finish' || !(orderInfo.orderStatus != 'cancel' && orderInfo.orderStatus != 'close')" size="mini" type="primary" class="ml10" @click="handleAddRow"
												>新增贸易单证</el-button
											>
										</div>
									</div>
								</div>
								<el-table header-row-class-name="pol-ltl-th" ref="multipleTable" fit style="width: 100%" :data="list" @selection-change="handleSelectionChange">
									<el-table-column type="selection" width="55"> </el-table-column>
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
									<el-table-column prop="invoiceNo" label="编号/发票号" align="center">
										<span v-if="scope.row.docId" slot-scope="scope">
											{{ scope.row.invoiceNo }}
										</span>
										<span v-else slot-scope="scope">
											<el-input v-model="scope.row.invoiceNo"></el-input>
										</span>
									</el-table-column>
									<el-table-column width="200" prop="documentRemark" label="备注">
										<span v-if="scope.row.docId" slot-scope="scope">
											{{ scope.row.documentRemark }}
										</span>
										<span v-else slot-scope="scope">
											<el-input maxlength="128" clearable style="font-size:12px;" v-model="scope.row.documentRemark"></el-input>
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
									<el-table-column prop="postStatus" label="寄单状态" align="center">
										<span slot-scope="scope">
											{{ scope.row.postStatus | postStatusFilter }}
										</span>
									</el-table-column>
									<el-table-column prop="fileName" label="附件" align="center">
										<span slot-scope="scope">
											<div class="file-row" v-if="scope.row.fileName && scope.row.fileName.split(',').length">
												<div :title="item" v-for="(item, index) in scope.row.fileName.split(',')" :key="'file' + index" class="file-name-trade">
													<el-button type="text" size="mini" @click="handleView(item, index, scope.row)">{{ item }}</el-button>
												</div>
											</div>
										</span>
									</el-table-column>

									<el-table-column fixed="right" width="120" label="操作" align="center">
										<template slot-scope="scope">
											<div class="operate-group">
												<el-button type="text" size="mini" @click="handleDownload(scope.row)" v-if="scope.row.fileName && scope.row.isValid === 'y'">下载</el-button>
												<el-button v-if="!scope.row.fileName" @click="handleDelete(scope.row, scope.$index)" type="text" size="mini" :disabled="!isOp || isJoint || progressValue === 'finish'">删除</el-button>
												<el-button v-if="scope.row.docId && scope.row.fileName" @click="handleInvalid(scope.row)" type="text" size="mini">失效</el-button>
												<el-button v-if="!scope.row.docId" @click="handleSave(scope.row)" type="text" size="mini">保存</el-button>
											</div>
										</template>
									</el-table-column>
								</el-table>
							</div>
							<!-- 详情 -->
							<div class="component-cont" v-if="showDetail">
								<div class="mb10 between h32 border-bt">
									<div class="ft14">贸易单证详情</div>
									<div class="el-button-group">
										<el-button size="mini" type="default" class="ml10" @click="handleCancel">取消</el-button>
										<el-button size="mini" type="primary" class="ml10" @click="handleSave" :disabled="!isOp || isJoint || progressValue === 'finish'">保存</el-button>
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
							<!-- <OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="serviceCode" /> -->
							<!-- 上传 -->
							<div v-if="uploadPopShow">
								<FileUpload :orderInfo="orderInfo" @close="uploadPopClose" />
							</div>
							<!-- 附件上传 -->
							<div v-if="uploadShow">
								<FileUploadAir :docId="docId" :docType="docType" @close="airPopClose" />
							</div>
						</div>
						<!-- <JointWorkAssign :jointServiceWorkList="jointServiceWorkList" :serviceCode="serviceCode" @callback="jointWorkAssignCallback" /> -->
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
import { parseTime } from '@/utils'
import { getDictLabel } from '@/utils/tools'
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { tradeDocList, tradeDocSave, tradeDocDelete, tradeDocUpdateStatus, tradeDocDocDataDetail, tradeDocSaveDocData, documentInvalid, documentPut } from '@/api/order/document'
import CancelApplyAlert from '../components/cancelApplyAlert'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import ServiceCustInfo from '../components/serviceCustInfo'
import Trade from './components/trade'
import Guarantee from './components/guarantee'
import GuaranteeShip from './components/guaranteeShip'
import Certificate from './components/certificate'
import From from './components/from'
// import JointWorkAssign from '@/views/order/order/jointList/components/workAssign'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'
import FileUpload from './components/fileUpload'
import FileUploadAir from './components/fileUploadAir'
// import BlDeliveryApprove from './components/applyPut'
import BlDeliveryApprove from '@/views/order/order/orderList/components/applyPut.vue'
import { mapState } from 'vuex'
export default {
	filters: {
		docNameFilter(docName) {
			return getDictLabel('tradeDocName', docName)
		},
		statusFilter(status) {
			return getDictLabel('documentRetrieveStatus', status)
		},
		postStatusFilter(status) {
			return getDictLabel('postStatus', status)
		}
	},
	mixins: [orderMixin, routerMixin],
	data() {
		return {
			blDeliveryApproveShow: false,
			curRow: {},
			docType: '',
			uploadShow: false,
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
			componentObj: {
				guarantee_slip: 'GuaranteeShip', // 保单
				co: 'From', // 产地证
				ship_paper: 'Trade' // 船证
			},
			routeName: 'AirDocument',
			activityKey: '',
			serviceCode: 'air_doc',
			docMenu: [],
			progressValue: ''
		}
	},
	created() {
		this.getOrderInfo()
		this.getDocumentList()
		if (this.jointShow) {
			this.getJointServiceWorkList(this.serviceCode)
		}
		// this.handleGetServiceStatus()
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
			airOrderInfo: state => state.airTransport.airOrderInfo
		})
	},
	components: {
		CancelApplyAlert,
		CancelAlert,
		RefuseAlert,
		TopNav,
		LeftNav,
		ServiceCustInfo,
		Trade,
		Guarantee,
		Certificate,
		GuaranteeShip,
		From,
		// JointWorkAssign,
		// OneServiceFee,
		FileUpload,
		FileUploadAir,
		BlDeliveryApprove
	},
	props: {},
	watch: {
		orderInfo() {
			if (this.orderInfo.serviceInfoList) {
				this.handleGetServiceStatus()
			}
		}
	},
	methods: {
		// 去寄单
		handlePost() {
			if (!this.multipleSelection.length) {
				return this.$message.warning('请选择数据!')
			}
			let arr = []
			for (let index = 0; index < this.multipleSelection.length; index++) {
				let item = this.multipleSelection[index]
				arr.push({
					docId: item.docId,
					docType: item.docType
				})
				if (item.retrieveStatus !== 'retrieved') {
					return this.$message.warning('取单状态为“已取单”的才能新增寄单任务!')
				}
				if (item.putStatus === 'finish') {
					// 已放单的不可以寄单  20220221
					return this.$message.warning('已放单的不可以寄单!')
				}
			}
			let airOrderInfo = {
				businessType: this.airOrderInfo.businessType,
				orderNo: this.$route.query.orderNo,
				ids: arr
			}
			console.log(this.multipleSelection)
			this.$router.push({
				name: 'PostDetail',
				query: {
					airOrderInfo: JSON.stringify(airOrderInfo)
				}
			})
		},
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
		// 客户同意放货弹窗关闭回调
		blDeliveryApprovePopClose(action, value) {
			this.blDeliveryApproveShow = false
			if (action === 'Confirm') {
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
		handleGetServiceStatus() {
			let { serviceInfoList } = this.orderInfo
			let sItem = serviceInfoList.find(item => item.serviceCode === 'air_doc')
			this.progressValue = sItem ? sItem.serviceStatus : ''
		},
		//关闭上传弹窗
		airPopClose(action, data) {
			this.uploadShow = false
			if (action === 'Confirm') {
				this.getDocumentList()
			}
		},
		// 打开上传附件弹窗
		handleUploadFile(row) {
			console.log('🚀 ~ row', row)
			this.docId = row.docId
			this.docType = row.docType
			this.uploadShow = true
		},
		// 列表
		getDocumentList() {
			let data = {
				orderNo: this.oQuery.orderNo,
				blId: 0
			}
			if (this.oQuery.jointNo) {
				data.jointNo = this.oQuery.jointNo
			}
			tradeDocList(data).then(res => {
				this.list = res.data
			})
		},

		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
			console.log(this.multipleSelection)
		},

		handleDownload(item) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/zipDownload',
					params: {
						fileNos: item.fileNo
					}
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = '贸易单证.zip'
					link.click()
				})
		},

		// 预览
		handleView(name, index, row) {
			let fileNo = row.fileNo.split(',')[index]
			this.$store.dispatch('order/previewFile', { fileNo: fileNo, fileName: name })
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
			tradeDocDocDataDetail({
				docId: row.docId,
				orderNo: this.oQuery.orderNo,
				jointNo: this.oQuery.jointNo
			}).then(res => {
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
			}).then(() => {
				if (row.docId) {
					let params = {
						orderNo: this.oQuery.orderNo,
						docId: row.docId
					}

					tradeDocDelete(params).then(() => {
						this.$message.success('删除成功!')
						this.getDocumentList()
					})
				} else {
					this.list.splice(index, 1)
				}
			})
			// .then(() => {
			//   let params={
			//      orderNo: this.oQuery.orderNo,
			//     docId: row.docId
			//   }
			//   if(this.oQuery.jointNo){
			//     params.jointNo=this.oQuery.jointNo
			//   }
			//   return airDocumentDelete(params)
			// })
			// .then((response) => {
			//   // 删除和打开详情的信息为同一条时，该条信息的详情则不显示
			//   if (this.docId === row.docId) {
			//     this.showDetail = false
			//   }
			//   this.getDocumentList()
			//   this.$message({ message: '删除成功', type: 'success' })
			// })
			// .catch(() => {})
		},

		//输出pdf
		handleExportPdf() {
			this.$router.push({
				path: 'docPdf'
			})
		},

		// 打开添加弹窗
		handleAddFile() {
			this.oid = undefined
			this.docId = undefined
			this.uploadPopShow = true
		},

		// 添加弹窗关闭回调
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
		}
		// jointWorkAssignCallback() {
		// 	this.getJointServiceWorkList(this.serviceCode)
		// }
	}
}
</script>
<style lang="scss">
@import '../../less/index.scss';
#document {
	.doc-title {
		color: #222222;
		font-weight: 600;
	}
	.pol-ltl-th {
		font-size: 12px;
		font-weight: 600;
		color: #222222;
	}
}
</style>
