<template>
  <div
    :element-loading-background="elementLoadingBackground"
    :element-loading-spinner="elementLoadingSpinner"
    :element-loading-text="elementLoadingText"
    class="finance-page"
    v-loading="lsLoading"
  >
    <FinanceSearch :border="true" :searchOption="searchOption" @search="search" />
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button @click="addTask" class="finance-btn" size="mini" type="primary">新增</el-button>
          <el-button-group>
            <el-button @click="startTask" class="finance-btn" size="mini">启动任务</el-button>
            <el-button @click="stopTask" class="finance-btn" size="mini">暂停任务</el-button>
          </el-button-group>
          <el-button-group>
            <el-button @click="deleteTask" class="finance-btn" size="mini">删除任务</el-button>
          </el-button-group>
        </div>
        <div class="money-box-right"></div>
      </div>
      <FinanceTableMass :option="option1" @send-multi="sendMulti" />
    </div>
    <div v-if="oneData.show">
      <OneTaskDialog :oneData="oneData" @cancel="closeOneDialog" @submit="oneSubmit" />
    </div>
    <div class="show-log" v-if="logOption.show">
      <TaskLog :config="logOption" />
    </div>
  </div>
</template>

<script>
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import TaskLog from './taskLog'
import OneTaskDialog from '@/views/exec/bkg/components/oneTaskDialog'
import {
  onePort,
  oneStart,
  oneStop,
  oneDelete,
  oneUpdate,
  oneList,
  oneUserList
} from '@/api/exec/cosco'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
export default {
  components: {
    FinanceSearch,
    FinanceTableMass,
    TaskLog,
    OneTaskDialog
  },
  mixins: [mixin],
  data() {
    return {
      lsLoading: false,
      searchOption: {},
      option1: {},
      companyList: [],
      multipleSelection1: [],
      logOption: {
        show: false,
        taskType: 'one',
        taskId: ''
      },
      oneData: {
        show: false,
        source: ''
      }
    }
  },
  created() {
    this.searchCompany()
    this.searchOption = {
      addFilter: {
        defaultSearchLength: 5,
        searchInputGroup: [
          { key: 'companyCode', value: '', showType: '1' },
          { key: 'polName', value: '', showType: '2' },
          { key: 'podName', value: '', showType: '3' },
          { key: 'bookMinDate', value: '', showType: '4' },
          { key: 'status', value: '', showType: '5' }
        ],
        filterGroups: {
          companyCode: {
            label: '分公司',
            type: 'select',
            showType: '1',
            selectOptions: this.companyList,
            filterable: true
          },
          polName: {
            label: '起始地',
            type: 'remoteSelect',
            showType: '2',
            remoteMethod: (str, item, row) => {
              this.searchPort(str, item)
            },
            visibleChange: (str, item, row) => {
              this.searchPort(str, item)
            },
            remoteSelectList: []
          },
          podName: {
            label: '目的地',
            type: 'remoteSelect',
            showType: '3',
            remoteMethod: (str, item, row) => {
              this.searchPort(str, item)
            },
            visibleChange: (str, item, row) => {
              this.searchPort(str, item)
            },
            remoteSelectList: []
          },
          bookMinDate: {
            label: '订舱起始时间',
            type: 'date',
            showType: '4'
          },
          status: {
            label: '任务状态',
            type: 'select',
            prop: 'bkgTaskStatus',
            showType: '5'
          }
        }
      }
    }
    const pagination = Object.assign({}, this.option.pagination, { show: true })
    const operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        { label: '复制', type: 'text', show: true, action: 'Delete' },
        { label: '详情', type: 'text', show: true, action: 'showDetail' },
        { label: '日志', type: 'text', show: true, action: 'showLog' }
      ],
      width: 120
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [],
      tips: false,
      operationBtns,
      pagination
    })
    this.option1.columns = [
      {
        label: '任务名称',
        prop: 'taskType',
        propInDict: 'bkgTaskName',
        type: 'select'
      },
      { label: '分公司', prop: 'companyName' },
      { label: '起始地', prop: 'polName', width: 140 },
      { label: '目的地', prop: 'podName', width: 140 },
      { label: '箱型', prop: 'containerType' },
      { label: '计划订舱次数', prop: 'containerCount',width: 110 },
      { label: '任务开始时间', prop: 'taskStartTime' },
      { label: '任务结束时间', prop: 'taskEndTime' },
      {
        label: '任务状态',
        prop: 'status',
        propInDict: 'bkgTaskStatus',
        type: 'select'
      },
      { label: '任务执行次数', prop: 'runTimes' },
      {
        label: '任务通知类型',
        prop: 'noticeType',
        type: 'select',
        propInDict: 'bkgNoticeType',
        width: 120
      },
      // { label: '支付地点', prop: 'payLocation' },
      // { label: '订舱办事处', prop: 'bookOrg' },
      { label: '最大可定金额', prop: 'maxPrice', width: 120 }
    ]
    this.getData()
  },
  activated() {
    this.getData()
  },
  methods: {
    // 搜索
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    // 获取列表
    getData(isSearch) {
      this.lsLoading = true
      const data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: []
      }
      this.searchOption.addFilter.searchInputGroup.forEach(item => {
        const { key, value, valueReq } = item
        if (valueReq && item[valueReq]) {
          data.query.push({
            column: valueReq,
            type: 'eq',
            value: item[valueReq]
          })
          return
        }
        if (value) {
          if (value instanceof Array) {
            if (key === 'startDate') {
              data.query.push({
                column: 'startDate',
                type: 'ge',
                value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00'
              })
              data.query.push({
                column: 'endDate',
                type: 'le',
                value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59'
              })
            }
          } else {
            data.query.push({
              column: key,
              value: value,
              type: 'like'
            })
          }
        }
      })
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      oneList(data)
        .then(res => {
          const { list } = res.data
          this.option1.data = list
          this.option1.pagination.currPage = res.data.currPage
          this.option1.pagination.pageSize = res.data.pageSize
          this.option1.pagination.totalCount = res.data.totalCount
        })
        .catch(() => {})
        .finally(() => {
          this.lsLoading = false
        })
    },
    // 新建任务
    addTask() {
      this.oneData.source = ''
      this.oneData.show = true
    },
    // 关闭新建弹窗
    closeOneDialog() {
      this.oneData.show = false
    },
    // 提交新建弹窗
    oneSubmit(source) {
      const {
        bookId,
        taskId,
        taskType,
        companyCode,
        companyName,
        taskStartTime,
        taskEndTime,
        noticeType,
        noticeEmail,
        noticeDingToken,
        polName,
        podName,
        containerType,
        containerCount,
        maxPrice,
        bookMinDate,
        bookOrg,
        payLocation
      } = source
      const data = {
        oneTaskBookDto: {
          bookId,
          bookOrg,
          bookMinDate,
          containerType,
          containerCount,
          polName,
          podName,
          maxPrice,
          payLocation
        },
        taskId,
        taskType,
        companyCode,
        companyName,
        taskStartTime,
        taskEndTime,
        noticeType,
        noticeEmail,
        noticeDingToken
      }
      oneUpdate(data)
        .then(res => {
          if (res.code === 0) {
            this.closeOneDialog()
            this.$msgSucClose('保存任务成功')
            this.getData()
          }
        })
        .catch(() => {})
    },
    // 启动任务
    startTask() {
      const source = this.multipleSelection1
      const len = source.length
      if (!len) {
        return this.$msgErrClose('请先选择任务，再操作')
      }
      const taskIds = source.map(item => item.taskId)
      const data = {
        taskIds
      }
      oneStart(data)
        .then(res => {
          if (res.code === 0) {
            this.$msgSucClose('启动任务成功')
            this.getData()
          }
        })
        .catch(() => {})
    },
    // 暂停任务
    stopTask() {
      const source = this.multipleSelection1
      const len = source.length
      if (!len) {
        return this.$msgErrClose('请先选择任务，再操作')
      }
      const taskIds = source.map(item => item.taskId)
      const data = {
        taskIds
      }
      oneStop(data)
        .then(res => {
          if (res.code === 0) {
            this.$msgSucClose('暂停任务成功')
            this.getData()
          }
        })
        .catch(() => {})
    },
    // 删除任务
    deleteTask() {
      const source = this.multipleSelection1
      const len = source.length
      if (!len) {
        return this.$msgErrClose('请先选择任务，再操作')
      }
      this.$confirm('是否确认删除该任务?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.deleteTaskFn(source)
        })
        .catch(() => {})
    },
    deleteTaskFn(source) {
      const taskIds = source.map(item => item.taskId)
      const data = {
        taskIds
      }
      oneDelete(data)
        .then(res => {
          if (res.code === 0) {
            this.$msgSucClose('删除任务成功')
            this.getData()
          }
        })
        .catch(() => {})
    },
    // 表格选择操作
    sendMulti(data) {
      this.multipleSelection1 = data
    },
    // 任务复制
    handleDelete($index, row, option) {
      this.oneData.source = JSON.parse(JSON.stringify(row))
      this.oneData.source.taskId = ''
      this.oneData.source.bookId = ''
      this.oneData.show = true
    },
    // 任务详情
    showDetail(row) {
      this.oneData.source = JSON.parse(JSON.stringify(row))
      this.oneData.show = true
    },
    // 任务日志
    showLog(row) {
      const { taskId } = row
      this.logOption.taskType = 'one'
      this.logOption.taskId = taskId
      this.logOption.show = true
    },
    // 搜索分公司
    searchCompany() {
      oneUserList({})
        .then(res => {
          if (res.code === 0) {
            this.companyList = res.data.map(item => {
              return {
                label: item.companyCname,
                value: item.companyCode
              }
            })
            this.searchOption.addFilter.filterGroups.companyCode.selectOptions = this.companyList
          }
        })
        .catch(() => {})
    },
    // 港口搜索
    searchPort(str='', item) {
      onePort({ keywords: str }).then(res => {
        item.remoteSelectList = res.data.map(item => {
          const { name } = item
          return {
            label: name,
            value: name
          }
        })
      })
    },
    // 分页方法
		handleSizeChange (val) {
			this.option1.pagination.pageSize = val
			this.getData()
		},
		// 分页方法
		handleCurrentChange (val) {
			this.option1.pagination.currPage = val
			this.getData()
		},
  }
}
</script>

<style lang="scss" scoped>
</style>
