<template>
  <div class="finance-page order-detail">
    <div class="finance-approve-detail">
      <div class="finance-approve-btns-box">
        <div class="finance-approve-btns-left">{{dictMapObj.payOrderType[orderType]}}核销</div>
        <div class="finance-approve-btns-right">
          <el-button @click="cancel(true)" size="mini">{{$t('Common.back')}}</el-button>
          <el-button @click="writeOffPreview" size="mini" type="primary">核销</el-button>
        </div>
      </div>
      <div class="finance-approve-detail-main">
        <div class="finance-detail-info">
          <h3>{{$t('Payment.payDetail')}}</h3>
          <div class="detail-info-other">
            <span class="detail-info-item">结算单编号：{{payInfo.settleOrderNo}}</span>
            <span class="detail-info-item">付款单编号：{{payOrder.payOrderNo}}</span>
            <span class="detail-info-item">我司付款银行：{{payInfo.payBankName}}</span>
            <span class="detail-info-item">账号：{{payInfo.payAccountNo}}</span>
            <span class="detail-info-item">{{$t('Collect.bankFlowNumber')}}: {{payOrder.bankSeqNo}}</span>
            <span class="detail-info-item">{{$t('Settle.paymentCurrency')}}: {{payOrder.currency}}</span>
            <span class="detail-info-item">{{$t('Settle.applyPayAmt')}}: {{payOrder.applyAmt}}</span>
            <span class="detail-info-item">已用核销金额：{{payOrder.balance}}</span>
            <span class="detail-info-item">发票号：{{payInfo.invoiceNo}}</span>
            <span class>结算请款编号：{{payOrder.sourceApplyNo}}</span>
          </div>
        </div>
        <div class="finance-detail-info">
          <h3>供应商银行账户</h3>
          <div class="detail-info-other">
            <span class="detail-info-item">开户名：{{payInfo.recvCorpName}}</span>
            <span class="detail-info-item">开户行：{{payInfo.recvBankName}}</span>
            <span class="detail-info-item">账号：{{payInfo.recvAccountNo}}</span>
          </div>
        </div>
        <div class="finance-detail-info" v-show="prepayUsables.length">
          <h3>使用预付款详情</h3>
          <div class="detail-info-other" v-for="(item,index) in prepayUsables" :key="item+index">
            <span class="detail-info-item" v-show="!item.payRefundNo">预付款编号：{{item.payOrderNo}}</span>
            <span class="detail-info-item" v-show="item.payRefundNo">预付退款编号：{{item.payRefundNo}}</span>
            <span class="detail-info-item">{{!item.payRefundNo ? "付款币种：":"退款币种："}}{{item.currency}}</span>
            <span class="detail-info-item">{{!item.payRefundNo ? "付款金额：":"转充值金额："}}{{item.realpayAmt}}</span>
            <span class="detail-info-item">可用核销金额：{{item.balance}}</span>
            <span class="detail-info-item">本次使用金额：{{item.currentUseAmt}}</span>
          </div>
        </div>
        <div class="finance-detail-info" v-show="transferFees.length">
          <h3>转账手续费</h3>
          <div v-for="(item,index) in transferFees" :key="index">
            <span
              class="detail-info-item"
            >内外扣类型：{{ item.cutType ? $t(`dict.transferFeeType.${item.cutType}`) : '' }}</span>
            <span class="detail-info-item">币种：{{item.currency}}</span>
            <span class="detail-info-item">金额：{{item.amt}}</span>
            <span class="detail-info-item">已摊金额：{{item.hasAllotAmt}}</span>
            <span class="detail-info-item">
              本次分摊：
              <el-input
                v-model="item.allotAmt"
                type="text"
                size="mini"
                :maxlength="16"
                v-lsNumber="{value:'number', obj:item, key:'allotAmt'}"
              ></el-input>
            </span>
          </div>
        </div>
        <div class="finance-detail-info ">
          <h3>状态</h3>
          <span class="detail-info-item">可用核销金额：{{infoData.useWriteoffAmt}}</span>
          <!-- <span class="detail-info-item">
            结算汇率：
            <span v-for="(item,index) in infoData.settleExRateSummarys" :key="index">
              <span>{{item.originalCurrency}}</span>-
              <span>{{item.settleCurrency}}</span>
              <span>{{item.settleExRate}}</span>,
            </span>
          </span> -->
          <span class="detail-info-item">结算币种：{{payOrder.currency}}</span>
          <span class="detail-info-item-max">
            其他应付：
            <span>
              <el-select size="mini" filterable v-model="query.otherPayables" disabled :placeholder="$t('Common.plSelect')">
                <el-option
                  v-for="(o, key) in dictMap['otherPayablesType'] "
                  :key="key"
                  :label="o.label"
                  :value="o.value"
                ></el-option>
              </el-select>
              <el-input
                class="amt"
                v-model="query.otherPayAmt"
                disabled
                v-lsNumber="{value:'number', obj:query, key:'otherPayAmt'}"
                placeholder="请输入金额"
                :maxlength="16"
                type="text"
                size="mini"
              ></el-input>
            </span>
          </span>
          <span class="detail-info-item-1">
            <div class="detail-info-item-div">
              结算汇率：
              <div class="dietail-info-div" v-for="(item,index) in infoData.settleExRateSummarys" :key="index">
                <span>{{item.settleCurrency}}</span>-<span>{{item.originalCurrency}}</span>
                <el-input
                  width="50px"
                  disabled
                  v-model="item.settleExRate"
                  placeholder="请输入核销汇率"
                  v-lsNumber="{value:'number', obj:item, key:'settleExRate', dot:'11'}"
                  :maxlength="16"
                  type="text"
                  size="mini"
                ></el-input>
              </div>
            </div>
            <div class="detail-info-item-div">
              核销汇率：
              <div class="dietail-info-div" v-for="(item,index) in infoData.settleExRateSummarys" :key="index">
                <span>{{item.originalCurrency}}</span>-<span>{{item.settleCurrency}}</span>
                <el-input
                  width="50px"
                  v-model="item.writeoffExRate"
                  placeholder="请输入核销汇率"
                  v-lsNumber="{value:'number', obj:item, key:'writeoffExRate', dot:'11'}"
                  :maxlength="16"
                  type="text"
                  size="mini"
                ></el-input>
              </div>
            </div>
          </span>
        </div>

        <div
          class="finance-table-container"
          v-if="['settle_pay','prepay_to_repay'].indexOf(orderType)>-1"
        >
          <div class="money-box">
            <div class="money-box-left">
              <div class="money-title">应付</div>
              <div class="money-title">
                <div style="font-size:14px">
                  <span>
                    原币应付合计：
                    <span style="color:#7CBF2D">{{infoData.orgCurrencyAmtSummary}}</span>
                  </span>
                  <span style="margin-left:16px">
                    折算合计：
                    <span style="color:#7CBF2D">{{infoData.settleCurrencyAmtSummary}}</span>
                  </span>
                </div>
              </div>
            </div>
            <div class="money-box-right"></div>
          </div>
          <FinanceTable :option="option1" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mapState } from 'vuex'
