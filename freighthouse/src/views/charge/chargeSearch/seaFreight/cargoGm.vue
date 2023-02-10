<template>
  <div class="app-container">
    <div class="search-container">
      <Search :config.sync="searchConfig" :searchConditionConfig="searchConditionList" :callback="searchCallBack" :tableQuery.sync="tableQuery">
        <!-- 新增条件下拉查询 -->
        <AddFilter :searchConfig="searchConfig" :defaultSearchLength="defaultSearchLength" :searchInputGroup="searchInputGroup" :item="item" :index="index" :filterGroups="filterGroups" v-for="(item, index) in searchInputGroup" :key="'filter' + index" />
        <div class="btn-plus-search" @click="handleAddFilter"></div>
      </Search>
    </div>

    <div class="table-container">
      <TableFilter :config="tableConfig" :publishStatusOptions="publishStatusOptions" :tableQuery.sync="tableQuery" :callback="tableCallBack" />

      <BaseTableMuti v-loading="loading" class="seaFreight" :tableQuery.sync="tableQuery" :config="tableConfig" :callback="tableCallBack" />
    </div>

    <!-- 自定义表头 -->
    <div v-if="customColumnsPopShow">
      <CustomColumns :columnsBase="columnsBase" :configColumns="tableConfig.configColumns" @close="customColumnsPopClose" />
    </div>

    <!-- 生成订单弹窗 -->
    <div v-if="createOrderPopShow">
      <CreateOrder :currentData="currentData" @close="createOrderPopClose" />
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import Search from '@/components/Base/Search/index'
import BaseTableMuti from '@/components/Base/Table/tableMuti'
import TableFilter from './components/tableFilter'
import AddFilter from './components/addFilter'
// 弹出框
import BaseDialog from '@/components/Base/Dialog/index'
import CustomColumns from '@/components/customColumns/index'
import { dzgRouteList } from '@/api/charge/route'
import { dzgChargeCreate } from '@/api/order/list'
import TableColumnPopover from './components/tableColumnPopover'
import ScheduleColumnPopover from './components/scheduleColumnPopover'
import clipboard from '@/directive/clipboard/index.js'
import CreateOrder from './components/cargoGmCreateOrder'
import {
  searchConditionInfo,
  searchConditionSave,
  searchConditionDelete,
  countrySelectList,
  columnWidthConfigSave,
  columnWidthConfigInfo
} from '@/api/base'
const defaultPage = {
  pageSize: -1,
  currPage: 1
}

const defaultTableQuery = {
  ascColumns: [],
  descColumns: [],
  columns: [],
  query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
  state: 'published'
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
  }
  // {
  //   key: 'country',
  //   value: '',
  //   placeholder: '筛选条件',
  //   category: 'all',
  //   queryValue: ''
  // }
]

