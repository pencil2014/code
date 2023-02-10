<template>
  <div
    class="finance-page invoice-recei-apply"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">预收款开票申请</div>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button @click="submitApply('preview')" size="mini">预览发票</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" @click="addInvoice(true)" size="mini" type="primary">新增发票</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              @click="submitApply('yes')"
              type="primary"
              size="mini"
              :disabled="saveDisabled"
              :loading="btnLoading"
            >提交审核</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" @click="cancel" size="mini">{{$t('Common.cancel')}}</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    <div class="finance-container-scroll">
      <el-form
        :model="invoiceApplyForm"
        ref="form"
        :inline="true"
        size="mini"
        :rules="rules"
        label-width="112px"
      >
        <div class="settlement-detail-form">
          <h3>开票信息</h3>
          <div>
            <el-form-item label="开票类型：" prop="invoiceType">
              <el-select
                v-model="invoiceApplyForm.invoiceType"
                :placeholder="$t('Common.plSelect')"
                @change="invoiceTypeChange"
              >
                <el-option
                  v-for="(op, j) in dictMap['invoiceType']"
                  :key="j"
                  :label="op.label"
                  :value="op.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="开票币种：" prop="invoiceCurrency">
              <el-select v-model="invoiceApplyForm.invoiceCurrency" :placeholder="$t('Common.plSelect')">
                <el-option
                  v-for="(op, j) in settleCurrencyList"
                  :key="'invoiceCurrency' + j"
                  :label="op.label"
                  :value="op.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="开票方式：" prop="invoiceWay">
              <el-select v-model="invoiceApplyForm.invoiceWay" :placeholder="$t('Common.plSelect')">
                <el-option
                  v-for="(op, j) in dictMap['invoiceWay']"
                  :key="'invoiceWay' + j"
                  :label="op.label"
                  :value="op.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <DetailDiv labelWidth="112" label="单张发票限额：" :content="' '+quota+'CNY'" color="red" />
          </div>
          <!-- </el-form> -->
        </div>
        <div class="settlement-detail-form">
          <h3>客户信息</h3>
          <div>
            <el-form-item :label="$t('FeeList.settleCorp')" prop="settleCompInfoObj">
              <el-select
                v-model="invoiceApplyForm.settleCompInfoObj"
                :placeholder="$t('Common.plSelect')"
                filterable
                remote
                value-key="value"
                :remote-method="(val)=> querySettleUnit2({ queryString: val, isAdd: true }, unitNameList)"
                :visible-change="(val)=>val && querySettleUnit2({ queryString: '', isAdd: true }, unitNameList)"
                @change="unitNameChange"
              >
                <el-option
                  v-for="item in unitNameList.remoteSelectList"
                  :key="item.value"
                  :label="item.label"
                  :value="item"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="客户发票抬头：" prop="title">
              <el-input
                disabled
                type="text"
                v-model="invoiceApplyForm.title"
                :placeholder="$t('Common.plEnter')"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item label="纳税人识别号：" prop="taxNo">
              <el-input
                :disabled="isSysInfo || isCannotChange"
                type="text"
                v-model="invoiceApplyForm.taxNo"
                :placeholder="$t('Common.plEnter')"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item v-if="!isCannotChange" label="纳税人类型：" prop="taxpayerType">
              <el-select v-model="invoiceApplyForm.taxpayerType" :placeholder="$t('Common.plSelect')">
                <el-option
                  v-for="(op, j) in dictMap['taxpayerType']"
                  :key="'taxpayerType' + j"
                  :label="op.label"
                  :value="op.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="银行账号：" prop="accountNo">
              <el-select
                placeholder="请选择付款账户"
                v-if="isCannotChange"
                size="mini"
                style="width: 100%"
                v-model="invoiceApplyForm.accountNo"
                @change=" (value) => autocomplete1.select(value, true) "
              >
                <el-option
                  v-for="op in accountFilter.map((v) => ({ ...v,value:v.accountNo, }))"
                  :key="'bankAccounts' + op.value"
                  :label="op.value"
                  :value="op.value"
                >
                  <span>{{op.accountName + '(' + op.accountNo.slice(-4) + ')'}}</span>
                </el-option>
              </el-select>
              <el-autocomplete
                v-else
                size="mini"
                style="width: 100%"
                v-model="invoiceApplyForm.accountNo"
                :maxlength="128"
                placeholder="请输入付款账户名"
                :select-when-unmatched="true"
                :fetch-suggestions=" (queryString, cb) => autocomplete1.querySearch(queryString, cb) "
                @select=" (value) => autocomplete1.select(value) "
                @change=" (value) => autocomplete1.change && autocomplete1.change(value) "
                clearable
              ></el-autocomplete>
            </el-form-item>
            <el-form-item v-if="!isCannotChange" label="开户行：" prop="bankName">
              <el-autocomplete
                size="mini"
                style="width: 100%"
                v-model="invoiceApplyForm.bankName"
                :maxlength="128"
                :placeholder="$t('Common.plEnter')"
                :select-when-unmatched="true"
                :fetch-suggestions=" (queryString, cb) => autocomplete2.querySearch(queryString, cb) "
                @select=" (value) => autocomplete2.select(value) "
                @change=" (value) => autocomplete2.change(value) "
                clearable
              ></el-autocomplete>
            </el-form-item>
            <el-form-item v-if="!isCannotChange" label="开户行支行：" prop="bankBranchName">
              <el-input
                size="mini"
                v-model="invoiceApplyForm.bankBranchName"
                :maxlength="200"
                :placeholder="$t('Common.plEnter')"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item label="发票展示开户行：" prop="buyerBankInfo">
              <el-input
                :disabled="isCannotChange"
                type="text"
                v-model="invoiceApplyForm.buyerBankInfo"
                :placeholder="$t('Common.plEnter')"
                clearable
                style="width: 146px !important;"
              ></el-input>
              <span class="tips-box" @click="showTipsFn">
                <i class="el-icon-question"></i>
              </span>
            </el-form-item>
            <el-form-item label="客户电话：" prop="tel">
              <el-input
                :disabled="isCannotChange"
                type="text"
                v-model="invoiceApplyForm.tel"
                :placeholder="$t('Common.plEnter')"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item label="客户地址：" prop="addr" class="el-form-item-invoice-remark">
              <el-input
                :disabled="isCannotChange"
                type="textarea"
                v-model="invoiceApplyForm.addr"
                :placeholder="$t('Common.plEnter')"
                clearable
                autosize
              ></el-input>
            </el-form-item>
            <el-form-item label="客户邮箱：" prop="emailAddrs" class="el-form-item-invoice-remark">
              <el-input
                type="textarea"
                v-model="invoiceApplyForm.emailAddrs"
                autosize
                placeholder="可以多个邮箱，逗号分隔"
              ></el-input>
            </el-form-item>
          </div>
        </div>
        <div class="settlement-detail-form">
          <h3>我司信息</h3>
          <div>
            <DetailDiv
              labelWidth="112"
              :label="$t('Settle.branchCompany')"
              :content="invoiceApplyForm.settleCompName"
              :isTooltip="true"
            />
            <el-form-item label="银行简称：" prop="compBank">
              <el-select
                v-model="invoiceApplyForm.compBank"
                value-key="accountShortName"
                :placeholder="$t('Common.plSelect')"
                @change="compBankChange"
              >
                <el-option
                  v-for="(op, j) in invoiceApplyForm.compBanks || []"
                  :key="'compBank' + j"
                  :label="op.accountShortName"
                  :value="op"
                ></el-option>
              </el-select>
            </el-form-item>
            <DetailDiv
              labelWidth="112"
              label="发票抬头："
              :content="invoiceApplyForm.saleCompTitle"
              :isTooltip="true"
            />
            <DetailDiv labelWidth="112" label="纳税人识别号：" :content="invoiceApplyForm.saleCompTaxNo" />
            <DetailDiv
              labelWidth="112"
              label="我司开户行："
              :content="invoiceApplyForm.saleCompBankBranchName||''"
              :isTooltip="true"
            />
            <DetailDiv labelWidth="112" label="银行账号：" :content="invoiceApplyForm.saleCompBankNo" />
            <DetailDiv labelWidth="112" label="电话：" :content="invoiceApplyForm.saleCompTel" />
            <DetailDiv
              labelWidth="112"
              label="地址："
              :content="invoiceApplyForm.saleCompAddr"
              :isTooltip="true"
            />
          </div>
        </div>
      </el-form>
      <div
        v-for="(item, index) in invoiceTableList"
        :key="'invoiceTableList' + index"
        class="finance-table-container"
      >
        <div class="money-box">
          <div class="money-box-left">
            <div class="money-title">发票服务项-发票{{index + 1}}</div>
            <div class="money-total">
              开票金额合计：
              <span v-html="'CNY' + item.itemSum"></span>
              （记账汇率：{{invoiceApplyForm.invoiceCurrency + '-CNY ' + invoiceCurrencyToCNYRate}}）
            </div>
          </div>
          <div class="money-box-right">
            <el-button @click="previewInvoice(index)" size="mini">预览发票</el-button>
            <el-button @click="addItemName(index)" size="mini" type="primary">新增服务项</el-button>
            <el-button
              v-show="index > 0 && item.canDelete"
              @click="deleteInvoice(index)"
              size="mini"
              type="danger"
            >删除发票</el-button>
          </div>
        </div>
        <FinanceTableMass :option="item" />
      </div>
      <div class="all-invoice-amt-cny">
        <div class="money-box">
          <div class="money-box-left">
            <div class="money-total">
              全部发票合计：
              <span v-html="'CNY' + this.allInvoiceAmtCNY"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <InovicePreviewPrint
      :dialog-visible-o="dialogVisibleO"
      :customer-info="customerInfo"
      :seller-info="sellerInfo"
      :apply-item-group-list="applyItemGroupList"
      :other-invoice-info="otherInvoiceInfo"
      @print-invoice="sureSave"
      :list="invoicePreviewList"
      :isElec="invoiceApplyForm.invoiceType"
      :commitStatus="CommitStatus"
      :hideSave="true"
    />
    <el-dialog title :visible.sync="showTips" width="648px">
      <img src="../../../../assets/invoice.png" alt="invoice" />
    </el-dialog>
  </div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import InovicePreviewPrint from './invoicePreviewPrint'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { printMixin } from './mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { getSettleUnitInvoiceInfo, invoiceApplySave, toPreInvoice } from '@/api/fin/invoiceReceivableApply'
