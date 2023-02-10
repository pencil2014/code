<template>
  <div class="app-layout">
    <div class="top-nav" v-if="!isFull">
      <TopBar />
    </div>
    <div class="tags-box" v-show="!isFull">
      <Tags />
    </div>
    <div class="cnt-box">
      <router-view />
      <div id="subapp-viewport"></div>
    </div>
  </div>
</template>

<script>
import actions from '@/store'
import Tags from './components/tags'
import TopBar from './components/topBar'
import { getToken } from '@/utils'
export default {
  components: {
    TopBar,
    Tags,
  },
  provide() {
    return {
      scrollToTag: this.scrollToTag,
    }
  },
  data() {
    return {
      state: {},
      token: '',
      fullRoutes: [
        '/finance/settlement/orderFee', //财务费用
        '/login',
        '/forget',
        '/order/order/containerList', // 以下为订单页面
        '/order/order/orderDetail',
        '/order/order/blList',
        '/order/order/fileList',
        '/order/order/childOrderList',
        '/order/order/dropCabinet',
        '/order/order/jointOrderDetail',
        '/order/book/bookDetail',
        '/order/order/orderBook',
        '/order/order/shippingTruck',
        '/order/order/polLtl',
        '/order/order/clearance',
        '/order/order/warehouse',
        '/order/order/yardBox',
        '/order/order/fume',
        '/order/order/inspectionAndDetection',
        '/order/order/podChangeDoc',
        '/order/order/podCommClearance',
        '/order/order/podFclDelivery',
        '/order/order/podLtlDelivery',
        '/order/order/podWarehouseIng',
        '/order/order/behalfRecordManifest',
        '/order/order/dischargeRelease',
        '/order/order/MakePackingList',
        '/order/order/lclWhBook',
        '/order/order/insurance',
        '/order/order/document',
        '/order/order/hblPrint',
        '/order/order/lclOrderDetail',
      ],
    }
  },
  created() {
    this.token = getToken()
  },
  computed: {
    isFull() {
      let { fullPath } = this.$route
      if (fullPath === '/') {
        return true
      } else {
        let sta = this.fullRoutes.some((item) => fullPath.startsWith(item))
        return sta
      }
    },
  },
  methods: {
    scrollToTag() {
      this.$nextTick(() => {
        let tag = document.getElementsByClassName('tag-active')[0]
        if (tag) {
          let warp = document
            .getElementsByClassName('tag-srollbar-cnt')[0]
            .getElementsByClassName('el-scrollbar__wrap')[0]
          let { clientWidth, offsetLeft } = tag
          let tagLeft = clientWidth + offsetLeft
          let warpLeft = warp.clientWidth + warp.scrollLeft
          if (tagLeft > warpLeft) {
            warp.scrollLeft += tagLeft - warpLeft
          }
          if (offsetLeft < warp.scrollLeft) {
            warp.scrollLeft = offsetLeft
          }
        }
      })
    },
  },
  mounted() {
    let store = sessionStorage.getItem('store')
    if (store) {
      let data = JSON.parse(store)
      actions.setGlobalState(data)
      this.state = data
    } else {
      this.state = actions.getGlobalState()
    }
    // if (!this.isFull) {
    //   history.pushState(null, '', `/#${this.state.activeTag.url}`)
    // }
  },
}
</script>

<style lang="scss" scoped>
.app-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
  .cnt-box {
    flex: 1;
    // padding: 8px;
    background-color: #fff;
    overflow: auto;
  }
}
</style>
