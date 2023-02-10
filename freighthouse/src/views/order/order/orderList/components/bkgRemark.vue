<template>
  <el-dialog @close="auditClose" class="audit-detail-dlg" title="订舱备注" :visible="true" width="50%">
    <el-input type="textarea" clearable rows="10" size="mini" placeholder="请输入" v-model="bkgRemark" :disabled="true"></el-input>
    <span slot="footer" class="dialog-footer">
      <el-button size="mini" type="primary" @click="auditClose">关 闭</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  data() {
    return {}
  },
  props: {
    bkgRemark: {
      type: String,
      default: ''
    }
  },
  activated() {},
  created() {},
  mounted() {},
  computed: {},
  components: {},
  watch: {},
  methods: {
    auditClose() {
      this.$emit('close')
    }
  }
}
</script>
<style lang="scss" scoped></style>
