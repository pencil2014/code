<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch ref="searchComp" :searchOption="searchOption1" @search="search" :border="true" />
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick" class="recyle-tabs">
      <el-tab-pane label="确认列表" name="claim"></el-tab-pane>
      <el-tab-pane label="分配列表" name="assign"></el-tab-pane>
    </el-tabs>
    <div class="finance-list-container">
      <div class="money-box">
        <div>
          <!-- <el-button @click="customColumnsPopShow=true" size="mini">自定义表头</el-button> -->
          <el-button @click="allotAll" size="mini" v-if="activeName==='assign'">批量分配</el-button>
          <el-button @click="claimAll" size="mini" v-if="activeName==='claim'">批量确认</el-button>
          <el-button @click="refuseAll" size="mini" v-if="activeName==='claim'">批量拒绝</el-button>
        </div>
        <!-- <el-radio-group v-model="verifyStatus" size="mini" @change="handleCurrentChange(1)"> -->
          <!-- <el-radio-button label="all">全部</el-radio-button> -->
          <!-- <el-radio-button label="draft">草稿</el-radio-button>
          <el-radio-button label="end">终止</el-radio-button> -->
        <!-- </el-radio-group> -->
      </div>
      <FinanceTable :option="option1" :autoMax="true" @send-multi="sendMulti"/>
      <!-- 分配 -->
      <RecycleDialog v-if="dialogOption.show" :recycleOption="dialogOption" :custid="custid" @close="closeDialog" @submit="allotDialog" 
      :rowDept="rowDept" :oid="oid"/>
      <!-- 拒绝 -->
      <RefuseDialog v-if="refuseOption.show" :refuseOption="refuseOption" @close="closeDialog" @submit="refuseDialog" :custid="custid" :oid="oid"/>
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { dimissionTable } from '@/views/crm/data'
import DIMISSION from '@/api/crm/dimission'
import RecycleDialog from './assignDialog'
import RefuseDialog from './refuseDialog'
import store from '@/store'

