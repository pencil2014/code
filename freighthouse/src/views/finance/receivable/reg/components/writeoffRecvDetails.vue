<template>
  <div
    class="finance-page finance-receivable-writeoff-detail"
    :element-loading-background="eLoadingBackground"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-text="eLoadingText"
    v-loading="lsLoading"
  >
    <div class="finance-approve-detail">
      <div class="finance-approve-btns-box">
        <div class="finance-approve-btns-left">{{ !isDetailPage ? '收款核销' : '收款核销详情' }}</div>
        <div class="finance-approve-btns-right">
          <el-button @click="recheck" size="mini" type="primary" v-if="!isJustShowRecord">确认复核</el-button>
          <el-button
            v-if="checkAuth($route.name, 'btn-reverseWriteoff')"
            @click="reverseWriteoff"
            size="mini"
            type="success"
          >反核销</el-button>
          <el-button
            v-if="checkAuth($route.name, 'btn-toReWriteoff')"
            @click="toReWriteoff"
            size="mini"
            type="success"
          >重新核销</el-button>
          <el-button
            v-if="!isJustShowRecord && checkAuth($route.name, 'btn-applyInvoice')"
            @click="handleInvoice"
            size="mini"
            type="primary"
          >开票申请</el-button>
          <el-button
            v-if="!voucherNos && checkAuth($route.name, 'btn-voucherView')"
            @click="batchPrintCreate2(true)"
            type="inner"
            size="mini"
          >预览运营凭证</el-button>
          <el-button
            v-if="!voucherNos && checkAuth($route.name, 'btn-voucherCreate')"
            @click="batchPrintCreate2(false)"
            size="mini"
            type="inner"
          >生成运营凭证</el-button>
          <el-button
            v-else-if="checkAuth($route.name, 'btn-voucherDel')"
            @click="delVoucher"
            size="mini"
            type="danger"
          >删除运营凭证</el-button>
          <el-button
            v-if="!exVoucherNos && checkAuth($route.name, 'btn-voucherView')"
            @click="batchPrintCreate2(true, true)"
            size="mini"
            type="outer"
          >预览会计凭证</el-button>
          <el-button
            v-if="!exVoucherNos && checkAuth($route.name, 'btn-voucherCreate')"
            @click="batchPrintCreate2(false, true)"
            size="mini"
            type="outer"
          >生成会计凭证</el-button>
          <el-button
            v-else-if="checkAuth($route.name, 'btn-voucherDel')"
            @click="delVoucher2"
            size="mini"
            type="danger"
          >删除会计凭证</el-button>
          <el-button v-if="checkAuth($route.name, 'btn-voucherAll')" @click="previewAll" size="mini" type="primary">查看全部关联凭证</el-button>
          <el-button @click="cancel" size="mini">返回</el-button>
        </div>
      </div>
      <div class="payInfo-box">
        <div class="item-box table-box">
          <div class="title-box">
            <div class="title">核销信息</div>
            <!-- <div class="btn">
              <div @click="showReceiveData = !showReceiveData" class="toggle">
                {{ showReceiveData ? '收起' : '展开' }}
                <i
                  :class="[`el-icon-arrow-${showReceiveData?'up':'down'}`]"
                ></i>
              </div>
            </div>-->
          </div>
          <!-- <div class="info-box" v-show="showReceiveData"> -->
          <div class="info-box" style="border-bottom: 1px solid #d8d8d8;">
            <DetailDiv label="所属分公司：" :content="receivableRegInfo.recvCompName" isTooltip />
            <DetailDiv label="核销编号：" :content="receivableRegInfo.writeoffReceipayNo" isBold />
            <DetailDiv
              label="收款银行简称："
              :content="receivableRegInfo.accountShortName"
              isTooltip
              isBold
            />
            <DetailDiv label="收款币种：" :content="receivableRegInfo.writeoffCurrency" isBold />
            <DetailDiv label="收款金额：" :content="receivableRegInfo.realAmt" isBold />
            <DetailDiv label="收付日期：" :content="receivableRegInfo.recvDate" isBold />
            <DetailDiv label="银行流水号：" :content="receivableRegInfo.bankSeqNo" />
            <DetailDiv label="客户付款水单附件：" isSlot>
              <el-tooltip
                v-if="receivableRegInfo.payBankseqFileName"
                :content="receivableRegInfo.payBankseqFileName"
                placement="top-start"
              >
                <el-tag
                  class="detail__content"
                  size="medium"
                  @click="showAttachment(receivableRegInfo.payBankseqFileNo, receivableRegInfo.payBankseqFileName)"
                >{{ receivableRegInfo.payBankseqFileName }}</el-tag>
              </el-tooltip>
            </DetailDiv>
            <DetailDiv label="付款银行：" :content="receivableRegInfo.payBankName" />
            <DetailDiv label="付款账户名：" :content="receivableRegInfo.payAccountName" isTooltip isBold />
            <DetailDiv label="付款账号：" :content="receivableRegInfo.payAccountNo" />
            <DetailDiv label="收款水单附件：" isSlot>
              <el-tooltip
                v-if="receivableRegInfo.bankseqFileName"
                :content="receivableRegInfo.bankseqFileName"
                placement="top-start"
              >
                <el-tag
                  class="detail__content"
                  size="medium"
                  @click="showAttachment(receivableRegInfo.bankseqFileCode, receivableRegInfo.bankseqFileName)"
                >{{ receivableRegInfo.bankseqFileName }}</el-tag>
              </el-tooltip>
            </DetailDiv>
          </div>

          <div class="info-box">
            <DetailDiv
              label="核销子类型："
              :content="dictMapObj.recWriteoffSubType[receivableRegInfo.writeoffSubType]"
            />
            <DetailDiv label="核销币种：" :content="receivableRegInfo._writeoffCurrency" />
            <DetailDiv label="核销金额：" :content="receivableRegInfo.totalWirteoffAmt" />
            <DetailDiv label="运营凭证号：" isSlot isBold>
              <MultiBtn :btnStr="voucherNos||''" @generate="batchPrintCreate" />
            </DetailDiv>
            <DetailDiv label="会计凭证号：" isSlot isBold>
              <MultiBtn
                :isEx="true"
                :btnStr="exVoucherNos||''"
                @generate="batchPrintCreate2($event, true)"
              />
            </DetailDiv>
            <!-- <template v-if="receivableRegInfo.receivablePrerevId"> -->
            <DetailDiv label="调整金额币种：" :content="receivableRegInfo.currency" />
            <!-- v-if="receivableRegInfo.writeoffSubType === 'prerev_adjuest'" -->
            <DetailDiv label="调整金额：" :content="receivableRegInfo.adjustAmt" />
            <!-- </template> -->
            <!-- <template v-else> -->
            <DetailDiv label="客户短款金额：" :content="receivableRegInfo.lessRecvAmt" />
            <DetailDiv
              label="未销费用可补开票："
              :content="receivableRegInfo.noWriteoffHasInvoice === 'yes' ? '是' : '否'"
            />
            <DetailDiv
              label="复核状态："
              :content="dictMapObj['writeoffRecheckStatus'][receivableRegInfo.recheckStatus]"
              :isIcon="receivableRegInfo.recheckStatus==='no_check'?true:false"
            />
            <DetailDiv label="复核人：" :content="receivableRegInfo.recheckName" />
            <DetailDiv label="复核时间：" :content="receivableRegInfo.recheckTime" />
            <DetailDiv label="核销日期：" isSlot isBold>
              <div class="multi__slot">
                <span v-if="disabledData">{{receivableRegInfo.writeoffDate}}</span>
                <el-date-picker 
                  v-else
                  :disabled="disabledData"
                  placeholder="选择日期"
                  size="mini"
                  type="date"
                  v-model="receivableRegInfo.writeoffDate"
                  value-format="yyyy-MM-dd"
                ></el-date-picker>
                <el-button
                  @click="editWriteoffDate"
                  style="margin-left: 5px"
                  type="text"
                  v-show="disabledData"
                >修改</el-button>
                <el-button
                  @click="updateWriteoffDate"
                  style="margin-left: 5px"
                  type="text"
                  v-show="!disabledData"
                >保存</el-button>
              </div>
            </DetailDiv>
            <DetailDiv v-if="receivableRegInfo.exchangeRates.length" label="核销汇率：" isSlot>
              <div>
                {{ receivableRegInfo.exchangeRates[0].settlementRateTitle }}
                {{ receivableRegInfo.exchangeRates[0].settlementRate }}
                <span
                  @click="showExchangeRates"
                  class="link"
                  v-show="receivableRegInfo.exchangeRates.length > 1"
                >更多汇率</span>
              </div>
            </DetailDiv>
            <DetailDiv label="核销备注：" isSlot isFull>
              <div class="detail__content" style="display: flex;">
                <el-input
                  placeholder="请输入"
                  size="mini"
                  type="textarea"
                  :maxlength="500"
                  show-word-limit
                  :autosize="true"
                  v-model="receivableRegInfo.remark"
                ></el-input>
                <el-button
                  @click="updateRemark"
                  style="margin-left: 10px;padding-left: 7px !important;"
                  size="mini"
                  type="primary"
                >保存核销备注</el-button>
              </div>
            </DetailDiv>

            <!-- <DetailDiv
                label="收款单类型："
                :content="dictMapObj['receivableRegType'][receivableRegInfo.type]"
              />
              <DetailDiv
                label="收款登记状态："
                :content="dictMapObj['receivableRegStatus'][receivableRegInfo.confirmStatus]"
              />
              <DetailDiv label="收款方式：" :content="dictMapObj['recvWay'][receivableRegInfo.recvWay]" />
              <DetailDiv label="收款账号：" :content="receivableRegInfo.accountNo" />
              <DetailDiv
                label="账户结算方式："
                :content="dictMapObj['bankAccountSettleMode'][receivableRegInfo.settleMode]"
              />
              <DetailDiv
                label="交易备注："
                :content="receivableRegInfo.receivableRegInfo?receivableRegInfo.receivableRegInfo.remark:''"
              />

              <DetailDiv label="创建人：" :content="receivableRegInfo.createdName" />
              <DetailDiv label="创建时间：" :content="receivableRegInfo.createdTime" />
              <DetailDiv label="更新人：" :content="receivableRegInfo.updatedName" />
            <DetailDiv label="更新时间：" :content="receivableRegInfo.updatedTime" isBold />-->
            <!-- </template> -->
          </div>
          <FinanceTable :option="option8" v-if="isDetailPage" />
        </div>
        <div class="item-box">
          <div class="title">结算单位信息</div>
          <div class="info-box">
            <DetailDiv label="结算单位：" :content="receivableRegInfo.settleCorpName" isTooltip isBold />
            <DetailDiv
              label="结算单位类型："
              :content="(receivableRegInfo.settleCorpType||'').replace(/\b(\w+)\b/g, (item) => (dictMapObj.unitType[item]))"
            />
            <DetailDiv label="是否虚拟：" :content="dictMapObj.yesNo[receivableRegInfo.isTemporary]" />
            <DetailDiv label="是否有委托关系：" :content="option5.data.length ? '是' : '否'" />
          </div>
          <FinanceTable :option="option5" v-show="option5.data.length" />
        </div>
        <div class="table-box" v-show="option4.data.length">
          <div class="title-box">
            <div class="title">转账手续费</div>
            <div class="btn"></div>
          </div>
          <FinanceTable :option="option4" />
        </div>
        <div v-if="option13.data&&option13.data.length" class="table-box">
          <div class="title-box" style="margin-bottom: 0">
            <div class="title">滞纳金</div>
            <div class="btn"></div>
          </div>
          <FinanceTable :option="option13" />
        </div>
        <!-- 转大掌柜余额 -->
        <div class="table-box" v-show="option11.data.length">
          <div class="title-box">
            <div class="title">转大掌柜余额</div>
            <div class="btn"></div>
          </div>
          <FinanceTable :option="option11" />
        </div>
        <div class="table-box" v-show="option9.data.length">
          <div class="title-box">
            <div class="title">发票信息</div>
            <div class="btn"></div>
          </div>
          <FinanceTable :option="option9" />
        </div>
        <!-- 内部往来费用明细信息 -->
        <div class="table-box" v-if="option12.data.length">
          <div class="title-box" style="margin-bottom: 0">
            <div class="title">内部往来费用</div>
            <div class="btn"></div>
          </div>
          <FinanceTable :option="option12" />
        </div>
        <div class="table-box">
          <div class="title-box" style="margin-bottom: 0">
            <div class="title">
              费用列表
              <template>
                <div class="money-list" v-show="originalGather.length">
                  核销:
                  <span :key="'originalGather' + index" v-for="(item, index) in originalGather">
                    {{ item.currency }}
                    <b>{{ decimalFixed2(item.amt) }}</b>
                  </span>
                </div>
                <div class="money-list" v-show="exchangeGather.length">
                  折币：
                  <span :key="'exchangeGather' + index" v-for="(item, index) in exchangeGather">
                    {{ item.currency }}
                    <b>{{ decimalFixed2(item.amt) }}</b>
                  </span>
                </div>
              </template>
            </div>
            <div class="btn">
              <el-button
                style="line-height: 18px;margin-bottom: 0;"
                class="finance-btn"
                @click="feeSearchToggle = !feeSearchToggle"
                size="mini"
                type="primary"
              >{{feeSearchToggle?'隐藏': '显示'}}搜索条件</el-button>
            </div>
          </div>
          <DetailFeeSearch
            v-show="feeSearchToggle"
            ref="detailFeeSearch"
            :list="option1.data"
            @search="search"
          />
          <FinanceTable :option="option1" />
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
    <PreviewDialog
      :dialogOption="previewDialog"
      @generate="batchPrintCreate(false)"
      :showDel="checkAuth($route.name, 'btn-voucherDel')"
      :showCreate="checkAuth($route.name, 'btn-voucherCreate')"
    />
    <!-- 核销汇率 -->
    <el-dialog :visible.sync="exchangeRatesDialog" class="self-dialog" title="核销汇率" width="600px">
      <FinanceTable :option="option10" />
      <div class="dialog-footer" slot="footer">
        <el-button @click="exchangeRatesDialog = false" size="mini">关闭</el-button>
      </div>
    </el-dialog>
    <!-- 分摊费用详情弹框 -->
    <FinanceDialogTable :option="transferFeeDialog" />
    <VoucherNosTable :dialogOption="voucherNosTableOption" @close="getData"/>
    <el-dialog
      :title="'滞纳金'"
      :visible.sync="lateFeeVisible"
      :close-on-click-modal="false"
      width="800px">
      <FinanceTable
        :option="option13" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleLateFee" size="mini" type="primary">立即处理</el-button>
        <el-button @click="lateFeeVisible = false" size="mini">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import DetailFeeSearch from '@/views/finance/components/financeSearch/detailFeeSearch'
