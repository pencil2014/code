<template>
  <div
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="finance-list-container">
      <!-- finance-seabill-cnt -->
      <div class="money-box" style="background-color: #fff;">
        <div class="money-box-left">
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-derateList', 'btn-auditPass')"
              class="finance-btn"
              @click="auditFn('pass')"
              size="mini"
              type="success"
            >审核通过</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-derateList', 'btn-auditReject')"
              class="finance-btn"
              @click="auditFn('reject')"
              size="mini"
              type="danger"
            >审核拒绝</el-button>
          </el-button-group>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTableMass :option="option1" @send-multi="sendMulti" />
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{ key: 'prop', label: 'label' }"
        @close="customColumnsPopClose"
      />
    </div>
    <ResultDialog :option="resultDialogOption" @close="resultDialogOption.show = false">
      <div class="result-dialog-descript" slot="descript">
        <span v-for="item in settleOrderNos.split(',')" :key="item">{{item}}</span>
      </div>
    </ResultDialog>
    <!-- <el-dialog :visible.sync="rejectDialogVisible" title="审批拒绝原因" width="600px">

      <span class="dialog-footer" slot="footer">
        <el-button :loading="btnLoading" @click="auditReject" size="mini" type="primary">确定</el-button>
        <el-button @click="closeRejectDialog" size="mini">取消</el-button>
      </span>
    </el-dialog> -->
    <ConfirmDialog :option="confirmOption" @close="sureConfirm">
      <el-form v-if="auditStatus === 'reject'" :model="rejectForm" label-width="122px" ref="rejectForm">
        <el-form-item
          :rules="{required: true, message: ' ', trigger: 'blur'}"
          label="拒绝原因："
          prop="refuseReason"
        >
          <el-input type="textarea" v-model="rejectForm.refuseReason"
            maxlength="512"
					  show-word-limit 
            autosize
            placeholder="请输入拒绝原因"></el-input>
        </el-form-item>
      </el-form>
    </ConfirmDialog>
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/components/customColumns/index'
import ConfirmDialog from '@/views/finance/components/financeDialog/confirmDialog.vue'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { listDeductionApplyPage } from '@/api/fin/custOverduePayment'
import { dateFormat } from '@/views/finance/utils/finance'
import { deductionApplyAudit } from '@/api/fin/custOverduePayment'
export default {
  mixins: [mixin, mixin2, routerMixin],
  data() {
    return {
      pageSizeUrl: listDeductionApplyPage('geturl'),
      keyDownActive: true,
      searchOption: {},
      option1: {},
      multipleSelection1: [],
      resultDialogOption: {
        show: false,
        title: '生成成功',
        resultType: 'success',
        text_cancel: '关闭',
        titleText: '生成多个结算单成功！',
      },
      settleOrderNos: '',
      auditStatus: '',
      confirmOption: {
        show: false,
        title: '滞纳金减免确认',
        titleText: '您是否确认该滞纳金的处理方式？',
        formList: [],
        labelWidth: '122',
        btnLoading: false,
        btnType: '',
      },
      selfColumnsBase: [
        {
          disabled: true,
          prop: 'deductionApplyNo',
          label: '减免申请编号',
          width: '130px',
          type: 'button',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              this.showDetail(row)
            },
          },
          sortable: true,
        },
        {
          prop: 'settleCompName',
          label: '分公司',
          type: 'text',
          width: 140,
          sortable: false,
        },
        {
          prop: 'settleCorpName',
          label: '结算单位',
          type: 'text',
          width: 140,
          sortable: true,
        },
        {
          prop: 'custOverduePaymentNo',
          label: '滞纳金编号',
          width: '130px',
          type: 'button',
          sortable: true,
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              this.showLateFeeDetail(row)
            },
          },
        },
        {
          prop: 'currency',
          label: '币种',
          type: 'text',
          sortable: false,
        },
        {
          prop: 'lateFeeAmt',
          label: '实际滞纳金',
          type: 'text',
          width: 100,
          sortable: true,
        },
        {
          prop: 'deductionType',
          label: '减免类型',
          type: 'select',
          width: 100,
          propInDict: 'custOverduePaymentDeductionType',
          sortable: false,
        },
        {
          prop: 'deductionAmt',
          label: '减免申请金额',
          type: 'text',
          width: 100,
          sortable: true,
        },
        {
          prop: 'deductionRemark',
          label: '减免原因',
          type: 'text',
          width: 100,
          sortable: false,
        },
        {
          prop: 'assumerType',
          label: '剩余滞纳金承担类型',
          type: 'select',
          width: 130,
          propInDict: 'custOverduePaymentAssumerType',
          sortable: false,
        },
        {
          prop: 'customerAssumerAmt',
          label: '客户承担金额',
          type: 'text',
          width: 100,
          sortable: true,
        },
        {
          prop: 'orderAssumerAmt',
          label: '订单承担金额',
          type: 'text',
          width: 110,
          sortable: true,
        },
        {
          prop: 'auditStatus',
          label: '审核状态',
          type: 'select',
          width: 110,
          sortable: false,
        },
        {
          prop: 'createdName',
          label: '申请人',
          type: 'text',
          sortable: false,
        },
        {
          prop: 'createdTime',
          label: '申请时间',
          type: 'text',
          width: 120,
          sortable: true,
        },
        {
          prop: 'auditName',
          label: '审核人',
          type: 'text',
          sortable: false,
        },
        {
          prop: 'auditTime',
          label: '审核时间',
          type: 'text',
          width: 120,
          sortable: true,
        },
        {
          prop: 'auditRemark',
          label: '拒绝原因',
          type: 'text',
          width: 160,
          sortable: false,
        },
      ],
      rejectDialogVisible: false,
      rejectForm: {
        refuseReason: '',
      },
    }
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    CustomColumns,
    ConfirmDialog,
  },
  // activated() {
  //   !this.isFirstGetData && this.getData()
  // },
  created() {
    let searchArr = ['deductionApplyNo', 'settleCompCode', 'settleCorpCode']
    this.searchOption = {
      saveDefault: true,
      saveName: 'derateList',
      isNotAutoLoad: true,
      addFilter: {
        defaultSearchLength: 5,
        searchInputGroup: searchArr.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          deductionApplyNo: { label: '减免申请编号', type: 'input' },
          custOverduePaymentNo: { label: '滞纳金编号', type: 'input' },
          currency: { label: '币种', type: 'select', prop: 'currency' },
          deductionType: { label: '减免类型', type: 'select', prop: 'custOverduePaymentDeductionType' },
          assumerType: { label: '剩余滞纳金承担类型', type: 'select', prop: 'custOverduePaymentAssumerType' },
          auditStatus: { label: '审核状态', type: 'select', prop: 'auditStatus', multiple: true, },
          settleCompCode: {
            label: '分公司',
            prop: 'settleCorpCode',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
            remoteSelectList: [],
          },
          settleCorpCode: {
            label: '结算单位',
            type: 'remoteSelect',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item)
            },
            remoteSelectList: [],
          },
          createdBy: {
            label: '申请人',
            type: 'remoteSelect',
            multiple: true,
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          createdTime: { label: '申请时间', type: 'daterange', format: 'yyyy-MM-dd' },
          auditBy: {
            label: '审核人',
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList('', item),
          },
          auditTime: { label: '审核时间', type: 'daterange', format: 'yyyy-MM-dd' },
        },
      },
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: '详情',
          type: 'text',
          show: true, //待确认和不通过可以修改
          action: 'showDetail',
        },
      ],
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true,
      isNew: true,
    })
    this.option1 = Object.assign({}, this.option, {
      customColumns: {
        show: true,
        handleCustomColumns: () => {
          if (!this.isNotFirtGetData) {
            this.getData(false, true).then((res) => setTimeout(() => (this.customColumnsPopShow = true), 600))
          } else {
            this.customColumnsPopShow = true
          }
        },
      },
      id: 'option1',
      $name: 'derateList',
      data: [],
      tips: {
        text: '',
        show: false,
      },
      operationBtns,
      emptyText: '数据将在查询后显示',
      pagination,
      sortable: true,
      sortChange: (column, prop, order) => {
        this.sortParams = { prop, order }
        this.isSort = true
        this.getData()
    },
    })
    let columns = [...this.selfColumnsBase]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.option1.columns = columns
  },
  methods: {
    // 分页页面数量change   有分页必写此方法
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    // 分页改变当前页   有分页必写此方法
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    auditFn(status) {
      this.rejectForm.refuseReason = ''
      this.auditStatus = status
      const len = this.multipleSelection1.length
      if (len !== 1) {
        return this.$msgErrClose('请勾选1条需要审批的数据！')
      }
      let row = this.multipleSelection1[0]
      console.log(row);
      let { deductionType, assumerType, deductionAmt, customerAssumerAmt, orderAssumerAmt, currency, auditStatus, lateFeeAmt } = row
      // const auditStatus = this.multipleSelection1.some((item) => item.auditStatus !== 'pending' && item.auditStatus !== 'approving')
      if (auditStatus !== 'pending' && auditStatus !== 'approving') {
        return this.$msgErrClose('勾选的数据已经审核，请重新选择！')
      }
      this.confirmOption.formList = [
        {
          label: '减免类型',
          prop: 'deductionType',
          value: this.dictMapObj.custOverduePaymentDeductionType[deductionType],
        },
        { label: '实际滞纳金', prop: 'lateFeeAmt', value: lateFeeAmt + ' ' + currency, },
        { label: '减免金额', prop: 'deductionAmt', value: deductionAmt + ' ' + currency, },
        {
          label: '剩余金额承担类型',
          prop: 'assumerType',
          value: this.dictMapObj.custOverduePaymentAssumerType[assumerType],
          hide: !assumerType,
          isFull: assumerType === 'full',
        },
        { label: '客户承担金额', prop: 'customerAssumerAmt', value: customerAssumerAmt + ' ' + currency, hide: !assumerType || assumerType === 'order' },
        { label: '订单承担金额', prop: 'orderAssumerAmt', value: orderAssumerAmt + ' ' + currency, hide: !assumerType || deductionType === 'customer' },
      ]
      if (status === 'reject') {
        this.confirmOption.title = '审核拒绝'
        this.confirmOption.titleText = '您是否确认审核拒绝该申请？'
        this.confirmOption.btnType = 'danger'
      } else {
        this.confirmOption.title = '审核通过'
        this.confirmOption.titleText = '您是否确认审核通过该申请？'
        this.confirmOption.btnType = 'success'
      }
      this.confirmOption.show = true
    },
    sureConfirm(tag) {
      if (tag === true) {
        if(this.auditStatus === 'pass'){
          this.auditPass()
        }else{
          this.auditReject()
        }
      }
    },
    // 审批通过
    auditPass() {
      const deductionApplyNoList = this.multipleSelection1.map((item) => item.deductionApplyNo)
      this.confirmOption.btnLoading = true
      deductionApplyAudit({deductionApplyNoList, auditStatus: 'pass',})
        .then((res) => {
          this.getData()
          this.$msgSucClose('审批通过处理成功！')
          this.confirmOption.show = false
        })
        .finally(() => this.confirmOption.btnLoading = false )
    },
    // 审批拒绝
    auditReject() {
      this.$refs['rejectForm'].validate((valid) => {
        if (valid) {
          const deductionApplyNoList = this.multipleSelection1.map((item) => item.deductionApplyNo)
          const data = {
            deductionApplyNoList,
            auditStatus: 'refuse',
            auditRemark: this.rejectForm.refuseReason,
          }
          this.confirmOption.btnLoading = true
          deductionApplyAudit(data)
            .then((res) => {
              this.getData()
              this.$msgSucClose('审批拒绝处理成功！')
              this.$refs.rejectForm.resetFields()
              this.$nextTick(() => this.confirmOption.show = false)
            })
            .finally(() => this.confirmOption.btnLoading = false )
        }
      })
    },
    // 关闭拒绝弹窗
    closeRejectDialog() {
      this.rejectDialogVisible = false
      this.$refs.rejectForm.resetFields()
    },
    getData(isSearch, customerList) {
      this.isNotFirtGetData = true
      this.lsLoading = true
      let { prop, order } = this.sortParams
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: customerList ? 0 : this.option1.pagination.pageSize,
        columns: [],
        query: [],
        ascColumns: order === 'ascending' ? [prop] : [],
        descColumns: order === 'descending' ? [prop] :[],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption, true, true)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (this.buttonSearch) {
        data.query.push({ column: 'confirmStatus', type: 'eq', value: this.buttonSearch })
      }
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      return listDeductionApplyPage(data)
        .then((res) => {
          if (res.code === 0) {
            this.finCommonColumns(res)
            if (customerList) return
            // if (res.data.configColumns && res.data.configColumns.length) {
            // 	let columns = res.data.configColumns
            // 	this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
            // 	this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
            // 	this.configColumns = res.data.configColumns
            // }
            this.option1.data = res.data.list || []
            this.$set(this.option1, 'emptyText', '未查询到任何数据')
            Object.assign(this.option1.pagination, res.data)
            // this.option1.pagination.currPage = res.data.currPage
            // this.option1.pagination.pageSize = res.data.pageSize
            // this.option1.pagination.totalCount = res.data.totalCount
          }
        })
        .finally(() => {
          this.lsLoading = false
        })
    },
    //导出按钮
    handleExport(params, isSearch) {
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        columns: [],
        ascColumns: params && params.order === 'ascending' ? [params.prop] : [],
        descColumns: params && params.order === 'descending' ? [params.prop] : ['settleDate'],
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.searchOption.addFilter.searchInputGroup.forEach((item) => {
        let { key, value, range, req, valueReq } = item
        if (!value) return
        if (typeof value !== 'object') {
          if (valueReq && item[valueReq]) {
            data.query.push({
              column: valueReq,
              type: 'eq',
              value: item[valueReq],
            })
            console.log(item[valueReq])
          }
          return data.query.push({
            column: key,
            type: 'eq',
            value: req || value,
          })
        }
        if (key === 'recvCorpCode' || key === 'payStatus' || key === 'status') {
          if (!value.length) return
          data.query.push({
            column: key,
            type: 'eq',
            value: value.join(','),
          })
        } else {
          data.query.push({
            column: key + 'Start',
            type: 'eq',
            value: dateFormat('yyyy-mm-dd', value[0]),
          })
          data.query.push({
            column: key + 'End',
            type: 'eq',
            value: dateFormat('yyyy-mm-dd', value[1]),
          })
        }
      })
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (this.buttonSearch) {
        data.query.push({ column: 'confirmStatus', type: 'eq', value: this.buttonSearch })
      }
      if (this.multipleSelection1.length) {
        data.query = [{ column: 'fiscalTermNo', type: 'in', value: this.multipleSelection1.map((v) => v.fiscalTermNo).join(',') }]
      }
      //查询对象的配置编码
      data.query.push({ column: 'queryDataModuleCode', value: 'fiscalTermListExport' })

      this.$confirm('是否确认导出应收账单列表?', '导出应收账单列表', {
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
              this.option1.loading = true
              this.$store
                .dispatch('finance/downloadBlobFilePost', {
                  uri: '/fin/common/queryDataExportExcel',
                  data: { data },
                })
                .then((res) => {
                  this.option1.loading = false
                  console.log(res)
                  let link = document.createElement('a')
                  link.href = window.URL.createObjectURL(res)
                  link.download = '应收账单列表.xlsx'
                  link.click()
                  done()
                  instance.confirmButtonLoading = false
                })
                .catch(() => {
                  this.option1.loading = false
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
    search(data, index) {
      this.buttonSearch = data
      this.option1.pagination.currPage = 1
      this.getData(true)
      if (index || index === 0) {
        this.rightFilterBtns = [false, false, false]
        this.rightFilterBtns[index] = true
      }
    },
    sendMulti(data) {
      this.multipleSelection1 = data
      let data2 = {
        ascColumns: [],
        descColumns: [],
        query: [],
      }
      let ids = this.multipleSelection1
        .map((item) => {
          return item.invoicePaymentId
        })
        .join(',')
      if (ids) {
        data2.query.push({
          column: 'invoicePaymentIds',
          type: 'eq',
          value: ids,
        })
      } else {
        data2.query = this.searchBackup || []
      }
      // this.debounceLs(() => {
      //     this.getListAmtSummary(data2)
      // })
    },
    showDetail({ deductionApplyNo }) {
      this.routerPushTab('DerateDetail', {
        deductionApplyNo
      })
    },
    showLateFeeDetail(row) {
      this.routerPushTab('LateFeeDetail', {
        custOverduePaymentNo: row.custOverduePaymentNo,
      })
    },
  },
}
</script>