<template>
<div class="menu">
  <div class="components-container  m-t-8">
    <div class="filter-containe search-layout">
      <div class="filter">
        <el-button size="mini"  @click="handleAdd('')" type="primary">
          <i class="el-icon-plus"></i> 新增菜单
        </el-button>
        <el-button size="mini"  @click="exportRecentData" type="primary">导出</el-button>
        <el-button size="mini"  @click="importRecentData" type="primary">导入</el-button>
        <!-- 添加页码缓存，需要刷新的话，激活刷新按钮 -->
        <!-- <el-button size="mini"  @click="getList()">刷新</el-button> -->
        <!-- 用代码生成按钮 -->
        <!-- <el-button size="mini"  @click="localAdd" type="warning">代码生成</el-button> -->
      </div>
    </div>
    <el-table v-loading="loading"
      :data="resourceTreeList"
       style="margin:16px 0px"
       row-key="rowKey"
       :load="loadSubMenu"
      :tree-props="{children: 'subResourceList', hasChildren: 'hasChildren'}"
    >
        <el-table-column header-align="center" align="left" prop="resourceName" min-width="180px" label="名称" ></el-table-column>
        <el-table-column align="center" prop="resourceCode"  label="编码" ></el-table-column>
        <el-table-column align="center" prop="level" label="菜单层级" width="80px" ></el-table-column>
         <el-table-column align="center" prop="resourceType" label="类型" width="80px" >
            <template slot-scope="scope">
              {{ $t(`dict.resourceType.${scope.row.resourceType}`)}}
            </template>
         </el-table-column>
        <el-table-column align="center" prop="sort" label="显示顺序" width="70px" ></el-table-column>
        <el-table-column align="center" prop="resourceUrl" label="链接地址" min-width="100px" ></el-table-column>
        <el-table-column align="center" prop="row" label="操作" width="220">
            <template slot-scope="scope">
              <el-button style="padding:0 2px" @click="handleEdit(scope.row)" type="text" size="mini"  >查看</el-button>
              <el-button style="padding:0 2px;margin-left:2px;" @click="handleAdd(scope.row)" type="text" size="mini">新增子模块</el-button>
              <el-button style="padding:0 2px;margin-left:2px;" @click="roleSaveShow(scope.row)" type="text" size="mini"  >分配角色</el-button>
              <el-button style="padding:0 2px;margin-left:2px;" @click="handleDelete(scope.row)" size="mini" type="text" class="red">删除</el-button>
            </template>
         </el-table-column>
    </el-table>
  </div>
  <el-dialog :title="title" :visible.sync="open" :lock-scroll="true" width="800px"  @close="dialogClose">
     <el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":"  size="mini">
       <div class="parentWrap" v-if="createItem.parentCurrentId">
        <el-row  :gutter="25">
          <el-col :span="8"><span class="text">父级名称:&nbsp;&nbsp;{{parentMenuName}}</span></el-col>
          <el-col :span="8"><span class="text">父级编码:&nbsp;&nbsp;{{parentMenuCode}}</span></el-col>
          <el-col :span="8"><span class="text">父级类型:&nbsp;&nbsp;  {{ $t(`dict.resourceType.${createItem.parentResourceType}`)}}</span></el-col>
        </el-row>
       </div>
       	<el-form-item label="类型" label-width="80px" prop="resourceType" v-if="createItem.parentCurrentId">
						<el-radio-group v-model="createItem.resourceType">
							<el-radio label="menu">菜单</el-radio>
							<el-radio label="module">模块</el-radio>
						</el-radio-group>
				</el-form-item>
        <el-form-item label="资源名称" label-width="80px" prop="resourceName">
          <el-input style="width:80%" size="mini" v-model="createItem.resourceName" placeholder="请输入资源名称"></el-input>
        </el-form-item>
        <el-form-item label="资源编码" label-width="80px" prop="resourceCode">
          <el-input style="width:80%" size="mini"  v-model="createItem.resourceCode" placeholder="全局唯一编码"></el-input>
        </el-form-item>
         <el-form-item label="显示顺序" label-width="80px" prop="sort">
          <el-input style="width:80%" size="mini" v-model="createItem.sort" placeholder="越小越排前"></el-input>
        </el-form-item>
         <el-form-item label="功能路径" label-width="80px" prop="resourceUrl">
          <el-input style="width:80%" size="mini" v-model="createItem.resourceUrl" placeholder="请输入功能路径"></el-input>
        </el-form-item>
        <el-form-item label="子系统" label-width="80px" prop="sysCode">
          <el-select v-model="createItem.sysCode" placeholder="请选择" style="width:80%" >
            <el-option
              v-for="item in dictMap['sysCode']"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" v-show="createItem.resourceType==='module'" label-width="80px" prop="remark">
          <el-input style="width:80%" size="mini" v-model="createItem.remark" placeholder="备注"></el-input>
        </el-form-item>
         <!-- <el-form-item label="菜单图标" label-width="80px" prop="icon">
          <el-input style="width:80%" size="mini" v-model="createItem.icon" placeholder="请选择菜单图标"></el-input>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="submitForm('createItemForm')"> 
          <i class="el-icon-copy-document"></i> 保存
        </el-button>
        <el-button size="mini" @click="cancel">取 消</el-button>
      </div>
  </el-dialog>
  <el-dialog
    :title="dataTitle"
    :visible.sync="dataDialogShow"
    width="600px"
    @close="dataDialogShow = false">
    <el-form :model="dataForm" ref="dataForm" :rules="dataFormRules" label-width="100px" :inline="false" size="normal">
      <el-form-item v-if="dataType === 'export'" label="时间区间：" prop="date">
        <el-date-picker v-model="dataForm.date" type="daterange" size="mini" format="yyyy-MM-dd" value-format="yyyy-MM-dd"
          range-separator="-" start-placeholder="开始时间" end-placeholder="结束时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item v-if="dataType === 'import'" label="添加数据：" prop="sysAuthorityList">
        <el-input type="textarea" v-model="dataForm.sysAuthorityList" size="mini"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button @click="dataDialogShow = false" size="mini">取消</el-button>
      <el-button type="primary" @click="dataMethod" size="mini">确定</el-button>
    </span>
  </el-dialog>
  
  <RoleSave v-if="roleSaveVisable" ref="roleSave" @refreshDataList="getList"/>
