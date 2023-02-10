<template>
  <div class="settlement-add">
    <div class="top-box">
      <div class="title">新增结算信息</div>
      <div class="but-box">
        <el-button-group>
          <el-button @click="submit" size="mini" type="primary">保存</el-button>
        </el-button-group>
        <el-button-group>
          <el-button @click="cancle" size="mini">返回</el-button>
        </el-button-group>
      </div>
    </div>
    <div class="add-form">
      <el-form
        :inline="true"
        :model="form"
        :rules="rules"
        class="settle-form"
        label-width="110px"
        ref="form"
        size="mini"
      >
        <el-form-item
          label="合同编号:"
          prop="contractNo"
        >
          <el-select
            @change="changeContractNo"
            class="contract-select"
            placeholder="请选择"
            size="mini"
            v-model="form.contractNo"
            value-key="contractId"
            :disabled="disableContractNo"
          >
            <el-option
              :key="item.value"
              :label="item.contractNo"
              :value="item"
              v-for="item in contractNoList"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="业务类型:" prop="settleBusinessTypeList">
          <el-select
            collapse-tags
            multiple
            placeholder="请选择"
            size="mini"
            v-model="form.settleBusinessTypeList"
            @change="changeSettleBusinessType"
          >
            <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in baseBusinessTypeList"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="共享公司:" prop="settleRelCustList" class="relcust">
           <el-select
              class="custlist"
              collapse-tags
              multiple
              placeholder="请选择共享公司"
              size="mini"
              v-model="form.settleRelCustList"
              value-key="custid"
            >
              <el-option
                :key="item.value"
                :label="item.label"
                :value="item"
                v-for="item in relationList"
                :disabled="item.custid === custid"
              ></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="我司分公司:" prop="settleCompanyList">
          <el-select
            class="custlist"
            collapse-tags
            filterable
            multiple
            placeholder="请选择"
            size="mini"
            v-model="form.settleCompanyList"
            @change="changeSettleCompanyList"
          >
            <el-option
              :disabled="item.disabled"
              :key="item.companyCode"
              :label="item.companyName"
              :value="item.companyCode"
              v-for="item in settleCompanyList"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="账期类型:" prop="settleType">
          <el-select
            placeholder="请选择"
            size="mini"
            v-model="form.settleType"
          >
            <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in dictMap['customerSettleType']"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label=" 结算周期:" prop="settleCycle">
          <el-select
              @change="changeSettleCycle"
              placeholder="请选择"
              size="mini"
              v-model="form.settleCycle"
            >
              <el-option
                :key="item.value"
                :label="item.label"
                :value="item.value"
                v-for="item in settleCycleList"
              ></el-option>
            </el-select>
          <el-tooltip placement="top">
            <div slot="content">
              <div>3月结: 是指某一个月份的费用,给了3个月的账期</div>
              <div>季度结: 是指3个月的费用,放在一块结算。</div>
            </div>
            <div class="item" style="display:inline-block;margin-left:5px">
              <i class="el-icon-info"></i>
            </div>
          </el-tooltip>
      </el-form-item>
        <el-form-item label="账期起始日类型:" prop="timeType" :class="form.timeType === 'sign_date' ? 'inline-flex' : ''">
          <el-select
            @change="changeTimeType"
            placeholder="请选择"
            size="mini"
            v-model="form.timeType"
            :class="form.timeType === 'sign_date' ? 'small-select' : ''"
          >
            <el-option
              :disabled="item.disabled"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in timeTypeList"
            ></el-option>
          </el-select>
          <el-select
            v-if="form.timeType === 'sign_date'"
            placeholder="请选择"
            size="mini"
            v-model="form.signDateType"
            class="small-select2">
            <el-option
              :disabled="item.disabled"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in dictMap['signDateType']"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          class="inline-flex"
          label="账期起始日:"
          prop="billDayType"
        >
          <el-select
            :disabled="disabledBillDayType"
            @change="changeBillDayType"
            class="small-select"
            placeholder="请选择"
            size="mini"
            v-model="form.billDayType"
          >
            <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in billDayTypeList"
            ></el-option>
          </el-select>
          <template
            v-if="['bill_date', 'invoice_date'].includes(form.billDayType)"
          >
            {{ `\xa0后\xa0` }}
            <el-input
              class="small-select3"
              placeholder="请输入"
              size="mini"
              v-model="form.billDay"
            ></el-input>
          </template>
          <!-- <template v-else-if="['ata','atd','sign_date'].includes(form.billDayType)">
            <el-date-picker size="mini" v-model="form.billDay" type="date" placeholder="请选择"  class="small-select2" value-format="yyyy-MM-dd"></el-date-picker>
          </template> -->
          <template v-else>
            <!-- collapse-tags v-if="form.billDayType !=='equal_time_type'" -->
            <el-select
              :disabled="disabledBillDay"
              :multiple="multipleDay"
              :multiple-limit="limit"
              collapse-tags
              class="small-select2"
              placeholder="请选择"
              v-model="form.billDay"
            >
              <el-option
                :key="i"
                :label="i"
                :value="i"
                v-for="i in billDay"
              ></el-option>
            </el-select>
          </template>
        </el-form-item>
        <el-form-item label="发账单最晚时间:" style="margin-bottom: 0;">
          <el-select
            @change="changeSendBillType"
            class="small-select"
            placeholder="请选择"
            size="mini"
            :disabled="disabledSendBillType"
            v-model="form.sendBillType"
          >
            <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in dictMap['settleInfoSendBillType']"
            ></el-option>
          </el-select>
          <el-select
            class="small-select2"
            :multiple-limit="limit"
            :multiple="multipleDay"
            placeholder="请选择"
            collapse-tags
            v-model="form.sendBillDay"
          >
            <el-option
              :key="i"
              :label="i"
              :value="i"
              v-for="i in sendBillDay"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
        class="fee-period"
        label="框取费用时段:"
        prop="feePeriodStartType"
        style="margin-bottom:0"
        v-if="!showFeePeriod"
      >
        <el-select
          class="small-select4"
          clearable
          placeholder="请选择"
          size="mini"
          v-model="form.feePeriodStartType"
        >
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in dictMap['settleInfoFeePeriodType']"
          ></el-option>
        </el-select>
        <el-select
          class="small-select4"
          clearable
          placeholder="请选择"
          size="mini"
          v-model="form.feePeriodStartDay"
        >
          <el-option :key="i" :label="i" :value="i" v-for="i in 31"></el-option>
        </el-select>-
        <el-select
          class="small-select4"
          clearable
          placeholder="请选择"
          size="mini"
          v-model="form.feePeriodEndType"
        >
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in dictMap['settleInfoFeePeriodType']"
          ></el-option>
        </el-select>
        <el-select
          class="small-select4"
          clearable
          placeholder="请选择"
          size="mini"
          v-model="form.feePeriodEndDay"
        >
          <el-option :key="i" :label="i" :value="i" v-for="i in 31"></el-option>
        </el-select>
      </el-form-item>
        <el-form-item
          label=" "
          prop="isRetainContainer"
          style="margin-bottom: 0;"
        >
          <el-checkbox
            label="是否需要后有柜"
            v-model="form.isRetainContainer"
          ></el-checkbox>
        </el-form-item>
        <el-form-item label="归属人:" prop="belongEmployeeName">
          <el-select
            placeholder="请选择"
            size="mini"
            v-model="form.belongEmployeeName"
          >
            <el-option
              :key="item.bdEmployeeId"
              :label="item.bdEmployeeName"
              :value="item.bdEmployeeName"
              v-for="item in OPEmployeeList"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="table-box">
        <div class="table-info">
          <FinanceTableMass :option="option1" />
        </div>
        <div @click="addTableData" class="btn-box">
          <i class="el-icon-circle-plus-outline"></i>
        </div>
      </div>
      <AddLine
        :options="addLineOption"
        @cancel="closeAddLine"
        @submit="submitAddLine"
        v-if="addLineOption.show"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import AddLine from './addLine'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import {contractList,contractDetail,relation} from '@/api/crm/control'
