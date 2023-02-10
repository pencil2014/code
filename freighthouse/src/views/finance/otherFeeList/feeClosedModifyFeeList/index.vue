<template>
  <div
    v-loading="loading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground"
  >
    <div>
      <FinanceSearch :searchOption="searchOption1" @search="search" />
      <div class="finance-search-list-gap"></div>
      <div class="finance-list-container">
        <div class="money-box">
          <div class="money-box-left">
            <div v-if="checkAuth('FeeClosedModifyFeeList', 'tab-modifyFeeList', 'btn-export')" class="finance-btn select-template-box">
              <!-- <el-button class="finance-btn" @click="handleExport" size="mini">导出全部数据</el-button> -->
              <el-dropdown trigger="click" @command="handleCommand">
                <span class="el-dropdown-link">导出<i class="el-icon-arrow-down el-icon--right"></i></span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    v-for="(item, index) in exportTypeList"
                    :key="'exportTypeList' + index"
                    :command="item.value"
                  >{{item.label}}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
          <div class="money-box-right">
          <el-radio-group v-model="auditStatus" size="mini" style="margin-right: 0px">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="pending">待审核</el-radio-button>
            <el-radio-button label="pass">审核通过</el-radio-button>
            <el-radio-button label="refuse">审核拒绝</el-radio-button>
          </el-radio-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              @click="refreshListPage"
              size="mini"
              type="primary"
            >刷新</el-button>
          </el-button-group>
          </div>
        </div>
        <FinanceTable :option="option1" @send-multi="sendMulti"/>
      </div>
    </div>
    <el-dialog
      :title="'日志'"
      :visible.sync="logDialogVisible"
      :close-on-click-modal="false"
      width="800px">
      <FinanceTable
        :option="option5"/>
      <span slot="footer" class="dialog-footer">
        <el-button @click="logDialogVisible = false" size="mini">关闭</el-button>
      </span>
    </el-dialog>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{key:'prop',label:'label'}"
        @close="customColumnsPopClose"
      />
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { feeAdjustList, getAdjustAuditLog, feeAdjustExport } from '@/api/fin/feeAdjust'
import { dateFormat } from '@/views/finance/utils/finance.js'
import CustomColumns from '@/components/customColumns/index'

