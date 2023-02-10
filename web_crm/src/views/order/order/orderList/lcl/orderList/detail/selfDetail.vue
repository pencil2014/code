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
				@updateCust="updateCust"
			>
				<div class="operateBtn-group">
					<div class="btn-groups">
						<!-- 散货操作 -->
						<div class="el-button-group">
							<!-- <el-button size="mini" type="default" @click="handleGoBack()" :disabled="submitDisabled">返回</el-button> -->
							<el-button
								v-if="$route.query.orderNo"
								type="primary"
								size="mini"
								@click="handleExportPlan"
								class="btn-save"
								>
								输出计划单
							</el-button>
						</div>
					</div>
					<div class="status">
						<span class="label">订单状态</span>
						<span class="value" :class="createItem.orderStatus === 'complete' || createItem.orderStatus === 'pass' ? 'green' 
							: createItem.orderStatus === 'submit' ? 'yellow' 
							: ['refuse','cancel','break'].includes(createItem.orderStatus) ? 'red' 
							: 'black'">
							<i></i>{{ orderStatusFilter(createItem.orderStatus, $route.query.action) }}
						</span>
						<span class="label ml10">关账状态</span>
						<span class="value" :class="finCloseStatusCn === '已关账' ? 'green' : finCloseStatusCn === '预关账' ? 'blue' : 'black'"><i></i>{{ finCloseStatusCn }}</span>
					</div>
				</div>
			</ComOrderInfo>
			<div class="order-cont">
				<el-form ref="orderSubmit" :model="createItem" :rules="rules" class="order-cont-form lcl-form">
					<!-- 基本信息 -->
					<div class="ship-cont" ref="shipInfoCont" :class="workAssignShow ? 'abs-toogle' : ''" :style="{ height: `${shipInfoHeight}px` }">
						<div class="toggleWorkAssign" @click="toggleWorkAssign">
							<i class="hamburger el-icon-arrow-right" :class="{ 'is-active': true }"></i>
						</div>
						<h1>基本信息</h1>
						<OrderBookInfo
							:createItem="createItem"
							:fillPolData="fillPolData"
							:fillPortCodes="fillPortCodes"
							:sysLineCname="sysLineCname"
							:orderStatus="createItem.orderStatus"
							ref="orderBookInfo"
							@getCountryCode="getCountryCode"
						/>
						<!-- 货物信息 -->
						<div class="row-cont mt0">
							<div class="row-cont-tit">
								<span class="tit">货物信息</span>
							</div>
							<Cargo :createItem="createItem" :orderStatus="createItem.orderStatus" :countryCode="countryCode" ref="cargo" />
						</div>
						<!-- 附件信息 -->
						<FileList 
							:fileListData="fileListData" 
							:fileTypeOptions="fileTypeOptions" 
							:fileType="fileType" 
							:fileAddText="'添加入舱单'" 
							:orderStatus="createItem.orderStatus"
							:source="'selfDetail'" />
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
							:orderWorkOptions="orderWorkOptions"
							:obdDeptCode="obdDeptCode"
							v-if="createItem.orderNo"
							:checkPointHeight="checkPointHeight"
							:jointAuditWorkData="jointAuditWorkData"
							:jointWorkData="jointWorkData"
						></component>
					</div>
				</el-form>
			</div>
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import Cookies from 'js-cookie'
import { getDictLabel } from '@/utils/tools'
import { handleExportPlanCommon } from '@/utils/orderCommonMethod'
import ComOrderInfo from '../../components/comOrderInfo'
import OrderBookInfo from '../../components/orderBookInfo'
import FileList from '../../components/fileList'
import Cargo from '../../components/cargo'
import Worker from '@/views/order/order/orderList/components/worker'
import CheckPoint from '@/views/order/order/orderList/components/checkPoint'
import { baseBusinessList, baseBusinessServiceList, portSystemLineInfo } from '@/api/base'
import {
	orderInfo,
	orderJointInfo,
	lclSelfSave,
	lclEdit,
	orderWork,
	orderCancelHandle,
	orderCopy,
	orderFinish,
	whBookFileList,
	orderClose,
	orderSubmitCancel,
	jointAuditWork,
	jointWork
} from '@/api/order/list'

