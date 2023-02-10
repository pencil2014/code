<template>
<div class="menu">
   <div class="components-container">
    <div class="filter-containe search-layout">
      <div class="filter">
        <div class="search-containe">
          <div>
            <span class="filter-txt">
             员工:
            </span>
             <el-select filterable remote
                 size="mini"   v-model="queryForm.employeeId" placeholder="请选择员工"  :remote-method="getEmployeeList"
               >
               <el-option v-for="(o, key) in employeeOptions "
                :key="key"
                :label="o.cname+'  ('+o.employeeNo+')'"
                :value="o.employeeId">
              </el-option>
            </el-select>
            <span class="filter-txt">
              权限类型:
            </span>
            <el-select  clearable  size="mini"  v-model="queryForm.privilegeCode"  >
               <el-option v-for="item in dictMap.empGlobalPrivilegeType" :label="item.label" :value="item.value" :key="item.value"></el-option>
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
        <el-button size="small"  @click="handleAdd()" type="primary">
          <i class="el-icon-plus"></i> 新增全局权限
        </el-button>
      </div>
    </div>
    <el-table v-loading="loading" :data="empGlobalPrivilegeList"  style="margin:16px 0px">
        <el-table-column align="center"  prop="cname" label="员工姓名" ></el-table-column>
        <el-table-column align="center"  prop="employeeNo" label="员工工号" ></el-table-column>
        <el-table-column align="center"  prop="titleCode" label="权限类型" >
           <template slot-scope="scope">
              {{getDictLabel('empGlobalPrivilegeType',scope.row.privilegeCode)}}
          </template>
        </el-table-column>
        <el-table-column align="center"  prop="privilegeValue" label="权限值" >
        </el-table-column>
        <el-table-column align="center"  prop="privilegeValueDesc" label="权限值描述" ></el-table-column>   
        <el-table-column align="center" prop="row" label="操作" width="300">
            <template slot-scope="scope">
              <el-button @click="handleEdit(scope.row)" type="text" size="small">查看</el-button>
               <el-button @click="handleDelete(scope.row)" type="text" size="small">删除</el-button>
            </template>
         </el-table-column>
    </el-table>
       <!-- 分页 -->
     <Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack"/>
  </div>
  <el-dialog :title="title" :visible.sync="open" :lock-scroll="true" width="600px"  @close="dialogClose" @open="dialogOpen">
     <el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":"  >
         <el-form-item label="员工"  label-width="100px" prop="employeeId">
                <el-select filterable remote clearable
                  style="width:80%"
                 size="mini"  v-model="createItem.employeeId" placeholder="请选择员工"
                   :remote-method="getEmployeeList"
                  @visible-change="val => getEmployeeList()"
                 >
               <el-option v-for="(o, key) in employeeOptions "
                :key="key"
                :label="o.cname+'  ('+o.employeeNo+')'"
                :value="o.employeeId">
              </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="权限类型" label-width="100px" prop="privilegeCode">
          <el-select  style="width:80%"    size="mini"  v-model="createItem.privilegeCode"  @change="privilegeCodeChange">
              <el-option v-for="item in dictMap.empGlobalPrivilegeType" :label="item.label" :value="item.value" :key="item.value"></el-option>
           </el-select>
        </el-form-item>
        <el-form-item label="权限值" label-width="100px" prop="privilegeValueList">
            <el-select filterable remote  v-show="createItem.privilegeCode==='system_line'"  multiple
                  style="width:80%" clearable
                 size="mini"  v-model="createItem.privilegeValueList" placeholder="请选择"
                 >
               <el-option v-for="(o, key) in sysLineOptions "
                :key="key"
                :label="o.cname"
                :value="o.sysLineCode">
              </el-option>
            </el-select>
             <el-select v-show="createItem.privilegeCode==='shiping_carrier'"  filterable remote multiple
                  style="width:80%" clearable
                 size="mini"   v-model="createItem.privilegeValueList" placeholder="请选择"
                   :remote-method="getShippingCarrier"
                   @visible-change="getShippingCarrierVisiable"
                   @change="val=>{shippingCarrierChange && shippingCarrierChange(val)}"
                 >
               <el-option v-for="item in shipingCarrierOptions " 
                :key="item.carrierId"
                :label="item.carrierCode"
                :value="item.carrierCode">
              </el-option>
            </el-select>
             <el-select v-show="createItem.privilegeCode==='settle_company'"  
                   reserve-keyword filterable  remote clearable multiple
                   style="width:80%" size="mini" 
                   v-model="createItem.privilegeValueList" placeholder="请选择"
                    @visible-change="val => getSettleCompanyVisiable"
                    :remote-method="getSettleCompany"
                 >
               <el-option v-for="o in settleCompanyOptions " 
                :key="o.key"
                :label="o.value"
                :value="o.key">
              </el-option>
            </el-select>
            <el-select filterable remote  v-show="createItem.privilegeCode==='fin_permission'"  multiple
                   style="width:80%" clearable
                   size="mini"   v-model="createItem.privilegeValueList" placeholder="请选择"
                 >
               <el-option v-for="item in dictMap.globalFinPermission" :label="item.label" :value="item.value" :key="item.value"></el-option>
            </el-select>
        </el-form-item>
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
import {querySettleUnitByCode} from '@/api/fin/settleUnit'
import {baseSystemLineList,baseShippingCarrierList} from '@/api/base'
import {empGlobalPrivilegeList,empGlobalPrivilegeSave,empGlobalPrivilegeDelete} from '@/api/permission'
import {employeeSelectlist} from '@/api/companyResource'
import { getDictLabel } from '@/utils/tools'
import { mapGetters } from 'vuex'
import Pagination from '@/components/Base/Table/pagination'

