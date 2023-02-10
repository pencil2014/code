<template>
  <el-dialog
    :appendToBody="true"
    :visible.sync="config.show"
    @close="cancel"
    title="结算信息"
    width="800px"
  >
    <FinanceTableMass :option="option1" v-loading="loading" />
    <AddLine
      :options="showLineOption"
      @cancel="closeAddLine"
      @submit="closeAddLine"
      v-if="showLineOption.show"
    />
  </el-dialog>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import AddLine from './addLine'
import { mapState, mapGetters } from 'vuex'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { settleInfo } from '@/api/crm/contract'
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
    }
  },
  data() {
    return {
      option1: {},
      loading: false,
      showLineOption: {
        show: false,
        businessType: [],
        settleLineList: [],
        disabled: true
      }
    }
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj'])
  },
  created() {
    this.getData()
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [],
      tips: false,
      operationBtns: false,
      selection: false,
      noClickCheck: true,
      maxHeight: 300,
      columns: [
        {
          prop: 'settleBusinessTypeList_multiValue',
          label: '业务类型',
          type: 'text'
        },
        {
          prop: 'settleCycle',
          label: '结算周期',
          type: 'select',
          propInDict: 'settleCycle'
        },
        {
          prop: 'status',
          label: '是否有效',
          type: 'select',
          propInDict: 'commonStatus'
        },
        {
          prop: 'timeType',
          label: '账期起始日类型',
          type: 'select',
          propInDict: 'settleInfoTimeType',
          width: 120
        },
        {
          prop: 'billDay',
          label: '账期起始日',
          type: 'text',
          width: 120,
          formatter: ({ cellValue, row }) => {
            const type = this.dictMapObj['settleInfoBillDayType'][
              row['billDayType']
            ]
            return type === '等于时间类型'
              ? this.dictMapObj['settleInfoTimeType'][row.timeType]
              : ['账单日期', '开票日期'].includes(type)
                ? cellValue != '0'
                  ? `${type}后${cellValue}日`
                  : `${type}`
                : row.lastDay || (cellValue === '31' && type === '当月')
                  ? `${type}月底`
                  : `${type}${cellValue}日`
          }
        },
        {
          prop: 'sendBillDay',
          label: '发账单最晚时间',
          type: 'text',
          width: 140,
          formatter: ({ cellValue, row }) => {
            const type = this.dictMapObj['settleInfoBillDayType'][
              row['sendBillType']
            ]
            if (type && cellValue) {
              return type === '等于时间类型' ? type : `${type}${cellValue}日`
            } else {
              return ''
            }
          }
        },
        {
          prop: 'feePeriodStartType',
          label: '框取费用时间段',
          type: 'text',
          width: 140,
          formatter: ({ cellValue, row }) => {
            if (cellValue) {
              const {
                feePeriodEndDay,
                feePeriodEndType,
                feePeriodStartDay,
                feePeriodStartType
              } = row
              const start = this.dictMapObj['settleInfoFeePeriodType'][
                feePeriodStartType
              ]
              const end = this.dictMapObj['settleInfoFeePeriodType'][
                feePeriodEndType
              ]
              return `${start}${feePeriodStartDay}日 - ${end}${feePeriodEndDay}日`
            } else {
              return ''
            }
          }
        },
        {
          prop: 'isRetainContainer',
          label: '是否需要后有柜',
          type: 'text',
          width: 140,
          formatter: ({ cellValue, row }) => {
            return cellValue === 'yes' ? '是' : '否'
          }
        },
        { prop: 'settlementDays', label: '结款天数', type: 'text' },
        // { prop: 'settleLineList_multiValue', label: '航线', type: 'text' },
        {
          prop: 'settleLineList',
          label: '航线',
          type: 'button',
          operationBtns: {
            show: true,
            data: [{ label: '查看' }],
            callback: (action, index, row) => {
              this.showSettleLine(row)
            }
          }
        },
        {
          prop: 'advanceDays',
          label: '最长垫付天数',
          type: 'text',
          width: 140
        },
        { prop: 'graceDays', label: '宽限天数', type: 'text' },
        {
          prop: 'rateType',
          label: '利率类型',
          type: 'select',
          propInDict: 'settleInfoRateType'
        },
        {
          prop: 'overdueRate',
          label: '滞纳金利率',
          type: 'text',
          formatter: ({ cellValue, row }) => {
            return (cellValue * 100).toFixed(2) + '%'
          }
        },
        { prop: 'remark', label: '备注', type: 'text' },
        { prop: 'createdName', label: '创建人', type: 'text' },
        { prop: 'createdTime', label: '创建时间', type: 'text' },
        { prop: 'updatedName', label: '修改人', type: 'text' },
        { prop: 'updatedTime', label: '修改时间', type: 'text' }
      ],
      spanMethod: ({ row, _rowIndex, column, _columnIndex, visibleData }) => {
        if (row.rowsCount) {
          if (_columnIndex < 8 || _columnIndex > 14) {
            const cellValue = row['settleInfoId']
            const prevRow = visibleData[_rowIndex - 1]
            let nextRow = visibleData[_rowIndex + 1]
            if (prevRow && prevRow['settleInfoId'] === cellValue) {
              return { rowspan: 0, colspan: 0 }
            } else {
              let countRowspan = 1
              while (nextRow && nextRow['settleInfoId'] === cellValue) {
                nextRow = visibleData[++countRowspan + _rowIndex]
              }
              if (countRowspan > 1) {
                return { rowspan: countRowspan, colspan: 1 }
              }
            }
          }
        }
      }
    })
  },
  methods: {
    // 显示航线
    showSettleLine(row) {
      const { settleBusinessTypeList, settleLineList } = row
      const businessTypeData = settleBusinessTypeList.map(item => {
        const d = this.config.businessTypeOptions.filter(
          ele => ele.value === item.businessType
        )
        const name = d.length ? d[0].label : item.businessType
        return Object.assign({}, item, { name })
      })
      this.showLineOption.businessType = businessTypeData.map(item => {
        const { name: label, businessType: value } = item
        return {
          label,
          value
        }
      })
      this.showLineOption.settleLineList = settleLineList
      this.showLineOption.show = true
    },
    closeAddLine() {
      this.showLineOption.show = false
    },
    getData() {
      const { contractId } = this.config
      const data = {
        contractId
      }
      this.loading = true
      settleInfo(data)
        .then(res => {
          if (res.code === 0) {
            const data = []
            res.data.forEach(item => {
              if (item.settleDaysDtoList.length > 1) {
                item.settleDaysDtoList.forEach((ele, index) => {
                  item.settleBusinessTypeList_multiValue = item.settleBusinessTypeList
                    .map(ele => {
                      const d = this.config.businessTypeOptions.filter(
                        e => e.value === ele.businessType
                      )[0]
                      return d.label
                    })
                    .join('，')
                  if (index === 0) {
                    item.rowsCount = item.settleDaysDtoList.length
                  }
                  item.settleLineList_multiValue = ele.settleLineList
                    .map(ele => ele.sysLineCname)
                    .join('，')
                  data.push(Object.assign({}, item, ele))
                })
              } else if (item.settleDaysDtoList.length === 1) {
                const ele = item.settleDaysDtoList[0]
                item.settleBusinessTypeList_multiValue = item.settleBusinessTypeList
                  .map(ele => {
                    const d = this.config.businessTypeOptions.filter(
                      e => e.value === ele.businessType
                    )[0]
                    return d.label
                  })
                  .join('，')
                item.rowsCount = item.settleDaysDtoList.length
                item.settleLineList_multiValue = ele.settleLineList
                  .map(ele => ele.sysLineCname)
                  .join('，')
                data.push(Object.assign({}, item, ele))
              } else {
                data.push(Object.assign({}, item))
              }
            })
            this.option1.data = data
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    cancel() {
      this.$emit('cancel')
    }
  }
}
</script>
