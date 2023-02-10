<template>
  <div class="finance-page">
    <div class="money-box money-box-border-bottom">
      <div class="money-box-left">
        <div class="money-title">提成预销单详情</div>
      </div>
      <div class="money-box-right">
        <el-button
          v-if="!voucherNos && checkAuth($route.name, 'btn-voucherView')"
          class="finance-btn"
          size="mini"
          type="inner"
          @click="generateFn('preview')"
        >预览运营扣除凭证</el-button>
        <el-button
          v-if="!voucherNos && checkAuth($route.name, 'btn-voucherCreate')"
          class="finance-btn"
          size="mini"
          type="inner"
          @click="generateFn('created')"
        >生成运营扣除凭证</el-button>
        <el-button
          v-if="voucherNos && checkAuth($route.name, 'btn-voucherDel')"
          class="finance-btn"
          size="mini"
          type="danger"
          @click="delVoucher"
        >删除运营扣除凭证</el-button>
        <el-button
          v-if="!exVoucherNos && checkAuth($route.name, 'btn-voucherView')"
          @click="generateFn('preview', true)"
          size="mini"
          type="outer"
        >预览会计扣除凭证</el-button>
        <el-button
          v-if="!exVoucherNos && checkAuth($route.name, 'btn-voucherCreate')"
          @click="generateFn('created', true)"
          size="mini"
          type="outer"
        >生成会计扣除凭证</el-button>
        <el-button
          v-if="exVoucherNos && checkAuth($route.name, 'btn-voucherDel')"
          @click="delVoucher(true)"
          size="mini"
          type="danger"
        >删除会计扣除凭证</el-button>
        <el-button class="finance-btn" size="mini" @click="back">返回</el-button>
      </div>
    </div>
    <div class="orderDetail-box">
      <div class="item-box">
        <div class="title">核销信息</div>
        <div class="info-box">
          <div class="base-item">
            <span class="sub-title">核销编号：</span>
            {{ receivableRegInfo.writeoffNopayNo }}
          </div>
          <div class="base-item">
            <span class="sub-title">核销子类型：</span>
            {{ dictMapObj.writeoffType[receivableRegInfo.writeoffType] }}
          </div>
          <div class="base-item">
            <span class="sub-title">审核状态：</span>
            {{
            dictMapObj.writeoffRecheckStatus[receivableRegInfo.auditStatus]
            }}
          </div>
          <div class="base-item">
            <span class="sub-title">运营扣除凭证号：</span>
            <!-- :btnStr="receivableRegInfo.acctVoucherSeqno?receivableRegInfo.acctVoucherSeqno+'/'+receivableRegInfo.voucherNo:''" -->
            <MultiBtn :btnStr="voucherNos||''" @generate="createGenerate" />
          </div>
          <div class="base-item">
            <span class="sub-title">会计扣除凭证号：</span>
            <!-- :btnStr="receivableRegInfo.acctVoucherSeqno?receivableRegInfo.acctVoucherSeqno+'/'+receivableRegInfo.voucherNo:''" -->
            <MultiBtn
              :isEx="true"
              :btnStr="exVoucherNos||''"
              @generate="createGenerate($event, true)"
            />
          </div>
          <div class="base-item">
            <span class="sub-title">核销日期：</span>
            <el-date-picker
              v-model="receivableRegInfo.writeoffDate"
              type="date"
              size="mini"
              value-format="yyyy-MM-dd"
              placeholder="选择日期"
              :disabled="disabledData"
            ></el-date-picker>
            <el-button
              type="text"
              style="margin-left: 5px"
              @click="editDate"
              v-show="disabledData"
            >修改</el-button>
            <el-button
              type="text"
              style="margin-left: 5px"
              @click="updateWriteoffDate"
              v-show="!disabledData"
            >保存</el-button>
          </div>
          <div class="base-item">
            <span class="sub-title">核销人：</span>
            {{ receivableRegInfo.writeoffName }}
          </div>
          <div class="base-item">
            <span class="sub-title">核销时间：</span>
            {{ receivableRegInfo.writeoffTime }}
          </div>
        </div>
      </div>
      <div class="item-box">
        <div class="title">结算单位信息</div>
        <div class="info-box">
          <div class="base-item">
            <span class="sub-title">结算单位：</span>
            <el-tooltip :content="receivableRegInfo.settleCorpName" placement="top">
              <p class="text-over">{{ receivableRegInfo.settleCorpName }}</p>
            </el-tooltip>
            <!-- {{ receivableRegInfo.settleCorpName }} -->
          </div>
          <div class="base-item">
            <span class="sub-title">结算单位类型：</span>
            <template v-if="receivableRegInfo.settleCorpType">
              <b
                v-for="item in receivableRegInfo.settleCorpType.split(',')"
                :key="item"
              >{{ dictMapObj.unitType[item] }}</b>
            </template>
          </div>
          <div class="base-item">
            <span class="sub-title">是否虚拟：</span>
            {{ dictMapObj.yesNo[receivableRegInfo.isTemporary] }}
          </div>
        </div>
      </div>
      <div class="item-box">
        <div class="title-box">
          <div class="title">坏账信息</div>
          <div class="btn">
            <div class="toggle" @click="showReceiveData = !showReceiveData">
              {{ showReceiveData ? '收起' : '展开'
              }}
              <i
                :class="[`el-icon-arrow-up`]"
                v-if="showReceiveData"
              ></i>
              <i :class="[`el-icon-arrow-down`]" v-else></i>
            </div>
          </div>
        </div>
        <div class="info-box" v-show="showReceiveData">
          <div class="base-item">
            <span class="sub-title">结算单号：</span>
            {{ settleOrderBaddebtNo }}
          </div>
          <div class="base-item">
            <span class="sub-title">坏账处理方式：</span>
            {{ dictMapObj['baddebtDealWay'][receivableRegInfo.dealWay] }}
          </div>
          <div class="base-item">
            <span class="sub-title">所属分公司：</span>
            <el-tooltip :content="receivableRegInfo.settleCompName" placement="top">
              <p class="text-over">{{ receivableRegInfo.settleCompName }}</p>
            </el-tooltip>
            <!-- {{ receivableRegInfo.settleCompName }} -->
          </div>
          <div class="base-item">
            <span class="sub-title">坏账金额合计：</span>
            {{ receivableRegInfo.badSumAmt }}
          </div>
          <div class="base-item">
            <span class="sub-title">坏账原因：</span>
            {{ dictMapObj['baddebtReason'][receivableRegInfo.badReason] }}
          </div>
          <div class="base-item">
            <span class="sub-title">申请人：</span>
            {{ receivableRegInfo.createdName }}
          </div>
          <div class="base-item">
            <span class="sub-title">申请时间：</span>
            {{ receivableRegInfo.createdTime }}
          </div>
          <div class="base-item">
            <span class="sub-title">审核人：</span>
            {{ receivableRegInfo.auditName }}
          </div>
          <div class="base-item">
            <span class="sub-title">审核时间：</span>
            {{ receivableRegInfo.auditTime }}
          </div>
          <div class="base-item">
            <span class="sub-title">申请备注：</span>
            {{ receivableRegInfo.remark }}
          </div>
        </div>
      </div>
      <div class="table-box">
        <div class="title-box">
          <div class="title">
            费用列表
            <span class="total">合计：{{ receivableRegInfo.badSumAmt }}</span>
          </div>
        </div>
        <FinanceTable :option="option1" />
      </div>
    </div>
    <PreviewDialog
      :dialogOption="previewDialog"
      @generate="createGenerate($event, isExt)"
      :showDel="checkAuth($route.name, 'btn-voucherDel')"
      :showCreate="checkAuth($route.name, 'btn-voucherCreate')"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { preOrderInfo, updateWriteoffDate } from '@/api/fin/settleOrderBaddebt'
