// 废弃 
// 废弃 
// 废弃 
// 废弃 
// 改用badApplyDetail
<template>
  <div class="finance-page" v-loading="!isDetailPage && resPending">
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">坏账核销{{ !isDetailPage ? '申请' : '详情' }}</div>
        </div>
        <div class="money-box-right">
          <el-button-group v-if="!isDetailPage && checkAuth($route.name,'btn-apply')">
            <el-button class="finance-btn" size="mini" @click="apply" :loading="btnLoading">提交申请</el-button>
          </el-button-group>
          <el-button-group v-if="pendingAudit && checkAuth($route.name,'btn-auditRefuse')">
            <el-button class="finance-btn" size="mini" @click="audit('refuse')">审批拒绝</el-button>
          </el-button-group>
          <el-button-group v-if="pendingAudit && checkAuth($route.name,'btn-auditPass')">
            <el-button
              class="finance-btn"
              primary
              size="mini"
              @click="audit('pass')"
              :loading="btnLoading1"
            >审批通过</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" size="mini" @click="back">返回</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    <div class="settlement-detail-form">
      <el-form
        :model="settlementDetailForm"
        ref="form"
        :inline="true"
        size="mini"
        label-width="100px"
      >
        <el-form-item label="结算单号：" prop="settleOrderNo">
          <el-tooltip :content="settlementDetailForm.settleOrderNo">
            <span class="el-form-item-text self-tooltip">
              {{
              settlementDetailForm.settleOrderNo
              }}
            </span>
          </el-tooltip>
          <!-- <div
            class="el-form-item-text"
            v-html="settlementDetailForm.settleOrderNo"
          ></div>-->
        </el-form-item>
        <el-form-item label="分公司：" prop="settleCompName">
          <el-tooltip
            :content="settlementDetailForm.settleCompName"
            v-if="settlementDetailForm.settleCompName"
          >
            <span class="el-form-item-text self-tooltip">
              {{
              settlementDetailForm.settleCompName
              }}
            </span>
          </el-tooltip>
          <!-- <div
						class="el-form-item-text"
						v-html="settlementDetailForm.settleCompName"
          ></div>-->
        </el-form-item>
        <el-form-item label="结算单位：" prop="settleCorpName">
          <el-tooltip
            :content="settlementDetailForm.settleCorpName"
            v-if="settlementDetailForm.settleCorpName"
          >
            <span class="el-form-item-text self-tooltip">
              {{
              settlementDetailForm.settleCorpName
              }}
            </span>
          </el-tooltip>
          <!-- <div
						class="el-form-item-text"
						v-html="settlementDetailForm.settleCorpName"
          ></div>-->
        </el-form-item>
        <el-form-item label="结算类型：" prop="settleCycle">
          <div class="el-form-item-text" v-html="settlementDetailForm.settleCycle"></div>
        </el-form-item>
        <el-form-item label="结算应收合计：" prop="settleRecFeeSum">
          <div class="el-form-item-text" v-html="settlementDetailForm.settleRecFeeSum"></div>
        </el-form-item>
        <el-form-item label="坏账金额合计：" prop="recFeeSum">
          <div class="el-form-item-text" v-html="settlementDetailForm.recFeeSum"></div>
        </el-form-item>
        <!-- <el-form-item label="结算应付合计：" prop="settlePayFeeSum">
          <div class="el-form-item-text" v-html="settlementDetailForm.settlePayFeeSum"></div>
        </el-form-item>-->
        <el-form-item
          label="坏账原因："
          prop="baddebtReason"
          :rules="!isDetailPage ? [{ required: true, message: ' ' }] : []"
        >
          <el-select
            v-model="settlementDetailForm.baddebtReason"
            placeholder="请选择"
            :disabled="source === 'detail' ? true : false"
            @change="badReasonChange"
          >
            <el-option
              v-for="op in dictMap['baddebtReason']"
              :key="op.value"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="坏账处理方式："
          prop="baddebtDealWay"
          :rules="!isDetailPage ? [{ required: true, message: ' ' }] : []"
        >
          <el-select
            v-model="settlementDetailForm.baddebtDealWay"
            placeholder="请选择"
            :disabled="source === 'detail' ? true : false"
            @change="badWayChange"
          >
            <el-option
              v-for="op in dictMap['baddebtDealWay']"
              :key="op.value"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="申请人：" prop="createdName" v-if="isDetailPage">
          <div class="el-form-item-text" v-html="settlementDetailForm.createdName"></div>
        </el-form-item>
        <el-form-item label="申请时间：" prop="createdTime" v-if="isDetailPage">
          <div class="el-form-item-text" v-html="settlementDetailForm.createdTime"></div>
        </el-form-item>
        <el-form-item
          label="审批人："
          prop="auditName"
          v-if="isDetailPage && settlementDetailForm.auditStatus !== 'pending'"
        >
          <div class="el-form-item-text" v-html="settlementDetailForm.auditName"></div>
        </el-form-item>
        <el-form-item
          label="审批时间："
          prop="auditTime"
          v-if="isDetailPage && settlementDetailForm.auditStatus !== 'pending'"
        >
          <div class="el-form-item-text" v-html="settlementDetailForm.auditTime"></div>
        </el-form-item>
        <el-form-item
          label="审批状态："
          prop="auditTime"
          v-if="isDetailPage && settlementDetailForm.auditStatus !== 'pending'"
        >
          <el-select
            v-model="settlementDetailForm.auditStatus"
            placeholder="请选择"
            :disabled="source === 'detail' ? true : false"
            @change="badWayChange"
          >
            <el-option
              v-for="op in dictMap['auditStatus']"
              :key="op.value"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="拒绝原因："
          prop="refuseReason"
          v-if="isDetailPage && settlementDetailForm.auditStatus === 'refuse'"
        >
          <el-tooltip :content="settlementDetailForm.refuseReason">
            <span class="el-form-item-text self-tooltip">
              {{
              settlementDetailForm.refuseReason
              }}
            </span>
          </el-tooltip>
          <!-- <div class="el-form-item-text" v-html="settlementDetailForm.refuseReason"></div> -->
        </el-form-item>
        <el-form-item
          class="full-form-item"
          v-if="!isDetailPage"
          label="备注："
          prop="remark"
          style="width: 100%; height: auto"
        >
          <el-input
            type="textarea"
            show-word-limit
            maxlength="500"
            v-model="settlementDetailForm.remark"
          ></el-input>
        </el-form-item>
        <el-form-item v-else class="full-form-item" label="备注：" prop="remark" style="width: 100%">
          <div style="width: 100%">{{ settlementDetailForm.remark }}</div>
          <!-- <el-tooltip :content="settlementDetailForm.remark">
						<span class="el-form-item-text self-tooltip">{{
							settlementDetailForm.remark
						}}</span>
          </el-tooltip>-->
          <!-- <div class="el-form-item-text" v-html="settlementDetailForm.remark"></div> -->
        </el-form-item>
      </el-form>
    </div>
    <div v-if="option4.data&&option4.data.length" class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title size-12">滞纳金</div>
        </div>
        <div class="money-box-right"></div>
      </div>
      <FinanceTable :option="option4" />
    </div>
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title" style="font-size: 12px;">
            应收
            <template v-if="recFeeSumList.length">
              <span v-for="(item, index) in recFeeSumList" :key="item.currency">
                {{ index ? `${item.currency}` : `合计：${item.currency}` }}
                <i>{{ item.sumAmt }}</i>
              </span>
            </template>
          </div>
        </div>
        <div class="money-box-right">
          <el-button
            v-if="isDetailPage"
            class="finance-btn"
            @click="feeSearchToggle = !feeSearchToggle"
            size="mini"
            type="primary"
          >{{feeSearchToggle?'隐藏': '显示'}}搜索条件</el-button>
          <el-button type="text" class="collapse-btn" @click="handleCollapse('Table1')" size="mini">
            {{ showTable1 ? '收起' : '' }}
            <i
              :class="[
                showTable1 ? 'el-icon-arrow-down' : 'el-icon-arrow-right',
              ]"
            ></i>
          </el-button>
        </div>
      </div>
      <DetailFeeSearch
        v-show="isDetailPage && feeSearchToggle"
        ref="detailFeeSearch"
        :list="option1.data"
        @search="search"
      />
      <FinanceTable v-show="showTable1" :option="option1" />
    </div>
    <el-dialog :title="'拒绝核销申请'" :visible.sync="rejectDialogVisible" width="590px">
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
          <el-input type="textarea" v-model="rejectForm.refuseReason" style="width: 460px"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="rejectSubmit" size="mini" :loading="btnLoading1">确定</el-button>
        <el-button @click="rejectDialogVisible = false" size="mini">取消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import DetailFeeSearch from '@/views/finance/components/financeSearch/detailFeeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
