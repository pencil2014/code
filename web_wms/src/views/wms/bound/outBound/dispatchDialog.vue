<template>
  <div>
    <el-dialog :before-close="handleCancel" :visible.sync="options.show" class="dialog" title="新增出库派工信息" :modal-append-to-body='false'
      width="1200px">
      <dispatch-detail ref="dispatchDetail" v-if="options.show" :options="dispatchOptions" @cancel="handleCancel" @getList="getData"></dispatch-detail>
      <div class="dialog-footer" slot="footer">
        <el-button @click="handleSubmit" size="mini" type="success">提交</el-button>
        <el-button @click="handleCancel" size="mini">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import dispatchDetail from './dispatchDetail'

export default {
  props: {
    options: {
      type: Object,
      default: () => { }
    }
  },
  components: { dispatchDetail },
  data () {
    return {
      dispatchOptions: {
        data: {}
      }
    }
  },
  created () {
    if (this.options.data) {
      this.dispatchOptions.data = this.options.data
    }
  },
  methods: {
    handleSubmit () {
      this.$refs.dispatchDetail.handleSubmit()
    },
    /**
     * @description: 关闭弹框
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-18 10:47:31
     */
    handleCancel () {
      this.options.show = false
    },
    /**
     * @description: 刷新列表数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-10-31 11:33:33
     */
    getData () {
      this.$emit('getData')
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/common.scss';
/deep/ .el-dialog {
  .el-dialog__body {
    max-height: 515px;
    padding: 10px;
    .normalInput {
      width: 180px;
    }
    .form {
      padding: 5px 0;
    }
  }
}
</style>