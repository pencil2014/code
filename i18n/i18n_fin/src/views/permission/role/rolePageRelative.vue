<template>
  <el-dialog title="角色关联页面" :close-on-click-modal="false" :visible.sync="visible" width="600px" @close="dialogClose" custom-class="role-page-relative">
    <el-form :model="createItem" :rules="rules" ref="createItemForm" @keyup.enter.native="submitForm('createItemForm')" label-width="80px" v-loading="dataFormLoading">
      <el-form-item label="角色名称" prop="roleCode">
        <el-select  style="width:100%" clearable filterable  size="mini"  v-model="createItem.roleCode"  >
             <el-option v-for="(o, key) in roleOptionList "
                :key="key"
                :label="o.roleName"
                :value="o.roleCode">
              </el-option>
         </el-select>
      </el-form-item>
      <el-form-item size="mini" label="授权">
         <div class="rule_tree">
            <el-input class='rule_tree_input'
              size="mini"
              placeholder="输入关键字进行过滤"
              v-model="filterText">
          </el-input>
          <el-scrollbar class="scrollbar-class" >
            <el-tree :data="pageList" :filter-node-method="filterNode" :props="pageListTreeProps" node-key="key" ref="pageListTree" :default-expand-all="true" show-checkbox ></el-tree>
          </el-scrollbar>
         </div>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitForm('createItemForm')">确定</el-button>
      <el-button @click="visible = false">取消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import {roleSelectList,allPageModule,saveRolePageModule,roleRelativedPageList} from '@/api/permission'
