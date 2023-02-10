<template>
  <el-dialog
    title="结算单列表"
    :visible="dialogVisible2"
    width="1000px"
    class="relate-payinfo-dialog"
    @close="closeDialog"
  >
    <div class="modifyfee-detail-info">
      <el-form ref="form" :inline="true" size="mini">
        <!-- 从选项里带过来 -->
        <el-form-item label="结算单位">
          <el-input type="text" disabled v-model="form.settleCorpName" />
          <!-- <el-autocomplete
            v-model="form.payAccountName"
            placeholder="请输入"
            :select-when-unmatched="true"
            :fetch-suggestions="(queryString, cb) => {autocomplete.querySearch && autocomplete.querySearch(queryString, cb)}"
            @select="(value) => {autocomplete.select && autocomplete.select(value)}"
            @change="(value) => {autocomplete.change && autocomplete.change(value)}"
          ></el-autocomplete>-->
        </el-form-item>
        <el-form-item label="结算单号">
          <el-input type="text" placeholder="请输入" v-model="form.settleOrderNo" clearable />
        </el-form-item>
        <el-form-item label="结算单类型">
          <el-select v-model="form.orderType" placeholder="请选择" clearable>
            <el-option
              v-for="item in dictMap['settleOrderType']"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="float:right;margin-right:0;">
          <el-button type="primary" @click="search">搜索</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <FinanceTable :option="option1" maxHeight="400" @send-multi="sendMulti" />
    <span slot="footer" class="dialog-footer">
      <el-button
        :loading="btnLoading"
        v-if="btnType=='release'"
        type="primary"
        @click="release"
        size="mini"
      >撤销结算单</el-button>
      <el-button
        :loading="btnLoading"
        v-if="btnType=='relate'"
        type="primary"
        @click="relate"
        size="mini"
      >关联结算单</el-button>
      <el-button @click="closeDialog" size="mini">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mapState, mapGetters } from 'vuex'
import {
  listInvoiceAbleSettleOrder,
  relateInvoiceFee,
  getRelateSettleOrderList,
  releaseInvoiceFee,
} from '@/api/fin/invoiceReceivable'
export default {
  name: 'feeClosedDiaglog',
  mixins: [mixin],
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    rowData: {
      type: Object,
      default: () => ({}),
    },
    btnType: '',
  },
  data() {
    return {
      option1: {},
      form: { settleCorpName: '', settleOrderNo: '', orderType: '' },
      multipleSelection1: [],
    }
  },
  created() {
    // console.log(this.dictMap.auditStatus);
    let operationBtns = Object.assign({}, this.option.operationBtns, { show: false })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      $name: 'relateReveivableDialog',
      edit: true,
      data: [],
      tips: { text: '', show: false },
      operationBtns,
      selection: { show: true },
      maxHeight: '99999px',
    })
    let arr =
      this.btnType == 'release'
        ? [{ prop: 'refAmt', label: '关联金额', width: 100 }]
        : [
            { prop: 'invoiceApplyAmtDesc', label: '已开票申请金额', width: 100 },
            { prop: 'invoiceBalanceDesc', label: '可开票金额', width: 100 },
          ]
    let columns = [
      { prop: 'settleOrderNo', label: '结算单号', width: 130 },
      { prop: 'settleCorpName', label: '结算单位', width: 160 },
      { prop: 'orderType', label: '结算单类型', type: 'select', propInDict: 'settleOrderType', width: 100 },
      { prop: 'settleCompName', label: '分公司', width: 160 },
      { prop: 'receivePayType', label: '收付类型', type: 'select', propInDict: 'feeitemReceipayGroup', width: 80 },
      // { prop: 'currency', label: '核销币种' },
      ...arr,
      { prop: 'createdName', label: '创建人', width: 100 },
      { prop: 'createdTime', label: '创建时间', width: 130 },
    ]
    this.option1.columns = columns
    this.option1.data = []
    this.getData()
  },
  methods: {
    search() {
      this.getData()
    },
    reset() {
      this.form.settleOrderNo = this.form.orderType = ''
      this.search()
    },
    getData() {
      // console.log(this.rowData)
      let method = this.btnType == 'release' ? getRelateSettleOrderList : listInvoiceAbleSettleOrder
      let { settleCorpName, invoiceReceivableId } = this.rowData
      this.form.settleCorpName = settleCorpName
      method({ ...this.form, invoiceReceivableId }).then((res) => {
        this.option1.data = res.data
      })
    },
    sendMulti(data, option) {
      this.multipleSelection1 = data
    },
    relate() {
      if (this.multipleSelection1.length < 1) {
        return this.$msgErrClose('请选择结算单进行关联！')
      }
      let settleOrderIds = this.multipleSelection1.map((item) => item.settleOrderId)
      this.btnLoading = true
      relateInvoiceFee({ invoiceReceivableId: this.rowData.invoiceReceivableId, settleOrderIds })
        .then((res) => {
          this.btnLoading = false
          this.$msgSucClose('关联成功!')
          this.$emit('relateSuc')
          this.closeDialog()
        })
        .catch(() => (this.btnLoading = false))
    },
    release() {
      if (this.multipleSelection1.length < 1) {
        return this.$msgErrClose('请选择结算单进行撤销关联！')
      }
      let settleOrderIds = this.multipleSelection1.map((item) => item.settleOrderId)
      this.btnLoading = true
      releaseInvoiceFee({ invoiceReceivableId: this.rowData.invoiceReceivableId, settleOrderIds })
        .then((res) => {
          this.btnLoading = false
          this.$msgSucClose('撤销关联成功!')
          this.$emit('relateSuc')
          this.closeDialog()
        })
        .catch(() => (this.btnLoading = false))
    },
    closeDialog() {
      this.$emit('update:dialogVisible', false)
    },
  },
  components: {
    FinanceTable,
  },
  computed: {
    ...mapGetters(['dictMap']),
    dialogVisible2() {
      return this.dialogVisible
    },
  },
}
</script>
<style>
.relate-payinfo-dialog .el-dialog__body {
  height: 500px;
  padding-bottom: 0px;
  overflow: auto;
}
.relate-payinfo-dialog .finance-el-table {
  padding: 14px 0 !important;
}

.relate-payinfo-dialog .tips-abs {
  top: -30px;
}
</style>