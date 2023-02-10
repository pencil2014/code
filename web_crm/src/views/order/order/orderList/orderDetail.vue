<template>
	<div>
		<div class="edit-container">
			<div id="comOrderInfo">
				<ComOrderInfo
					ref="first"
					:createItem="createItem"
					:orderStatus="createItem.orderStatus"
					:serviceTypeOptions="serviceTypeOptions"
					:serviceCodeOptions="serviceCodeOptions"
					@getHeight="getShipInfoHeight"
					@updateCust="updateCust"
				>
					<div class="operateBtn-group">
						<div class="btn-groups">
							<template v-if="$route.query.source !== 'jointList'">
								<!-- 业务 -->
								<template v-if="isBd">
									<el-button size="mini" type="primary" @click="handleSave" :disabled="submitDisabled" v-if="['draft', 'refuse'].includes(createItem.orderStatus) || !viewState">保存</el-button>
									<el-button size="mini" type="primary" @click="handleSubmit" :disabled="submitDisabled" v-if="['draft', 'refuse'].includes(createItem.orderStatus) || !viewState">提交</el-button>
									<el-button size="mini" type="warning" @click="handleChangeSave" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus)">改船改港</el-button>
									<el-button size="mini" type="warning" @click="handleAddCont" :disabled="submitDisabled" v-if="createItem.orderStatus === 'pass' && !isBulkRo">调整箱型箱量</el-button>
									<el-button
										size="mini"
										type="danger"
										class=""
										@click="handleCancelRequest"
										:disabled="submitDisabled"
										v-if="['book_release', 'release_custom'].includes(createItem.bkgStatus) && createItem.orderStatus !== 'complete' && !copyState && createItem.cancelApplyStatus !== 'applied'"
										>{{isOrderFeeCount ? '终止' : '取消'}}</el-button
									>
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
									<!-- 代订舱的审核通过的 -->
									<el-button size="mini" type="default" class="submitCancel" @click="handleProxyCancel" :disabled="submitDisabled" v-if="createItem.orderStatus === 'pass' && createItem.serviceList.includes('proxy_book') && createItem.submitCancelStatus !== 'APPLIED'">撤回</el-button>
									<el-button size="mini" type="default" class="submitCancel" @click="handleSubmitCancel" :disabled="submitDisabled" v-if="createItem.orderStatus === 'submit'">撤回</el-button>
									<el-button size="mini" type="default" class="" @click="handleCopy" :disabled="submitDisabled" v-if="!addState">复制</el-button>
									<template v-if="isOrderFeeCount">
										<el-button size="mini" type="danger" class="" @click="handleBreak" :disabled="submitDisabled" v-if="createItem.orderStatus === 'refuse'">终止</el-button>
									</template>
									<el-button size="mini" type="default" @click="handleClose" :disabled="submitDisabled" v-else-if="createItem.orderStatus === 'refuse'">关闭</el-button>
								</template>
								<!-- 操作 -->
								<template v-if="(isDoc|| isOp) && hasDestinationServices">
									<el-button size="mini" type="primary" class="" @click="saMailShow = true" v-if="['pass'].includes(createItem.orderStatus)" :disabled="submitDisabled">发送SA</el-button>
								</template>
								<template v-if="isOp">
									<!-- <el-button size="mini" type="default" @click="handleGoBack" :disabled="submitDisabled">返回</el-button> -->
									<el-button size="mini" type="primary" class="" @click="handleEdit" v-if="opEditState" :disabled="submitDisabled">保存</el-button>
									<el-button size="mini" type="success" class="" @click="handleFinish" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus)">完成</el-button>
								</template>
								<el-button size="mini" type="primary" class="" @click="handleExportPlan">输出计划单</el-button>
								<el-button v-if="viewOpPlan" size="mini" type="primary" class="" @click="handleToPlan">智能计划单</el-button>
								<template v-if="isOp">
									<el-button size="mini" type="warning" @click="handleChangeSave" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus)">改船改港</el-button>
									<el-button size="mini" type="warning" @click="handleAddCont" :disabled="submitDisabled" v-if="createItem.orderStatus === 'pass' && !isBulkRo">调整箱型箱量</el-button>
									<!-- <el-button size="mini" type="warning" class="" @click="handleDrop" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus) && createItem.bkgStatus === 'book_release'">甩柜</el-button> -->
									<el-button size="mini" type="danger" class="" @click="handleOpCancelRequest('break')" :disabled="submitDisabled" v-if="!['CANCEL','BREAK'].includes(createItem.cancelJointHandleStatus) && ['pass'].includes(createItem.orderStatus) && ['book_release', 'release_custom'].includes(createItem.bkgStatus) && isOrderFeeCount">终止</el-button>
									<el-button size="mini" type="danger" class="" @click="handleOpCancelRequest('cancel')" :disabled="submitDisabled" v-if="!['CANCEL','BREAK'].includes(createItem.cancelJointHandleStatus) && ['pass'].includes(createItem.orderStatus) && ['book_release', 'release_custom'].includes(createItem.bkgStatus) && !isOrderFeeCount">取消</el-button>
								</template>
								<template v-if="isOp || isOpcustomsOrOpwh">
									<el-button size="mini" type="default" class="" @click="handleJointService" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus)">协同</el-button>
								</template>
								<template v-if="(isDoc || isCsc) && !isOp">
									<el-button size="mini" type="primary" class="" @click="handleEdit" v-if="['pass'].includes(createItem.orderStatus)" :disabled="submitDisabled">保存</el-button>
								</template>
								<template v-if="(isEcs || isEpricing) && !isOp">
									<el-button size="mini" type="primary" class="" @click="handleEdit" v-if="EcsEditState" :disabled="submitDisabled">保存</el-button>
								</template>
								<!-- 拖报操作 功能暂不开放 -->
								<!-- <template v-if="isOpTruck">
									<el-button size="mini" type="default" class="" @click="handleJointService" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus)">协同</el-button>
								</template> -->
							</template>
							<template v-if="$route.query.source === 'jointList'">
								<!-- 20220113版本 协同单增加打印计划单功能 刘小志开发 -->
								<el-button size="mini" type="primary" class="" @click="handleExportPlan">输出计划单</el-button>
								<el-button v-if="viewOpPlan" size="mini" type="primary" class="" @click="handleToPlan">智能计划单</el-button>
								<template v-if="isOp || isDoc || isCsc">
									<el-button size="mini" type="primary" class="" @click="handleJointSave" v-if="['pass'].includes(createItem.orderStatus)" :disabled="submitDisabled">保存</el-button>
								</template>
								<template v-if="(isEcs || isEpricing) && !isOp">
									<el-button size="mini" type="primary" class="" @click="handleJointSave" v-if="EcsEditState" :disabled="submitDisabled">保存</el-button>
								</template>
							</template>
							<!-- <el-button size="mini" type="default" @click="handleGoBack" :disabled="submitDisabled">返回</el-button> -->
						</div>
						<div class="status">
							<span class="label">订单状态:</span>
							<span
								class="value"
								:class="createItem.orderStatus === 'complete' || createItem.orderStatus === 'pass' ? 'green' : createItem.orderStatus === 'submit' ? 'yellow' : ['refuse', 'cancel', 'break'].includes(createItem.orderStatus) ? 'red' : 'black'"
							>
								<i></i>{{ orderStatusFilter(createItem.orderStatus, $route.query.action) }}
							</span>
							<span class="label ml10">关账状态:</span>
							<span class="value" :class="finCloseStatusCn === '已关账' ? 'green' : finCloseStatusCn === '预关账' ? 'blue' : 'black'"><i></i>{{ finCloseStatusCn }}</span>
						</div>
					</div>
				</ComOrderInfo>
				<div v-if="isOp && isBulkRo" class="lcl-bkg-status">
					<span class="status-title">订舱状态:</span>
					<el-radio-group v-model="bulkRoBkgStatus" :disabled="!['pass'].includes(createItem.orderStatus)">
						<el-radio :label="item.value" v-for="(item, index) in bkgStatusList" :key="item.value" :disabled="index < bkgStatusIndex">{{ item.label }}</el-radio>
					</el-radio-group>
				</div>
			</div>
			<div class="order-cont" id="bookInfoCont">
				<el-form ref="orderSubmit" :model="createItem" :rules="rules" class="order-cont-form" size="mini">
					<!-- 订舱信息 -->
					<div class="ship-cont" ref="shipInfoCont" :class="workAssignShow ? 'abs-toogle' : ''" :style="{ height: `${shipInfoHeight}px` }">
						<div class="toggleWorkAssign" @click="toggleWorkAssign">
							<i class="hamburger el-icon-arrow-right" :class="{ 'is-active': !workAssignShow }"></i>
						</div>
						<h1 class="orderInfo-h1">订舱信息</h1>
						<OrderBookInfo
							:createItem="createItem"
							:includeFeeder="includeFeeder"
							:fillPolData="fillPolData"
							:fillPortCodes="fillPortCodes"
							:orderStatus="createItem.orderStatus"
							:sysLineCname="sysLineCname"
							:containerTotal="containerTotal"
							ref="orderBookInfo"
							@getCountryCode="getCountryCode"
							@change="handleChangeIncludeFeeder"
							@updatePricing="updatePricing"
							@priceTypeIsBd="getSysLineManager"
							@saveRemark="handleSaveRemark"
							@updateGetInfo="updateGetInfo"
							@updateFreeTimeSys="updateFreeTimeSys"
						/>
						<OverseasInfo :createItem="createItem" :businessType="createItem.businessType" :bdId="bdId" :polCode="createItem.ship.polPortCode" :podCode="createItem.ship.podPortCode" @updateGetInfo="updateGetInfo" :orderStatus="createItem.orderStatus" />
						<SoContainer :containerTotal="containerTotal" :createItem="createItem" :orderStatus="createItem.orderStatus" @emptyFreeTimeSys="emptyFreeTimeSys" ref="soContainer" v-if="!isBulkRo" />
						<!-- 货物信息 -->
						<div class="row-cont">
							<div class="row-cont-tit">
								<span class="tit ft12">货物信息</span>
								<span class="cargo-total" v-if="isBulkRo">
									<span class="item">总件数合计：{{ cargoTotal.quantity }}</span>
									<span class="item">总重量合计：{{ cargoTotal.weight }}KGS</span>
									<span class="item">总体积合计：{{ cargoTotal.volume }}CBM</span>
									<span class="item">总计费吨合计：{{ cargoTotal.feeWeight }}</span>
								</span>
							</div>
							<Cargo :createItem="createItem" :orderStatus="createItem.orderStatus" :countryCode="countryCode" @emptyFreeTimeSys="emptyFreeTimeSys" ref="cargo" />
						</div>
						<!-- 物流信息 -->
						<div class="row-cont">
							<div class="row-cont-tit">
								<span class="tit">物流信息</span>
							</div>
							<TransportInfo :createItem="createItem" :orderStatus="createItem.orderStatus" ref="transport" />
						</div>
					</div>
					<!-- 参与人与关键点 -->
					<div class="work-assign-cont" v-if="workAssignShow" :style="{ height: `${shipInfoHeight}px` }">
						<el-tabs v-model="activityKey" @tab-click="handleClick">
							<el-tab-pane v-for="item in workAssignMenus" :label="item.value" :name="item.key" :key="item.key"> </el-tab-pane>
						</el-tabs>
						<component
							ref="activityKey"
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
							@changeEmployeeId="changeEmployeeId"
						></component>
					</div>
				</el-form>
			</div>
			<!-- 做柜后改船弹窗 -->
			<div v-if="changeSavePopShow">
				<ChangeSave @close="changeSavePopClose" :createItem="createItem" :includeFeeder="includeFeeder" :isBulkRo="isBulkRo" />
			</div>
			<!-- 加柜弹窗 -->
			<div v-if="addContPopShow">
				<AddContainer :createItem="createItem" @close="addContPopClose" />
			</div>
			<!-- 甩柜弹窗 -->
			<div v-if="dropContainerPopShow">
				<DropContainer @close="dropContainerPopClose" :createItem="createItem" />
			</div>
			<!-- 取消订单弹窗 -->
			<div v-if="cancelOrderPopShow">
				<CancelOrder @close="cancelRequestPopClose" :orderNo="$route.query.orderNo" :cancelType="cancelType" :isBd="isBd" :isOp="isOp" :isOrderFeeCount="isOrderFeeCount" />
			</div>
			<!-- 协同订单弹窗 -->
			<div v-if="jointServicePopShow">
				<JointService @close="jointServicePopClose" :createItem="createItem" />
			</div>
			<!-- 代订舱撤回 -->
			<div v-if="proxyCancelApplyShow">
				<ProxyCancelApplyPop @close="proxyCancelApplyPopClose" :bkgEmployeeName="bkgEmployeeName"/>
			</div>
			<div v-if="saMailShow">
				<SaMail @close="saMailClose" :containerTotal="containerTotal"></SaMail>
			</div>
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import Cookies from 'js-cookie'
import { getDictLabel } from '@/utils/tools'
import { toViewPosition } from '@/utils/scroll-to.js'
import { handleExportPlanCommon } from '@/utils/orderCommonMethod'
import ComOrderInfo from './components/comOrderInfo'
import OrderBookInfo from './components/orderBookInfo'
import TransportInfo from './components/transportInfo'
import SoContainer from './components/soContainer'
import Cargo from './components/cargo'
import Worker from './components/workerJoint'
import CheckPoint from './components/checkPoint'
import ChangeSave from './components/changeSave'
import AddContainer from './components/addContainer/addContainerPop'
import DropContainer from './components/dropContainer'
import CancelOrder from './components/cancelOrder'
import JointService from './components/jointService'
import OverseasInfo from './components/overseasInfo'
import ProxyCancelApplyPop from './components/proxyCancelApplyPop'
import { baseBusinessList, baseBusinessServiceList, portSystemLineInfo, SystemLineManager } from '@/api/base'
import { arrayHasDuplicateValue } from '@/utils/index'
import SaMail from './components/saMail'
import {
	orderInfo,
	orderJointInfo,
	orderSave,
	orderEdit,
	orderWork,
	orderCancelHandle,
	orderCopy,
	orderFinish,
	orderClose,
	orderDelete,
	orderSubmitCancel,
	jointAuditWork,
	jointWork,
	mainRemarkUpdate,
	orderPlanExport,
	orderCancelCancel,
	planExportReview,
	orderStatusChangeBreak,
	orderJointSave,
	orderContainerList,
	proxyCancelApply
} from '@/api/order/list'
import { getBookSoList } from '@/api/order/book/list'
import { orderFeeCount } from '@/api/fin/fee'
import { mainRouteFreeTime } from '@/api/charge'

