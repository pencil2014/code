<template>
  <div class="finance-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground">
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">应付发票{{isDetail ? "详情":"登记"}}</div>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" @click="cancel" size="mini">取消</el-button>
          </el-button-group>
          <el-button-group v-if="!isDetail">
            <el-button class="finance-btn" @click="submitAdd" type="primary" size="mini">提交</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    <el-form
      :model="invoicePaymentAddForm"
      :rules="invoicePaymentAddRules"
      ref="form"
      :inline="true"
      size="mini"
      label-width="95px"
    >
      <div class="settlement-detail-form invoice-detail-form-border-bottom">
        <h3>供应商信息</h3>
          <el-form-item label="结算单位" prop="supplierCorpName">
            <el-input v-model="invoicePaymentAddForm.supplierCorpName" disabled placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="发票抬头" prop="supplierTitle">
            <el-input v-model="invoicePaymentAddForm.supplierTitle" disabled placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="纳税人识别号" prop="supplierTaxpayerNo">
            <el-input v-model="invoicePaymentAddForm.supplierTaxpayerNo" disabled placeholder=""></el-input>
          </el-form-item>
          <!-- <el-form-item label="收款银行" prop="supplierBankName">
            <el-input v-model="invoicePaymentAddForm.supplierBankName" disabled placeholder=""></el-input>
          </el-form-item> -->
          <el-form-item label="开户行" prop="">
              <el-input :value="`${invoicePaymentAddForm.supplierBankName ? invoicePaymentAddForm.supplierBankName : ''}${invoicePaymentAddForm.supplierBankBranchName?'(':''}${invoicePaymentAddForm.supplierBankBranchName ? invoicePaymentAddForm.supplierBankBranchName : ''}${invoicePaymentAddForm.supplierBankBranchName?')':''}`" placeholder="请输入" disabled></el-input>
          </el-form-item>
          <!-- <el-form-item label="供应商开户行" prop="supplierBankBranchName">
            <el-input v-model="invoicePaymentAddForm.supplierBankBranchName" disabled placeholder=""></el-input>
          </el-form-item> -->
          <el-form-item label="银行账号" prop="supplierAccountNo">
            <el-input v-model="invoicePaymentAddForm.supplierAccountNo" disabled placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="supplierTel">
            <el-input v-model="invoicePaymentAddForm.supplierTel" disabled placeholder=""></el-input>
          </el-form-item>
          <br />
          <div style="margin-left:24px;">
            <el-form-item label="地址" label-width="70px" prop="supplierAddr" class="el-form-item-invoice-remark el-form-item-invoice-remark-20">
              <el-input
                type="textarea"
                disabled
                v-model="invoicePaymentAddForm.supplierAddr"
                placeholder="请输入"
                maxlength="500"
                show-word-limit
              ></el-input>
            </el-form-item>
          </div>
      </div>
      <div class="settlement-detail-form invoice-detail-form-border-bottom">
          <h3>我司信息</h3>
          <el-form-item label="银行简称" prop="accountShortName">
            <el-input v-model="invoicePaymentAddForm.accountShortName" disabled placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="我司发票抬头" prop="title">
            <el-input v-model="invoicePaymentAddForm.title" disabled placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="纳税人识别号" prop="taxNo">
            <el-input v-model="invoicePaymentAddForm.taxNo" disabled placeholder=""></el-input>
          </el-form-item>
          <!-- <el-form-item label="付款银行" prop="bankName">
            <el-input v-model="invoicePaymentAddForm.bankName" disabled placeholder=""></el-input>
          </el-form-item> -->
          <el-form-item label="我司开户行" prop="">
            <el-input :value="`${invoicePaymentAddForm.bankName ? invoicePaymentAddForm.bankName : ''}${invoicePaymentAddForm.bankBranchName?'(':''}${invoicePaymentAddForm.bankBranchName ? invoicePaymentAddForm.bankBranchName : ''}${invoicePaymentAddForm.bankBranchName?')':''}`" placeholder="请输入" disabled></el-input>
          </el-form-item>
          <!-- <el-form-item label="我司开户行" prop="bankBranchName">
            <el-input v-model="invoicePaymentAddForm.bankBranchName" disabled placeholder=""></el-input>
          </el-form-item> -->
          <el-form-item label="我司账号" prop="accountNo">
            <el-input v-model="invoicePaymentAddForm.accountNo" disabled placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="我司电话" prop="tel">
            <el-input v-model="invoicePaymentAddForm.tel" disabled placeholder=""></el-input>
          </el-form-item>
          <div style="margin-left:24px">
            <el-form-item label="我司地址" label-width="70px" prop="addr" class="el-form-item-invoice-remark el-form-item-invoice-remark-20" >
              <el-input
                type="textarea"
                disabled
                autosize
                v-model="invoicePaymentAddForm.addr"
                placeholder=""
                maxlength="500"
                show-word-limit
              ></el-input>
            </el-form-item>
          </div>
      </div>
      <div class="settlement-detail-form invoice-detail-form-border-bottom">
          <h3>发票信息</h3>
          <el-form-item label="财务接收" prop="receiveState">
            <el-select v-model="invoicePaymentAddForm.receiveState" disabled placeholder="">
              <el-option
                v-for="(op, j) in dictMap.yesNo"
                :key="'currency' + j"
                :label="op.label"
                :value="op.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="发票号" prop="invoiceNo">
            <el-input v-model="invoicePaymentAddForm.invoiceNo" disabled placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="发票代码" prop="invoiceCode">
            <el-input v-model="invoicePaymentAddForm.invoiceCode" disabled placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="开票币种" prop="currency">
            <el-input v-model="invoicePaymentAddForm.currency" disabled placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="银行名称" prop="bankName">
            <el-input v-model="invoicePaymentAddForm.bankName" disabled placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="开票类型" prop="invoiceType">
            <el-select v-model="invoicePaymentAddForm.invoiceType" disabled placeholder="">
              <el-option
                v-for="(op, j) in dictMap['invoiceType']"
                :key="'invoiceType' + j"
                :label="op.label"
                :value="op.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="开票日期" prop="">
            <el-input v-model="invoicePaymentAddForm.invoiceIssueDate" disabled placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="发票登记号" prop="">
            <el-input v-model="invoicePaymentAddForm.receiveNo" disabled placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="开票汇率" prop="rate">
            <el-input v-model="invoicePaymentAddForm.rate" disabled placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="发票金额" prop="amt">
            <el-input v-model="invoicePaymentAddForm.amt" disabled placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="税率" prop="taxRate">
            <el-select v-model="invoicePaymentAddForm.taxRate" disabled placeholder="">
              <el-option
                v-for="(op, j) in dictMap.taxRateInfo"
                :key="'currency' + j"
                :label="op.label"
                :value="+op.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="税额" prop="taxAmt">
            <el-input v-model="invoicePaymentAddForm.taxAmt" disabled placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="价税合计(CNY)" prop="taxTotalInclud">
            <el-input v-model="invoicePaymentAddForm.taxTotalInclud" disabled placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="不含税金额" prop="taxTotalExclud">
            <el-input v-model="invoicePaymentAddForm.taxTotalExclud" disabled placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="登记人" prop="createdName">
            <el-input v-model="invoicePaymentAddForm.createdName" disabled placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="登记时间" prop="createdTime">
            <el-date-picker v-model="invoicePaymentAddForm.createdTime" disabled placeholder=""></el-date-picker>
          </el-form-item>
          <el-form-item label="更新人" prop="updatedName">
            <el-input v-model="invoicePaymentAddForm.updatedName" disabled placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="更新时间" prop="updatedTime">
             <el-date-picker v-model="invoicePaymentAddForm.updatedTime" disabled placeholder=""></el-date-picker>
          </el-form-item>
          <DetailDiv   label="发票附件"  :isSlot="true" >
            <el-tooltip v-if="invoicePaymentAddForm.fileName" :content="invoicePaymentAddForm.fileName" placement="top-start">
              <el-tag
              class="detail__content" 
              size="medium"
              @click="showInvoicePayment(invoicePaymentAddForm.invoicePaymentId)"
              >{{ invoicePaymentAddForm.fileName }}</el-tag>
            </el-tooltip>
          </DetailDiv>
          <DetailDiv   label="发票查验件"  :isSlot="true" >
            <el-tooltip v-if="invoicePaymentAddForm.checkInvoiceFileName" :content="invoicePaymentAddForm.checkInvoiceFileName" placement="top-start">
              <el-tag
              class="detail__content" 
              size="medium"
               @click="showCheckInvoiceFile(invoicePaymentAddForm.checkInvoiceFileNo)"
              >{{ invoicePaymentAddForm.checkInvoiceFileName }}</el-tag>
            </el-tooltip>
          </DetailDiv>
          <!-- <el-form-item label="发票附件" class="invoice-payment-add-form-upload" prop="fileName">
            <el-button v-if="invoicePaymentAddForm.fileName" size="mini" type="text" @click="showInvoicePayment(invoicePaymentAddForm.invoicePaymentId)">{{invoicePaymentAddForm.fileName}}</el-button>
          </el-form-item>
          <el-form-item v-if="invoicePaymentAddForm.checkInvoiceFileName" label="发票查验件" class="invoice-payment-add-form-upload" prop="checkInvoiceFileName">
            <el-button size="mini" type="text" @click="showCheckInvoiceFile(invoicePaymentAddForm.checkInvoiceFileNo)">{{invoicePaymentAddForm.checkInvoiceFileName}}</el-button>
          </el-form-item> -->
          <div style="margin-left:24px">
            <el-form-item label-width="70px" label="发票备注" prop="remark" class="el-form-item-invoice-remark el-form-item-invoice-remark-20">
              <el-input
                type="textarea"
                disabled
                v-model="invoicePaymentAddForm.remark"
                placeholder=""
                maxlength="500"
                autosize
                show-word-limit
              ></el-input>
            </el-form-item>
          </div>
      </div>
    </el-form>
    <template v-for="type in [1,2,3]" >
      <div
        :key="type"
        class="finance-table-container"
      >
        <div class="money-box">
          <div class="money-box-left">
            <div class="money-title">{{moneyTitle[type-1]}}</div>
            <div class="money-total" v-show="type===3 && totalAmtGather.length">
              <span class="money-total-span-left-space">原金额合计：</span>
              <span v-for="(item, index) in totalAmtGather"
                :key="'originalGather' + index"
                class="money-total-span-black">
                {{item.currency}}
                <span :class="{'money-pay-color': item.isPay ? true : false}">+{{decimalFixed2(item.amt)}}
                </span>
              </span>
              <span class="money-total-span-left-space">开票金额合计：</span>
              <span v-for="(item, index) in invoiceAmtGather"
                :key="'exchangeGather' + index"
                class="money-total-span-black">
                {{item.currency}}
                <span :class="{'money-pay-color': item.isPay ? true : false}">+{{decimalFixed2(item.amt)}}
                </span>
              </span>
            </div>
          </div>
          <div class="money-box-right">
            <!-- <el-button
              class="finance-btn"
              @click="add1(null)"
              size="mini"
            ></el-button> -->
            <el-button
              type="text"
              class="collapse-btn"
              @click="handleCollapse(type)"
              size="mini"
            >
              {{isShowT[type] ? `收起` : `展开`}}
              <i :class="isShowT[type] ? [`el-icon-arrow-up`] : [`el-icon-arrow-down`]"></i>
            </el-button>
          </div>
        </div>
        <FinanceTable v-show="isShowT[type]" :option="tableOption[type]" />
      </div>
    </template>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        @close="customColumnsPopClose"
      />
    </div>
    <!-- 发票预览 -->
    <InvoicePreview :invoicePreviewOpne="invoicePreviewOpne" :invoicePreviewForm="invoicePreviewForm" @close-dialog-visible-invoicePreview='closeDialogVisibleInvoicePreview' />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import CustomColumns from '@/components/customColumns'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { getSettleUnitInvoiceInfo } from '@/api/fin/invoiceReceivableApply'
