<template>
<div class="finance-tab-page"
  v-loading="loading"
  :element-loading-text="eLoadingText"
  :element-loading-spinner="eLoadingSpinner"
  :element-loading-background="eLoadingBackground"
>
  <div v-show="!showBillDetail" class="prepay">
    <FinanceSearch
      :searchOption="searchOption1"
      @search="search"/>
    <div class="finance-search-list-gap"></div>
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button-group>
            <el-button type="primary" class="finance-btn" v-if="checkAuth($route.name, 'tab-prepayList', 'btn-prepayPrepay')" @click="handlePrepay" size="mini">{{$t('PayApplyList.prepayApply')}}</el-button>
          </el-button-group>
          <el-button-group v-if="checkAuth($route.name, 'tab-prepayList', 'btn-prepayPass')" type="success">
            <div class="select-template-box prepay-select-box">
              <el-dropdown trigger="click" @command="handleApplyPass">
                <span class="el-dropdown-link">
                  {{$t('PayApplyList.passApply')}}<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-for="(item, index) in pusheApplyPassList" :key="'pusheApplyPassList' + index"
                    :command="item">
                    {{item.label}}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </el-button-group>
          <!-- <el-button-group>
            <el-button type="success" class="finance-btn" v-if="checkAuth($route.name, 'tab-prepayList', 'btn-prepayPass')" @click="handleApplyFor('pass')" size="mini">申请通过</el-button>
          </el-button-group> -->
          <el-button-group>
            <el-button  type="danger" class="finance-btn" v-if="checkAuth($route.name, 'tab-prepayList', 'btn-prepayRefuse')" @click="handleApplyFor('refuse')" size="mini">{{$t('PayApplyList.refuseApply')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" v-if="checkAuth($route.name, 'tab-prepayList', 'btn-cancelPayApply')"  size="mini" @click="handleCancelPayApply" type="purple"
            >{{$t('PayApplyList.recallApply')}}</el-button
          >
          </el-button-group>
          <!-- <el-button-group>
						<el-button class="finance-btn" v-if="checkAuth($route.name, 'tab-prepayList', 'btn-prepayExport')" @click="handleExport" size="mini"
							>导出</el-button
						>
					</el-button-group> -->
          <el-button-group v-if="checkAuth($route.name, 'tab-prepayList', 'btn-prepayExport')">
            <div class="finance-btn select-template-box">
              <el-dropdown trigger="click" @command="handleExport">
                <span class="el-dropdown-link">
                {{$t('OrderFee.export')}}<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-for="(item, index) in exportTypeList" :key="'exportTypeList' + index"
                    :command="item">
                    {{$t('OrderFee.export')}}{{$t('OrderFee.enspace')}}{{item.label}}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </el-button-group>
          <el-button-group>
						<el-button class="finance-btn" v-if="checkAuth($route.name, 'tab-prepayList', 'btn-prepayPrint')" size="mini" @click="handlePrint"
							>{{$t('BillList.print')}}</el-button
						>
					</el-button-group>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" v-if="checkAuth($route.name, 'tab-settleList', 'btn-presentPaperBill')" @click="presentPaperBill('yes')" size="mini">{{$t('PayApplyList.presentedPaperBill')}}</el-button>
            <el-button class="finance-btn" v-if="checkAuth($route.name, 'tab-settleList', 'btn-retractPaperBill')" @click="presentPaperBill('no')" size="mini">{{$t('PayApplyList.cancelPaperBill')}}</el-button>
          </el-button-group>
          <!-- 海外版不显示
          <el-button-group>
            <el-button class="finance-btn" v-if="checkAuth($route.name, 'tab-prepayList', 'btn-prepayRelationInvoice')" @click="handleRelationInvoice" size="mini">关联发票</el-button>
            <el-button class="finance-btn" v-if="checkAuth($route.name, 'tab-prepayList', 'btn-prepayAddInvoice')" @click="addInvoice" size="mini">发票登记</el-button>
          </el-button-group>

          <el-button-group>
            <el-button class="finance-btn" v-if="checkAuth($route.name, 'tab-prepayList', 'btn-prepayDownLoadInvoice')" @click="handleDownLoadInvoice" size="mini">批量下载发票</el-button>
          </el-button-group> -->
          <!-- <el-button-group>
            <el-button class="finance-btn" :class="rightFilterBtns[0] ? 'right-filter-btns-effect': ''" @click="search('', 0)" size="mini">全部</el-button>
            <el-button class="finance-btn" :class="rightFilterBtns[1] ? 'right-filter-btns-effect': ''" @click="search('pending', 1)" size="mini">待审核</el-button>
            <el-button class="finance-btn" :class="rightFilterBtns[2] ? 'right-filter-btns-effect': ''" @click="search('pass', 2)" size="mini">通过</el-button>
            <el-button class="finance-btn" :class="rightFilterBtns[3] ? 'right-filter-btns-effect': ''" @click="search('refuse', 3)" size="mini">拒绝</el-button>
          </el-button-group> -->
          <el-button-group>
            <el-button
              class="finance-btn"
              @click="refreshListPage"
              size="mini"
              type="primary"
            >{{$t('OrderFee.refresh')}}</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTableMass
        :option="option1"
        @send-multi="sendMulti"/>
    </div>
  </div>
  <div class="finance-bill-detail-container">
    <component
      v-if="showBillDetail"
       :is="currentComponent"
      :apply-no="applyNo"
      @open-receivable-detail="openReceivableDetail"/>
  </div>
  <el-dialog
    :title="$t('PayApplyList.refuseApply')"
    :visible.sync="rejectDialogVisible"
    :before-close="handleCancel"
    width="600px"><!-- 申请不通过 -->
    <el-form :model="query" ref="query" label-width="100px"  class="el-form-item-payapply-remark" required >
    <el-form-item :label="$t('OrderFee.refuseReason')"
      prop="refuseReason"
      :rules="{required: true, message: ' ', trigger: 'blur'}">
      <el-input type="textarea" :placeholder="$t('OrderFee.plsInput')" maxlength="200" show-word-limit v-model="query.refuseReason"></el-input>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" :loading='query.loading' @click="rejectSubmit" size="mini">{{$t('OrderFee.confirm')}}</el-button>
      <el-button @click="handleCancel" size="mini">{{$t('OrderFee.cancel')}}</el-button>
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
  <!-- 预收款申请 -->
  <prepayEdit :form="form" 
    :option1="option2" 
    :autocomplete="autocomplete" 
    :autocomplete1="autocomplete1" 
    :autocomplete2="autocomplete2" 
    :autocomplete3="autocomplete3" 
    :autocomplete4="autocomplete4" 
    :bankListByName="bankListByName"
    :bankListAll="bankListAll"
    :dialogVisible="dialogVisible"
    :invoiceRegList="invoiceRegList"
    ref="prepayEdit"
    @handle-add-invoice='handleAddInvoice'
    @setBankListByName="setBankListByName"
    @close-dialog-visible='closeDialogVisible' />
  <RegisterInvoice :invoicePaymentAddForm="invoicePaymentAddForm" :dialogVisibleInvoice="dialogVisibleInvoice"  @close-dialog-visible='closeDialogVisibleInvoice' />
  <RelationInvoice :relationInvoiceForm="relationInvoiceForm" :relevanceOpne="relevanceOpne"  @close-dialog-visible-relationInvoice='closeDialogVisibleRelationInvoice' />
</div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import BillDetail from '@/views/finance/orderFee/orderFee/components/billDetail'
import prepayEdit from '@/views/finance/pay/prepay/components/prepayEdit'
import CustomColumns from '@/components/customColumns/index'
import RegisterInvoice from '@/views/finance/pay/settle/components/registerInvoice'
import RelationInvoice from '@/views/finance/pay/prepay/components/relationInvoice'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { queryPrepayApplyPage, savePrepayApply, approvePrepayApply, queryPrepayApplyPageSummary, cancelPayApplyPrepay, prePresentedPaperBill } from '@/api/fin/pay.js'
import { dateFormat } from '@/views/finance/utils/finance'
import { randomString } from '@/utils'
import { getCompanyInvoiceInfo } from '@/api/fin/company'
import { employeeSelectlist } from '@/api/companyResource'

const defaultCreateQuery ={
  "settleCompCode": "",
  "settleCompName": "",
  "applyPayAmt": null,
  "payWay": "",
  "currency": "",
  "delayInvoice": "",
  "hasInvoice": "no",
  "payBankAccountId": null,
  "payCompName": "",
  "payAccountShortName": "",
  "payAccountName": "",
  "payAccountNo": "",
  "payBankBranch": "",
  "payBankCode": "",
  "payBankName": "",
  "recvBankAccountId": "",
  "recvAccountNo": "",
  "recvAccountName": "",
  "recvBankBranch": "",
  "recvBankCode": "",
  "recvBankName": "",
  "recvCorpCode": "",
  "recvCorpName": "",
  "remark": "",
  "settleMode": "",
  "bankAccountSettleModeList":[],
  "payInfoInvoiceList":[],
}
export default {
  name:"PrepayList",
  mixins: [mixin, mixin2],
  props:['isJumpRouteFromPage'],
  data() {
    return {
      pageSizeUrl: queryPrepayApplyPage('geturl'),
      keyDownActive: true,
      invoiceRegList:[],
      req:'',
      applyNo: '',
      currentComponent:'',
      query:{
        applyNos:[],
        confirmStatus: "",
        refuseReason: "",
        loading:false
      },
      rejectDialogVisible:false,
      option1: {},
      option2: {},
      searchOption1: {},
      table1DataBackup: [],
      multipleSelection1: [],
      multipleSelection2: [],
      multipleSelection3: [],
      orderBillId: '',
      showBillDetail: false,
      selectedOptionItem: '',
      searchBackup:[],
      //预收款申请弹框
      dialogVisible:false,
      form:Object.assign({},defaultCreateQuery),
      rightFilterBtns: [true, false, false, false],
      loading: false,
      //发票登记
      dialogVisibleInvoice:false,
      invoicePaymentAddForm :{
        supplierCorpName: '',
        supplierCorpCode: '',
        corpBank: null,
        bankAccounts: [],
        invoiceBankList:[],
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
        invoicePaymentList:[],
        bankAccountsPubList:[]
      },
      //关联发票
      relevanceOpne:false,
      relationInvoiceForm:{
        name:"",
        payInfoId:"",
        currency:"",
        recvCorpName:"",
        recvCorpCode:"",
        settleCompCode:"",
        settleCompName:"",
        supplierAccountNo:""
      },
      // 升序
			ascColumns: [],
			// 降序
			descColumns: [],
      // 初始表头
      selfColumnsBase: [
        {
          prop: 'applyNo',
          label: this.$t('PayApplyList.prepayApplyNo'), // '预付款申请号',
          width:'155px',
          type: 'button',
          operationBtns:{
            show: true,
            callback: (fn, index, row, option, subItem) => {
              this.showDetail(row)
            },
          }
        },
        {
          prop: 'recvCorpName',
          label: this.$t('PayApplyList.settleCorpName'), // '结算单位',
          width: 150,
          type: 'text',
        },
        {
          prop: 'confirmStatus',
          label: this.$t('OrderFee.approvalStatus'), // '审核状态', // $t('OrderFee.confirmStatus')
          width: 100,
          type: 'select',
          // propInDict:"confirmStatus",
          formatter:({row})=>{
            const val = this.dictMapObj.confirmStatus[row.confirmStatus]
            if (row.confirmStatus === 'pass') {
              return '<span style="color:#33B18A">'+val+'</span>'
            } else if (row.confirmStatus === 'refuse') {
              return '<span style="color:#CD4130">'+val+'</span>'
            } else if (row.confirmStatus === 'pending') {
              return '<span style="color:#EDB534">'+val+'</span>'
            } else {
              return val
            }
          }
        },
        {
          prop: 'recvAccountNo',
          label: this.$t('PayApplyList.recvAccountNo'), // '收款账号',
          type: 'text',
          width: 140,
        },
        {
          prop: 'recvBankName',
          label: this.$t('PayApplyList.recvBankName'), // '收款银行',
          width: 125,
          type: 'text',
        },
        {
          prop: 'recvBankBranch',
          label: this.$t('PayApplyList.recvBankBranch'), // '收款银行支行',
          type: 'text',
          width: 140,
        },
        {
          prop: 'recvAccountName',
          label: this.$t('PayApplyList.recvAccountName'), // '收款账户名',
          width: 150,
          type: 'text',
        },
        {
          prop: 'currency',
          label: this.$t('OrderFee.currency'), // '币种',
          type: 'select',
        },
        {
          prop: 'applyPayAmt',
          label: this.$t('PayApplyList.applyPayAmt'), // '金额',
          type: 'text',
          width: 140
        },
        {
          prop: 'refundAmt',
          label: this.$t('PayApplyList.refundAmt'), // '退款金额',
          type: 'text',
          width: 100
        },
        {
          prop: 'payWay',
          label: this.$t('PayApplyList.payWay'), // '付款方式',
          type: 'select',
          propInDict:'payWay',
          width: 120
        },
        {
          label: this.$t('PayApplyList.settleMode'), // '账户结算方式',
          type: 'select',
          prop: 'settleMode',
          propInDict: 'bankAccountSettleMode',
          width: 120,
          multi: true,
        },
        // {
        //   prop: 'payCompName',
        //   label: this.$t('Settle.branchCompany'),
        //   type: 'text',
        //   width:"125px",
        // },
        {
          prop: 'payAccountName',
          label: this.$t('PayApplyList.payAccountName'), // '付款账户名',
          type: 'text',
          width: 150,
        },
        {
          prop: 'payBankName',
          label: this.$t('PayApplyList.payBankName'), // '付款银行',
          type: 'text',
          width: 125,
        },
        {
          prop: 'payAccountNo',
          label: this.$t('PayApplyList.payAccountNo'), // '付款账号',
          type: 'text',
          width: 125,
        },
        {
          prop: 'payDate',
          label: this.$t('PayApplyList.payDate'), // '付款时间',
          type: 'text',
          width: 125,
        },
        // { // 海外版不显示
        //   prop: 'hasInvoice',
        //   label: '开票状态',
        //   type: 'select',
        //   propInDict:"payRelaInvoiceStatus"
        // },
        {
          prop: 'sourceType',
          label: this.$t('PayApplyList.prepaySourceType'), // '预付款来源',
          type: 'select',
          propInDict:"prepayApplySourceType",
          width: 100
        },
        // { // 海外版不显示
        //   prop: 'invoiceNos',
        //   label: this.$t('FeeList.invoiceNo'),
        //   type: 'columnTip',
        //   component: 'ColumnTip',
        //   componentProps: {
        //     show: false,
        //     data: [],
        //     callback: (no, componentProps, index) => {
        //         let row = componentProps.row
        //         let invoiceReceivableIds = row.invoiceReceivableIds_multiValue ? row.invoiceReceivableIds_multiValue : row.invoiceNos_multiValue
        //         let invoiceReceivableId = invoiceReceivableIds[index]
        //         console.log(invoiceReceivableId);
        //         if(!invoiceReceivableId) return
        //         let query = {
        //           invoicePaymentId:invoiceReceivableId,
        //           // invoiceNo: row && row.invoiceNo ? row.invoiceNo :invoiceNo
        //         }
        //         this.$emit('update:isJumpRouteFromPage', true)
        //           this.$router.push({
        //             name: 'InvoicePaymentListDetail',
        //             query
        //           })
        //         // this.invoicePreviewForm.invoicePaymentId = invoiceReceivableId
        //         // this.invoicePreviewOpne = true
        //       }
        //   },
        // },
        // {
        //   prop: 'invoiceAmt',
        //   label: this.$t('Collect.invoicedAmt'),
        //   type: 'text',
        // },
        // {
        //   prop: 'delayInvoiceAmt',
        //   label: this.$t('Collect.uninvoicedAmount'),
        //   type: 'text',
        // },
        {
          prop: 'prepayDedueStatus',
          label: this.$t('PayApplyList.prepayDedueStatus'), // '抵账状态',
          type: 'select',
          // propInDict:"prepayDedueStatus"，
          formatter:({row})=>{
            const val = this.dictMapObj.prepayDedueStatus[row.prepayDedueStatus]
            if (row.prepayDedueStatus === 'finish') {
              return '<span style="color:#33B18A">'+val+'</span>'
            } else if (row.prepayDedueStatus === 'nofinish') {
              return '<span style="color:#CD4130">'+val+'</span>'
            } else if (row.prepayDedueStatus === 'part_finish') {
              return '<span style="color:#EDB534">'+val+'</span>'
            } else {
              return val
            }
          },
          width: 110
        },
        {
          prop: 'payStatus',
          label: this.$t('PayApplyList.payStatus'), // '付款状态',
          type: 'select',
          propInDict:"payStatusType",
          width: 110
        },
        {
          prop: 'payOrderNo',
          label: this.$t('Settle.payOrderNo'),
          type: 'columnTip',
          width: '150px',
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data:[],
            callback: (no, componentProps, index) => {
                this.$emit('update:isJumpRouteFromPage', true)
                this.$router.push({
                  name: 'OrderDetails',
                  query: {
                    payOrderNo: no,
                  }
                })
            }
          }
        },
        {
          prop: 'balance',
          label: this.$t('PayApplyList.balance'), // '剩余可用金额',
          type: 'text',
          width: 150,
        },
        // {
        //   prop: 'realpayAmt',
        //   label: '预付金额',
        //   type: 'text',
        // },
        {
          prop: 'refuseReason',
          label: this.$t('PayApplyList.prepayRefuseReason'), // '审核拒绝原因',
          type: 'tooltip',
          width: 170,
        },
        // {
        //   prop: 'payOrderRefuseReason',
        //   label: '出纳拒绝原因',
        //   type: 'tooltip',
        //   width: 135,
        // },
        {
          prop: 'remark',
          label: this.$t('OrderFee.remark'), // '备注',
          type: 'tooltip',
          width: 135,
        },
        {
          prop: 'printCount',
          label: this.$t('PayApplyList.printCount'), // '打印次数',
          type: 'text',
        },
        {
          prop: 'printTime',
          label: this.$t('PayApplyList.printTime'), // '打印时间',
          type: 'text',
          width: 135,
        },
        {
          prop: 'presentedPaperBill',
          label: this.$t('PayApplyList.presentedPaperBillStatus'), // '交单状态',
          type: 'select',
          propInDict: 'yesNo',
          width: 150
        },
        {
          prop: 'paperBillSubmitTime',
          label: this.$t('PayApplyList.paperBillSubmitTime'), // '交单时间',
          type: 'text',
          width: 150
        },
        {
          prop: 'presentedPaperBillEmpName',
          label: this.$t('PayApplyList.presentedPaperBillEmpName'), // '交单人',
          type: 'text',
          width: 170
        },
        {
          prop: 'createdName',
          label: this.$t('OrderFee.createdName'), // '申请人',
          type: 'text',
          width: 100,
        },
        {
          prop: 'createdTime',
          label: this.$t('OrderFee.createdTime'), // '申请时间',
          type: 'text',
          width: 125,
        },
        {
          prop: 'confirmName',
          label: this.$t('OrderFee.approver'), // '审核人',
          type: 'text',
          width: 100,
        },
        {
          prop: 'confirmTime',
          label: this.$t('OrderFee.approvalTime'), // '审核时间',
          width: 125,
          type: 'text'
        },
        // { // 海外版不显示
        //   prop: 'invoiceRegTime',
        //   label: '发票登记时间',
        //   width: 125,
        //   type: 'text',
        // },
        {
          prop: 'errorStatus',
          label: this.$t('PayApplyList.errorStatus'), // '付错状态',
          type: 'select',
          propInDict: 'yesNo',
          width: 140
        },
        {
          prop: 'payCompName',
          label: this.$t('PayApplyList.payCompName'), // '分公司',
          width: 150,
          type: 'text',
        },
        {
          prop: 'hasPrepayRefund',
          label: this.$t('PayApplyList.hasPrepayRefund'), // '预付退款状态',
          type: 'text',
          width: 165,
          formatter: ({ cellValue }) => {
            if (cellValue === 'yes') {
              return this.$t('PayApplyList.refund') // '已退款'
            } else if (cellValue === 'no') {
              return this.$t('PayApplyList.noRefund') // '未退款'
            } else {
              return ''
            }
          }
        },
      ],
      pusheApplyPassList: [
				{ label: this.$t('PayApplyList.passApply'), value: 'pass' }, // '申请通过'
				{ label: this.$t('PayApplyList.passApplyAndPrint'), value: 'passPrint' }, // '申请通过并打印'
			],
      exportTypeList: [
				{ label: this.$t('PayApplyList.prepayDeductDetail'), value: 'prepayDedueInfoExportList' }, // '预付抵账明细'
				{ label: this.$t('PayApplyList.prepayList'), value: 'payApplyPrepayListExport' }, // '预付款'
      ],
      bankListByName: [],
      bankListAll: []
    }
  },
  created() {
    // 搜索配置
    this.searchOption1 = {
      saveShow: true,
      saveName: 'PayPrepaytList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter:{
        // 初始搜索条件数
        defaultSearchLength: 7,
        // 条件数组
        searchInputGroup: [
          { key: 'allNo', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'hasInvoice', value: '', showType: '2', range: { min: '', max: '' } },
          { key: 'recvBankName', value: '', showType: '3', range: { min: '', max: '' } },
          { key: 'currency', value: '', showType: '4', range: { min: '', max: '' } },
          { key: 'payAmt', value: '', showType: '5', range: { min: '', max: '' } },
          { key: 'recvCorpCode', value: '', showType: '6', range: { min: '', max: '' } },
          { key: 'applyDate', value: '', showType: '7', range: { min: '', max: '' } },
        ],
        filterGroups: {
          //1
          allNo: { label: this.$t('PayApplyList.allNo'), type: 'input', placeholder: this.$t('OrderFee.plsInput'), showType: '1' }, // "多个单号用空格或逗号分隔"
          applyNo: { label: this.$t('PayApplyList.prepayApplyNo'),  type: 'input',  showType: '1'  }, // '预付款申请号'
          payOrderNo: { label: this.$t('Settle.payOrderNo'),  type: 'input',  showType: '1'},
          //2
          // hasInvoice: {  label: '开票状态',  type: 'select', prop:"payRelaInvoiceStatus", showType: '2'}, // 海外版不显示
          payStatus: {  label: this.$t('PayApplyList.payStatus'),  type: 'select', prop:"payStatusType", multiple:true, showType: '2'  }, // 付款状态
          confirmStatus: {  label: this.$t('OrderFee.approvalStatus'),  type: 'select', prop:"confirmStatus", showType: '2'  }, // 审核状态
          prepayDedueStatus: {  label: this.$t('PayApplyList.prepayDedueStatus'),  type: 'select', prop:"prepayDedueStatus", showType: '2', multiple: true }, // 抵账状态
          sourceType: {  label: this.$t('PayApplyList.prepaySourceType'),  type: 'select', prop:"prepayApplySourceType", showType: '2'  }, // 预付款来源
          errorStatus: {  label: this.$t('PayApplyList.errorStatus'),  type: 'select', prop:"yesNo", showType: '2'  }, // 付错状态
          //3
          recvBankName: {  label: this.$t('PayApplyList.recvBankName'),  type: 'input',  showType: '3'  }, // 收款银行
          recvAccountName: {  label: this.$t('PayApplyList.recvAccountName'),  type: 'input',  showType: '3'  }, // 收款账户名
          recvAccountNo: {  label: this.$t('PayApplyList.recvAccountNo'),  type: 'input',  showType: '3'  }, // 收款账号
          payBankName: {  label: this.$t('PayApplyList.payBankName'),  type: 'input',  showType: '3'}, // 付款银行
          payAccountName: {  label: this.$t('PayApplyList.payAccountName'),  type: 'input', showType: '3'  }, // 付款账户名
          payAccountNo: {  label: this.$t('PayApplyList.payAccountNo'),  type: 'input', showType: '3'  }, // 付款账号
          payDate: { label: this.$t('PayApplyList.payDate'),  type: 'daterange', format: 'yyyy-MM-dd',  showType: '3'}, // 付款时间
          //4
          currency: {  label: this.$t('OrderFee.currency'),  type: 'select', selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'), showType: '4'  }, // 币种
          payWay: {  label: this.$t('PayApplyList.payWay'),  type: 'select', prop: "payWay", multiple: true, showType: '4'}, // 付款方式
          settleMode:{ label: this.$t('PayApplyList.settleMode'), type: 'select', propInDict: 'bankAccountSettleMode', r: true, multiple: true }, // 账户结算方式
          //5
          payAmt: {  label: this.$t('PayApplyList.payAmt'),  type: 'range',  showType: '5'  }, // 金额
          //6
          recvCorpCode: {
            label: this.$t('OrderFee.settleCorpName'), // 结算单位
            type: 'remoteSelect',
            showType: '6',
            remote: true,
            multiple:true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({queryString, 'unitTypes':'customer,supplier,company'}, item)
            },
            visibleChange: (queryString, item, row) => {
             this.querySettleUnit2({queryString, 'unitTypes':'customer,supplier,company'}, item)  
            },
            remoteSelectList: []
          },
          //7
          applyDate: {  label: this.$t('PayApplyList.applyDate'),  type: 'daterange', format: 'yyyy-MM-dd',  showType: '7'  }, // 申请时间
          applyEmpName: {  label: this.$t('PayApplyList.applyEmpName'),  type: 'input',  showType: '7'}, // 申请人
          confirmDate: {  label: this.$t('PayApplyList.approvalTime'),  type: 'daterange', format: 'yyyy-MM-dd',  showType: '7'}, // 审核时间
          presentedPaperBill: { label: this.$t('PayApplyList.presentedPaperBillStatus'), type: 'select', prop: 'yesNo' }, // 交单状态
          paperBillSubmitTime: { label: this.$t('PayApplyList.paperBillSubmitTime'),  type: 'daterange', format: 'yyyy-MM-dd' }, // 交单时间
          presentedPaperBillBy: {
            label: this.$t('PayApplyList.presentedPaperBillEmpName'), // 交单人
            prop: 'label',
            type: 'remoteSelect',
            showType: '6',
            multiple:true,
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
            remoteSelectList: [],
          },
        },
      }
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      width: 135,
      data: [
        {
          label: this.$t('OrderFee.detail'), // '详情',
          type: 'text',
          showFn: ()=> this.checkAuth(this.$route.name, 'tab-prepayList', 'btn-detail'),
          action: 'showDetail'
        },
        {
          label: this.$t('PayApplyList.Deduction'), // '抵账明细',
          type: 'text',
          showFn: ()=> true,
          action: 'DedueDetail'
        },
      ]
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true,
      isNew: true,
    })
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'prepayList',
      data: [
        ... this.option.data
      ],
      tips: {
        text: '',
        show: false
      },
      customColumns: {
        show: true,
        handleCustomColumns: ()=> this.handleCustomColumns()
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
      emptyText: this.$t('OrderFee.showAfterQuery'), // '数据将在查询后显示',
    })
    let columns = [...this.selfColumnsBase]
		this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
		// console.log(this.configColumns)
		this.selfColumnsBase.forEach((item) => (item.sortable = true))
    this.option1.columns = columns
    const listAmtSummary2 = Object.assign({}, this.option.listAmtSummary, { show: true })
    this.option2 = Object.assign({}, this.option, {
        id: 'option1', $name: 'prepayEditApply1',
        data: [],
        tips: {
            text: '',
            show: false
        },
        rootTipsHide:true,
        operationBtns:{
          width: '50px',
          show: true,
          fixed:"right",
          data: [
              {
                  label: this.$t('Common.del'),
                  type: 'text',
                  show: true,
                  action: 'Delete'
              },
          ],
          callback: (action, $index, row, option) => {
              if (action === 'Delete') {
                this.option2.data.splice($index, 1)
                this.$refs.prepayEdit.getListAmtSummary(this.option2.data, this.option2)
                if(this.invoiceRegList.length){
                  this.invoiceRegList.forEach((item,index)=>{
                    if(item.invoiceNo + item.invoiceCode === row.invoiceNo + row.invoiceCode ){
                      this.invoiceRegList.splice(index,1)
                    }
                  })
                }
              }
          }
        },
        index: {
            show:true,
        },
        listAmtSummary: listAmtSummary2,
        selection:{
            show:false
        },
        columns :[ // 海外版不显示
            {prop: 'invoiceNo', label: this.$t('FeeList.invoiceNo'), type: 'text', key: 'invoiceNo'},
            {prop: 'title', label: '发票抬头', type: 'text',width:125, key: 'title'},
            {prop: 'writeoffAmt', label: '已核销金额', type: 'text', key: 'writeoffAmt'},
            {prop: 'lockAmt', label: '占用金额', type: 'text', key: 'lockAmt'},
            {prop: 'remainingAmount', label: '剩余可用金额', width:100, type: 'text', key: 'remainingAmount', 
                formatter: ({row}, pItem) => {
                return Math.round((row.amt - row.writeoffAmt - row.lockAmt)*100)/100
                }
            },
            {prop: 'invoiceType', label: '开票类型',width:125, type: 'select', key: 'invoiceType'},
            {prop: 'currency', label: '开票币种', type: 'text', key: 'currency'},
            {prop: 'amt', label: '开票金额', type: 'text', key: 'amt'},
            {prop: 'taxRate', label: '发票税率', type: 'select', propInDict: 'taxRateInfo'},
            {prop: 'rate', label: '开票汇率', type: 'text', key: 'rate'}
        ]
    })
    let _this = this
    this.autocomplete = {
        querySearch: (queryString, cb) => {
            _this.selectedOptionItem = ''
            console.log(_this);
            _this.querySettleUnit({queryString , unitTypes:'supplier', isAdd:true}, cb)
        },
        select: (optionItem, row) => {
            _this.selectedOptionItem = optionItem
            console.log('this.selectedOptionItem:', _this.selectedOptionItem)
            _this.form.recvCorpName = optionItem.value
            _this.form.recvCorpCode = optionItem.key
        },
        change: (val, row) => {
            // 延时150ms获取select中的改变
            setTimeout(() => {
            this.form.currency = ''
            this.form.recvAccountNo = ''
            this.form.recvAccountName = ''
            this.form.recvBankCode = ''
            this.form.recvBankName = ''
            this.form.recvBankBranch = ''
            this.form.recvBankAccountId = ''
            if (_this.selectedOptionItem === '') {
                _this.form.recvCorpName = ''
                _this.form.recvCorpCode = ''
                return
            }
            }, 150)
        }
    }
    //供应商收款账号->收款银行
    let alias = this
    this.autocomplete1 = {
      querySearch: (queryString, cb) => {
          alias.selectedOptionItem = ''
          if(!this.form.recvCorpCode){
            this.$message({
                message: this.$t('OrderFee.plsSelect') + this.$t('OrderFee.enspace') + this.$t('OrderFee.settleCorpName'), // '请先选择结算单位',
                type: 'error',
                showClose: true
            })
            return
          }
          alias.bankAccountList({
            "accountNo": '', // queryString, 
            "receipayType": "pay", 
            "currency": this.form.currency, 
            "unitCode": this.form.recvCorpCode,
            "status": "effect"
          }, cb, true)
      },
      select: (optionItem, row) => {
        // alias.selectedOptionItem = optionItem
        // alias.form.recvAccountName = optionItem.value
        // alias.form.recvAccountNo = optionItem.key
        // this.form.currency = optionItem.currency
        // this.form.recvAccountNo = optionItem.accountNo
        // this.form.recvAccountName = optionItem.accountName
        // this.form.recvBankCode = optionItem.bankCode
        // this.form.recvBankName = optionItem.bankName
        // this.form.recvBankBranch = optionItem.bankBranch
        // this.form.recvBankAccountId = optionItem.settleUnitBankAcctId
        console.log(optionItem)
        this.form.recvAccountNo = ''
        this.form.recvAccountName = ''
        this.form.recvBankCode = ''
        this.form.recvBankBranch = ''
        this.form.recvBankAccountId = ''
        if (optionItem.value) {
          this.bankListByName = this.bankListAll.filter(item => {
            return item.bankName.indexOf(optionItem.value) > -1 // 赵斌将会把 bankName 统一返回英文
            // if (this.$lang === 'zh') {
            //   return item.bankName.indexOf(optionItem.value) > -1
            // } else {
            //   return item.bankEname.indexOf(optionItem.value) > -1
            // }
          })
        }
      },
      change: (val, row) => {
        console.log('change val: ', val)
        if (!val) {
          this.bankListByName = this.bankListAll
        }
        // 延时150ms获取select中的改变
        setTimeout(() => {
          // if(alias.form.recvAccountNo === ''){
          if (!val) {
            alias.form.recvAccountNo = ''
            alias.form.recvAccountName = ''
            alias.form.recvBankCode = ''
            alias.form.recvBankName = ''
            alias.form.recvBankBranch = ''
            alias.form.recvBankAccountId = ''
            alias.form.payAccountShortName = ''
            alias.form.payAccountNo = ''
            alias.form.payAccountName = ''
            alias.form.payBankCode = ''
            alias.form.payBankName = ''
            alias.form.payBankBranch = ''
            alias.form.payBankAccountId = ''
          }
          // if (alias.selectedOptionItem === '') {
          //   alias.form.recvAccountName = ''
          //   alias.form.recvAccountNo = ''
          //   return
          // }
        }, 150)
      }
    }
    //我司付款账号
    let alias2 = this
    this.autocomplete2 = {
        querySearch: (accountShortName, cb) => {
          // if(!this.form.unitCode){
          //   this.$message({
          //       message: '请先选择所属分公司',
          //       type: 'error',
          //       showClose: true
          //   })
          //   return
          // }
          alias2.selectedOptionItem = ''
          let hasIntrabranch = ''
          let hasChequeAcct = ''
          let countryOrgType = this.form.payWay
          let unitCode = ''
          if(this.form.payWay==='intrabranch'){
            hasIntrabranch = "yes"
            countryOrgType = ''
          }
          if(this.form.payWay==='cheque'){
            hasChequeAcct = 'yes'
            countryOrgType = ''
          }
          
          let queryString = {'accountShortName': accountShortName, "receipayType":"pay", hasIntrabranch, hasChequeAcct, 'currency': this.form.currency, countryOrgType, unitCode }
          alias2.companyBankAccountList(queryString, cb)
          // alias2.companyBankAccountList({'accountShortName':queryString, "hasChequeAcct": this.form.payWay === 'cheque' ? 'yes' : '', "receipayType":"pay",'currency':this.form.currency, "countryOrgType":this.form.payWay ==='cheque' ? '' : this.form.payWay , "unitCode": '' }, cb)
        },
        select: (optionItem, row) => {
            console.log(optionItem);
            alias2.selectedOptionItem = optionItem
            alias2.form.payAccountNo = optionItem.value
            alias2.form.payAccountCode = optionItem.key

            this.form.payAccountShortName = optionItem.accountShortName
            this.form.settleCompName = optionItem.unitName
            this.form.settleCompCode = optionItem.unitCode
            this.form.payAccountNo = optionItem.accountNo
            this.form.payAccountName = optionItem.accountName
            this.form.payBankCode = optionItem.bankCode
            this.form.payBankName = optionItem.bankName
            this.form.payBankBranch = optionItem.bankBranch
            this.form.payBankAccountId = optionItem.settleUnitBankAcctId
            this.form.bankAccountSettleModeList = optionItem.settleMode.map((item) => {
              let dict = this.dictMap.bankAccountSettleMode
              return dict.find((v) => v.value === item)
            })
        },
        change: (val, row) => {
            // 延时150ms获取select中的改变
            setTimeout(() => {
              if(alias2.selectedOptionItem === ''){
                alias2.form.payAccountCode = ''
                alias2.form.payAccountNo = ''
                this.form.payAccountShortName = ''
                this.form.payAccountNo = ''
                this.form.payAccountName = ''
                this.form.payBankCode = ''
                this.form.payBankName = ''
                this.form.payBankBranch = ''
                this.form.payBankAccountId = ''
                return
              }
                    
            }, 150)
        }
    }
    //结算单位
    let alias3 = this
    this.autocomplete3 = {
      querySearch: (queryString, cb) => {
        alias3.selectedOptionItem = ''
        alias3.querySettleUnit({queryString,'unitTypes':'customer,supplier,company',isAdd:true}, cb)
      },
      select: (optionItem, row) => {
        alias3.selectedOptionItem = optionItem
        console.log('this.selectedOptionItem:', alias3.selectedOptionItem)
        alias3.form.recvCorpName = optionItem.value
        alias3.form.recvCorpCode = optionItem.key
      },
      change: (val, row) => {
        // 延时150ms获取select中的改变
        setTimeout(() => {
          this.form.recvAccountNo = ''
          this.form.recvAccountName = ''
          this.form.recvBankCode = ''
          this.form.recvBankName = ''
          this.form.recvBankBranch = ''
          this.form.recvBankAccountId = ''
          if (alias3.selectedOptionItem === '') {
            alias3.form.recvCorpName = ''
            alias3.form.recvCorpCode = ''
            return
          }
        }, 150)
      }
    }
    //所属分公司
    let alias4 = this
    this.autocomplete4 = {
        querySearch: (queryString, cb) => {
            alias4.selectedOptionItem = ''
            console.log(queryString);
            alias4.querySettleUnit({"accountNo":queryString , "status":"customer", isAdd:true}, cb)
        },
        select: (optionItem, row) => {
            console.log(optionItem);
            alias4.selectedOptionItem = optionItem
            this.form.unitCode = optionItem.key
        },
        change: (val, row) => {
            // 延时150ms获取select中的改变
            setTimeout(() => {
                this.form.payAccountShortName = ""
                this.form.settleCompName = ""
                this.form.settleCompCode = ""
                this.form.payAccountNo = ""
                this.form.payAccountName = ""
                this.form.payBankCode = ""
                this.form.payBankName = ""
                this.form.payBankBranch = ""
                this.form.payBankAccountId = ""

                this.form.unitCode = ''
                alias4.form.payCompName = ''
                return
            }, 150)
        }
    }
    if (!this.searchOption1.saveShow) {
      this.getData()
    }
    this.cTimestamp = new Date().getTime()
  },
  methods: {
    presentPaperBill(val) {
      let title = val === 'yes' ? this.$t('PayApplyList.presentedPaperBill') : this.$t('PayApplyList.cancelPaperBill') // '交单' : '撤单'
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose(this.$t('OrderFee.selectRow')) // `请勾选需要${title}的项！`
      }
      let presentedPaperBills = this.multipleSelection1.map((item) => item.presentedPaperBill)
      if (val === "yes" && presentedPaperBills.includes('yes')) {
        return this.$msgErrClose(this.$t('PayApplyList.containPresented')) // '所选数据包含已交单数据，请检查！'
      }
      if (val === "no" && presentedPaperBills.includes('no')) {
        return this.$msgErrClose(this.$t('PayApplyList.containUnpresented')) // '所选数据包含未交单数据，请检查！'
      }
      this.$confirm(`${this.$t('OrderFee.confirmTip')}${title}？`, this.$t('OrderFee.tip'), { // `是否确认${title}？`
        confirmButtonText: this.$t('OrderFee.confirm'), // '是'
        cancelButtonText: this.$t('OrderFee.cancel'), // '否'
        type: 'warning'
      }).then(() => {
        let data = {
          applyNos: this.multipleSelection1.map(item => item.applyNo),
          presentedPaperBill: val
        }
        prePresentedPaperBill(data).then(res => {
          this.$message({message: `${title}${this.$t('OrderFee.success')}`, type: 'success'}) // `${title}成功`
          this.getData()
        })
      }).catch((err) => {
        console.log(err)
      })
    },
    // // 所属员工下拉框
    // getEmployeeList(queryString, item) {
    //   employeeSelectlist({ name: queryString, deptCodes: this.compCode }).then((res) => {
    //     if (
    //       this.remoteSelectCommon(
    //         item,
    //         res.data.map((item) => ({ label: `${item.cname} (${item.employeeNo})`, value: item.employeeId }))
    //       )
    //     )
    //       return
    //     let list = res.data.map((item) => ({ ...item, label: `${item.cname} (${item.employeeNo})`, value: item.employeeId }))
    //     this.employeeOptions.splice(0, 1000, ...list)
    //   })
    // },
    submit() {
    },
    handleCancelPayApply(){
      let len = this.multipleSelection1
      if (len.length === 0) {
        return this.$msgErrClose(this.$t('OrderFee.selectRow')) // '请勾选需要撤回申请的项！'
      }
      for (let i = 0; i < len.length; i++) {
        if(len[i].confirmStatus !== 'pending'){
          return this.$msgErrClose(this.$t('PayApplyList.containNonpending')) //'所选数据中包含非待审批状态，请重新选择！'
        }
        // if(len[i].payStatus !== 'paying' && len[i].payStatus !== 'pay_done'){
        //   return this.$msgErrClose('所选数据中非包含支付中或已支付，请重新选择！')
        // }
      }
      let applyNos = len.map(item=>{
        return item.applyNo
      })
      let data = {
        applyNos
      }
      this.$confirm(this.$t('OrderFee.confirmCancelApply'), this.$t('OrderFee.tip'), { // '是否确认撤回申请？'
        confirmButtonText: this.$t('OrderFee.confirm'),
        cancelButtonText: this.$t('OrderFee.cancel'),
        cancelButtonClass: 'btn-custom-cancel',
        type: 'warning'
      }).then(() => {
        cancelPayApplyPrepay(data).then(res=>{
        this.$message({message: this.$t('OrderFee.successOp'), type: 'success'}); // '撤回申请成功'
          this.getData()
        })
      })
    },
    handleSizeChange(val){
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val){
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    handleApplyPass(data){
      if(data.value === 'pass'){
        this.handleApplyFor('pass')
      }
      if(data.value === 'passPrint'){
        if (this.multipleSelection1.length === 0) {
          this.$message({
            message: this.$t('OrderFee.selectRow'), // '请勾选需要申请通过的项！',
            type: 'error',
            showClose: true
          })
          return
        }
        if (this.multipleSelection1.length > 1) {
          this.$message({  message: this.$t('PayApplyList.prepayNotBatchPrint'),  type: 'error',  showClose: true }) // '打印目前不支持批量打印，请勾选一只进行申请通过并打印！'
          return
        }
        this.handleApplyFor('pass', 'passPrint')
      }
    },
    handleApplyFor(confirmStatus, flag) {
      if (this.multipleSelection1.length === 0) {
        this.$message({
          message: this.$t('OrderFee.selectRow'), // '请勾选需要'+( confirmStatus=='pass'?"申请通过":'申请拒绝' )+'的项！',
          type: 'error',
          showClose: true
        })
        return
      }
      for(let i = 0; i <this.multipleSelection1.length;i++){
        if (this.multipleSelection1[i].confirmStatus !== 'pending') {
          this.$message({  message: ''+this.multipleSelection1[i].applyNo+this.$t('PayApplyList.notRepeatOp'),  type: 'error',  showClose: true  }) // '已处理，请不要重复操作'
          return
        }
      }
      
      this.query.applyNos = this.multipleSelection1.map(item => {
        return item.applyNo
      })
      this.query.confirmStatus =  confirmStatus
      this.query.refuseReason = ''
      if(confirmStatus==="pass"){
          // for (let i = 0; i < this.multipleSelection1.length; i++) { // 海外版不需要
          //   if(this.multipleSelection1[i].currency === 'USD' && this.multipleSelection1[i].payWay === 'chinese_mainland'){
          //     if(this.multipleSelection1[i].hasInvoice !== "yes"){
          //       return this.$msgErrClose('支付方式为“国内”，币种为USD时，开票状态为已开票才能审批通过')
          //     }
          //   }
          // }
          this.$confirm(this.$t('OrderFee.confirmPassApply'), this.$t('OrderFee.tip'), { // '您确定要审核通过预付款申请吗?', "警告"
            confirmButtonText: this.$t('OrderFee.confirm'),
            cancelButtonText: this.$t('OrderFee.cancel'),
            lockScroll: "true",
            type: "warning"
          }).then(()=> {
              return approvePrepayApply(this.query);
          }).then(() => {
              this.getData()
              this.$message({message: this.$t('OrderFee.successOp'), type: 'success'}); // '审核通过提交成功'
              if(flag === 'passPrint'){
                this.$emit('update:isJumpRouteFromPage', true)
                let applyNo = this.multipleSelection1[0].applyNo
                this.$router.push({
                  name: "PayPrepayPrint",
                  query: { applyNo }
                })
              }
          }).catch(function() {});
      }else{
        this.rejectDialogVisible = true
      }
      
    },
    rejectSubmit() {
      this.$refs.query.validate(valid => {
        if (valid) {
          this.query.loading = true
          approvePrepayApply(this.query).then(res=>{
            this.getData()
            this.rejectDialogVisible = false
            this.$message({message: this.$t('OrderFee.successOp'), type: 'success'}); // '拒绝申请提交成功'
          }).finally(()=>{
            this.query.loading = false
          })
        }
      })
    },
    handlePrepay() {
      Object.assign(this.form,{},defaultCreateQuery)
      this.dialogVisible = true
      this.invoiceRegList = []
      // let query = {
      //   source: 'createPayPrepayFrom'
      // }
      // this.routerPush('PrepayEdit', query)
    },
    querySettleUnit(queryString, cb) {
      this.$store.dispatch('dict/querySettleUnit', queryString).then(data => {
        cb(data)
      })
    },
    getData(params, isSearch) {
      this.loading = true
      let data ={
        "currPage": this.option1.pagination.currPage,
        "pageSize": this.option1.pagination.pageSize,
        "columns":[],
        "ascColumns": params && params.order === 'ascending' ? [params.prop] : [],
        "descColumns": params && params.order === 'descending' ? [params.prop] : [],
        "query":[]
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(
        data.query,
        this.searchOption1,
        false,
        "rangeMinMax"
      );
      // this.searchOption1.addFilter.searchInputGroup.forEach((item) => {
      //   let { key, value, range, req, valueReq } = item
      //   if (range.min || range.max) {
      //     if (range.min) {
      //       data.query.push({
      //         column: key + 'Min',
      //         type: 'eq',
      //         value: range.min,
      //       })
      //     }
      //     if (range.max) {
      //       data.query.push({
      //         column: key + 'Max',
      //         type: 'eq',
      //         value: range.max,
      //       })
      //     }
      //     return
      //   }
      //   if (!value) return
      //   if (typeof value !== 'object') {
      //     if(valueReq && item[valueReq] && item.key === 'recvCorpName' && item.value !== ''){
      //       data.query.push({
      //         column: valueReq,
      //         type: 'eq',
      //         value:  item[valueReq],
      //       })
      //       console.log(item[valueReq]);
      //     }
      //     return data.query.push({
      //       column: key,
      //       type: 'eq',
      //       value: req || value,
      //     })
      //   }
      //   if (key === 'recvCorpCode' || key === 'payStatus' || key === 'settleMode' || key === 'prepayDedueStatus' || key === 'payWay') {
      //     if (!value.length) return
      //     data.query.push({
      //       column: key,
      //       type: 'eq',
      //       value: value.join(','),
      //     })
      //   }else{
      //     data.query.push({
      //       column: key + 'Start',
      //       type: 'eq',
      //       value: dateFormat('yyyy-mm-dd', value[0]),
      //     })
      //     data.query.push({
      //       column: key + 'End',
      //       type: 'eq',
      //       value: dateFormat('yyyy-mm-dd', value[1]),
      //     })
      //   }
      // })

      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (this.buttonSearch) {
        data.query.push({ column: 'confirmStatus', type: 'eq', value: this.buttonSearch })
      }
      if(isSearch){
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      queryPrepayApplyPage(data).then(res => {
        if (res.code === 0) {
          this.finCommonColumns(res)
          // if (res.data.configColumns && res.data.configColumns.length) {
          //   let columns = res.data.configColumns
          //   this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
          //   this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
          //   this.configColumns = res.data.configColumns
          // }
          let { list } = res.data
          let data = []
          list.forEach(item => {
            // Object.assign(item,item.payInfo)
            item.payOrderNo_multiValue = item.payOrderNo.split(',')
            item.invoiceNos_multiValue = item.invoiceNo.split(',').map(subItem => {
							let arr = subItem.split('/')
							return arr[1] ? arr[1] : arr[0]
						})
						item.invoiceReceivableIds_multiValue = item.invoiceNo.split(',').map(subItem => {
							let arr = subItem.split('/')
							return arr[0]
						})
            data.push(item)
          })
          this.option1.data = data
          this.table1DataBackup = [
            ... this.option1.data
          ]
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = res.data.currPage
          // this.option1.pagination.pageSize = res.data.pageSize
          // this.option1.pagination.totalCount = res.data.totalCount
        }
      }).finally(() => {
				this.loading = false
			})
      // this.debounceLs(() => {
      //   this.getListAmtSummary(data)
      // })
    },
    getListAmtSummary(data) {
      queryPrepayApplyPageSummary(data).then(res => {
        if (res.code === 0 && res.data) {
          let labelObj = {
            payAmtSummaryListLabel: this.$t('PayApplyList.prepayAmt'), // '预付款金额',
            balanceAmtSummaryListLabel: this.$t('PayApplyList.balance'), // '剩余可用余额'
          }
          let colorObj = {
            payAmtSummaryListColor: 'green', // 支持red, green, black三种值
            balanceAmtSummaryListColor: 'red'
          }
          let data = res.data
          this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
            show: true,
            data,
            labelObj,
            colorObj
          })
        }
      })
    },
  //   getListAmtSummary2(val) {
  //     // if (val.length) {
  //     let realpayAmtTotalList = []
  //     let balanceTotalList = []
  //     let list = val
  //     let currencyList = [...new Set(list.map(item => item.currency))]
  //     currencyList.forEach(item => {
  //         let arr = list.filter(keys => keys.currency === item)
  //         let sum = arr.reduce((a, b) => Number(a) + Number(b.amt), 0)
  //         if(sum && item){
  //         realpayAmtTotalList.push({
  //             currency: item,
  //             amt: Math.round(sum*100)/100
  //         })
  //         }
  //         let sum1 = arr.reduce((a, b) => Number(a) + decimalFixed2(b.amt - b.writeoffAmt - b.lockAmt), 0)
  //         if(sum1 && item){
  //         balanceTotalList.push({
  //             currency: item,
  //             amt: Math.round(sum1*100)/100
  //         })
  //         }
          
  //     })
  //     console.log(realpayAmtTotalList);
  //     console.log(balanceTotalList);

  //     let data = {
  //         realpayAmtTotalList,
  //         balanceTotalList
  //     }
  //     console.log(data);
  //     const labelObj = {
  //         realpayAmtTotalListLabel: '开票金额',
  //         balanceTotalListLabel: '剩余可用金额'
  //     }
  //     const colorObj = {
  //         realpayAmtTotalListColor: 'red', // 支持red, green, black三种值
  //         balanceTotalListColor: 'green'
  //     }
  //     this.option2.listAmtSummary = Object.assign(
  //         this.option2.listAmtSummary,
  //         {
  //         show: true,
  //         data,
  //         labelObj,
  //         colorObj
  //         }
  //     )
  //     // }
  // },
    setBankListByName(val) {
      this.bankListByName = val
    },
    sendMulti(data, option) {
      if (option === this.option1) this.multipleSelection1 = data
      let data2 = {
				"ascColumns": [],
				"descColumns": [],
				"query": []
			}
			let ids = this.multipleSelection1.map(item => {
				return item.applyNo
			}).join(',')
			if (ids) {
				data2.query.push({
					"column": "applyNoList",
					"type": "eq",
					"value": ids
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
      this.getData(null, true)
      if (index || index === 0) {
        this.rightFilterBtns = [false, false, false]
        this.rightFilterBtns[index] = true
      }
    },
    showDetail(row) {
      let query = {
        source: 'createRegPrepayFrom',
        applyNo:row.applyNo
      }
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({  
        name: 'PrepayDetail',
        query
      })
      // this.routerPush('PrepayDetail', query)
    },
    handleDedueDetail(row){
      let query = {
        applyNo:row.applyNo
      }
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({  
        name: 'PrepayDedueDetail',
        query
      })
    },
    openReceivableDetail(payload) {
      this.showBillDetail = payload.show
      if(payload.getData) this.getData()
    },
    closeDialogVisible(val, isBreak){
      this.dialogVisible = val
      if(isBreak===true){
        this.getData()
      }
    },
    bankAccountList(queryString, cb, isRecvBankName) {
      this.$store.dispatch('dict/bankAccountList', queryString).then((data) => {
        console.log(data);
        console.log(isRecvBankName)
        if (isRecvBankName) {
          this.bankListAll = data
          this.bankListByName = this.bankListAll // 初始时显示全部
          let bankNameList = data.map(item => item.bankName) // item.bankEname || item.bankName
          bankNameList = [ ... new Set(bankNameList) ]
          console.log(bankNameList)
          let list = bankNameList.map((item, index) => {
            return {
              value: item,
              key: index
            }
          })
          if (bankNameList.length === 1) {
            let listSame = this.bankListAll.filter(item => item.bankName === bankNameList[0])
            if (listSame.length === 1) {
              let optionItem = listSame[0]
              // this.form.recvAccountName = optionItem.value
              // this.form.recvAccountNo = optionItem.key
              this.form.recvAccountNo = optionItem.accountNo
              this.form.recvAccountName = optionItem.accountName
              this.form.recvBankCode = optionItem.bankCode
              this.form.recvBankName = optionItem.bankName
              this.form.recvBankBranch = optionItem.bankBranch
              this.form.recvBankAccountId = optionItem.settleUnitBankAcctId
            }
          }
          cb && cb(list)
        } else {
          cb && cb(data)
        }
      })
    },
    companyBankAccountList(queryString, cb) {
      this.$store.dispatch('dict/companyBankAccountList', queryString).then((data) => {
          cb(data)
      })
    },
    //关闭取消申请按钮
    handleCancel(){
      this.$refs.query.resetFields()
      this.rejectDialogVisible = false
    },
    //关联发票 // 海外版不显示
    handleRelationInvoice(){
      let list = this.multipleSelection1
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose('请勾选需要预付款申请单！')
      }
      
      for (let i = 0; i < list.length; i++) {
        if (this.multipleSelection1[i].status === 'refuse') {
          return this.$msgErrClose(list[i].applyNo+'审核拒绝状态，不允许关联发票！')
        }
        if(list[0].currency !== list[i].currency){
          return this.$msgErrClose('相同币种才能进行关联发票！请重新选择！')
        }
        if(list[0].recvCorpCode !== list[i].recvCorpCode){
          return this.$msgErrClose('相同结算单位才能进入关联发票！请重新选择！')
        }
      }
      // this.searchOption1.data.currency = this.payInfo.currency.split(',')
    
      Object.assign(this.relationInvoiceForm,{},this.multipleSelection1[0])
      this.relationInvoiceForm.payInfoId = this.multipleSelection1.map(item=>{
        return item.payInfoId
      })
      this.relationInvoiceForm.supplierAccountNo = this.multipleSelection1[0].recvAccountNo
      this.relationInvoiceForm.name = "prepay"
      this.relevanceOpne = true
    },
    closeDialogVisibleRelationInvoice(val,isBreak){
      this.relevanceOpne = val
      if(isBreak===true){
        this.getData()
      }
    },
    // 自定义表头
		handleCustomColumns () {
			this.customColumnsPopShow = true
		},
    //发票登记 // 海外版不显示
    addInvoice() { 
      let list = this.multipleSelection1
      if (this.multipleSelection1.length === 0) {
        this.$message({  message: '请勾选预付款单需要登记的项！',  type: 'error',  showClose: true })
        return
      }
      // if (this.multipleSelection1.length > 1) {
      //   this.$message({  message: '一次勾选一只预付款单需要登记的项！',  type: 'error',  showClose: true })
      //   return
      // }
      for (let i = 0; i < list.length; i++) {
        if(list[0].currency !== list[i].currency){
          return this.$msgErrClose('相同币种才能进进行关联发票！请重新选择！')
        }
        if(list[0].recvCorpCode !== list[i].recvCorpCode){
          return this.$msgErrClose('相同结算单位才能进行关联发票！请重新选择！')
        }
        if (list[i].status === 'refuse') {
          return this.$msgErrClose(list[i].applyNo+'审核拒绝状态！不允许发票登记')
        }
        if(list[i].hasInvoice === 'yes'){
          return this.$message({  message: list[i].applyNo+'单已开票！请勿重复发票登记',  type: 'error',  showClose: true })
        }
      }
      let isInvoiceNo = this.multipleSelection1[0].invoiceNo.split(',').map(subItem => {
        let arr = subItem.split('/')
        
        return arr[0]
      })
      let query = {
        titleName:'发票登记',
        name:'SettleList',
        currency: this.multipleSelection1[0].currency ,
        amt: this.multipleSelection1[0].delayInvoiceAmt,
        recvAccountNo: this.multipleSelection1[0].recvAccountNo,
        supplierCorpName: this.multipleSelection1[0].recvCorpName,
        supplierCorpCode: this.multipleSelection1[0].recvCorpCode,
        payApplyPrepayNoList : this.multipleSelection1.map(item=>{
          return item.applyNo
        }),
        settleCompCode: this.multipleSelection1[0].settleCompCode,
        isRepeatInvoiceNo: this.isRepeat(isInvoiceNo),
        recvBankAccountId: this.multipleSelection1[0].recvBankAccountId,
      }
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({  
        name: 'InvoicePaymentListReg',
        query
      })
    },
    handleAddInvoice(query){
      this.req = randomString() + "prepayEditApply"
      query.req = this.req
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({  
          name: 'InvoicePaymentListReg',
          query
      })
    },
    isRepeat(arr){
      var hash = {};
      for(var i in arr) {
        if(hash[arr[i]]){
          return true;
        }
          hash[arr[i]] = true;
      }
      return false;
    },
    closeDialogVisibleInvoice(val, isBreak){
      this.dialogVisibleInvoice = val
      if(isBreak===true){
        this.getData()
      }
    },
    //批量下载 // 海外版不显示
    handleDownLoadInvoice(){ 
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose('请勾选需要下载预付款发票的项！')
      }
      for (let i = 0; i < this.multipleSelection1.length; i++) {
        if (this.multipleSelection1[i].hasInvoice !== 'yes') {
          return this.$msgErrClose('只有已开票状态才能批量下载！请重新选择！')
        }
      }
      let data = {
        applyNos : this.multipleSelection1.map((item, index) => {
          return item.applyNo 
        }),
      }
      let invoiceNoList = []
      for (let i = 0; i < this.multipleSelection1.length; i++) {
        if(!this.multipleSelection1[i].invoiceNo){
          invoiceNoList.push(this.multipleSelection1[i].applyNo)
        }
      }
      this.$confirm(invoiceNoList.length ? '您有'+invoiceNoList.toString()+'付款申请号未关联发票，不能被下载，是否确认下载已关联的发票！' : '您是否确定批量下载发票吗?' , "下载发票", {
        showCancelButton: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: "true",
        type: "warning",
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = '执行中...';
            this.$store
            .dispatch('finance/downloadBlobFilePost', {
              uri: '/fin/pay/prepay/downLoadInvoice',
              data:{data},
            })
            .then((res) => {
              console.log(res);
              let link = document.createElement('a');
              link.href = window.URL.createObjectURL(res);
              link.download = '发票.pdf';
              link.click();
              done();
              instance.confirmButtonLoading = false;
            })
            .catch((err)=> {
              done();
              instance.confirmButtonLoading = false;
            })
          } else {
            done();
          }
        }
      }).then(()=> {
      }).catch(()=> {
      })
    },
    downLoadInvoice(data){
      
    },
    // 打印
		handlePrint () {
			let len = this.multipleSelection1.length
			if (!len) {
				return this.$msgErrClose(this.$t('OrderFee.selectOneRow')) // '请先勾选1条数据，再进行打印！'
			}
			if (len > 1) {
				return this.$msgErrClose(this.$t('OrderFee.selectOneRow')) // '一次只能勾选1条数据进行打印，请重新选择！'
			}
			this.$emit('update:isJumpRouteFromPage', true)
			let applyNo = this.multipleSelection1[0].applyNo
			this.$router.push({
				name: "PayPrepayPrint",
				query: { applyNo }
			})
		},
    //导出按钮
		handleExport (exportType) {
			let data ={
        "currPage": this.option1.pagination.currPage,
        "pageSize": this.option1.pagination.pageSize,
        "columns":[],
        "ascColumns": this.ascColumns,
        "descColumns": this.descColumns,
        "query":[]
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(
        data.query,
        this.searchOption1,
        false,
        "rangeMinMax"
      );
      // this.searchOption1.addFilter.searchInputGroup.forEach((item) => {
      //   let { key, value, range, req, valueReq } = item
      //   if (range.min || range.max) {
      //     if (range.min) {
      //       data.query.push({
      //         column: key + 'Min',
      //         type: 'eq',
      //         value: range.min,
      //       })
      //     }
      //     if (range.max) {
      //       data.query.push({
      //         column: key + 'Max',
      //         type: 'eq',
      //         value: range.max,
      //       })
      //     }
      //     return
      //   }
      //   if (!value) return
      //   if (typeof value !== 'object') {
      //     if(valueReq && item[valueReq] && item.key === 'recvCorpName' && item.value !== ''){
      //       data.query.push({
      //         column: valueReq,
      //         type: 'eq',
      //         value:  item[valueReq],
      //       })
      //       console.log(item[valueReq]);
      //     }
      //     return data.query.push({
      //       column: key,
      //       type: 'eq',
      //       value: req || value,
      //     })
      //   }
      //   if (key === 'recvCorpCode' || key === 'payStatus' || key === 'settleMode' || key === 'prepayDedueStatus') {
      //     debugger
      //     if (!value.length) return
      //     data.query.push({
      //       column: key,
      //       type: 'eq',
      //       value: value.join(','),
      //     })
      //   }else{
      //     data.query.push({
      //       column: key + 'Start',
      //       type: 'eq',
      //       value: dateFormat('yyyy-mm-dd', value[0]),
      //     })
      //     data.query.push({
      //       column: key + 'End',
      //       type: 'eq',
      //       value: dateFormat('yyyy-mm-dd', value[1]),
      //     })
      //   }
      // })

      if (this.multipleSelection1.length) {
        data.query = [
          { column: 'applyNo', type: 'in', value: this.multipleSelection1.map((v) => v.applyNo).join(',') },
        ]
      }
      //查询对象的配置编码
      data.query.push({
				"column": 'queryDataModuleCode',
        "type": "eq",
        "value": exportType.value
			})
			this.$confirm(this.$t('OrderFee.confirmTip') + this.$t('OrderFee.exportLower') + this.$t('OrderFee.enspace') + exportType.label+'?', this.$t('OrderFee.tip'), { // '是否确认导出预付款申请单', "导出"
        showCancelButton: true,
				confirmButtonText: this.$t('OrderFee.confirm'),
				cancelButtonText: this.$t('OrderFee.cancel'),
				lockScroll: "true",
				type: "warning",
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = `${this.$t('OrderFee.processing')}...`; // 执行中
            setTimeout(() => {
              this.option1.loading = true
              this.$store
                .dispatch('finance/downloadBlobFilePost', {
                  uri: '/fin/common/queryDataExportExcel',
                  data: { data },
                })
                .then((res) => {
                  this.option1.loading = false
                  console.log(res);
                  let link = document.createElement('a')
                  link.href = window.URL.createObjectURL(res)
                  link.download = exportType.label+'.xlsx' // '预付款申请单'+
                  link.click()
                  done();
                  instance.confirmButtonLoading = false;
                }).catch(() => {
                  this.option1.loading = false
                  this.$message({ message: this.$t('OrderFee.exportFailed'), type: 'error' }) // '导出失败'
                  done();
                  instance.confirmButtonLoading = false;
                })
            }, 30);
          } else {
            done();
          }
        }
			}).then(() => {
				
			}).catch(() => {
			})
		},
  },
  watch: {
    //监听点击过来获取数据
    // isJumpRouteFromPage:{
    //   handler(val){
    //     if(!val){
    //       this.$nextTick(()=>{
    //         this.getData()
    //       })
    //     }
    //   }
    // }
  },
  activated() {
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache || (this.$route.meta.refresh && timestamp - this.cTimestamp > 300)) {
      this.handleCurrentChange(1)
    }
    let data = JSON.parse(sessionStorage.getItem(this.req));
      console.log(data);
      if(data && data.length){
        for (let i = 0; i < data.length; i++) {
          this.option2.data.push(data[i])
          this.invoiceRegList.push(data[i])
        }
      }
      // 清除sessionStorage
      sessionStorage.removeItem(this.req)
    
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    BillDetail,
    prepayEdit,
    RegisterInvoice,
    RelationInvoice,
    CustomColumns
  }
}
</script>
<style lang='scss' scoped>
.prepay{
  .batch-print-create .el-dialog__body {
    padding: 40px 80px 22px;
  }
  .batch-print-create .el-dialog__footer{
    padding-bottom: 32px;
    text-align: center;
  }
  .batch-print-create .el-form .el-input{
    width: 320px;
  }
  .manual-regist-invoice .el-form .el-date-editor.el-input{
    width: 162px;
  }
  .manual-regist-invoice .el-form .el-select{
    width: 162px;
  }
  .prepay-select-box .el-dropdown {
    color: #fff;
    border-color: #33b18a;
    .el-dropdown-link {
      background: #33b18a;
    }
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
.btn-custom-cancel {
  float: right;
  margin-left: 10px;
}
</style>

