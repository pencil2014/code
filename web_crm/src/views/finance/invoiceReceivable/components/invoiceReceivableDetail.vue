<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">{{isApply ? isPrerev ? '预收款开票详情' : '开票申请详情' : '发票详情'}}</div>
        </div>
        <div class="money-box-right">
          <el-button-group v-if="invoiceTableList.length">
            <el-button @click="previewInvoiceAll" size="mini">预览发票</el-button>
          </el-button-group>
          <el-button-group v-if="isPrerev && invoiceForm.confirmStatus == 'pending'">
            <el-button
              v-if="checkAuth($route.name, 'btn-auditPass')"
              class="finance-btn"
              size="mini"
              type="success"
              @click="applyAudit('pass')"
            >审核通过</el-button>
            <el-button
              v-if="checkAuth($route.name, 'btn-auditRefuse')"
              class="finance-btn"
              size="mini"
              type="danger"
              @click="applyAudit('refuse')"
            >审核拒绝</el-button>
          </el-button-group>
          <el-button-group v-else-if="!isApply && checkAuth($route.name, 'btn-exportFee')">
            <el-button type="primary" class="finance-btn" size="mini" @click="exportFee">导出费用</el-button>
          </el-button-group>
          <el-button-group
            v-if="!isApply && checkAuth($route.name, 'btn-uploadInvoiceImg') && invoiceTableList[0] && !invoiceTableList[0].fileName"
          >
            <el-button
              type="primary"
              class="finance-btn"
              size="mini"
              @click="showUpload = true"
            >上传发票附件</el-button>
          </el-button-group>
          <el-button-group
            v-if="!isApply && !isPrerev && checkAuth($route.name, 'btn-updateManualInvoiceInfo') && invoiceForm.invoiceWay === 'manual' && invoiceTableList[0]"
          >
            <el-button
              type="warning"
              class="finance-btn"
              size="mini"
              @click="dialogUpdateInfoShow"
            >更新发票信息</el-button>
          </el-button-group>
          <el-button-group v-if="!$route.query.fromOrder">
            <el-button class="finance-btn" @click="cancel" size="mini">返回</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    <el-form :model="invoiceForm" ref="form" :inline="true" size="mini" label-width="100px">
      <div class="settlement-detail-form">
        <h3>开票信息</h3>
        <div>
          <DetailDiv label="开票类型：" :content="dictMapObj['invoiceType'][invoiceForm.invoiceType]" />
          <DetailDiv label="开票币种：" :content="invoiceForm.invoiceCurrency" />
          <DetailDiv label="开票金额：" :content="invoiceForm.amt" />
          <DetailDiv label="开票方式：" :content="dictMapObj['invoiceWay'][invoiceForm.invoiceWay]" />
          <DetailDiv
            label="发票明细类型："
            :content="dictMapObj['invoiceItemGroupType'][invoiceForm.itemGoupType]"
          />
          <div v-if="invoiceRates1 && invoiceRates1.length > 0" class="settlement-exchange-rates">
            <el-form-item
              v-for="item in invoiceRates1"
              :key="item.src+item.to+item.rate"
              :label="'开票汇率：'"
              style="width:100%"
            >
              {{item.src+'-'+item.to}}
              <div style="width:100px;margin-right:-10px;display:inline-block">{{item.rate}}</div>
            </el-form-item>
            <div
              v-if="invoiceRates2 && invoiceRates2.length > 1"
              class="settlement-exchange-rates-more"
            >
              <el-button @click="showMoreRate" type="text" slot="reference">更多</el-button>
            </div>
          </div>
          <!-- <DetailDiv label="发票备注：" :content="invoiceForm.remark" :isFull="true" /> -->
        </div>
      </div>
      <div class="settlement-detail-form">
        <h3>客户信息</h3>
        <div>
          <DetailDiv label="结算单位：" :content="invoiceForm.unitName" :isTooltip="true" />
          <DetailDiv label="客户发票抬头：" :content="invoiceForm.title" :isTooltip="true" />
          <DetailDiv label="纳税人识别号：" :content="invoiceForm.taxNo" />
          <DetailDiv label="客户银行账号：" :content="invoiceForm.accountNo" />
          <DetailDiv label="发票展示开户行：" :content="invoiceForm.buyerBankInfo" :isTooltip="true" />
          <DetailDiv label="客户电话：" :content="invoiceForm.tel" />
          <DetailDiv label="客户地址：" :content="invoiceForm.addr" :isFull="true" />
          <DetailDiv label="客户邮箱：" :content="invoiceForm.emailAddrs" :isFull="true" />
        </div>
      </div>
      <div class="settlement-detail-form">
        <h3>我司信息</h3>
        <div>
          <DetailDiv label="所属分公司：" :content="invoiceForm.settleCompName" :isTooltip="true" />
          <DetailDiv label="银行简称：" :content="invoiceForm.saleCompAccountShortName" :isTooltip="true" />
          <DetailDiv label="发票抬头：" :content="invoiceForm.saleCompTitle" :isTooltip="true" />
          <DetailDiv label="纳税人识别号：" :content="invoiceForm.saleCompTaxNo" />
          <!-- <DetailDiv
            label="我司开户行："
            :content="`${invoiceForm.saleCompBankName}${invoiceForm.saleCompBankBranchName||''}`"
            :isTooltip="true"
          />-->
          <DetailDiv
            label="我司开户行："
            :content="invoiceForm.saleCompBankBranchName||''"
            :isTooltip="true"
          />
          <DetailDiv label="银行账号：" :content="invoiceForm.saleCompBankNo" />
          <DetailDiv label="电话：" :content="invoiceForm.saleCompTel" />
          <DetailDiv label="地址：" :content="invoiceForm.saleCompAddr" :isTooltip="true" />
          <!-- </el-form> -->
        </div>
      </div>
    </el-form>
    <div
      v-for="(item, index) in invoiceTableList"
      :key="'invoiceTableList' + index"
      class="finance-table-container"
    >
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">发票服务项-发票{{index + 1}}</div>
          <div class="money-total">
            开票金额合计：
            <span v-html="'CNY' + item.amtCny"></span>
          </div>
        </div>
        <div class="money-box-right">
          <el-button class="finance-btn" @click="previewInvoice(index)" size="mini">预览发票</el-button>
        </div>
      </div>
      <FinanceTableMass :option="item" v-show="showTable2" />
    </div>
    <el-form
      v-if="invoiceReceivableCancel"
      :model="invoiceReceivableCancel"
      ref="invoiceReceivableCancelForm"
      :inline="true"
      size="mini"
      label-width="100px"
    >
      <div class="settlement-detail-form">
        <h3>红冲/作废信息</h3>
        <div>
          <DetailDiv
            label="红冲/作废类型："
            :content="dictMapObj['invoiceReverseType'][invoiceReceivableCancel.reverseType]"
          />
          <DetailDiv
            v-if="invoiceReceivableCancel.reverseType !== 'cancel'"
            label="红冲发票号："
            :content="invoiceReceivableCancel.invoiceNo"
          />
          <DetailDiv
            label="责任人类型："
            :content="dictMapObj['invoiceCancelChangeType'][invoiceReceivableCancel.chargePersonType]"
          />
          <DetailDiv label="责任人：" :content="invoiceReceivableCancel.chargePerson" />
          <DetailDiv label="红冲发票附件：" :isSlot="true">
            <el-tooltip
              v-if="invoiceReceivableCancel.fileNo"
              :content="invoiceReceivableCancel.fileName"
              placement="top-start"
            >
              <el-tag
                class="detail__content"
                size="medium"
                @click="showAttachment(invoiceReceivableCancel.fileNo, invoiceReceivableCancel.fileName)"
              >{{ invoiceReceivableCancel.fileName }}</el-tag>
            </el-tooltip>
          </DetailDiv>
          <DetailDiv
            label="发票工本费："
            :content="invoiceReceivableCancel.feeAmt + invoiceReceivableCancel.feeCurrency"
          />
          <DetailDiv label="工作单号：" :content="invoiceReceivableCancel.orderNo" />
          <DetailDiv
            label="红冲作废原因："
            :content="dictMapObj['invoiceCancelReason'][invoiceReceivableCancel.reason] || invoiceReceivableCancel.reason"
          />
          <DetailDiv label="红冲作废说明：" :content="invoiceReceivableCancel.remark" :isFull="true" />
        </div>
      </div>
    </el-form>
    <div class="finance-table-container" v-if="!isPrerev">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">应收费用列表</div>
          <div class="money-total">
            原费共计：
            <span v-html="totalAmount"></span>
            <i style="margin-left:20px;"></i>开票共计：
            <!-- {{option1.data&&option1.data.length}}
            {{invoiceForm.invoiceCurrency + ' ' +invoiceForm.amt}} -->
            <span v-html="`${option1.data&&option1.data.length ? invoiceForm.invoiceCurrency + ' ' +invoiceForm.amt : ''}`"></span>
            <!-- <span v-html="totalInvoiceAmtApply"></span> -->
          </div>
        </div>
        <div class="money-box-right">
          <el-button
            type="text"
            class="finance-btn collapse-btn"
            @click="handleCollapse('Table1')"
            size="mini"
          >
            收起
            <i :class="[`el-icon-arrow-${showTable1 ? 'up' : 'down'}`]"></i>
          </el-button>
        </div>
      </div>
      <FinanceTableMass :option="option1" v-show="showTable1" />
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        @close="customColumnsPopClose"
      />
    </div>
    <InovicePreviewPrint
      :dialog-visible-o="dialogVisibleO"
      :customer-info="customerInfo"
      :seller-info="sellerInfo"
      :apply-item-group-list="applyItemGroupList"
      :list="invoicePreviewList"
      :other-invoice-info="otherInvoiceInfo"
      :isPrint="true"
      @print-invoice="printInvoice"
      :isElec="invoiceForm.invoiceType"
      :hideSave="true"
    />
    <!-- 审核拒绝弹框 -->
    <FinDialog :option="dialogApply" @close="applyClose" />
    <!-- 修改发票信息弹框 -->
    <FinDialog ref="updateInfo" :option="dialogUpdateInfo" @close="UpdateInfoClose" />
    <!-- 批量上传 -->
    <UploadInvoiceImg
      :showUpload="showUpload"
      :upload-params="{invoiceReceivableId}"
      :limit="1"
      @close-upload="closeUpload"
    >
      <!-- <span slot="remark" style="color: #E9851F">(附件名称含发票号)</span> -->
    </UploadInvoiceImg>
    <el-dialog
      title="开票汇率"
      :visible.sync="moreRateDialogVisible"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      width="604px"
    >
      <FinanceTableMass :option="option_rate" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="moreRateDialogVisible = false" size="mini">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import InovicePreviewPrint from './invoicePreviewPrint'
