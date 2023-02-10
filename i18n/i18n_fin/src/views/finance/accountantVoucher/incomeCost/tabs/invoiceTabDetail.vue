<template>
  <div
    class="finance-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">发票信息</div>
        </div>
        <div class="money-box-right">
          <el-button @click="closeDetail" size="mini">{{$t('Common.back')}}</el-button>
        </div>
      </div>
      <div class="detail-main">
        <!-- <div class="detail-info">
          <div class="info-item">
            <span>类型: </span> {{info.billNo}}
          </div>
          <div class="info-item">
            <span>单号: </span> {{info.billNo}}
          </div>
          <div class="info-item">
            <span>业务类型: </span> {{info.billNo}}
          </div>
          <div class="info-item">
            <span> 转字凭证号: </span> {{info.billNo}}
          </div>
          <div class="info-item">
            <span>关联生成收付凭证号: </span> {{info.billNo}}
          </div>
          <div class="info-item">
            <span>凭证生成时间: </span> {{info.billNo}}
          </div>
        </div> -->
      </div>
    </div>
    <div class="finance-table-container">
        <div class="money-box">
          <div class="money-box-left">
            <div class="money-title">费用列表</div>
          </div>
          <div class="money-box-right">
          </div>
        </div>
        <FinanceTable :option="option1" />
      </div>
  </div>
</template>

<script>
import FinanceTable from "@/views/finance/components/financeTableMass/financeTableMass";
import { mixin } from "@/views/finance/orderFee/orderFee/mixin";
import { routerMixin } from "@/views/finance/mixins/routerMixin";
import { exInvoicePreclosingFees} from '@/api/fin/acct'
export default {
  name: "shiftTabDetail",
  mixins: [mixin, routerMixin],
  components: {
    FinanceTable,
  },
  data() {
    return {
      loading: false,
      option1: {},
      exInvoicePreclosingId: '',
      info: {}
    };
  },
  created () {
    this.exInvoicePreclosingId = this.$route.query?.exInvoicePreclosingId || ''
    // let pagination = Object.assign({}, this.option.pagination, {
    //   show: true, isNew: true,
    // })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      operationBtns: {
        show: false,
      },
      selection: {
        show: false,
      },
      columns: [
        {
          label:'单号',
          prop: 'billNo', 
          type: 'text'
        },
        {
          label:'费用名称',
          prop: 'feeName', 
          type: 'text'
        },
        {
          label:'费用原币',
          prop: 'currency', 
          type: 'text'
        },
        {
          label:'会计本位币',
          prop: 'acfinBasicCurrency', 
          type: 'text'
        },
        {
          label:'收付类型',
          prop: 'receipayType', 
          type: 'select',
          propInDict: 'feeitemReceipayGroup'
        },
        {
          label:'是否配置生成转字',
          prop: 'needShiftAccount', 
          type: 'select',
          propInDict: 'yesNo'
        },
        {
          label:'会计日期',
          prop: 'acctDate', 
          type: 'text'
        },
        {
          label:'开票金额',
          prop: 'drawInvoiceAmt', 
          type: 'text'
        },
        {
          label:'开票汇率',
          prop: 'invoiceAcctRate', 
          type: 'text'
        },
        {
          label:'开票本位币金额',
          prop: 'drawInvoiceBasicAmt', 
          type: 'text'
        },
        {
          label:'税率',
          prop: 'invoiceTaxRate', 
          type: 'text'
        },
        
        {
          label:'税额',
          prop: 'drawInvoiceBasicTaxAmt', 
          type: 'text'
        },
        {
          label:'费用的会计关账状态',
          prop: 'acfinCloseStatus', 
          type: 'text',
          width: 150,
          formatter: ({cellValue}) => {
            return cellValue === 'yes' ? '已关账' : '未关账'
          }
        },
        {
          label:'正确净收入成本金额(原币)',
          prop: 'correctNetAmt', 
          type: 'text',
          width: 150
        },
        {
          label:'调整净收入成本金额(原币)',
          prop: 'adjustNetAmt', 
          type: 'text',
          width: 150
        },
        {
          label:'正确税额',
          prop: 'correctTaxAmt', 
          type: 'text'
        },
        {
          label:'调整税额',
          prop: 'adjustTaxAmt', 
          type: 'text'
        },
      ],
      // pagination
    })
    // this.getData()
  },
  methods: {
    getData () {
      let data = {
        exInvoicePreclosingId: this.exInvoicePreclosingId
      }
      exInvoicePreclosingFees(data).then(res => {
        this.option1.data = res.data || []
      }).catch(()=>{})
    },
    closeDetail() {
      this.routerBack(true)
    },
  },
  activated () {
    this.exInvoicePreclosingId = this.$route.query?.exInvoicePreclosingId || ''
    this.getData()
  }
};
</script>

<style lang="scss" scoped>
.finance-page {
  .detail-main {
    padding: 0;
    margin-bottom: 15px;
    .detail-info {
      padding: 14px 14px 0px; // 18px 14px 4px
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      .info-item{
        width: 25%;
        margin-bottom: 15px;
      }
    }
  }
}
</style>
