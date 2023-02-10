<template>
	<div class="edit-container order-book fullWrap" id="customsClearance" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<div class="order-container">
			<div id="alertCont">
				<!-- 发起取消提示，待协同单确认是否取消协同 -->
				<el-alert type="warning" :closable="false" class="orange" v-if="isBkg && $route.query.source === 'orderList' && orderInfo.main && ['CANCEL', 'BREAK'].includes(orderInfo.main.cancelJointHandleStatus)">
					<template slot="title">
						<span class="txt">订单已发起取消申请，待协同单确认是否取消协同。</span>
					</template>
				</el-alert>
				<!-- 协同撤回申请提示 -->
				<CancelApplyAlert v-if="jointShow && isCancelApply && serviceCode !== 'book'" :serviceInfo="serviceInfo" :serviceList="orderInfo.serviceList" @callback="getOrderInfo" />
				<!-- 协同单服务项是否取消协同的提示 -->
				<CancelJointAlert v-if="$route.query.source === 'jointList' && isCancelJointAlert" @getInfo="getOrderInfo" />
				<!-- 订单已取消提示 -->
				<CancelAlert v-if="isBkg && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
				<!-- 商务拒绝提示 -->
				<RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
				<!-- bkg拒绝提示 -->
				<RefuseAlert v-if="(isBd || isPricing) && isBkgRefuse" :refuseReason="bkgRefuseReason" />
			</div>
			<div class="tabs-container">
				<TopNav :serviceType="orderInfo.main && orderInfo.main.serviceType" :activityKey="activityKey" :custid="orderInfo.main && orderInfo.main.custid" @routerPush="handleToRoute" />
				<div class="detail-container flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="routeName" @routerPush="handleToRoute" />
					<div class="flex1 component-main-cont">
						<div class="service-container" id="container" @scroll="handleScroll">
							<ServiceCustInfo :orderInfo="orderInfo" :serviceCode="serviceCode" @info="getOrderInfo" @routerPush="handleToRoute"></ServiceCustInfo>
							<div v-if="isImport" class="component-cont" style="padding-bottom:0;">
								<div class="inspection-menu-checkbox">
									<span class="menu-title">请选择类型:</span>
									<el-checkbox @change="subTypeSave('pod_comm_clearance_bonded')" v-model="pod_comm_clearance_bonded" true-label="y" false-label="n">
										保税类型
									</el-checkbox>
									<el-checkbox @change="subTypeSave('pod_comm_clearance_not_bonded')" v-model="pod_comm_clearance_not_bonded" true-label="y" false-label="n">
										非保税类型
									</el-checkbox>
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
							<div v-if="(isImport && serviceCheckout.length > 0) || !isImport" class="component-cont table-com-layout" style="padding: 10px 20px" id="tableCont">
								<div class="mb10 between h28">
									<span :class="{ 'is-opacity': isImport }" class="tit ft12 bold">委托清关信息</span>
									<div class="row-tit-operate">
										<div class="">
											<span class="mr10">清关状态</span>
											<el-select v-model="customsClearanceStatus" size="mini" placeholder="请选择" clearable style="width:120px" @change="handleUpdateStatus" :disabled="isDisabledEdit">
												<el-option v-for="(item, index) in dictMap.podCommClearanceStatus" :key="index" :label="item.label" :value="item.value"></el-option>
											</el-select>

											<el-button size="mini" type="primary" class="ml10" @click="handleAdd" :disabled="isDisabledEdit">新增委托</el-button>
										</div>
									</div>
								</div>
								<el-table class="border-table" ref="customsClearanceTable" fit style="width: 100%" :data="tableData" @selection-change="handleSelectionChange" :span-method="objectSpanMethod">
									<el-table-column type="selection" width="50"></el-table-column>
									<el-table-column prop="intrustNo" label="清关委托编号" align="center" width="150"></el-table-column>
									<el-table-column prop="customsClearanceStatus" label="清关状态" align="center" width="80">
										<template slot-scope="scope">
											{{ scope.row.customsClearanceStatus | podCommClearanceStatusFilter }}
										</template>
									</el-table-column>
									<el-table-column prop="overSeaAgentName" label="海外代理" align="center" v-if="isExport" key="overSeaAgentName"></el-table-column>
									<el-table-column prop="overSeaCompanyName" label="海外分公司" align="center" v-if="isExport" key="overSeaCompanyName"></el-table-column>
									<el-table-column prop="customsSupplyName" label="报关行" align="center" v-if="isImport" key="customsSupplyName"></el-table-column>
									<el-table-column prop="customsClearanceType" label="清关方式" align="center" width="80">
										<template slot-scope="scope">
											{{ scope.row.customsClearanceType | podCommClearanceModeFilter }}
										</template>
									</el-table-column>
									<el-table-column prop="customsClearanceTime" label="预计清关时间" align="center" width="150"></el-table-column>
									<el-table-column prop="realCustomsClearanceTime" label="实际清关时间" align="center" width="150"></el-table-column>
									<el-table-column prop="remark" label="清关备注" align="center" show-overflow-tooltip>
										<template slot-scope="scope">
											<div class="remark-class">{{ scope.row.remark }}</div>
										</template>
									</el-table-column>
									<el-table-column prop="mblNo" label="MBL单号" align="center"></el-table-column>
									<el-table-column prop="hblNo" label="HBL单号" align="center"></el-table-column>
									<el-table-column prop="fileNum" label="附件信息" align="center">
										<template slot-scope="scope">
											<div class="operate-group">
												<el-button class="underline" @click="handleViewFileList(scope.row, scope.$index)" type="text" size="mini" :disabled="isDisabledEdit">
													点击上传<em v-if="scope.row.fileNum" class="fileNum">({{ scope.row.fileNum }})</em>
												</el-button>
											</div>
										</template>
									</el-table-column>
									<el-table-column label="操作" width="100" align="center" fixed="right">
										<template slot-scope="scope">
											<div class="operate-group">
												<el-button @click="handleInfo(scope.row, scope.$index)" type="text" size="mini">详情</el-button>
												<el-button @click="handleDelete(scope.row)" type="text" size="mini" :disabled="isDisabledEdit">删除</el-button>
											</div>
										</template>
									</el-table-column>
								</el-table>
								<!-- 进口业务 -->
							</div>
							<div class="component-cont" v-if="detailShow">
								<CustomsClearanceDetail
									ref="customsClearanceDetailForm"
									:type="type"
									:createItem="createItem"
									:mblVos="mblVos"
									:hblVos="hblVos"
									:saveBarFixed="saveBarFixed"
									:isDisabledEdit="isDisabledEdit"
									@update="handleUpdate"
									@save="handleSave"
									@cancel="handleCancel"
									v-if="isExport"
								/>
								<!-- 进口业务 -->
								<!-- <ImportCustomsClearanceDetail
									ref="importCustomsClearanceDetailForm"
									:type="type"
									:createItem="createItem"
									:mblVos="mblVos"
									:hblVos="hblVos"
									:saveBarFixed="saveBarFixed"
									:isDisabledEdit="isDisabledEdit"
									@update="handleUpdate"
									@save="handleSave"
									@cancel="handleCancel"
									v-if="isImport"
								/> -->
							</div>
							<div v-if="fileListShow">
								<CustomsClearanceFileList :param="fileListQuery" :isDisabledEdit="isDisabledEdit" @close="fileListPopClose" />
							</div>
							<!-- <OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="'pod_comm_clearance'" /> -->
						</div>
						<JointWorkAssign :jointServiceWorkList="jointServiceWorkList" :serviceCode="serviceCode" @callback="jointWorkAssignCallback" />
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
import { getDictLabel, getServiceCode } from '@/utils/tools'
import { baseCurrencyList } from '@/api/base'
import { subTypeSave, getSubTypeList } from '@/api/order/list'
import { orderJointInfo, orderInfo } from '@/api/railway/list'
import { customsClearanceList, customsClearanceDetail, customsClearanceDelete, customsClearanceGetIntrustNo, customsClearanceUpdateStatus, customsClearanceSave } from '@/api/order/podService/customsClearance'

