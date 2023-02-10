<template>
  <div class="finance-page">
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">新增费用单</div>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" size="mini" type="primary" @click="saveFinBill">保存</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" size="mini" @click="cancel(false)">返回</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    <div class="settlement-detail-form">
      <el-form :model="formData" ref="form" :rules="rules" :inline="true" size="mini" label-width="100px">
        <el-form-item label="费用单名称：" prop="finBillName" class="double-form-item">
          <el-input v-model="formData.finBillName" placeholder="请输入费用单名称"></el-input>
        </el-form-item>
        <el-form-item label="费用单类型：" prop="billType">
          <el-select v-model="formData.billType" value-key placeholder="请选择费用单类型">
            <el-option
              v-for="item in dictMap['finBillBillType']"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="员工：" prop="employeeId">
          <el-select
            filterable
            remote
            clearable
            :disabled="employeeDisabled"
            size="mini"
            v-model="formData.employeeId"
            placeholder="请选择员工"
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
        <!-- <el-form-item v-show="formData.employeeNo" label="工号：" prop="employeeNo"> -->
        <el-form-item label="工号：" prop="employeeNo">
          <el-input disabled v-model="formData.employeeNo"></el-input>
        </el-form-item>
        <!-- change-on-select
        expandTrigger="click"-->
        <el-form-item label="部门：" prop="departCode">
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
            placeholder="请选择部门"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="所属年份：" prop="year">
          <el-select disabled size="mini" v-model="formData.year" placeholder="请选择年份">
            <el-option v-for="o in years" :key="o.value" :label="o.label" :value="o.value">
              <span>{{o.label}}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <!-- 年份禁止选比较好，如果月份为12，选择下个月1月时自动切换年份的值即可 -->
        <el-form-item label="所属月份：" prop="month">
          <el-select :disabled="!backupMonth" size="mini" v-model="formData.month" placeholder="请选择月份">
            <el-option v-for="o in months" :key="o.value" :label="o.label" :value="o.value">
              <span>{{o.label}}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="航线：" prop="sysLineCode" v-if="formData.billType === 'pricing_loss_berth_fee'">
          <el-select
            filterable
            remote
            clearable
            size="mini"
            v-model="formData.sysLineCode"
            placeholder="请选择航线"
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
        <el-form-item label="备注说明：" prop="remark" class="long-form-item">
          <el-input
            maxlength="500"
            show-word-limit
            type="textarea"
            v-model="formData.remark"
            placeholder="请填写备注"
          ></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">应收</div>
        </div>
        <div class="money-box-right">
          <el-button class="finance-btn" size="mini" type="primary" @click="addRow('option1')">新增应收费用</el-button>
          <el-button class="finance-btn" @click="handleCopy('receive')" size="mini">复制</el-button>
          <el-button class="finance-btn" size="mini" @click="addRow('option2', true)">收入转支出</el-button>
          <el-button class="finance-btn" @click="handleDelete('receive')" size="mini" type="danger">删除</el-button>
          <el-button type="text" class="collapse-btn" @click="handleCollapse('Table1')" size="mini">
            {{showTable1? '收起':''}}
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
          <div class="money-title">应付</div>
        </div>
        <div class="money-box-right">
          <el-button class="finance-btn" size="mini" type="primary" @click="addRow('option2')">新增应付费用</el-button>
          <el-button class="finance-btn" @click="handleCopy('pay')" size="mini">复制</el-button>
          <el-button class="finance-btn" size="mini" @click="addRow('option1', true)">支出转收入</el-button>
          <el-button class="finance-btn" @click="handleDelete('pay')" size="mini" type="danger">删除</el-button>
          <el-button type="text" class="collapse-btn" @click="handleCollapse('Table2')" size="mini">
            {{showTable2? '收起':''}}
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
      // 是否显示表格 应收1 应付2
      showTable1: true,
      showTable2: true,
      // 表格数据 应收1 应付2
      option1: {},
      option2: {},
      multipleSelection1: [],
      multipleSelection2: [],
      // 返回数据备份
      resData: {},
      // 表单数据
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
      // 表单验证
      rules: {
        billType: [{ required: true, message: ' ' }],
        // billType: [{ required: true, message: '请选择费用单类型' }],
        finBillName: [{ required: true, message: ' ' }],
        // finBillName: [{ required: true, message: '请输入费用单名称' }],
        departCode: [{ required: true, message: ' ', trigger: 'change' }],
        employeeId: [{ required: true, message: ' ', trigger: 'change' }],
        sysLineCode: [{ required: true, message: ' ', trigger: 'change' }],
      },
      // 应收应付列表配置
      columns: [],
      // 自定义表头
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
        { label: '1月', value: '01' },
        { label: '2月', value: '02' },
        { label: '3月', value: '03' },
        { label: '4月', value: '04' },
        { label: '5月', value: '05' },
        { label: '6月', value: '06' },
        { label: '7月', value: '07' },
        { label: '8月', value: '08' },
        { label: '9月', value: '09' },
        { label: '10月', value: '10' },
        { label: '11月', value: '11' },
        { label: '12月', value: '12' },
      ],
      years2: [{ label: new Date().getFullYear(), value: new Date().getFullYear() + '' }],
      months: [{ label: new Date().getMonth() + 1 + '月', value: new Date().getMonth() + 1 + '' }],
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
        // if(!settleCompCode) return this.$msgErrClose('您所选择的部门，未设置所属结算分公司，请联系管理员进行设置!')
        getSysDate({ settleCompCode }).then(res => {
          if (res.code === 0 && res.data) {
            let [year, month] = res.data.finMon.split('-')
            month = +month
            this.months = [
              { label:  month + '月', value: month },
              { label: (month === 12 ? 1 : month + 1) + '月', value: month === 12 ? 1 : month + 1 },
              // { label: (month == 11 ? 1 : +month + 2) + '月', value: month == 11 ? 1 : +month + 2 },
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
    //   应收应付列表
    fbFeeVos() {
      return [
        ...this.option1.data.map((item) => ({ ...item, receipayType: 'receive' })),
        ...this.option2.data.map((item) => ({ ...item, receipayType: 'pay' })),
      ]
    },
    // 新增行格式
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
    // let obj2 = { label: '删除', type: 'text', show: true, action: 'Delete' }
    // this.option1.operationBtns.width = '80px'
    // this.option1.operationBtns.data = this.option2.operationBtns.data = [{ ...obj2 },
    //     { label: '复制', type: 'text', show: true, action: 'Copy' },]
    this.option1.operationBtns.show = this.option1.operationBtns.show = false
    this.columns = [
      {
        label: '费用名称',
        prop: 'feeName',
        type: 'autocomplete',
        minWidth: 118,
        clearable: true,
        required: true,
        querySearch: (queryString, cb) => {
          // transfer_fee银行手续费  fee_adjust关账 intrabranch内部往来 preserve_fee留置 express_fee快递 other其它
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
          //row.feeCode = "NBWL_XMDZG"内部往来厦门 "NBWL_SZDZG"内部往来深圳
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
          // 应收表格此项修改return为false
          // if (!item.notAllowed) return
          // row.taxRate = optionItem.znTaxRate
          // if(row.feeCode == 'NBWLXMDZG' || row.feeCode == 'NBWLSZDZG'){
          //  this.$set(row, '_forceEdit', true)
          // }else{
          //  this.$set(row, '_forceEdit', false)
          // }
        },
      },
      {
        label: '费用英文名',
        prop: 'feeEnName',
        type: 'text',
        minWidth: 100,
        value: 'feeEnName',
      },
      {
        label: '币种',
        prop: 'currency',
        type: 'select',
        width: 60,
        propInDict: 'validCurrency',
        required: true
      },
      {
        label: '结算单位',
        prop: 'settleCorpName',
        type: 'autocomplete',
        minWidth: 160,
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
        label: '计费单位', //dicMap[fee_unit]
        prop: 'feeUnit',
        type: 'select',width: 80,
        required: true
      },
      {
        label: '单价',
        prop: 'unitPrice',width: 80,
        type: 'input',
        negative: (row) => row.feeCode === 'TZFY',
        errMsg: '“调整费用”的单价请输入负数',
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
        label: '数量',
        prop: 'unitCount',width: 70,
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
        label: '金额',
        prop: 'feeAmt',width: 100,
        type: 'text',
      },
      {
        label: '税率',
        prop: 'taxRate',width: 70,
        type: 'select',
        propInDict: 'taxRateInfo',
        _forceEdit: true,
      },
      {
        label: '费用备注',
        prop: 'remark',
        minWidth: 180,
        type: 'input',
      },
    ]
    this.option2.columns = [...this.columns]
    let fI = this.option2.columns.findIndex(item => item.prop === 'taxRate')
    this.option2.columns[fI] = Object.assign({}, this.option2.columns[fI], { required: true }) // 应付的税率显示必填
    // this.columns.splice(8, 1) // 应收列表不需设置税率
    this.columns[8] = { ...this.columns[8] }
    this.columns[8].readOnly = true // notAllowed
    this.columns[0] = { ...this.columns[0] }
    this.columns[0].return = false
    this.option1.columns = [...this.columns]
  },
  methods: {
    // 初始化数据
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
    // 切换表格显示
    handleCollapse(table) {
      this['show' + table] = !this['show' + table]
    },
    // 保存新增费用单
    saveFinBill() {
      if(!this.employeeIsPublic && this.formData.billType === 'dzg_bill_fee'){
        return this.$msgErrClose('大掌柜费用单只能选择公共员工！')
      }
      try {
        this.$refs.form.validate((res, rej) => {
          if (!res) return
          if(!this.formData.sysLineName && this.formData.billType === 'pricing_loss_berth_fee'){
            return this.$msgErrClose('商务亏舱费用单航线为必填！')
          }
          this.$set(this.option1, 'showIsError', true)
          this.$set(this.option2, 'showIsError', true)
          if (!this.validate(this.fbFeeVos, ['feeName', 'feeCode', 'settleCorpName', 'settleCorpCode', 'unitPrice', 'unitCount'])) {
            return
          }
          // 清除不必要的请求参数
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
          // 过滤掉未填写完整数据的项
          //  receipayType: 'receive'
          // arr = arr.filter((item) =>
          //   Object.entries(item).every(([key, val]) => (item.receipayType == 'receive' && key == 'taxRate') || val || val === 0)
          // )
          // if (!arr.length) {
          //   return this.$message({ message: '请保证至少有一项内容的完整！', type: 'warning', showClose: true })
          // }
          let arr = fbFeeVos.filter((item) => item.receipayType == 'pay' && !item.taxRate && item.taxRate !== 0)
          if (arr.length) {
            return this.$message({ message: '应付税率不能为空', type: 'error', showClose: true })
          }
          let needCancel = false
          if(this.formData.billType === 'pricing_loss_berth_fee' && fbFeeVos.find(item => item.receipayType === 'pay' && item.feeCode == 'KCF1') && !fbFeeVos.find(item => item.receipayType === 'pay' && item.feeCode == 'TZFY')){
            needCancel = true
          }
          this.$confirm(!needCancel ? '确认保存费用单吗？' : '该费用单录入了应付亏舱费，请录入应付调整费用！', '提示', {
            confirmButtonText: !needCancel ? '确定' :  '忽略继续',
            cancelButtonText: !needCancel ? '取消' : '录入调整费用',
            type: 'warning',
          })
            .then(() => {
              let departCode = this.formData.departCode
              departCode = departCode[departCode.length - 1]
              let departName = this.seekDepartName(this.departmentList, departCode)
              console.log({ ...this.formData, fees: fbFeeVos, departCode, departName });
              saveFinBill({ ...this.formData, fees: fbFeeVos, departCode, departName }).then((res) => {
                this.$msgSucClose(`新增成功！费用单号为${res.data.finBillNo}`, 5000)
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
    // // 新增行 reverse 收转付  付转支
    // addRow(optionId, reverse) { // reverse
    //   if(reverse){ // if(reverse){
    //     let selections, reverseArr
    //     let isPay = optionId === 'option2'
    //     if(!isPay){
    //       if(!this.multipleSelection2.length) return this.$msgErrClose('请选择需要转收入的费用！')
    //       selections = this.multipleSelection2
    //     }else{
    //       if(!this.multipleSelection1.length) return this.$msgErrClose('请选择需要转支出的费用！')
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
    // 返回 关闭详情页 val 是否刷新坏账列表
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
    // 自定义表头
    edit() {
      this.customColumnsPopShow = true
    },
    // // 删除添加的行
    // handleDelete($index, row, option) {
    //   this.$confirm('确认删除此项吗？', '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
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
    // 分属员工下拉框
    getEmployeeList(queryString) {
      let departCode = this.formData.departCode || []
      departCode = departCode[departCode.length - 1] || this.compCode
      let data = { name: queryString, deptCodes: departCode, hasEmpAllParentDeptCode: 'yes'}
      if(this.formData.billType === 'pricing_loss_berth_fee'){
        data.roleCodes = 'pricing'
      }
      employeeSelectlist(data).then((res) => { // 赵斌加入参deptCodes size
        // if(this.formData.billType === 'dzg_bill_fee'){
        //   this.employeeOptions = res.data.filter(v=>v.isPublic === 'yes') || []
        //   return 
        // }
        this.employeeOptions = res.data
        // this.backupEmployeeOptions.splice(0, 1000, ...res.data.filter((v) => !departCode || v.deptCode == departCode))
        // this.employeeOptions.splice(0, 1000, ...this.backupEmployeeOptions)
      })
    },
    // 所属部门下拉框
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
    // 转化children的空数组为undefined，平铺数据转化为对象
    // getTreeData(data, arr = [], level, root) {
    getTreeData(data) {
      // 选择员工时由后端返回，不再需要前端处理将各级code保存为键值对
      // 判断第几层
      // level += 1
      // 大于第二层时需要用一个数组临时保存arr，for循环时会改变arr
      // let result = []
      for (let i = 0; i < data.length; i++) {
        // 获取本层code
        // let code = data[i].deptCode
        // 第二层时需要push数组存放第一层和第二层的code
        // level == 2 && arr.push([root, code])
        // 大于第二层时，利用result来存放前两层和本层code
        // if (level > 2) result = [...arr, code]
        if (!data[i].childList.length) {
          // 选择员工时由后端返回，不再需要前端处理
          // 没有子元素，即可用此层的code做为对象key，第一层时直接返回code，第二层时直接返回arr[i],第二层后返回result
          // this.deptCodeObj[data[i].deptCode] = level == 1 ? [code] : level == 2 ? arr[i] : result
          // children若为空数组，则将children设为undefined
          data[i].childList = undefined
        } else {
          // 第二层时传for循环内第i个元素，其它层传arr本身，code用于将第一层code传至第二层
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
</style>