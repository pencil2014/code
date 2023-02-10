<template>
    <el-dialog
    :title="invoicePaymentAddForm.titleName !== '修改' ? '发票登记' : '发票'+invoicePaymentAddForm.titleName"
    :visible.sync="dialogVisibleInvoice"
    :before-close="cancel"
    :close-on-click-modal="false"
    width="900px" top = 6vh
    >
      <div  class="">
        <el-form
        :model="invoicePaymentAddForm"
        :rules="invoicePaymentAddRules"
        ref="invoicePaymentAddForm"
        :inline="true"
        size="mini"
        label-width="94px"
        :disabled="!!isDetail"
      >
        <div class="dialog-add-dialog-item" v-for="(item,index) in invoicePaymentAddForm.invoicePaymentList" :key="'invoicePaymentList'+index">
            <div><p class="title">发票信息{{index+1}}</p></div>
            <el-form-item label="发票代码" :prop="`invoicePaymentList[${index}].invoiceCode`" :rules="[{ required: invoicePaymentAddForm.isRepeatInvoiceNo, message: ' ', trigger: 'change' },{ pattern:  /^[A-Za-z0-9]+$/, message: '必须数字或字母' }]">
                <el-input v-model="item.invoiceCode" maxlength="16" placeholder="请输入发票代码"></el-input>
            </el-form-item>
            <el-form-item label="发票类型" :prop="`invoicePaymentList[${index}].invoiceType`" :rules="{ required: true, message: ' ', trigger: 'change' }">
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
            <el-form-item label="发票号" :prop="`invoicePaymentList[${index}].invoiceNo`" :rules="[{ required: true, message: ' ', trigger: 'change' },{ pattern:  /^[A-Za-z0-9]+$/, message: '必须数字或字母' },{ len:8, message:'必须8位', trigger:'blur' }]">
                <el-input v-model="item.invoiceNo" maxlength="8" placeholder="请输入发票号"></el-input>
            </el-form-item>
            <el-form-item label="发票金额" :prop="`invoicePaymentList[${index}].amt`" :rules="{ required: true, message: ' ', trigger: 'change' }" >
                <el-input
                    v-lsNumber="{value:'number', obj:item, key:'amt'}"
                    @input="changeAmt(item)"
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
                <el-select v-model="item.currency" @change="changeCurrency(item.currency,index)" filterable placeholder="请选择" @input="changeAmt(item)" style="width:170px;">
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
                    v-model="item.rate"
                    @input="changeAmt(item)"
                    v-lsNumber="{value:'number', obj:item, key:'rate',dot:11}"
                    maxlength="16"
                    placeholder="请输入"
                ></el-input>
            </el-form-item>
            <el-form-item label="发票登记编号" :prop="`invoicePaymentList[${index}].receiveNo`" :rules="[{ required: isCompany && item.invoiceType !== 'electronic', message: ' ', trigger: 'change' },{ pattern:  /^[A-Za-z0-9]+$/, message: '必须数字或字母' }]">
                <el-input v-model="item.receiveNo" maxlength="32" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="税额" :prop="`invoicePaymentList[${index}].taxAmt`" :rules="{ required: false, message: ' ', trigger: 'change' }">
                <el-input v-model="item.taxAmt" disabled maxlength="16" placeholder="请输入"></el-input>
            </el-form-item>
            <el-form-item label="价税合计" :prop="`invoicePaymentList[${index}].amtCny`" :rules="{ required: false, message: ' ', trigger: 'change' }">
                <el-input v-model="item.amtCny" disabled maxlength="16" placeholder="请输入"></el-input>
            </el-form-item>
            
            <!-- 添加v-if 解决再次进入仍会显示之前上传的文件 -->
            <!-- :prop="`invoicePaymentList[${index}].fileNo`" :rules="{ required: item.invoiceType ==='electronic', message: '必须上传', trigger: 'change' }" -->
            <el-form-item
            v-if="isShowUpload"
            :label="isDetail ? '发票附件' : '上传发票附件'"
            class="invoice-payment-add-form-upload"
            >
            <FinanceUploadEmbed
                class=""
                v-if="!isDetail"
                :accept-types="['jpg','jpeg','png','pdf']"
                :acceptSelf="'image/jpeg,application/pdf,image/jpeg,image/png'"
                :upload-api="uploadApi2"
                :upload-params="uploadParams2"
                :limit="1"
                :index="index"
                :file-list-edit="fileListEdit"
                @send-res-file-list="sendResFileList"
            />
            <el-link
                type="primary"
                :underline="false"
                :href="item.fileNo"
                target="_blank"
            >
            </el-link>
            </el-form-item>

            <el-form-item label="备注" prop="remark" style="width:100%;" >
                <el-input
                    type="textarea"
                    style="width:720px"
                    v-model="item.remark"
                    placeholder="请输入备注，不能超过500个字"
                    maxlength="500"
                    show-word-limit
                ></el-input>
            </el-form-item>
            <el-form-item label=" " prop="remark" style="width:100%;">
                <el-button size="mini" @click="handleAdd" class="dialog-add-dialog-item-add" v-if="index==0"> <i class="el-icon-plus"></i>添加发票</el-button>
                <el-button size="mini" @click="handleDelete(index)" class="dialog-add-dialog-item-add" v-if="index!=0"> <i class="el-icon-delete"></i>删除发票</el-button>
            </el-form-item>
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
            <!-- <el-form-item label="付款银行" prop="">
                <el-input v-model="invoicePaymentAddForm.bankName" placeholder="请输入" disabled></el-input>
            </el-form-item> -->
            <el-form-item label="我司开户行" prop="">
                <el-input :value="`${invoicePaymentAddForm.bankName ? invoicePaymentAddForm.bankName : ''}${invoicePaymentAddForm.bankBranchName?'(':''}${invoicePaymentAddForm.bankBranchName ? invoicePaymentAddForm.bankBranchName : ''}${invoicePaymentAddForm.bankBranchName?')':''}`" placeholder="请输入" disabled></el-input>
            </el-form-item>
            <!-- <el-form-item label="我司开户行" prop="">
                <el-input v-model="invoicePaymentAddForm.bankBranchName" placeholder="请输入" disabled></el-input>
            </el-form-item> -->
            <el-form-item label="我司账号" prop="">
                <el-input v-model="invoicePaymentAddForm.accountNo" placeholder="请输入" disabled></el-input>
            </el-form-item>
            <el-form-item label="我司电话" prop="">
                <el-input v-model="invoicePaymentAddForm.tel" placeholder="请输入" disabled></el-input>
            </el-form-item>
            <el-form-item label="我司地址" prop="">
                <el-input style="width:720px" v-model="invoicePaymentAddForm.addr" placeholder="请输入" disabled></el-input>
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
            <el-form-item label="发票抬头" prop="supplierTitle">
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
            <!-- <el-form-item label="收款银行" prop="">
                <el-input v-model="invoicePaymentAddForm.supplierBankName" placeholder="请输入" disabled></el-input>
            </el-form-item> -->
            <el-form-item label="供应商开户行" prop="">
                <el-input :value="`${invoicePaymentAddForm.supplierBankName ? invoicePaymentAddForm.supplierBankName : ''}${invoicePaymentAddForm.supplierBankBranchName?'(':''}${invoicePaymentAddForm.supplierBankBranchName ? invoicePaymentAddForm.supplierBankBranchName : ''}${invoicePaymentAddForm.supplierBankBranchName?')':''}`" placeholder="请输入" disabled></el-input>
            </el-form-item>
            <!-- <el-form-item label="供应商开户行" prop="">
                <el-input v-model="invoicePaymentAddForm.supplierBankBranchName" placeholder="请输入" disabled></el-input>
            </el-form-item> -->
            <el-form-item label="电话" prop="">
                <el-input v-model="invoicePaymentAddForm.supplierTel" placeholder="请输入" disabled></el-input>
            </el-form-item>
            <el-form-item label="地址" prop="">
                <el-input style="width:720px" v-model="invoicePaymentAddForm.supplierAddr" placeholder="请输入" disabled></el-input>
            </el-form-item>
        </div>
        
      </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="submitAdd">提交</el-button>
        <el-button size="mini" @click="cancel">取消</el-button>
      </span>
    </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import FinanceUploadEmbed from '@/views/finance/components/financeUpload/financeUploadEmbed'
