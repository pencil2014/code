<template>
  <div
    v-loading="loading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground"
  >
    <div>
      <FinanceSearch :searchOption="searchOption1" @search="search" />
      <div class="finance-search-list-gap"></div>
      <div class="finance-list-container">
        <div class="money-box">
          <div class="money-box-left">
            <el-button-group>
              <el-button v-if="checkAuth($route.name, 'btn-customerConfirm')" class="finance-btn" @click="customerConfirm" size="mini" type="primary">{{$t('OrderFee.customerConfirm')}}</el-button>
            </el-button-group>
            <!-- <el-button-group>
              <el-button v-if="checkAuth($route.name, 'btn-invoiceConfirm')" class="finance-btn" @click="invoiceConfirm('yes')" size="mini" type="success">确认开票</el-button>
            </el-button-group>
            <el-button-group>
              <el-button v-if="checkAuth($route.name, 'btn-invoiceConfirmNot')" class="finance-btn" @click="invoiceConfirm('no')" size="mini" type="danger">确认不开票</el-button>
            </el-button-group> -->
            <el-button-group>
              <el-button v-if="checkAuth($route.name, 'btn-createSettlement')" class="finance-btn" @click="createSettlement" size="mini">{{$t('OrderFee.createSettlement')}}</el-button>
            </el-button-group>
          </div>
          <div class="money-box-right">
            <el-button
              class="finance-btn"
              @click="refreshListPage"
              size="mini"
              type="primary"
            >{{$t('OrderFee.refresh')}}</el-button>
          </div>
        </div>
        <FinanceTable ref="tablex01" :option="option1" @send-multi="sendMulti" />
      </div>
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{key:'prop',label:'label'}"
        @close="customColumnsPopClose"
      />
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mapState } from 'vuex'
import { billList, customerConfirm, listPage, invoiceConfirm, getListAmtSummary } from '@/api/fin/bill'
import { dateFormat } from '@/views/finance/utils/finance'
import { departmentTreeList } from '@/api/companyResource'
import CustomColumns from '@/components/customColumns/index'

