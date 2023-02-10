<template>
  <div class="app-container">
    <div class="search-container">
      <Search fixedCreatedTime :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery" :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
        <AddFilter fixedCreatedTime :searchInputGroup="searchInputGroup" :allFilterGroups="allFilterGroups" :filterGroups="filterGroups" :defaultSearchLength="defaultSearchLength" :index="index" :item="item" v-for="(item, index) in showSearchInputGroup" :key="'filter' + index" />
        <div class="btn-plus-search" @click="handleAddFilter"></div>
      </Search>
    </div>
    <div class="table-container">
      <TableFilter ref="tableFilter" :config="tableConfig" :tableQuery.sync="tableQuery" :callback="tableCallBack" />
      <BaseTableMuti v-loading="loading" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
    </div>
    <!-- 自定义表头 -->
    <div v-if="customColumnsPopShow">
      <CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
    </div>
    <!-- 拒绝弹窗 -->
    <div v-if="refusePopShow">
      <RefuseJoint @close="refuseJointPopClose" :refuseParam="refuseProp" />
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
import RefuseJoint from './components/refuse'
import {
  baseBusinessList,
  baseEmployeeListName,
  countrySelectList,
  companyPageList,
  columnWidthConfigSave,
  columnWidthConfigInfo
  // searchConditionInfo
  // searchConditionSave,
  // searchConditionDelete
} from '@/api/base'
import { orderJointList, orderJointListExport, airServiceList } from '@/api/airTransport/order'
import { customerList } from '@/api/crm/supplier.js'
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
  tabVal: '0' // tab切换状态 0为全部
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
    key: 'mainCompDeptCode',
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
  mixins: [routerMixin],
  data() {
    return {
      departmentList: [],
      oldParams: {},
      cTimestamp: 0,
      loading: false,
      state: '',
      showVal: null,
      defaultStyle: {
        width: '100%'
      },
      serviceTypeOptions: {},
      searchConditionList: [], // 自定义搜索模板集合
      defaultSearchLength: 0, // 默认显示搜索框的个数
      tableColumnsWidthList: [],

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
        jointNo: {
          key: 'jointNo',
          label: '协同单号',
          type: 'input',
          searchType: 'like',
          value: ''
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
          data: [
            // { label: '审核通过', value: 'pass' },
            // { label: '终止', value: 'break' },
            // { label: '已完成', value: 'complete' }
          ],
          multiple: true,
          saveList: [],
          'collapse-tags': true,
          queryValue: '',
          nonDictionary: true,
          disabledEdit: true
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
        mainCompDeptCode: {
          key: 'mainCompDeptCode',
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
        prefinCloseStatus: {
          label: '预关账状态',
          key: 'prefinCloseStatus',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: store.state.airTransport.orderList.finCloseStatus,
          nonDictionary: true
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
						onPick: ({maxDate, minDate}) => {
							this.selectDate = minDate.getTime()
							if (maxDate) {
								this.selectDate = ''
							}
						},
						disabledDate: (time) => {
							// 1年365天的时间戳
							let two = 365*24*3600*1000
							// 是否限制的判断条件
							if (this.selectDate) {
								return time > (new Date(this.selectDate + two)) || time < (new Date(this.selectDate - two))
							} else {
								return false
							}
						},
						shortcuts: [
							{
								text: '最近三天',
								onClick(picker) {
										const end = new Date();
										const start = new Date();
										start.setTime(start.getTime() - 3600 * 1000 * 24 * 2);
										picker.$emit('pick', [start, end]);
									}
							},
							{
								text: '最近一周',
								onClick(picker) {
										const end = new Date();
										const start = new Date();
										start.setTime(start.getTime() - 3600 * 1000 * 24 * 6);
										picker.$emit('pick', [start, end]);
									}
							},
							{
								text: '最近一个月',
								onClick(picker) {
									const end = new Date();
									const start = new Date();
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 29);
									picker.$emit('pick', [start, end]);
								}
							}, 
							{
								text: '最近两个月',
								onClick(picker) {
									const end = new Date();
									const start = new Date();
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 59);
									picker.$emit('pick', [start, end]);
								}
							},
							{
								text: '最近三个月',
								onClick(picker) {
									const end = new Date();
									const start = new Date();
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 89);
									picker.$emit('pick', [start, end]);
							  }
						  },
							{
								text: '最近半年',
								onClick(picker) {
									const end = new Date();
									const start = new Date();
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 179);
									picker.$emit('pick', [start, end]);
							  }
						  },
							{
								text: '最近一年',
								onClick(picker) {
									const end = new Date();
									const start = new Date();
									start.setTime(start.getTime() - 3600 * 1000 * 24 * 364);
									picker.$emit('pick', [start, end]);
							  }
						  },
              {
								text: '今年',
								onClick(picker) {
									const end = new Date();
                  const start = new Date(end.getFullYear() + '-01-01')
									picker.$emit('pick', [start, end]);
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
          data: store.state.dict.dictMap.feeSettleStatus,
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
        // isJoint: {
        //   key: 'isJoint',
        //   label: '协同状态',
        //   type: 'select',
        //   searchType: 'eq',
        //   value: '',
        //   data: [
        //     { label: '已协同', value: 'y' },
        //     { label: '未协同', value: 'n' }
        //   ],
        //   nonDictionary: true
        // },
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
        }
      },
      // 默认展示的搜索条件，搜索条件分类
      searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),

      tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
      searchConfig: [],

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
        columns: store.state.airTransport.jointList.columnsBase(
          this.handleOrderNoInfo
        ),
        allColumns: store.state.airTransport.jointList.columnsBase(
          this.handleOrderNoInfo
        ),

        // 操作按钮组
        operationBtns: {
          minWidth: '100px',
          fixed: 'right',
          show: true,
          callback: (action, $index, row, item) => {
            if (action === 'Info') {
              this.handleInfo(row)
            }

            if (action === 'Refuse') {
              this.handleRefuse(row)
            }

            if (action === 'Audit') {
              this.handleAudit(row)
            }
          },
          data: [
            {
              label: '详情',
              type: 'text',
              show: true,
              action: 'Info'
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

      // 拒绝弹窗
      refusePopShow: false,
      refuseProp: {
        id: '',
        orderNo: '',
        jointNo: ''
      },
      isClickInfo: false,
      resDefaConfList: [] // 后端配置的默认搜索模板
    }
  },
  beforeRouteLeave(to, from, next) {
    if (to.name === 'AirTransportJointOrderDetail') {
      let views = this.$store.state.tagsView.visitedViews.filter(
        (item) => item.query.orderNo === to.query.orderNo
      )
      this.$store.commit('tagsView/DEL_SAMEORDER_VISITED_VIEW', views)
    }
    next()
  },
  activated() {
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 500) {
      this.getList()
    }
    window.addEventListener('keydown', this.handleKeyDown) //开启监听键盘按下事件
  },
  deactivated() {
    window.removeEventListener('keydown', this.handleKeyDown)
  },
  created() {
    this.airServiceList()
    this.cTimestamp = new Date().getTime()
    this.getDeptList()
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
    this.getBusinessType()
    this.init()
    // this.getSearchConditionInfo()
    // this.getList();
  },
  mounted() {},
  computed: {
    ...mapState({
      currRole: (state) => state.user.currRole,
      dictMap: (state) => state.dict.dictMap,
      jointList: (state) => state.airTransport.jointList,
      defaultColumns: (state) => state.airTransport.jointList.defaultColumns,
      specialColumns: (state) => state.airTransport.jointList.specialColumns,
      columnsBase: (state) => state.airTransport.jointList.columnsBase()
    }),
    isAc() {
      return this.currRole === 'ac'
    },
    isDoc() {
      return this.currRole === 'doc'
    },
    isOp() {
      return this.currRole === 'op'
    },
    isBd() {
      return this.currRole === 'bd' || this.currRole === 'obd'
    },
    showSearchInputGroup() {
			let index = this.searchInputGroup.findIndex(item => item.key === 'createdTime')
      if (index !== -1) {
         this.searchInputGroup.push(this.searchInputGroup[index])
			   this.searchInputGroup.splice(index, 1)
      }
			return this.searchInputGroup
		}
  },
  watch: {},
  components: {
    Search,
    AddFilter,
    BaseTableMuti,
    TableFilter,
    BaseDialog,
    CustomColumns,
    RefuseJoint
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
        query: [
          { column: 'companyName', type: 'like', value: val },
          { column: 'state', type: 'eq', value: 'valid' }
        ],
        pageSize: 1000
      }
      companyPageList(data).then((res) => {
        let filterArr = res.data.list.filter(
          (ele) => !item.saveList.find((o) => o.value === ele.companyCode)
        )
        let itemList = filterArr.map((ele) => {
          return {
            ...ele,
            label: ele.name,
            value: ele.companyCode || ''
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
    // 获取服务类型
    getBusinessType() {
      let result = []
      let airBusinessTypeResult = []
      baseBusinessList().then((res) => {
        this.businessTypeOptions = res.data
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
      // 默认登录角色设为op
      Object.assign(this.allFilterGroups, {
        all: this.filterGroups
      })

      // bd
      if (this.isBd) {
        this.searchInputGroup = JSON.parse(
          JSON.stringify(defaultSearchInputGroup)
        )
      }
      // op
      if (this.isOp) {
        this.searchInputGroup = JSON.parse(
          JSON.stringify(defaultSearchInputGroup)
        )
      }
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

    // 获取订舱代理
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
      // console.log('🚀 ~ this.tableQuery.orderStatus', this.tableQuery.query)
			// this.tableQuery.query = this.tableQuery.query.filter(item => item.column !== 'orderStatus')
      let statusQuery = []
      // 全部
      if (this.tableQuery.tabVal === '0') {
        statusQuery = [
          { column: 'orderStatus', type: 'in', value: 'pass,cancel,break,complete' }
        ]
      } else if (this.tableQuery.tabVal === '1') {
        statusQuery = [
          { column: 'isServiceComplete', type: 'eq', value: 'n' },
          { column: 'orderStatus', type: 'in', value: 'pass,cancel,break' }
        ]
      } else if (this.tableQuery.tabVal === '2') {
        statusQuery = [
          { column: 'cancelApplyStatus', type: 'eq', value: '1' },
          { column: 'orderStatus', type: 'in', value: 'pass,cancel,break' }
        ]
      } else if (this.tableQuery.tabVal === '3') {
        statusQuery = [{ column: 'isServiceComplete', type: 'eq', value: 'y' }]
      }

      // 合并状态参数
      let data = {}
      Object.assign(data, this.tableQuery, {
        query: this.tableQuery.query.concat(statusQuery)
      })
      delete data.tabVal
      return data
    },

    // 列表数据
    async getList() {
      this.loading = true
      let data = this.getListQuery()
      data.query.map((item) => {
        if (
          ['orderNo', 'blNo', 'hawb', 'poNo'].includes(
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
      let widthData = await columnWidthConfigInfo({
        scenesCode: this.$route.name
      })
      let { columnWidthList } = widthData.data
      getParamMethod(this.$route.name, data).then(queryObj => {
          this.oldParams = queryObj
          orderJointList(queryObj)
          .then((response) => {
            let { list, totalCount, allColumns, configColumns, pageSize } =
              response.data
            // 请求无数据显示的文案
            if (!list || !list.length) {
              this.$set(this.tableConfig, 'defaultEmpty', false)
            }
            this.tableQuery.pageSize = pageSize
            list.forEach((item) => {
              let findItem = this.businessTypeOptions.find(
                (ele) => ele.businessType === item.businessType
              )
              item.businessTypeCn = findItem ? findItem.name : ''
              item.serviceTypeName = item.serviceType
                ? this.serviceTypeOptions[item.serviceType]
                : ''
            })
            this.tableConfig.list = list
            this.tableConfig.pagination.total = totalCount

            this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
            this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
            this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
            this.tableConfig.pagination.isLastPage = response.data.isLastPage
            this.tableQuery.currPage = response.data.currPage


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
      })
    },
    getTableColumnsWidth() {
      let result = this.tableConfig.columns.map((item) => {
        return { column: item.prop, width: item.width }
      })
      console.log(20220511, result)
      return result
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
                // 中转港
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
                } else if (
                  // this.filterGroups[item.key].type === 'remoteSelect' &&
                  this.filterGroups[item.key].multiple
                ) {
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
                      query.push(
                        {
                          column: item.key,
                          type: 'le',
                          value: item.value[1] + ' 23:59:59'
                        }
                      )
                  }
                } else if (
                  ['prefinCloseStatus', 'finCloseStatus'].includes(item.key)
                ) {
                  // 特殊处理预关账状态，关账状态
                  if (item.value) {
                    // 选择未关账传值不等于yes
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
					if (this.searchInputGroup.some(ele => ele.key === 'orderStatus' && ele.value)) {
						this.tableQuery.tabVal = ''
					} else if (!this.tableQuery.tabVal) {
						this.tableQuery.tabVal = '0'
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
        if (this.searchInputGroup.some(item => item.key === 'createdTime')) {
          this.searchInputGroup.map(item => {
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
        // this.setSearchOrderStatusValue(isFirstLoad)
      }
      // 刷新
      if (action === 'Refresh') {
        this.loading = true
        orderJointList(this.oldParams)
          .then((response) => {
            let { list, totalCount, allColumns, configColumns, pageSize } =
              response.data
            this.tableQuery.pageSize = pageSize
            list.forEach((item) => {
              let findItem = this.businessTypeOptions.find(
                (ele) => ele.businessType === item.businessType
              )
              item.businessTypeCn = findItem ? findItem.name : ''
              item.serviceTypeName = item.serviceType
                ? this.serviceTypeOptions[item.serviceType]
                : ''
            })
            this.tableConfig.list = list
            this.tableConfig.pagination.total = totalCount

            this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
            this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
            this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
            this.tableConfig.pagination.isLastPage = response.data.isLastPage
            this.tableQuery.currPage = response.data.currPage
            
            this.tableConfig.configColumns = configColumns.length
              ? configColumns
              : this.defaultColumns

            this.handleFilterColumns(this.tableConfig.configColumns)
          })
          .finally(() => {
            this.loading = false
          })
      }
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
    // 撤回审核
    handleAudit(row) {
      // this.cancelOrderPopShow = true;
    },
    // 反显查询条件的订单状态
		getOrderStatusArr(arr) {
			return this.dictMap.orderStatus.filter(item => arr.includes(item.value)).map(item => ({label: item.label, value: item.value}))
		},
		// 搜索条件的订单状态的默认下拉选中值
		setSearchOrderStatusValue(isFirstLoad) {
			if (this.searchInputGroup.some(item => item.key === 'orderStatus')) {
				this.searchInputGroup.map(item => {
					if (item.key === 'orderStatus') {
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
      //     if (item.key === 'orderStatus') {
      //       if (this.tableQuery.tabVal === '0') {
      //         item.value = ['pass','break','complete','cancel']
      //       } 
      //       // else if (this.tableQuery.tabVal === '1' || this.tableQuery.tabVal === '2' || this.tableQuery.tabVal === '3') {
      //       //   item.value = ['pass','break','cancel']
      //       // }
      //       this.filterGroups.orderStatus.saveList = this.getOrderStatusArr(item.value)
      //     }
      //   })
      // }
		},
    // 导出
    handleExport() {
      let data = this.getListQuery()
      orderJointListExport({
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
    handleSearchByJointStatus() {
      // 按tab查询，如果搜索条件已选了订单状态的可以直接忽略，直接按tab的状态查
      this.tableQuery.query = this.tableQuery.query.filter(item => item.column !== 'orderStatus')
      this.tableQuery.currPage = 1
      this.setSearchOrderStatusValue()
      this.getList()
    },

    handleSizeChange(val) {
      this.getList()
    },

    handleCurrentChange(val) {
      // 刷新页面的先调自定义搜索查询接口，拿到自定义的搜索条件再调getList接口
      // if (val) {
      // 	this.tableQuery.currPage = val
      // 	// this.getSearchConditionInfo()
      // }
      if (val === 1) return (this.tableConfig.list = [])
      this.getList()
    },

    // 表格操作回调
    tableCallBack(action, arr) {
      let fn = this['handle' + action]
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
    // 点击订单号查看详情
    handleOrderNoInfo(row) {
      this.handleInfo(row)
    },
    // 去详情页
    handleInfo(row) {
      let routeUrl = this.$router.resolve({
        name: 'AirTransportOrderDetail',
        params: {
          orderNo: row.orderNo
        },
        query: {
          orderNo: row.orderNo,
          jointNo: row.jointNo,
          source: 'jointList'
        }
      })
      window.open(routeUrl.href, '_blank')
    },

    // 拒绝
    handleRefuse(row) {
      Object.assign(this.refuseProp, {
        id: row.id,
        orderNo: row.orderNo,
        jointNo: row.jointNo
      })
      this.refusePopShow = true
    },

    // 协同拒绝关闭回调
    refuseJointPopClose(action, value) {
      this.refusePopShow = false
      this.getList()
    },

    // 撤回
    handleCancel(row) {},

    // 排序
    handleSort(query) {
      this.getList()
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
  }
}
</script>
<style lang="scss"></style>
