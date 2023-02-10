<template>
  <el-dialog :title="option.title" :visible.sync="option.show" :width="option.width||'552px'">
    <div class="result__container" :class="[option.resultType]">
      <span class="el-icon" :class="['el-icon-'+option.resultType]"></span>
      <h3 v-if="option.titleText">{{option.titleText}}</h3>
      <slot name="descript"></slot>
    </div>
    <span v-if="!option.footerHide" slot="footer" class="dialog-footer">
      <!-- <el-button
        :loading="option.btnLoading"
        :icon="option.icon? 'el-icon-'+option.icon:''"
        :type="option.btnType||'primary'"
        size="mini"
        @click="sure"
      >{{option.text||'确定'}}</el-button>-->
      <el-button @click="cancel" size="mini">{{option.text_cancel||'取消'}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  name: 'finResultDialog',
  props: {
    option: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {}
  },
  methods: {
    sure() {
      this.$refs['form'].validate((valid) => {
        valid && this.$emit('close', true)
      })
    },
    cancel() {
      this.close()
    },
    close() {
      this.$emit('close')
    },
  },
}
</script>
<style lang="scss" scoped>
.result__container{
  text-align: center;
}
.el-dialog .el-icon{
  font-size: 46px;
  color: #33B18A;
}
h3{
  padding-top: 12px;
  font-size: 18px;
  color: #33B18A;
}
</style>