// import { mapGetters } from 'vuex'
// import {
//   generateSettleOrder,
//   settleOrderSave,
//   settleOrderAdd,
//   settleOrderUpdate
// } from '@/api/fin/settleOrder'
import { info, audit, edit, applyDetail, apply } from '@/api/fin/settleOrderBaddebt'
// import Vue from 'vue'

export default {
  name: 'settleOrderBadDetail',
  components: {
    FinanceTable,
    DetailFeeSearch,
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
      option4: {},
      // 返回数据备份
      resData: {},
      // 表单数据
      settlementDetailForm: {
        baddebtReason: '',
        baddebtDealWay: '',
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
      },
      // 费用合计
      recFeeSumList: [],
      // 拒绝弹框
      rejectDialogVisible: false,
      // 拒绝弹框表单
      rejectForm: {
        refuseReason: '',
      },
      // resPending 坏账核销申请接口请求中
      resPending: true,
      // 是否处于待审核状态
      pendingAudit: false,
      timer1: null,
      watchOption1DataTime: 0,
      source: '',
      settleOrderNo: '',
      settleOrderBaddebtId: '',
      writeoffNopayNo: '',
      isDetailPage: true,
      feeSearchToggle: true, // 费用搜索默认显示
    }
  },
  created() {
    this.init()
    const operationBtns = { show: false }
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      $name: 'SettleOrderBadDetail',
      operationBtns,
      selection: false,
      edit: true,
      index: { show: true },
      sortable: true,
      sortChange: this.sortChange,
    })
    const columns = [
      {
        prop: 'sourceBizNo',
        label: '单号',
        width: '180',
        type: 'button',
        width: 150,
        operationBtns: {
          show: true,
          callback: (action, index, row, option) => {
            this.showDetail(row)
          },
        },
      },
      {
        prop: 'settleCompName',
        label: '分公司',
        type: 'text',
        width: 150,
      },
      {
        prop: 'settleCorpName',
        label: '结算单位',
        type: 'text',
        width: 150,
      },
      {
        prop: 'serviceName',
        label: '服务项',
        type: 'text',
      },
      {
        prop: 'feeName',
        label: '费用名称',
        type: 'text',
      },
      {
        prop: 'feeEnName',
        label: '费用英文名',
        type: 'text',
        width: 100,
      },
      {
        prop: 'currency',
        label: '币种',
        type: 'text',
        readOnly: true,
      },
      {
        prop: 'unitPrice',
        label: '单价',
        type: 'text',
      },
      {
        prop: 'unitCount',
        label: '数量',
        type: 'text',
      },
      {
        prop: 'feeAmt',
        label: '金额',
        // label: '原费用金额',
        type: 'text',
      },
      {
        prop: 'feeUnit',
        label: '计费单位',
        type: 'select',
        readOnly: true,
      },
      {
        prop: 'noWriteoffAmt',
        label: '可申请金额',
        type: 'text',
        width: 100,
      },
      {
        prop: 'badAmt',
        label: '坏账金额',
        type: 'input',
      },
      {
        prop: 'invoiceStatus',
        label: '开票状态',
        width: 80,
        type: 'select',
        propInDict: 'feeInvoiceStatus',
      },
      {
        prop: 'bdEmployeeName',
        label: '销售',
        type: 'text',
      },
      {
        prop: 'deptName',
        label: '所属部门',
        type: 'text',
      },
      { prop: 'finDate', label: '财务日期', width: 86, type: 'text' },
      // {
      // 	prop: 'settleCycle',
      // 	label: '结算方式',
      // 	type: 'select',
      // 	readOnly: true,
      // },
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
    // this.getData()
  },
  methods: {
    init() {
      // console.log('route.query:', this.$route.query)
      this.source = this.$route.query.source
      this.settleOrderNo = this.$route.query.settleOrderNo
      this.settleOrderBaddebtId = this.$route.query.settleOrderBaddebtId
      this.writeoffNopayNo = this.$route.query.writeoffNopayNo
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
          writeoffNopayNo: this.writeoffNopayNo,
        }
      } else {
        data = {
          settleOrderBaddebtId: this.settleOrderBaddebtId,
          settleOrderNo: this.settleOrderNo,
        }
      }
      const fn = this.source.indexOf('create') > -1 ? applyDetail : info
      fn(data)
        .then((res) => {
          const { settleCompName, settleCorpName, remark } = res.data
          if (res.data.settleOrderNo) {
            this.settlementDetailForm.settleOrderNo = res.data.settleOrderNo
          }
          this.pendingAudit = res.data.auditStatus === 'pending'
          // this.settlementDetailForm = { ...this.settlementDetailForm, settleCompName, settleCorpName, remark }
          this.settlementDetailForm.settleCompName = res.data.settleCompName
          this.settlementDetailForm.settleCorpName = res.data.settleCorpName
          this.settlementDetailForm.remark = res.data.remark
          this.handleData(res)
          if (!this.isDetailPage) this.resPending = false
        })
        .catch((err) => {
          if (!this.isDetailPage) this.resPending = true
          Object.keys(this.settlementDetailForm).forEach((key) => {
            this.settlementDetailForm[key] = ''
          })
          this.option1.data = []
          this.recFeeSumList = []
          this.delVisitedView()
          this.back()
          // setTimeout(this.back, 600)
        })
    },
    // 配置获取到的数据
    handleData({ data }) {
      this.resData = data
      this.option1.data = data.recFeeList
      this.option4.data = data.custOverduePaymentListDtoList || []
      this.recFeeSumList = data.recFeeSumList
      this.settlementDetailForm.baddebtReason = data.badReason
      this.settlementDetailForm.refuseReason = data.refuseReason
      this.settlementDetailForm.baddebtDealWay = data.dealWay
      this.settlementDetailForm.createdName = data.createdName
      this.settlementDetailForm.createdTime = data.createdTime
      this.settlementDetailForm.auditName = data.auditName
      this.settlementDetailForm.auditTime = data.auditTime
      this.settlementDetailForm.auditStatus = data.auditStatus
      this.settlementDetailForm.settleCycle = this.renderPropLabel('settleCycle', data.settleCycle)
      this.settlementDetailForm.settleRecFeeSum = data.settleRecFeeSumList.reduce((prev, cur, index) => {
        return (prev += cur.currency + cur.sumAmt + ' ')
      }, ' ')
      this.settlementDetailForm.recFeeSum = data.recFeeSumList.reduce((prev, cur, index) => {
        return (prev += cur.currency + cur.sumAmt + ' ')
      }, ' ')
      this.settlementDetailForm.settlePayFeeSum = data.settlePayFeeSumList.reduce((prev, cur, index) => {
        return (prev += cur.currency + cur.sumAmt + ' ')
      }, ' ')
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
      this.$refs.form.validate((res) => {
        if (!res) return
        // TODO
        // let { settleOrderBaddebtId, settleOrderNo } = this.source
        const {
          baddebtDealWay: dealWay,
          baddebtReason: badReason,
          recFeeList,
          remark,
        } = {
          ...this.resData,
          ...this.settlementDetailForm,
        }
        this.btnLoading = true
        apply({
          settleOrderNo: this.settleOrderNo,
          dealWay,
          badReason,
          recFeeList: [...recFeeList],
          remark,
        })
          .then((res) => {
            this.$message({
              message: '申请成功！',
              type: 'success',
              // message: obj.msg.type,
              // type: obj.type.type
            })
            // TODO 返回到结算单时需刷新结算单详情页面---did
            this.notifySettlementDetailApplyStatus(true)
            this.refreshView('SettleOrderBaddebtList')
            this.delVisitedView()
            this.back()
          })
          .finally(() => (this.btnLoading = false))
      })
    },
    // 坏账审批 type 拒绝refuse|愿意pass
    audit(type) {
      if (type === 'refuse') {
        return (this.rejectDialogVisible = true)
      }
      const data = {
        settleOrderBaddebtId: this.resData.settleOrderBaddebtId,
        auditType: 'pass',
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
            refuseReason: this.rejectForm.refuseReason,
          }
          this.rejectDialogVisible = false
          this.auditReq(data)
        }
      })
    },
    // 发送审核请求
    auditReq(data) {
      this.btnLoading1 = true
      audit(data)
        .then((res) => {
          this.$message({
            message: '操作成功！',
            type: 'success',
          })
          this.rejectForm.refuseReason = ''
          this.back(true)
        })
        .finally(() => (this.btnLoading1 = false))
    },
    // 返回 关闭详情页 val 是否刷新坏账列表
    back(refresh) {
      this.routerBack(refresh === true)
    },
    // 坏账原因选择
    badReasonChange(val) {
      this.settlementDetailForm.baddebtReason = val
    },
    // 坏账处理方式选择
    badWayChange(val) {
      this.settlementDetailForm.baddebtDealWay = val
    },
    // 实现在结算单详情操作坏账申请成功，返回结算单列表要更新列表数据，使该结算单消失
    notifySettlementDetailApplyStatus(bool) {
      const find = this.jumpRouteFromToList.find((item) => {
        return item.from.name === 'SettlementDetail' && item.to.name === this.$route.name
      })
      if (find) {
        find.from.query.applySuccess = bool
      }
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
    search(list) {
      console.log(list.map((item) => item.invisible))
      this.option1.data = [...list]
      this.recFeeSumList = this.computeFeeSum(
        this.option1.data.filter((item) => !item.invisible),
        { returnType: 'list' }
      )
    },
  },
  activated() {
    if (!this.$route.meta.isUseCache) {
      this.$refs.detailFeeSearch && this.$refs.detailFeeSearch.clearData()
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
          this.option1.data.forEach((item) => {
            if (!item.edit) return
            if (item.badAmt > item.noWriteoffAmt) {
              item.badAmt = item.noWriteoffAmt
              this.$message({
                type: 'error',
                message: '坏账金额不能大于未核销金额!',
                showClose: true,
              })
            }
            if (item.badAmt < 0) {
              item.badAmt = 0
              this.$message({
                type: 'error',
                message: '坏账金额不能小于0!',
                showClose: true,
              })
            }
          })
          // this.feeSumChange()
        }, 500)
      },
      deep: true,
    },
  },
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
  padding: 20px 16px 8px;
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
  margin: 4px 16px 18px;
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
  width: calc(100% - 100px);
  height: auto !important;
  & > div {
    width: 100%;
  }
}
</style>