<template>
  <div
    class="finance-tab-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div v-show="!showInvoiceDetail" class="finance-receivable-reg-list">
      <FinanceSearch :searchOption="searchOption1" @search="search" />

      <div class="finance-search-list-gap"></div>
      <div class="finance-list-container">
        <div class="money-box">
          <div class="money-box-left">
            <el-button
              v-if="checkAuth($route.name, 'tab-settleList', 'btn-settlePass')"
              type="success"
              class="finance-btn"
              @click="handleApplyForPass('pass')"
              size="mini"
              >审核通过</el-button
            >
            <el-button
              v-if="checkAuth($route.name, 'tab-settleList', 'btn-settleRefuse')"
              type="danger"
              class="finance-btn"
              @click="handleApplyFor('refuse')"
              size="mini"
              >审核拒绝</el-button
            >
            <el-button
              v-if="checkAuth($route.name, 'tab-settleList', 'btn-handleWithdrawPayApplyAudit')"
              class="finance-btn"
              size="mini"
              @click="handleWithdrawPayApplyAudit"
              type="purple"
              >撤销付款审核</el-button
            >
            <!-- <el-button class="finance-btn" v-if="checkAuth($route.name, 'tab-settleList', 'btn-settlePushCashier')" @click="handlePushCashier" size="mini">推送出纳</el-button> -->
            <el-button-group
              v-if="checkAuth($route.name, 'tab-settleList', 'btn-settlePushCashier')"
            >
              <div class="finance-btn select-template-box">
                <el-dropdown trigger="click" @command="handlePushCashier">
                  <span class="el-dropdown-link">
                    推送出纳<i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      v-for="(item, index) in pushCashierList"
                      :key="'pushCashierList' + index"
                      :command="item"
                    >
                      推送出纳{{ item.label }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </el-button-group>
            <el-button-group>
              <el-button
                v-if="checkAuth($route.name, 'tab-settleList', 'btn-handleWithdrawApplyPayOrder')"
                class="finance-btn"
                size="mini"
                @click="handleWithdrawApplyPayOrder"
                type=""
                >撤回推送</el-button
              >
            </el-button-group>
            <el-button-group
              v-if="checkAuth($route.name, 'tab-settleList', 'btn-handleFinanceReceive')"
            >
              <div class="finance-btn select-template-box">
                <el-dropdown trigger="click" @command="financeReceive">
                  <span class="el-dropdown-link">
                    签收发票<i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      v-for="(item, index) in financeReceiveList"
                      :key="'exportTypeList' + index"
                      :command="item"
                    >
                      {{ item.label }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </el-button-group>
            <!-- <el-button class="finance-btn" @click="delayInvoice" size="mini">标记后补票</el-button> -->
            <!-- <el-button-group>
						 <el-button class="finance-btn" v-if="checkAuth($route.name, 'tab-settleList', 'btn-settleExport')" @click="handleExport" size="mini"
							>导出</el-button
						>
					</el-button-group> -->
            <el-button-group v-if="checkAuth($route.name, 'tab-settleList', 'btn-settleExport')">
              <div class="finance-btn select-template-box">
                <el-dropdown trigger="click" @command="handleExport">
                  <span class="el-dropdown-link">
                    导出<i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      v-for="(item, index) in exportTypeList"
                      :key="'exportTypeList' + index"
                      :command="item"
                    >
                      导出{{ item.label }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </el-button-group>
            <el-button-group v-if="checkAuth($route.name, 'tab-settleList', 'btn-settlePrint')">
              <div class="finance-btn select-template-box">
                <el-dropdown trigger="click" @command="handlePrint">
                  <span class="el-dropdown-link">
                    打印<i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      v-for="(item, index) in handlePrintList"
                      :key="'handlePrintList' + index"
                      :command="item.value"
                    >
                      {{ item.label }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </el-button-group>
            <!--  <el-button-group>
						<el-button class="finance-btn" v-if="checkAuth($route.name, 'tab-settleList', 'btn-settlePrint')" size="mini" @click="handlePrint"
							>打印</el-button
						>
					</el-button-group>
          <el-button-group>
						<el-button v-if="checkAuth($route.name, 'tab-settleList', 'btn-handlePrints')" class="finance-btn" size="mini" @click="handlePrint('yes')"
							>打印专项单</el-button
						>
					</el-button-group> -->
          </div>
          <div class="money-box-right">
            <el-button-group>
              <el-button
                v-if="checkAuth($route.name, 'tab-settleList', 'btn-settleaddInvoice')"
                type="primary"
                class="finance-btn"
                @click="identifyElecInvoice"
                size="mini"
                >电子发票识别</el-button
              >
            </el-button-group>
            <el-button-group>
              <el-button
                class="finance-btn"
                v-if="checkAuth($route.name, 'tab-settleList', 'btn-settleMerge')"
                @click="handleMerge"
                size="mini"
                >合并付款</el-button
              >
              <el-button
                class="finance-btn"
                v-if="checkAuth($route.name, 'tab-settleList', 'btn-settlePaySeparately')"
                @click="handlePaySeparately"
                size="mini"
                >拆分付款</el-button
              >
            </el-button-group>
            <el-button-group>
              <el-button
                class="finance-btn"
                v-if="checkAuth($route.name, 'tab-settleList', 'btn-presentPaperBill')"
                @click="presentPaperBill('yes')"
                size="mini"
                >交单</el-button
              >
              <el-button
                class="finance-btn"
                v-if="checkAuth($route.name, 'tab-settleList', 'btn-retractPaperBill')"
                @click="presentPaperBill('no')"
                size="mini"
                >撤单</el-button
              >
            </el-button-group>
            <el-button-group>
              <el-button
                class="finance-btn"
                v-if="checkAuth($route.name, 'tab-settleList', 'btn-settleRelationInvoice')"
                @click="handleRelationInvoice"
                size="mini"
                >关联发票</el-button
              >
              <el-button
                class="finance-btn"
                v-if="checkAuth($route.name, 'tab-settleList', 'btn-settleaddInvoice')"
                @click="addInvoice"
                size="mini"
                >发票登记</el-button
              >
            </el-button-group>
            <el-button-group>
              <el-button
                class="finance-btn"
                v-if="checkAuth($route.name, 'tab-settleList', 'btn-settleDownLoadInvoice')"
                @click="handleDownLoadInvoice"
                size="mini"
                >批量下载发票</el-button
              >
            </el-button-group>
            <el-button-group>
              <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary"
                >刷新</el-button
              >
            </el-button-group>
          </div>
        </div>
        <FinanceTableMass :option="option1" @send-multi="sendMulti" />
      </div>
    </div>
    <div class="finance-bill-detail-container">
      <BillDetail v-if="showBillDetail" :bill-id="orderBillId" @open-bill-detail="openBillDetail" />
    </div>
    <RegisterInvoice
      :invoicePaymentAddForm="invoicePaymentAddForm"
      :dialogVisibleInvoice="dialogVisibleInvoice"
      @close-dialog-visible="closeDialogVisible"
    />
    <RelationInvoice
      :relationInvoiceForm="relationInvoiceForm"
      :relevanceOpne="relevanceOpne"
      @close-dialog-visible-relationInvoice="closeDialogVisibleRelationInvoice"
    />
    <SplitPayApplySettle
      :paySeparatelyDialog="splitPayApplySettleDialog"
      :applyNo="applyNo"
      @close-pay-separately-dialog="closePaySeparatelyDialog"
    />
    <InvoicePreview
      :invoicePreviewOpne="invoicePreviewOpne"
      :invoicePreviewForm="invoicePreviewForm"
      @close-dialog-visible-invoicePreview="closeDialogVisibleInvoicePreview"
    />
    <el-dialog :title="'申请不通过'" :visible.sync="rejectDialogVisible" width="600px">
      <el-form
        :model="query"
        ref="query"
        label-width="80px"
        class="el-form-item-payapply-remark"
        required
      >
        <el-form-item
          label="拒绝原因"
          prop="refuseReason"
          :rules="{
            required: true,
            message: '拒绝原因不能为空',
            trigger: 'blur',
          }"
        >
          <el-input
            type="textarea"
            placeholder="请输入拒绝原因"
            maxlength="200"
            show-word-limit
            v-model="query.refuseReason"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="query.loading" @click="rejectSubmit" size="mini"
          >确定</el-button
        >
        <el-button @click="rejectDialogVisible = false" size="mini">取消</el-button>
      </span>
    </el-dialog>
    <div class="finance-bill-detail-container" v-if="showInvoiceDetail">
      <component
        :is="currentComponent"
        :invoice-payment-id="invoicePaymentId"
        :row-data="rowData"
        @close-invoice-detail="closeInvoiceDetail"
      />
    </div>
    <!-- <InovicePreviewPrint
    :dialog-visible-o="dialogVisibleO"
    :customer-info="customerInfo"
    :seller-info="sellerInfo"
    :apply-item-group-list="applyItemGroupList"
    :other-invoice-info="otherInvoiceInfo"
    @print-invoice="printInvoice"
  /> -->
    <ApplyForPass :option="applyForPassOption" @close="applyForPassOptionClose" @sure="sure">
      <!-- v-if="applyForPassOption.show" 20220815 modal no hide comment -->
      <div slot="descript">
        <el-form
          class="pass_dialog_form"
          :model="recvData"
          ref="recvData"
          :inline="true"
          size="mini"
          label-width="90px"
        >
          <el-form-item label="供应商名称">
            <el-input disabled v-model="recvData.recvCorpName"></el-input>
          </el-form-item>
          <el-form-item label="付款方式">
            <el-select disabled v-model="recvData.payWay" style="width: 100%">
              <el-option
                v-for="it in dictMap['payWay']"
                :key="it.value"
                :label="it.label"
                :value="it.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="收款账号"
            prop="recvAccountNo"
            :rules="{ required: true, message: ' ', trigger: 'blur' }"
            v-if="recvData.payWay !== 'prepay_dedue'"
          >
            <el-select
              v-model="recvData.recvAccountNo"
              filterable
              remote
              :remote-method="bankAccountList"
              @change="recvAccountNoChange"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="it in recvAccountNoList || []"
                :key="it.value"
                :label="it.label"
                :value="it.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="收款银行" v-show="recvData.payWay !== 'prepay_dedue'">
            <el-input disabled v-model="recvData.recvBankName"></el-input>
          </el-form-item>
          <el-form-item label="收款银行支行" v-show="recvData.payWay !== 'prepay_dedue'">
            <el-input disabled v-model="recvData.recvBankBranch"></el-input>
          </el-form-item>
          <el-form-item label="收款账户名" v-show="recvData.payWay !== 'prepay_dedue'">
            <el-input disabled v-model="recvData.recvAccountName"></el-input>
          </el-form-item>
          <el-form-item label="SWIFT CODE" v-show="recvData.payWay !== 'prepay_dedue'">
            <el-input disabled v-model="recvData.recvSwiftCode"></el-input>
          </el-form-item>
          <!-- 测试建议 拉黑说明在原有条件上，有值时才需显示-->
          <el-form-item
            class="form_full red-label"
            label="拉黑说明"
            v-show="recvData.payWay !== 'prepay_dedue' && recvData.hasBlack === 'yes' && recvData.hasBlackReason"
          >
            <el-input
              type="textarea"
              v-model="recvData.hasBlackReason"
              placeholder=""
              autosize
              disabled
            ></el-input>
          </el-form-item>
          <el-form-item
            class="form_full"
            label="公司地址"
            v-show="recvData.payWay !== 'prepay_dedue'"
          >
            <el-input disabled v-model="recvData.recvRegAddr" type="textarea"></el-input>
          </el-form-item>
          <!-- <el-form-item label="审核备注" prop="" >
          <el-input v-model="recvData.auditOpinion" type="textarea" autosize show-word-limit maxlength="500"></el-input>
        </el-form-item> -->
        </el-form>
        <FinanceTableMass style="padding: 0 !important" :option="passTableOption" />
      </div>
    </ApplyForPass>
    <el-dialog
      :title="'财务备注'"
      :visible.sync="remarkDialogVisible"
      @close="remarkDialogVisibleCancel"
      width="600px"
    >
      <el-form
        :model="remark"
        ref="remark"
        label-width="68px"
        class="el-form-item-payapply-remark"
        required
      >
        <el-form-item
          label="财务备注"
          prop="finRemark"
          :rules="{
            required: true,
            message: '备注原因不能为空',
            trigger: 'blur',
          }"
        >
          <el-input
            type="textarea"
            placeholder="请输入备注"
            maxlength="350"
            show-word-limit
            v-model="remark.finRemark"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="remarkLoading" @click="remarkSubmit" size="mini"
          >确定</el-button
        >
        <el-button @click="remarkDialogVisibleCancel" size="mini">取消</el-button>
      </span>
    </el-dialog>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{ key: 'prop', label: 'label' }"
        @close="customColumnsPopClose"
      />
    </div>
  </div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import BillDetail from '@/views/finance/orderFee/orderFee/components/billDetail'
import RegisterInvoice from '@/views/finance/pay/settle/components/registerInvoice'
import RelationInvoice from '@/views/finance/pay/settle/components/relationInvoice'
import InvoicePreview from '@/views/finance/pay/settle/components/invoicePreview'
import CustomColumns from '@/components/customColumns/index'
import SplitPayApplySettle from '@/views/finance/pay/settle/components/splitPayApplySettle'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { countrySelectList } from '@/api/base'
import ApplyForPass from '@/views/finance/pay/settle/components/applyForPass'
import { info, receive } from '@/api/fin/invoicePayment'
import { listByRole } from '@/api/base'
import {
  queryPayApplySettlePage,
  approvePayApplySettle,
  settleDelayInvoice,
  queryPayApplySettlePageSummary,
  generatePayOrder,
  mergePayApplySettle,
  settleWithdrawPayApplyAudit,
  settleModifyFinRemark,
  settleWithdrawApplyPayOrder,
  queryBatchApproveData,
  batchApproveData,
  settleInvoiceReceive,
  presentedPaperBill,
} from '@/api/fin/pay.js'
import { employeeSelectlist } from '@/api/companyResource'
import InvoicePaymentDetail from '@/views/finance/invoicePayment/invoicePaymentList/components/invoicePaymentDetail'
import settleDetail from '@/views/finance/pay/settle/detail'
import { dateFormat } from '@/views/finance/utils/finance.js'
let defaultCreateQuery = {
  supplierCorpName: '',
  supplierCorpCode: '',
  corpBank: null,
  bankAccounts: [],
  invoiceBankList: [],
  title: '',
  taxNo: '',
  supplierTitle: '',
  supplierBankName: '',
  supplierTel: '',
  supplierAddr: '',
  supplierAccountNo: '',
  bankName: '',
  accountNo: '',
  addr: '',
  tel: '',
  supplierTaxpayerNo: '',
  accountShortName: '',
  invoicePaymentList: [
    {
      invoiceNo: '',
      invoiceCode: '',
      currency: '',
      amt: '',
      invoiceIssueDate: '',
      taxRate: '',
      rate: '',
      taxAmt: '',
      invoiceType: '',
      remark: '',
      receiveNo: '',
      fileNo: '',
      fileName: '',
      amtCny: '',
    },
  ],
}
export default {
  name: 'SettleList',
  mixins: [mixin, mixin2],
  props: ['isJumpRouteFromPage'],
  data() {
    return {
      pageSizeUrl: queryPayApplySettlePage('geturl'),
      keyDownActive: true,
      configColumnsList: [],
      remarkDialogVisible: false,
      remarkLoading: false,
      remark: {
        applyNo: '',
        finRemark: '',
      },
      recvAccountNoList: [],
      dialogVisibleO: {
        show: false,
      },
      customerInfo: {},
      sellerInfo: {},
      applyItemGroupList: [],
      otherInvoiceInfo: {},
      //发票预览的弹框
      invoicePreviewOpne: false,
      invoicePreviewForm: {},
      //关联发票
      relevanceOpne: false,
      relationInvoiceForm: {
        payInfoId: '',
        currency: '',
        recvCorpName: '',
        recvCorpCode: '',
        settleCompCode: '',
        settleCompName: '',
        supplierAccountNo: '',
        loading: false,
      },
      applyNo: '',
      invoicePaymentAddForm: Object.assign({}, defaultCreateQuery),
      query: {
        applyNoList: '',
        confirmStatus: '',
        refuseReason: '',
        loading: false,
      },
      rejectDialogVisible: false,
      dialogVisibleInvoice: false,
      option1: {},
      passTableOption: {},
      searchOption1: {},
      table1DataBackup: [],
      table2DataBackup: [],
      isAddPay: false,
      multipleSelection1: [],
      multipleSelection2: [],
      form: {
        orderNo: '',
        creationDate: '',
        billNo: '',
        settleCorpName: '',
        settleCorpCode: '',
      },
      orderNo: '',
      orderBillId: '',
      showBillDetail: false,
      autocomplete: {},
      selectedOptionItem: '',
      currentComponent: '',
      showInvoiceDetail: false,
      invoicePaymentId: -1,
      rowData: {},
      searchBackup: [],
      rightFilterBtns: [true, false, false, false],
      splitPayApplySettleDialog: false,
      splitPayApplySettleForm: {},
      payInfoList: [],
      // 升序
      ascColumns: [],
      // 降序
      descColumns: [],
      // 初始表头
      selfColumnsBase: [
        {
          disabled: true,
          prop: 'applyNo',
          label: '付款申请号',
          width: '155px',
          type: 'button',
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => {
              this.showDetail(row)
            },
          },
        },
        {
          prop: 'orderNo',
          label: '工作单号',
          width: 140,
          type: 'columnTip',
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, { row }, index) => {
              let orderNoList = row.orderNo_multiValue
              let sourceTypeList = row.sourceType_multiValue
              let orderNo = orderNoList[index]
              let sourceType = sourceTypeList[index]
              let sourceBizNo = orderNo
              this.$emit('update:isJumpRouteFromPage', true)
              this.showOneNoDetail(sourceType, sourceBizNo, { feeId: '' })
            },
          },
        },
        {
          disabled: true,
          prop: 'settleOrderNo',
          label: '结算单号',
          type: 'columnTip',
          width: 155,
          sortable: true,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            callback: (no, componentProps) => {
              this.$emit('update:isJumpRouteFromPage', true)
              this.$router.push({
                path: '/finance/settlement/settlementDetail',
                query: {
                  source: 'settlementDetail',
                  settleOrderNo: no,
                },
              })
            },
          },
        },
        {
          prop: 'payConfirmName',
          label: '付款人',
          type: 'text',
        },
        {
          prop: 'payTime',
          label: '付款时间',
          type: 'text',
          width: 125,
        },
        {
          prop: 'mbl',
          label: 'MBL',
          type: 'tooltip',
        },
        {
          prop: 'hbl',
          label: 'HBL',
          type: 'tooltip',
        },
        // {
        //   prop: 'invoiceReceiveNo', // 20220805 lichao去掉
        //   label: '发票登记号',
        //   type: 'text',
        // },
        {
          prop: 'recvBankName',
          label: '收款银行',
          type: 'text',
          width: 120,
        },
        {
          prop: 'recvBankBranch',
          label: '收款银行支行',
          type: 'text',
          width: 120,
        },
        {
          prop: 'recvAccountNo',
          label: '收款账号',
          type: 'text',
          width: 120,
        },
        {
          prop: 'recvAccountName',
          label: '收款账户名',
          type: 'text',
          width: 120,
        },
        {
          prop: 'recvCorpName',
          label: '结算单位',
          type: 'text',
          width: 150,
        },
        {
          prop: 'settleCompName',
          label: '所属分公司',
          type: 'text',
          width: 150,
        },
        {
          prop: 'etdTimeStr',
          label: 'ETD',
          width: 125,
          type: 'text',
        },
        {
          prop: 'etaTimeStr',
          label: 'ETA',
          width: 125,
          type: 'text',
        },
        {
          prop: 'currency',
          label: '币种',
          type: 'text',
        },
        {
          prop: 'applyPayAmt',
          label: '金额',
          type: 'text',
        },
        {
          prop: 'payWay',
          label: '付款方式',
          type: 'select',
          propInDict: 'payWay',
        },
        {
          label: '账户结算方式',
          type: 'select',
          prop: 'settleMode',
          propInDict: 'bankAccountSettleMode',
          width: 100,
          multi: true,
        },
        {
          prop: 'status',
          label: '状态',
          type: 'select',
          width: 120,
          formatter: ({ row }) => {
            const statusName = this.dictMapObj.payApplySettleStatus[row.status]
            if (row.status === 'sent') {
              return '<span style="color:#33B18A">' + statusName + '</span>'
            } else if (row.status === 'refuse' || row.status === 'refuse_pay') {
              return '<span style="color:#CD4130">' + statusName + '</span>'
            } else if (row.status === 'pending') {
              return '<span style="color:#EDB534">' + statusName + '</span>'
            } else if (row.status === 'pass') {
              return '<span style="color:#ef8519">' + statusName + '</span>'
            } else if (row.status === 'paying') {
              return '<span style="color:#1890ff">' + statusName + '</span>'
            } else {
              return statusName
            }
          },
        },
        {
          prop: 'settleCycle',
          label: '结算单位结算周期',
          type: 'select',
          width: 125,
          propInDict: 'settleCycle',
        },
        {
          prop: 'custSettleCycle',
          label: '委托单位结算周期',
          type: 'select',
          width: 125,
          propInDict: 'settleCycle',
        },
        {
          prop: 'settleOrderType',
          label: '结算类型',
          type: 'select',
          width: 110,
          formatter: ({ row }) => {
            let settleOrderType = []
            row.settleOrderType.split(',').forEach((subItem) => {
              if (subItem && subItem != 'null') {
                settleOrderType.push(this.dictMapObj.settleOrderType[subItem])
              }
            })
            return settleOrderType.toString()
          },
        },
        {
          prop: 'hasAgentPay',
          label: '是否代收付',
          type: 'select',
          propInDict: 'yesNo',
        },
        {
          prop: 'sysLineName',
          label: '航线',
          type: 'text',
        },
        {
          prop: 'recvWriteoffStatus',
          label: '应收核销状态',
          width: 90,
          type: 'select',
          propInDict: 'writeoffStatus',
          formatter: ({ row }) => {
            const statusName = this.dictMapObj.writeoffStatus[row.recvWriteoffStatus]
            if (row.recvWriteoffStatus === 'part_finish') {
              return '<span style="color:#EDB534">' + statusName + '</span>'
            } else if (row.recvWriteoffStatus === 'finish') {
              return '<span style="color:#33B18A">' + statusName + '</span>'
            } else {
              return statusName
            }
          },
        },
        {
          prop: 'mblPutStatus',
          label: 'MBL放单状态',
          type: 'select',
          propInDict: 'finOrderPutStatus',
        },
        {
          prop: 'hblPutStatus',
          label: 'HBL放单状态',
          type: 'select',
          propInDict: 'finOrderPutStatus',
        },
        {
          prop: 'refuseReason',
          label: '审核拒绝原因',
          type: 'tooltip',
          width: 135,
        },
        {
          prop: 'printCount',
          label: '打印次数',
          type: 'text',
        },
        {
          prop: 'printTime',
          label: '打印时间',
          type: 'text',
          width: 135,
        },
        {
          prop: 'hasInvoice',
          label: '开票状态',
          type: 'select',
          propInDict: 'payRelaInvoiceStatus',
        },
        {
          prop: 'invoiceNos',
          label: '发票号',
          type: 'columnTip',
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, { row }, index) => {
              console.log(row)
              let invoiceReceivableIds = row.invoiceReceivableIds_multiValue
                ? row.invoiceReceivableIds_multiValue
                : row.invoiceNos_multiValue
              let invoiceReceivableId = invoiceReceivableIds[index]
              if (!invoiceReceivableId) return
              info({ invoicePaymentId: invoiceReceivableId }).then((res) => {
                if (res.data.fileNo !== '') {
                  this.invoicePreviewForm = res.data
                  //电子发票且已上传附件
                  // this.invoicePreviewForm.invoicePaymentId = invoiceReceivableId
                  this.invoicePreviewOpne = true
                } else {
                  // 纸质发票且未上传附件
                  let query = {
                    invoicePaymentId: invoiceReceivableId,
                  }
                  this.$emit('update:isJumpRouteFromPage', true)
                  this.$router.push({
                    name: 'InvoicePaymentListDetail',
                    query,
                  })
                }
              })
            },
          },
        },
        {
          prop: 'hasCheckInvoiceFile',
          label: '是否有发票查验件',
          type: 'select',
          width: 120,
          propInDict: 'payApplyHasCheckInvoiceFile',
        },
        {
          prop: 'delayInvoice',
          label: '是否后补票',
          type: 'select',
          propInDict: 'yesNo',
        },
        {
          prop: 'delayInvoiceAmt',
          label: '后补票金额',
          width: 110,
          type: 'text',
        },
        {
          prop: 'remark',
          label: '申请备注',
          type: 'tooltip',
          width: 135,
        },
        {
          prop: 'createdName',
          label: '申请人',
          width: 100,
          type: 'text',
        },
        {
          prop: 'createdTime',
          label: '申请时间',
          width: 125,
          type: 'text',
        },
        {
          prop: 'bdEmployeeName',
          label: '销售',
          width: 100,
          type: 'text',
        },
        {
          prop: 'custName',
          label: '委托单位',
          width: 150,
          type: 'text',
          hasTag: true,
        },
        {
          prop: 'specialDeductRechtstraeger',
          label: '手续费承担人',
          width: 100,
          type: 'select',
          propInDict: 'specialDeductRechtstraeger',
        },
        {
          prop: 'sendPayOrderUserName',
          label: '推送人',
          width: 100,
          type: 'text',
        },
        {
          prop: 'sendPayOrderTime',
          label: '推送时间',
          width: 125,
          type: 'text',
        },
        {
          prop: 'confirmName',
          label: '审核人',
          width: 100,
          type: 'text',
        },
        {
          prop: 'confirmTime',
          label: '审核时间',
          width: 125,
          type: 'text',
        },
        {
          prop: 'auditOpinion',
          label: '审核备注',
          width: 125,
          type: 'text',
        },
        {
          prop: 'invoiceRegTime',
          label: '发票登记时间',
          width: 125,
          type: 'text',
        },
        {
          prop: 'isAgentDzgPay',
          label: '是否代大掌柜付款',
          width: 125,
          type: 'select',
          propInDict: 'yesNo',
          formatter: ({ row }) => {
            return row.dzgPayBillNo ? '是' : '否'
          },
        },
        {
          prop: 'dzgFeeAmt',
          label: '代付大掌柜金额',
          width: 125,
          type: 'text',
        },
        {
          prop: 'dzgPayBillNo',
          label: '大掌柜付款单号',
          width: 125,
          type: 'text',
        },
        {
          prop: 'latestDate',
          label: '最晚付款时间',
          width: 125,
          type: 'text',
        },
        {
          prop: 'finRemark',
          label: '财务备注',
          width: 125,
          type: 'text',
        },
        {
          prop: 'polPortName',
          label: '起运港名称',
          type: 'text',
        },
        {
          prop: 'polCountryCname',
          label: '起运港国家',
          type: 'text',
        },
        {
          prop: 'podPortName',
          label: '目的地名称',
          type: 'text',
        },
        {
          prop: 'podCountryCname',
          label: '目的地国家',
          type: 'text',
        },
        {
          prop: 'custClass',
          label: '客户类型',
          width: 105,
          type: 'select',
          // formatter:({row})=>{
          //   const statusName = this.dictMapObj.customerClassNew[row.custClass]
          //   if (row.custClass === 'department') {
          //     return "独立结算部门"
          //   } else {
          //     return statusName
          //   }
          // }
        },
        {
          prop: 'presentedPaperBill',
          label: '交单状态',
          type: 'select',
          propInDict: 'yesNo',
        },
        {
          prop: 'paperBillSubmitTime',
          label: '交单时间',
          type: 'text',
          width: 125,
        },
        {
          prop: 'presentedPaperBillEmpName',
          label: '交单人',
          type: 'text',
        },
        {
          prop: 'recvBankAddr',
          label: '收款银行地址',
          type: 'text',
          width: 120,
        },
        {
          prop: 'recvRegAddr',
          label: '收款方公司地址',
          type: 'text',
          width: 140,
        },
        {
          prop: 'recvSwiftCode',
          label: '收款方SWIFT Code',
          type: 'text',
          width: 120,
        },
        {
          prop: 'transferFeeDeductWay',
          label: '手续费扣款方式',
          type: 'select',
          width: 95,
        },
      ],
      rightFilterBtns: [true, false, false, false],
      loading: false,
      //申请通过
      recvData: {
        recvCorpName: '',
        payWay: '',
        recvAccountNo: '',
        recvAccountPublicType: '',
        recvBankName: '',
        recvBankBranch: '',
        recvAccountName: '',
        recvSwiftCode: '',
        recvRegAddr: '',
        auditOpinion: '',
        payInfoId: '',
        transferFeeDeductWay: '',
      },
      applyForPassOption: {
        show: false,
        title: '审核通过',
        text: '通过',
        btnType: 'success',
        text_cancel: '取消',
        titleText: '',
        width: '720px',
      },
      handlePrintList: [
        { label: '批量打印', value: 'no' },
        { label: '批量打印+附件', value: 'paySettleFileNoPrint' },
        // { label: '打印专项单', value: 'yes' },
      ],
      exportTypeList: [
        { label: '列表', value: 'payApplySettleListExport' },
        { label: '明细', value: 'payApplySettleFeeDetailExport' },
      ],
      financeReceiveList: [
        { label: '标记签收发票', value: 'yes' },
        { label: '撤回签收发票', value: 'no' },
      ],
      pushCashierList: [
        { label: '', value: 'no' },
        { label: '并打印', value: 'yes' },
        { label: '并打印+附件', value: 'paySettleFileNoPrint' },
        // { label: '并打印专项单', value: 'special' },
      ],
    }
  },
  created() {
    this.searchOption1 = {
      saveShow: true,
      saveName: 'PrepayListSettle',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        // 初始搜索条件数
        defaultSearchLength: 6,
        // 条件数组
        searchInputGroup: [
          {
            key: 'allNo',
            value: '',
            showType: '1',
            range: { min: '', max: '' },
          },
          {
            key: 'hasInvoice',
            value: '',
            showType: '2',
            range: { min: '', max: '' },
          },
          {
            key: 'recvCorpCode',
            value: '',
            showType: '3',
            range: { min: '', max: '' },
          },
          {
            key: 'currency',
            value: '',
            showType: '4',
            range: { min: '', max: '' },
          },
          {
            key: 'payAmt',
            value: '',
            showType: '5',
            range: { min: '', max: '' },
          },
          {
            key: 'applyDate',
            value: '',
            showType: '6',
            range: { min: '', max: '' },
          },
        ],
        filterGroups: {
          //1
          allNo: {
            label: '各类单号',
            type: 'input',
            placeholder: '多个单号用空格或逗号分隔',
            showType: '1',
          },
          applyNo: { label: '付款申请号', type: 'input', showType: '1' },
          invoiceNo: { label: '发票号', type: 'input', showType: '1' },
          invoiceRegNo: { label: '发票登记号', type: 'input', showType: '1' },
          mbl: { label: 'MBL', type: 'input', showType: '3' },
          hbl: { label: 'HBL', type: 'input', showType: '3' },
          settleOrderNo: { label: '结算单号', type: 'input', showType: '1' },
          orderNo: { label: '工作单号', type: 'input', showType: '1' },
          //2
          hasInvoice: {
            label: '开票状态',
            type: 'select',
            prop: 'payRelaInvoiceStatus',
            showType: '2',
          },
          delayInvoice: {
            label: '是否后补票',
            type: 'select',
            prop: 'yesNo',
            showType: '2',
          },
          hasCheckInvoiceFile: {
            label: '是否有发票查验件',
            type: 'select',
            prop: 'payApplyHasCheckInvoiceFile',
            showType: '2',
          },
          // payStatus: {  label: '付款状态',  type: 'select',prop:"payStatusType", multiple:true,  showType: '2'  },
          status: {
            label: '状态',
            type: 'select',
            prop: 'payApplySettleStatus',
            multiple: true,
            showType: '2',
          },
          recvFinishStatus: {
            label: '应收核销状态',
            type: 'select',
            prop: 'writeoffStatus',
            multiple: true,
            showType: '2',
          },
          // confirmStatus: {  label: '审核状态',  type: 'select',prop:"payApplySettleStatus", showType: '2'  },
          payWay: {
            label: '付款方式',
            type: 'select',
            prop: 'payWay',
            multiple: true,
            showType: '2',
          },
          settleOrderType: {
            label: '结算类型',
            type: 'select',
            selectOptions: this.dictMap.settleOrderType.filter(
              (v) => v.value === 'nbwl' || v.value === 'normal'
            ),
            multiple: true,
          },
          // hasAgentPay: {  label: '是否代收付',  type: 'select', prop: 'yesNo' },
          //3
          recvCorpCode: {
            label: '结算单位',
            type: 'remoteSelect',
            showType: '3',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'customer,supplier,company' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'customer,supplier,company' }, item)
            },
            remoteSelectList: [],
            scope: true,
          },
          settleMode: {
            label: '账户结算方式',
            type: 'select',
            propInDict: 'bankAccountSettleMode',
            r: true,
            multiple: true,
          },
          bdEmployeeId: {
            label: '销售',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => {
              this.getSellers(queryString, item, 'bd')
            },
            visibleChange: (queryString, item) => {
              this.getSellers(queryString, item, 'bd')
            },
          },
          systemLineCode: {
            label: '航线',
            type: 'remoteSelect',
            clearable: true,
            showType: '3',
            multiple: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.baseSystemLineList(queryString, item),
            visibleChange: (queryString, item) => this.baseSystemLineList(queryString, item),
          },
          settleCycle: {
            label: '结算单位结算周期',
            type: 'select',
            multiple: true,
            prop: 'settleCycle',
          },
          custClass: {
            label: '客户类型',
            type: 'select',
            selectOptions: this.dictMap.customerClassNew.concat({
              label: '独立结算部门',
              value: 'department',
            }),
          },
          // settleCompName: { label: '所属分公司',  type: 'input',  showType: '3'},
          settleCompCode: {
            label: '所属分公司',
            // prop: 'settleCorpCode', // prop: 'settleCorpCode',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) =>
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            visibleChange: (queryString, item) =>
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            remoteSelectList: [],
          },
          recvBankName: { label: '收款银行', type: 'input', showType: '3' },
          recvAccountNo: { label: '收款账号', type: 'input', showType: '3' },
          recvAccountName: {
            label: '收款账户名',
            type: 'input',
            showType: '3',
          },
          isAgentDzgPay: {
            label: '是否代大掌柜付款',
            type: 'select',
            prop: 'yesNo',
            showType: '3',
          },
          //4
          currency: {
            label: '币种',
            type: 'select',
            selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'),
            showType: '4',
          },
          //5
          payAmt: { label: '金额', type: 'range', showType: '5' },
          delayInvoiceAmt: {
            label: '后补票金额',
            type: 'range',
            showType: '5',
          },
          dzgFeeAmt: { label: '代付大掌柜金额', type: 'range', showType: '5' },
          dzgPayBillNo: {
            label: '大掌柜付款单号',
            type: 'input',
            showType: '5',
          },
          //6
          // specialDeductRechtstraeger: { label: '手续费承担人', prop:'specialDeductRechtstraeger', type: 'select',  showType: '6'},
          applyDate: {
            label: '申请时间',
            type: 'daterange',
            format: 'yyyy-MM-dd',
          },
          latestDate: {
            label: '最晚付款时间',
            type: 'daterange',
            format: 'yyyy-MM-dd',
          },
          sendPayOrderUserName: {
            label: '推送人',
            type: 'input',
            showType: '6',
          },
          sendPayOrderTime: {
            label: '推送时间',
            type: 'daterange',
            format: 'yyyy-MM-dd',
          },
          // createdName: { label: '申请人',  type: 'input',  showType: '6'},
          createdBy: {
            label: '申请人',
            prop: 'label',
            type: 'remoteSelect',
            showType: '6',
            multiple: true,
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
            remoteSelectList: [],
          },
          remark: { label: '申请备注', type: 'input', showType: '6' },
          confirmDate: {
            label: '审核时间',
            type: 'daterange',
            format: 'yyyy-MM-dd',
          },
          confirmBy: {
            label: '审核人',
            prop: 'confirmBy',
            type: 'remoteSelect',
            multiple: true,
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
            remoteSelectList: [],
          },
          auditOpinion: { label: '审核备注', type: 'input', showType: '6' },
          payConfirmName: { label: '付款人', type: 'input', showType: '6' },
          payTime: {
            label: '付款时间',
            type: 'daterange',
            format: 'yyyy-MM-dd',
          },
          printTime: {
            label: '打印时间',
            type: 'daterange',
            format: 'yyyy-MM-dd',
          },
          etd: { label: 'ETD', type: 'daterange', format: 'yyyy-MM-dd' },
          eta: { label: 'ETA', type: 'daterange', format: 'yyyy-MM-dd' },
          polPortCode: {
            label: '起运港名称',
            type: 'remoteSelect',
            showType: '6',
            multiple: true,
            remoteMethod: (val, item) => {
              this.portSearch(val, item, 'port_of_basic')
            },
            visibleChange: (val, item) => {
              this.portSearch(val, item, 'port_of_basic')
            },
            remoteSelectList: [],
          },
          polCountryCname: {
            label: '起运港国家',
            type: 'input',
            showType: '6',
          },
          podPortCode: {
            label: '目的地名称',
            type: 'remoteSelect',
            showType: '6',
            multiple: true,
            remoteMethod: (val, item) => {
              this.portSearch(val, item, 'port_of_destination')
            },
            visibleChange: (val, item) => {
              this.portSearch(val, item, 'port_of_destination')
            },
            remoteSelectList: [],
          },
          // podCountryCname: { label: '目的地国家',  type: 'input',  showType: '6'},
          podCountryCode: {
            label: '目的地国家',
            type: 'remoteSelect',
            multiple: true,
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.countrySelectList(queryString, item),
            visibleChange: (queryString, item) => this.countrySelectList('', item),
          },
          presentedPaperBill: {
            label: '交单状态',
            type: 'select',
            prop: 'yesNo',
          },
          paperBillSubmitTime: {
            label: '交单时间',
            type: 'daterange',
            format: 'yyyy-MM-dd',
          },
          presentedPaperBillBy: {
            label: '交单人',
            prop: 'label',
            type: 'remoteSelect',
            showType: '6',
            multiple: true,
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
            remoteSelectList: [],
          },
          recvSwiftCode: { label: 'SWIFT Code', type: 'input' },
          transferFeeDeductWay: {
            label: '手续费扣款方式',
            type: 'select',
            prop: 'transferFeeDeductWay',
          },
          mblPutStatus: {
            label: 'MBL放单状态',
            type: 'select',
            prop: 'finOrderPutStatus',
          },
          hblPutStatus: {
            label: 'HBL放单状态',
            type: 'select',
            prop: 'finOrderPutStatus',
          },
        },
      },
    }
    let _this = this
    this.autocomplete = {
      querySearch: (queryString, cb) => {
        _this.selectedOptionItem = ''
        _this.querySettleUnit(queryString, cb)
      },
      select: (optionItem, row) => {
        _this.selectedOptionItem = optionItem
        _this.form.settleCorpName = optionItem.value
        _this.form.settleCorpCode = optionItem.key
      },
      change: (val, row) => {
        // 延时150ms获取select中的改变
        setTimeout(() => {
          if (_this.selectedOptionItem === '') {
            _this.form.settleCorpName = ''
            _this.form.settleCorpCode = ''
            return
          }
        }, 150)
      },
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      width: '90px',
      data: [
        {
          label: '备注',
          type: 'text',
          showFn: () => this.checkAuth(this.$route.name, 'tab-settleList', 'btn-Remark'),
          action: 'Remark',
          style: 'color: rgb(237, 181, 52);',
        },
        {
          label: '详情',
          type: 'text',
          showFn: () => this.checkAuth(this.$route.name, 'tab-settleList', 'btn-detail'),
          action: 'showDetail',
        },
      ],
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true,
      isNew: true,
    })
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, {
      show: true,
    })
    this.passTableOption = Object.assign({}, this.option, {
      operationBtns: false,
      selection: { show: false },
      showFooter: true,
      edit: true,
      columns: [
        {
          prop: 'applyNo',
          label: '付款申请单号',
          type: 'text',
          width: '130px',
        },
        { prop: 'applyPayAmt', label: '金额', type: 'text', width: '90px' },
        {
          prop: 'latestDate',
          label: '最晚付款时间',
          type: 'datePicker',
          width: '120px',
        },
        // { prop: 'latestDate', label: '最晚付款时间', type: 'datePicker', width: '120px', required: true },
        {
          prop: 'auditOpinion',
          label: '审核备注',
          type: 'input',
          minWidth: '320px',
        },
      ],
    })

    this.passTableOption.footerMethod = ({ columns, data }) => {
      const sums = []
      columns.forEach((column, index) => {
        if (column.property === 'applyNo') {
          sums[index] = '合计'
        } else if (column.property === 'applyPayAmt') {
          const values = data.map((item) => item.applyPayAmt || 0)
          sums[index] = values.reduce((pre, cur) => new LSnum(pre).plus(cur).toNum(2), 0)
        } else {
          sums[index] = ''
        }
      })
      return [sums]
    }
    this.option1 = Object.assign({}, this.option, {
      customColumns: {
        show: true,
        handleCustomColumns: () => {
          if (!this.isNotFirtGetData) {
            this.getData(false, true).then((res) =>
              setTimeout(() => (this.customColumnsPopShow = true), 600)
            )
          } else {
            this.customColumnsPopShow = true
          }
        },
      },
      sortable: true,
      id: 'option1',
      $name: 'paySettleList',
      data: [...this.option.data],
      tips: {
        text: '',
        show: false,
      },
      operationBtns,
      pagination,
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
      listAmtSummary,
      maxHeight: this.getFinanceTableMaxHeight,
      emptyText: '数据将在查询后显示',
    })
    let columns = [
      ...this.selfColumnsBase.map((item) => {
        if (item.prop == 'custClass') {
          item.selectOptions = this.dictMap.customerClassNew.concat({
            label: '独立结算部门',
            value: 'department',
          })
          item.selectOptionsObj = {
            ...this.dictMapObj.customerClassNew,
            department: '独立结算部门',
          }
        }
        return item
      }),
    ]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    let sortableList = [
      'printTime',
      'applyNo',
      'settleCompName',
      'recvCorpName',
      'payTime',
      'currency',
      'applyPayAmt',
      'status',
      'printCount',
      'delayInvoice',
      'createdName',
      'createdTime',
      'sendPayOrderTime',
      'confirmTime',
      'latestDate',
      'finRemark',
      'etaTimeStr',
      'etdTimeStr',
      'delayInvoiceAmt',
    ]
    this.selfColumnsBase.forEach((item) =>
      sortableList.includes(item.prop) ? (item.sortable = true) : (item.sortable = false)
    )
    this.option1.columns = columns
    this.cTimestamp = new Date().getTime()
  },
  methods: {
    submit() {},
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    delayInvoice() {
      if (this.multipleSelection1.length === 0) {
        this.$message({
          message: '请勾选需要标记后补发票的项！',
          type: 'error',
          showClose: true,
        })
        return
      }
      let applyNoList = this.multipleSelection1.map((item) => {
        return item.applyNo
      })
      settleDelayInvoice({ applyNoList: applyNoList }).then((res) => {
        if (res.code === 0) {
          this.$message({ message: '标记候补发票提交成功', type: 'success' })
          this.getData()
        }
      })
    },
    approvePassData(data) {
      Object.assign(this.recvData, {}, data)
    },
    sure(val) {
      if (val) {
        this.$refs.recvData.validate((valid) => {
          if (valid) {
            const data = Object.assign(this.query, this.recvData)
            data.payApplySettleSimpleDtoList = this.passTableOption.data.map((item) => {
              item.latestDate = item.latestDate ? dateFormat('yyyy-mm-dd', item.latestDate) : ''
              return item
            })

            let multipleSelection = this.multipleSelection1

            let sta1 = multipleSelection.find(
              (item) => item.recvWriteoffStatus !== 'finish' && item.hasCustSpecialFee === 'yes'
            )

            let invoiceRecvAcctEqRestList = []
            multipleSelection.forEach((item) => {
              if (item.invoiceRecvAcctEqRest === 'no') {
                invoiceRecvAcctEqRestList.push(item)
              }
            })

            if (sta1) {
              this.$confirmWarn('含有应收未收清的申请单，是否继续审核通过？', () => {
                if (invoiceRecvAcctEqRestList.length) {
                  let text = invoiceRecvAcctEqRestList[0].invoiceRecvAcctNotEqWarningMsg
                ? invoiceRecvAcctEqRestList[0].invoiceRecvAcctNotEqWarningMsg
                : '发票登记账号和付款账号不一致,是否审核通过'
                this.$confirmWarn(text, () => {this.sureOk(data)})
                } else {
                  this.sureOk(data)
                }
              })
              return
            }

            if (invoiceRecvAcctEqRestList.length) {
              let text = invoiceRecvAcctEqRestList[0].invoiceRecvAcctNotEqWarningMsg
                ? invoiceRecvAcctEqRestList[0].invoiceRecvAcctNotEqWarningMsg
                : '发票登记账号和付款账号不一致,是否审核通过'
              this.$confirmWarn(text, () => {
                this.sureOk(data)
              })
              return
            }
            this.sureOk(data)
          }
        })
      }
    },
    sureOk(data) {
      batchApproveData(data).then((res) => {
        this.$message({
          message: '提交成功！',
          type: 'success',
          showClose: true,
        })
        this.applyForPassOption.show = false
        this.getData()
      })
    },
    applyForPassOptionClose() {
      this.applyForPassOption.show = false
    },
    // 审核通过 修改为可批量操作（需要满足的条件：同结算单位、收款账户相同、币种相同、付款方式相同。），从通用方法分离出来
    handleApplyForPass() {
      let multiData = this.multipleSelection1
      if (multiData.length === 0) {
        return this.$msgErrClose('请勾选需要审核通过的项！')
      }
      if(multiData.find(v => v.status !== 'pending' && v.status !== 'approving')){
        return this.$msgErrClose('只能勾选状态为待审核的项！')
      }
      if (
        !this.selectedValueSame(multiData, [
          'recvCorpCode',
          'recvAccountName',
          'currency',
          'payWay',
        ])
      ) {
        return this.$msgErrClose(
          '批量操作需要满足的条件：同结算单位、收款账户相同、币种相同、付款方式相同！'
        )
      }
      let str = multiData
        .filter((v) => v.electrInvoiceNotFile === 'yes')
        .map((v) => v.notImgFileElectrInvoiceNo)
        .toString()
      if (str) {
        return this.$msgErrClose('电子发票未上传附件的发票号码' + str + '！不能进行审核通过！')
      }
      queryBatchApproveData({
        applyNoList: multiData.map((v) => v.applyNo),
      }).then((res) => {
        this.approvePassData(res.data)
        this.bankAccountList('', true)
        this.passTableOption.data = res.data.payApplySettleSimpleDtoList.map((item) => ({
          ...item,
          edit: true,
        }))
        this.applyForPassOption.show = true
      })
    },
    // 审核拒绝
    handleApplyFor(confirmStatus) {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose('请勾选需要审核拒绝的项！')
      }
      if (this.multipleSelection1.length > 1) {
        return this.$msgErrClose('一次只能勾选1条数据进行审核，请重新选择！')
      }
      let row = this.multipleSelection1[0]
      console.log(row.settleCompCode, this.userSettleCompanyCode)
      if (this.userSettleCompanyCode !== row.settleCompCode) {
        return this.$msgErrClose(
          `您没有权限操作${row.settleCompName}的数据，请在系统右上角切换分公司！`
        )
      }
      if (row.status !== 'pending' && row.status !== 'approving') {
        return this.$msgErrClose('只能勾选状态为待审核的项')
        // this.$message({  message: this.multipleSelection1[0].applyNo+'已处理，请不要重复操作',  type: 'error',  showClose: true  })
      }
      let applyNo = this.multipleSelection1.map((item) => item.applyNo)
      // let list = []
      // let payInfoList = this.multipleSelection1[0].payInfoList
      this.query.applyNoList = applyNo
      this.query.confirmStatus = confirmStatus
      // payInfoList.forEach(item => {
      //   this.$store.dispatch('dict/bankAccountList', { "currency":item.currency,"unitCode":item.payCorpCode}  ).then(res => {
      //     let payBank = res.length ? {
      //       payAccountShortName : res[0].accountShortName,
      //       payBankName : res[0].bankName,
      //       payAccountNo : res[0].accountNo,
      //       payAccountName : res[0].accountName,
      //       payCompName : res[0].unitName,
      //       payBankBranch : res[0].bankBranch,
      //       payBankCode : res[0].bankCode,
      //       payBankAccountId : res[0].settleUnitBankAcctId,
      //     } : {}
      //     Object.assign(item,payBank)
      //     list.push(item)
      //   })
      // })
      // this.query.payInfoList = list
      // if(confirmStatus==="pass"){
      //     let recvData = this.multipleSelection1[0].payInfoVo
      //     const settleData = this.multipleSelection1[0]
      //     if(settleData.electrInvoiceNotFile === 'yes'){
      //       return this.$msgErrClose('电子发票未上传附件的发票号码'+settleData.notImgFileElectrInvoiceNo+'！不能进行审核通过！')
      //     }
      //     let data = {
      //       recvCorpName: recvData.recvCorpName,
      //       payWay:recvData.payWay,
      //       recvBankName : '',
      //       recvAccountNo : '',
      //       recvAccountPublicType: '',
      //       recvAccountName : '',
      //       recvRegAddr : '',
      //       recvSwiftCode :  '',
      //       auditOpinion :  settleData.auditOpinion,
      //       payInfoId:recvData.payInfoId
      //     }
      //     if(recvData){
      //       if(recvData.payWay === 'prepay_dedue'){
      //         this.approvePassData(data)
      //       }else{
      //         recvData.auditOpinion = settleData.auditOpinion
      //         this.approvePassData(recvData)
      //       }
      //     }else{
      //       this.approvePassData(data)
      //     }
      //     this.bankAccountList('',true)

      //     this.applyForPassOption.show = true
      //     return
      //     // this.$confirm('您确定要审核通过结算单付款申请吗?', "审核通过", {
      //     //   confirmButtonText: "确定",
      //     //   cancelButtonText: "取消",
      //     //   lockScroll: "true",
      //     //   type: "warning"
      //     // }).then(()=> {
      //     //     return approvePayApplySettle(this.query);
      //     // }).then(() => {
      //     //   this.$message({message: '审核通过提交成功', type: 'success'});
      //     //   this.getData()
      //     // }).catch(function() {});
      // }else{
      this.rejectDialogVisible = true
      this.query.refuseReason = ''
      // }
    },
    rejectSubmit() {
      this.$refs.query.validate((valid) => {
        if (valid) {
          this.query.loading = true
          approvePayApplySettle(this.query)
            .then((res) => {
              this.$message({ message: '拒绝申请提交成功', type: 'success' })
              this.getData()
              this.rejectDialogVisible = false
            })
            .finally(() => {
              this.query.loading = false
            })
        }
      })
    },
    batchPrintCreate() {
      if (this.multipleSelection1.length > 0) {
        this.$message({
          message: '不用勾选',
          type: 'error',
          showClose: true,
        })
        return
      }
      this.$router.push({ path: '/finance/pay/prepayDetail' })
    },
    querySettleUnit(queryString, cb) {
      this.$store.dispatch('dict/currencyList', queryString ? queryString : '').then((data) => {
        cb(data)
      })
    },
    closeInvoiceDetail() {
      this.showInvoiceDetail = false
    },
    closeDialogVisible(val, isBreak) {
      this.dialogVisibleInvoice = val
      if (isBreak === true) {
        this.getData()
      }
    },
    isRepeat(arr) {
      var hash = {}
      for (var i in arr) {
        if (hash[arr[i]]) {
          return true
        }
        hash[arr[i]] = true
      }
      return false
    },
    identifyElecInvoice() {
      let list = this.multipleSelection1
      if (this.multipleSelection1.length === 0) {
        this.$message({
          message: '请勾选结算单需要登记的项！',
          type: 'error',
          showClose: true,
        })
        return
      }
      for (let i = 0; i < list.length; i++) {
        if (list[0].currency !== list[i].currency) {
          return this.$msgErrClose('相同币种才能进行关联发票！请重新选择！')
        }
        if (list[0].recvCorpCode !== list[i].recvCorpCode) {
          return this.$msgErrClose('相同结算单位才能进行关联发票！请重新选择！')
        }
        if (this.multipleSelection1[i].status === 'refuse') {
          return this.$msgErrClose(
            this.multipleSelection1[i].applyNo + '审核拒绝状态不能进行发票登记，请重新选择！'
          )
        }
        if (this.multipleSelection1[i].hasInvoice === 'yes') {
          return this.$message({
            message: this.multipleSelection1[i].applyNo + '单已开票！请勿重复发票登记',
            type: 'error',
            showClose: true,
          })
        }
        if (this.multipleSelection1[i].needRelationInvoiceAmt === 0) {
          return this.$message({
            message:
              '结算付款申请单' +
              this.multipleSelection1[i].applyNo +
              '只有押金类费用，不支持应付发票登记',
            type: 'error',
            showClose: true,
          })
        }
      }
      let query = {
        payApplySettleNoList: this.multipleSelection1.map((item) => {
          return item.applyNo
        }),
        currency: this.multipleSelection1[0].currency,
        supplierCorpName: this.multipleSelection1[0].recvCorpName,
        supplierCorpCode: this.multipleSelection1[0].recvCorpCode,
        settleCompCode: this.multipleSelection1[0].settleCompCode,
        recvAccountNo: this.multipleSelection1[0].payInfoVo.recvAccountNo,
        recvBankAccountId: this.multipleSelection1[0].recvBankAccountId,
        from: 'PrepayList',
      }
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({
        name: 'IdentifyElecInvoice',
        query,
      })
    },
    //发票登记
    addInvoice() {
      let list = this.multipleSelection1
      if (this.multipleSelection1.length === 0) {
        this.$message({
          message: '请勾选结算单需要登记的项！',
          type: 'error',
          showClose: true,
        })
        return
      }
      for (let i = 0; i < list.length; i++) {
        if (list[0].currency !== list[i].currency) {
          return this.$msgErrClose('相同币种才能进行关联发票！请重新选择！')
        }
        if (list[0].recvCorpCode !== list[i].recvCorpCode) {
          return this.$msgErrClose('相同结算单位才能进行关联发票！请重新选择！')
        }
        if (this.multipleSelection1[i].status === 'refuse') {
          return this.$msgErrClose(
            this.multipleSelection1[i].applyNo + '审核拒绝状态不能进行发票登记，请重新选择！'
          )
        }
        if (this.multipleSelection1[i].hasInvoice === 'yes') {
          return this.$message({
            message: this.multipleSelection1[i].applyNo + '单已开票！请勿重复发票登记',
            type: 'error',
            showClose: true,
          })
        }
        if (this.multipleSelection1[i].needRelationInvoiceAmt === 0) {
          return this.$message({
            message:
              '结算付款申请单' +
              this.multipleSelection1[i].applyNo +
              '只有押金类费用，不支持应付发票登记',
            type: 'error',
            showClose: true,
          })
        }
      }

      let isInvoiceNo = this.multipleSelection1[0].invoiceNo.split(',').map((subItem) => {
        let arr = subItem.split('/')
        return arr[0]
      })

      let query = {
        titleName: '发票登记',
        name: 'SettleList',
        currency: this.multipleSelection1[0].currency,
        amt: this.multipleSelection1[0].delayInvoiceAmt,
        supplierCorpName: this.multipleSelection1[0].recvCorpName,
        supplierCorpCode: this.multipleSelection1[0].recvCorpCode,
        recvAccountNo: this.multipleSelection1[0].payInfoVo.recvAccountNo,
        payApplySettleNoList: this.multipleSelection1.map((item) => {
          return item.applyNo
        }),
        settleCompCode: this.multipleSelection1[0].settleCompCode,
        isRepeatInvoiceNo: this.isRepeat(isInvoiceNo),
        recvBankAccountId: this.multipleSelection1[0].recvBankAccountId,
      }
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({
        name: 'InvoicePaymentListReg',
        query,
      })
    },
    querySettleUnit1(queryString, cb) {
      this.$store.dispatch('dict/querySettleUnit', queryString ? queryString : '').then((data) => {
        cb(data)
      })
    },
    getData(isSearch, customerList) {
      this.isNotFirtGetData = true
      this.loading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: customerList ? 0 : this.option1.pagination.pageSize,
        columns: [],
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption1, false, 'rangeMinMax')
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      console.log(data.query)
      if (!data.query.some((item) => item.column === 'settleOrderType')) {
        console.log(1)
        data.query.push({
          column: 'settleOrderType',
          type: 'in',
          value: 'nbwl,normal', // "normal,special,bad_debt,agent,group,supplier_special,group_special,business_collaboration_nbwl,agent_nbwl"，拆出专项类
        })
      }
      return queryPayApplySettlePage(data)
        .then((res) => {
          if (res.code === 0) {
            this.finCommonColumns(res)
            if (customerList) return
            let list = res.data.list
            let data = []
            list.forEach((item) => {
              item.settleOrderNo_multiValue = item.settleOrderNo.split(',')
              item.sourceType_multiValue = item.orderNo.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[1] ? arr[1] : arr[0]
              })
              item.orderNo_multiValue = item.orderNo.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[0]
              })
              item.invoiceNos_multiValue = item.invoiceNo.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[1] ? arr[1] : arr[0]
              })
              item.invoiceReceivableIds_multiValue = item.invoiceNo.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[0]
              })
              item.payWay = item.payInfoVo.payWay
              if (item.whitelistFlag === 'yes') {
                item._tagArr = [
                  {
                    type: 'tag-pass',
                    text: '白',
                  },
                ]
              }
              data.push(item)
            })
            this.option1.data = data
            this.table1DataBackup = [...this.option1.data]
            Object.assign(this.option1.pagination, res.data)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    getListAmtSummary(data) {
      queryPayApplySettlePageSummary(data).then((res) => {
        if (res.code === 0 && res.data) {
          let labelObj = {
            payAmtSummaryListLabel: '付款金额',
            delayInvoiceAmtSummaryListLabel: '后补票金额',
          }
          let colorObj = {
            payAmtSummaryListColor: 'green', // 支持red, green, black三种值
            delayInvoiceAmtSummaryListColor: 'red',
          }
          let data = res.data
          this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
            show: true,
            data,
            labelObj,
            colorObj,
          })
        }
      })
    },
    sendMulti(data, option) {
      this.multipleSelection1 = data
      let data2 = {
        ascColumns: [],
        descColumns: [],
        query: [],
      }
      let ids = this.multipleSelection1
        .map((item) => {
          return item.applyNo
        })
        .join(',')
      if (ids) {
        data2.query.push({
          column: 'applyNoList',
          type: 'eq',
          value: ids,
        })
      } else {
        data2.query = this.searchBackup || []
      }
      if (data.length || this.option1.listAmtSummary.count++ > 0) {
        this.debounceLs(() => {
          this.getListAmtSummary(data2)
        })
      }
    },
    search(data, index) {
      this.buttonSearch = data
      this.option1.pagination.currPage = 1
      this.getData(true)
      if (index || index === 0) {
        this.rightFilterBtns = [false, false, false]
        this.rightFilterBtns[index] = true
      }
    },
    closeDialogVisibleRelationInvoice(val, isBreak) {
      this.relevanceOpne = val
      if (isBreak === true) {
        this.getData()
      }
    },
    //关联发票
    handleRelationInvoice() {
      let list = this.multipleSelection1
      if (list.length === 0) {
        return this.$msgErrClose('请勾选需要关联的结算单！')
      }
      console.log(this.multipleSelection1[0].payInfoVo.delayInvoiceAmt)
      for (let i = 0; i < list.length; i++) {
        if (list[i].payInfoVo.delayInvoiceAmt == 0) {
          return this.$msgErrClose(
            '付款申请单已足额关联发票，如需重新关联请先删除无用发票后再操作！'
          )
        }
        if (list[i].status === 'refuse') {
          return this.$msgErrClose(list[i].applyNo + '审核拒绝状态，不允许关联发票！')
        }
        if (list[0].currency !== list[i].currency) {
          return this.$msgErrClose('相同币种才能进行关联发票！请重新选择！')
        }
        if (list[0].recvCorpCode !== list[i].recvCorpCode) {
          return this.$msgErrClose('相同结算单位才能进入关联发票！请重新选择！')
        }
        if (this.multipleSelection1[i].needRelationInvoiceAmt === 0) {
          return this.$message({
            message:
              '结算付款申请单' +
              this.multipleSelection1[i].applyNo +
              '只有押金类费用，不支持关联应付发票',
            type: 'error',
            showClose: true,
          })
        }
      }

      Object.assign(this.relationInvoiceForm, {}, this.multipleSelection1[0])
      this.relationInvoiceForm.payInfoId = this.multipleSelection1.map((item) => {
        return item.payInfoVo.payInfoId
      })
      this.relationInvoiceForm.supplierAccountNo =
        this.multipleSelection1[0].payInfoVo.recvAccountNo
      this.relationInvoiceForm.name = 'settle'
      this.relevanceOpne = true
    },
    //批量下载
    handleDownLoadInvoice() {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose('请勾选需要下载结算单发票的项！')
      }
      for (let i = 0; i < this.multipleSelection1.length; i++) {
        if (this.multipleSelection1[i].hasInvoice !== 'yes') {
          return this.$msgErrClose('只有已开票状态才能批量下载！请重新选择！')
        }
      }
      let data = {
        applyNoList: this.multipleSelection1.map((item, index) => {
          return item.applyNo
        }),
      }
      let invoiceNoList = []
      for (let i = 0; i < this.multipleSelection1.length; i++) {
        if (!this.multipleSelection1[i].invoiceNo) {
          invoiceNoList.push(this.multipleSelection1[i].applyNo)
        }
      }
      this.$confirm(
        invoiceNoList.length
          ? '您有' +
              invoiceNoList.toString() +
              '付款申请号未关联发票，不能被下载，是否确认下载已关联的发票！'
          : '您是否确定批量下载发票吗?',
        '下载发票',
        {
          showCancelButton: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              instance.confirmButtonLoading = true
              instance.confirmButtonText = '执行中...'
              setTimeout(() => {
                this.$store
                  .dispatch('finance/downloadBlobFilePost', {
                    uri: '/fin/pay/settle/downLoadInvoice',
                    data: { data },
                  })
                  .then((res) => {
                    let link = document.createElement('a')
                    link.href = window.URL.createObjectURL(res)
                    link.download = '发票.pdf'
                    link.click()
                    done()
                    instance.confirmButtonLoading = false
                  })
                  .catch((err) => {
                    done()
                    instance.confirmButtonLoading = false
                  })
              }, 500)
            } else {
              done()
            }
          },
        }
      )
        .then((err) => {})
        .catch(() => {})
    },
    downLoadInvoice(data) {},
    //推送出纳
    handlePushCashier(val) {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose('请勾选需要结算单推送出纳的项！')
      }
      if (val.value === 'special') {
        if (this.multipleSelection1.length !== 1) {
          return this.$msgErrClose('打印专项单只支持单页打印，请选择一项进行操作！')
        }
      }
      if (val.value === 'paySettleFileNoPrint') {
      }
      for (let i = 0; i < this.multipleSelection1.length; i++) {
        if (this.multipleSelection1[i].status !== 'pass') {
          return this.$msgErrClose('只有状态为审核通过待推送的才能推送出纳！请重新选择！')
        }
      }
      let applyNoList = this.multipleSelection1.map((item) => {
        return item.applyNo
      })
      generatePayOrder({ applyNoList: applyNoList }).then((res) => {
        this.$message({ message: '推送出纳成功', type: 'success' })
        this.getData()
        if (val.value === 'yes') {
          this.$emit('update:isJumpRouteFromPage', true)
          this.$router.push({
            name: 'PaySettlePrint',
            query: { applyNoList },
          })
        }
        if (val.value === 'special') {
          this.$emit('update:isJumpRouteFromPage', true)
          this.$router.push({
            name: 'PaySettlePrints',
            query: { applyNoList },
          })
        }
        if (val.value === 'paySettleFileNoPrint') {
          this.$emit('update:isJumpRouteFromPage', true)
          this.$router.push({
            name: 'PaySettleFileNoPrint',
            query: { applyNoList },
          })
        }
      })
    },
    // 所属员工下拉框
    getEmployeeList(queryString, item) {
      employeeSelectlist({ name: queryString, deptCodes: this.compCode }).then((res) => {
        let list = res.data.map((item) => ({
          ...item,
          label: `${item.cname} (${item.employeeNo})`,
          value: item.employeeId,
        }))
        if (this.remoteSelectCommon(item, list)) return
        this.employeeOptions.splice(0, 1000, ...list)
      })
    },
    //合并付款
    handleMerge() {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose('请勾选结算单合并付款的项！')
      }
      if (this.multipleSelection1.length < 2) {
        return this.$msgErrClose('至少勾选两个结算单合并付款！')
      }
      if (
        this.multipleSelection1.some((item) => {
          return (
            item.payInfoVo.transferFeeDeductWay !==
            this.multipleSelection1[0].payInfoVo.transferFeeDeductWay
          )
        })
      ) {
        return this.$msgErrClose('手续费扣款方式不同，不可以合并付款！')
      }
      let applyNoList = this.multipleSelection1.map((item) => {
        return item.applyNo
      })
      mergePayApplySettle({ applyNoList: applyNoList }).then((res) => {
        if (res.code === 0) {
          this.$message({ message: '合并付款提交成功', type: 'success' })
          this.getData()
        }
      })
    },
    // 打印
    handlePrint(val) {
      let len = this.multipleSelection1.length
      if (!len) {
        return this.$msgErrClose('请先勾选至少1条数据，再进行打印！')
      }
      this.$emit('update:isJumpRouteFromPage', true)
      let applyNoList = this.multipleSelection1.map((item) => {
        return item.applyNo
      })
      if (val === 'yes') {
        if (len > 1) {
          return this.$msgErrClose('一次只能勾选1条数据进行打印专项单，请重新选择！')
        }
      }
      if (len > 50) {
        return this.$msgErrClose('一次最多只能勾选50条数据进行批量打印，请重新选择！')
      }
      let route = ''
      if (val === 'yes') {
        route = 'PaySettlePrints'
      } else if (val === 'no') {
        route = 'PaySettlePrint'
      } else if (val === 'paySettleFileNoPrint') {
        route = 'PaySettleFileNoPrint'
      }
      this.$router.push({
        name: route,
        query: { applyNoList },
      })
    },
    //导出按钮
    handleExport(exportType) {
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        columns: [],
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption1)
      if (!data.query.some((item) => item.column === 'settleOrderType')) {
        console.log(1)
        data.query.push({
          column: 'settleOrderType',
          type: 'in',
          value: 'nbwl,normal', //"normal,special,bad_debt,agent,group,supplier_special,group_special,business_collaboration_nbwl,agent_nbwl"
        })
      }
      if (this.multipleSelection1.length) {
        data.query = [
          {
            column: 'applyNo',
            type: 'in',
            value: this.multipleSelection1.map((v) => v.applyNo).join(','),
          },
        ]
      }
      //查询对象的配置编码
      data.query.push({
        column: 'queryDataModuleCode',
        value: exportType.value,
      })
      // data.query.push({ "column": "queryDataModuleCode", "value": "payApplySettleListExport" })

      this.$confirm('是否确认导出结算付款单' + exportType.label + '?', '导出结算付款单', {
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        lockScroll: 'true',
        type: 'warning',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '执行中...'
            setTimeout(() => {
              this.option1.loading = true
              this.$store
                .dispatch('finance/downloadBlobFilePost', {
                  uri: '/fin/common/queryDataExportExcel',
                  data: { data },
                })
                .then((res) => {
                  this.option1.loading = false
                  console.log(res)
                  let link = document.createElement('a')
                  link.href = window.URL.createObjectURL(res)
                  link.download = '结算付款申请单' + exportType.label + '.xlsx'
                  link.click()
                  done()
                  instance.confirmButtonLoading = false
                })
                .catch(() => {
                  this.option1.loading = false
                  this.$message({ message: '导出失败', type: 'error' })
                  done()
                  instance.confirmButtonLoading = false
                })
            }, 10)
          } else {
            done()
            instance.confirmButtonLoading = false
          }
        },
      })
        .then(() => {})
        .catch(() => {})
    },
    // 自定义表头
    // handleCustomColumns () {
    // 	this.customColumnsPopShow = true
    // },
    //撤回付款审核
    handleWithdrawPayApplyAudit() {
      let len = this.multipleSelection1
      if (len.length === 0) {
        return this.$msgErrClose('请勾选需要撤销付款审核的项！')
      }
      if (len.length !== 1) {
        return this.$msgErrClose('一次只能勾选1条数据进行撤销付款审核，请重新选择！')
      }
      for (let i = 0; i < len.length; i++) {
        if (
          !(
            len[i].confirmStatus === 'pass' &&
            len[i].status !== 'paying' &&
            len[i].status !== 'pay_done'
          )
        ) {
          return this.$msgErrClose('审核通过的且未支付才能操作撤销审核，请重新选择！')
        }
      }
      let applyNoList = len.map((item) => {
        return item.applyNo
      })
      let data = {
        applyNoList,
      }
      this.$confirm('是否确认撤销付款审核？', '提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        cancelButtonClass: 'btn-custom-cancel',
        type: 'warning',
      }).then(() => {
        settleWithdrawPayApplyAudit(data).then((res) => {
          this.$message({ message: '撤销付款审核成功', type: 'success' })
          this.getData()
        })
      })
    },
    //拆分付款
    handlePaySeparately() {
      console.log(this.multipleSelection1)
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose('请勾选需要拆分付款结算单的项！')
      }
      if (this.multipleSelection1.length > 1) {
        return this.$msgErrClose('一次只能勾选一个结算单拆分付款！')
      }
      //hasHeadCompany  结算付款列表加了一个总公司标记，yes标识总公司，no则不是总公司
      if (
        this.multipleSelection1[0].currency === 'USD' &&
        this.multipleSelection1[0].invoiceNos_multiValue.length <= 1 &&
        this.multipleSelection1[0].hasHeadCompany === 'yes'
      ) {
        return this.$msgErrClose('付款币种为USD且关联两张以上发票时才能拆分！请重新选择！')
      }
      if (this.multipleSelection1[0].confirmStatus !== 'pending') {
        return this.$msgErrClose('待审核状态可被拆分付款！请选择待审核状态！')
      }
      this.splitPayApplySettleDialog = true
      this.applyNo = this.multipleSelection1[0].applyNo
      // this.payInfoList = this.multipleSelection1[0].payInfoVo.payInfoInvoices
      // Object.assign(this.splitPayApplySettleForm,{},this.multipleSelection1[0].payInfoVo)
    },
    presentPaperBill(val) {
      let title = val === 'yes' ? '交单' : '撤单'
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose(`请勾选需要${title}的项！`)
      }
      let presentedPaperBills = this.multipleSelection1.map((item) => item.presentedPaperBill)
      if (val === 'yes' && presentedPaperBills.includes('yes')) {
        return this.$msgErrClose('所选数据包含已交单数据，请检查！')
      }
      if (val === 'no' && presentedPaperBills.includes('no')) {
        return this.$msgErrClose('所选数据包含未交单数据，请检查！')
      }
      this.$confirm(`是否确认${title}？`, '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning',
      })
        .then(() => {
          let data = {
            applyNoList: this.multipleSelection1.map((item) => item.applyNo),
            presentedPaperBill: val,
          }
          presentedPaperBill(data).then((res) => {
            this.$message({ message: `${title}成功`, type: 'success' })
            this.getData()
          })
        })
        .catch((err) => {
          console.log(err)
        })
    },
    closePaySeparatelyDialog(val, isBreak) {
      this.splitPayApplySettleDialog = val
      if (isBreak === true) {
        this.getData()
      }
    },
    handleRemark(row) {
      this.remarkDialogVisible = true
      this.remark = Object.assign(this.remark, {
        finRemark: row.finRemark,
        applyNo: row.applyNo,
      })
    },
    remarkDialogVisibleCancel() {
      this.remarkDialogVisible = false
      this.$refs.remark.clearValidate('finRemark')
    },
    remarkSubmit() {
      this.$refs.remark.validate((valid) => {
        if (valid) {
          this.remarkLoading = true
          settleModifyFinRemark(this.remark)
            .then((res) => {
              this.$message({ message: '备注提交成功', type: 'success' })
              this.remarkDialogVisibleCancel()
              this.getData()
            })
            .finally(() => {
              this.remarkLoading = false
            })
        }
      })
    },
    showDetail(row) {
      let query = {
        applyNo: row.applyNo,
        settleOrderNo: row.settleOrderNo,
        confirmStatus: row.confirmStatus,
      }
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({
        name: 'SettleDetail',
        query,
      })
      // this.routerPush('SettleDetail', query)
    },
    openBillDetail(payload) {
      this.orderBillId = payload.billId
      this.showBillDetail = payload.show
    },
    showColumnDetail(params) {
      this.showColumnDetailHandle(params, { isTab: true })
    },
    closeDialogVisibleInvoicePreview(val, isBreak) {
      this.invoicePreviewOpne = val
      if (isBreak === true) {
        this.getData()
      }
    },
    bankAccountList(val = '', is) {
      let hasIntrabranch = ''
      let publicType = ''
      let payWay = ''
      if (this.recvData.payWay) {
        payWay = this.recvData.payWay
      }
      if (payWay === 'intrabranch') {
        hasIntrabranch = 'yes'
      }
      if (payWay === 'cash') {
        publicType = 'prv'
      }
      let currency = this.multipleSelection1[0].currency
      let unitCode = this.multipleSelection1[0].recvCorpCode
      this.$store
        .dispatch('dict/bankAccountList', {
          accountNo: val,
          currency,
          receipayType: 'receive',
          unitCode,
          countryOrgType: payWay,
          publicType,
          status: 'effect',
        })
        .then((res) => {
          let list = res ? res : []
          if (is) {
            let obj = list.find((item) => {
              return item.accountNo === this.multipleSelection1[0].payInfoVo.recvAccountNo
            })
            if (obj) {
              this.recvData.recvRegAddr = obj.regAddr
              this.recvData.recvBankAccountId = obj.settleUnitBankAcctId
            }
          }

          this.recvAccountNoList = list.map((item) => {
            item.value = item.settleUnitBankAcctId
            item.label = item.accountNo
            return item
          })
        })
    },
    recvAccountNoChange(val) {
      console.log(val)
      let obj = this.recvAccountNoList.find((item) => {
        // this.bankAccountSelectOptions2
        return item.settleUnitBankAcctId === val
      })
      if (obj) {
        this.recvData.recvBankName = obj.bankName
        this.recvData.recvAccountNo = obj.accountNo
        this.recvData.recvAccountName = obj.accountName
        this.recvData.recvBankBranch = obj.bankBranch
        this.recvData.compBankAccountId = obj.settleUnitBankAcctId
        this.recvData.recvBankAccountId = obj.settleUnitBankAcctId
        this.recvData.recvBankAddr = obj.bankAddr
        this.recvData.recvRegAddr = obj.regAddr
        this.recvData.recvSwiftCode = obj.swiftCode
        this.recvData.recvAccountPublicType = obj.publicType
      }
    },
    // 获取销售
    getSellers(name = '', item, role) {
      let query = [{ column: 'roleCode', type: 'eq', value: role }] // column: 'roleCode', type: 'in', value: 'bd,obd'
      name && query.push({ column: 'name', type: 'eq', value: name })
      listByRole({ currPage: 1, pageSize: 1000, query }).then(({ data: { list } }) => {
        if (
          this.remoteSelectCommon(
            item,
            list.map((v) => ({
              ...v,
              label: `${v.cname}(${v.employeeNo})`,
              value: v.employeeId,
            }))
          )
        )
          return
        item.remoteSelectList = list.map((v) => ({
          ...v,
          label: `${v.cname}(${v.employeeNo})`,
          value: v.employeeId,
        }))
      })
    },
    // 打印发票按钮
    printInvoice() {},
    //撤回出纳
    handleWithdrawApplyPayOrder() {
      let len = this.multipleSelection1
      if (len.length === 0) {
        return this.$msgErrClose('请勾选需要撤回推送的项！')
      }
      for (let i = 0; i < len.length; i++) {
        if (!(len[i].status === 'sent')) {
          return this.$msgErrClose('请选择状态是审核通过已推送，才能操作撤回推送！')
        }
      }
      let applyNoList = len.map((item) => item.applyNo)
      let data = {
        applyNoList,
      }
      this.$confirm('是否确认撤回推送？', '提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        cancelButtonClass: 'btn-custom-cancel',
        type: 'warning',
      }).then(() => {
        settleWithdrawApplyPayOrder(data).then((res) => {
          this.$message({ message: '撤回推送成功', type: 'success' })
          this.getData()
        })
      })
    },
    // 远程搜索港口下拉数据 port_of_basic  port_of_destination
    portSearch(queryString, item, port) {
      let data = {
        queryString,
        portAttribute: port,
      }
      this.$store.dispatch('dict/basePortList', data).then((data) => {
        item.remoteSelectList = data.map((item) => {
          return {
            label: item.value,
            value: item.portCode,
          }
        })
      })
    },
    countrySelectList(countryCode, item) {
      countrySelectList({ countryCode, state: 'valid' }).then((res) => {
        item.remoteSelectList = (res.data || []).map((item) => {
          return { ...item, label: item.cname, value: item.countryCode }
        })
      })
    },
    // 签收发票, 即原来的财务已收
    financeReceive(val) {
      console.log(val)
      let arr = this.multipleSelection1
      if (arr.length === 0) {
        return this.$message({
          message: '请勾选结算付款申请单进行' + val.label + '！',
          type: 'error',
          showClose: true,
        })
      }
      let list = arr.filter((item) => item.invoiceNo)
      if (!list.length) {
        return this.$message({
          message: '请勾选结算付款申请单"有发票"的进行' + val.label + '！',
          type: 'error',
          showClose: true,
        })
      }
      let data = {
        applyNoList: list.map((item) => item.applyNo),
        receiveStatus: val.value,
      }
      console.log(data)
      this.$confirm('是否确认' + val.label + '？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.receiveConfirm(data, val)
        })
        .catch(() => {})
    },
    receiveConfirm(data, val) {
      settleInvoiceReceive(data).then(() => {
        this.$message({
          message: val.label + '成功！',
          type: 'success',
          showClose: true,
        })
        this.getData()
      })
    },
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    InvoicePaymentDetail,
    settleDetail,
    BillDetail,
    RegisterInvoice,
    RelationInvoice,
    SplitPayApplySettle,
    InvoicePreview,
    CustomColumns,
    // InovicePreviewPrint,
    ApplyForPass,
  },
  activated() {
    // 首次进入直接返回，会由搜索组件触发搜索
    if (!this.isFirstActivated) {
      this.isFirstActivated = true
      return
    }
    let timestamp = new Date().getTime()
    if (
      !this.$route.meta.isUseCache ||
      (this.$route.meta.refresh && timestamp - this.cTimestamp > 300)
    ) {
      this.getData()
    }
  },
}
</script>
<style lang="scss" scoped>
.red-label {
  /deep/.el-form-item__label {
    color: #e63923;
  }
}
.select-template-box {
  float: left;
}
.select-template-box .el-dropdown {
  margin-left: 0;
  margin-bottom: 0;
  border-radius: 0;
  font-size: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}
