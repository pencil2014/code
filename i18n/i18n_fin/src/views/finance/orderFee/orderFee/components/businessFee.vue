<template>
  <div class="one-kind-fee"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground">
    <div class="finance-table-summary">
      <div class="finance-summary-text">
        <div>
          <div style="display:inline-block;margin-right:10px;">
            <span style="margin-right:4px;"><span>{{$t('OrderFee.orderGrossProfit')}}：CNY：</span><span style="margin-right:0px;">{{orderProfit.totalCnyProfit}}</span><span>({{$t('OrderFee.convertInto')}} USD：</span><span>{{orderProfit.totalUsdProfit}})</span></span>
            <span>{{$t('OrderFee.grossMargin')}}：{{getProfitRate}}%</span>
          </div>
          <el-popover
            placement="bottom-start"
            trigger="hover">
            <div class="money-dialog money-dialog-profit">
              <div style="display:inline-block;margin-right:26px;font-weight:600;color:#222;line-height:20px;">
                <span style="margin-right:8px;"><span>{{$t('OrderFee.orderGrossProfit')}}：CNY：</span><span style="margin-right:4px;">{{orderProfit.totalCnyProfit}}</span><span>({{$t('OrderFee.convertInto')}} USD：</span><span>{{orderProfit.totalUsdProfit}})</span></span>
                <span>{{$t('OrderFee.grossMargin')}}：{{getProfitRate}}%</span>
              </div>
              <div class="finance-table">
                <div style="padding:8px;background:#fff;">
                  <el-table
                    fit
                    style="width:100%"
                    :data="option4.data"
                  >
                    <el-table-column
                      v-for="(item, index) in option4.columns"
                      :key="item.prop + index"
                      :label="item.label"
                      align="center"
                      header-align="center"
                      :width="item.width || 80"
                      :prop="item.prop"
                      :formatter="(row,col,val)=> item.formatter ? item.formatter(row, col) : val"
                    >
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </div>
            <el-button type="text" slot="reference" style="font-size: 12px;">{{$t('OrderFee.detail')}}</el-button>
          </el-popover>
          <div v-if="mode==='byFee'&&$route.name!=='BookDetail'" style="display:inline-block;margin-left:40px;">
            <span>{{$t('OrderFee.feeIsMatched')}}：</span>
            <span @click="showFeeCompleted()" style="cursor:pointer;" :class="{'money-pay-color':isMatched==='yes'?true:false,'money-recei-color':isMatched==='no'?true:false}">{{isMatched==='yes'?$t('OrderFee.yes'):$t('OrderFee.no')}}</span>
            <!-- <el-button @click="showFeeCompleted()" size="mini" type="text" style="margin-left:8px;">查看</el-button> -->
          </div>
        </div>
        <div>
          <div class="money-box-left">
            <el-tooltip :content="$t('OrderFee.OriginalDiffTip')" placement="top">
              <div style="line-height:20px;">{{$t('OrderFee.OriginalDiff')}}：</div>
            </el-tooltip>
            <div class="money-total" v-for="(item, index) in originalFeeDiff" :key="'originalFeeDiff' + index">
              {{item.currency}}<span :class="{'money-pay-color': false}">{{item.diffAmt}}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 整柜订舱BookDetail不显示操作按钮 -->
      <div v-if="$route.name!=='BookDetail'" class="finance-btn-container">
        <el-button-group v-if="isImport">
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-syncFeesFromExportOrder')" class="finance-btn" size="mini" @click="syncFeesFromExportOrder" type="primary">{{$t('OrderFee.IntroducingExportFee')}}</el-button>
        </el-button-group>
        <el-button-group>
          <el-button v-if="checkAuth('PreClose', 'tab-preClose1', 'btn-apply')" class="finance-btn" size="mini" @click="multiApply" type="success" :disabled="losscloseDisable">{{$t('OrderFee.losscloseBtn')}}</el-button>
          <!-- &&(orderProfit.totalCnyProfit<0&&orderProfit.totalCnyProfit<0&&originalFeeDiff.some(item=>item.diffAmt!==0)) -->
        </el-button-group>
        <el-button-group>
          <el-button v-if="(checkAuth(pageCode, 'tab-businessFee', 'btn-precloseByBill') || $route.name === 'SiDetail')&&!isFinCloseCombined" class="finance-btn" @click="precloseByBill" size="mini" :disabled="precloseDisable" type="primary">{{$t('OrderFee.preclose')}}</el-button>
        </el-button-group>
        <el-button-group>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-generateBill')" class="finance-btn" size="mini" type="primary" @click="generateBillPre">{{$t('OrderFee.generateBill')}}</el-button>
        </el-button-group>
        <el-button-group>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-createSettlement')" class="finance-btn" size="mini" type="primary" @click="createSettlement">{{$t('OrderFee.createSettlement')}}</el-button>
        </el-button-group>
        <el-button-group>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-feeClosedModifyFee') && isFinCloseCombined && mode==='byFee'" class="finance-btn" size="mini" type="primary" @click="openModifyFeeDialog">{{$t('OrderFee.feeClosedModifyFee')}}</el-button>
        </el-button-group>
        <el-button-group>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-modifySettleUnit') && mode==='byFee'" class="finance-btn" @click="modifySettleUnit" size="mini">{{$t('OrderFee.modifySettleUnit')}}</el-button>
        </el-button-group>
        <el-button-group>
          <div v-if="(checkAuth(pageCode, 'tab-businessFee', 'btn-selectTemplate') || checkAuth(pageCode, 'tab-businessFee', 'btn-openSaveTemplate')) && mode==='byFee'" class="select-template-box" style="margin-left:8px;">
            <el-dropdown trigger="click" @command="handleCommandTemp">
              <span class="el-dropdown-link">
                {{$t('OrderFee.importTemplate')}}<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-selectTemplate')" :command="'import'">
                  {{$t('OrderFee.importTemplate')}}
                </el-dropdown-item>
                <el-dropdown-item v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-openSaveTemplate')" :command="'save'">
                  {{$t('OrderFee.saveTemplate')}}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-button-group>
        <!-- 海外无需开票 -->
        <!-- <el-button-group>
          <div v-if="(checkAuth(pageCode, 'tab-businessFee', 'btn-confirmIssueInvoice') || checkAuth(pageCode, 'tab-businessFee', 'btn-confirmNotIssueInvoice')) && mode==='byFee'" class="select-template-box" style="margin-left:8px;">
            <el-dropdown trigger="click" @command="handleCommandInvoice">
              <span class="el-dropdown-link">
                确认开票<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-confirmIssueInvoice')" :command="'yes'">
                  确认开票
                </el-dropdown-item>
                <el-dropdown-item v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-confirmNotIssueInvoice')" :command="'no'">
                  确认不开票
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-button-group> -->
        <el-button-group>
          <div v-if="(checkAuth(pageCode, 'tab-businessFee', 'btn-setAgentCompany') || checkAuth(pageCode, 'tab-businessFee', 'btn-cancelAgentCompany')) && mode==='byFee'" class="select-template-box" style="margin-left:8px;">
            <el-dropdown trigger="click" @command="handleCommandAgent">
              <span class="el-dropdown-link">
                {{$t('OrderFee.setAgentCompany')}}<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-setAgentCompany')" :command="'yes'">
                  {{$t('OrderFee.setAgentCompany')}}
                </el-dropdown-item>
                <el-dropdown-item v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-cancelAgentCompany')" :command="'no'">
                  {{$t('OrderFee.cancelAgentCompany')}}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </el-button-group>
        <el-button-group>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-addOrderLateFee') && mode==='byFee'" class="finance-btn" @click="addOrderLateFee" size="mini">{{$t('OrderFee.addLateFee')}}</el-button>
        </el-button-group>
        <el-button-group>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-applyBad') && mode==='byFee'" class="finance-btn" @click="receiLoss" size="mini" :disabled="precloseDisable">{{$t('OrderFee.receiLoss')}}</el-button>
        </el-button-group>
        <!-- 海外版不显示 -->
        <!-- <el-button-group>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-updateTaxRate') && mode==='byFee'" class="finance-btn" @click="updateTaxRate" size="mini">调整税率</el-button>
        </el-button-group> -->
      </div>
      <!-- <div style="width:100%;">
        <div class="money-box-left">
          <el-tooltip content="相同币种的应收金额减去应付金额得出的值">
            <div style="line-height:20px;">原币差额：</div>
          </el-tooltip>
          <div class="money-total" v-for="(item, index) in originalFeeDiff" :key="'originalFeeDiff' + index">
            {{item.currency}}<span :class="{'money-pay-color': false}">{{item.diffAmt}}</span>
          </div>
        </div>
      </div> -->
    </div>
    <div class="finance-table-container business-fee-receive-table">
      <div class="money-box">
        <div class="money-box-left" style="width:25%;padding-top:2px;line-height:20px;">
          <div class="money-title">{{$t('OrderFee.receive')}}</div>
          <div v-if="$route.name!=='BookDetail'" class="money-total" @click="switchMode" style="cursor:pointer;margin-left:-6px;margin-right:8px;width:20px;height:20px;text-align:center;">
            <el-tooltip :content="modeTip" placement="top">
              <!-- <i class="el-icon-sort" style="color:#666;transform:rotate(90deg);"></i> -->
              <img v-if="mode==='byFee'" src="@/assets/icon_switch.png" style="margin-top:2px;" />
              <img v-else src="@/assets/icon_switch2.png" style="margin-top:2px;" />
            </el-tooltip>
          </div>
          <div class="money-total" v-for="(item, index) in moneyTotalReceive" :key="'moneyTotalReceive' + index">
            {{item.currency}} {{$t('OrderFee.total')}}：<span :class="{'money-pay-color': moneyTitle1 === 'pay' ? true : false}">{{item.sum}}</span>
          </div>
        </div>
        <div v-if="$route.name!=='BookDetail'" class="money-box-right">
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-edit') && !isEditRecei && !isFinCloseCombined && mode==='byFee'" class="finance-btn" @click="handleEdit('receive')" size="mini" type="warning">{{$t('OrderFee.edit')}}</el-button>
          <el-button v-if="!hideSaveCnlBtn && isEditRecei && mode==='byFee'" class="finance-btn" @click="handleSavePre('receive')" type="primary" size="mini">{{$t('Common.save')}}</el-button>
          <el-button v-if="!hideSaveCnlBtn && isEditRecei && mode==='byFee'" class="finance-btn" @click="handleCancel('receive')" size="mini">{{$t('Common.cancel')}}</el-button>
          <!-- <el-button class="finance-btn" @click="handleCustomColumns" size="mini">{{$t('Common.custTableHead')}}</el-button> -->
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-addReceive') && !isFinCloseCombined && mode==='byFee'" class="finance-btn" @click="addReceive(null)" size="mini" type="primary">{{$t('OrderFee.newRecv')}}</el-button>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-confirmOrderFeeReceive') && mode==='byFee'" class="finance-btn" @click="confirmOrderFeePrev('receive')" size="mini" type="success">{{$t('OrderFee.confirmRecv')}}</el-button>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-cancleConfirmOrderFeeReceive') && mode==='byFee'" class="finance-btn" @click="cancleConfirmOrderFeePrev('receive')" type="purple" size="mini">{{$t('OrderFee.cancelConfirm')}}</el-button>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-rowCopy') && !isFinCloseCombined && mode==='byFee'" class="finance-btn" @click="handleCopy('receive')" size="mini">{{$t('OrderFee.copy')}}</el-button>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-addPay') && !isFinCloseCombined && mode==='byFee'" class="finance-btn" @click="addOpposite('receive')" size="mini">{{$t('OrderFee.addOpposite1')}}</el-button>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-updateBl')" class="finance-btn" @click="batchUpdateOrderFeeBl" type="warning" size="mini">{{$t('OrderFee.updateBl')}}</el-button>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-addReceive') && !isFinCloseCombined && mode==='byFee'" class="finance-btn" @click="copyHistoryFeeBefore('receive')" size="mini">{{$t('OrderFee.copyHistoryFee')}}</el-button>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-updateNegFol') && mode==='byFee'" class="finance-btn" @click="updateNegativeFollower('receive')" type="warning" size="mini">{{$t('OrderFee.updateNegativeFollower')}}</el-button>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-rowDelete') && !isFinCloseCombined && mode==='byFee'" class="finance-btn" @click="handleDelete('receive')" size="mini" type="danger">{{$t('OrderFee.del')}}</el-button>
          <el-button type="text" class="collapse-btn" @click="handleCollapse('Table1')" size="mini">{{showTable1 ? $t('OrderFee.collapse') : $t('OrderFee.expand')}}<i :class="{'el-icon-arrow-up': showTable1, 'el-icon-arrow-down': !showTable1}"></i></el-button>
        </div>
        <div v-else class="money-box-right">
          <el-button type="text" class="collapse-btn" @click="handleCollapse('Table1')" size="mini">{{showTable1 ? $t('OrderFee.collapse') : $t('OrderFee.expand')}}<i :class="{'el-icon-arrow-up': showTable1, 'el-icon-arrow-down': !showTable1}"></i></el-button>
        </div>
      </div>
      <FinanceTableMass
        :option="option1"
        v-show="showTable1&&mode==='byFee'"
        ref="option1"
        @send-multi="sendMulti"/>
      <FinanceTableMass
        :option="option7"
        v-show="showTable1&&mode==='bySettleUnit'"
        ref="option7"
        @send-multi="sendMulti"/>
    </div>
    <div class="finance-table-container" style="position:relative;">
      <div class="money-box">
        <div class="money-box-left" style="width:25%;padding-top:2px;line-height:20px;">
          <div class="money-title">{{$t('OrderFee.pay')}}</div>
          <div v-if="$route.name!=='BookDetail'" class="money-total" @click="switchMode" style="cursor:pointer;margin-left:-6px;margin-right:8px;width:20px;height:20px;text-align:center;">
            <el-tooltip :content="modeTip" placement="top">
              <!-- <i class="el-icon-sort" style="color:#666;transform:rotate(90deg);"></i> -->
              <img v-if="mode==='byFee'" src="@/assets/icon_switch.png" style="margin-top:2px;" />
              <img v-else src="@/assets/icon_switch2.png" style="margin-top:2px;" />
            </el-tooltip>
          </div>
          <div class="money-total" v-for="(item, index) in moneyTotalPay" :key="'moneyTotalPay' + index">
            {{item.currency}} {{$t('OrderFee.total')}}：<span :class="{'money-pay-color': moneyTitle2 === 'pay' ? true : false}">{{item.sum}}</span>
          </div>
        </div>
        <div v-if="$route.name!=='BookDetail'" class="money-box-right">
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-edit') && !isEditPay && !isFinCloseCombined && mode==='byFee'" class="finance-btn" @click="handleEdit('pay')" size="mini" type="warning">{{$t('OrderFee.edit')}}</el-button>
          <el-button v-if="!hideSaveCnlBtn && isEditPay && mode==='byFee'" class="finance-btn" @click="handleSavePre('pay')" type="primary" size="mini">{{$t('Common.save')}}</el-button>
          <el-button v-if="!hideSaveCnlBtn && isEditPay && mode==='byFee'" class="finance-btn" @click="handleCancel('pay')" size="mini">{{$t('Common.cancel')}}</el-button>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-addPay') && !isFinCloseCombined && mode==='byFee'" class="finance-btn" @click="addPay(null)" size="mini" type="primary">{{$t('OrderFee.newPay')}}</el-button>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-confirmOrderFeePay') && mode==='byFee'" class="finance-btn" @click="confirmOrderFeePrev('pay')" size="mini" type="success">{{$t('OrderFee.confirmPay')}}</el-button>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-cancleConfirmOrderFeePay') && mode==='byFee'" class="finance-btn" @click="cancleConfirmOrderFeePrev('pay')" type="purple" size="mini">{{$t('OrderFee.cancelConfirm')}}</el-button>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-rowCopy') && !isFinCloseCombined && mode==='byFee'" class="finance-btn" @click="handleCopy('pay')" size="mini">{{$t('OrderFee.copy')}}</el-button>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-addReceive') && !isFinCloseCombined && mode==='byFee'" class="finance-btn" @click="addOpposite('pay')" size="mini">{{$t('OrderFee.addOpposite2')}}</el-button>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-addPay') && !isFinCloseCombined && mode==='byFee'" class="finance-btn" @click="copyHistoryFeeBefore('pay')" size="mini">{{$t('OrderFee.copyHistoryFee')}}</el-button>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-updateNegFol') && mode==='byFee'" class="finance-btn" @click="updateNegativeFollower('pay')" type="warning" size="mini">{{$t('OrderFee.updateNegativeFollower')}}</el-button>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-payFeeFinishedPush')" class="finance-btn" @click="payFeeFinishedPush" size="mini">{{$t('OrderFee.payFeeFinishedPush')}}</el-button>
          <el-button v-if="checkAuth(pageCode, 'tab-businessFee', 'btn-rowDelete') && !isFinCloseCombined && mode==='byFee'" class="finance-btn" @click="handleDelete('pay')" size="mini" type="danger">{{$t('OrderFee.del')}}</el-button>
          <el-button type="text" class="collapse-btn" @click="handleCollapse('Table2')" size="mini">{{showTable2 ? $t('OrderFee.collapse') : $t('OrderFee.expand')}}<i :class="{'el-icon-arrow-up': showTable2, 'el-icon-arrow-down': !showTable2}"></i></el-button>
        </div>
        <div v-else class="money-box-right">
          <el-button type="text" class="collapse-btn" @click="handleCollapse('Table2')" size="mini">{{showTable2 ? $t('OrderFee.collapse') : $t('OrderFee.expand')}}<i :class="{'el-icon-arrow-up': showTable2, 'el-icon-arrow-down': !showTable2}"></i></el-button>
        </div>
      </div>
      <FinanceTableMass
        :option="option2"
        v-show="showTable2&&mode==='byFee'"
        ref="option2"
        @send-multi="sendMulti"/>
      <FinanceTableMass
        :option="option8"
        v-show="showTable2&&mode==='bySettleUnit'"
        ref="option8"
        @send-multi="sendMulti"/>
      <div style="position:absolute;bottom:-18px;left:-14px;width:14px;height:14px;">
        <i class="el-icon-monitor performance-setting" @click="performanceVisible=true"></i>
      </div>
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns 
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        @close="customColumnsPopClose"/>
    </div>
    <el-dialog
      :title="$t('OrderFee.modifySettleUnit')"
      :visible.sync="settleUnitVisible"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      custom-class="fin-modify-settleunit"
      width="640px">
      <div class="fin-dialog-content">
        <el-form ref="settleUnitForm" :model="settleUnitForm" label-width="160px" size="mini">
          <el-form-item :label="$t('OrderFee.settleCorpName')" prop="settleCorpName" style="width:540px;"
            :rules="{required: true, message: ' ', trigger: ['blur', 'change']}">
            <el-autocomplete
              v-model="settleUnitForm.settleCorpName"
              :placeholder="$t('OrderFee.plsSelect')"
              clearable
              :select-when-unmatched="true"
              :fetch-suggestions="(queryString, cb) => {autocompleteSettU.querySearch && autocompleteSettU.querySearch(queryString, cb)}"
              @select="(value) => {autocompleteSettU.select && autocompleteSettU.select(value)}"
              @change="(value) => {autocompleteSettU.change && autocompleteSettU.change(value)}"
              @clear="() => {autocompleteSettU.clear && autocompleteSettU.clear()}">
            </el-autocomplete>
          </el-form-item>
          <el-form-item v-if="isFinCloseCombined" :label="$t('OrderFee.applyPerson')" style="width:540px;"
            :rules="{required: true, message: ' ', trigger: 'change'}" class="fin-modify-settleunit-person">
            <el-select v-model="settleUnitForm.applyPersonId" :placeholder="$t('OrderFee.plsSelect')"
              filterable
              remote
              clearable
              :remote-method="employeeSelectlistLocal"
              @visible-change="(value) => {if(value){employeeSelectlistLocal('')}}"
              @change="personChangeLocal">
              <el-option
                v-for="(item, index) in employeeSelectOptions"
                :key="'employeeSelectOptions' + index"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('OrderFee.comment')" prop="comment" style="width:540px;"
            :rules="settleUnitCommentRules">
            <!-- <el-input
              v-model="settleUnitForm.comment"
              :placeholder="$t('OrderFee.plsInput')"
              type="textarea"
              clearable
              size="mini"
              maxlength="200"
              show-word-limit>
            </el-input> -->
            <textarea
              class="el-textarea__inner"
              v-model.lazy="settleUnitForm.comment"
              :placeholder="$t('OrderFee.plsInput')"
              :maxlength="200"
              show-word-limit
            ></textarea>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="saveSettleUnit" type="primary" size="mini">{{$t('Common.save')}}</el-button>
        <el-button @click="settleUnitVisible = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="copyHistoryFeeTitle"
      :visible.sync="copyHistoryFeeVisible"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      custom-class="copy-history-fee-dialog"
      width="710px">
      <div class="settlement-detail-form" style="padding:0;">
        <el-form ref="copyHistoryFeeForm" :model="copyHistoryFeeForm" label-width="110px" size="mini" :inline="true">
          <el-form-item :label="$t('OrderFee.oldOrderNo')" prop="orderNo" style="width:392px;"
            :rules="{required: true, message: ' ', trigger: 'blur'}">
            <!-- <el-input
              v-model="copyHistoryFeeForm.orderNo"
              :placeholder="$t('OrderFee.plsInput')"
              clearable
              size="mini"
              @change="(value) => {return;autocompleteHistFee.change && autocompleteHistFee.change(value)}"
              @clear="() => {autocompleteHistFee.clear && autocompleteHistFee.clear()}">
            </el-input> -->
            <input
              class="el-input__inner"
              style="width:200px;"
              v-model.lazy="copyHistoryFeeForm.orderNo"
              :placeholder="$t('OrderFee.plsInput')"
              clearable
              @change="(value) => {return;autocompleteHistFee.change && autocompleteHistFee.change(value)}"
              @clear="() => {autocompleteHistFee.clear && autocompleteHistFee.clear()}" />
            <el-button size="mini" @click="queryHistFee" type="primary" style="margin-left:10px;">{{$t('OrderFee.query')}}</el-button>
          </el-form-item>
          <el-form-item style="width:calc(100% - 392px - 14px);margin-right:0;text-align:right;">
            <el-button @click="confirmCopyHistoryFee" type="primary" size="mini">{{$t('Common.confirm')+$t('OrderFee.enspace')+$t('OrderFee.copy')}}</el-button>
            <el-button @click="copyHistoryFeeVisible = false" size="mini">{{$t('Common.cancel')}}</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="finance-table-container">
        <div class="money-box">
          <div class="money-box-left">
            <div class="money-title">{{historyFeeTitle}}</div>
            <!-- {{copyHistoryFeeTitle.includes('应收') ? '应收列表' : '应付列表'}} -->
          </div>
        </div>
        <FinanceTableMass
          :option="option3"
          @send-multi="sendMulti"/>
      </div>
    </el-dialog>
    <el-dialog
      :title="$t('OrderFee.new')+$t('OrderFee.enspace')+$t('OrderFee.template')"
      :visible.sync="feeTemplateVisible"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      class="finance-addfee-template"
      width="604px">
      <div class="modifyfee-detail-info finance-wider-el-input">
        <el-form ref="feeTemplateForm" :model="feeTemplateForm" label-width="110px" size="mini">
          <el-form-item :label="$t('OrderFee.templateName')" prop="feeTemplateName"
            :rules="[{required: true, message: $t('OrderFee.templateName')+$t('OrderFee.required'), trigger: 'blur'}]">
            <!-- <el-input
              v-model="feeTemplateForm.feeTemplateName"
              size="mini"
              :placeholder="$t('OrderFee.plsInput')"
              maxlength="50"
              show-word-limit>
            </el-input> -->
            <textarea
              class="el-textarea__inner"
              style="width:260px;resize:none;line-height:18px;height:20px;padding:0;"
              v-model.lazy="feeTemplateForm.feeTemplateName"
              :placeholder="$t('OrderFee.plsInput')"
              maxlength="50"
              show-word-limit />
        </el-form-item>
        </el-form>
        <p class="finance-addfee-template-tip">{{$t('OrderFee.maxTemplateTip1')}}{{maxTemplateCount}}{{$t('OrderFee.maxTemplateTip2')}}</p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveTemplate" size="mini">{{$t('Common.save')}}</el-button>
        <el-button @click="feeTemplateVisible = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="$t('OrderFee.setAgentCompany')"
      :visible.sync="agentReceipayVisible"
      :close-on-click-modal="false"
      class="finance-agent-receipay"
      width="604px">
      <div style="margin:20px auto 0;width:400px;">
        <el-form ref="agentForm" :model="agentForm" label-width="120px" size="mini">
          <el-form-item :label="$t('OrderFee.settleCompCode')" prop="agentCompCode"
            :rules="{required: true, message: ' ', trigger: 'blur'}">
            <el-select
              v-model="agentForm.agentCompCode"
              :placeholder="$t('OrderFee.plsSelect')"
              filterable
              remote
              clearable
              :remote-method="(queryString) => {remoteSelectAgent.remoteMethod && remoteSelectAgent.remoteMethod(queryString, remoteSelectAgent)}"
              @visible-change="(value) => {if(value){remoteSelectAgent.visibleChange && remoteSelectAgent.visibleChange('', remoteSelectAgent)}}"
              @change="(value) => {remoteSelectAgent.change && remoteSelectAgent.change(value, remoteSelectAgent)}"
            >
              <el-option
                v-for="(optionItem, j) in remoteSelectAgent.remoteSelectList || []"
                :key="'remoteSelectAgent' + j"
                :label="optionItem.label"
                :value="optionItem.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="setAgentCompany" size="mini">{{$t('Common.submit')}}</el-button>
        <el-button @click="agentReceipayVisible = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
    <!-- <div v-if="modifyFeeVisible.show">
      <ModifyFeeDialog
        :multiple-selection="multipleSelection"
        :dialog-visible="modifyFeeVisible"
        :is-business-fee="true"
        :air-cargo-states="airCargoStates"
        :container-count="containerCount"
        :bl-list="blList"
        :bkgAgent="bkgAgent"
        :client="client"
        :tempType="'biz'"
        :businessType="businessType" />
    </div> -->
    <PreviewDialog :dialogOption="previewDialog" />
    <el-dialog
      :title="$t('OrderFee.tip')"
      :visible.sync="generateBillVisible"
      :close-on-click-modal="false"
      width="560px">
      <div class="detail-info-other">
        <div class="detail-info-item" style="width:480px;">
          <div class="detail-info-item-label">{{$t('OrderFee.billNoGenerated')}}：</div>
          <div class="detail-info-item-content">
            <ul>
              <li v-for="(item, index) in generateBillList" :key="'generateBill' + index">
                {{item.orderBillNo}}, {{item.settleCorpName}}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="generateBillVisible = false" size="mini">{{$t('Common.close')}}</el-button>
      </span>
    </el-dialog>
    <div v-if="templateListVisible">
      <el-dialog
        :title="$t('OrderFee.importTemplate')"
        :visible.sync="templateListVisible"
        :close-on-click-modal="false"
        width="1000px">
        <UsableFeeTemplate ref="usableFeeTemplate" :tempType="'biz'" :useNo="useNo" :businessType="businessType" @set-fee-template="setFeeTemplate" />
        <span slot="footer" class="dialog-footer">
          <el-button @click="confirmFeeTemplate" size="mini" type="primary">{{$t('Common.confirm')}}</el-button>
          <el-button @click="templateListVisible = false" size="mini">{{$t('Common.close')}}</el-button>
        </span>
      </el-dialog>
    </div>
    <el-dialog
      :title="$t('OrderFee.edit')+$t('OrderFee.enspace')+$t('OrderFee.remark')"
      :visible.sync="editRemarkVisible"
      :close-on-click-modal="false"
      custom-class="fin-edit-remark"
      width="560px">
      <div>
        <!-- <el-input v-model="rowRemark.remark" type="textarea" :maxlength="500" show-word-limit /> -->
        <textarea
          class="el-textarea__inner"
          v-model.lazy="rowRemark.remark"
          :placeholder="$t('OrderFee.plsInput')"
          :maxlength="500"
          show-word-limit
        ></textarea>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="saveRemark" size="mini" type="primary">{{$t('Common.confirm')}}</el-button>
        <el-button @click="editRemarkVisible = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="$t('OrderFee.updateBl')"
      :visible.sync="editBlNoVisible"
      :close-on-click-modal="false"
      custom-class="fin-edit-bl"
      width="560px">
      <div>
        <el-select v-model="rowBlNo.blId" :maxlength="500" show-word-limit clearable multiple
          @change="changeBlNo">
          <el-option v-for="(bl, index) in blList" :key="'blMd' + index"
            :label="`【${bl.blType === 'mbl' ? 'M' : bl.blType === 'hbl' ? 'H' : bl.blType === 'mawb' ? $t('OrderFee.mawb') : bl.blType === 'hawb' ? $t('OrderFee.hawb') : ''}】${bl.blNo ? bl.blNo : bl.blId}`"
            :value="bl.blId">
          </el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="saveBlNo" size="mini" type="primary">{{$t('Common.confirm')}}</el-button>
        <el-button @click="editBlNoVisible = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="$t('OrderFee.updateNegativeFollower')"
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
        <el-button @click="saveNegativeFollower" size="mini" type="primary">{{$t('Common.confirm')}}</el-button>
        <el-button @click="editNegFolVisible = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
    <!-- '订单费用的日志' -->
    <el-dialog
      :title="$t('OrderFee.log')"
      :visible.sync="logDialogVisible"
      :close-on-click-modal="false"
      width="800px">
      <FinanceTableMass
        :option="option5"/>
      <span slot="footer" class="dialog-footer">
        <el-button @click="logDialogVisible = false" size="mini">{{$t('Common.close')}}</el-button>
      </span>
    </el-dialog>
    <BizDetailList :bizDetailVisible="bizDetailVisible" />
    <el-dialog
      :title="$t('OrderFee.addLateFee')"
      :visible.sync="lateFeeVisible"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      custom-class="fin-bizfee-dialog"
      width="600px">
      <div class="modifyfee-detail-info finance-wider-el-input">
        <el-form ref="lateFeeForm" :model="lateFeeForm" label-width="170px" size="mini">
          <el-form-item :label="$t('OrderFee.assumerType')" prop="respType"
            :rules="{required: true, message: ' ', trigger: 'change'}">
            <el-select v-model="lateFeeForm.respType"
              :placeholder="$t('OrderFee.plsSelect')"
              clearable>
              <el-option :label="$t('OrderFee.customer')" value="client"></el-option>
              <el-option :label="$t('OrderFee.salesman')" value="bd"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="lateFeeForm.respType === 'client'" :label="$t('OrderFee.settleCorpName')" prop="settleCorpName"
            :rules="{required: true, message: ' ', trigger: ['blur','change']}">
            <el-autocomplete
              v-model="lateFeeForm.settleCorpName"
              :placeholder="$t('OrderFee.plsInput')"
              clearable
              :select-when-unmatched="true"
              :fetch-suggestions="(queryString, cb) => {autocompleteLateFee.querySearch && autocompleteLateFee.querySearch(queryString, cb)}"
              @select="(value) => {autocompleteLateFee.select && autocompleteLateFee.select(value)}"
              @change="(value) => {autocompleteLateFee.change && autocompleteLateFee.change(value)}"
              @clear="() => {autocompleteLateFee.clear && autocompleteLateFee.clear()}">
            </el-autocomplete>
          </el-form-item>
          <el-form-item :label="$t('OrderFee.feeAmt')" prop="amt"
            :rules="[
              {required: true, message: ' ', trigger: 'blur'},
              {validator: validateLateFeeAmt, trigger: ['change', 'blur']}
            ]">
            <!-- <el-input v-model="lateFeeForm.amt"
              :placeholder="$t('OrderFee.plsInput')"
              clearable>
            </el-input> -->
            <input
              class="el-input__inner"
              style="width:220px;"
              v-model.lazy="lateFeeForm.amt"
              :placeholder="$t('OrderFee.plsInput')" />
          </el-form-item>
          <el-form-item :label="$t('OrderFee.currency')" prop="currency"
            :rules="{required: true, message: ' ', trigger: 'change'}">
            <el-select v-model="lateFeeForm.currency"
              :placeholder="$t('OrderFee.plsSelect')"
              clearable>
              <el-option
                v-for="(item, index) in dictMap['validCurrencyNR']" :key="'currency' + index" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="saveLateFee" type="primary" size="mini">{{$t('Common.save')}}</el-button>
        <el-button @click="lateFeeVisible = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
    <SpecFeeMngApplyDialog
      :dialog-visible="specFeeMngApplyVisible"
      :fees="updateFees"
      :is-business-fee="true"
      :fee-save-verify-data="feeSaveVerifyData"
      :saveApplyCallback="saveApplyCallback" />
    <el-dialog
      :title="$t('OrderFee.lossclose')"
      :visible.sync="dialogShow"
      width="600px"
      @close="dialogShow = false"
    >
      <el-form
        :model="lossForm"
        ref="lossForm"
        :rules="lossRules"
        :label-width="'100px'"
        :inline="false"
        size="mini"
        style="padding-top: 16px"
      >
        <el-form-item :label="$t('OrderFee.reasonType')" prop="reasonType">
          <el-select v-model="lossForm.reasonType" :placeholder="$t('OrderFee.plsSelect')" clearable filterable style="width:100%;"><!-- $t('OrderFee.selectReasonType') -->
            <el-option
              v-for="item in dictMap['precloseProfitLossReasonType']"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('OrderFee.reason')" prop="reason">
          <!-- <el-input
            type="textarea"
            v-model="lossForm.reason"
            :placeholder="$t('OrderFee.inputReason')"
            :maxlength="500"
            show-word-limit
          ></el-input> -->
          <textarea
            class="el-textarea__inner"
            v-model.lazy="lossForm.reason"
            :placeholder="$t('OrderFee.plsInput')"
            :maxlength="500"
            show-word-limit
          ></textarea>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="sure">{{$t('Common.confirm')}}</el-button>
        <el-button @click="dialogShow = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="`${$t('OrderFee.feeIsMatched')+$t('OrderFee.enspace')+$t('OrderFee.detail').toLowerCase()}`"
      :visible.sync="feeCompletedVisible"
      :close-on-click-modal="false"
      width="800px">
      <FinanceTableMass
        :option="option6"/>
      <span slot="footer" class="dialog-footer">
        <el-button @click="feeCompletedVisible = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
    <!-- 不显示 -->
    <!-- <el-dialog
      title="调整税率"
      :visible.sync="taxRateVisible"
      :close-on-click-modal="false"
      custom-class="fin-edit-taxrate"
      width="560px">
      <div>
        <el-select v-model="taxRateForm.taxRate" placeholder="请选择税率" clearable style="width:100%;">
          <el-option
            v-for="item in dictMap['taxRateInfo']"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="saveTaxRate" size="mini" type="primary">{{$t('Common.sure')}}</el-button>
        <el-button @click="taxRateVisible = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog> -->
    <el-dialog
      :title="$t('OrderFee.lowPerformance')"
      :visible.sync="performanceVisible"
      :close-on-click-modal="false"
      custom-class="fin-edit-remark"
      width="560px">
      <div>
        <!-- <el-input v-model="performanceNum" :placeholder="$t('OrderFee.plsInput')" /> -->
        <input
          class="el-input__inner"
          v-model.lazy="performanceNum"
          :placeholder="$t('OrderFee.plsInput')" />
      </div>
      <div style="margin-top:4px;">
        <span style="color:#CCC;">{{$t('OrderFee.lowPerformanceTip')}}</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="savePerformance" size="mini" type="primary">{{$t('Common.confirm')}}</el-button>
        <el-button @click="performanceVisible = false" size="mini">{{$t('Common.cancel')}}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      v-if="dialogVisible2"
      :title="$t('OrderFee.payFeeFinishedPush')"
      :visible.sync="dialogVisible2"
      width="1000px"
      custom-class="finance-email-dialog"
      v-loading="emailLoading"
      :element-loading-text="$t('BillList.sendingMail')"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <div v-loading="btnLoading2">
        <el-form :model="emailForm" :rules="emailRules" ref="emailForm" label-width="80px" size="mini">
          <el-form-item :label="$t('BillList.mailTo')" prop="toEmails">
            <el-input v-model="emailForm.toEmails" :placeholder="$t('OrderFee.plsInput')" show-word-limit maxlength="500">
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('BillList.mailCc')" prop="ccEmails">
            <el-input v-model="emailForm.ccEmails" :placeholder="$t('OrderFee.plsInput')" show-word-limit maxlength="500">
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('BillList.mailSubject')" prop="subject">
            <el-input :placeholder="$t('OrderFee.plsInput')" v-model="emailForm.subject" type="textarea" :rows="2" show-word-limit maxlength="500">
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('BillList.mailContent')" prop="emailHtml">
						<tinymce class="mail-sign-rich-text" :toolbar="tinymceConfig.toolbar" :menubar="tinymceConfig.menubar" v-model="emailForm.emailHtml" :height="180" ref="emailSign" />
            <!-- <el-input placeholder="请填写邮件内容" v-model="emailForm.emailHtml" type="textarea" class="finance-email-content" :rows="6" show-word-limit maxlength="500">
            </el-input> -->
          </el-form-item>
          <el-form-item :label="$t('BillList.attachment')" prop="fileNos">
            <FinanceUploadEmbed ref="FinanceUploadEmbed" width="100%" @send-file-list="sendFileList" />
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="sendBillEmail">{{$t('BillList.sendMail')}}</el-button><!-- 推送 -->
        <el-button @click="dialogVisible2 = false" size="mini">{{$t('OrderFee.cancel')}}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import FinanceTableMass from '../../../components/financeTableMass/financeTableMass'
