<template>
<div class="menu">
   <div class="components-container">
    <div class="filter-containe search-layout">
      <div class="filter">
        <div class="search-containe">
          <div>
            <span class="filter-txt">
              页面编码：
            </span>
            <el-input  clearable class="input-width" size="mini" v-model="queryForm.pageCode" placeholder="请输入页面编码"></el-input>
            <span class="filter-txt">
              页面名称：
            </span>
            <el-input  clearable class="input-width" size="mini" v-model="queryForm.pageName" placeholder="请输入页面名称"></el-input>
            <span class="filter-txt">
              链接地址：
            </span>
            <el-input clearable class="input-width" size="mini" v-model="queryForm.pageUrl" placeholder="请输入链接地址"></el-input>
          </div>
        </div>
      </div>
      <div class="operation-btns-box" >
        <el-button size="mini"  @click="handleSearch" type="primary">
          <i class="el-icon-search"></i> 搜索
        </el-button>
        <el-button size="mini"  @click="handleReset" plain>
          <!-- <i class="el-icon-refresh"></i> --> 重置 
        </el-button>
      </div>
    </div> 
  </div>
  <div class="components-container  m-t-8">
    <div class="filter-containe search-layout">
      <div class="filter">
        <el-button size="mini"  @click="handleAdd('')" type="primary">
          <i class="el-icon-plus"></i> 新增页面
        </el-button>
      </div>
    </div>
    <el-table v-loading="loading" :data="pageList"  style="margin:16px 0px">
        <el-table-column align="center"  prop="pageName" label="页面名称" ></el-table-column>
        <!-- <el-table-column align="center" prop="pageType"  label="页面类型"  width="80">
            <template slot-scope="scope">
                 {{$t(`dict.resourceType.${scope.row.pageType}`)}}
            </template>
        </el-table-column> -->
        <el-table-column align="center" prop="openAssess" label="公共页面" width="80" >
             <template slot-scope="scope">
                {{scope.row.openAssess==='yes'?'是':'否'}}
            </template>
        </el-table-column>
        <el-table-column align="center" prop="pageCode" label="页面编码" ></el-table-column>
        <el-table-column align="center" prop="sort" label="序号" ></el-table-column>
        <el-table-column align="center" prop="pageUrl" label="链接地址" min-width="250" ></el-table-column>
        <el-table-column align="center" prop="row" label="操作" min-width="250">
            <template slot-scope="scope">
              <el-button @click="handleEdit(scope.row)" type="text" size="mini">查看</el-button>
              <el-button  @click="handleModule(scope.row)" type="text" size="mini">页面子模块</el-button>
              <!-- <el-button  @click="changeToModule(scope.row)" type="text" size="mini">修改为子模块</el-button> -->
              <el-button @click="handleDelete(scope.row)" size="mini" type="text">删除</el-button>
            </template>
         </el-table-column>
    </el-table>
       <!-- 分页 -->
      <Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack"/>
  </div>
  <el-dialog :title="title" :visible.sync="open" :lock-scroll="true" width="600px"  @close="dialogClose">
     <el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":"  >
       <div class="parentWrap" v-if="this.parentMenuId">
        <el-row  :gutter="20">
          <el-col :span="10"><span class="text">所处页面:&nbsp;&nbsp;{{parentPageName}}</span></el-col>
          <el-col :span="10"><span class="text">页面编码:&nbsp;&nbsp;{{parentPageCode}}</span></el-col>
        </el-row>
       </div>
        <el-form-item label="页面类型" label-width="80px" prop="pageType">
           功能页
        </el-form-item>
         <el-form-item label="页面名称" label-width="80px" prop="pageName">
          <el-input style="width:80%" size="mini" v-model="createItem.pageName" ></el-input>
        </el-form-item>
        <el-form-item label="页面编码" label-width="80px" prop="pageCode">
          <el-input style="width:80%" size="mini" :disabled="sysGenCodeChecked" v-model="createItem.pageCode" placeholder="全局唯一编码"></el-input>
          <!-- <el-checkbox style="margin-left:10px" v-model="sysGenCodeChecked" @change="handleChangeSystemGenCode">系统生成</el-checkbox> -->
        </el-form-item>
        <el-form-item label="序号" label-width="80px" prop="sort">
          <el-input style="width:80%" size="mini" v-model="createItem.sort" ></el-input>
        </el-form-item>
         <el-form-item label="功能路径" label-width="80px" prop="pageUrl">
          <el-input style="width:80%" size="mini" v-model="createItem.pageUrl"></el-input>
        </el-form-item>
        <el-form-item label="业务系统" label-width="80px" prop="sysCode">
           <el-select  style="width:80%" size="mini"  v-model="createItem.sysCode"  >
             <el-option v-for="(o, key) in dictMap['sysCode'] "
                :key="key"
                :label="$t(`dict.sysCode.${o.value}`)"
                :value="o.value">
              </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="公共访问" label-width="80px" prop="openAssess">
           <el-select  style="width:80%" size="mini"  v-model="createItem.openAssess"  >
             <el-option v-for="(o, key) in dictMap['yesNo'] "
                :key="key"
                :label="$t(`dict.yesNo.${o.value}`)"
                :value="o.value">
              </el-option>
            </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="submitForm('createItemForm')"> 
          <i class="el-icon-copy-document"></i> 保存
        </el-button>
        <el-button size="mini" @click="cancel">取 消</el-button>
      </div>
  </el-dialog>
   <el-dialog :title="changeModuleTitle" :visible.sync="changeModuleOpen" :lock-scroll="true" width="600px"  @close="changeModuleDialogClose">
     <el-form ref="changeModuleCreateItemForm" :rules="changeModuleRules" :model="changeModuleCreateItem" label-suffix=":"  >
        <el-form-item label="所属页面" label-width="80px" prop="parentPageId">
            <el-select v-model="changeModuleCreateItem.parentPageId" placeholder="请选择操作" filterable clearable  size="mini" style="width:100%">
                <el-option v-for="(o, index) in pageOptions" :key="index" :label="o.pageName" :value="o.pageId"> </el-option>
            </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="changeModuleFormSubmit('changeModuleCreateItemForm')"> 
          <i class="el-icon-copy-document"></i> 保存
        </el-button>
        <el-button size="mini" @click="changeModuleCancel">取 消</el-button>
      </div>
  </el-dialog>
