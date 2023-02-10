<template>
	<div class="finance-container fin-order-fee-wrapper" style="width:100%">
		<div :class="{ 'finance-order-fee-cont': !feeEmbed, 'order-fee-cont-resize': orderInfoTopOpen }">
			<!-- 订单已取消提示 -->
			<CancelAlert v-if="isOp && isCancel && !feeEmbed && !air" :cancelText="cancelText" :cancelOptions="cancelOptions" />
			<!-- 订单拒绝提示 -->
			<RefuseAlert v-if="isBd && isRefuse && !feeEmbed && !air" :refuseReason="refuseReason" />
			<template v-if="!feeEmbed">
				<TopNav v-if="ship" :serviceType="orderInfo.serviceType" :activityKey="'OrderFee'" @routerPush="handleToRoute" />
				<TopNavAir v-else-if="air" :serviceType="orderInfo.serviceType" :activityKey="'OrderFee'" @routerPush="handleToRoute" />
				<TopNavRail v-else-if="rail" :serviceType="orderInfo.serviceType" :activityKey="'OrderFee'" @routerPush="handleToRoute" />
			</template>
			<div :class="{ 'finance-order-fee-main-cont': !feeEmbed }">
				<template v-if="!feeEmbed">
					<!-- <LeftNavAir v-if="air" :orderInfo="orderInfo" :activityKey="'OrderFee'" @routerPush="handleToRoute" /> -->
					<!-- <span v-if="rail"></span> -->
					<LeftNavRail v-if="rail" :orderInfo="orderInfo" :activityKey="'RailwayOrderFee'" @routerPush="handleToRoute" />
					<LeftNav v-if="ship" :orderInfo="orderInfo" :activityKey="'OrderFee'" @routerPush="handleToRoute" />
				</template>
				<div :class="{ 'finance-order-fee-main': !feeEmbed }">
					<div v-if="!hideNoBox" class="order-no-box">
						<div class="order-no-one"><div class="order-icon-box"></div>工作号：{{ orderNo }}</div>
						<div class="order-no-one"><i></i>主单部门：{{ MainOrderCompany.bdDeptName }}</div>
						<div v-if="!jointNo && cust" class="order-no-one">
							<entrustUnitComp :options="custInfo" />
						</div>
						<div v-if="jointNo" class="order-no-one"><i></i>委托单位：{{ client.unitName }}</div>
						<!-- 893(江西星星科技股份有限公司) -->
						<div class="order-no-one">
							预关账状态：
							<span v-if="isFinCloseCombined" style="color:#33B18A;"><i class="el-icon el-icon-success" style="margin-right:3px;"></i>关账</span>
							<span v-else style="color:#EDB534;"><i class="el-icon el-icon-info" style="margin-right:3px;"></i>未关账</span>
						</div>
						<div class="order-no-one order-no-one-finclosefail" style="color:red;" v-if="orderCloseInfo.prefinCloseFailList.length > 0" @click="openPreClose">
							<el-tooltip :content="orderCloseInfo.prefinCloseFailList[0].errorReason" placement="bottom-start" :visible-arrow="false" effect="dark">
								<span>失败原因：{{ orderCloseInfo.prefinCloseFailList[0].errorReason }}</span>
							</el-tooltip>
						</div>
						<!-- 失败原因：{{ orderCloseInfo.prefinCloseFailList[0].errorReason }} -->
						<!-- @click="openPreClose">查看预关账失败记录</div> -->
						<!-- 'st01','st02','st15','st16','st17','st09'对应的是海运整箱服务类型为委托订舱,客户自订,跨境电商,跨境电商海外仓,跨境电商目的港清派和海运进口整箱服务类型为委托订舱 -->
						<!-- <div v-if="!air && !rail && ['st01','st02','st15','st16','st17','st09'].includes(orderInfo.serviceType)" class="order-no-one order-no-one-solist">
							<el-tooltip :content="soList" placement="bottom-start" :visible-arrow="false" effect="dark">
								<span style="color:#4a4a4a;font-weight:normal;">SO号：{{ soList }}</span> -->
						<!-- 20210506002,202105062020,202105062021001,4564646546460430 -->
						<!-- </el-tooltip>
						</div> -->
						<!-- <div v-if="!air && !rail && ['st03','st04','st18','st19','st11','st12'].includes(orderInfo.serviceType)" class="order-no-one order-no-one-po">
							<el-tooltip :content="orderInfo.whPoNo" placement="bottom-start" :visible-arrow="false" effect="dark">
								<span style="color:#4a4a4a;font-weight:normal;">入仓单号：{{ orderInfo.whPoNo }}</span> -->
						<!-- 20210506002,202105062020,202105062021001,4564646546460430 -->
						<!-- </el-tooltip>
						</div> -->
						<br />
						<div v-if="jointNo" class="order-no-one"><i></i>协同单号：{{ jointNo }}</div>
						<div class="order-no-box-workassign">
							<div class="order-status" v-if="['break', 'cancel', 'close'].includes(orderInfo.orderStatus)" style="margin-right:8px;">
								订单状态：
								<span :class="orderInfo.orderStatus === 'complete' || orderInfo.orderStatus === 'pass' ? 'green' : orderInfo.orderStatus === 'submit' ? 'yellow' : ['refuse', 'cancel', 'break'].includes(orderInfo.orderStatus) ? 'red' : 'black'">
									{{ orderInfo.orderStatus | orderStatusFilter }}
								</span>
								<template v-if="!jointNo">
									<el-button type="warning" size="mini" v-if="orderInfo.orderStatus === 'cancel' || orderInfo.orderStatus === 'close'" @click="handleBreak" style="margin-left: 5px;">变更为终止</el-button>
									<el-button type="warning" size="mini" v-if="orderInfo.orderStatus === 'break'" @click="handleCancel" style="margin-left: 5px;">变更为取消</el-button>
								</template>
							</div>
							<!-- <div style="display:inline-block;">
								<el-button v-if="isProfitLossFail && checkAuth('PreClose', 'tab-preClose1', 'btn-apply')" class="finance-btn" size="mini" @click="multiApply" type="success" :disabled="losscloseDisable">申请负利润关账</el-button>
								<el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-precloseByBill')" class="finance-btn" @click="precloseByBill" size="mini" type="primary" :disabled="precloseDisable">预关账</el-button>
							</div> -->
							<el-button class="finance-btn fin-workassign-btn" size="mini" type="text">查看参与人</el-button>
							<!-- 参与人与关键点 -->
							<div class="fee-order-work-assign" v-if="workAssignShow">
								<!-- :style="{ height: `600px` }" -->
								<!-- <el-tabs v-model="activityKey" @tab-click="handleClick">
									<el-tab-pane v-for="item in workAssignMenus" :label="item.value" :name="item.key" :key="item.key"> </el-tab-pane>
								</el-tabs> -->
								<component
									ref="activityKey"
									:is="activityKey"
									:createItem="createItem"
									:orderStatus="createItem.orderStatus"
									:serviceList="createItem.serviceList"
									:orderWorkOptions="orderWorkOptions"
									v-if="createItem.orderNo || rail"
									:jointAuditWorkData="jointAuditWorkData"
									:jointWorkData="jointWorkData"
								></component>
							</div>
						</div>
						<!-- <div class="order-no-box-cancel">
              <el-button class="finance-btn" @click="cancel()" size="mini">关闭</el-button>
            </div> -->
					</div>
					<div v-if="!hideNoBox" class="finance-search-list-gap"></div>
					<div v-if="showOrderInfoTop">
						<orderInfoTop :orderInfo="orderInfo" @handleOrderInfoTop="handleOrderInfoTop" />
					</div>
					<el-tabs v-model="activeName" class="fin-el-tabs">
						<el-tab-pane v-for="(item, index) in tabsList" :key="'tabsList' + index" :label="getLabel(item, isMatched, adjustCount)" :name="item.name" class="fin-el-tab-pane">
							<template>
								<!-- <div v-if="item.name === 'totalFee' && activeName === 'totalFee' && activeKindOne">
									<TotalFee key="TotalFee1" />
								</div>
								<div v-else-if="item.name === 'totalFee' && activeName === 'totalFee' && !activeKindOne">
									<TotalFee key="TotalFee2" />
								</div> -->
								<el-tooltip v-if="item.name === 'businessFee' && isMatched === 'no'" :content="'订单服务项费用不完整'" slot="label">
									<span><i class="el-icon-warning" style="color:#E63923;margin-right:1px;"></i>{{ item.label }}</span>
								</el-tooltip>
								<span v-if="item.name === 'feeClosedModifyFee' && adjustCount > 0" slot="label"
									>{{ item.label }}(<span style="color:#E63923;font-weight:600;">{{ adjustCount }}</span
									>)</span
								>
								<div v-if="item.name === 'businessFee' && activeName === 'businessFee' && activeKindOne">
									<BusinessFee
										key="BusinessFee1"
										:hideSaveCnlBtn="hideSaveCnlBtn"
										:orderCloseInfo="orderCloseInfo"
										:orderInfo="orderInfo"
										@get-order-close-info="getOrderCloseInfo"
										@get-main-order-company="getMainOrderCompany"
										@get-client="getClient"
									/>
								</div>
								<div v-else-if="item.name === 'businessFee' && activeName === 'businessFee' && !activeKindOne">
									<BusinessFee
										key="BusinessFee2"
										:hideSaveCnlBtn="hideSaveCnlBtn"
										:orderCloseInfo="orderCloseInfo"
										:orderInfo="orderInfo"
										@get-order-close-info="getOrderCloseInfo"
										@get-main-order-company="getMainOrderCompany"
										@get-client="getClient"
									/>
								</div>
								<div v-else-if="item.name === 'specialManagementFee' && activeName === 'specialManagementFee' && activeKindOne">
									<SpecialManagementFee key="SpecialManagementFee1" :hideSaveCnlBtn="hideSaveCnlBtn" :orderInfo="orderInfo" />
								</div>
								<div v-else-if="item.name === 'specialManagementFee' && activeName === 'specialManagementFee' && !activeKindOne">
									<SpecialManagementFee key="SpecialManagementFee2" :hideSaveCnlBtn="hideSaveCnlBtn" :orderInfo="orderInfo" />
								</div>
								<div v-else-if="item.name === 'managementFee' && activeName === 'managementFee' && activeKindOne">
									<ManagementFee key="ManagementFee1" />
								</div>
								<div v-else-if="item.name === 'managementFee' && activeName === 'managementFee' && !activeKindOne">
									<ManagementFee key="ManagementFee2" />
								</div>
								<div v-else-if="item.name === 'exceptionFee' && activeName === 'exceptionFee' && activeKindOne">
									<ExceptionFee key="ExceptionFee1" />
								</div>
								<div v-else-if="item.name === 'exceptionFee' && activeName === 'exceptionFee' && !activeKindOne">
									<ExceptionFee key="ExceptionFee2" />
								</div>
								<!-- <div v-else-if="item.name === 'agentReceipay' && activeName === 'agentReceipay' && activeKindOne">
                  <AgentReceipay key="AgentReceipay1" />
                </div>
                <div v-else-if="item.name === 'agentReceipay' && activeName === 'agentReceipay' && !activeKindOne">
                  <AgentReceipay key="AgentReceipay2" />
                </div> -->
								<div v-else-if="item.name === 'feeClosedModifyFee' && activeName === 'feeClosedModifyFee' && activeKindOne">
									<FeeClosedModifyFee key="FeeClosedModifyFee1" @order-fee-adjust-count="orderFeeAdjustCount" />
								</div>
								<div v-else-if="item.name === 'feeClosedModifyFee' && activeName === 'feeClosedModifyFee' && !activeKindOne">
									<FeeClosedModifyFee key="FeeClosedModifyFee2" @order-fee-adjust-count="orderFeeAdjustCount" />
								</div>
								<div v-else-if="item.name === 'profitLossApply' && activeName === 'profitLossApply' && activeKindOne">
									<ProfitLossApply key="ProfitLossApply1" />
								</div>
								<div v-else-if="item.name === 'profitLossApply' && activeName === 'profitLossApply' && !activeKindOne">
									<ProfitLossApply key="ProfitLossApply2" />
								</div>
								<!-- <div v-else-if="item.name === 'profitSharing' && activeName === 'profitSharing' && activeKindOne">
                  <ProfitSharing key="ProfitSharing1" />
                </div>
                <div v-else-if="item.name === 'profitSharing' && activeName === 'profitSharing' && !activeKindOne">
                  <ProfitSharing key="ProfitSharing2" />
                </div> -->
								<div v-else-if="item.name === 'bill' && activeName === 'bill' && activeKindOne">
									<Bill key="Bill1" />
								</div>
								<div v-else-if="item.name === 'bill' && activeName === 'bill' && !activeKindOne">
									<Bill key="Bill2" />
								</div>
							</template>
						</el-tab-pane>
					</el-tabs>
				</div>
			</div>
		</div>
		<el-dialog :title="`申请负利润关账`" :visible.sync="dialogShow" width="400px" @close="dialogShow = false">
			<el-form :model="lossForm" ref="lossForm" :rules="lossRules" :label-width="'80px'" :inline="false" size="mini" style="padding-top: 16px">
				<el-form-item label="原因分类" prop="reasonType">
					<el-select v-model="lossForm.reasonType" placeholder="请选择原因分类" clearable filterable style="width:100%;">
						<el-option v-for="item in dictMap['precloseProfitLossReasonType']" :key="item.value" :label="item.label" :value="item.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item :label="`申请原因`" prop="reason">
					<el-input type="textarea" v-model="lossForm.reason" placeholder="请输入申请原因" maxlength="500" show-word-limit></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" size="mini" @click="sure">确定</el-button>
				<el-button @click="dialogShow = false" size="mini">取消</el-button>
			</span>
		</el-dialog>
		<!-- <el-dialog :visible.sync="orderStatusChangeShow" class="change-orderStatus-dialog" width="400px" @close="handleClose" title="订单状态修改">
			<div class="confirmText">是否将订单状态修改为终止？请先确认业务日期，T+3自动预关账</div>
			<el-form ref="changeOrderStatusForm" :model="changeOrderStatusItem" label-position="right" label-width="70px" class="change-orderStatus-form">    
				<el-form-item label="业务日期" prop="bizDate" :show-message="false" required>
					<el-date-picker size="mini" v-model="changeOrderStatusItem.bizDate" type="date" style="width: 100%" clearable placeholder="请选择" value-format="yyyy-MM-dd" />
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="handleChnageOrderStatus" size="mini">确定</el-button>
				<el-button size="mini" @click="closeDialog">取消</el-button>
			</span>
		</el-dialog> -->
	</div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
