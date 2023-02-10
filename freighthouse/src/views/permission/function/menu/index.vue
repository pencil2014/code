<template>
<div class="menu">
  <div class="components-container  m-t-8">
    <div class="filter-containe search-layout">
      <div class="filter">
        <el-button size="mini"  @click="handleAdd('')" type="primary">
          <i class="el-icon-plus"></i> 新增菜单
        </el-button>
      </div>
    </div>
    <el-table v-loading="loading"
      ref="tableLayout"
      :data="resourceTreeList"
       style="margin:16px 0px"
       row-key="rowKey"
       :load="loadSubMenu"
      :tree-props="{children: 'subResourceList', hasChildren: 'hasChildren'}"
      :max-height="tableHeight || 500"
    >
        <el-table-column header-align="center" align="left" prop="resourceName" label="名称" ></el-table-column>
        <el-table-column align="center" prop="resourceCode"  label="编码" ></el-table-column>
        <el-table-column align="center" prop="level" label="菜单层级" ></el-table-column>
         <el-table-column align="center" prop="resourceType" label="类型" >
            <template slot-scope="scope">
              {{ $t(`dict.resourceType.${scope.row.resourceType}`)}}
            </template>
         </el-table-column>
        <el-table-column align="center" prop="sort" label="显示顺序" ></el-table-column>
        <el-table-column align="center" prop="resourceUrl" label="链接地址" ></el-table-column>
        <el-table-column align="center" prop="row" label="操作" width="300">
            <template slot-scope="scope">
              <el-button @click="handleEdit(scope.row)" type="text" size="mini"  >查看</el-button>
              <el-button @click="handleAdd(scope.row)" type="text" size="mini">新增子模块</el-button>
              <el-button @click="handleDelete(scope.row)" size="mini" type="text"  class="red">删除</el-button>
            </template>
         </el-table-column>
    </el-table>
  </div>
  <el-dialog :title="title" :visible.sync="open" :lock-scroll="true" width="600px"  @close="dialogClose">
     <el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":"  size="mini">
       <div class="parentWrap" v-if="title === '新增'">
        <el-row  :gutter="25">
          <el-col :span="12"><span class="text">父级菜单名称:&nbsp;&nbsp;{{parentMenuName}}</span></el-col>
          <el-col :span="12"><span class="text">父级菜单编码:&nbsp;&nbsp;{{parentMenuCode}}</span></el-col>
        </el-row>
       </div>
       <div v-if="title === '查看'">
          <el-form-item label="父菜单名称" label-width="80px" prop="">
            <el-cascader style="width:100%" filterable size="mini" clearable  :options="menuList" v-model="currentIds" @change="departAddHandleChange" :props="cascaderProps" placeholder="请选择父菜单名称" change-on-select expandTrigger='click' ></el-cascader>
          </el-form-item>
       </div>
        <el-form-item label="菜单名称" label-width="80px" prop="resourceName">
          <el-input style="width:100%" size="mini" v-model="createItem.resourceName" placeholder="请输入菜单名称"></el-input>
        </el-form-item>
        <el-form-item label="菜单编码" label-width="80px" prop="resourceCode">
          <el-input style="width:100%" size="mini"  v-model="createItem.resourceCode" placeholder="全局唯一编码"></el-input>
        </el-form-item>
         <el-form-item label="显示顺序" label-width="80px" prop="sort">
          <el-input style="width:100%" size="mini" v-model="createItem.sort" placeholder="越小越排前"></el-input>
        </el-form-item>
         <el-form-item label="功能路径" label-width="80px" prop="resourceUrl">
          <el-input style="width:100%" size="mini" v-model="createItem.resourceUrl" placeholder="请输入功能路径"></el-input>
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
          <el-input style="width:100%" size="mini" v-model="createItem.remark" placeholder="备注"></el-input>
        </el-form-item>
         <!-- <el-form-item label="菜单图标" label-width="80px" prop="icon">
          <el-input style="width:100%" size="mini" v-model="createItem.icon" placeholder="请选择菜单图标"></el-input>
        </el-form-item> -->
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
import {menuList,menuAdd,menuInfo,menuDelete} from '@/api/permission'
import { mapGetters } from 'vuex'

export default {
  
  name:"menuFunction",
  data() {
  
    return {
      //弹框标题
      title:"",
      //弹框开关
      open:false,
      menuList:[],
      cascaderProps: {
        children: 'subResourceList',
        label: 'resourceName',
        value: 'currentId'
      },
      currentIds:[],
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
      },
      tableHeight: null
    };
  },
   // table基础组件
  components:{
  },
  created() {
     this.getList();
  },
  mounted() {
    window.addEventListener('resize', this.computedTableHeight)
		this.$nextTick(() => {
			this.computedTableHeight()
		})
  },
  computed: {
    ...mapGetters([
      'userId','dictMap'
    ])
  },
  methods: {
    computedTableHeight() {
      let { tableLayout } = this.$refs
			let height = document.documentElement.clientHeight || document.body.offsetHeight
			let table = tableLayout.$el.getBoundingClientRect()
			// console.log('tableHeight', height, table.top)
			this.tableHeight = height - table.top - 20 -20 // 表格高度=文档高度-表格距顶部距离-表格分页-容器padding间距
			// console.log('tableHeight', this.tableHeight)
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
      this.currentIds = []
      let params={};
       Object.assign(params, {
        currentId: row.currentId,
        resourceType:row.resourceType,
       })
      menuInfo(params).then(res=>{
        this.createItem=res.data
        if(res.data.parentCurrentIdArr && res.data.parentCurrentIdArr.length){
          this.currentIds =res.data.parentCurrentIdArr
        }
        this.open = true
      })
    },
    departAddHandleChange(value) {
      this.createItem.parentCurrentId = value[value.length - 1];
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
      menuList(params).then(res=>{
        if(resolve){
            resolve(res.data.resourceTreeList)
        }else{
          this.resourceTreeList = res.data.resourceTreeList
        }
        this.menuList = this.getTreeData(res.data.resourceTreeList);
        console.log(this.menuList)
        this.loading = false
      })
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      for (let i = 0; i < data.length; i++) {
        if (!data[i].subResourceList.length) {
          // children若为空数组，则将children设为undefined
          data[i].subResourceList = undefined
        } else {
          this.getTreeData(data[i].subResourceList)
        }
      }
      return data
    },
     // 取消按钮
    cancel() {
      this.open = false;
    },
    //保存按钮操作
    submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
              menuAdd(this.createItem).then(res=>{
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
    
     
   }
   
}
</script>
<style  lang="scss" scoped>
// components/Base组件
.menu{
  margin: 0;
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