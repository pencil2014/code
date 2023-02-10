<template>
  <div>
    <SoListComp :columns="columns" @cancelDialog="cancelDialog" ref="soListComp"></SoListComp>
    <template v-if="showCancelDialog">
      <CancelDialog :type="type" @close="close" @handleCancelSubmit="handleCancelSubmit"></CancelDialog>
    </template>
  </div>
</template>
<script>
import store from '@/store'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import SoListComp from '../components/soListComp'
import CancelDialog from './cancelDialog'
import {cancelSO, cancelSoCancel} from '@/api/order/book/list'

export default {
  mixins: [routerMixin],
  data(){
    return {
      columns: store.state.book.bookList.socolumnsBase,  // 表格显示表头
      showCancelDialog: false,
      cancelSoList: [],
      type: 'cancel'
    }
  },
  components: {
    SoListComp,
    CancelDialog
  },
  methods: {
    cancelDialog(data, type) {
      this.type = type
      this.cancelSoList = [...data]
      this.showCancelDialog = true
    },
    handleCancelSubmit(data) {
      let fn = this.type === 'withDrawCancel' ? cancelSoCancel : cancelSO
      data.soList = [...this.cancelSoList]
      this.showCancelDialog = false
      fn(data).then(() => {
        this.$message({
          type: 'success',
          message: this.type === 'withDrawCancel' ? '撤销标记取消成功' : '取消成功',
          duration: 1000,
          onClose: () => {
            this.$refs.soListComp.getList()
          }
        })
      })
    },
    close() {
      this.showCancelDialog = false
    },
    handleCurrentChange(val) {
      this.$refs.soListComp.getList()
		}
  }
}
</script>