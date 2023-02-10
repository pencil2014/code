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
          <div class="money-title">对账结果</div>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" @click="closeAccountChecking" size="mini">返回</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" type="primary" @click="compare" size="mini">对账</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              @click="allConfirm"
              :loading="btnLoading"
              size="mini"
            >确认费用</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              type="primary"
              @click="createSettlement"
              size="mini"
            >生成结算单</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    <div class="settlement-detail-form">
      <el-form :model="detailForm" ref="form" :inline="true" size="mini" label-width="100px">
        <DetailDiv label="对账单编号：" :content="detailForm.supplierBillNo"></DetailDiv>
        <DetailDiv label="快递公司：" :content="detailForm.supplierCorpName" :isTooltip="true"></DetailDiv>
        <DetailDiv label="结算分公司：" :content="detailForm.settleCompName" :isTooltip="true"></DetailDiv>
        <el-form-item label="比对方式：" prop="compareType">
          <el-select v-model="detailForm.compareType" placeholder="请输入">
            <el-option
              v-for="(op, j) in dictMap['expressBillCompareType']"
              :key="'expressBillCompareType' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <DetailDiv
          label="费用确认："
          :content="dictMapObj['webConfirmStatus'][detailForm.confirmStatus]"
        ></DetailDiv>
      </el-form>
    </div>
    <div class="table_card">
      <h3>
        对比结果
        <span
          :style="{color:detailForm.matchResult !='all'? '#CD4130':'#33B18A'}"
          :class="[detailForm.matchResult !='all'?'el-icon-info' : 'el-icon-success']"
        ></span>
        <span
          :style="{color:detailForm.matchResult !='all'? '#CD4130':'#33B18A'}"
          v-html="dictMapObj['supplierBillCompareMatchResult'][detailForm.matchResult]"
        ></span>
        <!-- v-if="checkAuth($route.name, 'btn-exportData')" -->

        <el-radio-group
          style="float:right;margin-left: 8px;"
          v-model="matchResult"
          size="mini"
          @change="matchResultChange"
        >
          <el-radio-button label>全部</el-radio-button>
          <el-radio-button label="yes">匹配</el-radio-button>
          <el-radio-button label="no">不匹配</el-radio-button>
        </el-radio-group>
        <el-button style="float:right;" type="default" size="mini" @click="exportData">导出</el-button>
      </h3>
      <FinanceTableMass :option="option1" />
    </div>
    <!-- 修改结算单位 -->
    <el-dialog
      class="page"
      v-if="exchangeCorpDialog"
      :visible.sync="exchangeCorpDialog"
      title="生成结算单"
      width="500px"
      label-width="130px"
    >
      <el-form :model="corpForm" ref="corpForm" :rules="corpRules" size="mini">
        <el-form-item label="结算单归属分公司：" prop="settleCorp">
          <el-select
            style="width: 100%;"
            v-model="corpForm.settleCorp"
            value-key="value"
            placeholder="请选择分公司"
            filterable
            remote
            :remote-method="(val) => settleCorpSelectRemote(val)"
            @visible-change="(val) => val && settleCorpSelectRemote('')"
          >
            <el-option
              v-for="(item,index) in settleCorpSelectList"
              :key="item.value+item.label+index"
              :label="item.label"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <span style="color:#BFBFBF;padding-left: 130px;">请选择快递费付款的分公司</span>
      </el-form>
      <div class="dialog-footer" slot="footer">
        <el-button @click="exchangeCorp" size="mini" type="primary">确定</el-button>
        <el-button @click="exchangeCorpDialog = false" size="mini">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { querySourceTypeByNo } from '@/api/fin/fee'
