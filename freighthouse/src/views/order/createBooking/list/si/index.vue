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
      <div class="money-box" style="justify-content: flex-start;">
        <el-button type="primary" size="mini" @click="add">新增</el-button>
        <el-button type="default" size="mini" @click="handleExport" :loading="exportLoading">导出</el-button>
      </div>
      <FinanceTableMass :option="option1" :autoMax="true" />
     </div>
     <AddSi v-if="addOption.show" :option="addOption" />
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import AddSi from './add'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { baseShippingCarrierList, portList } from '@/api/base'
import { siList, siExport } from '@/api/order/createBooking'
import { getDictLabel } from '@/utils/tools'
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
      polList: [],
      podList: [],
      addOption: {
        show: false
      },
      exportLoading: false,
      oldParams: {},
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
            key: 'baseCarrierCode',
            value: '',
            showType: '1',
            range: { min: '', max: '' },
          },
          {
            key: 'polCode',
            value: '',
            showType: '1',
            range: { min: '', max: '' },
          },
          {
            key: 'podCode',
            value: '',
            showType: '1',
            range: { min: '', max: '' },
          },
          {
            key: 'vessel',
            value: '',
            showType: '1',
            range: { min: '', max: '' },
          },
          {
            key: 'voyage',
            value: '',
            showType: '1',
            range: { min: '', max: '' },
          },
          {
            key: 'createdTime',
            value: '',
            showType: '1',
            range: { min: '', max: '' },
          },
          {
            key: 'status',
            value: '',
            showType: '1',
            range: { min: '', max: '' },
          },
        ],
        filterGroups: {
          shipmentId: {
            key: 'shipmentId',
            label: '长帆业务编号',
            type: 'input',
          },
          orderNo: {
            key: 'orderNo',
            label: '订单号',
            type: 'input',
          },
          bookingNo: {
            key: 'bookingNo',
            label: '订舱号',
            type: 'input',
          },
          baseCarrierCode: {
            key: 'baseCarrierCode',
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
          polCode: {
            key: 'polCode',
            label: '起运港',
            type: 'remoteSelect',
            remote: true,
            remoteMethod: (queryString, item, row) => {
              this.getPort(queryString, 'port_of_basic', item)
            },
            visibleChange: (queryString, item, row) => {
              queryString && this.getPort(queryString, 'port_of_basic', item)
            },
            remoteSelectList: [],
          },
          podCode: {
            key: 'podCode',
            label: '目的港',
            type: 'remoteSelect',
            remote: true,
            remoteMethod: (queryString, item, row) => {
              this.getPort(queryString, 'port_of_destination', item)
            },
            visibleChange: (queryString, item, row) => {
              queryString &&
                this.getPort(queryString, 'port_of_destination', item)
            },
            remoteSelectList: [],
          },
          vessel: { key: 'vessel', label: '船名', type: 'input' },
          voyage: { key: 'voyage', label: '航次', type: 'input' },
          createdName: { key: 'createdName', label: '创建人', type: 'input' },
          createdTime: { key: 'createdTime', label: '创建时间' , type: 'daterange', format: 'yyyy-MM-dd'},
          status: { key: 'status', label: '状态', type: 'select', propInDict: 'onlineSiStatus'}
        },
        dateArr: ['createdTime'],
        callback: true,
      },
    }
    const operationBtns = Object.assign({}, this.option.operationBtns, {
      width: '100px',
      data: [
        {
          label: '重新编辑',
          showFn: (row) => {
            return true//['error', 'reject'].includes(row.status)
          },
          action: 'apply',
        },
      ],
      fixed: 'right',
      callback: (action, $index, row, option) => {
        if (action === 'apply') {
          this.applyFn(row)
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
          prop: 'shipmentId',
          label: '长帆业务编号',
          type: 'text',
          width: '150px',
        },
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
          prop: 'bookingNo',
          label: '订舱号',
          type: 'text',
          width: '150px',
        },
        {
          prop: 'carrierSource',
          label: '船公司',
          type: 'text',
          width: '150px',
          formatter: ({row}) => {
            let source = JSON.parse(row.requestData)
            return `${source.carrierName}(${source.carrierSource})`
          }
        },

        {
          prop: 'polCode',
          label: '起运港',
          type: 'text',
          width: '150px',
          formatter: ({ row }) => {
            const source = JSON.parse(row.requestData)
            return source.pol.locationName
          },
        },
        {
          prop: 'podCode',
          label: '目的港',
          type: 'text',
          width: '150px',
          formatter: ({ row }) => {
            const source = JSON.parse(row.requestData)
            return source.pod.locationName
          },
        },
        {
          prop: 'vessel',
          label: '船名',
          type: 'text',
        },
        {
          prop: 'voyage',
          label: '航次',
          type: 'text',
        },
        {
          prop: 'etd',
          label: 'ETD',
          type: 'text',
          formatter: ({ cellValue }) =>
            cellValue ? cellValue.slice(0, 10) : '',
        },
        {
          prop: 'notifyName',
          label: '通知人',
          type: 'text',
          formatter: ({ row }) => {
            const source = JSON.parse(row.requestData)
            return `${source.notifyName} (${source.notifyEmails})`
          },
        },
        {
          prop: 'status',
          label: '状态',
          type: 'select',
          formatter: ({row}) => {
             let colorText = ''
             let status = row.status ? row.status.toLowerCase() : ''
             let str = getDictLabel('onlineSiStatus', status)
             if (status) {
               if (status === 'accepted') {
                 colorText = 'done-class'
               } else {
                 colorText = 'todo-class'
               }
             }
             return `<span class="${colorText}">${str}</span>`
          }
        },
        {
          prop: 'createdName',
          label: '创建人',
          type: 'text',
        },
        {
          prop: 'createdTime',
          label: '创建时间',
          type: 'text',
          width: 120
        },
        {
          prop: 'updatedTime',
          label: '更新时间',
          type: 'text', 
          width: 120
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
    add () {
      this.addOption.show = true
    },
    handleExport() {
      this.exportLoading = true
      siExport(this.oldParams)
      .then((response) => {
        let { filePath } = response.data
        window.location.href = filePath
      })
      .finally(() => {
        this.exportLoading = false
      })
    },
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
        descColumns: ['createdTime']
      }
      if (query) {
        data.query = data.query.concat(query)
        this.searchBackup = data.query
      }
      if (this.searchBackup) {
        data.query = this.searchBackup
      }
      this.oldParams = data
      siList(data)
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
    // 起运港port_of_basic，目的港port_of_destination
    getPort(str = '', type, item) {
      const data = {
        portName: str,
        portAttribute: type,
        portCodes: '',
        state: 'valid',
      }
      portList(data)
        .then((res) => {
          if (res.code === 0) {
            item.remoteSelectList = res.data.map((ele, index) => ({
              ...ele,
              value: ele.portCode,
              label: `${ele.ename}(${ele.cname})`,
            }))
          }
        })
        .catch(() => {})
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
    applyFn(row) {
      let { orderNo, baseCarrierCode:carrierCode, orderBlId: blId, shipmentId } = row
      let routeUrl = this.$router.resolve({
        name: 'Packing',
        query: {
          orderNo,
          blId,
          isBasedFile: 'n',
          carrierCode,
          shipmentId
        },
      })
      window.open(routeUrl.href, '_blank')
    },
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
