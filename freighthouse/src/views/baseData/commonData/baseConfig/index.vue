<template>
  <div class="menu">
    <div class="components-container">
      <div class="filter-containe search-layout">
        <div class="filter">
          <div class="search-containe">
            <div>
              <span class="filter-txt">配置KEY:</span>
                <el-input
                clearable
                class="input-width"
                size="mini"
                v-model="queryForm.configKey"
              ></el-input>
               <span class="filter-txt">名称:</span>
              <el-input
                clearable
                class="input-width"
                size="mini"
                v-model="queryForm.name"
              ></el-input>
            </div>
          </div>
        </div>
        <el-button style="margin-left:16px" size="mini" @click="handleSearch" type="primary">
          <i class="el-icon-search"></i> 搜索
        </el-button>
        <el-button size="mini" @click="handleReset" plain>重置</el-button>
      </div>
    </div>
    <div class="components-container m-t-8">
      <div class="filter-containe search-layout">
        <div class="filter">
          <el-button size="mini" @click="handleAdd()" type="primary">
            <i class="el-icon-plus"></i> 新增系统配置项
          </el-button>
        </div>
      </div>
      <el-table v-loading="loading" :data="baseConfigList" style="margin:16px 0px">
        <el-table-column align="center" prop="configKey" label="配置KEY"></el-table-column>
        <el-table-column align="center" prop="cname" label="中文名称"></el-table-column>
        <el-table-column align="center" prop="ename" label="英文名称"></el-table-column>
        <el-table-column align="center" prop="configValue" label="配置值" width="200">
           <template slot-scope="scope">
             <el-tooltip class="self-tootip">
                     <div slot="content">{{scope.row.configValue ? scope.row.configValue : '--'}}</div>
                     <span>{{scope.row.configValue ? scope.row.configValue : '--'}}</span>
             </el-tooltip>
           </template>
        </el-table-column>
        <el-table-column align="center" prop="configDesc" show-overflow-tooltip label="描述信息"  min-width="100">
           <template slot-scope="scope">
             <el-tooltip class="self-tootip">
                     <div slot="content">{{scope.row.configDesc ? scope.row.configDesc : '--'}}</div>
                     <span>{{scope.row.configDesc ? scope.row.configDesc : '--'}}</span>
             </el-tooltip>
           </template>
        </el-table-column>
        <el-table-column align="center" prop="row" label="操作" width="200">
          <template slot-scope="scope">
            <el-button @click="handleEdit(scope.row)" type="text" size="mini">查看</el-button>
            <el-button @click="handleDelete(scope.row)" type="text" size="mini">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-dialog
        :title="title"
        :visible.sync="open"
        :lock-scroll="true"
        width="600px"
        @close="dialogClose"
      >
        <el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":" label-width="100px">
          <el-form-item label="配置KEY"  prop="configKey">
              <el-input style="width:100%" size="mini" v-model.trim="createItem.configKey" ></el-input>
          </el-form-item>
          <el-form-item label="中文名称"  prop="cname">
              <el-input style="width:100%" size="mini" v-model="createItem.cname" ></el-input>
          </el-form-item>
           <el-form-item label="英文名称"  prop="ename">
              <el-input style="width:100%" size="mini" v-model="createItem.ename" ></el-input>
          </el-form-item>
              <el-form-item label="配置值"  prop="configValue">
              <el-input type="textarea" style="width:100%"   rows="3" size="mini" v-model.trim="createItem.configValue" ></el-input>
          </el-form-item>
              <el-form-item label="描述"  prop="configDesc">
              <el-input rows="2" style="width:100%" size="mini" v-model="createItem.configDesc" ></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button size="mini" type="primary" @click="submitForm('createItemForm')">
            <i class="el-icon-copy-document"></i> 保存
          </el-button>
          <el-button size="mini" @click="cancel">取 消</el-button>
        </div>
      </el-dialog>
      <!-- 分页 -->
      <Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
    </div>
  </div>
</template>
<script>
import {
  baseConfigList,
  baseConfigSave,
  baseConfigDelete,
} from "@/api/baseData";
import { mapGetters } from "vuex";
import Pagination from "@/components/Base/Table/pagination";

export default {
  name: "baseConfigList",
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
        configKey: "",
        name:""
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
      baseConfigList: [],
      createItem: {
        oid: "",
        cname: "",
        ename: "",
        configKey: "",
        configValue: "",
        configDesc:"",
      },
      loading: false,
      //附加费模板
      rules: {
        configKey: [
          { required: true, message: "配置KEY不能为空", trigger: "blur" },
        ],
        configValue: [
          { required: true, message: "配置值不能为空", trigger: "blur" },
        ]
        
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
    //清空数据
    dialogClose() {
      this.$refs["createItemForm"].resetFields();
      Object.assign(this.createItem, {
        oid: "",
        cname: "",
        ename: "",
        configKey: "",
        configValue: "",
        configDesc:"",
      });
    },

    //搜索按钮
    handleSearch() {
      this.tableQuery.currPage = 1;
      this.getList(true);
    },
    //搜索取消按钮
    handleReset() {
      this.queryForm.configKey = undefined;
      this.queryForm.name = undefined;
      this.handleSearch();
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
    //新增菜单
    handleAdd() {
      this.open = true;
      this.title = "新增系统配置项";
      this.action = "add";
    },
    //菜单编辑
    handleEdit(row) {
      this.action = "edit";
      this.title = "查看系统配置项";
      if (row) {
        for (var p in this.createItem) {
          this.createItem[p] = row[p];
        }
        this.open = true;
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
          return baseConfigDelete({ oid: row.oid });
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
      baseConfigList(this.tableQuery).then((res) => {
        let { totalCount } = res.data;
        this.tableConfig.pagination.total = totalCount;
        this.baseConfigList = res.data.list;
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
      console.log(this.createItem);
      this.$refs[formName].validate((valid) => {
        if (valid) {
          baseConfigSave(this.createItem).then((res) => {
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
  .self-tootip{
   display: inline-block;
   width: 100%;
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
   }
</style>