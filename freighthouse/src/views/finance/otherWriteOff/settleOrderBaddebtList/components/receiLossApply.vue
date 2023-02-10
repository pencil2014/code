<template>
  <div class="finance-page" v-loading="!isDetailPage && resPending">
    <div class="title_warn"><i class="el-icon-info"></i> 请仔细确认是否需要操作坏账申请！(正常情况只有以下场景可能存在坏账申请：客户宣告破产、异常诉讼、不可抗力因素等原因导致无法收回应收账款)</div>
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">
            坏账申请{{ !isDetailPage ? '' : '详情' }}
          </div>
        </div>
        <div class="money-box-right">
          <el-button-group v-if="!isDetailPage && (true || checkAuth($route.name,'btn-apply'))">
            <el-button class="finance-btn" size="mini" type="primary" @click="apply" :loading="btnLoading"
              >提交申请</el-button
            >
          </el-button-group>
          <el-button-group v-if="pendingAudit && checkAuth($route.name,'btn-auditRefuse')">
            <el-button class="finance-btn" size="mini" @click="audit('refuse')"
              >审批拒绝</el-button
            >
          </el-button-group>
          <el-button-group v-if="pendingAudit && checkAuth($route.name,'btn-auditPass')">
            <el-button
              class="finance-btn"
              primary
              size="mini"
              @click="audit('pass')"
              :loading="btnLoading1"
              >审批通过</el-button
            >
          </el-button-group>
          <el-button-group>
            <el-button v-if="from !== 'orderFee'" class="finance-btn" size="mini" @click="back"
              >返回</el-button
            >
          </el-button-group>
        </div>
      </div>
    </div>
    <div class="settlement-detail-form">
      <el-form
        :model="settlementDetailForm"
        ref="formGeneral"
        :inline="true"
        size="mini"
        label-width="125px"
      >
        <el-form-item v-if="settlementDetailForm.settleOrderNo" label="结算单号：" prop="settleOrderNo">
          <div
            class="el-form-item-text"
            v-html="settlementDetailForm.settleOrderNo"
          ></div>
        </el-form-item>
        <el-form-item label="分公司：" prop="settleCompName">
          <el-tooltip
            :content="settlementDetailForm.settleCompName"
            v-if="settlementDetailForm.settleCompName"
          >
            <span class="el-form-item-text self-tooltip">{{
              settlementDetailForm.settleCompName
            }}</span>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="结算单位：" prop="settleCorpName">
          <el-tooltip
            :content="settlementDetailForm.settleCorpName"
            v-if="settlementDetailForm.settleCorpName"
          >
            <span class="el-form-item-text self-tooltip">{{
              settlementDetailForm.settleCorpName
            }}</span>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="结算周期：" prop="settleCycle">
          <div
            class="el-form-item-text"
            v-html="renderPropLabel('settleCycle', settlementDetailForm.settleCycle)"
          ></div>
        </el-form-item>
        <!-- <el-form-item label="结算应收合计：" prop="settleRecFeeSum">
          <div
            class="el-form-item-text"
            v-html="settlementDetailForm.settleRecFeeSum"
          ></div>
        </el-form-item> -->
        <el-form-item label="未核销金额合计：" prop="settleRecFeeSum">
          <div
            class="el-form-item-text"
            v-html="settlementDetailForm.noWriteoffFeeSum"
          ></div>
        </el-form-item>
        <el-form-item label="坏账申请总金额：" prop="recFeeSum">
          <div
            class="el-form-item-text"
            v-html="settlementDetailForm.noWriteoffFeeSum"
          ></div>
        </el-form-item>
        </el-form>
    </div>
    <div class="finance-table-container" v-for="(item, index) in baddebatApplyDetailList" :key="'baddebatApplyDetailList' + index">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">
            {{'申请' + (index + 1)}}
            <span v-if="item.attention" style="font-weight:normal;">({{item.attention}})</span>
          </div>
        </div>
        <div class="money-box-right">
          <el-button
            type="text"
            class="collapse-btn"
            @click="handleCollapse('Table1')"
            size="mini"
          >
            {{ showTable1 ? '收起' : '' }}
            <i
              :class="[
                showTable1 ? 'el-icon-arrow-down' : 'el-icon-arrow-right',
              ]"
            ></i>
          </el-button>
        </div>
      </div>
      <div v-show="showTable1" class="detail-info-other settlement-detail-form">
        <el-form
          :model="item"
          :ref="'form'+(index+1)"
          :inline="true"
          size="mini"
          label-width="115px"
          :noCommonValidate="true"
        >
          <el-form-item label="坏账申请金额：" prop="recFeeSum">
            <div
              class="el-form-item-text"
              v-html="item.recFeeSum"
            ></div>
          </el-form-item>
          <el-form-item
            label="坏账类型："
            prop="badType"
            :rules="(false && !isDetailPage) ? [{ required: true, message: ' ' }] : []"
          >
            <div
              class="el-form-item-text"
              v-html="renderPropLabel('badType', item.badType)"
            ></div>
            <!-- 字段badType -->
          </el-form-item>
          <el-form-item
            label="审批人："
            prop="auditName"
          >
            <el-tooltip
              :content="item.auditFlow"
            >
              <span class="el-form-item-text self-tooltip">{{
                item.auditFlow
              }}</span>
            </el-tooltip>
          </el-form-item>
          <el-form-item
            label="处理方式："
            prop="dealWay"
            :rules="(false && !isDetailPage) ? [{ required: true, message: ' ' }] : []"
          >
            <div
              class="el-form-item-text"
              v-html="renderPropLabel('baddebtDealWay', item.dealWay)"
            ></div>
          </el-form-item>
          <el-form-item
            label="坏账原因："
            prop="badReason"
            :rules="!isDetailPage ? [{ required: true, message: ' ', trigger: 'change' }] : []"
          >
            <el-select
              v-model="item.badReason"
              placeholder="请选择"
              :disabled="source === 'detail' ? true : false"
            >
            <!-- @change="badReasonChange" -->
              <el-option
                v-for="op in dictMap['baddebtReason'].filter(v => v.value !== 'overdue_payment')"
                :key="op.value"
                :label="op.label"
                :value="op.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="附件："
            prop="fileNo"
          >
            <template v-if="!item.fileNo && !isDetailPage">
              <ClipboardUpload @send-res-file-list="receiveResFileList($event, item)" />
            </template>
            <template v-else>
              <div class="seqfile-box">
                <el-button
                  v-if="item.fileNo"
                  @click="handleBankseqFileNo(item)"
                  size="mini"
                  type="text"
                  >点击查看</el-button
                >
                <el-button
                  v-if="item.fileNo && !isDetailPage"
                  @click="() => item.fileNo = ''"
                  size="mini"
                  type="text"
                  >删除</el-button
                >
                <div
                  style="width: 147px; display: inline-block; font-size: 12px"
                  v-if="!item.fileNo"
                >
                  无
                </div>
              </div>
            </template>
          </el-form-item>
          <el-form-item
            class="full-form-item"
            v-if="!isDetailPage"
            label="申请备注："
            prop="remark"
            style="width: 100%; height: auto"
          >
            <el-input
              type="textarea"
              show-word-limit
              maxlength="500"
              v-model="item.remark"
            ></el-input>
          </el-form-item>
          <el-form-item
            v-else
            class="full-form-item"
            label="申请备注："
            prop="remark"
            style="width: 100%"
          >
            <div style="width: 100%">{{ item.remark }}</div>
          </el-form-item>
        </el-form>
        <div class="finance-table-container">
          <div class="money-box">
            <div class="money-box-left">
              <div class="money-title" style="font-weight:normal;font-size:12px;">
                费用列表
                <template v-if="item.recFeeSumList.length"><span v-for="(subItem, subIndex) in item.recFeeSumList" :key="subItem.currency">{{ subIndex ? `${subItem.currency}` : `合计：${subItem.currency}` }}<i>{{ subItem.sumAmt }}</i></span>
                </template>
              </div>
            </div>
            <div class="money-box-right">
            </div>
          </div>
          <FinanceTable v-show="showTable1" :option="item.option" />
        </div>
      </div>
    </div>
    <el-dialog
      :title="'拒绝核销申请'"
      :visible.sync="rejectDialogVisible"
      width="590px"
    >
      <el-form :model="rejectForm" ref="rejectForm" label-width="80px">
        <el-form-item
          label="拒绝原因"
          prop="refuseReason"
          :rules="{
            required: true,
            message: ' ',
            trigger: 'blur',
          }"
        >
          <el-input
            type="textarea"
            v-model="rejectForm.refuseReason"
            style="width: 460px"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="rejectSubmit" size="mini" :loading="btnLoading1"
          >确定</el-button
        >
        <el-button @click="rejectDialogVisible = false" size="mini"
          >取消</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import ClipboardUpload from '@/views/finance/components/financeUpload/clipboardUpload'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mapGetters } from 'vuex'