import {companyPageList, baseSystemLineList } from '@/api/base'
export default {
  mixins: [mixin, routerMixin],
  components: {
    FinanceTableMass,
    AddLine,
  },
  props: {
    dataSource: {
      type: Object,
      default: () => {}
    },
    custid: {
      type: [String, Number],
      default: ''
    },
    OPEmployeeList: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      option1: {},
      form: {
        contractNo: '',
        settleType: '',
        settleBusinessTypeList: [],
        settleCycle: 'ticket',
        timeType: 'etd',
        signDateType: '',
        billDayType: 'equal_time_type',
        billDay: '',
        sendBillType: '',
        sendBillDay: '',
        isRetainContainer: false,
        feePeriodStartType: '',
        feePeriodStartDay: '',
        feePeriodEndType: '',
        feePeriodEndDay: '',
        settleRelCustList: [],
        settleCompanyList: [],
        belongEmployeeName:''
      },
      rules: {
        settleCompanyList: {
          required: true,
          message: '我司分公司必选',
          trigger: 'change',
        },
        settleRelCustList: {
          required: true,
          message: '共享公司必选',
          trigger: 'change',
        },
        settleType: {
          required: true,
          message: '账期类型必选',
          trigger: 'change',
        },
        contractNo: {
          required: true,
          message: '合同编号必选',
          trigger: 'change',
        },
        settleBusinessTypeList: {
          required: true,
          message: '业务类型必选',
          trigger: 'change',
        },
        settleCycle: {
          required: true,
          message: '结算周期必选',
          trigger: 'change',
        },
        timeType: {
          required: true,
          message: '账期起始日类型必选',
          trigger: 'change',
        },
        billDayType: {
          required: true,
          message: '账期起始日必选',
          trigger: 'change',
        },
        billDay: {
          required: true,
          message: '账期起始日必选',
          trigger: 'change',
        },
        belongEmployeeName: {
          required: true,
          message: '归属人必填',
          trigger: 'change'
        }

      },
      billDayTypeListBase: [
        {
          label: '当月',
          value: 'current_month',
        },
        {
          label: '次月',
          value: 'next_month',
        },
        {
          label: '下一季度首月',
          value: 'first_month_of_next_quarter',
        },
      ],
      billDay: 0,
      sendBillDay: 0,
      addLineIndex: '',
      addLineOption: {
        show: false,
        businessType: [],
        settleLineList: [],
      },
      tipStatus: true,
      contractNoList: [],
      settleCompanyList: [],
      relationList: [],
      multipleDay: false,
      sysLine: [],
      feePeriodStartType: '',
      feePeriodStartDay: '',
      feePeriodEndType: '',
      feePeriodEndDay: '',
      settleCycleList: [],
      custName: '',
      limit: 2,
      baseBusinessTypeList: [],
      disableContractNo: false,
      disabledSendBillType:false
    }
  },
  created() {
    this.custName = this.$route.query.name
    this.getContractNoList()
    this.getSettleCycleList()
    this.getTimeTypeList()
    // this.getCompanyList()
    // this.getRelation()
    this.sysLineQuerySearch()
    this.billDayTypeList = [...this.billDayTypeListBase]
    const operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: '删除',
          type: 'text',
          show: true,
          action: 'Delete',
        },
      ],
      show: true,
      callback: (action, $index, row, option) => {
        if (action === 'Delete') {
          const len = this.option1.data.length
          if (len === 1) {
            return this.$msgErrClose('必须保留一条数据！')
          }
          this.option1.data.splice($index, 1)
        }
      },
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [
        {
          settlementDays: '',
          settleLineList: [],
          settleLineList_code: ['100000001'],
          advanceDays: '',
          graceDays: '',
          rateType: '',
          overdueRate: '',
          settlementDaysType: 'day',
          remark: '',
          edit: true,
        },
      ],
      tips: false,
      selection: false,
      maxHeight: 300,
      operationBtns,
      edit: true,
      noCheckWhenEdit: true,
      columns: [
        {
          prop: 'settlementDaysType',
          label: '结款类型',
          type: 'select',
          required: true,
          propInDict: 'settlementDaysType',
          change: (val, row, index) => {
            //指定日期
            if (val === 'day') {
              this.$set(row, 'bothDisabled', false)
              this.option1.columns[1].type = 'input'
              this.option1.columns[1].cellSuffixContent = '天'
              this.option1.columns[1].hasCellSuffix = true
            } else {
              //月
              let arr = [];
              for(var i=1;i<32;i++){
                arr.push({lable:i,value:i})
              }
              this.option1.columns[1].type = 'select'
              this.option1.columns[1].selectOptions = arr
              this.option1.columns[1].hasCellSuffix = true
              this.option1.columns[1].cellSuffixContent = '号'
              this.$set(row, 'settlementDays', '')
              this.$set(row, 'bothDisabled', false)
             
            }
          }
        },
        {
          prop: 'settlementDays',
          label: '结款时间',
          type: 'input',
          required: true,
          hasCellSuffix: true,
          cellSuffixContent: '天',
          bothDisabled: false,
          validateInput: (val, row, item, change) => {
            if (change && val) {
              const reg = /^\d+$/
              if (!reg.test(val)) {
                return this.$msgErrClose('结款时间只支持正整数')
              }
            }
          },
        },
        {
          prop: 'settleLineList',
          label: '航线',
          type: 'button',
          required: true,
          operationBtns: {
            show: true,
            data: [{ label: '添加' }],
            callback: (action, index, row) => {
              this.AddLine(index, row)
            },
          },
        },
        {
          prop: 'advanceDays',
          label: '最长垫付天数',
          type: 'input',
          validateInput: (val, row, item, change) => {
            if (change && val) {
              const reg = /^\d+$/
              if (!reg.test(val)) {
                return this.$msgErrClose('最长垫付天数只支持正整数')
              }
            }
          },
        },
        {
          prop: 'graceDays',
          label: '宽限天数',
          type: 'input',
          validateInput: (val, row, item, change) => {
            if (change && val) {
              const reg = /^\d+$/
              if (!reg.test(val)) {
                return this.$msgErrClose('宽限天数只支持正整数')
              }
            }
          },
        },
        {
          prop: 'rateType',
          label: '利率类型',
          type: 'select',
          required: true,
          propInDict: 'settleInfoRateType',
        },
        {
          prop: 'overdueRate',
          label: '滞纳金比例',
          required: true,
          type: 'input',
          hasCellSuffix: true,
          cellSuffixContent: '%',
          validateInput: (val, row, item, change) => {
            if (change && val) {
              const reg = /^([0]|[1-9]\d*)+(\.\d{1,2})?$|^0\.\d{1,2}$/
              if (!reg.test(val)) {
                return this.$msgErrClose('滞纳金比例支持整数或者两位小数')
              }
            }
          },
        },
        { prop: 'remark', label: '备注', type: 'input', maxlength: 500 },
      ],
    })
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    disabledBillDayType() {
      return (
        ['half_month','weekly'].includes(this.form.settleCycle) ||
        ['bill_date', 'invoice_date'].includes(this.form.billDayType)
      )
    },
    showDaySelect() {
      const { settleCycle, billDayType } = this.form
      return !(settleCycle === 'ticket' && billDayType === 'current_month')
    },
    disabledBillDay() {
      const { settleCycle, billDayType } = this.form
      const monthly = [
        'ticket',
        'monthly',
        'two_month',
        'three_month',
        'four_month'
      ].includes(settleCycle)
      const dayType = billDayType === 'current_month'
      return (monthly && dayType) || billDayType === 'equal_time_type'
    },
    showFeePeriod() {
      const sta1 = [
        'bill_date',
        'invoice_date',
        'equal_time_type',
        'current_month'
      ].includes(this.form.billDayType)
      const sta2 = ['ticket', 'half_month', 'weekly'].includes(this.form.settleCycle)
      return sta1 || sta2
    }
  },
  methods: {
    // 改变我司分公司
    changeSettleCompanyList(val) {
      if (val.includes('000000')) {
        this.form.creditAccountCompanyList = ['000000']
        this.settleCompanyList.forEach((item) => {
          if (item.companyCode !== '000000') {
            item.disabled = true
          }
        })
      } else {
        this.settleCompanyList.forEach((item) => {
          item.disabled = false
        })
      }
    },
     // 系统航线下拉列表自动补充的数据
    sysLineQuerySearch() {
      baseSystemLineList('', 'valid').then((res) => {
        this.sysLine = res.data.map((item) => {
          return {
            label: item.cname,
            value: item.sysLineCode,
            ename: item.ename,
            disabled: false
          }
        })
        this.sysLine.unshift({
          label: '所有航线',
          value: '100000001',
          ename: 'all',
          disabled: false
        })
      })
    },
    // 获取分公司
    getCompanyList() {
      const data = {
        currPage: 1,
        pageSize: 1000,
        query: [
          {
            column: 'state',
            type: 'eq',
            value: 'valid'
          },
          {
            column: 'selfSettle',
            type: 'eq',
            value: 'yes'
          }
        ]
      }
      companyPageList(data).then((res) => {
        this.settleCompanyList = res.data.list.map((item) =>
          Object.assign({}, item, { disabled: false })
        )
        this.settleCompanyList.unshift({
          companyCode: '000000',
          companyName: '所有分公司',
          companyId: 0,
          disabled: false
        })
        // 默认禁用
        // if (this.form.settleCompanyList.includes('000000')) {
        //   this.form.settleCompanyList = ['000000']
        //   this.settleCompanyList.forEach((item) => {
        //     if (item.companyCode !== '000000') {
        //       item.disabled = true
        //     }
        //   })
        // }
      })
    },
     // 关联公司下拉
    getRelation() {
      const data = {
        custid: this.custid
      }
      relation(data)
        .then(res => {
          this.relationList = res.data.map(item => {
            // 新增时把自己选中
            if (item.custid === this.custid) {
              if (!this.dataSource.settleInfoId) {
                this.form.settleRelCustList.push({
                  ...item,
                  label: item.name,
                  value: item.custid
                })
              }
            }
            return {
              ...item,
              label: item.name,
              value: item.custid
            }
          })
        })
        .catch(() => {})
    },
    // 获取编号
    getContractNoList() {
      const data = {
        currPage: 1,
        pageSize: 100,
        custid: this.custid,
        status: 'effect'
      }
      contractList(data).then(res => {
        if (res.code === 0) {
          this.contractNoList = res.data.list.map(item => {
            let {contractNo, contractId, contractInfoNo} = item
            return {
              contractNo,
              contractId,
              contractInfoNo
            }
          })
        }
      }).catch(()=>{})
    },
    // 合同详情
    changeContractNo(row) {
      let {contractId} = row
      let data = {
        contractId,
        custid: this.custid,
      }
      contractDetail(data).then(res => {
        if (res.code === 0) {
          let {contractBusinessTypeList,contractRelCustList,contractCompanyList}= res.data
          let  businessTypeList = contractBusinessTypeList.map(item => item.businessType)
          let  companyListCode = contractCompanyList.map(item => item.companyCode)
          this.baseBusinessTypeList = this.dictMap['baseBusinessType'].filter(item => businessTypeList.includes(item.value)) //业务类型下拉
          this.relationList = contractRelCustList.map(item => {
            let {relCustName,relCustid} = item
            return {
              name: relCustName,
              custid: relCustid,
              label: relCustName,
              value: relCustid
            }
          })
          if (companyListCode.includes('000000')) {
            this.getCompanyList()
          } else {
            this.settleCompanyList = contractCompanyList
          }
          if (!this.dataSource.settleInfoId) {
            this.form.settleBusinessTypeList = businessTypeList
            this.form.settleRelCustList = contractRelCustList.map(item => {
              let {relCustName,relCustid} = item
              return {
                name: relCustName,
                custid: relCustid,
                label: relCustName,
                value: relCustid
              }
            })
            this.form.settleCompanyList = companyListCode
          }

        }
      }).catch(()=>{})
    },
    // 切换业务类型
    changeSettleBusinessType() {
      const settleBusinessTypeList = this.form.settleBusinessTypeList
      let showTips = false
      this.option1.data.forEach((item) => {
        if (item.settleLineList.length && this.tipStatus) {
          showTips = true
        }
        item.settleLineList = item.settleLineList.filter((ele) => {
          let businessType = ele.businessType
          if (!Array.isArray(businessType)) {
            businessType = [ele.businessType]
          }
          const status = businessType.every((v) =>
            settleBusinessTypeList.includes(v),
          )
          return status
        })
      })
      if (showTips && this.tipStatus) {
        this.tipStatus = false
        this.$message('切换业务类型可能会导致航线数据被修改，请注意检查')
      }
    },
    // 添加航线
    AddLine(index, row) {
      if (!this.form.settleBusinessTypeList.length) {
        return this.$msgErrClose('请先选择业务类型，再添加航线')
      }
      this.addLineIndex = index
      const businessTypeData = this.dictMap['baseBusinessType'].filter((item) =>
        this.form.settleBusinessTypeList.includes(item.value),
      )
      this.addLineOption.businessType = businessTypeData
      if (row.settleLineList?.length) {
        this.addLineOption.settleLineList = JSON.parse(
          JSON.stringify(row.settleLineList),
        )
      } else {
        this.addLineOption.settleLineList = []
      }
      this.addLineOption.show = true
    },
    submitAddLine(data) {
      this.option1.data[this.addLineIndex].settleLineList = data
      this.closeAddLine()
    },
    closeAddLine() {
      this.addLineOption.show = false
      // 清空之前的数据
      this.addLineOption = {
        show: false,
        businessType: [],
        settleLineList: [],
      }
    },
    // 返回
    cancle() {
      this.$emit('cancle')
    },
    // 提交
    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          // 校验账期起始日
          const billDayType = this.form.billDayType
          if (['bill_date', 'invoice_date'].includes(billDayType)) {
            const billDay = this.form.billDay
            if (!billDay) {
              return this.$msgErrClose('账期起始日必填')
            }
            const reg = /^\d+$/
            if (!reg.test(billDay)) {
              return this.$msgErrClose('账期起始日只能为正整数')
            }
          }
          // 半月结必须选两个天数
          const half = this.form.settleCycle === 'half_month'
          const billDayLength = this.form.billDay.length !== 2
          if (half && billDayLength) {
            return this.$msgErrClose('半月结账期起始日必须选2个')
          }
          // 周结
          const weekly = this.form.settleCycle === 'weekly'
          const weeklyBillDayLength = this.form.billDay.length !== 4
          if (weekly && weeklyBillDayLength) {
            return this.$msgErrClose('7日结账期起始日必须选4个')
          }
          //发送账单 半月结 的每月必须选两个天数
          const accountBillDayLength = this.form.sendBillDay.length !== 2
          if (half && accountBillDayLength && this.form.sendBillDay.length>0) {
            return this.$msgErrClose('半月结账期发账单最晚时间:必须选2个')
          }
          // 发送账单 周结
          const accountWeeklyBillDayLength = this.form.sendBillDay.length !== 4
          if (weekly && accountWeeklyBillDayLength && this.form.sendBillDay.length>0 ) {
            return this.$msgErrClose('7日结账期发账单最晚时间:必须选4个')
          }
          // 次月结必填
          const status =
            this.form.billDayType === 'next_month' && !this.form.billDay
          if (status) {
            return this.$msgErrClose('账单起始日必填')
          }
          // 账期签收日期类型必填
          if (this.form.timeType === 'sign_date' && !this.form.signDateType) {
            return this.$msgErrClose('签收日期类型必选')
          }
          // 框取费用校验 last_month current_month next_month
          const {
            feePeriodStartType,
            feePeriodStartDay,
            feePeriodEndType,
            feePeriodEndDay
          } = this.form
          const noNull =
            feePeriodStartType &&
            feePeriodStartDay &&
            feePeriodEndType &&
            feePeriodEndDay
          const empty = [
            feePeriodStartType,
            feePeriodStartDay,
            feePeriodEndType,
            feePeriodEndDay
          ].every(item => !item)
          if (!noNull && !empty && !this.showFeePeriod) {
            return this.$msgErrClose('框取费用时段必须填全部选择')
          }
          // last_month current_month next_month
          const equal =
            feePeriodStartType === feePeriodEndType && !!feePeriodStartType
          const compareDay = Number(feePeriodEndDay) > Number(feePeriodStartDay)
          const sta1 = equal && !compareDay
          const sta2 =
            (feePeriodEndType === 'last_month' &&
              feePeriodStartType !== 'last_month') ||
            (feePeriodEndType === 'current_month' &&
              feePeriodStartType === 'next_month')
          if (sta1 || sta2) {
            return this.$msgErrClose('框取费用时段: 结束时间必须大于开始时间')
          }
          // 检验航线
          for (let index = 0; index < this.option1.data.length; index++) {
            const element = this.option1.data[index]
            if (!element.settleLineList.length) {
              return this.$msgErrClose(`第 ${index + 1} 条结算数据的航线未配置`)
            }
          }

          // 校验同一业务类型配置的航线重复
          const allLineData = []
          this.option1.data.forEach((item) => {
            const settleLineList = item.settleLineList || []
            settleLineList.forEach((ele) => {
              let sysLineCode = ele.sysLineCode
              if (!Array.isArray(sysLineCode)) {
                sysLineCode = [ele.sysLineCode]
              }
              let businessType = ele.businessType
              if (!Array.isArray(businessType)) {
                businessType = [ele.businessType]
              }
              businessType.forEach((v) => {
                allLineData.push({
                  businessType: v,
                  sysLineCode,
                })
              })
            })
          })
          // 校验所有的业务类型都需要配置航线信息
          const allBusinessType = allLineData.map((item) => item.businessType)
          const setBusinessType = Array.from(new Set(allBusinessType))
          if (
            setBusinessType.length !== this.form.settleBusinessTypeList.length
          ) {
            return this.$msgErrClose('所有的业务类型都必须配置航线数据')
          }
          if (allLineData.length) {
            let status = false
            if (allBusinessType.length !== setBusinessType.length) {
              for (let index = 0; index < allLineData.length; index++) {
                const element = allLineData[index]
                const businessType = element.businessType
                const dataNum = allLineData.filter(
                  (ele) => ele.businessType === businessType,
                )
                if (dataNum.length > 1) {
                  const allSysLineCode = dataNum
                    .map((v) => v.sysLineCode)
                    .flat(Infinity)
                  const setSysLineCode = Array.from(new Set(allSysLineCode))
                  if (
                    allSysLineCode.length !== setSysLineCode.length ||
                    allSysLineCode.includes('100000001')
                  ) {
                    status = true
                    break
                  }
                }
              }
              if (status) {
                return this.$msgErrClose('同一业务类型配置的航线重复')
              }
            }
          }

          // 校验结款时间
          const settlementDays = this.option1.data.some(
            (item) => item.settlementDays === '' && item.settlementDaysType !== 'one_month',
          )
          if (settlementDays) {
            return this.$msgErrClose('结款时间不能为空')
          }
          const rateType = this.option1.data.some((item) => !item.rateType || item.overdueRate === '')
          if (rateType) {
             return this.$msgErrClose('利率类型和滞纳金比例必填')
          }
          const overdueRate = this.option1.data.some((item) => {
            const reg = /^[0]|([0-9]\d*)+(\.\d{1,2})?$|^0\.\d{1,2}$/
            return item.overdueRate ? !reg.test(item.overdueRate) : false
          })
          if (overdueRate) {
            return this.$msgErrClose('滞纳金比例支持整数或者两位小数')
          }
          const reg = /^\d+$/
          const days = this.option1.data.some((item) => {
            // const settlementDays = item.settlementDays
            //   ? !reg.test(item.settlementDays)
            //   : false
            const advanceDays = item.advanceDays
              ? !reg.test(item.advanceDays)
              : false
            const graceDays = item.graceDays ? !reg.test(item.graceDays) : false
            return  advanceDays || graceDays
          })
          if (days) {
            return this.$msgErrClose(
              '最长垫付天数、宽限天数都只支持正整数',
            )
          }
          const remark = this.option1.data.some((item) =>
            item.remark ? item.remark.length > 500 : false,
          )
          if (remark) {
            return this.$msgErrClose('备注不能超过500个字')
          }
          // 检测业务类型的航线配置
          const hasBusinessTypeList = this.option1.data
            .map((item) => item.settleLineList)
            .flat(Infinity)
          const hasBusinessType = hasBusinessTypeList
            .map((item) => item.businessType)
            .flat(Infinity)
          const lessData = this.form.settleBusinessTypeList.filter(
            (ele) => !hasBusinessType.includes(ele),
          )
          if (lessData.length) {
            const text = this.dictMap['baseBusinessType']
              .filter((item) => lessData.includes(item.value))
              .map((ele) => ele.label)
              .join(' / ')
            this.$confirm(`${text}，将默认配置所有航线`, '警告', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning',
            })
              .then(() => {
                this.submitFn()
              })
              .catch(() => {})
          } else {
            this.submitFn()
          }
        }else{
          return this.$msgErrClose('请将必填项填写完整！')
        }
      })
    },
    // 组装提交数据
    submitFn() {
      const custid = this.custid
      let {
        contractNo:contractNoData,
        randomId,
        settleType,
        settleCycle,
        timeType,
        signDateType,
        billDayType,
        billDay,
        sendBillType,
        sendBillDay,
        isRetainContainer,
        settleBusinessTypeList,
        settleCompanyList,
        settleRelCustList,
        feePeriodStartType,
        feePeriodStartDay,
        feePeriodEndType,
        feePeriodEndDay,
        belongEmployeeName
      } = this.form
      let {contractNo, contractId, contractInfoNo} = contractNoData
      const contractCompanyList = settleCompanyList.map((item) => {
        const source = this.settleCompanyList.filter(
          (ele) => ele.companyCode === item
        )[0]
        const { companyCode, companyName, companyId } = source
        return {
          companyCode,
          companyName,
          companyId
        }
      })
      const settleDaysDtoList = this.option1.data.map((item) => {
        let settleLineList = item.settleLineList.map((ele) => {
          const { businessType, sysLineCode, business } = ele
          if (Array.isArray(sysLineCode)) {
            const data = []
            sysLineCode.forEach((x) => {
              const source = ele.sysLine.filter((v) => v.value === x)[0]
              businessType.forEach((v) => {
                const {
                  label: sysLineCname,
                  value: sysLineCode,
                  ename: sysLineEname,
                } = source
                data.push({
                  sysLineCname,
                  sysLineCode,
                  sysLineEname,
                  businessType: v,
                  business,
                })
              })
            })
            return data
          } else {
            return ele
          }
        })
        settleLineList = settleLineList.flat(Infinity)
        const overdueRate = (item.overdueRate / 100).toFixed(4)
        return Object.assign({}, item, { settleLineList, overdueRate })
      })
      const settleBusinessTypeList_multiValue = settleBusinessTypeList.map(
        (item) => {
          return {
            businessType: item
          }
        },
      )
      const settleRelCustList_multiValue = settleRelCustList.map(item => {
        return {
          relCustName: item.name || item.custName,
          relCustid: item.custid,
          custid: this.custid,
          custName: this.custName
        }
      })
      let billDayCheck = billDay
      let lastDay = false
      if (billDay === '月底') {
        billDayCheck = '31' // this.billDay
        lastDay = true
      }
      if (Array.isArray(billDayCheck)) {
        billDayCheck = billDayCheck.sort((a, b) => a - b)
      }
      let bdEmployee = this.OPEmployeeList.find(item=>item.bdEmployeeName===belongEmployeeName)
      const data = {
        randomId: randomId || Math.random(),
        contractNo,
        contractId,
        contractInfoNo,
        custid,
        settleType,
        settleCycle,
        timeType,
        signDateType,
        billDayType,
        billDay: billDayCheck,
        lastDay,
        sendBillType,
        sendBillDay,
        isRetainContainer: isRetainContainer ? 'yes' : 'no',
        settleCompanyList: contractCompanyList,
        settleBusinessTypeList: settleBusinessTypeList_multiValue,
        settleRelCustList: settleRelCustList_multiValue,
        settleDaysDtoList,
        feePeriodStartType,
        feePeriodStartDay,
        feePeriodEndType,
        feePeriodEndDay,
        belongEmployeeName,
        belongEmployeeId:bdEmployee.bdEmployeeId,
        belongDeptCode:bdEmployee.bdDeptCode
      }
      this.$emit('submit', data)
    },
    // 取消
    cancel() {
      this.$emit('cancel')
    },
    // 选择半月结
    changeSettleCycle(val) {
      if (val === 'half_month' || val === 'weekly') {
        this.timeTypeList[5].disabled = true
        this.timeTypeList[6].disabled = true
        this.billDayTypeList = [
          ...this.billDayTypeListBase,
          {
            label: '每月',
            value: 'every_month',
          },
        ]
        this.changeBillDayType('every_month')
        this.$set(this.form, 'sendBillType', 'every_month')
        this.$set(this.form, 'billDayType', 'every_month')
        // this.$set(this.form, 'billDay', '')
        this.$nextTick(() => {
          this.multipleDay = true
          this.disabledSendBillType = true
          this.form.billDay = this.dataSource.settleInfoId ? JSON.parse(this.dataSource.billDay || '[]') : []
          this.form.sendBillDay = this.dataSource.settleInfoId ? JSON.parse(this.dataSource.sendBillDay || '[]') : []
          this.sendBillDay = this.getNextDate(val)
          this.limit = (val === 'half_month' ? 2 : 4)
        })
        // 半月结 timeType值不能为"bill_receive_date""invoice_receive_date"
        if (
          ['bill_receive_date', 'invoice_receive_date'].includes(
            this.form.timeType,
          )
        ) {
          this.$set(this.form, 'timeType', 'fin_date')
        }
 
      } else {
        this.billDayTypeList = [...this.billDayTypeListBase]
        if (this.form.timeType && val === 'ticket') {
          this.form.timeType = 'etd'
        }
        this.changeTimeType(this.form.timeType)
        this.timeTypeList[5].disabled = false
        this.timeTypeList[6].disabled = false
        if (this.form.billDayType) {
          this.$set(this.form, 'billDay', '')
          this.$set(this.form, 'sendBillDay', '')
          this.$set(this.form, 'sendBillType', '')
          
        }
        this.multipleDay = false
        this.disabledSendBillType = false
      }
      this.$forceUpdate()
    },
    // 改变账期起始日类型
    changeTimeType(val) {
      const texts = {
        fin_date: '财务日期',
        etd: 'ETD',
        eta: 'ETA',
        bill_date: '账单日期',
        invoice_date: '开票日期',
        bill_receive_date: '收单日期',
        invoice_receive_date: '收票日期',
        ata: 'ATA',
        atd: 'ATD',
        sign_date: '签收日期'
      }
      const label_text = texts[val]
      let obj = {
        label: label_text,
        value: 'equal_time_type',
      }
      if (val === 'bill_receive_date') {
        obj.label = '账单日期'
        obj.value = 'bill_date'
        this.form.billDayType = 'bill_date'
        this.form.billDay = ''
      } else if (val === 'invoice_receive_date') {
        obj.label = '开票日期'
        obj.value = 'invoice_date'
        this.form.billDayType = 'invoice_date'
        this.form.billDay = ''
      }
      // else if (['ata','atd','sign_date'].includes(val)) {
      //   obj.value = val
      //   this.form.billDayType = val
      //   this.form.billDay = ''
      // }
      else {
        if (!['half_month','weekly'].includes(this.form.settleCycle)) {
          this.form.billDayType = 'equal_time_type'
          this.changeBillDayType(this.form.billDayType)
        } else {
          obj = {
            label: '每月',
            value: 'every_month',
          }
          this.form.billDayType = 'every_month'
          this.changeBillDayType('every_month')
        }
      }
      this.billDayTypeList = [...this.billDayTypeListBase, obj]
      // 清空签收信息
      this.form.signDateType = ""
    },
    // 改变账期起始日
    changeBillDayType(val) {
      if (val === 'equal_time_type') {
        this.form.billDay = ''
      }
      if (this.form.settleCycle !== 'half_month') {
        this.form.billDay = ''
      }
      this.billDay = this.getNextDate(val)
      // 月结，2月结，3月结，4月结 当月只能选月底
      const monthly = [
        'ticket',
        'monthly',
        'two_month',
        'three_month',
        'four_month',
      ]
      if (val === 'current_month' && monthly.includes(this.form.settleCycle)) {
        this.form.billDay = '月底'
      }
    },
    // 获取月份时间
    getNextDate(val) {
      if (val === 'equal_time_type') {
        return (this.billDay = 0)
      }
      if (val === 'every_month') {
        return (this.billDay = 31)
      }
      if (val === 'next_month') {
        return (this.billDay = 31)
      }
      const d = new Date()
      const year = d.getFullYear()
      const plus = val === 'current_month' ? 1 : 2
      const month = d.getMonth() + plus
      const date = new Date(year, month, 0)
      return date.getDate()
    },
    // 改变发单时间
    changeSendBillType(val) {
      this.sendBillDay = this.getNextDate(val)
    },
    // 添加table数据
    addTableData() {
      this.option1.data.push({
        settlementDays: '',
        settleLineList: [],
        settleLineList_code: ['100000001'],
        advanceDays: '',
        graceDays: '',
        rateType: '',
        overdueRate: '',
        remark: '',
        edit: true,
      })
    },
    // 获取结算账期
    getSettleCycleList() {
      this.settleCycleList = this.dictMap['settleCycle']
      // .filter(
      //   (item) => item.value !== 'weekly',
      // )
    },
    // 获取时间类型
    getTimeTypeList() {
      this.timeTypeList = this.dictMap['settleInfoTimeType'].map((item) =>
        Object.assign({}, item, { disabled: false }),
      )
    },
  },
   mounted() {
    // 复制结算信息
    if (this.dataSource.settleInfoId) {
      let { settleCompanyList, settleRelCustList, settleBusinessTypeList,contractNo,contractId,sendBillType } = this.dataSource
      let settleCompanyListMap = settleCompanyList.map(item => item.companyCode)
      let settleRelCustListMap = settleRelCustList.map(item => {
        let {relCustName, relCustid} = item
        return {
          custid: relCustid,
          name: relCustName,
          label: relCustName,
          value: relCustid
        }
      })
      let settleBusinessTypeListMap = settleBusinessTypeList.map(item => item.businessType)
      this.form = Object.assign({}, this.form, this.dataSource, {
        settleCompanyList: settleCompanyListMap,
        settleRelCustList: settleRelCustListMap,
        settleBusinessTypeList: settleBusinessTypeListMap,
        contractNo: {
          contractNo,
          contractId
        }
      })
      if(this.form.isRetainContainer === 'yes'){
        this.form.isRetainContainer = true
      }else{
        this.form.isRetainContainer = false
      }
      this.changeSettleCycle(this.dataSource.settleCycle)
      this.changeContractNo(this.form.contractNo)
      this.option1.data = this.form.settleDaysDtoList.map(item => {
        if (item.overdueRate) {
          item.overdueRate *= 100
        }
        item.settleDaysId = ''
        item.settleLineList.forEach(ele => ele.oid = '')
        if (item.settlementDaysType === 'one_month') {
          item.settlementDays = ''
          item.bothDisabled = true
        } else {
          item.bothDisabled = false
        }
        return Object.assign(item, {
          edit: true
        })
      })
      if (sendBillType) {
        this.changeSendBillType(sendBillType)
      }
      this.disableContractNo = true
      // 修复带过来的数据被改变的问题
      this.form.timeType = this.dataSource.timeType
      this.changeTimeType(this.dataSource.timeType)
      this.form.billDayType = this.dataSource.billDayType
      this.changeBillDayType(this.dataSource.billDayType)
    }
    if (this.form.billDayType === 'equal_time_type') {
      this.changeTimeType(this.form.timeType)
    }
    this.form.signDateType = this.dataSource.signDateType
  }
}
</script>

