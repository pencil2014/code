import store from '@/store'
import {mapState} from 'vuex'
import {getServicChilds, getDictLabel} from '@/utils/tools'
import {orderInfo, orderJointInfo} from '@/api/order/list'
export const mixin = {
  data() {
    return {
      orderDetailData: {},
      cust: {},
    }
  },
  computed: {
    ...mapState({
      currRole: state => state.order.currRole,
      dictMap: (state) => state.dict.dictMap,
      serviceList: state => state.order.serviceList,
      serviceInfoList: state => state.order.serviceInfoList
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
    viewState() {
      return this.$route.query.action === 'view' && !this.isOp
    },
    jointState() {
      return this.$route.query.jointNo ? true : false
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    // 获取订单详情
    getOrderInfo() {
      let {jointNo, orderNo} = this.$route.query
      if (jointNo) {
        return orderJointInfo({jointNo: jointNo}).then(res => {
          this.initServiceInfo(res.data)
        })
      }
      orderInfo({orderNo: orderNo}).then(res => {
        this.initServiceInfo(res.data)
      })
    },
    // 获取左侧服务项，服务项顶部的工作号，委托单位，服务项进度等默认值
    initServiceInfo(data) {
      let {component} = this.$route.query
      this.orderDetailData = data
      let {serviceList, serviceInfoList} = data
      this.cust = {
        custid: data.custid,
        custName: data.custName,
        custIntrustNo: data.custIntrustNo,
        businessType: data.businessType,
        serviceType: data.serviceType
      }
      sessionStorage.setItem("custStr", JSON.stringify(this.cust))
      this.$emit("getMenus", serviceList, serviceInfoList)
      // 获取服务项进度状态
      this.$emit("getServiceStatus", this.getServiceCode(component, serviceList))
    },
    // 获取url上当前组件的服务项code
    getServiceCode(parentComponent, serviceList) {
      let serviceCode = ''
      let allServicesMenu = JSON.parse(JSON.stringify(store.state.order.allServicesMenu))
      let sItem = allServicesMenu.find(item => item.component === parentComponent)
      if (sItem) {
        // 有code直接取
        if (sItem.code) {
          serviceCode = sItem.code
        }
        // 存在子服务项取数组第一个code
        if (sItem.child) {
          let child = sItem.child.filter(item => serviceList.includes(item.code))
          serviceCode = child[0].code
        }
      }
      return serviceCode
    }
  }
}