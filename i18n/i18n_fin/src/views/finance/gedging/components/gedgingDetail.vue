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
          <div class="money-title">{{isDetailPage ? $t('Hedge.hedgDetails') : $t('Settle.createGedging')}}</div>
        </div>
        <div class="money-box-right">
          <el-button-group v-if="isDetailPage && checkAuth('GedgingList', 'tab-gedgingWriteOffList', 'btn-reverse') && detailForm.writeoffStatus === 'finish'">
            <el-button
              class="finance-btn"
              @click="reverse"
              size="mini"
              type="warning"
            >{{$t('Hedge.antiWriteOff')}}</el-button>
          </el-button-group>
          <el-button-group
            v-if="!voucherNos && checkAuth($route.name, 'btn-voucherView') && detailForm.writeoffStatus === 'finish'"
          >
            <el-button type="inner" class="finance-btn" size="mini" @click="generateFn2('preview')">{{$t('Hedge.previewVouchers')}}</el-button>
          </el-button-group>
          <el-button-group
            v-if="!voucherNos && checkAuth($route.name, 'btn-voucherCreate') && detailForm.writeoffStatus === 'finish'"
          >
            <el-button type="inner" class="finance-btn" size="mini" @click="generateFn2('created')">{{$t('Hedge.generateVouchers')}}</el-button>
          </el-button-group>
          <el-button-group
            v-if="voucherNos && checkAuth($route.name, 'btn-voucherDel')"
          >
            <el-button type="danger" class="finance-btn" size="mini" @click="delVoucher('created')">{{$t('Hedge.deleteVouchers')}}</el-button>
          </el-button-group>
          <el-button-group
            v-if="!exVoucherNos && checkAuth($route.name, 'btn-voucherView') && detailForm.writeoffStatus === 'finish'"
          >
            <el-button type="outer" class="finance-btn" size="mini" @click="generateFn2('preview', true)">{{$t('Hedge.previewExternal')}}</el-button>
          </el-button-group>
          <el-button-group
            v-if="!exVoucherNos && checkAuth($route.name, 'btn-voucherCreate') && detailForm.writeoffStatus === 'finish'"
          >
            <el-button type="outer" class="finance-btn" size="mini" @click="generateFn2('created', true)">{{$t('Hedge.generateExternal')}}</el-button>
          </el-button-group>
          <el-button-group
            v-if="exVoucherNos && checkAuth($route.name, 'btn-voucherDel')"
          >
            <el-button type="danger" class="finance-btn" size="mini" @click="delVoucher2('created')">{{$t('Hedge.deleteExternal')}}</el-button>
          </el-button-group>
          <el-button-group v-if="detailForm.writeoffStatus === 'finish' && checkAuth($route.name, 'btn-voucherAll')">
            <el-button class="finance-btn" @click="previewAll" size="mini" type="primary">{{$t('Hedge.viewAll')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              v-if="!isDetailPage"
              @click="submitApply"
              type="primary"
              size="mini"
            >{{$t('Settle.submit')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              v-if="isDetailPage && detailForm.auditStatus === 'pending' && checkAuth($route.name, 'btn-pass')"
              @click="audit('pass')"
              size="mini"
              type="success"
            >{{$t('Hedge.auditWrite')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              v-if="isDetailPage && detailForm.auditStatus === 'pending' && checkAuth($route.name, 'btn-refuse')"
              @click="rejectDialogVisible = true"
              size="mini"
              type="danger"
            >{{$t('Hedge.auditFailed')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'btn-gedgingCancel') && detailForm.auditStatus === 'pending'"
              type="purple"
              class="finance-btn"
              @click="gedgingCancel"
              size="mini"
              :loading="btnLoading2"
            >{{$t('Hedge.withdrawApplication')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" v-if="!isDetailPage" @click="cancel" size="mini">{{$t('Common.cancel')}}</el-button>
            <el-button class="finance-btn" v-if="isDetailPage" @click="cancel" size="mini">{{$t('Common.back')}}</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    <h3 style="padding-left:8px;color: #222;line-height:36px;">{{$t('Hedge.hedgInformation')}}</h3>
    <!-- <div class="settlement-detail-form settlement-detail-form-own gedging-detail-form"> -->
    <!-- v-if="!lsLoading" -->
    <el-form
      v-if="!lsLoading || isApply"
      :model="detailForm"
      ref="gedgingForm"
      :inline="true"
      size="mini"
      label-width="160px"
      class="settlement-detail-form"
      label-suffix=':'
    >
      <template v-if="!isDetailPage">
        <DetailDiv :label="$t('Hedge.initiatingUnit')" :content="detailForm.settleCompName" />
        <DetailDiv :label="$t('FeeList.settleCorp')" :content="detailForm.settleCorpName" />
        <SettleCorpTypeTags :tags="detailForm.settleCorpType||''" />
        <br />
        <DetailDiv :label="$t('Hedge.gedgingType')" :content="dictMapObj.gedgingType[detailForm.gedgingType]" />
        <el-form-item
          :label="$t('Hedge.hedgeSubtypes')"
          prop="gedgingSubType"
          v-if="detailForm.gedgingType === 'client_gedging'"
          :rules="fileRules"
          key="gedgingSubType"
        >
          <el-select v-model="detailForm.gedgingSubType">
            <el-option
              v-for="(op, j) in dictMap.gedgingSubType || []"
              :key="j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- {{gedgingCurrencyDisabled}} -->
        <el-form-item
          :label="$t('Hedge.hedgeCurrency')"
          prop="gedgingCurrency"
          style="margin-bottom: 6px;"
          key="gedgingCurrency"
        >
          <el-select
            v-model="detailForm.gedgingCurrency"
            :placeholder="$t('Common.plSelect')"
            @change="currencyChange"
            :disabled="gedgingCurrencyDisabled"
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
          style="margin-bottom: 6px;"
          v-if="detailForm.gedgingCurrency !== 'original' && (!isDetailPage || needRateType) && !(gedgingCurrencyDisabled && !detailForm.exchangeRateType)"
          :label="$t('Hedge.rateType')"
          prop="exchangeRateType"
          :disable="isDetailPage"
          :rules="rateTypeRules"
          key="exchangeRateType"
        >
          <!-- if (this.needRateType && !this.detailForm.exchangeRateType) { -->
          <el-select
            v-model="detailForm.exchangeRateType"
            :placeholder="$t('Common.plSelect')"
            @change="rateTypeChange"
            :disabled="!this.needRateType && gedgingCurrencyDisabled"
          >
            <el-option
              v-for="(op, j) in exchangeRateTypeList"
              :key="'settleCycle' + j"
              :label="op.label"
              :value="op.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          class="upload_form_item"
          style="width: 100%"
          :label="$t('Hedge.uploadAttachment')"
          prop="fileNo"
          v-if="['client_gedging','zcpxf_gedging', 'deposit_gedging'].includes(detailForm.gedgingType)"
          :rules="fileRules"
          key="fileNo"
        >
          <!-- <el-input
            v-model="detailForm.fileNo"
            style="position:absolute;right:0;top:0;width:1px;height:1px;opacity:0;"
          ></el-input>
          <el-upload
            class="finance-table-upload"
            action="str"
            :limit="1"
            :on-exceed="handleExceed"
            :on-remove="handleRemove"
            :before-remove="beforeRemove"
            :on-change="fileChange"
            :auto-upload="false"
            :file-list="fileList"
            :drag="true"
          >
            <el-button type="text" v-show="showUploadBtn">{{$t('Hedge.clickUpload')}}</el-button> -->
            <FinUploadEmbed
            :autoUpload="false"
            :limit="1"
            @send-file-list="sendResFileList"
          />
          </el-upload>
        </el-form-item>
        <div style="margin-bottom: 6px;">
          <div class="settlement-exchange-rates">
            <div class="settlement-exchange-rates-title">{{$t('Hedge.hedgingRates')}}:</div>
            <el-form-item
              v-for="(item, index) in detailForm.exchangeRates.filter(v=>!v.invisible)"
              :key="'settlementRate' + index"
              :label="item.settlementRateTitle+'　'"
              v-show="item.settlementRate != 1"
              label-width="160px"
              style="margin-bottom: 0 !important;"
            >
              <el-input
                v-model="item.settlementRate"
                :placeholder="selectCurrencyPlaceholder"
                :disabled="item.gedgingRateEditDisabled || isDetailPage"
              ></el-input>
            </el-form-item>
          </div>
          <div class="settlement-exchange-rates" v-if="exchangeRatesCash.length">
            <div class="settlement-exchange-rates-title">{{$t('Hedge.customerRate')}}:</div>
            <span
              v-for="(item, index) in exchangeRatesCash"
              :key="index"
            >{{item.settlementRateTitle}} {{item.settlementRate}}</span>
          </div>
        </div>
        <el-form-item class="full-form-item" :label="$t('Settle.applyRemarks')" style="width:100% !important;" v-if="!isDetailPage">
          <el-input
            v-model="detailForm.remark"
            :placeholder="$t('Common.plEnter')"
            maxlength="500"
            type="textarea"
            :autosize="true"
            :disabled="isDetailPage"
          ></el-input>
        </el-form-item>
        <!-- <DetailDiv label="核销状态：" :content="dictMapObj.writeoffInfoStatus[detailForm.writeoffStatus]" /> -->

        <DetailDiv
          v-if="isDetailPage && detailForm.auditStatus === 'refuse'"
          :label="$t('Settle.reject')"
          :content="detailForm.refuseReason"
          :isTooltip="true"
        />
      </template>
      <template v-else>
        <DetailDiv :label="$t('Hedge.hedgeNumber')" :content="detailForm.gedgingApplyNo" />
        <DetailDiv :label="$t('Hedge.initiatingUnit')" :content="detailForm.settleCompName" :isTooltip="true" />
        <DetailDiv :label="$t('FeeList.settleCorp')" :content="detailForm.settleCorpName" :isTooltip="true" />
        <SettleCorpTypeTags :tags="detailForm.settleCorpType||''" />
        <br />
        <DetailDiv :label="$t('Hedge.gedgingType')" :content="dictMapObj.gedgingType[detailForm.gedgingType]" />
        <DetailDiv :label="$t('Hedge.hedgeSubtypes')" :content="dictMapObj.gedgingSubType[detailForm.gedgingSubType]" />
        <DetailDiv
          :label="$t('Hedge.hedgeCurrency')"
          :content="detailForm.gedgingCurrency === 'original' ? $t('Settle.orignalCurrency') : detailForm.gedgingCurrency"
        />
        <DetailDiv
          v-if="detailForm.exchangeRateType"
          :label="$t('Hedge.rateType')"
          :content="exchangeRateTypeList.find(v=>v.value === detailForm.exchangeRateType).value"
        />
        <DetailDiv :label="$t('Settle.applicant')" :content="detailForm.createdName" />
        <DetailDiv :label="$t('Settle.applicationDate')" :content="detailForm.createdTime" />
        <DetailDiv v-if="detailForm.writeoffStatus === 'finish'" :label="$t('Hedge.internalVoucherNo')">
          <MultiBtn
            :btnStr="voucherNos||''"
            @generate="createGenerate"
          />
        </DetailDiv>
        <DetailDiv v-if="detailForm.writeoffStatus === 'finish'" :label="$t('Hedge.externalVoucherNo')">
          <MultiBtn
             :isEx="true" :btnStr="exVoucherNos||''"
            @generate="createGenerate2($event, true)"
          />
        </DetailDiv>
        <DetailDiv :label="$t('Common.attachment')" :isSlot="true" v-if="isDetailPage && detailForm.confirmFileName">
          <el-tooltip
            v-if="detailForm.confirmFileName"
            :content="detailForm.confirmFileName"
            placement="top-start"
          >
            <el-tag
              class="detail__content"
              size="medium"
              @click="showAttachment(detailForm)"
            >{{ detailForm.confirmFileName }}</el-tag>
          </el-tooltip>
        </DetailDiv>
        <DetailDiv :label="$t('Hedge.indemnityAtt')" :isSlot="true" v-if="hasPcj">
          <div class="el-form-item-text" style="cursor:pointer;">
            <ColumnTipIntegration :item="pcjFileColumn" :row="pcjFileColumnTipRow" />
          </div>
        </DetailDiv>
        <div class="devide_line"></div>
        <!-- v-if="detailForm.writeoffStatus && detailForm.writeoffStatus !== 'nofinish'" -->
        <DetailDiv
          v-if="detailForm.writeoffStatus && detailForm.writeoffStatus !== 'nofinish'"
          :label="$t('FeeList.writeoffNo')"
          :content="detailForm.writeoffNopayNo"
        />
        <el-form-item
          style="margin-bottom: 6px; width:25%;"
          :label="$t('FeeList.writeOffDate')"
          v-if="detailForm.writeoffStatus && detailForm.writeoffStatus !== 'nofinish'"
          class="form__item__button"
        >
          <span v-if="isWriteoffSave">{{writeoffDate}}</span>
          <el-date-picker 
            v-else
            v-model="writeoffDate"
            value-format="yyyy-MM-dd"
            :disabled="isWriteoffSave"
          ></el-date-picker>
          <el-button type="text" size="mini" @click="writeoffSave">{{isWriteoffSave? $t('Common.modify'):$t('Common.save')}}</el-button>
        </el-form-item>
        <template v-if="detailForm.writeoffStatus === 'check_back'">
          <DetailDiv :label="$t('Hedge.antiUnderwriters')" :content="detailForm.reverseName" />
          <DetailDiv :label="$t('Hedge.antiwritingTime')" :content="detailForm.reverseTime" />
        </template>
        <template v-else>
          <DetailDiv
            v-if="detailForm.writeoffStatus && detailForm.writeoffStatus !== 'nofinish'"
            :label="$t('Hedge.writeoffs')"
            :content="detailForm.writeoffby"
          />
          <DetailDiv
            v-if="detailForm.writeoffStatus && detailForm.writeoffStatus !== 'nofinish'"
            :label="$t('Hedge.writeoffTime')"
            :content="detailForm.writeoffTime"
          />
        </template>
        <DetailDiv :label="$t('PreClose.approvalStatus')" :content="dictMapObj.auditStatus[detailForm.auditStatus]" />
        <DetailDiv
          v-if="detailForm.auditStatus !== 'pending'"
          :label="$t('PreClose.approver')"
          :content="detailForm.auditName"
        />
        <DetailDiv
          v-if="detailForm.auditStatus !== 'pending'"
          :label="$t('PreClose.approvalTime')"
          :content="detailForm.auditTime"
        />
        <div class="settlement-exchange-rates" style="margin-bottom: 6px;">
          <div class="settlement-exchange-rates-title">{{$t('Hedge.hedgingRates')}}:</div>
          <span
            style="padding-right: 12px;"
            v-for="(item, index) in detailForm.exchangeRates.filter(v=>!v.invisible)"
            :key="index"
          >{{item.settlementRateTitle}} {{item.settlementRate}}</span>
        </div>
        <DetailDiv :label="$t('Settle.applyRemarks')" :content="detailForm.remark" :isFull="true" />
        <el-form-item
          v-if="isDetailPage"
          class="full-form-item"
          :label="$t('Settle.approvalRemarks')"
          style="width:100% !important;;"
          prop="writeoffRemark"
        >
          <el-input
            type="textarea"
            :autosize="true"
            v-model="detailForm.writeoffRemark"
            :placeholder="$t('Common.plEnter')"
            maxlength="500"
          ></el-input>
          <el-button
            v-if="detailForm.auditStatus !== 'pending'"
            type="primary"
            size="mini"
            @click="saveRemark"
          >{{$t('Hedge.saveReviewRemarks')}}</el-button>
        </el-form-item>
      </template>
    </el-form>
    <!-- </div> -->
    <div v-if="option4.data&&option4.data.length" class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title size-12">{{$t('Hedge.latePaymentFee')}}</div>
        </div>
        <div class="money-box-right"></div>
      </div>
      <FinanceTable :option="option4" />
    </div>
    <!-- <div
      v-if="option3.data&&option3.data.length"
      style="padding-top: 16px;margin:0 8px;border-top:1px solid #E9E9E9;"
    >
      <h3 style="padding-left:8px;color: #222">{{$t('Hedge.underwritInfo')}}</h3>
      <FinanceTable :option="option3" />
    </div> -->
    <!-- <FeeSumTable :option="settleCompOption" :vm="vm" :isDetailPage="isDetailPage" :showAuto="true" /> -->
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">{{detailForm.settleCompName}} {{$t('Common.fees')}}</div>
          <DetailAmtSummary :option="detailAmtSummaryOption" />
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button
              class="finance-btn"
              v-if="!isDetailPage"
              @click="autoCompulateGedgingFee"
              size="mini"
            >{{$t('Hedge.autoAllocation')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="isDetailPage"
              class="finance-btn"
              @click="feeSearchToggle = !feeSearchToggle"
              size="mini"
              type="primary"
            >{{feeSearchToggle? $t('Common.hideSearch') : $t('Common.showSearch')}}</el-button>
          </el-button-group>
        </div>
      </div>
      <DetailFeeSearch
        v-show="feeSearchToggle && isDetailPage"
        ref="detailFeeSearch"
        :list="option11.data"
        @search="search"
      />
      <FinanceTable :option="option11" @send-multi="sendMulti" />
    </div>
    <div class="finance-table-container" v-if="isGroupGedging">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">{{detailForm.settleCorpName}}{{$t('Common.fees')}}</div>
          <DetailAmtSummary :option="detailAmtSummaryOption2" />
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button
              v-if="isDetailPage"
              class="finance-btn"
              @click="feeSearchToggle2 = !feeSearchToggle2"
              size="mini"
              type="primary"
            >{{feeSearchToggle2? $t('Common.hideSearch') : $t('Common.showSearch')}}</el-button>
          </el-button-group>
        </div>
      </div>
      <DetailFeeSearch
        v-show="feeSearchToggle2 && isDetailPage"
        ref="detailFeeSearch"
        :list="option12.data"
        @search="search2"
      />
      <FinanceTable :option="option12" @send-multi="sendMulti" />
    </div>
    <div class="finance-table-container" v-if="sysFeeInfo.gedgingSettleFeeList.length">
      <div class="money-box">
        <div class="money-box-left">
          <div class="money-title">{{$t('Hedge.systemCost')}}</div>
          <DetailAmtSummary :option="detailAmtSummaryOption3" />
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button
              v-if="isDetailPage"
              class="finance-btn"
              @click="feeSearchToggle3 = !feeSearchToggle3"
              size="mini"
              type="primary"
            >{{feeSearchToggle2? $t('Common.hideSearch') : $t('Common.showSearch')}}</el-button>
          </el-button-group>
        </div>
      </div>
      <DetailFeeSearch
        v-show="feeSearchToggle3 && isDetailPage"
        ref="detailFeeSearch"
        :list="option13.data"
        @search="search3"
      />
      <FinanceTable :option="option13" @send-multi="sendMulti" />
    </div>
    <el-dialog
      :title="$t('Hedge.hedgeReject')"
      :visible.sync="rejectDialogVisible"
      :destroy-on-close="true"
      class="finance-audit-reject-dialog"
      width="600px"
    >
      <el-form :model="form" ref="form" label-width="130px" label-suffix=":">
        <el-form-item
          :label="$t('Settle.reject')"
          prop="refuseReason"
          :rules="{required: false, message: $t('Hedge.rejectionEmp'), trigger: 'blur'}"
        >
          <el-input type="textarea" v-model="form.refuseReason" maxlength="500"  style="width: 400px" show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button :loading="btnLoading1" type="primary" @click="audit('refuse')" size="mini">{{$t('Common.sure')}}</el-button>
        <el-button @click="rejectDialogVisible = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
    <PreviewDialog
      :dialogOption="previewDialog"
      @generate="createGenerate"
      :showDel="checkAuth($route.name, 'btn-voucherDel')"
      :showCreate="checkAuth($route.name, 'btn-voucherCreate')"
    />
    <VoucherNosTable :dialogOption="voucherNosTableOption" @close="getData"/>
    <el-dialog
      :title="$t('Hedge.latePaymentFee')"
      :visible.sync="lateFeeVisible"
      :close-on-click-modal="false"
      width="800px">
      <FinanceTable
        :option="option14" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleLateFee" size="mini" type="primary">{{$t('Hedge.immediatePro')}}</el-button>
        <el-button @click="lateFeeVisible = false" size="mini">{{$t('Common.close')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
// 几个汇率逻辑
// exchangeRateList: [], // 接口返回的当日结算汇率列表
// settleExchangeRateList: [], // 结算需要用到的汇率列表, 提交申请时用此数据，数据从detailForm.exchangeRates获取
// 币种手动变化，费用的新增、删除、搜索过滤均会触发currencyChange
// 结算币种变化currencyChange会触发detailForm.exchangeRates从exchangeRateList获取汇率
// detailForm.exchangeRates: [], // 对冲汇率，可编辑，初始化时由接口返回，编辑后会同步到settleExchangeRateList和费用列表，同时计算折币金额，

import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
import VoucherNosTable from '@/views/finance/voucher/components/voucherNosTable'
import DetailAmtSummary from '@/views/finance/components/financeTableMass/detailAmtSummary'
import InvoiceReceivableApply from '@/views/finance/invoiceReceivable/components/invoiceReceivableApply'
import SettlementPayApply from '@/views/finance/settlement/settlementList/components/settlementPayApply'
import DetailFeeSearch from '@/views/finance/components/financeSearch/detailFeeSearch'
import FeeSumTable from './feeSumTable'
import FinUploadEmbed from '@/views/finance/components/financeUpload/financeUploadEmbed'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mapGetters } from 'vuex'
import { actualExchangeRate } from '@/api/base'
import { dateFormat } from '@/views/finance/utils/finance'
import {
  info,
  applyDetailBySettleOrder,
  applyDetailBySettleOrderDetail,
  audit,
  autoCompulateGedgingFee,
  gedgingCancel,
  updateRemark,
  orderNoFiles,
} from '@/api/fin/gedging'
import { reverse } from '@/api/fin/settleOrderBaddebt'
import { nopayWriteOffGenerate, exNopayWriteOffGenerate, voucherDelete, exVoucherDelete, voucherListGedging } from '@/api/fin/voucher'
import { updateWriteoffDate } from '@/api/fin/writeoffNopay'
import { updateWriteoffRecipayTransferDzg } from '@/api/fin/writeoffRecv'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import ColumnTipIntegration from '@/views/finance/components/financeColumnTip/columnTipIntegration'
import { listByWriteoffNo } from '@/api/fin/custOverduePayment'

export default {
  mixins: [mixin, routerMixin],
  data() {
    return {
      // vm: this,
      hasPcj: false,
      voucherNos: '',
      exVoucherNos: '',
      voucherNosTableOption: { show: false, list: [] },
      settleCompOption: {
        title: '',
        receiveList: [],
        payList: [],
        tableOption: { columns: [], data: [] },
      },
      option11: {},
      option12: {},
      option13: {},
      option3: {},
      option4: {},
      option14: {},
      multipleSelection1: [],
      previewDialog: {
        show: false,
        title: this.$t('FeeList.voucherPreview'),
        seqNo: '',
        showData: [],
      },
      detailForm: {
        settleCorpType: '',
        exchangeRateType: '',
        settleCompName: '',
        settleCorpName: '',
        settleCompCode: '',
        settleCorpCode: '',
        gedgingType: '',
        gedgingSubType: '',
        gedgingCurrency: '',
        remark: '',
        writeoffRemark: '',
        confirmFileName: '',
        confirmFileNo: '',
        createdName: '',
        createdTime: '',
        auditName: '',
        auditTime: '',
        auditStatus: '',
        interTransferStatus: '',
        gedgingApplyNo: '',
        settleOrderNos: '',
        exchangeRates: [
          {
            systemRate: '',
            settlementRateTitle: '',
            settlementRate: null,
            exchangeRateId: null,
            lowerRate: null,
            upperRate: null,
          },
        ],
      },
      searchWords: '',
      financePageMargin: '',
      currencyAddOriginal: [],
      exchangeRateList: [], // 接口返回的当日结算汇率列表
      settleExchangeRateList: [], // 结算需要用到的汇率列表
      timer1: null,
      timer2: null,
      // gedgingRateEditDisabled: false, // 自定义对冲汇率是否可用
      invoicePaymentId: -1,
      addFeeDialogVisible: {
        show: false,
      },
      watchFormExchangeRatesTime: 0,
      orderBillId: 0, // temp use the prop
      showUploadBtn: true,
      file: null,
      gedgingCurrencyDisabled: false, // 接口有对冲币种返回时，不让修改
      isDetailPage: false,
      rejectDialogVisible: false,
      auditStatus: '',
      form: { refuseReason: '' },
      isGroupGedging: false, // 集团对冲
      receiveGather: [],
      payGather: [],
      companyFeeInfo: {
        gedgingSettleFeeList: [],
        settleCompCode: '',
        settleCompName: '',
        sumList: [],
      },
      receiveGather2: [],
      payGather2: [],
      settleUnitFeeInfo: {
        gedgingSettleFeeList: [],
        settleCompCode: '',
        settleCompName: '',
        sumList: [],
      },
      receiveGather3: [],
      payGather3: [],
      sysFeeInfo: {
        gedgingSettleFeeList: [],
        sumList: [],
      },
      source: '',
      settleOrderIds: [],
      settleOrderId: '',
      settleOrderFeeIds: [],
      gedgingApplyId: '',
      routeBackName: undefined,
      cTimestamp: 0,
      fileList: [],
      noExchangeRateMessage: null,
      vmDataBackup: '',
      isDataChangeFromBackEnd: false,
      selectCurrencyPlaceholder: this.$t('Hedge.hedgingCurrencyTips'),
      writeoffDate: '',
      isWriteoffSave: true,
      pcjFileColumn: {},
      pcjFileColumnTipRow: {},
      fileRules: { required: true, message: ' ' },
      exchangeRatesCash: [],
      feeSearchToggle: true, // 费用搜索默认显示
      feeSearchToggle2: true,
      feeSearchToggle3: true,
      isApply: false,
      exchangeRateTypeList: [
        { value: 'receive', label: this.$t('Hedge.collectionRate') },
        { value: 'pay', label: this.$t('Hedge.paymentRate')},
      ],
      lateFeeVisible: false,
    }
  },
  components: {
    FinanceTable,
    // AddFeeDialog,
    // BillDetail,
    InvoiceReceivableApply,
    SettlementPayApply,
    ColumnTipIntegration,
    DetailFeeSearch,
    FeeSumTable,
    DetailAmtSummary,
    PreviewDialog,
    VoucherNosTable,
    FinUploadEmbed,
  },
  created() {
    let dictMapCurrency = JSON.parse(JSON.stringify(this.dictMap['validCurrency']))
    let find = dictMapCurrency.find((item) => item.value === 'ORIGINAL')
    if (find) {
      find.value = 'original'
    } else {
      dictMapCurrency.push({ label: this.$t('Settle.orignalCurrency'), value: 'original' })
    }
    this.currencyAddOriginal = dictMapCurrency
    console.log(this.dictMapObj.settleUnitSubType)
    this.cTimestamp = new Date().getTime()
    this.vmDataBackup = JSON.stringify(this.$data)
    this.init()
    this.getData()
  },
  activated() {
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 300) {
      this.lateFeeVisible = false // 防止叉掉了页面时，滞纳金窗口还在
      if (this.$refs.gedgingForm) {
        this.$refs.gedgingForm.resetFields()
        this.$refs.gedgingForm.clearValidate()
      }
      Object.assign(this.$data, JSON.parse(this.vmDataBackup), {
        option: this.$data.option,
        vmDataBackup: this.vmDataBackup,
      })
      this.$refs.detailFeeSearch && this.$refs.detailFeeSearch.clearData()
      // this.detailForm.confirmFileName = ''
      // this.fileList = []
      // this.gedgingCurrencyDisabled = false
      // this.gedgingRateEditDisabled = false // 弃用，改成单个item单独设置disabled
      this.init()
      this.getData()
    }
  },
  methods: {
    init() {
      this.voucherNos = this.exVoucherNos = ''
      let routeQuery = this.$route.query
      console.log('route.query:', routeQuery)
      this.source = routeQuery.source
      this.settleOrderIds = routeQuery.settleOrderIds ? JSON.parse(routeQuery.settleOrderIds) : routeQuery.settleOrderIds
      this.settleOrderId = routeQuery.settleOrderId
      this.settleOrderFeeIds = routeQuery.settleOrderFeeIds
        ? JSON.parse(routeQuery.settleOrderFeeIds)
        : routeQuery.settleOrderFeeIds
      this.gedgingApplyId = routeQuery.gedgingApplyId
      if (this.source && this.source.indexOf('create') > -1) {
        this.isDetailPage = false
        this.isApply = true
      } else {
        this.isDetailPage = true
      }

      let operationBtns = Object.assign(this.option.operationBtns, {
        data: [{ label: this.$t('Common.del'), type: 'text', show: true, action: 'Delete' }],
        show: false,
      })
      this.option11 = Object.assign({}, this.option, {
        id: 'option11',
        $name: 'GedgingDetail1',
        data: [],
        tips: { text: '', show: false },
        operationBtns,
        selection: { show: false },
        edit: true,
        maxHeight: 500,
        colorColumns: ['receipayType'],
        sortable: this.isDetailPage ? true : false,
        sortChange: this.sortChange,
      })
      let columns = [
        { prop: 'settleCompName', label: this.$t('FeeList.settleComp'), minWidth: 160, type: 'text' },
        { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), minWidth: 160, type: 'text' },
        { prop: 'feeEnName', label: this.$t('FeeList.feeEname'), width: 100, type: 'text' },
        {
          prop: 'sourceBizNo',
          label: this.$t('FinBill.orderNo'),
          type: 'button',
          width: 145,
          operationBtns: {
            show: true,
            callback: (action, index, row, option) => {
              this.showDetail(row)
            },
          },
        },
        {
          prop: 'settleOrderNo',
          label: this.$t('FeeList.settleOrderNo'),
          type: 'button',
          width: 145,
          operationBtns: {
            show: true,
            callback: (action, index, row, option) => {
              this.routerPush('SettlementDetail', { source: 'settlementDetail', settleOrderNo: row.settleOrderNo })
            },
          },
        },
        { prop: 'receipayType', label: this.$t('Settle.receipayType'), width: 80, type: 'select', readOnly: true },
        { prop: 'feeAmt', label: this.$t('Hedge.originalFees'), width: 100, type: 'text' },
        { prop: 'currency', label: this.$t('Hedge.feeCurrency'), width: 80, type: 'text' },
        { prop: 'canGedgingAmt', label: this.$t('Hedge.hedgeableAmount'), width: 100, type: 'text' },
        { prop: 'gedgingAmt', label: this.$t('Hedge.hedgeAmount'), width: 100, type: 'input' },
        { prop: 'gedgingRate', label: this.$t('Hedge.currencyRate'), width: 100, type: 'text' },
        { prop: 'exGedgingAmt', label: this.$t('Settle.exSettleAmt'), width: 100, type: 'text' },
        // { prop: 'invoiceStatus', label: this.$t('Settle.invoiceStatus'), width: 80, type: 'select', propInDict: 'feeInvoiceStatus', readOnly: true },
        { prop: 'finDate', label: this.$t('FeeList.financialDate'), width: 86, type: 'text' },
        { prop: 'acfinDate', label: this.$t('FeeList.acfinDate'), type: 'text', width: 86},
      ]
      this.option11.columns = columns
      this.option12 = Object.assign({}, this.option, {
        id: 'option12',
        $name: 'GedgingDetail2',
        data: [],
        tips: { text: '', show: false },
        operationBtns,
        selection: { show: false },
        edit: true,
        sortable: this.isDetailPage ? true : false,
        sortChange: this.sortChange2,
      })
      this.option12.columns = columns
      this.option13 = Object.assign({}, this.option, {
        id: 'option13',
        $name: 'GedgingDetail3',
        data: [],
        tips: { text: '', show: false },
        operationBtns,
        selection: { show: false },
        edit: true,
        sortable: this.isDetailPage ? true : false,
        sortChange: this.sortChange3,
      })
      this.option13.columns = columns

      this.notifySettlementDetailApplyStatus(false)
      this.option3 = Object.assign({}, this.option, {
        edit: true,
        id: 'option3',
        $name: 'GedgingDetail3',
        data: [],
        index: { show: true },
        tips: false,
        rootTipsHide: true,
        selection: false,
        edit: true,
        operationBtns: Object.assign({}, this.option.operationBtns, {
          show: true,
          width: 100,
          data: [
            { label: this.$t('Common.modify'), action: 'edit', showFn: (row) => !row.edit, style: 'color:#E9851F;' },
            { label: this.$t('Common.save'), action: 'save', showFn: (row) => row.edit },
            { label: this.$t('Common.cancel'), action: 'cancel', showFn: (row) => row.edit },
          ],
          callback: (action, index, row) => {
            if (action === 'edit') {
              row.edit = true
            } else if (action === 'cancel') {
              row.edit = false
            } else {
              let { writeoffReceipayTransferDzgId, dzgWriteoffNo } = row
              updateWriteoffRecipayTransferDzg({ writeoffReceipayTransferDzgId, dzgWriteoffNo }).then((res) => {
                row.edit = false
              })
            }
          },
        }),
      })
      this.option3.columns = [
        { prop: 'dzgCompName', label:  this.$t('Hedge.daZg'), minWidth: 200, type: 'text' },
        { prop: 'currency', label:  this.$t('Hedge.hedgeCurrency'), type: 'text' },
        { prop: 'internalDzgAmt', label: this.$t('Hedge.hedgeAmount'), type: 'text' },
        { prop: 'dzgWriteoffNo', label:  this.$t('Hedge.writeoffNo'), minWidth: 200, type: 'input' },
      ]
      this.option4 = Object.assign({}, this.option, {
        id: 'option4',
        $name: 'GedgingDetail4',
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
        { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), minWidth: 150, type: 'text' },
        { prop: 'currency', label: this.$t('FeeList.currency'), type: 'text' },
        { prop: 'arrearReceiveAmt', label:  this.$t('Hedge.arrearReceiveAmt'), type: 'text' },
        { prop: 'lateFeeAmt', label:  this.$t('Hedge.lateFeeAmt'), type: 'text' },
        {
          prop: 'custOverduePaymentNo',
         label: this.$t('Hedge.custOverduePaymentNo'),
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
      this.pcjFileColumn = {
        prop: 'pcjFile',
        component: 'ColumnTip',
        componentProps: {
          show: false,
          data: [],
          callback: (no, componentProps, index) => {
            let row = componentProps.row
            let item = row.pcjFiles[index]
            let href = `/base/fileView/preview/${item.fileNo}/sowoll`
            window.open(href)
          },
        },
      }
      this.option14 = Object.assign({}, this.option, {
        id: 'option14',
        $name: 'GedgingDetail14',
        data: [],
        index: { show: true },
        tips: false,
        rootTipsHide: true,
        selection: false,
        operationBtns: Object.assign({}, this.option.operationBtns, {
          show: false
        }),
      })
      this.option14.columns = [
        { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), minWidth: 150, type: 'text' },
        { prop: 'currency', label: this.$t('FeeList.currency'), type: 'text' },
        { prop: 'arrearReceiveAmt', label: this.$t('Hedge.arrearReceiveAmt'), type: 'text' },
        { prop: 'lateFeeAmt', label: this.$t('Hedge.lateFeeAmt'), type: 'text' },
        { prop: 'custOverduePaymentNo', label: this.$t('Hedge.custOverduePaymentNo'), type: 'button',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              this.routerPush('LateFeeDetail', {
                custOverduePaymentNo: row.custOverduePaymentNo
              })
            },
          }
        },
      ]
    },
    getData() {
      this.lsLoading = true
      let p = null
      if ((this.settleOrderId && this.settleOrderId > -1) || (this.settleOrderFeeIds && this.settleOrderFeeIds.length > 0)) {
        // 结算单详情发起对冲
        this.routeBackName = 'CreateGedging'
        let data = {
          settleOrderId: this.settleOrderId,
          settleOrderFeeIds: this.settleOrderFeeIds,
        }
        p = applyDetailBySettleOrderDetail(data)
        // p = info(data)
      } else if (this.settleOrderIds && this.settleOrderIds.length > 0) {
        // 结算单列表发起对冲
        this.routeBackName = 'CreateGedging'
        let data = {
          settleOrderIds: this.settleOrderIds,
        }
        p = applyDetailBySettleOrder(data)
        // p = info(data)
      } else {
        // 对冲详情
        let data = {
          gedgingApplyId: this.gedgingApplyId,
        }
        p = info(data)
      }
      p.then((res) => {
        this.lsLoading = false
        if (res.code === 0) {
          // res.data.gedgingApplyNoList = [1,2,3,4]
          if (res.data.gedgingApplyNoList && res.data.gedgingApplyNoList.length) {
            localStorage.setItem('settleOrder_gedgingApplyNoList', JSON.stringify(res.data.gedgingApplyNoList))
            this.delVisitedView()
            this.cancel()
            return
          }
          this.handleData(res)
        }
      }).catch((err) => {
        this.lsLoading = false
        console.log(err)
        this.delVisitedView()
        this.cancel()
      })
    },
    async handleData(res, isAutoCompulateGedgingFee) {
      let {
        companyFeeInfo,
        settleCompName,
        rivalCorpName,
        settleCompCode,
        rivalCorpCode,
        gedgingType,
        gedgingSubType,
        gedgingCurrency,
        remark,
        writeoffRemark,
        exchangeRateList,
        settleUnitFeeInfo,
        gedgingApplyNo,
        settleOrderNos,
        confirmFileName,
        confirmFileNo,
        createdName,
        createdTime,
        auditName,
        auditTime,
        auditStatus,
        refuseReason,
        writeoffStatus,
        writeoffby,
        writeoffTime,
        writeoffNopayNo,
        reverseName,
        reverseTime,
        exchangeRateType,
        sysFeeInfo,
        settleCorpType,
        custOverduePaymentListDtoList = [],
        acctVoucherSeqno,
        voucherNo,
        exVoucherNo,
      } = res.data
      if(writeoffStatus === 'finish'){
        this.voucherNos = voucherNo ? res.data.acctVoucherSeqno+'/'+voucherNo : ''
        this.exVoucherNos = exVoucherNo ? res.data.exAcctVoucherSeqno+'/'+exVoucherNo : ''
      }
      this.option4.data = custOverduePaymentListDtoList
      await actualExchangeRate({ rateType: exchangeRateType || 'pay' }).then((res) => {
        this.exchangeRateList = res.data || []
      })
      this.gedgingSubTypeBackup = gedgingSubType
      let settleCorpName = rivalCorpName // settleCorpName, settleCorpCode后台返回的是rivalCorpName，rivalCorpCode
      let settleCorpCode = rivalCorpCode
      // 核销日期
      this.writeoffDate = res.data.writeoffDate
      this.writeoffNopayId = res.data.writeoffNopayId
      // 自动计算费用只更新列表的费用信息
      if (!isAutoCompulateGedgingFee) {
        this.detailForm = Object.assign(this.detailForm, {
          settleCompName,
          settleCorpName,
          settleCompCode,
          settleCorpCode,
          settleCorpType,
          gedgingType,
          gedgingSubType: this.isDetailPage ? gedgingSubType : '',
          exchangeRateType,
          gedgingCurrency,
          remark,
          writeoffRemark,
          confirmFileName,
          confirmFileNo,
          gedgingApplyNo,
          settleOrderNos,
          createdName,
          createdTime,
          auditName,
          auditTime,
          auditStatus,
          refuseReason,
          writeoffStatus,
          writeoffby,
          writeoffTime,
          writeoffNopayNo,
          reverseName,
          reverseTime,
          acctVoucherSeqno,
          voucherNo,
        })
      }
      this.companyFeeInfo = companyFeeInfo
      this.settleUnitFeeInfo = settleUnitFeeInfo
      this.settleUnitFeeInfo = settleUnitFeeInfo
      this.sysFeeInfo = sysFeeInfo || {
        gedgingSettleFeeList: [],
        sumList: [],
      }
      this.option11.data = companyFeeInfo.gedgingSettleFeeList.map((item) => {
        item.edit = this.isDetailPage ? false : true
        return item
      })
      this.commonPcjFile(companyFeeInfo.gedgingSettleFeeList || [])
      // this.fileRules.required = this.detailForm.gedgingType === 'client_gedging'
      // domestic_cust: "国内直客"
      // domestic_cust_new: "国内直客(新模式)"
      // domestic_peer: "国内同行"
      // domestic_peer_new: "国内同行(新模式)"
      // foreign_cust: "国外直客"
      // foreign_cust_new: "国外直客(新模式)"
      // foreign_peer: "国外同行"
      // foreign_peer_new: "国外同行(新模式)"
      // let subArr1 = ['domestic_cust', 'domestic_cust_new', 'domestic_peer', 'domestic_peer_new']
      // let subArr2 = ['foreign_cust', 'foreign_cust_new', 'foreign_peer', 'foreign_peer_new']
      // let subArr = [...subArr1, ...subArr2]
      if (this.isDetailPage) {
        this.fileRules.required = false
      } else if (this.detailForm.gedgingType === 'client_gedging') {
        this.fileRules.required = true
        // } else if (this.detailForm.gedgingType === 'deposit_gedging' && subArr.includes(this.detailForm.settleUnitSubType)) {
      } else if (this.detailForm.gedgingType === 'deposit_gedging') {
        ;(this.detailForm.settleUnitSubTypeList || []).map((item) => {
          if (['peer', 'cust'].includes(item)) {
            this.fileRules.required = true
          }
        })
        // this.fileRules.required = true
      } else {
        this.fileRules.required = false
      }
      this.isGroupGedging = gedgingType === 'group_gedging' ? true : false
      if (this.isGroupGedging) {
        this.option12.data = settleUnitFeeInfo.gedgingSettleFeeList.map((item) => {
          item.edit = this.isDetailPage ? false : true
          return item
        })
      }
      if (this.sysFeeInfo.gedgingSettleFeeList.length) {
        this.option13.data = this.sysFeeInfo.gedgingSettleFeeList.map((item) => {
          item.edit = this.isDetailPage ? false : true
          return item
        })
      }
      this.isDataChangeFromBackEnd = true
      setTimeout(() => {
        this.isDataChangeFromBackEnd = false
      }, 700)
      if (gedgingCurrency && gedgingCurrency !== 'original') {
        // 非原币对冲，读取后台返回的汇率
        this.detailForm.exchangeRates = exchangeRateList.map((item) => {
          return {
            cashBuyRate: item.cashBuyRate,
            settlementRateTitle: item.srcCurrency + '-' + item.toCurrency,
            settlementRate: item.rate,
            lowerRate: item.lowerRate, // 0,
            upperRate: item.upperRate, // 10000
            gedgingRateEditDisabled: item.srcCurrency === item.toCurrency ? true : false,
          }
        })
        this.settleExchangeRateList = exchangeRateList.map((item) => item)
      } else {
        if (!gedgingCurrency) {
          // 如果对冲币种为空，置为原币种对冲
          gedgingCurrency = 'original'
        }

        this.detailForm.exchangeRates = exchangeRateList.map((item) => {
          return {
            cashBuyRate: item.cashBuyRate,
            settlementRateTitle: item.srcCurrency + '-' + item.toCurrency,
            settlementRate: item.rate,
            lowerRate: item.lowerRate,
            upperRate: item.upperRate,
          }
        })
        // 计算时用的汇率
        this.settleExchangeRateList = [...exchangeRateList]
        this.gedgingCurrencyDisabled = false
        // this.gedgingRateEditDisabled = true
        this.detailForm.exchangeRates.forEach((item) => {
          item.gedgingRateEditDisabled = true
        })
      }
      // 如果各条费用的币种相同，对冲币种设为该币种，且不可更改
      let optionData = this.option11.data
      let dataItem1 = optionData[0]

      // 对空数组进行every操作，结果为true
      let isSameCurrency = optionData.every((item) => item.currency === dataItem1.currency)
      isSameCurrency = isSameCurrency && this.option12.data.every((item) => item.currency === dataItem1.currency)

      let settleOrderNoArr = [...new Set([...optionData, ...this.option12.data].map((v) => v.settleOrderNo))]
      // console.log(settleOrderNoArr, this.detailForm.gedgingCurrency)
      if (this.isDetailPage) {
        this.detailForm.gedgingCurrency = gedgingCurrency
      }
      //  else if (isSameCurrency && dataItem1) {
      //   this.detailForm.gedgingCurrency = dataItem1.currency
      //   this.gedgingCurrencyDisabled = true
      // }
      else if (settleOrderNoArr.length === 1 && !isAutoCompulateGedgingFee) {
        this.gedgingCurrencyDisabled = this.detailForm.gedgingCurrency !== 'original'
      }

      this.convertToFeeGather()
      if (this.isGroupGedging) {
        this.convertToFeeGather2()
      }
      if (this.sysFeeInfo.sumList.length) {
        this.convertToFeeGather3()
      }
      this.option3.data = (res.data.dzgGedgingSettleFeeList || []).map((item) => ({ ...item, edit: false }))
    },
    reverse() {
      this.$confirmWarn(this.$t('Hedge.antiWarranting'), () => {
        reverse({ writeoffNopayId: this.writeoffNopayId }).then((res) => {
          this.$msgSucClose(this.$t('Hedge.underwritingSuc'))
          if(this.detailForm.gedgingType === 'bed_debt_gedging'){
            this.delVisitedView()
            this.cancel()
            return
          }
          this.getData()
        })
      })
    },
    currencyChange(value) {
      console.log(value)
      // 费用列表里面的币种联动
      this.option11.data.forEach((item) => {
        item.gedgingCurrency = value !== 'original' ? value : item.currency
      })
      this.option12.data.forEach((item) => {
        item.gedgingCurrency = value !== 'original' ? value : item.currency
      })

      if (!this.detailForm.exchangeRateType && value !== 'original') {
        this.exchangeRateList = []
        return this.$msgWarnClose(this.$t('Hedge.exchangeRate'))
      }
      // 汇率联动
      let currencys = this.option11.data.concat(this.option12.data).map((item) => item.currency)
      currencys = [...new Set(currencys)]
      let differentCurrencys = currencys.filter((item) => item !== value)
      if (value === 'original') {
        // 就对冲而言，原币种没有用处---现改为需显示原币种
        this.settleExchangeRateList = currencys.map((currency) => {
          // 结算需要用到的汇率列表，原币种1:1
          return {
            srcCurrency: currency,
            toCurrency: currency,
            rate: 1,
            exchangeRateId: '',
          }
        })
        this.detailForm.exchangeRates = differentCurrencys.map((item) => {
          return {
            systemRate: item + '-' + item + ' ' + 1,
            settlementRateTitle: item + '-' + item,
            settlementRate: 1,
            exchangeRateId: '',
            lowerRate: 1,
            upperRate: 1,
            gedgingRateEditDisabled: true,
          }
        })
      } else {
        if (differentCurrencys.length > 0) {
          // differentCurrencys.length === 0 表示只有一种费用币种，且选择的结算币种和费用币种相同
          let exchangeRateList = this.exchangeRateList.filter((item) => {
            return differentCurrencys.some((currency) => {
              return currency === item.srcCurrency && value === item.toCurrency
            })
          })
          this.settleExchangeRateList = exchangeRateList // 结算需要用到的汇率列表
          this.detailForm.exchangeRates = exchangeRateList.map((item) => {
            return {
              cashBuyRate: item.cashBuyRate,
              systemRate: item.srcCurrency + '-' + item.toCurrency + ' ' + item.rate,
              settlementRateTitle: item.srcCurrency + '-' + item.toCurrency,
              settlementRate: item.rate,
              exchangeRateId: item.exchangeRateId,
              lowerRate: item.lowerRate,
              upperRate: item.upperRate,
            }
          })
          this.gedgingCurrencyDisabled = false
          // this.gedgingRateEditDisabled = false
        } else {
          this.settleExchangeRateList = currencys.map((currency) => {
            return {
              srcCurrency: currency,
              toCurrency: currency,
              rate: 1,
              exchangeRateId: '',
            }
          })
          this.detailForm.exchangeRates = currencys.map((item) => {
            return {
              systemRate: item + '-' + item + ' ' + 1,
              settlementRateTitle: item + '-' + item,
              settlementRate: 1,
              exchangeRateId: '',
              lowerRate: 1,
              upperRate: 1,
              gedgingRateEditDisabled: true,
            }
          })
          this.gedgingCurrencyDisabled = false
        }
      }
      // 解决测试提：汇率不存在时，弹出了两个提示（其实有一个是后台返回）。且改成了切换币种，直接调取后台自动分配金额，交予后台校验
      if (!this.isDetailPage && this.settleExchangeRateList.length > 0) {
        this.autoCompulateGedgingFee()
      }
    },
    // 列表内折币金额计算， 汇率或列表数据变动时触发
    computeExGedgingAmt(type) {
      if (this.isDetailPage) return
      let isRate = type === 'ratechange'
      this.option11.data
        .concat(this.option12.data)
        .concat(this.option13.data)
        .forEach((item) => {
          let srcCurrency = item.currency
          let toCurrency = item.gedgingCurrency
          let rate = 0
          if (srcCurrency === toCurrency || toCurrency === 'original') {
            // 如果币种相同
            rate = 1
          } else {
            let obj = this.settleExchangeRateList.find((item) => {
              return item.srcCurrency === srcCurrency && item.toCurrency === toCurrency
            })
            if (obj) {
              rate = item.feeCode === 'ZCPXF' && obj.cashBuyRate ? obj.cashBuyRate : obj.rate
              if (isRate) {
                item.gedgingRate = rate
              }
            } else {
              // 详情页面不提示未找到匹配的汇率
              if (!this.noExchangeRateMessage && !this.isDetailPage && this.detailForm.exchangeRateType) {
                this.noExchangeRateMessage = this.$msgErrClose(this.$t('Hedge.calculateTips'))
                setTimeout(() => (this.noExchangeRateMessage = null), 1000)
              }
              rate = 0
            }
          }
          item.exGedgingAmt = new LSnum(item.gedgingAmt).times(rate).toNum(2)
        })
    },
    // 简单的加法运算，对象内两个属性值之和
    calcPlusFn(obj, str1, str2) {
      return new LSnum(obj[str1]).plus(obj[str2]).toNum(2)
    },
    // 初始化表头合计计算，从接口返回获取
    convertToFeeGather() {
      if (!this.companyFeeInfo.sumList.length) return // 如果接口返回为空，自行处理
      this.receiveGather = []
      this.payGather = []
      this.companyFeeInfo.sumList.forEach((item) => {
        if(item.recvPositiveAmt || item.recvNegativeAmt){
          this.receiveGather.push({ currency: item.currency, amt: this.calcPlusFn(item, 'recvPositiveAmt', 'recvNegativeAmt'), isPay: false })
        }
        if(item.payPositiveAmt || item.payNegativeAmt){
          this.payGather.push({ currency: item.currency, amt: this.calcPlusFn(item, 'payPositiveAmt', 'payNegativeAmt'), isPay: true })
        }
      })
    },
    // 集团对冲，初始化表头合计计算，从接口返回获取
    convertToFeeGather2() {
      this.receiveGather2 = []
      this.payGather2 = []
      this.settleUnitFeeInfo.sumList.forEach((item) => {
        if(item.recvPositiveAmt || item.recvNegativeAmt){
          this.receiveGather2.push({ currency: item.currency, amt: this.calcPlusFn(item, 'recvPositiveAmt', 'recvNegativeAmt'), isPay: false })
        }
        if(item.payPositiveAmt || item.payNegativeAmt){
          this.payGather2.push({ currency: item.currency, amt: this.calcPlusFn(item, 'payPositiveAmt', 'payNegativeAmt'), isPay: true })
        }
      })
    },
    convertToFeeGather3() {
      this.receiveGather3 = []
      this.payGather3 = []
      this.sysFeeInfo.sumList.forEach((item) => {
        if(item.recvPositiveAmt || item.recvNegativeAmt){
          this.receiveGather3.push({ currency: item.currency, amt: this.calcPlusFn(item, 'recvPositiveAmt', 'recvNegativeAmt'), isPay: false })
        }
        if(item.payPositiveAmt || item.payNegativeAmt){
          this.payGather3.push({ currency: item.currency, amt: this.calcPlusFn(item, 'payPositiveAmt', 'payNegativeAmt'), isPay: true })
        }
      })
    },
    // 对冲费用列表合计计算， 由列表数据变化时触发
    computeFeeGather(data) {
      data = data ? data : this.option11.data
      this.computeFeeGatherFn(data, 'payGather', 'receiveGather')
    },
    // 集团对冲费用列表合计计算
    computeFeeGather2(data) {
      data = data ? data : this.option12.data
      this.computeFeeGatherFn(data, 'payGather2', 'receiveGather2')
    },
    // 系统对冲费用列表合计计算
    computeFeeGather3(data) {
      data = data ? data : this.option13.data
      this.computeFeeGatherFn(data, 'payGather3', 'receiveGather3')
    },
    computeFeeGatherFn(optionData, payGatherStr, receiveGatherStr) {
      let gatherFn = (gatherStr, receipayType) => {
        let arr = optionData.filter((item) => item.receipayType === receipayType && !item.invisible)
        let currencys = [...new Set(arr.map((item) => item.gedgingCurrency))]
        this[gatherStr] = currencys.map((currency) => {
          let obj = { currency, amt: 0, isPay: receipayType === 'pay' }
          arr.forEach((subItem) => {
            if (subItem.gedgingCurrency === currency) {
              obj.amt = new LSnum(obj.amt).plus(subItem.exGedgingAmt).toNum(2)
            }
          })
          return obj
        })
      }
      gatherFn(payGatherStr, 'pay')
      gatherFn(receiveGatherStr, 'receive')
    },
    autoCompulateGedgingFee() {
      if (this.detailForm.gedgingCurrency !== 'original' && !this.detailForm.exchangeRateType) {
        return this.$msgWarnClose(this.$t('Hedge.exchangeTips'))
      }
      let data = {
        gedgingCurrency: this.detailForm.gedgingCurrency,
        exchangeRateList: this.detailForm.gedgingCurrency === '' ? [] : this.settleExchangeRateList,
        gedgingSettleFeeList: this.option11.data.concat(this.option12.data),
      }
      autoCompulateGedgingFee(data).then((res) => {
        if (res.code === 0) {
          res.data = { ...res.data, exchangeRateType: this.detailForm.exchangeRateType }
          this.handleData(res, true)
        }
      })
    },
    submitApply() {
      console.log(this.detailForm)
      // if (this.detailForm.gedgingCurrency === '') { // 不控制对冲币种， || this.detailForm.remark === ''
      //   this.$message({
      //     type: 'error',
      //     message: '对冲币种不能为空!',
      //     showClose: true
      //   })
      //   return
      // }
      if (this.fileRules.required && !this.file) {
        return this.$msgErrClose(this.$t('Hedge.attachmentTips'))
      }
      if (this.detailForm.gedgingType === 'client_gedging' && !this.file) {
        return this.$msgErrClose(this.$t('Hedge.customerHedging'))
      }
      if (this.detailForm.gedgingType === 'client_gedging' && !this.detailForm.gedgingSubType) {
        return this.$msgErrClose(this.$t('Hedge.subtypeTips'))
      }
      if (
        (this.needRateType || !this.gedgingCurrencyDisabled) &&
        this.detailForm.gedgingCurrency !== 'original' &&
        !this.detailForm.exchangeRateType
      ) {
        return this.$msgErrClose(this.$t('Hedge.rateTips'))
      }
      if (this.detailForm.exchangeRates.length === 0) {
        return this.$msgErrClose(this.$t('Hedge.hedgRateTips'))
      }
      // 汇率上下限判断逻辑调整，较复杂，交给后端处理
      let isExchangeRatesValidate = true
      this.detailForm.exchangeRates.forEach((item, index) => {
        if (item.lowerRate) {
          if (item.settlementRate < item.lowerRate) {
            isExchangeRatesValidate = false
            return this.$msgErrClose(`${item.settlementRateTitle} ${this.$t('Hedge.lowerTips')}${item.lowerRate}!`)
          }
        }
        if (item.upperRate) {
          if (item.settlementRate > item.upperRate) {
            isExchangeRatesValidate = false
            return this.$msgErrClose(`${item.settlementRateTitle} ${this.$t('Hedge.higherTips')}${item.upperRate}!`)
          }
        }
        // this.settleExchangeRateList[index].rate = Number(item.settlementRate) // 联动用于计算的汇率列表
      })
      if (!isExchangeRatesValidate) {
        return
      }
      const form = new FormData()
      form.append('file', this.file)
      let data = {
        gedgingCurrency: this.detailForm.gedgingCurrency,
        exchangeRateType: this.detailForm.exchangeRateType,
        remark: this.detailForm.remark,
        exchangeRateList: this.detailForm.gedgingCurrency === '' ? [] : this.settleExchangeRateList,
        gedgingSettleFeeList: this.option11.data.concat(this.option12.data),
      }
      if (this.detailForm.gedgingSubType) {
        data.gedgingSubType = this.detailForm.gedgingSubType
      }
      form.append('data', JSON.stringify(data))
      // console.log(dateFormat('yyyy/mm/dd HH:MM:SS', new Date()))
      form.append('reqTime', dateFormat('yyyy/mm/dd HH:MM:SS', new Date()))
      console.log(this.gedgingSubTypeBackup, ',', this.detailForm.gedgingSubType)
      if (this.gedgingSubTypeBackup && this.gedgingSubTypeBackup !== this.detailForm.gedgingSubType) {
        this.$confirmWarn(this.$t('Hedge.differentTips'), () => this.applyAction(form))
      } else {
        this.applyAction(form)
      }
    },
    applyAction(form) {
      this.lsLoading = true
      this.$store
        .dispatch('user/import', { uri: '/fin/gedging/apply', params: form })
        .then((res) => {
          this.isApply = false
          this.$msgSucClose(this.$t('Common.submitSuc'))
          this.delVisitedView(this.$route)
          this.notifySettlementDetailApplyStatus(true)
          // this.isJumpRouteFromPage = true
          this.refreshView('GedgingList', 'from')
          this.cancel()
        })
        .finally(() => (this.lsLoading = false))
    },
    sortChange2(column, prop, order) {
      this.sortChange(column, prop, order, 2)
    },
    sortChange3(column, prop, order) {
      this.sortChange(column, prop, order, 3)
    },
    sortChange(column, prop, order, type) {
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
        if (type === 2) {
          this.option12.data = this.option12.data.sort((a, b) => {
            return isNum ? b[prop] - a[prop] : b[prop] > a[prop] ? 1 : -1
          })
          return
        }
        if (type === 3) {
          this.option13.data = this.option13.data.sort((a, b) => {
            return isNum ? b[prop] - a[prop] : b[prop] > a[prop] ? 1 : -1
          })
          return
        }
        this.option11.data = this.option11.data.sort((a, b) => {
          return isNum ? b[prop] - a[prop] : b[prop] > a[prop] ? 1 : -1
        })
      } else if (order === 'ascending') {
        if (type === 2) {
          this.option12.data = this.option12.data.sort((a, b) => {
            return isNum ? a[prop] - b[prop] : a[prop] > b[prop] ? 1 : -1
          })
          return
        }
        if (type === 3) {
          this.option13.data = this.option13.data.sort((a, b) => {
            return isNum ? a[prop] - b[prop] : a[prop] > b[prop] ? 1 : -1
          })
          return
        }
        this.option11.data = this.option11.data.sort((a, b) => {
          return isNum ? a[prop] - b[prop] : a[prop] > b[prop] ? 1 : -1
        })
      }
    },
    showDetail(row) {
      let sourceType = row.sourceType
      let sourceBizNo = row.sourceBizNo
      this.showOneNoDetail(sourceType, sourceBizNo, { feeId: row.feeId })
    },
    notifySettlementDetailApplyStatus(bool) {
      let find = this.jumpRouteFromToList.find((item) => {
        return item.from.name === 'SettlementDetail' && item.to.name === this.$route.name
      })
      if (find) {
        find.from.query.applySuccess = bool
      }
    },
    audit(auditType) {
      let data = {
        gedgingApplyId: this.gedgingApplyId,
        auditType: auditType,
        refuseReason: this.form.refuseReason,
        writeoffRemark: this.detailForm.writeoffRemark,
      }
      if (auditType === 'pass') {
        this.$confirmWarn(this.$t('Hedge.underwritingTips'), () => this.auditMethod(data, true))
      } else {
        this.auditMethod(data)
      }
    },
    auditMethod(data, isPass) {
      this.lsLoading = this.btnLoading1 = true
      audit(data)
        .then((res) => {
          this.$msgSucClose(this.$t('Common.submitSuc'))
          if(isPass){
            this.refreshView('GedgingList', 'from')
            this.getData()
            if (res.data) {
              this.queryLateFeeByWriteoffNo(res.data)
            }
            return
          }
          this.rejectDialogVisible = false
          this.cancel(true)
        })
        .finally(() => (this.lsLoading = this.btnLoading1 = false))
    },
    queryLateFeeByWriteoffNo(writeoffReceipayNo) {
      let data = {
        writeoffReceipayNo // : 'SZCZAP2211000524'
      }
      listByWriteoffNo(data).then(res => {
        this.option14.data = res.data || [] // [{custOverduePaymentNo:'ZNJ202211090089'}]
        if (this.option14.data.length) {
          this.lateFeeVisible = true
        }
      })
    },
    handleLateFee() {
      this.routerPush('FiscalTermList', {
        tabFromOther: 'lateFeeList',
        custOverduePaymentNo: this.option14.data.map(item => item.custOverduePaymentNo).join(',')
      })
    },
    showAttachment(row) {
      let href = `/base/fileView/preview/${row.confirmFileNo}/sowoll`
      window.open(href)
    },
    sendResFileList(list){
      this.file = list[0] || ''
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
      setTimeout(() => {
        this.showUploadBtn = true
      }, 1000)
      this.file = null
      this.detailForm.fileId = ''
      this.detailForm.fileNo = ''
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`${this.$t('Hedge.sureTips')} ${file.name}?`)
    },
    handleExceed(files, fileList) {
      this.$message.warning(this.$t('Hedge.onlyTips'))
    },
    fileChange(file, fileList) {
      console.log('file.raw:', file.raw)
      console.log('fileList:', fileList)
      this.file = file.raw
      this.showUploadBtn = false
    },
    // fileChange2(e) {
    //   console.log('e:', e)
    //   console.log('file:', e.target.files[0])
    // },
    uploadHttpRequest(param, api) {
      let formData = new FormData()
      formData.append('file', param.file)
      api(formData).then((res) => {
        param.onSuccess(res)
      })
    },
    uploadSuccess(response, file, fileList) {
      console.log(response)
      let fileId = response.data && response.data.fileId
      fileId = fileId ? fileId : 'test'
      this.detailForm.fileId = fileId
      this.detailForm.fileNo = fileId
      this.showUploadBtn = false
    },
    cancel(refresh) {
      this.routerBack(refresh)
    },
    sendMulti(data, option) {
      // console.log(data, option)
      if (option === this.option11) this.multipleSelection1 = data
    },
    // 修改核销日期
    writeoffSave() {
      if (this.isWriteoffSave) {
        this.isWriteoffSave = false
      } else {
        this.lsLoading = true
        updateWriteoffDate({ writeoffNopayId: this.writeoffNopayId, writeoffDate: this.writeoffDate })
          .then((res) => {
            this.$msgSucClose(this.$t('Hedge.modifyTips'))
            this.isWriteoffSave = true
          })
          .finally(() => (this.lsLoading = false))
      }
    },
    // 撤回申请
    gedgingCancel() {
      this.btnLoading2 = true
      gedgingCancel({ gedgingApplyId: this.gedgingApplyId })
        .then((res) => {
          this.$msgSucClose(this.$t('Hedge.withdrawalTips'))
          this.routerDelBack(true)
        })
        .finally(() => (this.btnLoading2 = false))
    },
    saveRemark() {
      let { writeoffRemark } = this.detailForm
      updateRemark({ gedgingApplyId: this.gedgingApplyId, writeoffRemark }).then((res) => {
        this.$msgSucClose(this.$t('FinBill.saveSuc'))
      })
    },
    search(list) {
      console.log(list.map((item) => item.invisible))
      this.option11.data = [...list]
      this.computeFeeGather(this.option11.data.filter((item) => !item.invisible))
    },
    search2(list) {
      console.log(list.map((item) => item.invisible))
      this.option12.data = [...list]
      this.computeFeeGather2(this.option12.data.filter((item) => !item.invisible))
    },
    search3(list) {
      console.log(list.map((item) => item.invisible))
      this.option13.data = [...list]
      this.computeFeeGather3(this.option13.data.filter((item) => !item.invisible))
    },
    commonPcjFile(list) {
      if (list && list.length) {
        let pcjFiles = list.filter((item) => item.feeCode === 'PCJ')
        if (pcjFiles.length) {
          this.hasPcj = true
          orderNoFiles({ orderNoList: pcjFiles.map((v) => v.sourceBizNo) }).then((res) => {
            let resData = res.data || {}
            let arr = []
            for (const key in resData) {
              if (Object.hasOwnProperty.call(resData, key)) {
                arr.push(...resData[key])
              }
            }
            this.pcjFileColumnTipRow = { pcjFiles: arr, pcjFile_multiValue: arr.map((v) => v.name) }
          })
          return
        }
      }
      this.hasPcj = false
    },
    async rateTypeChange(val) {
      actualExchangeRate({ rateType: val }).then((res) => {
        this.exchangeRateList = res.data || []
        this.currencyChange(this.detailForm.gedgingCurrency)
      })
    },
    computedOriginalFee(list, type) {
      // console.log(list);
      let arr = list.filter((item) => item.receipayType === type && !item.invisible)
      let currencys = [...new Set(arr.map((item) => item.currency))]
      return currencys.map((currency) => {
        let obj = { currency, amt: 0, isPay: type === 'pay' }
        arr.forEach((subItem) => {
          if (subItem.currency === currency) {
            obj.amt = new LSnum(obj.amt).plus(subItem.feeAmt).toNum(2)
          }
        })
        return obj
      })
    },
    // 删除凭证  每行只有单个凭证
    delVoucher() {
      let voucherNos = []
      let voucherSeqNos = []
      this.voucherNos.split(',').forEach((val) => {
        let arr = val.split('/')
        voucherNos.push(arr[1])
        voucherSeqNos.push(arr[0])
      })
      voucherNos = [...new Set(voucherNos)].filter((v) => v !== 'null')
      voucherSeqNos = [...new Set(voucherSeqNos)]
      // return console.log(voucherSeqNos);
      this.$confirmWarn(this.$t('Hedge.detailsTips',{voucherNos: voucherNos.join(',')}), () => {
        voucherDelete({ voucherSeqNos }).then((res) => {
          this.$msgSucClose(this.$t('Settle.deleteSuc'))
          this.getData()
        })
      })
    },
    delVoucher2(){
      let voucherNos = []
      let voucherSeqNos = []
      this.exVoucherNos.split(',').forEach((val) => {
        let arr = val.split('/')
        voucherNos.push(arr[1])
        voucherSeqNos.push(arr[0])
      })
      voucherNos = [...new Set(voucherNos)].filter((v) => v !== 'null')
      voucherSeqNos = [...new Set(voucherSeqNos)]
      // return console.log(voucherSeqNos);
      this.$confirmWarn(this.$t('Hedge.detailsTips',{voucherNos: voucherNos.join(',')}), () => {
        exVoucherDelete({ voucherSeqNos }).then((res) => {
          this.$msgSucClose(this.$t('Settle.deleteSuc'))
          this.getData()
        })
      })
    },
    generateFn2(preview, isExt){
      this.isExt = isExt === true
      this.generateFn(preview)
    },
    // 生成凭证
    generateFn(status) {
      if (status === 'preview') {
        this.previewGenerate()
      } else {
        this.createGenerate()
      }
    },
    createGenerate2(preview){
      this.isExt = isExt === true
      this.batchPrintCreate(preview)
    },
    // 生成凭证
    createGenerate(refresh) {
      if (refresh === 'refresh') {
        this.getData()
        return
      }
      const acctVoucherSeqno = this.isExt ? this.exVoucherNos.split('/')[1] : this.voucherNos.split('/')[1]
      if (acctVoucherSeqno) {
        return this.$msgErrClose(this.$t('Hedge.voucherTips'))
      }
      const data = {
        writeoffNopayNos: [this.detailForm.writeoffNopayNo],
        bizType: 'gedging_writeoff',
      }
      let method = this.isExt ? exNopayWriteOffGenerate : nopayWriteOffGenerate
      method(data).then((res) => {
        this.$msgSucClose(this.$t('Hedge.processedTips'))
        // 获取凭证号
        window.setTimeout(() => {
          this.getData()
        }, 1000)
      })
    },
    // 预览凭证
    previewGenerate() {
      const data = {
        writeoffNopayNos: [this.detailForm.writeoffNopayNo],
        bizType: 'gedging_writeoff',
        preview: 'yes',
      }
      let method = this.isExt ? exNopayWriteOffGenerate : nopayWriteOffGenerate
      method(data)
        .then((res) => {
          if (res.code === 0) {
            this.previewDialog.seqNo = ''
            this.previewDialog.showData = res.data
            this.previewDialog.show = true
          }
        })
        .catch(() => {})
    },
    previewAll() {
      voucherListGedging({ gedgingApplyId: this.gedgingApplyId }).then((res) => {
        if (res.data && res.data.length) {
          this.voucherNosTableOption.list = res.data || []
          this.voucherNosTableOption.show = true
        } else {
          this.$msgErrClose(this.$t('Hedge.unrelatedTips'))
        }
      })
    },
  },
  computed: {
    ...mapGetters(['dictMap']),
    needRateType() {
      let arr1 = this.option11.data || []
      let arr2 = this.option12.data || []
      let arr = [...arr1, ...arr2]
      let flag = false
      let settleOrderNos = [...new Set(arr.map((v) => v.settleOrderNo))]
      if (settleOrderNos.length > 1) {
        flag = true
      }
      let currency = this.detailForm.gedgingCurrency
      return flag && currency !== 'original' && !!arr.find((v) => v.currency !== currency)
    },
    rateTypeRules() {
      return { required: !(!this.needRateType && this.gedgingCurrencyDisabled), message: ' ', trigger: 'change' }
    },
    payGatherOriginal() {
      return this.computedOriginalFee(this.option11.data, 'pay')
    },
    receiveGatherOriginal() {
      return this.computedOriginalFee(this.option11.data, 'receive')
    },
    payGatherOriginal2() {
      return this.computedOriginalFee(this.option12.data, 'pay')
    },
    receiveGatherOriginal2() {
      return this.computedOriginalFee(this.option12.data, 'receive')
    },
    payGatherOriginal3() {
      return this.computedOriginalFee(this.option13.data, 'pay')
    },
    receiveGatherOriginal3() {
      return this.computedOriginalFee(this.option13.data, 'receive')
    },
    detailAmtSummaryOption() {
      return {
        labelWidth: '160',
        sumList: [
          { label: this.$t('Hedge.receiveGatherOriginal'), list: this.receiveGatherOriginal || [], color: 'red' },
          { label: this.$t('Hedge.payGatherOriginal'), list: this.payGatherOriginal || [], color: 'green' },
          { label: this.$t('Hedge.receiveGather'), list: this.receiveGather || [], color: 'red' },
          { label: this.$t('Hedge.payGather'), list: this.payGather || [], color: 'green' },
        ],
      }
    },
    detailAmtSummaryOption2() {
      return {
        labelWidth: '100',
        sumList: [
          { label: this.$t('Hedge.receiveGatherOriginal'), list: this.receiveGatherOriginal2 || [], color: 'red' },
          { label: this.$t('Hedge.payGatherOriginal'), list: this.payGatherOriginal2 || [], color: 'green' },
          { label: this.$t('Hedge.receiveGather'), list: this.receiveGather2 || [], color: 'red' },
          { label: this.$t('Hedge.payGather'), list: this.payGather2 || [], color: 'green' },
        ],
      }
    },
    detailAmtSummaryOption3() {
      return {
        labelWidth: '100',
        sumList: [
          { label: this.$t('Hedge.receiveGatherOriginal'), list: this.receiveGatherOriginal3 || [], color: 'red' },
          { label: this.$t('Hedge.payGatherOriginal'), list: this.payGatherOriginal3 || [], color: 'green' },
          { label: this.$t('Hedge.receiveGather'), list: this.receiveGather3 || [], color: 'red' },
          { label: this.$t('Hedge.payGather'), list: this.payGather3 || [], color: 'green' },
        ],
      }
    },
  },
  watch: {
    'option11.data': {
      handler(newVal, oldVal) {
        console.log(newVal)
        // 自动分配金额的动作不做操作
        if (this.isDataChangeFromBackEnd && !this.isDetailPage) {
          return
        }
        if (newVal && newVal.length === 0) {
          return
        }
        if (this.needRateType && !this.detailForm.exchangeRateType) {
          return
        }
        clearTimeout(this.timer1)
        this.timer1 = setTimeout(() => {
          this.option11.data.forEach((item) => {
            if (this.isDetailPage) return // 对冲详情页面无需判断该金额
            if (Math.abs(item.gedgingAmt) > Math.abs(item.canGedgingAmt)) {
              
              item.gedgingAmt = item.canGedgingAmt
              this.$msgErrClose(this.$t('Hedge.greaterTips'))
            }
          })
          // 此处使用有效数据，因开始和中途都将调用此处
          this.computeFeeGather(this.option11.data.filter((item) => !item.invisible))
          this.computeExGedgingAmt()
        }, 500)
      },
      deep: true,
    },
    'option12.data': {
      handler(newVal, oldVal) {
        console.log(newVal)
        if (this.isDataChangeFromBackEnd) {
          return
        }
        if (newVal && newVal.length === 0) {
          return
        }
        clearTimeout(this.timer2)
        this.timer2 = setTimeout(() => {
          this.option12.data.forEach((item) => {
            if (this.isDetailPage) return // 对冲详情页面无需判断该金额
            if (Math.abs(item.gedgingAmt) > Math.abs(item.canGedgingAmt)) {
              item.gedgingAmt = item.canGedgingAmt
              this.$msgErrClose(this.$t('Hedge.greaterTips'))
            }
          })
          // this.feeGatherChange()
          this.computeFeeGather2()
          this.computeExGedgingAmt()
        }, 500)
      },
      deep: true,
    },
    'option13.data': {
      handler(newVal, oldVal) {
        console.log(newVal)
        if (this.isDataChangeFromBackEnd) {
          return
        }
        if (newVal && newVal.length === 0) {
          return
        }
        clearTimeout(this.timer3)
        this.timer3 = setTimeout(() => {
          this.option13.data.forEach((item) => {
            if (this.isDetailPage) return // 对冲详情页面无需判断该金额
            if (Math.abs(item.gedgingAmt) > Math.abs(item.canGedgingAmt)) {
              item.gedgingAmt = item.canGedgingAmt
              this.$msgErrClose(this.$t('Hedge.greaterTips'))
            }
          })
          // this.feeGatherChange()
          this.computeFeeGather3()
          this.computeExGedgingAmt()
        }, 500)
      },
      deep: true,
    },
    'detailForm.exchangeRates': {
      // 当用户输入自定义对冲汇率时，联动各个费用合计---改为无需联动费用合计
      handler(newVal, oldVal) {
        // if (++ this.watchFormExchangeRatesTime === 1) return
        clearTimeout(this.timer2)
        this.timer2 = setTimeout(() => {
          if (this.settleExchangeRateList.length > 0) {
            // 装车拼箱费汇率
            // srcCurrency toCurrency cashBuyRate
            this.exchangeRatesCash = []
            // 如果费用列表含有拼车装箱费，使用cashBuyRate代替rate
            let feeList = [...this.option11.data, ...this.option12.data]
            let filterArr1 = [...new Set(feeList.filter((v) => v.feeCode !== 'ZCPXF').map((v) => v.currency))]
            let filterArr2 = [...new Set(feeList.filter((v) => v.feeCode === 'ZCPXF').map((v) => v.currency))]
            newVal.forEach((item) => {
              let currencys = item.settlementRateTitle.split('-')
              // 对冲汇率隐藏逻辑
              if (filterArr1.includes(currencys[0]) && item.invisible) {
                item.invisible = false
              } else if (!filterArr1.includes(currencys[0]) && !item.invisible && item.cashBuyRate) {
                item.invisible = true
              }
              // 拼车装箱费汇率逻辑
              if (
                filterArr2.includes(currencys[0]) &&
                currencys[1] === this.detailForm.gedgingCurrency &&
                item.cashBuyRate &&
                item.cashBuyRate !== '0' &&
                !this.exchangeRatesCash.find((v) => v.settlementRateTitle === item.settlementRateTitle)
              ) {
                this.exchangeRatesCash.push({
                  systemRate: item.cashBuyRate,
                  settlementRateTitle: item.settlementRateTitle,
                  settlementRate: item.cashBuyRate,
                })
              }
            })
            // 结算汇率运算
            newVal.forEach((item, index) => {
              if (item.invisible) {
                let currency = item.settlementRateTitle.split('-')
                let find = this.exchangeRateList.find((v) => v.srcCurrency === currency[0] && v.toCurrency === currency[1])
                if (find) {
                  return (this.settleExchangeRateList[index].rate = find.rate)
                }
              }
              if (item.lowerRate && item.settlementRate < item.lowerRate) {
                return this.$msgErrClose(`${this.$t('Hedge.lowerTips')}${item.lowerRate}!`)
              }
              if (item.upperRate && item.settlementRate > item.upperRate) {
                return this.$msgErrClose(`${this.$t('Hedge.higherTips')}${item.upperRate}!`)
              }

              this.settleExchangeRateList[index].rate = Number(item.settlementRate) // 联动用于计算的汇率列表
            })
            console.log('this.settleExchangeRateList:', this.settleExchangeRateList)
            // this.feeGatherChange()
            if (this.isDataChangeFromBackEnd) {
              return
            }
            this.computeExGedgingAmt('ratechange')
          }
        }, 1000)
      },
      deep: true,
    },
    rejectDialogVisible(newVal, oldVal) {
      if (newVal) {
        this.form.refuseReason = ''
      }
    },
  },
}
</script>
<style scoped lang="scss">
/deep/ .settlement-detail-form .el-form-item__content {
  width: 140px;
  .el-date-editor.el-input, .el-date-editor.el-input__inner{
    width: 126px;
  }
}
/deep/ .detail__div,.el-form-item {
  width: 25% !important;
  margin-right: 0;
  .detail__label{
    width: 160px !important;
  }
}

// .settlement-detail-form .el-form-item {
//   margin-right: 16px;
// }
.full-form-item {
  width: 100%;
  margin-right: 0;
  padding-right: 8px;
}
.full-form-item ::v-deep .el-form-item__content {
  width: calc(100% - 160px) !important;
  height: auto;
  display: inline-flex;
  .el-input {
    flex: 1 1 auto;
  }
  .el-button {
    margin-left: 10px;
  }
}
.finance-detail-page {
  background: #fff;
}
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
}
/* .el-form-item{
  width: 258px;
  margin-bottom: 7px;
  margin-right: 20px;
} */
.self-tooltip.el-form-item-text {
  display: inline-block;
  max-width: 180px;
  height: 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.el-form-item-text {
  font-size: 12px;
  /* width: 180px; */
}
/* .settlement-detail-form{
  padding: 20px 16px 8px; 
} */
.settlement-exchange-rates {
  width: 100%;
  display: block;
}
.settlement-exchange-rates .settlement-exchange-rates-title {
  display: inline-block;
  color: #606266;
  line-height: 20px;
  width: 160px !important;
  text-align: right;
  padding-right: 4px;
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

.devide_line {
  margin: 0 8px 8px;
  border-bottom: 1px solid #e9e9e9;
}
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 156px;
}
.money-total span {
  color: #222;
}
.finance-table-container {
  margin: 4px 8px 18px;
}
.el-form-item--mini.el-form-item {
  margin-bottom: 6px;
}
.money-total > div .money-total-span-left-space.pay-toal {
  margin-left: 20px;
}
.upload_form_item ::v-deep{
  width: 100% !important;
  .el-form-item__content{
    width: auto;
    height: auto;
    .fin-upload-file-cont{
      width: auto !important;
    }
  }
}
</style>