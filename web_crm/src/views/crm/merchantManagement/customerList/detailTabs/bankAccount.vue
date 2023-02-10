<template>
  <div>
    <div class="search-box">
      <div class="search-item">
        <span>账号：</span>
        <el-input v-model.trim="accountNo" placeholder="" clearable @input="searchBank"></el-input>
      </div>
      <div class="search-item">
        <span>中/英文账户名：</span>
        <el-input v-model.trim="accountName" placeholder="" clearable @input="searchBank"></el-input>
      </div>
      <!-- <div class="search-btn">
        <el-button type="primary" size="mini" @click="searchBank">搜索</el-button>
      </div> -->
    </div>
    <FinanceTable :option="option1" @send-multi="selectMulti" />
    <CrmDialog ref="invalid" v-if="invalidDialog.show" :option="invalidDialog" @close="closeDialog('invalid',$event)" />
    <CrmDialog v-if="addDialog.show" :multi="true" ref="add" :option="addDialog" @close="closeDialog('add',$event)" >
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
import { accountInfoColumns as columnsData } from '@/views/crm/data'
import ACCOUNT from '@/api/crm/orgBankAccount'
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
    remoteMethod: (countryCode, item, option) => {
      countrySelectList({ countryCode, state: 'valid' }).then((res) => {
        let list = res.data || []
        let countryCode = option.form.countryCode?.countryCode
        if(countryCode){
          let find = list.find(ele => ele.countryCode === countryCode.toUpperCase())
          if(find){
            option.form.countryCode = find
          }else{
            list.unshift(option.form.countryCode)
          }
        }
        item.remoteSelectList = list.map((item) => {
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
    remoteMethod: (value, item, option) => {
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
  { label: '发票展示开户行', type: 'input', prop: 'invoiceBankInfo', r: false },
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
const addDialogItems = formItem.map((item) => {
  formData[item.prop] = ''
  return item.r && !item.rules ? { ...item, rules: JSON.parse(JSON.stringify(ruleMsg)) } : { ...item }
})
export default {
  name: 'bankAccount',
  mixins: [mixin],
  props: ['custid', 'orgid', 'account', 'banklist', 'isSelf', 'isSupplier', 'invalidShow' ,'isShipC','isBlacklist'],
  components: {
    FinanceTable,
    CrmDialog,
  },
  watch: {
    'addDialog.form.accountType' (val) {
      let countryCode = this.addDialog.form.countryCode?.countryCode
      let invoiceBankInfo = this.addDialog.formItems.find(item => item.prop === 'invoiceBankInfo')
      let idCard = this.addDialog.formItems.find(item => item.prop === 'idCard')
      let mobileNo = this.addDialog.formItems.find(item => item.prop === 'mobileNo')
      this.$set(idCard, 'show',val === 'prv')
      this.$set(mobileNo, 'show',val === 'prv')
      if ( val === 'pub') {
        this.addDialog.form.idCard = ''
        this.addDialog.form.mobileNo = ''
        if(countryCode === 'CN'){
          this.addDialog.form.accountName = this.$attrs.companyName
          this.addDialog.formItems.find(item => item.prop === 'accountName').disabled = true
          this.$set(invoiceBankInfo, 'rules', { required: true, message: ' ', trigger: 'blur' })
        }
      } else {
        this.addDialog.formItems.find(item => item.prop === 'accountName').disabled = false
        this.$set(invoiceBankInfo, 'rules', { required: false, })
        if(this.isSupplier || this.isShipC){
          this.$set(idCard, 'rules', { required: false, })
          this.$set(mobileNo, 'rules', { required: false, })
        }else{
          let isReceive =  this.addDialog.form.receipayType === 'receive' 
          if(countryCode === 'CN'){
            if(isReceive){
              this.$set(idCard, 'rules', { required: false, })
            }else{
              this.$set(idCard, 'rules', { required: true, message: ' ', trigger: 'blur' })
            }
            // 收支类型为应收的，身份证号不必填
            this.$set(mobileNo, 'rules', { required: true, message: ' ', trigger: 'blur' })
          }else{
            this.$set(idCard, 'rules', { required: false, })
            this.$set(mobileNo, 'rules', { required: false, })
          }
        }
      }
    },
    account(val) {
      if (!val) return
      this.$emit('update:account', false)
      this.showDialog('add')
      setTimeout(() => {
        if (this.$attrs.companyName) this.addDialog.form.accountName = this.$attrs.companyName
      })
    },
    invalidShow(val) {
      if (!val) return
      this.$emit('update:invalidShow', false)
      this.invalidRow()
    },
    'addDialog.form.countryCode': {
      handler(val) {
        let hasVal = !!val
        if (val.countryCode === 'CN' || !val) {
          this.addDialog.form.accountBankAddr = ''
          this.addDialog.form.accountBankCompAddr = ''
          this.addDialog.form.swiftCode = ''
          let accountName = this.addDialog.form.accountName || ''
          this.addDialog.form.accountName = accountName ? accountName : this.$attrs.companyName
          // this.addDialog.form.accountEname = ''
        } else {
          this.addDialog.form.accountBranchBank = ''
          // this.addDialog.form.accountName = ''
          let accountEname = this.addDialog.form.accountEname || ''
          this.addDialog.form.accountEname = accountEname ? accountEname : this.$attrs.companyName
        }
        if (!val) {
          this.addDialog.form.accountBranchBank = ''
        }
        let idCard = this.addDialog.formItems.find(item => item.prop === 'idCard')
        let mobileNo = this.addDialog.formItems.find(item => item.prop === 'mobileNo')
        let isReceive =  this.addDialog.form.receipayType === 'receive' 

        if(val.countryCode === 'CN'){
          if(isReceive){
            this.$set(idCard, 'rules', { required: false, })
          }else{
            this.$set(idCard, 'rules', { required: true, message: ' ', trigger: 'blur' })
          }
          this.$set(mobileNo, 'rules', { required: true, message: ' ', trigger: 'blur' })
        }else{
          this.$set(idCard, 'rules', { required: false, })
          this.$set(mobileNo, 'rules', { required: false, })
        }
        let invoiceBankInfo = this.addDialog.formItems.find(item => item.prop === 'invoiceBankInfo')
        if (val.countryCode === 'CN' && this.addDialog.form.accountType === 'pub') {
          this.addDialog.form.accountName = this.$attrs.companyName
          this.addDialog.formItems.find(item => item.prop === 'accountName').disabled = true
          this.$set(invoiceBankInfo, 'rules', { required: true, message: ' ', trigger: 'blur' })
        } else {
          this.addDialog.formItems.find(item => item.prop === 'accountName').disabled = false
          this.$set(invoiceBankInfo, 'rules', { required: false })
        }
        this.addDialog.formItems.forEach(ele => {
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
        if (this.addDialog.form.receipayType) {
          this.checkRule()
        }
      },
      immediate: true,
    },
    'addDialog.form.receipayType' (val) {
      // "receive" "pay" "receivepay"
      if (this.addDialog.form.countryCode) {
        this.checkRule()
      }
      let countryCode = this.addDialog.form.countryCode?.countryCode
      let accountType = this.addDialog.form.accountType
      let idCard = this.addDialog.formItems.find(item => item.prop === 'idCard')
      let mobileNo = this.addDialog.formItems.find(item => item.prop === 'mobileNo')
      let isReceive =  val === 'receive' 
      if(accountType==='prv'&& countryCode === 'CN' ){
        // 收支类型为应收的，身份证号不必填
        if(isReceive){
          this.$set(idCard, 'rules', { required: false, })
        }else{
          this.$set(idCard, 'rules', { required: true, message: ' ', trigger: 'blur' })
        }
        this.$set(mobileNo, 'rules', { required: true, message: ' ', trigger: 'blur' })
      }else{
        this.$set(idCard, 'rules', { required: false, })
        this.$set(mobileNo, 'rules', { required: false, })
      }
    },
    isSelf: {
      handler(val) {
        this.$nextTick(() => this.option1.operationBtns.show = val)
      },
      immediate: true,
    },
  },
  data() {
    return {
      // 表格配置
      option1: {},
      addDialog: {
        showClear: true,
        show: false,
        btnLoading: false,
        title: '银行信息新增',
        text: '新增',
        formItems: [...addDialogItems].map(item => {
          if(item.prop === 'currency') item.selectOptions = this.$store.state.dict.dictMap['validCurrency'].filter(v=>v.value !== 'ORIGINAL')
          return item
        }),
        form: { ...formData },
        width: '800px',
        labelWidth: '120px'
      },
      invalidDialog: {
        showClear: true,
        show: false,
        btnLoading: false,
        title: '账号失效',
        text: '失效',
        formItems: [
          { label: '账号', type: 'input', prop: 'accountNo', disabled: true, },
          { label: '失效原因', type: 'textarea', prop: 'reason', rules: ruleMsg },
        ],
        form: { reason: '', name: '', accid: '', custid: '', orgid: '' },
      },
      multipleSelection: [],
      accountNo: '',
      accountName: '',
      sourceList: [],
      editStatus: false,
      showTips: false
    }
  },
  activated() {
    // console.log(this.orgid)
    this.getData()
    this.accountNo = ''
    this.accountName =''
  },
  created() {
    let operationBtns = {
      fixed: 'right',
      width: '120px',
      show: true,
      data: [
        // {
        //   label: '编辑',
        //   type: 'text',
        //   showFn: (row) => row.status !== 'no_effect',
        //   action: 'Edit'
        // },
        {
          label: '失效',
          type: 'text',
          showFn: (row) => row.status !== 'no_effect',
          action: 'Invalid'
        },
      ],
      callback: (action, $index, row, item) => {
         if (action === 'Edit') {
          this.editBank(row)
        }
        if (action === 'Invalid') {
          this.invalidBank(row)
        }
      }
    }
    this.option1 = {
      ...this.option,
      id: 'option1',
      operationBtns,
      pagination: false,
      selection: false,// { show: true, fixed: true },
      rootTipsHide: true,
    }
    this.option1.style = { padding: '5px 0' }
    this.initColumns()
  },
  methods: {
    showTipsFn () {
      this.showTips = !this.showTips
    },
    // 失效银行卡
    invalidBank(row){
      let data = Object.assign({},row)
      this.showDialog('invalid', data)
    },
    initColumns() {
      let reason = { prop: 'reason', label: '失效原因', type: 'tooltip' }
      let columns = columnsData.map((item) => {
        return { ...item, hasTag: item.prop === 'countryName' }
      })
      this.option1.columns = [...columns, reason]
    },
    getData() {
      let method = this.isSupplier ? 'supplierList' : this.isShipC ? 'shippingCarrierList' : 'customerList'
      let data = { custid: this.custid, supplierId: this.custid,shippingCarrierId: this.custid }
      ACCOUNT[method](data).then((res) => {
        this.sourceList = res.data.map((item) => {
          item._isInvalid = item.status === 'no_effect'
          if (item._isInvalid) {
            item._tagArr = [{ type: 'invalid', text: '失' }]
          }
          return { ...item }
        })
        this.option1.data = [...this.sourceList]
        this.$emit('update:banklist', res.data || [])
      })
    },
    closeDialog(type, tag) {
      if (!tag) {
        if (type === 'add') {
          this.editStatus = false
          this.addDialog.title = '银行信息新增'
          this.addDialog.text = '新增'
        }
        return (this[type + 'Dialog'].show = false)
      }
      let data = this.addDialog.form
      let isCN = data.countryCode.countryCode === 'CN'
      let isAdd = type === 'add'
      let isChangeName = data.accountName !== this.$attrs.companyName
      let isPrv = data.accountType === 'prv'
      if(isPrv && !this.isSupplier && !this.isShipC){
        let val = this.addDialog.form.idCard;
        var yearBirth = val.substring(6,10);
        var monthBirth = val.substring(10,12);
        var dayBirth = val.substring(12,14);
        var regIdNo = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/; 
          if(!regIdNo.test(val)&& val){ 
            return this.$msgErrClose('身份证号填写有误');
          }
        var myDate = new Date();
        var monthNow = myDate.getMonth() + 1;
        var dayNow = myDate.getDate();
        var age = myDate.getFullYear() - yearBirth; //60
        if (monthNow < monthBirth) {
          age--
        } else if (monthNow == monthBirth) {
          if (dayNow > dayBirth) {
            age++
          } else if (dayNow < dayBirth){
            age--
          }
        } else if (monthNow > monthBirth) {
          age ++ 
        }
        if ((age<18 || age>60 ) && val) {
          return this.$msgErrClose('持卡人年龄不符合要求，不可添加！')
        }
      }

      if ( isCN && isAdd && isChangeName && isPrv) {
          this.$confirm('账户名和公司抬头不一致是否确认？', "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).then(() => {
            this.closeDialogFn(type)
          }).catch(() => {})
      } else {
        this.closeDialogFn(type)
      }
    },
    closeDialogFn (type) {
      // 更新银行信息
      if (this.editStatus) {
        return this.updatabank()
      }
      let str = this.isSupplier ? 'supplier' : this.isShipC ? 'shippingCarrier' :'customer'
      let method = ACCOUNT[type == 'add' ? `${str}Add` : `${str}Invalid`]
      let data = { ...this[type + 'Dialog'].form, orgid: this.orgid, custid: this.custid, supplierId: this.custid }
      let { countryCode, cname: countryName } = data.countryCode || {}
      let { bankCode: accountBankCode, cname: accountBank } = data.accountBank || {}
      if (typeof data.accountBank === 'string') {
        accountBankCode = accountBank = data.accountBank
      }
      if (Array.isArray(data.currency) ) {
        data.currency = data.currency.join(',') // 币种多选
      }
      this[type + 'Dialog'].btnLoading = true
      method({ ...data, countryCode, countryName, accountBank, accountBankCode:accountBankCode||accountBank })
        .then(() => {
          let ref = this.$refs[type].$refs.form
          ref.resetFields()
          // this.$nextTick(() => ref.clearValidate())
          this.$nextTick(() => (this[type + 'Dialog'].show = false))
          this.$msgSucClose(type == 'add' ? '新增账号信息成功！' : '失效设置成功！')
          this.getData()
        })
        .finally(() => {
          this[type + 'Dialog'].btnLoading = false
        })
    },
    showDialog(type, row) {
      if (row && type === 'invalid') {
        this.invalidDialog.form = row
      }
      if (type === 'add') {
        for (const key in this.addDialog.form) {
          if (Object.hasOwnProperty.call(this.addDialog.form, key)) {
            this.$set(this['addDialog']['form'], key, '')
          }
        }
         this.addDialog.formItems.forEach(item => {
          if(item.prop === 'countryName'){
            item.prop = 'countryCode'
            item.type = 'select'
          }
           item.disabled = false
         })
      }
      this[type + 'Dialog'].show = true
    },
    // 编辑银行卡
    editBank (row) {
      this.addDialog.title = '银行信息编辑'
      this.addDialog.text = '提交'
      let {countryName, countryCode} = row
      countryCode = countryCode.toUpperCase()
      let obj = {cname:countryName, countryCode, label: countryName, value: countryCode}
      this.$nextTick(()=>{
        // this.addDialog.formItems.forEach(item => {
        //   if(item.prop === 'countryCode'){
        //     item.prop = 'countryName'
        //     item.type = 'input'
        //   }
        // })
        this.addDialog.form.countryCode = obj
      })
      let currencyVal = row.currency ? row.currency.split(',') : []
      Object.assign( this.addDialog.form, row, {currency: currencyVal} )
      setTimeout(() => {
        this.addDialog.form.currency = currencyVal
      }, 300);
      this.editStatus = true
      this.addDialog.show = true
    },
    // 更新银行卡信息
    updatabank () {
      let str = this.isSupplier ? 'supplier' : this.isShipC ? 'shippingCarrier' :'customer'
      let method = ACCOUNT[`${str}Update`]
      let data = {...this.addDialog.form, orgid: this.orgid, custid: this.custid, supplierId: this.custid }
      let { countryCode, cname: countryName } = data.countryCode || {}
      let { bankCode: accountBankCode, cname: accountBank } = data.accountBank || {}
      if (typeof data.accountBank === 'string') {
        accountBankCode = accountBank = data.accountBank
      }
      if (Array.isArray(data.currency) ) {
        data.currency = data.currency.join(',') // 币种多选
      }
      data = Object.assign({}, data, { countryCode, countryName, accountBank, accountBankCode:accountBankCode||accountBank })
      this['addDialog'].btnLoading = true
      method(data).then(res => {
        if (res.code === 0) {
          this.editStatus = false
          this.addDialog.show = false
          this.getData()
          this.$msgSucClose('银行信息更新成功')
        }
      }).catch(()=>{}).finally(()=> {
        this['addDialog'].btnLoading = false
      })
    },
    selectMulti(list) {
      this.multipleSelection = list
    },
    invalidRow() {
      if (this.multipleSelection.length !== 1) {
        return this.$msgErrClose('请选择一个银行信息！')
      }
      if (this.multipleSelection[0]._isInvalid) {
        return this.$msgErrClose('请选择未失效的银行信息！')
      }
      this.showDialog('invalid', this.multipleSelection[0])
    },
    // 联动必填
    checkRule () {
      // 若发卡行国家为【境外】且收支类型为【应收】账户名称必填、其他字段不必填。
      // 若发卡行国家为【境外】且收支类型为【应付】和【应收应付】所有字段必填。
      let outer =  this.addDialog.form.countryCode.countryCode !== 'CN'
      let isReceive =  this.addDialog.form.receipayType === 'receive'  // 应收
      if (outer) {
        this.addDialog.formItems.forEach(ele => {
          if (isReceive) {
            if (['receipayType','accountEname','countryCode','countryName'].includes(ele.prop)) {
              this.$set(ele, 'rules', [{ required: true, message: ' ' }])
            } else {
              this.$set(ele, 'rules', [{ required: false, message: ' '}])
            }
          } else {
            if(['accountName','invoiceBankInfo','accountShortName'].includes(ele.prop)){
              this.$set(ele, 'rules', [{ required: false, message: ' ' }])
            } else if (!['idCard','mobileNo'].includes(ele.prop)){
              this.$set(ele, 'rules', [{ required: true, message: ' ' }])
            }
          }
        })
      } else {
        this.addDialog.formItems.forEach(ele => {
          let sta =  ele.prop === 'invoiceBankInfo' && this.addDialog.form.accountType !== 'pub'
            if(['accountEname','accountShortName'].includes(ele.prop) || sta){
              this.$set(ele, 'rules', [{ required: false, message: ' ' }])
            } else if (!['idCard','mobileNo'].includes(ele.prop)){
              this.$set(ele, 'rules', [{ required: true, message: ' ' }])
            }
        })
      }
      // if (outer && isReceive) { //国外应收
      //     this.addDialog.formItems.forEach(ele => {
      //       if (['receipayType','accountName'].includes(ele.prop)) {
      //         this.$set(ele, 'rules', ruleMsg)
      //       } else if(ele.prop === 'accountBank'){
      //         this.$set(ele, 'rules', { required: false, message: ' ' })
      //       } else if(ele.prop === 'countryCode'){
      //         this.$set(ele, 'rules', { required: true, message: ' ' })
      //       } else {
      //         this.$set(ele, 'rules', [{}])
      //       }
      //     })
      //   } else {
      //     this.addDialog.formItems.forEach(ele => {
      //       if(ele.prop === 'accountBank' || ele.prop === 'countryCode'){
      //         this.$set(ele, 'rules', { required: true, message: ' ' })
      //       } else {
      //         this.$set(ele, 'rules', ruleMsg)
      //       }
      //     })
      //   }
    },
    // 搜索银行账号
    searchBank () {
      if (!this.accountNo && !this.accountName) {
        this.option1.data = this.sourceList
        return
      }
      let str = this.accountName.toLowerCase()
      if (this.accountNo && this.accountName) {
        this.option1.data = this.sourceList.filter(item => {
          let accountName = item.accountName.toLowerCase()
          let accountEname = item.accountEname.toLowerCase()
          return item.accountNo.indexOf(this.accountNo) > -1 && (accountName.indexOf(str) > -1 || accountEname.indexOf(str) > -1)
        })
        return
      }
      if (this.accountNo) {
        this.option1.data = this.sourceList.filter(item => {
          return item.accountNo.indexOf(this.accountNo) > -1
        })
        return
      }
      if (this.accountName) {
        this.option1.data = this.sourceList.filter(item => {
          let accountName = item.accountName.toLowerCase()
          let accountEname = item.accountEname.toLowerCase()
          return (accountName.indexOf(str) > -1 || accountEname.indexOf(str) > -1)
        })
        return
      }
    }
  },
}
</script>

<style lang="scss" scoped>
.search-box{
  display: flex;
  align-items: center;
  flex-direction: row;
  margin: 15px 8px 0;
  .search-item{
    display: flex;
    align-items: center;
    margin-right: 10px;
    .el-input{
      width: 180px;
    }
    span{
      flex: 1;
      text-align: right;
    }
  }
  .search-btn{
    flex: 1;
  }
}
.tips-box{
  cursor: pointer;
  font-size: 12px;
  color: #999;
  text-align: right;
  float: right;
}
</style>
