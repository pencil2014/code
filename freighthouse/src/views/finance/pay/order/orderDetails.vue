<template>
  <div
    class="finance-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div @click="bodyClick" class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">付款详情</div>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button
              @click="handleSave"
              class="finance-btn"
              size="mini"
              type=""
              v-show="checkAuth($route.name, 'btn-handleSave') && payOrder.payWriteoffStatus === 'no'"
              >保存</el-button
            >
          </el-button-group>
          <el-button-group>
            <el-button
              @click="writeOffPreview"
              class="finance-btn"
              size="mini"
              type="primary"
              v-show="
                payOrder.confirmStatus === 'pass' &&
                payOrder.payStatus !== 'pay_close' &&
                payOrder.payWriteoffStatus === 'no'&&
                checkAuth($route.name, 'btn-writeOffPreview')
              "
              >核销</el-button
            >
          </el-button-group>
          <template v-if="payOrder.payWay !=='intrabranch'">
            <el-button-group>
              <el-button
                @click="addExchange"
                class="finance-btn"
                size="mini"
                v-show="
                  payOrder.confirmStatus === 'pass' &&
                  payOrder.payStatus !== 'pay_close' &&
                  payOrder.payWriteoffStatus === 'no' &&
                  checkAuth($route.name, 'btn-addExchange')
                "
                >添加购汇记录</el-button
              >
            </el-button-group>
            <el-button-group>
              <el-button
                @click="markErr"
                class="finance-btn"
                size="mini"
                v-show="['settle_pay', 'refund_pay', 'prepay'].includes(  payOrder.orderType, )
                 && checkAuth($route.name, 'btn-markErr')"
                >标记付错</el-button
              >
            </el-button-group>
          </template>
          <el-button-group>
            <el-button @click="cancel" class="finance-btn" size="mini"
              >返回</el-button
            >
          </el-button-group>
        </div>
      </div>
      <!-- <div class="payInfo-box" :style="screenHeight"> -->
      <div class="payInfo-box" style="height: calc(100vh - 95px);">
        <!-- <div class="top-box"> -->
        <div class="item-box border-bottom">
          <div class="title">转账信息</div>
          <!-- :disabled="!typeOne" -->
          <el-form
            :inline="true"
            :model="payOrder"
            :rules="payOrderRules"
            label-suffix="："
            label-width="110px"
            ref="query"
          >
            <el-form-item label="付款金额" prop="applyAmt">
              <el-input disabled v-model.trim="payOrder.applyAmt" maxlength="16"></el-input>
            </el-form-item>
            <el-form-item label="付款方式" prop="payWay" :rules="{ required: true, message: ' ', trigger: 'change' }" >
              <el-select v-model="payOrder.payWay" placeholder="请选择" @change="payWayChange(payOrder)" :disabled='payOrder.payWriteoffStatus === "yes"'
              >
                <el-option
                  v-for="it in dictMap['payWay']"
                  :key="it.value"
                  :label="it.label"
                  :value="it.value">
                </el-option>
              </el-select>
            </el-form-item>
            <span v-show="!(payOrder.payWay == 'prepay_dedue' || payOrder.payWay == 'cash')" >
              <el-form-item label="付款账户简称" prop="payAccount" :rules="{ required: !['prepay_dedue','cash','cheque'].includes(payOrder.payWay), message: ' ', trigger: 'blur' }" >
                <el-select v-model="payOrder.payAccount" placeholder="请选择"
                  filterable
                  remote
                  :remote-method="(str) => bankRemote(str)"
                  @visible-change="(visible) => visible && bankRemote('')"
                  :disabled='payOrder.payWriteoffStatus === "yes"'
                  @change="payAccountShortNameChange"
                  value-key="value"
                >
                  <el-option
                    v-for="it in payAccountShortNameList"
                    :key="it.value"
                    :label="it.label"
                    :value="it">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item v-if="payOrder.payInfo.payBankCode==='B0249H231000001'&&(payOrder.payAccount&&payOrder.payAccount.hasFixedTransferFee==='yes')" label="手续费扣款方式" prop="payInfo.transferFeeDeductWay" :rules="{ required: true, message: ' ', trigger: 'change' }">
                <!-- v-if="payOrder.payWay==='hk_china'&&payOrder.payAccount.hasFixedTransferFee==='yes'" // 只有花旗定价手续费显示, B0249H231000001 -->
                <el-select v-model="payOrder.payInfo.transferFeeDeductWay" placeholder="请选择"
                  :disabled='payOrder.payWriteoffStatus === "yes"'
                  @change="trfFeeDeductWayChange"
                >
                  <el-option
                    v-for="it in dictMap['transferFeeDeductWay']"
                    :key="it.value"
                    :label="it.label"
                    :value="it.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item v-if="payOrder.payInfo.thirdPayChannelCode" label="标识码">
                <el-input disabled v-model="payOrder.payInfo.thirdPayChannelCode"></el-input>
              </el-form-item>
              <el-form-item label="付款账户名">
                <el-input disabled v-model="payOrder.payAccountName"></el-input>
              </el-form-item>
              <el-form-item label="付款账号" >
                <el-input disabled v-model="payOrder.payAccountNo"></el-input>
              </el-form-item>
            </span>
            <el-form-item :label="'水单文件'" prop="bankseqFileNo" :rules="[ {required: (payOrder.payWay==='chinese_mainland' || payOrder.payWay==='hk_china')&&payOrder.hasSpecialFee!=='yes',  message: '水单文件不能为空',  trigger: 'blur'  }]">
              <!-- required: payOrder.payWay==='chinese_mainland' || payOrder.payWay==='hk_china' || payOrder.hasCustSpecialFee==='yes' -->
              <template v-if="!payOrder.bankseqFileNo && !disableForm">
                <!-- <el-upload
                  :before-remove="beforeRemove"
                  :http-request="
                    (param) => {
                      uploadHttpRequest(param, uploadApi)
                    }
                  "
                  :limit="1"
                  :on-change="fileChange"
                  :on-exceed="handleExceed"
                  :on-remove="handleRemove"
                  :on-success="uploadSuccess"
                  action="str"
                  class="finance-table-upload"
                >
                  <el-button type="text" v-show="!payOrder.bankseqFileNo"
                    >点击上传</el-button
                  >
                </el-upload> -->
                <ClipboardUpload @send-res-file-list="receiveResFileList" />
              </template>
              <template v-else>
                <div class="seqfile-box">
                  <el-button
                    v-if="payOrder.bankseqFileNo"
                    @click="handleBankseqFileNo"
                    size="mini"
                    type="text"
                    >点击查看</el-button
                  >
                  <el-button
                    v-if="payOrder.bankseqFileNo"
                    :disabled="!typeOne"
                    @click="handleDeleteFileNo"
                    size="mini"
                    type="text"
                    >删除</el-button
                  >
                  <div
                    style="width: 147px; display: inline-block; font-size: 12px"
                    v-if="!payOrder.bankseqFileNo"
                  >
                    无
                  </div>
                </div>
              </template>
            </el-form-item>

            <el-form-item label="银行流水号" prop="bankSeqNo">
              <el-input
                :disabled="disableForm"
                size="mini"
                v-model="payOrder.bankSeqNo"
              ></el-input>
            </el-form-item>
            <el-form-item label="付款时间" prop="payTime">
              <el-date-picker
                :disabled="disableForm"
                align="right"
                placeholder="选择日期"
                type="date"
                v-model="payOrder.payTime"
                value-format="yyyy-MM-dd"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="实付金额" prop="realPayAmt">
              <el-input
                :disabled="disableForm"
                @change="changeRealPayAmt"
                v-model.trim ="payOrder.realPayAmt"
                maxlength="16"
              ></el-input>
            </el-form-item>
            <template
              v-if="
                (payOrder.realPayAmt - allTransferFeeList).toFixed(2) <
                payOrder.applyAmt && payOrder.orderType !== 'prepay'
              "
            >
              <el-form-item label="其他应付款" prop="lessPayAmt">
                <el-input disabled v-model="payOrder.lessPayAmt"></el-input>
              </el-form-item>
              <el-form-item label="处理科目" prop="lessPayDealway">
                <el-select
                  :disabled="disableForm"
                  placeholder
                  v-model="payOrder.lessPayDealway"
                >
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
                (payOrder.realPayAmt - allTransferFeeList).toFixed(2) >
                payOrder.applyAmt && !['prepay_to_repay','prepay'].includes(payOrder.orderType) && payOrder.payInfo.payAccountIsIntrabranch !== 'yes'
              "
            >
              <el-form-item label="我司多付金额" prop="greatPayAmt">
                <el-input disabled v-model="payOrder.greatPayAmt"></el-input>
              </el-form-item>
              <el-form-item label="多付处理方式" prop="greatPayDealway">
                <el-select
                  :disabled="disableForm"
                  placeholder
                  v-model="payOrder.greatPayDealway"
                >
                  <el-option
                    :key="key"
                    :label="o.label"
                    :value="o.value"
                    v-for="(o, key) in dictMap['greatPayDealway']"
                  ></el-option>
                </el-select>
              </el-form-item>
            </template>
            <el-form-item label="付款单号" key="payOrderNo">
              <div>{{payOrder.payOrderNo}}</div>
            </el-form-item>
            <el-form-item v-if="!['prepay_dedue','cash'].includes(payOrder.payWay)" label="账户结算方式" prop="settleMode"  :rules="{ required: !['prepay_dedue','cash','intrabranch'].includes(payOrder.payWay), message: ' ', trigger: 'blur' }" ><!-- change -->
              <el-select :disabled='payOrder.payWriteoffStatus === "yes"' v-model="payOrder.settleMode" clearable placeholder="请选择账户结算方式">
                <el-option
                v-for="item in bankAccountSettleModeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item class="remark" label="转账说明" prop="remark">
              <el-input
                :disabled="disableForm"
                :maxlength="500"
                show-word-limit
                type="textarea"
                v-model="payOrder.remark"
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
        <div @click.stop="listenClick" class="table-box top-table-box">
          <div class="title-box">
            <div class="title">银行手续费</div>
            <div class="btn">
              <el-button @click="addFee" type="default" v-show="checkAuth($route.name, 'btn-addFee') && !disableForm && payOrder.payWay !== 'prepay_dedue' && (payOrder.payInfo.hasFixedTransferFee !== 'yes' || payOrder.payInfo.payBankCode !== 'B0249H231000001')"
                >添加手续费</el-button
              >
              <!-- !option1.data.some(item=>item.cutType==='fixed') -->
              <!-- <div class="toggle" @click="toggleTable(0)">
									收起<i :class="[`el-icon-arrow-up`]"></i>
              </div>-->
            </div>
          </div>
          <FinanceTable style="margin-top:6px;" :option="option1" />
        </div>
        <template v-if="modelWithholdingTax">
          <div class="table-box">
            <div class="title-box">
              <div class="title">支付平台代付手续费抵扣</div>
              <div class="btn">
                <el-button
                  @click="relevancePrepay('withholdingTax')"
                  size="mini"
                  v-show="
                    payOrder.confirmStatus === 'pass' &&
                    payOrder.payStatus !== 'pay_close' &&
                    payOrder.payWriteoffStatus === 'no' &&
                    checkAuth($route.name, 'btn-relevancePrepay')
                  "
                  >关联支付平台代付手续费</el-button
                >
              </div>
            </div>
            <div class="bill-box">
              <span>付款币种：{{ payOrderCurrency }}</span>
              <span>付款金额：{{ payOrderApplyAmt }}</span>
              <span>付款方式：{{ dictMapObj.payWay[payOrder.payWay] }}</span>
              <template v-if="paymentPlatformListChange.length">
                <span class="currency">
                  预付款余额：
                  <label :key="item.currency" v-for="item in paymentPlatformListChange"
                    >{{ item.currency }} {{ item.balance }}</label
                  >
                </span>
              </template>
              <template v-else>
                <span>预付款余额：0</span>
              </template>
            </div>
            <FinanceTable :option="option9" />
          </div>
        </template>
        <!-- </div> -->
        <template v-if="option5.data">
          <div class="table-box" v-show="option5.data.length">
            <div class="title-box">
              <div class="title">购汇信息</div>
              <div class="btn">
                <div @click="toggleTable(3)" class="toggle">
                  <template v-if="showTable[3]">
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
            <FinanceTable style="margin-top:6px;" :option="option5" v-show="showTable[3]" />
          </div>
        </template>
          <!-- v-show="payOrder.payWay === 'prepay_dedue'" -->
        <template v-if="payOrderPayWay">
          <div class="table-box">
            <div class="title-box">
              <div class="title">预付抵账</div>
              <div class="btn">
                <el-button
                  @click="relevancePrepay"
                  size="mini"
                  v-show="
                    payOrder.confirmStatus === 'pass' &&
                    payOrder.payStatus !== 'pay_close' &&
                    payOrder.payWriteoffStatus === 'no' &&
                    checkAuth($route.name, 'btn-relevancePrepay')
                  "
                  >关联预付款</el-button
                >
              </div>
            </div>
            <div class="bill-box">
              <span>付款币种：{{ payOrder.currency }}</span>
              <span>付款金额：{{ payOrder.applyAmt }}</span>
              <span>付款方式：{{ dictMapObj.payWay[payOrder.payWay] }}</span>
              <template v-if="prepayAccount.length">
                <span class="currency">
                  预付款余额：
                  <label :key="item.currency" v-for="item in prepayAccount"
                    >{{ item.currency }} {{ item.balance }}</label
                  >
                </span>
              </template>
              <template v-else>
                <span>预付款余额：0</span>
              </template>
            </div>
            <FinanceTable :option="option7" />
          </div>
        </template>

        <div class="item-box">
          <div class="title">核销信息</div>
          <div class="info-box">
            <div class="base-item">
              <span class="sub-title">可用核销金额：</span>
              {{
                payOrder.realPayAmt > payOrder.applyAmt
                  ? payOrder.realPayAmt
                  : payOrder.applyAmt
              }}
            </div>
            <div class="base-item">
              <span class="sub-title">付款币种：</span>
              {{ payOrder.currency }}
            </div>
            <div class="base-item">
              <span class="sub-title">核销日期：</span>
              <el-date-picker
                :disabled="disableForm"
                align="right"
                placeholder="选择日期"
                type="date"
                v-model="writeoffPay.writeoffDate"
                value-format="yyyy-MM-dd"
              ></el-date-picker>
            </div>
            <!-- <div class="base-item-list"> -->
            <!-- <div class="base-item">
								其他应付款：
								<el-select v-model="returnAmt" disabled placeholder="请选择">
									<el-option label="退款手续费" value="returnAmt"> </el-option>
								</el-select>
								<el-input
									v-model="writeoffReceipay.otherPayAmt"
									placeholder=""
								></el-input>
            </div>-->
            <!-- <div class="base-item" v-if="settleExRateSummarys[0]">
								<span class="sub-title">结算汇率：</span
								>{{ settleExRateSummarys[0].originalCurrency }}-{{
									settleExRateSummarys[0].settleCurrency
								}}
								<el-input
									v-model="settleExRateSummarys[0].settleExRate"
									placeholder=""
									disabled
								></el-input>
								<span
									class="link"
									@click="showRateDialog(false)"
									v-show="writeoffExRateSummarys.length > 1"
									>更多汇率</span
								>
            </div>-->
            <div class="base-item" v-if="writeoffExRateSummarys[0]">
              <span class="sub-title">核销汇率：</span>
              {{ writeoffExRateSummarys[0].originalCurrency }}-{{
                writeoffExRateSummarys[0].settleCurrency
              }}
              <el-input
                :disabled="
                  !(
                    payOrder.confirmStatus === 'pass' &&
                    payOrder.payStatus !== 'pay_close' &&
                    payOrder.payWriteoffStatus === 'no'
                  )
                "
                v-lsNumber="{
									value: 'number',
									obj: this,
									key: 'writeoffExRate',
                  dot:10
								}"
                @change="changeWriteoffExRate"
                placeholder
                v-model="writeoffExRate"
              ></el-input>
              <span
                @click="showRateDialog(true)"
                class="link"
                v-show="writeoffExRateSummarys.length > 1"
                >更多汇率</span
              >
            </div>
            <!-- </div> -->
            <div class="base-item-list">
              <div class="base-item settle-remark">
                <span class="sub-title">核销备注：</span>
                <el-input
                  :disabled="disableForm"
                  :maxlength="500"
                  show-word-limit
                  type="textarea"
                  v-model="writeoffPay.remark"
                ></el-input>
              </div>
            </div>
            <template>
              <div class="base-item-list" v-if="writeoffPay.writeoffReceipayNo">
                <div class="base-item">
                  <span class="sub-title">核销编号：</span>
                  {{ writeoffPay.writeoffReceipayNo }}
                </div>
                <div class="base-item">
                  <span class="sub-title">核销类型：</span>
                  {{
                    dictMapObj['writeoffSubType'][writeoffPay.writeoffSubType]
                  }}
                </div>
                <div class="base-item">
                  <span class="sub-title">核销人：</span>
                  {{ writeoffPay.writeoffName }}
                </div>
                <div class="base-item">
                  <span class="sub-title">核销时间：</span>
                  {{ writeoffPay.writeoffTime }}
                </div>
              </div>
            </template>
          </div>
        </div>
        <div class="table-box">
          <div class="title-box">
            <div class="title">开票信息</div>
            <div class="btn">
              <div @click="toggleTable(0)" class="toggle">
                <template v-if="showTable[0]">
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
          <div class="item-box" v-if="showTable[0]">
            <div class="info-box">
              <div class="base-item">
                <span class="sub-title">关联发票状态：</span>
                {{ dictMapObj['payRelaInvoiceStatus'][payOrder.hasInvoice] }}
              </div>
              <div class="base-item">
                <span class="sub-title">是否后补票：</span>
                {{ payOrder.delayInvoice === 'yes' ? '是' : '否' }}
              </div>
              <div class="base-item">
                <span class="sub-title">后补票金额：</span>
                {{ payOrder.delayInvoiceAmt }}
              </div>
            </div>
            <FinanceTable :option="option2" />
          </div>
        </div>
        <div class="table-box">
          <div class="title-box">
            <div class="title">付款信息</div>
            <div class="btn">
              <div @click="toggleTable(1)" class="toggle">
                <template v-if="showTable[1]">
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
          <div class="item-box" v-show="showTable[1]">
            <div class="info-box" v-if="payOrder.payInfo">
              <div class="base-item">
                <span class="sub-title">付款单号：</span>
                {{ payOrder.payOrderNo }}
              </div>
              <div class="base-item">
                <span class="sub-title">付款类型：</span>
                {{ dictMapObj.payOrderType[payOrder.orderType] }}
              </div>
              <div v-if="!option11.data.length" class="base-item">
                <span class="sub-title">申请单号：</span>
                <el-tooltip
                  :content="payOrder.sourceApplyNo"
                  placement="top"
                >
                  <p class="text-over">{{ payOrder.sourceApplyNo }}</p>
                </el-tooltip>
              </div>
              <div class="base-item">
                <span class="sub-title">受理状态：</span>
                {{ payOrder.confirmStatus == 'pass' ? '已受理' : '未受理' }}
              </div>
              <div class="base-item">
                <span class="sub-title">付款单状态：</span>
                {{ dictMapObj.payStatusType[payOrder.payStatus] }}
              </div>
              <div class="base-item">
                <span class="sub-title">付款方式：</span>
                {{ dictMapObj.payWay[payOrder.payWay] }}
              </div>
              <div class="base-item">
                <span class="sub-title">付款币种：</span>
                {{ payOrder.currency }}
              </div>
              <div class="base-item">
                <span class="sub-title">付款金额：</span>
                {{ payOrder.applyAmt }}
              </div>
              <div class="base-item" v-if="payOrder.custBearTransferAmt">
                <span class="sub-title">客户承担手续费：</span>
                {{ payOrder.custBearTransferAmt }}
              </div>
              <div class="base-item">
                <span class="sub-title">所属分公司：</span>
                <el-tooltip
                  :content="payOrder.payInfo.payCompName"
                  placement="top"
                >
                  <p class="text-over">{{ payOrder.payInfo.payCompName }}</p>
                </el-tooltip>
              </div>
              <div class="base-item">
                <span class="sub-title">付款账户简称：</span>
                <el-tooltip
                  :content="payOrder.payInfo.payAccountShortName"
                  placement="top"
                >
                  <p class="text-over">{{ payOrder.payInfo.payAccountShortName }}</p>
                </el-tooltip>
              </div>
              <div class="base-item">
                <span class="sub-title">付款账户名：</span>
                <el-tooltip
                  :content="payOrder.payInfo.payAccountName"
                  placement="top"
                >
                  <p class="text-over">{{ payOrder.payInfo.payAccountName }}</p>
                </el-tooltip>
              </div>
              <div class="base-item">
                <span class="sub-title">付款账号：</span>
                {{ payOrder.payInfo.payAccountNo }}
              </div>
              <div class="base-item">
                <span class="sub-title">创建人：</span>
                {{ payOrder.createdName }}
              </div>
              <div class="base-item">
                <span class="sub-title">创建时间：</span>
                {{ payOrder.createdTime }}
              </div>
              <div class="base-item">
                <span class="sub-title">付款人：</span>
                {{ payOrder.confirmName }}
              </div>
              <div class="base-item">
                <span class="sub-title">付款时间：</span>
                {{ payOrder.confirmTime }}
              </div>
              <div v-if="!option11.data.length" class="base-item">
                <span class="sub-title">结算单位：</span>
                <el-tooltip
                  :content="payOrder.payInfo.recvCorpName"
                  placement="top"
                >
                  <p class="text-over">{{ payOrder.payInfo.recvCorpName }}</p>
                </el-tooltip>
              </div>
              <div v-if="!option11.data.length" class="base-item">
                <span class="sub-title">收款银行：</span>
                {{ payOrder.payInfo.recvBankName }}
              </div>
              <div v-if="!option11.data.length && payOrder.payInfo.recvAccountPublicType!=='prv'" class="base-item">
                <span class="sub-title">收款账户名：</span>
                {{ payOrder.payInfo.recvAccountName }}
              </div>
              <div v-if="!option11.data.length && payOrder.payInfo.recvAccountPublicType!=='prv'" class="base-item">
                <span class="sub-title">收款账号：</span>
                {{ payOrder.payInfo.recvAccountNo }}
              </div>
            </div>
            <FinanceTable v-if="option11.data.length" :option="option11" />
          </div>
        </div>
        <div
          class="item-box"
          v-if="payOrder.errorType && payOrder.orderType !== 'transfer_prepay'"
        >
          <div class="title">付错信息</div>
          <div class="info-box">
            <div class="base-item">
              <span class="sub-title">关联付款单号：</span>
              {{ payOrder.refPayOrderNo }}
            </div>
            <div class="base-item">
              <span class="sub-title">付错原因：</span>
              {{ dictMapObj.payErrorType[payOrder.errorType] }}
            </div>
            <div class="base-item">
              <span class="sub-title">责任方：</span>
              {{ dictMapObj.payErrorResponsibleType[payOrder.responsibleType] }}
            </div>
            <div class="base-item">
              <span class="sub-title">责任人：</span>
              {{ payOrder.responsibleName }}
            </div>
            <div class="base-item">
              <span class="sub-title">处理方式：</span>
              {{ dictMapObj.payErrorDisposalType[payOrder.errorDisposalType] }}
            </div>
            <div class="base-item">
              <span class="sub-title">处理状态：</span>
              {{ payOrder.errorDisposalStatus == 'yes' ? '已处理' : '未处理' }}
            </div>
            <div class="base-item">
              <span class="sub-title">关闭原付款单：</span>
              {{ payOrder.hasColseSrcOrder == 'yes' ? '是' : '否' }}
            </div>
            <div class="base-item">
              <span class="sub-title">备注说明：</span>
              {{ payOrder.errorRemark }}
            </div>
          </div>
        </div>

        <div
          class="table-box"
          v-show="this.option3.data && this.option3.data.length"
        >
          <div class="title-box">
            <div class="title">
              费用列表
              <template v-if="allWriteoff">
                <span>
                  核销：
                  <b :key="index" v-for="(value, key, index) in allWriteoff"
                    >{{ key }} {{ value.toFixed(2) }}</b
                  >
                </span>
              </template>
              <template v-if="allSettle">
                <span>
                  折币：
                  <b :key="index" v-for="(item,index) in totalWriteoffAmt"
                    >{{ item.currency }} {{ item.writeoffAmt.toFixed(2) }}</b
                  >
                </span>
              </template>
            </div>
            <div class="btn">
              <el-button
                @click="changeRate"
                size="mini"
                v-show="
                  checkAuth($route.name, 'btn-changeRate') &&
                  option3.data.length &&
                  payOrder.confirmStatus === 'pass' &&
                  payOrder.payStatus !== 'pay_close' &&
                  payOrder.payWriteoffStatus === 'no'
                "
                >一键修改核销汇率</el-button
              >
              <el-button
                style="line-height: 12px;"
                @click="feeSearchToggle = !feeSearchToggle"
                size="mini"
                type="primary"
              >{{feeSearchToggle?'隐藏': '显示'}}搜索条件</el-button>
              <div @click="toggleTable(2)" class="toggle">
                <template v-if="showTable[2]">
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
          <DetailFeeSearch v-show="feeSearchToggle && showTable[2]" ref="detailFeeSearch" :list="option3.data" @search="detailFeeSearch" :keyObj="{currency:'originalCurrency'}"/>
          <FinanceTable style="margin-top:6px"
            :option="option3"
            @send-multi="sendMulti"
            v-show="showTable[2]"
          />
        </div>
        <div class="item-box" v-if="writeoffReverseList.length">
          <div class="title">反核销记录</div>
          <div class="info-box">
            <div
              :key="index"
              class="base-item-list"
              v-for="(item, index) in writeoffReverseList"
            >
              <div class="base-item">
                <span class="sub-title">反核销单号：</span>
                {{ item.writeoffReverseNo }}
              </div>
              <div class="base-item">
                <span class="sub-title">反核销人：</span>
                {{ item.createdName }}
              </div>
              <div class="base-item">
                <span class="sub-title">反核销时间：</span>
                {{ item.createdTime }}
              </div>
              <div class="base-item">
                <span class="sub-title reveser">关联的核销单号：</span>
                {{ item.writeoffReceipayNo }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 汇率弹出框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="rateDiaologOpen"
      class="self-dialog"
      width="600px"
    >
      <FinanceTable :option="option4" />
      <div
        class="dialog-footer"
        slot="footer"
        v-show="
          payOrder.confirmStatus === 'pass' &&
          payOrder.payStatus !== 'pay_close' &&
          payOrder.payWriteoffStatus === 'no' &&
          dialogTitle === '核销汇率'
        "
      >
        <el-button @click="submitRate" size="mini" type="primary"
          >提交</el-button
        >
        <el-button @click="closeRateDialog" size="mini">取 消</el-button>
      </div>
    </el-dialog>
    <MarkError
      :dialogShow="showErrorDialog"
      :info="info"
      @closeDilog="closeMarkError"
      @saveSuc="getInfo"
      v-if="showErrorDialog"
    />
    <!-- 购汇记录 -->
    <el-dialog
      :visible.sync="exchangeDialog"
      class="self-dialog"
      title="添加购汇记录"
      width="800px"
    >
      <div class="exchange-form-box">
        <el-form
          :inline="true"
          :model="exchangeData"
          :rules="exchangeDataRules"
          label-width="100px"
          ref="exchangeForm"
          size="mini"
        >
          <el-form-item label="购汇币种:" prop="currency">
            <el-select
              @change="getBankAccountList"
              placeholder="请选择"
              v-model="exchangeData.currency"
            >
              <el-option
                :key="item.code"
                :label="item.code"
                :value="item.code"
                v-for="item in currencyList"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="购汇金额:" prop="amt">
            <el-input v-model="exchangeData.amt"></el-input>
          </el-form-item>
          <el-form-item label="我司银行简称:" prop="payAccountShortName">
            <el-select
              @change="chooseBank"
              placeholder="请选择"
              v-model="exchangeData.payAccountShortName"
            >
              <el-option
                :key="item.accountShortName"
                :label="item.accountShortName"
                :value="item.accountShortName"
                v-for="item in bankList"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="账户结算方式：" prop="settleMode"  :rules="{ required: exchangeData.bankAccountSettleModeList.length, message: ' ', trigger: 'change' }" >
              <el-select v-model="exchangeData.settleMode" clearable placeholder="请选择账户结算方式">
                <el-option
                v-for="item in exchangeData.bankAccountSettleModeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          <el-form-item label="我司账户名:" prop="payAccountName">
            <el-input disabled v-model="exchangeData.payAccountName"></el-input>
          </el-form-item>
          <el-form-item label="我司银行名称:" prop="payBankName">
            <el-input disabled v-model="exchangeData.payBankName"></el-input>
          </el-form-item>
          <el-form-item label="我司账号:" prop="payAccountNo">
            <el-input disabled v-model="exchangeData.payAccountNo"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="dialog-footer" slot="footer">
        <el-button @click="submitExchange" size="mini" type="primary"
          >提交</el-button
        >
        <el-button @click="closeExchange" size="mini">取消</el-button>
      </div>
    </el-dialog>
    <!-- 修改核销汇率 -->
    <el-dialog
      :visible.sync="exchangeRateDialog"
      class="self-dialog"
      title="修改核销汇率"
      width="600px"
    >
      <FinanceTable :option="option6" />
      <div class="dialog-footer" slot="footer">
        <el-button @click="submitExchangeRate" size="mini" type="primary"
          >提交</el-button
        >
        <el-button @click="closeExchangeDialog" size="mini">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 关联预付抵账 -->
    <template v-if="relevancePrepayDialogShow">
      <el-dialog
        :visible.sync="relevancePrepayDialogShow"
        class="self-dialog"
        :title="relevanceMark === 'withholdingTax' ? '关联支付平台代付手续费抵扣' : '关联预付抵账'"
        width="1100px"
      >
        <FinanceSearch :searchOption="relevanceMark === 'withholdingTax' ? searchOption2 : searchOption1" @search="search" />
        <FinanceTable ref="relevancePrepayTable" :option="option8" @send-multi="sendMulti" />
        <span class="dialog-footer" slot="footer">
          <el-button @click="relevancePrepayConfirm" size="mini" type="primary"
            >确定</el-button
          >
          <el-button @click="closeRelevancePrepay" size="mini">关闭</el-button>
        </span>
      </el-dialog>
  </template>
  <FinanceDialogTable :option="transferFeeDialog"/>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { dateFormat } from '@/views/finance/utils/finance'
import {
  queryPayOrderInfo,
  saveWriteoffPayOrder,
  queryUsablePrepayDedueList,
  usablePrepayDedueList,
  prepayAccountBalance,
  paymentPlatformBalance,
  queryPrepayOrderTransfer,
  modifyPayOrderAndTransfer,
  payFixedTranferFeeBulid
} from '@/api/fin/pay'
import { listTransferFeeAllot } from '@/api/fin/writeoffRecv'
import { baseCurrencyList, actualExchangeRate } from '@/api/base'
import { bankAccountList } from '@/api/fin/settleUnit'
import DetailFeeSearch from '@/views/finance/components/financeSearch/detailFeeSearch'
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import ClipboardUpload from '@/views/finance/components/financeUpload/clipboardUpload'
import MarkError from './components/markError'
import FinanceDialogTable from '@/views/finance/components/financeDialog/tableDialog'
import itemVue from '@/components/Form/item.vue'
let TFEETYPE = [] //内外扣类型
var height = document.body.clientHeight -99
let screenHeight = { height: height + 'px' };
export default {
  mixins: [mixin, routerMixin],
  components: {
    FinanceTable,
    MarkError,
    FinanceSearch,
    DetailFeeSearch,
    ClipboardUpload,
    FinanceDialogTable
  },
  data() {
    return {
      feeSearchToggle: false, //费用搜索默认显示
      bankAccountSettleModeList:[],
      screenHeight,
      relevanceMark:'',
      settleCompCode:'',
      payOrderNo: '',
      info: {}, 
      payOrder: {
        applyAmt:'',
        payAccount: {},
        confirmStatus: '',
        payStatus: '',
        payWriteoffStatus: '', 
        payWay:'',
        bankseqFileNo:'',
        payTime:'',
        realPayAmt:'',
        lessPayDealway:'',
        greatPayDealway:'',
        payAccountName:'',
        payAccountNo:'',
        bankSeqNo:'',
        lessPayAmt:'',
        greatPayAmt:'',
        settleMode:'',
        remark:'',
        payInfo:{}
      },
      settleExRateSummarys: [],
      writeoffExRateSummarys: [],
      writeoffReverseList: [],
      writeoffPay: {},
      prepayUsables: {},
      payPurchaseForeignExchange: {},
      writeoffExRate: '',
      returnAmt: 'returnAmt',
      transferFeeDialog: {
        title:'分摊详情',
        show: false,
        width:'700px',
        buttonHide: true,
        tableOption: { pagination: false, selection: false, data: [],columns: [
            { prop: 'settleCompName', label: '分公司', type: 'text', minWidth: 230, },
            { prop: 'orderNo', label: '工作单号', type: 'text', minWidth: 150, },
            { prop: 'bdEmployeeName', label: '业务员', type: 'text', },
            { prop: 'allotAmt', label: '分摊金额', type: 'text', },
          ],
        },
      },
      payOrderRules: {
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
        lessPayDealway: [
          {
            required: true,
            message: '处理科目不能为空',
            trigger: 'blur'
          }
        ],
        greatPayDealway: [
          {
            required: true,
            message: '多付处理科目不能为空',
            trigger: 'blur'
          }
        ]
      },
      option1: {},
      option2: {},
      option3: {  data:[] },
      option4: {},
      option5: {},
      option6: {},
      option7: {},
      option8: {},
      option9: {},
      option11: {},
      showTable: [false, false, true, true],
      rateDiaologOpen: false,
      dialogTitle: '结算汇率',
      showErrorDialog: false,
      allTransferFeeList: 0,
      allWriteoff: '',
      allSettle: '',
      exchangeData: {
        currency: '',
        amt: '',
        exRate: '',
        payBankAccountId: '',
        payBankCode: '',
        payBankName: '',
        payBankBranch: '',
        payAccountNo: '',
        payAccountName: '',
        payAccountShortName: '',
        settleMode: '',
        bankAccountSettleModeList:[]
      },
      exchangeDataRules: {
        currency: {
          required: true,
          message: ' ',
          trigger: 'blur'
        },
        amt: {
          required: true,
          message: ' ',
          trigger: 'blur'
        },
        payAccountShortName: {
          required: true,
          message: ' ',
          trigger: 'blur'
        }
      },
      exchangeDialog: false,
      currencyList: [],
      bankList: [],
      multipleSelection3: [],
      exchangeRateDialog: false,
      exchageRateList: [],
      multipleSelection8: [],
      relevancePrepayDialogShow: false,
      prepayAccount: [],
      paymentPlatformList:[],
      searchOption1: {
        columns: [
          {
            disabled: true,
            label: '结算单位',
            prop: 'settleCorpCode',
            type: 'input',
            placeholder: '',
            width: 150
          },
          {
            label: '付款单号',
            prop: 'payOrderNo',
            type: 'input'
          },
          // {
          //   label: '预付款申请单号',
          //   prop: 'payApplyPrepayNo',
          //   type: 'input'
          // },
          {
            label: '币种',
            prop: 'currency',
            type: 'input',
            placeholder: '',
            disabled: true
          }
        ],
        data: {
          settleCorpCode: '',
          payOrderNo: '',
          payApplyPrepayNo: '',
          currency: ''
        }
      },
      searchOption2: {
        columns: [
          {
            label: '付款单号',
            prop: 'payOrderNo',
            type: 'input'
          },
          // {
          //   label: '预付款申请单号',
          //   prop: 'payApplyPrepayNo',
          //   type: 'input'
          // },
          {
            label: '币种',
            prop: 'currency',
            type: 'input',
            placeholder: '',
            disabled: true
          }
        ],
        data: {
          settleCorpCode: '',
          payOrderNo: '',
          payApplyPrepayNo: '',
          currency: ''
        }
      },
      loading: false,
      payAccountShortNameList:[],
    }
  },
  created() {
    this.init()
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
    // allTransferFeeList () {
    // 	if (this.option1.data) {
    // 		let transferFees = this.option1.data.reduce((pre, cur) => {
    // 			return cur.inter_cut ? pre += Number(cur.inter_cut) : pre
    // 		}, 0)
    // 		return transferFees
    // 	} else {
    // 		return 0
    // 	}
    // },
    modelWithholdingTax(){
      let val = false
      if(this.option1.data.length){
        for (let i = 0; i < this.option1.data.length; i++) {
          if(this.option1.data[i] && this.option1.data[i].cutType === "payment_channel_transfer"){ // 有遇到transferFees: [null]的数据
            val = true
          }
        }
      }
      if(!val){
        this.option9.data = []
        // this.paymentPlatformBalance()
      }else{
        this.paymentPlatformBalance()
      }
      return val
    },
    disableForm() {
      return !(
        this.payOrder.confirmStatus === 'pass' &&
        this.payOrder.payStatus !== 'pay_close' &&
        this.payOrder.payWriteoffStatus === 'no'
      )
    },
    ...mapState({
      userName: state => state.user.name
    }),
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
    payOrderApplyAmt(){
      if(!this.option1.data.length) return
      let arr = this.option1.data.filter((keys) => keys.cutType === "payment_channel_transfer")
      let sum = arr.reduce((a, b) => Number(a) + Number(b.amt), 0)
      this.currentUseAmtModel(this.option9.data,sum)
      return sum
    },
    payOrderCurrency(){
      if(!this.option1.data.length) return  this.payOrder.currency
      let arr = this.option1.data.filter((keys) => keys.cutType === "payment_channel_transfer")
      if(!arr.length) return  this.payOrder.currency
      if(this.option9.data.find(v=>v.currency !== arr[0].currency)){
        this.option9.data = []
        // this.paymentPlatformBalance()
      }
      return  arr[0].currency
    },
    payOrderPayWay(){
      if(this.payOrder.payWay !== 'prepay_dedue'){
        this.option7.data = []
      }else{
        this.prepayAccountBalance()
      }
      return this.payOrder.payWay === 'prepay_dedue'
    },
    paymentPlatformListChange(){
      let paymentPlatformList =  []
        let sum = 0
        let currency = ''
        if(this.option9.data.length){
          sum = this.option9.data.reduce((a, b) => Number(a) + Number(b.currentUseAmt), 0)
          currency = this.option9.data[0].currency
        }
        this.paymentPlatformList.forEach(item=>{
          if(item.currency === currency){
            paymentPlatformList.push({
              balance:item.balance-sum,
              currency:item.currency
            })
          }else{
            paymentPlatformList.push({
              balance:item.balance,
              currency:item.currency
            })
          }
          
        })
        return paymentPlatformList
    },
  },
  watch: {
    'option1.data': {
      handler() {
        if (this.disableForm) {
          return
        }
        if (this.option1.data.length && this.payOrder.orderType !=='prepay_to_repay') {
          const transferFees = this.option1.data.reduce((pre, cur) => {
            return cur.cutType === 'inter_cut' ? (pre += Number(cur.amt)) : pre
          }, 0)
          this.allTransferFeeList = transferFees
        } else {
          this.allTransferFeeList = 0
        }
        const total = (
          this.allTransferFeeList + Number(this.payOrder.applyAmt || 0)
        ).toFixed(2)
        const greatPayAmt = +this.payOrder.greatPayAmt
        const lessPayAmt = +this.payOrder.lessPayAmt
        const realPayAmt = +this.payOrder.realPayAmt
        if (realPayAmt >= total) {
          if (!greatPayAmt) {
            this.payOrder.realPayAmt = total
          } else {
            this.payOrder.greatPayAmt = realPayAmt - total
          }
        } else {
          if (!lessPayAmt) {
            this.payOrder.realPayAmt = total
          } else {
            this.payOrder.lessPayAmt = total - this.payOrder.applyAmt
          }
        }
        this.changeRealPayAmt()
      },
      deep: true,
      immediate: true,
    },
    'payOrder.realPayAmt'(newValue, oldValue) {
      if (this.option5.data.length) {
        if (newValue > 0) {
          const amt = this.option5.data[0].amt
          this.option5.data[0].exRate = (newValue / amt).toFixed(4)
        }
      }
    }
  },
  activated() {
    if (!this.$route.meta.isUseCache) {
      this.init()
      if (this.$refs.query) [this.$refs.query.resetFields()]
      this.payOrderNo = this.$route.query.payOrderNo
      this.getInfo()
    }
  },
  methods: {
    // 初始化
    init() {
      this.showErrorDialog = false
      const operationBtns = Object.assign({}, this.option.operationBtns, {
        data: [{ label: '删除', type: 'text', action: 'Delete', showFn: row => {
          return row.cutType !== 'fixed'
        } }], // show: true
        width: 100
      })
      this.option1 = Object.assign({}, this.option, {
        id: 'option1', $name: 'OrderDetails1',
        tips: {
          text: '',
          show: false
        },
        selection: {
          show: false
        },
        operationBtns,
        pagination: false,
        edit: true
      })
      this.columns1_common = [ // this.columns1_hk_china = [ // columns1_fixed_trfFee
        {
          prop: 'cutType',
          label: '手续费类型',
          type: 'select',
          selectOptions: TFEETYPE,
          change: (value, row, item) => { this.cutTypeChange(value, row, item) }
        },
        {
          prop: 'assumerType',
          label: '手续费承担人',
          type: 'select',
          propInDict: 'transferFeeAssumerType',
          readOnly: true
        },
        {
          prop: 'currency',
          label: '币种',
          type: 'select',
          key: 'currency',
          propInDict: 'validCurrency',
          change:(value, row, item)=>{
           if(row.cutType === 'payment_channel_transfer'){
            //  this.paymentPlatformBalance()
           }
          }
        },
        { prop: 'amt', label: '金额', type: 'input', key: 'amt',
          validateInput:(value, row, item)=>{
           if((this.payOrder.orderType === 'settle_pay') || this.payOrder.orderType === 'prepay_to_repay'){
             row.allotAmt = value
           }
          }
        },
        {
          prop: 'allotAmt',
          label: '本次分摊金额',
          type: this.payOrder.payWriteoffStatus === 'yes' ? 'button' : 'input',
          inputType: 'number',
          callback:({transferFeeId, writeoffReceipayNo})=>{
            let data = { currPage: 1, pageSize: 1000, query: [
              { column: 'transferFeeId', type: 'eq', value: transferFeeId },
              { column: 'writeoffReceipayNo', type: 'eq', value: writeoffReceipayNo },
              ],}
            listTransferFeeAllot(data).then(res=>{
              this.transferFeeDialog.tableOption.data = res.data.list || []
              this.transferFeeDialog.show = true
              // console.log(res)
            })
          }
        }
      ]
      // 废弃
      // this.columns1_simplified = [
      //   {
      //     prop: 'cutType',
      //     label: '手续费类型',
      //     type: 'select',
      //     selectOptions: TFEETYPE,
      //     change: (value, row, item) => { this.cutTypeChange(value, row, item) }
      //   },
      //   {
      //     prop: 'currency',
      //     label: '币种',
      //     type: 'select',
      //     key: 'currency',
      //     propInDict: 'validCurrency',
      //     change:(value, row, item)=>{
      //      if(row.cutType === 'payment_channel_transfer'){
      //       //  this.paymentPlatformBalance()
      //      }
      //     }
      //   },
      //   { prop: 'amt', label: '金额', type: 'input', key: 'amt',
      //     validateInput:(value, row, item)=>{
      //      if((this.payOrder.orderType === 'settle_pay') || this.payOrder.orderType === 'prepay_to_repay'){
      //        row.allotAmt = value
      //      }
      //     }
      //   }
      // ]
      this.columns1_prepay_to_repay = [
        {
          prop: 'cutType',
          label: '手续费类型',
          type: 'select',
          selectOptions: TFEETYPE,
          change: (value, row, item) => { this.cutTypeChange(value, row, item) }
        },
        {
          prop: 'assumerType',
          label: '手续费承担人',
          type: 'select',
          propInDict: 'transferFeeAssumerType',
          readOnly: true
        },
        {
          prop: 'currency',
          label: '币种',
          type: 'select',
          key: 'currency',
          propInDict: 'validCurrency',
          change:(value, row, item)=>{
          if(row.cutType === 'payment_channel_transfer'){
            // this.paymentPlatformBalance()
          }
          }
        },
        { prop: 'amt', label: '金额', type: 'input', key: 'amt',
          validateInput:(value, row, item)=>{
          if((this.payOrder.orderType === 'settle_pay') || this.payOrder.orderType === 'prepay_to_repay'){
            row.allotAmt = value
          }
          }
        },
        {
          prop: 'hasAllotAmt',
          label: '已分摊金额',
          type: 'text',
          inputType: 'number'
        },
        {
          prop: 'allotAmt',
          label: '本次分摊金额',
          type: this.payOrder.payWriteoffStatus === 'yes' ? 'button' : 'input',
          inputType: 'number',
          // type: 'button',
          callback:({transferFeeId, writeoffReceipayNo})=>{
            let data = { currPage: 1, pageSize: 1000, query: [
              { column: 'transferFeeId', type: 'eq', value: transferFeeId },
              { column: 'writeoffReceipayNo', type: 'eq', value: writeoffReceipayNo },
              ],}
            listTransferFeeAllot(data).then(res=>{
              this.transferFeeDialog.tableOption.data = res.data.list || []
              this.transferFeeDialog.show = true
              // console.log(res)
            })
          }
        }
      ]
      this.columns1_common = [
        {
          prop: 'cutType',
          label: '手续费类型',
          type: 'select',
          selectOptions: TFEETYPE,
          change: (value, row, item) => { this.cutTypeChange(value, row, item) }
        },
        {
          prop: 'assumerType',
          label: '手续费承担人',
          type: 'select',
          propInDict: 'transferFeeAssumerType',
          readOnly: true
        },
        {
          prop: 'currency',
          label: '币种',
          type: 'select',
          key: 'currency',
          propInDict: 'validCurrency',
          change:(value, row, item)=>{
          if(row.cutType === 'payment_channel_transfer'){
            // this.paymentPlatformBalance()
          }
          }
        },
        { prop: 'amt', label: '金额', type: 'input', key: 'amt',
          validateInput:(value, row, item)=>{
          if((this.payOrder.orderType === 'settle_pay') || this.payOrder.orderType === 'prepay_to_repay'){
            row.allotAmt = value
          }
          }
        },
        {
          prop: 'allotAmt',
          label: '本次分摊金额',
          type: this.payOrder.payWriteoffStatus === 'yes' ? 'button' : 'input',
          inputType: 'number',
          callback:({transferFeeId, writeoffReceipayNo})=>{
            let data = { currPage: 1, pageSize: 1000, query: [
              { column: 'transferFeeId', type: 'eq', value: transferFeeId },
              { column: 'writeoffReceipayNo', type: 'eq', value: writeoffReceipayNo },
              ],}
            listTransferFeeAllot(data).then(res=>{
              this.transferFeeDialog.tableOption.data = res.data.list || []
              this.transferFeeDialog.show = true
              // console.log(res)
            })
          }
        }
      ]
      // this.columns1_cmb_withhold = [
      //   {
      //     prop: 'cutType',
      //     label: '手续费类型',
      //     type: 'select',
      //     selectOptions: TFEETYPE,
      //     change: (value, row, item) => { this.cutTypeChange(value, row, item) }
      //   },
      //   {
      //     prop: 'assumerType',
      //     label: '手续费承担人',
      //     type: 'select',
      //     propInDict: 'transferFeeAssumerType',
      //     readOnly: true
      //   },
      //   {
      //     prop: 'currency',
      //     label: '币种',
      //     type: 'select',
      //     key: 'currency',
      //     propInDict: 'validCurrency',
      //     change:(value, row, item)=>{
      //     if(row.cutType === 'payment_channel_transfer'){
      //       // this.paymentPlatformBalance()
      //     }
      //     }
      //   },
      //   { prop: 'amt', label: '金额', type: 'input', key: 'amt',
      //     validateInput:(value, row, item)=>{
      //     if((this.payOrder.orderType === 'settle_pay') || this.payOrder.orderType === 'prepay_to_repay'){
      //       row.allotAmt = value
      //     }
      //     }
      //   },
      //   {
      //     prop: 'allotAmt',
      //     label: '本次分摊金额',
      //     type: this.payOrder.payWriteoffStatus === 'yes' ? 'button' : 'input',
      //     inputType: 'number',
      //     callback:({transferFeeId, writeoffReceipayNo})=>{
      //       let data = { currPage: 1, pageSize: 1000, query: [
      //         { column: 'transferFeeId', type: 'eq', value: transferFeeId },
      //         { column: 'writeoffReceipayNo', type: 'eq', value: writeoffReceipayNo },
      //         ],}
      //       listTransferFeeAllot(data).then(res=>{
      //         this.transferFeeDialog.tableOption.data = res.data.list || []
      //         this.transferFeeDialog.show = true
      //         // console.log(res)
      //       })
      //     }
      //   }
      // ]
      this.option1.columns = this.columns1_common
      this.option2 = Object.assign({}, this.option, {
        id: 'option2', $name: 'OrderDetails2',
        tips: {
          text: '',
          show: false
        },
        index: true,
        selection: {
          show: false
        },
        operationBtns: false,
        pagination: false
      })
      const columns2 = [
        {
          prop: 'invoiceNo',
          label: '发票号',
          type: 'button',
          width: 120,
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
        {
          prop: 'invoiceType',
          label: '开票类型',
          type: 'text',
          formatter: ({ cellValue, column, row, item }) => {
            return row['invoiceType'] === 'electronic' ? '电子发票' : '纸制发票'
          }
        },
        {
          prop: 'amt',
          label: '开票金额',
          type: 'text'
        },
        {
          prop: 'currency',
          label: '开票币种',
          type: 'text'
        },
        {
          prop: 'rate',
          label: '开票汇率',
          type: 'text'
        },
        {
          prop: 'taxRate',
          label: '开票税率',
          type: 'text'
        },
        {
          prop: 'taxAmt',
          label: '税额',
          type: 'text'
        },
        {
          prop: 'invoiceAmt',
          label: '关联金额',
          type: 'text'
        },
        {
          prop: 'createdName',
          label: '登记人',
          type: 'text'
        },
        {
          prop: 'createdTime',
          label: '登记时间',
          type: 'text'
        }
      ]
      this.option2.columns = columns2
      this.option3 = Object.assign({}, this.option, {
        id: 'option3', $name: 'OrderDetails3',
        data: [],
        tips: {
          text: '',
          show: false
        },
        edit: true,
        sortable: true,
        sortChange: this.sortChange,
        operationBtns: false,
        pagination: false
      })
      const columns3 = [
        {
          prop: 'sourceBizNo',
          label: '单号',
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
          prop: 'settleOrderNo',
          label: '结算单号',
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
        {
          prop: 'payApplyNo',
          label: '付款申请单号',
          type: 'columnTip',
          width: 120,
          sortable:true,
          component: 'ColumnTip',
          componentProps: {
            show: false,
            callback: (no, { row }) => {
              this.showOneNoDetail('paySettleApplyNo', row.payApplyNo)
            }
          }
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
          label: '应收应付',
          type: 'text',
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
          prop: 'originalCurrency',
          label: '原币种',
          type: 'text'
        },
        {
          prop: 'oldSettleAmt',
          label: '原金额',
          type: 'text'
        },
        {
          prop: 'settleAmt',
          label: '可核销原币金额',
          type: 'text',
          width: 100
        },
        {
          prop: 'writeoffFeeAmt',
          label: '核销原币金额',
          type: 'input',
          width: 100,
          validateInput: (val, row, item, change) => {
            if (change) {
              if (!/^\d+(\.\d{0,2})?$/.test(val)) {
                return this.$message({
                  type: 'error',
                  message: '请输入正确的数字！',
                  showClose: true
                })
              }
              if (Number(val) > Number(row.settleAmt)) {
                this.$msgErrClose('核销原币金额不能大于可核销原币金额')
              }
              this.$nextTick(() => {
                row.writeoffAmt = (
                  row.writeoffFeeAmt * row.writeoffExRate
                ).toFixed(2)
                this.countTotalSettle()
              })
            }
          }
        },
        {
          prop: 'settleCurrency',
          label: '结算币种',
          type: 'text'
        },
        {
          prop: 'settleExRate',
          label: '结算汇率',
          type: 'text'
        },
        {
          prop: 'writeoffCurrency',
          label: '付款币种',
          type: 'text'
        },
        {
          prop: 'writeoffExRate',
          label: '核销汇率',
          type: 'text'
        },
        {
          prop: 'writeoffAmt',
          label: '折币金额',
          type: 'text'
        },
        {
          prop: 'taxRate',
          label: '税率',
          type: 'text'
        },
        {
          prop: 'taxAmt',
          label: '税额',
          type: 'text'
        },
        {
          prop: 'feeAmtWithoutTax',
          label: '不含税金额',
          type: 'text'
        },
        {
          prop: 'invoiceAmt',
          label: '已开票金额',
          type: 'text'
        },
        {
          prop: 'canInvoiceAmt',
          label: '可开票金额',
          type: 'text'
        },
        { 
          prop: 'invoiceStatus',
          label: '开票状态',
          type: 'text',
          formatter:({row})=>{
            const statusName = this.dictMapObj.feeInvoiceStatus[row.invoiceStatus]
            if (row.invoiceStatus === 'receive') {
              return '<span style="color:#CD4130">'+statusName+'</span>'
            } else if (row.invoiceStatus === 'pay') {
              return '<span style="color:#33B18A">'+statusName+'</span>'
            } else {
              return statusName
            }
          }
        },
        {
          prop: 'serviceName',
          label: '服务项',
          type: 'text'
        },
        {
          prop: 'feeUnit',
          label: '计费单位',
          type: 'select',
          propInDict: 'feeUnit',
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
          prop: 'finDate',
          label: '财务日期',
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
        {
          prop: 'applyPayAmt',
          label: '付款金额',
          type: 'text'
        }
      ]
      this.option3.columns = columns3
      this.option4 = Object.assign({}, this.option, {
        id: 'option4', $name: 'OrderDetails4',
        data: [],
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
      const columns4 = [
        {
          prop: 'originalCurrency',
          label: '原币种',
          type: 'text'
        },
        {
          prop: 'settleCurrency',
          label: '核销币种',
          type: 'text'
        },
        {
          prop: 'writeoffExRate',
          label: '核销汇率',
          type: 'input',
          validateInput: (val, row, item, change) => {
            if (change) {
              if (!/^\d+(\.\d{0,10})?$/.test(val)) {
                this.$message({
                  type: 'error',
                  message: '请输入正确的汇率！',
                  showClose: true
                })
                // let res = /\d+(\.\d{0,4})?/g.exec(val)
                // row[item.prop] = res ? res[0] : ''
              }
            }
          }
        }
        // {
        //   prop: 'settleExRate',
        //   label: '结算汇率',
        //   type: 'text'
        // }
      ]
      this.option4.columns = columns4
      const operationBtns5 = Object.assign({}, this.option.operationBtns, {
        data: [{ label: '删除', type: 'text', show: true, action: 'Delete' }],
        width: 100,
        callback: (action, $index, row, option) => {
          if (action === 'Delete') {
            this.option5.data = []
          }
        }
      })
      this.option5 = Object.assign({}, this.option, {
        id: 'option5', $name: 'OrderDetails5',
        data: [],
        tips: {
          text: '',
          show: false
        },
        selection: {
          show: false
        },
        operationBtns: operationBtns5,
        pagination: false,
        // edit: true
      })
      const columns5 = [
        {
          prop: 'currency',
          label: '购汇币种',
          type: 'text'
        },
        {
          prop: 'amt',
          label: '购汇金额',
          type: 'text'
        },
        {
          prop: 'exRate',
          label: '购汇汇率',
          type: 'text'
        },
        {
          prop: 'payAccountShortName',
          label: '我司银行简称',
          type: 'text'
        },
        {
          prop: 'settleMode',
          label: '账户结算方式',
          type: 'select',
          propInDict: 'bankAccountSettleMode' 
        },
        {
          prop: 'payAccountName',
          label: '我司账户名',
          type: 'text'
        },
        {
          prop: 'payBankName',
          label: '我司银行名称',
          type: 'text'
        },
        {
          prop: 'payAccountNo',
          label: '我司账号',
          type: 'text'
        },
        {
          prop: 'createdName',
          label: '创建人',
          type: 'text'
        },
        {
          prop: 'createdTime',
          label: '创建时间',
          type: 'text'
        }
      ]
      this.option5.columns = columns5
      this.option6 = Object.assign({}, this.option, {
        id: 'option6', $name: 'OrderDetails6',
        data: [],
        tips: false,
        selection: false,
        operationBtns: false,
        pagination: false,
        edit: true
      })
      const columns6 = [
        {
          prop: 'originalCurrency',
          label: '原币种',
          type: 'text'
        },
        {
          prop: 'settleCurrency',
          label: '核销币种',
          type: 'text'
        },
        {
          prop: 'writeoffExRate',
          label: '结算汇率',
          type: 'input',
          inputType:'number',
          dot:10
        }
      ]
      this.option6.columns = columns6
      // 关联预付款弹窗
      const operationBtns7 = Object.assign({}, this.option.operationBtns, {
        data: [
          { label: '上移', type: 'text', showFn: (row, index)=> index !== 0, action: 'Upper' },
          { label: '下移', type: 'text', showFn: (row, index)=>  this.option7.data.length-1 !== index, action: 'Below' },
          { label: '删除', type: 'text', show: true, action: 'Delete' }
        ],
        width: 140,
        callback: (action, $index, row, option) => {
          if (action === 'Delete') {
            if(option.id === 'option7'){
              const payOrderId = row.payOrderId
              this.option1.data = this.option1.data.filter(
                item => item.payOrderId !== payOrderId
              )
              this.option7.data.splice($index, 1)
              // 重新分配关联金额
              this.currentUseAmtModel(this.option7.data,this.payOrder.applyAmt)
              this.prepayAccountBalance()
            }
          }
          if (action === 'Upper') {
            if(option.id === 'option7'){
              console.log(action, $index, row, option);
              let item = this.option7.data.splice($index, 1)
              this.option7.data.splice($index-1, 0, item[0])
              this.currentUseAmtModel(this.option7.data,this.payOrder.applyAmt)
              this.queryPrepayOrderTransfer()
            }
          }
          if (action === 'Below') {
            if(option.id === 'option7'){
              let item = this.option7.data.splice($index, 1)
              this.option7.data.splice($index+1, 0, item[0])
              this.currentUseAmtModel(this.option7.data,this.payOrder.applyAmt)
              this.queryPrepayOrderTransfer()
            }
          }
        }
      })
      this.option7 = Object.assign({}, this.option, {
        id: 'option7', $name: 'OrderDetails7',
        data: [],
        tips: false,
        selection: false,
        index:{
          show: true
        },
        operationBtns: operationBtns7
      })
      const columns7 = [
        { prop: 'settleCompName', label: '所属分公司', type: 'text' },
        { prop: 'payOrderNo', label: '付款单号', type: 'button', 
          operationBtns: {
            show: true,
            callback: (fn, index, row) => {
              this.showOneNoDetail('pay_order', row.payOrderNo, { from: 'OrderFee' })
            }
          }
        },
        { prop: 'settleCorpName', label: '结算单位', type: 'text' },
        { prop: 'currency', label: '付款币种', type: 'text' },
        { prop: 'realpayAmt', label: '付款金额', type: 'text' }, // balance
        {
          prop: 'currentUseAmt',
          label: '关联金额',
          type: 'text',// remainingAmount
          formatter: ({row}) => {
            return row.currentUseAmt.toFixed(2)
          }
          
        }
      ]
      this.option7.columns = columns7
      const listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
      this.option8 = Object.assign({}, this.option, {
        id: 'option8', $name: 'OrderDetails8',
        data: [],
        tips: {
          text: '',
          show: false
        },
        selection: {
          show: true,
          fixed: true
        },
        operationBtns: false,
        listAmtSummary
      })
      const columns8 = [
        { prop: 'payApplyPrepayNo', label: '预付款申请单号', type: 'text' },
        { prop: 'settleCompName', label: '所属分公司', type: 'text' },
        { prop: 'payOrderNo', label: '付款单号', type: 'select' },
        { prop: 'settleCorpName', label: '结算单位', type: 'text' },
        { prop: 'currency', label: '付款币种', type: 'text' },
        { prop: 'realpayAmt', label: '付款金额', type: 'text' }, // balance
        {
          prop: 'balance',
          label: '剩余可用金额',
          type: 'text' // remainingAmount
          // formatter: (row, pItem) => {
          //   return row.balance - row.usedAmt
          // }
        },
        { prop: 'payTime', label: '付款时间', type: 'text' },
      ]
      this.option8.columns = columns8

      // const operationBtns9 = Object.assign({}, this.option.operationBtns, {
      //   data: [
      //     { label: '删除', type: 'text', show: true, action: 'Delete' },
      //     { label: '关联支付平台预付款单号', type: 'text', show: true, action: 'Save' }
      //   ],
      //   width: 100
      // })
      // 关联预付款弹窗
      const operationBtns9 = Object.assign({}, this.option.operationBtns, {
        data: [{ label: '删除', type: 'text', show: true, action: 'Delete' }],
        width: 100,
        callback: (action, $index, row, option) => {
          if (action === 'Delete') {
            if(option.id === 'option9'){
              const payOrderId = row.payOrderId
              this.option1.data = this.option1.data.filter(
                item => item.payOrderId !== payOrderId
              )
              this.option9.data.splice($index, 1)
              // 重新分配关联金额
              this.currentUseAmtModel(this.option9.data,this.payOrderApplyAmt)
              // this.paymentPlatformBalance()
            }
            
          }
        }
      })
      this.option9 = Object.assign({}, this.option, {
        id: 'option9', $name: 'OrderDetails9',
        tips: {
          text: '',
          show: false
        },
        selection: {
          show: false
        },
        operationBtns: operationBtns9,
        pagination: false,
        edit: true
      })
      const columns9 = [
        { prop: 'settleCompName', label: '所属分公司', type: 'text' },
        { prop: 'payOrderNo', label: '付款单号', type: 'select' },
        { prop: 'settleCorpName', label: '结算单位', type: 'text' },
        { prop: 'currency', label: '付款币种', type: 'text' },
        { prop: 'realpayAmt', label: '付款金额', type: 'text' }, // balance
        {
          prop: 'currentUseAmt',
          label: '关联金额',
          type: 'text' // remainingAmount
        }
        // {
        //   prop: 'currency',
        //   label: '币种',
        //   type: 'select',
        //   key: 'currency',
        //   propInDict: 'validCurrency'
        // },
        // { prop: 'transferFeeAmt', label: '手续费金额', type: 'input', key: 'amt',
        //   // validateInput:(value, row, item)=>{
        //   //  if((this.payOrder.orderType === 'settle_pay') || this.payOrder.orderType === 'prepay_to_repay'){
        //   //    row.allotAmt = value
        //   //  }
        //   // }
        // },
        // { prop: 'allotAmt', label: '手续费分摊金额', type: 'input', key: 'allotAmt',},
        // { prop: 'prepayPayOrderNo', label: '预付款单号', type: 'text', key: 'prepayPayOrderNo',},
        // { prop: 'settleCorpName', label: '结算单位', type: 'text', key: 'settleCorpName',},
        // { prop: 'realpayAmt', label: '付款金额', type: 'text', key: 'realpayAmt',},
        // { prop: 'useAmt', label: '本次抵扣金额', type: 'text', key: 'useAmt',},
      ]
      this.option9.columns = columns9
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
        {
          prop: 'applyNo',
          label: '付款申请单号',
          type: 'button',
          width: 120,
          operationBtns: {
            show: true,
            callback: (action, index, row, option) => {
              this.showOneNoDetail('paySettleApplyNo', row.applyNo)
            }
          }
        },
        { prop: 'recvBankName', label: '收款银行', type: 'text' },
        { prop: 'recvAccountName', label: '收款账户名', type: 'text' },
        { prop: 'recvAccountNo', label: '收款账号', type: 'text' },
        { prop: 'applyPayAmt', label: '金额', type: 'text' },
        { prop: 'currency', label: '币种', type: 'text' },
        { prop: 'createdName', label: '申请人', type: 'text' },
        { prop: 'createdTime', label: '申请时间', type: 'text' },
      ]
      this.option11.columns = columns11
    },
    // 返回
    cancel() {
      this.routerBack()
    },
    // 获取详情
    getInfo() {
      this.loading = true
      queryPayOrderInfo({ payOrderNo: this.payOrderNo })
        .then(res => {
          let {
            payOrder,
            transferFees,
            writeoffPay,
            prepayUsables,
            writeoffItems,
            writeoffReverseList,
            platformTransferFeeDedueList,
            payPurchaseForeignExchange,
            payApplySettleList
          } = res.data
          this.settleCompCode = writeoffPay.settleCompCode
          // 此写法有问题
          // Object.assign(this.payOrder, payOrder)
          // res.data.payOrder = payOrder = this.payOrder
          this.payOrder = payOrder
          this.info = res.data
          // this.payOrder = payOrder
          // this.payOrder.payAccount = payOrder.payAccountName
          this.writeoffPay = writeoffPay
          this.prepayUsables = prepayUsables
          this.writeoffReverseList = writeoffReverseList || []
          this.settleExRateSummarys = writeoffPay.settleExRateSummarys || []
          this.writeoffExRateSummarys = writeoffPay.writeoffExRateSummarys || []
          this.writeoffExRate =
            this.writeoffExRateSummarys[0]?.writeoffExRate || ''
          this.option7.data = prepayUsables || []
          this.option9.data = platformTransferFeeDedueList || []
          this.option1.data = (transferFees && transferFees[0]) ? transferFees : [] // 有遇到transferFees: [null]的数据
          this.option11.data = payApplySettleList || []
          this.option5.data = payPurchaseForeignExchange
            ? [payPurchaseForeignExchange]
            : []
          const invoicePayment = payOrder.payInfo.payInfoInvoices.map(item => {
            return Object.assign(item.invoicePayment, {
              invoiceAmt: item.invoiceAmt
            })
          })
          this.option2.data = invoicePayment || []
          if (payOrder.payWriteoffStatus === 'no') {
            this.option3.data = writeoffItems.map(item => {
              item.settleOrderNo_multiValue = item.settleOrderNo.split(',')
              item.payApplyNo_multiValue = item.payApplyNo.split(',')
              return Object.assign(item, { edit: true })
            })
          } else {
            this.option3.data = writeoffItems.map(item => {
              item.settleOrderNo_multiValue = item.settleOrderNo.split(',')
              item.payApplyNo_multiValue = item.payApplyNo.split(',')
              return item
            })
            // this.option3.data = writeoffItems
          }
          this.countTotalSettle()
          if (payOrder.orderType === 'prepay_to_repay') {
            this.option1.operationBtns.show = false // this.option1.operationBtns = false
            this.option1.columns = this.columns1_prepay_to_repay
            this.option1.columns.forEach(item => {
              if (item.prop === 'allotAmt') {
                Object.assign(item, { readOnly: false })
              } else {
                Object.assign(item, { readOnly: true })
              }
            })
            // this.option1.columns = this.columns1_prepay_to_repay
            this.option1.data = transferFees.map(item => {
              if (item.amt !== item.hasAllotAmt) {
                return Object.assign(item, { edit: true })
              } else {
                return item
              }
            })
            this.prepayAccountBalance()
          }
          // 改成都可以填本次分摊手续费，有业务费用或费用单费用会自动分摊，如果没有，则后台会提示分摊不下去
          // // 订单费用就可以分摊
          // const orderFee = writeoffItems.some(item => {
          //   return item.sourceType === 'order' ||  item.sourceType === 'finbill'
          // })
          // if (payOrder.orderType === 'settle_pay' && orderFee) {
          //   const status = this.option1.columns.some(
          //     item => item.prop === 'allotAmt'
          //   )
          //   if (!status) {
          //     this.option1.columns = this.columns1_common
          //     // [
          //     //   (this.option1.columns = this.columns1_common) // 原来的写法
          //     // ]
          //   }
          // }
          if (!this.info.payOrder.payTime) {
            this.info.payOrder.payTime =
              dateFormat('yyyy-mm-dd', new Date()) + ' 00:00:00'
          }
          if (!writeoffPay.writeoffDate) {
            this.writeoffPay.writeoffDate = dateFormat('yyyy-mm-dd', new Date())
          }
          if (payOrder.payWriteoffStatus === 'yes') {
            this.option1.operationBtns.show = false // this.option1.operationBtns = false
            this.option4.edit = false
          }
          // 能核销才能编辑费用列表
          if (
            payOrder.confirmStatus === 'pass' &&
            payOrder.payStatus !== 'pay_close' &&
            payOrder.payWriteoffStatus === 'no'
          ) {
            this.option3.edit = true
          } else {
            this.option3.edit = false
            this.option3.selection = false
            this.option5.operationBtns = false
            this.option7.operationBtns = false
            this.option9.operationBtns = false
          }
          // 计算多付少付金额
          if (+this.payOrder.realPayAmt) {
            this.allTransferFeeList = this.payOrder.interTransferFee || 0
            this.changeRealPayAmt()
          }

          this.payOrder.payAccountShortName = payOrder.payInfo.payAccountShortName
          this.payOrder.payBankName = payOrder.payInfo.payBankName
          this.payOrder.payAccountName = payOrder.payInfo.payAccountName
          this.payOrder.payAccountNo = payOrder.payInfo.payAccountNo
          this.payOrder.payInfo = payOrder.payInfo
          this.payOrder.payInfo.payBankCode = payOrder.payInfo.payBankCode
          // // 增加此赋值, 20220624
          // this.payOrder.payAccount = {
          //   label: this.payOrder.payAccountShortName,
          //   value: this.payOrder.payAccountNo,
          //   accountNo: this.payOrder.payAccountNo
          // }
          this.payOrder.swiftCode = payOrder.payInfo.swiftCode
          this.payOrder.payBankAccountId = payOrder.payInfo.payBankAccountId

          let hasIntrabranch = ''
          let countryOrgType = payOrder.payWay
          if(payOrder.payWay==='intrabranch'){
            hasIntrabranch = "yes"
            countryOrgType = ''
          }
          let hasChequeAcct = ''
          if(payOrder.payWay==='cheque'){
            hasChequeAcct = 'yes'
            countryOrgType = ''
          }
          let queryString = {'accountShortName':"", hasIntrabranch, hasChequeAcct, "receipayType":"pay",'currency': payOrder.currency, countryOrgType, "unitCode":payOrder.payInfo.payCompCode }
          if(this.payOrder.payWriteoffStatus === 'no'){
            this.$store.dispatch('dict/companyBankAccountList', queryString).then((data) => {
              if(data && data.length){
                this.payAccountShortNameList = data.map(item=> ({label: `${item.accountShortName}(${item.accountNo})`,value:item.accountNo, ...item}))
                let item = this.payAccountShortNameList.find(item => item.accountNo === this.payOrder.payInfo.payAccountNo)
                if(item){
                  this.payOrder.payAccount = item
                  this.payAccountShortNameChange(item)
                }else{
                  if(this.payOrder.payCompCode !== '000001'){
                    for (let j = 0; j < this.payAccountShortNameList.length; j++) {
                      if(this.payAccountShortNameList[j].hasDefault === 'yes'){
                        this.payAccountShortNameChange(this.payAccountShortNameList[j])
                        return this.payOrder.payAccount = this.payAccountShortNameList[j] 
                      }else{
                        return this.payOrder.payAccount = {}
                      }
                    }
                  }else{
                    return this.payOrder.payAccount = {}
                  }
                }
              }else{
                this.payAccountShortNameList = []
              }
              this.$forceUpdate()
            })
            console.log(this.payOrder)
          }else{
            // this.payOrder.payAccount = this.payOrder.payAccountShortName // 改成下面的方式，20220621
            this.$store.dispatch('dict/companyBankAccountList', queryString).then((data) => {
              if(data && data.length){
                this.payAccountShortNameList = data.map(item=> ({label: `${item.accountShortName}(${item.accountNo})`,value:item.accountNo, ...item}))
                let item = this.payAccountShortNameList.find(item => item.accountNo === this.payOrder.payInfo.payAccountNo)
                if(item){
                  this.payOrder.payAccount = item
                  // this.payAccountShortNameChange(item) // 已核销的情况不调用，否则存在定价手续费的情况会显示定价手续费
                }else{
                  this.payOrder.payAccount = {
                    label: this.payOrder.payAccountShortName,
                    value: this.payOrder.payAccountNo,
                    accountNo: this.payOrder.payAccountNo
                  }
                }
              }else{
                this.payOrder.payAccount = {
                  label: this.payOrder.payAccountShortName,
                  value: this.payOrder.payAccountNo,
                  accountNo: this.payOrder.payAccountNo
                }
              }
              this.$forceUpdate()
            })
            this.bankAccountSettleModeList = this.dictMap.bankAccountSettleMode
          }
          this.chineseMainland(this.payOrder.payWay)
          // this.paymentPlatformBalance()
        })
        .catch(()=>{
          this.delVisitedView()
          this.cancel()
        }).finally(()=>{
          this.loading = false
        })
      // 获取当日核销汇率
      actualExchangeRate({rateType: 'pay'}).then(res => {
        if (res.code === 0) {
          this.exchageRateList = res.data
        }
      })
    },
    // 添加购汇记录
    addExchange() {
      const realPayAmt = this.payOrder.realPayAmt
      if (!realPayAmt) {
        return this.$msgErrClose('请先填写实付金额')
      }
      const len = this.option5.data.length
      if (len) {
        return this.$msgErrClose('只能添加一条购汇记录，请删除后再添加！')
      }
      this.getCurrencyList()
      this.exchangeDialog = true
      this.exchangeData.bankAccountSettleModeList = []
    },
    // 关闭购汇弹窗
    closeExchange() {
      this.exchangeDialog = false
      this.$refs.exchangeForm.resetFields()
    },
    // 提交购汇弹窗
    submitExchange() {
      this.$refs.exchangeForm.validate(valid => {
        if (valid) {
          const amt = this.exchangeData.amt
          const reg = /^\d+(\.\d{0,2})?$/
          if (!reg.test(amt)) {
            return this.$msgErrClose('请填写正确的购汇金额')
          }
          if (this.exchangeData.currency === this.payOrder.currency) {
            return this.$msgErrClose('购汇币种与付款币种一致，请重新选择')
          }
          const data = Object.assign({}, this.exchangeData, {
            exRate: (this.payOrder.realPayAmt / this.exchangeData.amt).toFixed(
              4
            ),
            createdTime: dateFormat('yyyy/mm/dd HH:MM:SS', new Date()),
            createdName: this.userName,
            edit: true
          })
          this.option5.data = [data]
          this.closeExchange()
        }
      })
    },
    // 标记付错
    markErr() {
      if (this.payOrder.errorStatus === 'yes') {
        return this.$msgErrClose('已操作过标记付错,不能重复操作')
      }
      if (this.payOrder.payStatus === 'pay_close') {
        return this.$msgErrClose('已关闭的付款单不能操作标记付错')
      }
      if (this.payOrder.confirmStatus !== 'pass') {
        return this.$msgErrClose('未受理的付款单不能操作标记付错')
      }
      this.showErrorDialog = true
    },
    // 关闭付错组件
    closeMarkError() {
      this.showErrorDialog = false
    },
    //保存
    handleSave(){
      const lessPayDealway = this.info.payOrder.lessPayDealway
      const greatPayDealway = this.info.payOrder.greatPayDealway
      this.info.payOrder.differenceDealway = lessPayDealway || greatPayDealway
      this.info.transferFees = this.option1.data
      this.info.payPurchaseForeignExchange = this.option5.data[0]
        ? this.option5.data[0]
        : ''
      if (this.option7.data.length) {
        this.info.prepayUsables = this.option7.data
      }
      if (this.option9.data.length) {
        this.info.prepayUsables = this.option9.data.concat(this.option7.data)
      }
      const data = this.info
      data.payOrder.payInfo.payWay = this.payOrder.payWay
      data.payOrder.payInfo.settleMode = this.payOrder.settleMode
      Object.assign(data.payOrder, this.payOrder)
      this.loading = true
      modifyPayOrderAndTransfer(data).then(res=>{
        this.$msgSucClose('保存成功!')
      }).catch(() => {})
      .finally(() => {
        this.loading = false
      })
    },
    // 核销操作
    writeOffPreview() {
      if (this.info.payOrder.confirmStatus === 'pending') {
        return this.$msgErrClose('请先完成受理才能核销！')
      }
      if (this.info.payOrder.payWriteoffStatus === 'yes') {
        return this.$msgErrClose('已核销！无需重复核销！')
      }
      if (this.option3.data.length) {
        const feeAmt = this.option3.data.some(item => {
          return !item.writeoffFeeAmt
        })
        if (feeAmt) {
          return this.$msgErrClose('核销原币金额不能为空')
        }
        const writeoffFeeAmt = this.option3.data.some(item => {
          return item.writeoffFeeAmt > item.settleAmt
        })
        if (writeoffFeeAmt) {
          return this.$msgErrClose('核销原币金额不能大于可核销原币金额')
        }
      }
      if (Number(this.payOrder.lessPayAmt) && !this.payOrder.lessPayDealway) {
        return this.$msgErrClose('少付处理科目不能为空')
      }
      if (Number(this.payOrder.greatPayAmt) && !this.payOrder.greatPayDealway) {
        return this.$msgErrClose('多付处理科目不能为空')
      }
      if (!this.writeoffPay.writeoffDate) {
        return this.$msgErrClose('核销日期不能为空')
      }
      // const realPayAmt = this.payOrder.realPayAmt
      // const applyAmt = this.payOrder.applyAmt
      // const orderType = this.info.payOrder.orderType
      // if (
      //   orderType === 'prepay_to_repay' &&
      //   realPayAmt - this.allTransferFeeList > applyAmt
      // ) {
      //   return this.$msgErrClose('预付抵账不能多付')
      // }
      // if (
      //   orderType === 'prepay' &&
      //   realPayAmt - this.allTransferFeeList < applyAmt
      // ) {
      //   return this.$msgErrClose('预付付款不能少付')
      // }
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
      this.info.transferFees = this.option1.data
      this.info.payPurchaseForeignExchange = this.option5.data[0]
        ? this.option5.data[0]
        : ''
      if (this.option7.data.length) {
        this.info.prepayUsables = this.option7.data
      }
      if (this.option9.data.length) {
        this.info.prepayUsables = this.option9.data.concat(this.option7.data)
      }
      const data = this.info
      data.payOrder.payInfo.payWay = this.payOrder.payWay
      data.payOrder.payInfo.settleMode = this.payOrder.settleMode
      Object.assign(data.payOrder, this.payOrder)
      // return console.log('data:', data)

      let payWayList = ['chinese_mainland','hk_china','abroad']
      let settleCompanyCode = this.writeoffPay.settleCompCode
      let settleCompCode = this.payOrder.payAccount ? this.payOrder.payAccount.settleCompanyCode : ''
      if((payWayList.includes(this.payOrder.payWay)) && settleCompanyCode !== settleCompCode ){
        let str = '您本次核销付款单中的付款银行账户所属分公司与付款单所属分公司不一致，系统将自动变更付款单及涉及的结算单为代付单，请再次确认本次核销！'
        this.$confirmWarn({ body: str, confirm: '确认', cancel: '取消' }, () => {
          this.saveWriteoffPayOrder(data)
        })
      }else{
        this.saveWriteoffPayOrder(data)
      }
    },
    saveWriteoffPayOrder(data){
      this.loading = true
      saveWriteoffPayOrder(data)
      .then(res => {
        if (res.code === 0) {
          this.$msgSucClose('核销提交成功!')
          // this.getInfo()
          this.delVisitedView()
          let query = {
            writeoffReceipayNo: res.data.writeoffReceipayNo
          }
          this.routerPush('WritePayDetail', query)
        }
      })
      .catch(() => {})
      .finally(() => {
        this.loading = false
      })
    },
    chineseMainland(val){
      let list =  []
      this.dictMap['transferFeeType'].forEach(item=>{
        if(['chinese_mainland','abroad'].includes(val)){
          if (item.value !== 'fixed') {
            list.push(item)
          }
        } else if (['hk_china'].includes(val)) {
          list.push(item)
        } else if(['prepay_dedue'].includes(val)){
          list.push(item)
          this.option1.data = []
        }else{
          if(item.value !=='payment_channel_transfer'){
            list.push(item)
            let chineseMainlandList = []
            this.option1.data.forEach(item=>{
              if(item.cutType === 'payment_channel_transfer'){
                // item.cutType =  ''
              }else{
                chineseMainlandList.push(item)
              }
              
            })
            this.option1.data = chineseMainlandList
          }
        }
      })
      TFEETYPE.splice(0, 1000, ...list)
    },
    // 表格收起
    toggleTable(index) {
      this.$set(this.showTable, index, !this.showTable[index])
    },
    // 修改实付金额
    changeRealPayAmt() {
      // 详情不计算
      if (this.disableForm) {
        return
      }
      if (!this.payOrder.realPayAmt) {
        this.payOrder.greatPayAmt = this.payOrder.lessPayAmt = 0
        this.payOrder.lessPayDealway = this.payOrder.greatPayDealway = ''
        return
      }
      if (!/^\d+(\.\d{0,4})?$/.test(this.payOrder.realPayAmt)) {
        return this.$msgErrClose('请输入正确的实付金额')
      }
      const realPayAmt = this.payOrder.realPayAmt 
      const applyAmt = this.payOrder.applyAmt || 0
      if (realPayAmt - this.allTransferFeeList > applyAmt) {
        this.payOrder.greatPayAmt = (
          realPayAmt -
          (applyAmt + this.allTransferFeeList)
        ).toFixed(2)
        this.payOrder.lessPayAmt = 0
        this.payOrder.lessPayDealway = ''
      } else {
        this.payOrder.lessPayAmt = (
          applyAmt +
          this.allTransferFeeList -
          realPayAmt
        ).toFixed(2)
        this.payOrder.greatPayAmt = 0
        this.payOrder.greatPayDealway = ''
      }
      if (realPayAmt - this.allTransferFeeList == applyAmt) {
        this.payOrder.greatPayAmt = this.payOrder.lessPayAmt = 0
        this.payOrder.lessPayDealway = this.payOrder.greatPayDealway = ''
      }
      const orderType = this.info.payOrder.orderType
      // 预付抵账
      if (
        this.payOrder.payWay === 'prepay_dedue' &&
        realPayAmt - this.allTransferFeeList > applyAmt
      ) {
        this.payOrder.realPayAmt = (
          Number(applyAmt) + this.allTransferFeeList
        ).toFixed(2)
        this.payOrder.greatPayAmt = this.payOrder.lessPayAmt = 0
        this.payOrder.lessPayDealway = this.payOrder.greatPayDealway = ''
        return this.$msgErrClose('预付抵账不能多付')
      }
      // 内部来往
      if (this.payOrder.payInfo.payAccountIsIntrabranch === 'yes' && realPayAmt - this.allTransferFeeList > applyAmt) {
        this.payOrder.realPayAmt = (
          Number(applyAmt) + this.allTransferFeeList
        ).toFixed(2)
        this.payOrder.greatPayAmt = this.payOrder.lessPayAmt = 0
        this.payOrder.lessPayDealway = this.payOrder.greatPayDealway = ''
        return this.$msgErrClose('内部来往不能多付')
      }
      if (
        orderType === 'prepay' &&
        realPayAmt - this.allTransferFeeList != applyAmt
      ) {
        this.payOrder.realPayAmt = (
          Number(applyAmt) + this.allTransferFeeList
        ).toFixed(2)
        this.payOrder.greatPayAmt = this.payOrder.lessPayAmt = 0
        this.payOrder.lessPayDealway = this.payOrder.greatPayDealway = ''
        return this.$msgErrClose('预付付款不能多付或少付')
      }
    },
    // 增加手续费
    addFee() {
      if (this.info.payOrder) {
        const orderType = this.info.payOrder.orderType
        if (this.payOrder.payWay === 'prepay_dedue') { // if (orderType === 'prepay_to_repay') {
          return this.$msgErrClose('预付抵账！无需添加手续费！')
        }
        const payWay = this.info.payOrder.payWay
        if (payWay === 'cash') {
          return this.$msgErrClose('现金支付无需添加手续费！')
        }
        if (orderType === 'refund_pay') {
          this.option1.columns[0].readOnly = true
        } else {
          this.option1.columns[0].readOnly = false
        }
        const currency = this.info.payOrder.currency
        if (this.payOrder.payInfo.payBankCode === 'B0011H144030001') { // 招行预扣手续费
          let index = TFEETYPE.findIndex(item => item.value === 'prepay_withhold')
          if (index === -1) {
            let obj = this.dictMap['transferFeeType'].find(item => item.value === 'prepay_withhold')
            TFEETYPE.push(obj)
          }
          this.option1.data.push({
            cutType: 'prepay_withhold',
            assumerType: 'order',
            currency: currency,
            amt: '',
            allotAmt: '',
            edit: true
          })
        } else {
          let index = TFEETYPE.findIndex(item => item.value === 'prepay_withhold')
          if (index > -1) {
            TFEETYPE.splice(index, 1)
          }
          this.option1.data.push({
            cutType: 'exter_cut',
            assumerType: 'order',
            currency: currency,
            amt: '',
            allotAmt: '',
            edit: true
          })
        }
      }
    },
    cutTypeChange(value, row, item) {
      console.log(row.cutType );
      if(row.cutType === "payment_channel_transfer"){
        let arr = []
        this.option1.data.forEach(v=>{
          if(v.cutType === 'payment_channel_transfer'){
            arr.push(v)
          }
        })
        if(arr.length > 1){
          row.cutType = ''
          return  this.$msgErrClose('已有支付平台代付手续费，请删除后再添加！')
        }
      }
      // 添加手续费已加
      // else if (row.cutType === 'prepay_withhold') {
      //   row.assumerType === 'company' // 'company_undertake'
      //   console.log(row)
      // }
    },
    // 增加支付平台代付手续费
    addPaymentchannel() {
      if (this.info.payOrder) {
        const orderType = this.info.payOrder.orderType
        // if (orderType === 'prepay_to_repay') {
        //   return this.$msgErrClose('预付抵账！无需添加手续费！')
        // }
        // const payWay = this.info.payOrder.payWay
        // if (payWay === 'cash') {
        //   return this.$msgErrClose('现金支付无需添加手续费！')
        // }
        // if (orderType === 'refund_pay') {
        //   this.option1.columns[0].readOnly = true
        // } else {
        //   this.option1.columns[0].readOnly = false
        // }
        const currency = this.info.payOrder.currency
        this.option9.data.push({
          currency: currency,
          transferFeeAmt: '',
          allotAmt: '',
          prepayPayOrderNo: '',
          settleCorpName: '',
          realpayAmt: '',
          useAmt: '',
          edit: true
        })
      }
    },
    // 删除手续费
    handleDelete($index, row, option) {
      this.$confirm('是否确认删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          option.data.splice($index, 1)
        })
        .catch(() => {})
    },
    // 修改核销汇率
    changeWriteoffExRate() {
      if (!/^\d+(\.\d{0,10})?$/.test(this.writeoffExRate)) {
       return this.$msgErrClose('请输入正确的汇率')
      }
      const originalCurrency = this.writeoffExRateSummarys[0].originalCurrency
      const settleCurrency = this.writeoffExRateSummarys[0].settleCurrency
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
        // 数组去重
        let list = []
        let arr = this.option3.data
        for (let i = 0; i < arr.length; i++) {
          for (let j = i+1; j < arr.length; j++) {
            if(arr[i].originalCurrency === arr[j].originalCurrency && arr[i].settleCurrency === arr[j].settleCurrency ){
              i++
              j=i
            }
          }
          list.unshift({
            originalCurrency:arr[i].originalCurrency,
            settleCurrency:arr[i].settleCurrency,
            writeoffExRate:arr[i].writeoffExRate,
            settleExRate:arr[i].settleExRate,
            edit: true
          })
        }
        console.log(list);
        if (this.payOrder.payWriteoffStatus === 'no') {
          this.option4.edit = true
        }
        this.option4.data = list
        // this.option4.data[0].writeoffExRate = this.writeoffExRate
        // this.option4.columns[2] = {
        //   prop: 'writeoffExRate',
        //   label: '核销汇率',
        //   type: 'input',
        //   validateInput: (val, row, item, change) => {
        //     if (change) {
        //       if (!/^\d+(\.\d{0,10})?$/.test(val)) {
        //         this.$message({
        //           type: 'error',
        //           message: '请输入正确的汇率！',
        //           showClose: true
        //         })
        //         // let res = /\d+(\.\d{0,4})?/g.exec(val)
        //         // row[item.prop] = res ? res[0] : ''
        //       }
        //     }
        //   }
        // }
      } else {
        // this.dialogTitle = '结算汇率'
        // this.option4.data = this.settleExRateSummarys
        // this.option4.columns[2] = {
        //   prop: 'settleExRate',
        //   label: '结算汇率',
        //   type: 'text'
        // }
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
        return this.$msgErrClose('请输入正确的核销汇率')
      }
      // this.writeoffExRate = this.option4.data[0].writeoffExRate
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
      this.writeoffExRateChange()
    },
    // 水单相关操作
    receiveResFileList(list) {
      this.payOrder.bankseqFileNo = list && list[0] && list[0].fileNo
      this.$refs.query.clearValidate(['bankseqFileNo'])
    },
    handleRemove() {
      this.payOrder.fileId = this.payOrder.fileNo = this.payOrder.bankseqFileNo = ''
    },
    beforeRemove(file) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    handleExceed(files, fileList) {
      this.$message.warning(`只能选择 1 个文件！`)
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
          this.$msgSucClose('上传成功!')
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
    // 查看水单文件
    handleBankseqFileNo() {
      const href = `/base/fileView/preview/${this.payOrder.bankseqFileNo}/sowoll`
      window.open(href)
    },
    handleDeleteFileNo() {
      this.$confirm('是否确认删除水单文件？', '水单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.payOrder.bankseqFileNo = ''
        })
        .catch(console.log)
    },
    // 监听click事件，切换银行手续费的可编辑状态
    listenClick() {
      if (this.disableForm) return false
      this.option1.edit = true
    },
    bodyClick() {
      this.option1.edit = false
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
    
    // 币种下拉列表自动补充的数据
    getCurrencyList() {
      baseCurrencyList('', 'valid')
        .then(res => {
          this.currencyList = res.data
        })
        .catch(() => {})
    },
    // 银行下拉
    getBankAccountList() {
      // 清空银行数据
      this.exchangeData = Object.assign(this.exchangeData, {
        payBankAccountId: '',
        payBankCode: '',
        payBankName: '',
        payBankBranch: '',
        payAccountNo: '',
        payAccountName: '',
        payAccountShortName: ''
      })
      const currency = this.exchangeData.currency
      if (!currency) {
        return this.$msgErrClose('请选择购汇币种')
      }
      if (currency === this.payOrder.currency) {
        return this.$msgErrClose('购汇币种与付款币种一致，请重新选择')
      }
      const unitCode = this.payOrder.payCompCode
      bankAccountList({ unitCode, currency, status: 'effect ', receipayType: 'pay' })
        .then(res => {
          this.bankList = res.data
        })
        .catch(() => {})
    },
    // 选择银行
    chooseBank(accountShortName) {
      const data = this.bankList.filter(ele => {
        return ele.accountShortName === accountShortName
      })
      if (data.length) {
        const {
          settleUnitBankAcctId,
          bankCode,
          bankName,
          bankBranch,
          accountNo,
          accountName,
          accountShortName,
          settleMode
        } = data[0]
        this.exchangeData = Object.assign(this.exchangeData, {
          payBankAccountId: settleUnitBankAcctId,
          payBankCode: bankCode,
          payBankName: bankName,
          payBankBranch: bankBranch,
          payAccountNo: accountNo,
          payAccountName: accountName,
          payAccountShortName: accountShortName,
          settleMode:settleMode.length ? settleMode[0] : '',
          bankAccountSettleModeList: (settleMode || []).map((items) => {
            let dict = this.dictMap.bankAccountSettleMode
            return dict.find((v) => v.value === items)
          })
        })
      }
    },
    // 一键修改核销汇率
    changeRate() {
      const len = this.multipleSelection3.length
      if (!len) {
        return this.$msgErrClose('请先勾选数据再修改汇率！')
      }
      // originalCurrency writeoffCurrency writeoffExRate
      // 数组去重
      let list = []
      let arr = this.multipleSelection3
      for (let i = 0; i < arr.length; i++) {
        for (let j = i+1; j < arr.length; j++) {
          if(arr[i].originalCurrency === arr[j].originalCurrency && arr[i].settleCurrency === arr[j].settleCurrency ){
            i++
            j=i
          }
        }
        list.unshift(arr[i])
      }
      // const writeoffCurrencys = this.multipleSelection3.map(
      //   item => item.writeoffCurrency
      // )
      // const currencys = [...new Set(writeoffCurrencys)]
      // const data = this.multipleSelection3.filter(item =>
      //   currencys.includes(item.writeoffCurrency)
      // )
      // this.option6.data = JSON.parse(JSON.stringify(data))
      this.option6.data = JSON.parse(JSON.stringify(list))
      this.exchangeRateDialog = true
    },
    // 提交汇率
    submitExchangeRate() {
      let status = false
      this.option6.data.forEach(item => {
        if (item.originalCurrency === item.settleCurrency) {
          if (Number(item.writeoffExRate) !== 1) {
            status = true
            this.$msgErrClose(
              `${item.originalCurrency} - ${item.settleCurrency} 的汇率上下限为1，请重新填写`
            )
          }
        } else {
          const data = this.exchageRateList.filter(ele => {
            return (
              ele.srcCurrency === item.originalCurrency &&
              ele.toCurrency === item.settleCurrency
            )
          })
          // if (
          //   Number(item.writeoffExRate) > Number(data[0].upperRate) ||
          //   Number(item.writeoffExRate) < Number(data[0].lowerRate)
          // ) {
          //   status = true
          //   this.$msgErrClose(
          //     `${item.originalCurrency} - ${item.settleCurrency} 的汇率上下限为${data[0].lowerRate}~${data[0].upperRate}，请重新填写`
          //   )
          // }
        }
      })
      if (status) {
        return
      }
      this.option6.data.forEach(item => {
        const datasource = this.option3.data.filter(ele => {
          return (
            ele.originalCurrency === item.originalCurrency &&
            ele.writeoffCurrency === item.writeoffCurrency
          )
        })
        datasource.forEach(d => {
          d.writeoffExRate = item.writeoffExRate
          d.writeoffAmt = (d.writeoffFeeAmt * item.writeoffExRate).toFixed(2)
          this.countTotalSettle()
        })
      })
      this.$msgSucClose('汇率修改成功')
      this.closeExchangeDialog()
      this.writeoffExRateChange()
    },
    //改变核销汇率
    writeoffExRateChange(){
      const originalCurrency = this.writeoffExRateSummarys[0].originalCurrency
      const settleCurrency = this.writeoffExRateSummarys[0].settleCurrency
      this.option3.data.forEach(item => {
        if (item.originalCurrency === originalCurrency && item.settleCurrency === settleCurrency) {
          this.writeoffExRate = item.writeoffExRate
        }
      })
    },
    // 关闭修改汇率弹框
    closeExchangeDialog() {
      this.exchangeRateDialog = false
    },
    // 表格选择
    sendMulti(data, option) {
      if (option === this.option3) this.multipleSelection3 = data
      if (option === this.option8) {
        this.multipleSelection8 = data
        if (data.length || this.option8.listAmtSummary.count++ > 0) {
          this.debounceLs(() => {
            this.getListAmtSummary(data)
          })
        }
      }
      if(option.id === 'option8' && data.length === 0){
        this.getListAmtSummary(this.option8.data)
      }
    },
    getListAmtSummary(val) {
        if (val.length) {
          let realpayAmtTotalList = []
          let balanceTotalList = []
          let list = val
          let currencyList = [...new Set(list.map(item => item.currency))]
          currencyList.forEach(item => {
            let arr = list.filter(keys => keys.currency === item)
            let sum = arr.reduce((a, b) => Number(a) + Number(b.realpayAmt), 0)
            if(sum && item){
              realpayAmtTotalList.push({
                currency: item,
                amt: Math.round(sum*100)/100
              })
            }
            let sum1 = arr.reduce((a, b) => Number(a) + Number(b.balance), 0)
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
            realpayAmtTotalListLabel: '付款金额',
            balanceTotalListLabel: '剩余可用金额'
          }
          const colorObj = {
            realpayAmtTotalListColor: 'red', // 支持red, green, black三种值
            balanceTotalListColor: 'green'
          }
          this.option8.listAmtSummary = Object.assign(
            this.option8.listAmtSummary,
            {
              show: true,
              data,
              labelObj,
              colorObj
            }
          )
        }
    },
    // 关联预付款
    relevancePrepay(val) {
      const {
        payCompCode,
        recvCorpCode,
        currency,
        applyPayAmt,
        payInfoId
      } = this.payOrder.payInfo
      const data = {
        settleCompCode: payCompCode,
        settleCorpCode: recvCorpCode,
        currency: val === 'withholdingTax' ? this.payOrderCurrency : currency,
        payAmt: applyPayAmt,
        payInfoId: payInfoId
      }
      if(val === 'withholdingTax'){
        data.settleCorpCode =  ''
      }
      this.option8.data = []
      this.relevanceMark = val
      let method = val === 'withholdingTax' ? usablePrepayDedueList : queryUsablePrepayDedueList
      method(data).then(res => {
        if (res.code === 0) {
          if (res.data.length) {
            this.option8.data = res.data
            // 给付款单搜索赋默认值
            const { recvCorpName, currency } = this.payOrder.payInfo
            this.searchOption1.data.settleCorpCode = recvCorpName
            this.searchOption1.data.currency = currency
            this.searchOption2.data.currency = this.payOrderCurrency
            this.relevancePrepayDialogShow = true
            this.$nextTick(() => {
              this.option7.data.forEach(({payOrderId}) => {
                let find = this.option8.data.find(v => v.payOrderId === payOrderId)
                if(find){
                  this.$refs.relevancePrepayTable.setCheckRow(find, true)
                }
              })
              this.debounceLs(() => {
                this.getListAmtSummary(res.data)
              },1300)
            })
          }
        }
      })
    },
    // 搜索预付款单
    search() {
      const {
        payCompCode,
        recvCorpCode,
        currency,
        applyPayAmt,
        payInfoId,
        recvCorpName
      } = this.payOrder.payInfo
      const data = {
        settleCompCode: payCompCode,
        settleCorpCode: recvCorpCode,
        currency: currency,
        payAmt: applyPayAmt,
        payInfoId: payInfoId,
        payOrderNo: this.relevanceMark === 'withholdingTax' ? this.searchOption2.data.payOrderNo : this.searchOption1.data.payOrderNo,
        payApplyPrepayNo: this.relevanceMark === 'withholdingTax' ? this.searchOption2.data.payApplyPrepayNo  :  this.searchOption1.data.payApplyPrepayNo
      }
      this.searchOption1.data.settleCorpCode = recvCorpName
      this.searchOption1.data.currency = currency
      this.searchOption2.data.currency = currency
      this.option8.data = []
      let method = this.relevanceMark === 'withholdingTax' ? usablePrepayDedueList : queryUsablePrepayDedueList
      method(data)
        .then(res => {
          if (res.code === 0) {
            this.option8.data = res.data || []
          }
        })
        .catch(() => {})
    },
    // 确定选择预付款抵账
    relevancePrepayConfirm() {
      const len = this.multipleSelection8
      if(this.relevanceMark === 'withholdingTax'){
        if (!len.length) {
          return this.$msgErrClose('请先勾选支付平台代付的数据')
        }
        const payOrderNoList = this.option7.data.map(item => item.payOrderNo)
        this.multipleSelection8.forEach(ele => {
          if (!payOrderNoList.includes(ele.payOrderNo)) {
            this.option9.data.push(ele)
          }
        })
        this.currentUseAmtModel(this.option9.data,this.payOrderApplyAmt)
        // this.queryPrepayOrderTransfer()
        this.closeRelevancePrepay()
        // this.paymentPlatformBalance()
      }else{
        if (!len.length) {
          return this.$msgErrClose('请先勾选预付款数据')
        }
        const payOrderNoList = this.option7.data.map(item => item.payOrderNo)
        this.multipleSelection8.forEach(ele => {
          if (!payOrderNoList.includes(ele.payOrderNo)) {
            // let total = this.option7.data.reduce((pur, cur) => {
            // 	return pur += Number(cur.currentUseAmt)
            // }, 0)
            // let balance = this.payOrder.applyAmt - total
            // let data = Object.assign(ele, { currentUseAmt: ele.balance > balance ? balance : ele.balance })
            this.option7.data.push(ele)
          }
        })
        this.currentUseAmtModel(this.option7.data,this.payOrder.applyAmt)
        this.queryPrepayOrderTransfer()
        this.closeRelevancePrepay()
        this.prepayAccountBalance()
      }
    },
    currentUseAmtModel(val,applyAmt){
      val.forEach(item => {
        if (applyAmt > 0) {
          if (item.balance >= applyAmt) {
            item.currentUseAmt = applyAmt
            applyAmt = 0
          } else {
            item.currentUseAmt = item.balance
            applyAmt -= item.balance
          }
        } else {
          item.currentUseAmt = 0
        }
      })
    },
    // 关联预付抵账后调手续费接口
    queryPrepayOrderTransfer() {
      const data = {
        payOrderNo: this.payOrderNo,
        prepayDeduePayOrderNoList: this.option7.data.map(item => item.payOrderNo), // payOrderNoList
        dedueAmt: this.payOrder.realPayAmt
      }
      queryPrepayOrderTransfer(data)
        .then(res => {
          if (res.code === 0) {
            const transferFeeIds = this.option1.data.map(
              item => item.transferFeeId
            )
            res.data.forEach(item => {
              // 预付抵账手续费读取后, 重新赋值, 20220624
              // if (!transferFeeIds.includes(item.transferFeeId)) {
              //   let data = Object.assign({}, item, { edit: true })
              //   this.option1.data.push(data)
              //   this.listenClick()
              // }
              this.option1.data = res.data.map(item => {
                item.edit = true
                return item
              })
              this.listenClick()
            })
          }
        })
        .catch(() => {})
    },
    // 关闭预付抵账弹窗
    closeRelevancePrepay() {
      this.relevancePrepayDialogShow = false
      this.searchOption1.data.payOrderNo = ''
      this.searchOption1.data.payApplyPrepayNo = ''
    },
    // 查询预付抵账 预付款余额
    prepayAccountBalance() {
      if(this.payOrder.payWay !== 'prepay_dedue') return
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
      if(!payCompCode) return
      prepayAccountBalance(data)
        .then(res => {
          let prepayAccount =  []
          let sum = 0
          let currency = ''
          if(this.option7.data.length){
            sum = this.option7.data.reduce((a, b) => Number(a) + Number(b.currentUseAmt), 0)
            currency = this.option7.data[0].currency
          }
          res.data.forEach(item=>{
            if(item.currency === currency){
              prepayAccount.push({
                balance:item.balance-sum,
                currency:item.currency
              })
            }else{
              prepayAccount.push({
                balance:item.balance,
                currency:item.currency
              })
            }
            
          })
          this.prepayAccount = prepayAccount.length ?  prepayAccount : []
          
        })
        .catch(() => {})
    },
    // 查询
    paymentPlatformBalance() {
      let array = this.option1.data
      for (let i = 0; i < array.length; i++) {
        if(array[i].cutType !== 'payment_channel_transfer') return
      }
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
            value: this.payOrderCurrency
          }
        ]
      }
      if(!payCompCode) return
      this.paymentPlatformList = []
      paymentPlatformBalance(data).then(res => {
        this.paymentPlatformList = res.data || []
        // if(this.option9.data.filter(item =>item.currency ===  this.payOrderCurrency )){
        //   this.paymentPlatformList = paymentPlatformList.length ?  paymentPlatformList : []
        // }else{
        //   this.paymentPlatformList = res.data
        // }
      }).catch(() => {})
    },
    //付款方式
    payWayChange(val){
      this.payOrder.settleMode = ''
      this.bankAccountSettleModeList = []
			console.log(val);
      this.chineseMainland(val.payWay)
      let data ={
        payAccountShortName :'',
        payAccount:' ',
        payBankName :'',
        payAccountName : '',
        payAccountNo : ''
      }
      this.payOrder = Object.assign({},this.payOrder,data)
      this.payOrder.payInfo.payAccountShortName = ''
      this.payOrder.payInfo.payAccount = ''
      this.payOrder.payInfo.payBankName = ''
      this.payOrder.payInfo.payAccountName = ''
      this.payOrder.payInfo.payAccountNo = ''
      this.payOrder.payInfo.hasFixedTransferFee = '' // 20220704
      this.payOrder.payInfo.payBankCode = '' // 20220704
      this.option1.data = [] // 20220704

      let hasIntrabranch = ''
      let countryOrgType = val.payWay
			if(val.payWay==='intrabranch'){
				hasIntrabranch = "yes"
        countryOrgType = ''
			}
      let hasChequeAcct = ''
			if(val.payWay==='cheque'){
				hasChequeAcct = 'yes'
        countryOrgType = ''
      }
      if (val.payWay === 'hk_china') {
        // this.option1.columns = this.columns1_hk_china // 不这样处理
        // this.option1.data = [] // 拿到外面
      } else if (val.payWay === 'prepay_dedue') {
        this.option1.operationBtns.show = false // this.option1.operationBtns = false
        this.option1.columns = this.columns1_prepay_to_repay
        this.option1.columns.forEach(item => {
          if (item.prop === 'allotAmt') {
            Object.assign(item, { readOnly: false })
          } else {
            Object.assign(item, { readOnly: true })
          }
        })
      } else {
        this.option1.operationBtns.show = true
        this.option1.columns = this.columns1_common
      }
      // else {
      //   if (this.option1.columns.some(item => item.prop === 'assumerType')) { // 现显示了手续费承担人
      //     this.option1.columns = this.columns1_common
      //   }
      //   if (this.option1.data.some(item => item.cutType === 'fixed')) { // 不存在这种情况
      //     this.option1.data = []
      //   }
      // }
      this.payOrder.payInfo.transferFeeDeductWay = '' // 重置手续费扣款方式
			let queryString = {'accountShortName':"", hasIntrabranch, hasChequeAcct, "receipayType":"pay",'currency': val.currency, countryOrgType, "unitCode": val.payCompCode }
			this.$store.dispatch('dict/companyBankAccountList', queryString).then((data) => {
        if(data && data.length){
          this.payAccountShortNameList = data.map(item=> ({label: `${item.accountShortName}(${item.accountNo})`,value:item.accountNo, ...item}))
          // this.payOrder.payAccount = this.payAccountShortNameList[0]
          let item = this.payAccountShortNameList.find(item => item.accountNo === this.payOrder.payInfo.payAccountNo)
          if(item){
            this.payAccountShortNameChange(item)
            return this.payOrder.payAccount = item
          }else{
            if(this.payOrder.payCompCode !== '000001'){
              for (let j = 0; j < data.length; j++) {
                if(data[j].hasDefault === 'yes'){
                  this.payAccountShortNameChange(data[j] )
                  return this.payOrder.payAccount = data[j] 
                }
              }
            }else{
              return this.payOrder.payAccount = {}
            }
          }
        }else{
          this.payAccountShortNameList = []
        }
				this.$forceUpdate()
      })
		},
    payAccountShortNameChange(val){
      console.log(val);
      this.payOrder.payInfo.payAccountShortName = val.accountShortName
      this.payOrder.payInfo.payBankName = val.bankName
      this.payOrder.payInfo.payAccountName = val.accountName
      this.payOrder.payInfo.payAccountNo = val.accountNo
      this.payOrder.payInfo.payBankCode = val.bankCode
      this.payOrder.payBankName = val.bankName
      this.payOrder.payAccountName = val.accountName
      this.payOrder.payAccountNo = val.accountNo
      // this.payOrder.payCompCode = val.settleCompanyCode // 后台会自己取，取消该操作，否则切换付款方式分公司被改变，无法获取账号信息
      this.payOrder.payInfo.hasFixedTransferFee = val.hasFixedTransferFee
      this.payOrder.settleModeList = val.settleMode
      this.bankAccountSettleModeList = (this.payOrder.settleModeList || []).map((items) => {
        let dict = this.dictMap.bankAccountSettleMode
        return dict.find((v) => v.value === items)
      })
      if (this.payOrder.payInfo.hasFixedTransferFee === 'yes') {
        if (this.payOrder.payInfo.payBankCode === 'B0249H231000001') { // 花旗定价手续费，不可编辑，不可添加
          this.option1.columns = this.columns1_common // columns1_fixed_trfFee
          let transferFeeDeductWay = this.payOrder.payInfo.transferFeeDeductWay
          if (transferFeeDeductWay) {
            this.trfFeeDeductWayChange(transferFeeDeductWay)
          }
        } else { // 招行预扣手续费，默认订单承担，可编辑，可添加
          this.option1.columns = this.columns1_common // columns1_cmb_withhold，这两个使用一样的
        }
      } else {
        let len = this.option1.data.length
        for (let i = 0; i < len; i++) {
          let index = this.option1.data.findIndex(item => item.cutType === 'prepay_withhold')
          if (index > -1) {
            this.option1.data.splice(index, 1)
          }
        }
      }
    },
    trfFeeDeductWayChange(val) {
      let data = {
        "payOrderNo": this.payOrderNo,
        "payBankAccountId": this.payOrder.payAccount.settleUnitBankAcctId,
        "transferFeeDeductWay": val
      }
      payFixedTranferFeeBulid(data).then(res => {
        if (res.data) {
          this.option1.data = res.data && res.data[0] ? res.data : []
          this.option1.data.forEach(item => {
            if (item.cutType === 'fixed') {
              item.edit = false
            }
          })
        }
      })
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
      this.option3.data = [...list]
      this.countTotalSettle()
    },
    bankRemote(accountShortName){
      let hasIntrabranch = "";
      let hasChequeAcct = "";
      let payOrder = this.payOrder
      let countryOrgType = payOrder.payWay
      if(payOrder.payWay==='intrabranch'){
        hasIntrabranch = "yes"
        countryOrgType = ''
      }
      if(payOrder.payWay==='cheque'){
        hasChequeAcct = 'yes'
        countryOrgType = ''
      }
      let unitCode = payOrder.payCompCode;

      let queryString = {
        accountShortName,
        receipayType: "pay",
        hasIntrabranch,
        hasChequeAcct,
        currency: payOrder.currency,
        countryOrgType,
        unitCode,
      };
      this.$store
        .dispatch("dict/companyBankAccountList", queryString)
        .then((data) => {
          this.payAccountShortNameList = data.map(item=> ({label: `${item.accountShortName}(${item.accountNo})`,value:item.accountNo, ...item}))
        })
    },
  },
  mounted() {
    window.onresize =()  =>{
      return (()=>{
        window.screenHeight = window.innerHeight
        var height = window.screenHeight -99
        this.screenHeight = { height: height + 'px' };
      })()
    }
  },
}
</script>

<style lang="scss" scoped>
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
}
.payInfo-box {
  overflow-y: auto;
  overflow-x: hidden;
  .top-box {
    display: flex;
    .item-box,
    .table-box {
      flex: 1;
      &.top-table-box {
        border-style: none none solid none;
      }
    }
    .seqfile-box {
      width: 180px;
    }
  }
  .item-box {
    // padding-bottom: 10px;
    margin: 0 8px 16px;
    &.border-bottom {
      border-bottom: 1px solid #e9e9e9;
    }
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
      width: 160px;
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
        flex-basis: calc(25% - 10px);
        margin-bottom: 10px;
        margin-right: 10px;
        line-height: 13.8px;
        &.small-item {
          flex-basis: 20%;
        }
        .sub-title {
          width: 105px;
          text-align: right;
          display: inline-block;
          // text-align-last: justify;
          &.reveser {
            width: 100px;
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
        &.settle-remark {
          flex-basis: 100%;
          display: flex;
          .sub-title {
            flex-basis: 105px;
            text-align: right;
            display: inline-block;
          }
          .el-textarea {
            flex: 1;
          }
        }
      }
      .el-select {
        width: 100px;
        margin-right: 5px;
      }
      .el-input.el-date-editor {
        width: 150px;
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
        &.currency {
          label {
            margin-right: 10px;
            font-weight: normal;
          }
        }
      }
    }
  }
}
</style>

<style lang="scss">
.app-wrapper {
  .finance-page {
    .payInfo-box {
      .item-box {
        textarea {
          width: 100% !important;
        }
        .settle-remark {
          textarea {
            width: 100% !important;
          }
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
    .exchange-form-box {
      .el-input,
      .el-input--suffix,
      .el-upload--text,
      .finance-table-upload,
      .el-select {
        width: 260px;
      }
    }
  }
}
</style>