import { add, info } from '@/api/fin/invoicePayment'
import { dateFormat } from '@/views/finance/utils/finance'
import FinanceUploadEmbed from '@/views/finance/components/financeUpload/financeUploadEmbed'
import { getCompanyInvoiceInfo } from '@/api/fin/company'
import { calculateTaxAmount } from '@/api/fin/tax'
import InvoicePreview from '@/views/finance/pay/settle/components/invoicePreview'
import { decimalFixed2 } from '@/views/finance/utils/finance'
import { listColumnConfigGet, listColumnConfigSave } from '@/api/base'
export default {
  mixins: [mixin, routerMixin],
  data() {
    let rules = [{ required: true, message: '必填', trigger: 'blur' }]
    let invoicePaymentAddForm = {
      supplierCorpName: '',
      supplierCorpCode: '',
      corpBank: null,
      bankAccounts: null,
      title: '',
      taxNo: '',
      invoiceType: '',
      invoiceNo: '',
      currency: '',
      amt: '',
      taxRate: '',
      taxAmt: '',
      rate: '',
      invoiceIssueDate: '',
      supplierBank: '',
      supplierBankNo: '',
      fileId: '',
      remark: '',
      supplierTaxpayerNo: '',
    }
    let invoicePaymentAddRules = {}
    Object.keys(invoicePaymentAddForm).forEach((item) => {
      if (item === 'supplierCorpCode' || item === 'remark' || item === 'taxAmt') return
      invoicePaymentAddRules[item] = item !== 'supplierCorpName' ? rules : [{ ...rules[0], trigger: 'change' }]
    })
    return {
      loading: false,
      //发票预览的弹框
      invoicePreviewOpne:false,
      invoicePreviewForm:{},

      isShowT: { 1: true, 2: true, 3: true },
      tableOption: { 1: {}, 2: {}, 3: {} },
      moneyTitle: ['关联付款单号', '核销记录', '费用列表'],
      totalAmtGather:[],
      invoiceAmtGather:[],
      // 表单参数
      invoicePaymentAddForm,
      // 表单参数验证
      invoicePaymentAddRules,
      autocomplete: {
        querySearch: (queryString, cb) => {
          this.querySettleUnit({ queryString, unitTypes: 'supplier' }, cb)
        },
        select: (optionItem, row) => {
          this.invoicePaymentAddForm.supplierCorpName = optionItem.value
          this.invoicePaymentAddForm.supplierCorpCode = optionItem.key
          getSettleUnitInvoiceInfo({ unitCode: optionItem.key }).then((res) => {
            if (!res.data) {
              this.corpBankChange({})
              this.invoicePaymentAddForm.supplierTaxpayerNo = ''
              this.invoicePaymentAddForm.bankAccounts = null
              return this.$$msgErrClose('该客商无开票信息！')
            }
            this.invoicePaymentAddForm.supplierTaxpayerNo = res.data.taxNo
            this.invoicePaymentAddForm.bankAccounts = res.data.bankAccounts
          })
        },
        change: (value) => {
          if (!value) {
            this.corpBankChange({})
            this.invoicePaymentAddForm.supplierTaxpayerNo = ''
            this.invoicePaymentAddForm.bankAccounts = null
          }
        },
      },
      uploadApi2: '/base/webapi/file/upload',
      uploadParams2: {},
      invoicePaymentId: '',
      invoiceNo: '',
      isShowUpload: false,
      // 自定义表头弹框
      customColumnsPopShow: false,
      selfColumnsBase: [],
    }
  },
  components: {
    FinanceTable,
    FinanceUploadEmbed,
    InvoicePreview,
    CustomColumns
  },
  created() {
    this.init()
  },
  activated() {
    this.invoicePreviewOpne = false
    this.init()
  },
  methods: {
    init(){
      if (this.$route.meta.isUseCache) {
        return
      }
      this.tableOption[1] = Object.assign({}, this.option, { id: 'tableOption1', $name: 'InvoicePaymentListDetail1', data: [], operationBtns: false, selection: false })
      this.tableOption[2] = Object.assign({}, this.option, { id: 'tableOption2', $name: 'InvoicePaymentListDetail2', data: [], operationBtns: false, selection: false })
      this.tableOption[3] = Object.assign({}, this.option, { id: 'tableOption3', $name: 'InvoicePaymentListDetail3', data: [], operationBtns: false, selection: false,
        customColumns: {
          show: true,
          handleCustomColumns: () => (this.customColumnsPopShow = true),
        },
      })
      this.tableOption[1].columns = [
        { 
          prop: 'applyNo',
          label: '申请单号',
          width: 146,
          type: 'button',
          operationBtns: {
            show: true,
            callback: (fn, index, row) => {
              if(row.orderType === 'prepay'){
                this.routerPush('PrepayDetail', { source: 'createRegPrepayFrom', applyNo:row.applyNo })
              }
              if(row.orderType === 'settle_pay'){
                this.routerPush('SettleDetail', { 
                  applyNo:row.applyNo,
                  settleOrderNo:row.applyNo,
                })
              }
            },
          },
        },
        { 
          prop: 'payOrderNo',
          label: '付款单号',
          width: 146,
          type: 'button',
          operationBtns: {
            show: true,
            callback: (fn, index, row) => {
              this.routerPush('OrderDetails', { payOrderNo: row.payOrderNo })
            },
          },
        },
        { prop: 'orderType', label: '付款单类型', type: 'select',  propInDict: 'payOrderType' },
        { prop: 'recvCorpName', label: '结算单位', type: 'text', width: 150,},
        { prop: 'payStatus', label: '付款状态', type: 'select', propInDict: 'payStatusType' },
        { prop: 'currency', label: '付款币种', type: 'text',  },
        { prop: 'applyAmt', label: '付款金额', type: 'text', },
        { prop: 'confirmName', label: '付款人', type: 'text',width: 100,},
        { prop: 'payTime', label: '付款时间', type: 'text', width: 125, },
      ]
      this.tableOption[2].columns = [
        { 
          prop: 'writeoffReceipayNo',
          label: '核销编号',
          type: 'button',
          width: '130px',
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => {
              this.showOneNoDetail("writeoffNos", row.writeoffReceipayNo)
            },
          },
        },
        { prop: 'settleCorpName', label: '结算单位', type: 'text', width: 150, },
        { prop: 'writeoffSubType', label: '核销类型', type: 'select', propInDict:"writeoffSubType"},
        { prop: 'currency', label: '核销币种', type: 'text' },
        { prop: 'totalWirteoffAmt', label: '总核销金额', type: 'text'},
        { prop: 'writeoffName', label: '核销人', type: 'text'},
        { prop: 'writeoffTime', label: '付款时间', type: 'text', width: 125, },
      ]
      this.selfColumnsBase = [
        { prop: 'orderNo', label: '单号', width: 125,
          type: 'button',
          operationBtns: {
            show: true,
            callback: (action, index, row, option) => {
              let sourceType = row.sourceType
              let sourceBizNo = row.orderNo // row.orderNo
              sourceType = sourceType ? sourceType : 'order'
              this.showOneNoDetail(sourceType, sourceBizNo)
            }
          }
        },
        { prop: 'settleCompName', label: '分公司', type: 'text', width: 150, },
        { prop: 'settleCorpName', label: '结算单位', type: 'text', width: 150, },
        { prop: 'serviceName', label: '服务项', type: 'text', width: 120,},
        { prop: 'feeName', label: '费用名称', type: 'text', width: 120,},
        { prop: 'feeEnName', label: '费用名称英文', type: 'text', width: 120, },
        {
          prop: 'receipayType',
          label: '应收应付',
          type: 'select',
          formatter:({row})=>{
            const statusName = this.dictMapObj.receipayType[row.receipayType]
            if (row.receipayType === 'receive') {
              return '<span style="color:#CD4130">'+statusName+'</span>'
            } else if (row.receipayType === 'pay') {
              return '<span style="color:#33B18A">'+statusName+'</span>'
            } else {
              return statusName
            }
          }
        },
        { prop: 'currency', label: '币种', type: 'text'},
        { prop: 'unitPrice', label: '单价', type: 'text' },
        { prop: 'unitCount', label: '数量', type: 'text' },
        { prop: 'feeAmt', label: '金额', type: 'text' },
        { prop: 'feeUnit', label: '计费单位', type: 'select', propInDict:"feeUnit", width: 100,},
        { prop: 'taxRate', label: '税率', type: 'text' },
        { prop: 'taxAmt', label: '税额', type: 'text' },
        { prop: 'feeAmtWithoutTax', label: '不含税金额', type: 'text'},
        { prop: 'invoiceAmt', label: '已开票金额', type: 'text'},
        { prop: 'noInvoiceAmt', label: '可开票金额', type: 'text'},
        { prop: 'thisInvoiceAmt', label: '开票金额', type: 'text' },
        { prop: 'invoiceCurrency', label: '开票币种', type: 'text' },
        { prop: 'rate', label: '开票汇率', type: 'text'},
      ]
      this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
      this.tableOption[3].columns = [...this.selfColumnsBase]
      listColumnConfigGet({ scenesCode: 'pay_invoice_detail_fee' }).then((res) => {
        this.columnConfig = true
        this.dealCustomColumn(res)
      })

      console.log(this.tableOption);
      this.isShowUpload = false
      this.$nextTick(() => {
        this.isShowUpload = true
      })
      this.invoicePaymentId = this.$route.query.invoicePaymentId
      this.invoiceNo = this.$route.query.invoiceNo
      if (this.isDetail) {
        this.invoicePaymentAddRules = {}
        return this.getDetail({ invoicePaymentId: this.invoicePaymentId, invoiceNo: this.invoiceNo })
      }
      // 获取分公司发票配置
      let obj = this.invoicePaymentAddForm
      for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
          obj[key] = ''
        }
      }
      getCompanyInvoiceInfo({ companyCode: this.$store.state.user.userInfo.settleCompanyCode }).then((res) => {
        this.invoicePaymentAddForm.title = res.data.title
        this.invoicePaymentAddForm.taxNo = res.data.taxNo
        this.$refs['form'].clearValidate()
      })
    },
    // 获取发票详情
    getDetail(data) {
      this.loading = true
      info(data)
        .then((res) => {
          this.invoicePaymentAddForm = { ...this.invoicePaymentAddForm, ...res.data }
          // this.invoicePaymentAddForm.bankName = res.data.supplierBank
          // this.invoicePaymentAddForm.accountNo = res.data.supplierBankNo
          // this.invoicePaymentAddForm.src = res.data.supplierBankNo
          // 付款单列表
          // this.tableOption[1].data = res.data.payOrderList || []
          this.tableOption[1].data = res.data.payApplyDtoList || []
          // 付款核销列表
          this.tableOption[2].data = res.data.writeoffReceipayList || []
          // 费用列表
          this.tableOption[3].data = res.data.invoicePaymentFeeList || []

          this.amtChange()
        })
        .catch((err) => {
          Object.keys(this.invoicePaymentAddForm).forEach((key) => {
            this.invoicePaymentAddForm[key] = ''
          })
        }).finally(()=>{
          this.loading = false
        })
    },
    sendResFileList(val) {
      if (val && val.length > 0) {
        // this.invoicePaymentAddForm.fileId = val[0].fileNo
        this.invoicePaymentAddForm.fileId = val[0].oid
      }
    },
    submitAdd(cb) {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (!this.validateMoney(this.invoicePaymentAddForm.amt, { positive: true })) return
          let data = Object.assign({}, this.invoicePaymentAddForm)
          data.invoiceIssueDate = dateFormat('yyyy-mm-dd', new Date(data.invoiceIssueDate))
          delete data.bankAccounts
          delete data.corpBank
          add(data).then((res) => {
            this.$msgSucClose('提交成功!')
            this.cancel(true)
          })
        }
      })
    },
    corpBankChange(val) {
      this.invoicePaymentAddForm.supplierBank = val.bankName
      this.invoicePaymentAddForm.supplierBankNo = val.accountNo
    },
    cancel(flag) {
      this.routerBack(this.invoicePaymentId ? 'InvoicePaymentListDetail' : 'InvoicePaymentListReg', flag)
    },
    handleCollapse(type) {
      this.isShowT[type] = !this.isShowT[type]
    },
    amtTaxWatch() {
      let { amt, taxRate } = this.invoicePaymentAddForm
      if (amt && amt !== '' && taxRate !== '') {
        clearTimeout(this.timeout)
        this.timeout = setTimeout(() => {
          calculateTaxAmount({ amt, taxRate }).then((res) => {
            this.invoicePaymentAddForm.taxAmt = res.data && res.data.taxAmt
          })
        }, 1000)
      }
    },
    decimalFixed2(x) {
      let result = decimalFixed2(x)
      return result
    },
    amtChange() { //金额合计
      let currencys = this.tableOption[3].data.map(item => {
        return item.currency
      })
      currencys = [... new Set(currencys)]

      this.totalAmtGather = currencys.map(item => {
        return {
          currency: item,
          amt: this.tableOption[3].data.reduce((sum, cur) => {
            if (item === cur.currency) {
              return cur.feeAmt ? sum + Number(cur.feeAmt) : sum
            } else {
              return sum
            }
          }, 0),
          isPay: false
        }
      })

      let currencyList = this.tableOption[3].data.map(item => {
        return item.invoiceCurrency
      })
      currencyList = [... new Set(currencyList)]
      this.invoiceAmtGather = currencyList.map(item => {
        return {
          currency: item,
          amt: this.tableOption[3].data.reduce((sum, cur) => {
            if (item === cur.invoiceCurrency) {
              return cur.thisInvoiceAmt ? sum + Number(cur.thisInvoiceAmt) : sum
            } else {
              return sum
            }
          }, 0),
          isPay: false
        }
      })
    },
    //核销跳转
    // showDetail(row) {
    //   console.log(row.orderType);
    //   if(row.orderType === 'prepay_refund'){
    //     return
    //   }
    //   let query = {
    //     writeoffReceipayNo:row.writeoffReceipayNo,
    //     writeoffReceipayId:row.writeoffReceipayId
    //   }
    //   if(row.orderType === 'settle_pay'){
    //     this.routerPush('DetailSettle', query)
    //   }else if(row.orderType === 'prepay_to_repay'){
    //     this.routerPush('PrepayWriteOffDetail', query)
    //   }else{
    //     this.routerPush('DetailPrepay', query)
    //   }
    // },
    closeDialogVisibleInvoicePreview(val,isBreak){
      this.invoicePreviewOpne = val
      if(isBreak===true){
        this.getDetail({ invoicePaymentId: this.invoicePaymentId, invoiceNo: this.invoiceNo })
      }
    },
    showInvoicePayment(invoiceReceivableId){
      if(!invoiceReceivableId) return
      this.invoicePreviewForm.invoicePaymentId = invoiceReceivableId
      this.invoicePreviewOpne = true
    },
    showCheckInvoiceFile(file){
      const url = `/base/fileView/preview/${file}/sowoll`
      window.open(url)
    },
    // 自定义表头
    customColumnsPopClose(action, value) {
      this.customColumnsPopShow = false
      if (action === 'Confirm') {
        let columnList = this.getColumnsValues(value) // getColumnsValues在本页面无作用
        listColumnConfigSave({ columnList, scenesCode: 'pay_invoice_detail_fee' }).then((res) => {
          this.dealCustomColumn(res)
        })
      }
    },
    dealCustomColumn(res) {
      if (res.data?.columnList?.length) {
        let list = res.data.columnList
        this.configColumns = list
        this.tableOption[3].columns = list.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop)).filter((v) => v)
      }
    },
  },
  watch: {
    'invoicePaymentAddForm.amt'(newVal) {
      // this.amtTaxWatch()
    },
    'invoicePaymentAddForm.taxRate'(newVal) {
      // this.amtTaxWatch()
    },
    // 'invoicePaymentAddForm.supplierCorpCode'(newVal) {
    //   console.log('supplierCorpCode: ', newVal)
    //   if(newVal && newVal !== '') {
    //     let data = {
    //       unitCode: newVal
    //     }
    //     getSettleUnitInvoiceInfo(data).then(res => {
    //       if (res.code === 0) {
    //         this.invoicePaymentAddForm.taxNo = res.data.taxNo
    //       }
    //     })
    //   }
    // }
  },
  computed: {
    isDetail() {
      return this.invoicePaymentId || this.invoiceNo
    },
  },
}
</script>
<style scoped>
.invoice-detail-form-border-bottom{
  margin:0 16px;
  border-bottom: 1px solid #D8D8D8 !important;
}
.invoice-detail-form-border-bottom h3{
  margin-bottom:8px;
}
.finance-detail-page {
  margin: 0;
}
.finance-detail-page-background {
  background: #fff;
}
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
}
.el-form-item {
  width: 260px;
  margin-bottom: 6px;
  margin-right: 24px;
}
.el-form-item-text {
  font-size: 12px;
}
/* .settlement-detail-form .el-date-editor.el-input {
  width: 162px;
}
.settlement-detail-form .el-select {
  width: 162px;
}
.settlement-detail-form .el-input {
  width: 162px;
}
.settlement-detail-form {
  padding: 8px 16px 8px;
} */
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
/* .finance-table-container {
  margin: 4px 16px 18px;
} */

.invoice-payment-add-form-upload {
  /* width: 500px; */
}
.invoice-payment-add-form-upload ::v-deep .upload-file-cont {
  width: 400px !important;
}
</style>
<style lang="scss">
.invoice-detail-form-border-bottom {
  .el-form-item-invoice-remark {
    width: calc(100% - 10px);
    display: flex;
    .el-form-item__content {
      flex: 1;
    }
  }
}
</style>