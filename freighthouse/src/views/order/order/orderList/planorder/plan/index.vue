<template>
  <div class="plan-container">
    <div class="search-container">
      <Search
        :searchConditionHide="searchConditionHide"
        :config.sync="searchConfig"
        :callback="searchCallBack"
        :tableQuery.sync="tableQuery">
      </Search>
    </div>
    <div class="table-container">
      <!-- <TableFilter :tableQuery.sync="tableQuery" :callback="tableCallBack" /> -->
      <el-table border fit class="plan-table" style="width: 100%;" :data="tableData">
        <el-table-column prop="orderNo" label="工作号" align="left" width="160">
          <template slot-scope="scope">
            <el-button type="text" size="mini" class="underline" @click="handleInfo(scope.row)">{{scope.row.orderNo}}</el-button> 
          </template>
        </el-table-column>
        <el-table-column prop="orderNo" label="相关时间" align="left" width="420">
          <template slot-scope="scope">
            <ul class="times-column-list">
              <li v-for="(item, key, index) in timesObj" :key="key + index">
                <span class="label">{{item}}:</span>
                <span class="value">{{scope.row[key] === '9999' ? '' : scope.row[key]}}</span>
              </li>
            </ul>
          </template>
        </el-table-column>
        <el-table-column prop="containerInfo" label="待办事项" align="left">
          <template slot-scope="scope">
            <div class="operate-checkbox-group">
              <el-checkbox-group size="mini" v-model="scope.row.itemDoneList">
                <el-checkbox
                  size="mini"
                  class=""
                  v-for="(item, index) in scope.row.itemList"
                  :key="item.matterCode + index"
                  :disabled="item.isStatusChange === 'N'"
                  :label="item.matterCode"
                  @change="(val) => handleChangeChecked(val, item, scope.row)">
                  {{item.matterName}}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="订单状态" width="100" align="left">
          <template slot-scope="scope">
            <span :class="scope.row.orderStatus === 'pass' ? 'red' : 'green'">
              {{scope.row.orderStatus | orderStatusFilter}}
            </span>
          </template>
        </el-table-column>
      </el-table> 
      <div class="pagination-row">
        <Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
      </div>
    </div>
  </div>
</template>
<script>
import store from '@/store'
import {mapState} from 'vuex'
import {getDictLabel, getServiceName} from '@/utils/tools'
import {routerMixin} from '@/views/order/order/mixins/routerMixin'
import {planMixin} from '@/views/order/order/orderList/planorder/planMixin'
import Search from '@/components/Base/Search/index'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import Pagination from "@/components/Base/Table/newPagination"
// import TableFilter from './components/tableFilter'
import {planList, planStatusUpdate } from '@/api/order/plan'

const defaultPage = {
  pageSize: -1,
  currPage: 1
}

const defaultTableQuery = {
  columns: [],
  ascColumns: [],
  descColumns: [],
  query: [],     // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
  orderStatus: 'all', // 订单状态，默认展示未处理
}

