<template>
  <div 
    :element-loading-background="eLoadingBackground"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-text="eLoadingText"
    class="finance-page invoice-payment-list-reg"
    v-loading="loading"
  >
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom invoice-payment-list-reg-top header-active">
        <div class="money-box-left">
          <div class="money-title">{{titleName}}</div>
        </div>
        <div class="money-box-right">
          <!-- <el-button v-if="titleName !== '发票修改'" @click="handleAdd('')" type="primary" size="mini">新增发票</el-button> -->
          <el-button @click="cancel" size="mini">返回</el-button>
        </div>
      </div>
      <div class="identify-elec-upload-cont">
        <FinanceUploadEmbed ref="identifyUpload" :width="'100%'" :acceptTypes="acceptTypes" :acceptSelf="acceptSelf" :notice="'点击或将文件拖拽到这里，一批最多上传10张'" :limit="10" :auto-upload="false" @send-file-list="sendFileList">
        </FinanceUploadEmbed>
        <!-- <div class="identify-elec-upload-clear">
          <el-button @click="clearFiles" type="warning" size="mini">清空</el-button>
        </div> -->
      </div>
      <el-form
        :model="item"
        :rules="invoicePaymentAddRules"
        :ref="'invoicePaymentList'+currIndex"
        :inline="true"
        size="mini"
        label-width="95px"
        @scroll="scrollEvent"
        class="invoice-payment-list-reg-form"
      >
      <!-- v-for="(item,index) in invoicePaymentList" :key="'invoicePaymentList'+index" -->
        <!-- :style="screenHeight" -->
        <div class="dialog-add-dialog-item-1">
          <!-- <div
            class="finance-table-container"
          >
            <div class="money-box">
              <div class="money-box-left">
                <div class="money-title">发票信息-发票{{index+1}}</div>
              </div>
              <div class="money-box-right">
                <el-button
                  v-if="index !== 0"
                  type="danger"
                  @click="handleDelete(index)"
                  size="mini"
                >删除</el-button>
                <el-button
                  type="text"
                  class="collapse-btn"
                  @click="handleCollapse(item)"
                  size="mini"
                >
                  {{ item.show ? '收起' : '展开'}}
                  <i :class="item.show ? `el-icon-arrow-up` : `el-icon-arrow-down`"></i>
                </el-button>
              </div>
            </div> -->
            <div><p class="title">发票信息</p></div>
            <div class="item-list-invoice-payment"><!-- v-show="item.show" -->
                <el-form-item label="发票代码" :prop="`invoiceCode`" :rules="[{ pattern: /^[A-Za-z0-9]+$/, message: '必须数字或字母' }]">
                <!-- :rules="[{ required: true, message: ' ', trigger: 'blur' },{ pattern: /^[A-Za-z0-9]+$/, message: '必须数字或字母' }]" -->
                  <el-input v-model="item.invoiceCode" maxlength="16" placeholder="请输入发票代码"></el-input>
                </el-form-item>
                <el-form-item label="发票类型" :prop="`invoiceType`" :rules="{ required: true, message: ' ', trigger: 'blur' }">
                  <el-select v-model="item.invoiceType" placeholder="请选择发票类型" style="width:170px;">
                      <el-option
                      v-for="(op, j) in dictMap['invoiceType']"
                      :key="'invoiceType' + j"
                      :label="op.label"
                      :value="op.value"
                      ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="开票日期" :prop="`invoiceIssueDate`" :rules="{ required: true, message: ' ', trigger: 'blur' }">
                    <el-date-picker value-format="yyyy-MM-dd" v-model="item.invoiceIssueDate" placeholder="请选择" style="width:170px;"></el-date-picker>
                </el-form-item>
                <!-- <el-form-item label="发票号" :prop="`invoiceNo`" :rules="[{ required: true, message: ' ', trigger: 'blur' },{ pattern: /^[0-9]+$/, message: '必须数字' },{ len:8, message:'必须8位', trigger:'blur' }]"> -->
                <el-form-item label="发票号" :prop="`invoiceNo`" :rules="[{ required: true, message: ' ', trigger: 'blur' },{ pattern: /^[0-9]+$/, message: '必须数字' }]">
                    <el-input v-model="item.invoiceNo" placeholder="请输入8位或20位的数字"></el-input>
                </el-form-item>
                <el-form-item label="发票金额" :prop="`amt`" :rules="{ required: true, message: ' ', trigger: 'blur' }" >
                  <el-input
                      @input="changeAmt(item, 'amt')"
                      maxlength="16"
                      v-model="item.amt"
                      placeholder="请输入"
                  ></el-input>
                  <!-- @change="changeRates(item)" -->
                </el-form-item>
                <el-form-item label="发票税率" :prop="`taxRate`" :rules="{ required: true, message: ' ', trigger: 'blur' }">
                    <el-select v-model="item.taxRate" placeholder="请选择" @change="changeAmt(item)" style="width:170px;">
                        <el-option
                        v-for="(op, j) in dictMap.taxRateInfo"
                        :key="'currency' + j"
                        :label="op.label"
                        :value="+op.value"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="开票币种" :prop="`currency`" :rules="{ required: true, message: ' ', trigger: 'blur' }" >
                    <!-- disabled -->
                    <el-select
                    v-model="item.currency"
                    filterable 
                    placeholder="请选择"
                    @change="changeAmt(item)"
                    style="width:170px;">
                    <!-- @input="changeAmt(item)" -->
                    <!-- @change="changeCurrency(item.currency,index)"  -->
                        <el-option
                        v-for="(op, j) in validCurrencyList"
                        :key="'currency' + j"
                        :label="op.label"
                        :value="op.value"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item v-if="item.currency !== 'CNY'" label="开票汇率" :prop="`rate`" :rules="{ required: true, message: ' ', trigger: 'blur' }">
                    <el-input
                      :disabled="item.currency === 'CNY'"
                      v-model="item.rate"
                      @input="changeAmt(item)"
                      maxlength="16"
                      placeholder="请输入"
                    ></el-input>
                    <!-- @change="changeRates(item)" -->
                </el-form-item>
                <!-- <el-form-item label="发票登记号" :prop="`receiveNo`" :rules="[{ required: isCompany && item.invoiceType !== 'electronic', message: ' ', trigger: 'change' },{ pattern:  /^[A-Za-z0-9]+$/, message: '必须数字或字母' }]">
                    <el-input v-model="item.receiveNo" maxlength="32" placeholder="请输入"></el-input>
                </el-form-item> -->
                <el-form-item label="税额" :prop="`taxAmt`" :rules="{ required: false, message: ' ', trigger: 'change' }">
                    <el-input v-model="item.taxAmt" maxlength="16" placeholder="请输入"></el-input>
                </el-form-item>
                <el-form-item label="价税合计(CNY)" :prop="`amtCny`" :rules="{ required: false, message: ' ', trigger: 'change' }">
                    <el-input v-model.trim="item.amtCny" maxlength="16" placeholder="请输入"></el-input>
                    <!-- @input="changeRate(item)" @change="changeRates(item)" -->
                </el-form-item>
                <el-form-item label="备注" :prop="`remark`" class="el-form-item-invoice-remark el-form-item-invoice-remark-20" >
                    <el-input
                        type="textarea"
                        v-model="item.remark"
                        placeholder="请输入备注，不能超过500个字"
                        maxlength="500"
                        show-word-limit
                    ></el-input>
                </el-form-item>
            </div>
          <!-- </div> -->
        </div>
        <div class="dialog-add-dialog-item-1">
            <div><p class="title">我司信息</p></div>
             <el-form-item  label="我司账号简称" :prop="`accountShortName`" :rules="{ required: true, message: ' ', trigger: 'blur' }">
                <el-select
                  style="width:170px"
                  v-model="item.accountShortName"
                  :disabled="!item.currency"
                  value-key="accountNo"
                  placeholder="请选择"
                  :remote-method="(queryString) => {accountShortNameList(queryString,scope.row)}"
                  @change="accountShortNameChange"
                >
                <!-- @focus="accountShortNameFocus" -->
                  <el-option
                  v-for="(op, j) in invoiceBankFilterList || []"
                  :key="'invoiceType' + j"
                  :label="op.accountShortName"
                  :value="op"
                  ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="我司发票抬头" :prop="`title`">
                <el-input v-model="item.title" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="纳税人识别号" :prop="`taxNo`">
                <el-input v-model="item.taxNo" disabled placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="我司开户行" :prop="`bankName`">
                <el-input :value="`${item.bankName ? item.bankName : ''}${item.bankBranchName?'(':''}${item.bankBranchName ? item.bankBranchName : ''}${item.bankBranchName?')':''}`" placeholder="请输入" disabled></el-input>
            </el-form-item>
            <el-form-item label="我司账号" :prop="`accountNo`">
                <el-input v-model="item.accountNo" placeholder="请输入" disabled></el-input>
            </el-form-item>
            <el-form-item label="我司电话" :prop="`tel`">
                <el-input v-model="item.tel" disabled placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="我司地址" :prop="`addr`" class="el-form-item-invoice-remark el-form-item-invoice-remark-20" >
              <el-input
                type="textarea"
                v-model="item.addr"
                placeholder="请输入"
                maxlength="500"
                show-word-limit
              ></el-input>
            </el-form-item>
        </div>
        <div class="dialog-add-dialog-item">
            <div><p class="title">供应商信息</p></div>
            <el-form-item label="结算单位" :prop="`supplierCorpCode`" :rules="{ required: true, message: ' ', trigger: 'blur' }">
                <el-autocomplete
                    style="width:170px"
                    v-model="item.supplierCorpName"
                    placeholder="请输入"
                    clearable
                    :select-when-unmatched="true"
                    :fetch-suggestions="(queryString, cb) => {autocomplete.querySearch && autocomplete.querySearch(queryString, cb, item)}"
                    @select="(value) => {autocomplete.select && autocomplete.select(value, item)}"
                    @change="(value) => {autocomplete.change && autocomplete.change(value, item)}"
                ></el-autocomplete>
            </el-form-item>
            <el-form-item label="发票抬头" :prop="`supplierTitle`">
                <el-input v-model="item.supplierTitle" maxlength="32" disabled placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="纳税人识别号" :prop="`supplierTaxpayerNo`">
                <el-input v-model="item.supplierTaxpayerNo" maxlength="32" disabled placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="银行账号" :prop="`supplierAccountNo`" :rules="{ required: true, message: ' ', trigger: 'blur' }">
                <el-select
                    style="width:170px"
                    v-model="item.supplierAccountNo"
                    value-key="accountNo"
                    placeholder="请选择"
                    @change="corpBankChange"
                    @focus="corpBankChangeFocus"
                >
                    <el-option
                    v-for="(op, j) in item.bankAccountsList || []"
                    :key="'invoiceType' + j"
                    :label="op.bankName + ' ' +op.accountNo"
                    :value="op"
                    ></el-option>
                </el-select>
                <!-- <el-input v-model="item.supplierAccountNo" placeholder="请输入" ></el-input> -->
            </el-form-item>
            <el-form-item label="开户行" :prop="`supplierBankName`">
                <el-input :value="`${item.supplierBankName ? item.supplierBankName : ''}${item.supplierBankBranchName?'(':''}${item.supplierBankBranchName ? item.supplierBankBranchName : ''}${item.supplierBankBranchName?')':''}`" placeholder="请输入" disabled></el-input>
            </el-form-item>
            <el-form-item label="电话" :prop="`supplierTel`">
                <el-input v-model="item.supplierTel" disabled placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item style="margin-bottom:0;" label="地址" class="el-form-item-invoice-remark el-form-item-invoice-remark-20" >
              <el-input
                  type="textarea"
                  v-model="item.supplierAddr"
                  disabled
                  placeholder="请输入"
                  maxlength="500"
                  show-word-limit
              ></el-input>
            </el-form-item>
        </div>
        <div v-if="item.invoiceImgFileNo" style="text-align:center;">
          <img width="900px" height="600px" :src="`/base/fileView/preview/${item.invoiceImgFileNo}/sowoll`" />
        </div>
      </el-form>
      <div style="position:fixed;right:110px;bottom:55px;width:40px;">
        <el-tooltip v-if="from!=='InvoicePaymentList'" content="全部提交完成后，会自行返回">
          <el-button style="min-width:88px;" :loading='loadingAdd' :disabled="!item.invoiceNo" @click="submitAdd" type="primary" size="mini">{{hasNext?'提交&amp;识别下一张':'提交'}}</el-button>
        </el-tooltip>
        <el-button v-else style="min-width:88px;" :loading='loadingAdd' :disabled="!item.invoiceNo" @click="submitAdd" type="primary" size="mini">{{hasNext?'提交&amp;识别下一张':'提交'}}</el-button>
      </div>
      <div v-if="false" style="position:fixed;right:110px;bottom:25px;width:40px;">
        <el-button style="min-width:88px;" :loading='loadingAdd' @click="goInvoicePayList" size="mini">{{goBtnText}}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { getSettleUnitInvoiceInfo } from '@/api/fin/invoiceReceivableApply'
