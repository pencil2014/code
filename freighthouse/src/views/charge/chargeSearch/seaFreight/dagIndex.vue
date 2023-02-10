<template>
  <div class="app-container">
    <div class="search-container">
      <Search :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery" :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
        <!-- 新增条件下拉查询 -->
        <AddFilter :searchConfig="searchConfig" :defaultSearchLength="defaultSearchLength" :searchInputGroup="searchInputGroup" :item="item" :index="index" :filterGroups="filterGroups" v-for="(item, index) in searchInputGroup" :key="'filter' + index" />
        <div class="btn-plus-search" @click="handleAddFilter"></div>
      </Search>
    </div>

    <div class="table-container dzg-tabel">
      <TableFilter :config="tableConfig" :tableQuery.sync="tableQuery" :callback="tableCallBack" />

      <BaseTableMuti ref="dagIndexTable" v-loading="loading" class="dzg-sea-freight" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
      <DzgPagination :config="dzgPaginationConfig" @changePageNum="changePageNum" @changePageSize="changePageSize" />
    </div>

    <!-- 自定义表头 -->
    <div v-if="customColumnsPopShow">
      <CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
    </div>

    <!-- 生成订单弹窗 -->
    <div v-if="createOrderPopShow">
      <CreateOrder :currentData="currentData" @close="createOrderPopClose" />
    </div>
    <!-- 详情 -->
    <div v-if="dzgFreightRateDetailPopShow">
      <DzgFreightRateDetail :currentData="detailData" @close="dzgFreightRateDetailPopClose" :connonQueryValue="tableQuery.connonQueryValue" :bargeQuery="tableQuery.bargeQuery" @handleCreate="handleCreate" />
    </div>
    <!-- 附件列表 -->
    <div v-if="dzgFileListPopShow">
      <FileList :casenumbers="casenumbers" @close="dzgFileListPopClose" />
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import Search from '@/components/Base/Search/index'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/dzgTableFilter'
import AddFilter from './components/addFilterDzg'
// 弹出框
import BaseDialog from '@/components/Base/Dialog/index'
import CustomColumns from '@/components/customColumns/index'
import { dzgPgList, dzgPgSonList } from '@/api/charge/route'
import { dzgChargeCreate } from '@/api/order/list'
import TableColumnPopover from './components/tableColumnPopover'
import ScheduleColumnPopover from './components/scheduleColumnPopover'
import clipboard from '@/directive/clipboard/index.js'
import CreateOrder from './components/dzgCreateOrder'
import DzgFreightRateDetail from './components/dzgFreightRateDetail'
import FileList from './components/dzgFileList'
import DzgPagination from './components/dzgPagination'
import {
  // searchConditionInfo,
  // searchConditionSave,
  // searchConditionDelete,
  countrySelectList,
  columnWidthConfigSave,
  columnWidthConfigInfo
} from '@/api/base'
const defaultPage = {
  pageSize: 30,
  currPage: 1
}

const defaultTableQuery = {
  ascColumns: [],
  descColumns: [],
  columns: [],
  query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
  connonQueryValue: '10',
  bargeQuery: false
}
const defaultSearchInputGroup = [
  {
    key: 'loadport',
    value: '',
    placeholder: '筛选条件',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'dischargeport',
    value: '',
    placeholder: '筛选条件',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'carrier',
    value: '',
    placeholder: '筛选条件',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'country',
    value: '',
    placeholder: '筛选条件',
    category: 'all',
    queryValue: ''
  }
]

