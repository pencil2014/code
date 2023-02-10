<template>
  <div class="finance-page">
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div style="height:8px;background:#F8F9FD;"></div>
    <div class="finance-list-container">
        <div class="money-box">
        <div class="money-box-left">
          <el-button-group>
            <el-button type="primary" class="finance-btn" size="mini" @click="addConfigDialog()">新增</el-button>
          </el-button-group>
        </div>
        <div class="money-box-right"></div>
      </div>
      <div v-if="isFirst" v-loading="isFirst"></div>
      <FinanceTable v-else :option="tableOption" />
    </div>
      <configDialog
      :dialog-visible="dialogVisible"
      ref="configDialog"
      @relateSuc="getData"
     />
  </div>
</template>
<script>
import Vue from 'vue'
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import configDialog from  '@/views/exec/bkg/components/configDialog'
import { configureList,configureDelete} from "@/api/exec/autobook";
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin as mixin2 } from '@/views/finance/voucher/mixin'
import { dateFormat } from '@/views/finance/utils/finance'

// 统一设置规则提醒
const ruleMsg = [{ required: true, message: '请填写内容', trigger: 'blur' }]
//订单状态
let BOBJ = {} // 业务类型 对象
let SOBJ = {} // 服务模块 对象



export default {
  name: 'configureList',
  mixins: [mixin, mixin2],
  data() {
  
    return {
      // 列表页--表格配置
      tableOption: {},
      // 列表页--搜索配置
      searchOption: {},
      // 列表页--选中行
      multipleSelection: [],
      isFirst: true,
      //弹框标题
      title: '',
      //弹框开关
      open: false,
      action: '',
      // 查询条件
      tableQuery: {
        columns: [],
        query: [], // [{column: 'COLUMN_NAME', type: 'eq', value: ''}]：like-模糊，eq-精确查询]
        currPage: 1,
        pageSize: 10,
      },
      roleOptions: [],
      feeItemList: [],
      loading: false,
      dialogVisible: { show: false },
    }
  },
  watch: {

  },
  // table基础组件
  components: {
    FinanceTable,
    FinanceSearch,
    configDialog
  },
  async created() {
    this.isFirst = false
    // 搜索配置
    this.searchOption = {
      columns: [
       
      ],
      data: {
       
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true }
    this.tableOption = { ...this.option, id: 'tableOption', pagination }
    this.tableOption.operationBtns.data = [
      {
        label: '删除',
        type: 'text',
        show: true,
        action: 'Delete',
      },
      {
        label: '详情',
        type: 'text',
        show: true,
        action: 'showDetail',
      }
    ]
    this.tableOption.selection=''
    this.tableOption.operationBtns.width = '100px'
    this.tableOption.columns = [
      {
        label: '配置名称',
        prop: 'configName',
        type: 'text',
      },
      {
        label: '配置值',
        prop: 'configValue',
        type: 'text',
      },
      {
        label: '描述',
        prop: 'configDesc',
        type: 'text',
      },
    ]
    // console.log(this.tableOption)
    this.getData()
  },
  methods: {
    search(result) {
      this.searchResult = typeof result === 'string' ? result : this.searchResult
      this.tableOption.pagination.currPage = 1
      this.getData(true)
    },
    getData() {
      // this.loading = true
      let data = {
        currPage: this.tableOption.pagination.currPage,
        pageSize: this.tableOption.pagination.pageSize,
        query: [],
      }
      let obj = this.searchOption.data
      for (let key in obj) {
        let value = obj[key]
        if (key === 'updateDate') {
            Vue.set(data,"updateDateFrom",dateFormat('yyyy-mm-dd', value[0]))
            Vue.set(data,"updateDateTo",dateFormat('yyyy-mm-dd', value[1]))
        } else{
          Vue.set(data,key,value.trim())
        }
      }
      // console.log('data:', data)
      configureList(data)
        .then((res) => {
          let { list } = res.data
          this.tableOption.data = list
          this.tableOption.pagination.currPage = res.data.currPage
          this.tableOption.pagination.pageSize = res.data.pageSize
          this.tableOption.pagination.totalCount = res.data.totalCount
        })
        .catch(console.log)
    },
    // 冲红作废按钮
    addConfigDialog(row) {
      this.dialogVisible.show = true
      this.$nextTick(() => {
        this.$refs.configDialog.init(row);
      });
    },
    // 详情
    showDetail(row) {
      this.addConfigDialog(row);
    },
    //删除
    handleDelete($index, row, option){
      this.$confirm('是否确认删除该条配置?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        configureDelete({
          id: row.id,
        
        }).then(res => {
          this.$message({
            type: 'success',
            message: '删除成功',
            duration: 1000,
            onClose: () => {
              this.tableQuery.currPage=1
              this.getData()
            }
          })
        })
      }).catch((err) => {

      });
    }
  },
}
</script>