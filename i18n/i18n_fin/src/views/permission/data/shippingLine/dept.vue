<template>
<div class="menu">
   <div class="components-container">
    <div class="filter-containe search-layout">
    </div> 
  </div>
  <div class="components-container  m-t-8">
    <div class="filter-containe search-layout">
      <div class="filter">
        <el-button size="mini"  @click="handleAdd()" type="primary">
          <i class="el-icon-plus"></i> 部门关联航线
        </el-button>
      </div>
    </div>
    <el-table v-loading="loading" :data="lineGroupDeptList"  style="margin:16px 0px">
        <el-table-column align="center"  prop="deptCname" label="部门名称" ></el-table-column>
        <el-table-column align="center"  prop="sysLineGroupCnames" label="关联航线" ></el-table-column>
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
        <el-form-item label="部门名称" label-width="100px" prop="deptCodes">
              <el-cascader  filterable size="mini" style="width:80%" :options="departmentList" v-model="createItem.deptCodes" @change="handleChange" :props="cascaderProps" placeholder="请选择部门" change-on-select expandTrigger='click' ></el-cascader>
        </el-form-item>
        <el-form-item label="航线名称" label-width="100px" prop="sysLineGroupCodes">
            <el-select clearable filterable  multiple  style="width:80%" size="mini"  v-model="createItem.sysLineGroupCodes" placeholder="请选择航线" >
              <el-option v-for="(o, key) in systemLineOptions "
                :key="key"
                :label="o.sysLineGroupCname"
                :value="o.sysLineGroupCode">
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
import {lineGroupDeptList,lineGroupRelativedDept,lineGroupDeptDelete,shippingLineGroupList} from '@/api/permission'
import {departmentTreeList} from '@/api/companyResource'
import {baseSystemLineList} from '@/api/base'
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
      cascaderProps: {
        children: 'childList',
        label: 'deptCname',
        value: 'deptCode'
      },
      systemLineOptions:[],
      departmentList:[],
      lineGroupDeptList: [],
      createItem:{
        deptCode:'',
        deptCodes:[],
        sysLineGroupCodes:[]
      },
      loading:false,
      //附加费模板
      rules: {
          deptCodes:[ { required: true, message: '部门名称不能为空', trigger: 'blur' },
          ] ,
           sysLineGroupCodes:[ { required: true, message: '关联航线不能为空', trigger: 'blur' },
          ] ,
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
    this.loadBasicData()
  },
  computed: {
    ...mapGetters([
      'userId','dictMap'
    ])
  },
  methods: {
    loadBasicData(){
      departmentTreeList({state:'valid'}).then(res=>{
        this.departmentList = this.getTreeData(res.data);
      })
      shippingLineGroupList({pageSize:9999}).then(res=>{
         this.systemLineOptions=res.data.list;
      })
    },
    handlerParentCodes(){
       this.createItem.deptCodes=[];
       let codeLevel=this.createItem.deptCode.length/3
       for(var i=0;i<codeLevel;i++){
          this.createItem.deptCodes.push(this.createItem.deptCode.substring(0,(i+1)*3))
       }
    },
     // 转化children的空数组为undefined
    getTreeData(data) {
      for (let i = 0; i < data.length; i++) {
        if (!data[i].childList.length) {
          // children若为空数组，则将children设为undefined
          data[i].childList = undefined
        } else {
          this.getTreeData(data[i].childList)
        }
      }
      return data
    },
     handleChange(value) {
      this.createItem.deptCode = value[value.length - 1];
    },
     //搜索按钮
    handleSearch(){
      this.tableQuery.currPage = 1;
      this.getList();
    },
      //搜索取消按钮
    handleReset(){
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
        deptCode:'',
        deptCodes:[],
        sysLineGroupCodes:[]
      })
    },
     
    //新增菜单
    handleAdd(){
        this.open = true
        this.title = "新增部门关联航线"
    },
    //菜单编辑
    handleEdit(row){
      this.title = "查看部门关联航线"
      for(var p in this.createItem){
         this.createItem[p]=row[p]
      }  

      this.handlerParentCodes()    
      this.open = true
    },
    //删除列表
    handleDelete(row){
      this.$confirm('是否确认删除部门为"' + row.deptCname + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: "true",
        type: "warning"
      }).then(function() {
         return lineGroupDeptDelete({deptCode: row.deptCode});
      }).then(() => {
        this.handleSearch();
        this.$message({message: '删除成功', type: 'success'});
      }).catch(function() {});
    },
   
    getList() {
      this.loading = true;
      this.initQueryForm()
      lineGroupDeptList(this.tableQuery).then(res=>{
        let {totalCount} = res.data
        this.tableConfig.pagination.total = totalCount;
        this.lineGroupDeptList = res.data.list
        this.loading = false
      })
    },
    initQueryForm(){
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
      this.tableQuery.query=query;
    },
     // 取消按钮
    cancel() {
      this.open = false;
    },
    //保存按钮操作
    submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
              lineGroupRelativedDept(this.createItem).then(res=>{
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
 .el-cascader-panel .el-radio{ 
  z-index: 10;
  width: 99%; 
  height: 99%;
  position: absolute; 
  top: 10px; 
  right: -12px; 
} 
.el-cascader-panel .el-radio__input{
  visibility: hidden;  
} 
.el-cascader-panel .el-cascader-node__postfix{ 
  top: 10px; 
}

</style>