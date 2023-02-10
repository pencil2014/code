<template>
  <div class="edit-container order-book fullWrap" id="blList">
    <div class="order-container">
      <!-- 订单已取消提示 -->
      <!-- <CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" /> -->
      <!-- 订单拒绝提示 -->
      <!-- <RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" /> -->
      <div class="tabs-container">
        <!-- <TopNav :serviceType="orderInfo.serviceType" :activityKey="activityKey" @routerPush="handleToRoute" /> -->
        <div class="detail-container flex">
          <!-- <LeftNav :orderInfo="orderInfo" :activityKey="activityKey" @routerPush="handleToRoute" /> -->
          <div class="flex1 component-main-cont">
            <div class="service-container" id="air-bl-main">
              <CustInfo :orderInfo="orderInfo" />
              <!-- <BlList :orderStatus="orderInfo.orderStatus"/> -->
              <component ref="blListComponents" :is="currentComponent" :orderStatus="airOrderInfo.orderStatus"></component>
              <!-- 费用信息 -->
              <!-- <OneServiceFee :orderNoProp="oQuery.orderNo" :serviceCode="'AirTransportMblList'" /> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
// import CancelAlert from '../components/cancelAlert'
// import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import CustInfo from '../components/custInfo'
import BlList from '../orderBook/components/bl'
import BlImportList from '../orderBook/components/blImport'
// import OneServiceFee from '@/views/finance/orderFee/orderFee/components/oneServiceFee'
import { mapState } from 'vuex'
export default {
  mixins: [orderMixin, routerMixin],
  data() {
    return {
      oQuery: this.$route.query,
      activityKey: this.$route.name
    }
  },
  created() {
    this.getOrderInfo()
  },
  mounted() {
    if (window.history && window.history.pushState) {
      history.pushState(null, null, document.URL)
      window.addEventListener('popstate', this.browserBack, false)
    }
  },
  beforeRouteLeave(to, from, next) {
		let check = this.$refs['blListComponents'].needShowTip()
    if (check) {
			this.$confirm('提单还未保存，是否确定要离开当前页面？', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
			.then(() => { 
				 next()
			})
			.catch(() => {
				
			})
		} else {
			next()
		}
	},
  destroyed() {
    window.removeEventListener('popstate', this.browserBack, false)
  },
  computed: {
    ...mapState({
      airOrderInfo: (state) => state.airTransport.airOrderInfo
    }),
    currentComponent() {
      if (this.airOrderInfo.businessType === 'air_export') {
        // 空运出口
        return 'BlList'
      } else if (this.airOrderInfo.businessType === 'air_import') {
        // 空运进口
        return 'BlImportList'
      }
    }
  },
  watch: {},
  components: {
    // CancelAlert,
    // RefuseAlert,
    TopNav,
    LeftNav,
    CustInfo,
    BlList,
    BlImportList
    // OneServiceFee
  },
  methods: {}
}
</script>

<style lang="scss">
@import '../../less/index.scss';
.containerList-cont {
  overflow-y: auto;
}
.cnDetail-form {
  .special-item {
    .el-form-item__content {
      margin-top: 20px;
    }
  }
}
#blList .service-container .edit-row {
  margin-top: 8px !important;
}
#blList .service-container .edit-row .edit-container.so {
  padding: 10px;
}
</style>