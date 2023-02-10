<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <div style="margin: -10px -16px;">
      <soListComp ref="soListComp" :columns="columns"></soListComp>
    </div>
  </BaseDialog>
</template>

<script>
import store from '@/store'
import soListComp from '../../../components/relateSoList'
import BaseDialog from '@/components/Base/Dialog/index'
import {bindSo} from '@/api/order/book/list'

export default {
  data() {
    return {
      dialogConfig: {
        title: '关联SO',
        show: true,
        width: "80%"
      },
      columns: store.state.book.bookList.freeSocolumnsBase,  // 表格显示表头
    }
  },
  props: {
    orderInfo: {
      type: Object,
      default: () => ({})
    },
  },
  created() {
  },
  components: {
    BaseDialog,
    soListComp
  },
  methods: {
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },
    // 绑定so信息
    handleBindSo(done) {
      let soList = []
      this.$refs.soListComp.selectedCheckbox.map(item => {
        soList.push(item.so)
      })
      let data = {
        orderNo: this.orderInfo.orderNo,
        soList: soList,
        bkgReqNo: this.orderInfo.bkgReqNo
      }
      
      console.log(data)
      bindSo(data).then(() => {
        this.$message({
          type: 'success',
          message: '关联SO成功',
          duration: 1000,
          onClose: () => {
            this.close('Confirm')
          }
        })
      })
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        if(!this.$refs.soListComp.selectedCheckbox || this.$refs.soListComp.selectedCheckbox.length == 0){
          this.$message({
            type: 'error',
            message: '请勾选要绑定的SO'
          })
          return false
        }
        this.handleBindSo(done)
      } else {
        this.close('Cancel')
      }
    },
  }
};
</script>

<style lang="scss">
.create-form .el-col{
  padding-bottom: 20px;
}
.el-date-editor.el-input, .el-date-editor.el-input__inner {
  width: auto;
}
.filter-container {
  margin-bottom: 10px;
}
</style>