import { getValueByKey } from '@/api/order/list'
import { getCompanyInvoiceInfo } from '@/api/fin/company'
import { add, info, invoicePaymentUpdate, uploadInvoiceFileAndOcr } from '@/api/fin/invoicePayment'
  var day2 = new Date();
  day2.setTime(day2.getTime());
  let m = (day2.getMonth()+1) > 9 ? (day2.getMonth()+1) : '0' + (day2.getMonth()+1)
  let d = day2.getDate() > 9 ? day2.getDate() : '0' + day2.getDate()
  let defaultTime = day2.getFullYear()+"-" + m + "-" + d;
  let timer1 = ''
  let invoicePaymentList = [
    {
      show:true,
      invoicePaymentId: '',
      invoiceNo: '',
      invoiceCode: '',
      currency: 'CNY',
      amt: '',
      invoiceIssueDate: defaultTime,
      taxRate: 0,
      rate: '',
      taxAmt: '',
      invoiceType: '',
      remark: '',
      receiveNo: '',
      fileNo: '',
      fileName: '',
      checkInvoiceFileName: "",
      checkInvoiceFileNo: "",
      amtCny : '',
      invoiceNoFlag:false,
      currencyDisabled: false,
      supplierCorpName: '',
      supplierCorpCode: '',
      corpBank: null,
      bankAccounts: [],
      title: '',
      taxNo: '',
      supplierTitle: '',
      supplierBankName: '',
      supplierBankBranchName: '',
      supplierTel: '',
      supplierAddr: '',
      supplierAccountNo: '',
      bankName: '',
      accountNo: '',
      addr: '',
      tel: '',
      supplierTaxpayerNo: '',
      accountShortName: '',
      selfCurrecny: '',
      supplierCurrency: '',
      fileNo: '',
      fileName: '',
      checkInvoiceFileName: "",
      checkInvoiceFileNo: "",
      bankAccountsPubList:[]
    }
  ]
