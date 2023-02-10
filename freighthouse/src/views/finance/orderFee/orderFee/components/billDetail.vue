<template>
<div class="finance-bill-detail finance-page">
  <el-alert v-if="billChange" type="warning" :closable="false" class="orange fin-bill-change">
    <template slot="title">
      <i class="tag-change">改</i>
      <span class="txt">
        账单费用已被修改，请重新生成账单！
      </span>
    </template>
  </el-alert>
  <div class="finance-bill-detail-selectshow" style="width:994px;">
    <el-form ref="accountForm" :inline="true" size="mini">
      <el-form-item label="显示字段" style="margin-bottom: 8px;">
        <el-select v-model="showOptions"
          multiple
          class="finance-bill-detail-selectshow-fields"
          placeholder="请选择"
          collapse-tags
          @change="showOptionsChange">
          <el-option label="客户名称" value="custNameShow"></el-option>
          <el-option label="客户地址" value="custAddrShow"></el-option>
          <!-- <el-option :label="lang === 'en' ? 'Bill No' : '系统账单编号'" value="billNoShow"></el-option> 不显示-20220808 zhaobin -->
          <el-option :label="lang === 'en' ? 'Invoice No' : '账单号'" value="dnNoShow"></el-option>
          <el-option :label="lang === 'en' ? 'Invoice Date' : '开票日期'" value="invoiceDateShow"></el-option>
          <el-option label="工作号" value="orderNoShow"></el-option>
          <el-option v-if="ship" label="订舱号" value="soShow"></el-option>
          <el-option v-if="ship || rail" label="箱号" value="cnShow"></el-option>
          <el-option label="客户委托号" value="custIntrustNoShow"></el-option>
          <el-option label="HBL" value="hblShow"></el-option>
          <el-option label="MBL" value="mblShow"></el-option>
          <el-option label="生成日期" value="billDateShow"></el-option>
          <el-option v-if="ship" label="驳船ETD" value="bargeEtdShow"></el-option>
          <el-option v-if="ship" label="驳船ATD" value="bargeAtdShow"></el-option>
          <el-option :label="ship ? '大船ETD' : air ? '起飞时间' : rail ? '发车时间' : '开航日期'" value="etdShow"></el-option><!-- 开航日期 -->
          <el-option v-if="ship || air" :label="ship ? '大船ATD' : '实际起飞时间'" value="atdShow"></el-option>
          <el-option v-if="ship || air" :label="ship ? '大船ETA' : '到达时间'" value="etaShow"></el-option><!-- 到港日期 -->
          <el-option v-if="ship || rail" :label="ship ? '船名航次' : '班名班次'" value="vesselShow"></el-option>
          <el-option v-if="air" label="航司" value="airLineShow"></el-option>
          <el-option v-if="air" label="航班号" value="eflightNumberShow"></el-option>
          <el-option :label="rail ? '起运站' : '起运港'" value="polPortCodeShow"></el-option>
          <el-option :label="ship ? '目的港' : air ? '目的地' : rail ? '目的站' : '目的港'" value="podPortCodeShow"></el-option>
          <el-option v-if="air || rail" label="件数" value="totalQuantityShow"></el-option>
          <el-option v-if="air || rail" :label="air?'毛重':'重量'" value="totalWeightShow"></el-option>
          <el-option v-if="air || rail" label="体积" value="totalVolumeShow"></el-option>
          <el-option v-if="air" label="计费重" value="chargeWeightShow"></el-option>
          <el-option :disabled="regAddrDisabled" label="使用我司注册地址" value="regAddrShow"></el-option>
          <el-option :disabled="!regAddrDisabled" label="使用我司办公地址" value="officAddrShow"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="银行账号" prop="settleUnitBankAcctIds" style="margin-bottom: 8px;">
        <el-select v-model="settleUnitBankAcctIds"
          multiple
          class="finance-bill-detail-selectshow-fields2"
          placeholder="请选择"
          filterable
          collapse-tags
          :popper-append-to-body="false"
          @change="(value) => {companyBankAccountChange(value, true)}">
          <!-- remote
          :remote-method="(queryString) => {companyBillBankAccountList(queryString)}" early -->
          <!-- @visible-change="(value) => {if(value) companyBankAccountList('')}" 20220127 -->
          <el-option
            v-for="(item, index) in bankAccountSelectOptions3"
            :key="'bankAccountSelectOptions3' + index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span class="finance-bill-switch-lang" @click="switchLang">{{lang === 'en' ? 'switch Chinese' : '切换英文'}}</span>
  </div>
  <div class="finance-bill-detail-main" id="printBillDetail" style="width:994px;break-after:page;">
    <div class="finance-bill-detail-ls">
      <img class="finance-bill-detail-logo" src="../../../../../assets/bill_logo.png"/>
      <!-- <h2>{{getCompanyName.join(',')}}</h2> -->
      <div class="finance-bill-detail-title">
        <!-- <h2 v-if="longsailTitle">{{getCompanyName.join(',')}}</h2>
        <h2 v-else>{{longsailTitle}}</h2> -->
        <h2>{{longsailTitle}}</h2>
        <span v-show="bankAccountList.length" @click="showTitleDropdownAction" class="bill-title-arrow">
          <i :class="'el-icon-arrow-down'"></i>
        </span>
        <ul v-show="showTitleDropdown" @click="titleDropdownSelect" class="bill-title-dropdown">
          <li class="bill-title-dropdown-item" :class="{selected: longsailTitle === getCompanyName.join(',') || !longsailTitle}">
            <span>{{getCompanyName.join(',')}}</span>
          </li>
          <template v-if="getCompanyName.length > 1">
            <li class="bill-title-dropdown-item" :class="{selected: longsailTitle === item}"
              v-for="(item, index) in getCompanyName" :key="'companyNameMore' + index">
              <span>{{item}}</span>
            </li>
          </template>
          <li class="bill-title-dropdown-item" :class="{selected: longsailTitle === 'LONGSAIL SUPPLY CHAIN CO., LTD.'}">
            <span>LONGSAIL SUPPLY CHAIN CO., LTD.</span>
          </li>
        </ul>
      </div>
      <div>
        <p style="margin-top: 2px;">{{getCompanyAddress.join(',')}}</p>
        <p style="margin-top: 2px;">{{getWebsite}}</p>
      </div>
    </div>
    <div class="finance-bill-detail-h1">
      <h1 v-show="lang === 'en'">{{billData.receipayType === 'pay' ? 'CREDIT NOTE' : 'INVOICE'}}</h1>
      <h1 v-show="lang === 'zh'">{{billData.receipayType === 'pay' ? 'CREDIT NOTE' : 'DEBIT NOTE'}}</h1>
    </div>
    <div class="finance-bill-detail-info">
      <div class="detail-info-part">
        <div class="detail-info-item" v-show="showOptions.includes('custNameShow')" style="width:calc(100% - 14px);">
          <span class="detail-info-item-label">{{t('customerName')}}：</span>
          <span class="detail-info-item-content">{{lang === 'zh' ? billData.custCname : billData.custEname ? billData.custEname : billData.custCname}}</span>
        </div>
      </div>
      <div class="detail-info-part">
        <div class="detail-info-item" v-show="showOptions.includes('custAddrShow')" style="width:calc(100% - 14px);">
          <span class="detail-info-item-label">{{t('custAddr')}}：</span>
          <span class="detail-info-item-content">{{lang === 'zh' ? billData.custAddrCname : billData.custAddrEname}}</span>
        </div>
      </div>
      <div class="detail-info-part">
        <!-- <div class="detail-info-item" v-show="showOptions.includes('billNoShow')">
          <span class="detail-info-item-label">{{t('billNo')}}：</span>
          <span class="detail-info-item-content">{{billData.billNo}}</span>
        </div> -->
        <div class="detail-info-item" v-show="showOptions.includes('dnNoShow')">
          <span class="detail-info-item-label">{{t('dnNo')}}：</span>
          <span class="detail-info-item-content">{{billData.dnNo}}</span>
        </div>
        <div class="detail-info-item" v-show="showOptions.includes('invoiceDateShow')">
          <span class="detail-info-item-label">{{t('invoiceDate')}}：</span>
          <span class="detail-info-item-content">{{billData.invoiceDate}}</span>
        </div>
        <div class="detail-info-item" v-show="showOptions.includes('billDateShow')">
          <span class="detail-info-item-label">{{t('billDate')}}：</span>
          <span class="detail-info-item-content">{{billData.billDate}}</span>
        </div>
        <div class="detail-info-item" v-show="showOptions.includes('orderNoShow')">
          <span class="detail-info-item-label">{{t('jobNo')}}：</span>
          <span class="detail-info-item-content">{{billData.orderNo}}</span>
        </div>
        <div class="detail-info-item" v-show="ship && showOptions.includes('soShow')">
          <span class="detail-info-item-label">{{t('SO')}}：</span>
          <span class="detail-info-item-content">{{billData.so}}</span>
        </div>
        <div class="detail-info-item" v-show="showOptions.includes('custIntrustNoShow')">
          <span class="detail-info-item-label">{{t('custIntrustNo')}}：</span>
          <span class="detail-info-item-content">{{billData.custIntrustNo}}</span>
        </div>
        <div class="detail-info-item" v-show="billData.po">
          <span class="detail-info-item-label">PO：</span>
          <span class="detail-info-item-content">{{billData.po}}</span>
        </div>
        <div class="detail-info-item" v-show="ship && showOptions.includes('bargeEtdShow')">
          <span class="detail-info-item-label">{{t('bargeEtd')}}：</span>
          <span class="detail-info-item-content">{{billData.bargeEtd}}</span>
        </div>
        <div class="detail-info-item" v-show="ship && showOptions.includes('bargeAtdShow')">
          <span class="detail-info-item-label">{{t('bargeAtd')}}：</span>
          <span class="detail-info-item-content">{{billData.bargeAtd}}</span>
        </div>
        <div class="detail-info-item" v-show="showOptions.includes('etdShow')">
          <span class="detail-info-item-label">{{t('etd')}}：</span>
          <span class="detail-info-item-content">{{billData.etd}}</span>
        </div>
        <div class="detail-info-item" v-show="(ship || air) && showOptions.includes('atdShow')">
          <span class="detail-info-item-label">{{t('atd')}}：</span>
          <span class="detail-info-item-content">{{billData.atd}}</span>
        </div>
        <div class="detail-info-item" v-show="(ship || air) && showOptions.includes('etaShow')">
          <span class="detail-info-item-label">{{t('eta')}}：</span>
          <span class="detail-info-item-content">{{billData.eta}}</span>
        </div>
        <div class="detail-info-item" v-show="(ship || rail) && showOptions.includes('vesselShow')">
          <span class="detail-info-item-label">{{t('vesselVoyage')}}：</span>
          <span class="detail-info-item-content">{{billData.vessel}}{{billData.voyage !== '' ? '/' : ''}}{{billData.voyage}}</span>
        </div>
        <div class="detail-info-item" v-show="air && showOptions.includes('airLineShow')">
          <span class="detail-info-item-label">{{t('airLine')}}：</span>
          <span class="detail-info-item-content">{{billData.airLine}}</span>
        </div>
        <div class="detail-info-item" v-show="air && showOptions.includes('eflightNumberShow')">
          <span class="detail-info-item-label">{{t('eflightNumber')}}：</span>
          <span class="detail-info-item-content">{{billData.eflightNumber}}</span>
        </div>
        <div class="detail-info-item" v-show="showOptions.includes('polPortCodeShow')">
          <span class="detail-info-item-label">{{t('polPortName')}}：</span>
          <span class="detail-info-item-content">{{lang === 'zh' ? billData.polPortCname : billData.polPortEname}}</span>
        </div>
        <div class="detail-info-item" v-show="showOptions.includes('podPortCodeShow')">
          <span class="detail-info-item-label">{{t('podPortName')}}：</span>
          <span class="detail-info-item-content">{{lang === 'zh' ? billData.podPortCname : billData.podPortEname}}</span>
        </div>
        <div class="detail-info-item" v-show="(air||rail) && showOptions.includes('totalQuantityShow')">
          <span class="detail-info-item-label">{{t('totalQuantity')}}：</span>
          <span class="detail-info-item-content">{{billData.totalQuantity}}</span>
        </div>
        <div class="detail-info-item" v-show="(air||rail) && showOptions.includes('totalWeightShow')">
          <span class="detail-info-item-label">{{t('totalWeight')}}(KGS)：</span>
          <span class="detail-info-item-content">{{billData.totalWeight}}</span>
        </div>
        <div class="detail-info-item" v-show="(air||rail) && showOptions.includes('totalVolumeShow')">
          <span class="detail-info-item-label">{{t('totalVolume')}}{{lang==='zh'?'(CBM)':''}}：</span>
          <span class="detail-info-item-content">{{billData.totalVolume}}</span>
        </div>
        <div class="detail-info-item" v-show="air && showOptions.includes('chargeWeightShow')">
          <span class="detail-info-item-label">{{t('chargeWeight')}}：</span>
          <span class="detail-info-item-content">{{billData.chargeWeight}}</span>
        </div>
      </div>
      <div v-if="ship||rail" class="detail-info-part">
        <div class="detail-info-item" v-show="showOptions.includes('cnShow')" style="width: calc(100% - 14px);">
          <span class="detail-info-item-label">{{t('cn')}}：</span>
          <span class="detail-info-item-content">{{billData.cn}}</span>
        </div>
      </div>
      <div class="detail-info-part">
        <div class="detail-info-item" v-show="showOptions.includes('hblShow')" style="width: calc(100% - 14px);">
          <div class="detail-info-item-label">HBL：</div>
          <div class="detail-info-item-content">{{billData.hblNo}}
          </div>
        </div>
      </div>
      <div class="detail-info-part">
        <div class="detail-info-item" v-show="showOptions.includes('mblShow')" style="width: calc(100% - 14px);">
          <div class="detail-info-item-label">MBL：</div>
          <div class="detail-info-item-content">{{billData.mblNo}}</div>
        </div>
      </div>
    </div>
    <div class="fin-bill-switch-remark" style="text-align:right;padding-right:107px;">
      <!-- <el-button @click="switchFeeRemark" size="mini" style="margin-right:107px;">切换显示费用备注</el-button> -->
      <el-checkbox v-model="feeRemarkChecked" style="margin-right:16px;" @change="switchFeeRemark">显示备注</el-checkbox>
      <el-checkbox v-if="positiveBtnShow" v-model="positiveChecked" @change="switchPositive">显示正数</el-checkbox>
      <el-checkbox v-if="adjustFeeGedgingShow" v-model="adjustFeeGedgingChecked" @change="switchAdjustFeeGedging">显示调费对冲</el-checkbox>
    </div>
    <div class="finance-bill-detail-fee" style="width:794px;margin:0 auto;">
      <FinanceTable 
        :option="option1" />
    </div>
    <div class="finance-bill-detail-totalfee">
      {{t('total')}}：<span v-for="(item, index) in totalFeeList" :key="'totalFeeList' + index">{{item.key + item.value}}</span>
    </div>
    <div class="finance-bill-detail-address">
    </div>
    <div class="finance-bill-detail-attention" v-show="lang === 'zh'">
      <p>注意事项：</p>
      <p>1、此单仅供与贵司核对费用，非付款凭证。如费用无误，请在二个工作日内确认，如无回应的，默认确认费用。</p>
      <!-- <p>2、走以下船公司的，按开船日算起收取罚金（含驳船日），请至少在产生罚金的前两天付款并传水单给我司，否则产生的罚金由贵司承担！</p>
      <p style="padding-left:20px;">船公司：{{billData.shipCarrierCode}}<span style="margin-right:40px;"></span>船开后，逾期罚金/票：{{billData.overdueDesc}}</p>
      <p>3、人民币费用默认开具电子发票，费用名称默认开代理运费或代理海运费，如有其他的开票需求请与我司财务说明，发票一经确认开出将不作废发票，否则收取发票作废费CNY100/张。</p> -->
      <p style="font-weight:600;">2、发票费用名称默认开代理运费或代理海运费，如有其他的开票需求请与我司财务说明，发票一经确认开出将不作废发票，否则收取发票作废费CNY100/张。</p>
      <p>3、我司不接受任何个人汇款，付款抬头必须与发票抬头一致。</p>
      <p>4、请汇款至我司以下银行账户，汇款后请及时提供水单，财务联系方式：{{lang === 'zh' ? billData.finContactCname : billData.finContactEname}}，邮箱：{{billData.finContactEmail}}</p>
    </div>
    <div class="finance-bill-detail-attention" v-show="lang === 'en'">
      <p>Attentions:</p>
      <p>1.T/T remitance must be applied when paying to {{bankAccountList.map(item => item.accountEname).join(', ')}}.</p>
      <p style="font-weight:600;">2.If there is any discrepancy, kindly contact our Accounting Dept within 2 days from the date of this invoice otherwise all charges are deemed to be correct.</p>
      <p>3.Pls highly note do not arrange payment from HSBC ( Full name :The Hongkong And Shanghai Banking Corporation Limited .) Our bank account details :</p>
    </div>
    <div class="finance-bill-bankaccountlist-cont">
      <ul class="finance-bill-bankaccountlist">
        <li v-for="(item, index) in bankAccountListHandle"
          :key="'bankAccountList' + index"
          class="finance-bill-bankaccountlist-item">
          <el-form ref="formBankAccountList" size="mini" :label-width="t('accountFormLabelWidth')">
            <el-form-item :label="t('accountName') + '：'">
              <div>{{lang === 'zh' ? item.accountName : item.accountEname}}</div>
            </el-form-item>
            <!-- <el-form-item :label="t('companyAddress') + '：'"> 20221101改成不显示
              <div>{{lang === 'zh' ? item.regAddr : item.regEaddr}}</div>
            </el-form-item> -->
            <el-form-item :label="t('bankName') + '：'">
              <div>{{lang === 'zh' ? item.bankBranch : item.bankBranchEname}}</div>
            </el-form-item>
            <template v-if="item.hasRepeat">
              <el-form-item v-for="(subItem, j) in item.repeatingAccountList" :key="'bankAccountNo' + j" :label="t('accountNo') + '（' + subItem.currency + '）' + '：'">
                <div>{{subItem.accountNo}}</div>
              </el-form-item>
            </template>
            <el-form-item v-else :label="t('accountNo') + '（' + item.currency + '）' + '：'">
              <div>{{item.accountNo}}</div>
            </el-form-item>
            <el-form-item :label="t('bankAddress') + '：'">
              <div>{{lang === 'zh' ? item.bankAddr : item.bankEaddr}}</div>
            </el-form-item>
            <el-form-item :label="'Swift Code：'">
              <div>{{item.swiftCode}}</div>
            </el-form-item>
            <el-form-item :label="'Bank Code：'">
              <div>{{item.bankCodeReal}}</div>
            </el-form-item>
            <el-form-item :label="'Branch Code：'">
              <div>{{item.bankBranchCode}}</div>
            </el-form-item>
          </el-form>
        </li>
      </ul>
    </div>
    <div class="finance-bill-detail-attention" v-show="showBankOfChinaToast && lang === 'zh'">
      <p>温馨提示：</p>
      <p>因中国银行外汇管制加强，所有境外汇款（国外、香港和国内离岸账号）款项入账要核查，入账耗时较长，请不要选择此账号付款，与我司财务索取其他账号，谢谢。</p>
    </div>
    <div class="finance-bill-detail-date">
      <p class="finance-bill-detail-date-item">
        <span class="detail-info-item-label">{{lang === 'zh' ? '日期：' : 'Date：'}}</span>
        <span class="detail-info-item-content">{{billData.billDate}}</span>
      </p>
    </div>
    <div class="finance-bill-detail-date">
      <p class="finance-bill-detail-date-item">
        <span class="detail-info-item-label">{{lang === 'zh' ? '姓名：' : 'Name：'}}</span>
        <span class="detail-info-item-content">{{lang === 'zh' ? billData.createCname : billData.createEname}}</span>
      </p>
    </div>
    <el-dialog
      :title="'邮件发送'"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      width="1000px"
      custom-class="finance-email-dialog"
      v-loading="emailLoading"
      element-loading-text="邮件发送中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <div>
        <el-form :model="form" :rules="rules" ref="form" label-width="80px" size="mini">
          <el-form-item label="收件人" prop="receive">
            <el-input v-model="form.receive" placeholder="请输入收件人邮箱（多个以英文逗号分隔）" show-word-limit maxlength="500">
            </el-input>
          </el-form-item>
          <el-form-item label="抄送人" prop="copyto">
            <el-input v-model="form.copyto" placeholder="请输入抄送人邮箱（多个以英文逗号分隔）" show-word-limit maxlength="500">
            </el-input>
          </el-form-item>
          <el-form-item label="账单格式" prop="docType">
            <el-select placeholder="请选择账单格式" v-model="form.docType" @change="changeDocType">
              <el-option v-for="(item, index) in exportTypeList" :key="'exportTypeList' + index"
                :value="item.value" :label="item.label">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="邮件主题" prop="subject">
            <el-input placeholder="请填写邮件主题" v-model="form.subject" type="textarea" :rows="2" show-word-limit maxlength="500">
            </el-input>
          </el-form-item>
          <el-form-item label="邮件内容" prop="content">
            <el-input placeholder="请填写邮件内容" v-model="form.content" type="textarea" class="finance-email-content" :rows="6" show-word-limit maxlength="500">
            </el-input>
          </el-form-item>
          <el-form-item label="邮件签名" prop="signature">
            <el-input placeholder="请填写邮件签名" v-model="form.signature" show-word-limit maxlength="500">
            </el-input>
          </el-form-item>
          <el-form-item label="附件信息" prop="file">
            <FinanceUploadEmbed :width="'100%'" :bill-file="billFile" :auto-upload="false" @send-file-list="sendFileList">
              <template #billFile="{billFile}">
                <div style="margin-top:5px;height:17px;line-height:17px;">
                  <span style="color:#1890ff;text-decoration:underline;cursor:pointer;" @click.stop="billFile.callback">{{billFile.name}}</span>
                </div>
              </template>
            </FinanceUploadEmbed>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="mini" @click="sendBillEmail">发送</el-button>
        <el-button @click="dialogVisible = false" size="mini">取消</el-button>
      </span>
    </el-dialog>
  </div>
  <div v-if="!isFromProp" class="finance-bill-detail-btns">
    <el-button v-if="checkAuth($route.name, 'btn-email')" type="primary" class="finance-btn" @click="openBillEmailDialog" size="mini">发送邮件</el-button>
    <el-button v-if="checkAuth($route.name, 'btn-print')" class="finance-btn" v-print="printObj" size="mini">打印</el-button>
    <div v-if="checkAuth($route.name, 'btn-export')" class="select-template-box">
      <el-dropdown trigger="click" @command="handleExport($event)">
        <span class="el-dropdown-link">
          导出
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="(item, index) in exportTypeList" :key="'exportTypeList' + index"
            :command="item.value">
            {{item.label}}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-button class="finance-btn finance-bill-detail-back" @click="cancel" size="mini">返回</el-button>
  </div>
