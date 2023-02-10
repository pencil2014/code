<template>
  <div
    :element-loading-background="eLoadingBackground"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-text="eLoadingText"
    class="finance-page"
    v-loading="loading"
  >
    <div class="finance-list-container" @click="saveDzg">
      <!-- title 按钮区 -->
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">预收款核销</div>
        </div>
        <div class="money-box-right">
          <!-- 按钮过多，使用列表渲染 noConfirm未确认的收款登记显示  both确认或未确认都会显示 其它确认的时候显示 -->
          <template v-for="item in btnArr">
            <el-button
              :key="item.text"
              v-if="checkAuth($route.name, item.auth) && hasBalance && isNotLock"
              @click="($event) => item.params ? item.action(item.params) : item.action($event)"
              size="mini"
              :type="item.type"
            >{{item.text}}</el-button>
          </template>
          <el-button @click="cancel" size="mini">返回</el-button>
        </div>
      </div>
      <!-- 基本信息区 预收款信息， 收款信息， 付款信息 -->
      <RegDetailInfo
        v-if="isInit"
        :infoData="regWriteoffInfo"
        :isPre="true"
        @jumpToRoute="jumpToRoute"
      />

      <h3 class="title">核销信息</h3>
      <div class="writeoff-form" v-if="hasBalance">
        <DetailDiv label="可用核销金额：" :content="regWriteoffInfo.balance" />
        <DetailDiv label="剩余未用金额：" :content="regWriteoffInfo.unusedAmt" />
        <DetailDiv label="调账金额：" :isSlot="true">
          <el-input
            :disabled="!(hasBalance && isNotLock)"
            @change="changeAdjustAmt"
            size="mini"
            type="text"
            v-model="regWriteoffInfo.adjustAmt"
          ></el-input>
        </DetailDiv>
        <DetailDiv
          label="客户短款金额："
          :content="`${regWriteoffInfo.writeoffCurrency||''} ${lessPayAmtTotal}`"
        />
        <DetailDiv label="核销日期：" :isSlot="true">
          <el-date-picker
            :disabled="!(hasBalance && isNotLock)"
            placeholder="选择日期"
            size="mini"
            type="date"
            v-model="regWriteoffInfo.writeoffDate"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </DetailDiv>
        <DetailDiv label="币种：" :content="regWriteoffInfo.currency" />
        <DetailDiv
          v-if="regWriteoffInfo.exchangeRates.length"
          label="核销汇率："
          :isSlot="true"
          :isVisible="true"
        >
          <div>
            {{ regWriteoffInfo.exchangeRates[0].settlementRateTitle }} {{regWriteoffInfo.exchangeRates[0].settlementRate}}
            <span
              @click="showExchangeRates"
              class="link"
              v-show="regWriteoffInfo.exchangeRates.length > 1"
            >更多汇率</span>
          </div>
        </DetailDiv>
        <DetailDiv label="核销备注：" :isSlot="true" :isFull="true">
          <el-input
            :disabled="!(hasBalance && isNotLock)"
            style="top: 2px"
            :maxlength="500"
            show-word-limit
            type="textarea"
            v-model="regWriteoffInfo.remark"
          ></el-input>
        </DetailDiv>
      </div>
      <!-- 详情 核销记录 -->
      <ToggleTable v-if="writeoffOption.data.length" :tableOption="writeoffOption" />
      <!-- 核销 转大掌柜余额 -->
      <div @click.stop v-show="option11.data.length && hasBalance">
        <ToggleTable :tableOption="dzgTableOption">
          <FinanceTable :option="option11" />
        </ToggleTable>
      </div>
      <!-- 核销 转账手续费 -->
      <div @click.stop="listenClick" v-if="hasBalance">
        <ToggleTable :tableOption="feeTableOption" ref="feeTableOption">
          <template v-if="checkAuth($route.name, 'btn-addFee') && hasBalance && isNotLock">
            <el-button slot="right-button" @click="addFee" size="mini">添加手续费</el-button>
          </template>
          <FinanceTable
            v-if="$refs.feeTableOption && $refs.feeTableOption.showData"
            :option="option4"
          />
        </ToggleTable>
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
      <ToggleTable v-if="option9.data.length && hasBalance" :tableOption="invoiceTableOption">
        <FinanceTable :option="option9" />
      </ToggleTable>
      <!-- 核销 退款信息 -->
      <ToggleTable v-if="option12.data.length" :tableOption="refundTableOption">
        <FinanceTable :option="option12" />
      </ToggleTable>
      <!-- 费用列表 -->
      <div class="table-box" v-if="hasBalance">
        <div class="title-box">
          <div class="title">
            费用列表
            <template v-for="el in [{a:originalGather, t: '核销'}, {a:exchangeGather, t: '折币'}]">
              <div class="money-list" v-show="el.a.length" :key="el.t">
                {{el.t+'：'}}
                <span :key="index" v-for="(item, index) in el.a">
                  {{ item.currency }}
                  <b>{{ item.amt }}</b>
                </span>
              </div>
            </template>
          </div>
          <div class="btn" v-show="option1.data.length">
            <el-button style="line-height: 1" @click="changeRate" size="mini">一键修改核销汇率</el-button>
          </div>
        </div>
        <FinanceTable :option="option1" @send-multi="sendMulti" />
      </div>
      <div v-if="customColumnsPopShow">
        <CustomColumns
          :columnsBase="selfColumnsBase"
          :configColumns="configColumns"
          @close="customColumnsPopClose"
        />
      </div>
      <el-dialog
        :title="'关联发票核销'"
        :visible.sync="relevanceOpen"
        width="1200px"
        class="max_height_dialog"
      >
        <FinanceSearch :searchOption="searchOption1" @search="search" />
        <FinanceTable :option="option2" @send-multi="sendMulti" ref="multipleTable2" />
        <span class="dialog-footer" slot="footer">
          <el-button @click="importFeesAction" size="mini" type="primary">导入发票费用</el-button>
          <el-button @click="closeRelevanceOpne" size="mini">关闭</el-button>
        </span>
      </el-dialog>
      <el-dialog
        :title="'关联结算单核销'"
        :visible.sync="relevanceOpen2"
        width="1200px"
        class="max_height_dialog"
      >
        <FinanceSearch :searchOption="searchOption2" @search="getSettleOrderList" />
        <FinanceTable :option="option3" @send-multi="sendMulti" ref="multipleTable3" />
        <span class="dialog-footer" slot="footer">
          <el-button @click="importFeesAction2" size="mini" type="primary">导入结算单费用</el-button>
          <el-button @click="closeRelevanceOpne2" size="mini">关闭</el-button>
        </span>
      </el-dialog>
      <!-- 汇率弹出框 -->
      <el-dialog title="核销汇率" :visible.sync="rateDiaologOpen" width="600px">
        <FinanceTable :option="option6" />
        <div class="dialog-footer" slot="footer">
          <el-button @click="submitRate" size="mini" type="primary">提交</el-button>
          <el-button @click="closeRateDialog" size="mini">取 消</el-button>
        </div>
      </el-dialog>
      <!-- 关联费用列表 -->
      <el-dialog
        :visible.sync="writeoffFeeDialog"
        title="关联费用核销"
        width="1200px"
        class="max_height_dialog"
      >
        <FinanceSearch :searchOption="searchOption3" @search="settleOrderFeeList" />
        <FinanceTable :option="option7" @send-multi="sendMulti" ref="multipleTable7" />
        <div class="dialog-footer" slot="footer">
          <el-button @click="importFeesAction3" size="mini" type="primary">导入费用</el-button>
          <el-button @click="closeWriteoffFee" size="mini">关闭</el-button>
        </div>
      </el-dialog>
      <!-- 关联委托单位 -->
      <el-dialog :visible.sync="refSettleUnitDialog" title="关联委托结算单位" width="600px">
        <div class="settle-unit-box">
          <div class="default-settle">
            <span>结算单位：</span>
            <el-input disabled v-model="regWriteoffInfo.settleCorpName" />
          </div>
          <div class="unit-box">
            <h4>母子关系</h4>
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
            <h4>平级关系</h4>
            <el-checkbox-group v-if="refSettleUnitList2.length" v-model="relationList">
              <el-checkbox
                style="display: block;"
                v-for="item in refSettleUnitList2"
                :label="item"
                :key="item.settleCorpCode"
              >{{item.settleCorpName}}</el-checkbox>
            </el-checkbox-group>
            <div v-else style="color:#909399;text-align:center;padding-top: 30px;">暂无数据</div>
          </div>
        </div>
        <div class="dialog-footer" slot="footer">
          <el-button @click="importFeesAction4" size="mini" type="primary">关联</el-button>
          <el-button @click="closeRefSettleUnit" size="mini">取消</el-button>
        </div>
      </el-dialog>
      <!-- 核销汇率 -->
      <el-dialog :visible.sync="exchangeRatesDialog" class="self-dialog" title="核销汇率" width="600px">
        <FinanceTable :option="option10" />
        <div class="dialog-footer" slot="footer">
          <el-button @click="exchangeRatesDialog = false" size="mini">关闭</el-button>
        </div>
      </el-dialog>
      <!-- 余额转大掌柜 -->
      <TransferDzg :dialogOption="transferOption" @close="closeTransfer" @submit="submitTransfer" />
      <!-- 分摊手续费 -->
      <TransferFee :transferFeeOption="transferFeeOption" @close="closeFee" />
      <!-- 上传水单 已取消 -->
      <!-- <FinanceUpload
        :limit="1"
        :show-upload="showUploadFile"
        :upload-api="'/fin/receivableReg/uploadBankseqFile'"
        :upload-params="uploadParams"
        :autoUpload="true"
        upload-title="上传水单并核销"
        @close-upload="closeUpload"
        @send-res-upload="sendResUpload"
      >
        <div
          v-if="regWriteoffInfo.receivableReg && !regWriteoffInfo.receivableReg.bankseqFileName"
          slot="title"
          style="color: #E9851F;margin: -10px 0 10px 0;"
        >
          <i class="el-icon-info" style="margin-right: 8px"></i>预收核销人和收款登记人不一致，请上传客户水单！
        </div>
      </FinanceUpload>-->
      <!-- 上传客户付款水单 -->
      <FinanceUpload
        :limit="1"
        :show-upload="showUploadFile"
        upload-api="/fin/receivableReg/uploadPayBankseqFile"
        :upload-params="uploadParams"
        upload-title="上传客户付款水单"
        @close-upload="closeUpload"
        @send-res-file-list="sendResFileList"
        @send-res-upload="sendResUpload"
      ></FinanceUpload>
    </div>
    <!-- 协助代收付分公司 -->
    <el-dialog
      v-if="exchangeCorpDialogAssist"
      :visible.sync="exchangeCorpDialogAssist"
      title="协助代收付分公司"
      width="500px"
      label-width="130px"
    >
      <el-form :model="corpFormAssist" ref="corpFormAssist" :rules="corpRulesAssist" size="mini">
        <el-form-item label="协助代收付分公司：" prop="settleCorp">
          <el-select
            style="width: 330px;"
            v-model="corpFormAssist.settleCorp"
            value-key="value"
            placeholder="请选择分公司"
            filterable
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
        <el-button @click="exchangeCorpAssist" size="mini" type="primary">确定</el-button>
        <el-button @click="exchangeCorpDialogAssist = false" size="mini">取消</el-button>
      </div>
    </el-dialog>
    <!-- 预收调转 -->
    <el-dialog :visible.sync="exchangeCorpDialog" class="self-dialog" title="预收调转" width="500px">
      <el-form :model="corpForm" ref="corpForm" :rules="corpRules" label-width="80px" size="mini">
        <el-form-item label="结算单位：" prop="settleCorp">
          <el-select
            style="width: 100%;"
            v-model="corpForm.settleCorp"
            value-key="value"
            placeholder="请选择结算单位"
            filterable
            remote
            :remote-method="(val) => settleCorpSelectRemote(val)"
            @visible-change="(val) => val && settleCorpSelectRemote('')"
          >
            <el-option
              v-for="(item,index) in settleCorpSelectList"
              :key="item.value+item.label+index"
              :label="item.label"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="调转原因：" prop="reason">
          <el-input
            v-model="corpForm.reason"
            type="textarea"
            placeholder="请输入调转原因"
            size="mini"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item
          v-if="isShowUpload"
          label="附件："
          prop="fileNo"
          class="invoice-payment-add-form-upload"
          style="position:relative;"
        >
          <el-input
            v-model="corpForm.fileNo"
            style="position:absolute;right:0;top:0;width:1px;height:1px;opacity:0;"
          ></el-input>
          <FinanceUploadEmbed
            :upload-api="uploadApi2"
            :upload-params="uploadParams2"
            :limit="1"
            :width="372"
            @send-res-file-list="sendResFileList"
          />
        </el-form-item>
      </el-form>
      <div class="dialog-footer" slot="footer">
        <el-button @click="exchangeCorp" size="mini" type="primary">确定</el-button>
        <el-button @click="exchangeCorpDialog = false" size="mini">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import CustomColumns from '@/components/customColumns'
