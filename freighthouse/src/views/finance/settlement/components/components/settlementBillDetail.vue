<template>
<div class="finance-bill-detail finance-page"
  v-loading="loading"
  :element-loading-text="eLoadingText"
  :element-loading-spinner="eLoadingSpinner"
  :element-loading-background="eLoadingBackground">
  <el-alert v-if="billChange" type="warning" :closable="false" class="orange">
    <template slot="title">
      <i class="tag-change">改</i>
      <span class="txt">
        账单费用已被修改，请重新生成账单！
      </span>
    </template>
  </el-alert>
  <div class="finance-bill-detail-selectshow">
    <el-form ref="accountForm" :inline="true" size="mini">
      <el-form-item label="显示字段">
        <el-select v-model="showOptions"
          multiple
          class="finance-bill-detail-selectshow-fields"
          placeholder="请选择"
          collapse-tags
          @change="showOptionsChange">
          <el-option label="所属公司" value="settleCompNameShow"></el-option>
          <el-option label="业务员" value="bdEmployeeNameShow"></el-option>
          <el-option label="结算单位" value="settleCorpNameShow"></el-option>
          <el-option label="工作号" value="sourceBizNoShow"></el-option>
          <el-option :label="lang === 'en' ? 'Bill No' : '系统账单编号'" value="billNoShow"></el-option>
          <el-option :label="lang === 'en' ? 'DEBIT NOTE NO' : 'DN号'" value="dnNoShow"></el-option>
          <el-option label="客户委托号" value="customerNoShow"></el-option>
          <el-option label="箱号" value="containerNoShow"></el-option>
          <el-option label="SO NO" value="soNoShow"></el-option>
          <!-- <el-option v-show="lang === 'zh'" label="SO NO" value="soNoShow"></el-option>
          <el-option v-show="lang === 'zh'" label="航线" value="sysLienNameShow"></el-option> -->
          <el-option label="航线" value="sysLienNameShow"></el-option>
          <el-option label="船名航次" value="vesselVoyageShow"></el-option>
          <el-option label="起运港" value="polEnameShow"></el-option>
          <el-option label="目的港" value="podEnameShow"></el-option>
          <el-option label="箱型箱量" value="boxSizeShow"></el-option>
          <el-option label="预计开航日期(ETD)" value="etdShow"></el-option>
          <el-option label="实际开航日期(ATD)" value="atdShow"></el-option>
          <el-option label="预计到港日期" value="etaShow"></el-option>
          <el-option label="实际到港日期" value="ataShow"></el-option>
          <!-- <el-option label="币种" value="currencyShow"></el-option>
          <el-option label="未收" value="reciTotalAmtShow"></el-option>
          <el-option label="未付" value="payTotalAmtShow"></el-option> -->
          <el-option label="HBL" value="hblShow"></el-option>
          <el-option label="MBL" value="mblShow"></el-option>
          <el-option label="签收状态" value="signStatusShow"></el-option>
          <el-option label="签收时间" value="signDateShow"></el-option>
          <el-option :disabled="regAddrDisabled" label="使用我司注册地址" value="regAddrShow"></el-option>
          <el-option :disabled="!regAddrDisabled" label="使用我司办公地址" value="officAddrShow"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="银行账号" prop="settleUnitBankAcctIds">
        <el-select v-model="settleUnitBankAcctIds"
          multiple
          class="finance-bill-detail-selectshow-fields2"
          placeholder="请选择"
          filterable
          collapse-tags
          :popper-append-to-body="false"
          @change="(value) => {companyBankAccountChange(value, true)}">
          <!-- remote
          :remote-method="(queryString) => {companyBillBankAccountList(queryString)}" -->
          <!-- @visible-change="(value) => {if(value) companyBankAccountList('')}" 20220714比照billDetail -->
          <el-option
            v-for="(item, index) in bankAccountSelectOptions3"
            :key="'bankAccountSelectOptions3' + index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span class="finance-bill-switch-lang" v-if="!isDetailPage" @click="switchLang">{{lang === 'en' ? 'switch Chinese' : '切换英文'}}</span>
    <!-- v-if="source !== 'settlementBillList'" -->
  </div>
  <div class="finance-bill-detail-main" id="printBillDetail">
    <div class="finance-bill-detail-ls">
      <img class="finance-bill-detail-logo" src="../../../../../assets/bill_logo.png"/>
      <div class="finance-bill-detail-title">
        <h2>{{longsailTitle}}</h2>
        <span v-show="bankAccountList.length" @click="showTitleDropdownAction" class="bill-title-arrow">
          <i :class="'el-icon-arrow-down'"></i>
        </span>
        <ul v-show="showTitleDropdown" @click="titleDropdownSelect" class="bill-title-dropdown">
          <li class="bill-title-dropdown-item" :class="{selected: longsailTitle === getCompanyName.join(',') || !longsailTitle}">
            <span>{{getCompanyName.join(',')}}</span>
          </li>
          <template v-if="getCompanyName.length > 1">
            <li class="bill-title-dropdown-item" :class="{selected: longsailTitle === item}"
              v-for="(item, index) in getCompanyName" :key="'companyNameMore' + index">
              <span>{{item}}</span>
            </li>
          </template>
          <li class="bill-title-dropdown-item" :class="{selected: longsailTitle === 'LONGSAIL SUPPLY CHAIN CO., LTD.'}">
            <span>LONGSAIL SUPPLY CHAIN CO., LTD.</span>
          </li>
        </ul>
      </div>
      <div>
        <p style="margin-top: 2px;">{{getCompanyAddress.join(',')}}</p>
        <p style="margin-top: 2px;">{{getWebsite}}</p>
      </div>
    </div>
    <div class="finance-bill-detail-h1">
      <h1 v-show="lang === 'en'">{{getBillTitle}}</h1>
    </div>
    <div class="finance-bill-detail-info" style="position:relative;">
      <div class="detail-info-other">
        <div class="detail-info-item" style="margin-bottom:0;width:calc(33% - 14px);">
          <span class="detail-info-item-label" style="width: auto;">{{t('customer')}}：</span>
          <span class="detail-info-item-content">{{lang === 'zh' ? billData.settleCorpCname : billData.settleCorpEname ? billData.settleCorpEname : billData.settleCorpCname}}</span>
        </div>
        <div v-if="billType === 'sum'" class="finance-bill-detail-modeltype" style="position:absolute;right:20px;top:0;">
          <el-tooltip content="币种和金额显示在一起，还是分开显示" placement="top">
            <el-button size="mini" @click="switchModelType">切换模板</el-button>
          </el-tooltip>
        </div>
      </div>
    </div>
    <div class="finance-bill-detail-fee finance-settle-bill-detail-fee">
      <FinanceTable
        :option="option1" />
    </div>
    <div class="finance-bill-detail-totalfee">
      <div class="finance-bill-detail-totalfee-table">
        <div class="finance-bill-detail-totalfee-row">
          <div class="finance-bill-detail-totalfee-column1"></div>
          <div class="finance-bill-detail-totalfee-column2">{{t('receiTotal')}}</div>
          <div class="finance-bill-detail-totalfee-column2">{{t('payTotal')}}</div>
        </div>
        <ul>
          <li class="finance-bill-detail-totalfee-row"
            v-for="(item, index) in totalFeeList"
            :key="'totalFeeList' + index">
            <div class="finance-bill-detail-totalfee-column1">{{item.currency}}</div>
            <div class="finance-bill-detail-totalfee-column2">{{item.receiAmt === 0 ? '' : item.receiAmt}}</div>
            <div class="finance-bill-detail-totalfee-column2">{{item.payAmt === 0 ? '' : item.payAmt}}</div>
          </li>
        </ul>
      </div>
    </div>
    <div class="finance-bill-detail-address">
    </div>
    <div class="finance-bill-detail-attention" v-show="lang === 'zh'">
      <p>注意事项：</p>
      <p>1、此单仅供与贵司核对费用，非付款凭证。如有疑问，请在二个工作日内确认，如无回应的，默认费用已确认。</p>
      <p>2、人民币费用默认开具电子发票, 费用名称默认开代理运费或代理海运费， 如有其他的开票需求请与我司财务说明，发票一经确认开出将不作废发票，否则收取发票作废费CNY100/张。</p>
      <p>3、我司不接受任何个人汇款，付款抬头必须与发票抬头一致。</p>
      <p>4、请汇款至我司以下银行账户，汇款后请及时提供水单，财务联系方式：{{billData.finContactCname}} 邮箱：{{billData.finContactEmail}}。</p>
    </div>
    <div class="finance-bill-detail-attention" v-show="lang === 'en'">
      <p>Attentions:</p>
      <p>1.T/T remitance must be applied when paying to {{bankAccountList.map(item => item.accountEname).join(', ')}}.</p>
      <p>2.If there is any discrepancy,kindly contact our Accounting Dept within 2 days from the date of this invoice otherwise all charges are deemed to be correct</p>
      <p>3.Kindly remit to our bank account: </p>
    </div>
    <div>
      <ul class="finance-bill-bankaccountlist">
        <li v-for="(item, index) in bankAccountListHandle"
          :key="'bankAccountList' + index"
          class="finance-bill-bankaccountlist-item">
          <el-form ref="formBankAccountList" size="mini" :label-width="t('accountFormLabelWidth')">
            <el-form-item :label="t('accountName') + '：'">
              <div>{{lang === 'zh' ? item.accountName : item.accountEname}}</div>
            </el-form-item>
            <!-- <el-form-item :label="t('companyAddress') + '：'">
              <div>{{lang === 'zh' ? item.regAddr : item.regEaddr}}</div>
            </el-form-item> -->
            <el-form-item :label="t('bankName') + '：'">
              <div>{{lang === 'zh' ? item.bankBranch : item.bankBranchEname}}</div>
            </el-form-item>
            <template v-if="item.hasRepeat">
              <el-form-item v-for="(subItem, j) in item.repeatingAccountList" :key="'bankAccountNo' + j" :label="t('accountNo') + '（' + subItem.currency + '）' + '：'">
                <div>{{subItem.accountNo}}</div>
              </el-form-item>
            </template>
            <el-form-item v-else :label="t('accountNo') + '（' + item.currency + '）' + '：'">
              <div>{{item.accountNo}}</div>
            </el-form-item>
            <el-form-item :label="t('bankAddress') + '：'">
              <div>{{lang === 'zh' ? item.bankAddr : item.bankEaddr}}</div>
            </el-form-item>
            <el-form-item :label="'Swift Code：'">
              <div>{{item.swiftCode}}</div>
            </el-form-item>
            <el-form-item :label="'Bank Code：'">
              <div>{{item.bankCodeReal}}</div>
            </el-form-item>
            <el-form-item :label="'Branch Code：'">
              <div>{{item.bankBranchCode}}</div>
            </el-form-item>
          </el-form>
        </li>
      </ul>
    </div>
    <el-dialog
      :title="'邮件发送'"
      :visible.sync="dialogVisible"
      width="1000px"
      class="finance-email-dialog"
      :destroy-on-close="true"
      v-loading="emailLoading"
      element-loading-text="邮件发送中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)">
      <div>
        <el-form :model="form" :rules="rules" ref="form" label-width="80px" size="mini">
          <el-form-item label="收件人" prop="receive">
            <el-input v-model="form.receive" placeholder="请输入收件人邮箱（多个以英文逗号分隔）" show-word-limit maxlength="500">
            </el-input>
          </el-form-item>
          <el-form-item label="抄送人" prop="copyto">
            <el-input v-model="form.copyto" placeholder="请输入抄送人邮箱（多个以英文逗号分隔）" show-word-limit maxlength="500">
            </el-input>
          </el-form-item>
          <el-form-item label="账单格式" prop="docType">
            <el-select placeholder="请选择账单格式" v-model="form.docType" @change="changeDocType">
              <el-option v-for="(item, index) in exportTypeList" :key="'exportTypeList' + index"
                :value="item.value" :label="item.label">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="邮件主题" prop="subject">
            <el-input placeholder="请填写邮件主题" v-model="form.subject" type="textarea" :rows="2" show-word-limit maxlength="500">
            </el-input>
          </el-form-item>
          <el-form-item label="邮件内容" prop="content">
            <el-input placeholder="请填写邮件内容" v-model="form.content" type="textarea" class="finance-email-content" :rows="6" show-word-limit maxlength="500">
            </el-input>
          </el-form-item>
          <el-form-item label="邮件签名" prop="signature">
            <el-input placeholder="请填写邮件签名" v-model="form.signature" show-word-limit maxlength="500">
            </el-input>
          </el-form-item>
          <el-form-item label="附件信息" prop="file">
            <FinanceUploadEmbed :width="'100%'" :bill-file="billFile" :auto-upload="false" @send-file-list="sendFileList">
              <template #billFile="{billFile}">
                <div style="margin-top:5px;height:17px;line-height:17px;">
                  <span style="color:#1890ff;text-decoration:underline;cursor:pointer;" @click.stop="billFile.callback">{{billFile.name}}</span>
                </div>
              </template>
            </FinanceUploadEmbed>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="sendBillEmail">发送</el-button>
        <el-button @click="dialogVisible = false" size="mini">取消</el-button>
      </span>
    </el-dialog>
    <!-- <div class="v-modal" v-if="dialogVisible" style="z-index: 900;"></div> -->
  </div>
  <div class="finance-bill-detail-btns">
    <el-button type="primary" class="finance-btn" @click="confirmSettlementBill" size="mini">确认</el-button>
    <el-button type="primary" class="finance-btn" @click="openBillEmailDialog" size="mini">发送邮件</el-button>
    <el-button class="finance-btn" v-print="printObj" size="mini">打印</el-button>
    <div class="select-template-box">
      <el-dropdown trigger="click" @command="handleExport">
        <span class="el-dropdown-link">
          导出
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="(item, index) in exportTypeList" :key="'exportTypeList' + index"
            :command="item.value">
            {{item.label}}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-button class="finance-btn" @click="cancel" size="mini">返回</el-button>
  </div>
