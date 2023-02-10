<template>
  <div
    class="finance-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">结算单{{isDetailPage ? '详情' : '生成'}}</div>
        </div>
        <div class="money-box-right">
          <el-button-group v-if="(!isDetailPage || !finLockOrInvoiceOrCloseOrWriteOff) && canEdit">
            <el-button
              class="finance-btn"
              @click="saveSettlement"
              type="primary"
              size="mini"
              :loading="noExchangeRate || submitDisabled"
            >保存</el-button>
          </el-button-group>
          <el-button-group
            v-if="settlementDetailForm.confirmStatus==='yes'&&!adjustRateState&&settlementDetailForm.rateChangeFlag===true&&settlementDetailForm.closeStatus==='no'&&!isBadDebt&&checkAuth($route.name,'btn-exchangeRate')"
          >
            <el-button class="finance-btn" size="mini" @click="checkExchangeRage('lock')">修改结算汇率</el-button>
          </el-button-group>
          <el-button-group
            v-if="isDetailPage && settlementDetailForm.hasRelationInvoicePay === 'yes' && checkAuth($route.name, 'btn-handleRelationInvoice')"
          >
            <el-button
              class="finance-btn"
              @click="handleRelationInvoice"
              type="primary"
              size="mini"
            >关联应付发票</el-button>
          </el-button-group>
          <el-button-group
            v-if="isDetailPage && checkAuth('SettlementList', 'btn-regWriteoff') && !finLockOrClose && settlementDetailForm.confirmStatus == 'yes' && unsettleRecvpayType=='receive'"
          >
            <el-button
              class="finance-btn"
              @click="relationRegDialog"
              type="primary"
              size="mini"
            >关联收款登记核销</el-button>
          </el-button-group>
          <el-button-group
            v-if="isDetailPage && settlementDetailForm.hasRelationInvoicePay === 'yes' && checkAuth($route.name, 'btn-addInvoice')"
          >
            <el-button
              class="finance-btn"
              @click="addInvoice(settlementDetailForm)"
              type="primary"
              size="mini"
            >发票登记</el-button>
          </el-button-group>
          <el-button-group
            v-if="isDetailPage && !finLockOrUseOrClose&& settlementDetailForm.confirmStatus != 'yes' && isMultiComp"
          >
            <el-button
              type="primary"
              class="finance-btn"
              @click="splitSettleOrder"
              size="mini"
            >拆分结算单</el-button>
          </el-button-group>
          <el-button-group
            v-if="checkAuth('SettlementList', 'btn-releaseSettleOrder') && writeoffStatus === 'part_finish' && settlementDetailForm.finLockStatus === 'unlock'"
          >
            <!-- type="warning" -->
            <el-button class="finance-btn" @click="releaseSettleOrder" size="mini">释放未销费用</el-button>
          </el-button-group>
          <el-button-group
            v-if="isDetailPage && !finLockOrUseOrClose&& settlementDetailForm.confirmStatus != 'yes' && checkAuth($route.name, 'btn-delSettle')"
          >
            <el-button type="danger" class="finance-btn" @click="settlementDelete" size="mini">删除结算单</el-button>
          </el-button-group>
          <el-button-group
            v-if="isDetailPage && settlementDetailForm.confirmStatus === 'yes' && !finLockOrUseOrClose && checkAuth($route.name, 'btn-cancelConfirm')"
          >
            <el-button
              class="finance-btn"
              @click="settlementCancelConfirm"
              size="mini"
              type="purple"
            >撤销确认结算单</el-button>
          </el-button-group>
          <el-button-group
            v-if="isDetailPage && !finLockOrUseOrClose && settlementDetailForm.confirmStatus === 'no' && checkAuth($route.name, 'btn-confirmSettle')"
          >
            <el-button
              type="success"
              class="finance-btn"
              @click="settlementConfirm"
              size="mini"
            >确认结算单</el-button>
          </el-button-group>
          <el-button-group
            v-if="isDetailPage && settlementDetailForm.closeStatus !== 'yes' && checkAuth($route.name, 'btn-exportBill')"
          >
            <el-button type="primary" class="finance-btn" @click="handleCommand" size="mini">导出对账单</el-button>
          </el-button-group>
          <el-button-group v-if="isDetailPage && checkAuth($route.name, 'btn-billList')">
            <el-button class="finance-btn" @click="openBillList" size="mini">对账单列表</el-button>
          </el-button-group>
          <el-button-group
            v-if="isDetailPage && settlementDetailForm.interTransferStatus === 'yes'&&!finLockOrClose&&settlementDetailForm.confirmStatus === 'yes'&&settlementDetailForm.groupStatus!='yes' && checkAuth($route.name, 'btn-interTransApply')"
          >
            <el-button class="finance-btn" @click="interTransApply" size="mini">内部转移对冲</el-button>
          </el-button-group>
          <!-- TODO 状态判断 -->
          <!-- !isWriteoff -->
          <!-- checkAuth('SettlementDetail-btn-invoiceConfirm') &&  -->

          <el-dropdown
            v-if="isDetailPage && (['receive', 'receivepay'].includes(settlementDetailForm.receivePayType) || settlementDetailForm.offsetPayType === '应收') && invoiceApplyAvaliable && checkAuth($route.name, 'btn-invoiceConfirm')"
            class="ls__dropdown"
            trigger="click"
            @command="invoiceConfirm"
          >
            <el-button class="finance-btn" size="mini">
              确认开票
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-for="(item, index) in invoiceConfirmList"
                :key="index"
                :command="item.value"
              >{{item.label}}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button-group v-if="isDetailPage">
            <el-button
              v-if="settlementDetailForm.confirmStatus === 'yes' && !finLockOrClose &&unsettleRecvpayType=='receive'&&settlementDetailForm.groupStatus!='yes' && checkAuth($route.name, 'btn-applyBad')"
              class="finance-btn"
              @click="badApply"
              size="mini"
              type="primary"
            >应收冲减</el-button>
            <el-button
              v-if="settlementDetailForm.confirmStatus === 'yes' && !finLockOrClose &&unsettleRecvpayType=='receivepay' && checkAuth($route.name, 'btn-hedging')"
              class="finance-btn"
              @click="createGedging"
              size="mini"
              type="primary"
            >对冲申请</el-button>
            <el-button
              v-if="!finLockOrClose && unsettleRecvpayType=='pay' && checkAuth($route.name, 'btn-applyPay')"
              class="finance-btn"
              @click="payApply"
              size="mini"
              type="primary"
            >付款申请</el-button>
            <el-button
              v-if="settlementDetailForm.confirmStatus === 'yes' && invoiceApplyAvaliable && (['receive', 'receivepay'].includes(settlementDetailForm.receivePayType) || settlementDetailForm.offsetPayType === '应收') && checkAuth($route.name, 'btn-applyInvoice')"
              class="finance-btn"
              @click="invoiceApply"
              size="mini"
              type="primary"
            >开票申请</el-button>
          </el-button-group>
          <el-button-group v-if="isDetailPage && checkAuth($route.name, 'btn-uploadOrder')">
            <!-- 核销状态writeoffStatus  nofinish 未核销可修改、删除  finish 已核销不可上传、修改、删除 part_finish 部分核销可上传，不可修改、删除-->
            <!-- uploadOrderHide 已核销finish | 结算单位子类型为国外(同行|直客)foreign_peer，foreign_cust-->
            <!-- settlementDetailForm.settleCorpObj.settleCorpSubType -->
            <el-button
              class="finance-btn"
              v-if="settlementDetailForm.confirmStatus == 'yes' && writeoffStatus!=='finish' && isForeign && unsettleRecvpayType=='receive'"
              @click="uploadOrder"
              size="mini"
            >上传客户水单</el-button>
          </el-button-group>
          <el-dropdown
            v-if="isDetailPage && checkAuth('SettlementList', 'btn-feeAgent')"
            class="ls__dropdown"
            trigger="click"
            @command="handleAgent"
          >
            <el-button class="finance-btn" size="mini">
              费用代收付
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-for="(item, index) in agentTypeList"
                :key="index"
                :command="item.value"
              >{{item.label}}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button-group v-if="!$route.query.fromOrder">
            <el-button class="finance-btn" @click="cancel()" size="mini">返回</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    <div class="settlement-detail-form settlement-detail-form-own">
      <el-form
        :model="settlementDetailForm"
        ref="settlementForm"
        :inline="true"
        size="mini"
        label-width="100px"
      >
        <h3 style="padding-bottom: 8px;margin-top: 0px;">结算信息</h3>
        <DetailDiv label="分公司：" :content="settlementDetailForm.settleCompName" :isTooltip="true" />
        <el-form-item label="结算单号：" v-if="isDetailPage" prop="settleOrderNo">
          <div class="el-form-item-text" v-html="settlementDetailForm.settleOrderNo"></div>
        </el-form-item>
        <DetailDiv
          v-if="finLockOrUseOrClose || !canEdit"
          label="结算单位："
          :content="settlementDetailForm.settleCorpName"
          :isTooltip="true"
          :label__bold="true"
        />
        <el-form-item v-else label="结算单位：" prop="settleCorpName" class="label__bold">
          <el-select
            @change="settleCorpObjChange"
            v-model="settlementDetailForm.settleCorpObj"
            placeholder="请选择"
          >
            <el-option v-for="op in settleCorpList" :key="op.value" :label="op.label" :value="op"></el-option>
          </el-select>
          <!-- <div class="el-form-item-text" v-html="settlementDetailForm.settleCorpName">
          </div>-->
        </el-form-item>
        <SettleCorpTypeTags :tags="settlementDetailForm.settleCorpObj.settleCorpType||''" />
        <br />
        <!-- <el-form-item label="结算单位类型：" prop="settleOrderStatus" v-if="isDetailPage">
          <div
            class="el-form-item-text"
            v-html="renderPropLabel('unitType',settlementDetailForm.settleCorpObj.settleCorpType, [], true)"
          ></div>
        </el-form-item>
        <el-form-item label="结算单位子类型：" prop="settleOrderStatus" v-if="isDetailPage">
          <div
            class="el-form-item-text"
            v-if="settlementDetailForm.settleCorpObj&&settlementDetailForm.settleCorpObj.settleCorpSubType"
          >
            <el-tooltip
              :content="renderPropLabel('settleUnitSubType',settlementDetailForm.settleCorpObj.settleCorpSubType, [], true, true)"
              placement="top-start"
              effect="dark"
            >
              <span>{{renderPropLabel('settleUnitSubType',settlementDetailForm.settleCorpObj.settleCorpSubType, [], true, true)}}</span>
            </el-tooltip>
          </div>
        </el-form-item>-->
        <DetailDiv
          v-if="finLockOrUseOrClose || !canEdit"
          label="结算周期："
          :content="dictMapObj['settleCycle'][settlementDetailForm.settleCycle]"
          :isLabelBold="true"
        />
        <el-form-item v-else label="结算周期：" prop="settleCycle" class="label__bold">
          <el-select
            v-model="settlementDetailForm.settleCycle"
            placeholder="请选择"
            :disabled="isDetailPage && finLockOrUseOrClose || !canEdit"
          >
            <el-option
              v-for="(op, j) in dictMap['settleCycle']"
              :key="'settleCycle' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="结算单类型：" prop="orderType">
          <div
            class="el-form-item-text"
            v-html="renderPropLabel('settleOrderType', settlementDetailForm.orderType)"
          ></div>
        </el-form-item>
        <el-form-item label="结算单状态：" prop="settleOrderStatus" v-if="isDetailPage">
          <div class="el-form-item-text" v-html="settlementDetailForm.settleOrderStatusLabel"></div>
        </el-form-item>
        <el-form-item
          label="锁定原因："
          prop="finLockReason"
          v-if="isDetailPage && settlementDetailForm.finLockStatus === 'lock'"
        >
          <el-tooltip
            :content="settlementDetailForm.finLockReason"
            v-if="settlementDetailForm.finLockReason"
          >
            <span class="el-form-item-text self-tooltip">{{settlementDetailForm.finLockReason}}</span>
          </el-tooltip>
        </el-form-item>
        <el-form-item label="结算单确认：" prop="confirmStatus" v-if="isDetailPage">
          <div class="el-form-item-text" v-html="settlementDetailForm.confirmStatusLabel"></div>
        </el-form-item>
        <DetailDiv
          label="代收付分公司："
          v-if="settlementDetailForm.agentStatus === 'yes'"
          :content="settlementDetailForm.agentCompName"
          :isTooltip="true"
        />
        <DetailDiv
          label="是否代收付："
          v-if="isDetailPage"
          :content="dictMapObj['yesNo'][settlementDetailForm.agentStatus] || '否'"
        />
        <el-form-item label="创建人：" prop="createdName" v-if="isDetailPage">
          <div class="el-form-item-text" v-html="settlementDetailForm.createdName"></div>
        </el-form-item>
        <el-form-item label="创建时间：" prop="createdTime" v-if="isDetailPage">
          <div class="el-form-item-text" v-html="settlementDetailForm.createdTime"></div>
        </el-form-item>
        <div
          style="width: 100%;height: 1px;border-top: 1px solid #e9e9e9;padding: 0 0 8px 0;margin: 2px 0;"
        ></div>
        <el-form-item label="结算币别：" prop="settleCurrency" class="label__bold">
          <el-select
            v-model="settlementDetailForm.settleCurrency"
            placeholder="请选择"
            @change="currencyChange"
            :disabled="isDetailPage && finLockOrUseOrClose || !canEdit"
          >
            <el-option
              v-for="(op, j) in currencyAddOriginal"
              :key="'currency' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="isGedging && !exchangeRateTypeDisabled"
          label="汇率类型："
          prop="exchangeRateType"
          :rules="{required: true, message: ' ', trigger:'change'}"
          class="label__bold"
        >
          <el-select
            v-model="settlementDetailForm.exchangeRateType"
            placeholder="请选择"
            :disabled="finLockOrUseOrClose || !canEdit"
            @change="rateTypeChange"
          >
            <el-option
              v-for="(op, j) in exchangeRateTypeList"
              :key="'settleCycle' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <DetailDiv
          v-if="!isGedgingHide"
          label="轧差结果："
          :content="settlementDetailForm.offsetPayType ? `<span style='color:${settlementDetailForm.offsetPayType === '应收' ? 'rgb(230, 57, 35)' : 'rgb(51, 177, 138)'}'>${settlementDetailForm.offsetPayType}</span>` : '0'"
          :isLabelBold="true"
        />
        <DetailDiv
          v-if="!isGedgingHide"
          label="轧差后合计："
          :content="settlementDetailForm.offSetFeeSumStr || '0'"
          :isTooltip="true"
          :isLabelBold="true"
        />
        <!-- <el-form-item
          label="最晚付款时间："
          prop="latestPayDate"
          v-if="isDetailPage && !finLockOrUseOrClose && unsettleRecvpayType=='pay'"
        >
          <el-date-picker
            size="mini"
            v-model="settlementDetailForm.latestPayDate"
            type="date"
            format="yyyy-MM-dd"
            placeholder="选填"
            clearable
            :disabled="isDetailPage && finLockOrUseOrClose || !canEdit"
          ></el-date-picker>
        </el-form-item>-->
        <!-- <DetailDiv
          v-if="!feeAllPay"
          label="原费用应收合计："
          :content="settlementDetailForm.orignalRecFeeSumStr || '0'"
          :isTooltip="true"
        />
        <DetailDiv
          v-if="!feeAllPay && !isGedgingHide"
          label="结算应收合计："
          :content="settlementDetailForm.settleRecFeeSumStr || '0'"
          :isTooltip="true"
        />
        <DetailDiv
          v-if="!feeAllRec"
          label="原费用应付合计："
          :content="settlementDetailForm.orignalPayFeeSumStr || '0'"
          :isTooltip="true"
        />
        <DetailDiv
          v-if="!feeAllRec && !isGedgingHide"
          label="结算应付合计："
          :content="settlementDetailForm.settlePayFeeSumStr || '0'"
          :isTooltip="true"
        />-->
        <div v-if="!isGedgingHide">
          <div class="settle_rate_list" v-if="exchangeRateList.length">
            <span class="settle_rate_list_title">系统结算汇率：</span>
            <span>{{exchangeRateList[0].settlementRateTitle}} {{exchangeRateList[0].systemRate}}</span>
            <!-- <span v-for="rate in sysExchangeRateList">{{rate.systemRate}}</span> -->
            <el-button type="text" size="mini" @click="checkExchangeRage('system')">更多</el-button>
          </div>
          <div class="settle_rate_list" v-if="exchangeRateList.filter(v=>!v.invisible).length">
            <span class="settle_rate_list_title">结算汇率：</span>
            <!-- <span
              v-for="rate in exchangeRateList"
            >{{rate.settlementRateTitle}} {{rate.settlementRate}}</span>-->
            <span>{{exchangeRateList.filter(v=>!v.invisible)[0].settlementRateTitle}} {{exchangeRateList.filter(v=>!v.invisible)[0].settlementRate}}</span>
            <el-button type="text" size="mini" @click="checkExchangeRage('diy')">更多</el-button>
          </div>
        </div>
        <template
          v-if="isDetailPage && (['receive', 'receivepay'].includes(settlementDetailForm.receivePayType) || settlementDetailForm.offsetPayType === '应收') && invoiceApplyTableOption.data.length"
        >
          <div class="devide-line"></div>
          <h3>发票申请记录</h3>
          <FinanceTable :option="invoiceApplyTableOption" />
        </template>
        <template v-if="isDetailPage && invoiceTableOption.data.length">
          <div class="devide-line"></div>
          <h3>关联发票</h3>
          <FinanceTable :option="invoiceTableOption" />
        </template>
        <div v-if="isForeign && isDetailPage" class="devide-line"></div>
        <h3 v-if="isForeign && isDetailPage">客户水单</h3>
        <FinanceTable v-if="isForeign && isDetailPage" :option="orderTableOption" />
        <h3 v-if="badDebtList.data.length">应收冲减</h3>
        <FinanceTable v-if="badDebtList.data.length" :option="badDebtList" />
        <h3 v-if=" gendingApplyList.data.length">对冲信息</h3>
        <FinanceTable v-if="gendingApplyList.data.length" :option="gendingApplyList" />
        <h3 v-if="payApplySettleList.data.length">付款信息</h3>
        <FinanceTable v-if="payApplySettleList.data.length" :option="payApplySettleList" />
        <h3 v-if="writeoffRecvList.data.length">核销信息</h3>
        <FinanceTable v-if="writeoffRecvList.data.length" :option="writeoffRecvList" />
        <h3 v-if="writeoffPayList.data.length">核销信息</h3>
        <FinanceTable v-if="writeoffPayList.data.length" :option="writeoffPayList" />
      </el-form>
    </div>
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left" style="line-height:20px;">
          <span class="money-box-title">费用列表</span>
          <DetailAmtSummary :option="detailAmtSummaryOption" />

          <!-- <div>
            <div>
              <div
                v-if="settlementDetailForm.orignalRecFeeSumStr"
                class="money-box-text"
                v-html="'原币结算金额应收合计：'+settlementDetailForm.orignalRecFeeSumStr"
              ></div>
              <div
                v-if="settlementDetailForm.orignalPayFeeSumStr"
                class="money-box-text"
                v-html="'原币结算金额应付合计：'+settlementDetailForm.orignalPayFeeSumStr"
              ></div>
            </div>
            <div>
              <div
                class="money-box-text"
                v-if="!isGedgingHide &&feeListReceive"
                v-html="'应收结算合计：'+feeListReceive"
              ></div>
              <div
                class="money-box-text"
                v-if="!isGedgingHide && feeListPay"
                v-html="'应付结算合计：'+feeListPay"
              ></div>
            </div>
          </div>-->
        </div>
        <div class="money-box-right">
          <el-button-group style="margin-left: 6px; ">
            <el-button
              class="finance-btn"
              @click="feeSearchToggle = !feeSearchToggle"
              size="mini"
              type="primary"
            >{{feeSearchToggle?'隐藏': '显示'}}搜索条件</el-button>
          </el-button-group>
          <el-button-group
            style="margin-left: 6px; "
            v-if="(!isDetailPage || !finLockOrInvoiceOrCloseOrWriteOff) && canEdit && checkAuth($route.name, 'btn-addFee') && isGedging"
          >
            <el-button class="finance-btn" @click="autoCompulateSettleFee" size="mini">自动分配金额</el-button>
          </el-button-group>
          <el-button-group
            v-if="(!isDetailPage || !finLockOrInvoiceOrCloseOrWriteOff) && canEdit && checkAuth($route.name, 'btn-addFee')"
          >
            <el-button class="finance-btn" type="primary" @click="openAddFeeDialog" size="mini">添加费用</el-button>
          </el-button-group>
        </div>
      </div>
      <DetailFeeSearch
        v-show="feeSearchToggle"
        ref="detailFeeSearch"
        :list="option1.data"
        :extendOptionShow="true"
        @search="search"
      />
      <FinanceTable :option="option1" @send-multi="sendMulti" />
    </div>
    <keep-alive v-if="addFeeDialogVisible.show">
      <AddFeeDialog
        :invoice-payment-id="invoicePaymentId"
        :settle-corp-code="settlementDetailForm.settleCorpCode"
        :settle-comp-code="settlementDetailForm.settleCompCode"
        :settle-corp-name="settlementDetailForm.settleCorpName"
        :settle-comp-name="settlementDetailForm.settleCompName"
        :exist-fee-ids="existFeeIds"
        @add-fee="addFee"
        :dialog-visible="addFeeDialogVisible"
      />
    </keep-alive>
    <keep-alive v-if="relationRegDialogVisible.show">
      <RelationReg
        :isJumpRouteFromPage.sync="isJumpRouteFromPage"
        :settleOrderIds="[settleOrderId]"
        :settleOrderFeeIds="settleOrderFeeIds"
        :settleRegList="settleRegList"
        @add-fee="addFee"
        :dialog-visible="relationRegDialogVisible"
      />
    </keep-alive>

    <ExchangeRateDialog
      v-if="ExchangeRateDialogCfg.show"
      :dialogOption="ExchangeRateDialogCfg"
      @close="ExchangeRateDialogClose"
    />
    <FinFileDialog
      v-if="orderDialogOption.show"
      :option="orderDialogOption"
      @close="orderDialogOptionClose"
    />
    <div v-if="customColumnsPopShow">
      <CustomColumns
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        @close="customColumnsPopClose"
      />
    </div>
    <el-dialog
      title="费用代收付"
      :visible.sync="agentReceipayDialogVisible"
      class="finance-agent-receipay"
    >
      <div style="margin:20px auto 0;width:400px;">
        <el-form ref="agentForm" :model="agentForm" label-width="100px" size="mini">
          <el-form-item
            label="选择分公司"
            prop="agentCompCode"
            :rules="{required: true, message: '分公司不能为空', trigger: 'blur'}"
          >
            <el-select
              v-model="agentForm.agentCompCode"
              :placeholder="'请选择'"
              filterable
              remote
              clearable
              :remote-method="(queryString) => {remoteSelect1.remoteMethod && remoteSelect1.remoteMethod(queryString, remoteSelect1)}"
              @visible-change="(value) => {if(value){remoteSelect1.visibleChange && remoteSelect1.visibleChange('', remoteSelect1)}}"
              @change="(value) => {remoteSelect1.change && remoteSelect1.change(value, remoteSelect1)}"
            >
              <el-option
                v-for="(optionItem, j) in remoteSelect1.remoteSelectList || []"
                :key="'remoteSelect1' + j"
                :label="optionItem.label"
                :value="optionItem.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="agentReceipayDialogVisible = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="setAgentCompany" size="mini" :loading="btnLoading">提 交</el-button>
      </span>
    </el-dialog>

    <el-dialog title="导出对账单" :visible.sync="billDialog" width="500px">
      <div style="margin:10px auto -10px;" class="export__dialog">
        <!-- billExportType: '',
        billFeeType: '',-->
        <el-form
          ref="billDialogForm"
          :model="billDialogForm"
          label-width="100px"
          size="mini"
          :rules="billDialogRules"
          :validateOnRuleChange="false"
        >
          <el-form-item label="金额类型：" prop="billFeeType">
            <el-select
              v-model="billDialogForm.billFeeType"
              placeholder="请选择"
              :disabled="billDialogForm.billType === 'bill'"
            >
              <el-option
                v-for="item in dictMap['billFeeType']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="语言：" prop="lang">
            <el-select v-model="billDialogForm.lang" placeholder="请选择">
              <el-option label="中文" value="CN"></el-option>
              <el-option label="英文" value="US"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="模板类型：" prop="billType">
            <el-select v-model="billDialogForm.billType" placeholder="请选择" @change="billTypeChange">
              <el-option
                v-for="item in dictMap['settleOrderBillExportType']"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="exportBill" size="mini">确 认</el-button>
        <el-button @click="billDialog = false" size="mini">取 消</el-button>
      </span>
    </el-dialog>
    <ResultDialog :option="resultDialogOption" @close="resultDialogOption.show = false">
      <div class="result-dialog-descript" slot="descript">
        <span v-for="item in settleOrderBillIds.split(',')" :key="item">{{item}}</span>
      </div>
    </ResultDialog>
    <ResultDialog :option="resultDialogOption2" @close="resultDialogOption2.show = false">
      <div class="result-dialog-descript" slot="descript">
        <span v-for="item in settleOrder_gedgingApplyNoList" :key="item">{{item}}</span>
      </div>
    </ResultDialog>
    <RelationInvoice
      :relationInvoiceForm="relationInvoiceForm"
      :relevanceOpne="relevanceOpne"
      @close-dialog-visible-relationInvoice="closeDialogVisibleRelationInvoice"
    />
    <InovicePreviewPrint
      :dialog-visible-o="dialogVisibleO"
      :customer-info="customerInfo"
      :seller-info="sellerInfo"
      :apply-item-group-list="applyItemGroupList"
      :other-invoice-info="otherInvoiceInfo"
      :isElec="singleInvoiceType"
    />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import InovicePreviewPrint from '@/views/finance/invoiceReceivable/components/invoicePreviewPrint'
