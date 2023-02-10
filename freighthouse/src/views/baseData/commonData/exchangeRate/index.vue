<template>
  <div class="menu">
    <!-- <div class="components-container">
      <div class="filter-containe search-layout">
        <div class="filter">
          <div class="search-containe">
            <div>
              <span class="filter-txt">原币:</span>
              <el-select filterable clearable size="mini" v-model="queryForm.srcCurrencyCode">
                <el-option
                  v-for="(o, key) in currencyOptions "
                  :key="key"
                  :label="o.code"
                  :value="o.code"
                ></el-option>
              </el-select>
              <span class="filter-txt">目标币:</span>
              <el-select filterable clearable size="mini" v-model="queryForm.toCurrencyCode">
                <el-option
                  v-for="(o, key) in currencyOptions "
                  :key="key"
                  :label="o.code"
                  :value="o.code"
                ></el-option>
              </el-select>
              <span class="filter-txt">汇率类型:</span>
              <el-select filterable clearable size="mini" v-model="queryForm.type">
                <el-option
                  v-for="(o, key) in dictMap['exchangeRateType'] "
                  :key="key"
                  :label="$t(`dict.exchangeRateType.${o.value}`)"
                  :value="o.value"
                ></el-option>
              </el-select>
              <span class="filter-txt">有效期:</span>
              <el-date-picker
                clearable
                size="mini"
                v-model="queryDate"
                type="daterange"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              ></el-date-picker>
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
          <el-button size="mini" @click="handleExport" type="primary">
            导出
          </el-button>
        </div>
      </div>
      <el-table v-loading="loading" :data="exchangeRateList" style="margin:16px 0px">
        <el-table-column align="center" prop="srcCurrency" label="汇率类型">
          <template slot-scope="scope">{{$t(`dict.exchangeRateType.${scope.row.type}`)}}</template>
        </el-table-column>
        <el-table-column align="center" prop="srcCurrency" label="原币种"></el-table-column>
        <el-table-column align="center" prop="srcCurrencyName" label="原币种名称"></el-table-column>
        <el-table-column align="center" prop="toCurrency" label="目标币种"></el-table-column>
        <el-table-column align="center" prop="toCurrencyName" label="目标币种名称  "></el-table-column>
        <el-table-column align="center" prop="formatRate" label="汇率"></el-table-column>
        <el-table-column align="center" prop="formatLowerRate" label="汇率下限"></el-table-column>
        <el-table-column align="center" prop="formatUpperRate" label="汇率上限"></el-table-column>
        <el-table-column align="center" prop="effectDate" label="生效日期" width="100">
          <template slot-scope="scope">{{scope.row.effectDate}}~ {{scope.row.expireDate}}</template>
        </el-table-column>
        <el-table-column align="center" prop="row" label="操作" width="80">
          <template slot-scope="scope">
            <el-button @click="handleEdit(scope.row)" type="text" size="mini">查看</el-button>
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
            <el-button size="mini" @click="handleExport" type="primary">
              导出
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
      <el-form v-if="openType==='Edit'" ref="createItemForm" :rules="rules" :model="createItem" label-suffix=":" label-width="120px" class="form">
        <el-form-item label="汇率类型"  prop="type">
          {{createItem.type?dictMapObj.exchangeRateType[createItem.type]:''}}
          <!-- $t(`dict.exchangeRateType.${createItem.type}`) -->
        </el-form-item>
        <el-form-item label="原币别"  prop="srcCurrency">
          {{createItem.srcCurrency}}
        </el-form-item>
        <el-form-item label="目标币别"  prop="toCurrency">
          {{createItem.toCurrency}}
        </el-form-item>
        <el-form-item label="有效期"  prop="upperRate">
          {{createItem.effectDate}}~ {{createItem.expireDate}}  
        </el-form-item>
        <el-form-item label="汇率"  prop="rate">
          <el-input  oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+10)}"   style="width:80%" size="mini" v-model="createItem.rate"></el-input>
        </el-form-item>
        <el-form-item label="汇率下限"  prop="lowerRate">
          <el-input :disabled="createItem.type==='acct'" oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+10)}"   style="width:80%" size="mini" v-model="createItem.lowerRate"></el-input>
        </el-form-item>
        <el-form-item label="汇率上限"  prop="upperRate">
          <el-input :disabled="createItem.type ==='acct'"  oninput="if(isNaN(value)){ value=value.slice(0,value.length-1)} if(value.indexOf('.')>0){value=value.slice(0,value.indexOf('.')+10)}"   style="width:80%" size="mini" v-model="createItem.upperRate"></el-input>
        </el-form-item>
        <!-- <el-form-item label="汇率生成日志">
          <p class="remark" v-html="createItem.remark"></p>
        </el-form-item> -->
      </el-form>
      <el-form v-else ref="createItemForm2" :rules="rules" :model="createItem" label-suffix=":" label-width="120px" class="form">
        <el-form-item label="汇率生成日志">
          <p class="remark" v-html="createItem.remark"></p>
        </el-form-item>
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
import { exchangeRateSave,exchangeRateList, finExchangeRateSave, currencyExportExchangeRate } from "@/api/baseData";
import { baseCurrencyList } from "@/api/base";
import { mapGetters } from "vuex";
import { dateFormat } from '@/views/finance/utils/finance'
// import Pagination from "@/components/Base/Table/pagination";
export default {
  name: "exchangeRateList",
  mixins: [mixin],
  data() {
    return {
      pageSizeUrl: exchangeRateList('geturl'),
      //弹框标题
      title: "",
      open:false,
      loading: false,
      submitFormLoading: false,
      // 查询条件
      tableQuery: {
        columns: [],
        query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
        currPage: 1,
        pageSize: 10,
      },
      queryForm: {
        srcCurrencyCode: "",
        toCurrencyCode: "",
        type: "",
        beginDate: "",
        endDate: "",
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
     createItem: {
        exchangeRateId: "",
        rate: "",
        lowerRate: "",
        upperRate: "",
        type: "",
        srcCurrency: "",
        toCurrency: "",
        effectDate:"",
        expireDate:"",
        remark: ''
      },
      queryDate: "",
      exchangeRateList: [],
      currencyOptions: [],
         //附加费模板
      rules: {
        rate: [
          { required: true, message: "汇率不能为空", trigger: "blur" },
        ],
        lowerRate: [
          { required: true, message: "汇率下限不能为空", trigger: "blur" },
        ],
        upperRate: [
          { required: true, message: "汇率上限不能为空", trigger: "blur" },
        ],
      },
      option1: {},
      searchOption1: {},
      multipleSelection1: [],
      openType: 'Edit'
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
      saveName: 'exchangeRate',
      addFilter: {
        defaultSearchLength: 4,
        searchInputGroup: [
          { key: 'srcCurrencyCode', value: '', showType: '1' },
          { key: 'toCurrencyCode', value: '', showType: '1' },
          { key: 'type', value: '', showType: '3' },
          { key: 'queryDate', value: '', showType: '2' },
        ],
        filterGroups: {
          srcCurrencyCode: { label: '原币', type: 'select', prop: 'currency', showType: '1' },
          toCurrencyCode: { label: '目标币', type: 'select', prop: 'currency', showType: '1' },
          type: { label: '汇率类型', type: 'select', prop: 'exchangeRateType', showType: '5' },
          queryDate: { label: '有效期', type: 'daterange', showType: '5' },
          // createdBy: {
          //   label: '创建人',
          //   type: 'remoteSelect',
          //   clearable: true,
          //   remoteSelectList: [],
          //   remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
          //   visibleChange: (queryString, item) => this.getEmployeeList('', item),
          // },
          // createdDate: { label: '生成日期', type: 'daterange', showType: '2' },
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
      ]
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
        prop: 'type',
        label: '汇率类型',
        type: 'select',
        propInDict: 'exchangeRateType'
      },
      {
        prop: 'srcCurrency',
        label: '原币种',
        type: 'text',
      },
      {
        prop: 'srcCurrencyName',
        label: '原币种名称',
        type: 'text',
      },
      {
        prop: 'toCurrency',
        label: '目标币种',
        type: 'text',
      },
      {
        prop: 'toCurrencyName',
        label: '目标币种名称',
        type: 'text',
      },
      {
        prop: 'formatRate',
        label: '汇率',
        type: 'text',
      },
      {
        prop: 'formatLowerRate',
        label: '汇率下限',
        type: 'text',
      },
      {
        prop: 'formatUpperRate',
        label: '汇率上限',
        type: 'text',
      },
      {
        prop: 'effectDate',
        label: '生效日期',
        type: 'text',
      },
      {
        prop: 'exchangeRateId',
        label: '汇率生成日志',
        type: 'button',
        operationBtns: {
          show: true,
          callback: (action, index, row, option) => {
            this.showLog(row)
          },
          data: [
            {
              label: '查看'
            }
          ]
        }
      },
      // {
      //   prop: 'createdName', // 都是系统创建, zhaobin
      //   label: '创建人',
      //   type: 'text',
      // },
      // {
      //   prop: 'createdTime',
      //   label: '创建时间',
      //   type: 'text',
      // },
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
    // this.getCurrencyList();
  },
  computed: {
    ...mapGetters(["userId", "dictMap"]),
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
      exchangeRateList(data).then(res=>{
        // let { totalCount } = res.data
        // this.option1.pagination.total = totalCount;
        this.option1.data = res.data.list
        Object.assign(this.option1.pagination, res.data)

      }).finally(() => {
        this.loading = false
      })
    },
    convertPagination(data) {

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
    // 币别下拉列表自动补充的数据
    getCurrencyList() {
      baseCurrencyList().then((response) => {
        this.currencyOptions = response.data;
      });
    },
    //搜索按钮
    handleSearch() {
      this.tableQuery.currPage = 1;
      this.getList(true);
    },
   // 取消按钮
    cancel() {
      this.open = false;
    },
    //搜索取消按钮
    handleReset() {
      this.queryForm.srcCurrencyCode = undefined;
      this.queryForm.toCurrencyCode = undefined;
      this.queryForm.type = undefined;
      this.queryForm.beginDate = undefined;
      this.queryForm.endDate = undefined;
      this.queryDate = [];
      this.handleSearch();
    },
      //菜单编辑
    handleEdit(row) {
      this.action = "edit";
      this.title = "修改汇率";
      if (row) {
        for (var p in this.createItem) {
          this.createItem[p] = row[p];
        }
        this.open = true;
        this.openType = 'Edit'
      }
    },
    showLog(row) {
      this.title = '汇率生成日志'
      if (row) {
        for (var p in this.createItem) {
          this.createItem[p] = row[p];
        }
        this.open = true
        this.openType = 'Log'
      }
    },
    //导出按钮
		handleExport(isSearch) {
      // this.initQueryForm(isSearch);
			// let data = this.tableQuery
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: this.searchBackup || [],
        columns: this.customColumnsKeys
      }
      // if(this.multipleSelection1.length){
      //   data.query = [{column: 'exchangeRateIds', type:'in', value: this.multipleSelection1.map(v => v.exchangeRateId).toString()}]
      // }

      this.$confirm('是否确认导出汇率列表?', '导出汇率列表', {
        showCancelButton: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        lockScroll: 'true',
        type: 'warning',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '执行中...'
            setTimeout(() => {
              this.$store
                .dispatch('finance/downloadBlobFilePost', {
                  uri: '/base/webapi/currency/exportExchangeRate',
                  data: { data },
                })
                .then((res) => {
                  console.log(res)
                  let link = document.createElement('a')
                  link.href = window.URL.createObjectURL(res)
                  link.download = '汇率列表.xlsx'
                  link.click()
                  done()
                  instance.confirmButtonLoading = false
                })
                .catch(() => {
                  this.$message({ message: '导出失败', type: 'error' })
                  done()
                  instance.confirmButtonLoading = false
                })
            }, 10)
          } else {
            done()
            instance.confirmButtonLoading = false
          }
        },
      })
        .then(() => {})
        .catch(() => {})
    },
     //保存按钮操作
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.createItem.upperRate < this.createItem.lowerRate) {
            return this.$message({ message: "汇率上限不能小于汇率下限", type: "error", showClose: true });
          }
          this.submitFormLoading = true
          finExchangeRateSave(this.createItem).then((res) => {
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
       //清空数据
    dialogClose() {
      this.$refs["createItemForm"].resetFields();
      Object.assign(this.createItem, {
        exchangeRateId: "",
        rate: "",
        lowerRate: "",
        upperRate: "",
        type: "",
        srcCurrency: "",
        toCurrency: "",
        effectDate:"",
        expireDate:"",
      });
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
    getList(isSearch) {
      this.loading = true;
      this.initQueryForm(isSearch);
      exchangeRateList(this.tableQuery).then((res) => {
        let { totalCount } = res.data;
        this.tableConfig.pagination.total = totalCount;
        this.exchangeRateList = res.data.list;
      }).finally(()=>{
        this.loading = false;
      })
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
          })
        if(isSearch){
         this.searchBackup = query
        }
        this.tableQuery.query = this.searchBackup || []
    },
  },
};
</script>
<style  lang="scss" scoped>
// // components/Base组件
// .menu {
//   padding: 12px;
//   .filter-containe {
//     display: flex;
//     flex-direction: row;
//     justify-content: flex-start;
//     font-size: 12px;
//     color: #333;
//     align-items: baseline;
//     flex-wrap: wrap;
//     .filter {
//       display: flex;
//       // flex: 1;
//       flex-direction: row;
//       justify-content: flex-start;
//       flex-wrap: wrap;
//     }
//     .filter-item {
//       display: inline-block;
//       vertical-align: middle;
//     }
//   }

//   .input-container-dialog {
//     float: left;
//     display: flex;
//     flex-direction: row;
//     justify-content: flex-end;
//     align-items: center;
//     margin: 10px 0 20px;
//     margin-right: 25px;

//     span.filter-txt {
//       min-width: 80px;
//       text-align: right;
//     }
//   }

//   .el-table th > .cell {
//     color: #222222;
//   }
//   .el-tag {
//     background-color: #fff;
//     color: #4a4a4a;
//     border-style: none;
//   }
//   .dialog-add {
//     margin-top: 16px;
//     .el-button {
//       border: 1px dashed #dcdfe6;
//     }
//   }
//   .input-width {
//     width: 150px;
//   }
//   .m-t-8 {
//     margin-top: 8px;
//   }
//   .el-input__prefix {
//     line-height: 28px;
//     color: #000000;
//   }
//   .el-input--prefix .el-input__inner {
//     padding-left: 45px;
//   }
// }
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
/deep/.el-form-item__content{
    font-size: 12px;
  }
  .remark{
    border: 1px solid #DCDFE6; 
    border-radius: 4px;
    line-height: 20px;
    padding: 5px;
    background-color: #F5F7FA;
  }
</style>