export default {
	filters: {
		cargoSourceFilter(cargoSource) {
			return getDictLabel('cargoSource', cargoSource)
		}
	},
	data() {
		return {
			saMailShow:false,
			bulkRoBkgStatus: '',
			bkgStatusIndex: 0, // 当前订舱状态在订舱状态数组中的索引值
			bkgStatusList: [
				{ label: '未订舱', value: 'pass', en: 'pass' },
				{ label: '已订舱', value: 'booked', en: 'booked' },
				{ label: '上家已放舱', value: 'book_release', en: 'book_release' },
				{ label: '已放舱给客户', value: 'release_custom', en: 'release_custom' }
			],
			state: '',
			oQuery: this.$route.query,
			includeFeeder: '',
			workAssignShow: false,
			countryCode: '',
			shipInfoHeight: 0, // 订舱信息高度
			checkPointHeight: 0, // 关键点高度
			createItem: Object.assign(
				{ ...this.$store.state.order.orderList.createItem },
				{
					quotationNumber:'',
					schemeNumber:''
				}
			),
			opCargoItem: { ...this.$store.state.order.orderList.opCargoItem, feeWeight: '' },
			opSizeItem: { ...this.$store.state.order.orderList.opSizeItem },
			rules: {},
			workAssignMenus: [
				{
					key: 'Worker',
					value: '参与人'
				},
				{
					key: 'CheckPoint',
					value: '关键点'
				}
			],
			activityKey: 'Worker',
			// 做柜后改船弹窗
			changeSavePopShow: false,
			addContPopShow: false,
			// 取消订单弹窗
			cancelOrderPopShow: false,
			cancelType: '',
			// 协同订单弹窗
			jointServicePopShow: false,
			// 甩柜弹窗
			dropContainerPopShow: false,
			// 港口反显数据
			fillPolData: {},
			orderWorkOptions: [],
			jointOrderWorkOptions: [],
			fillPortCodes: '',
			submitDisabled: false,
			serviceTypeOptions: [], // 服务类型下拉
			serviceCodeOptions: [], // 服务项下拉
			docService: ['doc', 'insurance', 'pod_ltl_delivery', 'pod_change_doc', 'pod_comm_clearance', 'pod_fcl_delivery', 'pod_warehouse', 'pod_wh_matter', 'pod_ltl_delivery'],
			sysLineCname: '', // 系统航线中文名称
			jointAuditWorkData: {},
			jointWorkData: [],
			finCloseStatusCn: '', // 关账状态/预关账状态
			obdDeptCode: '', // obd部门code
			bdDeptCode: '',
			origPricingEmployeeId: '',
			origBkgEmployeeId: '',
			origOpEmployeeId: '',
			isNotRequiredWorker: ['op_truck','op_customs','op_wh','eac', 'asst', 'obd', 'doc', 'csc', 'line_cs', 'ecs', 'epricing'], // 非必填参与人
			SystemLineManagerList: [], // 系统航线经理列表
			hasCn: false,
			workAssignTipObj: store.state.order.orderList.workAssignObj,
			proxyCancelApplyShow: false,	// 代订舱订单的撤回弹窗
			tempFreeTimeSys: ''
		}
	},
	created() {
		this.sysLineManagerList()
		this.init(this.orderInfo)
	},
	mounted() {
		window.addEventListener('resize', this.getShipInfoHeight)
		this.$nextTick(() => {
			this.getShipInfoHeight()
		})
	},
	destroyed() {
		window.removeEventListener('resize', this.getShipInfoHeight)
	},
	computed: {
		bdId() {
      let { workAssign } = this.createItem
      let bdItem = workAssign && workAssign.find((el) => el.jobCode === 'bd')
      if (bdItem && bdItem.employeeId) {
        return bdItem.employeeId
      }
      return ''
    },
		isEpricing() {
			return this.ordDetRole === 'epricing'
		},
		isEcs() {
			return this.ordDetRole === 'ecs'
		},
		hasDestination() {
			return arrayHasDuplicateValue(['pod_change_doc', 'pod_ltl_delivery', 'pod_fcl_delivery', 'pod_comm_clearance', 'pod_warehouse'], this.createItem.serviceList)
		},
		hasDestinationServices(){
			// 是否要做目的港服务项
			if(
				this.shipOrderInfoData.serviceList.includes('pod_change_doc')||
				this.shipOrderInfoData.serviceList.includes('pod_ltl_delivery')||
				this.shipOrderInfoData.serviceList.includes('pod_fcl_delivery')||
				this.shipOrderInfoData.serviceList.includes('pod_comm_clearance')||
				this.shipOrderInfoData.serviceList.includes('pod_warehouse')
				){
				return true
			}
			return false
		},
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			userEditRoles: state => state.order.orderList.userEditRoles,
			specialEditRoles: state => state.order.orderList.specialEditRoles,
			userId: state => state.user.userId,
			roles: state => state.user.roles,
			order: state => state.order,
			finance: state => state.finance,
			orderList: state => state.order.orderList,
			speciesStrArr: state => state.order.speciesStrArr,
			workAssignObj: state => state.order.orderList.workAssignObj,
			isOrderFeeCount: state => state.order.isOrderFeeCount,
			custInfoObj: state => state.order.custInfoObj,
			shipOrderInfoData: (state) => state.order.orderInfoDataObj,
		}),
		isOpcustomsOrOpwh(){
			// 是否是报关操作或者仓储操作
			if(this.specialEditRoles.includes('op_customs') || this.specialEditRoles.includes('op_wh') || this.specialEditRoles.includes('op_truck')){
				return true
			}
			return false
		},
		isManager() {
			return this.roles && this.roles.includes('manager')
		},
		isOpPlanTmp() {
			return this.roles && this.roles.includes('op_plan_tmp')
		},
		viewOpPlan() {
			let list = ['draft', 'close', 'cancel']
			return !list.includes(this.createItem.orderStatus) && (this.isManager || this.isOpPlanTmp)
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
		isCsc() {
			return this.ordDetRole === 'csc'
		},
		isOpTruck() {
			return this.userEditRoles.includes('op_truck')
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd'
		},
		// 新创建的未保存的订单不可复制
		addState() {
			return !this.createItem.ship
		},
		copyState() {
			return this.$route.query.action === 'copy'
		},
		viewState() {
			return this.$route.query.action === 'view' || this.createItem.orderStatus !== 'draft'
		},
		// 箱型箱量统计
		containerTotal() {
			return this.getContainerTotal(this.createItem.soContainerList)
		},
		origContainerTotal() {
			let soContainerList = this.createItem.soContainerList.filter(item => item.isAdd !== 'Y')
			return this.getContainerTotal(soContainerList)
		},
		// 操作编辑保存按钮
		opEditState(){
			return this.createItem.orderStatus === 'pass' || this.createItem.orderStatus === 'break' && this.createItem.finCloseStatus !== 'yes'
		},
		EcsEditState() {
			return this.opEditState
		},
		// 存在协同服务项
		isJoint() {
			return this.createItem.serviceInfoList.some(ele => ele.isJoint === 'y')
		},
		// 操作取消按钮显示
		opCancelBtnShow() {
			return !['CANCEL','BREAK'].includes(this.createItem.cancelJointHandleStatus) && ['pass'].includes(this.createItem.orderStatus) && this.createItem.bkgStatus === 'book_release' && !this.isOrderFeeCount
		},
		// 操作终止按钮显示
		opBreakBtnShow() {
			return !['CANCEL','BREAK'].includes(this.createItem.cancelJointHandleStatus) && ['pass'].includes(this.createItem.orderStatus) && this.createItem.bkgStatus === 'book_release' && this.isOrderFeeCount
		},
		// 散杂滚装
    isBulkRo() {
      return this.createItem.businessType === 'ship_bulk_ro'
		},
		cargoTotal() {
      let quantity = 0
			let weight = 0
			let volume = 0
			let feeWeight = 0
			this.createItem.cargoList.forEach(o => {
        quantity += o.quantity ? Number(o.quantity) : 0
        weight += o.weight ? Number(o.weight) : 0
				volume += o.volume ? Number(o.volume) : 0
				feeWeight += o.feeWeight ? Number(o.feeWeight) : 0
        weight = parseFloat(weight.toFixed(3))
				volume = parseFloat(volume.toFixed(3))
				feeWeight = parseFloat(feeWeight.toFixed(3))
      })
			return {
				quantity: quantity,
				weight: weight,
				volume: volume,
				feeWeight: feeWeight
			}
    }
	},
	components: {
		ComOrderInfo,
		OrderBookInfo,
		TransportInfo,
		SoContainer,
		Cargo,
		Worker,
		CheckPoint,
		ChangeSave,
		AddContainer,
		DropContainer,
		CancelOrder,
		JointService,
		OverseasInfo,
		ProxyCancelApplyPop,
		SaMail
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
		}
	},
	methods: {
		// sa邮件
		saMailClose() {
			this.saMailShow = false
		},
		updateFreeTimeSys(value) {
			// console.log('update', value);
			// 业务自拿，代订舱的不变更免用免堆
			if (this.createItem.ship.priceType === 'bd' || this.createItem.serviceList.includes('proxy_book')) return
			this.$set(this.createItem.ship, 'freetimeSys', value || '')
			this.tempFreeTimeSys = value || ''
		},
		emptyFreeTimeSys() {
			// console.log('val', val);
			// console.log('this.containerTotal.containerArr', this.containerTotal.containerArr)
			// 业务自拿，代订舱的不变更免用免堆
			if (this.createItem.ship.priceType === 'bd' || this.createItem.serviceList.includes('proxy_book')) return
			if (this.containerTotal.containerArr.some(item => ['20FR','20RF','20OT','40FR','40RF','40OT'].includes(item.containerType))) {
				this.$set(this.createItem.ship, 'freetimeSys', '')
			} else if (this.createItem.cargoList.some(item => ['dangerous'].includes(item.property))) {
				this.$set(this.createItem.ship, 'freetimeSys', '')
			} else {
				this.$set(this.createItem.ship, 'freetimeSys', this.tempFreeTimeSys || '')
			}
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
		getContainerTotal(soContainerList) {
			let quantity = 0
			let weight = 0
			let volume = 0
			let containerArr = []
			let mergeArr = []
			let container = ''
			soContainerList.forEach(item => {
				item.containerList.forEach(o => {
					quantity += o.quantity && o.containerNum ? Number(o.quantity) * Number(o.containerNum) : 0
					weight += o.weight && o.containerNum ? Number(o.weight) * Number(o.containerNum) : 0
					volume += o.volume && o.containerNum ? Number(o.volume) * Number(o.containerNum) : 0
					weight = parseFloat(weight.toFixed(3))
					volume = parseFloat(volume.toFixed(3))
					quantity = parseFloat(quantity.toFixed(3))
					containerArr.push({
						containerType: o.containerType ? o.containerType : '',
						containerNum: o.containerNum ? o.containerNum : ''
					})
				})
			})
			// 箱型箱量合计统计把相同的箱型元素的箱量相加合并
			let containerTypeArr = [...new Set(containerArr.map(item => item.containerType))]
			containerTypeArr.forEach(item => {
				let arr = containerArr.filter(keys => keys.containerType === item)
				let sum = arr.reduce((a, b) => Number(a) + Number(b.containerNum), 0)
				mergeArr.push({
					containerType: item,
					containerNum: sum
				})
			})
			mergeArr.forEach((item, index) => {
				const firstText = index > 0 ? '+' : ''
				if (item.containerType || item.containerNum) {
					container += firstText + `${item.containerType} * ${item.containerNum}`
				}
			})
			return {
				quantity: quantity,
				weight: weight,
				volume: volume,
				container: container,
				containerArr: mergeArr
			}
		},
		// 更新委托单位
		updateCust() {
			this.$emit('getInfo')
		},
		updateGetInfo() {
			this.$emit('getInfo')
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
		changeEmployeeId(jobCode, employeeId) {
			this.workAssignTipObj[jobCode].orgEmpId = employeeId
		},
		// 切换起运港、目的港、船公司等刷新相应的pricing、bkg的岗位信息
		updatePricing(fieldName) {
			this.getOrderWork('updatePricing', fieldName)
		},
		// 航线经理列表
		sysLineManagerList() {
			let data = {
				currPage: 1,
				pageSize: 50,
				query: []
			}
			SystemLineManager(data).then(res => {
				let { data } = res
				// 过滤掉空的系统航线
				this.SystemLineManagerList = data.list.filter(item => item.sysLineCode)
			})
		},
		// 业务自拿价获取航线经理
		getSysLineManager() {
			if (this.createItem.ship.sysLineCode && this.createItem.ship.priceType === 'bd') {
				let pricingItem = this.SystemLineManagerList.find(item => item.sysLineCode === this.createItem.ship.sysLineCode)
				console.log('pricingItem', pricingItem)
				this.orderWorkOptions = this.orderWorkOptions.map(item => {
					if (pricingItem && item.jobCode === 'pricing') {
						item.employeeId = pricingItem.managerId
						item.employeeName = pricingItem.managerName
					}
					return { ...item }
				})
			}
		},
		orderStatusFilter(status, action) {
			// 新建或复制的订单状态都初始化为草稿
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
			// 甩柜，取消订单，协同，改船等弹窗默认关闭,目的港国家重置
			this.countryCode = ''
			let workAssignStr = Cookies.get('workAssignShow')
			this.workAssignShow = workAssignStr === '0' ? false : true
			this.activityKey = 'Worker'
			this.submitDisabled = false
			sessionStorage.setItem('serviceCode', '')
			let { action, orderNo } = this.$route.query
			this.state = action === 'add' ? 'valid' : ''
			// console.log('init', tempData)
			this.fillOrderInfo(tempData)
			// this.getOrderInfo()
		},
		// 获取港口countryCode
		getCountryCode(val) {
			this.countryCode = val
		},
		getContainerList() {
			orderContainerList({
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo
			}).then(res => {
				let {data} = res
				this.hasCn = data.some(ele => ele.cn)
			})
		},
		// 获取so
		getBookSo() {
			getBookSoList({
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo
			}).then(res => {
				let soInfo = res.data.soList
				let soStr = ''
				soInfo.map((item, index) => {
					soStr += index ? `,${item.so}` : `${item.so}`
				})
				this.createItem.soStr = soStr
				// console.log('soStr', this.createItem.soStr)
			})
		},
		// 分配工作项
		getOrderWork(type, fieldName) {
			let data = {
				orderNo: this.createItem.orderNo || this.$route.query.orderNo,
				sysLineCode: this.createItem.ship.sysLineCode,
				shipCarrierCode: this.createItem.ship.shipCarrierCode,
				polPortCode: this.createItem.ship.polPortCode
			}
			let { workAssign, jointWorkAssign } = this.createItem
			orderWork(data).then(res => {
				console.log(res.data)
				// 先取obd部门code，再取下单助理部门code最后再取bd部门code
				let findObdItem = res.data.find(item => item.jobCode === 'obd')
				let findAsstItem = res.data.find(item => item.jobCode === 'asst')
				let findBdItem = res.data.find(item => item.jobCode === 'bd')
				let obdDeptCode = findObdItem ? findObdItem.deptCode : ''
				let asstDeptCode = findAsstItem ? findAsstItem.deptCode : ''
				this.bdDeptCode = findBdItem ? findBdItem.deptCode : ''
				this.obdDeptCode = obdDeptCode ? obdDeptCode : asstDeptCode ? asstDeptCode : this.bdDeptCode

				// 在这里获取配置的航线的职员信息
				for (let i in this.workAssignObj) {
					let findItem = res.data.find(item => item.jobCode === i && item.employeeId) || {}
					Object.assign(this.workAssignTipObj[i], findItem)
					this.workAssignTipObj[i].empId = findItem.employeeId || ''
					this.workAssignTipObj[i].empName = findItem.employeeName || ''
				}
				// console.log('this.workAssignTipObj-1111111', this.workAssignTipObj)
				if (workAssign.length) {
					// console.log('this.origPricingEmployeeId', this.workAssignTipObj, this.origBkgEmployeeId)
					this.orderWorkOptions = workAssign.map(item => {
						item.isUpdate = false
						if (item.employeeId == 0) {
							item.employeeName = ''
						}
						// 修改起运港，目的地，系统航线，船公司会重新分配参与人岗位人员。
						if (type === 'updatePricing') {
							let jobObj = this.workAssignTipObj[item.jobCode]
							// console.log('jobObj----2222', jobObj, item.jobCode);
							if (jobObj && jobObj.empId) {
								// 参与人有更新的给出提示
								if (jobObj.orgEmpId && jobObj.orgEmpId !== jobObj.empId) {
									item.isUpdate = true
								}
								item.employeeId = jobObj.empId
								item.employeeName = jobObj.empName
							}
						}
						return Object.assign(item, { show: true })
					})
					this.updatePricingBkgTip(fieldName, this.orderWorkOptions)
				} else {
					if (type === 'updatePricing') {
						// console.log('this.origPricingEmployeeId', this.origPricingEmployeeId, this.origBkgEmployeeId)
						this.orderWorkOptions = this.orderWorkOptions.map(item => {
							item.isUpdate = false
							// 修改目的地，系统航线会重新分配参与人岗位人员。
							let jobObj = this.workAssignTipObj[item.jobCode]
							if (jobObj && jobObj.empId) {
								// 参与人有更新的给出提示
								if (jobObj.orgEmpId && jobObj.orgEmpId !== jobObj.empId) {
									item.isUpdate = true
								}
								item.employeeId = jobObj.empId
								item.employeeName = jobObj.empName
							}
							return { ...item }
						})
						this.updatePricingBkgTip(fieldName, this.orderWorkOptions)
					} else {
						this.orderWorkOptions = res.data.map(item => {
							return Object.assign(item, { show: true })
						})
					}
				}
				// 协同参与人
				if (jointWorkAssign.length) {
					this.jointOrderWorkOptions = jointWorkAssign.map(item => {
						item.isUpdate = false
						if (item.employeeId == 0) {
							item.employeeName = ''
						}
						return Object.assign(item, { show: true })
					})
				} else {
					this.jointOrderWorkOptions = []
				}
				// 上一次选中的参与人，用来跟航线配置的参与人做比对
				for (let i in this.workAssignObj) {
					let findItem = this.orderWorkOptions.find(item => item.jobCode === i)
					let orgEmpId = findItem ? findItem.employeeId : ''
					this.workAssignTipObj[i].orgEmpId = orgEmpId
				}
				// console.log('this.workAssignTipObj-333333333', this.workAssignTipObj);
			})
		},
		// 提示信息
		updatePricingBkgTip(fieldName, data) {
			let name = ''
			let flag = false
			for (let i in this.workAssignObj) {
				if (data.find(item => item.jobCode === i && item.isUpdate)) {
					name += this.workAssignTipObj[i].name + '、'
					flag = true
				}
			}
			console.log('name', name, flag)
			if (flag) {
				this.$message({
					type: 'warning',
					dangerouslyUseHTMLString: true,
					message: `订舱信息中的${fieldName}已被修改，请注意<strong>${name}人员已更新</strong>`
				})
			}
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
		// 再次获取订单详情
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
			// 放舱要求默认即时放舱
			if (data.ship && !data.ship.issueMode) {
				data.ship.issueMode = 'prompt'
			}
			if (data.ship) {
				data.ship.priceType = data.ship.priceType ? data.ship.priceType.toLocaleLowerCase() : ''
			}
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
			console.log('data', data);
			
			Object.assign(this.createItem, data, {
				orderStatus: data.orderStatus,
				payMode: data.payMode || 'prepaid',
				cargoList: data.cargoList && data.cargoList.length ? this.getCargoCustOptions(data.cargoList) : [{ boxRemark: '无' }],
				barge: data.barge ? data.barge : {},
				ship: data.ship
					? data.ship
					: {
							issueMode: 'prompt', // 新建订单设置放舱默认为即刻放舱
							priceType: 'pricing',
							isNodrop: data.isWhiteCust === 'Y' ? 'y' : ''
							// freetimeSys: '无需求'
					  },
				transport: data.transport ? data.transport : this.$route.query.source === 'cargoGmSeaFreight' ? {} : { transportTerm: 'CY/CY' },
				soContainerList:
					data.soContainerList && data.soContainerList.length
						? data.soContainerList
						: [
								{
									isSplit: 'n', // 分开放舱（y分开，n不分开）
									sontainerListShowState: false,
									containerList: [{ containerType: '', isHeavy: '' }]
								}
						  ],
				checkPointList: data.checkPointList,
				workAssign: data.workAssign,
				jointWorkAssign: data.jointWorkAssign || []
			})
			this.bulkRoBkgStatus = data.bkgStatus
			// 代订舱因为没有审核，接口返回的是draft,submit都要处理为pass
			if (serviceList.includes('proxy_book')) {
				if (['draft', 'submit'].includes(data.bkgStatus)) {
					this.bulkRoBkgStatus = 'pass'
				}
			}
			// 获取订舱状态的在订舱状态数组中的索引值
			this.bkgStatusList.map((item, index) => {
				if (item.value === this.bulkRoBkgStatus) {
					this.bkgStatusIndex = index
				}
			})
			// 代订舱的并且data.workAssign参与人没返回商务时，需手动往workAssign数组里塞入商务，服务项切换到订舱时需要填写商务
			if (data.serviceList.includes('proxy_book') && data.workAssign.every(item => item.jobCode !== 'pricing')) {
				let sIndex = ''
				data.workAssign.map((item, index) => {
					if (item.jobCode === 'bkg') {
						sIndex = index
					}
				})
				this.createItem.workAssign.splice(sIndex, 0, { employeeId: '', employeeName: '', jobCode: 'pricing', jobCname: '商务' })
			}
			// 清除校验结果
			this.$nextTick(() => {
				this.$refs['orderSubmit'].clearValidate()
				if (!this.isBulkRo) {
					let containerList = this.$refs['soContainer'].$refs['containerList']
					for (var i = 0; i < containerList.length; i++) {
						containerList[i].clearValidate()
					}
				}
			})
			// 获取服务类型
			this.getBusinessType()
			// 获取服务项下拉
			this.getServiceTypes()
			// 获取集装箱信息
			this.getContainerList()
			// 获取so
			this.getBookSo()
			// 获取参与人
			this.getOrderWork()
			// 获取订舱协助审核人
			this.getJointAuditWork()
			// 获取协同岗位分配
			this.getJointWork()
			// 获取是否包含驳船
			// 新增创建订单，是否包含驳船从url的params获取
			if (!barge && !ship) {
				this.includeFeeder = this.$route.query.includeFeeder
			} else {
				this.includeFeeder = barge ? 'y' : 'n'
			}

			// 获取费用信息
			orderFeeCount({ orderNo: this.$route.query.orderNo }).then(res => {
				this.$store.dispatch('order/setOrderFeeCount', res.data.count > 0)
			})
			// 港口portCode,拼接成字符串，请求后台返回港口下拉数据做各个港口的反显
			if (data.ship) {
				let ship = { ...data.ship }
				let { polPortCode, podPortCode, transitPortCode, transitPortCode1, transitPortCode2, unloadingPortCode, roLoadingPortCode, roArrivalPortCode } = ship
				let porPortCode = data.barge ? data.barge.porPortCode : ''
				let portCodeArr = []
				porPortCode ? portCodeArr.push(porPortCode) : ''
				polPortCode ? portCodeArr.push(polPortCode) : ''
				podPortCode ? portCodeArr.push(podPortCode) : ''
				transitPortCode ? portCodeArr.push(transitPortCode) : ''
				transitPortCode1 ? portCodeArr.push(transitPortCode1) : ''
				transitPortCode2 ? portCodeArr.push(transitPortCode2) : ''
				unloadingPortCode ? portCodeArr.push(unloadingPortCode) : ''
				roLoadingPortCode ? portCodeArr.push(roLoadingPortCode) : ''
				roArrivalPortCode ? portCodeArr.push(roArrivalPortCode) : ''
				this.fillPortCodes = portCodeArr.toString()
				// 获取目的港countryCode，做木质包装显示隐藏
				if (this.createItem.ship.podPortCode) {
					this.$store.dispatch('dict/basePortListByCodes', { portCodes: this.createItem.ship.podPortCode }).then(data => {
						let portItem = data.find(item => item.portCode === this.createItem.ship.podPortCode)
						// console.log(portItem)
						this.countryCode = portItem ? portItem.countryCode : ''
					})
					// 获取系统航线中文名称
					portSystemLineInfo(this.createItem.ship.podPortCode).then(res => {
						let systemLineList = res.data
						if (systemLineList && systemLineList.length) {
							this.sysLineCname = systemLineList[0].cname
							this.createItem.ship.sysLineCode = systemLineList[0].sysLineCode
						}
					})
				}
			}
			// 详情接口返回免用免堆为空的话，调用运价接口获取最新的免用免堆
			if (!this.createItem.ship.freetimeSys) {
				this.handleFillFreetimeSys()
			} else {
				this.updateFreeTimeSys(this.createItem.ship.freetimeSys)
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
		},
		// 获取免用免堆信息
    handleFillFreetimeSys(notIncludeBarge, isRefresh) {
      let { polPortCode, podPortCode, unloadingPortCode, transitPortCode, transitPortCode1, transitPortCode2, sysLineCode, shipCarrierCode, cyCutOff, etdTime } = this.createItem.ship
      let { porPortCode } = this.createItem.barge
      let transitPortCodesArr = []
      transitPortCode ? transitPortCodesArr.push(transitPortCode) : ''
      transitPortCode1 ? transitPortCodesArr.push(transitPortCode1) : ''
      transitPortCode2 ? transitPortCodesArr.push(transitPortCode2) : ''
      // let transitPortCodes = transitPortCodesArr.toString()
      let param = {
        feederPolCode: !notIncludeBarge ? porPortCode : '',
        polCode: polPortCode,
        podCode: podPortCode,
        transitPortCodes: transitPortCodesArr,
        unloadingPortCode,
        sysLineCode,
        shipCarrierCode,
        cyCutOffDate: cyCutOff,
        etdDate: etdTime,
      }
      // 非业务的，业务自拿价，代订舱的不用获取运价的免用免堆
      if (!this.isBd || this.createItem.ship.priceType === 'bd' || this.contractRequired) return
      mainRouteFreeTime(param).then(res => {
				this.updateFreeTimeSys(res.data)
        if (this.containerTotal.containerArr.some(item => ['20FR','20RF','20OT','40FR','40RF','40OT'].includes(item.containerType))) {
					this.updateFreeTimeSys('')
        }
        if (this.createItem.cargoList.some(item => ['dangerous'].includes(item.property))) {
					this.updateFreeTimeSys('')
        }
      })
    },
		// 货物信息发货单位反显
		getCargoCustOptions(cargoList) {
			let result = cargoList.map(item => {
				item.shipperCustid = item.shipperCustid || ''
				let shipperCustidOptions = item.shipperCustid ? [{ label: item.shipperCustName, value: item.shipperCustid }] : []
				return { ...item, shipperCustidOptions }
			})
			console.log('🚀 ~ result', result)
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
			let serviceInfoListStr = sessionStorage.getItem('serviceInfoListStr')
			let serviceInfoList = JSON.parse(serviceInfoListStr)
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
				console.log(this.serviceCodeOptions)

				// 新创建订单默认勾选服务项
				if (!this.createItem.serviceList.length) {
					Object.assign(this.createItem, {
						serviceList: temp
					})
				}
			})
		},

		// 返回订单列表或协同单列表
		handleGoBack() {
			let name = 'OrderList'
			sessionStorage.removeItem('createOrderStr')
			if (this.$route.query.source === 'jointList') {
				name = 'JointList'
			}
			if (this.$route.query.source === 'planOrderList') {
				name = 'PlanOrderList'
			}
			if (this.$route.query.source === 'seaFreight') {
				name = 'SeaFreight'
			}
			if (this.$route.query.source === 'seaFreightDetail') {
				return this.$router.push({
					name: 'SeaFreightDetail',
					query: {
						routeId: this.$route.query.routeId,
						feederRouteId: this.$route.query.feederRouteId
					}
				})
			}
			this.$router.push({
				name
			})
		},
		// 输出计划单
		handleExportPlan() {
			handleExportPlanCommon()
		},
		handleToPlan() {
			let query = this.$route.query
      let routeUrl = this.$router.resolve({
         name: 'opPlanDetail',
         query: {
					 ...query,
					 originRouteName: this.$route.name
				 },
				 params: query.orderNo
       })
       window.open(routeUrl.href, '_blank')
		},
		// 订单完成
		handleFinish() {
			this.submitDisabled = true
			orderFinish({ orderNo: this.$route.query.orderNo })
				.then(res => {
					this.$message({
						type: 'success',
						message: '订单完成成功'
					})
					this.submitDisabled = false
					this.$emit('getInfo')
				})
				.catch(err => {
					setTimeout(() => {
						this.submitDisabled = false
					}, 1000)
				})
		},

		// 做柜后改船
		handleChangeSave() {
			this.changeSavePopShow = true
		},
		// 做柜改船关闭回调
		changeSavePopClose(action, value) {
			this.changeSavePopShow = false
			if (action === 'Confirm') {
				//this.handleCreateOrder(value)
			}
		},

		// 加柜
		handleAddCont() {
			this.addContPopShow = true
		},
		addContPopClose(action, value) {
			this.addContPopShow = false
			if (action === 'Confirm') {
				this.$emit('getInfo')
			}
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
								window.close()
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

		// bd、op发起取消订单关闭回调
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
						})
						this.$emit('getInfo')
					})
				})
				.catch(err => {
					console.log('err')
				})
		},
		// 业务代订舱审核通过的撤回
		handleProxyCancel() {
			// 若该订单已总关账，执行撤回，提示“订单已总关账，不允许撤回”
			if (this.createItem.finCloseStatus === 'yes') {
				return this.$message.error('订单已总关账，不允许撤回')
			}
			this.proxyCancelApplyShow = true
			let findItem = this.orderWorkOptions.find(item => item.jobCode === 'bkg')
			this.bkgEmployeeName = findItem ? findItem.employeeName : ''
		},
		proxyCancelApplyPopClose(action, values) {
			if (action === 'Confirm') {
				proxyCancelApply({
					orderNo: this.$route.query.orderNo,
					cancelRemark: values.cancelRemark
				}).then(res => {
					this.proxyCancelApplyShow = false
					this.$message({
						type: 'success',
						message: '撤回申请成功'
					})
					this.$emit('getInfo')
				})
			} else {
				this.proxyCancelApplyShow = false
			}
		},
		// 业务协同订单
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
						} else {	//	业务发起过取消，操作实际执行终止
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

		// 打开甩柜弹窗
		handleDrop() {
			this.dropContainerPopShow = true
		},
		// 甩柜弹窗关闭回调
		dropContainerPopClose(action) {
			this.dropContainerPopShow = false
			if (action === 'Confirm') {
				this.$emit('getInfo')
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
			let data = this.getOpValues()
			// this.opValidate(data)
			// console.log('操作编辑', data);
			this.$refs['orderSubmit'].validate(valid => {
				// 20220621 加上必填校验
				if (!valid) {
					toViewPosition('ship-cont', 80)
					this.$message.error('请按要求填写数据')
					return
				}
				// if (this.isOp && this.orderInfo.bkgStatus === 'book_release' && !valid) return // 目前只校验了 订单的“订舱状态”变为“已放舱”状态后，操作人员的订单详情里，“截VGM时间”、“截补料时间”、“VGM类型”变为必填
				// 操作编辑加上参与人必填校验：文件、放货、应收财务等
				let arr = []
				let opItem = data.workAssign.find(el => el.jobCode === 'op')
				let docItem = data.workAssign.find(el => el.jobCode === 'doc')
				let rcItem = data.workAssign.find(el => el.jobCode === 'rc')
				let acItem = data.workAssign.find(el => el.jobCode === 'ac')
				let eacItem = data.workAssign.find(el => el.jobCode === 'eac')
				if (opItem && !opItem.employeeId) {
					arr.push('操作')
				}
				if (this.createItem.serviceType === 'st01' && docItem && !docItem.employeeId) {
					arr.push('文件')
				}
				if (rcItem && !rcItem.employeeId) {
					arr.push('放货')
				}
				if (acItem && !acItem.employeeId) {
					arr.push('应收财务')
				}
				// 整箱的海外贷代客户的海外应收财务必填
				if (this.createItem.businessType === 'ship_export_fcl' && this.custInfoObj.custClass === 'FOREIGN_PEER' && eacItem && !eacItem.employeeId) {
					arr.push('海外应收财务')
				}
				if(this.hasDestination){
					let ecsItem = data.workAssign.find(el => el.jobCode === 'ecs')
					let epricingItem = data.workAssign.find(el => el.jobCode === 'epricing')
					if (epricingItem && !epricingItem.employeeId) {
						arr.push('海外商务')
					}
					if (ecsItem && !ecsItem.employeeId) {
						arr.push('海外客服')
					}
				}
				if (arr.length) {
					this.$message.error(`参与人（${arr.join(',')}）不能为空`)
					this.submitDisabled = false
					return
				}
				if (!this.hasDestination) {
					console.log('没有勾选目的港服务项，可不填海外客服参与人和海外商务参与人')
					data.workAssign.map(item => {
						if (['ecs', 'epricing'].includes(item.jobCode)) {
							item.employeeId = 0
						}
						return item
					})
				}
				// op,doc保存
				this.submitDisabled = true
				orderEdit(data)
					.then(res => {
						this.$message({
							type: 'success',
							message: '保存成功',
							duration: 1000,
							onClose: () => {
								this.submitDisabled = false
								if (this.ordDetRole === 'doc') {
									this.$emit('getLeftServiceList')
								} else if (this.ordDetRole === 'csc'){
									let findItem = data.workAssign.find(item => item.jobCode === 'csc')
									let cscEmpId = findItem ? findItem.employeeId : ''
									if (cscEmpId !== this.userId) {
										window.close()
									} else {
										this.$emit('getInfo')
									}
								} else {
									this.$emit('getInfo')
								}
							}
						})
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
				etdTime: this.createItem.ship.etdTime,
				cyCutOff: this.createItem.ship.cyCutOff,
				tdTime: this.createItem.ship.tdTime,
				vessel: this.createItem.ship.vessel,
				voyage: this.createItem.ship.voyage,
				etaTime: this.createItem.ship.etaTime,
        taTime: this.createItem.ship.taTime,
				bargeEtdTime: this.createItem.barge.etdTime,
				bargeTdTime: this.createItem.barge.tdTime,
				workAssign
			}
			if (this.isBulkRo) {
				Object.assign(data, {
					bkgStatus: this.bulkRoBkgStatus
				})
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
		// 切换是否包含驳船费
		handleChangeIncludeFeeder(val) {
			this.includeFeeder = val
			if (val === 'y') {
				if (this.createItem.barge === null) {
					Object.assign(this.createItem, { barge: this.order.orderList.createItem.barge })
				}
			}
		},

		// 合并传参
		getValues() {
			let cargoList = []
			let soContainerList = []
			this.createItem.cargoList.forEach(item => {
				let cargoObj = {}
				Object.assign(cargoObj, {
					shipperCustid: item.shipperCustid,
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
				// 散杂滚装的要多传总件数，总毛重，总体积，总计费吨这几个参数
				if (this.isBulkRo) {
					Object.assign(cargoObj, {
						quantity: item.quantity,
						weight: item.weight,
						volume: item.volume,
						feeWeight: item.feeWeight,
					})
				}
				cargoList.push(cargoObj)
			})
			// soContainerList
			this.createItem.soContainerList.forEach(item => {
				let soObj = {}
				let containerList = []
				item.containerList.forEach(ele => {
					let containerGroup = Math.floor((Math.random() + Math.floor(Math.random() * 9 + 1)) * Math.pow(10, 8))
					let queryObj = {}
					Object.assign(queryObj, {
						containerGroup: ele.containerGroup || containerGroup,
						containerType: ele.containerType,
						containerNum: ele.containerNum,
						quantity: ele.quantity,
						weight: ele.weight,
						volume: ele.volume,
						packageInfo: ele.packageInfo,
						isHeavy: ele.isHeavy,
						boxRemark: ele.boxRemark
					})
					if (ele.containerType.indexOf('RF') !== -1) {
						Object.assign(queryObj, {
							temperatureType: ele.temperatureType,
							temperatureSet: ele.temperatureSet,
							temperatureMin: ele.temperatureMin,
							temperatureMax: ele.temperatureMax,
							airMete: ele.airMete,
							humidity: ele.humidity
						})
					}
					if (ele.containerType.indexOf('OT') !== -1 || ele.containerType.indexOf('FR') !== -1) {
						Object.assign(queryObj, {
							specialLength: ele.specialLength,
							specialWidth: ele.specialWidth,
							specialHeight: ele.specialHeight,
							gangeType: ele.gangeType,
							sizeBefore: ele.sizeBefore,
							sizeAfter: ele.sizeAfter,
							sizeLeft: ele.sizeLeft,
							sizeRight: ele.sizeRight,
							sizeTop: ele.sizeTop
						})
					}
					containerList.push(queryObj)
				})
				Object.assign(soObj, {
					isSplit: item.isSplit,
					soGroup: item.soGroup,
					containerList: containerList
				})
				soContainerList.push(soObj)
			})

			// workAssign
			let orderWorkOptions = []
			// console.log(this.orderWorkOptions)

			// 服务项存在代订舱的清空，不传pricing的employeeId
			if (this.createItem.serviceList.includes('proxy_book')) {
				// orderWorkOptions = this.orderWorkOptions.map(item => {
				// 	let query = { ...item }
				// 	if (query.jobCode === 'pricing') {
				// 		query.employeeId = 0
				// 	}
				// 	return Object.assign({}, query)
				// })
				orderWorkOptions = this.orderWorkOptions.filter(item => item.jobCode !== 'pricing')
			} else {
				orderWorkOptions = [...this.orderWorkOptions]
			}
			let workArr = orderWorkOptions.map(item => {
				return {
					jobCode: item.jobCode,
					employeeId: item.employeeId ? item.employeeId : 0
				}
			})
			// console.log(workArr);
			let saveQuery = {
				orderNo: this.createItem.orderNo,
				serviceType: this.createItem.serviceType,
				intrustRemark: this.createItem.intrustRemark,
				payMode: this.createItem.payMode,
				transitPayMode: this.createItem.transitPayMode,
				serviceList: this.createItem.serviceList,
				barge:
					this.includeFeeder === 'y'
						? {
								porPortCode: this.createItem.barge.porPortCode,
								transitWay: this.createItem.barge.transitWay,
								etdTime: this.createItem.barge.etdTime,
								cyCutOff: this.createItem.barge.cyCutOff
						  }
						: null,
				ship: {
					etdTime: this.createItem.ship.etdTime,
					shipCarrierCode: this.createItem.ship.shipCarrierCode,
					cyCutOff: this.createItem.ship.cyCutOff,
					polPortCode: this.createItem.ship.polPortCode,
					unloadingPortCode: this.createItem.ship.unloadingPortCode || this.createItem.ship.podPortCode,
					podPortCode: this.createItem.ship.podPortCode,
					transitPortCode: this.createItem.ship.transitPortCode,
					transitPortCode1: this.createItem.ship.transitPortCode1,
					transitPortCode2: this.createItem.ship.transitPortCode2,
					transitWay: this.createItem.ship.transitWay,
					contractNo: this.createItem.serviceList.includes('proxy_book') ? this.createItem.ship.contractNo : '',
					contractCompany: this.createItem.serviceList.includes('proxy_book') ? this.createItem.ship.contractCompany : '',
					issueMode: this.createItem.ship.issueMode,
					sysLineCode: this.createItem.ship.sysLineCode,
					freetimeSys: this.createItem.ship.freetimeSys,
					isNodrop: this.createItem.ship.isNodrop,
					blType: this.createItem.ship.blType,
					blMode: this.createItem.ship.blMode,
					ccCutOff: this.createItem.ship.ccCutOff,
					cvCutOff: this.createItem.ship.cvCutOff,
					priceType: this.createItem.serviceList.includes('book') ? this.createItem.ship.priceType : ''
				},
				soContainerList: soContainerList,
				cargoList: cargoList,
				transport: {
					tradeTermsCode: this.createItem.transport.tradeTermsCode,
					transportTerm: this.createItem.transport.transportTerm,
					destinationArea: this.createItem.transport.destinationArea,
					deliveryPlace: this.createItem.transport.deliveryPlace,
					transitPortCode: this.createItem.transport.transitPortCode,
					// overseaAgentSupplierId: this.createItem.transport.overseaAgentSupplierId,
					shipper: this.createItem.transport.shipper,
					consignee: this.createItem.transport.consignee,
					notify1: this.createItem.transport.notify1,
					notify2: this.createItem.transport.notify2,
					notify3: this.createItem.transport.notify3
				},
				workAssign: workArr,
				quotationNumber: this.createItem.quotationNumber,
        schemeNumber: this.createItem.schemeNumber
			}
			// 散杂滚装的保存参数处理
			if (this.isBulkRo) {
				delete saveQuery.soContainerList
			}
			return saveQuery
		},

		// 操作编辑的传参
		getOpValues() {
			let opCargo = this.createItem.cargoList.map(item => {
				let obj = {}
				for (let i in this.opCargoItem) {
					// if (item[i]) obj[i] = item[i]
					obj[i] = item[i]
					if (i === 'shipperCustid') {
						if (!item[i]) obj[i] = 0
					}
				}
				return obj
			})

			let opSoGroup = []
			this.createItem.soContainerList.forEach((item, index) => {
				let obj = {}
				item.containerList.forEach(ele => {
					for (let i in this.opSizeItem) {
						obj[i] = ele[i]
					}
					opSoGroup.push({ soGroup: item.soGroup, ...obj })
				})
			})

			// workAssign
			let workArr = this.orderWorkOptions.map(item => {
				return {
					jobCode: item.jobCode,
					employeeId: item.employeeId ? item.employeeId : 0
				}
			})

			// 截补料时间,截VGM时间,截放行时间，截报关时间截取冒号之前的字符, 格式：yyyy-MM-dd HH
			let { siCutOff, vgmCutOff, ccCutOff, cvCutOff } = this.createItem.ship
			if (siCutOff && siCutOff.indexOf(':') !== -1) {
				siCutOff = siCutOff.substring(13, 0)
			}
			if (vgmCutOff && vgmCutOff.indexOf(':') !== -1) {
				vgmCutOff = vgmCutOff.substring(13, 0)
			}
			if (ccCutOff && ccCutOff.indexOf(':') !== -1) {
				ccCutOff = ccCutOff.substring(13, 0)
			}
			if (cvCutOff && cvCutOff.indexOf(':') !== -1) {
				cvCutOff = cvCutOff.substring(13, 0)
			}
			let editSaveQuery = {
				bkgStatus: this.bulkRoBkgStatus,
				orderNo: this.createItem.orderNo,
				barge:
					this.includeFeeder === 'y'
						? {
								tdTime: this.createItem.barge.tdTime,
								vessel: this.createItem.barge.vessel,
								voyage: this.createItem.barge.voyage,
								cyCutOff: this.createItem.barge.cyCutOff,
								etdTime: this.createItem.barge.etdTime
						  }
						: undefined,
				ship: {
					shipCarrierCode: this.createItem.ship.shipCarrierCode,
					tdTime: this.createItem.ship.tdTime,
					vessel: this.createItem.ship.vessel,
					voyage: this.createItem.ship.voyage,
					blMode: this.createItem.ship.blMode,
					blType: this.createItem.ship.blType,
					siCutOff: siCutOff ? `${siCutOff}:00:00` : '',
					vgmCutOff: vgmCutOff ? `${vgmCutOff}:00:00` : '',
					vgmType: this.createItem.ship.vgmType,
					ccCutOff: ccCutOff ? `${ccCutOff}:00:00` : '',
					cvCutOff: cvCutOff ? `${cvCutOff}:00:00` : '',
					cyCutOff: this.createItem.ship.cyCutOff,
					etdTime: this.createItem.ship.etdTime,
					etaTime: this.createItem.ship.etaTime,
					taTime: this.createItem.ship.taTime,
					taTimeCust: this.createItem.ship.taTimeCust,
					transitPortCode: this.createItem.ship.transitPortCode,
					transitPortCode1: this.createItem.ship.transitPortCode1,
					transitPortCode2: this.createItem.ship.transitPortCode2,
					polPortCode: this.createItem.ship.polPortCode,
					podPortCode: this.createItem.ship.podPortCode,
					sysLineCode: this.createItem.ship.sysLineCode,
					isNodrop: this.createItem.ship.isNodrop,
					isTrack: this.createItem.ship.isTrack,
					roLoadingPortCode: this.createItem.serviceList.includes('internal_trade_barge') ? this.createItem.ship.roLoadingPortCode : '',
					roArrivalPortCode: this.createItem.serviceList.includes('internal_trade_barge') ? this.createItem.ship.roArrivalPortCode : ''
				},
				transport: {
					tradeTermsCode: this.createItem.transport.tradeTermsCode,
					transportTerm: this.createItem.transport.transportTerm,
					destinationArea: this.createItem.transport.destinationArea,
					deliveryPlace: this.createItem.transport.deliveryPlace,
					transitPortCode: this.createItem.transport.transitPortCode,
					// overseaAgentSupplierId: this.createItem.transport.overseaAgentSupplierId,
					shipper: this.createItem.transport.shipper,
					consignee: this.createItem.transport.consignee,
					notify1: this.createItem.transport.notify1,
					notify2: this.createItem.transport.notify2,
					notify3: this.createItem.transport.notify3
				},
				serviceList: this.createItem.serviceList,
				containerInfoList: opSoGroup,
				cargoList: opCargo,
				workAssign: workArr
			}
			// 散杂滚装的传参处理
			if (this.isBulkRo) {
				delete editSaveQuery.containerInfoList
				// 服务项包含内贸驳船
				if (editSaveQuery.serviceList.includes('internal_trade_barge')) {
					// 是否包含驳船
					if (editSaveQuery.barge) {
					} else {
						Object.assign(editSaveQuery, {
							barge: {
								etdTime: this.createItem.barge.etdTime,
								tdTime: this.createItem.barge.tdTime
							}
						})
					}
				}
				// console.log('editSaveQuery.barge', editSaveQuery.barge)
				// console.log('editSaveQuery.ship', editSaveQuery.ship)
			}
			return editSaveQuery
		},

		// 业务保存提交必填校验
		validate(data) {
			if (!data.serviceType) {
				this.$message.error('服务类型必填')
				return false
			}
			if (!data.ship.sysLineCode) {
				this.$message.error('系统航线必填')
				return false
			}
			return true
		},

		// 操作提交验证
		opValidate(data) {
			if (data.cargoList && data.cargoList.length) {
				let itemArr = []
				data.cargoList.map(item => {
					for (let i in this.opCargoItem) {
						if (!item[i]) {
							return this.$message.warning(this.opCargoItem[i] + '为必填')
						}
					}
				})
			}
		},
		// 参与人保存提交时校验
		workAssignValidate(data) {
			let { workAssign } = data
			// console.log('workAssign', workAssign, data)
			// 代订舱服务项不校验商务
			let noVerify = false
			if (data.serviceList.includes('proxy_book')) {
				noVerify = true
			}
			// 草稿订单不校验订舱人员,但是代订舱的要校验订舱人员
			let noBkgVerify = false
			if ((this.createItem.orderStatus === 'draft' || this.createItem.orderStatus === 'refuse') && !data.serviceList.includes('proxy_book')) {
				noBkgVerify = true
			}
			// 草稿订单不校验拖报操作人员
			// let noOpTruckVerify = false
			// if (this.createItem.orderStatus === 'draft' || this.createItem.orderStatus === 'refuse') {
			// 	noOpTruckVerify = true
			// }
			if (this.hasDestination) {
				this.isNotRequiredWorker = ['op_truck','op_customs','op_wh','eac', 'asst', 'obd', 'doc', 'csc', 'line_cs']
			}else{
				this.isNotRequiredWorker = ['op_truck','op_customs','op_wh','eac', 'asst', 'obd', 'doc', 'csc', 'line_cs', 'ecs', 'epricing']
			}
			// 整箱的国外贷代客户，海外应收财务必填
			if (this.createItem.businessType === 'ship_export_fcl' && this.custInfoObj.custClass === 'FOREIGN_PEER') {
				this.isNotRequiredWorker = this.isNotRequiredWorker.filter(item => item !== 'eac')
			}
			// 委托订舱的doc须必填
			if (this.createItem.serviceType === 'st01') {
				this.isNotRequiredWorker = this.isNotRequiredWorker.filter(item => item !== 'doc')
			}
			// 海外应收eac、下单助理、文件、单证人员也不校验
			let employeeIdValid = workAssign.some(
				item =>
					!item.employeeId &&
					!this.isNotRequiredWorker.includes(item.jobCode) &&
					!(noVerify && item.jobCode === 'pricing') &&
					!(!this.hasDestination && item.jobCode === 'ecs') &&
					!(!this.hasDestination && item.jobCode === 'epricing') &&
					// !(noOpTruckVerify && item.jobCode === 'op_truck') &&
					!(noBkgVerify && item.jobCode === 'bkg') &&
					!(item.jobCode === 'tc')
			)
			// 获取参与人职业名称，拼接做非空提示
			let emptyTxtArr = []
			workAssign.map(item => {
				if (
					!item.employeeId &&
					!this.isNotRequiredWorker.includes(item.jobCode) &&
					!(noVerify && item.jobCode === 'pricing') &&
					!(!this.hasDestination && item.jobCode === 'ecs') &&
					!(!this.hasDestination && item.jobCode === 'epricing') &&
					!(noBkgVerify && item.jobCode === 'bkg') &&
					// !(noOpTruckVerify && item.jobCode === 'op_truck') &&
					!(item.jobCode === 'tc')
				) {
					let findItem = this.orderWorkOptions.find(ele => ele.jobCode === item.jobCode)
					findItem.jobCname && emptyTxtArr.push(findItem.jobCname)
				}
			})
			console.log(emptyTxtArr)
			let emptyTxtStr = emptyTxtArr.join('、')
			if (employeeIdValid) {
				this.$message.error(`${emptyTxtStr}参与人不能为空`)
				return false
			}
			return true
		},
		// 温度校验，最高温度不能低于最低温度
		temperatureValidate(data) {
			let result = true
			data.soContainerList.map(item => {
				item.containerList.map(ele => {
					if (ele.temperatureMax && ele.temperatureMin && Number(ele.temperatureMax) <= Number(ele.temperatureMin)) {
						result = false
					}
				})
			})
			return result
		},
		// 箱型箱量是成对的，录入箱型，箱量必须要输入
		cnTypeCnNumValidate(data) {
			let result = true
			data.soContainerList.map(item => {
				item.containerList.map(ele => {
					if (ele.containerType && !ele.containerNum) {
						result = false
					}
				})
			})
			return result
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
				this.$refs['orderSubmit'].validate(valid => {
					if (valid) {
						// 散杂滚装的不用做箱型箱量校验
						if (!this.isBulkRo) {
							let containerList = this.$refs['soContainer'].$refs['containerList'] || []
							for (var i = 0; i < containerList.length; i++) {
								containerList[i].validate(isVaild => {
									if (isVaild) {
									} else {
										this.submitDisabled = false
										canSubmit = false
										toViewPosition('ship-cont', 80)
										console.log('error submit!!')
										return
									}
								})
							}
						}
						if (!this.validate(this.createItem)) {
							this.submitDisabled = false
							canSubmit = false
							return
						}
					} else {
						this.submitDisabled = false
						canSubmit = false
						toViewPosition('ship-cont', 80)
						// console.log('error submit!!')
						return false
					}
				})
				if (!canSubmit) {
					this.$message.error('请按要求填写数据')
				} else {
					// 散杂滚装的不用校验箱型箱量里的温度
					if (!this.isBulkRo) {
						if (!this.temperatureValidate(data)) {
							this.submitDisabled = false
							return this.$message.error('箱型箱量中的最高温度不能低于最低温度')
						}
					}
					
					// 校验参与人
					if (!this.workAssignValidate(data)) {
						return (this.submitDisabled = false)
					}
					if (!data.serviceList.length) {
						this.submitDisabled = false
						return this.$message({ type: 'error', message: '请选择服务项' })
					}
					// 校验特殊字符
			  	if(!this.validateSpeciesStr(data)) {
						this.submitDisabled = false
						return
					}
          if (!this.hasDestination) {
						console.log('没有勾选目的港服务项，可不填海外客服参与人和海外商务参与人')
						data.workAssign.map(item => {
							if (['ecs', 'epricing'].includes(item.jobCode)) {
								item.employeeId = 0
							}
							return item
						})
					}
					// 业务提交
					orderSave(data)
						.then(res => {
							this.$message({
								type: 'success',
								message: '提交成功',
								duration: 1000,
								onClose: () => {
									this.submitDisabled = false
									sessionStorage.removeItem('createOrderStr')
									this.$emit('getInfo')
								}
							})
						})
						.catch(err => {
							setTimeout(() => {
								this.submitDisabled = false
							}, 2000)
						})
				}
			} else {
				// 保存
				data.submitType = 'draft'
				// 整箱的要校验箱型箱量，散杂滚装的不用
				if (!this.isBulkRo) {
					if (!this.cnTypeCnNumValidate(data)) {
						this.submitDisabled = false
						return this.$message.error('请输入箱量')
					}
					if (!this.temperatureValidate(data)) {
						this.submitDisabled = false
						return this.$message.error('箱型箱量中的最高温度不能低于最低温度')
					}
				}
				if (!this.cargoCnCharValidate(data)) {
					this.submitDisabled = false
					return
				}
				// 校验特殊字符
				if(!this.validateSpeciesStr(data)) {
           this.submitDisabled = false
					 return
				}
				orderSave(data)
					.then(res => {
						this.$message({
							type: 'success',
							message: '保存成功',
							duration: 1000,
							onClose: () => {
								this.submitDisabled = false
								sessionStorage.removeItem('createOrderStr')
								this.$emit('getInfo')
							}
						})
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
		}
	}
}
</script>
<style lang="scss">
@import '../less/index.scss';
.bdRemark-loading {
	.el-loading-spinner {
		margin-top: -10px;
		.el-icon-loading {
			font-size: 16px;
		}
	}
}
.export-dropdown {
	margin: 0 2px;
}
</style>
