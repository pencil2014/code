<template>
<div class="menu">
   <div class="components-container">
    <div class="filter-containe search-layout">
      <div class="filter">
        <div class="search-containe">
         
        </div>
      </div>
    </div> 
  </div>
  <div class="components-container  m-t-8">
    <div class="filter-containe search-layout">
      <div class="filter">
        <el-button size="mini"  @click="handleAdd('')" type="primary">
          <i class="el-icon-plus"></i> 新增子模块
        </el-button>
        <div class='title-text'>所处页面:&nbsp;&nbsp;{{this.oQuery.pageName}}</div>
        <div class='title-text'>所处页面编码:&nbsp;&nbsp;{{this.oQuery.pageCode}}</div>
      </div>
    </div>
    <el-table v-loading="loading" :data="moduleList"  style="margin:16px 0px"
      row-key="moduleId"   default-expand-all
      :tree-props="{children: 'modules', hasChildren: 'hasChildren'}"
    >
        <el-table-column align="left" prop="moduleName" label="子模块名称" width="280" ></el-table-column>
        <el-table-column align="center" prop="moduleCode"  label="子模块编码" > </el-table-column>
        <el-table-column align="center" prop="sort"  label="序号" > </el-table-column>
        <el-table-column align="center" prop="moduleViewUrl"  label="显示功能" > </el-table-column>
        <!-- <el-table-column align="center" prop="moduleEditUrl"  label="编辑功能" > </el-table-column>
        <el-table-column align="center" prop="moduleSubmitUrl"  label="提交功能" > </el-table-column> -->
        <el-table-column align="center" prop="row" label="操作" width="180">
            <template slot-scope="scope">
              <el-button @click="handleEdit(scope.row)" type="text" size="mini"  >查看</el-button>
              <el-button @click="handleSubModule(scope.row)" type="text" size="mini"  >新增子模块</el-button>
              <el-button @click="handleDelete(scope.row)" size="mini" type="text">删除</el-button>
            </template>
         </el-table-column>
    </el-table>
  </div>
  <el-dialog :title="title" :visible.sync="open" :lock-scroll="true" width="600px"  @close="dialogClose">
     <el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":"  >
       <div class="parentWrap">
        <el-row  :gutter="20" v-if="subModuleAdd" >
          <el-col :span="10"><span class="text">所处父模块:&nbsp;&nbsp;{{this.moduleName}}</span></el-col>
          <el-col :span="10"><span class="text">父模块编码:&nbsp;&nbsp;{{this.moduleCode}}</span></el-col>
        </el-row>
        <el-row  :gutter="20" v-else>
          <el-col :span="10"><span class="text">所处页面:&nbsp;&nbsp;{{this.oQuery.pageName}}</span></el-col>
          <el-col :span="10"><span class="text">页面编码:&nbsp;&nbsp;{{this.oQuery.pageCode}}</span></el-col>
        </el-row>
       </div>
         <el-form-item label="子模块名称" label-width="80px" prop="moduleName">
          <el-input style="width:80%" size="mini" v-model="createItem.moduleName" ></el-input>
        </el-form-item>
        <el-form-item label="子模块编码" label-width="80px" prop="moduleCode">
          <el-input style="width:80%" size="mini" :disabled="sysGenCodeChecked" v-model="createItem.moduleCode" placeholder="全局唯一编码"></el-input>
           <!-- <el-checkbox style="margin-left:10px" v-model="sysGenCodeChecked" @change="handleChangeSystemGenCode">系统生成</el-checkbox> -->
        </el-form-item>
        <el-form-item label="序号" label-width="80px" prop="sort">
          <el-input style="width:80%" size="mini"  v-model="createItem.sort" placeholder="序号"></el-input>
           <!-- <el-checkbox style="margin-left:10px" v-model="sysGenCodeChecked" @change="handleChangeSystemGenCode">系统生成</el-checkbox> -->
        </el-form-item>
        <el-form-item label="功能路径URL" label-width="90px" prop="moduleViewUrl">
          <el-input style="width:80%" size="mini" v-model="createItem.moduleViewUrl" placeholder="选填(该模块有请求后端接口时)"></el-input>
       </el-form-item>
        <!-- 
          <el-form-item label="编辑功能路径" label-width="90px" prop="moduleEditUrl">
          <el-input style="width:80%" size="mini" v-model="createItem.moduleEditUrl" placeholder="选填(该模块有点击编辑功能是)"></el-input>
        </el-form-item>
          <el-form-item label="提交功能路径" label-width="90px" prop="moduleSubmitUrl">
          <el-input style="width:80%" size="mini" v-model="createItem.moduleSubmitUrl" placeholder="选填(该模块有提交功能时)"></el-input>
        </el-form-item> -->
        <el-form-item label="备注" label-width="80px" prop="remark">
           <el-input  type="textarea" :rows="2" style="width:80%" size="mini" v-model="createItem.remark" placeholder=""></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="submitForm('createItemForm')"> 
          <i class="el-icon-copy-document"></i> 保存
        </el-button>
        <el-button size="mini" @click="cancel">取 消</el-button>
      </div>
  </el-dialog>
