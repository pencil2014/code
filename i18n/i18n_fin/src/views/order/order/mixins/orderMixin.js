import store from '@/store'
import { mapState, mapMutations } from 'vuex'
import { getServicChilds, getDictLabel, getServiceCode } from '@/utils/tools'
import { orderInfo, orderJointInfo, jointServiceWorkList } from '@/api/order/list'
import { bookTempInfo } from '@/api/order/contract'
export const orderMixin = {
	data() {
		return {
			orderInfo: {},
			isCancel: false, // 订单申请取消通过的状态
			cancelText: '',
			cancelOptions: {}, // 取消订单的信息：原因，备注
			isRefuse: false, // 商务拒绝
			refuseReason: '',
			isCancelApply: false,
			isJoint: false, // 服务项是否被协同
			isEdit: false, // 订舱服务项修改状态
			serviceInfo: {},
			currServiceCode: '',
			jointServiceWorkList: [], // 服务项协同参与人
			commonClearanceBlType: 'hbl',
			serviceProgress: '', // 服务项完成进度
			relateOrderRouter: ['ChildOrderList'], // 关联订单路由
			// 贸易单证和提单优先展示doc视图
			obdRouter: ['BlList'],
			docRouter: ['Document', 'BlList', 'PodChangeDoc', 'PodCommClearance', 'PodFclDelivery', 'PodWarehouseIng', 'ShippingFclDetail', 'Insurance', 'PodLtl', 'PodLtlDelivery'],
			opTruckRouter: ['ShippingTruck', 'Clearance', 'Warehouse', 'PolLtl'],
			showRolesRouter: ['OrderBook'], // 需要显示视图切换的路由
			orderDetailRouter: ['OrderDetail'], // 订单详情
			lclWhBookRouter: ['LclWhBook'], // 拼箱订舱服务项
			jointOrderDetailRouter: ['JointOrderDetail'], // 协同订单详情
			contractTempInfo: {}, // 套约详情
			isCancelJointAlert: false,
			proxyCancelApplyParams: {}
		}
	},
	computed: {
		...mapState({
			currRole: state => state.order.currRole,
			roles: state => state.user.roles,
			userId: state => state.user.userId,
			roleCodesOptions: state => state.order.orderList.roleCodesOptions,
			cdRoleCodesOptions: state => state.order.orderList.cdRoleCodesOptions,
			allEditRoleArr: state => state.order.orderList.allEditRoleArr,
			userEditRoles: state => state.order.orderList.userEditRoles,
			ordDetRole: state => state.order.orderList.ordDetRole,
			// ordDetRolesObj: (state) => state.order.orderList.ordDetRolesObj,
			dictMap: state => state.dict.dictMap,
			order: state => state.order,
			serviceList: state => state.order.serviceList,
			serviceInfoList: state => state.order.serviceInfoList,
			orderInfoDataObj: state => state.order.orderInfoDataObj
		}),
		isAc() {
			return this.ordDetRole === 'ac'
		},
		isDoc() {
			return this.ordDetRole === 'doc'
		},
		isRc() {
			return this.ordDetRole === 'rc'
		},
		isOp() {
			return this.ordDetRole === 'op'
		},
		// 报关单
		isCop() {
			return this.ordDetRole === 'op_truck' && ['ship_customs', 'ship_export_customs', 'ship_import_customs'].includes(this.orderInfo.businessType)
		},
		isBkg() {
			return this.ordDetRole === 'bkg'
		},
		isBd() {
			return this.ordDetRole === 'bd' || this.ordDetRole === 'obd' || this.ordDetRole === 'asst'
		},
		isEpricing() {
			return this.ordDetRole === 'epricing'
		},
		isEcs() {
			return this.ordDetRole === 'ecs'
		},
		isFcl() {
			return this.orderInfo.businessType === 'ship_export_fcl'
		},
		roleCodesShow() {
			// 20211223新增line_cs角色，特殊处理为op
			let roles = this.roles.map(item => {
				if (item === 'line_cs' && !this.roles.includes('op')) {
					item = 'op'
				}
				return item
			})
			let tempData = this.roleCodesOptions.filter(item => roles.includes(item.value))
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
		to.meta.activeMenu = `/order/order/${source}`
		// console.log('to', to)
		next()
	},
	created() {},
	mounted() {},
	methods: {
		...mapMutations('order', ['setServiceList', 'setServiceInfoList']),
		// 获取订单详情
		getOrderInfo() {
			this.lsLoading = true
			let { params, query } = this.$route
			let orderNo = query.orderNo
			let jointNo = query.jointNo
			// let {source, orderNo, jointNo} = this.$route.query
			if (jointNo) {
				return orderJointInfo({ jointNo: jointNo }).then(res => {
					this.orderInfo = res.data
					this.setServiceList(res.data.serviceList)
					this.setServiceInfoList(res.data.serviceInfoList)
					this.getInit(this.orderInfo)
					this.$store.dispatch('order/setOrderInfoDataObj', this.orderInfo)
				}).finally(() => {
					this.lsLoading = false
				})
			}
			orderInfo({ orderNo: orderNo }).then(res => {
				this.orderInfo = res.data
				this.setServiceList(res.data.serviceList)
				this.setServiceInfoList(res.data.serviceInfoList)
				this.getInit(this.orderInfo)
				this.$store.dispatch('order/setOrderInfoDataObj', this.orderInfo)
			}).finally(() => {
				this.lsLoading = false
			})
		},
		getInit(data) {
			if (!data || !Object.keys(data).length) return
			this.isCancelJointAlert = data.serviceInfoList.some(ele => ele.cancelStatus === 'INIT')
			// 获取业务发起取消的订单的取消原因备注等信息
			if (data.cancelApplyStatus === 'applied') {
				this.getCancel(data)
			}
			// 获取已拒绝的信息
			if (data.orderStatus === 'refuse') {
				this.getRefuse(data)
			} else {
				this.isRefuse = false
			}
			data.orderNo && this.$store.dispatch('order/setCustInfo', { 
				orderNo: data.orderNo, 
				custName: data.custName, 
				bdServiceMode: data.bdServiceMode, 
				compDeptName: data.compDeptName, 
				isJoint: !!data.jointNo,
				businessType: data.businessType,
				jointCompDeptCode:data.jointCompDeptCode
			}) // 根据客商ID获取客商信息
			this.commonClearanceBlType = data.businessType === 'ship_export_lcl' ? 'hbl' : 'mbl'
			// 获取登录用户拥有可编辑订单的角色集合
			this.getUserEditRoles(data)
			this.currServiceCode = getServiceCode(this.$route.name, data.serviceList)
			sessionStorage.setItem('serviceCode', this.currServiceCode)
			this.handleIsCancelApply(this.currServiceCode)
			this.proxyCancelApplyParams = {
				submitCancelStatus: data.submitCancelStatus,
				submitCancelRemark: data.submitCancelRemark,
				submitCancelRefuseRemark: data.submitCancelRefuseRemark
			}
			// console.log('this.currServiceCode',this.currServiceCode)
		},
		/*
		 * 获取登录用户具有的可编辑角色集合，过滤跟此订单有关联的角色
		 * allEditRoleArr - 订单具有编辑权限的角色合集
		 * userEditRoles - 订单详情的角色切换需要的合集
		 * orderDetRole - 订单详情的当前角色
		 */
		getUserEditRoles(data) {
			let { workAssign, jointWorkAssign, serviceInfoList } = data
			let userEditRoles = []
			let filterRolesArr = this.roles.filter(item => this.allEditRoleArr.includes(item))
			// 20211223 临时增加line_cs角色，权限同op是一样的
			// 特殊处理为op角色
			userEditRoles = filterRolesArr.map(item => {
				// if (item === 'line_cs' && !filterRolesArr.includes('op')) {
				// 	item ='op'
				// }
				return item
			})
			console.log('userEditRoles-0', userEditRoles)
			let orderDetRole = ''
			// let orderDetRole = userEditRoles.length ? userEditRoles[0] : this.roles[0]
			let tempRoles = []
			// 协同单op,op_truck,doc有编辑权限
			if (data.jointNo) {
				if (jointWorkAssign.length) {
					if (this.roles.includes('manager') || this.roles.includes('duty')) {
						userEditRoles = userEditRoles.filter(item => jointWorkAssign.some(ele => ele.jobCode === item))
					} else {
						// 协同单详情,取得是协同参与人或是协同服务项的协同人是登录人的
						// 补料详情，附件列表（提单tab需要角色权限）取的是协同参与人 服务项页面取得是协同服务项的协同人是登录人
						if (this.jointOrderDetailRouter.includes(this.$route.name)) {
							userEditRoles = userEditRoles.filter(item => jointWorkAssign.some(ele => ele.jobCode === item && this.userId === ele.employeeId) || serviceInfoList.some(ele => ele.opEmployeeId === this.userId))
						} else if (['SiDetail', 'FileList'].includes(this.$route.name)) {
							userEditRoles = userEditRoles.filter(item => jointWorkAssign.some(ele => ele.jobCode === item && this.userId === ele.employeeId)) // && this.userId === ele.employeeId
						} else {
							userEditRoles = userEditRoles.filter(item => serviceInfoList.some(ele => ele.opEmployeeId === this.userId)) // && this.userId === ele.employeeId
						}
						// userEditRoles = userEditRoles.filter(item => jointWorkAssign.some(ele => ele.jobCode === item && this.userId === ele.employeeId) || serviceInfoList.some(ele => ele.opEmployeeId === this.userId)) // && this.userId === ele.employeeId
					}
				}
				if (!userEditRoles.length) {
					tempRoles = []
					orderDetRole = ''
				} else {
					// ['op', 'line_cs', 'op_truck', 'doc', 'obd', 'asst']
					tempRoles = userEditRoles.filter(item => this.allEditRoleArr.includes(item))
					// 有两个角色，优先显示op视图
					orderDetRole = tempRoles.includes('op')
						? 'op'
						: tempRoles.includes('line_cs')
						? 'op'
						: tempRoles.includes('op_truck')
						? 'op_truck'
						: userEditRoles.includes('op_customs')
						? 'op_truck'
						: userEditRoles.includes('op_wh')
						? 'op_truck'
						: tempRoles.includes('doc')
						? 'doc'
						: tempRoles.includes('bkg')
						? 'bkg'
						: tempRoles.includes('csc')
						? 'csc'
						: tempRoles.includes('ecs')
						? 'ecs'
						: tempRoles.includes('epricing')
						? 'epricing'
						: ''
					// 贸易单证和提单路由
					// 出口业务
					if (['ship_export_fcl', 'ship_export_lcl', 'ship_bulk_ro'].includes(data.businessType) && userEditRoles.includes('doc') && this.docRouter.includes(this.$route.name)) {
						// tempRoles = ['doc']
						orderDetRole = 'doc'
						// if (jointWorkAssign.find(item => item.jobCode === 'doc' && item.employeeId)) {
						// 	tempRoles = ['doc']
						// 	orderDetRole = 'doc'
						// } else {
						// 	tempRoles = []
						// 	orderDetRole = ''
						// }
					}
					// 进口整箱、海外仓
					if (['ship_import_fcl', 'ship_oversea_wh'].includes(data.businessType) && userEditRoles.includes('op') && this.docRouter.includes(this.$route.name)) {
						tempRoles = ['doc']
						orderDetRole = 'doc'
					}
					// 进口拼箱
					if (['ship_import_lcl'].includes(data.businessType) && (userEditRoles.includes('op') || userEditRoles.includes('op_truck')) && this.docRouter.includes(this.$route.name)) {
						tempRoles = ['doc']
						orderDetRole = 'doc'
					}
					// 提单路由，obd，asst,doc都有写权限，此页面权限可以叠加
					if (userEditRoles.includes('obd') && userEditRoles.includes('asst') && userEditRoles.includes('doc') && this.obdRouter.includes(this.$route.name)) {
						tempRoles = userEditRoles.filter(item => ['obd', 'asst', 'doc'].includes(item))
					}
					// 订舱
					if (this.lclWhBookRouter.includes(this.$route.name)) {
						tempRoles = userEditRoles.filter(item => ['op', 'bkg'].includes(item))
						orderDetRole = tempRoles.includes('op') ? 'op' : tempRoles.includes('bkg') ? 'op' : ''
					}
					/*
					 * 协同订单详情
					 * 用户无管理者的角色：登录用户是协同参与人的才显示角色切换按钮
					 * 用户有管理者的角色：放开是协同参与人的限制
					 */
					if (this.jointOrderDetailRouter.includes(this.$route.name)) {
						if (userEditRoles.includes('op') || userEditRoles.includes('bkg')) {
							orderDetRole = 'op'
						}
					}
				}
			} else {
				// 用户无管理者的角色：登录用户是订单参与人的才显示角色切换按钮
				// 用户有管理者的角色：放开是订单参与人的限制
				if (workAssign.length) {
					if (this.roles.includes('manager') || this.roles.includes('duty') || this.roles.includes('observer')) {
						userEditRoles = userEditRoles.filter(item => workAssign.some(ele => ele.jobCode === item))
					} else {
						userEditRoles = userEditRoles.filter(item => workAssign.some(ele => ele.jobCode === item && this.userId === ele.employeeId)) // && this.userId === ele.employeeId
					}
				}
				console.log('userEditRoles-1', userEditRoles)
				if (!userEditRoles.length) {
					tempRoles = []
					orderDetRole = ''
				} else {
					// 草稿，待审核，已拒绝，已关闭这几种状态还未流转到操作文件的就只显示bd角色视图
					if (['draft', 'submit', 'refuse', 'close'].includes(data.orderStatus)) {
						// tempRoles = ['bd']
						// orderDetRole = 'bd'
						// pricing 加上商务是为了，订单详情，商务可以修改关联的报价方案
						tempRoles = userEditRoles.filter(item => ['bd','pricing'].includes(item))
						orderDetRole = userEditRoles.includes('bd') ? 'bd' : userEditRoles.includes('obd') ? 'bd' : userEditRoles.includes('asst') ? 'bd' : ''
					} else {
						/*
						 * 订单状态为审核通过以后的按op,doc,op_truck,bd的优先级展示
						 * 多角色页面如：订单详情(bd,op,doc)，订舱详情(bd,op)的要显示角色切换按钮
						 * 提单，贸易单证，目的港服务项等优先按doc视图
						 * 拖车，报关，散车等按op_truck优先视图
						 * 同时存在bd,obd,asst的过滤掉obd,asst角色，权限同bd一致
						 */
						if (userEditRoles.includes('bd') && (userEditRoles.includes('obd') || userEditRoles.includes('asst'))) {
							// 提单路由不过滤obd,asst。其他路由过滤掉obd，asst角色
							if (!this.obdRouter.includes(this.$route.name)) {
								userEditRoles = userEditRoles.filter(item => !['obd', 'asst'].includes(item))
							}
						}
						// 海外仓文件角色不做服务项，userEditRoles过滤掉doc角色。
						if (['ship_oversea_wh'].includes(data.businessType)) {
							userEditRoles = userEditRoles.filter(item => !['doc'].includes(item))
						}
						tempRoles = userEditRoles.filter(item => this.allEditRoleArr.includes(item))
						// 有两个角色，优先显示op视图
						orderDetRole = userEditRoles.includes('op')
							? 'op'
							: userEditRoles.includes('line_cs')
							? 'op'
							: userEditRoles.includes('op_truck')
							? 'op_truck'
							: userEditRoles.includes('op_customs')
							? 'op_truck'
							: userEditRoles.includes('op_wh')
							? 'op_truck'
							: userEditRoles.includes('bd') || userEditRoles.includes('obd') || userEditRoles.includes('asst')
							? 'bd'
							: userEditRoles.includes('doc')
							? 'doc'
							: userEditRoles.includes('bkg')
							? 'bkg'
							: userEditRoles.includes('csc')
							? 'csc'
							: userEditRoles.includes('ac')
							? 'ac'
							: userEditRoles.includes('eac')
							? 'ac'
							: userEditRoles.includes('ecs')
							? 'ecs'
							: userEditRoles.includes('epricing')
							? 'epricing'
							: ''
						// 出口业务订单详情如果同时有op_truck,doc。以doc为大，默认显示doc角色
						if (['ship_export_fcl', 'ship_export_lcl'].includes(data.businessType) && this.orderDetailRouter.includes(this.$route.name) && orderDetRole !== 'op' && userEditRoles.includes('op_truck') && userEditRoles.includes('doc')) {
							orderDetRole = 'doc'
						}
						// // 进口拼箱业务的
						// if (['ship_import_lcl'].includes(data.businessType)) {
						// 	if (userEditRoles.includes('op') || userEditRoles.includes('op_truck') || userEditRoles.includes('line_cs') || userEditRoles.includes('bkg')) {
						// 		orderDetRole = 'op'
						// 	}
						// }
						// 关联订单路由优先展示bd，obd
						if (this.relateOrderRouter.includes(this.$route.name) && (userEditRoles.includes('bd') || userEditRoles.includes('obd') || userEditRoles.includes('asst'))) {
							tempRoles = userEditRoles.filter(item => ['bd', 'obd', 'asst'].includes(item))
							orderDetRole = 'bd'
						}
						// 贸易单证、提单、目的港服务项等路由 出口整箱文件参与人不能为空，为空的话则不能赋予其doc权限
						if (['ship_export_fcl', 'ship_export_lcl', 'ship_bulk_ro'].includes(data.businessType) && userEditRoles.includes('doc') && this.docRouter.includes(this.$route.name)) {
							if (workAssign.find(item => item.jobCode === 'doc' && item.employeeId)) {
								// tempRoles = ['doc']
								orderDetRole = 'doc'
							} else {
								tempRoles = []
								orderDetRole = ''
							}
						}
						// 进口整箱、海外仓-贸易单证、提单、目的港服务项路由
						if (['ship_import_fcl', 'ship_oversea_wh'].includes(data.businessType) && userEditRoles.includes('op') && this.docRouter.includes(this.$route.name)) {
							tempRoles = ['doc']
							orderDetRole = 'doc'
						}
						// 进口拼箱-
						if (['ship_import_lcl'].includes(data.businessType)) {
							// 贸易单证、提单、目的港服务项路由 op_truck,op，同doc权限一致
							if (this.docRouter.includes(this.$route.name)) {
								if (userEditRoles.includes('op') || userEditRoles.includes('op_truck')) {
									tempRoles = ['doc']
									orderDetRole = 'doc'
								}
							}
							// 订单详情，op_truck,bkg，同op权限一致
							if (this.orderDetailRouter.includes(this.$route.name)) {
								if (userEditRoles.includes('op') || userEditRoles.includes('op_truck') || userEditRoles.includes('line_cs') || userEditRoles.includes('bkg')) {
									orderDetRole = 'op'
								}
							}
						}
						// 拖报仓储路由,op,op_truck都有写权限,此页面权限可以叠加
						if ((userEditRoles.includes('op_truck') || userEditRoles.includes('op_customs') || userEditRoles.includes('op_wh')) && userEditRoles.includes('op') && this.opTruckRouter.includes(this.$route.name)) {
							tempRoles = userEditRoles.filter(item => ['op', 'op_truck','op_customs','op_wh'].includes(item))
							orderDetRole = 'op_truck'
						}
						// 提单路由，obd，asst,doc都有写权限，此页面权限可以叠加
						if (userEditRoles.includes('obd') && userEditRoles.includes('asst') && userEditRoles.includes('doc') && this.obdRouter.includes(this.$route.name)) {
							tempRoles = userEditRoles.filter(item => ['obd', 'asst', 'doc'].includes(item))
						}
						// 订舱
						if (this.lclWhBookRouter.includes(this.$route.name)) {
							tempRoles = userEditRoles.filter(item => ['op', 'bkg', 'bd'].includes(item)) //如果是业务 隐藏订仓页面的订仓代理
							orderDetRole = tempRoles.includes('op') ? 'op' : tempRoles.includes('bkg') ? 'op' : tempRoles.includes('bd') ? 'bd' : ''
						}
						console.log('userEditRoles-2', tempRoles)
					}
				}
			}
			console.log(tempRoles)
			let newTempRoles =[]
			let specialRoles =[] // 用户保存拖报操作，关务操作，仓储操作的角色数组
			for(let i=0;i<tempRoles.length;i++){
				if(['op_truck','op_customs','op_wh'].includes(tempRoles[i])){
					specialRoles.push(tempRoles[i])
					if(!newTempRoles.includes('op_truck')){
						newTempRoles.push('op_truck')
					}
				}else{
					newTempRoles.push(tempRoles[i])
				}
			}

			userEditRoles = newTempRoles
			console.log('orderDetRole', orderDetRole)
			console.log('userEditRoles-3', userEditRoles)
			// 设置订单详情当前的角色
			this.$store.dispatch('order/setRole', orderDetRole)
			// 设置订单详情需要切换的角色
			this.$store.dispatch('order/setEditRoles', userEditRoles)
			this.$store.dispatch('order/setSpecialEditRoles', specialRoles)

			console.log(specialRoles)
			// 缓存每个订单号的角色信息用于详情多开
			// this.$store.dispatch('order/setSingleOrderRole', {orderNo: data.orderNo, orderDetRole, userEditRoles})
		},
		// 委托订舱与客户自定获取业务发起取消订单的取消原因信息
		getCancel(values) {
			if (!values) return
			this.isCancel = values.cancelApplyStatus === 'applied'
			this.cancelText = values.orderStatus === 'cancel' || values.orderStatus === 'break' ? '取消(终止)' : '申请取消'
			Object.assign(this.cancelOptions, {
				cancelReason: getDictLabel('orderCancelReason', values.cancelReason) || '',
				cancelRemark: values.cancelRemark || ''
			})
		},
		// 获取商务,bkg拒绝原因
		getRefuse(values) {
			if (!values) return
			this.isRefuse = values.orderStatus === 'refuse'
			let { refuseReason, refuseRemark } = values
			let { orderAuditRefuseReason, bkgRefuseReason, lclAuditRefuseReason, shipExportLclRefuseReason } = this.dictMap
			let refuseReasonOptions = orderAuditRefuseReason.concat(bkgRefuseReason, lclAuditRefuseReason, shipExportLclRefuseReason)
			// console.log('refuseReasonOptions', refuseReasonOptions)
			let findItem = refuseReasonOptions.find(item => item.value === refuseReason)
			if (findItem) {
				let refuseReasonCn = findItem.label
				this.refuseReason = refuseRemark ? `${refuseReasonCn}(${refuseRemark})` : `${refuseReasonCn}`
			} else if (values.auditRemark) {
				// 业务主管审核
				this.refuseReason = values.auditRemark
			} else {
				this.refuseReason = ''
			}
		},
		// // 获取服务项的状态
		// handleGetServiceStatus(code) {
		//   let {serviceInfoList} = this.orderInfo
		//   let sItem = serviceInfoList.find(item => item.serviceCode === code)
		//   this.progressValue = sItem ? sItem.serviceStatus : ''
		// },
		// 获取协同服务项取消申请状态
		handleIsCancelApply(code) {
			let { serviceInfoList } = this.orderInfo
			this.serviceInfo = serviceInfoList.find(item => item.serviceCode === code)
			this.isCancelApply = this.serviceInfo && this.serviceInfo.cancelApplyStatus === 'applied' ? true : false
			this.isJoint = this.serviceInfo && this.serviceInfo.isJoint === 'y' ? true : false
			this.isEdit = this.serviceInfo && this.serviceInfo.isEdit === 'y' ? true : false
			// console.log('this.isJoint',this.serviceInfo);
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
				// console.log(this.jointServiceWorkList);
			})
		},
		handleToRoute({ name, query }) {
			this.$store.dispatch('order/changePodWarehouseComp', '')
			if (!['OrderDetail', 'LclOrderDetail'].includes(name)) this.isJumpRouteFromPage = true
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
				path: '/order/order/' + path
			})
		},
		// 获取套约模板
		getContractInfo() {
			bookTempInfo({ orderNo: this.$route.query.orderNo }).then(res => {
				this.contractTempInfo = res.data || {}
			})
		}
	}
}
