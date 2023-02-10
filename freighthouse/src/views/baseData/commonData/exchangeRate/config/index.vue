<template>
  <div class="menu">
    <!-- <div class="components-container">
      <div class="filter-containe search-layout">
        <div class="filter">
          <div class="search-containe">
            <div>
              <span class="filter-txt">原币:</span>
              <el-select
                filterable
                clearable
                size="mini"
                v-model="queryForm.srcCurrencyCode"
              >
                <el-option
                  v-for="(o, key) in currencyOptions "
                  :key="key"
                  :label="o.code"
                  :value="o.code"
                ></el-option>
              </el-select>
               <span class="filter-txt">目标币:</span>
              <el-select
                filterable
                clearable
                size="mini"
                v-model="queryForm.toCurrencyCode"
              >
                <el-option
                  v-for="(o, key) in currencyOptions "
                  :key="key"
                  :label="o.code"
                  :value="o.code"
                ></el-option>
              </el-select>
            </div>
          </div>
        </div>
        <el-button style="margin-left:16px" size="mini" @click="handleSearch" type="primary">
          搜索
        </el-button>
        <el-button size="mini" @click="handleReset" plain>重置</el-button>
      </div>
    </div>
    <div class="components-container m-t-8">
      <div class="filter-containe search-layout">
        <div class="filter">
          <el-button size="mini" @click="handleAdd()" type="primary">
            新增汇率关系
          </el-button>
        </div>
      </div>
      <el-table v-loading="loading" :data="exchangeRateConfigList" style="margin:16px 0px">
        <el-table-column align="center" prop="srcCurrencyCode" label="原币种"></el-table-column>
        <el-table-column align="center" prop="srcCurrency" label="原币种名称"></el-table-column>
        <el-table-column align="center" prop="toCurrencyCode" label="目标币种"></el-table-column>
        <el-table-column align="center" prop="toCurrency" label="目标币种名称  "></el-table-column>
        <el-table-column align="center" prop="lowerRate" label="汇率下限浮动"></el-table-column>
        <el-table-column align="center" prop="upperRate" label="汇率上限浮动"></el-table-column>
        <el-table-column align="center" prop="decimalLength" width="130" label="记账汇率小数位长度"></el-table-column>
        <el-table-column align="center" prop="settleDecimalLength" width="130" label="结算汇率小数位长度"></el-table-column>
        <el-table-column align="center" prop="sourceType" label="记账汇率来源" :formatter="formatter"></el-table-column>
        <el-table-column align="center" prop="row" label="操作" width="200">
          <template slot-scope="scope">
            <el-button @click="handleEdit(scope.row)" type="text" size="mini">查看</el-button>
            <el-button @click="handleDelete(scope.row)" type="text" size="mini">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <Pagination :config="tableConfig" :tableQuery="tableQuery" :callback="tableCallBack" />
    </div> -->
    <FinanceSearch :searchOption="searchOption1" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button-group>
            <el-button size="mini" @click="handleAdd()" type="primary">
              新增汇率配置
            </el-button>
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
    <el-dialog
      :title="title"
      :visible.sync="open"
      :lock-scroll="true"
      width="600px"
      @close="dialogClose"
    >
      <el-form ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":" label-width="140px">
        <el-form-item label="原币种" prop="srcCurrencyCode">
          <el-select
            style="width:80%"
            filterable
            size="mini"
            v-model="createItem.srcCurrencyCode"
            @change="currencyChange($event,'srcCurrency')"
          >
            <el-option
              v-for="(o, key) in currencyOptionsValid "
              :key="key"
              :label="o.code"
              :value="o.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="目标币种"  prop="toCurrencyCode">
          <el-select
            style="width:80%"
            filterable
            size="mini"
            v-model="createItem.toCurrencyCode"
            @change="currencyChange($event,'toCurrency')"
          >
            <el-option
              v-for="(o, key) in currencyOptionsValid "
              :key="key"
              :label="o.code"
              :value="o.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="汇率类型"  prop="rateType">
          <el-select
            style="width:80%"
            filterable
            size="mini"
            v-model="createItem.rateType"
          >
            <el-option
              v-for="(o, key) in dictMap['exchangeRateType'] "
              :key="key"
              :label="o.label"
              :value="o.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="汇率来源"  prop="sourceType">
          <el-select
            style="width:80%"
            filterable
            size="mini"
            v-model="createItem.sourceType"
          >
            <el-option
              v-for="(o, key) in dictMap['rateSourceType'] "
              :key="key"
              :label="o.label"
              :value="o.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="下限浮动"  prop="lowerRate">
          <el-input v-lsNumber="{value:'number', obj:createItem, key:'lowerRate', dot:10,}" maxlength="16" style="width:80%" size="mini" v-model="createItem.lowerRate"></el-input>
        </el-form-item>
        <el-form-item label="上限浮动"  prop="upperRate">
          <el-input v-lsNumber="{value:'number', obj:createItem, key:'upperRate', dot:10,}" maxlength="16" style="width:80%" size="mini" v-model="createItem.upperRate"></el-input>
        </el-form-item>
        <el-form-item label="保留小数位数"  prop="decimalLength">
          <el-input v-lsNumber="{value:'number', obj:createItem, key:'decimalLength', dot:1,}" maxlength="2" style="width:80%" size="mini" v-model="createItem.decimalLength"></el-input>
        </el-form-item>
        <!-- 记账汇率小数位长度 -->
        <!-- <el-form-item label="结算汇率小数位长度"  prop="settleDecimalLength">
          <el-input v-lsNumber="{value:'number', obj:createItem, key:'settleDecimalLength', dot:1,}"
            style="width:80%" size="mini" v-model="createItem.settleDecimalLength" maxlength="2"></el-input>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" :loading='submitFormLoading' @click="submitForm('createItemForm')">
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
import {
  exchangeRateConfigList,
  exchangeRateConfigSave,
  exchangeRateConfigDelete,
} from "@/api/baseData";
import { baseCurrencyList } from "@/api/base";
import { mapGetters } from "vuex";
import { dateFormat } from '@/views/finance/utils/finance'
// import Pagination from "@/components/Base/Table/pagination";
export default {
  name: "exchangeRateConfigList",
  mixins: [mixin],
  data() {
    return {
      pageSizeUrl: exchangeRateConfigList('geturl'),
      //弹框标题
      title: "",
      //弹框开关
      open: false,
      submitFormLoading: false,
      action: "",
      // 查询条件
      tableQuery: {
        columns: [],
        query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
        currPage: 1,
        pageSize: 10,
      },
      queryForm: {
        srcCurrencyCode: "",
        toCurrencyCode:""
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
      currencyOptions: [],
      currencyOptionsValid: [],
      exchangeRateConfigList: [],
      sysGenCodeChecked: true,
      createItem: {
        oid: "",
        srcCurrencyCode: "",
        srcCurrency: "",
        toCurrencyCode: "",
        toCurrency: "",
        lowerRate: 0.05,
        upperRate: 0.05,
        decimalLength:4,
        settleDecimalLength:4,
        sourceType: 'boc',
        rateType: ''
      },
      loading: false,
      //附加费模板
      rules: {
        srcCurrencyCode: [
          { required: true, message: "原币代码不能为空", trigger: "blur" },
        ],
        toCurrencyCode: [
          { required: true, message: "目标币不能为空", trigger: "blur" },
        ],
        decimalLength: [
          { required: true, message: "记账汇率小数位长度不能为空", trigger: "blur" },
        ],
        settleDecimalLength: [
          { required: true, message: "结算汇率小数位长度不能为空", trigger: "blur" },
        ],
        sourceType: {
           required: true, message: "记账汇率来源不能为空", trigger: "blur" 
        }
      },
      option1: {},
      searchOption1: {},
      multipleSelection1: []
    };
  },
  // table基础组件
  components: {
    // Pagination,
    FinanceSearch,
    FinanceTable
  },
  created() {
    this.searchOption1 = {
      saveDefault: true,
      // saveShow: true,
      saveName: 'exchangeRateConfig',
      addFilter: {
        defaultSearchLength: 4,
        searchInputGroup: [
          { key: 'srcCurrencyCode', value: '', showType: '1' },
          { key: 'toCurrencyCode', value: '', showType: '1' },
          { key: 'rateType', value: '', showType: '1' },
        ],
        filterGroups: {
          srcCurrencyCode: { label: '原币', type: 'select', prop: 'currency', showType: '1' },
          toCurrencyCode: { label: '目标币', type: 'select', prop: 'currency', showType: '1' },
          rateType: { label: '汇率类型', type: 'select', prop: 'exchangeRateType', showType: '1' },
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
        {
          label: '删除',
          type: 'text',
          show: true,
          action: 'Delete',
        }
      ],
      width: 88
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
        prop: 'srcCurrencyCode',
        label: '原币种',
        type: 'text',
      },
      {
        prop: 'srcCurrency',
        label: '原币种名称',
        type: 'text',
      },
      {
        prop: 'toCurrencyCode',
        label: '目标币种',
        type: 'text',
      },
      {
        prop: 'toCurrency',
        label: '目标币种名称',
        type: 'text',
      },
      {
        prop: 'rateType',
        label: '汇率类型',
        type: 'select',
        propInDict: 'exchangeRateType'
      },
      {
        prop: 'lowerRate',
        label: '下限浮动',
        type: 'text',
      },
      {
        prop: 'upperRate',
        label: '上限浮动',
        type: 'text',
      },
      {
        prop: 'decimalLength',
        label: '保留小数位数', // 记账汇率小数位长度
        type: 'text',
      },
      // {
      //   prop: 'settleDecimalLength',
      //   label: '结算汇率小数位长度',
      //   type: 'text',
      // },
      {
        prop: 'sourceType',
        label: '汇率来源',
        type: 'select',
        propInDict: 'rateSourceType'
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
    // this.getList();
    this.getCurrencyList();
  },
  computed: {
    ...mapGetters(["userId", "dictMap", 'dictMapObj']),
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
          if (key === 'queryDate') {
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
      exchangeRateConfigList(data).then(res=>{
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
    formatter (row, column, cellValue, index) {
     return cellValue ? this.dictMapObj['rateSourceType'][cellValue] : ''
    },
    //清空数据
    dialogClose() {
      this.$refs["createItemForm"].resetFields();
      Object.assign(this.createItem, {
        oid: "",
        srcCurrencyCode: "",
        srcCurrency: "",
        toCurrencyCode: "",
        toCurrency: "",
        lowerRate: 0.05,
        upperRate: 0.05,
        decimalLength:4,
        settleDecimalLength:4,
        sourceType: 'boc'
      });
    },
    // 币别下拉列表自动补充的数据
    getCurrencyList() {
      baseCurrencyList().then((response) => {
        this.currencyOptions = response.data;
      });
      baseCurrencyList('', 'valid').then((response) => {
        this.currencyOptionsValid = response.data;
      });
    },
    //搜索按钮
    handleSearch() {
      this.tableQuery.currPage = 1;
      this.getList(true);
    },
    //搜索取消按钮
    handleReset() {
      this.queryForm.srcCurrencyCode = undefined;
      this.queryForm.toCurrencyCode = undefined;
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
    // handleSizeChange() {
    //   this.getList();
    // },
    // handleCurrentChange() {
    //   this.getList();
    // },
    //新增菜单
    handleAdd() {
      this.open = true;
      this.title = "新增汇率配置";
      this.action = "add";
    },
    //菜单编辑
    handleEdit(row) {
      this.action = "edit";
      this.title = "修改汇率配置";
      if (row) {
        for (var p in this.createItem) {
          this.createItem[p] = row[p];
        }
        this.open = true;
      }
    },
    //删除列表
    handleDelete($index, row) {
      this.$confirm("是否确认删除该条数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        lockScroll: "true",
        type: "warning",
      })
        .then(function () {
          return exchangeRateConfigDelete({ oid: row.oid });
        })
        .then(() => {
          // this.getList();
          this.getData()
          this.$message({ message: "删除成功", type: "success" });
        })
        .catch(function () {});
    },
    getList(isSearch) {
      this.loading = true;
      this.initQueryForm(isSearch);
      exchangeRateConfigList(this.tableQuery).then((res) => {
        let { totalCount } = res.data;
        this.tableConfig.pagination.total = totalCount;
        this.exchangeRateConfigList = res.data.list;
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
          console.log(this.createItem);
          this.submitFormLoading = true
          exchangeRateConfigSave(this.createItem).then((res) => {
            this.$message({ message: "恭喜你，保存成功", type: "success" });
            this.open = false;
            // this.handleSearch();
            this.getData()
          }).finally(()=>{
            this.submitFormLoading = false
          })
        } else {
          return false;
        }
      });
    },
    currencyChange(val, type) {
      let that = this;
      console.log(that.createItem[type]);
      var obj = this.currencyOptionsValid.find(function (item) {
        return item.code === val;
      });
      if (obj) {
        this.createItem[type] = obj.cnName;
      }
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