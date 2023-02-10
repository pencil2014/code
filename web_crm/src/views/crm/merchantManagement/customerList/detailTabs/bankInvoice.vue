<template>
  <div style="padding-top: 8px;">
    <!-- :disabled="isBlacklist" 修改不让编辑-->
    <CrmForm
      inputWidth="180px"
      ref="crmForm"
      :disabled="isBlacklist"
      :rules="rules"
      :ruleForm="ruleForm"
      :formDatas="baseInvoiceData"
    ></CrmForm>
    <div class="info-title notSelf-hide" v-show="!isBlacklist">
      <span></span>
      <el-button icon="el-icon-check" size="mini" @click="chooseAccount" type="primary">关联银行账户</el-button>
    </div>
    <FinanceTable :option="option1" />
    <CrmDialogTable
      v-if="dialogOptionShow"
      ref="invoice"
      :option="dialogOption"
      @close="closeDialog"
    />
  </div>
</template>

<script>
// TODO 供应商页面，纳税人类型后面只有税率、供应商类型
import { baseInvoiceData } from '@/views/crm/data'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import CrmForm from '@/views/crm/components/crmForm'
import CrmDialogTable from '@/views/crm/components/crmDialogTable'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { accountInfoColumns as columnsData } from '@/views/crm/data'
import INVOICE from '@/api/crm/invoice'
import { formatIndustry } from "@/utils/crm"
// 统一设置规则提醒
const ruleMsg = { required: true, message: ' ', triggers: 'blur' }
export default {
  name: 'bankAccount',
  mixins: [mixin],
  props: ['custid', 'orgid', 'invoice', 'banklist', 'isSelf', 'isSupplier','isShipC','isBlacklist'],
  components: {
    FinanceTable,
    CrmForm,
    CrmDialogTable,
  },
  watch: {
    invoice(val) {
      if (!val) return
      this.save()
    },
    banklist: {
      handler(val) {
        // console.log(val)
        this.$nextTick(() => {
          this.dialogOption.tableOption.data = (val || []).filter((item) => item.status == 'effect' && item.accountType !=='prv')
        })
      },
      immediate: true,
    },
    'addDialog.form.countryCode': {
      handler(val) {
        let hasVal = !!val
        if (val.countryCode === 'CN' || !val) {
          this.addDialog.form.accountBankAddr = ''
          this.addDialog.form.accountBankCompAddr = ''
          this.addDialog.form.swiftCode = ''
        } else {
          this.addDialog.form.accountBranchBank = ''
        }
        if (!val) {
          this.addDialog.form.accountBranchBank = ''
        }
        // 5,6,7,8,
        this.$set(this.addDialog.formItems[4], 'show', val.countryCode !== 'CN' && hasVal)
        this.$set(this.addDialog.formItems[5], 'show', val.countryCode !== 'CN' && hasVal)
        this.$set(this.addDialog.formItems[6], 'show', val.countryCode !== 'CN' && hasVal)
        this.$set(this.addDialog.formItems[7], 'show', val.countryCode === 'CN' && hasVal)
      },
    },
    isSelf: {
      handler(val) {
        // console.log(val)
        let arr = !val ? this.baseInvoiceDataDis : this.invoiceData
        arr = arr.filter(item => item.prop !== 'serviceMode')
        this.baseInvoiceData.splice(0, 1000, ...arr)
        this.rules = !val ? {} : this.backupRules
      },
      immediate: true,
    },
    'dialogOption.show'(val) {
      this.dialogOptionShow = val
    },
  },
  data() {
    let invoiceData = [...baseInvoiceData]
    let arr = [
      { prop: 'taxRates', propInDict: 'taxRateInfo', label: '税率', type: 'select', multiple: true },
      { prop: '_crmSupplierType', label: '供应商类型', type: 'input', disabled: true },
    ]
    const rules = {
      taxNo: { ...ruleMsg },
      taxpayerType: { ...ruleMsg },
      tel: { ...ruleMsg },
      title: { ...ruleMsg },
      addr: { ...ruleMsg },
    }
    if (this.isSupplier) {
      invoiceData.splice(5, 100, ...arr)
      rules.taxRates = { required: true, message: ' ' }
    }
    if (this.isShipC) {
      invoiceData.splice(5, 100)
      rules.taxRates = { required: true, message: ' ' }
    }

    const baseInvoiceDataDis = [...invoiceData.map((item) => ({ ...item, disabled: true }))]
    return {
      // 表格配置
      option1: {},
      dialogOptionShow: false,
      dialogOption: {
        show: false,
        title: '关联银行账户',
        width: '800px',
        selections: [],
        tableOption: {
          id: 'tableOption',
          tips: false,
          rootTipsHide: true,
          selection: { show: true, fixed: true },
          columns: [
            { prop: 'accountNo', label: '账号', minWidth: 150 },
            { prop: 'accountName', label: '账户中文名', minWidth: 150 },
            { prop: 'accountEname', label: '账户英文名', minWidth: 150 },
            { prop: 'accountShortName', label: '账户名简称', minWidth: 150 },
            { prop: 'accountBank', label: '开户行', minWidth: 150 },
            { prop: 'countryName', label: '开户行国家', minWidth: 100 },
            { prop: 'accountType', label: '账户类型', type: 'select', minWidth: 80 },
            { prop: 'currency', label: '币种', minWidth: 60 },
          ],
        },
      },
      baseInvoiceData: [],
      baseInvoiceDataDis,
      invoiceData,
      ruleForm: {},
      rules: {},
      backupRules: rules,
      updateTaxNo: ""
    }
  },
  activated() {
    // console.log(this.orgid)
    this.getData()
  },
  created() {
    let operationBtns = {
      fixed: 'right',
      width: '120px',
      show: true,
      data: [
        {
          label: '默认银行',
          type: 'text',
          showFn: (row) => row.isDefault !== 'yes',
          action: 'Edit'
        }
      ],
      callback: (action, $index, row, item) => {
         if (action === 'Edit') {
          this.setDefault(row)
        }
      }
    }
    this.option1 = { ...this.option, id: 'option1', operationBtns: this.isSelf ? operationBtns : false, pagination: false, selection: false }
    this.option1.style = { padding: '5px 0' }
    this.option1.columns = [...columnsData]
    this.option1.columns[0].hasTag = true
  },
  methods: {
    setDefault (row) {
      if (!row.isDefault) {
        return this.$msgErrClose('请先保存后，再设置默认银行')
      }
      let str =  this.isSupplier ? 'supplier' : this.isShipC ? 'shippingCarrier' :'customer'
      let { acctId } = row
      let data = {
        settleInvoiceInfoId: this.ruleForm.settleInvoiceInfoId,
        acctId,
        custid: this.custid,
        supplierId: this.custid
      }
      INVOICE[str+'/setDefault'](data).then(res => {
        if (res.code === 0) {
          this.getData()
          this.$msgSucClose('设置默认银行成功')
        }
      }).catch(()=>{})
    },
    chooseAccount() {
      this.dialogOptionShow = true
      this.$nextTick(() => {
        this.dialogOption.show = true
      })
    },
    save() {
      this.$refs.crmForm.$refs.form.validate((valid) => {
        if (!valid) {
          this.$msgErrClose('请将必填项填写完整！')
          this.$emit('update:invoice', false)
          return
        }
        if(this.$attrs.companyName !== this.ruleForm.title.trim()){
          this.$emit('update:invoice', false)
          return this.$msgErrClose('开票资料发票抬头和公司名称不一致！')
        }
        let data = { ...this.ruleForm, bankAcctIds: this.option1.data.map((item) => item.acctId) }
        data.settleInvoiceInfoId = data.settleInvoiceInfoId || ''
        data.settleOrgid = this.orgid
        data.custid = this.custid
        data.supplierId = this.custid
        data.shippingCarrierId = this.custid
        let str =  this.isSupplier ? 'supplier' : this.isShipC ? 'shippingCarrier' :'customer'
        INVOICE[`${str}Add`](data)
          .then((res) => {
            if (data.taxNo !== this.updateTaxNo) {
              sessionStorage.setItem('taxNo', data.taxNo)
            }
            this.getData()
            this.$msgSucClose('开票资料保存成功！')
          })
          .finally(() => {
            this.$emit('update:invoice', false)
          })
      })
    },
    getData() {
      let str =  this.isSupplier ? 'supplier' : this.isShipC ? 'shippingCarrier' :'customer'
      INVOICE[`${str}Info`]({ custid: this.custid, supplierId: this. custid,shippingCarrierId:this.custid }).then((res) => {
        if (this.isSupplier || this.isShipC) {
          res.data.taxRates = res.data.taxRates.map((v) => '' + v)
          let categoryType = this.dictMapObj.crmCategory
          res.data._crmSupplierType = res.data.categorys
            .map((v) => v.category)
            .join(',')
            .replace(/\b(\w+)\b/g, (v) => categoryType[v])
        }
        this.ruleForm = { ...res.data }
        if (this.rules.taxNo) {
          if (res.data.country != '中国') {
            this.rules.taxNo.required = false
            this.backupRules.taxNo.required = false
            this.rules.taxpayerType.required = false
            this.backupRules.taxpayerType.required = false
          } else if (this.rules.taxNo.required === false) {
            this.rules.taxNo.required = true
            this.backupRules.taxNo.required = true
            this.rules.taxpayerType.required = true
            this.backupRules.taxpayerType.required = true
          }
        }
        let { province, city, district } = res.data
        // province ? (district ? [province, city, district] : [province, city]) : ''
        this.ruleForm.indexAddr = province ? (district ? `${province}/${city}/${district}` : `${province}/${city}`) : city ? district ? `${city}/${district}` : city : district ? district : ''
        this.option1.data = this.dialogOption.selections = res.data.bankAccounts.map(item => {
          item._isChanged = item.isDefault === 'yes'
          if (item._isChanged) {
            item._tagArr = [{ type: 'change', text: '默' }]
          }
          return { ...item }
        })
        this.dialogOption.selections.splice(0, 1000, ...res.data.bankAccounts)
        this.ruleForm.industry = this.formatterIndustry(this.ruleForm.industry)
        this.updateTaxNo = this.ruleForm.taxNo
        if(this.$attrs.companyName !== this.ruleForm.title.trim()){
          this.ruleForm.title = this.$attrs.companyName
        }
        // console.log(this.dialogOption.selections)
        this.$nextTick(() => this.$refs.crmForm.$refs.form.clearValidate())
      })
    },
    // 转换所属行业格式
    formatterIndustry (str) {
      return formatIndustry(str)
    },
    closeDialog(tag) {
      if (tag) {
        let acctIds = this.option1.data.map(item => item.acctId) || [] // 已存在数据
        let acctIds2 = this.dialogOption.selections.map(item => item.acctId) || [] // 新选择的数据
        this.option1.data = this.option1.data.filter(item => acctIds2.includes(item.acctId))
        this.dialogOption.selections.forEach(option => {
          if (!acctIds.includes(option.acctId)) {
            this.option1.data.push(option)
          }
        })
        // this.option1.data = this.dialogOption.selections
      }
      this.dialogOption.show = false
    },
  },
}
</script>
