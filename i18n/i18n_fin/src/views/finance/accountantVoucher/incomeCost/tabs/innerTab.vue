<template>
  <div
    class="finance-list-container"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="money-box">
      <div>
        <el-button
          v-if="checkAuth($route.name, 'tab-incomeCostInner', 'btn-voucherPreview')"
          class="finance-btn"
          @click="generateVoucher(true)"
          size="mini"
        >{{$t('PayApplyList.previewVoucher')}}</el-button>
        <el-button
          v-if="checkAuth($route.name, 'tab-incomeCostInner', 'btn-voucherCreate')"
          class="finance-btn"
          size="mini"
          @click="multiApply"
        >{{$t('PreClose.genVouchers')}}</el-button>
        <el-button
          v-if="checkAuth($route.name, 'tab-incomeCostInner', 'btn-voucherDel')"
          class="finance-btn"
          size="mini"
          @click="multiDel"
          type="danger"
        >{{$t('Common.deleteVoucher')}}</el-button>
      </div>
      <div class="money-box-right">
        <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
      </div>
    </div>
    <div class="finance-list-container">
      <FinanceTable :option="tableOption" @send-multi="sendMulti" />
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{key:'prop',label:'label'}"
        @close="customColumnsPopClose"
      />
    </div>
    <!-- :showDel="checkAuth($route.name, 'tab-preClose3', 'btn-voucherDel')"
    :showCreate="checkAuth($route.name, 'tab-preClose3', 'btn-voucherCreate')"-->
    <PreviewDialog
      ref="PreviewDialog"
      :dialogOption="previewDialog"
      @close="dialogClose('previewDialog')"
      :showDel="true"
      :showCreate="true"
      @generate="(type, isAll) => generateVoucher('PreviewDialog', type, isAll)"
    />
    <el-dialog
      :title="dialogForcePrecloseTitle"
      :visible.sync="dialogShowForcePreclose"
      width="400px"
      @close="dialogShowForcePreclose = false"
    >
      <el-form
        :model="forcePrecloseForm"
        ref="forcePrecloseForm"
        label-width="100px"
        :inline="false"
        size="small"
        style="padding-top: 16px"
      >
        <el-form-item :label="$t('FeeList.settleComp')" prop="settleCompName">
          <el-input style="width:250px" v-model="forcePrecloseForm.settleCompName" disabled></el-input>
        </el-form-item>
        <el-form-item
          :label="$t('OrderFee.finMon')"
          prop="finMon"
          :rules="{message: ' ', required: true, triggers: 'change,blur'}"
        >
          <el-date-picker
            style="width:250px"
            v-model="forcePrecloseForm.finMon"
            type="month"
            value-format="yyyy-MM"
            :placeholder="$t('Common.plSelect')"
            :pickerOptions="{disabledDate:(nowDate)=>+new Date() - nowDate <= 0}"
            :clearable="true"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :disabled="lsLoading" type="primary" size="mini" @click="forcePrecloseSubmit">{{$t('Common.sure')}}</el-button>
        <el-button :disabled="lsLoading" @click="dialogShowForcePreclose = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { mixin as voucherMixin } from '@/views/finance/voucher/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { batchDeleteShiftVoucher, exVoucherDelete } from '@/api/fin/voucher'
import API from '@/api/fin/finClose'
import { mapState } from 'vuex'
import { listByRole } from '@/api/base'
import { departmentTreeList } from '@/api/companyResource'
import CustomColumns from '@/components/customColumns/index'
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'

