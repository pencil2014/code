<template>
  <div class="finance-page">
    <div class="money-box money-box-border-bottom">
      <div class="money-box-left">
        <div class="money-title">{{$t('Charge.preSalesDetail')}}</div>
      </div>
      <div class="money-box-right">
        <el-button-group v-if="!receivableRegInfo.acctVoucherSeqno && checkAuth($route.name, 'btn-voucherView')">
          <el-button
            class="finance-btn"
            size="mini"
            type="inner"
            @click="generateFn('preview')"
            >{{$t('Charge.deduVouchers')}}</el-button
          >
        </el-button-group>
        <el-button-group v-if="!receivableRegInfo.acctVoucherSeqno && checkAuth($route.name, 'btn-voucherCreate')">
          <el-button
            class="finance-btn"
            size="mini"
            type="inner"
            @click="generateFn('created')"
            >{{$t('Charge.deduGener')}}</el-button
          >
        </el-button-group>
        <el-button-group v-if="receivableRegInfo.acctVoucherSeqno && checkAuth($route.name, 'btn-voucherDel')">
          <el-button
            class="finance-btn"
            size="mini"
            type="danger"
            @click="delVoucher('created')"
            >{{$t('Charge.deduDel')}}</el-button
          >
        </el-button-group>
        <el-button-group>
          <el-button class="finance-btn" size="mini" @click="back"
           >{{$t('Common.back')}}</el-button
          >
        </el-button-group>
      </div>
    </div>
    <div class="orderDetail-box">
      <div class="item-box">
        <div class="title">{{$t('Charge.writeoffInfo')}}</div>
        <div class="info-box">
          <div class="base-item">
            <span class="sub-title">{{$t('Hedge.writeoffNo')}}: </span
            >{{ receivableRegInfo.writeoffNopayNo }}
          </div>
          <div class="base-item">
            <span class="sub-title">{{$t('Charge.underwritSubtypes')}}: </span
            >{{ dictMapObj.writeoffType[receivableRegInfo.writeoffType] }}
          </div>
          <div class="base-item">
            <span class="sub-title">{{$t('FinBill.approvalResult')}}: </span
            >{{
              dictMapObj.writeoffRecheckStatus[receivableRegInfo.auditStatus]
            }}
          </div>
          <div class="base-item">
            <span class="sub-title">{{$t('Hedge.voucherNumber')}}: </span
            ><MultiBtn :btnStr="receivableRegInfo.acctVoucherSeqno?receivableRegInfo.acctVoucherSeqno+'/'+receivableRegInfo.voucherNo:''" @generate="createGenerate"/>
          </div>
          <div class="base-item">
            <span class="sub-title">{{$t('FeeList.writeOffDate')}}: </span
            ><el-date-picker
              v-model="receivableRegInfo.writeoffDate"
              type="date"
              size="mini"
              value-format="yyyy-MM-dd"
              :placeholder="$t('Common.plSelect')"
              :disabled="disabledData"
            >
            </el-date-picker>
            <el-button
              type="text"
              style="margin-left: 5px"
              @click="editDate"
              v-show="disabledData"
              >{{$t('Common.modify')}}</el-button
            >
            <el-button
              type="text"
              style="margin-left: 5px"
              @click="updateWriteoffDate"
              v-show="!disabledData"
              >{{$t('Common.save')}}</el-button
            >
          </div>
          <div class="base-item">
            <span class="sub-title">{{$t('Hedge.writeoffs')}}: </span
            >{{ receivableRegInfo.writeoffName }}
          </div>
          <div class="base-item">
            <span class="sub-title">{{$t('Hedge.writeoffTime')}}: </span
            >{{ receivableRegInfo.writeoffTime }}
          </div>
        </div>
      </div>
      <div class="item-box">
        <div class="title">{{$t('Charge.setUnitInfo')}}</div>
        <div class="info-box">
          <div class="base-item">
            <span class="sub-title">{{$t('FeeList.settleCorp')}}: </span
            ><el-tooltip
              :content="receivableRegInfo.settleCorpName"
              placement="top"
            >
              <p class="text-over">{{ receivableRegInfo.settleCorpName }}</p>
            </el-tooltip>
            <!-- {{ receivableRegInfo.settleCorpName }} -->
          </div>
          <div class="base-item">
            <span class="sub-title">{{$t('FeeList.settleCorpType')}}: </span>
            <template v-if="receivableRegInfo.settleCorpType">
              <b
                v-for="item in receivableRegInfo.settleCorpType.split(',')"
                :key="item"
              >
                {{ dictMapObj.unitType[item] }}
              </b>
            </template>
          </div>
          <div class="base-item">
            <span class="sub-title">{{$t('Collect.isVirtual')}}: </span
            >{{ dictMapObj.yesNo[receivableRegInfo.isTemporary] }}
          </div>
        </div>
      </div>
      <div class="item-box">
        <div class="title-box">
          <div class="title">{{$t('Charge.badDebtInfo')}}</div>
          <div class="btn">
            <div class="toggle" @click="showReceiveData = !showReceiveData">
              {{ showReceiveData ? $t('Common.collapse') : $t('Common.expand')
              }}<i :class="[`el-icon-arrow-up`]" v-if="showReceiveData"></i>
              <i :class="[`el-icon-arrow-down`]" v-else></i>
            </div>
          </div>
        </div>
        <div class="info-box" v-show="showReceiveData">
          <div class="base-item">
            <span class="sub-title">{{$t('FeeList.settleOrderNo')}}: </span>{{ settleOrderBaddebtNo }}
          </div>
          <div class="base-item">
            <span class="sub-title">{{$t('Charge.baddebtTreat')}}: </span
            >{{ dictMapObj['baddebtDealWay'][receivableRegInfo.dealWay] }}
          </div>
          <div class="base-item">
            <span class="sub-title">{{$t('Settle.branchCompany')}}: </span
            ><el-tooltip
              :content="receivableRegInfo.settleCompName"
              placement="top"
            >
              <p class="text-over">{{ receivableRegInfo.settleCompName }}</p>
            </el-tooltip>
            <!-- {{ receivableRegInfo.settleCompName }} -->
          </div>
          <div class="base-item">
            <span class="sub-title">{{$t('Charge.totalBaddebts')}}: </span
            >{{ receivableRegInfo.badSumAmt }}
          </div>
          <div class="base-item">
            <span class="sub-title">{{$t('Charge.debtsReasons')}}: </span
            >{{ dictMapObj['baddebtReason'][receivableRegInfo.badReason] }}
          </div>
          <div class="base-item">
            <span class="sub-title">{{$t('Settle.applicant')}}: </span
            >{{ receivableRegInfo.createdName }}
          </div>
          <div class="base-item">
            <span class="sub-title">{{$t('Settle.applicationDate')}}: </span
            >{{ receivableRegInfo.createdTime }}
          </div>
          <div class="base-item">
            <span class="sub-title">{{$t('FinBill.approverName')}}: </span
            >{{ receivableRegInfo.auditName }}
          </div>
          <div class="base-item">
            <span class="sub-title">{{$t('FinBill.approveEndTime')}}:</span
            >{{ receivableRegInfo.auditTime }}
          </div>
          <div class="base-item">
            <span class="sub-title">{{$t('Settle.applyRemarks')}}: </span
            >{{ receivableRegInfo.remark }}
          </div>
        </div>
      </div>
      <div class="table-box">
        <div class="title-box">
          <div class="title">
            {{$t('FeeList.expensesList')}}
            <span class="total">{{$t('Common.total')}}: {{ receivableRegInfo.badSumAmt }}</span>
          </div>
        </div>
        <FinanceTable :option="option1" />
      </div>
    </div>
    <PreviewDialog :dialogOption="previewDialog" @generate="createGenerate" 
     :showDel="checkAuth($route.name, 'btn-voucherDel')"
     :showCreate="checkAuth($route.name, 'btn-voucherCreate')"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { preOrderInfo, updateWriteoffDate } from '@/api/fin/settleOrderBaddebt'
