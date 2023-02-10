<template>
<div class="menu">
   <div class="components-container">
    <div class="filter-containe search-layout">
      <div class="filter">
        <div class="search-containe">
          <div>
            <span class="filter-txt">
              业务编码
            </span>
            <el-input  clearable class="input-width" size="mini" v-model="queryForm.moduleCode" placeholder="请输入业务编码"></el-input>
            <span class="filter-txt">
              分组名称
            </span>
            <el-input  clearable class="input-width" size="mini" v-model="queryForm.groupName" placeholder="请输入分组名称"></el-input>
            <span class="filter-txt">
              分组编码
            </span>
            <el-input  clearable class="input-width" size="mini" v-model="queryForm.groupCode" placeholder="请输入分组编码"></el-input>
             <!-- <span class="filter-txt">
               是否有效：
            </span>
            <el-select  clearable  size="mini"  v-model="queryForm.state"  >
             <el-option v-for="(o, key) in dictMap['state'] "
                :key="key"
                :label="$t(`dict.state.${o.value}`)"
                :value="o.value">
              </el-option>
            </el-select> -->
          </div>
        </div>
      </div>
      <div class="operation-btns-box" >
        <el-button size="small"  @click="handleSearch" type="primary">
          <i class="el-icon-search"></i> 搜索
        </el-button>
        <el-button size="small"  @click="handleReset" plain>
           重置 
        </el-button>
      </div>
    </div> 
  </div>
  <div class="components-container  m-t-8">
    <div class="filter-containe search-layout">
      <div class="filter">
        <el-button size="small"  @click="handleAdd()" type="primary">
          <i class="el-icon-plus"></i> 新增规则
        </el-button>
      </div>
    </div>
    <el-table v-loading="loading" :data="ruleGroupList"  style="margin:16px 0px">
        <el-table-column align="center"  prop="groupName" label="分组名称" ></el-table-column>
        <el-table-column align="center" prop="groupCode"  label="分组编码" > </el-table-column>
        <el-table-column align="center" prop="moduleCode"  label="业务编码"  > </el-table-column>
        <el-table-column align="center" prop="remark"  label="说明" show-overflow-tooltip> </el-table-column>
        <!-- <el-table-column align="center" prop="state" label="是否有效" >
            <template slot-scope="scope">
                {{scope.row.state==='valid'?'是':'否'}}
            </template>
        </el-table-column> -->
        <el-table-column align="center" prop="row" label="操作" width="300">
            <template slot-scope="scope">
              <el-button @click="handleEdit(scope.row)" type="text" size="small">查看</el-button>
              <el-button @click="handleEdit(scope.row)" type="text" size="small">测试</el-button>
              <el-button @click="handleDelete(scope.row)" type="text" size="small">删除</el-button>
            </template>
         </el-table-column>
    </el-table>
       <!-- 分页 -->
      <Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack"/>
  </div>
  <el-dialog :title="title" :visible.sync="open" :lock-scroll="true" width="800px" @open="dialogOpen"  @close="dialogClose">
     <el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":"  >
       <el-row :gutter="20">
         <el-col :span="13">
          <el-form-item label="分组名称" label-width="80px" prop="groupName">
            <el-input style="width:100%" size="small" v-model="createItem.groupName" ></el-input>
          </el-form-item>
          <el-form-item label="分组编码" label-width="80px" prop="groupCode">
            <el-input style="width:100%" size="small" v-model="createItem.groupCode" ></el-input>
          </el-form-item>
          <el-form-item label="业务编码" label-width="80px" prop="moduleCode">
            <el-input style="width:100%" size="small" v-model="createItem.moduleCode" ></el-input>
          </el-form-item>
          <el-form-item label="说明" label-width="80px" prop="remark">
            <el-input type="textarea" rows="3"  style="width:100%" size="small" v-model="createItem.remark"></el-input>
          </el-form-item>
          <!-- <el-form-item label="是否有效" label-width="80px" prop="state">
            <el-select  style="width:100%" size="mini"  v-model="createItem.state"  >
              <el-option v-for="(o, key) in dictMap['state'] "
                  :key="key"
                  :label="$t(`dict.state.${o.value}`)"
                  :value="o.value">
                </el-option>
              </el-select>
          </el-form-item> -->
         </el-col>
          <el-col :span="7">
             <div class='title_class'>关联规则</div>
            <div class="rule_tree">
              <el-input class='rule_tree_input'
                 size="small"
                placeholder="输入关键字进行过滤"
                v-model="filterText">
              </el-input>
             <el-scrollbar class="scrollbar-class" >
                <el-tree    :filter-node-method="filterNode" :data="ruleList" :props="ruleListTreeProps" node-key="dpRuleId" ref="ruleListTree"  show-checkbox ></el-tree>
             </el-scrollbar>
            </div>
          </el-col>
       </el-row>
      </el-form>
     
      <div slot="footer" class="dialog-footer">
        <el-button size="small" type="primary" @click="submitForm('createItemForm')"> 
          <i class="el-icon-copy-document"></i> 保存
        </el-button>
        <el-button size="small" @click="cancel">取 消</el-button>
      </div>
  </el-dialog>
