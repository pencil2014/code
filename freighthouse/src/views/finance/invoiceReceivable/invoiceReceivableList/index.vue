<template>
  <!-- class="finance-page" -->
  <div
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left" v-show="activeName ==='first'">
          <el-button
            v-if="checkAuth($route.name, 'tab-invoiceReceivableList', 'btn-cancel')"
            class="finance-btn"
            @click="cancelInovice"
            size="mini"
            type="danger"
          >红冲作废申请</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-invoiceReceivableList', 'btn-sendInvoiceFile')"
            class="finance-btn"
            @click="sendInvoiceFile"
            size="mini"
            type="primary"
          >发送邮件</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-invoiceReceivableList', 'btn-relate')"
            class="finance-btn"
            @click="relateSettlement"
            size="mini"
            type="primary"
          >关联结算单</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-invoiceReceivableList', 'btn-release')"
            class="finance-btn"
            @click="releaseInvoiceFee"
            size="mini"
            type="purple"
          >撤销关联</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-invoiceReceivableList', 'btn-regWriteoff')"
            class="finance-btn"
            @click="regWriteoff"
            size="mini"
            type="primary"
          >收款登记并核销</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-invoiceReceivableList', 'btn-regWriteoff')"
            class="finance-btn"
            @click="relationRegDialog"
            size="mini"
            type="primary"
          >关联收款登记核销</el-button>
          <div
            class="finance-btn select-template-box"
            v-if="checkAuth($route.name, 'tab-invoiceReceivableList', 'btn-handleExport')"
          >
            <el-dropdown trigger="click" @command="handleExport">
              <span class="el-dropdown-link">
                导出
                <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-for="(item, index) in exportTypeList"
                  :key="'exportTypeList' + index"
                  :command="item"
                >导出{{item.label}}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
        <div class="money-box-right">
          <!-- v-if="checkAuth(this.$route.name, 'btn-uploadInvoiceImg')" -->
          <el-button
            v-if="checkAuth(this.$route.name, 'tab-invoiceReceivableList', 'btn-uploadInvoiceImg')"
            class="finance-btn"
            @click="showUpload = true"
            size="mini"
            type="primary"
          >批量上传发票</el-button>
          <el-button
            v-if="checkAuth(this.$route.name, 'tab-invoiceReceivableList', 'btn-downloadInvoiceFileBatch')"
            class="finance-btn"
            @click="downloadInvoiceFileBatch"
            size="mini"
            :loading="btnLoading2"
            type="primary"
          >批量下载发票</el-button>
          <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
        </div>
      </div>
      <FinanceTableMass :option="option1" @send-multi="sendMulti" />
    </div>
    <relateReveivableDialog
      ref="relateReveivableDialog"
      v-if="relatePayInfoDialogVisible"
      :btnType="btnType"
      :row-data="rowData"
      :dialog-visible.sync="relatePayInfoDialogVisible"
      @relateSuc="getData"
    />
    <div class="cancel-invoice-receivable-form">
      <el-dialog :title="`发票${runshCancel}申请`" :visible.sync="dialogVisible" width="952px">
        <div>
          <el-form
            :model="cancelInvoiceForm"
            ref="cancelInvoiceForm"
            :inline="true"
            label-width="120px"
            size="mini"
            :rules="cancelInvoiceRules"
          >
            <el-form-item label="选择的发票号" prop="invoiceNo">
              <el-input v-model="cancelInvoiceForm.invoiceNo" placeholder disabled></el-input>
            </el-form-item>
            <!-- <el-form-item v-if="f" label="红冲的发票号" prop="rivalInvoiceNo">
              <el-input
                maxlength="8"
                v-model.trim="cancelInvoiceForm.rivalInvoiceNo"
                placeholder="请输入8位数字"
              ></el-input>
            </el-form-item>
            <el-form-item v-if="isElec" label="红冲的发票代码" prop="rivalInvoiceCode">
              <el-input v-model="cancelInvoiceForm.rivalInvoiceCode" placeholder="请输入红冲的发票代码"></el-input>
            </el-form-item>-->
            <!-- chargePersonType -->
            <el-form-item label="发票类型" prop="invoiceType">
              <el-select v-model="cancelInvoiceForm.invoiceType" placeholder="请选择责任类型" disabled>
                <el-option
                  v-for="item in dictMap['invoiceType']"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="责任人类型" prop="chargePersonType">
              <el-select
                v-model="cancelInvoiceForm.chargePersonType"
                placeholder="请选择责任类型"
                @change="chargePersonTypeChange"
              >
                <el-option
                  v-for="item in dictMap['invoiceCancelChangeType']"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              ref="orderNoItem"
              v-if="['sale_person', 'customer'].includes(cancelInvoiceForm.chargePersonType)"
              label="工作单号"
              prop="orderNo"
            >
              <el-select
                v-if="backupOrderPropertyList.length || cancelInvoiceForm.chargePersonType === 'sale_person'"
                v-model="cancelInvoiceForm.orderNo"
                placeholder="工作单号"
                @change="orderNoChange"
              >
                <el-option
                  v-for="(item, index) in backupOrderPropertyList"
                  :key="'employeeSelectOptions' + index"
                  :label="item.orderNo"
                  :value="item.orderNo"
                ></el-option>
              </el-select>
              <el-input v-else v-model="cancelInvoiceForm.orderNo" placeholder="请输入工作单号"></el-input>
            </el-form-item>
            <el-form-item
              v-if="['sale_person', 'apply_person'].includes(cancelInvoiceForm.chargePersonType)"
              label="责任人"
              prop="chargePersonId"
            >
              <el-select
                v-model="cancelInvoiceForm.chargePersonId"
                placeholder="请输入责任人"
                filterable
                remote
                :remote-method="employeeSelectlist"
                @visible-change="(val) => val && employeeSelectlist('')"
                @change="chargePersonChange"
              >
                <el-option
                  v-for="(item, index) in employeeSelectOptions"
                  :key="'employeeSelectOptions' + index"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="`${runshCancel}原因`" prop="reason">
              <!-- placeholder="纸质发票只能作废，电子发票只能红冲" -->
              <el-select v-model="cancelInvoiceForm.reason" :placeholder="`请选择${runshCancel}原因`">
                <el-option
                  v-for="(item, index) in dictMap['invoiceCancelReason']"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              :label="`${runshCancel}说明`"
              prop="remark"
              class="el-form-item-cancelinvoice-remark"
            >
              <el-input
                v-model="cancelInvoiceForm.remark"
                :placeholder="`请输入${runshCancel}说明，长度不能超过159（1个中文占2个字符）`"
                type="textarea"
                style="width: 650px;"
                @input="remarkInput"
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button
            :loading="dialogBtnLoading"
            type="primary"
            size="mini"
            @click="cancelConfirm"
          >确定</el-button>
          <el-button size="mini" @click="dialogVisible = !dialogVisible">取消</el-button>
        </span>
      </el-dialog>
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{key:'prop',label:'label'}"
        @close="customColumnsPopClose"
      />
    </div>
    <InovicePreviewPrint
      :dialog-visible-o="dialogVisibleO"
      :customer-info="customerInfo"
      :seller-info="sellerInfo"
      :apply-item-group-list="applyItemGroupList"
      :other-invoice-info="otherInvoiceInfo"
      :isElec="singleInvoiceType"
    />
    <!-- 批量上传 -->
    <UploadInvoiceImg :showUpload="showUpload" @close-upload="closeUpload">
      <span slot="remark" style="color: #E9851F">(附件名称含发票号)</span>
    </UploadInvoiceImg>
    <keep-alive v-if="relationRegDialogVisible.show">
      <RelationReg
        :isJumpRouteFromPage.sync="isJumpRouteFromPage"
        :idList="multipleSelection1.map(v=>v.invoiceReceivableId)"
        :dialog-visible="relationRegDialogVisible"
        :relationRegList="relationRegList"
        @close="relationRegClose"
      />
    </keep-alive>
    <PreviewDialog :dialogOption="previewDialog" />
  </div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import InvoiceReceivableDetail from '@/views/finance/invoiceReceivable/components/invoiceReceivableDetail'
