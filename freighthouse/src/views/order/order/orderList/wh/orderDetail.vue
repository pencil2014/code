<template>
	<div class="edit-container" id="selfOrder">
		<ComOrderInfo ref="first" id="comOrderInfo" :createItem="createItem" :orderStatus="createItem.orderStatus" :serviceTypeOptions="serviceTypeOptions" :serviceCodeOptions="serviceCodeOptions" @getHeight="getShipInfoHeight" @updateCust="updateCust">
			<div class="operateBtn-group">
				<div class="btn-groups">
					<!-- orderInfoDataObj.bdManageEmployeeId===userId && createItem.orderStatus==='pre_submit' -->
					<template v-if="orderInfoDataObj.bdManageEmployeeId===userId && createItem.orderStatus==='pre_submit'">
						<!-- 当前用户是业务主管，并且订单状态是待业务主管审核 -->
						<el-button size="mini" type="primary" @click="handleSubmit" :disabled="submitDisabled">通过</el-button>
						<el-button size="mini" type="danger"  @click="bdManageRefusePopShow=true" style="margin-left: 10px;">拒绝</el-button>
					</template>
					<template v-else>
						<template v-if="$route.query.source !== 'whJointList'">
							<template v-if="isBd">
								<el-button size="mini" type="primary" @click="handleSave" :disabled="submitDisabled" v-if="['draft', 'refuse'].includes(createItem.orderStatus)">保存</el-button>
								<el-button size="mini" type="primary" @click="handleSubmit" :disabled="submitDisabled" v-if="['draft', 'refuse'].includes(createItem.orderStatus)">提交</el-button>
								<el-button size="mini" type="danger" class="ml10" @click="handleCancelRequest" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus) && createItem.cancelApplyStatus !== 'applied'">{{isOrderFeeCount ? '终止' : '取消'}}</el-button>
								<el-button
									size="mini"
									type="default"
									class="submitCancel"
									@click="handleCancelCancel"
									:disabled="submitDisabled"
									v-if="createItem.cancelApplyStatus === 'applied' && createItem.orderStatus !== 'break' && createItem.orderStatus !== 'cancel'"
									>{{isOrderFeeCount ? '撤回终止' : '撤回取消'}}</el-button
								>
								<el-button size="mini" type="danger" @click="handleDelete" :disabled="submitDisabled" v-if="createItem.orderStatus === 'draft'">删除</el-button>
								<el-button size="mini" type="default" class="submitCancel" @click="handleSubmitCancel" :disabled="submitDisabled" v-if="createItem.orderStatus === 'submit'">撤回</el-button>
								<el-button size="mini" type="default" class="" @click="handleCopy" :disabled="submitDisabled" v-if="!addState">复制</el-button>
								<template v-if="isOrderFeeCount">
									<el-button size="mini" type="danger" class="" @click="handleBreak" :disabled="submitDisabled" v-if="createItem.orderStatus === 'refuse'">终止</el-button>
								</template>
								<el-button size="mini" type="default" @click="handleClose" :disabled="submitDisabled" v-else-if="createItem.orderStatus === 'refuse'">关闭</el-button>
							</template>
							<!-- 操作 -->
							<template v-if="isOp || isDoc">
								<el-button size="mini" type="primary" @click="handleEdit" v-if="opEditState" :disabled="submitDisabled">保存</el-button>
							</template>
							<!-- <el-button size="mini" type="primary" class="" @click="handleExportPlan">输出计划单</el-button> -->
							<template v-if="isOp || isDoc">
								<el-button size="mini" type="danger" class="" @click="handleOpCancelRequest('cancel')" :disabled="submitDisabled" v-if="!['CANCEL','BREAK'].includes(createItem.cancelJointHandleStatus) && ['pass'].includes(createItem.orderStatus) && !isOrderFeeCount">取消</el-button>
								<el-button size="mini" type="danger" class="" @click="handleOpCancelRequest('break')" :disabled="submitDisabled" v-if="!['CANCEL','BREAK'].includes(createItem.cancelJointHandleStatus) && ['pass'].includes(createItem.orderStatus) && isOrderFeeCount">终止</el-button>
								<!-- <el-button size="mini" type="success" class="" @click="handleFinish" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus)">完成</el-button> -->
								<el-button size="mini" type="default" class="" @click="handleJointService" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus)">协同</el-button>
							</template>
							<!-- <template v-if="isDoc">
								<el-button size="mini" type="primary" @click="handleEdit" v-if="['pass'].includes(createItem.orderStatus)" :disabled="submitDisabled">保存</el-button>
							</template> -->
						</template>
						<template v-if="$route.query.source === 'whJointList'">
							<!-- 20220113版本 协同单增加打印计划单功能 刘小志开发 -->
							<!-- <el-button size="mini" type="primary" class="" @click="handleExportPlan">输出计划单</el-button> -->
							<template v-if="isOp || isDoc">
								<el-button size="mini" type="primary" class="" @click="handleJointSave" v-if="['pass'].includes(createItem.orderStatus)" :disabled="submitDisabled">保存</el-button>
							</template>
						</template>
					</template>
					<!-- <el-button size="mini" type="default" @click="handleGoBack" :disabled="submitDisabled">返回</el-button> -->
				</div>
				<div class="status">
					<template v-if="createItem.systemCode && createItem.systemCode === 'CUST'">
						<span class="label">订单来源:</span>
						<span class="value black">
							<img :src="require(`@/views/order/order/images/icon-order-cust.png`)" class="img-cust" />
							{{ createItem.systemCode | getDictLabelFilter('orderSystemCode') }}
						</span>
					</template>
					<span class="label">订单状态:</span>
					<span
						class="value"
						:class="createItem.orderStatus === 'complete' || createItem.orderStatus === 'pass' ? 'green' : createItem.orderStatus === 'submit' || createItem.orderStatus === 'pre_submit' ? 'yellow' : ['refuse', 'cancel', 'break'].includes(createItem.orderStatus) ? 'red' : 'black'"
					>
						<i></i>{{ orderStatusFilter(createItem.orderStatus, $route.query.action) }}
					</span>
					<span class="label ml10">关账状态:</span>
					<span class="value" :class="finCloseStatusCn === '已关账' ? 'green' : finCloseStatusCn === '预关账' ? 'blue' : 'black'"><i></i>{{ finCloseStatusCn }}</span>
				</div>
			</div>
		</ComOrderInfo>
		<div class="order-cont ship-selfOrder-cont">
			<el-form ref="selfOrderSubmit" :model="createItem" :rules="rules" class="order-cont-form row-body">
				<!-- 订舱信息 -->
				<div class="ship-cont" ref="shipInfoCont" :class="workAssignShow ? 'abs-toogle' : ''" :style="{ height: `${shipInfoHeight}px` }">
					<div class="toggleWorkAssign" @click="toggleWorkAssign">
						<i class="hamburger el-icon-arrow-right" :class="{ 'is-active': true }"></i>
					</div>
					<h1 class="orderInfo-h1">基本信息</h1>
					<div class="row-flex" style="margin-top: 0">
						<div class="orderbook-info-table">
							<div class="table-td">
								<div class="cont">
									<div class="h1">
										<span class="label">港口信息</span>
									</div>
									<div class="pd8 flex-form-item label70 pr24">
										<el-form-item label="大船起运港" prop="ship.polPortCode" :show-message="false">
											<div class="port-flex-form">
												<div class="port-code">
													<el-select
														size="mini"
														v-model="createItem.ship.polPortCode"
														filterable
														remote
														clearable
														:disabled="!isEditState"
														style="width: 100%"
														placeholder="请输入"
														:remote-method="polPortFilterMehod"
														@visible-change="polPortVisibleChange"
														@change="handleChangePolPortCode"
													>
														<el-option v-for="item in polPortList" :key="item.value" :label="item.value" :value="item.value">
															<span>{{ item.label }}</span>
														</el-option>
													</el-select>
												</div>
												<PortPopover :portItem="polPortItem" />
											</div>
										</el-form-item>
										<el-form-item label="中转港1" prop="ship.transitPortCode" :show-message="false">
											<div class="port-flex-form">
												<div class="port-code">
													<el-select
														key="transitPortCode"
														size="mini"
														v-model="createItem.ship.transitPortCode"
														filterable
														clearable
														:disabled="!isEditState"
														style="width: 100%"
														placeholder="请输入"
														:filter-method="transitPortFilterMehod"
														@visible-change="transitPortVisibleChange"
														@change="handleChangeTransitPortCode"
													>
														<el-option v-for="item in transitPortList" :key="item.value" :label="item.value" :value="item.value">
															<span>{{ item.label }}</span>
														</el-option>
													</el-select>
												</div>
												<PortPopover :portItem="transitPortItem" />
												<i class="el-icon-circle-plus-outline" @click="handleAddTransitPort" v-if="(!transitPortTwoShow || !transitPortOneShow) && isEditState"></i>
											</div>
										</el-form-item>
										<el-form-item label="中转港2" prop="ship.transitPortCode1" :show-message="false" v-if="transitPortOneShow">
											<div class="port-flex-form">
												<div class="port-code">
													<el-select
														key="transitPortCode1"
														size="mini"
														v-model="createItem.ship.transitPortCode1"
														filterable
														clearable
														:disabled="!isEditState"
														style="width: 100%"
														placeholder="请输入"
														:filter-method="transitPortFilterMehodOne"
														@visible-change="transitPortVisibleChangeOne"
														@change="handleChangeTransitPortCodeOne"
													>
														<el-option v-for="item in transitPortList1" :key="item.value" :label="item.value" :value="item.value">
															<span>{{ item.label }}</span>
														</el-option>
													</el-select>
												</div>
												<PortPopover :portItem="transitPortItem1" />
												<i class="el-icon-remove-outline" @click="handleDeleteOne" v-if="isEditState"></i>
											</div>
										</el-form-item>
										<el-form-item label="中转港3" prop="ship.transitPortCode2" :show-message="false" v-if="transitPortTwoShow">
											<div class="port-flex-form">
												<div class="port-code">
													<el-select
														key="transitPortCode2"
														size="mini"
														v-model="createItem.ship.transitPortCode2"
														filterable
														clearable
														:disabled="!isEditState"
														style="width: 100%"
														placeholder="请输入"
														:filter-method="transitPortFilterMehodTwo"
														@visible-change="transitPortVisibleChangeTwo"
														@change="handleChangeTransitPortCodeTwo"
													>
														<el-option v-for="item in transitPortList2" :key="item.value" :label="item.value" :value="item.value">
															<span>{{ item.label }}</span>
														</el-option>
													</el-select>
												</div>
												<PortPopover :portItem="transitPortItem2" />
												<i class="el-icon-remove-outline" @click="handleDeleteTwo" v-if="isEditState"></i>
											</div>
										</el-form-item>
										<el-form-item required label="卸货港" prop="ship.unloadingPortCode" :show-message="false">
											<div class="port-flex-form">
												<div class="port-code">
													<el-select
														size="mini"
														v-model="createItem.ship.unloadingPortCode"
														filterable
														remote
														clearable
														:disabled="!isEditState"
														style="width: 100%"
														placeholder="请输入"
														:remote-method="unloadPortFilterMehod"
														@visible-change="unloadPortVisibleChange"
														@change="handleChangeUnloadPortCode"
													>
														<el-option v-for="item in unloadingPortList" :key="item.value" :label="item.value" :value="item.value">
															<span>{{ item.label }}</span>
														</el-option>
													</el-select>
												</div>
												<PortPopover :portItem="unloadPortItem" />
											</div>
										</el-form-item>
										<el-form-item required label="目的地" prop="ship.podPortCode" :show-message="false">
											<div class="port-flex-form">
												<div class="port-code">
													<el-select
														size="mini"
														v-model="createItem.ship.podPortCode"
														filterable
														remote
														clearable
														:disabled="!isEditState"
														style="width: 100%"
														placeholder="请输入"
														:remote-method="podPortFilterMehod"
														@visible-change="podPortVisibleChange"
														@change="handleChangePodPortCode"
													>
														<el-option v-for="item in podPortList" :key="item.value" :label="item.value" :value="item.value">
															<span>{{ item.label }}</span>
														</el-option>
													</el-select>
												</div>
												<PortPopover :portItem="podPortItem" />
											</div>
										</el-form-item>
										<el-form-item label="系统航线" prop="ship.sysLineCode" :show-message="false">
											<el-input clearable size="mini" placeholder="请输入" v-model="sysLineName" disabled></el-input>
										</el-form-item>
										<el-form-item label="国家" :show-message="false">
											<el-input type="text" clearable size="mini" placeholder="请输入" v-model="countryName" disabled></el-input>
										</el-form-item>
									</div>
								</div>
							</div>
							<div class="table-td">
								<div class="cont">
									<div class="h1">
										<span class="label">货运信息</span>
									</div>
									<div class="pd8 flex-form-item label70">
										<el-form-item label="付款方式" prop="payMode" :show-message="false">
											<el-select v-model="createItem.payMode" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="!isEditState">
												<el-option v-for="(item, index) in dictMap.payMode" :label="item.label" :value="item.value" :key="index"> </el-option>
											</el-select>
										</el-form-item>
										<el-form-item label="运输条款" prop="transport.transportTerm" :show-message="false">
											<el-select v-model="createItem.transport.transportTerm" size="mini" clearable placeholder="请选择" style="width: 100%" :disabled="!isEditState">
												<el-option v-for="(item, index) in dictMap.shipTerms" :label="item.label" :value="item.value" :key="index"> </el-option>
											</el-select>
										</el-form-item>
										<el-form-item required label="业务日期" prop="bizDate" :show-message="false">
											<elDatePickerLimit size="mini" :style="{ width: showChangeBizDate ? 'calc(100% - 47px)' : '100%',marginRight:showChangeBizDate ? '5px':'0' }" v-model="createItem.bizDate" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" :picker-options="pickerOptions" :disabled="!isBd || createItem.orderStatus !== 'draft'" />
											<el-button v-if="showChangeBizDate" @click="handleChangeBizDate" size="mini">修改</el-button>
										</el-form-item>
										<el-form-item label="备注" prop="bdRemark" :show-message="false" v-if="$route.query.source !== 'jointList'">
											<el-input @dblclick.native="showRemarkDetail(createItem.bdRemark)" class="loadingBdRemark" type="textarea" clearable rows="4" size="mini" placeholder="请输入" maxlength="512" show-word-limit v-model="createItem.bdRemark" @blur="handleSaveRemark" :disabled="!bdRemarkState"></el-input>
										</el-form-item>
									</div>
								</div>
							</div>
						</div>
					</div>
					<!-- 货物信息 -->
					<div class="row-cont">
						<div class="row-cont-tit">
							<span class="tit">货物信息</span>
						</div>
						<Cargo :createItem="createItem" :orderStatus="createItem.orderStatus" :isEditState="isEditState" :countryCode="countryCode" ref="cargo" />
					</div>
					<!-- 物流信息 -->
					<div class="row-cont">
						<div class="row-cont-tit">
							<span class="tit">物流信息</span>
						</div>
						<TransportInfo :createItem="createItem" :orderStatus="createItem.orderStatus" :isEditState="isEditState" ref="transport" />
					</div>
				</div>
				<!-- 参与人与关键点 -->
				<div class="work-assign-cont" v-if="workAssignShow" :style="{ height: `${shipInfoHeight}px` }">
					<el-tabs v-model="activityKey" @tab-click="handleClick">
						<el-tab-pane v-for="item in workAssignMenus" :label="item.value" :name="item.key" :key="item.key"> </el-tab-pane>
					</el-tabs>
					<component
						:is="activityKey"
						:createItem="createItem"
						:orderStatus="createItem.orderStatus"
						:serviceList="createItem.serviceList"
						:orderWorkOptions="orderWorkOptions"
						:jointOrderWorkOptions="jointOrderWorkOptions"
						:obdDeptCode="obdDeptCode"
						:bdDeptCode="bdDeptCode"
						v-if="createItem.orderNo"
						:checkPointHeight="checkPointHeight"
						:jointAuditWorkData="jointAuditWorkData"
						:jointWorkData="jointWorkData"
					></component>
				</div>
			</el-form>
		</div>
		<!-- 取消订单弹窗 -->
		<div v-if="cancelOrderPopShow">
			<CancelOrder @close="cancelRequestPopClose" :orderNo="$route.query.orderNo" :cancelType="cancelType" :isBd="isBd" :isOp="isOp" :isDoc="isDoc" :isOrderFeeCount="isOrderFeeCount" />
		</div>
		<!-- 协同订单弹窗 -->
		<div v-if="jointServicePopShow">
			<JointService @close="jointServicePopClose" :createItem="createItem" />
		</div>
		<div v-if="changeBizDateShow">
      <ChangeBizDatePop @close="changeBizDateClose" :bizDate="createItem.bizDate"></ChangeBizDatePop>
    </div>
		<!-- 拒绝弹窗 -->
		<div v-if="bdManageRefusePopShow">
			<RefuseBdManageDialog @close="bdManageRefusePopClose" />
		</div>
		<div v-if="remarkVisible">
			<AuditRemark :auditRemark="remarkContent" @close="auditClose" />
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { toViewPosition } from '@/utils/scroll-to.js'
import Cookies from 'js-cookie'
import ComOrderInfo from '../components/comOrderInfo'
import Worker from '../components/workerJoint'
import CheckPoint from '../components/checkPoint'
import CancelOrder from '../components/cancelOrder'
import JointService from '../components/jointService'
import Cargo from './components/cargo'
import TransportInfo from './components/transportInfo'
import { baseBusinessList, baseBusinessServiceList, portSystemLineInfo } from '@/api/base'
import { arrayHasDuplicateValue } from '@/utils/index'
import { handleExportPlanCommon } from '@/utils/orderCommonMethod'
import ChangeBizDatePop from '@/views/airTransport/order/orderList/components/changeBizDatePop'
import RefuseBdManageDialog from '@/views/airTransport/order/orderList/components/refuseBdManageDialog'
import AuditRemark from '@/views/order/order/orderList/components/auditRemark'
import {
	orderInfo,
	orderJointInfo,
	selfSave,
	selfEdit,
	orderWork,
	orderCancelHandle,
	orderCopy,
	orderFinish,
	bookSoDelete,
	orderClose,
	orderDelete,
	orderSubmitCancel,
	jointAuditWork,
	jointWork,
	mainRemarkUpdate,
	orderCancelCancel,
	planExportReview,
	orderStatusChangeBreak,
	orderJointSave,
	bizdateChange
} from '@/api/order/list'
import { orderFeeCount } from '@/api/fin/fee'
import PortPopover from '../components/portPopover'
const defaultCreateQuery = {
	bizDate: '',
	orderNo: '',
	orderStatus: '',
	submitType: '',
	intrustRemark: '',
	bdRemark: '',
	payMode: 'prepaid',
	serviceList: [],
	// barge: {
	// 	porPortCode: '',
	// 	cyCutOff: '',
	// 	tdTime: '',
	// 	transitWay: '',
	// 	vessel: '',
	// 	voyage: ''
	// },
	ship: {
		shipCarrierCode: '',
		polPortCode: '',
		unloadingPortCode: '',
		podPortCode: '',
		cyCutOff: '',
		tdTime: '',
		vessel: '',
		voyage: ''
	},
	workAssign: [],
	cargoList: [
		// 货品信息
		{
			boxRemark: '无' // 装箱要求
		}
	],
	quotationNumber:'',
	schemeNumber:'',
	transport: {
		transportTerm: 'CY/CY', // 运输条款
		shipper: '', // 发货人
		consignee: '', // 收货人
		notify1: '', // 通知人1
		notify2: '', // 通知人2
		notify3: '' // 通知人3
	},
}
export default {
	data() {
		return {
			remarkContent: '',
			remarkVisible: false,
			bdManageRefusePopShow:false,
			changeBizDateShow: false,
			bizDateModify:this.$store.state.order.orderInfoDataObj.bizDateModify,
			state: '',
			oQuery: this.$route.query,
			workAssignShow: false,
			shipInfoHeight: '', // 订舱信息高度
			checkPointHeight: 0, // 关键点高度
			countryCode: '',
			createItem: Object.assign({}, defaultCreateQuery),
			// opCargoItem: { ...this.$store.state.order.orderList.opCargoItem },
			rules: {},
			workAssignMenus: [
				{ key: 'Worker', value: '参与人' },
				{ key: 'CheckPoint', value: '关键点' }
			],
			activityKey: 'Worker',
			// 取消订单弹窗
			cancelOrderPopShow: false,
			cancelType: '',
			// 协同订单弹窗
			jointServicePopShow: false,
			// 港口反显数据
			fillPolData: {},
			orderWorkOptions: [],
			jointOrderWorkOptions: [],
			fillPortCodes: '',
			submitDisabled: false,
			polPortList: [],
			polPortItem: {},
			transitPortOneShow: false,
      transitPortTwoShow: false,
			transitPortList: [],
      transitPortList1: [],
			transitPortList2: [],
			transitPortItem: {},
      transitPortItem1: {},
      transitPortItem2: {},
			unloadingPortList: [],
			unloadPortItem: {},
			podPortList: [],
			podPortItem: {},
			portList: [],
			pickerOptions: {
				disabledDate(date) {
					//disabledDate 文档上：设置禁用状态，参数为当前日期，要求返回 Boolean
					// return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
				}
			},
			disabledState: false,
			serviceTypeOptions: [], // 服务类型下拉
			serviceCodeOptions: [], // 服务项下拉
			docService: ['doc', 'insurance', 'pod_ltl_delivery', 'pod_change_doc', 'pod_comm_clearance', 'pod_fcl_delivery', 'pod_warehouse', 'pod_wh_matter', 'pod_ltl_delivery'],
			jointAuditWorkData: {},
			jointWorkData: [],
			finCloseStatusCn: '', // 关账状态/预关账状态
			obdDeptCode: '', // obd部门code
			bdDeptCode: '',
			sysLineName: '',
			countryName: '',
			isNotRequiredWorker: ['asst', 'obd', 'doc', 'ecs'], // 非必填参与人
			vesselTime: {},
			vesselTimeParam: {},
			hasCn: false
		}
	},
	created() {
		this.init(this.orderInfo)
	},
	mounted() {
		// if (!this.createItem.transport.transportTerm) {
    //   this.$set(this.createItem.transport, 'transportTerm', 'CY/CY')
    // }
		window.addEventListener('resize', this.getShipInfoHeight)
		this.$nextTick(() => {
			this.getShipInfoHeight()
		})
	},
	destroyed() {
		window.removeEventListener('resize', this.getShipInfoHeight)
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			userEditRoles: state => state.order.orderList.userEditRoles,
			userId: state => state.user.userId,
			order: state => state.order,
			finance: state => state.finance,
			orderList: state => state.order.orderList,
			orderInfoDataObj: (state) => state.order.orderInfoDataObj,
			speciesStrArr: state => state.order.speciesStrArr,
			isOrderFeeCount: state => state.order.isOrderFeeCount,
			caclShipInfoHeightSwitch: (state) => state.order.caclShipInfoHeightSwitch
		}),
		bdId() {
      let { workAssign } = this.createItem
      let bdItem = workAssign && workAssign.find((el) => el.jobCode === 'bd')
      if (bdItem && bdItem.employeeId) {
        return bdItem.employeeId
      }
      return ''
    },
		showChangeBizDate() {
      if (
        ['op','doc'].includes(this.ordDetRole) &&
        this.orderInfoDataObj.orderStatus !== 'complete' &&
				this.orderInfoDataObj.finCloseStatus !== 'yes' &&
        this.bizDateModify === null &&
        ['st02', 'st16', 'st17','st04', 'st19','st10', 'st12', 'st23'].includes(this.orderInfoDataObj.serviceType)
      ) {
        return true
      } else {
        return false
      }
    },
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		isOpView() {
			return this.createItem.orderStatus === 'pass'
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'asst'
		},
		isEditState() {
			if (this.$route.query.source === 'whJointList') {
				return false
			} else {
				if (this.orderInfoDataObj.orderStatus === 'draft') {
					if (this.isBd) {
						return true
					} else {
						return false
					}
				} else if (this.orderInfoDataObj.orderStatus === 'pass') {
					if (this.isOp || this.isDoc) {
						return true
					} else {
						return false
					}
				} else {
					return false
				}
			}
		},
		isDocEdit() {
			return this.ordDetRole === 'doc' && this.createItem.orderStatus === 'pass'
		},
		addState() {
			return !this.createItem.ship
		},
		// 操作编辑保存按钮
		opEditState(){
			// 放开已关账、已完成的限制
			// this.createItem.orderStatus === 'pass' || this.createItem.orderStatus === 'break' && this.createItem.finCloseStatus !== 'yes'
			return this.createItem.orderStatus === 'pass' || this.createItem.orderStatus === 'break'
		},
		// 存在协同服务项
		isJoint() {
			return this.createItem.serviceInfoList.some(ele => ele.isJoint === 'y')
		},
		// 操作取消按钮显示
		opCancelBtnShow() {
			return !['CANCEL','BREAK'].includes(this.createItem.cancelJointHandleStatus) && ['pass'].includes(this.createItem.orderStatus) && !this.isOrderFeeCount
		},
		// 操作终止按钮显示
		opBreakBtnShow() {
			return !['CANCEL','BREAK'].includes(this.createItem.cancelJointHandleStatus) && ['pass'].includes(this.createItem.orderStatus) && this.isOrderFeeCount
		},
		bdRemarkState() {
			if (['draft', 'refuse', 'pass', 'complete'].includes(this.createItem.orderStatus)) {
				return true
			}
			return false
		},
	},
	components: {
		ComOrderInfo,
		Worker,
		CheckPoint,
		CancelOrder,
		JointService,
		Cargo,
		TransportInfo,
		PortPopover,
		ChangeBizDatePop,
		RefuseBdManageDialog,
		AuditRemark
	},
	props: {
		orderInfo: {
			type: Object,
			default: () => ({})
		}
	},
	watch: {
		orderInfo: {
			handler(newVal) {
				this.init(newVal)
			},
			deep: true
		},
		ordDetRole: {
			handler(newVal) {
				this.getServiceTypes()
			}
		},
		caclShipInfoHeightSwitch() {
			this.getShipInfoHeight()
		}
	},
	methods: {
		showRemarkDetail(val) {
			this.remarkContent = val
			this.remarkVisible = true
		},

		auditClose() {
			this.remarkVisible = false
		},
		// 保存备注
		handleSaveRemark() {
			const loading = this.$loading({
				target: '.loadingBdRemark',
				lock: true,
				customClass: 'bdRemark-loading',
				spinner: 'el-icon-loading',
				background: 'rgba(0, 0, 0, 0.3)'
			})
			mainRemarkUpdate({
				orderNo: this.createItem.orderNo,
				orderData: this.createItem.bdRemark
			}).finally(res => {
				loading.close()
			})
		},
		bdManageRefusePopClose(action){
      if (action === 'Confirm') {
        this.$emit('getInfo')
      }
      this.bdManageRefusePopShow = false
    },
		changeBizDateClose(action, value) {
      if (action === 'Confirm') {
        this.$confirm('仅有一次手动修改机会，是否确定要修改', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            bizdateChange(value)
              .then((res) => {
                this.changeBizDateShow = false
                this.$message({ type: 'success', message: '修改成功' })
                this.bizDateModify = value.bizDate
                this.createItem.bizDate = value.bizDate
              })
              .finally(() => {})
          })
          .catch(() => {})
      } else {
        this.changeBizDateShow = false
      }
    },
    handleChangeBizDate() {
      this.changeBizDateShow = true
    },
		handleGetOrderInfo() {
      let { orderNo, jointNo } = this.$route.query
      let params = {
        orderNo: orderNo
      }
      if (jointNo) {
        params.jointNo = jointNo
      }
      orderInfo(params).then((res) => {
        let { workAssign } = res.data
        if (workAssign.length) {
          let orderWorkOptions = workAssign.map((item) => {
            return Object.assign(item, { show: true })
          })
          for (let i = 0; i < this.orderWorkOptions.length; i++) {
            if (this.orderWorkOptions[i].jobCode === 'ecs' || this.orderWorkOptions[i].jobCode === 'epricing') {
              this.$set(this.orderWorkOptions[i],'employeeId',orderWorkOptions[i].employeeId)
              this.$set(this.orderWorkOptions[i],'employeeName',orderWorkOptions[i].employeeName)
            }
          }
        }
      })
    },
		// 撤回取消订单
		handleCancelCancel(row) {
			let confirmTxt = this.isOrderFeeCount ? '是否撤回终止订单?' : '是否撤回取消订单?'
			this.$confirm(confirmTxt, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					orderCancelCancel({ orderNo: this.$route.query.orderNo }).then(res => {
						this.$message({
							type: 'success',
							message: '撤回成功',
							duration: 1000,
							onClose: () => {
								this.$emit('getInfo')
							}
						})
					})
				})
				.catch(() => {})
		},
		// 更新委托单位
		updateCust() {
			this.$emit('getInfo')
		},
		orderStatusFilter(status, action) {
			if (!status && ['add', 'copy'].includes(action)) {
				status = 'draft'
			}
			let result = getDictLabel('orderStatus', status)
			return result
		},
		getShipInfoHeight() {
			let comOrderInfoHeight = document.getElementById('comOrderInfo').offsetHeight
			let navHeight = document.getElementById('navCont').offsetHeight
			let alertHeight = document.getElementById('alertCont').offsetHeight
			let bodyHeight = document.body.clientHeight
			this.shipInfoHeight = bodyHeight - alertHeight - navHeight - comOrderInfoHeight
			this.checkPointHeight = bodyHeight - alertHeight - navHeight - comOrderInfoHeight - 46
		},
		// 初始化
		init(data) {
			if (!data || !Object.keys(data).length) return
			let tempData = JSON.parse(JSON.stringify(data))
			// 参与人，关键点，甩柜，取消订单，协同，改船等弹窗默认关闭
			this.countryCode = ''
			let workAssignStr = Cookies.get('workAssignShow')
			this.workAssignShow = workAssignStr === '0' ? false : true
			this.activityKey = 'Worker'
			this.submitDisabled = false
			sessionStorage.setItem('serviceCode', '')
			this.state = this.$route.query.action === 'add' ? 'valid' : ''
			// 清除校验结果
			this.$nextTick(() => {
				this.$refs['selfOrderSubmit'].clearValidate()
			})
			// this.getOrderWork()
			this.fillOrderInfo(tempData)
		},
		// 获取港口countryCode
		getCountryCode(val) {
			this.countryCode = val
		},
		// 分配工作项
		getOrderWork() {
			let { workAssign, jointWorkAssign } = this.createItem
			orderWork({ orderNo: this.$route.query.orderNo }).then(res => {
				// // 取bd部门code
				// let findItem = res.data.find(item => item.jobCode === 'bd')
				// this.obdDeptCode = findItem ? findItem.deptCode : ''
				// 先取obd部门code，再取下单助理部门code最后再取bd部门code
				let findObdItem = res.data.find(item => item.jobCode === 'obd')
				let findAsstItem = res.data.find(item => item.jobCode === 'asst')
				let findBdItem = res.data.find(item => item.jobCode === 'bd')
				let obdDeptCode = findObdItem ? findObdItem.deptCode : ''
				let asstDeptCode = findAsstItem ? findAsstItem.deptCode : ''
				this.bdDeptCode = findBdItem ? findBdItem.deptCode : ''
				this.obdDeptCode = obdDeptCode ? obdDeptCode : asstDeptCode ? asstDeptCode : this.bdDeptCode
				// 创建订单时参与人默认显值
				if (workAssign.length) {
					this.orderWorkOptions = workAssign.map(item => {
						if (item.employeeId == 0) {
							item.employeeName = ''
						}
						return Object.assign(item, { show: true })
					})
				} else {
					// 编辑订单时参与人取自详情
					// 客户自定过滤掉商务和bkg
					if (['st02', 'st16', 'st17'].includes(this.$route.query.serviceType)) {
						this.orderWorkOptions = res.data
							.filter(item => !['pricing', 'bkg'].includes(item.jobCode))
							.map(item => {
								return Object.assign(item, { show: true })
							})
					} else {
						this.orderWorkOptions = res.data.map(item => {
							return Object.assign(item, { show: true })
						})
					}
				}
				// 协同参与人
				if (jointWorkAssign.length) {
					this.jointOrderWorkOptions = jointWorkAssign.map(item => {
						item.isUpdatePricing = false
						item.isUpdateBkg = false
						if (item.employeeId == 0) {
							item.employeeName = ''
						}
						return Object.assign(item, { show: true })
					})
				} else {
					this.jointOrderWorkOptions = []
				}
			})
		},
		// 获取订舱协助审核人
		getJointAuditWork() {
			jointAuditWork({
				orderNo: this.$route.query.orderNo
			}).then(res => {
				this.jointAuditWorkData = res.data
			})
		},
		// 获取协同岗位分配
		getJointWork() {
			jointWork({
				orderNo: this.$route.query.orderNo
			}).then(res => {
				this.jointWorkData = res.data
			})
		},
		// 获取订单详情
		reGetOrderInfo() {
			let { action, source, orderNo } = this.$route.query
			let query = {}
			query = { orderNo: orderNo }
			orderInfo(query).then(res => {
				let { data } = res
				this.fillOrderInfo(data)
			})
		},
		fillOrderInfo(data, type) {
			// 获取业务发起取消的订单的取消原因备注等信息
			if (data.cancelApplyStatus === 'applied') {
				this.$emit('getCancel', data)
			}
			// 获取已拒绝的信息
			if (data.orderStatus === 'refuse') {
				this.$emit('getRefuse', data)
			}
			// 存储委托单位数据等为服务项用
			let { barge, ship, custid, custName, custIntrustNo, businessType, serviceType, serviceList, serviceInfoList, finCloseStatus, prefinCloseStatus } = data
			let { action, source } = this.$route.query
			let cust = {
				custid,
				custName,
				custIntrustNo,
				businessType,
				serviceType
			}
			sessionStorage.setItem('custStr', JSON.stringify(cust))
			sessionStorage.setItem('serviceListStr', JSON.stringify(serviceList))
			sessionStorage.setItem('serviceInfoListStr', JSON.stringify(serviceInfoList))

			Object.assign(this.createItem, data, {
				orderStatus: data.orderStatus,
				cargoList: data.cargoList && data.cargoList.length ? this.getCargoCustOptions(data.cargoList) : [{ boxRemark: '无' }],
				barge: data.barge || {},
				ship: data.ship || {},
				// transport: data.transport ? data.transport : { transportTerm: 'CY/CY' },
				transport: data.transport ? data.transport : {},
				checkPointList: data.checkPointList,
				payMode: data.payMode,
				// payMode: data.payMode || 'prepaid',
				workAssign: data.workAssign,
				jointWorkAssign: data.jointWorkAssign || []
			})

			// 获取服务类型
			this.getBusinessType()
			// 获取服务项下拉
			this.getServiceTypes()
			// 获取参与人
			this.getOrderWork()
			// 获取订舱协助审核人
			this.getJointAuditWork()
			// 获取协同岗位分配
			this.getJointWork()
			// 获取是否包含驳船
			// 新增创建订单，是否包含驳船从url的query获取
			if (!barge && !ship) {
				this.includeFeeder = this.$route.query.includeFeeder
			} else {
				this.includeFeeder = barge ? 'y' : 'n'
			}
			// 获取费用信息
			orderFeeCount({ orderNo: this.$route.query.orderNo }).then(res => {
				this.$store.dispatch('order/setOrderFeeCount', res.data.count > 0)
			})
			// 港口数据反显
			if (data.ship) {
				let { polPortCode, podPortCode, transitPortCode, transitPortCode1, transitPortCode2, unloadingPortCode } = data.ship
				let portCodeArr = []
				polPortCode ? portCodeArr.push(polPortCode) : ''
				podPortCode ? portCodeArr.push(podPortCode) : ''
				transitPortCode ? portCodeArr.push(transitPortCode) : ''
				transitPortCode1 ? portCodeArr.push(transitPortCode1) : ''
				transitPortCode2 ? portCodeArr.push(transitPortCode2) : ''
				unloadingPortCode ? portCodeArr.push(unloadingPortCode) : ''
				this.fillPortCodes = portCodeArr.toString()
				this.transitPortOneShow = transitPortCode1 ? true : false
        this.transitPortTwoShow = transitPortCode2 ? true : false
				if (this.fillPortCodes) {
					this.$store.dispatch('dict/basePortListByCodes', { portCodes: this.fillPortCodes }).then(data => {
						//初始化下拉框数据
						let results = new Map()
						data.map(item => {
							let obj = {}
							obj.label = item.label
							obj.portAttribute = item.portAttribute
							results.set(item.value, obj)
						})
						this.podPortList = data.filter(item => item.portCode === podPortCode)
						this.podPortItem = this.podPortList.find(item => item.portCode === podPortCode)
						this.unloadingPortList = data.filter(item => item.portCode === unloadingPortCode)
						this.unloadPortItem = this.unloadingPortList.find(item => item.portCode === unloadingPortCode)
						this.polPortList = data.filter(item => item.portCode === polPortCode)
						this.polPortItem = this.polPortList.find(item => item.portCode === polPortCode)
						this.transitPortList = data.filter(item => item.portCode === transitPortCode)
						this.transitPortItem = this.transitPortList.find(item => item.portCode === transitPortCode)
						this.transitPortList1 = data.filter(item => item.portCode === transitPortCode1)
						this.transitPortItem1 = this.transitPortList1.find(item => item.portCode === transitPortCode1)
						// console.log('this.transitPortItem1', this.transitPortItem1)
						this.transitPortList2 = data.filter(item => item.portCode === transitPortCode2)
						this.transitPortItem2 = this.transitPortList2.find(item => item.portCode === transitPortCode2)
						let portItem = this.podPortList.find(item => item.portCode === this.createItem.ship.podPortCode)
						this.countryName = portItem ? portItem.countryName : ''
					})
				}
				// 获取系统航线中文名
				this.initSystemLine(podPortCode)
				// 获取目的港countryCode，做木质包装显示隐藏
				if (podPortCode) {
					this.$store.dispatch('dict/basePortListByCodes', { portCodes: podPortCode }).then(data => {
						let portItem = data.find(item => item.portCode === podPortCode)
						this.countryCode = portItem ? portItem.countryCode : ''
					})
				}
			}
			this.finCloseStatusCn = finCloseStatus === 'yes' ? '已关账' : prefinCloseStatus !== 'yes' ? '未关账' : '预关账'
			this.createItem.orderStatus = data.orderStatus
			this.order.orderNo = data.orderNo
			this.order.custid = data.custid
			this.order.custName = data.custName
			this.order.serviceList = data.serviceList
			this.order.serviceInfoList = data.serviceInfoList
			this.order.businessType = data.businessType
			this.finance.orderNo = data.orderNo
			this.finance.businessType = data.businessType
			this.finance.serviceType = data.serviceType
			// this.setDisabled()
		},
		// 货物信息发货单位反显
		getCargoCustOptions(cargoList) {
			let result = cargoList.map(item => {
				item.shipperCustid = item.shipperCustid || ''
				let shipperCustidOptions = item.shipperCustid ? [{ label: item.shipperCustName, value: item.shipperCustid }] : []
				return { ...item, shipperCustidOptions }
			})
			return result
		},
		// 获取服务类型下拉
		getBusinessType() {
			baseBusinessList().then(res => {
				let { data } = res
				data.map(item => {
					// 该业务类型下的服务类型
					if (item.businessType === this.createItem.businessType) {
						this.serviceTypeOptions = item.serviceTypeList
					}
				})
			})
		},
		// 根据业务类型和服务类型查询服务项列表
		getServiceTypes() {
			let param = {
				businessType: this.createItem.businessType,
				serviceType: this.createItem.serviceType
			}
			let temp = []
			// 获取已完成的服务项
			let { serviceInfoList } = this.orderInfo
			let isFinishedArr = []
			serviceInfoList.map(item => {
				if (item.serviceStatus === 'finish' || item.isJoint === 'y') {
					isFinishedArr.push(item.serviceCode)
				}
			})
			// 服务项下拉数据处理
			baseBusinessServiceList(param).then(res => {
				let { data } = res
				data.map(item => {
					if (item.isDefault === 'y') temp.push(item.serviceCode)
					// op操作角色的服务项处理:订舱，代订舱，已完成的服务项不可勾选
					if (this.isOp) {
						if (item.serviceCode === 'book' || item.serviceCode === 'proxy_book' || isFinishedArr.includes(item.serviceCode)) {
							item.disabled = true
						}
						// // 仓储，散车派送二选一;如果有被协同，则另一个服务项不可选
						// if (item.serviceCode === 'pod_warehouse' && isFinishedArr.includes('pod_ltl_delivery') || item.serviceCode === 'pod_ltl_delivery' && isFinishedArr.includes('pod_warehouse')) {
						// 	item.disabled = true
						// }
						// if (item.serviceCode === 'pol_warehouse' && isFinishedArr.includes('pol_ltl') || item.serviceCode === 'pol_ltl' && isFinishedArr.includes('pol_warehouse')) {
						// 	item.disabled = true
						// }
					}
					if (this.isDoc) {
						if (!this.docService.includes(item.serviceCode)) {
							item.disabled = true
						}
					}
				})
				this.serviceCodeOptions = data

				// 新创建订单默认勾选服务项
				if (this.$route.query.action === 'add' && !this.createItem.serviceList.length) {
					Object.assign(this.createItem, {
						serviceList: temp
					})
				}
			})
		},
		// 根据订单状态和角色判断信息是否可编辑
		// setDisabled() {
		// 	// 协同订单不可编辑
		// 	if (this.$route.query.source === 'whJointList') return true
		// 	// bd, obd业务角色在草稿未提交状态下可编辑，其他状态不可编辑
		// 	if (this.isBd && !['draft', 'refuse'].includes(this.createItem.orderStatus)) {
		// 		return true
		// 	}
		// 	// op操作角色基本信息都不可编辑
		// 	if (this.isOp || this.isDoc || this.isEpricing || this.isEcs || this.isAc || this.isOpTruck || !this.ordDetRole) {
		// 		return true
		// 	}
		// 	return false
		// },
		// 返回
		handleGoBack() {
			sessionStorage.removeItem('createOrderStr')
			let name = 'whOrderList'
			if (this.$route.query.source === 'whJointList') {
				name = 'WhJointList'
			}
			this.$router.push({
				name
			})
		},
		// 输出计划单
		handleExportPlan() {
			handleExportPlanCommon()
		},
		// 订单完成
		handleFinish() {
			this.submitDisabled = true
			orderFinish({ orderNo: this.$route.query.orderNo })
				.then(res => {
					this.$message({
						type: 'success',
						message: '订单完成成功',
						duration: 1000,
						onClose: () => {
							this.submitDisabled = false
							this.$emit('getInfo')
							// this.handleGoBack()
							// this.getOrderInfo('Submit')
						}
					})
				})
				.catch(err => {
					setTimeout(() => {
						this.submitDisabled = false
					}, 1000)
				})
		},
		// 业务变更订单状态为终止
		handleBreak() {
			this.$confirm('是否将订单状态修改为终止？', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					orderStatusChangeBreak({
						orderNo: this.$route.query.orderNo
					}).then(res => {
						this.$message({ type: 'success', message: '变更订单状态为终止成功' })
						this.$emit('getInfo')
					})
				})
				.catch(err => {})
		},
		// 业务关闭订单
		handleClose() {
			this.$confirm(`是否关闭此订单?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					orderClose({ orderNo: this.$route.query.orderNo }).then(res => {
						this.$message({
							type: 'success',
							message: '关闭成功',
							duration: 1000,
							onClose: () => {
								this.$router.push({
									path: 'orderList'
								})
							}
						})
					})
				})
				.catch(err => {
					console.log('err')
				})
		},
		// 删除订单
		handleDelete(row) {
			this.$confirm(`是否删除此订单?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					orderDelete({ orderNo: this.$route.query.orderNo }).then(res => {
						this.$message({
							type: 'success',
							message: '删除成功',
							duration: 1000,
							onClose: () => {
								window.close()
								// this.$store.dispatch('tagsView/delView', this.$route)
								// this.$router.push({
								// 	name: 'WhOrderList'
								// })
							}
						})
					})
				})
				.catch(err => {
					console.log('err')
				})
		},
		// 业务发起取消订单
		handleCancelRequest() {
			this.cancelOrderPopShow = true
		},
		// 业务发起取消订单关闭回调
		cancelRequestPopClose(action, value) {
			this.cancelOrderPopShow = false
			if (action === 'Confirm') {
				this.$emit('getInfo')
			}
		},
		// 业务撤回已提交的订单
		handleSubmitCancel() {
			this.$confirm(`是否撤回此订单?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					orderSubmitCancel({ orderNo: this.$route.query.orderNo }).then(res => {
						this.$message({
							type: 'success',
							message: '撤回成功'
							// duration: 1000,
							// onClose: () => {

							// }
						})
						this.$emit('getInfo')
					})
				})
				.catch(err => {
					console.log('err')
				})
		},
		// 操作协同订单
		handleJointService() {
			this.jointServicePopShow = true
		},
		// 协同订单关闭回调
		jointServicePopClose() {
			this.jointServicePopShow = false
		},
		// 操作发起取消订单
		handleOpCancelRequest(cancelType) {
			this.cancelType = cancelType
			let msg = '是否已跟业务确认？'
			// 终止
			if (cancelType === 'break') {
				this.$confirm('是否已跟业务确认？', '是否终止该订单?', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					this.$confirm('该订单已有费用，是否确定终止？', '是否终止该订单?', {
						confirmButtonText: '确定',
						cancelButtonText: '取消',
						type: 'warning'
					}).then(() => {
						// 业务未发起取消，操作终止订单先显示取消原因
						if (this.createItem.cancelApplyStatus !== 'applied') {
							this.cancelOrderPopShow = true
						} else {
							orderCancelHandle({ orderNo: this.$route.query.orderNo, cancelType: cancelType }).then(res => {
								this.$emit('getInfo')
								this.$message({ message: '终止成功', type: 'success' })
							})
						}
					}).catch(err => {})
				}).catch(err => {})
			} else {	// 取消
				msg = '是否已跟业务确认？该订单是否已产生费用，如已产生请去录入相关费用后再取消。'
				// 已有柜号的提示
				if (this.hasCn) {
					msg = '该工作单已有柜号，是否有费用产生，若有费用需先录入费用，再来终止订单；若无费用产生，请先到集装箱列表清除柜号，再来取消订单。'
						return this.$alert(msg, '是否取消该订单?', {
						confirmButtonText: '确定',
						type: 'warning'
					})
				} else if (this.isJoint) {
					msg = '存在协同单，需协同单确认是否要取消协同，是否确定要发起取消？'
				}
				this.$confirm(msg, '是否取消该订单?', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					// 业务未发起取消,操作取消订单时先显示取消原因弹窗
					if (this.createItem.cancelApplyStatus !== 'applied') {
						this.cancelOrderPopShow = true
					} else {	// 业务发起过取消，操作实际执行取消
						orderCancelHandle({ orderNo: this.$route.query.orderNo, cancelType: cancelType }).then(res => {
							this.$emit('getInfo')
							this.$message({ message: '取消成功', type: 'success' })
						})
					}
					// this.cancelOrderPopShow = true
				}).catch(err => {})
			}
		},
		// 复制新窗口打开
		handleCopy() {
			this.$confirm(`是否确认复制工作号: ${this.$route.query.orderNo} 委托单位：${this.createItem.custName} 的数据?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return orderCopy({ orderNo: this.$route.query.orderNo })
				})
				.then(response => {
					let { orderNo } = response.data
					let routeUrl = this.$router.resolve({
						name: 'OrderDetail',
						params: {
							orderNo
						},
						query: Object.assign(
							{ ...this.$route.query },
							{
								orderNo,
								action: 'copy'
							}
						)
					})
					this.$message({
						message: '复制成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							window.open(routeUrl.href, '_blank')
						}
					})
				})
				.catch(err => {})
		},
		// 提交
		handleSubmit() {
			this.handleSave('Submit')
		},
		// 操作编辑
		handleEdit() {
			this.submitDisabled = true
			let data = this.getOpValues()
			// console.log('操作编辑', data);
			// 业务保存提交
			this.$refs['selfOrderSubmit'].validate(valid => {
				// // 只勾选了目的港委托清关，或是只勾选了目的港换单一个服务项时，不允许提交
				// let podArr = data.serviceList.filter(item => item.startsWith('pod_'))
				// let podStr = podArr.join(',')
				// if ( podStr === 'pod_comm_clearance' || podStr === 'pod_change_doc') {
				// 	this.submitDisabled = false
				// 	return this.$message({type: 'error', message: '请再选择其他目的港服务项'})
				// }
				// 操作编辑加上参与人必填校验：操作、应收财务等
				let arr = []
				let opItem = data.workAssign.find(el => el.jobCode === 'op')
				let acItem = data.workAssign.find(el => el.jobCode === 'ac')
				if (opItem && !opItem.employeeId) {
					arr.push('操作')
				}
				if (acItem && !acItem.employeeId) {
					arr.push('应收财务')
				}
				if (arr.length) {
					this.$message.error(`参与人（${arr.join(',')}）不能为空`)
					this.submitDisabled = false
					return
				}
				selfEdit(data)
					.then(res => {
						this.$message({
							type: 'success',
							message: '保存成功',
							duration: 1000,
							onClose: () => {
								// this.submitDisabled = false
								// this.reGetOrderInfo()
								// this.$emit('getInfo')
							}
						})
						this.submitDisabled = false
						this.$emit('getInfo')
						// this.ordDetRole === 'op' && this.$emit('getInfo')
						// this.ordDetRole === 'doc' && this.$emit('getLeftServiceList')
					})
					.catch(err => {
						setTimeout(() => {
							this.submitDisabled = false
						}, 1000)
					})
				})
		},
		handleJointSave() {
			let workAssign = this.jointOrderWorkOptions.map(item => {
				return {
					jobCode: item.jobCode,
					employeeId: item.employeeId ? item.employeeId : 0
				}
			})
			let data = {
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo,
				workAssign
			}
			this.submitDisabled = true
			orderJointSave(data)
				.then(res => {
					this.$message({
						type: 'success',
						message: '保存成功'
					})
					this.submitDisabled = false
					this.$emit('getInfo')
				})
				.catch(err => {
					this.submitDisabled = false
				})
		},
		// 合并传参
		getValues() {
			let cargoList = []
			this.createItem.cargoList.forEach(item => {
				let cargoObj = {}
				Object.assign(cargoObj, {
					// shipperCustid: item.shipperCustid,
					hscode: item.hscode,
					cname: item.cname,
					ename: item.ename,
					property: item.property,
					boxRemark: item.boxRemark,
					commodityTypeCode: item.commodityTypeCode,
					commodityDesc: item.commodityDesc,
					isWoodenPackage: item.isWoodenPackage ? item.isWoodenPackage : undefined
				})
				// 危险品
				if (item.property === 'dangerous') {
					Object.assign(cargoObj, {
						dangerousGrade: item.dangerousGrade,
						dangerousCode: item.dangerousCode,
						packageGroup: item.packageGroup
					})
				}
				cargoList.push(cargoObj)
			})
			// workAssign
			// console.log(this.orderWorkOptions)
			let workArr = this.orderWorkOptions.map(item => {
				return {
					jobCode: item.jobCode,
					employeeId: item.employeeId ? item.employeeId : 0
				}
			})
			return {
				bizDate: this.createItem.bizDate,
				orderNo: this.createItem.orderNo,
				// intrustRemark: this.createItem.intrustRemark,
				payMode: this.createItem.payMode,
				serviceList: this.createItem.serviceList,
				// barge:
				// 	this.includeFeeder === 'y'
				// 		? {
				// 				porPortCode: this.createItem.barge.porPortCode,
				// 				transitWay: this.createItem.barge.transitWay,
				// 				tdTime: this.createItem.barge.tdTime,
				// 				cyCutOff: this.createItem.barge.cyCutOff,
				// 				vessel: this.createItem.barge.vessel,
				// 				voyage: this.createItem.barge.voyage
				// 		  }
				// 		: null,
				ship: {
					// tdTime: this.createItem.ship.tdTime,
					// shipCarrierCode: this.createItem.ship.shipCarrierCode,
					// cyCutOff: this.createItem.ship.cyCutOff,
					polPortCode: this.createItem.ship.polPortCode,
					unloadingPortCode: this.createItem.ship.unloadingPortCode,
					podPortCode: this.createItem.ship.podPortCode,
					transitPortCode: this.createItem.ship.transitPortCode,
					transitPortCode1: this.createItem.ship.transitPortCode1,
					transitPortCode2: this.createItem.ship.transitPortCode2,
					// vessel: this.createItem.ship.vessel,
					// voyage: this.createItem.ship.voyage,
					sysLineCode: this.createItem.ship.sysLineCode
				},
				transport: {
					transportTerm: this.createItem.transport.transportTerm,
					shipper: this.createItem.transport.shipper,
					consignee: this.createItem.transport.consignee,
					notify1: this.createItem.transport.notify1,
					notify2: this.createItem.transport.notify2,
					notify3: this.createItem.transport.notify3
				},
				workAssign: workArr,
				cargoList: cargoList,
				quotationNumber: this.createItem.quotationNumber,
        schemeNumber: this.createItem.schemeNumber,
			}
		},
		// 操作编辑的传参
		getOpValues() {
			let opCargo = this.createItem.cargoList.map(item => {
				let cargoObj = {}
				Object.assign(cargoObj, {
					oid: '',
					quantity: item.quantity,
					volume: item.volume,
					weight: item.weight,
					hscode: item.hscode,
					cname: item.cname,
					ename: item.ename,
					property: item.property,
					boxRemark: item.boxRemark,
					commodityTypeCode: item.commodityTypeCode,
					commodityDesc: item.commodityDesc,
					isWoodenPackage: item.isWoodenPackage ? item.isWoodenPackage : undefined
				})
				// 危险品
				if (item.property === 'dangerous') {
					Object.assign(cargoObj, {
						dangerousGrade: item.dangerousGrade,
						dangerousCode: item.dangerousCode,
						packageGroup: item.packageGroup
					})
				}
				return cargoObj
			})
			// workAssign
			let workArr = this.orderWorkOptions.map(item => {
				return {
					jobCode: item.jobCode,
					employeeId: item.employeeId ? item.employeeId : 0
				}
			})
			// 截放行时间，截报关时间截取冒号之前的字符, 格式：yyyy-MM-dd HH
			let { ccCutOff, cvCutOff } = this.createItem.ship
			if (ccCutOff && ccCutOff.indexOf(':') !== -1) {
				ccCutOff = ccCutOff.substring(13, 0)
			}
			if (cvCutOff && cvCutOff.indexOf(':') !== -1) {
				cvCutOff = cvCutOff.substring(13, 0)
			}
			return {
				payMode: this.createItem.payMode,
				bizDate: this.createItem.bizDate,
				orderNo: this.createItem.orderNo,
				serviceList: this.createItem.serviceList,
				workAssign: workArr,
				cargoList: opCargo,
				// intrustRemark: this.createItem.intrustRemark,
				ship: {
					// shipCarrierCode: this.createItem.ship.shipCarrierCode,
					polPortCode: this.createItem.ship.polPortCode,
					unloadingPortCode: this.createItem.ship.unloadingPortCode,
					podPortCode: this.createItem.ship.podPortCode,
					transitPortCode: this.createItem.ship.transitPortCode,
					transitPortCode1: this.createItem.ship.transitPortCode1,
					transitPortCode2: this.createItem.ship.transitPortCode2,
					// tdTime: this.createItem.ship.tdTime,
					// vessel: this.createItem.ship.vessel,
					// voyage: this.createItem.ship.voyage,
					// ccCutOff: ccCutOff ? `${ccCutOff}:00:00` : '',
					// cvCutOff: cvCutOff ? `${cvCutOff}:00:00` : '',
					// cyCutOff: this.createItem.ship.cyCutOff,
					sysLineCode: this.createItem.ship.sysLineCode
				},
				transport: {
					transportTerm: this.createItem.transport.transportTerm,
					shipper: this.createItem.transport.shipper,
					consignee: this.createItem.transport.consignee,
					notify1: this.createItem.transport.notify1,
					notify2: this.createItem.transport.notify2,
					notify3: this.createItem.transport.notify3
				},
				// barge: {
				// 	tdTime: this.createItem.barge.tdTime,
				// 	vessel: this.createItem.barge.vessel,
				// 	voyage: this.createItem.barge.voyage,
				// 	cyCutOff: this.createItem.barge.cyCutOff
				// },
			}
		},
		// 业务保存提交必填校验
		validate(data) {
			console.log('workAssign', data.workAssign)
			// // asst下单助理，eac海外应收财务等不用校验
			// // ['eac', 'asst', 'obd', 'op_truck', 'doc', 'csc', 'line_cs', 'tc', 'rc','ecs','epricing']
			// if (this.hasDestination) {
			// 	this.isNotRequiredWorker = ['eac', 'asst', 'obd', 'op_truck', 'doc', 'csc', 'line_cs', 'tc', 'rc']
			// }else{
			// 	this.isNotRequiredWorker = ['eac', 'asst', 'obd', 'op_truck', 'doc', 'csc', 'line_cs', 'tc', 'rc', 'ecs', 'epricing']
			// }
			let filterData = data.workAssign.filter(item => !this.isNotRequiredWorker.includes(item.jobCode))
			let employeeIdArr = filterData.map(item => item.employeeId)
			// 获取参与人职业名称，拼接做非空提示
			let emptyTxtArr = []
			filterData.map(item => {
				if (item.employeeId === null || item.employeeId === 0 || item.employeeId === '') {
					let findItem = this.orderWorkOptions.find(ele => ele.jobCode === item.jobCode)
					findItem.jobCname && emptyTxtArr.push(findItem.jobCname)
				}
			})
			let emptyTxtStr = emptyTxtArr.join('、')
			if (!employeeIdArr.length || employeeIdArr.includes('') || employeeIdArr.includes(null) || employeeIdArr.includes(0)) {
				this.$message.error(`${emptyTxtStr}参与人不能为空`)
				return false
			}
			return true
		},
		checkSpeciesStrMethod(item) {
			let check = true
			if(!item) return check
			let reg = /[^\x00-\x7F]+/g
			let result = item.match(reg)
			if(result && result.length) {
        if(result.every(o => this.speciesStrArr.includes(o))) {
					check = true
				} else {
					check = false
				}
			} else {
				check = true
			}
			return check
		},
		validateSpeciesStr(data) {
			// 校验特殊字符
			let transport = data.transport || {}
		  let noTaiwanArr = [
				transport.shipper,
				transport.consignee,
				transport.notify1,
				transport.notify2,
				transport.notify3,
			]
			if (noTaiwanArr.some(item => !this.checkSpeciesStrMethod(item))) {
				this.$message.warning('发货人,收货人,通知人中不能包含中文字符及特殊字符!')
				return false
			} else {
				return true
			}
		},
		cargoCnCharValidate(data) {
			let result = true
			let { cargoList } = data
			let cnChar = /[\u4E00-\u9FA5\uFE30-\uFFA0]/
			let cnValid = cargoList.some(item => {
				return item.ename && cnChar.test(item.ename)
			})
			if (cnValid) {
				this.$message({ type: 'error', message: '英文品名只能包含英文、数字、符号;' })
				result = false
			}
			return result
		},
		// 提交保存
		handleSave(type) {
			this.submitDisabled = true
			let data = this.getValues()

			let obdEmployee = data.workAssign.find(el=>el.jobCode==='obd')
			let asstEmployee = data.workAssign.find(el=>el.jobCode==='asst')
			let obdEmployeeId =obdEmployee?obdEmployee.employeeId:''
			let asstEmployeeId =asstEmployee?asstEmployee.employeeId:''
			if(obdEmployeeId&&asstEmployeeId){
				this.$message.error('销售助理(OBD)和下单助理不能同时选择')
				return (this.submitDisabled = false)
			}
			// 提交
			if (type === 'Submit') {
				data.submitType = 'submit'
				let canSubmit = true
				this.$refs['selfOrderSubmit'].validate(valid => {
					if (valid) {
					} else {
						this.submitDisabled = false
						canSubmit = false
						toViewPosition('ship-cont', 80)
						console.log('error submit!!')
						return false
					}
				})
				if (!canSubmit) {
					return this.$message.error('请按要求填写数据')
				}
				// 保存或提交时都校验参与人
				if (!this.validate(data)) {
					return (this.submitDisabled = false)
				}
				if (!data.serviceList.length) {
					this.submitDisabled = false
					return this.$message({
						type: 'error',
						message: '请选择服务项'
					})
				}
				// // 只勾选了目的港委托清关，或是只勾选了目的港换单一个服务项时，不允许提交
				// let podArr = data.serviceList.filter(item => item.startsWith('pod_'))
				// let podStr = podArr.join(',')
				// if ( podStr === 'pod_comm_clearance' || podStr === 'pod_change_doc') {
				// 	this.submitDisabled = false
				// 	return this.$message({type: 'error', message: '请再选择其他目的港服务项'})
				// }
				// this.orderInfoDataObj.serviceType === 'st02' &&
        //     data.submitType === 'submit' &&
        //     this.orderInfoDataObj.isFirstOrder ==='Y' &&
        //     (!this.orderInfoDataObj.bdManageEmployeeId || (this.orderInfoDataObj.bdManageEmployeeId&&this.orderInfoDataObj.bdManageEmployeeId!==userId))
				if (
            this.orderInfoDataObj.serviceType === 'st02' &&
            data.submitType === 'submit' &&
            this.orderInfoDataObj.isFirstOrder ==='Y' &&
            (!this.orderInfoDataObj.bdManageEmployeeId || (this.orderInfoDataObj.bdManageEmployeeId&&this.orderInfoDataObj.bdManageEmployeeId!==this.userId))
          ) {
            // 客户自定，是否点的提交，是否是首单，是否有业务主管
            if (!this.orderInfoDataObj.bdManageEmployeeId) {
              // 没有设置业务主管，提醒去设置
              this.$message.error(
                '部门主管还未设置，请联系管理员配置部门主管人员。你可以先点击保存按钮对数据进行保存！'
              )
							this.submitDisabled = false
              return
            } else {
              data.submitType = 'pre_submit'
              this.$confirm(
                `此客户自订订单是该客户的首单，需提交给 ${this.orderInfoDataObj.bdManageEmployeeName} 审核，是否确定提交？`,
                '提示',
                {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning',
                }
              )
                .then(() => {
                  // 业务提交
									selfSave(data)
										.then(res => {
											this.$message({
												type: 'success',
												message: '提交成功'
											})
											this.submitDisabled = false
											sessionStorage.removeItem('createOrderStr')
											this.$emit('getInfo')
										})
										.catch(err => {
											setTimeout(() => {
												this.submitDisabled = false
											}, 1000)
										})
                })
                .catch(() => {
									this.submitDisabled = false
								})
            }
            return
					}
				// 校验特殊字符
				if(!this.validateSpeciesStr(data)) {
					this.submitDisabled = false
					return
				}
				// 业务提交
				selfSave(data)
					.then(res => {
						this.$message({
							type: 'success',
							message: '提交成功'
						})
						this.submitDisabled = false
						sessionStorage.removeItem('createOrderStr')
						this.$emit('getInfo')
					})
					.catch(err => {
						setTimeout(() => {
							this.submitDisabled = false
						}, 1000)
					})
			} else {
				// 保存
				data.submitType = 'draft'
				if (!this.cargoCnCharValidate(data)) {
					this.submitDisabled = false
					return
				}
				// 业务保存
				selfSave(data)
					.then(res => {
						this.$message({
							type: 'success',
							message: '保存成功'
						})
						this.submitDisabled = false
						sessionStorage.removeItem('createOrderStr')
						this.$emit('getInfo')
					})
					.catch(err => {
						setTimeout(() => {
							this.submitDisabled = false
						}, 1000)
					})
			}
		},
		handleClick(tab, event) {},
		toggleWorkAssign() {
			this.workAssignShow = !this.workAssignShow
			let value = this.workAssignShow ? 1 : 0
			Cookies.set('workAssignShow', value)
		},
		// 港口下拉数据
		transitPortSearch(queryString, portAttribute, state) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				let result = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
				this.portList = result
			})
		},
		// 驳船收货地
		porPortVisibleChange(val) {
			if (val) this.porPortSearch('', 'port_of_feeder', this.state)
		},
		porPortFilterMehod(val) {
			this.porPortSearch(val, 'port_of_feeder', this.state)
		},
		porPortSearch(queryString, portAttribute, state) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				let result = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
				this.porPortList = result
			})
		},
		handleChangePorPortCode(val) {
			let findItem = this.porPortList.find(item => item.portCode === val)
			this.porPortItem = findItem || {}
		},
		// 大船起运港
		polPortVisibleChange(val) {
			if (val) this.polPortSearch('', 'port_of_basic', this.state)
		},
		polPortFilterMehod(val) {
			this.polPortSearch(val, 'port_of_basic', this.state)
		},
		polPortSearch(queryString, portAttribute, state) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				let result = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
				this.polPortList = result
			})
		},
		handleChangePolPortCode(val) {
			let findItem = this.polPortList.find(item => item.portCode === val)
			this.polPortItem = findItem || {}
		},
		// 添加中转港
    handleAddTransitPort() {
      if (!this.transitPortOneShow) {
        this.transitPortOneShow = true
      } else if (this.transitPortOneShow && !this.transitPortTwoShow) {
        this.transitPortTwoShow = true
      }
    },
    // 删除中转港2
    handleDeleteOne() {
      this.transitPortOneShow = false
      this.createItem.ship.transitPortCode1 = ''
      this.transitPortItem1 = {}
    },
    // 删除中转港3
    handleDeleteTwo() {
      this.transitPortTwoShow = false
      this.createItem.ship.transitPortCode2 = ''
      this.transitPortItem2 = {}
    },
		// 中转港
    transitPortVisibleChange(val) {
      // if (val) this.polPortSearch('', 'port_of_basic', this.state)
    },
    transitPortFilterMehod(val) {
      this.transitPortSearch(val, 'port_of_basic', this.state)
    },
    handleChangeTransitPortCode(val) {
      let findItem = this.transitPortList.find(item => item.portCode === val)
      this.transitPortItem = findItem || {}
    },
    // 中转港
    transitPortVisibleChangeOne(val) {},
    transitPortFilterMehodOne(val) {
      this.transitPortSearchOne(val, 'port_of_basic', this.state)
    },
    handleChangeTransitPortCodeOne(val) {
      let findItem = this.transitPortList1.find(item => item.portCode === val)
      this.transitPortItem1 = findItem || {}
    },
    // 中转港
    transitPortVisibleChangeTwo(val) {},
    transitPortFilterMehodTwo(val) {
      this.transitPortSearchTwo(val, 'port_of_basic', this.state)
    },
    handleChangeTransitPortCodeTwo(val) {
      let findItem = this.transitPortList2.find(item => item.portCode === val)
      this.transitPortItem2 = findItem || {}
    },
    // 中转港1下拉数据
    transitPortSearch(queryString, portAttribute, state) {
      this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
        let result = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
        this.transitPortList = result
      })
    },
    // 中转港2下拉数据
    transitPortSearchOne(queryString, portAttribute, state) {
      this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
        let result = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
        this.transitPortList1 = result
      })
    },
    // 中转港3下拉数据
    transitPortSearchTwo(queryString, portAttribute, state) {
      this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
        let result = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
        this.transitPortList2 = result
      })
    },
		// 卸货港
		unloadPortVisibleChange(val) {
			if (val) this.unloadingPortSearch('', 'port_of_discharge', this.state)
		},
		unloadPortFilterMehod(val) {
			this.unloadingPortSearch(val, 'port_of_discharge', this.state)
		},
		unloadingPortSearch(queryString, portAttribute, state) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				let result = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
				this.unloadingPortList = result
			})
		},
		handleChangeUnloadPortCode(val) {
			let findItem = this.unloadingPortList.find(item => item.portCode === val)
			this.unloadPortItem = findItem || {}
		},
		// 目的地
		podPortVisibleChange(val) {
			if (val) this.podPortSearch('', 'port_of_destination', this.state)
		},
		podPortFilterMehod(val) {
			this.podPortSearch(val, 'port_of_destination', this.state)
		},
		podPortSearch(queryString, portAttribute, state) {
			this.$store.dispatch('dict/basePortList', { queryString, portAttribute, state }).then(data => {
				let result = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
				this.podPortList = result
			})
		},
		handleChangePodPortCode(val) {
			let findItem = this.podPortList.find(item => item.portCode === val)
			this.podPortItem = findItem || {}
			if (val) {
				// bd修改目的地获取国家判断显示货物信息里的是否包含木质包装
				if (this.isBd || this.isOp) {
					// 获取国家code
					let portItem = this.podPortList.find(item => item.portCode === val)
					this.countryName = portItem ? portItem.countryName : ''
					let countryCode = portItem ? portItem.countryCode : ''
					this.getCountryCode(countryCode)
				}
				// 根据目的港自动匹配系统航线
				this.initSystemLine(val)
			} else {
				this.createItem.ship.sysLineCode = ''
				this.sysLineName = ''
				this.countryName = ''
			}
		},
		initSystemLine(val) {
			if (val) {
				portSystemLineInfo(val).then(response => {
					let systemLineList = response.data
					if (systemLineList.length > 0) {
						let systemLine = systemLineList[0]
						this.createItem.ship.sysLineCode = systemLine.sysLineCode
						this.sysLineName = systemLine.cname
					}
				})
			} else {
				this.createItem.ship.sysLineCode = ''
				this.sysLineName = ''
			}
		}
	}
}
</script>
<style lang="scss">
@import '../../less/index.scss';
#selfOrder .so-table-border td {
	border-right: 1px solid #dfe6ec !important;
}
.vessel-time-popover {
	margin-left: 5px;
}
</style>
