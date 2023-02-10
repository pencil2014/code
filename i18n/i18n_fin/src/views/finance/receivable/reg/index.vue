<template>
  <div
    class="self__css"
    v-loading="lsLoading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" />
    <div class="finance-search-list-gap"></div>
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left">
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-regList', 'btn-addReg')"
              class="finance-btn"
              @click="handleAdd"
              type="primary"
              size="mini"
            >{{$t('Common.add')}}</el-button>
          </el-button-group>
          <!-- 暂时隐藏此功能 -->
          <!-- <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-regList', 'btn-import')"
              class="finance-btn"
              @click="openUpload('batchImport')"
              size="mini"
              type="primary"
            >{{$t('Common.batchImport')}}</el-button>
          </el-button-group> -->
          <el-button-group>
            <el-button
              class="finance-btn"
              @click="toPrerevAction()"
              size="mini"
              type="warning"
              v-if="checkAuth($route.name, 'tab-regList', 'btn-transferPre')"
            >{{$t('Collect.toReceipt')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              @click="markAssistedComp"
              size="mini"
              type="warning"
              v-if="checkAuth($route.name, 'tab-regList', 'btn-markAssistedComp')"
            >{{$t('Collect.branchCollect')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              @click="regDelete"
              size="mini"
              v-if="checkAuth($route.name, 'tab-regList', 'btn-delete')"
              type="danger"
            >{{$t('Common.del')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" size="mini" @click="exportBtn">{{$t('Common.export')}}</el-button>
          </el-button-group>
        </div>
        <div class="money-box-right">
          <!-- v-if="checkAuth($route.name, 'tab-regList', 'btn-refund')" -->
          <el-button-group>
            <el-button type="warning" class="finance-btn" @click="changeSettleCorp" size="mini">{{$t('Collect.settlementUnit')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              @click="handleRefund()"
              size="mini"
              type="warning"
              v-if="checkAuth($route.name, 'tab-regList', 'btn-refund')"
            >{{$t('Collect.refund')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              class="finance-btn"
              @click="handleConfirm"
              size="mini"
              type="success"
              v-if="checkAuth($route.name, 'tab-regList', 'btn-sureReceive')"
            >{{$t('Collect.conReceipt')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-regList', 'btn-cancelSure')"
              class="finance-btn"
              @click="handleCancelConfirm"
              size="mini"
              type="purple"
            >{{$t('Collect.RevConfirm')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button
              v-if="checkAuth($route.name, 'tab-regList', 'btn-writeoffRecv')"
              class="finance-btn"
              @click="handleWriteoffRecv"
              size="mini"
              type="primary"
            >{{$t('Collect.receiptWriteoff')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTable :option="option1" @send-multi="sendMulti" />
    </div>
    <div class="add_edit_dialog" v-if="dialogVisible">
      <el-dialog
        :title="(addRegType === 'add' ? $t('Common.add') : $t('Common.modify'))  + ' ' +$t('Collect.receiptReg')"
        :visible.sync="dialogVisible"
        :close-on-click-modal="false"
        width="1000px"
      >
        <el-form
          :model="addRegForm"
          ref="addRegForm"
          :inline="true"
          label-width="180px"
          size="mini"
          :rules="addRegRules"
          label-suffix=":"
        >
          <div class="dialog-subarea">
            <h3>{{$t('Collect.receiptInfo')}}</h3>
            <el-form-item :label="$t('FeeList.receivePayDates')" prop="recvDate">
              <el-date-picker
                v-model="addRegForm.recvDate"
                type="date"
                :placeholder="$t('Common.plSelect')"
                :value-format="'yyyy-MM-dd'"
              ></el-date-picker>
            </el-form-item>
            <el-form-item :label="$t('FeeList.currency')" prop="currency">
              <el-select v-model="addRegForm.currency" @change="currencyChange" :placeholder="$t('Common.plSelect')">
                <el-option
                  v-for="(item, index) in dictMap['validCurrency'].filter(v=>v.value!=='ORIGINAL')"
                  :key="'addRegForm_currency' + index"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('Collect.amtReceived')" prop="realAmt">
              <el-input
                v-model="addRegForm.realAmt"
                :maxlength="16"
                v-lsNumber="{
									value: 'number',
									obj: addRegForm,
									key: 'realAmt',
								}"
                :placeholder="$t('Common.plEnter')"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('Collect.flowTips')" prop="bankSeqNo">
              <el-input v-model="addRegForm.bankSeqNo" :maxlength="32" :placeholder="$t('Common.plEnter')"></el-input>
            </el-form-item>
            <el-form-item :label="$t('Collect.externalFee')" prop="outerTransferFee" v-if="addRegType === 'add'" label-width="220px">
              <el-input
                v-model="addRegForm.outerTransferFee"
                v-lsNumber="{ value: 'number', obj: addRegForm, key: 'outerTransferFee', }"
                :maxlength="16"
                :placeholder="$t('Common.plEnter')"
              ></el-input>
            </el-form-item>
            <template v-if="addRegType === 'modify'">
              <el-form-item
                :label=" addRegForm.outerTransferFeeList.length > 1 ? $t('Collect.externalFee') + (index + 1) : $t('Collect.externalFee') "
                prop="outerTransferFee"
                v-for="(item, index) in addRegForm.outerTransferFeeList"
                :key="'outerTransferFeeList' + index"
                label-width="220px"
              >
                <el-input
                  v-model="item.transferFee"
                  v-lsNumber="{ value: 'number', obj: item, key: 'transferFee', }"
                  :maxlength="16"
                  :placeholder="$t('Common.plEnter')"
                ></el-input>
              </el-form-item>
            </template>
            <el-form-item :label="$t('Collect.uploadBill')">
              <FinUploadEmbed ref="FinUploadEmbed" :width="260" @send-file-list="sendFileList" />
            </el-form-item>
            <el-form-item :label="$t('Collect.transRemarks')" prop="remark" class="full-item">
              <el-input
                v-model="addRegForm.remark"
                :placeholder="$t('Common.plEnter')"
                type="textarea"
                :maxlength="500"
                show-word-limit
                style="width: 580px"
              ></el-input>
            </el-form-item>
          </div>
          <div class="dialog-subarea">
            <h3>{{$t('Settle.recvBankName')}}</h3>
            <el-form-item :label="$t('Collect.recvWay')" prop="recvWay">
              <el-select v-model="addRegForm.recvWay" clearable :placeholder="$t('Common.plSelect')">
                <el-option
                  v-for="item in dictMap['recvWay']"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('Collect.abbreviat')" prop="accountShortName">
              <el-select
                v-model="addRegForm.accountShortName"
                :placeholder="$t('Common.plSelect')"
                filterable
                remote
                :remote-method=" (queryString) => bankAccountList(queryString) "
                @visible-change=" (value) => value && bankAccountList() "
                @change=" (value) => bankAccountChange(value) "
              >
                <el-option
                  v-for="(item, index) in bankAccountSelectOptions"
                  :key="'bankAccountSelectOptions' + index"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('Settle.recvAccountNo')" prop="accountNo">
              <el-input v-model="addRegForm.accountNo" disabled :placeholder="$t('Common.plEnter')"></el-input>
            </el-form-item>
            <el-form-item :label="$t('Settle.settleMode')" prop="settleMode">
              <el-select v-model="addRegForm.settleMode" clearable :placeholder="$t('Common.plSelect')">
                <el-option
                  v-for="item in bankAccountSettleModeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('Settle.branchCompany')" prop="recvCompName">
              <el-input v-model="addRegForm.recvCompName" disabled :placeholder="$t('Common.plEnter')"></el-input>
            </el-form-item>
            <el-form-item
              v-if="hasFixedTransferFee"
              :label="$t('Collect.handlingFee')"
              prop="fixedTransferFee"
              :rules="{required: true, message: ' ', trigger: 'change'}"
            >
              <el-input v-model="addRegForm.fixedTransferFee" disabled :placeholder="$t('Common.plEnter')"></el-input>
            </el-form-item>
          </div>
          <div class="dialog-subarea">
            <h3>{{$t('Collect.paymentBank')}}</h3>

            <!-- this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item) -->
            <el-form-item :label="$t('Collect.accountName')" prop="payAccountName">
              <el-autocomplete
                size="mini"
                style="width: 100%"
                v-model="addRegForm.payAccountName"
                :maxlength="128"
                :placeholder="$t('Common.plEnter')"
                :select-when-unmatched="true"
                :fetch-suggestions=" (queryString, cb) => autocomplete1.querySearch(queryString, cb) "
                @select=" (value) => autocomplete1.select(value) "
                @change=" (value) => autocomplete1.change && autocomplete1.change(value) "
              ></el-autocomplete>
            </el-form-item>
            <el-form-item :label="$t('Collect.accountNumber')" prop="payAccountNo">
              <el-input
                v-model="addRegForm.payAccountNo"
                :maxlength="128"
                :disabled="selectedOptionItem1 !== '' && !isSettleSelect"
                :placeholder="$t('Collect.accountNumberTips')"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('FeeList.settleCorp')" prop="settleCorpCode">
              <el-select
                v-model="addRegForm.settleCorpCode"
                clearable
                :placeholder="$t('Common.plSelect')"
                :remote="true"
                :noRemote="true"
                :remote-method="(queryString) => listSettleUnit() "
                @visible-change="(val) => val && listSettleUnit()"
                @change="selectSettleCorp"
              >
                <el-option
                  v-for="(item,index) in settleRemoteList"
                  :key="item.value+','+index"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('Collect.paymentBank')" prop="payBankName">
              <!-- :disabled="selectedOptionItem1 !== '' && !isSettleSelect" -->
              <el-autocomplete
                size="mini"
                style="width: 100%"
                v-model="addRegForm.payBankName"
                :maxlength="128"
                :placeholder="$t('Common.plEnter')"
                :select-when-unmatched="true"
                :fetch-suggestions=" (queryString, cb) => autocomplete2.querySearch(queryString, cb) "
                @select=" (value) => autocomplete2.select(value) "
                @change=" (value) => autocomplete2.change(value) "
              ></el-autocomplete>
            </el-form-item>
            <el-form-item :label="$t('Collect.paymentBankSub')" prop="payBankBranch">
              <!-- :disabled="selectedOptionItem1 !== '' && !isSettleSelect" -->
              <el-input
                size="mini"
                v-model="addRegForm.payBankBranch"
                :maxlength="200"
                :placeholder="$t('Common.plEnter')"
              ></el-input>
            </el-form-item>
            <!-- payBankBranch -->
            <el-form-item :label="$t('Collect.accountType')" prop="payAccountPublicType">
              <el-select
                v-model="addRegForm.payAccountPublicType"
                clearable
                :placeholder="$t('Common.plSelect')"
                :disabled="publicTypeDisabled && !isSettleSelect"
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
                v-model="addRegForm.payAccountCountryCode"
                clearable
                :placeholder="$t('Common.plSelect')"
                filterable
                :remote="true"
                :remote-method=" (queryString) => getCountryList(queryString) "
                @visible-change=" (value) => value && getCountryList() "
                @change="selectCountry"
                @clear="addRegForm.payAccountCountryCode=addRegForm.payAccountCountryName=''"
              >
                <el-option
                  v-for="item in COUNTRYLIST"
                  :key="item.value"
                  :label="$lang === 'zh' ? item.cname : item.ename"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('Settle.swiftCode')" prop="payAccountSwiftCode">
              <el-input
                v-model="addRegForm.payAccountSwiftCode"
                :maxlength="200"
                :placeholder="$t('Common.plEnter')"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('Settle.recvRegAddr')" prop="payAccountBankCompAddr" class="full-item">
              <el-input
                type="textarea"
                v-model="addRegForm.payAccountBankCompAddr"
                :maxlength="200"
                show-word-limit
                style="width: 580px"
                :placeholder="$t('Common.plEnter')"
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('Collect.maintainers')" prop="cname">
              <el-input v-model="addRegForm.cname" disabled placeholder></el-input>
            </el-form-item>
            <el-form-item :label="$t('Collect.maintainerEmail')" prop="email">
              <el-input v-model="addRegForm.email" disabled placeholder></el-input>
            </el-form-item>
            <el-form-item :label="$t('Collect.uploadSheets')" label-width="220px" style="width: 100%">
              <FinUploadEmbed ref="FinUploadEmbed2" :width="220" @send-file-list="sendFileList2" />
            </el-form-item>
          </div>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button :loading="addBtnLoading" type="primary" size="mini" @click="addRegSubmit">{{$t('Common.sure')}}</el-button>
          <el-button size="mini" @click="dialogVisible = false;dialVmN()">{{$t('Common.cancel')}}</el-button>
        </span>
      </el-dialog>
    </div>
    <!-- 批量导入 -->
    <FinanceUpload
      :upload-title="uploadTitle"
      :upload-api="uploadApi"
      :upload-params="uploadParams"
      :show-upload="showUpload"
      @send-res-upload="sendResUpload"
      @close-upload="closeUpload"
    >
      <div class="download-model">
        <el-link type="primary" @click="stockDownload">{{$t('Common.downloadTemp')}}</el-link>
      </div>
    </FinanceUpload>
    <!-- 申请退款 -->
    <RefundDialog
      v-if="refundDialogVisible"
      :open="refundDialogVisible"
      :form="query"
      @close-refund-dialog="refundDialog"
    />
    <el-dialog :title="$t('FinBill.log')" :visible.sync="logDialogVisible" width="882px">
      <div style="font-size: 14px;line-height: 18px;">{{$t('Collect.receivableRegNo')}}:{{ receivableRegNo }}</div>
      <FinanceTable :option="option2" @send-multi="sendMulti" />
    </el-dialog>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{key:'prop',label:'label'}"
        @close="customColumnsPopClose"
      />
    </div>
    <!-- 指定结算单位 -->
    <el-dialog
      v-if="exchangeCorpDialogAssist"
      :visible.sync="exchangeCorpDialogAssist"
      :title="$t('Collect.settlementUnit')"
      width="500px"
      label-width="100px"
    >
      <el-form :model="corpFormAssist" ref="corpFormAssist" :rules="corpRulesAssist" size="mini" label-suffix=":">
        <div
          style="color:#CD4130;margin-top:8px;"
          v-if="!settleRow.settleCorpName"
        >{{$t('Collect.billTips')}}</div>
        <el-form-item :label="$t('FeeList.settleCorp')" prop="settleCorp" style="margin-top: 18px;">
          <el-select
            style="width: 320px;"
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
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import FinanceUpload from '@/views/finance/receivable/components/financeUpload'
import RefundDialog from '../components/refund'
import CustomColumns from '@/components/customColumns'
import FinUploadEmbed from '@/views/finance/receivable/components/finUploadEmbed'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin as commonMixin } from '@/views/finance/voucher/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { bankAccountList, getOrgMaintainer } from '@/api/fin/settleUnit'
import { listReceivableRegAccount } from '@/api/fin/settleUnitBankAcct'
import {
  regListPage,
  regToUpdate as regInfo,
  regAdd,
  regUpdate,
  toPrerev,
  regTransferRefund,
  regConfirm,
  regDelete,
  operateLog,
  cancelConfirm,
  getRegListAmtSummary,
  getFixedTranferFeeList,
  listSettleUnit,
  updateSettleUnit,
  markAssistedComp,
} from '@/api/fin/receivableReg'
import { bankList } from '@/api/crm/common'
import { countrySelectList } from '@/api/base'

const DefaultData = {
  receivableRegId: '',
  recvCompName: '',
  recvCompCode: '',
  recvDate: '',
  currency: '',
  realAmt: '',
  bankSeqNo: '',
  compBankAccountId: null,
  accountShortName: '',
  accountNo: '',
  payBankArea: '',
  payBankName: '',
  payAccountNo: '',
  payAccountName: '',
  outerTransferFee: '',
  innerTransferFee: '',
  transferFeeList: [],
  outerTransferFeeList: [],
  innerTransferFeeList: [],
  remark: '',
  payAccountPublicType: '',
  cname: '',
  email: '',
  payAccountCountryCode: '', // 付款账户 发卡行国家
  payAccountCountryName: '', // 付款账户 发卡行国家
  payAccountSwiftCode: '', // 付款账户 SwiftCode
  payAccountBankCompAddr: '', // 付款账户 公司地址
  settleCorpCode: '',
  settleCorpName: '',
  payBankBranch: '',
  hasIntrabranch: '', // 收款账户是内部往来账户 'yes' 'no'
  bankseqFileName: '',
  bankseqFileCode: '',
  payBankseqFileName: '',
  payBankseqFileNo: '',
  recvWay: '', //收款方式
  settleMode: '', //账户结算方式
  fixedTransferFee: '',
}

export default {
  name: 'regList',
  mixins: [mixin, mixin2, commonMixin],
  props: ['isJumpRouteFromPage'],
  data() {
    // let specialRule = [{ pattern: /^[0-9a-zA-Z ]*$/, message: '请输入正确付款账号', required: true }]
    let specialRule = [{ pattern: /^[0-9a-zA-Z ]*$/, message: ' ' }]
    return {
      pageSizeUrl: regListPage('geturl'),
      keyDownActive: true,
      recvNeedBankseqBoolean: false,
      addBtnLoading: false, // 新值弹框确定按钮loading
      settleRemoteList: [], // 新增、修改弹框内结算单位列表
      bankAccountSettleModeList: [], // 新增、修改弹框内账户结算方式
      COUNTRYLIST: [], // 国家列表
      payAccountName: '',
      errorFile: {},
      searchBackup: [],
      query: {},
      showUpload: false,
      file: '',
      fileList: [],
      showProcess: false,
      processLength: 0,
      defaultFileSize: 5,
      refundForm: { receiveRefundAmt: null, realRefundAmt: null, rate: null, fileIds: [] },
      refundDialogVisible: false,
      option1: {},
      option2: {},
      searchOption: {},
      table1DataBackup: [],
      table2DataBackup: [],
      multipleSelection1: [],
      writeoffReceipayId: '',
      form: { orderNo: '', creationDate: '', billNo: '', settleCorpName: '', settleCorpCode: '' },
      orderNo: '',
      autocomplete: {},
      // 付款银行，
      selectedOptionItem: '',
      // 付款账户名对象，付款账户名手动改变时清空，
      selectedOptionItem1: '',
      // 付款账户名对象，付款账户名手动改变时清空，
      selectedOptionItem2: '1',
      receivableRegId: -1,
      invoiceNo: '',
      currentComponent: '',
      dialogVisible: false,
      addRegForm: JSON.parse(JSON.stringify(DefaultData)),
      specialRule,
      addRegRules: {
        // settleCorpCode: [{ required: false, message: this.$t('Supplier.setemptyTips'), trigger: 'change' }],
        // recvCompName: [{ required: true, message: '所属分公司不能为空', trigger: 'change' }],
        // recvDate: [{ required: true, message: '收付日期不能为空', trigger: 'change' }],
        // currency: [{ required: true, message: '币种不能为空', trigger: 'change' }],
        // realAmt: [{ required: true, message: '收款金额不能为空', trigger: 'change' }],
        // // bankSeqNo: [{ required: true, message: '银行交易流水不能为空', trigger: 'change' }],
        // payAccountNo: specialRule,
        // compBankAccountId: [{ required: true, message: '收款银行不能为空', trigger: 'change' }],
        // payAccountName: [{ required: true, message: '付款人名称不能为空', trigger: 'change' }],
        // // payBankArea: [{ required: true, message: '付款银行区域不能为空', trigger: 'change' }],
        // accountShortName: [{ required: true, message: '收款银行不能为空', trigger: 'change' }],
        // payAccountPublicType: { required: true, message: '付款账户类型不能为空', trigger: 'change' },
        // recvWay: { required: true, message: '收款方式不能为空', trigger: 'change' },
        // // outerTransferFee: [{ required: true, message: '外扣手续费不能为空', trigger: 'change' }],

        settleCorpCode: [{ required: false, message: ' ', trigger: 'change' }],
        recvCompName: [{ required: true, message: ' ', trigger: 'change' }],
        recvDate: [{ required: true, message: ' ', trigger: 'change' }],
        currency: [{ required: true, message: ' ', trigger: 'change' }],
        realAmt: [{ required: true, message: ' ', trigger: 'change' }],
        bankSeqNo: [{ required: false, message: ' ', trigger: 'change' }],
        payAccountNo: specialRule,
        compBankAccountId: [{ required: true, message: ' ', trigger: 'change' }],
        payAccountName: [{ required: true, message: ' ', trigger: 'change' }],
        // payBankArea: [{ required: true, message: '付款银行区域不能为空', trigger: 'change' }],
        accountShortName: [{ required: true, message: ' ', trigger: 'change' }],
        payAccountPublicType: { required: true, message: ' ', trigger: 'change' },
        recvWay: { required: true, message: ' ', trigger: 'change' },
        settleMode: { required: true, message: ' ', trigger: 'change' },
        // outerTransferFee: [{ required: true, message: '外扣手续费不能为空', trigger: 'change' }],
      },
      addRegType: 'add',
      bankAccountSelectOptions: [],
      bankAccountSelectOptions2: [],
      bankAccountSelectOptions3: [],
      uploadType: '',
      uploadTitle: '',
      uploadApi: '',
      uploadParams: {},
      uploadApi2: '/base/webapi/file/upload',
      uploadParams2: {},
      employeeSelectOptions: [],
      listUserSettleCompanyOptions: [],
      timer: null,
      logDialogVisible: false,
      rowData: {},
      businessNo: -1,
      receivableRegNo: '',
      payBankAccounts: null,
      // 升序
      ascColumns: [],
      // 降序
      descColumns: [],
      rightFilterBtns: [true, false, false],
      publicTypeDisabled: false,
      lsLoading: false,
      // 自定义表头弹框
      customColumnsPopShow: false,
      // 右侧搜索条件
      buttonSearch: '',
      // 指定结算单位
      corpFormAssist: { settleCorp: '' },
      corpRulesAssist: { settleCorp: [{ required: true, message: ' ', trigger: 'change' }] },
      exchangeCorpDialogAssist: false,
      settleCorpSelectListAssist: [],
      // 协助代收付分公司
      corpFormAssist2: { settleCorp: '' },
      corpRulesAssist2: { settleCorp: [{ required: true, message: ' ', trigger: 'change' }] },
      exchangeCorpDialogAssist2: false,
      settleCorpSelectListAssist2: [],
      settleRow: {},
      selfColumnsBase: [
        {
          prop: 'receivableRegNo',
          label: this.$t('Collect.receivableRegNo'),
          width: '130px',
          type: 'button',
          sortable: true,
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              this.showDetail(row)
            },
          },
        },
        {
          prop: 'type',
          label: this.$t('Collect.receiptType'),
          type: 'select',
          sortable: true,
          propInDict: 'receivableRegType',
          width: '124px',
        },
        { prop: 'recvCompName', label: this.$t('Settle.branchCompany'), sortable: true, width: 150 },
        { prop: 'accountShortName', label: this.$t('Settle.recvBankName'), sortable: true, width: '124px' },
        {
          prop: 'accountPublicType',
          label: this.$t('Collect.ourAccountType'),
          type: 'select',
          sortable: true,
          propInDict: 'accountType',
          width: '118px',
        },
        { prop: 'accountNo', label: this.$t('Settle.recvAccountNo'), sortable: true, width: '114px' },
        {
          prop: 'settleMode',
          label: this.$t('Settle.settleMode'),
          type: 'select',
          propInDict: 'bankAccountSettleMode',
          sortable: true,
          width: '114px',
        },
        { prop: 'currency', label: this.$t('Collect.receiptCurrency'), sortable: true, width: '104px' },
        { prop: 'realAmt', label: this.$t('Collect.amtReceived'), sortable: true, width: '104px' },
        { prop: 'recvDate', label: this.$t('FeeList.receivePayDates'), sortable: true, width: '104px' },
        {
          prop: 'confirmStatus',
          label: this.$t('Collect.receiptStatus'),
          type: 'select',
          propInDict: 'receivableRegStatus',
          sortable: true,
          width: '118px',
        },
        { prop: 'settleCorpName', label: this.$t('FeeList.settleCorp'), sortable: true, width: 150 },
        { prop: 'settleCorpType', label: this.$t('FeeList.settleCorpType'), sortable: false, width: '118px' },
        {
          prop: 'isTemporary',
          label: this.$t('Collect.isVirtual'),
          type: 'select',
          propInDict: 'yesNo',
          sortable: false,
          width: '118px',
        },
        {
          prop: 'writeoffStatus',
          label: this.$t('FeeList.writeoffStatuss'),
          type: 'select',
          propInDict: 'writeoffStatus',
          sortable: true,
          width: '104px',
        },
        {
          prop: 'payAccountName',
          label: this.$t('Collect.accountName'),
          type: 'text',
          sortable: true,
          width: 150,
        },
        {
          prop: 'payAccountPublicType',
          label: this.$t('Collect.paymentAccountType'),
          type: 'select',
          sortable: true,
          propInDict: 'accountType',
          width: '118px',
        },
        // {
        //   prop: 'payBankArea',
        //   label: '付款银行区域',
        //   type: 'select',
        //   propInDict: 'area',
        //   sortable: true,
        //   width: '104px',
        // },
        {
          prop: 'payBankName',
          label: this.$t('Collect.paymentBank'),
          type: 'text',
          sortable: true,
          width: '104px',
        },
        {
          prop: 'payAccountNo',
          label: this.$t('Collect.accountNumber'),
          type: 'text',
          sortable: true,
          width: '118px',
        },
        { prop: 'payAccountCountryName', label: this.$t('Collect.payAccountCountry'), type: 'text', width: '118px' },
        { prop: 'payAccountSwiftCode', label: this.$t('Settle.swiftCode'), type: 'text', width: '118px' },
        { prop: 'payAccountBankCompAddr', label: this.$t('Settle.recvRegAddr'), type: 'text', width: '118px' },
        {
          prop: 'outerTransferFee',
          label: this.$t('Collect.externalFee'),
          type: 'text',
          sortable: true,
          width: '104px',
        },
        {
          prop: 'interTransferFee',
          label: this.$t('Collect.interTransferFee'),
          type: 'text',
          sortable: true,
          width: '104px',
        },
        {
          prop: 'bankSeqNo',
          label: this.$t('Collect.bankFlowNumber'),
          type: 'text',
          sortable: true,
          width: '118px',
        },
        {
          prop: 'preceiveBalance',
          label: this.$t('Collect.preceiveBalance'),
          type: 'text',
          sortable: true,
          width: '118px',
        },
        {
          prop: 'writeoffAmt',
          label: this.$t('Collect.writtenoffAmount'),
          type: 'text',
          sortable: true,
          width: '104px',
        },

        {
          prop: 'writeoffBalance',
          label: this.$t('Collect.unwrittenAmount'),
          type: 'text',
          sortable: true,
          width: '104px',
        },
        // {
        //   prop: 'invoiceStatus',
        //   label: this.$t('Settle.invoiceStatus'),
        //   type: 'select',
        //   propInDict: 'feeInvoiceStatus',
        //   // selectOptions: [
        //   //   { label: '已开票', value: 'yes' },
        //   //   { label: '未开票', value: 'no' },
        //   // ],
        //   // forceSelection: true,
        //   sortable: false,
        // },
        // {
        //   prop: 'noInvoiceAmt',
        //   label: this.$t('Collect.uninvoicedAmount'),
        //   type: 'text',
        //   sortable: true,
        //   width: '104px',
        // },
        // {
        //   prop: 'invoiceAmt',
        //   label: this.$t('Collect.invoicedAmt'),
        //   type: 'text',
        //   sortable: true,
        //   width: '104px',
        // },
        // {
        //   prop: 'invoiceNos',
        //   label: this.$t('FeeList.invoiceNo'),
        //   type: 'columnTip',
        //   width: 140,
        //   sortable: false,
        //   component: 'ColumnTip',
        //   componentProps: {
        //     show: false,
        //     callback: (no, componentProps, index) => {
        //       let row = componentProps.row
        //       let invoiceReceivableIds = row.invoiceReceivableIds_multiValue
        //         ? row.invoiceReceivableIds_multiValue
        //         : row.invoiceNos_multiValue
        //       let invoiceReceivableId = invoiceReceivableIds[index]
        //       let query = { source: 'detail', invoiceReceivableId }
        //       this.$emit('update:isJumpRouteFromPage', true)
        //       this.$router.push({
        //         path: '/finance/receivable/invoiceReceivableDetail',
        //         query,
        //       })
        //     },
        //   },
        // },
        {
          prop: 'bankseqFileCode',
          label: this.$t('Collect.waterBill'),
          type: 'button',
          width: '80px',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              if (action === 'showAttachment' && row.bankseqFileCode) {
                let href = `/base/fileView/preview/${row.bankseqFileCode}/sowoll`
                window.open(href)
              }
            },
            data: [{ label: this.$t('Common.view'), type: 'text', show: true, action: 'showAttachment' }],
          },
          sortable: false,
        },
        {
          prop: 'payBankseqFileNo',
          label: this.$t('Collect.paymentWaterBill'),
          type: 'button',
          width: '80px',
          operationBtns: {
            show: true,
            callback: (action, $index, row, option) => {
              if (action === 'showAttachment' && row.payBankseqFileNo) {
                let href = `/base/fileView/preview/${row.payBankseqFileNo}/sowoll`
                window.open(href)
              }
            },
            data: [{ label: this.$t('Common.view'), type: 'text', show: true, action: 'showAttachment' }],
          },
          sortable: false,
        },
        {
          prop: 'remark',
          label: this.$t('Collect.transRemarks'),
          type: 'tooltip',
          width: 135,
        },
        {
          prop: 'createdName',
          label: this.$t('Common.createdBy'),
          type: 'text',
          sortable: true,
          width: '80px',
        },
        {
          prop: 'createdTime',
          label: this.$t('Common.createTime'),
          type: 'text',
          sortable: true,
          width: '130px',
        },
        {
          prop: 'updatedName',
          label: this.$t('Common.updatedBy'),
          type: 'text',
          sortable: true,
          width: '100px',
        },
        {
          prop: 'updatedTime',
          label: this.$t('Common.updateTime'),
          type: 'text',
          sortable: true,
          width: '130px',
        },
      ],
      isSettleSelect: false,
      hasFixedTransferFee: false,
    }
  },
  created() {
    //付款账户名
    this.autocomplete1 = {
      querySearch: (queryString, cb) => {
        console.log(queryString, this.oldAccountName)
        // if (queryString === this.addRegForm._diyAccountName + '(' + this.addRegForm.payAccountNo.slice(-4) + ')') return cb([])
        if (queryString !== this.oldAccountName) {
          // this.oldAccountName = queryString
          this.selectedOptionItem1 = ''
          this.selectedOptionItem2 = ''
          // console.log('`````````clear ')
          this.orgBankAccount(queryString, cb)
        } else {
          this.orgBankAccount('', cb)
        }
      },
      select: (optionItem, row) => {
        // console.log('````select')
        // console.log(optionItem)
        if (Object.keys(optionItem).length === 1) {
          return
        }
        this.selectedOptionItem1 = optionItem
        this.selectedOptionItem2 = optionItem
        if (!this.addRegForm.settleCorpCode) {
          this.addRegForm.settleCorpCode = optionItem.unitCode
          this.addRegForm.settleCorpName = optionItem.unitName
          this.settleRemoteList = [{ value: optionItem.unitCode, label: optionItem.unitName }]
        }
        this.addRegForm.payAccountNo = optionItem.accountNo
        this.addRegForm.payBankName = optionItem.bankName
        this.addRegForm.payAccountName = optionItem.accountName || optionItem.value
        this.addRegForm.payAccountCountryCode = optionItem.countryCode
        this.addRegForm.payAccountCountryName = optionItem.countryName
        this.addRegForm.payBankBranch = optionItem.bankBranch
        if (optionItem.countryCode && optionItem.countryName) {
          this.COUNTRYLIST = [{ cname: optionItem.countryName, value: optionItem.countryCode }]
        }
        this.addRegForm.payAccountSwiftCode = optionItem.swiftCode
        this.addRegForm.payAccountBankCompAddr = optionItem.accountBankCompAddr
        this.oldAccountName = optionItem.accountName || optionItem.value
        this.addRegForm._diyAccountName = optionItem.accountName || optionItem.value
        this.addRegForm.payAccountPublicType = optionItem.publicType
        this.publicTypeDisabled = !!optionItem.publicType
        if (!optionItem.orgid) {
          return
        }
        getOrgMaintainer({ orgid: optionItem.orgid }).then((res) => {
          if (res.data && res.data.length) {
            this.addRegForm.cname = res.data[0].cname
            this.addRegForm.email = res.data[0].email
          }
        })
        // console.log(optionItem);
      },
    }
    //付款银行
    this.autocomplete2 = {
      querySearch: (queryString, cb) => {
        // if(this.addRegForm.payBankArea !== "chinese_mainland"){ //如果不是中国大陆不让搜索
        //   return cb([])
        // }
        this.selectedOptionItem = ''
        this.bankList2(queryString, cb)
      },
      select: (optionItem, row) => {
        // console.log(optionItem)
        this.selectedOptionItem = optionItem
        this.addRegForm.payBankCode = optionItem.key
      },
      change: (val, row) => {
        if (this.oldPayBank && this.oldPayBank === val) {
          return
        } else {
          this.oldPayBank = val
        }
        this.selectedOptionItem1 = ''
        this.selectedOptionItem2 = ''
        this.publicTypeDisabled = false
        this.addRegForm.payAccountPublicType = ''
        this.addRegForm.payAccountNo = this.addRegForm.payBankBranch = ''
        // 延时150ms获取select中的改变
        setTimeout(() => {
          if (this.selectedOptionItem === '') {
            this.addRegForm.payBankCode = ''
          }
        }, 150)
      },
    }
    // 搜索配置
    let searchArr = ['allNo', 'writeoffStatus', 'accountShortName', 'currency', 'realAmt', 'settleCorpCode', 'createdTime']
    this.searchOption = {
      // saveDefault: true,
      saveShow: true,
      saveName: 'regReceiveList',
      isNotAutoLoad: true,
      listHeightFunc: this.computeFinTableHeight,
      addFilter: {
        // 初始搜索条件数
        defaultSearchLength: 7,
        // 条件数组
        searchInputGroup: searchArr.map((key) => ({ key, value: '', range: { min: '', max: '' } })),
        filterGroups: {
          allNo: { label: this.$t('FeeList.allNo'), type: 'input' },
          receivableRegNo: { label: this.$t('Collect.receivableRegNo'), type: 'input' },
          bankSeqNo: { label: this.$t('Collect.bankFlowNumber'), type: 'input' },
          // invoiceNo: { label: this.$t('FeeList.invoiceNo'), type: 'input' },
          writeoffStatus: {
            label: this.$t('FeeList.writeoffStatuss'),
            type: 'select',
            prop: 'writeoffStatus',
            multiple: true,
            selectOptions: [this.dictMap.writeoffStatus[0], this.dictMap.writeoffStatus[2]],
          },
          confirmStatus: { label: this.$t('Collect.receiptStatus'), type: 'select', prop: 'receivableRegStatus' },
          accountShortName: {
            label: this.$t('Settle.recvBankName'),
            type: 'select',
            type: 'remoteSelect',
            remote: true,
            multiple: true,
            DIY: { key: 'accountNo' },
            remoteMethod: (queryString, item, row) => {
              this.bankAccountListChange(queryString, item)
            },
            visibleChange: (queryString, item, row) => {
              this.bankAccountListChange(queryString, item)
            },
            remoteSelectList: [],
          },
          settleMode: { label: this.$t('Settle.settleMode'), type: 'select', prop: 'bankAccountSettleMode' },
          accountNo: { label: this.$t('Settle.recvAccountNo'), type: 'input' },
          payBankName: { label: this.$t('Collect.paymentBank'), type: 'input' },
          payAccountName: { label: this.$t('Collect.accountName'), type: 'input' },
          payAccountNo: { label: this.$t('Collect.accountNumber'), type: 'input' },
          // payBankArea: { label: '付款银行区域', type: 'select', prop: 'area',  },
          accountPublicType: { label: this.$t('Collect.ourAccountType'), prop: 'accountType', type: 'select' },
          payAccountPublicType: { label: this.$t('Collect.paymentAccountType'), type: 'select', prop: 'accountType' },
          hasBankseqFile: { label: this.$t('Collect.waterBill'), type: 'select', prop: 'hasNo' },
          hasPayBankseqFile: { label: this.$t('Collect.paymentWaterBill'), type: 'select', prop: 'hasNo' },
          currency: {
            label: this.$t('Collect.receiptCurrency'),
            type: 'select',
            selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'),
          },
          recvDate: { label: this.$t('FeeList.receivePayDates'), type: 'daterange', format: 'yyyy-MM-dd' },
          realAmt: { label: this.$t('Collect.amtReceived'), type: 'range' },
          outerTransferFee: { label: this.$t('Collect.externalFee'), type: 'range' },
          interTransferFee: { label: this.$t('Collect.interTransferFee'), type: 'range' },
          preceiveBalance: { label: this.$t('Collect.preceiveBalance'), type: 'range' },
          writeoffAmt: { label: this.$t('Collect.writtenoffAmount'), type: 'range' },
          writeoffBalance: { label: this.$t('Collect.unwrittenAmount'), type: 'range' },
          // invoiceStatus: {
          //   label: this.$t('Settle.invoiceStatus'),
          //   type: 'select',
          //   prop: 'feeInvoiceStatus',
          //   multiple: true,
          //   // selectOptions: [
          //   //   { label: '已开票', value: 'yes' },
          //   //   { label: '未开票', value: 'no' },
          //   // ],
          // },
          // noInvoiceAmt: { label: this.$t('Collect.uninvoicedAmount'), type: 'range', rangeMinMax: true },
          // invoiceAmt: { label: this.$t('Collect.invoicedAmt'), type: 'range', rangeMinMax: true },
          settleCorpCode: {
            label: this.$t('FeeList.settleCorp'),
            type: 'remoteSelect',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, containTemporary: 'yes' }, item)
            },
            remoteSelectList: [],
          },
          recvCompCode: {
            label: this.$t('Settle.branchCompany'),
            type: 'remoteSelect',
            remote: true,
            multiple: true,
            remoteMethod: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            visibleChange: (queryString, item, row) => {
              this.querySettleUnit2({ queryString, unitTypes: 'company' }, item)
            },
            remoteSelectList: [],
          },
          settleCorpType: { label: this.$t('FeeList.settleCorpType'), type: 'select', multiple: true, prop: 'settleUnitType' },
          isTemporary: { label: this.$t('Collect.isVirtual'), type: 'select', prop: 'yesNo' },
          type: { label: this.$t('Collect.receiptType'), type: 'select', multiple: true, prop: 'receivableRegType' },
          createdBy: {
            label: this.$t('Common.createdBy'),
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList(queryString, item),
          },
          createdTime: { label: this.$t('Common.createTime'), type: 'datetimerange', format: 'yyyy-MM-dd HH:mm:ss' },
          updatedBy: {
            label: this.$t('Common.updatedBy'),
            type: 'remoteSelect',
            remoteSelectList: [],
            remoteMethod: (queryString, item) => this.getEmployeeList(queryString, item),
            visibleChange: (queryString, item) => this.getEmployeeList(queryString, item),
          },
          updatedTime: { label: this.$t('Common.updateTime'), type: 'daterange', format: 'yyyy-MM-dd' },
        },
      },
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      width: '150px',
      data: [
        {
          label: this.$t('Common.details'),
          type: 'text',
          showFn: () => this.checkAuth(this.$route.name, 'tab-regList', 'btn-detail'),
          action: 'showDetail',
        },
        {
          label: this.$t('Common.modify'),
          type: 'text',
          showFn: (row) => row.confirmStatus !== 'yes' && this.checkAuth(this.$route.name, 'tab-regList', 'btn-edit'),
          action: 'Edit',
          colorType: 'edit',
        },
        {
          label: this.$t('Common.log'),
          type: 'text',
          show: true,
          action: 'showLog',
        },
      ],
    })
    let pagination = Object.assign({}, this.option.pagination, { show: true, isNew: true })
    let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
    this.option1 = Object.assign({}, this.option, {
      customColumns: {
        show: true,
        handleCustomColumns: () => {
          if (!this.isNotFirtGetData) {
            this.getData(false, true).then((res) => setTimeout(() => (this.customColumnsPopShow = true), 600))
          } else {
            this.customColumnsPopShow = true
          }
        },
      },
      id: 'option1',
      $name: 'regList1',
      data: [],
      tips: { text: '', show: false },
      operationBtns,
      pagination,
      listAmtSummary,
      maxHeight: this.getFinanceTableMaxHeight,
      sortable: true,
      sortChange: (column, prop, order) => {
        this.descColumns = order == 'descending' ? [prop] : []
        this.ascColumns = order == 'ascending' ? [prop] : []
        this.getData()
      },
      emptyText: this.$t('Common.emptyText'),
      colorColumns: ['writeoffStatus'],
    })
    let columns = [...this.selfColumnsBase]
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))

    this.option1.columns = columns
    this.option2 = Object.assign({}, this.option, {
      id: 'option2',
      $name: 'regList2',
      tips: {
        text: '',
        show: false,
      },
      selection: false,
      operationBtns: false,
      // index:true,
      pagination: Object.assign({}, this.option.pagination, {
        show: true,
        isNew: true,
      }),
      styleCfg: { padding: '8px 0' },
    })
    let columns2 = [
      {
        prop: 'createdTime',
        label: this.$t('Collect.operationTime'),
        type: 'text',
        width: '180px',
      },
      {
        prop: 'createdName',
        label: this.$t('Common.operators'),
        type: 'text',
        width: '104px',
      },
      {
        prop: 'operateContent',
        label: this.$t('Collect.operationMatters'),
        type: 'text',
        minWidth: '500px',
      },
    ]
    this.option2.columns = columns2
    // this.getData()
    this.cTimestamp = new Date().getTime()
  },
  methods: {
    //获取列表
    getData(isSearch, customerList) {
      this.isNotFirtGetData = true
      let timeStamp = +new Date()
      if (this.diyTimeStamp && timeStamp - this.diyTimeStamp < 900) {
        return Promise.resolve()
      }
      this.diyTimeStamp = timeStamp
      this.lsLoading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: customerList ? 0 : this.option1.pagination.pageSize,
        columns: [],
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
        query: [],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
        data.columns = this.customColumnsKeys
      }
      this.finCommonSearch(data.query, this.searchOption)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      if (this.buttonSearch) {
        data.query.push({ column: 'confirmStatus', type: 'eq', value: this.buttonSearch })
      }
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      return regListPage(data)
        .then((res) => {
          this.finCommonColumns(res)
          if (customerList) return
          // if (res.data.configColumns && res.data.configColumns.length) {
          //   let columns = res.data.configColumns
          //   this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop)).filter((v) => v)
          //   this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
          //   this.configColumns = res.data.configColumns
          // }
          if (res.code === 0) {
            let { list } = res.data
            let data = []
            list.forEach((item) => {
              // item.invoiceNo_multiValue = item.invoiceNo.split(',')
              item.invoiceNos_multiValue = item.invoiceNos.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[1] ? arr[1] : arr[0]
              })
              item.invoiceReceivableIds_multiValue = item.invoiceNos.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[0]
              })
              //转字典
              let settleCorpTypeName = item.settleCorpType.split(',')
              item.settleCorpType = settleCorpTypeName
                .map((it) => {
                  let unitTypeObj = this.dictMap['unitType'].find((el) => el.value === it)
                  return unitTypeObj && unitTypeObj['label']
                })
                .toString()
              data.push(item)
            })
            this.option1.data = data
            this.table1DataBackup = [...this.option1.data]
            this.$set(this.option1, 'emptyText', this.$t('FeeList.noData'))
            Object.assign(this.option1.pagination, res.data)
            // this.option1.pagination.currPage = res.data.currPage
            // this.option1.pagination.pageSize = res.data.pageSize
            // this.option1.pagination.totalCount = res.data.totalCount
          }
        })
        .finally(() => {
          this.lsLoading = false
        })
      // this.debounceLs(() => {
      //   this.getListAmtSummary(data)
      // })
    },
    getListAmtSummary(data) {
      getRegListAmtSummary(data).then((res) => {
        if (res.code === 0 && res.data) {
          let labelObj = {
            realAmtListLabel: this.$t('Collect.amountReceived'),
            preceiveBalanceAmtListLabel: this.$t('Collect.receivedAvailable'),
          }
          let colorObj = {
            preceiveBalanceAmtListColor: 'red', // 支持red, green, black三种值
            realAmtListColor: 'green',
          }
          let data = res.data
          this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
            show: true,
            data,
            labelObj,
            colorObj,
          })
        }
      })
    },
    //获取日志列表
    getList(params) {
      let data = {
        currPage: this.option2.pagination.currPage,
        pageSize: this.option2.pagination.pageSize,
        columns: [],
        ascColumns: params && params.order === 'ascending' ? [params.prop] : [],
        descColumns: params && params.order === 'descending' ? [params.prop] : [],
        query: [
          { column: 'module', type: 'default', value: 'receivable_reg' },
          { column: 'businessNo', type: 'default', value: this.receivableRegNo },
        ],
      }
      operateLog(data).then((res) => {
        let { list } = res.data
        this.option2.data = list || []
        // this.table1DataBackup = [
        //   ... this.option2.data
        // ]
        Object.assign(this.option2.pagination, res.data)
        // this.option2.pagination.currPage = res.data.currPage
        // this.option2.pagination.pageSize = res.data.pageSize
        // this.option2.pagination.totalCount = res.data.totalCount
      })
    },
    //录入收款登记新增修改确认按钮
    addRegSubmit() {
      console.log(this.addRegForm)
      // return
      this.$refs.addRegForm.validate((valid) => {
        if (valid) {
          if (!this.validateMoney(this.addRegForm.realAmt, { positive: true })) {
            return
          }
          if (!this.validateMoney(this.addRegForm.outerTransferFee, { positive: true })) {
            return
          }
          if (this.addRegForm.realAmt == 0) {
            return this.$msgErrClose(this.$t('Collect.zeroTips'))
          }
          let str = ''
          console.log(
            this.addRegForm.hasIntrabranch,
            this.addRegForm.recvCompCode,
            this.$store.state.user.userInfo.settleCompanyCode
          )
          // return
          if (
            this.addRegForm.hasIntrabranch !== 'yes' &&
            this.addRegForm.recvCompCode !== this.$store.state.user.userInfo.settleCompanyCode
          ) {
            str = this.$t('Collect.interBranch')
          }
          if (this.addRegType === 'add') {
            // delete this.addRegForm.outerTransferFeeList // 不删除也可
            let data = { ...this.addRegForm }
            // Object.assign(data, {}, { payAccountName: this.addRegForm.payAccountName.replace(/\(.*?\)/g, '') })
            Object.assign(data, {}, { payAccountName: this.addRegForm._diyAccountName })
            // 内扣手续费去掉 20210707
            // regAdd(data).then((res) => {
            if (!this.selectedOptionItem1 && !this.addRegForm.settleCorpCode) {
              str = (str ? str + this.$t('Common.and') : str) + this.$t('Collect.associatedTips')
            }
            if (str) {
              this.$confirmWarn(str, () => this.regAdd(data))
            } else {
              this.regAdd(data)
            }
          } else {
            // delete this.addRegForm.outerTransferFee // 不删除也可
            let data = { ...this.addRegForm }
            // 不再利用正则，利用保存的选项记录 addRegForm._diyAccountName
            // Object.assign(data, {}, { payAccountName: this.addRegForm.payAccountName.replace(/\(.*?\)/g, '') })
            Object.assign(data, {}, { payAccountName: this.addRegForm._diyAccountName || this.addRegForm.payAccountName })
            // let innerTransferFeeList = this.addRegForm.transferFeeList.filter((item) => {
            //   item.transferFee = item.amt
            //   item.currency = this.addRegForm.currency
            //   return item.cutType === 'inter_cut'
            // })
            // 内扣手续费去掉 20210707  // 内扣手续费加上 20211230
            data.transferFeeList = this.addRegForm.outerTransferFeeList.concat(this.addRegForm.innerTransferFeeList) // 提交修改收款登记的手续费时，内扣外扣都提交
            console.log(this.addRegForm.fixedTransferFee, this.hasFixedTransferFee)
            if (this.addRegForm.fixedTransferFee && this.hasFixedTransferFee) {
              data.transferFeeList.push({ cutType: 'fixed', transferFee: this.addRegForm.fixedTransferFee })
            }
            // data.transferFeeList = this.addRegForm.outerTransferFeeList // 提交修改收款登记的手续费时，内扣外扣都提交
            let list = data.transferFeeList.filter((item) => +item.transferFee)
            // console.log(JSON.stringify(list));
            list.forEach((item) => (item.currency = data.currency))
            data.transferFeeList = list.length ? list : undefined
            if (!this.selectedOptionItem1 && data.payAccountName != this.backupEdit.payAccountName) {
              str = (str ? str + '且' : str) + this.$t('Collect.noPayment')
            }
            if (str) {
              this.$confirmWarn(str, () => this.regUpdate(data))
            } else {
              this.regUpdate(data)
            }
          }
        }
      })
    },
    regUpdate(data) {
      regUpdate(data).then((res) => {
        this.$msgSucClose(this.$t('Hedge.modifyTips'))
        this.dialogVisible = false
        this.getData()
      })
    },
    regAdd(data) {
      this.addBtnLoading = true
      regAdd({ ...data, innerTransferFee: undefined, innerTransferFeeList: undefined })
        .then((res) => {
          this.$msgSucClose(this.$t('Collect.addSuc'))
          this.dialogVisible = false
          this.showDetail(res.data)
        })
        .finally(() => {
          this.addBtnLoading = false
        })
    },
    bankList2(queryString, cb) {
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
    //付款账户名
    orgBankAccount(queryString, cb) {
      if (this.addRegForm.currency === '') {
        cb([])
        return this.$message({ message: this.$t('Collect.currencyFirst'), type: 'error', showClose: true })
      }
      let data = {
        currPage: 1,
        pageSize: 30,
        accountName: queryString,
        currency: this.addRegForm.currency,
        unitCode: this.addRegForm.settleCorpCode,
        status: 'effect',
      }
      listReceivableRegAccount(data).then((res) => {
        const results = []
        const list = res.data ? res.data : []
        this.isSettleSelect = false
        if (!list.length && !this.addRegForm.settleCorpCode) {
          this.isSettleSelect = true
          this.querySettleUnit1({ queryString, containTemporary: 'no', containHistoryUnitName: 'no' }, cb)
          return
        }
        list.forEach((item) => {
          results.push({ ...item, key: item.accountNo, value: item.accountName + '(' + item.accountNo.slice(-4) + ')' })
        })
        cb(results)
      })
    },
    querySettleUnit1(queryString, cb) {
      this.$store.dispatch('dict/querySettleUnit', queryString, true).then((data) => {
        cb(data)
      })
    },
    bankAccountListChange(string, item) {
      let query = { unitType: 'company', accountShortName: string, status: 'effect' }
      listReceivableRegAccount(query).then(({ data }) => {
        let list = (data.length ? data : []).filter((v) => v.accountShortName)
        list = list.map((item) => ({ ...item, label: item.accountShortName, value: item.accountShortName }))
        if (this.remoteSelectCommon(item, list)) return
        item.remoteSelectList.splice(0, 1000, ...list)
      })
    },
    //收款银行
    bankAccountList(queryString) {
      // 'addRegForm.recvWay'  chinese_mainland国内 hk_china香港 abroad海外 cheque支票 intrabranch内部往来
      let recvWay = this.addRegForm.recvWay
      let data = {
        unitCode: this.$store.state.user.userInfo.settleCompanyCode,
        currency: this.addRegForm.currency,
        accountShortName: queryString,
        status: 'effect',
        receipayType: 'receive',
        // hasChequeAcct: recvWay === 'cheque' ? 'yes' : '', // 是否支票账户
        countryOrgType: ['cheque', 'intrabranch'].includes(recvWay) ? '' : recvWay, // 区域
        hasIntrabranch: recvWay === 'intrabranch' ? 'yes' : 'no', // 是否内部往来
      }
      bankAccountList(data).then((res) => {
        let list = res.data ? res.data : []
        this.bankAccountSelectOptions = list.map((item, index) => {
          item.value = item.settleUnitBankAcctId
          item.label = item.accountShortName
          return item
        })
      })
    },
    //收款银行改变
    bankAccountChange(value) {
      console.log('````````bankAccountChange')
      let obj = this.bankAccountSelectOptions.find((item) => {
        return item.settleUnitBankAcctId === value
      })
      this.recvNeedBankseqBoolean = obj.recvNeedBankseq === 'yes'
      this.hasFixedTransferFee = obj.hasFixedTransferFee === 'yes' && obj.bankCode === 'B0249H231000001'
      if (this.hasFixedTransferFee) {
        getFixedTranferFeeList({ currency: this.addRegForm.currency }).then((res) => {
          this.addRegForm.fixedTransferFee = res.data[this.addRegForm.currency] || ''
        })
      } else {
        this.addRegForm.fixedTransferFee = ''
      }
      this.addRegForm.bankName = obj.bankName
      this.addRegForm.accountNo = obj.accountNo
      this.bankAccountSettleModeList = obj.settleMode.map((item) => {
        let dict = this.dictMap.bankAccountSettleMode
        return dict.find((v) => v.value === item)
      })
      this.addRegForm.settleMode = this.bankAccountSettleModeList[0] ? this.bankAccountSettleModeList[0].value : ''
      this.addRegForm.accountShortName = obj.accountShortName
      if (this.addRegForm.hasIntrabranch === 'yes') {
        this.addRegForm.recvCompName = this.$store.state.user.userInfo.settleCompanyName
        this.addRegForm.recvCompCode = this.$store.state.user.userInfo.settleCompanyCode
      } else {
        this.addRegForm.recvCompName = obj.companyName
        this.addRegForm.recvCompCode = obj.companyCode
      }
      this.addRegForm.compBankAccountId = obj.settleUnitBankAcctId
      this.addRegForm.hasIntrabranch = obj.hasIntrabranch
    },
    employeeSelectlist(queryString) {
      let data = { state: 'valid', name: queryString }
      this.$store.dispatch('dict/employeeSelectlist', data).then((data) => {
        this.employeeSelectOptions = data.map((item) => ({ label: item.value, value: item.key }))
      })
    },
    //新增按钮
    handleAdd() {
      this.hasFixedTransferFee = this.recvNeedBankseqBoolean = false
      this.addRegForm.fixedTransferFee = ''
      // 付款账户名对象，付款账户名手动改变时清空，
      this.addRegType = 'add'
      // let { settleCompanyName: recvCompName, settleCompanyCode: recvCompCode } = this.$store.state.user.userInfo
      // Object.assign(this.addRegForm, JSON.parse(JSON.stringify(DefaultData)), { recvCompName, recvCompCode })
      Object.assign(this.addRegForm, JSON.parse(JSON.stringify(DefaultData)))
      this.bankAccountSelectOptions = [] //清除收款银行下拉
      this.selectedOptionItem1 = ''
      this.selectedOptionItem2 = '1'
      this.publicTypeDisabled = false
      this.oldAccountName = ''
      this.dialogVisible = true
    },
    //修改登记
    handleEdit(row) {
      this.hasFixedTransferFee = this.recvNeedBankseqBoolean = false
      this.addRegForm.fixedTransferFee = ''
      let data = {
        receivableRegId: row.receivableRegId,
      }
      this.settleRemoteList = [{ label: row.settleCorpName, value: row.settleCorpCode }]
      regInfo(data).then((res) => {
        this.addRegType = 'modify'
        Object.assign(this.addRegForm, JSON.parse(JSON.stringify(DefaultData)), res.data)
        setTimeout(() => {
          this.bankAccountSettleModeList = (res.data.settleModeList || []).map((item) => {
            let dict = this.dictMap.bankAccountSettleMode
            return dict.find((v) => v.value === item)
          })
        }, 0)
        this.backupEdit = res.data
        let transferFeeList = res.data.transferFeeAllotList.map((item) => ({ ...item, transferFee: item.amt }))
        let outerList = transferFeeList.filter((item) => item.cutType === 'exter_cut')
        let innerList = transferFeeList.filter((item) => item.cutType === 'inter_cut')
        this.addRegForm.outerTransferFeeList = outerList.length ? outerList : [{ cutType: 'exter_cut', transferFee: '' }]
        this.addRegForm.innerTransferFeeList = innerList.length ? innerList : [{ cutType: 'inter_cut', transferFee: '' }]
        // this.addRegForm.transferFeeList = res.data.transferFeeList
        // this.addRegForm.recvCompName = this.$store.state.user.userInfo.settleCompanyName
        // this.addRegForm.recvCompCode = this.$store.state.user.userInfo.settleCompanyCode
        // 修改时，取原登记信息的分公司
        // this.addRegForm.recvCompName = res.data.recvCompName
        // this.addRegForm.recvCompCode = res.data.recvCompCode
        // console.log(this.addRegForm)
        this.selectedOptionItem1 = ''
        this.selectedOptionItem2 = '1'
        this.publicTypeDisabled = false
        this.oldAccountName = ''
        this.dialogVisible = true
        this.$nextTick(() => {
          this.addRegForm.accountShortName = res.data.accountShortName
          this.addRegForm.accountNo = res.data.accountNo
          this.addRegForm.recvCompName = res.data.recvCompName
          this.addRegForm.recvCompCode = res.data.recvCompCode
          this.$nextTick(() => {
            this.addRegForm.settleMode = res.data.settleMode
            this.addRegForm.fixedTransferFee = res.data.fixedTransferFee
            this.recvNeedBankseqBoolean = res.data.recvBankAcct?.recvNeedBankseq === 'yes'
            this.hasFixedTransferFee =
              res.data.recvBankAcct?.hasFixedTransferFee === 'yes' && res.data.recvBankAcct?.bankCode === 'B0249H231000001'
          })
          // this.addRegForm.settleMode = ''
          // this.bankAccountSettleModeList = obj.settleMode.map((item) => {
          //   let dict = this.dictMap.bankAccountSettleMode
          //   return dict.find((v) => v.value === item)
          // })
          if (res.data.bankseqFileName) {
            this.$refs.FinUploadEmbed.fileList.push({ name: res.data.bankseqFileName })
          }
          if (res.data.payBankseqFileName) {
            this.$refs.FinUploadEmbed2.fileList.push({ name: res.data.payBankseqFileName })
          }
          let data = {
            currPage: 1,
            pageSize: 30,
            accountName: this.addRegForm.payAccountName,
            currency: this.addRegForm.currency,
            status: 'effect',
          }
          this.isSettleSelect = false
          listReceivableRegAccount(data).then((res) => {
            const list = res.data ? res.data : []
            const find = list.find((item) => {
              return item.accountName === this.addRegForm.payAccountName && item.accountNo === this.addRegForm.payAccountNo
            })
            console.log(find)
            if (find) {
              this.oldAccountName = this.addRegForm.payAccountName
              this.selectedOptionItem1 = this.selectedOptionItem2 = find
              if (this.addRegForm.payAccountPublicType) this.publicTypeDisabled = true
            }
          })
        })
      })
    },
    // 批量导入
    openUpload(uploadType) {
      this.uploadType = uploadType
      if (uploadType === 'batchImport') {
        this.uploadTitle = this.$t('Common.batchImport')
        this.uploadApi = '/fin/receivableReg/importBatch'
      }
      this.showUpload = true
    },
    //下载失败
    onSendResUpload() {
      let fileNo = this.errorFile.fileNo
      let name = this.errorFile.name
      this.$store.dispatch('order/downloadBlobFile', { uri: '/base/webapi/file/download', params: { fileNo } }).then((res) => {
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(res)
        link.download = name
        link.click()
      })
    },
    //批量导入
    sendResUpload(data) {
      if (data.uploadTitle === this.$t('Common.batchImport')) {
        this.errorFile = data.data.errorFile
        const h = this.$createElement
        let message
        if (data.data.errorFile) {
          message = h('div', { style: 'text-align:center;padding:10px 0' }, [
            h('i', { class: 'el-icon-warning', style: 'display: inline-block;font-size: 38px;color:#CD4130' }, ''),
            h('p', null, this.$t('Collect.exceptionTips')),
            h('p', null, data.data.resultMsg),
            h('a', { style: 'color: #3E80F5;text-decoration:underline;', on: { click: this.onSendResUpload } }, this.$t('Collect.DownloadErr')),
          ])
        } else {
          message = h('div', { style: 'text-align:center;padding:16px 0' }, [
            h('i', { class: 'el-icon-success', style: 'display: inline-block;font-size: 38px;color:#33B18A' }, ''),
            h('p', null, data.data.resultMsg),
          ])
        }
        this.$msgbox({ title: '', message, showCancelButton: false, confirmButtonText: this.$t('Common.close')})
          .then((action) => {})
          .catch((err) => {})
      }
    },
    closeUpload() {
      this.showUpload = false
      this.getData()
    },
    // 批量转预收
    toPrerevAction(rows) {
      rows = rows || this.multipleSelection1
      // 内扣手续费为0 ， 收款登记状态为已确认 ， 核销状态为 未核销
      if (rows.length === 0) {
        return this.$msgErrClose(this.$t('Collect.transferrTips'))
      }
      if (rows.length === 1 && !rows[0].settleCorpName) {
        this.settleRow = rows[0]
        this.exchangeCorpDialogAssist = true
        this.exchangeCorpFrom = 'toPrerev'
        return
      }
      if (rows.filter((v) => !v.settleCorpName).length) {
        return this.$msgErrClose(this.$t('Collect.unitFirst'))
      }
      let arr = rows.filter((v) => v.interTransferFee == 0)
      if (!arr.length) {
        return this.$msgErrClose(this.$t('Collect.deductionFee'))
      }
      arr = arr.filter((v) => v.confirmStatus === 'yes')
      if (!arr.length) {
        return this.$msgErrClose(this.$t('Collect.registrationTips'))
      }
      arr = arr.filter((v) => v.writeoffStatus === 'nofinish')
      if (!arr.length) {
        return this.$msgErrClose(this.$t('Collect.writtenoffTips'))
      }
      this.$confirmWarn(this.$t('Collect.transferTips'), () => {
        let data = { receivableRegIds: arr.map((item) => item.receivableRegId) }
        toPrerev(data).then((res) => {
          this.$msgSucClose(this.$t('Collect.TransferpreTips'))
          this.getData()
        })
      })
    },
    handleSizeChange(val, option) {
      if (option.id === 'option1') {
        this.option1.pagination.pageSize = val
        this.getData && this.getData()
      }
      if (option.id === 'option2') {
        this.option2.pagination.pageSize = val
        this.getList && this.getList()
      }
    },
    handleCurrentChange(val, option) {
      if (option && option.id === 'option1') {
        this.option1.pagination.currPage = val
        this.getData && this.getData()
      } else if (option && option.id === 'option2') {
        this.option2.pagination.currPage = val
        this.getList && this.getList()
      } else {
        this.option1.pagination.currPage = val
        this.getData && this.getData()
      }
    },
    // 申请退款
    handleRefund(rows) {
      rows = rows || this.multipleSelection1
      if (rows.length === 0) {
        return this.$msgErrClose(this.$t('Collect.refundTips'))
      }
      if (rows.length > 1) {
        return this.$msgErrClose(this.$t('Collect.checkedTips'))
      }
      if (rows[0].writeoffStatus === 'finish') {
        return this.$msgErrClose(this.$t('Collect.receivableTips', {receivableRegNo: rows[0].receivableRegNo}))
      }
      if (rows[0].confirmStatus !== 'yes') {
        return this.$msgErrClose(this.$t('Collect.unconfirmedTips', {receivableRegNo: rows[0].receivableRegNo}))
      }
      if (rows[0].interTransferFee != 0) {
        return this.$msgErrClose(this.$t('Collect.deductionTips'))
      }
      if (rows[0].isTemporary === 'yes') {
        return this.$msgErrClose(this.$t('Collect.virtualTips'))
      }
      // if (rows[0].intrabranchAccount === 'yes') {
      //   return this.$msgErrClose(this.$t('Collect.correspondence'))
      // }
      if (!rows[0].settleCorpName) {
        this.settleRow = rows[0]
        this.exchangeCorpFrom = 'refund'
        this.exchangeCorpDialogAssist = true
        return
      }
      //申请退款查退款账号ID
      if (!rows[0].payAccountName) {
        this.$store
          .dispatch('dict/bankAccountList', {
            accountNo: rows[0].payAccountNo,
            accountName: rows[0].payAccountName,
            unitCode: rows[0].payCorpCode,
            receipayType: 'receive',
          })
          .then((data) => {
            let obj = data[0]
            this.parameter(obj, rows)
          })
      } else {
        this.parameter(undefined, rows)
      }
    },
    // goRefund(row){

    // },
    // payBankChange(val) {
    //   this.addRegForm.payBankName = val.bankName
    //   this.addRegForm.payBankCode = val.bankCode
    //   this.addRegForm.payAccountName = val.accountName
    //   this.addRegForm.payAccountNo = val.accountNo
    //   this.addRegForm.payBankAccountId = val.orgid
    // },
    //申请退款参数
    parameter(data, rows) {
      console.log(data)
      console.log(rows)
      let arr = rows.map((item) => {
        return {
          title: this.$t('Collect.refundable'),
          receivableRegId: item.receivableRegId,
          preceiveAmt: item.realAmt,
          currency: item.currency,
          recvCompCode: item.recvCompCode,
          recvBankName: data && data.settleUnitBankAcctId ? data.bankName : item.payBankName,
          recvAccountNo: data && data.settleUnitBankAcctId ? data.accountNo : item.payAccountNo,
          recvAccountName: data && data.settleUnitBankAcctId ? data.accountName : item.payAccountName,
          recvBankAccountId: data && data.settleUnitBankAcctId ? data.settleUnitBankAcctId : null,
          refund: 'prerev', //判断退款接口是预收退款还是收款登记退款
          employeeName: '',
          refundType: 'overpayment',
          refundCurrency: item.currency,
          payWay: item.recvWay ? item.recvWay : '',
          settleMode: item.settleMode ? item.settleMode : '',
          transferChargeType: 'customer',
          receiveRefundAmt: item.realAmt,
          transferFeeAmt: null,
          remark: '',
          payBankAccountId: item.compBankAccountId,
          payBankName: item.bankName,
          payAccountNo: item.accountNo,
          payAccountShortName: item.accountShortName,
          realRefundAmt: null,
          accountShortName: item.payAccountName,
          rate: 1,
          trustFileIds: [],
          isTemporary: item.isTemporary,
          settleCorpCode: item.settleCorpCode,
          recvAccountPublicType: item.payAccountPublicType || 'pub',
          payBankseqFileName: item.payBankseqFileName,
          payBankseqFileNo: item.payBankseqFileNo,
        }
      })
      this.query = arr[0]
      this.refundDialogVisible = true
    },
    refundSubmit() {
      console.log('this.fileList:', this.fileList)
      console.log('this.refundForm.fileIds:', this.refundForm.fileIds)
      this.$refs.refundForm.validate((valid) => {
        if (valid) {
          let data = Object.assign({}, this.refundForm, {
            receivableRegId: this.multipleSelection1[0].receivableRegId,
            trustFileIds: this.refundForm.fileIds,
          })
          regTransferRefund(data).then((res) => {
            this.$msgSucClose(this.$t('Collect.refundSub'))
            this.refundDialogVisible = false
          })
        }
      })
    },
    //撤销确认
    handleCancelConfirm() {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose(this.$t('Collect.deRegistered'))
      }
      let data = { receivableRegIds: this.multipleSelection1.map((item) => item.receivableRegId) }
      let list = []
      let Lists = []
      for (let i = 0; i < this.multipleSelection1.length; i++) {
        if (this.multipleSelection1[i].confirmStatus === 'yes') {
          list.push(this.multipleSelection1[i].receivableRegNo)
        } else {
          Lists.push(this.multipleSelection1[i].receivableRegNo)
        }
      }
      Lists = Lists.length ? Lists : this.$t('Common.none')
      this.$confirmWarn(
        list.length
          ? this.$t('Collect.processingTips', { list: list.toString(), Lists: Lists.toString()})
          : this.$t('Collect.unprocessed', { Lists: Lists.toString()}),
        () => {
          cancelConfirm(data).then((res) => {
            this.$msgSucClose(this.$t('Collect.revocationTips'))
            this.getData()
          })
        }
      )
    },
    // 确认收款登记
    handleConfirm() {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose(this.$t('Collect.receiptTips'))
      }
      let data = { receivableRegIds: this.multipleSelection1.map((item) => item.receivableRegId) }
      let list = []
      let Lists = []
      for (let i = 0; i < this.multipleSelection1.length; i++) {
        if (this.multipleSelection1[i].confirmStatus === 'yes') {
          list.push(this.multipleSelection1[i].receivableRegNo)
        } else {
          Lists.push(this.multipleSelection1[i].receivableRegNo)
        }
      }
      Lists = Lists.length ? Lists : this.$t('Common.none')
      this.$confirmWarn(
        list.length
          ? this.$t('Collect.processingTips2', { list: list.toString(), Lists: Lists.toString()})
          : this.$t('Collect.unprocessed2', { Lists: Lists.toString()}),
        () => {
          regConfirm(data).then((res) => {
            this.$msgSucClose(
              Lists.length
                ? this.$t('Collect.recordsTips', { Lists: Lists.toString(), list: list.toString()})
                : this.$t('Collect.ignoredTips', { list: list.toString()}),
            )
            this.getData()
          })
        }
      )
    },
    regDelete(row) {
      if (this.multipleSelection1.length === 0) {
        return this.$msgErrClose(this.$t('Collect.needTips'))
      }
      let filterArr = this.multipleSelection1.filter((item) => item.confirmStatus !== 'yes')
      if (filterArr.length === 0) {
        return this.$msgErrClose(this.$t('Collect.unconfirmed'))
      }
      this.$confirmWarn(this.$t('Collect.delTips'), () => {
        regDelete({ receivableRegIds: filterArr.map((item) => item.receivableRegId) }).then((res) => {
          this.$msgSucClose(this.$t('Settle.deleteSuc'))
          this.getData()
        })
      })
    },
    // querySettleUnit(queryString, cb) {
    //   this.$store.dispatch('dict/currencyList', queryString || '').then((data) => cb(data))
    // },
    // 收款核销按钮
    handleWriteoffRecv() {
      let rows = this.multipleSelection1
      if (rows.length === 0) {
        return this.$msgErrClose(this.$t('Collect.collectedTips'))
      }
      if (rows.length > 1) {
        return this.$msgErrClose(this.$t('Collect.onlyTips'))
      }
      if (!rows[0].settleCorpName) {
        this.settleRow = rows[0]
        this.exchangeCorpFrom = 'detail'
        this.exchangeCorpDialogAssist = true
        return
      }
      if (rows[0].writeoffStatus === 'finish') {
        return this.$msgErrClose(this.$t('Collect.receivableTips', {receivableRegNo: rows[0].receivableRegNo}))
      }
      if (rows[0].confirmStatus !== 'yes') {
        return this.$msgErrClose(this.$t('Collect.unconfirmedTips', {receivableRegNo: rows[0].receivableRegNo}))
      }
      this.showDetail(rows[0])
    },
    sendMulti(data, option) {
      this.multipleSelection1 = data
      let data2 = { ascColumns: [], descColumns: [], query: [] }
      let ids = this.multipleSelection1.map((item) => item.receivableRegId).join(',')
      if (ids) {
        data2.query.push({ column: 'receivableRegIds', type: 'eq', value: ids })
      } else {
        data2.query = this.searchBackup || []
      }
      if ((data.length || this.option1.listAmtSummary.count++ > 0) && option.id === 'option1') {
        this.debounceLs(() => {
          this.getListAmtSummary(data2)
        })
      }
    },
    search(data) {
      this.buttonSearch = data
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    // 显示详情
    showDetail(row) {
      if (!row.settleCorpName && row.confirmStatus == 'yes') {
        this.settleRow = row
        this.exchangeCorpFrom = 'detail'
        this.exchangeCorpDialogAssist = true
        return
      }
      this.goDetail(row)
    },
    goDetail(row) {
      this.$emit('update:isJumpRouteFromPage', true)
      this.$router.push({
        name: 'WriteoffRecvDetail',
        query: { receivableRegId: row.receivableRegId },
      })
    },
    //币种改变清除收款银行 付款银行
    currencyChange() {
      console.log('````````````currencyChange')
      this.addRegForm.bankName = ''
      this.addRegForm.accountNo = ''
      this.addRegForm.settleMode = ''
      this.bankAccountSettleModeList = []
      this.addRegForm.accountShortName = ''
      this.addRegForm.compBankAccountId = ''

      this.addRegForm.payAccountName = ''
      this.addRegForm.payAccountNo = ''
      this.addRegForm.payBankName = ''

      this.hasFixedTransferFee = this.addRegForm.fixedTransferFee = ''
    },
    showLog(row) {
      this.businessNo = row.receivableRegId
      this.receivableRegNo = row.receivableRegNo
      this.getList()
      this.logDialogVisible = true
    },
    refundDialog(val, isBreak) {
      this.refundDialogVisible = val
      if (isBreak === true) {
        this.getData()
      }
    },
    stockDownload() {
      this.$store
        .dispatch('finance/downloadBlobFile', {
          uri: '/fin/receivableReg/templateDownload',
          params: {},
        })
        .then((res) => {
          let link = document.createElement('a')
          link.href = window.URL.createObjectURL(res)
          link.download = `${this.$t('Collect.registerTem')}.xlsx`
          link.click()
        })
      // stockDownload({ folder: 'excel', FileName: 'so_import_temp.xlsx' }).then((res) => {})
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
      if (!countryCode) return (this.addRegForm.payAccountCountryName = '')
      let find = this.COUNTRYLIST.find((item) => item.value === countryCode)
      this.addRegForm.payAccountCountryName = find.cname
    },
    querySettleUnit(queryString) {
      this.querySettleUnit2({ queryString, containTemporary: 'yes' }, '', true, this.settleRemoteList)
    },
    listSettleUnit() {
      let { payAccountNo, payAccountName, currency } = this.addRegForm
      if ((!currency, !payAccountName)) {
        return this.$msgErrClose(this.$t('Collect.accountTips'))
      }
      listSettleUnit({ accountNo: payAccountNo, accountName: payAccountName, currency }).then((res) => {
        this.settleRemoteList = res.data.map((v) => {
          return { ...v, value: v.unitCode, label: v.unitName }
        })
      })
    },
    // 选中结算单位
    selectSettleCorp(settleCorpCode) {
      console.log(settleCorpCode)
      // 结算单位的值变动时，清空所有付款信息，且初始化付款账户名下拉的逻辑
      this.publicTypeDisabled = false
      // this.addRegForm.payAccountName = this.oldAccountName = this.addRegForm._diyAccountName = ''
      // this.addRegForm.cname = this.addRegForm.email = ''
      // this.addRegForm.payAccountCountryName =
      //   this.addRegForm.payAccountCountryCode =
      //   this.addRegForm.payAccountSwiftCode =
      //   this.addRegForm.payAccountBankCompAddr =
      //   this.addRegForm.payBankName =
      //   this.addRegForm.payAccountNo =
      //   this.addRegForm.payBankBranch =
      //   this.selectedOptionItem1 =
      //   this.selectedOptionItem2 =
      //     ''
      // this.addRegForm.payAccountPublicType = 'pub'
      if (!settleCorpCode) {
        this.addRegForm.settleCorpName = ''
        return
      }
      let find = this.settleRemoteList.find((item) => item.value === settleCorpCode)
      this.addRegForm.settleCorpName = find.label
    },
    sendFileList(data) {
      let { filePath = '', name = '', fileNo = '' } = data
      Object.assign(this.addRegForm, { bankseqFilePath: filePath, bankseqFileName: name, bankseqFileCode: fileNo })
    },
    sendFileList2(data) {
      let { filePath = '', name = '', fileNo = '' } = data
      Object.assign(this.addRegForm, { payBankseqFilePath: filePath, payBankseqFileName: name, payBankseqFileNo: fileNo })
    },
    exportBtn() {
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        columns: this.option1.columns.map((v) =>
          v.prop === 'bankseqFileCode' ? 'hasBankseqFile' : v.prop === 'payBankseqFileNo' ? 'hasPayBankseqFile' : v.prop
        ),
        query: [...(this.searchBackup || [])],
      }
      if (this.multipleSelection1.length) {
        data.query = [
          { column: 'receivableRegIds', type: 'in', value: this.multipleSelection1.map((v) => v.receivableRegId).join(',') },
        ]
      }
      //查询对象的配置编码
      data.query.push({ column: 'queryDataModuleCode', value: 'receivableRegListExport' })

      this.lsLoading = true
      this.$store
        .dispatch('finance/downloadBlobFilePost', { uri: '/fin/common/queryDataExportExcel', data: { data } })
        .then((res) => this.aTagClick(window.URL.createObjectURL(res), `${this.$t('Collect.registreList')}.xlsx`))
        .finally(() => (this.lsLoading = false))
    },
    changeSettleCorp() {
      let rows = this.multipleSelection1
      if (rows.length !== 1) {
        return this.$msgErrClose(this.$t('Collect.selectOne'))
      }
      if (this.multipleSelection1[0].writeoffStatus === 'finish') {
        return this.$msgErrClose(this.$t('Collect.cannotTips'))
      }
      this.settleRow = this.multipleSelection1[0]
      this.settleCorpSelectRemoteAssist()
    },
    exchangeCorpAssist() {
      this.$refs.corpFormAssist.validate((valid) => {
        if (!valid) return
        let { value: settleCorpCode, label: settleCorpName } = this.corpFormAssist.settleCorp
        // if (settleCorpCode && this.multipleSelection1[0].settleCorpCode === settleCorpCode) {
        //   return this.$msgErrClose('所选结算单位与原结算单位一致，无需修改！')
        // }
        // let row = { ...this.settleRow, settleCorpName, settleCorpCode }
        // console.log(this.exchangeCorpFrom)
        // console.log(row)
        
        // if (this.exchangeCorpFrom === 'detail') {
        //   setTimeout(() => {
        //     this.goDetail(row)
        //   }, 100)
        // } else if (this.exchangeCorpFrom === 'refund') {
        //   this.handleRefund([row])
        // } else if (this.exchangeCorpFrom === 'toPrerev') {
        //   this.toPrerevAction([row])
        // }
        // this.exchangeCorpDialogAssist = false
        // return
        updateSettleUnit({
          receivableRegId: this.settleRow.receivableRegId,
          settleCorpCode,
          settleCorpName,
        }).then((res) => {
          this.$msgSucClose(this.$t('Collect.settlementTips'))
          this.getData()
          let row = { ...this.settleRow, settleCorpName, settleCorpCode }
          if (this.exchangeCorpFrom === 'detail') {
            setTimeout(() => {
              this.goDetail(row)
            }, 100)
          } else if (this.exchangeCorpFrom === 'refund') {
            this.handleRefund([row])
          } else if (this.exchangeCorpFrom === 'toPrerev') {
            this.toPrerevAction([row])
          }
          this.exchangeCorpDialogAssist = false
        })
      })
    },
    settleCorpSelectRemoteAssist() {
      listSettleUnit({ receivableRegId: this.settleRow.receivableRegId }).then((res) => {
        if (!res.data.length) {
          return this.$msgErrClose(this.$t('Collect.matchedTips'))
        }
        this.exchangeCorpDialogAssist = true
        this.settleCorpSelectListAssist = res.data.map((item) => ({ label: item.unitName, value: item.unitCode }))
      })
    },
    // 协助代收付分公司
    markAssistedComp() {
      let rows = this.multipleSelection1
      if (rows.length !== 1) {
        return this.$msgErrClose(this.$t('Collect.selectOne'))
      }
      if (rows[0].writeoffStatus === 'finish') {
        return this.$msgErrClose(this.$t('Collect.cannotTips'))
      }
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
          receivableRegId: this.multipleSelection1[0].receivableRegId,
          assistedCompCode: this.corpFormAssist2.settleCorp.value,
          assistedCompName: this.corpFormAssist2.settleCorp.label,
        }).then((res) => {
          this.$msgSucClose(this.$t('Collect.appointedTips'))
          this.exchangeCorpDialogAssist2 = false
          this.getData()
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
  },
  watch: {
    exchangeCorpDialogAssist(val) {
      console.log(this.settleRow)
      if (!val) {
        this.exchangeCorpFrom = ''
        this.corpFormAssist.settleCorp = ''
      }
    },
    'addRegForm.accountShortName'(val) {
      if (!val) {
        this.recvNeedBankseqBoolean = false
      }
    },
    // 银行流水必填
    recvNeedBankseqBoolean(val) {
      this.$set(this.addRegRules.bankSeqNo[0], 'required', val)
      if (!val) {
        this.$refs.addRegForm && this.$refs.addRegForm.clearValidate('bankSeqNo')
      }
    },
    // 收款方式
    'addRegForm.recvWay': {
      handler(val, oldVal) {
        this.addRegForm.accountShortName = this.addRegForm.accountNo = this.addRegForm.recvCompName = ''
        this.hasFixedTransferFee = this.addRegForm.fixedTransferFee = ''
        this.addRegForm.settleMode = ''
        this.bankAccountSettleModeList = []
        //  chinese_mainland国内 hk_china香港 abroad海外 cheque支票 intrabranch内部往来
        if (val === 'intrabranch') {
          this.addRegRules.settleMode.required = false
        } else {
          this.addRegRules.settleMode.required = true
        }
        // if (val === 'cheque') {
        //   this.addRegRules.settleCorpCode[0].required = true
        //   this.addRegRules.payAccountName[0].required = false
        //   this.addRegRules.payAccountNo = []
        //   this.addRegRules.payAccountPublicType.required = false
        // } else {
        //   this.addRegRules.settleCorpCode[0].required = false
        //   this.addRegRules.payAccountName[0].required = true
        //   this.addRegRules.payAccountNo = this.specialRule
        //   this.addRegRules.payAccountPublicType.required = true
        // }
      },
    },
    // 账号结算方式
    'addRegForm.settleMode': {
      handler(val, oldVal) {
        if (val === 'cheque') {
          this.addRegRules.settleCorpCode[0].required = true
          this.addRegRules.payAccountName[0].required = false
          this.addRegRules.payAccountNo = []
          this.addRegRules.payAccountPublicType.required = false
        } else {
          this.addRegRules.settleCorpCode[0].required = false
          this.addRegRules.payAccountName[0].required = true
          this.addRegRules.payAccountNo = this.specialRule
          this.addRegRules.payAccountPublicType.required = true
        }
      },
    },
    // 付款账户名
    'addRegForm.payAccountName': {
      handler(newVal, oldVal) {
        // console.log(newVal)
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          // this.oldAccountName =
          console.log(newVal)
          this.addRegForm.payAccountName = this.addRegForm._diyAccountName = newVal
          if (this.selectedOptionItem1 === '' && this.selectedOptionItem2 === '') {
            // 付款账户名不是下拉选项选中的值，清空所有联动的值
            console.log('`````````````payAccountName change')
            this.addRegForm.payAccountNo = ''
            this.addRegForm.payBankName = ''
            this.selectedOptionItem2 = '1'
            this.publicTypeDisabled = false
            this.addRegForm.cname = this.addRegForm.email = ''
            this.addRegForm.payAccountCountryName =
              this.addRegForm.payAccountCountryCode =
              this.addRegForm.payAccountSwiftCode =
              this.addRegForm.payAccountBankCompAddr =
              this.addRegForm.payBankBranch =
              this.addRegForm.settleCorpName =
              this.addRegForm.settleCorpCode =
                ''
            this.addRegForm.payAccountPublicType = 'pub'
          }
        }, 300)
      },
      deep: true,
      immediate: true,
    },
  },
  components: {
    FinanceTable,
    FinanceSearch,
    FinanceUpload,
    RefundDialog,
    CustomColumns,
    FinUploadEmbed,
  },
  activated() {
    // 首次进入直接返回，会由搜索组件触发搜索
    if (!this.isFirstActivated) {
      this.isFirstActivated = true
      return
    }
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache || (this.$route.meta.refresh && timestamp - this.cTimestamp > 300)) {
      this.handleCurrentChange(1, this.option1)
    }
  },
}
</script>
<style lang="scss" scoped>
.self__css ::v-deep {
  .receivable-file-upload {
    display: block;
    text-align: center;
  }
  .el-dialog__body {
    padding: 10px 20px;
    .el-form-item {
      margin-bottom: 8px;
    }
  }
}
.download-model {
  width: 100%;
  text-align: left;
}
.add_edit_dialog .el-form-item {
  &.full-item {
    width: 100%;
  }
  width: 440px;
  display: inline-flex;
  ::v-deep .el-form-item__content {
    flex: 1 1 auto;
    & > div {
      width: 100%;
    }
  }
}
.dialog-subarea {
  border-bottom: 1px solid #d8d8d8;
  &:nth-last-of-type(1) {
    border-bottom: none;
  }
  h3 {
    font-size: 14px;
    color: #222;
    padding: 12px 0 8px 0;
  }
}
</style>