<template>
  <el-dialog class="base-dialog base-data"  :title="title" :close-on-click-modal="false" :visible.sync="visible" width="600px" @close="dialogClose">
    <el-form :model="createItem" :rules="rules" ref="createItemForm" @keyup.enter.native="submitForm('createItemForm')" label-width="80px" label-suffix=":" v-loading="dataFormLoading">
         <el-form-item label="员工" label-width="100px" prop="employeeId">
            <el-select filterable remote
                style="width:80%" size="mini" :disabled="action==='edit'"  v-model="createItem.employeeId" placeholder="请选择员工"  :remote-method="getEmployeeList"
                 >
               <el-option v-for="o in employeeOptions"
                :key="o.employeeId"
                :label="o.cname+'  ('+o.employeeNo+')'"
                :value="o.employeeId">
              </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="登录账号" label-width="100px" prop="loginAccount">
          <el-input style="width:80%" size="mini" v-model="createItem.loginAccount" ></el-input>
        </el-form-item>
        <!-- <el-form-item label="密码" label-width="100px" prop="loginPass" v-if="action=='add'">
          <el-input style="width:80%" size="mini" :disabled="true" v-model="loginPass" placeholder="由系统生成"></el-input>
        </el-form-item> -->
    </el-form>

    
    <span slot="footer" class="dialog-footer">
      <el-button size="mini" type="primary" :class="action==='edit'?'update-primary-button':''"  @click="submitForm('createItemForm')">
         {{action==='edit'?"修改":"确定"}}
        </el-button>
      <el-button  size="mini" @click="visible = false">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { mapGetters } from 'vuex'
import {sysUserSave,employeeSelectlist,sysUserRoleInfo} from '@/api/companyResource'
import {roleSelectList} from '@/api/permission'
import { sha256 } from 'js-sha256'
import {randomString} from '@/utils/tools'
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
      loginPass:'',
      createItem:{
        // sysRoleIdList:[],
        employeeId:"",
        loginAccount:'',
        loginPass:"",
        loginPassSha256:"",
        state:'valid',
        cname:""
      },
      action:'',
      employeeOptions:[],
      roleOptions:[],
      rules: {
        employeeId: [
          { required: true, message: '员工不能为空', trigger: 'blur' },
        ],
        loginAccount: [
            { required: true, message: '登录账号不能为空', trigger: 'blur' },
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
      this.visible=true
      this.$nextTick(() => {
        if(row){
          for(var p in this.createItem){
            this.createItem[p]=row[p]
          }
          this.title="编辑系统用户" 
          this.action="edit"
          this.employeeOptions.push({
            employeeId:this.createItem.employeeId,
            employeeNo:row.employeeNo,
            cname:row.cname
          })
        }else{
          this.title="新增系统用户" 
          this.action="add"
          this.visibleOpen()
        }
        this.loanBasicData()
      })
    },
    //生成随机密码
    visibleOpen(){
      this.loginPass=randomString(8)
    },
    //清空数据
    dialogClose(){
      this.$refs['createItemForm'].resetFields()
      Object.assign(this.createItem, {
        // sysRoleIdList:[],
        employeeId:"",
        loginAccount:'',
        loginPass:"",
        loginPassSha256:"",
        state:'valid',
        cname:""
      })
      this.action=""
    },
    loanBasicData(){
      roleSelectList({state:'valid'}).then(res=>{
          this.roleOptions = res.data
      })
      // sysUserRoleInfo({employeeId:this.createItem.employeeId}).then(res=>{
      //     this.createItem.sysRoleIdList = res.data.sysRoleIdList
      // })
      if(this.action==='add'){
        this.getEmployeeList(this.createItem.cname)
      }
    },
    getEmployeeList(queryString){
        let addSysUserFlag=this.action==='edit'?"":"true"
        employeeSelectlist({name:queryString,addSysUserFlag:addSysUserFlag}).then(res=>{
          this.employeeOptions = res.data
        })
    },
     // 取消按钮
    cancel() {
      this.visible = false;
    },
    //保存按钮操作
    submitForm(formName) {
       if(this.loginPass){
         this.createItem.loginPassSha256=sha256(this.loginPass);
       }
        this.$refs[formName].validate((valid) => {
          if (valid) {
             sysUserSave(this.createItem).then(res=>{
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
.base-data {
  .update-primary-button{
    background-color: #E9851F !important;
    border:1px solid #E9851F;
  }
}
</style>