import CustomColumns from '@/components/customColumns'
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
import VoucherNosTable from '@/views/finance/voucher/components/voucherNosTable'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mapState, mapGetters } from 'vuex'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceUpload from '@/views/finance/components/financeUpload/financeUpload'
import FinanceDialogTable from '@/views/finance/components/financeDialog/tableDialog'
import { regDeleteBankseqFile, regDeleteProxyFile } from '@/api/fin/receivableReg'
import {
  writeoffRecvInfo,
  recheck,
  updateWriteoffDate,
  reverse,
  toReWriteoff,
  updateWriteoffRecipayTransferDzg,
  listTransferFeeAllot,
  invoiceReceivableApply,
  updateRemark,
} from '@/api/fin/writeoffRecv'
import {
  receipayWriteOffGenerate,
  exReceipayWriteOffGenerate,
  voucherDelete,
  exVoucherDelete,
  voucherListRecv,
} from '@/api/fin/voucher'
import { actualExchangeRate, listColumnConfigGet, listColumnConfigSave } from '@/api/base'
import { decimalFixed2 } from '@/views/finance/utils/finance'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
const defaultCreateQuery = {
  balanceDealType: '',
  lessPayAmt: '',
  unusedAmt: '',
  noWriteoffHasInvoice: 'no',
  bankseqFileName: '',
  bankseqFilePath: '',
  payBankseqFileName: '',
  payBankseqFilePath: '',
  proxyFileName: '',
  proxyFilePath: '',
  exchangeRates: [],
  fixedTransferFee: '',
}
export default {
  name: 'writeoffReceipay2',
  mixins: [mixin, routerMixin],
  data() {
    return {
      feeSearchToggle: true, //费用搜索默认显示
      voucherNos: '',
      exVoucherNos: '',
      voucherNosTableOption: { show: false, list: [] },
      query: {
        bankseqFileNo: '',
        bankSeqNo: '',
        lessPayAmt: 0,
        lessPayDealway: '',
        remark: '',
      },
      showTable1: false,
      rejectDialogOpen: false,
      showBillDetail: false,
      orderBillId: '',
      multipleSelection1: [],
      multipleSelection2: [],
      multipleSelection3: [],
      relevanceOpne: false,
      relevanceOpne2: false,
      searchOption1: {
        columns: [
          {
            disabled: true,
            label: '结算单位',
            prop: 'settleCorpCode',
            type: 'input',
            placeholder: '',
          },
          {
            label: '发票号',
            prop: 'invoiceNo',
            type: 'input',
          },
          {
            label: '发票抬头',
            prop: 'title',
            type: 'input',
          },
          {
            label: '开票币种',
            prop: 'currency',
            propInDict: 'validCurrency',
            type: 'select',
          },
        ],
        data: {
          invoiceType: '',
          invoiceNo: '',
          currency: '',
        },
      },
      searchOption2: {
        columns: [
          {
            label: '结算号编号',
            prop: 'settleOrderNo',
            type: 'input',
          },
          {
            label: '锁定状态',
            prop: 'finLockStatus',
            type: 'select',
            propInDict: 'finLockStatus',
          },
          {
            label: '结算单类型',
            prop: 'orderType',
            type: 'select',
            propInDict: 'settleOrderType',
          },
        ],
        data: {
          settleOrderNo: '',
        },
      },
      option1: {},
      option2: {},
      option3: {},
      option4: {},
      option5: {},
      option6: {},
      option7: {},
      option8: {},
      option9: {},
      option11: {},
      option10: {},
      option12: {},
      option13: {},
      transferFeeDialog: {
        title: '分摊详情',
        show: false,
        width: '700px',
        buttonHide: true,
        tableOption: {
          pagination: false,
          selection: false,
          data: [],
          columns: [
            { prop: 'settleCompName', label: '分公司', type: 'text', minWidth: 230 },
            { prop: 'orderNo', label: '工作单号', type: 'text', minWidth: 150 },
            { prop: 'bdEmployeeName', label: '业务员', type: 'text' },
            { prop: 'allotAmt', label: '分摊金额', type: 'text' },
          ],
        },
      },
      moneyTitle1: '应收',
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
      receivableRegInfo: Object.assign({}, defaultCreateQuery),
      transferFeeList: [],
      prepayApplys: [],
      writeoffItemList: [],
      settleExRateSummarys: [],
      auditStatus: '',
      form: {
        errorCause: 'error',
        errorRemark: '付错原因备注',
      },
      exchageRateList: [], // 接口返回的当日核销汇率列表
      settleExchageRateList: [], // 核销需要用到的汇率列表
      settlementRateEditDisabled: false,
      watchFormExchangeRatesTime: 0,
      originalGather: [],
      exchangeGather: [],
      invoiceReceivableIds: [],
      settleOrderIds: [],
      file: null,
      showUploadFile: false,
      uploadFileTitle: '',
      uploadFileApi: '',
      uploadParams: {},
      fileList: [],
      addTransferFeeForm: {
        cutType: '',
        transferFee: '',
        currency: '',
      },
      addTransferFeeVisible: false,
      addTransferFeeRules: {
        cutType: [{ required: true, message: '扣款类型不能为空', trigger: 'blur' }],
        transferFee: [{ required: true, message: '手续费金额不能为空', trigger: 'blur' }],
        currency: [{ required: true, message: '手续费币种不能为空', trigger: 'blur' }],
      },
      receivableRegId: '',
      writeoffReceipayId: '',
      source: '',
      isJustShowRecord: false,
      writeoffReceipayNo: '',
      isDetailPage: true,
      // 应收核销金额
      sumAmt: null,
      showReceiveData: true,
      disabledData: true,
      // 凭证
      previewDialog: {
        show: false,
        title: '凭证预览',
        seqNo: '',
        showData: {},
      },
      showPreviewDialog: false,
      exchangeRatesDialog: false,
      // 自定义表头弹框
      customColumnsPopShow: false,
      selfColumnsBase: [],
      lateFeeVisible: false,
    }
  },
  created() {
    const operationBtns = Object.assign({}, this.option.operationBtns, {
      text: '',
      show: true, // 详情不需要删除
      data: [
        {
          label: '删除',
          type: 'text',
          showFn: (row) => row.confirmStatus !== 'yes',
          action: 'Delete',
        },
      ],
    })
    this.option1 = Object.assign({}, this.option, {
      customColumns: {
        show: true,
        handleCustomColumns: () => (this.customColumnsPopShow = true),
      },
      id: 'option1',
      $name: 'WriteoffRecvDetail21',
      data: [],
      tips: { text: '', show: false },
      operationBtns: operationBtns,
      selection: { show: false },
      edit: true,
      colorColumns: ['receipayType'],
      sortable: true,
      sortChange: this.sortChange,
    })
    this.option4 = Object.assign({}, this.option, {
      id: 'option4',
      $name: 'WriteoffRecvDetail24',
      data: [],
      tips: false,
      operationBtns: false,
      selection: false,
      edit: true,
    })
    this.option5 = Object.assign({}, this.option, {
      id: 'option5',
      $name: 'WriteoffRecvDetail25',
      data: [],
      tips: false,
      operationBtns: false,
      selection: false,
    })
    this.option6 = Object.assign({}, this.option, {
      id: 'option6',
      $name: 'WriteoffRecvDetail26',
      tips: { text: '', show: false },
      selection: false,
      operationBtns: false,
      pagination: false,
      edit: true,
    })
    this.option7 = Object.assign({}, this.option, {
      id: 'option7',
      $name: 'WriteoffRecvDetail27',
      data: [],
      tips: false,
      operationBtns: false,
      selection: { show: true },
    })
    this.option8 = Object.assign({}, this.option, {
      id: 'option8',
      $name: 'WriteoffRecvDetail28',
      data: [],
      tips: false,
      operationBtns: false,
      selection: { show: false },
    })
    this.option9 = Object.assign({}, this.option, {
      id: 'option9',
      $name: 'WriteoffRecvDetail29',
      data: [],
      tips: false,
      operationBtns: false,
      selection: { show: false },
      index: { show: true },
    })
    const columns1 = [
      {
        prop: 'sourceBizNo',
        label: '单号',
        type: 'button',
        key: 'sourceBizNo',
        width: '140px',
        formatter: ({ row }) => row.sourceBizNo || row.finBillNo,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => this.showDetail(row),
        },
      },
      {
        prop: 'settleCompName',
        label: '分公司',
        type: 'text',
        key: 'settleCompName',
        width: 150,
      },
      {
        prop: 'settleCorpName',
        label: '结算单位',
        type: 'text',
        key: 'settleCorpName',
        width: 150,
      },
      {
        prop: 'settleOrderNo',
        label: '结算单号',
        type: 'text',
        key: 'settleOrderNo',
        width: 130,
        component: 'ColumnTip',
        componentProps: {
          show: false,
          callback: (no, { row }) => {
            this.showOneNoDetail('settleOrderNo', row.settleOrderNo)
          }
        }
      },
      { prop: 'feeName', label: '费用名称', type: 'text', width: 80, key: 'feeName' },
      {
        prop: 'feeEnName',
        label: '费用英文名',
        type: 'text',
        key: 'feeEnName',
        width: 100,
      },
      { prop: 'receipayType', label: '应收应付', type: 'select', readOnly: true, width: 100 },
      { prop: 'currency', label: '	原币种', type: 'text', key: 'currency' },
      { prop: 'feeAmt', label: '原金额', type: 'text', key: 'feeAmt' },
      { prop: 'writeoffBalanceAmt', label: '可核销金额', type: 'text', width: 100, key: 'writeoffBalanceAmt' },
      // {
      //   prop: 'noWriteoffAmt',
      //   label: '可核销金额',
      //   type: 'text',
      //   key: 'noWriteoffAmt',
      // },
      {
        prop: 'writeoffFeeAmt',
        label: '核销金额',
        type: 'input',
        key: 'writeoffFeeAmt',
        inputType: 'number',
        maxlength: '16',
        width: 80,
      },
      // { prop: 'lessPayAmt', label: '短款金额', type: 'input', key: 'lessPayAmt', inputType: "number", maxlength: "16" },
      {
        prop: 'settleCurrency',
        label: '结算币种',
        type: 'text',
        key: 'settleCurrency',
        width: 80,
      },
      {
        prop: 'settleExRate',
        label: '结算汇率',
        type: 'text',
        key: 'settleExRate',
        width: 80,
      },
      { prop: 'settleAmt', label: '结算金额', type: 'text', width: 80, key: 'settleAmt' },
      {
        prop: 'writeoffCurrency',
        label: '核销币种',
        type: 'text',
        key: 'writeoffCurrency',
        width: 80,
      },
      {
        prop: 'writeoffExRate',
        label: '核销汇率',
        type: 'text',
        key: 'writeoffExRate',
        width: 80,
      },
      {
        prop: 'writeoffAmt',
        label: '折币金额',
        type: 'text',
        key: 'writeoffAmt',
        width: 80,
      },
      {
        prop: 'serviceName',
        label: '服务项',
        type: 'text',
        key: 'serviceName',
      },
      {
        prop: 'feeUnit',
        label: '计费单位',
        type: 'select',
        key: 'feeUnit',
        width: 80,
      },
      { prop: 'unitPrice', label: '单价', type: 'text', key: 'unitPrice' },
      { prop: 'unitCount', label: '数量', type: 'text', key: 'unitCount' },
      { prop: 'invoiceStatus', label: '开票状态', width: 100, type: 'select', propInDict: 'feeInvoiceStatus' },
      { prop: 'finDate', label: '财务日期', width: 86, type: 'text' },
      { prop: 'acfinDate', label: '会计日期', width: 86, type: 'text' },
    ]
    const columns4 = [
      {
        prop: 'cutType',
        label: '内外扣类型',
        type: 'select',
        propInDict: 'transferFeeType',
        readOnly: true,
      },
      { prop: 'currency', label: '币种', type: 'text' },
      { prop: 'amt', label: '金额', type: 'text' },
      { prop: 'hasAllotAmt', label: '已摊金额', type: 'text' },
      {
        prop: 'allotAmt',
        label: '本次分摊',
        type: 'input',
        validateInput: (val, row, item, change) => {
          if (change) {
            if (!/^\d+(\.\d{0,2})?$/.test(val)) {
              this.$msgErrClose('请输入正确的分摊金额！')
              const amt = row.amt - row.hasAllotAmt
              row.allotAmt = amt > 0 ? amt : 0
            }
          }
        },
      },
    ]
    const columns5 = [
      {
        prop: 'settleCorpName',
        label: '委托结算单位',
        type: 'select',
        propInDict: 'transferFeeType',
      },
      {
        prop: 'relationType',
        label: '关联类型',
        type: 'select',
        propInDict: 'settleUnitRelationType',
      },
      { prop: 'settleOrderNo', label: '结算单号', type: 'text' },
      {
        prop: 'fileType',
        label: '附件类型',
        type: 'select',
        propInDict: 'settleUnitRelationFileType',
      },
      {
        prop: 'fileName',
        label: '附件',
        type: 'button',
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            if (row.fileNo) {
              this.showAttachment(row.fileNo, row.fileName)
            }
          },
        },
      },
      {
        prop: 'startTime',
        label: '有效期',
        type: 'text',
        formatter: ({ cellValue, column, row, item }) => {
          let { fileType, startTime, stopTime } = row
          return fileType === 'bankseq_file'
            ? '临时'
            : startTime
            ? `${startTime ? startTime.slice(0, 10) : ''} ~ ${stopTime ? stopTime.slice(0, 10) : ''}`
            : ''
        },
      },
    ]
    const columns6 = [
      {
        prop: 'srcCurrency',
        label: '原币种',
        type: 'text',
      },
      {
        prop: 'toCurrency',
        label: '核销币种',
        type: 'text',
      },
      {
        prop: 'settlementRate',
        label: '结算汇率',
        type: 'input',
      },
    ]
    const columns7 = [
      {
        prop: 'sourceBizNo',
        label: '单号',
        type: 'text',
        width: 125,
      },
      {
        prop: 'settleCorpName',
        label: '结算单位',
        type: 'text',
        width: 140,
      },
      {
        prop: 'settleOrderNo',
        label: '结算单号',
        type: 'text',
        width: 125,
      },

      {
        prop: 'feeName',
        label: '费用名称',
        type: 'text',
      },
      {
        prop: 'feeAmt',
        label: '原金额',
        type: 'text',
      },
      {
        prop: 'currency',
        label: '原币种',
        type: 'text',
      },
      {
        prop: 'noWriteoffAmt',
        label: '可核销金额',
        type: 'text',
      },
      {
        prop: 'writeoffAmt',
        label: '结算金额',
        type: 'text',
      },
      {
        prop: 'settleCurrency',
        label: '结算币种',
        type: 'text',
      },
      {
        prop: 'createdName',
        label: '创建人',
        type: 'text',
      },
      {
        prop: 'createdTime',
        label: '创建时间',
        type: 'text',
      },
    ]
    const columns8 = [
      {
        prop: 'useScene',
        label: '使用场景',
        type: 'text',
      },
      {
        prop: 'currency',
        label: '币种',
        type: 'text',
      },
      {
        prop: 'useAmt',
        label: '核销金额',
        type: 'text',
      },
      {
        prop: 'writeoffName',
        label: '核销人',
        type: 'text',
      },
      {
        prop: 'writeoffTime',
        label: '核销时间',
        type: 'text',
      },
    ]
    const columns9 = [
      {
        prop: 'invoiceNo',
        label: '发票号',
        type: 'text',
      },
      {
        prop: 'invoiceType',
        label: '开票类型',
        type: 'select',
        propInDict: 'invoiceType',
      },
      {
        prop: 'preInvoice',
        label: '是否预收发票',
        type: 'text',
        key: 'preInvoice',
        width: 100,
        formatter: ({ row }) => {
          return row.preInvoice === 'yes' ? '是' : row.preInvoice ? '否' : ''
        },
      },
      {
        prop: 'amt',
        label: '开票金额',
        type: 'text',
      },
      {
        prop: 'invoiceAmt',
        label: '核销发票金额',
        type: 'text',
      },
      {
        prop: 'currency',
        label: '开票币种',
        type: 'text',
      },
      {
        prop: 'invoiceRate',
        label: '开票汇率',
        type: 'text',
      },
      {
        prop: 'taxRate',
        label: '开票税率',
        type: 'text',
      },
      {
        prop: 'taxAmt',
        label: '税额',
        type: 'text',
      },
      {
        prop: 'lockAmt',
        label: '未关联费用金额',
        type: 'text',
      },
      {
        prop: 'issueName',
        label: '开票人',
        type: 'text',
      },
      {
        prop: 'issueTime',
        label: '开票时间',
        type: 'text',
      },
    ]
    this.selfColumnsBase = columns1
    this.configColumns.splice(0, 1000, ...this.selfColumnsBase.map((item) => item.prop))
    this.option1.columns = [...this.selfColumnsBase]
    listColumnConfigGet({ scenesCode: 'reg_writeoff_detail_fee_list' }).then((res) => {
      this.columnConfig = true
      this.dealCustomColumn(res)
    })
    // this.option1.columns = columns1
    // this.option2.columns = columns2
    // this.option3.columns = columns3
    this.option4.columns = columns4
    this.option5.columns = columns5
    this.option6.columns = columns6
    this.option7.columns = columns7
    this.option8.columns = columns8
    this.option9.columns = columns9
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
      ],
      fixed: 'right',
      show: true,
      callback: (action, $index, row, option) => {
        if (action === 'Edit') {
          row.edit = true
        } else if (action === 'Save') {
          if (!row.dzgWriteoffNo) return this.$msgErrClose('大掌柜核销编号不能为空!')
          row.edit = false
          const { writeoffReceipayTransferDzgId, dzgWriteoffNo } = row
          updateWriteoffRecipayTransferDzg({ writeoffReceipayTransferDzgId, dzgWriteoffNo }).then((res) => {
            this.$msgSucClose('保存成功')
          })
        }
      },
    })
    this.option11 = Object.assign({}, this.option, {
      id: 'option11',
      $name: 'WriteoffRecvDetail211',
      data: [],
      tips: false,
      selection: false,
      pagination: false,
      operationBtns: operationBtns11,
      index: {
        show: true,
      },
      edit: true,
      columns: [
        {
          prop: 'dzgCompName',
          label: '大掌柜',
          type: 'text',
        },
        {
          prop: 'currency',
          label: '币种',
          type: 'text',
        },
        {
          prop: 'internalDzgAmt',
          label: '转移金额',
          type: 'text',
        },
        {
          prop: 'transferAllotAmtStr',
          label: '手续费分摊金额',
          type: 'text',
          formatter: ({ row }) => row.transferAllotAmtStr || 0,
        },
        { prop: 'dzgWriteoffNo', label: '核销编号', type: 'input', needTrim: true },
      ],
    })
    this.option10 = Object.assign({}, this.option, {
      id: 'option10',
      $name: 'WriteoffRecvDetail210',
      data: [],
      tips: false,
      operationBtns: false,
      selection: { show: false },
      columns: [
        { prop: 'srcCurrency', label: '原币种', type: 'text' },
        { prop: 'toCurrency', label: '核销币种', type: 'text' },
        { prop: 'settlementRate', label: '核销汇率', type: 'text' },
      ],
    })

    this.option12 = Object.assign({}, this.option, {
      id: 'option12',
      $name: 'internalFeeListTable',
      data: [],
      tips: false,
      selection: false,
      pagination: false,
      operationBtns: false,
      edit: true,
      columns: [
        {
          prop: 'sourceBizNo',
          label: '单号',
          type: 'button',
          key: 'sourceBizNo',
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => this.showDetail(row),
          },
        },
        { prop: 'settleCompName', label: '结算分公司名称', type: 'text' },
        { prop: 'receipayType', label: '应收应付', type: 'select', readOnly: true, width: 100 },
        { prop: 'settleCorpName', label: '结算单位名称', type: 'text' },
        { prop: 'settleOrderNo', label: '结算单号', type: 'text' },
        { prop: 'feeName', label: '费用名称', type: 'text' },
        { prop: 'feeAmt', label: '费用金额', type: 'text' },
        { prop: 'currency', label: '费用币种', type: 'text' },
      ],
    })
    this.option13 = Object.assign({}, this.option, {
      id: 'option13',
      $name: 'WriteoffRecvDetail213',
      data: [],
      index: { show: true },
      tips: false,
      rootTipsHide: true,
      selection: false,
      operationBtns: Object.assign({}, this.option.operationBtns, {
        show: false,
      }),
    })
    this.option13.columns = [
      { prop: 'settleCorpName', label: '结算单位', minWidth: 150, type: 'text' },
      { prop: 'currency', label: '币种', type: 'text' },
      { prop: 'arrearReceiveAmt', label: '超期已收金额', type: 'button',
        operationBtns: {
          show: true,
          callback: (action, $index, row, option) => {
            this.routerPush('LateFeeDetail', {
              custOverduePaymentNo: row.custOverduePaymentNo,
            })
          },
        }
      },
      { prop: 'lateFeeAmt', label: '实际滞纳金金额', type: 'button',
        operationBtns: {
          show: true,
          callback: (action, $index, row, option) => {
            this.routerPush('LateFeeDetail', {
              custOverduePaymentNo: row.custOverduePaymentNo,
            })
          },
        }
      },
      {
        prop: 'custOverduePaymentNo',
        label: '滞纳金编号',
        type: 'button',
        operationBtns: {
          show: true,
          callback: (action, $index, row, option) => {
            let query = {custOverduePaymentNo: row.custOverduePaymentNo,}
            // 只有弹框内编号详情，才进入滞纳金列表
            if(this.lateFeeVisible){
              Object.assign(query, {toPath: 'FiscalTermList', toTab: 'lateFeeList'})
            }
            this.routerPush('LateFeeDetail', query)
          },
        },
      },
    ]
  },
  methods: {
    search(list) {
      console.log(list.map((item) => item.invisible))
      this.option1.data = [...list]
      this.writeoffGatherChange()
    },
    init() {
      let COLUMN1 = {
        prop: 'allotAmt',
        label: '本次分摊',
        type: 'input',
        validateInput: (val, row, item, change) => {
          if (change) {
            if (!/^\d+(\.\d{0,2})?$/.test(val)) {
              this.$msgErrClose('请输入正确的分摊金额！')
              const amt = row.amt - row.hasAllotAmt
              row.allotAmt = amt > 0 ? amt : 0
            }
          }
        },
      }
      let COLUMN2 = {
        prop: 'allotAmt',
        label: '本次分摊',
        type: 'button',
        callback: ({ transferFeeId, writeoffReceipayNo }) => {
          let data = {
            currPage: 1,
            pageSize: 1000,
            query: [
              { column: 'transferFeeId', type: 'eq', value: transferFeeId },
              { column: 'writeoffReceipayNo', type: 'eq', value: this.receivableRegInfo.writeoffReceipayNo },
            ],
          }
          listTransferFeeAllot(data).then((res) => {
            this.transferFeeDialog.tableOption.data = res.data.list || []
            this.transferFeeDialog.show = true
            // console.log(res)
          })
        },
      }
      console.log('route.query:', this.$route.query)
      this.receivableRegId = this.$route.query.receivableRegId
      this.writeoffReceipayId = this.$route.query.writeoffReceipayId
      this.source = this.$route.query.source
      this.isJustShowRecord = this.$route.query.isJustShowRecord
      this.writeoffReceipayNo = this.$route.query.writeoffReceipayNo
      this.option1.operationBtns.show = false
      this.option4.columns.splice(4, 1, COLUMN2)
      // }
    },
    getData() {
      this.voucherNos = this.exVoucherNos = ''
      this.$refs.detailFeeSearch && this.$refs.detailFeeSearch.clearData()
      // 核销详情
      const data = {}
      if (this.writeoffReceipayId && this.writeoffReceipayId > -1) {
        data.writeoffReceipayId = this.writeoffReceipayId
      } else if (this.writeoffReceipayNo && this.writeoffReceipayNo !== '') {
        data.writeoffReceipayNo = this.writeoffReceipayNo
      }
      // let data = {
      //   writeoffReceipayId: this.writeoffReceipayId
      // }
      this.lsLoading = true
      writeoffRecvInfo(data)
        .then((res) => {
          if (res.code === 0) {
            this.receivableRegInfo = Object.assign({}, this.receivableRegInfo, res.data.receivableRegInfo, res.data, {
              writeoffCurrency: res.data.receivableRegInfo.currency,
              _writeoffCurrency: res.data.currency,
              balanceDealType: res.data.balanceDealType,
              noWriteoffHasInvoice: res.data.noWriteoffHasInvoice,
            })
            this.voucherNos = res.data.voucherNo || ''
            this.exVoucherNos = res.data.exVoucherNo || ''
            //重新赋值核销id
            this.writeoffReceipayId = res.data.writeoffReceipayId
            this.option1.data = res.data.writeoffItemList.map((item) => {
              // 原币种，即费用币种 item.currency
              // 核销币种
              item.writeoffCurrency = res.data.currency
              // item.writeoffCurrency = this.receivableRegInfo.writeoffCurrency
              item.lessPayAmt = item.writeoffDeductAmt
              // item.noWriteoffAmt = item.settleOrderNoWriteoffAmt
              item.settleOrderNo_multiValue = item.settleOrderNo.split(',')
              return item
            })
            this.transferFeeList = res.data.receivableRegInfo.transferFeeList || []
            this.option4.data = res.data.transferFeeAllotList || []
            this.option5.data = res.data.refSettleUnitList || []
            this.option8.data = res.data.useSceneList || []
            this.option9.data = res.data.invoiceReceivableList || []
            this.option12.data = res.data.internalFeeList || []
            this.option13.data = res.data.custOverduePaymentListDtoList || []
            if (this.option13.data.length && this.$route.query.back == 2) {
              this.lateFeeVisible = true
            }
            if (!this.receivableRegInfo.receivablePrerevId) {
              if (!this.option1.columns.find((v) => v.prop === 'lessPayAmt')) {
                this.option1.columns.splice(9, 0, {
                  prop: 'lessPayAmt',
                  label: '短款金额',
                  type: 'input',
                  key: 'lessPayAmt',
                  inputType: 'number',
                  maxlength: '16',
                })
              }
            }
            if (res.data.writeoffReceipayTransferDzgList?.length) {
              this.option11.data = res.data.writeoffReceipayTransferDzgList.map((item) =>
                Object.assign({}, item, { edit: false })
              )
            }
            this.viaWriteoffCurrencySetRate()
          }
        })
        .finally(() => (this.lsLoading = false))

      actualExchangeRate({ rateType: 'receive' }).then((res) => {
        this.exchageRateList = res.data
        this.viaWriteoffCurrencySetRate()
      })
    },
    viaWriteoffCurrencySetRate() {
      // 根据收款币种设置汇率
      if (this.exchageRateList.length === 0) {
        return
      }

      const value = this.receivableRegInfo._writeoffCurrency // 核销币种

      let currencys = [...new Set(this.option1.data.map((item) => item.currency))]
      const differentCurrencys = currencys.filter((item) => item !== value)
      if (differentCurrencys.length > 0) {
        const exchageRateList = this.exchageRateList.filter((item) => {
          return differentCurrencys.some((currency) => {
            return currency === item.srcCurrency && value === item.toCurrency
          })
        })
        this.settleExchageRateList = exchageRateList // 计算核销需要用到的汇率列表
        this.receivableRegInfo.exchangeRates = exchageRateList.map((item) => {
          return {
            systemRate: item.srcCurrency + '-' + item.toCurrency + ' ' + item.rate,
            settlementRateTitle: item.srcCurrency + '-' + item.toCurrency,
            settlementRate: item.rate,
            exchangeRateId: item.exchangeRateId,
            lowerRate: item.lowerRate,
            upperRate: item.upperRate,
          }
        })
        // this.settlementRateEditDisabled = false
      } else {
        this.settleExchageRateList = currencys.map((currency) => {
          // differentCurrencys.length === 0 表示只有一种费用币种，且选择的核销币种和费用币种相同
          return {
            srcCurrency: currency,
            toCurrency: currency,
            rate: 1,
            exchangeRateId: '',
          }
        })
        this.receivableRegInfo.exchangeRates = currencys.map((item) => {
          return {
            systemRate: item + '-' + item + ' ' + 1,
            settlementRateTitle: item + '-' + item,
            settlementRate: 1,
            exchangeRateId: '',
            lowerRate: 1,
            upperRate: 1,
          }
        })
        // this.settlementRateEditDisabled = true
      }
      if (this.isDetailPage) {
        const len = this.option1.data.length
        this.receivableRegInfo.exchangeRates.forEach((item) => {
          for (let index = 0; index < len; index++) {
            const ele = this.option1.data[index]
            const option = item.settlementRateTitle.split('-')
            if (option[0] === ele.currency && option[1] === ele.settleCurrency) {
              item.settlementRate = ele.writeoffExRate
              break
            }
          }
        })
        console.log('123', this.receivableRegInfo.exchangeRates)
      }
      this.rateChange()
      this.writeoffGatherChange()
      this.option10.data = this.receivableRegInfo.exchangeRates.map((item) => {
        const { settlementRateTitle, settlementRate } = item
        const currencys = settlementRateTitle.split('-')
        return {
          srcCurrency: currencys[0],
          toCurrency: currencys[1],
          settlementRate,
        }
      })
      // 费用合计联动
      // this.feeSumChange()
    },
    rateChange() {
      this.option1.data = this.option1.data.map((item) => {
        // const obj = this.settleExchageRateList.find(subItem => {
        //   return (
        //     item.currency === subItem.srcCurrency &&
        //     this.receivableRegInfo.writeoffCurrency === subItem.toCurrency
        //   )
        // })
        if (!item.writeoffExRate) {
          item.writeoffExRate = item.settleExRate
        }
        return item
      })
    },
    writeoffGatherChange() {
      // 核销汇总的计算
      let currencys = [...new Set(this.option1.data.map((item) => item.currency))]
      let list = this.option1.data
      this.originalGather = currencys.map((item) => {
        let bigNumber = list
          .filter((v) => !v.invisible)
          .reduce((sum, cur) => {
            return cur.writeoffFeeAmt && item === cur.currency ? sum.plus(cur.writeoffFeeAmt) : sum
          }, BIGZERO)
        return {
          currency: item,
          amt: bigNumber.valueOf() || 0,
          isPay: false,
        }
      })
      let bigNumber = list
        .filter((v) => !v.invisible)
        .reduce((sum, cur) => {
          return cur.writeoffFeeAmt ? sum.plus(new LSnum(cur.writeoffFeeAmt).times(cur.writeoffExRate)) : sum
        }, BIGZERO)
      this.exchangeGather = [
        {
          currency: this.receivableRegInfo._writeoffCurrency,
          amt: bigNumber.valueOf() || 0,
          isPay: false,
        },
      ]
    },
    handleLateFee() {
      this.routerPush('FiscalTermList', {
        tabFromOther: 'lateFeeList',
        custOverduePaymentNo: this.option13.data.map(item => item.custOverduePaymentNo).join(',')
      })
    },
    decimalFixed2(x) {
      const result = decimalFixed2(x)
      return result
    },
    // 关闭附件
    handleClose(val) {
      this.$confirmWarn('确定删除' + (val === 'bankseq' ? '水单附件' : '委托附件') + '？', () => {
        this.handleCloseDelete(val)
      })
    },
    handleCloseDelete(val) {
      const data = { receivableRegId: this.receivableRegId, bankseqFileCode: undefined }
      // 水单附件
      if (val === 'bankseq') {
        regDeleteBankseqFile(data).then((res) => {
          this.$msgSucClose('水单附件删除成功!')
          Object.assign(this.receivableRegInfo, {}, { bankseqFileName: '', bankseqFilePath: '' })
        })
      }
      // 委托附件
      if (val === 'proxy') {
        regDeleteProxyFile(data).then((res) => {
          this.$msgSucClose('委托附件删除成功!')
          Object.assign(this.receivableRegInfo, {}, { proxyFileName: '', proxyFilePath: '' })
        })
      }
    },
    mathRound(num) {
      return Math.round(num * 100) / 100
    },

    recheck() {
      this.$confirmWarn('是否确认复核？', () => {
        recheck({ writeoffReceipayIds: [this.writeoffReceipayId] }).then((res) => {
          this.$msgSucClose('复核成功!')
          this.cancel(true)
        })
      })
    },
    handleCollapse() {
      this.showTable1 = !this.showTable1
    },
    cancel(refresh) {
      this.routerBack(refresh, !!this.$route.query.back)
    },
    // 显示水单委托单
    showAttachment(path, name) {
      const href = `/base/fileView/preview/${path}/sowoll`
      window.open(href)
    },
    // 开票申请
    handleInvoice() {
      let recheckStatus = this.receivableRegInfo.recheckStatus
      if (recheckStatus === 'check_back') {
        return this.$msgErrClose('已反核销，无法发起开票申请')
      }

      invoiceReceivableApply({ writeoffReceipayIds: [this.writeoffReceipayId] }).then((res) => {
        const query = {
          writeoffReceipayId: JSON.stringify([this.writeoffReceipayId]),
          source: 'writeOffInvoice',
        }
        if (!res.data.settleOrderFeeList.find((item) => item.openerReceiveInvoice === 'yes')) {
          return this.$msgErrClose('不存在可开票的费用名称！')
        }
        if (res.data.settleOrderFeeList.find((item) => item.openerReceiveInvoice === 'no')) {
          this.$confirmWarn('存在不可开票费用名称，确认是否继续开票？', () => {
            this.routerPush('InvoiceReceivableApply', query)
          })
        } else {
          this.routerPush('InvoiceReceivableApply', query)
        }
      })
    },
    // 跳转至详情页
    showDetail(row) {
      if (!row.sourceBizNo && !row.feeSourceType) {
        return this.$msgErrClose('单号不能为空！')
      }
      this.showOneNoDetail('sourceBizNo', row.sourceBizNo)
    },
    // 编辑核销日期
    editWriteoffDate() {
      if (this.voucherNos || this.exVoucherNos) {
        return this.$msgErrClose('已生成凭证，无法修改核销日期')
      }
      this.disabledData = false
    },
    // 修改核销日期
    updateWriteoffDate() {
      if (!this.receivableRegInfo.writeoffDate) {
        return this.$msgErrClose('请选择核销日期再保存')
      }
      const data = {
        writeoffReceipayId: this.writeoffReceipayId,
        writeoffDate: this.receivableRegInfo.writeoffDate,
      }
      updateWriteoffDate(data).then((res) => {
        this.disabledData = true
        this.$msgSucClose('修改核销日期成功')
      })
    },
    // 删除凭证
    delVoucher() {
      let voucherNos = []
      let voucherSeqNos = []
      this.voucherNos.split(',').forEach((val) => {
        let arr = val.split('/')
        voucherNos.push(arr[1])
        voucherSeqNos.push(arr[0])
      })
      voucherNos = [...new Set(voucherNos)].filter((v) => v !== 'null')
      voucherSeqNos = [...new Set(voucherSeqNos)]
      // return console.log(voucherSeqNos);
      this.$confirmWarn(`您是否确认删除${voucherNos.join(',')}凭证号下面的所有明细？`, () => {
        voucherDelete({ voucherSeqNos }).then((res) => {
          this.$msgSucClose('删除成功！')
          this.getData()
        })
      })
    },
    delVoucher2() {
      let voucherNos = []
      let voucherSeqNos = []
      this.exVoucherNos.split(',').forEach((val) => {
        let arr = val.split('/')
        voucherNos.push(arr[1])
        voucherSeqNos.push(arr[0])
      })
      voucherNos = [...new Set(voucherNos)].filter((v) => v !== 'null')
      voucherSeqNos = [...new Set(voucherSeqNos)]
      // return console.log(voucherSeqNos);
      this.$confirmWarn(`您是否确认删除${voucherNos.join(',')}凭证号下面的所有明细？`, () => {
        exVoucherDelete({ voucherSeqNos }).then((res) => {
          this.$msgSucClose('删除成功！')
          this.getData()
        })
      })
    },
    // preview 预览&生成   isOutter 内账&外账
    batchPrintCreate2(preview, isExt) {
      this.isExt = isExt === true
      this.batchPrintCreate(preview)
    },
    // 预览凭证
    batchPrintCreate(preview) {
      if (preview === 'refresh') {
        this.getData()
        return
      }
      const writeoffReceipayNos = this.receivableRegInfo.writeoffReceipayNo
      const data = {
        writeoffReceipayNos,
        bizType: 'receive_writeoff',
        preview: 'no',
      }
      const acctVoucherSeqno = this.isExt ? this.exVoucherNos.split('/')[1] : this.voucherNos.split('/')[1]
      if (preview) {
        // 预览
        if (acctVoucherSeqno) {
          this.previewDialog.showData = ''
          this.previewDialog.seqNo = acctVoucherSeqno
          this.previewDialog.show = true
        } else {
          data.preview = 'yes'
          this.lsLoading = true
          let method = this.isExt ? exReceipayWriteOffGenerate : receipayWriteOffGenerate
          method(data)
            .then((res) => {
              // if (res.code === 0) {
              // 	this.showPreviewDialog = true
              // 	this.getInfo()
              // }
              this.previewDialog.seqNo = ''
              this.previewDialog.showData = res.data
              this.previewDialog.show = true
            })
            .finally(() => (this.lsLoading = false))
        }
      } else {
        // 生成凭证
        if (acctVoucherSeqno) {
          return this.$msgErrClose('凭证已生成，请勿重复生成！')
        }
        this.$confirm('确认生成凭证?', '生成凭证', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          lockScroll: 'true',
          type: 'warning',
        })
          .then(() => {
            let method = this.isExt ? exReceipayWriteOffGenerate : receipayWriteOffGenerate
            return method(data)
          })
          .then(() => {
            this.$msgSucClose('凭证已经处理！')
            // 获取凭证号
            window.setTimeout(() => {
              this.getData()
            }, 1000)
          })
          .catch(function () {})
      }
    },
    // 反核销
    reverseWriteoff() {
      if (this.voucherNos || this.exVoucherNos) {
        return this.$msgErrClose('已经生成会计凭证的核销，无法进行反核销操作!')
      }
      this.$confirm('您是否确认对该记录进行反核销?', '反核销', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        lockScroll: 'true',
        type: 'warning',
      })
        .then(() => {
          this.reverseWriteoffFn()
        })
        .catch(() => {})
    },
    reverseWriteoffFn() {
      const writeoffReceipayId = this.writeoffReceipayId
      reverse({ writeoffReceipayId }).then((res) => {
        this.$msgSucClose('反核销提交成功')
        if (['transfer', 'prepay_refund'].includes(this.receivableRegInfo.type)) {
          this.cancel(true)
        } else {
          this.getData()
        }
      })
    },
    // 重新核销
    toReWriteoff() {
      this.$confirm('您是否确认对该记录进行重新核销?', '重新核销', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        lockScroll: 'true',
        type: 'warning',
      })
        .then(() => {
          this.toReWriteoffFn()
        })
        .catch(() => {})
    },
    toReWriteoffFn() {
      const writeoffReceipayId = this.writeoffReceipayId
      this.lsLoading = true
      toReWriteoff({ writeoffReceipayId })
        .then((res) => {
          // 预收款核销
          if (res.data.writeoffSource === 'receivable_prerev') {
            this.$store.dispatch('tagsView/delView', this.$route)
            this.routerPush('PrerevWriteoff', {
              source: 'createPrerevWriteoffFrom',
              receivablePrerevId: res.data.receivablePrerevId,
              routerBackReset: true,
            })
            return
          }

          // 收款核销
          window.sessionStorage.setItem('_writeoffRemark', res.data.remark || '')
          window.sessionStorage.setItem('_writeoffCurrency', res.data.currency)
          window.sessionStorage.setItem('_writeoffExRate', res.data.writeoffExRate)
          window.sessionStorage.setItem('_totalAmt', res.data.writeoffExAmt)
          window.sessionStorage.setItem('_receivableReg', JSON.stringify(res.data.receivableReg))
          // this.$message({  message: '重新核销',  type: 'success',  showClose: true })
          if (res.data.writeoffItemList?.length) {
            window.sessionStorage.setItem('writeoffItemList', JSON.stringify(res.data.writeoffItemList))
          }
          // this.getData()
          this.$msgSucClose('重新核销提交成功')
          this.$store.dispatch('tagsView/delView', this.$route)
          // this.handleSkip(res.data)
          let receivableRegId = res.data.receivableRegId
          this.routerPush('WriteoffRecvDetail', { receivableRegId, routerBackReset: true, source: 'createFromReceivableRegId' })
        })
        .finally(() => (this.lsLoading = false))
    },
    // 更多汇率
    showExchangeRates() {
      this.exchangeRatesDialog = true
    },
    // 自定义表头
    customColumnsPopClose(action, value) {
      this.customColumnsPopShow = false
      if (action === 'Confirm') {
        let columnList = this.getColumnsValues(value) // getColumnsValues在本页面无作用
        listColumnConfigSave({ columnList, scenesCode: 'reg_writeoff_detail_fee_list' }).then((res) => {
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
    updateRemark() {
      updateRemark({ writeoffReceipayId: this.writeoffReceipayId, remark: this.receivableRegInfo.remark }).then((res) => {
        this.$msgSucClose('保存成功！')
      })
    },
    sortChange(column, prop, order) {
      // console.log(column, prop, order)
      if (!order) return
      let arr = [
        'feeAmt',
        'writeoffBalanceAmt',
        'writeoffFeeAmt',
        'settleExRate',
        'settleAmt',
        'writeoffExRate',
        'writeoffAmt',
        'unitPrice',
        'unitCount',
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
    previewAll() {
      voucherListRecv({ writeoffReceipayId: this.writeoffReceipayId }).then((res) => {
        if (res.data && res.data.length) {
          this.voucherNosTableOption.list = res.data || []
          this.voucherNosTableOption.show = true
        } else {
          this.$msgErrClose('无关联的凭证！')
        }
      })
    },
  },
  activated() {
    // if (!this.$route.meta.isUseCache) {
    //   Object.assign(this.receivableRegInfo, defaultCreateQuery)
    //   console.log(defaultCreateQuery)
    //   this.init()
    //   this.getData()
    // }
    this.lateFeeVisible = false // 防止叉掉了页面时，滞纳金窗口还在
    Object.assign(this.receivableRegInfo, defaultCreateQuery)
    this.init()
    this.getData()

    this.feeSource = ''
    this.invoiceReceivableIds = []
  },
  components: {
    FinanceTable,
    CustomColumns,
    FinanceSearch,
    FinanceUpload,
    PreviewDialog,
    FinanceDialogTable,
    DetailFeeSearch,
    VoucherNosTable,
  },
  computed: {
    ...mapState({
      defaultColumns: (state) => state.finance.columns.defaultColumns,
      columnsBase4: (state) => state.finance.columns.columnsBase4,
    }),
    ...mapGetters(['dictMap', 'dictMapObj']),
  },
}
</script>
<style scoped lang="scss">
.el-tag {
  height: 20px;
  line-height: 20px;
  background-color: #fff;
  border-color: #fff;
  cursor: pointer;
  position: relative;
  top: -2px;
}
.payInfo-box {
  .item-box {
    border-bottom: 1px solid #d8d8d8;
    padding-bottom: 0;
    margin: 0 8px 16px;
    .title {
      font-weight: 600;
      color: #222222;
      line-height: 20px;
      padding: 0 8px;
    }
    .info-box {
      display: flex;
      flex-wrap: wrap;
      margin: 8px;
      ::v-deep {
        .multi__slot {
          .el-input {
            width: 116px;
          }
          button {
            padding: 0;
          }
        }
        .detail__label {
          width: 112px !important;
        }
      }

      // .el-input,
      // .el-input--suffix,
      // .el-upload--text,
      // .finance-table-upload,
      // .el-select {
      //   width: 120px;
      // }
      .link {
        font-weight: 400;
        color: #3e80f5;
        line-height: 20px;
        cursor: pointer;
        margin-left: 5px;
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
      margin: 4px 8px;
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
</style>
<style scoped>
.finance-approve-btns-box {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  border-radius: 4px 4px 0px 0px;
  border-bottom: 1px solid #e9e9e9;
}
.finance-approve-btns-left {
  font-size: 16px;
  font-weight: 600;
  color: #222222;
  line-height: 16px;
  padding: 2px 0;
}
.finance-approve-detail-main {
  padding: 0px 14px 0px;
}

.settlement-exchange-rates {
  width: 260px;
  display: inline-block;
  margin-right: 24px;
  vertical-align: top;
}
.settlement-exchange-rates .settlement-exchange-rates-title {
  color: #222222;
  line-height: 28px;
}

.money-total .money-total-span-black {
  color: #222222;
  font-weight: 400;
  margin-right: 5px;
}
.money-total .money-total-span-left-space {
  margin-left: 8px;
  color: #222222;
  font-weight: 400;
}
</style>
