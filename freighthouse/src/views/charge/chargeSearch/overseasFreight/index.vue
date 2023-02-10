<template>
  <div class="app-container">
    <div class="search-container">
      <Search :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery" :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
        <AddFilter :searchInputGroup="searchInputGroup" :allFilterGroups="allFilterGroups" :filterGroups="filterGroups" :defaultSearchLength="defaultSearchLength" :callback="searchCallBack" :index="index" :item="item" v-for="(item, index) in showSearchInputGroup" :key="'filter' + index" />
        <div class="btn-plus-search" @click="handleAddFilter" ref="btnPlus"></div>
      </Search>
    </div>
    <div class="table-container">
      <TableFilter :config="tableConfig" :overSeasSumData="overSeasSumData" :tableQuery.sync="tableQuery" :callback="tableCallBack" />
      <BaseTableMuti v-loading="loading" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
    </div>
    <!-- 复制 异步数据特殊方法 -->
    <!-- <span ref='aCopy' class="copy" :data-clipboard-text="rowString" data-clipboard-action="copy" @click="copyLink('.copy')"></span> -->
    <div v-if="showAddInquiryPop">
      <AddInquiry @close="addInquiryClose" :canSubmit="canSubmit" :lastInquiryData="lastInquiryData"></AddInquiry>
    </div>
    <div v-if="addParticipantsDatePopShow">
      <AddParticipantsDatePop @close="addParticipantsDatePopClose" :participantType="participantType" :quotationNumber="quotationNumber"></AddParticipantsDatePop>
    </div>
    <!-- 自定义表头 -->
    <div v-if="customColumnsPopShow">
      <CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
    </div>
    <!-- 终止-->
    <div v-if="breakPopShow">
      <BreakPop @close="breakPopClose" />
    </div>
  </div>