export default {
  mixins: [routerMixin],
  directives: {
    clipboard
  },
  data() {
    return {
      currentData: {},
      loading: true,
      state: '',
      showVal: null,
      defaultStyle: {
        width: '100%'
      },
      searchConditionList: [], // 自定义搜索模板集合
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
          value: '',
          // multiple: true,
          'collapse-tags': true,
          data: [],
          nonDictionary: true,
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
          searchType: 'like',
          value: '',
          // multiple: true,
          'collapse-tags': true,
          data: [],
          nonDictionary: true,
          queryValue: '',
          visibleChange: (val, item) => {
            this.portSearch('', 'port_of_basic', this.state, 'loadport', item)
          },
          filterMehod: (val, item) => {
            this.portSearch(val, 'port_of_basic', this.state, 'loadport', item)
          },
          change: (val, item) => {
            let findItem = item.data.find((ele) => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        },
        transferport: {
          key: 'transferport',
          label: '中转港',
          type: 'remoteSelect',
          searchType: 'like',
          value: '',
          multiple: true,
          'collapse-tags': true,
          data: [],
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
            let findItem = item.data.find((ele) => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        },
        dischargeport: {
          key: 'dischargeport',
          label: '目的港',
          type: 'remoteSelect',
          searchType: 'like',
          value: '',
          // multiple: true,
          'collapse-tags': true,
          data: [],
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
            let findItem = item.data.find((ele) => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        },
        carrier: {
          key: 'carrier',
          label: '船公司',
          type: 'autocomplete',
        	searchType: 'like',
        	value: '',
        	queryValue: '',
        	querySearch: (queryString, cb) => {
        		this.$store.dispatch('dict/baseShippingCarrierList', { name: queryString }).then(data => {
        			cb(data)
        		})
        	},
          select: (value, item) => {
						Object.assign(item, {
							queryValue: value.key
						})
					},
					change: (value, item) => {
						Object.assign(item, {
							queryValue: value
						})
					},
        	clear: (value, item) => {
        		Object.assign(item, {
        			queryValue: ''
        		})
        	}
        },
        // country: {
        //   key: 'country',
        //   label: '国家',
        //   type: 'remoteSelect',
        //   value: '',
        //   data: [],
        //   nonDictionary: true,
        //   searchType: 'eq',
        //   visibleChange: (val, item) => {
        //     val && this.countryQuerySearch('', item)
        //   },
        //   filterMehod: (val, item) => {
        //     this.countryQuerySearch(val, item)
        //   },
        //   change: (val, item) => {
        //     Object.assign(item, {
        //       queryValue: val,
        //       text: val
        //     })
        //   }
        // },
        searoute: {
          key: 'searoute',
          label: '航线',
          type: 'remoteSelect',
          value: '',
          queryValue: '',
          data: [],
          nonDictionary: true,
          searchType: 'eq',
          visibleChange: (val, item) => {
            this.sysLineQuerySearch('', item)
          },
          filterMehod: (val, item) => {
            this.sysLineQuerySearch(val, item)
          },
          change: (val, item) => {
            let findItem = item.data.find((ele) => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        },
        searouteCode: {
          key: 'searouteCode',
          label: '航线代码',
          type: 'input',
          value: '',
          searchType: 'like'
        },
        // signflag: {
        //   key: 'signflag',
        //   label: '符号',
        //   type: 'input',
        //   value: '',
        //   searchType: 'like'
        // },
        // quoteorg: {
        //   key: 'quoteorg',
        //   label: '订舱代理',
        //   type: 'remoteSelect',
        //   searchType: 'eq',
        //   value: '',
        //   data: [],
        //   nonDictionary: true,
        //   visibleChange: (val, item) => {
        //     this.getSupplierList('bkg_agent', '', item)
        //   },
        //   filterMehod: (val, item) => {
        //     this.getSupplierList('bkg_agent', val, item)
        //   },
        //   change: (val, item) => {
        //     let findItem = item.data.find((ele) => ele.value === val)
        //     Object.assign(item, {
        //       queryValue: val,
        //       text: findItem ? findItem.label : ''
        //     })
        //   }
        // },
        // iscommend: {
        //   key: 'iscommend',
        //   label: '推荐',
        //   type: 'select',
        //   value: '',
        //   data: [
        //     { label: '否', value: '否' },
        //     { label: '是', value: '是' }
        //   ],
        //   nonDictionary: true
        // },
        validdate: {
          label: '有效日期',
          key: 'validdate',
          type: 'date',
          value: '',
          // category: 'daterange',
          format: 'yyyy-MM-dd',
          searchType: 'eq'
        },
        publishdate: {
          label: '发布日期',
          key: 'publishdate',
          type: 'date',
          value: '',
          // category: 'daterange',
          format: 'yyyy-MM-dd',
          searchType: 'eq'
        },
        // modifydate: {
        //   label: '修改日期',
        //   key: 'modifydate',
        //   type: 'date',
        //   value: '',
        //   // category: 'daterange',
        //   format: 'yyyy-MM-dd',
        //   searchType: 'eq'
        // },
        // carrierRoute: {
        //   key: 'carrierRoute',
        //   label: '承运人航线',
        //   type: 'select',
        //   value: '',
        //   queryValue: '',
        //   data: [],
        //   nonDictionary: true
        //   // searchType: 'eq',
        //   // visibleChange: (val, item) => {
        //   //   this.sysLineQuerySearch('', item)
        //   // },
        //   // filterMehod: (val, item) => {
        //   //   this.sysLineQuerySearch(val, item)
        //   // },
        //   // change: (val, item) => {
        //   //   let findItem = item.data.find((ele) => ele.value === val)
        //   //   Object.assign(item, {
        //   //     queryValue: val,
        //   //     text: findItem ? findItem.label : ''
        //   //   })
        //   // }
        // }
        // priceColor: {
        //   key: 'priceColor',
        //   label: '颜色',
        //   type: 'select',
        //   value: '',
        //   data: [
        //     { label: '黑色', value: 'black' },
        //     { label: '蓝色', value: 'blue' },
        //     { label: '红色', value: 'red' },
        //     { label: '绿色', value: 'green' }
        //   ],
        //   nonDictionary: true
        // }
        // ownerName: {
        //   key: 'ownerName',
        //   label: '维护人',
        //   type: 'remoteSelect',
        //   value: '',
        //   queryValue: '',
        //   data: [],
        //   nonDictionary: true,
        //   searchType: 'eq',
        //   visibleChange: (val, item) => {
        //     this.pricerQuerySearch('', item)
        //   },
        //   filterMehod: (val, item) => {
        //     this.pricerQuerySearch(val, item)
        //   },
        //   change: (val, item) => {
        //     let findItem = item.data.find((ele) => ele.value === val)
        //     Object.assign(item, {
        //       queryValue: val,
        //       text: findItem ? findItem.label : ''
        //     })
        //   }
        // },
        // modifyby: {
        //   key: 'modifyby',
        //   label: '修改人',
        //   type: 'remoteSelect',
        //   value: '',
        //   queryValue: '',
        //   data: [],
        //   nonDictionary: true,
        //   searchType: 'eq',
        //   visibleChange: (val, item) => {
        //     this.pricerQuerySearch('', item)
        //   },
        //   filterMehod: (val, item) => {
        //     this.pricerQuerySearch(val, item)
        //   },
        //   change: (val, item) => {
        //     let findItem = item.data.find((ele) => ele.value === val)
        //     Object.assign(item, {
        //       queryValue: val,
        //       text: findItem ? findItem.label : ''
        //     })
        //   }
        // },
        // priceHolder: {
        //   key: 'priceHolder',
        //   label: '拿价人',
        //   type: 'remoteSelect',
        //   value: '',
        //   queryValue: '',
        //   data: [],
        //   nonDictionary: true,
        //   searchType: 'eq',
        //   visibleChange: (val, item) => {
        //     this.pricerQuerySearch('', item)
        //   },
        //   filterMehod: (val, item) => {
        //     this.pricerQuerySearch(val, item)
        //   },
        //   change: (val, item) => {
        //     let findItem = item.data.find((ele) => ele.value === val)
        //     Object.assign(item, {
        //       queryValue: val,
        //       text: findItem ? findItem.label : ''
        //     })
        //   }
        // }
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
        options: {
          // api: this.$api.system.user.list,
          // 是否支持解锁列表修改
          lockState: true,

          // 是否支持列表项选中功能
          mutiSelect: true,

          // 多选框状态判断 {false不可选, true可选}
          checkSelectable() {
            return true
          },

          // 行key,用于行展开
          rowKeyId: 'rowKey',
          //定义children名字
          treeProps: {
            children: 'subRouteList',
            hasChildren: 'hasChildren'
          }
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
            // sortable: 'custom',
            type: 'text'
            // formatter: (row, column) => {
            //   let text=row.loadport
            //   let className=row.priceColor?row.priceColor:''
            //   return `<el-button type="text" class="${className}">${text}</el-button>`
            // }
          },
          {
            prop: 'loadportcity',
            label: '起运港城市',
            width: '150px',
            sortable: 'custom',
            cname: '',
            type: 'text'
          },
          {
            prop: 'recaddressEnname',
            label: '驳船收货地',
            width: '150px',
            sortable: 'custom',
            cname: '',
            type: 'text'
          },
          {
            prop: 'dischargeport',
            label: '目的港',
            width: '150px',
            sortable: 'custom',
            type: 'text',
            cname: ''
          },
          {
            prop: 'country',
            cname: '',
            label: '国家',
            width: '100px',
            sortable: 'custom',
            type: 'text'
          },
          {
            prop: 'transferport',
            cname: '',
            label: '中转港',
            width: '100px',
            sortable: 'custom',
            type: 'text'
          },
          {
            prop: 'massaddress',
            label: '港区',
            type: 'text',
            sortable: 'custom',
            width: '100'
          },
          {
            prop: 'quoteorg',
            label: '订舱代理',
            sortable: 'custom',
            type: 'text',
            width: '200px'
          },
          {
            prop: 'carrier',
            label: '船公司',
            width: '100px',
            sortable: 'custom',
            type: 'text'
          },
          {
            prop: 'searouteCnname',
            label: '航线',
            width: '100px',
            sortable: 'custom',
            type: 'text'
          },
          {
            prop: 'searouteCode',
            label: '航线代码',
            sortable: 'custom',
            type: 'text',
            width: '100'
          },
          {
            prop: 'cycle',
            label: '船期',
            sortable: 'custom',
            type: 'text',
            width: '100'
          },
          {
            prop: 'sailtime',
            label: '航程(天)',
            sortable: 'custom',
            type: 'text',
            width: '100'
          },
          {
            prop: 'begindate',
            label: '有效期(开始)',
            type: 'text',
            sortable: 'custom',
            width: '120'
          },
          {
            prop: 'validdate',
            label: '有效期(结束)',
            sortable: 'custom',
            type: 'text',
            width: '120'
          },
          {
            prop: 'validType',
            label: '有效类别',
            sortable: 'custom',
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
              return str
            }
          },
          {
            prop: 'publishdate',
            label: '发布时间',
            type: 'text',
            sortable: 'custom',
            width: '150'
          },
          // {
          //   prop: 'ispublish',
          //   label: '发布状态',
          //   width: '100',
          //   sortable: 'custom',
          //   type: 'text'
          // },
          {
            prop: 'iscommend',
            label: '推荐',
            type: 'text',
            sortable: 'custom',
            value: '',
            width: '100',
            formatter: (row, column) => {
              return row.iscommend === 'true' ? '是' : '否'
            }
          },
          {
            prop: 'signflag',
            label: '符号',
            type: 'text',
            value: '',
            sortable: 'custom',
            width: '100'
          },
          {
            prop: 'ownerName',
            label: '维护人',
            sortable: true,
            type: 'text',
            value: '',
            width: '100'
          },
          {
            prop: 'baseprice1',
            label: `20'GP箱型底价`,
            sortable: true,
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              return row.baseprice1 ? 'USD:' + row.baseprice1 : ''
            }
          },
          {
            prop: 'baseprice2',
            label: `40'GP箱型底价`,
            sortable: true,
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              return row.baseprice2 ? 'USD:' + row.baseprice2 : ''
            }
          },
          {
            prop: 'baseprice3',
            label: `40'HQ箱型底价`,
            sortable: true,
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              return row.baseprice3 ? 'USD:' + row.baseprice3 : ''
            }
          },
          {
            prop: 'sellprice1',
            label: `20'GP箱型成本价`,
            sortable: true,
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              return row.sellprice1 ? 'USD:' + row.sellprice1 : ''
            }
          },
          {
            prop: 'sellprice2',
            label: `40'GP箱型成本价`,
            sortable: true,
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              return row.sellprice2 ? 'USD:' + row.sellprice2 : ''
            }
          },
          {
            prop: 'sellprice3',
            label: `40'HQ箱型成本价`,
            sortable: true,
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              return row.sellprice3 ? 'USD:' + row.sellprice3 : ''
            }
          },
          {
            prop: 'internetsellprice1',
            label: `20'GP箱型标准报价`,
            sortable: true,
            type: 'text',
            width: '180',
            formatter: (row, column) => {
              return row.internetsellprice1
                ? 'USD:' + row.internetsellprice1
                : ''
            }
          },
          {
            prop: 'internetsellprice2',
            label: `40'GP箱型标准报价`,
            sortable: true,
            type: 'text',
            width: '180',
            formatter: (row, column) => {
              return row.internetsellprice2
                ? 'USD:' + row.internetsellprice2
                : ''
            }
          },
          {
            prop: 'internetsellprice3',
            label: `40'HQ箱型标准报价`,
            sortable: true,
            type: 'text',
            width: '180',
            formatter: (row, column) => {
              return row.internetsellprice3
                ? 'USD:' + row.internetsellprice3
                : ''
            }
          },
          {
            prop: 'baseprice4',
            label: `45'HQ箱型底价`,
            sortable: true,
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              return row.baseprice4 ? 'USD:' + row.baseprice4 : ''
            }
          },
          {
            prop: 'sellprice4',
            label: `45'HQ箱型成本价`,
            sortable: true,
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              return row.sellprice4 ? 'USD:' + row.sellprice4 : ''
            }
          },
          {
            prop: 'internetsellprice4',
            label: `45'HQ箱型报价`,
            sortable: true,
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              return row.internetsellprice4
                ? 'USD:' + row.internetsellprice4
                : ''
            }
          },
          {
            prop: 'volumerange',
            label: '限重',
            sortable: true,
            width: '80',
            type: 'text'
          },
          {
            prop: 'rakeoff',
            label: '佣金',
            sortable: true,
            type: 'text',
            width: '120'
          },
          {
            prop: 'plusfeedesc',
            label: '附加费',
            sortable: true,
            type: 'text',
            width: '150px'
          },
          {
            prop: 'linkinfo',
            label: '联系方式',
            sortable: true,
            type: 'text',
            width: '150px'
          },
          {
            prop: 'remark',
            label: '外部备注',
            sortable: true,
            type: 'text',
            width: '100px'
          },
          // {
          //   prop: 'employeeRemark',
          //   label: '内部备注',
          //   sortable: true,
          //   type: 'text',
          //   width: '100px'
          // },
          {
            prop: 'sendtype',
            label: '出单方式',
            sortable: true,
            type: 'text',
            width: '100px'
          },
          {
            prop: 'suspendShippingService',
            label: '停航',
            sortable: true,
            type: 'text',
            width: '100px',
            formatter: (row, column) => {
              return row.suspendShippingService === 'true' ? '是' : '否'
            }
          },
          {
            prop: 'sailingDate',
            label: '开航日',
            sortable: true,
            type: 'text',
            width: '100px'
          },
          {
            prop: 'expectedRise',
            label: '预计上涨',
            sortable: true,
            type: 'text',
            width: '100px'
          },
          {
            prop: 'carrierRoute',
            label: '承运人航线',
            sortable: true,
            type: 'text',
            width: '120px'
          },
          {
            prop: 'sailtime',
            label: '驳船航程',
            sortable: true,
            type: 'text',
            width: '100px',
            formatter: (row, column) => {
              return row.transportDays
            }
          },
          {
            prop: 'effectiveDate',
            label: '驳船有效期(开始)',
            sortable: true,
            type: 'text',
            width: '150px'
          },
          {
            prop: 'invalidDate',
            label: '驳船有效期(结束)',
            sortable: true,
            type: 'text',
            width: '150px'
          },
          {
            prop: 'transitClause',
            label: '运输条款',
            sortable: true,
            type: 'text',
            width: '100px'
          },
          {
            prop: 'transferSailtime',
            label: '中转航程',
            sortable: true,
            type: 'text',
            width: '100px'
          },
          {
            prop: 'inlandTransferMode',
            label: '中转方式',
            sortable: true,
            type: 'text',
            width: '100px'
          },
          // {
          // 	prop: 'transferSailtime1',
          // 	label: 'ALL IN',
          // 	sortable: true,
          // 	type: 'text',
          // 	width: '100px'
          // },
          {
            prop: 'priceHolder',
            label: '拿价人',
            sortable: true,
            type: 'text',
            width: '100px'
          },
          {
            prop: 'priceHolderOrgName',
            label: '拿价公司',
            sortable: true,
            type: 'text',
            width: '200px'
          },
          {
            prop: 'cutWeek',
            label: '截文件',
            sortable: true,
            type: 'text',
            width: '100px'
          },
          {
            prop: 'freeTime',
            label: '免用免堆',
            sortable: true,
            type: 'text',
            width: '150px'
          },
          {
            prop: 'bargeCycle',
            label: '驳船船期',
            sortable: true,
            type: 'text',
            width: '100px'
          },
          {
            prop: 'transferport2',
            label: '中转港2',
            sortable: true,
            type: 'text',
            width: '100px'
          },
          {
            prop: 'transferport3',
            label: '中转港3',
            sortable: true,
            type: 'text',
            width: '100px'
          },
          {
            prop: 'addfee',
            label: '附加费说明',
            sortable: true,
            type: 'text',
            width: '120px'
          },
          {
            prop: 'billType',
            label: '提单类型',
            sortable: true,
            type: 'text',
            width: '100px'
          }
          // {
          //   prop: 'businessRemark',
          //   label: '收货指引',
          //   sortable: true,
          //   type: 'text',
          //   width: '100px'
          // },
          // {
          //   prop: 'modifyby',
          //   label: '修改人',
          //   sortable: true,
          //   type: 'text',
          //   width: '100px'
          // }
        ],

        // 操作按钮组
        operationBtns: {
          // width: '180px',
          fixed: 'right',
          show: true,
          callback: (action, $index, row, item, $event) => {
            this.work_table_id = row.work_table_id
            if (action === 'Create') {
              this.handleCreate(row)
            }
          },
          data: [
            {
              label: '生成订单',
              type: 'text',
              show: (item, row) => {
                if (
                  (row.subRouteList && row.subRouteList.length > 0) ||
                  this.tableQuery.state === 'invalid'
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
          show: true,
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
  // beforeRouteLeave (to, from, next) {
  //   if (to.name == 'SeaFreightDetail' && this.isClickInfo) {
  //     to.meta.isUseCache = false
  //   } else {
  //     to.meta.isUseCache = true
  //   }
  //   next();
  // },
  created() {
    this.init()
    this.getSearchConditionInfo()
    this.getList()
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      shipTerms: (state) => state.dict.dictMap.shipTerms,
      publishStatus: (state) => state.dict.dictMap.publishStatus,
      routeQuery: (state) => state.charge.cargoGmRouteQuery,
      defaultColumns: (state) => state.charge.cargoGmRouteQuery.defaultColumns,
      specialColumns: (state) => state.charge.cargoGmRouteQuery.specialColumns,
      columnsBase: (state) => state.charge.cargoGmRouteQuery.columnsBase
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
    CreateOrder
  },
  methods: {
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
    init() {
      // let { publishStatus } = this.dictMap
      // publishStatus.forEach((item) => {
      //   if (item.value !== 'unpublished') {
      //     this.publishStatusOptions[item.value] = item.label
      //   }
      // })
    },

    // 增加一条搜索条件
    handleAddFilter() {
      this.searchInputGroup.push({ value: '', key: '', queryValue: '' })
      //console.log('新增一条：', this.searchInputGroup)
    },

    // 获取订舱代理
    getSupplierList(type, queryString, item) {
			this.$store.dispatch('dict/queryBkgAgentSupplierList', { category: 'category', value: 'bkg_carrier,bkg_agent', queryString: queryString, categoryType: 'in' }).then(data => {
				item.data = data.list.map(ele => {
					return Object.assign(ele, {
						label: this.$language == 'en' ? ele.ename : ele.name,
						value: ele.supplierId ? Number(ele.supplierId) : ''
					})
				})
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
              value: ele.ename
            })
          })

          item.data = portList
        })
    },

    // 系统航线下拉列表自动补充的数据
    sysLineQuerySearch(queryString, item) {
      this.$store
        .dispatch('dict/baseSystemLineList', { name: queryString, state: '' })
        .then((data) => {
          item.data = data.map((ele) => {
            return Object.assign(ele, {
              label: ele.value,
              value: ele.value
            })
          })
        })
    },

    // 船公司下拉列表自动补充的数据
    // shipQuerySearch(queryString, item) {
    //   this.$store
    //     .dispatch('dict/baseShippingCarrierList', {
    //       name: queryString,
    //       state: ''
    //     })
    //     .then((data) => {
    //       item.data = data.map((ele) => {
    //         return Object.assign(ele, {
    //           label: ele.value,
    //           value: ele.key
    //         })
    //       })
    //     })
    // },
    shipQuerySearch(queryString, cb) {
      console.log(1)
      this.$store
        .dispatch('dict/baseShippingCarrierList', {
          name: queryString,
          state: 'valid'
        })
        .then((data) => {
          cb(data)
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
        item.data =
          (response.data &&
            response.data.map((o) => {
              return {
                label: o.cname,
                value: o.cname
              }
            })) ||
          []
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
        item.data = data.map((ele) => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.value
          })
        })
      })
    },

    // 列表数据
    async getList() {
      this.loading = true
      // let publishStatusQuery = [{ column: 'state', type: 'eq', value: this.tableQuery.state }]
      // 合并发布状态参数
      let data = {}
      Object.assign(data, this.tableQuery, {
        query: this.tableQuery.query
      })
      delete data.state
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
      dzgRouteList(data)
        .then((response) => {
          let { list, totalCount, configColumns, pageSize } = response.data
          this.tableQuery.pageSize = pageSize
          //处理返回的数据，映射关系
          this.handlerList(list)
          this.tableConfig.list = list
          this.tableConfig.configColumns = configColumns.length
            ? configColumns
            : this.defaultColumns
          this.tableConfig.pagination.total = totalCount
          this.handleFilterColumns(this.tableConfig.configColumns)
          this.loading = false
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
        .catch(() => {
          this.tableConfig.list = []
          this.loading = false
        })
    },
    handlerList(row) {
      row.map((item) => {
        this.handlerSingleData(item)
        if (item.subRouteList && item.subRouteList.length > 0) {
          item.subRouteList.map((item1) => {
            this.handlerSingleData(item1)
          })
        }
      })
    },
    handlerSingleData(item) {
      // 设置推荐位row的样式
      if (item.recommendLevel === 'Y' && item.publishStatus === 'published') {
        item.isRecommendRow = true
      }
      if (item.mainRouteTransferMode) {
        item.mainRouteTransferMode = this.$t(
          `dict.mainRouteTransferMode.${item.mainRouteTransferMode}`
        )
      }
      if (item.allin) {
        item.allin = this.$t(`dict.allin.${item.allin}`)
      }
      if (item.issueWay) {
        item.issueWay = this.$t(`dict.issueWay.${item.issueWay}`)
      }
      if (item.blType) {
        item.blType = this.$t(`dict.blType.${item.blType}`)
      }
      if (item.effectiveType) {
        item.effectiveType = this.$t(`dict.effectiveType.${item.effectiveType}`)
      }
      if (item.feederMatchMode) {
        item.feederMatchMode = this.$t(
          `dict.feederMatchMode.${item.feederMatchMode}`
        )
      }
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
                  this.filterGroups[item.key].type === 'remoteSelect' &&
                  this.filterGroups[item.key].multiple
                ) {
                  Object.assign(tempItem, {
                    column: item.key,
                    type: this.filterGroups[item.key].searchType || 'eq',
                    value: item.value ? item.value.toString() : ''
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
        // console.log('serach:', this.tableQuery)

        this.getList()
      }

      if (action === 'Reset') {
        if (param.composeKey) {
          this.setSearchCondition(param.composeKey)
        } else {
          // 后端有配置默认模板
          if (this.resDefaConfList.length) {
            let composeKey = this.resDefaConfList[0].composeKey
            this.setSearchCondition(composeKey, this.resDefaConfList)
          } else {
            // 后端无配置默认模板
            this.searchInputGroup = JSON.parse(
              JSON.stringify(defaultSearchInputGroup)
            )
          }
        }
        Object.assign(this.tableQuery, defaultTableQuery, defaultPage)
        this.getList()
        // this.callback('Reset')
      }
      // 保存搜索模板
      if (action === 'ConditionSave') {
        this.searchConditionSave(param)
      }
      // 点击选择模板切换模板并保存
      if (action === 'ConditionImmediateSave') {
        this.searchConditionSave(param, 'immediateSave')
      }
      // 删除搜索模板
      if (action === 'ConditionDelete') {
        this.searchConditionDelete(param)
      }
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
              console.log(
                'item.key',
                item.key,
                this.filterGroups[item.key].text
              )
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
      // console.log('select.data', this.filterGroups['bkgAgentSupplierId'].data)

      if (type === 'immediateSave') {
        searchItemList = param.searchItemList
      }
      searchConditionSave({
        scenesCode: this.$route.name,
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
            scenesCode: this.$route.name,
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
    // 获取自定义搜索查询
    getSearchConditionInfo() {
      searchConditionInfo({
        scenesCode: this.$route.name
      }).then((res) => {
        let { defaultConfigList, customConfigList } = res.data
        this.resDefaConfList = defaultConfigList
        // 搜索模板存在，就默认显示第一个模板的搜索条件。不存在搜索模板，则显示后端配置的默认模板
        // 后端如果没有配置模板的话，则前端显示默认一个空的搜索条件
        if (!customConfigList || !customConfigList.length) {
          // 后端无配置默认模板
          if (!defaultConfigList || !defaultConfigList.length) {
            this.searchConditionList = []
            this.searchInputGroup = JSON.parse(
              JSON.stringify(defaultSearchInputGroup)
            )
            return
          }
          // 有配置默认模板
          this.searchConditionList = []
          let composeKey = defaultConfigList[0].composeKey
          this.setSearchCondition(composeKey, defaultConfigList)
          // this.getList()
        } else {
          this.searchConditionList = customConfigList
          // 获取自定义搜索数据后默认选中第一个模板
          let composeKey = customConfigList[0].composeKey
          this.setSearchCondition(composeKey)
        }
      })
    },
    // 按选中的搜索模板设置搜索条件反显
    setSearchCondition(composeKey, defaultConfigList) {
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
            // console.log('item.searchField', this.filterGroups[item.searchField].data);
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
      // console.log('搜索条件反显')
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
    handleSearchByPublishStatus() {
      this.tableQuery.currPage = 1
      this.getList()
    },

    // 多选
    handleMuti(arr) {
      this.selectedCheckbox = arr
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

    handleRouteInfo(index, row) {
      this.handleDetail(row)
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
      console.log(this.currentData)
    },

    // 新建订单关闭回调
    createOrderPopClose(action, value, includeFeederType) {
      if (action === 'Confirm') {
        this.handleCreateOrder(value, includeFeederType)
      } else {
        this.createOrderPopShow = false
      }
    },

    // 新建订单保存
    handleCreateOrder(value, includeFeederType) {
      delete value.sailingDate
      let params = JSON.parse(JSON.stringify(value))
      params.porPortCode = this.currentData.recaddressEnname // 收货地
      params.polPortCode = this.currentData.loadport // 起运港
      // params.transitPortCode=this.currentData.transferport // 中转港
      params.podPortCode = this.currentData.dischargeport //目的港
      params.shipCarrierCode = this.currentData.carrier //船公司
      params.freeTime = this.currentData.freeTime // 免用免推

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
      params.transitPortCode=podPortCodeArr.join(',')
      dzgChargeCreate(params).then((res) => {
        let { orderNo, serviceType } = res.data
        sessionStorage.setItem('createOrderStr', JSON.stringify(res.data))
        this.createOrderPopShow = false
        this.isJumpRouteFromPage = true
        this.$router.push({
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
      })
    }
  }
}
</script>

<style lang="scss">
.seaFreight .el-table__expand-icon {
  display: block !important;
  position: absolute;
  top: 8px;
}
.table-layout.seaFreight .column-text {
  display: block;
}
.seaFreight .el-table__row--level-1 {
  background-color: #e7eeff !important;
}
</style>
