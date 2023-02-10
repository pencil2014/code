<template>
  <div class="menu">
    <div class="components-container">
      <div class="filter-containe search-layout">
        <div class="filter">
          <div class="search-containe">
            <div>
              <span class="filter-txt">国家:</span>
               <el-input
                clearable
                class="input-width"
                size="mini"
                placeholder="请输入国家编码"
                v-model="queryForm.country"
              ></el-input>
               <span class="filter-txt">年份:</span>
               <el-input
                clearable
                class="input-width"
                size="mini"
                placeholder="请输入年份"
                v-model="queryForm.year"
              ></el-input>
                <span class="filter-txt">节假日名称:</span>
               <el-input
                clearable
                class="input-width"
                size="mini"
                placeholder="请输入节假日名称"
                v-model="queryForm.dayName"
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
      <el-table v-loading="loading" :data="holidayList" style="margin:16px 0px">
        <el-table-column align="center" prop="country" label="国家"></el-table-column>
        <el-table-column align="center" prop="dayName" label="节日名称"></el-table-column>
        <el-table-column align="center" prop="dayDate" label="日期"></el-table-column>
        <el-table-column align="center" prop="workType" label="工作类型">
            <template slot-scope="scope">{{$t(`dict.workType.${scope.row.workType}`)}}</template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
    </div>
  </div>
</template>
<script>
import { holidayList } from "@/api/baseData";
import { mapGetters } from "vuex";
import Pagination from "@/components/Base/Table/pagination";
export default {
  name: "holidayList",
  data() {
    return {
      //弹框标题
      title: "",
      loading: false,
      // 查询条件
      tableQuery: {
        columns: [],
        query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
        currPage: 1,
        pageSize: 20,
      },
      queryForm: {
        year: "",
        country: "",
        dayName: "",
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
      queryDate: "",
      holidayList: [],
      currencyOptions: [],
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
      this.queryForm.year = undefined;
      this.queryForm.country = undefined;
      this.queryForm.dayName = undefined;
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

    getList(isSearch) {
      this.loading = true;
      this.initQueryForm(isSearch);
      holidayList(this.tableQuery).then((res) => {
        let { totalCount } = res.data;
        this.tableConfig.pagination.total = totalCount;
        this.holidayList = res.data.list;
        this.loading = false;
      });
    },
    initQueryForm(isSearch) {
      if (this.queryDate) {
        this.queryForm.beginDate = this.queryDate[0];
        this.queryForm.endDate = this.queryDate[1];
      }
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