import relateReveivableDialog from '../components/relateReveivableDialog'
import SettlementList from '@/views/finance/supplierBill/supplierBillList/components/components/selectSettlement'
import CustomColumns from '@/components/customColumns'
import InovicePreviewPrint from '@/views/finance/invoiceReceivable/components/invoicePreviewPrint'
import UploadInvoiceImg from '@/views/finance/invoiceReceivable/components/uploadInvoiceImg'
import RelationReg from '../components/relationReg'
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { printMixin } from '../components/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { employeeSelectlist, departmentTreeList } from '@/api/companyResource'
import { listByRole } from '@/api/base'
import {
  listPage,
  cancelApply as cancel,
  getListAmtSummary,
  sendInvoiceFile,
  toQuickRecvWriteoff,
  toCancelApply,
  listReceivableRegForWriteoff,
  listInvoiceAbleSettleOrder,
} from '@/api/fin/invoiceReceivable'
import Vue from 'vue'

export default {
  mixins: [mixin, mixin2, printMixin, routerMixin],
  data() {
    return {
      pageSizeUrl: '/fin/invoiceReceivable/listPage',
      keyDownActive: true,
      relationRegDialogVisible: { show: false },
      relationRegList: [],
      previewDialog: {
        show: false,
        title: '凭证预览',
        seqNo: '',
        showData: {},
        isEx: true,
      },
      exportTypeList: [
        { label: '列表', value: 'invoiceReceivableListExport' },
        { label: '明细', value: 'invoiceReceivableListDetailExport' },
      ],
      //批量上传
      showUpload: false,
      singleInvoiceType: '',
      dialogVisibleO: { show: false },
      customerInfo: {},
      sellerInfo: {},
      invoiceReceivableList: [],
      applyItemGroupList: [],
      otherInvoiceInfo: {},
      loading: true,
      option1: {},
      searchOption: {},
      table1DataBackup: [],
      isAddPay: false,
      multipleSelection1: [],
      form: {
        orderNo: '',
        creationDate: '',
        billNo: '',
        settleCorpName: '',
        settleCorpCode: '',
      },
      orderNo: '',
      orderBillId: '',
      feeAdjustApplyId: 0,
      selectedOptionItem: '',
      dialogVisible: false,
      dialogBtnLoading: false,
      cancelInvoiceForm: {
        invoiceReceivableId: '',
        invoiceNo: '',
        // rivalInvoiceNo: '',
        // rivalInvoiceCode: '',
        chargePersonId: '',
        chargePerson: '',
        chargePersonType: '',
        reason: '',
        remark: '',
        reverseType: '',
        orderNo: '',
        invoiceType: '',
      },
      batchPrintCreateData: [],
      invoiceReceivableIndex: 0,
      dialogVisibleManualRegist: false,
      activeName: 'first',
      // tabsList: [
      //   {
      //     label: '正常发票',
      //     name: 'first',
      //   },
      //   {
      //     label: '已红冲取消',
      //     name: 'second',
      //   },
      // ],
      employeeSelectOptions: [],
      backupOrderPropertyList: [],
      cancelInvoiceRules: {
        invoiceNo: [{ required: true, message: '选择的发票号不能为空', trigger: 'blur' }],
        // rivalInvoiceNo: [
        //   // { required: true, message: '红冲的发票号不能为空', trigger: 'blur' },
        //   {
        //     required: true,
        //     validator: (rule, value, callback) => {
        //       if (value) {
        //         callback(/\d{8}/.test(value) ? undefined : new Error('请输入8位数字'))
        //       } else {
        //         callback(!rule.required || /\d{8}/.test(value) ? undefined : new Error('请输入8位数字'))
        //       }
        //     },
        //     trigger: 'blur',
        //   },
        // ],
        reason: [{ required: true, message: '原因不能为空', trigger: 'blur' }],
        remark: [{ required: true, message: '说明不能为空', trigger: 'blur' }],
        chargePersonType: [{ required: true, message: '责任类型不能为空', triggers: 'blur, change' }],
        chargePersonId: [{ required: true, message: '责任人不能为空', trigger: 'blur' }],
        orderNo: [{ required: true, message: '工作单号不能为空', trigger: 'change, blur' }],
      },
      currentComponent: '',
      rowData: {},
      relatePayInfoDialogVisible: false,
      optionReason: {
        prop: 'reason',
        label: '取消原因',
        type: 'text',
      },
      rightFilterBtns: [true, false, false, false],
      btnType: '',
      departmentList: [],
      // 自定义表头弹框
      customColumnsPopShow: false,
      // 右侧搜索条件
      buttonSearch: '',
      selfColumnsBase: [
        {
          prop: 'invoiceNo',
          label: '发票号',
          type: 'button',
          width: 130,
          operationBtns: {
            show: true,
            callback: (fn, index, row, option, subItem) => {
              if (row.fileNo) {
                const href = `/base/fileView/preview/${row.fileNo}/${row.fileName}`
                window.open(href)
              } else {
                this.previewInvoiceFromList(row.invoiceReceivableId)
              }
            },
          },
          disabled: true,
        },
        { prop: 'invoiceCode', label: '发票代码', type: 'text', width: 130 },
        {
          prop: 'invoiceReceivableApplyNo',
          label: '申请编号',
          type: 'button',
          width: '130px',
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => {
              this.showApplyDetail(row)
              // let query = {
              //   source: 'apply',
              //   invoiceReceivableApplyId:row.invoiceReceivableApplyId
              //   // rowData: JSON.stringify(row),
              // }
              // this.routerPush('InvoiceReceivableApplyDetail', query)
            },
          },
          disabled: true,
        },
        {
          prop: 'settleOrderNo',
          label: '结算单号',
          type: 'columnTip',
          width: 130,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps) => {
              this.showColumnDetail({
                type: 'settleOrderNos',
                no,
                componentProps,
              })
            },
          },
          disabled: true,
        },
        {
          prop: 'sourceBizNos',
          label: '工作号',
          type: 'columnTip',
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
          },
          disabled: true,
        },
        { prop: 'invoiceWay', label: '开票方式', type: 'select', width: 80 },
        { prop: 'invoiceType', label: '发票类型', type: 'select', width: 130 },
        { prop: 'invoiceGroup', label: '发票分组', type: 'select', width: 80 },
        { prop: 'status', label: '发票状态', type: 'select', propInDict: 'invoiceStatus', width: 80 },
        { prop: 'preInvoice', label: '是否预收发票', type: 'select', propInDict: 'yesNo', width: 80 },
        { prop: 'currency', label: '开票币种', width: 80 },
        { prop: 'amt', label: '开票金额', type: 'text', width: 80 },
        { prop: 'taxRate', label: '税率', type: 'select', propInDict: 'taxRateInfo', width: 80 },
        {
          prop: 'taxAmt',
          label: '税额',
          width: 80,
          // formatter: (row, pItem) => decimalFixed2(row.amt / (1 + row.taxRate) * row.taxRate),
        },
        {
          prop: 'noTaxAmt',
          label: '不含税金额',
          width: 80,
        },
        {
          prop: 'hasFile',
          label: '是否有发票附件',
          width: 100,
          type: 'select',
          propInDict: 'yesNo',
        },
        {
          prop: 'fileName',
          label: '发票附件',
          width: 130,
          type: 'button',
          callback: (row) => window.open(this.getDownloadPath(row.fileNo, row.fileName)),
        },
        { prop: 'issueName', label: '开票人', width: 100 },
        { prop: 'issueTime', label: '开票日期', width: 130 },
        {
          prop: 'writeoffReceipayNo',
          label: '核销编号',
          type: 'columnTip',
          width: 120,
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
        },
        { prop: 'writeoffStatus', label: '核销状态', type: 'select', width: 80 },
        { prop: 'writeoffAmt', label: '已核销金额', width: 80 },
        { prop: 'noWriteoffAmt', label: '未核销金额', width: 80 },
        { prop: 'lockAmt', label: '可关联金额', width: 80 },
        { prop: 'employeeName', label: '业务员', width: 100 },
        { prop: 'deptName', label: '所属部门', width: 100 },
        { prop: 'settleCorpName', label: '结算单位', width: 150 },
        { prop: 'title', label: '客户发票抬头', type: 'text', width: 150 },
        { prop: 'taxNo', label: '客户纳税人识别号', type: 'text', width: 130 },
        { prop: 'bankName', label: '客户银行名称', type: 'text', width: 130 },
        { prop: 'accountNo', label: '客户银行账号', type: 'text', width: 130 },
        { prop: 'settleCompName', label: '分公司', type: 'text', width: 150 },
        { prop: 'saleCompTitle', label: '我司发票抬头', type: 'text', width: 150 },
        { prop: 'taxpayerNo', label: '我司纳税人识别号', type: 'text', width: 130 },
        { prop: 'saleCompAccountShortName', label: '我司银行简称', width: 100 },
        { prop: 'saleCompBankName', label: '我司银行名称', type: 'text', width: 130 },
        { prop: 'saleCompAccountNo', label: '我司银行账号', type: 'text', width: 130 },
        { prop: 'emailStatus', label: '邮件发送状态', type: 'select', width: 100 },
        { prop: 'emailAddrs', label: '客户邮箱', type: 'text', width: 130 },
        { prop: 'remark', label: '发票备注', type: 'text', width: 130 },
        {
          prop: 'voucherNo',
          label: '发票凭证号',
          type: 'columnTip',
          width: 125,
          sortable: true,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps, index) => {
              this.previewDialog.isEx = true
              let row = componentProps.row
              let voucherNo = row.voucherNo_multiValue
              let seqNo = row.acctVoucherSeqno_multiValue
              voucherNo = voucherNo[index]
              seqNo = seqNo[index]

              this.previewDialog.showData = ''
              this.previewDialog.seqNo = seqNo
              this.previewDialog.show = true
            },
          },
        },
        // { prop: 'rivalInvoiceNo', label: '红冲发票号', type: 'text', width: 130 },
        {
          prop: 'rivalInvoiceNo',
          label: '红冲发票号',
          type: 'button',
          width: 100,
          operationBtns: {
            show: true,
            callback: (fn, index, row, option, subItem) => {
              if (row.rivalFileNo) {
                const href = `/base/fileView/preview/${row.rivalFileNo}/${row.rivalFileName}`
                window.open(href)
              } else {
                this.previewInvoiceFromList(row.rivalInvoiceReceivableId)
              }
            },
            // callback: (fn, index, row, option) => this.showDetail(row, true),
          },
        },
        { prop: 'cancelCreatedName', label: '红冲/作废人', type: 'text', width: 130 },
        { prop: 'cancelCreatedTime', label: '红冲/作废时间', type: 'text', width: 130 },
        { prop: 'reason', label: '红冲作废原因', type: 'select', propInDict: 'invoiceCancelReason', width: 100 },
        {
          prop: 'chargePersonType',
          label: '红冲作废责任类型',
          type: 'select',
          width: 100,
          propInDict: 'invoiceCancelChangeType',
        },
        { prop: 'chargePerson', label: '红冲作废责任人', type: 'text', width: 130 },
        { prop: 'applyName', label: '申请人', type: 'text', width: 100 },
        { prop: 'applyTime', label: '申请时间', type: 'text', width: 130 },
        // { prop: 'issueName', label: '开票人', type: 'text' },
        // { prop: 'issueTime', label: '开票时间', type: 'text', width: 120 },
        { prop: 'updatedName', label: '更新人', type: 'text', width: 100 },
        { prop: 'updatedTime', label: '更新时间', type: 'text', width: 130 },
      ],
      cTimestamp: 0,
    }
  },
  computed: {
    isElec() {
      // let str = ''
      // if (!this.rowData.issueTime) {
      //   return str
      // }
      if (!this.rowData.issueTime) {
        return this.rowData.invoiceType === 'electronic'
      }
      let s = this.rowData.issueTime
      var d = new Date(Date.parse(s.replace(/-/g, '/')))
      let year = new Date().getFullYear()
      let month = new Date().getMonth() + 1
      // if (month - 1 >= 0) {
      //   month = month - 1
      // } else {
      //   month = 11
      //   year = year - 1
      // }
      // let date = new Date().getDate()
      console.log(s.replace(/-/g, '/'))
      console.log(year + '/' + month + '/' + '01' + ' 00:00:00')
      let dThisMonth = new Date(Date.parse(year + '/' + month + '/' + '01' + ' 00:00:00'))
      if (d.getTime() < dThisMonth.getTime()) {
        // 此情况等同于电子发票红冲
        // str = '红冲'
        return true
      }
      //  else {
      //   // str = '作废'
      // }
      if (this.rowData.invoiceType === 'electronic') {
        return true
      }
      return false
      // return this.rowData.invoiceType === 'electronic'
    },
    runshCancel() {
      // if (this.isElec) {
      //   str = '红冲'
      // }
      // console.log('str:', str)
      // return str
      return '红冲/作废'
      // return this.isElec ? '红冲' : '作废'
    },
  },
  created() {
    this.loanBasicData()
    // 核销状态、业务员、所属部门
    let searchArr = ['allNo', 'invoiceWay', 'currency', 'invoiceType', 'bankName', 'amt', 'settleCorpCode', 'issueTime']
    this.searchOption = {
      saveShow: true,
      saveName: 'invoiceReceivableList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 8,
        searchInputGroup: searchArr.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          allNo: { label: '各类编号', type: 'input' },
          invoiceNo: { label: '发票号', type: 'input' },
          invoiceReceivableApplyNo: { label: '申请编号', type: 'input' },
          settleOrderNo: { label: '结算单号', type: 'input' },
          sourceBizNo: { label: '工作号', type: 'input' },
          invoiceWay: { label: '开票方式', type: 'select', prop: 'invoiceWay' },
          invoiceType: { label: '发票类型', type: 'select', multiple: true, prop: 'invoiceType' },
          status: { label: '发票状态', type: 'select', prop: 'invoiceStatus', multiple: true },
          invoiceGroup: { label: '发票分组', type: 'select', prop: 'invoiceGroup' },
          preInvoice: { label: '是否预收发票', type: 'select', prop: 'yesNo' },
          currency: {
            label: '开票币种',
            type: 'select',
            selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'),
          },
          amt: { label: '开票金额', type: 'range' },
          taxRate: { label: '税率', type: 'select', prop: 'taxRateInfo' },
          taxAmt: { label: '税额', type: 'range' },
          noTaxAmt: { label: '不含税金额', type: 'range' },
          hasFile: { label: '是否有发票附件', type: 'select', prop: 'yesNo' },
          issueBy: {
            label: '开票人',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => this.getEmployeeList2(queryString, item),
            visibleChange: (queryString, item, row) => this.getEmployeeList2('', item),
            remoteSelectList: [],
          },
          chargePersonType: { label: '红冲作废责任类型', type: 'select', prop: 'invoiceCancelChangeType' },
          chargePerson: { label: '责任人', type: 'input' },
          issueTime: { label: '开票日期', type: 'daterange', format: 'yyyy-MM-dd' },
          writeoffReceipayNo: { label: '收付核销编号', type: 'input' },
          writeoffAmt: { label: '已核销金额', type: 'range' },
          noWriteoffAmt: { label: '未核销金额', type: 'range' },
          lockAmt: { label: '可关联金额', type: 'range' },
          settleCorpCode: {
            label: '结算单位',
            type: 'remoteSelect',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString }, item)
            },
            remoteSelectList: [],
          },
          title: { label: '客户发票抬头', type: 'input' },
          taxNo: { label: '客户纳税人识别号', type: 'input' },
          bankName: { label: '客户银行名称', type: 'input' },
          accountNo: { label: '客户银行账号', type: 'input' },
          emailAddrs: { label: '客户邮箱', type: 'input' },
          saleCompTitle: { label: '我司发票抬头', type: 'input' },
          taxpayerNo: { label: '我司纳税人识别号', type: 'input' },
          saleCompAccountShortName: { label: '我司银行简称', type: 'input' },
          saleCompBankName: { label: '我司银行名称', type: 'input' },
          saleCompAccountNo: { label: '我司银行账号', type: 'input' },
          applyBy: {
            label: '申请人',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => this.getEmployeeList2(queryString, item),
            visibleChange: (queryString, item, row) => this.getEmployeeList2('', item),
            remoteSelectList: [],
          },
          applyTime: { label: '申请时间', type: 'daterange', format: 'yyyy-MM-dd' },
          updatedBy: {
            label: '更新人',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => this.getEmployeeList2(queryString, item),
            visibleChange: (queryString, item, row) => this.getEmployeeList2('', item),
            remoteSelectList: [],
          },
          updatedTime: { label: '更新时间', type: 'daterange', format: 'yyyy-MM-dd' },
          writeoffStatus: { label: '核销状态', type: 'select', multiple: true, prop: 'writeoffStatus' },
          emailStatus: { label: '邮件发送状态', type: 'select', prop: 'emailStatus' },
          employeeId: {
            label: '业务员',
            showType: '100',
            prop: 'employeeId',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => this.getEmployeeList2(queryString, item),
            visibleChange: (queryString, item, row) => this.getEmployeeList2('', item),
            remoteSelectList: [],
            labelDIY: {
              label: 'cname',
              DIY: 'label',
            },
          },
          deptCode: {
            label: '所属部门',
            showType: '100',
            prop: 'deptCode',
            type: 'cascader',
            cascaderList: this.departmentList,
            cascaderProps: {
              children: 'childList',
              label: 'deptCname',
              value: 'deptCode',
              checkStrictly: false,
            },
          },
        },
      },
    }

    let operationBtns = Object.assign({}, this.option.operationBtns, {
      width: '80px',
      data: [
        {
          label: '详情',
          showFn: () => this.checkAuth(this.$route.name, 'tab-invoiceReceivableList', 'btn-detail'),
          action: 'showDetail',
        },
        {
          label: '打印',
          showFn: (row) =>
            row.printStatus != 'yes' &&
            row.invoiceNo &&
            this.activeName == 'first' &&
            row.invoiceType != 'electronic' &&
            row.invoiceWay != 'manual' &&
            this.checkAuth(this.$route.name, 'tab-invoiceReceivableList', 'btn-print'),
          action: 'Edit',
        },
      ],
    })
    if (
      !this.checkAuth(this.$route.name, 'tab-invoiceReceivableList', 'btn-detail') &&
      !this.checkAuth(this.$route.name, 'tab-invoiceReceivableList', 'btn-print')
    ) {
      operationBtns = false
    }
    let pagination = Object.assign({}, this.option.pagination, { show: true, isNew: true })
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
      $name: 'invoiceReceivableList',
      data: [...this.option.data],
      tips: {
        text: '',
        show: false,
      },
      operationBtns,
      pagination,
      emptyText: '数据将在查询后显示',
      listAmtSummary,
      colorColumns: ['invoiceStatus'],
    })
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))

    this.option1.columns = [...this.selfColumnsBase]
    this.cTimestamp = new Date().getTime()
    // 查询正常发票，查询参数加在searchOption中
    // TODO 搜索保存功能，首次加载自动搜索
    // this.getData()
  },
  activated() {
    let timestamp = new Date().getTime()
    // console.log('isUseCache:', this.$route.meta.isUseCache)
    if ((!this.$route.meta.isUseCache || this.$route.meta.refresh) && timestamp - this.cTimestamp > 500) {
      this.handleCurrentChange(1)
    }
  },
  methods: {
    chargePersonChange(val) {
      if (this.cancelInvoiceForm.chargePersonType === 'sale_person') {
        if (this.backupOrderPropertyList.length) {
          let obj = this.backupOrderPropertyList.find((item) => item.value == val)
          this.cancelInvoiceForm.orderNo = obj.orderNo
        }
      }
    },
    orderNoChange(val) {
      if (this.cancelInvoiceForm.chargePersonType === 'sale_person') {
        if (this.backupOrderPropertyList.length) {
          let obj = this.backupOrderPropertyList.find((item) => item.orderNo == val)
          let index = this.backupOrderPropertyList.findIndex((item) => item.orderNo == val)
          this.cancelInvoiceForm.chargePersonId = obj.bdEmployeeId + ',' + index
        }
      }
    },
    chargePersonTypeChange(val) {
      this.$refs.orderNoItem && this.$refs.orderNoItem.clearValidate()
      console.log(val)
      if (val === 'customer') {
        this.cancelInvoiceRules.orderNo[0].required = true
      } else {
        this.cancelInvoiceRules.orderNo[0].required = false
      }
      let row = this.backupOrderPropertyList[0]
      if (!['sale_person', 'customer'].includes(val)) {
        this.cancelInvoiceForm.orderNo = ''
      } else {
        this.cancelInvoiceForm.orderNo = row ? row.orderNo : ''
      }
      if (val === 'sale_person') {
        this.cancelInvoiceForm.chargePersonId = row ? row.bdEmployeeId + ',' + '0' : ''
        this.employeeSelectOptions = this.backupOrderPropertyList
      } else if (val === 'apply_person') {
        this.employeeSelectlist('', true)
        // this.$nextTick(() => {
        //   console.log(this.employeeSelectOptions)
        //   this.cancelInvoiceForm.chargePersonId = this.rowData
        //     ? this.rowData.applyBy
        //     : ''
        // })
      } else {
        this.cancelInvoiceForm.chargePersonId = ''
      }
    },
    employeeSelectlist(queryString, delay) {
      if (this.cancelInvoiceForm.chargePersonType === 'sale_person') {
        if (this.backupOrderPropertyList.length) {
          this.employeeSelectOptions = this.backupOrderPropertyList
        } else {
          // 获取销售
          let query = [{ column: 'roleCode', type: 'eq', value: 'bd' }] // column: 'roleCode', type: 'in', value: 'bd,obd'
          queryString && query.push({ column: 'name', type: 'eq', value: queryString })
          listByRole({ currPage: 1, pageSize: 30, query }).then(({ data: { list } }) => {
            this.employeeSelectOptions = list.map((v) => ({
              label: `${v.cname}`,
              value: v.employeeId,
            }))
          })
        }
        console.log(this.employeeSelectOptions)
        return
      }
      let data = { state: 'valid', name: queryString }
      this.$store.dispatch('dict/employeeSelectlist', data).then((data) => {
        data = data.map((item) => ({ label: item.value, value: item.key }))
        if (!data.find((item) => item.value == this.rowData.applyBy)) {
          data.unshift({ label: this.rowData.applyName, value: this.rowData.applyBy })
        }
        this.employeeSelectOptions = data
        if (delay) {
          this.cancelInvoiceForm.chargePersonId = this.rowData ? this.rowData.applyBy : ''
        }
      })
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    // 验证是否可以进行按钮操作
    notOk(boolean, message) {
      return boolean && this.$msgErrClose(message)
    },
    sendInvoiceFile() {
      let rows = this.multipleSelection1
      let electronic = rows.find((v) => v.invoiceType !== 'electronic')
      if (!(rows.every((v) => v.status == 'normal') && rows.every((v) => v.invoiceGroup == 'normal'))) {
        this.$msgErrClose('正常发票才能发送邮件！')
        return
      }
      if (
        this.notOk(!rows.length, '选择发票进行操作！') ||
        this.notOk([...new Set(rows.map((v) => v.title))].length > 1, '请选择客户发票抬头相同的发票！') ||
        this.notOk([...new Set(rows.map((v) => v.settleCompCode))].length > 1, '请选择分公司相同的发票！') ||
        this.notOk(rows.find((v) => v.hasFile !== 'yes'), '请选择有附件的发票！') ||
        this.notOk(electronic, '请选择电子发票！')
      ) {
        return
      }
      let emails = []
      rows.forEach((v) => {
        let emailAddrs = v.emailAddrs.replace(/，/g, ',').split(',')
        emails.push(...emailAddrs)
      })
      emails = [...new Set(emails)].join(',')
      this.$prompt('请确认是否发送发票至以下邮箱？', ' ', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: emails,
        inputType: 'textarea',
        customClass: 'ls__prompt',
        closeOnClickModal: false,
      })
        .then(({ value }) => {
          this.lsLoading = true
          sendInvoiceFile({
            invoiceReceivableIds: rows.map((v) => v.invoiceReceivableId),
            emailAddrs: value,
          }).then((res) => {
            this.$msgSucClose('邮件发送成功！')
            this.getData()
          }).finally(() => this.lsLoading = false)
        })
        .catch(() => {})
    },
    // 撤销关联
    releaseInvoiceFee() {
      if (this.notOk(this.multipleSelection1.length !== 1, '选择一张发票进行操作！')) {
        return
      }
      if (this.notOk(!this.multipleSelection1[0].settleOrderNo, '请选择已关联结算单的发票进行操作！')) {
        return
      }
      this.rowData = this.multipleSelection1[0]
      this.btnType = 'release'
      this.relatePayInfoDialogVisible = true
    },
    // 关联结算单
    relateSettlement() {
      let rows = this.multipleSelection1
      if (this.notOk(!rows.length, '选择发票进行操作！')) {
        return
      }
      if (!(rows.every((v) => v.status == 'normal') && rows.every((v) => v.invoiceGroup == 'normal'))) {
        this.$msgErrClose('正常发票才能进行关联！')
        return
      }
      if (!rows.every((v) => v.lockAmt != 0)) {
        this.$msgErrClose('部分发票可关联费用金额为0，不能进行关联！')
        return
      }
      this.rowData = { ...rows[0], invoiceReceivableIds: rows.map((v) => v.invoiceReceivableId) }
      this.rowData.invoiceReceivableId = undefined
      this.lsLoading = true
      listInvoiceAbleSettleOrder(this.rowData)
        .then((res) => {
          this.btnType = 'relate'
          this.relatePayInfoDialogVisible = true
          this.$nextTick(() => {
            this.$refs.relateReveivableDialog.option1.data = res.data
          })
        })
        .finally(() => (this.lsLoading = false))
    },
    // 红冲作废按钮
    cancelInovice() {
      let rows = this.multipleSelection1
      if (this.notOk(rows.length !== 1, '选择一张发票进行红冲作废！')) {
        return
      }
      let row = rows[0]
      if (this.notOk(row.invoiceNo === '', '请选择已开票的选项！')) {
        return
      }
      if (this.notOk(row.status !== 'normal', '正常发票才允许操作！')) {
        return
      }
      if (this.notOk(row.invoiceGroup !== 'normal', '发票分组为正常发票才允许操作！')) {
        return
      }
      toCancelApply({ invoiceReceivableId: row.invoiceReceivableId }).then((res) => {
        this.rowData = row
        this.dialogVisible = true
        this.$nextTick(() => {
          this.backupOrderPropertyList = res.data.orderPropertyList.map((item, index) => {
            return {
              ...item,
              label: item.bdEmployeeName,
              value: item.bdEmployeeId + ',' + index,
              chargePersonId: item.bdEmployeeId,
            }
          })
          this.$refs.cancelInvoiceForm.resetFields()
          this.$nextTick(() => this.$refs.cancelInvoiceForm.clearValidate())
          this.cancelInvoiceForm.invoiceReceivableId = row.invoiceReceivableId
          this.cancelInvoiceForm.invoiceNo = row.invoiceNo
          this.cancelInvoiceForm.invoiceType = row.invoiceType
          // if (row.invoiceType == 'electronic' && row.invoiceWay == 'system') {
          //   this.cancelInvoiceRules.rivalInvoiceNo[0].required = false
          // } else {
          //   this.cancelInvoiceRules.rivalInvoiceNo[0].required = true
          // }
          console.log(this.cancelInvoiceRules.rivalInvoiceNo)
        })
      })
    },
    // 红冲作废确定
    cancelConfirm() {
      this.$refs.cancelInvoiceForm.validate((valid) => {
        console.log(valid)
        if (valid) {
          // if (this.cancelInvoiceForm.rivalInvoiceNo.length && this.cancelInvoiceForm.rivalInvoiceNo.length !== 8) {
          //   return this.$msgErrClose('红冲发票号必须是8位数字！')
          // }
          let chargePersonId = this.cancelInvoiceForm.chargePersonId && this.cancelInvoiceForm.chargePersonId + ''
          let obj = this.employeeSelectOptions.find((item) => item.value == chargePersonId)
          let chargePerson = obj && obj.label
          chargePersonId = chargePersonId ? chargePersonId.split(',')[0] : ''
          let data = Object.assign({}, this.cancelInvoiceForm, {
            chargePersonId,
            chargePerson,
          })
          // reverseType: this.isElec ? 'rush_red' : 'cancel',
          delete data.invoiceNo
          if (!chargePersonId) delete data.chargePersonId
          // invoiceReceivableId	是	int	应收发票id
          // rivalInvoiceNo	否	int	红冲发票号 取消类型为红冲必填
          // reverseType	是	String	取消类型
          // reason	是	String	取消原因
          // remark	是	String	取消原因说明
          // chargePersonType	是	String	责任类型 内部员工/客户
          // chargePersonId	否	String	责任人id
          // chargePerson	否	String	责任人名称
          this.dialogBtnLoading = true
          cancel(data)
            .then((res) => {
              this.$msgSucClose('红冲作废申请成功！')
              this.$refs.cancelInvoiceForm.resetFields()
              this.$refs.cancelInvoiceForm.clearValidate()
              this.getData()
              this.dialogVisible = false
            })
            .finally(() => (this.dialogBtnLoading = false))
        }
      })
    },
    getData(isSearch, customerList) {
      this.isNotFirtGetData = true
      this.lsLoading = true
      // let normal = this.searchOption.data.type === 'normal'
      // if (!normal && this.option1.columns[8].prop !== 'reason') {
      //   this.option1.columns.splice(8, 0, this.optionReason)
      // } else if (normal && this.option1.columns[8].prop === 'reason') {
      //   this.option1.columns.splice(8, 1)
      // }
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: customerList ? 0 : this.option1.pagination.pageSize,
        columns: [],
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption, true)
      if (this.buttonSearch) {
        data.query.push({
          column: 'status',
          type: 'eq',
          value: this.buttonSearch,
        })
      }
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      // let value = this.activeName === 'first' ? 'normal' : 'cancel'
      // data.query.push({ column: 'type', type: 'default', value })
      return listPage(data)
        .then((res) => {
          this.finCommonColumns(res)
          if (customerList) return
          this.$set(this.option1, 'emptyText', '未查询到任何数据')
          // if (res.data.configColumns && res.data.configColumns.length) {
          //   let columns = res.data.configColumns
          //   this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop)).filter((v) => v)
          //   this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
          //   this.configColumns = res.data.configColumns
          // }
          // console.log(this.selfColumnsBase)
          // console.log(this.configColumns)
          this.option1.data = res.data.list.map((item) => {
            // item.invoiceNo_multiValue = item.invoiceNo && item.invoiceNo.split(',')
            item.receivableRegNo_multiValue = item.receivableRegNo && item.receivableRegNo.split(',')
            item.settleOrderNo_multiValue = item.settleOrderNo && item.settleOrderNo.split(',')
            item.writeoffReceipayNo_multiValue = item.writeoffReceipayNo && item.writeoffReceipayNo.split(',')
            item.sourceBizNos_multiValue = (item.sourceBizNos || '').split(',')
            if (item.voucherNo) {
              let arr = item.voucherNo.split(',')
              item.voucherNo_multiValue = arr.map((v) => v.split('/')[1])
              item.acctVoucherSeqno_multiValue = arr.map((v) => v.split('/')[0])
              item.voucherNo = arr.map((v) => v.split('/')[1]).join(',')
            }
            return item
          })
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = res.data.currPage
          // this.option1.pagination.pageSize = res.data.pageSize
          // this.option1.pagination.totalCount = res.data.totalCount
        })
        .finally(() => {
          this.lsLoading = false
        })
      // this.debounceLs(() => {
      //   this.getListAmtSummary(data)
      // })
    },
    getListAmtSummary(data) {
      getListAmtSummary(data).then((res) => {
        if (res.code === 0 && res.data) {
          let data = {
            amtList: [],
            taxAmtList: [],
            amtWithoutTaxList: [],
            noWriteoffAmtList: [],
          }
          data = Object.assign(data, res.data)
          let labelObj = {
            amtListLabel: '开票金额',
            taxAmtListLabel: '含税金额',
            amtWithoutTaxListLabel: '不含税金额',
            noWriteoffAmtListLabel: '未核销金额',
          }
          let colorObj = {
            amtListColor: 'red', // 支持red, green, black三种值
            taxAmtListColor: 'green',
            amtWithoutTaxListColor: 'red',
            noWriteoffAmtListColor: 'green',
          }
          for (let key in data) {
            let value = data[key]
            value.forEach((item) => {
              if (item.currency === 'original') {
                item.currency = '原币'
              }
            })
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
    showColumnDetail(params) {
      this.showColumnDetailHandle(params, { isTab: true })
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
          return item.invoiceReceivableId
        })
        .join(',')
      if (ids) {
        data2.query.push({
          column: 'invoiceReceivableIds',
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
    handleEdit(row) {
      this.$confirm('确定进行发票打印？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then((res) => {
        this.printOnly(
          {
            SID: '2',
            invoiceReceivableId: row.invoiceReceivableId,
            invoiceType: row.invoiceType === 'ordinary' ? '2' : '0',
            invoiceCode: row.invoiceCode,
            invoiceNumber: row.invoiceNo,
          },
          () => this.getData(),
          row.settleCompCode
        )
      })
    },
    showDetail(row) {
      this.showOneNoDetail('invoiceNo', row.invoiceReceivableId, {
        isTab: true,
        receipayType: 'receive',
      })
    },
    showApplyDetail(row) {
      console.log(row)
      Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
        this.commonRoute(to, from)
      }
      let query = {
        source: 'apply',
        invoiceReceivableApplyId: row.invoiceReceivableApplyId,
      }
      this.routerPush('InvoiceReceivableApplyDetail', query)
    },
    showSettleOrderNoDetail(no) {
      Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
        this.commonRoute(to, from)
      }
      this.showOneNoDetail('settleOrderNo', row.settleOrderNo)
    },
    // 所属员工下拉框
    getEmployeeList2(queryString, item) {
      employeeSelectlist({ name: queryString }).then((res) => {
        if (
          this.remoteSelectCommon(
            item,
            res.data.map((item) => ({
              label: `${item.cname} (${item.employeeNo})`,
              value: item.employeeId,
            }))
          )
        )
          return
        let list = res.data.map((item) => ({
          ...item,
          label: `${item.cname} (${item.employeeNo})`,
          value: item.employeeId,
        }))
        item.remoteSelectList.splice(0, 1000, ...list)
        // console.log(this.employeeOptions)
      })
    },
    // 所属部门下拉框
    loanBasicData() {
      departmentTreeList({ state: 'valid' }).then((res) => {
        this.departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))
      })
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      data.forEach((item) => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
      return data
    },
    handleExport(type) {
      let columns = this.configColumns
      if (!columns.length) {
        columns = this.selfColumnsBase.map((item) => item.prop)
      }
      let data = {
        columns,
        ascColumns: [],
        descColumns: [],
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
      }
      data.query = this.searchBackup || []
      data.query = JSON.parse(JSON.stringify(data.query))

      if (this.multipleSelection1.length) {
        data.query = [
          {
            column: 'invoiceReceivableIds',
            type: 'in',
            value: this.multipleSelection1.map((v) => v.invoiceReceivableId).join(','),
          },
        ]
      }
      //查询对象的配置编码
      data.query.push({ column: 'queryDataModuleCode', value: type.value })
      this.btnLoading = true
      this.$store
        .dispatch('finance/downloadExcelFile', { data: data })
        .then((res) => {
          this.aTagClick(window.URL.createObjectURL(res), `应收发票${type.label}.xlsx`)
        })
        .finally(() => {
          this.btnLoading = false
        })
    },
    closeUpload(refresh) {
      this.showUpload = false
      refresh === true && this.getData()
    },
    // 批量下载附件
    downloadInvoiceFileBatch() {
      let rows = this.multipleSelection1
      if (!rows.length) {
        return this.$msgErrClose('请选择需要操作的项！')
      }
      rows = rows.filter((v) => v.fileNo)
      if (!rows.length) {
        return this.$msgErrClose('请选择有发票附件的项进行操作！')
      }
      this.btnLoading2 = true
      this.$store
        .dispatch('finance/downloadBlobFilePost', {
          uri: '/fin/invoiceReceivable/downloadInvoiceFileBatch',
          data: {
            data: { invoiceReceivableIds: rows.map((v) => v.invoiceReceivableId) },
          },
          resType: true,
        })
        .then((res) => {
          this.btnLoading2 = false
          let { resData, blob } = res
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob)
          let { invoiceNo, title } = rows[0]
          let type = resData.type.split('/')[1]
          link.download = `${rows.length == 1 ? invoiceNo + title : '发票附件'}.${type}`
          link.click()
        })
        .catch((e) => {
          this.btnLoading2 = false
          console.log(e)
        })
    },
    // TODO 收款登记
    regWriteoff() {
      let rows = this.multipleSelection1
      if (rows.length === 0) {
        return this.$msgErrClose('请选择需要收款登记的发票！')
      }
      if (rows.find((item) => item.noWriteoffAmt == 0)) {
        return this.$msgErrClose('发票关联的费用已全部核销！')
      }
      if (rows.find((item) => !item.settleOrderNo)) {
        return this.$msgErrClose('请先关联结算单费用！')
      }
      if (rows.find((item) => item.invoiceGroup !== 'normal' || item.status !== 'normal')) {
        return this.$msgErrClose('请选择发票状态和发票分组正常的发票！')
      }
      if ([...new Set(rows.map((item) => item.settleCorpCode))].length > 1) {
        return this.$msgErrClose('请选择结算单位相同的发票！')
      }
      this.loading = true
      toQuickRecvWriteoff({ invoiceReceivableIds: rows.map((v) => v.invoiceReceivableId) })
        .then((res) => {
          localStorage.setItem('_feeToRegParams', JSON.stringify(res))
          Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
            this.commonRoute(to, from)
          }
          // let query = {
          //   source: 'apply',
          //   invoiceReceivableApplyId: row.invoiceReceivableApplyId,
          // }
          // this.routerPush('InvoiceReceivableApplyDetail', query)
          this.routerPush('RegWriteoffDetail', { source: 'invoiceList' })
        })
        .finally(() => (this.loading = false))
    },
    relationRegDialog() {
      let rows = this.multipleSelection1
      if (rows.length === 0) {
        return this.$msgErrClose('请选择需要关联收款登记的发票！')
      }
      this.lsLoading = true
      listReceivableRegForWriteoff({
        invoiceReceivableIds: this.multipleSelection1.map((v) => v.invoiceReceivableId),
      })
        .then((res) => {
          this.relationRegList = res.data
          this.relationRegDialogVisible.show = true
        })
        .finally(() => (this.lsLoading = false))
    },
    relationRegClose(obj) {
      console.log(11111)
      this.routerPushTab(obj.name, obj.query)
    },
    remarkInput(val){
      let index = this.getCharLength(val)
      if (index) {
        this.cancelInvoiceForm.remark = val.slice(0, index)
        this.$msgErrClose(`红冲/作废说明字符长度超过159（1个中文占2个字符）,已自动截取！`)
      }
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
        if (len > 159) {
          index = i
          break
        }
      }
      return index
    },
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    InvoiceReceivableDetail,
    relateReveivableDialog,
    SettlementList,
    CustomColumns,
    InovicePreviewPrint,
    UploadInvoiceImg,
    RelationReg,
    PreviewDialog,
  },
}
</script>
<style>
.cancel-invoice-receivable-form .el-dialog__body {
  padding: 40px 80px 22px;
}
.cancel-invoice-receivable-form .el-dialog__footer {
  padding-bottom: 32px;
  padding-right: 90px;
}
.cancel-invoice-receivable-form .el-form .el-input {
  width: 260px;
}
.app-wrapper .cancel-invoice-receivable-form .el-form-item-cancelinvoice-remark textarea {
  min-height: 40px !important;
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
.finance-page .el-tabs__nav-scroll {
  padding-left: 20px;
}
</style>