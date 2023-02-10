<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption1" @search="search" :border="true" />
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick" class="recyle-tabs">
      <el-tab-pane label="部门公海" name="department"></el-tab-pane>
      <el-tab-pane label="集团公海" name="group"></el-tab-pane>
    </el-tabs>
    <div class="finance-list-container">
      <div class="money-box">
        <div>
          <!-- <el-button v-if="isCts" @click="handleExport" size="mini">导出</el-button> -->
          <el-button @click="customColumnsPopShow=true" size="mini">自定义表头</el-button>
          <el-button @click="allotAll" size="mini" v-show="custStatus !=='assigned,to_mg_assign' && (isCts||(isManager&&isWhiteManager)) ">批量分配</el-button>
        </div>
        <div class="money-box-right">
          <el-radio-group v-model="custStatus" size="mini" @change="handleCurrentChange(1)" v-if="isCts || isAdmin">
            <!-- <el-radio-button label="order">下单客户</el-radio-button>
            <el-radio-button label="potential">潜在客户</el-radio-button> -->
            <el-radio-button label="">全部</el-radio-button>
	            <el-radio-button label="recycled,refuse,to_mg_assign">未认领</el-radio-button>
            <el-radio-button label="assigned">已认领</el-radio-button>
          </el-radio-group>
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
    <RecycleDialog v-if="dialogOption.show" :recycleOption="dialogOption" :custId="custId" @close="closeDialog" @submit="allotDialog" 
    :rowDept="rowDept" :activeName="activeName"/>
    <RefuseDialog v-if="refuseOption.show" :refuseOption="refuseOption" @close="closeDialog" @submit="refuseDialog" />
  	<ClaimDialog v-if="claimOption.show" :claimOption="claimOption" :custId="custId" @close="closeDialog" @submit="claimDialog" />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/components/customColumns/index'
