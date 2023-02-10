<template>
  <div class="app-container">
    <div class="search-container">
      <Search ref="search" :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery" :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
        <AddFilter :searchInputGroup="searchInputGroup" hasDefaultCreatedTime :allFilterGroups="allFilterGroups" :filterGroups="filterGroups" :defaultSearchLength="defaultSearchLength" :callback="searchCallBack" :index="index" :item="item" v-for="(item, index) in searchInputGroup" :key="'filter' + index" />
        <div class="btn-plus-search" @click="handleAddFilter" ref="btnPlus"></div>
      </Search>
    </div>
    <div class="table-container" :class="['cancel', 'close', 'complete'].includes(tableQuery.orderStatus) ? 'init-table-container' : ''" ref="tableCont">
      <TableFilter :config="tableConfig" :tableQuery.sync="tableQuery" :callback="tableCallBack" />
      <BaseTableMuti :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" v-loading="loading" />
    </div>
    <!-- 自定义表头 -->
    <div v-if="customColumnsPopShow">
      <CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
    </div>
  </div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilter'

// 弹出框
import BaseDialog from '@/components/Base/Dialog/index'
import CustomColumns from '@/components/customColumns/index'

import {
  baseBusinessList,
  searchConditionInfo,
  searchConditionSave,
  searchConditionDelete,
  baseEmployeeListName,
  columnWidthConfigInfo,
  columnWidthConfigSave,
  countrySelectList
} from '@/api/base'
import { orderReport, orderReportExport, airServiceList } from '@/api/airTransport/order'
import { customerListAllStatus } from '@/api/crm/supplier.js'
import { departmentTreeList } from '@/api/companyResource'
import { getParamMethod } from '@/utils/allKindNumber'
import { formatDate } from '@/utils/index'

const end = new Date()
const start = new Date()
let defaulTime = []
start.setTime(start.getTime() - 3600 * 1000 * 24 * 59)
defaulTime[0] = formatDate(start)
defaulTime[1] = formatDate(end)

const defaultPage = {
  pageSize: -1,
  currPage: 1
}

const defaultTableQuery = {
  columns: [],
  ascColumns: [],
  descColumns: ['createdTime'],
  query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
  orderStatus: 'all' // 订单状态，默认展示未审核
}
const defaultSearchInputGroup = [
  {
    key: 'orderNo',
    value: '',
    placeholder: '工作号',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'bizDate',
    value: '',
    placeholder: '业务日期',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'prefinCloseStatus',
    value: '',
    placeholder: '预关账状态',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'finCloseStatus',
    value: '',
    placeholder: '关账状态',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'orderStatus',
    value: ['pass', 'break', 'complete'],
    placeholder: '订单状态',
    category: 'all',
    queryValue: ''
  }
]

