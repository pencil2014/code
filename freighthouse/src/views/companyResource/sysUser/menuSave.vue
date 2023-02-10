<template>
  <el-dialog class="base-dialog"  :title="title" :close-on-click-modal="false" :visible.sync="visible" width="1200px" @close="dialogClose">
   <div class="title">
      <DetailDiv  label="系统登录账号:" :content="loginAccount"/>
      <DetailDiv  label="员工姓名:" :content="name"/>
      <DetailDiv  label="岗位:" :content="deptRole" :isTooltip="true"/>
      <DetailDiv  label="角色:" :content="roleName" :isTooltip="true"/>
    </div>
    <el-form :model="createItem" :rules="rules" ref="createItemForm" @keyup.enter.native="submitForm('createItemForm')" label-width="50px" v-loading="dataFormLoading">
        <el-row>
         <el-col :span="12">
            <el-form-item label="模块:" >
                <el-select clearable filterable   style="width:81%" size="mini" v-model="parentSysAuthorityId" @change="moduleChange"  >
                  <el-option v-for="(o, key) in resourceOptions"
                    :key="key"
                    :label="o.menuName"
                    :value="o.sysAuthorityId">
                  </el-option>
                </el-select>
            </el-form-item>
         </el-col>
        </el-row>
         <el-transfer :data="resourceData" filterable  class="transferCont" 
           ref="customerTransfer"
           target-order="unshift"
           v-model="allSysAuthorityIds"
           :props="{key: 'sysAuthorityId',label: 'resourceName'}"
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
import {listLevel2Menu,listSubResource,userAuthorityList,saveUserRoleResource} from '@/api/permission'
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
      parentSysAuthorityId:"",//模块资源id
      resourceData:[],
      disableSet: new Set(),
      allResourceMap : new Map(),
      resourceOptions:[],//资源列表
      name:"",
      transferTitle:["可选权限","已选权限"],
      loginAccount:"",
      deptRole:"",
      roleName:"",
      allSysAuthorityIds:[],
      createItem:{
        employeeId:'',
        sysAuthorityIds:[],
      },
     rules: {
       
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
      this.title="修改菜单权限"
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
        sysAuthorityIds:[],
      })
      this.name=""
      this.loginAccount=""
      this.deptRole=""
      this.roleName=""
      this.parentSysAuthorityId=""
      this.allSysAuthorityIds=[]
      this.disableSet= new Set()
    },
    loanBasicData(){
        //获取模块下拉数据
        listLevel2Menu().then(res=>{
          this.resourceOptions = res.data;
        })
        //获取当前已有权限的模块下拉数据
        userAuthorityList({employeeId:this.createItem.employeeId}).then(res=>{
            if(res.data){
              res.data.map(item=>{
                  this.allSysAuthorityIds.push(item.sysAuthorityId);
                  if(item.resourceType==='role'){
                    this.disableSet.add(item.sysAuthorityId)
                  }
              })
            }  
             //初始化默认加在子模块
             this.moduleChange()
          })
    },
    moduleChange(){
        this.resourceData=[]
        listSubResource({sysAuthorityId:this.parentSysAuthorityId}).then(res=>{
          this.resourceData=res.data
          let subResourceMap=new Map();
          this.resourceData.map(item=>{
          //首次初始话需要载入全部资源
          if(!this.parentSysAuthorityId){
              this.allResourceMap.set(item.sysAuthorityId,item)
            }
            subResourceMap.set(item.sysAuthorityId,item)
            if(this.disableSet.has(item.sysAuthorityId)){
              item.disabled=true
            }
          })
          //获取可选权限列表 如果可选权限列表自己数据没有数据  就需要添加 
          if(this.allSysAuthorityIds){
              this.allSysAuthorityIds.map(item=>{
                 if(!subResourceMap.get(item)&&this.allResourceMap.get(item)){
                     this.resourceData.push(this.allResourceMap.get(item))
                 }
              })
          }
        })
    },
     // 取消按钮
    cancel() {
      this.visible = false;
    },
    //保存按钮操作
    submitForm(formName) {
        //过滤掉角色带来的权限列表 ，只需要提交当前用户特有的权限列表即可
        this.allSysAuthorityIds.map(item=>{
          if(!this.disableSet.has(item)){
            this.createItem.sysAuthorityIds.push(item)
          }
        })
        this.$refs[formName].validate((valid) => {
          if (valid) {
             saveUserRoleResource(this.createItem).then(res=>{
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
.transferCont{
      /deep/.el-transfer-panel{
          width: 450px !important;
          overflow: none;
        
       }
     /deep/ .el-transfer-panel__item.el-checkbox .el-checkbox__label {
        font-size: 12px;
        overflow:inherit !important;
    }
    /deep/ .el-transfer__buttons .el-button--primary{
      background-color: #1890ff !important;
      border:1px solid #1890ff !important;
  }
}
.title{
  font-size:12px;
  margin-left: -10px;
}
</style>