<template>
  <div
    :element-loading-background="eLoadingBackground"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-text="eLoadingText"
    class="finance-page"
    v-loading="loading"
  >
    <div class="finance-list-container" @click="saveDzg">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">收款登记</div>
        </div>
        <div class="money-box-right">
          <el-button
            v-if="checkAuth($route.name, 'btn-writeoff')"
            @click="writeoffAction"
            size="mini"
            type="primary"
          >核销</el-button>
          <el-button
            v-if="checkAuth($route.name, 'btn-transferDzg')"
            @click="transferDzg"
            size="mini"
            type="primary"
          >余额转大掌柜</el-button>
          <el-button
            v-if="checkAuth($route.name, 'btn-handleFeeList') && !source"
            @click="settleOrderFeeList('isFirst')"
            size="mini"
            type="primary"
          >关联费用核销</el-button>
          <el-button @click="cancel" size="mini">返回</el-button>
        </div>
      </div>
      <div class="settlement-detail-form">
        <el-form
          :model="regInfoForm"
          ref="regInfoForm"
          :inline="true"
          size="mini"
          label-width="112px"
          :rules="regInfoFormRules"
        >
          <h3>收款核销</h3>
          <el-form-item label="收款方式" prop="recvWay">
            <el-select v-model="regInfoForm.recvWay" clearable placeholder="请选择收款方式">
              <el-option
                v-for="item in dictMap['recvWay']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="收款银行简称" prop="compBankAccountId">
            <el-select
              v-model="regInfoForm.compBankAccountId"
              filterable
              remote
              :remote-method=" (queryString) => bankAccountList(queryString) "
              @visible-change=" (value) => value && bankAccountList() "
            >
              <el-option
                v-for="(item, index) in bankAccountSelectOptions"
                :key="'bankAccountSelectOptions' + index"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="账户结算方式" prop="settleMode">
            <el-select v-model="regInfoForm.settleMode" clearable placeholder="请选择账户结算方式">
              <el-option
                v-for="item in bankAccountSettleModeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="所属分公司">
            <el-input disabled type="text" v-model="recvCompName"></el-input>
          </el-form-item>
          <el-form-item label="结算单位">
            <el-input disabled type="text" v-model="regInfoForm.settleCorpName"></el-input>
          </el-form-item>
          <el-form-item
            v-show="hasFixedTransferFee"
            label="定价手续费"
            prop="fixedTransferFee"
            :rules="fixedTransferFeeRules"
          >
            <el-input v-model="regInfoForm.fixedTransferFee" disabled placeholder="定价手续费"></el-input>
          </el-form-item>
          <el-form-item label="银行流水号" prop="bankSeqNo" v-show="!recvNeedBankseqBoolean">
            <el-input type="text" v-model="regInfoForm.bankSeqNo" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item
            label="银行流水号"
            prop="bankSeqNo"
            :rules="recvNeedBankseqRules"
            v-show="recvNeedBankseqBoolean"
          >
            <el-input type="text" v-model="regInfoForm.bankSeqNo" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="收付日期" prop="recvDate">
            <el-date-picker
              placeholder="选择日期"
              type="date"
              v-model="regInfoForm.recvDate"
              value-format="yyyy-MM-dd"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="收款金额" prop="realAmt">
            <el-input
              type="text"
              v-lsNumber="{value:'number', obj:regInfoForm, key:'realAmt', dot:2, vm:vm, formStr: 'regInfoForm'}"
              v-model="regInfoForm.realAmt"
              placeholder="请输入"
              @input="realAmtInput"
            ></el-input>
          </el-form-item>
          <el-form-item label="内扣手续费" prop="innerTransferFee">
            <el-input
              type="text"
              v-lsNumber="{value:'number', obj:regInfoForm, key:'innerTransferFee', dot:2, vm:vm, formStr: 'regInfoForm'}"
              v-model="regInfoForm.innerTransferFee"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
          <el-form-item label="外扣手续费" prop="outerTransferFee">
            <el-input
              type="text"
              v-lsNumber="{value:'number', obj:regInfoForm, key:'outerTransferFee', dot:2, vm:vm, formStr: 'regInfoForm'}"
              v-model="regInfoForm.outerTransferFee"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
          <el-form-item label="币种" prop="currency">
            <el-select v-model="regInfoForm.currency" @change="() => viaWriteoffCurrencySetRate()">
              <el-option
                v-for="item in CURRENCY"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="可用核销金额">
            <el-input disabled :value="totalAmt"></el-input>
          </el-form-item>
          <el-form-item label="剩余未用金额" prop="unusedAmt">
            <el-input disabled type="text" v-model="unusedAmt"></el-input>
          </el-form-item>
          <el-form-item label="剩余款项处理" prop="balanceDealType">
            <el-select v-model="regInfoForm.balanceDealType">
              <el-option
                v-for="item in dictMap['balanceDealType']"
                :disabled="item.value === 'prepay_refund'"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="客户短款金额" prop="lessPayAmt">
            <el-input disabled type="text" v-model="lessPayAmt" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="核销日期" prop="writeoffDate">
            <el-date-picker
              placeholder="选择日期"
              type="date"
              v-model="regInfoForm.writeoffDate"
              value-format="yyyy-MM-dd"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="未核销费用可补开票" prop="noWriteoffHasInvoice">
            <el-select v-model="regInfoForm.noWriteoffHasInvoice">
              <el-option
                v-for="item in dictMap['yesNo']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="结算汇率"
            v-if="regInfoForm.exchangeRates.length&&!source"
            class="overshow-item"
          >
            <div>
              <span>{{regInfoForm.exchangeRates[0].settlementRateTitle}} {{regInfoForm.exchangeRates[0].settlementRate}}</span>
              <el-button type="text" size="mini" @click="checkExchangeRage">更多</el-button>
            </div>
          </el-form-item>
          <el-form-item label="上传到账水单">
            <FinUploadEmbed ref="FinUploadEmbed" @send-file-list="sendFileList" />
          </el-form-item>
          <el-form-item label="交易备注" class="full_input" prop="recvRemark">
            <el-input
              type="textarea"
              v-model="regInfoForm.recvRemark"
              :maxlength="500"
              show-word-limit
              placeholder="请输入"
            ></el-input>
          </el-form-item>
          <el-form-item label="核销备注" class="full_input" prop="remark">
            <el-input
              type="textarea"
              v-model="regInfoForm.remark"
              :maxlength="500"
              show-word-limit
              placeholder="请输入"
            ></el-input>
          </el-form-item>

          <h3>客户付款信息</h3>
          <el-form-item label="客户付款账户名" prop="payAccountName">
            <el-autocomplete
              size="mini"
              style="width: 100%"
              v-model="regInfoForm.payAccountName"
              :maxlength="128"
              placeholder="请输入付款账户名"
              :select-when-unmatched="true"
              :fetch-suggestions=" (queryString, cb) => autocomplete1.querySearch(queryString, cb) "
              @select=" (value) => autocomplete1.select(value) "
              @change=" (value) => autocomplete1.change && autocomplete1.change(value) "
            ></el-autocomplete>
          </el-form-item>
          <el-form-item label="客户付款银行" prop="payBankName">
            <!-- :disabled="!!selectedOptionItem1" -->
            <el-autocomplete
              size="mini"
              style="width: 100%"
              v-model="regInfoForm.payBankName"
              :maxlength="128"
              placeholder="请输入付款银行"
              :select-when-unmatched="true"
              :fetch-suggestions=" (queryString, cb) => autocomplete2.querySearch(queryString, cb) "
              @select=" (value) => autocomplete2.select(value) "
              @change=" (value) => autocomplete2.change(value) "
            ></el-autocomplete>
          </el-form-item>
          <el-form-item label="账户类型" prop="payAccountPublicType">
            <el-select v-model="regInfoForm.payAccountPublicType" :disabled="!!publicTypeDisabled">
              <el-option
                v-for="item in dictMap['accountType']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="客户付款账号" prop="payAccountNo">
            <el-input
              :disabled="!!selectedOptionItem1"
              type="text"
              v-model="regInfoForm.payAccountNo"
              placeholder="请输入"
            ></el-input>
          </el-form-item>
          <el-form-item label="发卡行国家" prop="payAccountCountryCode">
            <el-select
              v-model="regInfoForm.payAccountCountryCode"
              clearable
              placeholder="请选择发卡行国家"
              filterable
              :remote-method=" (queryString) => getCountryList(queryString) "
              @visible-change=" (value) => value && getCountryList() "
              @change="selectCountry"
              @clear="regInfoForm.payAccountCountryCode=regInfoForm.payAccountCountryName=''"
            >
              <el-option
                v-for="item in COUNTRYLIST"
                :key="item.value"
                :label="item.cname"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="SWIFT CODE" prop="payAccountSwiftCode">
            <el-input type="text" v-model="regInfoForm.payAccountSwiftCode" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item label="上传客户付款水单">
            <FinUploadEmbed ref="FinUploadEmbed2" @send-file-list="sendFileList2" />
          </el-form-item>
          <el-form-item label="公司地址" class="full_input" prop="payAccountBankCompAddr">
            <el-input
              type="textarea"
              v-model="regInfoForm.payAccountBankCompAddr"
              :maxlength="200"
              show-word-limit
              placeholder="请输入"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="payInfo-box">
        <!-- 转大掌柜余额 -->
        <div class="table-box" v-show="option11.data&&option11.data.length" @click.stop>
          <div class="title-box">
            <div class="title">转大掌柜余额</div>
            <div class="btn"></div>
          </div>
          <FinanceTable :option="option11" />
        </div>
        <div class="table-box">
          <div class="title-box">
            <div class="title">
              费用列表
              <div class="money-list" v-show="originalGather.length">
                核销:
                <span :key="index" v-for="(item, index) in originalGather">
                  {{ item.currency }}
                  <b>{{item.amt}}</b>
                </span>
              </div>
              <div class="money-list" v-show="gatherFee">
                折币：
                <span>
                  {{ regInfoForm.currency }}
                  <b>{{gatherFee}}</b>
                </span>
              </div>
            </div>
            <div
              class="btn"
              v-show="source&&option1.data&&option1.data.length&&regInfoForm.currency"
            >
              <!-- <el-button @click="showExchangeRates" size="mini">系统汇率</el-button> -->
              <el-button @click="changeRate" size="mini">一键修改核销汇率</el-button>
            </div>
          </div>
          <FinanceTable :option="option1" @send-multi="sendMulti" />
        </div>
      </div>
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        @close="customColumnsPopClose"
      />
    </div>
    <!-- 汇率弹出框 -->
    <el-dialog title="核销汇率" :visible.sync="rateDialogOpen" class="self-dialog" width="600px">
      <div style="overflow:hidden">
        <FinanceTable :option="option6" />
      </div>
      <div class="dialog-footer" slot="footer">
        <el-button @click="submitRate" size="mini" type="primary">提交</el-button>
        <el-button @click="closeRateDialog" size="mini">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 关联费用列表 -->
    <!-- <el-dialog :visible.sync="writeoffFeeDialog" class="self-dialog" title="关联费用核销" width="1000px"> -->
    <!-- <el-dialog :visible="true" class="self-dialog" title="关联费用核销" width="1100px" top="8vh"> -->
    <el-dialog
      :visible.sync="writeoffFeeDialog"
      class="self-dialog"
      title="关联费用核销"
      width="1100px"
      top="6vh"
    >
      <FinanceSearch :searchOption="searchOption3" @search="settleOrderFeeList" />
      <FinanceTable :option="option7" @send-multi="sendMulti" ref="multipleTable7" />
      <div class="dialog-footer" slot="footer">
        <el-button @click="importFeesAction3" size="mini" type="primary">导入费用</el-button>
        <el-button @click="closeWriteoffFee" size="mini">关闭</el-button>
      </div>
    </el-dialog>
    <!-- 核销汇率 -->
    <el-dialog :visible.sync="exchangeRatesDialog" class="self-dialog" title="结算汇率" width="600px">
      <FinanceTable :option="option10" v-if="exchangeRatesDialog" />
      <div class="dialog-footer" slot="footer">
        <el-button @click="exchangeRatesDialog = false" size="mini">关闭</el-button>
      </div>
    </el-dialog>
    <!-- 余额转大掌柜 -->
    <TransferDzg :dialogOption="transferOption" @close="closeTransfer" @submit="submitTransfer" />
    <!-- 分摊手续费 -->
    <TransferFee :transferFeeOption="transferFeeOption" @close="closeFee" />
  </div>
