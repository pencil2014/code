<template>
  <div class="finance-page">
    <div
      class="finance-list-container"
      v-loading="lsLoading"
      :element-loading-text="eLoadingText"
      :element-loading-spinner="eLoadingSpinner"
      :element-loading-background="eLoadingBackground"
    >
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">银行账单附件详情</div>
        </div>
        <div class="money-box-right">
          <!-- v-if="checkAuth($route.name, 'tab-compareBillBankList', 'btn-compare')" -->
          <el-button class="finance-btn" size="mini" @click="delRecord" type="danger">批量{{$t('Common.del')}}</el-button>
          <el-button @click="cancel" size="mini">{{$t('Common.back')}}</el-button>
        </div>
      </div>
      <div style="padding:10px 0 0 0;border-bottom:1px solid #e9e9e9;">
        <DetailDiv label="银行账单编号：" :content="detailForm.bankAccBillNo" />
        <DetailDiv
          label="模板类型："
          :content="dictMapObj['bankAccStatementTemplate'][detailForm.template]"
        />
        <DetailDiv label="解析状态：" :content="dictMapObj['yesNo'][detailForm.result]" />
        <DetailDiv label="银行账条数：" :content="detailForm.rows" />
        <DetailDiv label="导入人：" :content="detailForm.createdName" />
        <DetailDiv label="导入时间：" :content="detailForm.createdTime" />
      </div>
      <!-- <div class="money-box">
        <div class="money-box-left"></div>
        <div class="money-box-right">
        </div>
      </div>-->
      <DetailFeeSearchFilter
        ref="DetailFeeSearchFilter"
        :list="option1.data"
        :columns="feeListColumns"
        @search="search2"
        style="margin-bottom: 8px;"
      />
      <FinanceTable :option="option1" @send-multi="sendMulti" />
    </div>
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import DetailFeeSearchFilter from '@/views/finance/components/financeSearch/detailFeeSearchFilter'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { bankListPage, getBankBillInfo, deleteBankSeq } from '@/api/fin/compareBill'

export default {
  name: 'compareBillBankList',
  label: '银行流水',
  mixins: [mixin, mixin2, routerMixin],
  components: {
    FinanceTable,
    FinanceSearch,
    DetailFeeSearchFilter,
  },
  activated() {
    console.log(this.$route.meta.isUseCache)
    if (!this.isNotFirst) {
      this.isNotFirst = true
    }
    if (!this.$route.meta.isUseCache && this.isNotFirst) {
      getBankBillInfo({ bankAccBillNo: this.$route.query.bankAccBillNo }).then((res) => {
        Object.assign(this.detailForm, res.data || {})
        this.search()
      })
    }
  },
  data() {
    return {
      detailForm: { bankAccBillNo: '', template: '', result: '', rows: '', createdName: '', createdTime: '' },
      keyDownActive: true,
      option1: {},
      multipleSelection1: [],
      feeListColumns: [{ prop: 'bankSeqNo', label: '银行流水号', type: 'text', st: 1 }],
    }
  },
  created() {
    // 表格配置
    let pagination = { ...this.option.pagination, show: true, isNew: true }
    this.option1 = { ...this.option, id: 'option1', $name: 'PreCloseAuditTab', pagination }
    this.option1.operationBtns = Object.assign({}, this.option.operationBtns, {
      show: true,
      width: '70px',
      data: [{ label: this.$t('Common.del'), type: 'text', show: true, action: 'Delete' }],
    })
    let columns = [
      { prop: 'receivePayDate', width: 90, label: '收付日期' },
      { prop: 'receivePayType', label: this.$t('FeeList.receipayType'), type: 'select', width: 80, propInDict: 'receipayType' },
      { prop: 'bankSeqNo', width: 130, label: '银行流水号' },
      { prop: 'compBankName', width: 100, label: '我司银行名称' },
      { prop: 'compAccountNo', width: 130, label: '我司银行账号' },
      { prop: 'compAccountName', width: 130, label: '我司银行账户名' },
      { prop: 'currency', width: 70, label: '币种' },
      { prop: 'amt', width: 100, label: '金额' },
      { prop: 'rivalBankName', width: 100, label: '对方银行名称' },
      { prop: 'rivalAccountNo', width: 130, label: '对方银行账号' },
      { prop: 'rivalAccountName', width: 130, label: '对方银行账户名' },
      { prop: 'remark', minWidth: 150, label: '银行备注' },
      { prop: 'createdName', width: 100, label: '导入人' },
      { prop: 'createdTime', width: 130, label: '导入时间' },
    ]
    this.option1.columns = columns
    this.optionMaxHeight = this.option1
    // this.getData()
  },
  methods: {
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData && this.getData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData && this.getData()
    },
    sendMulti(data) {
      this.multipleSelection1 = data
      console.log(this.multipleSelection1)
    },
    delRecord() {
      console.log(this.multipleSelection1)
      if (!this.multipleSelection1.length) {
        return this.$msgErrClose('请至少选择一个操作的项！')
      }
      this.deleteOp({
        bankBillId: this.detailForm.bankAccBillId,
        bankSeqIds: this.multipleSelection1.map((v) => v.bankAccStatementId),
      })
    },
    handleDelete($index, row, option) {
      console.log(row)
      this.deleteOp({ bankBillId: this.detailForm.bankAccBillId, bankSeqIds: [row.bankAccStatementId] })
    },
    deleteOp(data) {
      this.$confirmWarn('确认进行删除？', () => {
        deleteBankSeq(data).then((res) => {
         this.$msgErrClose(this.$t('Settle.deleteSuc'))
          this.search()
        })
      })
    },
    getData() {
      this.lsLoading = true
      // 使用银行流水接口，要固定加入银行账单编号
      bankListPage({
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [{ column: 'bankAccBillNo', type: 'eq', value: this.$route.query.bankAccBillNo }],
      })
        .then((res) => {
          this.option1.data = res.data.list || []
          Object.assign(this.option1.pagination, res.data)
        })
        .finally(() => (this.lsLoading = false))
    },
    cancel() {
      this.routerBack()
    },
    search2(list) {
      this.option1.data = [...list]
    },
  },
}
</script>
<style lang="scss" scoped>
</style>