import FinDialog from '@/views/finance/components/financeDialog/finDialog'
import CustomColumns from '@/components/customColumns'
import UploadInvoiceImg from '@/views/finance/invoiceReceivable/components/uploadInvoiceImg'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { printMixin } from './mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { info, getPaperInvoiceList } from '@/api/fin/invoiceReceivableApply'
import {
  info as detail,
  exportFeeList as exportInvoiceFeeList,
  applyAudit,
  updateManualInvoiceInfo,
  cancelInfo,
} from '@/api/fin/invoiceReceivable'
import { listColumnConfigGet, listColumnConfigSave } from '@/api/base'
console.log(process.env.VUE_APP_BASE_API)
export default {
  mixins: [mixin, printMixin, routerMixin],
  data() {
    return {
      //批量上传
      showUpload: false,
      singleInvoiceType: '',
      dialogVisibleO: { show: false },
      showCorpInfo: false,
      billId: '',
      option1: {}, // 费用列表
      option2: {}, // 发票服务项列表
      moneyTitle1: '应收费用列表',
      moneyTitle2: '发票服务项',
      multipleSelection1: [],
      moreRateDialogVisible: false,
      invoiceForm: {
        invoiceType: '',
        title: '',
        taxNo: '',
        invoiceCurrency: '',
        splitNo: '',
        splitUnitAmt: '',
        itemGoupType: 'merge',
        rate: '',
        emailAddrs: '',
        remark: '',
        latestDate: '',
        postAddr: '',
        postPhone: '',
        postType: '',
        unitName: '',
        bankName: '',
        accountNo: '',
        addr: '',
        tel: '',
        amt: '',
        compBank: '',
      },
      settleCompInfo: {
        taxNo: '', // 分公司纳税人识别号
        unitName: '', // 分公司名称
        bankName: '', // 分公司开户行
        accountNo: '', // 分公司银行账号
        addr: '', // 分公司地址
        tel: '', // 分公司电话
      },
      settleOrderFeeIds: [], // 删除的结算单费用明细IDs
      searchWords: '',
      totalAmount: '',
      showTable1: true,
      showTable2: true,
      taxRate: '',
      dialogVisible: false,
      dialogVisibleO: {
        show: false,
      },
      customerInfo: {},
      sellerInfo: {},
      invoiceReceivableList: [],
      applyItemGroupList: [],
      otherInvoiceInfo: {},
      rowData: {},
      source: '',
      sourceType: '',
      settleCurrencyList: [],
      // quota: 0,
      invoiceRates: [],
      invoiceRates1: [], // 页面显示汇率
      invoiceRates2: [], // 页面显示更多汇率
      remarksOptions: [
        { label: '工作单号', value: 'orderNo' },
        { label: '开航日期', value: 'tdTime' },
        { label: '起运港', value: 'polPortName' },
        { label: '目的港', value: 'podPortName' },
        { label: '航名航次', value: 'vesselVoyage' },
        { label: '提单号', value: 'bl' },
        // { label: '开票金额', value: 'amt' }, // 不显示开票金额
        { label: '币种', value: 'currency' },
        { label: '开票汇率', value: 'rate' },
      ],
      remarksSetting: [],
      remarksObj: {
        orderNo: '',
        tdTime: '',
        polPortName: '',
        podPortName: '',
        vesselVoyage: '',
        bl: '',
        // amt: '',
        currency: '',
        rate: '',
      },
      invoiceTableList: [],
      invoiceReceivableId: '',
      invoiceReceivableCancel: null,
      vLoading: false,
      dialogApply: {
        show: false,
        labelWidth: '60px',
        title: '审核拒绝',
        text: '拒绝',
        formItems: [{ label: '拒绝原因', type: 'textarea', prop: 'refuseReason' }],
        form: { refuseReason: '' },
      },
      dialogUpdateInfo: {
        show: false,
        width: '600px',
        labelWidth: '100px',
        title: '更新发票信息',
        formItems: [
          { label: '发票代码', type: 'input', prop: 'invoiceCode', maxlength: 12 },
          { label: '发票号', type: 'input', prop: 'invoiceNo', rules: { required: true, message: ' ' } },
          { label: '开票时间', type: 'date', prop: 'issueTime' },
          { label: '开票附件', type: 'file', prop: 'fileName', limit: 1 },
        ],
        form: { invoiceCode: '', invoiceNo: '', issueTime: '', fileName: '' },
      },
      option_rate: {},
      // 自定义表头弹框
      customColumnsPopShow: false,
      selfColumnsBase: [],
      invoicePreviewList: [],
    }
  },
  components: {
    FinanceTableMass,
    InovicePreviewPrint,
    FinDialog,
    CustomColumns,
    UploadInvoiceImg,
  },
  created() {
    // this.source = this.$route.query.source
    // this.billId = this.$route.query.billId
    // this.getData()
  },
  methods: {
    clearInfo() {
      this.$refs.form.resetFields()
      // this.$refs.invoiceHandleForm.resetFields()
      // this.$refs.sellerInfo.resetFields()
      this.option1.data = []
      this.option2.data = []
      this.$nextTick(() => {
        this.invoiceForm.splitUnitAmt = this.invoiceForm.splitNo = this.invoiceForm.amt = ''
      })
    },
    getData() {
      this.lsLoading = true
      // console.log(this.rowData)
      // 列表详情
      let data, method
      let { invoiceReceivableId, invoiceNo, invoiceReceivableApplyId } = this.rowData // 依旧借用rowData
      if (!this.isApply) {
        // 列表详情
        data = invoiceReceivableId ? { invoiceReceivableId } : { invoiceNo }
        method = detail
      } else {
        // 申请列表详情
        data = { invoiceReceivableApplyId }
        method = info
      }
      method(data)
        .then((res) => this.renderData(res))
        .catch((err) => {
          console.log(err)
          this.cancel(true, true)
        })
    },
    renderData(res) {
      // 测试提出已关闭状态也许显示详情
      // let invoiceApplyStatus = res.data.invoiceApplyStatus
      // if (invoiceApplyStatus === 'close') {
      //   this.clearInfo()
      //   this.delVisitedView(this.$route)
      //   this.cancel()
      //   this.$message({ message: '开票申请已关闭！', type: 'error', showClose: true })
      //   return
      // }
      Object.assign(this.rowData, {}, res.data.invoiceReceivableApply)
      if (this.isApply) {
        Object.assign(this.invoiceForm, res.data)
      } else {
        Object.assign(this.invoiceForm, res.data.invoiceReceivableApply)
        this.invoiceReceivableId = res.data.invoiceReceivableId
        this.invoiceReceivableCancel = res.data.invoiceReceivableCancel
      }
      this.invoiceForm.amt = res.data.amt
      this.invoiceForm.issueTime = res.data.issueTime || this.invoiceForm.issueTime
      this.invoiceForm.invoiceCurrency = res.data.currency
      this.settleCurrencyList = [{ label: res.data.currency, value: res.data.currency }]
      let data = res.data
      // 详情改为组装从后台返回的数据
      // // 供应商、客户
      this.invoiceForm.settleCompCode = res.data.settleCompCode
      this.invoiceForm.unitName = res.data.settleCorpName
      this.invoiceForm.confirmStatus = res.data.confirmStatus
      this.invoiceForm.accountNo = res.data.accountNo
      this.invoiceForm.bankName = res.data.bankName
      this.invoiceForm.bankAccounts = [
        {
          bankName: res.data.bankName,
          accountNo: this.invoiceForm.accountNo,
        },
      ]
      this.invoiceForm.addr = res.data.addr
      this.invoiceForm.tel = res.data.tel
      this.invoiceForm.title = res.data.title
      this.invoiceForm.taxNo = res.data.taxNo
      this.invoiceForm.saleCompAccountShortName = res.data.saleCompAccountShortName
      this.customerInfo = {
        unitName: this.invoiceForm.unitName,
        taxNo: this.invoiceForm.taxNo,
        accountNo: this.invoiceForm.accountNo,
        addr: this.invoiceForm.addr,
        bankName: this.invoiceForm.bankName,
        tel: this.invoiceForm.tel,
        title: this.invoiceForm.title,
      }
      this.customerInfo.bankName = this.invoiceForm.buyerBankInfo
      // // 销售方
      this.invoiceForm.settleCompName = res.data.settleCompName
      this.invoiceForm.saleCompBankNo = res.data.saleCompAccountNo
      this.invoiceForm.saleCompBankName = res.data.saleCompBankName
      this.invoiceForm.compBanks = [
        {
          accountShortName: res.data.saleCompBankName,
          accountNo: this.invoiceForm.saleCompBankNo,
        },
      ]
      this.invoiceForm.saleCompTaxNo = res.data.taxpayerNo
      this.invoiceForm.saleCompAddr = res.data.saleCompAddr
      this.invoiceForm.saleCompTel = res.data.saleCompTel
      this.invoiceForm.saleCompTitle = res.data.saleCompTitle
      this.invoiceForm.saleCompTaxNo = res.data.taxpayerNo
      this.sellerInfo = {
        unitName: this.invoiceForm.settleCompName,
        taxNo: this.invoiceForm.saleCompTaxNo,
        accountNo: this.invoiceForm.saleCompBankNo,
        addr: this.invoiceForm.saleCompAddr,
        bankName: this.invoiceForm.saleCompBankName,
        tel: this.invoiceForm.saleCompTel,
        title: this.invoiceForm.saleCompTitle,
      }
      let { saleCompBankName, saleCompBankBranchName } = this.invoiceForm
      // this.sellerInfo.bankName = `${saleCompBankName}${saleCompBankBranchName || ''}`
      this.sellerInfo.bankName = saleCompBankBranchName || ''

      let { invoiceReceivableList = [], applyFeeList = [], invoiceReceivableFeeList = [], totalAmountList = [] } = res.data // applyItemGroupList
      // 费用列表
      let feeList = this.isApply ? applyFeeList : invoiceReceivableFeeList
      this.option1.data = feeList // applyFeeList || []
      this.totalAmount = totalAmountList.reduce((str, cur) => `${str}${cur.currency} ${cur.amt}　`, '')
      /* 汇率开始 */
      let invoiceRates = feeList.map((v) => v.currency + '-' + (v.invoiceCurrency || v.currency) + '-' + v.rate)
      invoiceRates = [...new Set(invoiceRates)]
      invoiceRates = invoiceRates.map((v) => {
        let arr = v.split('-')
        return { src: arr[0], to: arr[1], rate: arr[2] }
      })
      this.invoiceRates1 = invoiceRates && invoiceRates.length ? [invoiceRates[0]] : []
      this.invoiceRates2 = invoiceRates || []
      /* 汇率结束 */
      // 服务项列表
      invoiceReceivableList = this.isApply ? invoiceReceivableList : [res.data]
      this.renderInvoiceReceivableList(invoiceReceivableList)
    },
    renderInvoiceReceivableList(invoiceReceivableList) {
      this.invoiceReceivableList = invoiceReceivableList
      this.invoiceTableList = []
      invoiceReceivableList.forEach((item, i) => {
        this.addInvoice()
        this.invoiceTableList[i].invoiceReceivableId = item.invoiceReceivableId
        this.invoiceTableList[i].fileNo = item.fileNo
        this.invoiceTableList[i].remark = item.remark
        this.invoiceTableList[i].fileName = item.fileName
        this.invoiceTableList[i].remark = item.remark
        this.invoiceTableList[i].amtCny = item.amtCny
        this.invoiceTableList[i].data = item.invoiceReceivableItemList.map((subItem, index) => {
          // if (index === 0) {
          subItem.invoiceCode = this.invoiceReceivableList[i].invoiceCode
          subItem.invoiceNo = this.invoiceReceivableList[i].invoiceNo
          subItem.fileNo = this.invoiceReceivableList[i].fileNo
          subItem.remark = this.invoiceReceivableList[i].remark
          subItem.fileName = this.invoiceReceivableList[i].fileName
          subItem.invoiceNo = this.invoiceReceivableList[i].invoiceNo
          subItem.invoiceGroup = this.invoiceReceivableList[i].invoiceGroup
          subItem.issueTime = this.invoiceReceivableList[i].issueTime && this.invoiceReceivableList[i].issueTime.split(' ')[0]
          // } else if (index > 0) {
          //   subItem.invoiceNo = ''
          //   subItem.issueTime = ''
          // }
          let rowsCount = item.invoiceReceivableItemList.length
          // return { ...subItem, edit: false, rowsCount, amtWithoutTax: decimalFixed2(subItem.amt / (1 + subItem.taxRate)) }
          return {
            ...subItem,
            edit: false,
            rowsCount,
            amtWithoutTax: new LSnum(subItem.amt).div(new LSnum(subItem.taxRate).plus(1)).toNum(2),
          }
        })
      })
      this.lsLoading = false
    },
    addInvoice() {
      this.invoiceTableList.push(this.initInvoiceTableOption(this.invoiceTableList.length))
    },
    initInvoiceTableOption(index) {
      // 发票服务项
      let operationBtns2 = Object.assign({}, this.option.operationBtns, {
        show: false,
      })
      let option = Object.assign({}, this.option, {
        id: 'option' + (index + 2),
        $name: 'InvoiceReceivableDetail2',
        data: [],
        tips: false,
        operationBtns: operationBtns2,
        selection: {
          show: false,
        },
        edit: true,
        spanMethod: ({ row, column, rowIndex, columnIndex }) => {
          if (columnIndex >= 8) {
            if (rowIndex === 0) {
              return {
                rowspan: row.rowsCount, // 经过处理
                colspan: 1,
              }
            } else {
              return {
                rowspan: 0,
                colspan: 0,
              }
            }
          }
        },
      })
      option.columns = [
        { prop: 'itemName', label: '服务名称', type: 'input' },
        { prop: 'unit', label: '单位', type: 'select', propInDict: 'feeUnit' },
        { prop: 'count', label: '数量', type: 'input', inputType: 'number' },
        { prop: 'price', label: '单价', type: 'input' },
        // 和后台确定是含税的金额，但预览发票时要显示不含税的金额，要计算
        { prop: 'amt', label: '金额', type: 'text' },
        { prop: 'amtWithoutTax', label: '金额(不含税)', type: 'text' },
        { prop: 'taxRate', label: '税率', type: 'select', propInDict: 'taxRateInfo' },
        { prop: 'taxAmt', label: '税额', type: 'text' },
        { prop: 'invoiceNo', label: '发票号', type: 'text', width: 100 },
        {
          prop: 'fileName',
          label: '开票附件',
          type: 'button',
          width: 160,
          callback: (row, index) => {
            // console.log(this.getDownloadPath(row.fileNo));
            window.open(this.getDownloadPath(row.fileNo, 'sowoll'))
          },
        },
        { prop: 'issueTime', label: '开票时间', type: 'text', width: 130 },
        { prop: 'remark', label: '发票备注', type: 'text', width: 150 },
      ]
      if (!this.isPrerev && !this.isApply) {
        option.columns.splice(
          8,
          0,
          { prop: 'invoiceGroup', label: '发票分组', type: 'select' },
          { prop: 'invoiceCode', label: '发票代码', type: 'text' }
        )
      }
      return option
    },
    previewInvoiceAll() {
      this.dealInvoiceList(() => this.previewInvoice(true))
    },
    validateApply(index) {
      let invoiceTable = this.invoiceTableList[index]
      let itemSum = invoiceTable.data.reduce((sum, curr) => {
        return new LSnum(sum).plus(curr.amt).toNum(2)
      }, BIGZERO)
      return invoiceTable.data.map((item) => {
        return {
          ...item,
          taxRate: +item.taxRate,
          itemSum,
          itemSumInvoiceCurrency: invoiceTable.itemSumInvoiceCurrency,
        }
      })
    },
    dealInvoiceList(cb) {
      this.invoicePreviewList = []
      this.invoiceTableList.forEach((item, index) => {
        let applyItemGroupList = this.validateApply(index)
        this.invoicePreviewList.push({
          forceChangeOther: true,
          remark: item.remark,
          invoiceCode: applyItemGroupList[0].invoiceCode || '',
          invoiceNo: applyItemGroupList[0].invoiceNo,
          invoiceDate: applyItemGroupList[0].invoiceDate,
          applyItemGroupList,
          totalInvoiceAmtApply: applyItemGroupList[0].itemSum,
        })
      })
      cb && cb()
    },
    previewInvoice(index) {
      if (index !== true) {
        this.invoicePreviewList.splice(0, 1000)
      }
      this.applyItemGroupList = JSON.parse(JSON.stringify(this.invoiceTableList[index === true ? 0 : index].data))
      let { invoiceCurrency } = this.invoiceForm
      let totalInvoiceAmtApply = this.applyItemGroupList.reduce((total, curr) => total.plus(curr.amt), BIGZERO).toNum(2)
      let remark = this.invoiceTableList[index === true ? 0 : index].remark
      this.otherInvoiceInfo = {
        currency: invoiceCurrency,
        totalInvoiceAmtApply,
        taxRate: this.taxRate,
        invoiceCode: this.applyItemGroupList[0].invoiceCode || '',
        invoiceNo: this.applyItemGroupList[0].invoiceNo,
        invoiceDate: this.invoiceForm.issueTime ? this.invoiceForm.issueTime.slice(0, 10) : null,
        receiver: null,
        reviewer: null,
        createdName: null,
        remark,
      }
      this.dialogVisibleO.show = true
    },
    // 打印发票按钮
    printInvoice() {
      if (this.rowData.invoiceType === 'electronic') {
        return this.$message({
          message: '不能打印电子发票',
          type: 'error',
          showClose: true,
        })
      }
      // 走批量打印流程
      getPaperInvoiceList({ invoiceReceivableApplyIds: [this.rowData.invoiceReceivableApplyId] }).then((res) => {
        // invoiceReceivableId使用预览前的赋值
        // this.invoiceReceivableId = res.data[0].invoiceReceivableId
        if (!this.invoiceForm.settleCompCode) {
          return this.$msgErrClose('缺少分公司信息！')
        }
        this.queryStockAction(undefined, undefined, undefined, this.invoiceForm.settleCompCode)
      })
    },
    // 导出费用
    exportFee() {
      let data = {
        invoiceReceivableId: this.invoiceReceivableId,
      }
      this.lsLoading = true
      this.$confirm('是否确认导出开票费用明细?', '导出', {
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
                  uri: '/fin/invoiceReceivable/exportFeeList',
                  data: { data },
                })
                .then((res) => {
                  this.option1.loading = false
                  console.log(res)
                  let link = document.createElement('a')
                  link.href = window.URL.createObjectURL(res)
                  link.download = '开票费用明细.xlsx'
                  link.click()
                  done()
                  instance.confirmButtonLoading = false
                  this.lsLoading = false
                })
                .catch(() => {
                  this.option1.loading = false
                  this.$message({ message: '导出失败', type: 'error' })
                  done()
                  instance.confirmButtonLoading = false
                  this.lsLoading = false
                })
            }, 10)
          } else {
            done()
            instance.confirmButtonLoading = false
            this.lsLoading = false
          }
        },
      })
        .then(() => {})
        .catch(() => {})
    },
    handleView(row) {
      // let VUEAPPBASEAPI = process.env.VUE_APP_BASE_API
      // VUEAPPBASEAPI = VUEAPPBASEAPI.match('http') ? VUEAPPBASEAPI : 'http://ls.com/'
      //       let fileUrl = `${VUEAPPBASEAPI}/base/fileView/preview/${row.fileNo}/${row.fileName}`
      //       let href = `/file/onlinePreview?url=${encodeURIComponent(fileUrl)}`
      window.open(`/base/fileView/preview/${row.fileNo}/sowoll`)
    },
    handleCollapse(val) {
      this['show' + val] = !this['show' + val]
    },
    cancel(clearInfo, delVisitedView) {
      if (this.$route.query.backToList) {
        this.clearInfo()
        this.delVisitedView(this.$route)
        this.routerPush('InvoiceReceivable')
        return
      }
      clearInfo === true && this.clearInfo()
      delVisitedView === true && this.delVisitedView(this.$route)
      this.routerBack()
      // this.routerBack(this.isApply ? 'InvoiceReceivableApplyDetail' : 'InvoiceReceivableDetail')
    },
    // 审核
    applyAudit(confirmStatus) {
      if (confirmStatus == 'pass') {
        return this.sureApplyAudit(confirmStatus)
      }
      this.dialogApply.show = true
    },
    // 审核拒绝弹框
    applyClose(tag) {
      if (!tag) {
        return (this.dialogApply.show = false)
      }
      this.sureApplyAudit('refuse')
    },
    // 确定审核
    sureApplyAudit(confirmStatus) {
      let data = {
        invoiceReceivableApplyIds: [this.rowData.invoiceReceivableApplyId],
        confirmStatus,
        refuseReason: this.dialogApply.form.refuseReason,
      }
      this.lsLoading = true
      applyAudit(data)
        .then((res) => {
          this.dialogApply.show = false
          this.getData()
        })
        .finally(() => (this.lsLoading = false))
    },
    // 打开更新发票信息弹框
    dialogUpdateInfoShow() {
      this.dialogUpdateInfo.show = true
      let obj = this.invoiceReceivableList[0]
      this.dialogUpdateInfo.form = { invoiceCode: '', invoiceNo: '', issueTime: '', fileName: '' }
      setTimeout(() => {
        Object.assign(this.dialogUpdateInfo.form, obj, { issueTime: obj.issueTime ? obj.issueTime.slice(0, 10) : '' })
        obj.fileName && this.$refs.updateInfo.$refs.fileupload[0].fileList.push({ name: obj.fileName })
      }, 300)
    },
    // 更新发票信息弹框 确认 | 取消
    UpdateInfoClose(tag) {
      console.log(this.dialogUpdateInfo.form)
      if (!tag) {
        return (this.dialogUpdateInfo.show = false)
      }
      let data = {
        invoiceReceivableId: this.dialogUpdateInfo.form.invoiceReceivableId,
        invoiceCode: this.dialogUpdateInfo.form.invoiceCode,
        invoiceNo: this.dialogUpdateInfo.form.invoiceNo,
        issueTime: this.dialogUpdateInfo.form.issueTime,
      }
      if(data.invoiceNo.length !== 8 && data.invoiceNo.length !== 20){
        return this.$msgErrClose(`发票号长度只能是8位或20位！`)
      }
      if (this.dialogUpdateInfo.form.__fileName__ === '') {
        data.fileName = data.fileNo = ''
      } else if (this.dialogUpdateInfo.form.__fileName__ === undefined) {
        data.fileName = this.dialogUpdateInfo.form.fileName
        data.fileNo = this.dialogUpdateInfo.form.fileNo
      } else {
        data.fileName = this.dialogUpdateInfo.form.__fileName__
        data.fileNo = this.dialogUpdateInfo.form.fileName
      }
      if (data.invoiceNo.length !== 8 || /\D/.test(data.invoiceNo)) {
        return this.$msgErrClose('请输入8位数字的发票号！')
      }
      if (data.invoiceCode.length && (data.invoiceCode.length !== 12 || /\D/.test(data.invoiceCode))) {
        return this.$msgErrClose('请输入12位数字的发票代码！')
      }
      this.lsLoading = true
      updateManualInvoiceInfo(data)
        .then((res) => {
          this.$msgSucClose('更新成功！')
          this.dialogUpdateInfo.show = false
          this.getData()
        })
        .finally(() => (this.lsLoading = false))
      // this.sureApplyAudit('refuse')
    },
    showMoreRate() {
      this.option_rate = Object.assign({}, this.option, {
        id: 'option_rate',
        $name: 'InvoiceReceivableDetail4',
        data: [],
        tips: { text: '', show: false },
        operationBtns: { show: false },
        selection: { show: false },
      })
      let columns = [
        { prop: 'src', label: '原币种', type: 'text' },
        { prop: 'to', label: '开票币种', type: 'text' },
        { prop: 'rate', label: '开票汇率', type: 'input' },
      ]
      this.option_rate.columns = columns
      this.option_rate.data = this.invoiceRates2
      this.moreRateDialogVisible = true
    },
    // 自定义表头
    customColumnsPopClose(action, value) {
      this.customColumnsPopShow = false
      if (action === 'Confirm') {
        let columnList = this.getColumnsValues(value) // getColumnsValues在本页面无作用
        listColumnConfigSave({ columnList, scenesCode: 'rec_invoice_detail_fee' }).then((res) => {
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
    closeUpload(refresh) {
      this.showUpload = false
      refresh === true && this.getData()
    },
    showAttachment(path, name) {
      window.open(`/base/fileView/preview/${path}/sowoll`)
    },
  },
  activated() {
    if (this.$route.meta.isUseCache) {
      console.log(1111111111)
      return
    }
    this.showCorpInfo = false
    this.invoiceReceivableCancel = null
    this.sellerInfo = {}
    this.customerInfo = {}
    // this.rowData = JSON.parse(this.$route.query.rowData)
    this.rowData.invoiceReceivableId = this.$route.query.invoiceReceivableId
    this.rowData.invoiceNo = this.$route.query.invoiceNo
    this.rowData.invoiceReceivableApplyId = this.$route.query.invoiceReceivableApplyId
    this.source = this.$route.query.source
    this.sourceType = this.$route.query.type

    let comm = { operationBtns: false, data: [], tips: { text: '', show: false }, selection: false }
    // 应用费用列表
    this.option1 = Object.assign({}, this.option, comm, {
      id: 'option1',
      $name: 'InvoiceReceivableDetail1',
      tips: false,
      customColumns: {
        show: true,
        handleCustomColumns: () => (this.customColumnsPopShow = true),
      },
      colorColumns: ['receipayType'],
    })

    this.selfColumnsBase = [
      {
        prop: 'orderNo',
        label: '单号',
        type: 'button',
        minWidth: 130,
        formatter: ({ row }) => row.orderNo || row.sourceBizNo,
        operationBtns: {
          show: true,
          callback: (action, index, row, option) => {
            this.showOneNoDetail(row.sourceType, row.orderNo || row.sourceBizNo)
          },
        },
      },
      // { prop: 'orderNo', label: '单号', type: 'text', width: 130 },
      { prop: 'settleCompName', label: '分公司', type: 'text', minWidth: 150 },
      { prop: 'settleCorpName', label: '结算单位', type: 'text', minWidth: 150 },
      { prop: 'serviceName', label: '服务项', type: 'text', width: 100 },
      { prop: 'feeName', label: '费用名称', type: 'text', width: 100 },
      { prop: 'feeEnName', label: '费用英文名', type: 'text', width: 100 },
      { prop: 'receipayType', label: '应收应付', type: 'select', readOnly: true, width: 100 },
      { prop: 'currency', label: '币种', type: 'text', width: 70 },
      { prop: 'unitPrice', label: '单价', type: 'text', width: 70 },
      { prop: 'unitCount', label: '数量', type: 'text', width: 70 },
      { prop: 'feeAmt', label: '金额', type: 'text', width: 70 },
      { prop: 'feeUnit', label: '计费单位', type: 'select', width: 70 },
      { prop: 'taxRate', label: '税率', type: 'select', propInDict: 'taxRateInfo', width: 70 },
      // { prop: 'feeAmtWithTax', label: '含税费用金额', type: 'text' },
      { prop: 'taxAmt', label: '税额', type: 'text', width: 70 },
      { prop: 'feeAmtWithoutTax', label: '不含税金额', type: 'text', width: 70 },
      // { prop: 'writeoffAmt', label: '已核销金额', type: 'text' },
      { prop: 'invoiceAmt', label: '已开票金额', type: 'text', width: 70 },
      { prop: 'invoiceBalanceAmt', label: '可开票金额', type: 'text', width: 70 }, // , formatter: (row, pItem) => {return row['feeAmt'] - row['invoiceApplyAmt']}
      { prop: 'applyAmt', label: '开票金额', type: 'text', width: 70 },
      { prop: 'invoiceCurrency', label: '开票币种', type: 'text', width: 70 },
      { prop: 'rate', label: '开票汇率', type: 'text', width: 70 },
    ]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.option1.columns = [...this.selfColumnsBase]
    listColumnConfigGet({ scenesCode: 'rec_invoice_detail_fee' }).then((res) => {
      this.columnConfig = true
      this.dealCustomColumn(res)
    })
    // 发票服务项
    this.option2 = Object.assign({}, this.option, comm, { id: 'option2', $name: 'InvoiceReceivableDetail2', tips: false })
    let columns2 = [
      { prop: 'itemName', label: '服务名称', type: 'input' },
      { prop: 'feeUnit', label: '单位', type: 'select' },
      { prop: 'count', label: '数量', type: 'input' },
      { prop: 'price', label: '单价', type: 'input' },
      // 和后台确定是含税的金额，但预览发票时要显示不含税的金额，要计算
      { prop: 'amt', label: '金额', type: 'text' },
      { prop: 'amtWithoutTax', label: '金额（不含税）', type: 'text' },
      { prop: 'taxRate', label: '税率', type: 'select', propInDict: 'taxRateInfo' },
      { prop: 'taxAmt', label: '税额', type: 'text' },
    ]
    this.option2.columns = columns2
    this.getData()
  },
  // beforeRouteLeave(to, from, next) {
  //   this.mainRouteLeave(to, from, next, ['InvoiceReceivableList'])
  // },
  computed: {
    isApply() {
      return this.source === 'apply'
    },
    isPrerev() {
      return this.sourceType === 'prerev'
    },
  },
}
</script>
<style lang="scss" scoped>
.finance-page ::v-deep {
  padding-bottom: 1px;
  .detail__div {
    margin-right: 14px !important;
  }
}
// .finance-detail-page {
//   margin: 0;
// }
// .finance-detail-page-background {
//   background: #fff;
// }
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
}
// .invoice-handle-form .el-form-item,
// .invoice-seller-form .el-form-item {
//   width: 262px;
// }
.el-form-item-text {
  font-size: 12px;
  /* width: 180px; */
}
.settlement-detail-form {
  border-bottom: 1px solid #e9e9e9;
}
.settlement-detail-form:nth-of-type(4) {
  border-bottom: none;
}
/* .settlement-detail-form {
  padding: 20px 16px 8px;
} */
.settlement-exchange-rates {
  /* width: 260px; */
  display: inline-block;
  vertical-align: top;
  position: relative;
  margin-right: 16px;
}
// .settlement-exchange-rates .settlement-exchange-rates-title {
//   color: #222222;
//   line-height: 20px;
// }
.settlement-exchange-rates-title {
  color: #606266;
  line-height: 20px;
  margin-bottom: 6px;
  display: inline-block;
}
.settlement-exchange-rates-more {
  position: absolute;
  right: -30px;
  top: 4px;
  .el-button {
    padding-top: 0;
    padding-bottom: 0;
    font-size: 12px;
    color: #3e80f5;
  }
}
.finance-table-container {
  margin: 4px 16px 0px;
}
// .invoice-handle-form {
//   padding-top: 16px;
// }
// .invoice-detail-handle-gap {
//   margin: 0 24px;
//   height: 1px;
//   background: #e9e9e9;
// }
// .invoice-seller-form {
//   padding-top: 0;
// }
// .invoice-preview-container {
//   margin: 20px auto 0;
//   width: 1000px;
//   height: 650px;
//   background-image: url(../../../../assets/invoice-blank.jpg);
//   background-size: 100% 100%;
//   position: relative;
// }
// .invoice-preview-text {
//   position: absolute;
//   font-size: 12px;
//   color: #606266;
// }
// .settlement-detail-form .el-form-item-invoice-remark {
//   width: 100%;
// }
// .settlement-detail-form .el-form-item-invoice-remark ::v-deep .el-form-item__content {
//   width: calc(100% - 100px);
// }
</style>