<template>
  <div class="menu">
    <div class="components-container">
      <div class="filter-containe search-layout">
        <div class="filter">
          <div class="search-containe">
            <div>
              <span class="filter-txt"> 城市代码: </span>
              <el-input
                clearable
                placeholder="请输入城市代码"
                class="input-width"
                size="mini"
                v-model="queryForm.cityCode"
              ></el-input>
              <span class="filter-txt"> 名称: </span>
              <el-input
                clearable
                class="input-width"
                size="mini"
                v-model="queryForm.name"
                placeholder="中英文模糊查询"
              ></el-input>
              <span class="filter-txt"> 国家: </span>
                <el-autocomplete
                size="mini"
                placeholder="请选择所属国家"
                v-model="queryForm.countryCname"
                :fetch-suggestions="
                  (queryString, cb) => {
                    countryQuery(queryString,'', cb);
                  }
                "
                @change="
                  (value) => {
                    countrySelect(value, 'query');
                  }
                "
                @select="
                  (value) => {
                    countrySelect(value, 'query');
                  }
                "
                highlight-first-item
              >
                <template slot-scope="{ item }">
                  <div class="name">{{ item.cname }}</div>
                </template>
              </el-autocomplete>
              <span class="filter-txt">是否启用:</span>
              <el-select
                filterable
                clearable
                size="mini"
                v-model="queryForm.state"
              >
                <el-option
                  v-for="(o, key) in dictMap['state']"
                  :key="key"
                  :label="$t(`dict.state.${o.value}`)"
                  :value="o.value"
                ></el-option>
              </el-select>
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
            <i class="el-icon-plus"></i> 新增城市
          </el-button>
        </div>
      </div>
      <el-table
        v-loading="loading"
        :data="cityList"
        style="margin: 16px 0px"
      >
        <el-table-column
          align="center"
          prop="cityCode"
          label="城市代码"
          min-width="100px"
        ></el-table-column>
        <el-table-column
          align="center"
          prop="cname"
          label="中文名称"
          min-width="150px"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          align="center"
          prop="ename"
          label="英文名称"
         min-width="150px"
          show-overflow-tooltip
        ></el-table-column>
         <el-table-column
          align="center"
          prop="countryCname"
          label="国家中文名称"
          width="100px"
        >
        </el-table-column>
        <el-table-column
          align="center"
          prop="countryEname"
          label="国家英文名称"
          width="100px"
        >
        </el-table-column>
        <el-table-column align="center" prop="state" min-width="80px" label="是否启用">
          <template slot-scope="scope">
            {{ scope.row.state === "valid" ? "是" : "否" }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="row"
          label="操作"
          width="100"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button @click="handleEdit(scope.row)" type="text" size="mini"
              >查看</el-button
            >
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
      width="600px"
      @close="dialogClose"
    >
      <el-form
        ref="createItemForm"
        :rules="rules"
        :model="createItem"
        label-suffix=":"
      >
        <el-form-item label="城市代码" label-width="100px" prop="cityCode">
          <el-input
            style="width: 80%"
            size="mini"
            :disabled="createItem.cityId != ''"
            v-model="createItem.cityCode"
          ></el-input>
        </el-form-item>
        <el-form-item label="中文名称" label-width="100px" prop="cname">
          <el-input
            style="width: 80%"
            size="mini"
            v-model="createItem.cname"
          ></el-input>
        </el-form-item>
        <el-form-item label="英文名称" label-width="100px" prop="ename">
          <el-input
            style="width: 80%"
            size="mini"
            v-model="createItem.ename"
          ></el-input>
        </el-form-item>
        <el-form-item label="所属国家" label-width="100px" prop="countryCname">
            <el-autocomplete
                style="width: 80%"
                size="mini"
                v-model="createItem.countryCname"
                :fetch-suggestions="
                  (queryString, cb) => {
                    countryQuery(queryString,'', cb);
                  }
                "
                 @change="
                  (value) => {
                    countrySelect(value, '');
                  }
                "
                @select="
                  (value) => {
                    countrySelect(value, '');
                  }
                "
                placeholder="请选择国家"
                highlight-first-item
              >
                <template slot-scope="{ item }">
                  <div class="name">{{ item.cname }}</div>
                </template>
             </el-autocomplete>
        </el-form-item>
        <el-form-item label="是否启用" label-width="100px" prop="state">
          <el-radio-group v-model="createItem.state">
            <el-radio
              v-for="(o, key) in dictMap['state']"
              :key="key"
              :label="o.value"
            >
              {{ $t(`dict.state.${o.value}`) }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
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
import { cityList, citySave } from "@/api/baseData";
import { countrySelectList } from "@/api/base";

import { mapGetters } from "vuex";
import Pagination from "@/components/Base/Table/pagination";

export default {
  name: "cityList",
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
        countryCname:"",
        countryCode:"",
        cityCode: "",
        name: "",
        state: "",
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
      sysGenCodeChecked: true,
      cityList: [],
     
      createItem: {
        cityId: "",
        cityCode: "",
        countryCname:"",
        countryCode:"",
        cname: "",
        ename: "",
        state: "valid",
      },
      sysLineCode: "",
      loading: false,
      //附加费模板
      rules: {
        cityCode: [
          {
            required: true,
            message: "代码不能为空",
            trigger: "blur,change",
          },
        ],
        cname: [
          {
            required: true,
            message: "中文名称不能为空",
            trigger: "blur,change",
          },
        ],
        ename: [
          {
            required: true,
            message: "英文名称不能为空",
            trigger: "blur,change",
          },
        ],
        countryCname: [
          {
            required: true,
            message: "所属国家不能为空",
            trigger: "blur,change",
          },
        ],
        state: [
          {
            required: true,
            message: "是否启用不能为空",
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
      this.queryForm.countryCname = undefined;
      this.queryForm.countryCode = undefined;
      this.queryForm.cityCode = undefined;
      this.queryForm.name = undefined;
      this.queryForm.state = undefined;
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

    //清空数据
    dialogClose() {
      this.$refs["createItemForm"].resetFields();
      Object.assign(this.createItem, {
        cityId: "",
        cityCode: "",
        countryCname:"",
        countryCode:"",
        cname: "",
        ename: "",
        state: "valid",
      });
    },
   countryQuery(queryString,state, cb) {
      let params = {};
      Object.assign(params, {
        countryCode: queryString,
        state: "valid",
      });
      countrySelectList(params).then((response) => {
        cb(response.data);
      });
    },
    countrySelect(val,type){
       if(type==="query"){
         this.queryForm.countryCname = val.cname;
         this.queryForm.countryCode = val.countryCode;
       }else{
         this.createItem.countryCname = val.cname;
         this.createItem.countryCode = val.countryCode;
       }
    },
    //新增菜单
    handleAdd() {
      this.open = true;
      this.title = "新增城市";
      this.action = "add";
    },
    //菜单编辑
    handleEdit(row) {
      this.open = true;
      this.action = "edit";
      this.title = "查看城市";
      if (row) {
        for (var p in this.createItem) {
          this.createItem[p] = row[p];
        }
        this.sysLineCode = row.sysLineCode;
      }
    },
    getList(isSearch) {
      this.loading = true;
      this.initQueryForm(isSearch);
      cityList(this.tableQuery).then((res) => {
        let { totalCount } = res.data;
        this.tableConfig.pagination.total = totalCount;
        this.cityList = res.data.list;
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
          citySave(this.createItem).then((res) => {
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