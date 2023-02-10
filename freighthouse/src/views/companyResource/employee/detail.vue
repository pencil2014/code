<template>
  <div class="finance-page prepay-detail">
    <div class="finance-approve-detail">
      <div class="finance-approve-btns-box">
        <div class="finance-approve-btns-left">{{'员工详情'}}</div>
        <div class="finance-approve-btns-right">
            <el-button  @click="cancel" size="mini">返回</el-button>
        </div>
      </div>
      <div class="settlement-detail-form">
        <h3>基本信息</h3>
        <DetailDiv	label="工号：" :content="info.employeeNo"/>
        <DetailDiv	label="中文名：" :content="info.cname" :isTooltip="true"/>
        <DetailDiv	label="英文名：" :content="info.ename"/>
        <DetailDiv	label="性别：" :content="dictMapObj.gender[info.gender]"/>
        <DetailDiv	label="财务代码：" :content="info.finCode"/>
        <DetailDiv	label="工作状态：" :content="dictMapObj.employeeStatus[info.status]"/>
        <DetailDiv	label="系统登录账号：" :content="info.loginAccount"/><br/>
        <DetailDiv	label="创建人：" :content="info.createdName"/>
        <DetailDiv	label="创建时间：" :content="info.createdTime"/>
        <DetailDiv	label="修改人：" :content="info.updatedName"/>
        <DetailDiv	label="修改时间：" :content="info.updatedTime"/>
        <DetailDiv	label="邮件签名：" :content="info.emailSign" isFull/>
      </div>
      <div class="settlement-detail-form">
        <h3>在职信息</h3>
        <DetailDiv	label="部门：" :content="info.deptCode"/>
        <DetailDiv	label="岗位：" :content="info.jobName" :isTooltip="true"/>
        <DetailDiv	label="是否公共员工：" :content="dictMapObj.yesNo[info.isPublic]"/>
        <DetailDiv	label="手机号：" :content="info.mobileNo"/>
        <DetailDiv	label="座机：" :content="info.telephone"/>
        <DetailDiv	label="邮箱：" :content="info.email"/>
        <DetailDiv	label="入职时间：" :content="info.joinDate"/>
      </div>
      <div class="finance-table-container" style="margin:0 12px">
        <div class="money-box">
          <div class="money-box-left">
            <div class="money-title">历史在职信息</div>
            <div class="money-title-1">
              <div >
              </div>
            </div>
          </div>
          <div class="money-box-right">
            <el-button
              type="text"
              class="collapse-btn"
              @click="handleCollapse(type)"
              size="mini"
            >
              收起
              <i :class="[`el-icon-arrow-up`]"></i>
            </el-button>
          </div>
        </div>
        <FinanceTable
          v-show='isShowT'
          :option="option1"
         />
      </div>
    </div>
    
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { deptEmployeeHistoryList, deptEmployeeInfo } from '@/api/base'
export default {
  mixins: [mixin,routerMixin],
  data() {
    return {
      isShowT:true,
      employeeId:-1,
      info:{},
      option1: {},
    }
  },
  created() {
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [],
      index:{
        show:true
      },
      tips: {
        text: '',
        show: false
      },
      operationBtns:false,
      selection:{
        show:false
      },
    })
    let columns1 = [
        {prop: 'leaveDate', label: '离职时间', type: 'text',},
        {prop: 'joinDate', label: '入职时间', type: 'text', width: 120,},
        {prop: 'employeeNo', label: '工号', type: 'text',},
        {prop: 'cname', label: '中文名', type: 'text', },
        {prop: 'ename', label: '英文名', type: 'text',},
        {prop: 'gender', label: '性别', type: 'select', propInDict:'gender'},
        {prop: 'finCode', label: '财务代码', type: 'text'},
        {prop: "companyName", label: "分公司",	type: "text",},
        {prop: "deptName",	label: "部门",	type: "text",},
        {prop: "jobName",	label: "岗位",	type: "text", },
        {prop: "status",	label: "工作状态",	type: "select", propInDict:'employeeStatus',
         specialCellClassName:"base-data-enable-class",
        },
        {prop: "isPublic",	label: "是否公共员工",	type: "select",  propInDict:'yesNo',},
        {prop: "mobileNo",	label: "手机号",	type: "text", width: 110,},
        {prop: "telephone",	label: "座机",	type: "text", width: 100,},
        {prop: "email",	label: "邮箱",	type: "text", width: 120,},
        {prop: "loginAccount",	label: "登录系统账号",	type: "text", width: 100,},
        {prop: "leaveReason",	label: "离职原因",	type: "select", propInDict:'leaveReason'},
        {prop: "leaveRemark",	label: "离职备注",	type: "text"},
        // {prop: "createdName",	label: "创建人",	type: "text"},
        // {prop: "createdTime",	label: "创建时间",	type: "text", width: 140,},
        {prop: "updatedName",	label: "修改人",	type: "text"},
        {prop: "updatedTime",	label: "修改时间",	type: "text", width: 140,},
    ]
    let arr1 = []
    columns1.forEach(value => {
      let obj1 = this.columnsBase.find(item => {
        return item.prop === value
      })
      if (obj1) arr1.push(obj1)
    })
    this.option1.columns = columns1
  },
  methods: {
    getData() {
      const data = {
        employeeId:this.employeeId
      }
      deptEmployeeInfo(data).then(res => {
        if (res.code === 0) {
          this.info = res.data
          console.log(this.info);
        }
      }).catch(err=>{
        this.delVisitedView()
        this.cancel()
      })
      deptEmployeeHistoryList(data).then(res=>{
          this.option1.data = res.data || []
      }).catch(err=>{
        this.delVisitedView()
        this.cancel()
      })
      
    },
    cancel(refresh) {
      this.routerBack(refresh)
    },
    handleCollapse() {
      this.isShowT = !this.isShowT
    },
  },
  activated() {
    if (!this.$route.meta.isUseCache ) {
        this.employeeId = this.$route.query.employeeId
        this.getData()
    }
  },
  components: {
    FinanceTable
  },
}
</script>
<style scoped>
  .modifyfee-h2{
    font-size: 18px;
    font-weight: 600;
    color: #222222;
    line-height: 25px;
    margin-top: 14px;
  }