export default {
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      pageSizeUrl: billList('geturl'),
      keyDownActive: true,
      option1: {},
      searchOption1: {},
      table1DataBackup: [],
      multipleSelection1: [],
      multipleSelection2: [],
      orderBillId: '',
      source: 'createSettlement',
      loading: false,
      departmentList: [],
    }
  },
  created() {
    // // demo
    // console.log(this.$t('dict.witeoffSubType.money_receive_writeoff'))
    this.searchOption1 = {
      saveDefault: true,
      // saveShow: true,
      saveName: 'orderBillList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 9,
        searchInputGroup: [
          { key: 'orderBillNo', value: '', showType: '3' },
          { key: 'orderNo', value: '', showType: '1' },
          { key: 'dnNo', value: '', showType: '3' },
          { key: 'createdDate', value: '', showType: '2' },
          { key: 'confirmStatus', value: '', showType: '5' },
          { key: 'settleCorpName', value: '', showType: '4' },
          { key: 'settleOrderNo', value: '', showType: '1' },
          { key: 'status', value: '', showType: '6' },
          { key: 'bdEmployeeId', value: '', showType: '7' },
          { key: 'opEmployeeId', value: '', showType: '8' },
        ],
        filterGroups: {
          orderBillNo: { label: this.$t('OrderFee.orderBillNo'), type: 'input', showType: '3' }, // '系统账单编号'
          orderNo: { label: this.$t('OrderFee.orderNo'), type: 'input', showType: '1' }, // '单号'
          dnNo: { label: this.$t('OrderFee.billNo'), type: 'input', showType: '3' }, // '账单号'
          createdDate: { label: this.$t('BillList.generattime'), type: 'daterange', showType: '2' }, // '生成日期' // this.$t('OrderFee.createdDate')
          confirmStatus: { label: this.$t('OrderFee.confirmStatus'), type: 'select', showType: '5', // '确认状态'
            selectOptions: [
              { label: this.$t('BillList.confirmed'), value: 'yes' }, // '已确认'
              { label: this.$t('BillList.unconfirmed'), value: 'no' } // '未确认'
            ]
          },
          settleCorpName: { label: this.$t('OrderFee.settleCorpName'), type: 'autocomplete', showType: '4', // '结算单位'
            querySearch: (queryString, cb) => {
              this.querySettleUnit(
                {
                  queryString,
                  unitTypes: 'customer,supplier',
                },
                cb
              )
            },
            select: (optionItem, row) => {
              let find = this.searchOption1.addFilter.searchInputGroup.find(item => {
                return item.key === 'settleCorpName'
              })
              find.columnReq = 'settleCorpCode'
              find.settleCorpCode = optionItem.key
            },
          },
          settleOrderNo: { label: this.$t('OrderFee.settleOrderNo'), type: 'input', showType: '1' }, // '结算单号'
          status: { label: this.$t('OrderFee.effectiveStatus'), type: 'select', showType: '6', // '是否有效'
            selectOptions: [
              { label: this.$t('OrderFee.yes'), value: 'yes'}, // '是'
              { label: this.$t('OrderFee.no'), value: 'no' } // '否'
            ]
          },
          bdEmployeeId: {
            label: this.$t('OrderFee.salesperson'), // '销售'
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          bdDeptCode: { label: this.$t('OrderFee.salesDepartment'), prop: 'bdDeptCode', type: 'diyCascader', cascaderList: this.departmentList, // '销售所属部门'
            cascaderProps: {
              children: 'childList',
              label: 'deptCname',
              value: 'deptCode',
              checkStrictly: true,
            },
          },
          opEmployeeId: {
            label: this.$t('OrderFee.operationStaff'), // '操作'
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          opDeptCode: { label: this.$t('OrderFee.opDepartment'), prop: 'opDeptCode', type: 'diyCascader', cascaderList: this.departmentList, // '操作所属部门'
            cascaderProps: {
              children: 'childList',
              label: 'deptCname',
              value: 'deptCode',
              checkStrictly: true,
            },
          },
          createdBy: {
            label: this.$t('OrderFee.createdName'), // '生成人'
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
        }
      }
    }
    let operationBtns = Object.assign(this.option.operationBtns, {
      data: [
        {
          label: this.$t('OrderFee.detail'), // '详情',
          type: 'text',
          // show: true,
          showFn: () => this.checkAuth(this.$route.name, 'btn-showDetail'), // 账单列表的操作-详情共用了账单详情的模块编码
          action: 'showDetail',
        },
      ],
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true, isNew: true,
    })
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'BillList',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      operationBtns,
      pagination,
      listAmtSummary,
      customColumns: {
        show: true,
        handleCustomColumns: this.handleCustomColumns
      },
      emptyText: this.$t('OrderFee.showAfterQuery'), // '数据将在查询后显示',
    })
    this.selfColumnsBase = [ // let columns
      {
        prop: 'orderBillNo',
        label: this.$t('OrderFee.orderBillNo'), // '系统账单编号',
        type: 'button',
        width: 138,
        operationBtns: {
          show: true,
          callback: (action, index, row, option) => {
            this.showDetail(row)
          },
        },
        hasTag: true
      },
      {
        prop: 'orderNo',
        label: this.$t('OrderFee.orderNo'), // '单号',
        type: 'button',
        width: 130,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.showOneNoDetail('order', row.orderNo, { isTab: true })
          },
        },
      },
      {
        prop: 'dnNo',
        label: this.$t('OrderFee.billNo'), // '账单号',
        type: 'text',
        width: 125,
        headerSign: {
          text: this.$t('OrderFee.DNOrCN'), // 'DN号、CN号的统称'
        }
      },
      {
        prop: 'createdTime',
        label: this.$t('BillList.generattime'), // '生成日期', // this.$t('OrderFee.createdTime')
        type: 'text',
        width: 125
      },
      {
        prop: 'confirmStatus',
        label: this.$t('OrderFee.confirmStatus'), // '确认状态',
        type: 'text',
        formatter: ({cellValue}) => {
          if (cellValue === 'yes') {
            return `<span style="color:#33B18A;">${this.$t('BillList.confirmed')}</span>`
          } else if (cellValue === 'no') {
            return `<span style="color:#CD4130;">${this.$t('BillList.unconfirmed')}</span>`
          }
        },
        width: 110,
      },
      {
        prop: 'settleCorpName',
        label: this.$t('OrderFee.settleCorpName'), // '结算单位',
        type: 'text',
        width: 160
      },
      {
        prop: 'receive',
        label: this.$t('OrderFee.amtReceive'), // '应收金额',
        type: 'text',
        width: 120
      },
      {
        prop: 'pay',
        label: this.$t('OrderFee.amtPay'), // '应付金额',
        type: 'text',
        width: 120
      },
      {
        prop: 'settleOrderNo',
        label: this.$t('OrderFee.settleOrderNo'), // '结算单号',
        type: 'columnTip',
        width: 130,
        component: 'ColumnTip',
        componentProps: {
          show: false,
          data: [],
          callback: (no, componentProps) => {
            this.showColumnDetail({
              type: 'settleOrderNos',
              no,
              componentProps
            })
          }
        }
      },
      {
        prop: 'feeChange',
        label: this.$t('OrderFee.effectiveStatus'), // '是否有效',
        type: 'text',
        formatter: ({cellValue}) => {
          if (!cellValue) {
            return this.$t('OrderFee.yes')
          } else if (cellValue) {
            return this.$t('OrderFee.no')
          }
        },
        width: 110
      },
      {
        prop: 'bdEmployeeName',
        label: this.$t('OrderFee.salesperson'), // '销售',
        type: 'text',
        width: 120
      },
      {
        prop: 'bdDeptName',
        label: this.$t('OrderFee.salesDepartment'), // '销售所属部门',
        type: 'text',
        width: 120
      },
      {
        prop: 'opEmployeeName',
        label: this.$t('OrderFee.operationStaff'), // '操作',
        type: 'text',
        width: 120
      },
      {
        prop: 'opDeptName',
        label: this.$t('OrderFee.opDepartment'), // '操作所属部门',
        type: 'text',
        width: 120
      },
      {
        prop: 'createdName',
        label: this.$t('BillList.genpeople'), // '生成人', // this.$t('OrderFee.createdName')
        type: 'text',
        width: 120
      },
    ]
    this.columns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.option1.columns = [
      // {
      //   prop: '',
      //   label: '',
      //   type: 'tag',
      //   width: 30,
      //   resizable: false,
      //   formatter: ({ feeChange }) => {
      //     if (feeChange) {
      //       return [{ text: '改', type: 'change' }]
      //     } else {
      //       return []
      //     }
      //   }
      // },
      ...this.selfColumnsBase
    ] // columns
    this.loanBasicData()
  },
  methods: {
    querySettleUnit(queryString, cb) {
      this.$store.dispatch('dict/querySettleUnit', queryString).then((data) => {
        cb(data)
      })
    },
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    getData(isSearch) {
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
        columns: this.customColumnsKeys
      }
      this.searchOption1.addFilter.searchInputGroup.forEach(item => {
        let { key, value, columnReq } = item
        if (columnReq && item[columnReq]) {
          data.query.push({
            column: columnReq,
            type: 'eq',
            value: item[columnReq]
          })
        } else if (value) {
          if (key === 'createdDate') {
            data.query.push({
              column: 'beginDate',
              type: 'eq',
              value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00',
            })
            data.query.push({
              column: 'endDate',
              type: 'eq',
              value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59',
            })
          } else if (key === 'bdDeptCode' || key === 'opDeptCode') {
            data.query.push({
              column: key,
              type: 'eq',
              value: value[value.length - 1],
            })
          } else {
            data.query.push({
              column: key,
              type: 'eq',
              value: value
            })
          }
        }
      })
      if(isSearch){
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      this.loading = true
      listPage(data).then((res) => {
        if (res.code === 0) {
          let { configColumns } = res.data
          this.columns = configColumns.length > 0 ? configColumns : this.selfColumnsBase.map(item => item.prop)
          // this.columns = [...this.columns]
          this.option1.columns = this.columns.map(prop => {
            let obj = this.selfColumnsBase.find(item => item.prop === prop)
            if (obj) {
              return obj
            } else {
              return {}
            }
          })
          // this.option1.columns.unshift({
          //   prop: '',
          //   label: '',
          //   type: 'tag',
          //   width: 30,
          //   resizable: false,
          //   formatter: ({ feeChange }) => {
          //     if (feeChange) {
          //       return [{ text: '改', type: 'change' }]
          //     } else {
          //       return []
          //     }
          //   }
          // })
          let { list } = res.data
          let data = []
          list.forEach((item) => {
            if (item.money && item.money.receive) {
              let keys1 = Object.keys(item.money.receive)
              let receive = keys1.reduce((str, cur, index) => {
                if (index === 0) {
                  return str + cur + item.money.receive[cur]
                } else {
                  return str + ' ' + cur + item.money.receive[cur] // &nbsp;&nbsp;
                }
              }, '')
              item.receive = receive
            }
            if (item.money && item.money.pay) {
              let keys2 = Object.keys(item.money.pay)
              let pay = keys2.reduce((str, cur, index) => {
                if (index === 0) {
                  return str + cur + item.money.pay[cur]
                } else {
                  return str + ' ' + cur + item.money.pay[cur] // &nbsp;&nbsp;
                }
              }, '')
              item.pay = pay
            }
            item.settleOrderNo_multiValue = item.settleOrderNo.split(',')
            item._isChanged = item.feeChange
            if (item.feeChange) {
              item._tagArr = [
                {
                  type: 'change',
                  text: this.$t('OrderFee.modifySimple'), // '改'
                }
              ]
            }
            data.push(item)
          })
          this.option1.data = data
          this.table1DataBackup = [...this.option1.data]
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = res.data.currPage
          // this.option1.pagination.pageSize = res.data.pageSize
          // this.option1.pagination.totalCount = res.data.totalCount
        }
      }).finally(() => {
        this.loading = false
      })
    },
    getListAmtSummary(data) {
      getListAmtSummary(data).then((res) => {
        if (res.code === 0 && res.data) {
          let data = {
            recAmtList: [],
            payAmtList: [],
          }
          data = Object.assign(data, res.data)
          let labelObj = {
            recAmtListLabel: this.$t('OrderFee.settleAmtRec'), // '应收结算金额',
            payAmtListLabel: this.$t('OrderFee.settleAmtPay'), // '应付结算金额',
          }
          let colorObj = {
            recAmtListColor: 'red', // 支持red, green, black三种值
            payAmtListColor: 'green',
          }
          this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
            show: true,
            data,
            labelObj,
            colorObj,
          })
        }
      })
    },
    // 部门下拉框
    loanBasicData() {
      departmentTreeList({ state: 'valid' }).then((res) => {
				this.departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))
      })
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      data.forEach((item) => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
      return data
    },
    invoiceConfirm(val) { // 海外版不显示
      // return this.$refs.tablex01.setCheckRow(this.option1.data[1], true)
      if (this.multipleSelection1.length === 0) {
        this.$message({
          message: this.$t('OrderFee.selectRow'), // '请勾选确认是否开票的账单！',
          type: 'error',
          showClose: true,
        })
        return
      }
      let data = {
        billIds: this.multipleSelection1.map((item) => {
          return item.orderBillId
        }),
        isIssueInvoice: val,
      }
      invoiceConfirm(data).then((res) => {
        if (res.code === 0) {
          if (res.data.allFinish) {
            this.$message({
              message: `确认${val === 'yes' ? '开票' : '不开票'}成功！`,
              type: 'success',
              showClose: true
            })
          } else {
            this.$message({
              message: `确认${val === 'yes' ? '开票' : '不开票'}成功，已过滤不可开票费用！`,
              type: 'success',
              showClose: true
            })
          }
          this.getData()
        }
      })
    },
    customerConfirm() {
      if (this.multipleSelection1.length === 0) {
        this.$message({
          message: this.$t('OrderFee.selectRow'), // '请勾选需要确认的账单！',
          type: 'error',
          showClose: true,
        })
        return
      }
      let arr = []
      this.multipleSelection1.forEach((item) => {
        let data = {
          billId: item.orderBillId,
          confirmStatus: 'yes',
        }
        arr.push(customerConfirm(data))
      })
      Promise.all(arr).then((res) => {
        this.$message({
          message: this.$t('OrderFee.successOp'), // '确认账单成功！',
          type: 'success',
          showClose: true,
        })
        this.getData()
      })
    },
    showDetail(row) {
      this.routerPush('BillDetail', { source: 'billListPage', billId: row.orderBillId }, { isTab: true })
    },
    showColumnDetail(params) {
      this.showColumnDetailHandle(params, { isTab: true })
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    createSettlement() {
      if (this.multipleSelection1.length === 0) {
        this.$message({
          message: this.$t('OrderFee.selectRow'), // '请勾选需要生成结算单的账单！',
          type: 'error',
          showClose: true,
        })
        return
      }
      if (this.multipleSelection1.length > 1) {
        this.$message({
          message: this.$t('OrderFee.selectOneRow'), // '只能勾选一个账单！',
          type: 'error',
          showClose: true,
        })
        return
      }
      this.routerPush('CreateSettlement', { source: 'createSettlementFromBill', billId: this.multipleSelection1[0].orderBillId }, { isTab: true })
    },
    sendMulti(data, option) {
      // console.log(data, option)
      if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option2) this.multipleSelection2 = data

      let data2 = {
        ascColumns: [],
        descColumns: [],
        query: [],
      }
      let ids = this.multipleSelection1
        .map((item) => {
          return item.orderBillId
        })
        .join(',')
      if (ids) {
        data2.query.push({
          column: 'orderBillIds',
          type: 'eq',
          value: ids,
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
  },
  components: {
    FinanceTable,
    FinanceSearch,
    CustomColumns,
  }
}
</script>
<style>
</style>