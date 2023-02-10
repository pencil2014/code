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
        <div class="finance-approve-btns-left">
          {{
            !isDetailPage
              ? $t("Collect.receiptWriteoff")
              : $t("PreClose.collectwfDet")
          }}
        </div>
        <div class="finance-approve-btns-right">
          <el-button
            @click="recheck"
            size="mini"
            type="primary"
            v-if="!isJustShowRecord"
            >{{ $t("PreClose.confirReview") }}</el-button
          >
          <el-button
            v-if="checkAuth($route.name, 'btn-reverseWriteoff')"
            @click="reverseWriteoff"
            size="mini"
            type="success"
            >{{ $t("Hedge.antiWriteOff") }}</el-button
          >
          <el-button
            v-if="checkAuth($route.name, 'btn-toReWriteoff')"
            @click="toReWriteoff"
            size="mini"
            type="success"
            >{{ $t("Collect.rewriting") }}</el-button
          >
          <!-- <el-button
            v-if="!isJustShowRecord && checkAuth($route.name, 'btn-applyInvoice')"
            @click="handleInvoice"
            size="mini"
            type="primary"
          >{{$t('Settle.invoiceApply')}}</el-button> -->
          <el-button
            v-if="!voucherNos && checkAuth($route.name, 'btn-voucherView')"
            @click="batchPrintCreate2(true)"
            type="inner"
            size="mini"
            >{{ $t("Hedge.previewVouchers") }}</el-button
          >
          <el-button
            v-if="!voucherNos && checkAuth($route.name, 'btn-voucherCreate')"
            @click="batchPrintCreate2(false)"
            size="mini"
            type="inner"
            >{{ $t("Hedge.generateVouchers") }}</el-button
          >
          <el-button
            v-else-if="checkAuth($route.name, 'btn-voucherDel')"
            @click="delVoucher"
            size="mini"
            type="danger"
            >{{ $t("Hedge.deleteVouchers") }}</el-button
          >
          <el-button
            v-if="!exVoucherNos && checkAuth($route.name, 'btn-voucherView')"
            @click="batchPrintCreate2(true, true)"
            size="mini"
            type="outer"
            >{{ $t("Hedge.previewExternal") }}</el-button
          >
          <el-button
            v-if="!exVoucherNos && checkAuth($route.name, 'btn-voucherCreate')"
            @click="batchPrintCreate2(false, true)"
            size="mini"
            type="outer"
            >{{ $t("Hedge.generateExternal") }}</el-button
          >
          <el-button
            v-else-if="checkAuth($route.name, 'btn-voucherDel')"
            @click="delVoucher2"
            size="mini"
            type="danger"
            >{{ $t("Hedge.deleteExternal") }}</el-button
          >
          <el-button
            v-if="checkAuth($route.name, 'btn-voucherAll')"
            @click="previewAll"
            size="mini"
            type="primary"
            >{{ $t("Hedge.viewAll") }}</el-button
          >
          <el-button @click="cancel" size="mini">{{
            $t("Common.back")
          }}</el-button>
        </div>
      </div>
      <div class="payInfo-box">
        <div class="item-box table-box">
          <div class="title-box">
            <div class="title">{{ $t("Charge.writeoffInfo") }}</div>
            <!-- <div class="btn">
              <div @click="showReceiveData = !showReceiveData" class="toggle">
                {{ showReceiveData ? $t('Common.collapse') : $t('Common.expand') }}
                <i
                  :class="[`el-icon-arrow-${showReceiveData?'up':'down'}`]"
                ></i>
              </div>
            </div>-->
          </div>
          <!-- <div class="info-box" v-show="showReceiveData"> -->
          <div class="info-box" style="border-bottom: 1px solid #d8d8d8;">
            <DetailDiv
              :label="$t('Settle.branchCompany')"
              :content="receivableRegInfo.recvCompName"
              isTooltip
            />
            <DetailDiv
              :label="$t('Hedge.writeoffNo')"
              :content="receivableRegInfo.writeoffReceipayNo"
              isBold
            />
            <DetailDiv
              :label="$t('Collect.abbreviat')"
              :content="receivableRegInfo.accountShortName"
              isTooltip
              isBold
            />
            <DetailDiv
              :label="$t('Collect.receiptCurrency')"
              :content="receivableRegInfo.writeoffCurrency"
              isBold
            />
            <DetailDiv
              :label="$t('Collect.amtReceived')"
              :content="receivableRegInfo.realAmt"
              isBold
            />
            <DetailDiv
              :label="$t('FeeList.receivePayDates')"
              :content="receivableRegInfo.recvDate"
              isBold
            />
            <DetailDiv
              :label="$t('Collect.bankFlowNumber')"
              :content="receivableRegInfo.bankSeqNo"
            />
            <DetailDiv :label="$t('PreClose.waterbillattach')" isSlot>
              <el-tooltip
                v-if="receivableRegInfo.payBankseqFileName"
                :content="receivableRegInfo.payBankseqFileName"
                placement="top-start"
              >
                <el-tag
                  class="detail__content"
                  size="medium"
                  @click="
                    showAttachment(
                      receivableRegInfo.payBankseqFileNo,
                      receivableRegInfo.payBankseqFileName
                    )
                  "
                  >{{ receivableRegInfo.payBankseqFileName }}</el-tag
                >
              </el-tooltip>
            </DetailDiv>
            <DetailDiv
              :label="$t('Collect.paymentBank')"
              :content="receivableRegInfo.payBankName"
            />
            <DetailDiv
              :label="$t('Collect.accountName')"
              :content="receivableRegInfo.payAccountName"
              isTooltip
              isBold
            />
            <DetailDiv
              :label="$t('Collect.accountNumber')"
              :content="receivableRegInfo.payAccountNo"
            />
            <DetailDiv :label="$t('PreClose.recewaterbill')" isSlot>
              <el-tooltip
                v-if="receivableRegInfo.bankseqFileName"
                :content="receivableRegInfo.bankseqFileName"
                placement="top-start"
              >
                <el-tag
                  class="detail__content"
                  size="medium"
                  @click="
                    showAttachment(
                      receivableRegInfo.bankseqFileCode,
                      receivableRegInfo.bankseqFileName
                    )
                  "
                  >{{ receivableRegInfo.bankseqFileName }}</el-tag
                >
              </el-tooltip>
            </DetailDiv>
          </div>

          <div class="info-box">
            <DetailDiv
              :label="$t('Charge.underwritSubtypes')"
              :content="
                dictMapObj.recWriteoffSubType[receivableRegInfo.writeoffSubType]
              "
            />
            <DetailDiv
              :label="$t('Collect.writeoffCurrency')"
              :content="receivableRegInfo._writeoffCurrency"
            />
            <DetailDiv
              :label="$t('Charge.writeoffAmt')"
              :content="receivableRegInfo.totalWirteoffAmt"
            />
            <DetailDiv :label="$t('Hedge.internalVoucherNo')" isSlot isBold>
              <MultiBtn
                :btnStr="voucherNos || ''"
                @generate="batchPrintCreate"
              />
            </DetailDiv>
            <DetailDiv :label="$t('Hedge.externalVoucherNo')" isSlot isBold>
              <MultiBtn
                :isEx="true"
                :btnStr="exVoucherNos || ''"
                @generate="batchPrintCreate2($event, true)"
              />
            </DetailDiv>
            <!-- <template v-if="receivableRegInfo.receivablePrerevId"> -->
            <DetailDiv
              :label="$t('PreClose.adjustmentAmt')"
              :content="receivableRegInfo.currency"
            />
            <!-- v-if="receivableRegInfo.writeoffSubType === 'prerev_adjuest'" -->
            <DetailDiv
              :label="$t('Collect.adjustmentAmt')"
              :content="receivableRegInfo.adjustAmt"
            />
            <!-- </template> -->
            <!-- <template v-else> -->
            <DetailDiv
              :label="$t('Collect.customerShortAmt')"
              :content="receivableRegInfo.lessRecvAmt"
            />
            <!-- <DetailDiv
              :label="$t('PreClose.retroactiveinvo')"
              :content="receivableRegInfo.noWriteoffHasInvoice === 'yes' ? '是' : '否'"
            /> -->
            <DetailDiv
              :label="$t('Hedge.reviewStatus')"
              :content="
                dictMapObj['writeoffRecheckStatus'][
                  receivableRegInfo.recheckStatus
                ]
              "
              :isIcon="
                receivableRegInfo.recheckStatus === 'no_check' ? true : false
              "
            />
            <DetailDiv
              :label="$t('Hedge.reviewer')"
              :content="receivableRegInfo.recheckName"
            />
            <DetailDiv
              :label="$t('Collect.reviewTime')"
              :content="receivableRegInfo.recheckTime"
            />
            <DetailDiv :label="$t('FeeList.writeOffDate')" isSlot isBold>
              <div class="multi__slot">
                <span v-if="disabledData">{{
                  receivableRegInfo.writeoffDate
                }}</span>
                <el-date-picker
                  v-else
                  :disabled="disabledData"
                  :placeholder="$t('Common.plSelect')"
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
                  >{{ $t("Common.modify") }}</el-button
                >
                <el-button
                  @click="updateWriteoffDate"
                  style="margin-left: 5px"
                  type="text"
                  v-show="!disabledData"
                  >{{ $t("Common.save") }}</el-button
                >
              </div>
            </DetailDiv>
            <DetailDiv
              v-if="receivableRegInfo.exchangeRates.length"
              :label="$t('Collect.writeoffrate')"
              isSlot
            >
              <div>
                {{ receivableRegInfo.exchangeRates[0].settlementRateTitle }}
                {{ receivableRegInfo.exchangeRates[0].settlementRate }}
                <span
                  @click="showExchangeRates"
                  class="link"
                  v-show="receivableRegInfo.exchangeRates.length > 1"
                  >{{ $t("Collect.moreRates") }}</span
                >
              </div>
            </DetailDiv>
            <DetailDiv :label="$t('Collect.wfRemarks')" isSlot isFull>
              <div class="detail__content" style="display: flex;">
                <el-input
                  :placeholder="$t('Common.plEnter')"
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
                  >{{ $t("PreClose.savewritenote") }}</el-button
                >
              </div>
            </DetailDiv>

            <!-- <DetailDiv
                :label="$t('Collect.receiptType')"
                :content="dictMapObj['receivableRegType'][receivableRegInfo.type]"
              />
              <DetailDiv
                :label="$t('Collect.receiptStatus')"
                :content="dictMapObj['receivableRegStatus'][receivableRegInfo.confirmStatus]"
              />
              <DetailDiv :label="$t('Collect.recvWay')" :content="dictMapObj['recvWay'][receivableRegInfo.recvWay]" />
              <DetailDiv :label="$t('Settle.recvAccountNo')" :content="receivableRegInfo.accountNo" />
              <DetailDiv
                :label="$t('Settle.settleMode')"
                :content="dictMapObj['bankAccountSettleMode'][receivableRegInfo.settleMode]"
              />
              <DetailDiv
                :label="$t('Collect.transRemarks')"
                :content="receivableRegInfo.receivableRegInfo?receivableRegInfo.receivableRegInfo.remark:''"
              />

              <DetailDiv :label="$t('Common.createdBy')" :content="receivableRegInfo.createdName" />
              <DetailDiv :label="$t('Common.createTime')" :content="receivableRegInfo.createdTime" />
              <DetailDiv :label="$t('Common.updatedBy')" :content="receivableRegInfo.updatedName" />
            <DetailDiv :label="$t('Common.updateTime')" :content="receivableRegInfo.updatedTime" isBold />-->
            <!-- </template> -->
          </div>
          <FinanceTable :option="option8" v-if="isDetailPage" />
        </div>
        <div class="item-box">
          <div class="title">{{ $t("Charge.setUnitInfo") }}</div>
          <div class="info-box">
            <DetailDiv
              :label="$t('FeeList.settleCorp')"
              :content="receivableRegInfo.settleCorpName"
              isTooltip
              isBold
            />
            <DetailDiv
              :label="$t('FeeList.settleCorpType')"
              :content="
                (receivableRegInfo.settleCorpType || '').replace(
                  /\b(\w+)\b/g,
                  item => dictMapObj.unitType[item]
                )
              "
            />
            <DetailDiv
              :label="$t('Collect.isVirtual')"
              :content="dictMapObj.yesNo[receivableRegInfo.isTemporary]"
            />
            <DetailDiv
              :label="$t('PreClose.entrustedrela')"
              :content="
                option5.data.length ? $t('Common.yes') : $t('Common.no')
              "
              labelWidth="210"
            />
          </div>
          <FinanceTable :option="option5" v-show="option5.data.length" />
        </div>
        <div class="table-box" v-show="option4.data.length">
          <div class="title-box">
            <div class="title">{{ $t("Charge.transferFee") }}</div>
            <div class="btn"></div>
          </div>
          <FinanceTable :option="option4" />
        </div>
        <div
          v-if="option13.data && option13.data.length"
          class="finance-table-container"
        >
          <div class="money-box">
            <div class="money-box-left">
              <div class="money-title size-12">
                {{ $t("Hedge.latePaymentFee") }}
              </div>
            </div>
            <div class="money-box-right"></div>
          </div>
          <FinanceTable :option="option13" />
        </div>
        <!-- 转大掌柜余额 -->
        <!-- <div class="table-box" v-show="option11.data.length">
          <div class="title-box">
            <div class="title">{{$t('Charge.transferbal')}}</div>
            <div class="btn"></div>
          </div>
          <FinanceTable :option="option11" />
        </div> -->
        <!-- <div class="table-box" v-show="option9.data.length">
          <div class="title-box">
            <div class="title">{{ $t("Charge.invoiceInfo") }}</div>
            <div class="btn"></div>
          </div>
          <FinanceTable :option="option9" />
        </div> -->
        <!-- 内部往来费用明细信息 -->
        <div class="table-box" v-if="option12.data.length">
          <div class="title-box" style="margin-bottom: 0">
            <div class="title">{{ $t("PreClose.transcosts") }}</div>
            <div class="btn"></div>
          </div>
          <FinanceTable :option="option12" />
        </div>
        <div class="table-box">
          <div class="title-box" style="margin-bottom: 0">
            <div class="title">
              {{ $t("FeeList.expensesList") }}
              <template>
                <div class="money-list" v-show="originalGather.length">
                  {{ $t("Common.writeoffs") }}:
                  <span
                    :key="'originalGather' + index"
                    v-for="(item, index) in originalGather"
                  >
                    {{ item.currency }}
                    <b>{{ decimalFixed2(item.amt) }}</b>
                  </span>
                </div>
                <div class="money-list" v-show="exchangeGather.length">
                  {{ $t("Collect.convertCurrency") }}：
                  <span
                    :key="'exchangeGather' + index"
                    v-for="(item, index) in exchangeGather"
                  >
                    {{ item.currency }}
                    <b>{{ decimalFixed2(item.amt) }}</b>
                  </span>
                </div>
              </template>
            </div>
            <div class="btn">
              <el-button
                class="finance-btn"
                @click="feeSearchToggle = !feeSearchToggle"
                size="mini"
                type="primary"
                >{{
                  feeSearchToggle
                    ? $t("Common.hideSearch")
                    : $t("Common.showSearch")
                }}</el-button
              >
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
    <el-dialog
      :visible.sync="exchangeRatesDialog"
      class="self-dialog"
      :title="$t('Collect.writeoffrate')"
      width="600px"
    >
      <FinanceTable :option="option10" />
      <div class="dialog-footer" slot="footer">
        <el-button @click="exchangeRatesDialog = false" size="mini">{{
          $t("Common.close")
        }}</el-button>
      </div>
    </el-dialog>
    <!-- 分摊费用详情弹框 -->
    <FinanceDialogTable :option="transferFeeDialog" />
    <VoucherNosTable :dialogOption="voucherNosTableOption" @close="getData" />
    <el-dialog
      :title="$t('Hedge.latePaymentFee')"
      :visible.sync="lateFeeVisible"
      :close-on-click-modal="false"
      width="800px"
    >
      <FinanceTable :option="option13" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleLateFee" size="mini" type="primary"
          >{{ $t("Hedge.immediatePro") }}</el-button
        >
        <el-button @click="lateFeeVisible = false" size="mini">{{
          $t("Common.close")
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import FinanceTable from "@/views/finance/components/financeTableMass/financeTableMass";
import DetailFeeSearch from "@/views/finance/components/financeSearch/detailFeeSearch";
import CustomColumns from "@/components/customColumns";
import PreviewDialog from "@/views/finance/voucher/components/previewDialog";
import VoucherNosTable from "@/views/finance/voucher/components/voucherNosTable";
import { mixin } from "@/views/finance/orderFee/orderFee/mixin";
import { mapState, mapGetters } from "vuex";
import FinanceSearch from "@/views/finance/components/financeSearch/financeSearch";
import FinanceUpload from "@/views/finance/components/financeUpload/financeUpload";
import FinanceDialogTable from "@/views/finance/components/financeDialog/tableDialog";
import {
  regDeleteBankseqFile,
  regDeleteProxyFile
} from "@/api/fin/receivableReg";
import {
  writeoffRecvInfo,
  recheck,
  updateWriteoffDate,
  reverse,
  toReWriteoff,
  updateWriteoffRecipayTransferDzg,
  listTransferFeeAllot,
  invoiceReceivableApply,
  updateRemark
} from "@/api/fin/writeoffRecv";
import {
  receipayWriteOffGenerate,
  exReceipayWriteOffGenerate,
  voucherDelete,
  exVoucherDelete,
  voucherListRecv
} from "@/api/fin/voucher";
import {
  actualExchangeRate,
  listColumnConfigGet,
  listColumnConfigSave
} from "@/api/base";
import { decimalFixed2 } from "@/views/finance/utils/finance";
import { routerMixin } from "@/views/finance/mixins/routerMixin";
const defaultCreateQuery = {
  balanceDealType: "",
  lessPayAmt: "",
  unusedAmt: "",
  noWriteoffHasInvoice: "no",
  bankseqFileName: "",
  bankseqFilePath: "",
  payBankseqFileName: "",
  payBankseqFilePath: "",
  proxyFileName: "",
  proxyFilePath: "",
  exchangeRates: [],
  fixedTransferFee: ""
};
export default {
  name: "writeoffReceipay2",
  mixins: [mixin, routerMixin],
  data() {
    return {
      feeSearchToggle: true, //费用搜索默认显示
      voucherNos: "",
      exVoucherNos: "",
      voucherNosTableOption: { show: false, list: [] },
      query: {
        bankseqFileNo: "",
        bankSeqNo: "",
        lessPayAmt: 0,
        lessPayDealway: "",
        remark: ""
      },
      autocomplete: {},
      showTable1: false,
      rejectDialogOpen: false,
      showBillDetail: false,
      orderBillId: "",
      multipleSelection1: [],
      multipleSelection2: [],
      multipleSelection3: [],
      relevanceOpne: false,
      relevanceOpne2: false,
      searchOption1: {
        columns: [
          {
            disabled: true,
            label: this.$t("FeeList.settleCorp"),
            prop: "settleCorpCode",
            type: "input",
            placeholder: ""
          },
          // {
          //   label: this.$t("FeeList.invoiceNo"),
          //   prop: "invoiceNo",
          //   type: "input"
          // }
          // {
          //   label: this.$t('Settle.invoiceTitle'),
          //   prop: 'title',
          //   type: 'input',
          // },
          // {
          //   label: this.$t('Settle.invoiceCur'),
          //   prop: 'currency',
          //   propInDict: 'validCurrency',
          //   type: 'select',
          // },
        ],
        data: {
          invoiceType: "",
          invoiceNo: "",
          currency: ""
        }
      },
      searchOption2: {
        columns: [
          {
            label: this.$t("PreClose.settlementNumber"),
            prop: "settleOrderNo",
            type: "input"
          },
          {
            label: this.$t("Collect.lockStatus"),
            prop: "finLockStatus",
            type: "select",
            propInDict: "finLockStatus"
          },
          {
            label: this.$t("Settle.orderType"),
            prop: "orderType",
            type: "select",
            propInDict: "settleOrderType"
          }
        ],
        data: {
          settleOrderNo: ""
        }
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
        title: this.$t("PreClose.sharingdeta"),
        show: false,
        width: "700px",
        buttonHide: true,
        tableOption: {
          pagination: false,
          selection: false,
          data: [],
          columns: [
            {
              prop: "settleCompName",
              label: this.$t("FeeList.settleComp"),
              type: "text",
              minWidth: 230
            },
            {
              prop: "orderNo",
              label: this.$t("FeeList.orderNo"),
              type: "text",
              minWidth: 150
            },
            {
              prop: "bdEmployeeName",
              label: this.$t("PreClose.salesman"),
              type: "text"
            },
            {
              prop: "allotAmt",
              label: this.$t("PreClose.apportionm"),
              type: "text"
            }
          ]
        }
      },
      moneyTitle1: this.$t("FeeList.receivable"),
      moneyTitle2: this.$t("FinBill.moneyTitle2"),
      moneyTitle3: this.$t("FinBill.moneyTitle3"),
      moneyTotalReceive: [],
      comeType: this.$t("Common.modify"),
      hedgingRecord: [],
      deleteSelection: [],
      reason: "",
      applyPersonId: "",
      remark: "",
      employeeSelectOptions: [],
      infoData: {},
      receivableRegInfo: Object.assign({}, defaultCreateQuery),
      transferFeeList: [],
      prepayApplys: [],
      writeoffItemList: [],
      settleExRateSummarys: [],
      auditStatus: "",
      form: {
        errorCause: "error",
        errorRemark: this.$t("PreClose.remarkreason")
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
      uploadFileTitle: "",
      uploadFileApi: "",
      uploadParams: {},
      fileList: [],
      addTransferFeeForm: {
        cutType: "",
        transferFee: "",
        currency: ""
      },
      addTransferFeeVisible: false,
      addTransferFeeRules: {
        cutType: [
          {
            required: true,
            message: this.$t("PreClose.cannotbeempty"),
            trigger: "blur"
          }
        ],
        transferFee: [
          {
            required: true,
            message: this.$t("PreClose.handlingfee"),
            trigger: "blur"
          }
        ],
        currency: [
          {
            required: true,
            message: this.$t("PreClose.feecurrency"),
            trigger: "blur"
          }
        ]
      },
      receivableRegId: "",
      writeoffReceipayId: "",
      source: "",
      isJustShowRecord: false,
      writeoffReceipayNo: "",
      isDetailPage: true,
      // 应收核销金额
      sumAmt: null,
      showReceiveData: true,
      disabledData: true,
      // 凭证
      previewDialog: {
        show: false,
        title: this.$t("Common.previewVoucher"),
        seqNo: "",
        showData: {}
      },
      showPreviewDialog: false,
      exchangeRatesDialog: false,
      // 自定义表头弹框
      customColumnsPopShow: false,
      selfColumnsBase: [],
      lateFeeVisible: false
    };
  },
  created() {
    const _this = this;
    this.autocomplete = {
      querySearch: (queryString, cb) => {
        _this.selectedOptionItem = "";
        _this.querySettleUnit(queryString, cb);
      },
      select: (optionItem, row) => {
        _this.selectedOptionItem = optionItem;
        console.log("this.selectedOptionItem:", _this.selectedOptionItem);
        _this.form.newSettleCorpName = optionItem.value;
        _this.form.newSettleCorpCode = optionItem.key;
      },
      change: (val, row) => {
        // 延时150ms获取select中的改变
        setTimeout(() => {
          if (_this.selectedOptionItem === "") {
            _this.form.newSettleCorpName = "";
            _this.form.newSettleCorpCode = "";
            return;
          }
        }, 150);
      }
    };
    const operationBtns = Object.assign({}, this.option.operationBtns, {
      text: "",
      show: true, // 详情不需要删除
      data: [
        {
          label: this.$t("Common.del"),
          type: "text",
          showFn: row => row.confirmStatus !== "yes",
          action: "Delete"
        }
      ]
    });
    this.option1 = Object.assign({}, this.option, {
      customColumns: {
        show: true,
        handleCustomColumns: () => (this.customColumnsPopShow = true)
      },
      id: "option1",
      $name: "WriteoffRecvDetail21",
      data: [],
      tips: { text: "", show: false },
      operationBtns: operationBtns,
      selection: { show: false },
      edit: true,
      colorColumns: ["receipayType"],
      sortable: true,
      sortChange: this.sortChange
    });
    this.option4 = Object.assign({}, this.option, {
      id: "option4",
      $name: "WriteoffRecvDetail24",
      data: [],
      tips: false,
      operationBtns: false,
      selection: false,
      edit: true
    });
    this.option5 = Object.assign({}, this.option, {
      id: "option5",
      $name: "WriteoffRecvDetail25",
      data: [],
      tips: false,
      operationBtns: false,
      selection: false
    });
    this.option6 = Object.assign({}, this.option, {
      id: "option6",
      $name: "WriteoffRecvDetail26",
      tips: { text: "", show: false },
      selection: false,
      operationBtns: false,
      pagination: false,
      edit: true
    });
    this.option7 = Object.assign({}, this.option, {
      id: "option7",
      $name: "WriteoffRecvDetail27",
      data: [],
      tips: false,
      operationBtns: false,
      selection: { show: true }
    });
    this.option8 = Object.assign({}, this.option, {
      id: "option8",
      $name: "WriteoffRecvDetail28",
      data: [],
      tips: false,
      operationBtns: false,
      selection: { show: false }
    });
    this.option9 = Object.assign({}, this.option, {
      id: "option9",
      $name: "WriteoffRecvDetail29",
      data: [],
      tips: false,
      operationBtns: false,
      selection: { show: false },
      index: { show: true }
    });
    const columns1 = [
      {
        prop: "sourceBizNo",
        label: this.$t("PreClose.bizNo"),
        type: "button",
        key: "sourceBizNo",
        width: "140px",
        formatter: ({ row }) => row.sourceBizNo || row.finBillNo,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => this.showDetail(row)
        }
      },
      {
        prop: "settleCompName",
        label: this.$t("FeeList.settleComp"),
        type: "text",
        key: "settleCompName",
        width: 150
      },
      {
        prop: "settleCorpName",
        label: this.$t("FeeList.settleCorp"),
        type: "text",
        key: "settleCorpName",
        width: 150
      },
      {
        prop: "settleOrderNo",
        label: this.$t("FeeList.settleOrderNo"),
        type: "text",
        key: "settleOrderNo"
      },
      // {
      //   prop: "feeName",
      //   label: this.$t("FeeList.feeName"),
      //   type: "text",
      //   width: 80,
      //   key: "feeName"
      // },
      {
        prop: "feeEnName",
        label: this.$t("FeeList.feeEname"),
        type: "text",
        key: "feeEnName",
        width: 100
      },
      {
        prop: "receipayType",
        label: this.$t("Settle.receipayType"),
        type: "select",
        readOnly: true,
        width: 100
      },
      {
        prop: "currency",
        label: this.$t("Settle.orignalCurrency"),
        type: "text",
        key: "currency"
      },
      {
        prop: "feeAmt",
        label: this.$t("Collect.originalamount"),
        type: "text",
        key: "feeAmt"
      },
      {
        prop: "writeoffBalanceAmt",
        label: this.$t("Collect.writeoffableamount"),
        type: "text",
        width: 100,
        key: "writeoffBalanceAmt"
      },
      // {
      //   prop: 'noWriteoffAmt',
      //   label: this.$t('Collect.writeoffableamount'),
      //   type: 'text',
      //   key: 'noWriteoffAmt',
      // },
      {
        prop: "writeoffFeeAmt",
        label: this.$t("Charge.writeoffAmt"),
        type: "input",
        key: "writeoffFeeAmt",
        inputType: "number",
        maxlength: "16",
        width: 80
      },
      // { prop: 'lessPayAmt', label: this.$t('Collect.shortAmt'), type: 'input', key: 'lessPayAmt', inputType: "number", maxlength: "16" },
      {
        prop: "settleCurrency",
        label: this.$t("Settle.settleCurrency"),
        type: "text",
        key: "settleCurrency",
        width: 80
      },
      {
        prop: "settleExRate",
        label: this.$t("Settle.settleExRate"),
        type: "text",
        key: "settleExRate",
        width: 80
      },
      {
        prop: "settleAmt",
        label: this.$t("Settle.settleAmt"),
        type: "text",
        width: 80,
        key: "settleAmt"
      },
      {
        prop: "writeoffCurrency",
        label: this.$t("Collect.writeoffCurrency"),
        type: "text",
        key: "writeoffCurrency",
        width: 80
      },
      {
        prop: "writeoffExRate",
        label: this.$t("Collect.writeoffrate"),
        type: "text",
        key: "writeoffExRate",
        width: 80
      },
      {
        prop: "writeoffAmt",
        label: this.$t("Settle.exSettleAmt"),
        type: "text",
        key: "writeoffAmt",
        width: 80
      },
      {
        prop: "serviceName",
        label: this.$t("FeeList.serviceCodes"),
        type: "text",
        key: "serviceName"
      },
      {
        prop: "feeUnit",
        label: this.$t("FeeList.feeUnit"),
        type: "select",
        key: "feeUnit",
        width: 80
      },
      {
        prop: "unitPrice",
        label: this.$t("FeeList.unitPrice"),
        type: "text",
        key: "unitPrice"
      },
      {
        prop: "unitCount",
        label: this.$t("FeeList.quantity"),
        type: "text",
        key: "unitCount"
      },
      // { prop: 'invoiceStatus', label: this.$t('Settle.invoiceStatus'), width: 100, type: 'select', propInDict: 'feeInvoiceStatus' },
      {
        prop: "finDate",
        label: this.$t("FeeList.finDate"),
        width: 86,
        type: "text"
      }
    ];
    const columns4 = [
      {
        prop: "cutType",
        label: this.$t("Charge.inandextype"),
        type: "select",
        propInDict: "transferFeeType",
        readOnly: true
      },
      { prop: "currency", label: this.$t("FeeList.currency"), type: "text" },
      { prop: "amt", label: this.$t("FeeList.feeAmt"), type: "text" },
      {
        prop: "hasAllotAmt",
        label: this.$t("Charge.amortizedAmt"),
        type: "text"
      },
      {
        prop: "allotAmt",
        label: this.$t("Charge.currentasses"),
        type: "input",
        validateInput: (val, row, item, change) => {
          if (change) {
            if (!/^\d+(\.\d{0,2})?$/.test(val)) {
              this.$msgErrClose("请输入正确的分摊金额！");
              const amt = row.amt - row.hasAllotAmt;
              row.allotAmt = amt > 0 ? amt : 0;
            }
          }
        }
      }
    ];
    const columns5 = [
      {
        prop: "settleCorpName",
        label: this.$t("Charge.settlementUnit"),
        type: "select",
        propInDict: "transferFeeType"
      },
      {
        prop: "relationType",
        label: this.$t("Charge.AffiliaType"),
        type: "select",
        propInDict: "settleUnitRelationType"
      },
      {
        prop: "settleOrderNo",
        label: this.$t("FeeList.settleOrderNo"),
        type: "text"
      },
      {
        prop: "fileType",
        label: this.$t("Charge.attachType"),
        type: "select",
        propInDict: "settleUnitRelationFileType"
      },
      {
        prop: "fileName",
        label: this.$t("Common.attachment"),
        type: "button",
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            if (row.fileNo) {
              this.showAttachment(row.fileNo, row.fileName);
            }
          }
        }
      },
      {
        prop: "startTime",
        label: this.$t("Charge.expirydate"),
        type: "text",
        formatter: ({ cellValue, column, row, item }) => {
          let { fileType, startTime, stopTime } = row;
          return fileType === "bankseq_file"
            ? this.$t("Charge.temporary")
            : startTime
            ? `${startTime ? startTime.slice(0, 10) : ""} ~ ${
                stopTime ? stopTime.slice(0, 10) : ""
              }`
            : "";
        }
      }
    ];
    const columns6 = [
      {
        prop: "srcCurrency",
        label: this.$t("Settle.orignalCurrency"),
        type: "text"
      },
      {
        prop: "toCurrency",
        label: this.$t("Collect.writeoffCurrency"),
        type: "text"
      },
      {
        prop: "settlementRate",
        label: this.$t("Settle.settleExRate"),
        type: "input"
      }
    ];
    const columns7 = [
      {
        prop: "sourceBizNo",
        label: this.$t("PreClose.bizNo"),
        type: "text",
        width: 125
      },
      {
        prop: "settleCorpName",
        label: this.$t("FeeList.settleCorp"),
        type: "text",
        width: 140
      },
      {
        prop: "settleOrderNo",
        label: this.$t("FeeList.settleOrderNo"),
        type: "text",
        width: 125
      },

      {
        prop: "feeEnName",
        label: this.$t("FeeList.feeEname"),
        type: "text"
      },
      {
        prop: "feeAmt",
        label: this.$t("Collect.originalamount"),
        type: "text"
      },
      {
        prop: "currency",
        label: this.$t("Settle.orignalCurrency"),
        type: "text"
      },
      {
        prop: "noWriteoffAmt",
        label: this.$t("Collect.writeoffableamount"),
        type: "text"
      },
      {
        prop: "writeoffAmt",
        label: this.$t("Settle.settleAmt"),
        type: "text"
      },
      {
        prop: "settleCurrency",
        label: this.$t("Settle.settleCurrency"),
        type: "text"
      },
      {
        prop: "createdName",
        label: this.$t("Common.createdBy"),
        type: "text"
      },
      {
        prop: "createdTime",
        label: this.$t("Common.createTime"),
        type: "text"
      }
    ];
    const columns8 = [
      {
        prop: "useScene",
        label: this.$t("Charge.usageScenarios"),
        type: "text"
      },
      {
        prop: "currency",
        label: this.$t("FeeList.currency"),
        type: "text"
      },
      {
        prop: "useAmt",
        label: this.$t("Charge.writeoffAmt"),
        type: "text"
      },
      {
        prop: "writeoffName",
        label: this.$t("Hedge.writeoffs"),
        type: "text"
      },
      {
        prop: "writeoffTime",
        label: this.$t("Hedge.writeoffTime"),
        type: "text"
      }
    ];
    const columns9 = [
      // {
      //   prop: "invoiceNo",
      //   label: this.$t("FeeList.invoiceNo"),
      //   type: "text"
      // },
      // {
      //   prop: "invoiceType",
      //   label: this.$t("Settle.invoiceType"),
      //   type: "select",
      //   propInDict: "invoiceType"
      // },
      // {
      //   prop: 'preInvoice',
      //   label: this.$t('Collect.whetherrecnvoices'),
      //   type: 'text',
      //   key: 'preInvoice',
      //   width: 100,
      //   formatter: ({ row }) => {
      //     return row.preInvoice === 'yes' ? this.$t('Common.yes') : row.preInvoice ? this.$t('Common.no') : ''
      //   },
      // },
      // {
      //   prop: 'amt',
      //   label: this.$t('Settle.invoiceAmt'),
      //   type: 'text',
      // },
      // {
      //   prop: 'invoiceAmt',
      //   label: this.$t('PreClose.invoiceAmt'),
      //   type: 'text',
      // },
      // {
      //   prop: 'currency',
      //   label: this.$t('Settle.invoiceCur'),
      //   type: 'text',
      // },
      // {
      //   prop: 'invoiceRate',
      //  label: this.$t('Settle.invoiceRate'),
      //   type: 'text',
      // },
      // {
      //   prop: 'taxRate',
      //  label: this.$t('Settle.taxRate'),
      //   type: 'text',
      // },
      {
        prop: "taxAmt",
        label: this.$t("FeeList.taxAmt"),
        type: "text"
      },
      {
        prop: "lockAmt",
        label: this.$t("PreClose.unrelatedAmt"),
        type: "text"
      }
      // {
      //   prop: 'issueName',
      //  label: this.$t('Charge.biller'),
      //   type: 'text',
      // },
      // {
      //   prop: 'issueTime',
      //   label: this.$t('Charge.invoiceTime'),
      //   type: 'text',
      // },
    ];
    this.selfColumnsBase = columns1;
    this.configColumns.splice(
      0,
      1000,
      ...this.selfColumnsBase.map(item => item.prop)
    );
    this.option1.columns = [...this.selfColumnsBase];
    listColumnConfigGet({ scenesCode: "reg_writeoff_detail_fee_list" }).then(
      res => {
        this.columnConfig = true;
        this.dealCustomColumn(res);
      }
    );
    // this.option1.columns = columns1
    // this.option2.columns = columns2
    // this.option3.columns = columns3
    this.option4.columns = columns4;
    this.option5.columns = columns5;
    this.option6.columns = columns6;
    this.option7.columns = columns7;
    this.option8.columns = columns8;
    this.option9.columns = columns9;
    const operationBtns11 = Object.assign({}, this.option.operationBtns, {
      width: 150,
      data: [
        {
          label: this.$t("Common.modify"),
          type: "text",
          action: "Edit",
          showFn: row => !row.edit
        },
        {
          label: this.$t("Common.save"),
          type: "text",
          action: "Save",
          showFn: row => row.edit
        }
      ],
      fixed: "right",
      show: true,
      callback: (action, $index, row, option) => {
        if (action === "Edit") {
          row.edit = true;
        } else if (action === "Save") {
          if (!row.dzgWriteoffNo)
            return this.$msgErrClose(this.$t("PreClose.dzgcheckout"));
          row.edit = false;
          const { writeoffReceipayTransferDzgId, dzgWriteoffNo } = row;
          updateWriteoffRecipayTransferDzg({
            writeoffReceipayTransferDzgId,
            dzgWriteoffNo
          }).then(res => {
            this.$msgSucClose(this.$t("FinBill.saveSuc"));
          });
        }
      }
    });
    this.option11 = Object.assign({}, this.option, {
      id: "option11",
      $name: "WriteoffRecvDetail211",
      data: [],
      tips: false,
      selection: false,
      pagination: false,
      operationBtns: operationBtns11,
      index: {
        show: true
      },
      edit: true,
      columns: [
        {
          prop: "dzgCompName",
          label: this.$t("Hedge.daZg"),
          type: "text"
        },
        {
          prop: "currency",
          label: this.$t("FeeList.currency"),
          type: "text"
        },
        {
          prop: "internalDzgAmt",
          label: this.$t("PreClose.transferAmt"),
          type: "text"
        },
        {
          prop: "transferAllotAmtStr",
          label: this.$t("PreClose.feeshare"),
          type: "text",
          formatter: ({ row }) => row.transferAllotAmtStr || 0
        },
        {
          prop: "dzgWriteoffNo",
          label: this.$t("Hedge.writeoffNo"),
          type: "input",
          needTrim: true
        }
      ]
    });
    this.option10 = Object.assign({}, this.option, {
      id: "option10",
      $name: "WriteoffRecvDetail210",
      data: [],
      tips: false,
      operationBtns: false,
      selection: { show: false },
      columns: [
        {
          prop: "srcCurrency",
          label: this.$t("Settle.orignalCurrency"),
          type: "text"
        },
        {
          prop: "toCurrency",
          label: this.$t("Collect.writeoffCurrency"),
          type: "text"
        },
        {
          prop: "settlementRate",
          label: this.$t("Collect.writeoffrate"),
          type: "text"
        }
      ]
    });

    this.option12 = Object.assign({}, this.option, {
      id: "option12",
      $name: "internalFeeListTable",
      data: [],
      tips: false,
      selection: false,
      pagination: false,
      operationBtns: false,
      edit: true,
      columns: [
        {
          prop: "sourceBizNo",
          label: this.$t("PreClose.bizNo"),
          type: "button",
          key: "sourceBizNo",
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => this.showDetail(row)
          }
        },
        {
          prop: "settleCompName",
          label: this.$t("PreClose.branchname"),
          type: "text"
        },
        {
          prop: "receipayType",
          label: this.$t("Settle.receipayType"),
          type: "select",
          readOnly: true,
          width: 100
        },
        {
          prop: "settleCorpName",
          label: this.$t("PreClose.unitname"),
          type: "text"
        },
        {
          prop: "settleOrderNo",
          label: this.$t("FeeList.settleOrderNo"),
          type: "text"
        },
        { prop: "feeEnName", label: this.$t("FeeList.feeEname"), type: "text" },
        { prop: "feeAmt", label: this.$t("PreClose.feeamount"), type: "text" },
        { prop: "currency", label: this.$t("Hedge.feeCurrency"), type: "text" }
      ]
    });
    this.option13 = Object.assign({}, this.option, {
      id: "option13",
      $name: "WriteoffRecvDetail213",
      data: [],
      index: { show: true },
      tips: false,
      rootTipsHide: true,
      selection: false,
      operationBtns: Object.assign({}, this.option.operationBtns, {
        show: false
      })
    });
    this.option13.columns = [
      {
        prop: "settleCorpName",
        label: this.$t("FeeList.settleCorp"),
        minWidth: 150,
        type: "text"
      },
      { prop: "currency", label: this.$t("FeeList.currency"), type: "text" },
      {
        prop: "arrearReceiveAmt",
        label: this.$t("Hedge.arrearReceiveAmt"),
        type: "button",
        operationBtns: {
          show: true,
          callback: (action, $index, row, option) => {
            this.routerPush("LateFeeDetail", {
              custOverduePaymentNo: row.custOverduePaymentNo
            });
          }
        }
      },
      {
        prop: "lateFeeAmt",
        label: this.$t("Hedge.lateFeeAmt"),
        type: "button",
        operationBtns: {
          show: true,
          callback: (action, $index, row, option) => {
            this.routerPush("LateFeeDetail", {
              custOverduePaymentNo: row.custOverduePaymentNo
            });
          }
        }
      },
      {
        prop: "custOverduePaymentNo",
        label: this.$t("Hedge.custOverduePaymentNo"),
        type: "button",
        operationBtns: {
          show: true,
          callback: (action, $index, row, option) => {
            this.routerPush("LateFeeDetail", {
              custOverduePaymentNo: row.custOverduePaymentNo
            });
          }
        }
      }
    ];
  },
  methods: {
    search(list) {
      console.log(list.map(item => item.invisible));
      this.option1.data = [...list];
      this.writeoffGatherChange();
    },
    init() {
      let COLUMN1 = {
        prop: "allotAmt",
        label: this.$t("Charge.currentasses"),
        type: "input",
        validateInput: (val, row, item, change) => {
          if (change) {
            if (!/^\d+(\.\d{0,2})?$/.test(val)) {
              this.$msgErrClose(this.$t("PreClose.apportionment"));
              const amt = row.amt - row.hasAllotAmt;
              row.allotAmt = amt > 0 ? amt : 0;
            }
          }
        }
      };
      let COLUMN2 = {
        prop: "allotAmt",
        label: this.$t("Charge.currentasses"),
        type: "button",
        callback: ({ transferFeeId, writeoffReceipayNo }) => {
          let data = {
            currPage: 1,
            pageSize: 1000,
            query: [
              { column: "transferFeeId", type: "eq", value: transferFeeId },
              {
                column: "writeoffReceipayNo",
                type: "eq",
                value: this.receivableRegInfo.writeoffReceipayNo
              }
            ]
          };
          listTransferFeeAllot(data).then(res => {
            this.transferFeeDialog.tableOption.data = res.data.list || [];
            this.transferFeeDialog.show = true;
            // console.log(res)
          });
        }
      };
      console.log("route.query:", this.$route.query);
      this.receivableRegId = this.$route.query.receivableRegId;
      this.writeoffReceipayId = this.$route.query.writeoffReceipayId;
      this.source = this.$route.query.source;
      this.isJustShowRecord = this.$route.query.isJustShowRecord;
      this.writeoffReceipayNo = this.$route.query.writeoffReceipayNo;
      this.option1.operationBtns.show = false;
      this.option4.columns.splice(4, 1, COLUMN2);
      // }
    },
    getData() {
      this.voucherNos = this.exVoucherNos = "";
      this.$refs.detailFeeSearch && this.$refs.detailFeeSearch.clearData();
      // 核销详情
      const data = {};
      if (this.writeoffReceipayId && this.writeoffReceipayId > -1) {
        data.writeoffReceipayId = this.writeoffReceipayId;
      } else if (this.writeoffReceipayNo && this.writeoffReceipayNo !== "") {
        data.writeoffReceipayNo = this.writeoffReceipayNo;
      }
      // let data = {
      //   writeoffReceipayId: this.writeoffReceipayId
      // }
      this.lsLoading = true;
      writeoffRecvInfo(data)
        .then(res => {
          if (res.code === 0) {
            this.receivableRegInfo = Object.assign(
              {},
              this.receivableRegInfo,
              res.data.receivableRegInfo,
              res.data,
              {
                writeoffCurrency: res.data.receivableRegInfo.currency,
                _writeoffCurrency: res.data.currency,
                balanceDealType: res.data.balanceDealType,
                noWriteoffHasInvoice: res.data.noWriteoffHasInvoice
              }
            );
            this.voucherNos = res.data.voucherNo || "";
            this.exVoucherNos = res.data.exVoucherNo || "";
            //重新赋值核销id
            this.writeoffReceipayId = res.data.writeoffReceipayId;
            this.option1.data = res.data.writeoffItemList.map(item => {
              // 原币种，即费用币种 item.currency
              // 核销币种
              item.writeoffCurrency = res.data.currency;
              // item.writeoffCurrency = this.receivableRegInfo.writeoffCurrency
              item.lessPayAmt = item.writeoffDeductAmt;
              // item.noWriteoffAmt = item.settleOrderNoWriteoffAmt
              return item;
            });
            this.transferFeeList =
              res.data.receivableRegInfo.transferFeeList || [];
            this.option4.data = res.data.transferFeeAllotList || [];
            this.option5.data = res.data.refSettleUnitList || [];
            this.option8.data = res.data.useSceneList || [];
            this.option9.data = res.data.invoiceReceivableList || [];
            this.option12.data = res.data.internalFeeList || [];
            this.option13.data = res.data.custOverduePaymentListDtoList || [];
            if (this.option13.data.length && this.$route.query.back == 2) {
              this.lateFeeVisible = true;
            }
            if (!this.receivableRegInfo.receivablePrerevId) {
              if (!this.option1.columns.find(v => v.prop === "lessPayAmt")) {
                this.option1.columns.splice(9, 0, {
                  prop: "lessPayAmt",
                  label: this.$t("Collect.shortAmt"),
                  type: "input",
                  key: "lessPayAmt",
                  inputType: "number",
                  maxlength: "16"
                });
              }
            }
            if (res.data.writeoffReceipayTransferDzgList?.length) {
              this.option11.data = res.data.writeoffReceipayTransferDzgList.map(
                item => Object.assign({}, item, { edit: false })
              );
            }
            this.viaWriteoffCurrencySetRate();
          }
        })
        .finally(() => (this.lsLoading = false));

      actualExchangeRate({ rateType: "receive" }).then(res => {
        this.exchageRateList = res.data;
        this.viaWriteoffCurrencySetRate();
      });
    },
    viaWriteoffCurrencySetRate() {
      // 根据收款币种设置汇率
      if (this.exchageRateList.length === 0) {
        return;
      }

      const value = this.receivableRegInfo._writeoffCurrency; // 核销币种

      let currencys = [
        ...new Set(this.option1.data.map(item => item.currency))
      ];
      const differentCurrencys = currencys.filter(item => item !== value);
      if (differentCurrencys.length > 0) {
        const exchageRateList = this.exchageRateList.filter(item => {
          return differentCurrencys.some(currency => {
            return currency === item.srcCurrency && value === item.toCurrency;
          });
        });
        this.settleExchageRateList = exchageRateList; // 计算核销需要用到的汇率列表
        this.receivableRegInfo.exchangeRates = exchageRateList.map(item => {
          return {
            systemRate:
              item.srcCurrency + "-" + item.toCurrency + " " + item.rate,
            settlementRateTitle: item.srcCurrency + "-" + item.toCurrency,
            settlementRate: item.rate,
            exchangeRateId: item.exchangeRateId,
            lowerRate: item.lowerRate,
            upperRate: item.upperRate
          };
        });
        // this.settlementRateEditDisabled = false
      } else {
        this.settleExchageRateList = currencys.map(currency => {
          // differentCurrencys.length === 0 表示只有一种费用币种，且选择的核销币种和费用币种相同
          return {
            srcCurrency: currency,
            toCurrency: currency,
            rate: 1,
            exchangeRateId: ""
          };
        });
        this.receivableRegInfo.exchangeRates = currencys.map(item => {
          return {
            systemRate: item + "-" + item + " " + 1,
            settlementRateTitle: item + "-" + item,
            settlementRate: 1,
            exchangeRateId: "",
            lowerRate: 1,
            upperRate: 1
          };
        });
        // this.settlementRateEditDisabled = true
      }
      if (this.isDetailPage) {
        const len = this.option1.data.length;
        this.receivableRegInfo.exchangeRates.forEach(item => {
          for (let index = 0; index < len; index++) {
            const ele = this.option1.data[index];
            const option = item.settlementRateTitle.split("-");
            if (
              option[0] === ele.currency &&
              option[1] === ele.settleCurrency
            ) {
              item.settlementRate = ele.writeoffExRate;
              break;
            }
          }
        });
        console.log("123", this.receivableRegInfo.exchangeRates);
      }
      this.rateChange();
      this.writeoffGatherChange();
      this.option10.data = this.receivableRegInfo.exchangeRates.map(item => {
        const { settlementRateTitle, settlementRate } = item;
        const currencys = settlementRateTitle.split("-");
        return {
          srcCurrency: currencys[0],
          toCurrency: currencys[1],
          settlementRate
        };
      });
      // 费用合计联动
      // this.feeSumChange()
    },
    rateChange() {
      this.option1.data = this.option1.data.map(item => {
        // const obj = this.settleExchageRateList.find(subItem => {
        //   return (
        //     item.currency === subItem.srcCurrency &&
        //     this.receivableRegInfo.writeoffCurrency === subItem.toCurrency
        //   )
        // })
        if (!item.writeoffExRate) {
          item.writeoffExRate = item.settleExRate;
        }
        return item;
      });
    },
    writeoffGatherChange() {
      // 核销汇总的计算
      let currencys = [
        ...new Set(this.option1.data.map(item => item.currency))
      ];
      let list = this.option1.data;
      this.originalGather = currencys.map(item => {
        let bigNumber = list
          .filter(v => !v.invisible)
          .reduce((sum, cur) => {
            return cur.writeoffFeeAmt && item === cur.currency
              ? sum.plus(cur.writeoffFeeAmt)
              : sum;
          }, BIGZERO);
        return {
          currency: item,
          amt: bigNumber.valueOf() || 0,
          isPay: false
        };
      });
      let bigNumber = list
        .filter(v => !v.invisible)
        .reduce((sum, cur) => {
          return cur.writeoffFeeAmt
            ? sum.plus(new LSnum(cur.writeoffFeeAmt).times(cur.writeoffExRate))
            : sum;
        }, BIGZERO);
      this.exchangeGather = [
        {
          currency: this.receivableRegInfo._writeoffCurrency,
          amt: bigNumber.valueOf() || 0,
          isPay: false
        }
      ];
    },
    handleLateFee() {
      this.routerPush("FiscalTermList", {
        tabFromOther: "lateFeeList",
        custOverduePaymentNo: this.option13.data
          .map(item => item.custOverduePaymentNo)
          .join(",")
      });
    },
    decimalFixed2(x) {
      const result = decimalFixed2(x);
      return result;
    },
    // 关闭附件
    handleClose(val) {
      this.$confirmWarn(
        val === "bankseq"
          ? this.$t("PreClose.delwaterbill")
          : this.$t("PreClose.deldelegate"),
        () => {
          this.handleCloseDelete(val);
        }
      );
    },
    handleCloseDelete(val) {
      const data = {
        receivableRegId: this.receivableRegId,
        bankseqFileCode: undefined
      };
      // 水单附件
      if (val === "bankseq") {
        regDeleteBankseqFile(data).then(res => {
          this.$msgSucClose(this.$t("PreClose.attadelSuc"));
          Object.assign(
            this.receivableRegInfo,
            {},
            { bankseqFileName: "", bankseqFilePath: "" }
          );
        });
      }
      // 委托附件
      if (val === "proxy") {
        regDeleteProxyFile(data).then(res => {
          this.$msgSucClose(this.$t("PreClose.deletionsuc"));
          Object.assign(
            this.receivableRegInfo,
            {},
            { proxyFileName: "", proxyFilePath: "" }
          );
        });
      }
    },
    mathRound(num) {
      return Math.round(num * 100) / 100;
    },

    recheck() {
      this.$confirmWarn(this.$t("Collect.reviewCon"), () => {
        recheck({ writeoffReceipayIds: [this.writeoffReceipayId] }).then(
          res => {
            this.$msgSucClose(this.$t("Collect.reviewSuc"));
            this.cancel(true);
          }
        );
      });
    },
    handleCollapse() {
      this.showTable1 = !this.showTable1;
    },
    cancel(refresh) {
      this.routerBack(refresh, !!this.$route.query.back);
    },
    // 显示水单委托单
    showAttachment(path, name) {
      const href = `/base/fileView/preview/${path}/sowoll`;
      window.open(href);
    },
    // 开票申请
    handleInvoice() {
      let recheckStatus = this.receivableRegInfo.recheckStatus;
      if (recheckStatus === "check_back") {
        return this.$msgErrClose(this.$t("PreClose.initiateinvoi"));
      }

      invoiceReceivableApply({
        writeoffReceipayIds: [this.writeoffReceipayId]
      }).then(res => {
        const query = {
          writeoffReceipayId: JSON.stringify([this.writeoffReceipayId]),
          source: "writeOffInvoice"
        };
        if (
          !res.data.settleOrderFeeList.find(
            item => item.openerReceiveInvoice === "yes"
          )
        ) {
          return this.$msgErrClose(this.$t("Settle.invoicableTips"));
        }
        if (
          res.data.settleOrderFeeList.find(
            item => item.openerReceiveInvoice === "no"
          )
        ) {
          this.$confirmWarn(this.$t("Settle.invoicingTips"), () => {
            this.routerPush("InvoiceReceivableApply", query);
          });
        } else {
          this.routerPush("InvoiceReceivableApply", query);
        }
      });
    },
    // 跳转至详情页
    showDetail(row) {
      if (!row.sourceBizNo && !row.feeSourceType) {
        return this.$msgErrClose(this.$t("PreClose.jobNoTips"));
      }
      this.showOneNoDetail("sourceBizNo", row.sourceBizNo);
    },
    // 编辑核销日期
    editWriteoffDate() {
      if (this.voucherNos || this.exVoucherNos) {
        return this.$msgErrClose(this.$t("Charge.cannotChange"));
      }
      this.disabledData = false;
    },
    // 修改核销日期
    updateWriteoffDate() {
      if (!this.receivableRegInfo.writeoffDate) {
        return this.$msgErrClose(this.$t("PreClose.checkoutTips"));
      }
      const data = {
        writeoffReceipayId: this.writeoffReceipayId,
        writeoffDate: this.receivableRegInfo.writeoffDate
      };
      updateWriteoffDate(data).then(res => {
        this.disabledData = true;
        this.$msgSucClose(this.$t("PreClose.checkoutSuc"));
      });
    },
    // 删除凭证
    delVoucher() {
      let voucherNos = [];
      let voucherSeqNos = [];
      this.voucherNos.split(",").forEach(val => {
        let arr = val.split("/");
        voucherNos.push(arr[1]);
        voucherSeqNos.push(arr[0]);
      });
      voucherNos = [...new Set(voucherNos)].filter(v => v !== "null");
      voucherSeqNos = [...new Set(voucherSeqNos)];
      // return console.log(voucherSeqNos);
      this.$confirmWarn(
        this.$t("Hedge.detailsTips", { voucherNos: voucherNos.join(",") }),
        () => {
          voucherDelete({ voucherSeqNos }).then(res => {
            this.$msgSucClose(this.$t("Settle.deleteSuc"));
            this.getData();
          });
        }
      );
    },
    delVoucher2() {
      let voucherNos = [];
      let voucherSeqNos = [];
      this.exVoucherNos.split(",").forEach(val => {
        let arr = val.split("/");
        voucherNos.push(arr[1]);
        voucherSeqNos.push(arr[0]);
      });
      voucherNos = [...new Set(voucherNos)].filter(v => v !== "null");
      voucherSeqNos = [...new Set(voucherSeqNos)];
      // return console.log(voucherSeqNos);
      this.$confirmWarn(
        this.$t("Hedge.detailsTips", { voucherNos: voucherNos.join(",") }),
        () => {
          exVoucherDelete({ voucherSeqNos }).then(res => {
            this.$msgSucClose(this.$t("Settle.deleteSuc"));
            this.getData();
          });
        }
      );
    },
    // preview 预览&生成   isOutter 内账&外账
    batchPrintCreate2(preview, isExt) {
      this.isExt = isExt === true;
      this.batchPrintCreate(preview);
    },
    // 预览凭证
    batchPrintCreate(preview) {
      if (preview === "refresh") {
        this.getData();
        return;
      }
      const writeoffReceipayNos = this.receivableRegInfo.writeoffReceipayNo;
      const data = {
        writeoffReceipayNos,
        bizType: "receive_writeoff",
        preview: "no"
      };
      const acctVoucherSeqno = this.isExt
        ? this.exVoucherNos.split("/")[1]
        : this.voucherNos.split("/")[1];
      if (preview) {
        // 预览
        if (acctVoucherSeqno) {
          this.previewDialog.showData = "";
          this.previewDialog.seqNo = acctVoucherSeqno;
          this.previewDialog.show = true;
        } else {
          data.preview = "yes";
          this.lsLoading = true;
          let method = this.isExt
            ? exReceipayWriteOffGenerate
            : receipayWriteOffGenerate;
          method(data)
            .then(res => {
              // if (res.code === 0) {
              // 	this.showPreviewDialog = true
              // 	this.getInfo()
              // }
              this.previewDialog.seqNo = "";
              this.previewDialog.showData = res.data;
              this.previewDialog.show = true;
            })
            .finally(() => (this.lsLoading = false));
        }
      } else {
        // 生成凭证
        if (acctVoucherSeqno) {
          return this.$msgErrClose(this.$t("Hedge.voucherTips"));
        }
        this.$confirm(
          this.$t("Collect.voucherGen"),
          this.$t("Common.generateVouchers"),
          {
            confirmButtonText: this.$t("Common.sure"),
            cancelButtonText: this.$t("Common.cancel"),
            lockScroll: "true",
            type: "warning"
          }
        )
          .then(() => {
            let method = this.isExt
              ? exReceipayWriteOffGenerate
              : receipayWriteOffGenerate;
            return method(data);
          })
          .then(() => {
            this.$msgSucClose(this.$t("Hedge.processedTips"));
            // 获取凭证号
            window.setTimeout(() => {
              this.getData();
            }, 1000);
          })
          .catch(function() {});
      }
    },
    // 反核销
    reverseWriteoff() {
      if (this.voucherNos || this.exVoucherNos) {
        return this.$msgErrClose(this.$t("Collect.bereversed"));
      }
      this.$confirm(
        this.$t("Collect.confirmareverse"),
        this.$t("Hedge.antiWriteOff"),
        {
          confirmButtonText: this.$t("Common.sure"),
          cancelButtonText: this.$t("Common.cancel"),
          lockScroll: "true",
          type: "warning"
        }
      )
        .then(() => {
          this.reverseWriteoffFn();
        })
        .catch(() => {});
    },
    reverseWriteoffFn() {
      const writeoffReceipayId = this.writeoffReceipayId;
      reverse({ writeoffReceipayId }).then(res => {
        this.$msgSucClose(this.$t("Collect.submittedsuc"));
        if (
          ["transfer", "prepay_refund"].includes(this.receivableRegInfo.type)
        ) {
          this.cancel(true);
        } else {
          this.getData();
        }
      });
    },
    // 重新核销
    toReWriteoff() {
      this.$confirm(
        this.$t("PreClose.rewriteTips"),
        this.$t("Collect.rewriting"),
        {
          confirmButtonText: this.$t("Common.yes"),
          cancelButtonText: this.$t("Common.no"),
          lockScroll: "true",
          type: "warning"
        }
      )
        .then(() => {
          this.toReWriteoffFn();
        })
        .catch(() => {});
    },
    toReWriteoffFn() {
      const writeoffReceipayId = this.writeoffReceipayId;
      this.lsLoading = true;
      toReWriteoff({ writeoffReceipayId })
        .then(res => {
          // 预收款核销
          if (res.data.writeoffSource === "receivable_prerev") {
            this.$store.dispatch("tagsView/delView", this.$route);
            this.routerPush("PrerevWriteoff", {
              source: "createPrerevWriteoffFrom",
              receivablePrerevId: res.data.receivablePrerevId,
              routerBackReset: true
            });
            return;
          }

          // 收款核销
          window.sessionStorage.setItem(
            "_writeoffRemark",
            res.data.remark || ""
          );
          window.sessionStorage.setItem("_writeoffCurrency", res.data.currency);
          window.sessionStorage.setItem(
            "_writeoffExRate",
            res.data.writeoffExRate
          );
          window.sessionStorage.setItem("_totalAmt", res.data.writeoffExAmt);
          window.sessionStorage.setItem(
            "_receivableReg",
            JSON.stringify(res.data.receivableReg)
          );
          // this.$message({  message: '重新核销',  type: 'success',  showClose: true })
          if (res.data.writeoffItemList?.length) {
            window.sessionStorage.setItem(
              "writeoffItemList",
              JSON.stringify(res.data.writeoffItemList)
            );
          }
          // this.getData()
          this.$msgSucClose(this.$t("PreClose.reunderwrit"));
          this.$store.dispatch("tagsView/delView", this.$route);
          // this.handleSkip(res.data)
          let receivableRegId = res.data.receivableRegId;
          this.routerPush("WriteoffRecvDetail", {
            receivableRegId,
            routerBackReset: true,
            source: "createFromReceivableRegId"
          });
        })
        .finally(() => (this.lsLoading = false));
    },
    // 更多汇率
    showExchangeRates() {
      this.exchangeRatesDialog = true;
    },
    // 自定义表头
    customColumnsPopClose(action, value) {
      this.customColumnsPopShow = false;
      if (action === "Confirm") {
        let columnList = this.getColumnsValues(value); // getColumnsValues在本页面无作用
        listColumnConfigSave({
          columnList,
          scenesCode: "reg_writeoff_detail_fee_list"
        }).then(res => {
          this.dealCustomColumn(res);
        });
      }
    },
    dealCustomColumn(res) {
      if (res.data?.columnList?.length) {
        let list = res.data.columnList;
        this.configColumns = list;
        this.option1.columns = list
          .map(prop => this.selfColumnsBase.find(item => item.prop === prop))
          .filter(v => v);
      }
    },
    updateRemark() {
      updateRemark({
        writeoffReceipayId: this.writeoffReceipayId,
        remark: this.receivableRegInfo.remark
      }).then(res => {
        this.$msgSucClose(this.$t("FinBill.saveSuc"));
      });
    },
    sortChange(column, prop, order) {
      // console.log(column, prop, order)
      if (!order) return;
      let arr = [
        "feeAmt",
        "writeoffBalanceAmt",
        "writeoffFeeAmt",
        "settleExRate",
        "settleAmt",
        "writeoffExRate",
        "writeoffAmt",
        "unitPrice",
        "unitCount"
      ];
      let isNum = arr.includes(prop);
      if (order === "descending") {
        this.option1.data = this.option1.data.sort((a, b) => {
          return isNum ? b[prop] - a[prop] : b[prop] > a[prop] ? 1 : -1;
        });
      } else if (order === "ascending") {
        this.option1.data = this.option1.data.sort((a, b) => {
          return isNum ? a[prop] - b[prop] : a[prop] > b[prop] ? 1 : -1;
        });
      }
    },
    previewAll() {
      voucherListRecv({ writeoffReceipayId: this.writeoffReceipayId }).then(
        res => {
          if (res.data && res.data.length) {
            this.voucherNosTableOption.list = res.data || [];
            this.voucherNosTableOption.show = true;
          } else {
            this.$msgErrClose(this.$t("Hedge.unrelatedTips"));
          }
        }
      );
    }
  },
  activated() {
    // if (!this.$route.meta.isUseCache) {
    //   Object.assign(this.receivableRegInfo, defaultCreateQuery)
    //   console.log(defaultCreateQuery)
    //   this.init()
    //   this.getData()
    // }
    this.lateFeeVisible = false; // 防止叉掉了页面时，滞纳金窗口还在
    Object.assign(this.receivableRegInfo, defaultCreateQuery);
    this.init();
    this.getData();

    this.feeSource = "";
    this.invoiceReceivableIds = [];
  },
  components: {
    FinanceTable,
    CustomColumns,
    FinanceSearch,
    FinanceUpload,
    PreviewDialog,
    FinanceDialogTable,
    DetailFeeSearch,
    VoucherNosTable
  },
  computed: {
    ...mapState({
      defaultColumns: state => state.finance.columns.defaultColumns,
      columnsBase4: state => state.finance.columns.columnsBase4
    }),
    ...mapGetters(["dictMap", "dictMapObj"])
  } 
};
</script>
<style scoped lang="scss">
/deep/ .info-box {
  .detail__div {
    width: 25% !important;
    margin-right: 0;
    &.detail__div__full{
      width: 100% !important;
    }
    .detail__label {
      width: 200px ;
    }
  }
}
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
        // .detail__label {
        //   width: 112px !important;
        // }
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
        // line-height: 20px;
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
      // line-height: 20px;
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
