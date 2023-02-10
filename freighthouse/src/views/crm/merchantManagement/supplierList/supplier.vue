<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption1" @search="search" :border="true" />
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button type="primary" @click="handleAdd" size="mini">新建</el-button>
          <el-button @click="handleExport" size="mini">导出</el-button>
          <el-button @click="handleCustomColumns" size="mini">自定义表头</el-button>
        </div>
        <div class="money-box-right">
        </div>
      </div>
      <FinanceTable :option="option1" :autoMax="true" />
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
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import CustomColumns from '@/components/customColumns'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { supplierListTable } from '@/views/crm/data'
import SUPPLIER from '@/api/crm/supplier'

export default {
  name: 'customerList',
  mixins: [mixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    CustomColumns,
  },
  data() {
    return {
      // 列表类型
      verifyStatus: 'all',
      // 自定义表头弹框
      customColumnsPopShow: false,
      // 列表页--表格配置
      option1: {},
      // 列表页--搜索配置
      searchOption1: {},
      // 列表页--动态组件--当前显示的组件
      query: {
        applyNo: '',
        confirmStatus: '',
        refuseReason: '',
      },
      // 初始自定义表头
      selfColumnsBase: supplierListTable.map((item) => {
        let target = { ...item, hasTag: item.prop === 'name' }
        if (item.cDisabled) target.disabled = true
        if (target.callback) target.callback = (row) => this.showDetail(row)
        return target
      }),
    }
  },
  watch: {
    verifyStatus(val) {
      this.handleCurrentChange(1)
    },
  },
  activated() {
    // this.handleCurrentChange(1)
    this.getData()
  },
  created() {
    // 搜索配置
    let searchObj = {}
    supplierListTable.forEach((v) => {
      // if (v.searchHide || v.prop == 'mtEmployeeName') return
      let prop = v.searchProp || v.prop
      searchObj[prop === 'serviceItems' ? 'serviceItemInfo' : prop] = {
        ...v,
        type: v.sType || v.type || 'input',
        label: v.sLabel || v.label,
        prop,
      }
      // 特殊处理，需要去重
      if (prop === 'serviceItems') {
        let arr = []
        this.dictMap.crmService.forEach((item) => {
          if (!arr.find(({ value }) => value == item.value)) {
            arr.push(item)
          }
        })
        searchObj['serviceItemInfo'].selectOptions = arr
      }
    })
    this.searchOption1 = {
      addFilter: {
        defaultSearchLength: 5,
        searchInputGroup: [
          { key: 'name', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'categoryInfo', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'biztypeInfo', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'indexAddr', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'mtEmployeeName', value: '', showType: '1', range: { min: '', max: '' } },
        ],
        filterGroups: { ...searchObj },
        dateArr: ['setupDate', 'usccExpDate'],
        callback: true,
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true }
    this.option1 = { ...this.option, id: 'option1', pagination, selection: false,  noClickCheck: true }
    // 自定义表头
    let columns = [...this.selfColumnsBase]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.option1.columns = [
      ...columns,
    ]
    // this.getData()
  },
  methods: {
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    search(query) {
      this.option1.pagination.currPage = 1
      this.getData(query)
    },
    getData(query) {
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        descColumns: ['supplierId'],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      if (query) {
        this.searchBackup = query
      }
      data.query = this.searchBackup || []
      let mtEmployeeName = data.query.find((item) => item.column == 'mtEmployeeName')
      if (mtEmployeeName) data.query.push({ column: 'mtEmployeeId', type: 'like', value: mtEmployeeName.value })
      this._exportSearchData = data
      SUPPLIER.supplierList(data)
        .then(({ data }) => {
          if (data.configColumns && data.configColumns.length) {
            let columns = data.configColumns
            let optionColumns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop)).filter((v) => v)
            this.option1.columns.splice(0, 100, ...optionColumns)
            this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
            this.configColumns = data.configColumns
          }
          this.option1.data = data.list.map((item) => {
            let categorys = item.categorys.map((v) => v.category.toLowerCase()).join(',')
            let biztypes = item.biztypes.map((v) => v.businessType.toLowerCase()).join(',')
            let serviceItems = item.serviceItems.map((v) => v.serviceCode.toLowerCase()).join(',')
            return { ...item,categorys, biztypes, serviceItems }
          })
          // console.log(this.option1)
          this.option1.pagination.currPage = data.currPage
          this.option1.pagination.pageSize = data.pageSize
          this.option1.pagination.totalCount = data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    handleAdd() {
      this.$store.dispatch('crm/supplier/addCustomer')
      this.routerPush('AddSupplier')
    },
    handleExport() {
      this.lsLoading = true
      SUPPLIER.mySupplierListExport(this._exportSearchData)
        .then((res) => {
          window.open(res.data.filePath)
        })
        .finally(() => (this.lsLoading = false))
    },
    handleCustomColumns() {
      this.customColumnsPopShow = true
    },
    showDetail({ supplierId: custid, orgid, status, name, verifyStatus }) {
      // 我的客户详情页 | 已拒绝详情
      this.$store.commit('crm/supplier/setDetailCustid', custid)
      this.$store.commit('crm/supplier/setDetailIsEdit', false)
      this.$store.commit('crm/supplier/setDetailEditInfo', {})
      return this.routerPush('SupplierDetail2', { custid },{isTab: true})
    },
  },
}
</script>
