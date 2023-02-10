<template>
<div class="menu">
   <!-- <div class="components-container">
    <div class="filter-containe search-layout">
      <div class="filter">
        <div class="search-containe">
          <div>
            <span class="filter-txt">
              币种名称:
            </span>
            <el-input clearable class="input-width" size="mini" v-model="queryForm.name" placeholder="代码/中文模糊查询"></el-input>
            <span class="filter-txt">
             是否启用:
            </span>
             <el-select size="mini" v-model="queryForm.state">
                <el-option v-for="(o, key) in dictMap['state']"
                  :key="key"
                  :label="$t(`dict.state.${o.value}`)"
                  :value="o.value">
                </el-option>
            </el-select>  
          </div>
        </div>
      </div>
        <el-button style="margin-left:16px" size="mini" @click="handleSearch" type="primary">
          搜索
        </el-button>
        <el-button size="mini" @click="handleReset" plain>
           重置 
        </el-button>
    </div>
  </div> -->
  <FinanceSearch :searchOption="searchOption1" @search="search" />
  <div class="finance-search-list-gap"></div>
  <!-- <div class="components-container m-t-8">
    <div class="filter-containe search-layout">
      <div class="filter">
        <el-button size="mini" @click="handleAdd()" type="primary">
          新增币种
        </el-button>
      </div>
    </div>
    <el-table v-loading="loading" :data="currencyList" style="margin:16px 0px">
        <el-table-column align="center" prop="code" label="币种代码" ></el-table-column>
        <el-table-column align="center" prop="cnName" label="币种名称" ></el-table-column>
        <el-table-column align="center" prop="standardStatus" label="是否本位币" >
            <template slot-scope="scope">
                 {{scope.row.standardStatus==='yes'?'是':'否'}}
            </template>
        </el-table-column>
          <el-table-column align="center" prop="state" label="是否启用" >
            <template slot-scope="scope">
                 {{scope.row.state==='valid'?'是':'否'}}
            </template>
        </el-table-column>
         <el-table-column align="center"  prop="finCode" label="财务代码" ></el-table-column>
        <el-table-column align="center" prop="row" label="操作" width="300">
            <template slot-scope="scope">
              <el-button @click="handleEdit(scope.row)" type="text" size="mini">查看</el-button>
            </template>
         </el-table-column>
    </el-table>
     <Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack"/>
  </div> -->
  <div class="finance-list-container">
    <div class="money-box">
      <div class="money-box-left">
        <el-button-group>
          <el-button size="mini" @click="handleAdd()" type="primary">新增币种</el-button>
        </el-button-group>
      </div>
      <div class="money-box-right">
        <el-button
          class="finance-btn"
          @click="refreshListPage"
          size="mini"
          type="primary"
        >刷新</el-button>
      </div>
    </div>
    <FinanceTable ref="tablex01" :option="option1" @send-multi="sendMulti" />
  </div>
  <el-dialog :title="title" :visible.sync="open" :lock-scroll="true" width="600px"  @close="dialogClose" >
     <el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":"  >
         <el-form-item label="币种代码" label-width="100px" prop="code">
            <el-input :disabled="action==='edit'" style="width:80%" size="mini" v-model="createItem.code" ></el-input>
        </el-form-item>
        <el-form-item label="币种名称" label-width="100px" prop="cnName">
          <el-input style="width:80%" size="mini" v-model="createItem.cnName" ></el-input>
        </el-form-item>
         <el-form-item label="是否本位币" label-width="100px" prop="standardStatus">
           <el-select  style="width:80%" size="mini"  v-model="createItem.standardStatus"  >
             <el-option v-for="(o, key) in dictMap['yesNo'] "
                :key="key"
                :label="$t(`dict.yesNo.${o.value}`)"
                :value="o.value">
              </el-option>
            </el-select>  
        </el-form-item>   
        <el-form-item label="是否有效" label-width="100px" prop="state">
           <el-select  style="width:80%" size="mini"  v-model="createItem.state"  >
             <el-option v-for="(o, key) in dictMap['state'] "
                :key="key"
                :label="$t(`dict.state.${o.value}`)"
                :value="o.value">
              </el-option>
            </el-select>  
        </el-form-item>
        <el-form-item label="财务代码" label-width="100px" prop="finCode">
          <el-input style="width:80%" size="mini" v-model="createItem.finCode" ></el-input>
        </el-form-item>
      </el-form>          
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="submitForm('createItemForm')"> 
          <!-- <i class="el-icon-copy-document"></i>  -->
          保存
        </el-button>
        <el-button size="mini" @click="cancel">取 消</el-button>
      </div>
  </el-dialog>
