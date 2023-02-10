<template>
  <el-alert type="warning" :closable="false" class="gray">
    <template slot="title">
      <!-- <i class="tag-cancel">取</i> -->
      <span class="txt">
        该订单已发起变更海外服务类型申请，等待海外客服审批。
      </span>
    </template>
  </el-alert>
</template>
<script>
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