export default {
  name: 'dimissionList',
  mixins: [mixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    RecycleDialog,
    RefuseDialog
  },
  data() {
    return {
      verifyStatus: 'all',
      // 列表页--表格配置
      option1: {},
      // 列表页--搜索配置
      searchOption1: {},
      dialogOptions: {
        show: false,
        isEdit: false,
        type:'customer',
        where:'list',
        form: {}
      },
      isAdmin:false,
      isBD:false,
      isPricing:false,
      activeName:'claim',
      dialogOption: {
        title: '分配',
        show: false,
      },
      refuseOption: {
        title: '拒绝',
        show: false,
      },
      multipleSelection1: [],
      recycleIds: [],
    }
  },
  created() {
    let { roles = [] } = this.$store.state.user
    if (roles.includes('admin')) {
      this.isAdmin = true
    }
    let searchObj = {}
    dimissionTable.forEach((v) => {
      searchObj[v.prop] = { ...v, type: v.sType || v.type || 'input', label: v.sLabel || v.label }
    })
    this.searchOption1 = {
      saveDefault: true,
      addFilter: {
        defaultSearchLength: 4,
        searchInputGroup: [
          { key: 'custName', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'custClass', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'roleType', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'deptName', value: '', showType: '1', range: { min: '', max: '' } },
        ],
        filterGroups: { ...searchObj },
        dateArr: ['setupDate'],
        callback: true,
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true }
    let operationBtns = {
      ...this.option.operationBtns,
      width: '150px',
      data: [
        { label: '详情', action: 'custDetail', showFn: (row) => row.roleType&&this.activeName==='assign'},
        { label: '确认', action: 'claim', showFn: (row) =>row.roleType&&this.activeName==='claim'},
        { label: '分配', action: 'assign', showFn: (row) =>row.roleType&&this.activeName==='assign'},
        { label: '拒绝', action: 'refuse', showFn: (row) =>row.roleType&&this.activeName==='claim'},
      ],
      callback: (action, $index, row, item) => {
          if (action === 'custDetail') {
            this.custDetail(row)
          }
          if (action === 'assign') {
            this.handleAssign(row)
          }
          if (action === 'refuse') {
            this.refuse(row)
          }
          if (action === 'claim') {
            this.claim(row)
          }
        }
    }
    this.option1 = { ...this.option, id: 'option1', pagination, operationBtns, selection: { show: true, fixed: true },  } 
    this.option1.columns = [...dimissionTable]
    // this.getData()
  },
  methods: {
    // 批量选择
    sendMulti(data) {
      this.multipleSelection1 = data
    },
    // 切换tab标签回调
    handleClick (tab, event) {
      this.activeName = tab.name
      this.getData()
    },
    // 分页页面数量change   有分页必写此方法
    handleSizeChange(val) {
      let query = this.$refs.searchComp.addFilterSearch()
      this.option1.pagination.pageSize = val
      this.getData(query)
    },
    // 分页改变当前页   有分页必写此方法
    handleCurrentChange(val,event) {
      let query = this.$refs.searchComp.addFilterSearch()
      this.option1.pagination.currPage = val
      this.getData(query)
    },
    // 搜索按钮
    search(query) {
      this.option1.pagination.currPage = 1
      this.getData(query)
    },
    // 获取列表(分配和确认)
    getData(query) {
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        verifyStatus:this.verifyStatus,
        query:[]
      }
      if (query) {
        this.searchBackup = query
      }
      if (query) {
        data.query = data.query.concat(query)
        this.searchBackup = data.query
      }
      if (this.searchBackup) { 
        data.query = this.searchBackup
      }
      let method = this.activeName ==='claim'?DIMISSION.claimList:DIMISSION.assignList
      method(data)
        .then(({ data }) => {
          this.option1.pagination.currPage = data.currPage
          this.option1.pagination.pageSize = data.pageSize
          this.option1.pagination.totalCount = data.totalCount
          this.option1.data = data.list.map((item) => ({ ...item, toggle: false }))
        })
        .finally(() => (this.lsLoading = false))
    },
    closeDialog() {
      this.dialogOption.show = false
      this.refuseOption.show = false
    },
    // 确认(认领)
    claim(row) {
      console.log('row',row)
      let data = {
        oid:row.oid,
        custid:row.custid,
        handoverId:row.handoverId
      }
      this.$confirmWarn('是否确认认领该客户', () => {
        DIMISSION.claimCustomer(data).then(res => {
          if (res.code === 0) {
              this.dialogOption.show = false
              this.$msgSucClose('确认成功！')
              this.getData()
          }
        }).catch(()=>{})
      })
    },
    //批量认领
    claimAll(){
      let source = this.multipleSelection1
      console.log('批量数据',source)
      if (source.length === 0) {
        return this.$msgErrClose('请先选择需要分配的数据')
      }
      let datas = {
        custid:source.map(item => item.custid),
        oidList:source.map(item => item.oid),
        handoverId:source.map(item => item.handoverId),
      }
      console.log('datas',datas)
      this.$confirmWarn('是否确认认领这些客户', () => {
        DIMISSION.claimBatchCustomer(datas).then(res => {
          if (res.code === 0) {
              this.dialogOption.show = false
              this.$msgSucClose('确认成功！')
              this.getData()
          }
        }).catch(()=>{})
      })
    },
    // 批量分配
    allotAll () {
      let source = this.multipleSelection1
      if (source.length === 0) {
        return this.$msgErrClose('请先选择需要分配的数据')
      }
      let role = ''
      let status = source.some(item => {
        let sta1 = source[0].assignToEmployeeRole !==item.assignToEmployeeRole
        role = sta1?'无':source[0].assignToEmployeeRole
        return sta1 
      })
      console.log('role',role)
      if (status) {
        return this.$msgErrClose('分配类型不一样,请重新选择！')
      }
      this.custid = source.map(item => item.custid)
      this.oid = source.map(item => item.oid)
      this.dialogOption.assignToEmployeeRole = role
      this.dialogOption.show = true
    },
    //批量拒绝
    refuseAll(){
      let source = this.multipleSelection1
      if (source.length === 0) {
        return this.$msgErrClose('请先选择需要分配的数据')
      }
      this.custid = source.map(item => item.custid)
      this.oid = source.map(item => item.oid)
      this.refuseOption.show = true
    },
    // 分配客户
    handleAssign(row) {
      console.log('row',row)
      this.custid = row.custid
      this.dialogOption.show = true
      this.dialogOption.assignToEmployeeRole = row.assignToEmployeeRole
      this.rowDept = row.deptCode
      this.oid = row.oid
    },
    // 分配成功
    allotDialog(query) {
      let batchType = Array.isArray(query.oid)
      if(batchType){
        query.oidList = query.oid
      }
      let method = batchType?DIMISSION.assignBatchCustomer:DIMISSION.assignCustomer
      method(query).then(res => {
        if (res.code === 0) {
          this.dialogOption.show = false
          this.$msgSucClose('分配成功！')
          this.getData()
        }
      }).catch(()=>{})
    },
    // 拒绝客户
    refuse(row) {
      this.refuseOption.show = true
      this.oid = row.oid
      this.custid = row.custid
    },
    refuseDialog(query) {
      let batchType = Array.isArray(query.oid)
      if(batchType){
        query.oidList = query.oid
      }
      console.log('query',query)
      let method = batchType?DIMISSION.refuseBatchCustomer:DIMISSION.refuseCustomer
      method(query).then(res => {
        if (res.code === 0) {
          this.refuseOption.show = false
          this.$msgSucClose('拒绝客户成功')
          this.getData()
        }
      }).catch(()=>{})
    },
    custDetail(row) {
      this.routerPush('CustomerDetail', { custid: row.custid,name:row.custName})
    },
  },
}
</script>
<style lang="scss" scoped>

</style>