import { getSettleUnitInvoiceInfo } from '@/api/fin/invoiceReceivableApply'
import { actualExchangeRate } from '@/api/base'
import { add, info, invoicePaymentUpdate } from '@/api/fin/invoicePayment'
import { getValueByKey } from '@/api/order/list'
import { getCompanyInvoiceInfo } from '@/api/fin/company'
import { calculateTaxAmount } from '@/api/fin/tax'
import { dateFormat } from '@/views/finance/utils/finance'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { formatTime } from '@/utils'
export default {
    mixins: [mixin],
    name:"registerInvoice",
    props: {
        dialogVisibleInvoice: {
          type: Boolean,
          default: false
        },
        invoicePaymentAddForm: {
          type: Object,
          default: () => ({})
        },
        invoicePaymentId: {
          type: Number,
          default: 0
        },
        invoiceNo: {
          type: Number,
          default: 0
        },
        amt: {
          type: String,
          default: ""
        },
    },
    data(){
        let rules = [{ required: true, message: '必填', trigger: 'blur' }]
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
            bankAccountsPubList:[]
        }
        let invoicePaymentAddRules = {}
        Object.keys(invoicePaymentAddForm).forEach((item) => {
            if (item === 'supplierCorpCode' || item === 'remark' || item === 'taxAmt') return
            invoicePaymentAddRules[item] = item !== 'supplierCorpName' ? rules : [{ ...rules[0], trigger: 'change' }]
        })
        return {
            validCurrencyList:[],
            fileListEdit:[],
            //税率列表
            exchangeRateList:[],
            // 表单参数验证
            invoicePaymentAddRules,
            isCompany:false,
            //供应商信息
            autocomplete: {
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
            },
            uploadApi2: '/base/webapi/file/upload',
            uploadParams2: {},
            isShowUpload: true,
            defaultTime:''
        }
    },
    methods: {
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
        
        changeAmt(val){
            console.log(val);
            console.log(val.taxRate);
            clearTimeout(this.timer1)
            this.timer1 = setTimeout(() => { 
                if(val.amt && val.rate){
                    let amt = Number(val.amt)
                    let rate = Number(val.rate)
                    let taxRate = Number(val.taxRate)
                    //不含税金额 = 四舍五入(USD金额×开票汇率/(1+税率))
                    //税额 = USD金额×开票汇率-不含税金额。
                    let amtCny = this.mathRound(amt * rate);
                    let excludingTaxAmt = amtCny/(1 + taxRate);
                    val.taxAmt = this.mathRound(amtCny-amtCny/(1 + taxRate));
                    val.amtCny = this.mathRound(excludingTaxAmt + val.taxAmt);
                }
                return val
            },800)
        },
        // 获取发票详情
        getDetail(data) {
            info(data)
                .then((res) => {
                this.invoicePaymentAddForm = { ...this.invoicePaymentAddForm, ...res.data }
                this.invoicePaymentAddForm.bankName = res.data.supplierBank
                this.invoicePaymentAddForm.accountNo = res.data.supplierAccountNo
                // this.invoicePaymentAddForm.src = res.data.supplierAccountNo
                })
            .catch((err) => {
                Object.keys(this.invoicePaymentAddForm).forEach((key) => {
                    this.invoicePaymentAddForm[key] = ''
                })
            })
        },
        sendResFileList(val,index) {
            if (val && val.length > 0) {
                console.log(val);
                console.log(index);
                this.invoicePaymentAddForm.invoicePaymentList[index].fileNo = val[0].fileNo
                this.invoicePaymentAddForm.invoicePaymentList[index].fileName = val[0].name
                // this.invoicePaymentAddForm.fileId = val[0].oid
            }
        },
        submitAdd() {
            this.$refs.invoicePaymentAddForm.validate((valid) => {
                if (valid) {
                    for (let i = 0; i < this.invoicePaymentAddForm.invoicePaymentList.length; i++) {
                        if (!this.validateMoney(this.invoicePaymentAddForm.invoicePaymentList[i].amt, { positive: true })) return
                        
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
                    
                    if(this.invoicePaymentAddForm.titleName ==="修改"){
                        let invoicePaymentAddForm = this.invoicePaymentAddForm.invoicePaymentList[0]
                        if(invoicePaymentAddForm.currency !== this.invoicePaymentAddForm.selfCurrency){
                            return this.$msgErrClose('我司账户币种和开票币种不一致！')
                        }
                        if(this.invoicePaymentAddForm.supplierCurrency !== invoicePaymentAddForm.currency){
                            return this.$msgErrClose('供应商账户币种和开票币种不一致！')
                        }
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
                        data.amtCny = invoicePaymentAddForm.amtCny
                        invoicePaymentUpdate(data).then((res) => {
                            this.$msgSucClose('修改成功!')
                            this.cancel(true)
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
                        add(data).then((res) => {
                            this.$msgSucClose('提交成功!')
                            this.cancel(true)
                        })
                    }
                }
            })
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
        accountShortNameList(val){
            console.log(val);
        },
        accountShortNameFocus(val){
            setTimeout(() => {
                if(this.invoicePaymentAddForm.currency === ''){
                    return this.$msgErrClose('请先选择币种！')
                }
                // if(this.invoicePaymentAddForm.invoiceBankFilterList.length === 0){
                //     return this.$msgErrClose('没有对应的币种账号！')
                // }
            }, 150)
        },
        accountShortNameChange(val) {
            this.invoicePaymentAddForm.accountShortName = val.accountShortName
            this.invoicePaymentAddForm.bankBranchName = val.bankBranchName
            this.invoicePaymentAddForm.accountNo = val.accountNo
            this.invoicePaymentAddForm.bankName = val.bankName
            this.invoicePaymentAddForm.selfCurrency = val.currency
        },
        cancel(isBreak) {
            this.$emit('close-dialog-visible',false ,isBreak)  //第一参数返回不刷新，第二参数刷新列表
            this.isShowUpload = false
            this.$nextTick(() => {
                this.isShowUpload = true
            })
            this.$refs['invoicePaymentAddForm'].clearValidate()
        },
        amtTaxWatch() {
            let { amt, taxRate } = this.invoicePaymentAddForm
            if (amt && amt !== '' && taxRate !== '') {
                clearTimeout(this.timeout)
                this.timeout = setTimeout(() => {
                    calculateTaxAmount({ amt, taxRate }).then((res) => {
                        this.invoicePaymentAddForm.taxAmt = res.data && res.data.taxAmt
                    })
                }, 1000)
            }
        },
        mathRound(num){
            return Math.round(num*100)/100
        },
        //汇率
        actualExchange(){
            actualExchangeRate({rateType: 'pay'}).then(res => {
                if (res.code === 0) {
                    this.exchangeRateList = res.data
                    // this.currencyChange(this.form.currency)
                }
            })
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
        //添加发票
        handleAdd(){
            if(this.invoicePaymentAddForm.titleName === '修改'){
                return this.$msgErrClose('修改无法添加多个发票！')
            }
            let invoiceData = {
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
                amtCny: '',
            }
            this.invoicePaymentAddForm.invoicePaymentList.push(invoiceData)
        },
        //删除发票
        handleDelete(index){
            this.invoicePaymentAddForm.invoicePaymentList.splice(index,1)
        },
        validCurrencyListData(){ 
            let val = this.dictMap["validCurrency"]
            let isCurrencyList = val.filter(item=>{
                return item.label === 'USD' || item.label === "CNY"
            })
            let onCurrencyList = val.filter(item=>{
                return item.label !=="USD" && item.label !=="CNY"
            })
            this.validCurrencyList = isCurrencyList.concat(onCurrencyList)
        }

    },
    computed: {
        isDetail() {
            return this.invoicePaymentId || this.invoiceNo
        },
    },
    watch: {
        // "invoicePaymentAddForm.invoicePaymentList":{
        //     handler(newValue,oldValue){
        //         console.log(newValue);
        //         console.log(oldValue);
        //         clearTimeout(this.timer1)
        //         this.timer1 = setTimeout(() => { 
        //             newValue.forEach((item,index)=>{
        //                 if(item.amt && item.rate && item.taxRate){
        //                     let amt = Number(item.amt)
        //                     let rate = Number(item.rate)
        //                     let taxRate = Number(item.taxRate)
        //                     //不含税金额 = 四舍五入(USD金额×开票汇率/(1+税率))
        //                     //税额 = USD金额×开票汇率-不含税金额。
        //                     item.amtCny = this.mathRound(amt * rate);
        //                     item.taxAmt = this.mathRound(item.amtCny-item.amtCny/(1 + taxRate))
        //                 }
        //             })
        //         },800)
        //     },
        //     deep: true
        // },
        dialogVisibleInvoice(val){
            clearTimeout(this.timer2)
            this.timer2 = setTimeout(() => {
                 if(val){
                    getValueByKey("FIN_INVOICE_RECNO_VALID_COMPANY").then(res=>{
                        let list = res.data.split(",")
                        for (let i = 0; i < list.length; i++) {
                            if(list[i] === this.invoicePaymentAddForm.companyCode){
                                //深圳长帆供应链、深圳长帆物流，这两个深圳的公司，纸质发票，发票登记号是必填
                                this.isCompany = true
                            }
                        }
                    })
                    this.validCurrencyListData()
                    this.fileListEdit = []
                    if(this.invoicePaymentAddForm.fileName && this.invoicePaymentAddForm.fileNo){
                        this.fileListEdit.push({
                            name: this.invoicePaymentAddForm.fileName,
                            url: this.invoicePaymentAddForm.fileNo
                        })
                    }
                    this.actualExchange()
                    // 我司信息
                    // 如果不是修改的带默认值
                    if(this.invoicePaymentAddForm.titleName !== "修改") { 
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
                            this.bankAccountListData()
                            if(this.invoicePaymentAddForm.bankAccountsList && this.invoicePaymentAddForm.bankAccountsList.length){
                                // 如果不是修改的带默认值
                                if(this.invoicePaymentAddForm.titleName !== "修改") { 
                                    this.invoicePaymentAddForm.supplierAccountNo = ''
                                    this.invoicePaymentAddForm.supplierBankName = ''
                                    this.invoicePaymentAddForm.supplierBankBranchName = ''
                                    this.invoicePaymentAddForm.supplierCurrency = ''
                                    for (let i = 0; i < this.invoicePaymentAddForm.bankAccountsList.length; i++) {
                                        if(this.invoicePaymentAddForm.bankAccountsList[i].accountNo === this.invoicePaymentAddForm.recvAccountNo){
                                            this.invoicePaymentAddForm.supplierAccountNo = this.invoicePaymentAddForm.bankAccountsList[i].accountNo
                                            this.invoicePaymentAddForm.supplierBankName = this.invoicePaymentAddForm.bankAccountsList[i].bankName
                                            this.invoicePaymentAddForm.supplierBankBranchName = this.invoicePaymentAddForm.bankAccountsList[i].bankBranch
                                            this.invoicePaymentAddForm.supplierCurrency = this.invoicePaymentAddForm.bankAccountsList[i].currency
                                        }
                                        
                                    }
                                }
                            }
                        })
                    }
                    //币种
                    let value = this.invoicePaymentAddForm.invoicePaymentList[0].currency
                    if(value){
                        if(value === 'CNY'){
                            this.invoicePaymentAddForm.invoicePaymentList[0].rate = 1
                        }
                    }
                    var day2 = new Date();
                    day2.setTime(day2.getTime());
                    let m = (day2.getMonth()+1) > 9 ? (day2.getMonth()+1) : '0' + (day2.getMonth()+1)
                    let d = day2.getDate() > 9 ? day2.getDate() : '0' + day2.getDate()
                    this.defaultTime = day2.getFullYear()+"-" + m + "-" + d;
                }
            },500)
           
        }
        // 'invoicePaymentAddForm.supplierCorpCode'(newVal) {
        //   console.log('supplierCorpCode: ', newVal)
        //   if(newVal && newVal !== '') {
        //     let data = {
        //       unitCode: newVal
        //     }
        //     getSettleUnitInvoiceInfo(data).then(res => {
        //       if (res.code === 0) {
        //         this.invoicePaymentAddForm.taxNo = res.data.taxNo
        //       }
        //     })
        //   }
        // }
    },
    components: {
        FinanceUploadEmbed,
    },
}
</script>

<style lang="scss" scoped>
 .dialog-add-dialog-item{
    border-bottom: 1px solid #D8D8D8;
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
    .el-button {
        border: 1px dashed #DCDFE6;
    }
 }
 .dialog-add-dialog-item-1{
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
    /deep/ .invoice-payment-add-form-upload{
        .el-form-item__error{
            position: absolute;
            top: 4px;
            left: 4px;
        }
    }
 }
    .dialog-add-dialog-item-add{
        width:720px;
    }
</style>