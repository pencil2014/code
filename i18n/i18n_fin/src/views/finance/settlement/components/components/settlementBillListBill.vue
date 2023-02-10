<template>
  <div class="finance-list-container">
    <FinanceSearch :searchOption="searchOption1" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="money-box">
      <div class="money-box-left">
        <el-button-group v-if="checkAuth($route.name, 'tab-bill', 'btn-customerConfirm')">
          <el-button class="finance-btn" @click="customerConfirm" size="mini" type="primary">{{$t('BillList.customerConfirm')}}</el-button>
        </el-button-group>
        <!-- <el-button-group v-if="checkAuth($route.name, 'tab-bill', 'btn-invoiceConfirmYes')">
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
        </el-button-group> -->
      </div>
      <div class="money-box-right">
        <el-button-group>
          <el-button v-if="checkAuth($route.name, 'tab-bill', 'btn-batchPrintBill')" class="finance-btn" @click="batchPrintBill" size="mini" type="primary">{{$t('BillList.printBill')}}</el-button>
        </el-button-group>
        <el-button-group>
          <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
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
          orderNo: { label: this.$t('PreClose.bizNo'), type: 'input' },
          createdDate: { label: this.$t('BillList.generattime'), type: 'daterange', format: 'yyyy-MM-dd', ranges: ['beginDate', 'endDate'] },
          orderBillNo: { label: this.$t('FeeList.billNo'), type: 'input' },
          dnNo: { label: this.$t('FeeList.dnNo'), type: 'input' },
          settleCorpName: {
            label: this.$t('FeeList.settleCorp'),
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
            label: this.$t('OrderFee.confirmStatus'),
            type: 'select',
            selectOptions: [
              { label: this.$t('BillList.confirmed'), value: 'yes' },
              { label: this.$t('BillList.unconfirmed'), value: 'no' },
            ],
          },
          status: { label: this.$t('OrderFee.effectiveStatus'), type: 'select', prop: 'yesNo' },
          bdEmployeeId: {
            label: this.$t('OrderFee.salesperson'),
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          bdDeptCode: {
            label: this.$t('OrderFee.salesDepart'),
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
            label: this.$t('PreClose.operators'),
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          opDeptCode: {
            label: this.$t('PreClose.opDeptName'),
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
            label: this.$t('BillList.genpeople'),
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
        data: [{ label: this.$t('Common.details'), type: 'text', show: true, action: 'showDetail' }],
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
        label: this.$t('FeeList.billNo'),
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
        label: this.$t('PreClose.bizNo'),
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
        label: this.$t('FeeList.dnNo'),
        type: 'text',
        width: 125,
        headerSign: { text: this.$t('BillList.collective') },
      },
      { prop: 'createdTime', label: this.$t('BillList.generattime'), type: 'text', width: 125 },
      {
        prop: 'confirmStatus',
        label: this.$t('OrderFee.confirmStatus'),
        type: 'text',
        formatter: ({ cellValue }) => {
          if (cellValue === 'yes') {
            return `<span style="color:#33B18A;">${this.$t('Common.confirmed')}</span>`
          } else if (cellValue === 'no') {
            return `<span style="color:#CD4130;">${this.$t('Common.unconfirmed')}</span>`
          }
        },
      },
      { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', width: 160 },
      { prop: 'receive', label: this.$t('FeeList.recFeeAmt'), type: 'text', width: 102,
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
      { prop: 'pay', label: this.$t('FeeList.payFeeAmt'), type: 'text', width: 102,
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
        label: this.$t('FeeList.settleOrderNo'),
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
      { prop: 'feeChange', label: this.$t('OrderFee.effectiveStatus'), type: 'text', prop: 'yesNo' },
      { prop: 'bdEmployeeName', label: this.$t('PreClose.salesman'), type: 'text', width: 90 },
      { prop: 'bdDeptName', label: this.$t('BillList.salesDepart'), type: 'text', width: 100 },
      { prop: 'opEmployeeName', label: this.$t('PreClose.operators'), type: 'text', width: 90 },
      { prop: 'opDeptName', label: this.$t('PreClose.opDeptName'), type: 'text', width: 100 },
      { prop: 'createdName', label: this.$t('BillList.genpeople'), type: 'text', width: 90 },
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
          message: this.$t('BillList.batchprint'),
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
        return this.$msgErrClose(this.$t('FeeList.billTips'))
      }
      let arr = []
      this.multipleSelection1.forEach((item) => {
        let data = { billId: item.orderBillId, confirmStatus: 'yes' }
        arr.push(customerConfirm(data))
      })
      Promise.all(arr).then((res) => {
        this.$msgSucClose(this.$t('BillList.confirmbill'))
        this.getData()
      })
    },
    invoiceConfirm(val) {
      // if (this.multipleSelection1.length === 0) {
      //   return this.$msgErrClose('请勾选确认是否开票的账单！')
      // }
      // let data = { billIds: this.multipleSelection1.map((item) => item.orderBillId), isIssueInvoice: val }
      // invoiceConfirm(data).then((res) => {
      //   if (res.data.allFinish) {
      //     this.$msgSucClose(`确认${val === 'yes' ? '开票' : '不开票'}成功！`)
      //   } else {
      //     this.$msgSucClose(`确认${val === 'yes' ? '开票' : '不开票'}成功，已过滤不可开票费用！`)
      //   }
      //   this.getData()
      // })
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