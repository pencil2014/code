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
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button size="mini" type="primary" @click="search">刷新</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTableMass :option="option1" @send-multi="sendMulti" />
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
    <Accept v-if="acceptOption.show" :option="acceptOption" />
    <Priview v-if="previewOption.show" :option="previewOption" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/views/finance/components/customColumns/index'
import Accept from '../components/accept'
import Priview from '@/views/swCms/customer/components/preview'
import { mixin } from '@/views/finance/mixins/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { countrySelectList } from '@/api/base'
import { orderList, fileList } from '@/api/swcms/index'
export default {
  mixins: [mixin, mixin2],
  components: {
    FinanceTableMass,
    FinanceSearch,
    Accept,
    Priview,
    CustomColumns
  },
  data() {
    return {
      loading: false,
      option1: {},
      searchOption: {},
      multipleSelection1: [],
      acceptOption: {
        show: false,
        data: '',
      },
      previewOption: {
        show: false,
        title: '查看托书',
        src: [],
      },
      customColumnsPopShow: false,
      selfColumnsBase: []
    }
  },
  computed: {
    ...mapGetters(['dictMapObj']),
  },
  created() {
    let searchInputGroup = ['memOrderNo', 'polPortCode', 'podPortCode', 'orderStatus']
    this.selfColumnsBase = [
      {
        prop: 'memOrderNo',
        label: '订单号',
        type: 'text',
        width: 150,
      },
      {
        prop: 'ossOrderNo',
        label: '关联工作号',
        type: 'text',
        width: 100,
      },
      {
        prop: 'corpName',
        label: '公司名称',
        type: 'text',
        width: 100,
      },
      {
        prop: 'polPortName',
        label: '起运港',
        type: 'text',
        width: 100,
      },
      {
        prop: 'podPortName',
        label: '目的港',
        type: 'text',
        width: 100,
      },
      {
        prop: 'cyCutOff',
        label: '截关时间',
        type: 'text',
        width: 100,
      },
      {
        prop: 'etdTime',
        label: '预计开船日期',
        type: 'text',
        width: 100,
      },
      {
        prop: 'tdTime',
        label: '实际开船日期',
        type: 'text',
        width: 100,
      },
      {
        prop: 'containers',
        label: '箱型数量',
        type: 'text',
        width: 100,
      },
      {
        prop: 'vessel',
        label: '船名航次',
        type: 'text',
        width: 100,
        formatter: ({ cellValue, row }) => {
          let { vessel, voyage } = row
          return `${vessel} / ${voyage}`
        },
      },
      {
        prop: 'hbl',
        label: 'HBL',
        type: 'text',
        width: 100,
      },
      {
        prop: 'mbl',
        label: 'MBL',
        type: 'text',
        width: 100,
      },
      {
        prop: 'so',
        label: 'SO号',
        type: 'text',
        width: 100,
      },
      {
        prop: 'cn',
        label: '柜号',
        type: 'text',
        width: 100,
      },
      {
        prop: 'orderStatus',
        label: '订单状态',
        type: 'text',
        width: 100,
        toolKey: 'auditRefuseReason',
        // propInDict: 'swMemOrderStatus'
        formatter: ({ cellValue, row }) => {
          let text = {
            not_accepted: '未受理',
            refused: '已拒绝',
            accepted: '已受理',
            booked: '已订舱',
            released: '已放舱',
            not_booked: '未订舱',
            completed: '已完成',
            canceled: '已取消',
          }
          let label = text[cellValue] || ''
          if (['accepted', 'booked', 'released', 'completed'].includes(cellValue)) {
            return `<span class="green">${label}</span>`
          } else if (cellValue === 'refused') {
            let recommend = `<i class="table-icon_tips"></i>`
            return `<span class="red">${label}${recommend}</span>`
          } else if (cellValue === 'canceled') {
            return `<span class="grey">${label}</span>`
          } else {
            return label
          }
        },
      },
      {
        prop: 'ossOrderStatus',
        label: 'oss订单状态',
        type: 'select',
        width: 100,
        // propInDict: 'orderStatus',
        formatter: ({ cellValue, row }) => {
          let label = this.dictMapObj['orderStatus'][cellValue]
          if (cellValue === 'refuse') {
            return `<span class="red">${label}</span>`
          } else if (cellValue === 'submit') {
            return `<span class="blueFont">${label}</span>`
          } else if (cellValue === 'pass') {
            return `<span class="green">${label}</span>`
          }else {
            return label
          }
        }
      },
      {
        prop: 'ossBkgStatus',
        label: 'oss订舱状态',
        type: 'select',
        // propInDict: 'bkgStatus',
        width: 100,
        formatter: ({ cellValue, row }) => {
          let label = this.dictMapObj['bkgStatus'][cellValue]
          if (cellValue === 'refuse' || cellValue === 'book_refuse') {
            return `<span class="red">${label}</span>`
          } else if (cellValue === 'booked' || cellValue === 'book_release') {
            return `<span class="green">${label}</span>`
          } else if (cellValue === 'pass') {
            return `<span class="blueFont">${label}</span>`
          } else {
            return label
          }
        }
      },
      {
        prop: 'sourceDesc',
        label: '订单数据来源',
        type: 'select',
        propInDict: 'swMngOrderSource',
        width: 100,
      },
      {
        prop: 'emplName',
        label: '联系人',
        type: 'text',
        width: 100,
      },
      {
        prop: 'mobile',
        label: '电话',
        type: 'text',
        width: 100,
      },
      {
        prop: 'createdTime',
        label: '创建时间',
        type: 'text',
        width: 100,
      }
    ]
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
          memOrderNo: { label: '订单号', type: 'input' },
          polPortCode: {
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
          podPortCode: {
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
          orderStatus: { label: '订单状态', type: 'select', propInDict: 'swMemOrderStatus' },
          corpName: { label: '公司名称', type: 'input' },
          ossOrderNo: { label: '关联工作号', type: 'input' },
          porPortCode: {
            label: '驳船收货地',
            type: 'remoteSelect',
            remoteMethod: (val, item) => {
              this.portSearch(val, item, 'port_of_feeder')
            },
            visibleChange: (val, item) => {
              this.portSearch('', item, 'port_of_feeder')
            },
            remoteSelectList: [],
          },
          podCountry: {
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
          etdTime: { label: '开船时间', type: 'date', format: 'yyyy-MM-dd' },
          createdTime: { label: '创建时间', type: 'daterange', format: 'yyyy-MM-dd' },
          sourceDesc: { label: '订单数据来源', type: 'select', propInDict: 'swMngOrderSource' },
          ossOrderStatus: { label: 'oss订单状态', type: 'select', propInDict: 'orderStatus' },
          ossBkgStatus: { label: 'oss订舱状态', type: 'select', propInDict: 'bkgStatus' },
        },
      },
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: '详情',
          show: true,
          action: 'orderInfo',
        },
      ],
      width: 80,
      fixed: 'right',
      callback: (action, $index, row, option) => {
        if (action === 'orderTake') {
          this.orderTake(row)
        } else if (action === 'orderEdit') {
          this.orderEdit(row)
        } else if (action === 'orderInfo') {
          this.orderInfo(row)
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
      selection: false,
      operationBtns,
      pagination,
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
        descColumns: ['createdTime'],
        columns:[],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
				data.columns = this.customColumnsKeys
			}
      this.finCommonSearch(data.query, this.searchOption, true, true)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      orderList(data)
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
            Object.assign(this.option1.pagination, res.data)
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    orderTake(row) {
      this.acceptOption.data = row
      this.acceptOption.show = true
    },
    orderEdit(row) {
      let { memOrderNo } = row
      this.$router.push({
        name: 'SwOrderInfo',
        query: {
          memOrderNo,
          type: 'edit',
        },
      })
    },
    orderInfo(row) {
      let { memOrderNo } = row
      let type = row.orderStatus === 'not_accepted' ? 'edit': 'info'
      this.$router.push({
        name: 'SwOrderInfo',
        query: {
          memOrderNo,
          type
        },
      })
    },
    checkBook(row) {
      let { memOrderNo } = row
      let data = {
        memOrderNo,
        typeCode: 'booking'
      }
      fileList(data)
        .then((res) => {
          let src = []
          if (res.data.length) {
            src = res.data.map((item) => {
              let { fileNo, name } = item
              if (name.includes('.pdf')) {
                name = 'pdf'
              } else {
                name = 'sowoll' //docFileName.replace(/[\[|\]|\{|\}|\%|`]/g, '')
              }
              return `/base/fileView/preview/${fileNo}/${name}`
            })
          }
          this.previewOption.src = src
          this.previewOption.show = true
        })
        .catch(() => {})
    },
    // 选中表格
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
  // 修改返回刷新数据
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (from.query.type === 'edit') {
        vm.getData()
      }
    })
  },
}
</script>
