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
          <div class="money-title">订单（费用单）信息</div>
        </div>
        <div class="money-box-right">
          <el-button @click="closeDetail" size="mini">返回</el-button>
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
import { exOrderPreclosingFees} from '@/api/fin/acct'
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
      exOrderPreclosingId: '',
      info: {}
    };
  },
  created () {
    this.exOrderPreclosingId = this.$route.query?.exOrderPreclosingId || ''
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
          type: 'text',
          width: 150
        },
        {
          label:'核销编号',
          prop: 'writeoffNos', 
          type: 'text',
          width: 150
        },
        {
          label:'结算单位',
          prop: 'settleCorpName', 
          type: 'text',
          width: 150
        },
        {
          label:'费用名称',
          prop: 'feeName', 
          type: 'text'
        },
        {
          label:'费用ID',
          prop: 'feeId', 
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
          propInDict: 'yesNo',
          width: 120
        },
        {
          label:'会计日期',
          prop: 'acctDate', 
          type: 'text',
          width: 100
        },
        {
          label:'记账汇率',
          prop: 'confirmFeeExRate', 
          type: 'text'
        },
        {
          label:'费用金额',
          prop: 'confirmFeeAmt', 
          type: 'text'
        },
        {
          label:'本位币金额',
          prop: 'confirmFeeBasicAmt', 
          type: 'text'
        },
        {
          label:'确认税率',
          prop: 'confirmTaxRate', 
          type: 'text'
        },
        {
          label:'确认总税额',
          prop: 'confirmTaxAmt', 
          type: 'text'
        },
        {
          label:'已开票金额',
          prop: 'drawInvoiceAmt', 
          type: 'text'
        },
        {
          label:'已开票本位币金额',
          prop: 'drawInvoiceBasicAmt', 
          type: 'text',
          width: 120
        },
        {
          label:'已开票的税额',
          prop: 'drawInvoiceBasicTaxAmt', 
          type: 'text',
           width: 100
        },
        {
          label:'预收预付调整类型',
          prop: 'incomecostType', 
          propInDict: 'feeitemReceipayGroup',
          type: 'select',
          width: 120
        },
        {
          label:'预收预付调整金额',
          prop: 'incomecostAdjustAmt', 
          type: 'text',
          width: 120
        }
      ],
      // pagination
    })
    // this.getData()
  },
  methods: {
    getData () {
      let data = {
        exOrderPreclosingId: this.exOrderPreclosingId
      }
      exOrderPreclosingFees(data).then(res => {
        this.option1.data = res.data || []
      }).catch(()=>{})
    },
    closeDetail() {
      this.routerBack(true)
    },
  },
  activated () {
    this.exOrderPreclosingId = this.$route.query?.exOrderPreclosingId || ''
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
