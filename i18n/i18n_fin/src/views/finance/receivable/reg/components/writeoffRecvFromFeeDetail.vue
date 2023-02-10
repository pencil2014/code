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
          <div class="money-title">{{regInfoForm.receivablePrerevNo?$t('Settle.advancewf'):$t('Settle.receiptwf')}}</div>
        </div>
        <div class="money-box-right">
          <!-- v-if="checkAuth($route.name, 'btn-writeoff')" -->
          <el-button @click="writeoffAction" size="mini" type="primary">{{$t('Common.writeoffs')}}</el-button>
          <!-- v-if="checkAuth($route.name, 'btn-transferDzg')" -->
          <!-- <el-button @click="transferDzg" size="mini" type="primary">余额转大掌柜</el-button> -->
          <!-- v-if="checkAuth($route.name, 'btn-handleFeeList') && !source" -->
          <el-button @click="settleOrderFeeList('isFirst')" size="mini" type="primary">{{$t('Collect.associatedcosts')}}</el-button>
          <el-button @click="openUploadFile" size="mini" type="primary">{{$t('Collect.uploadSheets')}}</el-button>
          <el-button @click="cancel" size="mini">{{$t('Common.back')}}</el-button>
        </div>
      </div>
      <div class="settlement-detail-form">
        <el-form
          :model="regInfoForm"
          ref="regInfoForm"
          :inline="true"
          size="mini"
          label-width="220px"
          :rules="regInfoFormRules"
        >
          <template v-if="regInfoForm.receivablePrerevNo">
            <h3>{{$t('Settle.advanceRe')}}</h3>
            <DetailDiv :label="$t('Collect.advanceNo')" :content="regInfoForm.receivablePrerevNo" />
            <DetailDiv :label="$t('Collect.amountReceipts')" :content="regInfoForm.preceiveAmt" />
            <DetailDiv :label="$t('Settle.advanceAmt')" :content="regInfoForm.balance" />
          </template>
          <h3>{{$t('Collect.receiptInfo')}}</h3>
          <DetailDiv :label="$t('Collect.receivableRegNo')" :content="regInfoForm.receivableRegNo" />
          <DetailDiv :label="$t('Collect.amtReceived')" :content="regInfoForm.realAmt" />
          <DetailDiv :label="$t('Collect.recvWay')" :content="dictMapObj['recvWay'][regInfoForm.recvWay]" />
          <DetailDiv :label="$t('Collect.abbreviat')" :content="regInfoForm.accountShortName" />
          <DetailDiv
            :label="$t('Settle.settleMode')"
            :content="dictMapObj['bankAccountSettleMode'][regInfoForm.settleMode]"
          />
          <DetailDiv :label="$t('Settle.branchCompany')" :content="regInfoForm.recvCompName" :isTooltip="true"/>
          <DetailDiv :label="$t('Collect.bankFlowNumber')" :content="regInfoForm.bankSeqNo" />
          <DetailDiv :label="$t('FeeList.receivePayDates')" :content="regInfoForm.recvDate" />
          <DetailDiv :label="$t('Collect.bankFlowNumber')" :content="regInfoForm.bankSeqNo" />
          <DetailDiv :label="$t('Collect.handlingFee')" :content="regInfoForm.fixedTransferFee" />
          <DetailDiv :label="$t('Collect.interTransferFee')" :content="regInfoForm.interTransferFee" />
          <DetailDiv :label="$t('Collect.externalFee')" :content="regInfoForm.outerTransferFee" />
          <DetailDiv :label="$t('FeeList.currency')" :content="regInfoForm.currency" />
          <el-form-item :label="$t('Collect.avaiWfAmt')">
            <el-input disabled :value="totalAmt"></el-input>
          </el-form-item>
          <el-form-item :label="$t('Collect.remainAmt')" prop="unusedAmt">
            <el-input disabled type="text" v-model="unusedAmt"></el-input>
          </el-form-item>
          <el-form-item
            :label="$t('PreClose.residual')"
            prop="balanceDealType"
            v-if="!regInfoForm.receivablePrerevNo"
          >
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
          <el-form-item :label="$t('Collect.customerShortAmt')" prop="lessPayAmt">
            <el-input disabled type="text" v-model="lessPayAmt" :placeholder="$t('Common.plEnter')"></el-input>
          </el-form-item>
          <el-form-item :label="$t('FeeList.writeOffDate')" prop="writeoffDate">
            <el-date-picker
              :placeholder="$t('Common.plSelect')"
              type="date"
              v-model="regInfoForm.writeoffDate"
              value-format="yyyy-MM-dd"
            ></el-date-picker>
          </el-form-item>
          <!-- <el-form-item :label="$t('Settle.unreimbursed')" prop="noWriteoffHasInvoice">
            <el-select v-model="regInfoForm.noWriteoffHasInvoice">
              <el-option
                v-for="item in dictMap['yesNo']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item :label="$t('Collect.writeoffrate')" v-if="regInfoForm.exchangeRates.length" class="overshow-item">
            <div>
              <span>{{regInfoForm.exchangeRates[0].settlementRateTitle}} {{regInfoForm.exchangeRates[0].settlementRate}}</span>
              <el-button type="text" size="mini" @click="checkExchangeRage">{{$t('Common.more')}}</el-button>
            </div>
          </el-form-item>
          <DetailDiv :label="$t('Collect.waterBill')" :isSlot="true">
            <el-tooltip
              v-if="regInfoForm.bankseqFileName"
              :content="regInfoForm.bankseqFileName"
              placement="top-start"
            >
              <el-tag
                class="detail__content"
                size="medium"
                @click="showAttachment(regInfoForm.bankseqFileCode)"
              >{{ regInfoForm.bankseqFileName }}</el-tag>
            </el-tooltip>
          </DetailDiv>
          <DetailDiv :label="$t('Collect.transRemarks')" :content="regInfoForm.recvRemark" :isFull="true" />
          <el-form-item :label="$t('Collect.wfRemarks')" class="full_input" prop="remark">
            <el-input
              type="textarea"
              v-model="regInfoForm.remark"
              :maxlength="500"
              show-word-limit
              :placeholder="$t('Common.plEnter')"
            ></el-input>
          </el-form-item>

          <h3>{{$t('Settle.paymentInfoTips')}}</h3>
          <DetailDiv :label="$t('Settle.accountName')" :content="regInfoForm.payAccountName" />
          <DetailDiv :label="$t('Settle.paymentBank')" :content="regInfoForm.payBankName" />
          <DetailDiv
            :label="$t('Settle.accountType')"
            :content="dictMapObj['accountType'][regInfoForm.payAccountPublicType]"
          />
          <DetailDiv :label="$t('Settle.accountNo')" :content="regInfoForm.payAccountNo" />
          <DetailDiv :label="$t('Collect.payAccountCountry')" :content="regInfoForm.payAccountCountryName" />
          <DetailDiv label="SWIFT CODE" :content="regInfoForm.payAccountSwiftCode" />
          <DetailDiv :label="$t('Collect.paymentWaterBill')" :isSlot="true">
            <el-tooltip
              v-if="regInfoForm.payBankseqFileName"
              :content="regInfoForm.payBankseqFileName"
              placement="top-start"
            >
              <el-tag
                class="detail__content"
                size="medium"
                @click="showAttachment(regInfoForm.payBankseqFileNo)"
              >{{ regInfoForm.payBankseqFileName }}</el-tag>
            </el-tooltip>
          </DetailDiv>
          <DetailDiv :label="$t('Settle.recvRegAddr')" :content="regInfoForm.payAccountBankCompAddr" :isFull="true" />
        </el-form>
      </div>
      <div class="payInfo-box">
        <!-- 转大掌柜余额 -->
        <!-- <div class="table-box" v-show="option11.data&&option11.data.length" @click.stop>
          <div class="title-box">
            <div class="title">转大掌柜余额</div>
            <div class="btn"></div>
          </div>
          <FinanceTable :option="option11" />
        </div> -->
        <div class="table-box">
          <div class="title-box">
            <div class="title">
              {{$t('FeeList.expensesList')}}
              <div class="money-list" v-show="originalGather.length">
                {{$t('Common.writeoffs')}}:
                <span :key="index" v-for="(item, index) in originalGather">
                  {{ item.currency }}
                  <b>{{item.amt}}</b>
                </span>
              </div>
              <div class="money-list" v-show="gatherFee">
                {{$t('Collect.convertCurrency')}}：
                <span>
                  {{ regInfoForm.currency }}
                  <b>{{gatherFee}}</b>
                </span>
              </div>
            </div>
            <!-- <div
              class="btn"
              v-show="source&&option1.data&&option1.data.length&&regInfoForm.currency"
            >
              <el-button @click="changeRate" size="mini">{{$t('Collect.underwritingrate')}}</el-button>
            </div>-->
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
    <el-dialog :title="$t('Collect.writeoffrate')" :visible.sync="rateDialogOpen" class="self-dialog" width="600px">
      <div style="overflow:hidden">
        <FinanceTable :option="option6" />
      </div>
      <div class="dialog-footer" slot="footer">
        <el-button @click="submitRate" size="mini" type="primary">{{$t('Common.submit')}}</el-button>
        <el-button @click="closeRateDialog" size="mini">{{$t('Common.cancel')}}</el-button>
      </div>
    </el-dialog>
    <!-- 关联费用列表 -->
    <!-- <el-dialog :visible.sync="writeoffFeeDialog" class="self-dialog" :title="$t('Collect.associatedcosts')" width="1000px"> -->
    <!-- <el-dialog :visible="true" class="self-dialog" :title="$t('Collect.associatedcosts')" width="1100px" top="8vh"> -->
    <el-dialog
      :visible.sync="writeoffFeeDialog"
      class="self-dialog"
      :title="$t('Collect.associatedcosts')"
      width="1100px"
      top="6vh"
    >
      <FinanceSearch :searchOption="searchOption3" @search="settleOrderFeeList" />
      <FinanceTable :option="option7" @send-multi="sendMulti" ref="multipleTable7" />
      <div class="dialog-footer" slot="footer">
        <el-button @click="importFeesAction" size="mini" type="primary">{{$t('Collect.importFees')}}</el-button>
        <el-button @click="closeWriteoffFee" size="mini">{{$t('Common.close')}}</el-button>
      </div>
    </el-dialog>
    <!-- 核销汇率 -->
    <el-dialog :visible.sync="exchangeRatesDialog" class="self-dialog" :title="$t('Settle.settleExRate')" width="600px">
      <FinanceTable :option="option10" v-if="exchangeRatesDialog" />
      <div class="dialog-footer" slot="footer">
        <el-button @click="exchangeRatesDialog = false" size="mini">{{$t('Common.close')}}</el-button>
      </div>
    </el-dialog>
    <!-- 余额转大掌柜 -->
    <!-- <TransferDzg :dialogOption="transferOption" @close="closeTransfer" @submit="submitTransfer" /> -->
    <!-- 分摊手续费 -->
    <TransferFee :transferFeeOption="transferFeeOption" @close="closeFee" />
    <FinanceUpload
      :limit="1"
      :show-upload="showUploadFile"
      upload-api="/fin/receivableReg/uploadPayBankseqFile"
      :upload-params="uploadParams"
      :upload-title="$t('Collect.uploadSheets')"
      @close-upload="closeUpload"
      @send-res-file-list="()=>{}"
      @send-res-upload="sendResUpload"
    ></FinanceUpload>
  </div>
