<template>
  <div class="app-container">
    <div class="search-container">
      <Search :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery" :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
        <AddFilter :searchInputGroup="searchInputGroup" :allFilterGroups="allFilterGroups" :filterGroups="filterGroups" :defaultSearchLength="defaultSearchLength" :callback="searchCallBack" :index="index" :item="item" v-for="(item, index) in searchInputGroup" :key="'filter' + index" />
        <div class="btn-plus-search" @click="handleAddFilter" ref="btnPlus"></div>
      </Search>
    </div>
    <div class="table-container">
      <TableFilter :config="tableConfig" :tableQuery.sync="tableQuery" :callback="tableCallBack" />
      <BaseTableMuti v-loading="loading" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
    </div>
    <div v-if="showAddInquiryPop">
      <AddOfferTem @close="addInquiryClose" :detailData="detailData" :canSubmit="canSubmit"></AddOfferTem>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapState } from 'vuex'
import Search from '@/components/Base/SearchEn/index'
import BaseTableMuti from '@/components/Base/TableEn/vxeTableMuti'
import TableFilter from './components/tableTemFilter'
import AddInquiry from './components/addInquiry'
import AddOfferTem from './components/addOfferTem'
import {
  enquiryTempList,
  enquiryTempCreate,
  enquiryTempDel,
  enquiryTempDetail,
  enquiryTempEdit
} from '@/api/charge'
import { baseEmployeeListName, cargoHscodeList } from '@/api/base'
import { unique } from '@/utils/index'
import { getDictLabel } from '@/utils/tools'
import { columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
import AddFilter from '@/components/Base/SearchEn/addFilter'
const defaultPage = {
  pageSize: -1,
  currPage: 1
}
const defaultTableQuery = {
  columns: [],
  ascColumns: [],
  descColumns: ['createdTime'],
  query: [
    {
      column: 'state',
      type: 'eq',
      value: 'valid'
    }
  ],
  state: ''
}
const defaultSearchInputGroup = [
  {
    key: 'tempName',
    value: '',
    placeholder: 'Template name',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'businessType',
    value: '',
    placeholder: 'Business Type',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'categoryName',
    value: '',
    placeholder: 'Supplier',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'etd',
    value: '',
    placeholder: 'ETD',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'carrier',
    value: '',
    placeholder: 'Carrier',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'createdBy',
    value: '',
    placeholder: 'Created by',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'createdTime',
    value: '',
    placeholder: 'Created Time',
    category: 'all',
    queryValue: ''
  }
]
// 业务类型
let businessTypeList = [
  {
    label: 'Maritime Export FCL',
    value: 'ship_export_fcl'
  },
  {
    label: 'Maritime Export LCL',
    value: 'ship_export_lcl'
  },
  {
    label: 'Maritime Import FCL',
    value: 'ship_import_fcl'
  },
  {
    label: 'Maritime Import LCL',
    value: 'ship_import_lcl'
  },
  {
    label: 'Air Export',
    value: 'air_export'
  },
  {
    label: 'Air Import',
    value: 'air_import'
  },
  {
    label: 'Railway Import/Export FCL',
    value: 'rail_export_fcl'
  },
  {
    label: 'Railway Import/Export LCL',
    value: 'rail_export_lcl'
  },
  {
    label: 'Miscellaneous Roll-on Export',
    value: 'ship_bulk_ro'
  }
]
function getBusinessTypeName(val) {
  if (val) {
    let item = businessTypeList.find((el) => el.value === val)
    if (item) {
      return item.label
    } else {
      return ''
    }
  } else {
    return ''
  }
}
export default {
  data() {
    return {
      canSubmit: true,
      detailData: null,
      tableColumnsWidthList: [],
      enquiryId: '',
      showAddInquiryPop: false,
      defaultSearchLength: 1, // 默认显示搜索框的个数
      loading: true,
      state: '',
      searchConditionHide: true, // 隐藏自定义搜索
      // 查询条件下拉选项
      searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),
      allFilterGroups: {
        all: this.filterGroups
      },
      filterGroups: {
        tempName: {
          key: 'tempName',
          label: 'Template name',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        businessType: {
          label: 'Business Type',
          key: 'businessType',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: businessTypeList,
          nonDictionary: true
        },
        categoryName: {
          key: 'categoryName',
          label: 'Supplier',
          type: 'remoteSelect',
          saveList: [],
          searchType: 'like',
          value: '',
          data: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            this.getSupplierList('', item)
          },
          filterMehod: (val, item) => {
            this.getSupplierList(val, item)
          },
          change: (val, item) => {
            let findItem = item.data.find((ele) => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        },
        etd: {
          label: 'ETD',
          key: 'etd',
          type: 'date',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd'
        },
        carrier: {
          key: 'carrier',
          label: 'Carrier',
          type: 'remoteSelect',
          searchType: 'eq',
          saveList: [],
          value: '',
          data: [],
          nonDictionary: true,
          queryValue: '',
          visibleChange: (val, item) => {
            this.getQuotationEmployeeName('', item)
          },
          filterMehod: (val, item) => {
            this.getQuotationEmployeeName(val, item)
          },
          change: (val, item) => {
            let findItem = item.data.find((ele) => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        },
        createdBy: {
          key: 'createdBy',
          label: 'Created by',
          type: 'remoteSelect',
          searchType: 'eq',
          saveList: [],
          value: '',
          data: [],
          nonDictionary: true,
          queryValue: '',
          visibleChange: (val, item) => {
            this.getEmployeeName('', item)
          },
          filterMehod: (val, item) => {
            this.getEmployeeName(val, item)
          },
          change: (val, item) => {
            let findItem = item.data.find((ele) => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        },
        createdTime: {
          label: 'Created Time',
          key: 'createdTime',
          type: 'date',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd'
        },
        validityDateType: {
          label: 'Validity Date Type',
          key: 'validityDateType',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: [],
          nonDictionary: true
        }
      },
      tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
      searchConfig: [],
      // table复选框多选的值
      selectedCheckbox: [],

      // 默认表头
      defaultColumns: [
        'tempName',
        'businessType',
        'categoryName',
        'carrier',
        'tT',
        'etd',
        'validityDateType',
        'validity',
        'createdName',
        'createdTime'
      ],

      // table基础组件
      tableConfig: {
        style: {},
        tableIndex: {
          show: false
        },
        options: {
          // api: this.$api.system.user.list,
          // 是否支持解锁列表修改
          lockState: true,

          // 是否支持列表项选中功能
          mutiSelect: true,

          // 多选框状态判断 {false不可选, true可选}
          checkSelectable() {
            return true
          }
        },
        list: [],
        configColumns: [],
        // 表头库
        columnsBase: [],
        columns: [
          {
            prop: 'tempName',
            label: 'Template name',
            sortable: false,
            type: 'text'
            // width: '100'
          },
          {
            prop: 'businessType',
            label: 'Business Type',
            sortable: true,
            type: 'text',
            formatter: (row, column) => {
              let str = getBusinessTypeName(row.businessType)
              return str
            }
          },
          {
            prop: 'categoryName',
            label: 'Supplier',
            sortable: true,
            type: 'text'
            // width: '150'
          },
          {
            prop: 'carrier',
            label: 'Carrier',
            sortable: true,
            type: 'text'
            // width: '150'
          },
          {
            prop: 'tT',
            label: 'T/T',
            sortable: true,
            type: 'text'
            // width: '150'
          },
          {
            prop: 'etd',
            label: 'ETD',
            sortable: true,
            type: 'text'
            // width: '150'
          },
          {
            prop: 'validityDateType',
            label: 'Validity Date Type',
            sortable: true,
            type: 'text'
          },
          {
            prop: 'validity',
            label: 'Validity',
            sortable: true,
            width: '150',
            type: 'text',
            formatter: (row, column) => {
              if (!row.startDateValidity) {
                return ''
              }
              return `${row.startDateValidity}~${row.endDateValidity}`
            }
            // width: '150'
          },
          {
            prop: 'createdName',
            label: 'Created by',
            sortable: true,
            type: 'text'
            // width: '150'
          },
          {
            prop: 'createdTime',
            label: 'Created Time',
            sortable: true,
            type: 'text'
            // width: '150'
          }
        ],
        // 操作按钮组
        operationBtns: {
          width: '200px',
          fixed: 'right',
          show: true,
          callback: (action, $index, row, item, $event) => {
            if (action === 'Detail') {
              this.handleDetail(row)
            }
            if (action === 'Del') {
              this.handleDel(row)
            }
            if (action === 'Copy') {
              this.handleCopy(row)
            }
          },
          data: [
            {
              label: 'Copy',
              type: 'text',
              show: (item, row) => {
                if (row.createdBy == this.userId) {
                  return true
                } else {
                  return false
                }
              },
              action: 'Copy'
            },
            {
              label: 'Details',
              type: 'text',
              show: (item, row) => {
                if (row.createdBy == this.userId) {
                  return true
                } else {
                  return false
                }
              },
              action: 'Detail'
            },
            {
              label: 'Delete',
              type: 'text',
              className: 'red',
              action: 'Del',
              show: (item, row) => {
                if (row.createdBy == this.userId) {
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
          show: true,
          total: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          isFirstPage: false,
          isLastPage: false
        }
      }
    }
  },
  created() {
    this.init()
    this.getList()
  },
  mounted() {},
  computed: {
    ...mapGetters(['dictMap']),
    ...mapState({
      userId: (state) => state.user.userId
    })
  },
  components: {
    Search,
    BaseTableMuti,
    TableFilter,
    AddInquiry,
    AddOfferTem,
    AddFilter
  },
  methods: {
    // 增加一条搜索条件
    handleAddFilter() {
      this.searchInputGroup.push({
        key: '',
        value: '',
        category: 'all',
        queryValue: ''
      })
    },
    handleDel(row) {
      this.$confirm('是否确定删除该报价模板?', 'Warning', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(() => {
          enquiryTempDel({
            oid: row.oid
          }).then((res) => {
            this.$message.success('Deleted successfully')
            this.getList()
          })
        })
        .catch(() => {})
    },
    // 自定义列宽度保存
    handleSaveColumnWidth(params) {
      console.log(params)
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
    },
    // hscode模糊查询
    queryCargoHscode(queryString, item) {
      if (queryString) {
        cargoHscodeList({ keyword: queryString }).then((res) => {
          if (!item.multiple) item.saveList = []
          let filterArr = res.data.filter(
            (ele) => !item.saveList.find((o) => o.value === ele.hscode)
          )
          let itemList = filterArr.map((ele) => {
            return {
              ...ele,
              label: ele.cargoDesc,
              value: ele.hscode
            }
          })

          item.data = unique([...item.saveList, ...itemList], 'hscode')
        })
      } else {
      }
    },
    // 询价人
    getEmployeeName(val, item) {
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : ''
      }
      baseEmployeeListName(data).then((res) => {
        // 单选下拉不保存选择后的数据
        if (!item.multiple) item.saveList = []
        let filterArr = res.data.filter(
          (ele) => !item.saveList.find((o) => o.value === ele.employeeId)
        )
        let itemList = filterArr.map((ele) => {
          return {
            ...ele,
            label: this.$language === 'en' ? ele.ename : ele.cname,
            value: ele.employeeId ? Number(ele.employeeId) : ''
          }
        })
        item.data = [...item.saveList, ...itemList]
      })
    },
    // 报价人
    getQuotationEmployeeName(val, item) {
      Promise.all([
        this.$store.dispatch('dict/baseShippingCarrierList', {
          name: val,
          state: 'valid'
        }),
        this.$store.dispatch('dict/aircarrierList', {
          carrierName: val
        })
      ]).then((res) => {
        if (!item.multiple) item.saveList = []
        let filterArr0 = res[0].filter(
          (ele) => !item.saveList.find((o) => o.value === ele.value)
        )
        let filterArr1 = res[1].filter(
          (ele) => !item.saveList.find((o) => o.value === ele.value)
        )
        let itemList0 = filterArr0.map((ele) => {
          return {
            ...ele,
            label: ele.value
          }
        })
        let itemList1 = filterArr1
          .map((ele) => {
            return {
              ...ele,
              value: ele.itat,
              label: ele.itat
            }
          })
          .filter((el) => el.value)
        item.data = unique(
          [...item.saveList, ...itemList0, ...itemList1],
          'value'
        )
      })
    },
    // 供应商
    getSupplierList(queryString, item) {
      console.log(item)
      this.$store
        .dispatch('dict/queryAllSupplierList', {
          queryString: queryString
        })
        .then((data) => {
          item.data = item.data = unique(
            data.list.map((ele) => {
              return Object.assign(ele, {
                label: ele.name,
                value: ele.name
              })
            }),
            'value'
          )
        })
    },
    // 空运港口
    airPortSearch(portName, portCodes, state, item) {
      Promise.all([
        this.$store.dispatch('dict/airportList', {
          portName,
          portCodes,
          state
        }),
        this.$store.dispatch('dict/basePortList', {
          queryString: portName || portCodes,
          portAttribute: 'port_of_basic',
          state: 'valid'
        })
      ]).then((res) => {
        let portList1 = res[0].map((ele) => {
          return Object.assign(ele, {
            value: ele.portCode,
            label: `${ele.ename}(${ele.cname}${
              ele.portCname ? ',' + ele.portCname : ''
            }${ele.cityCname ? ',' + ele.cityCname : ''}${
              ele.countryName ? ',' + ele.countryName : ''
            })`
          })
        })
        let portList2 = res[1].map((ele) => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
        item.data = [...portList1, ...portList2]
      })
    },
    addInquiryClose(action, value, oid) {
      if (action === 'Confirm') {
        if (!oid) {
          this.canSubmit = false
          this.$store
            .dispatch('airTransport/orderSave', {
              uri: '/order/over/enquiry/temp/create',
              params: value
            })
            .then((res) => {
              this.canSubmit = true
              if (res.data.code === 0) {
                this.showAddInquiryPop = false
                this.$message({ type: 'success', message: '新增模板成功' })
                this.getList()
              }
            })
            .catch(() => {
              this.canSubmit = true
            })
        } else {
          this.canSubmit = false
          this.$store
            .dispatch('airTransport/orderSave', {
              uri: '/order/over/enquiry/temp/edit',
              params: value
            })
            .then((res) => {
              this.canSubmit = true
              if (res.data.code === 0) {
                this.showAddInquiryPop = false
                this.$message({ type: 'success', message: '修改模板成功' })
                this.getList()
              }
            })
            .catch(() => {
              this.canSubmit = true
            })
        }
      } else {
        this.showAddInquiryPop = false
      }
    },
    handleAdd() {
      this.detailData = null
      this.showAddInquiryPop = true
    },
    init() {
      Object.assign(this.allFilterGroups, {
        all: this.filterGroups
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

    // 船公司下拉列表自动补充的数据
    sysLineQuerySearchList(queryString, item) {
      this.$store
        .dispatch('dict/baseSystemLineList', { name: queryString, state: '' })
        .then((data) => {
          item.data = data.map((ele) => {
            return Object.assign(ele, {
              label: ele.value,
              value: ele.key
            })
          })
        })
    },
    // 系统航线下拉列表自动补充的数据
    sysLineQuerySearch(queryString, cb) {
      this.$store
        .dispatch('dict/baseSystemLineList', queryString)
        .then((data) => {
          cb(data)
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

    // 船公司下拉列表自动补充的数据
    shipQuerySearch(queryString, item) {
      this.$store
        .dispatch('dict/baseShippingCarrierList', {
          name: queryString,
          state: ''
        })
        .then((data) => {
          item.data = data.map((ele) => {
            return Object.assign(ele, {
              label: ele.value,
              value: ele.key
            })
          })
        })
    },
    // 获取本地table列表的字段和宽为数组集合
    getTableColumnsWidth() {
      let result = this.tableConfig.columns.map((item) => {
        return { column: item.prop, width: item.width }
      })
      return result
    },
    // 列表数据
    async getList() {
      this.loading = true
      // 合并发布状态参数
      let params = {}
      Object.assign(params, this.tableQuery, {
        query: this.tableQuery.query
      })
      delete params.state
      let { data } = await columnWidthConfigInfo({
        scenesCode: this.$route.name
      })
      let { columnWidthList } = data
      enquiryTempList(params)
        .then((response) => {
          let { list, totalCount, allColumns, configColumns, pageSize } =
            response.data
          this.tableQuery.pageSize = pageSize
          this.tableConfig.list = list
          this.tableConfig.pagination.total = totalCount

          this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
          this.tableConfig.pagination.hasPreviousPage =
            response.data.hasPreviousPage
          this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
          this.tableConfig.pagination.isLastPage = response.data.isLastPage
          this.tableQuery.currPage = response.data.currPage

          this.tableConfig.configColumns = configColumns.length
            ? configColumns
            : this.defaultColumns
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

    // 查询组件回调
    searchCallBack(action, param) {
      let query = []
      if (action === 'Search') {
        //默认的查询条件组装tableQuery参数
        console.log(this.searchConfig)
        if (this.searchInputGroup.length) {
          this.searchInputGroup.forEach((item, index) => {
            let tempItem = {}
            if (item.key) {
              // 非自动补全的查询参数从item.value中取值合并到query
              if (this.filterGroups[item.key].type !== 'autocomplete') {
                // 多选下拉框
                if (this.filterGroups[item.key].type === 'cascader') {
                  Object.assign(tempItem, {
                    column: item.key,
                    type: this.filterGroups[item.key].searchType || 'eq',
                    value: item.value ? item.value[item.value.length - 1] : ''
                  })
                } else if (this.filterGroups[item.key].multiple) {
                  Object.assign(tempItem, {
                    column: item.key,
                    type: this.filterGroups[item.key].searchType || 'eq',
                    value: item.value ? item.value.toString() : ''
                  })
                  // 中转港特殊处理
                  if (item.key === 'transitPortCode') {
                    Object.assign(tempItem, {
                      column: 'transitPortCodeStr',
                      type: 'like',
                      value: item.value ? item.value.join('#') : ''
                    })
                  }
                } else if (this.filterGroups[item.key].key === 'createdTime') {
                  // 时间区间组件的value值是数组，['beginDate','endDate'],要转换成后端需要的两个字段
                  if (item.value && item.value[0])
                    query.push({
                      column: item.key,
                      type: 'ge',
                      value: item.value[0] + ' 00:00:00'
                    })
                  if (item.value && item.value[1])
                    query.push({
                      column: item.key,
                      type: 'le',
                      value: item.value[1] + ' 23:59:59'
                    })
                } else if (this.filterGroups[item.key].key === 'etd') {
                  // 时间区间组件的value值是数组，['beginDate','endDate'],要转换成后端需要的两个字段
                  if (item.value && item.value[0])
                    query.push({
                      column: item.key,
                      type: 'ge',
                      value: item.value[0]
                    })
                  if (item.value && item.value[1])
                    query.push({
                      column: item.key,
                      type: 'le',
                      value: item.value[1]
                    })
                } else if (
                  // 特殊处理预关账状态，关账状态
                  ['prefinCloseStatus', 'finCloseStatus'].includes(item.key)
                ) {
                  // 选择未关账传值不等于yes
                  if (item.value) {
                    if (item.value === 'yes') {
                      Object.assign(tempItem, {
                        column: item.key,
                        type: 'eq',
                        value: 'yes'
                      })
                    } else {
                      Object.assign(tempItem, {
                        column: item.key,
                        type: 'ne',
                        value: 'yes'
                      })
                    }
                  }
                } else if (['isJoint'].includes(item.key)) {
                  // 已协同=y
                  if (item.value) {
                    if (item.value === 'y') {
                      Object.assign(tempItem, {
                        column: item.key,
                        type: 'eq',
                        value: 'y'
                      })
                    } else {
                      Object.assign(tempItem, {
                        column: item.key,
                        type: 'ne',
                        value: 'y'
                      })
                    }
                  }
                } else if (['serviceCode'].includes(item.key)) {
                  Object.assign(tempItem, {
                    column: item.key,
                    type: 'like',
                    value: item.value ? `,${item.value},` : ''
                  })
                } else {
                  Object.assign(tempItem, {
                    column: item.key,
                    type: this.filterGroups[item.key].searchType || 'eq',
                    value: item.value
                  })
                }
              } else {
                Object.assign(tempItem, {
                  column: item.key,
                  type: this.filterGroups[item.key].searchType || 'eq',
                  value: this.filterGroups[item.key].queryValue
                })
              }
              query.push(tempItem)
            }
          })
        }
        Object.assign(this.tableQuery, {
          query: query.filter((item) => {
            return item.value
          }),
          currPage: 1
        })
        this.tableQuery.query.push({
          column: 'state',
          type: 'eq',
          value: 'valid'
        })
        console.log('serach:', this.tableQuery)
        this.getList()
      }

      // 模板加载后修改搜索组件的数组
      if (action === 'Update') {
        this.searchInputGroup = param.length
          ? [...param]
          : [...defaultSearchInputGroup]
      }
      if (action === 'Reset') {
        this.handleSearchValueReset()
      }
    },
    handleSearchValueReset() {
      this.searchInputGroup.map((item) => {
        item.value = ''
        return { ...item }
      })
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
      // Add、Export、CustomColumns、ChangeLockState、Muti、SizeChange、CurrentChange、SingleEdit
      // MultiEdit、 MultiPublish、MultiInvalid、MultiDelete
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
    handleCopy(row) {
      enquiryTempDetail({
        oid: row.oid
      }).then((res) => {
        this.detailData = res.data
        delete this.detailData.oid
        this.detailData.tempName = ''
        if (this.detailData.startDateValidity) {
          this.detailData.validity = [
            this.detailData.startDateValidity,
            this.detailData.endDateValidity
          ]
        } else {
          this.detailData.validity = []
        }
        this.showAddInquiryPop = true
      })
    },
    // 去详情页
    handleDetail(row) {
      enquiryTempDetail({
        oid: row.oid
      }).then((res) => {
        this.detailData = res.data
        // delete this.detailData.oid
        this.detailData.validity = this.detailData.validity.split(',')
        if (this.detailData.startDateValidity) {
          this.detailData.validity = [
            this.detailData.startDateValidity,
            this.detailData.endDateValidity
          ]
        }
        this.showAddInquiryPop = true
      })
    },
    // 远程排序
    handleSort() {
      this.getList()
    },
    // 获取特殊处理的自定义表头，例：polCode,需要传polCode,polEname,polCname,podCode, podEname,podCname给后端
    getColumnsValues(value) {
      let result = []
      value.map((item) => {
        if (this.specialColumns[item]) {
          result = result.concat(this.specialColumns[item])
        } else {
          result.push(item)
        }
      })
      return result
    }
  }
}
</script>
<style lang="scss" scoped>
#barge-search-table {
  /deep/ .vxe-table--render-default {
    tr {
      td {
        padding-top: 0px;
        padding-bottom: 0px;
        height: 36px !important;
      }
      .vxe-cell {
        line-height: 16px;
      }
    }
  }
}
</style>