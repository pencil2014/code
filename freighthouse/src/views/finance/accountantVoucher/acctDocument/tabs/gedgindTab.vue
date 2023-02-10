<template>
  <div
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption1" @search="search" />
    <div style="height:8px;background:#F8F9FD;"></div>
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button
            v-if="checkAuth($route.name, 'tab-gedgingWriteOffList', 'btn-voucherView')"
            class="finance-btn"
            @click="generateVoucher(true)"
            size="mini"
            type="primary"
          >预览凭证</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-gedgingWriteOffList', 'btn-voucherCreate')"
            class="finance-btn"
            @click="generateVoucher"
            size="mini"
            type="primary"
          >生成凭证</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-gedgingWriteOffList', 'btn-voucherDel')"
            class="finance-btn"
            @click="delVoucher"
            size="mini"
            type="danger"
          >删除凭证</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-gedgingWriteOffList', 'btn-handleExport')"
            class="finance-btn"
            @click="handleExport"
            size="mini"
          >导出</el-button>
        </div>
        <div class="money-box-right">
          <el-radio-group v-model="hasVoucher" size="mini">
            <el-radio-button label>全部</el-radio-button>
            <el-radio-button label="no">未生成</el-radio-button>
            <el-radio-button label="yes">已生成</el-radio-button>
          </el-radio-group>
          <el-button-group>
            <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTableMass :option="option1" @send-multi="sendMulti" />
    </div>
    <PreviewDialog
      ref="PreviewDialog"
      :dialogOption="previewDialog"
      @generate="generateVoucher"
      :showDel="checkAuth($route.name, 'tab-gedgingWriteOffList', 'btn-voucherDel')"
      :showCreate="checkAuth($route.name, 'tab-gedgingWriteOffList', 'btn-voucherCreate')"
    />
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
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/components/customColumns'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { exListPage, getExListAmtSummary } from '@/api/fin/writeoffNopay'
import { exNopayWriteOffGenerate, exVoucherDelete } from '@/api/fin/voucher'
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'

