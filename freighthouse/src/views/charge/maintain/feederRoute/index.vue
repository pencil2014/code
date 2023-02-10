<template>
  <div class="app-container">
    <div class="search-container feederRoute-container">
      <Search
        :config.sync="searchConfig"
        :filterGroups="filterGroups"
        :searchFiledGroup="searchInputGroup" 
        :callback="searchCallBack"
        :tableQuery.sync="tableQuery">
        <AddFilter
          :searchInputGroup="searchInputGroup"
          :allFilterGroups="allFilterGroups"
          :filterGroups="filterGroups"
          :defaultSearchLength="defaultSearchLength"
          :callback="searchCallBack"
          :index="index"
          :item="item"
          v-for="(item, index) in searchInputGroup"
          :key="'filter' + index"
        />
        <!-- <i class="el-icon-circle-plus-outline icon-search-plus" @click="handleAddFilter"></i> -->
        <div class="btn-plus-search" @click="handleAddFilter" ref="btnPlus"></div>
      </Search>
    </div>

    <div class="table-container" id="feeder-route-table">
      <TableFilter
      :config="tableConfig"
      :publishStatusOptions="publishStatusOptions"
      :tableQuery.sync="tableQuery"
      :callback="tableCallBack" />

      <BaseTableMuti
        v-loading="loading"
        :tableQuery.sync="tableQuery"
        :config="tableConfig"
        :callback="tableCallBack" />
    </div>

    <!-- 自定义表头 -->
    <div v-if="customColumnsPopShow">
      <CustomColumns 
      :columnsBase="columnsBase"
      :configColumns="tableConfig.configColumns"
      @close="customColumnsPopClose" />
    </div>

    <!-- 批量修改 -->
    <div v-if="multiEditPopShow">
      <MultiEdit @close="multiEditPopClose" />
    </div>

    <!-- 附加费模板 -->
    <div v-if="editSurchargePopShow">
      <SurchargeEdit @close="surchargePopClose" :surchargeList="createItem.surchargeList"/>
    </div>

  </div>

</template>
<script>
import Vue from 'vue' 
import store from '@/store'
import { mapState } from 'vuex'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import Search from '../mainRoute/components/search'
import AddFilter from "../mainRoute/components/addFilter"
import BaseTableMuti from '@/components/Base/Table/vxeTableMuti'
import TableFilter from './components/tableFilter'
// 弹出框
import CustomColumns from '@/components/customColumns/index'
import MultiEdit from './components/multiEdit'
import SurchargeEdit from './components/surchargeEdit'
import TableColumnPopover from '../mainRoute/components/tableColumnPopover'

import {searchConditionInfo, searchConditionSave, searchConditionDelete} from "@/api/base"
import {feederRouteList, feederRouteAddOrUpdate, feederRouteInvalid, feederRoutePublishBatch, feederRouteUpdateBatch, feederRouteInvalidBatch, feederRouteSave,
feederRouteInfo, feederRouteExport,feederRouteDelete} from '@/api/charge'
import { columnWidthConfigInfo, columnWidthConfigSave } from '@/api/base'
const defaultPage = {
  pageSize: -1,
  currPage: 1
}

