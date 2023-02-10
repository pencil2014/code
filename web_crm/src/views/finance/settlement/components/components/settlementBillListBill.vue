<template>
  <div class="finance-list-container">
    <FinanceSearch :searchOption="searchOption1" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="money-box">
      <div class="money-box-left">
        <el-button-group v-if="checkAuth($route.name, 'tab-bill', 'btn-customerConfirm')">
          <el-button class="finance-btn" @click="customerConfirm" size="mini" type="primary">客户确认</el-button>
        </el-button-group>
        <el-button-group v-if="checkAuth($route.name, 'tab-bill', 'btn-invoiceConfirmYes')">
          <el-button
            class="finance-btn"
            @click="invoiceConfirm('yes')"
            size="mini"
            type="success"
          >确认开票</el-button>
        </el-button-group>
        <el-button-group v-if="checkAuth($route.name, 'tab-bill', 'btn-invoiceConfirmNo')">
          <el-button
            class="finance-btn"
            @click="invoiceConfirm('no')"
            size="mini"
            type="danger"
          >确认不开票</el-button>
        </el-button-group>
      </div>
      <div class="money-box-right">
        <el-button-group>
          <el-button v-if="checkAuth($route.name, 'tab-bill', 'btn-batchPrintBill')" class="finance-btn" @click="batchPrintBill" size="mini" type="primary">打印账单</el-button>
        </el-button-group>
        <el-button-group>
          <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
        </el-button-group>
      </div>
    </div>
    <FinanceTable :option="option1" @send-multi="sendMulti" />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mapGetters } from 'vuex'
import { billListPage } from '@/api/fin/settleOrderBill'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { customerConfirm, invoiceConfirm } from '@/api/fin/bill'
import { departmentTreeList } from '@/api/companyResource'