// import TotalFee from './components/totalFee'
import BusinessFee from './components/businessFee'
import SpecialManagementFee from './components/specialManagementFee'
import ManagementFee from './components/managementFee'
import ExceptionFee from './components/exceptionFee'
import AgentReceipay from './components/agentReceipay'
import FeeClosedModifyFee from './components/feeClosedModifyFee'
import ProfitLossApply from './components/profitLossApply'
// import ProfitSharing from './components/profitSharing'
import Bill from './components/bill'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { orderCloseInfo, orderFeeList } from '@/api/fin/fee'
import { getBookSoList } from '@/api/order/book/list'
import { orderInfo, orderJointInfo, bookSoList, orderStatusChangeBreak, orderStatusChangeCancel } from '@/api/order/list'
// import TopNav from '@/views/order/order/orderList/components/topNav'
// import LeftNav from '@/views/order/order/orderList/components/leftNav'
// import LeftNavRail from '@/views/railway/order/orderList/components/leftNav'
// import TopNavAir from '@/views/airTransport/order/orderList/components/topNav'
// import TopNavRail from '@/views/railway/order/orderList/components/topNav'
// import LeftNavAir from '@/views/airTransport/order/orderList/components/leftNav'
import CancelAlert from '@/views/order/order/orderList/components/cancelAlert'
import RefuseAlert from '@/views/order/order/orderList/components/refuseAlert'
import orderInfoTop from './components/orderInfoTop'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { parseTime } from '@/utils'
import { getDictLabel } from '@/utils/tools'
import Worker from '@/views/finance/orderFee/orderFee/components/components/worker'
import { jointAuditWork, jointWork } from '@/api/order/list'
import { customerInfo } from '@/api/crm/supplier.js'
import { checkFeeCompleted } from '@/api/fin/orderFee'
import { orderFeeAdjustCount } from '@/api/fin/feeAdjust'
import finCloseApi from '@/api/fin/finClose'
import API from '@/api/fin/finClose'

