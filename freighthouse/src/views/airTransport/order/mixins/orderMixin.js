import { mapState } from 'vuex'
import { getDictLabel, getAirServiceCode } from '@/utils/tools'
import { jointServiceWorkList } from '@/api/order/list'
import { orderInfo } from '@/api/airTransport/order'
import { getImportsDeptcode } from '@/api/airTransport/order-import'
// import name from 'nodeServer/api/admin/controller/api/v1/base/webapi/dept/employee/list/name'
export const orderMixin = {
  data() {
    return {
      servicePageName: ['AirPolLtl', 'AirClearance', 'AirDocument', 'AirChangeDocument', 'AirPodClearance', 'AirPodWarehouseIng', 'AirPodLtlDelivery', 'AirInsurance'],
      commonClearanceBlType: 'hawb',
      orderInfo: {},
      isCancel: false,  // 订单申请取消通过的状态
      cancelText: '',
      cancelOptions: {},  // 取消订单的信息：原因，备注
      isRefuse: false,  // 商务拒绝
      refuseReason: '',
      isCancelApply: false,
      isJoint: false,   // 服务项是否被协同
      isEdit: false,  // 订仓服务项修改状态
      serviceInfo: {},
      currServiceCode: '',
      jointServiceWorkList: [],  // 服务项协同参与人
      refuseReasonPricing: '',
      isRefusePricing: false, // 商务被拒绝
      isCancelJointAlert: false
    }
  },
  computed: {
    ...mapState({
      currRole: state => state.user.currRole,
      roles: (state) => state.user.roles,
      userId: (state) => state.user.userId,
      roleCodesOptions: (state) => state.airTransport.orderList.roleCodesOptions,
      allEditRoleArr: (state) => state.airTransport.orderList.allEditRoleArr,
      userEditRoles: (state) => state.airTransport.orderList.userEditRoles,
      ordDetRole: (state) => state.airTransport.orderList.ordDetRole,
      dictMap: (state) => state.dict.dictMap,
      order: state => state.airTransport,
      serviceList: state => state.airTransport.serviceList,
      serviceInfoList: state => state.airTransport.serviceInfoList,
      airOrderInfo: (state) => state.airTransport.airOrderInfo,
      allRole: (state) => state.airTransport.orderList.allRole
    }),
    isAc() {
      return this.ordDetRole === 'ac'
    },
    isOp() {
      return this.ordDetRole === 'op'
    },
    isEcs() {
      return this.ordDetRole === 'ecs'
    },
    isCs() {
      return this.ordDetRole === 'cs'
    },
    isBd() {
      return this.ordDetRole === 'bd'
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
    },
  },
  created() {
  },
  mounted() {
  },
  beforeRouteEnter(to, from, next) {
    let { source } = to.query
    to.meta.activeMenu = `/airTransport/order/${source}`
    next()
  },
  methods: {
    // 获取订单详情
    getOrderInfo() {
      let { orderNo, jointNo } = this.$route.query
      let params = {
        orderNo: orderNo
      }
      if (jointNo) {
        params.jointNo = jointNo
      }
      this.lsLoading = true
      orderInfo(params).then(res => {
        // 进口订单 设置importsDeptcode 进口部deptcode，放在订单详情里面
        if (res.data.businessType === 'air_import') {
          getImportsDeptcode({ orderNo: orderNo }).then(response => {
            if (response.data) {
              this.orderInfo = {
                ...res.data,
                importsDeptcode: response.data
              }
              localStorage.setItem('airOrderInfo', JSON.stringify(this.orderInfo))
              this.$store.dispatch('airTransport/setAirOrderInfo', this.orderInfo)
              this.orderInfo.cargoStat = this.orderInfo.cargoStat ? this.orderInfo.cargoStat : {}
              this.getInit(this.orderInfo)
            } else {
              this.orderInfo = res.data
              localStorage.setItem('airOrderInfo', JSON.stringify(res.data))
              this.$store.dispatch('airTransport/setAirOrderInfo', res.data)
              this.orderInfo.cargoStat = this.orderInfo.cargoStat ? this.orderInfo.cargoStat : {}
              this.getInit(this.orderInfo)
            }
          })
        } else {
          this.orderInfo = res.data
          localStorage.setItem('airOrderInfo', JSON.stringify(res.data))
          this.$store.dispatch('airTransport/setAirOrderInfo', res.data)
          this.orderInfo.cargoStat = this.orderInfo.cargoStat ? this.orderInfo.cargoStat : {}
          this.getInit(this.orderInfo)
        }
      }).finally(() => {
        this.lsLoading = false
      })
    },
    getInit(data) {
      if (!data) return
      // 获取业务发起取消的订单的取消原因备注等信息
      this.isCancelJointAlert = data.serviceInfoList.some(ele => ele.cancelStatus === 'INIT')
      if (data.cancelApplyStatus === 'applied') {
        this.getCancel(data)
      }
      // 获取已拒绝的信息
      if (data.orderStatus === 'refuse' || data.bkgStatus === 'REFUSE') {
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
        businessType: data.businessType
      }) // 根据客商ID获取客商信息
      // this.commonClearanceBlType = data.businessType === 'air_import' ? 'hawb' : 'mawb'
      // 获取登录用户拥有可编辑订单的角色集合
      this.getUserEditRoles(data)
      this.currServiceCode = getAirServiceCode(this.$route.name, data.serviceList)
      sessionStorage.setItem('serviceCode', this.currServiceCode)
      this.handleIsCancelApply(this.currServiceCode)
    },
    // 获取登录用户具有的可编辑角色集合，过滤跟此订单有关联的角色
    getUserEditRoles(data) {
      let { workAssign, jointWorkAssign, serviceInfoList } = data
      let userEditRoles = []
      let filterRolesArr = this.roles.filter(item => this.allEditRoleArr.includes(item))
      userEditRoles = filterRolesArr.map(item => {
        return item
      })
      let orderDetRole = ''
      // let orderDetRole = userEditRoles.length ? userEditRoles[0] : this.roles[0]
      let tempRoles = []
      // 协同单op,op_truck,doc有编辑权限
      if (this.$route.query.jointNo) {
        if (jointWorkAssign.length) {
          if (this.roles.includes('manager') || this.roles.includes('duty')) {
            userEditRoles = userEditRoles.filter(item => jointWorkAssign.some(ele => ele.jobCode === item))
          } else {
            userEditRoles = userEditRoles.filter(item => serviceInfoList.some(ele => ele.opEmployeeId === this.userId))
          }
        }
        if (!userEditRoles.length) {
          tempRoles = []
          orderDetRole = ''
        } else {
          tempRoles = userEditRoles.filter(item => this.allEditRoleArr.includes(item))
          // 有两个角色，优先显示op视图 ['bd', 'obd', 'asst', 'op', 'cs', 'ecs', 'ac', 'eac', 'pricing', 'epricing']
          orderDetRole = tempRoles.includes('op')
            ? 'op'
            : tempRoles.includes('ecs')
              ? 'ecs'
              : tempRoles.includes('epricing')
                ? 'epricing'
                : tempRoles.includes('pricing')
                  ? 'pricing'
                  : tempRoles.includes('ac')
                    ? 'ac'
                    : userEditRoles.includes('eac')
                      ? 'eac'
                      : userEditRoles.includes('cs')
                        ? 'cs'
                        : tempRoles.includes('rc')
                          ? 'rc'
                          : ''
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

        if (!userEditRoles.length) {
          tempRoles = []
          orderDetRole = ''
        } else {
          // 草稿，待审核，已拒绝，已关闭这几种状态还未流转到操作文件的就只显示bd角色视图
          if (['draft', 'refuse'].includes(data.orderStatus)) {
            tempRoles = []
            orderDetRole = ''
          } else {
            tempRoles = userEditRoles.filter(item => this.allEditRoleArr.includes(item))
            // 有两个角色，优先显示op视图
            orderDetRole = tempRoles.includes('op')
              ? 'op'
              : tempRoles.includes('pricing')
                ? 'pricing'
                : tempRoles.includes('bd') || tempRoles.includes('obd') || tempRoles.includes('asst')
                  ? 'bd'
                  : tempRoles.includes('ac')
                    ? 'ac'
                    : userEditRoles.includes('eac')
                      ? 'eac'
                      : userEditRoles.includes('cs')
                        ? 'cs'
                        : tempRoles.includes('ecs')
                          ? 'ecs'
                          : tempRoles.includes('epricing')
                            ? 'epricing'
                            : tempRoles.includes('rc')
                              ? 'rc'
                              : ''
            if (['submit'].includes(data.orderStatus)) {
              // 待审核时候只有 商务或者业务岗
              tempRoles = tempRoles.filter(el => el === 'obd' || el === 'asst' || el === 'bd' || el === 'pricing')
              if (tempRoles.length) {
                orderDetRole = tempRoles.includes('pricing')
                  ? 'pricing'
                  : tempRoles.includes('bd') || tempRoles.includes('obd') || tempRoles.includes('asst') ? 'bd' : ''
              } else {
                // ‘null’没任何权限
                tempRoles = ['null']
                orderDetRole = 'null'
              }
            }
          }
        }
      }
      if (this.$route.name === 'AirTransportMblList') {
        // 提单页面
        orderDetRole = tempRoles.includes('op')
          ? 'op'
          : tempRoles.includes('bd') || tempRoles.includes('obd') || tempRoles.includes('asst')
            ? 'bd'
            : userEditRoles.includes('cs')
              ? 'cs'
              : tempRoles.includes('ac')
                ? 'ac'
                : userEditRoles.includes('eac')
                  ? 'eac'
                  : tempRoles.includes('pricing')
                    ? 'pricing'
                    : tempRoles.includes('ecs')
                      ? 'ecs'
                      : tempRoles.includes('epricing')
                        ? 'epricing'
                        : tempRoles.includes('rc')
                          ? 'rc'
                          : ''
      } else if (this.$route.name === 'GoodsInfo') {
        // 货物信息页面
        orderDetRole = tempRoles.includes('op')
          ? 'op'
          : tempRoles.includes('bd') || tempRoles.includes('obd') || tempRoles.includes('asst')
            ? 'bd'
            : userEditRoles.includes('cs')
              ? 'cs'
              : tempRoles.includes('ac')
                ? 'ac'
                : userEditRoles.includes('eac')
                  ? 'eac'
                  : tempRoles.includes('pricing')
                    ? 'pricing'
                    : tempRoles.includes('ecs')
                      ? 'ecs'
                      : tempRoles.includes('epricing')
                        ? 'epricing'
                        : tempRoles.includes('rc')
                          ? 'rc'
                          : ''

      } else if (this.$route.name === 'AirFileList') {
        // 附件
        orderDetRole = tempRoles.includes('op')
          ? 'op'
          : tempRoles.includes('bd') || tempRoles.includes('obd') || tempRoles.includes('asst')
            ? 'bd'
            : tempRoles.includes('ecs')
              ? 'ecs'
              : tempRoles.includes('epricing')
                ? 'epricing'
                : tempRoles.includes('ac')
                  ? 'ac'
                  : userEditRoles.includes('eac')
                    ? 'eac'
                    : userEditRoles.includes('cs')
                      ? 'cs'
                      : tempRoles.includes('pricing')
                        ? 'pricing'
                        : tempRoles.includes('rc')
                          ? 'rc'
                          : ''

      } else if (this.servicePageName.includes(this.$route.name)) {
        orderDetRole = tempRoles.includes('op')
          ? 'op'
          : tempRoles.includes('ecs')
            ? 'ecs'
            : tempRoles.includes('bd') || tempRoles.includes('obd') || tempRoles.includes('asst')
              ? 'bd'
              : tempRoles.includes('epricing')
                ? 'epricing'
                : tempRoles.includes('ac')
                  ? 'ac'
                  : userEditRoles.includes('eac')
                    ? 'eac'
                    : userEditRoles.includes('cs')
                      ? 'cs'
                      : tempRoles.includes('pricing')
                        ? 'pricing'
                        : tempRoles.includes('rc')
                          ? 'rc'
                          : ''
      }
      let newTempRoles = []
      for (let i = 0; i < tempRoles.length; i++) {
        if (['bd', 'obd', 'asst'].includes(tempRoles[i])) {
          if (!newTempRoles.includes('bd')) {
            newTempRoles.push('bd')
          }
        } else {
          newTempRoles.push(tempRoles[i])
        }
      }
      userEditRoles = newTempRoles
      console.log('orderDetRole', orderDetRole)
      console.log('userEditRoles-3', userEditRoles)
      // 设置订单详情当前的角色
      this.$store.dispatch('airTransport/setRole', orderDetRole)
      // 设置订单详情需要切换的角色
      this.$store.dispatch('airTransport/setEditRoles', userEditRoles)

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
      this.isRefuse = values.orderStatus === 'refuse'
      let { refuseReason, refuseRemark } = values
      let refuseReasonCn = getDictLabel('airBkgRefuseReason', refuseReason)
      // this.refuseReason = refuseRemark ? `${refuseReasonCn}(${refuseRemark})` : `${refuseReasonCn}`
      if (refuseReasonCn) {
        this.refuseReason = refuseRemark ? `${refuseReasonCn}(${refuseRemark})` : `${refuseReasonCn}`
      } else if (values.auditRemark) {
        // 业务主管审核
        this.refuseReason = values.auditRemark
      } else {
        this.refuseReason = ''
      }


      this.isRefusePricing =
        (values.orderStatus === 'submit' || values.orderStatus === 'pass') && values.bkgStatus === 'REFUSE'
          ? true
          : false
      let refuseReasonCnPricing = getDictLabel('airBkgRefuseReason', refuseReason)
      if (this.isRefusePricing) {
        this.refuseReasonPricing = refuseRemark
          ? `${refuseReasonCnPricing}(${refuseRemark})`
          : `${refuseReasonCnPricing}`
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
      if (!serviceInfoList) {
        return
      }
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
      this.$store.dispatch("airTransport/changePodWarehouseComp", '')
      this.isJumpRouteFromPage = true
      this.$router.push({
        name: name,
        query: query
      })
    },
    // 浏览器返回事件
    browserBack() {
      let path = this.$route.query.source || 'orderList'
      this.$router.push({
        path: '/airTransport/order/' + path
      });
    },
  }
}