export default {
  mixins: [routerMixin, planMixin],
  filters: {
    orderStatusFilter(orderStatus) {
      let orderStatusOptions = {
        pass: '未完成',
        complete: '已完成'
      }
      return orderStatusOptions[orderStatus]
    }
  },
  data() {
    return {
      defaultStyle: {
        width: '100%'
      },
      tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
      searchConditionHide: true,  // 隐藏自定义搜索
      searchConfig: [
        {label: '工作号', key: 'orderNo', type: 'input', searchType: 'like', value: ''},
      ],
      // table复选框多选的值
      selectedCheckbox: [],
      tableData: [],
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
      timesObj: {
        'siCutOff': '截补料时间',
        'tdTime': '大船实际开船时间',
        'etaTime': '大船预计到港时间',
        'vgmCutOff': '截VGM时间',
        'cyCutOff': '截关时间',
        'ccCutOff': '截报关时间',
        'cvCutOff': '截放行时间',
      }
    }
  },
  activated() {
    this.getList();
		window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
	},
	deactivated() {
		window.removeEventListener('keydown', this.handleKeyDown)
	},
  created() {
    // this.init();
    this.getList();
  },
  mounted() {
    
  },
  destroyed(){
  },
  computed: {
    ...mapState({
      currRole: state => state.order.currRole,
      dictMap: state => state.dict.dictMap,
      publishStatus: state => state.dict.dictMap.publishStatus
    })
  },
  watch: {
  },
  components: {
    Search,
    BaseTableMuti,
    Pagination,
    // TableFilter
  },
  methods: {
    handleInfo(row) {
      this.isJumpRouteFromPage = true
      this.handleToOrderDetail(row)
			// this.$router.push({
			// 	name: row.jointNo ? 'JointOrderDetail' : 'OrderDetail',
			// 	params: {
			// 		orderNo: row.orderNo
			// 	},
			// 	query: {
      //     orderNo: row.orderNo,
      //     jointNo: row.jointNo,
      //     source: 'planOrderList',
      //     action: ''
			// 	}
      // })
      
      // let routeUrl = this.$router.resolve({
			// 	name: row.jointNo ? 'JointOrderDetail' : 'OrderDetail',
			// 	params: {
			// 		orderNo: row.orderNo,
			// 	},
			// 	query: {
      //     orderNo: row.orderNo,
      //     jointNo: row.jointNo,
			// 		source: 'planOrderList',
			// 		action: ''
			// 	}
			// })
			// window.open(routeUrl.href, '_blank')
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
    // 获取列表请求参数
    getListQuery() {
      let statusQuery = []
			if (this.tableQuery.orderStatus === 'all') {
				statusQuery = [{ column: 'orderStatus', type: 'in', value: 'pass,complete' }]
			} else if (this.tableQuery.orderStatus === 'todo') {
				statusQuery = [
          { column: 'orderStatus', type: 'eq', value: 'pass' },
        ]
			} else if (this.tableQuery.orderStatus === 'done') {
				statusQuery = [
          { column: 'orderStatus', type: 'eq', value: 'complete' },
        ]
			} 
      // 合并发布状态参数
      let data = {}
      Object.assign(data, this.tableQuery, {
        query: this.tableQuery.query.concat(statusQuery)
      })
      delete(data.orderStatus)
      return data
    },
    // 列表数据
    getList() {
      let data = this.getListQuery()
      planList(data).then(response => {
        let {list, totalCount, allColumns, configColumns, pageSize} = response.data;
        this.tableData = list.map(item => {
          // 代办状态为done的默认勾选
          let itemDoneList = item.itemList.filter(ele => ele.matterStatus.toLowerCase() === 'done').map(item => item.matterCode)
          // 截补料时间，截vgm时间，截放行时间，截报关时间截取到小时
          item.siCutOff = item.siCutOff.substring(13, 0)
          item.vgmCutOff = item.vgmCutOff.substring(13, 0)
          item.ccCutOff = item.ccCutOff.substring(13, 0)
          item.cvCutOff = item.cvCutOff.substring(13, 0)
          return {...item, itemDoneList}
        });
        this.tableConfig.pagination.total = totalCount;
        
        this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
        this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
        this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
        this.tableConfig.pagination.isLastPage = response.data.isLastPage
        this.tableQuery.currPage = response.data.currPage

        this.tableQuery.pageSize = pageSize
      })
    },
    // 查询组件回调
    searchCallBack(action) {
      let query = []
      if (action === 'Search') {
        // 新增的查询条件组装tableQuery参数
        if (this.searchConfig.length) {
          this.searchConfig.forEach((item, index) => {
            let tempItem = {}
            if (item.value) {
              Object.assign(tempItem, {
                "column": item.key,
                "type": item.searchType || 'eq',
                "value": item.queryValue ? item.queryValue : item.value
              })
              query.push(tempItem)
            }
          })
        }
        Object.assign(this.tableQuery, {
          query: query,
          currPage: 1
        })
        console.log('serach:', this.tableQuery)
        this.getList()
      }

      if (action === 'Reset') {
        this.searchConfig.forEach(item => {item.value = ''})
        Object.assign(this.tableQuery, defaultTableQuery, {
          currPage: 1
        })
        this.getList()
      }
    },
    // 按状态筛选
    handleSearchByStatus() {
      this.tableQuery.currPage = 1
      this.getList()
    },
    // 多选
    handleMuti(arr) {
      this.selectedCheckbox = arr;
    },
    handleSizeChange() {
      this.getList()
    },
    handleCurrentChange() {
      this.getList()
    },
    // 表格操作回调
    tableCallBack(action, arr) {
      let fn = this['handle' + action]
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
    // 获取table选中行的orderNo
    getOrderNos() {
      let orderNos = []
      this.selectedCheckbox.forEach(item => {
        orderNos.push(item.orderNo)
      })
      return orderNos
    },
    // 排序
    handleSort(query) {
      this.getList()
    },
    // 手动修改待办事项状态
		handleChangeChecked(val, item, row) {
      console.log(val, item, row.itemDoneList)
      // this.$confirm('是否确认修改待办事项状态?', '警告', {
			// 	confirmButtonText: '确定',
			// 	cancelButtonText: '取消',
			// 	type: 'warning'
			// }).then(() => {
        let data = {oid: item.oid, status: val ? 'done' : 'todo'}
        planStatusUpdate(data).then(res => {
          this.getList()
        }).catch(err => {
          this.getList()
        })
      // }).catch(() => {
      //   this.getList()
      // })
		},
  }
}
</script>
<style lang="scss">
.plan-container{
  .plan-table{
    border: 1px solid #dfe6ec;
    border-right: none;
    border-bottom: none;
    th{
      height: 24px;
    }
    td{
      border-right: 1px solid #dfe6ec !important;
      padding: 1px 0;
    }
    .green{
      color: #33B18A;
    }
    .operate-checkbox-group{
      .el-checkbox{
        width: 135px;
        margin-right: 10px;
        margin: 4px 10px 4px 0;
        line-height: 16px;
        height: 16px;
      }
      .el-checkbox__inner{
        border-color: #3E80F5;
      }
      .el-checkbox__input.is-disabled .el-checkbox__inner{
        border-color: #DCDFE6;
      }
      .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner{
        background-color: #3E80F5;
        border-color: #3E80F5;
      }
      .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
        border-color: #fff;
      }
    }
    .times-column-list{
      text-align: left;
      padding: 5px 0;
      width: 410px;
      li{
        width: 100%;
        float: left;
        display: inline-block;
        width: 200px;
        margin-right: 5px;
        &:nth-child(2n) {
          margin-right: 0px;
        }
        .label{
          display: inline-block;
          margin-right: 5px;
        }
        .value{
          display: inline-block;
        }
      }
    }
    .el-button--mini {
      height: 20px;
      padding: 0;
    }
  }
  .pagination-row{
    margin-top: 8px;
    text-align: right;
  }
}
</style>
