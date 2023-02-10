<template>
<!-- 废弃 -->
<!-- 废弃 -->
<!-- 废弃 -->
<!-- 废弃 -->
  <div class="finance-summay-cnt">
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="summary-bill-cnt finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button-group>
            <el-button v-if="checkAuth($route.name, 'tab-summaryBillList', 'btn-goPaymentRequest')" class="finance-btn" size="mini" type="primary" @click="goPaymentRequest"
            >付款申请</el-button>
          </el-button-group>
          <el-button-group>
            <el-button v-if="checkAuth($route.name, 'tab-summaryBillList', 'btn-goBlancaLoss')" class="finance-btn" size="mini" type="primary" @click="goBlancaLoss"
            >亏损对冲</el-button>
          </el-button-group>
        </div>
        <div class="money-box-right">
          <el-button
            class="finance-btn"
            @click="refreshListPage"
            size="mini"
            type="primary"
          >{{$t('Common.refresh')}}</el-button>
        </div>
      </div>
      <FinanceTable :option="option1" :tableQuery="tableQuery" :autoMax="true" @send-multi="sendMulti" />
    </div>
    <div v-if="customColumnsPopShow">
    <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{ key: 'prop', label: 'label' }"
        @close="customColumnsPopClose"
      />
    </div>
  </div>
</template>

