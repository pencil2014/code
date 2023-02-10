<template>
  <el-dialog :title="option.title" :visible.sync="option.show" :width="option.width||'552px'">
    <div class="result__container" :class="[option.resultType]">
      <slot name="descript"></slot>
    </div>
    <span v-if="!option.footerHide" slot="footer" class="dialog-footer">
      <el-button
        :loading="option.btnLoading"
        :icon="option.icon? 'el-icon-'+option.icon:''"
        :type="option.btnType||'primary'"
        size="mini"
        @click="sure"
      >{{option.text||'确定'}}</el-button>
      <el-button @click="cancel" size="mini">{{option.text_cancel||'取消'}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  name: 'applyForPassDialog',
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
        // this.close()
        this.$emit('sure', true)
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
    font-size: 12px;
}

</style>
