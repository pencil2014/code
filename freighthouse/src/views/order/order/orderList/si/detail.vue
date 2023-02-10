<template>
	<div class="si-container" id="siContainer" @scroll="handleScroll" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
		<div id="alertCont">
			<el-alert type="warning" class="violet" v-if="showCancel">
				<template slot="title">
					<i class="tag-recall">取</i>
					<span class="txt">
						该订单已取消/终止，请注意!
					</span>
				</template>
			</el-alert>
			<el-alert type="warning" class="violet" v-else-if="showDelete">
				<template slot="title">
					<i class="tag-recall">删</i>
					<span class="txt">
						该提单已删除，请注意!
					</span>
				</template>
			</el-alert>
			<el-alert type="warning" class="violet" v-else-if="showBack">
				<template slot="title">
					<i class="tag-recall">撤</i>
					<span class="txt">
						该提单已撤回，请注意!
					</span>
				</template>
			</el-alert>
			<el-alert type="warning" class="red" v-if="detailData.dnCheckStatus === 'refuse'">
				<template slot="title">
					<i class="tag-cancel-red">拒</i>
					<span class="txt">
						该提单已审核拒绝，请及时修正
					</span>
				</template>
			</el-alert>
			<!-- 套约提示信息 -->
			<ContractTempPop :contractTempInfo="contractTempInfo" v-if="Object.keys(contractTempInfo).length" />
		</div>
		<div class="tab tab-flex">
			<el-tabs v-model="activityKey" @tab-click="tabClick">
				<el-tab-pane v-for="(item, index) in tabsList" :label="item.value" :name="item.key" :key="index"></el-tab-pane>
			</el-tabs>
			<div>
				<div class="el-button-group">
					<el-button size="mini" type="default" @click="handleBack" class="ml10">
						返回
					</el-button>
				</div>
				<div class="el-button-group ml10">
					<el-button size="mini" type="default" v-if="isSameAsDocAndCsc && detailData.siCheck === 'y' && detailData.copySiCheck === 'y' && orderDetailData.systemCode === 'CUST' && !['si_copy_confirmed', 'bl_put_finish'].includes(detailData.status)" @click="handleBlCopyConfirmPush()">
						推送客户确认copy件
					</el-button>
				</div>
				<template v-if="detailData.isCancel !== 'y'">
					<div class="el-button-group">
						<el-button
							:disabled="notDraftConfirm"
							size="mini"
							type="default"
							@click="handleTakeApply"
							v-if="detailData.siCheck === 'y' && detailData.copySiCheck === 'y' && detailData.obdCheck === 'y' && detailData.takeApplyStatus === 'draft'"
							class="ml10"
						>
							推送客服/放货
						</el-button>
						<!-- <el-button size="mini" type="default" @click="cancelTakeApply" v-if="detailData.takeApplyStatus === 'submit' && detailData.takeStatus != 'finish'" class="ml10">
							撤回取单申请
						</el-button> -->
					</div>
					<div class="el-button-group">
						<!-- <el-button size="mini" type="default" @click="handleCopyCheck" v-if="detailData.siCheck === 'y' && detailData.copySiCheck === 'y' && detailData.copyCheckStatus === 'draft'" class="ml10">
							copy件文件确认
						</el-button> -->
						<el-button :disabled="notDraftConfirm" size="mini" type="default" @click="handleTakeApplyConfirm" v-if="!isSameAsDocAndCsc && detailData.siCheck === 'y' && detailData.copySiCheck === 'y' && detailData.copyCheckStatus === 'draft'" class="ml10">
							copy件文件确认
						</el-button>
						<el-button :disabled="notDraftConfirm" size="mini" type="default" @click="cancelCopyCheck" v-if="!isSameAsDocAndCsc && detailData.copyCheckStatus === 'submit'" class="ml10">
							撤回推送文件确认
						</el-button>
					</div>
					<!-- <el-button size="mini" type="default" @click="handleDnCheck" v-if="detailData.siCheck === 'y' && detailData.copySiCheck === 'y' && detailData.dnGet === 'y' && detailData.dnCheckStatus !== 'pass'">商务签单</el-button> -->
				</template>
				<div class="el-button-group ml10">
					<el-button size="mini" type="primary" v-if="!showDelete || activityKey === 'Fee'" @click="handleSave()" :disabled="isDisableSave || notDraftConfirm">
						保存
					</el-button>
				</div>
				<div class="el-button-group ml10">
					<el-tooltip v-if="activityKey === 'Fee'" content="取消编辑费用">
						<el-button :disabled="notDraftConfirm" size="mini" type="default" @click="handleFee('cancel')">
							取消
						</el-button>
					</el-tooltip>
				</div>
				<!--  && isSiOnline && showOnlineBtn -->
				<div class="el-button-group" v-if="detailData.siCheck === 'n' && detailData.siCancel === 'n'">
					<el-button :disabled="notDraftConfirm" size="mini" type="warning" @click="handleBill" class="ml10">
						在线补料
					</el-button>
				</div>
				<div class="el-button-group" v-if="isRpaSi && canRpaSi">
					<el-button size="mini" type="primary" @click="handleRobot" class="ml10">
						RPA补料
					</el-button>
				</div>
			</div>
		</div>
		<div class="mtLine"></div>
		<div class="si-order-top" id="siOrderTop">
			<div class="top-item">工作号: {{ $route.query.orderNo }}</div>
			<div class="top-item-custInfo" v-if="custInfo.name">
				<entrustUnitComp :options="custInfo" />
			</div>
			<div class="top-item">提单状态: {{ getBlStatus() }}</div>
			<!-- <div class="top-item">在线补料状态: {{ getOnlineSiStatus() }}</div> -->
			<div class="bkgStatus online-status" v-if="onlineSiStatus">
				<span class="mr5">在线补料状态: </span>
				<span>{{ onlineSiStatus | onlineSiFilter }} </span>
				<el-popover placement="right" trigger="click">
					<el-table :data="onlineSiData" class="el-popover-table">
						<el-table-column align="center" property="status" label="状态" :formatter="statusFormatter"></el-table-column>
						<el-table-column align="center" property="businessNo" label="业务编号" :min-width="150" show-overflow-tooltip></el-table-column>
						<el-table-column align="center" property="so" label="SO号" :min-width="150" show-overflow-tooltip></el-table-column>
						<el-table-column align="center" fixed="right" label="操作" width="100">
							<template slot-scope="scope">
								<el-button @click="applyFn(scope.row)" type="text" size="mini">重新编辑</el-button>
							</template>
						</el-table-column>
					</el-table>
					<el-button :disabled="notDraftConfirm" size="mini" type="text" slot="reference">详情</el-button>
				</el-popover>
			</div>
		</div>
		<div v-if="detailData.jointNo && activityKey === 'Fee'" class="si-order-fee">
			<div class="top-item">协同单号: {{ detailData.jointNo }}</div>
			<div class="top-item">协同部门: {{ detailData.orgDeptName }}</div>
			<div class="top-item">SO号: {{ detailData.soInfo }}</div>
			<div class="top-item">提单号: {{ detailData.blNo }}</div>
		</div>
		<div class="mtLine"></div>
		<div class="si-detail-wrap">
			<div class="si-detail-left">
				<div class="si-status" id="siStatusCont">
					<span class="span-label">补料状态：</span>
					<span class="span-checkbox">
						<el-checkbox v-model="item.isChecked" :disabled="item.disabled || notDraftConfirm" @change="val => handleCheck(val, item)" v-for="(item, index) in siStatus" :key="index">
							{{ item.label }}
						</el-checkbox>
					</span>
				</div>
				<div class="mtLine"></div>
				<component
					:notDraftConfirm="notDraftConfirm"
					:ref="activityKey"
					:is="activityKey"
					:isCopySiCheck="isCopySiCheck"
					:createItem="createItem"
					:detailData="detailData"
					:orderDetailData="orderDetailData"
					:feeEmbed="true"
					:hideSaveCnlBtn="true"
					:hideNoBox="true"
				></component>
			</div>
			<div class="work-assign-cont ">
				<div class="work-assign-tit">参与人</div>
				<WorkJoint v-if="!!$route.query.jointNo" :checkPointHeight="workAssignHeight" :jointWorkAssignList="jointWorkAssignList" :orgWorkAssignList="detailData.workAssign" />
				<WorkAssign v-else :orderWorkOptions="detailData.workAssign" :workAssignHeight="workAssignHeight" />
			</div>
		</div>
		<!-- 取单申请弹窗 -->
		<div v-if="takeApplyShow">
			<TakeApply :detailData="detailData" @close="takeApplyPopClose" />
		</div>

		<!-- 商务签单弹窗 -->
		<div v-if="dnCheckShow">
			<DnCheck :detailData="detailData" @close="dnCheckPopClose" />
		</div>
		<!-- 导入账单弹窗 -->
		<ImportBill :blNo="detailData.blNo" @close="closeImportBill" :dialogOrderShow="dialogOrderShow" />
		<!-- COPY件文件确认 -->
		<TakeApplyConfirm @close="takeApplyPopCloseConfirm" :dialogOrderShow="takeApplyShowConfirm" />
		<!-- 推送客户copy件确认弹窗 -->
		<div v-if="custBlCopyPushPopShow">
			<CustBlCopyPushMail :custBlCopyPushQuery="detailData" :mailOnlyparam="copyMailOnlyparam" @close="custBlCopyPushPopClose" />
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { orderNopermInfo, orderJointInfo, orderJointNopermInfo } from '@/api/order/list'
import { carrierList, onlineSiNo } from '@/api/order/createBooking'
import { blSiInfo, blSiSave, blTakeApplyCancel, blCopyCancel } from '@/api/order/bl'
import Info from './components/siInfo'
import Bl from './components/bl'
import File from './components/file'
import Fee from '@/views/finance/orderFee/orderFee/index'
import Log from './components/log'
import TakeApply from './components/takeApply'
import TakeApplyConfirm from './components/takeApplyConfirm'
import DnCheck from './components/dnCheck'
import ImportBill from './components/importBill'
import ContractTempPop from '../../components/contractInfoPop'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { checkAuth } from '@/utils/checkAuth'
import WorkAssign from './components/workAssign'
import WorkJoint from './components/workJoint'
import { customerInfo } from '@/api/crm/supplier.js'
import { bookTempInfo } from '@/api/order/contract'
import CustBlCopyPushMail from '@/views/order/order/orderList/orderBook/components/custBlCopyPushMail'
import { checkAuthInfo } from '@/api/order/robotSi'