<script>
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceTable from '../components/financeTable.vue'
import CustomColumns from '@/components/customColumns'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { shLienMonListPage, shLienMonGetListAmtSummary } from '@/api/fin/shBill'
import { employeeSelectlist } from '@/api/companyResource'
import { dateFormat } from '@/views/finance/utils/finance'
import Vue from 'vue'
export default {
  components: {
    FinanceSearch,
    FinanceTable,
    CustomColumns
  },
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      tableQuery:{
        pageSize: -1,
        currPage: 1
      },
      loading: false,
      searchOption: {},
      option1: {},
      multipleSelection: [],
      // 升序
			ascColumns: [],
			// 降序
			descColumns: [],
      // 初始表头
      selfColumnsBase:[
        {
          prop: 'shLienMonNo',
          label: '月度编号',
          type: 'button',
          width: 125,
          operationBtns: {
            show: true,
            callback: (fn, index, row, option, subItem) => {
              this.showSummaryDetail(row)
            }
          }
        },
        {
          prop: 'settleCorpName',
          label: this.$t('FeeList.settleCorp'),
          type: 'text',
          width: 150
        },
        {
          prop: 'yearMon',
          label: '所属年月',
          type: 'text'
        },
        {
          prop: 'sysLineName',
          label: '航线',
          type: 'text'
        },
        {
          prop: 'sysLineManagerName',
          label: '航线经理',
          type: 'text'
        },
        {
          prop: 'employeeName',
          label: '商务',
          type: 'text'
        },
        // {
        //   prop: 'employeeNo',
        //   label: '工号',
        //   type: 'text'
        // },
        {
          prop: 'feeCount',
          label: '条数',
          type: 'text'
        },
        {
          prop: 'currency',
          label: this.$t('FeeList.currency'),
          type: 'text'
        },
        {
          prop: 'totalLienAmt',
          label: '总留置费用',
          width: 110,
          type: 'text'
        },
        {
          prop: 'totalLossAmt',
          label: '总亏损费用',
          width: 110,
          type: 'text'
        },
        {
          prop: 'restLienAmt',
          label: '剩余留置费用',
          width: 110,
          type: 'text'
        },
        {
          prop: 'restLossAmt',
          label: '剩余亏损费用',
          width: 110,
          type: 'text'
        },
        {
          prop: 'lockStatus',
          label: '锁定状态',
          type: 'text',
          // formatter: (row, pItem) => {
          //   const text = {
          //     lock: '锁定',
          //     unlock: '未锁定'
          //   }
          //   const key = row[pItem.prop]
          //   return text[key] || '--'
          // },
          formatter: ({ cellValue }) => {
            const text = {
              lock: '锁定',
              unlock: '未锁定'
            }
            const key = cellValue
            return text[key] || '--'
          }
        },
        {
          prop: 'createdTime',
          label: this.$t('Common.createTime'),
          type: 'text',
          width: 150
        },
        {
          prop: 'updatedName',
          label: '更新人',
          type: 'text'
        },
        {
          prop: 'updatedTime',
          label: '更新时间',
          type: 'text',
          width: 150
        }
      ]
    }
  },
  created() {
    this.searchOption = {
      saveDefault: true,
      saveShow: true,
      saveName: 'seasummaryBillList',
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 4,
        searchInputGroup: [
          {
            key: 'shLienMonNo',
            value: '',
            showType: '1'
          },
          {
            key: 'sysLineCode',
            value: '',
            showType: '2'
          },
          {
            key: 'settleCorpCode',
            value: '',
            showType: '3'
          },
          {
            key: 'yearMon',
            value: '',
            showType: '4'
          }
        ],
        filterGroups: {
          shLienMonNo: {
            label: '月度编号',
            type: 'input',
            showType: '1'
          },
          // employeeNo: {
          //   label: '工号',
          //   type: 'input',
          //   showType: '1'
          // },
          sysLineGroupCode: { label: '大航线', type: 'select', prop: 'dictGroupShipLine', multiple: true },
          sysLineCode: {
            label: '小航线',
            type: 'remoteSelect',
            showType: '2',
            multiple:true,
            remoteMethod: (val, item) => {
              this.sysLineQuerySearch(val, item)
            },
            visibleChange: (val, item) => {
              this.sysLineQuerySearch(val, item)
            },
            remoteSelectList: []
          },
          employeeId: {
            label: '商务',
            type: 'remoteSelect',
            showType: '2',
            remoteMethod: (queryString, item, row) => {
              this.getEmployeeList(queryString, item)
            },
            visibleChange: (queryString, item, row) => {
              this.getEmployeeList(queryString, item)
            },
            remoteSelectList: []
          },
          settleCorpCode: {
            label: this.$t('FeeList.settleCorp'),
            type: 'autocomplete',
            showType: '3',
            querySearch: (queryString, cb) => {
              this.selectedOptionItem = ''
              this.querySettleUnit(queryString, cb)
            },
            select: (optionItem, row) => {
              this.selectedOptionItem = optionItem
              row.valueReq = 'settleCorpCode'
              row.settleCorpCode = optionItem.key
            },
            change: (val, row) => {
              // 延时150ms获取select中的改变
              setTimeout(() => {
                if (this.selectedOptionItem === '') {
                  row.valueReq = ''
                  return
                }
              }, 150)
            }
          },
          yearMon: {
            label: '所属年月',
            type: 'monthrange',
            showType: '4',
            format: 'yyyy-MM'
          },
          createdTime: {
            label: this.$t('Common.createTime'),
            type: 'daterange',
            showType: '4'
          },
          updatedTime: {
            label: '更新时间',
            type: 'daterange',
            showType: '4'
          }
        }
      }
    }
    const pagination = Object.assign({}, this.option.pagination, {
      show: true
    })
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
    this.option1 = Object.assign({}, this.option, {
      customColumns: {
        show: true,
        handleCustomColumns: ()=> this.handleCustomColumns()
      },
      id: 'option1', $name: 'summaryBillList',
      data: [],
      tips: {
        text: '',
        show: false
      },
      sortable: true,
      sortChange: (column, prop, order) => {
				this.descColumns = order == 'descending' ? [prop] : []
				this.ascColumns = order == 'ascending' ? [prop] : []
				this.getData()
			},
      operationBtns: false,
      pagination,
      listAmtSummary,
      maxHeight: this.getFinanceTableMaxHeight,
    })
    const columns = [...this.selfColumnsBase]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    let sortableList = ['totalLienAmt','totalLossAmt','restLienAmt', 'restLossAmt']
    this.selfColumnsBase.forEach(item => (sortableList.includes(  item.prop ) ? item.sortable = true : item.sortable = false))
    this.option1.columns = columns
    // this.getData()
  },
  methods: {
    // 搜索
    search() {
      this.option1.pagination.currPage = 1
      this.tableQuery.currPage = 1
      this.getData(true)
    },
    // 获取数据
    getData(isSearch) {
      this.option1.loading = true
      const data = {
        currPage: this.tableQuery.currPage,
        pageSize: this.tableQuery.pageSize,
        "ascColumns": this.ascColumns,
        "descColumns": this.descColumns,
        columns: [],
        query: []
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.searchOption.addFilter.searchInputGroup.forEach(item => {
        const { key, value, range, req, valueReq } = item
        if (range && (range.min || range.max)) {
          if (range.min) {
            data.query.push({
              column: key + 'Min',
              type: 'eq',
              value: range.min
            })
          }
          if (range.max) {
            data.query.push({
              column: key + 'Max',
              type: 'eq',
              value: range.max
            })
          }
          return
        }
        if (valueReq && item[valueReq]) {
          data.query.push({
            column: valueReq,
            type: 'eq',
            value: item[valueReq]
          })
          return
        }
        if (value) {
          if (value instanceof Array) {
            if (key === 'createdTime' || key === 'updatedTime') {
              data.query.push({
                column: key + 'Start',
                type: 'eq',
                value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00'
              })
              data.query.push({
                column: key + 'End',
                type: 'eq',
                value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59'
              })
            }
            if (key === 'yearMon') {
              data.query.push({
                column: key + 'Start',
                type: 'eq',
                value: value[0]
              })
              data.query.push({
                column: key + 'End',
                type: 'eq',
                value: value[1]
              })
            }
            if(key === 'sysLineGroupCode' || key === 'sysLineCode'){
              if (!value.length) return
              data.query.push({
                column: key,
                type: 'in',
                value: value.join(','),
              })
            }
          } else {
            data.query.push({
              column: key,
              value: value,
              type: 'default'
            })
          }
        }
      })

      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      shLienMonListPage(data)
        .then(res => {
          if (res.data.configColumns && res.data.configColumns.length) {
            let columns = res.data.configColumns
            this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
            this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
            this.configColumns = res.data.configColumns
          }
          const datasource = res.data
          this.option1.data = datasource.list
          this.option1.pagination.currPage = datasource.currPage
          this.option1.pagination.pageSize = datasource.pageSize
          this.option1.pagination.totalCount = datasource.totalCount

          this.option1.pagination.hasNextPage = res.data.hasNextPage
          this.option1.pagination.hasPreviousPage = res.data.hasPreviousPage
          this.option1.pagination.isFirstPage = res.data.isFirstPage
          this.option1.pagination.isLastPage = res.data.isLastPage
          this.tableQuery.currPage = res.data.currPage
          this.option1.pagination.total = res.data.totalCount
          this.tableQuery.pageSize = res.data.pageSize
          this.option1.loading = false
        })
        .catch(() => {})
    },
    getListAmtSummary(data) {
      shLienMonGetListAmtSummary(data).then(res => {
        if (res.code === 0 && res.data) {
          let labelObj = {
            restLienAmtListLabel: '剩余留置费用',
            restLossAmtListLabel:"剩余亏损费用",
            totalLienAmtListLabel:"总留置费用",
            totalLossAmtListLabel:"总亏损费用",
          }
          let colorObj = {
            restLienAmtListColor: 'green', // 支持red, green, black三种值
            restLossAmtListColor: 'red',
            totalLienAmtListColor: 'black',
          }
          let data = res.data
          this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
            show: true,
            data,
            labelObj,
            colorObj
          })
        }
      })
    },
    // 分页方法
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    // 分页方法
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    // 跳转月度详情页
    showSummaryDetail(row) {
      Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
        this.commonRoute(to, from)
      }
      const query = {
        shLienMonNo: row.shLienMonNo
      }
      this.routerPush('SummaryBillDetail', query)
    },
    // 表格选择
    sendMulti(data) {
      this.multipleSelection = data
      let data2 = {
				"ascColumns": [],
				"descColumns": [],
				"query": []
			}
			let ids = this.multipleSelection.map(item => {
				return item.shLienMonId
			}).join(',')
			if (ids) {
				data2.query.push({
					"column": "shLienMonId",
					"type": "in",
					"value": ids
        })
			} else {
				data2.query = this.searchBackup || []
			}
			if (data.length || this.option1.listAmtSummary.count++ > 0) {
        this.debounceLs(() => {
          this.getListAmtSummary(data2)
        })
      }
    },
    // 申请付款
    goPaymentRequest() {
      const len = this.multipleSelection.length
      if (!len) {
        return this.$message({
          message: '请勾选需要申请付款的数据',
          type: 'error',
          showClose: true
        })
      }
      if (len === 1) {
        const restLienAmt = this.multipleSelection[0].restLienAmt
        if (!restLienAmt) {
          return this.$message({
            message: '不存在可申请付款的费用，请核实',
            type: 'error',
            showClose: true
          })
        }
      }
      // 筛选留置费用不为0的数据
      const restLienAmtArr = this.multipleSelection.filter(item => {
        return item.restLienAmt > 0
      })
      if (len > 1) {
        // 剩余留置费用不能都为0才能申请付款
        const len2 = restLienAmtArr.length
        if (!len2) {
          return this.$message({
            message: '不存在可申请付款的费用，请核实',
            type: 'error',
            showClose: true
          })
        }
        // 同一付款单位，币种，航线，商务才是一起申请付款
        const {
          settleCorpCode,
          currency,
          sysLineCode,
          employeeId
        } = this.multipleSelection[0]
        const isSame = this.multipleSelection.every(item => {
          return (
            item.settleCorpCode === settleCorpCode &&
            item.currency === currency &&
            item.sysLineCode === sysLineCode &&
            item.employeeId === employeeId
          )
        })
        if (!isSame) {
          return this.$message({
            message: '同一付款单位、币种、航线、商务的数据才能申请一起付款',
            type: 'error',
            showClose: true
          })
        }
      }
      // 锁定数据不允许付款和对冲
      const lockStatus = this.multipleSelection.some(item => {
        return item.lockStatus === 'lock'
      })
      if (lockStatus) {
        return this.$message({
          message: '锁定状态的数据无法进行付款申请，请重新选择',
          type: 'error',
          showClose: true
        })
      }
      // 把所有剩余留置费用不为0的数据ID传递过去
      sessionStorage.setItem('restLienAmtArr', JSON.stringify(restLienAmtArr))
      Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
        this.commonRoute(to, from)
      }
      this.routerPush('PaymentRequest')
    },
    // 申请对冲
    goBlancaLoss() {
      const len = this.multipleSelection.length
      if (!len) {
        return this.$message({
          message: '请勾选需要亏损对冲的数据',
          type: 'error',
          showClose: true
        })
      }
      if (len === 1) {
        const restLossAmt = this.multipleSelection[0].restLossAmt
        if (!restLossAmt) {
          return this.$message({
            message: '不存在可对冲亏损的费用，请核实',
            type: 'error',
            showClose: true
          })
        }
      }
      // 筛选剩余亏损不为0的数据
      const restLossAmtArr = this.multipleSelection.filter(item => {
        return Math.abs(item.restLossAmt) > 0
      })
      if (len > 1) {
        // 剩余剩余亏损不能都为0才能对冲亏损
        const len2 = restLossAmtArr.length
        if (!len2) {
          return this.$message({
            message: '不存在可对冲亏损的费用，请核实',
            type: 'error',
            showClose: true
          })
        }
        // 同一付款单位，币种，航线，商务才是一起对冲亏损
        const {
          settleCorpCode,
          currency,
          sysLineCode,
          employeeId
        } = this.multipleSelection[0]
        const isSame = this.multipleSelection.every(item => {
          return (
            item.settleCorpCode === settleCorpCode &&
            item.currency === currency &&
            item.sysLineCode === sysLineCode &&
            item.employeeId === employeeId
          )
        })
        if (!isSame) {
          return this.$message({
            message: '同一付款单位、币种、航线、商务的数据才能亏损对冲',
            type: 'error',
            showClose: true
          })
        }
      }
      // 锁定状态数据无法进行付款和对冲
      const lockStatus = this.multipleSelection.some(item => {
        return item.lockStatus === 'lock'
      })
      if (lockStatus) {
        return this.$message({
          message: '锁定状态的数据无法进行亏损对冲，请重新选择',
          type: 'error',
          showClose: true
        })
      }
      // 把所有留置费用不为0的数据ID传递过去
      sessionStorage.setItem('restLossAmtArr', JSON.stringify(restLossAmtArr))
      Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
        this.commonRoute(to, from)
      }
      this.routerPush('BalanceLoss')
    },
    // 系统航线下拉列表自动补充的数据
    sysLineQuerySearch(queryString, item) {
      this.$store
        .dispatch('dict/baseSystemLineList', { name: queryString, state: '' })
        .then(data => {
          if (this.remoteSelectCommon(item, data.map(item=>({label:item.value,value:item.key})))) return
          item.remoteSelectList = data.map(item => {
            return {
              label: item.value,
              value: item.key
            }
          })
        })
    },
    // 自定义表头
		handleCustomColumns () {
			this.customColumnsPopShow = true
		},
    // 商务下拉框
    getEmployeeList(queryString, item) {
      employeeSelectlist({ name: queryString }).then(res => {
        item.remoteSelectList = res.data.map(item => {
          return {
            label: item.cname,
            value: item.employeeId
          }
        })
      })
    }
  },
  activated() {
    // 首次进入直接返回，会由搜索组件触发搜索
    if (!this.isFirstActivated) {
      this.isFirstActivated = true
      return
    }
    if (!this.$route.meta.isUseCache) {
      this.getData()
    }
  }
}
</script>

<style lang="sass" scoped>
</style>