import { getCurrentExchangeRate } from '@/api/base'
import { bankList } from '@/api/crm/common'
import { setCamelFormat } from '@/utils/index'

export default {
  name: 'invoiceReceivableApply',
  mixins: [mixin, printMixin, routerMixin],
  activated() {
    if (this.$route.meta.isUseCache) {
      return
    }
    this.init()
  },
  data() {
    return {
      feeSearchToggle: true, //费用搜索默认显示
      showTips: false,
      isCannotChange: false, // 抬头、识别号、开户行、电话、地址   纳税人类型、支行、发票开户行
      isSysInfo: false, // 客户发票抬头、纳税人识别号，如果系统已维护则禁止修改
      invoicePreviewList: [],
      showCorpInfo: false,
      loading: false,
      billId: '',
      option2: {}, // 发票服务项列表
      moneyTitle1: '应收费用列表',
      moneyTitle2: '发票服务项',
      multipleSelection1: [],
      invoiceApplyForm: {
        invoiceType: 'electronic', // ordinary
        invoiceCurrency: '', // USD
        invoiceWay: 'manual',
        itemGoupType: 'merge', // merge
        totalInvoiceAmtApply: '',
        totalInvoiceAmtApplyCNY: '',
        bankAccounts: null, //结算单位账户
        compBanks: null, //分公司账户
        corpBank: null,
        compBank: null,
        title: '',
        taxNo: '',
        splitNo: '', // 2
        splitUnitAmt: '', // 39.22
        // rate: '',
        emailAddrs: '', //
        remark: '',
        remarkOldVal: '',
        latestDate: '', // 2020-12-18
        postAddr: '',
        postPhone: '',
        postType: '',
        unitName: '',
        bankName: '',
        bankBranchName: '',
        accountNo: '',
        addr: '',
        tel: '',
        saleCompBankName: '',
        saleCompBankBranchName: '',
        saleCompBankNo: '',
        saleCompAddr: '',
        saleCompTel: '',
        // taxpayerNo: '',
        saleCompTitle: '',
        saleCompTaxNo: '',
        settleCompInfoObj: {},
        buyerBankInfo: '',
        taxpayerType: '',
      },
      rules: {
        invoiceType: [{ required: true, message: ' ', trigger: 'blur' }],
        invoiceCurrency: [{ required: true, message: ' ', trigger: 'blur' }],
        itemGoupType: [{ required: true, message: ' ', trigger: 'blur' }],
        emailAddrs: [{ required: true, message: ' ', trigger: 'blur', validator: this.validateEmail }],
        postType: [{ required: true, message: ' ', trigger: 'blur' }],
        postAddr: [{ required: true, message: ' ', trigger: 'blur' }],
        postPhone: [{ required: true, message: ' ', trigger: 'blur' }],
        latestDate: [{ required: true, message: ' ', trigger: 'blur' }],
        corpBank: [{ required: true, message: ' ', trigger: 'blur' }],
        title: [{ required: true, message: ' ', trigger: 'change' }],
        taxNo: [{ required: true, message: ' ', trigger: 'change' }],
        accountNo: [{ required: true, message: ' ', trigger: 'change' }],
        bankName: [{ required: true, message: ' ', trigger: 'change' }],
        bankBranchName: [{ required: true, message: ' ', trigger: 'change' }],
        buyerBankInfo: [{ required: true, message: ' ', trigger: 'change' }],
        tel: [{ required: true, message: ' ', trigger: 'change' }],
        addr: [{ required: true, message: ' ', trigger: 'change' }],
        emailAddrs: [{ required: true, message: ' ', trigger: 'change' }],
        taxpayerType: [{ required: true, message: ' ', trigger: 'change' }],
      },
      settleCompInfo: {
        taxNo: '', // 分公司纳税人识别号
        unitName: '', // 分公司名称 抬头
        bankName: '', // 分公司开户行
        accountNo: '', // 分公司银行账号
        addr: '', // 分公司地址
        tel: '', // 分公司电话
      },
      searchWords: '',
      totalAmount: '',
      totalInvoiceAmtApply: '',
      totalInvoiceAmtApplyCNY: '',
      taxRate: '',
      dialogVisibleO: { show: false },
      customerInfo: {},
      sellerInfo: {},
      applyItemGroupList: [],
      otherInvoiceInfo: {},
      invoiceRates: [],
      // 路由参数
      settleCurrencyList: [
        { label: 'USD', value: 'USD' },
        { label: 'CNY', value: 'CNY' },
      ],
      remarksOptions: [
        { label: '开票金额', value: 'amt' }, // 不显示开票金额
        { label: this.$t('FeeList.currency'), value: 'currency' },
        { label: '开票汇率', value: 'rate' },
      ],
      remarksSetting: [],
      remarksObj: {
        orderNo: '',
        tdTime: '',
        polPortName: '',
        podPortName: '',
        vesselVoyage: '',
        bl: '',
        // amt: '',
        // currency: '',
        // rate: ''
      },
      remarks: '',
      invoiceTableList: [],
      specialQuota: -1,
      ordinaryQuota: -1,
      electronicQuota: -1,
      electronicSpecialQuota: -1,
      quota: -1,
      option_rate: {},
      moreRateDialogVisible: false,
      invoiceReceivableApplyId: '',
      invoiceCurrencyToCNYRate: '',
      itemNameList: [],
      itemNameSelectOptions: [],
      invoiceApplyStatus: '',
      saveDisabled: false,
      allInvoiceAmtCNY: 0,
      unitNameList: { remoteSelectList: [] }, //预收款开票申请结算单位下拉列表
      CommitStatus: '',
      autocomplete1: {},
      autocomplete2: {},
      vm: this,
    }
  },
  components: {
    FinanceTableMass,
    InovicePreviewPrint,
  },
  computed: {
    accountFilter() {
      if (this.invoiceApplyForm.bankAccounts && this.invoiceApplyForm.bankAccounts.length) {
        return this.invoiceApplyForm.bankAccounts.filter((v) => v.currency == this.invoiceApplyForm.invoiceCurrency)
      }
      return []
    },
  },
  created() {
    //付款账户名
    this.autocomplete1 = {
      querySearch: (queryString, cb) => {
        let list = this.accountFilter.map((v) => {
          return { ...v, value: v.accountName + '(' + v.accountNo.slice(-4) + ')' }
        })
        cb(list)
      },
      select: (optionItem, isSlectChange) => {
        if (isSlectChange === true) {
          optionItem = this.accountFilter.find((v) => v.accountNo == optionItem)
        }
        console.log(optionItem)
        this.invoiceApplyForm.accountNo = optionItem.accountNo
        this.corpBankChange(optionItem)
      },
      change: (val) => {},
    }
    //付款银行
    this.autocomplete2 = {
      querySearch: (queryString, cb) => {
        let data = {
          currPage: 1,
          pageSize: 30,
          query: [{ column: 'cname', type: 'like', value: queryString }],
        }
        bankList(data).then((res) => {
          const list = res.data.list || []
          cb(list.map((item) => ({ key: item.bankCode, value: item.cname })))
        })
      },
      select: (optionItem, row) => {},
      change: (val, row) => {},
    }
  },
  methods: {
    init() {
      this.isSysInfo = false
      this.isCannotChange = false
      this.showCorpInfo = false
      // 初始化会引起自动验证
      this.invoiceApplyForm.splitNo = this.invoiceApplyForm.splitUnitAmt = ''
      this.$refs.form.resetFields()
      // this.$refs.form.clearValidate()
      this.invoiceCurrencyToCNYRate = '' // 清空，否则因请求的异步，导致还在用之前的该数据
      console.log(this.invoiceCurrencyToCNYRate)
      this.invoiceApplyForm.remarkOldVal = '' // 非form中prop，需手动清除
      this.remarksSetting = []
      this.itemNameSelectOptions = []
      this.invoiceTableList = []
      this.getData()
    },
    getData() {
      this.$refs.detailFeeSearch && this.$refs.detailFeeSearch.clearData()
      this.lsLoading = true
      this.invoiceApplyForm.emailAddrs = this.$store.state.user.userInfo.email
      this.itemNameSelectOptions = [{ label: '海运代理费', value: '海运代理费' }]
      this.invoiceApplyForm.bankAccounts = []
      this.invoiceTableList = []
      this.addInvoice()
      toPreInvoice({})
        .then((res) => {
          let resData1 = res.data || {}
          this.isCannotChange = !resData1.invoiceInfoEdit
          // 分公司  销售方
          this.invoiceApplyForm.settleCompName = this.$store.state.user.userInfo.settleCompanyName
          this.invoiceApplyForm.settleCompCode = this.$store.state.user.userInfo.settleCompanyCode
          // this.getCompanyInvoiceInfo({ companyCode: this.$store.state.user.userInfo.settleCompanyCode })
          if (!resData1.companyInvoiceInfo) {
            this.cancel('delete')
            this.lsLoading = false
            return this.$msgErrClose('分公司无开票信息！')
          }
          this.getCompanyInvoiceInfo(resData1.companyInvoiceInfo)
          this.invoiceApplyForm.invoiceCurrency = 'USD'
          this.lsLoading = false
        })
        .catch((err) => this.cancel('delete', err))
    },
    remarkChange(val, row, option) {
      if (!row) return
      let newVal = row.remark
      let oldVal = row.remarkOldVal
      if (this.invoiceApplyForm.invoiceCurrency !== 'CNY') {
        let reg1 = /.*\u3000.*/ // /.*\u3002.*/
        if (!newVal.match(reg1)) {
          option.remark = row.remark = oldVal
          console.log(option)
          return
        }
        let reg2 =
          /\u5f00\u7968\u5e01\u522b\uff1a[A-Z]{3}\uff0c\u5f00\u7968\u91d1\u989d\uff1a\d+\.*\d*\uff0c\u672c\u53d1\u7968\u53ea\u63a5\u53d7\u7f8e\u5143\u4ed8\u6b3e\uff0c\u5f00\u7968\u6c47\u7387\uff1a\d+\.*\d*\u3000.*/ // \u3002
        if (!newVal.match(reg2)) {
          let str = newVal.split('\u3000')[1]
          str = str ? str : ''
          let { invoiceCurrency: c, totalInvoiceAmtApply: t } = this.invoiceApplyForm.invoiceCurrency
          option.remark = row.remark =
            `开票币种：${c}，开票金额：${t}，本发票只接受美元付款，开票汇率：${this.invoiceCurrencyToCNYRate}\u3000` + str
          return
        }
        let reg3 = /\u3000.*\u3000/ // /\u3002.*\u3002/
        if (newVal.match(reg3)) {
          // this.invoiceApplyForm.remark = oldVal
          option.remark = row.remark = oldVal
          // TODO ^改为全角空格
          return this.$msgErrClose('请勿输入全角字符！')
        }
      } else {
        let reg1 = /.*\u3000.*/ // /.*\u3002.*/
        if (newVal.match(reg1)) {
          // this.invoiceApplyForm.remark = oldVal
          option.remark = row.remark = oldVal
          // TODO ^改为全角空格
          return this.$msgErrClose('请勿输入全角字符！')
        }
      }
      function getCharLength(str) {
        let len = 0,
          index = 0
        let length = str.length
        for (let i = 0; i < length; i++) {
          if (str.charCodeAt(i) > 255) {
            len += 2
          } else {
            len += 1
          }
          if (len > 230) {
            index = i
            break
          }
        }
        return index
      }
      let index = getCharLength(newVal)
      if (index) {
        // 实际maxlength已拦截，此处未进入
        // this.invoiceApplyForm.remark = remark.slice(0, 115)
        option.remark = row.remark = newVal.slice(0, index)
        return this.$msgErrClose('备注信息长度已达最大值！')
      }
      // this.invoiceApplyForm.remarkOldVal = this.invoiceApplyForm.remark
      row.remarkOldVal = row.remark
      option.remark = row.remark
    },
    // 结算单位 账户更改时，更新对应的信息
    corpBankChange(val) {
      // console.log(val)
      // this.invoiceApplyForm.saleCompBankName = val.bankName
      // this.invoiceApplyForm.saleCompBankNo = val.accountNo
      console.log(val)
      this.invoiceApplyForm.bankName = val.bankName || ''
      this.invoiceApplyForm.accountNo = val.accountNo || ''
      this.invoiceApplyForm.bankBranchName = val.bankBranch || ''
      this.invoiceApplyForm.buyerBankInfo = val.invoiceBankInfo || ''
      // saleCompBankName,saleCompBankNo,saleCompAddr,saleCompTel,taxPayerNo,
    },
    // 分公司账户更改，更新对应信息
    compBankChange(val) {
      this.invoiceApplyForm.saleCompAddr = val.addr || ''
      this.invoiceApplyForm.saleCompTel = val.tel || ''
      this.invoiceApplyForm.saleCompBankName = val.bankName || ''
      this.invoiceApplyForm.saleCompBankBranchName = val.bankBranchName || ''
      this.invoiceApplyForm.saleCompBankNo = val.accountNo || ''
      this.settleCompInfo = { ...val, unitName: val.title || '' }
    },
    // 币种更改
    currencyChange() {
      this.$nextTick(() => {
        if (this.invoiceApplyForm.compBanks && this.invoiceApplyForm.compBanks.length) {
          this.invoiceApplyForm.compBank = this.invoiceApplyForm.compBanks[0].accountShortName
          this.compBankChange(this.invoiceApplyForm.compBanks[0])
        } else {
          this.invoiceApplyForm.compBank = ''
          this.compBankChange({})
        }
      })
    },
    invoiceTypeChange() {
      this.backupQuota = this.quota
      console.log(setCamelFormat(this.invoiceApplyForm.invoiceType) + 'Quota')
      this.quota = this[setCamelFormat(this.invoiceApplyForm.invoiceType) + 'Quota']
      if (!this.quota) {
        this.invoiceApplyForm.invoiceType = ''
        return this.$msgErrClose('当前分公司此发票类型发票限额为0！')
      }
      // 之前限额同当前限额相同时，发票信息不动
      if (this.backupQuota == this.quota) {
        return
      }
    },
    renderInvoiceReceivableList(invoiceReceivableList) {
      if (!this.quota) return
      this.invoiceTableList = []
      let num = this.invoiceApplyForm.totalInvoiceAmtApplyCNY / this.quota
      let count = Math.floor(num)
      console.log(invoiceReceivableList)
      invoiceReceivableList.forEach((item, i) => {
        this.addInvoice()
        this.invoiceTableList[i].invoiceReceivableId = item.invoiceReceivableId
        this.invoiceTableList[i].remark = item.remark
        this.invoiceTableList[i].data = item.invoiceReceivableItemList.map((subItem) => {
          return {
            ...subItem,
            edit: false,
            // amtWithoutTax: decimalFixed2(subItem.amt / (1 + subItem.taxRate)),
            amtWithoutTax: new LSnum(subItem.amt).div(new LSnum(subItem.taxRate).plus(1)).toNum(2),
            remark: item.remark,
            remarkOldVal: item.remark,
            rowsCount: item.invoiceReceivableItemList.length,
          }
        })
        if (i + 1 > count + 1) {
          this.invoiceTableList[i].canDelete = true
        }
      })
      console.log(this.invoiceTableList)
    },
    addItemName(index) {
      this.resetItemNameSelectOptions()
      if (this.invoiceTableList[index].data.length >= 8) {
        return this.$msgErrClose('最多添加八项明细!')
      }
      let itemName = '' // bool ? '' : '*经纪代理服务*代理运费'
      this.invoiceTableList[index].data.push({
        itemName, // this.invoiceApplyForm.invoiceCurrency === 'USD' ? '海运费' : '代理运费',
        unit: 'bill',
        count: 1,
        price: '',
        amt: '',
        taxRate: this.taxRate + '',
        taxAmt: '',
        remark: this.invoiceTableList[index].remark,
        edit: true,
        amtWithoutTax: '',
      })
      this.invoiceTableList[index].data.forEach((item) => {
        item.rowsCount = this.invoiceTableList[index].data.length
      })
    },
    resetItemNameSelectOptions(row) {
      this.invoiceTableList.forEach((item) => {
        let find = item.columns.find((column) => {
          return column.prop === 'itemName'
        })
        find.selectOptions = this.itemNameSelectOptions
      })
    },
    addInvoice(canDelete) {
      this.invoiceTableList.push(this.initInvoiceTableOption(this.invoiceTableList.length, canDelete))
    },
    initInvoiceTableOption(index, canDelete) {
      // 发票服务项
      let operationBtns = Object.assign({}, this.option.operationBtns, {
        data: [
          { label: this.$t('Common.modify'), type: 'text', showFn: (row) => !row.edit, action: 'Edit' },
          { label: this.$t('Common.sure'), type: 'text', showFn: (row) => row.edit, action: 'Save' },
          { label: this.$t('Common.del'), type: 'text', show: true, action: 'Delete' },
        ],
        show: true,
      })
      let option = Object.assign({}, this.option, {
        id: 'option' + (index + 2),
        $name: 'InvoiceReceivableApply3',
        data: [
          {
            itemName: '', // this.invoiceApplyForm.invoiceCurrency === 'USD' ? '海运费' : '代理运费',
            unit: 'bill',
            count: 1,
            price: canDelete === 'fullQuota' ? this.quota : '',
            amt: canDelete === 'fullQuota' ? this.quota : '',
            taxRate: this.taxRate + '',
            taxAmt: '',
            remark: '',
            edit: true,
            amtWithoutTax: '',
          },
        ],
        tips: false,
        operationBtns: { show: false },
        selection: { show: false },
        edit: true,
        canDelete: canDelete === true,
        itemSum: '',
        spanMethod: ({ row, column, rowIndex, columnIndex }) => {
          if (column.params.prop === 'remark') {
            if (rowIndex === 0) {
              return { rowspan: row.rowsCount, colspan: 1 }
            } else {
              return { rowspan: 0, colspan: 0 }
            }
          }
        },
        remark: '',
        remarksSetting: this.remarksObj.bl && ['bl'],
        remarksOptions: this.remarksOptions,
        showOverflow: false,
        toggleHide: false,
      })
      option.columns = [
        {
          prop: 'itemName',
          label: '服务名称',
          type: 'select',
          filterable: true,
          allowCreate: true,
          width: 100,
          selectOptions: this.itemNameSelectOptions,
          showText: true,
        },
        { prop: 'unit', label: '单位', type: 'select', propInDict: 'feeUnit', width: 55 },
        { prop: 'count', label: this.$t('FeeList.quantity'), type: 'input', inputType: 'number', width: 55, positive: true },
        { prop: 'price', label: this.$t('FeeList.unitPrice'), type: 'input', width: 90, inputType: 'number', positive: true },
        { prop: 'amt', label: this.$t('FeeList.feeAmt'), type: 'text', width: 80 },
        { prop: 'amtWithoutTax', label: '金额(不含税)', type: 'text', width: 80 },
        { prop: 'taxRate', label: this.$t('FeeList.taxRate'), type: 'select', propInDict: 'taxRateInfo', width: 55 },
        { prop: 'taxAmt', label: this.$t('FeeList.taxAmt'), type: 'text' },
        { prop: 'operationBtns', label: '操作', type: 'operationBtns', operationBtns },
        {
          prop: 'remark',
          label: '发票备注',
          type: 'textarea',
          placeholder: '请输入备注',
          // placeholder: '最多输入115个字符',
          // maxlength: 115,
          showWordLimit: false,
          width: 400,
          input: this.remarkChange,
        },
      ]
      return option
    },
    deleteInvoice(index) {
      this.$confirmWarn('是否确认删除？', () => {
        this.invoiceTableList.splice(index, 1)
      })
    },
    validateEmail(rule, value, callback) {
      if (value === '') {
        callback(new Error('请输入邮箱'))
      } else {
        value = value.replace(/，/g, ',')
        let arr = value.split(',')
        arr.forEach((item) => {
          let Email = item
          const emailrule = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,8})$/
          if (!emailrule.test(Email)) {
            callback(new Error('请输入有效邮箱'))
          } else {
            callback()
          }
        })
      }
    },
    validateApply(index) {
      let invoiceTable = this.invoiceTableList[index]
      let itemSum = invoiceTable.data.reduce((sum, curr) => {
        return new LSnum(sum).plus(curr.amt).toNum(2)
      }, BIGZERO)
      let reg2 =
        /\u5f00\u7968\u5e01\u522b\uff1a[A-Z]{3}\uff0c\u5f00\u7968\u91d1\u989d\uff1a\d+\.*\d*\uff0c\u672c\u53d1\u7968\u53ea\u63a5\u53d7\u7f8e\u5143\u4ed8\u6b3e\uff0c\u5f00\u7968\u6c47\u7387\uff1a\d+\.*\d*.*/ // \u3002
      if (this.invoiceApplyForm.invoiceCurrency === 'CNY' && invoiceTable.remark && invoiceTable.remark.match(reg2)) {
        return this.$msgErrClose('发票备注有误，如有疑问，请联系管理员！')
      }
      let applyItemGroupList = invoiceTable.data.map((item) => {
        return {
          ...item,
          itemName: item.itemName,
          unit: item.unit,
          price: item.price,
          count: item.count,
          amt: item.amt,
          taxRate: +item.taxRate,
          itemSum,
          itemSumInvoiceCurrency: invoiceTable.itemSumInvoiceCurrency,
          remark: item.remark,
        }
      })
      if (!applyItemGroupList.length) {
        return this.$msgErrClose('请添加发票服务项！')
      }
      let bool = applyItemGroupList.some((item, index) => {
        if (index > 0) {
          return applyItemGroupList[0].itemName === item.itemName
        }
      })
      if (bool) {
        return this.$msgErrClose('同一张发票中，服务项名称不能重复！')
      }
      if (applyItemGroupList[0].itemSum > this.quota) {
        return this.$msgErrClose('单张发票开票金额不能超出限额！')
      }
      let invoiceSum = this.invoiceTableList.reduce((sum, curr) => {
        let subSum = curr.data.reduce((subSum, subCurr) => {
          return new LSnum(subSum).plus(subCurr.amt).toNum(2)
        }, 0)
        return new LSnum(sum).plus(subSum).toNum(2)
      }, 0)
      console.log('invoiceSum:', invoiceSum)
      console.log('this.invoiceApplyForm.totalInvoiceAmtApplyCNY:', this.invoiceApplyForm.totalInvoiceAmtApplyCNY)
      console.log('result:', this.invoiceApplyForm.totalInvoiceAmtApplyCNY - invoiceSum)
      return applyItemGroupList
    },
    submitApply(CommitStatus) {
      this.$refs.form.validate((res) => {
        if (!res) return
        let { title, taxNo, accountNo, buyerBankInfo, tel, addr } = this.invoiceApplyForm
        if (!(title && taxNo && accountNo && buyerBankInfo && tel && addr)) {
          return this.$msgErrClose('客户信息（发票抬头、纳税人识别号、银行账号、开户行、电话、地址）不完整！', 5000)
        }
        let { saleCompTitle, saleCompTaxNo, saleCompBankNo, saleCompBankName, saleCompTel, saleCompAddr } = this.invoiceApplyForm
        if (!(saleCompTitle && saleCompTaxNo && saleCompBankNo && saleCompBankName && saleCompTel && saleCompAddr)) {
          return this.$msgErrClose('我司信息（发票抬头、纳税人识别号、银行账号、开户行、电话、地址）不完整！', 5000)
        }
        if (CommitStatus === 'preview') {
          this.previewInvoiceAll()
          return
        }
        this.CommitStatus = CommitStatus
        if (!this.dealInvoiceList()) {
          this.sureSave()
        }
      })
    },
    dealInvoiceList(cb) {
      let invoiceReceivableList = []
      try {
        this.invoicePreviewList = []
        this.invoiceTableList.forEach((item, index) => {
          let applyItemGroupList = this.validateApply(index)
          if (!(applyItemGroupList instanceof Array)) {
            throw new Error('ending')
          } else {
            let remark = item.remark
            invoiceReceivableList.push({
              invoiceReceivableId: item.invoiceReceivableId,
              amt: applyItemGroupList[0].itemSumInvoiceCurrency,
              amtCny: applyItemGroupList[0].itemSum,
              invoiceReceivableItemList: [...applyItemGroupList],
              remark,
            })
            this.invoicePreviewList.push({
              remark: item.remark,
              applyItemGroupList,
              totalInvoiceAmtApply: applyItemGroupList[0].itemSum,
            })
          }
        })
      } catch (e) {
        console.log(e)
        if (e.message === 'ending') {
          return true
        }
      }
      cb && cb()
      this.InvoiceReceivableList = invoiceReceivableList
    },
    previewInvoiceAll() {
      this.dealInvoiceList(() => this.previewInvoice(true))
    },
    sureSave() {
      let rateObj = {}
      this.invoiceRates.forEach((item) => (rateObj[item.currency] = item))
      let data = {
        settleCorpCode: this.invoiceApplyForm.settleCorpCode,
        settleCorpName: this.invoiceApplyForm.settleCorpName,
        settleCompCode: this.invoiceApplyForm.settleCompCode,
        settleCompName: this.invoiceApplyForm.settleCompName,
        invoiceType: this.invoiceApplyForm.invoiceType,
        invoiceWay: this.invoiceApplyForm.invoiceWay,
        itemGoupType: this.invoiceApplyForm.itemGoupType,
        currency: this.invoiceApplyForm.invoiceCurrency,
        title: this.invoiceApplyForm.title,
        taxNo: this.invoiceApplyForm.taxNo,
        buyerBankInfo: this.invoiceApplyForm.buyerBankInfo,
        bankName: this.invoiceApplyForm.bankName,
        bankBranchName: this.invoiceApplyForm.bankBranchName,
        accountNo: this.invoiceApplyForm.accountNo,
        addr: this.invoiceApplyForm.addr,
        tel: this.invoiceApplyForm.tel,
        taxpayerNo: this.invoiceApplyForm.saleCompTaxNo, // taxpayerNo
        taxpayerType: this.invoiceApplyForm.taxpayerType,
        saleCompTitle: this.invoiceApplyForm.saleCompTitle,
        saleCompBankName: this.invoiceApplyForm.saleCompBankName,
        saleCompAccountShortName:
          typeof this.invoiceApplyForm.compBank === 'object'
            ? this.invoiceApplyForm.compBank.accountShortName
            : this.invoiceApplyForm.compBank,
        saleCompAccountNo: this.invoiceApplyForm.saleCompBankNo,
        saleCompBankBranchName: this.invoiceApplyForm.saleCompBankBranchName,
        saleCompAddr: this.invoiceApplyForm.saleCompAddr,
        saleCompTel: this.invoiceApplyForm.saleCompTel,
        emailAddrs: this.invoiceApplyForm.emailAddrs.replace(/，/g, ','),
        remark: this.invoiceApplyForm.remark,
        postType: this.invoiceApplyForm.postType,
        postAddr: this.invoiceApplyForm.postAddr,
        postPhone: this.invoiceApplyForm.postPhone,
        commitStatus: 'yes',
        invoiceReceivableList: this.InvoiceReceivableList,
        invoiceRate: this.invoiceCurrencyToCNYRate,
        preInvoice: 'yes',
      }
      Object.assign(data, {
        applySource: 'preInvoice',
        taxRate: this.invoiceTableList[0].data[0].taxRate,
      })
      if (typeof cb === 'function') {
        return cb(data)
      }
      this.btnLoading = true
      invoiceApplySave(data)
        .then((res) => {
          this.dialogVisibleO.show = false
          this.$msgSucClose('提交成功！')
          this.cancel(true)
        })
        .finally(() => (this.btnLoading = false))
    },
    previewInvoice(index) {
      if (index !== true) {
        this.invoicePreviewList.splice(0, 1000)
      }
      this.$refs.form.validate((res) => {
        if (!res) return
        let applyItemGroupList = this.validateApply(index === true ? 0 : index)
        if (!(applyItemGroupList instanceof Array)) return
        let arr2 = ['unitName', 'taxNo', 'accountNo', 'addr', 'bankName', 'tel']
        this.sellerInfo = JSON.parse(JSON.stringify(this.settleCompInfo, arr2))
        let { saleCompBankName, saleCompBankBranchName: saleBranch, bankName = '', bankBranchName = '' } = this.invoiceApplyForm
        this.customerInfo = JSON.parse(JSON.stringify(this.invoiceApplyForm, arr2))
        this.sellerInfo.bankName = `${saleCompBankName}${saleBranch || ''}`
        this.sellerInfo.bankName = saleBranch || ''
        this.customerInfo.bankName = this.invoiceApplyForm.buyerBankInfo
        this.applyItemGroupList = JSON.parse(JSON.stringify(this.invoiceTableList[index === true ? 0 : index].data))
        let { invoiceCurrency } = this.invoiceApplyForm
        let totalInvoiceAmtApply = applyItemGroupList[0].itemSum
        let remark = this.invoiceTableList[index === true ? 0 : index].remark
        this.otherInvoiceInfo = {
          currency: invoiceCurrency,
          totalInvoiceAmtApply,
          taxRate: this.taxRate,
          invoiceNo: null,
          invoiceDate: null,
          receiver: null,
          reviewer: null,
          createdName: null,
          remark,
          // '此发票只接受US付款，币种：，航名航次：，开航日期：2021-03-30，起运港：特尔港，工作单号：S202103290002214，提单号：，开票汇率：USD-USD 1 ，'
        }
        this.dialogVisibleO.show = true
      })
    },
    cancel(refresh, err) {
      if (refresh === 'delete') {
        console.log(err)
        this.delVisitedView()
      }
      this.routerBack(refresh === true)
    },
    handleEdit(row) {
      this.resetItemNameSelectOptions()
      row.taxRate = row.taxRate + ''
      row.edit = true
    },
    handleSave($index, row, option) {
      // console.log(row);
      if (!this.itemNameSelectOptions.find((v) => v.value === row.itemName)) {
        this.itemNameSelectOptions.push({ label: row.itemName, value: row.itemName })
      }
      // this.itemNameSelectOptions)
      row.edit = false
    },
    handleDelete($index, row, option) {
      let index = option.id.replace('option', '') - 2
      let itemCount = this.invoiceTableList[index].data.length
      if (itemCount === 1) {
        return this.$msgErrClose('须至少保留一个服务项！')
      }
      this.$confirmWarn('是否确认删除？', () => {
        this.invoiceTableList[index].data.splice($index, 1)
        this.invoiceTableList[index].data.forEach((item) => {
          item.rowsCount = this.invoiceTableList[index].data.length
        })
      })
    },
    // 客户信息结算单位变动时的回调
    unitNameChange(item) {
      console.log(item)
      if (item.unitName) {
        this.invoiceApplyForm.title = item.unitName
      }
      getSettleUnitInvoiceInfo({ unitCode: item.settleCorpCode || item.value }).then(({ data }) => {
        if (!data) {
          // this.$msgErrClose('结算单位无开票信息!')
          data = {}
        }
        if (data.title) {
          this.isSysInfo = true
          this.invoiceApplyForm.title = data.title
          this.invoiceApplyForm.taxNo = data.taxNo
        } else {
          this.isSysInfo = false
        }
        this.invoiceApplyForm.unitName = this.invoiceApplyForm.settleCorpName = data.unitName
        this.invoiceApplyForm.unitCode = this.invoiceApplyForm.settleCorpCode = data.unitCode
        this.invoiceApplyForm.taxNo = data.taxNo
        this.invoiceApplyForm.bankAccounts = data.bankAccounts
        this.invoiceApplyForm.taxpayerType = data.taxpayerType
        // this.invoiceApplyForm.saleCompAddr = data.postAddr
        // this.invoiceApplyForm.saleCompTel = data.tel
        this.invoiceApplyForm.addr = data.addr
        this.invoiceApplyForm.tel = data.tel
        if (this.accountFilter && this.accountFilter.length) {
          this.invoiceApplyForm.corpBank = this.accountFilter[0].accountNo
          this.corpBankChange(this.accountFilter[0])
        } else {
          this.invoiceApplyForm.corpBank = ''
          this.corpBankChange({})
        }
      })
    },
    // 我司信息分公司变动时的回调
    getCompanyInvoiceInfo(data) {
      // getCompanyInvoiceInfo(data).then((res) => {
      // res.data = res.data || {}
      let res = { data }
      let { specialQuota, ordinaryQuota, electronicQuota, invoiceBankList, electronicSpecialQuota } = res.data
      this.specialQuota = specialQuota || 0
      this.ordinaryQuota = ordinaryQuota || 0
      this.electronicQuota = electronicQuota || 0
      this.electronicSpecialQuota = electronicSpecialQuota || 0
      this.invoiceApplyForm.saleCompTaxNo = res.data.taxNo
      this.invoiceApplyForm.saleCompTitle = res.data.title
      this.invoiceApplyForm.invoiceWay = res.data.invoiceWay || 'manual'
      let list = invoiceBankList
      if (list && list.length > 0) {
        this.backupComBanks = list
        this.invoiceApplyForm.compBanks = [
          ...this.backupComBanks.filter((v) => v.currency == this.invoiceApplyForm.invoiceCurrency),
        ]
        if (this.invoiceApplyForm.compBanks && this.invoiceApplyForm.compBanks[0]) {
          this.invoiceApplyForm.compBank = this.invoiceApplyForm.compBanks[0].accountShortName
          this.compBankChange(this.invoiceApplyForm.compBanks[0])
        }
      } else {
        this.compBankChange({})
        this.$msgErrClose('未有对应币种的我司开户行！')
      }
      this.quota = this[setCamelFormat(this.invoiceApplyForm.invoiceType) + 'Quota']
      // })
    },
    showTipsFn() {
      this.showTips = !this.showTips
    },
  },
  watch: {
    quota: {
      handler(val) {
        if (!val) {
          this.invoiceApplyForm.invoiceType = ''
        }
      },
      immediate: true,
    },
    'invoiceApplyForm.invoiceCurrency': {
      handler(newVal, oldVal) {
        if (!newVal) return
        let invoiceCurrency = newVal
        if (invoiceCurrency && invoiceCurrency !== 'CNY') {
          let dataAcct = { type: 'acct', srcCurrency: invoiceCurrency, toCurrency: 'CNY' }
          getCurrentExchangeRate(dataAcct).then((res) => {
            if (res.code === 0) {
              this.invoiceCurrencyToCNYRate = res.data.rate
              // console.log(this.invoiceCurrencyToCNYRate)
              // if (newVal !== 'CNY') {
              //   this.remarkChange()
              // }
              this.invoiceTableList.forEach((invoiceTable) => {
                let newVal = invoiceTable.data
                if (newVal) {
                  let itemSumInvoiceCurrency = newVal.reduce((sum, curr) => {
                    return new LSnum(sum).plus(new LSnum(curr.amt).div(this.invoiceCurrencyToCNYRate).toNum(2)).toNum(2)
                  }, 0)
                  invoiceTable.remark =
                    `开票币种：${this.invoiceApplyForm.invoiceCurrency}，开票金额：${itemSumInvoiceCurrency}，本发票只接受美元付款，开票汇率：${this.invoiceCurrencyToCNYRate}\u3000` +
                    (invoiceTable.remark && invoiceTable.remark.split('\u3000')[1])
                  invoiceTable.data.forEach((item) => (item.remark = invoiceTable.remark))
                }
              })
            }
          })
        } else {
          this.invoiceCurrencyToCNYRate = 1
          this.invoiceTableList.forEach((invoiceTable) => {
            let newVal = invoiceTable.data
            if (newVal) {
              let arr = invoiceTable.remark.split('\u3000')
              invoiceTable.remark = arr[arr.length - 1]
              invoiceTable.data.forEach((item) => (item.remark = invoiceTable.remark))
            }
          })
        }
        this.invoiceApplyForm.compBanks = this.backupComBanks ? [...this.backupComBanks.filter((v) => v.currency == newVal)] : []
        newVal && this.currencyChange(newVal)
      },
      deep: true,
      immediate: true,
    },
    invoiceTableList: {
      handler(newV, oldV) {
        console.log('table `````````````')
        if (newV && newV.length > 0) {
          let allInvoiceAmtCNY = 0
          let allInvoiceAmtCurrency = 0
          newV.forEach((invoiceTable, index) => {
            let newVal = invoiceTable.data
            if (newVal) {
              newVal.forEach((item) => {
                if (!item.price || !item.count) {
                  item.amt = item.taxAmt = item.amtWithoutTax = ''
                  return
                }
                if (item.price && !isNaN(item.price)) {
                  item.amt = new LSnum(item.count).times(item.price).toNum(2) // .toNum(2)
                  item.itemCurrencyAmt = new LSnum(item.amt).div(this.invoiceCurrencyToCNYRate).toNum(2)
                  if (item.amt && (item.taxRate || item.taxRate === 0)) {
                    item.taxAmt = new LSnum(item.amt).div(new LSnum(item.taxRate).plus(1)).times(item.taxRate).toNum(2)
                    item.amtWithoutTax = new LSnum(item.amt).div(new LSnum(item.taxRate).plus(1)).toNum(2)
                  }
                }
              })
              let itemSum = newVal.reduce((sum, curr) => new LSnum(sum).plus(curr.amt), BIGZERO).toNum(2)
              invoiceTable.itemSum = itemSum
              allInvoiceAmtCNY = new LSnum(allInvoiceAmtCNY).plus(itemSum).toNum(2)
              // 开票币种对应的开票金额
              let itemSumInvoiceCurrency = newVal.reduce((sum, curr) => {
                return new LSnum(sum).plus(new LSnum(curr.amt).div(this.invoiceCurrencyToCNYRate).toNum(2)).toNum(2)
              }, 0)
              invoiceTable.itemSumInvoiceCurrency = itemSumInvoiceCurrency
              allInvoiceAmtCurrency = new LSnum(allInvoiceAmtCurrency).plus(itemSumInvoiceCurrency).toNum(2)
              // 计算发票的remark
              if (this.invoiceApplyForm.invoiceCurrency !== 'CNY') {
                invoiceTable.remark =
                  `开票币种：${this.invoiceApplyForm.invoiceCurrency}，开票金额：${itemSumInvoiceCurrency}，本发票只接受美元付款，开票汇率：${this.invoiceCurrencyToCNYRate}\u3000` +
                  (invoiceTable.remark && invoiceTable.remark.split('\u3000')[1])
              } else if (invoiceTable.remark) {
                let arr = invoiceTable.remark.split('\u3000')
                invoiceTable.remark = arr[arr.length - 1]
              }
              invoiceTable.data.forEach((item) => (item.remark = invoiceTable.remark))
            }
          })

          this.allInvoiceAmtCNY = this.invoiceTableList.reduce((total, curr) => new LSnum(total).plus(curr.itemSum).toNum(2), 0)
        }
      },
      deep: true,
    },
    '$store.state.user.userInfo.settleCompanyCode'(val) {
      this.init()
    },
  },
}
</script>
<style lang="scss" scoped>
.settlement-detail-form ::v-deep .el-form-item__content {
  width: calc(100% - 112px) !important;
  position: relative;
}
.tips-box {
  position: absolute;
  cursor: pointer;
  font-size: 12px;
  color: #999;
  right: -12px;
}
.invoice-recei-apply .finance-container-scroll {
  height: calc(100vh - 98px);
  overflow: auto;
}
.finance-page ::v-deep {
  padding-bottom: 1px;
  .detail__div {
    margin-right: 14px !important;
  }
}
.finance-detail-page {
  margin: 0;
}
.finance-detail-page-background {
  background: #fff;
}
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
}
.el-form-item-text {
  font-size: 12px;
  /* width: 180px; */
}
.settlement-detail-form {
  border-bottom: 1px solid #e9e9e9;
}
.settlement-detail-form:nth-of-type(4) {
  border-bottom: none;
}
.settlement-detail-form .el-form-item-invoice-remark {
  width: 100%;
  display: inline-block;
  // width: calc(100% - 290px); // 因去除了备注设置
}
.settlement-exchange-rates {
  width: 400px;
  display: inline-block;
  margin-right: 24px;
  vertical-align: top;
  position: relative;
}
.settlement-exchange-rates-more {
  position: absolute;
  right: 64px;
  top: 4px;
  .el-button {
    padding-top: 0;
    padding-bottom: 0;
    font-size: 12px;
    color: #3e80f5;
  }
}
.finance-table-container {
  margin: 4px 16px 0;
}
.el-form-item-invoice-remark ::v-deep .el-form-item__content {
  width: calc(100% - 112px);
}
.settlement-exchange-rates {
  /* width: 260px; */
  display: inline-block;
  vertical-align: top;
}
.settlement-exchange-rates ::v-deep .el-form-item__content {
  width: calc(100% - 112px);
  .el-input {
    width: 122px;
  }
}
.finance-invoice-itemgouptype {
  position: relative;
}
.finance-invoice-quota {
  position: absolute;
  left: 0;
  top: -23px;
  width: 191px;
  height: 20px;
  font-size: 12px;
  color: #cd4130;
  line-height: 20px;
}
.all-invoice-amt-cny {
  margin: 4px 16px 13px;
}
</style>