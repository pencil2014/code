<template>
  <div>
    <el-dialog
      :title="'预付款申请'"
      :visible.sync="dialogVisible"
      :before-close="cancel"
      :close-on-click-modal="false"
      width="1120px"
    >
      <div class="dialog-prepay-edit">
        <el-form
          :model="form"
          ref="form"
          :rules="rulesForm"
          :inline="true"
          size="mini"
          label-width="110px"
        >
          <div class="dialog-add-dialog-item" style="border-bottom: 1px solid #D8D8D8;">
            <p class="dialog-add-dialog-item-title">收款信息</p>
            <el-form-item label="结算单位" prop="recvCorpName">
              <el-autocomplete
                :disabled="disabled"
                style="width:238px"
                v-model="form.recvCorpName"
                placeholder="请选择结算单位"
                :select-when-unmatched="true"
                clearable
                :fetch-suggestions="(queryString, cb) => {autocomplete3.querySearch && autocomplete3.querySearch(queryString, cb)}"
                @select="(value) => {autocomplete3.select && autocomplete3.select(value)}"
                @change="(value) => {autocomplete3.change && autocomplete3.change(value)}"
              ></el-autocomplete>
            </el-form-item>
            <el-form-item label="币种" prop="currency">
              <el-select
                filterable
                v-model="form.currency"
                @change="currencyChange"
                clearable
                placeholder="请选择币种"
                style="width:238px"
              >
                <el-option
                  v-for="(op, j) in dictMap['validCurrency'].filter((v) => v.value != 'ORIGINAL')"
                  :key="'currency' + j"
                  :label="op.label"
                  :value="op.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="收款银行" prop="recvBankName">
              <!-- <el-input disabled v-model="form.recvBankName"></el-input> -->
              <el-autocomplete
                :disabled="disabled"
                style="width:238px"
                clearable
                v-model="form.recvBankName"
                placeholder="请选择收款银行"
                :select-when-unmatched="true"
                :fetch-suggestions="(queryString, cb) => {autocomplete1.querySearch && autocomplete1.querySearch(queryString, cb)}"
                @select="(value) => {autocomplete1.select && autocomplete1.select(value)}"
                @change="(value) => {autocomplete1.change && autocomplete1.change(value)}"
              ></el-autocomplete>
            </el-form-item>
            <el-form-item label="收款银行支行">
              <el-input disabled v-model="form.recvBankBranch"></el-input>
            </el-form-item>
            <el-form-item label="收款账号" prop="recvAccountNo">
              <el-select
                :disabled="disabled"
                style="width:238px"
                clearable
                v-model="form.recvAccountNo"
                placeholder="请选择收款账号"
                @change="recvAccountNoChange"
              >
                <el-option
                  v-for="(item, index) in bankListByName"
                  :key="'bankListByName'+index"
                  :label="item.accountNo"
                  :value="item.accountNo"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="收款账户名">
              <el-input disabled v-model="form.recvAccountName"></el-input>
            </el-form-item>
            <el-form-item label="金额" prop="applyPayAmt">
              <el-input
                :disabled="disabled"
                clearable
                :maxlength="16"
                v-lsNumber="{value:'number', obj:form, key:'applyPayAmt'}"
                v-model="form.applyPayAmt"
                placeholder="请输入金额"
              ></el-input>
            </el-form-item>
          </div>
          <div
            class="dialog-add-dialog-item"
            style="margin-top:12px;border-bottom: 1px solid #D8D8D8;"
          >
            <p class="dialog-add-dialog-item-title">我司信息</p>
            <el-form-item label="支付方式" prop="payWay">
              <el-select
                :disabled="disabled"
                v-model="form.payWay"
                @change="changePayWay"
                placeholder="请选择"
                style="width:238px"
              >
                <el-option
                  v-for="item in [...(dictMap['payWay'].slice(0, 100).filter(item => !['prepay_dedue','cash',].includes(item.value)))]"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  :disabled="item.value === 'prepay_dedue' || item.value === 'cash'"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              v-if="form.payWay==='hk_china'"
              label="手续费扣款方式："
              prop="transferFeeDeductWay"
              :rules="{ required: true, message: ' ', trigger: 'change' }"
              style
            >
              <el-select v-model="form.transferFeeDeductWay" placeholder="请选择" style="width:238px">
                <el-option
                  v-for="it in dictMap['transferFeeDeductWay']"
                  :key="it.value"
                  :label="it.label"
                  :value="it.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="所属分公司" prop="payCompName" >
                <el-autocomplete
                    :disabled='disabled'
                    style="width:100%"
                    clearable
                    v-model="form.payCompName"
                    placeholder="请选择所属分公司"
                    :select-when-unmatched="true"
                    :fetch-suggestions="(queryString, cb) => {autocomplete4.querySearch && autocomplete4.querySearch(queryString, cb)}"
                    @select="(value) => {autocomplete4.select && autocomplete4.select(value)}"
                    @change="(value) => {autocomplete4.change && autocomplete4.change(value)}"
                    >
                </el-autocomplete>
            </el-form-item>-->
            <el-form-item
              label="付款银行简称"
              prop="payAccountShortName"
              :rules="{ required: !['cheque'].includes(form.payWay), message: ' ', trigger: 'change' }"
            >
              <el-autocomplete
                :disabled="disabled"
                style="width:238px"
                clearable
                v-model="form.payAccountShortName"
                placeholder="请选择付款银行简称"
                :select-when-unmatched="true"
                :fetch-suggestions="(queryString, cb) => {autocomplete2.querySearch && autocomplete2.querySearch(queryString, cb)}"
                @select="(value) => {autocomplete2.select && autocomplete2.select(value)}"
                @change="(value) => {autocomplete2.change && autocomplete2.change(value)}"
              ></el-autocomplete>
            </el-form-item>
            <el-form-item
              label="账户结算方式："
              prop="settleMode"
              :rules="{ required: form.payWay !== 'intrabranch', message: ' ', trigger: 'change' }"
            >
              <el-select
                v-model="form.settleMode"
                clearable
                placeholder="请选择账户结算方式"
                style="width:238px"
              >
                <el-option
                  v-for="item in form.bankAccountSettleModeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="付款账号" prop="payAccountNo">
              <el-input disabled v-model="form.payAccountNo" placeholder="请输入我司开户行"></el-input>
            </el-form-item>
            <el-form-item label="付款银行" prop="payBankName">
              <el-input disabled v-model="form.payBankName" placeholder="请输入我司开户行"></el-input>
            </el-form-item>
            <el-form-item label="付款账户名">
              <el-input disabled v-model="form.payAccountName"></el-input>
            </el-form-item>
            <!-- <el-form-item label="是否开票">
                    <el-select  v-model="form.hasInvoice" @change="handleShow" placeholder="请选择" style="width:100%">
                        <el-option label="是" value="yes"></el-option>
                        <el-option label="否" value="no"></el-option>
                    </el-select>
            </el-form-item>-->

            <el-form-item label="备注">
              <el-input
                placeholder="请输入备注原因，不超过500个字"
                type="textarea"
                :maxlength="500"
                show-word-limit
                v-model="form.remark"
                style="width:594px;"
              ></el-input>
              <!-- width:939px; -->
            </el-form-item>
          </div>
        </el-form>
        <div class="dialog-add-dialog-item dialog-add-dialog-item-box">
          <div class="money-box">
            <div class="money-box-left">
              <p class="dialog-add-dialog-item-title" style="margin-bottom: 0;margin-top: 4px;">发票信息</p>
            </div>
            <div class="money-box-right">
              <el-button @click="identifyElecInvoice" class="finance-btn" size="mini" type="primary">电子发票识别</el-button>
              <el-button @click="handleShow('yes')" class="finance-btn" size="mini">关联发票</el-button>
              <el-button @click="handleAddInvoice" class="finance-btn" size="mini">发票登记</el-button>
            </div>
          </div>
          <FinanceTableMass :option="option1" @send-multi="sendMulti" />
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" :loading="submitLoading" @click="submitForm">确定</el-button>
        <el-button size="mini" @click="cancel">取消</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="关联发票"
      :visible.sync="relevanceOpne"
      :before-close="invoiceOpne"
      class="relevance-invoice"
      width="1350px"
      :noModalClose="true"
    >
      <FinanceSearch :searchOption="searchOption1" @search="search" />
      <FinanceTableMass :option="option2" @send-multi="sendMulti" />
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="relevanceSubmit" size="mini">确定</el-button>
        <el-button @click="invoiceOpne" size="mini">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { usableList } from '@/api/fin/invoicePayment'
