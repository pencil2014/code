<template>
  <div
    :element-loading-background="eLoadingBackground"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-text="eLoadingText"
    class="finance-page"
    v-loading="loading"
  >
    <div class="finance-list-container" @click="saveDzg">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">{{$t('Collect.receiptWriteoff')}}</div>
        </div>
        <div class="money-box-right">
          <!-- <el-button type="primary" size="mini" @click="regUpdate()">regUpdate</el-button> -->
          <!-- 按钮过多，使用列表渲染 noConfirm未确认的收款登记显示  both确认或未确认都会显示 其它确认的时候显示 -->
          <template v-for="item in btnArr">
            <el-button
              :key="item.text"
              v-if="checkAuth($route.name, item.auth) && hasBalance && (item.both ? true : item.noConfirm ? !isConfirm : isConfirm)"
              @click="($event) => item.params ? item.action(item.params, item) : item.action($event, item)"
              size="mini"
              :type="item.type"
              :loading="item.loading"
            >{{item.text}}</el-button>
          </template>
          <el-button @click="cancel" size="mini">{{$t('Common.back')}}</el-button>
        </div>
      </div>
      <el-form
        :model="regWriteoffInfo"
        inline
        size="mini"
        class="ls__form"
        ref="regWriteoffInfoForm"
        :rules="rules"
        :validateOnRuleChange="false"
        label-suffix=":"
      >
        <!-- 基本信息区 预收款信息， 收款信息， 付款信息 -->
        <RegDetailInfo
          v-if="isInit"
          :infoData="regWriteoffInfo"
          :isEdit="hasBalance && (routerBackReset || isConfirm)"
          @jumpToRoute="jumpToRoute"
        >
          <template slot="baseInfoSlot" v-if="hasBalance && (routerBackReset || isConfirm)">
            <el-form-item :label="$t('Collect.receiptCurrency')" prop="currency">
              <el-select v-model="regWriteoffInfo.currency" @change="regWriteoffInfoCurrencyChange">
                <el-option
                  :key="item.value + '_' + index"
                  :label="item.label"
                  :value="item.value"
                  v-for="(item, index) in dictMap['validCurrency'].filter(v=>v.value !== 'ORIGINAL')"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('Collect.amtReceived')" prop="realAmt">
              <el-input
                type="text"
                v-lsNumber="{value:'number', obj:regWriteoffInfo, key:'realAmt', dot:2, vm:vm, formStr: 'regWriteoffInfo'}"
                v-model="regWriteoffInfo.realAmt"
                @blur="checkRealAmt"
              ></el-input>
            </el-form-item>
          </template>
          <template slot="receiveInfoSlot" v-if="hasBalance && (routerBackReset || isConfirm)">
            <el-form-item :label="$t('FeeList.receivePayDates')" prop="recvDate">
              <el-date-picker
                :placeholder="$t('Common.plSelect')"
                type="date"
                v-model="regWriteoffInfo.recvDate"
                value-format="yyyy-MM-dd"
              ></el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('Collect.recvWay')" prop="recvWay">
              <el-select v-model="regWriteoffInfo.recvWay" clearable :placeholder="$t('Common.plSelect')">
                <el-option
                  v-for="item in dictMap['recvWay']"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('PreClose.bankabbr')" prop="compBankAccountId">
              <el-select
                v-model="regWriteoffInfo.compBankAccountId"
                filterable
                remote
                :remote-method=" (queryString) => bankAccountList(queryString) "
                @visible-change=" (value) => value && bankAccountList() "
              >
                <el-option
                  v-for="(item, index) in bankAccountSelectOptions"
                  :key="item.value + '_' + index"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <!-- <el-form-item :label="$t('Settle.recvAccountNo')"></el-form-item> -->
            <el-form-item :label="$t('Settle.settleMode')" prop="settleMode">
              <el-select v-model="regWriteoffInfo.settleMode" clearable :placeholder="$t('Common.plSelect')">
                <el-option
                  v-for="item in bankAccountSettleModeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <!-- <el-form-item v-if="hasFixedTransferFee" label="定价手续费" prop="fixedTransferFee">
              <el-input v-model="regWriteoffInfo.fixedTransferFee" disabled placeholder="定价手续费"></el-input>
            </el-form-item>-->
          </template>
          <template slot="bankSeqNoSlot" v-if="hasBalance && (routerBackReset || isConfirm)">
            <el-form-item :label="$t('FinBill.bankSerial')" prop="bankSeqNo">
              <el-input type="text" v-model="regWriteoffInfo.bankSeqNo"></el-input>
            </el-form-item>
          </template>
          <template slot="payInfoSlot" v-if="hasBalance && (routerBackReset || isConfirm)">
            <el-form-item :label="$t('Collect.accountName')" prop="payAccountName">
              <el-autocomplete
                size="mini"
                style="width: 100%"
                v-model="regWriteoffInfo.payAccountName"
                :maxlength="32"
                :placeholder="$t('Common.plEnter')"
                :select-when-unmatched="true"
                :fetch-suggestions=" (queryString, cb) => autocomplete1.querySearch(queryString, cb) "
                @select=" (value) => autocomplete1.select(value) "
                @change=" (value) => autocomplete1.change && autocomplete1.change(value) "
              ></el-autocomplete>
            </el-form-item>
            <el-form-item :label="$t('Collect.paymentBank')" prop="payBankName">
              <el-autocomplete
                size="mini"
                style="width: 100%"
                v-model="regWriteoffInfo.payBankName"
                :maxlength="32"
                :placeholder="$t('Common.plEnter')"
                :select-when-unmatched="true"
                :fetch-suggestions=" (queryString, cb) => autocomplete2.querySearch(queryString, cb) "
                @select=" (value) => autocomplete2.select(value) "
                @change=" (value) => autocomplete2.change(value) "
              ></el-autocomplete>
            </el-form-item>
            <el-form-item :label="$t('Collect.accountNumber')" prop="payAccountNo">
              <el-input
                :disabled="!!selectedOptionItem1"
                type="text"
                v-model="regWriteoffInfo.payAccountNo"
                :placeholder="$t('Common.plEnter')"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('Collect.accountType')" prop="payAccountPublicType">
              <el-select
                v-model="regWriteoffInfo.payAccountPublicType"
                :disabled="!!publicTypeDisabled"
              >
                <el-option
                  v-for="item in dictMap['accountType']"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('Collect.payAccountCountry')" prop="payAccountCountryCode">
              <el-select
                v-model="regWriteoffInfo.payAccountCountryCode"
                clearable
                :placeholder="$t('Common.plSelect')"
                filterable
                :remote-method=" (queryString) => getCountryList(queryString) "
                @visible-change=" (value) => value && getCountryList() "
                @change="selectCountry"
                @clear="regWriteoffInfo.payAccountCountryCode=regWriteoffInfo.payAccountCountryName=''"
              >
                <el-option
                  v-for="item in COUNTRYLIST"
                  :key="item.value"
                  :label="$lang === 'zh' ? item.cname : item.ename"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="SWIFT CODE" prop="payAccountSwiftCode">
              <el-input type="text" v-model="regWriteoffInfo.payAccountSwiftCode" :placeholder="$t('Common.plEnter')"></el-input>
            </el-form-item>
            <el-form-item :label="$t('Settle.recvRegAddr')" prop="payAccountBankCompAddr">
              <el-input
                type="textarea"
                v-model="regWriteoffInfo.payAccountBankCompAddr"
                :maxlength="200"
                show-word-limit
                :placeholder="$t('Common.plEnter')"
              ></el-input>
            </el-form-item>
          </template>
        </RegDetailInfo>
      </el-form>
      <h3 class="title">{{$t('Charge.writeoffInfo')}}</h3>
      <div class="writeoff-form" v-if="hasBalance && isConfirm">
        <DetailDiv
          :label="$t('Collect.avaiWfAmt')"
          :content="`${regWriteoffInfo.currency||''}<b>${regWriteoffInfo.writeoffBalance===0?regWriteoffInfo.writeoffBalance:(regWriteoffInfo.writeoffBalance||'')}</b>`"
        />
        <DetailDiv :label="$t('PreClose.wrfcurrency')" :isSlot="true">
          <el-select size="mini" v-model="exchangeCurrency" @change="changeExchangeCurrency">
            <el-option
              :key="item.value + '_' + index"
              :label="item.label"
              :value="item.value"
              v-for="(item, index) in dictMap['validCurrency'].filter(v=>v.value !== 'ORIGINAL')"
            ></el-option>
          </el-select>
        </DetailDiv>
        <DetailDiv
          v-show="regWriteoffInfo.writeoffCurrency !== exchangeCurrency"
          :label="$t('PreClose.writableAmt')"
          :isSlot="true"
          diyClass="special__div"
        >
          <div>
            <el-input size="mini" type="text" v-model="exchangeAmt" @blur="checkExchangeAmt"></el-input>
            <span style="color:#ccc">{{$t('Hedge.currencyRate')}}: {{rateInterval}}</span>
          </div>
        </DetailDiv>
        <DetailDiv
          :label="$t('Collect.customerShortAmt')"
          :content="`${regWriteoffInfo.writeoffCurrency||''} ${regWriteoffInfo.lessPayAmt===0?regWriteoffInfo.lessPayAmt:(regWriteoffInfo.lessPayAmt||'')}`"
        />
        <DetailDiv
          :label="$t('Collect.remainAmt')"
          :content="`${regWriteoffInfo.writeoffCurrency||''} ${regWriteoffInfo.unusedAmt===0?regWriteoffInfo.unusedAmt:(regWriteoffInfo.unusedAmt||'')}`"
        />
        <DetailDiv v-show="regWriteoffInfo.unusedAmt > 0" :label="$t('PreClose.residual')" :isSlot="true">
          <el-select size="mini" v-model="regWriteoffInfo.balanceDealType">
            <el-option
              :disabled="item.value === 'prepay_refund'"
              :key="item.value + '_' + index"
              :label="item.label"
              :value="item.value"
              v-for="(item, index) in dictMap['balanceDealType']"
            ></el-option>
          </el-select>
        </DetailDiv>
        <!-- <DetailDiv :label="$t('PreClose.retroactiveinvo')" :isSlot="true">
          <el-select size="mini" v-model="regWriteoffInfo.noWriteoffHasInvoice">
            <el-option :label="$t('Common.yes')" value="yes"></el-option>
            <el-option :label="$t('Common.no')" value="no"></el-option>
          </el-select>
        </DetailDiv> -->
        <DetailDiv :label="$t('FeeList.writeOffDate')" :isSlot="true">
          <el-date-picker
            :placeholder="$t('Common.plSelect')"
            size="mini"
            type="date"
            v-model="regWriteoffInfo.writeoffDate"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </DetailDiv>
        <DetailDiv
          :isVisible="true"
          v-if="regWriteoffInfo.exchangeRates.length"
          :label="$t('Collect.writeoffrate')"
          :isSlot="true"
        >
          <div>
            {{ regWriteoffInfo.exchangeRates[0].settlementRateTitle }}
            <span>{{regWriteoffInfo.exchangeRates[0].lowerRate}}~{{regWriteoffInfo.exchangeRates[0].upperRate}}</span>
            <span @click="showExchangeRates" class="link">{{$t('Common.more')}}</span>
          </div>
        </DetailDiv>
        <DetailDiv :label="$t('Collect.wfRemarks')" :isSlot="true" :isFull="true">
          <el-input
            :maxlength="500"
            show-word-limit
            type="textarea"
            :autosize="true"
            v-model="regWriteoffInfo.writeoffRemark"
          ></el-input>
        </DetailDiv>
      </div>
      <!-- 详情 核销记录 -->
      <ToggleTable v-if="writeoffOption.data.length" :tableOption="writeoffOption">
        <el-button
          slot="right-button"
          @click="toggleHistory"
          size="mini"
          v-if="writeoffOption.data.find(item => item.recheckStatus === 'check_back')"
        >{{writeoffOption.dataInvisible?$t('PreClose.showHis'):$t('PreClose.hideHis')}}</el-button>
      </ToggleTable>
      <!-- 核销 转大掌柜余额 -->
      <!-- <div @click.stop v-show="option11.data.length && hasBalance">
        <ToggleTable :tableOption="dzgTableOption">
          <FinanceTable :option="option11" />
        </ToggleTable>
      </div> -->
      <!-- 核销 & 详情 转账手续费 -->
      <div @click.stop="listenClick">
        <ToggleTable :tableOption="feeTableOption" ref="feeTableOption">
          <template v-if="checkAuth($route.name, 'btn-addFee') && hasBalance">
            <!-- <template v-if="hasBalance"> -->
            <el-button slot="right-button" @click="addFee" size="mini">{{$t('Collect.addHandlingFee')}}</el-button>
          </template>
          <FinanceTable
            v-if="$refs.feeTableOption && $refs.feeTableOption.showData"
            :option="option4"
          />
        </ToggleTable>
      </div>
      <div v-if="option13.data&&option13.data.length" class="finance-table-container">
        <div class="money-box">
          <div class="money-box-left">
            <div class="money-title size-12">{{$t('Hedge.latePaymentFee')}}</div>
            <div
              class="money-total"
              style="color:red;font-weight:bold;margin-left:24px;"
            >{{$t('PreClose.incurredTips')}}</div>
          </div>
          <div class="money-box-right"></div>
        </div>
        <FinanceTable :option="option13" />
      </div>
      <!-- 结算单位信息 -->
      <RegSettleInfo
        ref="regSettleInfo"
        v-if="isInit"
        :infoData="regWriteoffInfo"
        @jumpToRoute="jumpToRoute"
        :isSlot="true"
        :diyHasRefSettle="!!option5.data.length"
      >
        <FinanceTable
          :option="option5"
          v-if=" $refs.regSettleInfo && $refs.regSettleInfo.showData &&option5.data.length"
        />
      </RegSettleInfo>
      <!-- 核销 发票信息 -->
      <!-- <ToggleTable v-if="option9.data.length && hasBalance" :tableOption="invoiceTableOption">
        <FinanceTable :option="option9" />
      </ToggleTable> -->
      <!-- 费用列表 -->
      <div class="table-box" v-if="hasBalance && isConfirm">
        <div class="title-box">
          <div class="title">
            {{$t('FeeList.expensesList')}}
            <template v-for="el in [{a:originalGather, t: $t('Common.writeoffs')}, {a:exchangeGather, t: $t('Collect.convertCurrency')}]">
              <div class="money-list" v-show="el.a.length" :key="el.t">
                {{el.t+'：'}}
                <span :key="index" v-for="(item, index) in el.a">
                  {{ item.currency }}
                  <b>{{ item.amt }}</b>
                </span>
              </div>
            </template>
          </div>
          <div class="btn" v-show="option1.data&&option1.data.length">
            <el-button @click="changeRate" size="mini">{{$t('Collect.underwritingrate')}}</el-button>
          </div>
        </div>
        <FinanceTable :option="option1" @send-multi="sendMulti" />
      </div>
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        @close="customColumnsPopClose"
      />
    </div>
    <!-- 关联发票 -->
    <el-dialog
      :title="$t('Collect.associatedInvoice')"
      v-if="relevanceOpne"
      :visible.sync="relevanceOpne"
      width="1200px"
      class="max_height_dialog"
    >
      <FinanceSearch :searchOption="searchOption1" @search="search" />
      <FinanceTable :option="option2" @send-multi="sendMulti" ref="multipleTable2" />
      <span class="dialog-footer" slot="footer">
        <!-- <el-button @click="importFeesAction" size="mini" type="primary">{{$t('Collect.importinvoice')}}</el-button> -->
        <el-button @click="closeRelevanceOpne" size="mini">{{$t('Common.close')}}</el-button>
      </span>
    </el-dialog>
    <!-- 关联结算单 -->
    <el-dialog
      v-if="relevanceOpne2"
      :title="$t('Collect.affiliatestm')"
      :visible.sync="relevanceOpne2"
      width="1200px"
      class="max_height_dialog"
    >
      <FinanceSearch :searchOption="searchOption2" @search="getSettleOrderList" />
      <FinanceTable :option="option3" @send-multi="sendMulti" ref="multipleTable3" />
      <span class="dialog-footer" slot="footer">
        <el-button @click="importFeesAction2" size="mini" type="primary">{{$t('Collect.importStaFees')}}</el-button>
        <el-button @click="closeRelevanceOpne2" size="mini">{{$t('Common.close')}}</el-button>
      </span>
    </el-dialog>
    <FinanceUpload
      :limit="1"
      :show-upload="showUploadFile"
      :upload-api="uploadFileApi"
      :upload-params="uploadParams"
      :upload-title="uploadFileTitle"
      @close-upload="closeUpload"
      @send-res-file-list="sendResFileList"
      @send-res-upload="sendResUpload"
    />
    <!-- 汇率弹出框 -->
    <el-dialog :title="dialogTitle" :visible.sync="rateDiaologOpen" width="600px">
      <FinanceTable :option="option6" />
      <div class="dialog-footer" slot="footer">
        <el-button @click="submitRate" size="mini" type="primary">{{$t('Common.submit')}}</el-button>
        <el-button @click="closeRateDialog" size="mini">{{$t('Common.cancel')}}</el-button>
      </div>
    </el-dialog>
    <!-- 关联费用列表 -->
    <el-dialog
      v-if="writeoffFeeDialog"
      :visible.sync="writeoffFeeDialog"
      :title="$t('Collect.associatedcosts')"
      width="1200px"
      class="max_height_dialog"
    >
      <FinanceSearch :searchOption="searchOption3" @search="settleOrderFeeList" />
      <FinanceTable :option="option7" @send-multi="sendMulti" ref="multipleTable7" />
      <div class="dialog-footer" slot="footer">
        <el-button @click="importFeesAction3" size="mini" type="primary">{{$t('Collect.importFees')}}</el-button>
        <el-button @click="closeWriteoffFee" size="mini">{{$t('Common.close')}}</el-button>
      </div>
    </el-dialog>
    <!-- 关联委托单位 -->
    <el-dialog :visible.sync="refSettleUnitDialog" :title="$t('Charge.entrustedUnit')" width="800px">
      <div class="settle-unit-box">
        <div class="default-settle">
          <span>{{$t('FeeList.settleCorp')}}</span>
          <el-input disabled v-model="regWriteoffInfo.settleCorpName" />
        </div>
        <div class="unit-box">
          <h4>{{$t('Collect.relationship')}}</h4>
          <el-tree
            :check-strictly="true"
            :data="refSettleUnitList"
            :default-checked-keys="defaultChecked"
            :expand-on-click-node="false"
            :props="{ label: 'name', children: 'childs', }"
            check-on-click-node
            default-expand-all
            node-key="custid"
            ref="tree"
            show-checkbox
          ></el-tree>
        </div>
        <div class="unit-box" style="border-top: 1px solid #dfe4ed;padding-top: 10px;">
          <h4>{{$t('Collect.tieredRel')}}</h4>
          <el-checkbox-group v-if="refSettleUnitList2.length" v-model="relationList">
            <el-checkbox
              style="display: block;"
              v-for="item in refSettleUnitList2"
              :label="item"
              :key="item.settleCorpCode"
            >{{item.settleCorpName}}</el-checkbox>
          </el-checkbox-group>
          <div v-else style="color:#909399;text-align:center;padding-top: 30px;">{{$t('Common.noData')}}</div>
        </div>
      </div>
      <div class="dialog-footer" slot="footer">
        <el-button @click="importFeesAction4" size="mini" type="primary">{{$t('Common.associations')}}</el-button>
        <el-button @click="closeRefSettleUnit" size="mini">{{$t('Common.cancel')}}</el-button>
      </div>
    </el-dialog>
    <!-- 核销汇率 -->
    <el-dialog :visible.sync="exchangeRatesDialog" class="self-dialog" :title="$t('Collect.writeoffrate')" width="600px">
      <FinanceTable :option="option10" v-if="exchangeRatesDialog" />
      <div class="dialog-footer" slot="footer">
        <el-button @click="exchangeRatesDialog = false" size="mini">{{$t('Common.close')}}</el-button>
      </div>
    </el-dialog>
    <!-- 余额转大掌柜 -->
    <!-- <TransferDzg :dialogOption="transferOption" @close="closeTransfer" @submit="submitTransfer" /> -->
    <!-- 分摊手续费 -->
    <TransferFee :transferFeeOption="transferFeeOption" @close="closeFee" />
    <!-- 指定结算单位 -->
    <el-dialog
      v-if="exchangeCorpDialogAssist"
      :visible.sync="exchangeCorpDialogAssist"
      :title="$t('Collect.settlementUnit')"
      width="500px"
      label-width="100px"
      class="settle_reg_dialog"
    >
      <el-form :model="corpFormAssist" ref="corpFormAssist" :rules="corpRulesAssist" size="mini">
        <div style="color:#CD4130;">{{$t('Collect.billTips')}}</div>
        <el-form-item :label="$t('FeeList.settleCorp')" prop="settleCorp" style="margin-top: 18px;">
          <el-select
            style="width: 378px;"
            v-model="corpFormAssist.settleCorp"
            value-key="value"
            :placeholder="$t('Common.plSelect')"
            remote
            :noRemote="true"
            :remote-method="(val) => settleCorpSelectRemoteAssist(val)"
            @visible-change="(val) => val && settleCorpSelectRemoteAssist('')"
          >
            <el-option
              v-for="(item,index) in settleCorpSelectListAssist"
              :key="item.value+item.label+index"
              :label="item.label"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="dialog-footer" slot="footer">
        <el-button @click="exchangeCorpAssist" size="mini" type="primary">{{$t('Common.sure')}}</el-button>
        <el-button @click="exchangeCorpDialogAssist = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </div>
    </el-dialog>
    <!-- 协助代收付分公司 -->
    <el-dialog
      v-if="exchangeCorpDialogAssist2"
      :visible.sync="exchangeCorpDialogAssist2"
      :title="$t('Collect.branchCollect')"
      width="500px"
      label-width="130px"
    >
      <el-form :model="corpFormAssist2" ref="corpFormAssist2" :rules="corpRulesAssist2" size="mini" label-suffix=":">
        <el-form-item :label="$t('Collect.settleCorp')" prop="settleCorp">
          <el-select
            style="width: 330px;"
            v-model="corpFormAssist2.settleCorp"
            value-key="value"
            :placeholder="$t('Common.plSelect')"
            filterable
            remote
            :noRemote="true"
            :remote-method="(val) => settleCorpSelectRemoteAssist2(val)"
            @visible-change="(val) => val && settleCorpSelectRemoteAssist2('')"
          >
            <el-option
              v-for="(item,index) in settleCorpSelectListAssist2"
              :key="item.value+item.label+index"
              :label="item.label"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="dialog-footer" slot="footer">
        <el-button @click="exchangeCorpAssist2" size="mini" type="primary">{{$t('Common.sure')}}</el-button>
        <el-button @click="exchangeCorpDialogAssist2 = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 银行账户根据当前用户来选，选后决定所属分公司与协助分公司
