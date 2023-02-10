<template>
<div>
  <el-dialog
    title="新增特价"
    :visible.sync="addOption.show"
    width="1100px"
    :before-close="cancel">
      <FinanceSearch :searchOption="searchOption" @search="search" :border="true" />
      <FinanceTableMass :option="option1" />
  </el-dialog>
  <Price v-if="priceOption.show" :option="priceOption" @cancel="cancelPrice" @submit="submitPrice" />
</div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import Price from './price'
import { mixin } from '@/views/finance/mixins/mixin'
import { saveDiscountRoute,listAddRoutePage } from '@/api/swcms/index'
export default {
  mixins: [mixin],
  props: {
    addOption: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    Price
  },
  data () {
    return {
      searchOption: {},
      option1: {},
      priceOption: {
        show: false,
        data: {},
        type: 'add'
      }
    }
  },
  created() {
    let searchInputGroup = [
      'polCode',
      'podCode',
      'shipCarrierCode',
    ]
    this.searchOption = {
      isNotAutoLoad: true,
      addFilter: {
        plusShow: false,
        defaultSearchLength: 3,
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
        },
      },
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
				{
					label: '设置运价',
					show: true,
					action: 'setPrice',
				},
			],
			fixed: 'right',
      width: '80px',
			callback: (action, $index, row, option) => {
				if (action === 'setPrice') {
					this.setPrice(row)
				}
			},
    })
    let pagination = Object.assign({}, this.option.pagination, {
			show: true, isNew: true,
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
          prop: 'polEname',
          label: '起运港',
          type: 'text',
          width: 100,
          formatter: ({ cellValue, row }) => {
            let { polEname, polCname } = row
            return `${polEname}(${polCname})`
          },
        },
        // {
        //   prop: 'city', 
        //   label: '起运港城市',
        //   type: 'text',
        //   width: 100,
        // },
        {
          prop: 'feederPolEname', 
          label: '驳船收货地',
          type: 'text',
          width: 100,
          formatter: ({ cellValue, row }) => {
            let { feederPolCname, feederPolEname } = row
            return feederPolEname ? `${feederPolEname}(${feederPolCname})` : ''
          },
        },
        {
          prop: 'podEname',
          label: '目的港',
          type: 'text',
          width: 100,
          formatter: ({ cellValue, row }) => {
            let { podEname, podCname } = row
            return `${podEname}(${podCname})`
          },
        },
        {
          prop: 'shipCarrierCode', 
          label: '船司',
          type: 'text',
          width: 100,
        },
        // {
        //   prop: 'etdTime', 
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
          prop: 'schedule', 
          label: '截关/开船',
          type: 'text',
          width: 100,
        },
        {
          prop: 'priceGp20', 
          label: '20GP',
          type: 'text',
          width: 100,
          formatter: ({cellValue, row}) => {
            let {currency} = row
            return `<span>${currency}:${cellValue}</span>`
          }
        },{
          prop: 'priceGp40', 
          label: '40GP',
          type: 'text',
          width: 100,
          formatter: ({cellValue, row}) => {
            let {currency} = row
            return `<span>${currency}:${cellValue}</span>`
          }
        },
        {
          prop: 'priceHq40', 
          label: '40HQ',
          type: 'text',
          width: 100,
          formatter: ({cellValue, row}) => {
            let {currency} = row
            return `<span>${currency}:${cellValue}</span>`
          }
        },
        {
          prop: 'priceNor40', 
          label: '40NOR',
          type: 'text',
          width: 100,
          formatter: ({cellValue, row}) => {
            let {currency} = row
            return `<span>${currency}:${cellValue}</span>`
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
      ],
			tips: {
				text: '',
				show: false,
			},
			selection: false,
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
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      listAddRoutePage(data)
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
    setPrice (row) {
      this.priceOption.type = 'add'
      this.priceOption.data = row
      this.priceOption.show = true
    },
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
          this.$msgSucClose('新增特价成功!')
          this.cancelPrice()
          this.getData()
        }
      }).catch(()=>{})
    },
    cancelPrice () {
     this.priceOption.show = false
    },
    cancel () {
      this.$emit('cancel')
    },
     // 分页
		handleSizeChange (val) {
			this.option1.pagination.pageSize = val
			this.getData()
		},
		// 分页
		handleCurrentChange (val) {
			this.option1.pagination.currPage = val
			this.getData()
		},
    // 远程搜索港口下拉数据 port_of_basic  port_of_destination
    portSearch(queryString, item, port) {
      let data = {
        queryString
        // portAttribute: port,
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
  }
}
</script>