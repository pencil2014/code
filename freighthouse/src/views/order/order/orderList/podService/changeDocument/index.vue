<template>
	<div class="edit-container order-book fullWrap" id="changeDocument" v-loading="lsLoading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
		<div class="order-container">
			<!-- 协同撤回申请提示 -->
			<CancelApplyAlert v-if="jointShow && isCancelApply && serviceCode !== 'book'" :serviceInfo="serviceInfo" :serviceList="orderInfo.serviceList" @callback="getOrderInfo" />
			<!-- 订单已取消提示 -->
			<CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
			<!-- 订单拒绝提示 -->
			<RefuseAlert v-if="ordDetRole === 'bd' && isRefuse" :refuseReason="refuseReason" />
			<div class="tabs-container">
				<TopNav :serviceType="orderInfo.serviceType" :activityKey="activityKey" :custid="orderInfo.custid" @routerPush="handleToRoute" />
				<div class="detail-container flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="routeName" @routerPush="handleToRoute" />
					<div class="flex1 component-main-cont">
						<div class="service-container">
							<ServiceCustInfo :orderInfo="orderInfo" :serviceCode="serviceCode" @info="getOrderInfo" @routerPush="handleToRoute"></ServiceCustInfo>
							<!-- 海运进口新增类型 -->
							<div class="component-cont" style="padding-bottom: 0">
								<div style="padding-left: 20px;display:flex;">
									<div>
										<span style="margin-right: 10px">请选择类型:</span>
										<el-checkbox :disabled="isFinish" @change="subTypeSave('hbl_to_mbl')" v-model="hbl_to_mbl" true-label="y" false-label="n"> H换M </el-checkbox>
										<el-checkbox :disabled="isFinish" v-if="isShipImport" @change="subTypeSave('mbl_to_paper')" v-model="mbl_to_paper" true-label="y" false-label="n"> 换提货纸 </el-checkbox>
									</div>
									<sync-order @setType="setType" v-if="orderInfo.serviceType === 'st10' && orderInfo.exportOrderNo && !isJoint" />
								</div>
								<div v-if="serviceCheckout.length > 0" class="ship-cont">
									<el-tabs v-model="activityType" class="pl20">
										<el-tab-pane v-for="item in serviceCheckout" :name="item.value" :key="item.value">
											<span slot="label">
												{{ item.label }}
											</span>
										</el-tab-pane>
									</el-tabs>
								</div>
							</div>
							<div v-if="serviceCheckout.length > 0" class="component-cont" style="padding: 10px 20px">
								<div class="mb10 between h28">
									<span class="tit ft12 bold">换单信息</span>
									<div class="row-tit-operate">
										<div class="">
											<span class="mr10">换单状态</span>
											<el-select v-model="exchangeStatus" size="mini" placeholder="请选择" clearable style="width: 120px" @change="handleUpdateStatus" :disabled="isBd && !isImportJoint">
												<el-option v-for="item in dictMap.blExchangeStatus" :key="item.value" :label="item.label" :value="item.value"></el-option>
											</el-select>
											<el-button type="default" size="mini" class="ml10" @click="handleExportAppriverNotice" v-if="isImportFcl">导出ARRIVER NOTICE</el-button>
										</div>
									</div>
								</div>
								<div class="row-form mt10 table-com-layout">
									<template v-if="isImportFcl">
										<el-table
											class="blExchangeList"
											ref="blExchangeTable"
											fit
											style="width: 100%"
											:data="blExchangeList"
											default-expand-all
											row-key="blId"
											:tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
											:select-on-indeterminate="true"
											:row-class-name="tableRowClassName"
											:cell-class-name="cellClassName"
											@select-all="handleSelectAll"
											@selection-change="handleSelectionChange"
										>
											<el-table-column type="selection" width="50"></el-table-column>
											<el-table-column prop="blNo" label="提单号" align="left" width="250">
												<template slot-scope="scope">
													<i class="icon-hbl" v-if="scope.row.blType">{{ scope.row.blType === 'hbl' ? 'H' : 'M' }}</i>
													{{ scope.row.blNo }}
												</template>
											</el-table-column>
											<el-table-column prop="status" label="换单状态" align="center">
												<template slot-scope="scope">
													{{ scope.row.exchangeStatus | exchangeStatusFilter }}
												</template>
											</el-table-column>
											<el-table-column show-overflow-tooltip="" width="150" prop="exchangeCompleteTime" label="换单完成时间" align="center"> </el-table-column>
											<el-table-column show-overflow-tooltip="" width="150px" prop="overseasAgentName" label="代理" align="center"> </el-table-column>
											<!-- <el-table-column show-overflow-tooltip="" width="150px" prop="overseasCompanyName" label="海外分公司" align="center"> </el-table-column> -->
											<el-table-column prop="etaTime" label="ETA" align="center" width="150">
												<template slot-scope="scope">
													{{ scope.row.blExchangeContainerList && scope.row.blExchangeContainerList.length ? scope.row.blExchangeContainerList[0].etaTime : '' }}
												</template>
											</el-table-column>
											<el-table-column prop="cn" label="箱号" align="center" width="150">
												<template slot-scope="scope">
													<div class="column-div" v-for="(item, index) in scope.row.blExchangeContainerList" :key="'cn' + index">{{ item.cn }}</div>
												</template>
											</el-table-column>
											<el-table-column prop="canTakeDate" label="可提柜时间" align="center" width="150">
												<template slot-scope="scope">
													<div class="column-div" v-for="(item, index) in scope.row.blExchangeContainerList" :key="'canTakeDate' + index">{{ item.canTakeDate }}</div>
												</template>
											</el-table-column>
											<el-table-column prop="latestFreeDate" label="最晚免费时间" align="center" width="150">
												<template slot-scope="scope">
													<div class="column-div" v-for="(item, index) in scope.row.blExchangeContainerList" :key="'latestFreeDate' + index">{{ item.latestFreeDate }}</div>
												</template>
											</el-table-column>
											<el-table-column prop="podTakeDate" label="实际提柜时间" align="center" width="150">
												<template slot-scope="scope">
													<div class="column-div" v-for="(item, index) in scope.row.blExchangeContainerList" :key="'podTakeDate' + index">{{ item.podTakeDate }}</div>
												</template>
											</el-table-column>
											<el-table-column prop="podReturnDate" label="还空柜时间" align="center" width="150">
												<template slot-scope="scope">
													<div class="column-div" v-for="(item, index) in scope.row.blExchangeContainerList" :key="'podReturnDate' + index">{{ item.podReturnDate }}</div>
												</template>
											</el-table-column>
										</el-table>
									</template>
									<template v-else>
										<el-table
											ref="blExchangeTable"
											fit
											style="width: 100%"
											:data="blExchangeList"
											default-expand-all
											row-key="blId"
											:tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
											:select-on-indeterminate="true"
											:row-class-name="tableRowClassName"
											@select-all="handleSelectAll"
											@selection-change="handleSelectionChange"
										>
											<el-table-column type="selection" width="50"></el-table-column>
											<el-table-column prop="blNo" label="提单号" align="left" width="250">
												<template slot-scope="scope">
													<i class="icon-hbl" v-if="scope.row.blType">{{ scope.row.blType === 'hbl' ? 'H' : 'M' }}</i>
													{{ scope.row.blNo }}
												</template>
											</el-table-column>
											<el-table-column prop="status" label="换单状态" align="center">
												<template slot-scope="scope">
													{{ scope.row.exchangeStatus | exchangeStatusFilter }}
												</template>
											</el-table-column>
											<el-table-column show-overflow-tooltip="" width="150px" prop="overseasAgentName" :label="isShipImport ? '代理' : '海外代理'" align="center"> </el-table-column>
											<el-table-column v-if="!isShipImport" show-overflow-tooltip="" width="150px" prop="overseasCompanyName" label="海外分公司" align="center"> </el-table-column>
											<el-table-column show-overflow-tooltip="" width="150" prop="exchangeCompleteTime" label="换单完成时间" align="center"> </el-table-column>
											<el-table-column prop="auditStatus" label="财务审核" align="center">
												<template slot-scope="scope">
													<span>{{ scope.row.auditStatus | auditStatusFilter }}</span>
												</template>
											</el-table-column>
											<el-table-column prop="isAgreeRelease" label="客户同意放货" align="center" width="100">
												<template slot-scope="scope">
													<span>{{ scope.row.isAgreeRelease === 'y' ? '是' : '否' }}</span>
												</template>
											</el-table-column>
											<el-table-column label="放单保函" align="center" width="300">
												<template slot-scope="scope">
													<div class="operate-group">
														<!-- <span v-if="scope.row.relGuarantee" type="text" size="mini" class="file-name">{{scope.row.relGuarantee}}</span> -->
														<div
															:title="scope.row.rgFileName"
															v-if="scope.row.rgFileName"
															style="display: inline-block; vertical-align: text-top; width: 50%; margin-right: 10px; font-size: 12px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: #1890ff; cursor: pointer"
															class="ml10"
															@click="handleView(scope.row.rgFileNo, scope.row.rgFileName)"
														>
															({{ scope.row.rgFileName }})
														</div>
														<el-button v-if="scope.row.rgFileName" type="text" size="mini" class="underline" @click="handleDownload(scope.row.rgFileNo, scope.row.rgFileName)">下载</el-button>
														<el-upload
															style="display: inline-block"
															ref="upload"
															action="#"
															:auto-upload="true"
															:before-upload="getFile"
															:on-change="handleChangeFile"
															:http-request="content => handleImport(content, scope.row)"
															:show-file-list="false"
															:file-list="fileList"
															:disabled="isBd && !isImportJoint"
															v-if="['init', 'checked', 'received_release_guarantee'].includes(scope.row.exchangeStatus)"
														>
															<el-button type="text" size="mini" class="underline ml10" :disabled="isBd && !isImportJoint">点击上传</el-button>
														</el-upload>
													</div>
												</template>
											</el-table-column>
											<el-table-column label="正本/副本" align="center">
												<template slot-scope="scope">
													{{ !scope.row.originalCount && !scope.row.copyCount ? '--' : `${scope.row.originalCount || 0}/${scope.row.copyCount || 0}` }}
												</template>
											</el-table-column>
											<el-table-column prop="blMode" label="出单方式" align="center">
												<template slot-scope="scope">
													{{ scope.row.blMode | blModeFilter }}
												</template>
											</el-table-column>
											<el-table-column prop="shipCarrierCode" label="船公司" align="center"> </el-table-column>
											<el-table-column prop="countryName" label="国家" align="center"> </el-table-column>
											<el-table-column label="附件信息" align="center" width="250">
												<template slot-scope="scope">
													<div class="operate-group">
														<el-button v-if="scope.row.draftFileName" type="text" size="mini" class="file-name ml10" @click="handleView(scope.row.draftFileNo, scope.row.draftFileName)">({{ scope.row.draftFileName }})</el-button>
													</div>
												</template>
											</el-table-column>
											<el-table-column label="操作" width="80" align="center" fixed="right">
												<template slot-scope="scope">
													<div class="operate-group">
														<el-button v-if="scope.row.draftFileName" type="text" size="mini" :disabled="isBd && !isImportJoint" @click="handleDownload(scope.row.draftFileNo, scope.row.draftFileName)">下载</el-button>
													</div>
												</template>
											</el-table-column>
										</el-table>
									</template>
								</div>
							</div>
							<!-- <OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="'pod_change_doc'" /> -->
							<!-- 放单保函上传弹窗 -->
							<div v-if="blUploadShow">
								<BlUpload @close="blUploadPopClose" />
							</div>
							<!-- 修改换单状态弹窗 -->
							<div v-if="exchangeShow">
								<Exchange :exchangeData="exchangeData" @close="exchangePopClose" />
							</div>
							<!-- 导出ARRIVER NOTICE弹窗 -->
							<div v-if="exportPopShow">
								<ExportPop @close="exportPopClose" />
							</div>
						</div>
						<JointWorkAssign :jointServiceWorkList="jointServiceWorkList" :serviceCode="serviceCode" @callback="jointWorkAssignCallback" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import store from '@/store'
