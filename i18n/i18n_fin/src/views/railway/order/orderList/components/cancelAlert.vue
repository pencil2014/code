<template>
  <el-alert type="warning" :closable="false" class="gray">
    <template slot="title">
      <i class="tag-cancel">取</i>
      <span class="txt">
        该订单已{{cancelText}}{{isOrderFeeCount ? '终止' : '取消'}}。原因：{{cancelOptions.cancelReason}} 备注：{{cancelOptions.cancelRemark}} 
      </span>
    </template>
  </el-alert>
</template>
<script>
import { mapState } from 'vuex'
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
  },
  mounted() {
    
  },
  computed: {
    ...mapState({
			isOrderFeeCount: state => state.railway.isOrderFeeCount
		}),
  },
  components: {
  },
  watch: {
  },
  methods: {
  }
}
</script>
<style lang="scss">

</style>