import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import ServiceCustInfo from '../components/serviceCustInfo'
import JointWorkAssign from '@/views/order/order/jointList/components/workAssign'
import CustomsClearanceDetail from './components/customsClearanceDetail'
import ImportCustomsClearanceDetail from './components/importCustomsClearanceDetail'
import CustomsClearanceFileList from './components/customsClearanceFileList'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'
import CancelApplyAlert from '../components/cancelApplyAlert'

const defaultCreateQuery = {
	oid: undefined,
	intrustNo: '',
	countryCode: '',
	countryName: '',
	overSeaAgentId: '',
	overSeaAgentName: '',
	customsSupplyName: '',
	customsClearancePeople: '',
	customsClearancePhone: '',
	customsClearanceTime: '',
	realCustomsClearanceTime: '',
	orderNo: '',
	customsClearanceType: '',
	customsClearanceStatus: '',
	remark: '',
	customsBillNo: '',
	overSeaCompanyName: '',
	overSeaCompanyCode: ''
}

export default {
	filters: {
		podCommClearanceStatusFilter(status) {
			return getDictLabel('podCommClearanceStatus', status)
		},
		podCommClearanceModeFilter(customsClearanceType) {
			return getDictLabel('podCommClearanceMode', customsClearanceType)
		}
	},
	mixins: [orderMixin, routerMixin],
	props: {},
	data() {
		return {
			curIndex: 0,
			activityType: 'pod_comm_clearance_not_bonded',
			pod_comm_clearance_not_bonded: 'n',
			pod_comm_clearance_bonded: 'n',
			state: 'valid',
			tableData: [],
			mblVos: [],
			hblVos: [],
			oQuery: this.$route.query,
			customsClearanceStatus: '', // 委托清关状态
			multipleSelection: [],
			type: '',
			detailShow: false,
			createItem: Object.assign({}, defaultCreateQuery),
			countryName: '', // 国家
			listItemQuery: {
				oid: undefined,
				blId: '',
				mblId: '',
				intrustNo: '',
				countryCode: '',
				countryName: '',
				overSeaAgentId: '',
				overSeaAgentName: '',
				customsSupplyName: '',
				customsClearancePeople: '',
				customsClearancePhone: '',
				customsClearanceTime: '',
				realCustomsClearanceTime: '',
				customsClearanceType: '',
				customsClearanceStatus: '',
				remark: '',
				mblNo: '',
				hblNo: '',
				fileNum: ''
			},
			intrustNoSpanArr: [], // intrustNoSpanArr是一个空数组，用于存放委托编号每一行记录的合并数
			intrustNoPos: 0, // intrustNoPos是intrustNoSpanArr的索引
			mblNoSpanArr: [],
			pos: 0,
			fileListQuery: {}, // 附件列表参数
			fileListShow: false,
			canSave: true,
			routeName: 'RailPodCommClearance',
			activityKey: '0',
			serviceCode: 'pod_comm_clearance',
			saveBarFixed: false
		}
	},
	async created() {
		// let { params, query } = this.$route
		// let orderNo = query.orderNo
		// let jointNo = query.jointNo
		// let fn = jointNo ? orderJointInfo : orderInfo
		// let data = jointNo ? { jointNo } : { orderNo }
		// let res = await fn(data)
		// this.orderInfo = res.data
		// this.getInit(this.orderInfo)
		// // this.getList()
		// if (this.jointShow) {
		// 	this.getJointServiceWorkList(this.serviceCode)
		// }
		// this.getSubTypeList()
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
			currRole: state => state.user.currRole,
			roles: state => state.user.roles,
			userId: state => state.user.userId,
			roleCodesOptions: state => state.railway.orderList.roleCodesOptions,
			allEditRoleArr: state => state.railway.orderList.allEditRoleArr,
			userEditRoles: state => state.railway.orderList.userEditRoles,
			dictMap: state => state.dict.dictMap,
			order: state => state.railway,
			serviceList: state => state.railway.serviceList,
			serviceInfoList: state => state.railway.serviceInfoList,
			ordDetRole: state => state.railway.ordDetRole,
			orderInfoDataObj: state => state.railway.orderInfoDataObj
		}),
		serviceCheckout() {
			return this.dictMap.servicePodCommClearance.filter(item => this[item.value] === 'y')
		},

		isBd() {
			// console.log('isJoint', this.isJoint)
			let isJoint = this.isJoint
			if (this.$route.query.jointNo) {
				isJoint = false
			}
			let isBd = !this.ordDetRole || this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'ac' || this.ordDetRole === 'op' || this.ordDetRole === 'op_truck' || (!this.isDoc && !this.isEpricing && !this.isEcs)
			return isBd || isJoint
		},

		// 业务类型为进口，海外仓的
		isImport() {
			// return ['ship_import_fcl', 'ship_import_lcl', 'ship_oversea_wh'].includes(this.orderInfo.businessType)
			return false
		},
		// 业务类型为出口的
		isExport() {
			// return ['ship_export_fcl', 'ship_export_lcl'].includes(this.orderInfo.businessType)
			return true
		},
		isFinish() {
			let findItem = this.orderInfoDataObj.serviceInfoList && this.orderInfoDataObj.serviceInfoList.find(item => item.serviceCode === 'pod_comm_clearance')
			let progress = findItem ? findItem.serviceStatus : ''
			return progress === 'finish' ? true : false
		},
		isDisabledEdit() {
			// 订单状态非（完成、取消）状态，且订单还未总关账，只要服务项进度未完成,就可以编辑
			if (this.isFinish) {
				return true
			} else if (['complete', 'cancel'].includes(this.orderInfoDataObj.orderStatus)) {
				return true
			} else {
				return false
			}
		}
	},
	components: {
		TopNav,
		LeftNav,
		ServiceCustInfo,
		JointWorkAssign,
		CustomsClearanceDetail,
		ImportCustomsClearanceDetail,
		CustomsClearanceFileList,
		// OneServiceFee,
		CancelApplyAlert
	},
	watch: {
		activityType: {
			handler(val) {
				console.log('🚀 ~ val', val)
				this.getList()
				this.detailShow = false
			},
			immediate: true,
			deep: true
		}
	},
	methods: {
		handleGetServiceStatus() {
			// let { serviceInfoList } = this.orderInfo
			let sItem = this.orderInfoDataObj.serviceInfoList.find(item => item.serviceCode === 'pod_comm_clearance')
			return sItem ? sItem.serviceStatus : ''
		},
		// 获取子服务类型选中状态
		getSubTypeList() {
			getSubTypeList({ orderNo: this.oQuery.orderNo, serviceCodes: ['pod_comm_clearance'] }).then(res => {
				if (res.data) {
					// 设置选中状态
					;['pod_comm_clearance_not_bonded', 'pod_comm_clearance_bonded'].map(item => {
						this.setCheckValue(res.data, item)
					})

					//设置当前tab
					if (this.serviceCheckout.length > 0) {
						this.activityType = this.serviceCheckout[0].value
					}
				} else {
					// 全部设为未选中
					this.pod_comm_clearance_not_bonded = 'n'
					this.pod_comm_clearance_bonded = 'n'
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
				case 'pod_comm_clearance_not_bonded':
					typeName = '非保税类型'
					break
				case 'pod_comm_clearance_bonded':
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
							serviceCode: 'pod_comm_clearance',
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
					serviceCode: 'pod_comm_clearance',
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
		handleScroll() {
			// let saveBarDom = document.querySelector("#saveBar")
			let contDom = document.querySelector('#container')
			let tableCont = document.querySelector('#tableCont')
			let scrollTop = contDom.scrollTop
			let tableContHeight = tableCont.offsetHeight
			if (scrollTop > tableContHeight + 36 + 8) {
				// table高度和custInfo组件的高度
				this.saveBarFixed = true
			} else {
				this.saveBarFixed = false
			}
		},
		// 初始化表格
		setInitTableData(values) {
			console.log('🚀 ~ values', values)
			values = values || []
			let list = []
			if (!values.length) return (this.tableData = [])
			values.map(item => {
				if (item.mblVos && item.mblVos.length) {
					item.mblVos.map(ele => {
						if (ele.hblVos && ele.hblVos.length) {
							ele.hblVos.map((o, oIndex) => {
								let itemQuery = {}
								for (let i in this.listItemQuery) {
									itemQuery[i] = item[i] ? item[i] : ele[i] ? ele[i] : o[i]
									if (i === 'hblNo') {
										itemQuery[i] = o.blNo
									}
									if (i === 'mblNo') {
										itemQuery[i] = ele.blNo
									}
									if (i === 'blId') {
										itemQuery[i] = o[i]
									}
								}
								list.push(itemQuery)
							})
						} else {
							list.push({
								oid: item.oid,
								mblId: ele.blId,
								countryCode: item.countryCode,
								intrustNo: item.intrustNo,
								overSeaAgentName: item.overSeaAgentName,
								customsSupplyName: item.customsSupplyName,
								remark: item.remark,
								customsClearanceTime: item.customsClearanceTime,
								realCustomsClearanceTime: item.realCustomsClearanceTime,
								customsClearanceType: item.customsClearanceType,
								customsClearanceStatus: item.customsClearanceStatus,
								mblNo: ele.blNo,
								fileNum: ele.fileNum,
								overSeaCompanyName: item.overSeaCompanyName
							})
						}
					})
				} else if (item.hblVos && item.hblVos.length) {
					item.hblVos.map(ele => {
						let itemQuery = {}
						for (let i in this.listItemQuery) {
							itemQuery[i] = item[i] ? item[i] : ele[i]
							if (i === 'hblNo') {
								itemQuery[i] = ele.blNo
							}
							if (i === 'blId') {
								itemQuery[i] = ele[i]
							}
						}
						list.push(itemQuery)
					})
				} else {
					list.push({
						oid: item.oid,
						countryCode: item.countryCode,
						blId: item.blId,
						intrustNo: item.intrustNo,
						overSeaAgentName: item.overSeaAgentName,
						customsClearanceTime: item.customsClearanceTime,
						realCustomsClearanceTime: item.realCustomsClearanceTime,
						customsClearanceType: item.customsClearanceType,
						customsClearanceStatus: item.customsClearanceStatus,
						customsSupplyName: item.customsSupplyName,
						remark: item.remark,
						overSeaCompanyName: item.overSeaCompanyName
					})
				}
			})
			console.log('tableData', list)
			this.tableData = list
			this.getSpanArr(this.tableData)
		},
		// 储存合并相同的箱号的id
		getSpanArr(data) {
			/*
        如果是第一条记录（索引为0），向数组中加入1，并设置索引位置；
        如果不是第一条记录，则判断它与前一条记录是否相等，
        如果相等，则向spanArr中添入元素0，并将前一位元素+1，表示合并行数+1，
        以此往复，得到所有行的合并数，0即表示该行不显示。
    */
			this.mblNoSpanArr = []
			this.intrustNoSpanArr = []
			for (var i = 0; i < data.length; i++) {
				if (i === 0) {
					this.mblNoSpanArr.push(1) //mblNoSpanArr是一个空数组，用于存放每一行记录的合并数
					this.pos = 0 //pos是mblNoSpanArr的索引
					this.intrustNoSpanArr.push(1)
					this.intrustNoPos = 0
				} else {
					// 判断委托编号当前元素与上一个元素是否相同
					if (data[i].intrustNo === data[i - 1].intrustNo) {
						this.intrustNoSpanArr[this.intrustNoPos] += 1
						this.intrustNoSpanArr.push(0)
					} else {
						this.intrustNoSpanArr.push(1)
						this.intrustNoPos = i
					}
					// 判断箱号当前元素与上一个元素是否相同
					if (data[i].intrustNo === data[i - 1].intrustNo && data[i].mblNo === data[i - 1].mblNo) {
						this.mblNoSpanArr[this.pos] += 1
						this.mblNoSpanArr.push(0)
					} else {
						this.mblNoSpanArr.push(1)
						this.pos = i
					}
				}
			}
			console.log(this.mblNoSpanArr, this.intrustNoSpanArr)
		},
		// 合并单元格
		objectSpanMethod({ row, column, rowIndex, columnIndex }) {
			let noSpanProps = ['mblNo', 'hblNo', 'fileNum']
			// 除了MBL单号和HBL单号和附件信息外，其他都需要合并单元格
			if (!column.property || !noSpanProps.includes(column.property)) {
				//用于设置要合并的列
				const _row = this.intrustNoSpanArr[rowIndex]
				const _col = _row > 0 ? 1 : 0
				return {
					rowspan: _row, //合并的行数
					colspan: _col //合并的列数，设为0则直接不显示
				}
			}
			// M单号列需合并
			if (column.property === 'mblNo') {
				const _row = this.mblNoSpanArr[rowIndex]
				const _col = _row > 0 ? 1 : 0
				return {
					rowspan: _row,
					colspan: _col
				}
			}
		},
		// 获取委托清关列表
		getList() {
			this.lsLoading = true
			console.log('🚀 ~ this.activityType', this.activityType)
			// 新增参数是否保税
			let isBonded = this.activityType === 'pod_comm_clearance_bonded' ? 'Y' : 'N'

			console.log('this.commonClearanceBlType', this.commonClearanceBlType)
			// let blType = this.orderInfo.businessType === 'ship_export_lcl' ? 'hbl' : 'mbl'
			customsClearanceList({ isBonded, orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo, blType: this.commonClearanceBlType }).then(res => {
				let list = res.data || []
				this.setInitTableData(list)
			}).finally(() => {
				this.lsLoading = false
			})
		},
		// 获取委托清关委托编号
		handleGetIntrustNo() {
			customsClearanceGetIntrustNo({ orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo, blType: this.commonClearanceBlType }).then(res => {
				let { overSeaAgent, port, serialNo } = res.data
				let intrustNo = serialNo || ''
				this.createItem = Object.assign({}, defaultCreateQuery, {
					intrustNo,
					customsClearanceStatus: 'init',
					countryCode: port ? port.countryCode : '',
					countryName: port ? port.countryCname : '',
					overSeaAgentId: overSeaAgent ? overSeaAgent.overseaAgentSupplierId : '',
					overSeaAgentName: overSeaAgent ? overSeaAgent.overseaAgentSupplierName : '',
					businessType: this.orderInfo.main.businessType
				})
				// 进口增加hscode,中文品名等
				// if (this.isImport) {
				// 	Object.assign(this.createItem, {
				// 		isImportRight: this.orderInfo.transport.isImportRight,
				// 		hscode: this.orderInfo.cargoList[0].hscode,
				// 		cargoCname: this.orderInfo.cargoList[0].cname,
				// 		customsSupplyId: this.orderInfo.transport ? this.orderInfo.transport.customsSupplierId : '',
				// 		customsSupplyName: this.orderInfo.transport ? this.orderInfo.transport.customsSupplierName : '',
				// 		cargos: [{ hscode: '', cname: '', ename: '', totalPrice: '', currency: 'CNY' }]
				// 	})
				// }
				this.mblVos = res.data.mblVos
				this.hblVos = res.data.hblVos
				// this.detailShow = true
			})
		},
		// 新增
		handleAdd() {
			this.type = 'add'

			this.handleGetIntrustNo()
			this.detailShow = true
			// setTimeout(() => {
			// 	this.detailShow = true
			// }, 500)

			console.log(this.createItem)
		},
		// 更新
		handleUpdate(intrustNo) {
			this.getList()
			if (this.detailShow) {
				this.handleInfo(this.tableData[this.curIndex], this.curIndex)
			}
		},
		// 详情
		handleInfo(row, index) {
      console.log("🚀 ~ row", row)
			this.curIndex = index
			this.type = 'info'
			
			let { orderNo, jointNo } = this.oQuery
			customsClearanceDetail({ orderNo, jointNo, oid: row.oid, blType: this.commonClearanceBlType }).then(res => {
				for (let i in this.createItem) {
					this.createItem[i] = res.data[i]
				}
				this.createItem.businessType = this.orderInfo.main.businessType
				console.log('🚀 ~  this.orderInfo', this.orderInfo)
				this.mblVos = res.data.mblVos
				this.hblVos = res.data.hblVos
				this.openDetail()
				// // 进口业务
				// if (this.isImport) {
				// 	this.createItem = JSON.parse(
				// 		JSON.stringify(
				// 			Object.assign(this.createItem, {
				// 				cargoCname: res.data.cargoCname,
				// 				customsBillNo: res.data.customsBillNo,
				// 				isImportRight: res.data.isImportRight,
				// 				hscode: res.data.hscode,
				// 				declareType: res.data.declareType,
				// 				customsSupplyId: res.data.customsSupplyId,
				// 				customsSupplyName: res.data.customsSupplyName,
				// 				cargos:
				// 					res.data.cargos.length === 0
				// 						? [{ hscode: '', cname: '', ename: '', totalPrice: '', currency: 'CNY' }]
				// 						: res.data.cargos.map(item => {
				// 								item['currency'] = item['currency'] || '' // 针对老数据没有返回 currency 字段
				// 								return item
				// 						  })
				// 			})
				// 		)
				// 	)
				// }
				// this.detailShow = true
				console.log('详情', this.createItem)
			})
		},
		// 删除
		handleDelete(row) {
			this.$confirm('是否确认删除该条数据?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let data = {
						oid: row.oid,
						orderNo: this.oQuery.orderNo,
						jointNo: this.oQuery.jointNo
					}
					return customsClearanceDelete(data)
				})
				.then(response => {
					this.$message({
						message: '删除成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							if ((row.oid = this.createItem.oid)) {
								this.detailShow = false
							}
							this.getList()
						}
					})
				})
				.catch(() => {
					this.getList()
				})
		},
		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
		},
		// 获取选中的blId
		getOids() {
			let oids = []
			// oids.push(this.multipleSelection[0].oid)
			this.multipleSelection.map(item => {
				oids.push(item.oid)
			})

			return [...new Set(oids)]
		},
		validate() {
			return true
		},
		// 修改委托清关状态
		handleUpdateStatus(val) {
			if (!val) return
			if (!this.multipleSelection.length) {
				return this.$message({
					type: 'error',
					message: '请选择委托清关',
					duration: 1000,
					onClose: () => {
						this.customsClearanceStatus = ''
					}
				})
			}
			this.$confirm('是否确认修改状态?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return customsClearanceUpdateStatus({
						ccIds: this.getOids(),
						orderNo: this.oQuery.orderNo,
						jointNo: this.oQuery.jointNo,
						status: val
					})
				})
				.then(response => {
					this.$message({
						type: 'success',
						message: '修改委托清关状态成功',
						duration: 1000,
						onClose: () => {
							this.customsClearanceStatus = ''
							this.getList()
						}
					})
				})
				.catch(err => {
					this.customsClearanceStatus = ''
				})
		},
		// 保存
		handleSave(values) {
			console.log(values)
			// 新增参数是否保税
			let isBonded = this.activityType === 'pod_comm_clearance_bonded' ? 'Y' : 'N'
			let data = Object.assign({}, values, { isBonded })
			data.orderNo = this.oQuery.orderNo
			data.jointNo = this.oQuery.jointNo
			if (!this.canSave) return
			this.canSave = false
			customsClearanceSave(data)
				.then(res => {
					this.$message({
						type: 'success',
						message: '保存成功',
						duration: 1000,
						onClose: () => {
							this.canSave = true
							this.detailShow = false
							this.getList()
						}
					})
				})
				.catch(err => {
					setTimeout(() => {
						this.canSave = true
					}, 2000)
				})
		},
		// 取消
		handleCancel() {
			this.detailShow = false
		},
		// 查看附件
		handleViewFileList(row, index) {
			this.curIndex = index
			this.fileListShow = true
			// countryCode: this.detailData.countryCode,
			//   blNo: row.hblNo,
			//   blId: row.blId,
			//   intrustNo: this.detailData.intrustNo,
			//   customsClearanceType: this.detailData.customsClearanceType
			Object.assign(this.fileListQuery, {
				countryCode: row.countryCode,
				blNo: row.hblNo,
				mblNo: row.mblNo,
				mblId: row.mblId,
				blId: row.blId,
				intrustNo: row.intrustNo,
				customsClearanceType: row.customsClearanceType
			})
			console.log(this.fileListQuery)
		},
		// 附件信息弹窗关闭回调
		fileListPopClose() {
			this.fileListShow = false
			this.getList()
			if (this.detailShow) {
				this.handleInfo(this.tableData[this.curIndex], this.curIndex)
			}
		},
		jointWorkAssignCallback() {
			this.getJointServiceWorkList(this.serviceCode)
		}
	}
}
</script>
<style lang="scss">
#customsClearance {
	.is-opacity {
		opacity: 0;
	}
}

@import '../../less/index.scss';
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
#customsClearance {
	.fileNum {
		font-style: normal;
		font-size: 12px;
		// margin-left: 5px;
	}
	.remark-class {
		overflow: hidden;
		display: '-webkit-box';
		text-overflow: ellipsis;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
	}
}
</style>
