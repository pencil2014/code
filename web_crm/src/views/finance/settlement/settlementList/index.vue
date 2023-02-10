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
            <el-button-group>
              <el-button
                v-if="checkAuth($route.name, 'btn-applyInvoice')"
                class="finance-btn"
                @click="invoiceApply"
                size="mini"
                type="primary"
              >开票申请</el-button>
            </el-button-group>
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
              >付款申请</el-button>
            </el-button-group>
            <el-button-group v-if="checkAuth($route.name, 'btn-regWriteoff')">
              <el-button class="finance-btn" @click="regWriteoff" size="mini">收款登记并核销</el-button>
            </el-button-group>
            <el-button-group v-if="checkAuth($route.name, 'btn-regWriteoff')">
              <el-button class="finance-btn" @click="relationRegDialog" size="mini">关联收款登记核销</el-button>
            </el-button-group>
            <el-button-group v-if="checkAuth($route.name, 'btn-exportBill')">
              <el-button class="finance-btn" @click="handleCommand" size="mini">导出对账单</el-button>
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
              >合并结算单</el-button>
            </el-button-group>
            <el-button-group>
              <el-button
                v-if="checkAuth($route.name, 'btn-confirmSettle')"
                class="finance-btn"
                @click="confirmSettlement"
                size="mini"
                type="success"
              >确认结算单</el-button>
              <el-button
                v-if="checkAuth($route.name, 'btn-cancelConfirm')"
                class="finance-btn"
                @click="settlementCancelConfirm"
                size="mini"
                type="purple"
              >撤销确认</el-button>
            </el-button-group>
            <el-button-group>
              <el-button
                v-if="checkAuth($route.name, 'btn-releaseSettleOrder')"
                class="finance-btn"
                @click="releaseSettleOrder"
                size="mini"
              >释放未销费用</el-button>
              <!-- type="warning" -->
            </el-button-group>
            <el-button-group>
              <el-button
                v-if="checkAuth($route.name, 'btn-feeAgent')"
                class="finance-btn"
                size="mini"
                @click="openAgentReceipayDialog"
              >费用代收付</el-button>
              <!-- type="primary" -->
              <el-button
                v-if="checkAuth($route.name, 'btn-feeAgentCancel')"
                class="finance-btn"
                size="mini"
                @click="cancelAgentCompany"
              >撤销代收付</el-button>
              <!-- type="purple" -->
            </el-button-group>
            <el-button-group>
              <el-button
                v-if="checkAuth($route.name, 'btn-hedging')"
                class="finance-btn"
                @click="createGedging"
                size="mini"
                type="primary"
              >对冲申请</el-button>
            </el-button-group>
            <el-button-group>
              <el-button
                v-if="checkAuth($route.name, 'btn-delSettle')"
                class="finance-btn"
                @click="closeSettlement"
                size="mini"
                type="danger"
              >删除结算单</el-button>
            </el-button-group>
            <el-button-group>
              <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
            </el-button-group>
          </div>
        </div>
        <FinanceTableMass :option="option1" @send-multi="sendMulti" />
      </div>
    </div>
    <el-dialog
      title="费用代收付"
      :visible.sync="agentReceipayDialogVisible"
      :close-on-click-modal="false"
      class="finance-agent-receipay"
      width="604px"
    >
      <div style="margin:20px auto 0;width:400px;">
        <el-form ref="agentForm" :model="agentForm" label-width="100px" size="mini">
          <el-form-item
            label="选择分公司"
            prop="agentCompCode"
            :rules="{required: true, message: '分公司不能为空', trigger: 'blur'}"
          >
            <el-select
              v-model="agentForm.agentCompCode"
              :placeholder="'请选择'"
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
        <el-button @click="agentReceipayDialogVisible = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="setAgentCompany" size="mini">提 交</el-button>
      </span>
    </el-dialog>

    <el-dialog title="导出对账单" :visible.sync="billDialog" width="500px">
      <div style="margin:10px auto -10px;" class="export__dialog">
        <!-- billExportType: '',
        billFeeType: '',-->
        <el-form
          ref="billDialogForm"
          :model="billDialogForm"
          label-width="100px"
          size="mini"
          :rules="billDialogRules"
        >
          <el-form-item label="金额类型：" prop="billFeeType">
            <el-select
              v-model="billDialogForm.billFeeType"
              placeholder="请选择"
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
          <el-form-item label="语言：" prop="lang">
            <el-select v-model="billDialogForm.lang" placeholder="请选择">
              <el-option label="中文" value="CN"></el-option>
              <el-option label="英文" value="US"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="模板类型：" prop="billType">
            <el-select v-model="billDialogForm.billType" placeholder="请选择" @change="billTypeChange">
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
        <el-button type="primary" @click="exportBill" size="mini">确 认</el-button>
        <el-button @click="billDialog = false" size="mini">取 消</el-button>
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
// import CreateGedging from '@/views/finance/gedging/components/gedgingDetail'
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
      billDialogForm: { lang: '', billFeeType: '', billType: '' },
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
        { label: '中文汇总对账单', value: 'CN_sum' },
        { label: '英文汇总对账单', value: 'US_sum' },
      ],
      // 自定义表头弹框
      customColumnsPopShow: false,
      // 右侧搜索条件
      buttonSearch: '',
      selfColumnsBase: [
        {
          prop: 'settleOrderNo',
          label: '结算单号',
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
          label: '来源单号',
          type: 'text',
          width: 138,
        },
        {
          prop: 'sourceBizNos',
          label: '工作号',
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
          label: '分公司',
          type: 'text',
          width: 160,
          isTooltip: true,
        },
        {
          prop: 'settleCorpName',
          label: '结算单位',
          type: 'text',
          width: 160,
          isTooltip: true,
        },
        {
          prop: 'receivePayType',
          label: '收付类型',
          type: 'select',
          width: 80,
          propInDict: 'receipayType',
        },
        {
          prop: 'settleCurrency',
          label: '结算币种',
          type: 'text',
          width: 80,
          sortable: false,
        },
        {
          prop: 'sumAmount',
          label: '汇总金额',
          type: 'tooltip',
          width: 140,
          sortable: false,
        },
        {
          prop: 'confirmStatus',
          label: '结算单确认状态',
          type: 'text',
          width: 120,
          formatter: ({ cellValue }) => {
            if (cellValue === 'yes') {
              return '已确认'
            } else if (cellValue === 'no') {
              return '未确认'
            } else {
              return cellValue
            }
            // return '<span style="color:red;">hello</span> <span style="color:blue;">world.</span>'
          },
        },
        {
          prop: 'settleOrderStatus',
          label: '结算单锁定状态',
          type: 'select',
          propInDict: 'finSettleOrderStatus',
          width: 120,
        },
        {
          prop: 'invoiceStatus',
          label: '开票状态',
          width: 80,
          type: 'select',
          propInDict: 'feeInvoiceStatus',
        },
        {
          prop: 'receiveInvoiceApplyStatus',
          label: '开票申请状态',
          width: 108,
          type: 'select',
        },
        {
          prop: 'writeoffStatus',
          label: '核销状态',
          width: 80,
          type: 'select',
        },
        {
          prop: 'finLockReason',
          label: '锁定原因',
          type: 'tooltip',
          width: 130,
          sortable: false,
        },
        {
          prop: 'mbl',
          label: 'MBL',
          type: 'text',
          width: 100,
          sortable: false,
        },
        {
          prop: 'hbl',
          label: 'HBL',
          type: 'text',
          width: 100,
          sortable: false,
        },
        { prop: 'agentCompName', label: '代收付分公司', type: 'text', key: 'agentCompName', width: 150, isTooltip: true },
        {
          prop: 'reciWriteOffAmtDesc',
          label: '应收已核销金额',
          type: 'text',
          width: 140,
          sortable: false,
        },
        {
          prop: 'reciNoWriteOffAmtDesc',
          label: '应收未核销金额',
          type: 'text',
          width: 140,
          sortable: false,
        },
        {
          prop: 'payWriteOffAmtDesc',
          label: '应付已核销金额',
          type: 'text',
          width: 140,
          sortable: false,
        },
        {
          prop: 'payNoWriteOffAmtDesc',
          label: '应付未核销金额',
          type: 'text',
          width: 140,
          sortable: false,
        },
        {
          prop: 'orderType',
          label: '结算单类型',
          width: 100,
          type: 'select',
          propInDict: 'settleOrderType',
        },
        {
          prop: 'sourceType',
          label: '结算单来源',
          width: 100,
          type: 'select',
          propInDict: 'settleOrderSourceType',
          sortable: false,
        },
        {
          prop: 'latestPayDate',
          label: '最晚付款时间',
          type: 'text',
          width: 120,
          sortable: false,
        },
        {
          prop: 'payApplyNo',
          label: '请款单号',
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
          label: '付款单号',
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
          label: '核销单号',
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
        { prop: 'groupStatus', label: '是否集团结算', type: 'select', propInDict: 'yesNo', sortable: false },
        { prop: 'agentStatus', label: '是否代收付', type: 'select', propInDict: 'yesNo', sortable: false },
        {
          prop: 'badStatus',
          label: '是否坏账',
          type: 'select',
          specialType: 'btnTooltip',
          propInDict: 'yesNo',
          sortable: false,
          callback: { content: (row) => row.badAmt, active: (row) => row.badStatus === 'yes' },
        },
        {
          prop: 'receiveInvoiceStatus',
          label: '应收开票状态',
          width: 100,
          type: 'select',
          propInDict: 'feeInvoiceStatus',
          sortable: false,
        },
        {
          prop: 'receiveInvoiceTime',
          label: '应收发票开票时间',
          width: 130,
          type: 'text',
          sortable: false,
        },
        {
          prop: 'payInvoiceStatus',
          label: '应付开票状态',
          width: 100,
          type: 'select',
          propInDict: 'feeInvoiceStatus',
          sortable: false,
        },
        {
          prop: 'payInvoiceTime',
          label: '应付发票登记时间',
          width: 130,
          type: 'text',
          sortable: false,
        },
        {
          prop: 'createdName',
          label: '创建人',
          type: 'text',
          width: 100,
        },
        {
          prop: 'createdTime',
          label: '创建时间',
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
        title: '导出成功',
        resultType: 'success',
        text_cancel: '关闭',
        titleText: '导出对账单成功！',
      },
      resultDialogOption2: {
        show: false,
        title: '对冲成功',
        resultType: 'success',
        text_cancel: '关闭',
        titleText: '对冲申请成功！',
      },
      settleOrder_gedgingApplyNoList: [],
      settleOrderBillIds: '',
      settleRegList: [],
    }
  },
  created() {
    this.currencySelectOptions = [...this.$store.state.dict.dictMap.currency]
    this.currencySelectOptions.unshift({ label: '原币种', value: 'original' })
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
          allNo: { label: '各类单号', type: 'input', placeholder: '多个用空格或逗号分隔' },
          settleOrderNo: { label: '结算单号', type: 'input', showType: '1' },
          sourceOrderBillNo: { label: '来源单号', type: 'input', showType: '1' },
          payApplyNo: { label: '请款单号', type: 'input', showType: '1' },
          payOrderNo: { label: '付款单号', type: 'input', showType: '1' },
          mbl: { label: 'MBL', type: 'input', showType: '1' },
          hbl: { label: 'HBL', type: 'input', showType: '1' },
          writeoffNo: { label: '核销单号', type: 'input', showType: '1' },
          sourceBizNo: { label: '工作单号', type: 'input', showType: '1' },
          receivePayType: { label: '收付类型', type: 'select', prop: 'receipayType', showType: '2' },
          orderType: { label: '结算单类型', type: 'select', prop: 'settleOrderType', showType: '2' },
          sourceType: { label: '结算单来源', type: 'select', prop: 'settleOrderSourceType', showType: '2' },
          settleOrderStatuss: {
            label: '结算单锁定状态',
            type: 'select',
            // multiple: true,
            prop: 'finSettleOrderStatus',
          },
          invoiceStatuss: { label: '开票状态', type: 'select', multiple: true, prop: 'feeInvoiceStatus', showType: '3' },
          receiveInvoiceApplyStatus: { label: '开票申请状态', type: 'select', prop: 'receiveInvoiceApplyStatus' },
          writeoffStatuss: { label: '核销状态', type: 'select', multiple: true, prop: 'writeoffStatus', showType: '3' },
          confirmStatus: {
            label: '结算单确认状态',
            type: 'select',
            prop: 'confirmStatus',
            selectOptions: [
              { label: '已确认', value: 'yes' },
              { label: '未确认', value: 'no' },
            ],
          },
          settleCurrency: {
            label: '结算币种',
            type: 'select',
            prop: 'currency',
            selectOptions: this.currencySelectOptions,
          },
          settleCorpCodes: {
            label: '结算单位',
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
            label: '分公司',
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
            label: '代收付分公司',
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
          receiveInvoiceStatus: { label: '应收开票状态', type: 'select', multiple: true, prop: 'feeInvoiceStatus' },
          payInvoiceStatus: { label: '应付开票状态', type: 'select', multiple: true, prop: 'feeInvoiceStatus' },
          groupStatus: { label: '是否集团结算', type: 'select', prop: 'yesNo' },
          agentStatus: { label: '是否代收付', type: 'select', prop: 'yesNo' },
          badStatus: { label: '是否坏账', type: 'select', prop: 'yesNo' },
          createdDate: { label: '创建日期', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['beginDate', 'endDate'] },
          createdBy: {
            label: '创建人',
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
          label: '详情',
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
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
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
      emptyText: '数据将在查询后显示',
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
        return this.$msgErrClose('请选择需要关联收款登记的结算单！')
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
            this.$set(this.option1, 'emptyText', '未查询到任何数据')
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
          }
          data = Object.assign(data, res.data)
          let labelObj = {
            recSettleAmtListLabel: '应收结算金额',
            paySettleAmtListLabel: '应付结算金额',
          }
          let colorObj = {
            recSettleAmtListColor: 'red', // 支持red, green, black三种值
            paySettleAmtListColor: 'green',
          }
          this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
            show: true,
            data,
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
        return this.$msgErrClose('请选择需要收款登记的结算单！')
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
        return this.$msgErrClose('请勾选需要删除的结算单！')
      }
      this.$confirmWarn('是否确认删除？', () => {
        close({ settleOrderIds: this.multipleSelection1.map((item) => item.settleOrderId) }).then((res) => {
          this.$msgSucClose('删除成功！')
          this.getData()
        })
      })
    },
    // 确认结算单
    confirmSettlement() {
      if (this.multipleSelection1.length === 0) {
        this.$msgErrClose('请勾选需要确认的结算单！')
        return
      }
      let filterArr = this.multipleSelection1.filter((item) => item.confirmStatus == 'no')
      if (filterArr.length === 0) {
        this.$msgErrClose('请勾选未进行确认的结算单！')
        return
      }
      let data = {
        settleOrderIds: this.multipleSelection1.map((item) => {
          return item.settleOrderId
        }),
      }
      confirm({ settleOrderIds: filterArr.map((item) => item.settleOrderId) }).then((res) => {
        if (res.code === 0) {
          this.$msgSucClose('确认成功！')
          this.getData()
        }
      })
    },
    // 撤销确认结算单
    settlementCancelConfirm() {
      if (this.multipleSelection1.length === 0) {
        this.$msgErrClose('请勾选需要撤销的结算单！')
        return
      }
      let filterArr = this.multipleSelection1.filter((item) => item.confirmStatus == 'yes')
      if (filterArr.length === 0) {
        this.$msgErrClose('请勾选已确认的结算单！')
        return
      }
      this.$confirmWarn('是否撤销确认结算单？', () => {
        cancelConfirm({ settleOrderIds: filterArr.map((item) => item.settleOrderId) }).then((res) => {
          this.$msgSucClose('撤销确认结算单成功！')
          this.getData()
        })
      })
    },
    // 释放未销费用    部分核销，未关闭，未锁定的 需要支持释放结算单
    releaseSettleOrder() {
      if (this.multipleSelection1.length !== 1) {
        return this.$msgErrClose('请选择一个需要释放的结算单！')
      }
      let row = this.multipleSelection1[0]
      if (row.writeoffStatus === 'part_finish' && row.finLockStatus === 'unlock') {
        this.$confirmWarn('是否确认释放结算单？', () => {
          releaseSettleOrder({ settleOrderId: row.settleOrderId }).then((res) => {
            this.$msgSucClose('释放结算单成功！')
            this.getData()
          })
        })
      } else {
        return this.$msgErrClose('请勾选部分核销且未锁定的的结算单！')
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
        return this.$msgErrClose('请勾选需要导出账单的结算单！')
      }
      let arr = [...new Set(this.multipleSelection1.map((v) => v.settleCorpCode))]
      if (arr.length > 1) {
        return this.$msgErrClose('请勾选结算单位相同的结算单！')
      }
      this.billDialog = true
      this.$nextTick(() => {
        this.$refs.billDialogForm.resetFields()
      })
    },
    mergeSettlement() {
      if (this.multipleSelection1.length < 2) {
        return this.$msgErrClose('请至少选择两个结算单进行合并！')
      }
      merge({ settleOrderIds: this.multipleSelection1.map((item) => item.settleOrderId) }).then((res) => {
        if (res.code === 0) {
          this.$message({
            message: '合并成功！',
            type: 'success',
            showClose: true,
          })
          this.getData()
        }
      })
    },
    createGedging() {
      if (!this.multipleSelection1.length) {
        return this.$msgErrClose('请选择结算单进行对冲！')
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
        return this.$msgErrClose('请选择一个结算单进行代收付！')
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
                  message: '费用代收付成功！',
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
        return this.$msgErrClose('请选择一个结算单进行撤销代收付！')
      } else {
        let multipleSelection = this.multipleSelection1.concat(this.multipleSelection2)
        let bool = multipleSelection.some((item) => item.agentCompCode === '')
        if (bool) {
          return this.$msgErrClose('非代收付费用无需撤销代收付！')
        }
      }
      this.$confirm('是否确认将选中的结算单进行撤销代收付？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
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
                  message: '撤销费用代收付成功！',
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
          message: '请勾选需要申请发票的结算单！',
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
          return this.$msgErrClose('不存在可开票的费用名称！')
        }
        if (!res.data.invoiceBalance) {
          return this.$msgErrClose('所选结算单费用扎差后无可开票金额！')
        }
        if (res.data.settleOrderFeeList.find((item) => item.openerReceiveInvoice === 'no')) {
          this.$confirmWarn('存在不可开票费用名称，确认是否继续开票？', () => {
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
        return this.$msgErrClose('请勾选需要申请付款的结算单！')
      }
      // (res.data.finLockStatus === 'lock' || res.data.finUseStatus === 'finish' || res.data.closeStatus === 'yes')
      let row = this.multipleSelection1[0]
      if (row.confirmStatus === 'no') {
        return this.$msgErrClose('结算单未确认，不能进行付款申请！')
      }
      if (row.finLockStatus === 'lock') {
        return this.$msgErrClose('结算单已锁定，不能进行付款申请！')
      }
      // if(row.finUseStatus === 'finish'){
      //   return this.$msgErrClose('结算单已关闭，不能进行付款申请！')
      // }
      if (row.closeStatus === 'yes' || row.finUseStatus === 'finish') {
        return this.$msgErrClose('结算单已关闭，不能进行付款申请！')
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
          return this.$confirmWarn(res.data.warnMsg, () => { // `结算单位：${res.data.hasBlackSettleUnitName}，已是黑名单请确认是否发起付款申请？`
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
        return this.$msgErrClose('请勾选需要关联的结算单！')
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