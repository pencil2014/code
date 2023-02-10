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
          <el-button-group>
            <el-button @click="customColumnsPopShow=true" size="mini">自定义表头</el-button>
          </el-button-group>
          <el-button-group style="margin-left: 10px">
            <el-button type="danger" size="mini" @click="invalidPrice('')">批量失效</el-button>
          </el-button-group>
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
      <FinanceTable :option="option1" :autoMax="true" @send-multi="sendMulti" />
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{key:'prop',label:'label'}"
        @close="customColumnsPopClose"
      />
    </div>
  </div>
</template>

<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/views/finance/components/customColumns/index'
import { mixin } from '@/views/finance/mixins/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { countrySelectList } from '@/api/base'
import { webRouteList, webRouteInvalid, groupList, webRouteValid} from '@/api/swcms/index'
export default {
  mixins: [mixin, mixin2],
  components: {
    FinanceTable,
    FinanceSearch,
    CustomColumns
  },
  data() {
    return {
      loading: false,
      option1: {},
      searchOption: {},
      enable: 'yes',
      multipleSelection1: [],
      groupList: [],
      customColumnsPopShow: false,
      selfColumnsBase: []
    }
  },
  created() {
    this.getGroup()
    this.selfColumnsBase = [
      {
        prop: 'memPriceCode',
        label: '编号',
        width: 160,
        arrow: true,
        multi: true,
        callback: (row) => (row.toggle = !row.toggle)
      },
      {
        prop: 'feederPolEname',
        label: '驳船收货地',
        width: 100,
        multi: true,
        formatter: (row) => {
          let {feederPolEname, feederPolCname} = row
          return feederPolEname ? `${feederPolEname}(${feederPolCname})` : ''
        }
      },
      {
        prop: 'polEname',
        label: '大船起运港',
        width: 100,
        multi: true,
        formatter: (row) => {
          let {polEname, polCname} = row
          return polEname ? `${polEname}(${polCname})` : ''
        }
      },
      {
        prop: 'podEname',
        label: '目的港',
        width: 100,
        multi: true,
        formatter: (row) => {
          let {podEname, podCname} = row
          return podEname ? `${podEname}(${podCname})` : ''
        }
      },
      {
        prop: 'podCountryCname',
        label: '国家',
        width: 100,
        multi: true,
        formatter: (row) => {
          let { podCountryCname, podCountryEname} = row
          return podCountryEname ? `${podCountryEname}(${podCountryCname})`:''
        },
      },
      {
        prop: 'groupCname',
        label: '群组',
        multi: true,
        width: 100,
      },
      {
        prop: 'priceGp20',
        label: '20GP',
        width: 150,
        multi: true,
        formatter: (row) => {
          let {currency, memPriceGp20=0, priceGp20} = row
          if (priceGp20 === 0) {
            return '--'
          } else {
            return `<span>${currency}:${priceGp20}</span> / <span class="red">${currency}:${memPriceGp20}</span>`
          }
        }
      },
      {
        prop: 'priceGp40',
        label: '40GP',
        width: 150,
        multi: true,
        formatter: (row) => {
          let {currency,memPriceGp40=0, priceGp40} = row
          if (priceGp40 === 0) {
            return '--'
          } else {
            return `<span>${currency}:${priceGp40}</span> / <span class="red">${currency}:${memPriceGp40}</span>`
          }
        }
      },
      {
        prop: 'priceHq40',
        label: '40HQ',
        width: 150,
        multi: true,
        formatter: (row) => {
          let {currency,memPriceHq40=0, priceHq40} = row
          if (priceHq40 === 0) {
            return '--'
          } else {
            return `<span>${currency}:${priceHq40}</span> / <span class="red">${currency}:${memPriceHq40}</span>`
          }
        }
      },
      {
        prop: 'priceNor40',
        label: '40NOR',
        width: 150,
        multi: true,
        formatter: (row) => {
          let {currency,memPriceNor40=0, priceNor40} = row
          if (priceNor40 === 0) {
            return '--'
          } else {
            return `<span>${currency}:${priceNor40}</span> / <span class="red">${currency}:${memPriceNor40}</span>`
          }
        }
      },
      {
        prop: 'transitPort1Name',
        label: '中转港',
        width: 100,
        multi: true,
        formatter: (row) => {
          let { transitPort1Name, transitPort2Name, transitPort3Name } = row
          let val = [transitPort1Name, transitPort2Name, transitPort3Name].filter(item => !!item)
          return val.join(', ')
        },
      },
      {
        prop: 'sysLineName',
        label: '航线',
        width: 100,
        multi: true,
      },
      {
        prop: 'shipCarrierCode',
        label: '船司',
        width: 100,
        multi: true,
      },
      {
        prop: 'schedule',
        label: '截关/开船',
        width: 100,
        multi: true,
      },
      {
        prop: 'voyage',
        label: '航程',
        width: 100,
        multi: true,
      },
      {
        prop: 'enable',
        label: '是否有效',
        // type: 'text',
        // type: 'select',
        // propInDict: 'yesNo',
        width: 60,
        multi: true,
        formatter: (row) => {
          return row.enable === 'yes' ? `<span class="green">是</span>` : `<span class="red">否</span>`
        }
      },
      {
        prop: 'beginDate',
        label: '运价有效期',
        width: 150,
        multi: true,
        formatter: (row) => {
          let { beginDate, endDate } = row
          return beginDate ? `${beginDate} ~ ${endDate}` : ''
        },
      },
      {
        prop: 'createdTime',
        label: '创建时间',
        width: 150,
        multi: true,
      },
    ]
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
      columns: [...this.selfColumnsBase],
      tips: {
        text: '',
        show: false,
      },
      operationBtns,
      pagination,
      multiRow: true,
      multiKey: 'detailList',
      multiId: 'memPriceCode',
      border: true
    })
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
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
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
				data.columns = this.customColumnsKeys
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
            if (res.data.configColumns && res.data.configColumns.length) {
              let columns = res.data.configColumns
              this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
              this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
              this.configColumns = res.data.configColumns
            }
            this.option1.data = list
            this.option1.data = list.map((item) => ({ ...item, toggle: false }))
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
        oids = this.multipleSelection1.map((item) => item.webRouteId)
      } else {
        oids = [row.webRouteId]
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
      let oids = [row.webRouteId]
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

<style lang="scss" scoped>
.finance-page ::v-deep {
  .el-table {
    border-top: 1px solid #dfe6ec !important;
    border-left: 1px solid #dfe6ec !important;
  }
  .el-dialog__body {
    padding: 20px;
  }
  .el-dialog__footer {
    padding: 0 20px 20px;
  }
  .el-table th {
    padding: 4px 0;
  }
  .el-table--border th,
  .el-table--border td {
    border-right: 1px solid #dfe6ec !important;
    border-bottom: 1px solid #dfe6ec !important;
  }
  .el-table__body .el-table__row {
    height: auto !important;
    td:nth-of-type(2),
    td:nth-of-type(3),
    td:nth-of-type(4),
    td:nth-of-type(5),
    td:nth-of-type(6),
    td:nth-of-type(7),
    td:nth-of-type(8),
    td:nth-of-type(9),
    td:nth-of-type(10),
    td:nth-of-type(11),
    td:nth-of-type(12), 
    td:nth-of-type(13), 
    td:nth-of-type(14), 
    td:nth-of-type(15), 
    td:nth-of-type(16), 
    td:nth-of-type(17), 
    td:nth-of-type(18), 
    td:nth-of-type(19), 
    td:nth-of-type(20) {
      padding: 0;
      & > div {
        padding: 0;
        & > div {
          .el-tooltip{
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          min-height: 28px;
          line-height: 27px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-bottom: 1px solid #dfe6ec;
          &:nth-last-of-type(1),
          &.noBorder:nth-of-type(1) {
            border: none;
          }
          &.pl40:nth-of-type(2),
          &.pl40:nth-of-type(3),
          &.pl40:nth-of-type(4),
          &.pl40:nth-of-type(5) {
            padding-left: 40px;
          }
          // &.pl40:nth-of-type(3) {
          //   padding-left: 40px;
          // }
          // &.pl40:nth-of-type(4) {
          //   padding-left: 40px;
          // }
        }
      }
    }
  }
}
</style>