</template>

<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import CustomColumns from '@/components/customColumns'
import FinanceUpload from '@/views/finance/components/financeUpload/financeUpload'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mapGetters } from 'vuex'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
// import TransferDzg from '@/views/finance/receivable/components/transferDzg'
import TransferFee from '@/views/finance/receivable/components/transferFee'
import FinUploadEmbed from '@/views/finance/receivable/components/finUploadEmbed'
import { writeoff as writeoffSubmit, checkRecvWriteoffOverduePayment } from '@/api/fin/writeoffRecv'
import { receivablePrerevWriteoff } from '@/api/fin/receivableReg'
import { listPage as settleOrderFeeList } from '@/api/fin/fee'
import { actualExchangeRate, listColumnConfigGet, listColumnConfigSave, baseFeeItemList } from '@/api/base'
import { dateFormat } from '@/views/finance/utils/finance'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
// TODO
// 可用核销金额 = 内扣手续费 + 收款金额
// 可用核销金额影响费用列表本次核销金额
// 剩余未用金额 = 可用核销金额 - 费用列表合计折币金额
// 加法 plus,  减法 minus,  乘法 times,  除法 div,  四舍五入 toNum,   获取值 valueOf
const defaultCreateQuery = {
  balance: '',
  preceiveAmt: '',
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
  writeoffReceipayTransferDzgList: [], // 核销转大掌柜列表
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
  components: { FinanceTable, CustomColumns, FinanceSearch,  TransferFee, FinUploadEmbed, FinanceUpload },
  data() {
    return {
      showUploadFile: false,
      uploadFileTitle: '',
      uploadFileApi: '',
      uploadParams: {},
      fileList: [],
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
      // 自定义表头弹框
      customColumnsPopShow: false,
      selfColumnsBase: [],
    }
  },
  created() {
    if (this.$route.meta.close) return
    this.option1.data = []
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
          { label: this.$t('FeeList.settleCorp'), prop: 'settleCorpName', type: 'input', disabled: true },
          {label: this.$t('FeeList.orderNo'), prop: 'sourceBizNo', type: 'input' },
          {
            label: this.$t('FeeList.feeEname'),
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
        data: [{ label: this.$t('Common.del'), type: 'text', action: 'Delete', showFn: () => true }],
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
      this.selfColumnsBase = [
        {
          prop: 'sourceBizNo',
          label: this.$t('PreClose.bizNo'),
          type: 'button',
          width: '140px',
          formatter: ({ cellValue, column, row, item }) => row.sourceBizNo || row.finBillNo,
          operationBtns: { show: true, callback: (fn, index, row, option) => this.showDetail(row) },
        },
        { prop: 'settleCompName', label: this.$t('FeeList.settleComp'), type: 'text', width: 150 },
        { prop: 'receipayType', label: this.$t('Settle.receipayType'), type: 'select', readOnly: true, width: 100 },
        { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text' },
        { prop: 'mbl', label: 'MBL', type: 'text' },
        { prop: 'hbl', label: 'HBL', type: 'text' },
        { prop: 'serviceName', label: this.$t('FeeList.serviceCodes'), type: 'text' },
        // { prop: 'feeName', label: this.$t('FeeList.feeName'), type: 'text' },
        { prop: 'feeEnName', label: this.$t('FeeList.feeEname'), type: 'text' },
        { prop: 'currency', label: this.$t('Settle.orignalCurrency'), type: 'text' },
        { prop: 'feeAmt', label: this.$t('Collect.originalamount'), type: 'text' },
        { prop: 'writeoffBalanceAmt', label: this.$t('Collect.writeoffableamount'), type: 'text', disabled: true },
        {
          prop: 'writeoffFeeAmt',
          label: this.$t('Settle.thiswriteoff'),
          type: 'input',
          maxlength: '16',
          disabled: true,
          validateInput: (value, row, pItem, changeE) => {
            if (!value) return
            if (!/^-?(\d+(\.\d{0,2})?)?$/.test(value)) {
              !this.debounceLsFn() && this.$msgErrClose(this.$t('Charge.numberTips'))
              let res = /^-?(\d+(\.\d{0,2})?)?/.exec(row[pItem.prop])
              row[pItem.prop] = res && res[0]
            }
          },
        },
        // TODO 参考收款核销
        {
          prop: 'lessPayAmt',
          label: this.$t('Collect.shortAmt'),
          type: 'input',
          maxlength: '16',
          disabled: true,
          validateInput: (value, row, pItem, changeE) => {
            if (!value) return
            if (!/^-?(\d+(\.\d{0,2})?)?$/.test(value)) {
              !this.debounceLsFn() && this.$msgErrClose(this.$t('Charge.numberTips'))
              let res = /^-?(\d+(\.\d{0,2})?)?/.exec(row[pItem.prop])
              row[pItem.prop] = res && res[0]
            }
          },
        }, // 短款+本次 <= 可核销
        { prop: 'writeoffCurrency', label: this.$t('Collect.writeoffCurrency'), type: 'text' },
        { prop: 'writeoffExRate', label: this.$t('Collect.writeoffrate'), type: 'text' },
        { prop: 'writeoffAmt', label: this.$t('Settle.exSettleAmt'), type: 'text' }, //writeoffFeeAmt*writeoffExRate
        { prop: 'feeUnit', label: this.$t('FeeList.feeUnit'), type: 'text', formatter: ({ cellValue }) => this.dictMapObj.feeUnit[cellValue] },
        { prop: 'unitPrice', label: this.$t('FeeList.unitPrice'), type: 'text' },
        { prop: 'unitCount', label: this.$t('FeeList.quantity'), type: 'text' },
        { prop: 'finDate',label: this.$t('FeeList.finDate'), width: 86, type: 'text' },
      ]
      const columns6 = [
        { prop: 'srcCurrency', label: this.$t('Settle.orignalCurrency'), type: 'text' },
        { prop: 'toCurrency', label: this.$t('Collect.writeoffCurrency'), type: 'text' },
        { prop: 'lowerRate', label: this.$t('PreClose.minexchange'), type: 'text' },
        { prop: 'upperRate', label: this.$t('PreClose.maxexchange'), type: 'text' },
        {
          prop: 'settlementRate',
          label: this.$t('Settle.settleExRate'),
          type: 'input',
          input: (val, row) => {
            val = val.replace(/[,|\s]/g, '')
            if (isNaN(val)) {
              this.$msgErrClose(this.$t('Charge.numberTips'))
              val = ''
            }
            row.settlementRate = val
          },
        },
      ]
      const columns7 = [
        { prop: 'sourceBizNo', label: this.$t('PreClose.bizNo'), type: 'text', width: 125 },
        { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', width: 140 },
        // { prop: 'invoiceStatus', label: this.$t('Settle.invoiceStatus'), type: 'select', propInDict: 'feeInvoiceStatus' },
        // 优化需求 显示是否确认 ID1005097
        { prop: 'confirmStatus', label: this.$t('FeeList.confirmStatus'), type: 'select', propInDict: 'yesNo' },
        { prop: 'feeEnName', label: this.$t('FeeList.feeEname'), type: 'text' },
        { prop: 'feeAmt', label: this.$t('Collect.originalamount'), type: 'text' },
        { prop: 'currency', label: this.$t('Settle.orignalCurrency'), type: 'text', width: 70 },
        { prop: 'notWriteoffAmt', label: this.$t('Collect.writeoffableamount'), type: 'text' },
        { prop: 'createdName', label: this.$t('Common.createdBy'), type: 'text' },
        { prop: 'createdTime', label: this.$t('Common.createTime'), type: 'text', width: 130 },
      ]
      const columns10 = [
        { prop: 'srcCurrency', label: this.$t('Settle.orignalCurrency'), type: 'text' },
        { prop: 'toCurrency', label: this.$t('Collect.writeoffCurrency'), type: 'text' },
        { prop: 'lowerRate', label: this.$t('PreClose.minexchange'), type: 'text' },
        { prop: 'upperRate', label:  this.$t('PreClose.maxexchange'), type: 'text' },
        { prop: 'settlementRate', label: this.$t('Settle.settleExRate'), type: 'text' },
      ]
      this.configColumns.splice(0, 1000, ...this.selfColumnsBase.map((item) => item.prop))
      this.option1.columns = [...this.selfColumnsBase]
      listColumnConfigGet({ scenesCode: 'web_relation_reg_from_fee' }).then((res) => {
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
            label: this.$t('Common.modify'),
            type: 'text',
            action: 'Edit',
            showFn: (row) => !row.edit,
          },
          {
            label: this.$t('Common.save'),
            type: 'text',
            action: 'Save',
            showFn: (row) => row.edit,
          },
          {
            label: this.$t('Common.del'),
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
              return this.$msgErrClose(this.$t('Charge.unusedamount'))
            } else {
              this.option11.data[$index].edit = false
            }
          } else if (action === 'Delete') {
            this.$confirmWarn(this.$t('Settle.confirmWarn'), () => {
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
            label: this.$t('Hedge.daZg'),
            type: 'select',
            propInDict: 'dzgCompCode',
            change: (value, row, rowIndex) => {
              this.changeDzgComName(row, value)
            },
          },
          { prop: 'currency',label: this.$t('FeeList.currency'), type: 'text' },
          {
            prop: 'internalDzgAmt',
            label: this.$t('FeeList.feeAmt'),
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
          { prop: 'dzgWriteoffNo',label: this.$t('Hedge.writeoffNo'), type: 'input', needTrim: true },
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
      this.refreshView('SettlementFeeList', 'from')
      let res = window.sessionStorage.getItem('_feeRelateRegInfo')
      window.sessionStorage.removeItem('_feeRelateRegInfo')
      let data = res && JSON.parse(res)
      console.log(data)
      // 默认值receivablePrerevNo=‘’，清空之前的数据
      data = {
        ...(data.receivableReg || {}),
        balance: data.receivableReg?.realAmt,
        receivablePrerevNo: '',
        ...(data.receivablePrerev
          ? { ...data.receivablePrerev, ...data.receivablePrerev.receivableReg, preceiveAmt: data.receivablePrerev?.preceiveAmt }
          : {}),
        writeoffItemList: data.writeoffItemList,
      }
      this.agentCompCodeBackup = data.agentCompCode
      this.regInfoForm = Object.assign({}, defaultCreateQuery, data)
      console.log(this.regInfoForm)
      this.bankAccountSettleModeList = []
      this.$nextTick(() => {
        this.$refs.regInfoForm.clearValidate()
      })
      let list = data.writeoffItemList || []
      if (!list.length) {
        return this.$msgErrClose(this.$t('Settle.feelistTips'))
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
      this.option1.data = this.option1.data.map((v) => ({ ...v, writeoffCurrency: value }))

      const currencys = [...new Set(this.option1.data.filter((v) => !v.invisible).map((item) => item.currency))] // 费用列表原币种
      const differentCurrencys = currencys.filter((item) => item !== value)
      if (differentCurrencys.length > 0) {
        const exchageRateList = this.exchageRateList.filter((item) => {
          return differentCurrencys.some((currency) => currency === item.srcCurrency && value === item.toCurrency)
        })
        this.regInfoForm.exchangeRates = exchageRateList.map((item) => {
          return {
            srcCurrency: item.srcCurrency,
            toCurrency: item.toCurrency,
            systemRate: item.srcCurrency + '-' + item.toCurrency + ' ' + item.rate,
            settlementRateTitle: item.srcCurrency + '-' + item.toCurrency,
            settlementRate: item.rate,
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
    importFeesAction() {
      if (this.multipleSelection7.length === 0) {
        return this.$msgErrClose(this.$t('Charge.beimported'))
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
      this.$msgSucClose(this.$t('Charge.importfeesSuc'))
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
          return this.$msgErrClose(this.$t('PreClose.greaterth'))
        }
        if (!this.option1.data.filter((v) => !v.invisible).length) {
          return this.$msgErrClose(this.$t('Settle.feelistTips'))
        }
        if (!this.regInfoForm.receivablePrerevNo && !this.regInfoForm.balanceDealType && this.unusedAmt > 0) {
          return this.$msgErrClose(this.$t('PreClose.remaining'))
        }
        if (this.unusedAmt < 0) {
          return this.$msgErrClose(this.$t('PreClose.availablewrite'))
        }
        let arrSet = [...new Set(this.option1.data.filter((v) => !v.invisible).map((v) => v.settleCompCode))]

        let str = ''
        let isGroup = arrSet.length > 1 || arrSet[0] !== this.$store.state.user.userInfo.settleCompanyCode
        let feeCodeArr = [...new Set(this.option1.data.map((v) => v.feeCode))]
        if (feeCodeArr.length > 1 && feeCodeArr.includes('TZFY')) {
          return this.$msgErrClose(this.$t('PreClose.adjustmentTips'))
        }
        if (isGroup) {
          str += this.$t('Settle.groupsta')
        }
        if (feeCodeArr[0] === 'TZFY') {
          str = (str ? str + this.$t('Common.and') : '') + this.$t('Settle.adjustmentTips')
        }
        if (this.regInfoForm.noWriteoffHasInvoice == 'yes') {
          str = (str ? str + this.$t('Common.and') : '') + this.$t('Settle.reinvoicTips')
        }
        // if (this.recvCompCode !== this.$store.state.user.userInfo.settleCompanyCode && this.hasIntrabranch != 'yes') {
        //   str = (str ? str + '且' : '') + '当前操作分公司与收款账户所属分公司不一致，将会生成分公司间代收款单，'
        // }
        str += this.$t('Settle.registrationTips')
        console.log(feeCodeArr)
        this.$confirmWarn({ body: str, confirm: this.$t('Common.yes'), cancel: this.$t('Common.no') }, () => {
          this.checkRecvWriteoffOverduePayment(isGroup ? 'group' : 'signal')
        })
      })
    },
    checkRecvWriteoffOverduePayment(item) {
      checkRecvWriteoffOverduePayment({
        settleCompCode: this.regInfoForm.recvCompCode,
        settleCorpCode: this.regInfoForm.settleCorpCode,
        recviceDate: this.regInfoForm.recvDate,
        feeIds: this.option1.data.map(v => v.feeId),
      }).then((res) => {
        if (res.data) {
          this.$confirmWarn(res.data, () => this.writeoffSubmit(item))
        } else {
          this.writeoffSubmit(item)
        }
      })
    },
    writeoffSubmit(settleOrderBuildType) {
      this.loading = true
      let data = {
        lessPayAmt: this.lessPayAmt,
        currency: this.regInfoForm.currency,
        noWriteoffHasInvoice: this.regInfoForm.noWriteoffHasInvoice,
        balanceDealType: this.regInfoForm.balanceDealType,
        feeSource: 'fee_list',
        writeoffDate: this.regInfoForm.writeoffDate,
        remark: this.regInfoForm.remark,
        writeoffItemList: this.option1.data
          .filter((v) => !v.invisible)
          .map((item) => ({ ...item, currency: item.writeoffCurrency })),
        writeoffReceipayTransferDzgList: this.option11.data || [],
        settleOrderBuildType,
        receivableRegId: this.regInfoForm.receivableRegId,
      }
      let method = writeoffSubmit
      if (this.regInfoForm.receivablePrerevNo) {
        method = receivablePrerevWriteoff
        data.receivablePrerevId = this.regInfoForm.receivablePrerevId
      }

      method(data)
        .then((res) => {
          this.$msgSucClose(this.$t('Settle.writeoffSuc'))
          this.refreshView('SettlementFeeList', 'from')
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
      this.$confirmWarn(this.$t('Settle.confirmWarn'), () => {
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
        return this.$message.error(this.$t('PreClose.jobNoTips'))
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
            let text = this.$t('Settle.rateLower',{currency: `${item.srcCurrency}-${item.toCurrency}`, rate: item.lowerRate})
            this.$msgErrClose(text)
            error = true
            break
          }
          if (item.settlementRate > item.upperRate) {
            let text = this.$t('Settle.rateUpper',{currency: `${item.srcCurrency}-${item.toCurrency}`, rate: item.upperRate})
            this.$msgErrClose(text)
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
        return this.$msgErrClose(this.$t('PreClose.modifying'))
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
          return { label: `${item.feeName}`, value: item.feeCode }
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
        return this.$msgErrClose(this.$t('PreClose.simultaneous'))
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
        return this.$msgErrClose(this.$t('PreClose.unused'))
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
          return this.$msgErrClose(this.$t('Charge.unusedamount'))
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
    // 查看汇率
    checkExchangeRage() {
      let list = JSON.parse(JSON.stringify(this.regInfoForm.exchangeRates))
      this.option6.data = list.map((item) => ({ ...item, edit: item.srcCurrency !== item.toCurrency }))
      this.rateDialogOpen = true
    },
    // 自定义表头
    customColumnsPopClose(action, value) {
      this.customColumnsPopShow = false
      if (action === 'Confirm') {
        let columnList = this.getColumnsValues(value) // getColumnsValues在本页面无作用
        listColumnConfigSave({ columnList, scenesCode: 'web_relation_reg_from_fee' }).then((res) => {
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
    showAttachment(path, name) {
      window.open(`/base/fileView/preview/${path}/sowoll`)
    },
    sendResUpload(data) {
      let { filePath, name, fileNo } = data.data
      Object.assign(this.regInfoForm, {
        payBankseqFilePath: filePath,
        payBankseqFileName: name,
        payBankseqFileNo: fileNo,
      })
    },
    openUploadFile() {
      this.fileList = []
      this.uploadParams = { receivableRegId: this.regInfoForm.receivableRegId }
      this.showUploadFile = true
    },
    closeUpload(isSure) {
      this.showUploadFile = false
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
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    // 可用核销金额
    totalAmt() {
      // 结算单收款登记初始化没有币种，此时短款金额应为空
      if (!this.regInfoForm.currency) return ''
      return new LSnum(this.regInfoForm.balance).plus(this.regInfoForm.innerTransferFee).toNum(2)
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
                  this.$msgErrClose(this.$t('Settle.shortfallTips'))
                  item.lessPayAmt = ''
                }
              } else if (Number(item.lessPayAmt) < 0) {
                if (Number(item.lessPayAmt) < writeoffAmt) {
                  // 单条费用的校验
                  this.$msgErrClose(this.$t('Settle.greaterTips'))
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
  .el-form-item {
    // width: 280px;
    width: 33%;
    margin-right: 0;
  }
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
    // width: calc(100% - 128px);
  }
  .el-form-item.overshow-item ::v-deep .el-form-item__content > div {
    width: 160%;
  }
  ::v-deep {
    .detail__div {
      // width: 280px !important;
      // margin-right: 14px !important;
      width: 33% !important;
      margin-right: 0;
    }
    .detail__label {
      width: 220px !important;
    }
  }
}

.payInfo-box {
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
