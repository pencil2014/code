<template>
  <el-alert type="warning" :closable="false" class="gray">
    <template slot="title">
      <i class="tag-cancel">取</i>
      <span class="txt">
        该订单已{{cancelText === '申请取消' && isOrderFeeCount ? '申请终止' : cancelText}}。原因：{{cancelOptions.cancelReason}} 备注：{{cancelOptions.cancelRemark}} 
      </span>
    </template>
  </el-alert>
</template>
<script>
import { mapState } from 'vuex'
import { orderFeeCount } from '@/api/fin/fee'
export default {
  data() {
    return {
    }
  },
  props: {
    cancelOptions: {
      type: Object,
      default: () => ({})
    },
    cancelText: {
      type: String,
      default: ''
    },
  },
  created() {
    if (!this.isOrderFeeCount) {
      this.getOrderFeeCount()
    }
  },
  mounted() {
    
  },
  computed: {
    ...mapState({
			isOrderFeeCount: state => state.order.isOrderFeeCount
		}),
  },
  components: {
  },
  watch: {
  },
  methods: {
    getOrderFeeCount() {
			orderFeeCount({ orderNo: this.$route.query.orderNo }).then(res => {
				this.$store.dispatch('order/setOrderFeeCount', res.data.count > 0)
			})
		},
  }
}
</script>
<style lang="scss">

</style>