<template>
  <div
    class="bkg-list finance-page"
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
    <FinanceTableMass :option="option1" :autoMax="true" />
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { baseShippingCarrierList, portList } from '@/api/base'
import { bkgList } from '@/api/order/createBooking'
export default {
  components: {
    FinanceSearch,
    FinanceTableMass,
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
      shipList: [],
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
        ],
        filterGroups: {
          shipmentId: {
            key: 'shipmentId',
            label: '??????????????????',
            type: 'input',
          },
          orderNo: {
            key: 'orderNo',
            label: '?????????',
            type: 'input',
          },
          carrierSourceBizNo: {
            key: 'carrierSourceBizNo',
            label: '?????????????????????',
            type: 'input',
          },
          bookingNo: {
            key: 'bookingNo',
            label: '?????????',
            type: 'input',
          },
          bookingNo: { key: 'bookingNo', label: '?????????', type: 'input' },
          baseCarrierCode: {
            key: 'baseCarrierCode',
            label: '?????????',
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
            label: '?????????',
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
            label: '?????????',
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
          vessel: { key: 'vessel', label: '??????', type: 'input' },
          voyage: { key: 'voyage', label: '??????', type: 'input' },
          createdName: { key: 'createdName', label: '?????????', type: 'input' },
        },
        callback: true,
      },
    }
    const operationBtns = Object.assign({}, this.option.operationBtns, {
      width: '100px',
      data: [
        {
          label: '????????????',
          showFn: (row) => {
            return true //['error', 'reject'].includes(row.status)
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
          label: '??????????????????',
          type: 'button',
          width: '150px',
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => {
              this.goBookDetail(row)
            },
          },
        },
        {
          prop: 'orderNo',
          label: '?????????',
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
          prop: 'carrierSourceBizNo',
          label: '?????????????????????',
          type: 'text',
          width: '150px',
        },
        {
          prop: 'bookingNo',
          label: '?????????',
          type: 'text',
          width: '150px',
        },
        {
          prop: 'carrierSource',
          label: '?????????',
          type: 'text',
          width: '150px',
          formatter: ({row}) => {
            let source = JSON.parse(row.requestData)
            return `${source.carrierName}(${source.carrierSource})`
          }
        },

        {
          prop: 'polCode',
          label: '?????????',
          type: 'text',
          width: '150px',
          formatter: ({ row }) => {
            const source = JSON.parse(row.requestData)
            return source.pol.locationName
          },
        },
        {
          prop: 'podCode',
          label: '?????????',
          type: 'text',
          width: '150px',
          formatter: ({ row }) => {
            const source = JSON.parse(row.requestData)
            return source.pod.locationName
          },
        },
        {
          prop: 'vessel',
          label: '??????',
          type: 'text',
        },
        {
          prop: 'voyage',
          label: '??????',
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
          label: '?????????',
          type: 'text',
          formatter: ({ row }) => {
            const source = JSON.parse(row.requestData)
            return `${source.notifyName} (${source.notifyEmails})`
          },
        },
        {
          prop: 'status',
          label: '??????',
          type: 'select',
          propInDict: 'onlineBkgStatus',
        },
        {
          prop: 'createdName',
          label: '?????????',
          type: 'text',
        },
        {
          prop: 'createdTime',
          label: '????????????',
          type: 'text',
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
    // ????????????
    search(query) {
      this.option1.pagination.currPage = 1
      this.getData(query)
    },
    // ?????????????????????????????????
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
      bkgList(data)
        .then(({ data }) => {
          this.option1.data = data.list || []
          this.option1.pagination.currPage = data.currPage || 1
          this.option1.pagination.pageSize = data.pageSize || 10
          this.option1.pagination.totalCount = data.totalCount || 0
        })
        .finally(() => (this.lsLoading = false))
    },
    // ??????
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
    // ?????????port_of_basic????????????port_of_destination
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
    // ??????????????????
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
    // ???????????????
    goBookDetail (row) {
      let { orderBkgId:bkgReqNo, orderNo } = row
      let routeUrl = this.$router.resolve({
        name: 'BookDetail',
        query: {
          bkgReqNo,
          orderNo,
          roles: 'bkg',
        },
      })
      window.open(routeUrl.href, '_blank')
    },
    // ??????????????????change   ????????????????????????
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    // ?????????????????????   ????????????????????????
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    // ?????????
    applyFn(row) {
      let { orderBkgId: bkgReqNo, orderNo, shipmentId, baseCarrierCode:carrierCode } = row
      let routeUrl = this.$router.resolve({
        name: 'Booking',
        query: {
          bkgReqNo,
          carrierCode,
          orderNo,
          shipmentId,
        },
      })
      window.open(routeUrl.href, '_blank')
    },
  },
}
</script>