import FinanceUploadEmbed from '@/views/finance/components/financeUpload/financeUploadEmbed'

export default {
  name:'identifyElecInvoice',
  mixins: [mixin, routerMixin],
  data(){
    // let rules = [{ required: true, message: '必填', trigger: 'change' }]
    // let invoicePaymentAddForm = {
    //   payApplySettleNo:"",
    //   supplierCorpName: '',
    //   supplierCorpCode: '',
    //   corpBank: null,
    //   bankAccounts: [],
    //   // invoiceBankList:[],
    //   title: '',
    //   taxNo: '',
    //   supplierTitle: '',
    //   supplierBankName: '',
    //   supplierBankBranchName: '',
    //   supplierCurrency: '',
    //   supplierTel: '',
    //   supplierAddr: '',
    //   supplierAccountNo: '',
    //   bankName: '',
    //   accountNo: '',
    //   addr: '',
    //   tel: '',
    //   supplierTaxpayerNo: '',
    //   accountShortName: '',
    //   invoicePaymentList: [],
    //   bankAccountsPubList:[],
    // }
    // let invoicePaymentAddRules = {}
    // Object.keys(invoicePaymentAddForm).forEach((item) => {
        // if (item === 'supplierCorpCode' || item === 'remark' || item === 'taxAmt') return
        // invoicePaymentAddRules[item] = item !== 'supplierCorpName' ? rules : [{ ...rules[0], trigger: 'change' }]
    // })
    return {
      width:732,
      cTimestamp: 0,
      vm: this,
      loading: false,
      defaultTime,
      invoicePaymentId:'',
      invoiceNo:'',
      invoicePaymentAddRules: {},
      invoicePaymentList: [{ ...invoicePaymentList[0] }],
      validCurrencyList:[],
      srcCurrencyList: [],
      isCompany: false,
      uploadApi2: '/base/webapi/file/upload',
      uploadParams2: {},
      isShowUpload: true,
      fileListEdit:[],
      fileListEditList:[],
      // 供应商信息
      autocomplete: {},
      titleName: '电子发票识别',
      screenHeight: 0,
      loadingAdd: false,
      acceptTypes: ['pdf'],
      acceptSelf: 'application/pdf',
      fileList: [],
      currIndex: 0,
      item: {},
      invoiceBankList: [],
      invoiceBankFilterList: [],
      currecny: '',
      supplierCorpName: '',
      supplierCorpCode: '',
      settleCompCode: '',
      recvAccountNo: '',
      recvBankAccountId: '',
      from: '',
      sPayApplyQuery: {},
      sessionInvoicePay: [],
    }
  },
  mounted() {
    // const that = this
    // window.onresize =()  =>{
    //   return (()=>{
    //     window.screenHeight = window.innerHeight
    //     var height = window.screenHeight -99
    //     this.screenHeight = { height: height + 'px' };
    //   })()
    // }
  },
  created(){
    console.log(this.invoicePaymentList)
    this.item = this.invoicePaymentList[0]
    this.autocomplete = {
      querySearch: (queryString, cb, item) => {
        if(item.currency === ''){
          return this.$msgErrClose('请先选择币种！')
        }
        this.querySettleUnit({ queryString, isAdd: true }, cb)
      },
      select: (optionItem, item) => {
        item.supplierCorpName = optionItem.value
        item.supplierCorpCode = optionItem.key
        getSettleUnitInvoiceInfo({ unitCode: optionItem.key }).then((res) => {
          if (!res.data) {
            item.supplierTaxpayerNo = ''
            return this.$msgErrClose('该客商无开票信息！')
          }
          item.supplierTaxpayerNo = res.data.taxNo
          item.supplierTitle = res.data.title
          item.bankAccounts = res.data.bankAccounts
          item.supplierAddr = res.data.addr
          item.supplierTel = res.data.tel
          // item.supplierAccountNo = res.data.accountNo
          // item.supplierBankName = res.data.bankName
          this.bankAccountListData()
          let bankAccountList = []
          if(item.bankAccountsPubList && item.bankAccountsPubList.length){
            item.bankAccountsPubList.forEach(acct=>{
              if(acct.currency === item.currency){
                bankAccountList.push(acct)
              }
            })
          }
          item.bankAccountList = bankAccountList
          if(item.bankAccounts.length){
            if(item.currency){
              if(item.bankAccountsList && item.bankAccountsList.length){
                let bankAccountsList = item.bankAccountsList.filter(acct=>{
                  return acct.currency === item.currency
                })
                item.supplierAccountNo = bankAccountsList[0].accountNo
                item.supplierBankName = bankAccountsList[0].bankName
                item.supplierBankBranchName = bankAccountsList[0].bankBranch
                item.supplierCurrency = bankAccountsList[0].currency
              }
            }
          }
        })
      },
      change: (value, item) => {
        if(item.supplierCorpName===""){
          Object.assign(item,{},{
            supplierCorpName:'',
            supplierCorpCode:"",
            supplierTitle: '',
            supplierBankName: '',
            supplierBankBranchName: '',
            supplierCurrency: '',
            supplierTel: '',
            supplierAddr: '',
            supplierAccountNo: '',
            supplierTaxpayerNo: '',
          })
          item.bankAccountsList = []
          this.$forceUpdate()
        }
          
      },
    }
    this.cTimestamp = new Date().getTime()
    this.init()
  },
  methods:{
    cancel(flag){
      // this.routerBack(flag)
      if (this.fromSettlePayApply) {
        this.goInvoicePayList() // 调用稍早写的方法
      } else {
        this.routerBack(true)
      }
      this.$refs[`invoicePaymentList${this.currIndex}`].clearValidate()
    },
    goInvoicePayList() {
      if (this.from) {
        let query = {}
        if (this.fromSettlePayApply) {
          console.log(this.fileList)
          console.log(this.invoicePaymentList)
          // if (!this.fileList.length || !this.fileList[0].isSubmited) { // 改成全部提交后自行返回，此处不需拦截
          //   return this.$msgErrClose('无发票可关联，关联前需先提交！')
          // }
          this.fileList.forEach((item, index) => {
            if (item.isSubmited) {
              if (this.invoicePaymentList[index]) {
                this.sessionInvoicePay.push(this.invoicePaymentList[index])
              }
            }
          })
          console.log(this.sessionInvoicePay)
          if(this.from2 === 'prepayEdit'){
            sessionStorage.setItem(this.req, JSON.stringify(this.sessionInvoicePay))
            this.$router.push({ name: 'PrepayList' })
            return
          }
          sessionStorage.setItem('sessionInvoicePay', JSON.stringify(this.sessionInvoicePay))
          query = {
            hasSessionInvoicePay: true,
            // ...this.sPayApplyQuery
          }
        }
        // this.routerPush(this.from, query)
        this.$router.push({
          name: this.from,
          query
        })
      } else {
        this.$router.push({ name: 'InvoicePaymentList' })
        // this.routerPush('InvoicePaymentList')
      }
    },
    init(){
      // // 我司信息
      // this.isCompany = false
      // getCompanyInvoiceInfo({ companyCode:  this.$route.query.settleCompCode || this.$store.state.user.userInfo.settleCompanyCode}).then(res=>{
      //   if (!res.data) {
      //     return
      //   }
      //   getValueByKey("FIN_INVOICE_RECNO_VALID_COMPANY").then(data=>{
      //     let getValueByKeyList = data.data.split(",")
      //     for (let i = 0; i < getValueByKeyList.length; i++) {
      //       if(getValueByKeyList[i] == res.data.companyCode){
      //         //深圳长帆供应链、深圳长帆物流，这两个深圳的公司，纸质发票，发票登记号是必填
      //         this.isCompany = true
      //       }
      //     }
      //   })
      // })
      this.currency = this.$route.query.currency
      this.supplierCorpName = this.$route.query.supplierCorpName
      this.supplierCorpCode = this.$route.query.supplierCorpCode
      this.settleCompCode = this.$route.query.settleCompCode
      this.recvAccountNo = this.$route.query.recvAccountNo
      this.recvBankAccountId = this.$route.query.recvBankAccountId
      this.from = this.$route.query.from
      this.from2 = this.$route.query.from2
      this.req = this.$route.query.req
      console.log(this.$route.query)
      this.getCompanyInvoiceInfo()
      this.validCurrencyListData()
      this.sessionInvoicePay = []
    },
    getCompanyInvoiceInfo() {
      getCompanyInvoiceInfo({ companyCode: this.$store.state.user.userInfo.settleCompanyCode }).then(res=>{
        if (!res.data) {
          return []
        }
        // getValueByKey("FIN_INVOICE_RECNO_VALID_COMPANY").then(data=>{
        //   let getValueByKeyList = data.data.split(",")
        //   for (let i = 0; i < getValueByKeyList.length; i++) {
        //     if(getValueByKeyList[i] == res.data.companyCode){
        //       //深圳长帆供应链、深圳长帆物流，这两个深圳的公司，纸质发票，发票登记号是必填
        //       this.isCompany = true
        //     }
        //   }
        // })
        this.invoiceBankList = res.data.invoiceBankList
      })
    },
    validCurrencyListData(){ 
      //应付发票允许录入的币种配置
      getValueByKey('FIN_INVOICE_PAYMENT_CURRENCY_CONFIG').then(res=>{
        this.validCurrencyList = [...(this.dictMap['validCurrency'].slice(0, 100).filter(item => res.data.split(",").includes(item.label)))]
        // this.validCurrencyList = [...(this.dictMap['validCurrency'].slice(0, 100).filter(item => res.data.split(",").filter(subItem => subItem !== 'HKD').includes(item.label)))]
      })
      // getValueByKey('FIN_INVOICE_PAYMENT_RATE_CONFIG').then(res=>{
      //   this.srcCurrencyList = res.data
      // })
    },
    changeAmt(val, flag){
      // if (flag === 'amt' && val.currency !== 'CNY') {
      //   if (val.amtCny ) {
      //     clearTimeout(timer1)
      //     timer1 = setTimeout(() => {
      //       let amt1 = parseFloat(val.amt ? val.amt : 0)
      //       let amtCny1 = parseFloat(val.amtCny ? val.amtCny : 0)
      //       if(!amt1){
      //         val.rate = 0
      //       }else{
      //         val.rate = Math.round((amtCny1/amt1)*10000000000)/10000000000
      //       }
      //       return val
      //     },800)
      //   } else {
      //     clearTimeout(timer1)
      //     timer1 = setTimeout(() => {
      //       let amt = parseFloat(val.amt ? val.amt : 0)
      //       let rate = parseFloat(val.rate ? val.rate : 0)
      //       let taxRate = parseFloat(val.taxRate ? val.taxRate : 0)
      //       //不含税金额 = 四舍五入(USD金额×开票汇率/(1+税率))
      //       //税额 = USD金额×开票汇率-不含税金额。
      //       let amtCny = this.mathRound(amt * rate);
      //       let excludingTaxAmt = amtCny/(1 + taxRate);
      //       val.taxAmt = this.mathRound(amtCny-amtCny/(1 + taxRate));
      //       // new LSnum(amtCny).minus(new LSnum(amtCny).div(new LSnum(1).plus(taxRate))).toNum(2)
      //       val.amtCny = this.mathRound(excludingTaxAmt + val.taxAmt);
      //     },800)
      //     return val
      //   }
      // } else {
        clearTimeout(timer1)
        timer1 = setTimeout(() => {
          let amt = parseFloat(val.amt ? val.amt : 0)
          let rate = val.currency === 'CNY' ? 1 : parseFloat(val.rate ? val.rate : 0) // let rate = parseFloat(val.rate ? val.rate : 0)
          let taxRate = parseFloat(val.taxRate ? val.taxRate : 0)
          if(val.taxAmt && val.amt){

          }
          //不含税金额 = 四舍五入(USD金额×开票汇率/(1+税率))
          //税额 = USD金额×开票汇率-不含税金额。
          // let amtCny = this.mathRound(amt * rate);
          let amtCny = new LSnum(amt).times(rate);
          // let excludingTaxAmt = amtCny/(1 + taxRate);
          let excludingTaxAmt = amtCny.div(1 + taxRate);
          // val.taxAmt = this.mathRound(amtCny-amtCny/(1 + taxRate));
          val.taxAmt = amtCny.minus(amtCny.div(new LSnum(1).plus(taxRate))).toNum(2);
          // new LSnum(amtCny).minus(new LSnum(amtCny).div(new LSnum(1).plus(taxRate))).toNum(2)
          // val.amtCny = this.mathRound(excludingTaxAmt + val.taxAmt);
          this.$set(val, 'amtCny', amtCny.toNum(2))
        },800)
        // return val
      // }
    },
    // 注释 changeRate 及 mathRound
    // changeRate(val){
    //   console.log(val);
    //   let amt = parseFloat(val.amt ? val.amt : 0)
    //   let amtCny = parseFloat(val.amtCny ? val.amtCny : 0)
    //   if(val.currency === 'CNY') {
    //     val.amt = val.amtCny
    //   }else {
    //     if(!val.amt) return
    //     timer1 = setTimeout(() => {
    //       val.rate = Math.round((amtCny/amt)*10000000000)/10000000000
    //     },800)
    //   } 
    //   let rate = parseFloat(val.rate ? val.rate : 0)
    //   let taxRate = parseFloat(val.taxRate ? val.taxRate : 0)
    //   //不含税金额 = 四舍五入(USD金额×开票汇率/(1+税率))
    //   //税额 = USD金额×开票汇率-不含税金额。
    //   let amts = parseFloat(val.amt ? val.amt : 0)
    //   let amtCnys = this.mathRound(amts * (Math.round((amtCny/amts)*10000000000)/10000000000));
    //   val.taxAmt = this.mathRound(amtCnys-amtCnys/(1 + taxRate));
    //   return val
    // },
    // mathRound(num){
    //   return Math.round(num*100)/100
    // },
    sendFileList(payload) {
      this.fileList = payload
      console.log(payload)
      // if (this.fileList && this.fileList.length) {
      //   if (!this.fileList[0].isIdentified) {
      //     this.identifyFile(0)
      //   }
      // }
      let index = this.fileList.findIndex(item => {
        return !item.isSubmited
      })
      console.log(index)
      this.identifyFile(index)
    },
    identifyFile(index) {
      if (index < 0) { // 用于早先开发的清空的功能
        return this.clearFiles()
      }
      const file = this.fileList[index]
      if (file.isIdentified) return
      const form = new FormData()
      form.append('fileNames', file)
      this.loading = true
      file.isIdentified = true // 放到里面会执行多次
      uploadInvoiceFileAndOcr(form).then(res => {
        if (this.invoicePaymentList[index]) {
          this.invoicePaymentList[index] = Object.assign(this.invoicePaymentList[index], res.data[0])
        } else {
          this.$set(this.invoicePaymentList, index, Object.assign({}, res.data[0]))
        }
        this.item = this.invoicePaymentList[index]
        this.currIndex = index
        if (this.item.currency) {
          this.invoiceBankFilterList = this.invoiceBankList.filter(acct => {
            return acct.currency === this.item.currency
          })
        }
        this.changeAmt(this.item)
      }).catch(err => {
        file.isIdentified = false
      }).finally(() => {
        this.loading = false
      })
    },
    clearFiles() {
      this.$refs.identifyUpload.$refs.upload.clearFiles()
      this.invoicePaymentList = [{ ...invoicePaymentList[0] }]
      this.currIndex = 0
      this.item = this.invoicePaymentList[0]
      console.log(this.item)
    },
    //提交按钮
    submitAdd() {
      // // test begin
      // this.fileList[this.currIndex].isSubmited = true
      // if (this.hasNext) {
      //   this.identifyFile(this.currIndex+1)
      // } else {
      //   this.clearFiles()
      // }
      // return
      // // test end
      console.log(this.invoicePaymentList)
      this.$refs['invoicePaymentList'+this.currIndex].validate((valid) => {
        if (valid) {
          let invoiceList = this.invoicePaymentList
          for (let i = 0; i < invoiceList.length; i++) {
            if(invoiceList[i].invoiceNo && invoiceList[i].invoiceNo.length !== 8 && invoiceList[i].invoiceNo.length !== 20){
              return this.$msgErrClose(`发票号的长度只能是8位或20位！`)
            }
            if (!this.validateMoney(invoiceList[i].amt, { positive: true })) return
            if(invoiceList[i].currency !== 'CNY' && invoiceList[i].rate == 1){
              return this.$msgErrClose(`开票币种${invoiceList[i].currency}的汇率不能为1！`)
            }
            // for (let j = 0; i < this.srcCurrencyList.length; j++) {
            //   if(this.srcCurrency[j].srcCurrency === invoiceList[i].currency){
            //     if(invoiceList[i].rate < this.srcCurrency[j].lowerRate && invoiceList[i].rate > this.srcCurrency[j].upperRate ){
            //        return this.$msgErrClose('系统设置汇率上下限: '+this.srcCurrency[j].srcCurrency+'-> CNY【'+this.srcCurrency[j].lowerRate+'-'+this.srcCurrency[j].upperRate+'】')
            //     }
            //   }
            // }
            if(invoiceList[i].currency === 'USD'){
              if(invoiceList[i].rate < 6){
                if(invoiceList[i].rate !== ''){
                  if(invoiceList[i].rate !== 0){
                    return this.$msgErrClose(`发票信息-发票${i+1}，USD-CNY 开票汇率不能小于6！`)
                  }
                }
              }
            }
            if(invoiceList[i].currency === 'HKD'){
              if(invoiceList[i].rate < 0.7){
                return this.$msgErrClose(`发票信息-发票${i+1}，HKD-CNY 开票汇率不能小于0.7！`)
              }
            }
          }
          let invoiceNoCode = []
          this.invoicePaymentList.forEach(item=>{ // data.invoicePaymentList
            invoiceNoCode.push(item.invoiceNo + item.invoiceCode)
          })
          let data = this.invoicePaymentList[this.currIndex]
          let invoicePaymentAddForm = {}
          Object.assign(invoicePaymentAddForm, {}, {
            // invoiceBankList: data.invoiceBankList,
            title: data.title,
            taxNo: data.taxNo,
            bankName: data.bankName,
            bankBranchName: data.bankBranchName,
            accountNo: data.accountNo,
            addr: data.addr,
            tel: data.tel,
            accountShortName: data.accountShortName,
            selfCurrecny: data.currecny,
            companyCode: data.companyCode,
            supplierCorpCode: data.supplierCorpCode,
            supplierCorpName: data.supplierCorpName,
            supplierTitle: data.supplierTitle,
            supplierTaxpayerNo: data.supplierTaxpayerNo,
            supplierBankName: data.supplierBankName,
            supplierBankBranchName: data.supplierBankBranchName,
            supplierAccountNo: data.supplierAccountNo,
            supplierAddr: data.supplierAddr,
            supplierTel: data.supplierTel,
            invoicePaymentList: [data]
          })
          // 从结算付款列表进来
          invoicePaymentAddForm.payApplySettleNoList = this.$route.query.payApplySettleNoList
          // 从预付款列表进来
          invoicePaymentAddForm.payApplyPrepayNoList = this.$route.query.payApplyPrepayNoList
          if (this.fromSettlePayApply) {
            let invoicePayment = this.invoicePaymentList[this.currIndex]
            let bool1 = this.settleCompCode === invoicePayment.settleCompCode
            let bool2 = this.supplierCorpCode === invoicePayment.supplierCorpCode
            let bool3 = this.currency === invoicePayment.currency
            // let bool4 = this.recvAccountNo === invoicePayment.supplierAccountNo // 不判断，关联发票无需此项
            console.log(bool1, bool2)
            let msg = ''
            let applyType = this.from2 ? '预付款申请' : '结算付款申请单'
            if (!bool1 && !bool2) {
              msg = `发票的购方和销方信息与${applyType}收款方和付款方信息不一致`
            } else if (!bool1) {
              msg = `发票的购方信息与${applyType}付款方信息不一致`
            } else if (!bool2) {
              msg = `发票的销方信息与${applyType}收款方信息不一致`
            } else if (!bool3) {
              msg = `发票的币种与结算付款申请的币种不一致`
            }
            if (msg) {
              msg = msg + '，是否确认提交？'
              // this.$message({  message: msg, type: 'error', showClose: true })
              this.$confirm(msg, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                this.invoiceAdd(invoicePaymentAddForm)
              }).catch((err) => {
                console.log(err)
              })
            } else {
              this.invoiceAdd(invoicePaymentAddForm)
            }
          } else {
            this.invoiceAdd(invoicePaymentAddForm)
          }
        }
      })
    },
    invoiceAdd(data){
      data.sourceType = 'system_ocr'
      this.loadingAdd = true
      add(data).then((res) => {  
        this.$msgSucClose('提交成功!');
        // if(this.$route.query.req){
        //   sessionStorage.setItem( this.$route.query.req, JSON.stringify(res.data)); 
        // }
        // this.delVisitedView()
        // this.cancel(true)
        if (res.data && res.data[0]) {
          this.invoicePaymentList[this.currIndex].invoicePaymentId = res.data[0].invoicePaymentId
        }
        this.fileList[this.currIndex].isSubmited = true
        let list = document.querySelectorAll('.el-upload-list__item-name')
        // console.log(list)
        if (list[this.currIndex].innerText === this.fileList[this.currIndex].name) {
          let child = document.createElement('i')
          child.className = 'el-icon-success' //   el-icon-circle-check
          child.style.color = '#33B18A'
          child.style.fontSize = '14px'
          child.style.marginLeft = '2px'
          list[this.currIndex].appendChild(child)
        }
        // this.fileList.forEach((item, index) => {
        //   if (item.isSubmited) {
        //     if (list[index].innerText === item.name) {
        //       let child = document.createElement('i')
        //       child.className = 'el-icon-success' //   el-icon-circle-check
        //       child.style.color = '#33B18A'
        //       child.style.fontSize = '14px'
        //       child.style.marginLeft = '2px'
        //       list[index].appendChild(child)
        //     }
        //   }
        // })
        // this.sessionInvoicePay.push(data.invoicePaymentList[0]) // 成功返回为null，注释
        if (this.hasNext) {
          this.identifyFile(this.currIndex+1)
        } else {
          if (this.fromSettlePayApply) {
            this.cancel()
          } else {
            this.clearFiles()
            if (this.from !== 'InvoicePaymentList') {
              this.cancel()
            }
          }
        }
      }).finally(()=>{
        setTimeout(() => {
          this.loadingAdd = false
        }, 500)
      })
    },
    sendResFileList(val,index) {
    },
    accountShortNameChange(val) {
      if(this.item.title !== val.title){
        this.item.accountShortName = ''
        this.$msgWarnClose(`所选账号的分公司抬头(${val.title})与识别的分公司抬头(${this.item.title})不同！`)
        return
      }
      this.item.accountShortName = val.accountShortName
      this.item.bankBranchName = val.bankBranchName
      this.item.accountNo = val.accountNo
      this.item.bankName = val.bankName
      this.item.selfCurrency = val.currency
      if(!this.item.taxNo){
        this.item.taxNo = val.taxNo
      }
      if(!this.item.tel){
        this.item.tel = val.tel
      }
    },
    accountShortNameFocus(val){
      setTimeout(() => {
        if(this.item.currency === ''){
          return this.$msgErrClose('请先选择币种！')
        }
      }, 150)
    },
    corpBankChange(val) {
      console.log(val);
      this.item.supplierBankName = val.bankName
      this.item.supplierBankBranchName = val.bankBranch   
      this.item.supplierAccountNo = val.accountNo
      this.item.supplierCurrency = val.currency
    },
    corpBankChangeFocus(){
      if (this.item.supplierCorpCode === '') { // supplierCorpName
        this.item.bankAccountsList = []
        this.$forceUpdate()
        return this.$msgErrClose('请先选择结算单位！')
      } else {
        this.bankAccountListData()
      }
    },
    bankAccountListData(){
      if(!this.item.supplierCorpCode){
          return
      }
      let receipayType = "pay"
      // let receipayType = ""
      this.$store.dispatch('dict/bankAccountList', {"accountNo":'' , receipayType, "unitCode":this.item.supplierCorpCode,"status":"effect"}).then((data) => {
        let arr = data ? data :[]
        let list = []
        arr.forEach(item=>{
          if(item.publicType === "pub"){
            list.push(item)
          }
        })
        this.item.bankAccountsPubList = list
          let bankAccountsList = []
          if(this.item.currency){
            list.forEach(it=>{
              if(this.item.currency === it.currency){
                bankAccountsList.push(it)
              }
            })
          }
          this.item.bankAccountsList = bankAccountsList
        this.$forceUpdate()
      })
    },
    scrollEvent({ scrollLeft, scrollTop }) {
        console.log(scrollLeft);
        console.log(scrollTop);
    },
  },
  computed: {
    hasNext() {
      if (this.fileList.length === 1 || this.currIndex === this.fileList.length - 1) {
        return false // '提交'
      } else if (this.fileList.length > 1) {
        return true // '提交&amp;识别下一张'
      }
    },
    goBtnText() {
      if (this.from === 'SettlementPayApply') { // || this.from === 'SettleDetail' || this.from === 'PrepayList'
        return '确定关联'
      } else {
        return '前往发票列表'
      }
    },
    // 来源可以是结算付款申请， 也可以是预付款申请， 从 from2 = prepayEdit 来区分，
    fromSettlePayApply() {
      if (this.from === 'SettlementPayApply') { // || this.from === 'SettleDetail' || this.from === 'PrepayList'
        return true
      } else {
        return false
      }
    }
  },
  components: {
    FinanceUploadEmbed
  },
  activated(){
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 300) {
      this.clearFiles()
      this.init()
    }
    // var height = document.body.clientHeight -99
    // console.log(height);
    // this.screenHeight = { height: height + 'px' };
  }
}
</script>