import { badDebitPreWriteOffGenerate, voucherDelete } from '@/api/fin/voucher'
export default {
  components: {
    FinanceTable,
    PreviewDialog
  },
  mixins: [mixin, routerMixin],
  data() {
    return {
      settleOrderBaddebtNo: '',
      receivableRegInfo: {},
      option1: {},
      disabledData: true,
      showReceiveData: true,
      previewDialog: {
        show: false,
        title: this.$t('Common.previewVoucher'),
        seqNo: '',
        showData: {}
      }
    }
  },
  created() {
    this.settleOrderBaddebtNo = this.$route.query.settleOrderBaddebtNo
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'BadOrderDetail',
      data: [],
      tips: false,
      operationBtns: false,
      selection: false,
      index: {
        show: true
      }
    })
    const columns1 = [
      {
        prop: 'sourceBizNo',
        label: this.$t('PreClose.bizNo'),
        width: 150,
        type: 'button',
        operationBtns: {
          show: true,
          callback: (action, index, row, option) => {
            this.showDetail(row)
          }
        }
      },
      { prop: 'settleCompName', label: this.$t('FeeList.settleComp'), type: 'text', width: 150 },
      { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', width: 150 },
      { prop: 'serviceName', label: this.$t('FeeList.serviceCodes'), type: 'text' },
      // { prop: 'feeName', label: this.$t('FeeList.feeEname'), type: 'text' },
      { prop: 'feeEnName', label: this.$t('FeeList.feeEname'), type: 'text' },
      {
        prop: 'extractStatus',
        label: this.$t('Charge.extractStatus'),
        type: 'select',
        // propInDict: 'yesNo'
      },
      { prop: 'emplAbatementNo', label: this.$t('Charge.emplAbatementNo'), type: 'text' },
      { prop: 'currency', label: this.$t('FeeList.currency'), type: 'text' },
      { prop: 'unitPrice', label: this.$t('FeeList.unitPrice'), type: 'text' },
      { prop: 'unitCount', label: this.$t('FeeList.quantity'), type: 'text' },
      { prop: 'feeAmt', label: this.$t('FeeList.feeAmt'), type: 'text' },
      {
        prop: 'feeUnit',
        label: this.$t('FeeList.feeUnit'),
        type: 'select',
        propInDict: 'feeUnit'
      },
      { prop: 'badAmt', label: this.$t('Charge.debtsAmt'), type: 'text' },
      { prop: 'employeeName', label: this.$t('FeeList.bdEmployeeId'), type: 'text' },
      { prop: 'deptName', label: this.$t('FinBill.department'), type: 'text' },
      { prop: 'finDate', label: this.$t('FeeList.finDate'), width: 86, type: 'text' },
    ]
    this.option1.columns = columns1
    this.getData()
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj'])
  },
  methods: {
    // 获取数据
    getData() {
      const data = {
        settleOrderBaddebtNo: this.settleOrderBaddebtNo
      }
      preOrderInfo(data)
        .then(res => {
          if (res.code === 0) {
            this.receivableRegInfo = res.data
            this.option1.data = res.data.feeList || []
          }
        })
        .catch(() => {})
    },
    // 返回
    back() {
      this.routerBack()
    },
    // 修改核销日期
    editDate() {
      if (this.receivableRegInfo.acctVoucherSeqno) {
        return this.$msgErrClose(this.$t('Charge.cannotChange'))
      }
      this.disabledData = false
    },
    // 更新核销日期
    updateWriteoffDate() {
      if (!this.receivableRegInfo.writeoffDate) {
        return this.$msgErrClose(this.$t('Charge.dateFirst'))
      }
      const data = {
        writeoffNopayId: this.receivableRegInfo.writeoffNopayId,
        writeoffDate: this.receivableRegInfo.writeoffDate
      }
      updateWriteoffDate(data)
        .then(res => {
          if (res.cdoe === 0) {
            this.$msgSucClose(this.$t('Charge.modifiedSuc'))
            this.disabledData = true
          }
        })
        .catch(() => {})
    },
    // 显示水单委托单
    showAttachment(path) {
      const href = `/base/fileView/preview/${path}/sowoll`
      window.open(href)
    },
    // 删除凭证  每行只有单个凭证
    delVoucher(){ 
      let arr = [this.receivableRegInfo]
      let voucherNos = []
      let voucherSeqNos = []
      arr.forEach((val) => {
        voucherNos.push(val.voucherNo)
        voucherSeqNos.push(val.acctVoucherSeqno)
      })
      voucherNos = [...new Set(voucherNos)].filter(v=>v!=='null')
      voucherSeqNos = [...new Set(voucherSeqNos)]
      // return console.log(voucherSeqNos);
      this.$confirmWarn(this.$t('Hedge.detailsTips',{voucherNos: voucherNos.join(',')}), () => {
        voucherDelete({ voucherSeqNos }).then((res) => {
          this.$msgSucClose(this.$t('Settle.deleteSuc'))
          this.getData()
        })
      })
    },
    // 生成凭证
    generateFn(status) {
      if (status === 'preview') {
        this.previewGenerate()
      } else {
        this.createGenerate()
      }
    },
    // 生成凭证
    createGenerate(refresh) {
      if(refresh === 'refresh'){
        this.getData()
        return
      }
      const acctVoucherSeqno = this.receivableRegInfo.acctVoucherSeqno
      if (acctVoucherSeqno) {
        return this.$msgErrClose(this.$t('Hedge.voucherTips'))
      }
      const data = {
        writeoffNopayNos: [this.receivableRegInfo.writeoffNopayNo],
        bizType: 'bad_pre_writeoff'
      }
      badDebitPreWriteOffGenerate(data).then(res => {
        if (res.code === 0) {
          this.$msgSucClose(this.$t('Hedge.processedTips'))
          window.setTimeout(() => {
            this.getData()
          }, 1000)
        }
      })
    },
    // 预览凭证
    previewGenerate() {
      const data = {
        writeoffNopayNos: [this.receivableRegInfo.writeoffNopayNo],
        bizType: 'bad_pre_writeoff',
        preview: 'yes'
      }
      badDebitPreWriteOffGenerate(data)
        .then(res => {
          if (res.code === 0) {
            this.previewDialog.seqNo = ''
            this.previewDialog.showData = res.data
            this.previewDialog.show = true
          }
        })
        .catch(() => {})
    },
    // 单号详情
    showDetail(row) {
      const sourceBizNo = row.sourceBizNo
      this.showOneNoDetail('sourceBizNo', sourceBizNo)
    }
  },
  activated() {
    this.settleOrderBaddebtNo = this.$route.query.settleOrderBaddebtNo
    this.getData()
  }
}
</script>

