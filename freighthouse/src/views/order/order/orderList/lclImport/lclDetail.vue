<template>
	<div>
		<div class="edit-container">
			<ComOrderInfo
				ref="first"
				id="comOrderInfo"
				:createItem="createItem"
				:orderStatus="createItem.orderStatus"
				:businessTypeOptions="businessTypeOptions"
				:serviceTypeOptions="serviceTypeOptions"
				:serviceCodeOptions="serviceCodeOptions"
				@getHeight="getShipInfoHeight"
				@changeServiceType="handleChangeServiceType"
				@updateCust="updateCust"
			>
				<div class="operateBtn-group">
					<div class="btn-groups">
						<template v-if="orderInfoDataObj.bdManageEmployeeId === userId && createItem.orderStatus === 'pre_submit'">
							<!-- 当前用户是业务主管，并且订单状态是待业务主管审核 -->
							<el-button size="mini" type="primary" @click="handleSubmit" :disabled="submitDisabled">通过</el-button>
							<el-button size="mini" type="danger" @click="bdManageRefusePopShow = true" style="margin-left: 10px">拒绝</el-button>
						</template>
						<template v-else>
							<template v-if="$route.query.source !== 'jointList'">
								<!-- 业务/散货操作 -->
								<template v-if="isBd">
									<el-button size="mini" type="primary" @click="handleSave" :disabled="submitDisabled" v-if="['draft', 'refuse'].includes(createItem.orderStatus) || !viewState">保存</el-button>
									<el-button size="mini" type="primary" @click="handleSubmit" :disabled="submitDisabled" v-if="['draft', 'refuse'].includes(createItem.orderStatus) || !viewState">提交</el-button>
									<el-button size="mini" type="danger" class="" @click="handleCancelRequest" :disabled="submitDisabled" v-if="createItem.orderStatus === 'pass' && createItem.cancelApplyStatus !== 'applied'">{{
										isOrderFeeCount ? '终止' : '取消'
									}}</el-button>
									<el-button
										size="mini"
										type="default"
										class="submitCancel"
										@click="handleCancelCancel"
										:disabled="submitDisabled"
										v-if="createItem.cancelApplyStatus === 'applied' && createItem.orderStatus !== 'break' && createItem.orderStatus !== 'cancel'"
										>{{ isOrderFeeCount ? '撤回终止' : '撤回取消' }}</el-button
									>
									<el-button size="mini" type="danger" @click="handleDelete" :disabled="submitDisabled" v-if="createItem.orderStatus === 'draft'">删除</el-button>
									<el-button size="mini" type="default" class="submitCancel" @click="handleSubmitCancel" :disabled="submitDisabled" v-if="createItem.orderStatus === 'submit'">撤回</el-button>
									<!-- 代订舱的审核通过的 -->
									<el-button
										size="mini"
										type="default"
										class="submitCancel"
										@click="handleProxyCancel"
										:disabled="submitDisabled"
										v-if="createItem.orderStatus === 'pass' && createItem.serviceList.includes('proxy_whbook') && createItem.submitCancelStatus !== 'APPLIED'"
										>撤回</el-button
									>
									<el-button size="mini" type="default" class="" @click="handleCopy" :disabled="submitDisabled" v-if="!addState">复制</el-button>
									<template v-if="isOrderFeeCount">
										<el-button size="mini" type="danger" class="" @click="handleBreak" :disabled="submitDisabled" v-if="createItem.orderStatus === 'refuse'">终止</el-button>
									</template>
									<el-button size="mini" type="default" @click="handleClose" :disabled="submitDisabled" v-else-if="createItem.orderStatus === 'refuse'">关闭</el-button>
								</template>
								<template v-if="(isDoc || isOp) && hasDestinationServices">
									<el-button size="mini" type="primary" class="" @click="saMailShow = true" v-if="['pass'].includes(createItem.orderStatus)" :disabled="submitDisabled">发送SA</el-button>
								</template>
								<!-- 散货操作 -->
								<template v-if="isOp">
									<el-button size="mini" type="primary" class="" @click="handleEdit" v-if="opEditState" :disabled="submitDisabled">保存</el-button>
									<!-- <el-button size="mini" type="primary" class="" @click="handleChange" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus) && !$route.query.jointNo">修改</el-button> -->
									<!-- <el-button size="mini" type="success" class="" @click="handleFinish" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus)">完成</el-button> -->
									<el-button
										size="mini"
										type="danger"
										class=""
										@click="handleOpCancelRequest('break')"
										:disabled="submitDisabled"
										v-if="['pass'].includes(createItem.orderStatus) && isOrderFeeCount && !['CANCEL', 'BREAK'].includes(createItem.cancelJointHandleStatus)"
										>终止</el-button
									>
									<el-button
										size="mini"
										type="danger"
										class=""
										@click="handleOpCancelRequest('cancel')"
										:disabled="submitDisabled"
										v-if="['pass'].includes(createItem.orderStatus) && !isOrderFeeCount && !['CANCEL', 'BREAK'].includes(createItem.cancelJointHandleStatus)"
										>取消</el-button
									>
									<!-- <el-button size="mini" type="default" class="" @click="handleJointService" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus)">协同</el-button> -->
								</template>
								<template v-if="isOp || isOpcustomsOrOpwh">
									<el-button size="mini" type="default" class="" @click="handleJointService" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus)">协同</el-button>
								</template>
								<template v-if="isDoc">
									<el-button size="mini" type="primary" class="" @click="handleEdit" v-if="['pass'].includes(createItem.orderStatus)" :disabled="submitDisabled">保存</el-button>
								</template>
								<!-- 散货操作 -->
								<template v-if="isOpTruck">
									<el-button size="mini" type="primary" class="" @click="handleEdit" v-if="['pass'].includes(createItem.orderStatus)" :disabled="submitDisabled">保存</el-button>
								</template>
								<template v-if="(isEcs || isEpricing) && !isOp">
									<el-button size="mini" type="primary" class="" @click="handleEdit" v-if="EcsEditState" :disabled="submitDisabled">保存</el-button>
								</template>
							</template>
							<template v-if="$route.query.source === 'jointList'">
								<template v-if="isOpTruck || isOp">
									<el-button size="mini" type="primary" class="" @click="handleJointEditSave" v-if="['pass'].includes(createItem.orderStatus)" :disabled="submitDisabled">保存</el-button>
								</template>
								<template v-if="(isEcs || isEpricing) && !isOp">
									<el-button size="mini" type="primary" class="" @click="handleJointEditSave" v-if="EcsEditState" :disabled="submitDisabled">保存</el-button>
								</template>
							</template>
							<template>
								<el-button size="mini" type="primary" @click="handleExportPlan">输出计划单</el-button>
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
							:class="
								createItem.orderStatus === 'complete' || createItem.orderStatus === 'pass'
									? 'green'
									: createItem.orderStatus === 'submit' || createItem.orderStatus === 'pre_submit'
									? 'yellow'
									: ['refuse', 'cancel', 'break'].includes(createItem.orderStatus)
									? 'red'
									: 'black'
							"
						>
							<i></i>{{ orderStatusFilter(createItem.orderStatus, $route.query.action) }}
						</span>
						<span class="label ml10">关账状态:</span>
						<span class="value" :class="finCloseStatusCn === '已关账' ? 'green' : finCloseStatusCn === '预关账' ? 'blue' : 'black'"><i></i>{{ finCloseStatusCn }}</span>
					</div>
				</div>
			</ComOrderInfo>
			<div v-if="isOp && createItem.serviceType === 'st11'" class="lcl-bkg-status">
				<span class="status-title">订舱状态:</span>
				<el-radio-group v-model="whBookStatus" :disabled="!['pass'].includes(createItem.orderStatus)">
					<el-radio :label="item.value" v-for="item in bkgStatusList" :key="item.value">{{ item.label }}</el-radio>
				</el-radio-group>
			</div>

			<div class="order-cont">
				<el-form ref="orderSubmit" :model="createItem" :rules="rules" :show-message="false" class="order-cont-form lcl-form">
					<!-- 基本信息 -->
					<div class="ship-cont" ref="shipInfoCont" :class="workAssignShow ? 'abs-toogle' : ''" :style="{ height: `${shipInfoHeight}px` }">
						<div class="toggleWorkAssign" @click="toggleWorkAssign">
							<i class="hamburger el-icon-arrow-right" :class="{ 'is-active': true }"></i>
						</div>
						<h1 class="orderInfo-h1">基本信息</h1>
						<OrderBookInfo
							@change="handleChangeIncludeFeeder"
							:includeFeeder="includeFeeder"
							:whAgentSupplierName="whAgentSupplierName"
							:hasPodCode="hasPodCode"
							:createItem="createItem"
							:fillPolData="fillPolData"
							:fillPortCodes="fillPortCodes"
							:sysLineCname="sysLineCname"
							:orderStatus="createItem.orderStatus"
							:whBookStatus="whBookStatus"
							ref="orderBookInfo"
							@getCountryCode="getCountryCode"
							@saveRemark="handleSaveRemark"
						/>
						<OverseasInfo
							:isEpricing="isEpricing"
							:isEcs="isEcs"
							@setQuoteList="setQuoteList"
							:quoteList="quoteList"
							:createItem="createItem"
							:businessType="createItem.businessType"
							:bdId="bdId"
							:polCode="createItem.ship.polPortCode"
							:podCode="createItem.ship.unloadingPortCode"
							@updateGetInfo="updateGetInfo"
							:orderStatus="createItem.orderStatus"
						/>
						<!-- 货物信息 -->
						<div class="row-cont" style="margin-top: 0px">
							<div class="row-cont-tit">
								<span class="tit"
									>货物信息
									<em class="redTip" v-if="isSameCode && createItem.orderStatus === 'draft'">(*为必填，必填项未填写则会被忽略)</em>
								</span>
							</div>
							<LclDepCargo :lclDepCargoList="lclDepCargoList" :orderStatus="createItem.orderStatus" :countryCode="countryCode" ref="lclDepCargo" v-if="isSameCode" />
							<Cargo :createItem="createItem" :orderStatus="createItem.orderStatus" :countryCode="countryCode" ref="cargo" v-else />
						</div>
						<!-- 物流信息 -->
						<div class="row-cont" style="margin-top: 8px">
							<div class="row-cont-tit">
								<span class="tit">物流信息</span>
							</div>
							<TransportInfo :createItem="createItem" :orderStatus="createItem.orderStatus" :isSameCode="isSameCode" ref="transport" />
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
							:importDeptCode="importDeptCode"
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
				<CancelOrder @close="cancelRequestPopClose" :orderNo="$route.query.orderNo" :cancelType="cancelType" :isBd="isBd" :isOp="isOp" :isOrderFeeCount="isOrderFeeCount" />
			</div>
			<!-- 协同订单弹窗 -->
			<div v-if="jointServicePopShow">
				<JointService @close="jointServicePopClose" :createItem="createItem" />
			</div>
			<!-- 修改订单弹窗 -->
			<div v-if="changePopShow">
				<Change @close="changePopClose" :createItem="createItem" :countryCode="countryCode" />
			</div>
			<!-- 拒绝弹窗 -->
			<div v-if="bdManageRefusePopShow">
				<RefuseBdManageDialog @close="bdManageRefusePopClose" />
			</div>
			<!-- 代订舱撤回 -->
			<div v-if="proxyCancelApplyShow">
				<ProxyCancelApplyPop @close="proxyCancelApplyPopClose" :bkgEmployeeName="bkgEmployeeName" />
			</div>
			<div v-if="saMailShow">
				<SaMail @close="saMailClose"></SaMail>
			</div>
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import Cookies from 'js-cookie'
import { getDictLabel } from '@/utils/tools'
import { toViewPosition } from '@/utils/scroll-to.js'
import { handleExportPlanCommon } from '@/utils/orderCommonMethod'
import ComOrderInfo from './components/comOrderInfo'
import OrderBookInfo from './components/orderBookInfo'
import TransportInfo from '../components/transportInfo'
import Cargo from './components/cargo'
import LclDepCargo from './components/lclDepCargo'
import Worker from '../components/workerJoint'
import CheckPoint from '../components/checkPoint'
import Change from '../lcl/components/change'
import CancelOrder from '@/views/order/order/orderList/components/cancelOrder'
import JointService from '@/views/order/order/orderList/components/jointService'
import { baseBusinessList, baseBusinessServiceList, portSystemLineInfo } from '@/api/base'
import RefuseBdManageDialog from '@/views/airTransport/order/orderList/components/refuseBdManageDialog'
import OverseasInfo from '../components/overseasInfo'
import ProxyCancelApplyPop from '../components/proxyCancelApplyPop'
import {
	orderInfo,
	orderJointInfo,
	lclImportSave,
	lclImportEdit,
	orderWork,
	orderCancelHandle,
	orderCopy,
	orderFinish,
	orderClose,
	orderDelete,
	orderSubmitCancel,
	lclJointAuditWork,
	jointWork,
	getValueByKey,
	orderCancelCancel,
	planExportReview,
	lclInfo,
	orderStatusChangeBreak,
	importsDeptcode,
	orderJointSave,
	proxyCancelApply,
	mainRemarkUpdate
} from '@/api/order/list'
import { orderFeeCount } from '@/api/fin/fee'
import SaMail from '@/views/order/order/orderList/components/saMail'
import { orderConfigString } from '@/api/order/contract'