</div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { getBillDetail, print } from '@/api/fin/bill'
import { info, sendBillMail, confirm, changeFeeMode } from '@/api/fin/settleOrderBill'
import { companyBillBankAccountList } from '@/api/fin/settleUnitBankAcct' // 改成当前用户所属分公司的银行账户和深圳分公司的银行账号-20210809
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { billMixin } from '@/views/finance/mixins/billMixin'
import { getValueByKey } from '@/api/base'
import FinanceUploadEmbed from '@/views/finance/components/financeUpload/financeUploadEmbed'
import { dateFormat } from '@/views/finance/utils/finance'

export default {
  mixins: [mixin, billMixin, routerMixin],
  data() {
    return {
      cabinetNo: 0,
      customsNo: 0,
      showOptions: [],
      bankAccount: '',
      billData: {
      },
      option1: {},
      totalFeeList: [],
      exportTypeList: [
        {
          label: 'XLS',
          value: 'XLS'
        },
        {
          label: 'PDF',
          value: 'PDF'
        },
        {
          label: 'DOC',
          value: 'DOC'
        }
      ],
      dialogVisible: false,
      form: {
        receive: '',
        copyto: this.$store.getters.userInfo.email,
        docType: 'PDF',
        subject: '',
        content: '',
        signature: '此邮件由系统发出,请勿直接回复'
      },
      rules: {
        receive: [
          { required: true, message: '邮箱不能为空', trigger: 'blur' },
          {
            validator: this.validateReceive,
            trigger: 'blur'
          }
        ],
        copyto: [
          // { required: true, message: '邮箱不能为空', trigger: 'blur' },
          {
            validator: this.validateReceive,
            trigger: 'blur'
          }
        ],
        docType: [
          { required: true, message: '格式不能为空', trigger: 'blur' }
        ],
        subject: [
          { required: true, message: '主题不能为空', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '内容不能为空', trigger: 'blur' }
        ],
      },
      printObj: {
        id: "printBillDetail",
        popTitle: '对账单',
        extraCss: '',
        // extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>',
        extraHead: '<style media="print">@page {size: landscape !important;margin: 4mm 1mm 4mm 5mm;}table tr td {border-bottom: 1px solid #4A4A4A;}.finance-table .vxe-table--render-default .vxe-table--border-line {border: 1px solid #4A4A4A;}.bill-title-arrow {display: none;}.el-form-item__label{height: 20px !important;line-height:20px !important;}.el-form-item__content{line-height:20px !important;}.finance-bill-detail-modeltype{display:none;}</style>', // .el-table thead.is-group th {text-align: center} // table tr th {border-bottom: 1px solid #4A4A4A;}
        // extraHead: '<style type="text/css" media="print">\n' + '  @page { size: landscape; }\n' + '</style>' // 竖向: portrait
      },
      bankAccountSelectOptions3: [],
      settleUnitBankAcctIds: [],
      accountShortNames: [],
      bankAccountList: [],
      docType: 'PDF',
      lang: 'zh',
      billI18n: {
        zh: {
          companyName: '深圳市长帆国际物流股份有限公司',
          customer: '客户',
          printDate: '打印日期',
          ATTN: 'ATTN',
          createdName: '制单人',
          billNo: '账单号',
          jobNo: '工作号',
          billDate: '账单日期',
          custIntrustNo: '客户委托号',
          SO: 'SO NO', // '订舱号',
          vesselVoyage: '航线', // '船名/航次',
          polPortName: '起运港',
          blNo: '提单号',
          podPortName: '目的港',
          cn: '柜号',
          customsNo: '报关单号',
          address: '深圳市罗湖区深南东路文华大厦西座12F', // 地址：
          email: '', // 邮箱
          total: '合计',
          receiTotal: '收入合计',
          payTotal: '支出合计',
          accountName: '开户名称',
          bankName: '开户行',
          accountNo: '账号',
          bankAddress: '银行地址',
          companyAddress: '公司地址',
          accountFormLabelWidth: '110px'
        },
        en: {
          companyName: 'LONG SAIL INTERNATIONAL LOGISTICS CO.,LTD.',
          customer: 'Customer',
          printDate: 'Print On',
          ATTN: 'ATTN',
          createdName: 'Document Maker',
          billNo: 'Bill No',
          jobNo: 'Job No',
          billDate: 'Bill Date',
          custIntrustNo: 'CustIntrust No',
          SO: 'SO NO',
          vesselVoyage: 'Line', // 'Vessel/Flight',
          polPortName: 'PolPort Name',
          blNo: 'Bl No',
          podPortName: 'PodPort Name',
          cn: 'Container No',
          customsNo: 'Customs No',
          address: '12F, West Block, Wenhua Building, Shennan East Road, Luohu District, Shenzhen', // Address：
          email: '', // email
          total: 'Total',
          receiTotal: 'Total AR.',
          payTotal: 'Total AP.',
          accountName: 'Account Name',
          bankName: 'Bank Name',
          accountNo: 'Account No',
          bankAddress: 'Bank Address',
          companyAddress: 'Company Address',
          accountFormLabelWidth: '140px'
        }
      },
      processLength: 0,
      source: '',
      billDetailParams: {},
      isDetailPage: false,
      cTimestamp: 0,
      emailLoading: false,
      isJumpRouteFromPage: false,
      allShowOptions: ['settleCompNameShow', 'bdEmployeeNameShow', 'settleCorpNameShow', 'sourceBizNoShow', 'billNoShow', 'dnNoShow', 'customerNoShow', 'containerNoShow', 'soNoShow', 'sysLienNameShow', 'vesselVoyageShow', 'polEnameShow', 'podEnameShow', 'boxSizeShow', 'etdShow', 'atdShow', 'etaShow', 'ataShow', 'feeNameShow', 'currencyShow', 'reciTotalAmtShow', 'payTotalAmtShow', 'hblShow', 'mblShow', 'signStatusShow', 'signDateShow', 'regAddrShow', 'officAddrShow'],
      defaultShowOptions: ['settleCompNameShow', 'sourceBizNoShow', 'billNoShow', 'dnNoShow', 'containerNoShow','soNoShow', 'polEnameShow', 'podEnameShow', 'boxSizeShow', 'etdShow', 'atdShow', 'etaShow', 'feeNameShow', 'currencyShow', 'reciTotalAmtShow', 'payTotalAmtShow', 'regAddrShow'], // 'settleCorpNameShow', 'customerNoShow', 现统一都用这个
      // zhDefaultShowOptions: ['settleCompNameShow', 'sourceBizNoShow', 'billNoShow', 'customerNoShow', 'containerNoShow', 'soNoShow', 'polEnameShow', 'podEnameShow', 'boxSizeShow', 'etdShow', 'etaShow', 'currencyShow', 'reciTotalAmtShow', 'payTotalAmtShow'], // 'settleCorpNameShow'
      // enDefaultShowOptions: ['settleCompNameShow', 'sourceBizNoShow', 'billNoShow', 'containerNoShow', 'polEnameShow', 'podEnameShow', 'boxSizeShow', 'etdShow', 'etaShow', 'currencyShow', 'reciTotalAmtShow', 'payTotalAmtShow'], //'settleCorpNameShow'
      longsailTitle: '',
      showTitleDropdown: false,
      bankAccountSelectChange: false,
      bankAccountListHandle: [],
      billChange: false,
      modelType: 'currency_inline', // currency_group
      currencyTitle: [],
      receiveNegativeCurrencySet: [],
      payNegativeCurrencySet: [],
      loading: false,
      defaultBankAccount: [],
      billType: 'sum',
      billFeeType: 'no_writeoff_amt',
      ascColumns: '',
      descColumns: '',
      billFile: {},
      fileList: [],
      isSettleOrderBill: true,
      regAddrDisabled: true,
    }
  },
  created() {
    this.cTimestamp = new Date().getTime()
    this.init()
    this.getData()
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'SettlementBillDetail',
      columns: [], // this.getColumns(),
      data: [],
      tips: {
        text: '',
        show: false
      },
      selection: {
        show: false
      },
      operationBtns: {
        show: false,
        data: []
      },
      showOverflow: false,
      rootTipsHide: true,
      maxHeight: 10000,
      sortable: true,
      sortChange: this.sortChange,
    })
  },
  activated() {
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 500) {
      this.showOptions = []
      this.settleUnitBankAcctIds = []
      this.bankAccountList = []
      this.billChange = false
      this.init()
      this.getData()
    }
  },
  mounted() {
    // document.getElementsByClassName('finance-bill-detail-btns')[0].addEventListener('click', (e) => {
    //   if (e.target.innerHTML === '打印') {
    //     let data = {
    //       billId: this.billId
    //     }
    //     print(data).then(res => {
    //     })
    //   }
    // })
  },
  methods: {
    init() {
      console.log('route.query:', this.$route.query)
      this.source = this.$route.query.source
      let settleOrderBillId = this.$route.query.settleOrderBillId
      if (settleOrderBillId) {
        this.billDetailParams = { settleOrderBillId }
      } else {
        this.billDetailParams = JSON.parse(this.$route.query.billDetailParams)
      }
      if (this.billDetailParams.settleOrderBillId) {
        this.isDetailPage = true
      } else {
        this.isDetailPage = false
        this.lang = this.billDetailParams.lang === 'US' ? 'en' : 'zh'
      }
      this.isConfirmBill = false
      this.notifySettlementDetailApplyStatus(false)
    },
    getData(params = {}) {
      this.loading = true
      let data = {}
      if (this.isDetailPage) {
        data = {
          settleOrderBillId: this.billDetailParams.settleOrderBillId
        }
      } else {
        data = {
          ...this.billDetailParams,
          "settleOrderNo": this.billDetailParams.settleOrderNo,
          "billType": this.billDetailParams.billType,
          "lang": this.lang === 'zh' ? 'CN' : 'US',
          "soureType": this.billDetailParams.soureType,
        }
      }
      info(data).then(res => {
        if (res.code === 0) {
          if (this.isDetailPage) {
            this.billDetailParams = Object.assign(this.billDetailParams, {
              lang: res.data.lang,
              billType: res.data.billType,
              settleOrderNo: res.data.settleOrderNo
            })
            this.lang = this.billDetailParams.lang.toUpperCase() === 'US' ? 'en' : 'zh'
          } else {
            this.billDetailParams = Object.assign(this.billDetailParams, {
              settleOrderBillId: res.data.settleOrderBillId
            })
          }
          this.billData = res.data
          this.billType = res.data.billType
          this.billFeeType = res.data.billFeeType
          this.showOptions = params.isSwitchLang ? this.showOptions : res.data.showHideFiledList.length > 0 ? res.data.showHideFiledList : this.defaultShowOptions // (this.lang === 'zh' ? this.zhDefaultShowOptions : this.enDefaultShowOptions) // this.allShowOptions
          // 兼容历史数据
          if (this.showOptions.length && !this.showOptions.some(item => item === 'regAddrShow' || item ==='officAddrShow')) {
            this.showOptions.push('regAddrShow')
          }
          // 如果使用我司注册地址regAddrShow，regAddrDisabled置为true；否则置为false
          if (this.showOptions.includes('regAddrShow')) {
            this.regAddrDisabled = true
          } else if (this.showOptions.includes('officAddrShow')) {
            this.regAddrDisabled = false
          }
          this.modelType = this.billData.modelType
          this.currencyTitle = this.billData.currencyTitle
          this.receiveNegativeCurrencySet = this.billData.receiveNegativeCurrencySet
          this.payNegativeCurrencySet = this.billData.payNegativeCurrencySet
          this.option1.columns = this.getColumns()
          this.option1.data = this.billData.feeList
          this.processData()
          this.totalFeeList = this.billData.sumFeeList
          getValueByKey('fin_bill_show_default_bank_account').then(res => {
            this.defaultBankAccount = JSON.parse(res.data)
            return this.companyBankAccountListPm('')
          }).then(resIn => {
            if (resIn.code === 0) {
              let bankIdList = res.data.bankIdList
              let changeTitleOrNot = false // 是否改变标题
              if (!bankIdList.length) {
                bankIdList = []
                let hasAccByBaseConfig = false
                let bool = false
                if (this.defaultBankAccount && this.defaultBankAccount.length > 0) {
                  this.bankAccountSelectOptions3.forEach(item => {
                    bool = this.defaultBankAccount.some(acc => {
                      return item.ownerCompanyCode === acc.owner_company_code && item.bankName === acc.bank_name && acc.currency.includes(item.currency)
                    })
                    if (bool) {
                      bankIdList.push(item.settleUnitBankAcctId)
                      hasAccByBaseConfig = true
                      changeTitleOrNot = true 
                    }
                  })
                }
                if (!hasAccByBaseConfig) {
                  this.billData.sumFeeList.forEach(item => {
                    let obj = this.bankAccountSelectOptions3.find(subItem => {
                      return subItem.currency === item.currency && subItem.hasDefault === 'yes'
                    })
                    if (obj) {
                      bankIdList.push(obj.settleUnitBankAcctId)
                      changeTitleOrNot = true 
                    }
                  })
                }
              }
              this.settleUnitBankAcctIds = bankIdList.map(item => {
                return Number(item) // 后台此处返回的字符串
              })
              this.companyBankAccountChange(this.settleUnitBankAcctIds, changeTitleOrNot)
            }
          })
          this.longsailTitle = this.billData.longsailTitle // === '01' ? true : false
          if (res.data.billChange) {
            this.billChange = true
          }
        }
      }).catch(err => {
        console.log(err)
        this.delVisitedView()
        this.cancel()
      }).finally(() => {
        this.loading = false
      })
    },
    processData() {
      this.option1DataBackup = JSON.parse(JSON.stringify(this.option1.data))
      if (this.currencyTitle && this.currencyTitle.length) {
        this.option1.data.forEach(item => {
          this.currencyTitle.forEach(currency => {
            let subItem = item.feeAmtMap[currency]
            let reciAmtProp = 'reciAmt' + currency
            let payAmtProp = 'payAmt' + currency
            if (subItem) {
              let reciAmtValue = subItem.reciAmt
              let payAmtValue = subItem.payAmt
              item[reciAmtProp] = reciAmtValue
              item[payAmtProp] = payAmtValue
              if (this.receiveNegativeCurrencySet.includes(currency)) {
                let positiveReciAmtProp = 'postiveReciAmt' + currency
                let negativeReciAmtProp = 'negativeReciAmt' + currency
                let postiveReciAmtValue = subItem.postiveReciAmt
                let negativeReciAmtValue = subItem.negativeReciAmt
                item[positiveReciAmtProp] = postiveReciAmtValue
                item[negativeReciAmtProp] = negativeReciAmtValue
              }
              if (this.payNegativeCurrencySet.includes(currency)) {
                let positivePayAmtProp = 'postivePayAmt' + currency
                let negativePayAmtProp = 'negativePayAmt' + currency
                let postivePayAmtValue = subItem.postivePayAmt
                let negativePayAmtValue = subItem.negativePayAmt
                item[positivePayAmtProp] = postivePayAmtValue
                item[negativePayAmtProp] = negativePayAmtValue
              }
            } else {
              item[reciAmtProp] = ''
              item[payAmtProp] = ''
            }
          })
        })
      }
    },
    switchModelType() {
      if (this.modelType === 'currency_inline') {
        this.modelType = 'currency_group'
      } else if (this.modelType === 'currency_group') {
        this.modelType = 'currency_inline'
      }
      let data = {
        settleOrderBillId: this.billDetailParams.settleOrderBillId,
        modelType: this.modelType,
        lang: this.lang === 'zh' ? 'CN' : 'US'
      }
      changeFeeMode(data).then(res => {
        if (res.code === 0) {
          this.currencyTitle = res.data.currencyTitle
          this.option1.columns = this.getColumns()
          this.option1.data = res.data.feeList
          this.processData()
        }
      })
    },
    cancel() {
      let refresh = this.isConfirmBill ? true : false
      this.routerBack(refresh)
    },
    confirmSettlementBill() {
      let data = {
        settleOrderBillId: this.billDetailParams.settleOrderBillId
      }
      confirm(data).then(res => {
        if (res.code === 0) {
          this.isConfirmBill = true
          this.notifySettlementDetailApplyStatus(true)
          this.$message({
            type: 'success',
            message: '结算对账单确认成功！',
            showClose: true
          })
        }
      })
    },
    notifySettlementDetailApplyStatus(bool) {
      let find = this.jumpRouteFromToList.find(item => {
        return  item.from.name === 'SettlementDetail' && item.to.name === this.$route.name
      })
      if (find) {
        find.from.query.applySuccess = bool
      }
    },
    handleExport(command) {
      this.$message({
        message: '导出中，请留意下载的区域',
        type: 'warning',
        showClose: true,
        duration: 5000
      })
      this.docType = command
      this.$store.dispatch('finance/downloadBlobFile', {
        uri: '/fin/settleOrderBill/export',
        params: {
          soureType: 'settleOrder',
          billType: this.billType, // this.billDetailParams.billType,
          lang: this.lang === 'zh' ? 'CN' : 'US',
          settleOrderNo: this.billDetailParams.settleOrderNo,
          docType: command,
          settleCompNameShow: this.showOptions.includes('settleCompNameShow') ? '01' : '00',
          bdEmployeeNameShow: this.showOptions.includes('bdEmployeeNameShow') ? '01' : '00',
          settleCorpNameShow: this.showOptions.includes('settleCorpNameShow') ? '01' : '00',
          sourceBizNoShow: this.showOptions.includes('sourceBizNoShow') ? '01' : '00',
          billNoShow: this.showOptions.includes('billNoShow') ? '01' : '00',
          dnNoShow: this.showOptions.includes('dnNoShow') ? '01' : '00',
          customerNoShow: this.showOptions.includes('customerNoShow') ? '01' : '00',
          containerNoShow: this.showOptions.includes('containerNoShow') ? '01' : '00',
          soNoShow: this.showOptions.includes('soNoShow') ? '01' : '00',
          sysLienNameShow: this.showOptions.includes('sysLienNameShow') ? '01' : '00',
          vesselVoyageShow: this.showOptions.includes('vesselVoyageShow') ? '01' : '00',
          polEnameShow: this.showOptions.includes('polEnameShow') ? '01' : '00',
          podEnameShow: this.showOptions.includes('podEnameShow') ? '01' : '00',
          boxSizeShow: this.showOptions.includes('boxSizeShow') ? '01' : '00',
          etdShow: this.showOptions.includes('etdShow') ? '01' : '00',
          atdShow: this.showOptions.includes('atdShow') ? '01' : '00',
          etaShow: this.showOptions.includes('etaShow') ? '01' : '00',
          ataShow: this.showOptions.includes('ataShow') ? '01' : '00',
          currencyShow: '01', // this.showOptions.includes('currencyShow') ? '01' : '00',
          feeNameShow: '01',
          reciTotalAmtShow: '01', // this.showOptions.includes('reciTotalAmtShow') ? '01' : '00',
          payTotalAmtShow: '01', // this.showOptions.includes('payTotalAmtShow') ? '01' : '00',
          hblShow: this.showOptions.includes('hblShow') ? '01' : '00',
          mblShow: this.showOptions.includes('mblShow') ? '01' : '00',
          signStatusShow: this.showOptions.includes('signStatusShow') ? '01' : '00',
          signDateShow: this.showOptions.includes('signDateShow') ? '01' : '00',
          regAddrShow: this.showOptions.includes('regAddrShow') ? '01' : '00',
          officAddrShow: this.showOptions.includes('officAddrShow') ? '01' : '00',
          settleUnitBankAcctIds: this.bankAccountList.map(item => {
            return item.settleUnitBankAcctId
          }).join(','),
          settleOrderBillId: this.billData.settleOrderBillId,
          longsailTitle: this.longsailTitle, // ? '01' : '00',
          modelType: this.modelType,
          ascColumns: this.ascColumns,
          descColumns: this.descColumns,
        }
      }).then(res => {
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(res)
        link.download = '对账单' + this.billDetailParams.settleOrderNo + '.' + command.toLowerCase()
        link.click()
      }).catch(err => {
        console.log(err)
      })
    },
    showOptionsChange(value) {
      this.option1.columns = this.getColumns()
      if (this.regAddrDisabled) {
        if (value.includes('officAddrShow')) {
          let index = this.showOptions.findIndex(item => item === 'regAddrShow')
          this.showOptions.splice(index, 1)
          this.regAddrDisabled = false
        }
      } else {
        if (value.includes('regAddrShow')) {
          let index = this.showOptions.findIndex(item => item === 'officAddrShow')
          this.showOptions.splice(index, 1)
          this.regAddrDisabled = true
        }
      }
    },
    companyBankAccountList(queryString) {
      let data = {
        // "accountName": queryString // 默认查询出自己分公司的账号
      }
      companyBillBankAccountList(data).then(res => {
        if (res.code === 0) {
          this.bankAccountSelectOptions3 = res.data.map(item => {
            item.value = item.settleUnitBankAcctId
            item.label = item.accountShortName
            return item
          })
        }
      })
    },
    companyBankAccountListPm(queryString) {
      let data = {
        // "accountName": queryString // 默认查询出自己分公司的账号
        settleOrderBillId: this.billData.settleOrderBillId
      }
      return new Promise((resolve, reject) => {
        companyBillBankAccountList(data).then(res => {
          if (res.code === 0) {
            this.bankAccountSelectOptions3 = res.data.map(item => {
              item.value = item.settleUnitBankAcctId
              item.label = item.accountShortName
              return item
            })
            resolve(res)
          }
        })
      })
    },
    openBillEmailDialog() {
      let command = this.form.docType
      let callback = (function(command, $this) {
        return function() {
          $this.handleExport(command, $this)
        }
      })(command, this)
      this.billFile = {
        name: '对账单' + this.billDetailParams.settleOrderNo + '.' + command.toLowerCase(),
        callback
      }
      this.dialogVisible = true
    },
    changeDocType(val) {
      this.openBillEmailDialog()
    },
    sendFileList(payload) {
      this.fileList = payload
    },
    sendBillEmail() {
      const form = new FormData()
      this.fileList.forEach(item => {
        form.append('fileList', item)
      })
      let data = {
        settleOrderNo: this.billDetailParams.settleOrderNo,
        soureType: 'settleOrder',
        billType: this.billType, // this.billDetailParams.billType,
        toEmails: this.form.receive,
        ccEmails: this.form.copyto,
        subject: this.form.subject,
        content: this.form.content,
        signature: this.form.signature,
        docType: this.form.docType,
        lang: this.lang === 'zh' ? 'CN' : 'US',
        settleCompNameShow: this.showOptions.includes('settleCompNameShow') ? '01' : '00',
        bdEmployeeNameShow: this.showOptions.includes('bdEmployeeNameShow') ? '01' : '00',
        settleCorpNameShow: this.showOptions.includes('settleCorpNameShow') ? '01' : '00',
        sourceBizNoShow: this.showOptions.includes('sourceBizNoShow') ? '01' : '00',
        billNoShow: this.showOptions.includes('billNoShow') ? '01' : '00',
        dnNoShow: this.showOptions.includes('dnNoShow') ? '01' : '00',
        customerNoShow: this.showOptions.includes('customerNoShow') ? '01' : '00',
        containerNoShow: this.showOptions.includes('containerNoShow') ? '01' : '00',
        soNoShow: this.showOptions.includes('soNoShow') ? '01' : '00',
        sysLienNameShow: this.showOptions.includes('sysLienNameShow') ? '01' : '00',
        vesselVoyageShow: this.showOptions.includes('vesselVoyageShow') ? '01' : '00',
        polEnameShow: this.showOptions.includes('polEnameShow') ? '01' : '00',
        podEnameShow: this.showOptions.includes('podEnameShow') ? '01' : '00',
        boxSizeShow: this.showOptions.includes('boxSizeShow') ? '01' : '00',
        etdShow: this.showOptions.includes('etdShow') ? '01' : '00',
        etaShow: this.showOptions.includes('etaShow') ? '01' : '00',
        atdShow: this.showOptions.includes('atdShow') ? '01' : '00',
        ataShow: this.showOptions.includes('ataShow') ? '01' : '00',
        currencyShow: '01', // this.showOptions.includes('currencyShow') ? '01' : '00',
        feeNameShow: '01',
        reciTotalAmtShow: '01', // this.showOptions.includes('reciTotalAmtShow') ? '01' : '00',
        payTotalAmtShow: '01', // this.showOptions.includes('payTotalAmtShow') ? '01' : '00',
        hblShow: this.showOptions.includes('hblShow') ? '01' : '00',
        mblShow: this.showOptions.includes('mblShow') ? '01' : '00',
        signStatusShow: this.showOptions.includes('signStatusShow') ? '01' : '00',
        signDateShow: this.showOptions.includes('signDateShow') ? '01' : '00',
        regAddrShow: this.showOptions.includes('regAddrShow') ? '01' : '00',
        officAddrShow: this.showOptions.includes('officAddrShow') ? '01' : '00',
        settleUnitBankAcctIds: this.bankAccountList.map(item => {
          return item.settleUnitBankAcctId
        }),
        settleOrderBillId: this.billData.settleOrderBillId,
        longsailTitle: this.longsailTitle, // ? '01' : '00',
        modelType: this.modelType,
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
      }
      form.append('data', JSON.stringify(data))
      form.append('reqTime', dateFormat('yyyy/mm/dd HH:MM:SS', new Date()))
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.emailLoading = true
          this.$store.dispatch('user/import', { uri: '/fin/settleOrderBill/sendBillMail', params: form })
          .then((res) => {
            this.$message({
              type: 'success',
              message: '发送邮件成功!',
              showClose: true
            })
            this.dialogVisible = false
          })
          .finally(() => (this.emailLoading = false))
          // sendBillMail(data).then(res => {
          //   if (res.code === 0) {
          //     this.$message({
          //       type: 'success',
          //       message: '发送邮件成功!',
          //       showClose: true
          //     })
          //     this.dialogVisible = false
          //   } else {
          //     this.$message({
          //       type: 'error',
          //       message: '发送邮件失败!',
          //       showClose: true
          //     })
          //   }
          //   this.emailLoading = false
          // }).catch(err => {
          //   this.emailLoading = false
          // })
        } else {
        }
      })
    },
    validateReceive(rule, value, callback) {
      if (value === '') {
        if (rule.field === 'receive') {
          callback(new Error('请输入邮箱'));
        } else {
          callback()
        }
      } else {
        let arr = value.split(',')
        arr.forEach(item => {
          let Email = item
          const emailrule = /^([a-zA-Z]|[0-9])+\.?(\w|\-|\.)+@([a-zA-Z0-9]|\-)+\.([a-zA-Z]{2,4})$/;
          if (!emailrule.test(Email)) {
            callback(new Error('请输入有效邮箱'));
          } else {
            callback()
          }
        })
      }
    },
    switchLang() {
      this.lang = this.lang === 'en' ? 'zh' : 'en'
      this.option1.columns = this.getColumns()
      this.getData({ isSwitchLang: true })
    },
    t(property) {
      return this.billI18n[this.lang][property]
    },
    getColumns() {
      let labelObj = {
        settleCompNameShow: {en: 'Company', zh: '所属公司'},
        bdEmployeeNameShow: {en: 'Sale', zh: '业务员'},
        settleCorpNameShow: {en: 'Customer Name', zh: '结算单位'},
        sourceBizNoShow: {en: 'Job No', zh: '工作号'},
        billNoShow: {en: 'Bill No', zh: '系统账单编号'},
        dnNoShow: {en: 'DEBIT NOTE NO', zh: 'DN号'},
        customerNoShow: {en: 'Customer No', zh: '客户委托号'},
        containerNoShow: {en: 'Container No', zh: '箱号'},
        soNoShow: {en: 'SO NO', zh: 'SO NO'},
        sysLienNameShow: {en: 'Line', zh: '航线'},
        vesselVoyageShow: {en: 'Vessel Voyage', zh: '船名航次'},
        polEnameShow: {en: 'Load', zh: '起运港'},
        podEnameShow: {en: 'Dest', zh: '目的港'},
        boxSizeShow: {en: 'CNT NO.TYPE', zh: '箱型箱量'},
        etdShow: {en: 'ETD', zh: '预计开航日期'},
        atdShow: {en: 'ATD', zh: '实际开航日期'},
        etaShow: {en: 'ETA', zh: '预计到港日期'},
        ataShow: {en: 'ATA', zh: '实际到港日期'},
        // currencyShow: {en: 'Curr', zh: '币种'},
        // reciTotalAmtShow: {en: 'AR', zh: '未收'},
        // payTotalAmtShow: {en: 'AP', zh: '未付'},
        hblShow: {en: 'HBL', zh: 'HBL'},
        mblShow: {en: 'MBL', zh: 'MBL'},
        signStatusShow: {en: 'Receipt Status', zh: '签收状态'},
        signDateShow: {en: 'Cargo Receipt Date', zh: '签收时间'},
      }
      let columns = []
      // 根据下拉选择显示字段的规则，此处英文如下处理-zhaobin认为不用处理，201211109
      // this.showOptions = this.showOptions.filter(item => {
      //   if (this.lang === 'en') {
      //     if (item === 'customerNoShow' || item === 'soNoShow' || item === 'sysLienNameShow') {
      //       return false
      //     }
      //   }
      //   return true
      // })
      let $this = this
      let showOptions = [...this.showOptions]
      showOptions = showOptions.sort(function(a, b) {
        let index1 = $this.allShowOptions.findIndex(item => {
          return item === a
        })
        let index2 = $this.allShowOptions.findIndex(item => {
          return item === b
        })
        return index1 - index2
      })
      showOptions = showOptions.filter(item => labelObj[item])
      columns = showOptions.map(item => {
        let itemNew = item.replace(/Show/, '')
        let width = ''
        let minWidth = 70
        if (itemNew === 'settleCompName') {
          width = 100
        } else if (itemNew === 'settleCorpName') {
          width = 105
        } else if (itemNew === 'billNo') {
          width = 103
        } else if (itemNew === 'dnNo') {
          width = 103
        } else if (itemNew === 'customerNo') {
          width = 100
        } else if (itemNew === 'vesselVoyage') {
          width = 100
        } else if (itemNew === 'boxSize') {
          width = 100
        } else if (itemNew === 'signStatus') {
          width = 100
        } else if (itemNew === 'signDate') {
          width = 125
        } else if (itemNew === 'etd' || itemNew === 'eta' || itemNew === 'atd' || itemNew === 'ata') {
          minWidth = 105
        }
        if (itemNew === 'containerNo' || itemNew === 'bdEmployeeName') {
          minWidth = 85
        }
        let sortable = false
        if (itemNew === 'etd' || itemNew === 'eta' || itemNew === 'atd') { // 暂不加ata
          sortable = true
        }
        return {
          prop: itemNew,
          label: labelObj[item][this.lang],
          type: 'text',
          width,
          minWidth,
          sortable,
        }
      })
      if (this.billType === 'detail') {
        let feeNamePropObj = {en: 'feeEnName', zh: 'feeName'}
        let feeNameLabelObj = {en: 'Expense Item', zh: '费用名称'}
        columns.push({
          prop: feeNamePropObj[this.lang],
          label: feeNameLabelObj[this.lang],
          type: 'text',
          minWidth: 80,
          sortable: false,
        })
      }
      let reciAmtLabelObj = {
        "settle_amt": '应收结算金额',
        "no_writeoff_amt": '未收',
        "fee_amt": '应收',
        "settle_amt_1": '应收',
        "settle_amt_2": '结算金额'
      }
      let payAmtLabelObj = {
        "settle_amt": '应付结算金额',
        "no_writeoff_amt": '未付',
        "fee_amt": '应付',
        "settle_amt_1": '应付',
        "settle_amt_2": '结算金额'
      }
      let pOrNLabelObj = {
        "positive": '正数',
        "negative": '负数',
      }
      // let reciAmtWithNegLabelObj = {
      //   "positive": '应收正数结算金额',
      //   "negative": '应收负数结算金额',
      // }
      // let payAmtWithNegLabelObj = {
      //   "positive": '应付正数结算金额',
      //   "negative": '应付负数结算金额',
      // }
      if (this.currencyTitle && this.currencyTitle.length) { // currencyTitle 有值表示使用币种和金额显示在一起的表头，值为币种的数组
        this.currencyTitle.forEach(currency => {
          if (!this.receiveNegativeCurrencySet.includes(currency)) {
            let reciAmtProp = 'reciAmt' + currency
            let reciAmtLabel = {en: 'AR ' + currency, zh: reciAmtLabelObj[this.billFeeType] + currency} // zh: '未收' + currency
            columns.push({
              prop: reciAmtProp,
              label: reciAmtLabel[this.lang],
              type: 'text',
              minWidth: 70, // 70
              sortable: false,
            })
            // let reciAmtProp = 'reciAmt' + currency
            // let reciAmtLabel = {en: 'AR ' + currency, zh: reciAmtLabelObj[this.billFeeType] + currency} // zh: '未收' + currency
            // columns.push({
            //   prop: reciAmtProp,
            //   label: reciAmtLabel[this.lang],
            //   type: 'text',
            //   minWidth: 70,
            //   sortable: false,
            // })
          } else {
            let positiveReciAmtProp = 'postiveReciAmt' + currency
            let zh = this.billFeeType === 'settle_amt' ? reciAmtLabelObj[this.billFeeType + '_1'] + pOrNLabelObj['positive'] + reciAmtLabelObj[this.billFeeType + '_2'] : reciAmtLabelObj[this.billFeeType] + pOrNLabelObj['positive']
            let positiveReciAmtLabel = {en: 'AR.P ' + currency, zh: zh + currency} // zh: '未收' + currency
            columns.push({
              prop: positiveReciAmtProp,
              label: positiveReciAmtLabel[this.lang],
              type: 'text',
              minWidth: 80,
              sortable: false,
            })
            let negativeReciAmtProp = 'negativeReciAmt' + currency
            zh = this.billFeeType === 'settle_amt' ? reciAmtLabelObj[this.billFeeType + '_1'] + pOrNLabelObj['negative'] + reciAmtLabelObj[this.billFeeType + '_2'] : reciAmtLabelObj[this.billFeeType] + pOrNLabelObj['negative']
            let negativeReciAmtLabel = {en: 'AR.N ' + currency, zh: zh + currency} // zh: '未收' + currency
            columns.push({
              prop: negativeReciAmtProp,
              label: negativeReciAmtLabel[this.lang],
              type: 'text',
              minWidth: 80,
              sortable: false,
            })
          }
          if (!this.payNegativeCurrencySet.includes(currency)) {
            let payAmtProp = 'payAmt' + currency
            let payAmtLabel = {en: 'AP ' + currency, zh: payAmtLabelObj[this.billFeeType] + currency} // zh: '未付' + currency
            columns.push({
              prop: payAmtProp,
              label: payAmtLabel[this.lang],
              type: 'text',
              minWidth: 70, // 70
              sortable: false,
            })
          } else {
            let positivePayAmtProp = 'postivePayAmt' + currency
            let zh = this.billFeeType === 'settle_amt' ? payAmtLabelObj[this.billFeeType + '_1'] + pOrNLabelObj['positive'] + payAmtLabelObj[this.billFeeType + '_2'] : payAmtLabelObj[this.billFeeType] + pOrNLabelObj['positive']
            let positivePayAmtLabel = {en: 'AP.P ' + currency, zh: zh + currency} // zh: '未收' + currency
            columns.push({
              prop: positivePayAmtProp,
              label: positivePayAmtLabel[this.lang],
              type: 'text',
              minWidth: 80,
              sortable: false,
            })
            let negativePayAmtProp = 'negativePayAmt' + currency
            zh = this.billFeeType === 'settle_amt' ? payAmtLabelObj[this.billFeeType + '_1'] + pOrNLabelObj['negative'] + payAmtLabelObj[this.billFeeType + '_2'] : payAmtLabelObj[this.billFeeType] + pOrNLabelObj['negative']
            let negativePayAmtLabel = {en: 'AP.N ' + currency, zh: zh + currency} // zh: '未收' + currency
            columns.push({
              prop: negativePayAmtProp,
              label: negativePayAmtLabel[this.lang],
              type: 'text',
              minWidth: 80,
              sortable: false,
            })
          }
          // let reciAmtProp = 'reciAmt' + currency
          // let reciAmtLabel = {en: 'AR ' + currency, zh: reciAmtLabelObj[this.billFeeType] + currency} // zh: '未收' + currency
          // let payAmtProp = 'payAmt' + currency
          // let payAmtLabel = {en: 'AP ' + currency, zh: payAmtLabelObj[this.billFeeType] + currency} // zh: '未付' + currency
          // columns.push({
          //   prop: reciAmtProp,
          //   label: reciAmtLabel[this.lang],
          //   type: 'text',
          //   minWidth: 70,
          //   sortable: false,
          // })
          // columns.push({
          //   prop: payAmtProp,
          //   label: payAmtLabel[this.lang],
          //   type: 'text',
          //   minWidth: 70,
          //   sortable: false,
          // })
        })
      } else {
        let objList = [
          {prop: 'currency', en: 'Curr', zh: '币种'},
          {prop: 'reciTotalAmt', en: 'AR', zh: reciAmtLabelObj[this.billFeeType]}, // zh: '未收'
          {prop: 'payTotalAmt', en: 'AP', zh: payAmtLabelObj[this.billFeeType]} // zh: '未付'
        ]
        objList.forEach(obj => {
          columns.push({
            prop: obj.prop,
            label: obj[this.lang],
            type: 'text',
            minWidth: 70,
            sortable: false,
          })
        })
        
      }
      return columns
    }
  },
  computed: {
    getBillTitle() {
      if (this.lang === 'zh') {
        if (this.billType === 'detail') { // this.billDetailParams.billType
          return '明细对账单'
        } else {
          return '汇总对账单'
        }
      } else {
        if (this.billType === 'detail') { // this.billDetailParams.billType
          // return 'DETAIL DEBIT NOTE'
          return 'STATEMENT OF ACCOUNT'
        } else {
          // return 'SUM DEBIT NOTE'
          return 'STATEMENT OF ACCOUNT'
        }
      }
    },
    getCompanyName() {
      let companyNameList = []
      if (this.lang === 'zh') {
        companyNameList = this.bankAccountList.map(item => {
          return item.accountName
        })
        companyNameList = [... new Set(companyNameList)]
        if (companyNameList.length === 0) {
          // companyNameList = ['深圳市长帆国际物流股份有限公司']
        }
      } else if (this.lang === 'en') {
        companyNameList = this.bankAccountList.map(item => {
          return item.accountEname
        })
        companyNameList = [... new Set(companyNameList)]
        if (companyNameList.length === 0) {
          // companyNameList = ['LONG SAIL INTERNATIONAL LOGISTICS CO.,LTD.']
        }
      }
      if (this.bankAccountSelectChange) {
        this.longsailTitle = companyNameList.join(',')
      }
      return companyNameList
    },
    getCompanyAddress() {
      let companyAddressList = []
      if (this.lang === 'zh') {
        companyAddressList = this.bankAccountList.map(item => {
          return this.regAddrDisabled ? item.regAddr : item.officAddr
        })
        companyAddressList = [... new Set(companyAddressList)]
        if (companyAddressList.length === 0) {
          // companyAddressList = ['深圳市罗湖区深南东路文华大厦西座12F']
        }
      } else if (this.lang === 'en') {
        companyAddressList = this.bankAccountList.map(item => {
          return this.regAddrDisabled ? item.regEaddr : item.officEaddr
        })
        companyAddressList = [... new Set(companyAddressList)]
        if (companyAddressList.length === 0) {
          // companyAddressList = ['12F, West Block, Wenhua Building, Shennan East Road, Luohu District, Shenzhen']
        }
      }
      return companyAddressList
    },
    getWebsite() {
      // if (!this.bankAccountList.length) {
      //   return ''
      // } else {
        return 'http://www.longsailing.net'
      // }
    },
    getBankName() {
      let bankNameList = []
      if (this.lang === 'zh') {
        bankNameList = this.bankAccountList.map(item => {
          return item.bankName
        })
        bankNameList = [... new Set(bankNameList)]
      } else if (this.lang === 'en') {
        bankNameList = this.bankAccountList.map(item => {
          return item.bankEname
        })
        bankNameList = [... new Set(bankNameList)]
      }
      return bankNameList
    },
  },
  watch: {
    lang: {
      handler(newVal, oldVal) {
        this.option1.columns = this.getColumns()
      },
      immediate: true
    },
    dialogVisible(newVal) {
      if (newVal) {
        this.$refs.form && this.$refs.form.resetFields()
        this.$refs.form && this.$refs.form.clearValidate()
        this.form = Object.assign(this.form, {
          receive: '',
          subject: '',
          content: ''
        })
        this.fileList = []
      }
    },
  },
  components: {
    FinanceTable,
    FinanceUploadEmbed
  }
}
</script>
<style lang="scss">
@import '~@/views/finance/style/bill.scss';
</style>
<style scoped>
.detail-info-other{
  margin-bottom: 14px;
}
/* .detail-info-item:nth-of-type(2n){
  margin-left: calc(100% - 262px * 2);
} */
.finance-settle-bill-detail-fee .finance-el-table{
  padding-left: 0;
  padding-right: 0;
}
.finance-bill-detail-totalfee{
  padding: 8px 0 8px;
  line-height: 20px;
  display: flex;
  justify-content:flex-end;
  color: #4A4A4A;
}
.finance-bill-detail-totalfee-table{
  width: 300px;
}
.finance-bill-detail-totalfee-row{
  display: flex;
  border-bottom: 1px solid #4A4A4A;
}
.finance-bill-detail-totalfee-table>.finance-bill-detail-totalfee-row:last-of-type{
  border-bottom: none;
}
.finance-bill-detail-totalfee-column1{
  width: 60px;
}
.finance-bill-detail-totalfee-column2{
  width: 120px;
}
.finance-bill-detail-totalfee span{
  margin-right: 12px;
}
</style>
