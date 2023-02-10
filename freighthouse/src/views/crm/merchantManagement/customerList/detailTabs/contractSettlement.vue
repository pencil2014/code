<template>
  <el-dialog :appendToBody="true" :visible.sync="config.show" title="新增结算信息" width="1000px">
    <el-form
      :inline="true"
      :model="form"
      :rules="rules"
      class="settle-form"
      label-width="110px"
      ref="form"
      size="mini"
    >
      <el-form-item label="业务类型:" prop="settleBusinessTypeList">
        <el-select
          @change="changeSettleBusinessType"
          collapse-tags
          multiple
          placeholder="请选择"
          size="mini"
          v-model="form.settleBusinessTypeList"
        >
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in businessTypeOptions"
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
      </el-form-item>
      <el-form-item label="账期起始日类型:" prop="timeType">
        <el-select @change="changeTimeType" placeholder="请选择" size="mini" v-model="form.timeType">
          <el-option
            :disabled="item.disabled"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in timeTypeList"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="发账单最晚时间:" style="margin-bottom:0">
        <el-select
          @change="changeSendBillType"
          class="small-select"
          placeholder="请选择"
          size="mini"
          v-model="form.sendBillType"
        >
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in dictMap['settleInfoSendBillType']"
          ></el-option>
        </el-select>
        <el-select class="small-select2" placeholder="请选择" v-model="form.sendBillDay">
          <el-option :key="i" :label="i" :value="i" v-for="i in sendBillDay"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="inline-flex" label="账期起始日:" prop="billDayType">
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
        <template v-if="['bill_date', 'invoice_date'].includes(form.billDayType)">
          {{`\xa0后\xa0`}}
          <el-input class="small-select3" placeholder="请输入" size="mini" v-model="form.billDay"></el-input>
        </template>
        <template v-else>
          <!-- collapse-tags v-if="form.billDayType !=='equal_time_type'" -->
          <el-select
            :disabled="disabledBillDay"
            :multiple="multipleDay"
            :multiple-limit="2"
            class="small-select2"
            placeholder="请选择"
            v-model="form.billDay"
          >
            <el-option :key="i" :label="i" :value="i" v-for="i in billDay"></el-option>
          </el-select>
        </template>
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
      <el-form-item label=" " prop="isRetainContainer" style="margin-bottom:0">
        <el-checkbox label="是否需要后有柜" v-model="form.isRetainContainer"></el-checkbox>
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
    <div class="dialog-footer" slot="footer">
      <el-button @click="cancel" size="mini">取消</el-button>
      <el-button @click="submit" size="mini" type="primary">提交</el-button>
    </div>
    <AddLine
      :options="addLineOption"
      @cancel="closeAddLine"
      @submit="submitAddLine"
      v-if="addLineOption.show"
    />
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import AddLine from './addLine'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { baseBusinessList, companyPageList } from '@/api/base'
export default {
  mixins: [mixin, routerMixin],
  components: {
    FinanceTableMass,
    AddLine
  },
  props: {
    config: {
      type: Object,
      default: () => {}
    },
    sysLine: {
      type: Array,
      default: () => []
    },
    custid: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      option1: {},
      form: {
        settleBusinessTypeList: [],
        settleCycle: 'ticket',
        timeType: 'etd',
        billDayType: 'equal_time_type',
        billDay: '',
        sendBillType: '',
        sendBillDay: '',
        isRetainContainer: false,
        feePeriodStartType: '',
        feePeriodStartDay: '',
        feePeriodEndType: '',
        feePeriodEndDay: ''
      },
      rules: {
        settleBusinessTypeList: {
          required: true,
          message: '业务类型必选',
          trigger: 'change'
        },
        settleCycle: {
          required: true,
          message: '结算周期必选',
          trigger: 'change'
        },
        timeType: {
          required: true,
          message: '账期起始日类型必选',
          trigger: 'change'
        },
        billDayType: {
          required: true,
          message: '账期起始日必选',
          trigger: 'change'
        },
        billDay: {
          required: true,
          message: '账期起始日必选',
          trigger: 'change'
        }
      },
      businessTypeOptions: [],
      settleCycleList: [],
      timeTypeList: [],
      multipleDay: false,
      billDayTypeList: [],
      billDayTypeListBase: [
        {
          label: '当月',
          value: 'current_month'
        },
        {
          label: '次月',
          value: 'next_month'
        }
      ],
      billDay: 0,
      sendBillDay: 0,
      addLineIndex: '',
      addLineOption: {
        show: false,
        businessType: [],
        settleLineList: []
      },
      tipStatus: true
    }
  },
  created() {
    this.getBusinessType()
    this.getSettleCycleList()
    this.getTimeTypeList()
    this.billDayTypeList = [...this.billDayTypeListBase]
    const operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: '删除',
          type: 'text',
          show: true,
          action: 'Delete'
        }
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
      }
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
          remark: '',
          edit: true
        }
      ],
      tips: false,
      selection: false,
      maxHeight: 300,
      operationBtns,
      edit: true,
      noCheckWhenEdit: true,
      columns: [
        {
          prop: 'settlementDays',
          label: '结款天数',
          type: 'input',
          required: true,
          validateInput: (val, row, item, change) => {
            if (change && val) {
              const reg = /^\d+$/
              if (!reg.test(val)) {
                return this.$msgErrClose('结款天数只支持正整数')
              }
            }
          }
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
            }
          }
        },
        // {
        //   prop: 'settleLineList_code',
        //   label: '航线',
        //   type: 'select',
        //   filterable: true,
        //   selectOptions: this.sysLine,
        //   multiple: true,
        //   width: 200,
        //   change: (value, row, rowIndex) => {
        //     if (value.includes('100000001')) {
        //       row.settleLineList_code = ['100000001']
        //       this.sysLine.forEach(item => {
        //         if (item.value === '100000001') {
        //           item.disabled = false
        //         } else {
        //           item.disabled = true
        //         }
        //       })
        //     } else {
        //       this.sysLine.forEach(item => (item.disabled = false))
        //     }
        //   }
        // },
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
          }
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
          }
        },
        {
          prop: 'rateType',
          label: '利率类型',
          type: 'select',
          propInDict: 'settleInfoRateType'
        },
        {
          prop: 'overdueRate',
          label: '滞纳金比例',
          type: 'input',
          hasCellSuffix: true,
          cellSuffixContent: '%',
          validateInput: (val, row, item, change) => {
            if (change && val) {
              const reg = /^([1-9]\d*)+(\.\d{1,2})?$|^0\.\d{1,2}$/
              if (!reg.test(val)) {
                return this.$msgErrClose('滞纳金比例支持整数或者两位小数')
              }
            }
          }
        },
        { prop: 'remark', label: '备注', type: 'input', maxlength: 500 }
      ]
    })
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    disabledBillDayType() {
      return (
        this.form.settleCycle === 'half_month' ||
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
      const sta2 = ['ticket', 'half_month'].includes(this.form.settleCycle)
      return sta1 || sta2
    }
  },
  methods: {
    // 切换业务类型
    changeSettleBusinessType() {
      const settleBusinessTypeList = this.form.settleBusinessTypeList
      let showTips = false
      this.option1.data.forEach(item => {
        if (item.settleLineList.length && this.tipStatus) {
          showTips = true
        }
        item.settleLineList = item.settleLineList.filter(ele => {
          let businessType = ele.businessType
          if (!Array.isArray(businessType)) {
            businessType = [ele.businessType]
          }
          const status = businessType.every(v =>
            settleBusinessTypeList.includes(v)
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
      const businessTypeData = this.businessTypeOptions.filter(item =>
        this.form.settleBusinessTypeList.includes(item.value)
      )
      this.addLineOption.businessType = businessTypeData
      if (row.settleLineList?.length) {
        this.addLineOption.settleLineList = JSON.parse(
          JSON.stringify(row.settleLineList)
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
        settleLineList: []
      }
    },
    // 提交
    submit() {
      this.$refs['form'].validate(valid => {
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
            return this.$msgErrClose('半月结账期起始日必须选两个')
          }
          // 次月结必填
          const status =
            this.form.billDayType === 'next_month' && !this.form.billDay
          if (status) {
            return this.$msgErrClose('账单起始日必填')
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
          if (!noNull && !empty) {
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
          this.option1.data.forEach(item => {
            const settleLineList = item.settleLineList || []
            settleLineList.forEach(ele => {
              let sysLineCode = ele.sysLineCode
              if (!Array.isArray(sysLineCode)) {
                sysLineCode = [ele.sysLineCode]
              }
              let businessType = ele.businessType
              if (!Array.isArray(businessType)) {
                businessType = [ele.businessType]
              }
              businessType.forEach(v => {
                allLineData.push({
                  businessType: v,
                  sysLineCode
                })
              })
            })
          })
          // 校验所有的业务类型都需要配置航线信息
          const allBusinessType = allLineData.map(item => item.businessType)
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
                  ele => ele.businessType === businessType
                )
                if (dataNum.length > 1) {
                  const allSysLineCode = dataNum
                    .map(v => v.sysLineCode)
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

          // 校验结款天数
          const settlementDays = this.option1.data.some(
            item => !item.settlementDays && item.settlementDays !== 0
          )
          if (settlementDays) {
            return this.$msgErrClose('结款天数不能为空')
          }
          const overdueRate = this.option1.data.some(item => {
            const reg = /^([1-9]\d*)+(\.\d{1,2})?$|^0\.\d{1,2}$/
            return item.overdueRate ? !reg.test(item.overdueRate) : false
          })
          if (overdueRate) {
            return this.$msgErrClose('滞纳金比例支持整数或者两位小数')
          }
          const reg = /^\d+$/
          const days = this.option1.data.some(item => {
            const settlementDays = item.settlementDays
              ? !reg.test(item.settlementDays)
              : false
            const advanceDays = item.advanceDays
              ? !reg.test(item.advanceDays)
              : false
            const graceDays = item.graceDays ? !reg.test(item.graceDays) : false
            return settlementDays || advanceDays || graceDays
          })
          if (days) {
            return this.$msgErrClose(
              '结款天数、最长垫付天数、宽限天数都只支持正整数'
            )
          }
          const remark = this.option1.data.some(item =>
            item.remark ? item.remark.length > 500 : false
          )
          if (remark) {
            return this.$msgErrClose('备注不能超过500个字')
          }
          // 检测业务类型的航线配置
          const hasBusinessTypeList = this.option1.data
            .map(item => item.settleLineList)
            .flat(Infinity)
          const hasBusinessType = hasBusinessTypeList
            .map(item => item.businessType)
            .flat(Infinity)
          const lessData = this.form.settleBusinessTypeList.filter(
            ele => !hasBusinessType.includes(ele)
          )
          if (lessData.length) {
            const text = this.businessTypeOptions
              .filter(item => lessData.includes(item.value))
              .map(ele => ele.label)
              .join(' / ')
            this.$confirm(`${text}，将默认配置所有航线`, '警告', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            })
              .then(() => {
                this.submitFn()
              })
              .catch(() => {})
          } else {
            this.submitFn()
          }
        }else {
          return this.$msgErrClose('请将必填项填写完整！')
        }
      })
    },
    // 组装提交数据
    submitFn() {
      const custid = this.custid
      let {
        randomId,
        settleCycle,
        timeType,
        billDayType,
        billDay,
        sendBillType,
        sendBillDay,
        isRetainContainer,
        settleBusinessTypeList,
        feePeriodStartType,
        feePeriodStartDay,
        feePeriodEndType,
        feePeriodEndDay
      } = this.form
      // 一定条件下不显示框取费用
      if (this.showFeePeriod) {
        feePeriodStartType = ''
        feePeriodStartDay = ''
        feePeriodEndType = ''
        feePeriodEndDay = ''
      }
      const settleDaysDtoList = this.option1.data.map(item => {
        let settleLineList = item.settleLineList.map(ele => {
          const { businessType, sysLineCode, business } = ele
          if (Array.isArray(sysLineCode)) {
            const data = []
            sysLineCode.forEach(x => {
              const source = ele.sysLine.filter(v => v.value === x)[0]
              businessType.forEach(v => {
                const {
                  label: sysLineCname,
                  value: sysLineCode,
                  ename: sysLineEname
                } = source
                data.push({
                  sysLineCname,
                  sysLineCode,
                  sysLineEname,
                  businessType: v,
                  business
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
        item => {
          const source = this.businessTypeOptions.filter(
            ele => ele.value === item
          )[0]
          const { value: businessType, label: name, business } = source
          return {
            businessType,
            name,
            business
          }
        }
      )
      let billDayCheck = billDay
      let lastDay = false
      if (billDay === '月底') {
        billDayCheck = '31' // this.billDay
        lastDay = true
      }
      if (Array.isArray(billDayCheck)) {
        billDayCheck = billDayCheck.sort((a, b) => a - b)
      }
      const data = {
        randomId: randomId || Math.random(),
        custid,
        settleCycle,
        timeType,
        billDayType,
        billDay: billDayCheck,
        lastDay,
        sendBillType,
        sendBillDay,
        isRetainContainer: isRetainContainer ? 'yes' : 'no',
        settleBusinessTypeList: settleBusinessTypeList_multiValue,
        settleDaysDtoList,
        feePeriodStartType,
        feePeriodStartDay,
        feePeriodEndType,
        feePeriodEndDay
      }
      this.$emit('submit', data)
    },
    // 取消
    cancel() {
      this.$emit('cancel')
    },
    // 选择半月结
    changeSettleCycle(val) {
      if (val === 'half_month') {
        this.timeTypeList[5].disabled = true
        this.timeTypeList[6].disabled = true
        this.billDayTypeList = [
          ...this.billDayTypeListBase,
          {
            label: '每月',
            value: 'every_month'
          }
        ]
        this.changeBillDayType('every_month')
        this.$set(this.form, 'billDayType', 'every_month')
        this.$set(this.form, 'billDay', '')
        this.$nextTick(() => {
          this.multipleDay = true
          this.form.billDay = []
        })
        // 半月结 timeType值不能为"bill_receive_date""invoice_receive_date"
        if (
          ['bill_receive_date', 'invoice_receive_date'].includes(
            this.form.timeType
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
        }
        this.multipleDay = false
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
        invoice_receive_date: '收票日期'
      }
      const label_text = texts[val]
      const obj = {
        label: label_text,
        value: 'equal_time_type'
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
      } else {
        if (this.form.settleCycle !== 'half_month') {
          this.form.billDayType = 'equal_time_type'
          this.changeBillDayType(this.form.billDayType)
        } else {
          this.form.billDayType = 'every_month'
          this.changeBillDayType('every_month')
        }
      }
      this.billDayTypeList = [...this.billDayTypeListBase, obj]
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
        'four_month'
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
        return (this.billDay = 28)
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
        edit: true
      })
    },
    // 业务类型下拉
    getBusinessType() {
      // baseBusinessList().then(res => {
      //   const settleBusinessTypeList =
      //     this.form.settleBusinessTypeListAll ||
      //     this.form.settleBusinessTypeList
      //   this.businessTypeOptions = res.data
      //     .filter(item => settleBusinessTypeList.includes(item.businessType))
      //     .map(ele => {
      //       return {
      //         label: ele.name,
      //         value: ele.businessType,
      //         business: ele.business
      //       }
      //     })
      // })
    },
    // 获取结算账期
    getSettleCycleList() {
      this.settleCycleList = this.dictMap['settleCycle'].filter(
        item => item.value !== 'weekly'
      )
    },
    // 获取时间类型
    getTimeTypeList() {
      this.timeTypeList = this.dictMap['settleInfoTimeType'].map(item =>
        Object.assign({}, item, { disabled: false })
      )
    }
  },
  mounted() {
    this.form = Object.assign({}, this.form, this.config.sourceData)
    if (this.form.billDayType === 'equal_time_type') {
      this.changeTimeType(this.form.timeType)
    }
    if (this.form.billDayType) {
      // this.changeBillDayType(this.form.billDayType)
      this.billDay = this.getNextDate(this.form.billDayType)
    }
    if (this.form.billDayType === 'current_month') {
      this.form.billDay = '月底'
    }

    if (this.form.sendBillType) {
      this.changeSendBillType(this.form.sendBillType)
    }
    if (this.form.settleCycle === 'half_month') {
      this.billDayTypeList = [
        ...this.billDayTypeListBase,
        {
          label: '每月',
          value: 'every_month'
        }
      ]
      if (!Array.isArray(this.form.billDay)) {
        this.form.billDay = this.form.billDay.indexOf('[') > -1 ? JSON.parse(this.form.billDay) : this.form.billDay.split(',')
      }
      this.multipleDay = true
    } else if (['bill_date', 'invoice_date'].includes(this.form.billDayType)) {
      this.billDayTypeList = [
        ...this.billDayTypeListBase,
        {
          label: '账单日期',
          value: 'bill_date'
        },
        {
          label: '开票日期',
          value: 'invoice_date'
        }
      ]
    } else {
      const texts = {
        fin_date: '财务日期',
        etd: 'ETD',
        eta: 'ETA',
        bill_date: '账单日期',
        invoice_date: '开票日期',
        bill_receive_date: '收单日期',
        invoice_receive_date: '收票日期'
      }
      const label_text = texts[this.form.timeType]
      const obj = {
        label: label_text,
        value: 'equal_time_type'
      }
      this.billDayTypeList = [...this.billDayTypeListBase, obj]
    }
    if (this.form.settleDaysDtoList?.length) {
      this.option1.data = this.form.settleDaysDtoList
    }
    // 初始化业务类型
    let baseBusinessType = this.dictMap['baseBusinessType'] || []
    const settleBusinessTypeList = this.form.settleBusinessTypeListAll || this.form.settleBusinessTypeList
    this.businessTypeOptions = baseBusinessType.filter(item => settleBusinessTypeList.includes(item.value)).map(ele => {
      return {
        ...ele,
        business: ele.value.split('_')[0] || ''
      }
    })
  }
}
</script>

<style lang="scss" scoped>
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
    width: 48%;
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
</style>