import CustomColumns from '@/components/customColumns/index'
// import ModifyFeeDialog from './components/feeClosedModifyFeeDialog'
import { uploadBusinessFee, saveOrderBizFee, orderFeeList, saveAsTemplate, batchModifySettleUnit, confirmOrderFeeInvoiceStatus, confirmOrderFee,
 myTemplate, getOrderProfit, deleteTemplate, setAgentCompany, cancelAgentCompany, cancleConfirmOrderFee, saveOrderLateFee,
 bizFeeSaveVerify, orderFeeListByCorp, signEmailInfo, syncFeesFromExportOrder } from '@/api/fin/fee' // getOrderTaxStat不使用
import { generateBill } from '@/api/fin/bill'
import { getTaxRate } from '@/api/fin/tax'
import finCloseApi from '@/api/fin/finClose'
import { usableFeeTemplate, getTemplateItem } from '@/api/fin/feeTemp'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { orderFeeMixin } from '@/views/finance/orderFee/orderFee/components/components/orderFeeMixin'
// import { decimalFixed2 } from '@/views/finance/utils/finance'
import { mapState, mapMutations } from 'vuex'
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
import UsableFeeTemplate from '@/views/finance/orderFee/feeTemplateList/components/usableFeeTemplate'
import BizDetailList from '@/views/finance/orderFee/orderFee/components/components/bizDetailList'
import SpecFeeMngApplyDialog from '@/views/finance/orderFee/orderFee/components/components/specFeeMngApplyDialog'
import { saveOrderBizFee as saveOrderBizFeeAdjust, getAdjustAuditEmployee } from '@/api/fin/feeAdjust'
import API from '@/api/fin/finClose'
import { checkFeeCompleted, updateOrderFeeTaxRate, feeAdjustRoleJobList } from '@/api/fin/orderFee'
import lang from '@/lang/language'
import i18n from '@/lang'
import FinanceUploadEmbed from '@/views/finance/components/financeUpload/financeUploadEmbed'
import Tinymce from '@/components/Tinymce'

