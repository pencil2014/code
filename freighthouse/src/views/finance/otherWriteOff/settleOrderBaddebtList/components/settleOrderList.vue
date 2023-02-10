<template>
  <div
    class="finance-tab-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption1" @search="search" />
    <div style="height: 8px; background: #f8f9fd"></div>
    <div class="finance-list-container">
      <div class="money-box" v-if="isVoucherRoute">
        <div class="money-box-left">
          <el-button
            v-if="checkAuth($route.name, 'tab-settleOrder', 'btn-export')"
            class="finance-btn"
            @click="prevHandle('handleExport')"
            size="mini"
            type="primary"
          >导出</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-settleOrder', 'btn-voucherView')"
            class="finance-btn"
            @click="generateVoucher(true)"
            size="mini"
            type="inner"
          >预览扣除凭证</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-settleOrder', 'btn-voucherCreate')"
            class="finance-btn"
            @click="generateVoucher"
            size="mini"
            type="inner"
          >生成扣除凭证</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-settleOrder', 'btn-voucherDel')"
            class="finance-btn"
            @click="delVoucher"
            size="mini"
            type="danger"
          >删除扣除凭证</el-button>
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
      <div class="money-box" v-else>
        <div class="money-box-left">
          <el-button
            v-if="checkAuth($route.name, 'tab-settleOrder', 'btn-unlock')"
            class="finance-btn"
            @click="unlock"
            size="mini"
            type="primary"
          >取消复核</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-settleOrder', 'btn-confirmWriteoff')"
            class="finance-btn"
            @click="confirmWriteoff"
            size="mini"
            type="primary"
          >核销复核</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-settleOrder', 'btn-export')"
            class="finance-btn"
            @click="prevHandle('handleExport')"
            size="mini"
            type="primary"
          >导出</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-settleOrder', 'btn-handlePrint')"
            class="finance-btn"
            @click="goPrintPage"
            size="mini"
          >打印</el-button>
        </div>
        <div class="money-box-right">
          <!-- <el-button
            v-if="checkAuth($route.name, 'tab-settleOrder', 'btn-export')"
            class="finance-btn"
            @click="prevHandle('handleExport')"
            size="mini"
            type="primary"
          >导出</el-button> -->
          <el-button
            v-if="checkAuth($route.name, 'tab-settleOrder', 'btn-voucherView')"
            @click="generateVoucher(true)"
            class="finance-btn"
            size="mini"
            type="primary"
          >预览扣除凭证</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-settleOrder', 'btn-voucherCreate')"
            @click="generateVoucher('created')"
            class="finance-btn"
            size="mini"
            type="primary"
          >生成扣除凭证</el-button>
          <el-button
            v-if="checkAuth($route.name, 'tab-settleOrder', 'btn-voucherDel')"
            @click="delVoucher"
            class="finance-btn"
            size="mini"
            type="danger"
          >删除扣除凭证</el-button>
          <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">刷新</el-button>
        </div>
      </div>
      <FinanceTable :option="option1" @send-multi="sendMulti" />
    </div>
    <PreviewDialog
      ref="PreviewDialog"
      :dialogOption="previewDialog"
      @generate="generateVoucher"
      :showDel="checkAuth($route.name, 'tab-settleOrder', 'btn-voucherDel')"
      :showCreate="checkAuth($route.name, 'tab-settleOrder', 'btn-voucherCreate')"
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
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
import CustomColumns from '@/components/customColumns'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { employeeSelectlist } from '@/api/companyResource'
import { baddebtPreOrderListPage, preOrderListAmtSummary } from '@/api/fin/settleOrderBaddebt'
import { badDebitPreWriteOffGenerate, voucherDelete } from '@/api/fin/voucher'
import { dateFormat } from '@/views/finance/utils/finance'
import { unlock, confirmWriteoff } from '@/api/fin/settleOrderBaddebt'

