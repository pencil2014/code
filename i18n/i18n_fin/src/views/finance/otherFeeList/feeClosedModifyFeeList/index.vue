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
                <span class="el-dropdown-link">{{$t('OrderFee.export')}}<i class="el-icon-arrow-down el-icon--right"></i></span>
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
            <el-radio-button label="all">{{$t('OrderFee.all')}}</el-radio-button>
            <el-radio-button label="pending">{{$t('OrderFee.pending')}}</el-radio-button>
            <el-radio-button label="pass">{{$t('OrderFee.passed')}}</el-radio-button>
            <el-radio-button label="refuse">{{$t('OrderFee.refused')}}</el-radio-button>
          </el-radio-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              @click="refreshListPage"
              size="mini"
              type="primary"
            >{{$t('OrderFee.refresh')}}</el-button>
          </el-button-group>
          </div>
        </div>
        <FinanceTable :option="option1" @send-multi="sendMulti"/>
      </div>
    </div>
    <el-dialog
      :title="$t('OrderFee.log')"
      :visible.sync="logDialogVisible"
      :close-on-click-modal="false"
      width="800px">
      <FinanceTable
        :option="option5"/>
      <span slot="footer" class="dialog-footer">
        <el-button @click="logDialogVisible = false" size="mini">{{$t('OrderFee.close')}}</el-button>
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
        { label: this.$t('OrderFee.exportApproval'), value: 'audit' },
        { label: this.$t('OrderFee.exportProfitChanges'), value: 'profit' },
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
          sourceBizNo: { label: this.$t('OrderFee.sourceBizNo'), type: 'input', showType: '1' }, // '单号'
          // auditStatus: { label: '审核状态', type: 'select', prop: 'auditStatusNocancel', showType: '3' },
          finMon: { label: this.$t('OrderFee.finMon'), type: 'month', showType: '3', format: 'yyyy-MM' },
          finCloseStatus: { label: this.$t('OrderFee.closeStatus'), type: 'select', prop: 'yesNo', showType: '4' }, // '总关账状态'
          createdBy: { label: this.$t('OrderFee.createdName'), type: 'remoteSelect', remoteSelectList: [], // '申请人'
            remoteMethod: (name, item) => this.getEmployeeList(name, item),
            visibleChange: (name, item) => this.getEmployeeList(name, item),
          },
          bdEmployeeId: { label: this.$t('OrderFee.salesperson'), type: 'remoteSelect', remoteSelectList: [], // '业务员'
            remoteMethod: (name, item) => this.getEmployeeList(name, item),
            visibleChange: (name, item) => this.getEmployeeList(name, item),
          },
          applyPersonId: { label: this.$t('OrderFee.applyPerson'), type: 'remoteSelect', remoteSelectList: [], // '实际责任人'
            remoteMethod: (name, item) => {
              this.getEmployeeList(name, item)
              setTimeout(() => {
                if (!item.remoteSelectList.find(item => item.value === 'other1')) {
                  item.remoteSelectList = item.remoteSelectList.concat([
                    {
                      label: this.$t('OrderFee.customer'), // '客户',
                      value: 'other1'
                    },
                    {
                      label: this.$t('OrderFee.bookAgent'), // '订舱代理',
                      value: 'other2'
                    },
                    {
                      label: this.$t('OrderFee.supplier'), // '供应商',
                      value: 'other3'
                    },
                    {
                      label: this.$t('OrderFee.foreignAgent'), // '国外代理',
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
                      label: this.$t('OrderFee.customer'), // '客户',
                      value: 'other1'
                    },
                    {
                      label: this.$t('OrderFee.bookAgent'), // '订舱代理',
                      value: 'other2'
                    },
                    {
                      label: this.$t('OrderFee.supplier'), // '供应商',
                      value: 'other3'
                    },
                    {
                      label: this.$t('OrderFee.foreignAgent'), // '国外代理',
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
          bizAuditBy: { label: this.$t('OrderFee.auditor'), type: 'remoteSelect', remoteSelectList: [], // '审核人'
            remoteMethod: (name, item) => this.getEmployeeList(name, item),
            visibleChange: (name, item) => this.getEmployeeList(name, item),
          },
          createdTime: { label: this.$t('OrderFee.createdTime'), type: 'daterange', format: 'yyyy-MM-dd', ranges:['startDate', 'endDate'] },
          bizAuditTime: { label: this.$t('OrderFee.auditTime'), type: 'daterange', format: 'yyyy-MM-dd', ranges:['beginAuditTime', 'endAuditTime'] }, // '审核时间'
          reason: { label: this.$t('OrderFee.adjustReason'), type: 'select', prop: 'feeAdjustReason' },
          bizDate: { label: this.$t('OrderFee.bizDate'), type: 'daterange', format: 'yyyy-MM-dd', ranges:['startBizDate', 'endBizDate'] },
          settleCompCode: {
            label: this.$t('OrderFee.settleCompName'),
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
          label: this.$t('OrderFee.detail'), // '详情',
          type: 'text',
          // show: true,
          // showFn: () => this.checkAuth(this.$route.name, 'tab-modifyFeeList', 'btn-showDetail'),
          showFn: () => this.checkAuth('FeeClosedModifyFeeDetail'),
          action: 'showDetail'
        },
        {
          label: this.$t('OrderFee.log'), // '日志',
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
        label: this.$t('OrderFee.settleCompName'), // '分公司',
        type: 'text',
        width: 160
      },
      {
        prop: 'sourceBizNo', // orderNo
        label: this.$t('OrderFee.sourceBizNo'), // '单号',
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
        label: this.$t('OrderFee.bizDate'), // '业务日期',
        type: 'text',
        width: 120
      },
      {
        prop: 'reason',
        label: this.$t('OrderFee.adjustReason'), // '调费原因',
        type: 'select',
        propInDict: 'feeAdjustReason',
        width: 120
      },
      {
        prop: 'content',
        label: this.$t('OrderFee.adjustContent'), // '调费内容',
        type: 'text',
        width: 200,
      },
      {
        prop: 'remark',
        label: this.$t('OrderFee.adjustRemark'), // '调费备注',
        type: 'text',
        width: 120
      },
      {
        prop: 'finMon',
        label: this.$t('OrderFee.finMon'), // '财务月份',
        type: 'text',
        width: 120
      },
      {
        prop: 'finCloseStatus',
        label: this.$t('OrderFee.closeStatus'), // '总关账状态',
        type: 'select',
        propInDict: 'yesNo',
        formatter: ({ cellValue }) => { return cellValue === 'yes' ? `<span style="color:#CD4130;">${this.$t('OrderFee.yes')}</span>` : cellValue === 'no' ? `<span style="color:#33B18A;">${this.$t('OrderFee.no')}</span>` : cellValue },
        width: 120
      },
      {
        prop: 'dutyPerson', // applyPersonName
        label: this.$t('OrderFee.applyPerson'), // '实际责任人',
        type: 'text',
        width: 120
      },
      {
        prop: 'bizAuditStatus',
        label: this.$t('OrderFee.auditStatus'), // '审核状态',
        type: 'select',
        propInDict: 'auditStatus',
        width: 120
      },
      {
        prop: 'bizAuditName',
        label: this.$t('OrderFee.currAuditor'), // '当前审核人',
        type: 'text',
        width: 120
      },
      {
        prop: 'bizAuditTime',
        label: this.$t('OrderFee.auditTime'), // '审核时间',
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
        label: this.$t('OrderFee.salesperson'), // '业务员',
        type: 'text',
        width: 120
      },
      {
        prop: 'createdName',
        label: this.$t('OrderFee.createdName'), // '申请人',
        type: 'text',
        width: 120
      },
      {
        prop: 'createdTime',
        label: this.$t('OrderFee.createdTime'), // '申请时间',
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
        show: true,
        title: this.$t('OrderFee.index')
      },
      colorColumns: ['auditStatus']
    })
  },
  // activated() {
  //   // if (this.$route.query.tabFromOther) {
  //   //   this.$nextTick(() => {
  //   //     this.$nextTick(() => {
  //   //       this.$router.push({ name: 'FeeClosedModifyFeeList' })
	// 	// 		})
  //   //   })
  //   // }
  // },
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
              label: this.$t('OrderFee.auditor'), // '审核人',
              type: 'text',
              width: 120
            },
            {
              prop: 'approverDesc',
              label: this.$t('OrderFee.auditorRole'), // '审核人角色',
              type: 'text',
              width: 120,
            },
            {
              prop: 'approveEndTime',
              label: this.$t('OrderFee.auditTime'), // '审核时间',
              type: 'text',
              width: 120
            },
            {
              prop: 'approvalResult',
              label: this.$t('OrderFee.auditStatus'), // '审核状态',
              type: 'select',
              width: 100,
              propInDict: 'auditStatus'
            },
            {
              prop: 'approvalComments',
              label: this.$t('OrderFee.auditComment'), // '审核说明',
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
          this.aTagClick(window.URL.createObjectURL(res), `${this.$t('OrderFee.profitChangesList')}.xlsx`)
        })
        return
      }
			this.$confirm(this.$t('OrderFee.confirmTip') + this.$t('OrderFee.enspace') + this.$t('OrderFee.exportApprovalList'), this.$t('OrderFee.tip'), { // '是否确认导出费用审批列表?'
        showCancelButton: true,
				confirmButtonText: this.$t('OrderFee.confirm'),
				cancelButtonText: this.$t('OrderFee.cancel'),
				lockScroll: "true",
				type: "warning",
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = `${this.$t('OrderFee.processing')}...`;
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
                  link.download = `${this.$t('OrderFee.feesApprovalList')}.xlsx`
                  link.click()
                  done();
                  instance.confirmButtonLoading = false;
                }).catch(() => {
                  this.option1.loading = false
                  this.$message({ message: this.$t('OrderFee.exportFailed'), type: 'error' })
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