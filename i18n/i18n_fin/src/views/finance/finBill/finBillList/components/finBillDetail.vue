<template>
  <div
    class="finance-page finance-finbill-detail"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <div class="finance-list-container">
      <div class="money-box money-box-border-bottom">
        <div class="money-box-left">
          <div class="money-title">{{$t('FinBill.chargeDetails')}}</div>
        </div>
        <div class="money-box-right">
          <!-- <el-button-group
            v-if="checkAuth($route.name, 'btn-addReceive') || checkAuth($route.name, 'btn-addPay')"
            v-show="!isEdit && finBillNo"
          >
            <el-button class="finance-btn" size="mini" type="primary" @click="finBillEdit">{{$t('Common.modify')}}</el-button>
          </el-button-group>
          <el-button-group v-show="isEdit && finBillNo">
            <el-button class="finance-btn" size="mini" type="primary" @click="saveFinBill">{{$t('Common.save')}}</el-button>
            <el-button class="finance-btn" size="mini" @click="cancel(true)">{{$t('Common.cancel')}}</el-button>
          </el-button-group> -->
          <el-button-group v-show="feeHasClose==='no'">
            <el-button class="finance-btn" size="mini" type="primary" @click="handleSavePre('both')">{{$t('Common.save')}}</el-button>
          </el-button-group>
          <el-button-group
            v-if="checkAuth($route.name, 'btn-createSettle')"
            v-show="finBillNo"
          >
            <el-button class="finance-btn" size="mini" @click="generate">{{$t('FeeList.single')}}</el-button>
          </el-button-group>
          <el-button-group>
            <el-button class="finance-btn" size="mini" @click="back">{{$t('Common.back')}}</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    <div class="settlement-detail-form">
      <el-form :model="formData" ref="form" :rules="rules" :inline="true" size="mini" label-width="120px" label-suffix=":">
        <DetailDiv :label="$t('FinBill.finBillName')" :content="formData.finBillName" :isFull="true" />
        <DetailDiv :label="$t('FinBill.finBillNo')" :content="finBillNo" />
        <DetailDiv :label="$t('FinBill.billTypes')" :content="finType" />
        <DetailDiv :label="$t('FeeList.createdBy')" :content="formData.createdName" />
        <DetailDiv :label="$t('Settle.creatTime')" :content="formData.createdTime" />
        <DetailDiv :label="$t('FeeList.settleComp')" :content="formData.settleCompName" :isTooltip="true" />
        <DetailDiv v-if="depAndEmpDisabled" :label="$t('FinBill.employeeId')" :content="formData.employeeName" />
        <el-form-item v-else :label="$t('FinBill.employeeId')" prop="employeeId">
          <el-select
            filterable
            remote
            clearable
            :disabled="depAndEmpDisabled"
            size="mini"
            v-model="formData.employeeId"
            :placeholder="$t('Common.plSelect')"
            :remote-method="getEmployeeList"
            @visible-change="(value) => {if(value){getEmployeeList('')}}"
            @change="employeeChange"
            @clear="formData.employeeNo = formData.departCode = ''"
          >
          <!-- @clear="formData.employeeNo = formData.departCode = formData.year = formData.month = ''" -->
            <el-option
              v-for="o in employeeOptions "
              :key="o.employeeId"
              :label="o.cname"
              :value="o.employeeId"
            >
              <span>{{ o.cname }} ({{o.employeeNo}})</span>
            </el-option>
          </el-select>
        </el-form-item>
        <DetailDiv :label="$t('FinBill.employeeNo')" :content="formData.employeeNo" />
        <DetailDiv v-if="depAndEmpDisabled" :label="$t('FeeList.bdDeptCode')" :content="formData.departName" />
        <el-form-item v-else :label="$t('FeeList.bdDeptCode')" prop="departCode">
          <el-cascader
            v-if="forceRefresh"
            ref="cascader"
            filterable
            size="mini"
            clearable
            :disabled="depAndEmpDisabled"
            :options="departmentList"
            v-model="formData.departCode"
            :props="cascaderProps"
            :placeholder="$t('Common.plSelect')"
          ></el-cascader>
        </el-form-item>
        <DetailDiv :label="$t('FinBill.year')" :content="formData.year" />
        <DetailDiv :label="$t('FinBill.months')" :content="(+formData.month)+''" />
        <DetailDiv v-if="formData.sysLineName" :label="$t('FeeList.sysLineCode')" :content="formData.sysLineName" />
        <DetailDiv :label="$t('FinBill.remark')" :content="formData.remark" :isFull="true" />
      </el-form>
    </div>
    <div class="finance-table-summary">
      <div class="finance-summary-text">
        <div style="display:inline-block;margin-right:16px;">
          <span style="margin-right:20px;">
            <span>{{$t('FinBill.grossCnt')}}：CNY：</span>
            <span style="margin-right:8px;">{{grossProfit.cnyGrossProfit}}</span>
            <span>【{{$t('FinBill.grossTips')}}:</span>
            <span>{{grossProfit.usdGrossProfit}}】</span>
          </span>
          <span>{{$t('FinBill.gross')}}：{{grossProfit.grossProfitRate}}%</span>
        </div>
        <!-- <el-button type="text" @click="openProfitDetail" size="mini">{{$t('Common.details')}}</el-button> -->
        <!-- v-if="beginRenderTable34" -->
        <el-popover placement="bottom-start" trigger="hover">
          <div class="money-dialog money-dialog-profit">
            <div
              style="display:inline-block;margin-right:26px;font-weight: 600;color: #222222;line-height: 20px;"
            >
              <span style="margin-right:40px;">
                <span>{{$t('FinBill.grossCnt')}}：CNY：</span>
                <span style="margin-right:12px;">{{grossProfit.cnyGrossProfit}}</span>
                <span>【{{$t('FinBill.grossTips')}}：</span>
                <span>{{grossProfit.usdGrossProfit}}】</span>
              </span>
              <span>{{$t('FinBill.gross')}}：{{grossProfit.grossProfitRate}}%</span>
            </div>
            <FinanceTableMass :option="option4" />
          </div>
          <el-button type="text" slot="reference" style="font-size: 12px;">{{$t('Common.details')}}</el-button>
        </el-popover>
        <!-- <el-button type="text" v-if="!beginRenderTable34" size="mini">{{$t('Common.details')}}</el-button> -->
      </div>
      <div
        v-if="checkAuth($route.name, 'btn-close')"
        class="finance-btn-container total-fee-btn-container"
      >
        <el-button class="finance-btn" @click="openFeeClosedModifyFeeDialog" size="mini">{{$t('FinBill.closingFee')}}</el-button>
      </div>
    </div>
    <div style="margin: 0 14px;">
      <div class="money-box-left">
        <el-tooltip :content="$t('FinBill.balanceTips')">
          <div style="line-height:20px;">{{$t('FinBill.balance')}}：</div>
        </el-tooltip>
        <div
          class="money-total"
          v-for="(item, index) in originalFeeDiff"
          :key="'originalFeeDiff' + index"
        >
          {{item.currency}}
          <span>{{item.diffAmt}}</span>
        </div>
      </div>
    </div>
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left" style="padding-top:2px;">
          <div class="money-title">{{$t('FeeList.receivable')}}</div>
          <div
            class="money-total"
            v-for="(item, index) in moneyTotalReceive"
            :key="'moneyTotalReceive' + index"
          >
            {{$t('Common.total')}} {{item.currency}}：
            <span>{{item.sum}}</span>
          </div>
        </div>
        <div class="money-box-right">
          <el-button v-if="checkAuth($route.name, 'btn-addReceive') && !isEditRecei" class="finance-btn" @click="handleEdit('receive')" size="mini" type="warning">{{$t('Common.modify')}}</el-button>
          <el-button v-if="isEditRecei" class="finance-btn" @click="handleSavePre('receive')" type="primary" size="mini">{{$t('Common.save')}}</el-button>
          <el-button v-if="isEditRecei" class="finance-btn" @click="handleCancel('receive')" size="mini">{{$t('Common.cancel')}}</el-button>
          <el-button v-if="checkAuth($route.name, 'btn-addReceive')" class="finance-btn" @click="addReceive(null)" size="mini" type="primary">{{$t('FinBill.addReceive')}}</el-button>
          <el-button v-if="checkAuth($route.name, 'btn-addReceive')" class="finance-btn" @click="handleCopy('receive')" size="mini">{{$t('Common.copy')}}</el-button>
          <!-- <el-button class="finance-btn" size="mini" @click="handleCustomColumns">{{$t('Common.custTableHead')}}</el-button> -->
          <el-button
            class="finance-btn"
            v-if="checkAuth($route.name, 'btn-addPay')"
            size="mini"
            @click="addRow('option2', true)"
          >{{$t('FinBill.income')}}</el-button>
          <el-button
            class="finance-btn"
            v-if="checkAuth($route.name, 'btn-sureReceive')"
            size="mini"
            @click="confirmFee(multipleSelection1, 'btnLoading1', option1)"
            type="success"
            :loading="btnLoading1"
          >{{$t('FinBill.receiveConf')}}</el-button>
          <el-button
            class="finance-btn"
            v-if="checkAuth($route.name, 'btn-sureReceive')"
            size="mini"
            @click="cancleConfirmFeePrev('receive', 'btnLoading3')"
            :loading="btnLoading3"
          >{{$t('FinBill.cancelConf')}}</el-button>
          <!-- <el-button
            class="finance-btn"
            v-if="checkAuth($route.name, 'btn-addReceive')"
            size="mini"
            @click="addRow('option1')"
            type="primary"
          >新增应收费用</el-button> -->
          <el-button v-if="checkAuth($route.name, 'btn-updateNegFol')" class="finance-btn" @click="updateNegativeFollower('receive')" type="warning" size="mini">{{$t('FinBill.followUp')}}</el-button>
          <el-button v-if="checkAuth($route.name, 'btn-addReceive')" class="finance-btn" @click="handleDelete('receive')" size="mini" type="danger">{{$t('Common.del')}}</el-button>
          <el-button type="text" class="collapse-btn" @click="handleCollapse(1)" size="mini">
            {{showTable1? $t('Common.collapse'):''}}
            <i
              :class="[showTable1?'el-icon-arrow-down':'el-icon-arrow-right']"
            ></i>
          </el-button>
        </div>
      </div>
      <FinanceTableMass v-show="showTable1" :option="option1" ref="option1" @send-multi="sendMulti" />
    </div>
    <div class="finance-table-container">
      <div class="money-box">
        <div class="money-box-left" style="padding-top:2px;">
          <div class="money-title">{{$t('FeeList.payable')}}</div>
          <div
            class="money-total"
            v-for="(item, index) in moneyTotalPay"
            :key="'moneyTotalPay' + index"
          >
            {{$t('Common.total')}} {{item.currency}}：
            <span class="money-pay-color">{{item.sum}}</span>
          </div>
        </div>
        <div class="money-box-right">
          <el-button v-if="checkAuth($route.name, 'btn-addPay') && !isEditPay" class="finance-btn" @click="handleEdit('pay')" size="mini" type="warning">{{$t('Common.modify')}}</el-button>
          <el-button v-if="isEditPay" class="finance-btn" @click="handleSavePre('pay')" type="primary" size="mini">{{$t('Common.save')}}</el-button>
          <el-button v-if="isEditPay" class="finance-btn" @click="handleCancel('pay')" size="mini">{{$t('Common.cancel')}}</el-button>
          <el-button v-if="checkAuth($route.name, 'btn-addPay')" class="finance-btn" @click="addPay(null)" size="mini" type="primary">{{$t('FinBill.newExpenses')}}</el-button>
          <el-button v-if="checkAuth($route.name, 'btn-addPay')" class="finance-btn" @click="handleCopy('pay')" size="mini">{{$t('Common.copy')}}</el-button>
          <el-button
            v-if="checkAuth($route.name, 'btn-addReceive')"
            class="finance-btn"
            size="mini"
            @click="addRow('option1', true)"
          >{{$t('FinBill.expenditure')}}</el-button>
          <el-button
            v-if="checkAuth($route.name, 'btn-surePay')"
            class="finance-btn"
            size="mini"
            @click="confirmFee(multipleSelection2, 'btnLoading2', option2)"
            type="success"
            :loading="btnLoading2"
          >{{$t('FinBill.payableConf')}}</el-button>
          <el-button
            class="finance-btn"
            v-if="checkAuth($route.name, 'btn-surePay')"
            size="mini"
            @click="cancleConfirmFeePrev('pay', 'btnLoading4')"
            :loading="btnLoading4"
          >{{$t('FinBill.cancelConf')}}</el-button>
          <!-- <el-button
            v-if="checkAuth($route.name, 'btn-addPay')"
            class="finance-btn"
            size="mini"
            @click="addRow('option2')"
            type="primary"
          >新增应付费用</el-button> -->
          <el-button v-if="checkAuth($route.name, 'btn-updateNegFol')" class="finance-btn" @click="updateNegativeFollower('pay')" type="warning" size="mini">{{$t('FinBill.followUp')}}</el-button>
          <el-button v-if="checkAuth($route.name, 'btn-addPay')" class="finance-btn" @click="handleDelete('pay')" size="mini" type="danger">{{$t('Common.del')}}</el-button>
          <el-button type="text" class="collapse-btn" @click="handleCollapse(2)" size="mini">
            {{showTable2? $t('Common.collapse'):''}}
            <i
              :class="[showTable2?'el-icon-arrow-down':'el-icon-arrow-right']"
            ></i>
          </el-button>
        </div>
      </div>
      <FinanceTableMass v-show="showTable2" :option="option2" ref="option2" @send-multi="sendMulti" />
    </div>
    <!-- <FeeClosedModifyFeeDialog
      v-if="modifyFeeVisible.show"
      :multiple-selection="multipleSelection"
      :dialog-visible="modifyFeeVisible"
      :fin-bill-no="finBillNo"
      :is-fin-bill-fee="true"
    /> -->
    <div v-if="customColumnsPopShow1">
      <CustomColumns
        :columnsBase="selfColumnsBase1"
        :configColumns="configColumns1"
        @close="customColumnsPopClose"
      />
    </div>
    <div v-if="customColumnsPopShow2">
      <CustomColumns
        :columnsBase="selfColumnsBase2"
        :configColumns="configColumns2"
        @close="customColumnsPopClose"
      />
    </div>
    <!-- <el-dialog title="修改费用备注" :visible.sync="editDialogShow" :destroy-on-close="true" width="604px">
      <el-input
        type="textarea"
        v-model="rowFeeRemark"
        :placeholder="$t('Common.plEnter')"
        size="mini"
        clearable
        :autosize="{minRows:4}"
      ></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveFeeRemark" size="mini">{{$t('Common.sure')}}</el-button>
        <el-button @click="editDialogShow = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog> -->
    <el-dialog
      :title="$t('FinBill.editRemark')"
      :visible.sync="editRemarkVisible"
      :close-on-click-modal="false"
      custom-class="fin-edit-remark"
      width="560px">
      <div>
        <el-input v-model="rowRemark.remark" type="textarea" :maxlength="500" show-word-limit />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="saveRemark" size="mini" type="primary">{{$t('Common.sure')}}</el-button>
        <el-button @click="editRemarkVisible = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="$t('FinBill.followUp')"
      :visible.sync="editNegFolVisible"
      :close-on-click-modal="false"
      custom-class="fin-edit-bl"
      width="560px">
      <div>
        <el-select v-model="negFolForm.negativeFollowerId" remote filterable clearable
          :remote-method="employeeSelectlistSimp"
          @visible-change="(value) => {if(value){employeeSelectlistSimp('')}}"
          @change="changeNegFol">
          <el-option v-for="(item, index) in employeeSelectOptions" :key="'editNegFol' + index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="saveNegativeFollower" size="mini" type="primary">{{$t('Common.sure')}}</el-button>
        <el-button @click="editNegFolVisible = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="$t('FinBill.feeLog')"
      :visible.sync="logDialogVisible"
      :close-on-click-modal="false"
      width="800px">
      <FinanceTableMass
        :option="option5"/>
      <span slot="footer" class="dialog-footer">
        <el-button @click="logDialogVisible = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
    <BizDetailList :bizDetailVisible="bizDetailVisible" />
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { orderFeeMixin } from '@/views/finance/orderFee/orderFee/components/components/orderFeeMixin'
import { finBillMixin } from '@/views/finance/finBill/finBillList/components/finBillMixin'
import { mapState } from 'vuex'
import {
  queryFinBillFeePageList,
  saveFinBill,
  info,
  confirmFee,
  cancleConfirmFee,
  // updateFinBillFeeRemark,
} from '@/api/fin/finBill'
// import FeeClosedModifyFeeDialog from '@/views/finance/orderFee/orderFee/components/components/feeClosedModifyFeeDialog'
import CustomColumns from '@/components/customColumns/index'
import { listColumnConfigGet, listColumnConfigSave } from '@/api/base'
import BizDetailList from '@/views/finance/orderFee/orderFee/components/components/bizDetailList'
import { employeeSelectlist, departmentTreeList } from '@/api/companyResource'

