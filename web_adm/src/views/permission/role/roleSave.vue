<template>
  <el-dialog class="base-dialog"  :title="title" :close-on-click-modal="false" :visible.sync="visible" width="1200px" @close="dialogClose">
    <el-form :model="createItem" :rules="rules" ref="createItemForm" @keyup.enter.native="submitForm('createItemForm')" label-width="80px" label-suffix=":" v-loading="dataFormLoading">
      <el-row>
         <el-col :span="12">
          <el-form-item label="角色名称" label-width="80px" prop="roleName">
            <el-input style="width:80%" size="mini" v-model="createItem.roleName" ></el-input>
          </el-form-item>
         </el-col>
         <el-col :span="12">
          <el-form-item label="角色编码" label-width="80px" prop="roleCode">
            <el-input :style="createItem.sysRoleId>0?'width:100%':'width:80%'" size="mini" :disabled="sysGenCodeChecked||createItem.sysRoleId>0" v-model="createItem.roleCode" placeholder="全局唯一编码"></el-input>
            <el-checkbox style="margin-left:10px" v-if="createItem.sysRoleId==''" v-model="sysGenCodeChecked" @change="handleChangeSystemGenCode">系统生成</el-checkbox>
          </el-form-item>
         </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
            <el-form-item label="是否为岗位" label-width="80px" prop="hasJobDefine">
              <el-select  style="width:80%" size="mini"  v-model="createItem.hasJobDefine"  >
                <el-option v-for="(o, key) in dictMap['yesNo'] "
                    :key="key"
                    :label="$t(`dict.yesNo.${o.value}`)"
                    :value="o.value">
                  </el-option>
                </el-select>
            </el-form-item> 
        </el-col> 
        <el-col :span="12">
          <el-form-item label="描述" label-width="80px" prop="decription">
            <el-input :style="createItem.sysRoleId>0?'width:100%':'width:80%'" size="mini" v-model="createItem.decription"></el-input>
          </el-form-item>
         </el-col> 
       </el-row>
       <el-row>
         <el-col :span="12">
            <el-form-item label="模块" label-width="80px" >
              <el-select clearable filterable   style="width:80%" size="mini" v-model="parentSysAuthorityId" @change="moduleChange"  >
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
        v-model="createItem.sysAuthorityIds"
        :props="{key: 'sysAuthorityId',label: 'resourceName'}"
        :titles="transferTitle"
      >
      </el-transfer>     
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="mini" type="primary" :class="createItem.sysRoleId>0?'update-primary-button':''"  @click="submitForm('createItemForm')">
         {{createItem.sysRoleId>0?"修改":"确定"}}
        </el-button>
      <el-button  size="mini" @click="visible = false">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { mapGetters } from 'vuex'
import {listLevel2Menu,listSubResource,roleAuthorityList,roleSave} from '@/api/permission'

export default {
  name:"jobSave",
  data() {
    return {
      filterText: '',
      //弹框标题
      title:"",
      //弹框开关
      visible:false,
      dataFormLoading: false,
      sysGenCodeChecked:false,
      parentSysAuthorityId:"",
      roleList: [],
      resourceData:[],
      transferTitle:["可选权限","已选权限"],
      resourceOptions:[],//资源列表
      allResourceMap:new Map(),
      createItem:{
        sysRoleId:"",
        roleName:"",
        roleCode:"",
        decription:"",
        hasJobDefine:"",
        state:"valid",
        sysGenCode:'yes',
        sysAuthorityIds:[]
      },
     rules: {
        roleName: [
            { required: true, message: '角色名称不能为空', trigger: 'blur' },
        ]
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
      if(row){
         this.title="修改角色"  
         for(var p in this.createItem){
           this.createItem[p]=row[p]
        }
      }else{
         this.title="新增角色"
      }
      this.visible=true
      this.loanBasicData()
        this.$nextTick(() => {
        this.$refs.customerTransfer.clearQuery('left')
        this.$refs.customerTransfer.clearQuery('right')
      })
    },
     handleChangeSystemGenCode(val){
       this.createItem.sysGenCode="no"
       if(this.sysGenCodeChecked){
         this.createItem.sysGenCode="yes"
         this.createItem.roleCode="";
       }
    },
    //清空数据
    dialogClose(){
      this.$refs['createItemForm'].resetFields()
      Object.assign(this.createItem, {
        sysRoleId:"",
        roleName:"",
        roleCode:"",
        decription:"",
        hasJobDefine:"",
        state:"valid",
        sysGenCode:'yes',
        sysAuthorityIds:[]
      })
      this.parentSysAuthorityId=""
      this.sysGenCodeChecked=false
      this.allResourceMap=new Map()
    },
    loanBasicData(){
     //获取模块下拉数据
        listLevel2Menu().then(res=>{
          this.resourceOptions = res.data;
        })
        //初始化默认加在子模块
         this.moduleChange()
         if(this.title==="修改角色"){
          //获取当前已有权限的模块下拉数据
          roleAuthorityList({sysRoleId:this.createItem.sysRoleId}).then(res=>{
            this.createItem.sysAuthorityIds=[]
            if(res.data){
              res.data.map(item=>{
                  this.createItem.sysAuthorityIds.push(item.sysAuthorityId);
              })
            }  
          })
        }  
    },
    moduleChange(){
        this.resourceData=[]
        listSubResource({sysAuthorityId:this.parentSysAuthorityId}).then(res=>{
          this.resourceData=res.data
          let subResourceMap=new Map();
            //首次初始话需要载入全部资源
         this.resourceData.map(item=>{
          if(!this.parentSysAuthorityId){
              this.allResourceMap.set(item.sysAuthorityId,item)
            }
            subResourceMap.set(item.sysAuthorityId,item)
         })
            //获取可选权限列表 如果可选权限列表自己数据没有数据  就需要添加 
          if(this.createItem.sysAuthorityIds){
              this.createItem.sysAuthorityIds.map(item=>{
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
        this.$refs[formName].validate((valid) => {
          if (valid) {
             roleSave(this.createItem).then(res=>{
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
.base-data {
  .update-primary-button{
    background-color: #E9851F !important;
    border:1px solid #E9851F;
  }
}
</style>