<template>
<div class="app-container" id="warehouseIn">
  <div class="search-container">
    <Search
    :searchConditionHide="searchConditionHide"
    :config.sync="searchConfig"
    :callback="searchCallBack"
    :tableQuery.sync="tableQuery">
    </Search>
  </div>
  <div class="table-container">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="起运港进仓计划" name="inplan">
        <PlanTable v-if="activeName=='inplan'" :tableData="planTableData"></PlanTable>
      </el-tab-pane>
      <el-tab-pane label="起运港进仓记录" name="log">
        <InTable v-if="activeName=='log'" :tableData="inTableData"></InTable>
      </el-tab-pane>
      <el-tab-pane label="目的港进仓计划" name="podInplan">
        <PodPlanTable v-if="activeName=='podInplan'" :tableData="podPlanTableData"></PodPlanTable>
      </el-tab-pane>
      <el-tab-pane label="目的港进仓记录" name="podLog">
        <PodInTable v-if="activeName=='podLog'" :tableData="podInTableData"></PodInTable>
      </el-tab-pane>
    </el-tabs>
    <div class="base-el-pagination">
      <div class="pagination-container">
        <!-- <el-pagination size="mini" background 
          @size-change="handleSizeChange" 
          @current-change="handleCurrentChange" 
          :current-page.sync="tableQuery.currPage"
          :page-size="tableQuery.pageSize"
          :total="tableQuery.totalCount"
          :page-sizes="[10, 20, 50]" 
          :pager-count="5" 
          layout="total, prev, pager, next, jumper, sizes"
          style="margin-top: 10px;" >
        </el-pagination> -->

        <Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
      </div>
    </div>
    </div>
</div>
</template>

<script>
import store from '@/store'
import {getDictLabel} from '@/utils/tools'
import {warehouseHandleData} from '../js/handleData'
import searchTableUtil from '@/utils/searchTableUtil'
import BaseDialog from '@/components/Base/Dialog/index'
import Search from '@/components/Base/Search/index'
import {getWarehouseInplan, getWarehouseIn} from '@/api/order/list'
import {inplanListPage, inListPage} from '@/api/order/podService/warehouse'
import {warehouseList} from '@/api/order/warehouse'
// import Pagination from '@/components/Base/Table/pagination'
import PlanTable from './components/planTable'
import InTable from './components/inTable'
import PodPlanTable from './components/podPlanTable'
import PodInTable from './components/podInTable'
import Pagination from "@/components/Base/Table/newPagination"

