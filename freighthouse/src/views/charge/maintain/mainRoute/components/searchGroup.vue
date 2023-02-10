<template>
  <div class="search-container">
    <Search
      :config.sync="searchConfig"
      :callback="searchCallBack"
      :tableQuery.sync="tableQuery"
      :searchFiledGroup="searchInputGroup" 
      :filterGroups="filterGroups">
      <!-- 新增条件下拉查询 -->
      <AddFilter 
        :searchConfig="searchConfig"
        :searchInputGroup="searchInputGroup"
        :defaultSearchLength="defaultSearchLength"
        :callback="searchCallBack"
        :item="item"
        :index="index"
        :filterGroups="filterGroups"
        v-for="(item, index) in searchInputGroup"
        :key="'filter' + index" />
      <div class="btn-plus-search" @click="handleAddFilter"></div>
    </Search>
  </div>
</template>
<script>
import { mapState } from 'vuex'

import Search from './search'
import AddFilter from './addFilter'
import {searchConditionInfo, searchConditionSave, searchConditionDelete, countrySelectList} from "@/api/base"

const defaultPage = {
  pageSize: 10,
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
  data () {
    return {
      defaultStyle: {
        width: '100%'
      },
      state: '',
      // searchConditionList: [],  // 自定义搜索模板集合
      defaultSearchLength: 0, // 默认显示搜索框的个数
      // 查询条件下拉选项
      filterGroups: {
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
            Object.assign(item, {
              queryValue: val,
              text: val
            })
          }
        },
        unloadingPortCode: {
          key: 'unloadingPortCode',
          label: '卸货港',
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
            this.portSearch('', 'port_of_discharge', this.state, 'unloadingPortCode', item)
          }, filterMehod: (val, item) => {
            this.portSearch(val, 'port_of_discharge', this.state, 'unloadingPortCode', item)
          }
        },
        sysLineCode: {
          key: 'sysLineCode', 
          label: '系统航线',
          type: 'remoteSelect',
          value: '',
          queryValue: '',
          data: [], nonDictionary: true,
          saveList: [],
          searchType: 'eq',
          multiple: true,
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
        shipTerms: {
          key: 'shipTerms', 
          label: '运输条款',
          type: 'select',
          value: '',
          queryValue: '',
          data: [], nonDictionary: true,
          saveList: [],
          searchType: 'eq',
          change: (val, item) => {
            Object.assign(item, {
              queryValue: val,
              text: val
            })
          }
        },
        transitPortCodes: {
          key: 'transitPortCodes',
          label: '中转港',
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
            this.portSearch('', 'port_of_basic', this.state, 'transitPortCodes', item)
          }, filterMehod: (val, item) => {
            this.portSearch(val, 'port_of_basic', this.state, 'transitPortCodes', item)
          }
        },
        attention: {key: 'attention', label: '特别提醒', type: 'input', value: '', searchType: 'like'},
        bkgAgentId: {key: 'bkgAgentId', label: '订舱代理', type: 'remoteSelect', value: '', searchType: 'eq', data: [], nonDictionary: true, saveList: [],
          visibleChange: (val, item) => {
            this.getSupplierList('bkg_agent', '', item)
          }, filterMehod: (val, item) => {
            this.getSupplierList('bkg_agent', val, item)
          }, change: (val, item) => {
            let findItem = item.data.find(ele => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        },
        // state: {key: 'state', label: '发布状态', type: 'select', value: '', searchType: 'eq'},
        recommendLevel: {label: '推荐', key: 'recommendLevel', type: 'select', value: '', searchType: 'eq', data: []},
        beginDate: {label: '有效期', key: 'beginDate', type: 'date', value: '', category: 'daterange', format: 'yyyy-MM-dd', searchType: 'eq'},
        effectiveType: {label: '有效类别', key: 'effectiveType', type: 'select', value: '', searchType: 'eq'},
        feederMatchMode: {label: '驳船匹配方式', key: 'feederMatchMode', type: 'select', value: '', searchType: 'eq'},
        schedule: {label: '船期', key: 'schedule', type: 'input', value: '', searchType: 'like'},
        carrierLineCode: {
          key: 'carrierLineCode', 
          label: '承运人航线',
          type: 'remoteSelect',
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
        pricer: {
          key: 'pricer', 
          label: '拿价人',
          type: 'remoteSelect',
          value: '',
          queryValue: '',
          data: [], nonDictionary: true,
          saveList: [],
          searchType: 'eq',
          visibleChange: (val, item) => {
            this.pricerQuerySearch('', item)
          }, filterMehod: (val, item) => {
            this.pricerQuerySearch(val, item)
          }, change: (val, item) => {
            let findItem = item.data.find(ele => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        },
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
            this.pricerQuerySearch('', item)
          }, filterMehod: (val, item) => {
            this.pricerQuerySearch(val, item)
          }, change: (val, item) => {
            let findItem = item.data.find(ele => ele.value === val)
            Object.assign(item, {
              queryValue: val,
              text: findItem ? findItem.label : ''
            })
          }
        },
        podCountryCode: {
          key: 'podCountryCode',
          label: '目的港国家',
          type: 'remoteSelect',
          value: '',
					data: [],
          nonDictionary: true,
          saveList: [],
          searchType: 'in',
          visibleChange: (val, item) => {
            this.getCountry('',item)
          }, filterMehod: (val, item) => {
            this.getCountry(val ,item)
          }
        },
        carrierService: { label: '航线代码', key: 'carrierService', type: 'input', value: '', searchType: 'like' },
        blankSailing: { label: '是否停航', key: 'blankSailing', type: 'select', value: '', searchType: 'eq', data: [
          {label: '是', value: 'Y'}, {label: '否', value: 'N'},
        ] },
        publishTime: {
          label: '发布时间', key: 'publishTime', type: 'date', value: '', category: 'daterange', format: 'yyyy-MM-dd', searchType: 'eq'
        },
        guidanceDesc: {label: '收货指引', key: 'guidanceDesc', type: 'input', value: '', searchType: 'like'},
      },
        
      searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),

      searchConfig: [],
      resDefaConfList: [],  // 后端配置的默认搜索模板
    }
  },
  props: {
    // 接口传参
    tableQuery: {
      type: Object,
      default: () => ({})
    },
    callback: {
      type: Function,
      default: () => ({})
    }
  },
  created() {
    // this.getSearchConditionInfo()
  },
  mounted() {
  },
  computed: {
    ...mapState({
      dictMap: state => state.dict.dictMap,
      publishStatus: state => state.dict.dictMap.publishStatus,
    }),
  },
  components: {
    Search,
    AddFilter
  },
  methods: {
    // 目的港国家
    getCountry (val='', item) {
      val = val.trim() //去空格
      let data = {
        countryCode: val,
        state: "valid",
      }
      countrySelectList(data).then(res => {
        item.data = res.data.map(item => {
            let { cname, ename, countryCode }= item
            return {
              label: cname || ename,
              value: countryCode,
            }
          })  
      }).catch(()=> {})
    },
    // 增加一条搜索条件
    handleAddFilter() {
      this.searchInputGroup.push({value: '', key: '', queryValue: ''})
    },

    // 获取订舱代理
    getSupplierList(type, queryString='', item) {
      queryString = queryString.trim() //去空格
      this.$store.dispatch('dict/queryBkgAgentSupplierList', { category: 'category', value: 'bkg_carrier,bkg_agent', queryString: queryString, categoryType: 'in' }).then(data => {
        if (data.list && data.list.length) {
          // item.data = data.list.map(ele => {
          //   return Object.assign(ele, {
          //     label: this.$language=='en' ? ele.ename : ele.name,
          //     value: ele.supplierId
          //   })
          // })
          let filterArr = data.list.filter(ele => !item.saveList.find(o => o.value === ele.supplierId))
          let itemList = filterArr.map(ele => {
            return {...ele, label: this.$language == 'en' ? ele.ename : ele.name, value: ele.supplierId ? Number(ele.supplierId) : ''}
          })
          item.data = [...item.saveList, ...itemList]
        }
      })
    },

    // 起运港下拉列表自动补充的数据
    polQuerySearch(queryString='', portAttribute, state, cb) {
      queryString = queryString.trim() //去空格
      this.$store.dispatch('dict/basePortList', {queryString, portAttribute, state}).then(data => {
        cb(data)
      })
    },

    // 远程搜索港口下拉数据
    portSearch(queryString = '', portAttribute, state, type, item) {
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

    // 船公司下拉列表自动补充的数据
    shipQuerySearch(queryString='', item) {
      queryString = queryString.trim() //去空格
      this.$store.dispatch('dict/baseShippingCarrierList', {name:queryString, state: ''}).then(data => {
        item.data = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
      })
    },

    // 运输条款下拉列表自动补充的数据
    shipTermsQuerySearch(queryString='', item) {
      queryString = queryString.trim() //去空格
      this.$store.dispatch('dict/baseShipTermsList', queryString).then(data => {
        item.data = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
      })
    },

    // 拿价人
    pricerQuerySearch(queryString='', item) {
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
    // 后端没有配置模板
		initSearch() {
			this.searchInputGroup = JSON.parse(JSON.stringify(defaultSearchInputGroup))
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
                // 时间区间组件要传两个参数，['beginDate','endDate'],endDate取数组后一个
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
                "column": item.key,
                "type": this.filterGroups[item.key].searchType || 'eq'
              })
              // 非自动补全的查询参数从item.value中取值合并到tableQuery
              if (this.filterGroups[item.key].type !== 'autocomplete') {
                Object.assign(tempItem, {
                  "value": item.value
                })
                if (item.key === 'transitPortCodes') {
                  Object.assign(tempItem, {
                    "value": item.value ? item.value.toString() : ''
                  })
                }
                if (this.filterGroups[item.key].multiple) {
                  Object.assign(tempItem, {
										column: item.key,
										type: this.filterGroups[item.key].searchType || 'eq',
										value: item.value ? item.value.toString() : ''
									})
                }
              }

              // 自动补全的查询参数从item.queryvalue中取值合并到query
              if (this.filterGroups[item.key].type === 'autocomplete' ) {
                Object.assign(tempItem, {
                  "value": item.queryValue
                })
              }
              query.push(tempItem)
            }
          })
        }

        Object.assign(this.tableQuery, {
          query: query,
          currPage: 1
        })
        this.callback('Search')
      }
      if (action === 'Reset') {
				this.handleSearchValueReset()
			}
			// 模板加载后修改搜索组件的数组
			if (action === 'Update') {
				if (!param.length) return this.initSearch()
				this.searchInputGroup = [...param]
			}
    },
    handleSearchValueReset() {
			this.searchInputGroup.map(item => {
				item.value = ''
				return {...item}
			})
			// console.log('重置')
		},
  }
}
</script>
<style scoped>

</style>  