<style lang="scss" scoped>
.top-box,
.title-box {
  display: flex;
  margin: 8px;
  .title {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
  }
}
/deep/ .el-form-item{
  margin-bottom: 20px !important;
}
/deep/ .el-form-item--mini .el-form-item__content,
.el-form-item--mini .el-form-item__label {
  font-size: 12px;
  .el-select .el-select--mini,
  .el-input--mini .el-input__inner,
  .el-range-editor--mini.el-input__inner {
    height: 20px;
    width: 220px;
  }
}
.small-select {
  width: 90px;
  overflow: hidden;
  /deep/.el-input__inner {
    width: 90px !important;
  }
}
.inline-flex {
  /deep/ .el-form-item__content {
    display: inline-flex;
    align-items: center;
  }
}
.small-select2 {
  width: 130px;
  overflow: hidden;
  /deep/.el-input__inner {
    width: 130px !important;
  }
}
.small-select3 {
  width: 110px;
  overflow: hidden;
  /deep/.el-input__inner {
    width: 110px !important;
  }
}
.small-select4 {
  width: 80px;
  overflow: hidden;
  /deep/.el-input__inner {
    width: 80px !important;
  }
}
.fee-period {
  display: inline-flex;
  align-items: center;
  /deep/ .el-form-item__content {
    display: flex;
    align-items: center;
  }
}
.el-form {
  width: 100%;
  .el-form-item {
    width: 30%;
  }
  /deep/.el-checkbox__label {
    font-size: 12px;
    color: #606266;
  }
}

.table-box {
  display: flex;
  align-items: center;
  .table-info {
    flex: 1;
  }
  .btn-box {
    width: 30px;
    text-align: center;
    i {
      font-size: 20px;
      cursor: pointer;
      &:hover {
        color: #1890ff;
      }
    }
  }
}
/deep/ .finance-table .el-input__inner {
  text-align: center;
}
/deep/ .custlist .el-select__tags {
  display: flex;
  align-items: center;
  span {
    span:first-child {
      display: flex;
      align-items: center;
      .el-select__tags-text {
        display: inline-block;
        width: 110px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      i {
        top: 2px;
      }
    }
  }
}
/deep/.finance-table .el-input__icon {
  line-height: 20px !important;
  text-align: center !important;
}
/deep/.el-dialog .el-checkbox__label {
  color: #606266 !important;
}
/deep/ .finance-table-select .el-select {
  width: 100%;
}
/deep/.el-select .el-tag {
  margin: 0 3px;
}
/deep/ .el-select .el-input .el-select__caret {
  line-height: 20px;
  height: 20px;
}
.relcust{
  /deep/.el-tag__close{
    display: none;
  }
}
</style>