const defaultTableQuery = {
  ascColumns: [],
  descColumns: []
}
const defaultPage = {
  pageSize: -1,
  currPage: 1
}
export default {
  data() {
    return {
      tableConfig: {
        // 分页
        pagination: {
          show: true,
          total: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          isFirstPage: false,
          isLastPage: false
        },
      },
      activeName: "inplan",
      searchConditionHide: true,  // 隐藏自定义搜索
      allSearchConfig: [
        {key: 'planNo', label: '进仓计划编号', type: 'input', value: ''},
        {key: 'batchNo', label: '进仓编号', type: 'input', value: ''},
        {key: 'queryNo', label: '相关编号', type: 'input', value: ''},
        {
          key: 'whId', 
          label: '仓库名称', 
          type: 'remoteSelect', 
          data: [],
          value: '',
          visibleChange: (val, item) => {
            this.wareHouseSearch('', item)
          }, filterMehod: (val, item) => {
            this.wareHouseSearch(val, item)
          }, change: (val, item) => {
            item.value = val
          }
        },
        {
          key: 'deliveryCustid', 
          label: '客户名称', 
          type: 'remoteSelect',
          data: [],
          value: '',
          visibleChange: (val, item) => {
            this.customerSearch('', item)
          }, filterMehod: (val, item) => {
            this.customerSearch(val, item)
          }, change: (val, item) => {
            item.value = val
          }
        },
        {key: 'orderNo', label: '工作号', type: 'input', value: ''}
      ],
      searchConfig: [],
      tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
      planTableData: [],  // 进仓计划table数据
      inTableData: [],  // 进仓记录table数据
      podPlanTableData: [], // 目的港进仓计划table数据
      podInTableData: []  // 目的港进仓记录table数据
    }
  },
  props: {

  },
  created() {
    this.init()
    window.addEventListener('keydown', this.handleKeyDown)//开启监听键盘按下事件
  },
  destroyed(){
    window.removeEventListener('keydown',this.handleKeyDown)
  },
  components: {
    BaseDialog,
    Search,
    Pagination,
    PlanTable,
    InTable,
    PodPlanTable,
    PodInTable,
    Pagination
  },
  methods: {
    // 表格操作回调
    tableCallBack(action, arr) {
      let fn = this['handle' + action]
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
    init() {
      this.searchConfig = this.allSearchConfig.filter(item => ["planNo","orderNo","whId","deliveryCustid"].includes(item.key))
      this.getList()
    },
    // enter按键事件
    handleKeyDown(e) {
      let key = null
      if (window.event === undefined) {
        key = e.keyCode
      } else {
        key = window.event.keyCode
      }
      if (key === 13) {
        // 阻止分页的页码enter键触发全局的监听事件
				let className = window.event.target.parentNode.className
				if (className.includes('el-pagination__editor')) return
        //触发的事件
        this.searchCallBack('Search')
      }
    },
    getList() {
      let query = {... this.tableQuery}
      delete query.totalCount
      let data = searchTableUtil.getListQuery(query)
      let funData = this.activeName == 'inplan' ? getWarehouseInplan 
      : this.activeName == 'log' ? getWarehouseIn 
      : this.activeName === 'podInplan' ? inplanListPage 
      : inListPage
      funData(data).then(res => {
        let tableData = []
        let resData = []
        resData = res.data.list
        if(resData && resData.length>0) {
          tableData = resData.map(item => {
            // let warehouseItems = this.activeName=='inplan'?item.warehouseInplanItems : item.warehouseInItems
            item.status_zh = getDictLabel('warehouseInplanStatus', item.status)
            // warehouseItems && warehouseItems.map(cargo => {
            //   cargo.cname = cargo.cargoVo.cname
            //   cargo.mark = cargo.cargoVo.mark
            //   cargo.totalQuantity = cargo.quantity
            //   cargo.totalWeight = cargo.weight
            //   cargo.totalVolume = cargo.volume
            //   cargo.planNo = ""
            // })
            this.tableQuery.totalCount = res.data.totalCount

            this.tableConfig.pagination.hasNextPage = res.data.hasNextPage
            this.tableConfig.pagination.hasPreviousPage = res.data.hasPreviousPage
            this.tableConfig.pagination.isFirstPage = res.data.isFirstPage
            this.tableConfig.pagination.isLastPage = res.data.isLastPage
            this.tableConfig.pagination.total = res.data.totalCount
            this.tableQuery.pageSize = res.data.pageSize

            this.tableQuery.currPage = res.data.currPage
            return item
          })
        } else {
          tableData = resData
        }

        if(this.activeName=='inplan') {
          this.planTableData = tableData
        } else if (this.activeName === 'log') {
          this.inTableData = tableData
        } else if (this.activeName === 'podInplan') {
          this.podPlanTableData = tableData
        } else {
          this.podInTableData = tableData
        }
      })
    },
    //
    handleClick(tab, event) {
      // 切换tab，重置搜索条件
      this.tableQuery = Object.assign({}, defaultTableQuery, defaultPage)
      this.searchConfig.map(item => item.value = '')
      if(tab.name === 'inplan') {
        this.searchConfig = this.allSearchConfig.filter(item => ["planNo","orderNo","whId","deliveryCustid"].includes(item.key))
      }
      if(tab.name == 'log') {
        this.searchConfig = this.allSearchConfig.filter(item => ["batchNo","orderNo","whId","deliveryCustid"].includes(item.key))
      }
      if(tab.name === 'podInplan') {
        this.searchConfig = this.allSearchConfig.filter(item => ["queryNo","whId","deliveryCustid"].includes(item.key))
        this.searchConfig.forEach(ele => {
          if (ele.key === 'queryNo') {
            ele.label = '进仓计划编号'
          }
        })
      }
      if(tab.name === 'podLog') {
        this.searchConfig = this.allSearchConfig.filter(item => ["queryNo","whId","deliveryCustid"].includes(item.key))
        this.searchConfig.forEach(ele => {
          if (ele.key === 'queryNo') {
            ele.label = '进仓编码'
          }
        })
      }
      this.activeName = tab.name
      this.getList()
    },
    searchCallBack(action){
      if(action === 'Search') {
        this.tableQuery.currPage = 1
        this.tableQuery.whId = this.searchConfig.filter(item => item.key == "whId")[0].value || ''
        this.tableQuery.deliveryCustid = this.searchConfig.filter(item => item.key == "deliveryCustid")[0].value || ''
        this.tableQuery.custid = this.searchConfig.filter(item => item.key == "deliveryCustid")[0].value || ''
        if(this.activeName === 'log') {
          this.tableQuery.batchNo = this.searchConfig.filter(item => item.key === 'batchNo')[0].value || ''
          this.tableQuery.orderNo = this.searchConfig.filter(item => item.key === 'orderNo')[0].value || ''
        }
        if(this.activeName === 'inplan') {
          this.tableQuery.planNo = this.searchConfig.filter(item => item.key === 'planNo')[0].value || ''
          this.tableQuery.orderNo = this.searchConfig.filter(item => item.key === 'orderNo')[0].value || ''
        }
        if(this.activeName === 'podLog') {
          this.tableQuery.queryNo = this.searchConfig.filter(item => item.key === 'queryNo')[0].value || ''
        }
        if(this.activeName === 'podInplan') {
          this.tableQuery.queryNo = this.searchConfig.filter(item => item.key === 'queryNo')[0].value || ''
        }
      }
      if(action === 'Reset') {
        this.tableQuery = Object.assign({}, defaultTableQuery, defaultPage)
        this.searchConfig.map(item => item.value = '')
      }
      this.getList()
    },
    wareHouseSearch(queryString, item) {
      let data = {
        "currPage": 1,
        "pageSize": 50,
        "warehouseName": queryString
      }
      warehouseList(data).then(res => {
        let list = res.data.list
        item.data = list.map(item => {
          return {
            value: item.whId,
            label: item.warehouseName
          }
        })
      })
    },
    customerSearch(val, item) {
      this.$store.dispatch('dict/queryCustomerList', val || '').then(data => {
        let list = data.list
        item.data = list.map(o => {
          return {
            value: o.custid,
            label: this.$language=='en'?o.ename:o.name
          }
        })
      })
    },
    // 分页
    handleSizeChange(val) {
      // this.tableQuery.pageSize = val
      this.getList()
    },
    handleCurrentChange(val) {
      // this.tableQuery.currPage = val
      this.getList()
    },
  }
};
</script>

<style lang="scss">
.create-form .el-col{
  padding-bottom: 20px;
}
.el-date-editor.el-input, .el-date-editor.el-input__inner {
  width: auto;
}
.filter-container {
  margin-bottom: 10px;
}
.table-com-layout{
  .el-table th, .el-table td, .el-table__body td{
    height: 30px;
    border-bottom: 1px solid #e9e9e9;
  }
}
</style>
