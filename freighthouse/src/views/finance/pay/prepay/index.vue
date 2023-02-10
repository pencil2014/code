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
            <el-button type="primary" class="finance-btn" v-if="checkAuth($route.name, 'tab-prepayList', 'btn-prepayPrepay')" @click="handlePrepay" size="mini">预付款申请</el-button>
          </el-button-group>
          <el-button-group v-if="checkAuth($route.name, 'tab-prepayList', 'btn-prepayPass')" type="success">
            <div class="select-template-box prepay-select-box">
              <el-dropdown trigger="click" @command="handleApplyPass">
                <span class="el-dropdown-link">
                  申请通过<i class="el-icon-arrow-down el-icon--right"></i>
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
            <el-button  type="danger" class="finance-btn" v-if="checkAuth($route.name, 'tab-prepayList', 'btn-prepayRefuse')" @click="handleApplyFor('refuse')" size="mini">申请拒绝</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" v-if="checkAuth($route.name, 'tab-prepayList', 'btn-cancelPayApply')"  size="mini" @click="handleCancelPayApply" type="purple"
            >撤回申请</el-button
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
                导出<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-for="(item, index) in exportTypeList" :key="'exportTypeList' + index"
                    :command="item">
                    导出{{item.label}}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </el-button-group>
          <el-button-group>
						<el-button class="finance-btn" v-if="checkAuth($route.name, 'tab-prepayList', 'btn-prepayPrint')" size="mini" @click="handlePrint"
							>打印</el-button
						>
					</el-button-group>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button
              @click="handleRefund"
              class="finance-btn"
              size="mini"
            >预付退款</el-button>
					</el-button-group>
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
            <el-button class="finance-btn" v-if="checkAuth($route.name, 'tab-settleList', 'btn-presentPaperBill')" @click="presentPaperBill('yes')" size="mini">交单</el-button>
            <el-button class="finance-btn" v-if="checkAuth($route.name, 'tab-settleList', 'btn-retractPaperBill')" @click="presentPaperBill('no')" size="mini">撤单</el-button>
          </el-button-group>

          <el-button-group>
            <el-button class="finance-btn" v-if="checkAuth($route.name, 'tab-prepayList', 'btn-prepayRelationInvoice')" @click="handleRelationInvoice" size="mini">关联发票</el-button>
            <el-button class="finance-btn" v-if="checkAuth($route.name, 'tab-prepayList', 'btn-prepayAddInvoice')" @click="addInvoice" size="mini">发票登记</el-button>
          </el-button-group>

          <el-button-group>
            <el-button class="finance-btn" v-if="checkAuth($route.name, 'tab-prepayList', 'btn-prepayDownLoadInvoice')" @click="handleDownLoadInvoice" size="mini">批量下载发票</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              @click="refreshListPage"
              size="mini"
              type="primary"
            >刷新</el-button>
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
    :title="'申请不通过'"
    :visible.sync="rejectDialogVisible"
    :before-close="handleCancel"
    width="600px">
    <el-form :model="query" ref="query" label-width="80px"  class="el-form-item-payapply-remark" required >
    <el-form-item label="拒绝原因"
      prop="refuseReason"
      :rules="{required: true, message: '拒绝原因不能为空', trigger: 'blur'}">
      <el-input type="textarea" placeholder="请输入拒绝原因" maxlength="200" show-word-limit v-model="query.refuseReason"></el-input>
    </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" :loading='query.loading' @click="rejectSubmit" size="mini">确定</el-button>
      <el-button @click="handleCancel" size="mini">取消</el-button>
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
    :req="reqIdentify"
    ref="prepayEdit"
    @handle-add-invoice='handleAddInvoice'
    @setBankListByName="setBankListByName"
    @close-dialog-visible='closeDialogVisible'
    @goIdentifyElecInvoice="goIdentifyElecInvoice" />
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
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { queryPrepayApplyPage, approvePrepayApply, queryPrepayApplyPageSummary, cancelPayApplyPrepay, prePresentedPaperBill } from '@/api/fin/pay.js'
import { randomString } from '@/utils'

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
  data() {
    return {
      pageSizeUrl: queryPrepayApplyPage('geturl'),
      keyDownActive: true,
      invoiceRegList:[],
      req:'',
      reqIdentify: '',
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
          label: '预付款申请号',
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
          label: '结算单位',
          width: 150,
          type: 'text',
        },
        {
          prop: 'confirmStatus',
          label: '审核状态',
          width:90,
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
          label: '收款账号',
          type: 'text',
          width: 125,
        },
        {
          prop: 'recvBankName',
          label: '收款银行',
          width:'124px',
          type: 'text',
        },
        {
          prop: 'recvBankBranch',
          label: '收款银行支行',
          type: 'text',
          width: 120,
        },
        {
          prop: 'recvAccountName',
          label: '收款账户名',
          width:'124px',
          type: 'text',
        },
        {
          prop: 'currency',
          label: '币种',
          type: 'select',
        },
        {
          prop: 'applyPayAmt',
          label: '金额',
          type: 'text',
        },
        {
          prop: 'refundAmt',
          label: '退款金额',
          type: 'text',
        },
        {
          prop: 'payWay',
          label: '付款方式',
          type: 'select',
          propInDict:'payWay',
        },
        {
          label: '账户结算方式',
          type: 'select',
          prop: 'settleMode',
          propInDict: 'bankAccountSettleMode',
          width: 100,
          multi: true,
        },
        // {
        //   prop: 'payCompName',
        //   label: '所属分公司',
        //   type: 'text',
        //   width:"125px",
        // },
        {
          prop: 'payAccountName',
          label: '付款账户名',
          type: 'text',
          width: 150,
        },
        {
          prop: 'payBankName',
          label: '付款银行',
          type: 'text',
          width: 125,
        },
        {
          prop: 'payAccountNo',
          label: '付款账号',
          type: 'text',
          width: 125,
        },
        {
          prop: 'payDate',
          label: '付款时间',
          type: 'text',
          width: 125,
        },
        {
          prop: 'hasInvoice',
          label: '开票状态',
          type: 'select',
          propInDict:"payRelaInvoiceStatus"
        },
        {
          prop: 'sourceType',
          label: '预付款来源',
          type: 'select',
          propInDict:"prepayApplySourceType"
        },
        {
          prop: 'invoiceNos',
          label: '发票号',
          type: 'columnTip',
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps, index) => {
                let row = componentProps.row
                let invoiceReceivableIds = row.invoiceReceivableIds_multiValue ? row.invoiceReceivableIds_multiValue : row.invoiceNos_multiValue
                let invoiceReceivableId = invoiceReceivableIds[index]
                console.log(invoiceReceivableId);
                if(!invoiceReceivableId) return
                let query = {
                  invoicePaymentId:invoiceReceivableId,
                  // invoiceNo: row && row.invoiceNo ? row.invoiceNo :invoiceNo
                }
                // this.routerPushTab('InvoicePaymentListDetail', query)
                this.$emit('update:isJumpRouteFromPage', true)
                  this.$router.push({
                    name: 'InvoicePaymentListDetail',
                    query
                  })
                this.invoicePreviewForm.invoicePaymentId = invoiceReceivableId
                this.invoicePreviewOpne = true
              }
          },
        },
        {
          prop: 'invoiceAmt',
          label: '已开票金额',
          type: 'text',
        },
        {
          prop: 'delayInvoiceAmt',
          label: '未开票金额',
          type: 'text',
        },
        {
          prop: 'prepayDedueStatus',
          label: '抵账状态',
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
          }
        },
        {
          prop: 'payStatus',
          label: '付款状态',
          type: 'select',
          propInDict:"payStatusType"
        },
        {
          prop: 'payOrderNo',
          label: '付款单号',
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
          label: '剩余可用金额',
          type: 'text',
          width: 95,
        },
        // {
        //   prop: 'realpayAmt',
        //   label: '预付金额',
        //   type: 'text',
        // },
        {
          prop: 'refuseReason',
          label: '审核拒绝原因',
          type: 'tooltip',
          width: 135,
        },
        // {
        //   prop: 'payOrderRefuseReason',
        //   label: '出纳拒绝原因',
        //   type: 'tooltip',
        //   width: 135,
        // },
        {
          prop: 'remark',
          label: '备注',
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
          prop: 'presentedPaperBill',
          label: '交单状态',
          type: 'select',
          propInDict: 'yesNo'
        },
        {
          prop: 'paperBillSubmitTime',
          label: '交单时间',
          type: 'text',
          width: 125
        },
        {
          prop: 'presentedPaperBillEmpName',
          label: '交单人',
          type: 'text',
        },
        {
          prop: 'createdName',
          label: '申请人',
          type: 'text',
          width: 100,
        },
        {
          prop: 'createdTime',
          label: '申请时间',
          type: 'text',
          width: 125,
        },
        {
          prop: 'confirmName',
          label: '审核人',
          type: 'text',
          width: 100,
        },
        {
          prop: 'confirmTime',
          label: '审核时间',
          width: 125,
          type: 'text'
        },
        {
          prop: 'invoiceRegTime',
          label: '发票登记时间',
          width: 125,
          type: 'text',
        },
        {
          prop: 'errorStatus',
          label: '付错状态',
          type: 'select',
          propInDict: 'yesNo'
        },
        {
          prop: 'payCompName',
          label: '分公司',
          width: 150,
          type: 'text',
        },
        {
          prop: 'hasPrepayRefund',
          label: '预付退款状态',
          type: 'text',
          width: 90,
          formatter: ({ cellValue }) => {
            if (cellValue === 'yes') {
              return '已退款'
            } else if (cellValue === 'no') {
              return '未退款'
            } else {
              return ''
            }
          }
        },
      ],
      pusheApplyPassList: [
				{ label: '申请通过', value: 'pass' },
				{ label: '申请通过并打印', value: 'passPrint' },
			],
      exportTypeList: [
				{ label: '预付抵账明细', value: 'prepayDedueInfoExportList' },
				{ label: '预付款', value: 'payApplyPrepayListExport' },
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
          allNo: { label: '各类单号', type: 'input', placeholder:"多个单号用空格或逗号分隔", showType: '1' },
          applyNo: { label: '预付款申请号',  type: 'input',  showType: '1'  },
          payOrderNo: { label: '付款单号',  type: 'input',  showType: '1'},
          //2
          hasInvoice: {  label: '开票状态',  type: 'select', prop:"payRelaInvoiceStatus", showType: '2'},
          payStatus: {  label: '付款状态',  type: 'select', prop:"payStatusType", multiple:true, showType: '2'  },
          confirmStatus: {  label: '审核状态',  type: 'select', prop:"confirmStatus", showType: '2'  },
          prepayDedueStatus: {  label: '抵账状态',  type: 'select', prop:"prepayDedueStatus", showType: '2', multiple: true },
          sourceType: {  label: '预付款来源',  type: 'select', prop:"prepayApplySourceType", showType: '2'  },
          errorStatus: {  label: '付错状态',  type: 'select', prop:"yesNo", showType: '2'  },
          //3
          recvBankName: {  label: '收款银行',  type: 'input',  showType: '3'  },
          recvAccountName: {  label: '收款账户名',  type: 'input',  showType: '3'  },
          recvAccountNo: {  label: '收款账号',  type: 'input',  showType: '3'  },
          payBankName: {  label: '付款银行',  type: 'input',  showType: '3'},
          payAccountName: {  label: '付款账户名',  type: 'input', showType: '3'  },
          payAccountNo: {  label: '付款账号',  type: 'input', showType: '3'  },
          payDate: { label: '付款时间',  type: 'daterange', format: 'yyyy-MM-dd',  showType: '3'},
          //4
          currency: {  label: '币种',  type: 'select', selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'), showType: '4'  },
          payWay: {  label: '付款方式',  type: 'select', prop: "payWay", multiple: true, showType: '4'},
          settleMode:{ label: '账户结算方式', type: 'select', propInDict: 'bankAccountSettleMode', r: true, multiple: true },
          //5
          payAmt: {  label: '金额',  type: 'range',  showType: '5'  },
          //6
          recvCorpCode: {
            label: '结算单位',
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
          applyDate: {  label: '申请时间',  type: 'daterange', format: 'yyyy-MM-dd',  showType: '7'  },
          applyEmpName: {  label: '申请人',  type: 'input',  showType: '7'},
          confirmDate: {  label: '审核时间',  type: 'daterange', format: 'yyyy-MM-dd',  showType: '7'},
          presentedPaperBill: { label: '交单状态', type: 'select', prop: 'yesNo' },
          paperBillSubmitTime: { label: '交单时间',  type: 'daterange', format: 'yyyy-MM-dd' },
          presentedPaperBillBy: {
            label: '交单人',
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
      width: '100px',
      data: [
        {
          label: '详情',
          type: 'text',
          showFn: ()=> this.checkAuth(this.$route.name, 'tab-prepayList', 'btn-detail'),
          action: 'showDetail'
        },
        {
          label: '抵账明细',
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
      emptyText: '数据将在查询后显示',
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
                  label: '删除',
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
        columns :[
            {prop: 'invoiceNo', label: '发票号', type: 'text', key: 'invoiceNo'},
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
                message: '请先选择结算单位',
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
            return item.bankName.indexOf(optionItem.value) > -1
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
      let title = val === 'yes' ? '交单' : '撤单'
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose(`请勾选需要${title}的项！`)
      }
      let presentedPaperBills = this.multipleSelection1.map((item) => item.presentedPaperBill)
      if (val === "yes" && presentedPaperBills.includes('yes')) {
        return this.$msgErrClose('所选数据包含已交单数据，请检查！')
      }
      if (val === "no" && presentedPaperBills.includes('no')) {
        return this.$msgErrClose('所选数据包含未交单数据，请检查！')
      }
      this.$confirm(`是否确认${title}？`, '提示', {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: 'warning'
      }).then(() => {
        let data = {
          applyNos: this.multipleSelection1.map(item => item.applyNo),
          presentedPaperBill: val
        }
        prePresentedPaperBill(data).then(res => {
          this.$message({message: `${title}成功`, type: 'success'});
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
        return this.$msgErrClose('请勾选需要撤回申请的项！')
      }
      for (let i = 0; i < len.length; i++) {
        if(len[i].confirmStatus !== 'pending'){
          return this.$msgErrClose('所选数据中包含非待审批状态，请重新选择！')
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
      this.$confirm('是否确认撤回申请？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        cancelButtonClass: 'btn-custom-cancel',
        type: 'warning'
      }).then(() => {
        cancelPayApplyPrepay(data).then(res=>{
        this.$message({message: '撤回申请成功', type: 'success'});
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
            message: '请勾选需要申请通过的项！',
            type: 'error',
            showClose: true
          })
          return
        }
        if (this.multipleSelection1.length > 1) {
          this.$message({  message: '打印目前不支持批量打印，请勾选一只进行申请通过并打印！',  type: 'error',  showClose: true })
          return
        }
        this.handleApplyFor('pass', 'passPrint')
      }
    },
    handleApplyFor(confirmStatus, flag) {
      if (this.multipleSelection1.length === 0) {
        this.$message({
          message: '请勾选需要'+( confirmStatus=='pass'?"申请通过":'申请拒绝' )+'的项！',
          type: 'error',
          showClose: true
        })
        return
      }
      for(let i = 0; i <this.multipleSelection1.length;i++){
        if (this.multipleSelection1[i].confirmStatus !== 'pending') {
          this.$message({  message: ''+this.multipleSelection1[i].applyNo+'已处理，请不要重复操作',  type: 'error',  showClose: true  })
          return
        }
      }
      
      this.query.applyNos = this.multipleSelection1.map(item => {
        return item.applyNo
      })
      this.query.confirmStatus =  confirmStatus
      this.query.refuseReason = ''
      if(confirmStatus==="pass"){
          for (let i = 0; i < this.multipleSelection1.length; i++) {
            if(this.multipleSelection1[i].currency === 'USD' && this.multipleSelection1[i].payWay === 'chinese_mainland'){
              if(this.multipleSelection1[i].hasInvoice !== "yes"){
                return this.$msgErrClose('支付方式为“国内”，币种为USD时，开票状态为已开票才能审批通过')
              }
            }
          }
          this.$confirm('您确定要审核通过预付款申请吗?', "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            lockScroll: "true",
            type: "warning"
          }).then(()=> {
              return approvePrepayApply(this.query);
          }).then(() => {
              this.getData()
              this.$message({message: '审核通过提交成功', type: 'success'});
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
            this.$message({message: '拒绝申请提交成功', type: 'success'});
          }).finally(()=>{
            this.query.loading = false
          })
        }
      })
    },
    handlePrepay() {
      this.reqIdentify = randomString()
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
        }
      }).finally(() => {
				this.loading = false
			})
    },
    getListAmtSummary(data) {
      queryPrepayApplyPageSummary(data).then(res => {
        if (res.code === 0 && res.data) {
          let labelObj = {
            payAmtSummaryListLabel: '预付款金额',
            balanceAmtSummaryListLabel: '剩余可用余额'
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
          let bankNameList = data.map(item => item.bankName)
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
    //关联发票
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
    //发票登记
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
    //批量下载
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
      }).then(()=> { }).catch(()=> { })
    },
    // 打印
		handlePrint () {
			let len = this.multipleSelection1.length
			if (!len) {
				return this.$msgErrClose('请先勾选1条数据，再进行打印！')
			}
			if (len > 1) {
				return this.$msgErrClose('一次只能勾选1条数据进行打印，请重新选择！')
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
			this.$confirm('是否确认导出预付款申请单'+exportType.label+'?', "导出", {
        showCancelButton: true,
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				lockScroll: "true",
				type: "warning",
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = '执行中...';
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
                  link.download = '预付款申请单'+exportType.label+'.xlsx'
                  link.click()
                  done();
                  instance.confirmButtonLoading = false;
                }).catch(() => {
                  this.option1.loading = false
                  this.$message({ message: '导出失败', type: 'error' })
                  done();
                  instance.confirmButtonLoading = false;
                })
            }, 30);
          } else {
            done();
          }
        }
			}).then(() => { }).catch(() => { })
		},    // 退款按钮
    handleRefund() {
      let rows = this.multipleSelection1
      if (rows.length !== 1) {
        return this.$msgErrClose('请勾选一个预付退款进行操作！')
      }
      let row = rows[0]
      if (row.payStatus === 'pay_close') {
        return this.$msgErrClose('付款状态为付款拒绝，不可操作！')
      }
      if (row.payWay === 'cash') {
        return this.$msgErrClose('付款方式为现金的，暂时不可操作预付退款！')
      }
      if (row.balance - 0 <= 0 ) {
        return this.$msgErrClose('剩余可用余额大于0的预付款才能发起预付退款！')
      }
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({
        name: 'OrderRefund',
        query: { payOrderNo: row.payOrderNo },
      })
      // this.routerPush('OrderRefund', { payOrderNo: row.payOrderNo })
    },
    identifyElecInvoice() {
      let list = this.multipleSelection1
      let row = list[0]
      if (this.multipleSelection1.length === 0) {
          return this.$msgErrClose('请勾选需要登记的项！')
      }
      for (let i = 0; i < list.length; i++) {
        if (row.currency !== list[i].currency) {
          return this.$msgErrClose('相同币种才能进行关联发票！请重新选择！')
        }
        if (row.recvCorpCode !== list[i].recvCorpCode) {
          return this.$msgErrClose('相同结算单位才能进行关联发票！请重新选择！')
        }
        if (list[i].status === 'refuse') {
          return this.$msgErrClose(list[i].applyNo + '审核拒绝状态不能进行发票登记，请重新选择！')
        }
        if (list[i].hasInvoice === 'yes') {
          return this.$msgErrClose('申请单' + list[i].applyNo + '单已开票！请勿重复发票登记')
        }
        if (list[i].needRelationInvoiceAmt === 0) {
          return this.$msgErrClose('申请单' + list[i].applyNo + '只有押金类费用，不支持应付发票登记')
        }
      }
      let query = {
        payApplyPrepayNoList: list.map((item) => item.applyNo ),
        from: 'PrepayList',
      }
      this.goIdentifyElecInvoice(query)
    },
    goIdentifyElecInvoice(query){
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({ name: 'IdentifyElecInvoice', query, })
    },
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
    background: #33b18a;
    color: #fff;
    border-color: #33b18a;
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

