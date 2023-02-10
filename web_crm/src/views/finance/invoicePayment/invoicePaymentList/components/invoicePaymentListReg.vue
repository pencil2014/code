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
          <el-button v-if="titleName !== '发票修改'" @click="handleAdd('')" type="primary" size="mini">新增发票</el-button>
          <el-button :loading='loadingAdd' @click="submitAdd" type="success" size="mini">提交</el-button>
          <el-button @click="cancel" size="mini">返回</el-button>
        </div>
      </div>
      <el-form
        :model="invoicePaymentAddForm"
        :rules="invoicePaymentAddRules"
        ref="invoicePaymentAddForm"
        :inline="true"
        size="mini"
        label-width="95px"
        @scroll="scrollEvent"
        :style="screenHeight"
        class="invoice-payment-list-reg-form"
      >
      
        <div v-for="(item,index) in invoicePaymentAddForm.invoicePaymentList" :key="'invoicePaymentList'+index">
          <div
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
            </div>
            <div v-show="item.show" class="item-list-invoice-payment">
              <!-- <div style="width:538px; float:right;">
                <FinUploadEmbed
                    class=""
                    :accept-types="['jpg','jpeg','png','pdf']"
                    :acceptSelf="'image/jpeg,application/pdf,image/jpeg,image/png'"
                    :upload-api="uploadApi2"
                    :upload-params="uploadParams2"
                    :limit="1"
                    :index="index"
                    :width='538'
                    :file-list-edit="fileListEdit"
                    @send-res-file-list="sendResFileList"
                /> 
                </div>-->
                <el-form-item label="发票代码" :prop="`invoicePaymentList[${index}].invoiceCode`" :rules="[{ required: invoiceNoChange(item,index) ||　invoicePaymentAddForm.isRepeatInvoiceNo, message: ' ', trigger: 'change' },{ pattern:  /^[A-Za-z0-9]+$/, message: '必须数字或字母' }]">
                  <el-input v-model="item.invoiceCode" maxlength="16" placeholder="请输入发票代码"></el-input>
                </el-form-item>
                <el-form-item label="发票类型" :prop="`invoicePaymentList[${index}].invoiceType`" :rules="{ required: true, message: ' ', trigger: 'blur' }">
                  <el-select v-model="item.invoiceType" placeholder="请选择发票类型" style="width:170px;">
                      <el-option
                      v-for="(op, j) in dictMap['invoiceType']"
                      :key="'invoiceType' + j"
                      :label="op.label"
                      :value="op.value"
                      ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="开票日期" :prop="`invoicePaymentList[${index}].invoiceIssueDate`" :rules="{ required: true, message: ' ', trigger: 'blur' }">
                    <el-date-picker value-format="yyyy-MM-dd" v-model="item.invoiceIssueDate" placeholder="请选择" style="width:170px;"></el-date-picker>
                </el-form-item>
                <!-- <el-form-item label="发票号" :prop="`invoicePaymentList[${index}].invoiceNo`" :rules="[{ required: true, message: ' ', trigger: 'change' },{ pattern:  /^[0-9]+$/, message: '必须数字' },{ len:8, message:'必须8位', trigger:'blur' }]"> -->
                <el-form-item label="发票号" :prop="`invoicePaymentList[${index}].invoiceNo`" :rules="[{ required: true, message: ' ', trigger: 'change' },{ pattern:  /^[0-9]+$/, message: '必须数字' }]">
                    <!-- <el-input v-model="item.invoiceNo"  maxlength="8" placeholder="请输入发票号"></el-input> -->
                    <el-input v-model="item.invoiceNo" placeholder="请输入8位或20位数字"></el-input>
                </el-form-item>
                <el-form-item label="发票金额" :prop="`invoicePaymentList[${index}].amt`" :rules="{ required: true, message: ' ', trigger: 'change' }" >
                  <el-input
                      v-lsNumber="{value:'number', form:invoicePaymentAddForm,listStr:'invoicePaymentList',rowIndex:index, key:'amt', vm}"
                      @input="changeAmt(item,'amt')"
                      @change="changeRates(item)"
                      maxlength="16"
                      v-model="item.amt"
                      placeholder="请输入"
                  ></el-input>
                </el-form-item>
                <el-form-item label="发票税率" :prop="`invoicePaymentList[${index}].taxRate`" :rules="{ required: true, message: ' ', trigger: 'change' }">
                    <el-select v-model="item.taxRate" placeholder="请选择" @input="changeAmt(item)" style="width:170px;">
                        <el-option
                        v-for="(op, j) in dictMap.taxRateInfo"
                        :key="'currency' + j"
                        :label="op.label"
                        :value="+op.value"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="开票币种" :prop="`invoicePaymentList[${index}].currency`" :rules="{ required: true, message: ' ', trigger: 'blur' }" >
                    <el-select
                    v-model="item.currency"
                    :disabled='!!invoicePaymentAddForm.invoicePaymentList[index].currencyDisabled' 
                    @change="changeCurrency(item.currency,index)" 
                    filterable 
                    placeholder="请选择" 
                    @input="changeAmt(item)" 
                    style="width:170px;">
                        <el-option
                        v-for="(op, j) in validCurrencyList"
                        :key="'currency' + j"
                        :label="op.label"
                        :value="op.value"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="开票汇率" :prop="`invoicePaymentList[${index}].rate`" :rules="{ required: true, message: ' ', trigger: 'change' }">
                    <el-input
                      :disabled="item.currency === 'CNY'"
                      v-model="item.rate"
                      @input="changeAmt(item)"
                      @change="changeRates(item)"
                      v-lsNumber="{value:'number', form:invoicePaymentAddForm,listStr:'invoicePaymentList',rowIndex:index, key:'rate', vm,dot:11}"
                      maxlength="16"
                      placeholder="请输入"
                    ></el-input>
                </el-form-item>
                <el-form-item label="发票登记号" :prop="`invoicePaymentList[${index}].receiveNo`" :rules="[{ required: isCompany && item.invoiceType !== 'electronic', message: ' ', trigger: 'change' },{ pattern:  /^[A-Za-z0-9]+$/, message: '必须数字或字母' }]">
                    <el-input v-model="item.receiveNo" maxlength="32" placeholder="请输入"></el-input>
                </el-form-item>
                <el-form-item label="税额" :prop="`invoicePaymentList[${index}].taxAmt`" :rules="{ required: false, message: ' ', trigger: 'change' }">
                    <el-input v-model="item.taxAmt" disabled maxlength="16" placeholder="请输入"></el-input>
                </el-form-item>
                <el-form-item label="价税合计(CNY)" :prop="`invoicePaymentList[${index}].amtCny`" :rules="{ required: false, message: ' ', trigger: 'change' }">
                    <el-input v-model.trim="item.amtCny"  @input="changeRate(item)" @change="changeRates(item)" maxlength="16" placeholder="请输入"></el-input>
                </el-form-item>
                
                <!-- 添加v-if 解决再次进入仍会显示之前上传的文件 -->
                <!-- :prop="`invoicePaymentList[${index}].fileNo`" :rules="{ required: item.invoiceType ==='electronic', message: '必须上传', trigger: 'change' }" -->
                <!-- <el-form-item
                label= '上传发票附件'
                class="invoice-payment-add-form-upload"
                >
                <FinUploadEmbed
                  class=""
                  :accept-types="['jpg','jpeg','png','pdf']"
                  :acceptSelf="'image/jpeg,application/pdf,image/jpeg,image/png'"
                  :upload-api="uploadApi2"
                  :upload-params="uploadParams2"
                  :limit="1"
                  :index="index"
                  :width='170'
                  :file-list-edit="fileListEdit"
                  @send-res-file-list="sendResFileList"
                />
                </el-form-item> -->
                
                

                <el-form-item label="备注" prop="remark" class="el-form-item-invoice-remark el-form-item-invoice-remark-20" >
                    <el-input
                        type="textarea"
                        v-model="item.remark"
                        placeholder="请输入备注，不能超过500个字"
                        maxlength="500"
                        show-word-limit
                    ></el-input>
                </el-form-item>
                <el-form-item label="发票附件" >
                  <FinUploadEmbed
                    class=""
                    :accept-types="['jpg','jpeg','png','pdf']"
                    :acceptSelf="'image/jpeg,application/pdf,image/jpeg,image/png'"
                    :upload-api="uploadApi2"
                    :upload-params="uploadParams2"
                    :limit="1"
                    :index="index"
                    :width='width'
                    :file-list-edit="fileListEdit"
                    @send-res-file-list="sendResFileList"
                  />
                </el-form-item>
                <el-form-item label="发票查验件" >
                  <FinUploadEmbed
                    class=""
                    :accept-types="['jpg','jpeg','png','pdf']"
                    :acceptSelf="'image/jpeg,application/pdf,image/jpeg,image/png'"
                    :upload-api="uploadApi2"
                    :upload-params="uploadParams2"
                    :limit="1"
                    :index="index"
                    :width='width'
                    :file-list-edit="fileListEditList"
                    @send-res-file-list="sendResFileLists"
                  />
                </el-form-item>
            </div>
          </div>
        </div>
        <div class="invoice-payment-reg-sum">
          全部发票合计：<span style="color:#E63923;">{{regSum}}</span>
        </div>
        <div class="dialog-add-dialog-item">
            <div><p class="title">我司信息</p></div>
             <el-form-item  label="我司账号简称" prop="accountShortName">
                <el-select
                  style="width:170px"
                  v-model="invoicePaymentAddForm.accountShortName"
                  value-key="accountNo"
                  placeholder="请选择"
                  :remote-method="(queryString) => {accountShortNameList(queryString,scope.row)}"
                  @change="accountShortNameChange"
                  @focus="accountShortNameFocus"
                >
                  <el-option
                  v-for="(op, j) in invoicePaymentAddForm.invoiceBankFilterList || []"
                  :key="'invoiceType' + j"
                  :label="op.accountShortName"
                  :value="op"
                  ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="我司发票抬头" prop="">
                <el-input v-model="invoicePaymentAddForm.title" disabled placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="纳税人识别号" prop="">
                <el-input v-model="invoicePaymentAddForm.taxNo" placeholder="请输入" disabled></el-input>
            </el-form-item>
            <el-form-item label="我司开户行" prop="">
                <el-input :value="`${invoicePaymentAddForm.bankName ? invoicePaymentAddForm.bankName : ''}${invoicePaymentAddForm.bankBranchName?'(':''}${invoicePaymentAddForm.bankBranchName ? invoicePaymentAddForm.bankBranchName : ''}${invoicePaymentAddForm.bankBranchName?')':''}`" placeholder="请输入" disabled></el-input>
            </el-form-item>
            <el-form-item label="我司账号" prop="">
                <el-input v-model="invoicePaymentAddForm.accountNo" placeholder="请输入" disabled></el-input>
            </el-form-item>
            <el-form-item label="我司电话" prop="">
                <el-input v-model="invoicePaymentAddForm.tel" placeholder="请输入" disabled></el-input>
            </el-form-item>
            <el-form-item label="我司地址" prop="" class="el-form-item-invoice-remark el-form-item-invoice-remark-20" >
              <el-input
                type="textarea"
                disabled
                v-model="invoicePaymentAddForm.addr"
                placeholder="请输入"
                maxlength="500"
                show-word-limit
              ></el-input>
            </el-form-item>
        </div>
        <div class="dialog-add-dialog-item-1">
            <div><p class="title">供应商信息</p></div>
            <el-form-item label="结算单位" prop="supplierCorpName">
                <el-autocomplete
                    style="width:170px"
                    v-model="invoicePaymentAddForm.supplierCorpName"
                    placeholder="请输入"
                    clearable
                    :select-when-unmatched="true"
                    :fetch-suggestions="(queryString, cb) => {autocomplete.querySearch && autocomplete.querySearch(queryString, cb)}"
                    @select="(value) => {autocomplete.select && autocomplete.select(value)}"
                    @change="(value) => {autocomplete.change && autocomplete.change(value)}"
                ></el-autocomplete>
            </el-form-item>
            <el-form-item label="发票抬头" prop="">
                <el-input v-model="invoicePaymentAddForm.supplierTitle" maxlength="32" disabled placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="纳税人识别号" prop="">
                <el-input v-model="invoicePaymentAddForm.supplierTaxpayerNo" maxlength="32" placeholder="请输入" disabled></el-input>
            </el-form-item>
            <el-form-item label="银行账号" prop="supplierAccountNo">
                <el-select
                    style="width:170px"
                    v-model="invoicePaymentAddForm.supplierAccountNo"
                    value-key="accountNo"
                    placeholder="请选择"
                    @change="corpBankChange"
                    @focus="corpBankChangeFocus"
                >
                    <el-option
                    v-for="(op, j) in invoicePaymentAddForm.bankAccountsList || []"
                    :key="'invoiceType' + j"
                    :label="op.bankName + ' ' +op.accountNo"
                    :value="op"
                    ></el-option>
                </el-select>
                <!-- <el-input v-model="invoicePaymentAddForm.supplierAccountNo" placeholder="请输入" ></el-input> -->
            </el-form-item>
            <el-form-item label="开户行" prop="">
                <el-input :value="`${invoicePaymentAddForm.supplierBankName ? invoicePaymentAddForm.supplierBankName : ''}${invoicePaymentAddForm.supplierBankBranchName?'(':''}${invoicePaymentAddForm.supplierBankBranchName ? invoicePaymentAddForm.supplierBankBranchName : ''}${invoicePaymentAddForm.supplierBankBranchName?')':''}`" placeholder="请输入" disabled></el-input>
            </el-form-item>
            <el-form-item label="电话" prop="">
                <el-input v-model="invoicePaymentAddForm.supplierTel" placeholder="请输入" disabled></el-input>
            </el-form-item>
            <el-form-item label="地址" class="el-form-item-invoice-remark el-form-item-invoice-remark-20" >
              <el-input
                  type="textarea"
                  disabled
                  v-model="invoicePaymentAddForm.supplierAddr"
                  placeholder="请输入"
                  maxlength="500"
                  show-word-limit
              ></el-input>
            </el-form-item>
        </div>
      </el-form>
      
    </div>
  </div>