</div>
</template>
<script>
import {ruleGroupList,groupSave,ruleGroupDelete,ruleSelectList,ruleGroupRelativedList} from '@/api/permission'
import { mapGetters } from 'vuex'
import Pagination from '@/components/Base/Table/pagination'
export default {
  
  name:"ruleGroup",
  data() {
  
    return {
      filterText: '',
      //弹框标题
      title:"",
      //弹框开关
      open:false,
        // 查询条件
      tableQuery: {
       columns: [],
       query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
       currPage:1,
       pageSize:10
      },
      ruleList:[],
      ruleListTreeProps: {
        label: 'ruleName',
        children: 'subMenu'
      },
      queryForm:{
        moduleCode:'',
        groupName:'',
        groupCode:'',
        // state:''
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
      ruleGroupList: [],
      sysGenCodeChecked:true,
      createItem:{
        dpGroupId:'',
        groupName:'',
        groupCode:"",
        moduleCode:"",
        remark:"",
        state:"valid",
        ruleIdList:[]
      },
      loading:false,
      //附加费模板
      rules: {
        moduleCode: [
            { required: true, message: '业务编码不能为空', trigger: 'blur' },
          ],
        groupName: [
            { required: true, message: '分组名称不能为空', trigger: 'blur' },
          ],
        groupCode: [
          { required: true, message: '分组编码不能为空', trigger: 'blur' },
        ]
      },
    };
  },
  watch: {
    filterText(val) {
      this.$refs.ruleListTree.filter(val);
    }
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
      this.queryForm.moduleCode = undefined
      this.queryForm.groupName = undefined
      this.queryForm.groupCode = undefined
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
  
    //清空数据
    dialogClose(){
      this.$refs['createItemForm'].resetFields()
      Object.assign(this.createItem, {
        dpGroupId:'',
        groupName:'',
        groupCode:"",
        moduleCode:"",
        remark:"",
        state:"valid",
        ruleIdList:[]
      })
    },
    dialogOpen(){
      this.ruleList=[]
      ruleSelectList().then(res=>{
        this.ruleList=res.data
      }).then(()=>{
          if(this.createItem.dpGroupId){
            ruleGroupRelativedList({dpGroupId:this.createItem.dpGroupId}).then(res=>{
                this.relativedRuleList = res.data
                 this.relativedRuleList.forEach(item =>{ 
                  this.$refs.ruleListTree.setChecked(item.dpRuleId, true)
                });
            })
          }
      })
    },
    //新增菜单
    handleAdd(){
        this.open = true
        this.title = "新增规则"
    },
    //菜单编辑
    handleEdit(row){
      this.title = "查看规则"
      for(var p in this.createItem){
         this.createItem[p]=row[p]
      }  
      this.open = true
    },
 
    //删除列表
    handleDelete(row){
      this.$confirm('是否确认删除分组名称为"' + row.groupName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: "true",
        type: "warning"
      }).then(function() {
         return ruleGroupDelete({dpGroupId: row.dpGroupId});
      }).then(() => {
        this.handleSearch();
        this.$message({message: '删除成功', type: 'success'});
      }).catch(function() {});
    },
    getList(isSearch) {
      this.loading = true;
      this.initQueryForm(isSearch)
      ruleGroupList(this.tableQuery).then(res=>{
        let {totalCount} = res.data
        this.tableConfig.pagination.total = totalCount;
        this.ruleGroupList = res.data.list
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
        let selectKeys=[].concat(this.$refs.ruleListTree.getCheckedKeys(), this.$refs.ruleListTree.getHalfCheckedKeys())
        this.createItem.ruleIdList=selectKeys
        this.$refs[formName].validate((valid) => {
          if (valid) {
              groupSave(this.createItem).then(res=>{
                this.$message({message: '恭喜你，保存成功', type: 'success'});
                this.open = false
                this.handleSearch()
              })
          } else {
            return false;
          }
        });
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.ruleName.indexOf(value) !== -1;
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
 .title_class{
    font-size: 18px;
    font-weight: bold;
    padding: 5px;
 }
 .rule_tree{
    width: 300px;
    height: 300px;
    .rule_tree_input{
       padding-top:5px;
       padding-bottom:5px;
    }
 }
.el-scrollbar.scrollbar-class{
  height:100%;border:1px solid #dcdfe6;border-radius: 4px;
  .el-scrollbar__wrap {overflow-x: hidden;
  .el-tree-node__label{font-size:12px;}
  }

}
.rule_tree{
  .el-tree>.el-tree-node{
    min-width: 100%;
    display:inline-block;
  }
}



</style>