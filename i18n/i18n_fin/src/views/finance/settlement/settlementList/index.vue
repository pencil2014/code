<template>
  <div
    class="finance-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div v-show="!showSettlementDetail">
      <FinanceSearch :searchOption="searchOption" @search="search" />
      <div class="finance-search-list-gap"></div>
      <div class="finance-list-container">
        <div class="money-box">
          <div class="money-box-left">
            <!-- <el-button-group>
              <el-button
                v-if="checkAuth($route.name, 'btn-applyInvoice')"
                class="finance-btn"
                @click="invoiceApply"
                size="mini"
                type="primary"
              >{{$t('Settle.invoiceApply')}}</el-button>
            </el-button-group> -->
            <!-- <el-button-group>
              <el-button
                class="finance-btn"
                @click="handleRelationInvoice"
                size="mini"
                type="primary"
              >关联应付发票</el-button>
            </el-button-group>-->
            <el-button-group>
              <el-button
                v-if="checkAuth($route.name, 'btn-applyPay')"
                class="finance-btn"
                @click="payApply"
                size="mini"
                type="primary"
              >{{$t('Settle.payApply')}}</el-button>
            </el-button-group>
            <el-button-group v-if="checkAuth($route.name, 'btn-regWriteoff')">
              <el-button class="finance-btn" @click="regWriteoff" size="mini">{{$t('FeeList.regWriteoff')}}</el-button>
            </el-button-group>
            <el-button-group v-if="checkAuth($route.name, 'btn-regWriteoff')">
              <el-button class="finance-btn" @click="relationRegDialog" size="mini">{{$t('FeeList.relationReg')}}</el-button>
            </el-button-group>
            <el-button-group v-if="checkAuth($route.name, 'btn-exportBill')">
              <el-button class="finance-btn" @click="handleCommand" size="mini">{{$t('FeeList.exportStatement')}}</el-button>
            </el-button-group>
            <!-- <el-button-group>
              <div
                v-if="checkAuth($route.name, 'btn-exportBill')"
                class="finance-btn select-template-box"
              >
                <el-dropdown trigger="click" @command="handleCommand">
                  <span class="el-dropdown-link">导出对账单</span>
                  <i class="el-icon-arrow-down el-icon--right"></i>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      v-for="(item, index) in exportTypeList"
                      :key="'exportTypeList' + index"
                      :command="item.value"
                    >{{item.label}}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </el-button-group>-->
          </div>
          <div class="money-box-right">
            <el-button-group>
              <el-button
                v-if="checkAuth($route.name, 'btn-merge')"
                class="finance-btn"
                @click="mergeSettlement"
                size="mini"
              >{{$t('Settle.mergeSettlement')}}</el-button>
            </el-button-group>
            <el-button-group>
              <el-button
                v-if="checkAuth($route.name, 'btn-confirmSettle')"
                class="finance-btn"
                @click="confirmSettlement"
                size="mini"
                type="success"
              >{{$t('Settle.confirmSettlement')}}</el-button>
              <el-button
                v-if="checkAuth($route.name, 'btn-cancelConfirm')"
                class="finance-btn"
                @click="settlementCancelConfirm"
                size="mini"
                type="purple"
              >{{$t('Settle.cancelSettlement')}}</el-button>
            </el-button-group>
            <el-button-group>
              <el-button
                v-if="checkAuth($route.name, 'btn-releaseSettleOrder')"
                class="finance-btn"
                @click="releaseSettleOrder"
                size="mini"
              >{{$t('Settle.releaseSettleOrder')}}</el-button>
              <!-- type="warning" -->
            </el-button-group>
            <el-button-group>
              <el-button
                v-if="checkAuth($route.name, 'btn-hedging')"
                class="finance-btn"
                @click="createGedging"
                size="mini"
                type="primary"
              >{{$t('Settle.createGedging')}}</el-button>
            </el-button-group>
            <el-button-group>
              <el-button
                v-if="checkAuth($route.name, 'btn-delSettle')"
                class="finance-btn"
                @click="closeSettlement"
                size="mini"
                type="danger"
              >{{$t('Settle.closeSettlement')}}</el-button>
            </el-button-group>
            <el-button-group>
              <el-button
                v-if="checkAuth($route.name, 'btn-feeAgent')"
                class="finance-btn"
                size="mini"
                @click="openAgentReceipayDialog"
              >{{$t('FeeList.expenses')}}</el-button>
              <!-- type="primary" -->
              <el-button
                v-if="checkAuth($route.name, 'btn-feeAgentCancel')"
                class="finance-btn"
                size="mini"
                @click="cancelAgentCompany"
              >{{$t('FeeList.cancelExpense')}}</el-button>
              <!-- type="purple" -->
            </el-button-group>
            <el-button-group>
              <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('FeeList.refresh')}}</el-button>
            </el-button-group>
          </div>
        </div>
        <FinanceTableMass :option="option1" @send-multi="sendMulti" />
      </div>
    </div>
    <el-dialog
      :title="$t('FeeList.expenses')"
      :visible.sync="agentReceipayDialogVisible"
      :close-on-click-modal="false"
      class="finance-agent-receipay"
      width="604px"
    >
      <div style="margin:20px auto 0;width:400px;">
        <el-form ref="agentForm" :model="agentForm" label-width="120px" size="mini" label-suffix=":">
          <el-form-item
            :label="$t('FeeList.selectBranc')"
            prop="agentCompCode"
            :rules="{required: true, message: $t('FeeList.branchEmpty'), trigger: 'blur'}"
          >
            <el-select
              v-model="agentForm.agentCompCode"
              :placeholder="$t('Common.plSelect')"
              filterable
              remote
              clearable
              :remote-method="(queryString) => {remoteSelect1.remoteMethod && remoteSelect1.remoteMethod(queryString, remoteSelect1)}"
              @visible-change="(value) => {if(value){remoteSelect1.visibleChange && remoteSelect1.visibleChange('', remoteSelect1)}}"
              @change="(value) => {remoteSelect1.change && remoteSelect1.change(value, remoteSelect1)}"
            >
              <el-option
                v-for="(optionItem, j) in remoteSelect1.remoteSelectList || []"
                :key="'remoteSelect1' + j"
                :label="optionItem.label"
                :value="optionItem.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="agentReceipayDialogVisible = false" size="mini">{{$t('FeeList.cancel')}}</el-button>
        <el-button type="primary" @click="setAgentCompany" size="mini">{{$t('FeeList.submit')}}</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="$t('FeeList.exportStatement')" :visible.sync="billDialog" width="500px">
      <div style="margin:10px auto -10px;" class="export__dialog">
        <!-- billExportType: '',
        billFeeType: '',-->
        <el-form
          ref="billDialogForm"
          :model="billDialogForm"
          label-width="100px"
          size="mini"
          :rules="billDialogRules"
          label-suffix=':'
        >
          <el-form-item :label="$t('FeeList.amountType')" prop="billFeeType">
            <el-select
              v-model="billDialogForm.billFeeType"
              :placeholder="$t('Common.plSelect')"
              :disabled="billDialogForm.billType === 'bill'"
            >
              <el-option
                v-for="item in dictMap['billFeeType']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('FeeList.language')" prop="lang">
            <el-select v-model="billDialogForm.lang" :placeholder="$t('Common.plSelect')">
              <!-- 海外版不显示 <el-option :label="$t('FeeList.chinese')" value="CN"></el-option> -->
              <el-option :label="$t('FeeList.english')" value="US"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('FeeList.templateType')" prop="billType">
            <el-select v-model="billDialogForm.billType" :placeholder="$t('Common.plSelect')" @change="billTypeChange">
              <el-option
                v-for="item in dictMap['settleOrderBillExportType']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="exportBill" size="mini">{{$t('FeeList.sure')}}</el-button>
        <el-button @click="billDialog = false" size="mini">{{$t('FeeList.cancel')}}</el-button>
      </span>
    </el-dialog>
    <ResultDialog :option="resultDialogOption" @close="resultDialogOption.show = false">
      <div class="result-dialog-descript" slot="descript">
        <span v-for="item in settleOrderBillIds.split(',')" :key="item">{{item}}</span>
      </div>
    </ResultDialog>
    <ResultDialog :option="resultDialogOption2" @close="resultDialogOption2.show = false">
      <div class="result-dialog-descript" slot="descript">
        <span v-for="item in settleOrder_gedgingApplyNoList" :key="item">{{item}}</span>
      </div>
    </ResultDialog>
    <keep-alive v-if="relationRegDialogVisible.show">
      <RelationReg
        :isJumpRouteFromPage.sync="isJumpRouteFromPage"
        :settleOrderIds="multipleSelection1.map(v=>v.settleOrderId)"
        :dialog-visible="relationRegDialogVisible"
        :settleRegList="settleRegList"
      />
      <!-- :settleOrderIds="multipleSelection1.map(v=>v.settleOrderId)" -->
    </keep-alive>
    <RelationInvoice
      :relationInvoiceForm="relationInvoiceForm"
      :relevanceOpne="relevanceOpne"
      @close-dialog-visible-relationInvoice="closeDialogVisibleRelationInvoice"
    />
    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{key:'prop',label:'label'}"
        @close="customColumnsPopClose"
      />
    </div>
  </div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import SettlementDetail from '../components/settlementDetail'
