<template>
  <div
    class="finance-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div>
      <FinanceSearch :searchOption="searchOption" @search="search" />
      <div class="finance-search-list-gap"></div>
      <div class="finance-list-container">
        <div class="money-box">
          <div class="money-box-left">
            <el-button-group>
              <el-button
                v-if="checkAuth($route.name, 'btn-add')"
                type="primary"
                class="finance-btn"
                size="mini"
                @click="showPage('add')"
              >{{$t('FinBill.addBill')}}</el-button>
            </el-button-group>
            <!-- <el-button-group>
              <el-button size="mini" @click="checkClickDemo">勾选切换Demo</el-button>
            </el-button-group>-->
            <!-- <el-button-group>
              <el-button class="finance-btn" size="mini" @click="confirmFee">费用确认</el-button>
            </el-button-group>-->
          </div>
          <div class="money-box-right">
            <el-button-group>
              <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('FeeList.refresh')}}</el-button>
            </el-button-group>
          </div>
        </div>
        <FinanceTableMass ref="finBillListTable" :option="option1" @send-multi="sendMulti" />
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
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { listPage, confirmFee } from '@/api/fin/finBill'
import { employeeSelectlist, departmentTreeList } from '@/api/companyResource'
import CustomColumns from '@/components/customColumns/index'

