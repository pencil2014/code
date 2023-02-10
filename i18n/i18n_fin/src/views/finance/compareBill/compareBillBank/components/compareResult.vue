<template>
  <div
    class="finance-page"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">{{!isPay ? '收款' : '付款'}}对账详情</div>
        </div>
        <div class="money-box-right">
          <el-button-group v-if="checkAuth($route.name, 'btn-reCompare')">
            <el-button class="finance-btn" type="primary" @click="bankReCompare" size="mini">重新对账</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" @click="cancel" size="mini">{{$t('Common.back')}}</el-button>
          </el-button-group>
        </div>
      </div>
      <div style="padding:10px 0 0 0;border-bottom:1px solid #e9e9e9;">
        <DetailDiv label="对账编号：" :content="detailForm.bankAccStatementCompareNo" />
        <!-- <DetailDiv label="收付日期：" :content="detailForm.startDate+' ~ '+detailForm.endDate" /> -->
        <DetailDiv label="收付日期：" :content="detailForm.receivePayDate" />
        <DetailDiv
          label="收付类型："
          :content="dictMapObj['feeitemReceipayGroup'][detailForm.receivePayType]"
        />
        <DetailDiv label="银行简称：" :content="detailForm.compAccountShortName" :isTooltip="true" />
        <DetailDiv label="币种：" :content="detailForm.currency" />
        <DetailDiv label="银行账号：" :content="detailForm.compAccountNo" />
        <DetailDiv label="对账人：" :content="detailForm.compareName" />
        <DetailDiv label="对账时间：" :content="detailForm.compareTime" />
        <DetailDiv
          label="对比结果："
          :content="dictMapObj['supplierBillCompareMatchResult'][detailForm.matchResult]"
        />
      </div>
      <div class="money-box">
        <div class="money-box-left">
          <el-button class="finance-btn" type="primary" @click="exportData" size="mini">{{$t('Common.export')}}</el-button>
          <el-button
            v-if="detailForm.matchResult !== 'all' && checkAuth($route.name, 'btn-removeCompare')"
            class="finance-btn"
            size="mini"
            @click="removeCompareDetail"
            type="danger"
          >设置不参与对账</el-button>
        </div>
        <div class="money-box-right">
          <el-radio-group v-model="matchResult" size="mini" @change="matchResultChange">
            <el-radio-button label>{{$t('Common.all')}}</el-radio-button>
            <el-radio-button label="yes">匹配</el-radio-button>
            <el-radio-button label="no">不匹配</el-radio-button>
          </el-radio-group>
        </div>
      </div>
      <FinanceTableMass :option="option2" @send-multi="sendMulti" />
    </div>
  </div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { bankCompareInfo, bankCompareInfoListPage, bankReCompare, removeCompareDetail } from '@/api/fin/compareBill'
