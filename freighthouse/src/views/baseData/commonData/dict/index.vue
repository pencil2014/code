<template>
  <div class="menu">
    <div class="components-container">
      <div class="filter-containe search-layout">
        <div class="filter">
          <div class="search-containe">
            <div>
              <span class="filter-txt"> 字典组代码: </span>
              <el-input
                clearable
                class="input-width"
                size="mini"
                v-model="queryForm.groupCode"
              ></el-input>
              <span class="filter-txt"> 名称: </span>
              <el-input
                clearable
                class="input-width"
                size="mini"
                v-model="queryForm.groupCname"
                placeholder="中文模糊查询"
              ></el-input>
            </div>
          </div>
        </div>
        <el-button
          style="margin-left: 16px"
          size="mini"
          @click="handleSearch"
          type="primary"
        >
          <i class="el-icon-search"></i> 搜索
        </el-button>
        <el-button size="mini" @click="handleReset" plain> 重置 </el-button>
      </div>
    </div>
    <div class="components-container m-t-8">
      <div class="filter-containe search-layout">
        <div class="filter">
          <el-button size="mini" @click="handleAdd()" type="primary">
            <i class="el-icon-plus"></i> 新增字典组
          </el-button>
        </div>
      </div>
     <el-table
        v-loading="loading"
        :data="dictDefineList"
        style="margin: 16px 0px"
      >
        <el-table-column
          align="center"
          prop="groupCode"
          label="字典组代码"
          min-width="100px"
        ></el-table-column>
        <el-table-column
          align="center"
          prop="groupCname"
          label="中文名称"
          min-width="150px"
        ></el-table-column>
        <el-table-column
          align="center"
          prop="groupEname"
          label="英文名称"
         min-width="150px"
        ></el-table-column>
        <el-table-column
          align="center"
          prop="descpt"
          label="描述"
          min-width="150px"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column align="center" prop="row" label="操作" width="200">
          <template slot-scope="scope">
            <el-button @click="handleEdit(scope.row)" type="text" size="mini">查看</el-button>
            <el-button @click="handleDelete(scope.row)" type="text" size="mini">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <Pagination
        :config="tableConfig"
        :tableQuery="tableQuery"
        :callback="tableCallBack"
      />
    </div>
    <el-dialog
      :title="title"
      :visible.sync="open"
      :lock-scroll="true"
      width="880px"
      @close="dialogClose"
    >
      <el-form
        ref="createItemForm"
        :rules="rules"
        :model="createItem"
        label-suffix=":"
      >
       <el-row>
         <el-col :span="12">
             <el-form-item label="字典组编码" label-width="100px" prop="groupCode">
                <el-input
                  style="width: 80%"
                  size="mini"
                  v-model="createItem.groupCode"
                ></el-input>
             </el-form-item>
         </el-col>
          <el-col :span="12">
            <el-form-item label="中文名称" label-width="100px" prop="groupCname">
                  <el-input
                    style="width: 80%"
                    size="mini"
                    v-model="createItem.groupCname"
                  ></el-input>
              </el-form-item>
          </el-col>
        </el-row>
          <el-row>
         <el-col :span="12">
             <el-form-item label="英文名称" label-width="100px" prop="groupEname">
                <el-input
                  style="width: 80%"
                  size="mini"
                  v-model="createItem.groupEname"
                ></el-input>
             </el-form-item>
         </el-col>
          <el-col :span="12">
            <el-form-item label="描述" label-width="100px" prop="descpt">
                  <el-input
                    style="width: 80%"
                    size="mini"
                    v-model="createItem.descpt"
                  ></el-input>
              </el-form-item>
          </el-col>
        </el-row>
        <el-row >
          <el-table :data="createItem.dictItemList" highlight-current-row class="mt20">
             <el-table-column  align="center" label="字典项编码">
               <template slot-scope="scope">
                  <el-input
                    size="mini"
                    v-model="scope.row.itemCode"
                    placeholder="字典项编码"
                  ></el-input>
               </template>
            </el-table-column>
            <el-table-column  align="center" label="中文名称">
               <template slot-scope="scope">
                  <el-input
                    size="mini"
                    v-model="scope.row.itemCname"
                    placeholder="中文名称"
                  ></el-input>
               </template>
            </el-table-column>
              <el-table-column  align="center" label="英文名称">
               <template slot-scope="scope">
                  <el-input
                    size="mini"
                    v-model="scope.row.itemEname"
                    placeholder="英文名称"
                  ></el-input>
               </template>
            </el-table-column>
              <el-table-column  align="center" label="序号" width="80px">
               <template slot-scope="scope">
                  <el-input
                    size="mini"
                    v-model="scope.row.sort"
                    placeholder="序号"
                  ></el-input>
               </template>
            </el-table-column>
              <el-table-column  align="center" label="描述">
               <template slot-scope="scope">
                  <el-input
                    size="mini"
                    v-model="scope.row.descpt"
                      placeholder="描述"
                  ></el-input>
               </template>
            </el-table-column>
             <el-table-column align="center"  label="操作" width="80px">
              <template slot-scope="scope">
                <el-button @click="dictItemDelete(scope)" type="text" size="mini">删除</el-button>
                </template>
            </el-table-column>
          </el-table>
          <div class="dialog-add">
            <el-button style="width:100%" size="small" @click="dictItemAdd"> 
              <i class="el-icon-plus"></i>
                新增字典项
            </el-button>
          </div>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          size="mini"
          type="primary"
          @click="submitForm('createItemForm')"
        >
          <i class="el-icon-copy-document"></i> 保存
        </el-button>
        <el-button size="mini" @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { dictDefineList,dictDelete,dictSave,dictItemList } from "@/api/baseData";