export default {
  mixins: [routerMixin],
  directives: {
    clipboard
  },
  data() {
    return {
      isCheckedRows: [],
      detailCasenumber: '',
      dzgPaginationConfig: {
        totalCount: 0, // 总数
        currPage: 1, // 当前页数
        hasPreviousPage: false, // 是否有上一页
        hasNextPage: false, // 是否有下一页
        pageSize: 30, // 页码
        isFirstPage: '', // 是第一页
        isLastPage: '' // 是最后一页
      },
      casenumbers: '', // 附件列表参数
      dzgFileListPopShow: false,
      interfaceData: {},
      detailData: {},
      dzgFreightRateDetailPopShow: false, // 详情
      currentData: {},
      loading: true,
      state: 'valid',
      showVal: null,
      defaultStyle: {
        width: '100%'
      },
      // searchConditionList: [], // 自定义搜索模板集合
      defaultSearchLength: 0, // 默认显示搜索框的个数
      // 中转港
      transitPortList: [],
      // 查询条件下拉选项
      filterGroups: {
        recaddressEnname: {
          key: 'recaddressEnname',
          label: '驳船收货地',
          type: 'remoteSelect',
          searchType: 'like',
          value: [],
          multiple: true,
          'collapse-tags': true,
          data: [],
          nonDictionary: true,
          saveList: [],
          searchType: 'eq',
          visibleChange: (val, item) => {
            this.portSearch(
              '',
              'port_of_feeder',
              this.state,
              'recaddressEnname',
              item
            )
          },
          filterMehod: (val, item) => {
            this.portSearch(
              val,
              'port_of_feeder',
              this.state,
              'recaddressEnname',
              item
            )
          },
          change: (val, item) => {
            Object.assign(item, {
              queryValue: val
            })
          }
        },
        loadport: {
          key: 'loadport',
          label: '起运港',
          type: 'remoteSelect',
          searchType: 'in',
          value: '',
          multiple: true,
          'collapse-tags': true,
          data: [],
          saveList: [],
          nonDictionary: true,
          queryValue: '',
          visibleChange: (val, item) => {
            this.portSearch('', 'port_of_basic', this.state, 'loadport', item)
          },
          filterMehod: (val, item) => {
            this.portSearch(val, 'port_of_basic', this.state, 'loadport', item)
          }
          // change: (val, item) => {
          //   item.data.map((ele) => {
          //     if (val.includes(ele.value)) {
          //       item.saveList.push({
          //         label: ele.label,
          //         value: ele.value
          //       })
          //     }
          //   })
          //   Object.assign(item, {
          //     queryValue: val
          //   })
          // }
        },
        loadportcity: {
          key: 'loadportcity',
          label: '起运港城市',
          type: 'remoteSelect',
          searchType: 'like',
          value: [],
          multiple: true,
          'collapse-tags': true,
          data: [],
          nonDictionary: true,
          saveList: [],
          queryValue: '',
          visibleChange: (val, item) => {
            this.polCityQuerySearch('', this.state, item)
          },
          filterMehod: (val, item) => {
            this.polCityQuerySearch(val, this.state, item)
          },
          change: (val, item) => {
            item.data.map((ele) => {
              if (val.includes(ele.value)) {
                item.saveList.push({
                  label: ele.label,
                  value: ele.value
                })
              }
            })
            Object.assign(item, {
              queryValue: val
            })
          }
        },
        transferport: {
          key: 'transferport',
          label: '中转港',
          type: 'remoteSelect',
          searchType: 'in',
          value: [],
          multiple: true,
          'collapse-tags': true,
          data: [],
          saveList: [],
          nonDictionary: true,
          queryValue: '',
          visibleChange: (val, item) => {
            this.portSearch(
              '',
              'port_of_basic',
              this.state,
              'transferport',
              item
            )
          },
          filterMehod: (val, item) => {
            this.portSearch(
              val,
              'port_of_basic',
              this.state,
              'transferport',
              item
            )
          },
          change: (val, item) => {
            item.data.map((ele) => {
              if (val.includes(ele.value)) {
                item.saveList.push({
                  label: ele.label,
                  value: ele.value
                })
              }
            })
            Object.assign(item, {
              queryValue: val
            })
          }
        },
        dischargeport: {
          key: 'dischargeport',
          label: '目的港',
          type: 'remoteSelect',
          searchType: 'in',
          value: [],
          multiple: true,
          'collapse-tags': true,
          data: [],
          saveList: [],
          nonDictionary: true,
          queryValue: '',
          visibleChange: (val, item) => {
            this.portSearch(
              '',
              'port_of_basic',
              this.state,
              'dischargeport',
              item
            )
          },
          filterMehod: (val, item) => {
            this.portSearch(
              val,
              'port_of_basic',
              this.state,
              'dischargeport',
              item
            )
          },
          change: (val, item) => {
            item.data.map((ele) => {
              if (val.includes(ele.value)) {
                item.saveList.push({
                  label: ele.label,
                  value: ele.value
                })
              }
            })
            Object.assign(item, {
              queryValue: val
            })
          }
        },
        carrier: {
          key: 'carrier',
          label: '船公司',
          type: 'remoteSelect',
          value: '',
          multiple: true,
          'collapse-tags': true,
          data: [],
          nonDictionary: true,
          saveList: [],
          searchType: 'eq',
          visibleChange: (val, item) => {
            val && this.shipQuerySearch('', item)
          },
          filterMehod: (val, item) => {
            this.shipQuerySearch(val, item)
          },
          change: (val, item) => {
            item.data.map((ele) => {
              if (val.includes(ele.value)) {
                item.saveList.push({
                  label: ele.label,
                  value: ele.value
                })
              }
            })
            Object.assign(item, {
              queryValue: val
            })
          }
        },
        country: {
          key: 'country',
          label: '国家',
          type: 'remoteSelect',
          value: '',
          data: [],
          nonDictionary: true,
          multiple: true,
          'collapse-tags': true,
          saveList: [],
          searchType: 'eq',
          visibleChange: (val, item) => {
            val && this.countryQuerySearch('', item)
          },
          filterMehod: (val, item) => {
            this.countryQuerySearch(val, item)
          },
          change: (val, item) => {
            item.data.map((ele) => {
              if (val.includes(ele.value)) {
                item.saveList.push({
                  label: ele.label,
                  value: ele.value
                })
              }
            })
            Object.assign(item, {
              queryValue: val
            })
          }
        },
        searoute: {
          key: 'searoute',
          label: '航线',
          type: 'remoteSelect',
          value: '',
          queryValue: '',
          data: [],
          nonDictionary: true,
          multiple: true,
          'collapse-tags': true,
          saveList: [],
          searchType: 'eq',
          visibleChange: (val, item) => {
            this.sysLineQuerySearch('', item)
          },
          filterMehod: (val, item) => {
            this.sysLineQuerySearch(val, item)
          },
          change: (val, item) => {
            console.log(val)
            item.data.map((ele) => {
              if (val.includes(ele.value)) {
                item.saveList.push({
                  label: ele.label,
                  value: ele.value
                })
              }
            })
            Object.assign(item, {
              queryValue: val
            })
          }
        },
        searoute_code: {
          key: 'searoute_code',
          label: '航线代码',
          type: 'input',
          value: '',
          searchType: 'like'
        },
        signflag: {
          key: 'signflag',
          label: '符号',
          type: 'input',
          value: '',
          searchType: 'like'
        },
        quoteorg: {
          key: 'quoteorg',
          label: '订舱代理',
          type: 'remoteSelect',
          searchType: 'like',
          'allow-create': true,
          multiple: true,
          'collapse-tags': true,
          value: '',
          queryValue: '',
          data: [],
          nonDictionary: true,
          saveList: [],
          visibleChange: (val, item) => {
            this.getSupplierList('bkg_agent', '', item)
          },
          filterMehod: (val, item) => {
            this.getSupplierList('bkg_agent', val, item)
          },
          change: (val, item) => {
            console.log(val)
            item.data.map((ele) => {
              if (val.includes(ele.value)) {
                item.saveList.push({
                  label: ele.label,
                  value: ele.value
                })
              }
            })
            Object.assign(item, {
              queryValue: val
            })
          }
        },
        iscommend: {
          key: 'iscommend',
          label: '推荐',
          type: 'select',
          multiple: true,
          'collapse-tags': true,
          value: '',
          saveList: [],
          data: [
            { label: '否', value: '否' },
            { label: '是', value: '是' }
          ],
          nonDictionary: true,
          visibleChange: (val, item) => {
            let list = [
              { label: '否', value: '否' },
              { label: '是', value: '是' }
            ]
            let filterArr = list.filter(
              (ele) => !item.saveList.find((o) => o.value === ele.value)
            )
            let itemList = filterArr.map((ele) => {
              return { ...ele, label: ele.label, value: ele.value }
            })
            item.data = [...item.saveList, ...itemList]
          }
        },
        validType: {
          label: '有效类别',
          key: 'validType',
          type: 'select',
          multiple: true,
          'collapse-tags': true,
          value: '',
          searchType: 'eq',
          nonDictionary: true,
          saveList: [],
          data: [
            { label: '开船时间', value: '1' },
            { label: '进港时间', value: '5' },
            { label: '截关时间', value: '3' },
            { label: '还重柜时间', value: '4' }
          ],
          visibleChange: (val, item) => {
            let list = [
              { label: '开船时间', value: '1' },
              { label: '进港时间', value: '5' },
              { label: '截关时间', value: '3' },
              { label: '还重柜时间', value: '4' }
            ]
            let filterArr = list.filter(
              (ele) => !item.saveList.find((o) => o.value === ele.value)
            )
            let itemList = filterArr.map((ele) => {
              return { ...ele, label: ele.label, value: ele.value }
            })
            item.data = [...item.saveList, ...itemList]
          }
        },
        validdate: {
          label: '有效日期',
          key: 'validdate',
          type: 'date',
          value: '',
          format: 'yyyy-MM-dd',
          searchType: 'eq'
        },
        publishdate: {
          label: '发布日期',
          key: 'publishdate',
          type: 'date',
          value: '',
          format: 'yyyy-MM-dd',
          searchType: 'eq'
        },
        modifydate: {
          label: '修改日期',
          key: 'modifydate',
          type: 'date',
          value: '',
          format: 'yyyy-MM-dd',
          searchType: 'eq'
        },
        cycle: {
          label: '船期',
          key: 'cycle',
          type: 'select',
          value: '',
          multiple: true,
          'collapse-tags': true,
          searchType: 'eq',
          nonDictionary: true,
          saveList: [],
          data: [
            { value: '1/3', label: '1/3' },
            { value: '5/1', label: '5/1' },
            { value: '6/1', label: '6/1' },
            { value: '4/6', label: '4/6' },
            { value: '6/2', label: '6/2' },
            { value: '7/2', label: '7/2' },
            { value: '2/4', label: '2/4' },
            { value: '2/3', label: '2/3' },
            { value: '3/5', label: '3/5' },
            { value: '5/6', label: '5/6' },
            { value: '7/1', label: '7/1' },
            { value: '3/4', label: '3/4' },
            { value: '4/5', label: '4/5' },
            { value: '5/7', label: '5/7' },
            { value: '6/7', label: '6/7' },
            { value: '1/2', label: '1/2' },
            { value: '2/5', label: '2/5' },
            { value: '1/2,2/3', label: '1/2,2/3' },
            { value: '*/5', label: '*/5' },
            { value: '*/4', label: '*/4' },
            { value: '*/6', label: '*/6' },
            { value: '*/3', label: '*/3' },
            { value: '*/7', label: '*/7' },
            { value: '*/2', label: '*/2' },
            { value: '3/6', label: '3/6' },
            { value: '5/2', label: '5/2' },
            { value: '4/4', label: '4/4' },
            { value: '1/2,6/1,1/3,7/1', label: '1/2,6/1,1/3,7/1' },
            { value: '1/3,7/1', label: '1/3,7/1' },
            { value: '1/2,6/1', label: '1/2,6/1' }
          ],
          visibleChange: (val, item) => {
            let list = [
              { value: '1/3', label: '1/3' },
              { value: '5/1', label: '5/1' },
              { value: '6/1', label: '6/1' },
              { value: '4/6', label: '4/6' },
              { value: '6/2', label: '6/2' },
              { value: '7/2', label: '7/2' },
              { value: '2/4', label: '2/4' },
              { value: '2/3', label: '2/3' },
              { value: '3/5', label: '3/5' },
              { value: '5/6', label: '5/6' },
              { value: '7/1', label: '7/1' },
              { value: '3/4', label: '3/4' },
              { value: '4/5', label: '4/5' },
              { value: '5/7', label: '5/7' },
              { value: '6/7', label: '6/7' },
              { value: '1/2', label: '1/2' },
              { value: '2/5', label: '2/5' },
              { value: '1/2,2/3', label: '1/2,2/3' },
              { value: '*/5', label: '*/5' },
              { value: '*/4', label: '*/4' },
              { value: '*/6', label: '*/6' },
              { value: '*/3', label: '*/3' },
              { value: '*/7', label: '*/7' },
              { value: '*/2', label: '*/2' },
              { value: '3/6', label: '3/6' },
              { value: '5/2', label: '5/2' },
              { value: '4/4', label: '4/4' },
              { value: '1/2,6/1,1/3,7/1', label: '1/2,6/1,1/3,7/1' },
              { value: '1/3,7/1', label: '1/3,7/1' },
              { value: '1/2,6/1', label: '1/2,6/1' }
            ]
            let filterArr = list.filter(
              (ele) => !item.saveList.find((o) => o.value === ele.value)
            )
            let itemList = filterArr.map((ele) => {
              return { ...ele, label: ele.label, value: ele.value }
            })
            item.data = [...item.saveList, ...itemList]
          }
        },
        carrier_route: {
          key: 'carrier_route',
          label: '承运人航线',
          type: 'input',
          value: '',
          searchType: 'like'
        },
        priceColor: {
          key: 'priceColor',
          label: '颜色',
          type: 'select',
          value: '',
          multiple: true,
          'collapse-tags': true,
          saveList: [],
          data: [
            { label: '黑色', value: 'black' },
            { label: '蓝色', value: 'blue' },
            { label: '红色', value: 'red' },
            { label: '绿色', value: 'green' }
          ],
          nonDictionary: true,
          visibleChange: (val, item) => {
            let list = [
              { label: '黑色', value: 'black' },
              { label: '蓝色', value: 'blue' },
              { label: '红色', value: 'red' },
              { label: '绿色', value: 'green' }
            ]
            let filterArr = list.filter(
              (ele) => !item.saveList.find((o) => o.value === ele.value)
            )
            let itemList = filterArr.map((ele) => {
              return { ...ele, label: ele.label, value: ele.value }
            })
            item.data = [...item.saveList, ...itemList]
          }
        },
        owner_name: {
          key: 'owner_name',
          label: '维护人',
          type: 'remoteSelect',
          value: '',
          queryValue: '',
          data: [],
          nonDictionary: true,
          multiple: true,
          'collapse-tags': true,
          saveList: [],
          'allow-create': true,
          searchType: 'like',
          visibleChange: (val, item) => {
            this.pricerQuerySearch('', item)
          },
          filterMehod: (val, item) => {
            this.pricerQuerySearch(val, item)
          },
          change: (val, item) => {
            item.data.map((ele) => {
              if (val.includes(ele.value)) {
                item.saveList.push({
                  label: ele.label,
                  value: ele.value
                })
              }
            })
            Object.assign(item, {
              queryValue: val
            })
          }
        },
        modifyby: {
          key: 'modifyby',
          label: '修改人',
          type: 'remoteSelect',
          multiple: true,
          'collapse-tags': true,
          value: '',
          queryValue: '',
          data: [],
          nonDictionary: true,
          saveList: [],
          'allow-create': true,
          searchType: 'like',
          visibleChange: (val, item) => {
            this.pricerQuerySearch('', item)
          },
          filterMehod: (val, item) => {
            this.pricerQuerySearch(val, item)
          },
          change: (val, item) => {
            item.data.map((ele) => {
              if (val.includes(ele.value)) {
                item.saveList.push({
                  label: ele.label,
                  value: ele.value
                })
              }
            })
            Object.assign(item, {
              queryValue: val
            })
          }
        },
        price_holder: {
          key: 'price_holder',
          label: '拿价人',
          type: 'remoteSelect',
          multiple: true,
          'collapse-tags': true,
          value: '',
          queryValue: '',
          data: [],
          nonDictionary: true,
          saveList: [],
          'allow-create': true,
          searchType: 'like',
          visibleChange: (val, item) => {
            this.pricerQuerySearch('', item)
          },
          filterMehod: (val, item) => {
            this.pricerQuerySearch(val, item)
          },
          change: (val, item) => {
            item.data.map((ele) => {
              if (val.includes(ele.value)) {
                item.saveList.push({
                  label: ele.label,
                  value: ele.value
                })
              }
            })
            Object.assign(item, {
              queryValue: val
            })
          }
        }
      },
      searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),

      // 编辑提交参数
      createItem: {
        oceanFreight: [], // 海运费
        surchargeList: [] // 附加费
      },
      // 查询条件
      tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
      publishStatusOptions: {},
      searchConfig: [],

      // table复选框多选的值
      selectedCheckbox: [],

      // table基础组件
      tableConfig: {
        style: {},
        tableIndex: {
          show: false
        },
        stripe: true,
        options: {
          // api: this.$api.system.user.list,
          // 是否支持解锁列表修改
          lockState: true,

          // 是否支持列表项选中功能
          mutiSelect: true,
          mutiSelectFixed: true,

          // 多选框状态判断 {false不可选, true可选}
          checkSelectable() {
            return true
          },
          // 行key,用于行展开
          rowKeyId: 'id',
          //定义children名字
          treeProps: {
            children: 'children',
            hasChildren: 'hasChildren'
          },
          lazy: true,
          load: this.tabelDataLoad,
          vxeTableLoadChildren: this.vxeTableLoadChildren, // vxe-table懒加载树方法
          selectAll: this.selectAll,
          selectFn: this.selectFn
        },
        customColumns: {
					show: true,
					handleCustomColumns: this.handleCustomColumns
				},
        list: [],
        configColumns: [],
        columns: [],
        allColumns: [
          {
            prop: 'loadport',
            label: '起运港',
            width: '150px',
            cname: '',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            // fixed: true,
            type: 'text',
            // treeNode: true,
            formatter: (row, column) => {
              let str = ''
              if (row.loadport) {
                str = `${row.loadport}`
              }
              return `<span class="${row.priceColor || 'black'}">${str.replace(
                /&&&&/g,
                ','
              )}</span>`
            }
          },
          {
            prop: 'loadportcity',
            label: '起运港城市',
            width: '150px',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            cname: '',
            type: 'text',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.loadportcity}</span>`
            }
          },
          {
            prop: 'recaddressEnname',
            label: '驳船收货地',
            width: '150px',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            cname: '',
            type: 'text',
            formatter: (row, column) => {
              let str = `${row.recaddressEnname}`
              return `<span class="${row.priceColor}">${str.replace(
                /&&&&/g,
                ','
              )}</span>`
            }
          },
          {
            prop: 'dischargeport',
            label: '目的港',
            width: '150px',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            cname: '',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.dischargeport}</span>`
            }
          },
          {
            prop: 'country',
            cname: '',
            label: '国家',
            width: '100px',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.country}</span>`
            }
          },
          {
            prop: 'transferport',
            cname: '',
            label: '中转港',
            width: '100px',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            formatter: (row, column) => {
              let str = ''
              if (row.transferport) {
                str = `<span class="${row.priceColor}">${
                  row.transferport || '-'
                }/${row.transferport2 || '-'}/${
                  row.transferport3 || '-'
                }</span>`
              }
              return `<span class="${row.priceColor}">${str.replace(
                /&&&&/g,
                ''
              )}</span>`
            }
          },
          {
            prop: 'massaddress',
            label: '港区',
            type: 'text',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            width: '100',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.massaddress}</span>`
            }
          },
          {
            prop: 'quoteorg',
            label: '订舱代理',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '200px',
            formatter: (row, column) => {
              let str = ''
              if (row.quoteorg) {
                str = `${row.quoteorg}`
              }
              return `<span class="${row.priceColor}">${str.replace(
                /&&&&/g,
                ','
              )}</span>`
            }
          },
          {
            prop: 'carrier',
            label: '船公司',
            width: '100px',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.carrier}</span>`
            }
          },
          {
            prop: 'searoute',
            label: '航线',
            width: '100px',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.searouteCnname}</span>`
            }
          },
          {
            prop: 'searouteCode',
            label: '航线代码',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '100',
            formatter: (row, column) => {
              let str = ''
              if (row.searouteCode) {
                str = `${row.searouteCode}`
              }
              return `<span class="${row.priceColor}">${str.replace(
                /&&&&/g,
                ','
              )}</span>`
            }
          },
          {
            prop: 'cycle',
            label: '船期',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '250px',
            formatter: (row, column) => {
              let str = ''
              if (row.cycle) {
                str = `${row.cycle}`
              }
              return `<span class="${row.priceColor}">${str.replace(
                /&&&&/g,
                ','
              )}</span>`
            }
          },
          {
            prop: 'sailtime',
            label: '航程(天)',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '100',
            formatter: (row, column) => {
              let str = ''
              if (row.sailtime) {
                str = `${row.sailtime}`
              }
              return `<span class="${row.priceColor}">${str.replace(
                /&&&&/g,
                ','
              )}</span>`
            }
          },
          {
            prop: 'begindate',
            label: '有效期(开始)',
            type: 'text',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            width: '120',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.begindate.substring(
                0,
                10
              )}</span>`
            }
          },
          {
            prop: 'validdate',
            label: '有效期(结束)',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '120',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.validdate.substring(
                0,
                10
              )}</span>`
            }
          },
          {
            prop: 'validType',
            label: '有效类别',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '100',
            formatter: (row, column) => {
              let str = ''
              if (row.validType == 1) {
                str = '开船时间'
              } else if (row.validType == 5) {
                str = '进港时间'
              } else if (row.validType == 3) {
                str = '截关时间'
              } else if (row.validType == 4) {
                str = '还重柜时间'
              }
              return `<span class="${row.priceColor}">${str}</span>`
            }
          },
          {
            prop: 'publishdate',
            label: '发布时间',
            type: 'text',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            width: '150',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.publishdate}</span>`
            }
          },
          {
            prop: 'ispublish',
            label: '发布状态',
            width: '100',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.ispublish}</span>`
            }
          },
          {
            prop: 'iscommend',
            label: '推荐',
            type: 'text',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            value: '',
            width: '100',
            formatter: (row, column) => {
              if (row.iscommend === 'true') {
                return `<i class="el-icon-check ${row.priceColor}"></i>`
              } else {
                return ''
              }
            }
          },
          {
            prop: 'signflag',
            label: '符号',
            type: 'text',
            value: '',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            width: '100',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.signflag}</span>`
            }
          },
          {
            prop: 'ownerName',
            label: '维护人',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            value: '',
            width: '100',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.ownerName}</span>`
            }
          },
          {
            prop: 'baseprice1',
            label: `20'GP箱型底价`,
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              let str = row.ext_baseprice1 ? row.ext_baseprice1 : ''
              return `<span class="${row.priceColor}">${str}</span>`
            }
          },
          {
            prop: 'baseprice2',
            label: `40'GP箱型底价`,
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              let str = row.ext_baseprice2 ? row.ext_baseprice2 : ''
              return `<span class="${row.priceColor}">${str}</span>`
            }
          },
          {
            prop: 'baseprice3',
            label: `40'HQ箱型底价`,
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              let str = row.ext_baseprice3 ? row.ext_baseprice3 : ''
              return `<span class="${row.priceColor}">${str}</span>`
            }
          },
          {
            prop: 'sellprice1',
            label: `20'GP箱型成本价`,
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              let str = row.ext_sellprice1 ? row.ext_sellprice1 : ''
              return `<span class="${row.priceColor}">${str}</span>`
            }
          },
          {
            prop: 'sellprice2',
            label: `40'GP箱型成本价`,
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              let str = row.ext_sellprice2 ? row.ext_sellprice2 : ''
              return `<span class="${row.priceColor}">${str}</span>`
            }
          },
          {
            prop: 'sellprice3',
            label: `40'HQ箱型成本价`,
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              let str = row.ext_sellprice3 ? row.ext_sellprice3 : ''
              return `<span class="${row.priceColor}">${str}</span>`
            }
          },
          {
            prop: 'internetsellprice1',
            label: `20'GP箱型标准报价`,
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '180',
            formatter: (row, column) => {
              let str = row.ext_internetsellprice1
                ? row.ext_internetsellprice1
                : ''
              return `<span class="${row.priceColor}">${str}</span>`
            }
          },
          {
            prop: 'internetsellprice2',
            label: `40'GP箱型标准报价`,
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '180',
            formatter: (row, column) => {
              let str = row.ext_internetsellprice2
                ? row.ext_internetsellprice2
                : ''
              return `<span class="${row.priceColor}">${str}</span>`
            }
          },
          {
            prop: 'internetsellprice3',
            label: `40'HQ箱型标准报价`,
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '180',
            formatter: (row, column) => {
              let str = row.ext_internetsellprice3
                ? row.ext_internetsellprice3
                : ''
              return `<span class="${row.priceColor}">${str}</span>`
            }
          },
          {
            prop: 'baseprice4',
            label: `45'HQ箱型底价`,
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              let str = row.ext_baseprice4 ? row.ext_baseprice4 : ''
              return `<span class="${row.priceColor}">${str}</span>`
            }
          },
          {
            prop: 'sellprice4',
            label: `45'HQ箱型成本价`,
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              let str = row.ext_sellprice4 ? row.ext_sellprice4 : ''
              return `<span class="${row.priceColor}">${str}</span>`
            }
          },
          {
            prop: 'internetsellprice4',
            label: `45'HQ箱型报价`,
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              let str = row.ext_internetsellprice4
                ? row.ext_internetsellprice4
                : ''
              return `<span class="${row.priceColor}">${str}</span>`
            }
          },
          {
            prop: 'volumerange',
            label: '限重',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            width: '80',
            type: 'text',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.volumerange}</span>`
            }
          },
          {
            prop: 'rakeoff',
            label: '佣金',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '120',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.rakeoff}</span>`
            }
          },
          {
            prop: 'plusfeedesc',
            label: '附加费',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '250px',
            formatter: (row, column) => {
              let str = `<span class="underline">${row.plusfeedesc}</span>`
              return str
            },
            method: (index, row) => {
              this.casenumbers = row.foldPriceIds || row.casenumber
              this.dzgFileListPopShow = true
            }
          },
          {
            prop: 'linkinfo',
            label: '联系方式',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '150px',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.linkinfo}</span>`
            }
          },
          {
            prop: 'remark',
            label: '外部备注',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '100px',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.remark}</span>`
            }
          },
          {
            prop: 'employeeRemark',
            label: '内部备注',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '100px',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.employeeRemark}</span>`
            }
          },
          {
            prop: 'sendtype',
            label: '出单方式',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '100px',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.sendtype}</span>`
            }
          },
          {
            prop: 'suspendShippingService',
            label: '停航',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '100px',
            formatter: (row, column) => {
              if (row.suspendShippingService === 'true') {
                return `<i class="el-icon-check ${row.priceColor}"></i>`
              } else {
                return ''
              }
            }
          },
          {
            prop: 'sailingDate',
            label: '开航日',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '100px',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.sailingDate}</span>`
            }
          },
          {
            prop: 'expectedRise',
            label: '预计上涨',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '100px',
            formatter: (row, column) => {
              if (row.expectedRise == 'true') {
                return `<i class="el-icon-check ${row.priceColor}"></i>`
              }
            }
          },
          {
            prop: 'carrierRoute',
            label: '承运人航线',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '120px',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.carrierRoute}</span>`
            }
          },
          {
            prop: 'transportDays',
            label: '驳船航程',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '100px',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${
                row.transportDaysFold || row.transportDays
                  ? row.transportDaysFold || row.transportDays
                  : ''
              }</span>`
            }
          },
          {
            prop: 'effectiveDate',
            label: '驳船有效期(开始)',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '150px',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${
                row.effectiveDate ? row.effectiveDate.substring(0, 10) : ''
              }</span>`
            }
          },
          {
            prop: 'invalidDate',
            label: '驳船有效期(结束)',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '150px',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${
                row.invalidDate ? row.invalidDate.substring(0, 10) : ''
              }</span>`
            }
          },
          {
            prop: 'transitClause',
            label: '运输条款',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '100px',
            formatter: (row, column) => {
              let str = ''
              if (row.transitClause) {
                str = `${row.transitClause}`
              }
              return `<span class="${row.priceColor || 'black'}">${str.replace(
                /&&&&/g,
                ''
              )}</span>`
            }
          },
          {
            prop: 'transferSailtime',
            label: '中转航程',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '100px',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${
                row.transferSailtime || row.transferSailtimeFold
                  ? row.transferSailtime || row.transferSailtimeFold
                  : ''
              }</span>`
            }
          },
          {
            prop: 'inlandTransferMode',
            label: '中转方式',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '100px',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.inlandTransferMode}</span>`
            }
          },
          {
            prop: 'transferFeeMode',
            label: 'ALL IN',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '100px',
            formatter: (row, column) => {
              if (row.transferFeeMode == 2) {
                return `<i class="el-icon-check ${row.priceColor}"></i>`
              }
            }
          },
          {
            prop: 'priceHolder',
            label: '拿价人',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '100px',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.priceHolder}</span>`
            }
          },
          {
            prop: 'priceHolderOrgName',
            label: '拿价公司',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '200px',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.priceHolderOrgName}</span>`
            }
          },
          {
            prop: 'cutTime',
            label: '截文件',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '100px',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.cutTime}</span>`
            }
          },
          {
            prop: 'freeTime',
            label: '免用免堆',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '150px',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.freeTime}</span>`
            }
          },
          {
            prop: 'bargeCycle',
            label: '驳船船期',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '100px',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.bargeCycle}</span>`
            }
          },
          {
            prop: 'transferport2',
            label: '中转港2',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '100px',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.transferport2}</span>`
            }
          },
          {
            prop: 'transferport3',
            label: '中转港3',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '100px',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.transferport3}</span>`
            }
          },
          {
            prop: 'addfee',
            label: '附加费说明',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '120px',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.addfee}</span>`
            }
          },
          {
            prop: 'billType',
            label: '提单类型',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '100px',
            formatter: (row, column) => {
              let str = `${row.billType}`
              return `<span class="${row.priceColor}">${str.replace(
                /&&&&/g,
                ''
              )}</span>`
            }
          },
          {
            prop: 'businessRemark',
            label: '收货指引',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '100px',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.businessRemark}</span>`
            }
          },
          {
            prop: 'modifyby',
            label: '修改人',
            sortable: 'custom',
            align: 'left',
            'header-align': 'left',
            type: 'text',
            width: '100px',
            formatter: (row, column) => {
              return `<span class="${row.priceColor}">${row.modifyby}</span>`
            }
          }
        ],

        // 操作按钮组
        operationBtns: {
          minWidth: '150px',
          fixed: 'right',
          show: true,
          callback: (action, $index, row, item, $event) => {
            this.work_table_id = row.work_table_id
            if (action === 'Create') {
              this.handleCreate(row)
            }
            if (action === 'Detail') {
              this.handleDetail(row)
            }
          },
          data: [
            {
              label: '详情',
              type: 'text',
              show: (item, row) => {
                if (row.foldCasenumber) {
                  return false
                } else {
                  return true
                }
              },
              action: 'Detail'
            },
            {
              label: '生成订单',
              type: 'text',
              show: (item, row) => {
                if (
                  row.foldCasenumber ||
                  this.tableQuery.connonQueryValue == '11'
                ) {
                  return false
                } else {
                  return true
                }
              },
              action: 'Create'
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
          show: false,
          isDzgTabel: true,
          total: 0
        }
      },
      // 显示自定义表头的弹窗状态
      customColumnsPopShow: false,
      // 新建订单弹窗
      routeId: '',
      isFeederRoute: 'y',
      feederRouteId: undefined,
      createOrderPopShow: false,
      isClickInfo: false,
      resDefaConfList: [], // 后端配置的默认搜索模板
      tableColumnsWidthList: []
    }
  },
  created() {
    // this.getSearchConditionInfo()
    this.getList()
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      shipTerms: (state) => state.dict.dictMap.shipTerms,
      publishStatus: (state) => state.dict.dictMap.publishStatus,
      routeQuery: (state) => state.charge.dzgRouteQuery,
      defaultColumns: (state) => state.charge.dzgRouteQuery.defaultColumns,
      specialColumns: (state) => state.charge.dzgRouteQuery.specialColumns,
      columnsBase: (state) => state.charge.dzgRouteQuery.columnsBase
    })
  },
  components: {
    Search,
    AddFilter,
    BaseTableMuti,
    TableFilter,
    BaseDialog,
    CustomColumns,
    TableColumnPopover,
    ScheduleColumnPopover,
    CreateOrder,
    DzgFreightRateDetail,
    FileList,
    DzgPagination
  },
  methods: {
    setChildren(children, type) {
      // 编辑多个子层级
      children.map((j) => {
        this.toggleSelection(j, type)
        if (j.children) {
          this.setChildren(j.children, type)
        }
      })
    },
    toggleSelection(row, select) {
      if (row) {
        this.$nextTick(() => {
          console.log(this.$refs.dagIndexTable)
          this.$refs.dagIndexTable &&
            this.$refs.dagIndexTable.$refs.multipleTable.$refs.tableLayout.toggleRowSelection(
              row,
              select
            )
        })
      }
    },
    // 选中父节点时，子节点一起选中取消
    selectFn(selection, row) {
      console.log(selection, row)
      let hasSelect = selection.some((el) => {
        return row.id === el.id
      })
      if (hasSelect) {
        if (row.children) {
          // 解决子组件没有被勾选到
          this.setChildren(row.children, true)
        }
      } else {
        if (row.children) {
          this.setChildren(row.children, false)
        }
      }
    },
    selectAll(selection) {
      let isSelect = selection.some((el) => {
        let tableDataIds = this.tableConfig.list.map((j) => j.id)
        return tableDataIds.includes(el.id)
      })
      let isCancel = !this.tableConfig.list.every((el) => {
        let selectIds = selection.map((j) => j.id)
        return selectIds.includes(el.id)
      })
      if (isSelect) {
        selection.map((el) => {
          if (el.children) {
            // 解决子组件没有被勾选到
            this.setChildren(el.children, true)
          }
        })
      }
      if (isCancel) {
        this.tableConfig.list.map((el) => {
          if (el.children) {
            // 解决子组件没有被勾选到
            this.setChildren(el.children, false)
          }
        })
      }
    },
    unique(arr, val) {
      // 去重
      const res = new Map()
      return arr.filter((item) => !res.has(item[val]) && res.set(item[val], 1))
    },
    polCityQuerySearch(queryString, state, item) {
      this.$store
        .dispatch('dict/newBasePortCityList', { queryString, state })
        .then((data) => {
          // let portList = data
          //   .map((ele) => {
          //     return Object.assign(ele, {
          //       label: ele.cityCname,
          //       value: ele.cityCname
          //     })
          //   })
          //   .filter((el) => el.value && el.value !== '城市')

          // item.data = this.unique(portList, 'value')

          let filterArr = data.filter(
            (ele) => !item.saveList.find((o) => o.value === ele.cityCname)
          )
          let itemList = filterArr.map((ele) => {
            return { ...ele, label: ele.cityCname, value: ele.cityCname }
          })
          let list = [...item.saveList, ...itemList].filter(
            (el) => el.value && el.value !== '城市'
          )
          console.log(item)
          item.data = this.unique(list, 'value')
        })
    },
    tabelDataLoad(tree, treeNode, resolve) {
      // 加载下拉子数据
      let params = {
        foldCasenumbers: tree.foldCasenumber,
        connonQueryValue: this.tableQuery.connonQueryValue
      }
      dzgPgSonList(params).then((res) => {
        let sonData = res.data
        sonData.forEach((item, index) => {
          item.id = Math.random().toString(36).slice(-6)
          item.parentId = tree.id
        })
        tree.children = sonData || []
        for (let i = 0; i < this.selectedCheckbox.length; i++) {
          if (this.selectedCheckbox[i].id == tree.id) {
            this.selectFn(this.tableConfig.list, tree)
          }
        }
        resolve(sonData || [])
      })
    },
    // vxe-table 树形table懒加载树方法
    vxeTableLoadChildren(row, resolve) {
      // 加载下拉子数据
      let params = {
        foldCasenumbers: row.foldCasenumber,
        connonQueryValue: this.tableQuery.connonQueryValue
      }
      dzgPgSonList(params).then((res) => {
        let sonData = res.data
        sonData.forEach((item, index) => {
          item.id = Math.random().toString(36).slice(-6)
          item.parentId = row.id
        })
        // console.log('this.tableConfig.list', this.tableConfig.list);
        resolve(sonData || [])
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
    },
    // 增加一条搜索条件
    handleAddFilter() {
      this.searchInputGroup.push({ value: '', key: '', queryValue: '' })
      //console.log('新增一条：', this.searchInputGroup)
    },

    // 获取订舱代理
    getSupplierList(type, queryString, item) {
      this.$store
        .dispatch('dict/queryBkgAgentSupplierList', {
          category: 'category',
          value: 'bkg_carrier,bkg_agent',
          queryString: queryString,
          categoryType: 'in'
        })
        .then((data) => {
          // item.data = data.list.map((ele) => {
          //   return Object.assign(ele, {
          //     label: this.$language == 'en' ? ele.ename : ele.name,
          //     value: this.$language == 'en' ? ele.ename : ele.name
          //   })
          // })

          let filterArr = data.list.filter(
            (ele) => !item.saveList.find((o) => o.value === ele.name)
          )
          let itemList = filterArr.map((ele) => {
            return { ...ele, label: ele.name, value: ele.name }
          })
          console.log(item)
          item.data = [...item.saveList, ...itemList]
        })
    },

    // 远程搜索港口下拉数据
    portSearch(queryString, portAttribute, state, type, item) {
      this.$store
        .dispatch('dict/basePortList', { queryString, portAttribute, state })
        .then((data) => {
          // let portList = data.map((ele) => {
          //   return Object.assign(ele, {
          //     label: ele.value,
          //     value: ele.key
          //   })
          // })

          // item.data = portList
          let filterArr = data.filter(
            (ele) => !item.saveList.find((o) => o.value === ele.ename)
          )
          let itemList = filterArr.map((ele) => {
            return { ...ele, label: ele.value, value: ele.ename }
          })
          item.data = [...item.saveList, ...itemList]
        })
    },

    // 系统航线下拉列表自动补充的数据
    sysLineQuerySearch(queryString, item) {
      this.$store
        .dispatch('dict/baseSystemLineList', { name: queryString, state: '' })
        .then((data) => {
          // item.data = data.map((ele) => {
          //   return Object.assign(ele, {
          //     label: ele.value,
          //     value: ele.value
          //   })
          // })

          let filterArr = data.filter(
            (ele) => !item.saveList.find((o) => o.value === ele.value)
          )
          let itemList = filterArr.map((ele) => {
            return { ...ele, label: ele.value, value: ele.value }
          })
          item.data = [...item.saveList, ...itemList]
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
          // item.data = data.map((ele) => {
          //   return Object.assign(ele, {
          //     label: ele.value,
          //     value: ele.key
          //   })
          // })
          let filterArr = data.filter(
            (ele) => !item.saveList.find((o) => o.value === ele.key)
          )
          let itemList = filterArr.map((ele) => {
            return { ...ele, label: ele.value, value: ele.key }
          })
          item.data = [...item.saveList, ...itemList]
        })
    },
    // 国家信息模糊查询
    countryQuerySearch(queryString, item) {
      let params = {}
      Object.assign(params, {
        countryCode: queryString,
        state: 'valid'
      })
      countrySelectList(params).then((response) => {
        // item.data =
        //   (response.data &&
        //     response.data.map((o) => {
        //       return {
        //         label: o.cname,
        //         value: o.cname
        //       }
        //     })) ||
        //   []
        let data = response.data || []
        let filterArr = data.filter(
          (ele) => !item.saveList.find((o) => o.value === ele.cname)
        )
        let itemList = filterArr.map((ele) => {
          return { ...ele, label: ele.cname, value: ele.cname }
        })
        item.data = [...item.saveList, ...itemList]
      })
    },

    // 运输条款下拉列表自动补充的数据
    shipTermsQuerySearch(queryString, item) {
      this.$store
        .dispatch('dict/baseShipTermsList', queryString)
        .then((data) => {
          item.data = data.map((ele) => {
            return Object.assign(ele, {
              label: ele.value,
              value: ele.key
            })
          })
        })
    },

    // 拿价人
    pricerQuerySearch(queryString, item) {
      let params = {}
      Object.assign(params, {
        name: queryString,
        state: 'valid'
      })
      this.$store.dispatch('dict/employeeSelectlist', params).then((data) => {
        // item.data = data.map((ele) => {
        //   return Object.assign(ele, {
        //     label: ele.value,
        //     value: ele.value
        //   })
        // })

        let filterArr = data.filter(
          (ele) => !item.saveList.find((o) => o.value === ele.value)
        )
        let itemList = filterArr.map((ele) => {
          return { ...ele, label: ele.value, value: ele.value }
        })
        item.data = [...item.saveList, ...itemList]
      })
    },
    changePageNum(value) {
      this.getList()
    },
    changePageSize(value) {
      this.tableQuery.currPage = 1
      this.dzgPaginationConfig.currPage = 1
      this.getList()
    },
    // 列表数据
    async getList() {
      this.loading = true
      // 合并发布状态参数
      let statusQuery = [
        {
          column: 'connonQueryValue',
          type: 'eq',
          value: this.tableQuery.connonQueryValue
        },
        { column: 'bargeQuery', type: 'eq', value: this.tableQuery.bargeQuery }
      ]
      let data = {}
      Object.assign(data, this.tableQuery, {
        query: this.tableQuery.query
      })
      Object.assign(data, this.tableQuery, {
        query: this.tableQuery.query.concat(statusQuery)
      })
      delete data.connonQueryValue
      delete data.bargeQuery
      data.pageSize = this.dzgPaginationConfig.pageSize
      data.currPage = this.dzgPaginationConfig.currPage
      if (data.ascColumns.length) {
        data.sortBy = 'asc'
        data.sortColumn = data.ascColumns[0]
      } else if (data.descColumns.length) {
        data.sortBy = 'desc'
        data.sortColumn = data.descColumns[0]
      }
      let result = await columnWidthConfigInfo({
        scenesCode: this.$route.name
      })
      let { columnWidthList } = result.data
      dzgPgList(data)
        .then((response) => {
          let {
            list,
            totalCount,
            configColumns,
            pageSize,
            currPage,
            hasNextPage,
            hasPreviousPage,
            isFirstPage,
            isLastPage
          } = response.data

          this.dzgPaginationConfig.totalCount = totalCount
          this.dzgPaginationConfig.currPage = currPage
          this.dzgPaginationConfig.hasPreviousPage = hasPreviousPage
          this.dzgPaginationConfig.hasNextPage = hasNextPage
          this.dzgPaginationConfig.pageSize = pageSize
          this.dzgPaginationConfig.isFirstPage = isFirstPage
          this.dzgPaginationConfig.isLastPage = isLastPage

          this.tableQuery.pageSize = pageSize
          //处理返回的数据，映射关系
          this.tableConfig.list = list
          for (let i = 0; i < this.tableConfig.list.length; i++) {
            if (this.tableConfig.list[i].foldCasenumber) {
              this.tableConfig.list[i].hasChildren = true
              this.tableConfig.list[i].children = []
              this.tableConfig.list[i].id = Math.random().toString(36).slice(-6)
            } else {
              this.tableConfig.list[i].hasChildren = false
              this.tableConfig.list[i].id = Math.random().toString(36).slice(-6)
            }
          }
          this.tableConfig.configColumns = configColumns.length
            ? configColumns
            : this.defaultColumns
          this.tableConfig.pagination.total = totalCount
          this.handleFilterColumns(this.tableConfig.configColumns)
          this.loading = false
          this.tableConfig.columns.map((item, index) => {
            item.treeNode = false
            // 第一列设置为树节点，懒加载展开列
            if (index === 0 && this.tableConfig.list.some(ele => ele.hasChildren)) {
              item.treeNode = true
            }
            // 取服务器返回的宽度
            let findItem = columnWidthList.find(
              (ele) => ele.column === item.prop
            )
            let newWidth = findItem ? findItem.width : ''
            return Object.assign(item, { width: newWidth || item.width })
          })
          this.tableColumnsWidthList = this.getTableColumnsWidth()
        })
        .catch(() => {
          this.tableConfig.list = []
          this.loading = false
        })
    },
    // 查询组件回调
    searchCallBack(action, param) {
      let query = []

      if (action === 'Search') {
        //默认的查询条件组装tableQuery参数
        if (this.searchConfig.length) {
          this.searchConfig.forEach((item, index) => {
            let tempQuery = {}

            if (item.value) {
              Object.assign(tempQuery, {
                column: item.key,
                type: item.searchType || 'eq',
                value: item.queryValue
              })
              query.push(tempQuery)
            }
          })
        }

        // 新增的查询条件组装tableQuery参数
        if (this.searchInputGroup.length) {
          this.searchInputGroup.forEach((item, index) => {
            let tempItem = {}

            if (item.value) {
              Object.assign(tempItem, {
                column: item.key,
                type: this.filterGroups[item.key].searchType || 'eq'
              })

              // 非自动补全的查询参数从item.value中取值合并到tableQuery
              if (this.filterGroups[item.key].type !== 'autocomplete') {
                Object.assign(tempItem, {
                  value: item.value
                })

                // 时间区间，beginDate开始时间区数组第一个
                if (item.key === 'beginDate') {
                  Object.assign(tempItem, {
                    value: item.value ? item.value[0] : ''
                  })
                }

                // if (item.key === 'transitPortCodes') {
                //   Object.assign(tempItem, {
                //     "value": item.value ? item.value.toString() : ''
                //   })
                // }
                // 多选
                if (
                  // this.filterGroups[item.key].type === 'remoteSelect' &&
                  this.filterGroups[item.key].multiple
                ) {
                  Object.assign(tempItem, {
                    column: item.key,
                    type: this.filterGroups[item.key].searchType || 'eq',
                    value: item.value ? item.value.join('#') : ''
                  })
                }
              }

              // 自动补全的查询参数从item.queryvalue中取值合并到query
              if (this.filterGroups[item.key].type === 'autocomplete') {
                Object.assign(tempItem, {
                  value: item.queryValue
                })
              }
              query.push(tempItem)

              // 时间区间组件要传两个参数，['beginDate','endDate'],endDate取数组后一个
              if (item.key === 'beginDate') {
                query.push({
                  column: 'endDate',
                  type: 'eq',
                  value: item.value ? item.value[1] : ''
                })
              }
              // console.log('query:', query);
            }
          })
        }

        Object.assign(this.tableQuery, {
          query: query.filter((item) => {
            return item.value
          }),
          currPage: 1
        })
        this.tableQuery.currPage = 1
        this.dzgPaginationConfig.currPage = 1
        this.getList()
      }

      if (action === 'Reset') {
        // if (param.composeKey) {
        //   this.setSearchCondition(param.composeKey)
        // } else {
        //   // 后端有配置默认模板
        //   if (this.resDefaConfList.length) {
        //     let composeKey = this.resDefaConfList[0].composeKey
        //     this.setSearchCondition(composeKey, this.resDefaConfList)
        //   } else {
        //     // 后端无配置默认模板
        //     this.searchInputGroup = JSON.parse(
        //       JSON.stringify(defaultSearchInputGroup)
        //     )
        //   }
        // }
        this.handleSearchValueReset()
        // let connonQueryValue = this.tableQuery.connonQueryValue
        // let bargeQuery = this.tableQuery.bargeQuery
        // Object.assign(this.tableQuery, defaultTableQuery, defaultPage)
        // this.tableQuery.currPage = 1
        // this.dzgPaginationConfig.currPage = 1
        // this.tableQuery.connonQueryValue = connonQueryValue
        // this.tableQuery.bargeQuery = bargeQuery
        // this.getList()
        // this.callback('Reset')
      }
      // 模板加载后修改搜索组件的数组
      if (action === 'Update') {
        if (!param.length) return this.initSearch()
        this.searchInputGroup = [...param]
      }
    },
    // 重置
    handleSearchValueReset() {
      this.searchInputGroup.map((item) => {
        item.value = ''
        return { ...item }
      })
    },
    // 后端没有配置模板
    initSearch() {
      this.searchInputGroup = JSON.parse(
        JSON.stringify(defaultSearchInputGroup)
      )
    },
    handleSearchValueReset() {
      this.searchInputGroup.map((item) => {
        item.value = ''
        return { ...item }
      })
      // console.log('重置')
    },
    // 导出
    handleExport() {
      if (!this.selectedCheckbox.length) {
        this.$message.error('请先选择')
      }
    },
    // 自定义表头
    handleCustomColumns() {
      this.customColumnsPopShow = true
    },

    // 发布状态筛选
    handleSearchStatus() {
      this.tableQuery.currPage = 1
      this.dzgPaginationConfig.currPage = 1
      this.getList()
    },
    // 多选
    handleMuti(arr) {
      let newArr = [...arr]
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].hasChildren) {
          newArr = newArr.concat(arr[i].children)
        }
      }
      this.selectedCheckbox = newArr
    },

    handleSizeChang() {
      this.getList()
    },

    handleCurrentChange(val) {
      // 刷新页面的先调自定义搜索查询接口，拿到自定义的搜索条件再调getList接口
      if (val) {
        this.tableQuery.currPage = val
      }
      this.getList()
    },
    handleSizeChange() {
      this.getList()
    },
    // 表格操作回调
    tableCallBack(action, arr) {
      // console.log(action, arr)
      let fn = this['handle' + action]
      // Add、Export、CustomColumns、ChangeLockState、Muti、SizeChange、CurrentChange、SingleEdit
      // MultiEdit、 MultiPublish、MultiInvalid、MultiDelete
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
    handleDetail(row) {
      this.detailData = row
      this.dzgFreightRateDetailPopShow = true
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

    // 获取特殊处理的自定义表头，例：polCode,需要传polCode,polEname,polCname,podCode, podEname,podCname给后端
    getColumnsValues(value) {
      let result = [
        'routeId',
        'sameFlagCode',
        'feederRouteId',
        'recommendLevel'
      ]
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
    // 生成订单
    handleCreate(row) {
      this.currentData = row
      this.createOrderPopShow = true
    },

    // 新建订单关闭回调
    createOrderPopClose(action, value, includeFeederType) {
      if (action === 'Confirm') {
        this.handleCreateOrder(value, includeFeederType)
        this.createOrderPopShow = false
        this.dzgFreightRateDetailPopShow = false
      } else {
        this.createOrderPopShow = false
      }
    },
    dzgFreightRateDetailPopClose(action) {
      if (action === 'Cancel') {
        this.dzgFreightRateDetailPopShow = false
      }
    },
    dzgFileListPopClose(action) {
      if (action === 'Cancel') {
        this.dzgFileListPopShow = false
      }
    },
    // 新建订单保存
    handleCreateOrder(value, includeFeederType) {
      delete value.sailingDate
      let params = JSON.parse(JSON.stringify(value))
      params.porPortCode = this.currentData.recaddressEnname // 收货地
      params.polPortCode = this.currentData.loadport // 起运港
      params.podPortCode = this.currentData.dischargeport //目的港
      params.shipCarrierCode = this.currentData.carrier //船公司
      params.freeTime = this.currentData.freeTime // 免用免推
      params.priceEmployeeName = this.currentData.priceHolder // 拿价人

      params.validDateBegin = this.currentData.begindate
        ? this.currentData.begindate.substring(0, 10)
        : ''
      params.validDateEnd = this.currentData.validdate
        ? this.currentData.validdate.substring(0, 10)
        : ''

      params.bargeValidDateBegin = this.currentData.effectiveDate
        ? this.currentData.effectiveDate.substring(0, 10)
        : ''
      params.bargeValidDateEnd = this.currentData.invalidDate
        ? this.currentData.invalidDate.substring(0, 10)
        : ''

      let podPortCodeArr = []
      if (
        this.currentData.transferport &&
        this.currentData.transferport !== '-'
      ) {
        podPortCodeArr.push(this.currentData.transferport)
      }
      if (
        this.currentData.transferport2 &&
        this.currentData.transferport2 !== '-'
      ) {
        podPortCodeArr.push(this.currentData.transferport2)
      }
      if (
        this.currentData.transferport3 &&
        this.currentData.transferport3 !== '-'
      ) {
        podPortCodeArr.push(this.currentData.transferport3)
      }
      params.transitPortCode = podPortCodeArr.join(',')
      console.log(params)
      dzgChargeCreate(params).then((res) => {
        let { orderNo, serviceType } = res.data
        sessionStorage.setItem('createOrderStr', JSON.stringify(res.data))
        this.createOrderPopShow = false
        this.isJumpRouteFromPage = true
        // this.$router.push({
        //   name: 'OrderDetail',
        //   params: {
        //     orderNo
        //   },
        //   query: {
        //     orderNo,
        //     source: 'cargoGmSeaFreight',
        //     action: 'add',
        //     includeFeeder: includeFeederType,
        //     showContainer: !['st03', 'st04'].includes(serviceType),
        //     showBl: ['st01', 'st03'].includes(serviceType)
        //   }
        // })
        let routeUrl = this.$router.resolve({
          name: 'OrderDetail',
          params: {
            orderNo
          },
          query: {
            orderNo,
            source: 'cargoGmSeaFreight',
            action: 'add',
            includeFeeder: includeFeederType,
            showContainer: !['st03', 'st04'].includes(serviceType),
            showBl: ['st01', 'st03'].includes(serviceType)
          }
        })
        window.open(routeUrl.href, '_blank')
      })
    }
  }
}
</script>

<style lang="scss">
.dzg-sea-freight .el-table__expand-icon {
  display: block !important;
  position: absolute;
}
.table-layout.dzg-sea-freight .column-text {
  display: block;
}
.dzg-sea-freight .el-table__row--level-1 {
  background-color: #e7eeff !important;
  &.row--checked{
    background: #bde2fc !important;
    td{
      background: #bde2fc !important;
    }
  }
  td {
    background-color: #e7eeff !important;
  }
  .cell {
    height: 24px;
    .el-table__indent {
      display: none;
    }
    .el-table__placeholder {
      display: none;
    }
    .column-text {
      height: 100%;
      line-height: 24px;
    }
  }
}
</style>
