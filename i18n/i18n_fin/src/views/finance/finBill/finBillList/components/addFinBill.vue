<template>
  <div class="finance-page">
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">{{$t('FinBill.addBill')}}</div>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" size="mini" type="primary" @click="saveFinBill">{{$t('Common.save')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" size="mini" @click="cancel(false)">{{$t('Common.back')}}</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    <div class="settlement-detail-form">
      <el-form :model="formData" ref="form" :rules="rules" :inline="true" size="mini" label-width="120px" label-suffix=':'>
        <el-form-item :label="$t('FinBill.finBillName')" prop="finBillName" class="double-form-item">
          <el-input v-model="formData.finBillName" :placeholder="$t('Common.plEnter')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('FinBill.billTypes')" prop="billType">
          <el-select v-model="formData.billType" value-key :placeholder="$t('Common.plSelect')">
            <el-option
              v-for="item in dictMap['finBillBillType']"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('FinBill.employeeId')" prop="employeeId">
          <el-select
            filterable
            remote
            clearable
            :disabled="employeeDisabled"
            size="mini"
            v-model="formData.employeeId"
            :placeholder="$t('Common.plSelect')"
            :remote-method="getEmployeeList"
            @visible-change="(value) => {if(value){getEmployeeList('')}}"
            @change="employeeChange"
            @clear="formData.employeeNo = formData.departCode = formData.year = formData.month = ''"
          >
            <el-option
              v-for="o in employeeOptions "
              :key="o.employeeId"
              :label="o.cname"
              :value="o.employeeId"
            >
              <span>{{ o.cname }} ({{o.employeeNo}})</span>
            </el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item v-show="formData.employeeNo" label="?????????" prop="employeeNo"> -->
        <el-form-item :label="$t('FinBill.employeeNo')" prop="employeeNo">
          <el-input disabled v-model="formData.employeeNo"></el-input>
        </el-form-item>
        <!-- change-on-select
        expandTrigger="click"-->
        <el-form-item :label="$t('FeeList.bdDeptCode')" prop="departCode">
          <el-cascader
            v-if="forceRefresh"
            ref="cascader"
            filterable
            size="mini"
            clearable
            :disabled="departDisabled"
            :options="departmentList"
            v-model="formData.departCode"
            :props="cascaderProps"
            :placeholder="$t('Common.plSelect')"
          ></el-cascader>
        </el-form-item>
        <el-form-item :label="$t('FinBill.year')" prop="year">
          <el-select disabled size="mini" v-model="formData.year" :placeholder="$t('Common.plSelect')">
            <el-option v-for="o in years" :key="o.value" :label="o.label" :value="o.value">
              <span>{{o.label}}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <!-- ??????????????????????????????????????????12??????????????????1???????????????????????????????????? -->
        <el-form-item :label="$t('FinBill.months')" prop="month">
          <el-select :disabled="!backupMonth" size="mini" v-model="formData.month" :placeholder="$t('Common.plSelect')">
            <el-option v-for="o in months" :key="o.value" :label="o.label" :value="o.value">
              <span>{{o.label}}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('FeeList.sysLineCode')" prop="sysLineCode" v-if="formData.billType === 'pricing_loss_berth_fee'">
          <el-select
            filterable
            remote
            clearable
            size="mini"
            v-model="formData.sysLineCode"
            :placeholder="$t('Common.plSelect')"
            :remote-method="(name) => baseSystemLineList(name,'',false,sysLineCodeOptions)"
            @visible-change="(value) => {if(value){baseSystemLineList('','',false,sysLineCodeOptions)}}"
          >
            <el-option
              v-for="o in sysLineCodeOptions "
              :key="o.value"
              :label="o.label"
              :value="o.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <br />
        <el-form-item :label="$t('FinBill.remark')" prop="remark" class="long-form-item">
          <el-input
            maxlength="500"
            show-word-limit
            type="textarea"
            v-model="formData.remark"
            :placeholder="$t('Common.plEnter')"
          ></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">{{$t('FeeList.receivable')}}</div>
        </div>
        <div class="money-box-right">
          <el-button class="finance-btn" size="mini" type="primary" @click="addRow('option1')">{{$t('FinBill.addReceive')}}</el-button>
          <el-button class="finance-btn" @click="handleCopy('receive')" size="mini">{{$t('Common.copy')}}</el-button>
          <el-button class="finance-btn" size="mini" @click="addRow('option2', true)">{{$t('FinBill.income')}}</el-button>
          <el-button class="finance-btn" @click="handleDelete('receive')" size="mini" type="danger">{{$t('Common.del')}}</el-button>
          <el-button type="text" class="collapse-btn" @click="handleCollapse('Table1')" size="mini">
            {{showTable1? $t('Common.collapse'):''}}
            <i
              :class="[showTable1?'el-icon-arrow-down':'el-icon-arrow-right']"
            ></i>
          </el-button>
        </div>
      </div>
      <FinanceTableMass v-show="showTable1" :option="option1" @send-multi="sendMulti"/>
      <!-- ($event, 1) -->
    </div>
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">{{$t('FeeList.payable')}}</div>
        </div>
        <div class="money-box-right">
          <el-button class="finance-btn" size="mini" type="primary" @click="addRow('option2')">{{$t('FinBill.newExpenses')}}</el-button>
          <el-button class="finance-btn" @click="handleCopy('pay')" size="mini">{{$t('Common.copy')}}</el-button>
          <el-button class="finance-btn" size="mini" @click="addRow('option1', true)">{{$t('FinBill.expenditure')}}</el-button>
          <el-button class="finance-btn" @click="handleDelete('pay')" size="mini" type="danger">{{$t('Common.del')}}</el-button>
          <el-button type="text" class="collapse-btn" @click="handleCollapse('Table2')" size="mini">
            {{showTable2? $t('Common.collapse'):''}}
            <i
              :class="[showTable2?'el-icon-arrow-down':'el-icon-arrow-right']"
            ></i>
          </el-button>
        </div>
      </div>
      <FinanceTableMass v-show="showTable2" :option="option2" @send-multi="sendMulti"/>
      <!-- ($event, 2) -->
    </div>
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { orderFeeMixin } from '@/views/finance/orderFee/orderFee/components/components/orderFeeMixin'
import { finBillMixin } from '@/views/finance/finBill/finBillList/components/finBillMixin'
import { mapState } from 'vuex'
import { saveFinBill } from '@/api/fin/finBill'
import { employeeSelectlist, departmentTreeList } from '@/api/companyResource'
import { getSysDate } from '@/api/fin/sysDate'
import { getCompanyPubDeptEmp } from '@/api/base'

export default {
  name: 'addFinBill',
  components: {
    FinanceTableMass,
  },
  mixins: [mixin, routerMixin, orderFeeMixin, finBillMixin],
  activated() {
    if (this.$route.meta.isUseCache) {
      return
    }
    this.init()
  },
  data() {
    return {
      // ?????????????????? ??????1 ??????2
      showTable1: true,
      showTable2: true,
      // ???????????? ??????1 ??????2
      option1: {},
      option2: {},
      multipleSelection1: [],
      multipleSelection2: [],
      // ??????????????????
      resData: {},
      // ????????????
      formData: {
        finBillName: '',
        billType: '',
        remark: '',
        departCode: [],
        employeeId: '',
        employeeNo: '',
        year: '', // new Date().getFullYear() + '',
        month: '', //  new Date().getMonth() + 1 + '',
        sysLineCode: '',
      },
      // ????????????
      rules: {
        billType: [{ required: true, message: ' ' }],
        // billType: [{ required: true, message: '????????????????????????' }],
        finBillName: [{ required: true, message: ' ' }],
        // finBillName: [{ required: true, message: '????????????????????????' }],
        departCode: [{ required: true, message: ' ', trigger: 'change' }],
        employeeId: [{ required: true, message: ' ', trigger: 'change' }],
        sysLineCode: [{ required: true, message: ' ', trigger: 'change' }],
      },
      // ????????????????????????
      columns: [],
      // ???????????????
      customColumnsPopShow: false,
      employeeOptions: [],
      backupEmployeeOptions: [],
      cascaderProps: {
        children: 'childList',
        label: 'deptCname',
        value: 'deptCode',
        checkStrictly: true,
      },
      departmentList: [],
      backupYear: '',
      backupMonth: '',
      years: [
        { label: new Date().getFullYear(), value: new Date().getFullYear() + '' },
        { label: +new Date().getFullYear() + 1, value: (+new Date().getFullYear() + 1) + '' },
        // { label: new Date().getFullYear() + 2, value: new Date().getFullYear() + 2 + '' },
      ],
      months: [
        { label: this.$t('Common.Jan'), value: '01' },
        { label: this.$t('Common.Feb'), value: '02' },
        { label: this.$t('Common.Mar'), value: '03' },
        { label: this.$t('Common.Apr'), value: '04' },
        { label: this.$t('Common.May'), value: '05' },
        { label: this.$t('Common.Jun'), value: '06' },
        { label: this.$t('Common.Jul'), value: '07' },
        { label: this.$t('Common.Aug'), value: '08' },
        { label: this.$t('Common.Sept'), value: '09' },
        { label: this.$t('Common.Oct'), value: '10' },
        { label: this.$t('Common.Nov'), value: '11' },
        { label: this.$t('Common.Dec'), value: '12' },
      ],
      years2: [{ label: new Date().getFullYear(), value: new Date().getFullYear() + '' }],
      months: [{ label: new Date().getMonth() + 1 + this.$t('Common.month'), value: new Date().getMonth() + 1 + '' }],
      deptCodeObj: {},
      forceRefresh: true,
      sysLineCodeOptions: [],
      // compCode: this.$store.state.user.compCode,
    }
  },
  watch: {
    // departCode: [],
    // employeeId: '',
    // employeeNo: '',
    'formData.sysLineCode'(val){
      if(val){
        let find = this.sysLineCodeOptions.find(item => item.value === val)
        this.formData.sysLineName = find && find.label
      }
    },
    'formData.billType'(val, oldVal){
      let tag = val === 'dzg_bill_fee'
      this.option1.data.forEach(row=>{
        this.$set(row, '_forceEdit', tag)
        row.feeCode =row.feeName = row.feeEnName =  row.currency =  row.feeUnit = row.taxRate = row.unitPrice = row.feeAmt = ''
      })
      this.option2.data.forEach(row=>{
        row.feeCode =row.feeName = row.feeEnName =  row.currency =  row.feeUnit = row.taxRate = row.unitPrice = row.feeAmt = ''
      })
      console.log(val)
      if(val === 'dzg_bill_fee'){
        getCompanyPubDeptEmp({}).then(res=>{
          if(!res.data) return
          this.employeeOptions = [res.data]
          this.$nextTick(()=>{
            this.employeeIsPublic = true
            this.formData.employeeId = res.data.employeeId
            this.formData.employeeNo = res.data.employeeNo
          })
          this.isEmployeeChange = true
          this.forceRefresh = false
          this.$nextTick(()=>{
            this.forceRefresh = true
            this.$nextTick(()=>{
              let index = res.data.empAllParentDeptCode.indexOf(this.compCode)+1
              this.formData.departCode = res.data.empAllParentDeptCode.splice(index)
            })
          })
        })
      }
      if(val !== 'pricing_loss_berth_fee'){
        this.formData.sysLineCode = this.formData.sysLineName = ''
      }
      if((val === 'pricing_loss_berth_fee' && oldVal !== 'pricing_loss_berth_fee') || (val !== 'pricing_loss_berth_fee' && oldVal === 'pricing_loss_berth_fee')){
        this.formData.employeeNo = this.formData.employeeId = ''
      }
      // if(val === '')
      // getCompanyPubDeptEmp
    },
    'formData.departCode'(val) {
      // console.log(this.departmentList)
      // console.log(val)
      if (val && val.length > 0) {
        // if (val.length >= 2) {
        //   settleCompCode = val[1]
        // } else if (val.length === 1) {
        //   settleCompCode = val[0]
        // }
        let value = val[val.length-1]
        let settleCompCode = ''
        function getCode(arr) {
          arr.forEach(item=>{
            if(value == item.deptCode){
              settleCompCode = item.settleCompanyCode
              return 
            }
            item.childList && item.childList.length && getCode(item.childList)
          })
        }
        getCode(this.departmentList || [])
        // if(!settleCompCode) return this.$msgErrClose('???????????????????????????????????????????????????????????????????????????????????????!')
        getSysDate({ settleCompCode }).then(res => {
          if (res.code === 0 && res.data) {
            let [year, month] = res.data.finMon.split('-')
            this.months = [
              { label:  month + this.$t('Common.month'), value: +month },
              { label: (month == 12 ? 1 : +month + 1) + this.$t('Common.month'), value: month == 12 ? 1 : +month + 1 },
              // { label: (month == 11 ? 1 : +month + 2) + '???', value: month == 11 ? 1 : +month + 2 },
            ]
            this.backupYear = year
            this.backupMonth = month
            this.formData.year = year
            this.formData.month = month
          }
        })
      } 

      if (val) {
        this.$refs.form.clearValidate('departCode')
      }
      if(this.isEmployeeChange){
        setTimeout(() => {
          this.isEmployeeChange = false
        },300);
        return
      }
      // console.log('`````````````````````');
      let code = val[val.length - 1]
      // console.log(code);
      this.employeeOptions.splice(0, 1000, ...this.backupEmployeeOptions.filter((v) => !code || v.deptCode == code))
      let find = this.employeeOptions.find((item) => {
        return item.employeeId === this.formData.employeeId
      })
      // console.log(JSON.stringify(find));
      if (find && find.deptCode === code) return
      this.formData.employeeId = this.formData.employeeNo = ''
    },
    compCode(){
      this.init()
    },
    'formData.month'(val){
      if(val == 1 && this.backupMonth == 12){
        this.formData.year = +this.backupYear + 1
      }else{
        this.formData.year = this.backupYear || ''
      }
    }
  },
  computed: {
    //   ??????????????????
    fbFeeVos() {
      return [
        ...this.option1.data.map((item) => ({ ...item, receipayType: 'receive' })),
        ...this.option2.data.map((item) => ({ ...item, receipayType: 'pay' })),
      ]
    },
    // ???????????????
    rowData() {
      let obj = { edit: true, isAddFee: true }
      this.columns.forEach((item) => (obj[item.prop] = ''))
      return obj
    },
    ...mapState({
      columnsBase: (state) => state.finance.columns.columnsBase,
      // compCode: (state) => state.user.compCode
      compCode: (state) => state.user.userInfo.settleCompanyCode
    }),
    employeeDisabled() {
      // return !!this.formData.departCode.length
      return false
    },
    departDisabled() {
      // return !!this.formData.employeeId
      return false
    },
  },
  created() {
    // console.log(this.$refs.cascader);
    let obj1 = { id: 'option1', edit: true, selection: {show: true, fixed: 'left'}, rootTipsHide: true }
    this.option1 = { ...this.option, ...obj1, data: [], id: 'option1', $name: 'FinBillListAdd1',
      handleKeyup: this.handleKeyup }
    this.option2 = { ...this.option, ...obj1, data: [], id: 'option2', $name: 'FinBillListAdd2',
      handleKeyup: this.handleKeyup }
    // let obj2 = { label: this.$t('Common.del'), type: 'text', show: true, action: 'Delete' }
    // this.option1.operationBtns.width = '80px'
    // this.option1.operationBtns.data = this.option2.operationBtns.data = [{ ...obj2 },
    //     { label: '??????', type: 'text', show: true, action: 'Copy' },]
    this.option1.operationBtns.show = this.option1.operationBtns.show = false
    this.columns = [
      {
        label: this.$t('FeeList.feeEname'),
        prop: 'feeEnName',
        type: 'autocomplete',
        clearable: true,
        required: true,
        querySearch: (queryString, cb) => {
          // transfer_fee???????????????  fee_adjust?????? intrabranch???????????? preserve_fee?????? express_fee?????? other??????
          let feeCode, finGroup, billType = this.formData.billType
          if(billType === 'transfer_fee'){
            // feeCode = 'YINHANGNK,YINHANGWK'
            feeCode = 'SOUSHIFEI,SXFFT'
          }else if(billType === 'dzg_bill_fee'){
            feeCode = 'NBWLSZDZG,NBWLXMDZG'
            let arr = this.dictMap.dzgCompCode.map(({label,value})=>{
              return {label,value:label,feeCode:value,feeEnName:value,currency:'',feeUnit:'',currency:'',key:value,feeName:label,znTaxRate:''}
            })
            return cb&&cb(arr)
          }else if(billType === 'express_fee'){
            feeCode = 'KDFFYL,KDF'
          }else if(billType === 'intrabranch'){
            // finGroup = 'intrabranch'
            feeCode = 'NBWL'
          }else if(billType === 'preserve_fee'){
            finGroup = 'lien'
          }
          console.log(feeCode, finGroup);
          // else if(this.billType === 'other'){}else if(this.billType === 'fee_adjust'){}
          // this.queryFeeItemList({ queryString, feeCode, finGroup }, cb)
          this.queryFeeItemList({ queryString, feeCode, finGroup, bizState:billType === 'transfer_fee'? false: '' }, cb)
        },
        select: (optionItem, row, item) => {
          // console.log(optionItem)
          //row.feeCode = "NBWL_XMDZG"?????????????????? "NBWL_SZDZG"??????????????????
          row.feeCode = optionItem.key
          row.feeEnName = optionItem.feeEnName
          row.currency = optionItem.currency
          row.feeUnit = optionItem.feeUnit.toLowerCase()
          if (row.receipayType === 'pay') {
            this.getTaxRate && this.getTaxRate(row)
          } 
          if (row.feeCode === 'TZFY' && row.unitPrice > 0) {
            row.feeAmt = row.unitPrice = ''
          } 
          // ????????????????????????return???false
          // if (!item.notAllowed) return
          // row.taxRate = optionItem.znTaxRate
          // if(row.feeCode == 'NBWLXMDZG' || row.feeCode == 'NBWLSZDZG'){
          //  this.$set(row, '_forceEdit', true)
          // }else{
          //  this.$set(row, '_forceEdit', false)
          // }
        },
      },
      // {
      //   label: this.$t('FeeList.feeEname'),
      //   prop: 'feeEnName',
      //   type: 'text',
      //   minWidth: 100,
      //   value: 'feeEnName',
      // },
      {
        label: this.$t('FeeList.currency'),
        prop: 'currency',
        type: 'select',
        propInDict: 'validCurrency',
        required: true
      },
      {
        label: this.$t('FeeList.settleCorp'),
        prop: 'settleCorpName',
        type: 'autocomplete',
        clearable: true,
        required: true,
        querySearch: (queryString, cb, row) => {
          this.querySettleUnit({ queryString, isAdd: true, isForbid: true, receipayType: row.receipayType }, cb)
        },
        select: (optionItem, row) => {
          row.settleCorpCode = optionItem.key
          if (row.receipayType === 'pay') {
            this.settleCorpNamePay = optionItem.value
            this.settleCorpCodePay = optionItem.key
          } else if (row.receipayType === 'receive') {
            this.settleCorpNameRecei = optionItem.value
            this.settleCorpCodeRecei = optionItem.key
          }
        },
      },
      {
        label: this.$t('FeeList.feeUnit'), //dicMap[fee_unit]
        prop: 'feeUnit',
        type: 'select',
        required: true
      },
      {
        label: this.$t('FeeList.unitPrice'),
        prop: 'unitPrice',
        type: 'input',
        negative: (row) => row.feeCode === 'TZFY',
        errMsg: this.$t('FinBill.unitPriceTips'),
        required: true,
        validateInput: (val, row, item, change) => {
          this.validateInput.call(this, val, row, item, change)
          this.$nextTick(() => {
            if (row.unitCount) {
              row.feeAmt = new LSnum(row.unitPrice).times(row.unitCount).toNum(2)
            }
          })
        },
      },
      {
        label: this.$t('FeeList.quantity'),
        prop: 'unitCount',
        type: 'input',
        required: true,
        validateInput: (val, row, item, change) => {
          this.validateInput.call(this, val, row, item, change)
          this.$nextTick(() => {
            if (row.unitPrice) {
              row.feeAmt = new LSnum(row.unitPrice).times(row.unitCount).toNum(2)
            }
          })
        },
      },
      {
        label: this.$t('FeeList.feeAmt'),
        prop: 'feeAmt',
        type: 'text',
      },
      // {
      //   label: this.$t('FeeList.taxRate'),
      //   prop: 'taxRate',
      //   type: 'select',
      //   propInDict: 'taxRateInfo',
      //   _forceEdit: true,
      // },
      {
        label: this.$t('FeeList.expenseRemarks'),
        prop: 'remark',
        type: 'input',
      },
    ]
    this.option2.columns = [...this.columns]
    // ????????????????????????????????????
    // let fI = this.option2.columns.findIndex(item => item.prop === 'taxRate')
    // this.option2.columns[fI] = Object.assign({}, this.option2.columns[fI], { required: true }) // ???????????????????????????
    // this.columns.splice(8, 1) // ??????????????????????????????
    // this.columns[8] = { ...this.columns[8] }
    // this.columns[8].readOnly = true // notAllowed
    this.columns[0] = { ...this.columns[0] }
    this.columns[0].return = false
    this.option1.columns = [...this.columns]
    console.log(this.option1);
    console.log(this.option2);
  },
  methods: {
    // ???????????????
    init(){
      this.$options.created.map((item) => item.call(this))
      this.$refs['form'].resetFields()
      // this.formData.sysLineCode = this.formData.sysLineName = ''
      this.forceRefresh = false
      this.loanBasicData()
      this.getEmployeeList('')
      this.$nextTick(() => {
        this.forceRefresh = true
        this.$refs['form'].clearValidate()
      })
      this.settleCorpNameRecei = ''
      this.settleCorpCodeRecei = ''
      this.settleCorpNamePay = ''
      this.settleCorpCodePay = ''
    },
    // ??????????????????
    handleCollapse(table) {
      this['show' + table] = !this['show' + table]
    },
    // ?????????????????????
    saveFinBill() {
      if(!this.employeeIsPublic && this.formData.billType === 'dzg_bill_fee'){
        return this.$msgErrClose(this.$t('FinBill.dzgBillFee'))
      }
      try {
        this.$refs.form.validate((res, rej) => {
          if (!res) return
          if(!this.formData.sysLineName && this.formData.billType === 'pricing_loss_berth_fee'){
            return this.$msgErrClose(this.$t('FinBill.berthFee'))
          }
          this.$set(this.option1, 'showIsError', true)
          this.$set(this.option2, 'showIsError', true)
          if (!this.validate(this.fbFeeVos, ['feeEnName', 'feeCode', 'settleCorpName', 'settleCorpCode', 'unitPrice', 'unitCount'])) {
            return
          }
          // ??????????????????????????????
          let fbFeeVos = this.fbFeeVos.map((item) => {
            if (!this.validateMoney(item.feeAmt)) {
              throw new Error()
            }
            let obj = { ...item, operation: 'update' }
            delete obj.edit
            delete obj.feeEnName
            delete obj.feeName
            return obj
          })
          // ????????????????????????????????????
          //  receipayType: 'receive'
          // arr = arr.filter((item) =>
          //   Object.entries(item).every(([key, val]) => (item.receipayType == 'receive' && key == 'taxRate') || val || val === 0)
          // )
          // if (!arr.length) {
          //   return this.$message({ message: '??????????????????????????????????????????', type: 'warning', showClose: true })
          // }
          // ????????????
          // let arr = fbFeeVos.filter((item) => item.receipayType == 'pay' && !item.taxRate && item.taxRate !== 0)
          // if (arr.length) {
          //   return this.$message({ message: this.$t('FinBill.payRate'), type: 'error', showClose: true })
          // }
          // ????????????????????????0
          fbFeeVos.forEach(item => item.taxRate = 0)
          
          let needCancel = false
          if(this.formData.billType === 'pricing_loss_berth_fee' && fbFeeVos.find(item => item.receipayType === 'pay' && item.feeCode == 'KCF1') && !fbFeeVos.find(item => item.receipayType === 'pay' && item.feeCode == 'TZFY')){
            needCancel = true
          }
          this.$confirm(!needCancel ? this.$t('FinBill.billConfirm') : this.$t('FinBill.billConfirmTips'), this.$t('Common.tips'), {
            confirmButtonText: !needCancel ? this.$t('Common.sure'):  this.$t('FinBill.ignoreTips'),
            cancelButtonText: !needCancel ? this.$t('Common.cancel') : this.$t('FinBill.adjustmentTips'),
            type: 'warning',
          })
            .then(() => {
              let departCode = this.formData.departCode
              departCode = departCode[departCode.length - 1]
              let departName = this.seekDepartName(this.departmentList, departCode)
              console.log({ ...this.formData, fees: fbFeeVos, departCode, departName });
              saveFinBill({ ...this.formData, fees: fbFeeVos, departCode, departName }).then((res) => {
                this.$msgSucClose(`${this.$t('FinBill.sucTips')}${res.data.finBillNo}`, 5000)
                this.cancel(true)
              })
            })
            .catch((err) => {
              console.log(err)
            })
        })
      } catch (err) {}
    },
    seekDepartName(list, code) {
      let deptCname = ''
      for (var i = 0; i < list.length; i++) {
        if (list[i].deptCode === code) {
          deptCname = list[i].deptCname
          break
        } else if (list[i].childList && list[i].childList.length > 0) {
          let name = this.seekDepartName(list[i].childList, code)
          if (name) {
            deptCname = name
          }
        }
      }
      return deptCname
    },
    handleKeyup(evt, option) {
      if (evt.key === 'Enter') {
        this.addRow(option.id)
      }
    },
    // // ????????? reverse ?????????  ?????????
    // addRow(optionId, reverse) { // reverse
    //   if(reverse){ // if(reverse){
    //     let selections, reverseArr
    //     let isPay = optionId === 'option2'
    //     if(!isPay){
    //       if(!this.multipleSelection2.length) return this.$msgErrClose('????????????????????????????????????')
    //       selections = this.multipleSelection2
    //     }else{
    //       if(!this.multipleSelection1.length) return this.$msgErrClose('????????????????????????????????????')
    //       selections = this.multipleSelection1
    //     }
    //     reverseArr = selections.map(item => {
    //       let obj = { ...item, isAddFee: true }
    //       obj.taxRate = obj._XID = obj.settleCorpCode = obj.settleCorpName = ''
    //       obj.$isRowCheck = obj.$isRowClick = false
    //       if(isPay){
    //         obj.receipayType = 'pay'
    //         obj.feeCode && this.getTaxRate(obj)
    //       }else{
    //         obj.receipayType = 'receive'
    //         if(this.formData.billType === 'dzg_bill_fee') obj._forceEdit = true
    //       }
    //       return obj
    //     })
    //     this[optionId].data.unshift(...reverseArr)
    //     return
    //   }
    //   let arr = this[optionId].data
    //   // arr.unshift({ ...this.rowData })
    //   // if(formData.billType'(val){
    //   // let tag = val === 'dzg_bill_fee')
    //   let obj = { ...this.rowData }
    //   if(this.formData.billType === 'dzg_bill_fee') obj._forceEdit = true
    //   arr.unshift(Object.assign({ ...obj }, { receipayType: optionId === 'option1' ? 'receive' : 'pay' }, {
    //     settleCorpName: optionId === 'option1' ? (this.settleCorpNameRecei ? this.settleCorpNameRecei : '') : (this.settleCorpNamePay ? this.settleCorpNamePay : ''),
    //     settleCorpCode: optionId === 'option1' ? (this.settleCorpCodeRecei ? this.settleCorpCodeRecei : '') : (this.settleCorpCodePay ? this.settleCorpCodePay : '')
    //   }))
    // },
    // ?????? ??????????????? val ????????????????????????
    cancel(refresh) {
      refresh && this.delVisitedView()
      this.routerBack(refresh)
    },
    employeeChange(val) {
      // console.log(this.deptCodeObj);
      console.log(val)
      let find = this.employeeOptions.find((item) => {
        return item.employeeId === val
      })
      if (!find) return
      this.employeeIsPublic = find.isPublic === 'yes'
      this.formData.employeeNo = find.employeeNo
      this.isEmployeeChange = true
      let findCode = find.empAllParentDeptCode
      let formCode = this.formData.departCode

      if(findCode.length && formCode && formCode.length){
        let len1 = findCode.length
        let len2 = formCode.length
        let arr = [...findCode].splice(len1 - len2)
        if(arr.toString() === formCode.toString()) return
      }
      // let findDeptCode = this.deptCodeObj[find.deptCode]
      let findDeptCode = find.empAllParentDeptCode.splice(1)
      if(findDeptCode){
        this.forceRefresh = false
        this.$nextTick(()=>{
          this.forceRefresh = true
          this.$nextTick(()=>{
            this.formData.departCode = findDeptCode
          })
        })
      }
      // this.formData.departCode = this.deptCodeObj[find.deptCode] || []
      // console.log(this.formData)
    },
    // ???????????????
    edit() {
      this.customColumnsPopShow = true
    },
    // // ??????????????????
    // handleDelete($index, row, option) {
    //   this.$confirm('????????????????????????', this.$t('Common.tips'), {
    //     confirmButtonText: this.$t('Common.sure'),
    //     cancelButtonText: this.$t('Common.cancel'),
    //     type: 'warning',
    //   })
    //     .then(() => {
    //       option.data.splice($index, 1)
    //     })
    //     .catch(() => {})
    // },
    // handleCopy(row, option) {
    //   if (option === this.option1) {
    //     this.option1.data.unshift(Object.assign({}, row))
    //   } else {
    //     this.option2.data.unshift(Object.assign({}, row))
    //   }
    // },
    // ?????????????????????
    getEmployeeList(queryString) {
      let departCode = this.formData.departCode || []
      departCode = departCode[departCode.length - 1] || this.compCode
      let data = { name: queryString, deptCodes: departCode, hasEmpAllParentDeptCode: 'yes'}
      if(this.formData.billType === 'pricing_loss_berth_fee'){
        data.roleCodes = 'pricing'
      }
      employeeSelectlist(data).then((res) => { // ???????????????deptCodes size
        // if(this.formData.billType === 'dzg_bill_fee'){
        //   this.employeeOptions = res.data.filter(v=>v.isPublic === 'yes') || []
        //   return 
        // }
        this.employeeOptions = res.data
        // this.backupEmployeeOptions.splice(0, 1000, ...res.data.filter((v) => !departCode || v.deptCode == departCode))
        // this.employeeOptions.splice(0, 1000, ...this.backupEmployeeOptions)
      })
    },
    // ?????????????????????
    loanBasicData() {
      console.log(this.compCode);
      departmentTreeList({ state: 'valid' }).then((res) => {
        let arr = []
        let getNode = (node)=> node.forEach(item => {
          // if(arr.length) return
          // if(item.deptCode === this.compCode) {
          //   arr = item.childList || []
          //   return   
          // }
          if(item.deptCode === this.compCode || item.settleCompanyCode === this.compCode  ) {
            arr.push(item)
            return   
          }
          item.childList && getNode(item.childList)
        }) 
        getNode(res.data || [])
        this.departmentList.splice(0, 1000, ...this.getTreeData(arr))
        // this.departmentList.splice(0, 1000, ...this.getTreeData(res.data || [], [], 0))
        // console.log(this.deptCodeObj);
        // console.log(this.departmentList)
      })
    },
    // ??????children???????????????undefined??????????????????????????????
    // getTreeData(data, arr = [], level, root) {
    getTreeData(data) {
      // ??????????????????????????????????????????????????????????????????code??????????????????
      // ???????????????
      // level += 1
      // ???????????????????????????????????????????????????arr???for??????????????????arr
      // let result = []
      for (let i = 0; i < data.length; i++) {
        // ????????????code
        // let code = data[i].deptCode
        // ??????????????????push????????????????????????????????????code
        // level == 2 && arr.push([root, code])
        // ???????????????????????????result???????????????????????????code
        // if (level > 2) result = [...arr, code]
        if (!data[i].childList.length) {
          // ?????????????????????????????????????????????????????????
          // ????????????????????????????????????code????????????key???????????????????????????code???????????????????????????arr[i],??????????????????result
          // this.deptCodeObj[data[i].deptCode] = level == 1 ? [code] : level == 2 ? arr[i] : result
          // children????????????????????????children??????undefined
          data[i].childList = undefined
        } else {
          // ???????????????for????????????i????????????????????????arr?????????code??????????????????code???????????????
          // this.getTreeData(data[i].childList, level == 2 ? arr[i] : level > 2 ? result : arr, level, code)
          this.getTreeData(data[i].childList)
        }
      }
      return data
    },
    // sendMulti(data, type){
    //   this['multipleSelection'+type] = data
    // }
    sendMulti(data, option) {
      this['multipleSelection' + option.id.slice(-1)] = data
    }
  },
}
</script>
<style scoped lang="scss">

.finance-detail-page {
  background: #fff;
}
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
}
.settlement-detail-form .el-form-item.long-form-item {
  width: 100%;
  display: flex;
  ::v-deep{
    .el-input{
      width: 100%;
    }
    label{
      flex: 0 0 auto;
    }
    .el-form-item__content {
      flex: 1 1 auto;
    }
  }
}
// .el-form-item {
//   width: 252px;
//   // width: 260px;
//   margin-bottom: 10px;
//   // margin-bottom: 7px;
//   margin-right: 24px;
// }
.el-form-item-text {
  font-size: 12px;
  /* width: 180px; */
}
// .settlement-detail-form {
//   padding: 20px 16px 8px; 
// }
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
.finance-table-container {
  margin: 4px 16px 18px;
}
.finance-table-container + .finance-table-container {
  margin-top: 22px;
}

.select-template-box {
  margin-bottom: 10px;
}
.select-template-box .el-dropdown {
  margin-left: 0;
  margin-bottom: 0;
  border-radius: 0;
  font-size: 12px;
  line-height: 26px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}
.select-template-box:hover .el-dropdown {
  background: rgb(236, 245, 255);
  color: rgb(64, 158, 255);
}
.select-template-box .el-dropdown-link {
  cursor: pointer;
  padding-left: 5px;
}
.select-template-box .el-icon--right {
  margin-left: 0;
}
.select-template-box .el-dropdown-link:focus {
  outline: none;
}

.money-title > span {
  font-size: 12px;
  padding-left: 20px;
  i {
    font-style: normal;
    text-decoration: none;
    color: red;
  }
}
::v-deep .el-table .cell {
  padding-left: 4px;
  padding-right: 4px;
}
/deep/ .settlement-detail-form{
  .el-form{
    display: flex;
    flex-wrap: wrap;
    .el-form-item{
    width: 25%;
    margin-right: 0;
    display: flex;
    &.long-form-item{
      width: 100%;
    }
    .el-form-item__content{
      flex: 1;
      .el-select,.el-input,.el-cascader{
        width: 100%;
      }
    }
  }
  }
  
}
</style>