</template>

<script>
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import FinUploadEmbed from './finUploadEmbed.vue'
import { getSettleUnitInvoiceInfo } from '@/api/fin/invoiceReceivableApply'
import { getValueByKey } from '@/api/order/list'
import { getCompanyInvoiceInfo } from '@/api/fin/company'
import { add, info, invoicePaymentUpdate } from '@/api/fin/invoicePayment'
  var day2 = new Date();
  day2.setTime(day2.getTime());
  let m = (day2.getMonth()+1) > 9 ? (day2.getMonth()+1) : '0' + (day2.getMonth()+1)
  let d = day2.getDate() > 9 ? day2.getDate() : '0' + day2.getDate()
  let defaultTime = day2.getFullYear()+"-" + m + "-" + d;
  let timer1 = ''
export default {
  name:'invoicePaymentListReg',
  mixins: [mixin, routerMixin],
  data(){
    let rules = [{ required: true, message: ' ', trigger: 'blur' }]
    let invoicePaymentAddForm = {
      payApplySettleNo:"",
      supplierCorpName: '',
      supplierCorpCode: '',
      corpBank: null,
      bankAccounts: [],
      invoiceBankList:[],
      title: '',
      taxNo: '',
      supplierTitle: '',
      supplierBankName: '',
      supplierBankBranchName: '',
      supplierCurrency: '',
      supplierTel: '',
      supplierAddr: '',
      supplierAccountNo: '',
      bankName: '',
      accountNo: '',
      addr: '',
      tel: '',
      supplierTaxpayerNo: '',
      accountShortName: '',
      invoicePaymentList:[],
      bankAccountsPubList:[],
    }
    let invoicePaymentAddRules = {}
    Object.keys(invoicePaymentAddForm).forEach((item) => {
        if (item === 'supplierCorpCode' || item === 'remark' || item === 'taxAmt') return
        if (item === 'supplierAccountNo') {
          invoicePaymentAddRules[item] = [{ ...rules[0], trigger: 'change' }]
          return
        }
        invoicePaymentAddRules[item] = item !== 'supplierCorpName' ? rules : [{ ...rules[0], trigger: 'change' }]
    })
    return {
      width:732,
      cTimestamp: 0,
      vm: this,
      loading:false,
      defaultTime,
      invoicePaymentId:'',
      invoiceNo:'',
      invoicePaymentAddRules,
      invoicePaymentAddForm:{
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
        invoicePaymentList:[
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
          }
        ],
        bankAccountsPubList:[]
      },
      validCurrencyList:[],
      srcCurrencyList: [],
      isCompany: false,
      uploadApi2: '/base/webapi/file/upload',
      uploadParams2: {},
      isShowUpload: true,
      fileListEdit:[],
      fileListEditList:[],
      //供应商信息
      autocomplete: {},
      titleName:'',
      screenHeight:0,
      loadingAdd: false,
      regSum: ''
    }
  },
  mounted() {
    const that = this
    window.onresize =()  =>{
      return (()=>{
        window.screenHeight = window.innerHeight
        var height = window.screenHeight -99
        this.screenHeight = { height: height + 'px' };
      })()
    }
  },
  created(){
    this.validCurrencyListData()
    this.autocomplete = {
      querySearch: (queryString, cb) => {
        if(this.invoicePaymentAddForm.currency === ''){
          return this.$msgErrClose('请先选择币种！')
        }
        this.querySettleUnit({ queryString, isAdd: true }, cb)
      },
      select: (optionItem, row) => {
        this.invoicePaymentAddForm.supplierCorpName = optionItem.value
        this.invoicePaymentAddForm.supplierCorpCode = optionItem.key
        getSettleUnitInvoiceInfo({ unitCode: optionItem.key }).then((res) => {
          if (!res.data) {
            this.invoicePaymentAddForm.supplierTaxpayerNo = ''
            return this.$msgErrClose('该客商无开票信息！')
          }
          this.invoicePaymentAddForm.supplierTaxpayerNo = res.data.taxNo
          this.invoicePaymentAddForm.supplierTitle = res.data.title
          this.invoicePaymentAddForm.bankAccounts = res.data.bankAccounts
          this.invoicePaymentAddForm.supplierAddr = res.data.addr
          this.invoicePaymentAddForm.supplierTel = res.data.tel
          // this.invoicePaymentAddForm.supplierAccountNo = res.data.accountNo
          // this.invoicePaymentAddForm.supplierBankName = res.data.bankName
          this.bankAccountListData()
          let bankAccountList = []
          if(this.invoicePaymentAddForm.bankAccountsPubList && this.invoicePaymentAddForm.bankAccountsPubList.length){
            this.invoicePaymentAddForm.bankAccountsPubList.forEach(item=>{
              if(item.currency === this.invoicePaymentAddForm.invoicePaymentList[0].currency){
                bankAccountList.push(item)
              }
            })
          }
              
          this.invoicePaymentAddForm.bankAccountList = bankAccountList
          if(this.invoicePaymentAddForm.bankAccounts.length){
            if(this.invoicePaymentAddForm.invoicePaymentList[0].currency){
              if(this.invoicePaymentAddForm.bankAccountsList && this.invoicePaymentAddForm.bankAccountsList.length){
                let bankAccountsList = this.invoicePaymentAddForm.bankAccountsList.filter(item=>{
                  return item.currency === this.invoicePaymentAddForm.invoicePaymentList[0].currency
                })
                this.invoicePaymentAddForm.supplierAccountNo = bankAccountsList[0].accountNo
                this.invoicePaymentAddForm.supplierBankName = bankAccountsList[0].bankName
                this.invoicePaymentAddForm.supplierBankBranchName = bankAccountsList[0].bankBranch
                this.invoicePaymentAddForm.supplierCurrency = bankAccountsList[0].currency
              }
            }
          }
        })
      },
      change: (value) => {
        if(this.invoicePaymentAddForm.supplierCorpName===""){
          Object.assign(this.invoicePaymentAddForm,{},{
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
          this.invoicePaymentAddForm.bankAccountsList = []
          this.$forceUpdate()
        }
          
      },
    }
    this.cTimestamp = new Date().getTime()
    this.init()
  },
  methods:{
    cancel(flag){
      this.routerBack(flag)
      this.$refs['invoicePaymentAddForm'].clearValidate()
    },
    init(){
      let invoicePaymentAddForm ={
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
        isRepeatInvoiceNo:false,
        payApplySettleNoList:[],
        recvAccountNo:'',
        fileNo: '',
        fileName: '',
        checkInvoiceFileName: "",
        checkInvoiceFileNo: "",
        invoicePaymentList:[
          {
            show:true,
            invoiceNo: '',
            invoiceCode: '',
            currency: 'CNY',
            amt: '',
            invoiceIssueDate: this.defaultTime,
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
            invoiceNoFlag:false
          }
        ],
        bankAccountsPubList:[]
      }
      this.fileListEdit = []
      this.fileListEditList = []
      Object.assign(this.invoicePaymentAddForm,invoicePaymentAddForm)
      this.invoicePaymentId = this.$route.query.invoicePaymentId
      this.invoiceNo = this.$route.query.invoiceNo
      this.titleName = this.$route.query.titleName
      if(this.$route.query.name === "SettleList" || this.$route.query.name === 'prepayEditApply'){
        let currencys = this.$route.query.currency ? this.$route.query.currency.split(',') : []
        let amts = this.$route.query.amt ? (''+this.$route.query.amt).split(',') : []
        this.invoicePaymentAddForm.invoicePaymentList[0].currency = currencys.length ? currencys[0] : ''
        this.invoicePaymentAddForm.invoicePaymentList[0].currencyDisabled = true
        this.invoicePaymentAddForm.invoicePaymentList[0].amt = amts.length? amts[0] : ''
        this.changeAmt(invoicePaymentAddForm.invoicePaymentList[0])
        currencys.forEach((item, index) => {
          if(index>0){
            this.handleAdd(item,amts[index])
          }
        })
        this.invoicePaymentAddForm.supplierCorpName = this.$route.query.supplierCorpName
        this.invoicePaymentAddForm.supplierCorpCode = this.$route.query.supplierCorpCode
        this.invoicePaymentAddForm.recvAccountNo= this.$route.query.recvAccountNo
      }
      if(this.$route.query.payApplySettleNoList && this.$route.query.payApplySettleNoList.length){
          this.invoicePaymentAddForm.payApplySettleNoList = this.$route.query.payApplySettleNoList
        }else{
           this.invoicePaymentAddForm.payApplySettleNoList = []
        }
        if(this.$route.query.payApplyPrepayNoList && this.$route.query.payApplyPrepayNoList.length){
          this.invoicePaymentAddForm.payApplyPrepayNoList = this.$route.query.payApplyPrepayNoList  
        }else{
          this.invoicePaymentAddForm.payApplyPrepayNoList=[]
        }
        this.invoicePaymentAddForm.isRepeatInvoiceNo = this.$route.query.isRepeatInvoiceNo
      this.invoicePaymentAddForm.settleOrderNoList = this.$route.query.settleOrderNoList || []
      if (this.invoiceNo) {
        this.getDetail({ invoicePaymentId: this.invoicePaymentId, invoiceNo: this.invoiceNo })
      }

      // 我司信息
      this.isCompany = false
      getCompanyInvoiceInfo({ companyCode:  this.$route.query.settleCompCode || this.$store.state.user.userInfo.settleCompanyCode}).then(res=>{
        if (!res.data) {
          return
        }
        getValueByKey("FIN_INVOICE_RECNO_VALID_COMPANY").then(data=>{
          let getValueByKeyList = data.data.split(",")
          for (let i = 0; i < getValueByKeyList.length; i++) {
            if(getValueByKeyList[i] == res.data.companyCode){
              //深圳长帆供应链、深圳长帆物流，这两个深圳的公司，纸质发票，发票登记号是必填
              this.isCompany = true
            }
          }
        })
        console.log(res.data.invoiceBankList);
        let invoiceBankCurrecnyList = res.data.invoiceBankList.filter(item =>{
          return item.currency === this.invoicePaymentAddForm.invoicePaymentList[0].currency
        })
        if(invoiceBankCurrecnyList.length && this.titleName !== '新增修改'){
          res.data.accountShortName = invoiceBankCurrecnyList[0].accountShortName
          res.data.bankBranchName = invoiceBankCurrecnyList[0].bankBranchName
          res.data.accountNo = invoiceBankCurrecnyList[0].accountNo
          res.data.bankName = invoiceBankCurrecnyList[0].bankName
          this.invoicePaymentAddForm.selfCurrency = invoiceBankCurrecnyList[0].currency
        }
        Object.assign(this.invoicePaymentAddForm,{},{
          invoiceBankList:res.data.invoiceBankList,
          title: res.data.title,
          taxNo: res.data.taxNo,
          bankName: res.data.bankName,
          bankBranchName: res.data.bankBranchName,
          accountNo: res.data.accountNo,
          addr: res.data.addr,
          tel: res.data.tel,
          accountShortName: res.data.accountShortName,
          selfCurrecny: res.data.currecny,
          companyCode: res.data.companyCode,
        })
        this.invoicePaymentAddForm.invoiceBankList = res.data.invoiceBankList
        this.invoicePaymentAddForm.invoiceBankFilterList = res.data.invoiceBankList
      })
      // 如果不是修改的带默认值
      if(this.titleName !== "发票修改") { 
        if(this.invoicePaymentAddForm.invoiceBankList && this.invoicePaymentAddForm.invoiceBankList.length){
          for (let i = 0; i < this.invoicePaymentAddForm.invoiceBankList.length; i++) {
            if(this.invoicePaymentAddForm.invoiceBankList[i].currency === this.invoicePaymentAddForm.currency){
              this.invoicePaymentAddForm.currency = this.invoicePaymentAddForm.invoiceBankList[i].currency
              this.invoicePaymentAddForm.accountShortName = this.invoicePaymentAddForm.invoiceBankList[i].accountShortName
              this.invoicePaymentAddForm.accountNo = this.invoicePaymentAddForm.invoiceBankList[i].accountNo
              this.invoicePaymentAddForm.bankName = this.invoicePaymentAddForm.invoiceBankList[i].bankName
            }
          }  
        }
        this.invoicePaymentAddForm.invoiceBankFilterList = this.invoicePaymentAddForm.invoiceBankList
      }
      
      /* this.invoicePaymentAddForm.invoiceBankFilterList = this.invoicePaymentAddForm.invoiceBankList.filter(item=>{
          return this.invoicePaymentAddForm.currency === item.currency
      }) */
      //供应商
      if(this.invoicePaymentAddForm.supplierCorpCode){
        getSettleUnitInvoiceInfo({ unitCode: this.invoicePaymentAddForm.supplierCorpCode }).then((res) => {
          if (!res.data) {
            this.invoicePaymentAddForm.supplierTaxpayerNo = ''
            return this.$msgErrClose('该客商无开票信息!!')
          }
          this.invoicePaymentAddForm.supplierTaxpayerNo = res.data.taxNo
          this.invoicePaymentAddForm.supplierTitle = res.data.title
          this.invoicePaymentAddForm.bankAccounts = res.data.bankAccounts
          this.invoicePaymentAddForm.supplierAddr = res.data.addr
          this.invoicePaymentAddForm.supplierTel = res.data.tel
          // this.bankAccountListData()
          if(!this.invoicePaymentAddForm.supplierCorpCode){
            return
          }
          let receipayType = "pay"
          // let receipayType = ""
          this.$store.dispatch('dict/bankAccountList', {"accountNo":'' , receipayType, "unitCode":this.invoicePaymentAddForm.supplierCorpCode,"status":"effect"}).then((data) => {
            let arr = data ? data :[]
            let list = []
            arr.forEach(item=>{
              if(item.publicType === "pub"){
                list.push(item)
              }
            })
            this.invoicePaymentAddForm.bankAccountsPubList = list
              let bankAccountsList = []
              if(this.invoicePaymentAddForm.invoicePaymentList[0].currency){
                list.forEach(it=>{
                  if(this.invoicePaymentAddForm.invoicePaymentList[0].currency === it.currency){
                    bankAccountsList.push(it)
                  }
                })
              }
              this.invoicePaymentAddForm.bankAccountsList = bankAccountsList
              if(this.invoicePaymentAddForm.bankAccountsList && this.invoicePaymentAddForm.bankAccountsList.length){
                // 如果不是修改的带默认值
                if(this.titleName !== "发票修改") { 
                  this.invoicePaymentAddForm.supplierAccountNo = ''
                  this.invoicePaymentAddForm.supplierBankName = ''
                  this.invoicePaymentAddForm.supplierBankBranchName = ''
                  this.invoicePaymentAddForm.supplierCurrency = ''
                  for (let i = 0; i < this.invoicePaymentAddForm.bankAccountsList.length; i++) {
                    if(this.invoicePaymentAddForm.bankAccountsList[i].settleUnitBankAcctId === this.$route.query.recvBankAccountId){
                      this.invoicePaymentAddForm.supplierAccountNo = this.invoicePaymentAddForm.bankAccountsList[i].accountNo
                      this.invoicePaymentAddForm.supplierBankName = this.invoicePaymentAddForm.bankAccountsList[i].bankName
                      this.invoicePaymentAddForm.supplierBankBranchName = this.invoicePaymentAddForm.bankAccountsList[i].bankBranch
                      this.invoicePaymentAddForm.supplierCurrency = this.invoicePaymentAddForm.bankAccountsList[i].currency
                      return
                    }  
                  }
                }
              }
            this.$forceUpdate()
          })
          
        })
      }
      //币种
      let value = this.invoicePaymentAddForm.invoicePaymentList[0].currency
      if(value){
        if(value === 'CNY'){
          this.invoicePaymentAddForm.invoicePaymentList[0].rate = 1
        }
      }
    },
    getDetail(data){
      this.loading = true
      info(data).then((res) => {
        let info = res.data
        getCompanyInvoiceInfo({ companyCode: this.$store.state.user.userInfo.settleCompanyCode}).then(res=>{
            if (!res.data) {
              return
            }
            this.invoicePaymentAddForm.invoiceBankList = res.data.invoiceBankList ? res.data.invoiceBankList : []
            this.invoicePaymentAddForm.invoiceBankFilterList = res.data.invoiceBankList ? res.data.invoiceBankList :[]
        })
        getSettleUnitInvoiceInfo({ unitCode: info.supplierCorpCode }).then((res) => {
            if (!res.data) {
                this.invoicePaymentAddForm.supplierTaxpayerNo = ''
                return this.$msgErrClose('该客商无开票信息！')
            }
            this.invoicePaymentAddForm.bankAccounts = res.data.bankAccounts
            this.invoicePaymentAddForm.bankAccountsList = res.data.bankAccounts
        })
          Object.assign(this.invoicePaymentAddForm, info)
          let  invoicePaymentList ={
            show:true,
            invoicePaymentId: '',
            invoiceNo: '',
            invoiceCode: '',
            currency: 'CNY',
            amt: '',
            invoiceIssueDate: this.defaultTime,
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
            invoiceNoFlag:false
          }
          Object.assign(invoicePaymentList, info)
          this.changeAmt(invoicePaymentList)
          this.invoicePaymentAddForm.invoicePaymentList = [ invoicePaymentList ]

          this.bankAccountListData()
          if(res.data.fileName && res.data.fileNo){
            this.fileListEdit.push({
              name: res.data.fileName,
              url: res.data.fileNo
            })
          }
          if(res.data.checkInvoiceFileName && res.data.checkInvoiceFileNo){
            this.fileListEditList.push({
              name: res.data.checkInvoiceFileName,
              url: res.data.checkInvoiceFileNo
            })
          }
        })
        .catch((err) => {
          // Object.keys(this.invoicePaymentAddForm).forEach((key) => {
          //   this.invoicePaymentAddForm[key] = ''
          // })
        }).finally(()=>{
          this.loading = false;
        })
    },
    handleCollapse(val){
      val.show = !val.show
      return val
    },
    validCurrencyListData(){ 
      //应付发票允许录入的币种配置
      getValueByKey('FIN_INVOICE_PAYMENT_CURRENCY_CONFIG').then(res=>{
        this.validCurrencyList = [...(this.dictMap['validCurrency'].slice(0, 100).filter(item => res.data.split(",").includes(item.label)))]
      })
      // getValueByKey('FIN_INVOICE_PAYMENT_RATE_CONFIG').then(res=>{
      //   this.srcCurrencyList = res.data
      // })
    },
    changeAmt(val,flag){
      if(flag === 'amt' && val.currency !== 'CNY'){
        if(val.amtCny ){
          clearTimeout(timer1)
          timer1 = setTimeout(() => {
            let amt1 = parseFloat(val.amt ? val.amt : 0)
            let amtCny1 = parseFloat(val.amtCny ? val.amtCny : 0)
            if(!amt1){
              val.rate = 0
            }else{
              val.rate = Math.round((amtCny1/amt1)*10000000000)/10000000000
            }
            
            return val
          },800)
        }else{
          clearTimeout(timer1)
          timer1 = setTimeout(() => {
            let amt = parseFloat(val.amt ? val.amt : 0)
            let rate = parseFloat(val.rate ? val.rate : 0)
            let taxRate = parseFloat(val.taxRate ? val.taxRate : 0)
            //不含税金额 = 四舍五入(USD金额×开票汇率/(1+税率))
            //税额 = USD金额×开票汇率-不含税金额。
            let amtCny = this.mathRound(amt * rate);
            let excludingTaxAmt = amtCny/(1 + taxRate);
            val.taxAmt = this.mathRound(amtCny-amtCny/(1 + taxRate));
            // new LSnum(amtCny).minus(new LSnum(amtCny).div(new LSnum(1).plus(taxRate))).toNum(2)
            val.amtCny = this.mathRound(excludingTaxAmt + val.taxAmt);
          },800)
          return val
        }
      }else{
        clearTimeout(timer1)
        timer1 = setTimeout(() => {
          let amt = parseFloat(val.amt ? val.amt : 0)
          let rate = parseFloat(val.rate ? val.rate : 0)
          let taxRate = parseFloat(val.taxRate ? val.taxRate : 0)
          if(val.taxAmt && val.amt){

          }
          //不含税金额 = 四舍五入(USD金额×开票汇率/(1+税率))
          //税额 = USD金额×开票汇率-不含税金额。
          let amtCny = this.mathRound(amt * rate);
          let excludingTaxAmt = amtCny/(1 + taxRate);
          val.taxAmt = this.mathRound(amtCny-amtCny/(1 + taxRate));
          // new LSnum(amtCny).minus(new LSnum(amtCny).div(new LSnum(1).plus(taxRate))).toNum(2)
          val.amtCny = this.mathRound(excludingTaxAmt + val.taxAmt);
        },800)
        return val
      }
    },
    changeRates(val){
      // if(val.currency === 'USD'){
      //   if(val.rate < 6){
      //     if(val.rate !== ''){
      //       if(val.rate !== 0){
      //         this.$message({  message: 'USD-CNY 开票汇率不能小于6',  type: 'warning'});
      //       }
      //     }
      //   }
      // }
      // if(val.currency === 'HKD'){
      //   if(val.rate < 0.7){
      //     this.$message({  message: 'HKD-CNY 开票汇率不能小于0.7',  type: 'warning'});
      //   }
      // }
    },
    mathRound(num){
      return Math.round(num*100)/100
    },
    changeRate(val){
      console.log(val);
      let amt = parseFloat(val.amt ? val.amt : 0)
      let amtCny = parseFloat(val.amtCny ? val.amtCny : 0)
      if(val.currency === 'CNY') {
        val.amt = val.amtCny
      }else {
        if(!val.amt) return
        timer1 = setTimeout(() => {
          val.rate = Math.round((amtCny/amt)*10000000000)/10000000000
        },800)
      } 
      let rate = parseFloat(val.rate ? val.rate : 0)
      let taxRate = parseFloat(val.taxRate ? val.taxRate : 0)
      //不含税金额 = 四舍五入(USD金额×开票汇率/(1+税率))
      //税额 = USD金额×开票汇率-不含税金额。
      let amts = parseFloat(val.amt ? val.amt : 0)
      let amtCnys = this.mathRound(amts * (Math.round((amtCny/amts)*10000000000)/10000000000));
      val.taxAmt = this.mathRound(amtCnys-amtCnys/(1 + taxRate));
      return val
    },
    //币种改变重新获取账号
    changeCurrency(value,index){
        this.invoicePaymentAddForm.currency = value
        console.log(value);
        console.log(index);
        if(value){
            // let changeRateList = this.exchangeRateList.filter(item => {
            //     return value === item.srcCurrency && "CNY" === item.toCurrency
            // })
            // console.log(changeRateList);
            // if(changeRateList.length){
            //     this.invoicePaymentAddForm.invoicePaymentList[index].rate = changeRateList[0].rate
            // }else{
            //     this.invoicePaymentAddForm.invoicePaymentList[index].rate = null
            // }
            if(value === 'CNY'){
                this.invoicePaymentAddForm.invoicePaymentList[index].rate = 1
            }else{
                this.invoicePaymentAddForm.invoicePaymentList[index].rate = null
            }
        }
        //我司账号简称
        this.invoicePaymentAddForm.accountShortName = ''
        this.invoicePaymentAddForm.accountNo = ''
        this.invoicePaymentAddForm.bankName = ''
        this.invoicePaymentAddForm.selfCurrency = ''
        if(this.invoicePaymentAddForm.invoiceBankList.length){
            let invoiceBankFilterList = this.invoicePaymentAddForm.invoiceBankList.filter(item=>{
                return item.currency === value 
            })
            if(invoiceBankFilterList.length){
                //选择币种给我司账号带出默认值
                this.invoicePaymentAddForm.accountShortName = invoiceBankFilterList[0].accountShortName
                this.invoicePaymentAddForm.accountNo = invoiceBankFilterList[0].accountNo
                this.invoicePaymentAddForm.bankName = invoiceBankFilterList[0].bankName
                this.invoicePaymentAddForm.selfCurrency = invoiceBankFilterList[0].currency
            }
        }
        
        //供应商信息银行账号
        if(this.invoicePaymentAddForm.bankAccountsPubList.length){
            let bankList = this.invoicePaymentAddForm.bankAccountsPubList.filter(item=>{
                return  item.currency === value
            })
            if(bankList.length){
                this.invoicePaymentAddForm.supplierAccountNo = bankList[0].accountNo
                this.invoicePaymentAddForm.supplierBankName = bankList[0].bankName
                this.invoicePaymentAddForm.supplierBankBranchName = bankList[0].bankBranch
                this.invoicePaymentAddForm.supplierCurrency = bankList[0].currency
            }else{
                this.invoicePaymentAddForm.supplierBankName = ''
                this.invoicePaymentAddForm.supplierBankBranchName = ''
                this.invoicePaymentAddForm.supplierAccountNo = ''
                this.invoicePaymentAddForm.supplierCurrency = ''
            }
        }
        this.bankAccountListData()
        let bankAccountList = []
            this.invoicePaymentAddForm.bankAccountsPubList.forEach(item=>{
                if(item.currency === value){
                    bankAccountList.push(item)
                }
            })
        this.invoicePaymentAddForm.bankAccountList = bankAccountList
        this.$forceUpdate()
        
    },
    //新增发票
    handleAdd(currency,amt){
      if(this.invoicePaymentAddForm.titleName === '修改'){
          return this.$msgErrClose('修改无法添加多个发票！')
      }
      let invoiceData = {
        show: true,
        invoiceNo: '',
        invoiceCode: '',
        currency: '',
        amt: '',
        invoiceIssueDate: this.defaultTime,
        taxRate: 0,
        rate: '',
        taxAmt: '',
        invoiceType: '',
        remark: '',
        receiveNo: '',
        fileNo: '',
        name: '',
        fileName: '',
        checkInvoiceFileName: "",
        checkInvoiceFileNo: "",
        amtCny: '',
        invoiceNoFlag:false,
        currencyDisabled: false,
      }
      if(this.$route.query.name === "SettleList"){
        invoiceData.currency = currency
        invoiceData.amt = amt
        invoiceData.currencyDisabled = currency && true
        console.log(currency,';;;', invoiceData.currencyDisabled);
        if(currency === 'CNY'){
          invoiceData.rate = 1
        }
        this.changeAmt(invoiceData)
      }
     
      this.invoicePaymentAddForm.invoicePaymentList.push(invoiceData)
    },
    //删除发票
    handleDelete(index){
      this.invoicePaymentAddForm.invoicePaymentList.splice(index,1)
    },
    //提交按钮
    submitAdd() {
      console.log(this.invoicePaymentAddForm.invoicePaymentList)
      this.$refs.invoicePaymentAddForm.validate((valid) => {
        if (valid) {
          let invoiceList = this.invoicePaymentAddForm.invoicePaymentList
            for (let i = 0; i < invoiceList.length; i++) {
                if (!this.validateMoney(invoiceList[i].amt, { positive: true })) return
                if(invoiceList[i].invoiceNo.length !== 8 && invoiceList[i].invoiceNo.length !== 20){
                  return this.$msgErrClose(`发票号长度只能是8位或20位！`)
                }
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
            let data = Object.assign({}, this.invoicePaymentAddForm)
            // data.invoiceIssueDate = dateFormat('yyyy-mm-dd', new Date(data.invoiceIssueDate))
            // delete data.bankAccounts
            // delete data.corpBank
            data.invoiceBankFilterList.forEach(item=>{
                if(data.accountShortName === item.accountShortName){
                    this.invoicePaymentAddForm.selfCurrency =  item.currency
                }
            })
            data.bankAccountsList.forEach(item=>{
                if(data.supplierAccountNo === item.accountNo){
                    this.invoicePaymentAddForm.supplierCurrency = item.currency
                }
            })
            
            console.log(this.invoicePaymentAddForm.selfCurrency);
            console.log(this.invoicePaymentAddForm.supplierCurrency);
            
            if(this.titleName ==="发票修改"){
                let invoicePaymentAddForm = this.invoicePaymentAddForm.invoicePaymentList[0]
                if(invoicePaymentAddForm.currency !== this.invoicePaymentAddForm.selfCurrency){
                    return this.$msgErrClose('我司账户币种和开票币种不一致！')
                }
                if(this.invoicePaymentAddForm.supplierCurrency !== invoicePaymentAddForm.currency){
                    return this.$msgErrClose('供应商账户币种和开票币种不一致！')
                }
                data.invoicePaymentId = invoicePaymentAddForm.invoicePaymentId
                data.invoiceNo = invoicePaymentAddForm.invoiceNo
                data.invoiceCode = invoicePaymentAddForm.invoiceCode
                data.currency = invoicePaymentAddForm.currency
                data.amt = invoicePaymentAddForm.amt
                data.invoiceIssueDate = invoicePaymentAddForm.invoiceIssueDate
                data.taxRate = invoicePaymentAddForm.taxRate
                data.rate = invoicePaymentAddForm.rate
                data.taxAmt = invoicePaymentAddForm.taxAmt
                data.invoiceType = invoicePaymentAddForm.invoiceType
                data.remark = invoicePaymentAddForm.remark
                data.receiveNo = invoicePaymentAddForm.receiveNo
                data.fileNo = invoicePaymentAddForm.fileNo
                data.fileName = invoicePaymentAddForm.fileName
                data.checkInvoiceFileNo = invoicePaymentAddForm.checkInvoiceFileNo
                data.checkInvoiceFileName = invoicePaymentAddForm.checkInvoiceFileName
                data.amtCny = invoicePaymentAddForm.amtCny
                 this.loadingAdd = true
                invoicePaymentUpdate(data).then((res) => {
                    this.$msgSucClose('修改成功!')
                    this.delVisitedView()
                    this.cancel(true)
                }).finally(()=>{
                  this.loadingAdd = false
                })
            }else{
                for (let i = 0; i < data.invoicePaymentList.length; i++) {
                  if(data.invoicePaymentList[i].currency !== this.invoicePaymentAddForm.selfCurrency){
                    return this.$msgErrClose('我司账户币种和开票币种不一致！')
                  }
                  if(this.invoicePaymentAddForm.supplierCurrency !== data.invoicePaymentList[i].currency){
                    return this.$msgErrClose('供应商账户币种和开票币种不一致！')
                  }
                }
                let invoiceNoCode = []
                data.invoicePaymentList.forEach(item=>{
                  invoiceNoCode.push(item.invoiceNo + item.invoiceCode)
                })
                if(this.isRepeat(invoiceNoCode)){
                  return this.$msgErrClose('发票号+发票代码不能相同，请重新输入！')
                }
                this.invoiceAdd(data)
            }
        }
      })
    },
    isRepeat(arr) {
      var hash = {};
      for(var i in arr) {
        if(hash[arr[i]]) {
          return true;
        }
        // 不存在该元素，则赋值为true，可以赋任意值，相应的修改if判断条件即可
        hash[arr[i]] = true;
      }
      return false;
    },
    invoiceAdd(data){
      data.sourceType = 'user_input'
      this.loadingAdd = true
      add(data).then((res) => {  
        this.$msgSucClose('提交成功!');
        if(this.$route.query.req){
          sessionStorage.setItem( this.$route.query.req, JSON.stringify(res.data)); 
        }
        this.delVisitedView()
        this.cancel(true)
         
      }).finally(()=>{
        this.loadingAdd = false
      })
    },
    invoiceNoChange(item,index){
      let array = this.invoicePaymentAddForm.invoicePaymentList
      let list = []
      if(array.length===1) return false
      if(!item.invoiceNo) return false
      for (let i = 0; i < array.length; i++) {
        if(i !== index){
          list.push(array[i])
        }
      }
      let invoiceNoFlag = false
      for (let i = 0; i < list.length; i++) {
          if(item.invoiceNo == list[i].invoiceNo){
            invoiceNoFlag = true
          }
      }
      return invoiceNoFlag
    },
    sendResFileList(val,index) {
      if (val && val.length) {
        console.log(val);
        console.log(index);
        console.log(val.length);
        this.invoicePaymentAddForm.invoicePaymentList[index].fileNo = val[val.length-1].fileNo
        this.invoicePaymentAddForm.invoicePaymentList[index].fileName = val[val.length-1].name
        // this.invoicePaymentAddForm.fileId = val[0].oid
      }else{
        this.invoicePaymentAddForm.invoicePaymentList[index].fileNo = ''
        this.invoicePaymentAddForm.invoicePaymentList[index].fileName = ''
      }
    },
    sendResFileLists(val,index) {
      console.log(val);
      console.log(index);
      if (val && val.length) {
        console.log(val);
        console.log(index);
        console.log(val.length);
        this.invoicePaymentAddForm.invoicePaymentList[index].checkInvoiceFileNo = val[val.length-1].fileNo
        this.invoicePaymentAddForm.invoicePaymentList[index].checkInvoiceFileName = val[val.length-1].name
        // this.invoicePaymentAddForm.fileId = val[0].oid
      }else{
        this.invoicePaymentAddForm.invoicePaymentList[index].checkInvoiceFileNo = ''
        this.invoicePaymentAddForm.invoicePaymentList[index].checkInvoiceFileName = ''
      }
    },
    accountShortNameList(val){
      console.log(val);
    },
    accountShortNameChange(val) {
      this.invoicePaymentAddForm.accountShortName = val.accountShortName
      this.invoicePaymentAddForm.bankBranchName = val.bankBranchName
      this.invoicePaymentAddForm.accountNo = val.accountNo
      this.invoicePaymentAddForm.bankName = val.bankName
      this.invoicePaymentAddForm.selfCurrency = val.currency
    },
    accountShortNameFocus(val){
      setTimeout(() => {
        if(this.invoicePaymentAddForm.currency === ''){
          return this.$msgErrClose('请先选择币种！')
        }
      }, 150)
    },
    corpBankChange(val) {
      console.log(val);
      this.invoicePaymentAddForm.supplierBankName = val.bankName
      this.invoicePaymentAddForm.supplierBankBranchName = val.bankBranch   
      this.invoicePaymentAddForm.supplierAccountNo = val.accountNo
      this.invoicePaymentAddForm.supplierCurrency = val.currency
    },
    corpBankChangeFocus(){
      if(this.invoicePaymentAddForm.supplierCorpName === ''){
        this.invoicePaymentAddForm.bankAccountsList = []
        this.$forceUpdate()
        return this.$msgErrClose('请先选择结算单位！')
      }
    },
    bankAccountListData(){
      if(!this.invoicePaymentAddForm.supplierCorpCode){
          return
      }
      let receipayType = "pay"
      // let receipayType = ""
      this.$store.dispatch('dict/bankAccountList', {"accountNo":'' , receipayType, "unitCode":this.invoicePaymentAddForm.supplierCorpCode,"status":"effect"}).then((data) => {
        let arr = data ? data :[]
        let list = []
        arr.forEach(item=>{
          if(item.publicType === "pub"){
            list.push(item)
          }
        })
        this.invoicePaymentAddForm.bankAccountsPubList = list
          let bankAccountsList = []
          if(this.invoicePaymentAddForm.invoicePaymentList[0].currency){
            list.forEach(it=>{
              if(this.invoicePaymentAddForm.invoicePaymentList[0].currency === it.currency){
                bankAccountsList.push(it)
              }
            })
          }
          this.invoicePaymentAddForm.bankAccountsList = bankAccountsList
        this.$forceUpdate()
      })
    },
    scrollEvent({ scrollLeft, scrollTop }) {
        console.log(scrollLeft);
        console.log(scrollTop);
    },
  },
  computed: {
    isDetail() {
      return this.invoicePaymentId || this.invoiceNo
    },
  },
  watch: {
    'invoicePaymentAddForm.invoicePaymentList': {
      handler(newVal) {
        this.regSum = this.computeFeeSum(newVal, { feeAmt: 'amt' })
      },
      deep: true
    }
  },
  components: {
    FinUploadEmbed,
  },
  activated(){
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 300) {
      this.init()
    }
    var height = document.body.clientHeight -99
    console.log(height);
    this.screenHeight = { height: height + 'px' };
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
    .item-list-invoice-payment{
      margin: 12px 12px 0;
    }

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
          padding-bottom:16px;
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
    }
  }
  .invoice-payment-list-reg-top{
    width: 100%;
  }
  .finance-table-container:last-of-type {
    margin-bottom: 8px;
  }
  .invoice-payment-reg-sum {
    margin: 0 14px 8px;
    height: 30px;
    padding: 5px 0;
    line-height: 20px;
    background: #F8F9FD;
  }
</style>