<template>
  <div class="app-container">
    <div class="search-container">
      <Search :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery"  :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
				<!-- 新增条件下拉查询 -->
				<AddFilter
					:defaultSearchLength="defaultSearchLength"
					:filterGroups="filterGroups"
					:allFilterGroups="allFilterGroups"
					:searchInputGroup="searchInputGroup"
					:callback="searchCallBack"
					:item="item"
					:index="index"
					v-for="(item, index) in searchInputGroup"
					:key="'filter' + index"
				/>
				<div class="btn-plus-search" @click="handleAddFilter"></div>
			</Search>
    </div>

    <div class="table-container" id="barge-search-table">
      <TableFilter
      :config="tableConfig"
      :publishStatusOptions="publishStatusOptions"
      :tableQuery.sync="tableQuery"
      :callback="tableCallBack" />

      <BaseTableMuti
        class="seaFreight"
        v-loading="loading"
        :tableQuery.sync="tableQuery"
        :config="tableConfig"
        :callback="tableCallBack" />
    </div>
    <!-- 自定义复制模板 -->
    <div v-if="showCopyColumns">
      <CustomColumns title="复制的模板" :showModel="false" :columnsBase="tableConfig.columnsBase" :configColumns="copyColumnsBarge" @close="copyColumnsClose" />
    </div>
    <div class="water-mark-box"></div>
  </div>

