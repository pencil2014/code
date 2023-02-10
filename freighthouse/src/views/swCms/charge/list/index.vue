<template>
  <div
    class="finance-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" :border="true" />
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button type="danger" size="mini" @click="invalidPrice('')">批量失效</el-button>
        </div>
        <div class="money-box-right">
          <el-radio-group size="mini" v-model="enable" @change="search">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="yes">有效</el-radio-button>
            <el-radio-button label="no">失效</el-radio-button>
          </el-radio-group>
          <el-button-group style="margin-left: 10px"
            ><el-button size="mini" type="primary" @click="search">刷新</el-button></el-button-group
          >
        </div>
      </div>
      <FinanceTableMass :option="option1" @send-multi="sendMulti" />
    </div>
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { countrySelectList } from '@/api/base'
import { webRouteList, webRouteInvalid, groupList, webRouteValid} from '@/api/swcms/index'
export default {
  mixins: [mixin, routerMixin],
  components: {
    FinanceTableMass,
    FinanceSearch,
  },
  data() {
    return {
      loading: false,
      option1: {},
      searchOption: {},
      enable: 'yes',
      multipleSelection1: [],
      groupList: []
    }
  },
  created() {
    this.getGroup()
    let searchInputGroup = ['polCode', 'podCode', 'beginCreatedTime']
    this.searchOption = {
      saveShow: true,
      isNotAutoLoad: false,
      addFilter: {
        defaultSearchLength: 3,
        searchInputGroup: searchInputGroup.map((key) => ({
          key,
          value: '',
          range: { min: '', max: '' },
        })),
        filterGroups: {
          polCode: {
            label: '起运港',
            type: 'remoteSelect',
            remoteMethod: (val, item) => {
              this.portSearch(val, item, 'port_of_basic')
            },
            visibleChange: (val, item) => {
              this.portSearch('', item, 'port_of_basic')
            },
            remoteSelectList: [],
          },
          podCode: {
            label: '目的港',
            type: 'remoteSelect',
            remoteMethod: (val, item) => {
              this.portSearch(val, item, 'port_of_destination')
            },
            visibleChange: (val, item) => {
              this.portSearch('', item, 'port_of_destination')
            },
            remoteSelectList: [],
          },
          beginCreatedTime: { label: '发布时间', type: 'daterange', format: 'yyyy-MM-dd', ranges: ['beginCreatedTime', 'endCreatedTime']},
          feederPolCode: {
            label: '驳船收货地',
            type: 'remoteSelect',
            remoteMethod: (val, item) => {
              this.portSearch(val, item, 'port_of_feeder')
            },
            visibleChange: (val, item) => {
              if (!item.remoteSelectList.length) {
                this.portSearch('', item, 'port_of_feeder')
              }
            },
            remoteSelectList: [],
          },
          podCountryCode: {
            label: '国家',
            type: 'remoteSelect',
            remoteMethod: (val, item) => {
              this.countryQuerySearch(val, item)
            },
            visibleChange: (val, item) => {
              if (!item.remoteSelectList.length) {
                this.countryQuerySearch('', item)
              }
            },
            remoteSelectList: [],
          },
          sysLineCode: {
            label: '航线',
            type: 'remoteSelect',
            remoteMethod: (val, item) => {
              this.sysLineQuerySearchList(val, item)
            },
            visibleChange: (val, item) => {
              if (!item.remoteSelectList.length) {
                this.sysLineQuerySearchList('', item)
              }
            },
            remoteSelectList: [],
          },
          shipCarrierCode: {
            label: '船司',
            type: 'remoteSelect',
            remoteMethod: (val, item) => {
              this.shipQuerySearch(val, item)
            },
            visibleChange: (val, item) => {
              if (!item.remoteSelectList.length) {
                this.shipQuerySearch('', item)
              }
            },
            remoteSelectList: [],
          },
          // etdTime: { label: '开船时间', type: 'date', format: 'yyyy-MM-dd', },
          beginDate: { label: '运价有效期', type: 'daterange', format: 'yyyy-MM-dd',  ranges:['beginDate','endDate'] },
          memGroupCode: {
            label: '群组',
            type: 'select',
            selectOptions: this.groupList,
          }
        },
      },
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: '失效',
          showFn: (row) => row.enable === 'yes',
          action: 'check',
          style: {
            color: '#CD4130'
          }
        },
        {
          label: '有效',
          showFn: (row) => row.baseRouteEnable === 'yes',
          action: 'enable',
          style: {
            color: '#1890ff'
          }
        },
      ],
      fixed: 'right',
      callback: (action, $index, row, option) => {
        if (action === 'check') {
          this.invalidPrice(row)
        }
        if (action === 'enable') {
          this.validPrice(row)
        }
      },
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true, isNew: true 
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [],
      columns: [
        {
          prop: 'memPriceCode',
          label: '编号',
          type: 'text',
          width: 120,
        },
        {
          prop: 'feederPolEname',
          label: '驳船收货地',
          type: 'text',
          width: 100,
          formatter: ({row}) => {
            let {feederPolEname, feederPolCname} = row
            return feederPolEname ? `${feederPolEname}(${feederPolCname})` : ''
          }
        },
        {
          prop: 'polEname',
          label: '大船起运港',
          type: 'text',
          width: 100,
          formatter: ({row}) => {
            let {polEname, polCname} = row
            return polEname ? `${polEname}(${polCname})` : ''
          }
        },
        {
          prop: 'podEname',
          label: '目的港',
          type: 'text',
          width: 100,
          formatter: ({row}) => {
            let {podEname, podCname} = row
            return podEname ? `${podEname}(${podCname})` : ''
          }
        },
        {
          prop: 'podCountryCname',
          label: '国家',
          type: 'text',
          width: 100,
          formatter: ({ row }) => {
            let { podCountryCname, podCountryEname} = row
            return podCountryEname ? `${podCountryEname}(${podCountryCname})`:''
          },
        },
        {
          prop: 'groupCname',
          label: '群组',
          type: 'text',
          width: 100,
        },
        {
          prop: 'priceGp20',
          label: '20GP',
          type: 'text',
          width: 150,
          formatter: ({cellValue, row}) => {
            let {currency='USD',memPriceGp20=0} = row
            if (cellValue === 0) {
              return '--'
            } else {
              return `<span>${currency}:${cellValue}</span> / <span class="red">${currency}:${memPriceGp20}</span>`
            }
          }
        },
        {
          prop: 'priceGp40',
          label: '40GP',
          type: 'text',
          width: 150,
          formatter: ({cellValue, row}) => {
            let {currency='USD',memPriceGp40=0} = row
            if (cellValue === 0) {
              return '--'
            } else {
              return `<span>${currency}:${cellValue}</span> / <span class="red">${currency}:${memPriceGp40}</span>`
            }
          }
        },
        {
          prop: 'priceHq40',
          label: '40HQ',
          type: 'text',
          width: 150,
          formatter: ({cellValue, row}) => {
            let {currency='USD',memPriceHq40=0} = row
            if (cellValue === 0) {
              return '--'
            } else {
              return `<span>${currency}:${cellValue}</span> / <span class="red">${currency}:${memPriceHq40}</span>`
            }
          }
        },
        {
          prop: 'priceHq45',
          label: '45HQ',
          type: 'text',
          width: 150,
          formatter: ({cellValue, row}) => {
            let {currency='USD',memPriceHq45=0} = row
            if (cellValue === 0) {
              return '--'
            } else {
              return `<span>${currency}:${cellValue}</span> / <span class="red">${currency}:${memPriceHq45}</span>`
            }
          }
        },
        {
          prop: 'transitPort1Name',
          label: '中转港',
          type: 'text',
          width: 100,
          formatter: ({ row }) => {
            let { transitPort1Name, transitPort2Name, transitPort3Name } = row
            let val = [transitPort1Name, transitPort2Name, transitPort3Name].filter(item => !!item)
            return val.join(', ')
          },
        },
        {
          prop: 'sysLineName',
          label: '航线',
          type: 'text',
          width: 100,
        },
        {
          prop: 'shipCarrierCode',
          label: '船司',
          type: 'text',
          width: 100,
        },
        {
          prop: 'schedule',
          label: '截关/开船',
          type: 'text',
          width: 100,
        },
        {
          prop: 'voyage',
          label: '航程',
          type: 'text',
          width: 100,
        },
        // {
        //   prop: 'priceNor20',
        //   label: 'NOR20',
        //   type: 'text',
        //   width: 100,
        //   formatter: ({cellValue, row}) => {
        //     let {currency='USD'} = row
        //     return `<span class="red">${currency}: ${cellValue}</span>`
        //   }
        // },
        // {
        //   prop: 'priceNor40',
        //   label: 'NOR40',
        //   type: 'text',
        //   width: 100,
        //   formatter: ({cellValue, row}) => {
        //     let {currency = 'USD'} = row
        //     return `<span class="red">${currency}: ${cellValue}</span>`
        //   }
        // },
        {
          prop: 'enable',
          label: '是否有效',
          type: 'text',
          // type: 'select',
          // propInDict: 'yesNo',
          width: 60,
          formatter: ({cellValue}) => {
            return cellValue === 'yes' ? `<span class="green">是</span>` : `<span class="red">否</span>`
          }
        },
        {
          prop: 'beginDate',
          label: '运价有效期',
          type: 'text',
          width: 150,
          formatter: ({ cellValue, row }) => {
            let { beginDate, endDate } = row
            return beginDate ? `${beginDate} ~ ${endDate}` : ''
          },
        },
        {
          prop: 'createdTime',
          label: '创建时间',
          type: 'text',
          width: 150,
        },
      ],
      tips: {
        text: '',
        show: false,
      },
      operationBtns,
      pagination,
    })
  },
  methods: {
    // 搜索按钮
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    // 封装请求参数并请求列表
    getData(isSearch) {
      this.loading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
      }
      this.finCommonSearch(data.query, this.searchOption)
      data.query.push({
        column: 'enable',
        type: 'eq',
        value: this.enable,
      })
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      webRouteList(data)
        .then((res) => {
          if (res.code === 0) {
            let { list } = res.data
            this.option1.data = list
            Object.assign(this.option1.pagination, res.data)
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    // 批量失效
    invalidPrice(row) {
      let oids = []
      if (!row) {
        let len = this.multipleSelection1.length
        if (len < 1) {
          return this.$msgErrClose('请先选择需要操作的数据')
        }
        oids = this.multipleSelection1.map((item) => item.oid)
      } else {
        oids = [row.oid]
      }
      this.$confirmWarn('是否确认失效所选运价?', () => {
        let data = {
          oids,
        }
        webRouteInvalid(data)
          .then((res) => {
            if (res.code === 0) {
              this.getData()
              this.$msgSucClose('运价失效成功!')
            }
          })
          .catch(() => {})
      })
    },
    // 生效
    validPrice(row) {
      let oids = [row.oid]
      this.$confirmWarn('是否确认生效所选运价?', () => {
        let data = {
          oids,
        }
        webRouteValid(data)
          .then((res) => {
            if (res.code === 0) {
              this.getData()
              this.$msgSucClose('运价生效成功!')
            }
          })
          .catch(() => {})
      })
    },
    sendMulti(data, option) {
      this.multipleSelection1 = data
    },
    // 分页
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    // 分页
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    // 远程搜索港口下拉数据 port_of_basic  port_of_destination
    portSearch(queryString, item, port) {
      let data = {
        queryString
      }
      this.$store.dispatch('dict/basePortList', data).then((data) => {
        item.remoteSelectList = data.map((item) => {
          return {
            label: item.value,
            value: item.portCode,
          }
        })
      })
    },
    // 航线
    sysLineQuerySearchList(queryString, item) {
      this.$store
        .dispatch('dict/baseSystemLineList', { name: queryString, state: 'valid' })
        .then((data) => {
          item.remoteSelectList = data.map((ele) => {
            return Object.assign(ele, {
              label: ele.value,
              value: ele.key,
            })
          })
        })
    },
    // 船公司
    shipQuerySearch(queryString, item) {
      this.$store
        .dispatch('dict/baseShippingCarrierList', { name: queryString, state: 'valid' })
        .then((data) => {
          item.remoteSelectList = data.map((ele) => {
            return Object.assign(ele, {
              label: ele.value,
              value: ele.key,
            })
          })
        })
    },
    // 国家
    countryQuerySearch(queryString, item) {
      let data = {
        countryCode: queryString,
        state: 'valid',
      }
      countrySelectList(data)
        .then((res) => {
          item.remoteSelectList = res.data.map((item) => {
            let { cname, ename, countryCode } = item
            return {
              label: `${cname}(${ename})`,
              value: countryCode,
            }
          })
        })
        .catch(() => {})
    },
    getGroup() {
      let data = {
        enable: 'yes',
      }
      groupList(data)
        .then((res) => {
          let base = res.data.map((item) => {
            let { groupCname, groupCode } = item
            return {
              ...item,
              label: groupCname,
              value: groupCode,
            }
          })
          this.groupList.splice(0, 1000, ...base)
        })
        .catch(() => {})
    },
  },
}
</script>