export default {
  name: 'gedgingWriteOffList',
  label: '对冲核销',
  mixins: [mixin, mixin2, routerMixin],
  data() {
    let isVoucherRoute = true
    return {
      pageSizeUrl: exListPage('geturl'),
      keyDownActive: true,
      descColumns: [],
      ascColumns: [],
      hasVoucher: '',
      isVoucherRoute,
      option1: {},
      searchOption1: {},
      multipleSelection1: [],
      gedgingApplyId: '',
      previewDialog: {
        show: false,
        title: '凭证预览',
        seqNo: '',
        seqNos: '',
        showData: {},
        isEx: true,
      },
      rightFilterBtns: [true, false, false, false],
      // 自定义表头弹框
      customColumnsPopShow: false,
      // 右侧搜索条件
      buttonSearch: '',
      selfColumnsBase: [
        {
          prop: 'writeoffNopayNo',
          label: '核销编号',
          type: 'button',
          width: '130px',
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => {
              this.showDetail(row)
            },
          },
        },
        {
          prop: 'gedgingApplyNo',
          label: '对冲编号',
          type: 'button',
          width: 125,
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => {
              this.showDetail(row)
            },
          },
        },
        {
          prop: 'rivalCorpName',
          label: '结算单位',
          type: 'text',
          width: 150,
        },
        {
          prop: 'settleCompName',
          label: '分公司',
          type: 'text',
          width: 150,
        },
        {
          prop: 'gedgingCurrency',
          label: '币种',
          width: 80,
          type: 'select',
        },
        {
          prop: 'gedgingType',
          label: '对冲类型',
          width: 100,
          type: 'select',
        },
        {
          prop: 'gedgingSubType',
          label: '对冲子类型',
          width: 100,
          type: 'select',
        },
        {
          prop: 'sumDescript',
          label: '对冲金额',
          type: 'text',
          width: '160px',
          sortable: false,
        },
        {
          prop: 'isShiftVoucher',
          label: '是否需要生成凭证',
          width: 130,
          type: 'select',
          propInDict: 'yesNo',
          // voucherHide: isVoucherRoute ? true : false,
        },
        {
          prop: 'voucherNo',
          label: '凭证号',
          type: 'button',
          customColumnHide: isVoucherRoute,
          fixed: isVoucherRoute ? 'left' : '',
          operationBtns: {
            show: true,
            callback: (action, index, row) => {
              this.initShowVoucher(this.previewDialog, row.acctVoucherSeqno, '', '')
            },
          },
        },
        {
          prop: 'hasVoucher',
          label: '凭证状态',
          customColumnHide: isVoucherRoute,
          fixed: isVoucherRoute ? 'left' : '',
          type: 'select',
          propInDict: 'voucherStatus',
          sortable: false,
        },
        {
          prop: 'recheckStatus',
          label: '复核状态',
          width: 80,
          type: 'select',
          propInDict: 'writeoffRecheckStatus',
        },
        {
          prop: 'createdName',
          label: '申请人',
          width: 100,
          type: 'text',
        },
        {
          prop: 'writeoffRemark',
          label: '审核备注',
          width: 150,
          type: 'text',
        },
        {
          prop: 'writeoffName',
          label: '核销人',
          width: 100,
          type: 'text',
        },
        {
          prop: 'writeoffTime',
          label: '核销时间',
          type: 'text',
          width: 130,
        },
        {
          prop: 'writeoffDate',
          label: '核销日期',
          type: 'text',
          width: 100,
        },
        {
          prop: 'recheckName',
          label: '复核人',
          type: 'text',
          width: 100,
          sortable: false,
        },
        {
          prop: 'writeoffReverseNo',
          label: '反核销编号',
          type: 'text',
          width: '130px',
          sortable: false,
        },
      ],
      currencySelectOptions: [],
    }
  },
  watch: {
    'previewDialog.show'(val) {
      !val && this.previewDialog._refresh && this.getData()
      this.previewDialog._refresh = false
    },
    hasVoucher() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
  },
  components: {
    FinanceTableMass,
    FinanceSearch,
    PreviewDialog,
    CustomColumns,
  },
  created() {
    let dictMapCurrency = JSON.parse(JSON.stringify(this.dictMap['currency']))
    let find = dictMapCurrency.find((item) => item.value === 'ORIGINAL')
    if (find) {
      find.value = 'original'
    } else {
      dictMapCurrency.push({ label: '原币别', value: 'original' })
    }
    this.currencySelectOptions = dictMapCurrency

    this.selfColumnsBase = this.selfColumnsBase
      .map((item) => {
        if (item.prop === 'gedgingCurrency') {
          item.selectOptions = this.dictMap['currency'].concat([{ label: '原币种', value: 'original' }])
        }
        return item
      })
      .filter((v) => !v.voucherHide)
    let searchArr = ['writeoffNopayNo', 'rivalCorpCodes', 'recheckStatus', 'gedgingTypes', 'gedgingCurrency', 'writeoffDate']
    this.searchOption1 = {
      saveShow: true,
      saveName: 'gedgingWriteoffList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        // 初始搜索条件数
        defaultSearchLength: 6,
        // 条件数组
        searchInputGroup: searchArr.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        // 左侧下拉框及对应右侧配置
        filterGroups: {
          allNo: { label: '各类编号', type: 'input' },
          writeoffNopayNo: { label: '核销编号', type: 'input' },
          gedgingApplyNo: { label: '对冲编号', type: 'input' },
          voucherNo: { label: '凭证号', type: 'input' },
          // voucherStatus: { label: '凭证状态', type: 'select', prop: 'voucherStatus' },
          writeoffReverseNo: { label: '反核销编号', type: 'input' },
          rivalCorpCodes: {
            label: '结算单位',
            prop: 'rivalCorpCode',
            type: 'remoteSelect',
            multiple: true,
            clearable: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: '' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: '' }, item)
            },
            remoteSelectList: [],
          },
          settleCompCode: {
            label: '分公司',
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
          gedgingTypes: { label: '对冲类型', type: 'select', multiple: true, prop: 'gedgingType' },
          gedgingSubType: { label: '对冲子类型', type: 'select', multiple: true, prop: 'gedgingSubType' },
          gedgingCurrency: { label: '币种', type: 'select', prop: 'currency', selectOptions: this.currencySelectOptions },
          writeoffDate: { label: '核销日期', type: 'lsDaterange', format: 'yyyy-MM-dd' },
          // recheckStatuss: { label: '复核状态', type: 'select', prop: 'writeoffRecheckStatus', multiple: true },
          createdBy: {
            label: '申请人',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item, row) => this.getEmployeeList('', item),
            remoteSelectList: [],
          },
          writeoffBy: {
            label: '核销人',
            type: 'remoteSelect',
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item, row) => this.getEmployeeList('', item),
            remoteSelectList: [],
          },
          writeoffTime: { label: '核销时间', type: 'lsDatetimerange', format: 'yyyy-MM-dd HH:mm:ss' },
          recheckStatus: { label: '复核状态', type: 'select', prop: 'writeoffRecheckStatus', multiple: true },
          isShiftVoucher: { label: '是否需要生成凭证', type: 'select', prop: 'yesNo' },
        },
      },
    }
    // if (!this.isVoucherRoute) {
    //   this.searchOption1.addFilter.filterGroups.isShiftVoucher = {
    //     label: '是否需要生成凭证',
    //     type: 'select',
    //     prop: 'yesNo',
    //   }
    // }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [{ label: '详情', type: 'text', show: true, action: 'showDetail' }],
      show: true,
    })
    if (!this.checkAuth(this.$route.name, 'tab-gedgingWriteOffList', 'btn-detail')) operationBtns = false
    let pagination = Object.assign({}, this.option.pagination, { show: true, isNew: true })
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
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
      $name: 'gedgingWriteOffList',
      data: [...this.option.data],
      tips: {
        text: '',
        show: false,
      },
      operationBtns,
      pagination,
      listAmtSummary,
      needTimeSort: true,
      sortable: true,
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
      emptyText: '数据将在查询后显示',
      colorColumns: ['voucherStatus'],
    })
    if (this.isVoucherRoute) {
      this.configColumns.push(...this.selfColumnsBase.filter((item) => !item.customColumnHide).map((item) => item.prop))
    } else {
      this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    }
    // this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.option1.columns = [...this.selfColumnsBase]
    // 和默认获取搜索条件冲突，在此处调用会取消获取搜索条件后请求列表数据
    // this.getData()
    this.cTimestamp = new Date().getTime()
  },
  activated() {
    // 首次进入直接返回，会由搜索组件触发搜索
    if (!this.isFirstActivated) {
      this.isFirstActivated = true
      return
    }
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache || (this.$route.meta.refresh && timestamp - this.cTimestamp > 300)) {
      this.handleCurrentChange(1)
    }
  },
  methods: {
    // 删除凭证  每行只有单个凭证
    delVoucher() {
      let selectRow = this.multipleSelection1
      if (!selectRow.length) {
        return this.$msgErrClose(`请勾选需要删除凭证的项！`)
      }
      let arr = selectRow.filter((item) => item.voucherNo)
      if (!arr.length) {
        return this.$msgErrClose(`请勾选已生成凭证的项！`)
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
      this.$confirmWarn(`您是否确认删除${voucherNos.join(',')}凭证号下面的所有明细？`, () => {
        exVoucherDelete({ voucherSeqNos }).then((res) => {
          this.$msgSucClose('删除成功！')
          this.getData()
        })
      })
    },
    // 生成凭证
    generateVoucher(preview, bizNo) {
      // 凭证预览内的删除也走这个回调，refresh表示删除成功，刷新列表
      if (preview === 'refresh') {
        this.getData()
        return
      }
      let isPreview = preview === true
      if (!bizNo) this.previewDialog.show = false
      let selectRow = this.multipleSelection1
      if (!selectRow.length) {
        return this.$msgErrClose(`请勾选需要${isPreview ? '预览' : '生成'}凭证的项！`)
      }
      selectRow = selectRow.filter((v) => v.isShiftVoucher === 'yes')
      if (!selectRow.length) {
        return this.$msgErrClose(`没有可生成凭证的数据！`)
      }
      if (selectRow.length && isPreview) {
        let hasVoucher, noVoucher
        selectRow.forEach((v) => {
          if (v.acctVoucherSeqno) {
            hasVoucher = true
          } else {
            noVoucher = true
          }
        })
        if (hasVoucher && noVoucher) {
          return this.$msgErrClose('已生成和未生成凭证的记录不能同时预览！')
        }
      }
      let arr = selectRow.filter((item) => !item.acctVoucherSeqno)
      if (!arr.length) {
        if (isPreview) {
          this.initShowVoucher(this.previewDialog, '', selectRow.map((v) => v.acctVoucherSeqno).join(','), '')
        } else {
          this.$msgErrClose('请选择无凭证号的项！')
        }
        return
      }
      let data = {
        writeoffNopayNos: bizNo && bizNo !== 'all' ? [bizNo] : this.multipleSelection1.map((item) => item.writeoffNopayNo),
        bizType: 'gedging_writeoff',
      }
      if (isPreview) data.preview = 'yes'
      this.lsLoading = true
      this.$refs.PreviewDialog.lsLoading = true
      exNopayWriteOffGenerate(data)
        .then((res) => {
          this.$refs.PreviewDialog.lsLoading = false
          if (isPreview) {
            this.lsLoading = false
            if (!res.data || !res.data.length) return this.$msgErrClose('没有可生成凭证的数据！')
            this.initShowVoucher(this.previewDialog, '', '', res.data)
            return
          }
          !isPreview && !bizNo && this.getData()
          this.$msgSucClose('凭证已经处理！')
          // this.$router.push({ name: 'VoucherList' })
        })
        .finally(() => (this.lsLoading = this.$refs.PreviewDialog.lsLoading = false))
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    search(data, index) {
      this.buttonSearch = data
      this.option1.pagination.currPage = 1
      this.getData(true)
      if (index || index === 0) {
        this.rightFilterBtns = [false, false, false, false]
        this.rightFilterBtns[index] = true
      }
    },
    getData(isSearch, customerList) {
      this.isNotFirtGetData = true
      if (this.debounceLsFn()) {
        return Promise.resolve()
      }
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: customerList ? 0 : this.option1.pagination.pageSize,
        columns: [],
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption1)
      if (this.isVoucherRoute) {
        data.query.push({
          column: 'onlyVoucher',
          type: 'default',
          value: 'yes',
        })
        this.hasVoucher &&
          data.query.push({
            column: 'voucherStatus',
            type: 'default',
            value: this.hasVoucher,
          })
      }
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || data.query
      // if (this.buttonSearch) {
      //   data.query.push({ column: 'recheckStatus', type: 'default', value: this.buttonSearch })
      // }
      let method = this.isVoucherRoute ? exListPage : exListPage
      return method(data)
        .then((res) => {
          this.finCommonColumns(res, undefined, undefined, undefined, {
            configColumns: res.data.configColumns.filter((v) => {
              return !this.isVoucherRoute || !['hasVoucher', 'voucherNo'].includes(v)
            }),
          })
          if (this.isVoucherRoute) {
            let columns = []
            if (res.data.configColumns && res.data.configColumns.length) {
              columns = res.data.configColumns.filter((v) => !['hasVoucher', 'voucherNo'].includes(v))
            } else {
              columns = this.selfColumnsBase.map((v) => v.prop).filter((v) => !['hasVoucher', 'voucherNo'].includes(v))
            }
            columns = ['hasVoucher', 'voucherNo', ...columns]
            if (this.columnsBackup !== columns.toString()) {
              this.option1.columns = columns
                .map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
                .filter((v) => v)
            }
            this.columnsBackup = columns.toString()
          }
          if (customerList) return
          let { list } = res.data
          this.option1.data = list.map((v) => ({ ...v, voucherStatus: v.voucherNo ? 'yes' : 'no' }))
          this.$set(this.option1, 'emptyText', '未查询到任何数据')
          Object.assign(this.option1.pagination, res.data)
        })
        .finally(() => (this.lsLoading = false))
    },
    getExListAmtSummary(data) {
      let method = this.isVoucherRoute ? getExListAmtSummary : getExListAmtSummary
      method(data).then((res) => {
        if (res.code === 0 && res.data) {
          let data = {
            recGedgingAmtList: [],
            payGedgingAmtList: [],
          }
          data = Object.assign(data, res.data)
          let labelObj = {
            recGedgingAmtListLabel: '应收对冲金额',
            payGedgingAmtListLabel: '应付对冲金额',
          }
          let colorObj = {
            recGedgingAmtListColor: 'red', // 支持red, green, black三种值
            payGedgingAmtListColor: 'green',
          }
          for (let key in data) {
            let value = data[key]
            value.forEach((item) => {
              if (item.currency === 'original') {
                item.currency = '原币'
              }
            })
          }
          this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
            show: true,
            data,
            labelObj,
            colorObj,
          })
        }
      })
    },
    sendMulti(data, option) {
      this.multipleSelection1 = data
      console.log(data)
      let data2 = {
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        query: [],
      }
      let ids = this.multipleSelection1.map((item) => item.gedgingApplyId).join(',')
      if (ids) {
        data2.query.push({ column: 'gedgingApplyIds', type: 'eq', value: ids })
      } else {
        data2.query = this.searchBackup || []
      }
      if (data.length || this.option1.listAmtSummary.count++ > 0) {
        this.debounceLs(() => {
          this.getExListAmtSummary(data2)
        })
      }
    },
    showDetail(row) {
      this.routerPushTab('GedgingDetail', { source: 'detail', gedgingApplyId: row.gedgingApplyId })
    },
    closeDetail() {
      this.isShowDetail = false
    },
    handleExport() {
      let data = {
        columns: this.option1.columns.map(v => v.prop),
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
      }
      data.query = JSON.parse(JSON.stringify(this.searchBackup || []))
      if (this.multipleSelection1.length) {
        data.query = [
          {
            column: 'gedgingApplyIds',
            type: 'in',
            value: this.multipleSelection1.map((v) => v.gedgingApplyId).join(','),
          },
        ]
      }
      //查询对象的配置编码
      data.query.push({ column: 'queryDataModuleCode', value: 'gedgingWriteoffExListExport' })
      this.$store.dispatch('finance/downloadExcelFile', { data: data }).then((res) => {
        this.aTagClick(window.URL.createObjectURL(res), '对冲核销列表.xlsx')
      })
    },
  },
}
</script>