import { mapState } from 'vuex'
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { getDictLabel, getServiceCode } from '@/utils/tools'
import { blExchangeList, blExchangeUpdateStatus, blExchangeUploadGuarantee } from '@/api/order/podService/blExchange'
import CancelApplyAlert from '../../components/cancelApplyAlert'
import CancelAlert from '../../components/cancelAlert'
import RefuseAlert from '../../components/refuseAlert'
import TopNav from '../../components/topNav'
import LeftNav from '../../components/leftNav'
import ServiceCustInfo from '../../components/serviceCustInfo'
import JointWorkAssign from '@/views/order/order/jointList/components/workAssign'
import BlUpload from './components/blUpload'
import Exchange from './components/exchange'
import ExportPop from './components/exportPop'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'
import { subTypeSave, getSubTypeList } from '@/api/order/list'
import SyncOrder from '@/views/order/order/orderList/podService/changeDocument/components/syncOrderChange.vue'

export default {
	filters: {
		exchangeStatusFilter(status) {
			return getDictLabel('blExchangeStatus', status)
		},
		blModeFilter(blMode) {
			return getDictLabel('blMode', blMode)
		},
		auditStatusFilter(auditStatus) {
			let auditStatusOptions = store.state.order.finAuditStatusOptions
			return auditStatusOptions[auditStatus] || '--'
		}
	},
	mixins: [orderMixin, routerMixin],
	props: {},
	data() {
		return {
			activityType: 'hbl_to_mbl',
			hbl_to_mbl: 'y',
			mbl_to_paper: 'n',
			hToM: 'y',
			changePaper: 'n',
			state: 'valid',
			blExchangeList: [],
			oQuery: this.$route.query,
			exchangeStatus: '', // 提单状态
			multipleSelection: [],
			blUploadShow: false,
			exchangeShow: false,
			defaultFileSize: 100, //文件默认不超过100M
			file: '',
			fileList: [],
			routeName: 'PodChangeDoc',
			activityKey: '',
			serviceCode: 'pod_change_doc',
			exchangeData: {},
			exportPopShow: false // 输出弹窗
		}
	},
	created() {
		this.getOrderInfo()
		this.getBlList()
		if (this.jointShow) {
			this.getJointServiceWorkList(this.serviceCode)
		}
		// 获取类型
		this.getSubTypeList()
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
			specialEditRoles: state => state.order.orderList.specialEditRoles,
		}),
		serviceCheckout() {
			return this.dictMap.servicePodExchange.filter(item => this[item.value] === 'y')
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isEpricing() {
			return this.userEditRoles.includes('epricing')
		},
		isEcs() {
			return this.userEditRoles.includes('ecs')
		},
		isOpCustoms() {
			return (this.specialEditRoles.includes('op_customs') || this.specialEditRoles.includes('op_wh')) && this.isShipImport
		},
		isBd() {
			console.log('isJoint', this.isJoint)
			let isJoint = this.isJoint
			if (this.$route.query.jointNo) {
				isJoint = false
			}
			let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'ac' || (this.ordDetRole === 'op_truck' && !this.isOpCustoms) || this.ordDetRole === 'op' || (!this.isDoc && !this.isEpricing && !this.isEcs && !this.isOpCustoms)
			console.log('🚀 ~ isBd', isBd)
			console.log('🚀 ~ isJoint', isJoint)
			return isBd || isJoint || this.isFinish
		},

		// 海运进口整箱
		isImportFcl() {
			return this.orderInfoDataObj.businessType === 'ship_import_fcl'
		},
		// 海运进口
		isShipImport() {
			return ['ship_import_fcl', 'ship_import_lcl'].includes(this.orderInfoDataObj.businessType)
		},
		// 20220509特殊处理为进口协同单的服务项权限都放开
		isImportJoint() {
			return ['ship_import_fcl', 'ship_import_lcl'].includes(this.orderInfoDataObj.businessType) && this.$route.query.source === 'jointList'
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
		JointWorkAssign,
		BlUpload,
		// OneServiceFee,
		Exchange,
		ExportPop,
		SyncOrder
	},
	watch: {
		activityType() {
			this.$refs.blExchangeTable.clearSelection()
			this.getBlList()
		}
	},
	methods: {
		setType() {
			this.getSubTypeList()
			this.getBlList()
		},
		// 获取子服务类型选中状态
		getSubTypeList() {
			getSubTypeList({ orderNo: this.oQuery.orderNo, serviceCodes: [this.serviceCode] }).then(res => {
				if (res.data) {
					// 设置选中状态
					;['hbl_to_mbl', 'mbl_to_paper'].map(item => {
						this.setCheckValue(res.data, item)
					})

					//设置当前tab
					if (this.serviceCheckout.length > 0) {
						this.activityType = this.serviceCheckout[0].value
					}
				} else {
					// 全部设为未选中
					this.hbl_to_mbl = 'n'
					this.mbl_to_paper = 'n'
				}
			})
		},
		// 查找对应类型的状态
		setCheckValue(data, prop) {
			let item = data.find(item => item.typeCode === prop)
			if (item) {
				this[prop] = item.chooseStatus
			} else {
				this[prop] = 'n'
			}
		},
		handleGetServiceStatus() {
			let { serviceInfoList } = this.orderInfo
			let sItem = serviceInfoList.find(item => item.serviceCode === this.serviceCode)
			return sItem ? sItem.serviceStatus : ''
		},
		// 子服务类型保存
		subTypeSave(typeCode) {
			console.log('🚀 ~ typeCode', typeCode)
			let typeName
			let chooseStatus = this[typeCode]
			switch (typeCode) {
				case 'hbl_to_mbl':
					typeName = 'H换M'
					break
				case 'mbl_to_paper':
					typeName = '换提货纸'
					break

				default:
					break
			}
			subTypeSave({
				serviceCode: this.serviceCode,
				typeCode: typeCode,
				typeName: typeName,
				orderNo: this.oQuery.orderNo,
				chooseStatus: chooseStatus
			})
				.then(_ => {
					if (chooseStatus === 'y') {
						// 选中类型  跳转到对应的tab
						this.activityType = typeCode
					} else if (chooseStatus === 'n' && this.serviceCheckout.length > 0) {
						this.activityType = this.serviceCheckout[0].value
					}
				})
				.catch(() => {
					// 保存失败时重置选中状态
					this.getSubTypeList()
				})
			// // 校验服务项进度
			// if (chooseStatus === 'y' && this.handleGetServiceStatus() === 'finish') {
			// 	this.$confirm('服务项进度已完成，新增新类型，服务项进度将自动变为处理中，是否确定要新增？', '确认?', {
			// 		confirmButtonText: '确定',
			// 		cancelButtonText: '取消',
			// 		type: 'warning'
			// 	})
			// 		.then(() => {
			// 			subTypeSave({
			// 				serviceCode: this.serviceCode,
			// 				typeCode: typeCode,
			// 				typeName: typeName,
			// 				orderNo: this.oQuery.orderNo,
			// 				chooseStatus: chooseStatus
			// 			})
			// 				.then(_ => {
			// 					// 刷新服务项进度
			// 					this.getOrderInfo()
			// 					// 选中类型  跳转到对应的tab
			// 					this.activityType = typeCode
			// 				})
			// 				.catch(() => {
			// 					// 保存失败时重置选中状态
			// 					this.getSubTypeList()
			// 				})
			// 		})
			// 		.catch(() => {
			// 			// 重置选中状态
			// 			this.getSubTypeList()
			// 		})
			// } else {
			// 	subTypeSave({
			// 		serviceCode: this.serviceCode,
			// 		typeCode: typeCode,
			// 		typeName: typeName,
			// 		orderNo: this.oQuery.orderNo,
			// 		chooseStatus: chooseStatus
			// 	})
			// 		.then(_ => {
			// 			if (chooseStatus === 'y') {
			// 				// 选中类型  跳转到对应的tab
			// 				this.activityType = typeCode
			// 			} else if (chooseStatus === 'n' && this.serviceCheckout.length > 0) {
			// 				this.activityType = this.serviceCheckout[0].value
			// 			}
			// 		})
			// 		.catch(() => {
			// 			// 保存失败时重置选中状态
			// 			this.getSubTypeList()
			// 		})
			// }
		},

		cellClassName({ row, column, rowIndex, columnIndex }) {
			if ([7, 8, 9, 10, 11].includes(columnIndex)) {
				return 'table-column-td'
			}
			return ''
		},
		handleExportAppriverNotice() {
			if (this.multipleSelection.length !== 1) {
				return this.$message.error('请选择单个提单导出!')
			}
			this.exportPopShow = true
		},
		exportPopClose(action, value) {
			// console.log(action, value)
			if (action === 'Confirm') {
				this.handleExport(value)
			} else {
				this.exportPopShow = false
			}
		},
		handleExport(value) {
			this.$store
				.dispatch('order/exportBlobFile', {
					uri: '/order/shipping/blExchange/exportArriverNotice',
					data: {
						orderNo: this.$route.query.orderNo,
						// jointNo: this.$route.query.jointNo,
						blId: this.multipleSelection[0].blId,
						docType: value.docType
					}
				})
				.then(res => {
					this.exportPopShow = false
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = `ARRIVER NOTICE${this.$route.query.orderNo}.` + value.docType.toLowerCase()
					link.click()
				})
		},
		// 海外分公司 海外代理弹窗关闭
		exchangePopClose(val, form) {
			console.log('🚀 ~ form', form)
			console.log('🚀 ~ val', val)
			this.exchangeShow = false
			if (val === 'Confirm') {
				this.exchangeStatus = ''
				this.getBlList()
			}
		},
		// 获取提单列表
		getBlList() {
			blExchangeList({ orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				this.blExchangeList = res.data || []
			})
		},
		tableRowClassName({ row, rowIndex }) {
			if (row.blType == 'mbl' && this.activityType === 'hbl_to_mbl') return 'checkDisabled'
			if (row.blType == 'hbl' && this.activityType === 'mbl_to_paper') return 'checkDisabled'
			return ''
		},
		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
			if (this.activityType === 'hbl_to_mbl') {
				this.multipleSelection = this.multipleSelection.filter(item => item.blType === 'hbl')
			} else {
				this.multipleSelection = this.multipleSelection.filter(item => {
					return item.blType === 'mbl'
				})
			}
			console.log('🚀 ~ this.multipleSelection', this.multipleSelection)
		},
		// 全选/全不选
		handleSelectAll(selection) {
			//table第一层只要有在selection里面就是全选
			const isSelect = selection.some(el => {
				const blIds = this.blExchangeList.map(j => j.blId)
				return blIds.includes(el.blId)
			})
			//table第一层不在selection里面就是全不选
			const isCancel = !this.blExchangeList.some(el => {
				const selectOids = selection.map(j => j.blId)
				return selectOids.includes(el.blId)
			})
			if (isSelect) {
				selection.map(el => {
					if (el.children) {
						el.children.map(j => {
							this.toggleSelection(j, true)
						})
					}
				})
			}
			if (isCancel) {
				this.blExchangeList.map(el => {
					if (el.children) {
						el.children.map(j => {
							this.toggleSelection(j, false)
						})
					}
				})
			}
		},
		toggleSelection(row, select) {
			if (row) {
				this.$nextTick(() => {
					this.$refs.blExchangeTable && this.$refs.blExchangeTable.toggleRowSelection(row, select)
				})
			} else {
				this.$refs.blExchangeTable.clearSelection()
			}
		},
		// 获取选中的blId
		getOids() {
			let blIds = []
			this.multipleSelection.map(item => {
				blIds.push(item.blId)
			})
			return blIds
		},
		validate() {
			return true
		},
		// 修改提单状态
		handleUpdateStatus(val) {
			console.log('🚀 ~ val', val)
			if (!val) return
			console.log('🚀 ~ this.multipleSelection', this.multipleSelection)
			if (!this.multipleSelection.length) {
				return this.$message({
					type: 'error',
					message: '请先选择数据',
					duration: 1000,
					onClose: () => {
						this.exchangeStatus = ''
					}
				})
			}
			// 修改为已换单时 弹窗新增海外代理 分公司
			if (val === 'exchange') {
				this.exchangeShow = true
				this.exchangeData = {
					blIds: this.getOids(),
					orderNo: this.oQuery.orderNo,
					jointNo: this.oQuery.jointNo,
					status: 'exchange',
					isShipImport: this.isShipImport
				}
				return
			}
			this.$confirm('是否确认修改状态?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let blIds = this.getOids()
					return blExchangeUpdateStatus({
						blIds: blIds,
						orderNo: this.oQuery.orderNo,
						jointNo: this.oQuery.jointNo,
						status: val
					})
				})
				.then(response => {
					this.$message({
						type: 'success',
						message: '修改换单状态成功',
						duration: 1000,
						onClose: () => {
							this.exchangeStatus = ''
							this.getBlList()
						}
					})
				})
				.catch(err => {
					this.exchangeStatus = ''
				})
		},
		handleDownload(fileNo, fileName) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: fileNo
					}
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = fileName
					link.click()
				})
		},
		handleView(fileNo, fileName) {
			this.$store.dispatch('order/previewFile', { fileNo: fileNo, fileName: fileName })
		},
		// 上传前钩子获取file名
		getFile(file) {
			this.file = file
			let sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
			if (!sizeLimit) {
				this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制')
			}
			return sizeLimit
		},
		// 新添加文件替换之前添加的文件
		handleChangeFile(file, fileList) {
			this.fileList = fileList
		},
		// 移除文件
		handleRemove(file, fileList) {
			this.fileList = fileList
		},
		handleImport(content, row) {
			console.log(content, row)
			// 根据后台需求数据格式
			const form = new FormData()
			// 文件对象
			form.append('fileName', this.file)
			form.append('blId', row.blId)
			form.append('typeCode', 'order_release_guarantee')
			form.append('orderNo', this.oQuery.orderNo)
			this.oQuery.jointNo && form.append('jointNo', this.oQuery.jointNo)

			this.$store
				.dispatch('user/import', {
					uri: '/order/shipping/blExchange/uploadGuarantee',
					params: form
				})
				.then(res => {
					this.fileList = []
					if (res.data.code === 0) {
						this.$message({
							type: 'success',
							message: '导入成功'
						})
						this.getBlList()
					}
				})
				.catch(err => {
					this.$message.error(err.message)
				})
		},
		jointWorkAssignCallback() {
			this.getJointServiceWorkList(this.serviceCode)
		}
	}
}
</script>
<style lang="scss">
@import '../../../less/index.scss';
.change-checkbox {
	.menu-title {
		margin-right: 10px;
	}
	.el-checkbox__label {
		font-size: 12px;
	}
}
.el-table .cell.el-tooltip {
	overflow: hidden !important;
}
.el-table.blExchangeList td.table-column-td .cell {
	padding: 0 !important;
	.column-div {
		line-height: 20px;
		min-height: 20px;
		padding: 0;
		border-bottom: 1px solid #ebeef5;
		&:last-child {
			border-bottom: 0;
		}
	}
}
.icon-hbl {
	display: inline-block;
	width: 14px;
	height: 14px;
	background: #3e80f5;
	border-radius: 2px;
	color: #fff;
	line-height: 14px;
	text-align: center;
	font-style: normal;
}
.checkDisabled {
	.el-checkbox {
		display: none;
	}
}
.operate-group {
	.file-name {
		span {
			display: inline-block;
			line-height: 15px;
			max-width: 240px;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}
	}
}
</style>
