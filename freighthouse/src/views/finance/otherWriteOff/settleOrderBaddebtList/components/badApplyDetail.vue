<template>
  <div class="finance-page">
    <div class="money-box money-box-border-bottom">
      <div class="money-box-left">
        <div class="money-title">坏账申请{{isWriteoff ? '核销' : ''}}详情</div>
      </div>
      <div class="money-box-right">
        <el-button-group v-if="pendingApprovingAudit && checkAuth($route.name, 'btn-auditPass')">
          <el-button
            class="finance-btn"
            type="success"
            size="mini"
            @click="audit('pass')"
            :loading="btnLoading"
          >审批通过</el-button>
        </el-button-group>
        <el-button-group v-if="pendingApprovingAudit && checkAuth($route.name, 'btn-auditRefuse')">
          <el-button class="finance-btn" type="danger" size="mini" @click="audit('refuse')">审批拒绝</el-button>
        </el-button-group>
        <el-button-group v-if="pendingAudit && checkAuth($route.name, 'btn-badApplyCancel')">
          <el-button
            class="finance-btn"
            type="purple"
            size="mini"
            @click="badApplyCancel"
            :loading="btnLoading1"
          >撤回申请</el-button>
        </el-button-group>
        <el-button-group>
          <el-button class="finance-btn" size="mini" @click="back">返回</el-button>
        </el-button-group>
      </div>
    </div>
    <div class="orderDetail-box">
      <div class="item-box">
        <div class="title">基本信息</div>
        <div class="info-box">
          <DetailDiv label="结算单号：" :content="info.settleOrderNo" />
          <DetailDiv label="分公司：" :content="info.settleCompName" :isTooltip="true" />
          <DetailDiv label="结算单位：" :content="info.settleCorpName" :isTooltip="true" />
          <DetailDiv label="结算周期：" :content="dictMapObj['settleCycle'][info.settleCycle]" />
          <DetailDiv label="结算应收合计：" :isTooltip="true">
            <div>
              <span
                v-for="(item, index) in info.settleRecFeeSumList"
                :key="index"
              >{{ item.currency }}{{ item.sumAmt }}</span>
            </div>
          </DetailDiv>
          <DetailDiv label="坏账合计：" :isTooltip="true">
            <div>
              <span
                v-for="(item, index) in info.recFeeSumList"
                :key="index"
              >{{ item.currency }}{{ item.sumAmt }}</span>
            </div>
          </DetailDiv>
          <DetailDiv label="坏账原因：" :content="dictMapObj['baddebtReason'][info.badReason]" />
          <DetailDiv label="处理方式：" :content="dictMapObj['baddebtDealWay'][info.dealWay]" />
          <DetailDiv label="附件：" :isSlot="true">
            <el-tooltip v-if="info.fileName" :content="info.fileName" placement="top-start">
              <el-tag
                class="detail__content"
                size="medium"
                @click="vmShowAttachment(info.fileNo)"
              >{{ info.fileName }}</el-tag>
            </el-tooltip>
          </DetailDiv>
          <DetailDiv label="申请备注：" :content="info.remark" :isFull="true" />
        </div>
      </div>
      <div class="item-box">
        <div class="title">坏账信息</div>
        <div class="info-box">
          <DetailDiv label="申请单号：" :content="info.settleOrderBaddebtNo" />
          <DetailDiv v-if="info.writeoffNopayNo" label="核销编号：" :content="info.writeoffNopayNo" />
          <DetailDiv
            v-if="info.auditStatus"
            label="审核状态："
            :content="dictMapObj['auditStatus'][info.auditStatus]"
          />
          <DetailDiv label="申请人：" :content="info.createdName" />
          <DetailDiv label="申请时间：" :content="info.createdTime" />
          <DetailDiv
            label="审核人："
            :content="info.auditName"
            v-if="info.auditStatus && !pendingApprovingAudit"
          />
          <DetailDiv
            label="审核时间："
            :content="info.auditTime"
            v-if="info.auditStatus && !pendingApprovingAudit"
          />
          <DetailDiv
            label="拒绝原因："
            :content="info.refuseReason"
            :isFull="true"
            v-if="info.auditStatus && !pendingApprovingAudit"
          />
        </div>
      </div>
      <div class="table-box">
        <div class="title-box">
          <div class="title">审批日志</div>
        </div>
        <AuditTableDialog :isShow="logDialogShow" :settleOrderBaddebtId="settleOrderBaddebtId" />
      </div>
      <div v-if="option4.data&&option4.data.length" class="table-box">
        <div class="title-box">
          <div class="title">滞纳金</div>
        </div>
        <FinanceTable :option="option4" />
      </div>
      <div class="table-box">
        <div class="title-box">
          <div class="title">
            费用列表
            <span v-for="(item, index) in info.recFeeSumList" :key="item.currency">
              {{ index ? `${item.currency}` : `合计：${item.currency}` }}
              <i>{{ item.sumAmt }}</i>
            </span>
          </div>
          <div class="btn">
            <el-button
              style="line-height: 18px;margin-bottom: 0;"
              class="finance-btn"
              @click="feeSearchToggle = !feeSearchToggle"
              size="mini"
              type="primary"
            >{{feeSearchToggle?'隐藏': '显示'}}搜索条件</el-button>
          </div>
        </div>
        <DetailFeeSearch
          v-show="feeSearchToggle"
          ref="detailFeeSearch"
          :list="option1.data"
          @search="search"
        />
        <FinanceTable :option="option1" />
      </div>
    </div>
    <el-dialog :title="'拒绝核销申请'" :visible.sync="rejectDialogVisible" width="590px">
      <el-form :model="rejectForm" ref="rejectForm" label-width="80px">
        <el-form-item
          label="拒绝原因"
          prop="refuseReason"
          :rules="{ required: true, message: ' ', trigger: 'blur', }"
        >
          <el-input type="textarea" v-model="rejectForm.refuseReason" style="width: 460px"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="rejectSubmit" size="mini" :loading="btnLoading">确定</el-button>
        <el-button @click="rejectDialogVisible = false" size="mini">取消</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="'滞纳金'"
      :visible.sync="lateFeeVisible"
      :close-on-click-modal="false"
      width="800px"
    >
      <FinanceTable :option="option13" />
      <span slot="footer" class="dialog-footer">
        <!-- <el-button @click="handleLateFee" size="mini" type="primary">立即处理</el-button>因为最后审批人不一定是财务，业务条线的人没有权限处理滞纳金，所以此处先去掉【立即处理】按钮 -->
        <el-button @click="handleLateFeeCancel" size="mini">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import DetailFeeSearch from '@/views/finance/components/financeSearch/detailFeeSearch'
