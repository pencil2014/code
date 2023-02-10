<template>
  <div class="order-detail">
    <div class="finance-approve-detail">
      <div class="finance-approve-btns-box">
        <div class="finance-approve-btns-left">预付抵账核销</div>
        <div class="finance-approve-btns-right">
          <el-button @click="cancel" size="mini">{{$t('Common.back')}}</el-button>
          <!-- <el-button @click="handleRouterDetailSettle" size="mini">预付款单</el-button> -->
          <el-button @click="submit" size="mini">核销</el-button>
          <el-button @click="writeOffPreview" size="mini" type="primary">确认复核</el-button>
        </div>
      </div>
      <div class="finance-approve-detail-main">
        <div class="finance-detail-info">
          <h3>{{$t('Payment.payDetail')}}</h3>
          <div class="detail-info-other">
            <span class="detail-info-item">结算单编号：{{payInfo.settleOrderNo}}</span>
            <span class="detail-info-item">结算请款编号：{{payOrder.sourceApplyNo}}</span>
            <span class="detail-info-item">付款单编号：{{payOrder.payOrderNo}}</span>
            <span class="detail-info-item">我司付款银行：{{payInfo.payBankName}}</span>
            <span class="detail-info-item">付款账号：{{payInfo.payAccountNo}}</span>
            <span class="detail-info-item">{{$t('Collect.bankFlowNumber')}}: {{payOrder.bankSeqNo}}</span>
            <span class="detail-info-item">{{$t('Settle.paymentCurrency')}}: {{payOrder.currency}}</span>
            <span class="detail-info-item">{{$t('Settle.applyPayAmt')}}: {{payOrder.applyAmt}}</span>
            <span class="detail-info-item">已用核销金额：{{payOrder.writeoffAmt}}</span>
            <span class="detail-info-item">发票号：{{payInfo.invoiceNo}}</span>
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
          <div class="detail-info-other" v-for="(item,index) in transferFees" :key="item+index">
            <span class="detail-info-item">预付款编号：{{item.payOrderNo}}</span>
            <span class="detail-info-item">内外扣类型：{{ dictMapObj.transferFeeType[item.cutType]  }}</span>
            <span class="detail-info-item">币种：{{item.currency}}</span>
            <span class="detail-info-item">金额：{{item.amt}}</span>
            <span class="detail-info-item">已摊金额：{{item.hasAllotAmt}}</span>
            <span class="detail-info-item">本次分摊：<el-input v-model="item.allotAmt" disabled type="text" size="mini"></el-input></span>
          </div>
        </div>
        <div class="finance-detail-info">
          <h3>状态</h3>
          <span class="detail-info-item">可用核销金额：{{infoData.useWriteoffAmt}}</span>
          <!-- <span class="detail-info-item">结算汇率：
            <span v-for="(item,index) in infoData.settleExRateSummarys" :key="index">
               <span>{{item.settleCurrency}}</span>- <span>{{item.originalCurrency}}</span> <span>{{item.settleExRate}}</span>
            </span>
          </span> -->
          <span class="detail-info-item">结算币种：{{payOrder.currency}}</span>
           <!-- <span class="detail-info-item">核销汇率：<el-input v-model="infoData.writeoffExRate" type="text" size="mini" v-lsNumber="{value:'number', obj:infoData, key:'writeoffExRate', dot:11}"></el-input> </span> -->
          
        </div>
        <span class="detail-info-item-1 finance-detail-info">
            <div class="detail-info-item-div">
              结算汇率：
              <div class="dietail-info-div" v-for="(item,index) in settleExRateSummarys" :key="index">
                <span>{{item.originalCurrency}}</span>-<span>{{item.settleCurrency}}</span>
                <el-input
                  width="50px"
                  disabled
                  v-model="item.settleExRate"
                  placeholder="请输入核销汇率"
                  v-lsNumber="{value:'number', obj:item, key:'writeoffExRate', dot:'11'}"
                  type="text"
                  size="mini"
                ></el-input>
              </div>
            </div>
            <div class="detail-info-item-div">
              核销汇率：
              <div class="dietail-info-div" v-for="(item,index) in writeoffRateSummarys" :key="index">
                <span>{{item.settleCurrency}}</span>-<span>{{item.writeoffCurrency}}</span>
                <el-input
                  width="50px"
                  v-model="item.writeoffExRate"
                  placeholder="请输入核销汇率"
                  disabled
                  v-lsNumber="{value:'number', obj:item, key:'writeoffExRate', dot:11}"
                  type="text"
                  size="mini"
                ></el-input>
              </div>
            </div>
          </span>
        
        <div class="finance-table-container" v-if="writeoffItems.length">
          <div class="money-box">
            <div class="money-box-left">
              <div class="money-title">{{moneyTitle1}}</div>
              <div class="money-title">
                    <div style="font-size:14px">
                      <span>原币应付合计：<span style="color:#7CBF2D">{{infoData.orgCurrencyAmtSummary}}</span></span>
                      <span  style="margin-left:16px">折算合计：<span style="color:#7CBF2D">{{infoData.settleCurrencyAmtSummary}}</span></span>
                    </div>
              </div>
            </div>
            <div class="money-box-right">
            </div>
          </div>
          <FinanceTable
          v-if="!showTable1"
          :option="option1"/>
        </div>
        
       
      </div>
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mapState } from 'vuex'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { queryPayWriteoff, saveWriteoffPayOrder, confirmPayWriteoff } from '@/api/fin/pay'
import {usableList } from '@/api/fin/invoicePayment'
import { saveOrderBizFee } from '@/api/fin/feeAdjust'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import Vue from 'vue'
export default {
  mixins: [mixin,routerMixin],
  data() {
    return {
      settleExRateSummarys:[],
      writeoffRateSummarys:[],
      writeoffReceipayId:null,
      writeoffReceipayNo:"",
      query:{
        bankseqFileNo:"",
        bankSeqNo:"",
        lessPayAmt:0,
        lessPayDealway:"",
        remark:"",
      },
      autocomplete:{},
      showTable1:false,
      rejectDialogOpen:false,
      showBillDetail: false,
      orderBillId:'',
      multipleSelection1: [],
      multipleSelection2: [],
      relevanceOpne:false,
      searchOption1:{
        columns: [
          {
            label: '发票号码',
            prop: 'auditSatus',
            type: 'select',
            selectOptions: [
            ]
          },
        ],
        data: {
          orderNo: '',
          createdDate: '',
          billNo: '',
          settleCorpName: '',
          settleCorpCode: ''
        },
      },
      option1: {},
      option2: {},
      moneyTitle1: '应付',
      moneyTitle2: '费用删除',
      moneyTitle3: '费用修改',
      moneyTotalReceive: [],
      comeType: '修改',
      hedgingRecord: [],
      deleteSelection: [],
      reason: '',
      applyPersonId: '',
      remark: '',
      employeeSelectOptions: [],
      infoData: {},

      payInfo: [],
      payOrder:{},
      transferFees:[],
      prepayUsables:[],
      writeoffItems:[],
      settleExRateSummarys:[],

      rejectDialogVisible: false,
      auditStatus: '',
      form: {
        errorCause:"error",
        errorRemark:"付错原因备注"
      }
    }
  },
  created() {
    let _this = this
    this.autocomplete = {
      querySearch: (queryString, cb) => {
        _this.selectedOptionItem = ''
        _this.querySettleUnit(queryString, cb)
      },
      select: (optionItem, row) => {
        _this.selectedOptionItem = optionItem
        console.log('this.selectedOptionItem:', _this.selectedOptionItem)
        _this.form.newSettleCorpName = optionItem.value
        _this.form.newSettleCorpCode = optionItem.key
      },
      change: (val, row) => {
        // 延时150ms获取select中的改变
        setTimeout(() => {
          if (_this.selectedOptionItem === '') {
            _this.form.newSettleCorpName = ''
            _this.form.newSettleCorpCode = ''
            return
          }
        }, 150)
      }
    }
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'PrepayWriteOffDetail',
      edit: true,
      data: [
        ... this.option.data
      ],
      tips: {
        text: '',
        show: false
      },
      operationBtns: {
        text: '',
        show: false
      },
      selection: {
        show: false
      }
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
      {prop: 'writeoffExRate', label: this.$t('Collect.writeoffrate'), type: 'input',  key: 'writeoffExRate', notAllowed: true, inputType:"number", dot:11},
      {prop: 'writeoffFeeAmt', label: this.$t('Charge.writeoffAmt'), type: 'input',  key: 'writeoffFeeAmt',notAllowed: true,  inputType:"number"},
      {prop: 'serviceName', label: this.$t('FeeList.serviceCodes'), type: 'text', key: 'serviceName'},
      {prop: 'feeUnit', label: this.$t('FeeList.feeUnit'), type: 'text',
        formatter: (row, pItem) => { 
          return this.dictMapObj.feeUnit[row[pItem.prop]]; 
        }
      },
      {prop: 'unitPrice', label: '单位', type: 'text', key: 'unitPrice'},
      {prop: 'unitCount', label: this.$t('FeeList.quantity'), type: 'text', key: 'unitCount'},
    ]
    let columns2 = ['invoiceType', 'invoiceNo', 'currencys', 'amt', 'splitUnitAmt', 'rate', 'taxRate']
    // if (this.isSpecialFee) columns = ['receipayType', 'consignerName', 'feeName', 'feeEnName', 'serviceCode', 'feeAmt', 'currency', 'remark']
    let arr1 = []
    columns1.forEach(value => {
      let obj1 = this.columnsBase.find(item => {
        return item.prop === value
      })
      if (obj1) arr1.push(obj1)
    })
    let arr2 = []
    columns2.forEach(value => {
      let obj2 = this.columnsBase.find(item => {
        return item.prop === value
      })
      if (obj2) arr2.push(obj2)
    })
    this.option1.columns = columns1
    this.option2.columns = arr2
  },
  methods: {
    getData() {
      queryPayWriteoff({writeoffReceipayNo:this.writeoffReceipayNo}).then(res => {
        if (res.code === 0) {
          this.writeoffReceipayId = res.data.writeoffReceipayId
          let { payOrder,transferFees,prepayUsables,writeoffItems,settleExRateSummarys } = res.data
          this.payOrder = payOrder
          this.transferFees = transferFees
          this.writeoffItems = writeoffItems
          this.prepayUsables = prepayUsables ? prepayUsables : []
          Object.assign( this.query,{
            otherPayables : res.data.payOrder.lessPayDealway,
            otherPayAmt : res.data.payOrder.lessPayAmt
          })
          let data = []
          writeoffItems.forEach(item => {
            item.edit = true
            data.push(item)
          })
          this.writeoffRateSummarys = writeoffItems
          this.option1.data = data
          this.settleExRateSummarys = settleExRateSummarys
          let list = []
          settleExRateSummarys && settleExRateSummarys.forEach(item=>{
            let data ={
              settleCurrency:item.settleCurrency,
              writeoffCurrency:item.originalCurrency,
              writeoffExRate: item.settleExRate
            }
            list.push(data)
          })
          this.writeoffRateSummarys = list
          this.infoData = res.data
          this.payInfo = res.data.payOrder.payInfo 
        }
      }).catch(err=>{
        console.log(err);
        this.delVisitedView()
        this.cancel()
      })
    },
    rejectSubmit() {
      if (this.multipleSelection2.length === 0) {
        this.$message({
          message: '请勾选需要手填发票的项！',
          type: 'error',
          showClose: true
        })
        return
      }
      let data = {
        receivableRegId:1,
        invoiceReceivableIds:this.multipleSelection2.map(item => {
          return item.invoiceReceivableId
        })
      }
      payOrderInvoiceRelation(data).then(res=>{
        if(res.code === 0){
          this.$message({message: '关联提交成功', type: 'success'});
          this.relevanceOpne = false
        }
      })
    },
    submit(){
      let data ={
        writeoffReceipayId:this.writeoffReceipayId,
        settleCompCode: this.infoData.settleCompCode,
        settleCompName: this.infoData.settleCompName,
        settleOrderNo:this.payInfo.settleOrderNo,
        payOrderId:this.payOrder.payOrderId,
        payOrderNo:this.payOrder.payOrderNo,
        sourceApplyNo:this.payOrder.sourceApplyNo,
        orderType:this.payOrder.orderType,
        applyAmt:this.payOrder.applyAmt,
        currency:this.payOrder.currency,
        settleCurrency:this.payOrder.currency,
        useWriteoffAmt:this.infoData.useWriteoffAmt,
        writeoffExRate:this.infoData.writeoffExRate,

        prepayUsables:this.prepayUsables,
        writeoffItems:this.writeoffItems,
        transferFees:this.transferFees,
        ...this.query,
      }
      saveWriteoffPayOrder(data).then(res=>{
        if (res.code === 0) {
            this.$message({type: 'success',  message: '提交成功!',  showClose: true })
          } else {
            this.$message({  type: 'error',  message: '提交失败!',  showClose: true })
          }
      })
    },
    //预付付款核销跳转
    handleRouterDetailSettle(){
      console.log(this.writeoffReceipayId);
      this.routerPush('DetailSettle', { writeoffReceipayNo:this.writeoffReceipayNo ,writeoffReceipayId:this.writeoffReceipayId })
    },
    employeeSelectlist(queryString) {
      let data = {
        "state": "valid",
        "name": queryString
      }
      this.$store.dispatch('dict/employeeSelectlist', data).then(data => {
        console.log(data)
        this.employeeSelectOptions = data.map(item => {
          return {
            label: item.value,
            value: item.key
          }
        })
      })
    },
    add() {
      let obj = {
        edit: true
      }
      this.option1.columns.forEach(item => {
        obj[item.prop] = ''
      })
      this.option1.data.push(obj)
    },
    handleDelete($index, row, option) {
      this.$confirm('是否确认删除？', this.$t('Common.tips'), {
        confirmButtonText: this.$t('Common.sure'),
        cancelButtonText: this.$t('Common.cancel'),
        type: 'warning'
      }).then(() => {
        this.option1.data.splice($index, 1)
      }).catch(() => {         
      })
    },
    writeOffPreview() {
      confirmPayWriteoff({writeoffReceipayIdList:[ this.writeoffReceipayId ]}).then(res => {
          if (res.code === 0) {
            this.$message({
              type: 'success',
              message: '提交成功!',
              showClose: true
            })
          } else {
            this.$message({
              type: 'error',
              message: '提交失败!',
              showClose: true
            })
          }
        })
    },
    handleCollapse() {
      this.showTable1 = !this.showTable1
    },
    cancel(refresh) {
      this.routerBack(refresh)
    },
    //优化分页时，发现方法search， sendMulti， getList 未用到， 删除 20220523 ly
    openBillDetail(payload) {
      console.log(payload);
      this.orderBillId = payload.billId
      this.showBillDetail = payload.show
    },
  },
  components: {
    FinanceTable,
    FinanceSearch
  },
  computed: {
    ... mapState({
      defaultColumns: state => state.finance.columns.defaultColumns,
      columnsBase: state => state.finance.columns.columnsBase3
    })
  },
  activated(){
    if (!this.$route.meta.isUseCache) {
      Object.assign(this.query , {
        otherPayables: '',
        otherPayAmt: '',
        bankseqFileNo: '',
        bankSeqNo: '',
        lessPayAmt: 0,
        lessPayDealway: '',
        remark: '',
      })
      this.writeoffReceipayNo = this.$route.query.writeoffReceipayNo ? this.$route.query.writeoffReceipayNo : -1
      this.writeoffReceipayId = this.$route.query.writeoffReceipayId ? this.$route.query.writeoffReceipayId : -1
      this.getData()
    }
  },
  watch: {
    'writeoffRateSummarys': { // 当用户输入自定义核销汇率时，联动
      handler(newVal, oldVal) {
        // if (++ this.watchFormExchangeRatesTime === 1) return
        clearTimeout(this.timer2)
        this.timer2 = setTimeout(() => {
          if (this.writeoffRateSummarys.length > 0) {
            newVal.forEach((item, index) => {
              
              this.option1.data = this.option1.data.map(item => {
                let obj = this.writeoffRateSummarys.find(subItem => {
                  return item.writeoffCurrency === subItem.writeoffCurrency  && item.settleCurrency === subItem.settleCurrency
                })
                item.writeoffExRate = obj && obj.writeoffExRate || item.writeoffExRate
                return item
              })
            })
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
          if (this.writeoffRateSummarys.length > 0) {
            newVal.forEach((item, index) => {
              // this.writeoffRateSummarys[index].writeoffExRate = item.writeoffExRate
            })
          }
        }, 500)
      },
      deep: true
    },
    multipleSelection(val) {
      this.comeType = this.multipleSelection.length > 0 ? '修改' : '新增'
      let data1 = []
      let data2 = []
      this.multipleSelection.forEach(item => {
        let obj1 = Object.assign({}, item, {
          edit: true
        })
        data1.push(obj1)
        let obj2 = { ... item }
        let obj3 = { ... item }
        obj3.feeAmt = 0 - obj3.feeAmt
        data2.push(obj2, obj3)
      })
      this.option1.data = data1
      this.option2.data = data2
    },
    dialogVisible(val) {
      if (val) {
        this.getData()
      }
    }
  }
}
</script>
<style scoped lang="scss">
  .order-detail{
    padding: 10px;
    .modifyfee-h2{
    font-size: 18px;
    font-weight: 600;
    color: #222222;
    line-height: 25px;
    margin-top: 14px;
    }
    .detail-info-item{
      max-width: 270px;
    }
  }
</style>
<style scoped>
.finance-approve-btns-box{
  display: flex;
  justify-content: space-between;
  height: 40px;
  padding: 0 24px;
  border-radius: 4px 4px 0px 0px;
  border-bottom: 1px solid #E9E9E9;
}
.finance-approve-btns-left{
  font-size: 16px;
  font-weight: 600;
  color: #222222;
  line-height: 24px;
  margin-top: 8px;
}
.finance-approve-btns-right{
  margin-top: 6px;
}
.finance-approve-detail-main{
  padding: 20px 24px;
}


</style>
<style scoped lang="scss">
.order-detail .tips-container {
    display: none !important;
}
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
    min-width: 270px;
  }
}
</style>