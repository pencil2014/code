<template>
  <div class="si-log-detail">
    <div class="si-bewteen">
      <span class="ft12">日志列表</span>
    </div>
    <div class="si-table">
      <el-table fit highlight-current-row style="width: 100%" ref="fileListTable" :data="tableData" v-loading="lsLoading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground">
        <el-table-column prop="bizTime" label="时间" align="center"></el-table-column>
        <el-table-column prop="bizEmployeeName" label="人员" align="center"></el-table-column>
        <el-table-column prop="bizDeptName" label="部门" align="center"></el-table-column>
        <el-table-column prop="content" label="关键节点" align="center"></el-table-column>
      </el-table>
      <div style="margin-top: 10px;">
        <Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
      </div>
    </div>
  </div>
</template>
<script>
import store from '@/store'
import {mapState} from 'vuex'
import {getDictLabel} from '@/utils/tools'
import {blLogList} from '@/api/order/bl'
import Pagination from "@/components/Base/Table/newPagination"

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
      tableQuery:{
        currPage: 1,
        pageSize: 10,
        columns: [],
        ascColumns: [],
        descColumns: ['bizTime'],
        query: [],
        blId: '',
        orderNo: ''
      },
      total: null,
      tableData: [],
      uploadShow: false,
    }
  },
  props: {
    createItem: {
      type: Object,
      default: () => ({})
    },
    detailData: {
      type: Object,
      default: () => ({})
    },
  },
  created() {
    this.init()
  },
  mounted() {
    
  },
  computed: {
    ...mapState({
      currRole: state => state.order.currRole,
      dictMap: state => state.dict.dictMap
    })
  },
  watch: {
    
  },
  components: {
    Pagination
  },
  methods: {
    // 初始化
    init() {
      this.getList()
    },
    // 附件列表
    getList() {
      this.lsLoading = true
      Object.assign(this.tableQuery, {
        blId: this.$route.query.blId,
        orderNo: this.$route.query.orderNo,
        // query: [
        //   {"column":"blId", "type":"eq", "value": this.$route.query.blId},
        //   {"column":"orderNo", "type":"eq", "value": this.$route.query.orderNo}
        // ]
      })
      blLogList(this.tableQuery).then(res => {
        this.tableData = res.data.list
        this.total = res.data.totalCount

        this.tableQuery.currPage = res.data.currPage
				this.tableConfig.pagination.hasNextPage = res.data.hasNextPage
        this.tableConfig.pagination.hasPreviousPage = res.data.hasPreviousPage
        this.tableConfig.pagination.isFirstPage = res.data.isFirstPage
        this.tableConfig.pagination.isLastPage = res.data.isLastPage
				this.tableConfig.pagination.total = res.data.totalCount
				this.tableQuery.pageSize = res.data.pageSize
      }).finally(() => {
        this.lsLoading = false
      })
    },
    // 表格操作回调
    tableCallBack(action, arr) {
      let fn = this['handle' + action]
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
		// 分页
		handleSizeChange(val) {
			this.getList()
		},
		handleCurrentChange(val) {
			this.getList()
		},
  }
}
</script>
<style>
.si-log-detail .si-bewteen{
  padding: 0 10px;
  display: flex;
  justify-content: space-between;
  height: 40px;
  line-height: 40px;
}
.si-log-detail .si-table{
  padding: 0 10px;
}
</style>