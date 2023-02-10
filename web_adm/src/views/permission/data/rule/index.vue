<template>
<div class="menu">
   <div class="components-container">
    <div class="filter-containe search-layout">
      <div class="filter">
        <div class="search-containe">
          <div>
            <span class="filter-txt">
              规则名称
            </span>
            <el-input  clearable class="input-width" size="mini" v-model="queryForm.ruleName" placeholder="请输入角色名称"></el-input>
             <span class="filter-txt">
               是否有效：
            </span>
            <el-select  clearable  size="mini"  v-model="queryForm.state"  >
             <el-option v-for="(o, key) in dictMap['state'] "
                :key="key"
                :label="$t(`dict.state.${o.value}`)"
                :value="o.value">
              </el-option>
            </el-select>
          </div>
        </div>
      </div>
      <div class="operation-btns-box" >
        <el-button size="mini"  @click="handleSearch" type="primary">
          <i class="el-icon-search"></i> 搜索
        </el-button>
        <el-button size="mini"  @click="handleReset" plain>
           重置 
        </el-button>
      </div>
    </div> 
  </div>
  <div class="components-container  m-t-8">
    <div class="filter-containe search-layout">
      <div class="filter">
        <el-button size="mini"  @click="handleAdd()" type="primary">
          <i class="el-icon-plus"></i> 新增规则
        </el-button>
      </div>
    </div>
    <el-table v-loading="loading" :data="ruleList"  style="margin:16px 0px">
        <el-table-column align="center"  prop="ruleName" label="规则名称" ></el-table-column>
        <el-table-column align="center" min-width="200" show-overflow-tooltip prop="expression"  label="SQL" > </el-table-column>
        <el-table-column align="center" prop="state" label="是否有效" >
            <template slot-scope="scope">
                {{scope.row.state==='valid'?'是':'否'}}
            </template>
        </el-table-column>
        <el-table-column align="center" prop="row" label="操作" width="300">
            <template slot-scope="scope">
              <el-button @click="handleEdit(scope.row)" type="text" size="mini">查看</el-button>
              <el-button @click="handleDelete(scope.row)" type="text" size="mini">删除</el-button>
            </template>
         </el-table-column>
    </el-table>
       <!-- 分页 -->
      <Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack"/>
  </div>
  <el-dialog :title="title" :visible.sync="open" :lock-scroll="true" width="600px"  @close="dialogClose">
     <el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":"  >
         <el-form-item label="规则名称" label-width="80px" prop="ruleName">
          <el-input style="width:80%" size="mini" v-model="createItem.ruleName" ></el-input>
        </el-form-item>
        <el-form-item label="规则表达式" label-width="90px" prop="expression">
          <el-input type="textarea" rows="4"  style="width:80%" size="mini" v-model="createItem.expression"></el-input>
        </el-form-item>
         <el-form-item label="是否有效" label-width="80px" prop="state">
           <el-select  style="width:80%" size="mini"  v-model="createItem.state"  >
             <el-option v-for="(o, key) in dictMap['state'] "
                :key="key"
                :label="$t(`dict.state.${o.value}`)"
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
</div>
</template>
<script>
import {ruleList,ruleSave,ruleDelete} from '@/api/permission'
import { mapGetters } from 'vuex'
import Pagination from '@/components/Base/Table/pagination'
export default {
  
  name:"rule",
  data() {
  
    return {
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
      queryForm:{
        ruleName:'',
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
      ruleList: [],
      sysGenCodeChecked:true,
      createItem:{
        dpRuleId:'',
        ruleName:"",
        expression:"",
        state:"valid",
      },
      loading:false,
      //附加费模板
      rules: {
        ruleName: [
            { required: true, message: '规则名称不能为空', trigger: 'blur' },
          ],
        expression: [
            { required: true, message: '规则表达式不能为空', trigger: 'blur' },
          ]
            
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
      this.queryForm.ruleName = undefined
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
         this.createItem.roleCode="";
       }
    },
    //清空数据
    dialogClose(){
      this.$refs['createItemForm'].resetFields()
      Object.assign(this.createItem, {
        dpRuleId:'',
        ruleName:"",
        expression:"",
        state:"valid",
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
      this.$confirm('是否确认删除规则名称为"' + row.ruleName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: "true",
        type: "warning"
      }).then(function() {
         return ruleDelete({dpRuleId: row.dpRuleId});
      }).then(() => {
        this.handleSearch();
        this.$message({message: '删除成功', type: 'success'});
      }).catch(function() {});
    },
    getList(isSearch) {
      this.loading = true;
      this.initQueryForm(isSearch)
      ruleList(this.tableQuery).then(res=>{
        let {totalCount} = res.data
        this.tableConfig.pagination.total = totalCount;
        this.ruleList = res.data.list
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
              ruleSave(this.createItem).then(res=>{
                this.$message({message: '恭喜你，保存成功', type: 'success'});
                this.open = false
                this.handleSearch()
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