export default {
  mixins: [mixin, routerMixin],
  data() {
    return {
      searchOption1: {},
      option1: {},
      multipleSelection1: [],
      orderNo: '',
      orderBillId: '',
      settleOrderNo: '',
      cTimestamp: 0,
    }
  },
  created() {
    this.cTimestamp = new Date().getTime()
    this.searchOption1 = {
      saveDefault: true,
      saveName: 'settlementBillListBill',
      // saveShow: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 9,
        searchInputGroup: [
          { key: 'orderNo', value: '' },
          { key: 'createdDate', value: '' },
          { key: 'orderBillNo', value: '' },
          { key: 'dnNo', value: '' },
          { key: 'settleCorpName', value: '' },
          { key: 'confirmStatus', value: '' },
          { key: 'status', value: '' },
          { key: 'bdEmployeeId', value: '' },
          { key: 'opEmployeeId', value: '' },
        ],
        filterGroups: {
          orderNo: { label: '单号', type: 'input' },
          createdDate: { label: '生成日期', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['beginDate', 'endDate'] },
          orderBillNo: { label: '系统账单编号', type: 'input' },
          dnNo: { label: '账单号', type: 'input' },
          settleCorpName: {
            label: '结算单位',
            type: 'autocomplete',
            querySearch: (queryString, cb) => {
              this.querySettleUnit({ queryString, unitTypes: 'customer,supplier' }, cb)
            },
            select: (optionItem, row) => {
              let find = this.searchOption1.addFilter.searchInputGroup.find((item) => {
                return item.key === 'settleCorpName'
              })
              find.columnReq = 'settleCorpCode'
              find.settleCorpCode = optionItem.key
            },
          },
          confirmStatus: {
            label: '确认状态',
            type: 'select',
            selectOptions: [
              { label: '已确认', value: 'yes' },
              { label: '未确认', value: 'no' },
            ],
          },
          status: { label: '是否有效', type: 'select', prop: 'yesNo' },
          bdEmployeeId: {
            label: '业务员',
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          bdDeptCode: {
            label: '业务员所属部门',
            prop: 'bdDeptCode',
            type: 'diyCascader',
            cascaderList: this.departmentList,
            cascaderProps: {
              children: 'childList',
              label: 'deptCname',
              value: 'deptCode',
              checkStrictly: true,
            },
          },
          opEmployeeId: {
            label: '操作',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          opDeptCode: {
            label: '操作所属部门',
            prop: 'opDeptCode',
            type: 'diyCascader',
            cascaderList: this.departmentList,
            cascaderProps: {
              children: 'childList',
              label: 'deptCname',
              value: 'deptCode',
              checkStrictly: true,
            },
          },
          createdBy: {
            label: '生成人',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
        },
      },
    }
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      $name: 'SettlementBillListBill',
      data: [],
      tips: { text: '', show: false },
      operationBtns: Object.assign({}, this.option.operationBtns, {
        data: [{ label: '详情', type: 'text', show: true, action: 'showDetail' }],
        show: true,
      }),
      pagination: Object.assign({}, this.option.pagination, { show: true, isNew: true }),
    })

    this.option1.columns = [
      {
        prop: '',
        label: '',
        type: 'tag',
        width: 30,
        resizable: false,
        formatter: ({ feeChange }) => {
          if (feeChange) {
            return [{ text: '改', type: 'change' }]
          } else {
            return []
          }
        },
      },
      {
        prop: 'orderBillNo',
        label: '系统账单编号',
        type: 'button',
        width: 130,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.showDetail(row)
          },
        },
      },
      {
        prop: 'orderNo',
        label: '单号',
        type: 'button',
        width: 130,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.showOneNoDetail('order', row.orderNo)
          },
        },
      },
      {
        prop: 'dnNo',
        label: '账单号',
        type: 'text',
        width: 125,
        headerSign: { text: 'DN号、CN号的统称' },
      },
      { prop: 'createdTime', label: '生成日期', type: 'text', width: 125 },
      {
        prop: 'confirmStatus',
        label: '确认状态',
        type: 'text',
        formatter: ({ cellValue }) => {
          if (cellValue === 'yes') {
            return '<span style="color:#33B18A;">已确认</span>'
          } else if (cellValue === 'no') {
            return '<span style="color:#CD4130;">未确认</span>'
          }
        },
      },
      { prop: 'settleCorpName', label: '结算单位', type: 'text', width: 160 },
      { prop: 'receive', label: '应收金额', type: 'text', width: 102,
        formatter: ({ row }) => {
          if (row.money.receive) {
            let keys = Object.keys(row.money.receive)
            let str = ''
            for (let key in row.money.receive) {
              str += (key + row.money.receive[key] + ' ')
            }
            return str
          }
        }
      },
      { prop: 'pay', label: '应付金额', type: 'text', width: 102,
        formatter: ({ row }) => {
          if (row.money.pay) {
            let keys = Object.keys(row.money.pay)
            let str = ''
            for (let key in row.money.pay) {
              str += (key + row.money.pay[key] + ' ')
            }
            return str
          }
        }
      },
      {
        prop: 'settleOrderNo',
        label: '结算单号',
        type: 'columnTip',
        width: 130,
        component: 'ColumnTip',
        componentProps: {
          show: false,
          data: [],
          callback: (no, componentProps) => {
            this.showColumnDetail({ type: 'settleOrderNos', no, componentProps })
          },
        },
      },
      { prop: 'feeChange', label: '是否有效', type: 'text', prop: 'yesNo' },
      { prop: 'bdEmployeeName', label: '业务员', type: 'text', width: 90 },
      { prop: 'bdDeptName', label: '业务员所属部门', type: 'text', width: 100 },
      { prop: 'opEmployeeName', label: '操作', type: 'text', width: 90 },
      { prop: 'opDeptName', label: '操作所属部门', type: 'text', width: 100 },
      { prop: 'createdName', label: '生成人', type: 'text', width: 90 },
    ]
  },
  methods: {
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    getData(isSearch) {
      // 第二次以后进来重新获取一下，该页面兼具列表页和详情页双重特点
      console.log('route.query:', this.$route.query)
      this.settleOrderId = this.$route.query.settleOrderId
      this.settleOrderNo = this.$route.query.settleOrderNo
      let option = this.option1
      let data = {
        currPage: option.pagination.currPage,
        pageSize: option.pagination.pageSize,
        query: [],
      }
      this.finCommonSearch(data.query, this.searchOption1, true)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = [...(this.searchBackup || [])]
      data.query.push({ column: 'settleOrderNo', type: 'eq', value: this.settleOrderNo }) // settleOrderId

      // console.log('data:', data)
      billListPage(data).then((res) => {
        if (res.code === 0) {
          let { list } = res.data
          list.forEach((item) => (item._isChanged = item.feeChange))
          option.data = list
          Object.assign(this.option1.pagination, res.data)
          // option.pagination.currPage = res.data.currPage
          // option.pagination.pageSize = res.data.pageSize
          // option.pagination.totalCount = res.data.totalCount
          // console.log(this.option1)
        }
      })
    },
    batchPrintBill() {
      if (this.multipleSelection1.length === 0) {
        return this.$message({
          message: '请勾选批量打印的账单',
          type: 'error',
          showClose: true,
        })
      }
      let orderBillIds = this.multipleSelection1.map(item => {
        return item.orderBillId
      })
      this.routerPush('BatchBillDetail', { orderBillIds: orderBillIds.join(',') }, { isTab: true })
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    sendMulti(data, option) {
      this.multipleSelection1 = data
    },
    showDetail(row) {
      this.routerPushTab('BillDetail', { source: 'billListPage', billId: row.orderBillId })
    },
    customerConfirm() {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose('请勾选需要确认的账单！')
      }
      let arr = []
      this.multipleSelection1.forEach((item) => {
        let data = { billId: item.orderBillId, confirmStatus: 'yes' }
        arr.push(customerConfirm(data))
      })
      Promise.all(arr).then((res) => {
        this.$msgSucClose('确认账单成功！')
        this.getData()
      })
    },
    invoiceConfirm(val) {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose('请勾选确认是否开票的账单！')
      }
      let data = { billIds: this.multipleSelection1.map((item) => item.orderBillId), isIssueInvoice: val }
      invoiceConfirm(data).then((res) => {
        if (res.data.allFinish) {
          this.$msgSucClose(`确认${val === 'yes' ? '开票' : '不开票'}成功！`)
        } else {
          this.$msgSucClose(`确认${val === 'yes' ? '开票' : '不开票'}成功，已过滤不可开票费用！`)
        }
        this.getData()
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
  },
  components: {
    FinanceTable,
    FinanceSearch,
  },
  computed: {
    ...mapGetters(['dictMap']),
  },
  activated() {
    if (!this.isNotFirstIn) {
      this.isNotFirstIn = true
    } else {
      this.getData()
    }
  },
}
</script>
<style lang="scss" scoped>
.finance-list-container ::v-deep .finance-search-form {
  margin-top: 0;
}
</style>