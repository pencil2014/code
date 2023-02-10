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
          <div class="money-title">应收开票申请</div>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button @click="submitApply('preview')" size="mini">预览发票</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              @click="addInvoice(true, true)"
              size="mini"
              type="primary"
            >新增发票</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              @click="submitApply('yes')"
              type="success"
              size="mini"
              :disabled="saveDisabled"
              :loading="btnLoading"
            >保存并提交</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              type="primary"
              @click="submitApply('no')"
              size="mini"
              :disabled="saveDisabled"
              :loading="btnLoading1"
            >保存</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" @click="cancel" size="mini">取消</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    <div class="finance-container-scroll">
      <el-form
        :model="applyForm"
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
                v-model="applyForm.invoiceType"
                placeholder="请选择"
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
              <el-select
                v-model="applyForm.invoiceCurrency"
                placeholder="请选择"
                @change="changeCurrency"
              >
                <el-option
                  v-for="(op, j) in settleCurrencyList"
                  :key="'invoiceCurrency' + j"
                  :label="op.label"
                  :value="op.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="开票金额：" prop="totalInvoiceAmtApply">
              <el-input
                v-model="applyForm.totalInvoiceAmtApply"
                placeholder="输入"
                @input="currencyAmtInput"
                v-lsNumber="{value:'number', obj:applyForm, key:'totalInvoiceAmtApply'}"
              />
            </el-form-item>
            <DetailDiv labelWidth="112" label="最大可开票金额：" color="red" :isSlot="true">
              <span>
                {{applyForm.invoiceBalance}}
                <el-tooltip
                  content="最大可开票金额为所选开票费用轧差（应收负数和应付正数对抵 如应付100，合计到的开票金额为-100）后可开票金额合计：单项费用可开票金额=（原币结算金额+补开票金额-坏账金额-已开票申请金额）*结算汇率"
                  placement="top"
                  effect="dark"
                >
                  <i style="cursor:pointer;color: #999;" class="el-icon-question"></i>
                </el-tooltip>
              </span>
            </DetailDiv>
            <el-form-item label="开票方式：" prop="invoiceWay">
              <el-select v-model="applyForm.invoiceWay" placeholder="请选择">
                <el-option
                  v-for="(op, j) in dictMap['invoiceWay']"
                  :key="'invoiceWay' + j"
                  :label="op.label"
                  :value="op.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item class="finance-invoice-itemgouptype" label="发票明细类型：" prop="itemGoupType">
              <el-select
                v-model="applyForm.itemGoupType"
                placeholder="请选择"
                @change="invoiceItemGroupTypeChange"
              >
                <el-option
                  v-for="(op, j) in dictMap['invoiceItemGroupType']"
                  :key="'invoiceItemGroupType' + j"
                  :label="op.label"
                  :value="op.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <DetailDiv labelWidth="112" label="单张发票限额：" :content="' '+quota+'CNY'" color="red" />
          </div>
        </div>
        <div class="settlement-detail-form">
          <h3>客户信息</h3>
          <div>
            <DetailDiv
              labelWidth="112"
              label="结算单位："
              :content="applyForm.unitName"
              :isTooltip="true"
            />
            <el-form-item label="客户发票抬头：" prop="title">
              <el-input disabled type="text" v-model="applyForm.title" placeholder="请输入" clearable></el-input>
            </el-form-item>
            <el-form-item label="纳税人识别号：" prop="taxNo">
              <el-input
                :disabled="isSysInfo || isCannotChange"
                type="text"
                v-model="applyForm.taxNo"
                placeholder="请输入"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item v-if="!isCannotChange" label="纳税人类型：" prop="taxpayerType">
              <el-select v-model="applyForm.taxpayerType" placeholder="请选择">
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
                v-model="applyForm.accountNo"
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
                v-model="applyForm.accountNo"
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
                v-model="applyForm.bankName"
                :maxlength="128"
                placeholder="请输入"
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
                v-model="applyForm.bankBranchName"
                :maxlength="200"
                placeholder="请输入"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item label="发票展示开户行：" prop="buyerBankInfo">
              <el-input
                :disabled="isCannotChange"
                type="text"
                v-model="applyForm.buyerBankInfo"
                placeholder="请输入"
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
                v-model="applyForm.tel"
                placeholder="请输入"
                clearable
              ></el-input>
            </el-form-item>
            <el-form-item label="客户地址：" prop="addr" class="el-form-item-invoice-remark">
              <el-input
                :disabled="isCannotChange"
                type="textarea"
                v-model="applyForm.addr"
                placeholder="请输入"
                clearable
                autosize
              ></el-input>
            </el-form-item>
            <el-form-item label="客户邮箱：" prop="emailAddrs" class="el-form-item-invoice-remark">
              <el-input
                type="textarea"
                v-model="applyForm.emailAddrs"
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
              label="所属分公司："
              :content="applyForm.settleCompName"
              :isTooltip="true"
            />
            <el-form-item label="银行简称：" prop="compBank">
              <el-select
                v-model="applyForm.compBank"
                value-key="accountShortName"
                placeholder="请选择"
                @change="compBankChange"
              >
                <el-option
                  v-for="(op, j) in applyForm.compBanks || []"
                  :key="j"
                  :label="op.accountShortName"
                  :value="op"
                ></el-option>
              </el-select>
            </el-form-item>
            <DetailDiv
              labelWidth="112"
              label="发票抬头："
              :content="applyForm.saleCompTitle"
              :isTooltip="true"
            />
            <DetailDiv labelWidth="112" label="纳税人识别号：" :content="applyForm.saleCompTaxNo" />
            <DetailDiv
              labelWidth="112"
              label="我司开户行："
              :content="applyForm.saleCompBankBranchName||''"
              :isTooltip="true"
            />
            <DetailDiv labelWidth="112" label="银行账号：" :content="applyForm.saleCompBankNo" />
            <DetailDiv labelWidth="112" label="电话：" :content="applyForm.saleCompTel" />
            <DetailDiv
              labelWidth="112"
              label="地址："
              :content="applyForm.saleCompAddr"
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
            <div class="money-title">发票{{index + 1}}-发票服务项</div>
            <div class="money-total">
              开票金额合计：
              <span v-html="'CNY' + item.itemSum"></span>
              （记账汇率：{{applyForm.invoiceCurrency + '-CNY ' + invoiceCurrencyToCNYRate}}）
            </div>
          </div>
          <div class="money-box-right">
            <div class="invoice-recei-apply-remark">
              <p>备注设置</p>
              <el-select
                style="width: 180px"
                v-model="item.remarksSetting"
                placeholder="请选择"
                multiple
                collapse-tags
                @change="remarksChange(index)"
              >
                <el-option
                  v-for="(op, j) in item.remarksOptions"
                  :key="'remarksOptions' + index + j"
                  :label="op.label"
                  :value="op.value"
                ></el-option>
              </el-select>
            </div>
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
        <FinanceTableMass :option="item" v-show="showTable2" />
      </div>
      <div class="all-invoice-amt-cny">
        <div class="money-box">
          <div class="money-box-left">
            <div class="money-total">
              全部发票合计：
              <span v-html="'CNY' + allInvoiceAmtCNY"></span>
            </div>
          </div>
        </div>
      </div>
      <div class="finance-table-container">
        <div class="money-box">
          <div class="money-box-left">
            <div class="money-title">应收费用列表</div>
            <div class="money-total">
              原费共计：
              <span v-html="totalAmount"></span>
              <i style="margin-left:20px;"></i>开票共计：
              <span v-html="`${applyForm.invoiceCurrency} ${totalInvoiceAmtApply}`"></span>
            </div>
            <div
              v-if="applyForm.invoiceCurrency !== 'CNY'"
              class="money-total"
            >折合开票：CNY {{totalInvoiceAmtApplyCNY}}</div>
            <div class="money-total" style="padding-left: 10px;">
              最大可开票金额：{{applyForm.invoiceBalance}}
              <el-tooltip
                content="最大可开票金额为所选开票费用轧差（应收负数和应付正数对抵 如应付100，合计到的开票金额为-100）后可开票金额合计：单项费用可开票金额=（原币结算金额+补开票金额-坏账金额-已开票申请金额）*结算汇率"
                placement="top"
                effect="dark"
              >
                <i style="cursor:pointer;color: #999;" class="el-icon-question"></i>
              </el-tooltip>
            </div>
          </div>
          <div class="money-box-right">
            <el-button
              style="margin-left: 6px; "
              class="finance-btn"
              @click="feeSearchToggle = !feeSearchToggle"
              size="mini"
              type="primary"
            >{{feeSearchToggle?'隐藏': '显示'}}搜索条件</el-button>
            <el-button
              type="text"
              class="finance-btn collapse-btn"
              @click="handleCollapse('Table1')"
              size="mini"
            >
              收起
              <i :class="[`el-icon-arrow-${showTable1 ? 'up' : 'down'}`]"></i>
            </el-button>
          </div>
        </div>
        <DetailFeeSearch
          v-show="feeSearchToggle"
          ref="detailFeeSearch"
          :list="option1.data"
          @search="search"
        />
        <FinanceTableMass :option="option1" v-show="showTable1" />
      </div>
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        @close="customColumnsPopClose"
      />
    </div>
    <InovicePreviewPrint
      :dialog-visible-o="dialogVisibleO"
      :customer-info="customerInfo"
      :seller-info="sellerInfo"
      :apply-item-group-list="applyItemGroupList"
      :other-invoice-info="otherInvoiceInfo"
      @print-invoice="sureSave"
      :list="invoicePreviewList"
      :isElec="applyForm.invoiceType"
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
import DetailFeeSearch from '@/views/finance/components/financeSearch/detailFeeSearch'
import InovicePreviewPrint from './invoicePreviewPrint'
import CustomColumns from '@/components/customColumns'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { printMixin } from './mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { getSettleUnitInvoiceInfo, invoiceApplySave } from '@/api/fin/invoiceReceivableApply'
// settleOrderFeeList,
import { info } from '@/api/fin/invoiceReceivableApply'
import { settleOrderInvoiceFeeList } from '@/api/fin/settleOrder'
import { invoiceReceivableApply } from '@/api/fin/writeoffRecv'
// import { listCompanyInvoiceBank } from '@/api/fin/company'
import { getCurrentExchangeRate, listColumnConfigGet, listColumnConfigSave } from '@/api/base'
import { bankList } from '@/api/crm/common'
import { setCamelFormat } from '@/utils/index'
const COMMON = { unit: 'bill', count: 1, edit: false, remark: '', remarkOldVal: '' }
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
    let remarksOptions = [
      { label: '工作单号', value: 'orderNo' },
      { label: '开航日期', value: 'tdTime' },
      // { label: '起运港', value: 'polPortName' },
      // { label: '目的港', value: 'podPortName' },
      // { label: '航名航次', value: 'vesselVoyage' },
      { label: '提单号', value: 'bl' },
      { label: '大船起运港', value: 'polPortName' },
      { label: '大船目的港', value: 'podPortName' },
      { label: '大船船名航次', value: 'vesselVoyage' },
      { label: '驳船起运港', value: 'bargePolPortName' },
      // { label: '驳船目的港', value: 'bargePodPortName' },
      { label: '驳船船名航次', value: 'bargeVesselVoyage' },
    ]
    if (this.$route.name == 'InvoicePrerevApply') {
      remarksOptions = [
        { label: '开票金额', value: 'amt' }, // 不显示开票金额
        { label: '币种', value: 'currency' },
        { label: '开票汇率', value: 'rate' },
      ]
    }
    console.log(this.$route.name)
    return {
      feeSearchToggle: true, //费用搜索默认显示
      showTips: false,
      isCannotChange: false, // 抬头、识别号、开户行、电话、地址   纳税人类型、支行、发票开户行
      isSysInfo: false, // 客户发票抬头、纳税人识别号，如果系统已维护则禁止修改
      invoicePreviewList: [],
      showCorpInfo: false,
      loading: false,
      billId: '',
      option1: {}, // 费用列表
      option2: {}, // 发票服务项列表
      moneyTitle1: '应收费用列表',
      moneyTitle2: '发票服务项',
      multipleSelection1: [],
      applyForm: {
        invoiceType: 'electronic', // ordinary
        invoiceCurrency: '', // USD
        invoiceWay: 'manual',
        itemGoupType: 'merge', // merge
        totalInvoiceAmtApply: '',
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
        draftCurrencyChangeCount: 0,
        settleCompInfoObj: {},
        buyerBankInfo: '',
        taxpayerType: '',
      },
      rules: {
        // invoiceType: [{ required: true, message: '开票类型不能为空', trigger: 'blur' }],
        // invoiceCurrency: [{ required: true, message: '开票币种不能为空', trigger: 'blur' }],
        // itemGoupType: [{ required: true, message: '发票明细类型不能为空', trigger: 'blur' }],
        // emailAddrs: [{ required: true, message: '收件邮箱不能为空', trigger: 'blur' }],
        // latestDate: [{ required: true, message: '最晚开票时间不能为空', trigger: 'blur' }],
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
      // settleOrderFeeIds: [], // 删除的结算单费用明细IDs
      totalAmount: '',
      showTable1: true,
      showTable2: true,
      taxRate: '',
      dialogVisibleO: { show: false },
      customerInfo: {},
      sellerInfo: {},
      applyItemGroupList: [],
      otherInvoiceInfo: {},
      exchageRateList: [], // 接口返回的当日结算汇率列表
      invoiceRates: [],
      // 路由参数
      settleOrderId: 0,
      writeoffReceipayId: 0,
      invoiceReceivableApplyId: '',
      source: '',
      settleOrderFeeIds: [], // 结算单详情勾选的费用
      settleCurrencyList: [
        { label: 'USD', value: 'USD' },
        { label: 'CNY', value: 'CNY' },
      ],
      remarksOptions,
      remarksSetting: [],
      remarksObj: {
        orderNo: '',
        tdTime: '',
        polPortName: '',
        podPortName: '',
        vesselVoyage: '',
        bl: '',
        bargePolPortName: '',
        // bargePodPortName: '',
        bargeVesselVoyage: '',
        // amt: '',
        // currency: '',
        // rate: ''
      },
      remarks: '',
      invoiceTableList: [],
      specialQuota: -1,
      ordinaryQuota: -1,
      electronicQuota: -1,
      quota: -1,
      option_rate: {},
      moreRateDialogVisible: false,
      invoiceReceivableApplyId: '',
      invoiceCurrencyToCNYRate: '',
      itemNameList: [],
      itemNameSelectOptions: [],
      saveDisabled: false,
      allInvoiceAmtCNY: 0,
      unitNameList: { remoteSelectList: [] }, //预收款开票申请结算单位下拉列表
      CommitStatus: '',
      // 自定义表头弹框
      customColumnsPopShow: false,
      selfColumnsBase: [],
      autocomplete1: {},
      autocomplete2: {},
      vm: this,
    }
  },
  components: {
    FinanceTableMass,
    InovicePreviewPrint,
    CustomColumns,
    DetailFeeSearch,
  },
  computed: {
    // 费用列表开票金额的合计
    totalInvoiceAmtApply() {
      return this.option1.data.reduce((total, cur) => {
        return new LSnum(total).plus(new LSnum(cur.invoiceAmtApply).times(cur.rate || 1)).toNum(2)
      }, 0)
    },
    // 费用列表折合开票合计 CNY
    totalInvoiceAmtApplyCNY() {
      return new LSnum(this.totalInvoiceAmtApply).times(this.invoiceCurrencyToCNYRate).toNum(2)
    },
    accountFilter() {
      if (this.applyForm.bankAccounts && this.applyForm.bankAccounts.length) {
        return this.applyForm.bankAccounts.filter((v) => v.currency == this.applyForm.invoiceCurrency)
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
        this.applyForm.accountNo = optionItem.accountNo
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
    // 应用费用列表
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      $name: 'InvoiceReceivableApply1',
      data: [],
      tips: false,
      operationBtns: false,
      selection: false,
      edit: true,
      customColumns: {
        show: true,
        handleCustomColumns: () => (this.customColumnsPopShow = true),
      },
      colorColumns: ['receipayType'],
      sortable: true,
      sortChange: this.sortChange,
    })
    this.selfColumnsBase = [
      {
        prop: 'orderNo',
        label: '单号',
        type: 'button',
        minWidth: 130,
        formatter: ({ row }) => row.orderNo || row.sourceBizNo,
        operationBtns: {
          show: true,
          callback: (action, index, row, option) => {
            this.showOneNoDetail(row.sourceType, row.orderNo || row.sourceBizNo)
          },
        },
      },
      { prop: 'settleCompName', label: '分公司', type: 'text', minWidth: 150 },
      { prop: 'settleCorpName', label: '结算单位', type: 'text', minWidth: 150 },
      { prop: 'custName', label: '委托单位', type: 'text', minWidth: 150 },
      { prop: 'serviceName', label: '服务项', type: 'text', width: 100 },
      { prop: 'feeName', label: '费用名称', type: 'text', width: 100 },
      { prop: 'feeEnName', label: '费用英文名', type: 'text', width: 100 },
      { prop: 'receipayType', label: '应收应付', type: 'select', readOnly: true, width: 100 },
      { prop: 'currency', label: '币种', type: 'text', width: 55 },
      { prop: 'unitPrice', label: '单价', type: 'text', width: 55 },
      { prop: 'unitCount', label: '数量', type: 'text', width: 55 },
      { prop: 'feeAmt', label: '金额', type: 'text', width: 70 },
      { prop: 'feeUnit', label: '计费单位', type: 'select', width: 80, readOnly: true },
      { prop: 'taxRate', label: '税率', type: 'text', width: 55, propInDict: 'taxRateInfo' },
      { prop: 'taxAmt', label: '税额', type: 'text', width: 70 },
      { prop: 'feeAmtWithoutTax', label: '不含税金额', type: 'text', width: 100 },
      { prop: 'invoiceStatus', label: '开票状态', width: 100, type: 'select', propInDict: 'feeInvoiceStatus', readOnly: true },
      { prop: 'invoiceAmt', label: '已开票金额', type: 'text', width: 100 },
      { prop: 'invoiceBalanceAmt', label: '可开票金额', type: 'text', width: 100 },
      {
        prop: 'invoiceAmtApply',
        label: '开票金额',
        width: 90,
        type: 'input',
        bothDisabled: true,
        // inputType: 'number',
        validateInput: (val, row, item) => {
          this.validateInput.call(this, val, row, item)
          let balance = this.applyForm.invoiceBalance
          row.applyAmtInvoiceCurrency = new LSnum(val).times(row.rate || 1).toNum(2)
          let data = this.option1.data
          let sum = data.reduce((a, b) => {
            return new LSnum(a).plus(item.applyAmtInvoiceCurrency).num
            // return new LSnum(a).plus(new LSnum(b.invoiceAmtApply).times(b.rate || 1).toNum(2)).num
          }, 0)

          let totalInvoiceAmtApply = this.applyForm.totalInvoiceAmtApply
          let dataSum = 0
          let lastSum = 0
          let len = this.option1.data.length
          let lastData = this.option1.data[len - 1]
          if (new LSnum(sum).minus(balance).num > 0) {
            // let excludeRowSum = new LSnum(sum).minus(new LSnum(val).times(row.rate || 1).toNum(2)).num
            // balance = new LSnum(balance).minus(excludeRowSum).div(row.rate || 1).toNum()
            row.invoiceAmtApply = ''
            row.applyAmtInvoiceCurrency = 0
            dataSum = this.option1.data.slice(0, -1).reduce((total, cur) => {
              return new LSnum(total).plus(cur.applyAmtInvoiceCurrency).num
            }, 0)
            lastSum = new LSnum(totalInvoiceAmtApply).minus(dataSum).num
            if (lastSum > 0) {
              let invoiceAmtApply = new LSnum(lastSum).div(lastData.rate).toNum(2)
              if (invoiceAmtApply - lastData.invoiceBalanceAmt >= 0) {
                lastData.invoiceAmtApply = lastData.invoiceBalanceAmt
                lastData.applyAmtInvoiceCurrency = new LSnum(lastData.invoiceBalanceAmt).times(lastData.rate || 1).toNum(2)
              } else {
                lastData.invoiceAmtApply = invoiceAmtApply
                lastData.applyAmtInvoiceCurrency = lastSum
              }
            } else {
              lastData.invoiceAmtApply = lastData.applyAmtInvoiceCurrency = 0
            }
            return this.$msgErrClose('费用开票金额之和不能大于最大可开票金额！', 5000)
          }
          if (val - row.invoiceBalanceAmt > 0) {
            row.invoiceAmtApply = row.invoiceBalanceAmt
            row.applyAmtInvoiceCurrency = new LSnum(row.invoiceBalanceAmt).times(item.rate || 1).toNum(2)
            dataSum = this.option1.data.slice(0, -1).reduce((total, cur) => {
              return new LSnum(total).plus(cur.applyAmtInvoiceCurrency).num
            }, 0)
            lastSum = new LSnum(totalInvoiceAmtApply).minus(dataSum).num
            if (lastSum > 0) {
              let invoiceAmtApply = new LSnum(lastSum).div(lastData.rate).toNum(2)
              if (invoiceAmtApply - lastData.invoiceBalanceAmt >= 0) {
                lastData.invoiceAmtApply = lastData.invoiceBalanceAmt
                lastData.applyAmtInvoiceCurrency = new LSnum(lastData.invoiceBalanceAmt).times(lastData.rate || 1).toNum(2)
              } else {
                lastData.invoiceAmtApply = invoiceAmtApply
                lastData.applyAmtInvoiceCurrency = lastSum
              }
            } else {
              lastData.invoiceAmtApply = lastData.applyAmtInvoiceCurrency = 0
            }
            return this.$msgErrClose('开票金额不能大于可开票金额！')
          }
          dataSum = this.option1.data.slice(0, -1).reduce((total, cur) => {
            return new LSnum(total).plus(cur.applyAmtInvoiceCurrency).num
          }, 0)
          lastSum = new LSnum(totalInvoiceAmtApply).minus(dataSum).num
          if (lastSum > 0) {
            let invoiceAmtApply = new LSnum(lastSum).div(lastData.rate).toNum(2)
            if (invoiceAmtApply - lastData.invoiceBalanceAmt >= 0) {
              lastData.invoiceAmtApply = lastData.invoiceBalanceAmt
              lastData.applyAmtInvoiceCurrency = new LSnum(lastData.invoiceBalanceAmt).times(lastData.rate || 1).toNum(2)
            } else {
              lastData.invoiceAmtApply = invoiceAmtApply
              lastData.applyAmtInvoiceCurrency = lastSum
            }
          } else {
            lastData.invoiceAmtApply = lastData.applyAmtInvoiceCurrency = 0
          }
        },
      },
      { prop: 'invoiceCurrency', label: '开票币种', type: 'text', width: 80 },
      { prop: 'rate', label: '开票汇率', type: 'text', width: 80 },
      { prop: 'settleExRate', label: '结算汇率', type: 'text', width: 80 },
    ]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.option1.columns = [...this.selfColumnsBase]
    listColumnConfigGet({ scenesCode: 'rec_invoice_detail_fee' }).then((res) => {
      this.columnConfig = true
      this.dealCustomColumn(res)
    })
  },
  methods: {
    search(list) {
      console.log(list.map((item) => item.invisible))
      this.option1.data = [...list]
    },
    init(params) {
      this.isSysInfo = false
      this.isCannotChange = false
      this.showCorpInfo = false
      // 初始化会引起自动验证
      this.applyForm.splitNo = this.applyForm.splitUnitAmt = ''
      this.$refs.form.resetFields()
      // this.$refs.form.clearValidate()
      this.invoiceCurrencyToCNYRate = '' // 清空，否则因请求的异步，导致还在用之前的该数据
      console.log(this.invoiceCurrencyToCNYRate)
      this.applyForm.remarkOldVal = '' // 非form中prop，需手动清除
      this.remarksSetting = []
      this.draftCurrencyChangeCount = 0
      this.itemNameSelectOptions = []
      this.invoiceTableList = []
      // this.$options.created.forEach((fn) => fn.call(this))
      let routeQuery = params || this.$route.query
      this.settleOrderId = routeQuery.settleOrderId
      this.writeoffReceipayId = routeQuery.writeoffReceipayId
      this.invoiceReceivableApplyId = routeQuery.invoiceReceivableApplyId
      this.source = routeQuery.source
      this.settleOrderFeeIds = routeQuery.settleOrderFeeIds ? JSON.parse(routeQuery.settleOrderFeeIds) : []
      this.getData()
    },
    getData(params) {
      this.$refs.detailFeeSearch && this.$refs.detailFeeSearch.clearData()
      this.lsLoading = true
      this.applyForm.emailAddrs = this.$store.state.user.userInfo.email
      console.log(this.$store.state.user.userInfo.email)
      // 如果是应收发票列表的草稿进来
      if (this.source === 'draft') {
        let dataIn = { invoiceReceivableApplyId: this.invoiceReceivableApplyId }
        info(dataIn)
          .then((res) => {
            let data = res.data || {}
            this.isCannotChange = !data.invoiceInfoEdit
            let isClose = data.invoiceApplyStatus === 'close'
            let noFee = !data.applyFeeList || !data.applyFeeList.length
            let noInoviceInfo = !data.companyInvoiceInfo
            if (isClose || noFee || noInoviceInfo) {
              this.lsLoading = false
              this.delVisitedView(this.$route)
              this.cancel()
              this.$msgErrClose(isClose ? '开票申请已关闭！' : noFee ? '无费用信息！' : '分公司无开票信息！')
              return
            }
            this.invoiceReceivableApplyId = data.invoiceReceivableApplyId
            this.applyForm.invoiceCurrency = data.currency
            this.settleCurrencyList = [{ label: data.currency, value: data.currency }]
            this.applyForm.invoiceWay = data.invoiceWay || 'manual'
            this.applyForm.invoiceType = data.invoiceType
            this.applyForm.itemGoupType = data.itemGoupType
            // 应收费用列表
            let dataLen = data.applyFeeList.length
            this.option1.data = data.applyFeeList.map((item, index) => {
              return {
                ...item,
                bothDisabled: index == dataLen - 1,
                edit: true,
                invoiceCurrency: data.currency,
                invoiceAmtApply: item.applyAmt,
              }
            })
            this.applyForm.totalInvoiceAmtApply = data.amt
            this.totalAmount = data.totalAmountList.reduce((str, cur) => `${str}${cur.currency} ${cur.amt}　`, '')
            this.remarksObj = Object.assign(this.remarksObj, data.remarks)

            let itemGoupType = data.itemGoupType
            // itemName: value === 'merge' ? (item.invoiceSummaryName ? item.invoiceSummaryName : item.feeName) : (item.invoiceItemName ? item.invoiceItemName : item.feeName), // item.feeName,
            let itemNameList = data.applyFeeList.map((item) => {
              return itemGoupType === 'merge' ? item.invoiceSummaryName : item.invoiceItemName
            })
            itemNameList = itemNameList.filter((item) => item !== '')
            itemNameList = this.itemNameList = [...new Set(itemNameList)]
            this.itemNameSelectOptions = this.itemNameList.map((item) => {
              return { label: item, value: item }
            })
            console.log('itemNameList: ', itemNameList)
            let { taxpayerNo: saleCompTaxNo, saleCompTitle, saleCompAddr } = data
            Object.assign(this.applyForm, { saleCompTaxNo, saleCompTitle, saleCompAddr })
            // let { settleCompCode, agentCompCode, orderType } = data.applyFeeList[0]
            let { title, taxNo, addr, tel, emailAddrs, postType, postAddr, postPhone } = data
            Object.assign(this.applyForm, { title, taxNo, addr, tel, emailAddrs, postType, postAddr, postPhone })
            this.applyForm.invoiceBalance = data.amt
            this.applyForm.settleCompCode = data.settleCompCode
            this.applyForm.settleCompName = data.settleCompName
            this.applyForm.unitName = this.applyForm.settleCorpName = data.settleCorpName
            this.applyForm.unitCode = this.applyForm.settleCorpCode = data.settleCorpCode

            this.applyForm.bankName = data.bankName
            this.applyForm.accountNo = data.accountNo
            this.applyForm.bankBranchName = data.bankBranchName
            this.applyForm.buyerBankInfo = data.buyerBankInfo
            this.applyForm.title = data.title || data.settleCompName
            this.applyForm.taxpayerType = data.taxpayerType
            this.applyForm.tel = data.tel
            this.applyForm.addr = data.addr
            this.applyForm.emailAddrs = data.emailAddrs
            // 结算单位
            this.getSettleUnitInvoiceInfo({ unitCode: data.settleCorpCode }, data.accountNo)
            this.$nextTick(() => this.$refs.form.clearValidate())
            // 分公司  销售方
            this.getCompanyInvoiceInfo({ ...data }, true)
            // 旧的数据没有原币开票金额，延迟赋值 防止此时汇率还没取到

            this.changeCurrency(this.applyForm.invoiceCurrency, () => {
              if (!data.invoiceReceivableList[0]['invoiceReceivableItemList'][0]['itemCurrencyAmt']) {
                data.invoiceReceivableList.forEach((item) => {
                  item.invoiceReceivableItemList.forEach((v) => {
                    if (v.amt && !v.itemCurrencyAmt) {
                      v.itemCurrencyAmt = new LSnum(v.amt).div(this.invoiceCurrencyToCNYRate).toNum(2)
                    }
                  })
                })
                this.renderInvoiceReceivableList(data.invoiceReceivableList)
                this.lsLoading = false
              } else {
                this.renderInvoiceReceivableList(data.invoiceReceivableList)
                this.lsLoading = false
              }
            })
            this.taxRate = (data.applyFeeList[0] && data.applyFeeList[0].taxRate) || 0
          })
          .catch((err) => this.cancel('delete', err))
        return
      }
      let method, data
      // 从结算单进来 获取结算单费用列表
      if (this.source === 'settleInvoice') {
        if (this.settleOrderFeeIds.length > 0) {
          data = { settleOrderIds: JSON.parse(this.settleOrderId), settleOrderFeeIds: this.settleOrderFeeIds }
        } else {
          data = { settleOrderIds: JSON.parse(this.settleOrderId) }
        }
        method = settleOrderInvoiceFeeList
      }
      // 从应收核销单进来 获取应收核销费用列表
      if (this.source === 'writeOffInvoice') {
        data = { writeoffReceipayIds: JSON.parse(this.writeoffReceipayId) }
        method = invoiceReceivableApply
      }
      method({...data, openerReceiveInvoice: "yes"} || {})
        .then((res) => {
          // TODO 不用系统汇率 需恢复-begin
          let resData1 = res.data || {}
          this.isCannotChange = !resData1.invoiceInfoEdit
          let { settleOrderFeeList = [], totalAmountList = [], settleCurrencyList = [], remarks = {} } = resData1 || {}
          let noFee = !settleOrderFeeList.length
          let noInoviceInfo = !resData1.companyInvoiceInfo
          if (noFee || noInoviceInfo) {
            this.lsLoading = false
            this.delVisitedView(this.$route)
            this.cancel()
            this.$msgErrClose(noFee ? '无费用信息！' : '分公司无开票信息！')
            return
          }
          settleOrderFeeList.forEach((item) => (item.applyAmtInvoiceCurrency = item.invoiceBalanceAmt))
          this.taxRate = (settleOrderFeeList[0] && settleOrderFeeList[0].taxRate) || 0

          this.applyForm.invoiceBalance = resData1.invoiceBalance
          this.applyForm.unitName = this.applyForm.settleCorpName = resData1.settleCorpName
          this.applyForm.unitCode = this.applyForm.settleCorpCode = resData1.settleCorpCode
          this.applyForm.totalInvoiceAmtApply = resData1.invoiceBalance
          this.settleCurrencyList = settleCurrencyList.map((item) => ({ label: item, value: item }))
          this.applyForm.invoiceCurrency = settleCurrencyList.length >= 0 ? settleCurrencyList[0] : 'CNY'
          settleOrderFeeList = settleOrderFeeList.filter((item) => item.openerReceiveInvoice !== 'no')

          let dataLen = settleOrderFeeList.length
          this.option1.data = settleOrderFeeList.map((item, index) => {
            item.invoiceAmtApply = item.invoiceBalanceAmt
            item.rate = item.settleExRate
            item.invoiceCurrency = item.settleCurrency || this.applyForm.invoiceCurrency
            item.bothDisabled = index == dataLen - 1
            item.edit = true
            return item
          })
          this.totalAmount = totalAmountList.reduce((str, cur) => `${str}${cur.currency} ${cur.amt}　`, '')
          this.remarksObj = { ...this.remarksObj, ...remarks }
          // 结算单位
          this.applyForm.title = res.data.settleCorpName
          this.getSettleUnitInvoiceInfo({ unitCode: res.data.settleCorpCode })
          // 分公司  销售方
          this.applyForm.settleCompCode = resData1.settleCompCode
          this.applyForm.settleCompName = resData1.settleCompName
          this.getCompanyInvoiceInfo(resData1)
          this.changeCurrency(this.applyForm.invoiceCurrency, () => {
            console.log('``````````````````')
            this.lsLoading = false
            this.$nextTick(() => {
              this.$forceUpdate()
              this.currencyAmtInput(this.applyForm.totalInvoiceAmtApply, true)
            })
          })
        })
        .catch((err) => this.cancel('delete', err))
    },
    remarkChange(val, row, option) {
      if (!row) return
      let newVal = row.remark
      // let oldVal = this.applyForm.remarkOldVal
      let oldVal = row.remarkOldVal
      let currency = this.applyForm.invoiceCurrency
      if (currency !== 'CNY') {
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
          option.remark = row.remark =
            `开票币种：${currency}，开票金额：${option.itemSumInvoiceCurrency}，本发票只接受美元付款，开票汇率：${this.invoiceCurrencyToCNYRate}\u3000` +
            str
          return
        }
        let reg3 = /\u3000.*\u3000/ // /\u3002.*\u3002/
        if (newVal.match(reg3)) {
          option.remark = row.remark = oldVal
          return this.$msgErrClose('请勿输入全角字符！')
        }
      } else {
        let reg1 = /.*\u3000.*/ // /.*\u3002.*/
        if (newVal.match(reg1)) {
          option.remark = row.remark = oldVal
          return this.$msgErrClose('请勿输入全角字符！')
        }
      }
      let index = this.getCharLength(newVal)
      if (index) {
        // 实际maxlength已拦截，此处未进入
        option.remark = row.remark = newVal.slice(0, index)
        return this.$msgErrClose('备注信息长度已达最大值！')
      }
      row.remarkOldVal = row.remark
      option.remark = row.remark
    },
    remarksChange(index) {
      let remark = this.invoiceTableList[index].remark
      this.invoiceTableList[index].remarksSetting.forEach((key) => {
        let option = this.remarksOptions.find((item) => item.value === key)
        // console.log(this.remarksOptions)
        // console.log(option && option.label)
        let label = (option && option.label) || ''
        if (label && !remark.includes(label + '：')) {
          let value = this.remarksObj[key]
          remark += label + '：' + value + '，'
        }
      })
      this.invoiceTableList[index].remark = remark
      this.invoiceTableList[index].data.forEach((item) => {
        item.remark = remark
      })
    },
    // 结算单位 账户更改时，更新对应的信息
    corpBankChange(val, isInit) {
      console.log(val)
      if (!Object.keys(val).length && isInit) return
      this.applyForm.bankName = val.bankName || ''
      this.applyForm.accountNo = val.accountNo || ''
      this.applyForm.bankBranchName = val.bankBranch || ''
      this.applyForm.buyerBankInfo = val.invoiceBankInfo || ''
      // saleCompBankName,saleCompBankNo,saleCompAddr,saleCompTel,taxPayerNo,
    },
    // 分公司账户更改，更新对应信息
    compBankChange(val) {
      this.applyForm.saleCompAddr = val.addr || ''
      this.applyForm.saleCompTel = val.tel || ''
      this.applyForm.saleCompBankName = val.bankName || ''
      this.applyForm.saleCompBankBranchName = val.bankBranchName || ''
      this.applyForm.saleCompBankNo = val.accountNo || ''
      this.settleCompInfo = { ...val, unitName: val.title || '' }
    },
    invoiceTypeChange(value) {
      this.backupQuota = this.quota
      console.log(setCamelFormat(this.applyForm.invoiceType) + 'Quota')
      this.quota = this[setCamelFormat(this.applyForm.invoiceType) + 'Quota']
      if (!this.quota) {
        this.applyForm.invoiceType = ''
        return this.$msgErrClose('当前分公司此发票类型发票限额为0！')
      }
      // 之前限额同当前限额相同时，发票信息不动
      if (this.backupQuota == this.quota) {
        return
      }
      this.invoiceItemGroupTypeChange()
    },
    //
    invoiceItemGroupTypeChange(fromAmt) {
      if (!this.quota) return
      // return
      let value = this.applyForm.itemGoupType
      let toCNYRate = this.invoiceCurrencyToCNYRate
      let totalApplyCNY = this.totalInvoiceAmtApplyCNY // 折合开票CNY金额（开票币种不是CNY）
      let totalAmtApply = this.applyForm.totalInvoiceAmtApply // 开票共计
      let taxRate = this.taxRate // 税率
      console.log(`quota:${this.quota},totalApplyCNY:${totalApplyCNY},toCNYRate:${toCNYRate},`)
      this.invoiceTableList = []
      // this.quota = 3000
      let currencyQuota = +new LSnum(this.quota).div(toCNYRate).toFixed(2, 1)
      // 折合开票/单张限额
      let num = new LSnum(totalAmtApply).div(currencyQuota).num
      let count = Math.floor(num)
      let remainder = num % 1 // 取余
      if (count >= 1) {
        let ratio = new LSnum(currencyQuota).div(totalAmtApply).toNum(2)
        for (let i = 0; i < count; i++) {
          // this.addInvoice('fullQuota')
          this.addInvoice(true)
          // console.log(this.invoiceTableList)
          let arr = []
          let rateObj = {}
          this.invoiceRates.forEach((item) => (rateObj[item.currency] = item))
          this.option1.data.forEach((item) => {
            let invoiceAmtApply = new LSnum(item.invoiceAmtApply).times(ratio).times(item.rate).toNum(2) // invoiceBalanceAmt
            let price = new LSnum(invoiceAmtApply).times(toCNYRate).toNum(2)
            let amtWithoutTax = new LSnum(price).div(new LSnum(taxRate).plus(1)).toNum(2)
            let taxAmt = new LSnum(price).div(new LSnum(taxRate).plus(1)).times(taxRate).toNum(2)
            let itemName = (value === 'merge' ? item.invoiceSummaryName : item.invoiceItemName) || item.feeName
            if (invoiceAmtApply > 0) {
              arr.push({
                itemName,
                unit: 'bill',
                itemCurrencyAmt: invoiceAmtApply,
                count: 1,
                price,
                amtWithoutTax,
                amt: price,
                taxRate,
                taxAmt,
                edit: false,
              })
            }
          })
          // this.option2.data = arr
          // 根据费用项的明细名称或汇总名称开票
          this.itemNameList = [...new Set(arr.map((item) => item.itemName))]
          if (fromAmt === 'fromAmt') {
            let itemNameList = this.option1.data.map((item) => {
              return this.applyForm.itemGoupType === 'merge' ? item.invoiceSummaryName : item.invoiceItemName
            })
            itemNameList = [...new Set(itemNameList.filter((item) => item !== ''))]
            this.itemNameSelectOptions.splice(0, 1000, ...itemNameList.map((item) => ({ label: item, value: item })))
          } else {
            this.itemNameSelectOptions = this.itemNameList.map((item) => ({ label: item, value: item }))
          }
          let noLastSum = 0
          let noLastSumCurrency = 0
          let len = this.itemNameList.length
          let arr2 = this.itemNameList.map((itemName, index) => {
            let price = 0,
              taxAmt = 0,
              amtWithoutTax = 0,
              itemCurrencyAmt = 0
            if (index === len - 1) {
              itemCurrencyAmt = new LSnum(currencyQuota).minus(noLastSumCurrency).toNum(2)
              price = new LSnum(this.quota).minus(noLastSum).toNum(2)
              taxAmt = new LSnum(price).div(new LSnum(taxRate).plus(1)).times(taxRate).toNum(2)
              amtWithoutTax = new LSnum(price).minus(taxAmt).toNum(2)
            } else {
              arr.forEach((item) => {
                if (item.itemName === itemName) {
                  itemCurrencyAmt = new LSnum(itemCurrencyAmt).plus(item.itemCurrencyAmt).toNum(2)
                  price = new LSnum(price).plus(item.price).toNum(2)
                  taxAmt = new LSnum(taxAmt).plus(item.taxAmt).toNum(2)
                  amtWithoutTax = new LSnum(amtWithoutTax).plus(item.amtWithoutTax).toNum(2)
                }
              })
              noLastSum = new LSnum(noLastSum).plus(price).toNum(2)
              noLastSumCurrency = new LSnum(noLastSumCurrency).plus(itemCurrencyAmt).toNum(2)
            }
            return {
              ...COMMON,
              itemName,
              itemCurrencyAmt,
              price,
              amtWithoutTax,
              amt: price,
              taxRate,
              taxAmt,
              rowsCount: this.itemNameList.length,
            }
          })
          this.invoiceTableList[i].data = arr2
        }
      }

      if (remainder > 0) {
        // this.addInvoice(false)
        this.addInvoice(true)
        // let ratio = remainder * this.quota / totalApplyCNY
        // ratio值过小时，只保留两位小数会被舍为0， 如remaider=100，quota=10000， totalApplyCNY=20100,所以ratio无需只保留两位小数
        let ratio = new LSnum(remainder).times(this.quota).div(totalApplyCNY).num
        let arr = []
        let rateObj = {}
        this.invoiceRates.forEach((item) => (rateObj[item.currency] = item))

        this.option1.data.forEach((item) => {
          let invoiceAmtApply = new LSnum(item.invoiceAmtApply).times(ratio).times(item.rate).toNum(2) // invoiceBalanceAmt
          let price = new LSnum(invoiceAmtApply).times(toCNYRate).toNum(2)
          let amtWithoutTax = new LSnum(price).div(new LSnum(taxRate).plus(1)).toNum(2)
          let taxAmt = new LSnum(price).div(new LSnum(taxRate).plus(1)).times(taxRate).toNum(2)
          let itemName = (value === 'merge' ? item.invoiceSummaryName : item.invoiceItemName) || item.feeName
          if (invoiceAmtApply > 0) {
            arr.push({
              itemName,
              unit: 'bill',
              count: 1,
              itemCurrencyAmt: invoiceAmtApply,
              price,
              amtWithoutTax,
              amt: price,
              taxAmt,
              taxRate,
              edit: false,
            })
          }
        })
        // this.option2.data = arr
        this.itemNameList = [...new Set(arr.map((item) => item.itemName))]
        if (fromAmt === 'fromAmt') {
          let itemNameList = this.option1.data.map((item) => {
            return this.applyForm.itemGoupType === 'merge' ? item.invoiceSummaryName : item.invoiceItemName
          })
          itemNameList = [...new Set(itemNameList.filter((item) => item !== ''))]
          this.itemNameSelectOptions.splice(0, 1000, ...itemNameList.map((item) => ({ label: item, value: item })))
        } else {
          this.itemNameSelectOptions = this.itemNameList.map((item) => ({ label: item, value: item }))
        }
        console.log('itemNameList: ', this.itemNameList)
        // console.log('itemNameSelectOptions: ', this.itemNameSelectOptions)
        let arr2 = this.itemNameList.map((itemName) => {
          let price = 0,
            taxAmt = 0,
            amtWithoutTax = 0,
            itemCurrencyAmt = 0
          arr.forEach((item) => {
            if (item.itemName === itemName) {
              itemCurrencyAmt = new LSnum(itemCurrencyAmt).plus(item.itemCurrencyAmt).toNum(2)
              price = new LSnum(price).plus(item.price).toNum(2)
              taxAmt = new LSnum(taxAmt).plus(item.taxAmt).toNum(2)
              amtWithoutTax = new LSnum(amtWithoutTax).plus(item.amtWithoutTax).toNum(2)
            }
          })
          return {
            ...COMMON,
            itemName,
            itemCurrencyAmt,
            price,
            amtWithoutTax,
            amt: price,
            taxAmt,
            taxRate,
            rowsCount: this.itemNameList.length,
          }
        })
        this.invoiceTableList[this.invoiceTableList.length - 1].data = arr2
      }
      // 如果有差值，修正到里面去
      let invoiceSum = this.invoiceTableList
        .reduce((sum, curr) => {
          return sum.plus(curr.data.reduce((subSum, subCurr) => subSum.plus(subCurr.amt), BIGZERO))
        }, BIGZERO)
        .toNum(2)
      let diff = new LSnum(totalApplyCNY).minus(invoiceSum).num
      if (diff !== 0) {
        let data = this.invoiceTableList[this.invoiceTableList.length - 1].data
        // data[data.length - 1].price = decimalFixed2(data[data.length - 1].price + diff)
        data[data.length - 1].price = new LSnum(data[data.length - 1].price).plus(diff).toNum(2)
      }
      // 如果有差值，修正到里面去
      let invoiceSumCurrency = this.invoiceTableList
        .reduce((sum, curr) => {
          return sum.plus(curr.data.reduce((subSum, subCurr) => subSum.plus(subCurr.itemCurrencyAmt), BIGZERO))
        }, BIGZERO)
        .toNum(2)
      diff = new LSnum(totalAmtApply).minus(invoiceSumCurrency).num
      if (diff !== 0) {
        let data = this.invoiceTableList[this.invoiceTableList.length - 1].data
        data[data.length - 1].itemCurrencyAmt = new LSnum(data[data.length - 1].itemCurrencyAmt).plus(diff).toNum(2)
      }
      console.log(this.invoiceTableList)
      this.dealInvoiceData()
    },

    renderInvoiceReceivableList(invoiceReceivableList) {
      if (!this.quota) return
      // debugger
      this.invoiceTableList = []
      let num = this.totalInvoiceAmtApplyCNY / this.quota
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
      this.$nextTick(() => {
        this.dealInvoiceData()
      })
    },
    editItemName(index) {
      this.resetItemNameSelectOptions()
      this.invoiceTableList[index].data.forEach((item) => {
        item.taxRate = item.taxRate + ''
        item.edit = true
      })
      // this.option2.data.forEach((item) => (item.edit = true))
    },
    addItemName(index) {
      this.resetItemNameSelectOptions()
      if (this.invoiceTableList[index].data.length >= 8) {
        // if (this.option2.data.length >= 8) {
        return this.$msgErrClose('最多添加八项明细!')
      }
      // let bool = this.invoiceTableList[index].data.some(item => {
      //   return item.itemName === '*经纪代理服务*代理运费'
      // })
      let itemName = '' // bool ? '' : '*经纪代理服务*代理运费'
      this.invoiceTableList[index].data.push({
        itemName, // this.applyForm.invoiceCurrency === 'USD' ? '海运费' : '代理运费',
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
    addInvoice(canDelete, isBtn) {
      this.invoiceTableList.push(this.initInvoiceTableOption(this.invoiceTableList.length, canDelete))
      if (isBtn) {
        this.$nextTick(() => this.dealInvoiceData())
      }
    },
    initInvoiceTableOption(index, canDelete) {
      // console.log('````````', index, canDelete)
      // 发票服务项
      let operationBtns = Object.assign({}, this.option.operationBtns, {
        data: [
          { label: '修改', type: 'text', showFn: (row) => !row.edit, action: 'Edit' },
          { label: '确定', type: 'text', showFn: (row) => row.edit, action: 'Save' },
          { label: '删除', type: 'text', show: true, action: 'Delete' },
        ],
        show: true,
      })
      let option = Object.assign({}, this.option, {
        id: 'option' + (index + 2),
        $name: 'InvoiceReceivableApply3',
        data: [
          {
            itemName: '', // this.applyForm.invoiceCurrency === 'USD' ? '海运费' : '代理运费',
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
        remarksSetting: this.remarksObj.bl && this.source !== 'draft' ? ['bl'] : [],
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
        { prop: 'count', label: '数量', type: 'input', inputType: 'number', width: 55, positive: true },
        // { prop: 'itemCurrencyAmt', label: '原币开票金额', type: 'input', width: 90 },
        {
          prop: 'itemCurrencyAmt',
          label: '原币开票金额',
          type: 'input',
          inputType: 'number',
          width: 90,
          bothDisabled: true,
          positive: true,
          validateInput: (val, row, item) => {
            clearTimeout(this.amtTimeout)
            this.amtTimeout = setTimeout(() => {
              this.dealInvoiceData()
            }, 100)
          },
        },
        { prop: 'price', label: '单价', type: 'text', width: 90, inputType: 'number', positive: true },
        // 和后台确定是含税的金额，但预览发票时要显示不含税的金额，要计算
        { prop: 'amt', label: '金额', type: 'text', width: 80 },
        { prop: 'amtWithoutTax', label: '金额(不含税)', type: 'text', width: 80 },
        { prop: 'taxRate', label: '税率', type: 'select', propInDict: 'taxRateInfo', width: 55, notAllowed: true },
        { prop: 'taxAmt', label: '税额', type: 'text' },
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
        this.dealInvoiceData()
      })
    },
    validateEmail(rule, value, callback) {
      if (value === '') {
        // if (rule.field === 'receive') {
        callback(new Error('请输入邮箱'))
      } else {
        value = value.replace(/，/g, ',')
        let arr = value.split(',')
        arr.forEach((item) => {
          let Email = item
          // const emailrule = /^([a-zA-Z]|[0-9])+\.?(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
          // const emailrule = /^[A-Za-zd0-9]+([-_.][A-Za-z0-9]+)*@([A-Za-z0-9]+[-.])+[A-Za-z0-9]{2,5}$/;
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
      if (this.applyForm.invoiceCurrency === 'CNY' && invoiceTable.remark && invoiceTable.remark.match(reg2)) {
        return this.$msgErrClose('发票备注有误，如有疑问，请联系管理员！')
      }
      if (this.getCharLength(invoiceTable.remark)) {
        return this.$msgErrClose(`发票${+(index || 0) + 1}备注字符长度超过230（1个中文占2个字符）！`)
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
      console.log('this.applyForm.totalInvoiceAmtApply:', this.applyForm.totalInvoiceAmtApply)
      console.log('this.totalInvoiceAmtApplyCNY:', this.totalInvoiceAmtApplyCNY)
      console.log('result:', this.totalInvoiceAmtApplyCNY - invoiceSum)
      if (this.applyForm.invoiceCurrency !== 'CNY') {
        if (this.totalInvoiceAmtApplyCNY - invoiceSum !== 0) {
          return this.$msgErrClose('费用列表开票金额与总开票金额不一致！')
        }
      } else {
        if (this.applyForm.totalInvoiceAmtApply - invoiceSum !== 0) {
          return this.$msgErrClose('费用列表折合开票金额与总开票金额不一致！')
        }
      }
      return applyItemGroupList
    },
    submitApply(CommitStatus) {
      this.$refs.form.validate((res) => {
        if (!res) return
        let { title, taxNo, accountNo, buyerBankInfo, tel, addr } = this.applyForm
        if (!(title && taxNo && accountNo && buyerBankInfo && tel && addr)) {
          return this.$msgErrClose('客户信息（发票抬头、纳税人识别号、银行账号、开户行、电话、地址）不完整！', 5000)
        }
        let { saleCompTitle, saleCompTaxNo, saleCompBankNo, saleCompBankName, saleCompTel, saleCompAddr } = this.applyForm
        if (!(saleCompTitle && saleCompTaxNo && saleCompBankNo && saleCompBankName && saleCompTel && saleCompAddr)) {
          return this.$msgErrClose('我司信息（发票抬头、纳税人识别号、银行账号、开户行、电话、地址）不完整！', 5000)
        }
        if (CommitStatus === 'preview') {
          this.previewInvoiceAll()
          return
        }
        this.CommitStatus = CommitStatus
        if (!this.dealInvoiceList()) {
          if (this.applyForm.unitName !== this.applyForm.title) {
            let msg = '结算单位与客户发票抬头不一致，是否确认此操作？'
            if (CommitStatus === 'yes') {
              msg = '结算单位与客户发票抬头不一致，是否确认直接提交？'
            }
            this.$confirmWarn(msg, () => this.sureSave())
          } else {
            if (CommitStatus === 'yes') {
              return this.$confirmWarn('是否确认直接提交？', () => this.sureSave())
            }
            this.sureSave()
          }
        }
      })
    },
    getCharLength(str) {
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
        let totalInvoiceAmt = invoiceReceivableList.reduce((total, curr) => new LSnum(total).plus(curr.amt), BIGZERO).toNum(2)
        let amt = invoiceReceivableList[invoiceReceivableList.length - 1].amt
        amt = new LSnum(amt).plus(this.applyForm.totalInvoiceAmtApply).minus(totalInvoiceAmt).toNum(2)
        invoiceReceivableList[invoiceReceivableList.length - 1].amt = amt
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
      let applyFeeList = this.option1.data.map((item) => {
        return {
          invoiceReceivableApplyFeeId: item.invoiceReceivableApplyFeeId,
          feeId: item.feeId,
          settleOrderFeeId: item.settleOrderFeeId,
          settleOrderId: item.settleOrderId,
          settleOrderNo: item.settleOrderNo,
          orderNo: item.orderNo,
          feeCode: item.feeCode,
          balance: item.invoiceBalanceAmt,
          applyAmt: item.invoiceAmtApply,
          applyCurrency: item.invoiceCurrency,
          applyAmtInvoiceCurrency: item.applyAmtInvoiceCurrency,
          // rate: +rateObj[item.currency]?.rate || 1,
          rate: item.rate || 1,
        }
      })
      let data = {
        invoiceReceivableApplyId: this.invoiceReceivableApplyId,
        settleCorpCode: this.applyForm.settleCorpCode,
        settleCorpName: this.applyForm.settleCorpName,
        settleCompCode: this.applyForm.settleCompCode,
        settleCompName: this.applyForm.settleCompName,
        invoiceType: this.applyForm.invoiceType,
        invoiceWay: this.applyForm.invoiceWay,
        itemGoupType: this.applyForm.itemGoupType,
        currency: this.applyForm.invoiceCurrency,
        amt: this.applyForm.totalInvoiceAmtApply,
        title: this.applyForm.title,
        taxNo: this.applyForm.taxNo,
        buyerBankInfo: this.applyForm.buyerBankInfo,
        bankName: this.applyForm.bankName,
        bankBranchName: this.applyForm.bankBranchName,
        accountNo: this.applyForm.accountNo,
        addr: this.applyForm.addr,
        tel: this.applyForm.tel,
        taxpayerNo: this.applyForm.saleCompTaxNo, // taxpayerNo
        taxpayerType: this.applyForm.taxpayerType,
        saleCompTitle: this.applyForm.saleCompTitle,
        saleCompBankName: this.applyForm.saleCompBankName,
        saleCompAccountShortName:
          typeof this.applyForm.compBank === 'object' ? this.applyForm.compBank.accountShortName : this.applyForm.compBank,
        saleCompAccountNo: this.applyForm.saleCompBankNo,
        saleCompBankBranchName: this.applyForm.saleCompBankBranchName,
        saleCompAddr: this.applyForm.saleCompAddr,
        saleCompTel: this.applyForm.saleCompTel,
        emailAddrs: this.applyForm.emailAddrs.replace(/，/g, ','),
        postType: this.applyForm.postType,
        postAddr: this.applyForm.postAddr,
        postPhone: this.applyForm.postPhone,
        commitStatus: this.CommitStatus,
        applyFeeList,
        invoiceReceivableList: this.InvoiceReceivableList,
        invoiceRate: this.invoiceCurrencyToCNYRate,
        preInvoice: 'no',
      }
      Object.assign(data, {
        applySource: 'settle_order',
        taxRate: this.option1.data[0].taxRate,
        settleOrderNo: this.option1.data[0].settleOrderNo,
        settleOrderId: this.option1.data[0].settleOrderId,
      })
      if (typeof cb === 'function') {
        return cb(data)
      }
      // console.log(data)
      // return
      if (this.CommitStatus === 'yes') {
        this.btnLoading = true
      } else {
        this.btnLoading1 = true
      }
      invoiceApplySave(data)
        .then((res) => {
          if (this.source === 'settleInvoice') {
            localStorage.setItem('refreshSettleOrderId', this.settleOrderId)
          }
          this.dialogVisibleO.show = false
          this.$msgSucClose(this.CommitStatus === 'no' ? '保存成功！' : '提交成功！')
          if (this.CommitStatus === 'no') {
            this.init({ source: 'draft', invoiceReceivableApplyId: res.data.invoiceReceivableApplyId })
            return
          } else {
            let query = {
              source: 'apply',
              invoiceReceivableApplyId: res.data.invoiceReceivableApplyId,
              backToList: true,
            }
            this.routerPush('InvoiceReceivableApplyDetail', query)
            this.delVisitedView()
          }
        })
        .finally(() => {
          this.btnLoading = this.btnLoading1 = false
        })
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
        let { saleCompBankName, saleCompBankBranchName: saleBranch, bankName = '', bankBranchName = '' } = this.applyForm
        this.customerInfo = JSON.parse(JSON.stringify(this.applyForm, arr2))
        this.sellerInfo.bankName = `${saleCompBankName}${saleBranch || ''}`
        this.sellerInfo.bankName = saleBranch || ''
        this.customerInfo.bankName = this.applyForm.buyerBankInfo
        this.applyItemGroupList = JSON.parse(JSON.stringify(this.invoiceTableList[index === true ? 0 : index].data))
        let { invoiceCurrency } = this.applyForm
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
    handleCollapse(val) {
      this['show' + val] = !this['show' + val]
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
        this.dealInvoiceData()
      })
    },
    // 自定义表头
    customColumnsPopClose(action, value) {
      this.customColumnsPopShow = false
      if (action === 'Confirm') {
        let columnList = this.getColumnsValues(value) // getColumnsValues在本页面无作用
        listColumnConfigSave({ columnList, scenesCode: 'rec_invoice_detail_fee' }).then((res) => {
          this.dealCustomColumn(res)
        })
      }
    },
    dealCustomColumn(res) {
      if (res.data?.columnList?.length) {
        let list = res.data.columnList
        this.configColumns = list
        this.option1.columns = list.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop)).filter((v) => v)
      }
    },
    showTipsFn() {
      this.showTips = !this.showTips
    },
    // 开票总金额输入事件
    currencyAmtInput(val, isInit) {
      if (val - this.applyForm.invoiceBalance > 0) {
        this.applyForm.totalInvoiceAmtApply = val = this.applyForm.invoiceBalance
      }
      let data = JSON.parse(JSON.stringify(this.option1.data))
      data.forEach((item) => {
        // invoiceBalanceAmt 可开票金额
        // invoiceAmtApply 开票金额
        // rate 开票汇率
        if (val <= 0) {
          item.applyAmtInvoiceCurrency = 0
          item.invoiceAmtApply = 0
          return
        }
        let invoiceBalanceAmt = item.invoiceBalanceAmt || 0
        let rate = item.rate || 1
        let amt = new LSnum(invoiceBalanceAmt).times(rate).toNum(2)
        let balance = new LSnum(val).minus(amt).toNum(2)
        if (balance >= 0) {
          item.invoiceAmtApply = item.invoiceBalanceAmt
          item.applyAmtInvoiceCurrency = amt
        } else {
          item.invoiceAmtApply = new LSnum(val).div(rate).toNum(2)
          item.applyAmtInvoiceCurrency = val
        }
        val = balance
      })
      // console.log('`````~~~~~~~~~~~', val)
      if (val > 0 && !isInit) {
        this.$msgErrClose('开票金额不能大于可开票总金额！')
      }
      this.option1.data = data
      this.$nextTick(() => {
        this.invoiceItemGroupTypeChange('fromAmt')
      })
    },
    sortChange(column, prop, order) {
      // console.log(column, prop, order)
      if (!order) return
      let arr = [
        'unitPrice',
        'unitCount',
        'feeAmt',
        'taxRate',
        'taxAmt',
        'feeAmtWithoutTax',
        'invoiceAmt',
        'invoiceBalanceAmt',
        'invoiceAmtApply',
        'rate',
        'settleExRate',
      ]
      let isNum = arr.includes(prop)
      if (order === 'descending') {
        this.option1.data = this.option1.data.sort((a, b) => {
          return isNum ? b[prop] - a[prop] : b[prop] > a[prop] ? 1 : -1
        })
      } else if (order === 'ascending') {
        this.option1.data = this.option1.data.sort((a, b) => {
          return isNum ? a[prop] - b[prop] : a[prop] > b[prop] ? 1 : -1
        })
      }
    },
    changeCurrency(val, callback) {
      if (val && val !== 'CNY') {
        let dataAcct = { type: 'acct', srcCurrency: val, toCurrency: 'CNY' }
        return getCurrentExchangeRate(dataAcct).then((res) => {
          if (res.code === 0) {
            this.invoiceCurrencyToCNYRate = res.data.rate
            callback && callback()
            console.log(this.invoiceCurrencyToCNYRate)
            this.remarkChange()
          }
        })
      } else {
        this.invoiceCurrencyToCNYRate = 1
        callback && callback()
      }
    },
    initSale(data) {
      let { saleCompBankName, saleCompAddr, saleCompTel, saleCompAccountNo: saleCompBankNo } = data
      Object.assign(this.applyForm, { saleCompBankName, saleCompAddr, saleCompTel, saleCompBankNo })
      this.applyForm.compBank = saleCompBankName
      this.settleCompInfo = {
        taxNo: data.taxpayerNo,
        unitName: data.saleCompTitle,
        bankName: data.saleCompBankName,
        accountNo: data.saleCompAccountNo,
        addr: data.saleCompAddr,
        tel: data.saleCompTel,
      }
      this.$nextTick(() => this.$refs.form.clearValidate())
    },
    // 我司信息分公司变动时的回调 @params isDraft是否草稿状态
    getCompanyInvoiceInfo(data, isDraft) {
      let { specialQuota, ordinaryQuota, electronicQuota, invoiceBankList, electronicSpecialQuota, invoiceWay, taxNo, title } =
        data.companyInvoiceInfo
      this.specialQuota = specialQuota || 0
      this.ordinaryQuota = ordinaryQuota || 0
      this.electronicQuota = electronicQuota || 0
      this.electronicSpecialQuota = electronicSpecialQuota || 0
      if (!isDraft) {
        this.applyForm.saleCompTaxNo = taxNo
        this.applyForm.saleCompTitle = title
        this.applyForm.invoiceWay = invoiceWay || 'manual'
      }
      this.quota = this[setCamelFormat(this.applyForm.invoiceType) + 'Quota']
      let list = invoiceBankList
      if (list && list.length > 0) {
        this.backupComBanks = list
        this.applyForm.compBanks = [...this.backupComBanks.filter((v) => v.currency == this.applyForm.invoiceCurrency)]
        if (isDraft) {
          let compBankObj = this.applyForm.compBanks.find((item) => {
            return item.accountNo === data.saleCompAccountNo
          })
          if (compBankObj) {
            this.applyForm.compBank = compBankObj.accountShortName
            this.compBankChange(compBankObj)
          } else {
            this.initSale(data)
          }
        } else {
          if (this.applyForm.compBanks && this.applyForm.compBanks[0]) {
            this.applyForm.compBank = this.applyForm.compBanks[0].accountShortName
            this.compBankChange(this.applyForm.compBanks[0])
          }
        }
      } else {
        if (isDraft) {
          this.initSale(data)
        } else {
          this.compBankChange({})
          this.$msgErrClose('未有对应币种的我司开户行！')
        }
      }
    },
    // @params accountNo有值说明是进入页面的状态，正确显示下拉数据
    getSettleUnitInvoiceInfo(data, accountNo) {
      getSettleUnitInvoiceInfo(data).then(({ data: settleData }) => {
        if (!settleData) {
          // this.$msgErrClose('结算单位无开票信息!')
          settleData = {}
        } else if (accountNo) {
          // 草稿逻辑
          // 显示草稿状态下的信息， 被删的账号回写概率小， 没内容的概率大， 取概率大的
          this.applyForm.unitName = this.applyForm.settleCorpName = settleData.unitName || this.applyForm.settleCorpName
          this.applyForm.taxpayerType = settleData.taxpayerType || this.applyForm.taxpayerType
          this.applyForm.addr = settleData.addr || this.applyForm.addr
          this.applyForm.tel = settleData.tel || this.applyForm.tel
        }
        if (settleData.title) {
          this.isSysInfo = true
          this.applyForm.title = settleData.title
          this.applyForm.taxNo = settleData.taxNo
        } else {
          this.isSysInfo = false
        }

        if (!accountNo) {
          // 申请时的逻辑
          if (settleData.unitName) {
            this.applyForm.unitName = this.applyForm.settleCorpName = settleData.unitName
            this.applyForm.unitCode = this.applyForm.settleCorpCode = settleData.unitCode
          }
          this.applyForm.taxNo = settleData.taxNo
          this.applyForm.bankAccounts = settleData.bankAccounts
          this.applyForm.taxpayerType = settleData.taxpayerType
          this.applyForm.addr = settleData.addr
          this.applyForm.tel = settleData.tel
        }
        this.applyForm.bankAccounts = settleData.bankAccounts
        // if (!this.applyForm.accountNo) {
        if (this.accountFilter && this.accountFilter.length) {
          let find = accountNo ? this.accountFilter.find((item) => item.accountNo === accountNo) : this.accountFilter[0]
          find = find || this.accountFilter[0]
          this.applyForm.corpBank = find.accountNo
          this.corpBankChange(find)
        } else {
          this.applyForm.corpBank = ''
          this.corpBankChange({}, true)
        }
      })
    },
    dealInvoiceData(isForce) {
      let allInvoiceAmtCNY = 0
      let allInvoiceAmtCurrency = 0
      let newV = this.invoiceTableList || []
      let vLen = newV.length
      let totalCNY = new LSnum(this.applyForm.totalInvoiceAmtApply).times(this.invoiceCurrencyToCNYRate).toNum(2)
      let curTotalCNY = 0
      newV.forEach((invoiceTable, index) => {
        let newVal = invoiceTable.data
        if (newVal) {
          newVal.forEach((item, subIndex) => {
            // 暂改为首个禁用，改为最后一个需要改动的太多，
            if (index === vLen - 1 && subIndex === 0) {
              this.$set(item, 'bothDisabled', true)
            } else {
              this.$set(item, 'bothDisabled', false)
            }
            this.$nextTick(() => this.remarksChange(index))
            if (!item.itemCurrencyAmt) {
              item.amt = item.taxAmt = item.price = item.amtWithoutTax = ''
              return
            }
            if (item.itemCurrencyAmt && !isNaN(item.itemCurrencyAmt)) {
              item.amt = new LSnum(item.itemCurrencyAmt).times(this.invoiceCurrencyToCNYRate).toNum(2)
              item.price = new LSnum(item.amt).div(item.count).toNum(2) // .toNum(2)
              if (item.amt && (item.taxRate || item.taxRate === 0)) {
                item.taxAmt = new LSnum(item.amt).div(new LSnum(item.taxRate).plus(1)).times(item.taxRate).toNum(2)
                item.amtWithoutTax = new LSnum(item.amt).div(new LSnum(item.taxRate).plus(1)).toNum(2)
              }
            }
          })
          let itemSum = newVal.reduce((sum, curr) => new LSnum(sum).plus(curr.amt), BIGZERO).toNum(2)
          // 最后一张发票，且发票服务项数量为1，且服务项未在编辑状态，且单个服务项内数量为1
          // 此时发票金额未总折币金额-之前发票金额总和
          if (vLen > 1 && vLen === index + 1) {
            let mod = new LSnum(totalCNY).minus(allInvoiceAmtCNY).toNum(2)
            if (itemSum !== mod) {
              let total = invoiceTable.data.slice(1).reduce((t, c) => {
                return new LSnum(t).plus(c.amt).toNum(2)
              }, 0)
              invoiceTable.data[0].amt = new LSnum(mod).minus(total).toNum(2)
              invoiceTable.data[0].price = new LSnum(invoiceTable.data[0].amt).div(invoiceTable.data[0].count).toNum(2)
              if (!invoiceTable.data[0].price || invoiceTable.data[0].price == 0) {
                invoiceTable.data[0].amtWithoutTax = 0
              }
              itemSum = invoiceTable.data.reduce((t, c) => {
                return new LSnum(t).plus(c.amt).toNum(2)
              }, 0)
            }
          }
          invoiceTable.itemSum = itemSum
          curTotalCNY = new LSnum(curTotalCNY).plus(itemSum).toNum()
          allInvoiceAmtCNY = new LSnum(allInvoiceAmtCNY).plus(itemSum).toNum(2)
          // 开票币种对应的开票金额
          let itemSumInvoiceCurrency = newVal.reduce((sum, curr) => {
            return new LSnum(sum).plus(curr.itemCurrencyAmt).toNum(2)
          }, 0)
          if (vLen === index + 1) {
            itemSumInvoiceCurrency = new LSnum(this.applyForm.totalInvoiceAmtApply).minus(allInvoiceAmtCurrency).toNum(2)
            let total = invoiceTable.data.slice(1).reduce((t, c) => {
              return new LSnum(t).plus(c.itemCurrencyAmt).toNum(2)
            }, 0)
            this.$set(invoiceTable.data[0], 'itemCurrencyAmt', new LSnum(itemSumInvoiceCurrency).minus(total).toNum(2))
          }
          invoiceTable.itemSumInvoiceCurrency = itemSumInvoiceCurrency
          allInvoiceAmtCurrency = new LSnum(allInvoiceAmtCurrency).plus(itemSumInvoiceCurrency).toNum(2)
          // 计算发票的remark
          // 草稿进来，首次渲染不用更新备注
          if (this.applyForm.invoiceCurrency !== 'CNY') {
            invoiceTable.remark =
              `开票币种：${this.applyForm.invoiceCurrency}，开票金额：${itemSumInvoiceCurrency}，本发票只接受美元付款，开票汇率：${this.invoiceCurrencyToCNYRate}\u3000` +
              (invoiceTable.remark && invoiceTable.remark.split('\u3000')[1])
          }
          invoiceTable.data.forEach((item) => (item.remark = invoiceTable.remark))
        }
      })
      let totalCny = this.invoiceTableList.reduce((total, curr) => new LSnum(total).plus(curr.itemSum).toNum(2), 0)
      let modCny = new LSnum(totalCNY).minus(totalCny).toNum(2)
      if (this.invoiceCurrencyToCNYRate != 1 && modCny) {
        let invoiceTable = this.invoiceTableList[vLen - 1]
        invoiceTable.itemSum = new LSnum(invoiceTable.itemSum).plus(modCny).toNum(2)
        let row = invoiceTable.data[0]
        this.$set(row, 'amt', new LSnum(row.amt).plus(modCny).toNum(2))
        this.$set(row, 'price', new LSnum(row.amt).div(row.count).toNum(2))
        if (row.amt && (row.taxRate || row.taxRate === 0)) {
          this.$set(row, 'taxAmt', new LSnum(row.amt).div(new LSnum(row.taxRate).plus(1)).times(row.taxRate).toNum(2))
          this.$set(row, 'amtWithoutTax', new LSnum(row.amt).div(new LSnum(row.taxRate).plus(1)).toNum(2))
        }
      }
      this.invoiceTableList = [...this.invoiceTableList]
      // console.log(JSON.stringify(this.invoiceTableList[0].data))
      this.allInvoiceAmtCNY = this.invoiceTableList.reduce((total, curr) => new LSnum(total).plus(curr.itemSum).toNum(2), 0)
      if (isForce) return
      this.dealInvoiceData(true)
    },
  },
  watch: {
    quota: {
      handler(val) {
        if (!val) {
          this.applyForm.invoiceType = ''
        }
      },
      immediate: true,
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
// .settlement-exchange-rates .settlement-exchange-rates-title {
//   color: #606266;
//   // color: #222222;
//   line-height: 20px;
// }
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
<style>
.el-form-item-invoice-remark .el-form-item__content .el-input {
  width: 100%;
}
.invoice-recei-apply-remark {
  display: inline-block;
  margin-right: 10px;
}
.invoice-recei-apply .money-box-right::after {
  display: inline-block;
  vertical-align: middle;
  height: 100%;
  content: '';
}
.invoice-recei-apply-remark p {
  display: inline-block;
  margin-right: 4px;
}
.invoice-recei-apply-remark .el-select {
  width: 150px;
  display: inline-block;
}
</style>