export default {
  mixins: [routerMixin],
  data() {
    return {
      departmentList: [],
      tableColumnsWidthList: [],
      oldParams: {},
      cTimestamp: 0,
      loading: false,
      state: 'valid',
      showVal: null,
      defaultStyle: {
        width: '100%'
      },
      businessTypeOptions: [],
      serviceTypeOptions: {},
      orderNo: '',
      serviceType: '',
      // searchConditionList: [], // 自定义搜索模板集合
      defaultSearchLength: 0, // 默认显示搜索框的个数
      allFilterGroups: {
        all: this.filterGroups
      },
      selectDate: '',
      // 查询条件下拉选项
      filterGroups: {
        orderNo: {
          key: 'orderNo',
          label: '工作号',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        auditTime: {
          label: '审核时间',
          key: 'auditTime',
          type: 'date2',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd'
        },
        serviceType: {
          label: '服务类型',
          key: 'serviceType',
          type: 'select',
          searchType: 'in',
          multiple: true,
          'collapse-tags': true,
          value: '',
          data: [],
          nonDictionary: true,
          propInDict: 'airServiceType'
        },
        orderStatus: {
          label: '订单状态',
          key: 'orderStatus',
          type: 'select',
          searchType: 'in',
          value: ['pass', 'break', 'complete'],
          data: [],
          multiple: true,
          saveList: [
            { label: '审核通过', value: 'pass' },
            { label: '终止', value: 'break' },
            { label: '完成', value: 'complete' }
          ],
          'collapse-tags': true,
          queryValue: '',
          nonDictionary: true
          // propInDict: 'orderStatus'
        },
        bkgStatus: {
          label: '订舱状态',
          key: 'bkgStatus',
          type: 'select',
          searchType: 'eq',
          propInDict: 'airBkgStatus',
          value: '',
          data: [],
          nonDictionary: true
        },
        prefinCloseStatus: {
          label: '预关账状态',
          key: 'prefinCloseStatus',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: store.state.airTransport.orderList.finCloseStatus,
          nonDictionary: true
        },
        bizDate: {
          label: '业务日期',
          key: 'bizDate',
          type: 'date',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd',
          pickerOptions: {
            // 设置不能选择的日期
            onPick: ({ maxDate, minDate }) => {
              this.selectDate = minDate.getTime()
              if (maxDate) {
                this.selectDate = ''
              }
              // this.minDate = minDate
              // this.maxDate = maxDate
            },
            disabledDate: (time) => {
              // 2个月60天的时间戳
              let two = 60 * 24 * 3600 * 1000
              // 是否限制的判断条件
              if (this.selectDate) {
                // 大于或选中日期后66天或小于选中日期前60天都被禁用
                return (
                  time > new Date(this.selectDate + two) ||
                  time < new Date(this.selectDate - two)
                )
              } else {
                return false
              }

              // if (this.minDate) {
              // 	return time > (new Date(this.minDate.getTime() + two)) || time < (new Date(this.minDate.getTime() - two))
              // }
              // return time.getTime() > Date.now()
            }
          }
        },
        bdEmployeeName: {
          key: 'bdEmployeeName',
          label: '销售',
          type: 'remoteSelect',
          searchType: 'in',
          multiple: true,
          'collapse-tags': true,
          value: '',
          data: [],
          saveList: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            this.getMulEmployeeName('', item, 'bd')
          },
          filterMehod: (val, item) => {
            this.getMulEmployeeName(val, item, 'bd')
          }
        },
        bdDeptCode: {
          specialProp:'deptCode',
          label: '销售部门', 
          key: 'bdDeptCode',
          type: 'cascader',
          searchType: 'in',
          cascaderList: [],
          saveList: [],
          cascaderProps: {
            children: 'childList',
            label: 'deptCname',
            value: 'deptCode',
            checkStrictly: false,
						multiple: true
          },
        },
        obdEmployeeName: {
          key: 'obdEmployeeName',
          label: '销售助理',
          type: 'remoteSelect',
          searchType: 'in',
          multiple: true,
          'collapse-tags': true,
          value: '',
          data: [],
          saveList: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            this.getMulEmployeeName('', item, 'obd')
          },
          filterMehod: (val, item) => {
            this.getMulEmployeeName(val, item, 'obd')
          }
        },
        pricingEmployeeName: {
          key: 'pricingEmployeeName',
          label: '商务',
          type: 'remoteSelect',
          searchType: 'in',
          multiple: true,
          'collapse-tags': true,
          value: '',
          data: [],
          saveList: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            this.getMulEmployeeName('', item, 'pricing')
          },
          filterMehod: (val, item) => {
            this.getMulEmployeeName(val, item, 'pricing')
          }
        },
        opEmployeeName: {
          key: 'opEmployeeName',
          label: '操作',
          type: 'remoteSelect',
          searchType: 'in',
          multiple: true,
          'collapse-tags': true,
          value: '',
          data: [],
          saveList: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            this.getMulEmployeeName('', item, 'op')
          },
          filterMehod: (val, item) => {
            this.getMulEmployeeName(val, item, 'op')
          }
        },
        opDeptCode: {
          specialProp:'deptCode',
          label: '操作部门',
          key: 'opDeptCode',
          type: 'cascader',
          searchType: 'in',
          cascaderList: [],
          saveList: [],
          cascaderProps: {
            children: 'childList',
            label: 'deptCname',
            value: 'deptCode',
            checkStrictly: false,
						multiple: true
          }
        },
        csEmployeeName: {
          key: 'csEmployeeName',
          label: '客服',
          type: 'remoteSelect',
          searchType: 'in',
          multiple: true,
          'collapse-tags': true,
          value: '',
          data: [],
          saveList: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            this.getMulEmployeeName('', item, 'cs')
          },
          filterMehod: (val, item) => {
            this.getMulEmployeeName(val, item, 'cs')
          }
        },
        custClass: {
          key: 'custClass',
          label: '客户类型',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: store.state.dict.dictMap.customerClassNew,
          nonDictionary: true
        },
        custName: {
          key: 'custName',
          label: '委托单位',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        cargoCustName: {
          key: 'cargoCustName',
          label: '发货单位',
          type: 'remoteSelect',
          multiple: true,
          saveList: [],
          'collapse-tags': true,
          searchType: 'in',
          value: '',
          data: [],
          nonDictionary: true,
          queryValue: '',
          visibleChange: (val, item) => {
            this.getCargoCustList('', item)
          },
          filterMehod: (val, item) => {
            this.getCargoCustList(val, item)
          },
          change: (val, item) => {
            let findItem = item.data.find((ele) => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        },
        polPortCode: {
          key: 'polPortCode',
          label: '起运港代码',
          type: 'remoteSelect',
          saveList: [],
          searchType: 'eq',
          value: '',
          data: [],
          nonDictionary: true,
          queryValue: '',
          visibleChange: (val, item) => {
            this.airPortSearch('', '', this.state, item)
          },
          filterMehod: (val, item) => {
            this.airPortSearch(val, '', this.state, item)
          },
          change: (val, item) => {
            let findItem = item.data.find((ele) => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        },
        podPortCode: {
          key: 'podPortCode',
          label: '目的地',
          type: 'remoteSelect',
          saveList: [],
          searchType: 'eq',
          value: '',
          data: [],
          nonDictionary: true,
          queryValue: '',
          visibleChange: (val, item) => {
            this.airPortSearch('', '', this.state, item)
          },
          filterMehod: (val, item) => {
            this.airPortSearch(val, '', this.state, item)
          },
          change: (val, item) => {
            let findItem = item.data.find((ele) => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        },
        airLine: {
          key: 'airLine',
          label: '航空公司',
          type: 'remoteSelect',
          saveList: [],
          searchType: 'eq',
          value: '',
          data: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            if (val) {
              this.aircarrierSearch('', item)
            }
          },
          filterMehod: (val, item) => {
            this.aircarrierSearch(val, item)
          },
          change: (val, item) => {
            Object.assign(item, {
              queryValue: val,
              text: val
            })
          }
        },
        bkgAgentSupplierId: {
          key: 'bkgAgentSupplierId',
          label: '订舱代理',
          type: 'remoteSelect',
          saveList: [],
          searchType: 'eq',
          value: '',
          data: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            this.getSupplierList('bkg_agent', '', item)
          },
          filterMehod: (val, item) => {
            this.getSupplierList('bkg_agent', val, item)
          },
          change: (val, item) => {
            let findItem = item.data.find((ele) => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        },
        airSysLineCode: {
          key: 'airSysLineCode',
          label: '系统航线',
          type: 'remoteSelect',
          multiple: true,
          saveList: [],
          'collapse-tags': true,
          searchType: 'in',
          value: '',
          data: [],
          nonDictionary: true,
          queryValue: '',
          visibleChange: (val, item) => {
            this.airsysLine('', item)
          },
          filterMehod: (val, item) => {
            this.airsysLine(val, item)
          },
          change: (val, item) => {
            let findItem = item.data.find((ele) => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        },
        polCountryCname: {
          key: 'polCountryCname',
          label: '起运国',
          type: 'remoteSelect',
          multiple: true,
          saveList: [],
          'collapse-tags': true,
          searchType: 'in',
          value: '',
          data: [],
          nonDictionary: true,
          queryValue: '',
          visibleChange: (val, item) => {
            this.getCountryList('', item)
          },
          filterMehod: (val, item) => {
            this.getCountryList(val, item)
          },
          change: (val, item) => {
            let findItem = item.data.find((ele) => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        },
          podCountryCname: {
          key: 'podCountryCname',
          label: '目的国',
          type: 'remoteSelect',
          multiple: true,
          saveList: [],
          'collapse-tags': true,
          searchType: 'in',
          value: '',
          data: [],
          nonDictionary: true,
          queryValue: '',
          visibleChange: (val, item) => {
            this.getCountryList('', item)
          },
          filterMehod: (val, item) => {
            this.getCountryList(val, item)
          },
          change: (val, item) => {
            let findItem = item.data.find((ele) => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        },
        transportTerm: {
          key: 'transportTerm',
          label: '运输条款',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: store.state.dict.dictMap.airTransportTerm,
          nonDictionary: true
        },
        airBillType: {
          key: 'airBillType',
          label: '运单方式',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: store.state.dict.dictMap.airTransitWay,
          nonDictionary: true
        },
        billSplitNum: {
          key: 'billSplitNum',
          label: '分单数',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        totalQuantity: {
          key: 'totalQuantity',
          label: '制单件数',
          type: 'input',
          searchType: 'eq',
          value: ''
        },
        totalWeight: {
          key: 'totalWeight',
          label: '制单毛重',
          type: 'input',
          searchType: 'eq',
          value: ''
        },
        chargeWeight: {
          key: 'chargeWeight',
          label: '制单计费重',
          type: 'input',
          searchType: 'eq',
          value: ''
        },
        totalVolume: {
          key: 'totalVolume',
          label: '制单体积',
          type: 'input',
          searchType: 'eq',
          value: ''
        },
        cargoCname: {
          key: 'cargoCname',
          label: '中文品名',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        cargoEname: {
          key: 'cargoEname',
          label: '英文品名',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        blNo: {
          key: 'blNo',
          label: '运单号',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        realEflightNumber: {
          key: 'realEflightNumber',
          label: '实际航次号',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        custIntrustNo: {
          key: 'custIntrustNo',
          label: '客户委托号',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        airCustomsType: {
          key: 'airCustomsType',
          label: '报关方式',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: store.state.dict.dictMap.airCustomsType,
          nonDictionary: true
        },
        businessType: {
          label: '业务类型',
          key: 'businessType',
          propInDict: 'airBusinessType',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: [],
          nonDictionary: true
        },
        createdTime: {
          label: '订单创建时间',
          key: 'createdTime',
          type: 'date2',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd',
          'default-value': defaulTime
        },
        serviceCode: {
          label: '服务项',
          key: 'serviceCode',
          propInDict: 'airServices',
          type: 'select',
          searchType: 'like',
          // multiple: true,
          // 'collapse-tags': true,
          value: '',
          data: [],
          nonDictionary: true
        },
        planEtdTime: {
          label: '预计起飞日期',
          key: 'planEtdTime',
          type: 'date2',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd'
        },
        realEtdTime: {
          label: '实际起飞时间',
          key: 'realEtdTime',
          type: 'date2',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd'
        },
        finCloseStatus: {
          label: '关账状态',
          key: 'finCloseStatus',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: store.state.airTransport.orderList.finCloseStatus,
          nonDictionary: true
        },

        billSplitNum: {
          key: 'billSplitNum',
          label: '分单数',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        usdProfit: {
          key: 'usdProfit',
          label: '利润额-折美元含手续费',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        cnyProfit: {
          key: 'cnyProfit',
          label: '利润额-折人民币含手续费',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        etaTimePlanVoyage1: {
          label: '预计到达日(国际1程)',
          key: 'etaTimePlanVoyage1',
          type: 'date2',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd'
        },
        etaTimeRealVoyage1: {
          label: '实际到达日(国际1程)',
          key: 'etaTimeRealVoyage1',
          type: 'date2',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd'
        },
        etaTimePlanVoyage0: {
          label: '预计到达日(国内)',
          key: 'etaTimePlanVoyage0',
          type: 'date2',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd'
        },
        etaTimeRealVoyage0: {
          label: '实际到达日(国内)',
          key: 'etaTimeRealVoyage0',
          type: 'date2',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd'
        },
        deliveryTime: {
          label: '实际派送时间',
          key: 'deliveryTime',
          type: 'date',
          searchType: 'like',
          value: '',
          category: 'date',
          format: 'yyyy-MM-dd',
          hasEmptyValue: true,
        }
      },
      // 默认展示的搜索条件，搜索条件分类
      searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),
      searchConfig: [],
      tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
      // table复选框多选的值
      selectedCheckbox: [],
      // table基础组件
      tableConfig: {
        style: {},
        tableIndex: {
          show: true
        },
        options: {
          // 是否支持解锁列表修改,默认锁定列表不可更改
          lockState: true,
          // 是否支持列表项选中功能
          mutiSelect: true,
          // 多选框状态判断 {false不可选, true可选}
          checkSelectable({ orderNo }) {
            return orderNo ? true : false
          }
        },
        customColumns: {
          show: true,
          handleCustomColumns: this.handleCustomColumns
        },
        defaultEmpty: true, // 数据默认不加载的显示文案
        list: [],
        configColumns: [],
        columns: store.state.airTransport.orderReportList.columnsBase(
          this.handleOrderNoInfo
        ),
        allColumns: store.state.airTransport.orderReportList.columnsBase(
          this.handleOrderNoInfo
        ),
        // 操作按钮组
        operationBtns: {
          minWidth: '170px',
          fixed: 'right',
          show: false
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
      },
      // 显示自定义表头的弹窗状态
      customColumnsPopShow: false,
      // 新建订单弹窗
      createOrderPopShow: false,
      resDefaConfList: [] // 后端配置的默认搜索模板
    }
  },
  beforeRouteLeave(to, from, next) {
    if (to.name === 'AirTransportOrderDetail') {
      let views = this.$store.state.tagsView.visitedViews.filter(
        (item) => item.params.orderNo === to.params.orderNo
      )
      this.$store.commit('tagsView/DEL_SAMEORDER_VISITED_VIEW', views)
    }
    next()
  },
  activated() {
    window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
  },
  deactivated() {
    window.removeEventListener('keydown', this.handleKeyDown)
  },
  created() {
    // this.getList(true)
    this.cTimestamp = new Date().getTime()
    this.getDeptList()
    this.airServiceList()
    this.init()
    this.getBusinessType()
  },
  mounted() {},
  watch: {},
  computed: {
    ...mapState({
      currRole: (state) => state.user.currRole,
      roles: (state) => state.user.roles,
      dictMap: (state) => state.dict.dictMap,
      defaultColumns: (state) =>
        state.airTransport.orderReportList.defaultColumns,
      specialColumns: (state) =>
        state.airTransport.orderReportList.specialColumns,
      columnsBase: (state) => state.airTransport.orderReportList.columnsBase(),
      userId: (state) => state.user.userId
    }),
    isAc() {
      return this.currRole === 'ac' || this.currRole === 'eac'
    },
    isOp() {
      return this.currRole === 'op'
    },
    isCs() {
      // 客服
      return this.currRole === 'cs' || this.currRole === 'ecs'
    },
    isEpricing() {
      return this.currRole === 'epricing'
    },
    isBd() {
      return (
        this.currRole === 'bd' ||
        this.currRole === 'obd' ||
        this.currRole === 'asst'
      )
    },
    isPricing() {
      return this.currRole === 'pricing'
    }
  },
  components: {
    Search,
    AddFilter,
    BaseTableMuti,
    BaseDialog,
    CustomColumns,
    TableFilter
  },
  methods: {
    airServiceList() {
      airServiceList().then((res) => {
        let result = []
        res.data.forEach((item) => {
          result.push({
            label: item.serviceName,
            value: item.serviceCode
          })
        })
        // 空运服务类型
        this.$set(this.dictMap, 'airServices', result)
      })
    },
    getCountryList(val, item) {
      countrySelectList({
        countryCode: val,
        state: 'valid'
      }).then((res) => {
        let filterArr = res.data.filter(
          (ele) => !item.saveList.find((o) => o.value === ele.cname)
        )
        let itemList = filterArr.map((ele) => {
          return {
            ...ele,
            label: ele.cname,
            value: ele.cname
          }
        })
        item.data = [...item.saveList, ...itemList]
      })
    },
    // 获取发货单位
    getCargoCustList(val, item) {
      this.$store.dispatch('dict/queryCustomerList', val).then((data) => {
        let filterArr = data.list.filter(
          (ele) => !item.saveList.find((o) => o.value === ele.name)
        )
        let itemList = filterArr.map((ele) => {
          return {
            ...ele,
            label: ele.name,
            value: ele.name
          }
        })
        item.data = [...item.saveList, ...itemList]
      })
    },
    // 所属部门下拉框
    getDeptList() {
      departmentTreeList({ state: 'valid' }).then((res) => {
        this.departmentList.splice(0, 1000, ...this.getTreeData(res.data || []))
        this.$set(this.filterGroups, 'bdDeptCode', {
					specialProp:'deptCode',
					label: '销售部门', 
					key: 'bdDeptCode',
					type: 'cascader',
					searchType: 'in',
					cascaderList: this.departmentList,
					saveList: [],
					cascaderProps: {
						children: 'childList',
						label: 'deptCname',
						value: 'deptCode',
						checkStrictly: false,
						multiple: true
					},
				})

        this.$set(this.filterGroups, 'opDeptCode', {
					specialProp:'deptCode',
					label: '操作部门', 
					key: 'opDeptCode',
					type: 'cascader',
					searchType: 'in',
					cascaderList: this.departmentList,
					saveList: [],
					cascaderProps: {
						children: 'childList',
						label: 'deptCname',
						value: 'deptCode',
						checkStrictly: false,
						multiple: true
					},
				})

      })
    },
    getCompDept(data) {
      let list = JSON.parse(JSON.stringify(data))[0].childList
      return list.map((ele) => {
        return {
          ...ele,
          label: ele.deptCname,
          value: ele.deptCode
        }
      })
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      data.forEach(
        (item) =>
          (item.childList = item.childList.length
            ? this.getTreeData(item.childList)
            : undefined)
      )
      return data
    },
    // 获取委托单位
    getCustList(val, item) {
      let data = {
        currPage: 1,
        pageSize: 50,
        query: val
          ? [
              { column: 'name', type: 'like', value: val },
              { column: 'roleType', type: 'eq', value: 'client' }
            ]
          : [{ column: 'roleType', type: 'eq', value: 'client' }]
      }
      customerListAllStatus(data).then((res) => {
        let filterArr = res.data.list.filter(
          (ele) => !item.saveList.find((o) => o.value === ele.custid)
        )
        let itemList = filterArr.map((ele) => {
          return {
            ...ele,
            label: this.$language == 'en' ? ele.ename : ele.name,
            value: ele.custid
          }
        })
        item.data = [...item.saveList, ...itemList]
      })
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
    // 获取本地table列表的字段和宽为数组集合
    getTableColumnsWidth() {
      let result = this.tableConfig.columns.map((item) => {
        return { column: item.prop, width: item.width }
      })
      return result
    },
    getEmployeeName(val, item) {
      // console.log('item.saveList', item.saveList)
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        roleCode: 'bd' // 角色
      }
      baseEmployeeListName(data).then((res) => {
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
    getMulEmployeeName(val, item, role) {
      // console.log('item.saveList', item.saveList)
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        roleCode: role // 角色
      }
      baseEmployeeListName(data).then((res) => {
        let list = res.data.map((ele) => {
          return {
            ...ele,
            label: this.$language === 'en' ? ele.ename : ele.cname,
            value: this.$language === 'en' ? ele.ename : ele.cname
          }
        })
        let formatArr = () => {
          let map = new Map()
          for (let item of list) {
            if (!map.has(item.value)) {
              map.set(item.value, item)
            }
          }
          return [...map.values()]
        }
        let newArr = formatArr()
        let filterArr = newArr.filter(
          (ele) => !item.saveList.find((o) => o.value === ele.value)
        )
        let itemList = filterArr.map((ele) => {
          return { ...ele, label: ele.label, value: ele.value }
        })
        item.data = [...item.saveList, ...itemList]
      })
    },
    async initQuery() {
      this.tableQuery.currPage = 1
      this.tableQuery.query = []
      this.init()
      this.getBusinessType()
      this.$refs.search.getSearchConditionInfo(true)
      // this.searchCallBack('Search')
      // this.getList()
    },
    // 获取服务类型
    getBusinessType() {
      let result = []
      let airBusinessTypeResult = []
      baseBusinessList().then((res) => {
        this.businessTypeOptions = res.data
        console.log(res.data)
        res.data.forEach((item) => {
          if (
            item.business === 'air' &&
            item.serviceTypeList &&
            item.serviceTypeList.length
          ) {
            airBusinessTypeResult.push({
              label: item.name,
              value: item.businessType
            })
            item.serviceTypeList.forEach((ele) => {
              result.push({
                label: item.name + '-' + ele.name,
                value: ele.serviceType
              })
            })
          }
        })
        result.forEach((item) => {
          Object.assign(this.serviceTypeOptions, {
            [item.value]: item.label
          })
        })
        // 空运服务类型
        this.$set(this.dictMap, 'airServiceType', result)
        // 空运业务类型
        this.$set(this.dictMap, 'airBusinessType', airBusinessTypeResult)
      })
    },

    init() {
      // 默认展示全部
      this.tableQuery.orderStatus = 'all'
      // if (this.isOp || this.isAc) {
      //   this.filterGroups.orderStatus.propInDict = 'opOrderStatus'
      // }
      // if (this.isPricing) {
      //   this.filterGroups.orderStatus.propInDict = 'airPricingOrderStatus'
      // }
      Object.assign(this.allFilterGroups, {
        all: this.filterGroups
      })
      this.searchInputGroup = JSON.parse(
        JSON.stringify(defaultSearchInputGroup)
      )
    },

    // 增加一条搜索条件
    handleAddFilter() {
      this.searchInputGroup.push({
        key: '',
        value: '',
        category: 'all',
        queryValue: ''
      })
    },
    // 空运航线
    airsysLine(value, item) {
      this.$store
        .dispatch('dict/airportSyslineList', { value })
        .then((data) => {
          let list = data.map((ele) => {
            return Object.assign(ele, {
              label: `${ele.cname}`,
              value: ele.sysLineCode
            })
          })
          item.data = list
        })
    },
    // 空运港口
    airPortSearch(portName, portCodes, state, item) {
      this.$store
        .dispatch('dict/airportList', { portName, portCodes, state })
        .then((data) => {
          let portList = data.map((ele) => {
            return Object.assign(ele, {
              value: ele.portCode,
              label: `${ele.portCode}`
            })
          })
          item.data = portList
        })
    },
    // 航空公司
    aircarrierSearch(queryString, item) {
      this.$store
        .dispatch('dict/aircarrierList', {
          carrierName: queryString
        })
        .then((data) => {
          item.data = data
            .map((ele) => {
              return Object.assign(ele, {
                label: `${ele.itat}`,
                value: ele.itat
              })
            })
            .filter((el) => el.itat)
        })
    },

    // 获取订舱代理-空运待定
    getSupplierList(type, queryString, item) {
      this.$store
        .dispatch('dict/querySupplierList', {
          category: 'category',
          value: 'bkg_carrier,bkg_agent',
          categoryType: 'in',
          queryString: queryString
        })
        .then((data) => {
          item.data = data.list.map((ele) => {
            return Object.assign(ele, {
              label: this.$language == 'en' ? ele.ename : ele.name,
              value: ele.supplierId ? Number(ele.supplierId) : ''
            })
          })
        })
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
        //触发的事件
        this.searchCallBack('Search')
      }
    },

    // 获取列表请求参数
    getListQuery() {
      let statusQuery = []

      // 合并状态参数
      let data = {}
      Object.assign(data, this.tableQuery, {
        query: this.tableQuery.query.concat(statusQuery)
      })
      delete data.orderStatus

      return data
    },
    // 排序
    handleSort(query) {
      this.getList()
    },
    // 列表数据
    async getList(isLoop) {
      if (!isLoop) this.loading = true
      let params = this.getListQuery()

      params.query.map((item) => {
        if (['orderNo', 'blNo', 'hawb', 'poNo'].includes(item.column)) {
          let resultNo = item.value
            .split(/[,|，|\s]/)
            .filter(Boolean)
            .join('#')

          item.value = resultNo
          item.type = 'like'
        }
      })
      this.oldParams = params
      let { data } = await columnWidthConfigInfo({
        scenesCode: this.$route.name
      })
      let { columnWidthList } = data
      getParamMethod(this.$route.name, params).then((queryObj) => {
        orderReport(queryObj)
          .then((response) => {
            this.oldParams = queryObj
            let { list, totalCount, configColumns, pageSize } = response.data
            // 请求无数据显示的文案
            if (!list || !list.length) {
              this.$set(this.tableConfig, 'defaultEmpty', false)
            }
            this.tableQuery.pageSize = pageSize
            list.forEach((item) => {
              item.serviceTypeName = item.serviceType
                ? this.serviceTypeOptions[item.serviceType]
                : ''
              let findItem = this.businessTypeOptions.find(
                (ele) => ele.businessType === item.businessType
              )
              item.businessTypeCn = findItem ? findItem.name : ''
              if (item.orderStatus === 'cancel')
                Object.assign(item, { orderIsCancel: true })
              if (item.orderStatus === 'close')
                Object.assign(item, { orderIsClose: true })
              if (item.orderStatus === 'complete')
                Object.assign(item, { orderIsFinish: true })
            })
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
            this.tableConfig.configColumns.push(
              'isCancelApply',
              'isNotify',
              'isChange'
            )
            this.tableConfig.configColumns = new Set(
              this.tableConfig.configColumns
            )
            this.tableConfig.configColumns = Array.from(
              this.tableConfig.configColumns
            )

            this.handleFilterColumns(this.tableConfig.configColumns)
            this.tableConfig.columns.map((item) => {
              // 取服务器返回的宽度
              let findItem = columnWidthList.find(
                (ele) => ele.column === item.prop
              )
              let newWidth = findItem ? findItem.width : ''
              return Object.assign(item, { width: newWidth || item.width })
            })

            if(this.tableConfig.columns.length<12){
              let tabelWidth=document.body.clientWidth-200
              for(let i=0;i<this.tableConfig.columns.length;i++){
                this.$set(this.tableConfig.columns[i],'width',tabelWidth/this.tableConfig.columns.length)
              }
            }

            this.tableColumnsWidthList = this.getTableColumnsWidth()
          })
          .finally(() => {
            this.loading = false
          })
      })
    },
    // 查询组件回调
    searchCallBack(action, param) {
      let query = []
      if (action === 'Search') {
        // 新增的查询条件组装tableQuery参数
        if (this.searchInputGroup.length) {
          this.searchInputGroup.forEach((item, index) => {
            let tempItem = {}

            if (item.key) {
              // 非自动补全的查询参数从item.value中取值合并到query
              if (this.filterGroups[item.key].type !== 'autocomplete') {
                if (this.filterGroups[item.key].type === 'cascader') {
                  if(this.filterGroups[item.key].cascaderProps.multiple){
										let arr=[]
										if(item.value&&item.value.length){
											for(let i=0;i<item.value.length;i++){
												if(item.value[i]&&item.value[i].length){
													arr.push(item.value[i][item.value[i].length-1])
												}
											}
										}
										Object.assign(tempItem, {
											column: item.key,
											type: this.filterGroups[item.key].searchType || 'in',
											value: arr.length ? arr.toString() : ''
										})
									}else{
										Object.assign(tempItem, {
											column: item.key,
											type: 'eq',
											value: item.value ? item.value[item.value.length - 1] : ''
										})
									}
                } else if (this.filterGroups[item.key].multiple) {
                  Object.assign(tempItem, {
                    column: item.key,
                    type: this.filterGroups[item.key].searchType || 'eq',
                    value: item.value ? item.value.toString() : ''
                  })
                } else if (
                  this.filterGroups[item.key].category === 'daterange'
                ) {
                  // 时间区间组件的value值是数组，['beginDate','endDate'],要转换成后端需要的两个字段
                  if (item.value && item.value[0]) {
                    if (item.value[0] === '-') {
                      query.push({
                        column: item.key,
                        type: 'empty',
                        value: '-'
                      })
                    } else {
                      query.push({
                        column: item.key,
                        type: 'ge',
                        value: item.value[0] + ' 00:00:00'
                      })
                    }
                  }
                  if (item.value && item.value[1]) {
                    query.push({
                      column: item.key,
                      type: 'le',
                      value: item.value[1] + ' 23:59:59'
                    })
                  }
                } else if (this.filterGroups[item.key].category === 'date' && this.filterGroups[item.key].hasEmptyValue && item.value === '-') {
                  query.push({
                    column: item.key,
                    type: 'empty',
                    value: '-'
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

              if (item.key === 'orderStatus') {
                this.tableQuery.orderStatus = item.value
              }
              query.push(tempItem)
            }
          })
          // 按orderStatus查询，特殊处理表格tab值为空，不按orderStatus查的默认值为all,显示全部tab
          if (
            this.searchInputGroup.some(
              (ele) => ele.key === 'orderStatus' && ele.value
            )
          ) {
            // this.tableQuery.orderStatus = ''
            if (this.tableQuery.orderStatus !== 'mine')
              this.tableQuery.orderStatus = ''
          } else if (!this.tableQuery.orderStatus) {
            this.tableQuery.orderStatus = 'all'
          } else {
          }
        }

        Object.assign(this.tableQuery, {
          query: query.filter((item) => {
            return item.value
          }),
          currPage: 1
        })
        this.getList()
      }
      if (action === 'Reset') {
        this.handleSearchValueReset()
      }
      // 模板加载后修改搜索组件的数组
      if (action === 'Update') {
        this.searchInputGroup = param.length
          ? [...param]
          : [...defaultSearchInputGroup]
      }
      // 刷新
      if (action === 'Refresh') {
        this.loading = true
        orderReport(this.oldParams)
          .then((response) => {
            let { list, totalCount, configColumns, pageSize } = response.data
            this.tableQuery.pageSize = pageSize
            list.forEach((item) => {
              item.serviceTypeName = item.serviceType
                ? this.serviceTypeOptions[item.serviceType]
                : ''
              let findItem = this.businessTypeOptions.find(
                (ele) => ele.businessType === item.businessType
              )
              item.businessTypeCn = findItem ? findItem.name : ''
              if (item.orderStatus === 'cancel')
                Object.assign(item, { orderIsCancel: true })
              if (item.orderStatus === 'close')
                Object.assign(item, { orderIsClose: true })
              if (item.orderStatus === 'complete')
                Object.assign(item, { orderIsFinish: true })
            })
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
            this.tableConfig.configColumns.push(
              'isCancelApply',
              'isNotify',
              'isChange'
            )
            this.tableConfig.configColumns = new Set(
              this.tableConfig.configColumns
            )
            this.tableConfig.configColumns = Array.from(
              this.tableConfig.configColumns
            )

            this.handleFilterColumns(this.tableConfig.configColumns)
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    handleSearchValueReset() {
      this.searchInputGroup.map((item) => {
        item.value = ''
        return { ...item }
      })
      // console.log('重置')
    },
    // 保存搜索条件
    searchConditionSave(param, type) {
      let searchItemList = []
      this.searchInputGroup.map((item) => {
        if (item.key) {
          // 特殊处理的几种查询类型,daterange,remoteSelect,mulitple
          let searchValue = ''
          searchValue = item.value
          if (this.filterGroups[item.key].category === 'daterange') {
            searchValue = item.value ? item.value.toString() : ''
          }
          if (this.filterGroups[item.key].type === 'remoteSelect') {
            // 单选
            if (!this.filterGroups[item.key].multiple) {
              let text = this.filterGroups[item.key].text
              searchValue = item.value ? `${item.value}|${text}` : ''
            } else {
              // 多选-中转港
              searchValue = item.value ? item.value.toString() : ''
            }
          }
          searchItemList.push({
            searchField: item.key,
            searchValue: searchValue
          })
        }
      })

      if (type === 'immediateSave') {
        searchItemList = param.searchItemList
      }
      searchConditionSave({
        scenesCode: `${this.$route.name}_${this.currRole}`,
        composeKey: param.composeKey,
        searchConfigList: searchItemList
      }).then((res) => {
        if (type === 'immediateSave') {
          // 选中的模板切换设置相应的搜索条件反显
          this.setSearchCondition(param.composeKey)
          return
        } else {
          this.$message({
            type: 'success',
            message: '保存成功',
            duration: 1000,
            onClose: () => {
              this.getSearchConditionInfo()
            }
          })
        }
      })
    },
    // 删除搜索模板
    searchConditionDelete(param) {
      this.$confirm('是否确认删除该搜索模板?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          searchConditionDelete({
            scenesCode: `${this.$route.name}_${this.currRole}`,
            composeKey: param.composeKey
          }).then((res) => {
            this.$message({
              type: 'success',
              message: '删除成功',
              duration: 1000,
              onClose: () => {
                this.getSearchConditionInfo()
              }
            })
          })
        })
        .catch((err) => {})
    },
    // 导出
    handleExport() {
      let data = this.getListQuery()
      orderReportExport({
        ascColumns: data.ascColumns,
        descColumns: data.descColumns,
        query: this.oldParams.query
      }).then((response) => {
        let { filePath } = response.data
        window.location.href = filePath
      })
    },

    // 自定义表头
    handleCustomColumns() {
      this.customColumnsPopShow = true
    },

    // 多选
    handleMuti(arr) {
      this.selectedCheckbox = arr
    },

    handleSizeChange() {
      this.getList()
    },

    handleCurrentChange(val) {
      if (val === 1) return (this.tableConfig.list = [])
      this.getList()
    },
    // 获取自定义搜索查询
    getSearchConditionInfo(changeRole) {
      searchConditionInfo({
        scenesCode: `${this.$route.name}_${this.currRole}`
      }).then((res) => {
        let { defaultConfigList, customConfigList } = res.data
        this.resDefaConfList = defaultConfigList
        // 搜索模板存在，就默认显示第一个模板的搜索条件。不存在搜索模板，则显示后端配置的默认模板
        // 后端如果没有配置模板的话，则前端显示默认一个空的搜索条件
        if (!customConfigList || !customConfigList.length) {
          // 后端无配置默认模板
          if (!defaultConfigList || !defaultConfigList.length) {
            this.searchConditionList = []
            this.init()
            changeRole && this.searchCallBack('Search')
            return
          }
          // 有配置默认模板
          this.searchConditionList = []
          let composeKey = defaultConfigList[0].composeKey
          this.setSearchCondition(composeKey, defaultConfigList, changeRole)
          // this.getList()
        } else {
          this.searchConditionList = customConfigList
          // 获取自定义搜索数据后默认选中第一个模板
          let composeKey = customConfigList[0].composeKey
          this.setSearchCondition(composeKey, [], changeRole)
        }
      })
    },
    // 按选中的搜索模板设置搜索条件反显
    setSearchCondition(composeKey, defaultConfigList, changeRole) {
      this.searchInputGroup = []
      let searchItemList = []
      let findItem = []
      findItem = this.searchConditionList.find(
        (item) => item.composeKey === composeKey
      )
      // 后端有配置好的模板
      if (defaultConfigList && defaultConfigList.length) {
        findItem = defaultConfigList.find(
          (item) => item.composeKey === composeKey
        )
      }
      searchItemList = findItem ? findItem.searchItemList : []
      searchItemList.map((item) => {
        let value = ''
        value = item.searchValue
        // 时间区间，下拉搜索查询，下拉多选特殊处理反显
        if (this.filterGroups[item.searchField].category === 'daterange') {
          value = item.searchValue ? item.searchValue.split(',') : ''
        }
        if (this.filterGroups[item.searchField].type === 'remoteSelect') {
          // 单选
          if (!this.filterGroups[item.searchField].multiple) {
            let length = item.searchValue.length
            let indexOf = item.searchValue.indexOf('|')
            let code = item.searchValue.substring(0, indexOf)
            let text = item.searchValue.substring(indexOf + 1, length)
            value = code
            this.filterGroups[item.searchField].data = [{ label: text, value }]
          } else {
            // 多选
            if (item.searchValue) {
              // 中转港调港口接口获取下拉数据反显
              value = item.searchValue.split(',')
              this.$store
                .dispatch('dict/basePortListByCodes', {
                  portCodes: item.searchValue
                })
                .then((data) => {
                  this.filterGroups[item.searchField].data = data
                })
            }
          }
        }
        this.searchInputGroup.push({
          key: item.searchField,
          value: value,
          category: 'all',
          queryValue: ''
        })
      })
      changeRole && this.searchCallBack('Search')
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
      this.selectedCheckbox.forEach((item) => {
        orderNos.push(item.orderNo)
      })
      return orderNos
    },
    // 点击订单号查看详情
    handleOrderNoInfo(row) {
      this.handleInfo(row)
    },
    // 去详情页
    handleInfo(row) {
      let action = ''
      // 业务除草稿和拒绝状态都不可编辑
      if (this.isBd && !['draft', 'refuse'].includes(row.orderStatus)) {
        action = 'view'
      }
      // 操作角色非审核通过都不可编辑
      if (this.isOp && !['pass'].includes(row.orderStatus)) {
        action = 'view'
      }
      this.isJumpRouteFromPage = true
      let routeUrl = this.$router.resolve({
        name: 'AirTransportOrderDetail',
        params: {
          orderNo: row.orderNo
        },
        query: {
          orderNo: row.orderNo,
          source: 'AirTransportOrderReport',
          action: action
        }
      })
      window.open(routeUrl.href, '_blank')
    },
    // 过滤显示自定义的表头
    handleFilterColumns(value) {
      let { allColumns } = this.tableConfig
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

    // 获取特殊处理的自定义表头，例：polCode,需要传polCode,polEname,polCname,podCode, podEname,podCname给后端
    getColumnsValues(value) {
      // 20211202 orderNo表头不固定在第一列
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
    }
  }
}
</script>
<style lang="scss">
</style>