</style>
<style scoped lang="scss">
  .finance-page .el-dialog .el-form{
    padding: 0;
    .el-form-item{
      width: 100%;
    }
    ::v-deep .el-form-item__content{
      margin-left: 0 !important;
    }
  } 
  .prepay-detail{
    .el-form-item{
      display: inline-flex;
      ::v-deep .el-form-item__content{
        flex: 1 1 auto;
        // width: auto;
      }
      .el-tooltip{
        height: 20px;
        overflow: hidden;
        display: inline-block;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
      }
    }
    .finance-approve-btns-box{
      display: flex;
      justify-content: space-between;
      height: 40px;
      padding: 0 24px;
      border-radius: 4px 4px 0px 0px;
      border-bottom: 1px solid #E9E9E9;
    }
    .finance-approve-btns-left{
      font-size: 18px;
      font-weight: 600;
      color: #222222;
      line-height: 24px;
      margin-top: 8px;
    }
    .finance-approve-btns-right{
      margin-top: 6px;
    }
    .finance-page-background{
      background: #FFF;
    }
    .el-form-item{
      min-width: 248px;
      margin-bottom: 0px !important;
      margin-right: 16px;
    }
    .el-form-item-text{
     
      font-size: 12px;
      width: 200px; 
    }
    .detail-info-item-1{
      display: block;
      min-width: 248px;
      margin-bottom: 7px;
    }
    // .settlement-detail-form{
    //   padding: 16px 16px 0 16px;
    // }
    .settlement-detail-form .el-form-item{
      margin-bottom: -6px;
    }
    .settlement-detail-form-1{
      padding-bottom:16px;
    }
    .settlement-detail-form-border-bottom{
      border-bottom: 1px solid #D8D8D8 !important;
    }
    .settlement-exchange-rates{
      width:260px;
      display:inline-block;
      margin-right: 24px;
      vertical-align: top;
    }
    .settlement-exchange-rates-title{
    color: #222222;
    line-height: 28px;
    }
  .money-title-1{
    font-size: 12px;
    color: #222222;
    line-height: 14px;
    padding-top: 2px;
    margin-right: 20px;
  }
  }

</style>
<style lang="scss">
.el-form-item-payapply-remark {
  width: 100%;
  padding: 0 30px;
}
.el-form-item-payapply-remark .el-form-item__content {
  width: calc(100% - 70px);
}
.app-wrapper .finance-page .el-form-item-payapply-remark textarea {
  min-height: 75px !important;
}
</style>