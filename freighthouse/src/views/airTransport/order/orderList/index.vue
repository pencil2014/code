<template>
  <div class="app-container">
    <RoleSwitch @callback="initQuery" />
    <div class="search-container">
      <Search ref="search" fixedCreatedTime :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery" :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
        <AddFilter fixedCreatedTime :searchInputGroup="searchInputGroup" :allFilterGroups="allFilterGroups" :filterGroups="filterGroups" :defaultSearchLength="defaultSearchLength" :callback="searchCallBack" :index="index" :item="item" v-for="(item, index) in showSearchInputGroup" :key="'filter' + index" />
        <div class="btn-plus-search" @click="handleAddFilter" ref="btnPlus"></div>
      </Search>
    </div>
    <div class="table-container show-refuse-row-tabel" :class="['cancel', 'close', 'complete'].includes(tableQuery.orderStatus) ? 'init-table-container' : ''" ref="tableCont">
      <TableFilter :config="tableConfig" :islLoop="islLoop" :tableQuery.sync="tableQuery" :callback="tableCallBack" @changeIsLoop="changeIsLoop" />
      <BaseTableMuti :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" v-loading="loading" />
    </div>
    <!-- 自定义表头 -->
    <div v-if="customColumnsPopShow">
      <CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
    </div>
    <!-- 新建弹窗 -->
    <div v-if="createOrderPopShow">
      <CreateOrder @close="createOrderPopClose" />
    </div>
    <!-- 取消订单弹窗 -->
    <div v-if="cancelOrderPopShow">
      <CancelOrder @close="cancelOrderPopClose" :orderNo="orderNo" :serviceType="serviceType" />
    </div>
  </div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
// import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilter'
import RoleSwitch from './components/roleSwitch'
// 弹出框
import BaseDialog from '@/components/Base/Dialog/index'
import CustomColumns from '@/components/customColumns/index'
import CreateOrder from './components/createOrder'
import CancelOrder from './components/cancelOrder'
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
import {
  orderCreate,
  orderClose,
  orderDelete,
  orderCancelCancel,
  orderRelationList
} from '@/api/order/list'
import {
  orderList,
  orderListExport,
  orderCopy,
  airServiceList
} from '@/api/airTransport/order'
import { customerListAllStatusNew } from '@/api/crm/supplier.js'
import { departmentTreeList } from '@/api/companyResource'
import { getParamMethod } from '@/utils/allKindNumber'
import { formatDate } from '@/utils/index'

const end = new Date()
const start = new Date()
let defaulTime = []
start.setTime(start.getTime() - 3600 * 1000 * 24 * 89)
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
    key: 'universalNo',
    value: '',
    placeholder: '筛选条件',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'orderNo',
    value: '',
    placeholder: '工作号',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'polPortCode',
    value: '',
    placeholder: '起运港',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'podPortCode',
    value: '',
    placeholder: '目的地',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'airLine',
    value: '',
    placeholder: '航空公司',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'custid',
    value: '',
    placeholder: '委托单位',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'createdTime',
    value: defaulTime,
    placeholder: '订单创建时间',
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
    key: 'etdTime',
    value: '',
    placeholder: '预计起飞日期',
    category: 'all',
    queryValue: ''
  }
]

