<template>
  <div
    class="si-list finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch
      :searchOption="searchOption1"
      @search="search"
      :border="true"
    />
    <div class="finance-list-container">
      <div class="money-box">
        <el-button type="primary" size="mini" @click="add">新增</el-button>
      </div>
      <FinanceTableMass :option="option1" :autoMax="true" />
     </div>
     <AddSi v-if="addOption.show" :option="addOption" />
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { baseShippingCarrierList } from '@/api/base'
import { getSiInfoList, startSiTask, cancelSiTask, deleteSiInfo } from '@/api/order/robotSi'
import { getDictLabel } from '@/utils/tools'
import AddSi from './add'
export default {
  components: {
    FinanceSearch,
    FinanceTableMass,
    AddSi
  },
  mixins: [mixin, routerMixin],
  data() {
    return {
      lsLoading: false,
      searchOption1: {},
      option1: {},
      shipCarrierCodeList: [],
      oldParams: {},
      addOption: {
        show: false
      },
    }
  },
  created() {
    this.searchOption1 = {
      addFilter: {
        defaultSearchLength: 6,
        searchInputGroup: [
          {
            key: 'orderNo',
            value: '',
            showType: '1',
            range: { min: '', max: '' },
          },
          {
            key: 'shipCarrierCode',
            value: '',
            showType: '1',
            range: { min: '', max: '' },
          },
          {
            key: 'so',
            value: '',
            showType: '1',
            range: { min: '', max: '' },
          },
          {
            key: 'blNo',
            value: '',
            showType: '1',
            range: { min: '', max: '' },
          },
          {
            key: 'execStatus',
            value: '',
            showType: '1',
            range: { min: '', max: '' },
          },
        ],
        filterGroups: {
          orderNo: {
            key: 'orderNo',
            label: '订单号',
            type: 'input',
          },
          so: {
            key: 'so',
            label: 'SO号',
            type: 'input',
          },
          blNo: {
            key: 'blNo',
            label: '提单号',
            type: 'input',
          },
          shipCarrierCode: {
            key: 'shipCarrierCode',
            label: '船公司',
            type: 'remoteSelect',
            remote: true,
            remoteMethod: (queryString, item, row) => {
              this.shipCarrierSearch(queryString, item)
            },
            visibleChange: (queryString, item, row) => {
              this.shipCarrierSearch(queryString, item)
            },
            remoteSelectList: [],
          },
          execStatus: { key: 'execStatus', label: '状态', type: 'select', propInDict: 'aiOptStatusConfig'}
        },
        dateArr: ['oid'],
        callback: true,
      },
    }
    const operationBtns = Object.assign({}, this.option.operationBtns, {
      width: '220px',
      data: [
        {
          label: '详情',
          showFn: (row) => {
            return true
          },
          action: 'edit',
        },
        {
          label: '启动任务',
          showFn: (row) => {
            return ['SUBMIT'].includes(row.execStatus)
          },
          action: 'start',
        },
        {
          label: '取消任务',
          showFn: (row) => {
            return ['READY'].includes(row.execStatus)
          },
          action: 'cancel',
        },
        {
          label: '删除',
          showFn: (row) => {
            return !['EXECUTING', 'SUCCESS'].includes(row.execStatus)
          },
          action: 'delete',
        },
      ],
      fixed: 'right',
      callback: (action, $index, row, option) => {
        if (action === 'edit') {
          this.editFn(row)
        }
        if (action === 'start') {
          this.startFn(row)
        }
        if (action === 'cancel') {
          this.cancelFn(row)
        }
        if (action === 'delete') {
          this.deleteFn(row)
        }
      },
    })
    const pagination = Object.assign({}, this.option.pagination, {
      show: true,
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [],
      columns: [
        {
          prop: 'orderNo',
          label: '订单号',
          type: 'button',
          width: '150px',
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => {
              this.goOrderDetail(row)
            },
          },
        },
        {
          prop: 'bookingNos',
          label: 'SO号',
          type: 'text',
          formatter: ({row}) => {
            if (row.bookingNos) {
              return row.bookingNos.join(',')
            } else {
              return ''
            }
          }
        },
        {
          prop: 'blNo',
          label: '提单号',
          type: 'text',
        },
        {
          prop: 'shipCarrierCode',
          label: '船公司',
          type: 'text',
        },
        {
          prop: 'execStatus',
          label: '状态',
          type: 'select',
          formatter: ({row}) => {
             let str = getDictLabel('aiOptStatusConfig', row.execStatus)
             return `<span>${str}</span>`
          }
        }
      ],
      tips: {
        text: '',
        show: false,
      },
      selection: {
        text: '',
        show: false,
      },
      operationBtns,
      pagination,
    })
    this.getData()
  },
  methods: {
    // 搜索按钮
    search(query) {
      this.option1.pagination.currPage = 1
      this.getData(query)
    },
    // 封装请求参数并请求列表
    getData(query) {
      this.lsLoading = true
      const data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
        descColumns: ['oid']
      }
      if (query) {
        data.query = data.query.concat(query)
        this.searchBackup = data.query
      }
      if (this.searchBackup) {
        data.query = this.searchBackup
      }
      this.oldParams = data
      getSiInfoList(data)
        .then(({ data }) => {
          this.option1.data = data.list || []
          this.option1.pagination.currPage = data.currPage || 1
          this.option1.pagination.pageSize = data.pageSize || 10
          this.option1.pagination.totalCount = data.totalCount || 0
        })
        .finally(() => (this.lsLoading = false))
    },
    // 船司
    shipCarrierSearch(queryString, item) {
      baseShippingCarrierList(queryString, 'valid').then((res) => {
        if (res.code === 0) {
          item.remoteSelectList = res.data.map((ele, index) => ({
            ...ele,
            value: ele.carrierCode,
            label: `${ele.carrierCode}(${ele.cname})`,
          }))
        }
      })
    },
    // 跳转订单详情
    goOrderDetail(row) {
      let { orderNo } = row
      let routeUrl = this.$router.resolve({
        name: 'OrderRedirect',
        query: {
          orderNo,
        },
      })
      window.open(routeUrl.href, '_blank')
    },
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
    // 去补料
    editFn(row) {
      let routeUrl = this.$router.resolve({
				name: 'RobotPacking',
				query: {
          oid: row.oid,
          orderNo: row.orderNo,
          blId: row.orderBlId,
				}
			})
			window.open(routeUrl.href, '_blank')
    },
    add() {
      this.addOption.show = true
    },
    startFn(row) {
      this.$confirm('是否启动?', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        startSiTask({
          oid: row.oid
        })
        .then(res => {
          this.$message.success('已启动')
          this.getData()
        })
      })
    },
    cancelFn(row) {
       this.$confirm('是否取消?', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        cancelSiTask({
          oid: row.oid
        })
        .then(res => {
          this.$message.success('已取消')
          this.getData()
        })
      })
    },
    deleteFn(row) {
      this.$confirm('是否删除?', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        deleteSiInfo({
          oid: row.oid
        })
        .then(res => {
          this.$message.success('已删除')
          this.getData()
        })
      })
    }
  },
}
</script>
<style lang="scss" scoped>
/deep/td {
  .done-class {
    color: #3fcd14 !important;
  }
  .todo-class {
    color: #d19305 !important;
  }
}
</style>