export default {
	filters: {},
	data() {
		return {
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
					whPoNo: '',
					intrustRemark: ''
				}
			),
			rules: {
			},
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
			// 港口反显数据
			fillPolData: {},
			orderWorkOptions: [],
			fillPortCodes: '',
			submitDisabled: false,
			isOrderFeeCount: false, // 是否有费用
			serviceTypeOptions: [], // 服务类型下拉
			serviceCodeOptions: [], // 服务项下拉
			businessTypeOptions: [], // 业务类型数组
			sysLineCname: '', // 系统航线中文名称
			fileListData: [],
			fileTypeOptions: [
				{ label: '入舱单', value: 'wh_po', disabled: true }
				// {label: '入舱核实单文件', value: 'wh_check'}
			],
			fileType: 'wh_po',
			jointAuditWorkData: {},
			jointWorkData: [],
			finCloseStatusCn: '',
			obdDeptCode: '',	// obd部门code
		}
	},
	created() {
		this.init(this.orderInfo)
		this.getFileList()
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
		...mapState({
			dictMap: state => state.dict.dictMap,
			currRole: state => state.order.currRole,
			order: state => state.order,
			finance: state => state.finance,
			orderList: state => state.order.orderList
		}),
		isAc() {
			return this.currRole === 'ac'
		},
    isDoc() {
			return this.currRole === 'doc'
		},
		isOp() {
			return this.currRole === 'op'
		},
		isBd() {
			return this.currRole === 'bd' || this.currRole === 'obd'
		},
		addState() {
			return !this.createItem.ship
		},
		copyState() {
			return this.$route.query.action === 'copy'
		},
		viewState() {
			return this.$route.query.action === 'view' || this.createItem.orderStatus !== 'draft'
		}
	},
	components: {
		ComOrderInfo,
		OrderBookInfo,
		FileList,
		Cargo,
		Worker,
		CheckPoint,
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
			this.shipInfoHeight = bodyHeight - alertHeight -navHeight - comOrderInfoHeight
			this.checkPointHeight = bodyHeight - alertHeight -navHeight - comOrderInfoHeight -46
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
			this.isOrderFeeCount = false
			sessionStorage.setItem('serviceCode', '')
			let { action, orderNo } = this.$route.query
			this.state = action === 'add' ? 'valid' : ''
			console.log('init', tempData)
			this.fillOrderInfo(tempData)
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
			let { workAssign } = this.createItem
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
				let bdDeptCode = findBdItem ? findBdItem.deptCode : ''
				this.obdDeptCode = obdDeptCode ? obdDeptCode : asstDeptCode ? asstDeptCode : bdDeptCode
				if (workAssign.length) {
					this.orderWorkOptions = workAssign.map(item => {
						return Object.assign(item, { show: true })
					})
				} else {
					this.orderWorkOptions = res.data.map(item => {
						return Object.assign(item, { show: true })
					})
				}
			})
		},
		fillOrderInfo(data, type) {
			let { barge, custid, custName, custIntrustNo, businessType, serviceType, serviceList, serviceInfoList, finCloseStatus, prefinCloseStatus } = data
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
				ship: data.ship ? data.ship : {},
				checkPointList: data.checkPointList,
				workAssign: data.workAssign,
				quantity: data.quantity !== null ? data.quantity : '',
				weight: data.weight !== null ? data.weight : '',
				volume: data.volume !== null ? data.volume : '',
				whCyCutOff: data.whCyCutOff ? data.whCyCutOff : '',
				whPoNo: data.whPoNo ? data.whPoNo : ''
			})
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
			// 港口portCode,拼接成字符串，请求后台返回港口下拉数据做各个港口的反显
			if (data.ship) {
				let ship = {... data.ship}
        // console.log('ship', this.orderInfo)
        let { podPortCode, polPortCode, unloadingPortCode } = ship
				let portCodeArr = []
				polPortCode ? portCodeArr.push(polPortCode) : ''
				podPortCode ? portCodeArr.push(podPortCode) : ''
				unloadingPortCode ? portCodeArr.push(unloadingPortCode) : ''
				this.fillPortCodes = portCodeArr.toString()
				// 获取目的港countryCode，做木质包装显示隐藏
				if (this.createItem.ship.podPortCode) {
					let podPortCode = this.createItem.ship.podPortCode
					this.$store.dispatch('dict/basePortListByCodes', { portCodes: podPortCode }).then(data => {
						let portItem = data.find(item => item.portCode === podPortCode)
						// console.log(portItem)
						this.countryCode = portItem ? portItem.countryCode : ''
					})
					// 获取系统航线中文名称
					portSystemLineInfo(podPortCode).then(res => {
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
				if (item.serviceStatus === 'finish') {
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
						if (item.serviceCode === 'whbook' || item.serviceCode === 'proxy_whbook' || isFinishedArr.includes(item.serviceCode)) {
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
		// 获取附件列表
		getFileList() {
			let data = {
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo
			}
			whBookFileList(data).then(res => {
				this.fileListData = res.data
			})
		},
		// 返回
		handleGoBack(routeName) {
			let name = 'OrderList'
			if (this.$route.query.source === 'jointList') {
				name = 'JointList'
			}
			this.$router.push({
				name
			})
			// let path = this.$route.query.source
			// this.$router.push({
			// 	path
			// })
		},
		handleClick(tab, event) {},
		toggleWorkAssign() {
			this.workAssignShow = !this.workAssignShow
			let value = this.workAssignShow ? 1 : 0
			Cookies.set('workAssignShow', value)
		},
		handleExportPlan() {
			// 输出计划单
		  handleExportPlanCommon()
		}
	}
}
</script>
<style lang="scss">
@import "@/views/order/order/less/index.scss";
</style>