</div>
</template>
<script>
import {moduleList,moduleSave,moduleGet,moduleDelete} from '@/api/permission'
import { mapGetters } from 'vuex'
export default {
  
  name:"module",
  data() {
  
    return {
      //弹框标题
      title:"",
      oQuery: this.$route.query,
      subModuleAdd:false,
      moduleName:"",
      moduleCode:"",
      //弹框开关
      open:false,
      moduleList: [],
      sysGenCodeChecked:false,
      createItem:{
        "pageId":"",
        "moduleId":"",
        "moduleName":"",
        "moduleCode":"",
        "sort":"",
        "moduleViewUrl":"",
        "moduleEditUrl":"",
        "moduleSubmitUrl":"",
        "sysGenCode":'yes',
        "remark":'',
        "state":"valid"
      },
      parentPageName:"",
      parentPageCode:"",
      loading:false,
      parentMenuId:null,
      //附加费模板
      rules: {
        pageName: [
            { required: true, message: '页面名称不能为空', trigger: 'blur' },
          ],
          seq:[
            { required: true, message: '显示顺序不能为空', trigger: 'blur' },
          ],
      },
    };
  },
   // table基础组件
  components:{
  },
  created() {
  },
  mounted() {
    this.getList();
  },
  computed: {
    ...mapGetters([
      'userId','dictMap'
    ])
  },
  methods: {
  
      //搜索取消按钮
    handleReset(){
      this.getList();
    },
     // 表格操作回调
    tableCallBack(action, arr) {
      let fn = this['handle' + action]
      // Add、Export、CustomColumns、ChangeLockState、Muti、SizeChange、CurrentChange、SingleEdit
      // MultiEdit、 MultiPublish、MultiInvalid、MultiDelete
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
    handleChangeSystemGenCode(val){
       this.createItem.sysGenCode="no"
       if(this.sysGenCodeChecked){
         this.createItem.sysGenCode="yes"
         this.createItem.moduleCode="";
       }
    },
    //清空数据
    dialogClose(){
      this.$refs['createItemForm'].resetFields()
      Object.assign(this.createItem, {
        "moduleId":"",
        "moduleName":"",
        "moduleCode":"",
        "sort":"",
        "moduleViewUrl":"",
        "moduleEditUrl":"",
        "moduleSubmitUrl":"",
        "sysGenCode":'yes',
        "remark":'',
        "state":"valid",
        "parentPageModuleId":""
      })
      this.subModuleAdd=false
      this.moduleName=""
      this.moduleCode=""
    },
    //新增菜单
    handleAdd(){
        this.open = true
        this.title="新增页面子模块"
    },
    //菜单编辑
    handleEdit(row){
      this.title = "查看页面"
      let params={};
       Object.assign(params, {
        moduleId:row.moduleId 
       })
      moduleGet(params).then(res=>{
        this.createItem=res.data
        this.open = true
      })
    },
   //新增子模块
    handleSubModule(row){
      this.title = "新增页面子模块"
      this.createItem.parentPageModuleId=row.moduleId
      this.moduleName=row.moduleName
      this.moduleCode=row.moduleCode
      this.subModuleAdd=true
      this.open = true
    },
    //删除列表
    handleDelete(row){
      this.$confirm('是否确认删除子模块名称为"' + row.moduleName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: "true",
        type: "warning"
      }).then(function() {
         return moduleDelete({moduleId: row.moduleId});
      }).then(() => {
        this.getList();
        this.$message({message: '删除成功', type: 'success'});
      }).catch(function() {});
    },
    getList() {
      this.loading = true;
      let params={};
      Object.assign(params, {
        pageId:this.oQuery.pageId
      })
      moduleList(params).then(res=>{
        this.moduleList = res.data
        this.loading = false
      })
    },
     // 取消按钮
    cancel() {
      this.open = false;
    },
    //保存按钮操作
    submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
              this.createItem.pageId=this.oQuery.pageId
              moduleSave(this.createItem).then(res=>{
                this.$message({message: '恭喜你，保存成功', type: 'success'});
                this.open = false
                this.getList()
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
// components/Base组件
.menu{
  .el-table .el-button{
    min-width: 30px;
    padding-left: 5px;
    padding-right: 5px;
  }
  .el-button + .el-button{
    margin-left: 5px;
  }
  .el-table ::v-deep td{
    padding: 0;
  }
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
.title-text{
  padding-left: 200px;
  font-size: 18px;
  margin-top: 5px;
}
</style>