</template>
<script>
import {mapGetters} from 'vuex'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import Search from '@/views/charge/maintain/mainRoute/components/search'
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilter'
import AddFilter from '../seaFreight/components/addFilter'
// 弹出框
import TableColumnPopover from './components/tableColumnPopover'
import clip from '@/utils/clipboard'
import clipboard from '@/directive/clipboard/index.js'
import {feederRouteList} from '@/api/charge/route'
import CustomColumns from '@/components/customColumns/index'
import watermark from '@/utils/watermark'
const defaultPage = {
  pageSize: -1,
  currPage: 1
}
const defaultTableQuery = {
  columns: [],
  ascColumns: [],
  descColumns: [],
  query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
  state: 'published'
}
const defaultSearchInputGroup = [
	{
		key: 'feederPolCode',
		value: '',
		placeholder: '筛选条件',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'polCode',
		value: '',
		placeholder: '筛选条件',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'podCode',
		value: '',
		placeholder: '筛选条件',
		category: 'all',
		queryValue: ''
	},
	{
		key: 'shipCarrierCode',
		value: '',
		placeholder: '筛选条件',
		category: 'all',
		queryValue: ''
	},
  {
		key: 'sysLineCode',
		value: '',
		placeholder: '筛选条件',
		category: 'all',
		queryValue: ''
	},
]
export default {
  mixins: [routerMixin],
  directives: {
    clipboard
  },
  data() {
    return {
      loading: true,
      state: '',
      showVal: null,
      defaultStyle: {
        width: '100%'
      },
      defaultSearchLength: 0, // 默认显示搜索框的个数
      searchConditionHide: true,  // 隐藏自定义搜索
      // 查询条件下拉选项
			allFilterGroups: {
				all: this.filterGroups
			},
      // 查询条件下拉选项
      filterGroups: {
        feederPolCode: {
          key: 'feederPolCode', 
          label: '驳船收货地',
          type: 'remoteSelect',
          value: '',
          data: [], nonDictionary: true,
          searchType: 'eq',
          visibleChange: (val, item) => {
            this.portSearch('', 'port_of_feeder', this.state, 'feederPolCode', item)
          }, filterMehod: (val, item) => {
            this.portSearch(val, 'port_of_feeder', this.state, 'feederPolCode', item)
          }, change: (val, item) => {
            Object.assign(item, {
              queryValue: val
            })
          }
        },
        polCode: {
          key: 'polCode',
          label: '大船起运港',
          type: 'remoteSelect',
          searchType: 'eq',
          value: '',
          data: [], nonDictionary: true,
          queryValue: '',
          visibleChange: (val, item) => {
            this.portSearch('', 'port_of_basic', this.state, 'polCode', item)
          }, filterMehod: (val, item) => {
            this.portSearch(val, 'port_of_basic', this.state, 'polCode', item)
          }, change: (val, item) => {
            Object.assign(item, {
              queryValue: val
            })
          }
        },
        podCode: {
          key: 'podCode',
          label: '目的地',
          type: 'remoteSelect',
          searchType: 'eq',
          value: '',
          data: [], nonDictionary: true,
          queryValue: '',
          visibleChange: (val, item) => {
            this.portSearch('', 'port_of_destination', this.state, 'podCode', item)
          }, filterMehod: (val, item) => {
            this.portSearch(val, 'port_of_destination', this.state, 'podCode', item)
          }, change: (val, item) => {
            Object.assign(item, {
              queryValue: val
            })
          }
        },
        shipCarrierCode: {
					key: 'shipCarrierCode',
					label: '船公司',
					type: 'remoteSelect',
					value: '',
					data: [],
					nonDictionary: true,
          multiple: true,
					saveList: [],
					searchType: 'eq',
					visibleChange: (val, item) => {
						val && this.shipQuerySearch('', item)
					},
					filterMehod: (val, item) => {
						this.shipQuerySearch(val, item)
					},
					change: (val, item) => {
						Object.assign(item, {
							queryValue: val
						})
					}
				},
        sysLineCode: {key: 'sysLineCode', label: '系统航线', type: 'autocomplete', value: '', searchType: 'eq',
          querySearch: (queryString, cb) => {
            this.sysLineQuerySearch(queryString, cb)
          }, 
          change: (val, item) => {
            Object.assign(item, {
              queryValue: val
            })
          },
          select: (val, item) => {
            Object.assign(item, {
              queryValue: val.key
            })
          }
        },
        publishTime: {
          label: '发布时间', key: 'publishTime', type: 'date', value: '', category: 'daterange', format: 'yyyy-MM-dd', searchType: 'eq' 
        }
      },
      searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),
      tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
      publishStatusOptions: {},
      searchConfig: [
        // {
        //   key: 'feederPolCode', 
        //   label: '驳船收货地',
        //   type: 'remoteSelect',
        //   value: '',
        //   data: [], nonDictionary: true,
        //   searchType: 'eq',
        //   visibleChange: (val, item) => {
        //     this.portSearch('', 'port_of_feeder', this.state, 'feederPolCode', item)
        //   }, filterMehod: (val, item) => {
        //     this.portSearch(val, 'port_of_feeder', this.state, 'feederPolCode', item)
        //   }, change: (val, item) => {
        //     Object.assign(item, {
        //       queryValue: val
        //     })
        //   }
        // },
        // {
        //   key: 'polCode',
        //   label: '大船起运港',
        //   type: 'remoteSelect',
        //   searchType: 'eq',
        //   value: '',
        //   data: [], nonDictionary: true,
        //   queryValue: '',
        //   visibleChange: (val, item) => {
        //     this.portSearch('', 'port_of_basic', this.state, 'polCode', item)
        //   }, filterMehod: (val, item) => {
        //     this.portSearch(val, 'port_of_basic', this.state, 'polCode', item)
        //   }, change: (val, item) => {
        //     Object.assign(item, {
        //       queryValue: val
        //     })
        //   }
        // },
        // {
        //   key: 'podCode',
        //   label: '目的地',
        //   type: 'remoteSelect',
        //   searchType: 'eq',
        //   value: '',
        //   data: [], nonDictionary: true,
        //   queryValue: '',
        //   visibleChange: (val, item) => {
        //     this.portSearch('', 'port_of_destination', this.state, 'podCode', item)
        //   }, filterMehod: (val, item) => {
        //     this.portSearch(val, 'port_of_destination', this.state, 'podCode', item)
        //   }, change: (val, item) => {
        //     Object.assign(item, {
        //       queryValue: val
        //     })
        //   }
        // },
        // {
        //   key: 'shipCarrierCode', 
        //   label: '船公司',
        //   type: 'remoteSelect',
        //   value: '',
        //   data: [], nonDictionary: true,
        //   searchType: 'eq',
        //   visibleChange: (val, item) => {
        //     this.shipQuerySearch('', item)
        //   }, filterMehod: (val, item) => {
        //     this.shipQuerySearch(val, item)
        //   }, change: (val, item) => {
        //     Object.assign(item, {
        //       queryValue: val
        //     })
        //   }
        // },
        // {
        //   key: 'sysLineCode',
        //   label: '航线',
        //   type: 'remoteSelect',
        //   searchType: 'eq',
        //   value: '',
        //   data: [], nonDictionary: true,
        //   visibleChange: (val, item) => {
        //     this.sysLineQuerySearchList('', item)
        //   }, filterMehod: (val, item) => {
        //     this.sysLineQuerySearchList(val, item)
        //   }, change: (val, item) => {
        //     Object.assign(item, {
        //       queryValue: val
        //     })
        //   }
        // },
      ],

      // table复选框多选的值
      selectedCheckbox: [],

      // 默认表头
      defaultColumns: ['polCode','shipCarrierCode','sysLineName','priceGp20', 'priceGp40', 'priceHq40', 'priceHq45','priceNor20','priceNor40', 'podCode','receiptArea','surchargeList', 'schedule', 'remark', 'beginDate', 'publishTime','invalidDate'],

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
          checkSelectable({routeId}) {
            return routeId ? true : false;
          },
        },
        list: [],
        configColumns:[],
        // 表头库
        columnsBase: [
          // {label: '编号', key: 'routeId', disabled: false},
          {label: '收货地/起运港', key: "polCode",   disabled: false},
          {label: '船司', key: 'shipCarrierCode', disabled: false},
          {label: '系统航线', key: 'sysLineCname', disabled: false},
          {label: '有效期', key: 'beginDate', disabled: false},
          {label: '收货区域', key: 'receiptArea', disabled: false},
          {label: '20GP', key: 'priceGp20', disabled: false},
          {label: '40GP', key: 'priceGp40',disabled: false},
          {label: '40HQ', key: 'priceHq40', disabled: false},
          {label: '45HQ', key: 'priceHq45',disabled: false},
          {label: '20NOR', key: 'priceNor20',disabled: false},
          {label: '40NOR', key: 'priceNor40',disabled: false},
          {label: '驳船预计开船时间', key: 'feederSchedule', disabled: false},
          {label: '目的地', key: 'podCode', disabled: false},
          {label: '备注说明', key: 'remark', disabled: false},
          {label: '附加费', key: 'surchargeList', disabled: false},
          { label: '发布时间', key: 'publishTime', disabled: false },
          { label: '失效时间', key: 'invalidDate', disabled: false },
        ],
        columns: [
          {
            prop: 'polCode',
            label: '收货地/起运港',
            fixed: true,
            align: 'left',
            'header-align': 'center',
            sortable: false,
            width: '180',
            formatter: (row, column) => {
              return row.feederPolCname || row.polCname ? `<i ></i><span class="underline" style="white-space: nowrap;">${row.feederPolEname}(${row.feederPolCname})→${row.polEname}(${row.polCname})</span>` : '<span>--</span>'
            },
            type: 'text',
            method: (index, row) => {
              this.handleRouteInfo(index, row)
            },
          },
          {
            prop: 'shipCarrierCode',
            label: '船司',
            sortable: false,
            type: 'autocomplete',
            value: '', 
            width: '80',
            formatter: (row, column) => {
              return row.shipCarrierCode ? `<span class="column-span">${row.shipCarrierCode}</span>` : '--'
            }
          },
          {
            prop: 'sysLineName',
            label: '系统航线',
            sortable: false,
            type: 'text',
            width: '100',
            formatter: (row, column) => {
              return row.sysLineCname ? `<span>${row.sysLineCname}</span>`: `<span>--</span>`
            },
          },
          {
            prop: 'beginDate',
            label: '有效期',
            sortable: false,
            type: 'date',
            category: 'daterange',
            width: '100',
            format: 'yyyy-MM-dd',
            formatter: (row, column) => {
              return row.beginDate ? `<span style="white-space: nowrap;">${row.beginDate}~${row.endDate}</span>` : '--'
            }
          },
          {
            prop: 'priceGp20',
            label: '20GP',
            sortable: true,
            type: 'text',
            width: '80',
            formatter: (row, column) => {
              return  `<span class="column-span">${row.currency} ${row.priceGp20}</span>`
            },
          },
          {
            prop: 'priceGp40',
            label: '40GP',
            sortable: true,
            width: '100',
            type: 'text',
            width: '100',
            formatter: (row, column) => {
              return `<span class="column-span">${row.currency} ${row.priceGp40}</span>`
            },
          },
          {
            prop: 'priceHq40',
            label: '40HQ',
            sortable: true,
            type: 'text',
            width: '80',
            formatter: (row, column) => {
              return  `<span class="column-span">${row.currency} ${row.priceHq40}</span>`
            },
          },
          {
            prop: 'priceHq45',
            label: '45HQ',
            sortable: true,
            type: 'text',
            width: '80',
            formatter: (row, column) => {
              return `<span class="column-span">${row.currency} ${row.priceHq45}</span>`
            },
          },
             {
            prop: 'priceNor20',
            label: '20NOR',
            sortable: true,
            type: 'text',
            width: '100',
            formatter: (row, column) => {
              return `<span class="column-span">${row.currency} ${row.priceNor20}</span>`
            },
          },
             {
            prop: 'priceNor40',
            label: '40NOR',
            sortable: true,
            type: 'text',
            width: '100',
            formatter: (row, column) => {
              return `<span class="column-span">${row.currency} ${row.priceNor40}</span>`
            },
          },
          {
            prop: 'podCode',
            label: '目的地',
            align: 'left',
            'header-align': 'left',
            sortable: false,
            width: '100',
            formatter: (row, column) => {
              return row.podCode? `<i ></i><span style="white-space: nowrap;">${row.podEname}(${row.podCname})`:`--`
            },
            type: 'text'
          },
           {
            prop: 'receiptArea',
            label: '收货区域',
            align: 'left',
            'header-align': 'center',
            sortable: false,
            width: '80',
            formatter: (row, column) => {
               return row.receiptArea ? `<span>${row.receiptArea}</span>`: `<span>--</span>`
            },
            type: 'text'
          },
          {
            prop: 'surchargeList',
            label: '附加费',
            sortable: false,
            type: 'text',
            popoverComponent: TableColumnPopover,
            formatter: (row, column) => {
              return row.surchargeList? `<span>附加费</span>`: `<span>--</span>`
            },
            width: '100',
          },
         {
            prop: 'schedule',
            label: '驳船预计开船时间',
            sortable: false,
            type: 'input',
            width: '120',
            formatter: (row, column) => {
              return row.feederSchedule ? `<span>${row.feederSchedule}</span>`: `<span>--</span>`
            },
          },
          {
            prop: 'remark',
            label: '备注说明',
            sortable: false,
            type: 'text',
            width: '150',
            formatter: (row, column) => {
              return row.remark ? `<span>${row.remark}</span>`: `<span>--</span>`
            },
          },
           {
            prop: 'publishTime',
						label: '发布时间',
						sortable: 'custom',
						type: 'text',
						width: '100'
          },
          {
            prop: 'invalidDate',
						label: '失效时间',
						type: 'text',
						width: '100'
          }
        ],
        // 操作按钮组
        operationBtns: {
          width: '120',
          fixed: 'right',
          show: true,
          callback: (action, $index, row, item, $event) => {
            if (action === 'Detail') {
              this.handleDetail(row)
            }
            if (action === 'Copy') {
              this.handleCopy(row, $index, $event)
              // 用户操作采集
							this.$store.dispatch('user/saveClientEvent', {
								sysCode: "charge",
								soure: "web",
								type: "button_click",
								eventCode: "charge_copy_feeder_route",
								eventName: "驳船费查询-复制驳船费"
							})
            }
          },
          data: [
            {
              label: '详情',
              type: 'text',
              show: true,
              action: 'Detail'
            },
            {
              label: '复制',
              type: 'text',
              id:'copyBtn',
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
      copyColumnsBarge: [],
      showCopyColumns: false
    }
  },
  created() {
    this.init();
    this.getList();
    let copyColumnsBarge = window.localStorage.getItem('copyColumnsBarge')
    if (copyColumnsBarge) {
      this.copyColumnsBarge = JSON.parse(copyColumnsBarge)
    }
  },
  computed: {
    ...mapGetters([
      'dictMap'
    ])
  },
  components: {
    Search,
    BaseTableMuti,
    TableFilter,
    TableColumnPopover,
    CustomColumns,
    AddFilter
  },
  methods: {
    // 增加一条搜索条件
		handleAddFilter() {
			this.searchInputGroup.push({ value: '', key: '', queryValue: '' })
			//console.log('新增一条：', this.searchInputGroup)
		},
    handleCopyColumns () {
      let copyColumnsBarge = window.localStorage.getItem('copyColumnsBarge')
      if (copyColumnsBarge) {
        this.copyColumnsBarge = JSON.parse(copyColumnsBarge)
      }
      this.showCopyColumns = true
    },
    // 自定义复制模板关闭回调
    copyColumnsClose (action, value) {
      this.showCopyColumns = false
      if (action === 'Confirm') {
        this.copyColumnsBarge = value
        window.localStorage.setItem('copyColumnsBarge', JSON.stringify(value))
      }
    },
    // 字段映射
    fieldMapping(props = {}, item = {}, key = "") {
      if (item[key] || item[key] === 0) return item[key];         // key值为整型0时一样返回0
      return item[props[key]]
    },

    init() {
      let {publishStatus} = this.dictMap
      publishStatus.forEach(item => {
        if (item.value !== 'unpublished'){
          this.publishStatusOptions[item.value] = item.label
        }
      })
    },


    // 起运港下拉列表自动补充的数据
    polQuerySearch(queryString, portAttribute, state, cb) {
      this.$store.dispatch('dict/basePortList', {queryString, portAttribute, state}).then(data => {
        cb(data)
      })
    },

    // 中转港下拉数据
    transitPortSearch(val='') {
      val = val.trim() //去空格
      this.$store.dispatch('dict/basePortList', val).then(data => {
        this.filterGroups.transitPortCodes.data = data
      })
    },
    // 船公司下拉列表自动补充的数据
    sysLineQuerySearchList(queryString='', item) {
      queryString = queryString.trim() //去空格
      this.$store.dispatch('dict/baseSystemLineList', {name: queryString, state: ''}).then(data => {
        item.data = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
      })
    },
    // 系统航线下拉列表自动补充的数据
    sysLineQuerySearch(queryString='', cb) {
     
      queryString = queryString.trim() //去空格
      this.$store.dispatch('dict/baseSystemLineList', queryString).then(data => {
        cb(data)
      })
    },

    // 远程搜索港口下拉数据
    portSearch(queryString='', portAttribute, state, type, item) {
      queryString = queryString.trim() //去空格
      this.$store.dispatch('dict/basePortList', {queryString, portAttribute, state}).then(data => {
        let portList = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })

        item.data = portList
      })
    },

    // 船公司下拉列表自动补充的数据
    shipQuerySearch(queryString='', item) {
      queryString = queryString.trim() //去空格
			this.$store.dispatch('dict/baseShippingCarrierList', { name: queryString, state: '' }).then(data => {
				item.data = data.map(ele => {
					return Object.assign(ele, {
						label: ele.value,
						value: ele.key
					})
				})
			})
		},
    // 列表数据
    getList() {
      this.loading = true
      let publishStatusQuery = [{'column': 'state', 'type': 'eq', 'value': this.tableQuery.state}]
      let query = [{'column': 'query', 'type': 'eq', 'value': 'yes'}]
      // 合并发布状态参数
      let data = {}
      Object.assign(data, this.tableQuery, {
        query: this.tableQuery.query.concat(publishStatusQuery,query)
      })
      delete(data.state)

      feederRouteList(data).then(response => {
        let {list, totalCount, allColumns, configColumns} = response.data;
        this.tableConfig.list = list;
        this.tableConfig.pagination.total = totalCount;

        this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
        this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
        this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
        this.tableConfig.pagination.isLastPage = response.data.isLastPage
        this.tableQuery.currPage = response.data.currPage
        this.tableQuery.pageSize =  response.data.pageSize

        
        this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns;
        this.handleFilterColumns(this.tableConfig.configColumns)
      }).finally(() => {
        this.loading = false
      })
    },

    // 查询组件回调
    searchCallBack(action) {
      let query = []
      if (action === 'Search') {
        //默认的查询条件组装tableQuery参数
        if (this.searchConfig.length) {
         
          this.searchConfig.forEach((item, index) => {
            if (item.value) {
              let tempQuery = {}
              Object.assign(tempQuery, {
                "column": item.key,
                "type": item.searchType || 'eq',
                "value": item.queryValue
              })
              query.push(tempQuery)
            }
          })
        }
        // 新增的查询条件组装tableQuery参数
				if (this.searchInputGroup.length) {
					this.searchInputGroup.forEach((item, index) => {
            if (['publishTime','beginDate'].includes(item.key)) {
               if (item.key === 'beginDate' && item.value?.length) {
                query.push(
                  {'column': 'beginDate','type': 'eq','value': item.value[0]},
                  {'column': 'endDate','type': 'eq','value': item.value[1]}
                )
              }
              if (item.key === 'publishTime' && item.value?.length) {
                query.push(
                  { column: 'publishBeginDate', type: "eq", value: item.value[0] },
                  { column: 'publishEndDate', type: "eq", value: item.value[1] }
                )
              }
            } else if (item.value) {
              let tempItem = {}
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
								if (this.filterGroups[item.key].type === 'remoteSelect' && this.filterGroups[item.key].multiple) {
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
							// console.log('query:', query);
						}
					})
				}
        Object.assign(this.tableQuery, {
          query: query.filter(item => {
						return item.value
					}),
          currPage: 1
        })
        console.log('serach:', this.tableQuery)
        this.getList()
      }

      if (action === 'Reset') {
        this.searchInputGroup = []
        this.searchConfig.forEach(item => {
          item.value = ''
        })
        Object.assign(this.tableQuery, defaultTableQuery, defaultPage)
        this.getList()
        Object.assign(this.tableConfig, {tips: {text: "", show: false}})
      }
    },

    // 切换列表锁定状态
    handleChangeLockState() {
      this.tableConfig.options.lockState = !this.tableConfig.options.lockState
      this.tableConfig.operationBtns.data.map((item) => {
        // 解锁表格操作显示保存按钮
        if (item.action === 'SingleEdit') {
          if (!this.tableConfig.options.lockState) {
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
    },

    // 发布状态筛选
    handleSearchByPublishStatus(value) {
      this.tableQuery.currPage = 1;      
      this.getList()
    },

    // 多选
    handleMuti(arr) {
      this.selectedCheckbox = arr;
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
    handleRouteInfo(index, row) {
      this.handleDetail(row)
    },
    // 去详情页
    handleDetail(row) {
      this.routerPush('BargeFeeDetail', {
        id: row.routeId
      })
      // this.$router.push({
      //   path: 'bargeFeeDetail?id=' + row.routeId,
      // })
    },

    // 复制
    handleCopy(row, index, e) {
      let rowString=''
      let cloumnArray = []
      let {columnsBase, columns} =  this.tableConfig
      if (this.copyColumnsBarge.length) {
        this.copyColumnsBarge.forEach(item => {
          let base = columnsBase.filter(ele => ele.key === item)[0]
          cloumnArray.push(base)
        })
      } else {
        cloumnArray = columns.map(ele => {
          let {label, prop:key} = ele
          return {
            label,
            key
          }
        })
      }
      cloumnArray.map(item=>{
        if (!row[item.key]) {
          return 
        }
        if(item.key=="surchargeList"){
          if(row[item.key].length){
            rowString+="附加费:"
            row[item.key].map(surChargeitem=>{
              rowString+=surChargeitem['chargeName']+"("+ surChargeitem['chargeCode']+")"
              if(surChargeitem['rateUnit']=='container_type'){
                rowString+=(surChargeitem['priceGp20']?surChargeitem['priceGp20']:'-')+"/"
                rowString+=(surChargeitem['priceGp40']?surChargeitem['priceGp40']:'-')+"/"
                rowString+=(surChargeitem['priceHq40']?surChargeitem['priceHq40']:'-')+"/"
                rowString+=(surChargeitem['priceHq45']?surChargeitem['priceHq45']:'-')+"/"
                rowString+=(surChargeitem['priceNor20']?surChargeitem['priceNor20']:'-')+"/"
                rowString+=(surChargeitem['priceRor20']?surChargeitem['priceRor20']:'-')
              }else{
                rowString+=surChargeitem['price']+","
              }
              rowString+="("+surChargeitem['currency']+")"
            })
            rowString += '\n'
          }
        }else if(item.key=="polCode"){
          rowString+=item.label+":"+row['feederPolEname']+"("+row['feederPolCname']+")"+"->"+row['polEname']+"("+row['polCname']+")"+",\n";
        }else if(item.key=='priceGp20'||item.key=='priceGp40'||item.key=='priceHq40'||item.key=='priceHq45'||item.key=='priceNor20'||item.key=='priceNor40'){
          rowString+=item.label+":"+row['currency']+row[item.key]+",\n"
        }else if(item.key=='beginDate'){
          rowString+=item.label+":"+row['beginDate']+"~"+row['endDate']+",\n"
        }else if(item.key=="podCode"){
          rowString+=item.label+":"+row['podEname']+"("+row['podCname']+"),\n"
        }else {
          rowString+=item.label+":"+(row[item.key]?row[item.key]:"--")+",\n"
        }
      })
      if (!rowString) {
        rowString = ' '
      }
      clip(rowString, e)
    },
    clipboardSuccess() {
      this.$message({
        message: '复制成功',
        type: 'success',
        duration: 1500
      })
    },
    // 远程排序
    handleSort() {
      this.getList()
    },
   
    // 过滤显示自定义的表头
    handleFilterColumns(value) {
      let {columns} = this.tableConfig
      this.tableConfig.columns = columns.filter((item, index) => {
        return value.includes(item.prop)
      })
    },

    // 获取特殊处理的自定义表头，例：polCode,需要传polCode,polEname,polCname,podCode, podEname,podCname给后端
    getColumnsValues(value) {
      let result = []
      value.map(item => {
        if (this.specialColumns[item]){
          result = result.concat(this.specialColumns[item])
        } else {
          result.push(item)
        }
      })
      return result
    },
    // 渲染水印
    reloadWathermark () {
      // 删除之前的水印
      document.querySelector('.water-mark-box').innerHTML = ''
      // 重新渲染水印
      let userInfo = this.$store.state.user.userInfo
      let { deptName, userName, mobileNo = '', employeeNo } = userInfo
      let text = `${userName}_${employeeNo}`
      watermark({
        watermark_txt: text, 
        className:'water-mark-box', 
        watermark_zindex: 6, 
      })
    }
  },
  mounted() {
    // 初始化水印
    this.reloadWathermark()
    // 监听缩放重新渲染水印
    window.addEventListener('resize', this.reloadWathermark)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.reloadWathermark)
  },
}
</script>
<style lang="scss" scoped>
#barge-search-table{
  .seaFreight{
    // user-select: none;
  }
	/deep/ .vxe-table--render-default{
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