export default {
  name: 'finBillDetail',
  mixins: [mixin, routerMixin, orderFeeMixin, finBillMixin],
  components: {
    FinanceTableMass,
    // FeeClosedModifyFeeDialog,
    CustomColumns,
    BizDetailList,
  },
  activated() {
    if (this.$route.meta.isUseCache && this.finBillNo) {
      return
    }
    this.finBillNo = this.$route.query.finBillNo
    // this.isEdit = false
    this.isEditPay = false
    this.isEditRecei = false
    this.settleCorpNameRecei = ''
    this.settleCorpCodeRecei = ''
    this.settleCorpNamePay = ''
    this.settleCorpCodePay = ''
    this.init()
    this.getInfo()
  },
  data() {
    return {
      rowFeeRemark: '',
      // editDialogShow: false, // 备注弹框
      // 是否显示表格 应收1 应付2
      showTable1: true,
      showTable2: true,
      // 表格数据 应收1 应付2
      option1: {},
      option2: {},
      multipleSelection1: [],
      multipleSelection2: [],
      table1DataBackup: [],
      table2DataBackup: [],
      deleteSelection: [],
      // 应收应付列表配置
      columns: [],
      finBillNo: '',
      finBillId: '',
      // isEdit: false,
      isEditPay: false,
      isEditRecei: false,
      formData: { finType: '', departCode: '', employeeId: '' },
      deleteArr: [],
      option4: {},
      grossProfit: {},
      timer1: null,
      timer2: null,
      modifyFeeVisible: {
        show: false,
      },
      multipleSelection: [],
      loading: false,
      originalFeeDiff: [],
      moneyTotalReceive: [],
      moneyTotalPay: [],
      customColumnsPopShow1: false,
      selfColumnsBase1: [],
      configColumns1: [],
      customColumnsPopShow2: false,
      selfColumnsBase2: [],
      configColumns2: [],
      btnLoading3: false,
      btnLoading4: false,
      isFinBill: true,
      feeHasClose: 'yes',
      rules: {
        departCode: [{ required: true, message: ' ', trigger: 'change' }],
        employeeId: [{ required: true, message: ' ', trigger: 'change' }],
      },
      departmentList: [],
      cascaderProps: {
        children: 'childList',
        label: 'deptCname',
        value: 'deptCode',
        checkStrictly: true,
      },
      employeeOptions: [],
      forceRefresh: true,
      createdName: '',
      editNegFolVisible: false,
      negFolForm: {
        negativeFollowerId: '',
        negativeFollowerName: '',
        type: ''
      },
      employeeSelectOptions: [],
      ownerCompCode: '',
    }
  },
  computed: {
    finType() {
      let finTypeObj = this.dictMap['finBillBillType'].find((item) => item.value === this.formData.billType)
      return finTypeObj && finTypeObj['label']
    },
    // 应收列表
    fbFeeVosRecei() {
      return [
        ...this.option1.data.map((item) => Object.assign(item, { receipayType: 'receive' })),
      ]
    },
    // 应付列表
    fbFeeVosPay() {
      return [
        ...this.option2.data.map((item) => Object.assign(item, { receipayType: 'pay' })),
      ]
    },
    // // 应收应付列表
    // fbFeeVos() {
    //   return [
    //     ...this.option1.data.map((item) => Object.assign(item, { receipayType: 'receive' })),
    //     ...this.option2.data.map((item) => Object.assign(item, { receipayType: 'pay' })),
    //   ]
    // },
    // 新增行格式
    rowData() {
      let obj = {}
      this.columns.forEach((item) => (obj[item] = ''))
      // this.columns.forEach((item) => (obj[item.prop] = ''))
      return Object.assign(
        {},
        { ...obj, edit: true, _edit: true, isAddFee: true }, // , _newEdit: true
        { settleCompCode: this.formData.settleCompCode, settleCompName: this.formData.settleCompName }
      )
    },
    depAndEmpDisabled() {
      if (this.feeHasClose==='yes') {
        return true
      } else {
        if (this.createdName !== 'system') {
          return false
        } else {
          if (this.roles.includes('admin')) {
            return false
          } else {
            return true
          }
        }
      }
    },
    ...mapState({
      defaultColumns: (state) => {
        return [
          ...state.finance.columns.defaultColumns,
          'srcWriteoffReceipayNo',
          'receipayWay',
          'receipayAccountShortName',
          'receipayAccountNo',
        ]
      },
      columnsBase: (state) => state.finance.columns.columnsBase.filter((v) => v.prop !== 'serviceName'),
      compCode: (state) => state.user.userInfo.settleCompanyCode,
      roles: (state) => state.user.roles
    }),
  },
  created() {
    listColumnConfigGet({ scenesCode: 'finbill_rec_fee' }).then((res) => {
      this.dealCustomColumn(res, 'rec')
    })
    listColumnConfigGet({ scenesCode: 'finbill_pay_fee' }).then((res) => {
      this.dealCustomColumn(res, 'pay')
    })
    console.log(this.dictMap.taxRateInfo)
    // 表格内容
    let tips = { text: '', show: false }
    this.option1 = {
      ...this.option,
      data: [],
      edit: false,
      id: 'option1',
      $name: 'FinBillListDetail1',
      tips: { ...tips },
      selection: {
        show: true,
        fixed: false
      },
      maxHeight: 300,
      index: {
        show: true,
        fixed: false
      },
      handleKeyup: this.handleKeyup,
      noCheckWhenEdit: true,
      customColumns: {
        handleCustomColumns: () => (this.customColumnsPopShow1 = true),
        show: true,
        fixed: false
      },
      disableFixedIndex0: true
    }
    this.option2 = {
      ...this.option,
      data: [],
      edit: false,
      id: 'option2',
      $name: 'FinBillListDetail2',
      tips: { ...tips },
      selection: {
        show: true,
        fixed: false
      },
      maxHeight: 300,
      index: {
        show: true,
        fixed: false
      },
      handleKeyup: this.handleKeyup,
      noCheckWhenEdit: true,
      customColumns: {
        handleCustomColumns: () => (this.customColumnsPopShow2 = true),
        show: true,
        fixed: false
      },
      disableFixedIndex0: true
    }
    // let obj2 = { label: this.$t('Common.del'), type: 'text', show: true, action: 'Delete' }
    this.option1.operationBtns.width = '150px'
    this.option1.operationBtns.data = this.option2.operationBtns.data = [
      // { ...obj2 },
      // { label: '复制', type: 'text', show: true, action: 'Copy' },
      {
        label: this.$t('FinBill.remark'),
        style: {color: '#edb534'},
        type: 'text',
        show: true,
        action: 'Remark'
      },
      {
        label: this.$t('FinBill.log'),
        type: 'text',
        show: true,
        action: 'showLog'
      },
      {
        label: this.$t('Common.details'),
        type: 'text',
        show: true,
        action: 'BizDetail'
      }
    ]
    // if (!this.checkAuth(this.$route.name, 'btn-addReceive')) this.option1.operationBtns = false
    // if (!this.checkAuth(this.$route.name, 'btn-addPay')) this.option2.operationBtns = false
    // this.loanBasicData()
    // this.getEmployeeList('')
  },
  methods: {
    feeNameQuery(queryString, cb) {
      // console.log(this.formData.billType);
      // transfer_fee银行手续费  fee_adjust关账 intrabranch内部往来 preserve_fee留置 express_fee快递 other其它
      // TODO 根据费用单类型传参
      let feeCode,
        finGroup,
        billType = this.formData.billType
      if (billType === 'transfer_fee') {
        // feeCode = 'YINHANGNK,YINHANGWK'
        feeCode = 'SOUSHIFEI,SXFFT'
      } else if (billType === 'dzg_bill_fee') {
        feeCode = 'NBWLSZDZG,NBWLXMDZG'
        let arr = this.dictMap.dzgCompCode.map(({ label, value }) => {
          return {
            label,
            value: label,
            feeCode: value,
            feeEnName: value,
            currency: '',
            feeUnit: '',
            currency: '',
            key: value,
            feeName: label,
            znTaxRate: '',
          }
        })
        return cb && cb(arr)
      } else if (billType === 'express_fee') {
        feeCode = 'KDFFYL,KDF'
      } else if (billType === 'intrabranch') {
        // finGroup = 'intrabranch'
        feeCode = 'NBWL'
      } else if (billType === 'preserve_fee') {
        finGroup = 'lien'
      }
      // console.log(feeCode, finGroup);
      // else if(this.billType === 'other'){}else if(this.billType === 'fee_adjust'){}
      // this.queryFeeItemList({ queryString, feeCode, finGroup }, cb)
      this.queryFeeItemList({ queryString, feeCode, finGroup, bizState: billType === 'transfer_fee' ? false : '' }, cb)
    },
    init() {
      this.forceRefresh = false
      this.loanBasicData()
      this.getEmployeeList('')
      this.$nextTick(() => {
        this.forceRefresh = true
      })
    },
    getInfo(notGetData) {
      this.loading = true
      this.option1.edit = false
      this.option2.edit = false
      info({ finBillNo: this.finBillNo })
        .then((res) => {
          this.formData = { ...res.data }
          if (res.data.billType === 'transfer_fee') {
            this.option2.pagination = { ...this.option.pagination, show: true, isNew: true, currPage : 1, pageSize : 1000 }
          } else {
            this.option2.pagination = false
          }
          this.finBillId = res.data.finBillId
          this.feeHasClose = res.data.feeHasClose
          this.createdName = res.data.createdName
          this.ownerCompCode = res.data.ownerCompCode
          this.forceRefresh = false
          this.loanBasicData()
          setTimeout(() => {
            this.forceRefresh = true
          }, 200)
          this.getEmployeeList(res.data.employeeName)
          !notGetData && this.getData()
        })
        .catch(() => {
          this.finBillNo = ''
          this.formData.finBillName = ''
          this.formData.billType = ''
          this.formData.departName = ''
          this.formData.employeeName = ''
          this.formData.remark = ''
          this.feeHasClose = 'yes'
          this.option1.data = []
          this.option2.data = []
          // 接口报错时，自动返回
          this.delVisitedView()
          this.back()
        })
    },
    getData(){
      this.debounceLs(this.getData2)
    },
    getData2(param = {}) {
      this.deleteArr = []
      // this.option1.data = []
      // this.option2.data = []
      let currPage = this.option2.pagination ? this.option2.pagination.currPage : 1
      let pageSize = this.option2.pagination ? this.option2.pagination.pageSize : 1000
      let data = {
        columns: [],
        currPage,
        pageSize,
        query: [{ column: 'finBillNo', type: 'eq', value: this.finBillNo }],
      }
      // if (process.env.NODE_ENV === 'development') {
      queryFinBillFeePageList(data)
        .then((res) => {
          this.loading = false
          if (res.code === 0) {
            if (this.option2.pagination) {
              Object.assign(this.option2.pagination, res.data)
            }
            let { grossProfit, grossProfitDetail, list, originalFeeDiff, payFinBillFeeAmtSum, recvFinBillFeeAmtSum } = res.data
            let data1 = list.filter((item) => {
              item.settleOrderNos_multiValue = item.settleOrderNos.split(',')
              item.writeoffNos_multiValue = item.writeoffNos.split(',')
              item.settleTimes_multiValue = item.settleTimes.split(',')
              // item.invoiceNos_multiValue = item.invoiceNos.split(',')
              item.payApplySettleNos_multiValue = item.payApplySettleNos.split(',')
              item.payOrderNos_multiValue = item.payOrderNos.split(',')
              // item.acctVoucherNos_multiValue = item.acctVoucherNos.split(',')
              item.acctVoucherNos_multiValue = item.acctVoucherNos.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[1] ? arr[1] : arr[0]
              })
              item.voucherSeqNos_multiValue = item.acctVoucherNos.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[0]
              })
              item.invoiceNos_multiValue = item.invoiceNos.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[1] ? arr[1] : arr[0]
              })
              item.invoiceReceivableIds_multiValue = item.invoiceNos.split(',').map((subItem) => {
                let arr = subItem.split('/')
                return arr[0]
              })
              return item.receipayType === 'receive'
            })
            let data2 = list.filter((item) => {
              return item.receipayType === 'pay'
            })
            data1.forEach((row) => {
              row._forceEdit = this.formData.billType === 'dzg_bill_fee'
            })
            // // this.option1.columns = this.checkAuth(this.$route.name, 'btn-addReceive') ? [...arr1,operation] : [...arr1]
            // // this.option2.columns = this.checkAuth(this.$route.name, 'btn-addPay') ? [...arr2,operation] : [...arr2]
            // this.option1.data = data1
            // this.option2.data = data2
            // // 先简单备份一下原始的数据，以备删除
            // this.table1DataBackup = [...this.option1.data]
            // this.table2DataBackup = [...this.option2.data]
            let dataType = param.dataType
            if (dataType === 'receive') {
              this.option1.data = data1
              this.table1DataBackup = JSON.parse(JSON.stringify(this.option1.data))
            } else if (dataType === 'pay') {
              this.option2.data = data2
              this.table2DataBackup = JSON.parse(JSON.stringify(this.option2.data))
            } else {
              this.option1.data = data1
              this.option2.data = data2
              // 备份一下原始的数据，以备删除
              this.table1DataBackup = JSON.parse(JSON.stringify(this.option1.data))
              this.table2DataBackup = JSON.parse(JSON.stringify(this.option2.data))
            }
            this.multipleSelection1 = [] // 当一个option更新数据，另外一个有勾选数据，但被去掉勾选状态，因此采用在此重置的办法。背景色未有办法改变。
            this.multipleSelection2 = []

            this.grossProfit = grossProfit
            this.setProfitDetail(grossProfitDetail)
            this.originalFeeDiff = originalFeeDiff
            this.computeMoneyTotalFront()
          }
        })
        .catch((err) => {
          console.log(err)
          this.delVisitedView()
          this.back()
        })
      // } else {
      //   getFinBillDetail({ finBillId: this.finBillId }).then((res) => {
      //     res.data.forEach((item) => {
      //       item.test = '删除'
      //       item.operation = 'update'
      //       item.taxRate = item.taxRate + ''
      //       this[`option${item.receipayType === 'pay' ? 2 : 1}`].data.push(item)
      //     })
      //   })
      // }
    },
    setProfitDetail(data) {
      let columns = [
        {
          prop: 'settleCompName',
          label: this.$t('FeeList.settleComp'),
          type: 'text',
        },
        {
          prop: 'yearMon',
          label: this.$t('FinBill.yearMon'),
          type: 'text',
        },
        {
          prop: 'cnyGrossProfit',
          label: this.$t('FinBill.cnyGrossProfit'),
          type: 'text',
        },
        {
          prop: 'usdGrossProfit',
          label: this.$t('FinBill.usdGrossProfit'),
          type: 'text',
        },
        {
          prop: 'grossProfitRate',
          label: this.$t('FinBill.gross'),
          type: 'text',
          formatter: ({ cellValue }) => {
            return cellValue + '%'
          },
        },
      ]
      this.option4.columns = columns
      this.option4.data = data
      this.option4.disableFixedIndex0 = true
    },
    // 所属部门下拉框
    loanBasicData() {
      console.log(this.compCode);
      departmentTreeList({ state: 'valid' }).then((res) => {
        let arr = []
        let getNode = (node)=> node.forEach(item => {
          // if(arr.length) return
          // if(item.deptCode === this.compCode) {
          //   arr = item.childList || []
          //   return   
          // }
          if(item.deptCode === this.compCode || item.settleCompanyCode === this.compCode || item.deptCode === this.ownerCompCode || item.settleCompanyCode === this.ownerCompCode) {
            arr.push(item)
            return   
          }
          item.childList && getNode(item.childList)
        }) 
        getNode(res.data || [])
        this.departmentList.splice(0, 1000, ...this.getTreeData(arr)) // 为使其他人员进入页面显示正常，增加数据
        // this.departmentList.splice(0, 1000, ...this.getTreeData(res.data || [], [], 0))
        // console.log(this.deptCodeObj);
        // console.log(this.departmentList)
      })
    },
    // 转化children的空数组为undefined，平铺数据转化为对象
    // getTreeData(data, arr = [], level, root) {
    getTreeData(data) {
      // 选择员工时由后端返回，不再需要前端处理将各级code保存为键值对
      // 判断第几层
      // level += 1
      // 大于第二层时需要用一个数组临时保存arr，for循环时会改变arr
      // let result = []
      for (let i = 0; i < data.length; i++) {
        // 获取本层code
        // let code = data[i].deptCode
        // 第二层时需要push数组存放第一层和第二层的code
        // level == 2 && arr.push([root, code])
        // 大于第二层时，利用result来存放前两层和本层code
        // if (level > 2) result = [...arr, code]
        if (!data[i].childList.length) {
          // 选择员工时由后端返回，不再需要前端处理
          // 没有子元素，即可用此层的code做为对象key，第一层时直接返回code，第二层时直接返回arr[i],第二层后返回result
          // this.deptCodeObj[data[i].deptCode] = level == 1 ? [code] : level == 2 ? arr[i] : result
          // children若为空数组，则将children设为undefined
          data[i].childList = undefined
        } else {
          // 第二层时传for循环内第i个元素，其它层传arr本身，code用于将第一层code传至第二层
          // this.getTreeData(data[i].childList, level == 2 ? arr[i] : level > 2 ? result : arr, level, code)
          this.getTreeData(data[i].childList)
        }
      }
      return data
    },
    // 分属员工下拉框
    getEmployeeList(queryString) {
      let departCode = this.formData.departCode || []
      if (departCode instanceof Array) {
        departCode = departCode[departCode.length - 1] || this.compCode
      } else {
        departCode = departCode || this.compCode
      }
      // let departCode = ''
      let data = { name: queryString, deptCodes: departCode, hasEmpAllParentDeptCode: 'yes'}
      if(this.formData.billType === 'pricing_loss_berth_fee'){
        data.roleCodes = 'pricing'
      }
      employeeSelectlist(data).then((res) => { // 赵斌加入参deptCodes size
        // if(this.formData.billType === 'dzg_bill_fee'){
        //   this.employeeOptions = res.data.filter(v=>v.isPublic === 'yes') || []
        //   return 
        // }
        this.employeeOptions = res.data
        // this.backupEmployeeOptions.splice(0, 1000, ...res.data.filter((v) => !departCode || v.deptCode == departCode))
        // this.employeeOptions.splice(0, 1000, ...this.backupEmployeeOptions)
      })
    },
    employeeChange(val) {
      // console.log(this.deptCodeObj);
      console.log(val)
      let find = this.employeeOptions.find((item) => {
        return item.employeeId === val
      })
      if (!find) return
      this.employeeIsPublic = find.isPublic === 'yes'
      this.formData.employeeNo = find.employeeNo
      this.formData.employeeName = find.cname
      let findDeptCode = find.empAllParentDeptCode[find.empAllParentDeptCode.length - 1] // 亦可find.empAllParentDeptCode.splice(1)
      if(findDeptCode){
        this.forceRefresh = false
        // this.$nextTick(()=>{
        //   this.forceRefresh = true
        //   this.$nextTick(()=>{
        //     this.formData.departCode = findDeptCode
        //   })
        // })
        setTimeout(() => {
          this.formData.departCode = findDeptCode
          this.forceRefresh = true
        }, 200)
      }
      // this.isEmployeeChange = true
      // let findCode = find.empAllParentDeptCode
      // let formCode = this.formData.departCode

      // if(findCode.length && formCode && formCode.length){
      //   let len1 = findCode.length
      //   let len2 = formCode.length
      //   let arr = [...findCode].splice(len1 - len2)
      //   if(arr.toString() === formCode.toString()) return
      // }
      // // let findDeptCode = this.deptCodeObj[find.deptCode]
      // let findDeptCode = find.empAllParentDeptCode.splice(1)
      // if(findDeptCode){
      //   this.forceRefresh = false
      //   this.$nextTick(()=>{
      //     this.forceRefresh = true
      //     this.$nextTick(()=>{
      //       this.formData.departCode = findDeptCode
      //     })
      //   })
      // }
      // // this.formData.departCode = this.deptCodeObj[find.deptCode] || []
      // // console.log(this.formData)
    },
    seekDepartName(list, code) {
      let deptCname = ''
      for (var i = 0; i < list.length; i++) {
        if (list[i].deptCode === code) {
          deptCname = list[i].deptCname
          break
        } else if (list[i].childList && list[i].childList.length > 0) {
          let name = this.seekDepartName(list[i].childList, code)
          if (name) {
            deptCname = name
          }
        }
      }
      return deptCname
    },
    showColumnDetail(params) {
      this.showColumnDetailHandle(params) // , { isTab: true }
    },
    confirmFee(multipleSelection, btnLoading, option) {
      if (multipleSelection.some((item) => item.edit)) {
        return this.$msgErrClose(this.$t('FinBill.confirmFee'))
      }
      if (option.data && option.data.length === 0) {
        return this.$msgErrClose(this.$t('FinBill.noFee'))
      }
      if (multipleSelection.length === 0) {
        return this.$msgErrClose(this.$t('FinBill.selectFee'))
      }
      let data = {
        finBillNo: this.finBillNo,
        finBillFeeIdList: multipleSelection.map((item) => item.finBillFeeId),
      }
      this.$confirmWarn(this.$t('FinBill.yesFee'), () => {
        this[btnLoading] = true
        confirmFee(data)
          .then((res) => {
            this.$msgSucClose(this.$t('FinBill.sucFee'))
            this.getData()
          })
          .finally(() => (this[btnLoading] = false))
      })
    },
    cancleConfirmFeePrev(receipayType, btnLoading) {
      let option = receipayType === 'receive' ? this.option1 : this.option2
      let multipleSelection = receipayType === 'receive' ? this.multipleSelection1 : this.multipleSelection2
      let feesNotEnterFin = []
      if (multipleSelection.some((item) => item.edit)) {
        return this.$msgErrClose(this.$t('FinBill.saveFee'))
      }
      if (option.data && option.data.length === 0) {
        return this.$msgErrClose(this.$t('FinBill.cancelFee'))
      }
      if (multipleSelection.length === 0) {
        return this.$msgErrClose(this.$t('FinBill.chooseFee'))
      } else {
        let feesConfirm = multipleSelection.filter(item => {
          return item.confirmStatus === 'yes'
        })
        if (!feesConfirm.length) {
          return this.$msgErrClose(this.$t('FinBill.errFee'))
        }
        feesNotEnterFin = feesConfirm.filter(item => {
          return (
            item.precloseStatus !== 'yes' &&
            item.closeStatus !== 'yes' &&
            item.settleLock !== 'lock' &&
            item.finUseStatus !== 'yes'
          )
        })
        if (!feesNotEnterFin.length) {
          return this.$msgErrClose(this.$t('FinBill.closeFee'))
        }
      }
      this.$confirmWarn(this.$t('FinBill.confFee'), () => {
        this[btnLoading] = true
        let finBillFeeIdList = feesNotEnterFin.map((item) => item.finBillFeeId)
        cancleConfirmFee({ finBillNo: this.finBillNo, finBillFeeIdList })
          .then((res) => {
            this.$msgSucClose(this.$t('FinBill.sucCancelFee'))
            this.getData()
          })
          .finally(() => (this[btnLoading] = false))
      })
    },
    openFeeClosedModifyFeeDialog() {
      this.multipleSelection = this.multipleSelection1.concat(this.multipleSelection2)
      if (this.multipleSelection.length === 0) {
        this.$message({
          type: 'error',
          message: this.$t('FinBill.checkFee'),
          showClose: true,
        })
        return
      }
      let receiveUncloses = this.multipleSelection1.reduce((prev, cur, index) => {
        if (cur.precloseStatus === 'no' && cur.closeStatus === 'no') {
          if (prev !== '') {
            return prev + ',' + (index + 1)
          } else {
            return prev + (index + 1)
          }
        } else {
          return prev
        }
      }, '')
      let payUncloses = this.multipleSelection2.reduce((prev, cur, index) => {
        if (cur.precloseStatus === 'no' && cur.closeStatus === 'no') {
          if (prev !== '') {
            return prev + ',' + (index + 1)
          } else {
            return prev + (index + 1)
          }
        } else {
          return prev
        }
      }, '')
      if (receiveUncloses !== '' || payUncloses !== '') {
        receiveUncloses = receiveUncloses !== '' ? this.$t('FinBill.receiveUncloses',{receiveUncloses}) : ''
        payUncloses = payUncloses !== '' ? this.$t('FinBill.receiveUncloses',{payUncloses}) : ''
        let uncloses = receiveUncloses + ' ' + payUncloses
        this.$message({
          message: this.$t('FinBill.uncloses',{uncloses}),
          type: 'error',
          showClose: true,
          duration: 8000,
        })
        return
      }
      // this.modifyFeeVisible.show = true
      let modifyFeeProps = {
        multipleSelection: this.multipleSelection,
        dialogVisible: this.modifyFeeVisible,
        isFinBillFee: true,
        finBillNo: this.finBillNo,
        businessBroad: this.$route.query.businessBroad
      }
      let finLStorage = localStorage.getItem('finLStorage')
      finLStorage = finLStorage ? JSON.parse(finLStorage) : {}
      finLStorage.modifyFeeProps = modifyFeeProps
      localStorage.setItem('finLStorage', JSON.stringify(finLStorage))
      let routeUrl = this.$router.resolve({
        name: 'FeeClosedModifyFeeApply'
      })
      window.open(routeUrl.href, '_blank')
    },
    checkAuthRec() {
      return this.checkAuth(this.$route.name, 'btn-addReceive')
    },
    checkAuthPay() {
      return this.checkAuth(this.$route.name, 'btn-addPay')
    },
    handleEdit(type) {
      this.finBillEdit(false, type)
    },
    finBillEdit(isAddFee, type) {
      if (type === 'receive') {
        // this.backupOption1 = JSON.stringify(this.option1.data.filter((item) => !item._newEdit))
        // 新增费用，不需进行以下判断
        if (isAddFee === true) {
          this.isEditRecei = true
          this.option1.data.forEach((item) => {
            if (!this.checkAuthRec()) return
            // item.canEdit = !!this.editGuard([item], false)
            this.$set(item, 'canEdit', !!this.editGuard([item], false))
          })
          return
        }
        if (this.multipleSelection1.length || this.fbFeeVosRecei.find((item) => item.edit)) {
          this.option1.data.forEach((item) => {
            if (!this.checkAuthRec()) return
            let bool = this.editGuard([item], false)
            if (bool) {
              //  && item.$isRowCheck
              if (this.multipleSelection1.find((selectRow) => selectRow === item)) {
                this.isEditRecei = true
              }
              // item.canEdit = true
              this.$set(item, 'canEdit', true)
            } else {
              // item.canEdit = false
              this.$set(item, 'canEdit', false)
            }
          })
        } else {
          this.option1.data.forEach((item) => {
            if (!this.checkAuthRec()) return
            let bool = this.editGuard([item], false)
            if (bool) {
              this.isEditRecei = true
              // item.canEdit = true
              this.$set(item, 'canEdit', true)
              this.multipleSelection1.push(item)
            } else {
              // item.canEdit = false
              this.$set(item, 'canEdit', false)
              // this.debounceLs(() => {
              //   this.$msgErrClose('因已锁定，已确认，已结算，已开票，已关账等原因，部分费用无法修改')
              // }, 30)
            }
          })
        }
        if (isAddFee !== true && this.multipleSelection1.length === 0) {
          return this.$msgErrClose(this.$t('FinBill.noEditFee'))
        } else {
          let someCanEdit =
            this.multipleSelection1.some((item) => {
              if (item.canEdit) {
                // 有一个canEdit，就将option的edit置为true
              }
              return item.canEdit
            })
          if (!someCanEdit) return this.$msgErrClose(this.$t('FinBill.noEditFee'))
          this.option1.edit = true
          // this.option1.data.forEach((item) => (item.edit = false))
          // this.multipleSelection1.forEach((item) => (item.edit = item.canEdit))
          this.option1.data.forEach((item) => {
            this.$set(item, 'edit', false)
          })
          this.multipleSelection1.forEach((item) => {
            this.$set(item, 'edit', item.canEdit)
          })
        }
      } else if (type === 'pay') {
        // this.backupOption2 = JSON.stringify(this.option2.data.filter((item) => !item._newEdit))
        // 新增费用，不需进行以下判断
        if (isAddFee === true) {
          this.isEditPay = true
          this.option2.data.forEach((item) => {
            if (!this.checkAuthPay()) return
            // item.canEdit = !!this.editGuard([item], false)
            this.$set(item, 'canEdit', !!this.editGuard([item], false))
          })
          return
        }
        if (this.multipleSelection2.length || this.fbFeeVosPay.find((item) => item.edit)) {
          this.option2.data.forEach((item) => {
            if (!this.checkAuthPay()) return
            let bool = this.editGuard([item], false)
            if (bool) {
              //  && item.$isRowCheck
              if (this.multipleSelection2.find((selectRow) => selectRow === item)) {
                this.isEditPay = true
              }
              // item.canEdit = true
              this.$set(item, 'canEdit', true)
            } else {
              // item.canEdit = false
              this.$set(item, 'canEdit', false)
            }
          })
        } else {
          this.option2.data.forEach((item) => {
            if (!this.checkAuthPay()) return
            let bool = this.editGuard([item], false)
            if (bool) {
              this.isEditPay = true
              // item.canEdit = true
              this.$set(item, 'canEdit', true)
              this.multipleSelection2.push(item)
            } else {
              // item.canEdit = false
              this.$set(item, 'canEdit', false)
              // this.debounceLs(() => {
              //   this.$msgErrClose('因已锁定，已确认，已结算，已开票，已关账等原因，部分费用无法修改')
              // }, 30)
            }
          })
        }
        if (isAddFee !== true && this.multipleSelection2.length === 0) {
          return this.$msgErrClose(this.$t('FinBill.noEditFee'))
        } else {
          let someCanEdit =
          this.multipleSelection2.some((item) => {
              if (item.canEdit) {
                // 有一个canEdit，就将option的edit置为true
              }
              return item.canEdit
            })
          if (!someCanEdit) return this.$msgErrClose(this.$t('FinBill.noEditFee'))
          this.option2.edit = true
          // this.option2.data.forEach((item) => (item.edit = false))
          // this.multipleSelection2.forEach((item) => (item.edit = item.canEdit))
          this.option2.data.forEach((item) => {
            this.$set(item, 'edit', false)
          })
          this.multipleSelection2.forEach((item) => {
            this.$set(item, 'edit', item.canEdit)
          })
        }
      }
      // this.backupOption1 = JSON.stringify(this.option1.data.filter((item) => !item._newEdit))
      // this.backupOption2 = JSON.stringify(this.option2.data.filter((item) => !item._newEdit))
      // // 新增费用，不需进行以下判断
      // if (isAddFee === true) {
      //   this.isEdit = true
      //   this.option1.data.forEach((item) => {
      //     if (!this.checkAuthRec()) return
      //     item.canEdit = !!this.editGuard([item], false)
      //   })
      //   this.option2.data.forEach((item) => {
      //     if (!this.checkAuthPay()) return
      //     item.canEdit = !!this.editGuard([item], false)
      //   })
      //   return
      // }
      // if (this.multipleSelection1.length || this.multipleSelection2.length || this.fbFeeVos.find((item) => item.edit)) {
      //   this.option1.data.forEach((item) => {
      //     if (!this.checkAuthRec()) return
      //     let bool = this.editGuard([item], false)
      //     if (bool) {
      //       //  && item.$isRowCheck
      //       if (this.multipleSelection1.find((selectRow) => selectRow === item)) {
      //         this.isEdit = true
      //       }
      //       item.canEdit = true
      //     } else {
      //       item.canEdit = false
      //     }
      //   })
      //   this.option2.data.forEach((item) => {
      //     if (!this.checkAuthPay()) return
      //     let bool = this.editGuard([item], false)
      //     if (bool) {
      //       //  && item.$isRowCheck
      //       if (this.multipleSelection2.find((selectRow) => selectRow === item)) {
      //         this.isEdit = true
      //       }
      //       item.canEdit = true
      //     } else {
      //       item.canEdit = false
      //     }
      //   })
      // } else {
      //   this.option1.data.forEach((item) => {
      //     if (!this.checkAuthRec()) return
      //     let bool = this.editGuard([item], false)
      //     if (bool) {
      //       this.isEdit = true
      //       item.canEdit = true
      //       this.multipleSelection1.push(item)
      //     } else {
      //       item.canEdit = false
      //       // this.debounceLs(() => {
      //       //   this.$msgErrClose('因已锁定，已确认，已结算，已开票，已关账等原因，部分费用无法修改')
      //       // }, 30)
      //     }
      //   })
      //   this.option2.data.forEach((item) => {
      //     if (!this.checkAuthPay()) return
      //     let bool = this.editGuard([item], false)
      //     if (bool) {
      //       this.isEdit = true
      //       item.canEdit = true
      //       this.multipleSelection2.push(item)
      //     } else {
      //       item.canEdit = false
      //       // this.debounceLs(() => {
      //       //   this.$msgErrClose('因已锁定，已确认，已结算，已开票，已关账等原因，部分费用无法修改')
      //       // }, 30)
      //     }
      //   })
      // }
      // if (isAddFee !== true && this.multipleSelection1.length === 0 && this.multipleSelection2.length === 0) {
      //   return this.$msgErrClose('没有可编辑的费用')
      // } else {
      //   let someCanEdit =
      //     this.multipleSelection1.some((item) => {
      //       if (item.canEdit) {
      //         // 有一个canEdit，就将option的edit置为true
      //       }
      //       return item.canEdit
      //     }) ||
      //     this.multipleSelection2.some((item) => {
      //       if (item.canEdit) {
      //         // 有一个canEdit，就将option的edit置为true
      //       }
      //       return item.canEdit
      //     })
      //   if (!someCanEdit) return this.$msgErrClose('没有可编辑的费用')
      //   this.option1.edit = true
      //   this.option2.edit = true
      //   this.option1.data.forEach((item) => (item.edit = false))
      //   this.multipleSelection1.forEach((item) => (item.edit = item.canEdit))
      //   this.option2.data.forEach((item) => (item.edit = false))
      //   this.multipleSelection2.forEach((item) => (item.edit = item.canEdit))
      // }
    },
    // cancel(noRefresh) {
    //   this.isEdit = false
    //   this.option1.edit = false
    //   this.option2.edit = false
    //   if (noRefresh) {
    //     // 用于取消
    //     this.option1.data = JSON.parse(this.backupOption1)
    //     this.option2.data = JSON.parse(this.backupOption2)
    //     this.deleteSelection = []
    //   } else {
    //     this.getData()
    //   }
    // },
    handleCancel(type) {
      if (type === 'receive') {
        this.option1.data = JSON.parse(JSON.stringify(this.table1DataBackup)) // JSON.parse(this.backupOption1)
        this.multipleSelection1 = []
        // this.isAddReceive = false
        this.option1.edit = false
        this.isEditRecei = false
        this.$set(this.option1, 'showIsError', false)
      }
      if (type === 'pay') {
        this.option2.data = JSON.parse(JSON.stringify(this.table2DataBackup)) // JSON.parse(this.backupOption2)
        this.multipleSelection2 = []
        // this.isAddPay = false
        this.option2.edit = false
        this.isEditPay = false
        this.$set(this.option2, 'showIsError', false)
      }
    },
    // table复选框
    sendMulti(data, option) {
      this['multipleSelection' + option.id.slice(-1)] = data
      // 当处于总的编辑状态下
      if ((option.id === 'option1' && this.isEditRecei) || (option.id === 'option2' && this.isEditPay)) { // this.isEdit
        // 改成按点击来判断，弃用按勾选来判断
        option.data.forEach((item) => {
          // if (!this.checkAuthRec() && option === this.option1) return
          // if (!this.checkAuthPay() && option === this.option2) return
          if (item.edit && item.$isRowClick && !item.isAddFee) { // && !item._newEdit
            // 如果费用处于编辑状态，点击后退出编辑，使费用重置回原来的数据
            let tableDataBackup = option.id === 'option1' ? this.table1DataBackup : this.table2DataBackup // JSON.parse(this.backupOption1) : JSON.parse(this.backupOption2)
            let rowBackup = tableDataBackup.find((row) => {
              return row.feeId === item.feeId
            })
            if (rowBackup) {
              item = Object.assign(item, rowBackup)
            }
            this.$set(item, 'edit', false)
          } else if (item.canEdit && item.$isRowClick && !item.$isRowDelete) {
            // 如果点击的费用是可编辑的且没有正在删除，使其处于可编辑状态
            this.$set(item, 'edit', true)
            this.$set(option, 'edit', true) // 将option的edit置为可编辑，因如果编辑option1，option2没编辑，此时点击option2的费用不起作用
          } else if (item.$isRowClick && item.$isRowDelete) {
            // 点击删除中的费用，去除删除状态
            this.$set(item, '$isRowDelete', false)
          }
          // // 重置行的点击状态
          // item.$isRowClick = false
        })
      }
      this.computeMoneyTotalFront()
    },
    // 返回 关闭详情页 val 是否刷新坏账列表
    back(refresh) {
      this.routerBack(refresh === true)
    },
    handleCollapse(type) {
      this[`showTable${type}`] = !this[`showTable${type}`]
    },
    handleSavePre(type) {
      let isBoth = false
      if ((type === 'receive' && this.isEditPay) || (type === 'pay' && this.isEditRecei)) {
        this.$confirm(this.$t('FinBill.isEditPay'), this.$t('Common.tips'), {
          confirmButtonText: this.$t('Common.yes'),
          cancelButtonText: this.$t('Common.no'),
          type: 'warning'
        }).then(() => {
          isBoth = true
          this.saveFinBill(type, isBoth)
        }).catch(() => {  
          this.saveFinBill(type, isBoth)
        })
      } else {
        if (type === 'both') {
          isBoth = true
        }
        this.saveFinBill(type, isBoth)
      }
    },
    // 保存新增费用单
    // "operation"："update/delete"
    // 费用列表  新增和编辑都传update
    // 删除调接口，传delete
    // 保存新增费用单
    saveFinBill(type, isBoth) { // saveFinBill(operation, $index, option)
      let fbFeeVos = []
      if (isBoth) {
        this.$set(this.option1, 'showIsError', true)
        this.$set(this.option2, 'showIsError', true)
        fbFeeVos = this.fbFeeVosRecei.concat(this.fbFeeVosPay)
        if (
          fbFeeVos.length &&
          !this.validate(fbFeeVos, ['feeName','feeEnName', 'feeCode', 'settleCorpName', 'settleCorpCode', 'unitPrice', 'unitCount'])
        ) {
          return
        }
      } else if (type === 'receive') {
        this.$set(this.option1, 'showIsError', true)
        fbFeeVos = this.fbFeeVosRecei
        if (
          fbFeeVos.length &&
          !this.validate(fbFeeVos, ['feeName', 'feeEnName', 'feeCode', 'settleCorpName', 'settleCorpCode', 'unitPrice', 'unitCount'])
        ) {
          return
        }
      } else if (type === 'pay') {
        this.$set(this.option2, 'showIsError', true)
        fbFeeVos = this.fbFeeVosPay
        if (
          fbFeeVos.length &&
          !this.validate(fbFeeVos, ['feeName', 'feeEnName', 'feeCode', 'settleCorpName', 'settleCorpCode', 'unitPrice', 'unitCount'])
        ) {
          return
        }
      }
      // if (
      //   this.fbFeeVos.length &&
      //   !this.validate(this.fbFeeVos, ['feeName', 'feeCode', 'settleCorpName', 'settleCorpCode', 'unitPrice', 'unitCount'])
      // ) {
      //   return
      // }
      try {
        fbFeeVos.forEach(item => {
          if (item.unitPrice < 0 && item.edit) { // item.operation !== 'delete'
            if (item.receipayType === 'receive') {
              if (!item.negativeType && !['TZFY'].includes(item.feeCode)) {
                this.$message({
                  message: this.$t('FinBill.receipayType'),
                  type: 'error',
                  duration: 5000,
                  showClose: true,
                  offset: 162
                })
                this.$set(item, 'negativeType_required', true) // 用于显示负数类型必填
                throw new Error('ending')
              }
              if (item.negativeType === 'order_split' && !item.splitFromOrderNo) {
                this.$message({
                  message: this.$t('FinBill.splitFromOrderNo'),
                  type: 'error',
                  duration: 5000,
                  showClose: true,
                  offset: 162
                })
                this.$set(item, 'splitFromOrderNo_required', true) // 用于显示拆单原单号必填
                throw new Error('ending')
              }
            } else if (item.receipayType === 'pay' && (!item.negativeType || !item.negativeFollowerId) && !['TZFY'].includes(item.feeCode)) {
              this.$message({
                message: this.$t('FinBill.negativeType'),
                type: 'error',
                duration: 5000,
                showClose: true,
                offset: 162
              })
              this.$set(item, 'negativeType_required', true) // 用于显示负数类型必填
              this.$set(item, 'negativeFollowerId_required', true) // 用于显示负数跟进人必填
              throw new Error('ending')
            }
          } else if (item.unitPrice >= 0 && item.edit) { // item.operation !== 'delete'
            if (item.receipayType === 'receive') {
              if (item.negativeType || item.negativeFollowerId) {
                this.$message({
                  message: this.$t('FinBill.negativeFollowerId'),
                  type: 'error',
                  showClose: true,
                  offset: 162
                })
                throw new Error('ending')
              }
            } else if (item.receipayType === 'pay') {
              if (item.negativeType || item.negativeFollowerId) {
                this.$message({
                  message: this.$t('FinBill.ending'),
                  type: 'error',
                  showClose: true,
                  offset: 162
                })
                throw new Error('ending')
              }
            }
          }
        })
      } catch (e) {
        if (e.message === 'ending') {
          console.log(e.message)
          return
        }
      }
      fbFeeVos = fbFeeVos // let fbFeeVos = this.fbFeeVos
        .filter((item) => item.edit || item.$isRowDelete)
        .map((item) => {
          let obj = { ...item, operation: 'update' }
          if (item.$isRowDelete) {
            obj.operation = 'delete'
          }
          delete obj.edit
          delete obj.feeEnName
          delete obj.feeName
          return obj
        })
      // let arr = fbFeeVos.filter((item) => item.receipayType == 'pay' && !item.taxRate && item.taxRate !== 0)
      // if (arr.length) {
      //   return this.$message({ message:  this.$t('FinBill.payableTax'), type: 'error', showClose: true })
      // }
      console.log(fbFeeVos)
      // fbFeeVos = fbFeeVos.concat(this.deleteArr)
      if (!fbFeeVos.length) {
        // return this.$message.error('费用单费用不能为空!') // 20220913 在没有总关账的费用的情况下，允许修改部门、员工
      }
      let needCancel = false
      if(this.formData.billType === 'pricing_loss_berth_fee' && fbFeeVos.find(item => item.receipayType === 'pay' && item.feeCode === 'KCF1' && item.isAddFee) && !fbFeeVos.find(item => item.receipayType === 'pay' && item.feeCode === 'TZFY' && item.isAddFee)){
        needCancel = true
      }
      this.$confirm(!needCancel ? this.$t('FinBill.billConfirm') : this.$t('FinBill.shortageFee'), this.$t('Common.tips'), {
        confirmButtonText: !needCancel ? this.$t('Common.sure') :  this.$t('FinBill.ignoreTips'),
        cancelButtonText: !needCancel ? this.$t('Common.cancel') : this.$t('FinBill.adjustmentTips'),
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          let departCode = this.formData.departCode || []
          if (departCode instanceof Array) {
            departCode = departCode[departCode.length - 1] || this.compCode
          } else {
            departCode = departCode || this.compCode
          }
          let departName = this.seekDepartName(this.departmentList, departCode)
          // 海外版税率默认传0
          fbFeeVos.forEach(item => item.taxRate = 0)
          
          saveFinBill({ ...this.formData, fees: fbFeeVos, finBillId: this.finBillId, departCode, departName })
            .then((res) => {
              this.$message({ message: this.$t('FinBill.saveSuc'), type: 'success' })
              // this.cancel()
              if (type === 'receive' || isBoth) {
                this.option1.edit = false
                this.isEditRecei = false
                this.$set(this.option1, 'showIsError', false)
              }
              if (type === 'pay' || isBoth) {
                this.option2.edit = false
                this.isEditPay = false
                this.$set(this.option2, 'showIsError', false)
              }
              if (fbFeeVos.length) {
                this.getData({ dataType: isBoth ? 'both' : type })
              } else {
                this.getInfo(true)
              }
            })
            .finally(() => setTimeout(() => (this.loading = false), 1000))
         })
        .catch((err) => {
          console.log(err)
        })
    },
    handleKeyup(evt, option) {
      if (evt.key === 'Enter') {
        this.addRow(option.id)
      }
    },
    addPay(feeItem) {
      this.addRow('option2', feeItem)
    },
    addReceive(feeItem) {
      this.addRow('option1', feeItem)
    },
    // // 删除添加的行
    // handleDelete($index, row, option) {
    //   let bool = this.editGuard([row], true)
    //   if (!bool) return

    //   // this.$confirm('确认删除此项吗？', this.$t('Common.tips'), {
    //   //   confirmButtonText: this.$t('Common.sure'),
    //   //   cancelButtonText: this.$t('Common.cancel'),
    //   //   type: 'warning',
    //   // })
    //   //   .then(() => {
    //   if (!this.isEdit) {
    //     this.backupOption1 = JSON.stringify(this.option1.data.filter((item) => !item._newEdit))
    //     this.backupOption2 = JSON.stringify(this.option2.data.filter((item) => !item._newEdit))
    //     this.isEdit = true
    //   }
    //   if (row._newEdit) {
    //     option.data.splice($index, 1)
    //   } else {
    //     row.operation = 'delete'
    //     this.$set(row, 'canEdit', true)
    //     this.$set(row, 'edit', false)
    //     this.$set(row, '$isRowDelete', true)
    //   }
    //   this.getFeesCanEdit()
    //   // option.data.splice($index, 1)
    //   // console.log(row)
    //   // if (!row._edit) {
    //   //   row.operation = 'delete'
    //   //   this.deleteArr.push(row)
    //   //   // this.saveFinBill(true, $index, option)
    //   // }
    //   // })
    //   // .catch(() => {})
    // },
    
    // // 编辑备注
    // handleEdit(row, option) {
    //   this.editDialogShow = true
    //   this.rowFeeData = row
    //   this.rowFeeRemark = row.remark
    // },
    // saveFeeRemark() {
    //   if (this.rowFeeData._newEdit) {
    //     this.rowFeeData.remark = this.rowFeeRemark
    //     this.editDialogShow = false
    //   } else {
    //     updateFinBillFeeRemark({ finBillFeeId: this.rowFeeData.finBillFeeId, remark: this.rowFeeRemark }).then((res) => {
    //       this.rowFeeData.remark = this.rowFeeRemark
    //       this.editDialogShow = false
    //     })
    //   }
    // },
    // 获取各个费用的可编辑状态，用于点击这些费用时是否进入编辑
    // getFeesCanEdit(showMessage = false) {
    //   this.option1.data.forEach((item) => {
    //     let bool = this.editGuard([item], showMessage)
    //     if (bool) {
    //       item.canEdit = true
    //     } else {
    //       item.canEdit = false
    //     }
    //   })
    //   this.option2.data.forEach((item) => {
    //     let bool = this.editGuard([item], showMessage)
    //     if (bool) {
    //       item.canEdit = true
    //     } else {
    //       item.canEdit = false
    //     }
    //   })
    // },
    // getFeesCanEdit(data, showMessage = false, noOneCanEditNoMsg) { // noOneCanEditNoMsg-没有可修改的费用是否提示
    //   data.forEach(item => {
    //     let bool = this.editGuard([item], false)
    //     if (bool) {
    //       item.canEdit = true
    //     } else {
    //       item.canEdit = false
    //     }
    //   })
    //   if (!noOneCanEditNoMsg) {
    //     let someCanEdit = data.some(item => {
    //       return item.canEdit || item.isAddFee // 复制的费用不受限
    //     })
    //     let someSpecOrMng = data.some(item => {
    //       return item.viewGroupType && item.viewGroupType === 'special' // item.viewGroupType !== 'biz'
    //     })
    //     let someSpecOrMngMsg = someSpecOrMng ? '（专项类费用请通过专项管理费页面进行修改）' : '' // 改成不显示，否则比较干扰，基本每个单子都有专项类费用
    //     if (!someCanEdit) {
    //       if (data.length) {
    //         let message = data.map(item => {
    //           return item.editGuardMsg
    //         }).join('<br/>')
    //         this.$message({
    //           message,
    //           type: 'error',
    //           showClose: true,
    //           duration: 5000,
    //           dangerouslyUseHTMLString: true
    //         })
    //       } else {
    //         this.$message({
    //           message: `因已进入结算或已确认或已关账，没有可修改的费用${someSpecOrMngMsg}`,
    //           type: 'error',
    //           showClose: true,
    //           duration: 5000
    //         })
    //       }
    //       return false
    //     } else {
    //       return true
    //     }
    //   }
    // },
    // 生成结算单
    generate() {
      if (this.isEditPay || this.isEditRecei) {
        return this.$message.error(this.$t('FinBill.isEditRecei'))
      }
      let feeIds = [...this.multipleSelection1, ...this.multipleSelection2]
      if (!feeIds.length) {
        return this.$message.error(this.$t('FinBill.feeIds'))
      }
      this.routerPush('CreateSettlement', {
        source: 'createSettlementFromFinBill',
        billId: this.finBillId,
        billNo: this.finBillNo,
        feeIds: JSON.stringify(feeIds.map((item) => item.feeId)),
      })
    },
    // 自定义表头
    customColumnsPopClose(action, value) {
      let scenesCode = 'finbill_rec_fee',
        dealType = 'rec'
      if (!this.customColumnsPopShow1) {
        scenesCode = 'finbill_pay_fee'
        dealType = 'pay'
      }
      this.customColumnsPopShow1 = this.customColumnsPopShow2 = false
      if (action === 'Confirm') {
        let columnList = this.getColumnsValues(value) // getColumnsValues在本页面无作用
        listColumnConfigSave({ columnList, scenesCode }).then((res) => {
          this.dealCustomColumn(res, dealType)
        })
      }
    },
    dealCustomColumn(res, type) {
      let index = type === 'rec' ? '1' : '2'
      let list = [...this.defaultColumns]
      if (res.data?.columnList?.length) {
        list = res.data.columnList
        // this.columns = configColumns1.length > 0 ? configColumns1 : this.defaultColumns

        // let serviceCodeIndex = this.columns.findIndex(item => item === 'serviceCode')
        // if (serviceCodeIndex > -1) {
        //   this.columns.splice(serviceCodeIndex, 1, 'serviceName')
        // }
        // this.columns = [...new Set(this.columns)]
      }
      // this['configColumns' + index] = list
      let filterArr = list.filter(v => !this.columnsBaseLocal.find(item =>  item.prop === v))
      if (type === 'pay') {
        filterArr.concat(['serviceCode', 'serviceName'])
        this.configColumns2 = list.filter(v => !filterArr.includes(v))
        this.selfColumnsBase2 = []
        this.defaultColumns.forEach((value) => {
          let obj = this.columnsBaseLocal.find((item) => item.prop === value)
          if (obj) {
            if (obj.prop === 'settleCorpName') {
              obj = Object.assign({}, obj, {
                width: 160,
                querySearch: (queryString, cb, row) => {
                  if (!queryString) return // 为空时不查询
                  this.querySettleUnit({ queryString, isAdd: true, isForbid: true, receipayType: row.receipayType }, cb)
                },
                select: (optionItem, row) => {
                  this.selectedOptionItem = optionItem
                  row[obj.prop] = optionItem.value
                  row[obj.prop.replace('Name', 'Code')] = optionItem.key
                },
              })
            } else if (obj.prop === 'feeAmt') {
              // 将业务费用的金额设置不可输入
              obj = Object.assign({}, obj, {
                type: 'text',
              })
            } else if (obj.prop === 'taxRate') {
              obj = Object.assign({}, obj, {
                type: 'select',
                selectOptions: this.dictMap.taxRateInfo.map((v) => ({ ...v, value: +v.value })),
                required: true
              })
            } else if (
              obj.prop === 'receipayType' ||
              obj.prop === 'settleStatus' ||
              obj.prop === 'feeUnit' ||
              obj.prop === 'invoiceStatus' ||
              obj.prop === 'writeoffStatus' ||
              obj.prop === 'settleCycle'
            ) {
              obj = Object.assign({}, obj, {
                readOnly: true,
              })
            } else if (obj.prop === 'feeName' || obj.prop === 'feeEnName') {
              obj = Object.assign({}, obj, {
                querySearch: (queryString, cb, row) => {
                  this.selectedOptionItem = ''
                  // if (!queryString) return // 为空时不查询
                  this.feeNameQuery(queryString, cb)
                  // this.queryFeeItemList({ businessType: '', serviceCode: '', queryString, operation: 'add' }, cb)
                },
                select: (optionItem, row, item) => {
                  setTimeout(() => {
                    row.feeName = optionItem.value
                    row.feeCode = optionItem.key
                    row.feeEnName = optionItem.feeEnName
                    row.currency = optionItem.currency
                    row.feeUnit = (optionItem.feeUnit || '').toLowerCase()
                    if (row.feeCode === 'TZFY' && row.unitPrice > 0) {
                      row.feeAmt = row.unitPrice = ''
                    } 
                  }, 300)
                },
              })
              console.log(obj)
            } else if (obj.prop === 'unitPrice') {
              obj = {
                label: this.$t('FeeList.unitPrice'),
                prop: 'unitPrice',
                type: 'input',
                negative: (row) => row.feeCode === 'TZFY',
                errMsg: this.$t('FinBill.unitPriceTips'),
                validateInput: (val, row, item, change) => {
                  this.validateInput.call(this, val, row, item, change)
                  this.$nextTick(() => {
                    if (row.unitCount) {
                      this.$set(row, 'feeAmt', new LSnum(row.unitCount).times(row.unitPrice).toNum(2))
                      // row.feeAmt = new LSnum(row.unitCount).times(row.unitPrice).toNum(2)
                      // this.$forceUpdate()
                    }
                  })
                },
              }
            } else if (obj.prop === 'unitCount') {
              obj = {
                label: this.$t('FeeList.quantity'),
                prop: 'unitCount',
                type: 'input',
                validateInput: (val, row, item, change) => {
                  this.validateInput.call(this, val, row, item, change)
                  this.$nextTick(() => {
                    if (row.unitPrice) {
                      this.$set(row, 'feeAmt', new LSnum(row.unitCount).times(row.unitPrice).toNum(2))
                      // row.feeAmt = new LSnum(row.unitCount).times(row.unitPrice).toNum(2)
                      // this.$forceUpdate()
                    }
                  })
                },
              }
            } else if (obj.prop === 'srcWriteoffReceipayNo') {
              obj = {
                ...obj,
                prop: 'srcWriteoffReceipayNo',
                type: 'button',
                callback: (row) => {
                  this.showOneNoDetail('writeoffNos', row.srcWriteoffReceipayNo)
                },
              }
            }
            if (obj.prop !== 'serviceCode' && obj.prop !== 'serviceName') {
              let requiredList = [ 'feeName', 'feeEnName','settleCorpName', 'feeUnit', 'unitPrice', 'unitCount', 'currency' ]
              if (requiredList.includes(obj.prop)) {
                obj = Object.assign({}, obj, { required: true })
              }
              this.selfColumnsBase2.push(obj)
            }
          }
        })
      } else {
        filterArr.concat(['serviceCode', 'serviceName', 'payApplySettleNos', 'payOrderNos'])
        this.configColumns1 = list.filter(v => !filterArr.includes(v))
        this.selfColumnsBase1 = []
        this.defaultColumns.forEach((value) => {
          let obj = this.columnsBaseLocal.find((item) => item.prop === value)
          if (obj) {
            if (obj.prop === 'settleCorpName') {
              obj = Object.assign({}, obj, {
                width: 160,
                querySearch: (queryString, cb, row) => {
                  if (!queryString) return // 为空时不查询
                  this.querySettleUnit({ queryString, isAdd: true, isForbid: true, receipayType: row.receipayType }, cb)
                },
                select: (optionItem, row) => {
                  this.selectedOptionItem = optionItem
                  row[obj.prop] = optionItem.value
                  row[obj.prop.replace('Name', 'Code')] = optionItem.key
                },
              })
            } else if (obj.prop === 'feeAmt') {
              // 将业务费用的金额设置不可输入
              obj = Object.assign({}, obj, {
                type: 'text',
              })
            } else if (
              obj.prop === 'receipayType' ||
              obj.prop === 'settleStatus' ||
              obj.prop === 'invoiceStatus' ||
              obj.prop === 'writeoffStatus' ||
              obj.prop === 'settleCycle'
            ) {
              obj = Object.assign({}, obj, {
                readOnly: true,
              })
            } else if (obj.prop === 'feeName' || obj.prop === 'feeEnName') {
              obj = Object.assign({}, obj, {
                querySearch: (queryString, cb, row) => {
                  this.selectedOptionItem = ''
                  // if (!queryString) return // 为空时不查询
                  this.feeNameQuery(queryString, cb)
                  // this.queryFeeItemList({ businessType: '', serviceCode: '', queryString, operation: 'add' }, cb)
                },
                select: (optionItem, row, item) => {
                  setTimeout(() => {
                    //row.feeCode = "NBWL_XMDZG"内部往来厦门 "NBWL_SZDZG"内部往来深圳
                    row.feeName = optionItem.value
                    row.feeCode = optionItem.key
                    row.feeEnName = optionItem.feeEnName
                    row.currency = optionItem.currency
                    row.feeUnit = (optionItem.feeUnit || '').toLowerCase()
                    if (row.feeCode === 'TZFY' && row.unitPrice > 0) {
                      row.feeAmt = row.unitPrice = ''
                    } 
                    // 应收表格此项修改return为false
                    // if (!item.notAllowed) return
                    // row.taxRate = optionItem.znTaxRate
                    // if(row.feeCode == 'NBWLXMDZG' || row.feeCode == 'NBWLSZDZG'){
                    // this.$set(row, '_forceEdit', true)
                    // }else{
                    // this.$set(row, '_forceEdit', false)
                    // }
                  }, 300)
                },
              })
            } else if (obj.prop === 'unitPrice') {
              obj = {
                label: this.$t('FeeList.unitPrice'),
                prop: 'unitPrice',
                type: 'input',
                negative: (row) => row.feeCode === 'TZFY',
                errMsg: this.$t('FinBill.unitPriceTips') ,
                validateInput: (val, row, item, change) => {
                  this.validateInput.call(this, val, row, item, change)
                  this.$nextTick(() => {
                    if (row.unitCount) {
                      this.$set(row, 'feeAmt', new LSnum(row.unitCount).times(row.unitPrice).toNum(2))
                      // row.feeAmt = new LSnum(row.unitCount).times(row.unitPrice).toNum(2)
                      // this.$forceUpdate()
                    }
                  })
                },
              }
            } else if (obj.prop === 'taxRate') {
              obj = Object.assign({}, obj, {
                type: 'select',
                readOnly: true,
                _forceEdit: true,
                selectOptions: this.dictMap.taxRateInfo.map((v) => ({ ...v, value: +v.value })),
              })
            } else if (obj.prop === 'unitCount') {
              obj = {
                label: this.$t('FeeList.quantity'),
                prop: 'unitCount',
                type: 'input',
                validateInput: (val, row, item, change) => {
                  this.validateInput.call(this, val, row, item, change)
                  this.$nextTick(() => {
                    if (row.unitPrice) {
                      this.$set(row, 'feeAmt', new LSnum(row.unitCount).times(row.unitPrice).toNum(2))
                      // row.feeAmt = new LSnum(row.unitCount).times(row.unitPrice).toNum(2)
                      // this.$forceUpdate()
                    }
                  })
                },
              }
            } else if (obj.prop === 'srcWriteoffReceipayNo') {
              obj = {
                ...obj,
                prop: 'srcWriteoffReceipayNo',
                type: 'button',
                callback: (row) => {
                  this.showOneNoDetail('writeoffNos', row.srcWriteoffReceipayNo)
                },
              }
            }
            // console.log(obj.prop);
            if (
              obj.prop !== 'serviceCode' &&
              obj.prop !== 'serviceName' &&
              obj.prop !== 'payApplySettleNos' &&
              obj.prop !== 'payOrderNos'
            ) {
              let requiredList = [ 'feeName','feeEnName','settleCorpName', 'feeUnit', 'unitPrice', 'unitCount', 'currency' ]
              if (requiredList.includes(obj.prop)) {
                obj = Object.assign({}, obj, { required: true })
              }
              this.selfColumnsBase1.push(obj)
            }
          }
        })
      }
      this['option' + index].columns = list
        .map((prop) => this['selfColumnsBase' + index].find((item) => item.prop === prop))
        .filter((v) => v)
    },
    // 分页页面数量change   有分页必写此方法
    handleSizeChange(val) {
      if(this.option2.pagination){
        this.option2.pagination.pageSize = val
        this.getData()
      }
    },
    // 分页改变当前页   有分页必写此方法
    handleCurrentChange(val) {
      if(this.option2.pagination){
        this.option2.pagination.currPage = val
        this.getData()
      }
    },
  },
  watch: {
    compCode(){
      this.init()
    },
    editNegFolVisible(newVal) {
      if (newVal) {
        this.negFolForm.negativeFollowerId = ''
        this.negFolForm.negativeFollowerName = ''
      }
    }
  }
}
</script>
<style scoped lang="scss">
.finance-finbill-detail .finance-table-summary {
  border-top: 1px solid #e9e9e9;
  border-bottom: none;
}
.finance-detail-page {
  background: #fff;
}
.money-box-border-bottom {
  border-bottom: 1px solid #e9e9e9;
}
.el-form-item.long-form-item {
  width: 500px;
  ::v-deep input {
    width: 400px;
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
  margin: 4px 16px 18px;
}
.finance-table-container + .finance-table-container {
  margin-top: 22px;
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
::v-deep .el-table .cell {
  padding-left: 4px;
  padding-right: 4px;
}
.settlement-detail-form {
  /deep/ .el-form-item {
    width: 25%;
    margin-right: 0;
    .el-form-item__content{
      width: calc(100% - 120px) !important;
      .el-select,.el-cascader{
        width: 80%;
        .el-input{
          width: 100%;
        }
      }
    }
  }
  /deep/ .detail__div{
    width: 25% !important;
    margin-right: 0;
    &.detail__div__full{
      width: 100% !important;
    }
  }
}
.fin-edit-bl .el-select {
  width: 400px;
}
</style>