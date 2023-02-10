<template>
  <div class="app-container">
    <SearchGroup :callback="searchCallBack" :tableQuery="tableQuery" />
    <div class="table-container main-route-table">
      <TableFilter :config="tableConfig" :publishStatusOptions="publishStatusOptions" :tableQuery.sync="tableQuery" :callback="tableCallBack" />
      <BaseTableMuti v-loading="loading" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
    </div>
    <!-- 自定义表头 -->
    <div v-if="customColumnsPopShow">
      <CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
    </div>
    <!-- 自定义复制模板 -->
    <div v-if="showCopyColumns">
      <CustomColumns title="复制的模板" :showModel="false" :columnsBase="columnsBase" :configColumns="copyColumns" @close="copyColumnsClose" />
    </div>
    <!-- 附加费模板 -->
    <div v-if="editSurchargePopShow">
      <SurchargeEdit @close="surchargePopClose" :surchargeList="createItem.surchargeList" />
    </div>
    <!-- 新建弹窗 -->
    <div v-if="createOrderPopShow">
      <CreateOrder @close="createOrderPopClose" />
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { getDictLabel } from '@/utils/tools'
import SearchGroup from './components/searchGroup'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilter'
// 弹出框
import CustomColumns from '@/components/customColumns/index'
import SurchargeEdit from './components/surchargeEdit'
import TableColumnPopover from './components/tableColumnPopover'
import TableColumnPopoverPolPod from './components/tableColumnPopoverPolPod'
import clip from '@/utils/clipboard'
import CreateOrder from './components/createOrder'