import { queryPrepayApplyInfo, savePrepayApply, approvePrepayApply } from '@/api/fin/pay/'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
export default {
  name: 'prepayEdit',
  mixins: [mixin],
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    form: {
      type: Object,
      default: () => ({}),
    },
    autocomplete: {
      type: Object,
      default: () => ({}),
    },
    autocomplete1: {
      type: Object,
      default: () => ({}),
    },
    autocomplete2: {
      type: Object,
      default: () => ({}),
    },
    autocomplete3: {
      type: Object,
      default: () => ({}),
    },
    autocomplete4: {
      type: Object,
      default: () => ({}),
    },
    bankListByName: {
      type: Array,
      default: () => [],
    },
    bankListAll: {
      type: Array,
      default: () => [],
    },
    option1: {
      type: Object,
      default: () => ({}),
    },
    invoiceRegList: {
      type: Array,
      default: () => [],
    },
    req: '',
  },
  data() {
    return {
      submitLoading: false,
      relevanceOpne: false,
      disabled: false,
      showUploadBtn: true,
      invoiceNo: '点击关联发票',
      option2: {},
      searchOption1: {
        columns: [
          {
            label: '发票号',
            prop: 'invoiceNo',
            type: 'input',
          },
          {
            label: '发票类型',
            prop: 'invoiceType',
            type: 'select',
          },
          {
            label: '开票币种',
            prop: 'currency',
            type: 'select',
          },
        ],
        data: {
          invoiceType: '',
          invoiceNo: '',
          currency: '',
        },
      },
      //表单验证
      rulesForm: {
        recvCorpName: [{ required: true, message: ' ', trigger: 'change' }],
        recvAccountNo: [{ required: true, message: ' ', trigger: 'change' }],
        recvBankName: [{ required: true, message: ' ', trigger: 'change' }],
        payCompName: [{ required: true, message: ' ', trigger: 'change' }],
        payWay: [{ required: true, message: ' ', trigger: 'change' }],
        currency: [{ required: true, message: ' ', trigger: 'blur' }],
        applyPayAmt: [{ required: true, message: ' ', trigger: 'change' }],
        payBankBranch: [{ required: true, message: ' ', trigger: 'change' }],
      },
    }
  },
  created() {
    const listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
    this.option2 = Object.assign({}, this.option, {
      id: 'option2',
      $name: 'prepayEditApply2',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      operationBtns: {
        show: false,
      },
      selection: {
        show: true,
        fixed: 'left',
      },
      rootTipsHide: true,
      listAmtSummary,
      columns: [
        { prop: 'invoiceNo', label: '发票号', type: 'text', key: 'invoiceNo' },
        { prop: 'title', label: '发票抬头', width: 125, type: 'text', key: 'title' },
        { prop: 'writeoffAmt', label: '已核销金额', type: 'text', key: 'writeoffAmt' },
        { prop: 'lockAmt', label: '占用金额', type: 'text', key: 'lockAmt' },
        {
          prop: 'remainingAmount',
          label: '剩余可用金额',
          width: 100,
          type: 'text',
          key: 'remainingAmount',
          formatter: ({ row }, pItem) => {
            return Math.round((row.amt - row.writeoffAmt - row.lockAmt) * 100) / 100
          },
        },
        { prop: 'invoiceType', label: '开票类型', width: 125, type: 'select', key: 'invoiceType' },
        { prop: 'currency', label: '开票币种', type: 'text', key: 'currency' },
        { prop: 'amt', label: '开票金额', type: 'text', key: 'amt' },
        { prop: 'taxRate', label: '发票税率', type: 'select', propInDict: 'taxRateInfo' },
        { prop: 'rate', label: '开票汇率', type: 'text', key: 'rate' },
        { prop: 'invoiceIssueDate', label: '开票日期', type: 'text' },
        { prop: 'taxTotalExclud', label: '不含税金额', type: 'text' },
        { prop: 'taxTotalInclud', label: '价税合计(CNY)', type: 'text', width: 100, },
      ],
    })
  },
  methods: {
    getData() {
      if (this.applyNo) {
        queryPrepayApplyInfo({ applyNo: this.applyNo })
          .then((res) => {
            if (res.code === 0) {
              this.form = res.data.payInfo
              this.form.remark = res.data.remark
              Object.assign(this.info, {}, res.data)
              res.data.payInfo.invoiceNo ? (this.invoiceNo = res.data.payInfo.invoiceNo) : (this.invoiceNo = '点击关联发票')
              // let list = res.data.payInfo.payInfoInvoices
              // if(list.length){
              //   this.invoiceNo = list.map(item=>{
              //     return item.invoiceNo
              //   }).toString()
              // }
              this.confirmStatus = res.data.confirmStatus
            }
          })
          .catch((err) => {
            this.delVisitedView()
            this.cancel()
          })
      }
    },
    recvAccountNoChange(val) {
      let optionItem = this.bankListByName.find((item) => item.accountNo === val)
      console.log(optionItem)
      if (!optionItem) {
        this.form.recvAccountNo = ''
        this.form.recvAccountName = ''
        this.form.recvBankCode = ''
        this.form.recvBankName = ''
        this.form.recvBankBranch = ''
        this.form.recvBankAccountId = ''
        this.$emit('setBankListByName', this.bankListAll)
      } else {
        // this.form.recvAccountName = optionItem.value // el-autocomplete->el-select, value不存在
        // this.form.recvAccountNo = optionItem.key // el-autocomplete->el-select, key不存在
        this.form.recvAccountNo = optionItem.accountNo
        this.form.recvAccountName = optionItem.accountName
        this.form.recvBankCode = optionItem.bankCode
        this.form.recvBankName = optionItem.bankName
        this.form.recvBankBranch = optionItem.bankBranch
        this.form.recvBankAccountId = optionItem.settleUnitBankAcctId
      }
    },
    handleShow(val) {
      if (val === 'yes') {
        if (this.disabled) {
          return
        }
        if (!this.form.recvCorpName) {
          this.$message({ message: '请先选择结算单位！', type: 'error', showClose: true })
          return (this.form.hasInvoice = 'no')
        }
        if (!this.form.payAccountNo) {
          this.$message({ message: '请先选择付款银行！', type: 'error', showClose: true })
          return (this.form.hasInvoice = 'no')
        }
        this.searchOption1.data.currency = this.form.currency
        this.getList()
        this.relevanceOpne = true
      }
      if (val === 'no') {
        this.$message({ type: 'success', message: '清空已关联的发票!', showClose: true })
        this.form.payInfoInvoiceList = []
      }
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.form.applyPayAmt <= 0) {
            this.$message({ type: 'error', message: '付款金额不能小于0!', showClose: true })
            return
          }
          if (!this.validateMoney(this.form.applyPayAmt, { positive: true })) {
            return
          }
          let data = this.form
          data.payInfoInvoiceList = this.option1.data.map((item) => {
            return { invoicePaymentId: item.invoicePaymentId }
          })
          let recvAccountNoList = this.option1.data.map((item) => {
            return item.supplierAccountNo
          })
          let list = []
          for (let i = 0; i < recvAccountNoList.length; i++) {
            if (recvAccountNoList[i] !== this.form.recvAccountNo) {
              list.push(recvAccountNoList[i])
            }
          }
          list = [...new Set(list)]
          if (list.length) {
            this.$confirm('发票销方银行账号与付款申请单收款银行账号不一致，是否确认关联？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
            })
              .then(() => {
                this.savePrepayApply(data)
              })
              .catch(() => {})
          } else {
            this.savePrepayApply(data)
          }
        }
      })
    },
    savePrepayApply(data) {
      this.submitLoading = true
      savePrepayApply(data)
        .then((res) => {
          if (res.code === 0) {
            this.$message({ type: 'success', message: '提交成功!', showClose: true })
            this.isJumpRouteFromPage = true
            this.cancel(true)
          } else {
            this.$message({ type: 'error', message: '提交失败!', showClose: true })
          }
        })
        .finally(() => {
          this.submitLoading = false
        })
    },
    //确认已选择的发票项
    relevanceSubmit() {
      if (!this.multipleSelection2.length) {
        this.$message({
          message: '请勾选需要关联的发票！',
          type: 'error',
          showClose: true,
        })
        return
      }
      // this.form.payInfoInvoiceList = this.multipleSelection2.map(item => {
      //     return {invoicePaymentId:item.invoicePaymentId}
      // })
      let invoiceNo = this.multipleSelection2.map((item) => {
        return item.invoiceNo
      })
      this.invoiceNo = invoiceNo.toString()

      if (this.multipleSelection2.length) {
        this.$message({
          message: '已选' + this.multipleSelection2.length + '项发票进行关联',
          type: 'success',
          showClose: true,
        })
      }
      this.option1.data = this.multipleSelection2.concat(this.invoiceRegList)
      this.getListAmtSummary(this.option1.data, this.option1)
      this.relevanceOpne = false
    },
    //关联发票
    sendMulti(data, option) {
      // if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option2) {
        this.multipleSelection2 = data
        if (data.length) {
          this.getListAmtSummary(data)
        } else {
          this.getListAmtSummary(this.option2.data)
        }
      }
    },
    getListAmtSummary(val, option) {
      // if (val.length) {
      let realpayAmtTotalList = []
      let balanceTotalList = []
      let list = val
      let currencyList = [...new Set(list.map((item) => item.currency))]
      currencyList.forEach((item) => {
        let arr = list.filter((keys) => keys.currency === item)
        let sum = arr.reduce((a, b) => Number(a) + Number(b.amt), 0)
        if (sum && item) {
          realpayAmtTotalList.push({
            currency: item,
            amt: Math.round(sum * 100) / 100,
          })
        }
        // let sum1 = arr.reduce((a, b) => Number(a) + decimalFixed2(b.amt - b.writeoffAmt - b.lockAmt), 0)
        let sum1 = arr.reduce((a, b) => new LSnum(a).plus(new LSnum(b.amt).minus(b.writeoffAmt).minus(b.lockAmt).toNum(2)), 0)
        if (sum1 && item) {
          balanceTotalList.push({
            currency: item,
            amt: Math.round(sum1 * 100) / 100,
          })
        }
      })
      console.log(realpayAmtTotalList)
      console.log(balanceTotalList)

      let data = {
        realpayAmtTotalList,
        balanceTotalList,
      }
      console.log(data)
      const labelObj = {
        realpayAmtTotalListLabel: '开票金额',
        balanceTotalListLabel: '剩余可用金额',
      }
      const colorObj = {
        realpayAmtTotalListColor: 'red', // 支持red, green, black三种值
        balanceTotalListColor: 'green',
      }
      if (!option) {
        this.option2.listAmtSummary = Object.assign(this.option2.listAmtSummary, {
          show: true,
          data,
          labelObj,
          colorObj,
        })
      } else if (option === this.option1) {
        this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
          show: true,
          data,
          labelObj,
          colorObj,
        })
      }
      // }
    },
    //关联发票列表
    getList() {
      let data = {
        settleCompCode: this.form.settleCompCode,
        supplierCorpCode: this.form.recvCorpCode,
      }
      let obj = this.searchOption1.data
      let keys = Object.keys(obj)
      keys.forEach((key) => {
        let value = obj[key]
        if (value && value !== '') {
          data[key] = value
        }
      })
      usableList(data).then((res) => {
        if (res.code === 0) {
          let list = res.data
          let data = []
          list.forEach((item) => {
            if (this.option1.data.every((relevance) => relevance.invoicePaymentId !== item.invoicePaymentId)) {
              data.push(item)
            }
          })
          console.log(data)
          this.option2.data = data
        }
      })
    },
    search(data) {
      // let params = data
      this.getList()
    },
    invoiceOpne() {
      this.form.hasInvoice = 'no'
      this.relevanceOpne = false
    },
    cancel(isBreak) {
      this.$refs.form.resetFields()
      this.$emit('close-dialog-visible', false, isBreak) //第一参数返回不刷新，第二参数刷新列表
    },
    // 改变支付方式事件
    changePayWay() {
      this.form.payAccountShortName = ''
      this.form.payAccountNo = ''
      this.form.payAccountName = ''
      this.form.payBankCode = ''
      this.form.payBankName = ''
      this.form.payBankBranch = ''
      this.form.payBankAccountId = ''

      this.form.settleMode = ''
      this.form.bankAccountSettleModeList = []
    },
    currencyChange() {
      this.form.recvAccountNo = ''
      this.form.recvAccountName = ''
      this.form.recvBankCode = ''
      this.form.recvBankName = ''
      this.form.recvBankBranch = ''
      this.form.recvBankAccountId = ''

      this.form.payAccountShortName = ''
      this.form.payAccountNo = ''
      this.form.payAccountName = ''
      this.form.payBankCode = ''
      this.form.payBankName = ''
      this.form.payBankBranch = ''
      this.form.payBankAccountId = ''

      this.form.settleMode = ''
      this.form.bankAccountSettleModeList = []
      if (this.form.recvCorpCode && this.form.currency) {
        this.autocomplete1.querySearch('')
      }
    },
    handleAddInvoice() {
      //生成reqid
      let item = this.form
      console.log(item)
      if (!item.currency) {
        return this.$message({ message: '请先选择币种，再进行发票登记！', type: 'error', showClose: true })
      }
      if (!item.recvCorpCode) {
        return this.$message({ message: '请先选择结算单位，再进行发票登记！', type: 'error', showClose: true })
      }
      let isInvoiceNo = this.option1.data.map((subItem) => {
        return subItem.invoiceNo
      })
      let query = {
        titleName: '发票登记',
        name: 'prepayEditApply',
        currency: item.currency,
        amt: item.applyPayAmt,
        supplierCorpName: item.recvCorpName,
        supplierCorpCode: item.recvCorpCode,
        recvAccountNo: item.recvAccountNo,
        isRepeatInvoiceNo: this.isRepeat(isInvoiceNo),
        settleCompCode: item.settleCompCode,
        recvBankAccountId: item.recvBankAccountId,
      }
      this.$emit('handle-add-invoice', query)
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
      let item = this.form
      if (!item.currency) {
        return this.$msgErrClose('请先选择币种，再进行发票登记！')
      }
      if (!item.recvCorpCode) {
        return this.$msgErrClose('请先选择结算单位，再进行发票登记！')
      }
      let query = {
        currency: item.currency,
        supplierCorpName: item.recvCorpName,
        supplierCorpCode: item.recvCorpCode,
        recvAccountNo: item.recvAccountNo,
        settleCompCode: item.settleCompCode,
        recvBankAccountId: item.recvBankAccountId,
        from: 'SettlementPayApply', 
        from2: 'prepayEdit',  // 区分是 SettlementPayApply 还是 prepayEdit
        req: this.req, // 用req
      }
      this.$emit('goIdentifyElecInvoice', query)
    },
  },
  activated() {
    let data = JSON.parse(sessionStorage.getItem(this.req))
    console.log(data)
    if (data && data.length) {
      this.option1.data.push(...data)
    }
    sessionStorage.removeItem(this.req)
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        this.option1.data = []
        const listAmtSummary2 = Object.assign({}, this.option.listAmtSummary, { show: true })
        this.option1.listAmtSummary = listAmtSummary2
        this.$refs.form && this.$refs.form.clearValidate()
        this.$refs.form && this.$refs.form.resetFields()
      }
    },
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
  },
}
</script>