export default {
  // mixins: [routerMixin],
  data() {
    return {
      islLoop: false,
      intervalTimer: null,
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
        universalNo: {
          key: 'universalNo',
          label: '各类编号',
          type: 'input',
          searchType: 'eq',
          value: ''
        },
        orderNo: {
          key: 'orderNo',
          label: '工作号',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        exportOrderNo: {
          key: 'exportOrderNo',
          label: '出口单号',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        bdServiceMode: {
          label: '新旧模式',
          key: 'bdServiceMode',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: [],
          nonDictionary: true
        },
        orderStatus: {
          label: '订单状态',
          key: 'orderStatus',
          type: 'select',
          searchType: 'in',
          value: '',
          data: [],
          multiple: true,
          saveList: [],
          'collapse-tags': true,
          queryValue: '',
          nonDictionary: true,
          disabledEdit: true
          // propInDict: 'orderStatus'
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

        serviceType: {
          label: '服务类型',
          key: 'serviceType',
          type: 'select',
          filterable: true,
          searchType: 'in',
          multiple: true,
          'collapse-tags': true,
          value: '',
          data: [],
          nonDictionary: true,
          propInDict: 'airServiceType'
        },

        serviceCode: {
          label: '服务项',
          key: 'serviceCode',
          propInDict: 'airServices',
          type: 'select',
          filterable: true,
          searchType: 'like',
          // multiple: true,
          // 'collapse-tags': true,
          value: '',
          data: [],
          nonDictionary: true
        },
        // bdEmployeeName: {
        //   key: 'bdEmployeeName',
        //   label: '销售',
        //   type: 'input',
        //   searchType: 'like',
        //   value: ''
        // },
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
          specialProp: 'deptCode',
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
          }
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
        asstEmployeeName: {
          key: 'asstEmployeeName',
          label: '下单助理',
          type: 'remoteSelect',
          searchType: 'in',
          multiple: true,
          'collapse-tags': true,
          value: '',
          data: [],
          saveList: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            this.getMulEmployeeName('', item, 'asst')
          },
          filterMehod: (val, item) => {
            this.getMulEmployeeName(val, item, 'asst')
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
        ecsEmployeeName: {
          key: 'ecsEmployeeName',
          label: '海外客服',
          type: 'remoteSelect',
          searchType: 'in',
          multiple: true,
          'collapse-tags': true,
          value: '',
          data: [],
          saveList: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            this.getMulEmployeeName('', item, 'ecs')
          },
          filterMehod: (val, item) => {
            this.getMulEmployeeName(val, item, 'ecs')
          }
        },
        epricingEmployeeName: {
          key: 'epricingEmployeeName',
          label: '海外商务',
          type: 'remoteSelect',
          searchType: 'in',
          multiple: true,
          'collapse-tags': true,
          value: '',
          data: [],
          saveList: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            this.getMulEmployeeName('', item, 'epricing')
          },
          filterMehod: (val, item) => {
            this.getMulEmployeeName(val, item, 'epricing')
          }
        },
        acEmployeeName: {
          key: 'acEmployeeName',
          label: '应收财务',
          type: 'remoteSelect',
          searchType: 'in',
          multiple: true,
          'collapse-tags': true,
          value: '',
          data: [],
          saveList: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            this.getMulEmployeeName('', item, 'ac')
          },
          filterMehod: (val, item) => {
            this.getMulEmployeeName(val, item, 'ac')
          }
        },
        eacEmployeeName: {
          key: 'eacEmployeeName',
          label: '海外应收财务',
          type: 'remoteSelect',
          searchType: 'in',
          multiple: true,
          'collapse-tags': true,
          value: '',
          data: [],
          saveList: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            this.getMulEmployeeName('', item, 'eac')
          },
          filterMehod: (val, item) => {
            this.getMulEmployeeName(val, item, 'eac')
          }
        },
        isOpHandle: {
          label: '操作处理状态',
          key: 'isOpHandle',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: [
            { label: '未处理', value: 'n' },
            { label: '处理中', value: 'y' },
            { label: '已完成', value: 'complete' }
          ],
          nonDictionary: true
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
        custIntrustNo: {
          key: 'custIntrustNo',
          label: '客户委托号',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        custid: {
          key: 'custid',
          label: '委托单位',
          type: 'remoteSelect',
          searchType: 'in',
          multiple: true,
          'collapse-tags': true,
          value: '',
          data: [],
          saveList: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            this.getCustList('', item)
          },
          filterMehod: (val, item) => {
            this.getCustList(val, item)
          }
        },
        // custName: {
        //   key: 'custName',
        //   label: '委托单位',
        //   type: 'input',
        //   searchType: 'like',
        //   value: ''
        // },
        intrustRemark: {
          key: 'intrustRemark',
          label: '委托备注',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        auditRemark: {
          key: 'auditRemark',
          label: '商务备注',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        bkgRemark: {
          key: 'bkgRemark',
          label: '订舱备注',
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
        prefinCloseStatus: {
          label: '预关账状态',
          key: 'prefinCloseStatus',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: store.state.airTransport.orderList.finCloseStatus,
          nonDictionary: true
        },
        prefinCloseTime: {
          label: '预关账时间',
          key: 'prefinCloseTime',
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
        finCloseTime: {
          label: '关账时间',
          key: 'finCloseTime',
          type: 'date2',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd'
        },
        receiveFeeCleanStatus: {
          key: 'receiveFeeCleanStatus',
          label: '应收费用结清状态',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: store.state.dict.dictMap.feeSettleStatus,
          nonDictionary: true
        },
        payFeeCleanStatus: {
          key: 'payFeeCleanStatus',
          label: '应付费用结清状态',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: store.state.dict.dictMap.feeSettleStatus,
          nonDictionary: true
        },
        receiveFeeConfirmStatus: {
          key: 'receiveFeeConfirmStatus',
          label: '应收确认状态',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: store.state.dict.dictMap.feeConfirmStatus,
          nonDictionary: true
        },
        payFeeConfirmStatus: {
          key: 'payFeeConfirmStatus',
          label: '应付确认状态',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: store.state.dict.dictMap.feeConfirmStatus,
          nonDictionary: true
        },
        receiveInvoiceStatus: {
          key: 'receiveInvoiceStatus',
          label: '应收发票状态',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: store.state.dict.dictMap.feeSettleStatus,
          nonDictionary: true
        },
        payFeeApplyStatus: {
          key: 'payFeeApplyStatus',
          label: '请款状态',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: store.state.dict.dictMap.feeSettleStatus,
          nonDictionary: true
        },
        createdTime: {
          label: '订单创建时间',
          key: 'createdTime',
          type: 'date',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd',
          'default-value': defaulTime,
          clearable: false,
          pickerOptions: {
            // 设置不能选择的日期
            onPick: ({ maxDate, minDate }) => {
              this.selectDate = minDate.getTime()
              if (maxDate) {
                this.selectDate = ''
              }
            },
            disabledDate: (time) => {
              // 1年365天的时间戳
              let two = 365 * 24 * 3600 * 1000
              // 是否限制的判断条件
              if (this.selectDate) {
                return (
                  time > new Date(this.selectDate + two) ||
                  time < new Date(this.selectDate - two)
                )
              } else {
                return false
              }
            },
            shortcuts: [
              {
                text: '最近三天',
                onClick(picker) {
                  const end = new Date()
                  const start = new Date()
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 2)
                  picker.$emit('pick', [start, end])
                }
              },
              {
                text: '最近一周',
                onClick(picker) {
                  const end = new Date()
                  const start = new Date()
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 6)
                  picker.$emit('pick', [start, end])
                }
              },
              {
                text: '最近一个月',
                onClick(picker) {
                  const end = new Date()
                  const start = new Date()
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 29)
                  picker.$emit('pick', [start, end])
                }
              },
              {
                text: '最近两个月',
                onClick(picker) {
                  const end = new Date()
                  const start = new Date()
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 59)
                  picker.$emit('pick', [start, end])
                }
              },
              {
                text: '最近三个月',
                onClick(picker) {
                  const end = new Date()
                  const start = new Date()
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 89)
                  picker.$emit('pick', [start, end])
                }
              },
              {
                text: '最近半年',
                onClick(picker) {
                  const end = new Date()
                  const start = new Date()
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 179)
                  picker.$emit('pick', [start, end])
                }
              },
              {
                text: '最近一年',
                onClick(picker) {
                  const end = new Date()
                  const start = new Date()
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 364)
                  picker.$emit('pick', [start, end])
                }
              },
              {
                text: '今年',
                onClick(picker) {
                  const end = new Date()
                  const start = new Date(end.getFullYear() + '-01-01')
                  picker.$emit('pick', [start, end])
                }
              }
            ]
          }
        },
        bizDate: {
          label: '业务日期',
          key: 'bizDate',
          type: 'date2',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd'
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
        deliveryTimes: {
          label: '实际派送时间',
          key: 'deliveryTimes',
          type: 'date',
          searchType: 'like',
          value: '',
          category: 'date',
          format: 'yyyy-MM-dd',
          hasEmptyValue: true
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
        polPortCode: {
          key: 'polPortCode',
          label: '起运港',
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
        etdTime: {
          label: '预计起飞日期',
          key: 'etdTime',
          type: 'date2',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd'
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
        airBillType: {
          key: 'airBillType',
          label: '运单方式',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: store.state.dict.dictMap.airTransitWay,
          nonDictionary: true
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
        isJoint: {
          key: 'isJoint',
          label: '协同状态',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: [
            { label: '已协同', value: 'y' },
            { label: '未协同', value: 'n' }
          ],
          nonDictionary: true
        },
        blNo: {
          key: 'blNo',
          label: '运单号',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        hawb: {
          key: 'hawb',
          label: '分单号',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        poNo: {
          key: 'poNo',
          label: '入仓编号',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        voyagePlan: {
          key: 'voyagePlan',
          label: '预计航次号',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        voyageReal: {
          key: 'voyageReal',
          label: '实际航次号',
          type: 'input',
          searchType: 'like',
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
        realEtdTime: {
          label: '实际起飞时间',
          key: 'realEtdTime',
          type: 'date2',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd'
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
        transportTerm: {
          key: 'transportTerm',
          label: '运输条款',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: store.state.dict.dictMap.airTransportTerm,
          nonDictionary: true
        },
        billSplitNum: {
          key: 'billSplitNum',
          label: '分单数',
          type: 'input',
          searchType: 'like',
          value: ''
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
        cancelExecTime: {
          label: '取消/终止/关闭时间',
          key: 'cancelExecTime',
          type: 'date2',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd'
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
        columns: store.state.airTransport.orderList.columnsBase(
          this.handleOrderNoInfo
        ),
        allColumns: store.state.airTransport.orderList.columnsBase(
          this.handleOrderNoInfo
        ),
        // 操作按钮组
        operationBtns: {
          minWidth: '170px',
          fixed: 'right',
          show: true,
          callback: (action, $index, row, item) => {
            if (action === 'Info') {
              this.handleInfo(row)
            }
            if (action === 'Copy') {
              this.handleCopy(row)
            }
            if (action === 'Cancel') {
              this.handleCancel(row)
            }
            if (action === 'Close') {
              this.handleClose(row)
            }
            if (action === 'Delete') {
              this.handleDelete(row)
            }
            if (action === 'CancelCancel') {
              this.handleCancelCancel(row)
            }
          },
          data: [
            {
              label: '详情',
              type: 'text',
              show: true,
              action: 'Info'
            },
            {
              label: '复制',
              type: 'text',
              show: (item, row) => {
                // 只有bd业务角色才有复制操作的权限
                if (
                  this.isBd &&
                  ([
                    row.bdEmployeeId * 1,
                    row.obdEmployeeId * 1,
                    row.asstEmployeeId * 1
                  ].includes(this.userId) ||
                    this.roles.includes('manager') ||
                    this.roles.includes('duty'))
                ) {
                  return true
                }
                return false
              },
              action: 'Copy'
            },
            {
              label: '取消',
              type: 'text',
              className: 'red',
              show: (item, row) => {
                // 只有业务bd才有取消操作的权限
                if (
                  this.isBd &&
                  ([
                    row.bdEmployeeId * 1,
                    row.obdEmployeeId * 1,
                    row.asstEmployeeId * 1
                  ].includes(this.userId) ||
                    this.roles.includes('manager') ||
                    this.roles.includes('duty'))
                ) {
                  /*
                   * 空运出口（委托订舱）：已放舱才可取消订单，并且已完成，已取消，已终止，已关闭的不用显示取消,已取消的不显示
                   * 空运出口（客户自订）：订单审核通过的就可以取消，已取消的不显示
                   */
                  if (
                    (['st05', 'st13', 'st20'].includes(row.serviceType) &&
                      row.bkgStatus === 'BOOK_RELEASE' &&
                      !['complete', 'break', 'cancel', 'close'].includes(
                        row.orderStatus
                      ) &&
                      row.isCancelApply != '1') ||
                    (['st06', 'st14', 'st21', 'st22'].includes(
                      row.serviceType
                    ) &&
                      row.orderStatus === 'pass' &&
                      row.isCancelApply != '1')
                  ) {
                    return true
                  }
                  return false
                }
                return false
              },
              action: 'Cancel'
            },
            {
              label: '撤回取消',
              type: 'text',
              className: 'red',
              show: (item, row) => {
                // 只有业务bd才有取消操作的权限
                if (
                  this.isBd &&
                  ([
                    row.bdEmployeeId * 1,
                    row.obdEmployeeId * 1,
                    row.asstEmployeeId * 1
                  ].includes(this.userId) ||
                    this.roles.includes('manager') ||
                    this.roles.includes('duty'))
                ) {
                  if (
                    row.isCancelApply === '1' &&
                    row.orderStatus !== 'break' &&
                    row.orderStatus !== 'cancel'
                  ) {
                    return true
                  }
                  return false
                }
                return false
              },
              action: 'CancelCancel'
            },
            // {
            //   label: '关闭',
            //   type: 'text',
            //   show: (item, row) => {
            //     // bd && 审核拒绝
            //     if (this.isBd) {
            //       if (row.orderStatus === 'refuse') {
            //         return true
            //       }
            //       return false
            //     }
            //     return false
            //   },
            //   action: 'Close'
            // },
            {
              label: '删除',
              type: 'text',
              className: 'red',
              show: (item, row) => {
                // bd && 订单为草稿状态
                if (
                  this.isBd &&
                  ([
                    row.bdEmployeeId * 1,
                    row.obdEmployeeId * 1,
                    row.asstEmployeeId * 1
                  ].includes(this.userId) ||
                    this.roles.includes('manager') ||
                    this.roles.includes('duty'))
                ) {
                  if (row.orderStatus === 'draft') {
                    return true
                  }
                  return false
                }
                return false
              },
              action: 'Delete'
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
      },
      // 显示自定义表头的弹窗状态
      customColumnsPopShow: false,
      // 新建订单弹窗
      createOrderPopShow: false,
      // 取消订单弹窗
      cancelOrderPopShow: false,
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
    // let timestamp = new Date().getTime()
    // if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 200) {
    //   this.getList()
    // }

    window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
    this.islLoop =
      window.localStorage.getItem('airorder-list-isLoopRequire') === 'true'
        ? true
        : false
    if (this.islLoop) {
      this.intervalTimer = setInterval(() => {
        this.getList(true)
      }, 10000)
    } else {
      clearInterval(this.intervalTimer)
      this.intervalTimer = null
    }
  },
  deactivated() {
    clearInterval(this.intervalTimer)
    this.intervalTimer = null
    window.removeEventListener('keydown', this.handleKeyDown)
  },
  created() {
    this.cTimestamp = new Date().getTime()
    this.getDeptList()

    this.setCurrRole()
    this.init()
    this.getBusinessType()
    this.airServiceList()
    this.islLoop =
      window.localStorage.getItem('airorder-list-isLoopRequire') === 'true'
        ? true
        : false
  },
  mounted() {},
  watch: {
    currRole: {
      handler: function (val) {
        this.tableQuery.ascColumns = []
        if (
          val === 'pricing' &&
          (this.tableQuery.orderStatus === 'all' ||
            this.tableQuery.orderStatus === '')
        ) {
          this.tableQuery.descColumns = ['orderStatus', 'createdTime']
        } else {
          this.tableQuery.descColumns = ['createdTime']
        }

        if (val === 'bd') {
          delete this.filterGroups.bkgAgentSupplierId
          this.tableConfig.columns = this.tableConfig.columns.filter(
            (el) => el.key !== 'bkgAgentSupplierName'
          )
          console.log(this.tableConfig.columns)
        } else {
          this.tableConfig.columns =
            store.state.airTransport.orderList.columnsBase(
              this.handleOrderNoInfo
            )
          this.$set(this.filterGroups, 'bkgAgentSupplierId', {
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
          })
        }
      },
      immediate: true
    },
    isBd: {
      handler: function (val) {
        console.log(val)
        if (val) {
          this.tableConfig.operationBtns.minWidth = '170px'
        } else {
          this.tableConfig.operationBtns.minWidth = '120px'
        }
      },
      immediate: true
    },
    islLoop: {
      handler(newVal) {
        if (newVal) {
          // 启动定时器
          this.intervalTimer = setInterval(() => {
            this.getList(true)
          }, 10000)
        } else {
          // 关闭定时器
          clearInterval(this.intervalTimer)
          this.intervalTimer = null
        }
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    ...mapState({
      currRole: (state) => state.user.currRole,
      roles: (state) => state.user.roles,
      roleCodesOptions: (state) =>
        state.airTransport.orderList.roleCodesOptions,
      allEditRoleArr: (state) => state.airTransport.orderList.allEditRoleArr,
      dictMap: (state) => state.dict.dictMap,
      orderList: (state) => state.airTransport.orderList,
      defaultColumns: (state) => state.airTransport.orderList.defaultColumns,
      specialColumns: (state) => state.airTransport.orderList.specialColumns,
      columnsBase: (state) => state.airTransport.orderList.columnsBase(),
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
    },
    showSearchInputGroup() {
      let index = this.searchInputGroup.findIndex(
        (item) => item.key === 'createdTime'
      )
      if (index !== -1) {
        this.searchInputGroup.push(this.searchInputGroup[index])
        this.searchInputGroup.splice(index, 1)
      }
      return this.searchInputGroup
    }
  },
  components: {
    Search,
    AddFilter,
    BaseTableMuti,
    TableFilter,
    RoleSwitch,
    BaseDialog,
    CustomColumns,
    CreateOrder,
    CancelOrder
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
    changeIsLoop(val) {
      this.islLoop = val
      window.localStorage.setItem('airorder-list-isLoopRequire', val)
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
          specialProp: 'deptCode',
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
          }
        })
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
      customerListAllStatusNew(data).then((res) => {
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
    // 登录用户角色currRole不是bd,op,doc,ac的，在此设置拥有订单权限的默认角色
    setCurrRole() {
      // 登录用户过滤掉非订单权限的角色
      let userEditRoles = this.roles.filter((item) =>
        this.allEditRoleArr.includes(item)
      )
      if (userEditRoles.indexOf('pricing') > 0) {
        let key = userEditRoles[userEditRoles.indexOf('pricing')]
        for (let i = 0; i < userEditRoles.length; i++) {
          if (userEditRoles[i] === key) {
            userEditRoles.splice(i, 1)
            break
          }
        }
        userEditRoles.unshift(key)
      }
      let currRole = ''
      currRole = userEditRoles.includes('pricing')
        ? 'pricing'
        : userEditRoles.includes('op')
        ? 'op'
        : userEditRoles.includes('bd') ||
          userEditRoles.includes('obd') ||
          userEditRoles.includes('asst')
        ? 'bd'
        : userEditRoles[0] || ''
      console.log(currRole)
      this.$store.dispatch('user/changeRole', currRole)
    },
    async initQuery() {
      this.tableQuery.descColumns = ['createdTime']
      this.tableQuery.currPage = 1
      this.tableQuery.query = []
      this.init()
      this.getBusinessType()
      this.airServiceList()
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
      // // console.log('🚀 ~ this.tableQuery.orderStatus', this.tableQuery.query)
      // this.tableQuery.query = this.tableQuery.query.filter(item => item.column !== 'orderStatus')
      let statusQuery = []
      if (this.tableQuery.orderStatus === 'all') {
        statusQuery = []
        // statusQuery = [{ column: 'orderStatus', type: 'in', value: 'submit,draft,pass,refuse,complete' }]
        // 业务
        if (this.isBd) {
          statusQuery = [
            {
              column: 'orderStatus',
              type: 'in',
              value:
                'draft,pre_submit,submit,pass,refuse,break,complete,cancel,close'
            }
          ]
        }
        if (this.isOp || this.isCs || this.isAc || this.isEpricing) {
          statusQuery = [
            {
              column: 'orderStatus',
              type: 'in',
              value: 'pass,complete,break,cancel,close'
            }
          ]
        }
        if (this.isPricing) {
          // 商务
          statusQuery = [
            {
              column: 'orderStatus',
              type: 'in',
              value: 'submit,pass,complete'
            }
          ]
        }
      } else if (this.tableQuery.orderStatus === 'mine') {
        statusQuery = [
          { column: 'employeeIdList', type: 'like', value: this.userId }
        ]
        // 不含有bd,obd,asst的用户在我的业务tab不显示草稿订单
        // this.roles.find((item) => !['bd', 'obd', 'asst'].includes(item))

        if (
          !(
            this.roles.includes('bd') ||
            this.roles.includes('obd') ||
            this.roles.includes('asst')
          )
        ) {
          statusQuery = [
            { column: 'employeeIdList', type: 'like', value: this.userId },
            {
              column: 'orderStatus',
              type: 'in',
              value: 'submit,pass,complete,cancel,break,close'
            }
          ]
        }
      } else if (this.tableQuery.orderStatus === 'pass') {
        statusQuery = [{ column: 'orderStatus', type: 'eq', value: 'pass' }]
        // if (this.isOp || this.isCs || this.isAc) {
        //   statusQuery = [
        //     { column: 'orderStatus', type: 'eq', value: 'pass' },
        //     { column: 'isOpHandle', type: 'ne', value: 'y' }
        //   ]
        // }
      }
      // else if (this.tableQuery.orderStatus === 'operating') {
      //   statusQuery = [
      //     { column: 'orderStatus', type: 'eq', value: 'pass' },
      //     { column: 'isOpHandle', type: 'eq', value: 'y' }
      //   ]
      // }
      else if (this.tableQuery.orderStatus === 'pricingRefuse') {
        // 商务角色看到这个tab
        statusQuery = [
          { column: 'orderStatus', type: 'in', value: 'submit,pass' },
          { column: 'bkgStatus', type: 'eq', value: 'REFUSE' }
        ]
      } else if (this.tableQuery.orderStatus === 'pass,complete') {
        statusQuery = [
          { column: 'orderStatus', type: 'in', value: 'pass,complete' }
        ]
      } else if (this.tableQuery.orderStatus === 'submit') {
        statusQuery = [
          { column: 'orderStatus', type: 'in', value: 'submit,pre_submit' }
        ]
      } else if (this.tableQuery.orderStatus) {
        statusQuery = [
          {
            column: 'orderStatus',
            type: 'eq',
            value: this.tableQuery.orderStatus
          }
        ]
      }
      // else {
      //   statusQuery = [
      //     {
      //       column: 'orderStatus',
      //       type: 'eq',
      //       value: this.tableQuery.orderStatus
      //     }
      //   ]
      // }

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

      // if (this.currRole === 'bd') {
      //   if (
      //     !(
      //       (this.roles.includes('bd') ||
      //         this.roles.includes('obd') ||
      //         this.roles.includes('asst')) &&
      //       this.roles.includes('manager')
      //     )
      //   ) {
      //     params.query.push({
      //       column: 'bdEmployeeId',
      //       type: 'eq',
      //       value: this.userId
      //     })
      //   }
      // }

      params.query.map((item) => {
        if (
          ['orderNo', 'blNo', 'hawb', 'poNo', 'exportOrderNo'].includes(
            item.column
          )
        ) {
          let resultNo = item.value
            .split(/[,|，|\s]/)
            .filter(Boolean)
            .join('#')

          item.value = resultNo
          item.type = 'like'
          // if (item.value.split(/[,|，|\s]/).filter(Boolean).length == 1) {
          //   item.value = resultNo
          //   item.type = 'like'
          // } else {
          //   item.value = resultNo
          //   item.type = 'in'
          // }
        }
      })
      let { data } = await columnWidthConfigInfo({
        scenesCode: this.$route.name
      })
      let { columnWidthList } = data
      getParamMethod(this.$route.name, params).then((queryObj) => {
        this.oldParams = queryObj
        orderList(queryObj)
          .then((response) => {
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
            if (this.currRole === 'bd') {
              this.tableConfig.configColumns =
                this.tableConfig.configColumns.filter(
                  (el) => el !== 'bkgAgentSupplierName'
                )
            }
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
      })
    },
    // 查询组件回调
    searchCallBack(action, param, isFirstLoad) {
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
                  if (this.filterGroups[item.key].cascaderProps.multiple) {
                    let arr = []
                    if (item.value && item.value.length) {
                      for (let i = 0; i < item.value.length; i++) {
                        if (item.value[i] && item.value[i].length) {
                          arr.push(item.value[i][item.value[i].length - 1])
                        }
                      }
                    }
                    Object.assign(tempItem, {
                      column: item.key,
                      type: this.filterGroups[item.key].searchType || 'in',
                      value: arr.length ? arr.toString() : ''
                    })
                  } else {
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
                } else if (
                  this.filterGroups[item.key].category === 'date' &&
                  this.filterGroups[item.key].hasEmptyValue &&
                  item.value === '-'
                ) {
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
              query.push(tempItem)
            }
          })
          // 按orderStatus查询，特殊处理表格tab除了我的业务其他tab值为空，不按orderStatus查的默认值为all,显示全部tab
          if (
            this.searchInputGroup.some(
              (ele) =>
                ele.key === 'orderStatus' &&
                ele.value &&
                ele.value.length &&
                !['mine'].includes(this.tableQuery.orderStatus)
            )
          ) {
            this.tableQuery.orderStatus = ''
            // if (this.tableQuery.orderStatus !== 'mine')
            //   this.tableQuery.orderStatus = ''
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
        if (this.searchInputGroup.some((item) => item.key === 'createdTime')) {
          this.searchInputGroup.map((item) => {
            if (item.key === 'createdTime') {
              if (!item.value) item.value = defaulTime
            }
          })
        } else {
          this.searchInputGroup.push({
            key: 'createdTime',
            value: defaulTime,
            placeholder: '订单创建时间',
            category: 'all',
            queryValue: ''
          })
        }
        // 设置默认订单状态搜索的值
        // this.setSearchOrderStatusValue(isFirstLoad)
      }
      // 刷新
      if (action === 'Refresh') {
        this.loading = true
        orderList(this.oldParams)
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
      // if (action === 'Reset') {
      //   // 存在自定义的模板
      //   if (param.composeKey) {
      //     this.setSearchCondition(param.composeKey)
      //   } else {
      //     // 后端有配置默认模板
      //     if (this.resDefaConfList.length) {
      //       let composeKey = this.resDefaConfList[0].composeKey
      //       this.setSearchCondition(composeKey, this.resDefaConfList)
      //     } else {
      //       // 后端无配置默认模板
      //       this.init()
      //     }
      //   }
      //   Object.assign(this.tableQuery, defaultTableQuery, defaultPage)
      //   this.getList()
      //   Object.assign(this.tableConfig, { tips: { text: '', show: false } })
      // }

      // // 保存搜索模板
      // if (action === 'ConditionSave') {
      //   this.searchConditionSave(param)
      // }
      // // 点击选择模板切换模板并保存
      // if (action === 'ConditionImmediateSave') {
      //   this.searchConditionSave(param, 'immediateSave')
      // }

      // // 删除搜索模板
      // if (action === 'ConditionDelete') {
      //   this.searchConditionDelete(param)
      // }
    },
    // 反显查询条件的订单状态
    getOrderStatusArr(arr) {
      return this.dictMap.orderStatus
        .filter((item) => arr.includes(item.value))
        .map((item) => ({ label: item.label, value: item.value }))
    },
    // 搜索条件的订单状态的默认下拉选中值
    setSearchOrderStatusValue(isFirstLoad) {
      if (this.searchInputGroup.some((item) => item.key === 'orderStatus')) {
        this.searchInputGroup.map((item) => {
          if (
            item.key === 'orderStatus' &&
            !['mine'].includes(this.tableQuery.orderStatus)
          ) {
            item.value = []
          }
        })
      }
      // else {
      // 	this.searchInputGroup.push({
      // 		key: 'orderStatus',
      // 		value: [],
      // 		placeholder: '订单状态',
      // 		category: 'all',
      // 		queryValue: '',
      // 		hideDel: true
      // 	})
      // }
      // if (isFirstLoad) {
      //   this.searchInputGroup.map(item => {
      // 	if (item.key === 'orderStatus') {
      // 		if (this.tableQuery.orderStatus === 'all') {
      // 			if(this.isBd) {
      // 				item.value = ['draft','pre_submit','submit','pass','refuse','break','complete','cancel','close']
      // 			} else if (this.isOp || this.isCs || this.isAc || this.isEpricing) {
      // 				item.value = ['pass', 'complete', 'break', 'cancel', 'close']
      // 			} else if (this.isPricing) {
      // 				item.value = ['submit', 'pass', 'complete']
      // 			}
      //     }
      //     // else if (this.tableQuery.orderStatus === 'mine') {
      // 		// 	if(!(
      //     //     this.roles.includes('bd') ||
      //     //     this.roles.includes('obd') ||
      //     //     this.roles.includes('asst')
      //     //   )) {
      // 		// 		item.value = ['submit','pass','complete','cancel','break','close']
      // 		// 	} else {
      //     //     item.value = ['draft','pre_submit','submit','pass','refuse','break','complete','cancel','close']
      //     //   }
      // 		// } else if (this.tableQuery.orderStatus === 'submit') {
      // 		// 	item.value = ['submit','pre_submit']
      // 		// } else if (this.tableQuery.orderStatus === 'pass,complete') {
      // 		// 	item.value = ['pass','complete']
      // 		// } else if (this.tableQuery.orderStatus === 'pricingRefuse') {
      // 		// 	item.value = ['pass','submit']
      // 		// } else if (this.tableQuery.orderStatus) {
      // 		// 	item.value = [this.tableQuery.orderStatus]
      // 		// }
      // 		this.filterGroups.orderStatus.saveList = this.getOrderStatusArr(item.value)
      // 	}
      // })
      // }
    },
    handleSearchValueReset() {
      this.searchInputGroup.map((item) => {
        if (item.key !== 'createdTime') {
          item.value = ''
          return { ...item }
        }
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

    // 新建
    handleAdd() {
      this.createOrderPopShow = true
    },

    // 取消订单
    handleCancel(row) {
      this.orderNo = row.orderNo
      this.serviceType = row.serviceType
      this.cancelOrderPopShow = true
    },
    // 撤回取消订单
    handleCancelCancel(row) {
      this.$confirm(`是否撤回取消订单?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          orderCancelCancel({ orderNo: row.orderNo }).then((res) => {
            this.$message({
              type: 'success',
              message: '撤回成功',
              duration: 1000,
              onClose: () => {
                this.getList()
              }
            })
          })
        })
        .catch(() => {})
    },
    // 关闭订单
    handleClose(row) {
      this.$confirm(`是否关闭此订单?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          orderClose({ orderNo: row.orderNo }).then((res) => {
            this.$message({
              type: 'success',
              message: '关闭成功',
              duration: 1000,
              onClose: () => {
                this.getList()
              }
            })
          })
        })
        .catch(() => {})
    },

    // 删除订单
    handleDelete(row) {
      this.$confirm(`是否删除此订单?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          orderDelete({ orderNo: row.orderNo }).then((res) => {
            this.$message({
              type: 'success',
              message: '删除成功',
              duration: 1000,
              onClose: () => {
                this.getList()
              }
            })
          })
        })
        .catch(() => {})
    },

    // 导出
    handleExport() {
      let data = this.getListQuery()
      orderListExport({
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

    // 按订单状态筛选
    handleSearchByOrderStatus() {
      // 除我的业务tab以外。其他按tab查询，如果搜索条件已选了订单状态的可以直接忽略，直接按tab的状态查
      if (!['mine'].includes(this.tableQuery.orderStatus)) {
        this.tableQuery.query = this.tableQuery.query.filter(
          (item) => item.column !== 'orderStatus'
        )
      }
      this.tableQuery.currPage = 1
      this.setSearchOrderStatusValue()
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
    async handleInfo(row) {
      let action = ''
      // 业务除草稿和拒绝状态都不可编辑
      if (this.isBd && !['draft', 'refuse'].includes(row.orderStatus)) {
        action = 'view'
      }
      // 操作角色非审核通过都不可编辑
      if (this.isOp && !['pass', 'break'].includes(row.orderStatus)) {
        action = 'view'
      }
      this.isJumpRouteFromPage = true
      // this.$router.push({
      //   name: 'AirTransportOrderDetail',
      //   params: {
      //     orderNo: row.orderNo
      //   },
      //   query: {
      //     orderNo: row.orderNo,
      //     source: 'orderList',
      //     action: action
      //   }
      // })
      let { data } = await orderRelationList({ orderNo: row.orderNo })
      let routeUrl = this.$router.resolve({
        name: 'AirTransportOrderDetail',
        params: {
          orderNo: row.orderNo
        },
        query: {
          orderNo: row.orderNo,
          source: 'orderList',
          action: action,
          showRelate: data && data.length ? true : false
        }
      })
      window.open(routeUrl.href, '_blank')
    },

    // 复制
    handleCopy(row) {
      this.$confirm(
        `是否确认复制工作号: ${row.orderNo} 委托单位：${row.custName} 的数据?`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          return orderCopy({ orderNo: row.orderNo })
        })
        .then((response) => {
          let { orderNo } = response.data
          this.$message({
            message: '复制成功',
            type: 'success',
            duration: 1000,
            onClose: () => {
              this.isJumpRouteFromPage = true
              // this.$router.push({
              //   name: 'AirTransportOrderDetail',
              //   params: {
              //     orderNo: orderNo
              //   },
              //   query: {
              //     orderNo: orderNo,
              //     source: 'orderList',
              //     action: 'copy'
              //   }
              // })
              let routeUrl = this.$router.resolve({
                name: 'AirTransportOrderDetail',
                params: {
                  orderNo: orderNo
                },
                query: {
                  orderNo: orderNo,
                  source: 'orderList',
                  action: 'copy'
                }
              })
              window.open(routeUrl.href, '_blank')
            }
          })
        })
        .catch(() => {})
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
    },

    // 新建订单保存
    handleCreateOrder(value) {
      orderCreate(value).then((res) => {
        let { orderNo } = res.data
        sessionStorage.setItem('createAirOrderStr', JSON.stringify(res.data))
        this.isJumpRouteFromPage = true
        // this.$router.push({
        //   name: 'AirTransportOrderDetail',
        //   params: {
        //     orderNo
        //   },
        //   query: {
        //     orderNo,
        //     source: 'orderList',
        //     action: 'add'
        //   }
        // })
        let routeUrl = this.$router.resolve({
          name: 'AirTransportOrderDetail',
          params: {
            orderNo
          },
          query: {
            orderNo,
            source: 'orderList',
            action: 'add',
            showRelate: value.exportOrderNo ? true : false
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

    // 取消订单关闭回调
    cancelOrderPopClose(action, value) {
      this.cancelOrderPopShow = false
      if (action === 'Confirm') {
        this.getList()
      }
    }
  }
}
</script>
<style lang="scss">
</style>
