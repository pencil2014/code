<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption1" @search="search" :border="true" />
    <div class="finance-list-container">
      <div class="money-box">
        <!-- <el-button @click="handleExport" size="mini">导出</el-button> -->
        <!-- <el-radio-group v-model="methodStr" size="mini" @change="handleCurrentChange(1)">
          <el-radio-button v-if="!isCS || isCS2" label="customer">客户</el-radio-button>
          <el-radio-button v-if="!isCS || isCS2" label="supplier">供应商</el-radio-button>
        </el-radio-group> -->
      </div>
      <FinanceTable :option="option1" :autoMax="true" />
    </div>
    <CrmDialogCarousel ref="carousel" :option="carouselDialog" @close="carouselDialog.show=false" />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CrmDialogCarousel from '@/views/crm/components/crmDialogCarousel'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import FOLLOW from '@/api/crm/orgCommunication'

export default {
  name: 'FollowLog',
  mixins: [mixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    CrmDialogCarousel,
  },
  data() {
    return {
      // 列表页--表格配置
      option1: {},
      // 列表页--搜索配置
      searchOption1: {},
      carouselDialog: {
        show: false,
        title: '查看关键截图',
        items: [],
      },
      methodStr: 'supplier', // 'customer'
      isCts: false,
      isSps: false,
      isCS: false,
      isCS2: false,
    }
  },
  created() {
    let roles = this.$store.state.user.roles || []
    // console.log(roles)
    this.isCts = roles.includes('cts')
    this.isSps = roles.includes('sps')
    this.isCS = this.isCts || this.isSps
    this.isCS2 = this.isCts && this.isSps
    if (this.isCS) {
      // this.methodStr = this.isCts ? 'customer' : 'supplier'
      this.methodStr = 'supplier'
    }

    let columns = [
      {
        prop: 'name',
        label: '跟进企业名称',
        type: 'link',
        sType: 'input',
        width: 230,
        callback: (row) => {
          let name = this.methodStr == 'customer' ? 'Customer' : 'Supplier'
          let str = this.methodStr == 'customer' ? '' : 'supplier/'
          if (this.isCS) {
            let status = row.verifyStatus == 'submit' ? '' : 'Pass'
            let routeName = name + 'ReviewDetail' + status
            this.routerPush(routeName, { orgid: row.orgid })
            return
          }
          if (row.status == 'recycle') {
            this.routerPush('RecycleDetail', { orgid: row.orgid, recycel: true, custMode: row.commuType })
            return
          }
          // recycleDetail?custid=167&recycle=true&custMode=order
          // recycleDetail?custid=167&recycle=true&custMode=order
          this.$store.commit(`crm/${str}setDetailIsEdit`, false)
          this.$store.commit(`crm/${str}setDetailEditInfo`, {})
          this.routerPush(name + 'Detail', { orgid: row.orgid })
        },
      },
      { prop: 'orgContact', label: '企业联系人' },
      // { prop: 'orgType', label: '企业联系人角色', type: 'select' },
      { prop: 'bdEmployeeName', label: '跟进人' },
      { prop: 'subject', label: '主题' },
      { prop: 'commuType', label: '跟进方式', type: 'select', propInDict: 'orgCommunicationType' },
      {
        prop: 'commuTime',
        label: '跟进时间',
        sType: 'daterange',
        format: 'yyyy-MM-dd',
        formatter: ({row}) => {
          if (row.commuTime) return row.commuTime.slice(0, 10)
          return ''
        },
      },
      { prop: 'intention', label: '企业意愿', type: 'select', propInDict: 'orgIntention' },
      { prop: 'commuStatus', label: '跟进状态', propInDict: 'orgCommunicationStatus', type: 'select' },
      {
        prop: 'fileNos',
        label: '关键截图',
        type: 'button',
        formatter: (val, row) => '查看',
        operationBtns: {
          show: true,
          callback: (action, index, row) => this.showDialog(row),
        },
      },
      { prop: 'content', label: '关键沟通内容' },
    ]
    // 搜索配置
    let searchObj = {}
    columns.forEach((v) => {
      searchObj[v.prop] = { ...v, type: v.sType || v.type || 'input', label: v.sLabel || v.label }
    })
    this.searchOption1 = {
      saveDefault: true,
      addFilter: {
        defaultSearchLength: 4,
        searchInputGroup: [
          { key: 'name', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'bdEmployeeName', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'commuTime', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'commuStatus', value: '', showType: '1', range: { min: '', max: '' } },
        ],
        filterGroups: { ...searchObj },
        dateArr: ['commuTime'],
        callback: true,
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true }
    this.option1 = { ...this.option, id: 'option1', pagination, selection: false, operationBtns: false,  noClickCheck: true }

    this.option1.columns = columns
    // this.getData()
  },
  methods: {
    // 分页页面数量change   有分页必写此方法
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    // 分页改变当前页   有分页必写此方法
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    // 搜索按钮
    search(query) {
      this.option1.pagination.currPage = 1
      this.getData(query)
    },
    // 封装请求参数并请求列表
    getData(query) {
      this.lsLoading = true
      // console.log(this.searchOption1.addFilter.searchInputGroup)
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
      }
      if (query) {
        this.searchBackup = query
      }
      data.query = this.searchBackup || []
      this._exportSearchData = data
      FOLLOW[this.methodStr + 'AllList'](data)
        .then((res) => {
          let { list } = res.data
          this.option1.data = list
          this.option1.pagination.currPage = res.data.currPage
          this.option1.pagination.pageSize = res.data.pageSize
          this.option1.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    handleExport() {
      FOLLOW[this.methodStr + 'AllExport'](this._exportSearchData)
        .then((res) => {
          window.open(res.data.filePath)
        })
        .finally(() => {})
    },
    showDialog(row) {
      return FOLLOW.screenshotView({ commuId: row.commuId }).then((res) => {
        if (!res.data.length) return this.$msgWarnClose('此记录无关键截图!')
        let  name = res.data[0].name.replace(/[\[|\]|\{|\}|\%|`]/g, '')
        const href = `/base/fileView/preview/${res.data[0].fileNo}/${name}`
        window.open(href)
        // this.carouselDialog.items = res.data
        // this.carouselDialog.show = true
      })
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