import RelationReg from '../components/components/relationReg'
import InvoiceReceivableApply from '../../invoiceReceivable/components/invoiceReceivableApply'
import SettlementPayApply from './components/settlementPayApply'
import CreateGedging from '@/views/finance/gedging/components/gedgingDetail'
import CustomColumns from '@/components/customColumns'
import RelationInvoice from '@/views/finance/pay/settle/components/relationInvoice'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import {
  listPage,
  close,
  confirm,
  merge,
  settleOrderAgentConfirm,
  settleOrderAgentCancel,
  getListAmtSummary,
  cancelConfirm,
  toQuickRecvWriteoff,
  releaseSettleOrder,
  settleOrderInvoiceFeeList,
  settleOrderAgentConfirmValidate,
  listReceivableRegForWriteoff,
} from '@/api/fin/settleOrder'
import { generateBill } from '@/api/fin/settleOrderBill'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { validPayApplySettle } from '@/api/fin/pay'

export default {
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      keyDownActive: true,
      pageSizeUrl: listPage('geturl'),
      billDialog: false,
      billDialogForm: { lang: 'US', billFeeType: '', billType: '' },
      billDialogRules: {
        lang: { required: true, message: ' ', triggers: 'change' },
        billFeeType: { required: true, message: ' ', triggers: 'change' },
        billType: { required: true, message: ' ', triggers: 'change' },
      },
      option1: {},
      option2: {},
      searchOption: {},
      table1DataBackup: [],
      table2DataBackup: [],
      isAddPay: false,
      multipleSelection1: [],
      multipleSelection2: [],
      agentForm: {
        agentCompCode: '',
        agentCompName: '',
      },
      remoteSelect1: {},
      orderNo: '',
      orderBillId: '',
      feeAdjustApplyId: 0,
      showSettlementDetail: false,
      autocomplete: {},
      selectedOptionItem: '',
      dialogVisible: false,
      batchPrintCreateData: [],
      invoiceReceivableIndex: 0,
      dialogVisibleManualRegist: false,
      currentComponent: '',
      relationRegDialogVisible: { show: false },
      settleOrderId: -1,
      settleOrderNo: '',
      settleCorpCode: '',
      settleCorpName: '',
      settleCompCode: '',
      settleCompName: '',
      source: '',
      settleOrderIds: [],
      row: '',
      isJumpRouteFromPage: false,
      agentReceipayDialogVisible: false,
      // searchModifyEffect: true,
      // searchOption2: {},
      currencySelectOptions: [],
      loading: false,
      exportTypeList: [
        { label: this.$t('Settle.cnSum'), value: 'CN_sum' },
        { label: this.$t('Settle.enSum'), value: 'US_sum' },
      ],
      // 自定义表头弹框
      customColumnsPopShow: false,
      // 右侧搜索条件
      buttonSearch: '',
      selfColumnsBase: [
        {
          prop: 'settleOrderNo',
          label: this.$t('FeeList.settleOrderNo'),
          type: 'button',
          // type: this.justSelect ? 'text' : 'button',  // 供应商选择结算单，不需激活此按钮
          width: 138,
          operationBtns: {
            show: true,
            callback: (action, index, row, option) => {
              this.showDetail(row)
            },
          },
        },
        {
          prop: 'sourceOrderBillNo',
          label: this.$t('Settle.sourceOrderBillNo'),
          type: 'text',
          width: 138,
        },
        {
          prop: 'sourceBizNos',
          label: this.$t('FeeList.sourceBizNo'),
          type: 'columnTip',
          // type: this.justSelect ? 'text' : 'columnTip',  // 供应商选择结算单，不需激活此按钮
          width: 130,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps) => {
              this.showColumnDetail({
                type: 'sourceBizNo',
                no,
                componentProps,
              })
            },
            // formatter: (row) => {
            //   return `<span>${row.sourceBizNos}</span><br/>` + '<span>SO号：3993&nbsp;&nbsp;柜型：20GP</span><br/><span>SO号：3993&nbsp;&nbsp;柜型：20GP</span><br/><span>SO号：3993&nbsp;&nbsp;柜型：20GP</span><br/><span>SO号：3993&nbsp;&nbsp;柜型：20GP</span><br/><span>SO号：3993&nbsp;&nbsp;柜型：20GP</span>'
            // },
            // width: 300
          },
          sortable: false,
        },
        {
          prop: 'settleCompName',
          label: this.$t('FeeList.settleComp'),
          type: 'text',
          width: 160,
          isTooltip: true,
        },
        {
          prop: 'settleCorpName',
          label: this.$t('FeeList.settleCorp'),
          type: 'text',
          width: 160,
          isTooltip: true,
        },
        {
          prop: 'receivePayType',
          label: this.$t('FeeList.receipayType'),
          type: 'select',
          width: 80,
          propInDict: 'receipayType',
        },
        {
          prop: 'settleCurrency',
          label: this.$t('Settle.settleCurrency'),
          type: 'text',
          width: 80,
          sortable: false,
        },
        {
          prop: 'sumAmount',
          label: this.$t('Settle.sumAmount'),
          type: 'tooltip',
          width: 140,
          sortable: false,
        },
        {
          prop: 'confirmStatus',
          label: this.$t('Settle.confirmStatus'),
          type: 'text',
          width: 120,
          formatter: ({ cellValue }) => {
            if (cellValue === 'yes') {
              return this.$t('Common.confirmed')
            } else if (cellValue === 'no') {
              return this.$t('Common.unconfirmed')
            } else {
              return cellValue
            }
            // return '<span style="color:red;">hello</span> <span style="color:blue;">world.</span>'
          },
        },
        {
          prop: 'settleOrderStatus',
          label: this.$t('Settle.settleOrderStatus'),
          type: 'select',
          propInDict: 'finSettleOrderStatus',
          width: 120,
        },
        // {
        //   prop: 'invoiceStatus',
        //   label: this.$t('Settle.invoiceStatus'),
        //   width: 80,
        //   type: 'select',
        //   propInDict: 'feeInvoiceStatus',
        // },
        // {
        //   prop: 'receiveInvoiceApplyStatus',
        //   label: this.$t('Settle.receInvoStatus'),
        //   width: 108,
        //   type: 'select',
        // },
        {
          prop: 'writeoffStatus',
          label: this.$t('FeeList.writeoffStatuss'),
          width: 80,
          type: 'select',
        },
        {
          prop: 'finLockReason',
          label: this.$t('FeeList.lockReason'),
          type: 'tooltip',
          width: 130,
          sortable: false,
        },
        {
          prop: 'mbl',
          label: this.$t('FeeList.mbl'),
          type: 'text',
          width: 100,
          sortable: false,
        },
        {
          prop: 'hbl',
          label: this.$t('FeeList.hbl'),
          type: 'text',
          width: 100,
          sortable: false,
        },
        { prop: 'agentCompName', label: this.$t('Settle.agentCompName'), type: 'text', key: 'agentCompName', width: 150, isTooltip: true },
        {
          prop: 'reciWriteOffAmtDesc',
          label: this.$t('Settle.reciWriteOffAmtDesc'),
          type: 'text',
          width: 140,
          sortable: false,
        },
        {
          prop: 'reciNoWriteOffAmtDesc',
          label: this.$t('Settle.reciNoWriteOffAmtDesc'),
          type: 'text',
          width: 140,
          sortable: false,
        },
        {
          prop: 'payWriteOffAmtDesc',
          label: this.$t('Settle.payWriteOffAmtDesc'),
          type: 'text',
          width: 140,
          sortable: false,
        },
        {
          prop: 'payNoWriteOffAmtDesc',
          label: this.$t('Settle.payNoWriteOffAmtDesc'),
          type: 'text',
          width: 140,
          sortable: false,
        },
        {
          prop: 'orderType',
          label: this.$t('Settle.orderType'),
          width: 100,
          type: 'select',
          propInDict: 'settleOrderType',
        },
        {
          prop: 'sourceType',
          label: this.$t('Settle.sourceType'),
          width: 100,
          type: 'select',
          propInDict: 'settleOrderSourceType',
          sortable: false,
        },
        {
          prop: 'latestPayDate',
          label: this.$t('Settle.latestPayDate'),
          type: 'text',
          width: 120,
          sortable: false,
        },
        {
          prop: 'payApplyNo',
          label: this.$t('Settle.payApplyNo'),
          type: 'columnTip',
          width: 130,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps) => {
              this.showColumnDetail({
                type: 'paySettleApplyNo',
                no,
                componentProps,
              })
            },
          },
          sortable: false,
        },
        {
          prop: 'payOrderNos',
          label: this.$t('FeeList.payOrderNo'),
          type: 'columnTip',
          width: 130,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps) => {
              this.showColumnDetail({
                type: 'pay_order',
                no,
                componentProps,
              })
            },
          },
          sortable: false,
        },
        {
          prop: 'writeoffNos',
          label: this.$t('FeeList.writeoffNo'),
          type: 'columnTip',
          width: 130,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps) => {
              this.showColumnDetail({
                type: 'writeoffNos',
                no,
                componentProps,
              })
            },
          },
          sortable: false,
        },
        { prop: 'groupStatus', label: this.$t('Settle.groupStatus'), type: 'select', propInDict: 'yesNo', sortable: false },
        { prop: 'agentStatus', label: this.$t('Settle.agentStatus'), type: 'select', propInDict: 'yesNo', sortable: false },
        {
          prop: 'badStatus',
          label: this.$t('Settle.badStatus'),
          type: 'select',
          specialType: 'btnTooltip',
          propInDict: 'yesNo',
          sortable: false,
          callback: { content: (row) => row.badAmt, active: (row) => row.badStatus === 'yes' },
        },
        // {
        //   prop: 'receiveInvoiceStatus',
        //   label: this.$t('Settle.receiveInvoiceStatus'),
        //   width: 100,
        //   type: 'select',
        //   propInDict: 'feeInvoiceStatus',
        //   sortable: false,
        // },
        // {
        //   prop: 'receiveInvoiceTime',
        //   label: this.$t('Settle.receiveInvoiceTime'),
        //   width: 130,
        //   type: 'text',
        //   sortable: false,
        // },
        // {
        //   prop: 'payInvoiceStatus',
        //   label: this.$t('Settle.payInvoiceStatus'),
        //   width: 100,
        //   type: 'select',
        //   propInDict: 'feeInvoiceStatus',
        //   sortable: false,
        // },
        // {
        //   prop: 'payInvoiceTime',
        //   label: this.$t('Settle.payInvoiceTime'),
        //   width: 130,
        //   type: 'text',
        //   sortable: false,
        // },
        {
          prop: 'createdName',
          label: this.$t('FeeList.createdBy'),
          type: 'text',
          width: 100,
        },
        {
          prop: 'createdTime',
          label: this.$t('Settle.creatTime'),
          type: 'text',
          width: 130,
        },
      ],
      //关联发票
      relevanceOpne: false,
      relationInvoiceForm: {
        payInfoId: '',
        settleOrderNo: '',
        currency: '',
        recvCorpName: '',
        recvCorpCode: '',
        settleCompCode: '',
        settleCompName: '',
        supplierAccountNo: '',
      },
      resultDialogOption: {
        show: false,
        title: this.$t('Settle.exportSuc'),
        resultType: 'success',
        text_cancel: this.$t('FeeList.close'),
        titleText: this.$t('Settle.exportStatementSuc'),
      },
      resultDialogOption2: {
        show: false,
        title: this.$t('Settle.hedgSuc'),
        resultType: 'success',
        text_cancel: this.$t('FeeList.close'),
        titleText: this.$t('Settle.hedgApplySuc'),
      },
      settleOrder_gedgingApplyNoList: [],
      settleOrderBillIds: '',
      settleRegList: [],
    }
  },
  created() {
    this.currencySelectOptions = [...this.$store.state.dict.dictMap.currency]
    this.currencySelectOptions.unshift({ label: this.$t('Settle.orignalCurrency'), value: 'original' })
    let searchInputGroup = ['allNo', 'receivePayType', 'settleOrderStatuss', 'confirmStatus', 'settleCorpCodes', 'createdDate']
    this.searchOption = {
      saveShow: true,
      contentShow: true,
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      fixCreatedDate: true,
      fixCreatedKey: 'createdDate',
      addFilter: {
        defaultSearchLength: 6,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          allNo: { label: this.$t('FeeList.allNo'), type: 'input', placeholder:  this.$t('Settle.multipleTips')},
          settleOrderNo: { label: this.$t('FeeList.settleOrderNo'), type: 'input', showType: '1' },
          sourceOrderBillNo: { label: this.$t('Settle.sourceOrderBillNo'), type: 'input', showType: '1' },
          payApplyNo: { label: this.$t('FeeList.payApplySettleNo'), type: 'input', showType: '1' },
          payOrderNo: { label: this.$t('FeeList.payOrderNo'), type: 'input', showType: '1' },
          mbl: { label: this.$t('FeeList.mbl'), type: 'input', showType: '1' },
          hbl: { label: this.$t('FeeList.hbl'), type: 'input', showType: '1' },
          writeoffNo: { label: this.$t('FeeList.writeoffNo'), type: 'input', showType: '1' },
          sourceBizNo: { label: this.$t('FeeList.orderNo'), type: 'input', showType: '1' },
          receivePayType: { label: this.$t('FeeList.receipayType'), type: 'select', prop: 'receipayType', showType: '2' },
          orderType: { label: this.$t('Settle.orderType'), type: 'select', prop: 'settleOrderType', showType: '2' },
          sourceType: { label: this.$t('Settle.sourceType'), type: 'select', prop: 'settleOrderSourceType', showType: '2' },
          settleOrderStatuss: {
            label: this.$t('Settle.settleOrderStatus'),
            type: 'select',
            // multiple: true,
            prop: 'finSettleOrderStatus',
          },
          // invoiceStatuss: { label: this.$t('Settle.invoiceStatus'), type: 'select', multiple: true, prop: 'feeInvoiceStatus', showType: '3' },
          // receiveInvoiceApplyStatus: { label: this.$t('Settle.receInvoStatus'), type: 'select', prop: 'receiveInvoiceApplyStatus' },
          writeoffStatuss: { label: this.$t('FeeList.writeoffStatuss'), type: 'select', multiple: true, prop: 'writeoffStatus', showType: '3' },
          confirmStatus: {
            label: this.$t('Settle.confirmStatus'),
            type: 'select',
            prop: 'confirmStatus',
            selectOptions: [
              { label: this.$t('Common.confirmed'), value: 'yes' },
              { label: this.$t('Common.unconfirmed'), value: 'no' },
            ],
          },
          settleCurrency: {
            label: this.$t('Settle.settleCurrency'),
            type: 'select',
            prop: 'currency',
            selectOptions: this.currencySelectOptions,
          },
          settleCorpCodes: {
            label: this.$t('FeeList.settleCorp'),
            prop: 'settleCorpCode',
            type: 'remoteSelect',
            multiple: true,
            clearable: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: '' }, item)
            },
            // 结算单位有很多，不显示默认下拉列表---特殊设想---先取消
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: '' }, item)
            },
            remoteSelectList: [],
          },
          settleCompCodes: {
            label: this.$t('FeeList.settleComp'),
            prop: 'settleCompCode',
            type: 'remoteSelect',
            multiple: true,
            clearable: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            remoteSelectList: [],
          },
          agentCompCodes: {
            label: this.$t('FeeList.agentCompCodes'),
            prop: 'agentCompCode',
            type: 'remoteSelect',
            multiple: true,
            clearable: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            remoteSelectList: [],
          },
          // receiveInvoiceStatus: { label: this.$t('Settle.receiveInvoiceStatus'), type: 'select', multiple: true, prop: 'feeInvoiceStatus' },
          // payInvoiceStatus: { label: this.$t('Settle.payInvoiceStatus'), type: 'select', multiple: true, prop: 'feeInvoiceStatus' },
          groupStatus: { label: this.$t('Settle.groupStatus'), type: 'select', prop: 'yesNo' },
          agentStatus: { label: this.$t('Settle.agentStatus'), type: 'select', prop: 'yesNo' },
          badStatus: { label: this.$t('Settle.badStatus'), type: 'select', prop: 'yesNo' },
          createdDate: { label: this.$t('FeeList.createdDate'), type: 'daterange', format: 'yyyy-MM-dd', ranges: ['beginDate', 'endDate'] },
          createdBy: {
            label: this.$t('FeeList.createdBy'),
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
        },
      },
    }
    // if (!this.justSelect) {
    //   this.searchOption = this.searchOption2
    // }
    // 如果是从供应商对账进来，则取消分公司和结算单位的搜索项
    // this.justSelect && this.searchOption.columns.splice(1,2)
    // this.justSelect && this.searchOption.columns.splice(-1,1)
    let _this = this
    this.autocomplete = {
      querySearch: (queryString, cb) => {
        _this.selectedOptionItem = ''
        _this.querySettleUnit(queryString, cb)
      },
      select: (optionItem, row) => {
        _this.selectedOptionItem = optionItem
        console.log('this.selectedOptionItem:', _this.selectedOptionItem)
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
    this.remoteSelect1 = {
      remoteMethod: (queryString, item) => {
        this.querySettleUnit2({ queryString, unitTypes: 'company', isAdd: true }, item)
      },
      visibleChange: (queryString, item) => {
        this.querySettleUnit2({ queryString, unitTypes: 'company', isAdd: true }, item)
      },
      change: (value, item) => {},
      remoteSelectList: [],
    }

    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: this.$t('Common.details'),
          type: 'text',
          show: true,
          action: 'showDetail',
        },
      ],
      show: false,
      // show: this.justSelect ? false : true // 如果是从供应商对账单里面添加结算单过来，不显示btns
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true,
      isNew: true,
      lessPageSize: true,
    })
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true, isPlaceBottom: true, isPartTop: true })
    // let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
    this.option1 = Object.assign({}, this.option, {
      customColumns: {
        show: true,
        handleCustomColumns: () => {
          if (!this.isNotFirtGetData) {
            this.getData(false, true).then((res) => setTimeout(() => (this.customColumnsPopShow = true), 600))
          } else {
            this.customColumnsPopShow = true
          }
        },
      },
      id: 'option1',
      $name: 'SettlementList',
      data: [],
      tips: { text: '', show: false },
      operationBtns,
      pagination,
      listAmtSummary,
      colorColumns: ['writeoffStatus', 'receipayType', 'feeInvoiceStatus', 'receiveInvoiceApplyStatus'],
      emptyText: this.$t('FeeList.emptyText'),
      sortable: true,
      sortChange: this.sortChange,
    })
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))

    this.option1.columns = [...this.selfColumnsBase]
  },
  methods: {
    relationRegDialog() {
      let rows = this.multipleSelection1
      if (rows.length === 0) {
        return this.$msgErrClose(this.$t('Settle.collectionTips'))
      }
      this.lsLoading = true
      listReceivableRegForWriteoff({
        settleOrderIds: this.multipleSelection1.map((v) => v.settleOrderId),
      })
        .then((res) => {
          this.settleRegList = res.data
          this.relationRegDialogVisible.show = true
        })
        .finally(() => (this.lsLoading = false))
    },
    getData(isSearch, customerList) {
      this.isNotFirtGetData = true
      this.loading = true
      let { prop, order } = this.sortParams
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: customerList ? 0 : this.option1.pagination.pageSize,
        query: [],
        ascColumns: order === 'ascending' ? [prop] : [],
        descColumns: order === 'descending' ? [prop] : order === 'ascending' ? [] : ['createdTime'],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption, true)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      return listPage(data)
        .then((res) => {
          this.loading = false
          this.finCommonColumns(res)
          // if (res.data.configColumns && res.data.configColumns.length) {
          //   let columns = res.data.configColumns
          //   this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop)).filter((v) => v)
          //   this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
          //   this.configColumns = res.data.configColumns
          // }
          if (customerList) return
          if (res.code === 0) {
            let { list } = res.data
            let data = []
            list.forEach((item) => {
              item.writeoffNos_multiValue = item.writeoffNos ? item.writeoffNos.split(',') : []
              item.payApplyNo_multiValue = item.payApplyNo.split(',')
              item.payOrderNos_multiValue = item.payOrderNos.split(',')
              item.sourceBizNos_multiValue = item.sourceBizNos.split(',')
              data.push(item)
            })
            this.option1.data = data
            this.table1DataBackup = [...this.option1.data]
            this.$set(this.option1, 'emptyText', this.$t('FeeList.noData'))
            Object.assign(this.option1.pagination, res.data)
            // this.option1.pagination.currPage = res.data.currPage
            // this.option1.pagination.pageSize = res.data.pageSize
            // this.option1.pagination.totalCount = res.data.totalCount
          }
        })
        .catch((err) => {
          console.log(err)
          this.loading = false
        })
      // this.debounceLs(() => {
      //   this.getListAmtSummary(data)
      // })
    },
    getListAmtSummary(data) {
      getListAmtSummary(data).then((res) => {
        if (res.code === 0 && res.data) {
          let data = {
            recSettleAmtList: [],
            paySettleAmtList: [],
            recNoWriteoffAmtList: [],
            payNoWriteoffList: [],

            orignalRecAmtList: [],
            orignalPayAmtList: [],
          }
          data = Object.assign(data, res.data)
          let { recSettleAmtList, paySettleAmtList, recNoWriteoffAmtList, payNoWriteoffList } = res.data
          let data2 = { recSettleAmtList, paySettleAmtList, recNoWriteoffAmtList, payNoWriteoffList }
          let subData1 = { recSettleAmtList, paySettleAmtList }
          let subData2 = { recNoWriteoffAmtList, payNoWriteoffList }
          let groups = [
            {
              label: this.$t('FeeList.receivable'),
              data: { orignalRecAmtList: data.orignalRecAmtList },
            },
            {
              label: this.$t('FeeList.payable'),
              data: { orignalPayAmtList: data.orignalPayAmtList },
            },
          ]
          let labelObj = {
            // recSettleAmtListLabel: '应收结算金额',
            // paySettleAmtListLabel: '应付结算金额',
            recSettleAmtListLabel: this.$t('Settle.recSettleAmt'),
            paySettleAmtListLabel: this.$t('Settle.paySettleAmt'),
            recNoWriteoffAmtListLabel: this.$t('Settle.recNoWriteoffAmt'),
            payNoWriteoffListLabel: this.$t('Settle.payNoWriteoff'),

            orignalRecAmtListLabel: this.$t('Settle.orignalRecAmt'),
            orignalPayAmtListLabel: this.$t('Settle.orignalPayAmt'),
          }
          let colorObj = {
            recSettleAmtListColor: 'red',
            paySettleAmtListColor: 'green',
            recNoWriteoffAmtListColor: 'red',
            payNoWriteoffListColor: 'green',
            orignalRecAmtListColor: 'red',
            orignalPayAmtListColor: 'green',
          }
          this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
            show: true,
            data: data2,
            subData1,
            subData2,
            groups,
            labelObj,
            colorObj,
          })
        }
      })
    },
    sortChange(column, prop, order) {
      this.sortParams = { prop, order }
      this.isSort = true
      this.getData()
    },
    // TODO 收款登记
    regWriteoff() {
      let rows = this.multipleSelection1
      if (rows.length === 0) {
        return this.$msgErrClose(this.$t('Settle.settlementTips'))
      }
      this.loading = true
      toQuickRecvWriteoff({ settleOrderIds: rows.map((v) => v.settleOrderId) })
        .then((res) => {
          localStorage.setItem('_feeToRegParams', JSON.stringify(res))
          this.routerPush('RegWriteoffDetail', { source: 'settleOrder', orderType: rows[0].orderType })
        })
        .finally(() => (this.loading = false))
    },
    closeSettlement() {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose(this.$t('Settle.deleteTips'))
      }
      this.$confirmWarn(this.$t('Settle.confirmWarn'), () => {
        close({ settleOrderIds: this.multipleSelection1.map((item) => item.settleOrderId) }).then((res) => {
          this.$msgSucClose(this.$t('Settle.deleteSuc'))
          this.getData()
        })
      })
    },
    // 确认结算单
    confirmSettlement() {
      if (this.multipleSelection1.length === 0) {
        this.$msgErrClose(this.$t('Settle.setConfirmed'))
        return
      }
      let filterArr = this.multipleSelection1.filter((item) => item.confirmStatus == 'no')
      if (filterArr.length === 0) {
        this.$msgErrClose(this.$t('Settle.unconfirmed'))
        return
      }
      let data = {
        settleOrderIds: this.multipleSelection1.map((item) => {
          return item.settleOrderId
        }),
      }
      confirm({ settleOrderIds: filterArr.map((item) => item.settleOrderId) }).then((res) => {
        if (res.code === 0) {
          this.$msgSucClose(this.$t('Settle.confirmSuc'))
          this.getData()
        }
      })
    },
    // 撤销确认结算单
    settlementCancelConfirm() {
      if (this.multipleSelection1.length === 0) {
        this.$msgErrClose(this.$t('Settle.cancelled'))
        return
      }
      let filterArr = this.multipleSelection1.filter((item) => item.confirmStatus == 'yes')
      if (filterArr.length === 0) {
        this.$msgErrClose(this.$t('Settle.checkTips'))
        return
      }
      this.$confirmWarn(this.$t('Settle.revokeTips'), () => {
        cancelConfirm({ settleOrderIds: filterArr.map((item) => item.settleOrderId) }).then((res) => {
          this.$msgSucClose(this.$t('Settle.revokeSuc'))
          this.getData()
        })
      })
    },
    // 释放未销费用    部分核销，未关闭，未锁定的 需要支持释放结算单
    releaseSettleOrder() {
      if (this.multipleSelection1.length !== 1) {
        return this.$msgErrClose(this.$t('Settle.releaseTips'))
      }
      let row = this.multipleSelection1[0]
      if (row.writeoffStatus === 'part_finish' && row.finLockStatus === 'unlock') {
        this.$confirmWarn(this.$t('Settle.releaseConfirm'), () => {
          releaseSettleOrder({ settleOrderId: row.settleOrderId }).then((res) => {
            this.$msgSucClose(this.$t('Settle.releaseSuc'))
            this.getData()
          })
        })
      } else {
        return this.$msgErrClose(this.$t('Settle.unlockedTips'))
      }
    },
    exportBill() {
      this.$refs.billDialogForm.validate((valid) => {
        if (!valid) return
        this.billDialog = false
        let billDetailParams = {
          settleOrderNo: this.multipleSelection1.map((val) => val.settleOrderNo).join(','),
          soureType: 'settleOrder',
        }
        if (this.billDialogForm.billType == 'bill') {
          return generateBill({ ...this.billDialogForm, ...billDetailParams }).then((res) => {
            if (res.data.length) {
              if (res.data.length === 1) {
                this.routerPush('BillDetail', { billId: res.data[0].orderBillId })
              } else {
                this.settleOrderBillIds = res.data.map((item) => item.orderBillNo).toString()
                this.resultDialogOption.show = true
              }
            }
          })
        }
        this.routerPush('SettlementBillDetail', {
          billDetailParams: JSON.stringify({ ...this.billDialogForm, ...billDetailParams }),
        })
      })
    },
    handleCommand(command) {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose(this.$t('Settle.exportTips'))
      }
      let arr = [...new Set(this.multipleSelection1.map((v) => v.settleCorpCode))]
      if (arr.length > 1) {
        return this.$msgErrClose(this.$t('Settle.sameSettlement'))
      }
      this.billDialog = true
      this.$nextTick(() => {
        this.$refs.billDialogForm.resetFields()
      })
    },
    mergeSettlement() {
      if (this.multipleSelection1.length < 2) {
        return this.$msgErrClose(this.$t('Settle.mergeTips'))
      }
      merge({ settleOrderIds: this.multipleSelection1.map((item) => item.settleOrderId) }).then((res) => {
        if (res.code === 0) {
          this.$message({
            message: this.$t('Settle.mergeSuc'),
            type: 'success',
            showClose: true,
          })
          this.getData()
        }
      })
    },
    createGedging() {
      if (!this.multipleSelection1.length) {
        return this.$msgErrClose(this.$t('Settle.offsetTips'))
      }
      this.routerPush('CreateGedging', {
        source: 'createGedging',
        settleOrderIds: JSON.stringify(this.multipleSelection1.map((v) => v.settleOrderId)),
        settleOrderId: -1,
      })
    },
    showColumnDetail(params) {
      this.showColumnDetailHandle(params)
    },
    openAgentReceipayDialog() {
      if (this.multipleSelection1.length != 1) {
        return this.$msgErrClose(this.$t('Settle.paymentTips'))
      }
      let data = { settleOrderNo: this.multipleSelection1[0].settleOrderNo }
      settleOrderAgentConfirmValidate(data).then((res) => {
        this.agentReceipayDialogVisible = true
      })
    },
    setAgentCompany() {
      this.$refs.agentForm.validate((valid) => {
        if (valid) {
          let data = {
            settleOrderNo: this.multipleSelection1[0].settleOrderNo,
            agentCompCode: this.agentForm.agentCompCode,
          }
          settleOrderAgentConfirm(data)
            .then((res) => {
              if (res.code === 0) {
                this.agentReceipayDialogVisible = false
                this.getData()
                this.$message({
                  message: this.$t('Settle.paymentSuc'),
                  type: 'success',
                  showClose: true,
                })
              }
            })
            .catch((err) => {})
        }
      })
    },
    cancelAgentCompany() {
      if (this.multipleSelection1.length !== 1) {
        return this.$msgErrClose(this.$t('Settle.behalfTips'))
      } else {
        let multipleSelection = this.multipleSelection1.concat(this.multipleSelection2)
        let bool = multipleSelection.some((item) => item.agentCompCode === '')
        if (bool) {
          return this.$msgErrClose(this.$t('FeeList.noNeedTips'))
        }
      }
      this.$confirm(this.$t('Settle.collectionConfirm'), this.$t('FeeList.tips'), {
        confirmButtonText: this.$t('FeeList.sure'),
        cancelButtonText: this.$t('FeeList.cancel'),
        type: 'warning',
      })
        .then(() => {
          let data = {
            settleOrderNo: this.multipleSelection1[0].settleOrderNo,
          }
          settleOrderAgentCancel(data)
            .then((res) => {
              if (res.code === 0) {
                this.getData()
                this.$message({
                  message: this.$t('FeeList.cancelTips'),
                  type: 'success',
                  showClose: true,
                })
              }
            })
            .catch((err) => {})
        })
        .catch(() => {})
    },
    invoiceApply() {
      // this.$message({
      //   message: '修改中，请稍后！',
      //   type: 'error',
      //   showClose: true
      // })
      // return
      if (this.multipleSelection1.length === 0) {
        this.$message({
          message: this.$t('Settle.invoiceTips'),
          type: 'error',
          showClose: true,
        })
        return
      }
      // if (this.multipleSelection1.length > 1) {
      //   this.$message({
      //     message: '一次只能勾选一个结算单！',
      //     type: 'error',
      //     showClose: true,
      //   })
      //   return
      // }
      settleOrderInvoiceFeeList({ settleOrderIds: this.multipleSelection1.map((v) => v.settleOrderId) }).then((res) => {
        if (!res.data.settleOrderFeeList.find((item) => item.openerReceiveInvoice === 'yes')) {
          return this.$msgErrClose(this.$t('Settle.invoicableTips'))
        }
        if (!res.data.invoiceBalance) {
          return this.$msgErrClose(this.$t('Settle.balancingTips'))
        }
        if (res.data.settleOrderFeeList.find((item) => item.openerReceiveInvoice === 'no')) {
          this.$confirmWarn(this.$t('Settle.invoicingTips'), () => {
            this.goPageInvoiceApply()
          })
        } else {
          this.goPageInvoiceApply()
        }
      })
    },
    goPageInvoiceApply() {
      this.isJumpRouteFromPage = true
      this.$router.push({
        name: 'InvoiceReceivableApply',
        query: {
          settleOrderId: JSON.stringify(this.multipleSelection1.map((v) => v.settleOrderId)),
          source: 'settleInvoice',
        },
      })
    },
    payApply() {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose(this.$t('Settle.applyTips'))
      }
      // (res.data.finLockStatus === 'lock' || res.data.finUseStatus === 'finish' || res.data.closeStatus === 'yes')
      let row = this.multipleSelection1[0]
      if (row.confirmStatus === 'no') {
        return this.$msgErrClose(this.$t('Settle.notBeen'))
      }
      if (row.finLockStatus === 'lock') {
        return this.$msgErrClose(this.$t('Settle.lockedTips'))
      }
      // if(row.finUseStatus === 'finish'){
      //   return this.$msgErrClose('结算单已关闭，不能进行付款申请！')
      // }
      if (row.closeStatus === 'yes' || row.finUseStatus === 'finish') {
        return this.$msgErrClose(this.$t('Settle.closedTips'))
      }
      // if (this.multipleSelection1.length > 1) {
      //   for (let i = 0; i < this.multipleSelection1.length; i++) {
      //     if(this.multipleSelection1[0].settleCorpCode !== this.multipleSelection1[i].settleCorpCode){
      //       return this.$msgErrClose('相同结算单位的才能一起发起付款！')
      //     }
      //   }
      // }
      // if (this.multipleSelection1.length > 1) {
      //   this.$message({
      //     message: '一次只能勾选一个结算单！',
      //     type: 'error',
      //     showClose: true
      //   })
      //   return
      // }
      // this.source = "settlementPayApply"
      // this.settleOrderId = this.multipleSelection1[0].settleOrderId
      // this.settleOrderNo = this.multipleSelection1[0].settleOrderNo
      this.settleOrderIds = this.multipleSelection1.map((item) => item.settleOrderId)
      validPayApplySettle({ settleOrderIds: this.settleOrderIds }).then((res) => {
        if (res.data.validResult !== 'pass') {
          return this.$msgErrClose(res.data.failReason)
        }
        if (res.data.hasBlack === 'yes') {
          return this.$confirmWarn(res.data.warnMsg, () => {
            // `结算单位：${res.data.hasBlackSettleUnitName}，已是黑名单请确认是否发起付款申请？`
            this.routerPush('SettlementPayApply', {
              settleOrderId: -1,
              settleOrderIds: JSON.stringify(this.settleOrderIds),
            })
          })
        }
        this.routerPush('SettlementPayApply', {
          settleOrderId: -1,
          settleOrderIds: JSON.stringify(this.settleOrderIds),
        })
      })
    },
    //关联发票
    handleRelationInvoice() {
      let list = this.multipleSelection1
      if (list.length === 0) {
        return this.$msgErrClose(this.$t('Settle.associatedTips'))
      }
      // if (this.multipleSelection1.length > 1) {
      //   return this.$msgErrClose('一次只能选择一个关联的项！')
      // }
      // console.log(this.multipleSelection1[0].payInfoVo.delayInvoiceAmt);
      // for (let i = 0; i < list.length; i++) {
      //   if(list[i].payInfoVo.delayInvoiceAmt == 0){
      //     return this.$msgErrClose('付款申请单已足额关联发票，如需重新关联请先删除无用发票后再操作！')
      //   }
      //   if (list[i].status === 'refuse') {
      //     return this.$msgErrClose(list[i].applyNo+'审核拒绝状态，不允许关联发票！')
      //   }
      //   if(list[0].currency !== list[i].currency){
      //     return this.$msgErrClose('相同币种才能进行关联发票！请重新选择！')
      //   }
      //   if(list[0].recvCorpCode !== list[i].recvCorpCode){
      //     return this.$msgErrClose('相同结算单位才能进入关联发票！请重新选择！')
      //   }
      // }
      // this.searchOption1.data.currency = this.payInfo.currency.split(',')

      Object.assign(this.relationInvoiceForm, {}, this.multipleSelection1[0])

      // this.relationInvoiceForm.supplierAccountNo = this.multipleSelection1[0].payInfoVo.recvAccountNo
      this.relationInvoiceForm.name = 'settle'
      this.relevanceOpne = true
    },
    closeDialogVisibleRelationInvoice(val, isBreak) {
      this.relevanceOpne = val
      if (isBreak === true) {
        this.getData()
      }
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    querySettleUnit(queryString, cb) {
      this.$store.dispatch('dict/querySettleUnit', queryString).then((data) => {
        cb(data)
      })
    },
    sendMulti(data, option) {
      if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option2) this.multipleSelection2 = data

      let data2 = {
        ascColumns: [],
        descColumns: [],
        query: [],
      }
      let ids = this.multipleSelection1
        .map((item) => {
          return item.settleOrderId
        })
        .join(',')
      if (ids) {
        data2.query.push({
          column: 'settleOrderIds',
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
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    showDetail(row) {
      this.isJumpRouteFromPage = true
      this.$router.push({
        path: '/finance/settlement/settlementDetail',
        query: {
          source: 'settlementDetail',
          settleOrderId: row.settleOrderId,
        },
      })
    },
    billTypeChange(val) {
      console.log(val)
      if (val === 'bill') {
        this.billDialogForm.billFeeType = 'fee_amt'
      }
    },
  },
  activated() {
    let settleOrder_gedgingApplyNoList = localStorage.getItem('settleOrder_gedgingApplyNoList')
    if (settleOrder_gedgingApplyNoList) {
      localStorage.removeItem('settleOrder_gedgingApplyNoList')
      this.getData()
      this.settleOrder_gedgingApplyNoList = JSON.parse(settleOrder_gedgingApplyNoList)
      this.resultDialogOption2.show = true
    }
  },
  watch: {
    agentReceipayDialogVisible(newVal) {
      if (newVal) {
        this.agentForm.agentCompCode = ''
        this.agentForm.agentCompName = ''
      }
    },
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    SettlementDetail,
    InvoiceReceivableApply,
    SettlementPayApply,
    CreateGedging,
    CustomColumns,
    RelationInvoice,
    RelationReg,
  },
}
</script>
<style>
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
.manual-regist-invoice .el-form .el-input {
  width: 162px;
}
</style>
<style lang="scss" scoped>
.select-template-box {
  float: left;
}
.select-template-box .el-dropdown {
  margin-left: 0;
  margin-bottom: 0;
  border-radius: 0;
  font-size: 12px;
  /* line-height: 26px; */
  border: 1px solid #d9d9d9;
  // border-right: none;
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
.export__dialog .el-form-item__content > div {
  width: 100%;
}
.result-dialog-descript {
  margin-top: 12px;
  span {
    font-size: 12px;
    display: inline-block;
    color: #222;
    width: 33%;
    margin-top: 8px;
    float: left;
    text-align: left;
  }
}
</style>