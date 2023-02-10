<template>
  <span class="span-box">
    <span>{{label}}</span>
    <el-tooltip style="display: inline-block" effect="dark" content="此字段将展示给客户查看" placement="top">
      <i class="icon-custView"></i>
    </el-tooltip>
  </span>
</template>
<script>

export default {
  data () {
    return {
    }
  },
  props: {
    label: {
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
  methods: {
  }
}
</script>
<style lang="scss" scoped>
.span-box {
  display: flex;
  justify-content: flex-end;
  .icon-custView {
    margin-left: 4px;
    margin-top: 3px;
    height: 14px;
    width: 14px;
    background: url('../../../../../assets/icon-custView.png') center center no-repeat;
    background-size: cover;
    cursor: pointer;
  }
}
</style>  
