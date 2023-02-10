<template>
  <div class="finance-page">
    <!-- <FinanceSearch :searchOption="searchOption" @search="search" :border="true" /> -->
    <div class="finance-list-container">
      <div v-if="isFirst" v-loading="isFirst"></div>
      <FinanceTable v-else :option="tableOption" />
    </div>
    <configDialog :dialog-visible="dialogVisible" ref="configDialog" @relateSuc="getData" />
  </div>
</template>
<script>
import Vue from 'vue'
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import configDialog from '@/views/exec/bkg/components/configDialog'
import { msgNoticeList, msgResend } from '@/api/exec/autobook'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin as mixin2 } from '@/views/finance/voucher/mixin'
import { dateFormat } from '@/views/finance/utils/finance'
import { getDictLabel } from '@/utils/tools'

// 统一设置规则提醒
const ruleMsg = [{ required: true, message: '请填写内容', trigger: 'blur' }]
//订单状态
let BOBJ = {} // 业务类型 对象
let SOBJ = {} // 服务模块 对象

export default {
  name: 'configureList',
  mixins: [mixin, mixin2],
  data() {
    return {
      // 列表页--表格配置
      tableOption: {},
      // 列表页--搜索配置
      searchOption: {},
      // 列表页--选中行
      multipleSelection: [],
      isFirst: true,
      //弹框标题
      title: '',
      //弹框开关
      open: false,
      action: '',
      // 查询条件
      tableQuery: {
        columns: [],
        query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
        currPage: 1,
        pageSize: 10,
      },
      roleOptions: [],
      feeItemList: [],
      loading: false,
      dialogVisible: { show: false },
    }
  },
  watch: {},
  // table基础组件
  components: {
    FinanceTable,
    FinanceSearch,
    configDialog,
  },
  async created() {
    this.isFirst = false
    // 搜索配置
    this.searchOption = {
      columns: [],
      data: {},
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true }
    this.tableOption = { ...this.option, id: 'tableOption', pagination }
    this.tableOption.operationBtns.data = [
      {
        label: '重发',
        type: 'text',
        show: true,
        action: 'showDetail',
      },
    ]
    this.tableOption.selection = ''
    this.tableOption.operationBtns.width = '100px'
    this.tableOption.columns = [
      {
        label: '消息类型',
        prop: 'msgType',
        type: 'text',
        formatter: (row) => {
          return getDictLabel('bkgMsgType', row.msgType)
        },
      },
      {
        label: '消息标题',
        prop: 'title',
        width: 180,
        isTooltip: true,
      },
      {
        label: '消息内容',
        prop: 'content',
        width: 180,
        isTooltip: true,
      },
      {
        label: '起运港',
        prop: 'pol',
        type: 'text',
      },
      {
        label: '目的港',
        prop: 'pod',
        type: 'text',
      },
      {
        label: '任务状态',
        prop: 'status',
        type: 'select',
        propInDict: 'bkgMsgSendStatus',
      },
      {
        label: '任务通知类型',
        prop: 'noticeType',
        type: 'select',
        propInDict: 'bkgNoticeType',
      },
      {
        label: '任务通知邮箱',
        prop: 'noticeEmail',
        type: 'text',
      },
    ]
    this.getData()
  },
  methods: {
    search(result) {
      this.searchResult = typeof result === 'string' ? result : this.searchResult
      this.tableOption.pagination.currPage = 1
      this.getData(true)
    },
    getData() {
      // this.loading = true
      let data = {
        currPage: this.tableOption.pagination.currPage,
        pageSize: this.tableOption.pagination.pageSize,
        query: [],
      }
      let obj = this.searchOption.data
      for (let key in obj) {
        let value = obj[key]
        if (key === 'updateDate') {
          Vue.set(data, 'updateDateFrom', dateFormat('yyyy-mm-dd', value[0]))
          Vue.set(data, 'updateDateTo', dateFormat('yyyy-mm-dd', value[1]))
        } else {
          Vue.set(data, key, value.trim())
        }
      }
      // console.log('data:', data)
      msgNoticeList(data)
        .then((res) => {
          let { list } = res.data
          this.tableOption.data = list
          this.tableOption.pagination.currPage = res.data.currPage
          this.tableOption.pagination.pageSize = res.data.pageSize
          this.tableOption.pagination.totalCount = res.data.totalCount
        })
        .catch(console.log)
    },
    addConfigDialog(row) {
      this.dialogVisible.show = true
      this.$nextTick(() => {
        this.$refs.configDialog.init(row)
      })
    },
    // 详情
    showDetail(row) {
      msgResend({
        id: row.id,
      }).then((res) => {
        this.$message({
          type: 'success',
          message: '重发成功',
          duration: 1000,
          onClose: () => {
            this.tableQuery.currPage = 1
            this.getData()
          },
        })
      })
    },
    //删除
    handleDelete($index, row, option) {
      this.$confirm('是否确认删除该条配置?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          configureDelete({
            id: row.id,
          }).then((res) => {
            this.$message({
              type: 'success',
              message: '删除成功',
              duration: 1000,
              onClose: () => {
                this.tableQuery.currPage = 1
                this.getData()
              },
            })
          })
        })
        .catch((err) => {})
    },
  },
}
</script>