import { badDebitPreWriteOffGenerate, exBadDebitPreWriteOffGenerate, voucherDelete, exVoucherDelete } from '@/api/fin/voucher'
export default {
  components: {
    FinanceTable,
    PreviewDialog,
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
        title: '凭证预览',
        seqNo: '',
        showData: {},
      },
      voucherNos: '',
      exVoucherNos: '',
    }
  },
  created() {
    this.settleOrderBaddebtNo = this.$route.query.settleOrderBaddebtNo
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      $name: 'BadOrderDetail',
      data: [],
      tips: false,
      operationBtns: false,
      selection: false,
      index: {
        show: true,
      },
    })
    const columns1 = [
      {
        prop: 'sourceBizNo',
        label: '单号',
        width: 150,
        type: 'button',
        operationBtns: {
          show: true,
          callback: (action, index, row, option) => {
            this.showDetail(row)
          },
        },
      },
      { prop: 'settleCompName', label: '分公司', type: 'text', width: 150 },
      { prop: 'settleCorpName', label: '结算单位', type: 'text', width: 150 },
      { prop: 'serviceName', label: '服务项', type: 'text' },
      { prop: 'feeName', label: '费用名称', type: 'text' },
      { prop: 'feeEnName', label: '费用英文名', type: 'text' },
      {
        prop: 'extractStatus',
        label: '是否扣减',
        type: 'select',
        // propInDict: 'yesNo'
      },
      { prop: 'emplAbatementNo', label: '扣减编号', type: 'text' },
      { prop: 'currency', label: '币种', type: 'text' },
      { prop: 'unitPrice', label: '单价', type: 'text' },
      { prop: 'unitCount', label: '数量', type: 'text' },
      { prop: 'feeAmt', label: '金额', type: 'text' },
      {
        prop: 'feeUnit',
        label: '计费单位',
        type: 'select',
        propInDict: 'feeUnit',
      },
      { prop: 'badAmt', label: '坏账金额', type: 'text' },
      { prop: 'employeeName', label: '销售', type: 'text' },
      { prop: 'deptName', label: '所属部门', type: 'text' },
      { prop: 'finDate', label: '财务日期', width: 86, type: 'text' },
    ]
    this.option1.columns = columns1
    this.getData()
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
  },
  methods: {
    // 获取数据
    getData() {
      this.voucherNos = this.exVoucherNos = ''
      const data = {
        settleOrderBaddebtNo: this.settleOrderBaddebtNo,
        writeoffNopayNo: this.$route.query.writeoffNopayNo,
      }
      preOrderInfo(data).then((res) => {
        if (res.code === 0) {
          this.receivableRegInfo = res.data
          this.option1.data = res.data.feeList || []
          this.voucherNos = res.data.voucherNo ? res.data.acctVoucherSeqno + '/' + res.data.voucherNo : ''
          this.exVoucherNos = res.data.exVoucherNo ? res.data.exAcctVoucherSeqno + '/' + res.data.exVoucherNo : ''
        }
      })
    },
    // 返回
    back() {
      this.routerBack()
    },
    // 修改核销日期
    editDate() {
      if (this.voucherNos || this.exVoucherNos) {
        return this.$msgErrClose('已生成扣除凭证，无法修改核销日期！')
      }
      this.disabledData = false
    },
    // 更新核销日期
    updateWriteoffDate() {
      if (!this.receivableRegInfo.writeoffDate) {
        return this.$msgErrClose('请先选择核销日期')
      }
      const data = {
        writeoffNopayId: this.receivableRegInfo.writeoffNopayId,
        writeoffDate: this.receivableRegInfo.writeoffDate,
      }
      updateWriteoffDate(data).then((res) => {
        this.$msgSucClose('核销日期修改成功！')
        this.disabledData = true
      })
    },
    // 删除凭证  每行只有单个凭证
    delVoucher(isExt) {
      let voucherNos = []
      let voucherSeqNos = []
      let str = isExt === true ? this.exVoucherNos : this.voucherNos
      let method = isExt === true ? exVoucherDelete : voucherDelete
      str.split(',').forEach((val) => {
        let arr = val.split('/')
        voucherNos.push(arr[1])
        voucherSeqNos.push(arr[0])
      })
      voucherNos = [...new Set(voucherNos)].filter((v) => v !== 'null')
      voucherSeqNos = [...new Set(voucherSeqNos)]
      this.$confirmWarn(`您是否确认删除${voucherNos.join(',')}凭证号下面的所有明细？`, () => {
        method({ voucherSeqNos }).then((res) => {
          sessionStorage.setItem('refreshBadSettleOrderList', true)
          this.$msgSucClose('删除成功！')
          this.getData()
        })
      })
    },
    // 生成凭证
    generateFn(status, isExt) {
      this.isExt = isExt === true
      if (status === 'preview') {
        this.previewGenerate()
      } else {
        this.createGenerate(undefined, isExt)
      }
    },
    // 生成凭证
    createGenerate(refresh, isExt) {
      this.isExt = isExt === true
      if (refresh === 'refresh') {
        this.getData()
        return
      }
      if ((this.isExt && this.exVoucherNos) || (!this.isExt && this.voucherNos)) {
        return this.$msgErrClose('凭证已生成，请勿重复生成！')
      }
      const data = {
        writeoffNopayNos: [this.receivableRegInfo.writeoffNopayNo],
        bizType: 'bad_pre_writeoff',
      }
      let method = this.isExt ? exBadDebitPreWriteOffGenerate : badDebitPreWriteOffGenerate
      method(data).then((res) => {
        sessionStorage.setItem('refreshBadSettleOrderList', true)
        this.$msgSucClose('凭证已经处理！')
        window.setTimeout(() => this.getData(), 1000)
      })
    },
    // 预览凭证
    previewGenerate() {
      const data = {
        writeoffNopayNos: [this.receivableRegInfo.writeoffNopayNo],
        bizType: 'bad_pre_writeoff',
        preview: 'yes',
      }
      let method = this.isExt ? exBadDebitPreWriteOffGenerate : badDebitPreWriteOffGenerate
      method(data).then((res) => {
        if (res.code === 0) {
          this.previewDialog.seqNo = ''
          this.previewDialog.showData = res.data
          this.previewDialog.show = true
        }
      })
    },
    // 单号详情
    showDetail(row) {
      const sourceBizNo = row.sourceBizNo
      this.showOneNoDetail('sourceBizNo', sourceBizNo)
    },
  },
  activated() {
    this.settleOrderBaddebtNo = this.$route.query.settleOrderBaddebtNo
    this.getData()
  },
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
      padding: 8px 8px 4px;
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
        flex-basis: 262px;
        margin-bottom: 8px;
        margin-right: 8px;
        line-height: 20px;
        b {
          font-weight: normal;
        }
        .sub-title {
          min-width: 100px;
          text-align: right;
          display: inline-block;
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
