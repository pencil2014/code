<template>
  <div
    class="vgm-list finance-page"
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
import FinanceTableMass from "@/views/finance/components/financeTableMass/financeTableMass"
import FinanceSearch from "@/views/finance/components/financeSearch/financeSearch"
import { mixin } from "@/views/finance/orderFee/orderFee/mixin"
import { routerMixin } from "@/views/finance/mixins/routerMixin"
import { vgmList } from '@/api/order/onlineVgm' 
import { getDictLabel } from '@/utils/tools'
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
      searchBackup: '',
    };
  },
  created() {
    this.searchOption1 = {
      addFilter: {
        defaultSearchLength: 5,
        searchInputGroup: [
          {
            key: "orderNo",
            value: "",
            showType: "1",
            range: { min: "", max: "" },
          },
          {
            key: "bookingNo",
            value: "",
            showType: "1",
            range: { min: "", max: "" },
          },
          {
            key: "status",
            value: "",
            showType: "1",
            range: { min: "", max: "" },
          },
          {
            key: "carrierSource",
            value: "",
            showType: "1",
            range: { min: "", max: "" },
          },
        ],
        filterGroups: {
          orderNo: {
            key: "orderNo",
            label: "订单号",
            type: "input",
          },
          bookingNo: {
            key: "bookingNo",
            label: "SO号",
            type: "input",
          },
          status: { key: "status", label: "状态", type: "select", propInDict: 'onlineVgmStatus' },
          scac: { key: "scac", label: "船司编码", type: "input" },
          carrierSource: { key: "carrierSource", label: "EDI接入方", type: "input" },
        },
        callback: true,
      },
    };
    const operationBtns = Object.assign({}, this.option.operationBtns, {
      width: "100px",
      data: [
        {
          label: "编辑",
          showFn: (row) => {
            return ['draft'].includes(row.status)
          },
          action: "apply",
        },
        {
          label: "重新修改",
          showFn: (row) => {
            return !['draft'].includes(row.status)
          },
          action: "detail",
        },
      ],
      headerSign: {
        text: '重新修改：重新提交数据到船司'
      },
      fixed: "right",
      callback: (action, $index, row, option) => {
        if (action === "apply") {
          this.applyFn(row);
        } else if (action === 'detail') {
          this.detailFn(row)
        }
      },
    });
    const pagination = Object.assign({}, this.option.pagination, {
      show: true,
    });
    this.option1 = Object.assign({}, this.option, {
      id: "option1",
      data: [],
      columns: [
        {
          prop: "orderNo",
          label: "订单号",
          type: "button",
          width: "150px",
          callback: (row) => {
            this.goOrderDetail(row)
          }
        },
        {
          prop: "bookingNo",
          label: "SO号",
          type: "text",
          width: "150px",
        },
        {
          prop: "status",
          label: "状态",
          type: "select",
          formatter: ({row}) => {
             let colorText = ''
             let status = row.status ? row.status.toLowerCase() : ''
             let str = getDictLabel('onlineVgmStatus', status)
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
          prop: "scac",
          label: "船司编码",
          type: "text",
        },
        {
          prop: "carrierSource",
          label: "EDI接入方",
          type: "text",
        },
        {
          prop: "createdName",
          label: "创建人",
          type: "text",
        },
        {
          prop: "createdTime",
          label: "创建时间",
          type: "text",
        },
      ],
      tips: {
        text: "",
        show: false,
      },
      selection: {
        text: "",
        show: false,
      },
      operationBtns,
      pagination,
    });
    this.getData();
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
        descColumns: ['createdTime']
      }
      if (query) {
        data.query = data.query.concat(query)
        this.searchBackup = data.query
      }
      if (this.searchBackup) {
        data.query = this.searchBackup
      }
      vgmList(data)
        .then(({ data }) => {
          this.option1.data = data.list || []
          this.option1.pagination.currPage = data.currPage || 1
          this.option1.pagination.pageSize = data.pageSize || 10
          this.option1.pagination.totalCount = data.totalCount || 0
        })
        .finally(() => (this.lsLoading = false))
    },
    // 重新编辑
    applyFn(row) {
      let { shipmentId:shipId,baseCarrierCode: carrierCode } = row
      let routeUrl = this.$router.resolve({
        name: 'OnlineVgm',
        query: {
          shipId,
          carrierCode
        },
      })
      window.open(routeUrl.href, '_blank')
    },
    // 详情
    detailFn(row) {
      let { shipmentId:shipId,baseCarrierCode: carrierCode } = row
      let routeUrl = this.$router.resolve({
        name: 'OnlineVgm',
        query: {
          shipId,
          carrierCode
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
    goOrderDetail(row) {
      let { orderNo } = row
      let routeUrl = this.$router.resolve({
        name: 'OrderDetail',
        params: {
          orderNo,
        },
        query: {
          orderNo,
        },
      })
      window.open(routeUrl.href, '_blank')

    },
  }
};
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