export default {
  mixins: [mixin, routerMixin, orderFeeMixin],
  props: {
    hideSaveCnlBtn: {
      type: Boolean,
      default: false
    },
    orderCloseInfo: {
      type: Object,
      default: () => ({})
    },
    orderInfo: {
      type: Object,
      default: () => ({})
    },
  },
  data() {
    let pageCode = '' // this.$route.name === 'SiDetail' ? 'SiDetailFee' : this.$route.name
    if (this.$route.name === 'SiDetail') {
      pageCode = 'SiDetailFee'
    } else {
      pageCode = 'OrderFee'
    }
    return {
      option1: {},
      option2: {},
      option3: {},
      option4: {},
      option6: {},
      option7: {},
      option8: {},
      isEditRecei: false,
      isEditPay: false,
      moneyTitle1: 'receive',
      moneyTitle2: 'pay',
      showTable1: true,
      showTable2: true,
      table1DataBackup: [],
      table2DataBackup: [],
      isAddReceive: false,
      isAddPay: false,
      multipleSelection1: [],
      multipleSelection2: [],
      multipleSelection3: [],
      multipleSelection7: [],
      multipleSelection8: [],
      selectedOptionItem: '',
      // businessType: this.$store.state.finance.businessType,
      // serviceType: this.$store.state.finance.serviceType,
      orderNo: '',
      serviceType: '',
      moneyTotalReceive: [],
      moneyTotalPay: [],
      agentReceipayVisible: false,
      agentForm: {
        agentCompCode: '',
        agentCompName: ''
      },
      remoteSelectAgent: {},
      modifyFeeVisible: {
        show: false
      },
      multipleSelection: [],
      settleUnitVisible: false,
      autocompleteSettU: {},
      settleUnitForm: {
        settleCorpName: '',
        settleCorpCode: '',
        comment: '',
        auditPerson: '',
        auditPersonMain: '',
        applyPersonId: ''
      },
      employeeSelectOptions: [],
      feeTemplateVisible: false,
      feeTemplateForm: {
        feeTemplateName: ''
      },
      templateListVisible: false,
      myTemplateList: [],
      timer1: null,
      timer2: null,
      unitTypes: '',
      source: '',
      settleOrderNo: '',
      source: '',
      isDetailPage: true,
      componentProps: '',
      feeSettleCompany: null,
      client: null,
      previewDialog: {
        show: false,
        title: this.$t('Common.previewVoucher'),
        seqNo: '',
      },
      loading: false,
      jointNo: '',
      useNo: '',
      isSort: false,
      maxTemplateCount: 20,
      bkgAgent: null, // 订单代理信息（应付费用的默认结算单位）
      containerCount: '',
      pageCode,
      copyHistoryFeeTitle: '',
      historyFeeTitle: '',
      copyHistoryFeeVisible: false,
      autocompleteHistFee: {},
      copyHistoryFeeForm: {
        orderNo: ''
      },
      orderProfit: {
        totalCnyProfit: 0,
        totalGrossProfit: 0,
        totalUsdProfit: 0,
      },
      generateBillVisible: false,
      generateBillList: [],
      originalFeeDiff: [],
      precloseDisable: false,
      losscloseDisable: false,
      sortType: '',
      ship: true,
      air: false,
      rail: false,
      lateFeeVisible: false,
      lateFeeForm: {
        respType: '',
        settleCorpName: '',
        settleCorpCode: '',
        serviceName: '',
        serviceCode: '',
        amt: '',
        currency: ''
      },
      autocompleteLateFee: {},
      servicesOfAFee: [],
      blList: [],
      isBusinessFee: true,
      specFeeMngApplyVisible: {
        show: false
      },
      updateFees: [],
      saveApplyCallback: null,
      feeSaveVerifyData: {},
      mainOrderCompany: null,
      airCargoStates: {},
      dialogShow: false,
      lossForm: {
        reason: '',
        reasonType: '',
      },
      lossRules: {
        reason: [{ required: true, message: ' ', trigger: 'blur' }],
        reasonType: [{ required: true, message: ' ', trigger: 'blur' }],
      },
      isMatched: 'no',
      feeCompletedVisible: false,
      taxRateVisible: false,
      taxRateForm: {
        taxRate: null
      },
      settleUnitCommentRules: {},
      mode: 'byFee',
      modeTip: this.$t('OrderFee.modeTip1'),
      modeMemory: false,
      editNegFolVisible: false,
      negFolForm: {
        negativeFollowerId: '',
        negativeFollowerName: '',
        type: ''
      },
      orderProfitToken: '',
      performanceVisible: false,
      performanceNum: 25,
      dialogVisible2: false,
      emailLoading: false,
      emailForm: {toEmails:'', ccEmails:'', subject:'', content:'',emailHtml:''},
      emailRules: {
        toEmails: [
          { required: true, message: ' ', trigger: 'blur' },
          { validator: this.validateReceive, trigger: 'blur' }
        ],
        subject: [{ required: true, message: ' ', trigger: 'blur' }],
        content: [{ required: true, message: ' ', trigger: 'blur' }],
      },
      billFile: {},
      fileList: [],
			tinymceConfig: {
				toolbar: ['undo redo | fontselect | fontsizeselect | forecolor backcolor bold italic underline strikethrough alignleft aligncenter alignright outdent indent removeformat hr charmap'],
				menubar: ''
			},
    }
  },
  created() {
    let pageCode = '' // this.$route.name === 'SiDetail' ? 'SiDetailFee' : this.$route.name
    if (this.$route.name === 'SiDetail') {
      pageCode = 'SiDetailFee'
    } else {
      pageCode = 'OrderFee'
    }
    if (this.modeMemory) {
      let finLStorage = localStorage.getItem('finLStorage')
      if (finLStorage) {
        finLStorage = JSON.parse(finLStorage)
        this.mode = finLStorage.orderFeeMode ? finLStorage.orderFeeMode : this.mode
      }
    }
    this.getOrderNo()
    if (this.mode === 'byFee') {
      this.getData()
    } else {
      this.getDataSU()
    }
    this.getOrderMainInfo()
    let operationBtns = Object.assign(this.option.operationBtns, {
      data: [
        // {
        //   label: this.$t('Common.del'),
        //   type: 'text',
        //   // show: true,
        //   showFn: () => this.checkAuth(this.pageCode, 'tab-businessFee', 'btn-rowDelete'),
        //   action: 'Delete'
        // },
        // {
        //   label: '复制',
        //   type: 'text',
        //   // show: true,
        //   showFn: () => this.checkAuth(this.pageCode, 'tab-businessFee', 'btn-rowCopy'),
        //   action: 'Copy'
        // },
        {
          label: this.$t('OrderFee.remark'),
          style: {color: '#edb534'},
          type: 'text',
          show: true,
          action: 'Remark'
        },
        // {
        //   label: '提单号',
        //   style: {color: '#edb534'},
        //   type: 'text',
        //   show: true,
        //   action: 'BlNo'
        // },
        {
          label: this.$t('OrderFee.log'),
          type: 'text',
          show: true,
          action: 'showLog'
        },
        {
          label: this.$t('OrderFee.detail'),
          type: 'text',
          show: true,
          action: 'BizDetail'
        }
      ],
      show: true, // !this.isFinCloseCombined,
      width: '140'
    })
    // let operationBtns2 = Object.assign({}, operationBtns, {
    //   data: operationBtns.data.filter((item, index) => index !== 1)
    // })
    let finLStorage = localStorage.getItem('finLStorage')
    finLStorage = finLStorage ? JSON.parse(finLStorage) : {}
    let option1MaxHg = finLStorage.businessFee ? finLStorage.businessFee.option1MaxHg : ''
    let option2MaxHg = finLStorage.businessFee ? finLStorage.businessFee.option2MaxHg : ''
    this.showTable1 = finLStorage.businessFee ? finLStorage.businessFee.showTable1 : this.showTable1
    this.showTable2 = finLStorage.businessFee ? finLStorage.businessFee.showTable2 : this.showTable2
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'businessFee1',
      data: [],
      tips: {
        text: '',
        show: false
      },
      selection: {
        show: true,
        fixed: false
      },
      operationBtns,
      sortable: true,
      sortChange: this.sortChange,
      maxHeight: option1MaxHg || 300,
      index: {
        show: true,
        fixed: false,
        title: this.$t('OrderFee.index')
      },
      handleKeyup: this.handleKeyup,
      noCheckWhenEdit: true, // 在业务费用、专项管理费、费用单详情等页面，当处于编辑状态时，停用点击勾选的功能
      customColumns: {
        show: true,
        handleCustomColumns: this.handleCustomColumns,
        fixed: false
      },
      colorColumns: ['feeSettleStatus'],
      // scrollY: {
      //   enabled: true,
      //   // gt: 199
      // },
      scrollY: {
        enabled: localStorage.getItem('performanceNum') ? true : false,
        gt: localStorage.getItem('performanceNum') || 199
      },
      disableFixedIndex0: true
    })
    this.option2 = Object.assign({}, this.option, {
      id: 'option2', $name: 'businessFee2',
      data: [],
      tips: {
        text: '',
        show: false
      },
      selection: {
        show: true,
        fixed: false
      },
      operationBtns,
      sortable: true,
      sortChange: this.sortChange,
      maxHeight: option2MaxHg || 300,
      index: {
        show: true,
        fixed: false,
        title: this.$t('OrderFee.index')
      },
      handleKeyup: this.handleKeyup,
      noCheckWhenEdit: true,
      customColumns: {
        show: true,
        handleCustomColumns: this.handleCustomColumns2,
        fixed: false
      },
      colorColumns: ['feeSettleStatus'],
      // scrollY: {
      //   enabled: true,
      //   // gt: 199
      // },
      scrollY: {
        enabled: localStorage.getItem('performanceNum') ? true : false,
        gt: localStorage.getItem('performanceNum') || 199
      },
      disableFixedIndex0: true
    })
    this.option3 = Object.assign({}, this.option, {
      id: 'option3', $name: 'businessFee3',
      data: [],
      tips: {
        text: '',
        show: false
      },
      selection: {
        show: true,
        fixed: true
      },
      operationBtns: {
        show: false
      },
      index: {
        show: true,
        title: this.$t('OrderFee.index')
      },
      columns: [
        { prop: 'settleCorpName', label: this.$t('OrderFee.settleCorpName'), type: 'text', width: 160 },
        { prop: lang === 'zh' ? 'feeName' : 'feeEnName', label: lang === 'zh' ? this.$t('OrderFee.feeName') : this.$t('FeeList.feeEname'), type: 'text', width: 130 },
        { prop: 'currency', label: this.$t('OrderFee.currency'), type: 'text' },
        { prop: 'feeAmt', label: this.$t('OrderFee.feeAmt'), type: 'text' },
      ],
      maxHeight: 400
    })
    this.option4 = Object.assign({}, this.option, {
      id: 'option4', $name: 'businessFee4',
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns: {
        show: false
      },
      selection: {
        show: false
      }
    })
    this.option6 = Object.assign({}, this.option, {
      id: 'option6', $name: 'businessFee6',
      data: [],
      tips: {
        text: '',
        show: false
      },
      operationBtns: {
        show: false
      },
      selection: {
        show: false
      }
    })
    this.option7 = Object.assign({}, this.option, {
      id: 'option7', $name: 'businessFee7',
      data: [],
      tips: {
        text: '',
        show: false
      },
      selection: {
        show: true,
        fixed: true
      },
      operationBtns: {
        show: false
      },
      sortable: true,
      sortChange: this.sortChange,
      maxHeight: 300,
      index: {
        show: true,
        title: this.$t('OrderFee.index')
      },
      handleKeyup: this.handleKeyup,
      noCheckWhenEdit: true, // 在业务费用、专项管理费、费用单详情等页面，当处于编辑状态时，停用点击勾选的功能
      customColumns: {
        show: true,
        handleCustomColumns: this.handleCustomColumns3
      },
      colorColumns: [],
    })
    this.option8 = Object.assign({}, this.option, {
      id: 'option8', $name: 'businessFee8',
      data: [],
      tips: {
        text: '',
        show: false
      },
      selection: {
        show: true,
        fixed: true
      },
      operationBtns: {
        show: false
      },
      sortable: true,
      sortChange: this.sortChange,
      maxHeight: 300,
      index: {
        show: true,
        title: this.$t('OrderFee.index')
      },
      handleKeyup: this.handleKeyup,
      noCheckWhenEdit: true,
      customColumns: {
        show: true,
        handleCustomColumns: this.handleCustomColumns4
      },
      colorColumns: [],
    })
    // this.fetchTemplate() // 现不需请求
    this.autocompleteSettU = {
      querySearch: (queryString, cb, row) => {
        this.selectedOptionItem = ''
        let receipayType = this.multipleSelection1.length > 0 ? 'receive' : 'pay'
        if (receipayType === 'pay') {
          this.queryFinSupplierList({
            queryString,
            serviceCode: this.multipleSelection2[0].serviceCode,
            feeCode: this.multipleSelection2[0].feeCode, // 20210929当录入费用项的属性，要求成对录入的时候，下拉选择供应商时，应该能选到类型为客户的结算单位。
            size: 20
          }, cb)
        } else {
          this.querySettleUnit({
            queryString,
            unitTypes: 'customer,supplier,company,DEPT',
            isAdd: true, 
            isForbid: true,
          }, cb)
        }
      },
      select: (optionItem, row) => {
        this.selectedOptionItem = optionItem
        this.settleUnitForm.settleCorpName = optionItem.value
        this.settleUnitForm.settleCorpCode = optionItem.key
      },
      change: (val, row) => {
        // 延时150ms获取select中的改变
        setTimeout(() => {
            if (this.selectedOptionItem === '') {
              this.settleUnitForm.settleCorpName = ''
              this.settleUnitForm.settleCorpCode = ''
              return
            }
        }, 150)
      },
      clear: () => {
        this.settleUnitForm.settleCorpName = ''
        this.settleUnitForm.settleCorpCode = ''
      }
    }
    this.autocompleteHistFee = {
      querySearch: (queryString, cb) => {
      },
      select: (optionItem, row) => {
      },
      change: (val, row) => {
        if (!val) return
        let data = {
          "orderNo": val,
          "viewGroupType": "biz",
          "isException": "no",
          "currPage": 1,
          "pageSize": 1000,
          "receipayType": this.copyHistoryFeeForm.receipayType
        }
        orderFeeList(data).then(res => {
          if (res.code === 0) {
            let { list } = res.data
            let data = []
            if (this.copyHistoryFeeTitle.includes('应收') || this.copyHistoryFeeTitle.includes('Rec')) {
              data = list.filter(item => {
                return item.receipayType === 'receive'
              })
            } else {
              data = list.filter(item => {
                return item.receipayType === 'pay'
              })
            }
            this.option3.data = data
          }
        })
      },
      clear: () => {
        this.option3.data = []
      }
    }
    this.remoteSelectAgent = {
      remoteMethod: (queryString, item, row) => {
        let receipayType = this.multipleSelection1[0] ? this.multipleSelection1[0].receipayType : this.multipleSelection2[0].receipayType
        this.querySettleUnit2({queryString, unitTypes: 'company', isAdd: true, isForbid: true, receipayType }, item)
      },
      visibleChange: (queryString, item, row) => {
        let receipayType = this.multipleSelection1[0] ? this.multipleSelection1[0].receipayType : this.multipleSelection2[0].receipayType
        this.querySettleUnit2({queryString, unitTypes: 'company', isAdd: true, isForbid: true, receipayType}, item)     
      },
      change: (value, item) => {
      },
      remoteSelectList: []
    }
    this.autocompleteLateFee = {
      querySearch: (queryString, cb) => {
        this.selectedOptionItem = ''
        this.querySettleUnit({
          queryString,
          unitTypes: 'customer,supplier,company,DEPT',
          isAdd: true,
          isForbid: true,
          receipayType: 'receive',
        }, cb)
      },
      select: (optionItem, row) => {
        this.selectedOptionItem = optionItem
        this.lateFeeForm.settleCorpName = optionItem.value
        this.lateFeeForm.settleCorpCode = optionItem.key
      },
      change: (val, row) => {
        // 延时150ms获取select中的改变
        setTimeout(() => {
            if (this.selectedOptionItem === '') {
              this.lateFeeForm.settleCorpName = ''
              this.lateFeeForm.settleCorpCode = ''
              return
            }
        }, 150)
      },
      clear: () => {
        this.lateFeeForm.settleCorpName = ''
        this.lateFeeForm.settleCorpCode = ''
      }
    }
  },
  activated() {
    this.getOrderNo()
  },
  components: {
    FinanceTableMass,
    CustomColumns,
    // ModifyFeeDialog,
    PreviewDialog,
    UsableFeeTemplate,
    BizDetailList,
    SpecFeeMngApplyDialog,
    FinanceUploadEmbed,
    Tinymce,
  },
  methods: {
    getData(param = {}) {
      this.loading = true
      let prop = param && param.prop
      if (prop === 'serviceCode') { // 解决当初中途临时使用过serviceCode作为字段名产生的问题
        prop = 'serviceName'
      } else if (prop === 'blId') {
        prop = 'blIds' // blNo
      }
      let data = {
        "orderNo": this.useNo, // this.orderNo,
        "viewGroupType": "all", // "biz",
        "isException": "no",
        "columns": this.customColumnsKeys,
        "ascColumns": param && param.order === 'ascending' ? [prop] : [],
        "descColumns": param && param.order === 'descending' ? [prop] : (param && param.order === 'ascending' ? [] : []), // 'createdTime'
        "currPage": 1,
        "pageSize": 1000,
        "receipayType": 'receive'
      }
      let data2 = Object.assign({}, data, { "receipayType": 'pay', "columns": this.customColumnsKeys2, "pageSize": 0 })
      Promise.all([orderFeeList(data), orderFeeList(data2)]).then(res => {
        this.loading = false
        if (res[0].code === 0) {
          this.processData(res[0], 'receive', param.dataType)
        }
        if (res[1].code === 0) {
          this.processData(res[1], 'pay', param.dataType)
        }
      }).catch(err => {
        this.loading = false
      }).finally(() => {
        this.checkFeeCompleted() // 校验订单费用是否完整
      })
    },
    processData(res, receipayType, dataType) {
      let { configColumns, feeSettleCompany, client, maxTemplateCount = 20, bkgAgent, containerCount = '', blList, mainOrderCompany, orderProfitToken } = res.data
      this.feeSettleCompany = feeSettleCompany
      this.client = client // 委托单位
      this.maxTemplateCount = maxTemplateCount
      this.bkgAgent = bkgAgent ? bkgAgent : {} // 订舱代理
      this.containerCount = containerCount + ''
      this.blList = blList
      this.mainOrderCompany = mainOrderCompany
      this.$emit('get-main-order-company', mainOrderCompany)
      this.$emit('get-client', client)
      this.orderProfitToken = orderProfitToken
      let columns = []
      if (receipayType === 'receive') {
        this.columns = configColumns.length > 0 ? configColumns : this.defaultColumnsRecei
        this.columns = [...this.columns]
        if (this.jointNo && !this.rail) { // 铁路协同bl, 202201
          let index = this.columns.findIndex(item => item === 'blId')
          if (index > -1) {
            this.columns.splice(index, 1)
          }
        }
        let serviceCodeIndex = this.columns.findIndex(item => item === 'serviceCode')
        if (serviceCodeIndex > -1) {
          this.columns.splice(serviceCodeIndex, 1, 'serviceName')
        }
        this.columns = [...new Set(this.columns)]
        this.columns = this.columns.filter(item => item !== 'acctVoucherNos') // 去掉凭证号, 20220907, 如自定义表头含有去掉
        this.columns = this.columns.filter(item => this.overseaDelColumns.every(one => one !== item)) // 海外版不显示的列
        let arr1 = []
        this.columns.forEach(value => {
          let obj = this.columnsBaseLocal.find(item => {
            return item.prop === value
          })
          if (obj) {
            if (obj.prop === 'feeAmt') { // 将业务费用的金额设置不可输入
              obj = Object.assign({}, obj, {
                type: 'text',
                // specialCellClassName: 'red-color-container-fin' // 用于开发示例
              })
            } else if (obj.prop === 'receipayType' || obj.prop === 'settleStatus' || obj.prop === 'invoiceStatus' || obj.prop === 'writeoffStatus' || obj.prop === 'settleCycle') {
              obj = Object.assign({}, obj, {
                readOnly: true
              })
            } else if (obj.prop === 'blId') {
              let remoteSelectList = this.blList.map(bl => {
                return { ...bl, value: bl.blId, label: `【${bl.blType === 'mbl' ? 'M' : bl.blType === 'hbl' ? 'H' : bl.blType === 'mawb' ? '主' : bl.blType === 'hawb' ? '分' : ''}】${bl.blNo ? bl.blNo : bl.blId}` }
              })
              obj = Object.assign({}, obj, { remoteSelectList })
            } else if (obj.prop === 'negativeType' || obj.prop === 'negativeFollowerId' || obj.prop === 'splitFromOrderNo') {
              obj = Object.assign({}, obj, { bothDisabled: true })
            }
            // 用于显示必填
            let requiredList = [ 'feeName', 'feeEnName', 'serviceName', 'settleCorpName', 'feeUnit', 'unitPrice', 'unitCount', 'currency' ]
            if (requiredList.includes(obj.prop)) {
              obj = Object.assign({}, obj, { required: true })
            }
            if (obj.prop !== 'payApplySettleNos' && obj.prop !== 'payOrderNos') {
              arr1.push(obj)
            }
          }
        })
        if (!this.isSort || this.sortType === 'option2') { // 点击option2的排序，重置option1的排序按钮（因option1返回的数据亦已按新的排序改变）
          this.option1.columns = arr1
        }
        // this.isSort = false // 现有两份数据处理，这里不能改变状态
      } else if (receipayType === 'pay') {
        this.columns2 = configColumns.length > 0 ? configColumns : this.defaultColumnsPay
        this.columns2 = [...this.columns2]
        let serviceCodeIndex = this.columns2.findIndex(item => item === 'serviceCode')
        if (serviceCodeIndex > -1) {
          this.columns2.splice(serviceCodeIndex, 1, 'serviceName')
        }
        this.columns2 = [...new Set(this.columns2)]
        this.columns2 = this.columns2.filter(item => item !== 'acctVoucherNos') // 去掉凭证号, 20220907, 如自定义表头含有去掉
        this.columns2 = this.columns2.filter(item => this.overseaDelColumns.every(one => one !== item)) // 海外版不显示的列
        let arr2 = []
        this.columns2.forEach(value => {
          let obj = this.columnsBaseLocal.find(item => {
            return item.prop === value
          })
          if (obj) {
            if (obj.prop === 'feeAmt') { // 将业务费用的金额设置不可输入
              obj = Object.assign({}, obj, {
                type: 'text'
              })
            } else if (obj.prop === 'taxRate') { // 应付税率改为在基础数据的税率配置中配置
              obj = Object.assign({}, obj, {
                type: 'select',
                selectOptions: [...(this.dictMap.taxRateInfo || [])]
              })
            } else if (obj.prop === 'receipayType' || obj.prop === 'settleStatus' || obj.prop === 'invoiceStatus' || obj.prop === 'writeoffStatus' || obj.prop === 'settleCycle') { // || obj.prop === 'feeUnit' 放开
              obj = Object.assign({}, obj, {
                readOnly: true
              })
            } else if (obj.prop === 'negativeType' || obj.prop === 'negativeFollowerId' || obj.prop === 'splitFromOrderNo') {
              obj = Object.assign({}, obj, { bothDisabled: true })
            }
            let requiredList = [ 'feeName', 'feeEnName', 'serviceName', 'settleCorpName', 'feeUnit', 'unitPrice', 'unitCount', 'currency' ]
            if (requiredList.includes(obj.prop)) {
              obj = Object.assign({}, obj, { required: true })
            }
            arr2.push(obj)
          }
        })
        if (!this.isSort || this.sortType === 'option1') {
          this.option2.columns = arr2
        }
        this.isSort = false
        return
      }
      let { list } = res.data
      let data1 = list.filter(item => {
        // item.feeUnit = item.feeUnit.toLowerCase() // 现字段有大写，小写，无法统一处理成小写
        item.settleOrderNos_multiValue = item.settleOrderNos.split(',')
        item.writeoffNos_multiValue = item.writeoffNos.split(',')
        item.settleTimes_multiValue = item.settleTimes.split(',')
        item.payApplySettleNos_multiValue = item.payApplySettleNos.split(',')
        item.payOrderNos_multiValue = item.payOrderNos.split(',')
        item.acctVoucherNos_multiValue = item.acctVoucherNos.split(',').map(subItem => {
          let arr = subItem.split('/')
          return arr[1] ? arr[1] : arr[0]
        })
        item.voucherSeqNos_multiValue = item.acctVoucherNos.split(',').map(subItem => {
          let arr = subItem.split('/')
          return arr[0]
        })
        item.invoiceNos_multiValue = item.invoiceNos.split(',').map(subItem => {
          let arr = subItem.split('/')
          return arr[1] ? arr[1] : arr[0]
        })
        item.invoiceReceivableIds_multiValue = item.invoiceNos.split(',').map(subItem => {
          let arr = subItem.split('/')
          return arr[0]
        })
        item.blId = item.blIds ? item.blIds.split(',').map(id => parseInt(id)).filter(id => item.feeBls.some(bl => bl.blId === id)) : [] // 接口feeBls根据提交的未修正的feeBls，返回有误；20220907增加filter，用于个别blIds多了错误的数据
        item._tagArr = item.jointStatus === 'yes' ? [{text: this.$t('OrderFee.joint'), type: 'bluetag'}] : []
        item.bothDisabled = true
        // 收付日期重复显示一个, 20220831 zhangling
        let receivePayDates = item.receivePayDates.split(',')
        receivePayDates = [ ...new Set(receivePayDates) ]
        item.receivePayDates = receivePayDates.join(',')
        return item.receipayType === "receive"
      })
      // data1[0].hasSpecialCellClassName = true // 用于开发示例
      let data2 = list.filter(item => {
        return item.receipayType === "pay"
      })
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
      this.getOrderProfit()
      this.computeMoneyTotalFront()
    },
    getDataSU(param = {}) {
      this.loading = true
      let prop = param && param.prop
      if (prop === 'serviceCode') { // 解决当初中途临时使用过serviceCode作为字段名产生的问题
        prop = 'serviceName'
      } else if (prop === 'blId') {
        prop = 'blIds' // blNo
      }
      let data = {
        "orderNo": this.useNo, // this.orderNo,
        "viewGroupType": "all", // "biz",
        "isException": "no",
        "columns": this.customColumnsKeys3,
        "ascColumns": param && param.order === 'ascending' ? [prop] : [],
        "descColumns": param && param.order === 'descending' ? [prop] : (param && param.order === 'ascending' ? [] : []), // 'createdTime'
        "currPage": 1,
        "pageSize": 1000,
        "receipayType": 'receive'
      }
      let data2 = Object.assign({}, data, { "receipayType": 'pay', "columns": this.customColumnsKeys4, "pageSize": 0 })
      Promise.all([orderFeeListByCorp(data), orderFeeListByCorp(data2)]).then(res => {
        this.loading = false
        if (res[0].code === 0) {
          this.processDataSU(res[0], 'receive', param.dataType)
        }
        if (res[1].code === 0) {
          this.processDataSU(res[1], 'pay', param.dataType)
        }
      }).catch(err => {
        this.loading = false
      }).finally(() => {
      })
    },
    processDataSU(res, receipayType, dataType) {
      let { configColumns } = res.data
      let columns = []
      if (receipayType === 'receive') {
        this.columns3 = configColumns.length > 0 ? configColumns : this.defaultColumnsSU
        this.columns3 = [...this.columns3]
        this.columns3 = [...new Set(this.columns3)]
        this.columns3 = this.columns3.filter(item => this.overseaDelColumns.every(one => one !== item))
        let arr1 = []
        this.columns3.forEach(value => {
          let obj = this.columnsBaseLocal.find(item => {
            return item.prop === value
          })
          if (obj) {
            if (obj.prop === 'feeAmt') { // 将业务费用的金额设置不可输入
              obj = Object.assign({}, obj, {
                type: 'text'
              })
            }
            arr1.push(obj)
          }
        })
        if (!this.isSort || this.sortType === 'option8') { // 点击option8的排序，重置option7的排序按钮
          this.option7.columns = arr1
        }
        // this.isSort = false // 现有两份数据处理，这里不能改变状态
      } else if (receipayType === 'pay') {
        this.columns4 = configColumns.length > 0 ? configColumns : this.defaultColumnsSU
        this.columns4 = [...this.columns4]
        this.columns4 = [...new Set(this.columns4)]
        this.columns4 = this.columns4.filter(item => this.overseaDelColumns.every(one => one !== item))
        let arr2 = []
        this.columns4.forEach(value => {
          let obj = this.columnsBaseLocal.find(item => {
            return item.prop === value
          })
          if (obj) {
            if (obj.prop === 'feeAmt') { // 将业务费用的金额设置不可输入
              obj = Object.assign({}, obj, {
                type: 'text'
              })
            }
            arr2.push(obj)
          }
        })
        if (!this.isSort || this.sortType === 'option7') {
          this.option8.columns = arr2
        }
        this.isSort = false
        return
      }
      let { list } = res.data
      let data1 = list.filter(item => {
        item.settleOrderNos_multiValue = item.settleOrderNos.split(',')
        item.writeoffNos_multiValue = item.writeoffNos.split(',')
        return item.receipayType === "receive"
      })
      let data2 = list.filter(item => {
        return item.receipayType === "pay"
      })
      if (dataType === 'receive') {
        this.option7.data = data1
      } else if (dataType === 'pay') {
        this.option8.data = data2
      } else {
        this.option7.data = data1
        this.option8.data = data2
      }
      this.multipleSelection7 = [] // 当一个option更新数据，另外一个有勾选数据，但被去掉勾选状态，因此采用在此重置的办法。背景色未有办法改变。
      this.multipleSelection8 = []
      // this.getOrderProfit()
      this.computeMoneyTotalFront({'receive': 'option7', 'pay': 'option8'})
    },
    handleCustomColumns3() {
			this.whichCustomColumns = 'customColumns3'
			this.configColumns = this.columns3.filter(value => {
				let obj = this.columnsBaseLocal.find(itemBase => {
					return itemBase.prop === value
        })
        if (obj) {
          return true
        } else {
          return false
        }
			})
			if (this.defaultColumnsSU) {
				this.selfColumnsBase = this.columnsBaseLocal.filter(item => {
					return this.defaultColumnsSU.some(subItem => {
						return subItem === item.prop
					})
				})
			}
			this.customColumnsPopShow = true
    },
    handleCustomColumns4() {
			this.whichCustomColumns = 'customColumns4'
			this.configColumns = this.columns4.filter(value => {
				let obj = this.columnsBaseLocal.find(itemBase => {
					return itemBase.prop === value
        })
        if (obj) {
          return true
        } else {
          return false
        }
			})
			if (this.defaultColumnsSU) {
				this.selfColumnsBase = this.columnsBaseLocal.filter(item => {
					return this.defaultColumnsSU.some(subItem => {
						return subItem === item.prop
					})
				})
			}
			this.customColumnsPopShow = true
    },
    getOrderNo() {
      this.orderNo = this.$route.query.orderNo
      this.jointNo = this.$route.query.jointNo
      this.useNo = this.jointNo ? this.jointNo : this.orderNo
      let businessBroad = this.$route.query.businessBroad
			businessBroad = businessBroad ? businessBroad : ''
			this.ship = businessBroad.includes('ship') || !businessBroad
			this.air = businessBroad.includes('air') ? true : false
			this.rail = businessBroad.includes('rail') ? true : false
    },
    switchMode() {
      if (this.mode === 'byFee') {
        this.mode = 'bySettleUnit'
        this.modeTip = this.$t('OrderFee.modeTip2')
        this.getDataSU()
      } else {
        this.mode = 'byFee'
        this.modeTip = this.$t('OrderFee.modeTip1')
        this.getData()
      }
      if (this.modeMemory) {
        let finLStorage = localStorage.getItem('finLStorage')
        finLStorage = finLStorage ? JSON.parse(finLStorage) : {}
        finLStorage.orderFeeMode = this.mode
        localStorage.setItem('finLStorage', JSON.stringify(finLStorage))
      }
    },
    checkFeeCompleted() {
      let data = {
        "orderNo": this.orderNo,
        "jointNo": this.jointNo
      }
      checkFeeCompleted(data).then(res => {
        let { isMatched, checkList } = res.data
        this.isMatched = isMatched
        let columns = [
          {
            prop: 'serviceName',
            label: i18n.t('OrderFee.serviceName'),
            type: 'text',
            width: 150
          },
          {
            prop: this.$lang === 'zh' ? 'feeName' : 'feeEnName',
            label: this.$lang === 'zh' ? i18n.t('OrderFee.feeName') : i18n.t('FeeList.feeEname'),
            type: 'text',
            width: 150,
          },
          {
            prop: 'recvpayWay',
            label: i18n.t('OrderFee.receipayType'), // '应收应付类型',
            type: 'select',
            propInDict: 'receipayType',
            width: 104
          },
          {
            prop: 'isMatched',
            label: i18n.t('OrderFee.isMatched'),
            type: 'select',
            formatter: ({cellValue}) => {
              if (cellValue === 'no') {
                return `<span style="color:#E63923;">${i18n.t('OrderFee.no')}</span>`
              } else {
                return i18n.t('OrderFee.yes')
              }
            },
            width: 120
          },
          {
            prop: 'comment',
            label: i18n.t('OrderFee.comment'),
            type: 'text',
            minWidth: 200
          }
        ]
        this.option6.columns = columns
        this.option6.data = checkList
      })
    },
    showFeeCompleted() {
      this.feeCompletedVisible = true
    },
    getOrderProfit() {
      let data = {
        "orderNo": this.useNo,
        "orderProfitToken": this.orderProfitToken
      }
      getOrderProfit(data).then(res => {
        if (res.code === 0) {
          this.orderProfit = res.data
          this.setProfitDetail(res.data.profitList)
          this.originalFeeDiff = res.data.originalFeeDiff
        }
      })
    },
    setProfitDetail(data) {
      let columns = [
        {
          prop: 'settleCompName',
          label: i18n.t('OrderFee.settleCompName'),
          type: 'text',
          width: 150,
        },
        {
          prop: 'mon',
          label: i18n.t('OrderFee.month'),
          type: 'text',
          width: 100,
        },
        {
          prop: 'cnyProfit',
          label: i18n.t('OrderFee.cny') + ' ' + i18n.t('OrderFee.grossProfit'), // '人民币毛利',
          type: 'text',
          width: 110,
        },
        {
          prop: 'usdProfit',
          label: i18n.t('OrderFee.usd') + ' ' + i18n.t('OrderFee.grossProfit'), // '美元毛利',
          type: 'text',
          width: 110,
        },
        {
          prop: 'grossProfit',
          label: i18n.t('OrderFee.grossMargin'), // '毛利率',
          type: 'text',
          width: 100,
          formatter: (row, pItem) => {return new LSnum(row[pItem.property]).times(100).toNum(2) + '%'}, // 此处用的是el-table
        }
      ]
      this.option4.columns = columns
      this.option4.data = data
    },
    queryHistFee() {
      if (!this.copyHistoryFeeForm.orderNo) return
      let value = this.copyHistoryFeeForm.orderNo.trim()
      this.autocompleteHistFee.change && this.autocompleteHistFee.change(value)
    },
    confirmCopyHistoryFee() {
      if (!this.multipleSelection3.length) {
        return this.$message({
          type: 'error',
          message: this.$t('OrderFee.selectRow'), // '须选择费用',
          showClose: true
        })
      }
      let list = [] // 正序显示
      this.multipleSelection3.forEach(item => {
        let { settleCorpName, settleCorpCode, feeName, feeCode, feeEnName, serviceName, serviceCode, receipayType, prepayType, feeAmt, feeUnit, unitPrice, unitCount, currency, taxRate } = item
        let feeItem = { settleCorpName, settleCorpCode, feeName, feeCode, feeEnName, serviceName, serviceCode, receipayType, prepayType, feeAmt, feeUnit, unitPrice, unitCount, currency, taxRate }
        list.unshift(feeItem)
      })
      this.copyHistoryFeeVisible = false
      if (this.copyHistoryFeeTitle.includes('应收') || this.copyHistoryFeeTitle.includes('Rec')) {
        list.forEach(item => {
          this.addReceive(item)
        })
      } else {
        list.forEach(item => {
          // this.getTaxRate(item) // 此处改成从历史费用里面带出来
          this.addPay(item)
        })
      }
    },
    addOpposite(from) {
      if (this.isFinCloseCombined) {
        this.$message({
          type: 'error',
          message: this.$t('OrderFee.closeAddFeeTip'), // '订单已关账，请通过调费申请来新增费用',
          showClose: true
        })
        return
      }
      if (from === 'receive') {
        if (!this.multipleSelection1.length) {
          return this.$message({
            type: 'error',
            message: this.$t('OrderFee.selectRow'), // '须先选择应收费用',
            showClose: true
          })
        }
        let list = [] // 正序显示
        this.multipleSelection1.forEach(item => {
          let { feeName, feeCode, feeEnName, serviceName, serviceCode, orderServices, prepayType, feeAmt, feeUnit, unitPrice, unitCount, currency } = item
          let settleCorpCode = this.bkgAgent ? this.bkgAgent.unitCode : ''
          let settleCorpName = this.bkgAgent ? this.bkgAgent.unitName : ''
          let feeItem = { feeName, feeCode, feeEnName, serviceName, serviceCode, orderServices, receipayType: 'pay', prepayType, feeAmt, feeUnit, unitPrice, unitCount, currency, settleCorpCode, settleCorpName }
          list.unshift(feeItem)
        })
        list.forEach(feeItem => {
          this.getTaxRate(feeItem)
          this.addPay(feeItem)
        })
      } else if (from === 'pay') {
        if (!this.multipleSelection2.length) {
          return this.$message({
            type: 'error',
            message: this.$t('OrderFee.selectRow'), // '须先选择应付费用',
            showClose: true
          })
        }
        let list = [] // 正序显示
        this.multipleSelection2.forEach(item => {
          let { feeName, feeCode, feeEnName, serviceName, serviceCode, orderServices, prepayType, feeAmt, feeUnit, unitPrice, unitCount, currency } = item
          let settleCorpCode = this.client ? this.client.unitCode : ''
          let settleCorpName = this.client ? this.client.unitName : ''
          let feeItem = { feeName, feeCode, feeEnName, serviceName, serviceCode, orderServices, receipayType: 'receive', prepayType, feeAmt, feeUnit, unitPrice, unitCount, currency, settleCorpCode, settleCorpName }
          list.unshift(feeItem)
        })
        list.forEach(feeItem => {
          this.addReceive(feeItem)
        })
      }
    },
    copyHistoryFeeBefore(type) {
      if (this.isFinCloseCombined) {
        this.$message({
          type: 'error',
          message: this.$t('OrderFee.closeAddFeeTip'), // '订单已关账，请通过调费申请来新增费用',
          showClose: true
        })
        return
      }
      if (type === 'receive') {
        this.copyHistoryFeeTitle = this.$t('OrderFee.copy') + this.$t('OrderFee.enspace') + this.$t('OrderFee.receive') // '复制应收费用'
        this.historyFeeTitle = this.$t('OrderFee.receive')
      } else if (type === 'pay') {
        this.copyHistoryFeeTitle = this.$t('OrderFee.copy') + this.$t('OrderFee.enspace') + this.$t('OrderFee.pay') // '复制应付费用'
        this.historyFeeTitle = this.$t('OrderFee.pay')
      }
      this.copyHistoryFeeForm.receipayType = type
      this.copyHistoryFeeVisible = true
    },
    validateLateFeeAmt(rule, value, callback) {
      setTimeout(() => {
        if (!/^\d*\.*\d*$/.test(value)) {
          callback(new Error(' '));
        } else {
          callback();
        }
      }, 600);
    },
    getTaxRate(row) {
      let data = {
        "feeCode": row.feeCode,
        "receipayType": "pay",
        "serviceCode": row.serviceCode,
        "orderNo": this.orderNo
      }
      getTaxRate(data).then(res => {
        if (res.code === 0) {
          let taxRate = res.data && res.data.taxRate
          this.$set(row, 'taxRate', taxRate ? taxRate+'' : 0) // this.$set(row, 'taxRate', (taxRate || taxRate === 0) ? taxRate+'' : '')
        }
      }).catch(err => {
        console.log(err)
      })
    },
    sortChange(column, prop, order, option) {
      if (this.isEditRecei || this.isEditPay) { // (option.id === 'option1' && this.isEditRecei) || (option.id === 'option2' && this.isEditPay)
        this.$message({
          type: 'error',
          message: this.$t('OrderFee.saveFirst'), // '请先保存数据',
          showClose: true
        })
        return
      }
      this.isSort = true
      this.sortType = option.id
      this.getData({prop, order})
    },
    showColumnDetail(param) {
      this.showColumnDetailHandle(param, { isTab: true, from: 'OrderFee' })
    },
    precloseByBill() {
      // 【铁路】订舱状态的维护增加限制 订舱状态为“已发车”状态，才允许预关账 v20220707
       if (this.$route.query.businessBroad==='rail' && this.orderInfo.rail && !['RAIL_ARRIVAL','RAIL_DRIVING'].includes(this.orderInfo.rail.bkgStatus)) {        
        return this.$message({
          type: 'error',
          message: this.$t('OrderFee.copy'), // '订舱状态为已发车或已到站，才允许预关账',
          showClose: true
        })
      }  
      if (this.orderProfit.totalCnyProfit < 0 && this.originalFeeDiff.some(item=>item.diffAmt !== 0)) {
        return this.$message({
          type: 'error',
          message: this.$t('OrderFee.negCloseMsg'), // '订单毛利为负，请申请负利润关账',
          showClose: true
        })
      }
      this.$confirm(this.$t('OrderFee.confirmTip') + this.$t('OrderFee.preclose') + '?', this.$t('OrderFee.tip'), { // '是否确认预关账？', this.$t('Common.tips')
        confirmButtonText: this.$t('OrderFee.confirm'),
        cancelButtonText: this.$t('OrderFee.cancel'),
        type: 'warning'
      }).then(() => {
        this.precloseDisable = true
        let data = {
          orderNo: this.useNo
        }
        finCloseApi.precloseByBill(data).then(res => {
          if (res.code === 0) {
            this.$message({
              type: 'success',
              message: this.$t('OrderFee.successOp'), // '预关账提交成功',
              showClose: true
            })
            this.getData()
          }
        }).catch(err => {
        }).finally(() => {
          this.$emit('get-order-close-info')
          this.precloseDisable = false
        })
      }).catch(() => {
      })
    },
    receiLoss() {
      let multipleSelection = this.multipleSelection1.concat(this.multipleSelection2)
      if (multipleSelection.length) {
        let routeUrl = this.$router.resolve({
          name: 'SettleOrderBadApply',
          query: { from: 'orderFee', source: 'create', feeIds: multipleSelection.map(item => item.feeId).join(',') }
        })
        window.open(routeUrl.href, '_blank')
      } else {
        let routeUrl = this.$router.resolve({
          name: 'ReceiLossFeeQuery',
          query: { from: 'orderFee', source: 'create' }
        })
        window.open(routeUrl.href, '_blank')
      }
    },
    // 批量申请
    multiApply() {
      this.initDialog(true)
    },
    // 初始化弹框
    initDialog(multi) {
      this.dialogShow = true
      this.$nextTick(() => {
        this.$refs.lossForm.resetFields()
      })
    },
    // 弹框内确定按钮
    sure() {
      this.$refs.lossForm.validate((res) => {
        if (res) {
          let f = this.orderCloseInfo.prefinCloseFailList.find(item => {
            return (item.errorType || '').toUpperCase() === 'PROFIT_LOSS'
          })
          this.lossForm.preclosingIds = [] // [f.finPreclosingId]
          this.lossForm.orderNo = this.useNo // 20220607增加，要申请关闭的单号，如果preclosingIds为空时，需要填写单号
          this.losscloseDisable = true
          API.precloseApply({ ...this.lossForm })
            .then((res) => {
              this.getData()
              this.dialogShow = false
              this.$msgSucClose(this.$t('OrderFee.successOp')) // '提交成功！'
            })
            .finally(() => (this.losscloseDisable = false))
        }
      })
    },
    handleCommandTemp(command) {
      if (command === 'import') {
        this.alertTemplate()
      } else if (command === 'save') {
        this.openSaveTemplate()
      }
    },
    openSaveTemplate() {
      if (this.multipleSelection1.length === 0 && this.multipleSelection2.length === 0) {
        this.$message({
          type: 'error',
          message: this.$t('OrderFee.selectRow'), // '请先选择费用！',
          showClose: true
        })
        return
      }
      let bool = this.multipleSelection1.concat(this.multipleSelection2).some(item => {
        return !item.orderFeeId || item.edit
      })
      if (bool) {
        this.$message({
          type: 'error',
          message: this.$t('OrderFee.unSaveFeeSaveTemp'), // '未保存的费用，不能另存模板！',
          showClose: true
        })
        return
      }
      let isBizAll = this.multipleSelection1.concat(this.multipleSelection2).every(item => {
        return item.viewGroupType === 'biz'
      })
      if (!isBizAll) {
        this.$message({
          type: 'error',
          message: this.$t('OrderFee.specialMngNotTempInBiz'), // '专项类、管理类费用不能在本页面另存模板！',
          showClose: true
        })
        return
      }
      this.feeTemplateVisible = true
    },
    saveTemplate() {
      this.$refs.feeTemplateForm.validate(valid => {
        if (valid) {
          let orderFeeIds = []
          this.multipleSelection1.forEach(item => {
            orderFeeIds.push(item.orderFeeId)
          })
          this.multipleSelection2.forEach(item => {
            orderFeeIds.push(item.orderFeeId)
          })
          let data = {
            "orderNo": this.useNo, // this.orderNo,
            "name": this.feeTemplateForm.feeTemplateName,
            orderFeeIds,
            "tempType": "biz"
          }
          saveAsTemplate(data).then(res => {
            if (res.code === 0) {
              this.$message({
                type: 'success',
                message: this.$t('OrderFee.successOp'), // '另存模板成功!',
                showClose: true
              })
              // this.fetchTemplate()
              this.feeTemplateVisible = false
            }
          })
        }
      })
    },
    fetchTemplate() {
      let data = {
        "tempType": "biz",
        // "businessType":"", // 可不加
      }
      // myTemplate(data).then(res => {
      usableFeeTemplate(data).then(res => {
        if (res.code === 0) {
          this.myTemplateList = res.data
        }
      })
    },
    confirmFeeTemplate() {
      this.$refs.usableFeeTemplate.confirmFeeTemplate()
    },
    setFeeTemplate(data) {
      this.templateListVisible = false
      let param = null
      if (data[0].tempNo) {
        param = data[0].tempNo
      } else {
        param = data
      }
      // let tempNo = data[0].tempNo
      this.handleCommand(param) // tempNo
    },
    alertTemplate() {
      this.templateListVisible = true // 不管有否，都显示
    },
    deleteTemplate(feeTempId) {
      this.$confirm(this.$t('OrderFee.confirmTip') + this.$t('OrderFee.deleteTemp') + '?', this.$t('OrderFee.tip'), { // '是否确认删除模板？', this.$t('Common.tips')
        confirmButtonText: this.$t('OrderFee.confirm'),
        cancelButtonText: this.$t('OrderFee.cancel'),
        type: 'warning'
      }).then(() => {
        let data = {
          feeTempId
        }
        deleteTemplate(data).then(res => {
          if (res.code === 0) {
            this.myTemplateList = this.myTemplateList.filter(item => {
              return item.feeTempId !== feeTempId
            })
            this.$message({
              type: 'success',
              message: this.$t('OrderFee.successOp'), // '删除成功！',
              showClose: true
            })
          }
        })
      }).catch(() => {         
      })
    },
    handleCommand(command) {
      if (typeof command === 'string') {
        this.$store.dispatch('dict/queryBusinessServiceList', {}).then(data => {
        })
        let data = { 
          // "feeTempId": command
          tempNo: command,
          orderNo: this.useNo
        }
        // getTemplateFee(data).then(res => {
        getTemplateItem(data).then(res => {
          if (res.code === 0) {
            this.handleTemplateItem(res.data)
            if (res.data && res.data.length === 0) {
              this.$message({
                message: this.$t('OrderFee.tempNoFeeNotImport'), // '该模板无数据，无法导入费用！',
                type: 'error',
                showClose: true
              })
            }
            this.templateListVisible = false
          }
        })
      } else {
        this.handleTemplateItem(command)
      }
    },
    handleTemplateItem(data) {
      data.forEach(item => {
        let feeItemList = []
        this.queryFeeItemList({ orderNo: this.useNo, receipayType: item.receipayType, queryString: '', size: 10000, operation: 'add' }).then(data => { // orderNo: this.$store.state.finance.orderNo, businessType: this.dictMap['orderFeeBusinessType'], serviceCode: item.serviceCode,
          feeItemList = data
          let find = feeItemList.find(fee => {
            return fee.feeCode === item.feeCode
          })
          if (find) {
            item.orderServices = find.orderServices
            if (item.orderServices && item.orderServices.length) {
              if (item.orderServices.some(s => {
                if (s.serviceCode === item.serviceCode) {
                  item.serviceName = this.$lang === 'zh' ? s.serviceName : s.serviceEname
                }
                return s.serviceCode === item.serviceCode
              })) {
              } else if (item.orderServices.length === 1) {
                item.serviceCode = item.orderServices[0].serviceCode
                item.serviceName = this.$lang === 'zh' ? item.orderServices[0].serviceName : item.orderServices[0].serviceEname
              } else {
                item.serviceCode = ''
                item.serviceName = ''
              }
            } else {
              item.serviceCode = ''
              item.serviceName = ''
            }
          }
        })
        this.setUnitCount(item, this.containerCount)
        if (item.receipayType === 'receive') {
          this.addReceive(item)
        } else if (item.receipayType === 'pay') {
          this.addPay(item)
        }
      })
    },
    createSettlement() {
      let multipleSelection = []
      if (this.mode === 'byFee') {
        multipleSelection = this.multipleSelection1.concat(this.multipleSelection2)
      } else {
        multipleSelection = this.multipleSelection7.concat(this.multipleSelection8)
      }
      if (multipleSelection.length === 0) { // this.multipleSelection1.length === 0 && this.multipleSelection2.length === 0
        return this.$message({
          message: this.$t('OrderFee.selectRow'), // '请勾选需要生成结算单的费用！',
          type: 'error',
          showClose: true
        })
      }
      let hasAgent = multipleSelection.some(item => {
        return item.agentCompName && item.agentCompName !== ''
      })
      if (this.mode === 'byFee' && hasAgent) {
        let bool = multipleSelection.some(item => {
          return item.agentCompName === ''
        })
        if (bool) {
          this.$message({
            message: this.$t('OrderFee.agentNoneAgentSameSettle'), // '代收付费用不允许跟非代收付费用在同一个结算单！',
            type: 'error',
            showClose: true
          })
          return
        }
        let agentCompName = multipleSelection[0].agentCompName
        bool = multipleSelection.some(item => {
          return item.agentCompName !== agentCompName
        })
        if (bool) {
          this.$message({
            message: '！',
            type: 'error',
            showClose: true
          })
          return
        }
        let bool1 = multipleSelection.some(item => {
          return item.receipayType === 'receive'
        })
        let bool2 = multipleSelection.some(item => {
          return item.receipayType === 'pay'
        })
        if (bool1 && bool2) {
          this.$message({
            message: this.$t('OrderFee.rAndPFeesNotAgent'),
            type: 'error',
            showClose: true
          })
          return
        }
      }
      // let feeIds1 = this.multipleSelection1.map(item => {
      //   return item.feeId
      // })
      // let feeIds2 = this.multipleSelection2.map(item => {
      //   return item.feeId
      // })
      let feeIds = []
      let feeSourceType = ''
      if (this.mode === 'byFee') {
        feeIds = multipleSelection.map(item => {
          return item.feeId
        })
      } else {
        feeIds = multipleSelection.map(item => {
          return item.feeIds.split(',')
        }).reduce((prev, curr) => {
          return prev.concat(curr)
        }, [])
        feeSourceType = 'group'
      }
      let routeUrl = this.$router.resolve({
        name: 'CreateSettlement',
        query: {
          source: 'createSettlementFromOrderFeeIds',
          feeIds: JSON.stringify(feeIds), // JSON.stringify(feeIds1.concat(feeIds2)),
          feeSourceType,
          orderNo: this.orderNo,
          newWdo: true
        }
      })
      window.open(routeUrl.href, '_blank')
    },
    handleKeyup(evt, option) {
      if (evt.key === 'Enter') {
        if (option.id === 'option1') {
          this.addReceive()
        } else if (option.id === 'option2') {
          this.addPay()
        }
      }
    },
    modifySettleUnit() {
      if (this.multipleSelection1.length === 0 && this.multipleSelection2.length === 0) {
        this.$message({
          type: 'error',
          message: this.$t('OrderFee.selectRow'), // '请选择费用',
          showClose: true
        })
        return
      }
      if (this.multipleSelection1.length > 0 && this.multipleSelection2.length > 0) {
        this.$message({
          type: 'error',
          message: this.$t('OrderFee.rAndPUnitNotModify'),
          showClose: true
        })
        return
      }
      if ((this.multipleSelection1.length > 0 && this.multipleSelection1.some(item => item.edit)) || (this.multipleSelection2.length > 0 && this.multipleSelection2.some(item => item.edit))) {
        this.$message({
          type: 'error',
          message: this.$t('OrderFee.saveFirst'),
          showClose: true
        })
        return
      }
      if (this.isFinCloseCombined) {
        this.settleUnitCommentRules = {required: true, message: ' ', trigger: 'blur'}
      } else {
        this.settleUnitCommentRules = {}
      }
      this.settleUnitVisible = true
    },
    saveSettleUnit() {
      this.$refs.settleUnitForm.validate(valid => {
        if (valid) {
          let orderFeeIds = []
          if (this.multipleSelection1.length) {
            this.multipleSelection1.forEach(item => {
              orderFeeIds.push(item.orderFeeId)
            })
          } else if (this.multipleSelection2.length) {
            this.multipleSelection2.forEach(item => {
              orderFeeIds.push(item.orderFeeId)
            })
          }
          let data = {
            "orderNo": this.useNo, // this.orderNo,
            "jointNo": this.jointNo,
            "settleCorpCode": this.settleUnitForm.settleCorpCode,
            "orderFeeIds": orderFeeIds,
            "comment": this.settleUnitForm.comment,
            "applyPersonId": this.settleUnitForm.applyPersonId
          }
          batchModifySettleUnit(data).then(res => {
            let str = ''
            if (this.isFinCloseCombined) {
              str = this.$t('OrderFee.adjustmentGenerated')
            } else {
              str = this.$t('OrderFee.successOp')
            }
            this.$message({
              message: str,
              type: 'success',
              showClose: true
            })
            this.getData()
            this.settleUnitVisible = false
          })
        }
      })
    },
    employeeSelectlistLocal(queryString) {
      if (!this.isFinBillFee) {
        let data = {
          "orderNo": this.orderNo,
          "jointNo": this.jointNo
        }
        feeAdjustRoleJobList(data).then(res => {
          let ids = res.data.map(item => item.employeeId)
          ids = [...new Set(ids)]
          this.employeeSelectOptions = ids.map(id => {
            let item = res.data.find(one => one.employeeId === id)
            return {
              label: item.employeeName,
              value: item.employeeId,
              jobCode: item.jobCode
            }
          })
        })
      } else {
        let data = {
          "state": "valid",
          "name": queryString
        }
        this.$store.dispatch('dict/employeeSelectlist', data).then(data => {
          this.employeeSelectOptions = data.map(item => {
            return {
              label: item.value,
              value: item.key
            }
          })
        })
      }
    },
    personChangeLocal(applyPersonId){
      if(!applyPersonId){
        this.settleUnitForm.auditPerson = this.settleUnitForm.auditPersonMain = ''
        return
      }
      return // 审核人功能不需要
      let adjustType = this.isSpecialFee ? 'client_spec' : 'preclose'
      getAdjustAuditEmployee({orderNo: this.jointNo || this.orderNo, applyPersonId, adjustType: 'preclose' }).then(res => {
        let {auditEmployee, mainOrderAuditEmplyee} = res.data
        this.settleUnitForm.auditPerson = auditEmployee.cname
        this.settleUnitForm.auditPersonMain = mainOrderAuditEmplyee?.cname
      }).catch(e => {
        this.settleUnitForm.auditPerson = this.settleUnitForm.auditPersonMain = ''
        // this.settleUnitForm.auditPerson = 'test-'
      })
    },
    updateTaxRate() {
      if (this.multipleSelection1.length === 0 && this.multipleSelection2.length === 0) {
        return this.$message({
          type: 'error',
          message: this.$t('OrderFee.selectRow'), // '须选择费用！',
          showClose: true
        })
      }
      this.taxRateVisible = true
    },
    saveTaxRate() {
      if (!this.taxRateForm.taxRate) {
        return this.$message({
          type: 'error',
          message: this.$t('OrderFee.plsSelect'),
          showClose: true
        })
      }
      if (!/^\d*\.*\d*$/.test(this.taxRateForm.taxRate)) {
        return this.$message({
          type: 'error',
          message: this.$t('OrderFee.inputDecimal'),
          showClose: true
        })
      }
      let data = {
        "orderFeeIds": this.multipleSelection1.concat(this.multipleSelection2).map(item => {
          return item.orderFeeId
        }),
        "taxRate": this.taxRateForm.taxRate
      }
      updateOrderFeeTaxRate(data).then(res => {
        this.$message({
          type: 'success',
          message: this.$t('OrderFee.successOp'),
          showClose: true
        })
        this.getData()
        this.taxRateVisible = false
      })
    },
    handleCommandInvoice(val) {
      this.confirmIssueInvoice(val)
    },
    // 此功能不需要
    confirmIssueInvoice(val) {
      if (this.multipleSelection1.length === 0 && this.multipleSelection2.length === 0) {
        this.$message({
          type: 'error',
          message: '须选择费用！',
          showClose: true
        })
        return
      }
      let orderFeeIds = []
      this.multipleSelection1.forEach(item => {
        orderFeeIds.push(item.orderFeeId)
      })
      this.multipleSelection2.forEach(item => {
        orderFeeIds.push(item.orderFeeId)
      })
      let data = {
        "orderNo": this.useNo, // this.orderNo,
        "isIssueInvoice": val,
        orderFeeIds
      }
      confirmOrderFeeInvoiceStatus(data).then(res => {
        if (res.code === 0) {
          if (res.data.allFinish) {
            this.$message({
              message: `确认${val === 'yes' ? '开票' : '不开票'}成功！`,
              type: 'success',
              showClose: true
            })
          } else {
            this.$message({
              message: `确认${val === 'yes' ? '开票' : '不开票'}成功，已过滤不可开票费用！`,
              type: 'success',
              showClose: true
            })
          }
          this.getData()
        }
      })
    },
    openModifyFeeDialog() {
      if (!this.isFinCloseCombined) {
        this.$message({
          type: 'error',
          message: this.$t('OrderFee.notClosedNotAdjust'),
          showClose: true
        })
        return
      }
      this.multipleSelection = this.multipleSelection1.concat(this.multipleSelection2)
      let someSpecOrMng = this.multipleSelection.some(item => {
        return item.viewGroupType === 'special'
      })
      let someSpecOrMngMsg = this.$t('OrderFee.specialAdjustOnSelf')
      if (someSpecOrMng) {
        return this.$message({
          message: `${someSpecOrMngMsg}`,
          type: 'error',
          showClose: true
        })
      }
      // this.loading = true
      // setTimeout(() => {
      //   this.loading = false
      // }, 1200)
      // setTimeout(() => {
      //   this.modifyFeeVisible.show = true
      // }, 200)
      let modifyFeeProps = {
        multipleSelection: this.multipleSelection,
        dialogVisible: this.modifyFeeVisible,
        isBusinessFee: true,
        airCargoStates: this.airCargoStates,
        containerCount: this.containerCount,
        blList: this.blList,
        bkgAgent: this.bkgAgent,
        client: this.client,
        tempType: 'biz',
        businessType: this.businessType,
        orderNo: this.orderNo,
        jointNo: this.jointNo,
        businessBroad: this.$route.query.businessBroad || this.businessType2
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
    addOrderLateFee() {
      this.lateFeeVisible = true
    },
    serviceChange(val) {
      let f = this.servicesOfAFee.find(item => item.value === val)
      this.lateFeeForm.serviceName = f && f.label
    },
    saveLateFee() {
      this.$refs.lateFeeForm.validate(valid => {
        if (valid) {
          let data = Object.assign({}, this.lateFeeForm, {
            "orderNo": this.orderNo,
            "jointNo": this.jointNo,
          })
          saveOrderLateFee(data).then(res => {
            if (res.code === 0) {
              this.$message({
                message: this.$t('OrderFee.successOp'),
                type: 'success',
                showClose: true
              })
              this.getData()
              this.lateFeeVisible = false
            }
          })
        }
      })
    },
    savePerformance() {
      localStorage.setItem('performanceNum', this.performanceNum)
      this.performanceVisible = false
      this.loading = true
      location.reload()
    },
    confirmOrderFeePrev(receipayType) {
      if (receipayType === 'receive') {
        if (this.isEditRecei) {
          this.$message({
            message: this.$t('OrderFee.saveFirst'), // '请先保存费用，再进行操作！',
            type: 'error',
            showClose: true
          })
          return
        }
        if (this.option1.data && this.option1.data.length === 0) {
          this.$message({
            message: this.$t('OrderFee.noData'), // '无费用可确认！',
            type: 'error',
            showClose: true
          })
          return
        }
        if (this.multipleSelection1.length === 0) {
          return this.$message({
            message: this.$t('OrderFee.selectRow'),
            type: 'error',
            showClose: true
          })
          // this.$confirm('是否确认全部应收？', this.$t('Common.tips'), {
          //   confirmButtonText: this.$t('Common.sure'),
          //   cancelButtonText: this.$t('Common.cancel'),
          //   type: 'warning'
          // }).then(() => {
          //   this.confirmOrderFee(receipayType, true)
          // }).catch(() => {         
          // })
        } else {
          this.confirmOrderFee(receipayType, false)
        }
      } else if (receipayType === 'pay') {
        if (this.isEditPay) {
          this.$message({
            message: this.$t('OrderFee.saveFirst'), // '请先保存费用，再进行操作！',
            type: 'error',
            showClose: true
          })
          return
        }
        if (this.option2.data && this.option2.data.length === 0) {
          this.$message({
            message: this.$t('OrderFee.noData'), // '无费用可确认！',
            type: 'error',
            showClose: true
          })
          return
        }
        if (this.multipleSelection2.length === 0) {
          return this.$message({
            message: this.$t('OrderFee.selectRow'),
            type: 'error',
            showClose: true
          })
          // this.$confirm('是否确认全部应付？', this.$t('Common.tips'), {
          //   confirmButtonText: this.$t('Common.sure'),
          //   cancelButtonText: this.$t('Common.cancel'),
          //   type: 'warning'
          // }).then(() => {
          //   this.confirmOrderFee(receipayType, true)
          // }).catch(() => {         
          // })
        } else {
          this.confirmOrderFee(receipayType, false)
        }
      }
    },
    confirmOrderFee(receipayType, noSelect) {
      let orderFeeIds = []
      if (receipayType === 'receive') {
        if (noSelect) {
          this.option1.data.forEach(item => {
            orderFeeIds.push(item.orderFeeId)
          })
        } else {
          this.multipleSelection1.forEach(item => {
            orderFeeIds.push(item.orderFeeId)
          })
        }
      } else if (receipayType === 'pay') {
        if (noSelect) {
          this.option2.data.forEach(item => {
            orderFeeIds.push(item.orderFeeId)
          })
        } else {
          this.multipleSelection2.forEach(item => {
            orderFeeIds.push(item.orderFeeId)
          })
        }
      }
      let data = { 
        "orderNo": this.useNo, // this.orderNo,
        "payOrReceive": receipayType,
        orderFeeIds
      }
      confirmOrderFee(data).then(res => {
        if (res.code === 0) {
          this.$message({
            message: this.$t('OrderFee.successOp'), // `确认${receipayType === 'receive' ? '应收' : '应付'}成功！`,
            type: 'success',
            showClose: true
          })
          this.getData()
        }
      })
    },
    cancleConfirmOrderFeePrev(receipayType) {
      if (receipayType === 'receive') {
        if (this.isEditRecei) {
          this.$message({
            message: this.$t('OrderFee.saveFirst'), // '请先保存费用，再进行操作！',
            type: 'error',
            showClose: true
          })
          return
        }
        if (this.option1.data && this.option1.data.length === 0) {
          this.$message({
            message: this.$t('OrderFee.noData'), // '无费用可撤销确认！',
            type: 'error',
            showClose: true
          })
          return
        }
        if (this.multipleSelection1.length === 0) {
          return this.$message({
            message: this.$t('OrderFee.selectRow'), // '请选择需要撤销确认的费用！',
            type: 'error',
            showClose: true
          })
        } else {
          let feesConfirm = this.multipleSelection1.filter(item => {
            return item.confirmStatus === 'yes'
          })
          if (!feesConfirm.length) {
            return this.$message({
              message: this.$t('OrderFee.noConfirmNotCancel'),
              type: 'error',
              showClose: true
            })
          }
          let feesNotEnterFin = feesConfirm.filter(item => {
            return item.precloseStatus !== 'yes' && item.closeStatus !== 'yes' && item.settleLock !== 'lock' && item.finUseStatus !== 'yes'
          })
          if (!feesNotEnterFin.length) {
            return this.$message({
              message: this.$t('OrderFee.feesEnterFinNotCancel'), // '费用已进入结算或已关账，不能撤销确认',
              type: 'error',
              showClose: true
            })
          }
          this.$confirm(this.$t('OrderFee.confirmTip') + this.$t('OrderFee.cancelConfirm2') + '?', this.$t('OrderFee.tip'), { // '是否确认撤销该费用？', this.$t('Common.tips')
            confirmButtonText: this.$t('OrderFee.confirm'),
            cancelButtonText: this.$t('OrderFee.cancel'),
            type: 'warning'
          }).then(() => {
            this.cancleConfirmOrderFee(receipayType, feesNotEnterFin)
          }).catch(() => {         
          })
        }
      } else if (receipayType === 'pay') {
        if (this.isEditPay) {
          this.$message({
            message: this.$t('OrderFee.saveFirst'), // '请先保存费用，再进行操作！',
            type: 'error',
            showClose: true
          })
          return
        }
        if (this.option2.data && this.option2.data.length === 0) {
          this.$message({
            message: this.$t('OrderFee.noData'), // '无费用可撤销确认！',
            type: 'error',
            showClose: true
          })
          return
        }
        if (this.multipleSelection2.length === 0) {
          return this.$message({
            message: this.$t('OrderFee.selectRow'), // '请选择需要撤销确认的费用！',
            type: 'error',
            showClose: true
          })
        } else {
          let feesConfirm = this.multipleSelection2.filter(item => {
            return item.confirmStatus === 'yes'
          })
          if (!feesConfirm.length) {
            return this.$message({
              message: this.$t('OrderFee.noConfirmNotCancel'),
              type: 'error',
              showClose: true
            })
          }
          let feesNotEnterFin = feesConfirm.filter(item => {
            return item.precloseStatus !== 'yes' && item.closeStatus !== 'yes' && item.settleLock !== 'lock' && item.finUseStatus !== 'yes'
          })
          if (!feesNotEnterFin.length) {
            return this.$message({
              message: this.$t('OrderFee.feesEnterFinNotCancel'), // '费用已进入结算或已关账，不能撤销确认',
              type: 'error',
              showClose: true
            })
          }
          this.$confirm(this.$t('OrderFee.confirmTip') + this.$t('OrderFee.cancelConfirm2') + '?', this.$t('OrderFee.tip'), { // '是否确认撤销该费用？', this.$t('Common.tips')
            confirmButtonText: this.$t('OrderFee.confirm'),
            cancelButtonText: this.$t('OrderFee.cancel'),
            type: 'warning'
          }).then(() => {
            this.cancleConfirmOrderFee(receipayType, feesNotEnterFin)
          }).catch(() => {         
          })
        }
      }
    },
    cancleConfirmOrderFee(receipayType, fees) {
      let orderFeeIds = []
      if (receipayType === 'receive') {
        fees.forEach(item => {
          orderFeeIds.push(item.orderFeeId)
        })
      } else if (receipayType === 'pay') {
        fees.forEach(item => {
          orderFeeIds.push(item.orderFeeId)
        })
      }
      let data = { 
        orderNo: this.useNo, // this.orderNo,
        payOrReceive: receipayType,
        orderFeeIds
      }
      cancleConfirmOrderFee(data).then(res => {
        if (res.code === 0) {
          this.$message({
            message: this.$t('OrderFee.successOp'), // '撤销成功！',
            type: 'success',
            showClose: true
          })
          this.getData()
        }
      })
    },
    handleCommandAgent(val) {
      if (val === 'yes') {
        this.openAgentReceipayDialog()
      } else if (val === 'no') {
        this.cancelAgentCompany()
      }
    },
    openAgentReceipayDialog() {
      if (this.multipleSelection1.length === 0 && this.multipleSelection2.length === 0) {
        this.$message({
          message: this.$t('OrderFee.selectRow'), // '请选择需要代收付的费用！',
          type: 'error',
          showClose: true
        })
        return
      } else if (this.multipleSelection1.length > 0 && this.multipleSelection2.length > 0) {
        this.$message({
          message: this.$t('OrderFee.rAndPFeesNotAgent'),
          type: 'error',
          showClose: true
        })
        return
      } else {
        let multipleSelection = this.multipleSelection1.concat(this.multipleSelection2)
        let txt = ''
        let bool = multipleSelection.some(item => {
          txt = this.$t('OrderFee.feeSettled')
          return item.settleStatus === 'finish'
        })
        bool = bool || multipleSelection.some(item => {
          txt = this.$t('OrderFee.feeInvoiced')
          return item.invoiceStatus === 'finish' || item.invoiceStatus === 'part_finish'
        })
        bool = bool || multipleSelection.some(item => {
          txt = this.$t('OrderFee.feeLocked')
          return item.settleLock === 'lock'
        })
        if (bool) {
          this.$message({
            message: `${txt}${this.$t('OrderFee.cannotAgent')}`,
            type: 'error',
            showClose: true
          })
          return
        }
      }
      this.agentReceipayVisible = true
    },
    setAgentCompany() {
      this.$refs.agentForm.validate(valid => {
        if (valid) {
          let data = {
            "orderNo": this.useNo, // this.orderNo,
            "agentCompCode": this.agentForm.agentCompCode,
            "orderFeeIds": this.multipleSelection1.concat(this.multipleSelection2).map(item => {
              return item.orderFeeId
            })
          }
          setAgentCompany(data).then(res => {
            if (res.code === 0) {
              this.agentReceipayVisible = false
              this.$message({
                message: this.$t('OrderFee.successOp'), // '费用代收付成功！',
                type: 'success',
                showClose: true
              })
              this.getData()
            }
          }).catch(err => {
          })
        }
      })
    },
    cancelAgentCompany() {
      if (this.multipleSelection1.length === 0 && this.multipleSelection2.length === 0) {
        this.$message({
          message: this.$t('OrderFee.selectRow'), // '请选择需要撤销代收付的费用！',
          type: 'error',
          showClose: true
        })
        return
      } else {
        let multipleSelection = this.multipleSelection1.concat(this.multipleSelection2)
        let bool = multipleSelection.some(item => {
          return item.agentCompName === ''
        })
        if (bool) {
          this.$message({
            message: this.$t('OrderFee.needNotAgent'),
            type: 'error',
            showClose: true
          })
          return
        }
      }
      this.$confirm(this.$t('OrderFee.confirmTip') + this.$t('OrderFee.cancelAgentCompany2') + '?', this.$t('OrderFee.tip'), { // '是否确认将选中的费用进行撤销代收付？', this.$t('Common.tips')
        confirmButtonText: this.$t('OrderFee.confirm'),
        cancelButtonText: this.$t('OrderFee.cancel'),
        type: 'warning'
      }).then(() => {
        let data = {
          "orderNo": this.useNo, // this.orderNo,
          "orderFeeIds": this.multipleSelection1.concat(this.multipleSelection2).map(item => {
            return item.orderFeeId
          })
        }
        cancelAgentCompany(data).then(res => {
          if (res.code === 0) {
            this.$message({
              message: this.$t('OrderFee.successOp'), // '撤销费用代收付成功！',
              type: 'success',
              showClose: true
            })
            this.getData()
          }
        }).catch(err => {
        })
      }).catch(() => {
      })
    },
    sendMulti(data, option) {
      // console.log(data, option.data)
      if (option === this.option1) this.multipleSelection1 = data
      if (option === this.option2) this.multipleSelection2 = data
      if (option === this.option3) this.multipleSelection3 = data
      if (option === this.option7) this.multipleSelection7 = data
      if (option === this.option8) this.multipleSelection8 = data
      // 当处于总的编辑状态下
      if ((option.id === 'option1' && this.isEditRecei) || (option.id === 'option2' && this.isEditPay)) {
        // 改成按点击来判断，不按勾选来判断
        option.data.forEach(item => {
          if (item.edit && item.$isRowClick && !item.isAddFee) { // 如果费用处于编辑状态，点击行，退出编辑，使费用重置回原来的数据
            let tableDataBackup = option.id === 'option1' ? this.table1DataBackup : this.table2DataBackup
            let rowBackup = tableDataBackup.find(row => {
              return row.feeId === item.feeId
            })
            if (rowBackup) {
              item = Object.assign(item, rowBackup)
            }
            this.$set(item, 'edit', false)
          } else if (item.canEdit && item.$isRowClick && !item.$isRowDelete) { // 如果点击的费用是可编辑的且没有正在删除，使其处于可编辑状态
            this.$set(item, 'edit', true)
            this.$set(option, 'edit', true) // 将option的edit置为可编辑，因如果编辑option1，option2没编辑，此时点击option2的费用不起作用
            this.preVerifyNeedBl(item)
          } else if (item.$isRowClick && item.$isRowDelete) { // 点击删除中的费用，去除删除状态
            this.$set(item, '$isRowDelete', false)
          }
        })
      }
      if (option === this.option7 || option === this.option8) {
        this.computeMoneyTotalFront({'receive': 'option7', 'pay': 'option8'})
      } else {
        this.computeMoneyTotalFront()
      }
    },
    handleEdit(type) {
      if (this.isFinCloseCombined) {
        this.$message({
          type: 'error',
          message: this.$t('OrderFee.closeNotModifyFee'),
          showClose: true
        })
        return
      }
      // let isNoCheck = true
      if (type === 'receive') {
        // 改为显示可修改的费用
        if (this.multipleSelection1.length === 0) {
          this.option1.data.forEach(item => {
            let bool = this.editGuard([item], false)
            if (bool) {
              item.canEdit = true
              this.multipleSelection1.push(item)
            } else {
              item.canEdit = false
            }
          })
        } else {
          // isNoCheck = false
          // this.getFeesCanEdit(this.multipleSelection1)
          this.getFeesCanEdit(this.option1.data, false, true) // 将应收全部费用提前处理
        }
        // let someCanEdit = this.multipleSelection1.some(item => {
        //   return item.canEdit
        // })
        // let someSpecOrMng = this.multipleSelection1.some(item => {
        //   return item.viewGroupType !== 'biz'
        // })
        // let someSpecOrMngMsg = someSpecOrMng && !isNoCheck ? '（专项类费用请通过专项管理费页面进行修改）' : '' // 改成不显示，否则比较干扰，基本每个单子都有专项类费用
        // if (!someCanEdit) {
        //   this.$message({
        //     message: `没有可修改的费用${someSpecOrMngMsg}`,
        //     type: 'error',
        //     showClose: true
        //   })
        // }
        if (!this.getFeesCanEdit(this.multipleSelection1)) { // 如果无可修改的费用
        } else { // 如果有可修改的费用
          this.option1.edit = true
          if (this.multipleSelection1.length > 0) {
            // this.table1DataBackup = JSON.parse(JSON.stringify(this.option1.data)) // 备份数据，用于修改恢复 // 注释20220419
            this.option1.data.forEach(item => {
              this.$set(item, 'edit', false) // item.edit = false
            })
            this.multipleSelection1.forEach(item => {
              if (item.canEdit) {
                this.$set(item, 'edit', true) // item.edit = true
                this.preVerifyNeedBl(item)
              } else {
              }
            })
            this.isEditRecei = true
          }
        }
      } else if (type === 'pay') {
        // 改为显示可修改的费用
        if (this.multipleSelection2.length === 0) {
          this.option2.data.forEach(item => {
            let bool = this.editGuard([item], false)
            if (bool) {
              item.canEdit = true
              this.multipleSelection2.push(item)
            } else {
              item.canEdit = false
            }
          })
        } else {
          // isNoCheck = false
          // this.getFeesCanEdit()
          this.getFeesCanEdit(this.option2.data, false, true) // 将应付全部费用提前处理
        }
        // let someCanEdit = this.multipleSelection2.some(item => {
        //   return item.canEdit
        // })
        // let someSpecOrMng = this.multipleSelection2.some(item => {
        //   return item.viewGroupType !== 'biz'
        // })
        // let someSpecOrMngMsg = someSpecOrMng && !isNoCheck ? '（专项类费用请通过专项管理费页面进行修改）' : ''
        // if (!someCanEdit) {
        //   this.$message({
        //     message: `没有可修改的费用${someSpecOrMngMsg}`,
        //     type: 'error',
        //     showClose: true
        //   })
        // }
        if (!this.getFeesCanEdit(this.multipleSelection2)) {
        } else { // 如果有可修改的费用
          this.option2.edit = true
          if (this.multipleSelection2.length > 0) {
            this.table2DataBackup = JSON.parse(JSON.stringify(this.option2.data))
            this.option2.data.forEach(item => {
              this.$set(item, 'edit', false) // item.edit = false
            })
            this.multipleSelection2.forEach(item => {
              if (item.canEdit) {
                this.$set(item, 'edit', true) // item.edit = true
              } else {
              }
            })
            this.isEditPay = true
          }
        }
      }
    },
    handleSavePre(type) {
      let isBoth = false
      if ((type === 'receive' && this.isEditPay) || (type === 'pay' && this.isEditRecei)) {
        this.$confirm(this.$t('OrderFee.saveBothFeesTip'), this.$t('OrderFee.tip'), {
          confirmButtonText: this.$t('OrderFee.confirm'),
          cancelButtonText: this.$t('OrderFee.cancel'),
          type: 'warning'
        }).then(() => {
          isBoth = true
          this.handleSave(type, isBoth)
        }).catch(() => {  
          this.handleSave(type, isBoth)
        })
      } else {
        this.handleSave(type, isBoth)
      }
    },
    handleSave(type, isBoth) {
      let arr = []
      let deleteSelectionExist = []
      if (type === 'receive' || this.hideSaveCnlBtn || isBoth) {
        this.$set(this.option1, 'showIsError', true) // 用于显示必填
        arr = this.option1.data.filter(item => {
          item.receipayType = 'receive'
          return item.edit
        })
        deleteSelectionExist = this.option1.data.filter(item => {
          return item.$isRowDelete
        })
      } 
      if (type === 'pay' || this.hideSaveCnlBtn || isBoth) {
        this.$set(this.option2, 'showIsError', true)
        arr = arr.concat(this.option2.data.filter(item => {
          item.receipayType = 'pay'
          return item.edit
        }))
        deleteSelectionExist = deleteSelectionExist.concat(this.option2.data.filter(item => {
          return item.$isRowDelete
        }))
      }
      // let arr = arr1.concat(arr2)
      arr.forEach(item => {
        item.operation = 'update'
      })
      // 通过$isRowDelete标识来获取
      // let deleteSelectionExist = this.option1.data.filter(item => {
      //   return item.$isRowDelete
      // }).concat(this.option2.data.filter(item => {
      //   return item.$isRowDelete
      // }))
      deleteSelectionExist.forEach(item => {
        item.operation = 'delete'
      })
      arr = arr.concat(deleteSelectionExist)
      if (arr.length === 0) {
        this.option1.edit = false
        this.option2.edit = false
        if (type === 'receive' || this.hideSaveCnlBtn || isBoth) {
          this.isEditRecei = false
        }
        if (type === 'pay' || this.hideSaveCnlBtn || isBoth) {
          this.isEditPay = false
        }
        this.setFeeSaveSuccessCount(1) // 用于补料费用等跨系统的费用保存状态设置
      } else {
        this.handleOrderBizFee(arr, type, isBoth)
      }
    },
    handleOrderBizFee(arr, type, isBoth) {
      let data = {
        "orderNo": this.useNo, // this.orderNo,
        "jointNo": this.jointNo, // 20220124负数开发额外增加
        "fees": arr
      }
      if (!this.validate(data, ['orderNo'])) {
        return
      }
      if (!this.validate(data.fees)) {
        return
      }
      let validateData = data.fees.filter(item => {
        return item.operation !== 'delete'
      })
      if (validateData && validateData.length > 0) {
        // 校验非空
        if (!this.validate(validateData, ['settleCorpCode', 'feeCode', 'serviceName', 'serviceCode', 'receipayType', 'prepayType', 'feeUnit', 'unitPrice', 'unitCount', 'feeAmt', 'currency'])) {
          return
        }
      }
      try {
        data.fees.forEach(item => {
          if (!this.validateMoney(item.unitPrice)) {
            throw new Error('ending')
          }
          let unitPrice = Number(item.unitPrice)
          item.unitCount = Number(item.unitCount) // 防止后台报错
          let unitCount = item.unitCount
          item.feeAmt = new LSnum(unitPrice).times(unitCount).toNum(2) // 提交时再算一遍，防止后台未计算直接录入数据
          console.log(item)
          if (item.receipayType === 'receive' && item.operation !== 'delete') {
            if (!item.isNoNeedBlFee && !item.isNoNeedBlSettleUnit && !this.air) {
              if (!item.blId.length && this.blList.length) {
                // 20230209 放开，丽娟
                // this.$set(item, 'blId_required', true) // 用于显示blId必填
                // this.$message({
                //   type: 'error',
                //   message: this.$t('OrderFee.recvNeedBl'),
                //   showClose: true
                // })
                // throw new Error('ending')
              }
            }
            item.blIds = item.blId.join(',')
          }
          if (item.unitPrice < 0 && item.operation !== 'delete') {
            if (item.receipayType === 'receive') {
              if (!item.negativeType) {
                this.$message({
                  message: this.$t('OrderFee.negRecvNeedInfo'),
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
                  message: this.$t('OrderFee.negRecvSplitNeedInfo'),
                  type: 'error',
                  duration: 5000,
                  showClose: true,
                  offset: 162
                })
                this.$set(item, 'splitFromOrderNo_required', true) // 用于显示拆单原单号必填
                throw new Error('ending')
              }
            } else if (item.receipayType === 'pay' && (!item.negativeType || !item.negativeFollowerId)) {
              this.$message({
                message: this.$t('OrderFee.negPayNeedInfo'),
                type: 'error',
                duration: 5000,
                showClose: true,
                offset: 162
              })
              this.$set(item, 'negativeType_required', true) // 用于显示负数类型必填
              this.$set(item, 'negativeFollowerId_required', true) // 用于显示负数跟进人必填
              throw new Error('ending')
            }
          } else if (item.unitPrice >= 0 && item.operation !== 'delete') {
            if (item.receipayType === 'receive') {
              if (item.negativeType || item.negativeFollowerId) {
                this.$message({
                  message: this.$t('OrderFee.posNoNeedNegInfo'), // `录入应收正数，无需录入负数类型和跟进人`,
                  type: 'error',
                  showClose: true,
                  offset: 162
                })
                throw new Error('ending')
              }
            } else if (item.receipayType === 'pay') {
              if (item.negativeType || item.negativeFollowerId) {
                this.$message({
                  message: this.$t('OrderFee.posNoNeedNegInfo'), // `录入应付正数，无需录入负数类型和跟进人`,
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
      this.saveOrderBizFee(data, type, isBoth)
    },
    saveOrderBizFee(data, type, isBoth) {
      data.fees.reverse()
      this.loading = true
      bizFeeSaveVerify(data).then(res => {
        let validateData = data.fees.filter(item => {
          return item.operation !== 'delete'
        })
        if (validateData && validateData.length > 0) {
          // 再次校验非空
          if (!this.validate(validateData, ['settleCorpCode', 'feeCode', 'serviceName', 'serviceCode', 'receipayType', 'prepayType', 'feeUnit', 'unitPrice', 'unitCount', 'feeAmt', 'currency'])) {
            return
          }
        }
        if (res.data.applyAble === 'no') {
          this.loading = true
          saveOrderBizFee(data).then(res => {
            this.doAftSaveSuccess(type, isBoth)
          }).catch(err => {
            console.log(err)
            this.setFeeSaveErrorCount(1) // 用于补料费用等跨系统的费用保存状态设置
          }).finally(() => {
            this.loading = false
          })
        } else if (res.data.applyAble === 'yes') {
          this.updateFees = data.fees
          this.feeSaveVerifyData = res.data
          this.specFeeMngApplyVisible.show = true
          let $this = this
          this.saveApplyCallback = (function(type, isBoth) {
            return function() {
              let data2 = {
                orderNo: $this.orderNo,
                jointNo: $this.jointNo,
                remark: $this.feeSaveVerifyData.remark,
                applyType: $this.feeSaveVerifyData.applyType,
                fees: $this.feeSaveVerifyData.fees
              }
              return saveOrderBizFeeAdjust(data2).then(res => {
                $this.doAftSaveSuccess(type, isBoth)
              }).catch(err => {
                console.log(err)
                $this.setFeeSaveErrorCount(1) // 用于补料费用等跨系统的费用保存状态设置
              }).finally(() => {
              })
            }
          })(type, isBoth)
        }
      }).finally(() => {
        this.loading = false
      })
    },
    doAftSaveSuccess(type, isBoth) {
      this.$message({
        message: this.$t('OrderFee.successOp'), // '保存成功！',
        type: 'success',
        showClose: true
      })
      if (type === 'receive' || this.hideSaveCnlBtn || isBoth) {
        this.option1.edit = false
        this.isEditRecei = false
        this.option1.showIsError = false
      }
      if (type === 'pay' || this.hideSaveCnlBtn || isBoth) {
        this.option2.edit = false
        this.isEditPay = false
        this.option2.showIsError = false
      }
      this.getData({ dataType: isBoth ? 'both' : type })
      this.setFeeSaveSuccessCount(2) // 用于补料费用等跨系统的费用保存状态设置
      this.refreshView('SettlementFeeList')
    },
    handleCancel(type) {
      if (type === 'receive' || this.hideSaveCnlBtn) {
        this.option1.data = JSON.parse(JSON.stringify(this.table1DataBackup))
        this.multipleSelection1 = []
        this.isAddReceive = false
        this.option1.edit = false
        this.isEditRecei = false
        this.option1.showIsError = false
      }
      if (type === 'pay' || this.hideSaveCnlBtn) {
        this.option2.data = JSON.parse(JSON.stringify(this.table2DataBackup))
        this.multipleSelection2 = []
        this.isAddPay = false
        this.option2.edit = false
        this.isEditPay = false
        this.option2.showIsError = false
      }
    },
    handleDelete(type) { // handleDelete($index, row, option)
      if (this.isFinCloseCombined) {
        this.$message({
          type: 'error',
          message: this.$t('OrderFee.closeNotModifyFee'), // '订单已关账，不能删除费用!',
          showClose: true
        })
        return
      }
        if (type === 'receive') {
          if (!this.multipleSelection1.length) {
            this.$message({
              type: 'error',
              message: this.$t('OrderFee.selectRow'), // '请至少选择一条应收费用进行删除',
              showClose: true
            })
            return
          }
          this.getFeesCanEdit(this.option1.data, false, true) // 将应收全部费用提前处理
          this.getFeesCanEdit(this.multipleSelection1) // 是否存在可以删除的费用
          this.multipleSelection1.forEach(row => {
            let $index = this.option1.data.findIndex(item => item === row)
            this.deleteSingleFee($index, row, this.option1)
          })
          this.$nextTick(() => {
            let m = this.multipleSelection1
            for(let i = 0; i < m.length; i++) {
              if (m[i].isAddFee) {
                m.splice(i--, 1)
              }
            }
          })
        } else if (type === 'pay') {
          if (!this.multipleSelection2.length) {
            this.$message({
              type: 'error',
              message: this.$t('OrderFee.selectRow'), // '请至少选择一条应付费用进行删除',
              showClose: true
            })
            return
          }
          this.getFeesCanEdit(this.option2.data, false, true) // 将应付全部费用提前处理
          this.getFeesCanEdit(this.multipleSelection2)
          this.multipleSelection2.forEach(row => {
            let $index = this.option2.data.findIndex(item => item === row)
            this.deleteSingleFee($index, row, this.option2)
          })
          this.$nextTick(() => {
            let m = this.multipleSelection2
            for(let i = 0; i < m.length; i++) {
              if (m[i].isAddFee) {
                m.splice(i--, 1)
              }
            }
          })
        }
      // } else {
      //   this.deleteSingleFee($index, row, option)
      // }
    },
    deleteSingleFee($index, row, option) {
      if (row.isAddFee) { // 新增的费用从列表删除
        option.data.splice($index, 1)
      } else { // 已存在的费用，显示删除的划线
        let bool = this.editGuard([row], false) // true
        if (!bool) return
        row.edit = false
        this.$set(row, '$isRowDelete', !row.$isRowDelete)
      }
      if (option.id === 'option1') {
        this.isEditRecei = true
      } else if (option.id === 'option2') {
        this.isEditPay = true
      }
      // this.getFeesCanEdit()
    },
    handleCopy(type) { // handleCopy(row, option)
      if (this.isFinCloseCombined) {
        this.$message({
          type: 'error',
          message: this.$t('OrderFee.closeNotModifyFee'), // '订单已关账，不能复制费用!',
          showClose: true
        })
        return
      }
      // if (this.multipleSelection1.length || this.multipleSelection2.length) {
      if (type === 'receive') {
        if (!this.multipleSelection1.length) {
          this.$message({
            type: 'error',
            message: this.$t('OrderFee.selectRow'), // '请至少选择一条应收费用进行复制',
            showClose: true
          })
          return
        }
        this.multipleSelection1.forEach(row => {
          this.copySingleFee(row)
        })
      } else if (type === 'pay') {
        if (!this.multipleSelection2.length) {
          this.$message({
            type: 'error',
            message: this.$t('OrderFee.selectRow'), // '请至少选择一条应付费用进行复制',
            showClose: true
          })
          return
        }
        this.multipleSelection2.forEach(row => {
          this.copySingleFee(row)
        })
      }
      // } else {
      //   this.copySingleFee(row)
      // }
    },
    copySingleFee(row) {
      let someSpecOrMng = [row].some(item => {
        return item.viewGroupType && item.viewGroupType === 'special' // 复制新增的费用不受限制
      })
      let someSpecOrMngMsg = this.$t('OrderFee.specialAddOnSelf')
      if (someSpecOrMng) {
        return this.$message({
          message: `${someSpecOrMngMsg}`,
          type: 'error',
          showClose: true
        })
      }
      let { settleCorpName, settleCorpCode, settleCompName, settleCompCode, feeName, feeCode, feeEnName, serviceName, serviceCode, receipayType, prepayType, feeAmt, feeUnit, unitPrice, unitCount, currency, taxRate, blId, negativeType, negativeFollowerId, negativeFollowerName } = row
      let feeItem = { settleCorpName, settleCorpCode, settleCompName, settleCompCode, feeName, feeCode, feeEnName, serviceName, serviceCode, receipayType, prepayType, feeAmt, feeUnit, unitPrice, unitCount, currency, blId, negativeType, negativeFollowerId, negativeFollowerName }
      if (receipayType === 'receive') { // if (option.id === 'option1')
        this.addReceive(feeItem)
      } else if (receipayType === 'pay') { // if (option.id === 'option2')
        feeItem.taxRate = taxRate
        this.addPay(feeItem)
      }
      // 如果复制负数，处理一下负数跟进人
      if (negativeFollowerId) {
        this.$nextTick(() => {
          let option = receipayType === 'pay' ? this.option2 : this.option1
          let item = option.columns.find(item => item.prop === 'negativeFollowerId')
          this.employeeSelectlistMx('', item, {}, 0, option)
        })
      }
    },
    // handleCancel(row) { // 原先的
    //   if (row.$isRowDelete) {
    //     this.$set(row, '$isRowDelete', false)
    //   } else if (row.edit) {
    //     this.$set(row, 'edit', false)
    //   }
    // },
    handleCollapse(val) {
      this['show' + val] = !this['show' + val]
      if (val === 'Table1') {
        if (this.showTable1) {
          if (this.showTable2) {
            this.option1.maxHeight = 300
            this.option2.maxHeight = 300
          } else {
            this.option1.maxHeight = 600
            this.option2.maxHeight = 300
          }
        } else {
          if (this.showTable2) {
            this.option1.maxHeight = 300
            this.option2.maxHeight = 600
          } else {
            this.option1.maxHeight = 300
            this.option2.maxHeight = 300
          }
        }
      } else {
        if (this.showTable2) {
          if (this.showTable1) {
            this.option1.maxHeight = 300
            this.option2.maxHeight = 300
          } else {
            this.option1.maxHeight = 300
            this.option2.maxHeight = 600
          }
        } else {
          if (this.showTable1) {
            this.option1.maxHeight = 600
            this.option2.maxHeight = 300
          } else {
            this.option1.maxHeight = 300
            this.option2.maxHeight = 300
          }
        }
      }
      let finLStorage = localStorage.getItem('finLStorage')
      finLStorage = finLStorage ? JSON.parse(finLStorage) : {}
      finLStorage.businessFee = finLStorage.businessFee ? finLStorage.businessFee : {}
      finLStorage.businessFee = Object.assign(finLStorage.businessFee, {
        option1MaxHg: this.option1.maxHeight,
        option2MaxHg: this.option2.maxHeight,
        showTable1: this.showTable1,
        showTable2: this.showTable2
      })
      localStorage.setItem('finLStorage', JSON.stringify(finLStorage))
    },
    addReceive(feeItem) {
      if (this.isFinCloseCombined) {
        this.$message({
          type: 'error',
          message: this.$t('OrderFee.closeAddFeeTip'), // '订单已关账，请通过调费申请来新增费用',
          showClose: true
        })
        return
      }
      if (!this['showTable1']) {
        this['showTable1'] = true
      }
      let obj = { canEdit: true }
      if (feeItem) {
        obj = { ...obj, ...feeItem } // obj = feeItem
        delete obj.orderFeeId
        feeItem.blId = feeItem.blIds ? feeItem.blIds.split(',').map(id => parseInt(id)).filter(id => item.feeBls.some(bl => bl.blId === id)) : []
        if (obj.feeCode === 'YJKH' || obj.feeCode === 'YJGYS') {
          obj.isNoNeedBlFee = true
        } else {
          obj.isNoNeedBlFee = false
        }
      } else {
        this.option1.columns.forEach(item => {
          obj[item.prop] = ''
        })
        // 默认值
        obj['receipayType'] = 'receive'
        obj['prepayType'] = (obj['prepayType'] === '' || !obj['prepayType']) ? 'prepay' : obj['prepayType']
        obj['settleCorpName'] = this.jointNo ? this.mainOrderCompany && this.mainOrderCompany.settleCompName : this.settleCorpNameRecei ? this.settleCorpNameRecei : this.client ? this.client.unitName : ''
        obj['settleCorpCode'] = this.jointNo ? this.mainOrderCompany && this.mainOrderCompany.settleCompCode : this.settleCorpCodeRecei ? this.settleCorpCodeRecei : this.client ? this.client.unitCode : ''
        obj['serviceName'] = this.serviceNameRecei ? this.serviceNameRecei : ''
        obj['serviceCode'] = this.serviceCodeRecei ? this.serviceCodeRecei : ''
        obj['unitCount'] = '' // this.containerCount ---> 改成根据计费单位来决定
        obj['unitPrice'] = ''
      }
      obj['settleCompName'] = this.feeSettleCompany ? this.feeSettleCompany.settleCompName : this.$store.state.user.userInfo.settleCompanyName // 带出分公司的显示，但分公司code不传后台
      obj['settleCompCode'] = this.feeSettleCompany ? this.feeSettleCompany.settleCompCode : this.$store.state.user.userInfo.settleCompanyCode
      obj['feeAmt'] = '' // 方便导入模板计算
      this.preVerifyNeedBl(obj)
      this.modifyBlByFeeAndUnit(obj)
      // 设置负数类型是否可选
      if (obj.unitPrice < 0) {
        obj.bothDisabled = false
      } else {
        obj.bothDisabled = true
      }
      obj.edit = true
      obj.isAddFee = true
      obj.index = this.option1.data.length
      this.option1.data.unshift(obj)
      this.option1.edit = true
      this.isEditRecei = true
      this.isAddReceive = true
      this.getFeesCanEdit(this.option1.data, false, true)
    },
    addPay(feeItem) {
      if (this.isFinCloseCombined) {
        this.$message({
          type: 'error',
          message: this.$t('OrderFee.closeAddFeeTip'), // '订单已关账，请通过调费申请来新增费用',
          showClose: true
        })
        return
      }
      if (!this['showTable2']) {
        this['showTable2'] = true
      }
      let obj = { canEdit: true }
      if (feeItem) {
        obj = feeItem
        delete obj.orderFeeId
      } else {
        this.option2.columns.forEach(item => {
          obj[item.prop] = ''
        })
        // 默认值
        // 1、在录入应付费用时，默认结算单位等于订舱代理。
        // 2、应收、应付的数量：默认等于订单的箱量。
        obj['receipayType'] = 'pay'
        obj['prepayType'] = (obj['prepayType'] === '' || !obj['prepayType']) ? 'prepay' : obj['prepayType']
        // obj['settleCorpName'] = this.client ? this.client.unitName : '' // client是委托单位，并不是应付的结算单位
        // obj['settleCorpCode'] = this.client ? this.client.unitCode : ''
        obj['settleCorpName'] = this.jointNo ? this.bkgAgent.unitName : this.settleCorpNamePay ? this.settleCorpNamePay : this.bkgAgent.unitName ? this.bkgAgent.unitName : ''
        obj['settleCorpCode'] = this.jointNo ? this.bkgAgent.unitCode : this.settleCorpCodePay ? this.settleCorpCodePay : this.bkgAgent.unitCode ? this.bkgAgent.unitCode : ''
        obj['serviceName'] = this.serviceNamePay ? this.serviceNamePay : ''
        obj['serviceCode'] = this.serviceCodePay ? this.serviceCodePay : ''
        obj['unitCount'] = '' // this.containerCount ---> 改成根据计费单位来决定
      }
      obj['settleCompName'] = this.feeSettleCompany ? this.feeSettleCompany.settleCompName : this.$store.state.user.userInfo.settleCompanyName // 带出分公司的显示，但分公司code不传后台
      obj['settleCompCode'] = this.feeSettleCompany ? this.feeSettleCompany.settleCompCode : this.$store.state.user.userInfo.settleCompanyCode
      obj['feeAmt'] = ''
      if (obj.unitPrice < 0) {
        obj.bothDisabled = false
      } else {
        obj.bothDisabled = true
      }
      obj.edit = true
      obj.isAddFee = true
      obj.index = this.option2.data.length
      this.option2.data.unshift(obj)
      this.option2.edit = true
      this.isEditPay = true
      this.isAddPay = true
      this.getFeesCanEdit(this.option2.data, false, true)
    },
    generateBillPre() {
      let multipleSelection = []
      if (this.mode === 'byFee') {
        multipleSelection = this.multipleSelection1.concat(this.multipleSelection2)
      } else {
        multipleSelection = this.multipleSelection7.concat(this.multipleSelection8)
      }
      if (multipleSelection.length === 0) { // this.multipleSelection1.length === 0 && this.multipleSelection2.length === 0
        return this.$message({
          type: 'error',
          message: this.$t('OrderFee.selectRow'), // '请先勾选费用!',
          showClose: true
        })
      }
      let settleCorpCodes = multipleSelection.map(item => item.settleCorpCode)
      settleCorpCodes = [...new Set(settleCorpCodes)]
      let len = settleCorpCodes.length
      if (len > 1) {
        this.$confirm(`${this.$t('OrderFee.multiUnitToBill1')}${len}${this.$t('OrderFee.multiUnitToBill2')}`, this.$t('OrderFee.tip'), {
          confirmButtonText: this.$t('OrderFee.confirm'),
          cancelButtonText: this.$t('OrderFee.cancel'),
          type: 'warning'
        }).then(() => {
          this.generateBill(multipleSelection)
        }).catch((err) => {
          console.log(err)
        })
      } else {
        this.generateBill(multipleSelection)
      }
    },
    generateBill(multipleSelection) {
      let feeIds = []
      if (this.mode === 'byFee') {
        feeIds = multipleSelection.map(item => {
          return item.feeId
        })
      } else {
        feeIds = multipleSelection.map(item => {
          return item.feeIds.split(',')
        }).reduce((prev, curr) => {
          return prev.concat(curr)
        }, [])
      }
      let data = {
        orderNo: this.useNo,
        feeIds // orderFeeIds: arr, 20220518改feeIds
      }
      generateBill(data).then(res => {
        if (res.code === 0) {
          this.$message({
            type: 'success',
            message: this.$t('OrderFee.successOp'), // '生成账单成功!',
            showClose: true
          })
          if (res.data.length === 1) {
            this.showBillDetail(res.data[0])
          } else {
            this.generateBillList = res.data
            this.generateBillVisible = true
          }
        }
      })
    },
    showBillDetail(row) {
      let routeUrl = this.$router.resolve({
        name: 'BillDetail',
        query: { source: 'businessFee', billId: row.orderBillId, newWdo: true }
      })
      window.open(routeUrl.href, '_blank')
    },
    syncFeesFromExportOrder(){
      this.$confirmWarn(this.$t('OrderFee.sureIntroducingExFee'), () => {
        syncFeesFromExportOrder({orderNo: this.orderNo}).then(res => {
          this.$msgSucClose(this.$t('OrderFee.successOp')) // '同步成功！'
          this.getData()
        })
      })
    },
    openBillEmailDialog() {
      signEmailInfo({orderNo: this.orderNo}).then(res => {
        // console.log(res);
        this.emailForm.toEmails = res.data.toEmails.join(',')
        this.emailForm.ccEmails = res.data.ccEmails
        this.emailForm.subject = `${this.$t('OrderFee.signFeeReminder')}${this.$t('OrderFee.orderNo')}: ${res.data.orderNo}, ${this.$t('OrderFee.costEnteredSignARFee')}`
        // console.log(this.jointNo);
        let href = location.href.replace(new RegExp(this.orderNo, 'g'), res.data.orderNo)
        if(this.jointNo){
          href = href.replace(new RegExp(this.jointNo, 'g'), '')
        }
        console.log(href);
        this.emailForm.emailHtml = `
          <p><strong>Dear ${res.data.receiverName.join('、')}: </strong></p>
          <p style="padding-left: 30px;">${this.$t('OrderFee.hello')}, ${this.$t('OrderFee.orderNo')}<a href="${href}" target="_blank" rel="noopener">${res.data.orderNo}</a>, ${this.$t('OrderFee.costEnteredSignARFee')}.</p>
          <p style="padding-left: 30px;display:${res.data.mbl?'':'none'}">MBL: ${res.data.mbl}</p>
          <p style="padding-left: 30px;display:${res.data.so?'':'none'}">SO: ${res.data.so}</p>
          <p style="padding-left: 30px;">${this.$t('OrderFee.reminderName')}: ${res.data.reminderName}</p>
          <p style="padding-left: 30px;">${this.$t('OrderFee.reminderEmail')}: ${res.data.reminderEmail}</p>
        `
        this.emailForm.orderNo = res.data.orderNo
        this.dialogVisible2 = true
      })
    },
    sendFileList(payload) {
      this.fileList = payload
    },
    sendBillEmail(){
      this.$refs.emailForm.validate(valid => {
        if(!valid) return
        this.btnLoading2 = true
        let fileNos = this.$refs.FinanceUploadEmbed.resFileList.map(v => v.fileNo)
        this.payFeeFinishedPushConfirm(true, {...this.emailForm, fileNos}, () => {
          this.btnLoading2 = false
          this.dialogVisible2 = false
        })
      })
    },
    validateReceive(rule, value, callback) {
      if (value === '') {
        if (rule.field === 'toEmails') {
          callback(new Error(' '))
        } else {
          callback()
        }
      } else {
        let arr = value.split(',')
        arr.forEach(item => {
          let Email = item
          const emailrule = /^([a-zA-Z]|[0-9])+\.?(\w|\-|\.)+@([a-zA-Z0-9]|\-)+\.([a-zA-Z]{2,4})$/;
          if (!emailrule.test(Email)) {
            callback(new Error('请输入有效邮箱'))
          } else {
            callback()
          }
        })
      }
    },
    ...mapMutations('finance', ['setFeeSaveSuccessCount', 'setFeeSaveErrorCount'])
  },
  watch: {
    'option1.data': {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          clearTimeout(this.timer1)
          this.timer1 = setTimeout(() => {
            newVal.forEach(row => {
              if (row.edit) {
                let unitPrice = row.unitPrice !== '-' ? Number(row.unitPrice) : 0
                let unitCount = Number(row.unitCount)
                row.feeAmt = new LSnum(unitPrice).times(unitCount).toNum(2)
              }
              if (row.unitPrice < 0) {
                row.bothDisabled = false
              } else {
                row.bothDisabled = true
                row.negativeType = ''
                row.negativeFollowerId = ''
                row.splitFromOrderNo = ''
              }
            })
          }, 500)
        }
      },
      deep: true
    },
    'option2.data': {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          clearTimeout(this.timer2)
          this.timer2 = setTimeout(() => {
            newVal.forEach(row => {
              if (row.edit) {
                let unitPrice = row.unitPrice !== '-' ? Number(row.unitPrice) : 0
                let unitCount = Number(row.unitCount)
                row.feeAmt = new LSnum(unitPrice).times(unitCount).toNum(2)
              }
              if (row.unitPrice < 0) {
                row.bothDisabled = false
              } else {
                row.bothDisabled = true
                row.negativeType = ''
                row.negativeFollowerId = ''
              }
            })
          }, 500)
        }
      },
      deep: true
    },
    settleUnitVisible(newVal, oldVal) {
      if (newVal) {
        this.settleUnitForm.settleCorpName = ''
        this.settleUnitForm.settleCorpCode = ''
        this.settleUnitForm.comment = ''
        this.settleUnitForm.auditPerson = ''
        this.settleUnitForm.auditPersonMain = ''
        this.settleUnitForm.applyPersonId = ''
        this.$nextTick(() => {
          this.$refs.settleUnitForm.clearValidate()
        })
      }
    },
    feeTemplateVisible(newVal, oldVal) {
      if (newVal) {
        this.feeTemplateForm.feeTemplateName = ''
      }
    },
    copyHistoryFeeVisible(newVal, oldVal) {
      if (newVal) {
        this.copyHistoryFeeForm.orderNo = ''
        this.option3.data = []
      }
    },
    lateFeeVisible(newVal, oldVal) {
      if (newVal) {
        this.lateFeeForm.respType = ''
        this.lateFeeForm.settleCorpName = ''
        this.lateFeeForm.settleCorpCode = ''
        this.lateFeeForm.serviceName = ''
        this.lateFeeForm.serviceCode = ''
        this.lateFeeForm.amt = ''
        this.lateFeeForm.currency = ''
        this.$nextTick(() => {
          // this.$refs.lateFeeForm.resetFields()
          this.$refs.lateFeeForm.clearValidate()
        })
      }
    },
    taxRateVisible(newVal) {
      if (newVal) {
        this.taxRateForm.taxRate = null
      }
    },
    editNegFolVisible(newVal) {
      if (newVal) {
        this.negFolForm.negativeFollowerId = ''
        this.negFolForm.negativeFollowerName = ''
      }
    }
  },
  computed: {
    getProfitRate() {
      // return decimalFixed2(this.orderProfit.totalGrossProfit * 100)
      return new LSnum(this.orderProfit.totalGrossProfit).times(100).toNum(2)
    },
    isProfitLossFail() {
      if (this.orderCloseInfo.prefinCloseFailList && this.orderCloseInfo.prefinCloseFailList.length) {
        if (this.orderCloseInfo.prefinCloseFailList.find(item => {
          return (item.errorType || '').toUpperCase() === 'PROFIT_LOSS'
        })) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    },
    businessType() {
      return this.orderInfo && this.orderInfo.businessType
    },
    isImport(){
      let businessType = this.orderInfo.businessType || ''
      return businessType.indexOf('import') > -1
    },
    ... mapState({
      defaultColumnsRecei: state => state.finance.columns.defaultColumnsRecei,
      defaultColumnsPay: state => state.finance.columns.defaultColumnsPay,
      defaultColumnsSU: state => state.finance.columns.defaultColumnsSU,
      columnsBase: state => state.finance.columns.columnsBase,
      isFinCloseCombined: state => state.finance.isFinCloseCombined
    })
  }
}
</script>
<style lang="scss" scoped>
// .select-template-box {
//   float: left;
//   margin-bottom: 0px;
// }
// .select-template-box .el-dropdown{
//   margin-left: 0;
//   margin-bottom: 0;
//   border-radius: 0;
//   font-size: 12px;
//   border-top: 1px solid #DCDFE6; // #D9D9D9;
//   border-bottom: 1px solid #DCDFE6; // #D9D9D9;
//   border-left: none;
//   border-right: none;
// }
// .select-template-box:last-child .el-dropdown {
//   border-right: 1px solid #DCDFE6;
//   border-top-right-radius: 3px;
//   border-bottom-right-radius: 3px;
// }
// .select-template-box:first-child .el-dropdown {
//   border-left: 1px solid #DCDFE6;
//   border-top-left-radius: 3px;
//   border-bottom-left-radius: 3px;
// }
// .select-template-box:hover .el-dropdown {
//   background: rgb(236, 245, 255);
//   color: rgb(64, 158, 255);
// }
.select-template-box .el-dropdown-link {
  // cursor: pointer;
  padding: 1px 7px; // 0 7px;
  line-height: 20px; // 18px;
}
// .select-template-box .el-dropdown-link:focus{
//   outline: none;
// }
.settlement-detail-form ::v-deep .el-form-item__content {
  width: 262px;
}
.modifyfee-detail-info {
  width: 310px;
}
.performance-setting {
  font-size: 14px;
  opacity: 0.1;
  &:hover {
    opacity: 0.5
  }
}
</style>
<style>
.business-fee-receive-table .tips-abs{
  top: -70px;
}
.finance-addfee-template .el-dialog__body{
  padding: 40px 86px 22px 96px;
}
.finance-addfee-template-tip{
  margin-left: 80px;
  width: 308px;
  height: 22px;
  font-size: 12px;
  font-weight: 400;
  color: #CD4130;
  line-height: 22px;
  margin-top: -2px;
}
.finance-addfee-template-names{
  margin-top: 6px;
}
.finance-addfee-template-names li{
  display: inline-block;
  height: 24px;
  background: #F4F7FF;
  border-radius: 4px;
  line-height: 24px;
  margin-right: 16px;
  margin-top: 10px;
  padding-left: 10px;
  padding-right: 7px;
}
.finance-addfee-template-names li:last-of-type{
  margin-right: 0;
}
.finance-addfee-template-names li i{
  cursor: pointer;
  line-height: 24px;
  margin-left: 10px;
  color: #BFBFBF;
}
.one-kind-fee .el-dropdown-menu__item {
  font-size: 12px !important;
  line-height: 26px !important;
  padding: 0 14px;
}
.copy-history-fee-dialog .el-dialog__body {
  padding: 24px 6px;
}
.fin-bizfee-dialog .el-dialog__body {
  padding: 24px 50px;
}
@media screen and (max-height:768px) {
  .copy-history-fee-dialog.el-dialog {
    margin-top: 60px !important;
  }
  .copy-history-fee-dialog .el-dialog__body {
    padding-bottom: 0;
    max-height: 85vh;
  }
}
.fin-edit-bl .el-select {
  width: 400px;
}
.fin-modify-settleunit .el-input {
  width: 100%;
}
</style>
