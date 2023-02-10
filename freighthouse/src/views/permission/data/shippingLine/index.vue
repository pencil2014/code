<template>
<div class="menu finance-page">
   <!-- <div class="components-container">
    <div class="filter-containe search-layout">
    </div> 
  </div> -->
  <FinanceSearch :searchOption="searchOption1" @search="search" @cancel="search"/>
  <div class="finance-search-list-gap"></div>
  <div class="components-container" style="padding:0 8px 8px;">
    <div class="search-layout">
      <div class="filter" style="padding-top: 8px">
        <el-button size="mini" class="finance-btn"  @click="handleAdd()" type="primary">
          新增大航线
        </el-button>
      </div>
    </div>
    <div class="table-container table-layout" style="margin:0;padding:0">
    <el-table v-loading="loading" border :data="shippingLineGroupList" style="margin:0 0px 16px">
          <el-table-column
            type="selection"
            width="30">
          </el-table-column>
        <el-table-column align="center"  prop="sysLineGroupCode" label="航线代码" ></el-table-column>
        <el-table-column align="center"  prop="sysLineGroupCname" label="航线中文名称" ></el-table-column>
        <el-table-column align="center"  prop="sysLineGroupEname" label="航线英文名称" ></el-table-column>
        <el-table-column align="center"  prop="manageEmployeeName" label="航线经理" ></el-table-column>
        <el-table-column align="center"  prop="state" label="是否启用" >
           <template slot-scope="scope">
            {{scope.row.state==='valid'?'有效':'无效'}}
           </template>
        </el-table-column>
        <el-table-column align="center" prop="row" label="操作" width="300">
            <template slot-scope="scope">
              <el-button @click="handleEdit(scope.row)" type="text" size="mini">查看</el-button>
              <el-button @click="handleRelativeSystemLine(scope.row)" type="text" size="mini">关联系统航线</el-button>
              <el-button @click="handleDelete(scope.row)" type="text" size="mini">失效</el-button>
            </template>
         </el-table-column>
    </el-table>
    </div>
       <!-- 分页 -->
      <Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack"/>
  </div>
  <el-dialog :title="title" :visible.sync="open" :lock-scroll="true" width="500px"  @close="dialogClose">
     <el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":"  >
         <el-form-item label="航线中文名称" label-width="100px" prop="sysLineGroupCname">
          <el-input style="width:100%" size="mini" v-model="createItem.sysLineGroupCname" ></el-input>
        </el-form-item>
        <el-form-item label="航线英文名称" label-width="100px" prop="sysLineGroupEname">
          <el-input style="width:100%" size="mini" v-model="createItem.sysLineGroupEname" ></el-input>
        </el-form-item>
        <el-form-item label="航线经理" label-width="100px" prop="managerId">
          <el-select filterable remote clearable style="width:100%" size="mini" v-model="createItem.managerId" placeholder="请选择航线经理" :remote-method="getEmployeeLists" @change="managerNameChange">
            <el-option v-for="o in managerList" :key="o.employeeId" :label="o.cname+'  ('+o.employeeNo+')'" :value="o.employeeId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否启用" label-width="100px" prop="state">
          <el-radio-group v-model="createItem.state">
            <el-radio v-for="(o, key) in dictMap['state']" :key="key" :label="o.value">
              {{ $t(`dict.state.${o.value}`) }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="submitForm('createItemForm')"> 
          确定
        </el-button>
        <el-button size="mini" @click="cancel">取 消</el-button>
      </div>
  </el-dialog>
  <el-dialog :title="title" :visible.sync="relativeSystemLineOpen" :lock-scroll="true" width="500px"  @close="relativeDialogClose">
     <el-form ref="relativeCreateItemForm" :rules="relativeRules" :model="relativeCreateItem" label-suffix=":"  >
         <el-form-item label="航线中文名称" label-width="100px" prop="sysLineGroupCname">
               <span style="font-size:12px" >{{relativeCreateItem.sysLineGroupCname}}</span>
        </el-form-item>
       <el-form-item label="系统航线" label-width="100px" prop="lineCodes">
            <el-select clearable filterable  multiple  style="width:100%" size="mini"  v-model="relativeCreateItem.lineCodes" placeholder="请选择系统航线" >
              <el-option v-for="(o, key) in systemLineOptions "
                :key="key"
                :label="o.cname"
                :value="o.sysLineCode">
              </el-option>
            </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="relativeSubmitForm('relativeCreateItemForm')"> 
          确定
        </el-button>
        <el-button size="mini" @click="relativeCancel">取 消</el-button>
      </div>
  </el-dialog>
</div>
</template>
<script>
import {shippingLineGroupList,lineGroupSave,lineGroupDelete,lineGroupRelativedLine,groupRelativedLineInfo} from '@/api/permission'
import {baseSystemLineList} from '@/api/base'
import { mapGetters } from 'vuex'
import Pagination from '@/components/Base/Table/pagination'
import { employeeSelectlist } from '@/api/companyResource'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
export default {
   mixins: [mixin, mixin2, routerMixin],
  name:"rule",
  data() {
  
    return {
      multipleSelection: [],
      searchOption1: {},
      managerList: [],
      //弹框标题
      title:"",
      //弹框开关
      open:false,
      relativeSystemLineOpen:false,
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
      systemLineOptions:[],
      shippingLineGroupList: [],
      sysGenCodeChecked:true,
      createItem:{
        id:'',
        sysLineGroupCname:"",
        sysLineGroupEname:"",
        state:'valid',
        managerId: '',
        managerName: '',
      },
      relativeCreateItem:{
        sysLineGroupCname:'',
        sysLineGroupCode:'',
        lineCodes:[],
      },
      loading:false,
      //附加费模板
      rules: {
        sysLineGroupCname: [
            { required: true, message: '航线名称不能为空', trigger: 'blur' },
          ],
      },
      relativeRules: {
        lineCodes: [
            { required: true, message: '系统航线不能为空', trigger: 'blur' },
          ],
      },
    };
  },
   // table基础组件
  components:{
    Pagination,
    FinanceSearch
  },
  created() {
    this.searchOption1 = {
      addFilter: {
        defaultSearchLength: 3,
        searchInputGroup: [
          { key: 'name', value: '', showType: '1' },
          { key: 'sysLineGroupCode', value: '', showType: '1' },
          { key: 'state', value: '', showType: '2' },
          { key: 'managerId', value: '', showType: '3' },
        ],
        filterGroups: {
          name: { label: '航线名称', type: 'input', showType: '1' },
          sysLineGroupCode: { label: '航线代码', type: 'input', showType: '1' },
          managerId: { 
            label: '航线经理',
            type: 'remoteSelect',
            clearable: true,
            showType: '3',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList({name:queryString,roleCodes:'pricing'}, item),
            visibleChange: (queryString, item) => this.getEmployeeList({name:queryString,roleCodes:'pricing'}, item),
           },
          state: { label: '是否启用', type: 'select', showType: '2',
            selectOptions: [
              { label: '是', value: 'valid' },
              { label: '否', value: 'invalid' }
            ]
          }
        }
      }
    }
    let pagination = Object.assign({}, this.option.pagination, {
      show: true,
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'sysUserList',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      operationBtns:[],
      pagination,
    })
  },
  mounted() {
    // this.getList();
  },
  computed: {
    ...mapGetters([
      'userId','dictMap'
    ])
  },
  methods: {
    search() {
      this.option1.pagination.currPage = 1
      this.getList(true);
    },
    managerNameChange(val) {
      console.log(val)
      if (!val) {
        this.createItem.managerName = ''
        this.getEmployeeLists('')
      }else{
        let item = this.managerList.find(el=>el.employeeId === val)
        this.createItem.managerName = item?item.cname:''
      }
    },
    getEmployeeLists(queryString) {
      employeeSelectlist({ name: queryString, roleCodes: 'pricing' }).then(
        (res) => {
          this.managerList = res.data
        }
      )
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
      console.log(action,arr)
      let fn = this['handle' + action]
      // Add、Export、CustomColumns、ChangeLockState、Muti、SizeChange、CurrentChange、SingleEdit
      // MultiEdit、 MultiPublish、MultiInvalid、MultiDelete
      if (typeof fn !== 'function') return
      this['handle' + action](arr)
    },
    handleSizeChange(val) {
      console.log(val)
      this.option1.pagination.pageSize = val
      this.getList()
    },

    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getList()
    },
  
    //清空数据
    dialogClose(){
      this.$refs['createItemForm'].resetFields()
      Object.assign(this.createItem, {
        id:'',
        sysLineGroupCname:"",
        sysLineGroupEname:"",
      })
    },
     //清空数据
    relativeDialogClose(){
      this.$refs['relativeCreateItemForm'].resetFields()
      Object.assign(this.relativeCreateItem, {
        sysLineGroupCode:"",
        lineCodes:[],
      })
    },
    //新增菜单
    handleAdd(){
        this.open = true
        this.title = "新增大航线"
    },
    //菜单编辑
    handleEdit(row){
      this.title = "查看航线"
      for(var p in this.createItem){
         this.createItem[p]=row[p]
      }      
      this.open = true
    },
    //删除列表
    handleDelete(row){
      this.$confirm('是否确认将航线名称为"' + row.sysLineGroupCname + '"的数据设为失效?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: "true",
        type: "warning"
      }).then(function() {
         return lineGroupDelete({id: row.id});
      }).then(() => {
        this.handleSearch();
        this.$message({message: '成功', type: 'success'});
      }).catch(function() {});
    },
    //关联系统航线
    handleRelativeSystemLine(row){
      this.title = "关联系统航线"
      for(var p in this.relativeCreateItem){
         this.relativeCreateItem[p]=row[p]
      }  
      this.loadBasicData();
      this.relativeSystemLineOpen = true
    },
    loadBasicData(){
      baseSystemLineList("","valid").then(res=>{
          this.systemLineOptions= res.data
      })
      groupRelativedLineInfo({sysLineGroupCode:this.relativeCreateItem.sysLineGroupCode}).then(res=>{
          this.relativeCreateItem.lineCodes = res.data.lineCodes
      })
    },
    // getList() {
    //   this.loading = true;
    //   this.initQueryForm()
    //   shippingLineGroupList(this.tableQuery).then(res=>{
    //     let {totalCount} = res.data
    //     this.tableConfig.pagination.total = totalCount;
    //     this.shippingLineGroupList = res.data.list
    //     this.loading = false
    //   })
    // },
    getList(isSearch) {
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
      }
      this.searchOption1.addFilter.searchInputGroup.forEach(item => {
        let { key, value, columnReq } = item
        if (columnReq && item[columnReq]) {
          data.query.push({
            column: columnReq,
            type: 'eq',
            value: item[columnReq]
          })
        } else if (value && value !== '') {
          if (key === 'createdDate') {
            data.query.push({
              column: 'beginDate',
              type: 'eq',
              value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00',
            })
            data.query.push({
              column: 'endDate',
              type: 'eq',
              value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59',
            })
          } else {
            data.query.push({
              column: key,
              type: 'eq',
              value: value
            })
          }
        }
      })
      if(isSearch){
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      this.loading = true
      shippingLineGroupList(data).then((res) => {
        if (res.code === 0) {
          let { list } = res.data
          let data = []
          list.forEach((item) => {
            data.push(item)
          })
          this.option1.data = data
          this.table1DataBackup = [...this.option1.data]
          this.option1.pagination.currPage = res.data.currPage
          this.option1.pagination.pageSize = res.data.pageSize
          this.option1.pagination.totalCount = res.data.totalCount

          let {totalCount} = res.data
          this.tableConfig.pagination.total = totalCount;
          this.shippingLineGroupList = res.data.list
          this.loading = false
        }
      }).finally(() => {
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
              lineGroupSave(this.createItem).then(res=>{
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
    relativeCancel() {
      this.relativeSystemLineOpen = false;
    },
    //保存按钮操作
    relativeSubmitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
              lineGroupRelativedLine(this.relativeCreateItem).then(res=>{
                this.$message({message: '恭喜你，保存成功', type: 'success'});
                this.relativeSystemLineOpen = false
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
  margin:0 14px 14px 14px;
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