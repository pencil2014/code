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
            <el-button v-if="checkAuth($route.name, 'tab-specFeeMngApplyList', 'btn-preSubmitPass')" @click="preSubmit('pass')" size="mini" type="success">审核通过</el-button>
            <el-button v-if="checkAuth($route.name, 'tab-specFeeMngApplyList', 'btn-preSubmitRefuse')" @click="preSubmit('refuse')" size="mini" type="danger">审核拒绝</el-button>
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
        <FinanceTable
          :option="option1"
          @send-multi="sendMulti"/>
      </div>
    </div>
    <el-dialog :title="'拒绝费用调整'" :visible.sync="rejectDialogVisible" width="600px">
      <el-form :model="form" ref="form" label-width="80px">
        <el-form-item
          label="拒绝原因"
          prop="auditRemark"
          :rules="{required: true, message: '拒绝原因不能为空', trigger: 'blur'}"
        >
          <el-input
            type="textarea"
            v-model="form.auditRemark"
            maxlength="500">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="rejectSubmit" size="mini">确定</el-button>
        <el-button @click="rejectDialogVisible = false" size="mini">取消</el-button>
      </span>
    </el-dialog>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        @close="customColumnsPopClose" />
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/components/customColumns/index'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { feeAdjustList } from '@/api/fin/feeAdjust'
import { specFeeMngApplyList, applyAudit } from '@/api/fin/specfee'
import { dateFormat } from '@/views/finance/utils/finance.js'
export default {
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      keyDownActive: true,
      option1: {},
      searchOption1: {},
      multipleSelection1: [],
      form: {
        auditRemark: '',
      },
      orderNo: '',
      feeAdjustApplyId: 0,
      loading: false,
      rejectDialogVisible: false,
      defaultColumns: [],
    }
  },
  created() {
    this.searchOption1 = {
      saveName: 'specFeeMngApplyList',
      saveDefault: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 3,
        searchInputGroup: [
          { key: 'sourceBizNo', value: '', showType: '1' },
          { key: 'createdTime', value: '', showType: '2' },
          { key: 'auditStatus', value: '', showType: '3' },
        ],
        filterGroups: {
          sourceBizNo: { label: '单号', type: 'input', showType: '1' },
          createdTime: { label: '申请日期范围', type: 'daterange', showType: '2' },
          auditStatus: { label: '审核状态', type: 'select', prop: 'auditStatusNocancel', showType: '3' },
        }
      },
    }
    let operationBtns = Object.assign(this.option.operationBtns, {
      // data: [
      //   {
      //     label: '详情',
      //     type: 'text',
      //     // show: true,
      //     showFn: () => this.checkAuth(this.$route.name, 'btn-showDetail'),
      //     action: 'showDetail',
      //   },
      // ],
      show: false
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true,
      isNew: true,
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'FeeClosedModifyFeeList',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      operationBtns,
      pagination,
      customColumns: {
        show: true,
        handleCustomColumns: this.handleCustomColumns
      },
    })
    this.selfColumnsBase = this.columnsBaseLocal = [ // let columns = 
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
        prop: 'settleCompName',
        label: '分公司',
        type: 'text',
        width: 160
      },
      {
        prop: 'remark',
        label: '申请原因',
        type: 'text',
        width: 120
      },
      {
        prop: 'bizAuditStatus',
        label: '审核状态',
        type: 'select',
        propInDict: 'auditStatus',
      },
      {
        prop: 'bizAuditName',
        label: '审核人',
        type: 'text',
      },
      {
        prop: 'bizAuditTime',
        label: '审核时间',
        type: 'text',
        width: 130
      },
      {
        prop: 'bizAuditRemark',
        label: '拒绝原因',
        type: 'text',
        width: 160,
      },
      // {
      //   prop: 'feeNameMngApply',
      //   label: '费用名称',
      //   type: 'text',
      // },
      {
        prop: 'specContent',
        label: '费用名称金额',
        type: 'text',
        width: 200
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
        width: 130
      },
    ]
    this.defaultColumns = this.selfColumnsBase.map(item => item.prop)
    // this.option1.columns = columns
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
        columns: [],
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
				data.columns = this.customColumnsKeys
			}
      this.searchOption1.addFilter.searchInputGroup.forEach(item => {
        let { key, value } = item
        if (value && value !== '') {
          if (key === 'createdTime') {
            data.query.push({
              column: 'startDate',
              type: 'default',
              value: dateFormat('yyyy-mm-dd', value[0]) + ' 00:00:00',
            })
            data.query.push({
              column: 'endDate',
              type: 'default',
              value: dateFormat('yyyy-mm-dd', value[1]) + ' 23:59:59',
            })
          } else {
            data.query.push({
              column: key,
              type: 'default',
              value: value,
            })
          }
        }
      })
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      this.loading = true
      specFeeMngApplyList(data).then((res) => {
        if (res.code === 0) {
          let { configColumns } = res.data
          this.columns = configColumns.length ? configColumns : this.defaultColumns
          let arr = []
          this.columns.forEach(column => {
            let obj = this.selfColumnsBase.find(item => {
              return item.prop === column
            })
            if (obj) {
              arr.push(obj)
            }
          })
          this.option1.columns = arr
          // res.data.list.forEach(item => {
          //   item.feeNameMngApply = '装车拼箱费'
          // })
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
    preSubmit(type) {
      if (!this.multipleSelection1.length) {
        return this.$message({
          type: 'error',
          message: '须选择专项审批的记录',
          showClose: true,
        })
      }
      if (this.multipleSelection1.length > 1) {
        return this.$message({
          type: 'error',
          message: '不支持批量审核',
          showClose: true,
        })
      }
      if (type === 'pass') {
        this.$confirm('是否确认审批通过？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        .then(() => {
          this.adjustAudit('pass')
        })
        .catch(() => {})
      } else if (type === 'refuse') {
        this.form.auditRemark=''
        this.rejectDialogVisible = true
      }
    },
    rejectSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.adjustAudit('refuse')
        }
      })
    },
    adjustAudit(auditStatus) {
      let data = {
        sourceBizNo: this.multipleSelection1[0].sourceBizNo,
        feeAdjustApplyId: this.multipleSelection1[0].feeAdjustApplyId,
        auditStatus: auditStatus,
        auditRemark: this.form.auditRemark,
      }
      applyAudit(data).then((res) => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: '提交成功!',
            showClose: true,
          })
          this.rejectDialogVisible = false
          this.getData()
          // this.delVisitedView(this.$route)
          // this.closeDetail(true)
        }
      })
    },
    sendMulti(data, option) {
      // console.log(data, option)
      if (option === this.option1) this.multipleSelection1 = data
    },
    showDetail({ sourceBizNo, sourceType, feeAdjustApplyId }) {
      this.routerPush('FeeClosedModifyFeeDetail', { sourceBizNo, sourceType, feeAdjustApplyId })
    },
  },
  components: {
    FinanceTable,
    FinanceSearch,
    CustomColumns
  },
}
</script>
<style>
</style>