.select-template-box:hover .el-dropdown {
  background: rgb(236, 245, 255);
  color: rgb(64, 158, 255);
}
.select-template-box .el-dropdown-link {
  cursor: pointer;
  padding-left: 5px;
  line-height: 18px;
  display: inline-block;
}
.select-template-box .el-icon--right {
  margin-left: 0;
}
.select-template-box .el-dropdown-link:focus {
  outline: none;
}

.batch-print-create .el-dialog__body {
  padding: 40px 80px 22px;
}
.batch-print-create .el-dialog__footer {
  padding-bottom: 32px;
  text-align: center;
}
.batch-print-create .el-form .el-input {
  width: 320px;
}
.manual-regist-invoice .el-form .el-date-editor.el-input {
  width: 162px;
}
.manual-regist-invoice .el-form .el-select {
  width: 162px;
}
.finance-search-list-gap {
  height: 8px;
  background: #f8f9fd;
}

.pass_dialog_form ::v-deep {
  .el-form-item {
    width: 50%;
    margin-right: 0;
  }
  .el-form-item__content {
    width: calc(100% - 90px);
  }
  .form_full {
    width: 100%;
  }
}
</style>
<style>
.el-form-item-payapply-remark {
  width: 100%;
  padding: 0 30px;
}
.el-form-item-payapply-remark .el-form-item__content {
  width: calc(100% - 70px);
}
.app-wrapper .finance-page .el-form-item-payapply-remark textarea {
  min-height: 75px !important;
}
.result__container_p {
  margin-top: 12px;
}
.btn-custom-cancel {
  float: right;
  margin-left: 10px;
}
.el-input__prefix{
  line-height: 20px;
}
</style>
