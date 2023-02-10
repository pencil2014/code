<template>
  <div class="app-container">
    <SearchGroup :callback="searchCallBack" :tableQuery="tableQuery" />
    <div class="table-container main-route-table">
      <TableFilter :config="tableConfig" :publishStatusOptions="publishStatusOptions" :tableQuery.sync="tableQuery" :callback="tableCallBack" />
      <BaseTableMuti v-loading="loading" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
    </div>
    <!-- 附加费模板 -->
    <div v-if="editSurchargePopShow">
      <SurchargeEdit @close="surchargePopClose" :surchargeList="createItem.surchargeList" />
    </div>
    <div v-if="showAddInquiryPop">
      <AddSurchargeTem @close="addInquiryClose" :detailData="detailData"></AddSurchargeTem>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { getDictLabel } from '@/utils/tools'
import SearchGroup from './components/searchGroupTem'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilterTem'
// 弹出框
import CustomColumns from '@/components/customColumns/index'
import SurchargeEdit from './components/surchargeEdit'
import AddSurchargeTem from './components/addSurchargeTem'

import {
  airSurchargeTemplatePageList,
  airSurchargeTemplatePageCopy,
  airSurchargeTemplatePageSave,
  mainRouteSave,
  airSurchargeTemplatePageDelete,
  mainRoutePublishBatch,
  mainRouteInvalidBatch
} from '@/api/charge'
import { columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
const defaultPage = {
  pageSize: -1,
  currPage: 1
}
const defaultTableQuery = {
  columns: [],
  ascColumns: [],
  descColumns: ['createdTime'],
  query: []
}
export default {
  mixins: [routerMixin],
  data() {
    return {
      detailData: null,
      showAddInquiryPop: false,
      createOrderChargeId: '',
      loading: true,
      state: '',
      defaultStyle: {
        width: '100%'
      },
      createItem: {
        oceanFreightList: [], // 海运费
        surchargeList: [] // 附加费
      },

      tableQuery: Object.assign({}, defaultTableQuery, defaultPage),

      // table复选框多选的值
      selectedCheckbox: [],
      // 保存的复选框多选
      saveSelectedCheckbox: [],

      // table基础组件
      tableConfig: {
        style: {},
        tableIndex: {
          show: true
        },
        options: {
          // 是否支持解锁列表修改
          lockState: true,

          // 是否支持列表项选中功能
          mutiSelect: true,

          // 多选框状态判断 {false不可选, true可选}
          checkSelectable() {
            return true
          }
        },
        customColumns: {
          show: false
        },
        list: [],
        configColumns: [],
        columns: [],
        objectSpanMethod: null,
        allColumns: [
          {
            prop: 'templateName',
            label: '附加费名称',
            type: 'text'
          },
          {
            prop: 'createdName',
            label: '创建人',
            type: 'text'
          },
          {
            prop: 'createdTime',
            label: '创建时间',
            type: 'text'
          },
          {
            prop: 'surcharge',
            label: '费用详情',
            type: 'text'
          }
        ],

        // 操作按钮组
        operationBtns: {
          minWidth: '120',
          fixed: 'right',
          show: true,
          resizable: true,
          callback: (action, $index, row, item, $event) => {
            if (action === 'Edit') {
              this.handleEdit(row)
            }
            if (action === 'Copy') {
              this.handleCopy(row)
            }
            if (action === 'Del') {
              this.handleDel(row)
            }
          },
          data: [
            {
              label: '编辑',
              type: 'text',
              show: true,
              className: 'orange',
              action: 'Edit'
            },
            {
              label: '复制',
              type: 'text',
              show: true,
              action: 'Copy'
            },
            {
              label: '删除',
              type: 'text',
              className: 'red',
              show: true,
              action: 'Del'
            }
          ]
        },

        // 操作提示
        tips: {
          text: '',
          show: false
        },

        // 分页
        pagination: {
          oldPagination: false,
          show: true,
          total: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          isFirstPage: false,
          isLastPage: false
        }
      },
      // 附加费修改的弹窗状态
      editSurchargePopShow: false,
      isClickInfo: false,
      defaultColumns: [
        'templateName',
        'createdName',
        'createdTime',
        'surcharge'
      ]
    }
  },
  created() {
    this.getList()
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      publishStatus: (state) => state.dict.dictMap.publishStatus,
      mainRoute: (state) => state.charge.airMainRoute,
      specialColumns: (state) => state.charge.airMainRoute.specialColumns,
      columnsBase: (state) => state.charge.airMainRoute.columnsBase
    }),
    publishStatusOptions() {
      let publishStatusOptions = {}
      this.publishStatus.forEach((item) => {
        publishStatusOptions[item.value] = item.label
      })
      return publishStatusOptions
    }
  },
  components: {
    SearchGroup,
    BaseTableMuti,
    TableFilter,
    CustomColumns,
    SurchargeEdit,
    AddSurchargeTem
  },
  methods: {
    handleEdit(row) {
      this.detailData = row
      this.showAddInquiryPop = true
    },
    handleAdd() {
      this.detailData=null
      this.showAddInquiryPop = true
    },
    addInquiryClose(action, value) {
      if (action === 'Confirm') {
        let msg = '新增成功'
        let params = {
          templateName: value.templateName,
          surcharges: value.list
        }
        if (value.templateId) {
          params.templateId = value.templateId
          msg = '编辑成功'
        }
        airSurchargeTemplatePageSave(params).then((res) => {
          this.$message.success(msg)
          this.showAddInquiryPop = false
          this.getList()
        })
      } else {
        this.showAddInquiryPop = false
      }
    },
    handleCopy(row) {
      airSurchargeTemplatePageCopy(row.templateId).then((res) => {
        this.$message.success('复制成功')
        this.getList()
      })
    },
    handleDel(row) {
      this.$confirm('是否确认删除该条附加费模板?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        lockScroll: 'true',
        type: 'warning'
      })
        .then(() => {
          airSurchargeTemplatePageDelete(row.templateId).then((res) => {
            this.$message.success('删除成功')
            this.getList()
          })
        })
        .catch(function () {})
    },
    // 拿价人
    pricerQuerySearch(queryString, item) {
      let params = {}
      Object.assign(params, {
        name: queryString,
        state: 'valid'
      })
      this.$store.dispatch('dict/employeeSelectlist', params).then((data) => {
        item.data = data.map((ele) => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
      })
    },

    searchCallBack(action) {
      if (action === 'Search') {
        this.getList()
      }
      if (action === 'Reset') {
        this.getList()
        Object.assign(this.tableConfig, { tips: { text: '', show: false } })
      }
    },

    // 获取列表请求参数
    getListQuery() {
      // 合并发布状态参数
      return this.tableQuery
    },

    // 列表数据
    async getList() {
      this.loading = true
      let data = this.getListQuery()
      let res = await columnWidthConfigInfo({
        scenesCode: this.$route.name
      })
      let { columnWidthList } = res.data
      airSurchargeTemplatePageList(data)
        .then((response) => {
          let { list, totalCount } = response.data
          this.tableConfig.list = list || []

          this.tableConfig.pagination.total = totalCount
          this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
          this.tableConfig.pagination.hasPreviousPage =
            response.data.hasPreviousPage
          this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
          this.tableConfig.pagination.isLastPage = response.data.isLastPage
          this.tableQuery.currPage = response.data.currPage
          this.tableQuery.pageSize = response.data.pageSize
          this.tableConfig.configColumns = this.defaultColumns
          this.handleFilterColumns(this.tableConfig.configColumns)
          this.tableConfig.columns.map((item) => {
            // 取服务器返回的宽度
            let findItem = columnWidthList.find(
              (ele) => ele.column === item.prop
            )
            let newWidth = findItem ? findItem.width : ''
            return Object.assign(item, { width: newWidth || item.width })
          })
          this.tableColumnsWidthList = this.getTableColumnsWidth()
        })
        .finally(() => {
          this.loading = false
        })
    },
    downLoad(fileNo, fileName) {
      this.$store
        .dispatch('charge/downloadBlobFile', {
          uri: '/base/webapi/file/download',
          params: {
            fileNo: fileNo
          }
        })
        .then((res) => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = fileName
          link.click()
        })
    },
    // 批量发布
    handleMultiPublish() {
      if (!this.selectedCheckbox.length) {
        return this.$message.error('请先选择')
      }
      let data = {
        chargeIds: this.getRouteIds()
      }
      const loading = this.$loading()
      mainRoutePublishBatch(data)
        .then((response) => {
          this.saveSelectedCheckbox = response.data
          this.$message({
            type: 'success',
            message: '发布成功',
            duration: 1000,
            onClose: () => {
              this.tableQuery.currPage = 1
              this.getList()
              loading.close()
            }
          })
        })
        .catch((err) => {
          loading.close()
        })
    },

    // 批量失效
    handleMultiInvalid() {
      if (!this.selectedCheckbox.length) {
        return this.$message.error('请先选择')
      }
      let data = {
        chargeIds: this.getRouteIds()
      }
      const loading = this.$loading()
      mainRouteInvalidBatch(data)
        .then((response) => {
          this.saveSelectedCheckbox = response.data
          this.$message({
            type: 'success',
            message: '成功',
            duration: 1000,
            onClose: () => {
              this.tableQuery.currPage = 1
              this.getList()
              loading.close()
            }
          })
        })
        .catch((err) => {
          loading.close()
        })
    },
    // 切换列表锁定状态
    handleChangeLockState() {
      this.tableConfig.options.lockState = !this.tableConfig.options.lockState
      this.tableConfig.operationBtns.data.map((item) => {
        // 解锁表格操作显示保存按钮
        if (item.action === 'SingleEdit') {
          // 解锁状态显示保存按钮
          if (!this.tableConfig.options.lockState) {
            Object.assign(item, {
              show: true
            })
          } else {
            Object.assign(item, {
              show: false
            })
            this.getList()
          }
        }
      })
    },
    // 多选
    handleMuti(arr) {
      this.selectedCheckbox = arr
    },

    handleSizeChange() {
      this.getList()
    },

    handleCurrentChange(val) {
      // 刷新页面的先调自定义搜索查询接口，拿到自定义的搜索条件再调getList接口
      if (val) {
        this.tableQuery.currPage = val
      }
      this.getList()
    },

    // 表格操作回调
    tableCallBack(action, arr) {
      let fn = this['handle' + action]
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
    // 远程排序
    handleSort() {
      this.getList()
    },

    // 过滤显示自定义的表头
    handleFilterColumns(value) {
      let { allColumns, columns } = this.tableConfig
      let temp = []
      let arr = []
      temp = allColumns.filter((item, index) => {
        return value.includes(item.prop)
      })

      // 排序 temp
      temp.sort((prev, next) => {
        const p = value.indexOf(prev.prop)
        const n = value.indexOf(next.prop)
        return p - n
      })

      temp.map((item) => {
        arr.push(item.prop)
      })

      Object.assign(this.tableConfig, {
        columns: temp,
        configColumns: arr
      })
    },
    // 获取table选中行的routeid
    getRouteIds() {
      let routeIds = []
      this.selectedCheckbox.forEach((item) => {
        routeIds.push(item.routeId)
      })
      return routeIds
    },

    // 附加费修改关闭回调
    surchargePopClose(action, value) {
      let data = {}
      Object.assign(data, {
        surchargeList: value,
        routeId: this.createItem.routeId
      })
      this.editSurchargePopShow = false
      if (action === 'Confirm') {
        mainRouteSave(data).then((response) => {
          this.$message({
            type: 'success',
            message: '保存成功',
            duration: 1000,
            onClose: () => {
              this.tableQuery.currPage = 1
              this.getList()
            }
          })
        })
      }
    },
    // 自定义列宽查询
    getTableColumnWidthInfo() {
      columnWidthConfigInfo({
        scenesCode: this.$route.name
      }).then((res) => {
        // console.log('res', res)
        // console.log('this.tableConfig.columns', this.tableConfig.columns)
        let { columnWidthList } = res.data
        // table列宽重新渲染
        this.tableConfig.columns.map((item) => {
          let findItem = columnWidthList.find((ele) => ele.column === item.prop)
          // 服务器返回的新的列宽宽度
          let newWidth = findItem ? Math.min(findItem.width, item.minWidth) : ''
          return Object.assign(item, { width: newWidth || item.width })
        })
        this.tableColumnsWidthList = this.getTableColumnsWidth()
        // console.log('this.tableColumnsWidthList', this.tableColumnsWidthList)
      })
    },
    // 获取本地table列表的字段和宽为数组集合
    getTableColumnsWidth() {
      let result = this.tableConfig.columns.map((item) => {
        return { column: item.prop, width: item.width }
      })
      return result
    },
    // 自定义列宽度保存
    handleSaveColumnWidth(params) {
      // console.log(params)
      let data = this.tableColumnsWidthList.map((item) => {
        if (item.column === params.prop) {
          item.width = params.width
        }
        return { ...item }
      })
      columnWidthConfigSave({
        scenesCode: this.$route.name,
        columnWidthList: data
      })
        .then((res) => {})
        .finally(() => {})
    }
  }
}
</script>
<style lang="scss" scoped>
.main-route-table {
  /deep/ .vxe-table--render-default {
    tr {
      td {
        padding-top: 0px;
        padding-bottom: 0px;
        // height: 36px !important;
      }
      .vxe-cell {
        line-height: 16px;
      }
    }
  }
}
</style>
