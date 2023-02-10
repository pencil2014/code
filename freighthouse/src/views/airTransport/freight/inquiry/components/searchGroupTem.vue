<template>
  <div class="search-container">
    <Search ref="search" :config.sync="searchConfig" :callback="searchCallBack" :tableQuery.sync="tableQuery" :searchFiledGroup="searchInputGroup" :filterGroups="filterGroups">
      <AddFilter :searchInputGroup="searchInputGroup" :allFilterGroups="allFilterGroups" :filterGroups="filterGroups" :defaultSearchLength="defaultSearchLength" :callback="searchCallBack" :index="index" :item="item" v-for="(item, index) in searchInputGroup" :key="'filter' + index" />
      <div class="btn-plus-search" @click="handleAddFilter" ref="btnPlus"></div>
    </Search>
  </div>
</template>
<script>
import { mapState } from 'vuex'

import Search from '@/components/Base/Search/index'
import AddFilter from '@/components/Base/Search/addFilter'
import { countrySelectList, baseEmployeeListName } from '@/api/base'

const defaultSearchInputGroup = [
  {
    key: 'templateName',
    value: '',
    placeholder: '筛选条件',
    category: 'all',
    queryValue: ''
  },
  {
    key: 'createdBy',
    value: '',
    placeholder: '筛选条件',
    category: 'all',
    queryValue: ''
  }
]
export default {
  data() {
    return {
      defaultStyle: {
        width: '100%'
      },
      state: '',
      // searchConditionList: [],  // 自定义搜索模板集合
      defaultSearchLength: 0, // 默认显示搜索框的个数
      allFilterGroups: {
        all: this.filterGroups
      },
      // 查询条件下拉选项
      filterGroups: {
        templateName: {
          key: 'templateName',
          label: '附加费名称',
          type: 'input',
          searchType: 'like',
          value: ''
        },
        createdBy: {
          key: 'createdBy',
          label: '创建人',
          type: 'remoteSelect',
          value: '',
          queryValue: '',
          data: [],
          nonDictionary: true,
          saveList: [],
          searchType: 'eq',
          visibleChange: (val, item) => {
            this.pricerQuerySearch('', item)
          },
          filterMehod: (val, item) => {
            this.pricerQuerySearch(val, item)
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

      searchInputGroup: JSON.parse(JSON.stringify(defaultSearchInputGroup)),

      searchConfig: [],
      resDefaConfList: [] // 后端配置的默认搜索模板
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
    this.init()
  },
  mounted() {},
  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      publishStatus: (state) => state.dict.dictMap.publishStatus
    })
  },
  components: {
    Search,
    AddFilter
  },
  methods: {
    init() {
      Object.assign(this.allFilterGroups, {
        all: this.filterGroups
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
    // 目的港国家
    getCountry(val, item) {
      let data = {
        countryCode: val,
        state: 'valid'
      }
      countrySelectList(data)
        .then((res) => {
          if (res.data?.length) {
            item.data = res.data.map((item) => {
              let { cname, ename, countryCode } = item
              return {
                label: cname,
                value: cname
              }
            })
          }
        })
        .catch(() => {})
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
          if (data.list && data.list.length) {
            // item.data = data.list.map(ele => {
            //   return Object.assign(ele, {
            //     label: this.$language=='en' ? ele.ename : ele.name,
            //     value: ele.supplierId
            //   })
            // })
            let filterArr = data.list.filter(
              (ele) => !item.saveList.find((o) => o.value === ele.supplierId)
            )
            let itemList = filterArr.map((ele) => {
              return {
                ...ele,
                label: this.$language == 'en' ? ele.ename : ele.name,
                value: ele.supplierId ? Number(ele.supplierId) : ''
              }
            })
            item.data = [...item.saveList, ...itemList]
          }
        })
    },

    // 起运港下拉列表自动补充的数据
    polQuerySearch(queryString, portAttribute, state, cb) {
      this.$store
        .dispatch('dict/basePortList', { queryString, portAttribute, state })
        .then((data) => {
          cb(data)
        })
    },

    // 远程搜索港口下拉数据
    portSearch(queryString, portAttribute, state, type, item) {
      this.$store
        .dispatch('dict/basePortList', { queryString, portAttribute, state })
        .then((data) => {
          // let portList = data.map(ele => {
          //   return Object.assign(ele, {
          //     label: ele.value,
          //     value: ele.key
          //   })
          // })
          // item.data = portList
          let filterArr = data.filter(
            (ele) => !item.saveList.find((o) => o.value === ele.key)
          )
          let itemList = filterArr.map((ele) => {
            return { ...ele, label: ele.value, value: ele.key }
          })
          item.data = [...item.saveList, ...itemList]
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
              value: ele.key
            })
          })
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
    // 维护人
    pricerQuerySearch(queryString, item) {
      let params = {
        name: queryString ? queryString.replace(/^\s+|\s+$/g, '') : '',
        roleCode: '' //pricing
      }
      baseEmployeeListName(params).then((res) => {
        // 单选下拉不保存选择后的数据
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
    // 后端没有配置模板
    initSearch() {
      this.searchInputGroup = JSON.parse(
        JSON.stringify(defaultSearchInputGroup)
      )
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
            if (['publishTime', 'beginDate'].includes(item.key)) {
              // 时间区间组件要传两个参数，['beginDate','endDate'],endDate取数组后一个
              if (item.key === 'beginDate' && item.value?.length) {
                query.push(
                  { column: 'beginDate', type: 'eq', value: item.value[0] },
                  { column: 'endDate', type: 'eq', value: item.value[1] }
                )
              }
              if (item.key === 'publishTime' && item.value?.length) {
                query.push(
                  {
                    column: 'publishBeginDate',
                    type: 'eq',
                    value: item.value[0]
                  },
                  { column: 'publishEndDate', type: 'eq', value: item.value[1] }
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
                if (item.key === 'transitPortCodes') {
                  Object.assign(tempItem, {
                    value: item.value ? item.value.toString() : ''
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
              if (this.filterGroups[item.key].type === 'autocomplete') {
                Object.assign(tempItem, {
                  value: item.queryValue
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
      this.searchInputGroup.map((item) => {
        item.value = ''
        return { ...item }
      })
      // console.log('重置')
    }
  }
}
</script>
<style scoped>
</style>  