import { mapGetters } from 'vuex'
import { treeDataTranslate } from '@/utils/index'
export default {
  name:"roleMenuRelative",
  data() {
    return {
      //弹框标题
      title:"",
      filterText: '',
      //弹框开关
      visible:false,
      sysRoleId:'',
      dataFormLoading: false,
      pageListTreeProps: {
        label: 'name',
        children: 'subTreeList'
      },
      roleRelativedPageList:[],
      roleOptionList:[],
      pageList:[],
      roleList: [],
      createItem:{
        roleCode:"",
        pages:[]
      },
     rules: {
        roleCode: [
            { required: true, message: '角色名称不能为空', trigger: 'blur' },
          ]
      },
      loading:false,
    };
  },
   // table基础组件
  components:{
  },
  watch: {
    filterText(val) {
      this.$refs.pageListTree.filter(val);
    },
    visible(val) {
      this.filterText = ''
    }
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
         this.sysRoleId=row.sysRoleId
         this.createItem.roleCode=row.roleCode
      }
      this.visible=true
      this.loanBasicData()
    },
    //清空数据
    dialogClose(){
      this.$refs['createItemForm'].resetFields()
      Object.assign(this.createItem, {
        roleCode:"",
        pages:[]
      })
      this.sysRoleId=""
    },
    loanBasicData(){
      roleSelectList({state:'valid'}).then(res=>{
          this.roleOptionList = res.data
      })
      allPageModule().then(res=>{
          this.pageList = res.data
       }).then(()=>{
        //加在当前角色已经关联的菜单
         if(this.sysRoleId){
            this.$refs.pageListTree.setCheckedKeys([]);
            roleRelativedPageList({sysRoleId:this.sysRoleId}).then(res=>{
              this.roleRelativedPageList = res.data
              this.roleRelativedPageList.forEach(item =>{ 
                  this.$refs.pageListTree.setChecked(item.key, true)
                });
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
       this.handlerSelectData()
       this.$refs[formName].validate((valid) => {
          if (valid&&this.validate()) {
              saveRolePageModule(this.createItem).then(res=>{
                this.$message({message: '恭喜你，保存成功', type: 'success'});
                this.visible = false
                this.$emit('refreshDataList');
              })
          } else {
            return false;
          }
        });
    },
    validate(){
      // let selectKeys=[].concat(this.$refs.pageListTree.getCheckedKeys(), this.$refs.pageListTree.getHalfCheckedKeys())
      // if(selectKeys.length==0){
      //     this.$message.warning('请选择需要授权的页面及功能')
      //     return false
      // } 
      return true
    },
    handlerSelectData(){
      let selectKeys=[].concat(this.$refs.pageListTree.getCheckedKeys(), this.$refs.pageListTree.getHalfCheckedKeys())
      if(selectKeys.length>0){
        let pageMap=new Map();
        let moduleMap=new Map();
        let functionMap=new Map();
        selectKeys.map(item=>{
          let tempArr=item.split("-");
          if(tempArr.length==2){
            this.handlerPageSelect(pageMap,item,tempArr[1])
          }
          if(tempArr.length==4){
            this.hadnlerModuleSelect(moduleMap,item,tempArr[3])
          } else if(tempArr.length===6){
             let moduleKey=tempArr[0]+"-"+tempArr[1]+"-"+tempArr[2]+"-"+tempArr[3]
             this.hadnlerModuleSelect(moduleMap,moduleKey,tempArr[3])
             //处理功能数据
             this.handlerFunctionSelect(functionMap,item,tempArr[5])
          }
        })
        this.handleCreateItem(pageMap,moduleMap,functionMap)
        
      }
    },
    handleCreateItem(pageMap,moduleMap,functionMap){
      this.createItem.pages=[]
        if(pageMap){
          for(let pageItem of pageMap){
             let page=pageItem[1]
             page.modules=[]
             if(moduleMap){
                 for(let moduleItem of moduleMap){
                   let tempArr=moduleItem[0].split("-")
                   let moudle=moduleItem[1]
                   moudle.functions=[]
                   if((tempArr[0]+"-"+tempArr[1])===pageItem[0]){
                     page.modules.push(moudle)
                   }
                   for(let functionItem of functionMap){
                      let tempArr=functionItem[0].split("-")
                      if((tempArr[0]+"-"+tempArr[1]+"-"+tempArr[2]+"-"+tempArr[3])===moduleItem[0]){
                        moudle.functions.push(functionItem[1])
                      }
                   }
                 }
             }
             this.createItem.pages.push(page)
　　　　　　}
        }
    },
     //处理功能模块数据
    handlerFunctionSelect(functionMap,functionKey,value){
      if(!functionMap.get(functionKey)){
            let functions={};
            functions.code=value;
            functionMap.set(functionKey,functions)
      }
    },
    //处理选中的模块数据
    hadnlerModuleSelect(moduleMap,moduleKey,value){
      if(!moduleMap.get(moduleKey)){
            let modules={};
            modules.moduleId=value;
            moduleMap.set(moduleKey,modules)
      }
    },
    //处理选中的页面数据
    handlerPageSelect(pageMap,pageKey,value){
      if(!pageMap.get(pageKey)){
          let page={};
          page.pageId=value;
          pageMap.set(pageKey,page)
      }
    },
    filterNode(value, data) {
        if (!value) return true;
        return data.name.indexOf(value) !== -1;
    }
   }
}
</script>
<style  lang="scss" scoped>
// components/Base组件
.menu{
   .filter-containe {
     display: flex;
     flex-direction: row;
     justify-content: flex-start;
     font-size: 12px;
     color: #333;
     align-items: baseline;
     flex-wrap: wrap;
     .filter{
         display: flex;
         // flex: 1;
         flex-direction: row;
         justify-content: flex-start;
         flex-wrap: wrap;
         
     }
     .filter-item {
         display: inline-block;
         vertical-align: middle;
     }
   }
   
   .input-container-dialog {
     float: left;
     display: flex;
     flex-direction: row;
     justify-content: flex-end;
     align-items: center;
     margin: 10px 0 20px;
     margin-right: 25px;
     
     span.filter-txt {
         min-width: 80px;
         text-align: right;
     }
   }

   .el-table th>.cell{
     color:#222222;
   }
   .el-tag {
        background-color: #fff; 
        color: #4A4A4A; 
        border-style: none; 
   }
   .dialog-add{
     margin-top:16px;
     .el-button {
       border: 1px dashed #DCDFE6;
     }
   }
   .input-width{
      width:150px;
   }
   .m-t-8{
     margin-top:8px;
   }
  .el-input__prefix{
    line-height: 28px;
    color:#000000;
  }
  .el-input--prefix .el-input__inner {
    padding-left: 45px;
  }
 
}
 .payment-advance{
    color:#fff;
    padding:6px 16px;
    line-height: 150%;
  }

  
  .operation-btns-box{
    padding-left:10px;
  }
 .parentWrap{
   margin-left:12px;
   padding-bottom: 10px;
   .text{
      font-size: 14px;
   }
   
 }
 .rule_tree{
    width: 100%;
    height: 550px;
    .rule_tree_input{
       padding-top:5px;
       padding-bottom:5px;
    }
 }

.el-scrollbar.scrollbar-class{
  height:calc(100% - 42px);border:1px solid #dcdfe6;border-radius: 4px;
  .el-scrollbar__wrap {overflow-x: hidden;
  .el-tree-node__label{font-size:12px;}
  }
  .el-tree>.el-tree-node{
    min-width: 100%;
    display:inline-block;
  }
}
</style>
<style lang="scss">
.role-page-relative {
  margin-top: 11vh !important;
  .el-dialog__body {
    padding-bottom: 5px;
  }
}
</style>