import { payOrderWriteOffPreview, saveWriteoffPayOrder } from '@/api/fin/pay'
export default {
  name: 'writeOffPreview',
  mixins: [mixin, routerMixin],
  props: {},
  data() {
    return {
      query: {
        otherPayables:"",
        otherPayAmt:"",
        bankseqFileNo: '',
        bankSeqNo: '',
        lessPayAmt: 0,
        lessPayDealway: '',
        remark: '',
      },
      payOrderNo: '',
      option1: {},
      infoData: {},
      payInfo: [],
      payOrder: {},
      transferFees: [],
      prepayUsables: [],
      writeoffItems: [],
      settleExRateSummarys: [],
      orderType: '',
    }
  },
  created() {
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'WriteOffPreview',
      data: [],
      operationBtns: false,
      selection: {
        show: false
      },
      edit: true
    })
    let columns1 = [
      {prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', key: 'settleCorpName'},
      {prop: 'feeName', label: '	费用名称', type: 'text', key: 'feeName'},
      {prop: 'feeEnName', label: '	费用英文名称', type: 'text', key: 'feeEnName'},
      {prop: 'oldSettleAmt', label: this.$t('Collect.originalamount'), type: 'text', key: 'oldSettleAmt'},
      {prop: 'originalCurrency', label: '	原币种', type: 'text', key: 'originalCurrency'},
      {prop: 'settleAmt', label: '结算金额', type: 'text', key: 'settleAmt'},
      {prop: 'settleCurrency', label: this.$t('Settle.settleCurrency'), type: 'text', key: 'settleCurrency'},
      {prop: 'settleExRate', label: this.$t('Settle.settleExRate'), type: 'text', key: 'settleExRate'},
      {prop: 'writeoffCurrency', label: '核销币种', type: 'text', key: 'writeoffCurrency'},
      {prop: 'writeoffExRate', label: this.$t('Collect.writeoffrate'), type: 'input',  key: 'writeoffExRate', notAllowed: true, inputType:"number" ,dot:11},
      {prop: 'writeoffFeeAmt', label: this.$t('Charge.writeoffAmt'), type: 'input',  key: 'writeoffFeeAmt',inputType:"number"},
      {prop: 'serviceName', label: this.$t('FeeList.serviceCodes'), type: 'text', key: 'serviceName'},
      {prop: 'feeUnit', label: this.$t('FeeList.feeUnit'), type: 'text',
        formatter: (row, pItem) => { 
          return this.dictMapObj.feeUnit[row[pItem.prop]]; 
        }
      },
      {prop: 'unitPrice', label: '单位', type: 'text', key: 'unitPrice'},
      {prop: 'unitCount', label: this.$t('FeeList.quantity'), type: 'text', key: 'unitCount'},
    ]
    this.option1.columns = columns1
  },
  methods: {
    getData() {
      payOrderWriteOffPreview({ payOrderNo: this.payOrderNo })
        .then((res) => {
          let { payOrder, transferFees, prepayUsables, writeoffItems, settleExRateSummarys } = res.data
          this.payOrder = payOrder
          this.transferFees = transferFees
          this.writeoffItems = writeoffItems
          this.option1.data = writeoffItems.map(item => {
            return Object.assign(item, {
              edit: true
            })
          })
          Object.assign( this.query,{
            otherPayables : res.data.payOrder.lessPayDealway,
            otherPayAmt : res.data.payOrder.lessPayAmt
          })
          this.prepayUsables = prepayUsables ? prepayUsables : []
          let settleExRateSummarysData = [{
              originalCurrency:payOrder.currency,
              settleCurrency:payOrder.currency,
              writeoffCurrency:payOrder.currency,
              writeoffExRate: 1 ,
              settleExRate: 1
            }]
          this.infoData = res.data
          this.infoData.settleExRateSummarys = !settleExRateSummarys.length ? settleExRateSummarysData : settleExRateSummarys
          this.payInfo = payOrder.payInfo
        })
        .catch((err) => {
          this.delVisitedView()
          this.cancel()
        })
    },
    writeOffPreview() {
      // if(!this.query.otherPayables){
      //   this.$message({  message: '其他应付必填！',  type: 'error',  showClose: true  })
      //   return
      // }
      // if(!this.query.otherPayAmt){
      //   this.$message({  message: '其他应付金额必填！',  type: 'error',  showClose: true  })
      //   return
      // }
      // if(!this.query.writeoffExRate){
      //   this.$message({  message: '其他应付金额必填！',  type: 'error',  showClose: true  })
      //   return
      // }
      for (let i = 0; i < this.transferFees.length; i++) {
        if( Number(this.transferFees[i].amt)-Number(this.transferFees[i].hasAllotAmt) < Number(this.transferFees[i].allotAmt)){
          this.$message({  message: '本次分摊必选小于金额-已分摊金额',  type: 'error',  showClose: true  })
          return
        }
        
      }
      let data = {
        settleCompCode: this.payOrder.payCompCode,
        settleCompName: this.payOrder.settleCorpName,
        settleOrderNo: this.payInfo.settleOrderNo,
        payOrderId: this.payOrder.payOrderId,
        payOrderNo: this.payOrder.payOrderNo,
        sourceApplyNo: this.payOrder.sourceApplyNo,
        orderType: this.payOrder.orderType,
        applyAmt: this.payOrder.applyAmt,
        currency: this.payOrder.currency,
        settleCurrency: this.payOrder.currency,
        useWriteoffAmt: this.infoData.useWriteoffAmt,
        writeoffExRate: this.infoData.writeoffExRate,
        prepayUsables: this.prepayUsables,
        writeoffItems: this.writeoffItems,
        transferFees: this.transferFees,
        ...this.query,
      }
      saveWriteoffPayOrder(data).then((res) => {
        this.$msgSucClose(this.$t('PayApplyList.writeoffSuccSubmit')) // '核销提交成功!'
        this.cancel(true)
      })
    },
    cancel(refresh) {
      this.routerBack(refresh)
    },
    rateChange() {
      this.option1.data = this.option1.data.map(item => {
        let obj = this.infoData.settleExRateSummarys.find(subItem => {
          return item.originalCurrency === subItem.originalCurrency && item.settleCurrency === subItem.settleCurrency
        })
        item.writeoffExRate = obj && obj.writeoffExRate || item.writeoffExRate
        return item
      })
    },
  },
  components: {
    FinanceTable,
  },
  computed: {
    ...mapState({
      columnsBase: (state) => state.finance.columns.columnsBase3,
    }),
  },
  watch:{
    'infoData.settleExRateSummarys': { // 当用户输入自定义核销汇率时，联动
      handler(newVal, oldVal) {
        // if (++ this.watchFormExchangeRatesTime === 1) return
        clearTimeout(this.timer2)
        this.timer2 = setTimeout(() => {
          if (this.infoData.settleExRateSummarys.length > 0) {
            newVal.forEach((item, index) => {
              console.log(item);
              console.log(index);
              // this.infoData.settleExRateSummarys[index].writeoffExRate = Number(item.settleExRateSummarys)
            })
            this.rateChange()
          }
        }, 500)
      },
      deep: true
    },
    'option1.data': { // 当用户输入自定义核销汇率时，联动
      handler(newVal, oldVal) {
        // if (++ this.watchFormExchangeRatesTime === 1) return
        clearTimeout(this.timer2)
        this.timer2 = setTimeout(() => {
          if (this.infoData.settleExRateSummarys.length > 0) {
            newVal.forEach((item, index) => {
              console.log(item);
              console.log(index);
              // this.infoData.settleExRateSummarys[index].writeoffExRate = Number(item.settleExRateSummarys)
            })
          }
          // this.infoData.settleExRateSummarys = this.option1.data.map(item => {
          //   let obj = this.infoData.settleExRateSummarys.find(subItem => {
          //     return item.originalCurrency === subItem.originalCurrency && item.settleCurrency === subItem.settleCurrency
          //   })
          //   item.writeoffExRate = obj && obj.writeoffExRate || item.writeoffExRate
          //   return item
          // })
        }, 500)
      },
      deep: true
    },
  },
  activated() {
    if (!this.$route.meta.isUseCache) {
      this.payOrderNo = this.$route.query.payOrderNo
      this.orderType = this.$route.query.orderType
      Object.assign(this.query , {
        otherPayables: '',
        otherPayAmt: '',
        bankseqFileNo: '',
        bankSeqNo: '',
        lessPayAmt: 0,
        lessPayDealway: '',
        remark: '',
      })
      this.getData()
    }
  },
}
</script>
<style scoped lang="scss">
.order-detail {
  .modifyfee-h2 {
    font-size: 18px;
    font-weight: 600;
    color: #222222;
    line-height: 25px;
    margin-top: 14px;
  }
  .detail-info-item {
    width: 270px;
  }
  .detail-info-item-max {
    width: 370px;
    display: inline-block;
    span {
      .amt {
        margin-left: 10px;
      }
    }
  }
  .detail-info-item {
    margin-bottom:2px;
    line-height: 0px;
  }
  .finance-approve-detail-main{
    padding: 0px 24px 16px;
  }
}
.finance-approve-btns-box {
  display: flex;
  justify-content: space-between;
  height: 40px;
  padding: 0 24px;
  border-radius: 4px 4px 0px 0px;
  border-bottom: 1px solid #e9e9e9;
}
.finance-approve-btns-left {
  font-size: 16px;
  font-weight: 600;
  color: #222222;
  line-height: 24px;
  margin-top: 8px;
}
.finance-approve-btns-right {
  margin-top: 6px;
}
// .finance-approve-detail-main {
//   padding: 20px 24px;
// }
</style>
<style lang="scss">
.order-detail .finance-detail-info .el-input,
.order-detail .finance-detail-info .el-input__inner {
  width: 147px;
}
.detail-info-item-1 {
  display: block;
  .dietail-info-div {
    margin-top: 4px;
  }
  .detail-info-item-div{
    display: inline-block;
    min-width: 284px;
  }
}
</style>