import CrmDialog from '@/views/crm/components/crmDialog'
import RecycleDialog from './recycleDialog'
import RefuseDialog from './refuseDialog'
import ClaimDialog from './claimDialog'
import store from '@/store'
import { mapGetters, mapState } from 'vuex'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { baseEmployeeList, listByRole } from '@/api/base'
import { recycleListTable } from '@/views/crm/data'
import RECYCLE from '@/api/crm/recycle'
import { feeItemListByGroup } from '@/api/fin/feeitem'
import { getValueByKey } from '@/api/base'
const NLIST = []
export default {
  name: 'bdRemoveLog',
  mixins: [mixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    CustomColumns,
    CrmDialog,
    RecycleDialog,
    RefuseDialog,
    ClaimDialog
  },
  inject: ['defaultRules'],
  data() {
    const recycleListTableCur = recycleListTable
    return {
      deptCode: this.$store.state.user.deptCode,
      recycleListTableCur: recycleListTableCur,
      custStatus: '',
      // 列表页--表格配置
      option1: {},
      // 列表页--搜索配置
      searchOption1: {},
      customColumnsPopShow: false,
      configColumns: [],
      // 初始自定义表头
      selfColumnsBase: recycleListTableCur.map((item) => {
        let target = { ...item }
        if (item.cDisabled) target.disabled = true
        if (target.callback) target.callback = (row) => this.showDetail(row)
        if (target.prop === 'name') { target.hasTag = true }
        return target
      }),
      dialogOption: {
        title: '分配',
        show: false,
        isCts: '',
      },
      refuseOption: {
        title: '拒绝',
        show: false,
      },
      claimOption: {
        title: '认领',
        show: false,
        isBD: '',
      },
      isDistribute: false,
      isCts: false,
      isLeader: false,
      isManager: false,
      isAdmin: false,
      isBD: false,
      multipleSelection1: [],
      recycleIds: [],
      refuseId: '',
      searchBackup: '',
      claimId: '',
      activeName: 'department',
      depat:{},
      rowDept:'',
      blackDept:false,
      isWhiteManager:false,
      custId:'',
      isSZPopC:false,
      isSHDirC:false,
      isSHBusC:false,
      isSowoll:false
    }
  },
  watch: {
    // 'dialogOption.form.belongEmployee'(val) {
    //   debugger
    //   this.dialogOption.form.belongEmployeeId = val.employeeId
    //   this.dialogOption.form.belongDeptCode = val.deptCode
    //   this.dialogOption.form.deptCname = val.deptCname
    // },
  },
  computed: {
		...mapGetters(['dictMap']),
    ...mapState('user', ['userId']),
    // blackDept(){
    //   let black = store.state.dict.dictMap.crmDepartmentSeasFilterList || []
    //   return black.some(item=>item.value === this.$store.state.user.deptCode)
    // },
    isShenzhen(){
      return  this.$store.state.user.compCode === '000001'
    }
	},
  created() {
    let { jobCodes = [], roles = [] } = this.$store.state.user
    // if (jobCodes.includes('manager') || roles.includes('cts')) {
    //   this.isDistribute = true
    // }
    if (roles.includes('cts')) {
      this.isCts = true
    }
    if (roles.includes('manager')) {
      this.isManager = true
    }
    if (jobCodes.includes('manager')) {
      this.isLeader = true
    }
    if (roles.includes('admin')) {
      this.isAdmin = true
    }
    if (roles.includes('bd')) {
      this.isBD = true
    }
    this.isDistribute = this.isLeader || this.isCts

    // 搜索配置
    let searchObj = {}
    //加所属部门
    this.recycleListTableCur.splice(6, 0, { prop: "deptName", label: "所属部门" })
    this.recycleListTableCur.forEach((v) => {
      // if (v.prop == 'custClass') return
      // if (v.prop == 'roleType') return
      searchObj[v.prop] = { ...v, type: v.sType || v.type || 'input', label: v.sLabel || v.label }
    })
    this.searchOption1 = {
      addFilter: {
        defaultSearchLength: 3,
        searchInputGroup: [
          { key: 'name', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'custClass', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'roleType', value: '', showType: '1', range: { min: '', max: '' } },
          { key: 'indexAddr', value: '', showType: '1', range: { min: '', max: '' } },
        ],
        filterGroups: { ...searchObj },
        dateArr: ['setupDate', 'usccExpDate'],
        callback: true,
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true }
    let operationBtns = {}
    // 组长
    if (this.isManager) {
      operationBtns = {
        ...this.option.operationBtns,
        width: '150px',
        show: true,
        data: [
	        { label: '详情', action: 'showDetail',showFn: (row) => (['to_mg_assign'].includes(row.status) &&
          row.belongEmployeeId === this.$store.state.user.userId) || 
          ((this.isWhiteManager  ||
           (this.isSZPopC && row.deptCode === '000001011000')||
           (this.isSHDirC && row.deptCode === '000007004')||
           (this.isSHBusC && row.deptCode === '000007000'))&& this.activeName==='department')
          },
          { label: '分配' , action: 'allot',  showFn: (row) => (['to_mg_assign'].includes(row.status) &&
          row.belongEmployeeId === this.$store.state.user.userId) ||
           ((this.isWhiteManager  ||
           (this.isSZPopC && row.deptCode === '000001011000')||
           (this.isSHDirC && row.deptCode === '000007004')||
           (this.isSHBusC && row.deptCode === '000007000'))&& this.activeName==='department')
           },
          { label: '拒绝' , action: 'refuse', showFn: (row) => ['to_mg_assign'].includes(row.status) &&
          row.belongEmployeeId === this.$store.state.user.userId },
          { label: '认领' , action: 'claim', showFn: (row) => row.deptCode && this.activeName==='department'?!this.blackDept:true  },
        ],
        callback: (action, $index, row, item) => {
          if (action === 'showDetail') {
            this.showDetail(row)
          }
          if (action === 'allot') {
            this.handleAllot(row)
          }
          if (action === 'refuse') {
            this.refuse(row)
          }
          if (action === 'claim') {
            this.claim(row)
          }
        }
      }
    }
    // 客户部
    if (this.isCts) {
      operationBtns = {
        ...this.option.operationBtns,
        width: '120px',
        show: true,
        data: [
          { label: '详情', action: 'showDetail', show: true },
          { label: '分配', action: 'allot', showFn: (row) => ['recycled','refuse'].includes(row.status) },
          { label: '撤回', action: 'recall', showFn: (row) => ['to_mg_assign'].includes(row.status) }
        ],
        callback: (action, $index, row, item) => {
          if (action === 'showDetail') {
            this.showDetail(row)
          }
          if (action === 'allot') {
            this.handleAllot(row)
          }
          if (action === 'recall') {
            this.recall(row)
          }
        },
      }
    }
    // 业务部
    if (this.isBD&&!this.isManager) {
      operationBtns = {
        ...this.option.operationBtns,
        width: '150px',
        show: true,
        data: [
          { label: '认领' , action: 'claim', showFn: (row) => ['recycled','to_mg_assign','refuse'].includes(row.status) 
          && this.activeName==='group' }
        ],
        callback: (action, $index, row, item) => {
          if (action === 'claim') {
            this.claim(row)
          }
        },
      }
    }
    this.option1 = { ...this.option, id: 'option1', pagination, operationBtns, selection: { show: true, fixed: true },  } //  noClickCheck: true
    if (this.isCts || this.isAdmin) {
      this.selfColumnsBase.splice(1,0,{prop: 'belongEmployeeName', label: '分配维护人',formatter: ({cellValue,row}) => {
        return row.belongDeptName ? `${cellValue}(${row.belongDeptName})` : `${cellValue}`
      }})
    }
    this.showDeptName()
    // this.getData()
  },
  activated () {
     this.getData()
     this.getDeptCode()
     this.getWhiteManager()
     this.getSZPopCust()
     this.getSHDirextCust()
     this.getSHBusinessCust()
     this.getSowoll()
  },
  methods: {
    //获取可自主分配的组长
    getWhiteManager(){
      getValueByKey("recycle_white_manager").then(res=>{
        if (res.data && res.data.length>0) {
          if(res.data.includes(this.userId)){
            this.isWhiteManager = true
          }else{
             this.isWhiteManager = false
          }
        }
      })
    },
    //获取深圳推广小组组长
    getSZPopCust(){
      getValueByKey("sz_popcus").then(res=>{
        if (res.data && res.data.length>0) {
          if(res.data.includes(this.userId)){
            this.isSZPopC = true
          }else{
             this.isSZPopC = false
          }
        }
      })
    },
    //获取深圳推广小组组长
    getSHDirextCust(){
      getValueByKey("sh_direct_cust").then(res=>{
        if (res.data && res.data.length>0) {
          if(res.data.includes(this.userId)){
            this.isSHDirC = true
          }else{
             this.isSHDirC = false
          }
        }
      })
    },
    //获取深圳推广小组组长
    getSHBusinessCust(){
      getValueByKey("sh_business_cust").then(res=>{
        if (res.data && res.data.length>0) {
          if(res.data.includes(this.userId)){
            this.isSHBusC = true
          }else{
             this.isSHBusC = false
          }
        }
      })
    },
    showDeptName () {
      // 判断所属部门
      let deptName = { prop: "deptName", label: "所属部门" }
      if (this.activeName === 'department') {
        this.selfColumnsBase.splice(6, 0, deptName);
      } else {
        this.selfColumnsBase = this.selfColumnsBase.filter(item => item.prop !== 'deptName')
      }
      this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
      this.option1.columns = [...this.selfColumnsBase]
    },
    // 切换tab标签回调
    handleClick (tab, event) {
      this.activeName = tab.name
      this.showDeptName()
      this.getData()
    },
    //获取登录员工深圳部门编码
    getDeptCode(){
      let black = store.state.dict.dictMap.crmDepartmentSeasFilterList || []
      console.log('black',black)
      if(this.isShenzhen){
        RECYCLE.querySzCode().then((res) => {
          this.blackDept = black.some(item=>item.value === res.data)
        })
      }else{
        this.blackDept = false
      }
    },
    //获取登录员工是否是sowoll平台
    getSowoll(){
      // 000040000
      getValueByKey("high_claim_online_config").then(res=>{
        console.log('sowoll',res.data)
        if (res.data && res.data.length>0) {
          this.sowollId = res.data
          if(res.data.includes(this.userId)){
            this.isSowoll = true
          }else{
            this.isSowoll = false
          }
        }
      })
    },
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
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query:[
          {
          column: 'status',
          type: 'in',
          value: this.custStatus
        }
        ]
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      if (query) {
        data.query = data.query.concat(query)
        this.searchBackup = data.query
      }
      if (this.searchBackup) {
        data.query = this.searchBackup
      }
      data.query[0].value = this.custStatus
      data.recycleMode = this.activeName
      RECYCLE.list(data)
        .then(({ data }) => {
          if (data.configColumns && data.configColumns.length) {
            let columns = data.configColumns
            this.option1.columns = columns.map((k) => this.selfColumnsBase.find(({ prop }) => prop === k)).filter((v) => v)
            this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
            this.configColumns = data.configColumns
          }
          this.option1.data = data.list.map(item => {
            let _tagArr = []
            if (item.status === 'refuse') {
              _tagArr = [{ text: '拒', type: 'refuse' }]
            }
            if (item.recycleTimes > 0) {
              _tagArr = [{ text: item.recycleTimes, type: 'change' }]
            }
            if (!['assigned','to_mg_assign'].includes(item.status)) {
              item.belongEmployeeName = ''
            }
            // return {...item, roleType: item.roleType.join(','), _tagArr}
            return {...item, roleType: item.roleType, _tagArr}
          })
          this.option1.pagination.currPage = data.currPage
          this.option1.pagination.pageSize = data.pageSize
          this.option1.pagination.totalCount = data.totalCount
        })
        .finally(() => (this.lsLoading = false))
    },
    sendMulti(data) {
      this.multipleSelection1 = data
    },
    //  导出
    handleExport() {
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query:[
          {
          column: 'status',
          type: 'in',
          value: this.custStatus
        }
        ]
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      if (this.searchBackup) {
        data.query = this.searchBackup
      }

      data.query[0].value = this.custStatus
      RECYCLE.export(data)
        .then((res) => {
          window.open(res.data.filePath)
          this.$msgSucClose('导出成功！')
        })
        .finally(() => (this.lsLoading = false))
    },
    // 客户详情
    showDetail(row) {
      //去掉限制
      // const a = this.isManager &&
      //    ['to_mg_assign'].includes(row.status) &&
      //     row.belongEmployeeId === this.$store.state.user.userId
      // if(this.isCts || a ){
        this.routerPush('RecycleDetail', { custid: row.custid, recycle: true,  custStatus: row.status, recycleId: row.recycleId,isGroup:this.activeName,rowDept:row.deptCode})
      // }
    },
    // 批量分配
    allotAll () {
      let source = this.multipleSelection1
      console.log('批量数据',source)
      if (source.length === 0) {
        return this.$msgErrClose('请先选择需要分配的数据')
      }
      let status = source.some(item => {
        let sta1 = this.isCts && item.status === 'to_mg_assign'
        let sta2 = item.status === 'assigned'
        return sta1 || sta2
      })
      if (status) {
        return this.$msgErrClose('存在已分配的客户，不能重新批量分配！')
      }
      let deptCName =  this.isAllEqual(source);
      if (!deptCName) {
        return this.$msgErrClose('勾选的客户不在同一个部门，不能批量分配！')
      }
      let deptName = source[0].deptName
      console.log('部门名称',deptName)
      if(['推广部','推广客服组'].includes(deptName)){
        //推广部门
        this.dialogOption.departPop = 'yes'
      }else{
        this.dialogOption.departPop = 'no'
      }
      this.recycleIds = source.map(item => item.recycleId)
      this.custId = source.map(item => item.custid)
      this.dialogOption.isCts = this.isCts
      this.dialogOption.show = true
      this.dialogOption.shareType = 'batch'
    },
    isAllEqual(source) {
      if (source.length > 0) {
        return !source.some(function(value, index) {
            return value.deptCode !== source[0].deptCode;
        });
      }else{
        return true
      }
    },
    // 分配客户
    handleAllot(row) {
      if(['中国', '中国大陆', "中国香港", "中国澳门", "香港", "澳门"].includes(row.country) 
      && row.custClass === 'peer'){
        //国内同行
        this.dialogOption.chinaPeer = 'yes'
      }else{
        this.dialogOption.chinaPeer = 'no'
      }
      if(['推广部','推广客服组'].includes(row.deptName)){
        //推广部门
        this.dialogOption.departPop = 'yes'
      }else{
        this.dialogOption.departPop = 'no'
      }
      //sowoll公共独立账号
      this.dialogOption.isSowoll = this.isSowoll //认领用
      this.dialogOption.sowollId = this.sowollId  //分配用
      
      //不是批量分配
      this.dialogOption.shareType = 'single'

      this.custId = [row.custid]
      this.recycleIds = [row.recycleId]
      this.dialogOption.isCts = this.isCts
      this.dialogOption.show = true
      this.rowDept = row.deptCode

      // this.dialogOption.form.assignType =  this.isCts ? 'manager' : 'bd'
      // this.dialogOption.formItems[0].disabled = !this.isCts
      // if (this.isDistribute) {
      //   return (this.dialogOption.show = true)
      // }
      // this.$confirmWarn('确认认领此客户吗？', () => {
      //   RECYCLE.claim({ custid: row.custid }).then((res) => {
      //     this.$msgSucClose('认领成功！')
      //     this.handleCurrentChange(1)
      //   })
      // })
    },
    allotDialog(query) {
      let recycleIds = this.recycleIds
      query.recycleMode = this.activeName
      let data = {
        ...query,
        recycleIds,
      }
      RECYCLE.assign(data).then(res => {
        if (res.code === 0) {
          this.dialogOption.show = false
          this.$msgSucClose('分配成功！')
          this.getData()
        }
      }).catch(()=>{})
    },
    closeDialog() {
      this.dialogOption.show = false
      this.refuseOption.show = false
      this.claimOption.show = false
        // if (!tag) return (this.dialogOption.show = false)
        // RECYCLE.assign({ recycleIds: this.recycleIds, ...this.dialogOption.form }).then((res) => {
        //   this.$msgSucClose('分配成功！')
        //   this.handleCurrentChange(1)
        //   this.dialogOption.show = false
        // })
    },
    // 撤回客户
    recall(row) {
      let datas = {
        recycleId:row.recycleId,
        recycleMode:this.activeName
      }
      this.$confirm('是否确认撤回该客户?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        RECYCLE.recall(datas).then(res => {
          if (res.code === 0) {
            this.$msgSucClose('撤回客户成功')
            this.getData()
          }
        }).catch(()=>{})
      }).catch((err) => {})
    },
    // 认领客户弹框
    claim(row) {
      if(['中国', '中国大陆', "中国香港", "中国澳门", "香港", "澳门"].includes(row.country) 
      && row.custClass === 'peer'){
        //国内同行
        this.claimOption.chinaPeer = 'yes'
      }else{
        this.claimOption.chinaPeer = 'no'
      }
      if(['推广部','推广客服组'].includes(row.deptName)){
        //推广部门
        this.claimOption.departPop = 'yes'
      }else{
        this.claimOption.departPop = 'no'
      }
      //sowoll公共独立账号
      this.claimOption.isSowoll = this.isSowoll //认领用
      this.custId = [row.custid]
      this.claimId = row.recycleId
      this.claimOption.show = true
    },
    //认领客户
    claimDialog(form){
     let recycleId = this.claimId
     form.recycleMode = this.activeName
      let data = {
        recycleId,
        ...form
      }
      RECYCLE.claim(data).then(res => {
        if (res.code === 0) {
          this.claimOption.show = false
          this.$msgSucClose('认领客户成功')
          this.getData()
        }
      }).catch(()=>{})
    },
    // 拒绝客户
    refuse(row) {
      this.refuseId = row.recycleId
      this.refuseOption.show = true
    },
    refuseDialog(remark) {
      let recycleId = this.refuseId
      let recycleMode = this.activeName
      let data = {
        recycleId,
        remark,
        recycleMode
      }
      RECYCLE.refuse(data).then(res => {
        if (res.code === 0) {
          this.refuseOption.show = false
          this.$msgSucClose('拒绝客户成功')
          this.getData()
        }
      }).catch(()=>{})
    }
  },
}
</script>
<style lang='scss' scoped>
.finance-page{
  	-moz-user-select: none; /*火狐*/
	  -webkit-user-select: none; /*webkit浏览器*/
	  -ms-user-select: none; /*IE10*/
	  -khtml-user-select: none; /*早期浏览器*/
	  -o-user-select:none;
	  user-select: none;
}
  .recyle-tabs {
    background:#fff;
    /deep/ .el-tabs__header{
      margin-bottom: 0;
      margin-top: 5px;
    }
    .el-tabs__item{
      line-height: 24px;
      height: 24px;
    }
    .el-tabs__nav-wrap::after{
      z-index: 0;
    }
    /deep/ .el-tabs__nav {
      margin-left: 15px;
    }
    /deep/ .el-tabs__item {
      line-height: 26px;
      height: 26px;
      padding: 0 10px;
      font-size: 12px;
      &:last-child {
        padding-left: 10px !important;
        padding-right: 10px !important;
      }
    }
  }
</style>