</div>
</template>
<script>
import {resourceList,resourceSave,menuInfo,menuDelete,exportRecentData,importRecentData} from '@/api/permission'
import RoleSave from './roleSave'
import { mapGetters } from 'vuex'

export default {
  
  name:"menuFunction",
  data() {
  
    return {
      dataDialogShow: false,
      dataType: '',
      dataForm: { date:'',sysAuthorityList:'' },
      dataFormRules: {
        // date: { required: true, message: ' ', triggers: 'change' },
        sysAuthorityList: { required: true, message: ' ', triggers: 'change' }
      },
      roleSaveVisable:false,
      //弹框标题
      title:"",
      //弹框开关
      open:false,
      resourceTreeList: [],
      loadNodeMap: new Map(),
      createItem:{
        "currentId":"",
        "resourceCode":"",
        "resourceName":"",
        "resourceUrl":"",
        "resourceType":"menu",
        "sort":"",
        "parentCurrentId":"",
        "parentResourceType":"",
        "remark":"",
        "oldResourceType":"",
        sysCode: ''
      },
      parentMenuName:"",
      parentMenuCode:"",
      loading:false,
      //附加费模板
      rules: {
         resourceCode: [
            { required: true, message: '资源编码不能为空', trigger: 'blur' },
          ],
        resourceName: [
            { required: true, message: '资源名称不能为空', trigger: 'blur' },
          ],
        resourceType:[
            { required: true, message: '类型不能为空', trigger: 'blur' },
          ],
      },
    };
  },
   // table基础组件
  components:{
    RoleSave 
  },
  created() {
   this.getList();
  },
  mounted() {
  
  },
  computed: {
    ...mapGetters([
      'userId','dictMap'
    ]),
    dataTitle(){
      return this.dataType === 'export' ? '导出数据' : '导入数据'
    }
  },
  
  methods: {
    //  使用代码添加按钮
    localAdd(){
      let arr = [
        // 收款核销-确认收款登记
        // {
        //   parentCurrentId: 58,
        //   parentResourceCode: "route-WriteoffRecvDetail",
        //   parentResourceName: "页面-收款核销",
        //   parentResourceType: "module",
        //   resourceName: "按钮-确认收款登记",
        //   resourceCode: "btn-handleConfirm",
        //   resourceType: "module",
        // },

        // 总关账
        // {
        //   parentCurrentId: 166,
        //   parentResourceCode: "TotalClose",
        //   parentResourceName: "总关账",
        //   parentResourceType: "menu",
        //   resourceName: "tab-总关账汇总",
        //   resourceCode: "tab-totalClose1",
        //   resourceType: "module",
        // },

          // 总关账-总关账汇总
          // {
          //   parentCurrentId: 686,
          //   parentResourceCode: "tab-totalClose1",
          //   parentResourceName: "tab-总关账汇总",
          //   parentResourceType: "module",
          //   resourceName: "按钮-总关账",
          //   resourceCode: "btn-totalClose",
          //   resourceType: "module",
          //   resourceUrl: "/fin/finClose/close",
          // },
          // {
          //   parentCurrentId: 686,
          //   parentResourceCode: "tab-totalClose1",
          //   parentResourceName: "tab-总关账汇总",
          //   parentResourceType: "module",
          //   resourceName: "按钮-更新检查状态",
          //   resourceCode: "btn-updateStatus",
          //   resourceType: "module",
          // },
          // {
          //   parentCurrentId: 686,
          //   parentResourceCode: "tab-totalClose1",
          //   parentResourceName: "tab-总关账汇总",
          //   parentResourceType: "module",
          //   resourceName: "基本信息",
          //   resourceCode: "page-show",
          //   resourceType: "module",
          // },

        // {
        //   parentCurrentId: 166,
        //   parentResourceCode: "TotalClose",
        //   parentResourceName: "总关账",
        //   parentResourceType: "menu",
        //   resourceName: "tab-总关账失败明细",
        //   resourceCode: "tab-totalClose2",
        //   resourceType: "module",
        // },

        // 预关账
        // {
        //   parentCurrentId: 166,
        //   parentResourceCode: "tab-preClose1",
        //   parentResourceName: "tab-预关账失败",
        //   parentResourceType: "module",
        //   resourceName: "按钮-按单预关账",
        //   resourceCode: "btn-closeRecord",
        //   resourceType: "module",
        // },
      ]
      let times = 0
      arr.forEach(v=>{
        times++
        setTimeout(() => {
          let data = {...v}
          resourceSave(data).then(res=>{
            this.$msgSucClose(data.resourceName)
          })
        }, times*1000);
      })
    },
    //清空数据
    dialogClose(){
      this.$refs['createItemForm'].resetFields()
      Object.assign(this.createItem, {
        "currentId":"",
        "resourceCode":"",
        "resourceName":"",
        "resourceUrl":"",
        "resourceType":"menu",
        "sort":"",
        "parentCurrentId":"",
        "parentResourceType":"",
        "remark":"",
        "oldResourceType":""
      })
      this.parentMenuName=""
      this.parentMenuCode=""
    },
    loadSubMenu(tree, treeNode, resolve){
       this.loadNodeMap.set(tree.rowKey, {tree, treeNode, resolve})
       this.getList(resolve,tree.rowKey);
    },
    //新增资源
    handleAdd(row){
        this.open = true
        if(row){
          this.parentMenuName=row.resourceName
          this.parentMenuCode=row.resourceCode
          this.createItem.parentCurrentId=row.currentId
          this.createItem.parentResourceType=row.resourceType
        }
        this.title = "新增"
    },
    //资源编辑
    handleEdit(row){
      this.title = "查看"
      let params={};
       Object.assign(params, {
        currentId: row.currentId,
        resourceType:row.resourceType 
       })
      menuInfo(params).then(res=>{
        this.createItem=res.data
        this.parentMenuName=res.data.parentResourceName
        this.parentMenuCode=res.data.parentResourceCode
        this.open = true
      })
      
    },
    roleSaveShow(row){
      this.roleSaveVisable = true;
      this.$nextTick(() => {
        this.$refs.roleSave.init(row);
      });
    },
    //删除列表
    handleDelete(row){
      this.$confirm('是否确认删除名称为"' + row.resourceName + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: "true",
        type: "warning"
      }).then(function() {
         return menuDelete(row);
      }).then(() => {
         this.$message({message: '删除成功', type: 'success'});
         this.getList()

      }).catch(function() {});
    },
    getList(resolve) {
      this.loading = true;
      let params={};
      resourceList(params).then(res=>{
        if(resolve){
            resolve(res.data.resourceTreeList)
        }else{
          this.resourceTreeList = res.data.resourceTreeList
        }
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
              resourceSave(this.createItem).then(res=>{
                this.$message({message: '恭喜你，保存成功', type: 'success'});
                this.open = false
                if(this.createItem.parentCurrentId){
                  let treeObject=this.loadNodeMap.get(this.createItem.parentResourceType+this.createItem.parentCurrentId)
                  if(treeObject){
                      this.getList(treeObject.resolve,this.createItem.parentResourceType+this.createItem.parentCurrentId);
                      return false;
                  }
                }
                this.getList()
              })
          } else {
            return false;
          }
        });
    },
    exportRecentData(){
      this.dataType = 'export'
      this.dataDialogShow = true
    },
    importRecentData(){
      this.dataType = 'import'
      this.dataDialogShow = true
    },
    dataMethod(){
      this.$refs.dataForm.validate(valid => {
        if(!valid) return
        let method, data
        if(this.dataType === 'export'){
          method = exportRecentData
          data = {
            startDate: this.dataForm.date[0],
            endDate:  this.dataForm.date[1]
          }
          exportRecentData({
            startDate: this.dataForm.date[0],
            endDate:  this.dataForm.date[1]
          }).then(res=>{
            this.dataForm.sysAuthorityList = JSON.stringify(res.data, false, 2)
            this.$msgSucClose('导出成功！')
            this.dataDialogShow = false
          })
        }else{
          importRecentData({sysAuthorityList: JSON.parse(this.dataForm.sysAuthorityList)}).then(res=>{
            this.$msgSucClose('导入成功！')
            this.getList()
            this.dataDialogShow = false
          })
        }
      })
    }
   }
   
}
</script>
<style  lang="scss">
// components/Base组件
.menu{
  padding: 10px 14px 0;
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
      width:240px;
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
    /* .payment-advance-list{
    } */
  }
/* .green-rigth{
  display: inline-block;
  width: 20px;
  height: 14px;
  background: url("../images/green-right.png")no-repeat;
  margin-left: 1.25rem;
} */
  
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