</div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { getBillDetail, sendBillMail, print } from '@/api/fin/bill'
import { companyBillBankAccountList } from '@/api/fin/settleUnitBankAcct' // 改成当前用户所属分公司的银行账户和深圳分公司的银行账号-20210809
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { billMixin } from '@/views/finance/mixins/billMixin'
import { getValueByKey } from '@/api/base'
import FinanceUploadEmbed from '@/views/finance/components/financeUpload/financeUploadEmbed'
import { dateFormat } from '@/views/finance/utils/finance'

export default {
  mixins: [mixin, billMixin, routerMixin],
  props: {
    propBillData: {
      type: Object,
      default: () => ({})
    },
    isFromProp: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      cabinetNo: 0,
      customsNo: 0,
      showOptions: [], // ['custNameShow', 'custAddrShow', 'orderNoShow', 'soShow', 'cnShow', 'hblShow', 'mblShow', 'etdShow', 'etaShow', 'vesselShow', 'polPortCodeShow', 'podPortCodeShow'], // , 'atdShow', 'custIntrustNoShow',
      bankAccount: '',
      billData: {},
      option1: {},
      totalFeeList: [],
      exportTypeList: [
        {
          label: 'XLS',
          value: 'XLS'
        },
        {
          label: 'PDF',
          value: 'PDF'
        },
        {
          label: 'DOC',
          value: 'DOC'
        }
      ],
      dialogVisible: false,
      form: {
        receive: '',
        copyto: this.$store.getters.userInfo.email,
        docType: 'PDF',
        subject: '',
        content: '',
        signature: '此邮件由系统发出,请勿直接回复'
      },
      rules: {
        receive: [
          { required: true, message: '邮箱不能为空', trigger: 'blur' },
          {
            validator: this.validateReceive,
            trigger: 'blur'
          }
        ],
        copyto: [
          // { required: true, message: '邮箱不能为空', trigger: 'blur' },
          {
            validator: this.validateReceive,
            trigger: 'blur'
          }
        ],
        docType: [
          { required: true, message: '格式不能为空', trigger: 'blur' }
        ],
        subject: [
          { required: true, message: '主题不能为空', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '内容不能为空', trigger: 'blur' }
        ],
      },
      printObj: {
        id: "printBillDetail",
        popTitle: '账单',
        extraCss: '',
        // extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>',
        extraHead: '<style media="print">@page {size: portrait !important; margin: 4mm 1mm 4mm 5mm;}table tr td {border-bottom: 1px solid #4A4A4A;}.finance-table .vxe-table--render-default .vxe-table--border-line {border: 1px solid #4A4A4A;}.bill-title-arrow {display: none;}.finance-bill-detail-main{width: 794px !important;}.el-form-item__label{height: 20px !important;line-height:20px !important;}.el-form-item__content{line-height:20px !important;}.fin-bill-switch-remark{display:none;}</style>', // .el-table thead.is-group th {text-align: center} // table tr th {border-bottom: 1px solid #4A4A4A;} 竖向打印要控制在794px以内
      },
      bankAccountSelectOptions3: [],
      settleUnitBankAcctIds: [],
      accountShortNames: [],
      bankAccountList: [],
      docType: 'PDF',
      lang: 'zh',
      billI18n: {
        zh: {
          // companyName: '深圳市长帆国际物流股份有限公司',
          companyName:'',
          billNo: '系统账单编号',
          dnNo: '账单号',
          invoiceDate: '开票日期',
          customerName: '客户名称',
          custAddr: '客户地址',
          jobNo: '工作号',
          billDate: '生成日期', // 账单日期
          custIntrustNo: '客户委托号',
          SO: '订舱号',
          etd: '开航日期',
          eta: '到港日期',
          atd: '实际开航日期',
          bargeEtd: '驳船ETD',
          bargeAtd: '驳船ATD',
          vesselVoyage: '船名/航次',
          polPortName: '起运港',
          blNo: '提单号',
          podPortName: '目的港',
          cn: '箱号',
          customsNo: '报关单号',
          address: '深圳市罗湖区深南东路文华大厦西座12F', // '地址：深圳市罗湖区深南东路文华大厦西座12F'
          email: '邮箱',
          total: '合计',
          accountName: '开户名称',
          bankName: '开户行',
          accountNo: '账号',
          bankAddress: '银行地址',
          companyAddress: '公司地址',
          accountFormLabelWidth: '110px',
          airLine: '航司',
          eflightNumber: '航班号',
          totalQuantity: '件数',
          totalWeight: '毛重',
          totalVolume: '体积',
          chargeWeight: '计费重',
        },
        en: {
          // companyName: 'LONG SAIL INTERNATIONAL LOGISTICS CO.,LTD.',
          companyName: '',
          billNo: 'Bill No',
          dnNo: 'Invoice No',
          invoiceDate: 'Invoice Date',
          customerName: 'Cust Name',
          custAddr: 'Cust Address',
          jobNo: 'Job No',
          billDate: 'Bill Date',
          custIntrustNo: 'CustIntrust No',
          SO: 'SO',
          etd: 'ETD',
          eta: 'ETA',
          atd: 'ATD',
          bargeEtd: 'Barge ETD',
          bargeAtd: 'Barge ATD',
          vesselVoyage: 'Vessel/Flight',
          polPortName: 'POL Name',
          blNo: 'Bl No',
          podPortName: 'POD Name',
          cn: 'Container No',
          customsNo: 'Customs No',
          address: '12F, West Block, Wenhua Building, Shennan East Road, Luohu District, Shenzhen', // 'Address：12F, West Block, Wenhua Building, Shennan East Road, Luohu District, Shenzhen'
          email: 'Email',
          total: 'Total',
          accountName: 'Account Name',
          bankName: 'Bank Name',
          accountNo: 'Account No',
          bankAddress: 'Bank Address',
          companyAddress: 'Company Address',
          accountFormLabelWidth: '140px',
          airLine: 'Vessel/Flight',
          eflightNumber: 'FLT',
          totalQuantity: 'PKG(S)',
          totalWeight: 'G.W.',
          totalVolume: 'VOL(CBM)',
          chargeWeight: 'C.W.',
        }
      },
      billId: '',
      source: '',
      emailLoading: false,
      cTimestamp: 0,
      showBankOfChinaToast: false,
      longsailTitle: '',
      showTitleDropdown: false,
      bankAccountSelectChange: false,
      bankAccountListHandle: [],
      billChange: false,
      // feeRemarkShow: 'yes',
      feeRemarkChecked: true,
      defaultBankAccount: [],
      positiveChecked: false,
      positiveBtnShow: false,
      adjustFeeGedgingChecked: false,
      adjustFeeGedgingShow: false,
      receipayTypeBackup: '',
      agentCompCode: '',
      bankInfos: [],
      ascColumns: '',
      descColumns: '',
      billFile: {},
      fileList: [],
      isOrderBill: true,
      regAddrDisabled: true,
    }
  },
  created() {
    this.option1 = Object.assign({}, this.option, {
      id: 'option1', $name: 'BillDetail',
      columns:[
        {
          prop: 'feeName',
          label: '费用名称',
          type: 'text'
        },
        {
          prop: 'currency',
          label: '币种',
          type: 'text'
        },
        {
          prop: 'receipayType',
          label: '收付类型',
          type: 'select'
        },
        {
          prop: 'unitCount',
          label: '数量',
          type: 'text'
        },
        {
          prop: 'unitPrice',
          label: '单价',
          type: 'text'
        },
        {
          prop: 'feeAmt',
          label: '合计',
          type: 'text'
        },
        // {
        //   prop: 'feeAmt',
        //   label: '费用合计',
        //   type: 'text'
        // },
        // {
        //   prop: 'writeOffAmt',
        //   label: '已核销金额',
        //   type: 'text'
        // },
        // {
        //   prop: 'noWriteOffAmt',
        //   label: '未核销金额',
        //   type: 'text'
        // }
      ],
      data: [],
      tips: {
        text: '',
        show: false
      },
      selection: {
        show: false
      },
      operationBtns: {
        show: false,
        data: []
      },
      sortable: true,
      sortChange: this.sortChange,
    })
    this.cTimestamp = new Date().getTime()
    this.setColumns()
    this.init()
    this.getData()
  },
  activated() {
    let timestamp = new Date().getTime()
    if (!this.$route.meta.isUseCache && timestamp - this.cTimestamp > 300) {
      this.showOptions = []
      this.settleUnitBankAcctIds = []
      this.bankAccountList = []
      this.showBankOfChinaToast = false
      this.billChange = false
      // this.feeRemarkChecked = true // 还是依循用户选择的
      this.setColumns()
      this.init()
      this.getData()
    }
  },
  mounted() {
    // document.getElementsByClassName('finance-bill-detail-btns')[0].addEventListener('click', (e) => {
    //   if (e.target.innerHTML === '打印') {
    //     let data = {
    //       billId: this.billId
    //     }
    //     print(data).then(res => {
    //     })
    //   }
    // })
  },
  methods: {
    init() {
      console.log('route.query:', this.$route.query)
      this.source = this.$route.query.source
      this.billId = this.$route.query.billId
    },
    getData() {
      let data = {
        "billId": this.billId
      }
      let Fn = getBillDetail
      if (this.isFromProp) {
        Fn = this.getPropBillData
      }
      Fn(data).then(res => { // getBillDetail(data).then(res => {
        if (res.code === 0) {
          this.billData = res.data
          // this.feeRemarkShow = this.billData.feeRemarkShow === 'no' ? 'no' : 'yes'
          if (this.billData.feeRemarkShow === 'no') {
            this.feeRemarkChecked = false
          } else if (this.billData.feeRemarkShow === 'yes') {
            this.feeRemarkChecked = true
          }
          if (this.billData.positiveBtnShow === 'yes') {
            this.positiveBtnShow = true
          } else {
            this.positiveBtnShow = false
          }
          if (this.billData.positiveShow === 'yes') {
            this.positiveChecked = true
          } else {
            this.positiveChecked = false
          }
          if (this.billData.fees.some(item => item.adjustFeeGedging === 'yes')) {
            this.adjustFeeGedgingShow = true
            this.adjustFeeGedgingChecked = true
          } else {
            this.adjustFeeGedgingShow = false
            this.adjustFeeGedgingChecked = false
          }
          this.receipayTypeBackup = this.billData.receipayType
          this.lang = this.billData.lang.toUpperCase() === 'US' ? 'en' : 'zh'
          this.agentCompCode = this.billData.agentCompCode
          this.bankInfos = this.billData.bankInfos
          this.billData.fees.forEach(item => {
            if (item.feeHistoryId !== item.maxFeeHistoryId) {
              item.redMark = true
            } else {
              item.redMark = false
            }
            item.feeNameBackup = item.feeName
            item.feeEnNameBackup = item.feeEnName
          })
          this.switchLang(true) // 根据语言初始化表头
          let keys = Object.keys(this.billData.totalMap)
          this.totalFeeList = keys.map(key => {
            return {
              key,
              value: this.billData.totalMap[key]
            }
          })
          this.showOptions = res.data.showHideFiledList.filter(item => item !== 'billNoShow')
          // 兼容历史数据
          if (this.showOptions.length && !this.showOptions.some(item => item === 'regAddrShow' || item ==='officAddrShow')) {
            this.showOptions.push('regAddrShow')
          }
          if (this.ship) {
            this.showOptions = this.showOptions.length > 0 ? this.showOptions : ['custNameShow', 'custAddrShow', 'dnNoShow', 'orderNoShow', 'soShow', 'cnShow', 'hblShow', 'mblShow', 'etdShow', 'atdShow', 'etaShow', 'vesselShow', 'polPortCodeShow', 'podPortCodeShow', 'regAddrShow'] // 'custIntrustNoShow', 'billNoShow',
          } else if (this.air) {
            this.showOptions = this.showOptions.length > 0 ? this.showOptions : ['custNameShow', 'custAddrShow', 'dnNoShow', 'orderNoShow', 'hblShow', 'mblShow', 'etdShow', 'etaShow', 'airLineShow', 'eflightNumberShow', 'polPortCodeShow', 'podPortCodeShow', 'totalQuantityShow', 'totalWeightShow', 'totalVolumeShow', 'chargeWeightShow', 'regAddrShow'] // 'custIntrustNoShow', 'billNoShow',
          } else if (this.rail) {
            this.showOptions = this.showOptions.length > 0 ? this.showOptions : ['custNameShow', 'custAddrShow', 'dnNoShow', 'orderNoShow', 'cnShow', 'hblShow', 'mblShow', 'etdShow', 'vesselShow', 'polPortCodeShow', 'podPortCodeShow', 'totalQuantityShow', 'totalWeightShow', 'totalVolumeShow', 'regAddrShow'] // 'custIntrustNoShow', 'billNoShow',
          }
          // 如果使用我司注册地址regAddrShow，regAddrDisabled置为true；否则置为false
          if (this.showOptions.includes('regAddrShow')) {
            this.regAddrDisabled = true
          } else if (this.showOptions.includes('officAddrShow')) {
            this.regAddrDisabled = false
          }
          getValueByKey('fin_bill_show_default_bank_account').then(res => {
            this.defaultBankAccount = JSON.parse(res.data)
            return this.companyBankAccountListPm('')
          }).then(resIn => {
            if (resIn.code === 0) {
              let bankIdList = res.data.bankIdList
              let changeTitleOrNot = false // 是否改变标题
              if (!bankIdList.length) {
                bankIdList = []
                let hasAccByBaseConfig = false
                let bool = false
                if (this.defaultBankAccount && this.defaultBankAccount.length > 0) {
                  this.bankAccountSelectOptions3.forEach(item => {
                    bool = this.defaultBankAccount.some(acc => {
                      return item.ownerCompanyCode === acc.owner_company_code && item.bankName === acc.bank_name && acc.currency.includes(item.currency)
                    })
                    if (bool) {
                      bankIdList.push(item.settleUnitBankAcctId)
                      hasAccByBaseConfig = true
                      changeTitleOrNot = true 
                    }
                  })
                }
                if (!hasAccByBaseConfig) {
                  this.totalFeeList.forEach(item => {
                    let obj = this.bankAccountSelectOptions3.find(subItem => {
                      return subItem.currency === item.key && subItem.hasDefault === 'yes'
                    })
                    if (obj) {
                      bankIdList.push(obj.settleUnitBankAcctId)
                      changeTitleOrNot = true 
                    }
                  })
                }
              }
              this.settleUnitBankAcctIds = bankIdList.map(item => {
                return Number(item) // 后台此处返回的字符串
              })
              this.companyBankAccountChange(this.settleUnitBankAcctIds, changeTitleOrNot)
            }
          })
          this.longsailTitle = this.billData.longsailTitle // === '01' ? true : false
          if (res.data.billChange) {
            this.billChange = true
          }
        }
      }).catch(err => {
        console.log(err)
      })
    },
    getPropBillData() {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log(this)
          console.log(this.propBillData)
          let res = {
            code: 0,
            data: this.propBillData
          }
          resolve(res)
        }, 100)
      })
    },
    getValueByKeyDefaultAcc() {
      return new Promise((resolve, reject) => {
        getValueByKey('fin_bill_show_default_bank_account').then(res => {
          resolve(res)
        }).then(err => {
          reject(err)
        })
      })
      return 
    },
    switchFeeRemark(val) {
      console.log(val)
      // this.feeRemarkShow = this.feeRemarkShow === 'no' ? 'yes' : 'no'
      // this.feeRemarkShow = val ? 'yes' : 'no'
      this.setColumns()
      this.handleFeeRemarkData()
    },
    switchPositive(val) {
      this.option1.data.forEach(item => {
        if (item.sign === 'negative') {
          item.unitPrice = 0 - item.unitPrice
          item.feeAmt = 0 - item.feeAmt
          item.receipayType = item.receipayType === 'receive' ? 'pay' : 'receive'
        }
      })
    },
    handleFeeRemarkData() {
      // if (this.feeRemarkShow === 'yes') {
      if (this.feeRemarkChecked) {
        this.billData.fees.forEach(item => {
          if (item.remark) {
            item.feeName = `${item.feeNameBackup} (${item.remark})`
            item.feeEnName = `${item.feeEnNameBackup} (${item.remark})`
          }
        })
      } else {
        this.billData.fees.forEach(item => {
          if (item.remark) {
            item.feeName = `${item.feeNameBackup}`
            item.feeEnName = `${item.feeEnNameBackup}`
          }
        })
      }
      this.option1.data = this.billData.fees.map(item => item)
      this.option1DataBackup = JSON.parse(JSON.stringify(this.option1.data))
    },
    switchAdjustFeeGedging(val) {
      console.log(val)
      if (val) {
        this.option1.data = this.billData.fees.map(item => item)
        let keys = Object.keys(this.billData.totalMap) // totalMap 全部的
        this.totalFeeList = keys.map(key => {
          return {
            key,
            value: this.billData.totalMap[key]
          }
        })
        this.billData.receipayType = this.receipayTypeBackup
      } else {
        this.option1.data = this.billData.fees.filter(item => item.adjustFeeGedging === 'no')
        let keys = Object.keys(this.billData.totalNoAdjustGedingFeeMap) // totalNoAdjustGedingFeeMap 不含对冲的
        this.totalFeeList = keys.map(key => {
          return {
            key,
            value: this.billData.totalNoAdjustGedingFeeMap[key]
          }
        })
        this.billData.receipayType = this.billData.receipayTypeWithOutGedgingFee
      }
    },
    cancel() {
      this.routerBack()
      // let jumpRouteFromToList = this.jumpRouteFromToList
      // let fromTo = jumpRouteFromToList && jumpRouteFromToList.find(item => {
      //   return item.to.name === 'BillDetail'
      // })
      // this.$router.push({
      //   path: fromTo ? fromTo.from.path : '',
      //   query: fromTo ? fromTo.from.query : ''
      // })
    },
    handleExport(command, $this) {
      $this = $this ? $this : this
      $this.$message({
        message: '导出中，请留意下载的区域',
        type: 'warning',
        showClose: true,
        duration: 5000
      })
      $this.docType = command
      $this.$store.dispatch('finance/downloadBlobFile', {
        uri: '/fin/bill/export',
        params: {
          billId: $this.billId,
          docType: command,
          lang: $this.lang === 'zh' ? 'CN' : 'US',
          // containNoShow: $this.showOptions.includes('containNoShow') ? 1 : 0,
          // customsDecNoShow: $this.showOptions.includes('customsDecNoShow') ? 1 : 0,
          custNameShow: $this.showOptions.includes('custNameShow') ? '01' : '00',
          custAddrShow: $this.showOptions.includes('custAddrShow') ? '01' : '00',
          orderNoShow: $this.showOptions.includes('orderNoShow') ? '01' : '00',
          soShow: $this.showOptions.includes('soShow') ? '01' : '00',
          cnShow: $this.showOptions.includes('cnShow') ? '01' : '00',
          custIntrustNoShow: $this.showOptions.includes('custIntrustNoShow') ? '01' : '00',
          hblShow: $this.showOptions.includes('hblShow') ? '01' : '00',
          mblShow: $this.showOptions.includes('mblShow') ? '01' : '00',
          billDateShow: $this.showOptions.includes('billDateShow') ? '01' : '00',
          bargeEtdShow: $this.showOptions.includes('bargeEtdShow') ? '01' : '00',
          bargeAtdShow: $this.showOptions.includes('bargeAtdShow') ? '01' : '00',
          etdShow: $this.showOptions.includes('etdShow') ? '01' : '00',
          atdShow: $this.showOptions.includes('atdShow') ? '01' : '00',
          etaShow: $this.showOptions.includes('etaShow') ? '01' : '00',
          vesselShow: $this.showOptions.includes('vesselShow') ? '01' : '00',
          polPortCodeShow: $this.showOptions.includes('polPortCodeShow') ? '01' : '00',
          podPortCodeShow: $this.showOptions.includes('podPortCodeShow') ? '01' : '00',
          // billNoShow: $this.showOptions.includes('billNoShow') ? '01' : '00',
          dnNoShow: $this.showOptions.includes('dnNoShow') ? '01' : '00',
          invoiceDateShow: $this.showOptions.includes('invoiceDateShow') ? '01' : '00',
          airLineShow: $this.showOptions.includes('airLineShow') ? '01' : '00',
          eflightNumberShow: $this.showOptions.includes('eflightNumberShow') ? '01' : '00',
          totalQuantityShow: $this.showOptions.includes('totalQuantityShow') ? '01' : '00',
          totalWeightShow: $this.showOptions.includes('totalWeightShow') ? '01' : '00',
          totalVolumeShow: $this.showOptions.includes('totalVolumeShow') ? '01' : '00',
          chargeWeightShow: $this.showOptions.includes('chargeWeightShow') ? '01' : '00',
          regAddrShow: $this.showOptions.includes('regAddrShow') ? '01' : '00',
          officAddrShow: $this.showOptions.includes('officAddrShow') ? '01' : '00',
          settleUnitBankAcctIds: $this.bankAccountList.map(item => {
            return item.settleUnitBankAcctId
          }).join(','),
          longsailTitle: $this.longsailTitle, // ? '01' : '00',
          // feeRemarkShow: $this.feeRemarkShow,
          feeRemarkShow: $this.feeRemarkChecked ? 'yes' : 'no',
          positiveShow: $this.positiveChecked ? 'yes' : 'no',
          adjustGedgingFeeShow: $this.adjustFeeGedgingChecked ? 'yes' : 'no',
          ascColumns: $this.ascColumns,
          descColumns: $this.descColumns,
        }
      }).then(res => {
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(res)
        link.download = '账单' + this.billData.orderBillNo + '.' + command.toLowerCase()
        link.click()
      })
    },
    showOptionsChange(value) {
      if (this.regAddrDisabled) {
        if (value.includes('officAddrShow')) {
          let index = this.showOptions.findIndex(item => item === 'regAddrShow')
          this.showOptions.splice(index, 1)
          this.regAddrDisabled = false
        }
      } else {
        if (value.includes('regAddrShow')) {
          let index = this.showOptions.findIndex(item => item === 'officAddrShow')
          this.showOptions.splice(index, 1)
          this.regAddrDisabled = true
        }
      }
    },
    companyBankAccountList(queryString) {
      let data = {
        // "accountName": queryString // 默认查询出自己分公司的账号
        companyCode: this.agentCompCode
      }
      companyBillBankAccountList(data).then(res => {
        if (res.code === 0) {
          this.bankAccountSelectOptions3 = res.data.map(item => {
            item.value = item.settleUnitBankAcctId
            item.label = item.accountShortName
            return item
          })
        }
      })
    },
    companyBankAccountListPm(queryString) {
      let data = {
        // "accountName": queryString // 默认查询出自己分公司的账号
        unitCode: this.agentCompCode,
        orderBillNo: this.billData.orderBillNo
      }
      return new Promise((resolve, reject) => {
        companyBillBankAccountList(data).then(res => {
          if (res.code === 0) {
            this.bankAccountSelectOptions3 = this.bankInfos.map(item => {
              item.value = item.settleUnitBankAcctId
              item.label = item.accountShortName
              return item
            })
            res.data.forEach(item => {
              if (this.bankAccountSelectOptions3.every(op => {
                return item.settleUnitBankAcctId !== op.settleUnitBankAcctId
              })) {
                item.value = item.settleUnitBankAcctId
                item.label = item.accountShortName
                this.bankAccountSelectOptions3.push(item)
              }
            })
            resolve(res)
          }
        })
      })
    },
    openBillEmailDialog() {
      let command = this.form.docType
      let callback = (function(command, $this) {
        return function() {
          $this.handleExport(command, $this)
        }
      })(command, this)
      this.billFile = {
        name: '账单' + this.billData.orderBillNo + '.' + command.toLowerCase(),
        callback
      }
      this.dialogVisible = true
    },
    changeDocType(val) {
      this.openBillEmailDialog()
    },
    sendFileList(payload) {
      this.fileList = payload
    },
    sendBillEmail() {
      const form = new FormData()
      this.fileList.forEach(item => {
        form.append('fileList', item)
      })
      let data = {
        billId: this.billId,
        toEmails: this.form.receive,
        ccEmails: this.form.copyto,
        subject: this.form.subject,
        content: this.form.content,
        signature: this.form.signature,
        docType: this.form.docType,
        lang: this.lang === 'zh' ? 'CN' : 'US',
        // containNoShow: this.showOptions.includes('containNoShow') ? 1 : 0,
        // customsDecNoShow: this.showOptions.includes('customsDecNoShow') ? 1 : 0,
        custNameShow: this.showOptions.includes('custNameShow') ? '01' : '00',
        custAddrShow: this.showOptions.includes('custAddrShow') ? '01' : '00',
        orderNoShow: this.showOptions.includes('orderNoShow') ? '01' : '00',
        soShow: this.showOptions.includes('soShow') ? '01' : '00',
        cnShow: this.showOptions.includes('cnShow') ? '01' : '00',
        custIntrustNoShow: this.showOptions.includes('custIntrustNoShow') ? '01' : '00',
        hblShow: this.showOptions.includes('hblShow') ? '01' : '00',
        mblShow: this.showOptions.includes('mblShow') ? '01' : '00',
        billDateShow: this.showOptions.includes('billDateShow') ? '01' : '00',
        bargeEtdShow: this.showOptions.includes('bargeEtdShow') ? '01' : '00',
        bargeAtdShow: this.showOptions.includes('bargeAtdShow') ? '01' : '00',
        etdShow: this.showOptions.includes('etdShow') ? '01' : '00',
        atdShow: this.showOptions.includes('atdShow') ? '01' : '00',
        etaShow: this.showOptions.includes('etaShow') ? '01' : '00',
        vesselShow: this.showOptions.includes('vesselShow') ? '01' : '00',
        polPortCodeShow: this.showOptions.includes('polPortCodeShow') ? '01' : '00',
        podPortCodeShow: this.showOptions.includes('podPortCodeShow') ? '01' : '00',
        // billNoShow: this.showOptions.includes('billNoShow') ? '01' : '00',
        dnNoShow: this.showOptions.includes('dnNoShow') ? '01' : '00',
        invoiceDateShow: this.showOptions.includes('invoiceDateShow') ? '01' : '00',
        airLineShow: this.showOptions.includes('airLineShow') ? '01' : '00',
        eflightNumberShow: this.showOptions.includes('eflightNumberShow') ? '01' : '00',
        totalQuantityShow: this.showOptions.includes('totalQuantityShow') ? '01' : '00',
        totalWeightShow: this.showOptions.includes('totalWeightShow') ? '01' : '00',
        totalVolumeShow: this.showOptions.includes('totalVolumeShow') ? '01' : '00',
        chargeWeightShow: this.showOptions.includes('chargeWeightShow') ? '01' : '00',
        regAddrShow: this.showOptions.includes('regAddrShow') ? '01' : '00',
        officAddrShow: this.showOptions.includes('officAddrShow') ? '01' : '00',
        settleUnitBankAcctIds: this.bankAccountList.map(item => {
          return item.settleUnitBankAcctId
        }),
        longsailTitle: this.longsailTitle, // ? '01' : '00',
        // feeRemarkShow: this.feeRemarkShow,
        feeRemarkShow: this.feeRemarkChecked ? 'yes' : 'no',
        positiveShow: this.positiveChecked ? 'yes' : 'no',
        adjustGedgingFeeShow: this.adjustFeeGedgingChecked ? 'yes' : 'no',
        ascColumns: this.ascColumns,
        descColumns: this.descColumns,
      }
      form.append('data', JSON.stringify(data))
      form.append('reqTime', dateFormat('yyyy/mm/dd HH:MM:SS', new Date()))
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.emailLoading = true
          this.$store.dispatch('user/import', { uri: '/fin/bill/sendBillMail', params: form })
          .then((res) => {
            this.$message({
              type: 'success',
              message: '发送邮件成功!',
              showClose: true
            })
            this.dialogVisible = false
          })
          .finally(() => (this.emailLoading = false))
          // sendBillMail(data).then(res => {
          //   if (res.code === 0) {
          //     this.$message({
          //       type: 'success',
          //       message: '发送邮件成功!',
          //       showClose: true
          //     })
          //     this.dialogVisible = false
          //   } else {
          //     this.$message({
          //       type: 'error',
          //       message: '发送邮件失败!',
          //       showClose: true
          //     })
          //   }
          //   this.emailLoading = false
          // }).catch(err => {
          //   console.log(err)
          //   this.emailLoading = false
          // })
        } else {
        }
      })
    },
    validateReceive(rule, value, callback) {
      if (value === '') {
        if (rule.field === 'receive') {
          callback(new Error('请输入邮箱'))
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
    switchLang(isInit) {
      if (isInit === true) {
      } else {
        this.lang = this.lang === 'en' ? 'zh' : 'en'
      }
      this.setColumns()
      this.handleFeeRemarkData()
    },
    setColumns() {
      if (this.lang === 'en') {
        this.option1.columns = [
          {
            prop: 'feeEnName',
            label: 'Expense item',
            type: 'text',
            width: 280
          },
          {
            prop: 'currency',
            label: 'currency',
            type: 'text',
            width: 81
          },
          {
            prop: 'receipayType',
            label: 'receipayType',
            type: 'select',
            formatter: ({cellValue}) => cellValue,
            width:  104
          },
          {
            prop: 'unitCount',
            label: 'quantity',
            type: 'text',
            width:  81
          },
          {
            prop: 'unitPrice',
            label: 'unit price',
            type: 'text',
            width: 98
          },
          {
            prop: 'feeAmt',
            label: 'total',
            type: 'text',
            width: 81
          },
          // {
          //   prop: 'writeOffAmt',
          //   label: 'writeoffAmt',
          //   type: 'text'
          // },
          // {
          //   prop: 'noWriteOffAmt',
          //   label: 'noWriteOffAmt',
          //   type: 'text'
          // }
        ]
      } else if (this.lang === 'zh') {
        this.option1.columns = [
          {
            prop: 'feeName',
            label: '费用名称',
            type: 'text',
            width: 350
          },
          {
            prop: 'receipayType',
            label: '收付类型',
            type: 'select',
          },
          {
            prop: 'currency',
            label: '币种',
            type: 'text',
            // width: 100
          },
          {
            prop: 'unitCount',
            label: '数量',
            type: 'text',
            // width: 100
          },
          {
            prop: 'unitPrice',
            label: '单价',
            type: 'text',
            width: 85
          },
          {
            prop: 'feeAmt',
            label: '合计',
            type: 'text',
            width: 85
          },
          // {
          //   prop: 'writeOffAmt',
          //   label: '已核销金额',
          //   type: 'text'
          // },
          // {
          //   prop: 'noWriteOffAmt',
          //   label: '未核销金额',
          //   type: 'text'
          // }
        ]
      }
    },
    t(property) {
      return this.billI18n[this.lang][property]
    }
  },
  computed: {
    ship() {
      return this.billData.businessType && this.billData.businessType.includes('ship')
    },
    air() {
      return this.billData.businessType && this.billData.businessType.includes('air')
    },
    rail() {
      return this.billData.businessType && this.billData.businessType.includes('rail')
    },
    getCompanyName() {
      let companyNameList = []
      if (this.lang === 'zh') {
        companyNameList = this.bankAccountList.map(item => {
          return item.accountName
        })
        companyNameList = [... new Set(companyNameList)]
        if (companyNameList.length === 0) {
          // companyNameList = ['深圳市长帆国际物流股份有限公司']
        }
      } else if (this.lang === 'en') {
        companyNameList = this.bankAccountList.map(item => {
          return item.accountEname
        })
        companyNameList = [... new Set(companyNameList)]
        if (companyNameList.length === 0) {
          // companyNameList = ['LONG SAIL INTERNATIONAL LOGISTICS CO.,LTD.']
        }
      }
      if (this.bankAccountSelectChange) {
        this.longsailTitle = companyNameList.join(',')
      }
      return companyNameList
    },
    getCompanyAddress() {
      let companyAddressList = []
      if (this.lang === 'zh') {
        companyAddressList = this.bankAccountList.map(item => {
          return this.regAddrDisabled ? item.regAddr : item.officAddr
        })
        companyAddressList = [... new Set(companyAddressList)]
        if (companyAddressList.length === 0) {
          // companyAddressList = ['深圳市罗湖区深南东路文华大厦西座12F']
        }
      } else if (this.lang === 'en') {
        companyAddressList = this.bankAccountList.map(item => {
          return this.regAddrDisabled ? item.regEaddr : item.officEaddr
        })
        companyAddressList = [... new Set(companyAddressList)]
        if (companyAddressList.length === 0) {
          // companyAddressList = ['12F, West Block, Wenhua Building, Shennan East Road, Luohu District, Shenzhen']
        }
      }
      return companyAddressList
    },
    getWebsite() {
      // if (!this.bankAccountList.length) {
      //   return ''
      // } else {
        return 'http://www.longsailing.net'
      // }
    },
    getBankName() {
      let bankNameList = []
      if (this.lang === 'zh') {
        bankNameList = this.bankAccountList.map(item => {
          return item.bankName
        })
        bankNameList = [... new Set(bankNameList)]
      } else if (this.lang === 'en') {
        bankNameList = this.bankAccountList.map(item => {
          return item.bankEname
        })
        bankNameList = [... new Set(bankNameList)]
      }
      return bankNameList
    },
    getCompanyEname() {
      let companyNameList = []
      if (this.lang === 'zh') {
        companyNameList = this.bankAccountList.map(item => {
          return item.accountName
        })
        companyNameList = [... new Set(companyNameList)]
        if (companyNameList.length === 0 && this.bankAccountList.length === 0) {
          // companyNameList = ['LONG SAIL INTERNATIONAL LOGISTICS CO.,LTD.']
        }
      } else if (this.lang === 'en') {
        // companyNameList = this.bankAccountList.map(item => {
        //   return item.companyEname
        // })
        // if (companyNameList.length === 0) {
        //   companyNameList = ['LONG SAIL INTERNATIONAL LOGISTICS CO.,LTD.']
        // }
      }
      return companyNameList
    },
  },
  watch: {
    dialogVisible(newVal) {
      if (newVal) {
        this.$refs.form && this.$refs.form.resetFields()
        this.$refs.form && this.$refs.form.clearValidate()
      }
    },
    getBankName(newVal) {
      if (newVal) {
        let bool = newVal.some(item => {
          return item.includes('中国银行') || item.includes('Bank of China')
        })
        if (bool) {
          this.showBankOfChinaToast = true
        } else {
          this.showBankOfChinaToast = false
        }
      }
    },
    ship(newVal) {
      if (newVal) {
        this.billI18n.zh.podPortName = '目的港'
        this.billI18n.zh.etd = '大船ETD'
        this.billI18n.zh.eta = '大船ETA'
        this.billI18n.zh.atd = '大船ATD'
        this.billI18n.en.etd = 'ETD'
        this.billI18n.en.eta = 'ETA'
        this.billI18n.en.atd = 'ATD'
        this.billI18n.en.polPortName = 'PolPort Name'
        this.billI18n.en.podPortName = 'PodPort Name'
      }
    },
    air(newVal) {
      if (newVal) {
        this.billI18n.zh.podPortName = '目的地'
        this.billI18n.zh.etd = '起飞时间'
        this.billI18n.zh.eta = '到达时间'
        this.billI18n.zh.totalWeight = '毛重'
        this.billI18n.en.polPortName = 'LOADING'
        this.billI18n.en.podPortName = 'DEST'
      }
    },
    rail(newVal) {
      if (newVal) {
        this.billI18n.zh.polPortName = '起运站'
        this.billI18n.zh.podPortName = '目的站'
        this.billI18n.zh.etd = '发车时间'
        this.billI18n.zh.eta = '到达时间'
        this.billI18n.zh.vesselVoyage = '班名/班次'
        this.billI18n.zh.totalWeight = '重量'
        this.billI18n.en.polPortName = 'LOADING'
        this.billI18n.en.podPortName = 'DEST'
      }
    },
  },
  components: {
    FinanceTable,
    FinanceUploadEmbed
  }
}
</script>
<style lang="scss">
@import '~@/views/finance/style/bill.scss';
</style>
<style scoped>
.detail-info-item {
  /* width: 262px; */
  width: calc(33% - 14px);
  margin-right: 14px;
  margin-bottom: 4px;
}
.detail-info-other {
  margin-bottom: 14px;
}
.finance-bill-detail-totalfee {
  height: 40px;
  text-align: right;
  padding: 8px 90px;
  font-size: 14px;
  font-weight: 600;
  color: #222222;
  line-height: 24px;
}
.finance-bill-detail-totalfee span {
  margin-right: 12px;
}
</style>