import DetailFeeSearch from '@/views/finance/components/financeSearch/detailFeeSearch'
// import DetailAmtSummary from '@/views/finance/components/financeTableMass/detailAmtSummary'
import CustomColumns from '@/components/customColumns'
import AddFeeDialog from './components/addFeeDialog'
import RelationReg from './components/relationReg'
import FinFileDialog from './components/finFileDialog'
import ExchangeRateDialog from './components/exchangeRateDialog'
import InvoiceReceivableApply from '@/views/finance/invoiceReceivable/components/invoiceReceivableApply'
import SettlementPayApply from '@/views/finance/settlement/settlementList/components/settlementPayApply'
// import CreateGedging from '@/views/finance/gedging/components/gedgingDetail'
// import SettleOrderBadDetail from '@/views/finance/otherWriteOff/settleOrderBaddebtList/components/settleOrderBadDetail'
import RelationInvoice from '@/views/finance/pay/settle/components/relationInvoice'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
// 分离一些配置数据、状态、简单的操作到mixin
import { settlementMixin } from './settlementMixin'
import {
  settleOrderAdd,
  settleOrderUpdate,
  adjustSettleOrderExchangeRate, // 提交汇率
  autoCompulateSettleFee, // 自动分配金额
} from '@/api/fin/settleOrder'
import { actualExchangeRate } from '@/api/base'
import { dateFormat, decimalFixed2, originalCurrencyFn } from '@/views/finance/utils/finance'
import { routerMixin } from '@/views/finance/mixins/routerMixin'