<style lang="scss" scoped>
.finance-table-container{
  .money-box {
    background: #F8F9FD;
  }
}
  .invoice-payment-list-reg{
    .el-date-editor.el-input {
        width: 170px;
    }
    .el-input{
        width:170px;
    }
    .el-form-item-invoice-remark {
      width: calc(100% - 10px);
      display: flex;
      .el-form-item__content {
        flex: 1;
      }
    }
    // .item-list-invoice-payment{
    //   margin: 12px 12px 0;
    // }
     .dialog-add-dialog-item{
        margin: 0 16px;
        border-top:1px solid #D8D8D8;
        .title{
            line-height: 32px;
            font-weight: 600;
            font-size: 12px;
            color: #000;
        }
        .el-date-editor.el-input {
            width: 170px;
        }
        .el-input{
            width:170px;
        }
    }
      .dialog-add-dialog-item-1{
          margin: 0 16px;
          border-top:1px solid #D8D8D8;
          padding-bottom: 6px;
          .title{
              line-height: 32px;
              font-weight: 600;
              font-size: 12px;
              color: #000;
          }
          .el-input{
              width:170px;
          }
      }
    .dialog-add-dialog-item-add{
        width:720px;
    }
  }
  .invoice-payment-list-reg{
    position: relative;
    .finance-list-container{
      width: 100%;
      position: relative;
      top:0;
      background-color: #fff;
      overflow: hidden;
    }
    .invoice-payment-list-reg-form{
      overflow-y: auto;
      overflow-x: hidden;
      ::v-deep {
        .el-form-item__error {
          z-index: 1000;
        }
      }
    }
  }
  .invoice-payment-list-reg-top{
    width: 100%;
  }
  .identify-elec-upload-cont {
    position: relative;
    margin: 12px 16px;
    .identify-elec-upload-clear {
      position: absolute;
      right: calc(5% - 20px);
      top: calc(50% - 10px);
    }
  }
</style>