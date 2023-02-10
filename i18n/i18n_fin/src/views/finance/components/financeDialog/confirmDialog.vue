<template>
  <el-dialog
    :title="option.title"
    :visible.sync="option.show"
    :width="option.width||'580px'"
    :noModalClose="option.noModalClose"
  >
    <div class="confrim__container">
      <h4 v-if="option.titleText">{{option.titleText}}</h4>
      <DetailDiv
        v-for="item in option.formList.filter(v => !v.hide)"
        :label="item.label"
        :key="item.prop"
        :content="item.value"
        :isTooltip="item.isTooltip"
        :isFull="item.isFull || undefined"
        :labelWidth="option.labelWidth"
      />
      <slot />
    </div>
    <span v-if="!option.footerHide" slot="footer" class="dialog-footer">
      <el-button
        :loading="option.btnLoading"
        :type="option.btnType||'primary'"
        size="mini"
        @click="sure"
      >{{option.text||'确定'}}</el-button>
      <el-button @click="cancel" size="mini">{{option.cancelText||'取消'}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  name: 'finResultDialog',
  props: {
    option: {
      type: Object,
      default: () => ({ formList: [] }),
    },
  },
  data() {
    return {}
  },
  methods: {
    sure() {
      this.$emit('close', true)
    },
    cancel() {
      this.close()
    },
    close() {
      this.option.show = false
      this.$emit('close')
    },
  },
  // watch:{
  //   'option.show'(val){
  //     console.log(this.option.formList)
  //   }
  // }
}
</script>
<style lang="scss" scoped>
.confrim__container {
  // text-align: center;
  h4 {
    color: #222;
    padding-bottom: 8px;
  }
  ::v-deep {
    .detail__div {
      margin-right: 2px;
      width: 363px !important;
    }
  }
}
.el-dialog .el-icon {
  font-size: 46px;
  color: #33b18a;
}
</style>