</div>
</template>
<script>
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import {currencyList,currencySave,currencyDelete} from '@/api/baseData'
import { mapGetters } from 'vuex'
import { dateFormat } from '@/views/finance/utils/finance'
// import Pagination from '@/components/Base/Table/pagination'
export default {
  name: "currencyList",
  mixins: [mixin],
  data() {
    return {
      pageSizeUrl: currencyList('geturl'),
      //弹框标题
      title:"",
      //弹框开关
      open:false,
      action:'',
        // 查询条件
      tableQuery: {
       columns: [],
       query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
       currPage:1,
       pageSize:10
      },
      queryForm:{
        name:'',
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
      roleOptions:[],
      currencyList: [],
      sysGenCodeChecked:true,
      createItem:{
       currencyId:'',
       code:'',
       cnName:'',
       finCode:'',
       standardStatus:'no',
       state:"valid"
      },
      loading:false,
      //附加费模板
      rules: {
        code: [
          { required: true, message: '币种代码不能为空', trigger: 'blur' },
        ],
        cnCname: [
            { required: true, message: '中文名称不能为空', trigger: 'blur' },
          ],
       standardStatus: [
            { required: true, message: '是否本位币不能为空', trigger: 'blur' },
          ]
      },
      option1: {},
      searchOption1: {},
      multipleSelection1: []
    }
  },
   // table基础组件
  components:{
    // Pagination,
    FinanceSearch,
    FinanceTable
  },
  created() {
    this.searchOption1 = {
      saveDefault: true,
      // saveShow: true,
      saveName: 'exchangeRateCurrency',
      addFilter: {
        defaultSearchLength: 9,
        searchInputGroup: [
          { key: 'code', value: '', showType: '1' },
          { key: 'name', value: '', showType: '1' },
          { key: 'standardStatus', value: '', showType: '3' },
          { key: 'state', value: '', showType: '2' },
          { key: 'finCode', value: '', showType: '5' },
        ],
        filterGroups: {
          code: { label: '币种代码', type: 'select', prop: 'currency', showType: '1' },
          name: { label: '币种名称', type: 'input', showType: '1' },
          standardStatus: { label: '是否本位币', type: 'select', showType: '5',
            selectOptions: [
              { label: '是', value: 'yes' },
              { label: '否', value: 'no' }
            ]
          },
          state: { label: '是否有效', type: 'select', showType: '5',
            selectOptions: [
              { label: '是', value: 'valid' },
              { label: '否', value: 'invalid' }
            ]
          },
          finCode: { label: '财务代码', type: 'input', showType: '3' },
          createdBy: {
            label: '创建人',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          createdTime: { label: '创建时间', type: 'daterange', showType: '2' },
          updatedBy: {
            label: '更新人',
            type: 'remoteSelect',
            clearable: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          // updatedTime: { label: '更新时间', type: 'daterange', showType: '2' },
        }
      }
    }
    let operationBtns = Object.assign(this.option.operationBtns, {
      data: [
        {
          label: '修改',
          type: 'text',
          show: true,
          action: 'Edit',
        },
      ],
      show: true
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true,
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'exchangeRateCurrency',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      operationBtns,
      pagination,
    })
    this.selfColumnsBase = [
      {
        prop: 'code',
        label: '币种代码',
        type: 'text',
      },
      {
        prop: 'cnName',
        label: '币种名称',
        type: 'text',
      },
      {
        prop: 'standardStatus',
        label: '是否本位币',
        type: 'text',
        formatter: ({cellValue}) => {
          if (cellValue === 'yes') {
            return '是'
          } else if (cellValue === 'no') {
            return '否'
          }
        }
      },
      {
        prop: 'state',
        label: '是否有效',
        type: 'text',
        formatter: ({cellValue}) => {
          if (cellValue === 'valid') {
            return '是'
          } else if (cellValue === 'invalid') {
            return '否'
          }
        }
      },
      {
        prop: 'finCode',
        label: '财务代码',
        type: 'text',
      },
      {
        prop: 'createdName',
        label: '创建人',
        type: 'text',
      },
      {
        prop: 'createdTime',
        label: '创建时间',
        type: 'text',
      },
      {
        prop: 'updatedName',
        label: '更新人',
        type: 'text',
      },
      {
        prop: 'updatedTime',
        label: '更新时间',
        type: 'text',
      },
    ]
    this.option1.columns = [
      ...this.selfColumnsBase
    ]
  },
  mounted() {
    // this.getList()
  },
  computed: {
    ...mapGetters([
      'userId','dictMap'
    ])
  },
    
  methods: {
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    getData(isSearch) {
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
        columns: this.customColumnsKeys
      }
      this.searchOption1.addFilter.searchInputGroup.forEach(item => {
        let { key, value, columnReq } = item
        if (columnReq && item[columnReq]) {
          data.query.push({
            column: columnReq,
            type: 'eq',
            value: item[columnReq]
          })
        } else if (value) {
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
          } else if (key === 'createdTime') {
            data.query.push({
              column: 'createdTimeStart',
              type: 'eq',
              value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00',
            })
            data.query.push({
              column: 'createdTimeEnd',
              type: 'eq',
              value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59',
            })
          } else if (key === 'bdDeptCode' || key === 'opDeptCode') {
            data.query.push({
              column: key,
              type: 'eq',
              value: value[value.length - 1],
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
      currencyList(data).then(res=>{
        // let { totalCount } = res.data
        // this.option1.pagination.total = totalCount;
        this.option1.data = res.data.list
        Object.assign(this.option1.pagination, res.data)
      }).finally(() => {
        this.loading = false
      })
    },
    sendMulti(data, option) {
      if (option === this.option1) this.multipleSelection1 = data
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    loadBasicData(){
      sysUserRoleInfo({employeeId:this.createItem.employeeId}).then(res=>{
          this.createItem.sysRoleIdList = res.data.sysRoleIdList
      })
    },
     //搜索按钮
    handleSearch(){
      this.tableQuery.currPage = 1;
      this.getList(true);
    },
      //搜索取消按钮
    handleReset(){
      this.queryForm.name = undefined
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
    // handleSizeChange() {
    //   this.getList()
    // },
    // handleCurrentChange() {
    //   this.getList()
    // },
    //清空数据
    dialogClose(){
      this.$refs['createItemForm'].resetFields()
      Object.assign(this.createItem, {
         currencyId:'',
         code:'',
         cnName:'',
         finCode:'',
         standardStatus:'no',
         state:"valid"
      })
    },
    
    //新增菜单
    handleAdd(){
        this.open = true
        this.title = "新增币种"
        this.action='add'
    },
    //菜单编辑
    handleEdit(row){
      this.action='edit'
      this.title = "修改币种"
      if(row){
      for(var p in this.createItem){
        if(p==='standardStatus'){
            if(row[p]){
               this.createItem[p]=row[p]
            }
        }else{
           this.createItem[p]=row[p]
        }
      }      
      this.open = true
      }
    },
    //删除列表
    handleDelete(row){
      this.$confirm('是否确认删除币种名称为"' + row.cnName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: "true",
        type: "warning"
      }).then(function() {
         return currencyDelete({currencyId: row.currencyId});
      }).then(() => {
        this.getList();
        this.$message({message: '删除成功', type: 'success'});
      }).catch(function() {});
    },
    getList(isSearch) {
      this.loading = true;
      this.initQueryForm(isSearch)
      currencyList(this.tableQuery).then(res=>{
        let {totalCount} = res.data
        this.tableConfig.pagination.total = totalCount;
        this.currencyList = res.data.list
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
              currencySave(this.createItem).then(res=>{
                this.$message({message: '恭喜你，保存成功', type: 'success'});
                this.open = false
                // this.handleSearch()
                this.getData()
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

  .search-layout .operation-btns-box{
    margin-left: 0;
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