const defaultTableQuery = {
  columns: [],
  ascColumns: [],
  descColumns: [],
  query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
  state: 'unpublished'
}
const defaultSearchInputGroup = [
  {
    key: "feederPolCode",
    value: "",
    placeholder: "筛选条件",
    category: "all",
    queryValue: "",
  },
  {
    key: "polCode",
    value: "",
    placeholder: "筛选条件",
    category: "all",
    queryValue: "",
  },
  {
    key: "podCode",
    value: "",
    placeholder: "筛选条件",
    category: "all",
    queryValue: "",
  },
  {
    key: "shipCarrierCode",
    value: "",
    placeholder: "筛选条件",
    category: "all",
    queryValue: "",
  },
]
export default {
  mixins: [routerMixin],
  data() {
    return {
      loading: true,
      state:'',
      defaultStyle: {
        width: '100%'
      },
      // searchConditionList: [],  // 自定义搜索模板集合
      defaultSearchLength: 0, // 默认显示搜索框的个数
      // 默认展示的搜索条件，搜索条件分类
      searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),
      searchConfig: [],
      allFilterGroups: {
        all: this.filterGroups,
      },
      // 查询条件下拉选项
      filterGroups: { 
        // 航线，维护人
        // bdEmployeeName: {key: 'bdEmployeeName', label: '销售员', type: 'input', searchType: 'like', value: ''},
        shipCarrierCode: {
          key: 'shipCarrierCode', 
          label: '船公司',
          type: 'remoteSelect',
          value: '',
          data: [], nonDictionary: true,
          saveList: [],
          searchType: 'eq',
          visibleChange: (val, item) => {
            this.shipQuerySearch('', item)
          }, filterMehod: (val, item) => {
            this.shipQuerySearch(val, item)
          }, change: (val, item) => {
            let findItem = item.data.find(ele => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        },
        feederPolCode: {
          key: 'feederPolCode', 
          label: '驳船收货地',
          type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
					'collapse-tags': true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
          visibleChange: (val, item) => {
            this.portSearch('', 'port_of_feeder', this.state, 'feederPolCode', item)
          }, filterMehod: (val, item) => {
            this.portSearch(val, 'port_of_feeder', this.state, 'feederPolCode', item)
          }
        },
        polCode: {
          key: 'polCode',
          label: '大船起运港',
          type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
          'collapse-tags': true,
          notReserveKeyword: true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
          visibleChange: (val, item) => {
            this.portSearch('', 'port_of_basic', this.state, 'polCode', item)
          }, filterMehod: (val, item) => {
            this.portSearch(val, 'port_of_basic', this.state, 'polCode', item)
          }
        },
        podCode: {
          key: 'podCode',
          label: '目的地',
          type: 'remoteSelect',
					searchType: 'in',
					multiple: true,
          'collapse-tags': true,
          notReserveKeyword: true,
					value: '',
					data: [],
					saveList: [],
					nonDictionary: true,
					queryValue: '',
          visibleChange: (val, item) => {
            this.portSearch('', 'port_of_destination', this.state, 'podCode', item)
          }, filterMehod: (val, item) => {
            this.portSearch(val, 'port_of_destination', this.state, 'podCode', item)
          }
        },
        sysLineCode: {
          key: 'sysLineCode', 
          label: '系统航线',
          type: 'remoteSelect',
          multiple: true,
          'collapse-tags': true,
          value: '',
          queryValue: '',
          data: [], nonDictionary: true,
          saveList: [],
          searchType: 'eq',
          visibleChange: (val, item) => {
            this.sysLineQuerySearch('', item)
          }, filterMehod: (val, item) => {
            this.sysLineQuerySearch(val, item)
          }, change: (val, item) => {
            let findItem = item.data.find(ele => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        },
        receiptArea: {key: 'receiptArea', label: '收货区域', type: 'input', searchType: 'like', value: ''},
        remark: {key: 'remark', label: '备注说明', type: 'input', searchType: 'like', value: ''},
        beginDate: {label: '有效期', key: 'beginDate', type: 'date',  searchType: 'eq',value: '', category: 'daterange', format: 'yyyy-MM-dd'},
        maintainerId: {
          key: 'maintainerId', 
          label: '维护人',
          type: 'remoteSelect',
          value: '',
          queryValue: '',
          data: [], nonDictionary: true,
          saveList: [],
          searchType: 'eq',
          visibleChange: (val, item) => {
            this.employeeQuerySearch('', item)
          }, filterMehod: (val, item) => {
            this.employeeQuerySearch(val, item)
          }, change: (val, item) => {
            let findItem = item.data.find(ele => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        },
        publishTime: {
          label: '发布时间', key: 'publishTime', type: 'date', value: '', category: 'daterange', format: 'yyyy-MM-dd', searchType: 'eq' 
        }
      },
      resDefaConfList: [],  // 后端配置的默认搜索模板
      importId: this.$route.query.importId,
      // 编辑提交参数
      createItem: {
        routeId: undefined,
        feederPolCode: '',  //起运港编码
        podCode: '',  //目的港编码
        polCode: '',  //大船起运港编码
        receiptArea: '',  //收货区域
        sysLineCname: '',  //公司系统航线编码
        shipCarrierCode: '',  //船公司编码
        feederVoyage: '',  //驳船航程
        beginDate: '',  //生效日-开始
        endDate: '',  //生效日-结束
        feederSchedule: '',  //船期
        remark: '',  //备注
        oceanFreight: [],  //海运费对象
        surchargeList: [],  //附加费List
        publishStatus: ''  //固定值published,编辑 点击发布按钮必传
      },

      // 查询条件
      tableQuery: Object.assign({}, defaultTableQuery, defaultPage),
      // table复选框多选的值
      selectedCheckbox: [],
      // 保存的复选框多选
			saveSelectedCheckbox: [],
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
        columns: [],
        allColumns: [
          {
            prop: 'polCode',
            label: '驳船收货地/大船起运港',
            fixed: true,
            align: 'left',
            type: 'text',
            'header-align': 'center',
            sortable: false,
            width: '200',
            formatter: (row, column) => {
              let polStr = '<span>--</span>'
              let recommend = `<i ></i>`
              if (row.feederPolCname || row.polCname) {
                polStr = `${recommend}<span class="underline" style="white-space: nowrap;">${row.feederPolEname}(${row.feederPolCname})→<br/>${row.polEname}(${row.polCname})</span>` 
              }
              return polStr
            },
            method: (index, row) => {
              this.handleRouteInfo(index, row)
            },
          },
          {
            prop: 'receiptArea',
            label: '收货区域',
            type: 'input',
            value: '', 
            width: '80',
            formatter: (row, column) => {
              return row.receiptArea ? row.receiptArea : '--'
            },
            change: (val, row) => {
              Object.assign(row, {
                receiptArea__save: val
              })
            }
          },
          {
            prop: 'shipCarrierCode',
            label: '船司',
            cname: '',
            type: 'text',
            width: '80',
            formatter: (row, column) => {
              return row.shipCarrierCode ? row.shipCarrierCode : '--'
            }
          },
          {
            prop: 'sysLineCname',
            label: '系统航线',
            sortable: false,
            type: 'autocomplete',
            width: '80',
            formatter: (row, column) => {
              return row.sysLineCname ? row.sysLineCname: `--`
            },
            querySearch: (queryString, cb, row) => {
              Object.assign(row, {
                sysLineCode: ''
              })
              this.sysLineQuerySearch(queryString, cb)
            },
            change: (val, row) => {
              Object.assign(row, {
                sysLineCode__save: val
              })
            },
            select: (item, row) => {
              Object.assign(row, {
                sysLineCode: item.key,
                sysLineCode__save: item.key
              })
            }
          },
          {
            prop: 'podCode',
            label: '目的地',
            type: 'remoteSelect',
            width: '150',
            data: [], nonDictionary: true,
            formatter: (row, column) => {
              return row.podCode? `${row.podEname}(${row.podCname})` : `--`
            },
            visibleChange: (val, row, item) => {
              console.log(val, row, item);
              this.portSearch('', 'port_of_destination', 'valid','podCode', item)
            }, filterMehod: (val, item) => {
              this.portSearch(val, 'port_of_destination', 'valid','podCode', item)
            }, change: (val, row, item) => {
              Object.assign(row, {
                podCode: val,
                podCode__save: val
              })
              this.changeSysLineDiabeld(row,true)
            }
            // prop: 'podCode',
            // label: '目的地',
            // width: '150',
            // formatter: (row, column) => {
            //   return row.podCode? `${row.podEname}(${row.podCname})` : `--`
            // },
            // type: 'autocomplete',
            // querySearch: (queryString, cb, row) => {
            //   Object.assign(row, {
            //     podCode: ''
            //   })
            //   this.polQuerySearch(queryString, 'port_of_destination', this.state, cb)
            // },
            // change: (val, row) => {
            //   Object.assign(row, {
            //     podCode: val
            //   })
            // },
            // select: (item, row) => {
            //   Object.assign(row, {
            //     podCode: item.key,
            //     podCode__save: item.key
            //   })
            //   this.changeSysLineDiabeld(row,true)
            // }
          },
          {
            prop: 'feederSchedule',
            label: '驳船预计开船时间',
            sortable: false,
            type: 'input',
            width: '120',
            formatter: (row, column) => {
              return row.feederSchedule ? row.feederSchedule : '--'
            },
            change: (val, row) => {
              Object.assign(row, {
                feederSchedule__save: val
              })
            }
          },
          {
            prop: 'priceGp20',
            label: '20GP',
            sortable: 'custom',
            type: 'text',
            width: '100',
            formatter: (row, column) => {
              let result=row.priceGp20?row.currency+" "+row.priceGp20:"--";
              return  `<span class="column-span">${result}</span>`
            },
          },
          {
            prop: 'priceGp40',
            label: '40GP',
            sortable: 'custom',
            type: 'text',
            width: '100',
            formatter: (row, column) => {
               let result=row.priceGp40?row.currency+" "+row.priceGp40:"--";
              return `<span class="column-span">${result}</span>`
            },
          },
          {
            prop: 'priceHq40',
            label: '40HQ',
            sortable: 'custom',
            type: 'text',
            width: '100',
            formatter: (row, column) => {
                let result=row.priceHq40?row.currency+" "+row.priceHq40:"--";
              return  `<span class="column-span">${result}</span>`
            },
          },
          {
            prop: 'priceHq45',
            label: '45HQ',
            sortable: 'custom',
            type: 'text',
            width: '100',
            formatter: (row, column) => {
              let result=row.priceHq45?row.currency+" "+row.priceHq45:"--";
              return `<span class="column-span">${result}</span>`
            },
          },
           {
            prop: 'priceNor20',
            label: 'NOR20',
            sortable: 'custom',
            type: 'text',
            width: '100',
            formatter: (row, column) => {
                let result=row.priceNor20?row.currency+" "+row.priceNor20:"--";
              return `<span class="column-span">${result}</span>`
            },
          },
           {
            prop: 'priceNor40',
            label: 'NOR40',
            sortable: 'custom',
            type: 'text',
            width: '100',
            formatter: (row, column) => {
               let result=row.priceNor40?row.currency+" "+row.priceNor40:"--";
              return `<span class="column-span">${result}</span>`
            },
          },
          {
            prop: 'surchargeList',
            label: '附加费',
            type: 'text',
            popoverComponent: TableColumnPopover,
            formatter: (row, column) => {
              return `<span class="column-span-btn">附加费</span>`
            },
            method: (index, row) => {
              this.handleEditSurcharge(index, row);
            },
            width: '80',
          },
          {
            prop: 'remark',
            label: '备注说明',
            sortable: false,
            type: 'input',
            width: '150',
            formatter: (row, column) => {
              return row.remark ? row.remark : '--'
            },
            change: (val, row) => {
              Object.assign(row, {
                remark__save: val
              })
            }
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
              return row.beginDate ? `<span style="white-space: nowrap;">${row.beginDate}-</br>${row.endDate}</span>` : '--'
            },
            change: (val, row) => {
              console.log(val)
              console.log(row)
              Object.assign(row, {
                beginDate__save: val,
              })
            }
          },
          {
            prop: 'maintainerName',
            label: '维护人',
            sortable: false,
            type: 'text',
            width: '100',
            formatter: (row, column) => {
              return row.maintainerName ? row.maintainerName : '--'
            },
            change: (val, row) => {
              Object.assign(row, {
                maintainerName__save: val
              })
            }
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

        // 批量操作按钮
        multiOperate: [
          {
            label: '批量修改',
            action: 'MultiEdit'
          },
          {
            label: '批量发布',
            action: 'MultiPublish'
          },
          {
            label: '批量失效',
            action: 'MultiInvalid'
          },
          {
            label: '批量删除',
            action: 'MultiDelete'
          }
        ],

        // 操作按钮组
        operationBtns: {
          width: '170',
          fixed: 'right',
          show: true,
          callback: (action, $index, row, item) => {
            
            if (action === 'Info') {
              this.handleInfo(row);
            }

            if (action === 'SingleEdit') {
              this.handleSingleEdit(row);
            }

            if (action === 'Copy') {
              this.handleCopy(row);
            }
            if (action === 'Delete') {
              let routeIdList=[row.routeId]
              this.handleDelete(routeIdList);
            }
          },
          data: [
            {
              label: '保存',
              type: 'text',
              show: false,
              action: 'SingleEdit'
            },
            {
              label: '编辑',
              type: 'text',
              show: true,
              className: 'orange',
              action: 'Info'
            },
            {
              label: '复制',
              type: 'text',
              show: true,
              action: 'Copy'
            },
             {
              label: '删除',
              type: 'text',
              show: true,
              className: 'red',
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
      // 显示批量修改的弹窗状态
      multiEditPopShow: false,
      // 附加费修改的弹窗状态
      editSurchargePopShow: false,
      isClickInfo: false
    }
  },
  beforeRouteLeave(to, from, next) {
		sessionStorage.removeItem('routeImportToFeederRoute')
		next()
	},
	beforeRouteEnter(to, from, next) {
	  if (from.name == 'RouteImport') {
			to.meta.isUseCache = false
	  } else {
	    to.meta.isUseCache = true
	  }
	  next();
	},
	destroyed() {
    sessionStorage.removeItem('routeImportToFeederRoute')
  },
  created() {
    this.init();
    this.getList();
    // this.getSearchConditionInfo()
  },
  mounted() {
    
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      publishStatus: state => state.dict.dictMap.publishStatus,
      feederRoute: state => state.charge.feederRoute,
      defaultColumns: state => state.charge.feederRoute.defaultColumns,
      specialColumns: state => state.charge.feederRoute.specialColumns,
      columnsBase: state => state.charge.feederRoute.columnsBase
    }),
    publishStatusOptions() {
      let publishStatusOptions = {}
      this.publishStatus.forEach(item => {
        publishStatusOptions[item.value] = item.label
      })
      return publishStatusOptions
    }
  },
  components: {
    Search,
    AddFilter,
    BaseTableMuti,
    TableFilter,
    CustomColumns,
    MultiEdit,
    SurchargeEdit,
    TableColumnPopover
  },
  methods: {
    init() {
      Object.assign(this.allFilterGroups, {
        all: this.filterGroups,
      })
      this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
    },
    // 后端没有配置模板
		initSearch() {
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
		},
    // 增加一条搜索条件
    handleAddFilter() {
      this.searchInputGroup.push({
        key: "",
        value: "",
        category: "all",
        queryValue: "",
      })
    },
    changeSysLineDiabeld(row,value){
      Object.assign(row, {
        sysLineCode: '',
        sysLineCode__save: '',
        sysLineCname__autocompleteValue:''
      })
      console.log(row)
    },
    // 起运港下拉列表自动补充的数据
    polQuerySearch(queryString='', portAttribute, state, cb) {
      queryString = queryString.trim() //去空格
      this.$store.dispatch('dict/basePortList', {queryString, portAttribute, state}).then(data => {
        cb(data)
      })
    },

    // 远程搜索港口下拉数据
    portSearch(queryString='', portAttribute, state, type, item) {
      queryString = queryString.trim() //去空格
      this.$store.dispatch('dict/basePortList', {queryString, portAttribute, state}).then(data => {
        // let portList = data.map(ele => {
        //   return Object.assign(ele, {
        //     label: ele.value,
        //     value: ele.key
        //   })
        // })
        // item.data = portList
        let filterArr = data.filter(ele => !item.saveList.find(o => o.value === ele.key))
				let itemList = filterArr.map(ele => {
					return {...ele, label: ele.value, value: ele.key}
				})
				item.data = [...item.saveList, ...itemList]
      })
    },

    // 船公司下拉列表自动补充的数据
    shipQuerySearch(queryString='', item) {
      queryString = queryString.trim() //去空格
      this.$store.dispatch('dict/baseShippingCarrierList', {name:queryString, state: 'valid'}).then(data => {
        item.data = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
      })
    },

    // 中转港下拉数据
    transitPortSearch(val='') {
      val = val.trim() //去空格
      this.$store.dispatch('dict/basePortList', val).then(data => {
        this.filterGroups.transitPortCodes.data = data
      })
    },

    // sysLineQuerySearch(queryString, cb) {
    //   this.$store.dispatch('dict/baseSystemLineList', {name: queryString, state: 'valid'}).then(data => {
    //     cb(data)
    //   })
    // },
    // 系统航线下拉列表自动补充的数据
    sysLineQuerySearch(queryString='', item) {
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

    // // 船公司下拉列表自动补充的数据
    // shipQuerySearch(queryString, cb) {
    //   this.$store.dispatch('dict/baseShippingCarrierList', queryString).then(data => {
    //     cb(data)
    //   })
    // },
    // 删除
    // 维护人
    employeeQuerySearch(queryString='', item) {
      queryString = queryString.trim() //去空格
      let params={};
      Object.assign(params, {
        name: queryString,
        state:'valid'
      })
      this.$store.dispatch('dict/employeeSelectlist', params).then(data => {
        // item.data = data.map(ele => {
        //   return Object.assign(ele, {
        //     label: ele.value,
        //     value: ele.key
        //   })
        // })
        let filterArr = data.filter(ele => !item.saveList.find(o => o.value === ele.key))
				let itemList = filterArr.map(ele => {
					return {...ele, label: ele.value, value: ele.key}
				})
				item.data = [...item.saveList, ...itemList]
      })
    },
    handleDelete(routeIdList) {
      let data = {}
      this.$confirm('是否确认删除海运整箱驳船费 的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: "true",
        type: "warning"
      }).then(() => {
        feederRouteDelete(Object.assign(data, {routeIds: routeIdList})).then(response => {
          this.$message({
            type: 'success',
            message: '删除成功',
            duration: 1000,
            onClose: () => {
              this.tableQuery.currPage=1 
              this.getList()
            }
          })
        })
      }).catch(function() {});
    },
    // 获取列表请求参数
    getListQuery() {
      let publishStatusQuery = [{'column': 'state', 'type': 'eq', 'value': this.tableQuery.state}]

      // 合并发布状态参数
      let data = {}
      Object.assign(data, this.tableQuery, {
        query: this.tableQuery.query.concat(publishStatusQuery)
      })
      delete(data.state)

      return data
    },

    // 列表数据
   async getList() {
      this.loading = true
      let publishStatusQuery = [{'column': 'state', 'type': 'eq', 'value': this.tableQuery.state}]
      let importId= {'column': 'importId', 'type': 'eq', 'value': this.$route.query.importId}
      // 合并发布状态参数
      let data = {}
      Object.assign(data, this.tableQuery, {
        query: this.tableQuery.query.concat(publishStatusQuery)
      })
      if(this.$route.query.importId){
        data.query.push(importId)
      }
      delete(data.state)
      let res = await columnWidthConfigInfo({
        scenesCode: this.$route.name
      })
			let { columnWidthList } =res.data
      feederRouteList(data).then(response => {
        let {list, totalCount, allColumns, configColumns} = response.data;
        this.tableConfig.list = list.map(item => {
          if (this.saveSelectedCheckbox && this.saveSelectedCheckbox.includes(item.routeId)) {
            item.selected = 'Y'
          }
          return {...item}
        })
        //处理特殊数据:系统航线，有效期
        this.handlerSpecialList();
        this.tableConfig.pagination.total = totalCount;
        this.tableConfig.pagination.hasNextPage = response.data.hasNextPage
            this.tableConfig.pagination.hasPreviousPage = response.data.hasPreviousPage
            this.tableConfig.pagination.isFirstPage = response.data.isFirstPage
            this.tableConfig.pagination.isLastPage = response.data.isLastPage
            this.tableQuery.currPage = response.data.currPage
            this.tableQuery.pageSize = response.data.pageSize
        this.tableConfig.configColumns = configColumns.length ? configColumns : this.defaultColumns;

        this.handleFilterColumns(this.tableConfig.configColumns)
        this.tableConfig.columns.map(item => {
          // 取服务器返回的宽度
          let findItem = columnWidthList.find(ele => ele.column === item.prop)
          let newWidth = findItem ? findItem.width : ''
          return Object.assign(item, { width: newWidth || item.width })
        })
        this.tableColumnsWidthList = this.getTableColumnsWidth()

      }).finally(() => {
        this.loading = false
      })
    },
    handlerSpecialList(){
      let portCodeArr = [];
      let portCodes = ''
      this.tableConfig.list.forEach(item=>{
        item.podCode ? portCodeArr.push(item.podCode) : ''
        Object.assign(item, {
          sysLineCname__autocompleteValue: item.sysLineCname,
          beginDate__dateValue: [item.beginDate, item.endDate],
        })
      })
      portCodes = portCodeArr.join(",")
      this.$store.dispatch('dict/basePortListByCodes', {portCodes}).then(data => {
        this.tableConfig.list.forEach(item => {
          Object.assign(item, {
            podCode__selectData: data
          })
        })
      })
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
              if (this.filterGroups[item.key].type !== "autocomplete") {
                // 中转港
                if (this.filterGroups[item.key].multiple) {
                  Object.assign(tempItem, {
                    column: item.key,
                    type: this.filterGroups[item.key].searchType || "eq",
                    value: item.value ? item.value.toString() : "",
                  })
                } else if (item.key === "beginDate") {
                  // 时间区间组件的value值是数组，['beginDate','endDate'],要转换成后端需要的两个字段
                  if (item.value) query.push(
                    { column: 'beginDate', type: "eq", value: item.value[0] },
                    { column: 'endDate', type: "eq", value: item.value[1] }
                  )
                } else if (item.key === "publishTime") {
                  // 时间区间组件的value值是数组，['publishBeginDate','publishEndDate'],要转换成后端需要的两个字段
                  if (item.value) query.push(
                    { column: 'publishBeginDate', type: "eq", value: item.value[0] },
                    { column: 'publishEndDate', type: "eq", value: item.value[1] }
                  )
                } else {
                  Object.assign(tempItem, {
                    column: item.key,
                    type: this.filterGroups[item.key].searchType || "eq",
                    value: item.value,
                  })
                }
              } else {
                Object.assign(tempItem, {
                  column: item.key,
                  type: this.filterGroups[item.key].searchType || "eq",
                  value: item.queryValue,
                })
              }

              if (item.key === "orderStatus") {
                this.tableQuery.orderStatus = item.value
              }
              query.push(tempItem)
            }
          })
        }

        Object.assign(this.tableQuery, {
          query: query.filter((item) => {
            return item.value
          }),
          currPage: 1,
        })
        console.log('serach:', this.tableQuery)
        this.getList()
      }
      if (action === 'Reset') {
				this.handleSearchValueReset()
			}
			// 模板加载后修改搜索组件的数组
			if (action === 'Update') {
				if (!param.length) return this.initSearch()
				this.searchInputGroup = [...param]
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
      //   Object.assign(this.tableConfig, {tips: {text: "", show: false}})
      // }
    },
    handleSearchValueReset() {
			this.searchInputGroup.map(item => {
				item.value = ''
				return {...item}
			})
			// console.log('重置')
		},
    // 新建
    handleAdd() {
      // this.isClickInfo = true
      // this.$router.push({
      //   path: 'feederRouteDetail'
      // })
      this.routerPush('FeederRouteDetail')
    },

    // table导出
    handleExport() {
      let data = this.getListQuery()
      let routeIds=this.getRouteIds()
      if(routeIds.length>0){
        let routeIdQuery= {'column': 'routeIds', 'type': 'eq', 'value': routeIds.join(",")}
        Object.assign(data, this.tableQuery, {
          query: this.tableQuery.query.concat(routeIdQuery)
        })
      }
      feederRouteExport(data).then(res => {
          this.downLoad(res.data.fileNo,res.data.name)
      })
    },
    downLoad(fileNo,fileName){
        this.$store.dispatch('charge/downloadBlobFile', {
            uri: '/base/webapi/file/download',
            params: {
              fileNo: fileNo
            }
          }).then(res => {
            let link = document.createElement("a")
            link.href = window.URL.createObjectURL(res);
            link.download =fileName
            link.click()
        })
    },

    // 点击批量修改
    handleMultiEdit(arr) {
      console.log('批量修改', this.selectedCheckbox)
      if(!this.selectedCheckbox.length) {
        return this.$message.error('请先选择驳船费数据')
      }
      this.multiEditPopShow = true;
      this.tableConfig.options.lockState = true;
    },

    // 批量发布
    handleMultiPublish(arr) {
      if(!this.selectedCheckbox.length) {
        return this.$message.error('请先选择驳船费数据')
      }
      this.$confirmWarn('确定发布这些数据吗？', () => {
        let data = {
          routeIds: this.getRouteIds()
        }
        const loading = this.$loading()
        feederRoutePublishBatch(data).then(response => {
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
        }).catch(err => {
          loading.close()
        })
      })
    },

    // 批量失效
    handleMultiInvalid(arr) {
      if(!this.selectedCheckbox.length) {
        return this.$message.error('请先选择驳船费数据')
      }
      this.$confirmWarn('确定失效这些数据吗？', () => {
        let data = {
          routeIds: this.getRouteIds()
        }
        const loading = this.$loading()
        feederRouteInvalidBatch(data).then(response => {
          this.saveSelectedCheckbox = response.data
          this.$message({
            type: 'success',
            message: '批量失效成功',
            duration: 1000,
            onClose: () => {
              this.tableQuery.currPage = 1
              this.getList()
              loading.close()
            }
          })
        }).catch(err => {
          loading.close()
        })
      })
    },
   // 批量删除
   handleMultiDelete() {
      if(!this.selectedCheckbox.length) {
        return this.$message.error('请先选择驳船费数据')
      }
      this.$confirmWarn('确定删除这些数据吗？', () => {
        let data = {
          routeIds: this.getRouteIds()
        }
        const loading = this.$loading()
        feederRouteDelete(data).then(response => {
          this.saveSelectedCheckbox = response.data
          this.$message({
            type: 'success',
            message: '删除成功',
            duration: 1000,
            onClose: () => {
              this.tableQuery.currPage=1 
              this.getList()
              loading.close()
            }
          })
        }).catch(err => {
          loading.close()
        })
      })
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
            this.getList()
          }
        }
      })
    },

    // 自定义表头
    handleCustomColumns() {
      this.customColumnsPopShow = true;
    },

    // 发布状态筛选
    handleSearchByPublishStatus() {
      this.tableConfig.operationBtns.data.map((item) => {
       if (item.action === 'Delete') {
        if(this.tableQuery.state==='unpublished'||this.tableQuery.state==='invalid'){
          // 解锁状态显示保存按钮 
          Object.assign(item, {
            show: true
          })
        }else {
          Object.assign(item, {
            show: false
          })
        }
       }
      })
      this.tableQuery.currPage = 1;
      this.getList();
    },

    // 多选
    handleMuti(arr) {
      this.selectedCheckbox = arr;
    },

    handleSizeChange() {
      this.getList()
    },

    handleCurrentChange() {
      let routeImportToFeederRoute = sessionStorage.getItem('routeImportToFeederRoute')
			if (routeImportToFeederRoute) {
				this.tableQuery.state = 'unpublished'
			}
      this.getList()
    },

    // 表格操作回调
    tableCallBack(action, arr) {
      console.log(action, arr)
      let fn = this['handle' + action]
      // Add、Export、CustomColumns、ChangeLockState、Muti、SizeChange、CurrentChange、SingleEdit
      // MultiEdit、 MultiPublish、MultiInvalid、MultiDelete
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },

    // 编辑附加费
    handleEditSurcharge(index, row) {
      feederRouteInfo({routeId: row.routeId}).then(response => {
        for (let i in this.createItem) {
          this.createItem[i] = response.data[i]
        }
        this.editSurchargePopShow = true
        console.log('createItem:', this.createItem)
      })
    },

    // 快捷修改单条
    handleSingleEdit(row) {
      let data = {}
      console.log(row)
      for (let i in row) {
        if (i.indexOf('__save') > -1) {
          data[i.replace('__save', '')] = row[i]
        }
      }

      if (data.beginDate) {
        let time = data.beginDate
        data.beginDate = time ? time[0] : ''
        data.endDate = time ? time[1] : ''
      }
      console.log(data);
      
      feederRouteSave(Object.assign(data, {routeId: row.routeId})).then(response => {
        this.$message({
          type: 'success',
          message: '修改成功',
          duration: 1000,
          onClose: () => {
            this.tableQuery.currPage = 1
            this.getList()
          }
        })
      })
    },
    handleRouteInfo(index, row) {
      this.handleInfo(row)
    },
    // 去详情页
    handleInfo(row) {
      // this.isClickInfo = true
      // this.$router.push({
      //   path: 'feederRouteDetail?id=' + row.routeId
      // })
      this.routerPush('FeederRouteDetail', {
        id: row.routeId
      })
    },

    // 复制
    handleCopy(row) {
      // this.isClickInfo = true
      // this.$router.push({
      //   path: 'feederRouteDetail?id=' + row.routeId + '&action=copy'
      // })
      this.routerPush('FeederRouteDetail', {
        id: row.routeId,
        action: 'copy'
      })
    },

    // 远程排序
    handleSort() {
      this.getList()
    },

    // 过滤显示自定义的表头
    handleFilterColumns(value) {
      let {allColumns, columns} = this.tableConfig
      Object.assign(this.tableConfig, {
        columns: allColumns.filter((item, index) => {
          return value.includes(item.prop)
        })
      })
      // console.log('tableColumns:', this.tableConfig.columns);
    },

    // 获取特殊处理的自定义表头，例：polCode,需要传polCode,polEname,polCname,podCode, podEname,podCname给后端
    getColumnsValues(value) {
      let result = ['routeId']
      value.map(item => {
        if (this.specialColumns[item]){
          result = result.concat(this.specialColumns[item])
        } else {
          result.push(item)
        }
      })
      
      result = Array.from(new Set(result))
      // console.log('result', result);

      return result
    },

    // 自定义表头关闭回调
    customColumnsPopClose(action, value) {
      console.log(action, value)
      this.customColumnsPopShow = false;
      if (action === 'Confirm') {
        let columnsKeys = this.getColumnsValues(value)
        // console.log('columnsKeys', columnsKeys);
        
        Object.assign(this.tableQuery, {
          columns: columnsKeys
        })
        this.getList()
      }
    },

    // 批量修改关闭回调
    multiEditPopClose(action, value) {
      if (action === 'Confirm') {
        this.handleMultiEditSubmit(value)
      } else {
        this.multiEditPopShow = false
      }
    },

    // 获取table选中行的routeid
    getRouteIds() {
      let routeIds = []
      this.selectedCheckbox.forEach(item => {
        routeIds.push(item.routeId)
      })
      return routeIds
    },

    // 批量修改提交
    handleMultiEditSubmit(value) {
      let data = Object.assign(value, {
        routeIds: this.getRouteIds()
      })
      const loading = this.$loading()
      feederRouteUpdateBatch(data).then(response => {
        this.saveSelectedCheckbox = response.data
        this.$message({
          type: 'success',
          message: '保存成功',
          duration: 1000,
          onClose: () => {
            this.tableQuery.currPage = 1
            this.tableQuery.state = 'unpublished'
            this.multiEditPopShow = false
            this.getList()
            loading.close()
          }
        })
      }).catch(err => {
        loading.close()
      })
    },

    // 附加费修改关闭回调
    surchargePopClose(action, value) {
      let data = {}
      Object.assign(data, {
        surchargeList: value,
        routeId: this.createItem.routeId
      })
      this.editSurchargePopShow = false;

      if (action === 'Confirm') {
        feederRouteSave(data).then(response => {
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
			}).then(res => {
				// console.log('res', res)
				// console.log('this.tableConfig.columns', this.tableConfig.columns)
				let { columnWidthList } = res.data
				// table列宽重新渲染
				this.tableConfig.columns.map(item => {
					let findItem = columnWidthList.find(ele => ele.column === item.prop)
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
			let result = this.tableConfig.columns.map(item => {
				return { column: item.prop, width: item.width }
			})
			return result
		},
		// 自定义列宽度保存
		handleSaveColumnWidth(params) {
			// console.log(params)
			let data = this.tableColumnsWidthList.map(item => {
				if (item.column === params.prop) {
					item.width = params.width
				}
				return { ...item }
			})
			columnWidthConfigSave({
				scenesCode: this.$route.name,
				columnWidthList: data
			})
				.then(res => {})
				.finally(() => {})
		},
  }
}
</script>
<style lang="scss" scoped>
.feederRoute-container{
  .input-container{
    width: 20%;
    margin-right: 15px;
    &.operation-btns-box{
      width: auto;
    }
  }
}
#feeder-route-table{
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
</style>