</template>
<script>
// import clipboard from 'clipboard'
import { mapGetters, mapState } from 'vuex'
import Search from '@/components/Base/SearchEn/index'
import BaseTableMuti from '@/components/Base/TableEn/vxeTableMuti'
import TableFilter from './components/tableFilter'
import AddInquiry from './components/addInquiry'
import BreakPop from './components/breakPop'
import {
  overSeasList,
  saveEnquiry,
  saveEnquiryParticipant,
  enquiryDelete,
  detailRecord,
  enquiryBreak,
  participantAddBatch,
  overSeasListSum,
  overSeasListExport
} from '@/api/charge'
import AddParticipantsDatePop from './components/addParticipantsDatePop.vue'
import { baseEmployeeListName, cargoHscodeList } from '@/api/base'
import { unique } from '@/utils/index'
import { getDictLabel } from '@/utils/tools'
import { columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
import AddFilter from '@/components/Base/SearchEn/addFilter'
import { potentialAndClient } from '@/api/crm/supplier'
// import clip from '@/utils/clipboard'
import CustomColumns from '@/components/customColumns/index-en.vue'
import CustNameShow from '@/views/order/order/components/custNameShow.vue'
import { countrySelectList } from '@/api/base'
import OrderNoItems from './components/orderNoItems'
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

const defaultPage = {
  pageSize: -1,
  currPage: 1
}
const defaultTableQuery = {
  columns: [],
  ascColumns: [],
  descColumns: ['createdTime'],
  query: [],
  isUnread: 'N',
  state: '',
  status: 'ALL'
}
const defaultSearchInputGroup = [
  {
    key: 'enquiryNo',
    value: '',
    placeholder: 'Inquiry No.',
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
    key: 'inquirerId',
    value: '',
    placeholder: 'Inquirer',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'quotationId',
    value: '',
    placeholder: 'Quoter',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'orderNo',
    value: '',
    placeholder: 'Order No.',
    category: 'all',
    queryValue: ''
  }
  // {
  // 	key: 'status',
  // 	value: '',
  // 	placeholder: 'Quotation Status',
  // 	category: 'all',
  // 	queryValue: ''
  // }
]
export default {
  data() {
    return {
      overSeasSumData: {},
      lastInquiryData: {}, // 当前用户最有一次询价填写的信息
      breakPopShow: false,
      specialColumns: {},
      columnsBase: [
        {
          prop: 'enquiryNo',
          label: 'Inquiry No.',
          sortable: false,
          type: 'text',
          width: '150',
          formatter: (row, column) => {
            let str = ''
            if (row.unReadCount) {
              let unReadCount = row.unReadCount > 99 ? '99+' : row.unReadCount
              str = `<sapn class="num">${unReadCount}</sapn>`
            }
            return `<div class="overseasFreight-enquiryNo-box"><sapn class="unReadCount">${str}</sapn>${row.enquiryNo}</div>`
          }
        },
        {
          prop: 'quotationNumber',
          label: 'Quotation No.',
          sortable: false,
          type: 'text',
          width: '120'
        },
        {
          prop: 'status',
          label: 'Quotation Status',
          sortable: false,
          type: 'text',
          width: '150',
          formatter: (row, column) => {
            let status = row.status
            let color = ''
            let result = getDictLabel('enquiriesStatus', row.status)
            if (!result) {
              if (row.quotationNumber) {
                result = 'Quoted'
                color = 'green'
              } else {
                result = 'Not quoted'
              }
            }
            if (status === 'QUOTED') {
              color = 'green'
            }
            if (['BREAK'].includes(status)) {
              color = 'red'
            }
            return `<span class="${color}">${result}</span>`
          }
        },
        {
          prop: 'orderNo',
          label: 'Order No.',
          sortable: false,
          type: 'text',
          width: '180',
          popoverComponent: OrderNoItems
        },
        {
          prop: 'isBid',
          label: 'Winning Bid Results',
          sortable: false,
          width: '150',
          type: 'text',
          formatter: (row, column) => {
            let str = ''
            if (row.isBid === 'Y') {
              str = '<span class="green">Awarded</span>'
            } else if (row.isBid === 'N') {
              str = '<span>Unsuccessful bid</span>'
            } else if (row.isBid === 'C') {
              str = '<span class="yellow">To be determined</span>'
            }
            return str
          }
        },
        {
          prop: 'bidNoReasonName',
          label: 'Reasons for not winning the bid',
          sortable: false,
          width: '240',
          type: 'text'
        },
        {
          prop: 'custName',
          label: 'Customer',
          sortable: false,
          popoverComponent: CustNameShow,
          type: 'text',
          width: '180'
        },
        {
          prop: 'latestReplyTime',
          label: 'Latest Reply Time',
          sortable: false,
          type: 'text',
          width: '150'
        },
        {
          prop: 'isTradeEnquiries',
          label: 'Inquiry Type',
          sortable: false,
          type: 'text',
          width: '100',
          formatter: (row, column) => {
            let str = getDictLabel('tradeEnquiriesType', row.isTradeEnquiries)
            return str
          }
        },
        {
          prop: 'tradeTermsCode',
          label: 'Trade Terms',
          sortable: false,
          type: 'text',
          width: '100',
          formatter: (row, column) => {
            let str = getDictLabel('tradeTermsCode', row.tradeTermsCode)
            return str
          }
        },
        {
          prop: 'pol',
          label: 'POL',
          sortable: true,
          type: 'text',
          width: '120'
        },
        {
          prop: 'pod',
          label: 'POD',
          sortable: false,
          type: 'text',
          value: '',
          width: '120'
        },
        {
          prop: 'commodity',
          label: 'Commodity',
          sortable: true,
          width: '100',
          type: 'text'
        },
        {
          prop: 'polCountryName',
          label: 'Country of departure',
          sortable: true,
          width: '150',
          type: 'text'
        },
        {
          prop: 'countryName',
          label: 'Destination country',
          sortable: true,
          width: '100',
          type: 'text'
        },
        {
          prop: 'hsCode',
          label: 'HS CODE',
          sortable: true,
          type: 'text',
          width: '150'
        },
        {
          prop: 'deliveryAddress',
          label: 'Delivery Address',
          sortable: true,
          type: 'text',
          width: '250'
        },
        {
          prop: 'pickAddress',
          label: 'Pick-up Address',
          sortable: true,
          type: 'text',
          width: '250'
        },
        {
          prop: 'businessType',
          label: 'Business Type',
          sortable: true,
          type: 'text',
          width: '180',
          formatter: (row, column) => {
            let str = getBusinessTypeName(row.businessType)
            return str
          }
        },
        {
          prop: 'categoryName',
          label: 'Supplier',
          sortable: true,
          type: 'text',
          width: '150',
          formatter: (row, column) => {
            let str = ''
            if (this.userId == row.quotationId) {
              str = row.categoryName
            }
            return str
          }
        },
        {
          prop: 'inquirerName',
          label: 'Inquirer',
          sortable: false,
          width: '150',
          type: 'text',
          formatter: (row, column) => {
            let str = row.inquirerName
            if (row.inquirerEname) {
              str = `${row.inquirerName}(${row.inquirerEname})`
            }
            return str
          }
        },
        {
          prop: 'quotationName',
          label: 'Quoter',
          sortable: false,
          width: '150',
          type: 'text',
          formatter: (row, column) => {
            let str = row.quotationName
            if (row.inquirerEname) {
              str = `${row.quotationName}(${row.quotationEname})`
            }
            return str
          }
        },
        {
          prop: 'createdTime',
          label: 'Created Time',
          sortable: false,
          width: '180',
          type: 'text'
        },
        {
          prop: 'createdName',
          label: 'Created by',
          sortable: false,
          width: '150',
          type: 'text'
        },
        {
          prop: 'updatedTime',
          label: 'Update Time',
          sortable: false,
          width: '180',
          type: 'text'
        },
        {
          prop: 'updatedName',
          label: 'Updated by',
          sortable: false,
          width: '150',
          type: 'text'
        },
        // 20221011
        {
          prop: 'inquirerDeptName',
          label: 'Inquiry Department',
          sortable: false,
          width: '150',
          type: 'text'
        },
        {
          prop: 'lastQuoteTime',
          label: 'Latest Quotation Response Time',
          sortable: false,
          width: '250',
          type: 'text'
        },
        {
          prop: 'bidTime',
          label: 'Latest winning bid feedback time',
          sortable: false,
          width: '250',
          type: 'text'
        },
        {
          prop: 'inTimeStr',
          label: 'Timely Status',
          sortable: false,
          width: '150',
          type: 'text',
          formatter: (row, column) => {
            let str = ''
            if (row.inTimeStr === '及时') {
              str = 'In time'
            } else if (row.inTimeStr === '超时') {
              str = 'Overtime'
            }
            return str
          }
        },
        {
          prop: 'quoteRemark',
          label: 'Remark of quotation',
          sortable: false,
          width: '150',
          type: 'text',
          formatter: (row, column) => {
            let str = ''
            if (this.userId == row.quotationId) {
              str = row.quoteRemark
            }
            return str
          }
        }
      ],
      customColumnsPopShow: false,
      rowString: '',
      quotationNumber: '', // 当前数据的Quotation No.
      canSubmit: true,
      tableColumnsWidthList: [],
      participantType: '', // 参与人类型
      enquiryId: '',
      addParticipantsDatePopShow: false,
      showAddInquiryPop: false,
      defaultSearchLength: 1, // 默认显示搜索框的个数
      loading: true,
      state: '',
      searchConditionHide: true, // 隐藏自定义搜索
      // 查询条件下拉选项
      tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
      searchConfig: [],
      searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),
      filterGroups: {
        enquiryNo: {
          key: 'enquiryNo',
          label: 'Inquiry No.',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        quotationNumber: {
          key: 'quotationNumber',
          label: 'Quotation No.',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        orderNo: {
          key: 'orderNo',
          label: 'Order No.',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        polCode: {
          key: 'polCode',
          label: 'POL',
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
        podCode: {
          key: 'podCode',
          label: 'POD',
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
        commodity: {
          key: 'commodity',
          label: 'Commodity',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        hsCode: {
          key: 'hsCode',
          label: 'HS CODE',
          type: 'remoteSelect',
          saveList: [],
          searchType: 'like',
          value: '',
          data: [],
          nonDictionary: true,
          queryValue: '',
          visibleChange: (val, item) => {
            this.queryCargoHscode('', item)
          },
          filterMehod: (val, item) => {
            this.queryCargoHscode(val, item)
          },
          change: (val, item) => {
            let findItem = item.data.find((ele) => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
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
        inquirerId: {
          key: 'inquirerId',
          label: 'Inquirer',
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
        quotationId: {
          key: 'quotationId',
          label: 'Quoter',
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
        latestReplyTime: {
          label: 'Latest Reply Time',
          key: 'latestReplyTime',
          type: 'date',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd'
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
        // status: {
        // 	label: 'Quotation Status',
        // 	key: 'status',
        // 	type: 'select',
        // 	searchType: 'eq',
        // 	value: '',
        // 	data: this.$store.state.dict.dictMap.enquiriesStatus,
        // 	nonDictionary: true
        // },
        isTradeEnquiries: {
          label: 'Inquiry Type',
          key: 'isTradeEnquiries',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: [
            { label: 'Live Trading', value: 'y' },
            { label: 'Virtual Trading', value: 'n' }
          ],
          nonDictionary: true
        },
        tradeTermsCode: {
          label: 'Trade Terms',
          key: 'tradeTermsCode',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: [],
          nonDictionary: true
        },
        custId: {
          key: 'custId',
          label: 'Customer',
          type: 'remoteSelect',
          saveList: [],
          searchType: 'in',
          multiple: true,
          'collapse-tags': true,
          value: '',
          data: [],
          nonDictionary: true,
          visibleChange: (val, item) => {
            this.getCustList('', item)
          },
          filterMehod: (val, item) => {
            this.getCustList(val, item)
          },
          change: (val, item) => {
            let findItem = item.data.find((ele) => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        },
        deliveryAddress: {
          key: 'deliveryAddress',
          label: 'Delivery Address',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        pickAddress: {
          key: 'pickAddress',
          label: 'Pick-up Address',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        isBid: {
          label: 'Winning Bid Results',
          key: 'isBid',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: [
            {
              label: 'Awarded',
              value: 'Y'
            },
            {
              label: 'Unsuccessful bid',
              value: 'N'
            },
            {
              label: 'To be determined',
              value: 'C'
            }
          ],
          nonDictionary: true
        },
        inTimeStr: {
          label: 'Timely Status',
          key: 'inTimeStr',
          type: 'select',
          searchType: 'eq',
          value: '',
          data: [
            {
              label: 'In time',
              value: '及时'
            },
            {
              label: 'Overtime',
              value: '超时'
            }
          ],
          nonDictionary: true
        },
        lastQuoteTime: {
          label: 'Latest Quotation Response Time',
          key: 'lastQuoteTime',
          type: 'date',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd'
        },
        bidTime: {
          label: 'Latest winning bid feedback time',
          key: 'bidTime',
          type: 'date',
          searchType: 'eq',
          value: '',
          category: 'daterange',
          format: 'yyyy-MM-dd'
        },
        inquirerDeptName: {
          key: 'inquirerDeptName',
          label: 'Inquiry Department',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        polCountryName: {
          key: 'polCountryName',
          label: 'Country of departure',
          type: 'remoteSelect',
          saveList: [],
          searchType: 'eq',
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
        countryName: {
          key: 'countryName',
          label: 'Destination country',
          type: 'remoteSelect',
          saveList: [],
          searchType: 'eq',
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
      allFilterGroups: {
        all: this.filterGroups
      },
      // table复选框多选的值
      selectedCheckbox: [],

      // 默认表头
      defaultColumns: [
        'enquiryNo',
        'quotationNumber',
        'orderNoList',
        'status',
        'isBid',
        'bidNoReasonName',
        'pod',
        'countryName',
        'pol',
        'polCountryName',
        'commodity',
        'hsCode',
        'deliveryAddress',
        'pickAddress',
        'businessType',
        'categoryName',
        'quotationName',
        'createdTime',
        'inquirerName',
        'createdName',
        'updatedName',
        'updatedTime',
        'custName',
        'latestReplyTime',
        'isTradeEnquiries',
        'tradeTermsCode',
        'inquirerDeptName',
        'lastQuoteTime',
        'bidTime',
        'inTimeStr',
        'quoteRemark'
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
          mutiSelect: false,

          // 多选框状态判断 {false不可选, true可选}
          checkSelectable({ routeId }) {
            return routeId ? true : false
          }
        },
        customColumns: {
          show: true,
          handleCustomColumns: this.handleCustomColumns
        },
        list: [],
        allColumns: [
          {
            prop: 'enquiryNo',
            label: 'Inquiry No.',
            sortable: false,
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              let str = ''
              if (row.unReadCount) {
                let unReadCount = row.unReadCount > 99 ? '99+' : row.unReadCount
                str = `<sapn class="num">${unReadCount}</sapn>`
              }
              return `<div class="overseasFreight-enquiryNo-box"><sapn class="unReadCount">${str}</sapn>${row.enquiryNo}</div>`
            }
          },
          {
            prop: 'quotationNumber',
            label: 'Quotation No.',
            sortable: false,
            type: 'text',
            width: '120'
          },
          {
            prop: 'orderNo',
            label: 'Order No.',
            sortable: false,
            type: 'text',
            width: '180',
            popoverComponent: OrderNoItems
          },
          {
            prop: 'status',
            label: 'Quotation Status',
            sortable: false,
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              let status = row.status
              let color = ''
              let result = getDictLabel('enquiriesStatus', row.status)
              if (!result) {
                if (row.quotationNumber) {
                  result = 'Quoted'
                  color = 'green'
                } else {
                  result = 'Not quoted'
                }
              }
              if (status === 'QUOTED') {
                color = 'green'
              }
              if (['BREAK'].includes(status)) {
                color = 'red'
              }
              return `<span class="${color}">${result}</span>`
            }
          },
          {
            prop: 'isBid',
            label: 'Winning Bid Results',
            sortable: false,
            width: '150',
            type: 'text',
            formatter: (row, column) => {
              let str = ''
              if (row.isBid === 'Y') {
                str = '<span class="green">Awarded</span>'
              } else if (row.isBid === 'N') {
                str = '<span>Unsuccessful bid</span>'
              } else if (row.isBid === 'C') {
                str = '<span class="yellow">To be determined</span>'
              }
              return str
            }
          },
          {
            prop: 'bidNoReasonName',
            label: 'Reasons for not winning the bid',
            sortable: false,
            width: '240',
            type: 'text'
          },
          {
            prop: 'custName',
            label: 'Customer',
            sortable: false,
            popoverComponent: CustNameShow,
            type: 'text',
            width: '180'
          },
          {
            prop: 'latestReplyTime',
            label: 'Latest Reply Time',
            sortable: false,
            type: 'text',
            width: '150'
          },
          {
            prop: 'isTradeEnquiries',
            label: 'Inquiry Type',
            sortable: false,
            type: 'text',
            width: '100',
            formatter: (row, column) => {
              let str = getDictLabel('tradeEnquiriesType', row.isTradeEnquiries)
              return str
            }
          },
          {
            prop: 'tradeTermsCode',
            label: 'Trade Terms',
            sortable: false,
            type: 'text',
            width: '100',
            formatter: (row, column) => {
              let str = getDictLabel('tradeTermsCode', row.tradeTermsCode)
              return str
            }
          },
          {
            prop: 'pol',
            label: 'POL',
            sortable: true,
            type: 'text',
            width: '120'
          },
          {
            prop: 'pod',
            label: 'POD',
            sortable: false,
            type: 'text',
            value: '',
            width: '120'
          },
          {
            prop: 'commodity',
            label: 'Commodity',
            sortable: true,
            width: '100',
            type: 'text'
            // formatter: (row, column) => {
            //   let str = row.commodity.join(',')
            //   return str
            // }
          },
          {
            prop: 'polCountryName',
            label: 'Country of departure',
            sortable: true,
            width: '150',
            type: 'text'
          },
          {
            prop: 'countryName',
            label: 'Destination country',
            sortable: true,
            width: '100',
            type: 'text'
          },
          {
            prop: 'hsCode',
            label: 'HS CODE',
            sortable: true,
            type: 'text',
            width: '150'
            // formatter: (row, column) => {
            //   let str = row.hsCode.join(',')
            //   return str
            // }
          },
          {
            prop: 'deliveryAddress',
            label: 'Delivery Address',
            sortable: true,
            type: 'text',
            width: '250'
          },
          {
            prop: 'pickAddress',
            label: 'Pick-up Address',
            sortable: true,
            type: 'text',
            width: '250'
          },
          {
            prop: 'businessType',
            label: 'Business Type',
            sortable: true,
            type: 'text',
            width: '180',
            formatter: (row, column) => {
              let str = getBusinessTypeName(row.businessType)
              return str
            }
          },
          {
            prop: 'categoryName',
            label: 'Supplier',
            sortable: true,
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              let str = ''
              if (this.userId == row.quotationId) {
                str = row.categoryName
              }
              return str
            }
          },
          {
            prop: 'inquirerName',
            label: 'Inquirer',
            sortable: false,
            width: '150',
            type: 'text',
            formatter: (row, column) => {
              let str = row.inquirerName
              if (row.inquirerEname) {
                str = `${row.inquirerName}(${row.inquirerEname})`
              }
              return str
            }
          },
          {
            prop: 'quotationName',
            label: 'Quoter',
            sortable: false,
            width: '150',
            type: 'text',
            formatter: (row, column) => {
              let str = row.quotationName
              if (row.inquirerEname) {
                str = `${row.quotationName}(${row.quotationEname})`
              }
              return str
            }
          },
          {
            prop: 'createdTime',
            label: 'Created Time',
            sortable: false,
            width: '180',
            type: 'text'
          },
          {
            prop: 'createdName',
            label: 'Created by',
            sortable: false,
            width: '150',
            type: 'text'
          },
          {
            prop: 'updatedTime',
            label: 'Update Time',
            sortable: false,
            width: '180',
            type: 'text'
          },
          {
            prop: 'updatedName',
            label: 'Updated by',
            sortable: false,
            width: '150',
            type: 'text'
          },
          {
            prop: 'inquirerDeptName',
            label: 'Inquiry Department',
            sortable: false,
            width: '150',
            type: 'text'
          },
          {
            prop: 'lastQuoteTime',
            label: 'Latest Quotation Response Time',
            sortable: false,
            width: '250',
            type: 'text'
          },
          {
            prop: 'bidTime',
            label: 'Latest winning bid feedback time',
            sortable: false,
            width: '250',
            type: 'text'
          },
          {
            prop: 'inTimeStr',
            label: 'Timely Status',
            sortable: false,
            width: '150',
            type: 'text',
            formatter: (row, column) => {
              let str = ''
              if (row.inTimeStr === '及时') {
                str = 'In time'
              } else if (row.inTimeStr === '超时') {
                str = 'Overtime'
              }
              return str
            }
          },
          {
            prop: 'quoteRemark',
            label: 'Remark of quotation',
            sortable: false,
            width: '150',
            type: 'text',
            formatter: (row, column) => {
              let str = ''
              if (this.userId == row.quotationId) {
                str = row.quoteRemark
              }
              return str
            }
          }
        ],
        configColumns: [],
        // 表头库
        columnsBase: [],
        columns: [
          {
            prop: 'enquiryNo',
            label: 'Inquiry No.',
            sortable: false,
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              let str = ''
              if (row.unReadCount) {
                let unReadCount = row.unReadCount > 99 ? '99+' : row.unReadCount
                str = `<sapn class="num">${unReadCount}</sapn>`
              }
              return `<div class="overseasFreight-enquiryNo-box"><sapn class="unReadCount">${str}</sapn>${row.enquiryNo}</div>`
            }
          },
          {
            prop: 'quotationNumber',
            label: 'Quotation No.',
            sortable: false,
            type: 'text',
            width: '120'
          },
          {
            prop: 'orderNo',
            label: 'Order No.',
            sortable: false,
            type: 'text',
            width: '180',
            popoverComponent: OrderNoItems
          },
          {
            prop: 'status',
            label: 'Quotation Status',
            sortable: false,
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              let status = row.status
              let color = ''
              let result = getDictLabel('enquiriesStatus', row.status)
              if (!result) {
                if (row.quotationNumber) {
                  result = 'Quoted'
                  color = 'green'
                } else {
                  result = 'Not quoted'
                }
              }
              if (status === 'QUOTED') {
                color = 'green'
              }
              if (['BREAK'].includes(status)) {
                color = 'red'
              }
              return `<span class="${color}">${result}</span>`
            }
          },
          {
            prop: 'isBid',
            label: 'Winning Bid Results',
            sortable: false,
            width: '150',
            type: 'text',
            formatter: (row, column) => {
              let str = ''
              if (row.isBid === 'Y') {
                str = '<span class="green">Awarded</span>'
              } else if (row.isBid === 'N') {
                str = '<span>Unsuccessful bid</span>'
              } else if (row.isBid === 'C') {
                str = '<span class="yellow">To be determined</span>'
              }
              return str
            }
          },
          {
            prop: 'bidNoReasonName',
            label: 'Reasons for not winning the bid',
            sortable: false,
            width: '240',
            type: 'text'
          },
          {
            prop: 'custName',
            label: 'Customer',
            sortable: false,
            popoverComponent: CustNameShow,
            type: 'text',
            width: '180'
          },
          {
            prop: 'latestReplyTime',
            label: 'Latest Reply Time',
            sortable: false,
            type: 'text',
            width: '150'
          },
          {
            prop: 'isTradeEnquiries',
            label: 'Inquiry Type',
            sortable: false,
            type: 'text',
            width: '100',
            formatter: (row, column) => {
              let str = getDictLabel('tradeEnquiriesType', row.isTradeEnquiries)
              return str
            }
          },
          {
            prop: 'tradeTermsCode',
            label: 'Trade Terms',
            sortable: false,
            type: 'text',
            width: '100',
            formatter: (row, column) => {
              let str = getDictLabel('tradeTermsCode', row.tradeTermsCode)
              return str
            }
          },
          {
            prop: 'pol',
            label: 'POL',
            sortable: true,
            type: 'text',
            width: '120'
          },
          {
            prop: 'pod',
            label: 'POD',
            sortable: false,
            type: 'text',
            value: '',
            width: '120'
          },
          {
            prop: 'commodity',
            label: 'Commodity',
            sortable: true,
            width: '100',
            type: 'text'
            // formatter: (row, column) => {
            //   let str = row.commodity.join(',')
            //   return str
            // }
          },
          {
            prop: 'polCountryName',
            label: 'Country of departure',
            sortable: true,
            width: '150',
            type: 'text'
          },
          {
            prop: 'countryName',
            label: 'Destination country',
            sortable: true,
            width: '100',
            type: 'text'
          },
          {
            prop: 'hsCode',
            label: 'HS CODE',
            sortable: true,
            type: 'text',
            width: '150'
            // formatter: (row, column) => {
            //   let str = row.hsCode.join(',')
            //   return str
            // }
          },
          {
            prop: 'deliveryAddress',
            label: 'Delivery Address',
            sortable: true,
            type: 'text',
            width: '250'
          },
          {
            prop: 'pickAddress',
            label: 'Pick-up Address',
            sortable: true,
            type: 'text',
            width: '250'
          },
          {
            prop: 'businessType',
            label: 'Business Type',
            sortable: true,
            type: 'text',
            width: '180',
            formatter: (row, column) => {
              let str = getBusinessTypeName(row.businessType)
              return str
            }
          },
          {
            prop: 'categoryName',
            label: 'Supplier',
            sortable: true,
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              let str = ''
              if (this.userId == row.quotationId) {
                str = row.categoryName
              }
              return str
            }
          },
          {
            prop: 'inquirerName',
            label: 'Inquirer',
            sortable: false,
            width: '150',
            type: 'text',
            formatter: (row, column) => {
              let str = row.inquirerName
              if (row.inquirerEname) {
                str = `${row.inquirerName}(${row.inquirerEname})`
              }
              return str
            }
          },
          {
            prop: 'quotationName',
            label: 'Quoter',
            sortable: false,
            width: '150',
            type: 'text',
            formatter: (row, column) => {
              let str = row.quotationName
              if (row.inquirerEname) {
                str = `${row.quotationName}(${row.quotationEname})`
              }
              return str
            }
          },
          {
            prop: 'createdTime',
            label: 'Created Time',
            sortable: false,
            width: '180',
            type: 'text'
          },
          {
            prop: 'createdName',
            label: 'Created by',
            sortable: false,
            width: '150',
            type: 'text'
          },
          {
            prop: 'updatedTime',
            label: 'Update Time',
            sortable: false,
            width: '180',
            type: 'text'
          },
          {
            prop: 'updatedName',
            label: 'Updated by',
            sortable: false,
            width: '150',
            type: 'text'
          },

          {
            prop: 'inquirerDeptName',
            label: 'Inquiry Department',
            sortable: false,
            width: '150',
            type: 'text'
          },
          {
            prop: 'lastQuoteTime',
            label: 'Latest Quotation Response Time',
            sortable: false,
            width: '250',
            type: 'text'
          },
          {
            prop: 'bidTime',
            label: 'Latest winning bid feedback time',
            sortable: false,
            width: '250',
            type: 'text'
          },
          {
            prop: 'inTimeStr',
            label: 'Timely Status',
            sortable: false,
            width: '150',
            type: 'text',
            formatter: (row, column) => {
              let str = ''
              if (row.inTimeStr === '及时') {
                str = 'In time'
              } else if (row.inTimeStr === '超时') {
                str = 'Overtime'
              }
              return str
            }
          },
          {
            prop: 'quoteRemark',
            label: 'Remark of quotation',
            sortable: false,
            width: '150',
            type: 'text',
            formatter: (row, column) => {
              let str = ''
              if (this.userId == row.quotationId) {
                str = row.quoteRemark
              }
              return str
            }
          }
        ],
        // 操作按钮组
        operationBtns: {
          width: '380px',
          fixed: 'right',
          show: true,
          callback: (action, $index, row, item, $event) => {
            if (action === 'Detail') {
              this.handleDetail(row, $index)
            }
            if (action === 'addParticipants') {
              this.handleAddParticipants(row)
            }
            if (action === 'Del') {
              this.handleDel(row)
            }
            if (action === 'Copy') {
              this.handleCopy(row, $index, $event)
            }
            if (action === 'Break') {
              this.handleBreak(row)
            }
          },
          data: [
            {
              label: 'Details',
              type: 'text',
              show: true,
              action: 'Detail'
            },
            {
              label: 'Change of participant',
              type: 'text',
              show: true,
              action: 'addParticipants',
              show: (item, row) => {
                // 当前用户属于报价人或者询价人才可以 变更参与人
                if (
                  (row.quotationId == this.userId ||
                    row.inquirerId == this.userId) &&
                  !['BREAK'].includes(row.status)
                ) {
                  return true
                } else {
                  return false
                }
              }
            },
            {
              label: 'Copy',
              type: 'text',
              show: true,
              action: 'Copy',
              show: (item, row) => {
                // 当前询价人才可以复制
                if (row.inquirerId == this.userId) {
                  return true
                } else {
                  return false
                }
              }
            },
            {
              label: 'Delete',
              type: 'text',
              show: true,
              className: 'red',
              action: 'Del',
              show: (item, row) => {
                // 没有报价才能删除
                if (!row.quotationNumber && row.inquirerId == this.userId) {
                  return true
                } else {
                  return false
                }
              }
            },
            {
              label: 'Termination',
              type: 'text',
              show: true,
              className: 'red',
              action: 'Break',
              show: (item, row) => {
                // 旧数据status，可以终止
                if (
                  (row.quotationId == this.userId ||
                    row.inquirerId == this.userId) &&
                  !['BREAK'].includes(row.status)
                ) {
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
  activated() {
    // if (this.$route.query.flag) {
    // this.getList()
    // }
  },
  mounted() {},
  computed: {
    ...mapGetters(['dictMap']),
    ...mapState({
      userId: (state) => state.user.userId
    }),
    showSearchInputGroup() {
      // let index = this.searchInputGroup.findIndex(
      //   (item) => item.key === 'createdTime'
      // )
      // if (index !== -1) {
      //   this.searchInputGroup.push(this.searchInputGroup[index])
      //   this.searchInputGroup.splice(index, 1)
      // }
      return this.searchInputGroup
    }
  },
  components: {
    Search,
    BaseTableMuti,
    TableFilter,
    AddInquiry,
    AddParticipantsDatePop,
    AddFilter,
    CustomColumns,
    BreakPop,
    OrderNoItems
  },
  methods: {
    getCountryList(queryString, item) {
      let params = {
        countryCode: queryString,
        state: 'valid'
      }
      countrySelectList(params)
        .then((res) => {
          let itemList = []
          if (res.code === 0) {
            itemList = res.data || []
          } else {
            itemList = []
          }
          item.data = itemList.map((ele) => {
            return {
              ...ele,
              label: ele.ename,
              value: ele.ename
            }
          })
        })
        .catch(() => {})
    },
    // 按状态筛选
    handleSearchByOrderStatus() {
      this.tableQuery.currPage = 1
      this.getList()
    },
    handleIsUnread() {
      this.tableQuery.currPage = 1
      this.getList()
    },
    // 取消订单关闭回调
    breakPopClose(action, value) {
      console.log(value)
      this.breakPopShow = false
      if (action === 'Confirm') {
        let param = {
          breakReason: value.breakReason,
          enquiryId: this.enquiryId
        }
        enquiryBreak(param).then(() => {
          this.$message.success('Successful termination')
          this.getList()
        })
      }
    },
    handleBreak(row) {
      // 终止
      this.enquiryId = row.enquiryId
      this.breakPopShow = true
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
      // console.log('tableColumns:', this.tableConfig.columns);
    },
    // 自定义表头
    handleCustomColumns() {
      this.customColumnsPopShow = true
    },
    // 自定义表头关闭回调
    customColumnsPopClose(action, value) {
      this.customColumnsPopShow = false
      if (action === 'Confirm') {
        let columnsKeys = this.getColumnsValues(value)
        Object.assign(this.tableQuery, {
          columns: columnsKeys
        })
        // console.log('columnsKeys:',this.tableQuery.columns)
        this.getList()
      }
    },
    // handleCopy(row) {
    //   enquiryCopy({ enquiryId: row.enquiryId }).then((res) => {
    //     this.$message.success('复制成功')
    //     this.getList()
    //   })
    // },
    handleCopy(row, index, e) {
      // 询价人复制最后一次询价信息
      let params = {
        enquiryId: row.enquiryId
      }
      detailRecord(params)
        .then((res) => {
          let enquiryArr = res.data.detailInfor.filter(
            (el) => el.recordType === 'enquiry'
          )
          if (enquiryArr.length) {
            this.lastInquiryData = JSON.parse(
              JSON.stringify(enquiryArr[enquiryArr.length - 1])
            )
            if (this.lastInquiryData.startDateTerm) {
              this.$set(this.lastInquiryData, 'term', [
                this.lastInquiryData.startDateTerm,
                this.lastInquiryData.endDateTerm
              ])
            } else {
              this.$set(this.lastInquiryData, 'term', [])
            }
            if (this.lastInquiryData.lclDestinationAgent) {
              this.lastInquiryData.lclDestinationAgent = Number(
                this.lastInquiryData.lclDestinationAgent
              )
            }
            this.lastInquiryData.hscodeCommodity =
              this.lastInquiryData.hscodeSonCommodity
            for (
              let i = 0;
              i < this.lastInquiryData.hscodeCommodity.length;
              i++
            ) {
              this.$set(
                this.lastInquiryData.hscodeCommodity[i],
                'hscodeOptions',
                [
                  {
                    label: this.lastInquiryData.hscodeCommodity[i].hsCode,
                    value: this.lastInquiryData.hscodeCommodity[i].hsCode
                  }
                ]
              )
            }
          }
          this.showAddInquiryPop = true
        })
        .catch((err) => {})
    },
    // 获取委托单位
    getCustList(val = '', item) {
      let data = {
        currPage: 1,
        pageSize: 50,
        customerName: val
      }
      potentialAndClient(data).then((res) => {
        item.data = unique(
          res.data.list.map((ele) => {
            return Object.assign(ele, {
              label: ele.name,
              value: ele.custid
            })
          }),
          'value'
        )
      })
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
          let label = `${ele.cname} (${ele.ename}-${ele.deptName})`
          if (!ele.ename) {
            label = `${ele.cname} (${ele.deptName})`
          }
          return {
            ...ele,
            label: label,
            value: ele.employeeId ? Number(ele.employeeId) : ''
          }
        })
        item.data = [...item.saveList, ...itemList]
      })
    },
    // 报价人
    getQuotationEmployeeName(val, item) {
      let data1 = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        roleCode: 'ecs'
      }
      let data2 = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        roleCode: 'epricing'
      }
      Promise.all([
        baseEmployeeListName(data1),
        baseEmployeeListName(data2)
      ]).then((res) => {
        if (!item.multiple) item.saveList = []
        let filterArr0 = res[0].data.filter(
          (ele) => !item.saveList.find((o) => o.value === ele.employeeId)
        )
        let filterArr1 = res[1].data.filter(
          (ele) => !item.saveList.find((o) => o.value === ele.employeeId)
        )
        let itemList0 = filterArr0.map((ele) => {
          let label = `${ele.cname} (${ele.ename}-${ele.deptName})`
          if (!ele.ename) {
            label = `${ele.cname} (${ele.deptName})`
          }
          return {
            ...ele,
            label: label,
            value: ele.employeeId ? Number(ele.employeeId) : ''
          }
        })
        let itemList1 = filterArr1.map((ele) => {
          let label = `${ele.cname} (${ele.ename}-${ele.deptName})`
          if (!ele.ename) {
            label = `${ele.cname} (${ele.deptName})`
          }
          return {
            ...ele,
            label: label,
            value: ele.employeeId ? Number(ele.employeeId) : ''
          }
        })
        item.data = unique(
          [...item.saveList, ...itemList0, ...itemList1],
          'employeeId'
        )
      })
    },
    addParticipantsDatePopClose(action, value) {
      // 变更参与人
      if (action === 'Confirm') {
        if (value.participantsType === 'joint') {
          let params = {
            participantType: value.participantsType,
            participantIdList: value.participantIdList,
            enquiryId: this.enquiryId
          }
          participantAddBatch(params).then((res) => {
            this.addParticipantsDatePopShow = false
            this.$message({ type: 'success', message: 'New Co-Participant Success' })
            // 发起询价后需要调用询价记录接口
            this.getList()
          })
        } else {
          let params = {
            participantType: value.participantsType,
            participantName: value.participantName,
            participantId: value.participantId,
            enquiryId: this.enquiryId
          }
          saveEnquiryParticipant(params)
            .then((res) => {
              this.addParticipantsDatePopShow = false
              this.$message({ type: 'success', message: 'Successful change of participant' })
              this.getList()
            })
            .finally(() => {})
        }
      } else {
        this.addParticipantsDatePopShow = false
      }
    },
    // 供应商
    getSupplierList(queryString, item) {
      console.log(item)
      this.$store
        .dispatch('dict/queryAllSupplierList', {
          queryString: queryString
        })
        .then((data) => {
          item.data = unique(
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
    addInquiryClose(action, value) {
      if (action === 'Confirm') {
        this.canSubmit = false
        this.$store
          .dispatch('airTransport/orderSave', {
            uri: '/order/over/enquiry/saveEnquiry',
            params: value
          })
          .then((res) => {
            if (res.data.code === 0) {
              this.showAddInquiryPop = false
              this.$message({ type: 'success', message: 'Add Success' })
              this.getList()
            }
            this.canSubmit = true
          })
          .catch(() => {
            this.canSubmit = true
          })
      } else {
        this.showAddInquiryPop = false
      }
    },
    handleAdd() {
      this.lastInquiryData = {}
      this.showAddInquiryPop = true
    },
    init() {
      Object.assign(this.allFilterGroups, {
        all: this.filterGroups
      })
      this.searchInputGroup = JSON.parse(
        JSON.stringify(defaultSearchInputGroup)
      )
    },
    // 起运港下拉列表自动补充的数据
    polQuerySearch(queryString, portAttribute, state, cb) {
      this.$store
        .dispatch('dict/basePortList', { queryString, portAttribute, state })
        .then((data) => {
          cb(data)
        })
    },

    // 中转港下拉数据
    transitPortSearch(val) {
      this.$store.dispatch('dict/basePortList', val).then((data) => {
        this.filterGroups.transitPortCodes.data = data
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
    // 导出
    handleExport() {
      this.$confirm('Is the export confirmed?', 'Tips', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        let data = this.getListQuery()
        overSeasListExport({
          ascColumns: data.ascColumns,
          descColumns: data.descColumns,
          query: data.query
        }).then((response) => {
          let { filePath } = response.data
          window.location.href = filePath
        })
      })
    },
    // 列表数据
    // 获取列表请求参数
    getListQuery() {
      let statusQuery = []

      if (this.tableQuery.status === 'ALL') {
        statusQuery = []
      } else if (this.tableQuery.status === 'SUCCESS') {
        statusQuery = [{ column: 'isBid', type: 'eq', value: 'Y' }]
      } else {
        statusQuery = [
          { column: 'status', type: 'eq', value: this.tableQuery.status }
        ]
      }

      let data = {}
      Object.assign(data, this.tableQuery, {
        query: this.tableQuery.query.concat(statusQuery)
      })

      let orderNoItem = data.query.find((el) => el.column === 'orderNo')
      if (orderNoItem) {
        let orderNoItemIndex = data.query.findIndex(
          (el) => el.column === 'orderNo'
        )
        data.orderNo = orderNoItem.value
        data.query.splice(orderNoItemIndex, 1)
      }
      return data
    },
    async getList() {
      this.loading = true
      // 合并发布状态参数
      let params = this.getListQuery()
      delete params.state
      let { data } = await columnWidthConfigInfo({
        scenesCode: this.$route.name
      })
      let { columnWidthList } = data
      overSeasListSum(params).then((res) => {
        this.overSeasSumData = res.data
        console.log(res.data)
      })
      overSeasList(params)
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

          this.handleFilterColumns(this.tableConfig.configColumns)
          this.tableColumnsWidthList = this.getTableColumnsWidth()
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleSearchValueReset() {
      this.searchInputGroup.map((item) => {
        item.value = ''
        return { ...item }
      })
      // console.log('重置')
    },
    // 查询组件回调
    searchCallBack(action, param) {
      let query = []
      if (action === 'Search') {
        //默认的查询条件组装tableQuery参数
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
                } else if (
                  this.filterGroups[item.key].category === 'daterange'
                ) {
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
    // 去详情页
    handleDetail(row, index) {
      setTimeout(() => {
        this.$set(this.tableConfig.list[index], 'unReadCount', null)
      }, 1000)
      this.$router.push({
        name: 'OverseasFreightDetaile',
        query: {
          id: row.enquiryId
        }
      })
    },
    handleDel(row) {
      this.$confirm('Are you sure you want to delete this inquiry?', 'Tips', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(() => {
          enquiryDelete(row.enquiryId).then((res) => {
            this.$message.success('Deleted successfully')
            this.getList()
          })
        })
        .catch(() => {})
    },
    handleAddParticipants(row) {
      if (row.inquirerId == this.userId) {
        this.participantType = 'enquiry'
      } else {
        this.participantType = 'quote'
      }
      this.enquiryId = row.enquiryId
      this.quotationNumber = row.quotationNumber
      this.addParticipantsDatePopShow = true
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
