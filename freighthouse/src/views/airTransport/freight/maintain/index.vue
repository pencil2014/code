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
    <!-- 附加费模板 -->
    <div v-if="editSurchargePopShow">
      <SurchargeEdit @close="surchargePopClose" />
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

import {
  airChargeAddSurcharges,
  airChargeCopy,
  airChargeDeletey,
  airChargePublish,
  airChargeInvalid,
  airChargeMaintainList,
  airChargeExport
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
  query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
  status: ''
}
export default {
  mixins: [routerMixin],
  data() {
    return {
      editSurchargeId: [],
      importId: this.$route.query.importId,
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
                return `${row.beginDate}至${row.endDate}`
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
            action: 'Surcharge'
          }
        ],

        // 操作按钮组
        operationBtns: {
          minWidth: '120',
          fixed: 'right',
          show: true,
          resizable: true,
          callback: (action, $index, row, item) => {
            if (action === 'Edit') {
              this.handleEdit(row)
            }
            if (action === 'Copy') {
              this.handleCopy(row)
            }
            if (action === 'Delete') {
              this.handleDelete(row.chargeId)
            }
            if (action === 'Invalid') {
              this.handleInvalid(row.chargeId)
            }
          },
          data: [
            {
              label: '详情',
              type: 'text',
              show: true,
              action: 'Edit'
            },
            {
              label: '复制',
              type: 'text',
              show: true,
              action: 'Copy'
            },
            {
              label: '失效',
              type: 'text',
              show: (item, row) => {
                if (row.status === 'published') {
                  return true
                } else {
                  return false
                }
              },
              className: 'orange',
              action: 'Invalid'
            },
            {
              label: '删除',
              type: 'text',
              show: true,
              className: 'red',
              action: 'Delete',
              show: (item, row) => {
                if (row.status === 'no_publish') {
                  return true
                } else {
                  return false
                }
              }
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
  },
  mounted() {
    console.log(this.dictMap)
  },
  beforeRouteLeave(to, from, next) {
    sessionStorage.removeItem('airRouteImportToMainRoute')
    next()
  },
  beforeRouteEnter(to, from, next) {
    if (from.name == 'AirFreightRateImport') {
      to.meta.isUseCache = false
    } else {
      to.meta.isUseCache = true
    }
    next()
  },
  destroyed() {
    sessionStorage.removeItem('airRouteImportToMainRoute')
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
    TableColumnPopoverPolPod
  },
  methods: {
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
      let importId = {
        column: 'importId',
        type: 'eq',
        value: this.$route.query.importId
      }
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
      if (this.$route.query.importId) {
        data.query.push(importId)
      }
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
      airChargeMaintainList(data)
        .then((response) => {
          let { list, totalCount, allColumns, configColumns } = response.data
          this.tableConfig.list = this.formatTabelData(list)
          console.log(this.tableConfig.list)

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

    // 新建
    handleAdd() {
      this.routerPush('AirFreightMaintenanceDetail')
    },

    // table导出
    handleExport() {
      let data = this.getListQuery()
      let chargeIds = this.getChargeIds()
      if (chargeIds.length > 0) {
        let routeIdQuery = {
          column: 'chargeIds',
          type: 'eq',
          value: chargeIds.join(',')
        }
        Object.assign(data, this.tableQuery, {
          query: this.tableQuery.query.concat(routeIdQuery)
        })
      }
      airChargeExport(data).then((res) => {
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
    handleSurcharge() {
      if (!this.selectedCheckbox.length) {
        return this.$message.error('请选择要批量关联附加费的运价')
      }
      let result = this.selectedCheckbox.every(
        (el) => el.status === 'no_publish'
      )
      if (!result) {
        return this.$message.error('未发布的运价才能批量关联附加费')
      }
      this.editSurchargeId = this.getChargeIds()
      this.editSurchargePopShow = true
    },
    // 批量发布
    handleMultiPublish() {
      if (!this.selectedCheckbox.length) {
        return this.$message.error('请选择要发布的的运价')
      }
      let result = this.selectedCheckbox.every(
        (el) => el.status === 'no_publish'
      )
      if (!result) {
        return this.$message.error('未发布的运价才能批量发布')
      }
      let newArr=[]
      for (let i = 0; i < this.selectedCheckbox.length; i++) {
        if(!newArr.find(el=>el.chargeId==this.selectedCheckbox[i].chargeId)){
          newArr.push(this.selectedCheckbox[i])
        }
      }
      let errIndexArr = []
      console.log(newArr)
      for (let i = 0; i < newArr.length; i++) {
        if (
          !newArr[i].chargePrices ||
          newArr[i].chargePrices.length === 0
        ) {
          errIndexArr.push(i+1)
        } else {
          for (
            let j = 0;
            j < newArr[i].chargePrices.length;
            j++
          ) {
            if (
              !newArr[i].chargePrices[j].priceMin &&
              !newArr[i].chargePrices[j].priceKg45 &&
              !newArr[i].chargePrices[j].priceKg100 &&
              !newArr[i].chargePrices[j].priceKg300 &&
              !newArr[i].chargePrices[j].priceKg500 &&
              !newArr[i].chargePrices[j].priceKg1000 &&
              !newArr[i].chargePrices[j].priceKg2000
            ) {
              errIndexArr.push(i+1)
            }
          }
        }
      }
      if (errIndexArr.length) {
        return this.$message.error(
          `批量发布，需要所选的数据价格信息至少有一条价格，且每条价格至少有一个金额，第${errIndexArr.join(
            '，'
          )}条数据不满足要求`
        )
      }

      let chargeIds = this.getChargeIds()
      const loading = this.$loading()
      airChargePublish(chargeIds)
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
        return this.$message.error('请选择要设置失效的的运价')
      }
      let result = this.selectedCheckbox.every(
        (el) => el.status === 'published'
      )
      if (!result) {
        return this.$message.error('已发布的运价才能设置失效')
      }
      let chargeIds = this.getChargeIds()
      const loading = this.$loading()
      airChargeInvalid(chargeIds)
        .then((response) => {
          this.saveSelectedCheckbox = response.data
          this.$message({
            type: 'success',
            message: '失效成功',
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
    // 单个失效
    handleInvalid(id) {
      let chargeIds = [id]
      airChargeInvalid(chargeIds)
        .then(() => {
          this.$message({
            type: 'success',
            message: '失效成功',
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
      this.routerPush('AirFreightMaintenanceDetail', {
        id: row.chargeId
      })
    },

    // 复制
    handleCopy(row) {
      airChargeCopy(row.chargeId).then((res) => {
        this.routerPush('AirFreightMaintenanceDetail', {
          id: res.data
        })
      })
    },
    // 删除
    handleDelete(id) {
      this.$confirm('是否确认删除该条运价?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        lockScroll: 'true',
        type: 'warning'
      })
        .then(() => {
          airChargeDeletey(id).then(() => {
            this.$message({
              type: 'success',
              message: '删除成功',
              duration: 1000,
              onClose: () => {
                this.tableQuery.currPage = 1
                this.getList()
              }
            })
          })
        })
        .catch(function () {})
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
    getChargeIds() {
      let chargeIds = []
      this.selectedCheckbox.forEach((item) => {
        if (!chargeIds.includes(item.chargeId)) {
          chargeIds.push(item.chargeId)
        }
      })
      return chargeIds
    },

    // 附加费修改关闭回调
    surchargePopClose(action, value) {
      this.editSurchargePopShow = false
      if (action === 'Confirm') {
        let data = {}
        Object.assign(data, {
          surcharges: value.list,
          chargeIds: this.editSurchargeId
        })
        airChargeAddSurcharges(data).then(() => {
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
