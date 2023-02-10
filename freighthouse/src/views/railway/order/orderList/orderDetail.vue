<template>
	<div>
		<div class="edit-container fullWrap">
			<ComOrderInfo ref="first" :createItem="createItem" :orderStatus="createItem.orderStatus" :serviceTypeOptions="serviceTypeOptions" :serviceCodeOptions="serviceCodeOptions" @getHeight="getShipInfoHeight" @updateCust="updateCust">
				<div class="operateBtn-group">
					<div class="btn-groups">
						<template>
							<!-- 业务 -->
							<template v-if="isBd">
								<el-button size="mini" type="primary" @click="handleSave" :disabled="submitDisabled" v-if="['draft', 'refuse'].includes(createItem.orderStatus) || !viewState">保存</el-button>
								<el-button size="mini" type="primary" @click="handleSubmit" :disabled="submitDisabled" v-if="['draft', 'refuse'].includes(createItem.orderStatus) || !viewState">提交</el-button>
								<el-button
									size="mini"
									type="danger"
									class=""
									@click="handleCancelRequest"
									:disabled="submitDisabled"
									v-if="createItem.rail.bkgStatus === 'BOOK_RELEASE' && !['complete', 'break', 'cancel', 'close'].includes(createItem.orderStatus) && !copyState && createItem.main.cancelApplyStatus !== 'applied'"
									>{{isOrderFeeCount ? '终止' : '取消'}}</el-button
								>
								<el-button
									size="mini"
									type="default"
									class="submitCancel"
									@click="handleCancelCancel"
									:disabled="submitDisabled"
									v-if="createItem.main.cancelApplyStatus === 'applied' && createItem.orderStatus !== 'break' && createItem.orderStatus !== 'cancel'"
									>{{isOrderFeeCount ? '撤回终止' : '撤回取消'}}</el-button
								>

								<el-button size="mini" type="danger" @click="handleDelete" :disabled="submitDisabled" v-if="createItem.orderStatus === 'draft'">删除</el-button>
							</template>
							<template v-if="showCancel">
								<el-button size="mini" type="default" class="submitCancel" @click="handleSubmitCancel" :disabled="submitDisabled" v-if="createItem.orderStatus === 'submit'">撤回</el-button>
							</template>
							<!-- 业务 -->
							<template v-if="isBd">
								<el-button size="mini" type="default" class="" @click="handleCopy" :disabled="submitDisabled" v-if="!addState">复制</el-button>
								<el-button size="mini" type="default" @click="handleClose('break')" :disabled="submitDisabled" v-if="isOrderFeeCount && createItem.orderStatus === 'refuse'">终止</el-button>
								<el-button size="mini" type="default" @click="handleClose('close')" :disabled="submitDisabled" v-if="!isOrderFeeCount && createItem.orderStatus === 'refuse'">关闭</el-button>
							</template>
							<!-- 商务 -->
							<template v-if="isPricing && createItem.orderStatus === 'submit'">
								<el-button size="mini" type="primary" @click="handleAudit('save')" :disabled="submitDisabled">保存</el-button>
								<el-button size="mini" type="success" @click="handleAudit('pass')">通过</el-button>
								<el-button size="mini" type="danger" @click="handleRefuse">拒绝</el-button>
							</template>
							<!-- 操作 -->
							<template v-if="isBkg && hasDestination">
								<el-button size="mini" type="primary" class="" @click="saMailShow = true" v-if="['pass'].includes(createItem.orderStatus)" :disabled="submitDisabled">发送SA</el-button>
							</template>
							<!-- 操作 -->
							<template v-if="isOp && $route.query.source !== 'jointList'">
								<el-button size="mini" type="default" class="" @click="handleJointService" :disabled="submitDisabled" v-if="['pass'].includes(createItem.orderStatus)">协同</el-button>
							</template>
							<template v-if="isBkg">
								<el-button size="mini" type="danger" @click="handRefuseOp" v-if="showBkgRefuse" :disabled="submitDisabled">拒绝</el-button>
								<el-button size="mini" type="primary" v-if="createItem.orderStatus != 'complete'" @click="handleCommand()">输出托书</el-button>
								<!-- 放开已关账、已完成的限制 createItem.orderStatus === 'pass' || (createItem.orderStatus === 'break' && createItem.main.finCloseStatus !== 'yes')-->
								<el-button size="mini" type="primary" v-if="createItem.orderStatus === 'pass' || (createItem.orderStatus === 'break')" @click="handleEdit" :disabled="submitDisabled">保存</el-button>
								<!-- <el-button size="mini" type="success" @click="handleFinish" :disabled="submitDisabled" v-if="createItem.rail.bkgStatus === 'RAIL_ARRIVAL' && showFinish && createItem.orderStatus != 'complete'">完成</el-button> -->
								<el-button size="mini" type="danger" @click="handleCancel('break')" :disabled="submitDisabled" v-if="opBreakBtnShow">终止</el-button>
								<el-button size="mini" type="danger" @click="handleCancel('cancel')" :disabled="submitDisabled" v-if="opCancelBtnShow">取消</el-button>
							</template>
							<template v-if="(isEcs || isEpricing) && !isBkg">
								<el-button size="mini" type="primary" @click="handleEdit" v-if="createItem.orderStatus != 'complete'" :disabled="submitDisabled">保存</el-button>
							</template>
						</template>
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
						<span class="value" :class="finCloseStatusCn === '已关账' ? 'green' : finCloseStatusCn === '未关账' ? 'yellow' : 'black'">{{ finCloseStatusCn }}</span>
					</div>
				</div>
			</ComOrderInfo>

			<div class="order-cont">
				<el-form ref="orderSubmit" :model="createItem" :rules="rules" class="order-cont-form" size="mini">
					<!-- 订舱信息 -->
					<div class="ship-cont" ref="shipInfoCont" :class="workAssignShow ? 'abs-toogle' : ''" :style="{ height: `${shipInfoHeight}px` }">
						<div class="toggleWorkAssign" @click="toggleWorkAssign">
							<i class="hamburger el-icon-arrow-right" :class="{ 'is-active': !workAssignShow }"></i>
						</div>
						<h1 class="orderInfo-h1">订舱信息</h1>
						<div v-if="isBkg" class="railway-booking">
							<div class="railway-booking-status">
								订舱状态:
								<el-radio-group v-model="createItem.rail.bkgStatus" :disabled="isDisabled">
									<el-radio :label="item.value" v-for="item in dictMap.railBkgStatus" :key="item.value">{{ item.label }}</el-radio>
								</el-radio-group>
							</div>
							<div class="delivery-note-wrap">
								<div class="railway-booking-btn">
									<el-button :disabled="['cancel', 'break', 'complete'].includes(createItem.orderStatus)" type="primary" size="mini" @click="addDeliveryNote">新增入仓单</el-button>
								</div>
								<div class="delivery-note-table">
									<el-table :data="deliveryNoteList" style="width: 100%">
										<el-table-column prop="inNo" label="入仓编号" width="180"> </el-table-column>
										<el-table-column show-overflow-tooltip prop="cname" label="中文品名" width="180"> </el-table-column>
										<el-table-column prop="quantity" label="数量"> </el-table-column>
										<el-table-column prop="packageInfo" label="包装" width="180"> </el-table-column>
										<el-table-column prop="weight" label="重量/KGS" width="180"> </el-table-column>
										<el-table-column prop="volume" label="体积/CBM"> </el-table-column>
										<el-table-column prop="lastInTime" label="最晚入仓时间" width="180"> </el-table-column>
										<el-table-column label="操作" align="center" width="180">
											<template slot-scope="scope">
												<el-button :disabled="['cancel', 'break', 'complete'].includes(createItem.orderStatus)" @click="handleExportDelivery(scope.row)" style="padding:0;" type="text" size="mini">输出入仓单</el-button>
												<el-button :disabled="['cancel', 'break', 'complete'].includes(createItem.orderStatus)" @click="handleEditWh(scope.row)" style="margin-left:2px; margin-right:4px; padding:0;" type="text" size="mini">编辑</el-button>
												<el-button :disabled="['cancel', 'break', 'complete'].includes(createItem.orderStatus)" @click="handleDeleteWh(scope.row)" style="margin-left:0; padding:0;color:red;" type="text" size="mini">删除</el-button>
											</template>
										</el-table-column>
									</el-table>
								</div>
							</div>
						</div>
						<OrderBookInfo
							ref="orderBookInfo"
							:isSameUser="isSameUser"
							@getInfo="getOrderInfo"
							:createItem="createItem"
							:fillPolData="fillPolData"
							:fillPortCodes="fillPortCodes"
							:orderStatus="createItem.orderStatus"
							:sysLineCname="sysLineCname"
							@getCountryCode="getCountryCode"
							@updatePricing="updatePricing"
							@saveRemark="handleSaveRemark"
						/>
						<!-- 海外信息 -->
						<OverseasInfo @setQuoteList="setQuoteList" :quoteList="quoteList" :createItem="createItem" :businessType="createItem.main.businessType" :bdId="createItem.main.bdEmployeeId" :polCode="createItem.rail.polPortCode" :podCode="createItem.rail.podPortCode" @updateGetInfo="updateGetInfo" :orderStatus="createItem.main.orderStatus" />
						<SoContainer :containerTotal="containerTotal" :createItem="createItem" :orderStatus="createItem.orderStatus" :isDisabled="isDisabled" ref="soContainer" />
						<!-- 货物信息 -->
						<Shippers :createItem="createItem" :orderStatus="createItem.orderStatus" ref="shippers" />
						<!-- 物流信息 -->
						<div class="row-cont">
							<div class="row-cont-tit">
								<span class="tit">物流信息</span>
							</div>
							<TransportInfo :createItem="createItem" :orderStatus="createItem.orderStatus" ref="transport" />
						</div>
					</div>
					<!-- 参与人与关键点 -->
					<div class="work-assign-cont" style="width:170px;" v-if="workAssignShow">
						<el-tabs v-model="activityKey" @tab-click="handleClick">
							<el-tab-pane v-for="item in workAssignMenus" :label="item.value" :name="item.key" :key="item.key"> </el-tab-pane>
						</el-tabs>
						<component
							ref="activityKey"
							:is="activityKey"
							:createItem="createItem"
							:orderStatus="createItem.orderStatus"
							:serviceList="createItem.main.serviceList"
							:orderWorkOptions="orderWorkOptions"
							:obdDeptCode="obdDeptCode"
							:bdDeptCode="bdDeptCode"
							v-if="createItem.main && createItem.main.orderNo"
							:checkPointHeight="checkPointHeight"
							:jointAuditWorkData="jointAuditWorkData"
							:jointWorkData="jointWorkData"
							:jointWorkAssignList="jointWorkAssignList"
							:orgWorkAssignList="orgWorkAssignList"
							:isJoint="isJoint === 'Y'"
						></component>
					</div>
				</el-form>
			</div>
		</div>
		<!-- 取消订单弹窗 -->
		<div v-if="cancelOrderPopShow">
			<CancelOrder @close="cancelRequestPopClose" :orderNo="$route.query.orderNo" :isOrderFeeCount="isOrderFeeCount" />
		</div>
		<div v-if="createDeliveryNoteShow">
			<CreateDeliveryNote :row="whRow" @close="createOrderPopClose" />
		</div>
		<!-- 拒绝弹窗 -->
		<div v-if="refusePopShow">
			<RefuseDialog @close="refusePopClose" />
		</div>
		<!-- 订舱拒绝弹窗 -->
		<div v-if="opRefusePopShow">
			<RefuseDialogBkg @close="opRefusePopClose" />
		</div>
		<div v-if="exportEntrustedPopShow">
			<exportEntrustedPop @close="exportPopClose" />
		</div>
		<div v-if="exportInBillPopShow">
			<exportInBillPop @close="exportInBillPopClose" />
		</div>
		<div v-if="saMailShow">
			<SaMail @close="saMailClose" :containerTotal="containerTotal"></SaMail>
		</div>
		<!-- 协同订单弹窗 -->
		<div v-if="jointServicePopShow">
			<JointService @close="jointServicePopClose" :createItem="createItem" />
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import Cookies from 'js-cookie'
import { getDictLabel } from '@/utils/tools'
import ComOrderInfo from './components/comOrderInfo'
import OrderBookInfo from './components/orderBookInfo'
import TransportInfo from './components/transportInfo'
import SoContainer from './components/soContainer'
import Shippers from './components/shippers'
import Worker from './components/worker'
import WorkerPricing from './components/workerPricing'
import CheckPoint from './components/checkPoint'
import { baseBusinessList, baseBusinessServiceList, portSystemLineInfo } from '@/api/base'
import {
	railAuditPass,
	orderSave,
	orderEdit,
	railOrderJointSave,
	orderWork,
	orderCancelHandle,
	orderCopy,
	shipOrderFinish,
	orderClose,
	orderDelete,
	inNoDelete,
	orderSubmitCancel,
	jointAuditWork,
	jointWork,
	mainRemarkUpdate,
	orderInfo,
	orderAuthCheck
} from '@/api/railway/list'
import { railBookWhList, railBookWhSave, getBookSoList } from '@/api/railway/book/list'
import { orderFeeCount } from '@/api/fin/fee'
import CreateDeliveryNote from './components/createDeliveryNote'
import RefuseDialog from './components/refuseDialog'
import RefuseDialogBkg from './components/refuseDialogBkg'
import CancelOrder from './components/cancelOrder'
import exportEntrustedPop from './components/exportEntrustedPop.vue'
import exportInBillPop from './components/exportInBillPop.vue'
import { orderCancelCancel, orderStatusChangeBreak, orderWorkList } from '@/api/order/list'
import { closePage } from '@/utils'
import { toViewPosition } from '@/utils/scroll-to.js'
import { arrayHasDuplicateValue } from '@/utils/index'
import OverseasInfo from './components/overseasInfo'
import SaMail from '@/views/order/order/orderList/components/saMail'
import JointService from './components/jointService'
export default {
	filters: {
		// cargoSourceFilter(cargoSource) {
		// 	return getDictLabel('cargoSource', cargoSource)
		// }
	},
	data() {
		return {
			quoteList: [],
			saMailShow:false,
			isNotRequiredWorker: ['eac', 'asst', 'obd', 'ecs', 'epricing'], // 非必填参与人
			originBkgStatus: '',
			jointWorkAssignList: [],
			orgWorkAssignList: [],
			isJoint: '',
			opRefusePopShow: false,
			showFinish: false,
			// showBkgRefuse: false,
			inNo: '',
			exportInBillPopShow: false,
			exportEntrustedPopShow: false,
			whRow: {
				inNo: '',
				cname: '',
				quantity: '',
				packageInfo: '',
				weight: '',
				volume: '',
				lastInTime: ''
			},
			// 取消订单弹窗
			cancelOrderPopShow: false,
			// 拒绝弹窗
			refusePopShow: false,
			createDeliveryNoteShow: false,
			deliveryNoteList: [],
			railwayCargos: 1,
			state: '',
			oQuery: this.$route.query,
			workAssignShow: false,
			countryCode: '',
			shipInfoHeight: 0, // 订舱信息高度
			checkPointHeight: 0, // 关键点高度
			createItem: { ...this.$store.state.railway.orderList.createItem },
			opCargoItem: { ...this.$store.state.railway.orderList.opCargoItem },
			opSizeItem: { ...this.$store.state.railway.orderList.opSizeItem },
			rules: {},
			// workAssignMenus: [
			// 	{
			// 		key: 'Worker',
			// 		value: '参与人'
			// 	},
			// 	{
			// 		key: 'CheckPoint',
			// 		value: '关键点'
			// 	}
			// ],
			// activityKey: 'Worker',
			workAssignMenus: [
				{
					key: 'WorkerPricing',
					value: '参与人'
				},
				{
					key: 'CheckPoint',
					value: '关键点'
				}
			],
			activityKey: 'WorkerPricing',

			// 港口反显数据
			fillPolData: {},
			orderWorkOptions: [],
			fillPortCodes: '',
			submitDisabled: false,
			isOrderFeeCount: false, // 是否有费用
			serviceTypeOptions: [], // 服务类型下拉
			serviceCodeOptions: [], // 服务项下拉
			sysLineCname: '', // 系统航线中文名称
			jointAuditWorkData: {},
			jointWorkData: [],
			finCloseStatusCn: '', // 关账状态/预关账状态
			bdDeptCode: '',
			obdDeptCode: '', // obd部门code
			jointServicePopShow: false,	// 协同订单弹窗
		}
	},
	created() {
		this.init(this.orderInfo)
		this.getRailBookList()
	},
	mounted() {
		window.addEventListener('resize', this.getShipInfoHeight)
		this.$nextTick(() => {
			this.getShipInfoHeight()
		})
		// 安亮:去掉权限校验 20220225
		// this.orderAuthCheck()
		// 	.then(() => {})
		// 	.catch(() => {
		// 		closePage()
		// 	})
	},
	destroyed() {
		window.removeEventListener('resize', this.getShipInfoHeight)
	},

	computed: {
		...mapState('railway', ['ordDetRole', 'overseasTipMsg']),
		...mapState({
			dictMap: state => state.dict.dictMap,
			roles: state => state.user.roles,
			userEditRoles: state => state.railway.userEditRoles,
			userId: state => state.user.userId,
			order: state => state.railway,
			finance: state => state.finance,
			orderList: state => state.railway.orderList,
			railwayOrderInfoData: (state) => state.railway.orderInfoDataObj,
		}),
		isEpricing() {
			return this.ordDetRole === 'epricing'
		},
		isEcs() {
			return this.ordDetRole === 'ecs'
		},
		showBkgRefuse() {
			if (this.$route.query.source === 'jointList') {
				return ['INIT', 'BOOKED'].includes(this.originBkgStatus)
			} else {
				let itemBkg = this.orderWorkOptions.find(item => item.jobCode === 'bkg')
				return ['INIT', 'BOOKED'].includes(this.originBkgStatus) && itemBkg && itemBkg.employeeId === this.userId
			}
		},
		isSameUser() {
			let itemPricing = this.orderWorkOptions.find(item => item.jobCode === 'pricing')

			return (itemPricing && itemPricing.employeeId === this.userId) || (this.roles.includes('manager') && this.roles.includes('pricing'))
		},
		isOp() {
			return this.ordDetRole === '' && this.userEditRoles.includes('op')
		},
		isBkg() {
			return this.ordDetRole === 'bkg' && this.userEditRoles.includes('bkg')
		},
		isBd() {
			return this.ordDetRole === 'bd'
		},
		showCancel() {
			// 销售 销售助理、下单助理 需能撤回该订单
			return ['bd', 'obd', 'asst'].includes(this.ordDetRole)
		},
		isPricing() {
			return this.ordDetRole === 'pricing'
		},
		// 新创建的未保存的订单不可复制
		addState() {
			return !this.createItem.rail
		},
		copyState() {
			return this.$route.query.action === 'copy'
		},
		viewState() {
			let workAssign = this.createItem.workAssign
			for (let index = 0; index < workAssign.length; index++) {
				const item = workAssign[index]
				if (['eac', 'ac', 'rc', 'op'].includes(item.jobCode) && item.employeeId === this.userId) {
					return true
				}
			}
			if (this.isOp) {
				return true
			}
			return this.$route.query.action === 'view' || this.createItem.orderStatus !== 'draft'
		},
		// 箱型箱量统计
		containerTotal() {
			let quantity = 0
			let weight = 0
			let volume = 0
			let containerArr = []
			let mergeArr = []
			let container = ''
			let { containerList } = this.createItem

			containerList.forEach(o => {
				quantity += o.quantity && o.containerNum ? Number(o.quantity) * Number(o.containerNum) : 0
				weight += o.weight && o.containerNum ? Number(o.weight) * Number(o.containerNum) : 0
				volume += o.volume && o.containerNum ? Number(o.volume) * Number(o.containerNum) : 0

				// quantity += o.quantity ? Number(o.quantity) : 0
				// weight += o.weight ? Number(o.weight) : 0
				// volume += o.volume ? Number(o.volume) : 0
				weight = parseFloat(weight.toFixed(10))
				volume = parseFloat(volume.toFixed(10))
				containerArr.push({
					containerType: o.containerType ? o.containerType : '',
					containerNum: o.containerNum ? o.containerNum : ''
				})
			})

			// 箱型箱量合计统计把相同的箱型元素的箱量相加合并
			// const containerTypeArr = [...new Set(containerArr.map(item => item.containerType))]
			const containerTypeArr = containerArr.map(item => item.containerType)

			containerTypeArr.forEach(item => {
				const arr = containerArr.filter(keys => keys.containerType === item)
				let sum = arr.reduce((a, b) => Number(a) + Number(b.containerNum), 0)
				mergeArr.push({
					containerType: item,
					containerNum: sum
				})
			})
			mergeArr.forEach((item, index) => {
				const firstText = index > 0 ? '+' : ''
				if (item.containerType && !container.includes(item.containerType)) {
					// container += firstText + `${item.containerType}`
					container += firstText + `${item.containerType} * ${item.containerNum}`
				}
			})

			return {
				quantity: quantity,
				weight: weight,
				volume: volume,
				container: container
			}
		},
		// 已取消，已终止，已完成的不可编辑
		isDisabled() {
			return ['cancel', 'break', 'complete'].includes(this.createItem.orderStatus)
		},
		// 存在协同服务项
		serviceIsJoint() {
			return this.createItem.serviceInfoList.some(ele => ele.isJoint === 'y')
		},
		// 操作取消按钮显示
		opCancelBtnShow() {
			return ['pass'].includes(this.createItem.orderStatus) && this.$route.query.source !== 'jointList' && this.createItem.main.cancelApplyStatus === 'applied' && !this.isOrderFeeCount && !['CANCEL', 'BREAK'].includes(this.createItem.main.cancelJointHandleStatus)
		},
		// 操作终止按钮显示
		opBreakBtnShow() {
			return ['pass'].includes(this.createItem.orderStatus) && this.$route.query.source !== 'jointList' && this.createItem.main.cancelApplyStatus === 'applied' && this.isOrderFeeCount && !['CANCEL', 'BREAK'].includes(this.createItem.main.cancelJointHandleStatus)
		},
		hasDestination(){
			// 是否要做目的港服务项
			if(
				this.railwayOrderInfoData.serviceList.includes('pod_ltl_delivery')||
				this.railwayOrderInfoData.serviceList.includes('pod_fcl_delivery')||
				this.railwayOrderInfoData.serviceList.includes('pod_comm_clearance')||
				this.railwayOrderInfoData.serviceList.includes('pod_warehouse')
				){
				return true
			}
			return false
		},
    hasDestinationShow() {
      // 是否要做目的港服务项
			if(
				this.createItem.serviceList.includes('pod_ltl_delivery')||
				this.createItem.serviceList.includes('pod_fcl_delivery')||
				this.createItem.serviceList.includes('pod_comm_clearance')||
				this.createItem.serviceList.includes('pod_warehouse')
				){
				return true
			}
			return false
    },
	},
	components: {
		exportInBillPop,
		exportEntrustedPop,
		ComOrderInfo,
		OrderBookInfo,
		TransportInfo,
		SoContainer,
		Worker,
		WorkerPricing,
		CheckPoint,
		CreateDeliveryNote,
		RefuseDialog,
		CancelOrder,
		Shippers,
		RefuseDialogBkg,
		OverseasInfo,
		SaMail,
		JointService
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
		}
	},
	methods: {
		setQuoteList(val){
      this.quoteList = val
    },
		// 业务协同订单
		handleJointService() {
			this.jointServicePopShow = true
		},
		// 协同订单关闭回调
		jointServicePopClose() {
			this.jointServicePopShow = false
		},
		// sa邮件
		saMailClose() {
			this.saMailShow = false
		},
		updateGetInfo() {
			this.$emit('getInfo')
		},
		opRefusePopClose(action) {
			if (action === 'Confirm') {
				this.$emit('getInfo')
			}
			this.opRefusePopShow = false
		},
		handRefuseOp() {
			// 操作拒绝
			this.opRefusePopShow = true
		},
		orderAuthCheck(data) {
			// 判断用户当前是否有权限留在当前页面
			return new Promise((resolve, reject) => {
				let params = {
					orderNo: this.$route.query.orderNo,
					jointNo: this.createItem.jointNo
				}

				orderAuthCheck(params)
					.then(() => {
						resolve('success')
					})
					.catch(() => {
						setTimeout(() => {
							reject()
						}, 500)
					})
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
		handleExportInBill(obj) {
			let params = {
				...obj,
				orderNo: this.$route.query.orderNo,
				inNo: this.inNo
			}
			this.$store
				.dispatch('order/exportBlobFile', {
					uri: '/order/rail/book/wh/in/export',
					data: params
				})
				.then(res => {
					console.log(res)
					this.exportInBillPopShow = false
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = this.inNo + '.' + params.docType.toLowerCase()
					link.click()
				})
		},
		exportInBillPopClose(action, value) {
			if (action === 'Confirm') {
				this.handleExportInBill(value)
			} else {
				this.exportInBillPopShow = false
			}
		},
		handleCommand() {
			this.exportEntrustedPopShow = true
		},
		handleExport(obj) {
			let params = {
				...obj,
				orderNo: this.$route.query.orderNo
			}
			this.$store
				.dispatch('order/exportBlobFile', {
					uri: '/order/rail/book/booking/export',
					data: params
				})
				.then(res => {
					console.log(res)
					this.exportEntrustedPopShow = false
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = `托书${params.orderNo}.` + params.docType.toLowerCase()
					link.click()
				})
		},
		exportPopClose(action, value) {
			if (action === 'Confirm') {
				this.handleExport(value)
			} else {
				this.exportEntrustedPopShow = false
			}
		},

		handleExportDelivery(row) {
			console.log('🚀 ~ row', row)
			this.inNo = row.inNo
			this.exportInBillPopShow = true
		},
		getOrderInfo() {
			let { query } = this.$route
			let orderNo = query.orderNo
			orderInfo({ orderNo: orderNo }).then(res => {
				this.$set(this.createItem.rail, 'bookFileNo', res.data.rail.bookFileNo)
				this.$set(this.createItem.rail, 'bookFileName', res.data.rail.bookFileName)
			})
		},
		handleEditWh(row) {
			this.whRow = row
			this.createDeliveryNoteShow = true
		},
		// // 业务关闭订单
		// handleClose() {
		// 	this.$confirm(`是否关闭此订单?`, '警告', {
		// 		confirmButtonText: '确定',
		// 		cancelButtonText: '取消',
		// 		type: 'warning'
		// 	})
		// 		.then(() => {
		// 			orderClose({ orderNo: this.$route.query.orderNo }).then(res => {
		// 				this.$message({
		// 					type: 'success',
		// 					message: '关闭成功',
		// 					duration: 1000,
		// 					onClose: () => {
		// 						this.$router.push({
		// 							name: 'RailwayOrderList'
		// 						})
		// 					}
		// 				})
		// 			})
		// 		})
		// 		.catch(err => {
		// 			console.log('err')
		// 		})
		// },
		// 业务关闭订单
		handleClose(type) {
			if (type === 'close') {
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
										name: 'RailwayOrderList'
									})
								}
							})
						})
					})
					.catch(() => {})
			} else if (type === 'break') {
				// 业务终止 orderStatusChangeBreak
				this.$confirm('是否终止该订单', '确认?', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				})
					.then(() => {
						orderStatusChangeBreak({ orderNo: this.$route.query.orderNo }).then(res => {
							this.$message({
								type: 'success',
								message: '终止成功',
								duration: 1000,
								onClose: () => {
									this.$emit('getInfo')
									this.$message({ message: '终止成功', type: 'success' })
								}
							})
						})
					})
					.catch(() => {})
			}
		},
		// 复制新窗口打开
		handleCopy() {
			console.log('🚀 ~ this.createItem', this.createItem)
			this.$confirm(`是否确认复制工作号: ${this.$route.query.orderNo} 委托单位：${this.createItem.main.custName} 的数据?`, '警告', {
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
						name: 'RailwayOrderDetail',
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
								closePage()
							}
						})
					})
				})
				.catch(err => {
					console.log('err')
				})
		},
		// 删除入仓单
		handleDeleteWh(row) {
			this.$confirm(`是否删除此入仓单?`, '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					inNoDelete({ orderNo: this.$route.query.orderNo, inNo: row.inNo }).then(res => {
						this.$message({
							type: 'success',
							message: '删除成功'
						})
						this.getRailBookList()
					})
				})
				.catch(err => {
					console.log('err')
				})
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

		refusePopClose(action) {
			this.refusePopShow = false
			if (action === 'Confirm') {
				this.$emit('getInfo')
			}
		},
		// 拒绝
		handleRefuse() {
			this.refusePopShow = true
		},

		getRailBookList() {
			railBookWhList({ orderNo: this.$route.query.orderNo }).then(res => {
				this.deliveryNoteList = res.data
			})
		},
		// 新建订单关闭回调
		createOrderPopClose(action, value) {
			this.createDeliveryNoteShow = false
			if (action === 'Confirm') {
				let data = { ...value, orderNo: this.$route.query.orderNo }
				railBookWhSave(data).then(res => {
					this.getRailBookList()
				})
			}
		},
		addDeliveryNote() {
			this.whRow = {}
			this.createDeliveryNoteShow = true
		},

		deleteCargos(index) {
			this.createItem.shipperList.splice(index, 1)
		},
		addCargos() {
			this.createItem.shipperList.push({
				shipperCustid: '',
				shipperCustName: '',
				quantity: '',
				weight: '',
				volume: '',
				cargoList: [
					{
						oid: '',
						commodityTypeCode: '',
						hscode: '',
						cname: '',
						ename: '',
						boxRemark: '无'
					}
				]
			})
		},

		// 更新委托单位
		updateCust() {
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
				orderData: this.createItem.main.bdRemark
			}).finally(res => {
				loading.close()
			})
		},
		// 切换目的港刷新相应的pricing的岗位信息
		updatePricing() {
			this.getOrderWork('updatePricing')
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
			let comOrderInfoHeight = document.getElementById('comOrderInfo') && document.getElementById('comOrderInfo').offsetHeight
			let navHeight = 64
			let alertHeight = document.getElementById('alertCont') && document.getElementById('alertCont').offsetHeight
			let bodyHeight = document.body.clientHeight
			this.shipInfoHeight = bodyHeight - alertHeight - navHeight - comOrderInfoHeight + 46
			this.checkPointHeight = bodyHeight - alertHeight - navHeight - comOrderInfoHeight
		},
		// 初始化
		init(data) {
			if (!data || !Object.keys(data).length) return
			let tempData = JSON.parse(JSON.stringify(data))
			// 甩柜，取消订单，协同，改船等弹窗默认关闭,目的港国家重置
			this.countryCode = ''
			let workAssignStr = Cookies.get('workAssignShow')
			this.workAssignShow = workAssignStr === '0' ? false : true
			// this.activityKey = 'Worker'
			this.activityKey = 'WorkerPricing'
			this.submitDisabled = false
			this.isOrderFeeCount = false
			sessionStorage.setItem('serviceCode', '')
			let { action, orderNo } = this.$route.query
			this.state = action === 'add' ? 'valid' : ''
			this.fillOrderInfo(tempData)
		},
		// 获取港口countryCode
		getCountryCode(val) {
			this.countryCode = val
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
			})
		},
		// 分配工作项
		getOrderWork(type) {
			let data = {
				orderNo: this.createItem.orderNo || this.$route.query.orderNo,
				sysLineCode: this.createItem.rail.sysLineCode,
				polPortCode: this.createItem.rail.polPortCode
			}
			let { jointWorkAssign, workAssign } = this.createItem
			console.log('🚀 ~ jointWorkAssign', jointWorkAssign)
			console.log('🚀 ~ workAssign', workAssign)
			if (this.isPricing) {
				// 商务
				orderWorkList({ orderNo: this.$route.query.orderNo }).then(res => {
					if (res.data) {
						this.isJoint = res.data.isJoint
						this.jointWorkAssignList = res.data.jointWorkAssignList.map(item => {
							return Object.assign(item, { show: true })
						})
						this.orgWorkAssignList = res.data.orgWorkAssignList.map(item => {
							return Object.assign(item, { show: true })
						})
					}
				})
			}
			if (this.$route.query.jointNo) {
				// 协同单详情
				this.jointWorkAssignList = jointWorkAssign.map(item => {
					return Object.assign(item, { show: true })
				})
				this.orgWorkAssignList = workAssign.map(item => {
					return Object.assign(item, { show: true })
				})
			} else {
				// 主单
				this.jointWorkAssignList = jointWorkAssign.map(item => {
					return Object.assign(item, { show: true })
				})
				this.orgWorkAssignList = workAssign.map(item => {
					return Object.assign(item, { show: true })
				})
				orderWork(data).then(res => {
					// 先取obd部门code，再取下单助理部门code最后再取bd部门code
					let findObdItem = res.data.find(item => item.jobCode === 'obd')
					let findAsstItem = res.data.find(item => item.jobCode === 'asst')
					let findBdItem = res.data.find(item => item.jobCode === 'bd')
					let obdDeptCode = findObdItem ? findObdItem.deptCode : ''
					let asstDeptCode = findAsstItem ? findAsstItem.deptCode : ''
					this.bdDeptCode = findBdItem ? findBdItem.deptCode : ''
					this.obdDeptCode = obdDeptCode ? obdDeptCode : asstDeptCode ? asstDeptCode : this.bdDeptCode 
					// 在这里获取pricing的职员信息
					let pricingItem = res.data && res.data.find(item => item.jobCode === 'pricing' && item.employeeId)
					if (workAssign.length) {
						this.orderWorkOptions = workAssign.map(item => {
							if (item.employeeId == 0) {
								item.employeeName = ''
							}
							// 修改目的地，系统航线会重新分配商务岗位人员。
							if (type === 'updatePricing' && pricingItem && item.jobCode === 'pricing') {
								item.employeeId = pricingItem.employeeId
								item.employeeName = pricingItem.employeeName
							}
							return Object.assign(item, { show: true })
						})
					} else {
						if (type === 'updatePricing') {
							this.orderWorkOptions =
								this.orderWorkOptions &&
								this.orderWorkOptions.map(item => {
									// 修改目的地，系统航线会重新分配商务岗位人员。
									if (pricingItem && item.jobCode === 'pricing') {
										item.employeeId = pricingItem.employeeId
										item.employeeName = pricingItem.employeeName
									}
									return { ...item }
								})
						} else {
							this.orderWorkOptions =
								res.data &&
								res.data.map(item => {
									return Object.assign(item, { show: true })
								})
						}
					}
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

		fillOrderInfo(data, type) {
			console.log('🚀 ~ data', data)
			if (data.rail && !data.rail.issueMode) {
				data.rail.issueMode = 'prompt'
			}
			let { custid, custName, custIntrustNo, businessType, serviceType, finCloseStatus, prefinCloseStatus } = data.main
			let { serviceInfoList, serviceList } = data
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
			let containerList = []
			if (data.containerList && data.containerList.length) {
				containerList = data.containerList.map(item => {
					item.containerNum = 1
					return item
				})
			} else {
				containerList = [
					{
						oid: '',
						containerType: '',
						containerNum: 1,
						cn: '',
						sn: '',
						po: '',
						packageInfo: '',
						quantity: '',
						weight: '',
						volume: '',
						unitWeight: ''
					}
				]
			}
			Object.assign(this.createItem, data, {
				shipperList:
					data.shipperList && data.shipperList.length
						? this.getCargoCustOptions(data.shipperList)
						: [
								{
									orderNo: this.$route.query.orderNo,
									shipperCustid: '',
									shipperCustName: '',
									quantity: '',
									weight: '',
									volume: '',
									cargoList: [
										{
											oid: '',
											commodityTypeCode: '',
											hscode: '',
											cname: '',
											ename: '',
											boxRemark: '无'
										}
									]
								}
						  ],
				rail: data.rail
					? data.rail
					: {
							vesselVoyage: '',
							porPortCode: '',
							polPortCode: '',
							podPortCode: '',
							podCountryCode: '',
							finalPodPortCode: '',
							outboundPortCode: '',
							sysLineCode: '',
							bookFileNo: '',
							etdTime: '',
							tdTime: '',
							inCutOffTime: '',
							blType: '',
							blMode: '',
							payMode: '',
							bkgAgentSupplierId: '',
							isExternal: '',
							bkgRemark: ''
					  },
				transport: data.transport
					? data.transport
					: {
							// 货运信息
							tradeTermsCode: '', // 贸易条款
							transportTerm: '', // 运输条款
							cargoReadyTime: '',
							customsType: '',
							shipper: '', // 发货人
							consignee: '', // 收货人
							notify1: '', // 通知人1
							notify2: '', // 通知人2
							notify3: '' // 通知人3
					  },
				containerList: containerList,
				checkPointList: data.checkPointList,
				workAssign: data.workAssign
			})

			this.createItem.overseasAgentIds = []
			if (data.main.overseasFirstAgentId) {
				this.createItem.overseasAgentIds.push(`${data.main.overseasFirstAgentId}####${data.main.overseasFirstAgentName}`)
			}
			if (data.main.overseasSecondAgentId) {
				this.createItem.overseasAgentIds.push(`${data.main.overseasSecondAgentId}####${data.main.overseasSecondAgentName}`)
			}
			this.quoteList=data.quoteList || []

			// 清除校验结果
			this.$nextTick(() => {
				this.$refs['orderSubmit'].clearValidate()
				let containerList = this.$refs['soContainer'].$refs['containerList']
				for (var i = 0; i < containerList.length; i++) {
					containerList[i].clearValidate()
				}
			})
			// 获取服务类型
			this.getBusinessType()
			// 获取服务项下拉
			this.getServiceTypes()
			// 获取so
			this.getBookSo()
			// 获取参与人
			this.getOrderWork()
			// 获取订舱协助审核人
			this.getJointAuditWork()
			// 获取协同岗位分配
			this.getJointWork()

			// 业务申请取消订单，订单有费用执行终止，无费用执行取消

			orderFeeCount({ orderNo: this.$route.query.orderNo }).then(res => {
				this.isOrderFeeCount = res.data.count > 0
				this.$store.dispatch('railway/setOrderFeeCount', this.isOrderFeeCount)
			})

			// 港口portCode,拼接成字符串，请求后台返回港口下拉数据做各个港口的反显
			if (data.rail) {
				let rail = { ...data.rail }
				this.showFinish = rail.bkgStatus === 'RAIL_ARRIVAL' ? true : false
				// this.showBkgRefuse = ['INIT', 'BOOKED'].includes(rail.bkgStatus) && this.$route.query.source === 'jointList'
				this.originBkgStatus = rail.bkgStatus

				this.createItem.rail.bkgStatus = rail.bkgStatus || 'INIT'
				let { polPortCode, podPortCode, porPortCode, finalPodPortCode } = rail
				let portCodeArr = []
				porPortCode ? portCodeArr.push(porPortCode) : ''
				polPortCode ? portCodeArr.push(polPortCode) : ''
				podPortCode ? portCodeArr.push(podPortCode) : ''
				finalPodPortCode ? portCodeArr.push(finalPodPortCode) : ''

				this.fillPortCodes = portCodeArr.toString()
				// 获取目的港countryCode
				if (this.createItem.rail.podPortCode) {
					this.$store
						.dispatch('dict/basePortListByCodes', {
							portCodes: this.createItem.rail.podPortCode
						})
						.then(data => {
							const portItem = data.find(item => item.portCode === this.createItem.rail.podPortCode)
							this.countryCode = portItem ? portItem.countryCode : ''
						})
					// 获取系统航线中文名称
					portSystemLineInfo(this.createItem.rail.podPortCode).then(res => {
						const systemLineList = res.data
						if (systemLineList && systemLineList.length) {
							this.sysLineCname = systemLineList[0].cname
							this.createItem.rail.sysLineCode = systemLineList[0].sysLineCode
						}
					})
				}
			}

			this.finCloseStatusCn = finCloseStatus === 'yes' ? '已关账' : prefinCloseStatus !== 'yes' ? '未关账' : '预关账'
			this.createItem.orderStatus = data.main.orderStatus
			this.createItem.serviceType = data.main.serviceType
			this.createItem.orderNo = data.main.orderNo
			this.order.orderNo = data.main.orderNo
			this.order.custid = data.main.custid
			this.order.custName = data.main.custName
			this.order.serviceList = data.main.serviceList
			this.order.serviceInfoList = data.main.serviceInfoList
			this.order.businessType = data.main.businessType
			this.finance.orderNo = data.main.orderNo
			this.finance.businessType = data.main.businessType
			this.finance.serviceType = data.main.serviceType
		},
		// 货物信息发货单位反显
		getCargoCustOptions(cargoList) {
			console.log('🚀 ~ cargoList', cargoList)
			let result = cargoList.map(item => {
				item.shipperCustid = item.shipperCustid || ''
				return { ...item, shipperCustidOptions: [{ label: item.shipperCustName, value: item.shipperCustid || '' }] }
			})
			return result
		},
		// 获取服务类型下拉
		getBusinessType() {
			baseBusinessList().then(res => {
				const { data } = res
				data.map(item => {
					// 该业务类型下的服务类型
					if (item.businessType === this.createItem.main.businessType) {
						this.serviceTypeOptions = item.serviceTypeList
					}
				})
			})
		},
		// 根据业务类型和服务类型查询服务项列表
		getServiceTypes() {
			const param = {
				businessType: this.createItem.main.businessType,
				serviceType: this.createItem.main.serviceType
			}
			const temp = []
			// 获取已完成的服务项
			const serviceInfoListStr = sessionStorage.getItem('serviceInfoListStr')
			const serviceInfoList = JSON.parse(serviceInfoListStr)
			const isFinishedArr = []
			serviceInfoList.map(item => {
				if (item.serviceStatus === 'finish' || item.isJoint === 'y') {
					isFinishedArr.push(item.serviceCode)
				}
			})
			// 服务项下拉数据处理
			baseBusinessServiceList(param).then(res => {
				const { data } = res
				data.map(item => {
					if (item.isDefault === 'y') temp.push(item.serviceCode)
					// 服务项处理:订舱，代理报关，已完成的服务项不可勾选
					if (item.serviceCode === 'book' || item.serviceCode === 'pol_declaration' || isFinishedArr.includes(item.serviceCode)) {
						item.disabled = true
					}
					// // 仓储，散车派送二选一;如果有被协同，则另一个服务项不可选
					// if (item.serviceCode === 'pod_warehouse' && isFinishedArr.includes('pod_ltl_delivery') || item.serviceCode === 'pod_ltl_delivery' && isFinishedArr.includes('pod_warehouse')) {
					// 	item.disabled = true
					// }
					// if (item.serviceCode === 'pol_warehouse' && isFinishedArr.includes('pol_ltl') || item.serviceCode === 'pol_ltl' && isFinishedArr.includes('pol_warehouse')) {
					// 	item.disabled = true
					// }
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

		// 返回订单列表
		handleGoBack() {
			sessionStorage.removeItem('createOrderStr')

			this.$router.push({
				name: 'RailwayOrderList'
			})
		},

		// 订单完成
		handleFinish() {
			this.submitDisabled = true
			shipOrderFinish({ orderNo: this.$route.query.orderNo })
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

		// 操作取消订单
		handleCancel(cancelType) {
			// 取消
			if (cancelType === 'cancel') {
				let msg = '该订单是否已产生费用，如已产生请去录入相关费用后再取消。'
				if (this.serviceIsJoint) {
					msg = '存在协同单，需协同单确认是否要取消协同，是否确定要发起取消？'
				}
				this.$confirm(msg, '是否取消该订单?', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				})
					.then(() => {
						return orderCancelHandle({
							orderNo: this.$route.query.orderNo,
							cancelType: cancelType
						})
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
						return orderCancelHandle({
							orderNo: this.$route.query.orderNo,
							cancelType: cancelType
						})
					})
					.then(response => {
						this.$emit('getInfo')
						this.$message({ message: '终止成功', type: 'success' })
					})
					.catch(err => {})
			}
		},

		// 提交
		handleSubmit() {
			this.handleSave('Submit')
		},

		// 操作编辑
		handleEdit() {
			this.submitDisabled = true
			let canSubmit = true
			let containerList = this.$refs['soContainer'].$refs['containerList']
			let shippersList = this.$refs['shippers'].$refs['containerList']
			// 有货物信息 发货单位必填
			let hasCargos = this.createItem.shipperList.some(
				item => !item.shipperCustid && (item.cargoList.some(subItem => subItem.hscode || subItem.cname || subItem.ename || subItem.commodityTypeCode) || item.quantity || item.weight || item.volume || item.packageInfo)
			)
			if (hasCargos) {
				this.submitDisabled = false
				canSubmit = false
				return this.$message.error('请填写发货单位!')
			}
			// 判断货物信息英文名称是否包含中文
			let hasChinese = this.createItem.shipperList.some(item => item.cargoList.some(subItem => /[\u4E00-\u9FA5\uFE30-\uFFA0]/.test(subItem.ename)))
			if (hasChinese) {
				this.submitDisabled = false
				canSubmit = false
				return this.$message.error('英文品名只能包含英文、数字、符号!')
			}
			this.$refs['orderSubmit'].validate(valid => {
				if (valid) {
					// 箱型箱量校验
					for (var i = 0; i < containerList.length; i++) {
						containerList[i].validate(isVaild => {
							if (isVaild) {
							} else {
								this.submitDisabled = false
								canSubmit = false
								toViewPosition('ship-cont', 80)
								this.$message.error('请按要求填写数据')
								console.log('error submit!!')

								return
							}
						})
					}
					for (var i = 0; i < shippersList.length; i++) {
						shippersList[i].validate(isVaild => {
							if (isVaild) {
							} else {
								this.submitDisabled = false
								canSubmit = false
								// 解决获取不到DOM问题
								this.$nextTick(() => {
									toViewPosition('ship-cont', 80)
									this.$message.error('请按要求填写数据')
								})
								console.log('error submit!!')

								return
							}
						})
					}
				} else {
					this.submitDisabled = false
					canSubmit = false
					toViewPosition('ship-cont', 80)
					this.$message.error('请按要求填写数据')
					console.log('error submit!!')

					return false
				}
			})
			// 设置参与人
			let workAssign = []
			if (this.$route.query.jointNo) {
				workAssign = JSON.parse(JSON.stringify(this.jointWorkAssignList))
			} else if (this.jointWorkAssignList.length > 0) {
				workAssign = JSON.parse(JSON.stringify(this.jointWorkAssignList))
			} else {
				workAssign = JSON.parse(JSON.stringify(this.createItem.workAssign))
			}
			workAssign = workAssign.map(item => {
				return {
					jobCode: item.jobCode,
					employeeId: item.employeeId ? item.employeeId : 0
				}
			})
			// 新增协同-主单参与人 v20220329
			let orgWorkAssignList = JSON.parse(JSON.stringify(this.orgWorkAssignList))
			let orgWorkAssign = orgWorkAssignList.map(item => {
				return {
					jobCode: item.jobCode,
					employeeId: item.employeeId ? item.employeeId : 0
				}
			})
			// 设置协同单号
			if (this.$route.query.jointNo) {
				// 协同列表跳过来
				this.createItem.jointNo = this.$route.query.jointNo
			}
			this.createItem.bkgStatus = this.createItem.rail.bkgStatus
			let outboundItem = this.dictMap.railOutboundPort.find(item => item.value === this.createItem.rail.outboundPortCode)
			this.createItem.rail.outboundPortName = outboundItem ? outboundItem.label : ''
			if (!canSubmit) return false

			let data = { ...this.createItem, ...{ workAssign: workAssign }, ...{ orgWorkAssign: orgWorkAssign } }
			// 保存或提交时都校验参与人
			console.log('🚀 ~ data', data)
			if (!this.workAssignValidateJoint(data)) {
				return (this.submitDisabled = false)
			}

			// 订单录入了“实际发车时间”，但订舱状态勾选的是“未订舱”或者“已订舱”或者“已放舱”，则保存成功，且自动将订舱状态变为“已发车”
			if (!!data.rail.tdTime && ['INIT', 'BOOKED', 'BOOK_RELEASE'].includes(data.bkgStatus)) data.bkgStatus = 'RAIL_DRIVING'
			// 若时间都有录入，但订舱状态未勾选“已到站”，则保存成功，且自动将订舱状态变为“已到站”
			if (!!data.rail.realArriveDate) data.bkgStatus = 'RAIL_ARRIVAL'
			if (!this.hasDestinationShow && this.createItem.orderStatus === 'pass') {
				console.log('没有勾选目的港服务项，可不填海外客服参与人和海外商务参与人')
				data.workAssign.map(item => {
					if (['ecs', 'epricing'].includes(item.jobCode)) {
						item.employeeId = 0
					}
					return item
				})
			}
			orderEdit(data)
				.then(res => {
					this.$message({
						type: 'success',
						message: '保存成功'
					})
					this.submitDisabled = false
					this.$emit('getInfo')
					// this.orderAuthCheck()
					// 	.then(() => {
					// 		this.$emit('getInfo')
					// 	})
					// 	.catch(() => {
					// 		closePage()
					// 	})
				})
				.catch(err => {
					setTimeout(() => {
						this.submitDisabled = false
					}, 2000)
				})
		},

		// 合并传参
		getValues() {
			// workAssign
			let orderWorkOptions = []

			// 服务项存在代订舱的清空，不传pricing的employeeId
			if (this.createItem.serviceList.includes('proxy_book')) {
				orderWorkOptions = this.orderWorkOptions.map(item => {
					const query = { ...item }
					if (query.jobCode === 'pricing') {
						query.employeeId = 0
					}
					return Object.assign({}, query)
				})
			} else {
				orderWorkOptions = [...this.orderWorkOptions]
			}
			const workArr = orderWorkOptions.map(item => {
				return {
					jobCode: item.jobCode,
					employeeId: item.employeeId ? item.employeeId : 0
				}
			})

			return {
				// bkgEmployeeId: this.createItem.bkgEmployeeId,
				orderNo: this.createItem.orderNo,
				serviceType: this.createItem.serviceType,
				intrustRemark: this.createItem.main.intrustRemark,
				auditRemark: this.createItem.main.auditRemark,
				payMode: this.createItem.payMode,
				serviceList: this.createItem.serviceList,
				rail: this.createItem.rail,
				containerList: this.createItem.containerList,
				shipperList: this.createItem.shipperList,
				transport: this.createItem.transport,
				workAssign: workArr,
				quoteList: this.quoteList
			}
		},
		// 合并传参 商务
		getValuesAudit() {
			// workAssign
			let orderWorkOptions = []

			// 服务项存在代订舱的清空，不传pricing的employeeId
			// if (this.createItem.serviceList.includes('proxy_book')) {
			// 	orderWorkOptions = this.orderWorkOptions.map(item => {
			// 		const query = { ...item }
			// 		if (query.jobCode === 'pricing') {
			// 			query.employeeId = 0
			// 		}
			// 		return Object.assign({}, query)
			// 	})
			// } else {
			// 	orderWorkOptions = [...this.orderWorkOptions]
			// }
			if (this.isJoint === 'Y') {
				orderWorkOptions = JSON.parse(JSON.stringify(this.jointWorkAssignList))
			} else {
				orderWorkOptions = JSON.parse(JSON.stringify(this.orderWorkOptions))
			}
			// 设置订舱人
			let bkgEmployeeItem = orderWorkOptions.find(item => item.jobCode === 'bkg')
			if (bkgEmployeeItem && bkgEmployeeItem.employeeId != 0) {
				this.createItem.bkgEmployeeId = bkgEmployeeItem.employeeId
				this.createItem.bkgEmployeeName = bkgEmployeeItem.employeeName
			}
			const workArr = orderWorkOptions.map(item => {
				return {
					jobCode: item.jobCode,
					employeeId: item.employeeId ? item.employeeId : 0
				}
			})

			return {
				bkgEmployeeId: this.createItem.bkgEmployeeId,
				orderNo: this.createItem.orderNo,
				serviceType: this.createItem.serviceType,
				intrustRemark: this.createItem.main.intrustRemark,
				auditRemark: this.createItem.main.auditRemark,
				payMode: this.createItem.payMode,
				serviceList: this.createItem.serviceList,
				rail: this.createItem.rail,
				containerList: this.createItem.containerList,
				shipperList: this.createItem.shipperList,
				transport: this.createItem.transport,
				workAssign: workArr,
				isJoint: this.isJoint
			}
		},

		// 操作编辑的传参
		getOpValues() {
			const opCargo = this.createItem.cargoList.map(item => {
				const obj = {}
				for (const i in this.opCargoItem) {
					obj[i] = item[i]
					if (i === 'shipperCustid') {
						if (!item[i]) obj[i] = 0
					}
				}
				return obj
			})

			const opSoGroup = []

			const obj = {}
			for (const i in this.opSizeItem) {
				obj[i] = this.createItem.containerList[0][i]
			}
			opSoGroup.push({
				soGroup: this.createItem.containerList[0].soGroup,
				...obj
			})

			// workAssign
			const workArr = this.orderWorkOptions.map(item => {
				return {
					jobCode: item.jobCode,
					employeeId: item.employeeId ? item.employeeId : 0
				}
			})

			return {
				orderNo: this.createItem.orderNo,

				rail: {
					tdTime: this.createItem.rail.tdTime,
					vessel: this.createItem.rail.vessel,
					voyage: this.createItem.rail.voyage,
					blMode: this.createItem.rail.blMode,
					blType: this.createItem.rail.blType,
					siCutOff: siCutOff ? `${siCutOff}:00:00` : '',
					vgmCutOff: vgmCutOff ? `${vgmCutOff}:00:00` : '',
					ccCutOff: ccCutOff ? `${ccCutOff}:00:00` : '',
					cvCutOff: cvCutOff ? `${cvCutOff}:00:00` : '',
					etdTime: this.createItem.rail.etdTime,
					podPortCode: this.createItem.rail.podPortCode,
					sysLineCode: this.createItem.rail.sysLineCode
				},
				transport: {},
				serviceList: this.createItem.serviceList,
				containerInfoList: opSoGroup,
				cargoList: opCargo,
				workAssign: workArr
			}
		},

		// 业务保存提交必填校验
		validate(data) {
			if (!data.serviceType) {
				this.$message.error('服务类型必填')
				return false
			}
			if (!data.rail.sysLineCode) {
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
			// 代订舱服务项不校验商务
			let noVerify = false
			if (data.serviceList.includes('proxy_book')) {
				noVerify = true
			}
			// 草稿订单不校验订舱人员
			let noBkgVerify = false
			if (this.createItem.orderStatus === 'draft' || this.createItem.orderStatus === 'refuse') {
				noBkgVerify = true
			}
			// 判断所选商务是否当前用户
			let pricingItem = workAssign.find(item => item.jobCode === 'pricing')
			let pricingId = pricingItem ? pricingItem.employeeId : ''
			let isSameId = pricingId == this.userId

			let isPricingBd = this.isBd && this.roles.includes('pricing')

			console.log(this.isNotRequiredWorker)
			// 海外应收eac也不校验,下单助理不需校验,  //&& !(item.jobCode === 'bkg')   必填
			let employeeIdValid = workAssign.some(
				item => !item.employeeId && !this.isNotRequiredWorker.includes(item.jobCode) && !(noVerify && item.jobCode === 'pricing') && !(item.jobCode === 'op')
			)
			// 获取参与人职业名称，拼接做非空提示
			let emptyTxtArr = []

			workAssign.map(item => {
				if (
					!item.employeeId &&
					!this.isNotRequiredWorker.includes(item.jobCode) &&
					!(noVerify && item.jobCode === 'pricing') &&
					!(item.jobCode === 'op')
				) {
					let findItem = this.orderWorkOptions.find(ele => ele.jobCode === item.jobCode)
					findItem.jobCname && emptyTxtArr.push(findItem.jobCname)
				}
			})
			// 商务下单时操作和订舱不能同时为空
			// if (isPricingBd && workAssign.some(item => item.jobCode === 'bkg' && !item.employeeId) && workAssign.some(item => item.jobCode === 'op' && !item.employeeId)) {
			// 	this.$message.error(`操作和订舱不能同时为空`)
			// 	return false
			// }
			let emptyTxtStr = emptyTxtArr.join('、')
			if (employeeIdValid) {
				this.$message.error(`${emptyTxtStr}参与人不能为空`)
				return false
			}
			return true
		},
		// 协同-协同参与人保存提交时校验
		workAssignValidateJoint(data) {
			// 不是协同 不验证
			if (this.isJoint != 'Y') {
				return true
			}
			let { workAssign } = data

			// 海外应收eac也不校验,下单助理不需校验,
			let employeeIdValid = workAssign.some(item => !item.employeeId && ['bkg', 'op'].includes(item.jobCode))
			// 获取参与人职业名称，拼接做非空提示
			let emptyTxtArr = []
			workAssign.map(item => {
				if (!item.employeeId && ['bkg', 'op'].includes(item.jobCode)) {
					let findItem = this.jointWorkAssignList.find(ele => ele.jobCode === item.jobCode)
					findItem && findItem.jobCname && emptyTxtArr.push(findItem.jobCname)
				}
			})

			let emptyTxtStr = emptyTxtArr.join('、')
			if (employeeIdValid) {
				this.$message.error(`${emptyTxtStr}参与人不能为空`)
				return false
			}
			return true
		},
		// 协同-主单参与人保存提交时校验
		workAssignValidateOrg(data) {
			let { workAssign } = data

			let employeeIdValid = workAssign.some(item => !item.employeeId && ['ecs', 'epricing'].includes(item.jobCode))
			// 获取参与人职业名称，拼接做非空提示
			let emptyTxtArr = []
			workAssign.map(item => {
				if (!item.employeeId && ['ecs', 'epricing'].includes(item.jobCode)) {
					let findItem = this.orgWorkAssignList.find(ele => ele.jobCode === item.jobCode)
					findItem && findItem.jobCname && emptyTxtArr.push(findItem.jobCname)
				}
			})

			let emptyTxtStr = emptyTxtArr.join('、')
			if (employeeIdValid) {
				this.$message.error(`${emptyTxtStr}参与人不能为空`)
				return false
			}
			return true
		},
		// 提交保存
		handleSave(type) {
			console.log('🚀 ~ this.createItem.containerList', this.createItem.containerList)
			let containerListOrigin = JSON.parse(JSON.stringify(this.createItem.containerList))
			this.createItem.containerList.map(item => {
				//遍历集装箱数组
				if (item.containerNum > 1) {
					//如果箱量大于1 拆分成多条数据
					item.oid = ''
					for (let index = 1; index < item.containerNum; index++) {
						containerListOrigin.push(item)
					}
				}
			})
			this.createItem.containerList = JSON.parse(JSON.stringify(containerListOrigin))
			if (this.createItem.rail.porPortCode && (this.createItem.rail.porPortCode == this.createItem.rail.podPortCode || this.createItem.rail.porPortCode == this.createItem.rail.finalPodPortCode)) {
				return this.$message.warning('目的站和最终目的地不能和收货地相同!')
			}
			if (this.createItem.rail.polPortCode && (this.createItem.rail.polPortCode == this.createItem.rail.podPortCode || this.createItem.rail.polPortCode == this.createItem.rail.finalPodPortCode)) {
				return this.$message.warning('目的站和最终目的地不能和起运站相同!')
			}
			let valiadte = false
			this.submitDisabled = true
			let canSubmit = true
			let { action, orderNo } = this.$route.query
			let containerList = this.$refs['soContainer'].$refs['containerList']
			let shippersList = this.$refs['shippers'].$refs['containerList']
			// 有货物信息 发货单位必填
			let hasCargos = this.createItem.shipperList.some(
				item => !item.shipperCustid && (item.cargoList.some(subItem => subItem.hscode || subItem.cname || subItem.ename || subItem.commodityTypeCode) || item.quantity || item.weight || item.volume || item.packageInfo)
			)
			if (hasCargos) {
				this.submitDisabled = false
				canSubmit = false
				return this.$message.error('请填写发货单位!')
			}
			// 判断货物信息英文名称是否包含中文
			let hasChinese = this.createItem.shipperList.some(item => item.cargoList.some(subItem => /[\u4E00-\u9FA5\uFE30-\uFFA0]/.test(subItem.ename)))
			if (hasChinese) {
				this.submitDisabled = false
				canSubmit = false
				return this.$message.error('英文品名只能包含英文、数字、符号!')
			}
				
			// 提交的时候才验证必填
			if (type === 'Submit') {
				this.$refs['orderSubmit'].validate(valid => {
					if (valid) {
						if (!this.validate(this.createItem)) {
							this.submitDisabled = false
							canSubmit = false
							return
						}
						// 箱型箱量校验
						for (var i = 0; i < containerList.length; i++) {
							containerList[i].validate(isVaild => {
								if (isVaild) {
								} else {
									this.submitDisabled = false
									canSubmit = false
									toViewPosition('ship-cont', 80)
									// this.$message.error('请按要求填写数据')
									console.log('error submit!!')
									return
								}
							})
						}
						for (var i = 0; i < shippersList.length; i++) {
							shippersList[i].validate(isVaild => {
								if (isVaild) {
								} else {
									this.submitDisabled = false
									canSubmit = false
									// 解决获取不到DOM问题
									this.$nextTick(() => {
										toViewPosition('ship-cont', 80)
										// this.$message.error('请按要求填写数据')
									})

									console.log('error submit!!')
									return
								}
							})
						}
					} else {
						this.submitDisabled = false
						canSubmit = false
						toViewPosition('ship-cont', 80)
						// this.$message.error('请按要求填写数据')
						console.log('error submit!!')
						return false
					}
				})
			}
			if (!canSubmit) {
				return this.$message.error('请按要求填写数据')
			}
			// 可提交
			if (canSubmit) {
				const data = this.getValues()
				
				let obdEmployee = data.workAssign.find(el=>el.jobCode==='obd')
				let asstEmployee = data.workAssign.find(el=>el.jobCode==='asst')
				let obdEmployeeId =obdEmployee?obdEmployee.employeeId:''
				let asstEmployeeId =asstEmployee?asstEmployee.employeeId:''
				if(obdEmployeeId&&asstEmployeeId){
					this.$message.error('销售助理(OBD)和下单助理不能同时选择')
					return (this.submitDisabled = false)
				}
				// 保存或提交时都校验参与人
				if (type === 'Submit' && !this.workAssignValidate(data)) {
					return (this.submitDisabled = false)
				}
				// 提交时校验未选中服务项
				if (type === 'Submit') {
					data.submitType = 'submit'
					if (!data.serviceList.length) {
						this.submitDisabled = false
						return this.$message({
							type: 'error',
							message: '请选择服务项',
							duration: 1000,
							onClose: () => {}
						})
					}
				} else {
					data.submitType = 'draft'
				}
        if (!this.hasDestinationShow && type === 'Submit') {
					console.log('没有勾选目的港服务项，可不填海外客服参与人和海外商务参与人')
					data.workAssign.map(item => {
						if (['ecs', 'epricing'].includes(item.jobCode)) {
							item.employeeId = 0
						}
						return item
					})
				}
				// 业务保存提交
				orderSave(data)
					.then(res => {
						this.$message({
							type: 'success',
							message: type === 'Submit' ? '提交成功' : '保存成功'
						})
						this.submitDisabled = false
						sessionStorage.removeItem('createOrderStr')
						this.$emit('getInfo')
						// this.orderAuthCheck()
						// 	.then(() => {
						// 		this.$emit('getInfo')
						// 	})
						// 	.catch(() => {
						// 		closePage()
						// 	})
					})
					.catch(err => {
						setTimeout(() => {
							this.submitDisabled = false
						}, 2000)
					})
			}
		},
		// 商务
		handleAudit(submitType) {
			if (this.createItem.rail.polPortCode == this.createItem.rail.podPortCode || this.createItem.rail.polPortCode == this.createItem.rail.finalPodPortCode) {
				return this.$message.warning('目的站和最终目的地不能和起运站相同!')
			}
			this.submitDisabled = true
			let canSubmit = true
			let { action, orderNo } = this.$route.query
			let containerList = this.$refs['soContainer'].$refs['containerList']
			let shippersList = this.$refs['shippers'].$refs['containerList']
			this.$refs['orderSubmit'].validate(valid => {
				if (valid) {
					if (!this.validate(this.createItem)) {
						this.submitDisabled = false
						canSubmit = false
						return
					}

					// 箱型箱量校验
					for (var i = 0; i < containerList.length; i++) {
						containerList[i].validate(isVaild => {
							if (isVaild) {
							} else {
								this.submitDisabled = false
								canSubmit = false
								toViewPosition('ship-cont', 80)
								this.$message.error('请按要求填写数据')
								console.log('error submit!!')
								return
							}
						})
					}
					for (var i = 0; i < shippersList.length; i++) {
						shippersList[i].validate(isVaild => {
							if (isVaild) {
							} else {
								this.submitDisabled = false
								canSubmit = false
								console.log('error submit!!')
								return
							}
						})
					}
				} else {
					this.submitDisabled = false
					canSubmit = false
					toViewPosition('ship-cont', 80)
					this.$message.error('请按要求填写数据')
					console.log('error submit!!')
					return false
				}
			})

			// 可提交
			if (canSubmit) {
				const data = this.getValuesAudit()

				// 保存或提交时都校验参与人
				if (!this.workAssignValidateJoint(data)) {
					return (this.submitDisabled = false)
				}
				data.submitType = submitType
				console.log('🚀 ~ data', data)

				// 业务保存提交
				railAuditPass(data)
					.then(res => {
						this.$message({
							type: 'success',
							message: submitType === 'save' ? '保存成功' : '审核成功'
						})
						this.submitDisabled = false
						sessionStorage.removeItem('createOrderStr')
						this.$emit('getInfo')
					})
					.catch(err => {
						setTimeout(() => {
							this.submitDisabled = false
						}, 2000)
					})
			}
		},

		handleClick(tab, event) {
			console.log('🚀 ~ tab', tab)
		},

		toggleWorkAssign() {
			this.workAssignShow = !this.workAssignShow
			const value = this.workAssignShow ? 1 : 0
			Cookies.set('workAssignShow', value)
		}
	}
}
</script>
<style lang="scss">
@import '../less/index.scss';
.railway-booking {
	margin-top: 6px;

	.railway-booking-status {
		padding: 10px;
		background: #fff;
		.el-radio-group {
			margin-left: 10px;
		}
		.el-radio,
		.el-radio__label {
			font-size: 12px;
		}
	}
	.delivery-note-wrap {
		margin-top: 10px;
		.railway-booking-btn {
			padding: 10px;
			background: #fff;
			display: flex;
			justify-content: flex-end;
		}
	}
}
.railway-add-cargo {
	padding-right: 10px;
	display: flex;
	justify-content: flex-end;
	margin-top: 10px;
}
.bdRemark-loading {
	.el-loading-spinner {
		margin-top: -10px;
		.el-icon-loading {
			font-size: 16px;
		}
	}
}
</style>