export default {
  name: 'incomeCostInner',
  label: '运营转字',
  mixins: [mixin, mixin2, voucherMixin, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    CustomColumns,
    PreviewDialog,
  },
  inject: ['tabRefresh'],
  activated() {
    // 首次进入直接返回，会由搜索组件触发搜索
    if (!this.isFirstActivated) {
      this.isFirstActivated = true
      return
    }
    if (this.tabRefresh.pre) {
      this.tabRefresh.pre = false
      console.log(111)
      this.handleCurrentChange(1)
    }
  },
  data() {
    return {
      keyDownActive: true,
      searchOption: {},
      tableOption: {},
      previewDialog: {
        show: false,
        title: this.$t('Common.previewVoucher'),
        seqNo: '',
        showData: '',
      },
      dialogForcePrecloseTitle: '',
      dialogShowForcePreclose: false,
      forcePrecloseForm: {
        settleCompName: '',
        settleCompCode: '',
        finMon: '',
      },
      multipleSelection: [],
      pageSizeUrl: API.preclosingList('geturl'),
    }
  },
  watch: {
    'previewDialog.show'(val) {
      !val && this.previewDialog._refresh && this.getData()
      this.previewDialog._refresh = false
    },
  },
  computed: {
    ...mapState({
      finance: (state) => state.finance,
      userInfo: (state) => state.user.userInfo,
    }),
  },
  created() {
    // 搜索配置
    let searchInputGroup = ['bizNo', 'settleCompCode', 'finMon', 'voucherNo']
    this.searchOption = {
      saveDefault: true,
      saveName: 'incomeCostInnerList',
      listHeightFunc: this.computeFinTableHeight,
      isNotAutoLoad: true,
      addFilter: {
        defaultSearchLength: searchInputGroup.length,
        searchInputGroup: searchInputGroup.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          bizNo: { label: this.$t('PreClose.bizNo'), type: 'input' },
          settleCompCode: {
            label: this.$t('FeeList.settleComp'),
            prop: 'settleCorpCode',
            type: 'remoteSelect',
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            remoteSelectList: [],
          },
          finMon: { label: '财务月份', type: 'month', format: 'yyyy-MM' },
          // planCloseDate: {
          //   label: '预计预关账时间',
          //   type: 'daterange',
          //   format: 'yyyy-MM-dd',
          //   keys: ['fromPlanCloseDate', 'toPlanCloseDate'],
          // },
          voucherNo: { label: this.$t('Hedge.voucherNumber'), type: 'input' },
          needShiftAccount: { label: '需要生成凭证', prop: 'yesNo', type: 'select' },
          voucherStatus: { label: this.$t('Hedge.voucherStatus'), type: 'select', prop: 'voucherStatus' },
          // sysLineCode: {
          //   label: '航线',
          //   type: 'remoteSelect',
          //   clearable: true,
          //   remoteSelectList: [],
          //   remoteMethod: (queryString, item) => this.baseSystemLineList(queryString, item),
          //   visibleChange: (queryString, item) => this.baseSystemLineList(queryString, item),
          // },
        },
      },
    }
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.tableOption = {
      ...this.option,
      id: 'option1',
      $name: 'PreCloseSuccessTab',
      pagination,
      needTimeSort: true,
      customColumns: {
        show: true,
        handleCustomColumns: this.handleCustomColumns,
      },
      emptyText: this.$t('Common.emptyText'),
      colorColumns: ['voucherStatus'],
    }

    this.tableOption.operationBtns.show = false
    // this.tableOption.selection.show = false
    this.selfColumnsBase = [
      // let columns
      {
        prop: 'billNo',
        label: this.$t('PreClose.bizNo'),
        width: '160px',
        type: 'button',
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.showDetail(row)
          },
        },
      },
      { prop: 'settleCompName', label: this.$t('FeeList.settleComp'), minWidth: 130 },
      { prop: 'finMon', width: 100, label: '财务月份' },
      { prop: 'bizDate', label: '业务日期', minWidth: 130 },
      { prop: 'planCloseDate', label: '预计预关账时间', minWidth: 130 },
      { prop: 'createdTime', label: '实际预关账时间', minWidth: 130 },
      {
        prop: 'closeStatus',
        label: '预关账状态',
        width: 100,
        formatter: ({ row }) => (row.closeStatus == 'yes' ? '预关账成功' : ''),
      },
      {
        prop: 'delayDays',
        label: '超预关账天数',
        type: 'text',
        minWidth: 90,
        formatter: ({ row }) => {
          let t1 = row.createdTime
          let t2 = row.planCloseDate
          if (!t1 || !t2) {
            return ''
          } else {
            t1 = new Date(t1.split(' ')[0].replace('-', '/') + ' 00:00:00')
            t2 = new Date(t2.replace('-', '/') + ' 00:00:00')
            return (t1.getTime() - t2.getTime()) / (24 * 3600 * 1000)
          }
        },
      },
      {
        prop: 'feeFromDate',
        label: '关账时间段',
        width: 180,
        formatter: ({ row }) => row.feeFromDate + ' ~ ' + row.feeToDate,
      },
      { prop: 'needShiftAccount', label: '需要生成凭证', propInDict: 'yesNo', type: 'select', width: 100 },
      { prop: 'voucherStatus', label: this.$t('Hedge.voucherStatus'), type: 'select', width: 130, propInDict: 'voucherStatus' },
      {
        prop: 'voucherNo',
        label: this.$t('Hedge.voucherNumber'),
        width: 80,
        type: 'button',
        operationBtns: {
          show: true,
          callback: (fn, index, row, option) => {
            this.initShowVoucher(this.previewDialog, row.acctVoucherSeqno, '', '')
          },
        },
      },
      { prop: 'voucherErrormsg', label: '凭证失败原因', minWidth: 130 },
      { prop: 'voucherSuccessTime', label: '凭证生成时间', width: 130 },
      { prop: 'sysLineName', width: 130, label: '航线' },
    ]
    this.tableOption.columns = [...this.selfColumnsBase] // columns
    this.columns.push(...this.selfColumnsBase.map((item) => item.prop).filter((v) => v))
    this.optionMaxHeight = this.tableOption
    // this.getData()
  },
  methods: {
    getData(isSearch) {
      if (this.debounceLsFn()) return
      this.lsLoading = true
      let data = this.convertSearch(this.tableOption, this.searchOption)
      data.columns = this.customColumnsKeys
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      API.preclosingList(data)
        .then((res) => {
          this.$set(this.tableOption, 'emptyText', '未查询到任何数据')
          let { configColumns } = res.data
          this.columns = configColumns.length > 0 ? configColumns : this.selfColumnsBase.map((item) => item.prop)
          this.columns = [...this.columns]
          this.tableOption.columns = this.columns
            .map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
            .filter((v) => v)
          this.tableOption.data = res.data.list || []
          Object.assign(this.tableOption.pagination, res.data)
          // this.tableOption.pagination.currPage = res.data.currPage
          // this.tableOption.pagination.pageSize = res.data.pageSize
          // this.tableOption.pagination.totalCount = res.data.totalCount
        })
        .finally(() => {
          this.lsLoading = false
        })
    },

    // 跳转至详情页
    showDetail(row) {
      if (!row.billNo) {
        return this.$message.error(this.$t('PreClose.jobNoTips'))
      }
      this.showOneNoDetail('sourceBizNo', row.billNo, { isTab: true })
    },
    // 获取销售
    getSellers(name = '', item, role) {
      let query = [{ column: 'roleCode', type: 'eq', value: role }] // column: 'roleCode', type: 'in', value: 'bd,obd'
      name && query.push({ column: 'name', type: 'eq', value: name })
      listByRole({ currPage: 1, pageSize: 30, query }).then(({ data: { list } }) => {
        list = list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId }))
        if (this.remoteSelectCommon(item, list)) return
        item.remoteSelectList = list
      })
    },
    // 预览凭证
    generateVoucher(type, type2, isAll) {
      if (type2 === 'refresh') {
        return this.getData()
      }
      if (type === 'PreviewDialog') {
        // let needShiftAccountSeqNos = this.multipleSelection.filter((v) => !v.acctVoucherSeqno && v.needShiftAccount == 'yes')
        let needShiftAccountSeqNos = this.multipleSelection.filter((v) => !v.acctVoucherSeqno)
        let finPreclosingIds = needShiftAccountSeqNos[this.$refs.PreviewDialog.currIndex - 1].finPreclosingId
        if (isAll === 'all') {
          finPreclosingIds = needShiftAccountSeqNos.map((v) => v.finPreclosingId).join(',')
        }
        console.log(this.$refs.PreviewDialog.currIndex - 1, finPreclosingIds, isAll)
        this.$confirmWarn('是否进行生成凭证？', () => {
          this.lsLoading = true
          this.$refs.PreviewDialog.lsLoading = false
          API.precloseGenerateVoucher({ finPreclosingIds, settleCompCode: this.userInfo.settleCompanyCode })
            .then((res) => {
              this.$msgSucClose('凭证已经处理！')
              // this.previewDialog.show = false
              // this.getData()
            })
            .finally(() => (this.lsLoading = false))
        })
        return
      }
      let selectRow = this.multipleSelection
      if (!selectRow.length) {
        return this.$msgErrClose(`请勾选需要预览凭证的项！`)
      }
      if ([...new Set(selectRow.map((v) => v.voucherStatus))].length === 2) {
        return this.$msgErrClose(`凭证状态为已生成和未生成的记录不能同时预览！`)
      }
      let seqNos = selectRow.map((v) => v.acctVoucherSeqno)
      // 未生成
      if (!seqNos[0]) {
        // let needShiftAccountSeqNos = selectRow.filter((v) => !v.acctVoucherSeqno && v.needShiftAccount == 'yes')
        let needShiftAccountSeqNos = selectRow.filter((v) => !v.acctVoucherSeqno)
        if (!needShiftAccountSeqNos.length) return this.$msgErrClose(`请选择是否生成凭证为是的记录！`)
        this.lsLoading = true
        API.precloseGenerateVoucher({
          finPreclosingIds: needShiftAccountSeqNos.map((v) => v.finPreclosingId).join(','),
          settleCompCode: this.userInfo.settleCompanyCode,
          preview: 'yes',
        })
          .then((res) => {
            if (!res.data || !res.data.length) {
              return this.$msgErrClose(this.$t('Hedge.genVouchersTips'))
            }
            this.previewDialog.showData = res.data
            this.previewDialog.seqNo = ''
            this.previewDialog.show = true
          })
          .finally(() => (this.lsLoading = false))
        return
      }
      // 已生成
      this.previewDialog.showData = ''
      this.previewDialog.seqNo = seqNos.join(',')
      this.previewDialog.show = true
    },
    multiApply() {
      if (!this.multipleSelection.length) {
        this.isDel = false
        this.dialogForcePrecloseTitle = '生成转字凭证'
        this.forcePrecloseForm.finMon = ''
        this.forcePrecloseForm.settleCompName = this.userInfo.settleCompanyName
        this.forcePrecloseForm.settleCompCode = this.userInfo.settleCompanyCode
        this.dialogShowForcePreclose = true
        this.$nextTick(() => this.$refs.forcePrecloseForm.clearValidate())
        return
      }
      let finPreclosingIds = this.multipleSelection.map((v) => v.finPreclosingId).join(',')
      this.$confirmWarn('是否进行生成转字凭证？', () => {
        this.lsLoading = true
        API.precloseGenerateVoucher({ finPreclosingIds, settleCompCode: this.userInfo.settleCompanyCode })
          .then((res) => {
            this.$msgSucClose('凭证已经处理！')
            this.getData()
          })
          .catch(() => (this.lsLoading = false))
      })
    },
    multiDel() {
      if (this.multipleSelection.length) {
        return this.delVoucher()
      }
      this.isDel = true
      this.dialogForcePrecloseTitle = '删除凭证'
      this.forcePrecloseForm.finMon = ''
      this.forcePrecloseForm.settleCompName = this.userInfo.settleCompanyName
      this.forcePrecloseForm.settleCompCode = this.userInfo.settleCompanyCode
      this.dialogShowForcePreclose = true
      this.$nextTick(() => this.$refs.forcePrecloseForm.clearValidate())
    },
    // 删除凭证
    delVoucher() {
      let selectRow = this.multipleSelection
      let arr = selectRow.filter((item) => item.voucherNo)
      if (!arr.length) {
        return this.$msgErrClose(this.$t('Hedge.generatedTips'))
      }
      let voucherNos = []
      let voucherSeqNos = []
      arr.forEach((val) => {
        voucherNos.push(val.voucherNo)
        voucherSeqNos.push(val.acctVoucherSeqno)
      })
      voucherNos = [...new Set(voucherNos)].filter((v) => v !== 'null')
      voucherSeqNos = [...new Set(voucherSeqNos)]
      // return console.log(voucherSeqNos);
      this.$confirmWarn(this.$t('Hedge.detailsTips', {voucherNos: voucherNos.join(',')}), () => {
        exVoucherDelete({ voucherSeqNos }).then((res) => {
         this.$msgErrClose(this.$t('Settle.deleteSuc'))
          this.getData()
        })
      })
    },
    forcePrecloseSubmit() {
      this.$refs.forcePrecloseForm.validate((res) => {
        if (res) {
          let method, str, strWarn
          method = this.isDel ? batchDeleteShiftVoucher : API.precloseGenerateVoucher
          str = this.isDel ? '删除成功！' : '凭证已经处理！'
          strWarn = this.isDel ? '删除凭证' : '生成转字凭证'
          this.$confirmWarn(`是否进行${strWarn}？`, () => {
            this.lsLoading = true
            method(this.forcePrecloseForm)
              .then((res) => {
                this.dialogShowForcePreclose = false
                this.$msgSucClose(str)
                this.getData()
              })
              .catch(() => (this.lsLoading = false))
          })
        }
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.finance-list-container ::v-deep .el-button.el-button--text {
  margin-left: 6px;
  margin-right: 6px;
}
</style>