export default {
	filters: {
		cargoSourceFilter(cargoSource) {
			return getDictLabel('cargoSource', cargoSource)
		}
	},
	data() {
		return {
			isUsa: false,
			quoteList: [],
			includeFeeder: '',
			saMailShow: '',
			bdManageRefusePopShow: false,
			whBookStatus: '',
			whAgentSupplierName: '',
			hasPodCode: false,
			polServiceList: ['book', 'proxy_book', 'vgm', 'dangerous', 'truck', 'pol_ltl', 'pol_declaration', 'pol_inspection', 'pol_warehouse', 'stuffing', 'doc', 'insurance', 'fume', 'bv', 'ciq', 'coc_saso', 'ocean_manifest'],
			podServiceList: ['pod_ltl_delivery', 'pod_change_doc', 'pod_comm_clearance', 'pod_fcl_delivery', 'pod_warehouse', 'pod_wh_matter', 'pod_ltl_delivery'],

			bkgStatusList: [
				{ label: '未订舱', value: 'to_book', en: 'to_book' },
				{ label: '已订舱', value: 'booked', en: 'booked' }
			],
			state: '',
			oQuery: this.$route.query,
			workAssignShow: false,
			countryCode: '',
			shipInfoHeight: 0, // 基本信息高度
			checkPointHeight: 0, // 关键点高度
			createItem: Object.assign(
				{ ...this.$store.state.order.orderList.createItem },
				{
					quantity: '',
					weight: '',
					volume: '',
					whCyCutOff: '',
					etWhCyCutOff: ''
				}
			),
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
			// 取消订单弹窗
			cancelOrderPopShow: false,
			cancelType: '',
			// 协同订单弹窗
			jointServicePopShow: false,
			// 修改订单弹窗
			changePopShow: false,
			// 港口反显数据
			fillPolData: {},
			orderWorkOptions: [],
			jointOrderWorkOptions: [],
			fillPortCodes: '',
			submitDisabled: false,
			serviceTypeOptions: [], // 服务类型下拉
			serviceCodeOptions: [], // 服务项下拉
			docService: ['doc', 'insurance', 'pod_ltl_delivery', 'pod_change_doc', 'pod_comm_clearance', 'pod_fcl_delivery', 'pod_warehouse', 'pod_wh_matter', 'pod_ltl_delivery'],
			businessTypeOptions: [], // 业务类型数组
			sysLineCname: '', // 系统航线中文名称
			jointAuditWorkData: {},
			jointWorkData: [],
			finCloseStatusCn: '',
			obdDeptCode: '', // obd部门code
			bdDeptCode: '',
			isSameCode: false, // 是否散货部门
			lclDepCargoList: [], // 散货部门下单的货物信息数组
			isNotRequiredWorker: ['op_truck', 'op_customs', 'op_wh', 'eac', 'asst', 'obd', 'doc', 'csc', 'line_cs', 'tc', 'epricing', 'ecs'], // 非必填参与人
			importDeptCode: null, // 进口部deptCode
			proxyCancelApplyShow: false, // 代订舱订单的撤回弹窗
			mainServiceList: [] // 原单服务项
		}
	},
	created() {
		this.init(this.orderInfo)
		this.getDeptCode()
		this.getUsaData()
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
		...mapState('user', ['deptCode']),
		...mapState({
			dictMap: state => state.dict.dictMap,
			ordDetRole: state => state.order.orderList.ordDetRole,
			userId: state => state.user.userId,
			order: state => state.order,
			finance: state => state.finance,
			orderList: state => state.order.orderList,
			speciesStrArr: state => state.order.speciesStrArr,
			specialEditRoles: state => state.order.orderList.specialEditRoles,
			orderInfoDataObj: state => state.order.orderInfoDataObj,
			isOrderFeeCount: state => state.order.isOrderFeeCount,
			shipOrderInfoData: state => state.order.orderInfoDataObj,
			caclShipInfoHeightSwitch: state => state.order.caclShipInfoHeightSwitch
		}),
		hasDestinationServices() {
			// 是否要做目的港服务项
			if (
				this.shipOrderInfoData.serviceList.includes('pod_change_doc') ||
				this.shipOrderInfoData.serviceList.includes('pod_ltl_delivery') ||
				this.shipOrderInfoData.serviceList.includes('pod_fcl_delivery') ||
				this.shipOrderInfoData.serviceList.includes('pod_comm_clearance') ||
				this.shipOrderInfoData.serviceList.includes('pod_warehouse')
			) {
				return true
			}
			return false
		},
		isOpcustomsOrOpwh() {
			// 是否是报关操作或者仓储操作
			if (this.specialEditRoles.includes('op_customs') || this.specialEditRoles.includes('op_wh') || this.specialEditRoles.includes('op_truck')) {
				return true
			}
			return false
		},
		EcsEditState() {
			return this.opEditState
		},
		isEpricing() {
			return this.ordDetRole === 'epricing'
		},
		isEcs() {
			return this.ordDetRole === 'ecs'
		},
		bdId() {
			let { workAssign } = this.createItem
			let bdItem = workAssign && workAssign.find(el => el.jobCode === 'bd')
			if (bdItem && bdItem.employeeId) {
				return bdItem.employeeId
			}
			return ''
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
		isOpTruck() {
			return this.ordDetRole === 'op_truck'
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'asst'
		},
		addState() {
			return !this.createItem.ship
		},
		copyState() {
			return this.$route.query.action === 'copy'
		},
		viewState() {
			return this.$route.query.action === 'view' || this.createItem.orderStatus !== 'draft'
		},
		// 操作编辑保存按钮
		opEditState() {
			// 放开已关账、已完成的限制
			// this.createItem.orderStatus === 'pass' || (this.createItem.orderStatus === 'break' && this.createItem.finCloseStatus !== 'yes')
			return this.createItem.orderStatus === 'pass' || this.createItem.orderStatus === 'break'
		},
		// 存在协同服务项
		isJoint() {
			return this.createItem.serviceInfoList.some(ele => ele.isJoint === 'y')
		},
		// 操作取消按钮显示
		opCancelBtnShow() {
			return ['pass'].includes(this.createItem.orderStatus) && !this.isOrderFeeCount && !['CANCEL', 'BREAK'].includes(this.createItem.cancelJointHandleStatus)
		},
		// 操作终止按钮显示
		opBreakBtnShow() {
			return ['pass'].includes(this.createItem.orderStatus) && this.isOrderFeeCount && !['CANCEL', 'BREAK'].includes(this.createItem.cancelJointHandleStatus)
		}
	},
	components: {
		ComOrderInfo,
		OrderBookInfo,
		TransportInfo,
		Cargo,
		LclDepCargo,
		Worker,
		CheckPoint,
		CancelOrder,
		Change,
		JointService,
		RefuseBdManageDialog,
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
		},
		caclShipInfoHeightSwitch() {
			this.getShipInfoHeight()
		}
	},
	methods: {
		getUsaData() {
			orderConfigString({ key: 'usa_company_code' }).then(res => {
				if (res.code === 0) {
					this.isUsa = res.data.includes(this.orderInfo.compDeptCode)
				} else {
					this.isUsa = false
				}
			})
		},
		setQuoteList(val) {
			this.quoteList = val
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
		// sa邮件
		saMailClose() {
			this.saMailShow = false
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
		updateGetInfo() {
			this.$emit('getInfo')
		},
		bdManageRefusePopClose(action) {
			if (action === 'Confirm') {
				this.$emit('getInfo')
			}
			this.bdManageRefusePopShow = false
		},
		getLclInfo() {
			lclInfo({ orderNo: this.$route.query.orderNo }).then(res => {
				if (res.data) {
					this.whBookStatus = res.data.lcl ? res.data.lcl.whBookStatus : ''
					this.whAgentSupplierName = res.data.lcl ? res.data.lcl.whAgentSupplierName : ''
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
		//查询散货部门CODE
		getDeptCode() {
			getValueByKey('lcl_company_code').then(res => {
				// 登录用户的deptCode以散货部门code为开头的判断为散货部门
				if (res.data.startsWith(this.deptCode)) {
					this.isSameCode = true
				} else {
					this.isSameCode = false
				}
			})
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
		// 选择服务项含有订舱，待订舱
		handleChangeServiceType(val, list) {
			console.log('checkedServiceCode', val, list)
			this.hasPodCode = list.some(item => this.podServiceList.includes(item.serviceCode))
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
			this.getLclInfo()
			// 进口协同单详情获取原单服务项
			if (this.$route.query.source === 'jointList') {
				this.getMainOrderInfo()
			}
		},
		getMainOrderInfo() {
			orderInfo({
				orderNo: this.$route.query.orderNo
			}).then(res => {
				this.mainServiceList = res.data.serviceList
			})
		},
		// 获取港口countryCode
		getCountryCode(val) {
			this.countryCode = val
		},
		// 分配工作项
		getOrderWork() {
			let data = {
				orderNo: this.createItem.orderNo || this.$route.query.orderNo,
				sysLineCode: this.createItem.ship.sysLineCode
			}
			let { workAssign, jointWorkAssign } = this.createItem
			orderWork(data).then(res => {
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
				if (workAssign.length) {
					this.orderWorkOptions = workAssign.map(item => {
						if (item.employeeId == 0) {
							item.employeeName = ''
						}
						return Object.assign(item, { show: true })
					})
				} else {
					this.orderWorkOptions = res.data.map(item => {
						return Object.assign(item, { show: true })
					})
				}
				// 协同参与人
				if (jointWorkAssign.length) {
					this.jointOrderWorkOptions = jointWorkAssign.map(item => {
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
			lclJointAuditWork({
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
		fillOrderInfo(data, type) {
			this.quoteList = data.quoteList || []
			let { barge, custid, custName, custIntrustNo, businessType, serviceType, serviceList, serviceInfoList, finCloseStatus, prefinCloseStatus, ship } = data
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
				cargoList: data.cargoList && data.cargoList.length ? data.cargoList : [{}],
				barge: data.barge ? data.barge : {},
				ship: data.ship ? { ...this.createItem.ship, ...data.ship } : {},
				transport: data.transport ? data.transport : {},
				checkPointList: data.checkPointList,
				workAssign: data.workAssign,
				jointWorkAssign: data.jointWorkAssign || [],
				quantity: data.quantity !== null ? data.quantity : '',
				weight: data.weight !== null ? data.weight : '',
				volume: data.volume !== null ? data.volume : '',
				etWhCyCutOff: data.etWhCyCutOff ? data.etWhCyCutOff : '',
				whCyCutOff: data.whCyCutOff ? data.whCyCutOff : ''
			})
			// 散货部门下单的货物信息数组,传入Cargo组件。因为散货部门的货物信息只要必填图标，但不校验
			this.lclDepCargoList = data.cargoList && data.cargoList.length ? data.cargoList : [{}]
			// 代订舱的并且data.workAssign参与人没返回商务时，需手动往workAssign数组里塞入商务，服务项切换到订舱时需要填写商务
			if (data.serviceList.includes('proxy_whbook') && data.workAssign.every(item => item.jobCode !== 'pricing')) {
				let sIndex = ''
				data.workAssign.map((item, index) => {
					if (item.jobCode === 'op') {
						sIndex = index
					}
				})
				this.createItem.workAssign.splice(sIndex, 0, { employeeId: '', employeeName: '', jobCode: 'pricing', jobCname: '商务' })
			}
			// 清除校验结果
			this.$nextTick(() => {
				this.$refs['orderSubmit'].clearValidate()
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
			// 新增创建订单，是否包含驳船从url的params获取
			if (!barge && !ship) {
				this.includeFeeder = this.$route.query.includeFeeder
			} else {
				this.includeFeeder = barge ? 'y' : 'n'
			}
			// 获取进口部门code
			if (['ship_import_fcl', 'ship_import_lcl'].includes(businessType)) {
				this.getImportsDeptcode()
			}
			// 获取费用信息
			orderFeeCount({ orderNo: this.$route.query.orderNo }).then(res => {
				this.$store.dispatch('order/setOrderFeeCount', res.data.count > 0)
			})
			// 港口portCode,拼接成字符串，请求后台返回港口下拉数据做各个港口的反显
			if (data.ship) {
				let ship = { ...this.createItem.ship, ...data.ship }
				// console.log('ship', this.orderInfo)
				let portCodeArr = []
				let { polPortCode, unloadingPortCode, podPortCode } = ship
				let porPortCode = data.barge ? data.barge.porPortCode : ''
				polPortCode ? portCodeArr.push(polPortCode) : ''
				unloadingPortCode ? portCodeArr.push(unloadingPortCode) : ''
				podPortCode ? portCodeArr.push(podPortCode) : ''
				porPortCode ? portCodeArr.push(porPortCode) : ''
				this.fillPortCodes = portCodeArr.toString()
				// 获取目的港countryCode，做木质包装显示隐藏
				if (this.createItem.ship.polPortCode) {
					let polPortCode = this.createItem.ship.polPortCode
					this.$store.dispatch('dict/basePortListByCodes', { portCodes: polPortCode }).then(data => {
						let portItem = data.find(item => item.portCode === polPortCode)
						// console.log(portItem)
						this.countryCode = portItem ? portItem.countryCode : ''
					})
					// 获取系统航线中文名称
					portSystemLineInfo(polPortCode).then(res => {
						let systemLineList = res.data
						if (systemLineList && systemLineList.length) {
							this.sysLineCname = systemLineList[0].cname
							if (!this.createItem.ship.sysLineCode) {
								this.createItem.ship.sysLineCode = systemLineList[0].sysLineCode
							}
						}
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
		},
		// 获取进口部门code
		getImportsDeptcode() {
			importsDeptcode({ orderNo: this.$route.query.orderNo }).then(res => {
				this.importDeptCode = res.data
			})
		},
		// 获取服务类型下拉
		getBusinessType() {
			baseBusinessList().then(res => {
				let { data } = res
				this.businessTypeOptions = data
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
					// op操作角色的服务项处理:订舱、代订舱，已完成的服务项不可勾选
					if (this.isOp) {
						if (item.serviceCode === 'whbook' || item.serviceCode === 'proxy_whbook' || isFinishedArr.includes(item.serviceCode)) {
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
				// 前端屏蔽掉装箱服务项
				this.serviceCodeOptions = data.filter(item => item.serviceCode !== 'stuffing')

				// 新创建订单默认勾选服务项
				if (this.$route.query.action === 'add' && !this.createItem.serviceList.length) {
					Object.assign(this.createItem, {
						serviceList: temp
					})
				}
			})
		},

		// 返回
		handleGoBack(routeName) {
			let name = 'OrderList'
			sessionStorage.removeItem('createOrderStr')
			if (this.$route.query.source === 'jointList') {
				name = 'JointList'
			}
			if (this.$route.query.source === 'planOrderList') {
				name = 'PlanOrderList'
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
					this.submitDisabled = false
					this.$emit('getInfo')
					this.$message({
						type: 'success',
						message: '订单完成成功'
						// duration: 1000,
						// onClose: () => {
						//   this.submitDisabled = false
						//   this.$emit("getInfo")
						// }
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
								// this.$router.push({
								// 	name: 'OrderList'
								// })
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
								// let path = this.$route.query.source
								// this.$store.dispatch('tagsView/delView', this.$route)
								// this.$router.push({
								// 	name: 'OrderList'
								// })
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
			// 业务未发起取消,操作取消订单时先显示取消原因弹窗
			if (this.createItem.cancelApplyStatus !== 'applied') {
				if (cancelType === 'cancel') {
					msg = '是否已跟业务确认？该订单是否已产生费用，如已产生请去录入相关费用后再取消。'
					if (this.isJoint) {
						msg = '存在协同单，需协同单确认是否要取消协同，是否确定要发起取消？'
					}
				}
				this.$confirm(msg, '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				})
					.then(() => {
						this.cancelOrderPopShow = true
					})
					.catch(err => {})
			} else {
				// 业务有发起取消的，按之前的流程op去执行取消/终止订单
				this.handleCancel(cancelType)
			}
		},
		// 操作取消订单
		handleCancel(cancelType) {
			let msg = '该订单是否已产生费用，如已产生请去录入相关费用后再取消。'
			// 取消
			if (cancelType === 'cancel') {
				if (this.isJoint) {
					msg = '存在协同单，需协同单确认是否要取消协同，是否确定要发起取消？'
				}
				this.$confirm(msg, '是否取消该订单?', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				})
					.then(() => {
						return orderCancelHandle({ orderNo: this.$route.query.orderNo, cancelType: cancelType })
					})
					.then(response => {
						this.$emit('getInfo')
						this.$message({ message: '取消成功', type: 'success' })
					})
					.catch(err => {})
			}
			// 终止
			if (cancelType === 'break') {
				this.$confirm('是否终止该订单', '确认?', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				})
					.then(() => {
						return orderCancelHandle({ orderNo: this.$route.query.orderNo, cancelType: cancelType })
					})
					.then(response => {
						this.$emit('getInfo')
						this.$message({ message: '终止成功', type: 'success' })
					})
					.catch(err => {})
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
							orderNo: orderNo
						},
						query: Object.assign(
							{ ...this.$route.query },
							{
								orderNo,
								action: 'copy'
							}
						)
					})
					// this.$router.push({
					// 	name: 'OrderDetail',
					// 	params: {
					// 		orderNo: orderNo
					// 	},
					// 	query: Object.assign(
					// 		{ ...this.$route.query },
					// 		{
					// 			orderNo,
					// 			action: 'copy'
					// 		}
					// 	)
					// })
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
		// op修改散货订单
		handleChange() {
			this.changePopShow = true
		},
		changePopClose(action) {
			this.changePopShow = false
			if (action === 'Confirm') {
				this.$emit('getInfo')
			}
		},
		// 提交
		handleSubmit() {
			this.handleSave('Submit')
		},

		// 操作编辑保存传参对象
		getEditValues() {
			let cargoList = []
			// 用户是散货部门的cargoList未填写的忽略整行
			if (this.isSameCode) {
				cargoList = this.getCargoListValue(this.lclDepCargoList)
			} else {
				this.createItem.cargoList.forEach(item => {
					let cargoObj = {}
					Object.assign(cargoObj, {
						length: item.length + '',
						width: item.width + '',
						height: item.height + '',
						hscode: item.hscode,
						cname: item.cname,
						ename: item.ename,
						property: item.property,
						packageInfo: item.packageInfo,
						mark: item.mark,
						commodityDesc: item.commodityDesc,
						commodityTypeCode: item.commodityTypeCode,
						isWoodenPackage: item.isWoodenPackage ? item.isWoodenPackage : undefined,
						shipperName: item.shipperName
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
				// 过滤必填项为空的数据
				cargoList = this.getCargoListValue(cargoList)
			}

			// workAssign
			let workArr = []
			let orderWorkOptions = []
			// 服务项存在代订舱的，pricing的employeeId传0服务项存在代订舱的，pricing的employeeId传0
			if (this.createItem.serviceList.includes('proxy_whbook')) {
				orderWorkOptions = this.orderWorkOptions.map(item => {
					if (item.jobCode === 'pricing') {
						item.employeeId = 0
					}
					return Object.assign({}, item)
				})
			} else {
				orderWorkOptions = [...this.orderWorkOptions]
			}
			workArr = orderWorkOptions.map(item => {
				return {
					jobCode: item.jobCode,
					employeeId: item.employeeId ? item.employeeId : 0
				}
			})
			// if (this.$route.query.jointNo) {
			// 	workArr = []
			// }
			// 截放行时间，截报关时间截取冒号之前的字符, 格式：yyyy-MM-dd HH
			let { ccCutOff, cvCutOff } = this.createItem.ship
			if (ccCutOff && ccCutOff.indexOf(':') !== -1) {
				ccCutOff = ccCutOff.substring(13, 0)
			}
			if (cvCutOff && cvCutOff.indexOf(':') !== -1) {
				cvCutOff = cvCutOff.substring(13, 0)
			}
			return {
				orderNo: this.$route.query.orderNo,
				serviceList: this.createItem.serviceList,
				workAssign: workArr,
				etWhCyCutOff: this.createItem.etWhCyCutOff,
				whCyCutOff: this.createItem.whCyCutOff,
				whPoNo: this.createItem.whPoNo,
				whBookStatus: this.whBookStatus,
				transport: {
					isCustomsInspection: this.createItem.transport.isCustomsInspection,
					transportTerm: this.createItem.transport.transportTerm,
					tradeTermsCode: this.createItem.transport.tradeTermsCode,
					takeContactName: this.createItem.transport.takeContactName,
					takeContactPhone: this.createItem.transport.takeContactPhone,
					takeAddress: this.createItem.transport.takeAddress,
					splitNum: this.createItem.transport.splitNum,
					isExportRight: this.createItem.transport.isExportRight,
					isImportRight: this.createItem.transport.isImportRight,
					shipper: this.createItem.transport.shipper,
					consignee: this.createItem.transport.consignee,
					notify1: this.createItem.transport.notify1,
					notify2: this.createItem.transport.notify2,
					notify3: this.createItem.transport.notify3,
					truckSupplierId: this.createItem.transport.truckSupplierId,
					truckSupplierName: this.createItem.transport.truckSupplierName,
					customsSupplierId: this.createItem.transport.customsSupplierId,
					customsSupplierName: this.createItem.transport.customsSupplierName
				},
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
					blMode: this.createItem.ship.blMode,
					etdTime: this.createItem.ship.etdTime,
					tdTime: this.createItem.ship.tdTime,
					ccCutOff: ccCutOff ? `${ccCutOff}:00:00` : '',
					cvCutOff: cvCutOff ? `${cvCutOff}:00:00` : '',
					receiptPlace: this.createItem.ship.receiptPlace,
					receiptPlaceName: this.createItem.ship.receiptPlaceName,
					vessel: this.createItem.ship.vessel,
					voyage: this.createItem.ship.voyage,
					etaTime: this.createItem.ship.etaTime,
					taTime: this.createItem.ship.taTime,
					polPortCode: this.createItem.ship.polPortCode,
					unloadingPortCode: this.createItem.ship.unloadingPortCode,
					podPortCode: this.createItem.ship.podPortCode,
					contractNo: this.createItem.ship.contractNo,
					sysLineCode: this.createItem.ship.sysLineCode
				},
				cargoList: cargoList
			}
		},
		// 操作编辑
		handleEdit() {
			if (this.createItem.ship.tdTime && !['booked', 'wh_in'].includes(this.whBookStatus) && this.createItem.serviceType === 'st11') {
				return this.$message.warning('请确认是否已实际开船？若是，请先维护好订舱状态。')
			}
			let canSubmit = true
			this.$refs['orderSubmit'].validate(valid => {
				if (valid) {
					// if (!this.validate(this.createItem)) {
					// 	this.submitDisabled = false
					// 	canSubmit = false
					// 	return
					// }
					canSubmit = true
				} else {
					this.submitDisabled = false
					canSubmit = false
					toViewPosition('ship-cont', 80)
					this.$message.error('请按要求填写数据')
					console.log('error submit!!')
					return false
				}
			})
			if (!canSubmit) return false

			this.submitDisabled = true
			let data = this.getEditValues()
			// 操作编辑加上参与人必填校验：操作、应收财务等
			let arr = []
			let opItem = data.workAssign.find(el => el.jobCode === 'op')
			let acItem = data.workAssign.find(el => el.jobCode === 'ac')
			let pricingItem = data.workAssign.find(el => el.jobCode === 'pricing')
			console.log('🚀 ~ data.serviceList', data.serviceList)
			console.log('🚀 ~ this.isUsa', this.isUsa)
			if (this.isUsa && data.serviceList.length === 1 && data.serviceList.includes('pod_change_doc')) {
				arr = []
			} else {
				if (pricingItem && !pricingItem.employeeId) {
					arr.push('商务') // 如果 订单的销售属于“美国分公司”的公共销售人员 只包含换单服务项，商务人员不需要必填，否则必填
				}
			}
			console.log('🚀 ~ arr', arr)
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
			lclImportEdit(data)
				.then(res => {
					this.$message({
						type: 'success',
						message: '保存成功'
						// duration: 1000,
						// onClose: () => {

						// }
					})
					this.submitDisabled = false
					if (this.ordDetRole === 'op' || this.ordDetRole === 'op_truck') {
						this.$emit('getInfo')
					}
					this.ordDetRole === 'doc' && this.$emit('getLeftServiceList')
					// 获取散货信息
					this.getLclInfo()
				})
				.catch(err => {
					setTimeout(() => {
						this.submitDisabled = false
					}, 1000)
				})
		},
		// 协同参与人校验bkg,op
		jointWorkAssignValidate() {
			let flag = true
			let bkgOpArr = this.jointOrderWorkOptions.filter(item => ['bkg', 'op'].includes(item.jobCode) && !item.employeeId)
			let msg = ''
			console.log('bkgOpArr', bkgOpArr)
			bkgOpArr.map((item, index) => {
				msg += index ? `、${item.jobCname}` : item.jobCname
			})
			if (msg) {
				this.$message({ type: 'error', message: `${msg}参与人不能为空` })
				flag = false
			}
			return flag
		},
		// 协同编辑保存
		handleJointEditSave() {
			let canSubmit = true
			this.$refs['orderSubmit'].validate(valid => {
				if (valid) {
					canSubmit = true
				} else {
					this.submitDisabled = false
					canSubmit = false
					toViewPosition('ship-cont', 80)
					this.$message.error('请按要求填写数据')
					console.log('error submit!!')
					return false
				}
			})
			if (!canSubmit) return false
			if (!this.jointWorkAssignValidate()) return
			let workAssign = this.jointOrderWorkOptions.map(item => {
				return {
					jobCode: item.jobCode,
					employeeId: item.employeeId ? item.employeeId : 0
				}
			})
			let jointData = {
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo,
				vessel: this.createItem.ship.vessel,
				voyage: this.createItem.ship.voyage,
				etaTime: this.createItem.ship.etaTime,
				taTime: this.createItem.ship.taTime,
				etdTime: this.createItem.ship.etdTime,
				tdTime: this.createItem.ship.tdTime,
				workAssign
			}
			let editData = this.getEditValues()
			// 协同单的保存里的服务项要传主单的服务项，解决传协同服务项会替换掉主单服务项的问题
			editData.serviceList = this.mainServiceList
			this.submitDisabled = true
			// orderJointSave(jointData).then(res => {
			// 	this.submitDisabled = false
			// }).catch(err => {
			// 	this.submitDisabled = false
			// })
			// lclImportEdit(editData).then(res => {
			// 	this.$message({type: 'success', message: '保存成功'})
			// 	this.submitDisabled = false
			// 	this.$emit('getInfo')
			// 	// 获取散货信息
			// 	this.getLclInfo()
			// }).catch(err => {
			// 	this.submitDisabled = false
			// })
			Promise.all([orderJointSave(jointData), lclImportEdit(editData)])
				.then(res => {
					this.$message({ type: 'success', message: '保存成功' })
					this.submitDisabled = false
					this.$emit('getInfo')
					// 获取散货信息
					this.getLclInfo()
				})
				.catch(err => {
					this.submitDisabled = false
				})
		},
		// 合并传参
		getValues() {
			let cargoList = []
			// 用户是散货部门的cargoList未填写的忽略整行
			if (this.isSameCode) {
				cargoList = this.getCargoListValue(this.lclDepCargoList)
			} else {
				this.createItem.cargoList.forEach(item => {
					let cargoObj = {}
					Object.assign(cargoObj, {
						hscode: item.hscode,
						cname: item.cname,
						ename: item.ename,
						property: item.property,
						packageInfo: item.packageInfo,
						mark: item.mark,
						commodityDesc: item.commodityDesc,
						commodityTypeCode: item.commodityTypeCode,
						isWoodenPackage: item.isWoodenPackage ? item.isWoodenPackage : undefined,
						shipperName: item.shipperName,
						length: item.length,
						width: item.width,
						height: item.height
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
			}

			// workAssign
			let orderWorkOptions = []
			// console.log(this.orderWorkOptions)

			// 服务项存在代订舱的，pricing的employeeId传0
			if (this.createItem.serviceList.includes('proxy_whbook')) {
				// orderWorkOptions = this.orderWorkOptions.map(item => {
				// 	let query = {...item}
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

			return {
				orderNo: this.createItem.orderNo,
				serviceType: this.createItem.serviceType,
				intrustRemark: this.createItem.intrustRemark,
				quantity: this.createItem.quantity,
				weight: this.createItem.weight,
				volume: this.createItem.volume,
				whCyCutOff: this.createItem.whCyCutOff,
				etWhCyCutOff: this.createItem.etWhCyCutOff,
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
					receiptPlace: this.createItem.ship.receiptPlace,
					receiptPlaceName: this.createItem.ship.receiptPlaceName,
					etdTime: this.createItem.ship.etdTime,
					polPortCode: this.createItem.ship.polPortCode,
					unloadingPortCode: this.createItem.ship.unloadingPortCode,
					podPortCode: this.createItem.ship.podPortCode,
					blMode: this.createItem.ship.blMode,
					contractNo: this.createItem.ship.contractNo,
					sysLineCode: this.createItem.ship.sysLineCode
				},
				cargoList: cargoList,
				transport: {
					transportTerm: this.createItem.transport.transportTerm,
					tradeTermsCode: this.createItem.transport.tradeTermsCode,
					takeContactName: this.createItem.transport.takeContactName,
					takeContactPhone: this.createItem.transport.takeContactPhone,
					takeAddress: this.createItem.transport.takeAddress,
					splitNum: this.createItem.transport.splitNum,
					isExportRight: this.createItem.transport.isExportRight,
					isImportRight: this.createItem.transport.isImportRight,
					shipper: this.createItem.transport.shipper,
					consignee: this.createItem.transport.consignee,
					notify1: this.createItem.transport.notify1,
					notify2: this.createItem.transport.notify2,
					notify3: this.createItem.transport.notify3
				},
				workAssign: workArr,
				quoteList: this.quoteList
			}
		},
		// 登录用户是散货部门的获取货物信息提交数据
		getCargoListValue(list) {
			let cargoArr = [...list]
			// 某行必填项未填写的忽略掉该行
			cargoArr = cargoArr.filter(item => {
				if (item.hscode && item.cname && item.ename && item.property && item.packageInfo && item.length && item.width && item.height) {
					if (item.property !== 'dangerous') {
						return true
					} else if (item.dangerousGrade && item.dangerousCode) {
						return true
					}
				}
			})
			console.log('cargoArr', cargoArr)
			let cargoList = cargoArr.map(item => {
				let cargoObj = {
					length: item.length,
					width: item.width,
					height: item.height,
					hscode: item.hscode,
					cname: item.cname,
					ename: item.ename,
					property: item.property,
					packageInfo: item.packageInfo,
					mark: item.mark,
					commodityDesc: item.commodityDesc,
					commodityTypeCode: item.commodityTypeCode,
					isWoodenPackage: item.isWoodenPackage ? item.isWoodenPackage : undefined,
					shipperName: item.shipperName
				}
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
			return cargoList
		},
		// 业务保存提交必填校验
		validate(data) {
			let reg = /^\d+(\.\d+)?$/,
				numberReg = /^\d+(?=\.{0,1}\d+$|$)/
			if (!numberReg.test(data.quantity)) {
				this.$message({ type: 'error', message: '请输入正确的总件数' })
				return false
			}
			// if (data.quantity < 1) {
			// 	this.$message({ type: 'error', message: '总件数不能小于1' })
			// 	return false
			// }
			if (data.weight === '0' || data.weight === 0) {
				this.$message({ type: 'error', message: '总毛重需大于0' })
				return false
			}
			if (!reg.test(data.weight)) {
				this.$message({ type: 'error', message: '请输入正确的总毛重' })
				return false
			}
			if (!reg.test(data.volume)) {
				this.$message({ type: 'error', message: '请输入正确的总体积' })
				return false
			}
			if (data.volume === '0' || data.volume === 0) {
				this.$message({ type: 'error', message: '总体积需大于0' })
				return false
			}
			// 非散货部的收发通要做必填校验
			// if (!this.isSameCode) {
			// 	let valid = true
			// 	let txtArr = []
			// 	if (!data.transport.shipper) {
			// 		valid = false
			// 		txtArr.push('发货人')
			// 	}
			// 	if (!data.transport.consignee) {
			// 		valid = false
			// 		txtArr.push('收货人')
			// 	}
			// 	if (!data.transport.notify1 && !data.transport.notify2 && !data.transport.notify3) {
			// 		valid = false
			// 		txtArr.push('通知人')
			// 	}
			// 	let messageTxt = txtArr.join('、')
			// 	!valid && this.$message({ type: 'error', message: `${messageTxt}为必填` })
			// 	return valid
			// }
			return true
		},

		// 参与人保存提交时校验
		workAssignValidate(data) {
			let { workAssign } = data
			// 代订舱服务项不校验商务
			let noVerify = false
			// if (data.serviceList.includes('proxy_whbook')) {
			// 	noVerify = true
			// }
			console.log('🚀 ~ data.serviceList', data.serviceList)
			console.log('🚀 ~ this.isUsa', this.isUsa)
			if (this.isUsa && data.serviceList.length === 1 && data.serviceList.includes('pod_change_doc')) {
				noVerify = true
			}
			console.log('🚀 ~ noVerify', noVerify)
			// 没有起运港服务项的海外客服ecs参与人也不校验必填
			let noEcsVerify = false
			if (this.createItem.serviceList.every(ele => !this.polServiceList.includes(ele))) {
				noEcsVerify = true
			}
			// 进口拼箱-客户自订的bkg不必填
			if (this.createItem.serviceType === 'st12') {
				this.isNotRequiredWorker = ['op_truck', 'op_customs', 'op_wh', 'eac', 'asst', 'obd', 'doc', 'csc', 'line_cs', 'tc', 'bkg', 'epricing', 'ecs']
			}
			let employeeIdValid = workAssign.some(item => !item.employeeId && !this.isNotRequiredWorker.includes(item.jobCode) && !(noVerify && item.jobCode === 'pricing') && !(noEcsVerify && item.jobCode === 'ecs') && !(item.jobCode === 'rc'))

			// 获取参与人职业名称，拼接做非空提示
			let emptyTxtArr = []
			workAssign.map(item => {
				if (!item.employeeId && !this.isNotRequiredWorker.includes(item.jobCode) && !(noVerify && item.jobCode === 'pricing') && !(noEcsVerify && item.jobCode === 'ecs') && !(item.jobCode === 'rc')) {
					let findItem = this.orderWorkOptions.find(ele => ele.jobCode === item.jobCode)
					findItem.jobCname && emptyTxtArr.push(findItem.jobCname)
				}
			})

			let emptyTxtStr = emptyTxtArr.join('、')
			if (employeeIdValid) {
				this.$message.error(`${emptyTxtStr}参与人不能为空`)
				return false
			}
			return true
		},
		cargoCnCharValidate(data) {
			let msgArr = []
			let result = true
			let { cargoList } = data
			let cnChar = /[\u4E00-\u9FA5\uFE30-\uFFA0]/
			let cnValid = cargoList.some(item => {
				return item.ename && cnChar.test(item.ename)
			})
			// let markValid = cargoList.some(item => {
			// 	return item.mark && cnChar.test(item.mark)
			// })
			// let descValid = cargoList.some(item => {
			// 	return item.commodityDesc && cnChar.test(item.commodityDesc)
			// })
			if (cnValid) {
				msgArr.push('英文品名只能包含英文、数字、符号;')
				result = false
			}
			// if (markValid) {
			// 	msgArr.push('唛头只能包含英文、数字、符号;')
			// 	result = false
			// }
			// if (descValid) {
			// 	msgArr.push('货物描述只能包含英文、数字、符号;')
			// 	result = false
			// }
			if (msgArr.length) this.$message({ type: 'error', message: msgArr.join('') })
			return result
		},
		checkSpeciesStrMethod(item) {
			let check = true
			if (!item) return check
			let reg = /[^\x00-\x7F]+/g
			let result = item.match(reg)
			if (result && result.length) {
				if (result.every(o => this.speciesStrArr.includes(o))) {
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
			let noTaiwanArr = [transport.shipper, transport.consignee, transport.notify1, transport.notify2, transport.notify3]
			let { cargoList } = data
			if (noTaiwanArr.some(item => !this.checkSpeciesStrMethod(item))) {
				this.$message.warning('发货人,收货人,通知人,唛头,货物描述中不能包含中文字符及特殊字符!')
				return false
			} else if (cargoList.some(item => !this.checkSpeciesStrMethod(item.mark)) || cargoList.some(item => !this.checkSpeciesStrMethod(item.commodityDesc))) {
				this.$message.warning('发货人,收货人,通知人,唛头,货物描述中不能包含中文字符及特殊字符!')
				return false
			} else {
				return true
			}
		},
		// 提交保存
		handleSave(type) {
			this.submitDisabled = true
			let data = this.getValues()

			let obdEmployee = data.workAssign.find(el => el.jobCode === 'obd')
			let asstEmployee = data.workAssign.find(el => el.jobCode === 'asst')
			let obdEmployeeId = obdEmployee ? obdEmployee.employeeId : ''
			let asstEmployeeId = asstEmployee ? asstEmployee.employeeId : ''
			if (obdEmployeeId && asstEmployeeId) {
				this.$message.error('销售助理(OBD)和下单助理不能同时选择')
				return (this.submitDisabled = false)
			}
			// 提交
			if (type === 'Submit') {
				data.submitType = 'submit'
				let canSubmit = true
				this.$refs['orderSubmit'].validate(valid => {
					if (valid) {
						if (!this.validate(this.createItem)) {
							this.submitDisabled = false
							canSubmit = false
							return
						}
						canSubmit = true
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
				// 提交时都校验参与人
				if (!this.workAssignValidate(data)) {
					return (this.submitDisabled = false)
				}
				if (!data.serviceList.length) {
					this.submitDisabled = false
					return this.$message({
						type: 'error',
						message: '请选择服务项'
					})
				}
				// 校验特殊字符
				if (!this.validateSpeciesStr(data)) {
					this.submitDisabled = false
					return
				}
				if (
					this.orderInfoDataObj.serviceType === 'st12' &&
					data.submitType === 'submit' &&
					this.orderInfoDataObj.isFirstOrder === 'Y' &&
					(!this.orderInfoDataObj.bdManageEmployeeId || (this.orderInfoDataObj.bdManageEmployeeId && this.orderInfoDataObj.bdManageEmployeeId !== this.userId))
				) {
					// 客户自定，是否点的提交，是否是首单，是否有业务主管
					if (!this.orderInfoDataObj.bdManageEmployeeId) {
						// 没有设置业务主管，提醒去设置
						this.$message.error('部门主管还未设置，请联系管理员配置部门主管人员。你可以先点击保存按钮对数据进行保存！')
						this.submitDisabled = false
						return
					} else {
						data.submitType = 'pre_submit'
						this.$confirm(`此客户自订订单是该客户的首单，需提交给 ${this.orderInfoDataObj.bdManageEmployeeName} 审核，是否确定提交？`, '提示', {
							confirmButtonText: '确定',
							cancelButtonText: '取消',
							type: 'warning'
						})
							.then(() => {
								// 业务提交
								lclImportSave(data)
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
				lclImportSave(data)
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
				// 校验特殊字符
				if (!this.validateSpeciesStr(data)) {
					this.submitDisabled = false
					return
				}
				// 业务保存
				lclImportSave(data)
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
		}
	}
}
</script>
<style lang="scss">
@import '../../less/index.scss';
.lcl-bkg-status {
	margin: 0px 10px;
	padding: 10px 0;
	border-top: 1px solid #e0e0e0;
	.status-title {
		margin-right: 10px;
	}
	.el-radio__label {
		font-size: 12px;
	}
}
</style>
