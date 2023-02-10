<template>
<div class="menu">
   <div class="components-container">
    <div class="filter-containe search-layout">
      <div class="filter">
        <div class="search-containe">
          <div>
            <span class="filter-txt">
              角色名称：
            </span>
            <el-select  clearable filterable  size="mini"  v-model="queryForm.roleCode"  >
             <el-option v-for="(o, key) in roleOptionList "
                :key="key"
                :label="o.roleName"
                :value="o.roleCode">
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
          <i class="el-icon-plus"></i> 页面权限配置
        </el-button>
      </div>
    </div>
    <el-table v-loading="loading" :data="rolePageRelativeList"  style="margin:16px 0px">
        <el-table-column align="center"  prop="roleName" label="角色名称" ></el-table-column>
        <el-table-column align="center" prop="roleCode"  label="角色编码" > </el-table-column>
        <el-table-column align="center" prop="decription"  label="描述" > </el-table-column>
        <el-table-column align="center" prop="row" label="操作" width="300">
            <template slot-scope="scope">
              <el-button @click="handleAdd(scope.row)" type="text" size="mini">编辑</el-button>
            </template>
         </el-table-column>
    </el-table>
       <!-- 分页 -->
      <Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack"/>
  </div>
  <rolePageRelative v-if="rolePageRelativeVisable" ref="rolePageRelative" @refreshDataList="getList"></rolePageRelative>
</div>
</template>
<script>
import {roleSelectList,rolePageRelativeList} from '@/api/permission'
import { mapGetters } from 'vuex'
import Pagination from '@/components/Base/Table/pagination'
import RolePageRelative from './rolePageRelative'
export default {
  name:"roleMenu",
  data() {
    return {
      //弹框标题
      title:"",
      rolePageRelativeVisable:false,
        // 查询条件
      tableQuery: {
       columns: [],
       query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
       currPage:1,
       pageSize:10
      },
      queryForm:{
        roleCode:'',
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
      roleOptionList:[],
      rolePageRelativeList: [],
      createItem:{
        "sysRoleId":"",
        "roleName":"",
        "roleCode":"",
        "decription":"",
        "state":"valid",
        "sysGenCode":'yes',
      },
      loading:false,
      //附加费模板
      rules: {
        roleName: [
            { required: true, message: '角色名称不能为空', trigger: 'blur' },
          ]
      },
    };
  },
   // table基础组件
  components:{
    Pagination,
    RolePageRelative
  },
  created() {
  },
  mounted() {
    this.loadBasicData();
    this.getList();
  },
  computed: {
    ...mapGetters([
      'userId','dictMap'
    ])
  },
  methods: {
    //加在初始化数据
    loadBasicData(){
      roleSelectList({state:''}).then(res=>{
          this.roleOptionList = res.data
      })
    },
     //搜索按钮
    handleSearch(){
      this.tableQuery.currPage = 1;
      this.getList(true);
    },
    
      //搜索取消按钮
    handleReset(){
      this.queryForm.roleCode = undefined
      this.queryForm.state = undefined
      this.handleReset();
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
   
    getList(isSearch) {
      this.loading = true;
      this.initQueryForm(isSearch)
      rolePageRelativeList(this.tableQuery).then(res=>{
        let {totalCount} = res.data
        this.tableConfig.pagination.total = totalCount;
        this.rolePageRelativeList = res.data.list 
        this.loading = false
      })
    },
    handleAdd(row){
      this.rolePageRelativeVisable=true
      this.$nextTick(() => {
        this.$refs.rolePageRelative.init(row);
      });
       
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