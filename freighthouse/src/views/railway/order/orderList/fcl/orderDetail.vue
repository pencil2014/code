<template>
	<div>
		<div class="edit-container">
			<ComOrderInfo ref="first" :createItem="createItem" :orderStatus="createItem.orderStatus" :serviceTypeOptions="serviceTypeOptions" :serviceCodeOptions="serviceCodeOptions" @getHeight="getShipInfoHeight" @updateCust="updateCust">
				<div class="operateBtn-group">
					<div class="btn-groups">
						<!-- 业务 -->
						<div>
							<el-button size="mini" type="primary" @click="handleSave" :disabled="submitDisabled">保存</el-button>
							<el-button size="mini" type="primary" @click="handleSubmit" :disabled="submitDisabled">提交</el-button>
							<el-button size="mini" type="default" @click="handleGoBack" :disabled="submitDisabled">返回</el-button>
						</div>
					</div>
					<div class="status">
						<span class="label">订单状态:</span>
						<span
							class="value"
							:class="
								createItem.orderStatus === 'complete' || (createItem.orderStatus === 'pass' && orderInfo.isOpHandle !== 'y')
									? 'green'
									: createItem.orderStatus === 'submit'
									? 'yellow'
									: ['refuse', 'cancel', 'break'].includes(createItem.orderStatus)
									? 'red'
									: 'black'
							"
						>
							<i></i>
							{{ orderStatusFilter(createItem.orderStatus, $route.query.action, orderInfo.isOpHandle) }}
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
							<i class="hamburger el-icon-arrow-right" :class="{ 'is-active': true }"></i>
						</div>
						<h1 class="orderInfo-h1">订舱信息(货物来源：{{ createItem.cargoSource | cargoSourceFilter }})</h1>
						<OrderBookInfo
							:createItem="createItem"
							:includeFeeder="includeFeeder"
							:fillPolData="fillPolData"
							:fillPortCodes="fillPortCodes"
							:orderStatus="createItem.orderStatus"
							:sysLineCname="sysLineCname"
							ref="orderBookInfo"
							@getCountryCode="getCountryCode"
							@change="handleChangeIncludeFeeder"
							@updatePricing="updatePricing"
						/>
						<SoContainer :containerTotal="containerTotal" :createItem="createItem" :orderStatus="createItem.orderStatus" ref="soContainer" />
						<!-- 货物信息 -->
						<div class="row-cont">
							<div class="row-cont-tit">
								<span class="tit">货物信息</span>
							</div>
							<Cargo :createItem="createItem" :orderStatus="createItem.orderStatus" :countryCode="countryCode" ref="cargo" />
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
					<div class="work-assign-cont" v-if="workAssignShow">
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
import ComOrderInfo from './components/comOrderInfo'
import OrderBookInfo from './components/orderBookInfo'
import TransportInfo from './components/transportInfo'
import SoContainer from './components/soContainer'
import Cargo from './components/cargo'
import Worker from './components/worker'
import CheckPoint from '@/views/order/order/orderList/components/checkPoint'
import { baseBusinessList, baseBusinessServiceList, portSystemLineInfo } from '@/api/base'
import { orderInfo, orderJointInfo, orderSave, orderEdit, orderWork, orderCancelHandle, orderCopy, orderFinish, jointAuditWork, jointWork } from '@/api/order/list'