export default {
  name: 'finBillList',
  mixins: [mixin, mixin2, routerMixin],
  components: {
    FinanceTableMass,
    FinanceSearch,
    CustomColumns,
  },
  data() {
    return {
      pageSizeUrl: listPage('geturl'),
      keyDownActive: true,
      // 列表页--表格配置
      option1: {},
      // 列表页--搜索配置
      searchOption: {},
      // 列表页--选中行
      multipleSelection1: [],
      // 列表页--动态组件--当前显示的组件
      currentComponent: '',
      // 传递给详情页的参数 行
      source: '',
      // 返回数据备份
      resData: {},
      employeeOptions: [],
      departmentList: [],
      parentCodes: [],
      // searchOption2: {},
      loading: false,
      checkBool: false,
    }
  },
  computed: {
    compCode() {
      return this.$store.state.user.userInfo.settleCompanyCode
    },
  },
  watch: {
    compCode() {
      this.loanBasicData()
    },
  },
  created() {
    this.searchOption = {
      saveDefault: true,
      // saveShow: true,
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 7,
        searchInputGroup: [
          { key: 'finBillNo', value: '', showType: '1' },
          { key: 'billTypes', value: '', showType: '2' },
          { key: 'settleCompCodes', value: '', showType: '3' },
          { key: 'departCode', value: '', showType: '4' },
          { key: 'createdTime', value: '', showType: '5' },
          { key: 'year', value: '', showType: '6' },
          { key: 'months', value: '', showType: '7' },
        ],
        filterGroups: {
          finBillNo: { label: this.$t('FinBill.finBillNo'), type: 'input', placeholder: this.$t('Settle.multipleTips'), showType: '1' },
          billTypes: { label: this.$t('FinBill.billTypes'), type: 'select', multiple: true, prop: 'finBillBillType', showType: '2' },
          finBillName: { label: this.$t('FinBill.finBillName'), type: 'input', showType: '2' },
          settleCompCodes: {
            label: this.$t('FeeList.settleComp'),
            prop: 'settleCompCode',
            type: 'remoteSelect',
            multiple: true,
            showType: '3',
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            remoteSelectList: [],
          },
          departCode: {
            label: this.$t('FinBill.department'),
            prop: 'departCode',
            type: 'cascader',
            showType: '4',
            cascaderList: this.departmentList,
            cascaderProps: {
              children: 'childList',
              label: 'deptCname',
              value: 'deptCode',
              checkStrictly: true,
            },
          },
          employeeId: {
            label: this.$t('FinBill.employeeName'),
            prop: 'employeeId',
            type: 'remoteSelect',
            showType: '4',
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
            remoteSelectList: [],
          },
          createdTime: { label: this.$t('Settle.creatTime'), type: 'daterange', format: 'yyyy-MM-dd' },
          year: {
            label: this.$t('FinBill.year'),
            type: 'select',
            showType: '6',
            selectOptions: [
              { label: new Date().getFullYear(), value: new Date().getFullYear() + '' },
              { label: new Date().getFullYear() - 1, value: new Date().getFullYear() - 1 + '' },
              { label: new Date().getFullYear() - 2, value: new Date().getFullYear() - 2 + '' },
            ],
          },
          months: {
            label: this.$t('FinBill.months'),
            type: 'select',
            multiple: true,
            showType: '7',
            selectOptions: [
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
          },
        },
      },
    }
    // this.searchOption = this.searchOption2
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.option1 = { ...this.option, id: 'option1', $name: 'FinBillList', pagination,
      // customColumns: { // 接口不支持自定义表头，取消该功能
      //   show: true,
      //   handleCustomColumns: this.handleCustomColumns
      // },
    }
    this.option1.operationBtns.width = 80
    if (!this.checkAuth(this.$route.name, 'btn-detail')) this.option1.operationBtns = false
    this.selfColumnsBase = [ // let columns
      {
        label: this.$t('FinBill.finBillNo'),
        prop: 'finBillNo',
        type: 'button',
        minWidth: 140,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.showDetail(row)
          },
        },
      },
      {
        prop: 'finBillName',
        label: this.$t('FinBill.finBillName'),
        type: 'text',
        minWidth: 150,
      },
      {
        prop: 'billType',
        propInDict: 'finBillBillType',
        label: this.$t('FinBill.billTypes'),
        type: 'select',
        width: 120,
      },
      {
        prop: 'year',
        label: this.$t('FinBill.year'),
        type: 'text',
        width: 80,
      },
      {
        prop: 'month',
        label: this.$t('FinBill.months'),
        type: 'text',
        width: 80,
      },
      // {
      //   prop: 'receiveMap',
      //   label: '应收',
      //   type: 'text',
      //   formatter: (row, pItem) => {
      //     let obj = row[pItem.prop]
      //     let str = ''
      //     for (let i in obj) {
      //       str += ` ${i} ${obj[i]}`
      //     }
      //     return str.trim()
      //   },
      // },
      // {
      //   prop: 'payMap',
      //   label: '应付',
      //   type: 'text',
      //   formatter: (row, pItem) => {
      //     let obj = row[pItem.prop]
      //     let str = ''
      //     for (let i in obj) {
      //       str += ` ${i} ${obj[i]}`
      //     }
      //     return str.trim()
      //   },
      // },
      {
        prop: 'settleCompName', // ownerCompName
        label: this.$t('Settle.branchCompany'),
        type: 'text',
        minWidth: 150,
      },
      {
        prop: 'departName',
        label: this.$t('FinBill.department'),
        type: 'text',
        width: 120,
      },
      {
        prop: 'employeeName',
        label: this.$t('FinBill.employeeName'),
        type: 'text',
        width: 120,
      },
      {
        prop: 'remark',
        label: this.$t('FinBill.remark'),
        type: 'tooltip',
        minWidth: 150,
      },
      {
        prop: 'createdName',
        label: this.$t('FeeList.createdBy'),
        type: 'text',
        width: 120,
      },
      {
        prop: 'createdTime',
        label: this.$t('Settle.creatTime'),
        type: 'text',
        width: 125,
      },
    ]
    this.option1.emptyText = this.$t('FeeList.emptyText')
    // this.option1.columns = columns
    this.option1.columns = [...this.selfColumnsBase]
    // this.getData()
    this.loanBasicData()
    // this.getEmployeeList('')
  },
  methods: {
    // 分页页面数量change   有分页必写此方法
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    // 分页改变当前页   有分页必写此方法
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    // 搜索按钮
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    // 封装请求参数并请求列表
    getData(isSearch) {
      this.loading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
        columns: this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      console.log('data:', data)
      listPage(data)
        .then((res) => {
          this.loading = false
          if (res.code === 0) {
            let { configColumns } = res.data
            this.columns = configColumns.length > 0 ? configColumns : this.selfColumnsBase.map(item => item.prop)
            this.option1.columns = this.columns.map(prop => {
              let obj = this.selfColumnsBase.find(item => item.prop === prop)
              if (obj) {
                return obj
              } else {
                return {}
              }
            })
            let { list } = res.data
            this.option1.data = list
            this.$set(this.option1, 'emptyText', this.$t('FeeList.noData'))
            Object.assign(this.option1.pagination, res.data)
            // this.option1.pagination.currPage = res.data.currPage
            // this.option1.pagination.pageSize = res.data.pageSize
            // this.option1.pagination.totalCount = res.data.totalCount
            this.resData = {
              allColumns: [...new Set(res.data.allColumns)],
              configColumns: [...new Set(res.data.configColumns)],
            }
          }
        })
        .catch((err) => {
          this.loading = false
          console.log(err)
        })
    },
    checkClickDemo() {
      this.checkBool = !this.checkBool
      this.option1.data.forEach((item) => {
        this.$refs.finBillListTable.setCheckRow(item, this.checkBool)
      })
    },
    // table复选框
    sendMulti(data, option) {
      this.multipleSelection1 = data
    },
    // table行详情按钮
    showDetail(row) {
      this.source = row
      this.showPage('detail')
    },
    // 操作按钮 add, detail, finBillGenerateSo
    showPage(type) {
      let name = type === 'add' ? 'FinBillListAdd' : 'FinBillListDetail'
      let query = type === 'add' ? {} : { finBillNo: this.source.finBillNo }
      this.routerPush(name, query)
    },
    // 费用确认
    confirmFee() {
      this.validateRow('confirmFee')
    },
    // 判断是否选择了费用项
    validateRow(type) {
      let len = this.multipleSelection1.length
      if (len !== 1) {
        let message = len ? this.$t('FinBill.expenseSingle') : this.$t('FinBill.expenseTips')
        return this.$message({
          message,
          type: 'error',
          showClose: true,
        })
      }
      let obj = {
        confirmFee: {
          confirm: this.$t('FinBill.confirmFee'),
          message: this.$t('FinBill.confirmFeeSuc'),
          method: confirmFee,
        },
      }
      if (this.multipleSelection1[0].feeConfirmStatus === 'yes') {
        this.$refs.finBillListTable.handleTableClearSelection()
        return this.$message.warning(this.$t('FinBill.repeatTips'))
      }
      this.$confirm(obj[type].confirm, this.$t('Common.warning'), {
        confirmButtonText: this.$t('FeeList.sure'),
        cancelButtonText: this.$t('FeeList.cancel'),
        lockScroll: 'true',
        type: 'warning',
      })
        .then((res) => {
          obj[type].method({ finBillId: this.multipleSelection1[0].finBillId }).then((res) => {
            this.$message({
              message: obj[type].message,
              type: 'success',
              showClose: true,
            })
            this.getData()
          })
        })
        .catch(function () {})
    },
    // 所属员工下拉框
    getEmployeeList(queryString, item) {
      // employeeSelectlist({ name: queryString, deptCodes: this.compCode }).then((res) => {
      employeeSelectlist({ name: queryString, status: 'all' }).then((res) => {
        if (
          this.remoteSelectCommon(
            item,
            res.data.map((item) => ({ label: `${item.cname} (${item.employeeNo})`, value: item.employeeId }))
          )
        )
          return
        let list = res.data.map((item) => ({ ...item, label: `${item.cname} (${item.employeeNo})`, value: item.employeeId }))
        this.employeeOptions.splice(0, 1000, ...list)
        // console.log(this.employeeOptions)
      })
    },
    // 所属部门下拉框
    loanBasicData() {
      departmentTreeList({ state: 'valid' }).then((res) => {
        let arr = []
        let getNode = (node) =>
          node.forEach((item) => {
            // if (arr.length) return
            if(item.deptCode === this.compCode || item.settleCompanyCode === this.compCode  ) {
              arr.push(item)
              return
            }
            item.childList && getNode(item.childList)
          })
        getNode(res.data || [])
        this.departmentList.splice(0, 1000, ...this.getTreeData(arr))
      })
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      data.forEach((item) => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
      return data
    },
  },
}
</script>