import ToggleTable from '@/views/finance/components/financeTable/simpleToggleTable'
import FinanceUploadEmbed from '@/views/finance/components/financeUpload/financeUploadEmbed'
import FinanceUpload from '@/views/finance/components/financeUpload/financeUpload'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mapGetters } from 'vuex'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { listInvoiceReceivable } from '@/api/fin/receivableReg'
import {
  invoiceReceivableFeeList,
  settleOrderList,
  settleOrderFeeList,
  recheck,
  checkRecvWriteoffOverduePayment,
  getSettleOrderListAmtSummary,
} from '@/api/fin/writeoffRecv'
import {
  receivablePrerevWriteoff,
  regDeleteProxyFile,
  getWriteoffFeeList,
  getRefSettleUnitList,
  receivablePrerevInfo,
  markAssistedComp,
  transferSettleCorp,
} from '@/api/fin/receivableReg'
import { actualExchangeRate, listColumnConfigGet, listColumnConfigSave, baseFeeItemList } from '@/api/base'
import { decimalFixed2, dateFormat } from '@/views/finance/utils/finance'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import TransferDzg from '@/views/finance/receivable/components/transferDzg'
import TransferFee from '@/views/finance/receivable/components/transferFee'
import RegDetailInfo from '@/views/finance/receivable/components/regDetailInfo'
import RegSettleInfo from '@/views/finance/receivable/components/regSettleInfo'
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
  mixins: [mixin, routerMixin],
  data() {
    return {
      showUploadFile: false,
      uploadFileTitle: '',
      uploadFileApi: '',
      uploadParams: {},
      fileList: [],
      isInit: false,
      btnArr: [
        { auth: 'btn-writeoff', action: this.writeoffAction, text: '核销', type: 'primary' },
        {
          auth: 'btn-openUploadFile',
          action: this.openUploadFile,
          text: '上传客户付款水单',
          params: 'uploadPayBankseqFile',
          type: 'primary',
          both: true,
        },
        { auth: 'btn-transferDzg', action: this.transferDzg, text: '余额转大掌柜', type: 'primary' },
        { auth: 'btn-markAssistedComp', action: this.markAssistedComp, text: '代分公司收款', type: 'warning' },
        { auth: 'btn-exchangeCorp', action: this.exchangeCorpShow, text: '预收调转', type: 'warning' },
        { auth: 'btn-getRefSettleUnitList', action: this.handleSettleCrop, text: '关联委托结算单位', type: 'primary' },
        { auth: 'btn-listInvoiceReceivable', action: this.handleRelevanceOpen, text: '关联发票核销', type: 'primary' },
        { auth: 'btn-settleOrderFeeList', action: this.settleOrderFeeList, text: '关联费用核销', type: 'primary' },
        { auth: 'btn-settleOrderList', action: this.handleSettleOrderFeeList, text: '关联结算单核销', type: 'primary' },
      ],
      // 详情-核销记录
      writeoffOption: {
        title: '核销记录',
        data: [],
        columns: [
          {
            prop: 'writeoffReceipayNo',
            label: '核销编号',
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
          { prop: 'useAmt', label: '核销金额', width: 130 },
          { prop: 'settleCorpName', label: '结算单位', minWidth: 180 },
          { prop: 'useScene', label: '使用场景', width: 130 },
          { prop: 'writeoffSubType', label: '核销子类型', type: 'select', propInDict: 'recWriteoffSubType', width: 160 },
          { prop: 'writeoffName', label: '核销人', width: 150 },
          { prop: 'writeoffTime', label: '核销时间', width: 160 },
        ],
      },
      // 核销-转大掌柜余额
      dzgTableOption: { title: '转大掌柜余额', isSlot: true },
      // 核销-转账手续费
      feeTableOption: { title: '转账手续费', isSlot: true },
      // 核销-发票信息
      invoiceTableOption: { title: '发票信息', isSlot: true },
      // 核销-发票信息
      refundTableOption: { title: '预收退款', isSlot: true },

      writeoffReceipayId: -1,
      receivablePrerevId: -1,
      receivablePrerevNo: -1,
      multipleSelection: [],
      multipleSelection1: [],
      multipleSelection2: [],
      multipleSelection3: [],
      relevanceOpen: false,
      relevanceOpen2: false,
      // 发票弹框搜索框
      searchOption1: {
        columns: [
          { disabled: true, label: '结算单位', prop: 'settleCorpCode', type: 'input', placeholder: '' },
          { label: '发票号码', prop: 'invoiceNo', type: 'input' },
          { label: '发票抬头', prop: 'title', type: 'input' },
        ],
        data: { settleCorpCode: '', invoiceNo: '', title: '', currency: '' },
      },
      searchOption2: {},
      searchOption3: {},
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
      option12: {}, // 预收退款
      infoData: {},
      writeoffRateList: [],
      regWriteoffInfo: {
        writeoffDate: '',
        remark: '',
        lessPayAmt: '',
        unusedAmt: 0,
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
      exchageRateList: [], // 接口返回的当日核销汇率列表
      settleExchageRateList: [], // 核销需要用到的汇率列表
      settlementRateEditDisabled: false,
      watchFormExchangeRatesTime: 0,
      originalGather: [],
      exchangeGather: [],
      invoiceReceivableIds: [],
      settleOrderIds: [],
      rateDiaologOpen: false,
      writeoffFeeDialog: false,
      refSettleUnitList: [],
      refSettleUnitList2: [],
      relationList: [],
      refSettleUnitCustid: '',
      refSettleUnitDialog: false,
      defaultChecked: [],
      exchangeRatesDialog: false,
      loading: false,
      // 转大掌柜弹框配置
      transferOption: { show: false, data: [] },
      transferFeeOption: { show: false, data: [], routerData: {} },
      routerBackReset: false,
      // 自定义表头弹框
      customColumnsPopShow: false,
      selfColumnsBase: [],
      corpFormAssist: { settleCorp: '' },
      corpRulesAssist: { settleCorp: [{ required: true, message: ' ', trigger: 'change' }] },
      exchangeCorpDialogAssist: false,
      settleCorpSelectListAssist: [],
      isShowUpload: true,
      uploadApi2: '/base/webapi/file/upload',
      uploadParams2: {},
      exchangeCorpDialog: false,
      corpForm: { settleCorp: '', fileNo: '', reason: '' },
      corpRules: {
        settleCorp: [{ required: true, message: ' ', trigger: 'change' }],
        reason: [{ required: true, message: ' ', trigger: 'change' }],
        fileNo: [{ required: true, message: '必填', trigger: 'change' }],
      },
      settleCorpSelectList: [],
    }
  },
  created() {
    this.feeSource = ''
    this.invoiceReceivableIds = []
    this.refSettleUnitList = []
    this.refSettleUnitList2 = []
    this.option5.data = []
    this.option1.data = []
    this.init()
  },
  methods: {
    // 核销总金额
    getWriteoffAmt(str) {
      return this.option1.data
        .reduce((sum, cur) => {
          return sum.plus(decimalFixed2(new LSnum(cur[str || 'writeoffFeeAmt'] || 0).times(cur.writeoffExRate || 1).valueOf()))
        }, BIGZERO)
        .toNum(2)
    },
    init() {
      this.relationList = []
      this.isInit = false
      this.$nextTick(() => (this.isInit = true))
      let routeQuery = this.$route.query
      this.routerBackReset = !!routeQuery.routerBackReset || false
      // this.multipleSelection = routeQuery.multipleSelection ? routeQuery.multipleSelection : []
      this.writeoffReceipayId = routeQuery.writeoffReceipayId
      this.receivablePrerevId = routeQuery.receivablePrerevId
      this.receivablePrerevNo = routeQuery.receivablePrerevNo
      this.source = routeQuery.source
      this.writeoffRateList = [] // 关联结算单
      let addFilterArr2 = ['settleCorpCode', 'settleOrderNo', 'orderType', 'finLockStatus']
      let filterGroups2 = {
        settleCorpCode: { label: '结算单位', type: 'select', selectOptions: SETTLECROPLIST },
        settleCompCode: {
          label: '分公司',
          type: 'remoteSelect',
          remoteSelectList: [],
          remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
          visibleChange: (val, item) => this.querySettleUnit2({ queryString: '', unitTypes: 'company' }, item),
        },
        settleOrderNo: { label: '结算单号', type: 'input' },
        orderType: { label: '结算单类型', type: 'select', prop: 'settleOrderType' },
        offsetPayType: { label: '收付类型', type: 'select', prop: 'receipayGroup' },
        receiveInvoiceApplyStatus: { label: '开票申请状态', type: 'select', prop: 'receiveInvoiceApplyStatus' },
        invoiceStatus: { label: '开票状态', type: 'select', prop: 'feeInvoiceStatus' },
        confirmStatus: { label: '确认状态', type: 'select', prop: 'yesNo' },
        finLockStatus: { label: '锁定状态', type: 'select', prop: 'finLockStatus' },
        confirmBy: {
          label: '创建人',
          type: 'remoteSelect',
          remoteSelectList: [],
          remoteMethod: (val, item) => this.getEmployeeList(val, item),
          visibleChange: (val, item) => this.getEmployeeList('', item),
        },
        createdTime: {
          label: '创建时间',
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
        settleCorpCode: { label: '结算单位', type: 'select', selectOptions: SETTLECROPLIST },
        sourceBizNo: { label: '工作单号', type: 'input' },
        settleOrderNo: { label: '结算单号', type: 'input' },
        feeCode: {
          label: '费用名称',
          type: 'remoteSelect',
          remoteSelectList: [],
          remoteMethod: (val, item) => this.feeItemQuerySearch(val, item),
          visibleChange: (val, item) => this.feeItemQuerySearch('', item),
        },
        invoiceStatus: { label: '开票状态', type: 'select', prop: 'feeInvoiceStatus' },
        confirmStatus: { label: '是否确认', type: 'select', prop: 'yesNo' },
        feeCurrency: { label: '原币种', type: 'select', prop: 'currency' },
        // settleCurrency: { label: '结算币种', type: 'select', prop: 'currency' },
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
        data: [{ label: '删除', type: 'text', show: true, action: 'Delete' }],
      })
      this.option1 = Object.assign({}, this.option, {
        customColumns: {
          show: true,
          handleCustomColumns: () => (this.customColumnsPopShow = true),
        },
        id: 'option1',
        $name: 'PrerevWriteoff1',
        data: [],
        tips: false,
        operationBtns: operationBtns,
        selection: { show: true, fixed: 'left' },
        edit: true,
        colorColumns: ['receipayType'],
      })
      this.option2 = Object.assign({}, this.option, {
        id: 'option2',
        $name: 'PrerevWriteoff2',
        data: [],
        tips: false,
        operationBtns: false,
        selection: { show: true, fixed: true },
        maxHeight: 460,
      })
      this.option3 = Object.assign({}, this.option, {
        id: 'option3',
        $name: 'PrerevWriteoff3',
        data: [],
        tips: false,
        operationBtns: false,
        selection: { show: true, fixed: true },
        maxHeight: 460,
        listAmtSummary: Object.assign({}, this.option.listAmtSummary, { show: true }),
      })
      console.log(this.checkAuth(this.$route.name, 'btn-delFee'))
      const operationBtns4 = Object.assign({}, this.option.operationBtns, {
        width: 100,
        data: [{ label: '删除', type: 'text', showFn: (row) => row.isDelete, action: 'Delete' }],
        fixed: 'right',
        show: true,
        callback: (action, $index, row, option) => {
          this.option4.data.splice($index, 1)
          this.$nextTick(() => this.computedMoney())
        },
      })
      this.option4 = Object.assign({}, this.option, {
        id: 'option4',
        $name: 'PrerevWriteoff4',
        data: [],
        tips: false,
        operationBtns: operationBtns4,
        selection: false,
        edit: true,
      })
      const operationBtns5 = Object.assign({}, this.option.operationBtns, {
        width: 100,
        data: [{ label: '删除', type: 'text', action: 'Delete', showFn: (row) => row.relationType !== 'temporary' }],
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
      this.option5 = Object.assign({}, this.option, {
        id: 'option5',
        $name: 'PrerevWriteoff5',
        data: [],
        tips: false,
        operationBtns: operationBtns5,
        selection: false,
      })
      this.option6 = Object.assign({}, this.option, {
        id: 'option6',
        $name: 'PrerevWriteoff6',
        tips: false,
        selection: false,
        operationBtns: false,
        pagination: false,
        edit: true,
      })
      this.option7 = Object.assign({}, this.option, {
        id: 'option7',
        $name: 'PrerevWriteoff7',
        data: [],
        tips: false,
        operationBtns: false,
        selection: { show: true, fixed: true },
        maxHeight: 460,
      })
      const operationBtns8 = Object.assign({}, this.option.operationBtns, {
        width: 100,
        data: [{ label: '删除', type: 'text', action: 'Delete', showFn: (row) => row.isDelete }],
        fixed: 'right',
        show: true,
        callback: (action, $index, row, option) => this.delInvoiceReceivable(row, $index),
      })
      this.option9 = Object.assign({}, this.option, {
        id: 'option9',
        $name: 'PrerevWriteoff8',
        data: [],
        tips: false,
        operationBtns: operationBtns8,
        selection: false,
        index: { show: true },
      })
      this.option10 = Object.assign({}, this.option, {
        id: 'option10',
        $name: 'PrerevWriteoff9',
        data: [],
        tips: false,
        operationBtns: false,
        selection: { show: false },
      })
      const columns1 = [
        {
          prop: 'sourceBizNo',
          label: '单号',
          type: 'button',
          key: 'sourceBizNo',
          width: '140px',
          formatter: ({ cellValue, column, row, item }) => row.sourceBizNo || row.finBillNo,
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => this.showDetail(row),
          },
        },
        { prop: 'settleCorpName', label: '结算单位', type: 'text', key: 'settleCorpName' },
        { prop: 'settleOrderNo', label: '结算单号', type: 'text', key: 'settleOrderNo', width: 140 },
        { prop: 'feeName', label: '费用名称', type: 'text', key: 'feeName' },
        { prop: 'feeEnName', label: '费用英文名', type: 'text', key: 'feeEnName' },
        { prop: 'receipayType', label: '应收应付', type: 'select', readOnly: true, width: 100 },
        { prop: 'currency', label: '原币种', type: 'text', key: 'currency' },
        { prop: 'feeAmt', label: '原金额', type: 'text', key: 'feeAmt' },
        // { prop: 'noWriteoffAmt', label: '可核销金额', type: 'text', key: 'noWriteoffAmt' },
        { prop: 'writeoffBalanceAmt', label: '可核销金额', type: 'text', disabled: true, key: 'writeoffBalanceAmt' },
        {
          prop: 'writeoffFeeAmt',
          label: '核销金额',
          type: 'input',
          disabled: true,
          key: 'writeoffFeeAmt',
          maxlength: '16',
          validateInput: (value, row, pItem, changeE) => {
            if (!value) return
            if (!/^-?(\d+(\.\d{0,2})?)?$/.test(value)) {
              !this.debounceLsFn() && this.$msgErrClose('请输入正确的数字！')
              let res = /^-?(\d+(\.\d{0,2})?)?/.exec(row[pItem.prop])
              row[pItem.prop] = res && res[0]
            }
          },
        },
        {
          prop: 'lessPayAmt',
          label: '短款金额',
          type: 'input',
          key: 'lessPayAmt',
          disabled: true,
          maxlength: '16',
          validateInput: (value, row, pItem, changeE) => {
            if (!value) return
            if (!/^(\d+(\.\d{0,2})?)?$/.test(value)) {
              !this.debounceLsFn() && this.$msgErrClose('请输入正确的正数！')
              let res = /^(\d+(\.\d{0,2})?)?/.exec(row[pItem.prop])
              row[pItem.prop] = res && res[0]
            }
          },
        },
        { prop: 'settleCurrency', label: '结算币种', type: 'text', key: 'settleCurrency' },
        { prop: 'settleExRate', label: '结算汇率', type: 'text', key: 'settleExRate' },
        { prop: 'settleAmt', label: '结算金额', type: 'text', key: 'settleAmt' },
        { prop: 'writeoffCurrency', label: '收款币种', type: 'text', key: 'writeoffCurrency' },
        { prop: 'writeoffExRate', label: '核销汇率', type: 'text', key: 'writeoffExRate' },
        { prop: 'writeoffAmt', label: '折币金额', type: 'text', key: 'writeoffAmt' },
        { prop: 'serviceName', label: '服务项', type: 'text', key: 'serviceName' },
        { prop: 'feeUnit', label: '计费单位', type: 'text', formatter: ({ cellValue }) => this.dictMapObj.feeUnit[cellValue] },
        { prop: 'unitPrice', label: '单价', type: 'text', key: 'unitPrice' },
        { prop: 'unitCount', label: '数量', type: 'text', key: 'unitCount' },
        { prop: 'invoiceNo', label: '发票号', width: 86, type: 'text' },
        { prop: 'finDate', label: '财务日期', width: 86, type: 'text' },
      ]
      const columns2 = [
        { prop: 'invoiceNo', label: '发票号', type: 'text', key: 'invoiceNo' },
        { prop: 'title', label: '发票抬头', type: 'text', key: 'title' },
        {
          prop: 'preInvoice',
          label: '是否预收发票',
          type: 'text',
          key: 'preInvoice',
          width: 100,
          formatter: ({ cellValue }) => (cellValue === 'no' ? '否' : '是'),
        },
        { prop: 'invoiceType', label: '开票类型', type: 'select', key: 'invoiceType', propInDict: 'invoiceType' },
        { prop: 'currency', label: '开票币种', type: 'text', key: 'currency' },
        { prop: 'amt', label: '开票金额', type: 'text', key: 'amt' },
        { prop: 'taxRate', label: '开票税率', type: 'select', key: 'taxRate', propInDict: 'taxRateInfo' },
        // { prop: 'acctRate', label: '发票汇率', type: 'text', key: 'acctRate' },
        { prop: 'invoiceRate', label: '发票汇率', type: 'text', key: 'invoiceRate' },
        { prop: 'writeoffAmt', label: '已核销金额', type: 'text', key: 'writeoffAmt' },
        { prop: 'noWriteoffAmt', label: '未核销金额', type: 'text', key: 'noWriteoffAmt' },
      ]
      const columns3 = [
        { prop: 'settleOrderNo', label: '结算单号', type: 'text', width: 110 },
        { prop: 'orderType', label: '结算单类型', type: 'select', propInDict: 'settleOrderType' },
        { prop: 'settleCompName', label: '分公司', type: 'text', width: 150 },
        { prop: 'settleCorpName', label: '结算单位', type: 'text', width: 150 },
        { prop: 'offsetPayType', label: '收付类型', type: 'select', propInDict: 'receipayGroup' },
        { prop: 'recWriteoffDesc', label: '应收已核销金额', type: 'tooltip', width: 100 },
        { prop: 'recNoWriteoffDesc', label: '应收未核销金额', type: 'tooltip', width: 100 },
        { prop: 'payWriteoffDesc', label: '应付已核销金额', type: 'tooltip', width: 100 },
        { prop: 'payNoWriteoffDesc', label: '应付未核销金额', type: 'tooltip', width: 100 },
        // { prop: 'writeoffAmt', label: '已核销金额', type: 'tooltip' },
        // { prop: 'noWriteoffAmt', label: '未核销金额', type: 'tooltip' },
        { prop: 'invoiceStatus', label: '开票状态', type: 'select', propInDict: 'feeInvoiceStatus' },
        { prop: 'confirmStatus', label: '确认状态', type: 'select', propInDict: 'yesNo' },
        // {prop: 'confirmStatus', label: '确认状态', type: 'text', formatter: (row, pItem) => {  let prop = pItem.prop
        //   if (row[prop] === 'yes') {  return '已确认'  } else if (row[prop] === 'no') {  return '未确认'  }else{  return row[prop]  }  },
        // },
        // {prop: 'writeoffStatus', label: '核销状态', type: 'text' , formatter: (row, pItem) => {return  row[pItem.prop] ? this.$t(`dict.writeoffStatus.${ row[pItem.prop]}`) : '' }},
        { prop: 'finLockStatus', label: '锁定状态', type: 'select', propInDict: 'finLockStatus' },
        { prop: 'createdName', label: '创建人', type: 'text' },
        {
          prop: 'createdTime',
          label: '创建时间',
          type: 'text',
          formatter: ({ cellValue }) => cellValue && cellValue.split(' ')[0],
        },
      ]
      const columns4 = [
        { prop: 'cutType', label: '内外扣类型', type: 'select', propInDict: 'transferFeeType', readOnly: true },
        { prop: 'currency', label: '币种', type: 'text', propInDict: 'validCurrency' },
        {
          prop: 'amt',
          label: '金额',
          inputType: 'number',
          type: 'input',
          validateInput: (val, row, item, change) => {
            if (change && val) {
              if (/^\d+(\.\d{0,2})?$/.test(val)) {
                row.allotAmt = val
                //联动可核销金额和剩余未用金额
                this.computedMoney()
              } else {
                row.allotAmt = ''
              }
            }
          },
        },
        { prop: 'hasAllotAmt', label: '已摊金额', type: 'text' },
        { prop: 'allotAmt', label: '本次分摊', type: 'text' },
      ]
      const columns5 = [
        { prop: 'settleCorpName', label: '委托结算单位', type: 'text' },
        { prop: 'relationType', label: '关联类型', type: 'select', propInDict: 'settleUnitRelationType' },
        { prop: 'settleOrderNo', label: '结算单号', type: 'text' },
        { prop: 'fileType', label: '附件类型', type: 'select', propInDict: 'settleUnitRelationFileType' },
        {
          prop: 'fileName',
          label: '附件',
          type: 'button',
          operationBtns: {
            show: true,
            callback: (fn, index, row, option) => row.fileNo && this.showAttachment(row.fileNo),
          },
        },
        {
          prop: 'startTime',
          label: '有效期',
          type: 'text',
          formatter: ({ cellValue, column, row, item }) => {
            let { fileType, startTime, stopTime } = row
            return fileType === 'bankseq_file'
              ? '临时'
              : startTime
              ? `${startTime ? startTime.slice(0, 10) : ''} ~ ${stopTime ? stopTime.slice(0, 10) : ''}`
              : ''
          },
        },
      ]
      const columns6 = [
        { prop: 'srcCurrency', label: '原币种', type: 'text' },
        { prop: 'toCurrency', label: '核销币种', type: 'text' },
        { prop: 'settlementRate', label: '结算汇率', type: 'input' },
      ]
      const columns7 = [
        { prop: 'sourceBizNo', label: '单号', type: 'text', width: 125 },
        { prop: 'settleCorpName', label: '结算单位', type: 'text', width: 140 },
        { prop: 'settleOrderNo', label: '结算单号', type: 'text', width: 125 },
        { prop: 'invoiceStatus', label: '开票状态', type: 'select', propInDict: 'feeInvoiceStatus' },
        // { prop: 'confirmStatus', label: '是否确认', type: 'select', propInDict: 'yesNo' },
        { prop: 'feeName', label: '费用名称', type: 'text' },
        { prop: 'feeAmt', label: '原金额', type: 'text' },
        { prop: 'currency', label: '原币种', type: 'text' },
        { prop: 'noWriteoffAmt', label: '可核销金额', type: 'text' },
        { prop: 'settleAmt', label: '结算金额', type: 'text' },
        { prop: 'settleCurrency', label: '结算币种', type: 'text' },
        { prop: 'settleExRate', label: '结算汇率', type: 'text' },
        { prop: 'createdName', label: '创建人', type: 'text' },
        { prop: 'createdTime', label: '创建时间', type: 'text' },
      ]
      const columns8 = [
        { prop: 'invoiceNo', label: '发票号', type: 'text' },
        { prop: 'invoiceType', label: '开票类型', type: 'select', propInDict: 'invoiceType' },
        {
          prop: 'preInvoice',
          label: '是否预收发票',
          type: 'text',
          key: 'preInvoice',
          width: 100,
          formatter: ({ cellValue }) => (cellValue === 'no' ? '否' : '是'),
        },
        { prop: 'amt', label: '开票金额', type: 'text' },
        { prop: 'currency', label: '开票币种', type: 'text' },
        { prop: 'invoiceRate', label: '开票汇率', type: 'text' },
        { prop: 'taxRate', label: '开票税率', type: 'text' },
        { prop: 'taxAmt', label: '税额', type: 'text' },
        { prop: 'lockAmt', label: '关联金额', type: 'text' },
        { prop: 'issueName', label: '开票人', type: 'text' },
        { prop: 'issueTime', label: '开票时间', type: 'text' },
      ]
      const columns9 = [
        { prop: 'srcCurrency', label: '原币种', type: 'text' },
        { prop: 'toCurrency', label: '核销币种', type: 'text' },
        { prop: 'settlementRate', label: '核销汇率', type: 'text' },
      ]
      this.selfColumnsBase = columns1
      this.configColumns.splice(0, 1000, ...this.selfColumnsBase.map((item) => item.prop))
      this.option1.columns = [...this.selfColumnsBase]
      listColumnConfigGet({ scenesCode: 'reg_pre_writeoff_fee_list' }).then((res) => {
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
      this.option9.columns = columns8
      this.option10.columns = columns9
      const operationBtns11 = Object.assign({}, this.option.operationBtns, {
        width: 150,
        data: [
          { label: '修改', type: 'text', action: 'Edit', showFn: (row) => !row.edit },
          { label: '保存', type: 'text', action: 'Save', showFn: (row) => row.edit },
          { label: '删除', type: 'text', action: 'Delete', show: true },
        ],
        fixed: 'right',
        show: true,
        callback: (action, $index, row, option) => {
          if (action === 'Edit') {
            this.option11.data[$index].edit = true
          } else if (action === 'Save') {
            // 总金额验证
            const total = this.option11.data.reduce((pre, cur) => pre.plus(cur.internalDzgAmt || 0), BIGZERO).valueOf()
            // 核销总金额
            const writeoffAmt = this.getWriteoffAmt()
            if (total > new LSnum(this.regWriteoffInfo.balance).minus(writeoffAmt).num) {
              return this.$msgErrClose('转移总金额不能大于剩余未用金额！')
            } else {
              this.option11.data[$index].edit = false
            }
            this.regWriteoffInfo.unusedAmt = decimalFixed2(
              new LSnum(this.regWriteoffInfo.balance).minus(total).minus(writeoffAmt).valueOf()
            )
          } else if (action === 'Delete') {
            this.$confirmWarn('是否确认删除？', () => {
              this.regWriteoffInfo.unusedAmt = decimalFixed2(
                new LSnum(this.regWriteoffInfo.unusedAmt).plus(row.internalDzgAmt || 0).valueOf()
              )
              this.option11.data.splice($index, 1)
            })
          }
        },
      })
      this.option11 = Object.assign({}, this.option, {
        id: 'option11',
        $name: 'PrerevWriteoff11',
        data: [],
        tips: false,
        selection: false,
        pagination: false,
        operationBtns: operationBtns11,
        index: { show: true },
        edit: true,
        columns: [
          {
            prop: 'dzgCompCode',
            label: '大掌柜',
            type: 'select',
            propInDict: 'dzgCompCode',
            change: (value, row, rowIndex) => this.changeDzgComName(row, value),
          },
          { prop: 'currency', label: '币种', type: 'text' },
          {
            prop: 'internalDzgAmt',
            label: '金额',
            type: 'input',
            inputType: 'number',
            // validateInput: (val, row, item, change) => {
            //   if (change && val) {
            //     if (!/^\d+(\.\d{0,2})?$/.test(val)) {
            //       this.$msgErrClose('请输入正确的金额！')
            //     }
            //   }
            // },
          },
          { prop: 'dzgWriteoffNo', label: '核销编号', type: 'input', needTrim: true },
        ],
        handleCellClick: ({ row, column, triggerCheckbox, rowIndex, columnIndex, $event }) => {
          $event.stopPropagation()
          this.option11.data[rowIndex].edit = true
        },
      })
      this.option12 = Object.assign({}, this.option, {
        id: 'option12',
        $name: 'PrerevWriteoff12',
        data: [],
        tips: false,
        selection: false,
        pagination: false,
        operationBtns: false,
        index: { show: true },
        edit: true,
        colorColumns: ['payStatusType'],
        columns: [
          {
            prop: 'applyNo',
            label: '退款申请单号',
            type: 'button',
            width: 155,
            operationBtns: {
              show: true,
              callback: (action, $index, row, option) => {
                this.routerPush('RefundDetail', { payApplyReceiveRefundId: row.payApplyReceiveRefundId })
              },
            },
          },
          { prop: 'settleCorpName', label: '结算单位', type: 'text', width: 150 },
          { prop: 'realRefundAmt', label: '实退金额', type: 'text', width: 100 },
          { prop: 'refundCurrency', label: '退款币种', type: 'text', width: 80 },
          { prop: 'payOrderConfirmStatus', label: '审核状态', type: 'select', propInDict: 'auditStatus', width: 100 },
          { prop: 'payStatus', label: '退款付款状态', type: 'select', propInDict: 'payStatusType', width: 100 },
          { prop: 'refundType', label: '退款类型', type: 'select', propInDict: 'refundType', width: 100 },
          { prop: 'recvBankName', label: '客户收款银行', type: 'text', width: 150 },
          { prop: 'recvAccountName', label: '客户收款名称', type: 'text', width: 150 },
          { prop: 'recvAccountPublicType', label: '客户账户类型', type: 'select', propInDict: 'accountType', width: 100 },
          { prop: 'recvAccountNo', label: '客户收款账号', type: 'text', width: 150 },
          {
            prop: 'payOrderNo',
            label: '关联付款单号',
            type: 'button',
            width: 155,
            operationBtns: {
              show: true,
              callback: (action, $index, row, option) => {
                this.routerPush('OrderDetails', { payOrderNo: row.payOrderNo })
              },
            },
          },
          { prop: 'transferChargeType', label: '手续费承担人类型', type: 'select', propInDict: 'changeType', width: 116 },
          { prop: 'transferChargerName', label: '手续费承担人', type: 'text', width: 155 },
          { prop: 'transferFeeAmt', label: '手续费', type: 'text', width: 100 },
          { prop: 'transferFeeRealAmt', label: '付款实际手续费', type: 'text', width: 100 },
          { prop: 'createdName', label: '申请人', type: 'text', width: 100 },
          { prop: 'createdTime', label: '申请时间', type: 'text', width: 130 },
          { prop: 'confirmName', label: '审核人', type: 'text', width: 100 },
          { prop: 'confirmTime', label: '审核时间', type: 'text', width: 130 },
          { prop: 'payDate', label: '付款时间', type: 'text', width: 130 },
        ],
      })
    },
    // 自定义表头
    customColumnsPopClose(action, value) {
      this.customColumnsPopShow = false
      if (action === 'Confirm') {
        let columnList = this.getColumnsValues(value) // getColumnsValues在本页面无作用
        listColumnConfigSave({ columnList, scenesCode: 'reg_pre_writeoff_fee_list' }).then((res) => {
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
      this.loading = true
      receivablePrerevInfo({ receivablePrerevId: this.receivablePrerevId, receivablePrerevNo: this.receivablePrerevNo })
        .then((res) => {
          const writeoffCurrency = res.data.currency
          this.regWriteoffInfo = Object.assign({}, this.regWriteoffInfo, res.data, {
            writeoffCurrency,
            unusedAmt: res.data.balance,
            writeoffDate: dateFormat('yyyy-mm-dd', new Date()),
            adjustAmt: '',
            defaultAmt: res.data.balance,
          })
          this.writeoffOption.data = res.data.receivableMoneyFlowList
          this.option4.data = res.data.transferFeeList.map((item) => {
            item.allotAmt = new LSnum(item.amt).minus(item.hasAllotAmt).toNum(2)
            return Object.assign({}, item, { currency_specialShow: item.currency, amt_specialShow: item.amt })
          })
          // 添加结算单位
          SETTLECROPLIST.push({
            label: this.regWriteoffInfo.settleCorpName,
            value: this.regWriteoffInfo.settleCorpCode,
          })
          const len = this.regWriteoffInfo.refSettleUnitList?.length
          if (len) {
            const corpCodeList = JSON.parse(JSON.stringify(this.regWriteoffInfo.refSettleUnitList))
            this.option5.data = corpCodeList.map((item) => {
              SETTLECROPLIST.push({ label: item.settleCorpName, value: item.settleCorpCode })
              return Object.assign(item, { fileType: 'bankseq_file' })
            })
          }
          // 重新核销获取列表带过来的数据 或者结算单关联预收款登记
          const writeoffItemList = window.sessionStorage.getItem('writeoffItemList')
          if (writeoffItemList) {
            const datasource = JSON.parse(writeoffItemList)
            const data = datasource.map((item) => {
              item.writeoffCurrency = this.regWriteoffInfo.writeoffCurrency
              // item.writeoffFeeAmt = item.noWriteoffAmt
              item.writeoffFeeAmt = item.writeoffBalanceAmt
              item.lessPayAmt = 0
              item.edit = true
              return item
            })
            this.option1.data = this.option1.data.concat(data)
            window.sessionStorage.removeItem('writeoffItemList')
          } else {
            // 收款登记关联的发票可核销费用列表
            this.option1.data = this.regWriteoffInfo.writeoffItemList.map((item) => {
              return Object.assign({}, item, {
                writeoffCurrency: this.regWriteoffInfo.writeoffCurrency,
                writeoffFeeAmt: '',
                lessPayAmt: 0,
                writeoffExRate: item.settleExRate,
                edit: true,
              })
            })
          }
          // 收款登记关联的发票列表
          const refInvoiceReceivableList = this.regWriteoffInfo.refInvoiceReceivableList
          if (refInvoiceReceivableList) {
            this.option9.data = refInvoiceReceivableList
          }
          this.option12.data = res.data.payApplyReceiveRefundList || []
          this.viaWriteoffCurrencySetRate()
        })
        .catch((err) => {
          this.delVisitedView()
          this.cancel()
        })
        .finally(() => (this.loading = false))

      const _receivableRegFormSettle = window.sessionStorage.getItem('_receivableRegFormSettle')
      window.sessionStorage.removeItem('_receivableRegFormSettle')
      actualExchangeRate({ rateType: 'receive' }).then((res) => {
        this.exchageRateList = res.data
        this.viaWriteoffCurrencySetRate()
        if (_receivableRegFormSettle) {
          let loading = this.loading
          if (!loading) this.loading = true
          setTimeout(() => {
            if (!loading) this.loading = false
            this.writeoffFeeAmtData(true, this.regWriteoffInfo.balance)
          }, 600)
        }
      })
    },
    mathRound(num) {
      return Math.round(num * 100) / 100
    },
    // 带默认值核销金额
    writeoffFeeAmtData(refresh, total) {
      const data = []
      let totalAmt = total || Number(this.regWriteoffInfo.unusedAmt)
      console.log(totalAmt)
      this.option1.data.forEach((item) => {
        if (totalAmt < 0) {
          return
        }
        // const noWriteoffAmt = Number(item.noWriteoffAmt)
        const noWriteoffAmt = Number(item.writeoffBalanceAmt) || 0
        const writeoffExRate = Number(item.writeoffExRate)

        const writeoffAmt = +decimalFixed2(new LSnum(noWriteoffAmt).times(writeoffExRate).valueOf()) // 核销金额
        let feeWriteAmt = 0

        if (writeoffAmt > totalAmt) {
          // 原币核销金额 = 核销汇率/汇率
          feeWriteAmt = +decimalFixed2(new LSnum(totalAmt).div(writeoffExRate).valueOf())
          // feeWriteAmt = (totalAmt / writeoffExRate).toFixed(2)
          // if (feeWriteAmt * writeoffExRate > totalAmt) {
          //   feeWriteAmt -= 0.01
          // }
          data.push(this.mathRound(feeWriteAmt))
          totalAmt = 0
          return
        } else {
          feeWriteAmt = noWriteoffAmt
          data.push(this.mathRound(feeWriteAmt))
          totalAmt = this.mathRound(new LSnum(totalAmt).minus(writeoffAmt).valueOf())
        }
      })

      this.option1.data = this.option1.data.map((item, index) => {
        return Object.assign(item, {
          writeoffFeeAmt: refresh ? data[index] || 0 : item.writeoffFeeAmt > 0 ? item.writeoffFeeAmt : data[index],
          // writeoffAmt: data[index] ? data[index] * item.writeoffExRate : 0
        })
      })
    },
    writeoffRate() {
      const result = []
      if (this.option1.data.length !== 0) {
        const obj = {}
        const points = this.option1.data
        for (var i = 0; i < points.length; i++) {
          if (!obj[points[i].currency]) {
            result.push(points[i])
            obj[points[i].currency] = true
          }
        }
      }
      this.writeoffRateList = result
    },
    viaWriteoffCurrencySetRate() {
      // 根据收款币种设置汇率
      if (this.exchageRateList.length === 0) {
        return
      }
      const value = this.regWriteoffInfo.writeoffCurrency // 核销币种
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
        this.settlementRateEditDisabled = false
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
        this.settlementRateEditDisabled = true
      }
      this.rateChange()
      this.writeoffGatherChange()
      // 更多汇率
      this.option10.data = this.regWriteoffInfo.exchangeRates
      // 费用合计联动
      // this.feeSumChange()
    },
    rateChange() {
      this.option1.data = this.option1.data.map((item) => {
        if (!item.writeoffExRate) {
          item.writeoffExRate = item.settleExRate
        }
        return item
      })
    },
    writeoffGatherChange() {
      // 核销汇总的计算
      let list = this.option1.data
      let currencys = [...new Set(list.map((item) => item.currency))]
      this.originalGather = currencys.map((item) => {
        return {
          currency: item,
          amt: list.reduce((sum, cur) => (item === cur.currency ? sum.plus(cur.writeoffFeeAmt || 0) : sum), BIGZERO).valueOf(),
          isPay: false,
        }
      })
      this.exchangeGather = [{ currency: this.regWriteoffInfo.writeoffCurrency, amt: this.getWriteoffAmt(), isPay: false }]
    },
    decimalFixed2(x) {
      const result = decimalFixed2(x)
      return result
    },
    importFeesAction() {
      if (this.multipleSelection2.length === 0) {
        return this.$msgErrClose('请勾选需要导入费用的发票！')
      }
      const invoiceReceivableIdsArr = this.option9.data.map((item) => item.invoiceReceivableId)
      this.multipleSelection2.forEach((item) => {
        if (!this.invoiceReceivableIds.includes(item.invoiceReceivableId)) {
          this.invoiceReceivableIds.push(item.invoiceReceivableId)
        }
        // 添加发票数据
        if (!invoiceReceivableIdsArr.includes(item.invoiceReceivableId)) {
          this.option9.data.push(item)
        }
      })
      const data = { invoiceReceivableIds: this.multipleSelection2.map((item) => item.invoiceReceivableId) }
      invoiceReceivableFeeList(data).then((res) => {
        this.option1.data = res.data.map((item) => {
          return Object.assign({}, item, {
            writeoffCurrency: this.regWriteoffInfo.writeoffCurrency,
            writeoffFeeAmt: 0,
            lessPayAmt: 0,
            edit: true,
          })
        })
        this.viaWriteoffCurrencySetRate() // 重新计算汇率
        if (res.data.length) {
          this.$msgSucClose('导入费用成功！')
        }
        // 关闭弹窗
        this.closeRelevanceOpne()
        // this.relevanceOpen = false
        this.writeoffFeeAmtData()
      })
    },
    importFeesAction2() {
      if (this.multipleSelection3.length === 0) {
        return this.$msgErrClose('请勾选需要导入费用的结算单！')
      }
      let confirmNos = this.multipleSelection3.filter((v) => v.confirmStatus === 'no').map((v) => v.settleOrderNo)
      if (confirmNos.length) {
        return this.$msgErrClose(`结算单号${confirmNos.toString()}未确认，请选择已确认的项进行操作`, 5000)
      }
      const data = {
        currency: this.regWriteoffInfo.writeoffCurrency,
        settleOrderIds: this.multipleSelection3.map((item) => item.settleOrderId),
      }
      getWriteoffFeeList(data).then((res) => {
        this.option1.data = res.data.map((item) => {
          item.writeoffFeeAmt = ''
          item.lessPayAmt = ''
          return Object.assign({}, item, {
            writeoffCurrency: this.regWriteoffInfo.writeoffCurrency,
            writeoffFeeAmt: 0,
            lessPayAmt: '',
            edit: true,
          })
        })
        this.writeoffRate()
        this.viaWriteoffCurrencySetRate() // 重新计算汇率
        this.$msgSucClose('导入费用成功！')
        this.closeRelevanceOpne2()
        // this.relevanceOpen2 = false
        this.writeoffFeeAmtData()
      })
    },
    importFeesAction3() {
      if (this.multipleSelection7.length === 0) {
        return this.$msgErrClose('请勾选需导入的费用！')
      }
      // let confirmNos = this.multipleSelection7.filter((v) => v.confirmStatus === 'no').map((v) => v.orderNo)
      // if (confirmNos.length) {
      //   return this.$msgErrClose(`单号${confirmNos.toString()}未确认，请选择已确认的项进行操作`, 5000)
      // }
      const settleOrderFeeIdArr = this.option1.data.map((item) => item.settleOrderFeeId)
      this.multipleSelection7.forEach((item) => {
        if (!settleOrderFeeIdArr.includes(item.settleOrderFeeId)) {
          const data = Object.assign({}, item, {
            writeoffCurrency: this.regWriteoffInfo.writeoffCurrency,
            writeoffFeeAmt: 0,
            lessPayAmt: 0,
            edit: true,
          })
          this.option1.data.push(data)
        }
      })
      this.viaWriteoffCurrencySetRate() // 重新计算汇率
      this.$msgSucClose('导入费用成功！')
      this.writeoffFeeAmtData()
      this.closeWriteoffFee()
    },
    importFeesAction4() {
      const unitList = this.$refs.tree.getCheckedNodes() || []
      unitList.push(...this.relationList)
      if (!unitList.length) {
        return this.$msgErrClose('未勾选关联委托单位，无法关联！')
      }
      // 重新选择关联结算单位清空费用列表
      this.option1.data = []
      this.option5.data = JSON.parse(JSON.stringify(this.regWriteoffInfo.refSettleUnitList || []))
      SETTLECROPLIST.splice(0, 1000, {
        label: this.regWriteoffInfo.settleCorpName,
        value: this.regWriteoffInfo.settleCorpCode,
      })
      // 添加关联结算单位
      const settleCorpCodeArr = this.option5.data.map((item) => item.settleCorpCode)
      unitList.forEach((item) => {
        if (!settleCorpCodeArr.includes(item.settleCorpCode)) {
          const custid = item.custid
          const common = {
            settleCorpCode: item.settleCorpCode,
            settleCorpName: item.settleCorpName,
            relationType: item.relationType,
            fileType: 'proxy_file',
            // refRelation: '',
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
      SETTLECROPLIST.push(...this.option5.data.map((item) => ({ label: item.settleCorpName, value: item.settleCorpCode })))
    },
    closeRefSettleUnit() {
      this.refSettleUnitDialog = false
    },
    getInvoiceList() {
      const data = {
        // "settleCorpCode": this.regWriteoffInfo.settleCorpCode,
        // "settleCompCode": this.regWriteoffInfo.recvCompCode
        writeoffRecvSource: 'receivable_prerev',
        receivablePrerevId: this.regWriteoffInfo.receivablePrerevId,
      }
      const obj = this.searchOption1.data
      const keys = Object.keys(obj)
      keys.forEach((key) => {
        const value = obj[key]
        if (value && value !== '') {
          data[key] = value
        }
      })
      listInvoiceReceivable(data).then((res) => {
        const list = res.data
        this.option2.data = res.data.map((item) => Object.assign(item, { isDelete: true }))
        this.relevanceOpen = true

        // 勾选发票
        const invoiceReceivableIds = this.option1.data.map((item) => item.invoiceReceivableId)
        this.$nextTick(() => {
          this.option2.data.forEach((item) => {
            if (invoiceReceivableIds.includes(item.invoiceReceivableId)) {
              this.$refs.multipleTable2.setCheckRow(item, true)
            }
          })
        })
      })
    },
    getSettleOrderList(isSum, selectRows) {
      let data = {
        writeoffRecvSource: 'receivable_prerev',
        receivablePrerevId: this.regWriteoffInfo.receivablePrerevId,
        settleCorpCode: '',
      }
      this.convertData(this.searchOption2, data)
      const arr = [this.regWriteoffInfo.settleCorpCode]
      const len = this.option5.data.length
      if (len) {
        this.option5.data.forEach((item) => {
          if (item.relationType !== 'temporary') {
            arr.push(item.settleCorpCode)
          }
        })
      }
      data.refSettleCorpCodeList = arr
      const len2 = this.option9.data.length
      if (len2) {
        data.invoiceReceivableIds = this.option9.data.map((item) => item.invoiceReceivableId)
      }
      if (isSum === 'fromSum') {
        if (selectRows && selectRows.length) {
          data = {
            writeoffRecvSource: 'receivable_prerev',
            refSettleCorpCodeList: arr,
            settleOrderIds: selectRows.map((v) => v.settleOrderId),
          }
        }
        getSettleOrderListAmtSummary(data).then((res) => {
          if (res.code === 0 && res.data) {
            let labelObj = {
              recNoWriteoffAmtListLabel: '应收未核销',
              payNoWriteoffListLabel: '应付未核销',
            }
            let colorObj = {
              recNoWriteoffAmtListColor: 'red', // 支持red, green, black三种值
              payNoWriteoffListColor: 'green',
            }
            let data = { recNoWriteoffAmtList: res.data.recNoWriteoffAmtList, payNoWriteoffList: res.data.payNoWriteoffList }
            this.option3.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
              show: true,
              data,
              labelObj,
              colorObj,
            })
          }
        })
        return
      }
      settleOrderList(data).then((res) => {
        if (res.code === 0) {
          const list = res.data
          const data = []
          list.forEach((item) => {
            data.push(item)
          })
          this.option3.data = data
          this.relevanceOpen2 = true
          // 勾选结算单
          const settleOrderIds = this.option1.data.map((item) => item.settleOrderId)
          this.$nextTick(() => {
            this.option3.data.forEach((item) => {
              if (settleOrderIds.includes(item.settleOrderId)) {
                this.$refs.multipleTable3.setCheckRow(item, true)
              }
            })
          })
        }
      })
    },
    rejectSubmit() {
      if (this.multipleSelection2.length === 0) {
        return this.$msgErrClose('请勾选需要手填发票的项！')
      }
      const data = {
        receivablePrerevId: 1,
        invoiceReceivableIds: this.multipleSelection2.map((item) => item.invoiceReceivableId),
      }
      payOrderInvoiceRelation(data).then((res) => {
        this.$msgSucClose('关联提交成功')
        this.relevanceOpen = false
      })
    },
    writeoffAction() {
      if (!this.regWriteoffInfo.receivableReg.payBankseqFileNo) {
        return this.$msgErrClose('请先上传客户付款水单！')
      }
      const transferFeeList = this.option4.data
      if (transferFeeList.length) {
        for (let i = 0; i < transferFeeList.length; i++) {
          // 校验金额
          if (!this.validateMoney(transferFeeList[i].allotAmt, { positive: true })) return
        }
      }
      const writeoffAmt = +decimalFixed2(this.option1.data.reduce((pre, cur) => pre.plus(cur.writeoffAmt), BIGZERO).valueOf())
      console.log(writeoffAmt, this.regWriteoffInfo.adjustAmt)
      if (this.regWriteoffInfo.adjustAmt && writeoffAmt !== +this.regWriteoffInfo.adjustAmt) {
        return this.$msgErrClose('调账金额与费用列表核销折币金额不相等')
      }
      if (this.regWriteoffInfo.unusedAmt < 0) {
        return this.$msgErrClose('核销费用总和大于可用核销金额，请调整核销费用！')
      }
      // 验证是否需要上传水单
      // !this.regWriteoffInfo.receivableReg.bankseqFileName &&
      if (this.regWriteoffInfo.createdBy != this.$store.state.user.userId) {
        // createdName   name
        this.$confirmWarn(
          `收款登记人(${this.regWriteoffInfo.createdName})和当前的核销人(${this.$store.state.user.name})不一致，是否继续核销？`,
          () => this.checkRecvWriteoffOverduePayment()
        )
        // this.openUploadFile()
      } else {
        this.checkRecvWriteoffOverduePayment()
      }
    },
    checkRecvWriteoffOverduePayment(item) {
      checkRecvWriteoffOverduePayment({
        settleCompCode: this.regWriteoffInfo.receivableReg.recvCompCode,
        settleCorpCode: this.regWriteoffInfo.receivableReg.settleCorpCode,
        recviceDate: this.regWriteoffInfo.receivableReg.recvDate,
        feeIds: this.option1.data.map((v) => v.feeId),
      }).then((res) => {
        if (res.data) {
          this.$confirmWarn(res.data, () => this.writeoffActionSure(item))
        } else {
          this.writeoffActionSure(item)
        }
      })
    },
    writeoffActionSure() {
      this.loading = true
      const data = {
        lessPayAmt: this.lessPayAmtTotal,
        receivablePrerevId: this.regWriteoffInfo.receivablePrerevId,
        noWriteiffHasInvoice: this.regWriteoffInfo.noWriteiffHasInvoice,
        currency: this.regWriteoffInfo.currency,
        writeoffItemList: this.option1.data,
        // 手续费没填就不需要传给后台
        transferFeeAllotList: this.option4.data.filter((item) => item.allotAmt > 0),
        adjustAmt: this.regWriteoffInfo.adjustAmt,
        feeSource: this.feeSource || '',
        invoiceReceivableIds: this.option9.data.map((item) => item.invoiceReceivableId),
        refSettleUnitList: this.option5.data,
        writeoffDate: this.regWriteoffInfo.writeoffDate,
        remark: this.regWriteoffInfo.remark,
        writeoffReceipayTransferDzgList: this.option11.data,
      }
      receivablePrerevWriteoff(data)
        .then((res) => {
          this.$msgSucClose('核销成功！')
          // 显示分摊手续费
          const dzgList = res.data.writeoffReceipayTransferDzgList || []
          if (dzgList.length) {
            this.transferFeeOption.data = dzgList
            this.transferFeeOption.show = true
            // 保存跳转参数
            let { writeoffReceipayNo, writeoffReceipayId } = res.data
            this.transferFeeOption.routerData = { writeoffReceipayNo, writeoffReceipayId }
          } else {
            let { writeoffReceipayNo, writeoffReceipayId } = res.data
            const params = { writeoffNo: writeoffReceipayNo }
            const query = { writeoffReceipayId, source: 'writeoffRecv' }
            // 直接刷新当前页，比利用路由控制刷新简便
            this.getData()
            this.routerPush('WriteoffRecvDetail2', query, true, params)
          }
        })
        .finally(() => (this.loading = false))
    },
    handleDelete($index, row, option) {
      this.$confirmWarn('是否确认删除？', () => {
        this.option1.data.splice($index, 1)
        this.viaWriteoffCurrencySetRate()
        this.writeoffRate()
      })
    },
    // 显示水单委托单
    showAttachment(path) {
      const href = `/base/fileView/preview/${path}/sowoll`
      window.open(href)
    },
    // 关闭附件
    handleClose(val) {
      this.$confirmWarn('确定删除' + (val === 'bankseq' ? '水单附件' : '委托附件') + '？', () => {
        this.handleCloseDelete(val)
      })
    },
    handleCloseDelete(val) {
      const data = {
        receivablePrerevId: this.regWriteoffInfo.receivablePrerevId,
        bankseqFileCode: undefined,
      }
      // 委托附件
      if (val === 'proxy') {
        regDeleteProxyFile(data).then((res) => {
          this.$msgSucClose('委托附件删除成功!')
          Object.assign(this.regWriteoffInfo, {}, { proxyFileName: '', proxyFilePath: '' })
        })
      }
    },
    // 返回按钮
    cancel(refresh) {
      this.routerBackReset ? this.routerPush('RegWriteoff') : this.routerBack(refresh)
    },
    search(data) {
      console.log('search.data:', data)
      const keys = Object.keys(data)
      if (keys.some((item) => item === 'settleOrderNo')) {
        this.getSettleOrderList()
      } else {
        this.getInvoiceList()
      }
    },
    sendMulti(data, option) {
      if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option2) this.multipleSelection2 = data
      if (option === this.option3) this.multipleSelection3 = data
      if (option === this.option7) this.multipleSelection7 = data
    },
    // 关联发票
    handleRelevanceOpen() {
      // if (this.option11.data.length) {
      //   return this.$msgErrClose('费用核销、调账核销、余额转大掌柜，一次只能操作一种类型')
      // }
      this.feeSource = 'invoice'
      this.searchOption1.columns[0].placeholder = this.regWriteoffInfo.settleCorpName
      this.getInvoiceList()
    },
    // 关联结算单
    handleSettleOrderFeeList() {
      // if (this.option11.data.length) {
      //   return this.$msgErrClose('费用核销、调账核销、余额转大掌柜，一次只能操作一种类型')
      // }

      this.feeSource = 'settle_order'
      this.option3.data.currency = this.regWriteoffInfo.writeoffCurrency
      this.multipleSelection3 = []
      this.getSettleOrderList()
    },
    // 关联委托结算单位
    handleSettleCrop() {
      this.defaultChecked = []
      this.getRefSettleUnitList()
    },
    // 协助代收付分公司
    markAssistedComp() {
      this.exchangeCorpDialogAssist = true
      this.$nextTick(() => {
        this.settleCorpSelectListAssist = []
        this.corpFormAssist.settleCorp = ''
        this.$nextTick(() => {
          this.$refs.corpFormAssist.clearValidate()
        })
      })
    },
    exchangeCorpAssist() {
      this.$refs.corpFormAssist.validate((valid) => {
        if (!valid) return
        markAssistedComp({
          receivableRegId: this.regWriteoffInfo.receivableRegId,
          assistedCompCode: this.corpFormAssist.settleCorp.value,
          assistedCompName: this.corpFormAssist.settleCorp.label,
        }).then((res) => {
          this.$msgSucClose('已指定协助代收付分公司！')
          this.exchangeCorpDialogAssist = false
          let { assistedCompCode, recvCompCode } = this.regWriteoffInfo
          if (assistedCompCode && assistedCompCode === this.$store.state.user.userInfo.settleCompanyCode) {
            if (
              recvCompCode !== this.corpFormAssist.settleCorp.value &&
              assistedCompCode !== this.corpFormAssist.settleCorp.value
            ) {
              this.delVisitedView()
              this.cancel(true)
              return
            }
          }
          this.getData()
        })
      })
    },
    settleCorpSelectRemoteAssist(queryString) {
      this.$store.dispatch('dict/querySettleUnit', { queryString, unitTypes: 'company' }).then((data) => {
        let code = this.$store.state.user.userInfo.settleCompanyCode
        this.settleCorpSelectListAssist = data
          .filter((v) => v.key !== code)
          .map((item) => ({ label: item.value, value: item.key }))
      })
    },
    // 费用代码下拉列表自动补充的数据
    feeItemQuerySearch(queryString, item) {
      baseFeeItemList(queryString).then((res) => {
        item.remoteSelectList = res.data.map((item) => ({ label: `${item.feeName}`, value: item.feeCode }))
      })
    },
    // 关联委托结算单位列表
    getRefSettleUnitList() {
      const data = {
        writeoffRecvSource: 'receivable_prerev',
        receivablePrerevId: this.regWriteoffInfo.receivablePrerevId,
      }
      getRefSettleUnitList(data).then((res) => {
        if (!res.data.length) {
          return this.$msgErrClose('对不起，没有查询到相关数据！')
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
        item.childs.length && this.fliterSettle(item.childs)
      })
    },
    // 获取费用列表
    settleOrderFeeList() {
      // if (this.option11.data.length) {
      //   return this.$msgErrClose('费用核销、调账核销、余额转大掌柜，一次只能操作一种类型')
      // }

      const data = {
        writeoffRecvSource: 'receivable_prerev',
        receivablePrerevId: this.regWriteoffInfo.receivablePrerevId,
        settleCorpCode: '',
      }
      let { searchInputGroup } = this.searchOption3.addFilter
      searchInputGroup.forEach((item) => {
        if (!item.key) return
        data[item.key] = item.value.trim()
      })
      const settleCorpCodeArr = this.option5.data.filter((item) => item.relationType !== 'temporary')
      data.refSettleCorpCodeList = [this.regWriteoffInfo.settleCorpCode, ...settleCorpCodeArr]
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
    },
    // 关闭费用列表
    closeWriteoffFee() {
      this.writeoffFeeDialog = false
      let { searchInputGroup } = this.searchOption3.addFilter
      searchInputGroup.forEach((item) => {
        if (!item.key) return
        item.value = ''
      })
      // // 清空搜索值
      // const obj = this.searchOption3.data
      // Object.keys(obj).forEach((key) => {
      //   obj[key] = ''
      // })
    },
    // 一键修改汇率
    changeRate() {
      const len = this.multipleSelection1.length
      if (!len) {
        return this.$msgErrClose('请先勾选数据再修改汇率！')
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
        return this.$msgErrClose('没有可修改的核销费率！')
      }
      let error = false
      for (let i = 0; i < len; i++) {
        const item = this.option6.data[i]
        if (item.settlementRate < item.lowerRate) {
          this.$msgErrClose(`${item.srcCurrency}-${item.toCurrency}的汇率不能低于汇率下限${item.lowerRate}`)
          error = true
          break
        }
        if (item.settlementRate > item.upperRate) {
          this.$msgErrClose(`${item.srcCurrency}-${item.toCurrency}的汇率不能高于汇率上限${item.upperRate}`)
          error = true
          break
        }
      }
      if (error) {
        return false
      }
      this.changeMultipleRate()
    },
    // 修改费用列表汇率
    changeMultipleRate() {
      const len = this.option6.data.length
      this.option1.data.forEach((item) => {
        for (let index = 0; index < len; index++) {
          const ele = this.option6.data[index]
          if (item.currency === ele.srcCurrency && item.settleCurrency === ele.toCurrency) {
            item.writeoffExRate = ele.settlementRate
            // item.writeoffAmt = item.writeoffFeeAmt ? (item.writeoffFeeAmt * item.writeoffExRate).toFixed(2) : 0
            item.writeoffAmt = item.writeoffFeeAmt ? new LSnum(item.writeoffFeeAmt).times(item.writeoffExRate).toNum(2) : 0
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
    // 修改调账金额
    changeAdjustAmt() {
      // 大掌柜金额
      let totalDzg = 0
      if (this.option11.data.length) {
        totalDzg = this.option11.data.reduce((pre, cur) => pre.plus(cur.internalDzgAmt), BIGZERO).num
      }
      const adjustAmt = +this.regWriteoffInfo.adjustAmt
      const balance = this.regWriteoffInfo.balance
      if (!adjustAmt) {
        // this.regWriteoffInfo.unusedAmt = decimalFixed2(new LSnum(balance).minus(totalDzg).val)
        return
      }
      // const len = this.option11.data.length
      // if (len) {
      //   return this.$msgErrClose('费用核销、调账核销、余额转大掌柜，一次只能操作一种类型')
      // }
      if (!/^\d+(\.\d{0,2})?$/.test(adjustAmt)) {
        // this.regWriteoffInfo.unusedAmt = decimalFixed2(new LSnum(balance).minus(totalDzg).val)
        return this.$msgErrClose('请填写正确的数字')
      }
      // const unusedAmt = this.regWriteoffInfo.unusedAmt
      // if (adjustAmt - unusedAmt > 0) {
      //   // this.regWriteoffInfo.unusedAmt = decimalFixed2(new LSnum(balance).minus(totalDzg).val)
      //   return this.$msgErrClose('调账金额不能大于剩余可用金额')
      // }
      if (adjustAmt - balance > 0) {
        this.regWriteoffInfo.adjustAmt = balance
        // this.regWriteoffInfo.unusedAmt = decimalFixed2(new LSnum(balance).minus(totalDzg).val)
        return this.$msgErrClose('调账金额不能大于可用金额')
      }
      // this.regWriteoffInfo.unusedAmt = decimalFixed2(new LSnum(balance).minus(adjustAmt).minus(totalDzg).val)
    },
    // 跳转至详情页
    showDetail(row) {
      if (!row.sourceBizNo && !row.feeSourceType) {
        return this.$msgErrClose('单号不能为空！')
      }
      this.showOneNoDetail('sourceBizNo', row.sourceBizNo)
    },
    // 删除发票并删除关联费用列表
    delInvoiceReceivable({ invoiceReceivableId }, $index) {
      this.option9.data.splice($index, 1)
      this.option1.data = this.option1.data.filter((item) => item.invoiceReceivableId !== invoiceReceivableId)
    },
    // 增加手续费
    addFee() {
      const currency = this.regWriteoffInfo.currency
      this.$refs.feeTableOption.showData = true
      this.option4.data.push({
        cutType: 'inter_cut',
        currency: currency,
        amt: '',
        allotAmt: '',
        hasAllotAmt: 0,
        edit: true,
        isDelete: true,
      })
    },
    // 更多汇率
    showExchangeRates() {
      this.exchangeRatesDialog = true
    },
    // 关闭发票核销
    closeRelevanceOpne() {
      this.relevanceOpen = false
      // 清空搜索值
      const obj = this.searchOption1.data
      Object.keys(obj).forEach((key) => (obj[key] = ''))
    },
    // 关闭结算单核销
    closeRelevanceOpne2() {
      this.relevanceOpen2 = false
      // 清空搜索值
      let { searchInputGroup } = this.searchOption2.addFilter
      searchInputGroup.forEach((item) => {
        if (!item.key) return
        item.value = ''
      })
      // const obj = this.searchOption2.data
      // Object.keys(obj).forEach((key) => (obj[key] = ''))
    },
    // 转大掌柜余额
    transferDzg() {
      // const adjustAmt = this.regWriteoffInfo.adjustAmt > 0
      // const writeoffFee = this.option1.data.length > 0
      // if (adjustAmt || writeoffFee) {
      //   return this.$msgErrClose('费用核销、调账核销、余额转大掌柜，一次只能操作一种类型')
      // }
      const len = this.option11.data.length
      let totalDzg = 0
      if (len) {
        this.transferOption.data = this.option11.data.map((item) => Object.assign({}, item, { edit: true }))
        totalDzg = this.option11.data.reduce((pre, cur) => pre.plus(cur.internalDzgAmt || 0), BIGZERO).valueOf()
      } else {
        this.transferOption.data = [{ dzgCompCode: '', internalDzgAmt: '', dzgWriteoffNo: '', edit: true }]
      }
      this.transferOption.unusedAmt = decimalFixed2(new LSnum(this.regWriteoffInfo.unusedAmt).plus(totalDzg).valueOf())
      this.transferOption.show = true
    },
    submitTransfer(data, total = 0) {
      // 核销总金额
      const writeoffAmt = this.getWriteoffAmt()
      if (total > new LSnum(this.regWriteoffInfo.balance).minus(writeoffAmt).num) {
        return this.$msgErrClose('转移总金额不能大于剩余未用金额！')
      }
      this.option11.data = data.map((item) =>
        Object.assign({}, item, {
          currency: this.regWriteoffInfo.currency,
          dzgCompName: this.dictMapObj.dzgCompCode[item.dzgCompCode.toLowerCase()],
          edit: false,
        })
      )
      this.regWriteoffInfo.unusedAmt = decimalFixed2(
        new LSnum(this.regWriteoffInfo.balance).minus(writeoffAmt).minus(total).valueOf()
      )
      this.closeTransfer()
    },
    closeTransfer() {
      this.transferOption.show = false
    },
    // 分摊手续费
    closeFee() {
      this.transferFeeOption.show = false
      let { writeoffReceipayNo, writeoffReceipayId } = this.transferFeeOption.routerData
      const params = { writeoffNo: writeoffReceipayNo }
      const query = { writeoffReceipayId, source: 'writeoffRecv' }
      // 直接刷新当前页，比利用路由控制刷新简便
      this.getData()
      this.routerPush('WriteoffRecvDetail2', query, false, params)
    },
    // 添加内扣手续费联动可核销金额及剩余未用金额
    computedMoney() {
      let arr = this.option4.data.filter((item) => item.cutType === 'inter_cut')
      let total = arr.reduce((pre, cur) => pre.plus(cur.amt || 0), BIGZERO).toNum(2)

      this.regWriteoffInfo.balance = decimalFixed2(new LSnum(this.regWriteoffInfo.defaultAmt).plus(total).num)
      const writeoffAmt = decimalFixed2(this.getWriteoffAmt())
      this.regWriteoffInfo.unusedAmt = decimalFixed2(new LSnum(this.regWriteoffInfo.balance).minus(writeoffAmt).num)
      this.writeoffFeeAmtData(true, this.regWriteoffInfo.balance)
      this.$nextTick(() => {
        const writeoffAmt = decimalFixed2(this.getWriteoffAmt())
        this.regWriteoffInfo.unusedAmt = decimalFixed2(new LSnum(this.regWriteoffInfo.balance).minus(writeoffAmt).num)
      })
    },
    // 监听click事件，切换银行手续费的可编辑状态
    listenClick() {
      if (this.checkAuth(this.$route.name, 'btn-addFee')) this.option4.edit = true
    },
    saveDzg() {
      this.option4.edit = false
      // 大掌柜余额
      let list = this.option11.data.filter((item) => item.edit)
      if (list.length > 0) {
        // 总金额验证
        const total = this.option11.data.reduce((pre, cur) => pre.plus(cur.internalDzgAmt), BIGZERO).toNum(2)
        // 核销总金额
        const writeoffAmt = this.getWriteoffAmt()
        if (total > this.transferOption.unusedAmt) {
          return this.$msgErrClose('转移总金额不能大于剩余未用金额！')
        } else {
          this.option11.data.forEach((item) => (item.edit = false))
        }
        this.regWriteoffInfo.unusedAmt = new LSnum(this.regWriteoffInfo.balance).minus(total).minus(writeoffAmt).toNum(2)
      }
    },
    jumpToRoute(data) {
      this.routerPush(data.name, data.query, false, data.params)
    },
    // 本地上传显示
    sendResUpload(data) {
      let { filePath, name, fileNo } = data.data
      // Object.assign(this.regWriteoffInfo.receivableReg, {
      //   bankseqFilePath: filePath,
      //   bankseqFileName: name,
      //   bankseqFileCode: fileNo,
      // })
      Object.assign(this.regWriteoffInfo.receivableReg, {
        payBankseqFilePath: filePath,
        payBankseqFileName: name,
        payBankseqFileNo: fileNo,
      })
    },
    openUploadFile() {
      this.fileList = []
      this.uploadParams = { receivableRegId: this.regWriteoffInfo.receivableRegId }
      this.showUploadFile = true
    },
    sendResFileList(val) {
      console.log(val)
    },
    closeUpload(isSure) {
      this.showUploadFile = false
      // if (isSure === true) {
      //   this.writeoffActionSure()
      // }
      // this.getData()
    },
    exchangeCorpShow() {
      // if (this.regWriteoffInfo.isTemporary !== 'yes') {
      //   return this.$msgErrClose('请勾选虚拟的结算单位进行操作！')
      // }
      this.transferSettleCorpCode = this.regWriteoffInfo.settleCorpCode
      this.exchangeCorpDialog = true
    },
    settleCorpSelectRemote(queryString) {
      this.$store.dispatch('dict/querySettleUnit', { queryString, containTemporary: 'no' }).then((data) => {
        this.settleCorpSelectList = data.map((item) => ({ label: item.value, value: item.key }))
      })
    },
    // 预收调转
    exchangeCorp() {
      console.log(this.corpForm)
      this.$refs.corpForm.validate((valid) => {
        if (!valid) return
        if (this.transferSettleCorpCode === this.corpForm.settleCorp.newSettleCorpCode) {
          return this.$msgErrClose('新的结算单位不能为旧的结算单位！')
        }
        let { value: newSettleCorpCode, label: newSettleCorpName } = this.corpForm.settleCorp
        let receivablePrerevId = this.regWriteoffInfo.receivablePrerevId
        transferSettleCorp({ ...this.corpForm, receivablePrerevId, newSettleCorpCode, newSettleCorpName }).then((res) => {
          this.$msgSucClose('调转成功！')
          this.getData()
          this.exchangeCorpDialog = false
        })
      })
    },
    sendResFileList(val) {
      console.log(val)
      this.corpForm.fileId = val && val.length > 0 ? val[0].fileNo : ''
      this.corpForm.fileNo = val && val.length > 0 ? val[0].fileNo : ''
      this.corpForm.fileName = val && val.length > 0 ? val[0].name : ''
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
  },
  components: {
    FinanceTable,
    CustomColumns,
    ToggleTable,
    FinanceSearch,
    TransferDzg,
    TransferFee,
    RegDetailInfo,
    RegSettleInfo,
    FinanceUpload,
    FinanceUploadEmbed,
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    hasBalance() {
      return this.regWriteoffInfo.balance && this.regWriteoffInfo.balance !== 0
    },
    isNotLock() {
      return this.regWriteoffInfo.lockStatus !== 'lock'
    },
    lessPayAmtTotal() {
      return this.option1.data.reduce((a, b) => {
        return new LSnum(a).plus(new LSnum(b.lessPayAmt).times(b.writeoffExRate)).toNum(2)
      }, 0)
    },
  },
  watch: {
    exchangeCorpDialog(val) {
      this.isShowUpload = val
      if (val) {
        this.corpForm.settleCorp = ''
        this.corpForm.fileNo = ''
        this.corpForm.fileName = ''
        this.corpForm.reason = ''
        this.$nextTick(() => this.$refs.corpForm.clearValidate())
      }
    },
    'option1.data': {
      handler(newVal, oldVal) {
        if (newVal && newVal.length === 0) {
          this.originalGather = this.exchangeGather = []
          // 大掌柜金额
          let totalDzg = 0
          if (this.option11.data.length) {
            totalDzg = +this.option11.data.reduce((pre, cur) => pre.plus(cur.internalDzgAmt), BIGZERO).valueOf()
          }
          this.regWriteoffInfo.unusedAmt = decimalFixed2(new LSnum(this.regWriteoffInfo.balance).minus(totalDzg).valueOf())
          return
        }
        clearTimeout(this.timer1)
        this.timer1 = setTimeout(() => {
          this.option1.data.forEach((item) => {
            item.writeoffAmt = decimalFixed2(new LSnum(item.writeoffFeeAmt).times(item.writeoffExRate).valueOf()) // 联动折算金额
          })

          const writeoffAmt = this.getWriteoffAmt()
          const lessPayAmt = this.getWriteoffAmt('lessPayAmt')

          if (this.regWriteoffInfo.lessPayAmt > 0) {
            if (lessPayAmt > this.regWriteoffInfo.lessPayAmt) {
              this.regWriteoffInfo.lessPayAmt = decimalFixed2(lessPayAmt)
            }
          } else if (Number(this.regWriteoffInfo.lessPayAmt) === 0) {
            this.regWriteoffInfo.lessPayAmt = decimalFixed2(lessPayAmt)
          }
          if (this.option1.data.length) {
            this.regWriteoffInfo.unusedAmt = decimalFixed2(
              new LSnum(this.regWriteoffInfo.balance || 0).minus(writeoffAmt).valueOf()
            )
          }
          // this.feeSumChange()
          this.writeoffGatherChange()
        }, 500)
      },
      deep: true,
    },
    'regWriteoffInfo.exchangeRates': {
      // 当用户输入自定义核销汇率时，联动各个费用合计
      handler(newVal, oldVal) {
        if (++this.watchFormExchangeRatesTime === 1) return
        clearTimeout(this.timer2)
        this.timer2 = setTimeout(() => {
          if (this.settleExchageRateList.length > 0) {
            newVal.forEach((item, index) => {
              if (item.lowerRate && item.settlementRate < item.lowerRate) {
                return this.$msgErrClose(`输入汇率不能低于汇率下限${item.lowerRate}!`)
              }
              if (item.upperRate && item.settlementRate > item.upperRate) {
                return this.$msgErrClose(`输入汇率不能高于汇率上限${item.upperRate}!`)
              }
              this.settleExchageRateList[index].rate = Number(item.settlementRate)
            })
            this.rateChange()
            this.writeoffFeeAmtData()
          }
          // this.feeSumChange()
        }, 800)
      },
      deep: true,
    },
    'regWriteoffInfo.balance'(val) {
      if (val - this.regWriteoffInfo.adjustAmt < 0) {
        this.regWriteoffInfo.adjustAmt = val
        this.$msgErrClose('调账金额不能大于可用金额')
      }
    },
    multipleSelection3: {
      handler(val) {
        this.getSettleOrderList('fromSum', val)
      },
      deep: true,
    },
  },
  activated() {
    console.log(this.$route.meta.isUseCache)
    if (!this.$route.meta.isUseCache) {
      this.init()
      this.getData()
    }
  },
  deactivated() {
    clearData(SETTLECROPLIST)
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
.writeoff-form {
  padding: 0 8px;
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
    margin-bottom: 15px;
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
      width: 80px;
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
</style>
