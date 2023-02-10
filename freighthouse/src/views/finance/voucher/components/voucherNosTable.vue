<template>
  <el-dialog title="关联的凭证记录" :visible.sync="dialogOption.show" width="800px">
    <div>
      <el-button :loading="btnLoading1" type="danger" size="mini" @click="sure">一键删除全部凭证</el-button>
      <FinanceTable maxHeight="400px" ref="table" :option="option1" />
    </div>
  </el-dialog>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import { mapGetters } from 'vuex'
import { voucherDelete, exVoucherDelete, batchDeleteInExVouchers } from '@/api/fin/voucher'

export default {
  name: 'finDialogTable',
  props: {
    dialogOption: {
      type: Object,
      default: () => ({ list: [], show: false }),
    },
  },
  components: {
    FinanceTable,
  },
  data() {
    return {
      option1: {
        styleCfg: { padding: '10px 0' },
        data: [],
        columns: [
          { prop: 'settleCompName', label: '分公司', type: 'text', minWidth: 160 },
          { prop: 'bizType', label: '业务类型', type: 'select', propInDict: 'voucherBizType' },
          { prop: 'voucherClass', label: '凭证类型', type: 'select', propInDict: 'voucherClassDict' },
          { prop: 'voucherNo', label: '关联凭证号', type: 'text' },
          { prop: 'acctSetType', label: '内外账', type: 'select', propInDict: 'voucherAcctSetType' },
          { prop: 'createdName', label: '凭证生成人', type: 'text' },
          { prop: 'createdTime', label: '凭证生成时间', type: 'text', minWidth: 130 },
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['dictMap']),
  },
  watch: {
    'dialogOption.show': {
      handler(val) {
        if (val) {
          this.option1.data = this.dialogOption.list
        }
      },
    },
  },
  methods: {
    sure() {
      this.$confirmWarn('确认删除所有凭证？', () => {
        try {
          let inVoucherSeqNos = this.option1.data
            .filter((v) => v.acctSetType === 'internal')
            .map((v) => v.seqNo || v.voucherSeqno)
          let exVoucherSeqNos = this.option1.data
            .filter((v) => v.acctSetType === 'external')
            .map((v) => v.seqNo || v.voucherSeqno)

          this.printLoading = this.$loading({
            lock: true,
            text: '删除中...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.7)',
          })
          batchDeleteInExVouchers({ inVoucherSeqNos, exVoucherSeqNos })
            .then((res) => {
              this.$msgSucClose('操作成功！')
              this.dialogOption.show = false
              this.$emit('close', true)
            })
            .finally(() => this.printLoading.close())
        } catch (error) {
          console.log(error)
        }
        // if (innerList.length && outerList.length) {
        //   let p1 = voucherDelete({ voucherSeqNos: innerList.map((v) => v.seqNo || v.voucherSeqno) })
        //   let p2 = exVoucherDelete({ voucherSeqNos: outerList.map((v) => v.seqNo || v.voucherSeqno) })
        //   // let p1 = Promise.reject({ code: 1 })
        //   // let p2 = Promise.resolve({ code: 0 })
        //   // Promise.allSettled([p1, p2])
        //   Promise.all([p1, p2])
        //     .then((res) => {
        //       this.dialogOption.show = false
        //       this.$emit('close', true)
        //     })
        //     .catch((err) => {
        //       this.$msgErrClose('部分删除失败，请重新打开此弹框再试！')
        //     })
        // } else if (innerList.length) {
        //   voucherDelete({ voucherSeqNos: innerList.map((v) => v.seqNo || v.voucherSeqno) }).then((res) => {
        //     this.dialogOption.show = false
        //     this.$emit('close', true)
        //   })
        // } else if (outerList.length) {
        //   exVoucherDelete({ voucherSeqNos: outerList.map((v) => v.seqNo || v.voucherSeqno) }).then((res) => {
        //     this.dialogOption.show = false
        //     this.$emit('close', true)
        //   })
        // }
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
::v-deep {
  .el-dialog__body {
    // padding-bottom: 10px;
  }
  .finance-search-form,
  .finance-el-table {
    padding: 0;
    margin: 0;
  }
}
</style>