<template>
  <div class="edit-row">
    <div class="">
      <div class="msg-form-wrap">
        <el-table header-row-class-name="dashboard-msg-header" class="todo-table-layout dashboard-table-wrap" :data="tableList" ref="todoTableLayout">
          <el-table-column width="50" align="center" label="">
            <template slot-scope="scope">
              <span v-if="new Date(scope.row.noticeTime).toLocaleDateString() === new Date().toLocaleDateString()" class="dashboard-new-msg">new</span>
            </template>
          </el-table-column>
          <el-table-column show-overflow-tooltip align="left" label="待办内容">
            <template slot-scope="scope">
              <span v-if="scope.row.showTitle === 'Y'" v-html="scope.row.noticeTitle" class="content-link"></span>
              <span v-else v-html="scope.row.noticeContent" class="content-link"></span>
            </template>
          </el-table-column>
          <el-table-column prop="noticeTime" align="center" width="150" label="通知时间"></el-table-column>
          <el-table-column width="75" prop="noticePriority" align="center" label="优先级">
            <template slot-scope="scope">
              <span class="notice-priority-high" v-if="scope.row.noticePriority == 0">紧急</span>
              <span class="notice-priority-middle" v-if="scope.row.noticePriority == 1">一般</span>
              <span class="notice-priority-low" v-if="scope.row.noticePriority == 2">低</span>
            </template>
          </el-table-column>
          <el-table-column width="75" prop="handleStatus" align="center" label="状态">
            <template slot-scope="scope">
              {{ scope.row.handleStatus && scope.row.handleStatus.toLowerCase() === 'y' ? '已处理' : '未处理' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90" align="center" fixed="right">
            <template slot-scope="scope">
              <el-button class="msg-op-btn" @click="handleDetail(scope.row)" type="text" size="mini">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagenation-cont">
          <Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" ref="msgTableFooter" />
        </div>
      </div>
    </div>
    <el-dialog :title="`[待办] ${detail.noticeTitle}`" :visible.sync="open" :lock-scroll="true" width="780px">
      <el-form class="msg-detail" label-position="right" label-width="120px">
        <el-form-item label="内容:" style="padding:12px 0;width: 100%;">
          <div v-html="detail.noticeContent" class="content-link"></div>
        </el-form-item>
        <el-form-item label="类型:" style="width: 100%">
          <span>{{ noticeTypeOptions[detail.noticeType] }}</span>
        </el-form-item>
        <el-form-item label="优先级:" style="width: 100%">
          <span class="notice-priority-high" v-if="detail.noticePriority == 0">紧急</span>
          <span class="notice-priority-middle" v-if="detail.noticePriority == 1">一般</span>
          <span class="notice-priority-low" v-if="detail.noticePriority == 2">低</span>
        </el-form-item>
        <el-form-item label="关联单号:" style="width: 100%">
          <span>{{ detail.keyNo | keyNoFilter }}</span>
        </el-form-item>
        <el-form-item label="处理状态:" style="width: 100%">
          <span>{{ detail.handleStatus && detail.handleStatus.toLowerCase() === 'y' ? '已处理' : '未处理' }}</span>
        </el-form-item>
        <el-form-item label="通知时间:" style="width: 100%">
          <span>{{ detail.noticeTime }}</span>
        </el-form-item>
        <el-form-item label="查看时间:" style="width: 100%">
          <span>{{ detail.viewTime }}</span>
        </el-form-item>
        <el-form-item label="处理完成时间:" style="width: 100%">
          <span>{{ detail.closeTime }}</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="cancel">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import store from '@/store'
import { noticeWebsiteList, noticeWebsiteDelete } from '@/api/msg'
import { getDictLabel } from '@/utils/tools'
import Pagination from '@/components/Base/Table/pagination'
import { mapMutations } from 'vuex'
import { unreadCount } from '@/api/bkg/stockApply' // 获取菜单红点
import noticeMixin from './noticeMixin'
const defaultTableQuery = {
  pageSize: -1,
  currPage: 1,
  columns: [],
  ascColumns: [],
  descColumns: ['createdTime'],
  query: [
    { column: 'noticeType', type: 'eq', value: 'TODO' },
    { column: 'handleStatus', type: 'eq', value: 'N' },
    { column: 'noticeEmployeeId', type: 'eq', value: store.state.user.userId }
  ]
}
export default {
  mixins: [noticeMixin],
  data() {
    return {
      selectRows: [],
      tableHeight: 400,
      tableList: [],
      open: false,
      total: 0,
      tableQuery: Object.assign({}, defaultTableQuery),
      detail: {},
      tableConfig: {
        // 分页
        pagination: {
          show: true,
          total: 0
        }
      }
    }
  },
  created() {
    this.getList()
    // 获取菜单红点
    this.unreadCountFn()
  },
  mounted() {
    // DOM加载完成后计算表格高度
    this.$nextTick(() => {
      this.dynamicHeight()
    })
  },

  computed: {},
  props: {
    noticeTypeOptions: {
      type: Object,
      default: () => ({})
    }
  },
  // table基础组件
  components: {
    Pagination
  },
  filters: {},
  methods: {
    handleSelectionChange(val) {
      this.selectRows = val
    },
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 2 && row.viewStatus && row.viewStatus.toUpperCase() === 'N') {
        return 'dashboard-no-read-row'
      }
      return ''
    },
    handleBatchDelete() {
      if (this.selectRows.length === 0) return this.$message.warning('请选择要删除的数据!')
      let oids = this.selectRows.map(item => item.oid)
      noticeWebsiteDelete({ oids }).then(res => {
        this.$message.success('删除成功!')
        this.getList()
      })
    },
    handleDelete(row) {
      noticeWebsiteDelete({ oids: [row.oid] }).then(res => {
        this.$message.success('删除成功!')
        this.getList()
      })
    },
    // 获取bkg未读数据
    unreadCountFn() {
      unreadCount({})
        .then(res => {
          let unreadCount = res.data.unreadCount
          if (unreadCount > 0) {
            this.setNoticeNameValue({
              name: 'BkgNoticeList',
              value: unreadCount
            })
          }
        })
        .catch(() => {})
    },
    async dynamicHeight(value) {
      let { todoTableLayout, msgTableFooter } = this.$refs
      let height = document.documentElement.clientHeight || document.body.offsetHeight

      let table = todoTableLayout && todoTableLayout.$el.getBoundingClientRect()
      let footer = msgTableFooter && msgTableFooter.$el.getBoundingClientRect()
      this.tableHeight = height - table && table.top - footer && footer.height - 10 // 表格高度=文档高度-表格距顶部距离-表格分页-容器padding间距
    },
    async getList() {
      let res = await noticeWebsiteList(this.tableQuery)
      this.tableList = res.data.list
      this.tableConfig.pagination.total = res.data.totalCount
      this.tableQuery.pageSize = res.data.pageSize
    },
    handleNoticeContent(text) {
      if (text && text.includes('/order/order/')) {
        let strArr = text.split('?')
        let regExp = /orderNo=([A-Za-z0-9]+)[&|"]/
        let orderNo = regExp.exec(text)
        if (orderNo) {
          orderNo = orderNo[1]
        }
        if (orderNo) {
          return strArr[0] + `/${orderNo}?` + strArr[1]
        } else {
          return text
        }
      } else {
        return text
      }
    },
    handleDetail(row) {
      this.detail = row
      this.open = true
    },
    cancel() {
      this.open = false
    },
    // 表格操作回调
    tableCallBack(action, arr) {
      let fn = this['handle' + action]
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
    handleSizeChange() {
      this.getList()
    },
    handleCurrentChange() {
      this.getList()
    },
    ...mapMutations('notice', ['setNoticeNameValue'])
  }
}
</script>

<style lang="scss">
.msg-form-wrap {
  padding: 0 10px;
}
.todo-table-layout {
  .cell.el-tooltip {
    overflow: hidden;
  }
  .msg-op-btn.el-button--mini {
    padding: 0;
  }
  .content-link {
    display: block;
    max-height: 18px;
    p {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
}

.msg-detail .el-form-item {
  margin-bottom: 0;
}
.msg-detail .el-form-item__label {
  color: #999;
}
.msg-detail .el-form-item__content {
  font-size: 12px;
}
.msg-detail .el-form-item__content .content-link a {
  color: #3e80f5;
  text-decoration: underline;
}
.content-link a {
  color: #3e80f5;
  text-decoration: underline;
}

.msg-form-wrap .pagenation-cont {
  text-align: right;
  margin-top: 8px;
}
</style>
