<template>
  <el-dialog class=""  title="分配角色" :close-on-click-modal="false" :visible.sync="visible" width="800px" @close="dialogClose">
    <el-form :model="createItem" ref="createItemForm" @keyup.enter.native="submitForm('createItemForm')" label-width="80px" label-suffix=":" v-loading="dataFormLoading">
      <el-transfer :data="roleData" filterable  class="transferCont" 
            ref="customerTransfer"
            v-model="createItem.sysRoleIds"
            target-order="unshift"
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
import {roleSelectList,authorityRoleList,authorityRoleSave} from '@/api/permission'
export default {
  name:"roleSave",
  data() {
    return {
      filterText: '',
      //弹框开关
      visible:false,
      dataFormLoading: false,
      roleData:[],//角色列表
      transferTitle:["可选角色","已选角色"],
      createItem:{
        sysAuthorityId:'',
        sysRoleIds:[],
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
      this.visible=true
      this.createItem.sysAuthorityId=row.sysAuthorityId
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
        sysAuthorityId:'',
        sysRoleIds:[],
    
      })
    },
    loanBasicData(){
      roleSelectList({state:'valid'}).then(res=>{
          this.roleData = res.data
      })
      authorityRoleList({sysAuthorityId:this.createItem.sysAuthorityId}).then(res=>{
          this.createItem.sysRoleIds = res.data.sysRoleIds
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
             authorityRoleSave(this.createItem).then(res=>{
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
          overflow: none;
        
       }
     /deep/ .el-transfer-panel__item.el-checkbox .el-checkbox__label {
        font-size: 12px;
        overflow:inherit !important;
    }
}

</style>