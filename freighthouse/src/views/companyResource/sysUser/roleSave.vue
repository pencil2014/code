<template>
  <el-dialog class="base-dialog"  :title="title" :close-on-click-modal="false" :visible.sync="visible" width="800px" @close="dialogClose">
    <el-form :model="createItem" ref="createItemForm" @keyup.enter.native="submitForm('createItemForm')" label-width="80px" label-suffix=":" v-loading="dataFormLoading">
      <el-transfer :data="roleData" filterable  class="transferCont" 
            ref="customerTransfer"
            v-model="createItem.sysRoleIdList"
            :props="{key: 'sysRoleId',label: 'roleName'}"
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
import {roleSave,sysUserRoleInfo} from '@/api/companyResource'
import {roleSelectList} from '@/api/permission'
export default {
  name:"roleSave",
  data() {
    return {
      filterText: '',
      //弹框标题
      title:"",
      //弹框开关
      visible:false,
      dataFormLoading: false,
      roleData:[],//角色列表
      transferTitle:["可选角色","已选角色"],
      createItem:{
        employeeId:'',
        sysRoleIdList:[],
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
      this.title="修改角色"
      this.visible=true
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
        sysRoleIdList:[],
    
      })
    },
    loanBasicData(){
      roleSelectList({state:'valid'}).then(res=>{
          this.roleData = res.data
      })
      sysUserRoleInfo({employeeId:this.createItem.employeeId}).then(res=>{
          this.createItem.sysRoleIdList = res.data.sysRoleIdList
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
      width: 275px !important;
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
</style>