export default {
  mixins: [mixin, routerMixin, settlementMixin],
  components: {
    FinanceTable,
    InovicePreviewPrint,
    CustomColumns,
    AddFeeDialog,
    InvoiceReceivableApply,
    SettlementPayApply,
    CreateGedging,
    SettleOrderBadDetail,
    ExchangeRateDialog,
    FinFileDialog,
    RelationInvoice,
    DetailFeeSearch,
    RelationReg,
    DetailAmtSummary,
  },
  created() {
    if (this.$route.meta.close) return
    console.log('created```````````')
    // console.log('created2```````````')
    this.cTimestamp = new Date().getTime()
    this.vmDataBackup = JSON.stringify(this.$data)
    this.init()
    // this.getData()
  },
  activated() {
    console.log('activated```````````')
    let settleOrder_gedgingApplyNoList = localStorage.getItem('settleOrder_gedgingApplyNoList')
    if (settleOrder_gedgingApplyNoList) {
      localStorage.removeItem('settleOrder_gedgingApplyNoList')
      this.getData()
      this.settleOrder_gedgingApplyNoList = JSON.parse(settleOrder_gedgingApplyNoList)
      this.resultDialogOption2.show = true
      return
    }
    let timestamp = new Date().getTime()
    // 由详情返回到生成页，需要继续返回列表页时不需加载数据
    if (this.$route.meta.close) return
    let refreshSettleOrderId = localStorage.getItem('refreshSettleOrderId')
    localStorage.removeItem('refreshSettleOrderId')
    if (refreshSettleOrderId && refreshSettleOrderId == this.$route.query.settleOrderId) {
      this.getData()
      return
    }
    // 解决特殊情况下created和activated重复执行的问题
    if (!this.$route.meta.isUseCache || this.$route.query.applySuccess || this.$route.meta.refresh) {
      // && timestamp - this.cTimestamp > 300
      console.log('activated init```````````')
      this.$refs.settlementForm.resetFields()
      this.$refs.settlementForm.clearValidate()
      // JSON不会对option里面的非变量进行字符串化，需重新赋值给它；另外还要对vmDataBackup重新赋值，否则是空字符串
      if (!this.vmDataBackup) this.vmDataBackup = JSON.stringify(this.$options.data())
      Object.assign(this.$data, JSON.parse(this.vmDataBackup), {
        option: this.$data.option,
        vmDataBackup: this.vmDataBackup,
      })
      this.init()
      this.getData()
    }
  },
  methods: {
    async handleData(res) {
      let data = res.data
      this.backupData = JSON.parse(JSON.stringify(data))
      let {
        settleOrderFeeList,
        orignalPayFeeSumList,
        orignalRecFeeSumList,
        settlePayFeeSumList,
        settleRecFeeSumList,
        offsetPayType,
        exchangeRateList = [],
        sysExchangeRateList = [],
      } = data
      this.isMultiComp = [...new Set((settleOrderFeeList || []).map((item) => item.settleCompCode))].length > 1
      this.backupSettleCorpObj = {
        settleCorpName: data.settleCorpName,
        settleCorpCode: data.settleCorpCode,
        settleCorpType: data.settleCorpType,
        settleCorpSubType: data.settleCorpSubType,
      }
      this.writeoffStatus = data.writeoffStatus
      this.orderTableOption.operationBtns.show = data.writeoffStatus === 'nofinish'
      this.orderTableOption.data = data.relationPayList || []
      let invoicePaymentList = (data.invoicePaymentList || []).map((v) => ({ ...v, invoiceRate: v.rate, _type: 'pay' }))
      this.invoiceTableOption.data = [...(data.invoiceReceivableList || []), ...invoicePaymentList]
      this.invoiceApplyTableOption.data = data.invoiceReceivableApplyList || []
      // console.log(this.invoiceTableOption.data);
      this.settleOrderNo = this.settlementDetailForm.settleOrderNo = data.settleOrderNo
      this.settleOrderId = data.settleOrderId || this.settleOrderId
      Object.assign(this.settlementDetailForm, data)
      this.settlementDetailForm.confirmStatusLabel = data.confirmStatus === 'yes' ? '已确认' : '未确认'
      this.settlementDetailForm.settleOrderStatusLabel = this.dictMapObj.finSettleOrderStatus[data.settleOrderStatus]
      this.unsettleRecvpayType = data.unsettleRecvpayType || ''
      this.adjustRateState = data.adjustRateState == 'yes'
      this.payApplySettleList.data = data.payApplySettleList || []
      this.gendingApplyList.data = data.gendingApplyList || []
      this.writeoffRecvList.data = data.writeoffRecvList || []
      this.writeoffPayList.data = data.writeoffPayList || []
      this.badDebtList.data = data.badDebtList || []
      settleOrderFeeList.forEach((v) => {
        v.settleCurrency = v.settleCurrency || v.currency
        v.edit = true
      })
      // 根据费用处理结算币别
      let settleCurrency = settleOrderFeeList[0]?.settleCurrency
      if (settleOrderFeeList.length > 0 && settleOrderFeeList.every((item) => item.settleCurrency === settleCurrency)) {
        this.settlementDetailForm.settleCurrency = settleCurrency
      } else if (settleOrderFeeList.every((item) => item.settleCurrency === item.currency)) {
        this.settlementDetailForm.settleCurrency = 'original'
      } else {
        this.$msgErrClose('结算币别异常！')
        this.settlementDetailForm.settleCurrency = ''
      }
      if (this.isDetailPage) {
        let { writeoffStatus, finLockStatus, closeStatus, invoiceStatus } = data
        this.invoiceApplyAvaliable = invoiceStatus !== 'finish'
        //财务锁定  用于发起坏账申请 对冲申请等等  存在部分核销也可以发起申请
        this.finLockOrClose = finLockStatus === 'lock' || closeStatus === 'yes'
        //财务锁定 已用 已关闭(核销完)
        this.finLockOrUseOrClose = finLockStatus === 'lock' || invoiceStatus != 'nofinish' || closeStatus === 'yes'
        //财务锁定  关闭（核销完） 开票 已经核销  用于控制结算单属性的编辑
        this.finLockOrInvoiceOrCloseOrWriteOff = this.finLockOrUseOrClose || writeoffStatus !== 'nofinish'
        this.option1.edit = !!this.canEdit
        if (this.option1.operationBtns) {
          this.option1.operationBtns.show = this.finLockOrInvoiceOrCloseOrWriteOff
        }
        let optionColumns = this.option1.columns
        this.isWriteoff = writeoffStatus !== 'nofinish' ? true : false
        if (this.isWriteoff) {
          // 已核销未核销完
          if (!optionColumns.find((item) => item.prop === 'writeoffAmt')) {
            optionColumns.push({ prop: 'writeoffAmt', label: '已核销金额', type: 'text' })
          }
          if (!optionColumns.find((item) => item.prop === 'noWriteoffAmt')) {
            optionColumns.push({ prop: 'noWriteoffAmt', label: '未核销金额', type: 'text' })
          }
        } else {
          // 已核销完 未核销
          let index1 = optionColumns.findIndex((item) => item.prop === 'writeoffAmt')
          if (index1 > -1) {
            optionColumns.splice(index1, 1)
          }
          let index2 = optionColumns.findIndex((item) => item.prop === 'noWriteoffAmt')
          if (index2 > -1) {
            optionColumns.splice(index2, 1)
          }
        }
      }

      this.option1.data = settleOrderFeeList || []
      this.rateType = this.getRateType()
      this.settlementDetailForm.exchangeRateType = data.exchangeRateType || ''
      if (!this.isGedgingSettle(this.rateType)) {
        this.settlementDetailForm.exchangeRateType = ''
      }
      // 以下逻辑只有在可修改汇率（!this.finLockOrUseOrClose && this.canEdit ）时执行
      if (!this.finLockOrUseOrClose && this.canEdit) {
        let settleCurrencys = [...new Set(settleOrderFeeList.map((v) => v.settleCurrency))]
        if (settleCurrency === 'original') {
          this.exchangeRateList = settleCurrencys.map((v) => originalCurrencyFn(v))
        } else {
          await this.getActualRate(this.rateType, true)
          let ratelist = this.isDetailPage ? exchangeRateList : this.dealFeeCurrency()
          this.exchangeRateList = this.dealRateList(ratelist, this.sysExchangeRateList, true)
        }
      } else {
        this.exchangeRateList = this.dealRateList(exchangeRateList, sysExchangeRateList, true)
      }
      this.exchangeRateToFeelist(true)
      this.backupData.settleOrderFeeList = JSON.parse(JSON.stringify(this.option1.data))
      // console.log(this.exchangeRateList)
      // console.log(this.gedgingRateListSys)
      // console.log(this.sysExchangeRateList)
      // debugger
      this.$refs.detailFeeSearch && this.$refs.detailFeeSearch.clearData()
      // this.orignalRecFeeSumList = orignalRecFeeSumList
      // this.orignalPayFeeSumList = orignalPayFeeSumList
      // this.settleRecFeeSumList = settleRecFeeSumList
      // this.settlePayFeeSumList = settlePayFeeSumList
      // this.listToStr(orignalRecFeeSumList, 'orignalRecFeeSumStr', 'rec')
      // this.listToStr(orignalPayFeeSumList, 'orignalPayFeeSumStr', 'pay')
      // this.listToStr(settleRecFeeSumList, 'settleRecFeeSumStr')
      // this.listToStr(settlePayFeeSumList, 'settlePayFeeSumStr')

      console.log('```````````````offsetPayType:', offsetPayType)
      this.dealOffsetPayType(offsetPayType === 'receive', offsetPayType === 'pay')

      let length = this.option1.columns.length
      if (this.adjustRateState && this.option1.columns[length - 1].prop !== 'diffSettleAmt' && !this.canEdit) {
        let arr = [
          { prop: 'newSettleExRate', label: '修改后汇率', type: 'text' },
          { prop: 'newExSettleAmt', label: '修改后折币金额', type: 'text' },
          { prop: 'diffNoWriteoffAmt', label: '改汇未核销金额', type: 'text' },
          { prop: 'diffSettleAmt', label: '折币差额', type: 'text' },
        ]

        // { prop: 'exchangeRate', label: '结算汇率', type: 'text' },
        // { prop: 'exchangeRateFee', label: '折币金额', type: 'text' },
        this.option1.columns.forEach((item, index) => {
          if (item.prop === 'exchangeRate') {
            item.prop = 'oldSettleExRate'
          }
          if (item.prop === 'exchangeRateFee') {
            item.prop = 'oldExSettleAmt'
          }
        })
        this.option1.columns.push(...arr)
      } else if (!this.adjustRateState && this.option1.columns[length - 1].prop === 'diffSettleAmt') {
        this.option1.columns.forEach((item, index) => {
          if (item.prop === 'oldSettleExRate') {
            item.prop = 'exchangeRate'
          }
          if (item.prop === 'oldExSettleAmt') {
            this.option1.columns.splice(index, 1)
            item.prop = 'exchangeRateFee'
          }
        })
        this.option1.columns.splice(length - 4, 4)
      }
      if ((!this.isDetailPage || !this.finLockOrInvoiceOrCloseOrWriteOff) && this.canEdit) {
        this.option1.operationBtns = Object.assign({}, this.option.operationBtns, {
          data: [{ label: '删除', action: 'Delete', show: true }],
          show: true,
        })
      } else {
        this.option1.operationBtns = false
        this.option1.data.forEach((item) => (item.edit = false))
      }
      this.feeSumChange()
      this.loading = false
    },
    // 根据费用内数据获取对冲类型的应收、应付，或结算单的应收、应付
    getRateType(list) {
      list = list || this.option1.data
      let rateType = ''
      if (list.every(({ receipayType: type, feeAmt }) => (type === 'receive' && feeAmt >= 0) || (type === 'pay' && feeAmt < 0))) {
        rateType = 'receive'
      } else if (
        list.every(({ receipayType: type, feeAmt }) => (type === 'pay' && feeAmt >= 0) || (type === 'receive' && feeAmt < 0))
      ) {
        rateType = 'pay'
      } else if (list.every((item) => item.receipayType === 'receive')) {
        rateType = 'gedging_receive'
      } else {
        rateType = 'gedging_pay'
      }
      return rateType
    },
    // 判断结算单是否为对冲类型
    isGedgingSettle(rateType) {
      console.log(rateType)
      return rateType === 'gedging_receive' || rateType === 'gedging_pay'
    },
    // 获取系统对冲、结算汇率
    getActualRate(rateType) {
      rateType = !this.isGedgingSettle(this.rateType) ? rateType : this.settlementDetailForm.exchangeRateType
      if (!rateType) {
        this.sysExchangeRateList = []
        return
      }
      return actualExchangeRate({ rateType }).then((res) => {
        console.log(res.data.map((v) => v.srcCurrency + '-' + v.toCurrency))
        this.sysExchangeRateList = res.data || []
      })
    },
    // 处理汇率列表
    dealRateList(origin = [], sys = [], useOrigin) {
      if (this.isGedgingHide) {
        origin = []
      }
      return origin.map((item) => {
        let { srcCurrency, toCurrency } = item
        // console.log(item)
        let find = sys.find((v) => v.srcCurrency === srcCurrency && v.toCurrency == toCurrency)
        if (item.srcCurrency === toCurrency) {
          find = item
          item.rate = item.lowerRate = item.upperRate = 1
        } else {
          item = useOrigin ? item : find
        }
        if (!item) {
          return this.$msgErrClose(`无对应${srcCurrency}-${toCurrency}的汇率！`)
        }
        // invisible: !currencys.includes(item.srcCurrency),
        return {
          ...item,
          systemRate: find ? find.rate : '', // 系统汇率的rate赋值给结算汇率的systemRate，页面显示的系统汇率与结算汇率共用exchangeRateList
          settlementRateTitle: item.srcCurrency + '-' + item.toCurrency,
          settlementRate: item.rate,
          exchangeRateId: item.exchangeRateId,
          lowerRate: find ? find.lowerRate : item.lowerRate,
          upperRate: find ? find.upperRate : item.upperRate,
          disabled: item.srcCurrency === item.toCurrency ? true : false,
        }
      })
    },
    // 处理费用列表原币、结算币种为不重复数组
    dealFeeCurrency() {
      let currencys = [...new Set(this.option1.data.map((v) => v.currency + '-' + v.settleCurrency))]
      // console.log(currencys)
      return currencys.map((v) => ({ srcCurrency: v.split('-')[0], toCurrency: v.split('-')[1] }))
    },
    // currency币别 refresh是否刷对冲汇率 refreshGedging刷新对冲汇率
    async currencyChange(value) {
      console.log(this.rateType)
      // 如果选择原币别，但是各个币别其实相同，将结算币别置为该币别
      let list = this.option1.data
      let firstCurrency = list[0].currency
      if (value === 'original' && list.every((item) => firstCurrency === item.currency)) {
        this.settlementDetailForm.settleCurrency = value = firstCurrency
      }
      list.forEach((item) => (item.settleCurrency = value !== 'original' ? value : item.currency))
      // 汇率联动
      // let currencys = list.filter((v) => v.feeCode !== 'ZCPXF').map((item) => item.currency)
      let currencys = list.map((item) => item.currency)
      currencys = [...new Set(currencys)]
      if (value === 'original') {
        this.exchangeRateList = currencys.map((v) => originalCurrencyFn(v))
      } else {
        await this.getActualRate(this.rateType)
        this.exchangeRateList = this.dealRateList(this.dealFeeCurrency(), this.sysExchangeRateList)
      }
      // 费用合计联动
      this.exchangeRateToFeelist(true, true)
    },
    async rateTypeChange(val) {
      await this.getActualRate(val)
      this.exchangeRateList = this.dealRateList(this.dealFeeCurrency(), this.sysExchangeRateList)
      this.exchangeRateToFeelist(true, true)
    },
    feeSumChange(onlyOffset) {
      // if (!this.exchangeRateList.length) return
      console.log('``````````', this.option1.data)
      let isSelected = this.multipleSelection1.length
      let currencys = [...new Set(this.option1.data.map((item) => item.currency))]
      let settleCurrency = this.settlementDetailForm.settleCurrency
      let orignalRecFeeSumList = [] // 原始费用应收合计
      let orignalPayFeeSumList = [] // 原始费用应付合计
      let settleRecFeeSumList = [] // 结算费用应收合计
      let settlePayFeeSumList = [] // 结算费用应付合计
      let offSetRecFeeSumList = [] // 轧差应付合计
      let offSetPayFeeSumList = [] // 轧差应收合计
      currencys.forEach((currency) => {
        orignalRecFeeSumList.push({ currency, sumAmt: 0 })
        orignalPayFeeSumList.push({ currency, sumAmt: 0 })
      })
      let pushFn = (arr = [], obj = {}) => arr.forEach((v) => v.push({ ...obj }))
      let sumListArr = [settleRecFeeSumList, settlePayFeeSumList, offSetRecFeeSumList, offSetPayFeeSumList]
      if (settleCurrency === 'original') {
        // 如果原币结算
        currencys.forEach((currency) => pushFn(sumListArr, { currency, sumAmt: 0 }))
      } else {
        // 如果其他币结算
        pushFn(sumListArr, { currency: settleCurrency, sumAmt: 0 })
      }

      // console.log(exchangeRateList);
      // 计算应收合计，应付合计的通用函数
      const findCalcFn = (arr, currency, calc, itemCurrencyStr, sumAmtStr) => {
        let find = arr.find((item) => item[itemCurrencyStr || 'currency'] === currency)
        find[sumAmtStr || 'sumAmt'] = new LSnum(find[sumAmtStr || 'sumAmt']).plus(calc).toNum(2)
      }
      let gedgingAmt = 0
      this.option1.data.forEach((item) => {
        let { receipayType, currency, settleAmt: feeAmt, exchangeRateFee, invisible, $isRowCheck } = item
        console.log(feeAmt)
        if (receipayType === 'pay') {
          if (((isSelected && $isRowCheck) || !isSelected) && !invisible && !onlyOffset) {
            findCalcFn(orignalPayFeeSumList, currency, feeAmt)
            findCalcFn(settlePayFeeSumList, item.settleCurrency, exchangeRateFee)
          }
          //   &&
          // !invisible && !onlyOffset &&
          findCalcFn(offSetPayFeeSumList, item.settleCurrency, exchangeRateFee)
          if (settleCurrency !== 'original') {
            findCalcFn(offSetRecFeeSumList, item.settleCurrency, -exchangeRateFee)
          }
        } else if (receipayType === 'receive') {
          if (((isSelected && $isRowCheck) || !isSelected) && !invisible && !onlyOffset) {
            findCalcFn(orignalRecFeeSumList, currency, feeAmt)
            findCalcFn(settleRecFeeSumList, item.settleCurrency, exchangeRateFee)
          }
          // !invisible && !onlyOffset && findCalcFn(orignalRecFeeSumList, currency, feeAmt)
          // !invisible && !onlyOffset && findCalcFn(settleRecFeeSumList, item.settleCurrency, exchangeRateFee)
          findCalcFn(offSetRecFeeSumList, item.settleCurrency, exchangeRateFee)
          if (settleCurrency !== 'original') {
            findCalcFn(offSetPayFeeSumList, item.settleCurrency, -exchangeRateFee)
          }
        }
        gedgingAmt = new LSnum(gedgingAmt).plus(receipayType === 'pay' ? -exchangeRateFee : exchangeRateFee).toNum(2)
      })

      // ----------------------------------- 轧差后合计 begin -----------------------------------
      this.settlementDetailForm.offSetFeeSumStr = ''
      let offsetFn = (list, sumStr, str) => {
        list
          .filter((v) => v.sumAmt)
          .forEach((item, index) => {
            if (index === 0) {
              this.settlementDetailForm[sumStr] += str
            }
            this.settlementDetailForm[sumStr] += item.currency + Math.abs(item.sumAmt) + ' ' // '&nbsp;&nbsp;'
          })
      }
      if (settleCurrency === 'original') {
        gedgingAmt = 0
        offsetFn(offSetRecFeeSumList, 'offSetFeeSumStr', '应收')
        offsetFn(offSetPayFeeSumList, 'offSetFeeSumStr', '应付')
      } else {
        offsetFn(gedgingAmt > 0 ? offSetPayFeeSumList : offSetRecFeeSumList, 'offSetFeeSumStr', '')
      }
      this.dealOffsetPayType(gedgingAmt > 0, gedgingAmt < 0)
      if (onlyOffset) return
      // ----------------------------------- 轧差后合计 end -----------------------------------
      // 处理原始费用应收/应付合计，结算费用应收/应付合计，轧差合计的字符串通用函数
      let originalCurrencyFeeFn = (arr, sumStr, type) => {
        this.settlementDetailForm[sumStr] = ''
        arr.forEach((item) => {
          if (item.sumAmt === 0) return

          // console.log(feeListPay, feeListReceive)
          // for (const key in feeListPay) {
          //   feeListPayStr += `${key} <span style="color:rgb(51, 177, 138)">${feeListPay[key]}</span> `
          // }
          // for (const key in feeListReceive) {
          //   feeListReceiveStr += `${key} <span style="color:rgb(230, 57, 35)">${feeListReceive[key]}</span> `
          // }
          if (type) {
            this.settlementDetailForm[sumStr] +=
              item.currency +
              ` <span style="color:${type === 'rec' ? 'rgb(230, 57, 35)' : 'rgb(51, 177, 138)'}">${item.sumAmt}</span>` +
              ' '
          } else {
            this.settlementDetailForm[sumStr] += item.currency + item.sumAmt + ' '
          }
        })
      }
      // console.log(orignalRecFeeSumList)
      // console.log(orignalPayFeeSumList)
      // console.log(settleRecFeeSumList)
      // console.log(settlePayFeeSumList)
      this.orignalRecFeeSumList = orignalRecFeeSumList.filter((v) => +v.sumAmt)
      this.orignalPayFeeSumList = orignalPayFeeSumList.filter((v) => +v.sumAmt)
      this.settleRecFeeSumList = settleRecFeeSumList.filter((v) => +v.sumAmt)
      this.settlePayFeeSumList = settlePayFeeSumList.filter((v) => +v.sumAmt)
      // originalCurrencyFeeFn(orignalRecFeeSumList, 'orignalRecFeeSumStr', 'rec')
      // originalCurrencyFeeFn(orignalPayFeeSumList, 'orignalPayFeeSumStr', 'pay')
      // originalCurrencyFeeFn(settleRecFeeSumList, 'settleRecFeeSumStr')
      // originalCurrencyFeeFn(settlePayFeeSumList, 'settlePayFeeSumStr')
    },
    addFee(multipleSelection) {
      let currency = this.settlementDetailForm.settleCurrency
      multipleSelection.forEach((item) => {
        item.edit = true
        this.option1.data.push({ ...item, settleCurrency: currency === 'original' ? item.currency : currency })
      })
      this.addDelFee(true)
    },
    handleDelete($index, row, option) {
      if (this.option1.data.length <= 1) {
        return this.$msgErrClose('费用列表至少要有一条记录!')
      }
      this.$confirmWarn('是否确认删除？', () => {
        let findIndex = this.option1.data.findIndex((v) => v.feeId === row.feeId)
        this.option1.data.splice(findIndex, 1)
        this.addDelFee()
      })
    },
    sendMulti(data, option) {
      console.log('```````````````````sendMulti')
      if (option === this.option1) this.multipleSelection1 = data
      this.settleOrderFeeIds = data.map((v) => v.settleOrderFeeId)
      console.log(this.multipleSelection1)
      this.feeSumChange()
    },
    // 查看汇率 type lock强制修改  diy结算汇率  cash客户专项 system系统 gedgind对冲
    checkExchangeRage(type) {
      this.ExchangeRateDialogCfg.change = type === 'lock' && this.checkAuth(this.$route.name, 'btn-exchangeRate')
      if ((type === 'diy' || type === 'gedging') && !this.finLockOrUseOrClose && this.canEdit) {
        this.ExchangeRateDialogCfg.change = true && this.checkAuth(this.$route.name, 'btn-exchangeRate')
      }
      // if (type === 'cash' && this.canEdit && this.settlementDetailForm.zcfRateEdit) {
      //   this.ExchangeRateDialogCfg.change = true && this.checkAuth(this.$route.name, 'btn-exchangeRate')
      // }
      this.ExchangeRateDialogCfg.type = type
      this.ExchangeRateDialogCfg.show = true
      // if (type === 'cash') {
      //   this.ExchangeRateDialogCfg.data = this.exchangeRatesCash
      // } else
      this.ExchangeRateDialogCfg.data = JSON.parse(JSON.stringify(this.exchangeRateList))
    },
    // 修改汇率
    ExchangeRateDialogClose(arr, type) {
      if (type == 'lock') {
        let rateList = arr.map((val) => ({
          srcCurrency: val.originCurrency,
          toCurrency: val.settleCurrency,
          rate: val.exhangeRate,
        }))
        adjustSettleOrderExchangeRate({ settleOrderNo: this.settleOrderNo, rateList }).then((res) => this.handleData(res))
        return
      }
      this.exchangeRateList.forEach((item, index) => {
        item.rate = item.settlementRate = arr[index]['exhangeRate']
      })
      this.exchangeRateToFeelist(true)
    },
    // 可对冲费用， 自动分配费用金额
    autoCompulateSettleFee() {
      let data = {
        settleCurrency: this.settlementDetailForm.settleCurrency,
        settleCycle: this.settlementDetailForm.settleCycle,
        exchangeRateList: this.exchangeRateList,
        settleOrderFeeList: this.option1.data,
        sourceType: this.sourceType,
        sourceOrderBillNo: this.sourceOrderBillNo,
        settleCorpCode: this.settlementDetailForm.settleCorpObj.settleCorpCode || this.settlementDetailForm.settleCorpCode,
        settleCorpName: this.settlementDetailForm.settleCorpObj.settleCorpName || this.settlementDetailForm.settleCorpName,
      }
      autoCompulateSettleFee(data).then((res) => {
        this.$msgSucClose('自动分配成功！')
        ;(res.data || []).forEach((item) => {
          let find = this.option1.data.find((fee) => item.feeId === fee.feeId)
          find.settleAmt = item.gedgingAmt
        })
      })
      this.exchangeRateToFeelist(true)
    },
    // 费用删除、新增处理逻辑 isAdd: true, 新增
    // 暂时处理为增加、删除都重置结算汇率
    async addDelFee(isAddDel) {
      let rateType = this.getRateType()
      let isGedgingSettle = this.isGedgingSettle(rateType)
      // 重新判断对冲类型
      console.log(this.rateType, rateType, isGedgingSettle)
      if (!isGedgingSettle) {
        this.settlementDetailForm.exchangeRateType = ''
      }
      if (this.rateType !== rateType) {
        this.rateType = rateType
        await this.getActualRate(rateType)
        this.feeChangeUpdateRateList(false)
      } else {
        this.feeChangeUpdateRateList(true)
      }
      this.exchangeRateToFeelist(true)
    },
    // 费用新增、删除后，要同步更新对冲汇率列表，结算汇率列表
    async feeChangeUpdateRateList(rateTypeEq) {
      let list = this.option1.data
      if (rateTypeEq) {
        if (!this.exchangeRateList.find((item) => list.find((v) => v.currency === item.srcCurrency))) {
          this.exchangeRateList = this.dealRateList(this.dealFeeCurrency(), this.sysExchangeRateList)
        }
      } else {
        this.exchangeRateList = this.dealRateList(this.dealFeeCurrency(), this.sysExchangeRateList)
      }
    },
    // 结算汇率变动后，赋值到费用列表的折币金额，结算汇率   onlyOffset初始化的时候调用
    exchangeRateToFeelist(refreshFee, onlyOffset) {
      // TODO 结算汇率赋值到费用列表
      let exchangeRateList = this.exchangeRateList
      this.option1.data.forEach((item) => {
        let settlementRateTitle = item.currency + '-' + item.settleCurrency
        let obj = exchangeRateList.find((val) => val.settlementRateTitle === settlementRateTitle)
        let rate = this.isGedgingHide ? '' : obj ? obj.settlementRate : 1
        this.$set(item, 'exchangeRate', rate)
        this.$set(item, 'exchangeRateFee', new LSnum(rate).times(item.settleAmt).toNum(2))
      })
      this.option1.data = [...this.option1.data]
      this.$forceUpdate()
      // refreshFee && this.feeSumChange(onlyOffset)
      // refreshFee && this.feeSumChange(true)
      refreshFee && this.feeSumChange()
    },
  },
  watch: {
    canEdit(val) {
      this.option1.edit = val
      this.option1.columns.forEach((item) => {
        if (item.prop === 'settleAmt') {
          item.readOnly = !val
        }
      })
    },
    'option1.data': {
      // 费用列表变动
      handler(newVal, oldVal) {
        // 此监听函数内强制刷新option1.data，判断此值，避免死循环
        if (
          newVal.length &&
          newVal.find(({ settleCorpSubType: type }) => type.indexOf('foreign_peer') > -1 || type.indexOf('foreign_cust') > -1)
        ) {
          this.isForeign = true
        } else {
          this.isForeign = false
        }
        if (!this.isForeign) this.orderTableOption.operationBtns.show = false
        // 费用列表变动时处理结算单位列表
        // if((newVal&&newVal.length)&&(!oldVal || newVal.length != oldVal.length)){
        //   if(!oldVal){
        //     let obj = {...newVal[0], label:newVal[0].settleCorpName, value:newVal[0].settleCorpCode}
        //     this.settleCorpList.splice(0, 1000, obj)
        //   }else if(newVal.length != oldVal.length){
        let backupSettleCorpObj = this.backupSettleCorpObj || {}
        let obj = {
          [backupSettleCorpObj.settleCorpCode]: {
            ...backupSettleCorpObj,
            label: backupSettleCorpObj.settleCorpName,
            value: backupSettleCorpObj.settleCorpCode,
          },
        }
        let list = obj[backupSettleCorpObj.settleCorpCode] ? [obj[backupSettleCorpObj.settleCorpCode]] : []
        newVal.forEach((item) => {
          if (!obj[item.settleCorpCode]) {
            obj[item.settleCorpCode] = true
            list.push({ ...item, label: item.settleCorpName, value: item.settleCorpCode })
          }
        })
        this.settleCorpList.splice(0, 1000, ...list)
        // }
        this.settlementDetailForm.settleCorpObj =
          this.settleCorpList.find(({ settleCorpCode }) => settleCorpCode == this.settlementDetailForm.settleCorpCode) || {}
        if (!this.settlementDetailForm.settleCycle)
          this.settlementDetailForm.settleCycle = this.settlementDetailForm.settleCorpObj.settleCycle
        // }
        // console.log( this.settleCorpList)
      },
      deep: true,
      // immediate: true,
    },
    'settlementDetailForm.exchangeRateType': {
      handler(newVal, oldVal) {
        console.log(newVal)
      },
      deep: true,
      immediate: true,
    },
    agentReceipayDialogVisible(newVal) {
      if (newVal) {
        this.agentForm.agentCompCode = this.agentForm.agentCompName = ''
      }
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
.el-form-item-offsetfeesumstr {
  margin-right: 0;
}

.money-box-title {
  font-size: 14px;
  font-weight: bold;
  color: #222222;
  padding-right: 18px;
}
.money-box-text {
  display: inline-block;
  padding-right: 10px;
}
.settlement-detail-form-own {
  .el-form-item {
    margin-right: 16px;
    display: inline-flex;
    ::v-deep label {
      flex: 0 0 auto;
    }
    ::v-deep .el-form-item__content {
      flex: 1 1 auto;
      height: 20px;
      // width: auto;
    }
    .el-tooltip {
      height: 20px;
      overflow: hidden;
      display: inline-block;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
    }
  }
  h3 {
    font-size: 14px;
    color: #222222;
    padding: 0;
    margin: 12px 0 0px 0;
  }
  .devide-line {
    background: #e9e9e9;
    height: 1px;
    margin-top: 12px;
  }
}
.el-form-item-text {
  padding-top: 0;
  font-size: 12px;
  line-height: 20px;
  height: 20px;
  word-break: break-word;
}
.settle_rate_list {
  width: 100%;
  margin-bottom: 4px;
  .settle_rate_list_title {
    display: inline-block;
    width: 100px;
    text-align: right;
    padding-right: 4px;
  }
}
.export__dialog .el-form-item__content > div {
  width: 100%;
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
