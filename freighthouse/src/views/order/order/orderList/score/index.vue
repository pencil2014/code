<template>
  <div class="edit-container order-book fullWrap" id="score">
		<div class="order-container">
			<!-- 订单已取消提示 -->
			<CancelAlert v-if="isOp && isCancel" :cancelText="cancelText" :cancelOptions="cancelOptions" />
			<!-- 订单拒绝提示 -->
			<RefuseAlert v-if="isBd && isRefuse" :refuseReason="refuseReason" />
			<div class="tabs-container">
				<TopNav :serviceType="orderInfo.serviceType" :activityKey="activityKey" :custid="orderInfo.custid" @routerPush="handleToRoute" />
				<div class="detail-container flex">
					<LeftNav :orderInfo="orderInfo" :activityKey="activityKey" @routerPush="handleToRoute" />
					<div class="flex1 component-main-cont">
						<div class="service-container">
							<CustInfo :orderInfo="orderInfo" />
              <div class="score-container">
                <sla />
                <workException />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { orderMixin } from '@/views/order/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import CustInfo from '../components/custInfo'
import sla from './components/sla'
import workException from './components/workException'
export default {
  mixins: [orderMixin, routerMixin],
  data() {
    return {
      activityKey: 'Score',
    }
  },
  components: {
		CancelAlert,
		RefuseAlert,
		TopNav,
		LeftNav,
		CustInfo,
    sla,
    workException,
	},
  created() {
    this.getOrderInfo()
  },
  mounted() {
		if (window.history && window.history.pushState) {
			history.pushState(null, null, document.URL);
			window.addEventListener('popstate', this.browserBack, false);
		}
	},
	destroyed(){
  	window.removeEventListener('popstate', this.browserBack, false);
	},
}
</script>

<style lang="scss" scoped>
@import '../../less/index.scss';
.score-container {
	padding: 0 20px;
	margin-top: 20px;
}
</style>