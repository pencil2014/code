<template>
  <el-dialog
    title="请款单列表"
    :visible.sync="dialogVisible.show"
    width="1000px"
    class="relate-payinfo-dialog"
  >
    <div class="modifyfee-detail-info">
      <el-form ref="form" :inline="true" size="mini">
        <el-form-item label="申请单编号">
          <el-input v-model="form.applyNo" placeholder="请填写"></el-input>
        </el-form-item>
        <el-form-item label="结算单编号">
          <el-input v-model="form.settleOrderNo" placeholder="请填写"></el-input>
        </el-form-item>
        <!-- 从选项里带过来 -->
        <!-- <el-form-item label="收款单位">
          <el-autocomplete
            v-model="form.recvCorpName"
            :placeholder="$t('Common.plEnter')"
            :select-when-unmatched="true"
            :fetch-suggestions="(queryString, cb) => {autocomplete.querySearch && autocomplete.querySearch(queryString, cb)}"
            @select="(value) => {autocomplete.select && autocomplete.select(value)}"
            @change="(value) => {autocomplete.change && autocomplete.change(value)}"
          ></el-autocomplete>
        </el-form-item>-->
        <el-form-item style="float:right;margin-right:0;">
          <el-button type="primary" @click="search">{{$t('Common.search')}}</el-button>
          <el-button @click="reset">{{$t('Common.reset')}}</el-button>
        </el-form-item>
      </el-form>
    </div>
    <FinanceTable :option="option1" maxHeight="390" @send-multi="sendMulti" />
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" :loading='loadingRelate' @click="relate" size="mini">关联</el-button>
      <el-button @click="dialogVisible.show = false" size="mini">{{$t('Common.cancel')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mapState, mapGetters } from 'vuex'
import { listPayInfo, relatePayInfo } from '@/api/fin/invoicePayment'
export default {
  name: 'feeClosedDiaglog',
  mixins: [mixin],
  props: {
    dialogVisible: {
      type: Object,
      default: () => ({}),
    },
    invoicePaymentId: {
      type: Number,
      default: -1,
    },
    rowData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      loadingRelate:false,
      option1: {},
      form: {
        applyNo: '',
        settleOrderNo: '',
      },
      multipleSelection1: [],
      // autocomplete: {},
    }
  },
  created() {
    let operationBtns = Object.assign({}, this.option.operationBtns, { show: false })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'relatePayInfoDialog',
      edit: true,
      data: [],
      tips: {
        text: '',
        show: false,
      },
      operationBtns,
      selection: {
        show: true,
      },
      maxHeight: '99999px',
    })
    let columns = [
      // recvCorpName
      {
        prop: 'recvCorpName',
        label: '供应商',
        type: 'text',
        width: 150,
      },
      {
        prop: 'applyNo',
        label: '申请单编号',
        type: 'text',
        width: 125,
      },
      {
        prop: 'settleOrderNo',
        label: '结算单编号',
        type: 'text',
        width: 125,
      },
      {
        prop: 'payWay',
        label: '支付方式',
        type: 'select',
      },
      {
        prop: 'currency',
        label: this.$t('FeeList.currency'),
        type: 'text',
      },
      {
        prop: 'applyPayAmt',
        label: this.$t('FeeList.feeAmt'),
        type: 'text',
      },
      {
        prop: 'hasInvoice',
        label: '是否已开票',
        type: 'select',
        propInDict: 'invoiceRelationStatus',
      },
      {
        prop: 'createdName',
        label: this.$t('Settle.applicant'),
        type: 'text',
        width: 100,
      },
      {
        prop: 'createdTime',
        label: this.$t('Settle.applicationDate'),
        type: 'text',
        width: 125,
      },
      {
        prop: 'confirmStatus',
        label: '审核状态',
        type: 'select',
        propInDict: 'auditStatus',
      },
      {
        prop: 'confirmName',
        label: this.$t('FinBill.approverName'),
        type: 'text',
        width: 100,
      },
    ]
    this.option1.columns = columns
  },
  methods: {
    search() {
      this.getData()
    },
    reset() {
      this.form.applyNo = ''
      this.form.settleOrderNo = ''
      this.getData()
    },
    getData() {
      let data = {
        recvCorpCode: this.rowData.supplierCorpCode,
        // recvAccountNo: this.rowData.supplierAccountNo,
        applyNo: this.form.applyNo,
        settleOrderNo: this.form.settleOrderNo,
        currency: this.rowData.currency,
      }
      listPayInfo(data).then((res) => {
        this.option1.data = res.data
      })
    },
    sendMulti(data, option) {
      this.multipleSelection1 = data
    },
    relate() {
      if (this.multipleSelection1.length < 1) {
        return this.$msgErrClose('请选择请款单进行关联！')
      }
      let payInfoIds = this.multipleSelection1.map((item) => item.payInfoId)
      let data = {
        invoicePaymentId: this.invoicePaymentId,
        payInfoIds,
      }
      let accountArr = [...new Set(this.multipleSelection1.map((item) => item.recvAccountNo))]
      if(accountArr.length > 1 || accountArr[0] !== this.rowData.supplierAccountNo){
        return this.$confirmWarn('发票销方银行账号与付款申请单收款银行账号不一致，是否确认关联？', () =>this.confirmSure(data))
      }
      this.confirmSure(data)
    },
    confirmSure(data){
      this.loadingRelate = true
      relatePayInfo(data).then((res) => {
        this.$msgSucClose('关联成功!')
        this.$emit('relateSuc')
        this.dialogVisible.show = false
      }).finally(()=>{
        this.loadingRelate = false
      })
    }
  },
  components: {
    FinanceTable,
  },
  watch: {
    'dialogVisible.show'(val) {
      if (val) this.reset() 
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