export default {
  
  name:"employeeTitle",
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
        employeeId:'',
        privilegeCode:'',
      
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
      sysLineOptions:[],
      shipingCarrierOptions:[],
      settleCompanyOptions:[],
      employeeOptions:[],
      empGlobalPrivilegeList: [],
      sysGenCodeChecked:true,
      createItem:{
        oid:"",
        employeeId:"",
        cname:"",
        privilegeCode:'shiping_carrier',
        privilegeValue:'',
        privilegeValueList:[]
      },
      loading:false,
      //附加费模板
      rules: {
        employeeId: [
            { required: true, message: '员工不能为空', trigger: 'blur' },
          ],
        privilegeCode: [
          { required: true, message: '权限类型不能为空', trigger: 'blur' },
        ],
        privilegeValueList: [
          { required: true, message: '权限值不能为空', trigger: 'blur' },
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
    getEmployeeList(queryString){
      employeeSelectlist({'name':queryString}).then(res=>{
        this.employeeOptions = res.data
      })
    },
    getSysLine(queryString){
      baseSystemLineList(queryString,'valid').then(res=>{
        this.sysLineOptions = res.data
      })
    },
    getShippingCarrier(queryString){
      baseShippingCarrierList(queryString,'valid').then(res=>{
        this.shipingCarrierOptions = res.data
      })
    },
    getShippingCarrierVisiable(val){
      console.log(val);
	    if (val) this.getShippingCarrier('')
    },
    getSettleCompany(queryString){
       let payload={}
       payload.queryString=queryString
       payload.unitTypes="company"
       this.$store.dispatch('dict/querySettleUnit', payload).then((data) => {
          this.settleCompanyOptions=data;
      })
    },
    getSettleCompanyVisiable(val){
       if (val) this.getSettleCompany('')
    },
   getSettleCompanyByCode(code){
     this.settleCompanyOptions=[]
      querySettleUnitByCode({"unitCode":code}).then(res=>{
        let options={key:res.data.unitCode,value:res.data.unitName}
        this.settleCompanyOptions.push(options)
      })
      
    },
     //搜索按钮
    handleSearch(){
      this.tableQuery.currPage = 1;
      this.getList(true);
    },
    privilegeCodeChange(val){
      if(val==='shiping_carrier'){
         this.getShippingCarrier() 
      }else if(val==='system_line'){
         this.getSysLine()
      }else if(val==='settle_company'){
         this.getSettleCompany();
      }
      this.createItem.privilegeValueList=[]
    },
      //搜索取消按钮
    handleReset(){
      this.queryForm.employeeId = undefined
      this.queryForm.privilegeCode = undefined
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
      // this.$refs['createItemForm'].resetFields()
      // Object.assign(this.createItem, {
      //   oid:"",
      //   employeeId:"",
      //   privilegeCode:'shiping_carrier',
      //   privilegeValue:'',
      //   privilegeValueList:[],
      //   cname:""
      // })
      // this.sysLineOptions=[];
      // this.shipingCarrierOptions=[];
      // this.getEmployeeList()
    },
    dialogOpen(){
    },
    //新增菜单
    handleAdd(){
      // this.$refs['createItemForm'].resetFields()
      Object.assign(this.createItem, {
        oid:"",
        employeeId:"",
        privilegeCode:'shiping_carrier',
        privilegeValue:'',
        privilegeValueList:[],
        cname:""
      })
      this.sysLineOptions=[];
      this.shipingCarrierOptions=[];
      this.getEmployeeList()

        this.open = true
        this.title = "新增全局权限"
        this.getShippingCarrier()
    },
    //菜单编辑
    handleEdit(row){
      this.title = "查看全局权限"
      for(var p in this.createItem){
         this.createItem[p]=row[p]
      }
      this.createItem.privilegeValueList=[]
      this.createItem.privilegeValueList.push(row.privilegeValue)
      this.sysLineOptions.push({cname:row.systemLineCname,sysLineCode:row.privilegeValue})     
      this.shipingCarrierOptions.push({carrierCode:row.privilegeValue})
      if(this.createItem.privilegeCode==='settle_company'){
          this.getSettleCompanyByCode(row.privilegeValue)
      }else if(this.createItem.privilegeCode==='system_line'){
          this.getSysLine()
      }
      this.getEmployeeList(this.createItem.cname)
      this.open = true
    },
    //删除列表
    handleDelete(row){
      this.$confirm('是否确认删除该条数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: "true",
        type: "warning"
      }).then(function() {
         return empGlobalPrivilegeDelete({oid: row.oid});
      }).then(() => {
        this.getList();
        this.$message({message: '删除成功', type: 'success'});
      }).catch(function() {});
    },
    getList(isSearch) {
      this.loading = true;
      this.initQueryForm(isSearch)
      empGlobalPrivilegeList(this.tableQuery).then(res=>{
        let {totalCount} = res.data
        this.tableConfig.pagination.total = totalCount;
        this.empGlobalPrivilegeList = res.data.list
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
    getDictLabel(propDict,value){
      return  getDictLabel(propDict,value)
    },
    //保存按钮操作
    submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
              empGlobalPrivilegeSave(this.createItem).then(res=>{
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