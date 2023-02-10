<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch  ref="searchComp" :searchOption="searchOption1" @search="search" :border="true" />
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <!-- <el-button type="primary" @click="handleAdd" size="mini">新建</el-button> -->
          <!-- <el-button @click="handleExport" size="mini">导出</el-button> -->
        </div>
        <div class="money-box-right">
          <el-radio-group v-model="status" size="mini">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="valid">有效</el-radio-button>
            <el-radio-button label="invalid">无效</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <FinanceTable :option="option1" :autoMax="true" />
    </div>
  </div>
</template>
<script>
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import CustomColumns from '@/components/customColumns'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { shippingCarrierListTable } from '@/views/crm/data'
import { shippingCarrierList } from '@/api/crm/shippingCarrier'

export default {
  name: 'shippingCarrierList',
  mixins: [mixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    CustomColumns,
  },
  data() {
    return {
      status:'',
      // 列表页--表格配置
      option1: {},
      // 列表页--搜索配置
      searchOption1: {},
      // 列表页--动态组件--当前显示的组件
    //   query: {
    //     applyNo: '',
    //     confirmStatus: '',
    //     refuseReason: '',
    //   },
      isManager: false, // 管理者
      isSps: false, // 管理者
      userId: '', //当前用户id
    }
  },
  watch: {
    status(val) {
      this.handleCurrentChange(1)
    },
  },
  activated() {
    // this.$nextTick(() => this.getData())
  },
  created() {
    // 是否是管理者
    // let roles = this.$store.state.user.roles || []
    // this.isManager = roles.includes('manager')
    // this.isSps = roles.includes('sps')
    // this.userId = this.$store.state.user.userId
    // 搜索配置
    let searchObj = {}
    shippingCarrierListTable.forEach((v) => {
      if (v.status || v.prop == 'status') return
      let prop = v.searchProp || v.prop
      searchObj[prop === 'serviceItems' ? 'serviceItemInfo' : prop] = {
        ...v,
        type: v.sType || v.type || 'input',
        label: v.sLabel || v.label,
        prop,
      }
    })
    this.searchOption1 = {
      addFilter: {
        defaultSearchLength: 10,
        searchInputGroup: [
          { key: 'shippingCarrierCode', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'cname', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'ename', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'createdTime', value: '', showType: '1', range: { min: '', max: '' } }
        ],
        filterGroups: { ...searchObj },
        dateArr: ['createdTime'],
        callback: true,
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true }
    let operationBtns = {
      ...this.option.operationBtns,
      width: '100px',
      data: [
        { label: '详情', action: 'showDetail', show: true },
      ],
    }
    this.option1 = { ...this.option, id: 'option1', pagination, selection: false, noClickCheck: true, operationBtns }
    this.option1.columns = [...shippingCarrierListTable]
  },
  methods: {
    handleSizeChange(val) {
      let query = this.$refs.searchComp.addFilterSearch()
      this.option1.pagination.pageSize = val
      this.getData(query)
    },
    handleCurrentChange(val) {
      let query = this.$refs.searchComp.addFilterSearch()
      this.option1.pagination.currPage = val
      this.getData(query)
    },
    search(query) {
      this.option1.pagination.currPage = 1
      this.getData(query)
    },
    getData(query) {
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
      }
      if (query) {
        this.searchBackup = query
        this.searchBackup.map(item=>{
          if(item.column == 'createdTime' && item.type == 'ge'){
            data.createdTimeStart = item.value.substring(0,10)
          }else if(item.column == 'createdTime' && item.type == 'le'){
            data.createdTimeEnd = item.value.slice(0,10)
          } else{
             return data[item.column] = item.value
          }
        })
      }
      data.status = this.status
      data.query = []
      this._exportSearchData = data
      shippingCarrierList(data)
        .then(({ data }) => {
          this.option1.data = data.list.map((item) => ({ ...item, toggle: false }))
          this.option1.pagination.currPage = data.currPage
          this.option1.pagination.pageSize = data.pageSize
          this.option1.pagination.totalCount = data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    showDetail(row) {
      this.routerPush('ShippingCarrierDetail', { custid:row.shippingCarrierId })
    },
  },
}
</script>
<style scoped>
.finance-page{
  	-moz-user-select: none; /*火狐*/
	  -webkit-user-select: none; /*webkit浏览器*/
	  -ms-user-select: none; /*IE10*/
	  -khtml-user-select: none; /*早期浏览器*/
	  -o-user-select:none;
	  user-select: none;
}
</style>