export default {
  name: 'compareBillBankList',
  label: '银行流水',
  mixins: [mixin, routerMixin],
  activated() {
    if (!this.isNotFirst) {
      this.isNotFirst = true
    }
    if (!this.$route.meta.isUseCache && this.isNotFirst) {
      this.getData()
    }
  },
  data() {
    return {
      isPay: this.$route.name !== 'CompareBillReceiveResult',
      matchResult: '',
      option2: {},
      detailForm: {
        receivePayType: '',
        compAccountShortName: '',
        compAccountNo: '',
        matchResult: '',
        bankAccStatementCompareNo: '',
        receivePayDate: '',
      },
      receivePayType: this.$route.name === 'CompareBillReceiveResult' ? 'receive' : 'pay',
      multipleSelection1: [],
    }
  },
  components: {
    FinanceTableMass,
  },
  created() {
    let common = { data: [], tips: { show: false }, selection: { show: true }, operationBtns: false }
    this.option2 = Object.assign({}, this.option, common, {
      id: 'option2',
      $name: 'ExpressBillListResult',
      // index: { show: true },
      pagination: { ...this.option.pagination, show: true, isNew: true },
      columns: [],
      colgroups: [
        {
          title: '银行账单信息',
          className: 'supplier',
          columns: [
            {
              prop: 'matchResult',
              label: '是否匹配',
              width: 60,
              formatter: ({ cellValue: val }) => (val === 'yes' ? '匹配' : '不匹配'),
            },
            { prop: 'matchRemark', label: '差异说明', width: 130, type: 'text' },
            // { prop: 'bankAccBillNo', label: '银行账单编号', width: 130, type: 'text' },
            {
              prop: 'bankAccBillNo',
              label: '银行账单编号',
              type: 'button',
              width: '130px',
              operationBtns: {
                show: true,
                callback: (fn, index, row) => this.routerPush('CompareBillBankDetail', { bankAccBillNo: row.bankAccBillNo }),
              },
              showOverflow: false,
            },
            { prop: 'bankReceivePayDate', label: this.$t('PayApplyList.receivePayDate'), type: 'text', width: 100 },
            { prop: 'bankBankSeqNo', label: '银行流水', type: 'text', width: 100 },
            { prop: 'bankCompBankName', label: '我司银行名称', type: 'text', width: 130 },
            { prop: 'bankCompAccountNo', label: '我司银行账号', type: 'text', width: 130 },
            { prop: 'bankCompAccountName', label: '我司银行账户名', type: 'text', width: 130 },
            { prop: 'bankCurrency', label: this.$t('FeeList.currency'), type: 'text', width: 60 },
            { prop: 'bankAmt', label: this.$t('FeeList.feeAmt'), type: 'text', width: 80 },
            { prop: 'bankRivalBankName', label: '对方银行名称', type: 'text', width: 130 },
            { prop: 'bankRivalAccountNo', label: '对方银行账号', type: 'text', width: 130 },
            { prop: 'bankRivalAccountName', label: '对方账户名', type: 'text', width: 130 },
          ],
        },
        {
          title: '系统费用',
          // className: 'express_system',
          className: 'system',
          columns: [
            { prop: 'sysReceivePayDate', label: this.$t('PayApplyList.receivePayDate'), type: 'text', width: 100 },
            { prop: 'sysBankSeqNo', label: '银行流水', type: 'text', width: 100 },
            { prop: 'sysCompBankName', label: '我司银行名称', type: 'text', width: 130 },
            { prop: 'sysCompAccountNo', label: '我司银行账号', type: 'text', width: 130 },
            { prop: 'sysCompAccountName', label: '我司银行账户名', type: 'text', width: 130 },
            { prop: 'sysCurrency', label: this.$t('FeeList.currency'), type: 'text', width: 60 },
            { prop: 'sysAmt', label: this.$t('FeeList.feeAmt'), type: 'text', width: 80 },
            { prop: 'sysRivalBankName', label: '对方银行名称', type: 'text', width: 130 },
            { prop: 'sysRivalAccountNo', label: '对方银行账号', type: 'text', width: 130 },
            { prop: 'sysRivalAccountName', label: '对方账户名', type: 'text', width: 130 },
          ],
        },
      ],
    })
    let columns = []
    if (!this.isPay) {
      columns = [
        { prop: 'receivableRegNo', label: '收款登记号', type: 'text', width: 130 },
        { prop: 'receivableRegName', label: '收款登记人', type: 'text', width: 100 },
        { prop: 'receivableRegTime', label: '收款登记时间', type: 'text', width: 130 },
        { prop: 'writeoffReceipayNo', label: '收款核销编号', type: 'text', width: 130 },
        { prop: 'writeoffName', label: this.$t('Hedge.writeoffs'), type: 'text', width: 100 },
        { prop: 'writeoffTime', label: this.$t('Hedge.writeoffTime'), type: 'text', width: 130 },
        { prop: 'lastWriteoffName', label: '上一次核销人', type: 'text', width: 100 },
      ]
    } else {
      columns = [
        { prop: 'writeoffReceipayNo', label: '付款核销编号', type: 'text', width: 130 },
        { prop: 'writeoffName', label: this.$t('Hedge.writeoffs'), type: 'text', width: 100 },
        { prop: 'writeoffTime', label: this.$t('Hedge.writeoffTime'), type: 'text', width: 130 },
        { prop: 'lastWriteoffName', label: '上一次核销人', type: 'text', width: 100 },
      ]
    }
    this.option2.colgroups[1].columns.push(...columns)
  },
  methods: {
    // 获取寄单对账详情
    getData() {
      this.matchResult = ''
      this.option2.pagination.currPage = 1
      bankCompareInfo({ bankAccStatementCompareNo: this.$route.query.bankAccStatementCompareNo }).then((res) => {
        this.detailForm = Object.assign({}, res.data, {
          // bizDate: bizDateStart + '至' + bizDateEnd,
          // supplierPayMapStr,
          // matchResult: res.data.result || res.data.matchResult,
          // compareType: res.data.compareType || this.dictMap['expressBillCompareType'][0].value,
        })
        this.getTableData()
      })
    },
    getTableData(search, fromType) {
      let timeStamp = +new Date()
      if (this.diyTimeStamp && timeStamp - this.diyTimeStamp < 800 && !fromType) {
        return
      }
      this.diyTimeStamp = timeStamp
      let data = {
        currPage: this.option2.pagination.currPage,
        pageSize: this.option2.pagination.pageSize,
        query: [
          { column: 'bankAccStatementCompareNo', type: 'eq', value: this.$route.query.bankAccStatementCompareNo },
          { column: 'receivePayType', type: 'eq', value: this.receivePayType },
        ],
      }
      if (this.matchResult) {
        data.query.push({ column: 'matchResult', type: 'eq', value: this.matchResult })
      }
      this.lsLoading = true
      bankCompareInfoListPage(data)
        .then((res) => {
          this.option2.data = res.data.list.map((item) => ({ _isRefused: item.matchResult === 'no', ...item }))
          Object.assign(this.option2.pagination, res.data)
        })
        .finally(() => (this.lsLoading = false))
    },
    // 执行对账
    bankReCompare() {
      bankReCompare({ bankAccStatementCompareNo: this.detailForm.bankAccStatementCompareNo }).then((res) => {
        // this.getData()
        sessionStorage.setItem(this.isPay ? '_compareBillPayList' : '_compareBillReceiveList', true)
        this.$msgSucClose('重新对账成功！')
        this.routerDelBack()
      })
    },
    handleSizeChange(val) {
      this.option2.pagination.pageSize = val
      this.getTableData()
    },
    handleCurrentChange(val) {
      this.option2.pagination.currPage = val
      this.getTableData()
    },
    cancel() {
      this.routerBack()
    },
    exportData() {
      this.lsLoading = true
      this.$store
        .dispatch('finance/downloadBlobFilePost', {
          uri: '/fin/bankAccStatement/exportCompareDetail',
          data: {
            data: { bankAccStatementCompareNo: this.$route.query.bankAccStatementCompareNo, matchResult: this.matchResult },
          },
        })
        .then((res) => {
          this.lsLoading = false
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = `${!this.isPay ? '收款' : '付款'}对账数据.xlsx`
          link.click()
        })
        .catch((err) => {
          this.lsLoading = false
          console.log(err)
          this.$msgErrClose(err)
        })
    },
    removeCompareDetail() {
      if (!this.multipleSelection1.length) {
        return this.$msgErrClose('请选择需要操作的项!')
      }
      let oids = this.multipleSelection1.map((item) => item.oid)
      this.$confirmWarn('确定设置不参与对账？', () => {
        removeCompareDetail({
          bankAccStatementCompareDetailIds: oids,
          bankAccStatementCompareNo: this.detailForm.bankAccStatementCompareNo,
        }).then((res) => {
          this.$msgSucClose('操作成功！')
          this.getData()
        })
      })
      // this.$confirm('确定设置不参与对账？', '', {
      //   distinguishCancelAndClose: true,
      //   confirmButtonText: '是',
      //   confirmButtonClass: 'el-button--success',
      //   cancelButtonText: '否',
      //   cancelButtonClass: 'el-button--danger',
      // })
      //   .then(() => this.sureRemarkCompare({ bankSeqIds, compare: 'yes' }))
      //   .catch((action) => action === 'cancel' && this.sureRemarkCompare({ bankSeqIds, compare: 'no' }))
    },
    // sureRemarkCompare(data) {
    //   removeCompareDetail(data).then((res) => {
    //     this.$msgSucClose('操作成功！')
    //     this.getTableData()
    //   })
    // },
    sendMulti(data) {
      this.multipleSelection1 = data
    },
    matchResultChange(val) {
      console.log(val)
      this.option2.pagination.currPage = 1
      this.getTableData(false, true)
    },
  },
}
</script>
<style lang="scss" scoped>
</style>