const defaultCreateQuery = {
	oid: 0,
	blId: '',
	orderNo: '',
	obdCheck: '',
	siCheck: '',
	copySiCheck: '',
	dnGet: '',
	dnFeeInput: '',
	blNo: '',
	tdTime: '',
	etaTime: '',
	etdTime: '',
	bargeTdTime: '',
	bargeEtdTime: '',
	vessel: '',
	voyage: '',
	bargeVessel: '',
	bargeVoyage: '',
	remark: ''
}
export default {
	mixins: [mixin, routerMixin],
	data() {
		return {
			jointWorkAssignList: [],
			showOnlineBtn: false, // 在线补料按钮显示状态
			copyFileItems: {},
			workAssignHeight: 0,
			dialogOrderShow: false,
			activityKey: 'Info',
			tabsList: [
				{
					key: 'Info',
					value: '补料详情'
				},
				{
					key: 'Bl',
					value: '提单'
				},
				{
					key: 'Fee',
					value: '费用'
				},
				{
					key: 'Log',
					value: '日志'
				}
			],
			// 补料状态复选框组
			siStatus: [
				{
					label: '船公司补料完成',
					key: 'siCheck',
					isChecked: false,
					value: 'n',
					disabled: false
				},
				{
					label: 'MBLcopy件单证确认',
					key: 'copySiCheck',
					isChecked: false,
					value: 'n',
					disabled: false
				},
				{
					label: '已收OBD提单',
					key: 'obdCheck',
					isChecked: false,
					value: 'n',
					disabled: false
				},
				{
					label: '已收船东账单',
					key: 'dnGet',
					isChecked: false,
					value: 'n',
					disabled: false
				},
				{
					label: '船东账单费用已录入',
					key: 'dnFeeInput',
					isChecked: false,
					value: 'n',
					disabled: false
				},
				{
					label: '船公司已取消',
					key: 'siCancel',
					isChecked: false,
					value: 'n',
					disabled: false
				}
			],
			createItem: Object.assign({}, defaultCreateQuery),
			detailData: {},
			orderDetailData: {}, // 订单详情数据
			takeApplyShow: false,
			takeApplyShowConfirm: false,
			dnCheckShow: false,
			isCopySiCheck: 'n', // BLcopy件单证确认单选框是否选中状态
			cTimestamp: 0,
			feeSaveSuccess: false,
			feeSaveError: false,
			feeSaveNoChange: false,
			isDisableSave: false,
			custInfo: {},
			contractTempInfo: {},
			onlineSiStatus: '',
			onlineSiData: [],
			custBlCopyPushPopShow: false,
			copyMailOnlyparam: {},
			canRpaSi: false,
		}
	},
	created() {
		this.cTimestamp = new Date().getTime()
		this.init()
		console.log('🚀 ~ init')
		this.checkAuthFee()
	},
	activated() {
		// let timestamp = new Date().getTime()
		// if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
		// 	this.activityKey = 'Info'
		// 	this.init()
		// }
		// 不请求接口拿不到是否取单完成状态 v20220329
		this.activityKey = 'Info'
		this.getOnlineSiNo()
		this.init()
		console.log('🚀 ~ init')
	},
	mounted() {
		this.$nextTick(() => {
			this.getShipInfoHeight()
		})
		// 窗口缩放时 计算参与人高度
		window.addEventListener('resize', this.getShipInfoHeight)
	},
	destroyed() {
		window.removeEventListener('resize', this.getShipInfoHeight)
	},
	computed: {
		...mapState({
			currRole: state => state.order.currRole,
			dictMap: state => state.dict.dictMap,
			feeSaveErrorCount: state => state.finance.feeSaveErrorCount,
			feeSaveSuccessCount: state => state.finance.feeSaveSuccessCount,
			userId: state => state.user.userId,
			roles: state => state.user.roles,
		}),
		isRpaSi() {
			return this.roles && this.roles.includes('rpa_si')
		},
		// 是否草单确认
		notDraftConfirm() {
			return this.detailData.isDraftConfirm != 'y'
		},
		showCancel() {
			return this.detailData.orderStatus === 'cancel' || this.detailData.orderStatus === 'break'
		},
		showDelete() {
			return this.detailData.state === 'invalid'
		},
		showBack() {
			return this.detailData.isCancel === 'y'
		},
		isSiOnline() {
			return this.$store.state.user.roles.includes('si_online')
		},
		isSiOnlineLeyu() {
			return this.$store.state.user.roles.includes('si_online_leyu')
		},
		isSameAsDocAndCsc() {
			let findItem = this.detailData.workAssign.find(item => item.jobCode === 'doc')
			let docId = findItem ? findItem.employeeId : ''
			return this.userId === docId
		}
	},
	watch: {
		feeSaveSuccessCount(newVal, oldVal) {
			if (newVal - oldVal === 1) {
				this.feeSaveNoChange = true
			} else if (newVal - oldVal === 2) {
				this.feeSaveSuccess = true
			}
		},
		feeSaveErrorCount(newVal, oldVal) {
			this.feeSaveError = true
		}
	},
	components: {
		Info,
		Bl,
		File,
		Fee,
		Log,
		TakeApply,
		TakeApplyConfirm,
		DnCheck,
		ImportBill,
		WorkAssign,
		WorkJoint,
		ContractTempPop,
		CustBlCopyPushMail
	},
	methods: {
		handleBlCopyConfirmPush() {
			// 获取文件参与人
			let findItem = this.detailData.workAssign.find(item => item.jobCode === 'doc')
			let employeeId = findItem ? findItem.employeeId : ''
			this.copyMailOnlyparam = {
				employeeId
			}
			this.custBlCopyPushPopShow = true
		},
		custBlCopyPushPopClose(action, values) {
			this.custBlCopyPushPopShow = false
			if (action === 'Confirm') {
				this.getDetail()
			}
		},
		handleScroll() {
			if (this.activityKey === 'Bl') {
				this.$refs.Bl.handleScroll()
			}
		},
		checkAuthInfoData() {
      if (!this.isRpaSi) return
			let { ship } = this.orderDetailData
			ship = ship || {}
			checkAuthInfo({
        shipCarrierCode: ship.shipCarrierCode,
        serviceLine: ship.serviceLine
      }).then(res => {
        if (res.data) {
					this.canRpaSi = true
				} else {
					this.canRpaSi = false
				}
			})
		},
		handleRobot() {
			let { ship } = this.orderDetailData
			ship = ship || {}
			let routeUrl = this.$router.resolve({
				name: 'RobotPacking',
				query: {
					orderNo: this.detailData.orderNo,
					shipCarrierCode: ship.shipCarrierCode,
					so: this.detailData.soInfo,
					blNo: this.detailData.blNo,
					blId: this.detailData.blId,
					siOid: this.detailData.oid,
				}
			})
			window.open(routeUrl.href, '_blank')
		},
		// 获取在线状态、编号及so号
		getOnlineSiNo() {
			let data = {
				orderBlId: this.$route.query.blId
			}
			onlineSiNo(data)
				.then(res => {
					if (res.code === 0) {
						let source = res.data || []
						if (source.length) {
							this.onlineSiStatus = source[0].status //状态拿第一个
							this.onlineSiData = source
						}
					}
				})
				.catch(() => {})
		},
		statusFormatter(val) {
			let { status } = val
			return getDictLabel('onlineSiStatus', status) || '--'
		},
		// 获取船司列表
		getCarrierList(str = '') {
			let shipCarrierCode = this.detailData.shipCarrierCode
			carrierList({ keyword: str, type: 'si', baseCarrierCode: shipCarrierCode })
				.then(res => {
					if (res.code === 0) {
						if (res.data) {
							let arrCode = res.data.map(item => item.baseCarrierCode) || []
							let carrierSource = res.data.map(item => item.carrierSource) || []
							arrCode = Array.from(new Set(arrCode))
							this.showOnlineBtn = arrCode.includes(shipCarrierCode)
							if (carrierSource.includes('leyu') && this.showOnlineBtn) {
								this.showOnlineBtn = this.isSiOnlineLeyu
							}
						}
					}
				})
				.catch(() => {})
		},
		cancelCopyCheck() {
			blCopyCancel({ orderNo: this.$route.query.orderNo, blId: this.$route.query.blId }).then(res => {
				this.$message.success('撤回推送文件确认成功!')
				this.getDetail()
				// 提单模块，重新请求提单列表数据
				if (this.activityKey === 'Bl') {
					this.$refs.Bl.$refs.blList.getBlList()
				}
			})
		},
		cancelTakeApply() {
			blTakeApplyCancel({ orderNo: this.$route.query.orderNo, blId: this.$route.query.blId }).then(res => {
				this.$message.success('撤回取单申请成功!')
				this.getDetail()
			})
		},
		// 去补料
		handleBill() {
			let routeUrl = this.$router.resolve({
				name: 'Packing',
				query: {
					orderNo: this.$route.query.orderNo,
					blId: this.$route.query.blId,
					isBasedFile: this.detailData.isBasedFile,
					carrierCode: this.detailData.shipCarrierCode
				}
			})
			window.open(routeUrl.href, '_blank')
		},
		// 重新编辑
		applyFn(row) {
			let { shipmentId } = row
			let routeUrl = this.$router.resolve({
				name: 'Packing',
				query: {
					orderNo: this.$route.query.orderNo,
					blId: this.$route.query.blId,
					isBasedFile: 'n',
					carrierCode: this.detailData.shipCarrierCode,
					shipmentId
				}
			})
			window.open(routeUrl.href, '_blank')
		},
		getShipInfoHeight() {
			let bodyHeight = document.body.clientHeight
			let offsetTop = document.querySelector('.si-detail-wrap .si-detail-left').getBoundingClientRect().top
			this.workAssignHeight = bodyHeight - offsetTop - 44
			console.log('bodyHeight', bodyHeight, offsetTop)
		},
		getBlStatus() {
			return getDictLabel('woBlStatus', this.detailData.blStatus)
		},
		getOnlineSiStatus() {
			return getDictLabel('onlineSiStatus', this.detailData.onlineSiStatus)
		},
		closeImportBill() {
			this.dialogOrderShow = false
		},

		// 初始化
		init() {
			this.isCopySiCheck = 'n'
			this.createItem = Object.assign({}, defaultCreateQuery)
			this.getDetail()
			this.getOrderInfo()
			this.getContractInfo()
			setTimeout(() => {
				this.checkAuthInfoData()
			}, 800)
		},
		// 获取套约模板
		getContractInfo() {
			bookTempInfo({ orderNo: this.$route.query.orderNo }).then(res => {
				this.contractTempInfo = res.data || {}
			})
		},
		// 获取订单详情
		getOrderInfo() {
			//获取协同单信息
			if (this.$route.query.jointNo) {
				orderJointNopermInfo({ jointNo: this.$route.query.jointNo, orderNo: this.$route.query.orderNo }).then(res => {
					console.log('🚀 ~ res', res)
					let { data } = res
					if (data) {
						this.orderDetailData = data
						data.custid && this.getCustInfo(data.custid)
						this.jointWorkAssignList = data.jointWorkAssign.map(item => {
							item.show = true
							item.disabled = true
							// 单证可以修改
							if (item.jobCode === 'csc') {
								item.disabled = false
							}
							return item
						})
						// console.log('🚀 ~ res.data.workAssign', res.data.workAssign)

						// console.log('🚀 ~ detailData.workAssign', this.detailData.workAssign)
					}
				})
			} else {
				orderNopermInfo({ orderNo: this.$route.query.orderNo }).then(res => {
					let { data } = res
					this.orderDetailData = data
					data.custid && this.getCustInfo(data.custid)
				})
			}
		},
		getCustInfo(custid) {
			customerInfo({ custid }).then(res => {
				if (res.data) {
					this.custInfo = { ...res.data, isJoint: !!this.$route.query.jointNo, compDeptName: this.orderDetailData.compDeptName }
				}
			})
		},
		// 获取详情
		getDetail() {
			this.lsLoading = true
			let data = {
				oid: this.$route.query.oid,
				orderNo: this.$route.query.orderNo
			}
			// 有协同单号带上协同单号参数
			if (this.$route.query.jointNo) {
				data.jointNo = this.$route.query.jointNo
			}
			blSiInfo(data).then(res => {
				for (var i in defaultCreateQuery) {
					this.createItem[i] = res.data[i]
				}
				let cancelEmployeeName = ''
				this.detailData = { ...res.data }
				// 获取支持在线补料船公司
				this.getCarrierList()
				console.log('详情数据：', this.detailData)
				this.detailData.workAssign.forEach(item => {
					item.show = true
					item.disabled = true
					// 获取撤回人
					if (item.jobCode === 'doc') {
						cancelEmployeeName = item.employeeName
					}
					// 单证可以修改
					if (item.jobCode === 'csc') {
						item.disabled = false
					}
				})
				Object.assign(this.detailData, { cancelEmployeeName })
				this.siStatus.forEach(item => {
					item.value = res.data[item.key]
					// 补料状态保存过后的不能修改
					if (res.data[item.key] === 'y') {
						item.isChecked = true
						item.disabled = true
					} else {
						item.isChecked = false
						item.disabled = false
					}
				})
				//在提单删除或者订单取消/终止时显示可用
				this.siStatus[5].disabled = !(this.showDelete || this.showCancel || this.showBack)
				if (this.showDelete || this.showCancel || this.showBack) {
					for (let i = 0; i < 5; i++) {
						this.siStatus[i].disabled = true
					}
				}
				// 船东账单费用已录入 一直可用--anliang v20220510
				this.siStatus[4].disabled = false
				//请求附件列表数据
				this.$refs.Info && this.$refs.Info.$refs.fileList.getFileList()
			}).finally(() => {
				this.lsLoading = false
			})
		},
		// 点击tab切换
		tabClick(key) {},
		// 勾选补料状态
		handleCheck(val, item) {
			if (val) {
				item.value = 'y'
			} else {
				item.value = 'n'
			}
			// 选中OBD提单确认
			if (item.key === 'obdCheck') {
				this.isCopySiCheck = val ? 'y' : 'n'
			}
		},
		getSiStatus() {
			let statusObj = {}
			this.siStatus.map(item => {
				statusObj[item.key] = item.value
			})
			return statusObj
		},
		// copy件文件确认
		handleCopyCheck() {
			this.$confirm('是否将MBLcopy件提交给文件确认?', 'copy件确认', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					return this.handleSave('copy')
				})
				.catch(() => {})
		},
		// 商务签单弹窗
		handleDnCheck() {
			this.dnCheckShow = true
		},
		// 商务签单弹窗关闭回调
		dnCheckPopClose(action, value) {
			if (action === 'Confirm') {
				this.handleSave('sign', value)
			} else {
				this.dnCheckShow = false
			}
		},
		// 申请取单弹窗
		handleTakeApply() {
			this.takeApplyShow = true
		},
		// COPY件文件确认
		handleTakeApplyConfirm() {
			this.takeApplyShowConfirm = true
		},
		//申请取单弹窗关闭回调
		takeApplyPopClose(action, value) {
			if (action === 'Confirm') {
				this.handleSave('takeApply', value)
			} else {
				this.takeApplyShow = false
			}
		},
		//文件确认弹窗关闭回调
		takeApplyPopCloseConfirm(action, value) {
			console.log('🚀 ~ action', action)
			if (action === 'Confirm') {
				console.log('🚀 ~ value', value)
				this.copyFileItems = value
				return this.handleSave('copy')
			}
			this.takeApplyShowConfirm = false
		},
		validate() {
			if (!this.createItem.blNo) {
				this.$message({ type: 'error', message: '请输入提单号' })
				return false
			}
			if (!this.orderDetailData.barge && !this.createItem.tdTime) {
				this.$message({ type: 'error', message: '请选择大船实际开船时间' })
				return false
			}
			if (!this.createItem.etdTime) {
				this.$message({ type: 'error', message: '请选择大船预计开船时间' })
				return false
			}
			if (!this.createItem.etaTime) {
				this.$message({ type: 'error', message: '请选择预计到港时间' })
				return false
			}
			if (this.orderDetailData.barge && !this.createItem.bargeTdTime) {
				this.$message({ type: 'error', message: '请选择驳船实际开船时间' })
				return false
			}
			if (this.orderDetailData.barge && !this.createItem.bargeEtdTime) {
				this.$message({ type: 'error', message: '请选择驳船预计开船时间' })
				return false
			}

			if (!this.orderDetailData.barge && !this.createItem.vessel) {
				this.$message({ type: 'error', message: '请输入船名' })
				return false
			}
			if (!this.orderDetailData.barge && !this.createItem.voyage) {
				this.$message({ type: 'error', message: '请输入航次' })
				return false
			}
			if (this.orderDetailData.barge && !this.createItem.bargeVessel) {
				this.$message({ type: 'error', message: '请选择驳船船名' })
				return false
			}
			if (this.orderDetailData.barge && !this.createItem.bargeVoyage) {
				this.$message({ type: 'error', message: '请选择驳船航次' })
				return false
			}
			return true
		},
		// 保存
		handleSave(type, value) {
			this.isDisableSave = true
			setTimeout(() => {
				this.isDisableSave = false
			}, 900)
			if (this.activityKey === 'Fee') {
				// 在补料详情里，点击顶部的“费用”tab切换到费用录入列表，此时需自动更新“船东费用单的商务审核状态”-放开
				this.handleFee('save')
					.then(res => {
						this.handleSaveEntity(type, value)
					})
					.catch(error => {
						console.log(error)
					})
			} else {
				this.handleSaveEntity(type, value)
			}
		},
		handleSaveEntity(type, value) {
			// 获取补料状态参数
			let statusQuery = this.getSiStatus()
			let otherQuery = {}
			// 申请取单参数
			if (type === 'takeApply') {
				otherQuery = {
					takeApplyStatus: 'submit',
					takeEmployeeId: value.takeEmployeeId,
					putEmployeeId: value.putEmployeeId
				}
			}
			// 商务签单参数
			if (type === 'sign') {
				otherQuery = {
					dnCheckStatus: 'submit',
					dnCheckApplyRemark: value.dnCheckApplyRemark,
					pricingEmployeeId: value.pricingEmployeeId
				}
			}
			// COPY件文件确认参数
			if (type === 'copy') {	
				otherQuery = {
					copyCheckStatus: 'submit',
					copyCutDate: this.copyFileItems.copyCutDate,
					copyRemark: this.copyFileItems.copyRemark
				}
			}
			let data = Object.assign({}, this.createItem, statusQuery, otherQuery)
			if (this.isCopySiCheck === 'y' && !this.validate()) return
			this.blSiSave(data, type)
		},
		handleFee(type) {
			return new Promise((resolve, reject) => {
				let Fee = this.$refs.Fee
				let oneFee = ''
				Fee.$children[0] &&
					Fee.$children[0].$children.forEach(item => {
						if (item.active) {
							oneFee = item.$children[0]
						}
					})
				if (type === 'cancel') {
					return oneFee.handleCancel()
				}
				if (type === 'save' && oneFee.handleSave) {
					oneFee.handleSave()
					let interval1 = setInterval(() => {
						if (this.feeSaveSuccess || this.feeSaveNoChange) {
							resolve()
							clearInterval(interval1)
						} else if (this.feeSaveError) {
							reject('Error')
							clearInterval(interval1)
						}
						// 重置
						this.feeSaveSuccess = false
						this.feeSaveError = false
					}, 200)
				} else {
					resolve()
				}
			})
		},
		blSiSave(data, type) {
			//新增参数 cscEmployeeId
			let employee = this.detailData.workAssign.find(item => item.jobCode === 'csc')
			// 如果是协同单 取协同参与人中的单证 20220308
			if (this.$route.query.jointNo) {
				employee = this.jointWorkAssignList.find(item => item.jobCode === 'csc')
				data.jointNo = this.$route.query.jointNo
			}
			data.cscEmployeeId = (employee && employee.employeeId) || ''
			blSiSave(data).then(res => {
				// 非费用模块或费用模块费用未有数据改变的保存，显示提示语
				if (this.activityKey !== 'Fee' || this.feeSaveNoChange) {
					this.$message({
						message: type === 'copy' ? 'copy件文件确认提交成功' : type === 'sign' ? '签单签单提交成功' : type === 'takeApply' ? '推送客服/放货成功' : '保存成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							this.dnCheckShow = false
							this.takeApplyShow = false
							this.takeApplyShowConfirm = false
						}
					})
				} else {
					// 订单费用里面已显示提示语，费用模块不显示提示语
					this.dnCheckShow = false
					this.takeApplyShow = false
				}
				this.getDetail()
				this.getOrderInfo()
				// 提单模块，重新请求提单列表数据
				if (this.activityKey === 'Bl') {
					this.$refs.Bl.$refs.blList.getBlList()
				}
			})
		},
		// 返回
		handleBack() {
			this.$router.push({
				name: 'SiList'
			})
		},
		checkAuthFee() {
			if (!checkAuth('SiDetailFee')) {
				this.tabsList.splice(
					this.tabsList.findIndex(item => {
						return item.key === 'Fee'
					}),
					1
				)
			}
		}
	},
	filters: {
		onlineSiFilter(val) {
			return getDictLabel('onlineSiStatus', val) || '--'
		}
	}
}
</script>
<style lang="scss">
.si-detail-wrap {
	display: flex;
	background: #f5f7f9;
	.si-detail-left {
		flex: 1;
		overflow: hidden;
		background: #fff;
	}
	.work-assign-cont {
		flex-shrink: 0;
		width: 150px;
		background: #fff;
		margin-left: 10px;
		// height: 760px;
		// overflow-y: auto;
	}

	.work-assign-cont .work-assign-tit {
		font-weight: bold;
		line-height: 32px;
		border-bottom: 1px solid #e0e0e0;
		padding-left: 10px;
	}
}
.si-order-top {
	background-color: #fff;
	display: flex;
	padding: 10px;
	.top-item {
		width: 25%;
	}
	.top-item-custInfo {
		width: 50%;
		overflow: hidden;
		white-space: nowrap;
		display: inline-block;
		// text-overflow: ellipsis;
	}
}
.si-order-fee {
	display: flex;
	padding: 0 10px;
	.top-item {
		width: 25%;
	}
}
.si-container {
	// background-color: #fff;
	margin: 10px 0 0 16px;
	height: calc(100vh - 40px);
	overflow-y: auto;
	// overflow: hidden;
}
.si-container .tab {
	background-color: #fff;
	padding: 0 10px;
	height: 40px;
	line-height: 40px;
	display: flex;
	justify-content: space-between;
}
.si-container .tab .el-tabs__nav-wrap::after {
	height: 0px;
}
.si-container .si-status {
	padding: 0 10px;
	// height: 40px;
	line-height: 40px;
	display: flex;
	.span-label {
		width: 72px;
	}
	.span-checkbox {
		flex: 1;
	}
}
.si-container .mtLine {
	height: 8px;
	background-color: #f5f7f9;
}
.si-container .tab .el-button-group {
	margin-top: 5px;
}
.si-container .si-status .el-checkbox .el-checkbox__label {
	font-size: 12px;
}
.si-container .el-button--mini {
	padding: 0px 8px;
	height: 20px;
}
.si-container .el-form-item__label,
.si-container .el-form-item__content,
.si-container {
	line-height: 20px;
}
.el-input--mini .el-input__inner {
	line-height: 20px;
	height: 20px;
}
.si-container .el-input--mini .el-input__icon {
	line-height: 20px;
}
.el-popover-table {
	max-height: 200px;
	overflow: auto;
}
</style>