<style lang="scss" scoped>
.dialog-prepay-edit {
  // padding: 2px;
  .dialog-add-dialog-item {
    .dialog-add-dialog-item-title {
      font-size: 12px;
      color: #222222;
      font-weight: 600;
      margin-bottom: 8px;
    }
  }
  .dialog-add-dialog-item-box {
    border: 1px solid rgb(216, 216, 216);
    margin-top: 8px;
    border-radius: 4px;
  }
  // .el-form .el-input {
  //     width: 260px;
  // }

  .el-form--inline .el-form-item {
    margin-left: 8px; // 12px
    margin-right: 0px;
  }
  // .el-input{
  //     width: 156px !important;
  // }
  .el-dialog__footer {
    padding-bottom: 32px;
    text-align: center;
  }
  // .el-input{
  //     width: 320px;
  // }
  // .el-input{
  //     width: 156px;
  // }
  // .el-select{
  //     width: 156px;
  // }

  /deep/.finance-el-table {
    padding: 0px !important;
  }
  .money-box {
    padding: 4px;
  }
  /deep/ .el-form-item__content {
    width: 238px;
  }
}
</style>
<style lang="scss" scoped>
/deep/.el-dialog__body {
  padding: 24px !important;
}
/deep/ .el-dialog__footer {
  padding-top: 0px;
}
</style>