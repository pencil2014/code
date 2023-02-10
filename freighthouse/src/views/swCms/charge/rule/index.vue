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
          <el-button type="primary" size="mini" @click="addPrice">新增</el-button>
          <el-button type="primary" size="mini" @click="addLast">新增兜底规则</el-button>
          <el-button type="danger" size="mini" @click="invalidPrice">批量失效</el-button>
        </div>
        <div class="money-box-right">
          <el-radio-group v-model="isEnable" size="mini" @change="search">
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
    <Add v-if="addOption.show" :option="addOption" />
    <Last v-if="lastOption.show" :option="lastOption" />
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import Add from '../components/add'
import Last from '../components/last'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { priceRuleList, groupList, priceRuleInvalid } from '@/api/swcms/index'
import { countrySelectList } from '@/api/base'
import { employeeSelectlist } from '@/api/companyResource'
export default {
  mixins: [mixin, routerMixin],
  components: {
    FinanceTableMass,
    FinanceSearch,
    Add,
    Last,
  },
  data() {
    return {
      loading: false,
      option1: {},
      searchOption: {},
      multipleSelection1: [],
      isEnable: 'yes',
      addOption: {
        show: false,
        type: 'add',
        data: '',
      },
      lastOption: {
        show: false,
        type: 'add',
        data: '',
      },
    }
  },
  created() {
    let searchInputGroup = ['podCode', 'sysLineCode', 'creatTime']
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
          // isEnable: {
          //   label: '是否有效',
          //   type: 'select',
          //   propInDict: 'yesNo',
          // },
          creatTime: {
            label: '创建时间',
            type: 'daterange',
            format: 'yyyy-MM-dd',
            ranges: ['createdTimeBegin', 'createdTimeEnd'],
          },
          createdBy: {
            label: '创建人',
            type: 'remoteSelect',
            remoteMethod: (val, item) => {
              this.getEmployeeList(val, item)
            },
            visibleChange: (val, item) => {
              if (!item.remoteSelectList.length) {
                this.getEmployeeList('', item)
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
          memGroupCode: {
            label: '客户群组',
            type: 'remoteSelect',
            remoteMethod: (val, item) => {
              this.getGroup(val, item)
            },
            visibleChange: (val, item) => {
              if (!item.remoteSelectList.length) {
                this.getGroup('', item)
              }
            },
            remoteSelectList: [],
          },
        },
      },
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: '编辑',
          show: true,
          action: 'edit',
          // style: {
          //   color: '#E9851F'
          // }
        },
        {
          label: '失效',
          showFn: (row) => {
            return row.isEnable === 'yes'
          },
          action: 'invalid',
          style: {
            color: '#CD4130',
          },
        },
      ],
      fixed: 'right',
      width: '100px',
      callback: (action, $index, row, option) => {
        if (action === 'invalid') {
          this.invalidSingle(row)
        } else if (action === 'edit') {
          this.editPrice(row)
        }
      },
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true,
      isNew: true,
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [],
      columns: [
        {
          prop: 'ruleCode',
          label: '编号',
          type: 'text',
          width: 120,
        },
        {
          prop: 'podCname',
          label: '目的港',
          type: 'text',
        },
        {
          prop: 'podCountryCname',
          label: '国家',
          type: 'text',
        },
        {
          prop: 'sysLineName',
          label: '航线',
          type: 'text',
        },
        {
          prop: 'shipCarrierCode',
          label: '船司',
          type: 'text',
        },
        {
          prop: 'memGroupName',
          label: '群组',
          type: 'text',
        },
        {
          prop: 'isEnable',
          label: '是否有效',
          // type: 'select',
          // propInDict: 'yesNo'
          formatter: ({ cellValue }) => {
            return cellValue === 'yes'
              ? `<span class="green">是</span>`
              : `<span class="red">否</span>`
          },
        },
        {
          prop: 'type',
          label: '规则类型',
          type: 'text',
          formatter: ({ cellValue, row }) => {
            let text = {
              normal: '普通',
              system: '兜底',
              '': '',
            }
            return text[cellValue]
          },
        },
        {
          prop: 'gp20Add',
          label: '20GP',
          type: 'text',
          formatter: ({ cellValue, row }) => {
            let { currency = 'USD' } = row
            return `<span class="red">${currency}:${cellValue}</span>`
          },
        },
        {
          prop: 'gp40Add',
          label: '40GP',
          type: 'text',
          formatter: ({ cellValue, row }) => {
            let { currency = 'USD' } = row
            return `<span class="red">${currency}:${cellValue}</span>`
          },
        },
        {
          prop: 'hq40Add',
          label: '40HQ',
          type: 'text',
          formatter: ({ cellValue, row }) => {
            let { currency = 'USD' } = row
            return `<span class="red">${currency}:${cellValue}</span>`
          },
        },
        {
          prop: 'hq45Add',
          label: '45HQ',
          type: 'text',
          formatter: ({ cellValue, row }) => {
            let { currency = 'USD' } = row
            return `<span class="red">${currency}:${cellValue}</span>`
          },
        },
        // {
        //   prop: 'nor20Add',
        //   label: '20NOR',
        //   type: 'text',
        //   width: 100,
        //   formatter: ({cellValue, row}) => {
        //     let {currency = 'USD'} = row
        //     return `<span class="red">${currency}: ${cellValue}</span>`
        //   }
        // },
        // {
        //   prop: 'nor40Add',
        //   label: '40NOR',
        //   type: 'text',
        //   width: 100,
        //   formatter: ({cellValue, row}) => {
        //     let {currency = 'USD'} = row
        //     return `<span class="red">${currency}: ${cellValue}</span>`
        //   }
        // },
        {
          prop: 'createdTime',
          label: '创建时间',
          type: 'text',
          width: 150,
        },
        {
          prop: 'createdName',
          label: '创建人',
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
        column: 'isEnable',
        type: 'eq',
        value: this.isEnable,
      })
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      priceRuleList(data)
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
    addPrice() {
      this.addOption.type = 'add'
      this.addOption.data = ''
      this.addOption.show = true
    },
    addLast() {
      this.lastOption.type = 'add'
      this.lastOption.data = ''
      this.lastOption.show = true
    },
    editPrice(row) {
      let { type } = row
      if (type === 'system') {
        this.lastOption.data = row
        this.lastOption.type = 'edit'
        this.lastOption.show = true
      } else {
        this.addOption.type = 'edit'
        this.addOption.data = row
        this.addOption.show = true
      }
    },
    invalidSingle(row) {
      let { groupPriceRuleId } = row
      this.$confirmWarn('是否确认失效该规则?', () => this.invalidFn([groupPriceRuleId]))
    },
    invalidPrice() {
      let len = this.multipleSelection1.length
      if (len < 1) {
        return this.$msgErrClose('请先选择需要失效的数据')
      }
      let groupPriceRuleIds = this.multipleSelection1.map((item) => item.groupPriceRuleId)
      this.$confirmWarn('是否确认失效该规则?', () => this.invalidFn(groupPriceRuleIds))
    },
    invalidFn(groupPriceRuleIds) {
      let data = {
        groupPriceRuleIds,
      }
      priceRuleInvalid(data)
        .then((res) => {
          if (res.code === 0) {
            this.getData()
            this.$msgSucClose('失效成功')
          }
        })
        .catch(() => {})
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
    // 所属员工下拉框
    getEmployeeList(queryString, item) {
      employeeSelectlist({ name: queryString, status: 'all' }).then((res) => {
        item.remoteSelectList = res.data.map(item => {
					return {
						label: item.cname,
						value: item.employeeId
					}
				})
      })
    },
    // 群组下拉
    getGroup(val = '', item) {
      let data = {
        currPage: 1,
        pageSize: 10,
        query: [
          {
            column: 'groupCname',
            type: 'like',
            value: val,
          },
        ],
      }
      groupList(data)
        .then((res) => {
          item.remoteSelectList = res.data.map((item) => {
            let { groupCname, groupCode } = item
            return {
              ...item,
              label: groupCname,
              value: groupCode,
            }
          })
        })
        .catch(() => {})
    },
  },
}
</script>