export default {
	mixins: [mixin, routerMixin],
	props: {
		feeEmbed: {
			type: Boolean,
			default: false
		},
		hideSaveCnlBtn: {
			type: Boolean,
			default: false
		},
		hideNoBox: {
			type: Boolean,
			default: false
		}
	},
	filters: {
		orderStatusFilter(orderStatus) {
			return getDictLabel('orderStatus', orderStatus)
		}
	},
	data() {
		let pageCode = ''
		if (this.$route.name === 'SiDetail') {
			pageCode = 'SiDetailFee'
		} else {
			pageCode = 'OrderFee'
		}
		return {
			orderNo: '',
			jointNo: '',
			activeName: 'businessFee', // 'totalFee',
			tabsList: [
				// {
				// 	label: '全部费用',
				// 	name: 'totalFee'
				// },
				{
					label: '全部费用',
					name: 'businessFee'
				},
				{
					label: '专项管理',
					name: 'specialManagementFee'
				},
				{
					label: '管理费',
					name: 'managementFee'
				},
				{
					label: '异常费用',
					name: 'exceptionFee'
				},
				// {
				//   label: '费用代收付',
				//   name: 'agentReceipay'
				// },
				{
					label: '费用审批记录',
					name: 'feeClosedModifyFee'
				},
				{
					label: '负利润审批',
					name: 'profitLossApply'
				},
				// {
				//   label: '利润分成',
				//   name: 'profitSharing'
				// },
				{
					label: '账单',
					name: 'bill'
				}
			],
			// businessType: '',
			// serviceType: '',
			cust: {
				custName: '',
				custid: ''
			},
			orderCloseInfo: {
				prefinCloseStatus: '',
				prefinCloseTime: '',
				finCloseStatus: '',
				finCloseTime: '',
				prefinCloseFailList: [],
				prefinCloseList: []
			},
			isFinCloseCombined: false,
			cTimestamp: 0,
			activeKindOne: true,
			orderInfo: {},
			isCancel: false, // 订单申请取消通过的状态
			cancelText: '',
			cancelOptions: {}, // 取消订单的信息：原因，备注
			isRefuse: false, // 商务拒绝
			refuseReason: '',
			source: '',
			source2: '',
			useNo: '',
			ship: true,
			air: false,
			rail: false,
			soList: '',
			workAssignShow: false,
			activityKey: 'Worker',
			createItem: {
				// orderStatus: '',
				// serviceList: [],
				// orderWorkOptions: [],
				// orderNo: ''
			},
			orderWorkOptions: [],
			jointAuditWorkData: {},
			jointWorkData: [],
			// orderStatusChangeShow: false,	// 修改订单状态弹窗
			// changeOrderStatusItem: {
			// 	bizDate: parseTime(new Date(), '{y}-{m}-{d}')
			// },
			MainOrderCompany: {
				bdDeptName: ''
			},
			custInfo: {},
			client: {
				unitName: ''
			},
			isMatched: false,
			adjustCount: 0,
			dialogShow: false,
			lossForm: {
				reason: '',
				reasonType: ''
			},
			lossRules: {
				reason: [{ required: true, message: ' ', trigger: 'blur' }],
				reasonType: [{ required: true, message: ' ', trigger: 'blur' }]
			},
			precloseDisable: false,
			losscloseDisable: false,
			pageCode,
			orderInfoTopOpen: false
		}
	},
	created() {
		this.cTimestamp = new Date().getTime()
		this.createFn()
		this.detectActiveName()
	},
	mounted() {
		let FinOrderFee = document.querySelector('.fin-order-fee-wrapper')
		FinOrderFee &&
			FinOrderFee.addEventListener('click', e => {
				if (e.target.innerText === '查看参与人') {
					e.stopPropagation()
					return (this.workAssignShow = !this.workAssignShow)
				}
				let WorkAssign = document.querySelector('.fee-order-work-assign')
				if (!e.path.includes(WorkAssign)) {
					e.stopPropagation()
					this.workAssignShow = false
				}
			})
	},
	activated() {
		let timestamp = new Date().getTime()
		// 拿到外面，因现在有多个订单费用页面，而isUseCache为true时，订单号会是其他订单的，所以把订单号和预关账状态更新
		if (timestamp - this.cTimestamp > 300) {
			this.createFn()
		}
		// console.log('isUseCache:', this.$route.meta.isUseCache)
		// console.log(timestamp - this.cTimestamp)
		if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 300) {
			this.activeKindOne = !this.activeKindOne // 因原来的做法是订单费用使用同一个页面，从列表点进来，通过更换activeKindOne，来完成更新
			this.detectActiveName()
		}
		this.source = this.$route.query.source
		this.source2 = this.$route.query.source2
	},
	computed: {
		isOp() {
			return this.roles.includes('op')
		},
		// bd,obd角色---来自订单
		isBd() {
			return (!this.isOp && this.roles.includes('bd')) || this.roles.includes('obd')
		},
		...mapState({
			roles: state => state.user.roles,
			dictMap: state => state.dict.dictMap,
			orderDetailCustInfo: state => state.order.custInfoObj
		}),
		showOrderInfoTop() {
			return (this.ship && this.orderInfo.serviceType) || (this.air && this.orderInfo.serviceType) || this.rail
		},
		isProfitLossFail() {
			if (this.orderCloseInfo.prefinCloseFailList && this.orderCloseInfo.prefinCloseFailList.length) {
				if (
					this.orderCloseInfo.prefinCloseFailList.find(item => {
						return (item.errorType || '').toUpperCase() === 'PROFIT_LOSS'
					})
				) {
					return true
				} else {
					return false
				}
			} else {
				return false
			}
		}
	},
	methods: {
		// created钩子回调
		async createFn() {
			this.orderNo = this.$route.query.orderNo
			this.jointNo = this.$route.query.jointNo
			let businessBroad = this.$route.query.businessBroad
			businessBroad = businessBroad ? businessBroad : ''
			this.ship = businessBroad.includes('ship') || !businessBroad
			this.air = businessBroad.includes('air') ? true : false
			this.rail = businessBroad.includes('rail') ? true : false
			this.useNo = this.jointNo ? this.jointNo : this.orderNo
			this.$store.commit('finance/saveOrderNo', this.orderNo) // 弃用
			sessionStorage.setItem('orderNo', this.orderNo) // 弃用
			sessionStorage.setItem('jointNo', this.jointNo) // 弃用
			// let { data } = await getBookSoList({ orderNo: this.orderNo })
			// this.soList = data.soList.map(item => item.so).join(',')
			if (!this.jointNo) {
				this.queryServiceItemList({
					orderNo: this.orderNo,
					air: this.air,
					rail: this.rail
				})
			} else {
				this.queryJointServiceItemList({
					jointNo: this.jointNo,
					orderNo: this.orderNo, // 空运协同单是同一个接口，传两个参数
					air: this.air
				})
			}
			this.getOrderCloseInfo()
			this.checkFeeCompleted()
			this.orderFeeAdjustCount()
		},
		detectActiveName() {
			let nameListByNum = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth']
			let nameListByStr = ['businessFee', 'businessFee', 'specialManagementFee', 'managementFee', 'exceptionFee', 'agentReceipay', 'feeClosedModifyFee', 'profitSharing', 'bill']
			let feeChild = this.$route.query.feeChild
			let index = nameListByNum.findIndex(item => item === feeChild)
			if (index > -1) {
				feeChild = nameListByStr[index]
			}
			this.$nextTick(() => {
				// 因与权限写法有重叠，使用此写法
				this.activeName = feeChild || 'businessFee'
			})
		},
		tabClick(tab, event) {},
		getOrderCloseInfo() {
			let data = {
				orderNo: this.useNo
			}
			orderCloseInfo(data).then(res => {
				if (res.code === 0) {
					if (res.data) {
						this.orderCloseInfo = res.data
						let prefinCloseStatus = res.data.prefinCloseStatus
						let finCloseStatus = res.data.finCloseStatus
						let isFinCloseCombined = false
						if (prefinCloseStatus === 'close' || prefinCloseStatus === 'yes' || finCloseStatus === 'close' || finCloseStatus === 'yes') {
							isFinCloseCombined = true
						}
						this.isFinCloseCombined = isFinCloseCombined
						this.setIsFinCloseCombined(isFinCloseCombined)
					} else {
						this.orderCloseInfo = {
							prefinCloseStatus: '',
							prefinCloseTime: '',
							finCloseStatus: '',
							finCloseTime: '',
							prefinCloseFailList: [],
							prefinCloseList: []
						}
					}
				}
			})
		},
		getMainOrderCompany(payload) {
			this.MainOrderCompany.bdDeptName = payload && payload.bdDeptName
		},
		getClient(payload) {
			this.client.unitName = payload && payload.unitName
		},
		checkFeeCompleted() {
			let data = {
				orderNo: this.orderNo,
				jointNo: this.jointNo
			}
			checkFeeCompleted(data).then(res => {
				let { isMatched } = res.data
				this.isMatched = isMatched
			})
		},
		getLabel(item, isMatched, adjustCount) {
			if (item.name === 'businessFee') {
				if (isMatched === 'no') {
					return ''
				} else {
					return item.label
				}
			} else if (item.name === 'feeClosedModifyFee') {
				if (adjustCount > 0) {
					return ''
				} else {
					return item.label
				}
			} else {
				return item.label
			}
		},
		orderFeeAdjustCount(isEmit) {
			let data = {
				sourceBizNo: this.useNo
			}
			orderFeeAdjustCount(data).then(res => {
				let { count } = res.data
				this.adjustCount = count
				if (isEmit === true) {
					let item = this.tabsList.find(item => item.name === 'feeClosedModifyFee')
					this.getLabel(item, this.isMatched, this.adjustCount)
				}
			})
		},
		handleOrderInfoTop(payload) {
			this.orderInfoTopOpen = payload
		},
		// 批量申请
		multiApply() {
			this.initDialog(true)
		},
		// 初始化弹框
		initDialog(multi) {
			this.dialogShow = true
			this.$nextTick(() => {
				this.$refs.lossForm.resetFields()
			})
		},
		// 弹框内确定按钮
		sure() {
			this.$refs.lossForm.validate(res => {
				if (res) {
					let f = this.orderCloseInfo.prefinCloseFailList.find(item => {
						return (item.errorType || '').toUpperCase() === 'PROFIT_LOSS'
					})
					this.lossForm.preclosingIds = [f.finPreclosingId]
					this.losscloseDisable = true
					API.precloseApply({ ...this.lossForm })
						.then(res => {
							// this.getData() // 换到此处，不处理
							this.dialogShow = false
							this.$msgSucClose('提交成功！')
						})
						.finally(() => (this.losscloseDisable = false))
				}
			})
		},
		precloseByBill() {
			this.$confirm('是否确认预关账？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					this.precloseDisable = true
					let data = {
						orderNo: this.useNo
					}
					finCloseApi
						.precloseByBill(data)
						.then(res => {
							if (res.code === 0) {
								this.$message({
									type: 'success',
									message: '预关账提交成功',
									showClose: true
								})
								// this.getData() // 换到此处，不处理
							}
						})
						.catch(err => {})
						.finally(() => {
							// this.$emit('get-order-close-info')
							this.getOrderCloseInfo()
							this.precloseDisable = false
						})
				})
				.catch(() => {})
		},
		openPreClose() {
			// this.$router.push({ name: 'PreClose' })
			let routeUrl = this.$router.resolve({
				name: 'PreClose'
			})
			window.open(routeUrl.href, '_blank')
		},
		// 根据订单号查询服务项列表
		queryServiceItemList(params) {
			this.$store
				.dispatch('dict/queryServiceItemList', params)
				.then(data => {
					if (data) {
						this.orderInfo = data
						this.getInit(this.orderInfo)
						if (this.rail) {
							let main = data.main
							this.cust = { custName: main.custName, custid: main.custid }
							this.orderInfo.orderStatus = data.main.orderStatus
							this.orderInfo.custid = data.main.custid
							this.orderInfo.custName = data.main.custName
						} else {
							this.cust = { custName: data.custName, custid: data.custid }
						}
						// this.$emit("getMenus", data.serviceList, data.serviceInfoList)
						this.fillOrderInfo(data)
					}
				})
				.catch(err => {
					this.orderInfo = { serviceList: [], serviceInfoList: [] }
					this.cust = { custName: '', custid: '' }
					// this.$emit("getMenus", [], [{}])
				})
		},
		// 根据协同号查询服务项列表
		queryJointServiceItemList(params) {
			this.$store
				.dispatch('dict/queryJointServiceItemList', params)
				.then(data => {
					if (data) {
						this.orderInfo = data
						this.getInit(this.orderInfo)
						this.cust = { custName: data.custName, custid: data.custid }
						// this.$emit("getMenus", data.serviceList, data.serviceInfoList)
						this.fillOrderInfo(data)
					}
				})
				.catch(err => {
					this.orderInfo = { serviceList: [], serviceInfoList: [] }
					this.cust = { custName: '', custid: '' }
					// this.$emit("getMenus", [], [{}])
				})
		},
		getInit(data) {
			if (!data) return
			// 获取业务发起取消的订单的取消原因备注等信息
			if (data.cancelApplyStatus === 'applied') {
				this.getCancel(data)
			}
			// 获取已拒绝的信息
			if (data.orderStatus === 'refuse') {
				this.getRefuse(data)
			}
			// this.currServiceCode = getServiceCode(this.$route.name, data.serviceList)
			// sessionStorage.setItem('serviceCode', this.currServiceCode)
			// this.handleIsCancelApply(this.currServiceCode)
		},
		// 委托订舱与客户自定获取业务发起取消订单的取消原因信息
		getCancel(values) {
			console.log('values:', values)
			if (!values) return
			this.isCancel = values.cancelApplyStatus === 'applied'
			this.cancelText = values.orderStatus === 'cancel' || values.orderStatus === 'break' ? '取消(终止)' : '申请取消'
			Object.assign(this.cancelOptions, {
				cancelReason: getDictLabel('orderCancelReason', values.cancelReason) || '',
				cancelRemark: values.cancelRemark || ''
			})
			console.log(this.cancelOptions)
		},
		// 获取商务,bkg拒绝原因
		getRefuse(values) {
			if (!values) return
			this.isRefuse = values.orderStatus === 'refuse'
			let { refuseReason, refuseRemark } = values
			let { orderAuditRefuseReason, bkgRefuseReason, airBkgRefuseReason } = this.dictMap
			let refuseReasonOptions = orderAuditRefuseReason.concat(bkgRefuseReason, airBkgRefuseReason)
			// console.log('refuseReasonOptions', refuseReasonOptions)
			let findItem = refuseReasonOptions.find(item => item.value === refuseReason)
			if (findItem) {
				let refuseReasonCn = findItem.label
				this.refuseReason = refuseRemark ? `${refuseReasonCn}(${refuseRemark})` : `${refuseReasonCn}`
			} else {
				this.refuseReason = ''
			}
		},
		handleToRoute({ name, query, fromName }) {
			this.isJumpRouteFromPage = true
			this.$router.push({
				name: name,
				query: query
			})
		},
		cancel(refresh) {
			window.close()
			if (this.source) {
				// 一部分采用订单custInfo.vue的写法
				let path = this.source || 'orderList'
				if (this.air) {
					this.$router.push({
						path: '/airTransport/order/' + path
					})
				} else if (this.rail) {
					this.$router.push({
						path: '/railway/order/' + path
					})
				} else {
					this.$router.push({
						name: path.slice(0, 1).toUpperCase() + path.slice(1, path.length)
					})
				}
			} else {
				this.routerBack(refresh)
			}
		},
		// showWorkAssign() {
		// 	this.workAssignShow = !this.workAssignShow
		// },
		fillOrderInfo(data) {
			Object.assign(this.createItem, data)
			// 获取委托单位
			this.getCustInfo()
			// 获取参与人
			this.getOrderWork()
			// 获取订舱协助审核人
			this.getJointAuditWork()
			// 获取协同岗位分配
			this.getJointWork()
		},
		// 分配工作项
		getOrderWork() {
			// let data = {
			// 	orderNo: this.createItem.orderNo || this.$route.query.orderNo,
			// 	sysLineCode: this.createItem.ship.sysLineCode,
			// 	shipCarrierCode: this.createItem.ship.shipCarrierCode,
			// 	polPortCode: this.createItem.ship.polPortCode
			// }
			let { workAssign } = this.createItem
			this.orderWorkOptions = workAssign.map(item => {
				if (item.employeeId == 0) {
					item.employeeName = ''
				}
				return Object.assign(item, { show: true })
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
		...mapMutations('finance', ['setIsFinCloseCombined']),
		// 变更订单状态
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
						this.getOrderInfo()
					})
				})
				.catch(err => {})
			// this.orderStatusChangeShow = true
		},
		handleCancel() {
			this.$confirm('变更订单状态为取消？请确认预关账前费用是否已删除。', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					orderStatusChangeCancel({ orderNo: this.$route.query.orderNo }).then(res => {
						this.$message({ type: 'success', message: '变更订单状态为取消成功' })
						this.getOrderInfo()
					})
				})
				.catch(err => {})
		},
		// // 关闭弹窗
		// handleClose() {
		// 	this.closeDialog()
		// },
		// closeDialog() {
		// 	this.orderStatusChangeShow = false
		// },
		// handleChnageOrderStatus() {
		// 	this.$refs.changeOrderStatusForm.validate(valid => {
		// 		if (valid) {
		// 			orderStatusChangeBreak({
		// 				orderNo: this.$route.query.orderNo,
		// 				bizDate: this.changeOrderStatusItem.bizDate
		// 			}).then(res => {
		// 				this.$message({type: 'success', message: '变更订单状态为终止成功'})
		// 				this.orderStatusChangeShow = false
		// 				this.getOrderInfo()
		// 			})
		// 		} else {
		// 			console.log('error submit!!')
		// 			return false
		// 		}
		// 	})
		// },
		// 获取订单详情
		getOrderInfo() {
			let { orderNo, jointNo } = this.$route.query
			if (jointNo) {
				return orderJointInfo({ jointNo: jointNo }).then(res => {
					this.orderInfo = res.data
				})
			}
			orderInfo({ orderNo: orderNo }).then(res => {
				this.orderInfo = res.data
				// 获取客商信息
				this.orderInfo.custid && this.getCustInfo()
			})
		},
		getCustInfo() {
			customerInfo({ custid: this.orderInfo.custid }).then(res => {
				this.custInfo = {
					...res.data,
					custName: this.orderInfo.custName,
					bdServiceMode: this.orderInfo.bdServiceMode,
					businessType: this.orderInfo.businessType,
					contract: this.orderDetailCustInfo.contract
				}
				console.log('custInfo', this.custInfo)
			})
		}
	},
	components: {
		// TotalFee,
		BusinessFee,
		SpecialManagementFee,
		ManagementFee,
		ExceptionFee,
		AgentReceipay,
		FeeClosedModifyFee,
		ProfitLossApply,
		// ProfitSharing,
		Bill,
		TopNav,
		LeftNav,
		LeftNavRail,
		TopNavAir,
		TopNavRail,
		LeftNavAir,
		CancelAlert,
		RefuseAlert,
		Worker,
		orderInfoTop
	},
	watch: {
		'orderInfo.serviceType': {
			handler(newVal) {
				if (['st01', 'st15', 'st09'].includes(newVal)) {
					getBookSoList({ orderNo: this.orderNo }).then(res => {
						this.soList = res.data.soList.map(item => item.so).join(',')
					})
				}
				if (['st02', 'st16', 'st17'].includes(newVal)) {
					bookSoList({ orderNo: this.orderNo }).then(res => {
						this.soList = res.data.map(item => item.so).join(',')
					})
				}
			},
			deep: true
		}
	}
}
</script>
<style lang="scss" scoped>
.finance-order-fee-cont {
	margin: 0px 0px 0px 0px; // 10px 0 10px 14px
}
.finance-order-fee-main-cont {
	display: flex;
}
.finance-order-fee-main {
	flex: 1;
	// width: calc(100% - 121px);
	height: calc(100vh - 24px); // calc(100vh - 74px)
	padding-bottom: 14px;
	overflow: auto;
}
.order-no-box {
	padding: 8px 222px 8px 15px; // 8px 250px 8px 15px
	line-height: 20px;
	background: #fff;
	// box-shadow: 0px 4px 10px 0px #e9e9e9;
	border-radius: 0px 0px 2px 0px; // border-radius: 0px 0px 4px 0px;
	position: relative;
}
.order-no-one {
	margin-right: 20px;
	display: inline-block;
	.order-icon-box{
		height: 20px;
		display: inline-block;
		vertical-align: middle;
		margin-right: 5px;
	}
}
// .order-no-box span:nth-of-type(1) {
// 	color: #222222;
// 	font-weight: 600;
// 	margin-right: 50px;
// }
// .order-no-box span:nth-of-type(2) {
// 	color: #4a4a4a;
// 	margin-right: 50px;
// }
// .order-no-box span:nth-of-type(3) {
// 	color: #4a4a4a;
// 	margin-right: 14px;
// }
.order-no-box .order-no-one-finclosefail {
	cursor: pointer;
	width: 240px;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
	vertical-align: middle;
	margin-top: -2px;
}
.order-no-one-solist {
	max-width: 100px;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
	vertical-align: middle;
	margin-top: -2px;
	margin-right: 0;
}
.order-no-one-po {
	max-width: 130px;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
	vertical-align: middle;
	margin-top: -2px;
	margin-right: 0;
}
@media screen and (min-width: 1580px) {
	.order-no-box .order-no-one-finclosefail {
		width: auto;
		max-width: 420px;
	}
	.order-no-one-solist {
		max-width: 320px;
	}
}
.order-no-box-workassign {
	position: absolute;
	right: 20px;
	top: 50%;
	margin-top: -10px;
	z-index: 2000;
	.fin-workassign-btn {
		background: #fff;
	}
}
.fee-order-work-assign {
	position: absolute;
	right: -20px;
	top: 25px;
	width: 148px;
	max-height: calc(100vh - 65px);
	overflow-y: auto;
	background: #ffffff;
	box-shadow: 0px 4px 10px 0px #e9e9e9;
	border: 1px solid #d9d9d9;
	border-radius: 3px;
	padding: 5px 0 6px;
	/deep/.work-cont {
		overflow-y: initial !important;
	}
}
.order-no-box-cancel {
	position: absolute;
	right: 14px;
	top: 50%;
	margin-top: -10px;
}
.order-status {
	display: inline-block;
	button {
		background: #edb534;
	}
}
.confirmText {
	line-height: 20px;
	font-size: 12px;
	margin-bottom: 10px;
}
.change-orderStatus-form {
	::v-deep .el-form-item {
		margin-bottom: 4px;
	}
	::v-deep .el-form-item__label {
		line-height: 20px;
	}
	::v-deep .el-form-item__content {
		line-height: 20px;
	}
	::v-deep .el-input--mini .el-input__inner {
		line-height: 20px;
		height: 20px;
	}
	::v-deep .el-input--mini .el-input__icon {
		line-height: 20px;
	}
}
</style>
