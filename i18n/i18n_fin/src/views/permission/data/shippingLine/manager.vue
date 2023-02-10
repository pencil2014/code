<template>
<div class="menu">
   <div class="components-container">
    <div class="filter-containe search-layout">
      <div class="filter">
        <div class="search-containe">
          <div>
            <span class="filter-txt">
              起运港:
            </span>
              <el-select size="mini"
                v-model="queryForm.polCode"
                filterable
                remote
                clearable 
                placeholder="请选择起运港"
                :remote-method="polPortFilterMehod"
                @visible-change="polPortVisibleChange"
                @change="handleChangePolPortCode">
                <el-option
                  v-for="item in portList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            <span class="filter-txt">
              船司:
            </span>
              <el-select size="mini"
                  v-model="queryForm.shipCarrierCode"
                  filterable
                  remote
                  clearable 
                  placeholder="请输入"
                >
                  <el-option
                    v-for="item in shipCarrierOptions"
                    :key="item.key"
                    :label="item.value"
                    :value="item.key">
                  </el-option>
                </el-select>
            <span class="filter-txt">
               航线
            </span>
            <el-select size="mini"
                  v-model="queryForm.sysLineCode"
                  filterable
                  remote
                  clearable 
                  placeholder="请输入"
                >
                  <el-option
                    v-for="item in sysLineOptions"
                    :key="item.key"
                    :label="item.value"
                    :value="item.key">
                  </el-option>
                </el-select>
             <span class="filter-txt">
              维护人
            </span>
              <el-select size="mini" v-model="queryForm.employeeId" 
                clearable 
                placeholder="请选择" 
                remote
                filterable :remote-method="maintainerQuerySearch"
              >
                <el-option v-for="(item, index) in queryEmployeeOptions"
                  :key="index"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
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
        <el-button size="mini"  @click="handleAdd()" type="primary">
          <i class="el-icon-plus"></i> 新增航线维护人
        </el-button>
      </div>
    </div>
    <el-table v-loading="loading" :data="lineManagerList"  style="margin:16px 0px">
        <el-table-column align="center"  prop="polCname" label="起运港" ></el-table-column>
        <el-table-column align="center"  prop="shipCarrierCode" label="船司" ></el-table-column>
        <el-table-column align="center"  prop="sysLineCname" label="航线" ></el-table-column>
        <el-table-column align="center"  prop="employeeName" label="员工" ></el-table-column>
        <el-table-column align="center" prop="row" label="操作" width="100">
            <template slot-scope="scope">
              <el-button @click="handleEdit(scope.row)" type="text" size="small">查看</el-button>
            </template>
         </el-table-column>
    </el-table>
       <!-- 分页 -->
      <Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack"/>
  </div>
  <el-dialog :title="title" :visible.sync="open" :lock-scroll="true" width="600px"  @close="dialogClose" @open="dialogOpen">
     <el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":" label-width="90px"  >
         <el-form-item  required label="起运港" prop="polCode" >
            <el-select size="mini"
              v-model="createItem.polCode"
              filterable
              remote
              clearable 
              style="width: 80%"
              placeholder="请输入"
               :disabled="createItem.id!=''"
              :remote-method="polPortFilterMehod"
              @visible-change="polPortVisibleChange"
              @change="handleChangePolPortCode">
              <el-option
                v-for="item in portList"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item  required label="船公司" prop="shipCarrierCode" >
             <el-select size="mini"
                v-model="createItem.shipCarrierCode"
                 :disabled="createItem.id!=''"
                filterable
                remote
                clearable 
                style="width: 80%"
                placeholder="请输入"
               >
                <el-option
                  v-for="item in shipCarrierOptions"
                  :key="item.key"
                  :label="item.value"
                  :value="item.key">
                </el-option>
              </el-select>
          </el-form-item>
          <el-form-item  required label="航线" prop="sysLineCode" >
            <el-select size="mini"
                v-model="createItem.sysLineCode"
                filterable
                :disabled="createItem.id!=''"
                remote
                clearable 
                style="width: 80%"
                placeholder="请输入"
               >
                <el-option
                  v-for="item in sysLineOptions"
                  :key="item.key"
                  :label="item.value"
                  :value="item.key">
                </el-option>
              </el-select>
          </el-form-item>
           <el-form-item  required label="维护人" prop="employeeId" >
               <el-select size="mini" v-model="createItem.employeeId" 
                 style="width: 80%"
                 clearable 
                 placeholder="请选择" 
                 remote
                 @change="maintainerChange"
                 filterable :remote-method="maintainerSelectSearch"
                >
                  <el-option v-for="(item, index) in employeeOptions"
                    :key="index"
                    :label="item.label"
                    :value="item.value">
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
import {lineManagerList,lineManagerSave,lineManagerDelete} from '@/api/permission'
import {portSystemLineInfo} from '@/api/base'
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
        polCode:"",
        polName:"",
        shipCarrierCode:"",
        sysLineCode:"",
        employeeId:"",
        employeeName:"",
        sysLineCname:"",
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
      portList: [],
      lineManagerList: [],
      shipCarrierOptions:[], 
      employeeOptions:[],
      queryEmployeeOptions:[],
      sysLineOptions:[],
      sysGenCodeChecked:true,
      createItem:{
        id:'',
        polCode:"",
        polName:"",
        shipCarrierCode:"",
        sysLineCode:"",
        employeeId:"",
        employeeName:"",
        sysLineCname:"",
      },
      loading:false,
      //附加费模板
      rules: {
        polCode: [
            { required: true, message: '起运港不能为空', trigger: 'blur' },
          ],
        shipCarrierCode: [
        { required: true, message: '船司不能为空', trigger: 'blur' },
        ],
        sysLineCode: [
        { required: true, message: '航线不能为空', trigger: 'blur' },
        ],
        employeeId: [
        { required: true, message: '维护人不能为空', trigger: 'blur' },
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
    this.loadBasicData()
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
      this.getList();
    },
   
      //搜索取消按钮
    handleReset(){
      this.queryForm.polCode = undefined
      this.queryForm.polName = undefined
      this.queryForm.shipCarrierCode = undefined
      this.queryForm.sysLineCode = undefined
      this.queryForm.employeeId = undefined
      this.queryForm.employeeName = undefined
      this.queryForm.sysLineCname = undefined
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
     // 船公司下拉列表自动补充的数据
    shipQuerySearch(queryString, cb) {
    
    },
    loadBasicData(){
      //船司下拉数据
      this.$store.dispatch('dict/baseShippingCarrierList', {state: 'valid'}).then(data => {
        this.shipCarrierOptions=data
      })
      //航线下拉数据
      this.$store.dispatch('dict/baseSystemLineList', {state: 'valid'}).then(data => {
         this.sysLineOptions=data
      })
      this.maintainerQuerySearch();
          
    },
    maintainerChange(value){
       let itemData = this.employeeOptions.filter(ele =>ele.value === value)
       this.createItem.employeeName=itemData[0].label
    },
    // 维护人
    maintainerSelectSearch(queryString, item) {
      let params={};
      Object.assign(params, {
        name: queryString,
        state:'valid'
      })
      this.$store.dispatch('dict/employeeSelectlist', params).then(data => {
       this.employeeOptions= data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
           //如果是编辑
        let employeeFalg=true;
          this.employeeOptions.map(item=>{
              if(item.value===this.createItem.employeeId){
                employeeFalg=false;
              }
          })
          if(employeeFalg){
              this.employeeOptions.unshift({
                  label:this.createItem.employeeName,
                  value:this.createItem.employeeId 
              })
          }
      })
   
    },
  // 维护人
    maintainerQuerySearch(queryString, item) {
      let params={};
      Object.assign(params, {
        name: queryString,
        state:'valid'
      })
      this.$store.dispatch('dict/employeeSelectlist', params).then(data => {
       this.queryEmployeeOptions= data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
      })
   
    },
    handleChangeEmployee(val) {
     if (val) {
         this.createItem.employeeId = val
      } else {
         this.createItem.employeeId = ''
         this.createItem.employeeName=''
      }
    },
    handleSelectEmployee(item) {
      Object.assign(this.createItem, {
        employeeId: item.key
      })
    },
    handleQueryChangeEmployee(event,val) {
     if (val) {
         this.queryForm.employeeId = val
      } else {
         this.queryForm.employeeId = ''
      }
    },
    handleQuerySelectEmployee(item) {
      Object.assign(this.queryForm, {
        employeeId: item.key
      })
    },
    dialogOpen(){
      //  this.maintainerSelectSearch()
       
    },
    //清空数据
    dialogClose(){
     this.$refs['createItemForm'].resetFields()
       Object.assign(this.createItem, {
          id:'',
          polCode:"",
          polCname:"",
          shipCarrierCode:"",
          sysLineCode:"",
          employeeId:"",
          employeeName:"",
          sysLineCname:"",
        })
    },
    polPortFilterMehod(val) {
      this.transitPortSearch(val, 'port_of_basic', this.state)
    },
      //起运港
    polPortVisibleChange(val) {
      if (val) this.transitPortSearch('', 'port_of_basic', this.state)
    },
    handleChangePolPortCode(val) {
    },
    // 港口下拉数据
    transitPortSearch(queryString, portAttribute, state) {
      this.$store.dispatch('dict/basePortList', {queryString, portAttribute, state}).then(data => {
        let result = data.map(ele => {
          return Object.assign(ele, {
            label: ele.value,
            value: ele.key
          })
        })
        this.portList = result
      })
    },
    //新增菜单
    handleAdd(){
        this.open = true
        this.title = "新增航线维护人"
    },
        //菜单编辑
    handleEdit(row){
      this.title = "查看航线维护人"
      for(var p in this.createItem){
         this.createItem[p]=row[p]
      }
      //初始化航线编码 和维护人信息
      this.initData()
      this.open = true
    },
    initData(){
    
       this.portList=[];
       let portCodes=this.createItem.polCode
       this.$store.dispatch('dict/basePortListByCodes', {portCodes}).then(data => {
         data.map(item=>{
           this.portList.push({
            label:item.label,
            value:item.value
           })
         })
       })
      this.maintainerSelectSearch()
      
    },
    getList() {
      this.loading = true;
      this.initQueryForm()
      lineManagerList(this.tableQuery).then(res=>{
        let {totalCount} = res.data
        this.tableConfig.pagination.total = totalCount;
        this.lineManagerList = res.data.list
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
              lineManagerSave(this.createItem).then(res=>{
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