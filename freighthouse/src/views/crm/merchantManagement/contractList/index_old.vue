<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch ref="searchComp" :searchOption="searchOption1" @search="search" :border="true" />
    <div class="finance-list-container">
      <div class="money-box">
        <div>
          <!-- <el-button @click="handleExport" size="mini">导出</el-button> -->
        </div>
        <el-radio-group v-model="effectStatus" size="mini" @change="handleCurrentChange(1)">
          <el-radio-button label="all">全部</el-radio-button>
          <el-radio-button label="include">有有效合同</el-radio-button>
          <el-radio-button label="not_include">无有效合同</el-radio-button>
        </el-radio-group>
      </div>
      <FinanceTable :option="option1" :autoMax="true" />
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { contractListTable } from '@/views/crm/data'
import { getContractList } from '@/api/crm/contract'

export default {
  name: 'ContractList',
  mixins: [mixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
  },
  data() {
    return {
      effectStatus: 'all',
      // 列表页--表格配置
      option1: {},
      // 列表页--搜索配置
      searchOption1: {},
    }
  },
  created() {
    let searchObj = {}
    contractListTable.forEach((v) => {
      searchObj[v.prop] = { ...v, type: v.sType || v.type || 'input', label: v.sLabel || v.label }
    })
    this.searchOption1 = {
      saveDefault: true,
      addFilter: {
        defaultSearchLength: 7,
        searchInputGroup: [
          { key: 'organizationName', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'orgType', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'customerRole', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'supplierCategory', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'effectTime', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'agreementType', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'nearlyTime', value: '', showType: '1', range: { min: '', max: '' } },
        ],
        filterGroups: { ...searchObj },
        dateArr: ['effectTime','nearlyTime'],
        callback: true,
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true }
    let operationBtns = {
      ...this.option.operationBtns,
      width: '150px',
      data: [
        { label: '客户详情', action: 'custDetail', showFn: (row) => row.orgType.includes('客户')},
        { label: '供应商详情', action: 'suplierDetail', showFn: (row) =>row.orgType.includes('供应商')}
      ],
    }
    this.option1 = { 
      ...this.option, 
      id: 'option1', 
      pagination, 
      operationBtns, 
      border: true,
      multiRow: true,
      multiKey: 'contractListNos',
      multiId: 'oid',
      selection: false,
    }
    this.option1.columns = [...contractListTable]
    // this.getData()
  },
  methods: {
    // 分页页面数量change   有分页必写此方法
    handleSizeChange(val) {
      let query = this.$refs.searchComp.addFilterSearch()
      this.option1.pagination.pageSize = val
      this.getData(query)
    },
    // 分页改变当前页   有分页必写此方法
    handleCurrentChange(val,event) {
      let query = this.$refs.searchComp.addFilterSearch()
      this.option1.pagination.currPage = val
      this.getData(query)
    },
    // 搜索按钮
    search(query) {
      this.option1.pagination.currPage = 1
      this.getData(query)
    },
    // 封装请求参数并请求列表
    getData(query) {
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        effectStatus:this.effectStatus
      }
      if (query) {
        this.searchBackup = query
        data.orgChildType=[]
        this.searchBackup.map(item=>{
          if(item.column == 'customerRole'|| item.column == 'supplierCategory'){
            data.orgChildType.push(item.value)
          }//有效时间
          else if(item.column == 'effectTime' && item.type == 'ge'){
            data.effectBeginDate = item.value
          }else if(item.column == 'effectTime' && item.type == 'le'){
            data.effectEndDate = item.value
          }//最近合作时间
          else if(item.column == 'nearlyTime' && item.type == 'ge'){
            data.nearlyTimeStart = item.value
          }else if(item.column == 'nearlyTime' && item.type == 'le'){
            data.nearlyTimeEnd = item.value
          } //是否有有效合同
          else if(item.column == 'effectStatus'){
            this.effectStatus = item.value
            return data[item.column] = item.value
          }
          else{
             return data[item.column] = item.value
          }
        
        })
      }
      data.query =  []
      this._exportSearchData = data
      getContractList(data)
        .then(({ data }) => {
          this.option1.data = data.list.map((item) => ({ ...item, toggle: false }))
          if (this.option1.data.length) {
            this.option1.data.forEach(item => {
              item.contractListNos = [...item.contractNos,...item.supplierContractNos]
              if (!item.contractListNos.length) {
                item.contractListNos.push(item)
              }
            })
          }
          this.option1.pagination.currPage = data.currPage
          this.option1.pagination.pageSize = data.pageSize
          this.option1.pagination.totalCount = data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    handlecustDetail(row) {
      let routeUrl = this.$router.resolve({
        name: 'CustomerDetail',
        query: { custid:row.custid, name:row.organizationName },
        params: { isTab: false }
      })
      window.open(routeUrl.href, '_blank')
    },
    handlesuplierDetail(row) {
      let routeUrl = this.$router.resolve({
        name: 'SupplierDetail',
        query: { custid:row.supplierId },
        params: { isTab: true }
      })
      window.open(routeUrl.href, '_blank')
    },
  },
}
</script>
<style lang="scss" scoped>
.finance-page ::v-deep {
  .el-dialog__body {
    padding: 20px;
  }
  .el-dialog__footer {
    padding: 0 20px 20px;
  }
  .el-table th {
    padding: 4px 0;
  }
  .el-table--border th,
  .el-table--border td {
    border-right: 1px solid #dfe6ec !important;
    border-bottom: 1px solid #dfe6ec !important;
  }
  .el-table__body .el-table__row {
    height: auto !important;
    td:nth-of-type(4),
    td:nth-of-type(5),
    td:nth-of-type(6),
    td:nth-of-type(7),
    td:nth-of-type(8),
    td:nth-of-type(9),
    td:nth-of-type(10),
    td:nth-of-type(11),
    td:nth-of-type(12), 
    td:nth-of-type(13) {
      padding: 0;
      & > div {
        padding: 0;
        & > div {
          .el-tooltip{
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          min-height: 22px;
          line-height: 16px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-bottom: 1px solid #dfe6ec;
          &:nth-last-of-type(1),
          &.noBorder:nth-of-type(1) {
            border: none;
          }
        }
      }
    }
  }
}
</style>