import {
  generateSettleOrder,
  settleOrderSave,
  settleOrderAdd,
  settleOrderUpdate
} from '@/api/fin/settleOrder'
import {
  info,
  audit,
  edit,
  applyDetail,
  apply
} from '@/api/fin/settleOrderBaddebt'
import Vue from 'vue'

export default {
  name: 'settleOrderBadDetail',
  components: {
    FinanceTable,
    ClipboardUpload,
  },
  mixins: [mixin, routerMixin],
  // props: {
  //   source: String,
  //   settleOrderNo: String,
  // },
  data() {
    return {
      // 是否显示表格
      showTable1: true,
      // 表格数据
      option1: {},
      // 返回数据备份
      resData: {},
      // 表单数据
      settlementDetailForm: {
        badType: '',
        badReason: '',
        badDealWay: '',
        settleOrderNo: '',
        settleCompName: '',
        settleCorpName: '',
        settleCompCode: '',
        settleCorpCode: '',
        settleCycle: '',
        settleRecFeeSum: '',
        recFeeSum: '',
        settlePayFeeSum: '',
        createdName: '',
        createdTime: '',
        auditName: '',
        auditTime: '',
        auditStatus: '',
        remark: '',
        noWriteoffAmtFeeSumList: []
      },
      // 费用合计
      recFeeSumList: [],
      // 拒绝弹框
      rejectDialogVisible: false,
      // 拒绝弹框表单
      rejectForm: {
        refuseReason: ''
      },
      // resPending 坏账核销申请接口请求中
      resPending: false, // true
      // 是否处于待审核状态
      pendingAudit: false,
      timer1: null,
      watchOption1DataTime: 0,
      source: '',
      settleOrderNo: '',
      settleOrderBaddebtId: '',
      writeoffNopayNo: '',
      isDetailPage: true,
      from: '',
      feeIds: [],
      baddebatApplyDetailList: [],
    }
  },
  created() {
    // const operationBtns = { show: false }
    // this.option1 = Object.assign({}, this.option, {
    //   id: 'option1', $name: 'SettleOrderBadDetail',
    //   operationBtns,
    //   selection: false,
    //   edit: true,
    //   index: { show: true }
    // })
    // const columns = [
    //   {
    //     prop: 'sourceBizNo',
    //     label: '单号',
    //     width: '180',
    //     type: 'button',
    //     width: 120,
    //     operationBtns: {
    //       show: true,
    //       callback: (action, index, row, option) => {
    //         this.showDetail(row)
    //       }
    //     }
    //   },
    //   {
    //     prop: 'type',
    //     label: '新旧模式',
    //     type: 'select',
    //     propInDict: 'customerServiceMode'
    //   },
    //   {
    //     prop: 'settleCompName',
    //     label: '分公司',
    //     type: 'text',
    //     width: 150
    //   },
    //   {
    //     prop: 'settleCorpName',
    //     label: '结算单位',
    //     type: 'text',
    //     width: 150
    //   },
    //   {
    //     prop: 'serviceName',
    //     label: '服务项',
    //     type: 'text'
    //   },
    //   {
    //     prop: 'feeName',
    //     label: '费用名称',
    //     type: 'text'
    //   },
    //   {
    //     prop: 'feeEnName',
    //     label: '费用英文名',
    //     type: 'text'
    //   },
    //   {
    //     prop: 'receipayType',
    //     label: '收付类型',
    //     type: 'select',
    //     propInDict: 'receipayGroup'
    //   },
    //   {
    //     prop: 'currency',
    //     label: '币种',
    //     type: 'text',
    //     readOnly: true
    //   },
    //   {
    //     prop: 'unitPrice',
    //     label: '单价',
    //     type: 'text'
    //   },
    //   {
    //     prop: 'unitCount',
    //     label: '数量',
    //     type: 'text'
    //   },
    //   {
    //     prop: 'feeAmt',
    //     label: '金额',
    //     type: 'text'
    //   },
    //   {
    //     prop: 'feeUnit',
    //     label: '计费单位',
    //     type: 'select',
    //     readOnly: true
    //   },
    //   {
    //     prop: 'noWriteoffAmt',
    //     label: '可申请金额',
    //     type: 'text'
    //   },
    //   {
    //     prop: 'badAmt',
    //     label: '坏账金额',
    //     type: 'input'
    //   },
    //   {
    //     prop: 'bdEmployeeName',
    //     label: '业务员',
    //     type: 'text'
    //   },
    //   {
    //     prop: 'deptName',
    //     label: '所属部门',
    //     type: 'text'
    //   }
    // ]
    // this.option1.columns = columns
    this.cTimestamp = new Date().getTime()
    this.init()
    this.getData()
  },
  methods: {
    init() {
      // console.log('route.query:', this.$route.query)
      this.source = this.$route.query.source
      this.settleOrderNo = this.$route.query.settleOrderNo
      this.settleOrderBaddebtId = this.$route.query.settleOrderBaddebtId
      this.writeoffNopayNo = this.$route.query.writeoffNopayNo
      this.feeIds = this.$route.query.feeIds ? this.$route.query.feeIds.split(',') : []
      this.from = this.$route.query.from
      if (this.source.indexOf('create') > -1) {
        this.isDetailPage = false
      } else {
        this.isDetailPage = true
      }
      this.notifySettlementDetailApplyStatus(false)
    },
    // 获取表格数据
    getData() {
      let data = {}
      if (this.writeoffNopayNo) {
        data = {
          writeoffNopayNo: this.writeoffNopayNo
        }
      } else {
        data = {
          settleOrderBaddebtId: this.settleOrderBaddebtId,
          settleOrderNo: this.settleOrderNo,
          feeIds: this.feeIds,
          sourceType: this.settleOrderNo ? 'settleOrder' : 'feeList'
        }
      }
      const operationBtns = { show: false }
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
            }
          }
        },
        {
          prop: 'profitShareMode',
          label: '新旧模式',
          type: 'select',
          propInDict: 'customerServiceMode'
        },
        {
          prop: 'settleCompName',
          label: '分公司',
          type: 'text',
          width: 150
        },
        {
          prop: 'settleCorpName',
          label: '结算单位',
          type: 'text',
          width: 150
        },
        {
          prop: 'serviceName',
          label: '服务项',
          type: 'text'
        },
        {
          prop: 'feeName',
          label: '费用名称',
          type: 'text'
        },
        {
          prop: 'feeEnName',
          label: '费用英文名',
          type: 'text'
        },
        {
          prop: 'receipayType',
          label: '收付类型',
          type: 'select',
          propInDict: 'receipayGroup'
        },
        {
          prop: 'currency',
          label: '币种',
          type: 'text',
          readOnly: true
        },
        {
          prop: 'unitPrice',
          label: '单价',
          type: 'text'
        },
        {
          prop: 'unitCount',
          label: '数量',
          type: 'text'
        },
        {
          prop: 'feeUnit',
          label: '计费单位',
          type: 'select',
          readOnly: true
        },
        {
          prop: 'feeAmt',
          label: '金额',
          type: 'text'
        },
        {
          prop: 'noWriteoffAmt',
          label: '可申请金额',
          type: 'text'
        },
        {
          prop: 'badAmt',
          label: '坏账金额',
          type: 'input'
        },
        {
          prop: 'invoiceAmt',
          label: '已开票金额',
          type: 'text'
        },
        {
          prop: 'noInvoiceAmt',
          label: '未开票金额',
          type: 'input'
        },
        {
          prop: 'bdEmployeeName',
          label: '业务员',
          type: 'text'
        },
        {
          prop: 'deptName',
          label: '所属部门',
          type: 'text'
        },
        { prop: 'finDate', label: '财务日期', width: 86, type: 'text' },
      ]
      const fn = this.source.indexOf('create') > -1 ? applyDetail : info
      fn(data)
        .then(res => {
          const { settleCompName, settleCorpName, settleCycle, feeIds, noWriteoffAmtFeeSumList = [], baddebatApplyDetailList = [
            {
              recFeeSumList: [],
              badType: '',
              badReason: '',
              dealWay: '',
              auditFlow: '',
              remark: '',
              attention: '',
              fileNo: '',
              recFeeList: [
                {
                  sourceBizNo: '',
                  settleCompName: '',
                  settleCorpName: '',
                  serviceName: '',
                  feeName: '',
                  feeEnName: '',
                  currency: '',
                  unitCount: '',
                  badAmt: '',
                  bdEmployeeName: '',
                  deptName: '',
                  feeId: ''
                }
              ]
            }
          ] } = res.data // remark
          if (res.data.settleOrderNo) {
            this.settlementDetailForm.settleOrderNo = res.data.settleOrderNo
          }
          this.pendingAudit = res.data.auditStatus === 'pending' || res.data.auditStatus === 'approving'
          // this.settlementDetailForm = { ...this.settlementDetailForm, settleCompName, settleCorpName, remark }
          this.settlementDetailForm.settleCompName = settleCompName // res.data.
          this.settlementDetailForm.settleCorpName = settleCorpName // res.data.
          this.settlementDetailForm.settleCycle = settleCycle
          this.settlementDetailForm.noWriteoffAmtFeeSumList = noWriteoffAmtFeeSumList
          this.settlementDetailForm.remark = '' // res.data.remark
          this.settlementDetailForm.noWriteoffFeeSum = noWriteoffAmtFeeSumList.reduce(
            (prev, cur, index) => {
              return (prev += cur.currency + cur.sumAmt + ' ')
            },
            ' '
          )
          this.baddebatApplyDetailList = baddebatApplyDetailList.map(item => {
            let recFeeSum = item.recFeeSumList.reduce(
              (prev, cur, index) => {
                return (prev += cur.currency + cur.sumAmt + ' ')
              },
              ' '
            )
            return {
              ...item,
              recFeeSum,
              option: Object.assign({}, this.option, {
                id: 'option1', $name: 'SettleOrderBadDetail1',
                operationBtns,
                selection: false,
                edit: true,
                index: { show: true },
                columns,
                data: item.recFeeList
              })
            }
          })
          this.feeIds = feeIds ? feeIds: this.feeIds
          // this.handleData(res)
          if (!this.isDetailPage) this.resPending = false
          this.$nextTick(() => {
            this.baddebatApplyDetailList.forEach((item, index) => {
              let formN = 'form' + (index + 1)
              let form = this.$refs[formN][0] ? this.$refs[formN][0] : this.$refs[formN]
              form.clearValidate()
            })
          })
        })
        .catch(err => {
          console.log(err)
          // if (!this.isDetailPage) this.resPending = true
          Object.keys(this.settlementDetailForm).forEach(key => {
            this.settlementDetailForm[key] = ''
          })
          this.option1.data = []
          this.recFeeSumList = []
          // this.delVisitedView()
          // this.back()
          this.settlementDetailForm.noWriteoffAmtFeeSumList = []
          this.baddebatApplyDetailList = [
            {
              recFeeSumList: [],
              badType: '',
              auditFlow: '',
              badReason: '',
              dealWay: '',
              remark: '',
              attention: '',
              recFeeList: [
                {
                  sourceBizNo: '',
                  settleCompName: '',
                  settleCorpName: '',
                  serviceName: '',
                  feeName: '',
                  feeEnName: '',
                  currency: '',
                  unitCount: '',
                  badAmt: '',
                  bdEmployeeName: '',
                  deptName: ''
                }
              ],
              option: Object.assign({}, this.option, {
                id: 'option1', $name: 'SettleOrderBadDetail1',
                operationBtns,
                selection: false,
                edit: true,
                index: { show: true },
                columns,
                data: [
                  {
                    sourceBizNo: '',
                    settleCompName: '',
                    settleCorpName: '',
                    serviceName: '',
                    feeName: '',
                    feeEnName: '',
                    currency: '',
                    unitCount: '',
                    badAmt: '',
                    bdEmployeeName: '',
                    deptName: ''
                  }
                ]
              })
            }
          ]
          this.settlementDetailForm.remark = ''
          this.$nextTick(() => {
            this.baddebatApplyDetailList.forEach((item, index) => {
              let formN = 'form' + (index + 1)
              let form = this.$refs[formN][0] ? this.$refs[formN][0] : this.$refs[formN]
              form.clearValidate()
            })
          // 体验优化  ID1004307
          this.delVisitedView()
          this.back()
          })
        })
    },
    // 配置获取到的数据
    handleData({ data }) {
      this.resData = data
      this.option1.data = data.recFeeList
      this.recFeeSumList = data.recFeeSumList
      this.settlementDetailForm.badReason = data.badReason
      this.settlementDetailForm.refuseReason = data.refuseReason
      this.settlementDetailForm.dealWay = data.dealWay
      this.settlementDetailForm.createdName = data.createdName
      this.settlementDetailForm.createdTime = data.createdTime
      this.settlementDetailForm.auditName = data.auditName
      this.settlementDetailForm.auditTime = data.auditTime
      this.settlementDetailForm.auditStatus = data.auditStatus
      this.settlementDetailForm.settleCycle = this.renderPropLabel(
        'settleCycle',
        data.settleCycle
      )
      this.settlementDetailForm.settleRecFeeSum = data.settleRecFeeSumList.reduce(
        (prev, cur, index) => {
          return (prev += cur.currency + cur.sumAmt + ' ')
        },
        ' '
      )
      this.settlementDetailForm.recFeeSum = data.recFeeSumList.reduce(
        (prev, cur, index) => {
          return (prev += cur.currency + cur.sumAmt + ' ')
        },
        ' '
      )
      this.settlementDetailForm.settlePayFeeSum = data.settlePayFeeSumList.reduce(
        (prev, cur, index) => {
          return (prev += cur.currency + cur.sumAmt + ' ')
        },
        ' '
      )
      // 坏账申请修改为： 坏账金额不能修改 2020/12/28
      // if (!this.isDetailPage) {
      //   this.option1.data.forEach((item) => (item.edit = true))
      // }
    },
    // 切换表格显示
    handleCollapse(table) {
      this['show' + table] = !this['show' + table]
    },
    // 提交申请
    apply() {
      // console.log(this.$refs['form1'])
      // return
      try {
        this.baddebatApplyDetailList.forEach((item, index) => {
          let formN = 'form' + (index + 1)
          let form = this.$refs[formN][0] ? this.$refs[formN][0] : this.$refs[formN]
          form.validate(val => {
            // if (!val) return
            if (!val) throw new Error('ending')
          })
        })
        this.btnLoading = true
        apply({
          settleOrderNo: this.settleOrderNo,
          sourceType: this.settleOrderNo ? 'settleOrder' : 'feeList',
          feeIds: this.feeIds,
          baddebatApplyDetailList: this.baddebatApplyDetailList,
          // dealWay,
          // badReason,
          // recFeeList: [...recFeeList],
          // remark
        }).then(res => {
          this.$message({
            message: '申请成功！',
            type: 'success'
          })
          setTimeout(() => {
            // TODO 返回到结算单时需刷新结算单详情页面---did
            this.notifySettlementDetailApplyStatus(true)
            this.refreshView('SettleOrderBaddebtList')
            this.delVisitedView()
            this.back()
          }, 600)
        }).finally(() => this.btnLoading = false)
      } catch (err) {
        if (err.message === 'ending') {
          this.$message({
            message: '请先选择坏账原因再提交',
            type: 'error',
            showClose: true
          })
        }
      }
      return
      this.$refs.form.validate(res => {
        if (!res) return
        const {
          baddebtDealWay: dealWay,
          baddebtReason: badReason,
          recFeeList,
          remark
        } = {
          ...this.resData,
          ...this.settlementDetailForm
        }
      })
    },
    // 坏账审批 type 拒绝refuse|愿意pass
    audit(type) {
      if (type === 'refuse') {
        return (this.rejectDialogVisible = true)
      }
      const data = {
        settleOrderBaddebtId: this.resData.settleOrderBaddebtId,
        auditType: 'pass'
      }
      this.auditReq(data)
    },
    // 弹框确定拒绝
    rejectSubmit() {
      this.$refs.rejectForm.validate((res, rej) => {
        if (res) {
          const data = {
            settleOrderBaddebtId: this.resData.settleOrderBaddebtId,
            auditType: 'refuse',
            refuseReason: this.rejectForm.refuseReason
          }
          this.rejectDialogVisible = false
          this.auditReq(data)
        }
      })
    },
    // 发送审核请求
    auditReq(data) {
      this.btnLoading1 = true
      audit(data).then(res => {
        this.$message({
          message: '操作成功！',
          type: 'success'
        })
        this.rejectForm.refuseReason = ''
        this.back(true)
      }).finally(() => this.btnLoading1 = false)
    },
    // 返回 关闭详情页 val 是否刷新坏账列表
    back(refresh) {
      this.routerBack(refresh === true)
    },
    // 坏账原因选择
    badReasonChange(val) {
      this.settlementDetailForm.badReason = val
    },
    // 坏账处理方式选择
    badWayChange(val) {
      this.settlementDetailForm.dealWay = val
    },
    // 实现在结算单详情操作坏账申请成功，返回结算单列表要更新列表数据，使该结算单消失
    notifySettlementDetailApplyStatus(bool) {
      const find = this.jumpRouteFromToList.find(item => {
        return (
          item.from.name === 'SettlementDetail' &&
          item.to.name === this.$route.name
        )
      })
      if (find) {
        find.from.query.applySuccess = bool
      }
    },
    // 单号详情
    showDetail(row) {
      const sourceBizNo = row.sourceBizNo
      this.showOneNoDetail('sourceBizNo', sourceBizNo)
    },
    // 水单相关操作
    receiveResFileList(list, item) {
      console.log(list);
      item.fileNo = list && list[0] && list[0].fileNo
    },
    handleBankseqFileNo(item) {
      window.open(`/base/fileView/preview/${item.fileNo}/sowoll`)
    },
  },
  activated() {
    let timestamp = new Date().getTime()
    if (timestamp - this.cTimestamp > 300) {
      this.init()
      this.getData()
    }
  },
  // beforeRouteLeave(to, from, next) {
  //   from.meta.isUseCache = true
  //   to.meta.isUseCache = true
  //   next()
  // },
  watch: {
    'option1.data': {
      handler(newVal, oldVal) {
        if (newVal && newVal.length === 0) {
          return
        }
        if (++this.watchOption1DataTime === 1) {
          return
        }
        clearTimeout(this.timer1)
        this.timer1 = setTimeout(() => {
          this.option1.data.forEach(item => {
            if (!item.edit) return
            if (item.badAmt > item.noWriteoffAmt) {
              item.badAmt = item.noWriteoffAmt
              this.$message({
                type: 'error',
                message: '坏账金额不能大于未核销金额!',
                showClose: true
              })
            }
            if (item.badAmt < 0) {
              item.badAmt = 0
              this.$message({
                type: 'error',
                message: '坏账金额不能小于0!',
                showClose: true
              })
            }
          })
          // this.feeSumChange()
        }, 500)
      },
      deep: true
    }
  }
}
</script>
<style scoped lang="scss">
.finance-detail-page {
  background: #fff;
}
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
}
// .el-form-item {
// 	width: calc(25% - 10px);
// 	margin-bottom: 5px;
// 	margin-right: 10px;
// }
.self-tooltip.el-form-item-text {
  display: inline-block;
  max-width: 180px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.el-form-item-text {
  font-size: 12px;
  /* width: 180px; */
}
.settlement-detail-form {
  margin: 0px;
  padding: 8px 16px 6px;
  ::v-deep .el-form-item {
    width: 287px;
  }
}
.settlement-exchange-rates {
  width: 260px;
  display: inline-block;
  margin-right: 24px;
  vertical-align: top;
}
.settlement-exchange-rates .settlement-exchange-rates-title {
  color: #222222;
  line-height: 28px;
}
.finance-table-container {
  margin: 4px 8px 8px;
}
.detail-info-other{
  margin-bottom: 0;
  padding: 8px 0px 0px;
  form {
    padding: 0 8px 6px;
  }
}
.select-template-box {
  margin-bottom: 10px;
}
.select-template-box .el-dropdown {
  margin-left: 0;
  margin-bottom: 0;
  border-radius: 0;
  font-size: 12px;
  line-height: 26px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}
.select-template-box:hover .el-dropdown {
  background: rgb(236, 245, 255);
  color: rgb(64, 158, 255);
}
.select-template-box .el-dropdown-link {
  cursor: pointer;
  padding-left: 5px;
}
.select-template-box .el-icon--right {
  margin-left: 0;
}
.select-template-box .el-dropdown-link:focus {
  outline: none;
}
.money-title > span {
  font-size: 12px;
  padding-left: 20px;
  i {
    font-style: normal;
    text-decoration: none;
    color: red;
  }
}
.full-form-item ::v-deep .el-form-item__content {
  width: calc(100% - 115px);
  height: auto !important;
  & > div {
    width: 100%;
  }
}
.title_warn{
  color:#3E80F5;
  background: #EFF4FD;
  line-height: 20px;
  padding: 8px;
}
</style>
