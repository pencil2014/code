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
            <el-button size="mini" type="primary" @click="showAdd">新建</el-button>
          </el-button-group>
          <el-button-group style="margin-left: 10px">
            <el-button size="mini" type="danger" @click="invalidDiscount('mul')"
              >批量失效</el-button
            >
          </el-button-group>
        </div>
        <div class="money-box-right">
          <el-radio-group size="mini" v-model="enable" @change="search">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="yes">有效</el-radio-button>
            <el-radio-button label="no">失效</el-radio-button>
          </el-radio-group>
          <el-button-group style="margin-left:10px">
            <el-button size="mini" type="primary" @click="search">刷新</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTableMass :option="option1" @send-multi="sendMulti" />
    </div>
    <Add :addOption="addOption" @cancel="cancel" />
    <Price :option="priceOption" v-if="priceOption.show"  @submit="submitPrice"/>
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import Add from '../components/add'
import Price from '../components/price'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { countrySelectList } from '@/api/base'
import { discountList, discountInvalid, saveDiscountRoute } from '@/api/swcms/index'
export default {
  mixins: [mixin, routerMixin],
  components: {
    FinanceTableMass,
    FinanceSearch,
    Add,
    Price
  },
  data() {
    return {
      loading: false,
      enable: 'yes',
      option1: {},
      searchOption: {},
      addOption: {
        show: false,
      },
      priceOption: {
        show: false,
        data: {},
        type: 'edit'
      }
    }
  },
  created() {
    let searchInputGroup = ['polCode', 'feederPolCode', 'podCode']
    this.searchOption = {
      saveShow: true,
      isNotAutoLoad: false,
      
      addFilter: {
        defaultSearchLength: 4,
        searchInputGroup: searchInputGroup.map((key) => ({
          key,
          value: '',
          range: { min: '', max: '' },
        })),
        filterGroups: {
          polCode: {
            label: '大船起运港',
            type: 'remoteSelect',
            remoteMethod: (val, item) => {
              this.portSearch(val, item, 'port_of_basic')
            },
            visibleChange: (val, item) => {
              if (!item.remoteSelectList.length) {
                this.portSearch('', item, 'port_of_basic')
              }
            },
            remoteSelectList: [],
          },
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
          podCode: {
            label: '目的港',
            type: 'remoteSelect',
            remoteMethod: (val, item) => {
              this.portSearch(val, item, 'port_of_destination')
            },
            visibleChange: (val, item) => {
              if (!item.remoteSelectList.length) {
                this.portSearch('', item, 'port_of_destination')
              }
            },
            remoteSelectList: [],
          },
          // enable: {
          //   label: '是否有效',
          //   type: 'select',
          //   propInDict: 'yesNo',
          // },
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
          // etdTime: { label: '开船时间', type: 'date', format: 'yyyy-MM-dd' },
          beginDate: { label: '运价有效期', type: 'daterange', format: 'yyyy-MM-dd', ranges:['beginDate','endDate'] },
          discountBeginDate: { label: '特价有效期', type: 'daterange', format: 'yyyy-MM-dd', ranges:['discountBeginDate','discountEndDate'] },
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
          showFn: (row) => row.enable === 'yes',
          action: 'invalid',
          style: {
            color: '#CD4130'
          }
        },
      ],
      fixed: 'right',
      width: '100px',
      callback: (action, $index, row, option) => {
        if (action === 'edit') {
          this.editDiscount(row)
        } else if (action === 'invalid') {
          this.invalidDiscount('single', row)
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
          prop: 'webRouteCode',
          label: '编号',
          type: 'text',
          width: 100,
        },
        {
          prop: 'feederPolEname',
          label: '驳船收货地',
          type: 'text',
          width: 100,
          formatter: ({ cellValue, row }) => {
            let { feederPolEname, feederPolCname } = row
            return feederPolEname ? `${feederPolEname}(${feederPolCname})` : ''
          },
        },
        {
          prop: 'polEname',
          label: '大船起运港',
          type: 'text',
          width: 100,
          formatter: ({ cellValue, row }) => {
            let { polEname, polCname } = row
            return polEname ? `${polEname}(${polCname})` : ''
          },
        },
        {
          prop: 'podEname',
          label: '目的港',
          type: 'text',
          width: 100,
          formatter: ({ cellValue, row }) => {
            let { podEname, podCname } = row
            return podEname ? `${podEname}(${podCname})` : ''
          },
        },
        {
          prop: 'priceGp20',
          label: '20GP',
          type: 'text',
          width: 150,
          formatter: ({cellValue, row}) => {
            let {currency = 'USD', discountPriceGp20} = row
            return `<span>${currency}:${cellValue}</span> / <span class="red">${currency}:${discountPriceGp20}</span>`
          }
        },
        {
          prop: 'priceGp40',
          label: '40GP',
          type: 'text',
          width: 150,
          formatter: ({cellValue, row}) => {
            let {currency = 'USD', discountPriceGp40} = row
            return `<span>${currency}:${cellValue}</span> / <span class="red">${currency}:${discountPriceGp40}</span>`
          }
        },
        {
          prop: 'priceHq40',
          label: '40HQ',
          type: 'text',
          width: 150,
          formatter: ({cellValue, row}) => {
            let {currency = 'USD', discountPriceHq40} = row
            return `<span>${currency}:${cellValue}</span> / <span class="red">${currency}:${discountPriceHq40}</span>`
          }
        },
        {
          prop: 'priceHq45',
          label: '45HQ',
          type: 'text',
         width: 150,
          formatter: ({cellValue, row}) => {
            let {currency = 'USD', discountPriceHq45} = row
            return `<span>${currency}:${cellValue}</span> / <span class="red">${currency}:${discountPriceHq45}</span>`
          }
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
        // {
        //   prop: 'endDate',
        //   label: '开船时间',
        //   type: 'text',
        //   width: 100,
        // },
        {
          prop: 'voyage',
          label: '航程',
          type: 'text',
          width: 100,
        },
        {
          prop: 'enable',
          label: '是否有效',
          // type: 'select',
          // propInDict: 'yesNo',
          width: 100,
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
            return `${beginDate} ~ ${endDate}`
          },
        },
        {
          prop: 'discountBeginDate',
          label: '特价有效期',
          type: 'text',
          width: 150,
          formatter: ({ cellValue, row }) => {
            let { discountBeginDate, discountEndDate } = row
            return `${discountBeginDate} ~ ${discountEndDate}`
          },
        },
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
          width: 100,
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
      discountList(data)
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
    editDiscount(row) {
      this.priceOption.type = 'edit'
      this.priceOption.data = row
      this.priceOption.show = true
    },
    // 失效数据
    invalidDiscount(type, row) {
      let routeDiscountIds = []
      if (type === 'single') {
        routeDiscountIds = [row.routeDiscountId]
      } else {
        let len = this.multipleSelection1.length
        if (len < 1) {
          return this.$msgErrClose('请先选择需要操作的数据')
        }
        routeDiscountIds = this.multipleSelection1.map((item) => item.routeDiscountId)
      }
      this.$confirmWarn('是否确认失效所选数据？', () => {
        let data = {
          routeDiscountIds,
        }
        discountInvalid(data)
          .then((res) => {
            if (res.code === 0) {
              this.getData()
              this.$msgSucClose('数据失效成功！')
            }
          })
          .catch(() => {})
      })
    },
    // 新增特价
    showAdd() {
      this.addOption.show = true
    },
    // 取消新增
    cancel() {
      this.addOption.show = false
      this.getData()
    },
    // 编辑运价
    submitPrice (row) {
      let [beginDate, endDate] = row.beginDate
      let {webRouteCode} = this.priceOption.data
      let data = {
        ...row,
        beginDate,
        endDate,
        webRouteCode
      }
      saveDiscountRoute(data).then(res => {
        if (res.code === 0 ) {
          this.$msgSucClose('编辑特价成功!')
          this.priceOption.show = false
          this.getData()
        }
      }).catch(()=>{})
    },
    // 表格选中
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
  },
  mounted () {
    this.getData()
  }
}
</script>