// 当前用户结算分公司与所属分公司不同，需要赋值给协助（收款账户为内部往来则不需要）

// 付款账号根据币种和结算单位获取数据
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import CustomColumns from '@/components/customColumns'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mapState, mapGetters } from 'vuex'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceUpload from '@/views/finance/components/financeUpload/financeUpload'
// import TransferDzg from '@/views/finance/receivable/components/transferDzg'
import TransferFee from '@/views/finance/receivable/components/transferFee'
import {
  listInvoiceReceivable,
  addTransferFee,
  deleteTransferFee,
  getWriteoffFeeList,
  getRefSettleUnitList,
  regInfo,
  regConfirm,
  regUpdate,
  getFixedTranferFeeList,
  updateSettleUnit,
  listSettleUnit,
  markAssistedComp,
} from '@/api/fin/receivableReg'
import {
  invoiceReceivableFeeList,
  settleOrderList,
  settleOrderFeeList,
  writeoff as writeoffSubmit,
  checkRecvWriteoffOverduePayment,
} from '@/api/fin/writeoffRecv'
import { actualExchangeRate, listColumnConfigGet, listColumnConfigSave, baseFeeItemList } from '@/api/base'
import { decimalFixed2, dateFormat } from '@/views/finance/utils/finance'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import ToggleTable from '@/views/finance/components/financeTable/simpleToggleTable'
import RegDetailInfo from '@/views/finance/receivable/components/regDetailInfo'
import RegSettleInfo from '@/views/finance/receivable/components/regSettleInfo'
import { bankAccountList } from '@/api/fin/settleUnit'
import { listReceivableRegAccount } from '@/api/fin/settleUnitBankAcct'
import { bankList } from '@/api/crm/common'
import { countrySelectList } from '@/api/base'
import { listBeforeWriteoff } from '@/api/fin/custOverduePayment'

