<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="fin-customer-cnt">
      <FinanceSearch
        :searchOption="searchOption1"
        @search="search"
        :border="true"
      />
      <FinanceTableMass
        :option="option1"
        :autoMax="true"
        @send-multi="sendMulti"
      />
    </div>
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import CUSTOMER from '@/api/crm/customer'
export default {
  mixins: [mixin, routerMixin],
  components: {
    FinanceSearch,
    FinanceTableMass
  },
  data() {
    return {
      lsLoading: false,
      searchOption1: {},
      option1: {},
      multipleSelection1: []
    }
  },
  created() {
    this.searchOption1 = {
      addFilter: {
        callback: true,
        plusShow: false,
        defaultSearchLength: 1,
        searchInputGroup: [
          {
            key: 'name',
            value: '',
            showType: '1'
          }
        ],
        filterGroups: {
          name: { label: '客户名称', type: 'input', showType: '1' }
        }
      }
    }
    const columns = [
      {
        prop: 'name',
        label: '客户名称',
        type: 'button',
        width: 200,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.goDetail(row)
          }
        }
      },
      {
        prop: 'custClass',
        label: '客户类型',
        type: 'select',
        propInDict: 'customerClassNew',
      },
      {
        prop: 'custLevel',
        label: '客户级别',
        type: 'select',
        propInDict: 'custLevel',
      },
      // {
      //   prop: 'roleTypeInfo',
      //   label: '企业类别',
      //   type: 'select',
      //   propInDict: 'customerRole',
      // },
      { prop: 'entType', label: '企业类型', },
      { prop: 'uscc', label: '社信统一代码',},
      { prop: 'taxId', label: '纳税人识别号',},
      {
        prop: 'setupDate',
        label: '成立日期',
        format: 'yyyy-MM-dd',
      },
      {
        prop: 'usccExpDate',
        label: '营业执照到期日',
        format: 'yyyy-MM-dd',
      },
      { prop: 'registerAddr', label: '注册地址', width: 200, isTooltip: true },
      // {
      //   prop: 'deptCname',
      //   label: '下单客户维护人',
      //   width: 160,
      //   formatter: ({ row: { customerBds }}) => {
      //     const source = (customerBds || [])
      //       .filter((item) => item.maintainerType === 'order')
      //       .map((ele) => {
      //         return `${ele.bdEmployeeName}(${ele.bdDeptName})`
      //       })
      //       .join('，')
      //     return source
      //   },
      //   isTooltip: true
      // },
      // {
      //   prop: 'deptCname2',
      //   label: '其他客户维护人',
      //   width: 160,
      //   formatter: ({ row: { customerBds }}) => {
      //     const source = (customerBds || [])
      //       .filter((item) => item.maintainerType !== 'order')
      //       .map((ele) => {
      //         return `${ele.bdEmployeeName}(${ele.bdDeptName})`
      //       })
      //       .join('，')
      //     return source
      //   },
      //   isTooltip: true
      // },
      // {
      //   prop: 'firstTime',
      //   label: '首次合作时间',
      //   format: 'yyyy-MM-dd',
      //   width: 100,
      //   formatter: ({cellValue}) => {
      //     return cellValue ? cellValue.slice(0,10) : ''
      //   }
      // },
      // {
      //   prop: 'nearlyTime',
      //   label: '最近合作时间',
      //   format: 'yyyy-MM-dd',
      //   width: 100,
      //   formatter: ({cellValue}) => {
      //     return cellValue ? cellValue.slice(0,10) : ''
      //   }
      // }
    ]
    const operationBtns = Object.assign({}, this.option.operationBtns, {
      width: '80px',
      data: [
        {
          label: '详情',
          type: 'text',
          show: true,
          action: 'Detail'
        }
      ],
      callback: (action, $index, row, item) => {
        if (action === 'Detail') {
          this.goDetail(row)
        }
      }
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [],
      tips: {
        text: '',
        show: false
      },
      columns,
      selection: {
        show: false,
      },
      operationBtns,
      pagination: false
    })
  },
  methods: {
    search() {
      this.getData()
    },
    getData() {
      this.lsLoading = true
      const data = {
        currPage: 1,
        pageSize: 10,
        query: []
      }
      this.searchOption1.addFilter.searchInputGroup.forEach((item) => {
        const { key, value } = item
        data.query.push({
          column: key,
          type: 'like',
          value: value
        })
      })
      CUSTOMER.listForRole(data)
        .then((res) => {
          if (res.code === 0) {
            this.option1.data = res.data.list
          }
        })
        .catch(() => {})
        .finally(() => (this.lsLoading = false))
    },
    goDetail(row) {
      const { name, custid } = row
      const routeUrl = this.$router.resolve({
        name: 'FinCustomerDetail',
        query: { custid, name }
      })
      window.open(routeUrl.href, '_blank')
    },
    sendMulti(data) {
      this.multipleSelection1 = data
    }
  }
}
</script>

