<template>
  <div>
    <div style="overflow:hidden;padding:20px 20px 10px;" v-if="!$attrs.btnHide">
      <el-button style="float:right" @click="dialogShow" size="mini">新增银行信息</el-button>
    </div>
    <FinanceTable :option="tableOption" />
    <CrmDialog :multi="true" :option="dialogOption" @close="closeDialog" >
      <span class="tips-box" slot="add-slot" @click="showTipsFn">
        <i class="el-icon-question"></i>
      </span>
    </CrmDialog>
    <el-dialog title="" :visible.sync="showTips" width="648px">
      <img src="../../../../../assets/invoice.png" alt="invoice">
    </el-dialog>
  </div>
</template>

<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import CrmDialog from '@/views/crm/components/crmDialog'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { bankList, countrySelectList } from '@/api/base'
import { accountInfoColumns } from '@/views/crm/data'
import ACCOUNT from '@/api/crm/orgBankAccount'
import { mapState } from 'vuex'
// 统一设置规则提醒
const ruleMsg = [{ required: true, message: ' ', trigger: 'blur' }]
// 统一设置弹框内表单字段 r表示需要rules d表示需要disabled
const formItem = [
  {
    rules: { required: true, message: ' ' },
    label: '发卡行国家',
    type: 'select',
    remote: true,
    prop: 'countryCode',
    DIY: { key: 'countryId' },
    remoteSelectList: [],
    remoteMethod: (countryCode, item) => {
      countrySelectList({ countryCode, state: 'valid' }).then((res) => {
        item.remoteSelectList = (res.data || []).map((item) => {
          return { ...item, label: item.cname, value: item.countryCode }
        })
      })
    },
  },
  { label: '收支类型', type: 'select', prop: 'receipayType', propInDict: 'feeitemReceipayGroup', r: true },
  { label: '账户中文名称', type: 'input', prop: 'accountName', r: true },
  { label: '账户英文名称', type: 'input', prop: 'accountEname', r: true },
  { label: '账户名简称', type: 'input', prop: 'accountShortName', r: false },
  {
    rules: { required: true, message: ' ' },
    label: '开户行名称',
    type: 'select',
    remote: true,
    prop: 'accountBank',
    allowCreate: true,
    DIY: { key: 'bankCode' },
    remoteSelectList: [],
    remoteMethod: (value, item) => {
      bankList({
        currPage: 1,
        pageSize: 1000,
        query: [{ column: 'cname', type: 'like', value }],
      }).then((res) => {
        item.remoteSelectList = ((res.data && res.data.list) || []).map((item) => {
          return { ...item, label: item.cname, value: item.bankCode }
        })
      })
    },
  },
  { label: '开户支行名称', type: 'input', prop: 'accountBranchBank', r: true, show: false },
  { label: '发票展示开户行', type: 'input', prop: 'invoiceBankInfo', r: false},
  { label: '账号', type: 'input', prop: 'accountNo', r: true },
  { label: '银行地址', type: 'input', prop: 'accountBankAddr', r: true, show: false },
  { label: '公司地址', type: 'input', prop: 'accountBankCompAddr', r: true, show: false },
  { label: 'SWIFT Code', type: 'input', prop: 'swiftCode', r: true, show: false },
  { label: '账户类型', type: 'select', prop: 'accountType', r: true },
  { label: '身份证号', type: 'input', prop: 'idCard', r: true, show: false},
  { label: '手机号', type: 'input', prop: 'mobileNo', r: true, show: false},
  { label: '币种(可多选)', type: 'select', prop: 'currency', multiple: true, r: true, filterable: true, selectOptions:[] },
]
const formData = {}
// formItem.forEach((item) => (formData[item.prop] = '')) // 深拷贝弹框内容，并设置需要rules，disabled的地方
let addDialogItems = []
formItem.map((item) => {
  formData[item.prop] = ''
  addDialogItems.push(item.r && !item.rules ? { ...item, rules: JSON.parse(JSON.stringify(ruleMsg)) } : { ...item })
})
export default {
  name: 'accountIndex',
  mixins: [mixin],
  inject: [
    'isCustomer',
  ],
  props: ['tableData', 'orgid', 'orgName','ename'],
  components: {
    FinanceTable,
    CrmDialog,
  },
  watch: {
    'dialogOption.form.accountType' (val) {
      let countryCode = this.dialogOption.form.countryCode?.countryCode
      let invoiceBankInfo = this.dialogOption.formItems.find(item => item.prop === 'invoiceBankInfo')
      let idCard = this.dialogOption.formItems.find(item => item.prop === 'idCard')
      let mobileNo = this.dialogOption.formItems.find(item => item.prop === 'mobileNo')
      this.$set(idCard, 'show',val !== 'pub')
      this.$set(mobileNo, 'show',val !== 'pub')
      if ( val === 'pub') {
        this.dialogOption.form.idCard = ''
        this.dialogOption.form.mobileNo = ''
        if(countryCode === 'CN'){
          this.dialogOption.form.accountName = this.orgName
          this.dialogOption.formItems.find(item => item.prop === 'accountName').disabled = true
          this.$set(invoiceBankInfo, 'rules', { required: true, message: ' ', trigger: 'blur' })
        }
      } else {
        this.dialogOption.formItems.find(item => item.prop === 'accountName').disabled = false
        this.$set(invoiceBankInfo, 'rules', { required: false, })
        if(!this.isCustomer){
          this.$set(idCard, 'rules', { required: false, })
          this.$set(mobileNo, 'rules', { required: false, })
        }else{
           this.$set(idCard, 'rules', { required: true, message: ' ', trigger: 'blur' })
           this.$set(mobileNo, 'rules', { required: true, message: ' ', trigger: 'blur' })
        }
      }
    },
    'dialogOption.form.countryCode': {
      handler(val) {
        let hasVal = !!val
        if (val.countryCode === 'CN' || !val) {
          this.dialogOption.form.accountBankAddr = ''
          this.dialogOption.form.accountBankCompAddr = ''
          this.dialogOption.form.swiftCode = ''
          this.dialogOption.form.accountName = this.orgName
          this.dialogOption.form.accountEname = ''
        } else {
          this.dialogOption.form.accountBranchBank = ''
          this.dialogOption.form.accountName = ''
          this.dialogOption.form.accountEname = this.orgName
        }
        if (!val) {
          this.dialogOption.form.accountBranchBank = ''
        }
        let invoiceBankInfo = this.dialogOption.formItems.find(item => item.prop === 'invoiceBankInfo')
        if (val.countryCode === 'CN' && this.dialogOption.form.accountType === 'pub') {
          this.dialogOption.form.accountName = this.orgName
          this.dialogOption.formItems.find(item => item.prop === 'accountName').disabled = true
          this.$set(invoiceBankInfo, 'rules', { required: true, message: ' ', trigger: 'blur' })
        } else {
          this.dialogOption.formItems.find(item => item.prop === 'accountName').disabled = false
          this.$set(invoiceBankInfo, 'rules', { required: false })
        }
        this.dialogOption.formItems.forEach(ele => {
          if (['accountBankAddr','accountBankCompAddr','swiftCode'].includes(ele.prop)) {
            this.$set(ele, 'show', val.countryCode !== 'CN' && hasVal)
          }
          if (ele.prop === 'accountBranchBank') {
            this.$set(ele, 'show', val.countryCode === 'CN' && hasVal)
          }
          if(ele.prop === 'accountBank'){
            this.$set(ele, 'allowCreate', val.countryCode !== 'CN')
          }
          if(ele.prop === 'accountName'){
            this.$set(ele.rules[0], 'required', !!val.countryCode && val.countryCode === 'CN')
          }
          if(ele.prop === 'accountEname'){
            this.$set(ele.rules[0], 'required', !!val.countryCode && val.countryCode !== 'CN')
          }
        })
        // 联动必填
        if (this.dialogOption.form.receipayType) {
          this.checkRule()
        }
      },
    },
    'dialogOption.form.receipayType' () {
      // "receive" "pay" "receivepay"
      if (this.dialogOption.form.countryCode) {
        this.checkRule()
      }
    },
  },
  data() {
    return {
      // 表格配置
      tableOption: {},
      // 弹框配置
      dialogOption: {
        showClear: true,
        btnLoading: false,
        show: false,
        title: '银行信息新增',
        formItems: [...addDialogItems].map(item => {
          if(item.prop === 'currency') item.selectOptions = this.$store.state.dict.dictMap['validCurrency'].filter(v=>v.value !== 'ORIGINAL')
          return item
        }),
        form: { ...formData },
        labelWidth: '120px',
        width: '800px'
      },
      accountBankList: [],
      bankInfoData: [],
      loading: false,
      activeName: 'countInfo',
      dialogVisible: false,
      countrySelectList: [],
      currencyList: [],
      showTips: false
    }
  },
  created() {
    this.tableOption = { ...this.option, id: 'option1', pagination: false, selection: false }
    this.tableOption.style = { padding: '0 20px 20px 20px' }
    this.tableOption.operationBtns.data = [{ label: '删除', action: 'Delete', show: true }]
    this.tableOption.columns = accountInfoColumns
    this.tableOption.data = this.tableData
  },
  methods: {
    showTipsFn () {
      this.showTips = !this.showTips
    },
    handleDelete(index, row) {
      // this.$confirmWarn('此操作将删除该信息，是否继续?', () => this.tableOption.data.splice(index, 1))
      this.$confirm('此操作将删除该信息，是否继续?', '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then((val) => {
        val && this.tableOption.data.splice(index, 1)
      })
    },
    closeDialog(val) {
      // return
      if (val) {
        let data = this.dialogOption.form
        let isCN = data.countryCode.countryCode === 'CN'
        let isChangeName = data.accountName !== this.orgName
        let isPrv = data.accountType === 'prv'
        if(isPrv && this.isCustomer){
          let val = this.dialogOption.form.idCard;
          var yearBirth = val.substring(6,10);
          var monthBirth = val.substring(10,12);
          var dayBirth = val.substring(12,14);
          var regIdNo = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/; 
            if(!regIdNo.test(val) && val){ 
              return this.$msgErrClose('身份证号填写有误');
            }
          var myDate = new Date();
          var monthNow = myDate.getMonth() + 1;
          var dayNow = myDate.getDate();
          var age = myDate.getFullYear() - yearBirth;
          if(monthNow < monthBirth || (monthNow == monthBirth && dayNow < dayBirth)){
              age--;
          }
          if ((age<18 || age>60 ) && val){
            return this.$msgErrClose('持卡人年龄不符合要求，不可添加！')
          }
        }
        if ( isCN && isChangeName && isPrv) {
            this.$confirm('账户名和公司抬头不一致是否确认？', "警告", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning"
            }).then(() => {
              this.closeDialogFn()
            }).catch(() => {})
        } else {
          this.closeDialogFn()
        }
      } else {
        this.dialogOption.show = false
      }
    },
    closeDialogFn () {
      let data = this.dialogOption.form
        let { countryCode, cname: countryName } = data.countryCode || {}
        let { bankCode: accountBankCode, cname: accountBank } = data.accountBank || {}
        if (typeof data.accountBank === 'string') {
          accountBankCode = accountBank = data.accountBank
        }
        if (Array.isArray(data.currency)) {
          data.currency = data.currency.join(',')
        }
        // if (this.tableOption.data.find((item) => item.accountNo == data.accountNo)) {
        //   return this.$msgErrClose('已存在相同账号！')
        // }
        this.dialogOption.btnLoading = true
        ACCOUNT.verifyAccount({ accountNo: data.accountNo, orgid: this.orgid })
          .then((res) => {
            this.tableOption.data.push({ ...data, countryCode, countryName, accountBankCode:accountBankCode||accountBank, accountBank })
            this.dialogOption.show = false
          })
          .finally(() => {
            this.dialogOption.btnLoading = false
          })
    },
    dialogShow(){
      this.dialogOption.show = true
      this.dialogOption.form.accountName = this.orgName
      // this.dialogOption.form.accountEname = this.ename
    },
    // 联动必填
    checkRule () {
      // 若发卡行国家为【境外】且收支类型为【应收】账户名称必填、其他字段不必填。
      // 若发卡行国家为【境外】且收支类型为【应付】和【应收应付】所有字段必填。
      let outer =  this.dialogOption.form.countryCode.countryCode !== 'CN'
      let isReceive =  this.dialogOption.form.receipayType === 'receive'  // 应收
      if (outer) {
        this.dialogOption.formItems.forEach(ele => {
          if (isReceive) {
            if (['receipayType','accountEname','countryCode'].includes(ele.prop)) {
              this.$set(ele, 'rules', [{ required: true, message: ' ' }])
            } else {
              this.$set(ele, 'rules', [{ required: false, message: ' '}])
            }
          } else {
            if(['accountName','invoiceBankInfo','accountShortName'].includes(ele.prop)){
              this.$set(ele, 'rules', [{ required: false, message: ' ' }])
            } else {
              this.$set(ele, 'rules', [{ required: true, message: ' ' }])
            }
          }
        })
      } else {
        this.dialogOption.formItems.forEach(ele => {
            let sta =  ele.prop === 'invoiceBankInfo' && this.dialogOption.form.accountType !== 'pub'
            if(['accountEname','accountShortName'].includes(ele.prop) || sta){
              this.$set(ele, 'rules', [{ required: false, message: ' ' }])
            } else {
              this.$set(ele, 'rules', [{ required: true, message: ' ' }])
            }
        })
      }
      // if (outer && isReceive) { //国外应收
      //     this.dialogOption.formItems.forEach(ele => {
      //       if (['receipayType','accountEname'].includes(ele.prop)) {
      //         this.$set(ele, 'rules', ruleMsg)
      //       } else if(ele.prop === 'accountBank' || ele.prop === 'accountName'){
      //         this.$set(ele, 'rules', { required: false, message: ' ' })
      //       } else if(ele.prop === 'countryCode'){
      //         this.$set(ele, 'rules', { required: true, message: ' ' })
      //       } else {
      //         this.$set(ele, 'rules', [{}])
      //       }
      //     })
      //   } else {
      //     this.dialogOption.formItems.forEach(ele => {
      //       if( ['accountBank', 'countryCode'].includes(ele.prop)){
      //         this.$set(ele, 'rules', { required: true, message: ' ' })
      //       } else {
      //         this.$set(ele, 'rules', ruleMsg)
      //       }
      //     })
      //   }
    }
  },
}
</script>

<style lang="scss" scoped>
.tips-box{
  cursor: pointer;
  font-size: 12px;
  color: #999;
  text-align: right;
  float: right;
}
</style>