const defaultCreateQuery = {
  balanceDealType: '',
  lessPayAmt: '',
  unusedAmt: '',
  noWriteoffHasInvoice: 'no',
  bankseqFileName: '',
  bankseqFilePath: '',
  // proxyFileName: '',
  // proxyFilePath: '',
  payBankseqFileName: '',
  payBankseqFileNo: '',
  exchangeRates: [],
  writeoffDate: '',
  payAccountBankCompAddr: '',
  remark: '',
  payAccountSwiftCode: '',
  payAccountCountryCode: '',
  payAccountNo: '',
  payAccountPublicType: '',
  payBankName: '',
  recvWay: '',
  settleMode: '',
  fixedTransferFee: '',
  assistedCompName: '',
  assistedCompCode: '',
}
const SETTLECROPLIST = []
function clearData(list, obj) {
  list.splice(0, 1000)
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      delete obj[key]
    }
  }
}
export default {
  name: 'writeoffReceipay',
  mixins: [mixin, routerMixin],
  data() {
    return {
      corpFormAssist: { settleCorp: '' },
      corpRulesAssist: { settleCorp: [{ required: true, message: ' ', trigger: 'change' }] },
      exchangeCorpDialogAssist: false,
      settleCorpSelectListAssist: [],
      hasFixedTransferFee: '',
      rules: {},
      backRules: {
        // , { type: 'number' }
        currency: { required: true, message: ' ', triggers: 'blur,change' },
        realAmt: { required: true, message: ' ', triggers: 'blur' },
        recvDate: { required: true, message: ' ', triggers: 'blur,change' },
        compBankAccountId: { required: true, message: ' ', triggers: 'blur', type: 'number' },
        settleMode: { required: true, message: ' ', trigger: 'change' },
        payAccountName: { required: true, message: ' ', triggers: 'blur,change' },
        payAccountPublicType: { required: true, message: ' ', triggers: 'blur,change' },
        recvWay: { required: true, message: ' ', trigger: 'change' },
        // fixedTransferFee: { required: true, message: ' ', trigger: 'change' },
        // bankSeqNo: { required: true, message: ' ', triggers: 'blur' },
      },
      isInit: false,
      btnArr: [
        { auth: 'btn-handleConfirm', action: this.handleConfirm, text: this.$t('Collect.receiptCon'), type: 'primary', noConfirm: true },
        { auth: 'btn-writeoff', action: this.writeoffAction, text: this.$t('Common.writeoffs'), type: 'primary', loading: false },
        // { auth: 'btn-transferDzg', action: this.transferDzg, type: 'warning', text: this.$t('Collect.balanceDZG')},
        { auth: 'btn-markAssistedComp', action: this.markAssistedComp, type: 'warning', text: this.$t('Collect.branchCollect'), both: true },
        {
          auth: 'btn-uploadBankseqFile',
          action: this.openUploadFile,
          text: this.$t('Collect.uploadBill'),
          type: 'primary',
          params: 'uploadBankseqFile',
          both: true,
        },
        {
          auth: 'btn-uploadBankseqFile',
          action: this.openUploadFile,
          text: this.$t('Collect.uploadSheets'),
          type: 'primary',
          params: 'uploadPayBankseqFile',
          both: true,
        },
        { auth: 'btn-handleSettleCrop', action: this.handleSettleCrop, text: this.$t('Charge.entrustedUnit'), type: 'primary' },
        // { auth: 'btn-handleInvoice', action: this.handleRelevanceOpen, text: this.$t('Collect.associatedInvoice'), type: 'primary' },
        { auth: 'btn-handleFeeList', action: this.settleOrderFeeList, text: this.$t('Collect.associatedcosts'), type: 'primary' },
        { auth: 'btn-handleOrderList', action: this.handleSettleOrderFeeList, text: this.$t('Collect.affiliatestm'), type: 'primary' },
      ],
      // 协助代收付分公司
      corpFormAssist2: { settleCorp: '' },
      corpRulesAssist2: { settleCorp: [{ required: true, message: ' ', trigger: 'change' }] },
      exchangeCorpDialogAssist2: false,
      settleCorpSelectListAssist2: [],
      // 详情-核销记录
      writeoffOption: {
        title: this.$t('Charge.underrecords'),
        data: [],
        dataInvisible: true,
        columns: [
          {
            prop: 'writeoffReceipayNo',
           label: this.$t('Hedge.writeoffNo'),
            minWidth: 130,
            type: 'button',
            callback: (row) => {
              this.jumpToRoute({
                name: 'WriteoffRecvDetail2',
                query: { receivableRegId: row.receivableRegId, writeoffReceipayNo: row.writeoffReceipayNo },
                params: { writeoffNo: row.writeoffReceipayNo },
              })
            },
          },
          { prop: 'useAmt', label: this.$t('Charge.writeoffAmt'), width: 130 },
          { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), minWidth: 180 },
          { prop: 'useScene', label: this.$t('Charge.usageScenarios'), width: 130 },
          { prop: 'writeoffSubType', label: this.$t('Charge.underwritSubtypes'), type: 'select', propInDict: 'recWriteoffSubType', width: 160 },
          { prop: 'writeoffName', label: this.$t('Hedge.writeoffs'), width: 150 },
          { prop: 'writeoffTime', label: this.$t('Hedge.writeoffTime'), width: 160 },
        ],
      },
      // 核销-转大掌柜余额
      // dzgTableOption: { title: this.$t('Charge.transferbal'), isSlot: true },
      // 核销-转账手续费
      feeTableOption: { title: this.$t('Charge.transferFee'), isSlot: true },
      // 核销-发票信息
      invoiceTableOption: { title: this.$t('Charge.invoiceInfo'), isSlot: true },

      multipleSelection1: [],
      multipleSelection2: [],
      multipleSelection3: [],
      multipleSelection7: [],
      relevanceOpne: false,
      relevanceOpne2: false,
      // 发票弹框搜索框
      searchOption1: {
        columns: [
          { disabled: true, label: this.$t('FeeList.settleCorp'), prop: 'settleCorpCode', type: 'input', placeholder: '' },
          // { label: this.$t('Settle.invoiceNo'), prop: 'invoiceNo', type: 'input' },
          // { label: this.$t('Settle.invoiceTitle'), prop: 'title', type: 'input' },
        ],
        data: { settleCorpCode: '', invoiceNo: '', title: '' },
      },
      searchOption2: {},
      searchOption3: {},
      // option8: {},  //废除，详情页内数据
      option1: {}, // 费用列表
      option2: {}, // 关联发票弹框费用列表
      option3: {}, // 关联结算单弹框费用列表
      option4: {}, // 转账手续费列表
      option5: {}, // 结算单位信息-委托单位列表
      option6: {}, // 费用列表-一键修改汇率弹框列表
      option7: {}, // 关联费用弹框费用列表
      option9: {}, // 发票列表
      option10: {}, // 核销汇率弹框列表（只做查看）
      option11: {}, // 转大掌柜列表
      option13: {}, // 滞纳金列表
      regWriteoffInfo: Object.assign({}, defaultCreateQuery),
      writeoffItemList: [],
      exchageRateList: [], // 接口返回的当日核销汇率列表
      settleExchageRateList: [], // 核销需要用到的汇率列表
      watchFormExchangeRatesTime: 0,
      originalGather: [],
      exchangeGather: [],
      invoiceReceivableIds: [],
      settleOrderIds: [],
      file: null,
      showUploadFile: false,
      uploadFileTitle: '',
      uploadFileApi: '',
      uploadParams: {},
      fileList: [],
      addTransferFeeForm: { cutType: '', transferFee: '', currency: '' },
      addTransferFeeVisible: false,
      addTransferFeeRules: {
        cutType: [{ required: true, message: this.$t('PreClose.cannotbeempty'), trigger: 'blur' }],
        transferFee: [{ required: true, message: this.$t('PreClose.handlingfee'), trigger: 'blur' }],
        currency: [{ required: true, message: this.$t('PreClose.feecurrency'), trigger: 'blur' }],
      },
      receivableRegId: '',
      writeoffReceipayId: '',
      source: '',
      isJustShowRecord: false,
      writeoffReceipayNo: '',
      // 应收核销金额
      sumAmt: null,
      dialogTitle: this.$t('Collect.writeoffrate'),
      rateDiaologOpen: false,
      showReceiveData: false,
      writeoffFeeDialog: false,
      refSettleUnitList: [],
      refSettleUnitList2: [],
      relationList: [],
      refSettleUnitCustid: '',
      refSettleUnitDialog: false,
      defaultChecked: [],
      exchangeRatesDialog: false,
      loading: false,
      transferOption: { show: false, data: [] },
      transferFeeOption: { show: false, data: [], routerData: {} },
      routerBackReset: false,
      exchangeCurrency: '', // 折币币种
      exchangeAmt: '', // 折币金额
      exchangeRate: 1, // 系统内核销币种与折币币种的汇率
      exchangeRateSource: {}, // 折币币种显示字符串
      rateInterval: '', // 折币金额计算的汇率
      bankAccountSelectOptions: [],
      bankAccountSettleModeList: [], // 账户结算方式
      autocomplete1: {},
      autocomplete2: {},
      selectedOptionItem1: false,
      selectedOptionItem2: false,
      publicTypeDisabled: false,
      COUNTRYLIST: [],
      vm: this,
      // 自定义表头弹框
      customColumnsPopShow: false,
      selfColumnsBase: [],
    }
  },
  created() {
    //付款账户名
    this.autocomplete1 = {
      querySearch: (accountName, cb) => {
        let data = {
          currPage: 1,
          pageSize: 30,
          unitCode: this.regWriteoffInfo.settleCorpCode,
          accountName: accountName === this.oldAccountName ? '' : accountName,
          currency: this.regWriteoffInfo.currency,
          status: 'effect',
        }
        listReceivableRegAccount(data).then((res) => {
          const results = []
          const list = res.data ? res.data : []
          list.forEach((item) => {
            results.push({
              ...item,
              key: item.accountNo,
              value: item.accountName + '(' + item.accountNo.slice(-4) + ')',
            })
          })
          cb(results)
        })
      },
      select: (optionItem, row) => {
        this.regWriteoffInfo.payAccountNo = optionItem.accountNo
        this.regWriteoffInfo.payBankName = optionItem.bankName
        this.regWriteoffInfo.payAccountName = optionItem.accountName || optionItem.value
        this.oldAccountName = optionItem.accountName || optionItem.value
        this.regWriteoffInfo._diyAccountName = optionItem.accountName || optionItem.value
        this.regWriteoffInfo.payAccountPublicType = optionItem.publicType || 'pub'
        // 无国家代码时，是否支持下载
        this.regWriteoffInfo.payAccountCountryCode = optionItem.countryCode
        this.regWriteoffInfo.payAccountCountryName = optionItem.countryName
        if (optionItem.countryCode && optionItem.countryName) {
          this.COUNTRYLIST = [{ cname: optionItem.countryName, value: optionItem.countryCode }]
        }
        this.regWriteoffInfo.payAccountSwiftCode = optionItem.swiftCode
        this.publicTypeDisabled = !!optionItem.publicType
        this.selectedOptionItem1 = true
      },
      change: (val) => {
        this.regWriteoffInfo.payAccountName = this.regWriteoffInfo._diyAccountName = val
        this.clearPayOtherInfo()
      },
    }
    //付款银行
    this.autocomplete2 = {
      querySearch: (queryString, cb) => {
        let data = {
          currPage: 1,
          pageSize: 30,
          query: [{ column: 'cname', type: 'like', value: queryString }],
        }
        bankList(data).then((res) => {
          const list = res.data.list ? res.data.list : []
          cb(list.map((item) => ({ key: item.bankCode, value: item.cname })))
        })
      },
      select: (optionItem, row) => {
        // console.log(optionItem)
        this.selectedOptionItem = optionItem
        this.regWriteoffInfo.payBankCode = optionItem.key
        this.selectedOptionItem2 = true
      },
      change: (val, row) => {
        this.selectedOptionItem2 = false
        this.regWriteoffInfo.payBankCode = ''
      },
    }
    if (this.$route.meta.close) return
    this.feeSource = ''
    this.invoiceReceivableIds = []
    this.refSettleUnitList = []
    this.refSettleUnitList2 = []
    this.option5.data = []
    this.option1.data = []
    this.init()
  },
  methods: {
    // 核销总金额 isExchange为true 表示不需计算汇率
    // this.getWriteoffAmt(false, '', this.rateInterval || 1, 'div')
    getWriteoffAmt(isExchange, amt, rate, div) {
      let sum = this.option1.data.reduce((sum, cur) => {
        return sum.plus(new LSnum(cur[amt || 'writeoffFeeAmt']).times(cur.writeoffExRate || 1).toNum(2))
      }, BIGZERO)
      return isExchange ? sum.toNum(2) : sum[div || 'times'](rate || this.exchangeRate).toNum(2)
    },
    init() {
      this.clearRecInfo()
      this.corpFormAssist.settleCorp = ''
      console.log(this.$store.state.user)
      this.relationList = []
      this.isInit = false
      this.$nextTick(() => (this.isInit = true))
      console.log('route.query:', this.$route.query)
      let routeQuery = this.$route.query
      this.routerBackReset = !!routeQuery.routerBackReset
      // this.routerBackReset = !this.routerBackReset
      this.rules = this.routerBackReset ? { ...this.backRules } : {}
      this.receivableRegId = routeQuery.receivableRegId
      this.receivableRegNo = routeQuery.receivableRegNo
      this.writeoffReceipayId = routeQuery.writeoffReceipayId
      this.source = routeQuery.source
      this.isJustShowRecord = routeQuery.isJustShowRecord
      this.writeoffReceipayNo = routeQuery.writeoffReceipayNo
      this.exchangeCurrency = this.exchangeAmt = ''
      // 关联结算单
      let addFilterArr2 = ['settleCorpCode', 'settleOrderNo', 'orderType', 'finLockStatus']
      let filterGroups2 = {
        settleCorpCode: { label: this.$t('FeeList.settleCorp'), type: 'select', selectOptions: SETTLECROPLIST },
        settleCompCode: {
          label: this.$t('FeeList.settleComp'),
          type: 'remoteSelect',
          remoteSelectList: [],
          remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
          visibleChange: (val, item) => this.querySettleUnit2({ queryString: '', unitTypes: 'company' }, item),
        },
        settleOrderNo: { label: this.$t('FeeList.settleOrderNo'), type: 'input' },
        orderType: {  label: this.$t('Settle.orderType'), type: 'select', prop: 'settleOrderType' },
        offsetPayType: {  label: this.$t('FeeList.receipayType'), type: 'select', prop: 'receipayGroup' },
        // receiveInvoiceApplyStatus: { label: this.$t('Settle.receInvoStatus'), type: 'select', prop: 'receiveInvoiceApplyStatus' },
        // invoiceStatus: { label: this.$t('Settle.invoiceStatus'), type: 'select', prop: 'feeInvoiceStatus' },
        confirmStatus: { label: this.$t('OrderFee.confirmStatus'), type: 'select', prop: 'yesNo' },
        finLockStatus: { label: this.$t('Collect.lockStatus'), type: 'select', prop: 'finLockStatus' },
        confirmBy: {
          label: this.$t('Common.createdBy'),
          type: 'remoteSelect',
          remoteSelectList: [],
          remoteMethod: (val, item) => this.getEmployeeList(val, item),
          visibleChange: (val, item) => this.getEmployeeList('', item),
        },
        createdTime: {
          label: this.$t('Common.createTime'),
          type: 'daterange',
          format: 'yyyy-MM-dd',
          ranges: ['createdTimeStart', 'createdTimeEnd'],
        },
      }
      this.searchOption2 = {
        addFilter: {
          searchInputGroup: addFilterArr2.map((v) => ({ key: v, value: '' })),
          filterGroups: filterGroups2,
        },
      }
      // 关联费用
      let addFilterArr3 = ['settleCorpCode', 'sourceBizNo', 'feeCode']
      let filterGroups3 = {
        settleCorpCode: { label: this.$t('FeeList.settleCorp'), type: 'select', selectOptions: SETTLECROPLIST },
        sourceBizNo: {label: this.$t('FeeList.orderNo'), type: 'input' },
        settleOrderNo: { label: this.$t('FeeList.settleOrderNo'), type: 'input' },
        feeCode: {
          label: this.$t('FeeList.feeEname'),
          type: 'remoteSelect',
          remoteSelectList: [],
          remoteMethod: (val, item) => this.feeItemQuerySearch(val, item),
          visibleChange: (val, item) => this.feeItemQuerySearch('', item),
        },
        // invoiceStatus: { label: this.$t('Settle.invoiceStatus'), type: 'select', prop: 'feeInvoiceStatus' },
        confirmStatus: { label: this.$t('FeeList.confirmStatus'), type: 'select', prop: 'yesNo' },
        feeCurrency: { label: this.$t('Settle.orignalCurrency'), type: 'select', prop: 'currency' },
        // settleCurrency: { label: this.$t('Settle.settleCurrency'), type: 'select', prop: 'currency' },
      }
      this.searchOption3 = {
        addFilter: {
          searchInputGroup: addFilterArr3.map((v) => ({ key: v, value: '' })),
          filterGroups: filterGroups3,
        },
      }
      const operationBtns = Object.assign({}, this.option.operationBtns, {
        text: '',
        show: true, // 详情不需要删除
        // data: [{ label: this.$t('Common.del'), type: 'text', showFn: (row) => row.confirmStatus !== 'yes', action: 'Delete' }],
        data: [{ label: this.$t('Common.del'), type: 'text', show: true, action: 'Delete' }],
      })
      const operationBtns4 = Object.assign({}, this.option.operationBtns, {
        width: 100,
        // data: [{ label: this.$t('Common.del'), type: 'text', showFn: (row) => row.isDelete, action: 'Delete' }],
        // 收款登记确定前后均可操作费用
        data: [{ label: this.$t('Common.del'), type: 'text', showFn: (row) => row.cutType !== 'fixed', action: 'Delete' }],
        fixed: 'right',
        show: true,
        callback: (action, $index, row, option) => {
          // 收款登记确定前后均可操作费用
          this.handleDeleteServieFee($index, row, option)
          // if (!this.isConfirm) {
          //   return this.handleDeleteServieFee($index, row, option)
          // }
          // this.option4.data.splice($index, 1)
          // this.computedMoney(row)
        },
      })
      const operationBtns5 = Object.assign({}, this.option.operationBtns, {
        width: 100,
        data: [{ label: this.$t('Common.del'), type: 'text', action: 'Delete', showFn: (row) => row.relationType !== 'temporary' }],
        fixed: 'right',
        show: true,
        callback: (action, $index, row, option) => {
          // 删除结算单位
          const settleCorpCode = row.settleCorpCode
          const list = SETTLECROPLIST.filter((item) => item.value !== settleCorpCode)
          clearData(SETTLECROPLIST)
          SETTLECROPLIST.push(...list)
          // 删除列表数据
          this.option5.data.splice($index, 1)
        },
      })
      const operationBtns9 = Object.assign({}, this.option.operationBtns, {
        width: 100,
        data: [{ label: this.$t('Common.del'), type: 'text', action: 'Delete', show: true }],
        fixed: 'right',
        show: true,
        callback: (action, $index, row, option) => this.delInvoiceReceivable(row, $index),
      })
      const operationBtns11 = Object.assign({}, this.option.operationBtns, {
        width: 150,
        data: [
          { label: this.$t('Common.modify'), type: 'text', action: 'Edit', showFn: (row) => !row.edit },
          { label: this.$t('Common.save'), type: 'text', action: 'Save', showFn: (row) => row.edit },
          { label: this.$t('Common.del'), type: 'text', action: 'Delete', show: true },
        ],
        fixed: 'right',
        show: true,
        callback: (action, $index, row, option) => {
          if (action === 'Edit') {
            this.option11.data[$index].edit = true
          } else if (action === 'Save') {
            let writeoffBalance = this.regWriteoffInfo.writeoffBalance
            // 总金额验证
            const total = this.option11.data.reduce((pre, cur) => pre.plus(cur.internalDzgAmt), BIGZERO).num
            // 核销总金额
            const writeoffAmt = this.getWriteoffAmt()
            if (total > new LSnum(writeoffBalance).minus(writeoffAmt).num) {
              return this.$msgErrClose(this.$t('Charge.unusedamount'))
            } else {
              this.option11.data[$index].edit = false
              this.regWriteoffInfo.unusedAmt = new LSnum(writeoffBalance).minus(total).minus(writeoffAmt).toNum(2)
            }
          } else if (action === 'Delete') {
            this.$confirmWarn(this.$t('Settle.confirmWarn'), () => {
              this.regWriteoffInfo.unusedAmt = new LSnum(this.regWriteoffInfo.unusedAmt).plus(row.internalDzgAmt).toNum(2)
              this.option11.data.splice($index, 1)
            })
          }
        },
      })
      ;[1, 2, 3, 4, 5, 6, 7, 9, 10, 11].forEach((v) => {
        const option = {
          1: {
            edit: true,
            operationBtns,
            colorColumns: ['receipayType'],
            customColumns: {
              show: true,
              handleCustomColumns: () => (this.customColumnsPopShow = true),
            },
            scrollY: { enabled: true, gt: 300 },
          },
          2: { maxHeight: 460 },
          3: { maxHeight: 460 },
          4: {
            operationBtns: operationBtns4,
            selection: false,
            edit: true,
            handleKeyup: (e, option, row, index) => {
              // if (this.isConfirm) return
              let { amt, currency, cutType } = row
              if (e.key === 'Enter' && amt && currency && cutType) {
                this.handleSave(index, row)
              }
            },
            handleCellClick: ({ row, column, triggerCheckbox, rowIndex, columnIndex, $event }) => {
              if (row.cutType === 'fixed') return
              // if (this.isConfirm) return
              this.option4.edit = true
              $event.stopPropagation()
              if (row.edit) return
              if (!this.checkAuth(this.$route.name, 'btn-addFee')) return
              this.forEachSave(() => {
                this.$set(row, 'edit', true)
              })
            },
          },
          5: { operationBtns: operationBtns5, selection: false },
          6: { edit: true, selection: false },
          7: { maxHeight: 460 },
          9: { operationBtns: operationBtns9, selection: false },
          10: { selection: false },
          11: {
            edit: true,
            index: { show: true },
            operationBtns: operationBtns11,
            selection: false,
            columns: [
              {
                prop: 'dzgCompCode',
                label: this.$t('Hedge.daZg'),
                type: 'select',
                propInDict: 'dzgCompCode',
                change: (value, row, rowIndex) => this.changeDzgComName(row, value),
              },
              { prop: 'currency',label: this.$t('FeeList.currency'), type: 'text' },
              {
                prop: 'internalDzgAmt',
                label: this.$t('FeeList.feeAmt'),
                type: 'input',
                inputType: 'number',
                // validateInput: (val, row, item, change) => {
                //   if (change && val && !/^\d+(\.\d{0,2})?$/.test(val)) {
                //     this.$msgErrClose('请输入正确的金额！')
                //     let res = /^-?(\d+(\.\d{0,2})?)?/.exec(row[item.prop])
                //     row[item.prop] = res && res[0]
                //   }
                // },
              },
              { prop: 'dzgWriteoffNo',label: this.$t('Hedge.writeoffNo'), type: 'input', needTrim: true },
            ],
            handleCellClick: ({ row, column, triggerCheckbox, rowIndex, columnIndex, $event }) => {
              $event.stopPropagation()
              this.option11.data[rowIndex].edit = true
            },
          },
        }
        this['option' + v] = Object.assign({}, this.option, {
          id: 'option' + v,
          $name: 'WriteoffRecvDetail' + v,
          data: [],
          tips: false,
          operationBtns: false,
          selection: { show: true, fixed: 'left' },
          edit: false,
          ...option[v],
        })
      })
      const columns1 = [
        {
          prop: 'sourceBizNo',
          label: this.$t('PreClose.bizNo'),
          type: 'button',
          key: 'sourceBizNo',
          width: '140px',
          formatter: ({ cellValue, column, row, item }) => row.sourceBizNo || row.finBillNo,
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => this.showDetail(row),
          },
        },
        { prop: 'settleCompName', label: this.$t('FeeList.settleComp'), type: 'text', key: 'settleCompName', width: 150 },
        { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', key: 'settleCorpName' },
        { prop: 'settleOrderNo', label: this.$t('FeeList.settleOrderNo'), type: 'text', key: 'settleOrderNo', width: 140 },
        // { prop: 'feeName', label: this.$t('FeeList.feeName'), type: 'text', key: 'feeName' },
        { prop: 'feeEnName', label: this.$t('FeeList.feeEname'), type: 'text', key: 'feeEnName' },
        { prop: 'receipayType', label: this.$t('Settle.receipayType'), type: 'select', readOnly: true, width: 100 },
        { prop: 'currency', label: this.$t('Settle.orignalCurrency'), type: 'text', key: 'currency' },
        { prop: 'feeAmt', label: this.$t('Collect.originalamount'), type: 'text', key: 'feeAmt' },
        // { prop: 'noWriteoffAmt', label: this.$t('Collect.writeoffableamount'), type: 'text', key: 'noWriteoffAmt' },
        { prop: 'writeoffBalanceAmt', label: this.$t('Collect.writeoffableamount'), type: 'text', key: 'writeoffBalanceAmt', disabled: true },
        {
          prop: 'writeoffFeeAmt',
          label: this.$t('Charge.writeoffAmt'),
          type: 'input',
          key: 'writeoffFeeAmt',
          disabled: true,
          maxlength: '16',
          validateInput: (value, row, pItem, changeE) => {
            if (!value) return
            if (!/^-?(\d+(\.\d{0,2})?)?$/.test(value)) {
              !this.debounceLsFn() && this.$msgErrClose(this.$t('Charge.numberTips'))
              let res = /^-?(\d+(\.\d{0,2})?)?/.exec(row[pItem.prop])
              row[pItem.prop] = res && res[0]
            }
          },
        },
        {
          prop: 'lessPayAmt',
          label: this.$t('Collect.shortAmt'),
          type: 'input',
          key: 'lessPayAmt',
          disabled: true,
          maxlength: '16',
          validateInput: (value, row, pItem, changeE) => {
            if (!value) return
            if (!/^(\d+(\.\d{0,2})?)?$/.test(value)) {
              !this.debounceLsFn() && this.$msgErrClose(this.$t('PreClose.correctpos'))
              let res = /^(\d+(\.\d{0,2})?)?/.exec(row[pItem.prop])
              row[pItem.prop] = res && res[0]
            }
          },
        },
        { prop: 'settleCurrency', label: this.$t('Settle.settleCurrency'), type: 'text', key: 'settleCurrency' },
        { prop: 'settleExRate', label: this.$t('Settle.settleExRate'), type: 'text', key: 'settleExRate' },
        { prop: 'settleAmt', label: this.$t('Settle.settleAmt'), type: 'text', key: 'settleAmt' },
        { prop: 'writeoffCurrency', label: this.$t('PreClose.discountCur'), type: 'text', key: 'writeoffCurrency' },
        { prop: 'writeoffExRate', label: this.$t('Collect.writeoffrate'), type: 'text', key: 'writeoffExRate' },
        { prop: 'writeoffAmt', label: this.$t('Settle.exSettleAmt'), type: 'text', key: 'writeoffAmt' },
        { prop: 'serviceName', label: this.$t('FeeList.serviceCodes'), type: 'text', key: 'serviceName' },
        { prop: 'feeUnit', label: this.$t('FeeList.feeUnit'), type: 'text', formatter: ({ cellValue }) => this.dictMapObj.feeUnit[cellValue] },
        { prop: 'unitPrice', label: this.$t('FeeList.unitPrice'), type: 'text', key: 'unitPrice' },
        { prop: 'unitCount', label: this.$t('FeeList.quantity'), type: 'text', key: 'unitCount' },
        { prop: 'invoiceNo', label: this.$t('FeeList.invoiceNo'), width: 86, type: 'text' },
        { prop: 'finDate',label: this.$t('FeeList.finDate'), width: 86, type: 'text' },
      ]
      const columns2 = [
        // { prop: 'invoiceNo', label: this.$t('FeeList.invoiceNo'), type: 'text', key: 'invoiceNo' },
        // { prop: 'title', label: this.$t('Settle.invoiceTitle'), type: 'text', key: 'title' },
        // {
        //   prop: 'preInvoice',
        //   label: this.$t('Collect.whetherrecnvoices'),
        //   type: 'text',
        //   key: 'preInvoice',
        //   width: 100,
        //   formatter: ({ cellValue }) => (cellValue === 'yes' ?this.$t('Common.yes') : cellValue ?this.$t('Common.no')  : ''),
        // },
        // { prop: 'invoiceType', label: this.$t('Settle.invoiceType'), type: 'select', key: 'invoiceType' },
        // { prop: 'currency', label: this.$t('Settle.invoiceCur'), type: 'text', key: 'currency' },
        // { prop: 'amt', label: this.$t('Settle.invoiceAmt'), type: 'text', key: 'amt' },
        // { prop: 'taxRate',label: this.$t('Settle.taxRate'), type: 'select', key: 'taxRate', propInDict: 'taxRateInfo' },
        // { prop: 'acctRate', label: this.$t('Charge.invoicerate'), type: 'text', key: 'acctRate' },
        // { prop: 'invoiceRate', label: this.$t('Charge.invoicerate'), type: 'text', key: 'invoiceRate' },
        { prop: 'writeoffAmt', label: this.$t('Collect.writtenoffAmount'), type: 'text', key: 'writeoffAmt' },
        { prop: 'noWriteoffAmt',label: this.$t('Collect.unwrittenAmount'), type: 'text', key: 'noWriteoffAmt' },
      ]
      const columns3 = [
        { prop: 'settleOrderNo', label: this.$t('FeeList.settleOrderNo'), type: 'text', width: 110 },
        { prop: 'orderType',  label: this.$t('Settle.orderType'), type: 'select', propInDict: 'settleOrderType' },
        { prop: 'settleCompName', label: this.$t('FeeList.settleComp'), type: 'text', width: 120 },
        { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', width: 120 },
        { prop: 'offsetPayType',  label: this.$t('FeeList.receipayType'), type: 'select', propInDict: 'receipayGroup' },
        { prop: 'recWriteoffDesc', label: this.$t('Settle.reciWriteOffAmtDesc'), type: 'tooltip', width: 100 },
        { prop: 'recNoWriteoffDesc', label: this.$t('Settle.reciNoWriteOffAmtDesc'), type: 'tooltip', width: 100 },
        { prop: 'payWriteoffDesc', label: this.$t('Settle.payWriteOffAmtDesc'), type: 'tooltip', width: 100 },
        { prop: 'payNoWriteoffDesc', label: this.$t('Settle.payNoWriteOffAmtDesc'), type: 'tooltip', width: 100 },
        // { prop: 'receiveInvoiceApplyStatus', label: this.$t('Settle.receInvoStatus'), type: 'select', width: 100 },
        // { prop: 'invoiceStatus', label: this.$t('Settle.invoiceStatus'), type: 'select', propInDict: 'feeInvoiceStatus', width: 60 },
        { prop: 'confirmStatus', label: this.$t('OrderFee.confirmStatus'), type: 'select', propInDict: 'yesNo' },
        // {prop: 'confirmStatus', label: this.$t('OrderFee.confirmStatus'), type: 'text', formatter: (row, pItem) => {  let prop = pItem.prop
        //   if (row[prop] === 'yes') {  return this.$t('Common.confirmed')  } else if (row[prop] === 'no') {  return this.$t('Common.unconfirmed')  }else{  return row[prop]  }  },
        // },
        // {prop: 'writeoffStatus', label: this.$t('FeeList.writeoffStatuss'), type: 'text' , formatter: (row, pItem) => {return  row[pItem.prop] ? this.$t(`dict.writeoffStatus.${ row[pItem.prop]}`) : '' }},
        { prop: 'finLockStatus', label: this.$t('Collect.lockStatus'), type: 'select', propInDict: 'finLockStatus', width: 60 },
        { prop: 'createdName', label: this.$t('Common.createdBy'), type: 'text', width: 100 },
        {
          prop: 'createdTime',
          label: this.$t('Common.createTime'),
          type: 'text',
          width: 100,
          formatter: ({ cellValue }) => cellValue && cellValue.split(' ')[0],
        },
      ]
      console.log(this.dictMap.transferFeeType)
      const columns4 = [
        {
          prop: 'cutType',
          label: this.$t('Charge.inandextype'),
          type: 'select',
          propInDict: 'transferFeeType',
          selectOptions: this.dictMap.transferFeeType.filter((v) => v.value === 'exter_cut' || v.value === 'inter_cut'),
        },
        { prop: 'currency',label: this.$t('FeeList.currency'), type: 'text' },
        {
          prop: 'amt',
          label: this.$t('FeeList.feeAmt'),
          type: 'input',
          inputType: 'number',
          validateInput: (val, row, item, change) => {
            if (change && val) {
              if (/^\d+(\.\d{0,2})?$/.test(val)) {
                row.allotAmt = val
                //联动可核销金额和剩余未用金额
              } else {
                row.amt = row.allotAmt = ''
              }
            }
          },
        },
        { prop: 'hasAllotAmt', label: this.$t('Charge.amortizedAmt'), type: 'text' },
        { prop: 'allotAmt', label: this.$t('Charge.currentasses'), type: 'text' },
      ]
      const columns5 = [
        { prop: 'settleCorpName', label: this.$t('Charge.settlementUnit'), type: 'text' },
        { prop: 'relationType', label: this.$t('Charge.AffiliaType'), type: 'select', propInDict: 'settleUnitRelationType' },
        { prop: 'settleOrderNo', label: this.$t('FeeList.settleOrderNo'), type: 'text' },
        { prop: 'fileType', label: this.$t('Charge.attachType'), type: 'select', propInDict: 'settleUnitRelationFileType' },
        {
          prop: 'fileName',
          label: this.$t('Common.attachment'),
          type: 'button',
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => row.fileNo && window.open(`/base/fileView/preview/${row.fileNo}/sowoll`),
          },
        },
        {
          prop: 'startTime',
          label: this.$t('Charge.expirydate'),
          type: 'text',
          formatter: ({ cellValue, column, row, item }) => {
            let { fileType, startTime, stopTime } = row
            return fileType === 'bankseq_file'
              ? this.$t('Charge.temporary')
              : startTime
              ? `${startTime ? startTime.slice(0, 10) : ''} ~ ${stopTime ? stopTime.slice(0, 10) : ''}`
              : ''
          },
        },
      ]
      const columns6 = [
        { prop: 'srcCurrency', label: this.$t('Settle.orignalCurrency'), type: 'text' },
        { prop: 'toCurrency', label: this.$t('Collect.writeoffCurrency'), type: 'text' },
        { prop: 'settlementRate', label: this.$t('Collect.writeoffrate'), type: 'input' },
      ]
      const columns7 = [
        { prop: 'sourceBizNo', label: this.$t('PreClose.bizNo'), type: 'text', width: 125 },
        { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), type: 'text', width: 140 },
        { prop: 'settleOrderNo', label: this.$t('FeeList.settleOrderNo'), type: 'text', width: 125 },
        // { prop: 'invoiceStatus', label: this.$t('Settle.invoiceStatus'), type: 'select', propInDict: 'feeInvoiceStatus' },
        // 优化需求 显示是否确认 ID1005097
        { prop: 'confirmStatus', label: this.$t('FeeList.confirmStatus'), type: 'select', propInDict: 'yesNo' },
        { prop: 'feeEnName', label: this.$t('FeeList.feeEname'), type: 'text' },
        { prop: 'feeAmt', label: this.$t('Collect.originalamount'), type: 'text' },
        { prop: 'currency', label: this.$t('Settle.orignalCurrency'), type: 'text' },
        { prop: 'noWriteoffAmt', label: this.$t('Collect.writeoffableamount'), type: 'text' },
        { prop: 'settleAmt', label: this.$t('Settle.settleAmt'), type: 'text' },
        { prop: 'settleCurrency', label: this.$t('Settle.settleCurrency'), type: 'text' },
        { prop: 'settleExRate', label: this.$t('Settle.settleExRate'), type: 'text' },
        { prop: 'exSettleAmt', label: this.$t('Settle.exSettleAmt'), type: 'text' },
        { prop: 'createdName', label: this.$t('Common.createdBy'), type: 'text' },
        { prop: 'createdTime', label: this.$t('Common.createTime'), type: 'text' },
      ]
      const columns9 = [
        // { prop: 'invoiceNo', label: this.$t('FeeList.invoiceNo'), type: 'text' },
        // { prop: 'invoiceType', label: this.$t('Settle.invoiceType'), type: 'select', propInDict: 'invoiceType' },
        // {
        //   prop: 'preInvoice',
        //   label: this.$t('Collect.whetherrecnvoices'),
        //   type: 'text',
        //   key: 'preInvoice',
        //   width: 100,
        //   formatter: ({ cellValue, column, row, item }) => (cellValue === 'yes' ?this.$t('Common.yes') : cellValue ?this.$t('Common.no')  : ''),
        // },
        // { prop: 'amt', label: this.$t('Settle.invoiceAmt'), type: 'text' },
        // { prop: 'currency', label: this.$t('Settle.invoiceCur'), type: 'text' },
        // { prop: 'invoiceRate',label: this.$t('Settle.invoiceRate'), type: 'text' },
        // { prop: 'taxRate',label: this.$t('Settle.taxRate'), type: 'text' },
        { prop: 'taxAmt', label: this.$t('FeeList.taxAmt'), type: 'text' },
        { prop: 'lockAmt', label: this.$t('PreClose.unrelatedAmt'), type: 'text', width: 100 },
        // { prop: 'issueName',label: this.$t('Charge.biller'), type: 'text' },
        // { prop: 'issueTime', label: this.$t('Charge.invoiceTime'), type: 'text' },
      ]
      const columns10 = [
        { prop: 'srcCurrency', label: this.$t('Settle.orignalCurrency'), type: 'text' },
        { prop: 'toCurrency', label: this.$t('Collect.writeoffCurrency'), type: 'text' },
        { prop: 'lowerRate', label: this.$t('PreClose.minexchange'), type: 'text' },
        { prop: 'upperRate', label: this.$t('PreClose.maxexchange'), type: 'text' },
        { prop: 'settlementRate', label: this.$t('PreClose.exRates'), type: 'text' },
      ]
      this.selfColumnsBase = columns1
      this.configColumns.splice(0, 1000, ...this.selfColumnsBase.map((item) => item.prop))
      this.option1.columns = [...this.selfColumnsBase]
      listColumnConfigGet({ scenesCode: 'reg_writeoff_fee_list' }).then((res) => {
        this.columnConfig = true
        this.dealCustomColumn(res)
      })
      // this.option1.columns = columns1
      this.option2.columns = columns2
      this.option3.columns = columns3
      this.option4.columns = columns4
      this.option5.columns = columns5
      this.option6.columns = columns6
      this.option7.columns = columns7
      this.option9.columns = columns9
      this.option10.columns = columns10
      this.option13 = Object.assign({}, this.option, {
        id: 'option13',
        $name: 'WriteoffRecvDetail213',
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
        { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), minWidth: 150, type: 'text' },
        { prop: 'currency',label: this.$t('FeeList.currency'), type: 'text' },
        { prop: 'arrearReceiveAmt', label: this.$t('Hedge.arrearReceiveAmt'), type: 'text' },
        { prop: 'lateFeeAmt', label: this.$t('Hedge.lateFeeAmt'), type: 'text' },
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
    },
    // 自定义表头
    customColumnsPopClose(action, value) {
      this.customColumnsPopShow = false
      if (action === 'Confirm') {
        let columnList = this.getColumnsValues(value) // getColumnsValues在本页面无作用
        listColumnConfigSave({ columnList, scenesCode: 'reg_writeoff_fee_list' }).then((res) => {
          this.dealCustomColumn(res)
        })
      }
    },
    dealCustomColumn(res) {
      if (res.data?.columnList?.length) {
        let list = res.data.columnList
        this.configColumns = list
        this.option1.columns = list.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop)).filter((v) => v)
      }
    },
    changeDzgComName(row, value) {
      row['dzgCompName'] = this.dictMapObj['dzgCompCode'][value.toLowerCase()]
    },
    getData() {
      this.regWriteoffInfo.assistedCompName = this.regWriteoffInfo.assistedCompCode = ''
      this.writeoffStatusBackup = false
      this.regWriteoffInfo.confirmStatus = ''
      this.regWriteoffInfo.recvWay = ''
      this.regWriteoffInfo.writeoffRemark = ''
      this.bankAccountSelectOptions.splice(0, 10000)
      this.rateInterval = ''
      this.loading = true
      const _receivableReg = window.sessionStorage.getItem('_receivableReg')
      window.sessionStorage.removeItem('_receivableReg')
      const _receivableRegFormSettle = window.sessionStorage.getItem('_receivableRegFormSettle')
      this.isFromSettle = _receivableRegFormSettle
      window.sessionStorage.removeItem('_receivableRegFormSettle')
      if (_receivableReg) {
        // 重新核销
        this.isRewriteoff = 0
        // 保存原有数据，用于判断是否做了修改
        this._receivableRegBackup = JSON.parse(_receivableReg)
        this.getRegInfo(JSON.parse(_receivableReg))
      } else {
        this.isRewriteoff = undefined
        // 收款核销
        regInfo({ receivableRegId: this.receivableRegId, receivableRegNo: this.receivableRegNo })
          .then((res) => {
            this.writeoffStatusBackup = res.data && res.data.writeoffStatus === 'finish'
            this.getRegInfo(res.data)
          })
          .catch((err) => {
            console.log(err)
            this.delVisitedView()
            this.cancel()
          })
          .finally(() => (this.loading = false))
      }
      this.loading = true
      actualExchangeRate({ rateType: 'receive' }).then((res) => {
        this.exchageRateList = res.data
        this.viaWriteoffCurrencySetRate()
        if (this.isRewriteoff !== undefined) {
          this.isRewriteoff++
        }
        // 从结算单列表关联收款登记，自动分配费用列表内的核销金额
        if (_receivableRegFormSettle) {
          let initNum = 0
          let interval = setInterval(() => {
            initNum++
            // 有时候this.isRewriteoff的值未能执行至2，用两种方式判断，必有一种执行
            // console.log(initNum)
            if (this.isRewriteoff === 2) {
              clearInterval(interval)
              setTimeout(() => {
                this.loading = false
                this.checkRealAmt()
              }, 300)
            }
            if (initNum === 20) {
              clearInterval(interval)
              this.checkRealAmt()
            }
          }, 100)
        } else {
          this.loading = false
        }
      })
    },
    getRegInfo(resData) {
      // TODO 调试，后面要删除 ---begin
      this._receivableRegBackup = JSON.parse(JSON.stringify(resData))
      // TODO 调试，后面要删除 ---end
      this.isFirst = true
      this.COUNTRYLIST = [{ cname: resData.payAccountCountryName, value: resData.payAccountCountryCode }]
      this.regWriteoffInfo = Object.assign({}, this.regWriteoffInfo, {
        ...resData,
        writeoffCurrency: resData.currency,
        defaultAmt: resData.writeoffBalance,
        writeoffDate: dateFormat('yyyy-mm-dd', new Date()),
        realAmt: resData.realAmt ? resData.realAmt + '' : '',
      })
      console.log('!!!!!!!!!!!!!!')
      console.log(resData.assistedCompName)
      console.log(this.regWriteoffInfo.assistedCompName)
      setTimeout(() => {
        // if (
        //   resData.recvBankAcct?.hasFixedTransferFee === 'yes' &&
        //   resData.fixedTransferFee &&
        //   this.option4.data &&
        //   !this.option4.data.find((item) => item.cutType === 'fixed')
        // ) {
        //   this.option4.data.unshift({
        //     cutType: 'fixed',
        //     currency: this.addTransferFeeForm.currency,
        //     transferFee: resData.fixedTransferFee,
        //   })
        // }
        // console.log(resData.recvBankAcct?.hasFixedTransferFee, resData.fixedTransferFee, this.option4.data)
        this.regWriteoffInfo.fixedTransferFee = resData.fixedTransferFee
        this.hasFixedTransferFee =
          resData.recvBankAcct?.hasFixedTransferFee === 'yes' && resData.recvBankAcct?.bankCode === 'B0249H231000001'
        this.regWriteoffInfo.settleMode = resData.settleMode
        this.bankAccountSettleModeList = (resData.settleModeList || []).map((item) => {
          let dict = this.dictMap.bankAccountSettleMode
          return dict.find((v) => v.value === item)
        })
      }, 100)
      // 核销列表
      this.writeoffOption.dataInvisible = true
      this.writeoffOption.data = (resData.receivableMoneyFlowList || []).map((item) => {
        return { ...item, invisible: this.writeoffOption.dataInvisible && item.recheckStatus === 'check_back' }
      })

      // 核销备注 regWriteoffInfo.writeoffRemark
      
      const _writeoffRemark = window.sessionStorage.getItem('_writeoffRemark')
      if (_writeoffRemark) {
        this.regWriteoffInfo.writeoffRemark = _writeoffRemark
        window.sessionStorage.removeItem('_writeoffRemark')
      }
      // 折币币种
      const _writeoffCurrency = window.sessionStorage.getItem('_writeoffCurrency')
      if (!this.exchangeCurrency) {
        this.exchangeCurrency = _writeoffCurrency || this.regWriteoffInfo.writeoffCurrency
      }
      window.sessionStorage.removeItem('_writeoffCurrency')
      // 折币汇率
      const _writeoffExRate = window.sessionStorage.getItem('_writeoffExRate')
      this.rateInterval = +_writeoffExRate || ''
      window.sessionStorage.removeItem('_writeoffExRate')

      const _totalAmt = window.sessionStorage.getItem('_totalAmt')
      // 剩余未用金额等于可核销金额
      this.exchangeAmt = this.regWriteoffInfo.unusedAmt = +_totalAmt || this.regWriteoffInfo.writeoffBalance
      window.sessionStorage.removeItem('_totalAmt')
      // 重新核销获取列表带过来的数据
      const writeoffItemList = window.sessionStorage.getItem('writeoffItemList')
      if (writeoffItemList) {
        const datasource = JSON.parse(writeoffItemList)
        const data = datasource.map((item) => {
          item.writeoffCurrency = this.regWriteoffInfo.writeoffCurrency
          item.writeoffFeeAmt = item.writeoffFeeAmt
          item.lessPayAmt = 0
          item.edit = true
          return item
        })
        this.option1.data = this.option1.data.concat(data)
        window.sessionStorage.removeItem('writeoffItemList')
        this.option1.selection = { show: true, fixed: 'left' }
      }
      
      this.option4.data = resData.transferFeeAllotList.map((item) => {
        item.hasAllotAmt = item.hasAllotAmt || 0
        item.allotAmt = item.allotAmt || new LSnum(item.amt).minus(item.hasAllotAmt).toNum(2)
        // return Object.assign({}, item, { edit: false, isDelete: !this.isConfirm })
        return Object.assign({}, item, { edit: false, isAdd: false, oldAmt: item.amt })
      })
      this._innerTransferFeeList = JSON.parse(JSON.stringify(this.option4.data))
      // 添加结算单位
      clearData(SETTLECROPLIST)
      SETTLECROPLIST.push({ label: this.regWriteoffInfo.settleCorpName, value: this.regWriteoffInfo.settleCorpCode })
      const len = this.regWriteoffInfo.refSettleUnitList?.length
      if (len) {
        const corpCodeList = JSON.parse(JSON.stringify(this.regWriteoffInfo.refSettleUnitList))
        this.option5.data = corpCodeList.map((item) => {
          if (!SETTLECROPLIST.find((v) => v.value === item.settleCorpCode)) {
            SETTLECROPLIST.push({ label: item.settleCorpName, value: item.settleCorpCode })
          }
          return Object.assign(item, { fileType: 'bankseq_file' })
        })
      }
      console.log(SETTLECROPLIST)
      // this.viaWriteoffCurrencySetRate()
      // 核销完成状态下，将删除按钮隐藏
      const arrCfg = [4, 5, 9, 11]
      if (this.hasBalance) {
        arrCfg.forEach((v) => (this['option' + v].operationBtns.show = true))
      } else {
        arrCfg.forEach((v) => (this['option' + v].operationBtns.show = false))
      }
      console.log(this.regWriteoffInfo)
      this.loading = false
      this.isOkRender = true
    },
    // 切换核销记录反核销记录
    toggleHistory() {
      this.writeoffOption.dataInvisible = !this.writeoffOption.dataInvisible
      this.writeoffOption.data = (this.writeoffOption.data || []).map((item) => {
        return { ...item, invisible: this.writeoffOption.dataInvisible && item.recheckStatus === 'check_back' }
      })
    },
    getSettleList(val, item) {
      if (this.regWriteoffInfo.settleCompCode) {
        item.selectOptions.push({ label: 'rext', value: 'sd' })
      }
    },
    // 导入费用时设置核销汇率
    viaWriteoffCurrencySetRate() {
      // 根据收款币种设置汇率
      if (this.exchageRateList.length === 0) {
        return
      }

      const value = this.exchangeCurrency // 核销币种

      let currencys = [...new Set(this.option1.data.map((item) => item.currency))]
      const differentCurrencys = currencys.filter((item) => item !== value)
      if (differentCurrencys.length > 0) {
        const exchageRateList = this.exchageRateList.filter((item) => {
          return differentCurrencys.some((currency) => {
            return currency === item.srcCurrency && value === item.toCurrency
          })
        })
        this.settleExchageRateList = exchageRateList // 计算核销需要用到的汇率列表
        this.regWriteoffInfo.exchangeRates = exchageRateList.map((item) => {
          return {
            srcCurrency: item.srcCurrency,
            toCurrency: item.toCurrency,
            systemRate: item.srcCurrency + '-' + item.toCurrency + ' ' + item.rate,
            settlementRateTitle: item.srcCurrency + '-' + item.toCurrency,
            settlementRate: item.rate,
            exchangeRateId: item.exchangeRateId,
            lowerRate: item.lowerRate,
            upperRate: item.upperRate,
            edit: true,
          }
        })
      } else {
        this.settleExchageRateList = currencys.map((currency) => {
          // differentCurrencys.length === 0 表示只有一种费用币种，且选择的核销币种和费用币种相同
          return {
            srcCurrency: currency,
            toCurrency: currency,
            rate: 1,
            exchangeRateId: '',
            edit: true,
          }
        })
        this.regWriteoffInfo.exchangeRates = currencys.map((item) => {
          return {
            srcCurrency: item,
            toCurrency: item,
            systemRate: item + '-' + item + ' ' + 1,
            settlementRateTitle: item + '-' + item,
            settlementRate: 1,
            exchangeRateId: '',
            lowerRate: 1,
            upperRate: 1,
            edit: true,
          }
        })
      }
      this.rateChange()
      this.writeoffGatherChange()
      this.option10.data = this.regWriteoffInfo.exchangeRates.map((item) => {
        let { settlementRateTitle, settlementRate, lowerRate, upperRate } = item
        let [srcCurrency, toCurrency] = settlementRateTitle.split('-')
        return { lowerRate, upperRate, srcCurrency, toCurrency, settlementRate }
      })
      // 费用合计联动
      // this.feeSumChange()
    },
    rateChange() {
      this.option1.data.forEach((item) => {
        item.writeoffExRate = item.writeoffExRate || item.settleExRate
      })
      this.$forceUpdate()
      // this.option1.data = this.option1.data.map((item) => ({ ...item, writeoffExRate: item.writeoffExRate || item.settleExRate }))
    },
    writeoffGatherChange() {
      // 核销汇总的计算
      let currencys = [...new Set(this.option1.data.map((item) => item.currency))]
      this.originalGather = currencys.map((item) => {
        return {
          currency: item,
          amt: this.option1.data.reduce((sum, cur) => sum.plus(item === cur.currency ? cur.writeoffFeeAmt : 0), BIGZERO).val,
          isPay: false,
        }
      })

      this.exchangeGather = [{ currency: this.exchangeCurrency, amt: this.getWriteoffAmt(true), isPay: false }]
    },
    decimalFixed2(x) {
      return decimalFixed2(x)
    },
    //收款登记确认按钮
    handleConfirm() {
      // 防止正在添加手续费出现异常
      setTimeout(() => {
        this.loading = true
        regConfirm({ receivableRegIds: [this.receivableRegId] })
          .then((res) => {
            this.$msgSucClose(this.$t('Settle.confirmSuc'))
            if (!this.regWriteoffInfo.settleCorpName) {
              this.exchangeCorpDialogAssist = true
              return
            }
            this.init()
            this.getData()
          })
          .finally(() => (this.loading = false))
      }, 600)
    },
    // 新增手续费
    addTransferFeeSubmit() {
      this.$refs.addTransferFeeForm.validate((valid) => {
        if (valid) {
          const data = {
            receivableRegId: this.receivableRegId,
            transferFeeType: this.addTransferFeeForm.cutType,
            currency: this.addTransferFeeForm.currency,
            transferFee: this.addTransferFeeForm.transferFee,
          }
          addTransferFee(data).then((res) => {
            this.$msgSucClose(this.$t('Collect.addSuc'))
            this.getData()
            this.addTransferFeeVisible = false
          })
        }
      })
    },
    handleExceed(files, fileList) {
      this.$message.warning(this.$t('Hedge.onlyTips'))
    },
    fileChange(file) {
      this.file = file.raw
    },
    openUploadFile(api) {
      this.fileList = []
      if (api === 'uploadBankseqFile') {
        this.uploadFileTitle = this.$t('Collect.uploadBill')
      } else if (api === 'uploadPayBankseqFile') {
        this.uploadFileTitle = this.$t('Collect.uploadSheets')
      }
      this.uploadFileApi = `/fin/receivableReg/${api}`
      this.uploadParams = { receivableRegId: this.receivableRegId }
      this.showUploadFile = true
    },
    sendResFileList(val) {
      console.log(val)
    },
    closeUpload() {
      this.showUploadFile = false
      // this.getData()
    },
    // 本地上传显示
    sendResUpload(data) {
      let { filePath, name, fileNo } = data.data
      if (data.uploadTitle === this.$t('Collect.uploadSheets')) {
        Object.assign(this.regWriteoffInfo, { payBankseqFilePath: filePath, payBankseqFileName: name, payBankseqFileNo: fileNo })
      }
      if (data.uploadTitle === this.$t('Collect.uploadBill')) {
        Object.assign(this.regWriteoffInfo, { bankseqFilePath: filePath, bankseqFileName: name, bankseqFileCode: fileNo })
      }
    },
    importFeesAction() {
      if (this.multipleSelection2.length === 0) {
        return this.$msgErrClose(this.$t('Charge.importfees'))
      }
      this.option9.data = this.multipleSelection2.map((item) => item)
      const data = {
        invoiceReceivableIds: this.multipleSelection2.map((item) => item.invoiceReceivableId),
        currency: this.exchangeCurrency,
      }
      invoiceReceivableFeeList(data).then((res) => {
        this.option1.data = res.data.map((item) => {
          item.writeoffFeeAmt = ''
          item.lessPayAmt = ''
          return Object.assign({}, item, {
            writeoffCurrency: this.exchangeCurrency,
            writeoffFeeAmt: 0,
            lessPayAmt: 0,
            edit: true,
          })
        })
        this.viaWriteoffCurrencySetRate() // 重新计算汇率
        if (res.data.length) {
          this.$msgSucClose(this.$t('Charge.importfeesSuc'))
        }
        // 关闭弹窗
        this.closeRelevanceOpne()
      })
    },
    importFeesAction2() {
      if (this.multipleSelection3.length === 0) {
        return this.$msgErrClose(this.$t('PreClose.billingsta'))
      }
      let confirmNos = this.multipleSelection3.filter((v) => v.confirmStatus === 'no').map((v) => v.settleOrderNo)
      if (confirmNos.length) {
        return this.$msgErrClose(this.$t('Charge.notconfirmed',{confirmNos:confirmNos.toString()}), 5000)
      }
      const data = {
        currency: this.exchangeCurrency,
        settleOrderIds: this.multipleSelection3.map((item) => item.settleOrderId),
      }
      getWriteoffFeeList(data).then((res) => {
        this.option1.data = res.data.map((item) => {
          item.writeoffFeeAmt = ''
          item.lessPayAmt = ''
          return Object.assign({}, item, {
            writeoffCurrency: this.exchangeCurrency,
            writeoffFeeAmt: 0,
            lessPayAmt: 0,
            edit: true,
          })
        })
        this.viaWriteoffCurrencySetRate() // 重新计算汇率
        this.$msgSucClose(this.$t('Charge.importfeesSuc'))
        this.writeoffFeeAmtData()
        this.closeRelevanceOpne2()
        // this.relevanceOpne2 = false
      })
    },
    importFeesAction3() {
      if (this.multipleSelection7.length === 0) {
        return this.$msgErrClose(this.$t('Charge.beimported'))
      }
      // let confirmNos = this.multipleSelection7.filter((v) => v.confirmStatus === 'no').map((v) => v.orderNo)
      // if (confirmNos.length) {
      //   return this.$msgErrClose(`单号${confirmNos.toString()}未确认，请选择已确认的项进行操作`, 5000)
      // }
      const settleOrderFeeIdArr = this.option1.data.map((item) => item.settleOrderFeeId)
      this.multipleSelection7.forEach((item) => {
        if (!settleOrderFeeIdArr.includes(item.settleOrderFeeId)) {
          const data = Object.assign({}, item, {
            writeoffCurrency: this.exchangeCurrency,
            writeoffFeeAmt: 0,
            lessPayAmt: 0,
            edit: true,
          })
          this.option1.data.push(data)
        }
      })
      this.viaWriteoffCurrencySetRate() // 重新计算汇率
      this.$msgSucClose(this.$t('Charge.importfeesSuc'))
      this.writeoffFeeAmtData()
      this.closeWriteoffFee()
    },
    importFeesAction4() {
      const unitList = this.$refs.tree.getCheckedNodes() || []
      unitList.push(...this.relationList)
      if (!unitList.length) {
        return this.$msgErrClose(this.$t('Charge.commission'))
      }
      // 重新选择关联结算单位清空费用列表
      this.option1.data = []
      const corpCodeList = JSON.parse(JSON.stringify(this.regWriteoffInfo.refSettleUnitList || []))
      this.option5.data = corpCodeList.map((item) => Object.assign(item, { fileType: 'bankseq_file' }))
      clearData(SETTLECROPLIST)
      SETTLECROPLIST.push({ label: this.regWriteoffInfo.settleCorpName, value: this.regWriteoffInfo.settleCorpCode })
      // 添加关联结算单位
      const settleCorpCodeArr = this.option5.data.map((item) => item.settleCorpCode)
      unitList.forEach((item) => {
        if (!settleCorpCodeArr.includes(item.settleCorpCode)) {
          const custid = item.custid
          const common = {
            settleCorpCode: item.settleCorpCode,
            settleCorpName: item.settleCorpName,
            relationType: item.relationType,
            // refRelation: '',
            fileType: 'proxy_file',
          }
          if (!item.attachments) {
            let { fileName, fileNo, startTime, stopTime } = item
            this.option5.data.push({ ...common, fileName, fileNo, startTime, stopTime })
            return
          }
          const refRelation = item.attachments.filter((item) => {
            return item.relCustid == this.refSettleUnitCustid && item.custid == custid
          })
          if (refRelation.length) {
            let { fileNo, name: fileName, startTime, stopTime } = refRelation[0]
            this.option5.data.push({ ...common, fileName, fileNo, startTime, stopTime })
          } else {
            this.option5.data.push({ ...common, fileName: '', fileNo: '', startTime: '', stopTime: '' })
          }
        }
      })
      // 关闭弹窗
      this.closeRefSettleUnit()
      // 添加结算单位
      this.option5.data.forEach((item) => {
        if (SETTLECROPLIST.find((v) => v.value === item.settleCorpCode)) return
        SETTLECROPLIST.push({ label: item.settleCorpName, value: item.settleCorpCode })
      })
    },
    closeRefSettleUnit() {
      this.refSettleUnitDialog = false
    },
    // TODO 计算费用列表核销金额
    // 带默认值核销金额
    writeoffFeeAmtData(refresh) {
      console.log('计算1·····', this.isRewriteoff)
      // isRewriteoff 0 重新核销， 1 请求当天汇率完成， 2 已跳过汇率请求后的首次费用列表计算
      if (this.isRewriteoff === 0) {
        return
      } else if (this.isRewriteoff === 1) {
        return setTimeout(() => {
          this.isRewriteoff = 2
        }, 800)
      }
      this.isRewriteoff = undefined
      console.log('计算2·····')
      const data = []
      const list = this.option1.data
      let writeoffCurrency = this.regWriteoffInfo.writeoffCurrency
      let currencySame = list.every((v) => v.currency === writeoffCurrency)
      let totalAmt = (currencySame ? this.regWriteoffInfo.writeoffBalance : this.exchangeAmt) || 0
      list.forEach((item, index) => {
        if (totalAmt < 0) {
          if (refresh) {
            this.$set(item, 'writeoffFeeAmt', '')
          } else {
            item.writeoffFeeAmt = item.writeoffFeeAmt > 0 ? item.writeoffFeeAmt : ''
          }
          return
        }
        // const noWriteoffAmt = Number(item.writeoffFeeAmt || item.noWriteoffAmt) || 0
        // 更改总收款金额时，以未核销金额为主
        // const noWriteoffAmt = Number(item.writeoffFeeAmt || item.writeoffBalanceAmt) || 0
        const noWriteoffAmt = Number(refresh ? item.writeoffBalanceAmt : item.writeoffFeeAmt || item.writeoffBalanceAmt) || 0
        const writeoffExRate = currencySame ? 1 : Number(item.writeoffExRate) || 1
        const writeoffAmt = new LSnum(noWriteoffAmt).times(writeoffExRate).toNum(2) // 核销金额
        if (writeoffAmt > totalAmt) {
          // 原币核销金额 = 核销汇率/汇率
          data.push(new LSnum(totalAmt).div(writeoffExRate).toNum(2))
          if (refresh) {
            item.writeoffFeeAmt = new LSnum(totalAmt).div(writeoffExRate).toNum(2)
          } else {
            item.writeoffFeeAmt = item.writeoffFeeAmt > 0 ? item.writeoffFeeAmt : new LSnum(totalAmt).div(writeoffExRate).toNum(2)
          }
          totalAmt = 0
        } else {
          data.push(noWriteoffAmt)
          if (refresh) {
            item.writeoffFeeAmt = noWriteoffAmt
          } else {
            item.writeoffFeeAmt = item.writeoffFeeAmt > 0 ? item.writeoffFeeAmt : noWriteoffAmt
          }
          totalAmt = new LSnum(totalAmt).minus(writeoffAmt).toNum(2)
          // item.writeoffFeeAmt = item.writeoffFeeAmt > 0 ? item.writeoffFeeAmt : noWriteoffAmt
        }
      })
      this.$forceUpdate()
      // 重新赋值会取消选中，修改核销汇率后赋值需要记录选中的数据进行赋值，改为$forceUpdate()
      // this.option1.data = list.map((item, index) => ({
      //   ...item,
      //   writeoffFeeAmt: item.writeoffFeeAmt > 0 ? item.writeoffFeeAmt : data[index],
      // }))
      console.log(data)
      // console.log(list)
    },
    // 关联结算单核销
    handleSettleOrderFeeList() {
      this.regUpdate(() => {
        if (this.regWriteoffInfo.writeoffCurrency !== this.exchangeCurrency && !this.exchangeAmt) {
          return this.$msgErrClose(this.$t('PreClose.filledin'))
        }
        this.feeSource = 'settle_order'
        this.option3.data.currency = this.regWriteoffInfo.writeoffCurrency
        this.getSettleOrderList()
      })
    },
    getSettleOrderList() {
      const data = {
        writeoffRecvSource: 'receivable_reg',
        receivableRegId: this.regWriteoffInfo.receivableRegId,
        settleCorpCode: '',
        currency: this.exchangeCurrency,
      }
      this.convertData(this.searchOption2, data)
      const arr = [this.regWriteoffInfo.settleCorpCode]
      if (this.option5.data.length) {
        this.option5.data.forEach((item) => {
          if (item.relationType !== 'temporary') {
            arr.push(item.settleCorpCode)
          }
        })
      }
      data.refSettleCorpCodeList = arr
      if (this.option9.data.length) {
        data.invoiceReceivableIds = this.option9.data.map((item) => item.invoiceReceivableId)
      }
      settleOrderList(data).then((res) => {
        this.option3.data = res.data
        this.relevanceOpne2 = true
        // 勾选结算单
        const settleOrderIds = this.option1.data.map((item) => item.settleOrderId)
        this.$nextTick(() => {
          this.option3.data.forEach((item) => {
            if (settleOrderIds.includes(item.settleOrderId)) {
              this.$refs.multipleTable3.setCheckRow(item, true)
            }
          })
        })
      })
    },
    // 关联发票核销
    handleRelevanceOpen() {
      this.regUpdate(() => {
        if (this.regWriteoffInfo.writeoffCurrency !== this.exchangeCurrency && !this.exchangeAmt) {
          return this.$msgErrClose(this.$t('PreClose.filledin'))
        }
        this.feeSource = 'invoice'
        this.searchOption1.columns[0].placeholder = this.regWriteoffInfo.settleCorpName
        this.getInvoiceList()
      })
    },
    getInvoiceList() {
      const data = {
        // "settleCorpCode": this.regWriteoffInfo.settleCorpCode,
        // "settleCompCode": this.regWriteoffInfo.recvCompCode,
        writeoffRecvSource: 'receivable_reg',
        receivableRegId: this.regWriteoffInfo.receivableRegId,
        currency: this.exchangeCurrency,
      }
      this.convertData(this.searchOption1.data, data)
      listInvoiceReceivable(data).then((res) => {
        this.option2.data = res.data
        this.relevanceOpne = true
        // 勾选发票
        const invoiceReceivableIds = this.option9.data.map((item) => item.invoiceReceivableId)
        this.$nextTick(() => {
          this.option2.data.forEach((item) => {
            if (invoiceReceivableIds.includes(item.invoiceReceivableId)) {
              this.$refs.multipleTable2.setCheckRow(item, true)
            }
          })
        })
      })
    },
    handleDelete($index, row, option) {
      this.$confirmWarn(this.$t('Settle.confirmWarn'), () => this.option1.data.splice($index, 1))
    },
    cancel(refresh) {
      this.routerBackReset ? this.routerPush('RegWriteoff') : this.routerBack(refresh)
    },
    search(data) {
      data.settleOrderNo !== undefined ? this.getSettleOrderList() : this.getInvoiceList()
    },
    sendMulti(data, option) {
      console.log(this.multipleSelection1)
      if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option2) this.multipleSelection2 = data
      if (option === this.option3) this.multipleSelection3 = data
      if (option === this.option7) this.multipleSelection7 = data
    },
    // 跳转至详情页
    showDetail(row) {
      if (!row.sourceBizNo && !row.feeSourceType) {
        return this.$message.error(this.$t('PreClose.jobNoTips'))
      }
      this.showOneNoDetail('sourceBizNo', row.sourceBizNo)
    },
    // 一键修改汇率
    changeRate() {
      const len = this.multipleSelection1.length
      if (!len) {
        return this.$msgErrClose(this.$t('PreClose.modifying'))
      }
      const data = []
      const len2 = this.regWriteoffInfo.exchangeRates.length
      this.multipleSelection1.forEach((item) => {
        for (let i = 0; i < len2; i++) {
          const ele = this.regWriteoffInfo.exchangeRates[i]
          if (item.currency === ele.srcCurrency && item.settleCurrency === ele.toCurrency) {
            if (!data.includes(ele)) {
              ele.settlementRate = item.writeoffExRate
              data.push(ele)
            }
            break
          }
        }
      })
      this.option6.data = JSON.parse(JSON.stringify(data))
      this.rateDiaologOpen = true
    },
    // 提交汇率
    submitRate() {
      const len = this.option6.data.length
      if (!len) {
        return this.$msgErrClose(this.$t('PreClose.modifiable'))
      }
      // 复杂，暂时去掉，由后端验证
      // let error = false
      // for (let i = 0; i < len; i++) {
      //   const item = this.option6.data[i]
      //   if (item.settlementRate < item.lowerRate) {
      //     this.$msgErrClose(`${item.srcCurrency}-${item.toCurrency}的汇率不能低于汇率下限${item.lowerRate}`)
      //     error = true
      //     break
      //   }
      //   if (item.settlementRate > item.upperRate) {
      //     this.$msgErrClose(`${item.srcCurrency}-${item.toCurrency}的汇率不能高于汇率上限${item.upperRate}`)
      //     error = true
      //     break
      //   }
      // }
      // if (error) {
      //   return false
      // }
      this.changeMultipleRate()
    },
    // 修改费用列表汇率
    changeMultipleRate() {
      const len = this.option6.data.length
      this.multipleSelection1.forEach((item) => {
        for (let index = 0; index < len; index++) {
          const ele = this.option6.data[index]
          if (item.currency === ele.srcCurrency && item.settleCurrency === ele.toCurrency) {
            item.writeoffExRate = ele.settlementRate
            item.writeoffAmt = new LSnum(item.writeoffFeeAmt).times(item.writeoffExRate || 1).toNum(2)
            break
          }
        }
      })
      this.regWriteoffInfo.exchangeRates.forEach((item) => {
        for (let index = 0; index < len; index++) {
          const ele = this.option6.data[index]
          if (item.srcCurrency === ele.srcCurrency && item.toCurrency === ele.toCurrency) {
            item.settlementRate = ele.settlementRate
            break
          }
        }
      })
      this.closeRateDialog()
    },
    // 关闭汇率弹窗
    closeRateDialog() {
      this.rateDiaologOpen = false
    },
    // 关联委托结算单位
    handleSettleCrop() {
      this.regUpdate(() => {
        this.defaultChecked = []
        this.getRefSettleUnitList()
      })
    },
    // 费用代码下拉列表自动补充的数据
    feeItemQuerySearch(queryString, item) {
      baseFeeItemList(queryString).then((response) => {
        item.remoteSelectList = response.data.map((item) => ({ label: item.feeName, value: item.feeCode }))
      })
    },
    // 搜索的内容赋值给参数
    convertData(obj, data) {
      if (obj.addFilter) {
        let { searchInputGroup, filterGroups } = obj.addFilter
        searchInputGroup.forEach((item) => {
          if (!item.key) return
          if (typeof item.value === 'string') {
            data[item.key] = item.value.trim()
          } else if (item.key === 'createdTime') {
            if (item.value && item.value.length) {
              data.createdTimeStart = item.value[0] + ' 00:00:00'
              data.createdTimeEnd = item.value[1] + ' 23:59:59'
            } else {
              data.createdTimeStart = ''
              data.createdTimeEnd = ''
            }
          } else {
            data[item.key] = ''
          }
        })
        return
      }
      const keys = Object.keys(obj)
      keys.forEach((key) => {
        const value = obj[key]
        if (value && value !== '') {
          data[key] = value
        }
      })
    },
    // 获取费用列表
    settleOrderFeeList() {
      this.regUpdate(() => {
        if (this.regWriteoffInfo.writeoffCurrency !== this.exchangeCurrency && !this.exchangeAmt) {
          return this.$msgErrClose(this.$t('PreClose.filledin'))
        }
        const data = {
          writeoffRecvSource: 'receivable_reg',
          receivableRegId: this.regWriteoffInfo.receivableRegId,
          settleCorpCode: '',
          currency: this.exchangeCurrency,
        }
        this.convertData(this.searchOption3, data)
        const arr = [this.regWriteoffInfo.settleCorpCode]
        if (this.option5.data.length) {
          this.option5.data.forEach((item) => {
            if (item.relationType !== 'temporary') {
              arr.push(item.settleCorpCode)
            }
          })
        }
        data.refSettleCorpCodeList = arr
        if (this.option9.data.length) {
          data.invoiceReceivableIds = this.option9.data.map((item) => item.invoiceReceivableId)
        }
        settleOrderFeeList(data).then((res) => {
          this.option7.data = res.data
          this.writeoffFeeDialog = true
          // 勾选费用
          const feeIds = this.option1.data.map((item) => item.feeId)
          this.$nextTick(() => {
            this.option7.data.forEach((item) => {
              if (feeIds.includes(item.feeId)) {
                this.$refs.multipleTable7.setCheckRow(item, true)
              }
            })
          })
        })
      })
    },
    // 关联委托结算单位列表
    getRefSettleUnitList() {
      const data = {
        writeoffRecvSource: 'receivable_reg',
        receivableRegId: this.regWriteoffInfo.receivableRegId,
      }
      getRefSettleUnitList(data)
        .then((res) => {
          if (!res.data.length) {
            return this.$msgErrClose(this.$t('PreClose.norelevant'))
          }
          this.refSettleUnitCustid = res.data[0].custid || ''
          this.refSettleUnitList = res.data.map((item) => item.custStructDto)
          this.fliterSettle(this.refSettleUnitList)
          this.refSettleUnitList2 = res.data[0].custRelations
          let optionData = this.option5.data.map((item) => item.settleCorpCode)
          this.relationList = optionData
            .map((item) => this.refSettleUnitList2.find((v) => v.settleCorpCode === item))
            .filter((v) => v)
          this.refSettleUnitDialog = true
        })
        .catch(() => {})
    },
    // 关联单位不能选自己
    fliterSettle(data) {
      const settleCorpCodeList = this.option5.data.map((item) => item.settleCorpCode)
      data.forEach((item) => {
        if (item.settleCorpCode === this.regWriteoffInfo.settleCorpCode) {
          item.disabled = true
        }
        if (settleCorpCodeList.includes(item.settleCorpCode)) {
          this.defaultChecked.push(item.custid)
        }
        if (item.childs.length) {
          this.fliterSettle(item.childs)
        }
      })
    },
    // 删除发票并删除关联费用列表
    delInvoiceReceivable(row, $index) {
      this.option9.data.splice($index, 1)
      let invoiceReceivableIdArr = this.option9.data.map((item) => String(item.invoiceReceivableId))
      this.option1.data = this.option1.data.filter((item) => {
        let ids = item.invoiceReceivableId.split(',')
        let sta = ids.some((ele) => invoiceReceivableIdArr.includes(ele))
        return sta
      })
    },
    // 增加手续费
    addFee() {
      let isFalse
      this.option4.data.forEach((row) => {
        if (!this.validateMoney(row.amt, { positive: true })) {
          isFalse = true
          return this.$msgErrClose(this.$t('PreClose.feeamountTips'))
        }
        if (!row.amt && row.amt !== 0) {
          isFalse = true
          return this.$msgErrClose(this.$t('PreClose.handlingfee'))
        }
        if (row.amt > 10000000) {
          isFalse = true
          return this.$msgErrClose(this.$t('PreClose.notsupported', {amt: row.amt}))
        }
        if (!row.currency) {
          isFalse = true
          return this.$msgErrClose(this.$t('PreClose.feecurrency'))
        }
        if (!row.cutType) {
          isFalse = true
          return this.$msgErrClose(this.$t('PreClose.inwardTips'))
        }
      })
      if (isFalse) return
      // if (!this.isConfirm) {
      this.forEachSave()
      // }
      const currency = this.regWriteoffInfo.currency
      this.$refs.feeTableOption.showData = true
      this.option4.data.push({
        cutType: 'inter_cut',
        currency: currency,
        amt: '',
        allotAmt: '',
        hasAllotAmt: 0,
        edit: true,
        isAdd: true,
      })
    },
    // 更多汇率
    showExchangeRates() {
      this.exchangeRatesDialog = true
    },
    // 关闭发票核销 // 清空搜索值
    closeRelevanceOpne() {
      this.relevanceOpne = false
      const obj = this.searchOption1.data
      Object.keys(obj).forEach((key) => (obj[key] = ''))
    },
    // 关闭结算单核销 // 清空搜索值
    closeRelevanceOpne2() {
      this.relevanceOpne2 = false

      let { searchInputGroup } = this.searchOption2.addFilter
      searchInputGroup.forEach((item) => {
        if (!item.key) return
        item.value = ''
      })
      // const obj = this.searchOption2.data
      // Object.keys(obj).forEach((key) => (obj[key] = ''))
    },
    // 关闭费用列表 // 清空搜索值
    closeWriteoffFee() {
      this.writeoffFeeDialog = false
      let { searchInputGroup } = this.searchOption3.addFilter
      searchInputGroup.forEach((item) => {
        if (!item.key) return
        item.value = ''
      })
      // const obj = this.searchOption3.data
      // Object.keys(obj).forEach((key) => (obj[key] = ''))
    },
    // 转大掌柜余额
    transferDzg() {
      if (this.regWriteoffInfo.writeoffCurrency !== this.exchangeCurrency) {
        return this.$msgErrClose(this.$t('PreClose.simultaneous'))
      }
      if (this.regWriteoffInfo.unusedAmt > 0) {
        const len = this.option11.data.length
        let totalDzg = 0
        if (len) {
          this.transferOption.data = this.option11.data.map((item) => Object.assign({}, item, { edit: true }))
          // totalDzg = this.option11.data.reduce((pre, cur) => (pre += Number(cur.internalDzgAmt)), 0)
          totalDzg = this.option11.data.reduce((pre, cur) => pre.plus(cur.internalDzgAmt), BIGZERO).valueOf()
        } else {
          this.transferOption.data = [{ dzgCompCode: '', internalDzgAmt: '', dzgWriteoffNo: '', edit: true }]
        }
        // this.transferOption.unusedAmt = (Number(this.regWriteoffInfo.unusedAmt) + totalDzg).toFixed(2)
        // this.transferOption.unusedAmt = decimalFixed2(new LSnum(this.regWriteoffInfo.unusedAmt).plus(totalDzg).valueOf())
        this.transferOption.show = true
      } else {
        return this.$msgErrClose(this.$t('PreClose.unused'))
      }
    },
    // 转移大掌柜
    submitTransfer(data, total) {
      // 核销总金额
      const writeoffAmt = this.getWriteoffAmt()
      if (total > new LSnum(this.regWriteoffInfo.writeoffBalance).minus(writeoffAmt).num) {
        return this.$msgErrClose(this.$t('Charge.unusedamount'))
      }
      this.option11.data = data.map((item) =>
        Object.assign({}, item, {
          currency: this.regWriteoffInfo.currency,
          dzgCompName: this.dictMapObj.dzgCompCode[item.dzgCompCode.toLowerCase()],
          edit: false,
        })
      )
      this.regWriteoffInfo.unusedAmt = new LSnum(this.regWriteoffInfo.writeoffBalance).minus(writeoffAmt).minus(total).toNum(2)

      this.closeTransfer()
    },
    closeTransfer() {
      this.transferOption.show = false
    },
    // 添加内扣手续费联动可核销金额及剩余未用金额 ;  row 用于删除的费用; type 'edit'编辑  'add'新增
    computedMoney(row, type) {
      const writeoffAmt = this.getWriteoffAmt()
      if (row.cutType === 'inter_cut') {
        let writeoffBalance = this.regWriteoffInfo.writeoffBalance
        if (!type) {
          this.regWriteoffInfo.writeoffBalance = new LSnum(writeoffBalance).minus(row.amt).toNum(2)
        } else if (type === 'add') {
          this.regWriteoffInfo.writeoffBalance = new LSnum(writeoffBalance).plus(row.amt).toNum(2)
        } else if (type === 'edit') {
          this.regWriteoffInfo.writeoffBalance = new LSnum(writeoffBalance).plus(row.amt).minus(row.oldAmt).toNum(2)
        }
      }
      // console.log(row, arr)
      if (this.regWriteoffInfo.currency == this.exchangeCurrency) {
        this.exchangeAmt = this.regWriteoffInfo.writeoffBalance
      }
      let dzgAmt = this.option11.data.reduce((pre, cur) => pre.plus(cur.internalDzgAmt), BIGZERO).toNum(2)
      this.regWriteoffInfo.unusedAmt = new LSnum(this.regWriteoffInfo.writeoffBalance).minus(writeoffAmt).minus(dzgAmt).toNum(2)
    },
    // 监听click事件，切换银行手续费的可编辑状态
    listenClick() {
      // if (!this.isConfirm) return
      if (this.checkAuth(this.$route.name, 'btn-addFee')) this.option4.edit = true
    },
    saveDzg(e) {
      // if (!this.isConfirm) {
      console.log('tableclic, ```````````````')
      this.forEachSave()
      //   return
      // }
      this.option4.edit = false
      let list = this.option11.data.filter((item) => item.edit)
      let writeoffBalance = this.regWriteoffInfo.writeoffBalance
      if (list.length > 0) {
        // 总金额验证
        const total = this.option11.data.reduce((pre, cur) => pre.plus(cur.internalDzgAmt), BIGZERO).toNum(2)
        // 核销总金额
        const writeoffAmt = this.getWriteoffAmt()
        console.log(writeoffBalance, ',', total, ',', writeoffAmt, ',')
        if (total > new LSnum(writeoffBalance).minus(writeoffAmt).num) {
          return this.$msgErrClose(this.$t('Charge.unusedamount'))
        } else {
          this.option11.data.forEach((item) => (item.edit = false))
          this.regWriteoffInfo.unusedAmt = new LSnum(writeoffBalance).minus(total).minus(writeoffAmt).toNum(2)
        }
      }
    },
    // 分摊手续费
    closeFee() {
      this.transferFeeOption.show = false
      let { params, query } = this.transferFeeOption.routerData
      // 直接刷新当前页，比利用路由控制刷新简便
      this.getData()
      this.routerPush('WriteoffRecvDetail2', query, false, params)
    },
    // TODO 修改折币币种
    changeExchangeCurrency(val) {
      // 清空折币汇率
      this.rateInterval = ''
      // 清空费用列表
      this.option1.data = []
      // 清空发票列表
      this.option9.data = []
      // 清空折币可核销金额 之前的记录
      this.oldExchangeAmt = ''
      if (val !== this.regWriteoffInfo.writeoffCurrency) {
        this.exchangeAmt = ''
        let source = this.exchageRateList.filter((item) => {
          return item.toCurrency === this.exchangeCurrency && item.srcCurrency === this.regWriteoffInfo.writeoffCurrency
        })
        console.log(source)
        if (source.length) {
          this.exchangeRateSource = source[0]
          this.exchangeRate = source[0].rate
        }
      } else {
        this.exchangeAmt = this.regWriteoffInfo.writeoffBalance
        this.exchangeRate = 1
      }
      this.writeoffFeeAmtData()
    },
    // 修改折币金额
    checkExchangeAmt(isForce) {
      if (this.exchangeAmt) {
        if (isNaN(this.exchangeAmt)) return (this.oldExchangeAmt = this.exchangeAmt = this.rateInterval = '')
        this.exchangeAmt = decimalFixed2(this.exchangeAmt)
        if (this.oldExchangeAmt == this.exchangeAmt && isForce !== true) {
          return
        }
        this.oldExchangeAmt = this.exchangeAmt
        this.rateInterval = (+new LSnum(this.exchangeAmt).div(this.regWriteoffInfo.writeoffBalance).valueOf()).toFixed(6)
        let { lowerRate, upperRate } = this.exchangeRateSource
        if (this.rateInterval < lowerRate || this.rateInterval > upperRate) {
          this.$msgErrClose(
            `折币核销${this.regWriteoffInfo.writeoffCurrency}-${this.exchangeCurrency}汇率${this.rateInterval}不在${lowerRate} - ${upperRate}内`
          )
          this.oldExchangeAmt = this.exchangeAmt = this.rateInterval = ''
          return
        }
      } else {
        this.oldExchangeAmt = this.rateInterval = ''
      }
      this.writeoffFeeAmtData()
    },
    jumpToRoute(data) {
      this.routerPush(data.name, data.query, false, data.params)
    },
    writeoffAction(params, item) {
      this.regUpdate(() => {
        if (this.regWriteoffInfo.realAmt - 0 <= 0) {
          return this.$msgErrClose(this.$t('PreClose.greaterth'))
        }
        if (this.regWriteoffInfo.writeoffCurrency !== this.exchangeCurrency && !this.exchangeAmt) {
          return this.$msgErrClose(this.$t('PreClose.discountcurTips'))
        }
        if (!this.regWriteoffInfo.balanceDealType) {
          if (this.regWriteoffInfo.unusedAmt > 0) {
            return this.$msgErrClose(this.$t('PreClose.remaining'))
          }
        }
        const list = this.option4.data
        for (let i = 0; i < list.length; i++) {
          // 校验金额
          if (!this.validateMoney(list[i].allotAmt, { positive: false })) {
            return
          }
          if (list[i].allotAmt < 0) {
            return this.$msgErrClose(this.$t('PreClose.apportion'))
          }
        }
        if (this.regWriteoffInfo.unusedAmt < 0) {
          return this.$msgErrClose(this.$t('PreClose.availablewrite'))
        }
        let str = ''
        let feeCodeArr = [...new Set(this.option1.data.map((v) => v.feeCode))]
        if (feeCodeArr.length > 1 && feeCodeArr.includes('TZFY')) {
          return this.$msgErrClose(this.$t('PreClose.adjustmentTips'))
        }
        if (feeCodeArr[0] === 'TZFY') {
          str = this.$t('Settle.adjustmentTips')
        }
        if (this.regWriteoffInfo.noWriteoffHasInvoice == 'yes') {
          str = (str ? str + this.$t('Common.and') : '') + this.$t('Settle.reinvoicTips')
        }
        str += this.$t('Settle.registrationTips')
        this.$confirmWarn({ body: str, confirm: this.$t('Common.yes'), cancel: this.$t('Common.no') }, () => {
          this.checkRecvWriteoffOverduePayment(item)
        })
      })
    },
    checkRecvWriteoffOverduePayment(item) {
      checkRecvWriteoffOverduePayment({
        settleCompCode: this.regWriteoffInfo.recvCompCode,
        settleCorpCode: this.regWriteoffInfo.settleCorpCode,
        recviceDate: this.regWriteoffInfo.recvDate,
        feeIds: this.option1.data.map((v) => v.feeId),
      }).then((res) => {
        if (res.data) {
          this.$confirmWarn(res.data, () => this.writeoffSubmit(item))
        } else {
          this.writeoffSubmit(item)
        }
      })
    },
    writeoffSubmit(item) {
      item.loading = true
      const data = {
        receivableRegId: this.regWriteoffInfo.receivableRegId,
        lessPayAmt: this.regWriteoffInfo.lessPayAmt,
        // currency: this.regWriteoffInfo.writeoffCurrency,
        currency: this.exchangeCurrency,
        noWriteoffHasInvoice: this.regWriteoffInfo.noWriteoffHasInvoice,
        balanceDealType: this.regWriteoffInfo.balanceDealType,
        writeoffItemList: this.option1.data,
        transferFeeAllotList: this.option4.data.filter((item) => item.allotAmt > 0),
        feeSource: this.feeSource,
        invoiceReceivableIds: this.option9.data.map((item) => item.invoiceReceivableId),
        refSettleUnitList: this.option5.data || '',
        writeoffDate: this.regWriteoffInfo.writeoffDate,
        remark: this.regWriteoffInfo.writeoffRemark,
        writeoffReceipayTransferDzgList: this.option11.data || '',
        exchangeAmt: this.exchangeAmt,
        refRegWriteoff: this.isFromSettle ? 'yes' : '',
      }
      writeoffSubmit(data)
        .then((res) => {
          this.$msgSucClose(this.$t('Settle.writeoffSuc'))
          let { writeoffReceipayNo, writeoffReceipayId, receivableRegId, receivableRegNo } = res.data
          const params = { writeoffNo: writeoffReceipayNo }
          const query = { receivableRegId, writeoffReceipayId, source: 'writeoffRecv', back: 2 }
          // 显示分摊手续费
          const dzgList = res.data.writeoffReceipayTransferDzgList || []
          if (dzgList.length) {
            this.transferFeeOption.data = dzgList
            this.transferFeeOption.show = true
            // 保存跳转参数
            this.transferFeeOption.routerData = { params, query }
          } else {
            this.receivableRegId = receivableRegId
            this.receivableRegNo = receivableRegNo
            this.getData()
            this.routerPush('WriteoffRecvDetail2', query, false, params)
          }
        })
        .finally(() => (item.loading = false))
    },
    // 遍历手续费表格，保存编辑状态的行
    forEachSave(cb) {
      this.option4.data.forEach((row, $index) => {
        if (row.edit) {
          this.handleSave($index, row, true)
        }
      })
      cb && cb()
    },
    //保存一行手续费
    handleSave($index, row, forceSave) {
      forceSave = forceSave === true
      let timeStamp = +new Date()
      if (this._diyTimeStamp && timeStamp - this._diyTimeStamp < 1000 && !forceSave) {
        return
      }
      this._diyTimeStamp = timeStamp
      console.log($index)
      if (this.addIsPending && !forceSave) {
        console.log('addIsPending:', this.addIsPending)
        return
      }
      if (!this.validateMoney(row.amt, { positive: true })) {
        return forceSave ? '' : this.$msgErrClose(this.$t('Settle.handlingfee1'))
      }
      if (!row.amt) {
        return forceSave ? '' : this.$msgErrClose(this.$t('Settle.handlingfee2'))
      }
      if (row.amt > 10000000) {
        return forceSave ? '' : this.$msgErrClose(this.$t('Settle.handlingfee3', {amt: row.amt}))
      }
      if (!row.currency) {
        return forceSave ? '' : this.$msgErrClose(this.$t('Settle.handlingfee4'))
      }
      if (!row.cutType) {
        return forceSave ? '' : this.$msgErrClose(this.$t('Settle.handlingfee5'))
      }
      let data = {
        receivableRegId: this.receivableRegId,
        cutType: row.cutType,
        currency: row.currency,
        transferFee: row.amt,
      }
      if (row.transferFeeId) {
        data.transferFeeId = row.transferFeeId
      }
      if (this.routerBackReset || this.isConfirm) {
        this.computedMoney(row, 'edit')
        let item = this.option4.data[$index]
        item.edit = item.isAdd = false
        this.$set(this.option4.data, $index, { ...item, oldAmt: item.amt })
        this.addIsPending = this.delIsPending = false
        return
      }
      setTimeout(() => {
        if (this.delIsPending || this.addIsPending) return
        this.delIsPending = this.addIsPending = true
        addTransferFee(data)
          .then((res) => {
            this.debounceLs(() => this.$msgSucClose(this.$t('Settle.addSuc')))
            this.computedMoney(row, row.transferFeeId ? 'edit' : 'add')
            let item = this.option4.data[$index]
            item.edit = item.isAdd = false
            this.$set(this.option4.data, $index, {
              ...item,
              ...res.data,
              hasAllotAmt: res.data.hasAllotAmt || 0,
              oldAmt: item.amt,
            })
          })
          .finally(() => {
            setTimeout(() => (this.addIsPending = this.delIsPending = false))
          })
      }, 300)
    },
    //删除一行手续费
    handleDeleteServieFee($index, row, option) {
      if (this.addIsPending) {
        console.log('del addIsPending:', this.addIsPending)
        return
      }
      this.delIsPending = this.addIsPending = true
      this.$confirmWarn(
        this.$t('Settle.deletionFee'),
        () => {
          if (!row.transferFeeId || row.transferFeeId === '') {
            this.option4.data.splice($index, 1)
            this.computedMoney(row)
            this.delIsPending = this.addIsPending = false
          } else {
            deleteTransferFee({ transferFeeId: row.transferFeeId })
              .then(() => {
                this.$msgSucClose(this.$t('Settle.deleteSuc'))
                option.data.splice($index, 1)
                this.computedMoney(row)
              })
              .finally(() => {
                this.delIsPending = this.addIsPending = false
              })
          }
        },
        () => {
          this.delIsPending = this.addIsPending = false
        }
      )
    },
    // 重新核销时，收款币种可修改。 收款币种修改时，折币币种默认修改，折币币种不同的概率极小，特别是重新核销时更小
    regWriteoffInfoCurrencyChange(val) {
      this.regWriteoffInfo.exchangeRates = []
      this.regWriteoffInfo.writeoffCurrency = val
      this.clearRecInfo()
      this.clearPayInfo()
      this.clearPayOtherInfo()
      this.option4.data.forEach((item) => {
        item.amt = item.allotAmt = item.allotAmt = ''
        item.currency = val
      })
      this.exchangeCurrency = val
      this.changeExchangeCurrency(val)
      this.$forceUpdate()
      console.log(this.option4.data)
    },
    // 收款金额修改后
    checkRealAmt() {
      let inter_cut = 0
      this.option4.data.forEach((item) => {
        if (item.cutType === 'inter_cut') {
          inter_cut = new LSnum(inter_cut).plus(item.amt).toNum(2)
        }
      })
      console.log(this.regWriteoffInfo.realAmt, inter_cut)
      this.regWriteoffInfo.writeoffBalance = new LSnum(inter_cut).plus(this.regWriteoffInfo.realAmt).toNum(2)
      if (this.regWriteoffInfo.currency === this.exchangeCurrency) {
        this.exchangeAmt = this.regWriteoffInfo.writeoffBalance
      }
      this.writeoffFeeAmtData(true)
      setTimeout(() => {
        this.regWriteoffInfo.unusedAmt = new LSnum(this.regWriteoffInfo.writeoffBalance).minus(this.getWriteoffAmt()).toNum(2)
      }, 100)
      // this.$nextTick(() => {
      //   this.$refs.regWriteoffInfo.valid
      // })
    },
    // 更新收款登记
    regUpdate(cb) {
      if (!this.routerBackReset && !this.isConfirm) {
        return cb && cb()
      }
      this.$refs.regWriteoffInfoForm.validate((valid) => {
        if (!valid) return
        let arr = [
          'compBankAccountId',
          'currency',
          'realAmt',
          'recvDate',
          'payAccountName',
          'payBankName',
          'payAccountNo',
          'payAccountPublicType',
          'payAccountCountryCode',
          'payAccountSwiftCode',
          'payAccountBankCompAddr',
          'bankSeqNo',
          'settleMode',
        ]
        console.log(this._receivableRegBackup)
        console.log(this.regWriteoffInfo)
        let noChanged = arr.every((key) => {
          console.log(this._receivableRegBackup[key], this.regWriteoffInfo[key])
          return this._receivableRegBackup[key] == this.regWriteoffInfo[key]
        })
        let _list = this._innerTransferFeeList
        let list = this.option4.data
        if (_list.length != list.length) {
          noChanged = false
        } else {
          _list.forEach((_item, _index) => {
            let item = list[_index]
            if (_item.currency != item.currency || _item.amt != item.amt || _item.cutType != item.cutType) {
              noChanged = false
            }
          })
        }
        if (noChanged) {
          return cb && cb()
        }
        console.log(noChanged)
        let payAccountName = this.regWriteoffInfo.payAccountName
        // "exter_cut",inter_cut
        let transferFeeList = this.option4.data
          .filter((item) => item.currency && item.amt)
          .map((item) => ({ ...item, transferFee: item.amt }))
        let data = { ...this.regWriteoffInfo, payAccountName, confirmStatus: 'yes', transferFeeList }
        regUpdate(data).then((res) => {
          console.log('修改成功')
          this._receivableRegBackup = JSON.parse(JSON.stringify(this.regWriteoffInfo))
          this._innerTransferFeeList = JSON.parse(JSON.stringify(this.option4.data))
          // this.bankAccountSettleModeList = res.data..map((item) => {
          //   let dict = this.dictMap.bankAccountSettleMode
          //   return dict.find((v) => v.value === item)
          // })
          cb && cb()
        })
      })
      // return
      // console.log(this.option4.data)
    },
    //收款银行
    bankAccountList(accountShortName) {
      // 'regWriteoffInfo.recvWay'  chinese_mainland国内 hk_china香港 abroad海外 cheque支票 intrabranch内部往来
      let recvWay = this.regWriteoffInfo.recvWay
      let data = {
        unitCode: this.$store.state.user.userInfo.settleCompanyCode,
        currency: this.regWriteoffInfo.currency,
        accountShortName,
        status: 'effect',
        receipayType: 'receive',
        // hasChequeAcct: recvWay === 'cheque' ? 'yes' : '', // 是否支票账户
        countryOrgType: ['cheque', 'intrabranch'].includes(recvWay) ? '' : recvWay, // 区域
        hasIntrabranch: recvWay === 'intrabranch' ? 'yes' : 'no', // 是否内部往来
      }
      bankAccountList(data).then((res) => {
        let list = res.data || []
        let obj = this._bankAccountSelectOptions
        if (obj && !this.bankAccountSelectOptions.find((item) => item.settleUnitBankAcctId == obj.value)) {
          list.unshift({ ...this._bankAccountSelectOptions, settleUnitBankAcctId: obj.value, accountShortName: obj.label })
        }
        this._bankAccountSelectOptions = null
        this.bankAccountSelectOptions = list.map((item) => ({
          ...item,
          value: item.settleUnitBankAcctId,
          label: item.accountShortName,
        }))
        // let code = this.$store.state.user.userInfo.settleCompanyCode
        // console.log(
        //   this.bankAccountSelectOptions.map((item) => {
        //     return `${item.companyCode == code},${item.hasIntrabranch},${item.hasShare}`
        //   })
        // )
      })
    },
    // 搜索国家
    getCountryList(countryCode) {
      countrySelectList({ countryCode, state: 'valid' }).then((res) => {
        this.COUNTRYLIST = (res.data || []).map((item) => {
          return { cname: item.cname, ename: item.ename, value: item.countryCode }
        })
      })
    },
    // 选中国家
    selectCountry(countryCode) {
      if (!countryCode) return (this.regWriteoffInfo.payAccountCountryName = '')
      let find = this.COUNTRYLIST.find((item) => item.value === countryCode)
      this.regWriteoffInfo.payAccountCountryName = find.cname
    },
    // 清空收款账户
    clearRecInfo() {
      this.hasFixedTransferFee = false
      this.simpleDel()
      this.regWriteoffInfo.fixedTransferFee = ''
      this.regWriteoffInfo.compBankAccountId = ''
      this.regWriteoffInfo.accountNo = ''
      this.recvCompName = this.recvCompCode = this.hasIntrabranch = ''
      this.regWriteoffInfo.settleMode = ''
      this.bankAccountSettleModeList = []
    },
    // 清空付款账户
    clearPayInfo() {
      this.regWriteoffInfo.payAccountName = ''
      this.regWriteoffInfo.payAccountNo = ''
      this.regWriteoffInfo.payBankName = ''
    },
    // 清空付款账户其它信息
    clearPayOtherInfo() {
      this.selectedOptionItem1 = this.publicTypeDisabled = false
      this.oldAccountName = ''
      this.regWriteoffInfo.payAccountCountryCode =
        this.regWriteoffInfo.payAccountSwiftCode =
        this.regWriteoffInfo.payAccountBankCompAddr =
          ''
      this.regWriteoffInfo.payAccountPublicType = 'pub'
    },
    // 添加手续费接口逻辑
    simpleAdd(amt) {
      let arr = this.option4.data || []
      let item = arr.find((item) => item.cutType === 'fixed')
      let data = {
        currency: this.regWriteoffInfo.currency,
        cutType: 'fixed',
        amt,
        transferFee: amt,
        receivableRegId: this.regWriteoffInfo.receivableRegId,
        allotAmt: amt,
      }
      if (item) {
        data = { ...item, ...data }
      }

      if (item) {
        let index = arr.indexOf(item)
        this.$set(arr, index, { ...item })
      } else {
        arr.push({ ...data, hasAllotAmt: 0 })
      }
      // addTransferFee(data)
      //   .then((res) => {
      //     if (item) {
      //       let index = arr.indexOf(item)
      //       this.$set(arr, index, { ...item, ...res.data, hasAllotAmt: res.data.hasAllotAmt || 0 })
      //     } else {
      //       arr.push({ ...res.data, hasAllotAmt: res.data.hasAllotAmt || 0 })
      //     }
      //   })
      //   .catch((err) => this.$msgErrClose('定价手续费获取失败，请重新选择收款银行！'))
    },
    // 删除手续费接口逻辑
    simpleDel() {
      setTimeout(() => {
        if (!this.hasFixedTransferFee && !this.regWriteoffInfo.fixedTransferFee) {
          let arr = this.option4.data || []
          let item = arr.find((item) => item.cutType === 'fixed')
          if (!item) return
          let index = arr.indexOf(item)
          arr.splice(index, 1)
        }
      }, 1000)
      // deleteTransferFee({ transferFeeId: item.transferFeeId })
      //   .then(() => arr.splice(index, 1))
      //   .catch((err) => this.$msgErrClose('定价手续费调整失败，请重新选择收款银行！'))
    },
    exchangeCorpAssist() {
      this.$refs.corpFormAssist.validate((valid) => {
        if (!valid) return
        let { value: settleCorpCode, label: settleCorpName } = this.corpFormAssist.settleCorp
        updateSettleUnit({
          receivableRegId: this.regWriteoffInfo.receivableRegId,
          settleCorpCode,
          settleCorpName,
        }).then((res) => {
          this.$msgSucClose(this.$t('Collect.settlementTips'))
          this.regWriteoffInfo.settleCorpName = settleCorpName
          this.regWriteoffInfo.confirmStatus = 'yes'
          this.exchangeCorpDialogAssist = false
          this.init()
          this.getData()
        })
      })
    },
    settleCorpSelectRemoteAssist() {
      listSettleUnit({ receivableRegId: this.regWriteoffInfo.receivableRegId }).then((res) => {
        if (!res.data.length) {
          return this.$msgErrClose(this.$t('Collect.matchedTips'))
        }
        this.exchangeCorpDialogAssist = true
        this.settleCorpSelectListAssist = res.data.map((item) => ({ label: item.unitName, value: item.unitCode }))
      })
    },
    // 协助代收付分公司
    markAssistedComp() {
      this.exchangeCorpDialogAssist2 = true
      this.$nextTick(() => {
        this.settleCorpSelectListAssist2 = []
        this.corpFormAssist2.settleCorp = ''
        this.$nextTick(() => {
          this.$refs.corpFormAssist2.clearValidate()
        })
      })
    },
    exchangeCorpAssist2() {
      this.$refs.corpFormAssist2.validate((valid) => {
        if (!valid) return
        markAssistedComp({
          receivableRegId: this.regWriteoffInfo.receivableRegId,
          assistedCompCode: this.corpFormAssist2.settleCorp.value,
          assistedCompName: this.corpFormAssist2.settleCorp.label,
        }).then((res) => {
          this.$msgSucClose(this.$t('Collect.appointedTips'))
          this.exchangeCorpDialogAssist2 = false
          this.regWriteoffInfo.assistedCompName = this.corpFormAssist2.settleCorp.label
          this.regWriteoffInfo.assistedCompCode = this.corpFormAssist2.settleCorp.value
        })
      })
    },
    settleCorpSelectRemoteAssist2(queryString) {
      this.$store.dispatch('dict/querySettleUnit', { queryString, unitTypes: 'company' }).then((data) => {
        let code = this.$store.state.user.userInfo.settleCompanyCode
        this.settleCorpSelectListAssist2 = data
          .filter((v) => v.key !== code)
          .map((item) => ({ label: item.value, value: item.key }))
      })
    },
    // 核销前查询滞纳金情况
    queryLateFee() {
      if (this.regWriteoffInfo.recvDate && this.option1.data.length) {
        let fn = () => {
          let data = {
            receiveDate: this.regWriteoffInfo.recvDate,
            writeoffItemList: this.option1.data,
          }
          listBeforeWriteoff(data).then((res) => {
            this.option13.data = res.data || []
          })
        }
        this.debounceLs(fn)
      }
    },
  },
  activated() {
    
    if (this.$route.meta.close) return
    if (!this.$route.meta.isUseCache) {
      Object.assign(this.regWriteoffInfo, defaultCreateQuery)
      console.log(defaultCreateQuery)
      this.init()
      this.getData()
    }
  },
  deactivated() {
    clearData(SETTLECROPLIST)
    // this.exchangeCurrency = ''
    // this.exchangeAmt = ''
  },
  components: {
    FinanceTable,
    CustomColumns,
    FinanceSearch,
    FinanceUpload,
    // TransferDzg,
    TransferFee,
    ToggleTable,
    RegDetailInfo,
    RegSettleInfo,
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    // 利用状态判断 writeoffStatus === 'finish' 等同于 writeoffBalance == 0
    hasBalance() {
      return this.regWriteoffInfo.writeoffStatus !== 'finish'
    },
    // 收款登记是否已确认
    isConfirm() {
      return this.regWriteoffInfo.confirmStatus === 'yes'
    },
  },
  watch: {
    exchangeCorpDialogAssist(val, oldVal) {
      if (oldVal && !val) {
        this.$nextTick(() => {
          if (!this.regWriteoffInfo.settleCorpName) {
            this.delVisitedView()
            this.cancel()
          }
        })
      }
    },
    isConfirm(val) {
      this.rules = this.routerBackReset ? { ...this.backRules } : val ? { ...this.backRules } : {}
    },
    'option1.data': {
      handler(newVal, oldVal) {
        let writeoffBalance = this.regWriteoffInfo.writeoffBalance
        if (newVal && newVal.length === 0) {
          this.originalGather = this.exchangeGather = []
          // 大掌柜金额
          let totalDzg = 0
          if (this.option11.data.length) {
            totalDzg = this.option11.data.reduce((pre, cur) => pre.plus(cur.internalDzgAmt), BIGZERO).toNum(2)
          }
          this.regWriteoffInfo.unusedAmt = new LSnum(writeoffBalance).minus(totalDzg).toNum(2)

          return
        }
        clearTimeout(this.timer1)
        this.timer1 = setTimeout(() => {
          let option1List = this.option1.data
          option1List.forEach((item) => {
            //  核销金额输入框
            item.writeoffAmt = new LSnum(item.writeoffFeeAmt).times(item.writeoffExRate).toNum(2) // 联动折算金额
            // 短款金额
            // let writeoffAmt = new LSnum(item.noWriteoffAmt).plus(item.writeoffFeeAmt).toNum(2)
            let writeoffAmt = new LSnum(item.writeoffBalanceAmt).minus(item.writeoffFeeAmt).toNum(2)
            if (+item.lessPayAmt > 0 && +item.lessPayAmt > writeoffAmt) {
              // 单条费用的校验
              this.$msgErrClose(this.$t('Settle.shortfallTips'))
              item.lessPayAmt = ''
            } else if (+item.lessPayAmt < 0 && +item.lessPayAmt < writeoffAmt) {
              // 单条费用的校验
              this.$msgErrClose(this.$t('Settle.greaterTips'))
              item.lessPayAmt = ''
            }
          })
          // 大掌柜金额
          let totalDzg = 0
          if (this.option11.data.length) {
            totalDzg = this.option11.data.reduce((pre, cur) => pre.plus(cur.internalDzgAmt), BIGZERO).toNum(2)
          }
          let writeoffAmt = this.getWriteoffAmt(false, '', this.rateInterval || 1, 'div')
          console.log(writeoffAmt)
          let writeoffCurrency = this.regWriteoffInfo.writeoffCurrency
          let lessPayAmt = this.getWriteoffAmt(false, 'lessPayAmt', this.rateInterval || 1, 'div')
          // TODO 所有费用原币种与收款原币种一致时，不需考虑汇率
          if (option1List.every((v) => v.currency === writeoffCurrency)) {
            writeoffAmt = option1List.reduce((pre, cur) => pre.plus(cur.writeoffFeeAmt), BIGZERO).num
            lessPayAmt = option1List.reduce((pre, cur) => pre.plus(cur.lessPayAmt), BIGZERO).num
          }
          // TODO 所有费用原币种与收款原币种一
          this.regWriteoffInfo.lessPayAmt = lessPayAmt
          this.regWriteoffInfo.unusedAmt = new LSnum(writeoffBalance).minus(writeoffAmt).minus(totalDzg).toNum(2)
          this.queryLateFee()
          this.writeoffGatherChange()

          // }, 500)
        }, 0)
      },
      deep: true,
    },
    'regWriteoffInfo.recvDate': {
      handler(newVal) {
        this.queryLateFee()
      },
    },
    'regWriteoffInfo.exchangeRates': {
      // 当用户输入自定义核销汇率时，联动各个费用合计
      handler(newVal, oldVal) {
        if (++this.watchFormExchangeRatesTime === 1) return
        clearTimeout(this.timer2)
        this.timer2 = setTimeout(() => {
          if (this.settleExchageRateList.length > 0) {
            newVal.forEach((item, index) => {
              // 复杂，暂时去掉，由后端验证
              // if (item.lowerRate && item.settlementRate < item.lowerRate) {
              //   return this.$msgErrClose(`输入汇率不能低于汇率下限${item.lowerRate}!`)
              // }
              // if (item.upperRate && item.settlementRate > item.upperRate) {
              //   return this.$msgErrClose(`输入汇率不能高于汇率上限${item.upperRate}!`)
              // }
              this.settleExchageRateList[index].rate = Number(item.settlementRate)
            })
            this.rateChange()
            this.writeoffFeeAmtData()
          }
          // }, 800)
        }, 0)
      },
      deep: true,
    },
    'regWriteoffInfo.writeoffBalance'(val) {
      if (this.isFirst) {
        this.isFirst = false
        return
      }
      val && this.exchangeAmt && this.checkExchangeAmt(true)
    },
    'regWriteoffInfo.compBankAccountId': {
      handler(val) {
        // console.log('`````````````````````````````11111')
        // 未确认状态、已核销状态不能编辑
        if (!this.isConfirm || this.writeoffStatusBackup) return
        this.regWriteoffInfo.settleMode = ''
        if (val) {
          // console.log('`````````````````````````````2222')

          this.regWriteoffInfo.assistedCompName = this.regWriteoffInfo.assistedCompName || ''
          let find = this.bankAccountSelectOptions.find((item) => item.value == val)
          console.log('`````````find', find)
          if (find) {
            this.hasFixedTransferFee = find.hasFixedTransferFee === 'yes' && find.bankCode === 'B0249H231000001'
            if (this.hasFixedTransferFee) {
              getFixedTranferFeeList({ currency: this.regWriteoffInfo.currency }).then((res) => {
                this.regWriteoffInfo.fixedTransferFee = res.data[this.regWriteoffInfo.currency] || ''
                this.simpleAdd(res.data[this.regWriteoffInfo.currency])
              })
            } else {
              this.simpleDel()
              this.regWriteoffInfo.fixedTransferFee = ''
            }
            this.regWriteoffInfo.accountNo = find.accountNo
            this.regWriteoffInfo.hasIntrabranch == find.hasIntrabranch
            // this.regWriteoffInfo.hasShare == find.hasShare
            if (find.companyCode != this.$store.state.user.userInfo.settleCompanyCode) {
              console.log('`````````find.companyCode != this.$store.state.user.userInfo.settleCompanyCode')
              if (find.hasIntrabranch == 'no') {
                console.log('`````````find.hasIntrabranch no')
                // if (find.hasShare == 'yes') {
                //   console.log('`````````find.hasShare yes')
                this.regWriteoffInfo.recvCompName = find.companyName
                // console.log('`````````````````````````````3333')
                // 可以手动修改代收款分公司，所以切换账号的时候，不再自动修改，
                // this.regWriteoffInfo.assistedCompName =
                //   this.regWriteoffInfo.assistedCompName || this.$store.state.user.userInfo.settleCompanyName
                this.$msgWarnClose(this.$t('Collect.interBranch'), 5000)
                // } else {
                //   console.log('`````````find.hasShare no')
                //   this.regWriteoffInfo.recvCompName = this.$store.state.user.userInfo.settleCompanyName
                // }
              } else {
                console.log('`````````find.hasIntrabranch yes')
                this.regWriteoffInfo.recvCompName = this.$store.state.user.userInfo.settleCompanyName
              }
            } else {
              console.log('`````````find.companyCode == this.$store.state.user.userInfo.settleCompanyCode')
              this.regWriteoffInfo.recvCompName = find.companyName
            }
            this.bankAccountSettleModeList = find.settleMode.map((item) => {
              let dict = this.dictMap.bankAccountSettleMode
              return dict.find((v) => v.value === item)
            })
            this.regWriteoffInfo.settleMode = this.bankAccountSettleModeList[0] ? this.bankAccountSettleModeList[0].value : ''
          } else {
            this.simpleDel()
            this.hasFixedTransferFee = this.regWriteoffInfo.fixedTransferFee = ''
            if (this.regWriteoffInfo.recvCompCode != this.$store.state.user.userInfo.settleCompanyCode) {
              this.bankAccountSettleModeList = []
              // find 不存在说明是初始后数据
              if (this.regWriteoffInfo.hasIntrabranch == 'no') {
                console.log('`````````regWriteoffInfo.hasIntrabranch == no')
                // if (this.regWriteoffInfo.hasShare == 'yes') {
                //   console.log('`````````regWriteoffInfo.hasShare == yes')
                this._bankAccountSelectOptions = { label: this.regWriteoffInfo.accountShortName, value: val }
                // 可以手动修改代收款分公司，所以切换账号的时候，不再自动修改，
                // this.regWriteoffInfo.assistedCompName =
                //   this.regWriteoffInfo.assistedCompName || this.$store.state.user.userInfo.settleCompanyName
                this.$msgWarnClose(this.$t('Collect.interBranch'), 5000)
                // } else {
                //   console.log('`````````regWriteoffInfo.hasShare == no')
                //   // this.option1.data.splice(0, 10000)
                //   this.clearRecInfo()
                // }
              } else if (this.regWriteoffInfo.hasIntrabranch == 'yes') {
                console.log('`````````regWriteoffInfo.hasIntrabranch == yes')
                this.regWriteoffInfo.recvCompName = this.$store.state.user.userInfo.settleCompanyName
                // this._bankAccountSelectOptions = { label: this.regWriteoffInfo.accountShortName, value: val }
                // this.regWriteoffInfo.assistedCompName = this.$store.state.user.userInfo.settleCompanyName
                // this.$msgWarnClose('当前操作分公司与收款账户所属分公司不一致，将会生成分公司间代收款单', 5000)
              }
            }
          }
          // console.log(this.bankAccountSelectOptions)
          // console.log(val)
          // console.log(find)
          // // 普通 normal, 专项 special 坏账 bad_debt    代收付 agent 集团 group 集团专项 group_special
          // // hasIntrabranch: "no"
          // // hasShare: "no"
          // console.log(this.orderType, ['agent', 'group', 'group_special'].includes(this.orderType))
          // console.log(find.companyCode, this.$store.state.user.userInfo.settleCompanyCode, find.hasIntrabranch)
          // if (this.regWriteoffInfo.hasIntrabranch === 'yes') {
          //   this.recvCompName = this.$store.state.user.userInfo.settleCompanyName
          //   this.recvCompCode = this.$store.state.user.userInfo.settleCompanyCode
          // } else {
          //   this.recvCompName = find.companyName
          //   this.recvCompCode = find.companyCode
          // }
          // this.hasIntrabranch = find.hasIntrabranch
        } else {
          this.recvCompName = this.recvCompCode = this.hasIntrabranch = ''
          this.bankAccountSettleModeList = []
          this.simpleDel()
          this.hasFixedTransferFee = this.regWriteoffInfo.fixedTransferFee = ''
        }
      },
      immediate: true,
    },
    '$store.state.user.userInfo.settleCompanyCode'(val) {
      if (this.$route.name === 'WriteoffRecvDetail') {
        this.init()
        this.getData()
      }
      // this.option1.data.splice(0, 10000)
      // this.clearRecInfo()
      // this.clearPayInfo()
      // this.clearPayOtherInfo()
    },
    // 收款方式
    'regWriteoffInfo.recvWay': {
      handler(val, oldVal) {
        if (this.recvWayTimeout) clearTimeout(this.recvWayTimeout)
        this.recvWayTimeout = setTimeout(() => {
          if (this.rules.currency) {
            if (oldVal) {
              console.log('`!!!!!!!!!!!!!!!!!')
              this.regWriteoffInfo.compBankAccountId = this.regWriteoffInfo.accountNo = ''
            }
            if (this.rules && this.rules.settleMode) {
              if (val === 'intrabranch') {
                this.rules.settleMode.required = false
              } else {
                this.rules.settleMode.required = true
              }
            }
            //  chinese_mainland国内 hk_china香港 abroad海外 cheque支票 intrabranch内部往来
            // if (val === 'cheque') {
            //   this.rules.payAccountName.required = false
            //   this.rules.payAccountPublicType.required = false
            // } else {
            //   this.rules.payAccountName.required = true
            //   this.rules.payAccountPublicType.required = true
            // }
          }
        }, 300)
      },
      immediate: true,
    },
    // 账号结算方式
    'regWriteoffInfo.settleMode': {
      handler(val, oldVal) {
        if (this.rules.payAccountName) {
          if (val === 'cheque') {
            this.rules.payAccountName.required = false
            this.rules.payAccountPublicType.required = false
          } else {
            this.rules.payAccountName.required = true
            this.rules.payAccountPublicType.required = true
          }
        }
      },
    },
  },
}
</script>
<style lang="scss" scoped>
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
}
h3.title {
  font-size: 12px;
  font-weight: 600;
  color: #222222;
  line-height: 30px;
  padding-top: 4px;
  border-bottom: 1px solid #e9e9e9;
  margin: 0 8px 8px;
}
.writeoff-form ::v-deep {
  padding: 0 8px;
  .detail__div {
    width: 500px !important;
    margin-right: 6px;
    &.detail__div__full {
      width: 100% !important;
    }
    & > div {
      flex: 1 1 auto;
    }
  }
  .detail__label {
    width: 250px !important;
  }
  .special__div > div {
    position: relative;
    & > div {
      width: 50% !important;
    }
    & > span {
      position: absolute;
      white-space: nowrap;
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
    margin-bottom: 8px;
    background: #f8f9fd;
    .title {
      flex: 1;
      height: 30px;
      font-weight: 600;
      color: #222222;
      line-height: 30px;
      padding: 0 8px;
      display: flex;
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
    }
  }
}
// 关联结算单位弹框
.settle-unit-box {
  font-size: 12px;
  .default-settle {
    display: flex;
    span {
      width: 150px;
      line-height: 20px;
    }
    .el-input {
      flex-basis: 300px;
    }
  }
  .unit-box {
    margin: 15px 10px;
    ::v-deep span {
      font-size: 12px !important;
    }
    .el-checkbox {
      &:hover {
        background-color: #f5f7fa;
      }
      line-height: 26px;
      ::v-deep .el-checkbox__label {
        color: #606266 !important;
      }
    }
  }
}
.ls__form .el-form-item {
  width: 262px;
  margin-right: 16px;
  margin-bottom: 6px;
  display: inline-flex;
  ::v-deep .el-form-item__content {
    flex: 1 1 auto;
    & > div {
      width: 100%;
    }
  }
  .el-date-editor.el-input {
    width: 162px;
  }
}
.settle_reg_dialog ::v-deep {
  .el-form-item__content {
    display: inline-block;
  }
}
</style>