import {
  airChargeCreateOrder,
  airChargeOrderList,
  mainRouteSave,
  mainRouteDelete,
  mainRoutePublishBatch,
  mainRouteInvalidBatch,
  mainRouteInfo,
  mainRouteExport
} from '@/api/charge'
import { columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
const defaultPage = {
  pageSize: -1,
  currPage: 1
}
const defaultTableQuery = {
  columns: [],
  ascColumns: [],
  descColumns: ['publishTime'],
  query: [], //
  status: 'published' //published
}
export default {
  mixins: [routerMixin],
  data() {
    return {
      oldDataList: [],
      createOrderChargeId: '',
      createOrderPopShow: false,
      copyColumns: [],
      showCopyColumns: false,
      titleSpanArr: ['操作', '序号'],
      propSpanArr: [
        'polPortCode',
        'podPortCode',
        'airLine',
        'potPortCode',
        'packageInfo',
        'flightRate',
        'beginDate',
        'prescription',
        'status',
        'maintainerName',
        'createdTime',
        'publishTime',
        'updatedName',
        'updatedTime',
        'polCountryCname',
        'podCountryCname',
        'surcharge'
      ],
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
        uniqueProp: 'chargeId', // 合并表格后，复选框，重复数据，需要根据哪个数据进行去重
        isCustomIndex: true, // 自定义下标索引，合并单元格后，索引错乱
        border: true, // 合并单元格后单元格需要有 边框
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
          show: true,
          handleCustomColumns: this.handleCustomColumns
        },
        list: [],
        configColumns: [],
        columns: [],
        objectSpanMethod: this.objectSpanMethod,
        allColumns: [
          {
            prop: 'polPortCode',
            label: '起运港',
            align: 'center',
            type: 'text',
            width: '100',
            'header-align': 'center',
            sortable: 'custom',
            formatter: (row, column) => {
              let recommend = `<i class="recommend"></i>`
              return `<div class="column-block underline">${row.polPortCode}</div>${recommend}`
            },
            method: (index, row) => {
              this.handleRouteInfo(index, row)
            }
          },
          {
            prop: 'potPortCode',
            label: '中转港',
            align: 'center',
            type: 'text',
            width: '100',
            'header-align': 'center',
            sortable: 'custom',
            formatter: (row, column) => {
              return `<div class="column-block underline">${row.potPortCode}</div>`
            },
            method: (index, row) => {
              this.handleRouteInfo(index, row)
            }
          },
          {
            prop: 'podPortCode',
            label: '目的地',
            align: 'center',
            type: 'text',
            width: '100',
            'header-align': 'center',
            sortable: 'custom',
            formatter: (row, column) => {
              return `<div class="column-block underline">${row.podPortCode}</div>`
            },
            method: (index, row) => {
              this.handleRouteInfo(index, row)
            }
          },
          {
            prop: 'polCountryCname',
            label: '起运国',
            type: 'text',
            width: '100',
            sortable: 'custom'
          },
          {
            prop: 'podCountryCname',
            label: '目的国',
            type: 'text',
            width: '100',
            sortable: 'custom'
          },
          {
            prop: 'airLine',
            label: '航空公司',
            type: 'text',
            width: '100',
            sortable: 'custom'
          },
          {
            prop: 'currency',
            label: '币别',
            type: 'text',
            width: '100'
          },
          {
            prop: 'priceCargoType',
            label: '货物类型',
            type: 'text',
            width: '100'
          },
          {
            prop: 'priceMin',
            label: '最低收费',
            type: 'text',
            width: '100',
            sortable: 'custom'
          },
          {
            prop: 'priceKg45',
            label: '+45KG',
            type: 'text',
            width: '100',
            sortable: 'custom'
          },
          {
            prop: 'priceKg100',
            label: '+100KG',
            type: 'text',
            width: '100',
            sortable: 'custom'
          },
          {
            prop: 'priceKg300',
            label: '+300KG',
            type: 'text',
            width: '100',
            sortable: 'custom'
          },
          {
            prop: 'priceKg500',
            label: '+500KG',
            type: 'text',
            width: '100',
            sortable: 'custom'
          },
          {
            prop: 'priceKg1000',
            label: '+1000KG',
            type: 'text',
            width: '100',
            sortable: 'custom'
          },
          {
            prop: 'priceKg2000',
            label: '+2000KG',
            type: 'text',
            width: '100',
            sortable: 'custom'
          },
          {
            prop: 'surcharge',
            label: '附加费',
            type: 'text',
            width: '200'
          },
          {
            prop: 'packageInfo',
            label: '包装',
            type: 'text',
            width: '100',
            sortable: 'custom',
            formatter: (row, column) => {
              return getDictLabel('airChargePackage', row.packageInfo)
            }
          },
          {
            prop: 'flightRate',
            label: '航班频率',
            type: 'text',
            width: '100',
            sortable: 'custom'
          },
          {
            prop: 'beginDate',
            label: '有效日期',
            type: 'text',
            width: '150',
            sortable: 'custom',
            formatter: (row, column) => {
              if (row.beginDate) {
                return `${row.beginDate}到${row.endDate}`
              } else {
                return ''
              }
            }
          },
          {
            prop: 'prescription',
            label: '时效',
            type: 'text',
            width: '100',
            sortable: 'custom'
          },
          {
            prop: 'status',
            label: '发布状态',
            type: 'text',
            width: '100',
            sortable: 'custom',
            formatter: (row, column) => {
              return getDictLabel('airChargeStatus', row.status)
            }
          },
          {
            prop: 'maintainerName',
            label: '维护人',
            type: 'text',
            width: '100',
            sortable: 'custom'
          },
          {
            prop: 'createdTime',
            label: '创建时间',
            type: 'text',
            width: '150',
            sortable: 'custom'
          },
          {
            prop: 'publishTime',
            label: '发布时间',
            type: 'text',
            width: '150',
            sortable: 'custom'
          },
          {
            prop: 'updatedName',
            label: '更新人',
            type: 'text',
            width: '150',
            sortable: 'custom'
          },
          {
            prop: 'updatedTime',
            label: '更新时间',
            type: 'text',
            width: '150',
            sortable: 'custom'
          }
        ],

        // 批量操作按钮
        multiOperate: [
          {
            label: '批量发布',
            action: 'MultiPublish'
          },
          {
            label: '批量失效',
            action: 'MultiInvalid'
          },
          {
            label: '批量关联附加费',
            action: 'MultiDelete'
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
              this.handleCopy(row, $index, $event)
            }
            if (action === 'CreateOrder') {
              this.createOrderChargeId = row.chargeId
              this.createOrderPopShow = true
            }
          },
          data: [
            {
              label: '详情',
              type: 'text',
              show: true,
              className: 'orange',
              action: 'Edit'
            },
            {
              label: '下单',
              type: 'text',
              show: (item, row) => {
                if (row.status === 'published') {
                  return true
                } else {
                  return false
                }
              },
              action: 'CreateOrder'
            },
            {
              label: '复制',
              type: 'text',
              show: true,
              action: 'Copy'
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

      // 显示自定义表头的弹窗状态
      customColumnsPopShow: false,
      // 附加费修改的弹窗状态
      editSurchargePopShow: false,
      isClickInfo: false
    }
  },
  created() {
    this.getList()
    let copyColumns = window.localStorage.getItem('copyColumns')
    if (copyColumns) {
      this.copyColumns = JSON.parse(copyColumns)
    }
  },
  mounted() {
    console.log(this.dictMap)
  },
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      publishStatus: (state) => state.dict.dictMap.publishStatus,
      mainRoute: (state) => state.charge.airMainRoute,
      defaultColumns: (state) => state.charge.airMainRoute.defaultColumns,
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
    TableColumnPopover,
    TableColumnPopoverPolPod,
    CreateOrder
  },
  methods: {
    // 新建订单保存
    handleCreateOrder(value) {
      let param = Object.assign(value, {
        chargeId: this.createOrderChargeId
      })
      airChargeCreateOrder(param).then((res) => {
        let orderNo = res.data
        sessionStorage.setItem('createAirOrderStr', JSON.stringify(res.data))

        let routeUrl = this.$router.resolve({
          name: 'AirTransportOrderDetail',
          params: {
            orderNo
          },
          query: {
            orderNo,
            source: 'airFreightInquiry',
            action: 'add'
          }
        })
        window.open(routeUrl.href, '_blank')
      })
    },
    // 新建订单关闭回调
    createOrderPopClose(action, value) {
      this.createOrderPopShow = false
      if (action === 'Confirm') {
        this.handleCreateOrder(value)
      }
    },
    handleCopyColumns() {
      let copyColumns = window.localStorage.getItem('copyColumns')
      if (copyColumns) {
        this.copyColumns = JSON.parse(copyColumns)
      }
      this.showCopyColumns = true
    },
    // 自定义复制模板关闭回调
    copyColumnsClose(action, value) {
      this.showCopyColumns = false
      if (action === 'Confirm') {
        this.copyColumns = value
        window.localStorage.setItem('copyColumns', JSON.stringify(value))
      }
    },
    formatTabelData(data) {
      // 格式化数据，用于合并单元格
      let result = []
      for (let i = 0; i < data.length; i++) {
        if (data[i].chargePrices && data[i].chargePrices.length > 0) {
          for (let j = 0; j < data[i].chargePrices.length; j++) {
            let obj = Object.assign(data[i].chargePrices[j], data[i])
            obj.customIndex = i + 1
            result.push(obj)
          }
        } else {
          let obj = Object.assign({}, data[i])
          obj.customIndex = i + 1
          result.push(obj)
        }
      }
      return result
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (
        this.titleSpanArr.includes(column.title) ||
        ['checkbox', 'customColumns'].includes(column.type) ||
        this.propSpanArr.includes(column.property)
      ) {
        const _row = this.filterData(this.tableConfig.list, columnIndex, column)
          .one[rowIndex]
        const _col = _row > 0 ? 1 : 0
        return {
          rowspan: _row,
          colspan: _col
        }
      }
    },
    filterData(arr, colIndex, column) {
      let spanOneArr = []
      let concatOne = 0
      arr.forEach((item, index) => {
        if (index == 0) {
          spanOneArr.push(1)
        } else {
          if (
            this.titleSpanArr.includes(column.title) ||
            ['checkbox', 'customColumns'].includes(column.type) ||
            this.propSpanArr.includes(column.property)
          ) {
            if (
              item[this.tableConfig.uniqueProp] ===
              arr[index - 1][this.tableConfig.uniqueProp]
            ) {
              spanOneArr[concatOne] += 1
              spanOneArr.push(0)
            } else {
              spanOneArr.push(1)
              concatOne = index
            }
          }
        }
      })
      return {
        one: spanOneArr
      }
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

    // 起运港下拉列表自动补充的数据
    polQuerySearch(queryString, portAttribute, state, cb) {
      this.$store
        .dispatch('dict/basePortList', { queryString, portAttribute, state })
        .then((data) => {
          cb(data)
        })
    },
    polCityQuerySearch(queryString, state, cb) {
      this.$store
        .dispatch('dict/basePortCityList', { queryString, state })
        .then((data) => {
          cb(data)
        })
    },

    // 获取订舱代理
    getSupplierList(type, queryString, item) {
      this.$store
        .dispatch('dict/querySupplierList', {
          category: type,
          queryString: queryString
        })
        .then((data) => {
          if (data.list && data.list.length) {
            item.data = data.list.map((ele) => {
              return Object.assign(ele, {
                label: this.$language == 'en' ? ele.ename : ele.name,
                value: ele.supplierId
              })
            })
          } else {
            item.data = []
          }
        })
    },

    // 远程搜索港口下拉数据
    portSearch(queryString, portAttribute, state, type, item) {
      this.$store
        .dispatch('dict/basePortList', { queryString, portAttribute, state })
        .then((data) => {
          let portList = data.map((ele) => {
            return Object.assign(ele, {
              label: ele.value,
              value: ele.key
            })
          })
          item.data = portList
        })
    },

    // 中转港下拉数据
    transitPortSearch(val, portAttribute, state, row) {
      this.$store
        .dispatch('dict/basePortList', { val, portAttribute, state })
        .then((data) => {
          let transitPortList = data.map((item) => {
            return Object.assign(item, {
              label: item.value,
              value: item.key
            })
          })
          // this.filterGroups.transitPortCodes.data = transitPortList
          if (row) {
            row.data = transitPortList
          }
          console.log(row.data)
        })
    },

    // 系统航线下拉列表自动补充的数据
    sysLineQuerySearch(queryString, cb) {
      this.$store
        .dispatch('dict/baseSystemLineList', {
          name: queryString,
          state: 'valid'
        })
        .then((data) => {
          cb(data)
        })
    },

    // 船公司下拉列表自动补充的数据
    shipQuerySearch(queryString, cb) {
      this.$store
        .dispatch('dict/baseShippingCarrierList', {
          name: queryString,
          state: ''
        })
        .then((data) => {
          cb(data)
        })
    },

    // 运输条款下拉列表自动补充的数据
    shipTermsQuerySearch(queryString, cb) {
      this.$store.dispatch('dict/baseShipTermsList').then((data) => {
        cb(data)
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
      let publishStatusQuery = [
        { column: 'status', type: 'eq', value: this.tableQuery.status }
      ]
      if (this.tableQuery.status === '') {
        publishStatusQuery = [
          {
            column: 'status',
            type: 'in',
            value: 'no_publish,published,invalid'
          }
        ]
      }
      // 合并发布状态参数
      let data = {}
      Object.assign(data, this.tableQuery, {
        query: this.tableQuery.query.concat(publishStatusQuery)
      })

      delete data.status
      return data
    },

    // 列表数据
    async getList() {
      this.loading = true
      let data = this.getListQuery()
      let res = await columnWidthConfigInfo({
        scenesCode: this.$route.name
      })
      let { columnWidthList } = res.data
      airChargeOrderList(data)
        .then((response) => {
          let { list, totalCount, allColumns, configColumns } = response.data
          this.oldDataList = JSON.parse(JSON.stringify(response.data.list))
          this.tableConfig.list = this.formatTabelData(list)

          this.tableConfig.pagination.total = totalCount
          this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
          this.tableConfig.pagination.hasPreviousPage =
            response.data.hasPreviousPage
          this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
          this.tableConfig.pagination.isLastPage = response.data.isLastPage
          this.tableQuery.currPage = response.data.currPage
          this.tableQuery.pageSize = response.data.pageSize
          this.tableConfig.configColumns = configColumns.length
            ? configColumns
            : this.defaultColumns
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

    // table导出
    handleExport() {
      let data = this.getListQuery()
      let routeIds = this.getRouteIds()
      if (routeIds.length > 0) {
        let routeIdQuery = {
          column: 'routeIds',
          type: 'eq',
          value: routeIds.join(',')
        }
        Object.assign(data, this.tableQuery, {
          query: this.tableQuery.query.concat(routeIdQuery)
        })
      }
      mainRouteExport(data).then((res) => {
        this.downLoad(res.data.fileNo, res.data.name)
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

    // 自定义表头
    handleCustomColumns() {
      this.customColumnsPopShow = true
    },

    // 发布状态筛选
    handleSearchByPublishStatus() {
      this.tableConfig.operationBtns.data.map((item) => {
        if (item.action === 'Delete') {
          if (
            this.tableQuery.status === 'unpublished' ||
            this.tableQuery.status === 'invalid'
          ) {
            // 解锁状态显示保存按钮
            Object.assign(item, {
              show: true
            })
          } else {
            Object.assign(item, {
              show: false
            })
          }
        }
      })
      this.tableQuery.currPage = 1
      this.getList()
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
      let routeImportToMainRoute = sessionStorage.getItem(
        'airRouteImportToMainRoute'
      )
      if (routeImportToMainRoute) {
        this.tableQuery.state = 'unpublished'
      }
      this.getList()
    },

    // 表格操作回调
    tableCallBack(action, arr) {
      let fn = this['handle' + action]
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
    handleRouteInfo(index, row) {
      this.handleEdit(row)
    },
    // 去编辑页
    handleEdit(row) {
      this.routerPush('AirFreightInquiryDetail', {
        id: row.chargeId
      })
    },

    // 复制
    handleCopy(data, index, e) {
      let row = this.oldDataList.find((el) => el.chargeId == data.chargeId)
      console.log(row)
      let rowString = ''
      let cloumnArray = []
      let { allColumns, columns } = this.tableConfig
      if (this.copyColumns.length) {
        this.copyColumns.forEach((item) => {
          let base = allColumns.filter((ele) => ele.prop === item)[0]
          cloumnArray.push(base)
        })
      } else {
        cloumnArray = columns
      }
      console.log(cloumnArray)
      let fag = true
      cloumnArray.map((item) => {
        if (!row[item.prop]) {
          if (
            [
              'priceCargoType',
              'currency',
              'priceMin',
              'priceKg45',
              'priceKg100',
              'priceKg300',
              'priceKg500',
              'priceKg1000',
              'priceKg2000'
            ].includes(item.prop)
          ) {
            if (row.chargePrices.length && fag) {
              fag = false
              rowString += '价格信息：' + '\n'
              for (let i = 0; i < row.chargePrices.length; i++) {
                let str = `${i + 1}:`
                if (
                  row.chargePrices[i].priceCargoType &&
                  cloumnArray.find((el) => el.prop === 'priceCargoType')
                ) {
                  str += '货物类型：' + row.chargePrices[i].priceCargoType + '；'
                }
                if (
                  row.chargePrices[i].currency &&
                  cloumnArray.find((el) => el.prop === 'currency')
                ) {
                  str += '币别：' + row.chargePrices[i].currency + '；'
                }
                if (
                  row.chargePrices[i].priceMin &&
                  cloumnArray.find((el) => el.prop === 'priceMin')
                ) {
                  str += '最低收费：' + row.chargePrices[i].priceMin + '；'
                }
                if (
                  row.chargePrices[i].priceKg45 &&
                  cloumnArray.find((el) => el.prop === 'priceKg45')
                ) {
                  str += '+45KG：' + row.chargePrices[i].priceKg45 + '；'
                }
                if (
                  row.chargePrices[i].priceKg100 &&
                  cloumnArray.find((el) => el.prop === 'priceKg100')
                ) {
                  str += '+100KG：' + row.chargePrices[i].priceKg100 + '；'
                }
                if (
                  row.chargePrices[i].priceKg300 &&
                  cloumnArray.find((el) => el.prop === 'priceKg300')
                ) {
                  str += '+300KG：' + row.chargePrices[i].priceKg300 + '；'
                }
                if (
                  row.chargePrices[i].priceKg500 &&
                  cloumnArray.find((el) => el.prop === 'priceKg500')
                ) {
                  str += '+500KG：' + row.chargePrices[i].priceKg500 + '；'
                }
                if (
                  row.chargePrices[i].priceKg1000 &&
                  cloumnArray.find((el) => el.prop === 'priceKg1000')
                ) {
                  str += '+1000KG：' + row.chargePrices[i].priceKg1000 + '；'
                }
                if (
                  row.chargePrices[i].priceKg2000 &&
                  cloumnArray.find((el) => el.prop === 'priceKg2000')
                ) {
                  str += '+2000KG：' + row.chargePrices[i].priceKg2000 + '；'
                }
                rowString += str + '\n'
              }
              return
            } else {
              return
            }
          } else {
            return
          }
        }
        if (item.prop == 'status') {
          rowString +=
            item.label +
            ':' +
            (getDictLabel('airChargeStatus', row.status)
              ? getDictLabel('airChargeStatus', row.status)
              : '--') +
            ',\n'
        } else if (item.prop == 'beginDate') {
          rowString +=
            item.label + ':' + row.beginDate + '到' + row.endDate + ',\n'
        } else {
          rowString +=
            item.label + ':' + (row[item.prop] ? row[item.prop] : '--') + ',\n'
        }
      })
      if (!rowString) {
        rowString = ' '
      }
      clip(rowString, e)
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
    getColumnsValues(value) {
      let result = []
      value.map((item) => {
        if (this.specialColumns[item]) {
          result = result.concat(this.specialColumns[item])
        } else {
          result.push(item)
        }
      })

      result = Array.from(new Set(result))
      return result
    },
    // 自定义表头关闭回调
    customColumnsPopClose(action, value) {
      this.customColumnsPopShow = false
      if (action === 'Confirm') {
        let columnsKeys = this.getColumnsValues(value)
        Object.assign(this.tableQuery, {
          columns: columnsKeys
        })
        this.getList()
      }
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