<style lang="scss" scoped>
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
  background-color: #fff;
}
.orderDetail-box {
  .item-box {
    border-bottom: 1px solid #d8d8d8;
    // padding-bottom: 10px;
    margin: 0 8px 0;
    .title {
      font-weight: 600;
      color: #222222;
      line-height: 20px;
      padding: 8px;
    }
    .info-box {
      display: flex;
      flex-wrap: wrap;
      margin: 8px 8px 0 8px;
      .base-item-list {
        flex-basis: 100%;
        display: flex;
      }
      .flex-item {
        display: flex;
        label {
          width: 40px;
          font-weight: normal;
        }
      }
      .base-item {
        flex-basis: calc(25% - 10px);
        margin-bottom: 10px;
        margin-right: 10px;
        b {
          font-weight: normal;
        }
        .sub-title {
          min-width: 150px;
          text-align: right;
          display: inline-block;
          padding-right: 5px;
          // text-align-last: justify;
        }
        .el-input,
        .el-input--suffix,
        .el-upload--text,
        .finance-table-upload,
        .el-select {
          width: 120px;
        }
        .link {
          font-weight: 400;
          color: #3e80f5;
          line-height: 20px;
          cursor: pointer;
          margin-left: 5px;
        }
      }
      .el-select {
        width: 100px;
        margin-right: 5px;
      }
    }
  }
  .el-button--text {
    font-size: 12px;
    padding: 0 5px;
  }
  .table-box {
    border: 1px solid #e9e9e9;
    border-radius: 4px;
    margin: 16px 8px;
    overflow: hidden;
    .title-box {
      background: #f8f9fd;
    }
    .bill-box {
      margin: -5px 0 15px 5px;
      display: flex;
      padding: 8px;
      color: #4a4a4a;
      span {
        flex-basis: 300px;
      }
    }
  }
  .title-box {
    display: flex;
    // margin-bottom: 15px;
    background: #f8f9fd;
    .title {
      flex: 1;
      height: 30px;
      font-weight: 600;
      color: #222222;
      line-height: 30px;
      padding: 0 8px;
      display: flex;
      .total {
        font-weight: normal;
        color: green;
        margin-left: 10px;
      }
    }
    .money-list {
      margin-left: 20px;
      font-weight: normal;
    }
    span {
      color: #222;
      b {
        color: #33b18a;
        font-weight: 500;
      }
    }
    .btn {
      padding: 0;
      margin: 5px 15px;
      display: flex;
      .toggle {
        line-height: 20px;
        margin-left: 20px;
        cursor: pointer;
        color: #409eff;
        i {
          margin-left: 2px;
        }
      }
    }
    .el-button {
      height: 20px;
      background: none !important;
      border-radius: 4px;
      border: 1px solid #d9d9d9;
      text-align: center;
      line-height: 20px;
      padding: 0 8px;
      font-size: 12px;
    }
  }
}
.text-over {
  display: inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 140px;
  vertical-align: middle;
}
</style>
