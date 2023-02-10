<template>
    <div
      class="finance-page"
      v-loading="lsLoading"
      :element-loading-text="eLoadingText"
      :element-loading-spinner="eLoadingSpinner"
      :element-loading-background="eLoadingBackground"
    >
      <FinanceSearch ref="searchComp" :searchOption="searchOption1" @search="search" :border="true" />
      <div class="finance-list-container">
        <div class="money-box">
          <div>
          <!-- <el-button
          size="mini"
          @click="handleAdd(false)"
          type="primary"
          >
          新增合同
          </el-button> -->
          </div>
          <el-radio-group v-model="verifyStatus" size="mini" @change="handleCurrentChange(1)">
            <el-radio-button label="audit">待审批</el-radio-button>
            <el-radio-button label="checked">已审批</el-radio-button>
            <el-radio-button label="pass">归档</el-radio-button>
            <el-radio-button label="end">终止</el-radio-button>
          </el-radio-group>
        </div>
        <FinanceTable :option="option1" :autoMax="true" />
        <ContractAdd
        v-if="dialogOptions.show"
        :options="dialogOptions"
        @cancel="cancelAdd"
        @submit="submitAdd"
        ref="child"
      />
      </div>
    </div>
  </template>
  <script>
  import FinanceTable from '@/views/finance/components/financeTable/financeTable'
  import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
  import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
  import { routerMixin } from '@/views/finance/mixins/routerMixin'
  import { contractNewListTable } from '@/views/crm/data'
  import { getContractApproveList,addContractInfo,saveSupplierInfo} from '@/api/crm/contract'
  import ContractAdd from './contractAdd.vue'
  import { getValueByKey } from '@/api/base'
  
  export default {
    name: 'ContractVerifyList',
    mixins: [mixin, routerMixin],
    components: {
      FinanceTable,
      FinanceSearch,
      ContractAdd
    },
    data() {
      return {
        verifyStatus: 'audit',
        // 列表页--表格配置
        option1: {},
        // 列表页--搜索配置
        searchOption1: {},
        dialogOptions: {
          show: false,
          isEdit: false,
          type:'customer',
          where:'verify',
          form: {}
        },
        editAuthor:false
      }
    },
    created() {
      let searchObj = {}
      contractNewListTable.forEach((v) => {
        searchObj[v.prop] = { ...v, type: v.sType || v.type || 'input', label: v.sLabel || v.label }
      })
      this.searchOption1 = {
        saveDefault: true,
        addFilter: {
          defaultSearchLength: 4,
          searchInputGroup: [
            { key: 'applyNo', value: '', showType: '1', range: { min: '', max: '' } },
            { key: 'name', value: '', showType: '1', range: { min: '', max: '' } },
            { key: 'applyEmployeeName', value: '', showType: '1', range: { min: '', max: '' } },
            { key: 'applyTime', value: '', showType: '1', range: { min: '', max: '' } },
          ],
          filterGroups: { ...searchObj },
          dateArr: ['applyTime'],
          callback: true,
        },
      }
      // 表格配置
      let pagination = { ...this.option.pagination, show: true }
      let operationBtns = {
        ...this.option.operationBtns,
        width: '150px',
        data: [
          { label: '详情', action: 'custDetail', showFn: (row) => row.orgType.includes('customer')},
          { label: '详情', action: 'custDetail', showFn: (row) =>row.orgType.includes('supplier')},
          { label: '编辑', action: 'editDetail', showFn: (row) =>(row.verifyStatus.includes('audit'))&&this.editAuthor}
        ],
      }
      this.option1 = { 
        ...this.option, 
        id: 'option1', 
        pagination, 
        operationBtns, 
        border: true,
        selection: false,
      }
      this.option1.columns = [...contractNewListTable]
      // this.getData()
      this.getEditAuthor()
    },
    methods: {
      // 分页页面数量change   有分页必写此方法
      handleSizeChange(val) {
        let query = this.$refs.searchComp.addFilterSearch()
        this.option1.pagination.pageSize = val
        this.getData(query)
      },
      // 分页改变当前页   有分页必写此方法
      handleCurrentChange(val,event) {
        let query = this.$refs.searchComp.addFilterSearch()
        this.option1.pagination.currPage = val
        this.getData(query)
      },
      // 搜索按钮
      search(query) {
        this.option1.pagination.currPage = 1
        this.getData(query)
      },
      // 封装请求参数并请求列表
      getData(query) {
        this.lsLoading = true
        let data = {
          currPage: this.option1.pagination.currPage,
          pageSize: this.option1.pagination.pageSize,
          verifyStatus:this.verifyStatus,
          query:[]
        }
      if (query) {
        this.searchBackup = query
      }
      if (query) {
        data.query = data.query.concat(query)
        this.searchBackup = data.query
      }
      if (this.searchBackup) {
        data.query = this.searchBackup
      }
        getContractApproveList(data)
          .then(({ data }) => {
            this.option1.data = data.list.map((item) => ({ ...item, toggle: false }))
            if (this.option1.data.length) {
              this.option1.data.forEach(item => {
                // console.log('item',item)
              })
            }
            this.option1.pagination.currPage = data.currPage
            this.option1.pagination.pageSize = data.pageSize
            this.option1.pagination.totalCount = data.totalCount
          })
          .finally(() => (this.lsLoading = false))
      },
      handlecustDetail(row) {
        this.routerPush('contractDetail', { approveId: row.approveId,orgType:row.orgType,routeType:'approve' })
      },
      handleeditDetail(row){
        this.dialogOptions.isEdit = true
        this.dialogOptions.type = row.orgType
        this.dialogOptions.show = true
        this.dialogOptions.form = JSON.parse(
          JSON.stringify(Object.assign({}, this.dialogOptions.form, row))
        )
      },
      // 取消
      cancelAdd() {
        this.dialogOptions.show = false
        this.dialogOptions.form = {}
      },
      //获取可有编辑按钮权限的合同专员 ，待审核状态
      getEditAuthor(){
        getValueByKey("contract_cust_each_auditor").then(res=>{
          if (res.data && res.data.length>0) {
            if(res.data.includes(this.$store.state.user.userId)){
              this.editAuthor = true
            }else{
              this.editAuthor = false
            }
          }
        })
      },
      submitAdd(source){
      if(source.custType ==='customer'){
        addContractInfo(source).then((res) => {
          if (res.code === 0) {
            this.cancelAdd()
            this.handleCurrentChange(1)
            this.$msgSucClose('新增客户合同信息成功')
          }
        })
      }else{
        saveSupplierInfo(source).then((res) => {
          if (res.code === 0) {
            this.cancelAdd()
            this.handleCurrentChange(1)
            this.$msgSucClose('新增供应商合同信息成功')
          }
        })
      }

    },
    },
  }
  </script>
  <style lang="scss" scoped>
  .finance-page ::v-deep {
    .el-dialog__body {
      padding: 20px;
    }
    .el-dialog__footer {
      padding: 0 20px 20px;
    }
    .el-table th {
      padding: 4px 0;
    }
    .el-table--border th,
    .el-table--border td {
      border-right: 1px solid #dfe6ec !important;
      border-bottom: 1px solid #dfe6ec !important;
    }
    .el-table__body .el-table__row {
      height: auto !important;
      td:nth-of-type(4),
      td:nth-of-type(5),
      td:nth-of-type(6),
      td:nth-of-type(7),
      td:nth-of-type(8),
      td:nth-of-type(9),
      td:nth-of-type(10),
      td:nth-of-type(11),
      td:nth-of-type(12), 
      td:nth-of-type(13) {
        padding: 0;
        & > div {
          padding: 0;
          & > div {
            .el-tooltip{
              width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            min-height: 22px;
            line-height: 16px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-bottom: 1px solid #dfe6ec;
            &:nth-last-of-type(1),
            &.noBorder:nth-of-type(1) {
              border: none;
            }
          }
        }
      }
    }
  }
  </style>