</template>

<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import CustomColumns from '@/components/customColumns'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mapState, mapGetters } from 'vuex'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import TransferDzg from '@/views/finance/receivable/components/transferDzg'
import TransferFee from '@/views/finance/receivable/components/transferFee'
import FinUploadEmbed from '@/views/finance/receivable/components/finUploadEmbed'
import { quickRecvWriteoff, regTransferRefund, settleOrderWriteoff, getFixedTranferFeeList } from '@/api/fin/receivableReg'
import { checkRecvWriteoffOverduePayment } from '@/api/fin/writeoffRecv'
import { listPage as settleOrderFeeList } from '@/api/fin/fee'
import { actualExchangeRate, listColumnConfigGet, listColumnConfigSave, baseFeeItemList } from '@/api/base'
import { dateFormat } from '@/views/finance/utils/finance'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { bankAccountList } from '@/api/fin/settleUnit'
import { listReceivableRegAccount } from '@/api/fin/settleUnitBankAcct'
import { bankList } from '@/api/crm/common'
import { countrySelectList } from '@/api/base'
import Vue from 'vue'
// TODO
// 可用核销金额 = 内扣手续费 + 收款金额
// 可用核销金额影响费用列表本次核销金额
// 剩余未用金额 = 可用核销金额 - 费用列表合计折币金额
// 加法 plus,  减法 minus,  乘法 times,  除法 div,  四舍五入 toNum,   获取值 valueOf
const defaultCreateQuery = {
  compBankAccountId: '', // 收款银行账户id
  settleCorpCode: '', // 结算单位
  settleCorpName: '', // 结算单位
  bankSeqNo: '', // 银行流水号
  recvDate: dateFormat('yyyy-mm-dd', new Date()), // 收付日期
  currency: '', // 币种
  realAmt: '', // 收款金额
  outerTransferFee: '', // 外扣手续费
  innerTransferFee: '', // 内扣手续费
  payBankName: '', // 付款账户 付款银行
  payAccountName: '', // 付款账户 账户名
  payAccountNo: '', // 付款账户 账号
  payAccountPublicType: '', // 付款账户 类型
  payAccountCountryCode: '', // 付款账户 发卡行国家
  payAccountCountryName: '', // 付款账户 发卡行国家
  payAccountSwiftCode: '', // 付款账户 SwiftCode
  payAccountBankCompAddr: '', // 付款账户 公司地址
  writeoffDate: dateFormat('yyyy-mm-dd', new Date()), // 核销日期
  noWriteoffHasInvoice: 'no', // 未核销费用可补开发票 yes/no
  balanceDealType: '', // 剩余款项处理 转预收/记财务盈亏
  remark: '', // 核销说明
  recvRemark: '', // 交易备注
  writeoffItemList: [], // 核销明细列表 需要
  feeList: [], // 核销明细列表
  writeoffReceipayTransferDzgList: [], // 核销转大掌柜列表
  settleOrderBuildType: '', // 结算单生成类型 集团结算单：group/单个结算单：signal
  lessPayAmt: '', // 客户短款金额 - 只做展示  费用列表短款金额之和
  unusedAmt: '', // 剩余未用金额 - 只做展示 可用-本次
  exchangeRates: [], // 费用列表核销汇率
  recvWay: '', //收款方式
  settleMode: '', //账户结算方式
  fixedTransferFee: '',
  // totalAmt: '', // 可用核销金额 - 只做展示  realAmt+innerTransferFee(收款+内扣)
}
const SETTLECROPLIST = []
function clearData(list, obj) {
  list.splice(0, 1000)
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      delete obj[key]
    }
  }
}
export default {
  name: 'writeoffReceipay',
  mixins: [mixin, routerMixin],
  data() {
    return {
      recvNeedBankseqBoolean: false,
      hasFixedTransferFee: false,
      fixedTransferFeeRules: { required: true, message: ' ', trigger: 'change' },
      recvNeedBankseqRules: { required: true, message: ' ', trigger: 'blur' },
      // recvCompName: this.$store.state.user.userInfo.settleCompanyName,
      // recvCompCode: this.$store.state.user.userInfo.settleCompanyCode,
      recvCompName: '',
      recvCompCode: '',
      vm: this,
      regInfoForm: Object.assign({}, defaultCreateQuery),
      regInfoFormRules: {
        recvWay: { required: true, message: ' ', trigger: 'change' },
        compBankAccountId: { required: true, message: ' ', trigger: 'change' },
        settleMode: { required: true, message: ' ', trigger: 'change' },
        // bankSeqNo: { required: true, message: ' ', trigger: 'change' },
        recvDate: { required: true, message: ' ', trigger: 'change' },
        currency: { required: true, message: ' ', trigger: 'change' },
        realAmt: { required: true, message: ' ', trigger: 'change' },
        payAccountName: { required: true, message: ' ', trigger: 'change' },
        payAccountPublicType: { required: true, message: ' ', trigger: 'change' },
        writeoffDate: { required: true, message: ' ', trigger: 'change' },
      },
      bankAccountSelectOptions: [],
      bankAccountSettleModeList: [], // 账户结算方式
      autocomplete1: {},
      autocomplete2: {},
      selectedOptionItem1: false,
      selectedOptionItem2: false,
      publicTypeDisabled: false,
      settleOrderBuildType: false,
      COUNTRYLIST: [],
      multipleSelection1: [],
      multipleSelection7: [],
      searchOption3: {},
      option1: {}, // 费用列表
      option6: {}, // 修改汇率弹框列表
      option7: {}, // 关联费用弹框费用列表
      option10: {}, // 结算汇率弹框列表（只做查看）
      option11: {}, // 转大掌柜列表
      exchageRateList: [], // 接口返回的当日核销汇率列表
      settleExchageRateList: [], // 核销需要用到的汇率列表
      settlementRateEditDisabled: false,
      watchFormExchangeRatesTime: 0,
      originalGather: [],
      exchangeGather: [],
      settleOrderIds: [],
      rateDialogOpen: false,
      writeoffFeeDialog: false,
      exchangeRatesDialog: false,
      loading: false,
      transferOption: { show: false, data: [] },
      transferFeeOption: { show: false, data: [], routerData: {} },
      exchangeCurrency: '', // 折币核销币种
      exchangeAmt: '',
      exchangeRate: 1,
      exchangeRateSource: {},
      source: '', //从费用列表''、结算单列表进入'settleOrder'
      CURRENCY: [],
      // 自定义表头弹框
      customColumnsPopShow: false,
      selfColumnsBase: [],
    }
  },
  created() {
    //付款账户名
    this.autocomplete1 = {
      querySearch: (accountName, cb) => {
        let data = {
          currPage: 1,
          pageSize: 30,
          unitCode: this.regInfoForm.settleCorpCode,
          accountName: accountName === this.oldAccountName ? '' : accountName,
          currency: this.regInfoForm.currency,
          status: 'effect',
        }
        listReceivableRegAccount(data).then((res) => {
          const results = []
          const list = res.data ? res.data : []
          list.forEach((item) => {
            results.push({
              ...item,
              key: item.accountNo,
              value: item.accountName + '(' + item.accountNo.slice(-4) + ')',
            })
          })
          cb(results)
        })
      },
      select: (optionItem, row) => {
        this.regInfoForm.payAccountNo = optionItem.accountNo
        this.regInfoForm.payBankName = optionItem.bankName
        this.regInfoForm.payAccountName = optionItem.accountName || optionItem.value
        this.oldAccountName = optionItem.accountName || optionItem.value
        this.regInfoForm._diyAccountName = optionItem.accountName || optionItem.value
        this.regInfoForm.payAccountPublicType = optionItem.publicType || 'pub'
        // 无国家代码时，是否支持下载
        this.regInfoForm.payAccountCountryCode = optionItem.countryCode
        this.regInfoForm.payAccountCountryName = optionItem.countryName
        if (optionItem.countryCode && optionItem.countryName) {
          this.COUNTRYLIST = [{ cname: optionItem.countryName, value: optionItem.countryCode }]
        }
        this.regInfoForm.payAccountSwiftCode = optionItem.swiftCode
        this.publicTypeDisabled = !!optionItem.publicType
        this.selectedOptionItem1 = true
      },
      change: (val) => {
        this.selectedOptionItem1 = this.publicTypeDisabled = false
        this.regInfoForm.payAccountName = this.regInfoForm._diyAccountName = val
        this.regInfoForm.cname = this.regInfoForm.email = this.oldAccountName = ''
        this.regInfoForm.payBankName =
          this.regInfoForm.payAccountNo =
          this.regInfoForm.payAccountCountryCode =
          this.regInfoForm.payAccountSwiftCode =
          this.regInfoForm.payAccountBankCompAddr =
            ''
        this.regInfoForm.payAccountPublicType = 'pub'
      },
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
          const list = res.data.list ? res.data.list : []
          cb(list.map((item) => ({ key: item.bankCode, value: item.cname })))
        })
      },
      select: (optionItem, row) => {
        // console.log(optionItem)
        this.selectedOptionItem = optionItem
        this.regInfoForm.payBankCode = optionItem.key
        this.selectedOptionItem2 = true
      },
      change: (val, row) => {
        this.selectedOptionItem2 = false
        this.regInfoForm.payBankCode = ''
      },
    }
    if (this.$route.meta.close) return
    this.feeSource = ''
    this.option1.data = []
    // this.init()
  },
  methods: {
    init() {
      this.hasFixedTransferFee = this.recvNeedBankseqBoolean = false
      this.regInfoForm.fixedTransferFee = ''
      this.$refs.FinUploadEmbed && this.$refs.FinUploadEmbed.fileList.splice(0, 1000)
      this.$refs.FinUploadEmbed2 && this.$refs.FinUploadEmbed2.fileList.splice(0, 1000)
      let { filePath = '', name = '', fileNo = '' } = {}
      let bankseqFile = { bankseqFilePath: filePath, bankseqFileName: name, bankseqFileCode: fileNo }
      let payBankseqFile = { payBankseqFilePath: filePath, payBankseqFileName: name, payBankseqFileNo: fileNo }
      Object.assign(this.regInfoForm, bankseqFile, payBankseqFile)
      // console.log(this.dictMap.settleOrderType);
      // 普通 normal, 专项 special 坏账 bad_debt    代收付 agent 集团 group 集团专项 group_special
      this.originalGather = this.exchangeGather = []
      this.searchOption3 = {
        columns: [
          // prop: 'settleCorpCode',
          // type: 'select',
          // selectOptions: SETTLECROPLIST,
          { label: '结算单位', prop: 'settleCorpName', type: 'input', disabled: true },
          { label: '工作单号', prop: 'sourceBizNo', type: 'input' },
          {
            label: '费用名称',
            prop: 'feeCode',
            type: 'select',
            remote: true,
            remoteMethod: (val, item) => this.feeItemQuerySearch(val, item),
            visibleChange: (val, item) => this.feeItemQuerySearch(val, item),
            remoteSelectList: [],
          },
        ],
        data: { settleCorpName: '', sourceBizNo: '', feeCode: '' },
      }
      const operationBtns = Object.assign({}, this.option.operationBtns, {
        text: '',
        show: true, // 详情不需要删除
        data: [{ label: '删除', type: 'text', action: 'Delete', showFn: () => true }],
      })
      this.option1 = Object.assign({}, this.option, {
        customColumns: {
          show: true,
          handleCustomColumns: () => (this.customColumnsPopShow = true),
        },
        id: 'option1',
        $name: 'WriteoffRecvDetail1',
        data: [],
        tips: false,
        operationBtns: operationBtns,
        selection: { show: true, fixed: true },
        edit: true,
        colorColumns: ['receipayType'],
      })
      this.option6 = Object.assign({}, this.option, {
        id: 'option6',
        $name: 'WriteoffRecvDetail6',
        tips: false,
        selection: false,
        operationBtns: false,
        pagination: false,
        edit: true,
      })
      this.option7 = Object.assign({}, this.option, {
        id: 'option7',
        $name: 'WriteoffRecvDetail7',
        data: [],
        tips: false,
        operationBtns: false,
        pagination: Object.assign({}, this.option.pagination, { show: true, isNew: true }),
        selection: { show: true, fixed: true },
      })
      this.option10 = Object.assign({}, this.option, {
        id: 'option10',
        $name: 'WriteoffRecvDetail10',
        data: [],
        tips: false,
        operationBtns: false,
        selection: { show: false },
      })
      const columns1 = [
        {
          prop: 'sourceBizNo',
          label: '单号',
          type: 'button',
          width: '140px',
          formatter: ({ cellValue, column, row, item }) => row.sourceBizNo || row.finBillNo,
          operationBtns: { show: true, callback: (fn, index, row, option) => this.showDetail(row) },
        },
        { prop: 'settleCompName', label: '分公司', type: 'text', width: 150 },
        { prop: 'receipayType', label: '应收应付', type: 'select', readOnly: true, width: 100 },
        // {
        //   prop: 'receipayType',
        //   label: '应收应付',
        //   type: 'text',
        //   formatter: ({ cellValue }) => this.dictMapObj.receipayType[cellValue],
        // },
        { prop: 'settleCorpName', label: '结算单位', type: 'text' },
        { prop: 'mbl', label: 'MBL', type: 'text' },
        { prop: 'hbl', label: 'HBL', type: 'text' },
        { prop: 'serviceName', label: '服务项', type: 'text' },
        { prop: 'feeName', label: '费用名称', type: 'text' },
        { prop: 'feeEnName', label: '费用英文名', type: 'text' },
        { prop: 'currency', label: '原币种', type: 'text' },
        { prop: 'feeAmt', label: '原金额', type: 'text' },
        { prop: 'writeoffBalanceAmt', label: '可核销金额', type: 'text', disabled: true },
        {
          prop: 'writeoffFeeAmt',
          label: '本次核销金额',
          type: 'input',
          maxlength: '16',
          disabled: true,
          validateInput: (value, row, pItem, changeE) => {
            if (!value) return
            if (!/^-?(\d+(\.\d{0,2})?)?$/.test(value)) {
              !this.debounceLsFn() && this.$msgErrClose('请输入正确的数字！')
              let res = /^-?(\d+(\.\d{0,2})?)?/.exec(row[pItem.prop])
              row[pItem.prop] = res && res[0]
            }
          },
        },
        // TODO 参考收款核销
        {
          prop: 'lessPayAmt',
          label: '短款金额',
          type: 'input',
          maxlength: '16',
          disabled: true,
          validateInput: (value, row, pItem, changeE) => {
            if (!value) return
            if (!/^-?(\d+(\.\d{0,2})?)?$/.test(value)) {
              !this.debounceLsFn() && this.$msgErrClose('请输入正确的数字！')
              let res = /^-?(\d+(\.\d{0,2})?)?/.exec(row[pItem.prop])
              row[pItem.prop] = res && res[0]
            }
          },
        }, // 短款+本次 <= 可核销
        { prop: 'writeoffCurrency', label: '核销币种', type: 'text' },
        { prop: 'writeoffExRate', label: '核销汇率', type: 'text' },
        { prop: 'writeoffAmt', label: '折币金额', type: 'text' }, //writeoffFeeAmt*writeoffExRate
        { prop: 'feeUnit', label: '计费单位', type: 'text', formatter: ({ cellValue }) => this.dictMapObj.feeUnit[cellValue] },
        { prop: 'unitPrice', label: '单价', type: 'text' },
        { prop: 'unitCount', label: '数量', type: 'text' },
        { prop: 'finDate', label: '财务日期', width: 86, type: 'text' },
      ]
      const columns6 = [
        { prop: 'srcCurrency', label: '原币种', type: 'text' },
        { prop: 'toCurrency', label: '核销币种', type: 'text' },
        { prop: 'lowerRate', label: '最低汇率', type: 'text' },
        { prop: 'upperRate', label: '最高汇率', type: 'text' },
        {
          prop: 'settlementRate',
          label: '结算汇率',
          type: 'input',
          input: (val, row) => {
            val = val.replace(/[,|\s]/g, '')
            if (isNaN(val)) {
              this.$msgErrClose('请输入正确的数字！')
              val = ''
            }
            row.settlementRate = val
          },
        },
      ]
      const columns7 = [
        { prop: 'sourceBizNo', label: '单号', type: 'text', width: 125 },
        { prop: 'settleCorpName', label: '结算单位', type: 'text', width: 140 },
        { prop: 'invoiceStatus', label: '开票状态', type: 'select', propInDict: 'feeInvoiceStatus' },
        // 优化需求 显示是否确认 ID1005097
        { prop: 'confirmStatus', label: '是否确认', type: 'select', propInDict: 'yesNo' },
        { prop: 'feeName', label: '费用名称', type: 'text' },
        { prop: 'feeAmt', label: '原金额', type: 'text' },
        { prop: 'currency', label: '原币种', type: 'text', width: 70 },
        { prop: 'notWriteoffAmt', label: '可核销金额', type: 'text' },
        { prop: 'createdName', label: '创建人', type: 'text' },
        { prop: 'createdTime', label: '创建时间', type: 'text', width: 130 },
      ]
      const columns10 = [
        { prop: 'srcCurrency', label: '原币种', type: 'text' },
        { prop: 'toCurrency', label: '核销币种', type: 'text' },
        { prop: 'lowerRate', label: '最低汇率', type: 'text' },
        { prop: 'upperRate', label: '最高汇率', type: 'text' },
        { prop: 'settlementRate', label: '结算汇率', type: 'text' },
      ]
      let scenesCode
      if (!this.source) {
        scenesCode = 'reg_fee_order_fee_list'
        this.selfColumnsBase = columns1
      } else {
        scenesCode = 'reg_settle_order_fee_list'
        this.selfColumnsBase = [
          {
            prop: 'sourceBizNo',
            label: '单号',
            type: 'button',
            key: 'sourceBizNo',
            width: '140px',
            formatter: ({ cellValue, column, row, item }) => row.sourceBizNo || row.finBillNo,
            operationBtns: {
              show: true,
              callback: (fn, index, row, option) => this.showDetail(row),
            },
          },
          { prop: 'settleCompName', label: '分公司', type: 'text', key: 'settleCompName', width: 150 },
          { prop: 'settleCorpName', label: '结算单位', type: 'text', key: 'settleCorpName' },
          { prop: 'settleOrderNo', label: '结算单号', type: 'text', key: 'settleOrderNo' },
          { prop: 'feeName', label: '费用名称', type: 'text', key: 'feeName' },
          { prop: 'feeEnName', label: '费用英文名', type: 'text', key: 'feeEnName' },
          { prop: 'receipayType', label: '应收应付', type: 'select', readOnly: true, width: 100 },
          { prop: 'currency', label: '原币种', type: 'text', key: 'currency' },
          { prop: 'feeAmt', label: '原金额', type: 'text', key: 'feeAmt' },
          { prop: 'writeoffBalanceAmt', label: '可核销金额', type: 'text', disabled: true, key: 'writeoffBalanceAmt' },
          {
            prop: 'writeoffFeeAmt',
            label: '核销金额',
            type: 'input',
            disabled: true,
            key: 'writeoffFeeAmt',
            maxlength: '16',
            validateInput: (value, row, pItem, changeE) => {
              if (!value) return
              if (!/^-?(\d+(\.\d{0,2})?)?$/.test(value)) {
                !this.debounceLsFn() && this.$msgErrClose('请输入正确的数字！')
                let res = /^-?(\d+(\.\d{0,2})?)?/.exec(row[pItem.prop])
                row[pItem.prop] = res && res[0]
              }
            },
          },
          {
            prop: 'lessPayAmt',
            label: '短款金额',
            disabled: true,
            type: 'input',
            key: 'lessPayAmt',
            maxlength: '16',
            validateInput: (value, row, pItem, changeE) => {
              if (!value) return
              if (!/^-?(\d+(\.\d{0,2})?)?$/.test(value)) {
                !this.debounceLsFn() && this.$msgErrClose('请输入正确的数字！')
                let res = /^-?(\d+(\.\d{0,2})?)?/.exec(row[pItem.prop])
                row[pItem.prop] = res && res[0]
              }
            },
          },
          { prop: 'settleCurrency', label: '结算币种', type: 'text', key: 'settleCurrency' },
          { prop: 'settleExRate', label: '结算汇率', type: 'text', key: 'settleExRate' },
          { prop: 'settleAmt', label: '结算金额', type: 'text', key: 'settleAmt' },
          { prop: 'writeoffCurrency', label: '折币币种', type: 'text', key: 'writeoffCurrency' },
          { prop: 'writeoffExRate', label: '核销汇率', type: 'text', key: 'writeoffExRate' },
          { prop: 'writeoffAmt', label: '折币金额', type: 'text', key: 'writeoffAmt' },
          { prop: 'serviceName', label: '服务项', type: 'text', key: 'serviceName' },
          { prop: 'feeUnit', label: '计费单位', type: 'text', formatter: ({ cellValue }) => this.dictMapObj.feeUnit[cellValue] },
          { prop: 'unitPrice', label: '单价', type: 'text', key: 'unitPrice' },
          { prop: 'unitCount', label: '数量', type: 'text', key: 'unitCount' },
          { prop: 'invoiceNo', label: '发票号', width: 86, type: 'text' },
          { prop: 'finDate', label: '财务日期', width: 86, type: 'text' },
        ]
      }
      this.configColumns.splice(0, 1000, ...this.selfColumnsBase.map((item) => item.prop))
      this.option1.columns = [...this.selfColumnsBase]
      listColumnConfigGet({ scenesCode }).then((res) => {
        this.columnConfig = true
        this.dealCustomColumn(res)
      })
      this.option6.columns = columns6
      this.option7.columns = columns7
      this.option10.columns = columns10
      const operationBtns11 = Object.assign({}, this.option.operationBtns, {
        width: 150,
        data: [
          {
            label: '修改',
            type: 'text',
            action: 'Edit',
            showFn: (row) => !row.edit,
          },
          {
            label: '保存',
            type: 'text',
            action: 'Save',
            showFn: (row) => row.edit,
          },
          {
            label: '删除',
            type: 'text',
            action: 'Delete',
            show: true,
          },
        ],
        fixed: 'right',
        show: true,
        callback: (action, $index, row, option) => {
          if (action === 'Edit') {
            this.option11.data[$index].edit = true
          } else if (action === 'Save') {
            // 总金额验证
            // const total = this.option11.data.reduce((pre, cur) => (pre += Number(cur.internalDzgAmt)), 0)
            const total = this.option11.data.reduce((pre, cur) => new LSnum(pre).plus(cur.internalDzgAmt).toNum(2), 0)
            if (total > this.totalAmt - this.regInfoForm.realAmt) {
              return this.$msgErrClose('转移总金额不能大于剩余未用金额！')
            } else {
              this.option11.data[$index].edit = false
            }
          } else if (action === 'Delete') {
            this.$confirmWarn('是否确认删除？', () => {
              this.option11.data.splice($index, 1)
            })
          }
        },
      })
      this.option11 = Object.assign({}, this.option, {
        id: 'option11',
        $name: 'WriteoffRecvDetail11',
        data: [],
        tips: false,
        selection: false,
        pagination: false,
        operationBtns: operationBtns11,
        index: { show: true },
        edit: true,
        columns: [
          {
            prop: 'dzgCompCode',
            label: '大掌柜',
            type: 'select',
            propInDict: 'dzgCompCode',
            change: (value, row, rowIndex) => {
              this.changeDzgComName(row, value)
            },
          },
          { prop: 'currency', label: '币种', type: 'text' },
          {
            prop: 'internalDzgAmt',
            label: '金额',
            type: 'input',
            inputType: 'number',
            // validateInput: (val, row, item, change) => {
            //   if (change && val) {
            //     if (!/^\d+(\.\d{0,2})?$/.test(val)) {
            //       this.$msgErrClose('请输入正确的金额！')
            //       let res = /^-?(\d+(\.\d{0,2})?)?/.exec(row[item.prop])
            //       row[item.prop] = res && res[0]
            //     }10000
            //   }
            // },
          },
          { prop: 'dzgWriteoffNo', label: '核销编号', type: 'input', needTrim: true },
        ],
        handleCellClick: ({ row, column, triggerCheckbox, rowIndex, columnIndex, $event }) => {
          $event.stopPropagation()
          this.option11.data[rowIndex].edit = true
        },
      })
    },
    changeDzgComName(row, value) {
      row['dzgCompName'] = this.dictMapObj['dzgCompCode'][value.toLowerCase()]
    },
    getData() {
      let res = localStorage.getItem('_feeToRegParams')
      let data = ((res && JSON.parse(res)) || {}).data
      console.log(data)
      this.agentCompCodeBackup = data.agentCompCode
      this.regInfoForm = Object.assign({}, defaultCreateQuery, data)
      this.bankAccountSettleModeList = []
      // this.bankAccountSettleModeList = data.settleModeList.map((item) => {
      //   let dict = this.dictMap.bankAccountSettleMode
      //   return dict.find((v) => v.value === item)
      // })
      this.$nextTick(() => {
        this.settleOrderBuildType = false
        this.$refs.regInfoForm.clearValidate()
      })
      let list = data.feeList || []
      if (!list.length) {
        return this.$msgErrClose('费用列表不能为空！')
      }

      if (!this.source) {
        this.CURRENCY = this.dictMap['validCurrency'].filter((v) => v.value != 'ORIGINAL')
      } else {
        this.CURRENCY = [...new Set(list.map((v) => v.settleCurrency))].map((v) => ({ label: v, value: v }))
        if (this.CURRENCY.length > 1) {
          this.regInfoForm.currency = ''
        } else {
          this.regInfoForm.currency = list[0].settleCurrency
        }
      }
      this.option1.data = list.map((v) => ({ ...v, edit: true, writeoffCurrency: this.regInfoForm.currency }))
      actualExchangeRate({ rateType: 'receive' }).then((res) => {
        this.exchageRateList = res.data
        this.viaWriteoffCurrencySetRate(true)
      })
    },
    viaWriteoffCurrencySetRate(isFirst) {
      // 根据收款币种设置汇率
      if (this.exchageRateList.length === 0) return
      const value = this.regInfoForm.currency // 核销币种
      // 不存在币种，以下计算不必要
      if (!value) return
      if (this.source) {
        this.option1.data = this.option1.data.map((v) => ({
          ...v,
          writeoffCurrency: value,
          invisible: v.settleCurrency !== value,
        }))
      } else {
        this.option1.data = this.option1.data.map((v) => ({ ...v, writeoffCurrency: value }))
      }

      const currencys = [...new Set(this.option1.data.filter((v) => !v.invisible).map((item) => item.currency))] // 费用列表原币种
      const differentCurrencys = currencys.filter((item) => item !== value)
      let feeData = this.option1.data
      if (differentCurrencys.length > 0) {
        const exchageRateList = this.exchageRateList.filter((item) => {
          return differentCurrencys.some((currency) => currency === item.srcCurrency && value === item.toCurrency)
        })
        this.regInfoForm.exchangeRates = exchageRateList.map((item) => {
          let find = feeData.find((fee) => fee.currency === item.srcCurrency)
          let rate = (this.source && find && find.settleExRate) || item.rate
          return {
            srcCurrency: item.srcCurrency,
            toCurrency: item.toCurrency,
            systemRate: item.srcCurrency + '-' + item.toCurrency + ' ' + rate,
            settlementRateTitle: item.srcCurrency + '-' + item.toCurrency,
            settlementRate: rate,
            exchangeRateId: item.exchangeRateId,
            lowerRate: item.lowerRate,
            upperRate: item.upperRate,
            edit: true,
          }
        })
      } else {
        this.regInfoForm.exchangeRates = currencys.map((item) => {
          return {
            srcCurrency: item,
            toCurrency: item,
            systemRate: item + '-' + item + ' ' + 1,
            settlementRateTitle: item + '-' + item,
            settlementRate: 1,
            exchangeRateId: '',
            lowerRate: 1,
            upperRate: 1,
            edit: true,
          }
        })
      }
      this.rateChange()
      if (isFirst || this.source) {
        this.regInfoForm.realAmt = this.option1.data
          .filter((v) => !v.invisible)
          .reduce((pre, cur) => {
            return new LSnum(pre).plus(new LSnum(cur.writeoffBalanceAmt).times(cur.writeoffExRate || 1).toNum(2)).toNum(2)
          }, 0)
      }
      this.writeoffGatherChange()
      this.option10.data = JSON.parse(
        JSON.stringify(
          this.regInfoForm.exchangeRates.map((item) => {
            let { settlementRateTitle, settlementRate } = item
            let currencys = settlementRateTitle.split('-')
            return {
              lowerRate: item.lowerRate,
              upperRate: item.upperRate,
              srcCurrency: currencys[0],
              toCurrency: currencys[1],
              settlementRate,
            }
          })
        )
      )
    },
    rateChange(isForce) {
      if (!this.regInfoForm.currency) return
      let exchangeRates = this.regInfoForm.exchangeRates
      this.option1.data = this.option1.data.map((item) => {
        if (item.invisible) return item
        let { currency, writeoffCurrency } = item
        if (currency === writeoffCurrency) {
          return { ...item, writeoffExRate: 1 }
        }
        let rateCfg = exchangeRates.find((rate) => rate.srcCurrency === currency && rate.toCurrency === writeoffCurrency)
        return { ...item, writeoffExRate: isForce ? rateCfg.settlementRate : item.settleExRate || rateCfg.settlementRate }
      })
    },
    // 费用列表 核销汇总的计算
    writeoffGatherChange() {
      let list = this.option1.data.filter((item) => !item.invisible)
      let currencys = [...new Set(list.map((item) => item.currency))]
      this.originalGather = currencys.map((item) => {
        return {
          currency: item,
          amt: list.reduce((sum, cur) => (item === cur.currency ? sum.plus(cur.writeoffFeeAmt) : sum), BIGZERO).val,
          isPay: false,
        }
      })

      this.exchangeGather = [
        {
          currency: this.exchangeCurrency,
          amt: list.reduce((sum, cur) => {
            return new LSnum(sum).plus(new LSnum(cur.writeoffFeeAmt).times(cur.writeoffExRate || 1).toNum(2)).toNum(2)
          }, 0),
          isPay: false,
        },
      ]
    },
    // 导入费用
    importFeesAction3() {
      if (this.multipleSelection7.length === 0) {
        return this.$msgErrClose('请勾选需导入的费用！')
      }
      // let confirmNos = this.multipleSelection7.filter((v) => v.confirmStatus === 'no').map((v) => v.sourceBizNo)
      // if (confirmNos.length) {
      //   return this.$msgErrClose(`单号${confirmNos.toString()}未确认，请选择已确认的项进行操作`, 5000)
      // }
      const settleOrderFeeIdArr = this.option1.data.map((item) => item.feeId)
      this.multipleSelection7.forEach((item) => {
        if (!settleOrderFeeIdArr.includes(item.feeId)) {
          const data = Object.assign({}, item, {
            writeoffCurrency: this.exchangeCurrency,
            writeoffFeeAmt: 0,
            lessPayAmt: 0,
            edit: true,
          })
          this.option1.data.push(data)
        }
      })
      this.viaWriteoffCurrencySetRate() // 重新计算汇率
      this.$msgSucClose('导入费用成功！')
      this.writeoffFeeAmtData()
      this.closeWriteoffFee()
    },
    // 计算费用列表核销金额 带默认值核销金额
    writeoffFeeAmtData() {
      // setTimeout(() => {
      if (!this.regInfoForm.currency) return
      const data = []
      let totalAmt = this.totalAmt || 0
      this.option1.data.forEach((item) => {
        if (totalAmt < 0) return
        if (item.invisible) {
          return data.push(0)
        }
        let amt = new LSnum(item.writeoffBalanceAmt)
        let writeoffAmt = amt.times(item.writeoffExRate || 1) // 核销金额
        if (writeoffAmt.minus(totalAmt).valueOf() > 0) {
          // 原币核销金额 = 核销汇率/汇率
          let feeWriteAmt = new LSnum(totalAmt).div(item.writeoffExRate || 1).toNum(2)
          data.push(feeWriteAmt)
          totalAmt = 0
        } else {
          data.push(item.writeoffBalanceAmt || 0)
          totalAmt = new LSnum(totalAmt).minus(writeoffAmt).toNum(2)
        }
      })
      this.option1.data = this.option1.data.map((item, index) => ({ ...item, writeoffFeeAmt: data[index] }))
      // }, 800)
    },
    writeoffAction() {
      this.$refs.regInfoForm.validate((valid) => {
        if (!valid) return
        if (this.regInfoForm.realAmt - 0 <= 0) {
          return this.$msgErrClose('收款金额必须大于0！')
        }
        if (!this.option1.data.filter((v) => !v.invisible).length) {
          return this.$msgErrClose('费用列表不能为空！')
        }
        if (!this.regInfoForm.balanceDealType && this.unusedAmt > 0) {
          return this.$msgErrClose('剩余未用金额大于0，剩余款项处理，必填！')
        }
        console.log(this.unusedAmt)
        if (this.unusedAmt < 0) {
          return this.$msgErrClose('核销费用总和大于可用核销金额，请调整核销费用！')
        }
        let arrSet = [...new Set(this.option1.data.filter((v) => !v.invisible).map((v) => v.settleCompCode))]

        let str = ''
        let isGroup = arrSet.length > 1 || arrSet[0] !== this.$store.state.user.userInfo.settleCompanyCode
        let feeCodeArr = [...new Set(this.option1.data.map((v) => v.feeCode))]
        if (feeCodeArr.length > 1 && feeCodeArr.includes('TZFY')) {
          return this.$msgErrClose('调整费用不能与其它费用一起核销！')
        }
        if (isGroup && !this.source) {
          str += '本次核销的费用将生成集团结算单，'
        }
        if (feeCodeArr[0] === 'TZFY') {
          str = (str ? str + '且' : '') + '本次费用为调整费用，'
        }
        if (this.regInfoForm.noWriteoffHasInvoice == 'yes') {
          str = (str ? str + '且' : '') + '本次未核销用可补开票您选择的“是”，'
        }
        if (this.recvCompCode !== this.$store.state.user.userInfo.settleCompanyCode && this.hasIntrabranch != 'yes') {
          str = (str ? str + '且' : '') + '当前操作分公司与收款账户所属分公司不一致，将会生成分公司间代收款单，'
        }
        str += '是否确定对该收款登记进行核销？'
        console.log(feeCodeArr)
        this.$confirmWarn({ body: str, confirm: '是', cancel: '否' }, () => {
          this.checkRecvWriteoffOverduePayment(true, isGroup ? 'group' : 'signal')
        })
      })
    },
    checkRecvWriteoffOverduePayment(item, type) {
      checkRecvWriteoffOverduePayment({
        settleCompCode: this.recvCompCode,
        settleCorpCode: this.regInfoForm.settleCorpCode,
        recviceDate: this.regInfoForm.recvDate,
        feeIds: this.option1.data.map(v => v.feeId),
      }).then((res) => {
        if (res.data) {
          this.$confirmWarn(res.data, () => this.writeoffSubmit(item, type))
        } else {
          this.writeoffSubmit(item, type)
        }
      })
    },
    writeoffSubmit(isSettleOrderBuildType, settleOrderBuildType) {
      this.loading = true
      let method = this.source ? settleOrderWriteoff : quickRecvWriteoff
      let data = {
        ...this.regInfoForm,
        writeoffItemList: this.option1.data
          .filter((v) => !v.invisible)
          .map((item) => ({ ...item, currency: item.writeoffCurrency })),
        writeoffReceipayTransferDzgList: this.option11.data || [],
        settleOrderBuildType: isSettleOrderBuildType ? settleOrderBuildType : '',
      }
      method(data)
        .then((res) => {
          this.$msgSucClose('核销成功！')
          this.refreshView(
            this.source === 'settleOrder'
              ? this.source === 'invoiceList'
                ? 'InvoiceReceivable'
                : 'SettlementList'
              : 'SettlementFeeList',
            'from'
          )
          // 显示分摊手续费
          const dzgList = res.data.writeoffReceipayTransferDzgList || []
          if (dzgList.length) {
            this.transferFeeOption.data = dzgList
            this.transferFeeOption.show = true
            // 保存跳转参数
            let { writeoffReceipayNo, writeoffReceipayId, receivableRegId } = res.data
            this.transferFeeOption.routerData = { writeoffReceipayNo, writeoffReceipayId, receivableRegId }
            return
          } else {
            let { writeoffReceipayNo, writeoffReceipayId, receivableRegId } = res.data
            const params = { writeoffNo: writeoffReceipayNo }
            const query = { receivableRegId, writeoffReceipayId, source: 'writeoffRecv', back: 2 }
            this.delVisitedView()
            this.routerPush('WriteoffRecvDetail2', query, false, params)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleDelete($index, row, option) {
      this.$confirmWarn('是否确认删除？', () => {
        this.option1.data.splice($index, 1)
        this.writeoffFeeAmtData()
      })
    },
    cancel(refresh) {
      this.routerBack(refresh)
    },
    sendMulti(data, option) {
      if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option7) this.multipleSelection7 = data
    },
    // 跳转至详情页
    showDetail(row) {
      if (!row.sourceBizNo && !row.feeSourceType) {
        return this.$message.error('单号不能为空！')
      }
      this.showOneNoDetail('sourceBizNo', row.sourceBizNo)
    },
    // 提交汇率
    submitRate() {
      let error = false
      let data = this.option6.data
      if (!this.source) {
        for (let i = 0; i < data.length; i++) {
          const item = data[i]
          if (item.settlementRate < item.lowerRate) {
            this.$msgErrClose(`${item.srcCurrency}-${item.toCurrency}的汇率不能低于汇率下限${item.lowerRate}`)
            error = true
            break
          }
          if (item.settlementRate > item.upperRate) {
            this.$msgErrClose(`${item.srcCurrency}-${item.toCurrency}的汇率不能高于汇率上限${item.upperRate}`)
            error = true
            break
          }
        }
        if (error) return false
      }
      this.regInfoForm.exchangeRates = this.option6.data
      this.rateDialogOpen = false
      this.source && this.changeMultipleRate()
    },
    // 一键修改汇率
    changeRate() {
      const len = this.multipleSelection1.length
      if (!len) {
        return this.$msgErrClose('请先勾选数据再修改汇率！')
      }
      const data = []
      const len2 = this.regInfoForm.exchangeRates.length
      this.multipleSelection1.forEach((item) => {
        for (let i = 0; i < len2; i++) {
          const ele = this.regInfoForm.exchangeRates[i]
          if (item.currency === ele.srcCurrency && item.settleCurrency === ele.toCurrency) {
            if (!data.includes(ele)) {
              ele.settlementRate = item.writeoffExRate
              ele.edit = ele.srcCurrency !== ele.toCurrency
              data.push(ele)
            }
            break
          }
        }
      })
      this.option6.data = JSON.parse(JSON.stringify(data))
      this.rateDialogOpen = true
    },
    // 修改费用列表汇率
    changeMultipleRate() {
      const len = this.option6.data.length
      this.option1.data.forEach((item) => {
        for (let index = 0; index < len; index++) {
          const ele = this.option6.data[index]
          if (item.currency === ele.srcCurrency && item.settleCurrency === ele.toCurrency) {
            item.writeoffExRate = ele.settlementRate
            item.writeoffAmt = new LSnum(item.writeoffFeeAmt).times(item.writeoffExRate || 1).toNum(2)
            break
          }
        }
      })
      this.regInfoForm.exchangeRates.forEach((item) => {
        for (let index = 0; index < len; index++) {
          const ele = this.option6.data[index]
          if (item.srcCurrency === ele.srcCurrency && item.toCurrency === ele.toCurrency) {
            item.settlementRate = ele.settlementRate
            break
          }
        }
      })
      this.closeRateDialog()
    },
    // 关闭汇率弹窗
    closeRateDialog() {
      this.rateDialogOpen = false
    },
    // 费用代码下拉列表自动补充的数据
    feeItemQuerySearch(queryString, item) {
      baseFeeItemList(queryString).then((response) => {
        item.remoteSelectList = response.data.map((item) => {
          return {
            label: `${item.feeName}`,
            value: item.feeCode,
          }
        })
      })
    },
    handleSizeChange(val) {
      if (!this.writeoffFeeDialog) return
      this.option7.pagination.pageSize = val
      this.settleOrderFeeList()
    },
    handleCurrentChange(val, isActive) {
      if (!this.writeoffFeeDialog) return
      this.option7.pagination.currPage = val
      this.settleOrderFeeList()
    },
    // 获取费用列表
    settleOrderFeeList(isFirst) {
      if (isFirst === 'isFirst') {
        this.option7.pagination.currPage = 1
        this.option7.pagination.pageSize = 100
        this.option7.pagination.totalCount = 0
      }
      const data = {
        columns: [],
        ascColumns: [],
        descColumns: ['createdTime'],
        currPage: this.option7.pagination.currPage,
        pageSize: this.option7.pagination.pageSize,
        query: [
          { column: 'canSettleApplyAmtMin', type: 'eq', value: '0.01' },
          { column: 'receipayType', type: 'eq', value: 'receive' },
          { column: 'settleCorpCodes', type: 'in', value: [this.regInfoForm.settleCorpCode] },
        ],
      }
      for (const column in this.searchOption3.data) {
        if (column === 'settleCorpName') continue
        if (Object.hasOwnProperty.call(this.searchOption3.data, column)) {
          const value = this.searchOption3.data[column]
          if (value) {
            data.query.push({
              column: column === 'sourceBizNos' ? 'sourceBizNo' : column,
              type: 'like',
              value: value.replace(/[\s+,+，+]+/g, ' '),
            })
          }
        }
      }
      settleOrderFeeList(data).then((res) => {
        this.searchOption3.data.settleCorpName = this.regInfoForm.settleCorpName
        this.option7.data = res.data.list.map((item) => ({ ...item, writeoffBalanceAmt: item.canSettleApplyAmt }))
        this.writeoffFeeDialog = true

        // 勾选费用
        const feeIds = this.option1.data.map((item) => item.feeId)
        this.$nextTick(() => {
          this.option7.data.forEach((item) => {
            if (feeIds.includes(item.feeId)) {
              this.$refs.multipleTable7.setCheckRow(item, true)
            }
          })
        })
        Object.assign(this.option7.pagination, res.data)
        // this.option7.pagination.currPage = res.data.currPage
        // this.option7.pagination.pageSize = res.data.pageSize
        // this.option7.pagination.totalCount = res.data.totalCount
      })
    },
    // 关闭费用列表
    closeWriteoffFee() {
      this.writeoffFeeDialog = false
      // 清空搜索值
      const obj = this.searchOption3.data
      Object.keys(obj).forEach((key) => (obj[key] = ''))
    },
    // 更多汇率
    showExchangeRates() {
      this.exchangeRatesDialog = true
    },
    // 转大掌柜余额
    transferDzg() {
      if (this.regInfoForm.currency !== this.exchangeCurrency) {
        return this.$msgErrClose('折币核销不支持同时转大掌柜')
      }
      if (this.unusedAmt > 0) {
        const len = this.option11.data.length
        let totalDzg = 0
        if (len) {
          this.transferOption.data = this.option11.data.map((item) => Object.assign({}, item, { edit: true }))
          totalDzg = this.option11.data.reduce((pre, cur) => pre.plus(cur.internalDzgAmt), BIGZERO).toNum(2)
        } else {
          this.transferOption.data = [{ dzgCompCode: '', internalDzgAmt: '', dzgWriteoffNo: '', edit: true }]
        }
        this.transferOption.unusedAmt = new LSnum(this.unusedAmt).plus(totalDzg).toNum(2)
        this.transferOption.show = true
      } else {
        return this.$msgErrClose('剩余未用金额不足，无法转大掌柜')
      }
    },
    submitTransfer(data, total) {
      this.option11.data = data.map((item) =>
        Object.assign({}, item, {
          currency: this.regInfoForm.currency,
          dzgCompName: this.dictMapObj.dzgCompCode[item.dzgCompCode.toLowerCase()],
          edit: false,
        })
      )
      this.closeTransfer()
    },
    closeTransfer() {
      this.transferOption.show = false
    },
    saveDzg() {
      if (!this.option11.data) return
      let list = this.option11.data.filter((item) => item.edit)
      if (list.length > 0) {
        const total = +this.option11.data.reduce((pre, cur) => pre.plus(cur.internalDzgAmt), new LSnum()).valueOf()
        if (total > new LSnum(this.totalAmt).minus(this.gatherFee).toNum(2)) {
          return this.$msgErrClose('转移总金额不能大于剩余未用金额！')
        } else {
          this.option11.data.forEach((item) => (item.edit = false))
        }
      }
    },
    // 分摊手续费
    closeFee() {
      this.transferFeeOption.show = false
      let { writeoffReceipayNo, writeoffReceipayId, receivableRegId } = this.transferFeeOption.routerData
      const params = { writeoffNo: writeoffReceipayNo }
      const query = { receivableRegId, writeoffReceipayId, source: 'writeoffRecv' }
      this.routerPush('WriteoffRecvDetail2', query, false, params)
    },
    //收款银行
    bankAccountList(accountShortName) {
      // 'regInfoForm.recvWay'  chinese_mainland国内 hk_china香港 abroad海外 cheque支票 intrabranch内部往来
      let recvWay = this.regInfoForm.recvWay
      let data = {
        unitCode: this.agentCompCodeBackup || this.$store.state.user.userInfo.settleCompanyCode,
        currency: this.regInfoForm.currency,
        accountShortName,
        status: 'effect',
        receipayType: 'receive',
        // hasChequeAcct: recvWay === 'cheque' ? 'yes' : '', // 是否支票账户
        countryOrgType: ['cheque', 'intrabranch'].includes(recvWay) ? '' : recvWay, // 区域
        hasIntrabranch: recvWay === 'intrabranch' ? 'yes' : 'no', // 是否内部往来
      }
      bankAccountList(data).then((res) => {
        this.bankAccountSelectOptions = (res.data || []).map((item) => ({
          ...item,
          value: item.settleUnitBankAcctId,
          label: item.accountShortName,
        }))
      })
    },
    // 查看汇率
    checkExchangeRage() {
      let list = JSON.parse(JSON.stringify(this.regInfoForm.exchangeRates))
      this.option6.data = list.map((item) => ({ ...item, edit: item.srcCurrency !== item.toCurrency }))
      this.rateDialogOpen = true
    },
    // 搜索国家
    getCountryList(countryCode) {
      countrySelectList({ countryCode, state: 'valid' }).then((res) => {
        this.COUNTRYLIST = (res.data || []).map((item) => {
          return { cname: item.cname, ename: item.ename, value: item.countryCode }
        })
      })
    },
    // 选中国家
    selectCountry(countryCode) {
      if (!countryCode) return (this.regInfoForm.payAccountCountryName = '')
      let find = this.COUNTRYLIST.find((item) => item.value === countryCode)
      this.regInfoForm.payAccountCountryName = find.cname
    },
    // 本地上传显示
    sendFileList(data) {
      console.log(data)
      let { filePath = '', name = '', fileNo = '' } = data
      Object.assign(this.regInfoForm, { bankseqFilePath: filePath, bankseqFileName: name, bankseqFileCode: fileNo })
    },
    // 本地上传显示
    sendFileList2(data) {
      console.log(data)
      let { filePath = '', name = '', fileNo = '' } = data
      Object.assign(this.regInfoForm, { payBankseqFilePath: filePath, payBankseqFileName: name, payBankseqFileNo: fileNo })
    },
    // 自定义表头
    customColumnsPopClose(action, value) {
      this.customColumnsPopShow = false
      if (action === 'Confirm') {
        let columnList = this.getColumnsValues(value) // getColumnsValues在本页面无作用
        let scenesCode = !this.source ? 'reg_fee_order_fee_list' : 'reg_settle_order_fee_list'
        listColumnConfigSave({ columnList, scenesCode }).then((res) => {
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
    // 手动修改收款金额
    realAmtInput() {
      this.writeoffFeeAmtData()
    },
  },
  activated() {
    if (this.$route.meta.close) return
    if (!this.$route.meta.isUseCache) {
      Object.assign(this.regInfoForm, defaultCreateQuery)
      console.log(defaultCreateQuery)
      // this.source 当前值有三种, invoiceList, settleOrder, undefined
      // invoiceList 从发票列表进入，存到本地的参数、逻辑、核销接口同settleOrder
      // settleOrder 从结算单列表进入
      // undefined 从费用列表进入，逻辑、核销接口单独处理
      this.source = this.$route.query.source
      this.orderType = this.$route.query.orderType
      // this.watchFormExchangeRatesTime = 0
      this.init()
      this.getData()
    }
  },
  deactivated() {
    clearData(SETTLECROPLIST)
    // this.exchangeCurrency = ''
    // this.exchangeAmt = ''
  },
  components: { FinanceTable, CustomColumns, FinanceSearch, TransferDzg, TransferFee, FinUploadEmbed },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    // 可用核销金额
    totalAmt() {
      // 结算单收款登记初始化没有币种，此时短款金额应为空
      if (!this.regInfoForm.currency) return ''
      return new LSnum(this.regInfoForm.realAmt).plus(this.regInfoForm.innerTransferFee).toNum(2)
    },
    // 剩余未用金额
    unusedAmt() {
      // 结算单收款登记初始化没有币种，此时短款金额应为空
      if (!this.regInfoForm.currency) return ''
      return new LSnum(this.totalAmt).minus(this.gatherFee).minus(this.dzgFee).toNum(2)
    },
    // 客户短款金额
    lessPayAmt() {
      let writeoffCurrency = this.regInfoForm.currency
      // 结算单收款登记初始化没有币种，此时短款金额应为空
      if (!writeoffCurrency) return ''
      let filterData = this.option1.data.filter((v) => !v.invisible)
      if (filterData.every((v) => v.currency === writeoffCurrency)) {
        return filterData.reduce((pre, cur) => new LSnum(pre).plus(cur.lessPayAmt).toNum(2), 0)
      }
      return filterData.reduce((pre, cur) => {
        return new LSnum(pre).plus(new LSnum(cur.lessPayAmt).times(cur.writeoffExRate || 1).toNum(2)).toNum(2)
      }, 0)
    },
    // 费用列表折币金额合计
    gatherFee() {
      // 结算单收款登记初始化没有币种，此时费用列表折币金额应为空
      if (!this.regInfoForm.currency) return ''
      return this.option1.data
        .filter((v) => !v.invisible)
        .reduce((pre, cur) => pre.plus(new LSnum(cur.writeoffFeeAmt).times(cur.writeoffExRate || 1).toNum(2)), BIGZERO).num
    },
    // 大掌柜金额合计
    dzgFee() {
      return this.option11.data.reduce((pre, cur) => new LSnum(pre).plus(cur.internalDzgAmt).toNum(2), 0)
    },
  },
  watch: {
    hasFixedTransferFee: {
      handler(val) {
        if (val) {
          this.fixedTransferFeeRules.required = true
        } else {
          this.fixedTransferFeeRules.required = false
        }
      },
      immediate: true,
    },
    recvNeedBankseqBoolean: {
      handler(val) {
        this.recvNeedBankseqRules.required = val
      },
      immediate: true,
    },
    'regInfoForm.compBankAccountId': {
      handler(val) {
        if (val) {
          let find = this.bankAccountSelectOptions.find((item) => item.value === val)
          this.recvNeedBankseqBoolean = find.recvNeedBankseq === 'yes'
          this.hasFixedTransferFee = find.hasFixedTransferFee === 'yes' && find.bankCode === 'B0249H231000001'
          if (this.hasFixedTransferFee) {
            getFixedTranferFeeList({ currency: this.regInfoForm.currency }).then((res) => {
              this.regInfoForm.fixedTransferFee = res.data[this.regInfoForm.currency] || ''
            })
          } else {
            this.regInfoForm.fixedTransferFee = ''
          }
          // console.log(find)
          // 普通 normal, 专项 special 坏账 bad_debt    代收付 agent 集团 group 集团专项 group_special
          // hasIntrabranch: "no"
          // hasShare: "no"
          console.log(this.orderType, ['agent', 'group', 'group_special'].includes(this.orderType))
          console.log(find.companyCode, this.$store.state.user.userInfo.settleCompanyCode, find.hasIntrabranch)
          // 暂改为提交时由后端提醒 20211217
          // if (this.orderType && ['agent', 'group', 'group_special'].includes(this.orderType)) {
          //   if (find.companyCode !== this.$store.state.user.userInfo.settleCompanyCode && find.hasIntrabranch !== 'yes') {
          //     this.regInfoForm.compBankAccountId = this.recvCompName = this.recvCompCode = this.hasIntrabranch = ''
          //     return this.$msgErrClose('不能选择共享的非内部往来账户！')
          //   }
          // }

          // this.regInfoForm.settleMode = ''
          this.bankAccountSettleModeList = find.settleMode.map((item) => {
            let dict = this.dictMap.bankAccountSettleMode
            return dict.find((v) => v.value === item)
          })
          this.regInfoForm.settleMode = this.bankAccountSettleModeList[0] ? this.bankAccountSettleModeList[0].value : ''
          if (this.regInfoForm.hasIntrabranch === 'yes') {
            this.recvCompName = this.$store.state.user.userInfo.settleCompanyName
            this.recvCompCode = this.$store.state.user.userInfo.settleCompanyCode
          } else {
            this.recvCompName = find.companyName
            this.recvCompCode = find.companyCode
          }
          this.hasIntrabranch = find.hasIntrabranch
        } else {
          this.recvCompName = this.recvCompCode = this.hasIntrabranch = ''
          this.hasFixedTransferFee = this.regInfoForm.fixedTransferFee = ''
          this.recvNeedBankseqBoolean = false
        }
      },
      immediate: true,
    },
    'regInfoForm.currency'(val) {
      this.exchangeCurrency = val
    },
    'option1.data': {
      handler(newVal, oldVal) {
        if (newVal && newVal.length === 0) {
          this.originalGather = this.exchangeGather = []
        }
        if (!this.regInfoForm.currency) {
          this.originalGather = this.exchangeGather = []
          return
        }
        clearTimeout(this.timer1)
        this.timer1 = setTimeout(() => {
          this.option1.data
            .filter((v) => !v.invisible)
            .forEach((item) => {
              //  核销金额输入框
              item.writeoffAmt = new LSnum(item.writeoffFeeAmt).times(item.writeoffExRate || 1).toNum(2) // 联动折算金额
              // 短款金额
              let writeoffAmt = (item.writeoffBalanceAmt * 100 - item.writeoffFeeAmt * 100) / 100
              if (Number(item.lessPayAmt) > 0) {
                if (Number(item.lessPayAmt) > writeoffAmt) {
                  // 单条费用的校验
                  this.$msgErrClose('短款金额+核销金额不能大于可核销金额！')
                  item.lessPayAmt = ''
                }
              } else if (Number(item.lessPayAmt) < 0) {
                if (Number(item.lessPayAmt) < writeoffAmt) {
                  // 单条费用的校验
                  this.$msgErrClose('短款金额+核销金额不能大于付于可核销金额！')
                  item.lessPayAmt = ''
                }
              }
            })
          this.writeoffGatherChange()
        }, 100)
      },
      deep: true,
    },
    'regInfoForm.exchangeRates': {
      // 当用户输入自定义核销汇率时，联动各个费用合计
      handler(newVal, oldVal) {
        if (++this.watchFormExchangeRatesTime === 1) return
        clearTimeout(this.timer2)
        this.timer2 = setTimeout(() => {
          if (this.regInfoForm.exchangeRates.length) {
            this.rateChange(true)
            this.writeoffFeeAmtData()
          }
        }, 100)
      },
      deep: true,
    },
    // 收款方式
    'regInfoForm.recvWay': {
      handler(val, oldVal) {
        // regInfoFormRules: {
        //   recvWay: { required: true, message: ' ', trigger: 'change' },
        //   compBankAccountId: { required: true, message: ' ', trigger: 'change' },
        //   // bankSeqNo: { required: true, message: ' ', trigger: 'change' },
        //   recvDate: { required: true, message: ' ', trigger: 'change' },
        //   currency: { required: true, message: ' ', trigger: 'change' },
        //   realAmt: { required: true, message: ' ', trigger: 'change' },
        //   payAccountName: { required: true, message: ' ', trigger: 'change' },
        //   payAccountPublicType: { required: true, message: ' ', trigger: 'change' },
        //   writeoffDate: { required: true, message: ' ', trigger: 'change' },
        // },
        this.regInfoForm.compBankAccountId = this.regInfoForm.recvCompName = ''
        this.regInfoForm.settleMode = ''
        this.bankAccountSettleModeList = []
        if (val === 'intrabranch') {
          this.regInfoFormRules.settleMode.required = false
        } else {
          this.regInfoFormRules.settleMode.required = true
        }
        //  chinese_mainland国内 hk_china香港 abroad海外 cheque支票 intrabranch内部往来
        // if (val === 'cheque') {
        //   this.regInfoFormRules.payAccountName.required = false
        //   this.regInfoFormRules.payAccountPublicType.required = false
        // } else {
        //   this.regInfoFormRules.payAccountName.required = true
        //   this.regInfoFormRules.payAccountPublicType.required = true
        // }
      },
    },
    // 账号结算方式
    'regInfoForm.settleMode': {
      handler(val, oldVal) {
        if (val === 'cheque') {
          this.regInfoFormRules.payAccountName.required = false
          this.regInfoFormRules.payAccountPublicType.required = false
        } else {
          this.regInfoFormRules.payAccountName.required = true
          this.regInfoFormRules.payAccountPublicType.required = true
        }
      },
    },
    '$store.state.user.userInfo.settleCompanyCode'(val) {
      if (this.$route.name === 'RegWriteoffDetail') {
        this.init()
        this.getData()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
::v-deep {
  .el-dialog__body {
    padding: 10px 20px;
  }
  .finance-el-pagination {
    padding-bottom: 0;
  }
}
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
}
.settlement-detail-form {
  .title {
    font-weight: 600;
    color: #222222;
    line-height: 20px;
    padding: 8px;
  }
  .full_input {
    display: block;
    width: 100%;
  }
  .el-form-item ::v-deep .el-form-item__content {
    width: calc(100% - 112px);
  }
  .el-form-item.overshow-item ::v-deep .el-form-item__content > div {
    width: 160%;
  }
}

.payInfo-box {
  .item-box {
    border-bottom: 1px solid #d8d8d8;
    padding-bottom: 10px;
    margin: 0 8px 16px;
    .title {
      font-weight: 600;
      color: #222222;
      line-height: 20px;
      padding: 8px;
    }
    .info-box {
      display: flex;
      flex-wrap: wrap;
      margin: 8px;
      .base-item-list {
        flex-basis: 100%;
        display: flex;
      }
      .flex-item {
        display: flex;
        label {
          width: 40px;
          font-weight: normal;
        }
      }
      .base-item {
        flex-basis: calc(25% - 10px);
        margin-bottom: 10px;
        margin-right: 10px;
        .sub-title {
          min-width: 108px;
          text-align: right;
          display: inline-block;
          // text-align-last: justify;
        }
        b {
          font-weight: normal;
        }
        &.remark {
          flex: 1;
          flex-basis: 100%;
        }

        .el-input,
        .el-input--suffix,
        .el-upload--text,
        .finance-table-upload,
        .el-select {
          width: 130px;
        }
        .link {
          font-weight: 400;
          color: #3e80f5;
          line-height: 20px;
          cursor: pointer;
          margin-left: 5px;
        }
      }
      .el-select {
        width: 100px;
        margin-right: 5px;
      }
    }
  }
  .el-button--text {
    font-size: 12px;
    padding: 0 5px;
  }
  .table-box {
    border: 1px solid #e9e9e9;
    border-radius: 4px;
    margin: 16px 8px;
    overflow: hidden;
    .title-box {
      background: #f8f9fd;
    }
    .bill-box {
      margin: -5px 0 15px 5px;
      display: flex;
      padding: 8px;
      color: #4a4a4a;
      span {
        flex-basis: 300px;
      }
    }
  }
  .title-box {
    display: flex;
    margin-bottom: 15px;
    background: #f8f9fd;
    .title {
      flex: 1;
      height: 30px;
      font-weight: 600;
      color: #222222;
      line-height: 30px;
      padding: 0 8px;
      display: flex;
    }
    .money-list {
      margin-left: 20px;
      font-weight: normal;
    }
    span {
      color: #222;
      b {
        color: #33b18a;
        font-weight: 500;
      }
    }
    .btn {
      padding: 0;
      margin: 5px 15px;
      display: flex;
      .toggle {
        line-height: 20px;
        margin-left: 20px;
        cursor: pointer;
        color: #409eff;
        i {
          margin-left: 2px;
        }
      }
    }
    .el-button {
      height: 20px;
      // background: none !important;
      border-radius: 4px;
      border: 1px solid #d9d9d9;
      text-align: center;
      line-height: 20px;
      padding: 0 8px;
      font-size: 12px;
    }
  }
}
.settle-unit-box {
  font-size: 12px;
  .default-settle {
    display: flex;
    span {
      width: 80px;
      line-height: 20px;
    }
    .el-input {
      flex-basis: 300px;
    }
  }
  .unit-box {
    margin: 15px auto;
  }
}
.text-over {
  display: inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 140px;
  vertical-align: top;
}
</style>
