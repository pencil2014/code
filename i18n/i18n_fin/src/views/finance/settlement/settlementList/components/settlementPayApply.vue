<template>
<div class="finance-page settlement-pay-apply-detail"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground">
  <div class="finance-detail-page">
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">{{applyNo ? $t('Settle.paymentDetails') : $t('Settle.settlementApply')}}</div>
        </div>
        <div v-if="!applyNo" class="money-box-right">
          <el-button-group>
            <el-button class="finance-btn" @click="submit" type="primary" size="mini">{{$t('Settle.submit')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" @click="cancel" size="mini">{{$t('FeeList.cancel')}}</el-button>
          </el-button-group>
        </div>
        <div v-if="applyNo" class="money-box-right">
          <el-button-group>
            <el-button type="success" v-if="!isApproved && checkAuth($route.name, 'btn-settlementPass')" class="finance-btn" @click="approvePass('pass')" size="mini">{{$t('Settle.approved')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button v-if="!isApproved && checkAuth($route.name, 'btn-settlementRefuse')" class="finance-btn" @click="refuseDialog" type="danger" size="mini">{{$t('Settle.refuse')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button v-if="!isStatus && checkAuth($route.name, 'btn-handleWithdrawPayApplyAudit')" class="finance-btn" @click="handleWithdrawPayApplyAudit" size="mini" type="purple">{{$t('Settle.revokeApproval')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button v-if="!isApproved && checkAuth($route.name, 'btn-handleSettleSubmit')" class="finance-btn" @click="handleSettleSubmit" size="mini" type="">{{$t('Settle.save')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" @click="cancel" size="mini">{{$t('Common.back')}}</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    <div class="settlement-detail-form">
      <h3 style="font-size:12px">{{$t('Settle.baseInfo')}}</h3>
      <el-form v-show="!applyNo" label-width="200px" :model="payApplyDetailForm" ref="payApplyDetailForm" :inline="true" size="mini" :rules="rules" class="settlement-detail-form-1"  label-suffix=':'>
        <el-form-item :label="$t('FeeList.settleCorp')" prop="recvCorpCode" class="flex-item">
          <el-select
            v-model="payApplyDetailForm.recvCorpCode"
            :placeholder="$t('Common.plSelect')"
            style="width:46% !important"
            @change="recvCorpCodeChange">
            <el-option
              v-for="(op, j) in settleUnitList"
              :key="'settleUnitList' + j"
              :label="op.unitName"
              :value="op.unitCode">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="blackType" :label="$t('Settle.blackType')">
          <div class="el-form-item-text" v-html="blackType">
          </div>
        </el-form-item>
        <el-form-item :label="$t('Settle.settleCycle')" prop="settleCycle">
          <div class="el-form-item-text" v-html="renderNoEdit(payApplyDetailForm, {prop: 'settleCycle', type: 'select'})">
          </div>
        </el-form-item>
        <el-form-item :label="$t('Settle.settleCurrency')" prop="currency">
          <div class="el-form-item-text" v-html="payApplyDetailForm.currency">
          </div>
        </el-form-item>
        <DetailDiv :label="$t('Settle.recvWriteoffStatus')" :content="renderNoEdit(payApplyDetailForm, {prop: 'recvWriteoffStatus', propInDict: 'writeoffStatus', type: 'select'})"/>
        <DetailDiv :label="$t('FeeList.recFeeAmt')" :content="payApplyDetailForm.orderReciSumAmt" :isTooltip="true"/>
        <DetailDiv :label="$t('Settle.reciNoWriteOffAmtDesc')" :content="payApplyDetailForm.orderReciNoWriteOffAmt" :isTooltip="true"/>
        <DetailDiv :label="$t('Settle.reciWriteOffAmtDesc')" :content="payApplyDetailForm.orderReciWriteOffAmt" :isTooltip="true"/>
        <!-- <el-form-item label="应收核销状态：" prop="recvWriteoffStatus">
          <el-input	:value="renderNoEdit(payApplyDetailForm, {prop: 'recvWriteoffStatus', propInDict: 'writeoffStatus', type: 'select'})" disabled	:placeholder="$t('Common.plEnter')"></el-input>
        </el-form-item>
        <el-form-item label="应收金额：" prop="orderReciSumAmt">
          <el-input	v-model="payApplyDetailForm.orderReciSumAmt" disabled	:placeholder="$t('Common.plEnter')"></el-input>
        </el-form-item>
        <el-form-item label="应收未核销金额：" prop="orderReciNoWriteOffAmt">
          <el-input	v-model="payApplyDetailForm.orderReciNoWriteOffAmt" disabled	:placeholder="$t('Common.plEnter')"></el-input>
        </el-form-item>
        <el-form-item label="应收已核销金额：" prop="orderReciWriteOffAmt">
          <el-input	v-model="payApplyDetailForm.orderReciWriteOffAmt" disabled	:placeholder="$t('Common.plEnter')"></el-input>
        </el-form-item> -->
        <el-form-item :label="$t('Settle.latestPayDate')" :prop="!applyNo ? 'latestDate' : ``" >
          <el-date-picker
            size="mini"
            v-model="payApplyDetailForm.latestDate"
            type="date"
            format="yyyy-MM-dd"
            :placeholder="$t('Common.plSelect')"
            clearable>
          </el-date-picker>
        </el-form-item>
        <el-form-item :label="$t('Settle.recvFinishsProveFileNo')" prop="recvFinishsProveFileNo">
          <template v-if="!payApplyDetailForm.recvFinishsProveFileNo">
            <ClipboardUpload @send-res-file-list="receiveResFileList" />
          </template>
          <template v-else>
            <div class="seqfile-box">
              <el-button
                @click="handleBankseqFileNo"
                size="mini"
                type="text"
                v-if="payApplyDetailForm.recvFinishsProveFileNo"
                >{{$t('Settle.clickView')}}</el-button
              >
              <el-button
                @click="handleDeleteFileNo"
                size="mini"
                type="text"
                v-if="payApplyDetailForm.recvFinishsProveFileNo"
                >{{$t('Settle.delete')}}</el-button
              >
              <div
                style="width: 147px; display: inline-block; font-size: 12px"
                v-if="!payApplyDetailForm.recvFinishsProveFileNo"
              >
                {{$t('Common.nothing')}}
              </div>
            </div>
          </template>
        </el-form-item>
        <el-form-item :label="$t('Settle.applyRemarks')" label-width="200px" class="flex-item" prop="">
          <el-input
            type="textarea"
            autosize
            v-model="payApplyDetailForm.remark"
            :placeholder="$t('Settle.applyRemarksTips')"
            maxlength="500"
            show-word-limit>
          </el-input>
        </el-form-item>

        <!-- <el-form-item label="上传附件：">
          <ClipboardUploadEmbed
            @send-res-file-list="sendResFileList" />
        </el-form-item>
        实验剪贴板 -->
      </el-form>
      <div v-show="applyNo">
        <DetailDiv  :label="$t('Settle.paymentNo')" :content="payApplyDetailForm.applyNo"/>
        <DetailDiv  :label="$t('Settle.settlementNo')" :content="payApplyDetailForm.settleOrderNo" :isTooltip="true"/>
        <DetailDiv  :label="$t('FeeList.settleCorp')" :content="payApplyDetailForm.recvCorpName" :isTooltip="true"/>
        <DetailDiv  :label="$t('Settle.agentStatus')" :content="renderNoEdit(payApplyDetailForm, {prop: 'hasAgentPay', propInDict: 'yesNo', type: 'select'})"/>
        <DetailDiv  :label="$t('Settle.settleCycle')" :content="renderNoEdit(payApplyDetailForm, {prop: 'settleCycle', type: 'select'})"/>
        <DetailDiv  :label="$t('Settle.settleCurrency')" :content="payApplyDetailForm.currency"/>
        <DetailDiv  :label="$t('FeeList.sysLineCode')" :content="payApplyDetailForm.sysLineName" :isTooltip="true"/>
        <DetailDiv  :label="$t('Settle.applicant')" :content="payApplyDetailForm.createdName"/>
        <DetailDiv  :label="$t('Settle.applicationDate')" :content="payApplyDetailForm.createdTime"/>
        <!-- <DetailDiv  label="最晚付款时间：" :content="payApplyDetailForm.latestDate"/> -->
        <!-- <DetailDiv  label="审核状态：" :content="renderNoEdit(payApplyDetailForm, {prop: 'confirmStatus', propInDict: 'auditStatusNocancel', type: 'select'})"/> -->
        <!-- <DetailDiv  label="审核人：" :content="payApplyDetailForm.confirmName"/> -->
        <!-- <DetailDiv  label="审核时间：" :content="payApplyDetailForm.confirmTime"/> -->
        <el-form label-width="200px" :model="payApplyDetailForm" :inline="true" ref="payApplyDetailForm"  label-suffix=':'>
          <!-- <el-form-item label="最晚付款时间：" :prop="applyNo ? 'latestDate' : ``" :rules="{ required: true, message: ' ', trigger: 'blur' }"> -->
          <el-form-item :label="$t('Settle.latestPayDate')" :prop="applyNo ? 'latestDate' : ``">
            <el-date-picker
              size="mini"
              v-model="payApplyDetailForm.latestDate"
              v-if='!isApproved'
              type="date"
              format="yyyy-MM-dd"
              :placeholder="$t('Common.plSelect')">
            </el-date-picker>
            <div v-if="isApproved">{{payApplyDetailForm.latestDate}}</div>
        </el-form-item>
          <el-form-item :label="$t('Settle.recvFinishsProveFileNo')" prop="recvFinishsProveFileNo">
            <template v-if="!payApplyDetailForm.recvFinishsProveFileNo">
              <div
                  style="width: 147px; display: inline-block; font-size: 12px"
                  v-if="!payApplyDetailForm.recvFinishsProveFileNo"
                >
                  {{$t('Common.nothing')}}
              </div>
            </template>
            <template v-else>
              <div class="seqfile-box">
                <el-button
                  @click="handleBankseqFileNo"
                  size="mini"
                  type="text"
                  v-if="payApplyDetailForm.recvFinishsProveFileNo"
                  >{{$t('Settle.clickView')}}</el-button
                >
              </div>
            </template>
          </el-form-item>
        </el-form>
        <!-- <DetailDiv v-if="!payApplyDetailForm.refuseReason && !payApplyDetailForm.payOrderRefuseReason" label="审核拒绝原因：" :content="payApplyDetailForm.refuseReason" :isFull="true" />
        <DetailDiv v-if="payApplyDetailForm.refuseReason" label="审核拒绝原因：" :content="payApplyDetailForm.refuseReason" :isFull="true" /> -->
        <DetailDiv v-if="payApplyDetailForm.payOrderRefuseReason"  :label="$t('Settle.payOrderRefuseReason')" :content="payApplyDetailForm.payOrderRefuseReason" :isFull="true" />
        <!-- 拉黑说明---20221027改为不显示  -->
        <!-- <DetailDiv class="flex-item red-lable" label="拉黑说明：" v-if="payApplyDetailForm.hasBlack === 'yes'" :content="payApplyDetailForm.hasBlackReason" :isTooltip="true"  :isFull="true"/> -->
        <DetailDiv  :label="$t('Settle.applyRemarks')" :content="payApplyDetailForm.remark" :isFull="true"/>
        <!-- <DetailDiv v-show="isApproved"  label="审核备注：" :content="payApplyDetailForm.auditOpinion" :isFull="true"/> -->
        <div v-show="!isApproved" class="settlement-detail-form-remark">
          <el-form label-width="200px" :inline="true" style="width:100%" >
            <el-form-item :label="$t('Settle.approvalRemarks')" label-width="208px" style="display:flex;" prop="">
              <el-input
                type="textarea"
                autosize
                v-model="payApplyDetailForm.auditOpinion"
                :placeholder="$t('Settle.approvalRemarksTips')"
                maxlength="500"
                show-word-limit>
              </el-input>
            </el-form-item>
          </el-form>
        </div>
        <div class="order-box">
          <h3 style="font-size:12px">{{$t('Settle.releaseTitle')}}</h3>
          <DetailDiv  :label="$t('Settle.recvWriteoffStatus')" :content="renderNoEdit(payApplyDetailForm, {prop: 'recvWriteoffStatus', propInDict: 'writeoffStatus', type: 'select'})"/>
          <DetailDiv  :label="$t('Settle.releaseSit')" :content="renderNoEdit(payApplyDetailForm, {prop: 'putStatus', propInDict: 'finOrderPutStatus', type: 'select'})"/>
          <DetailDiv  :label="$t('FeeList.recFeeAmt')" :content="payApplyDetailForm.orderReciSumAmt" :isTooltip="true"/>
          <DetailDiv  :label="$t('Settle.reciWriteOffAmtDesc')" :content="payApplyDetailForm.orderReciWriteOffAmt" :isTooltip="true"/>
          <DetailDiv  :label="$t('Settle.reciNoWriteOffAmtDesc')" :content="payApplyDetailForm.orderReciNoWriteOffAmt" :isTooltip="true"/>
        </div>
      </div>
    </div>
    <div v-if="applyNo" class="check-box">
      <div class="title">{{$t('Settle.auditTitle')}}</div>
      <FinanceTableMass :option="optionCheck" />
    </div>


    <div class="finance-table-container" v-for="(item, index) in payInfoList" :key="index">
      <div class="money-box" style="background: #F8F9FD;">
        <div class="money-box-left">
          <div class="money-title size-12">{{item.currency}} {{$t('Settle.paymentInfo')}}</div>
        </div>
        <div class="money-box-right">
          <!-- <el-button v-if="checkAuth($route.name, 'btn-handleInternalFee') && (applyNo) && (!isApproved && item.payWay !== 'intrabranch')" class="finance-btn" @click="handleInternalFee" size="mini">代大掌柜付款</el-button> -->
          <!-- 目前的设计是预付抵账款移到了付款单核销页面 -->
          <!-- <el-button v-show="applyNo && item.payWay === 'prepay_dedue'" class="finance-btn" @click="relevancePrepay(item)" size="mini">关联预付款</el-button> -->
          <!-- <el-button v-if="checkAuth($route.name, 'btn-settlementAddInvoice')" type="primary" class="finance-btn" @click="identifyElecInvoice(item,index)" size="mini">{{$t('Settle.identifyElecInvoice')}}</el-button> -->
          <!-- <el-button v-if="checkAuth($route.name, 'btn-settlementAddInvoice')" class="finance-btn" @click="addInvoice(item,index)" size="mini">{{$t('Settle.addInvoice')}}</el-button> -->
          <!-- <el-button v-if="checkAuth($route.name, 'btn-settlementRelevance') && (applyNo || payApplyDetailForm.confirmStatus !== 'refuse')" class="finance-btn" @click="relevance(item)" size="mini">{{$t('Settle.relevance')}}</el-button> -->
          <el-button type="text" class="collapse-btn" @click="handleCollapse(index)" size="mini">{{ item.showTable1 ? $t('Common.collapse') : $t('Common.expand')}}<i :class="{'el-icon-arrow-up': item.showTable1, 'el-icon-arrow-down': !item.showTable1}"></i></el-button>
        </div>
      </div>
      <div v-show="item.showTable1" class="detail-info-other">
         <el-form :model="item" :ref="'payForm' + index" label-width="200px"  :inline="true" size="mini" label-suffix=':'>
            <el-form-item :label="$t('Settle.branchCompany')" prop="payCompName" >
              <el-tooltip class="item" effect="dark" :content="item.payCompName" placement="top">
                <el-input	v-model="item.payCompName" disabled	:placeholder="$t('Common.plEnter')"></el-input>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('Settle.paymentCurrency')" prop="currency">
              <el-input	v-model="item.currency" disabled	:placeholder="$t('Common.plEnter')"></el-input>
            </el-form-item>
            <el-form-item :label="$t('PayApplyList.applyPayAmt')" prop="applyPayAmt">
              <el-input	:value="decimalFixed2(item.applyPayAmt)" disabled	:placeholder="$t('Common.plEnter')"></el-input>
            </el-form-item>
             <!-- <el-form-item :label="$t('Settle.delayInvoice')" prop="delayInvoice">
              <el-input	:value="dictMapObj.yesNo[item.delayInvoice]" disabled	:placeholder="$t('Common.plEnter')"></el-input>
            </el-form-item>
            <el-form-item :label="$t('Settle.delayInvoiceAmt')" prop="delayInvoiceAmt">
              <el-input	:value="decimalFixed2(item.delayInvoiceAmt)" disabled	:placeholder="$t('Common.plEnter')"></el-input>
            </el-form-item> -->
            <el-form-item v-if="applyNo" :label="$t('Settle.lessPayAmt')" prop="lessPayAmt">
              <el-input	:value="decimalFixed2(item.lessPayAmt)" disabled	:placeholder="$t('Common.plEnter')"></el-input>
            </el-form-item>
            <!-- <DetailDiv  :label="$t('Settle.paymentCurrency')" :content="item.currency"/>
            <DetailDiv :label="$t('PayApplyList.payAmt')" :content="decimalFixed2(item.applyPayAmt)"/>
            <DetailDiv label="专项类手续费：" :content="decimalFixed2(item.lessPayAmt)"/> -->
               <!-- :rules="payWayRules" -->
               <!-- 提示时控制 -->
            <el-form-item v-if="!isApproved" :label="$t('Settle.payWay')" prop="payWay" :rules="{ required: true, message: ' ', trigger: 'change' }" >
              <el-select v-model="item.payWay" :placeholder="$t('Common.plSelect')"
                @change="payWayChange(item,false,index)"
              >
              <!-- @change="(value, currency, payCorpCode, obj) => {select3.change(value, item.currency, item.payCorpCode,item) }" style="width:100px" -->
                <el-option
                  v-for="it in dictMap['payWay']"
                  :disabled="item.payWayHasHK !=='yes' && it.value === 'hk_china'"
                  :key="it.value"
                  :label="it.label"
                  :value="it.value">
                </el-option>
              </el-select>
              <!-- <div v-if="isApproved">{{(renderNoEdit({payWay: item.payWay}, {prop: 'payWay', type: 'select'}))}}</div> -->
            </el-form-item>
            <el-form-item v-if="item.payWay==='hk_china'" :label="$t('Settle.feeDeductWay')" prop="transferFeeDeductWay" :rules="{ required: true, message: ' ', trigger: 'change' }" style="margin-left:10px;" >
              <el-select v-model="item.transferFeeDeductWay" :placeholder="$t('Common.plSelect')"
              >
                <el-option
                  v-for="it in dictMap['transferFeeDeductWay']"
                  :key="it.value"
                  :label="it.label"
                  :value="it.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="isApproved" :label="$t('Settle.payWay')" prop="payWay">
              <el-input	:value="renderNoEdit({payWay: item.payWay}, {prop: 'payWay', type: 'select'})" disabled	:placeholder="$t('Common.plEnter')"></el-input>
            </el-form-item>
            <!-- <el-form-item v-if="!isApproved" :label="$t('Settle.settleMode')" prop="settleMode"  :rules="{ required: true, message: ' ', trigger: 'change' }" >
              <el-select v-model="item.settleMode" clearable :placeholder="$t('Common.plSelect')">
                <el-option
                  v-for="item in dictMap['bankAccountSettleMode']"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item> -->
            <!-- <el-form-item v-if="isApproved" :label="$t('Settle.settleMode')" prop="settleMode">
              <el-input	:value="renderNoEdit({payWay: item.bankAccountSettleMode}, {prop: 'settleMode', type: 'select'})" disabled	:placeholder="$t('Common.plEnter')"></el-input>
            </el-form-item> -->
            <el-form-item  v-show="item.payWay === 'prepay_dedue'" :label="$t('Settle.prepaySum')" prop="prepaySum">
              <el-input	v-model="item.prepaySum" disabled	placeholder=""></el-input>
            </el-form-item>
            <el-form-item v-if="item.hasCustSpecialFee == 'yes' && !applyNo"  :label="$t('Settle.bearer')" prop="specialDeductRechtstraeger"  :rules="{ required: true, message: ' ', trigger: 'change' }" >
              <el-select :disabled='applyNo' v-model="item.specialDeductRechtstraeger" clearable :placeholder="$t('Common.plSelect')">
                <el-option
                  v-for="item in dictMap['specialDeductRechtstraeger']"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="applyNo && item.specialDeductRechtstraeger"  :label="$t('Settle.bearer')" prop="specialDeductRechtstraeger"  >
              <el-select disabled v-model="item.specialDeductRechtstraeger" clearable :placeholder="$t('Common.plSelect')">
                <el-option
                  v-for="item in dictMap['specialDeductRechtstraeger']"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="isApproved && item.settleMode" :label="$t('Settle.settleMode')" prop="settleMode">
              <el-input	:value="dictMapObj.bankAccountSettleMode[item.settleMode]" disabled	:placeholder="$t('Common.plEnter')"></el-input>
            </el-form-item>
            <el-form-item v-if="item.hasCustSpecialFee==='yes' && item.hasThirdPayChannelCode" :label="$t('Settle.channelCode')" prop="thirdPayChannelCode">
              <el-input	:value="item.thirdPayChannelCode" disabled	:placeholder="$t('Common.plEnter')"></el-input>
            </el-form-item>
            <el-form-item v-if="item.hasCustSpecialFee==='yes' && !item.hasThirdPayChannelCode" :label="$t('Settle.channelCode')"    prop="thirdPayChannelCode" :rules="{ required: true, message: ' ', trigger: 'change' }">
              <el-select v-model="item.thirdPayChannelCode" :placeholder="$t('Common.plSelect')"
                @change="payChannelCodeChange"
              >
                <el-option
                  v-for="it in payChannelCodes.filter(obj=>obj.currency===item.currency)"
                  :key="it.thirdPayChannelCode"
                  :label="it.thirdPayChannelCode+'('+it.currency+', '+it.limitedAmount+')'"
                  :value="it.thirdPayChannelCode">
                </el-option>
              </el-select>
            </el-form-item>
            <!-- <DetailDiv v-if="isApproved"  label="付款方式：" :content="(renderNoEdit({payWay: item.payWay}, {prop: 'payWay', type: 'select'}))"/>
            <DetailDiv v-show="item.payWay === 'prepay_dedue'"  label="预付款余额：" :content="item.prepaySum"/>
            <DetailDiv label="是否后补票：" :content="dictMapObj.yesNo[item.delayInvoice]"/>
            <DetailDiv label="后补票金额：" :content="decimalFixed2(item.delayInvoiceAmt)"/><br/> -->
            <!-- <div v-if="applyNo" style="display: block;">
              <el-form-item v-show="!isApproved && item.payWay !== 'intrabranch'" label="代大掌柜付款：" prop="internalFeeCode" :rules="{ required: item.payWay !== 'intrabranch' && (item.dzgFeeTaxRate !=='' || item.dzgFeeAmt !== '' || item.dzgPayBillNo !== '' || item.internalFeeCode !==''), message: ' ', trigger: 'blur' }">
                <el-select v-model="item.internalFeeCode" @change="internalFeeChange(item,index)" clearable :placeholder="$t('Common.plSelect')">
                  <el-option
                    v-for="it in dictMap['dzgCompCode']"
                    :key="it.value"
                    :label="it.label"
                    :value="it.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item v-show="!isApproved && item.payWay !== 'intrabranch'" label="代付大掌柜金额：" prop="dzgFeeAmt" :rules="{ required: item.payWay !== 'intrabranch' && (item.dzgFeeTaxRate !=='' || item.dzgFeeAmt !== '' || item.dzgPayBillNo !== '' || item.internalFeeCode !==''), message: ' ', trigger: 'change' }" >
                <el-input v-lsNumber="{value:'number', obj:item, key:'dzgFeeAmt'}"	v-model="item.dzgFeeAmt" @change="internalFeeChange(item,index)" @input="dzgFeeAmtChange(item)" maxlength="16"	:placeholder="$t('Common.plEnter')"></el-input>
              </el-form-item>
              <el-form-item v-show="!isApproved &&  item.payWay !== 'intrabranch'" label="大掌柜付款单号：" prop="dzgPayBillNo" :rules="{ required: item.payWay !== 'intrabranch' && (item.dzgFeeTaxRate !=='' || item.dzgFeeAmt !== '' || item.dzgPayBillNo !== '' || item.internalFeeCode !==''), message: ' ', trigger: 'change' }" >
                <el-input	v-model="item.dzgPayBillNo" @change="internalFeeChange(item,index)"	:placeholder="$t('Common.plEnter')"></el-input>
              </el-form-item>
              <el-form-item v-show="!isApproved && item.payWay !== 'intrabranch'" label="税率：" prop="dzgFeeTaxRate" :rules="{ required: item.payWay !== 'intrabranch' && (item.dzgFeeTaxRate !=='' || item.dzgFeeAmt !== '' || item.dzgPayBillNo !== '' || item.internalFeeCode !==''), message: ' ', trigger: 'blur' }" >
                <el-select v-model="item.dzgFeeTaxRate" @change="internalFeeChange(item,index)" clearable :placeholder="$t('Common.plSelect')" >
                  <el-option
                  v-for="(op, j) in dictMap.taxRateInfo"
                  :key="'currency' + j"
                  :label="op.label"
                  :value="+op.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </div> -->
        </el-form>
      </div>
      <FinanceTableMass
        :option="item.option0"
        v-show="item.showTable1 && item.payWay !== 'prepay_dedue'"
        @send-multi="sendMulti"/>
      <!-- 预付款移到付款单核销页面，本页面不显示预付款列表和预付款的发票列表 -->
      <!-- <FinanceTableMass
        :option="item.option8"
        v-show="false"
        @send-multi="sendMulti"/> -->
        <!-- v-show="item.showTable1 && applyNo && item.payWay === 'prepay_dedue'" -->
      <!-- 海外版不显示发票信息-20230105
      <FinanceTableMass
        :option="item.option1"
        v-show="item.showTable1"
        @send-multi="sendMulti"/> -->
    </div>
    <!-- 代大掌柜付款 -->
    <!-- <div v-if="applyNo" class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title size-12">{{$t('Settle.daZhangGui')}}</div>
        </div>
        <div class="money-box-right">
          <el-button v-if="checkAuth($route.name, 'btn-handleInternalFee') && (applyNo) && (!isApproved && payInfoList[0].payWay !== 'intrabranch')" class="finance-btn" @click="handleInternalFee" size="mini">{{$t('Settle.payDZG')}}</el-button>
        </div>
      </div>
      <FinanceTableMass
        :option="option6"
        @send-multi="sendMulti"/>
    </div> -->
    <div v-if="payApplyDetailForm.confirmStatus === 'pass'" class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title size-12">{{$t('Settle.transferInfo')}}</div>
        </div>
        <div class="money-box-right">
        </div>
      </div>
      <FinanceTableMass
        :option="option4"
        @send-multi="sendMulti"/>
    </div>
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title size-12">{{$t('FeeList.expensesList')}}</div>
          <div class="money-total" style="margin-right: 5px;">
            <!-- class="money-title-1" -->
            {{$t('Settle.settlementSum')}}: 
          </div>
          <div class="money-total" v-for="(item, index) in originalGather" :key="'originalGather' + index">
            {{item.currency}}
            <!-- <span>
              <span> -->
                <!-- <span> -->
                    <!-- style="margin-right:12px" -->
                  <span>{{decimalFixed2(item.amt)}}</span>
                <!-- </span> -->
              <!-- </span>
            </span> -->
          </div>
        </div>
        <div class="money-box-right">
              <el-button
                style="line-height: 12px;"
                @click="feeSearchToggle = !feeSearchToggle"
                size="mini"
                type="primary"
              >{{feeSearchToggle ?$t('Common.hideSearch') : $t('Common.showSearch')}}</el-button>
        </div>
      </div>
      <DetailFeeSearch v-show="feeSearchToggle" ref="detailFeeSearch" :list="option3.data" :keyObj="{currency:'originalCurrency'}" @search="detailFeeSearch" />
      <FinanceTableMass
        :option="option3"
        @send-multi="sendMulti"/>
    </div>
    <el-dialog
      :title="$t('Settle.relevance')"
      :visible.sync="relevanceOpne"
      :before-close="handleCancel"
      class="relevance-invoice"
      width="1200px">
      <FinanceSearch
        :searchOption="searchOption1"
        @search="searchInvoice"/>
      <FinanceTableMass
        :option="option2"
        @send-multi="sendMulti"/>
        <!-- <ClipboardUploadEmbed
          @send-res-file-list="sendResFileList" />
          实验剪贴板 -->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" :loading='loadingRelationInvoice' @click="relevanceConfirm" size="mini">{{$t('FeeList.sure')}}</el-button>
        <el-button @click="handleCancel" size="mini">{{$t('FeeList.close')}}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="$t('Settle.advance')"
      :visible.sync="relevancePrepayDialogShow"
      :before-close="handleCancel"
      class="relevance-invoice"
      width="1000px">
      <!-- <FinanceSearch
        :searchOption="searchOption1"
        @search="searchInvoice"/> -->
      <FinanceTableMass
        :option="option5"
        @send-multi="sendMulti"/>
        <!-- <ClipboardUploadEmbed
          @send-res-file-list="sendResFileList" />
          实验剪贴板 -->
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="relevancePrepayConfirm" size="mini">{{$t('FeeList.sure')}}</el-button>
        <el-button @click="handleCancel" size="mini">{{$t('FeeList.close')}}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="$t('Settle.refuseApproval')"
      :visible.sync="refuseDialogShow"
      :before-close="handleCancel"
      class="relevance-invoice"
      width="600px">
      <el-form :inline="false" label-width="80px" ref="refuseForm" :model="refuseForm" label-suffix=':'> 
        <el-form-item prop="refuseReason" :label="$t('Settle.reject')" class="el-form-item-payapply-remark" :rules="[{required: true, message: ' ', trigger: 'blur'}]" >
          <el-input
            v-model="refuseForm.refuseReason"
            type="textarea"
            :placeholder="$t('Settle.refuseReason')"
            maxlength="200"
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="refuseBefore" size="mini">{{$t('FeeList.sure')}}</el-button>
        <el-button @click="handleCancel" size="mini">{{$t('FeeList.close')}}</el-button>
      </span>
    </el-dialog>
    
    <el-dialog
      :title="$t('Settle.payDZG')"
      :visible.sync="internalFeeData.show"
      :before-close="handleInternalFeeCancel"
      width="850px">
      <el-form :model="internalFeeData" ref="internalFeeData" :inline="true" label-width="110px" label-suffix=':'> 
        <div v-for="(item,index) in internalFeeData.list" :key="index">
          <div
            class="finance-table-container" style="margin:0 0 8px"
          >
            <div class="money-box" style="padding:4px;margin-bottom:8px">
              <div class="money-box-left">
                <div class="money-title size-12">{{$t('Settle.payDZG')}}{{index+1}}</div>
              </div>
              <div class="money-box-right">
                <el-button
                  v-if="index !== 0"
                  type="danger"
                  size="mini"
                  @click="handleDeleteInternalFee(index)"
                >{{$t('Common.del')}}</el-button>
                <!-- <el-button
                  type="text"
                  class="collapse-btn"
                  size="mini"
                >
                  {{ item.show ? $t('Common.collapse') : $t('Common.expand')}}
                  <i :class="item.show ? `el-icon-arrow-up` : `el-icon-arrow-down`"></i>
                </el-button> -->
              </div>
            </div>
            <el-form-item :label="$t('Settle.payDZG')" :prop="`list[${index}].internalFeeCode`" :rules="{ required: true, message: ' ', trigger: 'blur' }">
              <el-select v-model="item.internalFeeCode" clearable :placeholder="$t('Common.plSelect')">
                <el-option
                  v-for="it in dictMap['dzgCompCode']"
                  :key="it.value"
                  :label="it.label"
                  :value="it.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('Settle.dzgFeeAmt')" :prop="`list[${index}].dzgFeeAmt`" :rules="{ required: true, message: ' ', trigger: 'blur' }" >
              <el-input 
               v-lsNumber="{value:'number', form:internalFeeData,listStr:'list',rowIndex:index, key:'dzgFeeAmt', vm}"
              v-model="item.dzgFeeAmt" @input="dzgFeeAmtChange" maxlength="16"	:placeholder="$t('Common.plEnter')"></el-input>
            </el-form-item>
            <el-form-item :label="$t('Settle.dzgPayBillNo')" :prop="`list[${index}].dzgPayBillNo`" :rules="{ required: true, message: ' ', trigger: 'blur' }" >
              <el-input	v-model.trim="item.dzgPayBillNo" 	:placeholder="$t('Common.plEnter')"  ></el-input>
            </el-form-item>
            <el-form-item :label="$t('FeeList.taxRate')" :prop="`list[${index}].dzgFeeTaxRate`"  :rules="{ required: true, message: ' ', trigger: 'blur' }" >
              <el-select v-model="item.dzgFeeTaxRate" clearable :placeholder="$t('Common.plSelect')" >
                <el-option
                v-for="(op, j) in dictMap.taxRateInfo"
                :key="'currency' + j"
                :label="op.label"
                :value="+op.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>
      </el-form>
       <el-button size="mini" @click="handleAddInternalFee" style="width:100%;border: 1px dashed;" > <i class="el-icon-plus"></i>{{$t('Settle.addDzgAmt')}}</el-button>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" :loading='loadingInternalFeeSubmit' @click="internalFeeSubmit" size="mini">{{$t('FeeList.sure')}}</el-button>
        <el-button @click="handleInternalFeeCancel" size="mini">{{$t('FeeList.cancel')}}</el-button>
      </span>
    </el-dialog>
    <ApplyForPass v-if="resultDialogOption.show" :option="resultDialogOption" @close="applyForPassOptionClose" @sure="sure">
      <div slot="descript">
        <el-form class="pass_dialog_form" :model="recvData" ref="recvData" :inline='true' size="mini" label-width="150px" label-suffix=':'>
          <el-form-item :label="$t('Settle.recvCorpName')">
            <el-input disabled v-model="recvData.recvCorpName" ></el-input>
          </el-form-item>
          <el-form-item :label="$t('Settle.payWay')" >
            <el-input disabled :value="renderNoEdit({payWay: payInfoList && payInfoList.length && payInfoList[0].payWay ? payInfoList[0].payWay : ''}, {prop: 'payWay', type: 'select'})"></el-input>
            <!-- <el-select disabled  v-model="recvData.payWay" style="width:100%">
              <el-option  v-for="it in dictMap['payWay']"  :key="it.value" :label="it.label" :value="it.value"></el-option>
            </el-select> -->
          </el-form-item>
          <el-form-item :label="$t('Settle.recvAccountNo')" prop="recvAccountNo" :rules="{ required: true, message: ' ', trigger: 'blur' }" v-if="recvData.payWay !== 'prepay_dedue'">
            <el-select disabled v-model="recvData.recvAccountNo" filterable remote :remote-method="bankAccountList" @change="recvAccountNoChange" :placeholder="$t('Common.plSelect')" style="width:100%">
              <el-option  v-for="it in recvAccountNoList || []"  :key="it.value" :label="it.label" :value="it.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('Settle.recvBankName')" v-show="recvData.payWay !== 'prepay_dedue'">
            <el-input disabled v-model="recvData.recvBankName" ></el-input>
          </el-form-item>
          <el-form-item :label="$t('Settle.recvAccountName')" v-show="recvData.payWay !== 'prepay_dedue'">
            <el-input disabled v-model="recvData.recvAccountName" ></el-input>
          </el-form-item>
          <el-form-item :label="$t('Settle.swiftCode')" v-show="recvData.payWay !== 'prepay_dedue'">
            <el-input disabled v-model="recvData.recvSwiftCode" ></el-input>
          </el-form-item>
          <el-form-item class="form_full" :label="$t('Settle.recvRegAddr')" v-show="recvData.payWay !== 'prepay_dedue'">
            <el-input disabled v-model="recvData.recvRegAddr" type="textarea"></el-input>
          </el-form-item>
          <el-form-item class="form_full" :label="$t('PayApplyList.approvalRemark')" prop="" >
            <el-input autosize v-model="payApplyDetailForm.auditOpinion" show-word-limit maxlength="500" type="textarea" ></el-input>
          </el-form-item>
        </el-form>
      </div>
    </ApplyForPass>
  </div>
</div>
</template>
<script>
import DetailFeeSearch from '@/views/finance/components/financeSearch/detailFeeSearch'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import ClipboardUpload from '@/views/finance/components/financeUpload/clipboardUpload'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { mapGetters } from 'vuex'
import ApplyForPass from '@/views/finance/pay/settle/components/applyForPass'
import { decimalFixed2, dateFormat } from '@/views/finance/utils/finance'
import { queryPayApplySettle, savePayApplySettle, queryPayApplySettleInfo, approvePayApplySettle, queryUsablePrepayDedueList, deleteRelationInvoice, payInfoRelationInvoice, queryUsablePrepayDedueInvoiceList, settleDelayInvoice, cancelPayApplySettle, settleWithdrawPayApplyAudit,
 saveDzgInternalFee, deleteDzgInternalFee, getIdNoThirdChannelCode } from '@/api/fin/pay' // queryPayApplyInfoForSettle
import PREPAY from '@/api/fin/prepayAccount'
import { usableList } from '@/api/fin/invoicePayment'
// import { bankAccountList } from '@/api/fin/settleUnit'
import { queryAllBankAccountList } from '@/api/fin/settleUnitBankAcct'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { randomString } from '@/utils'
import { limitList } from '@/api/fin/channelCodeLimit'
// import ClipboardUploadEmbed from '@/views/finance/components/financeUpload/clipboardUploadEmbed'

export default {
  mixins: [mixin,mixin2,routerMixin],
  data() {
    return{
      feeSearchToggle: false, //费用搜索默认显示
      loadingInternalFeeSubmit: false,
      loadingRelationInvoice: false,
      vm: this,
      req: randomString() + 'settlementPayApply',
      recvAccountNoList:[],
      resultDialogOption: {
				show: false,
				title: this.$t('Settle.approved'),
        text: this.$t('Settle.adopt'),
        btnType:"success",
				text_cancel: this.$t('FeeList.cancel'),
        titleText: '',
        width: '920px', // '700px',
			},
      internalFeeData:{
        show:false,
        list:[
          {
            show:true,
            applyNo:'',
            dzgPayBillNo:"",
            internalFeeCode:"",
            dzgFeeTaxRate:"",
            dzgFeeAmt:"",
          }
        ]
      },
      recvData:{
        recvCorpName:"",
        recvAccountNo:"",
        ecvBankName:"",
        recvAccountName:"",
        recvSwiftCode:"",
        recvRegAddr:"",
        payInfoId:''
      },
      invoicePaymentList:[],
      index:"",
      option2: {}, // 关联发票弹窗
      option3: { data:[] }, // 费用列表
      option4: {}, // 转账信息
      option5: {}, // 关联预付款弹窗
      option6:{},//代大掌柜付款
      multipleSelection2: [],
      multipleSelection5: [],
      settlementDetailForm: {
      },
      searchWords: '',
      financePageMargin: '',
      currencyAddOriginal: [],
      exchageRateList: [], // 接口返回的当日结算汇率列表
      settleExchageRateList: [], // 结算需要用到的汇率列表
      timer1: null,
      timer2: null,
      settlementRateEditDisabled: false, // 自定义结算汇率是否可用
      invoicePaymentId: -1,
      watchOption1DataTime: 0,
      watchFormExchangeRatesTime: 0,
      rules: {
        recvCorpCode: [{ required: true, message: ' ', trigger: 'blur' }],
        // latestDate: [{ required: true, message: ' ', trigger: 'blur' }]
      },
      payWayRules: {
        payWay: [{ required: true, message: '', trigger: 'blur' }],
        settleMode: [{ required: true, message: '', trigger: 'blur' }]
      },
      payApplyDetailForm: {
        "earliestDate":"",
        "recvFinishsProveFileNo":"",
        "latestDate":"",
        "hasInvoice":"",
        "delayInvoice":"",
        "remark":"",
        "settleCompCode":"",
        "settleCompName":"",
        "applyPayAmountSumByCurrency": '',
        "currency": '',
        "settleCycle": '',
        "orderNo": '',
        "orderReciSumAmt": '',
        "orderReciWriteOffAmt": '',
        "orderReciNoWriteOffAmt": '',
        "prepaySum": '',
        "recvCorpCode": "",
        "recvCorpName": "",
        "payInfoInvoices": [],
        "applyNo": '',
        "settleOrderNo": '',
        "sysLineName": '',
        "recvWriteoffStatus": '',
        "putStatus": '',
        "createdName": '',
        "createdTime": '',
        "confirmStatus": '',
        "confirmName": '',
        "confirmTime": '',
        "refuseReason":'',
        "remark": '',
        "auditOpinion": '',
        "hasCustBlack": '',
        "hasSupplierBlack": '',
      },
      settleUnitList: [],
      settleOrderId: -1,
      settleOrderIds: [],
      relevanceOpne: false,
      searchOption1:{
        columns: [
          // {
          //   label: this.$t('Settle.invoiceNo'),
          //   prop: 'invoiceNo',
          //   type: 'input'
          // },
          // {
          //   label: this.$t('Settle.invoiceType'),
          //   prop: 'invoiceType',
          //   type: 'select'
          // },
          // {
          //   label: this.$t('Settle.invoiceCur'),
          //   prop: 'currency',
          //   type: 'select',
          //   propInDict:"validCurrency",
          //   disabled: true
          // },
          {
            label: this.$t('FeeList.settleCorp'),
            prop: 'supplierCorpName', // 加上显示，但不用
            type: 'input',
            disabled: true
          }
        ],
        data: {
          recvCorpName: '',
          invoiceType: '',
          invoiceNo: '',
          currency: ''
        },
      },
      currentRow: '',
      cTimestamp: new Date().getTime(),
      bankAccountSelectOptions1:[],
      bankAccountSelectOptions2:[],
      originalGather:[], // 结算汇总
      showTable1: true,
      payInfoList: [],
      payInfo: {},
      payInfoId: '',
      payCurrency: '',
      compAcountColumns: [],
      option0ColumnsInit: [],
      applyNo: '',
      settleOrderNo: '',
      confirmStatus: '',
      refuseDialogShow: false,
      refuseForm:{refuseReason: ''},
      payOrder: null,
      relevancePrepayDialogShow: false,
      loading: false,
      payChannelCodes: [],
      payChannelCodeInfo: null,
      optionCheck: {}
    }
  },
  components: {
    DetailFeeSearch,
    FinanceTableMass,
    FinanceSearch,
    ApplyForPass,
    ClipboardUpload
    // ClipboardUploadEmbed
  },
  created() {
    // this.select1= {
    //   change: (value, item, row) => {
    //     let obj = item.remoteSelectList.find(item => { // this.bankAccountSelectOptions1
    //       return item.settleUnitBankAcctId === value
    //     })
    //     if (obj) {
    //       row.payAccountShortName = obj.accountShortName
    //       row.payBankName = obj.bankName
    //       row.payAccountNo = obj.accountNo
    //       row.payAccountName = obj.accountName
    //       row.payCompName = obj.unitName
    //       row.payBankBranch = obj.bankBranch
    //       row.payBankCode = obj.bankCode
    //       row.payBankAccountId = obj.settleUnitBankAcctId
    //     }
    //   }
    // }
    this.columns0 = [
      {prop: 'recvCorpName', label: this.$t('FeeList.settleCorp'), type: 'text'},
      // {
      //   prop: 'payAccountShortName',
      //   label: this.$t('PayApplyList.payAccountShortName'),
      //   type: 'select',
      //   placeholder: '请选择付款银行简称',
      //   required: true,
      //   remote: true,
      //   remoteMethod: (queryString, item, row) => {this.bankAccountList1(queryString, item, row, index)},
      //   visibleChange: (value, item, row) => {this.bankAccountList1(value, item, row, index)},
      //   change: (value, item, row) => {this.select1.change(value, item, row);row.isRequiredNull = false;},
      //   remoteSelectList: []
      // },
      // {prop: 'payBankName', label: this.$t('PayApplyList.payBankName'), type: 'text'},
      // {prop: 'payAccountName', label: '付款账户名', type: 'text'},
      // {prop: 'payAccountNo', label: this.$t('PayApplyList.payAccountNo'),  type: 'text'},
      {
        prop: 'recvAccountNo',
        label: this.$t('Settle.recvAccountNo'),
        type: 'select',
        placeholder: this.$t('Common.plSelect'),
        required: true,
        remote: true,
        remoteMethod: (queryString, item, row, index) => {this.bankAccountList2(queryString, item, row, index)},
        visibleChange: (value, item, row, index) => {this.bankAccountList2(value, item, row, index)},
        change: (value, item, row, option) => {this.select2.change(value, item, row, option);row.isRequiredNull = false;},
        remoteSelectList: []
      },
      {prop: 'recvAccountPublicType', label: this.$t('Settle.accountType'), type: 'text', formatter: ({ cellValue }) => { return cellValue === 'pub' ? this.$t('Settle.pub') : cellValue === 'prv' ? this.$t('Settle.prv') : cellValue }},
      {prop: 'recvBankName', label: this.$t('Settle.recvBankName'), type: 'text'},
      {prop: 'recvBankBranch', label: this.$t('Settle.recvBankBranch'), type: 'text'},
      {prop: 'recvAccountName', label: this.$t('Settle.recvAccountName'), type: 'text'},
    ]
    this.select2 = {
      change: (value, item, row, option) => {
        let obj = item.remoteSelectList.find(item => { // this.bankAccountSelectOptions2
          return item.settleUnitBankAcctId === value
        })
        console.log(obj);
        if (obj) {
          row.recvBankName = obj.bankName
          row.recvBankBranch = obj.bankBranch
          row.recvAccountNo = obj.accountNo
          row.recvAccountName = obj.accountName
          row.compBankAccountId = obj.settleUnitBankAcctId
          row.recvBankAccountId = obj.settleUnitBankAcctId
          row.recvBankAddr = obj.bankAddr
          row.recvRegAddr = obj.regAddr
          row.recvSwiftCode = obj.swiftCode
          row.recvAccountPublicType = obj.publicType
          row.recvIdNo = obj.idNo
          row.recvMobileNo = obj.mobileNo
        }
        // 处理recvRegAddr等三个字段不更新
        if (option) {
          let index = option.data.findIndex(item => item === row)
          this.$set(option.data, index, { ...row })
        }
        if (option && option.id === 'option0') {
          let payInfoIndex = option.payInfoIndex ? option.payInfoIndex : 0
          let payInfo = this.payInfoList[payInfoIndex]
          if (payInfo.hasCustSpecialFee === 'yes') {
            if (row.recvAccountPublicType === 'prv') {
              if (!payInfo.option0.columns.some(item => item.prop === 'recvIdNo')) {
                payInfo.option0.columns = payInfo.option0.columns.concat([
                  {prop: 'recvIdNo', label: this.$t('Settle.recvIdNo'), type: 'text', required: true},
                  {prop: 'recvMobileNo', label: this.$t('Settle.recvMobileNo'), type: 'text', required: true}
                ])
              }
              // payInfo.option0.columns = [
              //   ...this.columns0,
              //   {prop: 'recvIdNo', label: '身份证号', type: 'text', required: true},
              //   {prop: 'recvMobileNo', label: '手机号', type: 'text', required: true}
              // ]
            } else {
              // payInfo.option0.columns = [...this.columns0]
              let i1 = payInfo.option0.columns.findIndex(item => item.prop === 'recvIdNo')
              if (i1 > -1) {
                payInfo.option0.columns.splice(i1, 1)
              }
              let i2 = payInfo.option0.columns.findIndex(item => item.prop === 'recvMobileNo')
              if (i2 > -1) {
                payInfo.option0.columns.splice(i2, 1)
              }
            }
            // 通过证件号码获取当月应使用的标识码
            if (row.recvIdNo) {
              let data = {
                idNo: row.recvIdNo
              }
              getIdNoThirdChannelCode(data).then(res => {
                let thirdPayChannelCode = res.data && res.data.thirdPayChannelCode
                if (thirdPayChannelCode) {
                  payInfo.hasThirdPayChannelCode = true
                  payInfo.thirdPayChannelCode = thirdPayChannelCode
                } else {
                  payInfo.hasThirdPayChannelCode = false
                }
              })
            }
          }
        }
      }
    }
    // this.select3 = {
      // change: (value, currency, payCorpCode, obj) => {
      //   let payWay = value
      //   let hasIntrabranch = ''
      //   if(payWay === 'intrabranch'){
      //     hasIntrabranch ='yes'  
      //   }
      //   if(payWay === 'cash' || payWay === 'prepay_dedue' || payWay === 'intrabranch'){
      //     payWay = ""
      //   }
        // this.$store.dispatch('dict/bankAccountList', {"currency":currency, hasIntrabranch, "receipayType":"pay", "unitCode":payCorpCode,"countryOrgType":payWay}  ).then(res => {
        //   let payBank = res && res.length ? {
        //     payAccountShortName : res[0].accountShortName,
        //     payBankName : res[0].bankName,
        //     payAccountNo : res[0].accountNo,
        //     payAccountName : res[0].accountName,
        //     payCompName : res[0].unitName,
        //     payBankBranch : res[0].bankBranch,
        //     payBankCode : res[0].bankCode,
        //     payBankAccountId : res[0].settleUnitBankAcctId,
        //   } : {
        //     payAccountShortName : "",
        //     payBankName : "",
        //     payAccountNo : "",
        //     payAccountName : "",
        //     payCompName : "",
        //     payBankBranch : "",
        //     payBankCode :"",
        //     payBankAccountId :"",
        //   }
        //   Object.assign(obj,{},payBank)
        // })
    //   }
    // }
    this.init()
    let operationBtns = Object.assign(this.option.operationBtns, {
      data: [
        {
          label: this.$t('Common.del'),
          type: 'text',
          show: true,
          action: 'Delete'
        }
      ],
      show: true
    })
    // 关联发票弹窗
     const listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
    this.option2 = Object.assign({}, this.option, {
      id: 'option2', $name: 'SettlementPayApply2',
      data: [],
      tips: {
        text: '',
        show: false
      },
      listAmtSummary,
      operationBtns:{
        show:false
      }
    })
    let columns2 = [
      // {prop: 'invoiceNo', label: this.$t('FeeList.invoiceNo'), key: 'invoiceNo', width:125,
      //   type: 'button',
      //   width: 118,
      //   operationBtns: {
      //     show: true,
      //     callback: (fn, index, row) => {
      //       let query = {
      //         invoicePaymentId:row.invoicePaymentId,
      //         invoiceNo: row.invoiceNo
      //       }
      //       this.routerPush('InvoicePaymentListDetail', query)
      //     }
      //   }
      // },
      // {prop: 'invoiceType', label: this.$t('Settle.invoiceType'), type: 'select', key: 'invoiceType',propInDict:"invoiceType", width: 120},
      // {prop: 'title', label: this.$t('Settle.invoiceTitle'), type: 'text', key: 'title', width: 130},
      // {prop: 'amt', label: this.$t('Settle.invoiceAmt'), type: 'text', key: 'amt'},
      // {prop: 'currency', label: this.$t('Settle.invoiceCur'), type: 'text', key: 'currency'},
      // {prop: 'rate', label:  this.$t('Settle.invoiceRate'), type: 'text', key: 'rate'},
      {prop: 'writeoffAmt', label: this.$t('OrderFee.totalWriteoffAmt'), type: 'text', key: 'writeoffAmt'},
      {prop: 'lockAmt', label: this.$t('Settle.lockAmt'), type: 'text', key: 'lockAmt'},
      {prop: 'remainingAmount', label: this.$t('Settle.remainingAmount'), type: 'text', key: 'remainingAmount', width: 125,
        formatter: ({row}) => {
          return decimalFixed2(row.amt - row.writeoffAmt - row.lockAmt)
        }
      },
      // {prop: 'taxRate', label: this.$t('Settle.taxRate'), type: 'select', key: 'taxRate',propInDict:'taxRateInfo'},
      {prop: 'taxAmt', label: this.$t('FeeList.taxAmt'), type: 'text', key: 'taxAmt'},
      {prop: 'createdName', label: this.$t('Settle.createdName'), type: 'text', key: 'createdName'},
      {prop: 'createdTime', label: this.$t('Settle.createdTime'), type: 'text', key: 'createdTime', width: 125},
    ]
    this.option2.columns = columns2

    // 费用列表
    this.option3 = Object.assign({}, this.option, {
      id: 'option3', $name: 'SettlementPayApply3',
      data: [],
      tips: {
        text: '',
        show: false
      },
      selection: {
        show: false,
      },
      index: {
        show: true,
        title: this.$t('Common.index')
      },
      sortable: true,
      sortChange: this.sortChange,
      operationBtns: {
        show: false
      },
    })
    let columns3 = [
        {
          prop: 'sourceBizNo', //orderNo
          label: this.$t('FeeList.orderNo'), // 另：可通过sourceType判断，为order时为订单号，否则为费用单号（手续费归为费用单大类）
          type: 'button',
          width: 120,
          operationBtns: {
            show: true,
            callback: (action, index, row, option) => {
              let sourceType = row.sourceType
              let sourceBizNo = row.sourceBizNo // row.orderNo
              sourceType = sourceType ? sourceType : 'order'
              this.showOneNoDetail(sourceType, sourceBizNo)
            }
          }
        },
        {
          prop: 'settleCompName',
          label: this.$t('FeeList.settleComp'),
          type: 'text',
          width:150
        },
        {
          prop: 'settleCorpName',
          label: this.$t('FeeList.settleCorp'),
          width:150,
          type: 'text'
        },
        {
          prop: 'settleOrderNo',
          label: this.$t('FeeList.settleOrderNo'),
          type: 'button',
          width: 125,
          operationBtns: {
            show: true,
            callback: (action, index, row, option) => {
              this.showOneNoDetail('settleOrderNo', row.settleOrderNo)
            }
          }
        },
        {
          prop: 'mbl',
          label: this.$t('FeeList.mbl'),
          type: 'text'
        },
        {
          prop: 'hbl',
          label: this.$t('FeeList.hbl'),
          type: 'text'
        },
        {
          prop: 'serviceName',
          label: this.$t('FeeList.serviceCodes'),
          type: 'text'
        },
        // {
        //   prop: 'feeName',
        //   label: this.$t('FeeList.feeName'),
        //   width:120,
        //   type: 'text'
        // },
        {
          prop: 'feeEnName',
          label: this.$t('FeeList.feeEname'),
          type: 'text',
          width: 128
        },
        {
          prop: 'receipayType',
          label: this.$t('Settle.receipayType'),
          type: 'select',
          formatter:({row})=>{
            const statusName = this.dictMapObj.receipayType[row.receipayType]
            if (row.receipayType === 'receive') {
              return '<span style="color:#CD4130">'+statusName+'</span>'
            } else if (row.receipayType === 'pay') {
              return '<span style="color:#33B18A">'+statusName+'</span>'
            } else {
              return statusName
            }
          }
        },
        {
          prop: 'feeAmt',
          label: this.$t('FeeList.feeAmt'),
          type: 'text'
        },
        {
          prop: 'originalCurrency',
          label: this.$t('FeeList.currency'),
          type: 'text'
        },
        {
          prop: 'canSettleAmt',
          label: this.$t('Settle.canSettleAmt'),
          type: 'text'
        },
        {
          prop: 'settleAmt',
          label: this.$t('Settle.settleAmt'),
          type: 'text',
          // validateInput: this.validateInput
        },
        {
          prop: 'settleCurrency',
          label: this.$t('Settle.settleCurrency'),
          type: 'text'
        },
        {
          prop: 'settleExRate',
          label: this.$t('Settle.settleExRate'),
          type: 'text'
        },
        {
          prop: 'exSettleAmt',
          label: this.$t('Settle.exSettleAmt'),
          type: 'text'
        },
        // { 
        //   prop: 'invoiceStatus',
        //   label: this.$t('Settle.invoiceStatus'),
        //   type: 'select',
        //   propInDict: 'feeInvoiceStatus' 
        // },
        {
          prop: 'finDate',
          label: this.$t('FeeList.financialDate'),
          type: 'text',
          width: 86
        },
      ]
      //付款申请页面不动，详情去掉可结算金额，增加付款金额。1021迭代
      if(this.applyNo){
        columns3.push({
          prop: 'applyPayAmt',
          label:  this.$t('PayApplyList.applyPayAmt'),
          type: 'text'
        })
        let list = []
        columns3.forEach(item=>{
          if(item.prop !== "canSettleAmt"){
            list.push(item)
          }
        })
        this.option3.columns = list
      }else{
        this.option3.columns = columns3
      }

    // 转账信息
    this.option4 = Object.assign({}, this.option, {
      id: 'option4', $name: 'SettlementPayApply4',
      data: [],
      tips: {
        text: '',
        show: false
      },
      selection: {
        show: false,
      },
      operationBtns: {
        show: false
      },
    })
    let columns4 = [
        { prop: 'currency', label: this.$t('Settle.paymentCurrency'), type: 'text' },
        { prop: 'payStatus', label: this.$t('Settle.payStatus'), type: 'select', propInDict:"payStatusType" },
        { prop: 'payOrderNo', label:  this.$t('Settle.payOrderNo'), width: 146,
          type: 'button',
          operationBtns: {
            show: true,
            callback: (fn, index, row) => {
              let query = {
                payOrderNo: row.payOrderNo 
              }
              this.routerPush('OrderDetails', query)
            }
          }
        },
        { prop: 'bankSeqNo', label: this.$t('FinBill.bankSerial'), type: 'text' },
        { prop: 'confirmName', label: this.$t('FinBill.payer'), type: 'text', width:100, },
        { prop: 'payTime', label: this.$t('FinBill.paymentDate'), type: 'text', width:125, },
      ]
    this.option4.columns = columns4

    // 关联预付款弹窗
    this.option5 = Object.assign({}, this.option, {
      id: 'option5', $name: 'SettlementPayApply5',
      data: [],
      tips: {
        text: '',
        show: false
      },
      selection: {
        show: true
      },
      operationBtns: {
        show: false
      },
    })
    let columns5 = [
      {prop: 'settleCompName', label: this.$t('Settle.branchCompany'), type: 'text', width:150},
      {prop: 'payOrderNo', label: this.$t('FeeList.payOrderNo'), type: 'select'},
      {prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', width:150},
      {prop: 'currency', label: this.$t('Settle.paymentCurrency'), type: 'text'},
      {prop: 'realpayAmt', label: this.$t('Settle.applyPayAmt'), type: 'text'}, // balance
      {prop: 'balance', label: this.$t('Settle.remainingAmount'), type: 'text', // remainingAmount
      },
    ]
    this.option5.columns = columns5
    
    let operationBtns6 = Object.assign(this.option.operationBtns, {
      data: [
        {
          label: this.$t('Common.del'),
          type: 'text',
          showFn: (row)=> this.applyNo && !this.isApproved,
          action: 'Delete'
        }
      ],
      show: true
    })
    // 转账信息
    this.option6 = Object.assign({}, this.option, {
      id: 'option6', $name: 'SettlementPayApply6',
      data: [],
      tips: {
        text: '',
        show: false
      },
      selection: {
        show: false,
      },
      operationBtns:operationBtns6
    })
    let columns6 = [
      { prop: 'internalFeeCode', label: this.$t('Settle.payDZG'), type: 'select', propInDict:'dzgCompCode'},
      { prop: 'dzgFeeAmt', label: this.$t('Settle.dzgFeeAmt'), type: 'text' },
      { prop: 'dzgPayBillNo', label: this.$t('Settle.dzgPayBillNo'), type: 'text' },
      { prop: 'dzgFeeTaxRate', label: this.$t('FeeList.taxRate'), type: 'select', propInDict:"taxRateInfo" },
    ]
    this.option6.columns = columns6

    // 审批信息
    this.optionCheck = Object.assign({}, this.option, {
      id: 'optionCheck',
      data: [],
      tips: {
        text: '',
        show: false
      },
      selection: {
        show: false,
      },
      operationBtns: false,
      columns: [
        { prop: 'approverName', label: this.$t('FinBill.approverName'), type: 'text' },
        { prop: 'approverDesc', label: this.$t('FinBill.approverDesc'), type: 'text' },
        { prop: 'approvalResult', label: this.$t('FinBill.approvalResult'), type: 'select', propInDict: 'auditStatus' },
        { prop: 'approveEndTime', label: this.$t('FinBill.approveEndTime'), type: 'text' },
        { prop: 'refuseReason', label: this.$t('FinBill.refuseReason'), type: 'text' },
        { prop: 'approvalComments', label: this.$t('Settle.approvalRemarks'), type: 'text' }
      ]
    })

    this.getData()

    this.currencyAddOriginal = [{label: this.$t('Settle.orignalCurrency'), value: 'original'}].concat(this.dictMap['currency'])
    this.getPayChannelCodes()
  },
  activated() {
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 800) {
      this.init()
      this.getData()
    }
    console.log('hasSessionInvoicePay: ', this.$route.query.hasSessionInvoicePay)
    if (this.$route.query.hasSessionInvoicePay) {
      let sessionInvoicePay = sessionStorage.getItem('sessionInvoicePay')
      if (sessionInvoicePay) {
        console.log(this.payInfo)
        sessionInvoicePay = JSON.parse(sessionInvoicePay)
        console.log(sessionInvoicePay)
        // let tempInvoiceData = [...this.payInfo.option1.data]
        this.relevanceConfirm(sessionInvoicePay)
      }
    }
    if(!this.applyNo){
      let data = JSON.parse(sessionStorage.getItem(this.req));
      console.log(data);
      if(data && data.length){
        for (let i = 0; i < data.length; i++) {
          this.payInfoList[this.index].option1.data.push(data[i])
        }
      }
      // 清除sessionStorage
      sessionStorage.removeItem(this.req)
    }else{
      if(this.$route.meta.isUseCache){
        this.getData()
      }
    }
  },
  // beforeRouteLeave(to, from, next) {
  //   from.meta.isUseCache = true
  //   to.meta.isUseCache = true
  //   next()
  // },
  methods: {
    init() {
      console.log('route.query:', this.$route.query)
      this.settleOrderId = this.$route.query.settleOrderId
      this.settleOrderIds = this.$route.query.settleOrderIds ? JSON.parse(this.$route.query.settleOrderIds) : this.$route.query.settleOrderIds
      this.applyNo = this.$route.query.applyNo
      this.settleOrderNo = this.$route.query.settleOrderNo // 暂不用
      this.confirmStatus = this.$route.query.confirmStatus // 暂不用
    },
    getData() {
      this.$refs.detailFeeSearch && this.$refs.detailFeeSearch.clearData()
      if (this.applyNo) {
        this.queryPayApplySettleInfo()
        return
      }
      let data = {
        settleOrderIds: this.settleOrderIds && this.settleOrderIds.length > 0 ? this.settleOrderIds : [this.settleOrderId]
      }
      this.loading = true
      queryPayApplySettle(data).then(res => {
        if (res.code === 0) {
          this.settleUnitList = res.data.settleUnitList
          this.payInfoList = res.data.payInfoList
          // let data = []
          // let list = []
          this.payInfoList.forEach((item, index) => {
            // item.payInfoInvoiceList = []
            // data.push(item)
            // item.payInfoInvoices.forEach(it=>{
            //   it.invoicePayment ? list.push(it.invoicePayment) : []
            // })
            let operationBtns = Object.assign(this.option.operationBtns, {
              data: [
                {
                  label: this.$t('Common.del'),
                  type: 'text',
                  show: true,
                  action: 'Delete'
                }
              ],
              show: true
            })
            item.option0 = Object.assign({}, this.option, {
              id: 'option0', $name: 'SettlementPayApply0',
              data: [],
              tips: {
                text: '',
                show: false
              },
              selection: {
                show: false
              },
              operationBtns: {
                show: false
              },
              edit: true,
              rootTipsHide:true,
              payInfoIndex: index
            })
            item.option0.columns = this.columns0
            let { recvCorpName, payCompName, recvAccountNo, recvBankAccountId, recvAccountPublicType, recvBankName, recvBankBranch, recvAccountName, currency, payCompCode, recvCorpCode, recvRegAddr, recvBankAddr, recvSwiftCode, recvIdNo, recvMobileNo, thirdPayChannelCode, thirdPayChannelLimitAmt, thirdPayChannelUsedAmt } = item
            let accountInfo = { recvCorpName, payCompName, recvAccountNo, recvBankAccountId, recvAccountPublicType, recvBankName, recvBankBranch, recvAccountName, currency, payCompCode, recvCorpCode, recvRegAddr, recvBankAddr, recvSwiftCode, recvIdNo, recvMobileNo }
            accountInfo.edit = true
            accountInfo.isRequiredNull = false
            item.option0.data = [accountInfo]
            item.showTable1 = true
            item.hasThirdPayChannelCode = thirdPayChannelCode ? true : false
            // 对私账号显示身份证号、手机号
            let row = accountInfo
            let payInfo = item
            if (payInfo.hasCustSpecialFee === 'yes') {
              if (row.recvAccountPublicType === 'prv') {
                payInfo.option0.columns = [
                  ...this.columns0,
                  {prop: 'recvIdNo', label: this.$t('Settle.recvIdNo'), type: 'text', required: true},
                  {prop: 'recvMobileNo', label: this.$t('Settle.recvMobileNo'), type: 'text', required: true}
                ]
              } else {
                payInfo.option0.columns = [...this.columns0]
              }
            }
            
            item.option1 = Object.assign({}, this.option, {
              id: 'option1', $name: 'SettlementPayApply1',
              data: [],
              tips: {
                text: '',
                show: false
              },
              index: {
                show: true,
                title:this.$t('Common.index')
              },
              selection: {
                show: false
              },
              operationBtns
            })
            let columns1 = [
              // {prop: 'invoiceNo', label: this.$t('FeeList.invoiceNo'), key: 'invoiceNo', width:125,
              //   type: 'button',
              //   width: 118,
              //   operationBtns: {
              //     show: true,
              //     callback: (fn, index, row) => {
              //       let query = {
              //         invoicePaymentId:row.invoicePaymentId,
              //         invoiceNo: row.invoiceNo
              //       }
              //       this.routerPush('InvoicePaymentListDetail', query)
              //     }
              //   }
              // },
              // {prop: 'invoiceType', label: this.$t('Settle.invoiceType'), type: 'select', key: 'invoiceType',propInDict:"invoiceType", width:125,},
              // {prop: 'title', label: '发票抬头', type: 'text', key: 'title'},
              // {prop: 'writeoffAmt', label: this.$t('Collect.writtenoffAmount'), type: 'text', key: 'writeoffAmt'},
              // {prop: 'lockAmt', label: '占用金额', type: 'text', key: 'lockAmt'},
              // {prop: 'remainingAmount', label: '剩余可用金额', type: 'text', key: 'remainingAmount', 
              //   formatter: (row, pItem) => {
              //     return row.amt - row.writeoffAmt - row.lockAmt
              //   }
              // },
              // {prop: 'amt', label: this.$t('Settle.invoiceAmt'), type: 'text', key: 'amt'},
              // {prop: 'currency', label: this.$t('Settle.invoiceCur'), type: 'text', key: 'currency'},
              // {prop: 'rate', label: this.$t('Settle.invoiceRate'), type: 'text', key: 'rate'},
              // {prop: 'taxRate', label: this.$t('Settle.taxRate'), type: 'select', key: 'taxRate',propInDict:'taxRateInfo'},
              {prop: 'taxAmt', label: this.$t('FeeList.taxAmt'), type: 'text', key: 'taxAmt'},
              // {prop: 'remainingAmount', label: '剩余可用金额', type: 'text', key: 'remainingAmount', 
              //   formatter: ({row}) => {
              //     return decimalFixed2(row.amt - row.writeoffAmt - row.lockAmt)
              //   }
              // },
              {prop: 'relevanceAmt', label: this.$t('FinBill.ssociatAmount'), type: 'text', key: 'relevanceAmt'},
              {prop: 'createdName', label: this.$t('Settle.createdName'), type: 'text', key: 'createdName'},
              {prop: 'createdTime', label: this.$t('Settle.createdTime'), type: 'text', key: 'createdTime', width:125,},
            ]
            item.option1.columns = columns1
            item.option1.data = []

            item.delayInvoice = 'yes'
            item.delayInvoiceAmt = item.canInvoiceAmt
            item.prepaySum = ''
          })
          this.payInfoList = this.payInfoList.map(item => {
            item.applyPayAmts = item.applyPayAmt
            item.payWay = 'chinese_mainland'
            this.payWayChange(item, true)
            return { ...item }
          })
          this.$forceUpdate()
          // this.option0.data = this.payInfoList
          // this.option0.data.forEach(item => item.edit = true)
          // this.option1.data = list
          this.option3.data = res.data.settleOrderFeeList
          // this.invoicePaymentList = data


          this.payApplyDetailForm.earliestDate = res.data.earliestDate
          //2021-07-28需求最晚付款时间为必填，默认显示空白，手动填选
          this.payApplyDetailForm.latestDate = this.applyNo ? res.data.latestDate : ''
          this.payApplyDetailForm.hasInvoice = res.data.hasInvoice
          this.payApplyDetailForm.delayInvoice = res.data.delayInvoice
          this.payApplyDetailForm.remark = res.data.remark
          this.payApplyDetailForm.settleCompCode = res.data.settleCompCode
          this.payApplyDetailForm.settleCompName = res.data.settleCompName
          this.payApplyDetailForm.recvCorpCode = res.data.recvCorpCode
          this.payApplyDetailForm.recvWriteoffStatus = res.data.recvWriteoffStatus
          this.payApplyDetailForm.recvCorpName = res.data.recvCorpName
          this.payApplyDetailForm.applyPayAmountSumByCurrency = res.data.applyPayAmountSumByCurrency
          this.payApplyDetailForm.currency = res.data.currency
          this.payApplyDetailForm.settleCycle = res.data.settleCycle
          this.payApplyDetailForm.orderNo = res.data.orderNo
          this.payApplyDetailForm.orderReciSumAmt = res.data.orderReciSumAmt
          this.payApplyDetailForm.orderReciWriteOffAmt = res.data.orderReciWriteOffAmt
          this.payApplyDetailForm.orderReciNoWriteOffAmt = res.data.orderReciNoWriteOffAmt
          this.payApplyDetailForm.payInfoInvoices = []
          this.payApplyDetailForm.recvFinishsProveFileNo = ''
          this.payApplyDetailForm.hasBlack = res.data.hasBlack
          // this.payApplyDetailForm.hasBlackReason = res.data.hasBlackReason // 20221027去除
          this.payApplyDetailForm.hasCustBlack = res.data.hasCustBlack
          this.payApplyDetailForm.hasSupplierBlack = res.data.hasSupplierBlack

          // this.prepayAccountBalance() // 切换选择预付款时会调用，此处可以不调用
          this.settleGather()
        }
      }).catch(err => {
        console.log(err)
        this.delVisitedView()
        this.cancel()
      }).finally(()=>{
        if (this.payApplyDetailForm.hasBlack === 'yes') {
          let title = this.payApplyDetailForm.hasCustBlack === 'yes' ? this.$t('Settle.proceedTips') : this.payApplyDetailForm.hasSupplierBlack === 'yes' ? this.$t('Settle.blacklistedTips') : ''
          this.$confirm(title, this.$t('Common.tips'), {
            confirmButtonText: this.$t('Common.sure'),
            cancelButtonText: this.$t('Common.cancel'),
            type: 'warning',
          }).then(() => {
            this.loading = false
          }).catch(err => {
            console.log(err)
            this.loading = false
            this.delVisitedView()
            this.cancel()
          })
        } else {
          this.loading = false
        }
      })
    },
    queryPayApplySettleInfo() {
      let data = {
        applyNo: this.applyNo
      }
      this.loading = true
      queryPayApplySettleInfo(data).then(res => {
        if (res.code === 0) {
          this.payApplyDetailForm = { ...res.data }
          this.payInfoId = res.data.payInfoId
          this.payInfoList = [ res.data.payInfoVo ]
          this.payInfo = this.payInfoList[0]
          this.payInfoId = this.payInfo.payInfoId
          this.payOrder = res.data.payOrder
          let payOrder = res.data.payOrder
          if (payOrder instanceof Array) {
            payOrder = payOrder
          } else {
            payOrder = payOrder ? [ Object.assign(payOrder,{payTime:res.data.payTime})] : []
          }
          this.payOrder = payOrder
          this.option4.data = payOrder // this.payOrder ? this.payOrder : []
          this.option6.data = res.data.payApplySettleRefDzgList
          let prepayUsables = res.data.prepayUsables // 关联的预付款列表
          this.optionCheck.data = res.data.payApplyApproveFlowDetailList || []
          // let data = []
          // let list = []
          this.payInfoList.forEach((item, index) => {
            // item.payInfoInvoiceList = []
            // data.push(item)
            // item.payInfoInvoices.forEach(it=>{
            //   it.invoicePayment ? list.push(it.invoicePayment) : []
            // })
            let operationBtns = Object.assign({}, this.option.operationBtns, {
              data: [
                {
                  label: this.$t('Common.del'),
                  type: 'text',
                  show: true,
                  action: 'Delete'
                }
              ],
              show: true
            })
            item.option0 = Object.assign({}, this.option, {
              id: 'option0', $name: 'SettlementPayApply0',
              data: [],
              tips: {
                text: '',
                show: false
              },
              selection: {
                show: false
              },
              operationBtns: {
                show: false
              },
              edit: true,
              rootTipsHide:true
            })
            // let columns0 = [
            //   {prop: 'recvCorpName', label: this.$t('FeeList.settleCorp'), type: 'text',},
            //   // {
            //   //   prop: 'payAccountShortName',
            //   //   label: this.$t('PayApplyList.payAccountShortName'),
            //   //   type: 'select',
            //   //   width:150,
            //   //   placeholder: '请选择付款银行简称',
            //   //   readOnly: this.isApproved,
            //   //   required: true,
            //   //   remote: true,
            //   //   remoteMethod: (queryString, item, row) => {this.bankAccountList1(queryString, item, row, index)},
            //   //   visibleChange: (value, item, row) => {this.bankAccountList1(value, item, row, index)},
            //   //   change: (value, item, row) => {this.select1.change(value, item, row)},
            //   //   remoteSelectList: []
            //   // },
            //   // {prop: 'payBankName', label: this.$t('PayApplyList.payBankName'), type: 'text', width:125,},
            //   // {prop: 'payAccountName', label: '付款账户名', type: 'text'},
            //   // {prop: 'payAccountNo', label: this.$t('PayApplyList.payAccountNo'), type: 'text'},
            //   {
            //     prop: 'recvAccountNo',
            //     label:  this.$t('Settle.recvAccountNo'),
            //     type: 'select',
            //     placeholder: '请选择收款账号',
            //     readOnly: this.isApproved,
            //     required: true,
            //     remote: true,
            //     remoteMethod: (queryString, item, row, index) => {this.bankAccountList2(queryString, item, row, index)},
            //     visibleChange: (value, item, row, index) => {this.bankAccountList2(value, item, row, index)},
            //     change: (value, item, row) => {this.select2.change(value, item, row);row.isRequiredNull = false;},
            //     remoteSelectList: []
            //   },
            //   {prop: 'recvAccountPublicType', label: '账户类型', type: 'text', formatter: ({ cellValue }) => { return cellValue === 'pub' ? '对公' : cellValue === 'prv' ? '对私' : cellValue }},
            //   {prop: 'recvBankName', label: this.$t('PayApplyList.recvBankName'), type: 'text'},
            //   {prop: 'recvBankBranch', label: this.$t('PayApplyList.recvBankBranch'), type: 'text'},
            //   {prop: 'recvAccountName', label:  this.$t('Settle.recvAccountName'), type: 'text'},
            // ]
            item.option0.columns = this.columns0 // 20220616尝试注释该行-20220624打开
            // item.edit = true
            // item.option0.data = [item]
            let { recvCorpName, payCompName, recvAccountNo, recvBankAccountId, recvAccountPublicType, recvBankName, recvBankBranch, recvAccountName, currency, payCompCode, recvCorpCode, recvRegAddr, recvBankAddr, recvSwiftCode, recvIdNo, recvMobileNo, thirdPayChannelCode, thirdPayChannelLimitAmt, thirdPayChannelUsedAmt } = item
            let accountInfo = { recvCorpName, payCompName, recvAccountNo, recvBankAccountId, recvAccountPublicType, recvBankName, recvBankBranch, recvAccountName, currency, payCompCode, recvCorpCode, recvRegAddr, recvBankAddr, recvSwiftCode, recvIdNo, recvMobileNo, thirdPayChannelCode, thirdPayChannelLimitAmt, thirdPayChannelUsedAmt }
            accountInfo.edit = true
            item.option0.data = [accountInfo]
            item.showTable1 = true
            item.hasThirdPayChannelCode = thirdPayChannelCode ? true : false
            // 对私账号显示身份证号、手机号
            let row = accountInfo
            let payInfo = item
            if (payInfo.hasCustSpecialFee === 'yes') {
              if (row.recvAccountPublicType === 'prv') {
                payInfo.option0.columns = [
                  ...this.columns0,
                  {prop: 'recvIdNo', label: this.$t('Settle.recvIdNo'), type: 'text', required: true},
                  {prop: 'recvMobileNo', label: this.$t('Settle.recvMobileNo'), type: 'text', required: true}
                ]
              } else {
                payInfo.option0.columns = [...this.columns0]
              }
            }
            this.payWayChange(item, true)
            
            item.option1 = Object.assign({}, this.option, {
              id: 'option1', $name: 'SettlementPayApply1',
              data: [],
              tips: {
                text: '',
                show: false
              },
              index: {
                show: true,
                title:this.$t('Common.index')
              },
              selection: {
                show: false
              },
              operationBtns: Object.assign({}, operationBtns, {
                data: [
                  {
                    label: this.$t('Common.del'),
                    type: 'text',
                    show: false,
                    action: 'Delete',
                    showFn: row => {
                      return row.hasPrepayInvoice === 'yes' ? false : true
                    }
                  }
                ],
              })
            })
            let columns1 = [
              {prop: 'invoiceNo', label: this.$t('FeeList.invoiceNo'), key: 'invoiceNo', width:125,
                type: 'button',
                width: 118,
                operationBtns: {
                  show: true,
                  callback: (fn, index, row) => {
                    let query = {
                      invoicePaymentId:row.invoicePaymentId,
                      invoiceNo: row.invoiceNo
                    }
                    this.routerPush('InvoicePaymentListDetail', query)
                  }
                }
              },
              // {prop: 'invoiceType', label: '开票类型', type: 'select', width:125, key: 'invoiceType',propInDict:"invoiceType"},
              // {prop: 'title', label: '发票抬头', type: 'text', key: 'title'},
              // {prop: 'writeoffAmt', label: this.$t('Collect.writtenoffAmount'), type: 'text', key: 'writeoffAmt'},
              // {prop: 'lockAmt', label: '占用金额', type: 'text', key: 'lockAmt'},
              // {prop: 'remainingAmount', label: '剩余可用金额', type: 'text', key: 'remainingAmount', 
              //   formatter: (row, pItem) => {
              //     return row.amt - row.writeoffAmt - row.lockAmt
              //   }
              // },
              // {prop: 'amt', label: '开票金额', type: 'text', key: 'amt'},
              // {prop: 'currency', label: '开票币种', type: 'text', key: 'currency'},
              // {prop: 'rate',label: this.$t('Settle.invoiceRate'), type: 'text', key: 'rate'},
              // {prop: 'taxRate', label: '开票税率', type: 'select', key: 'taxRate',propInDict:'taxRateInfo'},
              {prop: 'taxAmt', label: this.$t('FeeList.taxAmt'), type: 'text', key: 'taxAmt'},
              // {prop: 'remainingAmount', label: '剩余可用金额', type: 'text', key: 'remainingAmount', 
              //   formatter: ({row}) => {
              //     if (row.hasPrepayInvoice === 'yes') {
              //       return row.balanceAmt
              //     } else {
              //       return decimalFixed2(row.amt - row.writeoffAmt - row.lockAmt)
              //     }
              //   }
              // },
              {prop: 'relevanceAmt', label: this.$t('FinBill.ssociatAmount'), type: 'text', key: 'relevanceAmt', 
                formatter: ({row}) => { return row.invoiceAmt }
              },
              {prop: 'createdName', label: '登记人', type: 'text', key: 'createdName'},
              {prop: 'createdTime', label: '登记时间', type: 'text', width:125, key: 'createdTime'},
            ]
            item.option1.columns = columns1
            item.option1.data = item.payInfoInvoices.map(item => {
              // 发票信息里面也加了一个字段：hasPrepayInvoice（payInfoList.payInfoInvoices对象里面的属性），将其放在option1.data中
              if (item.hasPrepayInvoice === 'yes') {
                item.invoicePayment.hasPrepayInvoice = 'yes'
              }
              item.invoicePayment.invoiceAmt = item.invoiceAmt
              return item.invoicePayment
            })
            // item.delayInvoice = item.delayInvoice
            // item.delayInvoiceAmt = item.delayInvoiceAmt
            // item.delayInvoiceAmt = item.canInvoiceAmt
            
            item.option8 = Object.assign({}, this.option, {
              id: 'option8', $name: 'SettlementPayApply8',
              data: [],
              tips: {
                text: '',
                show: false
              },
              selection: {
                show: false
              },
              operationBtns
            })
            let columns8 = [
              {prop: 'settleCompName', label: this.$t('Settle.branchCompany'), width:150, type: 'text'},
              {prop: 'payOrderNo', label: this.$t('Settle.payOrderNo'), width:125, type: 'select'},
              {prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), width:150, type: 'text'},
              {prop: 'currency', label: this.$t('Settle.paymentCurrency'), type: 'text'},
              {prop: 'realpayAmt', label: this.$t('Settle.applyPayAmt'), type: 'text'}, // balance
              {prop: 'balance', label: this.$t('Settle.remainingAmount'), type: 'text', // remainingAmount
                // formatter: (row, pItem) => {
                //   return row.balance - row.usedAmt
                // }
              },
            ]
            item.option8.columns = columns8
            item.option8.data = prepayUsables
            item.applyPayAmts = item.applyPayAmt
            item.prepaySum = ''
          })
          this.payInfoList = this.payInfoList.map(item => {
            return { ...item,
              dzgFeeTaxRate :'',
              dzgFeeAmt  :'',
              dzgPayBillNo  :'',
              internalFeeCode   :'',
              specialDeductRechtstraeger : res.data.specialDeductRechtstraeger,
            }
          })
          this.$forceUpdate()

          this.option3.data = res.data.settleOrderFeeList
          this.prepayAccountBalance(this.payInfoList[0]) // 此处再调用一次，初次在payWayChange调用未显示预付款余额
          this.settleGather()
          // this.dzgFeeAmtChange()
        }
      }).catch(err => {
        console.log(err)
        this.delVisitedView()
        this.cancel()
      }).finally(()=>{
        this.loading = false
      })
    },
    payWayChange(item, is, index) {
      let data = {
        recvBankName :'',
        recvBankBranch :'',
        recvAccountNo: '',
        recvAccountName: '',
        compBankAccountId: '',
        recvBankAccountId: '',
        recvBankAddr: '',
        recvRegAddr: '',
        recvSwiftCode:'',
        recvAccountPublicType:''
      }
      // 切换付款方式清空收款账号
      item.option0.data[0].payWay = item.payWay
      if(!is){
        Object.assign(item.option0.data[0], {}, data)
        let hasIntrabranch = 'no'
        let publicType = ''
        let payWay = item.payWay
        if(payWay === 'intrabranch'){
          // hasIntrabranch ='yes'  
        }
        let payInfo = item
        if(payWay === 'cash'){
          publicType ='prv'
          if (!payInfo.option0.columns.some(item => item.prop === 'recvIdNo')) {
            payInfo.option0.columns = payInfo.option0.columns.concat([
              {prop: 'recvIdNo', label: this.$t('Settle.recvIdNo'), type: 'text', required: true},
              {prop: 'recvMobileNo', label: this.$t('Settle.recvMobileNo'), type: 'text', required: true}
            ])
          }
        } else {
          // 此处这样按大类处理，当hasCustSpecialFee为yes且对私时，交由银行账号做相关处理
          let i1 = payInfo.option0.columns.findIndex(item => item.prop === 'recvIdNo')
          if (i1 > -1) {
            payInfo.option0.columns.splice(i1, 1)
          }
          let i2 = payInfo.option0.columns.findIndex(item => item.prop === 'recvMobileNo')
          if (i2 > -1) {
            payInfo.option0.columns.splice(i2, 1)
          }
        }
        this.$store.dispatch('dict/bankAccountList', {"accountNo": '', "currency": item.currency, hasIntrabranch, "receipayType": "receive", "unitCode": item.recvCorpCode, "countryOrgType": '', publicType, "status": "effect"}).then(res => {
          let list = res ? res : []
          // this.bankAccountSelectOptions2
          let remoteSelectList = list.map(item => {
            item.value = item.settleUnitBankAcctId
            item.label = item.accountNo
            return item
          })
          // 如果是申请页面，只有一个银行账号，默认选中它；如果是详情页面，不默认选中
          if(remoteSelectList.length){
            // item.option0.data[0].recvBankName = remoteSelectList[0].bankName
            // item.option0.data[0].recvBankBranch = remoteSelectList[0].bankBranch
            // item.option0.data[0].recvAccountNo = remoteSelectList[0].accountNo
            // item.option0.data[0].recvAccountName = remoteSelectList[0].accountName
            // item.option0.data[0].compBankAccountId = remoteSelectList[0].settleUnitBankAcctId
            // item.option0.data[0].recvBankAccountId = remoteSelectList[0].settleUnitBankAcctId
            // item.option0.data[0].recvBankAddr = remoteSelectList[0].bankAddr
            // item.option0.data[0].recvRegAddr = remoteSelectList[0].regAddr
            // item.option0.data[0].recvSwiftCode = remoteSelectList[0].swiftCode
            // item.option0.data[0].recvAccountPublicType = remoteSelectList[0].publicType
            let value = remoteSelectList[0].settleUnitBankAcctId
            let itemLocal = { remoteSelectList }
            let row = item.option0.data[0]
            this.select2.change(value, itemLocal, row, item.option0)
          }
        })
      }

      // let data = {
      //   payAccountName: "",
      //   payAccountNo: "",
      //   payAccountShortName: "",
      //   payBankAccountId: null,
      //   payBankBranch: "",
      //   payBankCode: "",
      //   payBankName: ""
      // }
      //切换付款方式清空我司付款银行信息
      // if(!is){
      //   Object.assign(item.option0.data[0],{},data)
      // }
      
      if (item.option0.columns.length === 8) {
        this.option0ColumnsInit = [...item.option0.columns]
      }
      if (item.payWay === 'cash') { // || item.payWay === 'chinese_mainland' || item.payWay === 'intrabranch'
        // let columns = [
        //   {prop: 'recvCorpName', label: this.$t('FeeList.settleCorp'), type: 'text'},
        //   {
        //     prop: 'recvAccountNo',
        //     label:  this.$t('Settle.recvAccountNo'),
        //     type: 'select',
        //     placeholder: '请选择收款账号',
        //     readOnly: this.isApproved,
        //     required: true,
        //     remote: true,
        //     remoteMethod: (queryString, item, row, index) => {this.bankAccountList2(queryString, item, row, index)},
        //     visibleChange: (value, item, row, index) => {this.bankAccountList2(value, item, row, index)},
        //     change: (value, item, row) => {this.select2.change(value, item, row);row.isRequiredNull = false;},
        //     remoteSelectList: []
        //   },
        //   {prop: 'recvAccountPublicType', label: '账户类型', type: 'text', formatter: ({ cellValue }) => { return cellValue === 'pub' ? '对公' : cellValue === 'prv' ? '对私' : cellValue }},
        //   {prop: 'recvBankName', label: this.$t('PayApplyList.recvBankName'), type: 'text'},
        //   {prop: 'recvBankBranch', label: this.$t('PayApplyList.recvBankBranch'), type: 'text'},
        //   {prop: 'recvAccountName', label:  this.$t('Settle.recvAccountName'), type: 'text'},
        // ]
        // item.option0.columns = this.columns0 // 20220616尝试注释
        let i1 = item.option0.columns.findIndex(item => item.prop === 'recvBankAddr')
        if (i1 > -1) {
          item.option0.columns.splice(i1, 1)
        }
        let i2 = item.option0.columns.findIndex(item => item.prop === 'recvRegAddr')
        if (i2 > -1) {
          item.option0.columns.splice(i2, 1)
        }
        let i3 = item.option0.columns.findIndex(item => item.prop === 'recvSwiftCode')
        if (i3 > -1) {
          item.option0.columns.splice(i3, 1)
        }
      } else {
        if (item.payWay === 'abroad' || item.payWay === 'hk_china' || item.payWay === 'chinese_mainland' || item.payWay === 'intrabranch') {
          // let columns = [...this.option0ColumnsInit]
          // let index1 = columns.findIndex(subItem => {
          //   return subItem.prop === 'recvAccountName'
          // })
          // let obj1 = {prop: 'recvBankAddr', label: '银行地址',width:125, type: 'text'}
          // columns.splice(index1, 0, obj1)
          // let obj2 = {prop: 'recvRegAddr', label: '供应商公司地址', width:125,type: 'text'}
          // let obj3 = {prop: 'recvSwiftCode', label: 'SWIFT Code', type: 'text'}
          // columns.push(obj2)
          // columns.push(obj3)
          
          // let columns = [
          //   {prop: 'recvCorpName', label: this.$t('FeeList.settleCorp'), type: 'text'},
          //   {
          //     prop: 'recvAccountNo',
          //     label:  this.$t('Settle.recvAccountNo'),
          //     type: 'select',
          //     placeholder: '请选择收款账号',
          //     readOnly: this.isApproved,
          //     required: true,
          //     remote: true,
          //     remoteMethod: (queryString, item, row, index) => {this.bankAccountList2(queryString, item, row, index)},
          //     visibleChange: (value, item, row, index) => {this.bankAccountList2(value, item, row, index)},
          //     change: (value, item, row) => {this.select2.change(value, item, row);row.isRequiredNull = false;},
          //     remoteSelectList: []
          //   },
          //   {prop: 'recvAccountPublicType', label: '账户类型', type: 'text', formatter: ({ cellValue }) => { return cellValue === 'pub' ? '对公' : cellValue === 'prv' ? '对私' : cellValue }},
          //   {prop: 'recvBankName', label: this.$t('PayApplyList.recvBankName'), type: 'text'},
          //   {prop: 'recvBankBranch', label: this.$t('PayApplyList.recvBankBranch'), type: 'text'},
          //   {prop: 'recvBankAddr', label: '银行地址',width:125, type: 'text'},
          //   {prop: 'recvAccountName', label:  this.$t('Settle.recvAccountName'), type: 'text'},
          //   {prop: 'recvRegAddr', label: '公司地址', width:125,type: 'text'},
          //   {prop: 'recvSwiftCode', label: 'SWIFT Code', type: 'text'}
          // ]
          // 20220616尝试注释
          // item.option0.columns = [
          //   ...this.columns0,
          //   {prop: 'recvBankAddr', label: '银行地址',width:125, type: 'text'},
          //   {prop: 'recvRegAddr', label: '公司地址', width:125,type: 'text'},
          //   {prop: 'recvSwiftCode', label: 'SWIFT Code', type: 'text'}
          // ] // columns
          if (!item.option0.columns.some(item => item.prop === 'recvBankAddr')) {
            item.option0.columns = item.option0.columns.concat([
              {prop: 'recvBankAddr', label: this.$t('FinBill.recvBankAddr'),width:125, type: 'text'},
              {prop: 'recvRegAddr', label: this.$t('Settle.recvRegAddr'), width:125,type: 'text'},
              {prop: 'recvSwiftCode', label: this.$t('Settle.swiftCode'), type: 'text'}
            ])
          }
        } 
        // else if (item.payWay === 'chinese_mainland' || item.payWay === 'intrabranch') {
        //   let columns = [...this.option0ColumnsInit]
        //   item.option0.columns = columns
        // }
      }
      let dzgData = {
        internalFeeCode:'',
        dzgPayBillNo:'',
        dzgFeeAmt:'',
        dzgFeeTaxRate:''
      }
      //内部往来清空转大掌柜信息
      if (item.payWay === 'intrabranch') {
        Object.assign(item,{},dzgData)
        if(!is){
          item.applyPayAmt = item.applyPayAmts
        }
      }
      if (item.payWay === 'prepay_dedue') {
        this.prepayAccountBalance(item)
      }
    },
    getPayChannelCodes() {
      limitList({}).then(res => {
        this.payChannelCodes = res.data ? res.data : []
      })
    },
    payChannelCodeChange(val) {
      this.payChannelCodeInfo = this.payChannelCodes.find(item => item.thirdPayChannelCode === val)
    },
    sendResFileList(data) {
      console.log(data)
    },
    handleCollapse(index) {
      this.payInfoList[index].showTable1 = !this.payInfoList[index].showTable1
      // this['show' + val] = !this['show' + val]
    },
    decimalFixed2(x) {
      let result = decimalFixed2(x)
      return result
    },
    // 结算汇总
    settleGather(){
      let list = this.option3.data
      let settleGatherList = list.filter((v) => !v.invisible)
      let currencys = settleGatherList.map(item => {
        return item.settleCurrency
      })
      currencys = [... new Set(currencys)]

      this.originalGather = currencys.map(item => {
        return {
          currency: item,
          amt: settleGatherList.reduce((sum, cur) => {
            if (item === cur.settleCurrency) {
              if (cur.receipayType === 'pay') {
                return cur.exSettleAmt ? sum + Number(cur.exSettleAmt) : sum
              } else if (cur.receipayType === 'receive') {
                return cur.exSettleAmt ? sum - Number(cur.exSettleAmt) : sum
              } else {
                return sum 
              }
            } else {
              return sum
            }
          }, 0),
          isPay: false
        }
      })
    },
    prepayAccountBalance(item) {
      let data = {
        "currPage": 1,
        "pageSize": 30,
        // "settleCorpCode": this.payApplyDetailForm.recvCorpCode,
        // "currency": this.payApplyDetailForm.currency,
        "query": [
          {"column": "settleCompCode", "type": "eq", "value": item.payCompCode}, // this.payApplyDetailForm.settleCompCode
          {"column": "settleCorpCode", "type": "eq", "value": item.recvCorpCode}, // this.payApplyDetailForm.recvCorpCode
          {"column": "currency", "type": "eq", "value": item.currency} // this.payApplyDetailForm.currency
        ]
      }
      PREPAY.balance(data).then(res => {
        if (res.code === 0) {
          // let { list } = res.data
          // this.payApplyDetailForm.prepaySum = list.reduce((sum, cur, index) => {
          //   return sum + cur.balance
          // }, 0)
          // this.payApplyDetailForm.prepaySum = res.data.balance
          if (res.data) {
            // this.payApplyDetailForm.prepaySum = res.data.reduce((sum, curr) => {
            //   return sum += curr.currency + curr.balance + ' '
            // }, '')
            item.prepaySum = res.data.reduce((sum, curr) => {
              return sum + curr.balance
            }, 0)
          } else {
            item.prepaySum = '' // this.payApplyDetailForm
          }
        }
      })
    },
    // 未用
    // bankAccountList(unitCode, currency, item) {
    //   let data = {unitCode, currency}
    //   queryAllBankAccountList(data).then(res => {
    //     if (res.code === 0) {
    //       item.remoteSelectList = res.data.map(item => {
    //         return Object.assign(item, {
    //           label: item.accountNo,
    //           value: item.accountNo
    //         })
    //       })
    //     }
    //   })
    // },
    refuseDialog(){
      this.refuseForm.refuseReason = ''
      this.refuseDialogShow = true 
      this.$nextTick(() => this.$refs.refuseForm.clearValidate())
    },
    refuseBefore() {
      this.$refs.refuseForm.validate(valid => {
        console.log(valid);
        if(!valid){
          return
        }
        this.approve('refuse')
        this.handleCancel()
      })
      // if (!this.refuseForm.refuseReason) {
      //   this.$message({
      //     message: '拒绝原因不能为空！',
      //     type: 'error',
      //     showClose: true
      //   })
      // } else {
      //   this.approve('refuse')
      //   this.handleCancel()
      // }
    },

    approvePassData(data){
      this.recvData = Object.assign(this.recvData, data)
    },
    sure(val){
      if(val){
        if(this.payApplyDetailForm.recvWriteoffStatus !== 'finish' && this.payApplyDetailForm.hasCustSpecialFee === 'yes'){
          this.$confirm(this.$t('Settle.sureTips'), this.$t('Common.tips'), {
            confirmButtonText: this.$t('Common.sure'),
            cancelButtonText: this.$t('Common.cancel'),
            type: 'warning'
          }).then(() => {
            if(this.payApplyDetailForm.invoiceRecvAcctEqRest === 'no'){
              this.$confirm( this.payApplyDetailForm.invoiceRecvAcctNotEqWarningMsg ? this.payApplyDetailForm.invoiceRecvAcctNotEqWarningMsg: this.$t('Settle.notEqWarning'), this.$t('Common.tips'), {
                  cancelButtonText: this.$t('Common.cancel'),
                  confirmButtonText: this.$t('Common.sure'),
                  cancelButtonClass: 'btn-custom-cancel',
                  type: 'warning'
                }).then(() => {
                  return this.approve('pass')
                })
              }else{
                this.approve('pass')
              }
          }).catch(() => {         
          })
        }else{
          if(this.payApplyDetailForm.invoiceRecvAcctEqRest === 'no'){
            this.$confirm( this.payApplyDetailForm.invoiceRecvAcctNotEqWarningMsg ? this.payApplyDetailForm.invoiceRecvAcctNotEqWarningMsg: this.$t('Settle.notEqWarning'), this.$t('Common.tips'), {
              cancelButtonText: this.$t('Common.cancel'),
              confirmButtonText: this.$t('Common.sure'),
              cancelButtonClass: 'btn-custom-cancel',
              type: 'warning'
            }).then(() => {
              return this.approve('pass')
            })
          }else{
             this.approve('pass')
          }
        } 
      }
    },
    approvePass(type) {
      if(type === 'pass'){
        console.log(this.payApplyDetailForm.electrInvoiceNotFile);
        console.log(this.payApplyDetailForm);
        // if(this.payApplyDetailForm.electrInvoiceNotFile === 'yes'){
        //   return this.$msgErrClose('电子发票未上传附件的发票号码'+this.payApplyDetailForm.notImgFileElectrInvoiceNo+'！不能进行审批通过！')
        // }
        let payInfoList = this.validatePayInfoList()
        if (!payInfoList) return
        let data = {
          recvCorpName :this.payApplyDetailForm.recvCorpName,
          recvBankName : '',
          recvBankBranch : '',
          recvAccountNo : '',
          recvAccountName : '',
          recvRegAddr : '',
          recvSwiftCode :  '',
          auditOpinion :  this.payApplyDetailForm.auditOpinion,
          payInfoId:this.recvData.payInfoId
        }
        if(payInfoList.length){
          if(payInfoList[0].payWay === 'prepay_dedue'){
            this.approvePassData(data)
          }else{
            this.approvePassData(payInfoList[0])
          }
        }else{
          this.approvePassData(data)
        }
        this.recvData.payWay = this.payInfoList[0].payWay
        this.resultDialogOption.show = true
        return
      }
    },
    approve(type) {
      let payInfoList = []
      if(type !== 'refuse'){
        payInfoList = this.validatePayInfoList()
      }
      console.log(payInfoList)
      if (!payInfoList) return
      let latestDate = this.payApplyDetailForm.latestDate
      let data = {
        applyNoList: [this.applyNo],
        confirmStatus: type,
        refuseReason: this.refuseForm.refuseReason,
        auditOpinion: this.payApplyDetailForm.auditOpinion,
        latestDate: latestDate ? dateFormat('yyyy-mm-dd', latestDate) : latestDate,
        payInfoList,
        prepayUsables: this.payInfoList[0].payWay === 'prepay_dedue' ? this.payInfoList[0].option8.data : [] // 此处需用this.payInfoList，因payInfoList已去除option8等数据
      }
      if(type === 'pass'){
        data = Object.assign(data,this.recvData)
      }
      approvePayApplySettle(data).then(res => {
        if (res.code === 0) {
          this.$message({
            message: this.$t('FinBill.submitSuc'),
            type: 'success',
            showClose: true
          })
          if(type === 'pass'){
            this.resultDialogOption.show = false
          }
          this.relevanceOpne = false
          this.refuseDialogShow = false
          this.relevancePrepayDialogShow = false
          this.delVisitedView()
          this.cancel(true)
        }
      })
    },
    // 详情保存按钮
    handleSettleSubmit(){
      let payInfoList = this.validatePayInfoList()
      console.log(payInfoList)
      if (!payInfoList) return
      let latestDate = this.payApplyDetailForm.latestDate
      let data = {
        applyNoList: [this.applyNo],
        payInfoList,
        operationType:'modify',
        auditOpinion:this.payApplyDetailForm.auditOpinion,
        latestDate: latestDate ? dateFormat('yyyy-mm-dd', latestDate) : latestDate,
        prepayUsables: this.payInfoList[0].payWay === 'prepay_dedue' ? this.payInfoList[0].option8.data : [] // 此处需用this.payInfoList，因payInfoList已去除option8等数据
      }
      approvePayApplySettle(data).then(res => {
        if (res.code === 0) {
          this.$message({
            message: this.$t('FinBill.saveSuc'),
            type: 'success',
            showClose: true
          })
          this.getData()
          this.cancel(true)
        }
      })
    },
    submit() {
      let payInfoList = this.validatePayInfoList()
      if (!payInfoList) return
      let { hasBlack , latestDate, recvCorpName} = this.payApplyDetailForm
      let data = {
        latestDate: latestDate ? dateFormat('yyyy-mm-dd', latestDate) : latestDate,
        remark: this.payApplyDetailForm.remark,
        recvFinishsProveFileNo: this.payApplyDetailForm.recvFinishsProveFileNo,
        settleCompCode: this.payApplyDetailForm.settleCompCode,
        settleCompName: this.payApplyDetailForm.settleCompName,
        payInfoList
      }
      // return console.log('data', data)
      // let data = Object.assign({}, this.payApplyDetailForm, {
      //   // payApplySettleOrderList
      //   payInfoList: this.payInfoList
      // })
      let tip = this.$t('Settle.sureSubmit')
      for (let i = 0; i < data.payInfoList.length; i++) {
        if(data.payInfoList[i].specialDeductRechtstraeger === "order" && data.payInfoList[i].specialDeductHasApproval === 'yes'){
          tip = this.$t('Settle.specialDeduc') + data.payInfoList[i].specialProfitLowOrderNo + this.$t('Settle.sureSubmit')
        }
      }
      if (hasBlack === 'yes') {
         tip = `${recvCorpName} ${this.$t('Settle.recvCorpNameTips')}`
      }
      this.$confirm( tip, '', {
        confirmButtonText: this.$t('Common.sure'),
        cancelButtonText: this.$t('Common.cancel'),
        type: 'warning'
      })
      .then(() => {
        this.loading = true
        savePayApplySettle(data).then(res => {
          if (res.code === 0) {
            this.$message({
              type: 'success',
              message: this.$t('FinBill.submitSuc'),
              showClose: true
            })
            this.delVisitedView()
            this.cancel(true)
          }
        }).finally(()=>{
          this.loading = false
        })
      })
      .catch(() => {})
        // }
      // })
    },
    validatePayInfoList() {
      let payFormValid = true
      this.payInfoList.forEach((item, index) => {
        console.log('payForm' + index)
        console.log(this.$refs['payForm' + index])
        this.$refs['payForm' + index][0].validate(valid => {
          if (!valid) {
            payFormValid = false
          }
        })
      })
      if (!payFormValid) {
        // this.$message({
        //   message: '付款方式不能为空！',
        //   type: 'error',
        //   showClose: true
        // })
        return
      }
      // 现选取发票时，过滤了同币种的发票
      // let data = this.option1.data.map(it=>{
      //   let list = this.invoicePaymentList.map(item=>{
      //     return item.currency === it.currency
      //   })
      //   return list.toString()
      // })
      // if(data.length){
      //   for (let i = 0; i < data.length; i++) {
      //     if(data[i] === 'false'){
      //       return this.$msgErrClose('付款币种和开票币种需要一致！')
      //     }
      //   }
      // }
      let payInfoList = null 
      this.$refs.payApplyDetailForm.validate(valid => {
        if (valid) {
          // let settleOrderNoList = this.payInfoList.map(item => {
          //   return item.settleOrderNo
          // })
          // settleOrderNoList = [...new Set(settleOrderNoList)]

          // let payApplySettleOrderList = settleOrderNoList.map(no => {
          //   let settleOrderNo = no
          //   let list = this.payInfoList.filter(subItem => {
          //     return subItem.settleOrderNo === no
          //   })
          //   let payInfoList = list.map(item => {
          //     let payInfoInvoiceList = item.payInfoInvoices
          //     return Object.assign(item, {
          //       payInfoInvoiceList
          //     })
          //   })
          //   return {
          //     settleOrderNo,
          //     payInfoList
          //   }
          // })

          // 回传后台数据减少
          // payInfoList, 校验返回的数据
          payInfoList = this.payInfoList.map(item => {
            console.log(item === this.payInfo)
            item.payInfoInvoices = item.option1.data.map(subItem => {
              return {
                invoicePaymentId: subItem.invoicePaymentId,
                currency: subItem.currency
              }
            })
            console.log(item.payInfoInvoices)
            let newItem = { ...item }
            delete newItem.option0
            delete newItem.option1
            delete newItem.option8
            let option0Data = item.option0.data[0]
            option0Data = option0Data ? option0Data : {}
            // delete option0Data.option0 // 此处亦有option0等字段，会使JSON出错
            // delete option0Data.option1
            // delete option0Data.payInfoInvoices
            newItem = Object.assign(newItem, option0Data)
            return newItem
          })
        }
      })
      // console.log('payInfoList:', payInfoList)
      for (let i = 0; i < this.payInfoList.length; i++) {
        // if (this.payInfoList[i].payWay === '') { // countryOrgType
        //   this.$message({
        //     message: '付款方式不能为空！',
        //     type: 'error',
        //     showClose: true
        //   })
        // } else 
        if (this.payInfoList[i].payWay !== 'prepay_dedue') {
          let option0Data = this.payInfoList[i].option0.data[0]
          option0Data = option0Data ? option0Data : {}
          if (!option0Data.recvAccountNo) {
            // this.$message({
            //   message: '付款银行简称不能为空！',
            //   type: 'error',
            //   showClose: true
            // })
            this.payInfoList[i].option0.data[0].isRequiredNull = true
            return
          }
        }
        if (this.payInfoList[i].payWay === 'cash') {
          let option0Data = this.payInfoList[i].option0.data[0]
          option0Data = option0Data ? option0Data : {}
          if (option0Data.recvAccountPublicType !== 'prv') {
            this.$message({
              message: this.$t('Settle.prvTips'),
              type: 'error',
              showClose: true
            })
            // this.payInfoList[i].option0.data[0].isRequiredNull = true
            return
          }
        }
        let option0Data = this.payInfoList[i].option0.data[0]
        option0Data = option0Data ? option0Data : {}
        if (this.payInfoList[i].hasCustSpecialFee === 'yes' && option0Data.recvAccountPublicType === 'prv') {
          if (!option0Data.recvIdNo || !option0Data.recvMobileNo) { // !this.payInfoList[i].recvIdNo || !this.payInfoList[i].recvMobileNo
            this.$message({
              message: this.$t('Settle.pubTips'),
              type: 'error',
              showClose: true
            })
            return
          }
        }
      }
      return payInfoList
    },
    renderNoEdit(row, item) {
      let { formatter, prop, type, selectOptions, propInDict } = item
      if (formatter) {
        return formatter(row, item)
      } else if (type && type === 'select') {
        let obj = ''
        if (propInDict && this.dictMap[propInDict]) {
          obj = this.dictMap[propInDict].find(item => {
            return item.value === row[prop]
          })
        } else if (this.dictMap[prop]) {
          obj = this.dictMap[prop].find(item => {
            return item.value === row[prop]
          })
        } else if (selectOptions) {
          obj = selectOptions.find(item => {
            return item.value === row[prop]
          })
        }
        return obj && obj.label
      } else {
        return row[prop]
      }
    },
    recvCorpCodeChange(value) {
      let obj = this.settleUnitList.find(item => {
        return item.unitCode === value
      })
      this.payApplyDetailForm.recvCorpName = obj && obj.unitName
      // this.payApplyDetailForm.recvCorpCode = obj && obj.unitCode // recvCorpCode会自动改变，无需赋值

      // this.option1.data.forEach(item => {
      //   let data = {
      //     unitCode: value,
      //     currency: item.currency
      //   }
      //   queryAllBankAccountList(data).then(res => {
      //     if (res.code === 0) {
      //       if (res.data.length > 0) {
      //         Object.assign(item, {
      //           recvAccountNo: res.data[0].accountNo,
      //           recvBankName: res.data[0].bankName,
      //           recvAccountName: res.data[0].accountName
      //         })
      //       } else {
      //         Object.assign(item, {
      //           recvAccountNo: '',
      //           recvBankName: '',
      //           recvAccountName: ''
      //         })
      //       }
      //     }
      //   })
      // })
      
      this.payInfoList.forEach((item,index) => {
        // 更新收款账号
        item.option0.data.forEach(subItem => {
          let recvCorpCode = this.payApplyDetailForm.recvCorpCode
          let recvCorpName = this.payApplyDetailForm.recvCorpName
          let currency = item.currency
          // 将收款账号置空
          subItem.recvBankName = ''
          subItem.recvBankBranch = ''
          subItem.recvAccountNo = ''
          subItem.recvAccountName = ''
          subItem.compBankAccountId = ''
          subItem.recvBankAccountId = ''
          // 获取供货商账号下拉数据
          subItem = Object.assign(subItem, { recvCorpCode, recvCorpName, currency })
          let recvAccountNoColumn = item.option0.columns.find(column => column.prop === 'recvAccountNo')
          this.bankAccountList2('', recvAccountNoColumn, subItem, index)
        })
        // 更新预付款余额
        this.prepayAccountBalance(item)
      })
    },
    cancel(refresh) {
      if(refresh === true){
       return this.routerDelBack(true)
      }
      this.routerBack()
    },
    handleCancel(){
      this.relevanceOpne = false
      this.refuseDialogShow = false
      this.relevancePrepayDialogShow = false
    },
    //标记后补发票
    handleDelayInvoice(type){
      if(this.payApplyDetailForm.delayInvoice===type){
        return this.$msgErrClose(this.$t('Settle.repeatTips'))
      }
      this.payApplyDetailForm.delayInvoice = type
    },
    //关联发票按钮
    relevance(item) {
      console.log(item)
      if(this.applyNo){
        let sum = item.option1.data.reduce((a, b) => new LSnum(a).plus(b.invoiceAmt).num , 0)
        if(item.applyPayAmt == sum){
          return this.$msgErrClose(this.$t('Settle.relevanceTips'))
        }
        if(this.payApplyDetailForm.needRelationInvoiceAmt === 0){
          return this.$message({ message: this.$t('Settle.applyNoTips')+this.payApplyDetailForm.applyNo+this.$t('Settle.payApplyDetailForm'),  type: 'error',  showClose: true })
        }
      }else{
        for (let i = 0; i < this.payInfoList.length; i++) {
          if(this.payInfoList[i].canInvoiceAmt === 0){
            return this.$message({  message: this.$t('Settle.canInvoiceAmtTips'),  type: 'error',  showClose: true })
          }
        }
      }
      // 已隐藏按钮
      // if (this.payApplyDetailForm.confirmStatus === 'refuse') {
      //   this.$message({
      //     message: '申请审批不通过，无法关联发票！',
      //     type: 'error',
      //     showClose: true
      //   })
      //   return
      // }

      // this.searchOption1.data.currency = this.invoicePaymentList.map(item=>{
      //   return item.currency
      // })
      //如果是结算付款详情页放开关联发票
      if (this.payInfo.payWay === 'prepay_dedue') {
        // console.log(this.payInfo.option8);
        // if (this.payInfo.option8.data.length === 0) {
        //   return this.$message({
        //     message: '须先关联预付款，才能关联发票',
        //     type: 'error',
        //     showClose: true
        //   })
        // } else { // 此为造的数据所处理，实际数据无需处理
          if (this.payInfo.option1.data.length === 0) {
            // let data = {
            //   payInfoId: this.payInfoId,
            //   prepayUsables: this.payInfo.option8.data
            // }
            // queryUsablePrepayDedueInvoiceList(data).then(res => {
            //   if (res.code === 0) {
            //     this.payInfo.option1.data = res.data ? res.data : []
            //   }
            // })
          } else { // 读取了预付款的发票后，再关联发票，判断预付款发票是否足够
            // let balanceAmtSum = this.payInfo.option1.data.reduce((sum, curr) => {
            //   return sum + curr.balanceAmt
            // }, 0)
            // if (balanceAmtSum >= this.payInfo.applyPayAmt) {
            //   return this.$message({
            //     message: '预付款的发票足够本次付款申请，不能再关联其他发票',
            //     type: 'error',
            //     showClose: true
            //   })
            // }
          }
        // }
      }
      // this.searchOption1.data.supplierCorpName = this.payApplyDetailForm.recvCorpName // item.recvCorpName，切换结算单位时取该值不正确。换到下面赋值
      // this.searchOption1.data.currency = item.currency
      this.payInfo = item
      this.payCurrency = item.currency
      this.relevanceOpne = true
    },
    searchInvoice() {
      this.getInvoiceList()
    },
    getInvoiceList() {
      let option0Data = this.payInfo.option0.data[0]
      let supplierAccountNo = option0Data ? option0Data.recvAccountNo : ''
      if (!supplierAccountNo) {
        return this.$message({
          message: this.$t('Settle.receivingTips'),
          type: 'error',
          showClose: true
        })
      }
      this.searchOption1.data.supplierCorpName = this.payApplyDetailForm.recvCorpName
      this.searchOption1.data.supplierCorpCode = this.payApplyDetailForm.recvCorpCode
      this.searchOption1.data.currency = this.payInfo.currency
      let data ={
        settleCompCode: this.payApplyDetailForm.settleCompCode,
        // supplierCorpCode: this.payApplyDetailForm.recvCorpCode,
        // supplierCorpName: this.payApplyDetailForm.recvCorpName,
        supplierAccountNo,
        // currency: this.payInfo.currency,
        ...this.searchOption1.data
      }
      // data.currency = data.currency ? data.currency.toString() : '' // 已去掉多选，无需处理
      usableList(data).then(res => {
        if (res.code === 0) {
          let list = res.data
          let data = []
          list.forEach(item => {
            if (this.payInfo.option1.data.every(relevance => {
              return relevance.invoicePaymentId !== item.invoicePaymentId
            })) {
              data.push(item)
            }
          })
          this.option2.data = data
        }
      })
    },
    getListAmtSummary(val) {
        if (val.length) {
        let realpayAmtTotalList = []
        let balanceTotalList = []
        let list = val
        let currencyList = [...new Set(list.map(item => item.currency))]
        currencyList.forEach(item => {
            let arr = list.filter(keys => keys.currency === item)
            let sum = arr.reduce((a, b) => Number(a) + Number(b.amt), 0)
            if(sum && item){
            realpayAmtTotalList.push({
                currency: item,
                amt: Math.round(sum*100)/100
            })
            }
            let sum1 = arr.reduce((a, b) => Number(a) + Number(b.balanceAmt), 0)
            if(sum1 && item){
            balanceTotalList.push({
                currency: item,
                amt: Math.round(sum1*100)/100
            })
            }
            
        })
        console.log(realpayAmtTotalList);
        console.log(balanceTotalList);

        let data = {
            realpayAmtTotalList,
            balanceTotalList
        }
        console.log(data);
        const labelObj = {
            // realpayAmtTotalListLabel: this.$t('Settle.invoiceAmt'),
            balanceTotalListLabel: this.$t('Settle.remainingAmount'),
        }
        const colorObj = {
            // realpayAmtTotalListColor: 'red', // 支持red, green, black三种值
            balanceTotalListColor: 'green'
        }
        this.option2.listAmtSummary = Object.assign(
            this.option2.listAmtSummary,
            {
            show: true,
            data,
            labelObj,
            colorObj
            }
        )
        }
      },
    relevanceConfirm(selectionOut) { // relevanceConfirm() {
      selectionOut = (selectionOut && selectionOut instanceof Array) ? selectionOut : this.multipleSelection2
      if (selectionOut.length === 0) { // this.multipleSelection2.length === 0
        if (!(selectionOut instanceof Array)) {
          this.$message({
            message: this.$t('Settle.invoicesTips'),
            type: 'error',
            showClose: true
          })
        }
        return
      }
      let selection = selectionOut.filter(item => { // this.multipleSelection2.filter
        return item.currency === this.payCurrency
      })
      let tempInvoiceData = [...this.payInfo.option1.data]
      console.log('tempInvoiceData: ', tempInvoiceData)
      console.log('selection: ', selection)
      selection.forEach(item => {
        let find = tempInvoiceData.find(itemP => {
          return itemP.invoicePaymentId === item.invoicePaymentId
        })
        if (!find) {
          tempInvoiceData.push(item)
        }
      })
      let supplierAccountNoList = tempInvoiceData.map((item, index) => {
        return item.supplierAccountNo
      })
      let list = []
      for (let i = 0; i < supplierAccountNoList.length; i++) {
        if(supplierAccountNoList[i] !== this.payInfo.recvAccountNo){
          list.push(supplierAccountNoList[i])
        }
      }
      list =  [...new Set(list)]
      if(list.length){
          this.$confirm(this.$t('Settle.connectionTips'), this.$t('Common.tips'), {
          confirmButtonText: this.$t('Common.sure'),
          cancelButtonText: this.$t('Common.cancel'),
          type: 'warning'
        }).then(() => {
          this.payInfoRelationInvoice( tempInvoiceData, selection )
        }).catch(() => {         
        })
      }else{
        this.payInfoRelationInvoice (tempInvoiceData, selection )
      }
    },
    payInfoRelationInvoice(tempInvoiceData, selection){
      if (this.applyNo) {
        let data = {
          "payInfoId": this.payInfoId,
          "payInfoInvoiceList": tempInvoiceData.map(item => {
            return {
              invoicePaymentId: item.invoicePaymentId,
              useSeq: item.useSeq
            }
          })
        }
        this.loadingRelationInvoice = true
        payInfoRelationInvoice(data).then(res => {
          if (res.code === 0) {
            // this.payInfo.option1.data = tempInvoiceData
            queryPayApplySettleInfo({ applyNo: this.applyNo }).then(res => {
              let payInfoVo = res.data.payInfoVo
              this.payInfo.option1.data = payInfoVo.payInfoInvoices.map(item => {
                item.invoicePayment.invoiceAmt = item.invoiceAmt
                return item.invoicePayment
              })
              this.payInfo.delayInvoice = payInfoVo.delayInvoice
              this.payInfo.delayInvoiceAmt = payInfoVo.delayInvoiceAmt
            })
            this.$message({
              message: this.$t('Settle.relinked'),
              type: 'success',
              showClose: true
            })
          }
        }).catch(err => {
        }).finally(()=>{
          this.loadingRelationInvoice = false
        })
      } else {
        this.payInfo.option1.data = tempInvoiceData
        this.$message({
          message: this.$t('Settle.chosenTips', {length: selection.length}),
          type: 'success',
          showClose: true
        })
      }
      // this.payInfo.option1.data = selection
      // this.payApplyDetailForm.hasInvoice = 'yes'
      // this.payApplyDetailForm.payInfoInvoices = this.multipleSelection2.map(item => {
      //   return {
      //     currency:item.currency,
      //     invoicePaymentId: item.invoicePaymentId
      //   }
      // })
      this.relevanceOpne = false
      // let data = {
      //   'receivableRegId': this.receivableRegId,
      //   'invoiceReceivableIds': this.multipleSelection2.map(item => {
      //     return item.invoicePaymentId
      //   })
      // }
      // regRelateInvoiceReceivable(data).then(res=>{
      //   if(res.code === 0){
      //     this.$message({message: '关联成功', type: 'success'});
      //     this.getData()
      //     this.relevanceOpne = false
      //   }
      // })
    },
    // 关联预付款按钮
    relevancePrepay(item) {
      this.payInfo = item
      let data = {
        "settleCompCode": item.settleCompCode ? item.settleCompCode : this.payApplyDetailForm.settleCompCode,
        "settleCorpCode": item.recvCorpCode,
        "currency": item.currency,
        "payAmt": item.applyPayAmt
      }
      queryUsablePrepayDedueList(data).then(res => {
        if (res.code === 0) {
          this.option5.data = res.data
        }
      })
      this.relevancePrepayDialogShow = true
    },
    relevancePrepayConfirm() {
      if (this.multipleSelection5.length === 0) {
        return this.$message({
          message: this.$t('Settle.associatedTips'),
          type: 'error',
          showClose: true
        })
      }
      this.multipleSelection5.forEach(item => {
        let payOrderNo = item.payOrderNo
        let orderType = item.orderType
        let relevancePrepay = this.payInfo.option8.data
        if (relevancePrepay.every(rItem => {
          return rItem.payOrderNo !== payOrderNo || (rItem.payOrderNo === payOrderNo && rItem.orderType !== orderType)
        })) {
          relevancePrepay.push(item)
        }
      })
      // this.payInfo.option8.data = [...this.multipleSelection5]
      let data = {
        payInfoId: this.payInfoId,
        prepayUsables: this.payInfo.option8.data
      }
      queryUsablePrepayDedueInvoiceList(data).then(res => {
        if (res.code === 0) {
          this.payInfo.option1.data = res.data ? res.data : []
        }
      })
      this.relevancePrepayDialogShow = false
    },
    search() {
      if (this.searchWords !== '') {
        this.option1.data.forEach((item, index) => {
          item.invisible = false
          this.searchWords = this.searchWords.toUpperCase()
          let patt1 = new RegExp(this.searchWords)
          if (!patt1.test(item.feeName) && !patt1.test(item.currency)) {
            item.invisible = true
            this.$set(this.option1.data, index, item)
          }
        })
      } else {
        this.option1.data.forEach((item, index) => {
          item.invisible = false
          this.$set(this.option1.data, index, item)
        })
      }
    },
    clearSearch() {
      this.search()
    },
    handleDelete($index, row, option) {
      this.$confirm(this.$t('Settle.confirmWarn'), this.$t('Common.tips'), {
        confirmButtonText: this.$t('Common.sure'),
        cancelButtonText: this.$t('Common.cancel'),
        type: 'warning'
      }).then(() => {
        // this.option1.data.splice($index, 1)
        // this.payApplyDetailForm.payInfoInvoices.splice($index, 1)
        if (option.id === 'option1') {
          console.log(row)
          let payInfo = this.payInfoList.find(item => {
            return item.option1 === option
          })
          console.log(payInfo)
          if (this.applyNo) {
            let data = {
              "payInfoId": payInfo.payInfoId,
              "deleteInvoiceNos": [row.invoiceNo]
            }
            deleteRelationInvoice(data).then(res => {
              if (res.code === 0) {
                queryPayApplySettleInfo({ applyNo: this.applyNo }).then(res => {
                  let payInfoVo = res.data.payInfoVo
                  payInfo.option1.data = payInfoVo.payInfoInvoices.map(item => {
                    item.invoicePayment.invoiceAmt = item.invoiceAmt
                    return item.invoicePayment
                  })
                  payInfo.delayInvoice = payInfoVo.delayInvoice
                  payInfo.delayInvoiceAmt = payInfoVo.delayInvoiceAmt
                })
                // option.data.splice($index, 1)
                this.$message({
                  message: this.$t('Settle.invoiceDel'),
                  type: 'success',
                  showClose: true
                })
              }
            })
          } else {
            option.data.splice($index, 1)
          }
        } else if (option.id === 'option8') {
          option.data.splice($index, 1)
        } else if(option.id === 'option6'){
          console.log(option.id);
          let deleteDzgData ={
            "applyNo": this.applyNo,
            "dzgPayBillNo": row.dzgPayBillNo,
            "internalFeeCode": row.internalFeeCode
          }
          deleteDzgInternalFee(deleteDzgData).then(res=>{
            this.getData()
            // option.data.splice($index, 1)
            // this.dzgFeeAmtChange()
            this.$message({
              message: this.$t('Settle.deleteSuc'),
              type: 'success',
              showClose: true
            })
          })
        }
      }).catch(() => {         
      })
    },
    sendMulti(data, option) {
      console.log(data, option)
      if (option === this.option2) this.multipleSelection2 = data
      if (option === this.option5) this.multipleSelection5 = data
      if(option === this.option2){
        if(data.length){
            this.getListAmtSummary(data)
        }else{
            this.getListAmtSummary(this.option2.data)
        }
      }
    },
    // 付款银行简称
    bankAccountList1(queryString, item, row, index) {
      // let payWay = row.payWay
      let payWay = this.payInfoList[index] && this.payInfoList[index].payWay
      let hasIntrabranch = 'no'
      if(payWay === 'intrabranch'){
        // hasIntrabranch ='yes'  
      }
      if(payWay === 'cash' || payWay === 'prepay_dedue' || payWay === 'intrabranch'){
        payWay = ""
      }
      let publicType = ''
      if(payWay === 'cash'){
        publicType ='prv'  
      }
      this.$store.dispatch('dict/bankAccountList', {"accountShortName":queryString, hasIntrabranch, publicType, "receipayType":"pay","currency":row.currency,"unitCode":row.payCompCode, "countryOrgType": '', "status": "effect"}).then(res => { // payCorpCode
        let list = res ? res : []
        // this.bankAccountSelectOptions1
        item.remoteSelectList = list.map(item => {
          item.value = item.settleUnitBankAcctId
          item.label = item.accountShortName
          return item
        })
        if (item.remoteSelectList.length === 1) {
          this.select1.change(item.remoteSelectList[0].value, item, row)
        }
      })
    },
    bankAccountList2(queryString, item, row, index) {
      let hasIntrabranch = 'no'
      let publicType = ''
      let payWay = ''
      if(this.payInfoList.length){
        if(this.applyNo){
          payWay = this.payInfoList[index-1].payWay
        }else{
          payWay = row.payWay
        }
      }
      console.log(row.payWay);
      if(payWay === 'intrabranch'){
        // hasIntrabranch ='yes'  
      }
      if(payWay === 'cash'){
        publicType ='prv'
      }
      this.$store.dispatch('dict/bankAccountList', {"accountNo": queryString, "currency":row.currency, hasIntrabranch,"receipayType":"receive", "unitCode":row.recvCorpCode, "countryOrgType": '', publicType, "status": "effect"}).then(res => {
        let list = res ? res : []
        // this.bankAccountSelectOptions2
        item.remoteSelectList = list.map(item => {
          item.value = item.settleUnitBankAcctId
          item.label = item.accountNo
          return item
        })
        if(item.remoteSelectList.length === 0){
          row.recvBankName = ''
          row.recvBankBranch = ''
          row.recvAccountNo = ''
          row.recvAccountName = ''
          row.compBankAccountId = ''
          row.recvBankAccountId = ''
          row.recvBankAddr = ''
          row.recvRegAddr = ''
          row.recvSwiftCode = ''
          row.recvAccountPublicType = ''
          item.recvIdNo = ''
          item.recvMobileNo = ''
        }
        // 如果是申请页面，只有一个银行账号，默认选中它；如果是详情页面，不默认选中
        if (!this.applyNo) {
          if (item.remoteSelectList.length === 1) {
            this.select2.change(item.remoteSelectList[0].value, item, row)
          }
        }
      })
    },
    //撤回付款审核
    handleWithdrawPayApplyAudit(){
      let data = {
        applyNoList:[this.payApplyDetailForm.applyNo]
      }
      this.$confirm(this.$t('Settle.reviewTips'), this.$t('Common.tips'), {
        confirmButtonText: this.$t('Common.sure'),
        cancelButtonText: this.$t('Common.cancel'),
        type: 'warning'
      }).then(() => {
        settleWithdrawPayApplyAudit(data).then(res=>{
          this.$message({message: this.$t('Settle.reviewSuc'), type: 'success'});
          this.getData()
        })
      })
    },
    internalFeeChange(item,index){
      if(item.payWay !== 'prepay_dedue' && (item.dzgFeeTaxRate ==='' || item.dzgFeeAmt === '' || item.dzgPayBillNo === '' || item.internalFeeCode ==='')){
        this.$refs['payForm' + index][0].clearValidate(['dzgFeeTaxRate','dzgFeeAmt','dzgPayBillNo','internalFeeCode'])
      }
    },
    dzgFeeAmtChange(val){
      let sum = 0
      if(this.option6.data.length){
        let arr = this.option6.data.map((keys) => keys.dzgFeeAmt)
        sum = arr.reduce((a, b) => Number(a) + Number(b), 0)
      }
      const applyPayAmts = Number(this.payInfoList[0].applyPayAmts)
      this.payInfoList[0].applyPayAmt = sum + applyPayAmts
    //   // parseFloat字符串加0防止首字输入字母成NaN
    //   let dzgFeeAmt = parseFloat("0"+ val)
    //   const applyPayAmts = Number(this.payInfoList[0].applyPayAmts)
    //   this.payInfoList[0].applyPayAmt = dzgFeeAmt + applyPayAmts
    },
    applyForPassOptionClose(){
      this.resultDialogOption.show = false
    },
    bankAccountList(val = '') {
      let hasIntrabranch = 'no'
      let publicType = ''
      let payWay = ''
      if(this.recvData.payWay){
        payWay = this.recvData.payWay
      }
      if(payWay === 'intrabranch'){
        // hasIntrabranch ='yes'  
      }
      if(payWay === 'cash'){
        publicType ='prv'  
      }
      let currency = this.payApplyDetailForm.currency
      let unitCode = this.payApplyDetailForm.recvCorpCode
      this.$store.dispatch('dict/bankAccountList', {"accountNo":val, currency, hasIntrabranch, "receipayType":"receive", unitCode, "countryOrgType": '', publicType, "status": "effect"}).then(res => {
        let list = res ? res : []
        this.recvAccountNoList = list.map(item => {
          item.value = item.settleUnitBankAcctId
          item.label = item.accountNo
          return item
        })
      })
    },
    // 申请附件操作
    receiveResFileList(list) {
      this.payApplyDetailForm.recvFinishsProveFileNo = list && list[0] && list[0].fileNo
      this.$forceUpdate()
      console.log(this.payApplyDetailForm.recvFinishsProveFileNo);
      // this.$refs.query.clearValidate(['recvFinishsProveFileNo'])
    },
    // 查看水单文件
    handleBankseqFileNo() {
      const href = `/base/fileView/preview/${this.payApplyDetailForm.recvFinishsProveFileNo}/sowoll`
      window.open(href)
    },
    handleDeleteFileNo() {
      this.$confirm(this.$t('Settle.attachmentTips'), this.$t('Common.attachment'), {
        confirmButtonText: this.$t('Common.sure'),
        cancelButtonText: this.$t('Common.cancel'),
        type: 'warning'
      })
        .then(() => {
          this.payApplyDetailForm.recvFinishsProveFileNo = ''
          this.$forceUpdate()
        })
        .catch(console.log)
    },
    recvAccountNoChange(val){
      let obj = this.recvAccountNoList.find(item => { 
        return item.settleUnitBankAcctId === val
      })
      if (obj) {
        this.recvData.recvBankName = obj.bankName
        this.recvData.recvBankBranch = obj.bankBranch
        this.recvData.recvAccountNo = obj.accountNo
        this.recvData.recvAccountName = obj.accountName
        this.recvData.compBankAccountId = obj.settleUnitBankAcctId
        this.recvData.recvBankAccountId = obj.settleUnitBankAcctId
        this.recvData.recvBankAddr = obj.bankAddr
        this.recvData.recvRegAddr = obj.regAddr
        this.recvData.recvSwiftCode = obj.swiftCode
        this.recvData.recvAccountPublicType = obj.publicType
      }
    },
    //代大掌柜付款按钮
    handleInternalFee(){
      // if(this.option6.data.length){
      //   return this.$msgErrClose('代大掌柜付款已录入,请勿重复录入')
      // }
      this.internalFeeData.list = []
      this.handleAddInternalFee()
      this.internalFeeData.show = true
    },
    internalFeeSubmit(){
      let data = this.internalFeeData.list
      console.log(data);
      this.$refs.internalFeeData.validate((valid) => {
        if (valid) {
          this.loadingInternalFeeSubmit = true
          saveDzgInternalFee(data).then(res=>{
            this.$msgSucClose(this.$t('FinBill.submitSuc'))
            this.getData()
            // if(res.data && res.data.length){
            //   res.data.forEach(item=>{
            //     this.option6.data.push(item)
            //   })
            // }
            // this.dzgFeeAmtChange()
            this.internalFeeData.show = false
          }).finally(()=>{
            this.loadingInternalFeeSubmit = false
          })
        }
      })
      
    },
    handleInternalFeeCancel(){
      this.internalFeeData.show = false
      this.payInfoList[0].applyPayAmt = this.payInfoList[0].applyPayAmts
      this.$refs.internalFeeData.clearValidate()
    },
    identifyElecInvoice(item, index) {
      if (this.applyNo) {
        if (this.payApplyDetailForm.needRelationInvoiceAmt === 0) {
          return this.$message({  message: this.$t('Settle.applyNoTips') + this.payApplyDetailForm.applyNo + this.$t('Settle.depositTips'),  type: 'error',  showClose: true })
        }
      } else {
        for (let i = 0; i < this.payInfoList.length; i++) {
          if (this.payInfoList[i].canInvoiceAmt === 0) {
            return this.$message({  message: this.$t('Settle.canInvoiceAmtTips'), type: 'error', showClose: true })
          }
        }
        this.payInfo = item // 结算付款申请的一个
        this.payCurrency = item.currency
      }
      let payApplySettleNoList = this.applyNo ? [this.payApplyDetailForm.applyNo] : []
      let query = {
        payApplySettleNoList,
        currency: item.currency,
        supplierCorpName: item.recvCorpName,
        supplierCorpCode: item.recvCorpCode,
        settleCompCode: item.payCompCode,
        recvAccountNo: item.option0.data[0].recvAccountNo,
        recvBankAccountId: item.option0.data[0].recvBankAccountId,
        from: this.$route.name, // 'SettlementPayApply',
        // ...this.$route.query
      }
      this.routerPush('IdentifyElecInvoice', query)
    },
    //发票登记
    addInvoice(item, index) {
      if(this.applyNo){
        if(this.payApplyDetailForm.needRelationInvoiceAmt === 0){
          return this.$message({  message: this.$t('Settle.applyNoTips')+this.payApplyDetailForm.applyNo+this.$t('Settle.depositTips'),  type: 'error',  showClose: true })
        }
      }else{
        for (let i = 0; i < this.payInfoList.length; i++) {
          if(this.payInfoList[i].canInvoiceAmt === 0){
            return this.$message({  message: this.$t('Settle.canInvoiceAmtTips'), type: 'error', showClose: true })
          }
        }
      }
      //生成reqid
      this.req = randomString() + "settlementPayApply"
      this.index = index
      let isInvoiceNo = item.option1.data.map(subItem => {
        return subItem.invoiceNo
      })
      let payApplySettleNoList = this.applyNo ? [this.payApplyDetailForm.applyNo] : []
      let query = {
        titleName: this.$t('Settle.addInvoice'),
        name:'SettleList',
        currency: item.currency,
        amt: item.delayInvoiceAmt,
        supplierCorpName: item.recvCorpName,
        supplierCorpCode: item.recvCorpCode,
        recvAccountNo: item.option0.data[0].recvAccountNo,
        payApplySettleNoList,
        isRepeatInvoiceNo: this.isRepeat(isInvoiceNo),
        req: !this.applyNo ? this.req : '',
        settleCompCode: item.payCompCode,
        recvBankAccountId: item.option0.data[0].recvBankAccountId,
      }
      console.log(query);
      this.routerPush('InvoicePaymentListReg', query)
    },
    isRepeat(arr){
      var hash = {};
      for(var i in arr) {
        if(hash[arr[i]]){
          return true;
        }
          hash[arr[i]] = true;
      }
      return false;
    },
    handleAddInternalFee(){
      let data ={
        show: true,
        applyNo:this.applyNo,
        dzgPayBillNo:"",
        internalFeeCode:"",
        dzgFeeTaxRate:"",
        dzgFeeAmt:"",
      }
      this.internalFeeData.list.push(data)
    },
    handleDeleteInternalFee(index){
      this.internalFeeData.list.splice(index,1)
    },
    //排序
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
        this.option3.data = this.option3.data.sort((a, b) => {
          return isNum ? b[prop] - a[prop] : b[prop] > a[prop] ? 1 : -1
        })
      } else if (order === 'ascending') {
        this.option3.data = this.option3.data.sort((a, b) => {
          return isNum ? a[prop] - b[prop] : a[prop] > b[prop] ? 1 : -1
        })
      }
    },
    detailFeeSearch(list) {
      console.log(list.map((item) => item.invisible))
      this.option3.data = [...list]
      this.settleGather()
    },
  },
  computed: {
    isApproved() {
      return this.payApplyDetailForm.status !== 'pending' && this.payApplyDetailForm.status !== 'approving' && this.applyNo
    },
    isStatus() {
      return !(this.payApplyDetailForm.confirmStatus ==='pass' && this.payApplyDetailForm.status !== 'paying' && this.payApplyDetailForm.status !== 'pay_done') && this.applyNo
    },
    blackType() {
      let obj = this.settleUnitList.find(item => item.unitCode === this.payApplyDetailForm.recvCorpCode)
      let title = ''
      if (obj && obj.hasBlack) {
        if (obj.hasCustBlack === 'yes') {
          title =  this.$t('Common.customer')
        } 
        if (obj.hasSupplierBlack === 'yes') {
          title = title ? `${title}, ${this.$t('Common.suppliers')}` : this.$t('Common.suppliers')
        }
      }
      return title
    },
    ... mapGetters(['dictMap'])
  },
  watch: {
    'refuseDialogShow'(val){
      if(val){
        this.payApplyDetailForm.auditOpinion = this.refuseForm.refuseReason = ''
      }
    },
    'resultDialogOption.show'(val){
      if(val){
        this.payApplyDetailForm.auditOpinion = this.refuseForm.refuseReason = ''
      }
    },
    isApproved:{
      handler(val){
        if(this.option6.operationBtns){
          this.option6.operationBtns.show = !val
        }
      },
      immediate: true
    },
    relevanceOpne(newVal) {
      if (newVal) {
        this.getInvoiceList()
      }
    },
    payInfoList: {
      handler(newVal, oldVal) {
        // 提交前由本地计算后补票金额
        if (!this.applyNo && newVal && newVal.length) {
          newVal.forEach(item => {
            if (item.option1.data && item.option1.data.length) {
              let remainingAmountTotal = item.option1.data.reduce((total, curr) => {
                curr.remainingAmount = curr.amt - curr.writeoffAmt - curr.lockAmt
                total += Number(curr.remainingAmount)
                if (total <= item.canInvoiceAmt) { // 不够的项的关联金额
                  curr.relevanceAmt = decimalFixed2(curr.remainingAmount)
                } else { // 刚好够的那一项的关联金额
                  curr.relevanceAmt = total - Number(curr.remainingAmount) < item.canInvoiceAmt ? decimalFixed2(item.canInvoiceAmt - (total - Number(curr.remainingAmount))) : 0
                }
                return total
              }, 0)
              let delayInvoiceAmt = decimalFixed2(item.canInvoiceAmt - remainingAmountTotal)
              item.delayInvoiceAmt = delayInvoiceAmt < 0 ? 0 : delayInvoiceAmt
              if (item.delayInvoiceAmt > 0) {
                item.delayInvoice = 'yes'
              } else {
                item.delayInvoice = 'no'
              }
            } else {
              item.delayInvoiceAmt = item.canInvoiceAmt
              item.delayInvoice = 'yes'
            }
          })
        }
      },
      deep: true
    }
    // 'invoicePaymentList': {
    //   handler(newVal, oldVal) {
    //     if (newVal && newVal.length === 0 ) {
    //       return
    //     }
    //     clearTimeout(this.timer1)
    //     this.timer1 = setTimeout(() => {
    //       this.invoicePaymentList.forEach(item => {
    //         if(item.payAccountShortName){return}
    //         this.$store.dispatch('dict/bankAccountList', { "currency":item.currency,"unitCode":item.payCorpCode}  ).then(res => {
    //           let payBank = res.length ? {
    //             payAccountShortName : res[0].accountShortName,
    //             payBankName : res[0].bankName,
    //             payAccountNo : res[0].accountNo,
    //             payAccountName : res[0].accountName,
    //             payCompName : res[0].unitName,
    //             payBankBranch : res[0].bankBranch,
    //             payBankCode : res[0].bankCode,
    //             payBankAccountId : res[0].settleUnitBankAcctId,
    //           } : {}
    //           Object.assign(item,{},payBank)
    //         })
    //       })
    //     }, 500)
    //   },
    //   deep: true
    // }
  }
}
</script>
<style lang="scss" scoped>
/deep/ .detail__div{
  width: 33% !important;
  margin-right: 0;
  .detail__label{
    width: 208px; // 200px;
  }
}
/* .settlement-pay-apply-detail{
  padding:10px 
} */
// .finance-detail-page{
//   background: #FFF;
// }
// .money-box-border-bottom{
//   border-bottom: 1px solid #E9E9E9;;
// }
.detail-info-other{
  margin-bottom: 0;
  padding: 14px 8px 0px;
  display: flex;
}
.detail-info-item{
  width: 210px;
  margin-right: 10px;
  margin-bottom: 0;
}
.detail-info-item-label{
  display: inline-block;
  line-height: 14px;
  margin-top: 3px;
}
.detail-info-item-content{
  display: inline-block;
  vertical-align: top;
  width: 114px;
  line-height: 14px;
  margin-top: 3px;
  word-wrap: break-word;
}
.settlement-detail-form .el-form-item {
  width: 33% ;
  /* margin-bottom: 7px; */
  margin-right: 0;
}
.detail-info-other .el-form-item {
  /* margin-bottom: 7px; */
}
.el-form-item-text{
  font-size: 12px;
  word-wrap:break-word;
}
.detail-info-item-1{
  display: block;
  margin-bottom: -6px;
  margin-right: 16px;
}
.settlement-detail-form-1{
  padding-bottom:6px;
  border-bottom: 1px solid #E9E9E9 !important;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
 .el-form-item, .detail__div{
    width: 33% !important;
    margin-right: 0;
  }
  /deep/.flex-item{
    width: 100% !important;
    display: flex;
    .el-form-item__content{
      flex: 1;
    }
    .el-select,.el-input{
      width: 100% !important;
    }
  }
}
.red-lable{
  /deep/.detail__label{
    color: #E63923;
  }
}
.order-box{
  margin: 12px 0;
}
.settlement-exchange-rates{
  display:inline-block;
  margin-right: 24px;
  vertical-align: top;
}
.settlement-exchange-rates .settlement-exchange-rates-title{
color: #222222;
line-height: 28px;
}
.settlement-pay-apply-detail .el-textarea{
  width: 100%;
}
.settlement-pay-apply-detail .money-title-1{
  font-size: 12px;
  color: #222222;
  line-height: 14px;
  padding-top: 8px;
  margin-right: 20px;
}
.settlement-pay-apply-detail .size-12{
  font-size: 12px;
}
.settlement-detail-form .el-form-item-invoice-remark {
  width: calc(100% - 2px);
}
.pass_dialog_form ::v-deep {
  .el-form-item {
    width: 50%;
    margin-right: 0;
  }
  .el-form-item__content{
    width: calc(100% - 150px);
  }
  .form_full{
    width: 100%;
  }
}
.settlement-detail-form{
  padding-bottom: 0;
  .settlement-detail-form-remark{
  /deep/.el-form-item{
    width: 100%;
    display: flex;
    margin-right: 0;
    .el-form-item__content{
      flex: 1;
      height: auto;
    }
  }
}
}
.finance-table-container + .finance-table-container{
  margin-top: 14px !important;
}
</style>
<style lang="scss">
.settlement-pay-apply-detail .detail-info-item{
  width: 206px;
  margin-right: 10px;
  margin-bottom: 0;
}
// .invoice-preview-print .el-dialog__body {
//   padding-bottom: 20px;
// }
// .invoice-preview-print .el-dialog__footer {
//   padding-bottom: 32px;
//   padding-right: 60px;
// }
.el-form-item-payapply-remark {
  width: 100%;
  padding: 0 30px;
}
.el-form-item-payapply-remark .el-form-item__content {
  width: calc(100% - 95px);
}
.app-wrapper .finance-page .el-form-item-payapply-remark textarea {
  min-height: 75px !important;
}
.settlement-detail-form .el-form-item.settlement-pay-apply-remark {
  width: calc(100% - 2px);
}
.settlement-detail-form .el-form-item.settlement-pay-apply-remark .el-form-item__content {
  width: calc(100% - 200px);
}
// .settlement-detail-form-remark{
//   margin-left:30px;
//   .el-form-item-invoice-remark {
//     width: calc(100% - 10px);
//     display: flex;
//     .el-form-item__content {
//       flex: 1;
//     }
//  }
// }
.result__container_p{
  margin-top:12px;
}
.check-box{
  border-radius: 4px;
  border: 1px solid #E9E9E9;
  margin: 4px 14px 18px;
  .title{
    padding:0 8px;
    border-radius: 4px 0px;
    background: #F8F9FD;
    line-height: 30px;
    font-weight: 600;
    color: #222222;
  }
}
.el-input__prefix{
  line-height: 20px;
}
</style>
