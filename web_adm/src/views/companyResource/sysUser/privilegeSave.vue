<template>
  <el-dialog class="base-dialog"  :title="title" :close-on-click-modal="false" :visible.sync="visible" width="1200px" @close="dialogClose">
   <div class="title">
      <DetailDiv  label="系统登录账号:" :content="loginAccount"/>
      <DetailDiv  label="员工姓名:" :content="name"/>
      <DetailDiv  label="岗位:" :content="deptRole" :isTooltip="true" />
      <DetailDiv  label="角色:" :content="roleName" :isTooltip="true" />
    </div>
    <el-form :model="createItem" :rules="rules" ref="createItemForm" @keyup.enter.native="submitForm('createItemForm')"  label-suffix=":" v-loading="dataFormLoading">
       <el-row>
        <el-col :span="12">
          <el-form-item label="权限类型" label-width="80px" prop="privilegeCode">
            <el-select  style="width:80%"    size="mini"  v-model="createItem.privilegeCode"  @change="privilegeCodeChange">
                <el-option v-for="item in dictMap.empGlobalPrivilegeType" :label="item.label" :value="item.value" :key="item.value"></el-option>
            </el-select>
          </el-form-item>
          </el-col>
        </el-row>
         <el-transfer :data="privilegeData" filterable  class="transferCont" 
           ref="customerTransfer"
           v-model="createItem.privilegeValueList"
           :titles="transferTitle"
          >
         </el-transfer>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="mini" type="primary" @click="submitForm('createItemForm')">确定</el-button>
      <el-button  size="mini" @click="visible = false">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { mapGetters } from 'vuex'
import {userPrivilegeList,privilegeSave} from '@/api/permission'
import {baseSystemLineList,baseShippingCarrierList} from '@/api/base'
import { getDictMap, getDictLabel } from '@/utils/tools'
export default {
  name:"menuSave",
  data() {
    return {
      filterText: '',
      //弹框标题
      title:"",
      //弹框开关
      visible:false,
      dataFormLoading: false,
      privilegeData:[],
      resourceOptions:[],//资源列表
      name:"",
      transferTitle:["可选权限","已选权限"],
      loginAccount:"",
      deptRole:"",
      roleName:"",
      createItem:{
        privilegeCode:'settle_company',
        privilegeValueList:[],
        employeeId:""
      },
     rules: {
        privilegeCode: [
          { required: true, message: '权限类型不能为空', trigger: 'blur' },
        ],
      },
      loading:false,
    };
  },
   // table基础组件
  components:{
  },
  created() {
  },
  mounted() {
    
  },
  computed: {
    ...mapGetters([
      'userId','dictMap'
    ])
  },

  methods: {
    init(row){
      this.title="修改内容权限"
      this.visible=true
      this.name=row.cname
      this.loginAccount=row.loginAccount
      this.deptRole=row.deptRole
      this.roleName=row.roleName
      this.createItem.employeeId=row.employeeId
      this.loanBasicData()
        //清空穿梭框搜索属性
      this.$nextTick(() => {
        this.$refs.customerTransfer.clearQuery('left')
        this.$refs.customerTransfer.clearQuery('right')
      })
    },
    //清空数据
    dialogClose(){
      this.$refs['createItemForm'].resetFields()
      Object.assign(this.createItem, {
        employeeId:'',
        privilegeValueList:[],
        employeeId:""
      })
      this.name=""
      this.loginAccount=""
      this.deptRole=""
      this.roleName=""
    },
    privilegeCodeChange(val){
      this.privilegeData=[]
      this.createItem.privilegeValueList=[]
      if(val==='shiping_carrier'){
         this.getShippingCarrier() 
      }else if(val==='system_line'){
         this.getSysLine()
      }else if(val==='settle_company'){
         this.getSettleCompany();
      }else if(val==='fin_permission'){
        this.getFinPermission()
      }
      //获取用户已有权限
      userPrivilegeList(this.createItem).then(res=>{
        if(res.data){
          res.data.map(item=>{
            this.createItem.privilegeValueList.push(
               item.privilegeValue
            )
          })
        }
      })
    },
    getSysLine(queryString){
      baseSystemLineList(queryString,'valid').then(res=>{
        if(res.data){
          res.data.map(item=>{
            this.privilegeData.push({
               key:item.sysLineCode,
               label:item.cname
            })
          })
        }
      })
    },
    getShippingCarrier(queryString){
      baseShippingCarrierList(queryString,'valid').then(res=>{
        if(res.data){
          res.data.map(item=>{
            this.privilegeData.push({
               key:item.carrierCode,
               label:item.carrierCode
            })
          })
        }
      })
    },
    getSettleCompany(queryString){
       let payload={}
       payload.queryString=queryString
       payload.unitTypes="company"
       payload.state="valid"
       payload.size=9999
       this.$store.dispatch('dict/querySettleUnit', payload).then((data) => {
          if(data){
             data.map(item=>{
              this.privilegeData.push({
                key:item.key,
                label:item.value
              })
            })
          }
      })
    },
    getFinPermission(){
       let finPermission= getDictMap('globalFinPermission')
       if(finPermission){
         finPermission.map(item=>{
            this.privilegeData.push({
              key:item.value,
              label:item.label
            })
         })
       }
    },
    loanBasicData(){
        //默认加载结算分公司
        this.privilegeCodeChange("settle_company");
    },
     // 取消按钮
    cancel() {
      this.visible = false;
    },
    //保存按钮操作
    submitForm(formName) {
        //过滤掉角色带来的权限列表 ，只需要提交当前用户特有的权限列表即可
        this.$refs[formName].validate((valid) => {
          if (valid) {
             privilegeSave(this.createItem).then(res=>{
                this.$message({message: '恭喜你，保存成功', type: 'success'});
                this.visible = false
                this.$emit('refreshDataList');
              })
          } else {
            return false;
          }
        });
    },
     
   }
   
}
</script>
<style  lang="scss" scoped>
/deep/.el-transfer-panel{
  width: 450px !important;
}
/deep/ .el-transfer__buttons .el-button--primary{
    background-color: #1890ff !important;
    border:1px solid #1890ff !important;
}
.title{
  font-size:12px;
  margin-left: -10px;
}
</style>