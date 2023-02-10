import { mapState, mapMutations } from 'vuex'
import { getDictLabel, getRailServiceCode } from '@/utils/tools'
import { orderInfo, jointServiceWorkList } from '@/api/railway/list'
export const orderMixin = {
	data() {
		return {
			orderInfo: {},
			isCancel: false, // 订单申请取消通过的状态
			cancelText: '',
			cancelOptions: {}, // 取消订单的信息：原因，备注
			isRefuse: false, // 商务拒绝
			isBkgRefuse: false, // 商务拒绝
			refuseReason: '',
			bkgRefuseReason: '',
			isCancelApply: false,
			isJoint: false, // 服务项是否被协同
			isEdit: false, // 订仓服务项修改状态
			serviceInfo: {},
			currServiceCode: '',
			jointServiceWorkList: [], // 服务项协同参与人
			commonClearanceBlType: 'hbl',
			serviceProgress: '', // 服务项完成进度
			isCancelJointAlert: false
		}
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
			ordDetRole: state => state.railway.ordDetRole
		}),
		isBkg() {
			return this.ordDetRole === 'bkg'
		},

		isOp() {
			return this.roles.includes('op')
		},
		isBd() {
			return localStorage.railCurRole === 'bd'
		},
		isPricing() {
			return localStorage.railCurRole === 'pricing'
		},
		isAc() {
			return this.roles.includes('ac')
		},
		isDoc() {
			return this.roles.includes('doc')
		},
		isRc() {
			return this.roles.includes('rc')
		},
		isFcl() {
			return this.orderInfo.businessType === 'rail_export_fcl'
		},
		roleCodesShow() {
			let tempData = this.roleCodesOptions.filter(item => this.roles.toString().indexOf(item.value) > -1)
			if (tempData.length > 1) return true
			return false
		},
		// 只可预览状态
		viewState() {
			let { action } = this.$route.query
			return action !== 'add' && action !== 'copy'
		},
		// 是否协同单
		jointShow() {
			let { source, jointNo } = this.$route.query
			return source === 'jointList' || jointNo
		}
	},
	beforeRouteEnter(to, from, next) {
		let { source } = to.query
		to.meta.activeMenu = `/railway/order/${source}`
		next()
	},
	created() {
		this.$route.query.orderNo && this.getOrderInfo()
	},
	mounted() {},

	methods: {
		...mapMutations('railway', ['setServiceList', 'setServiceInfoList']),
		//打开详情
		openDetail() {
			if (this.detailShow == true) {
				this.detailShow = false
				setTimeout(() => {
					this.detailShow = true
				}, 200)
			} else {
				this.detailShow = true
			}
		},
		// 获取订单详情
		getOrderInfo() {
			this.lsLoading = true
			let { query } = this.$route
			let orderNo = query.orderNo
			let jointNo = query.jointNo

			orderInfo({ orderNo, jointNo })
				.then(res => {
					this.orderInfo = res.data
					this.setServiceList(res.data.serviceList)
					this.setServiceInfoList(res.data.serviceInfoList)
					this.getInit(this.orderInfo)
					this.$store.dispatch('railway/setOrderInfoDataObj', this.orderInfo)
				})
				.finally(() => {
					this.lsLoading = false
				})
		},
		getInit(data) {
			console.log('🚀 ~ data', data)
			if (!data.rail) data.rail = {}
			if (!data || !Object.keys(data).length) return
			this.isCancelJointAlert = data.serviceInfoList.some(ele => ele.cancelStatus === 'INIT')
			// 获取业务发起取消的订单的取消原因备注等信息
			if (data.main.cancelApplyStatus === 'applied') {
				this.getCancel(data.main)
			}
			// 获取已拒绝的信息
			if (data.main.orderStatus === 'refuse' || ['refuse_to_pricing', 'refuse_to_bd'].includes(data.rail.bkgRefuseStatus)) {
				this.getRefuse(data)
			}
			data.main.orderNo &&
				this.$store.dispatch('order/setCustInfo', {
					orderNo: data.main.orderNo,
					custName: data.main.custName,
					bdServiceMode: data.main.bdServiceMode,
					compDeptName: data.main.compDeptName,
					isJoint: !!data.main.jointNo,
					businessType: data.main.businessType
				}) // 根据客商ID获取客商信息
			this.commonClearanceBlType = data.businessType === 'rail_export_lcl' ? 'hbl' : 'mbl'
			// 获取登录用户拥有可编辑订单的角色集合
			this.getUserEditRoles(data)
			this.currServiceCode = getRailServiceCode(this.$route.name, data.serviceList)
			sessionStorage.setItem('serviceCode', this.currServiceCode)
			this.handleIsCancelApply(this.currServiceCode)
		},
		// 获取登录用户具有的可编辑角色集合，过滤跟此订单有关联的角色
		getUserEditRoles(data) {
			if (!data.main) data.main = {}
			let { workAssign } = data
			let userEditRoles = this.roles.filter(item => ['bd', 'obd', 'asst', 'pricing', 'bkg', 'op', 'ecs', 'epricing'].includes(item))
			let orderDetRole = ''
			let tempRoles = []
			// 协同单
			if (this.$route.query.jointNo) {
				// tempRoles = ['bkg']
				// orderDetRole = 'bkg'

				tempRoles = userEditRoles.filter(item => ['bkg', 'op', 'ecs', 'epricing'].includes(item))
				orderDetRole =
					userEditRoles.includes('bkg') || userEditRoles.includes('op')
						? 'bkg'
						: userEditRoles.includes('ecs') || userEditRoles.includes('epricing')
						? 'ecs'
						: // : userEditRoles.includes('pricing')
						// ? 'pricing'
						userEditRoles.includes('bd') || userEditRoles.includes('obd') || userEditRoles.includes('asst')
						? 'bd'
						: ''
			} else {
				// 登录用户含有的角色和参与人的角色相同的才可以做角色切换
				if (workAssign.length) {
					if (this.roles.includes('manager') || this.roles.includes('duty') || this.roles.includes('observer')) {
						userEditRoles = userEditRoles.filter(item => workAssign.some(ele => ele.jobCode === item))
					} else {
						userEditRoles = userEditRoles.filter(item => workAssign.some(ele => ele.jobCode === item && this.userId === ele.employeeId)) // && this.userId === ele.employeeId
						console.log('🚀 ~ userEditRoles', userEditRoles)
					}
				}
				if (!userEditRoles.length) {
					tempRoles = []
					orderDetRole = ''
				} else {
					if (['draft'].includes(data.main.orderStatus)) {
						// 业务
						tempRoles = userEditRoles.filter(item => ['bd'].includes(item))
						orderDetRole = userEditRoles.includes('bd') ? 'bd' : userEditRoles.includes('obd') ? 'bd' : userEditRoles.includes('asst') ? 'bd' : ''
					} else if (data.main.orderStatus === 'refuse') {
						tempRoles = userEditRoles.filter(item => ['bd', 'pricing'].includes(item))
						// orderDetRole = this.ordDetRole || userEditRoles[0]

						orderDetRole = userEditRoles.includes('bd') || userEditRoles.includes('obd') || userEditRoles.includes('asst') ? 'bd' : userEditRoles.includes('pricing') ? 'pricing' : ''
					} else if (data.main.orderStatus === 'submit') {
						// 商务
						if (userEditRoles.includes('pricing') && (userEditRoles.includes('bd') || userEditRoles.includes('obd') || userEditRoles.includes('asst'))) {
							userEditRoles = userEditRoles.filter(item => !['obd', 'asst'].includes(item))
						}
						tempRoles = userEditRoles.filter(item => ['bd', 'obd', 'asst', 'pricing'].includes(item))
						orderDetRole = userEditRoles.includes('pricing') ? 'pricing' : userEditRoles.includes('bd') || userEditRoles.includes('obd') || userEditRoles.includes('asst') ? 'bd' : ''
					} else {
						// bkg
						// // 订单详情增加1个op角色，他需要发起协同。其他页面不需要op角色
						// if (this.$route.name === 'RailwayOrderDetail') {
						// 	tempRoles = userEditRoles.filter(item => ['bkg', 'op', 'pricing', 'ecs', 'epricing'].includes(item))
						// } else {
						// 	tempRoles = userEditRoles.filter(item => ['bkg', 'pricing', 'ecs', 'epricing'].includes(item))
						// }
						// 订单详情增加1个op角色，他需要发起协同。协同的人员也都是op,所以服务项页面也需要op角色
						tempRoles = userEditRoles.filter(item => ['bkg', 'op', 'pricing', 'ecs', 'epricing'].includes(item))
						orderDetRole = userEditRoles.includes('bkg')
							? 'bkg'
							: userEditRoles.includes('ecs') || userEditRoles.includes('epricing')
							? 'ecs'
							: userEditRoles.includes('pricing')
							? 'pricing'
							: userEditRoles.includes('bd') || userEditRoles.includes('obd') || userEditRoles.includes('asst')
							? 'bd'
							: ''
					}
				}
			}
			userEditRoles = tempRoles
			// 设置订单详情当前的角色
			this.$store.dispatch('railway/setRole', orderDetRole)
			console.log('🚀 ~ orderDetRole', orderDetRole)

			// 设置订单详情需要切换的角色
			this.$store.dispatch('railway/setEditRoles', userEditRoles)
			console.log('🚀 ~ userEditRoles', userEditRoles)
			// 缓存每个订单号的角色信息用于详情多开
		},
		// 委托订舱与客户自定获取业务发起取消订单的取消原因信息
		getCancel(values) {
			if (!values) return
			this.isCancel = values.cancelApplyStatus === 'applied'
			this.cancelText = values.orderStatus === 'cancel' ? '' : '申请'
			Object.assign(this.cancelOptions, {
				cancelReason: getDictLabel('orderCancelReason', values.cancelReason) || '',
				cancelRemark: values.cancelRemark || ''
			})
		},
		// 获取商务,bkg拒绝原因
		getRefuse(values) {
			if (!values) return
			this.isRefuse = values.main.orderStatus === 'refuse' && values.rail.bkgRefuseStatus != 'refuse_to_bd'
			this.isBkgRefuse = (values.rail.bkgRefuseStatus === 'refuse_to_pricing' && values.main.orderStatus === 'submit') || (values.rail.bkgRefuseStatus === 'refuse_to_bd' && values.main.orderStatus === 'refuse')
			let { refuseReason, refuseRemark } = values.main
			let { bkgRefuseReason, bkgRefuseRemark } = values.rail
			let { orderAuditRefuseReason, railBkgRefuseReason, lclAuditRefuseReason } = this.dictMap
			let refuseReasonOptions = orderAuditRefuseReason.concat(railBkgRefuseReason, lclAuditRefuseReason)
			let findItem = refuseReasonOptions.find(item => item.value === refuseReason)
			if (findItem) {
				let refuseReasonCn = findItem.label
				this.refuseReason = refuseRemark ? `${refuseReasonCn}(${refuseRemark})` : `${refuseReasonCn}`
			} else {
				this.refuseReason = ''
			}

			let findItemBkg = refuseReasonOptions.find(item => item.value === bkgRefuseReason)
			if (findItemBkg) {
				let refuseReasonCn = findItemBkg.label
				this.bkgRefuseReason = bkgRefuseRemark ? `${refuseReasonCn}(${bkgRefuseRemark})` : `${refuseReasonCn}`
			} else {
				this.bkgRefuseReason = ''
			}
		},

		// 获取协同服务项取消申请状态
		handleIsCancelApply(code) {
			console.log('~~~~~~~~~~~~~~~isCancelApply', code)
			let { serviceInfoList } = this.orderInfo
			this.serviceInfo = serviceInfoList.find(item => item.serviceCode === code)
			this.isCancelApply = this.serviceInfo && this.serviceInfo.cancelApplyStatus === 'applied' ? true : false
			this.isJoint = this.serviceInfo && this.serviceInfo.isJoint === 'y' ? true : false
			this.isEdit = this.serviceInfo && this.serviceInfo.isEdit === 'y' ? true : false
		},
		// 协同订单服务项岗位分配信息
		getJointServiceWorkList(code) {
			let data = {
				orderNo: this.$route.query.orderNo,
				jointNo: this.$route.query.jointNo,
				serviceCode: code
			}
			jointServiceWorkList(data).then(res => {
				this.jointServiceWorkList = res.data
			})
		},
		handleToRoute({ name, query }) {
			console.log('🚀 ~ query', query)
			console.log('🚀 ~ name', name)
			this.$store.dispatch('railway/changePodWarehouseComp', '')
			if (!['OrderDetail', 'LclOrderDetail', 'FclOrderDetail'].includes(name)) this.isJumpRouteFromPage = true
			this.$router.push({
				name: name,
				param: {
					orderNo: query.orderNo
				},
				query: query
			})
		},
		// 浏览器返回事件
		browserBack() {
			let path = this.$route.query.source || 'orderList'
			this.$router.push({
				path: '/railway/order/' + path
			})
		}
	}
}