export default {
  mixins: [mixin, mixin2, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    PreviewDialog,
    CustomColumns,
  },
  data() {
    let isVoucherRoute = this.$route.name === 'AccountantVoucherWriteoff'
    return {
      pageSizeUrl: baddebtPreOrderListPage('geturl'),
      keyDownActive: true,
      hasVoucher: '',
      isVoucherRoute,
      option1: {},
      searchOption1: {},
      multipleSelection1: [],
      previewDialog: {
        show: false,
        title: '凭证预览',
        seqNo: '',
        showData: {},
      },
      // 自定义表头弹框
      customColumnsPopShow: false,
      // 右侧搜索条件
      buttonSearch: '',
      selfColumnsBase: [
        {
          prop: 'writeoffNopayNo',
          label: '核销编号',
          type: 'button',
          width: 138,
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => {
              this.$emit('update:isJumpRouteFromPage', true)
              this.routerPush('BadOrderDetail', {
                settleOrderBaddebtNo: row.settleOrderBaddebtNo,
              })
              // this.$emit('update:isJumpRouteFromPage', true)
              // this.routerPush('SettleOrderBadDetail', { source: 'detail', settleOrderNo: row.settleOrderNo, settleOrderBaddebtId: row.settleOrderBaddebtId })
            },
          },
        },
        {
          prop: 'settleOrderBaddebtNo',
          label: '申请单号',
          type: 'button',
          width: 130,
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => {
              this.$emit('update:isJumpRouteFromPage', true)
              // this.routerPush('BadOrderDetail', { settleOrderBaddebtNo: row.settleOrderBaddebtNo })
              this.routerPush('BadApplyDetail', {
                settleOrderNo: row.settleOrderNo,
                settleOrderBaddebtId: row.settleOrderBaddebtId,
              })
            },
          },
        },
        {
          prop: 'settleOrderNo',
          label: '结算单号',
          // type: 'button',
          // width: 130,
          // operationBtns: {
          //   show: true,
          //   callback: (fn, index, row, option) => {
          //     this.$emit('update:isJumpRouteFromPage', true)
          //     this.routerPush('SettlementDetail', {
          //       source: 'settlementDetail',
          //       settleOrderNo: row.settleOrderNo,
          //     })
          //   },
          // },
          type: 'columnTip',
          width: 130,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            data: [],
            callback: (no, componentProps) => {
              this.showOneNoDetail('settleOrderNo', no, { isTab: true })
            }
          }
        },
        {
          prop: 'voucherNo',
          label: '扣除凭证号',
          customColumnHide: isVoucherRoute,
          fixed: isVoucherRoute ? 'left' : '',
          type: 'button',
          operationBtns: {
            show: true,
            callback: (action, index, row) => {
              this.initShowVoucher(this.previewDialog, row.acctVoucherSeqno, '', '')
            },
          },
        },
        {
          prop: 'voucherStatus',
          label: '凭证状态',
          customColumnHide: isVoucherRoute,
          fixed: isVoucherRoute ? 'left' : '',
          type: 'select',
        },
        {
          prop: 'settleCorpName',
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
          prop: 'writeOffAmt',
          label: '核销金额',
          type: 'text',
        },
        {
          prop: 'dealWay',
          label: '坏账处理方式',
          type: 'select',
          propInDict: 'baddebtDealWay',
          width: 120,
        },
        {
          prop: 'extractStatus',
          label: '扣减状态',
          type: 'select',
          // propInDict: 'extractStatus',
        },
        {
          prop: 'badReason',
          label: '坏账原因',
          type: 'select',
          propInDict: 'baddebtReason',
          width: 150,
        },
        {
          prop: 'recheckStatus',
          label: '复核状态',
          width: 80,
          type: 'select',
          propInDict: 'writeoffRecheckStatus',
        },
        {
          prop: 'bdEmployeeName',
          label: '销售',
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
          width: 150,
        },
        {
          prop: 'auditName',
          label: '审核人',
          type: 'text',
        },
        {
          prop: 'auditTime',
          label: '审核时间',
          type: 'text',
          width: 150,
        },
      ],
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
  created() {
    let searchArr = ['sourceBizNos', 'writeoffNopayNo', 'settleCorpCode', 'extractStatus', 'badReason', 'auditTime']
    this.searchOption1 = {
      saveShow: true,
      saveName: 'badSettleOrderList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        defaultSearchLength: 6,
        searchInputGroup: searchArr.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          allNo: { label: '各类编号', type: 'input' },
          sourceBizNos: { label: '工作号', type: 'input', placeholder: '多个用英文逗号分隔' },
          writeoffNopayNo: { label: '核销编号', type: 'input' },
          settleOrderBaddebtNo: { label: '申请编号', type: 'input' },
          settleOrderNo: { label: '结算单号', type: 'input' },
          voucherNo: { label: '扣除凭证号', type: 'input' },
          voucherStatus: { label: '凭证状态', type: 'select', prop: 'voucherStatus' },
          settleCorpCode: {
            label: '结算单位',
            type: 'remoteSelect',
            remote: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString }, item)
            },
            remoteSelectList: [],
          },
          settleCompCode: {
            label: '分公司',
            prop: 'settleCompCode',
            type: 'remoteSelect',
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            remoteSelectList: [],
          },
          extractStatus: { label: '扣减状态', type: 'select', prop: 'extractStatus' },
          recheckStatus: { label: '复核状态', type: 'select', prop: 'writeoffRecheckStatus' },
          badReason: { label: '坏账原因', type: 'select', prop: 'baddebtReason' },
          dealWay: { label: '坏账处理方式', type: 'select', prop: 'baddebtDealWay' },
          auditTime: { label: '审核时间', type: 'lsDaterange', format: 'yyyy-MM-dd' },
          createdTime: { label: '申请时间', type: 'lsDaterange', format: 'yyyy-MM-dd' },
          createdBy: {
            label: '申请人',
            type: 'remoteSelect',
            remoteMethod: (queryString, item, row) => {
              this.getEmployeeList(queryString, item)
            },
            visibleChange: (queryString, item, row) => {
              this.getEmployeeList(queryString, item)
            },
            remoteSelectList: [],
          },
          auditId: {
            label: '审核人',
            type: 'remoteSelect',
            remoteMethod: (queryString, item, row) => {
              this.getEmployeeList(queryString, item)
            },
            visibleChange: (queryString, item, row) => {
              this.getEmployeeList(queryString, item)
            },
            remoteSelectList: [],
          },
          bdEmployeeId: {
            label: '销售',
            type: 'remoteSelect',
            remoteMethod: (name, item, row) => {
              this.getEmployeeList({name, roleCodes: 'bd'}, item)
            },
            visibleChange: (name, item, row) => {
              this.getEmployeeList({name, roleCodes: 'bd'}, item)
            },
            remoteSelectList: [],
          },
        },
      },
    }
    const pagination = Object.assign({}, this.option.pagination, {
      show: true, isNew: true,
    })
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [{ label: '详情', show: true, action: 'showDetail' }],
    })
    if (!this.checkAuth(this.$route.name, 'tab-settleOrder', 'btn-detail')) operationBtns = false
    const listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
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
      $name: 'settleOrderBaddebt',
      data: [],
      tips: { text: '', show: false },
      operationBtns,
      pagination,
      listAmtSummary,
      needTimeSort: true,
      emptyText: '数据将在查询后显示',
      colorColumns: ['voucherStatus'],
    })
    let columns1 = [...this.selfColumnsBase]
    // this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    if (this.isVoucherRoute) {
      this.configColumns.push(...this.selfColumnsBase.filter((item) => !item.customColumnHide).map((item) => item.prop))
    } else {
      this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    }

    this.option1.columns = columns1
    // 和默认获取搜索条件冲突，在此处调用会取消获取搜索条件后请求列表数据
    // this.getData()
  },
  activated() {
    // 首次进入直接返回，会由搜索组件触发搜索
    if (!this.isFirstActivated) {
      this.isFirstActivated = true
      return
    }
    if (!this.$route.meta.isUseCache || sessionStorage.getItem('refreshBadSettleOrderList')) {
      sessionStorage.removeItem('refreshBadSettleOrderList')
      this.getData()
    }
  },
  methods: {
    // 搜索按钮
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    // 封装请求参数并请求列表
    getData(isSearch, param = {}) {
      this.isNotFirtGetData = true
      let customerList = param === true
      this.lsLoading = true
      const data = {
        descColumns: ['auditTime'],
        currPage: this.option1.pagination.currPage,
        pageSize: customerList ? 0 : this.option1.pagination.pageSize,
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption1, true)
      if (this.isVoucherRoute) {
        this.hasVoucher &&
          data.query.push({
            column: 'voucherStatus',
            type: 'like',
            value: this.hasVoucher,
          })
      }
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || data.query
      let { isExport } = param
      if (isExport) {
        data.query.push({"column": "queryDataModuleCode", "type": "eq", "value": "baddebtPreWriteoffListExport"})
        this.$store.dispatch('finance/downloadExcelFile', { data: data }).then((res) => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = '提成预销单' + dateFormat('yyyy-mm-dd HH_MM_SS', new Date()) + '.xlsx'
          link.click()
          this.lsLoading = false
        })
        return
      }
      let method = this.isVoucherRoute ? baddebtPreOrderListPage : baddebtPreOrderListPage
      return method(data)
        .then((res) => {
          this.finCommonColumns(res, undefined, undefined, undefined, {
            configColumns: res.data.configColumns.filter((v) => {
              return !this.isVoucherRoute || !['hasVoucher', 'voucherNo'].includes(v)
            }),
          })
          // if (res.data.configColumns && res.data.configColumns.length) {
          //   let columns = res.data.configColumns
          //   this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop)).filter((v) => v)
          //   this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
          //   // this.configColumns = res.data.configColumns
          //   this.configColumns = res.data.configColumns.filter((v) => {
          //     return !this.isVoucherRoute || !['voucherStatus', 'voucherNo'].includes(v)
          //   })
          // }
          if (this.isVoucherRoute) {
            let columns = []
            if (res.data.configColumns && res.data.configColumns.length) {
              columns = res.data.configColumns.filter((v) => !['voucherStatus', 'voucherNo'].includes(v))
            } else {
              columns = this.selfColumnsBase.map((v) => v.prop).filter((v) => !['voucherStatus', 'voucherNo'].includes(v))
            }
            columns = ['voucherStatus', 'voucherNo', ...columns]
            if (this.columnsBackup !== columns.toString()) {
              this.option1.columns = columns
                .map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
                .filter((v) => v)
            }
            this.columnsBackup = columns.toString()
          }
          if (customerList) return
          const { list } = res.data
          list.forEach(item => {
            item.settleOrderNo_multiValue = item.settleOrderNo.split(',')
          })
          this.option1.data = list.map((v) => ({ ...v, voucherStatus: v.voucherNo ? 'yes' : 'no' }))
          this.$set(this.option1, 'emptyText', '未查询到任何数据')
          Object.assign(this.option1.pagination, res.data)
          // this.option1.pagination.currPage = res.data.currPage
          // this.option1.pagination.pageSize = res.data.pageSize
          // this.option1.pagination.totalCount = res.data.totalCount
        })
        .finally(() => (this.lsLoading = false))
      // 统计
      // this.debounceLs(() => {
      //   this.getListAmtSummary(data)
      // })
    },
    getListAmtSummary(data) {
      let method = this.isVoucherRoute ? preOrderListAmtSummary : preOrderListAmtSummary
      method(data).then((res) => {
        if (res.code === 0 && res.data) {
          const labelObj = {
            baddebtAmtListLabel: '坏账金额合计',
            // realAmtListLabel: '预收可用金额合计'
          }
          const colorObj = {
            baddebtAmtListColor: 'red', // 支持red, green, black三种值
            // realAmtListColor: 'red'
          }
          const data = res.data
          this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
            show: true,
            data,
            labelObj,
            colorObj,
          })
        }
      })
    },
    // table复选框
    sendMulti(data, option) {
      this.multipleSelection1 = data
      // 统计
      const data2 = {
        ascColumns: [],
        descColumns: [],
        query: [],
      }
      const ids = this.multipleSelection1.map((item) => item.settleOrderBaddebtId).join(',')
      if (ids) {
        data2.query.push({ column: 'settleOrderBaddebtIds', type: 'eq', value: ids })
      } else {
        data2.query = this.searchBackup || []
      }
      if (data.length || this.option1.listAmtSummary.count++ > 0) {
        this.debounceLs(() => {
          this.getListAmtSummary(data2)
        })
      }
    },
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
    // 商务下拉框
    getEmployeeList2(queryString, item) {
      employeeSelectlist({ name: queryString }).then((res) => {
        item.remoteSelectList = res.data.map((item) => {
          return { label: item.cname, value: item.cname }
        })
      })
    },
    // 跳转详情
    showDetail(row) {
      // this.$emit('update:isJumpRouteFromPage', true)
      // this.routerPush('SettleOrderBadDetail', { source: 'detail', settleOrderNo: row.settleOrderNo, settleOrderBaddebtId: row.settleOrderBaddebtId })
      this.$emit('update:isJumpRouteFromPage', true)
      this.routerPush('BadOrderDetail', {
        settleOrderBaddebtNo: row.settleOrderBaddebtNo,
      })
    },
    generate() {},
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
        voucherDelete({ voucherSeqNos }).then((res) => {
          this.$msgSucClose('删除成功！')
          this.getData()
        })
      })
    },
    // 生成凭证
    generateVoucher(preview, bizNo) {
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
        bizType: 'bad_pre_writeoff',
      }
      if (isPreview) data.preview = 'yes'
      this.lsLoading = true
      this.$refs.PreviewDialog.lsLoading = true
      badDebitPreWriteOffGenerate(data)
        .then((res) => {
          if (isPreview) {
            this.lsLoading = false
            if (!res.data || !res.data.length) return this.$msgErrClose('没有可生成凭证的数据！')
            this.initShowVoucher(this.previewDialog, '', '', res.data)
            return
          }
          !isPreview && !bizNo && this.getData()
          this.$msgSucClose('凭证已经处理！')
        })
        .finally(() => (this.lsLoading = this.$refs.PreviewDialog.lsLoading = false))
    },
    prevHandle(type) {
      let text = ''
      let meth = null
      if (type === 'handleExport') {
        text = '导出'
        meth = this.handleExport
      }
      this.$confirm(`是否确认${text}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        meth && meth()
      }).catch(err => {
        console.log(err)
      })
    },
    handleExport() {
      this.getData(false, { isExport: true })
    },
    unlock() {
      if (this.multipleSelection1.length !== 1) {
        return this.$msgErrClose('请勾选1个需要取消复核的项！')
      }
      if(this.multipleSelection1.find(item => item.recheckStatus !== 'checked')){
        return this.$msgErrClose('已复核状态才能取消复核！')
      }
      let { writeoffNopayId } = this.multipleSelection1[0]
      this.$confirmWarn('确认取消复核？', () => {
        unlock({ writeoffNopayId })
          .then((res) => {
            this.$msgSucClose('取消复核成功！')
            this.getData()
          })
          .catch(console.log)
      })
    },
    confirmWriteoff() {
      if (!this.multipleSelection1.length) {
        return this.$msgErrClose('请勾选需要复核的项！')
      }
      if(this.multipleSelection1.find(item => item.recheckStatus !== 'no_check')){
        return this.$msgErrClose('未复核状态才能复核！')
      }
      this.$confirmWarn('确认核销复核？', () => {
        confirmWriteoff({ writeoffNopayIdList: this.multipleSelection1.map((v) => v.writeoffNopayId) })
          .then((res) => {
            this.$msgSucClose('核销复核成功！')
            this.getData()
          })
          .catch(console.log)
      })
    },
    goPrintPage() {
      let data = {
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        query: [],
        currPage: 1,
        pageSize: 10000,
      }
      let ids = this.multipleSelection1.map((item) => item.settleOrderBaddebtId).join(',')
      if (ids) {
        data.query.push({ column: 'settleOrderBaddebtIds', type: 'eq', value: ids })
      } else {
        data.query = this.searchBackup || []
      }
      this.routerPushTab('BadOrderPrintPage',{ params: JSON.stringify(data), type: 'badOrder'})
    },
  },
}
</script>