import AuditTableDialog from './receiLossAuditLog'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { info, audit, badApplyCancel } from '@/api/fin/settleOrderBaddebt'
import { listByWriteoffNo } from '@/api/fin/custOverduePayment'

export default {
  components: {
    FinanceTable,
    AuditTableDialog,
    DetailFeeSearch,
  },
  mixins: [mixin, routerMixin],
  data() {
    return {
      isWriteoff: this.$route.name === 'SettleOrderBadDetail',
      settleOrderNo: '',
      settleOrderBaddebtId: '',
      info: {},
      pendingApprovingAudit: false,
      pendingAudit: false,
      option1: {},
      option4: {},
      rejectDialogVisible: false,
      // 拒绝弹框表单
      rejectForm: {
        refuseReason: '',
      },
      feeSearchToggle: true, // 费用搜索默认显示
      logDialogShow: false,
      option13: {},
      lateFeeVisible: false,
    }
  },
  created() {
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      $name: 'BadApplyDetail',
      operationBtns: false,
      selection: false,
      index: { show: true },
      sortable: true,
      sortChange: this.sortChange,
    })
    const columns = [
      {
        prop: 'sourceBizNo',
        label: '单号',
        type: 'button',
        width: 120,
        operationBtns: {
          show: true,
          callback: (action, index, row, option) => {
            this.showDetail(row)
          },
        },
      },
      {
        prop: 'settleOrderNo',
        label: '结算单号',
        type: 'button',
        width: 120,
        operationBtns: {
          show: true,
          callback: (action, index, row, option) => {
            this.showSettleDetail(row)
          },
        },
      },
      { prop: 'profitShareMode', label: '新旧模式', type: 'select', propInDict: 'customerServiceMode' },
      { prop: 'settleCompName', label: '分公司', type: 'text', width: 150 },
      { prop: 'settleCorpName', label: '结算单位', type: 'text', width: 150 },
      { prop: 'serviceName', label: '服务项', type: 'text' },
      { prop: 'feeName', label: '费用名称', type: 'text' },
      { prop: 'feeEnName', label: '费用英文名', type: 'text', width: 100 },
      { prop: 'receipayType', label: '收付类型', type: 'select', propInDict: 'receipayGroup' },
      { prop: 'currency', label: '币种', type: 'text', readOnly: true },
      { prop: 'unitPrice', label: '单价', type: 'text' },
      { prop: 'unitCount', label: '数量', type: 'text' },
      { prop: 'feeUnit', label: '计费单位', type: 'select', readOnly: true },
      { prop: 'feeAmt', label: '金额', type: 'text' },
      { prop: 'noWriteoffAmt', label: '可申请金额', type: 'text', width: 100 },
      { prop: 'badAmt', label: '坏账金额', type: 'input' },
      { prop: 'invoiceStatus', label: '开票状态', type: 'select', propInDict: 'feeInvoiceStatus' },
      { prop: 'invoiceAmt', label: '已开票金额', type: 'text', width: 100 },
      { prop: 'noInvoiceAmt', label: '未开票金额', type: 'input', width: 100 },
      { prop: 'bdEmployeeName', label: '业务员', type: 'text' },
      { prop: 'deptName', label: '所属部门', type: 'text' },
      { prop: 'finDate', label: '财务日期', width: 86, type: 'text' },
    ]
    this.option1.columns = columns
    this.option4 = Object.assign({}, this.option, {
      id: 'option4',
      $name: 'SettleOrderBadDetail4',
      data: [],
      index: { show: true },
      tips: false,
      rootTipsHide: true,
      selection: false,
      operationBtns: Object.assign({}, this.option.operationBtns, {
        show: false,
      }),
    })
    this.option4.columns = [
      { prop: 'settleCorpName', label: '结算单位', minWidth: 150, type: 'text' },
      { prop: 'currency', label: '币种', type: 'text' },
      { prop: 'arrearReceiveAmt', label: '超期已收金额', type: 'text' },
      { prop: 'lateFeeAmt', label: '实际滞纳金金额', type: 'text' },
      {
        prop: 'custOverduePaymentNo',
        label: '滞纳金编号',
        type: 'button',
        operationBtns: {
          show: true,
          callback: (action, $index, row, option) => {
            this.routerPush('LateFeeDetail', {
              custOverduePaymentNo: row.custOverduePaymentNo,
            })
          },
        },
      },
    ]
    this.option13 = Object.assign({}, this.option, {
      id: 'option13',
      $name: 'BadApplyDetail13',
      data: [],
      index: { show: true },
      tips: false,
      rootTipsHide: true,
      selection: false,
      operationBtns: Object.assign({}, this.option.operationBtns, {
        show: false,
      }),
    })
    this.option13.columns = [
      { prop: 'settleCorpName', label: '结算单位', minWidth: 150, type: 'text' },
      { prop: 'currency', label: '币种', type: 'text' },
      { prop: 'arrearReceiveAmt', label: '超期已收金额', type: 'text' },
      { prop: 'lateFeeAmt', label: '实际滞纳金金额', type: 'text' },
      {
        prop: 'custOverduePaymentNo',
        label: '滞纳金编号',
        type: 'button',
        operationBtns: {
          show: true,
          callback: (action, $index, row, option) => {
            this.routerPush('LateFeeDetail', { custOverduePaymentNo: row.custOverduePaymentNo })
          },
        },
      },
    ]
    this.cTimestamp = new Date().getTime()
    this.init()
    this.getData()
  },
  methods: {
    init() {
      this.settleOrderNo = this.$route.query.settleOrderNo
      this.settleOrderBaddebtId = this.$route.query.settleOrderBaddebtId
      this.settleOrderBaddebtNo = this.$route.query.settleOrderBaddebtNo
    },
    getData() {
      const data = { settleOrderBaddebtId: this.settleOrderBaddebtId, settleOrderNo: this.settleOrderNo }
      this.logDialogShow = false
      info(data)
        .then((res) => {
          this.logDialogShow = true
          this.info = { ...res.data }
          this.pendingAudit = res.data.auditStatus === 'pending'
          this.pendingApprovingAudit = res.data.auditStatus === 'pending' || res.data.auditStatus === 'approving'
          this.option1.data = res.data.recFeeList || []
          this.option4.data = res.data.custOverduePaymentListDtoList || []
        })
        .catch(() => this.back())
    },
    // 坏账审批 type 拒绝refuse|愿意pass
    audit(type) {
      if (type === 'refuse') {
        return (this.rejectDialogVisible = true)
      }
      const data = {
        settleOrderBaddebtId: this.info.settleOrderBaddebtId,
        auditType: 'pass',
      }
      this.auditReq(data)
    },
    // 弹框确定拒绝
    rejectSubmit() {
      this.$refs.rejectForm.validate((res, rej) => {
        if (res) {
          const data = {
            settleOrderBaddebtId: this.info.settleOrderBaddebtId,
            auditType: 'refuse',
            refuseReason: this.rejectForm.refuseReason,
          }
          this.rejectDialogVisible = false
          this.auditReq(data)
        }
      })
    },
    // 发送审核请求
    auditReq(data) {
      this.btnLoading = true
      audit(data)
        .then((res) => {
          this.$msgSucClose('操作成功！')
          this.rejectForm.refuseReason = ''
          if (res.data && res.data.length) {
            this.queryLateFeeByWriteoffNo(res.data.join(','))
          }
        })
        .finally(() => (this.btnLoading = false))
    },
    queryLateFeeByWriteoffNo(writeoffReceipayNo) {
      listByWriteoffNo({ writeoffReceipayNo }).then((res) => {
        this.option13.data = res.data || [] // [{custOverduePaymentNo:'ZNJ202211090089'}]
        if (this.option13.data.length) {
          this.lateFeeVisible = true
        } else {
          this.back()
        }
      })
    },
    handleLateFee() {
      this.routerPush('FiscalTermList', {
        tabFromOther: 'lateFeeList',
        custOverduePaymentNo: this.option13.data.map((item) => item.custOverduePaymentNo).join(','),
      })
    },
    handleLateFeeCancel() {
      this.lateFeeVisible = false
      this.back()
    },
    // 返回 关闭详情页 val 是否刷新坏账列表
    back() {
      this.routerBack()
    },
    sortChange(column, prop, order) {
      // console.log(column, prop, order)
      if (!order) return
      let arr = [
        'feeAmt',
        'canUseSettleAmt',
        'settleAmt',
        'exchangeRate',
        'taxRate',
        'taxAmt',
        'feeAmtWithoutTax',
        'invoiceAmt',
        'canInvoiceAmt',
      ]
      let isNum = arr.includes(prop)
      if (order === 'descending') {
        this.option1.data = this.option1.data.sort((a, b) => {
          return isNum ? b[prop] - a[prop] : b[prop] > a[prop] ? 1 : -1
        })
      } else if (order === 'ascending') {
        this.option1.data = this.option1.data.sort((a, b) => {
          return isNum ? a[prop] - b[prop] : a[prop] > b[prop] ? 1 : -1
        })
      }
    },
    // 单号详情
    showDetail(row) {
      const sourceBizNo = row.sourceBizNo
      this.showOneNoDetail('sourceBizNo', sourceBizNo)
    },
    // 结算单号详情
    showSettleDetail(row) {
      const settleOrderNo = row.settleOrderNo
      this.showOneNoDetail('settleOrderNo', settleOrderNo)
    },
    // 撤回申请
    badApplyCancel() {
      this.btnLoading1 = true
      badApplyCancel({ settleOrderBaddebtId: this.settleOrderBaddebtId })
        .then((res) => {
          this.$msgSucClose('成功撤回申请！')
          this.routerDelBack(true)
        })
        .finally(() => (this.btnLoading1 = false))
    },
    search(list) {
      console.log(list.map((item) => item.invisible))
      this.option1.data = [...list]
      this.info.recFeeSumList = this.computeFeeSum(
        this.option1.data.filter((item) => !item.invisible),
        { returnType: 'list' }
      )
      // this.writeoffGatherChange()
    },
  },
  activated() {
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 300) {
      this.lateFeeVisible = false // 防止叉掉了页面时，滞纳金窗口还在
      this.$refs.detailFeeSearch && this.$refs.detailFeeSearch.clearData()
      this.init()
      this.getData()
    }
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
      padding: 8px;
      padding-bottom: 0;
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
        height: 16px;
        b {
          font-weight: normal;
        }
        .sub-title {
          min-width: 100px;
          text-align: right;
          display: inline-block;
          // text-align-last: justify;
        }
        &.remark {
          flex-basis: 100%;
          height: auto;
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
      span {
        font-weight: bold;
        font-size: 12px;
        padding-left: 20px;
        i {
          font-style: normal;
          text-decoration: none;
          color: red;
        }
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
      // background: none !important;
      border-radius: 4px;
      // border: 1px solid #d9d9d9;
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
.item-box ::v-deep .finance-table {
  padding: 0;
}
</style>
