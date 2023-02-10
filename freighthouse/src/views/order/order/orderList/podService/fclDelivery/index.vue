<template>
	<div class="edit-container order-book fullWrap" id="fclDelivery">
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
					<div class="flex1 component-main-cont" v-loading="lsLoading" :element-loading-text="eLoadingText" :element-loading-spinner="eLoadingSpinner" :element-loading-background="eLoadingBackground">
						<div class="service-container" id="container" @scroll="handleScroll">
							<ServiceCustInfo :orderInfo="orderInfo" :serviceCode="serviceCode" @info="getOrderInfo" @routerPush="handleToRoute"></ServiceCustInfo>
							<div v-if="isImport" class="component-cont" style="padding-bottom: 0">
								<div class="inspection-menu-checkbox">
									<span class="menu-title">请选择类型:</span>
									<el-checkbox @change="subTypeSave('pod_fcl_delivery_bonded')" v-model="pod_fcl_delivery_bonded" true-label="y" false-label="n"> 保税类型 </el-checkbox>
									<el-checkbox @change="subTypeSave('pod_fcl_delivery_not_bonded')" v-model="pod_fcl_delivery_not_bonded" true-label="y" false-label="n"> 非保税类型 </el-checkbox>
									<sync-order @setType="setType" v-if="orderInfo.serviceType === 'st10' && orderInfo.exportOrderNo&& !isJoint" :serviceCode="serviceCode" />
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
							<!-- 进口保税隐藏委托信息 -->
							<!-- <div
								v-if="(isImport && activityType === 'pod_fcl_delivery_not_bonded') || !isImport"
								class="remark-container"
								id="remarkTable"
							>
								<div class="remark-tit-row">
									<span class="tit">委托信息</span>
									<div class="operate">
										<el-button type="primary" size="mini" class="ml10" @click="handleCreate" :disabled="!isOp || isFinish || isDisabledEdit">新增委托</el-button>
										<span class="expand ml10" @click="handleToogleExpand"> {{ remarkShow ? '收起' : '展开' }}<i :class="remarkShow ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
									</div>
								</div>
								<SoInfo :soList="soList" :isDisabledEdit="isDisabledEdit" @delete="handleDeleteServiceInfo" v-if="remarkShow"></SoInfo>
							</div> -->
							<div v-if="(isImport && serviceCheckout.length > 0) || !isImport" class="component-cont table-com-layout" id="intrustTable">
								<div class="between h28">
									<div class="ft12 bold">委托计划</div>
									<div>
										<ButtonTip
											v-if="isExport"
											btnType="default"
											:btnDisabled="(isBd && !isImportJoint) || isDisabledEdit"
											btnText="推送海外客服"
											:tipContent="isDocTip || isJointTip || isFinishTip || statusTip"
											class="operateBtn-tip"
											@click="handlePushOversea"
										>
										</ButtonTip>
										<!-- <el-button v-if="isExport" size="mini" type="default" :disabled="(isBd && !isImportJoint) || isDisabledEdit" @click="handlePushOversea">推送海外客服</el-button> -->
										<!-- <el-button size="mini" type="default" :disabled="(isBd && !isImportJoint) || isDisabledEdit" class="mr10" @click="handleOpenExportPop">输出派车委托单</el-button> -->
										<el-dropdown size="small" @command="handleCommand" class="ml10">
											<el-button size="mini" type="default" :disabled="(isBd && !isImportJoint) || isDisabledEdit" class="mr10"> 输出<i class="el-icon-arrow-down el-icon--right"></i> </el-button>
											<el-dropdown-menu slot="dropdown">
												<el-dropdown-item :command="item.value" v-for="(item, index) in exportTypeOptions" :key="index">{{ item.label }}</el-dropdown-item>
											</el-dropdown-menu>
										</el-dropdown>
										<span>委托状态：</span>
										<el-select style="width: 120px" placeholder="请选择" size="mini" v-model="status" @change="handleUpdateIntrustStatus" :disabled="(isBd && !isImportJoint) || isDisabledEdit">
											<el-option v-for="(item, index) in dictMap.podDeliveryFclStatus" :key="index" :label="item.label" :value="item.value"></el-option>
										</el-select>
										<ButtonTip btnType="primary" :btnDisabled="(isBd && !isImportJoint) || isDisabledEdit" btnText="新增计划" :tipContent="isDocTip || isJointTip || isFinishTip || statusTip" class="operateBtn-tip ml10" @click="handleAdd">
										</ButtonTip>
										<!-- <el-button size="mini" type="primary" class="ml10" @click="handleAdd" :disabled="(isBd && !isImportJoint) || isDisabledEdit">新增计划</el-button> -->
									</div>
								</div>
								<el-table ref="multipleTable" fit style="width: 100%" :data="list" @selection-change="handleSelectionChange">
									<el-table-column type="selection" :selectable="selectable"></el-table-column>
									<el-table-column prop="intrustNo" label="委托编号" align="center" width="140"> </el-table-column>
									<el-table-column prop="status" label="委托状态" align="center">
										<template slot-scope="scope">
											{{ scope.row.status | podDeliveryFclStatusFilter }}
										</template>
									</el-table-column>
									<el-table-column width="150" show-overflow-tooltip="" prop="overseaAgentSupplierName" label="海外代理" align="center" v-if="isExport" key="overseaAgentSupplierName"> </el-table-column>
									<el-table-column v-if="$route.query.isPendding != 'pendding'" prop="overseasCompanyName" label="海外分公司" align="center" width="150"></el-table-column>
									<el-table-column prop="supplierName" label="车队" align="center">
										<template slot-scope="scope">
											<el-select
												style="width: 100%"
												placeholder="请选择"
												size="mini"
												v-model="scope.row.supplierId"
												clearable
												:filterable="true"
												@visible-change="supplierVisibleChange"
												:filter-method="supplierFilterMehod"
												v-if="scope.row.isAdd || scope.row.isEdit"
												@change="val => handleSelectSupplierName(scope.$index, val)"
											>
												<el-option v-for="item in supplierList" :key="item.supplierId" :label="item.label" :value="item.value"></el-option>
											</el-select>
											<span v-else>{{ scope.row.supplierName }}</span>
										</template>
									</el-table-column>

									<el-table-column show-overflow-tooltip="" prop="unloadAddress" label="卸货详细地址" align="center" width="200"></el-table-column>
									<el-table-column show-overflow-tooltip="" prop="consignee" label="收货人" align="center" width="100"></el-table-column>
									<el-table-column prop="preDeliveryTime" label="预计派送时间" align="center"></el-table-column>
									<el-table-column prop="deliveryTime" label="实际派送时间" align="center"></el-table-column>
									<el-table-column prop="returnEmptyBoxTime" label="还空柜时间" align="center"></el-table-column>

									<el-table-column label="操作" width="150" align="center" fixed="right">
										<template slot-scope="scope">
											<div class="operate-group">
												<!-- <el-button @click="handleEdit(scope.row)" type="text" size="mini" v-if="!scope.row.isAdd && !scope.row.isEdit" :disabled="(isBd && !isImportJoint) || isDisabledEdit">编辑</el-button> -->

												<el-button @click="handleInfo(scope.row)" type="text" size="mini" v-if="!scope.row.isAdd && !scope.row.isEdit">详情</el-button>
												<ButtonTip
													v-if="!scope.row.isEdit"
													btnType="text"
													:btnDisabled="(isBd && !isImportJoint) || isDisabledEdit"
													btnText="删除"
													:tipContent="isDocTip || isJointTip || isFinishTip || statusTip"
													class="operateBtn-tip"
													btnClassName="red"
													@click="handleDelete(scope.row, scope.$index)"
												>
												</ButtonTip>
												<!-- <el-button @click="handleDelete(scope.row, scope.$index)" class="red" type="text" size="mini" :disabled="(isBd && !isImportJoint) || isDisabledEdit" v-if="!scope.row.isEdit">删除</el-button> -->
												<ButtonTip
													v-if="scope.row.isEdit"
													btnType="text"
													:btnDisabled="(isBd && !isImportJoint) || isDisabledEdit"
													btnText="取消"
													:tipContent="isDocTip || isJointTip || isFinishTip || statusTip"
													class="operateBtn-tip"
													@click="handleCancel(scope.row, scope.$index)"
												>
												</ButtonTip>
												<!-- <el-button @click="handleCancel(scope.row, scope.$index)" type="text" size="mini" v-if="scope.row.isEdit" :disabled="(isBd && !isImportJoint) || isDisabledEdit">取消</el-button> -->
												<ButtonTip btnType="text" :btnDisabled="(isBd && !isImportJoint) || isDisabledEdit" btnText="复制" :tipContent="isDocTip || isJointTip || isFinishTip || statusTip" class="operateBtn-tip" @click="handleCopy(scope.row)">
												</ButtonTip>
												<!-- <el-button @click="handleCopy(scope.row)" type="text" size="mini" :disabled="(isBd && !isImportJoint) || isDisabledEdit">复制</el-button> -->
												<!-- <el-button @click="handleSave(scope.row, scope.$index)" type="text" size="mini" v-if="scope.row.isAdd || scope.row.isEdit" :disabled="(isBd && !isImportJoint) || isDisabledEdit">保存</el-button> -->
											</div>
										</template>
									</el-table-column>
								</el-table>
							</div>
							<TruckLoad
								ref="truckLoad"
								:actionType="actionType"
								@getFclIntrustList="getFclIntrustList"
								@hideDetail="hideDetail"
								:activityType="activityType"
								:isDisabledEdit="isDisabledEdit"
								:truckDetailQuery="truckDetailQuery"
								:saveBarFixed="saveBarFixed"
								:orderInfo="orderInfo"
								:isDocTip="isDocTip"
								:isJointTip="isJointTip"
								:isFinishTip="isFinishTip"
								:statusTip="statusTip"
								v-if="showTruckLoad"
							/>
							<!-- <OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="'pod_fcl_delivery'" /> -->
						</div>
						<JointWorkAssign :jointServiceWorkList="jointServiceWorkList" :serviceCode="serviceCode" @callback="jointWorkAssignCallback" />
						<!-- 输出拖车委托单弹窗 -->
						<div v-if="exportPopShow">
							<ExportPop @close="exportPopClose" />
						</div>
						<!-- 创建委托信息弹窗 -->
						<div v-if="createShow">
							<Create @close="createPopClose" />
						</div>
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
import { baseSupplierList, basePortListByCodes } from '@/api/base'
import { orderInfo, orderJointInfo, listOverseasSelect, serviceInfoSave, serviceInfoList, serviceInfoDelete, subTypeSave, getSubTypeList } from '@/api/order/list'
import { supplierInfo } from '@/api/crm/supplier'
import { fclIntrustListWithLoadInfo, fclIntrustSave, fclIntrustDelete, fclReqno, fclStatusChange, pushToEcs } from '@/api/order/podService/fclDelivery'
import CancelApplyAlert from '../../components/cancelApplyAlert'
import CancelAlert from '../../components/cancelAlert'
import RefuseAlert from '../../components/refuseAlert'
import TopNav from '../../components/topNav'
import LeftNav from '../../components/leftNav'
import ServiceCustInfo from '../../components/serviceCustInfo'
import JointWorkAssign from '@/views/order/order/jointList/components/workAssign'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'
import TruckLoad from './components/truckLoad'
import ExportPop from './components/exportPop'
import SoInfo from './components/soInfo'
import Create from './components/create'
import SyncOrder from '@/views/order/order/orderList/podService/changeDocument/components/syncOrder.vue'

