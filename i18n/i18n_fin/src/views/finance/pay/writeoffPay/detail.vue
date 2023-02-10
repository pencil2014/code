<template>
  <div class="finance-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div> <!-- class="finance-list-container" -->
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">{{$t('PayApplyList.writeOff')+$t('OrderFee.enspace')+$t('OrderFee.detail')}}</div>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button v-if="checkAuth($route.name, 'btn-afreshWriteoff')" @click="afreshWriteoff" class="finance-btn" type="success" size="mini">{{$t('PayApplyList.ReWriteoff')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button v-if="checkAuth($route.name, 'btn-writeoffRollback')" @click="handleApplyFor" class="finance-btn" type="warning" size="mini">{{$t('PayApplyList.antiWriteoff')}}</el-button>
          </el-button-group>
          <el-button-group v-if="voucherNos && checkAuth($route.name, 'btn-delVoucher')">
            <el-button @click="delVoucher" class="finance-btn" size="mini" type="danger">{{$t('PayApplyList.delInterVoucher')}}</el-button>
          </el-button-group>
          <!-- <el-button-group v-if="!writeoffPay.voucherNo && checkAuth($route.name, 'btn-batchPrintCreate')"> -->
          <el-button-group v-if="!voucherNos && checkAuth($route.name, 'btn-batchPrintCreate')">
            <el-button @click="batchPrintCreate2(true)" class="finance-btn" size="mini" type="inner">{{$t('PayApplyList.prevInterVoucher')}}</el-button>
          </el-button-group>
          <!-- <el-button-group v-if="!writeoffPay.voucherNo && checkAuth($route.name, 'btn-voucherNo')"> -->
          <el-button-group v-if="!voucherNos && checkAuth($route.name, 'btn-voucherNo')">
            <el-button @click="batchPrintCreate2(false)" class="finance-btn" size="mini" type="inner">{{$t('PayApplyList.geneInterVoucher')}}</el-button>
          </el-button-group>
          <el-button-group v-if="exVoucherNos && checkAuth($route.name, 'btn-delVoucher')">
            <el-button @click="delVoucher2" class="finance-btn" size="mini" type="danger">{{$t('PayApplyList.delExterVoucher')}}</el-button>
          </el-button-group>
          <!-- <el-button-group v-if="!writeoffPay.voucherNo && checkAuth($route.name, 'btn-batchPrintCreate')"> -->
          <el-button-group v-if="!exVoucherNos && checkAuth($route.name, 'btn-batchPrintCreate')">
            <el-button @click="batchPrintCreate2(true, true)" class="finance-btn" size="mini" type="outer">{{$t('PayApplyList.prevExterVoucher')}}</el-button>
          </el-button-group>
          <!-- <el-button-group v-if="!writeoffPay.voucherNo && checkAuth($route.name, 'btn-voucherNo')"> -->
          <el-button-group v-if="!exVoucherNos && checkAuth($route.name, 'btn-voucherNo')">
            <el-button @click="batchPrintCreate2(false, true)" class="finance-btn" size="mini" type="outer">{{$t('PayApplyList.geneExterVoucher')}}</el-button>
          </el-button-group>
          <el-button-group v-if="checkAuth($route.name, 'btn-voucherAll')">
            <el-button class="finance-btn" @click="previewAll" size="mini" type="primary">{{$t('PayApplyList.prevAllVoucher')}}</el-button><!-- 查看全部关联凭证 -->
          </el-button-group>
          <el-button-group v-if="checkAuth($route.name, 'btn-writeoff')">
            <el-button @click="writeoff" class="finance-btn" size="mini">{{$t('PayApplyList.confirmReview')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button @click="cancel" class="finance-btn" size="mini">{{$t('Common.back')}}</el-button>
          </el-button-group>
        </div>
      </div>
      <!-- <div class="payInfo-box" :style="screenHeight"> -->
      <div class="payInfo-box" style="height: calc(100vh - 95px);">
        <div class="item-box">
          <div class="title">{{$t('Charge.writeoffInfo')}}</div>
          <div class="info-box" >
            <DetailDiv :label="$t('Settle.branchCompany')" :content="payInfo.payCompName" isTooltip />
            <DetailDiv :label="$t('Hedge.writeoffNo')" :content="writeoffPay.writeoffReceipayNo" isBold/>
            <DetailDiv :label="$t('FeeList.settleCorp')" :content="payInfo.recvCorpName" isTooltip isBold/>
            <DetailDiv :label="$t('PayApplyList.payAccountShortName')" :content="payInfo.payAccountShortName" isTooltip/>
            <DetailDiv :label="$t('Settle.paymentCurrency')" :content="payOrder.currency" isBold/>
            <DetailDiv :label="$t('PayApplyList.payAmt')" :content="payOrder.applyAmt" isBold/>
            <DetailDiv :label="$t('PayApplyList.payTime')" :content="payOrder.payTime"/><!-- payOrder.confirmTime -->
            <div class="detail__div" style="width:262px;">
              <span class="detail__label" style="width:100px;">
                {{$t('PayApplyList.bankSlip')}}: 
              </span><!-- 水单附件 -->
              <div class="el-tooltip detail__content">
                <el-button
                  v-if="payOrder.bankseqFileNo"
                  @click="handleBankseqFileNo"
                  size="mini"
                  type="text"
                  >{{$t('Settle.clickView')}}</el-button
                >
                <div
                  style="width: 147px; display: inline-block; font-size: 12px"
                  v-if="!payOrder.bankseqFileNo"
                >
                  {{$t('Common.none')}}
                </div>
              </div>
            </div>
            <div class="detail__div" style="width:262px;">
              <span class="detail__label" style="width:100px;">
                {{$t('Collect.bankFlowNumber')}}: 
              </span>
              <div class="el-tooltip detail__content">
                {{payOrder.bankSeqNo}}
              </div>
            </div>

            <!-- <DetailDiv label="付款单号：" :content="payOrder.payOrderNo" />
            <DetailDiv label="付款类型：" :content="dictMapObj.payOrderType[payOrder.orderType]" />
            <DetailDiv label="申请单号：" :content="payOrder.sourceApplyNo" isTooltip/>
            <DetailDiv label="受理状态：" >
              <span v-if="payOrder.confirmStatus == 'pass'" style='color:#33B18A;'><i class="el-icon-success"></i> 已受理</span>
              <span v-else>未受理</span>
            </DetailDiv>
            <DetailDiv label="付款方式：" :content="dictMapObj.payWay[payOrder.payWay]" isBold />
            <DetailDiv :label="$t('Settle.paymentCurrency')" :content="payOrder.currency" isBold/>
            <DetailDiv :label="$t('PayApplyList.payAmt')" :content="payOrder.applyAmt" isBold/>
            <DetailDiv label="付款单状态：" >
              <span v-if="payOrder.payStatus == 'pay_done'" style='color:#33B18A;'><i class="el-icon-success"></i> 已支付</span>
              <span v-else>{{dictMapObj.payStatusType[payOrder.payStatus]}}</span>
            </DetailDiv>
            <DetailDiv label="付款人：" :content="payOrder.confirmName" />
            <DetailDiv :label="$t('PayApplyList.payTime')" :content="payOrder.payTime" isBold/>
            <DetailDiv label="收款银行：" :content="payInfo.recvBankName" isTooltip />
            <DetailDiv label="收款账户名：" :content="payInfo.recvAccountName" isTooltip />
            <DetailDiv :label="$t('Settle.recvAccountNo')" :content="payInfo.recvAccountNo" isTooltip />
            <DetailDiv :label="$t('PayApplyList.payAccountShortName')" :content="payInfo.payAccountShortName" isTooltip isBold/>
            <DetailDiv v-if="payOrder.payWay==='hk_china'&&payInfo.transferFeeDeductWay" label="手续费扣款方式：" :content="dictMapObj.transferFeeDeductWay[payInfo.transferFeeDeductWay]" />
            <DetailDiv label="付款账户名：" :content="payInfo.payAccountName" isTooltip />
            <DetailDiv label="付款账号：" :content="payInfo.payAccountNo" isTooltip />
            <DetailDiv :label="$t('Settle.branchCompany')" :content="payInfo.payCompName" isTooltip />
            <DetailDiv label="创建人：" :content="payOrder.createdName" />
            <DetailDiv label="创建时间：" :content="payOrder.createdTime" />
            <DetailDiv :label="$t('FeeList.settleCorp')" :content="payInfo.recvCorpName" isTooltip isBold/>
            <DetailDiv label="账户结算方式：" :content="dictMapObj.bankAccountSettleMode[payOrder.settleMode]" /> -->
          </div>
          <!-- <FinanceTableMass v-if="option11.data.length" :option="option11" /> -->
        </div>
        <div class="item-box">
          <!-- <div class="title">核销信息</div> -->
          <div class="info-box">
            <DetailDiv :label="$t('Charge.underwritSubtypes')" :content=" dictMapObj['writeoffSubType'][writeoffPay.writeoffSubType]" />
            <DetailDiv :label="$t('Collect.writeoffCurrency')" :content="writeoffPay.currency" />
            <DetailDiv :label="$t('Charge.writeoffAmt')" :content="writeoffPay.totalWirteoffAmt" />
            <DetailDiv :label="$t('PayApplyList.realPayAmt')" :content="payOrder.realPayAmt" />
            <DetailDiv :label="$t('PayApplyList.lessPayAmt')" :content="payOrder.lessPayAmt" />
            <DetailDiv :label="$t('PayApplyList.lessPaySubject')" :content="renderPropLabel('lessPayDealway', payOrder.lessPayDealway)" />
            <!-- <div class="detail__div" style="width:262px;">
              <span class="detail__label" style="width:100px;">
                少付金额：
              </span>
              <div class="el-tooltip detail__content">
                {{payOrder.lessPayAmt}}
              </div>
            </div> -->
            <!-- <div class="detail__div" style="width:262px;">
              <span class="detail__label" style="width:100px;">
                少付科目：
              </span>
              <div class="el-tooltip detail__content">
                {{renderPropLabel('lessPayDealway', payOrder.lessPayDealway)}}
              </div>
            </div> -->
            <DetailDiv :label="$t('Hedge.writeoffs')" :content="writeoffPay.writeoffName" />
            <DetailDiv :label="$t('Hedge.internalVoucherNo')" isSlot isBold>
              <MultiBtn :btnStr="voucherNos||''" @generate="batchPrintCreate" />
            </DetailDiv>
            <DetailDiv :label="$t('Hedge.externalVoucherNo')" isSlot isBold>
              <MultiBtn :isEx="true" :btnStr="exVoucherNos||''" @generate="batchPrintCreate2($event, true)" />
            </DetailDiv>
            <DetailDiv :label="$t('Hedge.reviewStatus')" :content="renderPropLabel('writeoffRecheckStatus', writeoffPay.recheckStatus)" :isIcon="writeoffPay.recheckStatus==='no_check'?true:false" />
            <DetailDiv :label="$t('Hedge.reviewer')" :content="writeoffPay.recheckName" />
            <DetailDiv :label="$t('PayApplyList.recheckTime')" :content="writeoffPay.recheckTime" /><!-- 复核日期 -->
            <div class="base-item flex-item">
              <template v-if="showchangeWriteoffTime">
                <span class="sub-title">{{$t('PayApplyList.writeoffDate')}}: </span>
                <el-date-picker
                  :placeholder="$t('Common.plSelect')"
                  size="mini"
                  style="width: 130px"
                  type="date"
                  v-model="writeoffPay.writeoffDate"
                  value-format="yyyy-MM-dd"
                ></el-date-picker>
                <el-button-group>
                  <el-button @click="saveWriteoffTime" size="mini" type="text">{{$t('Common.save')}}</el-button>
                  <el-button @click="showchangeWriteoffTime = false" size="mini" type="text">{{$t('Common.cancel')}}</el-button>
                </el-button-group>
              </template>
              <template v-else>
                <span class="sub-title" style="padding-right:4px;">{{$t('FeeList.writeOffDate')}}: </span>
                {{ writeoffPay.writeoffDate || writeoffPay.writeoffTime }}
                <el-button @click="showchangeWriteoffTime = true" size="mini" type="text">{{$t('Common.modify')}}</el-button>
              </template>
            </div>
            <div  class="settlement-exchange-rates"
              v-if="settleExRateSummarys.length"
            >
              <span class="settlement-exchange-rates-title">{{$t('Settle.settleExRate')}}: </span>
              <span>{{settleExRateSummarys[0].originalCurrency +'-'+ settleExRateSummarys[0].settleCurrency + ' '+ settleExRateSummarys[0].settleExRate}}</span>
              <el-button type="text" size="mini"  @click="showRateDialog(false)"  v-show="settleExRateSummarys.length > 1">{{$t('Collect.moreRates')}}</el-button>
            </div>
            <div  class="settlement-exchange-rates"
              v-if="settleExRateSummarys.length"
            >
              <span class="settlement-exchange-rates-title"  v-if="writeoffExRateSummarys[0]">{{$t('PayApplyList.writeoffExRate')}}: </span>
              <span>{{writeoffExRateSummarys[0].originalCurrency +'-'+ writeoffExRateSummarys[0].settleCurrency + ' '+ writeoffExRate}}</span>
              <el-button type="text" size="mini"  @click="showRateDialog(true)" v-show="writeoffExRateSummarys.length > 1">{{$t('Collect.moreRates')}}</el-button>
            </div>
            <div class="base-item flex-item">
              <span class="sub-title" style="padding-right:4px;">{{$t('Collect.wfRemarks')}}: </span>
              <el-input
                :placeholder="$t('Common.plEnter')"
                size="mini"
                :maxlength="500"
                show-word-limit
                type="textarea"
                :autosize="true"
                v-model="writeoffPay.remark"
              ></el-input>
              <el-button
                @click="updateRemark"
                style="margin-left: 10px"
                size="mini"
                type="primary"
              >{{$t('PreClose.savewritenote')}}</el-button>
            </div>
            <!-- <DetailDiv :label="$t('Hedge.writeoffNo')" :content="writeoffPay.writeoffReceipayNo" isBold/>
            <DetailDiv label="核销类型：" :content=" dictMapObj['writeoffSubType'][writeoffPay.writeoffSubType]" />
            <DetailDiv :label="$t('Hedge.writeoffs')" :content="writeoffPay.writeoffName" />
            <DetailDiv :label="$t('Collect.writeoffCurrency')" :content="writeoffPay.currency" />
            <DetailDiv :label="$t('Charge.writeoffAmt')" :content="writeoffPay.totalWirteoffAmt" />
            <DetailDiv label="结算币种：" :content="writeoffPay.currency" />
            <div  class="settlement-exchange-rates"
              v-if="settleExRateSummarys.length"
            >
              <span class="settlement-exchange-rates-title">结算汇率：</span>
              <span>{{settleExRateSummarys[0].originalCurrency +'-'+ settleExRateSummarys[0].settleCurrency + ' '+ settleExRateSummarys[0].settleExRate}}</span>
              <el-button type="text" size="mini"  @click="showRateDialog(false)"  v-show="settleExRateSummarys.length > 1">{{$t('Collect.moreRates')}}</el-button>
            </div>
            <div  class="settlement-exchange-rates"
              v-if="settleExRateSummarys.length"
            >
              <span class="settlement-exchange-rates-title"  v-if="writeoffExRateSummarys[0]">核销汇率：</span>
              <span>{{writeoffExRateSummarys[0].originalCurrency +'-'+ writeoffExRateSummarys[0].settleCurrency + ' '+ writeoffExRate}}</span>
              <el-button type="text" size="mini"  @click="showRateDialog(true)" v-show="writeoffExRateSummarys.length > 1">{{$t('Collect.moreRates')}}</el-button>
            </div>
            <div class="base-item flex-item">
              <span class="sub-title">{{$t('Collect.wfRemarks')}}: </span>
              <el-input
                :placeholder="$t('Common.plEnter')"
                size="mini"
                :maxlength="500"
                show-word-limit
                type="textarea"
                :autosize="true"
                v-model="writeoffPay.remark"
              ></el-input>
              <el-button
                @click="updateRemark"
                style="margin-left: 10px"
                size="mini"
                type="primary"
              >{{$t('PreClose.savewritenote')}}</el-button>
            </div>
            <div class="base-item flex-item">
              <template v-if="showchangeWriteoffTime">
                <span class="sub-title">核销时间：</span>
                <el-date-picker
                  :placeholder="$t('Common.plSelect')"
                  size="mini"
                  style="width: 130px"
                  type="date"
                  v-model="writeoffPay.writeoffDate"
                  value-format="yyyy-MM-dd"
                ></el-date-picker>
                <el-button-group>
                  <el-button @click="saveWriteoffTime" size="mini" type="text">{{$t('Common.save')}}</el-button>
                  <el-button @click="showchangeWriteoffTime = false" size="mini" type="text">{{$t('Common.cancel')}}</el-button>
                </el-button-group>
              </template>
              <template v-else>
                <span class="sub-title">核销时间：</span>
                {{ writeoffPay.writeoffDate || writeoffPay.writeoffTime }}
                <el-button @click="showchangeWriteoffTime = true" size="mini" type="text">{{$t('Common.modify')}}</el-button>
              </template>
            </div> -->
          </div>
        </div>
        <template v-if="payOrder.orderType === 'prepay_to_repay'">
          <div class="table-box">
            <div class="title-box">
              <div class="title">{{$t('PayApplyList.prepayDeduct')}}</div>
              <div class="btn"></div>
            </div>
            <div class="bill-box">
              <span>{{$t('Settle.paymentCurrency')}}: {{ payOrder.currency }}</span>
              <span>{{$t('Settle.applyPayAmt')}}: {{ payOrder.applyAmt }}</span>
              <span>{{$t('Settle.payWay')}}: {{ dictMapObj.payWay[payOrder.payWay] }}</span>
              <template v-if="prepayAccount.length">
                <span class="currency" style="flex-basis:380px;">
                  {{$t('Settle.prepaySum')}}：
                  <label
                    :key="item.currency"
                    v-for="item in prepayAccount"
                  >{{ item.currency }} {{ item.balance }}</label>
                </span>
              </template>
              <template v-else>
                <span style="flex-basis:380px;">{{$t('Settle.prepaySum')}}：0</span>
              </template>
            </div>
            <FinanceTable :option="option7" />
          </div>
        </template>
        <div class="table-box">
          <div class="title-box">
            <div class="title">{{$t('PayApplyList.payApply')}}</div>
            <div class="btn">
              <!-- <el-button type="default" @click="addFee">添加手续费</el-button> -->
              <div @click="toggleTable(5)" class="toggle">
                {{ showTable[5] ? $t('Common.collapse') : $t('Common.expand')}}
                <i :class="[ showTable[5] ? `el-icon-arrow-up` : `el-icon-arrow-down`]"></i>
              </div>
            </div>
          </div>
          <FinanceTableMass style="margin-top:6px" :option="option11" v-show="showTable[5]" /><!-- v-if="option11.data.length" -->
        </div>
        <!-- <div class="item-box">
          <div class="title">转账信息</div>
          <el-form
            :inline="true"
            :model="payOrder"
            :rules="payOrderRules"
            label-width="90px"
            ref="query"
          >
            <el-form-item :label="'水单附件:'" prop="bankseqFileNo">
              <template>
                <el-button
                  @click="handleBankseqFileNo"
                  size="mini"
                  type="text"
                  v-if="payOrder.bankseqFileNo"
                >{{$t('Settle.clickView')}}</el-button>
                <div
                  style="width: 147px; display: inline-block; font-size: 12px"
                  v-if="!payOrder.bankseqFileNo"
                >无</div>
              </template>
            </el-form-item>

            <el-form-item label="银行流水号:" prop="bankSeqNo">
              <el-input disabled size="mini" v-model="payOrder.bankSeqNo"></el-input>
            </el-form-item>
            <el-form-item label="付款时间:" prop="payTime">
              <el-date-picker
                align="right"
                disabled
                :placeholder="$t('Common.plSelect')"
                type="date"
                v-model="payOrder.payTime"
                value-format="yyyy-MM-dd"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="实付金额:" prop="realPayAmt">
              <el-input disabled v-model="payOrder.realPayAmt"></el-input>
            </el-form-item>
            <template
              v-if="
                payOrder.realPayAmt - allTransferFeeList < payOrder.applyAmt
              "
            >
              <el-form-item label="我司少付金额:" prop="lessPayAmt">
                <el-input disabled v-model="payOrder.lessPayAmt"></el-input>
              </el-form-item>
              <el-form-item label="少付处理科目:" prop="lessPayDealway">
                <el-select disabled placeholder v-model="payOrder.lessPayDealway">
                  <el-option
                    :key="key"
                    :label="o.label"
                    :value="o.value"
                    v-for="(o, key) in dictMap['lessPayDealway']"
                  ></el-option>
                </el-select>
              </el-form-item>
            </template>
            <template
              v-if="
                payOrder.realPayAmt - allTransferFeeList > payOrder.applyAmt
              "
            >
              <el-form-item label="我司多付金额:" prop="greatPayAmt">
                <el-input disabled v-model="payOrder.greatPayAmt"></el-input>
              </el-form-item>
              <el-form-item label="多付处理科目:" prop="greatPayDealway">
                <el-select disabled placeholder v-model="payOrder.greatPayDealway">
                  <el-option
                    :key="key"
                    :label="o.label"
                    :value="o.value"
                    v-for="(o, key) in dictMap['greatPayDealway']"
                  ></el-option>
                </el-select>
              </el-form-item>
            </template>

            <el-form-item class="remark" label="转账说明:" prop="remark">
              <el-input
                :maxlength="500"
                disabled
                show-word-limit
                type="textarea"
                v-model="payOrder.remark"
              ></el-input>
            </el-form-item>
          </el-form>
        </div> -->
        <template v-if="option5.data">
          <div class="table-box" v-show="option5.data.length">
            <div class="title-box">
              <div class="title">{{$t('PayApplyList.buyExchangeInfo')}}</div>
              <div class="btn">
                <div @click="toggleTable(3)" class="toggle">
                  <template v-if="showTable[3]">
                    {{$t('Common.collapse')}}
                    <i :class="[`el-icon-arrow-up`]"></i>
                  </template>
                  <template v-else>
                    {{$t('Common.expand')}}
                    <i :class="[`el-icon-arrow-down`]"></i>
                  </template>
                </div>
              </div>
            </div>
            <FinanceTable style="margin-top:6px" :option="option5" v-show="showTable[3]" />
          </div>
        </template>
        <!-- 海外版不显示
        <div class="table-box">
          <div class="title-box">
            <div class="title">开票信息</div>
            <div class="btn">
              <div @click="toggleTable(1)" class="toggle">
                {{showTable[1]? $t('Common.collapse'):$t('Common.expand')}}
                <i :class="[ showTable[1] ? `el-icon-arrow-up` : `el-icon-arrow-down`]"></i>
              </div>
            </div>
          </div>
          <div class="bill-box">
            <DetailDiv label="关联发票状态：" >
              <span v-if="payOrder.hasInvoice === 'no'" style='color:#CD4130;'><i class="el-icon-info"></i> 未开票</span>
              <span v-if="payOrder.hasInvoice === 'yes'" style='color:#33B18A;'><i class="el-icon-success"></i> 已开票</span>
              <span v-if="payOrder.hasInvoice === 'part'">部分开票</span>
            </DetailDiv>
            <DetailDiv label="是否后补票：" >
              <span v-if="payOrder.delayInvoice === 'no'" style='color:#CD4130;'>{{$t('Common.no')}}</span>
              <span v-else style='color:#33B18A;'>{{$t('Common.yes')}}</span>
            </DetailDiv>
            <DetailDiv :label="$t('Collect.writeoffCurrency')" :content="payOrder.delayInvoiceAmt" />
          </div>
          <FinanceTable :option="option2" v-show="showTable[1]" />
        </div> -->
        <!-- 大掌柜核销信息 -->
        <!-- <div class="table-box" v-show="option9.data.length">
          <div class="title-box">
            <div class="title">大掌柜核销信息</div>
            <div class="btn">
              <div @click="toggleTable(4)" class="toggle">
                <template v-if="showTable[4]">
                  收起
                  <i :class="[`el-icon-arrow-up`]"></i>
                </template>
                <template v-else>
                  展开
                  <i :class="[`el-icon-arrow-down`]"></i>
                </template>
              </div>
            </div>
          </div>

          <FinanceTableMass style="margin-top:6px" :option="option9" v-if="showTable[4]" />
        </div> -->
        <div class="table-box">
          <div class="title-box">
            <div class="title">{{$t('PayApplyList.handlingFee')}}</div><!-- 银行手续费 -->
            <div class="btn">
              <!-- <el-button type="default" @click="addFee">添加手续费</el-button> -->
              <div @click="toggleTable(0)" class="toggle">
                {{ showTable[0] ? $t('Common.collapse') : $t('Common.expand')}}
                <i :class="[ showTable[0] ? `el-icon-arrow-up` : `el-icon-arrow-down`]"></i>
              </div>
            </div>
          </div>
          <FinanceTable style="margin-top:6px" :option="option1" v-show="showTable[0]" />
        </div>
        <template v-if="option10.data.length">
          <div class="table-box">
            <div class="title-box">
              <div class="title">{{$t('PayApplyList.paymentPlatformList')}}</div>
            </div>
            <div class="bill-box">
              <span>{{$t('Settle.paymentCurrency')}}: {{ payOrderCurrency }}</span>
              <span>{{$t('Settle.applyPayAmt')}}: {{ payOrderApplyAmt }}</span>
              <span>{{$t('Settle.payWay')}}: {{ dictMapObj.payWay[payOrder.payWay] }}</span>
              <template v-if="paymentPlatformList.length">
                <span class="currency">
                  {{$t('PayApplyList.prepayBalance')}}：
                  <label :key="item.currency" v-for="item in paymentPlatformList"
                    >{{ item.currency }} {{ item.balance }}</label
                  >
                </span>
              </template>
              <template v-else>
                <span>{{$t('PayApplyList.prepayBalance')}}：0</span>
              </template>
            </div>
            <FinanceTable :option="option10" />
          </div>
        </template>
        <!-- payOrder.errorType -->
        <div class="item-box" v-if="false">
          <div class="title">{{$t('PayApplyList.payErrorInfo')}}</div>
          <div class="info-box">
            <div class="base-item">
              <span class="sub-title">{{$t('PayApplyList.relevant')+$t('OrderFee.enspace')}}{{$t('Settle.payOrderNo')}}：</span>
              {{ payOrder.refPayOrderNo }}
            </div>
            <div class="base-item">
              <span class="sub-title">{{$t('PayApplyList.errorType')}}：</span>
              {{ dictMapObj.payErrorType[payOrder.errorType] }}
            </div>
            <div class="base-item">
              <span class="sub-title">{{$t('PayApplyList.responsibleParty')}}：</span>
              {{ dictMapObj.payErrorResponsibleType[payOrder.responsibleType] }}
            </div>
            <div class="base-item">
              <span class="sub-title">{{$t('OrderFee.applyPerson')}}：</span><!-- 责任人 -->
              {{ payOrder.responsibleName }}
            </div>
            <div class="base-item">
              <span class="sub-title">{{$t('PayApplyList.errorDisposalType')}}：</span>
              {{ dictMapObj.payErrorDisposalType[payOrder.errorDisposalType] }}
            </div>
            <div class="base-item">
              <span class="sub-title">{{$t('PayApplyList.errorDisposalStatus')}}：</span>
              {{ payOrder.errorDisposalStatus == 'yes' ? '已处理' : '未处理' }}
            </div>
            <div class="base-item">
              <span class="sub-title">{{$t('PayApplyList.hasColseSrcOrder')}}：</span>
              {{ payOrder.hasColseSrcOrder == 'yes' ? $t('Common.yes') : $t('Common.no') }}
            </div>
            <div class="base-item">
              <span class="sub-title">{{$t('OrderFee.remark')}}：</span><!-- 备注说明 -->
              {{ payOrder.errorRemark }}
            </div>
          </div>
        </div>

        <div class="table-box" v-show="this.option3.data.length">
          <div class="title-box">
            <div class="title">
              {{$t('FeeList.expensesList')}}
              <template>
                <span>
                  {{$t('PayApplyList.writeOff')}}:
                  <b :key="index" v-for="(value, key, index) in allWriteoff"
                    >{{ key }} {{ value.toFixed(2) }}</b
                  >
                </span>
              </template>
              <template v-if="totalWriteoffAmt.length">
                <span>
                  {{$t('PayApplyList.convertInto')}}：
                  <b :key="index" v-for="(item,index) in totalWriteoffAmt"
                    >{{ item.currency }} {{ item.writeoffAmt.toFixed(2) }}</b
                  >
                </span>
              </template>
            </div>
            <div class="btn">
              <el-button
                style="line-height: 12px;"
                @click="feeSearchToggle = !feeSearchToggle"
                size="mini"
                type="primary"
              >{{feeSearchToggle? $t('Common.hideSearch') : $t('Common.showSearch')}}</el-button>
              <div @click="toggleTable(2)" class="toggle">
                {{ showTable[2] ? $t('Common.collapse') : $t('Common.expand')}}
                <i :class="[ showTable[2] ? `el-icon-arrow-up` : `el-icon-arrow-down`]"></i>
              </div>
            </div>
          </div>
          <DetailFeeSearch v-show="showTable[2] && feeSearchToggle" ref="detailFeeSearch" :list="option3.data" :keyObj="{currency:'originalCurrency'}" @search="search" />
          <FinanceTableMass :option="option3" style="margin-top:6px"  @send-multi="sendMulti" v-show="showTable[2]" />
        </div>
        <div class="item-box" v-if="writeoffReverseList.length">
          <div class="title">{{$t('PayApplyList.antiWriteoffRecord')}}</div>
          <div class="info-box">
            <div :key="index" class="base-item-list" v-for="(item, index) in writeoffReverseList">
              <div class="base-item">
                <span class="sub-title">{{$t('PayApplyList.antiWriteoffNo')}}：</span>
                {{ item.writeoffReverseNo }}
              </div>
              <div class="base-item">
                <span class="sub-title">{{$t('PayApplyList.antiWriteoffPerson')}}：</span>
                {{ item.createdName }}
              </div>
              <div class="base-item">
                <span class="sub-title">{{$t('PayApplyList.antiWriteoffTime')}}：</span>
                {{ item.createdTime }}
              </div>
              <div class="base-item">
                <span class="sub-title reveser">{{$t('PayApplyList.relevantWriteoffNo')}}：</span>
                {{ item.writeoffReceipayNo }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <PreviewDialog :dialogOption="previewDialog" @generate="batchPrintCreate(false)"
     :showDel="checkAuth($route.name, 'btn-delVoucher')"
     :showCreate="checkAuth($route.name, 'btn-voucherNo')"/>
    <!-- 汇率弹出框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="rateDiaologOpen"
      class="self-dialog"
      width="600px"
    >
      <FinanceTable :option="option4" />
      <div class="dialog-footer" slot="footer" v-show="false">
        <el-button @click="submitRate" size="mini" type="primary">{{$t('Common.submit')}}</el-button>
        <el-button @click="closeRateDialog" size="mini">{{$t('Common.cancel')}}</el-button>
      </div>
    </el-dialog>
    <FinanceDialogTable :option="transferFeeDialog"/>
    <VoucherNosTable :dialogOption="voucherNosTableOption" @close="getInfo"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { dateFormat } from '@/views/finance/utils/finance'
import {
  queryPayWriteoff,
  saveWriteoffPayOrder,
  confirmPayWriteoff,
  writeoffRollback,
  updateWriteoffDate,
  afreshWriteoff,
  paymentPlatformBalance,
  prepayAccountBalance,
  updateWriteoffReceipayTransferDzg
} from '@/api/fin/pay'
import { listTransferFeeAllot, updateRemark, } from '@/api/fin/writeoffRecv'
import { receipayWriteOffGenerate, exReceipayWriteOffGenerate, voucherDelete, exVoucherDelete, voucherListPay } from '@/api/fin/voucher/'
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
import VoucherNosTable from '@/views/finance/voucher/components/voucherNosTable'
import FinanceDialogTable from '@/views/finance/components/financeDialog/tableDialog'
import DetailFeeSearch from '@/views/finance/components/financeSearch/detailFeeSearch'
// var height = document.body.clientHeight -99
// console.log(height)
// let screenHeight = { height: height + 'px' };
export default {
  mixins: [mixin, routerMixin],
  components: {
    FinanceTable,
    FinanceTableMass,
    PreviewDialog,
    FinanceDialogTable,
    DetailFeeSearch,
    VoucherNosTable,
  },
  data() {
    return {
      feeSearchToggle: false, //费用搜索默认显示
      voucherNos: '',
      exVoucherNos: '',
      voucherNosTableOption: { show: false, list: [] },
      loading:false,
      // screenHeight,
      paymentPlatformList:[],
      selfColumnsBase: [],
      transferFeeDialog: {
        title: this.$t('PayApplyList.allotDetail'), // '分摊详情',
        show: false,
        width:'700px',
        buttonHide: true,
        tableOption: { pagination: false, selection: false, data: [],columns: [
            { prop: 'settleCompName', label: this.$t('FeeList.settleComp'), type: 'text', minWidth: 230, },
            { prop: 'orderNo', label: this.$t('FeeList.orderNo'), type: 'button', minWidth: 150,
              operationBtns: {
                show: true,
                callback: (action, index, row) => {
                  this.showOneNoDetail('sourceBizNo', row.orderNo, { isTab: true })
                }
              }
            },
            { prop: 'bdEmployeeName', label: this.$t('OrderFee.salesman'), type: 'text', },
            { prop: 'allotAmt', label: this.$t('PayApplyList.allotAmt'), type: 'text', }, // '分摊金额'
          ], 
        },
      },
      writeoffReceipayNo: '',
      info: {},
      payOrder: {},
      payInfo: {},
      allWriteoff:'',
      settleExRateSummarys: [],
      writeoffExRateSummarys: [],
      writeoffReverseList: [],
      writeoffPay: {},
      prepayUsables: {},
      writeoffExRate: '',
      returnAmt: 'returnAmt',
      payOrderRules: { // 原未显示
        payTime: [
          {
            required: true,
            message: '付款时间不能为空',
            trigger: 'blur'
          }
        ],
        realPayAmt: [
          {
            required: true,
            message: '付款金额不能为空',
            trigger: 'blur'
          }
        ],
        remark: [
          // {
          // 	required: true,
          // 	message: "转账说明不能为空",
          // 	trigger: "blur",
          // },
        ]
      },
      option1: {},
      option2: {},
      option3: { data:[] },
      option4: {},
      option5: {},
      option7: {},
      option9: {},
      option10: {},
      option11: {},
      showTable: [true, true, true, true, true, true],
      rateDiaologOpen: false,
      dialogTitle: this.$t('PayApplyList.settleExRate'), // '结算汇率',
      showErrorDialog: false,
      previewDialog: {
        show: false,
        title: this.$t('Common.previewVoucher'),
        seqNo: '',
        showData: {}
      },
      showPreviewDialog: false,
      writeoffTime: '',
      showchangeWriteoffTime: false,
      prepayAccount: []
    }
  },
  computed: {
    totalWriteoffAmt() {
      let totalList = []
      let countList = this.option3.data
      let list = countList.filter((v) => !v.invisible)
      let currencyList = [...new Set(list.map((item) => item.settleCurrency))]
      currencyList.forEach((item) => {
        let arr = list.filter((keys) => keys.settleCurrency === item)
        let sum = arr.reduce((a, b) => Number(a) + Number(b.writeoffAmt), 0)
        if (sum && item) {
          totalList.push({
            currency: item,
            writeoffAmt: sum,
          })
        }
      })
      return totalList
    },
    ...mapGetters(['dictMap', 'dictMapObj']),
    allTransferFeeList() {
      if (this.info.transferFees) {
        const transferFees = this.info.transferFees.reduce((pre, cur) => {
          return cur.inter_cut ? (pre += Number(cur.inter_cut)) : pre
        }, 0)
        return transferFees
      } else {
        return 0
      }
    },
    // 1、类型一：支付结果=“未支付”“支付中”，支付结果=“已支付”核销状态=“未核销”，对应的详情页面。
    writeOffShow() {
      return (
        (this.payOrder.payStatus === 'pay_done' &&
          this.payOrder.payWriteoffStatus === 'no') ||
        this.typeThree
      )
    },
    typeOne() {
      const { payStatus, payWriteoffStatus } = this.payOrder
      return (
        payStatus === 'no_pay' ||
        payStatus === 'paying' ||
        (payStatus === 'pay_done' && payWriteoffStatus === 'no')
      )
    },
    // 2、类型二：支付结果=“已支付”，核销状态=“已核销”，对应的详情页面。
    typeTwo() {
      return (
        this.payOrder.payStatus === 'pay_done' &&
        this.payOrder.payWriteoffStatus === 'yes'
      )
    },
    // 3、类型三：付款单类型=“付错转预付”，对应的详情页面。
    typeThree() {
      return this.payOrder.orderType === 'wrong_transfer_prepay'
    },
    // 3、类型四：付款单状态已关闭，不能进行任何操作
    typeFour() {
      return this.payOrder.payStatus === 'pay_close'
    },
    // 显示标记付错
    typeFive() {
      const payOrder =
        ['settle_pay', 'refund_pay', 'prepay'].indexOf(
          this.payOrder.orderType
        ) > -1
      return (
        this.payOrder.payStatus === 'pay_done' &&
        this.payOrder.payStatus !== 'pay_close' &&
        payOrder
      )
    },
    storeSettleCode(){
      return this.$store.state.user?.userInfo?.settleCompanyCode
    },
    payOrderApplyAmt(){
      if(!this.option1.data.length) return
      let arr = this.option1.data.filter((keys) => keys.cutType === "payment_channel_transfer")
      let sum = arr.reduce((a, b) => Number(a) + Number(b.amt), 0)
      // this.currentUseAmtModel(this.option10.data,sum)
      return sum
    },
    payOrderCurrency(){
      if(!this.option1.data.length) return  this.payOrder.currency
      let arr = this.option1.data.filter((keys) => keys.cutType === "payment_channel_transfer")
      if(!arr.length) return  this.payOrder.currency
      if(this.option10.data.find(v=>v.currency !== arr[0].currency)){
        this.option10.data = []
      }
      return  arr[0].currency
    },
  },
  created() {
    const operationBtns = Object.assign(this.option.operationBtns, {
      data: [{ label: this.$t('Common.del'), type: 'text', show: true, action: 'Delete' }],
      width: 200
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'WritePayDetail1',
      tips: {
        text: '',
        show: false
      },
      selection: false,
      operationBtns: false,
      pagination: false,
      edit: true
    })
    const columns1 = [
      {
        prop: 'cutType',
        label: this.$t('Payment.handFeeType'),
        type: 'select',
        propInDict: 'transferFeeType'
      },
      {
        prop: 'currency',
        label: this.$t('FeeList.currency'),
        type: 'select',
        key: 'currency',
        propInDict: 'validCurrency'
      },
      {
        prop: 'amt',
        label: this.$t('FeeList.feeAmt'),
        type: 'input',
        key: 'amt',
        inputType: 'number',
      }
    ]
    this.option1.columns = columns1
    this.option2 = Object.assign({}, this.option, {
      id: 'option2', $name: 'WritePayDetail2',
      tips: {
        text: '',
        show: false
      },
      index: true,
      selection: false,
      operationBtns: false,
      pagination: false
    })
    const columns2 = [
      {
        prop: 'invoiceNo',
        label: this.$t('FeeList.invoiceNo'),
        type: 'button',
        operationBtns: {
          show: true,
          callback: (action, index, row, option) => {
            let query = {
              invoicePaymentId:row.invoicePaymentId,
              invoiceNo: row && row.invoiceNo ? row.invoiceNo :invoiceNo
            }
            this.routerPush('InvoicePaymentListDetail', query)
          }
        }
      },
      // 海外版不显示
      // {
      //   prop: 'invoiceType',
      //   label: '开票类型',
      //   type: 'text',
      //   formatter: row => {
      //     return row['invoiceType'] === 'electronic' ? '电子发票' : '纸制发票'
      //   }
      // },
      // {
      //   prop: 'amt',
      //   label: '开票金额',
      //   type: 'text'
      // },
      // {
      //   prop: 'currency',
      //   label: '开票币种',
      //   type: 'text'
      // },
      // {
      //   prop: 'rate',
      //   label: '开票汇率',
      //   type: 'text'
      // },
      // {
      //   prop: 'taxRate',
      //   label: '开票税率',
      //   type: 'text'
      // },
      // {
      //   prop: 'taxAmt',
      //   label: this.$t('FeeList.taxAmt'),
      //   type: 'text'
      // },
      // {
      //   prop: 'invoiceAmt',
      //   label: '关联金额',
      //   type: 'text'
      // },
      {
        prop: 'createdName',
        label: this.$t('PayApplyList.registrant'), // '登记人',
        type: 'text',
        width: 90
      },
      {
        prop: 'createdTime',
        label: this.$t('PayApplyList.regTime'), // '登记时间',
        type: 'text',
        width: 150
      }
    ]
    // let columns2 = [
    // 	{
    // 		prop: "invoiceNo",
    // 		label: "发票号",
    // 		type: "text",
    // 	},
    // 	{
    // 		prop: "invoiceType",
    // 		label: "开票类型",
    // 		type: "text",
    // 		formatter: (row) => {
    // 			return row['invoiceType'] === 'electronic' ? '电子发票' : '纸制发票'
    // 		}
    // 	},
    // 	{
    // 		prop: "amt",
    // 		label: "开票金额",
    // 		type: "text",
    // 	},
    // 	{
    // 		prop: "currency",
    // 		label: "开票币种",
    // 		type: "text",
    // 	},
    // 	{
    // 		prop: "rate",
    // 		label: "开票汇率",
    // 		type: "text",
    // 	},
    // 	{
    // 		prop: "taxRate",
    // 		label: "开票税率",
    // 		type: "text",
    // 	},
    // 	{
    // 		prop: "taxAmt",
    // 		label: "税额",
    // 		type: "text",
    // 	},
    // 	{
    // 		prop: "balanceAmt",
    // 		label: "剩余可用金额",
    // 		type: "text",
    // 		formatter: (row) => {
    // 			return row.amt - row.lockAmt - row.writeoffAmt
    // 		}
    // 	}
    // ]
    this.option2.columns = columns2
    this.option3 = Object.assign({}, this.option, {
      id: 'option3', $name: 'WritePayDetail3',
      tips: {
        text: '',
        show: false
      },
      edit: true,
      selection: false,
      sortable: true,
      sortChange: this.sortChange,
      operationBtns: false,
      pagination: false
    })
    this.selfColumnsBase = [
      {
        prop: 'sourceBizNo',
        label: this.$t('PreClose.bizNo'),
        type: 'button',
        minWidth: 125,
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
        minWidth: 150
      },
      {
        prop: 'settleCorpName',
        label: this.$t('FeeList.settleCorp'),
        type: 'text',
        minWidth: 150
      },
      // {
      //   prop: 'settleOrderNo',
      //   label: this.$t('FeeList.settleOrderNo'),
      //   type: 'text',
      //   minWidth: 150
      // },
      {
        prop: 'settleOrderNo',
        label: this.$t('FeeList.settleOrderNo'),
        type: 'columnTip',
        width: 120,
        sortable:true,
        component: 'ColumnTip',
        componentProps: {
          show: false,
          callback: (no, { row }) => {
            this.showOneNoDetail('settleOrderNo', row.settleOrderNo)
          }
        }
      },
      // {
      //   prop: 'feeName',
      //   label: this.$t('FeeList.feeName'),
      //   type: 'text'
      // },
      {
        prop: 'feeEnName',
        label: this.$t('FeeList.feeEname'),
        minWidth: 110,
        type: 'text'
      },
      {
        prop: 'receipayType',
        label: this.$t('Settle.receipayType'),
        type: 'select',
        formatter:({cellValue})=>{
          const statusName = this.dictMapObj.receipayType[cellValue]
          if (cellValue === 'receive') {
            return '<span style="color:#CD4130">'+statusName+'</span>'
          } else if (cellValue === 'pay') {
            return '<span style="color:#33B18A">'+statusName+'</span>'
          } else {
            return statusName
          }
        }
      },
      {
        prop: 'originalCurrency',
        label: this.$t('Settle.orignalCurrency'),
        type: 'text'
      },
      {
        prop: 'oldSettleAmt',
        label: this.$t('Collect.originalamount'),
        type: 'text'
      },
      {
        prop: 'canSettleAmt',
        label: this.$t('Payment.originalAmt'),
        type: 'text',
        minWidth: 120
      },
      {
        prop: 'writeoffFeeAmt',
        label: this.$t('Payment.writeoffAmt'),
        type: 'input',
        minWidth: 110,
        validateInput: (val, row, item, change) => {
          if (change) {
            if (!/^\d+(\.\d{0,2})?$/.test(val)) {
              return this.$message({
                type: 'error',
                message: this.$t('OrderFee.inputCorrectNumber'), // '请输入正确的数字！',
                showClose: true
              })
            }
            if (Number(val) > Number(row.settleAmt)) {
              return this.$msgErrClose(this.$t('PayApplyList.writeoffAmtNotBigCanWrt')) // 核销原币金额不能大于可核销原币金额
            }
            this.$nextTick(() => {
              row.writeoffAmt = (
                row.writeoffFeeAmt * row.writeoffExRate
              ).toFixed(2)
            })
          }
        }
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
        prop: 'writeoffCurrency',
        label: this.$t('Settle.paymentCurrency'),
        type: 'text'
      },
      {
        prop: 'writeoffExRate',
        label: this.$t('Collect.writeoffrate'),
        type: 'text'
      },
      {
        prop: 'writeoffAmt',
        label: this.$t('Settle.exSettleAmt'),
        type: 'text'
      },
      // 海外版不显示
      // {
      //   prop: 'taxRate',
      //   label: this.$t('FeeList.taxRate'),
      //   type: 'text'
      // },
      // {
      //   prop: 'taxAmt',
      //   label: this.$t('FeeList.taxAmt'),
      //   type: 'text'
      // },
      // {
      //   prop: 'feeAmtWithoutTax',
      //   label: this.$t('FeeList.feeAmtWithoutTax'),
      //   minWidth: 100,
      //   type: 'text'
      // },
      // {
      //   prop: 'invoiceAmt',
      //   label: this.$t('Collect.invoicedAmt'),
      //   minWidth: 100,
      //   type: 'text'
      // },
      // 海外版不显示
      // {
      //   prop: 'canInvoiceAmt',
      //   label: '可开票金额',
      //   minWidth: 100,
      //   type: 'text'
      // },
      // { 
      //   prop: 'invoiceStatus',
      //   label: '开票状态',
      //   type: 'text',
      //   formatter:(row)=>{
      //     const statusName = this.dictMapObj.feeInvoiceStatus[row.invoiceStatus]
      //     return statusName
      //   }
      // },
      {
        prop: 'serviceName',
        label: this.$t('FeeList.serviceCodes'),
        type: 'text'
      },
      {
        prop: 'feeUnit',
        label: this.$t('FeeList.feeUnit'),
        type: 'select',
        propInDict: 'feeUnit',
        readOnly: true
      },
      {
        prop: 'unitPrice',
        label: this.$t('FeeList.unitPrice'),
        type: 'text'
      },
      {
        prop: 'unitCount',
        label: this.$t('FeeList.quantity'),
        type: 'text'
      },
      {
        prop: 'finDate',
       label: this.$t('FeeList.finDate'),
        type: 'text'
      },
      {
        prop: 'mbl',
        label: 'MBL',
        type: 'tooltip',
      },
      {
        prop: 'hbl',
        label: 'HBL',
        type: 'tooltip',
      },
    ]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    this.option3.columns = [...this.selfColumnsBase]
    // listColumnConfigGet({ scenesCode: 'fin_WritePayDetail3_writeoffPay_fee_list' }).then((res) => {
    //   this.columnConfig = true
    //   this.dealCustomColumn(res)
    // })
    this.option4 = Object.assign({}, this.option, {
      id: 'option4', $name: 'WritePayDetail4',
      tips: {
        text: '',
        show: false
      },
      selection: false,
      operationBtns: false,
      pagination: false,
      edit: true
    })
    const columns4 = [
      {
        prop: 'originalCurrency',
        label: this.$t('Settle.orignalCurrency'),
        type: 'text'
      },
      {
        prop: 'settleCurrency',
        label: this.$t('PayApplyList.writeoffCurrency'), // '核销币种',
        type: 'text'
      },
      {
        prop: 'settleExRate',
        label: this.$t('Settle.settleExRate'),
        type: 'text'
      }
    ]
    this.option4.columns = columns4
    this.option5 = Object.assign({}, this.option, {
      id: 'option5', $name: 'WritePayDetail5',
      data: [],
      tips: {
        text: '',
        show: false
      },
      selection: {
        show: false
      },
      operationBtns: false,
      pagination: false
    })
    const columns5 = [
      {
        prop: 'currency',
        label: this.$t('PayApplyList.exchangeCurrency'), // '购汇币种',
        type: 'text'
      },
      {
        prop: 'amt',
        label: this.$t('PayApplyList.exchangeAmt'), // '购汇金额',
        type: 'text'
      },
      {
        prop: 'exRate',
        label: this.$t('PayApplyList.exchangeRate'), // '购汇汇率',
        type: 'text'
      },
      {
        prop: 'payAccountShortName',
        label: this.$t('PayApplyList.payAccountShortName'), // '我司银行简称',
        type: 'text',
        width: 150
      },
      {
        prop: 'settleMode',
        label: this.$t('Settle.settleMode'),
        type: 'select',
        propInDict: 'bankAccountSettleMode' 
      },
      {
        prop: 'payAccountName',
        label: this.$t('PayApplyList.payAccountName'), // '我司账户名',
        type: 'text',
        width: 150
      },
      {
        prop: 'payBankName',
        label: this.$t('PayApplyList.payBankName'), // '我司银行名称',
        type: 'text',
        width: 150
      },
      {
        prop: 'payAccountNo',
        label: this.$t('PayApplyList.payAccountNo'), // '我司账号',
        type: 'text'
      },
      {
        prop: 'createdName',
        label: this.$t('Common.createdBy'),
        type: 'text'
      },
      {
        prop: 'createdTime',
        label: this.$t('Common.createTime'),
        type: 'text',
        width: 150
      }
    ]
    this.option5.columns = columns5
    this.option7 = Object.assign({}, this.option, {
      id: 'option7', $name: 'WritePayDetail7',
      data: [],
      tips: {
        text: '',
        show: false
      },
      selection: {
        show: false
      },
      operationBtns: false
    })
    const columns7 = [
      { prop: 'settleCompName', label: this.$t('Settle.branchCompany'), type: 'text' },
      { prop: 'payOrderNo', label: this.$t('Settle.payOrderNo'), type: 'select' },
      { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text' },
      { prop: 'currency', label: this.$t('Settle.paymentCurrency'), type: 'text' },
      { prop: 'realpayAmt', label: this.$t('Settle.applyPayAmt'), type: 'text' }, // balance
      { prop: 'currentUseAmt', label: this.$t('PayApplyList.relevantAmt'), type: 'text' } // '关联金额'
      // {
      // 	prop: 'balance', label: '剩余可用金额', type: 'text', // remainingAmount
      // 	// formatter: (row, pItem) => {
      // 	//   return row.balance - row.usedAmt
      // 	// }
      // },
    ]
    this.option7.columns = columns7
    const operationBtns9 = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: this.$t('Common.modify'),
          type: 'text',
          showFn: row => !row.edit,
          action: 'EditNo'
        },
        { label: this.$t('Common.save'), type: 'text', showFn: row => row.edit, action: 'SaveNo' }
      ],
      width: 100,
      callback: (action, $index, row, option) => {
        if (action === 'EditNo') {
          row.edit = true
        } else if (action === 'SaveNo') {
          row.edit = false
          this.updateWriteoffReceipayTransferDzg(row)
        }
      }
    })
    // 海外版不显示
    this.option9 = Object.assign({}, this.option, {
      id: 'option9', $name: 'WritePayDetail9',
      data: [],
      tips: false,
      selection: false,
      operationBtns: operationBtns9,
      edit: true,
      index: {
        show: true
      },
      columns: [
        // {
        //   prop: 'dzgCompName',
        //   label: '大掌柜',
        //   type: 'text'
        // },
        {
          prop: 'currency',
          label: this.$t('Settle.paymentCurrency'),
          type: 'text'
        },
        {
          prop: 'internalDzgAmt',
          label: this.$t('Settle.applyPayAmt'),
          type: 'text'
        },
        {
          prop: 'transferAllotAmtStr',
          label: '分摊手续费',
          type: 'text',
          formatter: ({row}) => {
            return row.transferAllotAmtStr || 0
          }
        },
        // {
        //   prop: 'dzgPayBillNo',
        //   label: '大掌柜付款单号',
        //   type: 'text'
        // },
        {
          prop: 'dzgWriteoffNo',
          label: this.$t('Hedge.writeoffNo'),
          type: 'input',
          needTrim: true
        }
      ]
    }),
    this.option10 = Object.assign({}, this.option, {
      id: 'option10', $name: 'OrderDetails10',
      tips: {
        text: '',
        show: false
      },
      selection: {
        show: false
      },
      operationBtns: false,
      pagination: false,
      edit: true
    })
    const columns10 = [
      { prop: 'settleCompName', label: this.$t('Settle.branchCompany'), type: 'text' },
      { prop: 'payOrderNo', label: this.$t('Settle.payOrderNo'), type: 'select' },
      { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text' },
      { prop: 'currency', label: this.$t('Settle.paymentCurrency'), type: 'text' },
      { prop: 'realpayAmt', label: this.$t('Settle.applyPayAmt'), type: 'text' }, // balance
      {
        prop: 'currentUseAmt',
        label: this.$t('PayApplyList.relevantAmt'), // '关联金额',
        type: 'text' // remainingAmount
      }
    ]
    this.option10.columns = columns10
    this.option11 = Object.assign({}, this.option, {
      id: 'option11', $name: 'OrderDetails11',
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
      pagination: false
    })
    const columns11 = [
      // { prop: 'applyNo', label: this.$t('Payment.paymentNo'), type: 'text' },
      {
        prop: 'applyNo',
        label: this.$t('Payment.paymentNo'),
        type: 'button',
        width: 120,
        operationBtns: {
          show: true,
          callback: (action, index, row, option) => {
            // this.showOneNoDetail('paySettleApplyNo', row.applyNo)
            let subItem = row.applyNo
            //请款类型为【预付付款】跳转到预付款申请详情页
            if (row.orderType === 'prepay') {
              let query = {
                applyNo: subItem,
                source: "createRegPrepayFrom"
              }
              return this.routerPush('PrepayDetail', query)
            }
            //请款类型为【结算付款|预付抵账】跳转到结算付款申请详情页
            if (row.orderType === 'refund_pay') {
              let query = {
                applyNo: subItem,
                payApplyReceiveRefundId: row.payApplyReceiveRefundId,
                source: "createRegPrepayFrom"
              }
              return this.routerPush('RefundDetail', query)
            }
            //请款类型为【结算付款|预付抵账】跳转到结算付款申请详情页
            let query = {
              applyNo: subItem,
              confirmStatus: row.confirmStatus
            }
            return this.routerPush('SettleDetail', query)
          }
        }
      },
      { prop: 'recvBankName', label: this.$t('PayApplyList.recvBankName'), type: 'text' },
      { prop: 'recvAccountName', label: this.$t('PayApplyList.recvAccountName'), type: 'text' },
      { prop: 'recvAccountNo', label: this.$t('PayApplyList.recvAccountNo'), type: 'text' },
      { prop: 'applyPayAmt', label: this.$t('FeeList.feeAmt'), type: 'text' },
      { prop: 'currency', label: this.$t('FeeList.currency'), type: 'text' },
      { prop: 'createdName', label: this.$t('Settle.applicant'), type: 'text' },
      { prop: 'createdTime', label: this.$t('Settle.applicationDate'), type: 'text' },
    ]
    this.option11.columns = columns11
  },
  activated() {
    // this.$refs.query.resetFields()
    this.writeoffReceipayNo = this.$route.query.writeoffReceipayNo
    this.showchangeWriteoffTime = false
    this.writeoffTime = ''
    this.option9.data = []
    this.getInfo()
  },
  methods: {
    // 修改核销日期
    saveWriteoffTime() {
      const writeoffDate = this.writeoffPay.writeoffDate
      if (!writeoffDate) {
        return this.$msgErrClose(this.$t('PayApplyList.selectTimeBeforeSave')) // '请选择时间之后再进行保存！'
      }
      const writeoffReceipayId = this.writeoffPay.writeoffReceipayId
      const data = {
        writeoffDate,
        writeoffReceipayId
      }
      updateWriteoffDate(data)
        .then(res => {
          if (res.code === 0) {
            this.writeoffPay.writeoffDate = writeoffDate
            this.$msgSucClose(this.$t('OrderFee.successOp')) // '核销日期修改成功！'
            this.showchangeWriteoffTime = false
          }
        })
        .catch(() => {})
    },
    // 确认核销
    writeoff() {
      const writeoffReceipayId = this.writeoffPay.writeoffReceipayId
      this.$confirm(this.$t('PayApplyList.sureReview'), this.$t('OrderFee.tip'), { // '您确定要核销复核吗?', '核销复核'
        confirmButtonText: this.$t('Common.sure'),
        cancelButtonText: this.$t('Common.cancel'),
        lockScroll: 'true',
        type: 'warning'
      })
        .then(() => {
          return confirmPayWriteoff({ writeoffReceipayIdList: [writeoffReceipayId] })
        })
        .then(() => {
          this.$message({ message: this.$t('OrderFee.successOp'), type: 'success' }) // '核销复核提交成功'
          this.getInfo()
        })
        .catch(function() {})
    },
    // 反核销
    handleApplyFor() {
      const writeoffReceipayId = this.writeoffPay.writeoffReceipayId
      this.$confirm(this.$t('PayApplyList.sureAntiwriteoff'), this.$t('OrderFee.tip'), { // '您确定要反核销吗?', '反核销'
        confirmButtonText: this.$t('Common.sure'),
        cancelButtonText: this.$t('Common.cancel'),
        lockScroll: 'true',
        type: 'warning'
      })
        .then(() => {
          return writeoffRollback({ writeoffReceipayId })
        })
        .then(() => {
          this.$message({ message: this.$t('OrderFee.successOp'), type: 'success' }) // '反核销提交成功'
          this.getInfo()
        })
        .catch(function() {})
    },
    // 删除凭证
    delVoucher(){
      let voucherNos = []
      let voucherSeqNos = []
      this.writeoffPay.voucherNo.split(',').forEach((val) => {
        let arr = val.split('/')
        voucherNos.push(arr[1])
        voucherSeqNos.push(arr[0])
      })
      voucherNos = [...new Set(voucherNos)].filter(v=>v!=='null')
      voucherSeqNos = [...new Set(voucherSeqNos)]
      // return console.log(voucherSeqNos);
      this.$confirmWarn(this.$t('Hedge.detailsTips', {voucherNos: voucherNos.join(',')}), () => {
        voucherDelete({ voucherSeqNos }).then((res) => {
         this.$msgSucClose(this.$t('Settle.deleteSuc')) // this.$msgErrClose
          this.getInfo()
        })
      })
    },
    delVoucher2(){
      let voucherNos = []
      let voucherSeqNos = []
      this.writeoffPay.exVoucherNo.split(',').forEach((val) => {
        let arr = val.split('/')
        voucherNos.push(arr[1])
        voucherSeqNos.push(arr[0])
      })
      voucherNos = [...new Set(voucherNos)].filter(v=>v!=='null')
      voucherSeqNos = [...new Set(voucherSeqNos)]
      // return console.log(voucherSeqNos);
      this.$confirmWarn(this.$t('Hedge.detailsTips', {voucherNos: voucherNos.join(',')}), () => {
        exVoucherDelete({ voucherSeqNos }).then((res) => {
          this.$msgSucClose(this.$t('Settle.deleteSuc')) // this.$msgErrClose
          this.getInfo()
        })
      })
    },
    // preview 预览&生成   isOutter 内账&外账
    batchPrintCreate2(preview, isExt){
      this.isExt = isExt === true
      this.batchPrintCreate(preview)
    },
    // 预览凭证
    batchPrintCreate(preview) {
      if(preview === 'refresh'){
        this.getInfo()
        return
      }
      const writeoffReceipayNos = this.writeoffPay.writeoffReceipayNo
      const data = {
        writeoffReceipayNos,
        bizType: 'pay_writeoff',
        preview: 'no'
      }
      let acctVoucherSeqno = !(this.writeoffPay.noVoucherCompanyCodes||'').split(',').includes(this.storeSettleCode)&&this.writeoffPay.acctVoucherSeqno
      let exAcctVoucherSeqno = !(this.writeoffPay.noExVoucherCompanyCodes||'').split(',').includes(this.storeSettleCode)&&this.writeoffPay.exAcctVoucherSeqno
      acctVoucherSeqno = this.isExt ? exAcctVoucherSeqno : acctVoucherSeqno 
      if (preview) {
        // 预览
        if (acctVoucherSeqno) {
          this.previewDialog.showData = ''
          this.previewDialog.seqNo = acctVoucherSeqno
          this.previewDialog.show = true
        } else {
          data.preview = 'yes'
          let method = this.isExt ? exReceipayWriteOffGenerate : receipayWriteOffGenerate
          method(data).then(res => {
            // if (res.code === 0) {
            // 	this.showPreviewDialog = true
            // 	this.getInfo()
            // }
            this.previewDialog.seqNo = ''
            this.previewDialog.showData = res.data
            this.previewDialog.show = true
          })
        }
      } else {
        // 生成凭证
        if (acctVoucherSeqno) {
          return this.$msgErrClose(this.$t('PayApplyList.currBranchHasGene')) // 当前分公司凭证已生成，请勿重复生成！
        }
        this.$confirm(this.$t('PayApplyList.confirmGeneVoucher'), this.$t('OrderFee.tip'), { // '确认生成凭证?', '生成凭证'
          confirmButtonText: this.$t('Common.sure'),
          cancelButtonText: this.$t('Common.cancel'),
          lockScroll: 'true',
          type: 'warning'
        })
          .then(() => {
            let method = this.isExt ? exReceipayWriteOffGenerate : receipayWriteOffGenerate
            return method(data)
          })
          .then(() => {
            this.$msgSucClose(this.$t('OrderFee.successOp')) // '凭证已经处理！'
            window.setTimeout(() => {
              this.getInfo()
            }, 1000)
          })
          .catch(function() {})
      }
    },
    // 返回
    cancel() {
      this.routerBack()
    },
    // 获取详情
    getInfo() {
      this.loading = true
      this.voucherNos = this.exVoucherNos = ''
      queryPayWriteoff({ writeoffReceipayNo: this.writeoffReceipayNo })
        .then(res => {
          this.info = res.data
          const {
            payOrder,
            transferFees,
            writeoffPay,
            prepayUsables,
            writeoffItems,
            writeoffReverseList,
            payPurchaseForeignExchange,
            platformTransferFeeDedueList,
            payApplySettleList
          } = res.data
          
          this.voucherNos = writeoffPay.voucherNo || ''
          this.exVoucherNos = writeoffPay.exVoucherNo || ''
          this.payOrder = payOrder
          this.payInfo = payOrder.payInfo
          this.writeoffPay = writeoffPay
          this.prepayUsables = prepayUsables
          this.writeoffReverseList = writeoffReverseList || []
          this.settleExRateSummarys = writeoffPay.settleExRateSummarys || []
          this.writeoffExRateSummarys = writeoffPay.writeoffExRateSummarys || []
          this.writeoffExRate =
            this.writeoffExRateSummarys[0]?.writeoffExRate || ''
          this.option1.data = transferFees || []
          const invoicePayment = payOrder.payInfo.payInfoInvoices.map(item => {
            return Object.assign(item.invoicePayment, {
              invoiceAmt: item.invoiceAmt
            })
          })
          this.option2.data = invoicePayment || []
          this.option3.data = writeoffItems || []
          this.option3.data.forEach(item => {
            item.settleOrderNo_multiValue = item.settleOrderNo.split(',')
          })
          this.option10.data = platformTransferFeeDedueList || []
          this.option11.data = payApplySettleList || []
          if (payOrder.orderType === 'prepay_to_repay' || payOrder.orderType === 'settle_pay') {
            this.option1.columns = [
              {
                prop: 'cutType',
                label: this.$t('Payment.handFeeType'),
                type: 'select',
                propInDict: 'transferFeeType'
              },
              {
                prop: 'currency',
                label: this.$t('FeeList.currency'),
                type: 'select',
                key: 'currency',
                propInDict: 'validCurrency'
              },
              {
                prop: 'amt',
                label: this.$t('FeeList.feeAmt'),
                type: 'input',
                key: 'amt',
                inputType: 'number',
              },
              {
                prop: 'hasAllotAmt',
                label: this.$t('Payment.apportAmt'),
                type: 'text',
                inputType: 'number'
              },
              {
                prop: 'allotAmt',
                label: this.$t('Payment.apportionment'),
                type: 'button',
                inputType: 'number',
                callback:({transferFeeId, writeoffReceipayNo})=>{
                  let data = { currPage: 1, pageSize: 1000, query: [
                    { column: 'transferFeeId', type: 'eq', value: transferFeeId },
                    { column: 'writeoffReceipayNo', type: 'eq', value: writeoffReceipayNo },
                    ],}
                  listTransferFeeAllot(data).then(res=>{
                    this.transferFeeDialog.tableOption.data = res.data.list || []
                    this.transferFeeDialog.show = true
                  })
                }
              }
            ]
          }
          if (!this.info.payOrder.payTime) {
            this.info.payOrder.payTime =
              dateFormat('yyyy-mm-dd', new Date()) + ' 00:00:00'
          }
          this.option7.data = prepayUsables || []
          this.option5.data = payPurchaseForeignExchange
            ? [payPurchaseForeignExchange]
            : []
          // 大掌柜分摊 // 海外版不显示
          // if (this.info.writeoffReceipayTransferDzgs?.length) {
          //   this.option9.data = this.info.writeoffReceipayTransferDzgs.map(
          //     item => Object.assign({},item, { edit: false })
          //   )
          // }
          // 凭证预览
          // if (this.showPreviewDialog) {
          // 	this.batchPrintCreate(true)
          // 	this.showPreviewDialog = false
          // }
          this.prepayAccountBalance()
          this.paymentPlatformBalance()
          this.countTotalSettle()
        })
        .catch(()=>{
          this.delVisitedView()
          this.cancel()
        }).finally(()=>{
          this.loading = false
        })
    },
    // 标记付错 // 此页面未使用
    markErr() {
      if (this.payOrder.errorStatus === 'yes') {
        return this.$msgErrClose('已操作过标记付错,不能重复操作')
      }
      if ((this.payOrder.payStatus = 'pay_close')) {
        return this.$msgErrClose('已关闭的付款单不能操作标记付错')
      }
      this.showErrorDialog = true
    },
    // 关闭付错组件
    closeMarkError() {
      this.showErrorDialog = false
    },
    // 查询
    paymentPlatformBalance() {
      const { payCompCode, recvCorpCode, currency } = this.payOrder.payInfo
      const data = {
        currPage: 1,
        pageSize: 10,
        query: [
          {
            column: 'settleCompCode',
            type: 'eq',
            value: payCompCode
          },
          {
            column: 'currency',
            type: 'eq',
            value: currency
          }
        ]
      }
      if(!this.option10.data.length) return
      paymentPlatformBalance(data)
        .then(res => {
          this.paymentPlatformList = res.data || []
        })
        .catch(() => {})
    },
    // 统计核销折币金额
    countTotalSettle() {
      const writeoff = {}
      const settle = {}
      let list = this.option3.data
      let allWriteoffList = list.filter((v) => !v.invisible)
      allWriteoffList.forEach(item => {
        if (!writeoff[item.originalCurrency]) {
          writeoff[item.originalCurrency] = Number(item.writeoffFeeAmt)
        } else {
          writeoff[item.originalCurrency] += Number(item.writeoffFeeAmt)
        }
        if (!settle[item.settleCurrency]) {
          settle[item.settleCurrency] = Number(item.writeoffAmt)
        } else {
          settle[item.settleCurrency] += Number(item.writeoffAmt)
        }
      })
      this.allWriteoff = writeoff
      this.allSettle = settle
    },
    // 核销操作
    writeOffPreview() {
      if (this.info.payOrder.confirmStatus === 'pending') {
        return this.$msgErrClose(this.$t('PayApplyList.acceptBeforeWrt')) // 请先完成受理才能核销！
      }
      if (this.info.payOrder.payWriteoffStatus === 'yes') {
        return this.$msgErrClose(this.$t('PayApplyList.notRepeatWrt')) // 已核销！无需重复核销！
      }
      if (this.option3.data.length) {
        const feeAmt = this.option3.data.some(item => {
          return !item.writeoffFeeAmt
        })
        if (feeAmt) {
          return this.$msgErrClose(this.$t('PayApplyList.wrtAmtNotEmpty')) // 核销原币金额不能为空
        }
        const writeoffFeeAmt = this.option3.data.some(item => {
          return item.writeoffFeeAmt > item.settleAmt
        })
        if (writeoffFeeAmt) {
          return this.$msgErrClose(this.$t('PayApplyList.writeoffAmtNotBigCanWrt')) // 核销原币金额不能大于可核销原币金额
        }
      }
      this.$refs.query.validate(valid => {
        if (valid) {
          this.writeOffPreviewFn()
        }
      })
    },
    writeOffPreviewFn() {
      // let transferFees = this.info.transferFees
      // if (transferFees.length) {
      // 	let status = transferFees.some(item => {
      // 		return item.amt - item.hasAllotAmt < item.allotAmt
      // 	})
      // 	if (status) {
      // 		return this.$msgErrClose('本次分摊必选小于金额-已分摊金额')
      // 	}
      // }
      const lessPayDealway = this.info.payOrder.lessPayDealway
      const greatPayDealway = this.info.payOrder.greatPayDealway
      this.info.payOrder.differenceDealway = lessPayDealway || greatPayDealway
      const data = this.info
      saveWriteoffPayOrder(data).then(res => {
        if (res.code === 0) {
          this.$msgSucClose(this.$t('OrderFee.successOp')) // '核销提交成功!'
          this.getInfo()
        }
      })
    },
    // 表格收起
    toggleTable(index) {
      this.$set(this.showTable, index, !this.showTable[index])
    },
    // 增加手续费
    addFee() {
      if (this.info.payOrder) {
        const orderType = this.info.payOrder.orderType
        if (orderType === 'prepay_to_repay') {
          return this.$msgErrClose(this.$t('PayApplyList.prepayNotAddTransfer')) // 预付抵账！无需添加手续费！
        }
        const currency = this.info.payOrder.currency
        this.option1.data.push({
          cutType: 'exter_cut',
          currency: currency,
          amt: '',
          edit: true
        })
      }
    },
    // 删除手续费
    handleDelete($index) {
      this.$confirm('是否确认删除？', '手续费', {
        confirmButtonText: this.$t('Common.sure'),
        cancelButtonText: this.$t('Common.cancel'),
        type: 'warning'
      })
        .then(() => {
          this.option1.data.splice($index, 1)
        })
        .catch(() => {})
    },
    // 修改核销汇率
    changeWriteoffExRate() {
      if (!/^\d+(\.\d{0,4})?$/.test(this.writeoffExRate)) {
        return this.$msgErrClose('请输入正确的汇率')
      }
      const originalCurrency = this.settleExRateSummarys[0].originalCurrency
      const settleCurrency = this.settleExRateSummarys[0].settleCurrency
      this.option3.data.forEach(item => {
        if (
          item.originalCurrency === originalCurrency &&
          item.settleCurrency === settleCurrency
        ) {
          item.writeoffExRate = this.writeoffExRate
          item.writeoffAmt = item.writeoffFeeAmt
            ? (item.writeoffFeeAmt * item.writeoffExRate).toFixed(2)
            : 0
        }
      })
      this.countTotalSettle()
    },
    // 打开汇率弹窗
    showRateDialog(type) {
      if (type) {
        this.dialogTitle = '核销汇率'
        this.option4.data = this.writeoffExRateSummarys || []
        this.option4.columns[2] = {
          prop: 'writeoffExRate',
          label: this.$t('Collect.writeoffrate'),
          type: 'text'
        }
        this.option4.data[0].writeoffExRate = this.writeoffExRate
      } else {
        this.dialogTitle = '结算汇率'
        this.option4.data = this.settleExRateSummarys
        this.option4.columns[2] = {
          prop: 'settleExRate',
          label: this.$t('Settle.settleExRate'),
          type: 'text'
        }
      }
      this.rateDiaologOpen = true
    },
    // 关闭汇率弹窗
    closeRateDialog() {
      this.rateDiaologOpen = false
    },
    // 提交汇率修改
    submitRate() {
      const writeoffExRate = this.option4.data.some(item => {
        return /^\d+(\.\d{0,4})?$/.test(item.writeoffExRate)
      })
      if (!writeoffExRate) {
        return this.$msgErrClose(this.$t('PayApplyList.inputCorrectWrtRate')) // 请输入正确的核销汇率
      }
      this.writeoffExRate = this.option4.data[0].writeoffExRate
      this.option4.data.forEach(item => {
        const { originalCurrency, settleCurrency, writeoffExRate } = item
        this.option3.data.forEach(ele => {
          if (
            ele.originalCurrency === originalCurrency &&
            ele.settleCurrency === settleCurrency
          ) {
            ele.writeoffExRate = writeoffExRate
            ele.writeoffAmt = ele.writeoffFeeAmt
              ? (ele.writeoffFeeAmt * ele.writeoffExRate).toFixed(2)
              : 0
          }
        })
      })
      this.closeRateDialog()
    },
    // 水单相关操作
    handleRemove() {
      this.payOrder.fileId = this.payOrder.fileNo = this.payOrder.bankseqFileNo =
        ''
    },
    beforeRemove(file) { // 此页面未使用
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    handleExceed(files, fileList) { // 此页面未使用
      this.$message.warning(this.$t('Hedge.onlyTips'))
    },
    uploadHttpRequest(param, api) {
      const form = new FormData()
      form.append('file', this.file)
      this.$store
        .dispatch('user/import', {
          uri: '/base/webapi/file/upload',
          params: form
        })
        .then(res => {
          this.$msgSucClose(this.$t('BillList.uploadSuccess'))
          this.payOrder.bankseqFileNo = res.data.data.fileNo
          this.fileList = []
        })
    },
    fileChange(file) {
      this.file = file.raw
    },
    uploadSuccess(response, file, fileList) {
      const fileId = response.data && response.data.fileId
      this.payOrder.fileId = this.payOrder.fileNo = fileId || 'test'
    },
    uploadApi(formData) {
      return add(formData)
    },
    // 查看水单附件
    handleBankseqFileNo() {
      const href = `/base/fileView/preview/${this.payOrder.bankseqFileNo}/sowoll`
      window.open(href)
    },
    handleDeleteFileNo() { // 此页面未使用
      this.$confirm('是否确认删除水单附件？', '水单', {
        confirmButtonText: this.$t('Common.sure'),
        cancelButtonText: this.$t('Common.cancel'),
        type: 'warning'
      })
        .then(() => {
          this.payOrder.bankseqFileNo = ''
        })
        .catch(console.log)
    },
    // 重新核销
    afreshWriteoff() {
      this.$confirm(this.$t('PayApplyList.sureRewrite'), this.$t('OrderFee.tip'), { // '您确定要重新核销吗?', '重新核销'
        confirmButtonText: this.$t('Common.sure'),
        cancelButtonText: this.$t('Common.cancel'),
        lockScroll: 'true',
        type: 'warning'
      })
        .then(() => {
          const writeoffReceipayId = this.writeoffPay.writeoffReceipayId
          afreshWriteoff({ writeoffReceipayId }).then(res => {
            const query = {
              payOrderNo: res.data.payOrder.payOrderNo,
              orderType: res.data.payOrder.orderType
            }
            // this.$emit('update:isJumpRouteFromPage', true)
            // this.$router.push({
            //   name: 'OrderDetails',
            //   query
            // })
            this.routerPush('OrderDetails', query)
          })
        })
        .catch(function() {})
    },
    // 查询预付抵账 预付款余额
    prepayAccountBalance() {
      const { payCompCode, recvCorpCode, currency } = this.payOrder.payInfo
      const data = {
        currPage: 1,
        pageSize: 10,
        query: [
          {
            column: 'settleCompCode',
            type: 'eq',
            value: payCompCode
          },
          {
            column: 'settleCorpCode',
            type: 'eq',
            value: recvCorpCode
          },
          {
            column: 'currency',
            type: 'eq',
            value: currency
          }
        ]
      }
      if(this.payOrder.orderType !== 'prepay_to_repay') return
      prepayAccountBalance(data)
        .then(res => {
          this.prepayAccount = res.data || []
        })
        .catch(() => {})
    },
    // 大掌柜分摊手续费
    updateWriteoffReceipayTransferDzg(row) {
      const { writeoffReceipayTransferDzgId, dzgWriteoffNo } = row
      const data = {
        writeoffReceipayTransferDzgId,
        dzgWriteoffNo
      }
      updateWriteoffReceipayTransferDzg(data)
        .then(res => {
          if (res.code === 0) {
            this.$msgSucClose(this.$t('Hedge.modifyTips'))
          }
        })
        .catch(() => {})
    },
    updateRemark() {
      updateRemark({ writeoffReceipayId: this.writeoffPay.writeoffReceipayId, remark: this.writeoffPay.remark }).then((res) => {
        this.$msgSucClose(this.$t('FinBill.saveSuc'))
      })
    },
    search(list) {
        this.option3.data = [...(list || [])]
        this.countTotalSettle()
    },
    sendMulti(data, option) {
      console.log(data, option)
      if (option === this.option3) this.multipleSelection3 = data
      // this.feeSumChange('sendMulti')
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
    previewAll() {
      voucherListPay({ writeoffReceipayId: this.writeoffPay.writeoffReceipayId }).then((res) => {
        if (res.data && res.data.length) {
          this.voucherNosTableOption.list = res.data || []
          this.voucherNosTableOption.show = true
        } else {
          this.$msgErrClose(this.$t('PayApplyList.noRelevantVoucher')) // 无关联的凭证！
        }
      })
    },
  },
  // mounted() {
  //   window.onresize =()  =>{
  //     return (()=>{
  //       window.screenHeight = window.innerHeight
  //       var height = window.screenHeight -99
  //       this.screenHeight = { height: height + 'px' };
  //       console.log(this.screenHeight);
  //     })()
  //   }
  // },
}
</script>

<style lang="scss" scoped>
.money-box {
  background: white;
}
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
}
.payInfo-box {
  overflow-y: auto;
  overflow-x: hidden;
  .item-box {
    border-bottom: 1px solid #d8d8d8;
    padding-bottom: 6px; // 10px;
    margin: 0 8px 16px;
    .title {
      font-weight: 600;
      color: #222222;
      line-height: 20px;
      padding: 8px;
    }
    .el-form-item {
      width: calc(25% - 10px);
      margin-bottom: 10px;
    }
    .el-input,
    .el-input--suffix,
    .el-upload--text,
    .finance-table-upload,
    .el-select {
      width: 150px;
    }
    .info-box {
      display: flex;
      flex-wrap: wrap;
      margin: 8px 8px 0px; // 8px
      .base-item-list {
        flex-basis: 100%;
        display: flex;
      }
      .base-item {
        flex: 0;
        flex-basis: calc(25% - 10px);
        margin-bottom: 4px;
        margin-right: 10px;
        &.flex-item {
          flex-basis: 100%;
          display: inline-flex;
          align-items: center;
          ::v-deep{
            .sub-title{
              flex: 0 0 auto;
            }
            .el-textarea{
              flex: 1 1 auto;
            }
          }
        }
        .text-over {
          display: inline-block;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          max-width: 140px;
        }
        .sub-title {
          width: 130px; // 96px;
          text-align: right;
          display: inline-block;
          // text-align-last: justify;
          &.reveser {
            width: 130px; // 100px;
          }
        }
        .el-input {
          width: 100px;
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
      }
      span {
        font-weight: 500;
        margin-left: 20px;
        color: #222;
        b {
          color: #33b18a;
          font-weight: 500;
          margin-right: 10px;
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
          color: #999;
          i {
            margin-left: 2px;
          }
        }
      }
      .el-button {
        height: 20px;
        // background: none !important;
        border-radius: 4px;
        border: 1px solid #d9d9d9;
        text-align: center;
        line-height: 20px;
        padding: 0 8px;
        font-size: 12px;
      }
    }
    .bill-box {
      margin: -5px 0 15px 5px;
      display: flex;
      padding: 16px 8px 0px;
      color: #4a4a4a;
      span {
        flex-basis: 300px;
      }
    }
  }
}
.detail__div {
  display: inline-flex;
  margin-right: 16px;
  margin-bottom: 6px;
  position: relative;
}
.detail__div,
.detail__label,
.detail__content {
  line-height: 20px;
  height: 20px;
}
.detail__label {
  flex: 0 0 auto;
  text-align: right;
  padding-right: 4px;
}
.detail__content {
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
  ::v-deep {
    .el-tag__close {
      position: absolute;
      top: 3px;
      right: 0px;
    }
    & > b {
      padding-left: 4px;
      font-weight: normal;
      color: red;
    }
  }
  .el-button {
    padding-left: 0px !important;
  }
}
</style>

<style lang="scss">
.app-wrapper {
  .settlement-exchange-rates {
    width: 100%;
    margin-bottom: 5px;
    .settlement-exchange-rates-title {
      display: inline-block;
      width: 120px; // 100px;
      text-align: right;
      padding-right: 4px;
    }
  }
  .finance-page {
    .payInfo-box {
      .item-box {
        textarea {
          width: 100% !important;
        }
      }
      .remark {
        width: calc(100% - 10px);
        display: flex;
        .el-form-item__content {
          flex: 1;
        }
      }
    }
  }
}
</style>