export default {
	filters: {
		cargoSourceFilter(cargoSource) {
			return getDictLabel('cargoSource', cargoSource)
		}
	},
	data() {
		return {
			state: '',
			oQuery: this.$route.query,
			includeFeeder: '',
			workAssignShow: false,
			countryCode: '',
			shipInfoHeight: 0, // 订舱信息高度
			checkPointHeight: 0, // 关键点高度
			createItem: { ...this.$store.state.order.orderList.createItem },
			opCargoItem: { ...this.$store.state.order.orderList.opCargoItem },
			opSizeItem: { ...this.$store.state.order.orderList.opSizeItem },
			rules: {
				'barge.etdTime': [{ required: true, message: '请选择驳船预计开船时间', trigger: 'change, blur' }],
				// 'barge.tdTime': [{ required: true, message: '请选择驳船实际开船时间', trigger: 'change, blur'}],
				'barge.porPortCode': [{ required: true, message: '请选择驳船收货地', trigger: 'change, blur' }],
				'ship.etdTime': [{ required: true, message: '请选择大船预计开船时间', trigger: 'change, blur' }],
				// 'ship.tdTime': [{ required: true, message: '请选择大船实际开船时间', trigger: 'change, blur'}],
				'ship.cyCutOff': [{ required: true, message: '请选择大船截关时间', trigger: 'change, blur' }],
				'ship.shipCarrierCode': [{ required: true, message: '请选择船公司', trigger: 'change, blur' }],
				'ship.polPortCode': [{ required: true, message: '请选择起运港', trigger: 'change, blur' }],
				'ship.podPortCode': [{ required: true, message: '请选择目的地', trigger: 'change, blur' }],
				'ship.issueMode': { required: true, message: '请选择放舱要求', trigger: 'change, blur' },
				'transport.destinationArea': { required: true, message: '请输入最终目的地', trigger: 'blur' },
				'transport.deliveryPlace': { required: true, message: '请输入交货详细地点', trigger: 'blur' }
				// 'transport.overseaAgentSupplierId': { required: true, message: '请选择海外代理人', trigger: 'change'},
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
			serviceTypeOptions: [], // 服务类型下拉
			serviceCodeOptions: [], // 服务项下拉
			sysLineCname: '', // 系统航线中文名称
			jointAuditWorkData: {},
			jointWorkData: [],
			finCloseStatusCn: '',
			obdDeptCode: '' // obd部门code
		}
	},
	created() {
		this.init(this.orderInfo)
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			currRole: state => state.user.currRole,
			userId: state => state.user.userId,
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
			return !this.roles.includes('pricing') && (this.roles.includes('bd') || this.roles.includes('obd') || this.roles.includes('asst'))
		},
		// 箱型箱量统计
		containerTotal() {
			let quantity = 0
			let weight = 0
			let volume = 0
			let containerArr = []
			let mergeArr = []
			let container = ''
			let { soContainerList } = this.createItem

			soContainerList.forEach(item => {
				item.containerList.forEach(o => {
					quantity += o.quantity && o.containerNum ? Number(o.quantity) * Number(o.containerNum) : 0
					weight += o.weight && o.containerNum ? Number(o.weight) * Number(o.containerNum) : 0
					volume += o.volume && o.containerNum ? Number(o.volume) * Number(o.containerNum) : 0
					weight = parseFloat(weight.toFixed(10))
					volume = parseFloat(volume.toFixed(10))
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
				container: container
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
		CheckPoint
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
		// 切换目的港刷新相应的pricing的岗位信息
		updatePricing() {
			this.getOrderWork('updatePricing')
		},
		orderStatusFilter(status, action, isOpHandle) {
			if (!status && ['add', 'copy'].includes(action)) {
				status = 'draft'
			}
			let result = getDictLabel('orderStatus', status)
			// 操作中状态特殊处理
			if (status === 'pass' && isOpHandle === 'y') {
				result = '操作中'
			}
			return result
		},
		getShipInfoHeight(val) {
			let bodyHeight = document.body.clientHeight
			this.shipInfoHeight = bodyHeight - val
			this.checkPointHeight = bodyHeight - val - 46
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
		// 分配工作项
		getOrderWork(type) {
			let data = {
				orderNo: this.createItem.orderNo || this.$route.query.orderNo,
				sysLineCode: this.createItem.ship.sysLineCode,
				shipCarrierCode: this.createItem.ship.shipCarrierCode,
				polPortCode: this.createItem.ship.polPortCode
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
				// 在这里获取pricing的职员信息
				let pricingItem = res.data.find(item => item.jobCode === 'pricing' && item.employeeId)
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
					this.orderWorkOptions = res.data.map(item => {
						return Object.assign(item, { show: true })
					})
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
		// // 获取订单详情
		// getOrderInfo(type) {
		//   let {action, source, jointNo, orderNo} = this.$route.query
		//   let query = {}
		//   query = source === 'joint' ? {jointNo: jointNo} : {orderNo: orderNo}
		//   // 订单类型，joint为协同订单
		//   if (source === 'joint') {
		//     return orderJointInfo(query).then(res => {
		//       let {data} = res
		//       this.fillOrderInfo(data)
		//     })
		//   }
		//   orderInfo(query).then(res => {
		//     let {data} = res
		//     this.fillOrderInfo(data, type)
		//   })
		// },
		fillOrderInfo(data, type) {
			// 放舱要求默认即时放舱
			if (data.ship && !data.ship.issueMode) {
				data.ship.issueMode = 'prompt'
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
			Object.assign(this.createItem, data, {
				orderStatus: data.orderStatus,
				cargoList: data.cargoList && data.cargoList.length ? data.cargoList : [{ boxRemark: '无' }],
				barge: data.barge ? data.barge : {},
				ship: data.ship
					? data.ship
					: {
							issueMode: 'prompt' // 新建订单设置放舱默认为即刻放舱
					  },
				transport: data.transport ? data.transport : {},
				soContainerList:
					data.soContainerList && data.soContainerList.length
						? data.soContainerList
						: [
								{
									isSplit: 'n', // 是否分开放舱（y分开，n不分开）
									sontainerListShowState: false,
									containerList: [{ containerType: '', isHeavy: '' }]
								}
						  ],
				checkPointList: data.checkPointList,
				workAssign: data.workAssign
			})
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
			// 港口portCode,拼接成字符串，请求后台返回港口下拉数据做各个港口的反显
			if (data.ship) {
				let ship = { ...data.ship }
				// console.log('ship', this.orderInfo)
				if (ship.transitPortCode) {
					this.createItem.ship.transitPortCode = ship.transitPortCode.split(',')
				} else {
					this.createItem.ship.transitPortCode = []
				}

				let { polPortCode, podPortCode, transitPortCode, unloadingPortCode } = ship
				let porPortCode = data.barge ? data.barge.porPortCode : ''
				let portCodeArr = []
				porPortCode ? portCodeArr.push(porPortCode) : ''
				polPortCode ? portCodeArr.push(polPortCode) : ''
				podPortCode ? portCodeArr.push(podPortCode) : ''
				transitPortCode ? portCodeArr.push(transitPortCode) : ''
				unloadingPortCode ? portCodeArr.push(unloadingPortCode) : ''
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
						if (item.serviceCode === 'book' || item.serviceCode === 'proxy_book' || isFinishedArr.includes(item.serviceCode)) {
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

		// 返回
		handleGoBack() {
			// let path = 'lclOrderList'
			this.$router.push({
				name: 'LclOrderList'
			})
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
						path: 'orderDetail',
						query: Object.assign(
							{ ...this.$route.query },
							{
								orderNo,
								sourceOrderNo: this.$route.query.orderNo,
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
					hscode: item.hscode,
					cname: item.cname,
					ename: item.ename,
					property: item.property,
					boxRemark: item.boxRemark,
					commodityTypeCode: item.commodityTypeCode,
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
			// soContainerList
			this.createItem.soContainerList.forEach(item => {
				let soObj = {}
				let containerList = []
				item.containerList.forEach(ele => {
					let queryObj = {}
					Object.assign(queryObj, {
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
							sizeRight: ele.sizeRight
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
				orderWorkOptions = this.orderWorkOptions.map(item => {
					let query = { ...item }
					if (query.jobCode === 'pricing') {
						query.employeeId = 0
					}
					return Object.assign({}, query)
				})
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
					transitPortCode: this.createItem.ship.transitPortCode ? this.createItem.ship.transitPortCode.toString() : '',
					transitWay: this.createItem.ship.transitWay,
					contractNo: this.createItem.ship.contractNo,
					contractCompany: this.createItem.ship.contractCompany,
					issueMode: this.createItem.ship.issueMode,
					sysLineCode: this.createItem.ship.sysLineCode,
					freetimeSys: this.createItem.ship.freetimeSys,
					isNodrop: this.createItem.ship.isNodrop,
					blType: this.createItem.ship.blType,
					blMode: this.createItem.ship.blMode
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
				workAssign: workArr
			}
		},

		// 业务保存提交必填校验
		validate(data) {
			if (!data.serviceType) {
				this.$message.warning('服务类型必填')
				return false
			}

			// if (!data.workAssign || !data.workAssign.length) {
			// 	this.$message.warning('分配岗位参与人必填')
			// 	return false
			// }

			return true
		},
		// 参与人保存提交时校验
		workAssignValidate(data) {
			let { workAssign } = data
			console.log('workAssign', workAssign, data)
			// 代订舱服务项不校验商务
			let noVerify = false
			if (data.serviceList.includes('proxy_book')) {
				noVerify = true
			}
			// 草稿订单不校验订舱人员
			let noBkgVerify = false
			if (this.createItem.orderStatus === 'draft') {
				noBkgVerify = true
			}
			let employeeIdValid = workAssign.some(item => !item.employeeId && !['eac', 'asst', 'obd'].includes(item.jobCode) && !(noVerify && item.jobCode === 'pricing') && !(noBkgVerify && item.jobCode === 'bkg'))
			// 获取参与人职业名称，拼接做非空提示
			let emptyTxtArr = []
			workAssign.map(item => {
				if (!item.employeeId && !['eac', 'asst', 'obd'].includes(item.jobCode) && !(noVerify && item.jobCode === 'pricing') && !(noBkgVerify && item.jobCode === 'bkg')) {
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
		// 提交保存
		handleSave(type) {
			let valiadte = false
			this.submitDisabled = true
			let canSubmit = true
			let { action, orderNo } = this.$route.query
			let containerList = this.$refs['soContainer'].$refs['containerList']
			this.$refs['orderSubmit'].validate(valid => {
				if (valid) {
					// 箱型箱量校验
					for (var i = 0; i < containerList.length; i++) {
						containerList[i].validate(isVaild => {
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
					console.log('error submit!!')
					return false
				}
			})

			// 可提交
			if (canSubmit) {
				let data = this.getValues()
				console.log('data', data)

				let submitState = true

				data.soContainerList.map(item => {
					item.containerList.map(ele => {
						if (ele.temperatureMax && ele.temperatureMin && Number(ele.temperatureMax) <= Number(ele.temperatureMin)) {
							submitState = false
						}
					})
				})

				if (!submitState) {
					this.submitDisabled = false
					return this.$message.error('最高温度不能低于最低温度')
				} else {
					// 保存或提交时都校验参与人
					if (!this.workAssignValidate(data)) {
						return (this.submitDisabled = false)
					}
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

					// 保存提交
					orderSave(data)
						.then(res => {
							this.$message({
								type: 'success',
								message: type === 'Submit' ? '提交成功' : '保存成功'
								// duration: 1000,
								// onClose: () => {

								// }
							})
							this.submitDisabled = false
							sessionStorage.removeItem('createOrderStr')
							if (type === 'Submit') {
								return this.$router.push({
									path: 'orderList'
								})
							}
							this.$emit('getInfo')
						})
						.catch(err => {
							setTimeout(() => {
								this.submitDisabled = false
							}, 2000)
						})
				}
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
</style>
