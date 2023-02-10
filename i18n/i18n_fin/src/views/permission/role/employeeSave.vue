<template>
  <el-dialog class="finance-tab-page base-data"  :title="title" :close-on-click-modal="false" :visible.sync="visible" width="900px" @close="dialogClose">
   <div class="title">
          <span>角色: {{roleName}}</span>
    </div>
    <el-form :model="createItem" :rules="rules" ref="createItemForm" @keyup.enter.native="submitForm('createItemForm')" label-width="80px" label-suffix=":" v-loading="dataFormLoading">
         <el-transfer :data="resourceData" filterable  class="transferCont" 
           ref="customerTransfer"
           v-model="createItem.employeeIds"
           :props="{key: 'employeeId',label: 'cname'}"
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
import {roleEmployeeSave,roleEmployeeList} from '@/api/permission'
import {baseEmployeeListName} from '@/api/base'
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
      resourceData:[],
      resourceOptions:[],//资源列表
      transferTitle:["可选员工","已选员工"],
      roleName:"",
      createItem:{
        sysRoleId:'',
        employeeIds:[],
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
      this.title="修改角色关联员工"
      this.visible=true
      this.roleName=row.roleName
      this.createItem.sysRoleId=row.sysRoleId
      this.loanBasicData(row)
          //清空穿梭框搜索属性
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
        sysRoleId:'',
        employeeIds:[],
      })
      this.roleName=""
    },
    loanBasicData(row){
        baseEmployeeListName({childFlag:1,deptCode:'000'}).then(res => {  
           this.resourceData=res.data
        })
        //获取当前已有权限的模块下拉数据
        roleEmployeeList({sysRoleId:this.createItem.sysRoleId}).then(res=>{
          if(res.data){
            res.data.map(item=>{
                this.createItem.employeeIds.push(item.employeeId);
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
             roleEmployeeSave(this.createItem).then(res=>{
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
.title{
  padding: 10px 0;
  margin-top:-20px;
  .span{
    padding:20px
  }
}
.transferCont{
  /deep/.el-transfer-panel{
    width: 325px !important;
  }
  /deep/ .el-transfer__buttons .el-button--primary{
    background-color: #1890ff !important;
    border:1px solid #1890ff !important;
  }
}
</style>