export default {
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      keyDownActive: true,
      option1: {},
      searchOption1: {},
      form: {
        orderNo: '',
        applicationDate: '',
        confirmStatus: '',
        bizAuditStatus: '',
      },
      orderNo: '',
      feeAdjustApplyId: 0,
      loading: false,
      auditStatus: 'all',
      option5: {},
      logDialogVisible: false,
      multipleSelection1: [],
      exportTypeList: [
        { label: '导出审批情况', value: 'audit' },
        { label: '导出利润变化', value: 'profit' },
      ],
      dutyPerson: '',
    }
  },
  watch: {
    auditStatus() {
      this.handleCurrentChange(1)
    },
  },
  created() {
    console.log(this.dictMapObj.auditStatus);
    this.searchOption1 = {
      saveName: 'modifyFeeList',
      saveShow: true,
      // saveDefault: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 6,
        searchInputGroup: [
          { key: 'sourceBizNo', value: '', showType: '1' },
          { key: 'createdTime', value: '', showType: '2' },
          { key: 'finMon', value: '', showType: '3' },
          { key: 'finCloseStatus', value: '', showType: '4' },
          // { key: 'bizAuditBy', value: '', showType: '5' },
          { key: 'reason', value: '', showType: '5' },
          { key: 'createdBy', value: '', showType: '6' },
        ],
        filterGroups: {
          sourceBizNo: { label: '单号', type: 'input', showType: '1' },
          // auditStatus: { label: '审核状态', type: 'select', prop: 'auditStatusNocancel', showType: '3' },
          finMon: { label: '财务月份', type: 'month', showType: '3', format: 'yyyy-MM' },
          finCloseStatus: { label: '总关账状态', type: 'select', prop: 'yesNo', showType: '4' },
          createdBy: { label: '申请人', type: 'remoteSelect', remoteSelectList: [],
            remoteMethod: (name, item) => this.getEmployeeList(name, item),
            visibleChange: (name, item) => this.getEmployeeList(name, item),
          },
          bdEmployeeId: { label: '业务员', type: 'remoteSelect', remoteSelectList: [],
            remoteMethod: (name, item) => this.getEmployeeList(name, item),
            visibleChange: (name, item) => this.getEmployeeList(name, item),
          },
          applyPersonId: { label: '实际责任人', type: 'remoteSelect', remoteSelectList: [],
            remoteMethod: (name, item) => {
              this.getEmployeeList(name, item)
              setTimeout(() => {
                if (!item.remoteSelectList.find(item => item.value === 'other1')) {
                  item.remoteSelectList = item.remoteSelectList.concat([
                    {
                      label: '客户',
                      value: 'other1'
                    },
                    {
                      label: '订舱代理',
                      value: 'other2'
                    },
                    {
                      label: '供应商',
                      value: 'other3'
                    },
                    {
                      label: '国外代理',
                      value: 'other4'
                    }
                  ])
                }
              }, 1000)
            },
            visibleChange: (name, item) => {
              this.getEmployeeList(name, item)
              setTimeout(() => {
                if (!item.remoteSelectList.find(item => item.value === 'other1')) {
                  item.remoteSelectList = item.remoteSelectList.concat([
                    {
                      label: '客户',
                      value: 'other1'
                    },
                    {
                      label: '订舱代理',
                      value: 'other2'
                    },
                    {
                      label: '供应商',
                      value: 'other3'
                    },
                    {
                      label: '国外代理',
                      value: 'other4'
                    }
                  ])
                }
              }, 1000)
            },
            change: (val, filterGroup, searchInputGroup) => {
              // console.log(val, filterGroup, searchInputGroup)
              let f = searchInputGroup.find(item => item.key === 'applyPersonId')
              this.dutyPerson = f.saveList.length ? f.saveList[0].label : ''
            }
          },
          bizAuditBy: { label: '审核人', type: 'remoteSelect', remoteSelectList: [],
            remoteMethod: (name, item) => this.getEmployeeList(name, item),
            visibleChange: (name, item) => this.getEmployeeList(name, item),
          },
          createdTime: { label: '申请时间', type: 'daterange', format: 'yyyy-MM-dd', ranges:['startDate', 'endDate'] },
          bizAuditTime: { label: '审核时间', type: 'daterange', format: 'yyyy-MM-dd', ranges:['beginAuditTime', 'endAuditTime'] },
          reason: { label: '调费原因', type: 'select', prop: 'feeAdjustReason' },
          bizDate: { label: '业务日期', type: 'daterange', format: 'yyyy-MM-dd', ranges:['startBizDate', 'endBizDate'] },
          settleCompCode: {
            label: '分公司',
            prop: 'settleCompCode',
            type: 'remoteSelect',
            // multiple: true,
            clearable: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            remoteSelectList: [],
          },
        }
      },
    }
    let operationBtns = Object.assign(this.option.operationBtns, {
      data: [
        {
          label: '详情',
          type: 'text',
          // show: true,
          // showFn: () => this.checkAuth(this.$route.name, 'tab-modifyFeeList', 'btn-showDetail'),
          showFn: () => this.checkAuth('FeeClosedModifyFeeDetail'),
          action: 'showDetail'
        },
        {
          label: '日志',
          type: 'text',
          show: true,
          action: 'showLog'
        },
      ],
      width: 104
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true, isNew: true,
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'FeeClosedModifyFeeList',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      selection: false,
      operationBtns,
      pagination,
      colorColumns: ['auditStatus'],
      customColumns: {
        show: true,
        handleCustomColumns: this.handleCustomColumns
      },
    })
    this.selfColumnsBase = [
      {
        prop: 'settleCompName',
        label: '分公司',
        type: 'text',
        width: 160
      },
      {
        prop: 'sourceBizNo', // orderNo
        label: '单号',
        type: 'button',
        width: 128,
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            let type = row.sourceType ? row.sourceType : 'order'
            this.showOneNoDetail(type, row.sourceBizNo, { isTab: true, feeChild: 'feeClosedModifyFee' }) // feeId: row.feeId, 
          },
        },
      },
      {
        prop: 'bizDate',
        label: '业务日期',
        type: 'text',
      },
      {
        prop: 'reason',
        label: '调费原因',
        type: 'select',
        propInDict: 'feeAdjustReason',
        width: 120
      },
      {
        prop: 'content',
        label: '调费内容',
        type: 'text',
        width: 200,
      },
      {
        prop: 'remark',
        label: '调费备注',
        type: 'text',
        width: 120
      },
      {
        prop: 'finMon',
        label: '财务月份',
        type: 'text',
      },
      {
        prop: 'finCloseStatus',
        label: '总关账状态',
        type: 'select',
        propInDict: 'yesNo',
        formatter: ({ cellValue }) => { return cellValue === 'yes' ? '<span style="color:#CD4130;">是</span>' : cellValue === 'no' ? '<span style="color:#33B18A;">否</span>' : cellValue }
      },
      {
        prop: 'dutyPerson', // applyPersonName
        label: '实际责任人',
        type: 'text',
      },
      {
        prop: 'bizAuditStatus',
        label: '审核状态',
        type: 'select',
        propInDict: 'auditStatus',
      },
      {
        prop: 'bizAuditName',
        label: '当前审核人',
        type: 'text',
      },
      {
        prop: 'bizAuditTime',
        label: '审核时间',
        type: 'text',
        width: 130
      },
      // {
      //   prop: 'mainOrderAuditName',
      //   label: '主单审核人',
      //   type: 'text',
      // },
      // {
      //   prop: 'mainOrderAuditTime',
      //   label: '主单审核时间',
      //   type: 'text',
      //   width: 130
      // },
      {
        prop: 'bdEmployeeName',
        label: '业务员',
        type: 'text',
      },
      {
        prop: 'createdName',
        label: '申请人',
        type: 'text',
      },
      {
        prop: 'createdTime',
        label: '申请时间',
        type: 'text',
        width: 130
      },
    ]
    this.option1.columns = [ ...this.selfColumnsBase ]
    this.columns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.option5 = Object.assign({}, this.option, {
      id: 'option5', $name: 'FeeClosedModifyFeeList5',
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns: {
        show: false
      },
      selection: {
        show: false
      },
      index: {
        show: true
      },
      colorColumns: ['auditStatus']
    })
  },
  activated() {
    if (this.$route.query.tabFromOther && this.$route.query.auditStatus) {
      this.auditStatus = this.$route.query.auditStatus
    }
  },
  methods: {
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
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
      this.finCommonSearch(data.query, this.searchOption1, true)
      console.log(data.query)
      let idx = data.query.findIndex(item => item.column === 'applyPersonId')
      if (idx > -1) {
        data.query.splice(idx, 1)
        data.query.push({ column: 'dutyPerson', type: 'eq', value: this.dutyPerson.replace(/\(\w*\)/g, '') })
      }
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if(this.auditStatus !== 'all'){
        data.query = JSON.parse(JSON.stringify(data.query))
        data.query.push({ column: 'auditStatus', type: 'eq', value: this.auditStatus })
      }
      this.loading = true
      feeAdjustList(data).then((res) => {
        if (res.code === 0) {
          let { configColumns } = res.data
          this.columns = configColumns.length > 0 ? configColumns : this.selfColumnsBase.map(item => item.prop)
          this.option1.columns = this.columns.map(prop => {
            let obj = this.selfColumnsBase.find(item => item.prop === prop)
            if (obj) {
              return obj
            } else {
              return {}
            }
          })
          this.option1.data = res.data.list
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = res.data.currPage
          // this.option1.pagination.pageSize = res.data.pageSize
          // this.option1.pagination.totalCount = res.data.totalCount
        }
      }).finally(() => {
        this.loading = false
      })
    },
    showDetail({ sourceBizNo, sourceType, feeAdjustApplyId }) {
      this.routerPush('FeeClosedModifyFeeDetail', { sourceBizNo, sourceType, feeAdjustApplyId }, { isTab: true })
    },
    showLog(row) {
      let data = {
        "feeAdjustApplyId": row.feeAdjustApplyId
      }
      getAdjustAuditLog(data).then(res => {
        if (res.code === 0) {
          let data = res.data
          let columns = [
            {
              prop: 'approverName',
              label: '审核人',
              type: 'text',
              width: 120
            },
            {
              prop: 'approverDesc',
              label: '审核人角色',
              type: 'text',
              width: 120,
            },
            {
              prop: 'approveEndTime',
              label: '审核时间',
              type: 'text',
              width: 120
            },
            {
              prop: 'approvalResult',
              label: '审核状态',
              type: 'select',
              width: 100,
              propInDict: 'auditStatus'
            },
            {
              prop: 'approvalComments',
              label: '审核说明',
              type: 'text',
              minWidth: 200
            }
          ]
          this.option5.columns = columns
          this.option5.data = data ? data : []
          this.logDialogVisible = true
        }
      })
    },
    sendMulti(data, option) {
      this.multipleSelection1 = data
    },
    //导出按钮
		handleCommand(type) {
      if(type === 'profit'){
        let data = {
          currPage: this.option1.pagination.currPage,
          pageSize: this.option1.pagination.pageSize,
          query: [...(this.searchBackup)],
        }
        if(this.auditStatus !== 'all'){
          data.query = JSON.parse(JSON.stringify(data.query))
          data.query.push({ column: 'auditStatus', type: 'eq', value: this.auditStatus, })
        }
        // if (this.multipleSelection1.length) {
        //   data.query = [
        //     { column: 'feeAdjustApplyId', type: 'in', value: this.multipleSelection1.map((v) => v.feeAdjustApplyId).join(',') },
        //   ]
        // }
        //查询对象的配置编码
        data.query.push({ column: 'queryDataModuleCode', value: 'feeAdjustProfitStatExport' })
        this.$store.dispatch('finance/downloadExcelFile', { data: data }).then((res) => {
          this.aTagClick(window.URL.createObjectURL(res), '利润变动表.xlsx')
        })
        return
      }
			this.$confirm('是否确认导出费用审批列表?', "导出", {
        showCancelButton: true,
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				lockScroll: "true",
				type: "warning",
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = '执行中...';
            setTimeout(() => {
              this.option1.loading = true
              this.$store
                .dispatch('finance/downloadBlobFilePost', {
                  uri: '/fin/feeAdjust/feeAdjustExport',
                  data: { },
                })
                .then((res) => {
                  this.option1.loading = false
                  let link = document.createElement('a')
                  link.href = window.URL.createObjectURL(res)
                  link.download = '费用审批列表.xlsx'
                  link.click()
                  done();
                  instance.confirmButtonLoading = false;
                }).catch(() => {
                  this.option1.loading = false
                  this.$message({ message: '导出失败', type: 'error' })
                  done();
                  instance.confirmButtonLoading = false;
                })
            }, 10);
          } else {
            done();
            instance.confirmButtonLoading = false;
          }
        }
			}).catch(() => {})
		},
  },
  components: {
    FinanceTable,
    FinanceSearch,
    CustomColumns
  },
}
</script>
<style lang="scss" scoped>
.select-template-box {
  float: left;
}
.select-template-box .el-dropdown {
  margin-left: 0;
  margin-bottom: 0;
  border-radius: 0;
  font-size: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}
.select-template-box:hover .el-dropdown {
  background: rgb(236, 245, 255);
  color: rgb(64, 158, 255);
}
.select-template-box .el-dropdown-link {
  cursor: pointer;
  padding-left: 5px;
  line-height: 18px;
  display: inline-block;
}
.select-template-box .el-icon--right {
  margin-left: 0;
}
.select-template-box .el-dropdown-link:focus {
  outline: none;
}
</style>