import { mapGetters } from "vuex";
import Pagination from "@/components/Base/Table/pagination";

export default {
  name: "dictDefineList",
  data() {
    return {
      //弹框标题
      title: "",
      //弹框开关
      open: false,
      action: "",
      // 查询条件
      tableQuery: {
        columns: [],
        query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
        currPage: 1,
        pageSize: 10,
      },
      queryForm: {
        groupCname: "",
        groupCode: "",
      },
      tableConfig: {
        style: {},
        tableIndex: {
          show: false,
        },
        // 操作提示
        tips: {
          text: "",
          show: false,
        },
        // 分页
        pagination: {
          show: true,
          total: 0,
        },
      },
      dictDefineList: [],
      createItem: {
        groupId: "",
        groupCode: "",
        groupCname: "",
        groupEname: "",
        descpt:"",
        dictItemList:[]
      },
      loading: false,
      //附加费模板
      rules: {
        groupCode: [
          {
            required: true,
            message: "字典组编码不能为空",
            trigger: "blur,change",
          },
        ],
        groupCname: [
          {
            required: true,
            message: "中文名称不能为空",
            trigger: "blur,change",
          },
        ],
      },
    };
  },
  // table基础组件
  components: {
    Pagination,
  },
  created() {},
  mounted() {
    this.getList();
  },
  computed: {
    ...mapGetters(["userId", "dictMap"]),
  },

  methods: {
    //搜索按钮
    handleSearch() {
      this.tableQuery.currPage = 1;
      this.getList(true);
    },
    //搜索取消按钮
    handleReset() {
      this.queryForm.groupCname = undefined;
      this.queryForm.groupCode = undefined;
      this.handleSearch()
    },
    // 表格操作回调
    tableCallBack(action, arr) {
      let fn = this["handle" + action];
      // Add、Export、CustomColumns、ChangeLockState、Muti、SizeChange、CurrentChange、SingleEdit
      // MultiEdit、 MultiPublish、MultiInvalid、MultiDelete
      if (typeof fn !== "function") return;
      this["handle" + action](arr);
    },
    handleSizeChange() {
      this.getList();
    },

    handleCurrentChange() {
      this.getList();
    },
      // 增加一行
    dictItemAdd() {
      // 添加一行为空的数据
      const rowData = {
        itemCode:'', 
        itemCname: '',
        itemEname:'',
        descpt:'',
        sort:''
      }
      this.createItem.dictItemList.push(rowData)
    },

    // 删除一行
    dictItemDelete(scope) {
       this.createItem.dictItemList.splice(scope.$index, 1)
    },
    //清空数据
    dialogClose() {
      this.$refs["createItemForm"].resetFields();
      Object.assign(this.createItem, {
        groupId: "",
        groupCode: "",
        groupCname: "",
        groupEname: "",
        descpt:"",
        dictItemList:[]
      });
    },

    //新增菜单
    handleAdd() {
      this.open = true;
      this.title = "新增字典";
      this.action = "add";
    },
    //菜单编辑
    handleEdit(row) {
      this.open = true;
      this.action = "edit";
      this.title = "查看字典";
      if (row) {
        for (var p in this.createItem) {
          this.createItem[p] = row[p];
        }
        //获取字典项数据
       dictItemList({groupId:this.createItem.groupId}).then((res) => {
         this.createItem.dictItemList=res.data
      });
      }
    },
      //删除列表
    handleDelete(row) {
      this.$confirm("是否确认删除该条数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: "true",
        type: "warning",
      })
        .then(function () {
          return dictDelete({ groupId: row.groupId });
        })
        .then(() => {
          this.getList();
          this.$message({ message: "删除成功", type: "success" });
        })
        .catch(function () {});
    },
    getList(isSearch) {
      this.loading = true;
      this.initQueryForm(isSearch);
      dictDefineList(this.tableQuery).then((res) => {
        let { totalCount } = res.data;
        this.tableConfig.pagination.total = totalCount;
        this.dictDefineList = res.data.list;
        this.loading = false;
      });
    },
    initQueryForm(isSearch) {
      let obj = this.queryForm;
      let query = [];
        Object.keys(obj).forEach(function (key) {
          if (obj[key]) {
            //默认的查询条件组装tableQuery参数
            let tempQuery = {};
            Object.assign(tempQuery, {
              column: key,
              type: "eq",
              value: obj[key],
            });
            query.push(tempQuery);
          }
        });
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
          dictSave(this.createItem).then((res) => {
            this.$message({ message: "恭喜你，保存成功", type: "success" });
            this.open = false;
            this.handleSearch();
          });
        } else {
          return false;
        }
      });
    },
  },
};
</script>
<style  lang="scss" scoped>
// components/Base组件
.menu {
  .filter-containe {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    font-size: 12px;
    color: #333;
    align-items: baseline;
    flex-wrap: wrap;
    .filter {
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
  
  .el-table th > .cell {
    color: #222222;
  }
  .el-tag {
    background-color: #fff;
    color: #4a4a4a;
    border-style: none;
  }
  .dialog-add {
    margin-top: 16px;
    .el-button {
      border: 1px dashed #dcdfe6;
    }
  }
  .input-width {
    width: 150px;
  }
  .m-t-8 {
    margin-top: 8px;
  }
  .el-input__prefix {
    line-height: 28px;
    color: #000000;
  }
  .el-input--prefix .el-input__inner {
    padding-left: 45px;
  }
}
.payment-advance {
  color: #fff;
  padding: 6px 16px;
  line-height: 150%;
}


.search-layout .operation-btns-box {
  margin-left: 0;
  padding-left: 10px;
}
.parentWrap {
  margin-left: 12px;
  padding-bottom: 10px;
  .text {
    font-size: 14px;
  }
}
</style>