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
// ????????????
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
      defaultSearchLength: 1, // ??????????????????????????????
      loading: true,
      state: '',
      searchConditionHide: true, // ?????????????????????
      // ????????????????????????
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
      // table?????????????????????
      selectedCheckbox: [],

      // ????????????
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

      // table????????????
      tableConfig: {
        style: {},
        tableIndex: {
          show: false
        },
        options: {
          // api: this.$api.system.user.list,
          // ??????????????????????????????
          lockState: true,

          // ?????????????????????????????????
          mutiSelect: true,

          // ????????????????????? {false?????????, true??????}
          checkSelectable() {
            return true
          }
        },
        list: [],
        configColumns: [],
        // ?????????
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
        // ???????????????
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

        // ????????????
        tips: {
          text: '',
          show: false
        },

        // ??????
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
    // ????????????????????????
    handleAddFilter() {
      this.searchInputGroup.push({
        key: '',
        value: '',
        category: 'all',
        queryValue: ''
      })
    },
    handleDel(row) {
      this.$confirm('??????????????????????????????????', 'Warning', {
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
    // ????????????????????????
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
    // hscode????????????
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
    // ?????????
    getEmployeeName(val, item) {
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : ''
      }
      baseEmployeeListName(data).then((res) => {
        // ???????????????????????????????????????
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
    // ?????????
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
    // ?????????
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
    // ????????????
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
                this.$message({ type: 'success', message: '??????????????????' })
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
                this.$message({ type: 'success', message: '??????????????????' })
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
    // ??????????????????????????????????????????
    polQuerySearch(queryString, portAttribute, state, cb) {
      this.$store
        .dispatch('dict/basePortList', { queryString, portAttribute, state })
        .then((data) => {
          cb(data)
        })
    },

    // ??????????????????????????????????????????
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
    // ?????????????????????????????????????????????
    sysLineQuerySearch(queryString, cb) {
      this.$store
        .dispatch('dict/baseSystemLineList', queryString)
        .then((data) => {
          cb(data)
        })
    },

    // ??????????????????????????????
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

    // ??????????????????????????????????????????
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
    // ????????????table????????????????????????????????????
    getTableColumnsWidth() {
      let result = this.tableConfig.columns.map((item) => {
        return { column: item.prop, width: item.width }
      })
      return result
    },
    // ????????????
    async getList() {
      this.loading = true
      // ????????????????????????
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
            // ???????????????????????????
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

    // ??????????????????
    searchCallBack(action, param) {
      let query = []
      if (action === 'Search') {
        //???????????????????????????tableQuery??????
        console.log(this.searchConfig)
        if (this.searchInputGroup.length) {
          this.searchInputGroup.forEach((item, index) => {
            let tempItem = {}
            if (item.key) {
              // ?????????????????????????????????item.value??????????????????query
              if (this.filterGroups[item.key].type !== 'autocomplete') {
                // ???????????????
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
                  // ?????????????????????
                  if (item.key === 'transitPortCode') {
                    Object.assign(tempItem, {
                      column: 'transitPortCodeStr',
                      type: 'like',
                      value: item.value ? item.value.join('#') : ''
                    })
                  }
                } else if (this.filterGroups[item.key].key === 'createdTime') {
                  // ?????????????????????value???????????????['beginDate','endDate'],???????????????????????????????????????
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
                  // ?????????????????????value???????????????['beginDate','endDate'],???????????????????????????????????????
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
                  // ??????????????????????????????????????????
                  ['prefinCloseStatus', 'finCloseStatus'].includes(item.key)
                ) {
                  // ??????????????????????????????yes
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
                  // ?????????=y
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

      // ??????????????????????????????????????????
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

    // ??????????????????
    tableCallBack(action, arr) {
      let fn = this['handle' + action]
      // Add???Export???CustomColumns???ChangeLockState???Muti???SizeChange???CurrentChange???SingleEdit
      // MultiEdit??? MultiPublish???MultiInvalid???MultiDelete
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
    // ????????????
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
    // ????????????
    handleSort() {
      this.getList()
    },
    // ?????????????????????????????????????????????polCode,?????????polCode,polEname,polCname,podCode, podEname,podCname?????????
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