export default {
	filters: {
		dispatchStatusFilter(status) {
			return getDictLabel('fclDispatchStatus', status)
		},
		podDeliveryFclStatusFilter(status) {
			return getDictLabel('podDeliveryFclStatus', status)
		}
	},
	mixins: [orderMixin, routerMixin],
	provide() {
		return {
			curRow: () => this.curRow
		}
	},
	data() {
		return {
			curRow: null,
			actionType: 'add',
			activityType: 'pod_fcl_delivery_not_bonded',
			pod_fcl_delivery_not_bonded: 'n',
			pod_fcl_delivery_bonded: 'n',
			truckDetailQuery: {},
			showTruckLoad: false,
			oQuery: this.$route.query,
			seqNo: '', // 委托编号
			status: '', // 委托状态

			list: [], // table渲染需要的数据
			resList: [], // 接口返回的列表数据
			addList: [], // 新增的列表数据
			isEditRows: [],
			multipleSelection: [],
			supplierList: [],
			cust: {},
			canSave: true,
			overseaAgentSupplierId: '',
			overseaAgentSupplierName: '',
			agentSupplierList: [],
			routeName: 'PodFclDelivery',
			activityKey: '',
			serviceCode: 'pod_fcl_delivery',
			saveBarFixed: false,
			exportPopShow: false, // 输出弹窗
			exportType: '',
			currIntrustNo: '',
			remarkShow: true,
			createShow: false,
			soList: [], //so列表
			exportTypeOptions: [
				{ label: '派车单', value: 'send' },
				{ label: '签收单', value: 'sign' },
				{ label: 'DELIERY ORDER', value: 'delieryOrder' }
			]
		}
	},
	created() {
		this.getOrderInfoData()
		this.getFclIntrustList()
		this.getServiceInfoList()
		if (this.jointShow) {
			this.getJointServiceWorkList(this.serviceCode)
		}
		this.getSubTypeList()
	},
	mounted() {
		if (window.history && window.history.pushState) {
			history.pushState(null, null, document.URL)
			window.addEventListener('popstate', this.browserBack, false)
		}
		this.getListOverseas()
	},
	destroyed() {
		window.removeEventListener('popstate', this.browserBack, false)
	},
	computed: {
		serviceCheckout() {
			return this.dictMap.servicePodFclDelivery.filter(item => this[item.value] === 'y')
		},
		statusOptions() {
			let result = this.dictMap.podDeliveryFclStatus.filter(item => item.value !== 'init')
			return result
		},
		isEpricing() {
			return this.userEditRoles.includes('epricing')
		},
		isEcs() {
			return this.userEditRoles.includes('ecs')
		},
		isBd() {
			console.log('isJoint', this.isJoint)
			let isJoint = this.isJoint
			if (this.$route.query.jointNo) {
				isJoint = false
			}
			// let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'ac' || this.ordDetRole === 'op' || this.ordDetRole === 'op_truck' || (!this.isDoc && !this.isEpricing && !this.isEcs)
			let isBd = !this.isDoc && !this.isEpricing && !this.isEcs && !this.isOp && !this.isOpTruck // 放开操作权限
			return isBd || isJoint || this.isFinish
		},
		// 业务类型为进口，海外仓的
		isImport() {
			return ['ship_import_fcl', 'ship_import_lcl', 'ship_oversea_wh'].includes(this.orderInfo.businessType)
		},
		isImportFcl() {
			return this.orderInfo.businessType === 'ship_import_fcl'
		},
		// 业务类型为出口的
		isExport() {
			return ['ship_export_fcl', 'ship_export_lcl'].includes(this.orderInfo.businessType)
		},
		// 业务类型为散杂滚装
		isBulkRo() {
			return ['ship_bulk_ro'].includes(this.orderInfo.businessType)
		},
		// 20220509特殊处理为进口协同单的服务项权限都放开
		isImportJoint() {
			return this.isImport && ['jointList', 'whJointList'].includes(this.$route.query.source)
		},
		isFinish() {
			let findItem = this.serviceInfoList.find(item => item.serviceCode === this.serviceCode)
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
		isDisabledEdit() {
			// 订单状态非（完成、取消）状态，且订单还未总关账，只要服务项进度未完成,就可以编辑
			if (this.isFinish) {
				return true
			} else if (['complete', 'cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus)) {
				return true
			} else {
				return false
			}
		},
		isOp() {
			// return this.ordDetRole === 'op'
			return this.userEditRoles.includes('op') || this.userEditRoles.includes('line_cs')
		},
		isOpTruck() {
			return this.userEditRoles.includes('op_truck')
		},
		isFinishTip() {
			if (this.isFinish) {
				return '该服务项已完成，不允许操作'
			}
		},
		isJointTip() {
			if (this.isJoint) {
				return '该服务项被协同，不允许操作'
			}
		},
		isDocTip() {
			// 出口整箱，非文件，海外客服，海外商务
			if (this.isExport || this.isBulkRo) {
				if (!this.isDoc && !this.isOp && !this.isEpricing && !this.isEcs) {
					return '非文件，操作，海外客服，海外商务，不允许操作'
				}
			}
			// 海外仓，非操作，海外客服，海外商务
			if (['ship_oversea_wh'].includes(this.orderInfo.businessType)) {
				if (!this.isDoc && !this.isEpricing && !this.isEcs) {
					return '非操作，海外客服，海外商务，不允许操作'
				}
			}
			// 进口整箱、非操作，拖报操作，海外客服，海外商务
			if (['ship_import_fcl'].includes(this.orderInfo.businessType)){
				if (!this.isDoc && !this.isOpTruck && !this.isEpricing && !this.isEcs) {
					return '非操作，拖报操作，海外客服，海外商务，不允许操作'
				}
			}
			// 进口拼箱，非操作，拖报，海外客服，海外商务
			if (['ship_import_lcl'].includes(this.orderInfo.businessType)) {
				if (!this.isDoc && !this.isOpTruck && !this.isEpricing && !this.isEcs) {
					return '非操作，拖报操作，海外客服，海外商务，不允许操作'
				}
			}
			// 报关单，非关务操作
			if (['ship_customs', 'ship_export_customs', 'ship_import_customs'].includes(this.orderInfo.businessType)) {
				if (this.ordDetRole !== 'op_truck') {
					return '非关务操作，不允许操作'
				}
			}
		},
		statusTip() {
			if (['complete', 'cancel'].includes(this.$store.state.order.orderInfoDataObj.orderStatus)) {
				return '订单状态为已取消、已完成，不允许操作'
			}
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
		// OneServiceFee,
		TruckLoad,
		ExportPop,
		SoInfo,
		Create,
		SyncOrder
	},
	props: {},
	watch: {
		activityType(val) {
			console.log('🚀 ~ val', val)
			this.getFclIntrustList()
			this.showTruckLoad = false
		},
		addList: {
			handler(nweValue, oldValue) {
				this.list = this.resList.concat(nweValue)
			},
			deep: true
		}
	},
	methods: {
		setType() {
			console.log('🚀 ~ setType')
			this.getSubTypeList()
			this.getFclIntrustList()
		},
		// 输出
		handleCommand(command) {
			this.handleOpenExportPop(command)
		},
		handleGetServiceStatus() {
			let { serviceInfoList } = this.orderInfo
			let sItem = serviceInfoList.find(item => item.serviceCode === 'pod_fcl_delivery')
			return sItem ? sItem.serviceStatus : ''
		},
		// 获取子服务类型选中状态
		getSubTypeList() {
			getSubTypeList({ orderNo: this.oQuery.orderNo, serviceCodes: ['pod_fcl_delivery'] }).then(res => {
				if (res.data) {
					// 设置选中状态
					;['pod_fcl_delivery_not_bonded', 'pod_fcl_delivery_bonded'].map(item => {
						this.setCheckValue(res.data, item)
					})

					//设置当前tab
					if (this.serviceCheckout.length > 0) {
						this.activityType = this.serviceCheckout[0].value
					}
				} else {
					// 全部设为未选中
					this.pod_fcl_delivery_not_bonded = 'n'
					this.pod_fcl_delivery_bonded = 'n'
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
		// 子服务类型保存
		subTypeSave(typeCode) {
			console.log('🚀 ~ typeCode', typeCode)
			let typeName
			let chooseStatus = this[typeCode]
			switch (typeCode) {
				case 'pod_fcl_delivery_not_bonded':
					typeName = '非保税类型'
					break
				case 'pod_fcl_delivery_bonded':
					typeName = '保税类型'
					break

				default:
					break
			}
			// 校验服务项进度
			if (chooseStatus === 'y' && this.handleGetServiceStatus() === 'finish') {
				this.$confirm('服务项进度已完成，新增新类型，服务项进度将自动变为处理中，是否确定要新增？', '确认?', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				})
					.then(() => {
						subTypeSave({
							serviceCode: 'pod_fcl_delivery',
							typeCode: typeCode,
							typeName: typeName,
							orderNo: this.oQuery.orderNo,
							chooseStatus: chooseStatus
						})
							.then(_ => {
								// 刷新服务项进度
								this.getOrderInfo()
								// 选中类型  跳转到对应的tab
								this.activityType = typeCode
							})
							.catch(() => {
								// 保存失败时重置选中状态
								this.getSubTypeList()
							})
					})
					.catch(() => {
						// 重置选中状态
						this.getSubTypeList()
					})
			} else {
				subTypeSave({
					serviceCode: 'pod_fcl_delivery',
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
			}
		},
		getListOverseas() {
			listOverseasSelect({ orderNo: this.$route.query.orderNo }).then(res => {
				this.agentSupplierList = res.data || []
				this.agentSupplierList.forEach(item => {
					Object.assign(item, {
						label: item.name,
						value: Number(item.code)
					})
				})
			})
		},
		handleScroll() {
			// let saveBarDom = document.querySelector("#saveBar")
			let contDom = document.querySelector('#container')
			let intrustTable = document.querySelector('#intrustTable')
			let truckTable = document.querySelector('#truckTable')
			let scrollTop = contDom.scrollTop
			let intrustTableHeight = intrustTable.offsetHeight
			let truckTableHeight = truckTable.offsetHeight
			if (scrollTop > intrustTableHeight + truckTableHeight + 36 + 8) {
				// table高度和custInfo组件的高度
				this.saveBarFixed = true
			} else {
				this.saveBarFixed = false
			}
		},
		hideDetail() {
			this.currIntrustNo = ''
			this.showTruckLoad = false
		},
		// 获取订单详情
		getOrderInfoData() {
			let { source, orderNo, jointNo } = this.$route.query
			if (jointNo) {
				return orderJointInfo({ jointNo: jointNo }).then(res => {
					this.orderInfo = res.data
					this.getInit(this.orderInfo)
					this.initData(this.orderInfo)
				})
			}
			orderInfo({ orderNo: orderNo }).then(res => {
				this.orderInfo = res.data
				this.getInit(this.orderInfo)
				this.initData(this.orderInfo)
			})
		},
		selectable(row) {
			return row.oid ? true : false
		},
		initData(orderInfo) {
			// this.overseaAgentSupplierId = orderInfo.transport ? orderInfo.transport.overseaAgentSupplierId : ''
			// this.overseaAgentSupplierName = orderInfo.transport ? orderInfo.transport.overseaAgentSupplierName : ''
			// 存储客户id
			let cust = {
				custid: orderInfo.custid,
				custName: orderInfo.custName,
				custIntrustNo: orderInfo.custIntrustNo,
				businessType: orderInfo.businessType,
				serviceType: orderInfo.serviceType
			}
			sessionStorage.setItem('custStr', JSON.stringify(cust))
			let portCode = orderInfo.ship.podPortCode
			if (portCode) {
				basePortListByCodes(portCode).then(res => {
					if (res.data && res.data.length) {
						res.data.map(item => {
							return Object.assign(item, {
								label: this.$language === 'en' ? item.ename : item.cname,
								value: item.portCode
							})
						})
						let portInfo = res.data
						sessionStorage.setItem('portInfoStr', JSON.stringify(portInfo))
					}
				})
			}
			console.log(portCode)
			// this.agentSupplierList = [{label:this.overseaAgentSupplierName, value: this.overseaAgentSupplierId}]
			console.log(this.overseaAgentSupplierId, this.overseaAgentSupplierName)
		},
		supplierFilterMehod(val) {
			this.getSupplierList(val)
		},
		supplierVisibleChange(val) {
			if (val) {
				this.getSupplierList()
			}
		},
		getSupplierList(val = '') {
			this.$store.dispatch('dict/querySupplierList', { category: 'serviceCode', value: 'truck', queryString: val }).then(data => {
				this.supplierList = data.list.map(item => {
					return Object.assign(item, {
						label: this.$language == 'en' ? item.ename : item.name,
						value: item.supplierId ? Number(item.supplierId) : ''
					})
				})
			})
		},
		// 选择车队下拉，自动填充车队联系人，联系电话
		handleSelectSupplierName(index, val) {
			if (val) {
				let sItem = this.supplierList.filter(item => item.value === val)
				Object.assign(this.list[index], {
					supplierName: sItem.length ? sItem[0].supplierName : ''
				})
				supplierInfo({ supplierId: val }).then(res => {
					let { contact } = res.data
					Object.assign(this.list[index], {
						supplierContact: contact && contact.length ? contact[0].name || contact[0].ename : '',
						supplierContactPhone: contact && contact.length ? contact[0].mobileNo : ''
					})
				})
			} else {
				Object.assign(this.list[index], {
					supplierId: '',
					supplierName: '',
					supplierContact: '',
					supplierContactPhone: ''
				})
			}
		},
		agentSupplierFilterMehod(val, row) {
			this.getAgentSupplierList(val, row)
		},
		agentSupplierVisibleChange(val, row) {
			if (val) {
				this.getAgentSupplierList(undefined, row)
			}
		},
		getAgentSupplierList(val = '', row) {
			this.$store.dispatch('dict/querySupplierList', { category: 'category', value: 'dest_agent', queryString: val }).then(data => {
				this.agentSupplierList = data.list.map(item => {
					return Object.assign({}, item, {
						label: this.$language == 'en' ? item.ename : item.name,
						value: item.supplierId ? Number(item.supplierId) : ''
					})
				})
				// row.agentSupplierList = this.agentSupplierList
				console.log(this.agentSupplierList)
			})
		},
		// 选择海外代理人
		handleSelectAgentSupplierName(index, val) {},
		// 委托列表
		getFclIntrustList(index) {
			this.lsLoading = true
			// 新增参数是否保税
			let isBonded = this.activityType === 'pod_fcl_delivery_bonded' ? 'Y' : 'N'

			fclIntrustListWithLoadInfo({
				isBonded,
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo
			})
				.then(res => {
					let { data } = res
					this.resList = data.map(item => {
						return Object.assign(item, {
							isAdd: false,
							isEdit: false
						})
					})
					this.list = this.resList.concat(this.addList)
					// 从可编辑的行数组集合中去掉要保存的当前行
					this.isEditRows = this.isEditRows.filter(item => item !== this.list[index].oid)
					this.list.forEach(item => {
						if (this.isEditRows.includes(item.oid)) {
							Object.assign(item, {
								isEdit: true
							})
						}
					})
					console.log(this.isEditRows)
				})
				.finally(() => {
					this.lsLoading = false
				})
		},

		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
		},

		// 获取选中的编号
		getOids() {
			let intrustNos = []
			this.multipleSelection.map(item => {
				intrustNos.push(item.intrustNo)
			})
			return intrustNos
		},

		// 新增委托计划,table增加一行
		handleAdd() {
			this.actionType = 'add'
			this.showTruckLoad = true
			fclReqno().then(res => {
				// let hasAdd = this.addList.some(item => item.isAdd)
				// if (this.isEditRows.length === 1 || hasAdd) {
				// 	return this.$message({ type: 'warning', message: '请先保存委托计划' })
				// }
				// this.seqNo = res.data.seqNo
				let { orderNo, source, jointNo } = this.$route.query
				let intrustNo = res.data.seqNo
				this.truckDetailQuery = { intrustNo, orderNo, source, jointNo }
				// let { transport } = this.orderInfo
				// this.supplierList = [{ label: transport ? transport.truckSupplierName : '', value: transport ? transport.truckSupplierId : '' }]
				// this.agentSupplierList = []
				// this.addList.push({
				// 	isAdd: true,
				// 	isEdit: false,
				// 	orderNo: this.$route.query.orderNo,
				// 	intrustNo: this.seqNo,
				// 	overseaAgentSupplierId: '',
				// 	overseaAgentSupplierName: '',
				// 	supplierId: transport ? transport.truckSupplierId : '',
				// 	supplierContact: '',
				// 	supplierContactPhone: '',
				// 	supplierPhone: '',
				// 	remark: '',
				// 	status: 'init'
				// })
			})
		},

		// 编辑
		handleEdit(row) {
			// 存在正在编辑的或是新增的委托计划
			let hasAdd = this.addList.some(item => item.isAdd)
			if (this.isEditRows.length === 1 || hasAdd) {
				return this.$message({ type: 'warning', message: '请先保存委托计划' })
			}
			row.isEdit = true
			row.isAdd = false
			Object.assign(row, {
				supplierId: row.supplierId === 0 ? '' : row.supplierId
			})
			this.isEditRows.push(row.oid)
			this.supplierList = [{ label: row.supplierName, value: row.supplierId }]
			// Object.assign(row, {
			//   supplierList: [{label: row.supplierName, value: row.supplierId}]
			// })
			// row.supplierList = [{label: row.supplierName, value: row.supplierId}]
			console.log(this.supplierList)
			// this.agentSupplierList = [{ label: row.overseaAgentSupplierName, value: row.overseaAgentSupplierId }]
		},

		handleCancel(row) {
			row.isEdit = false
			row.isAdd = false
			this.getFclIntrustList()
			this.isEditRows = this.isEditRows.filter(item => item != row.oid)
			console.log(this.isEditRows)
		},

		validate(data) {
			// 出口业务需校验海外代理，进口业务没有海外代理
			if (this.isExport && !data.overseaAgentSupplierId) {
				this.$message({ type: 'error', message: '请选择海外代理' })
				return false
			}
			return true
		},

		// 新增保存
		handleSave(row, sIndex) {
			// 新增参数是否保税
			let isBonded = this.activityType === 'pod_fcl_delivery_bonded' ? 'Y' : 'N'
			let data = {
				isBonded,
				oid: row.oid,
				orderNo: row.orderNo,
				intrustNo: row.intrustNo,
				overseaAgentSupplierId: row.overseaAgentSupplierId,
				overseaAgentSupplierName: row.overseaAgentSupplierName,
				supplierId: row.supplierId,
				supplierName: row.supplierName,
				supplierContact: row.supplierContact,
				supplierContactPhone: row.supplierContactPhone,
				supplierPhone: row.supplierPhone,
				remark: row.remark
			}
			data.jointNo = this.$route.query.jointNo
			// 进口业务去掉海外代理
			if (this.isImport) {
				delete data.overseaAgentSupplierId
				delete data.overseaAgentSupplierName
			}
			// delete(data.addShow)
			// delete(data.status)
			// delete(data.dispatchStatus)

			if (!this.validate(data) || !this.canSave) return
			this.canSave = false
			fclIntrustSave(data)
				.then(res => {
					this.$message({
						type: 'success',
						message: '保存成功',
						duration: 1000,
						onClose: () => {
							this.canSave = true
							// 新增保存回调
							if (!row.oid) {
								let len = this.resList.length
								this.$delete(this.addList, sIndex - len)
							}
							this.getFclIntrustList(sIndex)
						}
					})
				})
				.catch(err => {
					setTimeout(() => {
						this.canSave = true
					}, 2000)
				})
		},

		// 详情
		handleInfo(row) {
			this.curRow = row
			this.actionType = 'info'
			let { source, jointNo } = this.$route.query
			let { orderNo, intrustNo, overseaAgentSupplierId, supplierName, supplierContact, supplierContactPhone, supplierPhone, remark } = row
			// let query = { orderNo, jointNo, intrustNo, source }
			this.truckDetailQuery = { orderNo, jointNo, intrustNo, source }
			// this.routerPush('ShippingFclDetail', query)
			this.showTruckLoad = true
			this.currIntrustNo = row.intrustNo
			//切换委托计划时 隐藏集装箱详情
			if (this.$refs.truckLoad) {
				this.$refs.truckLoad.showDetail = false
			}
		},

		// 复制
		handleCopy(row) {
			this.actionType = 'copy'
			let { source, jointNo } = this.$route.query
			let { orderNo, intrustNo, overseaAgentSupplierId, supplierName, supplierContact, supplierContactPhone, supplierPhone, remark } = row
			// let query = { orderNo, jointNo, intrustNo, source }
			this.truckDetailQuery = { orderNo, jointNo, intrustNo, source }
			// this.routerPush('ShippingFclDetail', query)
			this.showTruckLoad = true
			this.currIntrustNo = row.intrustNo
			//切换委托计划时 隐藏集装箱详情
			if (this.$refs.truckLoad) {
				this.$refs.truckLoad.showDetail = false
			}
		},

		// 删除
		handleDelete(row, sIndex) {
			if (!row.oid) {
				// 获取新增列表的下标，删除新增数组的该下标元素
				let len = this.resList.length
				this.$delete(this.addList, sIndex - len)
				return
			}

			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let data = {
						intrustNo: row.intrustNo,
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo
					}
					return fclIntrustDelete(data)
				})
				.then(response => {
					// 删除和打开详情的信息为同一条时，该条信息的详情则不显示
					if (this.currIntrustNo === row.intrustNo) {
						this.showTruckLoad = false
					}
					this.getFclIntrustList(sIndex)
					this.$message({ message: '删除成功', type: 'success' })
				})
				.catch(() => {})
		},

		// 委托状态修改
		handleUpdateIntrustStatus(val) {
			if (!this.getOids().length) {
				this.status = ''
				return this.$message.warning('请先选择委托计划')
			}
			this.$confirm('是否确认修改状态?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let data = Object.assign(
						{},
						{
							intrustNos: this.getOids(),
							status: val,
							orderNo: this.$route.query.orderNo,
							jointNo: this.$route.query.jointNo
						}
					)
					return fclStatusChange(data)
				})
				.then(response => {
					this.$message({
						type: 'success',
						message: '委托状态修改成功',
						duration: 1000,
						onClose: () => {
							this.status = ''
							this.getFclIntrustList()
							if (this.curRow) this.handleInfo(this.curRow)
						}
					})
				})
				.catch(err => {
					this.status = ''
				})
		},
		jointWorkAssignCallback() {
			this.getJointServiceWorkList(this.serviceCode)
		},
		// 推送海外客服
		handlePushOversea() {
			pushToEcs({ orderNo: this.$route.query.orderNo }).then(res => {
				if (res.msg === 'success') {
					this.$message.success('推送成功!')
				}
			})
		},
		// 打开输出弹窗
		handleOpenExportPop(type) {
			this.exportType = type
			if (this.multipleSelection.length !== 1) return this.$message({ type: 'warning', message: '请选择一条要导出的委托计划' })
			// 派车单;导出DELIERY ORDER
			if (type === 'send' || type === 'delieryOrder') {
				this.exportPopShow = true
			} else if (type === 'sign') {
				// 签收单默认导出excel格式附件
				this.handleExportSign()
			}
		},
		exportPopClose(action, value) {
			console.log(action, value)
			if (action === 'Confirm') {
				this.handleExport(value)
			} else {
				this.exportPopShow = false
			}
		},
		// 输出签收单
		handleExportSign() {
			let oid = this.multipleSelection[0].oid
			this.$store
				.dispatch('order/exportBlobFile', {
					uri: '/order/shipping/delivery/fcl/export/sign',
					data: {
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo,
						oid,
						docType: 'xls'
					}
				})
				.then(res => {
					this.exportPopShow = false
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = `签收单${this.$route.query.orderNo}.xls`
					link.click()
				})
		},
		// 输出派车单
		handleExport(value) {
			if (this.exportType === 'send') {
				this.$store
					.dispatch('order/exportBlobFile', {
						uri: '/order/shipping/delivery/fcl/export',
						data: {
							orderNo: this.$route.query.orderNo,
							jointNo: this.$route.query.jointNo,
							oid: this.multipleSelection[0].oid,
							docType: value.docType
						}
					})
					.then(res => {
						this.exportPopShow = false
						let link = document.createElement('a')
						link.href = window.URL.createObjectURL(res)
						link.download = `拖车委托单${this.$route.query.orderNo}.` + value.docType.toLowerCase()
						link.click()
					})
			}
			if (this.exportType === 'delieryOrder') {
				this.$store
					.dispatch('order/exportBlobFile', {
						uri: '/order/shipping/delivery/fcl/exportDeliveryOrder',
						data: {
							// orderNo: this.$route.query.orderNo,
							// jointNo: this.$route.query.jointNo,
							intrustNo: this.multipleSelection[0].intrustNo,
							docType: value.docType
						}
					})
					.then(res => {
						this.exportPopShow = false
						let link = document.createElement('a')
						link.href = window.URL.createObjectURL(res)
						link.download = `DELIERY ORDER${this.multipleSelection[0].intrustNo}.` + value.docType.toLowerCase()
						link.click()
					})
			}
		},
		handleToogleExpand() {
			this.remarkShow = !this.remarkShow
		},
		handleDeleteServiceInfo(row) {
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let data = {
						groupKey: row.groupKey,
						orderNo: this.$route.query.orderNo,
						serviceCode: this.serviceCode
					}
					serviceInfoDelete(data).then(res => {
						this.$message({ type: 'success', message: '删除成功' })
						this.getServiceInfoList()
					})
				})
				.catch(() => {})
		},
		handleCreate() {
			this.createShow = true
		},
		createPopClose(action, value) {
			if (action === 'Confirm') {
				this.handleServiceInfoSave(value)
			} else {
				this.createShow = false
			}
		},
		// 保存委托信息
		handleServiceInfoSave(value) {
			console.log(value)
			let data = {
				orderNo: this.$route.query.orderNo,
				serviceCode: this.serviceCode,
				infoData: []
			}
			data.infoData.push(value)
			serviceInfoSave(data).then(res => {
				this.$message({ type: 'success', message: '保存成功' })
				this.createShow = false
				this.getServiceInfoList()
			})
		},
		// 获取委托信息列表
		getServiceInfoList() {
			serviceInfoList({
				orderNo: this.$route.query.orderNo,
				serviceCode: this.serviceCode
			}).then(res => {
				this.soList = res.data || []
				// 按创建时间戳降序排序
				// this.soList.sort((a, b) => {
				// 	return b.createTimeStr - a.createTimeStr
				// })
				console.log('this.soList', this.soList)
			})
		}
	}
}
</script>
<style lang="scss">
@import '../../../less/index.scss';
.el-table .cell.el-tooltip {
	overflow: hidden !important;
}
.inspection-menu-checkbox {
	padding-left: 20px;
	padding-bottom: 6px;
	border-bottom: 1px solid #dfe6ec;
	display: flex;
	align-items: center;
	.menu-title {
		margin-right: 10px;
	}
}
.bold-word {
	font-weight: 700;
}
#fclDelivery {
	.component-cont {
		padding: 10px 20px;
	}
	.operateBtn-tip {
		padding: 0;
		display: inline-block;
	}
}
.remark-container {
	background-color: #fff;
	margin-top: 8px;
	.remark-tit-row {
		display: flex;
		justify-content: space-between;
		height: 28px;
		line-height: 20px;
		padding: 4px 20px;
		border-bottom: 1px solid #e6ebf5;
		.tit {
			display: block;
			font-weight: bold;
			font-size: 12px;
		}
		.operate {
			display: flex;
			.expand {
				cursor: pointer;
			}
			.trusk-time {
				display: flex;
			}
		}
	}
	.remark-row {
		padding: 8px 20px;
		overflow: hidden;
	}
}
</style>
