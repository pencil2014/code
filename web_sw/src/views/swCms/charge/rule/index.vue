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
          <el-button @click="customColumnsPopShow=true" size="mini">自定义表头</el-button>
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
      <FinanceTable :option="option1" @send-multi="sendMulti" />
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
    <Add v-if="addOption.show" :option="addOption" />
    <Last v-if="lastOption.show" :option="lastOption" />
  </div>
</template>

<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/views/finance/components/customColumns/index'
import Add from '../components/add'
import Last from '../components/last'
import { mixin } from '@/views/finance/mixins/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { priceRuleList, groupList, priceRuleInvalid } from '@/api/swcms/index'
import { countrySelectList } from '@/api/base'
import { employeeSelectlist } from '@/api/companyResource'
export default {
  mixins: [mixin, mixin2],
  components: {
    FinanceTable,
    FinanceSearch,
    Add,
    Last,
    CustomColumns
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
      customColumnsPopShow: false,
      selfColumnsBase: []
    }
  },
  created() {
    let searchInputGroup = ['podCode', 'sysLineCode', 'creatTime']
    this.selfColumnsBase = [
      {
        prop: 'ruleCode',
        label: '编号',
        width: 160,
        arrow: true,
        multi: true,
        callback: (row) => (row.toggle = !row.toggle)
      },
      {
        prop: 'podCname',
        label: '目的港',
        multi: true
      },
      {
        prop: 'podCountryCname',
        label: '国家',
        multi: true
      },
      {
        prop: 'sysLineName',
        label: '航线',
        multi: true
      },
      {
        prop: 'shipCarrierCode',
        label: '船司',
        multi: true
      },
      {
        prop: 'memGroupName',
        label: '群组',
        multi: true
      },
      {
        prop: 'isEnable',
        label: '是否有效',
        multi: true,
        // type: 'select',
        // propInDict: 'yesNo'
        formatter: (row) => {
          return row.isEnable === 'yes'
            ? `<span class="green">是</span>`
            : `<span class="red">否</span>`
        },
      },
      {
        prop: 'type',
        label: '规则类型',
        multi: true,
        formatter: (row) => {
          let text = {
            normal: '普通',
            system: '兜底',
            '': '',
          }
          return text[row.type]
        },
      },
      {
        prop: 'gp20Add',
        label: '20GP',
        multi: true,
        formatter: (row) => {
          let { gp20Add } = row
          return `<span class="red">${gp20Add}</span>`
        },
      },
      {
        prop: 'gp40Add',
        label: '40GP',
        multi: true,
        formatter: (row) => {
          let { gp40Add } = row
          return `<span class="red">${gp40Add}</span>`
        },
      },
      {
        prop: 'hq40Add',
        label: '40HQ',
        multi: true,
        formatter: (row) => {
          let { hq40Add } = row
          return `<span class="red">${hq40Add}</span>`
        },
      },
      {
        prop: 'nor40Add',
        label: '40NOR',
        multi: true,
        formatter: (row) => {
          let { nor40Add } = row
          return `<span class="red">${nor40Add}</span>`
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
        multi: true,
        width: 150,
      },
      {
        prop: 'createdName',
        label: '创建人',
        multi: true,
        width: 150,
      },
    ]
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
            return row.isEnable === 'yes' && row.type === 'normal'
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
            if (res.data.configColumns && res.data.configColumns.length) {
              let columns = res.data.configColumns
              console.log(1, columns, this.selfColumnsBase)
              this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
              console.log(2, this.option1.columns)
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