import EXPRESS from '@/api/fin/expressBill'
export default {
  mixins: [mixin, routerMixin],
  activated() {
    if (this.$route.meta.isUseCache) {
      return
    }
    this.expressBillId = this.$route.query.expressBillId
    this.getData()
  },
  data() {
    return {
      option1: {},
      detailForm: {},
      dialogVisible: false,
      source: '',
      dialogVisibleDiff: false,
      companyNum: 0,
      companyPay: [],
      companyReceive: [],
      supplierNum: 0,
      supplierPay: [],
      supplierReceive: [],
      isCompared: false,
      supplierBillId: undefined,
      expressBillId: undefined,
      settleOrderNos: [],
      corpForm: { settleCorp: '' },
      corpRules: { settleCorp: [{ required: true, message: ' ', trigger: 'change' }] },
      settleCorpSelectList: [],
      exchangeCorpDialog: false,
      matchResult: '',
    }
  },
  components: {
    FinanceTableMass,
  },
  created() {
    let common = { data: [], tips: { show: false }, selection: false, rootTipsHide: true, operationBtns: false }
    this.option1 = Object.assign({}, this.option, common, {
      id: 'option1',
      $name: 'ExpressBillListResult',
      index: { show: true },
      pagination: { ...this.option.pagination, show: true, isNew: true },
      columns: [],
      colgroups: [
        {
          title: '供应商费用',
          // className: 'express',
          className: 'supplier',
          columns: [
            { prop: 'matchResult', label: '是否匹配', type: 'select', propInDict: 'yesNo', width: 60 },
            { prop: 'matchRemark', label: '差异说明', width: 130, type: 'text' },
            { prop: 'supplierExpressNo', label: '快递单号', width: 150, type: 'text' },
            { prop: 'supplierCorpName', label: '快递公司', type: 'text', width: 200 },
            { prop: 'supplierFeeCurrency', label: '币种', type: 'text', width: 60 },
            { prop: 'supplierFeeAmt', label: '金额', type: 'text', width: 80 },
            { prop: 'supplierRemark', label: '备注', type: 'text', width: 200 },
            // { prop: 'supplierReceipayType', label: '收付类型', type: 'select', propInDict: 'feeitemReceipayGroup', width: 60 },
            // { prop: 'supplierFeeName', label: '费用名称', type: 'text', width: 80 },
          ],
        },
        {
          title: '系统费用',
          // className: 'express_system',
          className: 'system',
          columns: [
            { prop: 'expressNo', label: '快递单号', width: 150, type: 'text' },
            { prop: 'expressCorpName', label: '快递公司', type: 'text', width: 200 },
            { prop: 'settleCompName', label: '结算分公司', type: 'text', width: 200 },
            { prop: 'feeCurrency', label: '币种', type: 'text', width: 60 },
            { prop: 'feeAmt', label: '金额', type: 'text', width: 80 },
            {
              prop: 'orderNo',
              label: '工作单号',
              width: 150,
              component: 'ColumnTip',
              componentProps: {
                show: false,
                data: [],
                callback: (no, componentProps) => {
                  querySourceTypeByNo({ sourceBizNo: no }).then((res) => {
                    this.showOneNoDetail(res.data.sourceType, res.data.sourceBizNo)
                  })
                },
              },
            },
            { prop: 'employeeName', label: '员工', type: 'text', width: 130 },
            {
              prop: 'hasSettleOrderAfterCompare',
              label: '对账后是否生成结算单',
              type: 'select',
              propInDict: 'yesNo',
              width: 150,
            },
            { prop: 'settleOrderNo', label: '结算单号', type: 'text', width: 150 },
            // { prop: 'receipayType', label: '收付类型', type: 'select', propInDict: 'feeitemReceipayGroup', width: 80 },
            // // { prop: 'feeName', label: '费用名称', type: 'text' },
            // { prop: 'feeAmt', label: '系统原金额', type: 'text', width: 80 },
            // { prop: 'matchAmt', label: '本次对账金额', type: 'text', width: 110 },
            // { prop: 'currency', label: '系统币种', type: 'text', width: 60 },
            // { prop: 'diffAmt', label: '差额', type: 'text', width: 80 },
            // { prop: 'orderNo', label: '费用确认状态', type: 'text' },
            // { prop: 'orderNo', label: '费用创建人', type: 'text' },
          ],
        },
      ],
    })
  },
  methods: {
    // 获取寄单对账详情
    getData() {
      this.matchResult = ''
      EXPRESS.detail({ expressBillId: this.expressBillId }).then((res) => {
        let { feeTotalAmt, bizDateStart, bizDateEnd } = res.data
        let fn = (obj) => Object.keys(obj || {}).reduce((str, cur) => (str += cur + obj[cur] + '&nbsp;&nbsp;'), '')
        let fn2 = (obj, isPay) => Object.keys(obj || {}).map((key) => ({ currency: key, amt: obj[key], isPay }))
        this.supplierPay = fn2(feeTotalAmt, true)
        let supplierPayMapStr = fn(feeTotalAmt)
        this.detailForm = Object.assign({}, res.data, {
          bizDate: bizDateStart + '至' + bizDateEnd,
          supplierPayMapStr,
          matchResult: res.data.result || res.data.matchResult,
          compareType: res.data.compareType || this.dictMap['expressBillCompareType'][0].value,
        })
        this.getTableData()
      })
    },
    matchResultChange(val) {
      console.log(val)
      this.option1.pagination.currPage = 1
      this.getTableData()
    },
    getTableData() {
      let timeStamp = +new Date()
      if (this.diyTimeStamp && timeStamp - this.diyTimeStamp < 800) {
        return
      }
      this.diyTimeStamp = timeStamp
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [{ column: 'expressBillId', type: 'default', value: this.expressBillId }],
        // { column: 'matchResult', type: 'default', value: this.detailForm.matchResult },
      }
      if (this.matchResult) {
        data.query.push({ column: 'matchResult', type: 'eq', value: this.matchResult })
      }
      EXPRESS.listCompareLogPage(data)
        .then((res) => {
          this.option1.data = res.data.list.map((item) => ({ _isRefused: item.matchResult === 'no', ...item }))
          Object.assign(this.option1.pagination, res.data)
        })
        .finally(() => (this.lsLoading = false))
    },
    // 执行对账
    compare() {
      EXPRESS.compare({ expressBillId: this.expressBillId, compareType: this.detailForm.compareType }).then((res) => {
        this.getData()
        this.$msgSucClose('对账成功！')
        this.isCompared = true
      })
    },
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getTableData()
    },
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getTableData()
    },
    closeSelectSettlement() {
      this.dialogVisible = false
    },
    // 确认费用
    allConfirm(del) {
      if (this.detailForm.matchResult !== 'all') {
        return this.$msgErrClose('完全匹配的账单才能确认费用!')
      }
      this.btnLoading = true
      EXPRESS.confirm({ expressBillId: this.expressBillId })
        .then((res) => {
          if (del === true) return
          this.$msgSucClose('全部确认成功!')
          this.detailForm.confirmStatus = 'yes'
        })
        .finally(() => (this.btnLoading = false))
    },
    // 生成结算单
    createSettlement() {
      if (this.detailForm.matchResult !== 'all') {
        return this.$msgErrClose('部分匹配不能生成结算单!')
      }
      if (this.detailForm.confirmStatus !== 'yes') {
        return this.$msgErrClose('未进行费用确认不能生成结算单！')
      }
      this.corpForm.settleCorp = ''
      this.exchangeCorpDialog = true
      let { settleCompanyCode, settleCompanyName } = this.$store.state.user.userInfo
      this.$nextTick(() => {
        this.settleCorpSelectList = [{ value: settleCompanyCode, label: settleCompanyName }]
        this.corpForm.settleCorp = this.settleCorpSelectList[0]
      })
    },
    settleCorpSelectRemote(queryString) {
      this.$store.dispatch('dict/querySettleUnit', { queryString, unitTypes: 'company' }).then((data) => {
        this.settleCorpSelectList = data.map((item) => ({ label: item.value, value: item.key }))
      })
    },
    exchangeCorp() {
      this.$refs.corpForm.validate((valid) => {
        if (!valid) return
        this.exchangeCorpDialog = false
        this.routerPushTab('CreateSettlement', {
          source: 'createSettlementFromExpressBill',
          expressBillId: this.expressBillId,
          supplierBillNo: this.detailForm.supplierBillNo,
          settleCompCode: this.corpForm.settleCorp.value,
          settleCompName: this.corpForm.settleCorp.label,
        })
      })
    },
    closeAccountChecking() {
      this.routerBack()
    },
    checkDetail(logId) {
      let matchFeeSourceType = this.detailForm.matchFeeSourceType
      this.routerPush('SupplierBillListSystem', { compareId: this.lastCompareId, logId, matchFeeSourceType })
    },
    exportData() {
      this.lsLoading = true
      this.$store
        .dispatch('finance/downloadBlobFilePost', {
          uri: '/fin/expressBill/exportCompareLog',
          data: { data: { expressBillId: this.expressBillId, matchResult: this.matchResult } },
        })
        .then((res) => {
          this.lsLoading = false
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = '快递费对账结果.xlsx'
          link.click()
        })
        .catch((err) => {
          this.lsLoading = false
          console.log(err)
          // this.$msgErrClose(err)
        })
    },
  },
}
</script>
<style lang="scss" scoped>
.finance-select-settlement .el-dialog__body {
  padding: 0;
}
.finance-select-settlement .finance-page {
  min-height: calc(100vh - 348px);
}
.finance-diff-compare .el-dialog {
  min-height: 500px;
}
.page ::v-deep .el-dialog__body .el-input--mini,
.page ::v-deep .el-dialog__body .el-date-editor--daterange {
  width: 260px;
}
.page ::v-deep .el-dialog__body {
  padding: 30px 24px;
  .el-form-item {
    display: flex;
    width: 100%;
    & > label {
      flex: 0 0 auto;
    }
    .el-form-item__content {
      flex: 1 1 auto;
    }
  }
  .el-autocomplete,
  .el-autocomplete .el-input,
  .el-autocomplete .el-input input .el-autocomplete,
  .el-select,
  .el-select .el-input,
  .el-select .el-input input,
  .upload-file-cont {
    width: 100% !important;
  }
}
.el-form-item {
  width: 278px;
  margin-bottom: 7px;
  margin-right: 0;
  font-size: 12px;
}
.el-form-item ::v-deep .el-form-item__content {
  font-size: 12px;
}
.finance-detail-page {
  background: #fff;
}
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
}
.money-box.money-box-overflow {
  padding: 10px 0 10px 16px;
  /* height: 100px; */
}
.money-box.money-box-overflow .money-title {
  line-height: 20px;
}
.money-box.money-box-overflow .money-title {
  min-width: 80px;
}
.table_card {
  margin: 0 8px;
  border-radius: 4px;
  border: 1px solid #e9e9e9;
  h3 {
    padding: 5px 8px;
    line-height: 20px;
    font-size: 14px;
    background-color: #f8f9fd;
    & > span {
      color: red;
      font-size: 12px;
      font-weight: normal;
    }
  }
}
.result-dialog-descript {
  margin-top: 12px;
  span {
    font-size: 12px;
    display: inline-block;
    color: #222;
    width: 33%;
    margin-top: 8px;
    float: left;
    text-align: left;
  }
}
</style>