</div>
</template>
<script>
import {pageList,pageAdd,pageGet,pageDelete,pageToModule} from '@/api/permission'
import { mapGetters } from 'vuex'
import Pagination from '@/components/Base/Table/pagination'
export default {
  
  name:"page",
  data() {
  
    return {
      //弹框标题
      title:"",
      //弹框开关
      open:false,
      pageOptions:[],
      changeModuleOpen:false,
        // 查询条件
      tableQuery: {
       columns: [],
       query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
       currPage:1,
       pageSize:10
      },
      queryForm:{
        pageType:'page',
        pageCode:'',
        pageName:'',
        pageUrl:'',
        state:''
      },
      tableConfig: {
        style: {},
        tableIndex: {
          show: false
        },
        // 操作提示
        tips: {
          text: '',
          show: false
        },
        // 分页
        pagination: {
          show: true,
          total: 0
        }
      },
      pageList: [],
      sysGenCodeChecked:false,
      createItem:{
        "pageId":"",
        "pageName":"",
        "pageCode":"",
        "sysCode":"",
        "pageUrl":"",
        "openAssess":"no",
        "state":"valid",
        "sysGenCode":'yes',
        "sysCode":"",
        "sort":""
      },
      changeModuleCreateItem:{
        "parentPageId":"",
        "pageId":""
      },
      changeModuleTitle:"",
      parentPageName:"",
      parentPageCode:"",
      loading:false,
      parentMenuId:null,
      rules: {
        pageName: [
            { required: true, message: '页面名称不能为空', trigger: 'blur' },
          ],
          seq:[
            { required: true, message: '显示顺序不能为空', trigger: 'blur' },
          ],
      },
       //附加费模板
      changeModuleRules: {
        parentPageId: [
            { required: true, message: '所属页面不能为空', trigger: 'blur' },
          ],
       
      },
    };
  },
   // table基础组件
  components:{
    Pagination
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
     //搜索按钮
    handleSearch(){
      this.tableQuery.currPage = 1;
      this.getList(true);
    },
      //搜索取消按钮
    handleReset(){
      this.queryForm.pageCode = undefined
      this.queryForm.pageName = undefined
      this.queryForm.pageUrl = undefined
      this.queryForm.state = undefined
      this.handleSearch();
    },
     // 表格操作回调
    tableCallBack(action, arr) {
      let fn = this['handle' + action]
      // Add、Export、CustomColumns、ChangeLockState、Muti、SizeChange、CurrentChange、SingleEdit
      // MultiEdit、 MultiPublish、MultiInvalid、MultiDelete
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
    handleSizeChange() {
      this.getList()
    },

    handleCurrentChange() {
      this.getList()
    },
    handleChangeSystemGenCode(val){
       this.createItem.sysGenCode="no"
       if(this.sysGenCodeChecked){
         this.createItem.sysGenCode="yes"
         this.createItem.pageCode="";
       }
    },
    //清空数据
    dialogClose(){
      this.$refs['createItemForm'].resetFields()
      Object.assign(this.createItem, {
        "pageId":"",
        "pageName":"",
        "pageCode":"",
        "sysCode":"",
        "pageUrl":"",
        "openAssess":"no",
        "state":"valid",
        "sysGenCode":'yes',
        "sysCode":"",
        "sort":""
      })
    },
    changeModuleDialogClose(){
      this.$refs['changeModuleCreateItemForm'].resetFields()
      Object.assign(this.createItem, {
        "pageId":"",
        "parentPageId":"",
      })
    },
    //页面子模块列表
    handleModule(row){
      this.$router.push({
        path: 'pageModule?pageId=' + row.pageId+'&pageName='+row.pageName+'&pageCode='+row.pageCode
      })
    },
     //修改為子模塊
    changeToModule(row){
      this.initPageOptions()
      this.changeModuleTitle=row.pageName+"修改为子模块"
      this.changeModuleCreateItem.pageId=row.pageId
      this.changeModuleOpen = true
    },
    initPageOptions(){
      pageList({currPage:1,pageSize:99999}).then(res=>{
        this.pageOptions = res.data.list
      })
    },
    //新增菜单
    handleAdd(row){
        this.open = true
        this.title = "新增页面"
    },
    //菜单编辑
    handleEdit(row){
      this.title = "查看页面"
      let params={};
       Object.assign(params, {
        pageId:row.pageId 
       })
      pageGet(params).then(res=>{
        this.createItem=res.data
        this.open = true
      })
      
    },
    //删除列表
    handleDelete(row){
      this.$confirm('是否确认删除页面名称为"' + row.pageName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: "true",
        type: "warning"
      }).then(function() {
         return pageDelete({pageId: row.pageId});
      }).then(() => {
        this.getList();
        this.$message({message: '删除成功', type: 'success'});
      }).catch(function() {});
    },
    getList(isSearch) {
      this.loading = true;
      this.initQueryForm(isSearch)
      pageList(this.tableQuery).then(res=>{
        let {totalCount} = res.data
        this.tableConfig.pagination.total = totalCount;
        this.pageList = res.data.list
        this.loading = false
      })
    },
    initQueryForm(isSearch){
      let obj=this.queryForm;
      let query = []
          Object.keys(obj).forEach(function(key){
              if(obj[key]){
                //默认的查询条件组装tableQuery参数
                let tempQuery = {}
                  Object.assign(tempQuery, {
                    "column": key,
                    "type": 'eq',
                    "value": obj[key]
                  })
                  query.push(tempQuery)
              }
          })
         if(isSearch){
         this.searchBackup = query
        }
        this.tableQuery.query = this.searchBackup || []
    },
     // 取消按钮
    cancel() {
      this.open = false;
    },
    //保存按钮操作
    submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
              pageAdd(this.createItem).then(res=>{
                this.$message({message: '恭喜你，保存成功', type: 'success'});
                this.open = false
                this.handleSearch()
              })
          } else {
            return false;
          }
        });
    },
       // 取消按钮
    changeModuleCancel() {
      this.changeModuleOpen = false;
    },
    changeModuleFormSubmit(formName){
      this.$refs[formName].validate((valid) => {
               if (valid) {
                      pageToModule(this.changeModuleCreateItem).then(res=>{
                        this.$message({message: '恭喜你，修改成功', type: 'success'});
                        this.changeModuleOpen = false
                        this.handleSearch()
                      })
                  } else {
                    return false;
                  }
      })
     
   }
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

</style>