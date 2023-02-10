<template>
  <div>
    <el-form :inline="true" :model="formData" label-width="80px" ref="form" size="mini">
      <template v-if="operType !== 'add'">
      <div class="checkbox">
        <!-- <el-checkbox true-label="yes" false-label="no" v-model="formData.hasCopyNo" disabled>抄号</el-checkbox> -->
        <el-checkbox true-label="yes" false-label="no" v-model="formData.hasCarrayOverweight" disabled>提柜过磅
        </el-checkbox>
        <el-checkbox true-label="yes" false-label="no" v-model="formData.hasReturnOverweight" disabled>还柜过磅
        </el-checkbox>
        <el-checkbox true-label="yes" false-label="no" v-model="formData.hasDisinfect" disabled>消毒放药</el-checkbox>
        <el-checkbox true-label="yes" false-label="no" v-model="formData.hasDoubleLayerWinch" disabled>使用双层缆盘
        </el-checkbox>
        <el-checkbox true-label="yes" false-label="no" v-model="formData.hasThreeLayerWinch" disabled>使用三层缆盘
        </el-checkbox>
        <el-checkbox true-label="yes" false-label="no" v-model="formData.hasSelfVehicle" disabled>自派车</el-checkbox>
      </div>
      <el-form-item label="仓库名称：">
        {{ formData.warehouseName }}
      </el-form-item>
      <el-form-item label="入库单号：">
        {{ formData.inboundNos }}
      </el-form-item>
      <el-form-item label="出库号：">
        {{ formData.outboundNo }}
      </el-form-item>
      <el-form-item label="出库时间：">
        {{ formData.outboundTime }}
      </el-form-item>
      <el-form-item label="客户名称：">
        {{ formData.custName }}
      </el-form-item>
      <!-- <el-form-item label="工作单号：">
        {{ formData.workOrderNos }}
      </el-form-item> -->
      <el-form-item label="柜型：">
        {{ formData.cabinetType }}
      </el-form-item>
      <el-form-item label="集装箱号：">
        {{ formData.containerNo }}
      </el-form-item>
      <el-form-item label="订舱号：">
        {{ formData.shippingBookNo }}
      </el-form-item>
      <el-form-item label="货物名称：">
        {{ formData.goodsName }}
      </el-form-item>
      <el-form-item label="毛重：">
        {{ formData.actualWeight ||  formData.weight}}
      </el-form-item>
      <el-form-item label="提柜地点：">
        {{ formData.carryWharfYardName }}
      </el-form-item>
      <el-form-item label="还柜地点：">
        {{ formData.backWharfYardName }}
      </el-form-item>
      <el-form-item label="装货车牌：">
        {{ formData.licensePlate }}
      </el-form-item>
      <el-form-item label="是否异地：">
        {{ dictMapObj['yesNo'][formData.hasOffsite] }}
      </el-form-item>
      <el-form-item label="预出合计：">
        {{ formData.estimatedQuantity }}
      </el-form-item>
      <el-form-item label="实出合计：">
        {{ formData.actualQuantity }}
      </el-form-item>
      <div class="divider-line"></div>
      </template>
      <div style="line-height: 32px">
        毛利：CNY <span style="color: #CD4130"> {{orderProfit.totalCnyProfit}}</span>（折合USD <span
          style="color: #CD4130">{{orderProfit.totalUsdProfit}}</span>） 毛利率： <span
          style="color: #33B18A">{{ orderProfit.totalGrossProfit }}</span>
      </div>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <div class="left-title">
            <span class="panel-title">应收费用</span>
          </div>
          <div class="right-title">
            <el-button v-if="!isDisabled" size="mini" type="primary" @click="handleAdd('receive')">新增</el-button>
            <el-button v-if="isReceiveShow" type="text" @click="isReceiveShow = false">收起
              <i class="el-icon-arrow-up el-icon--right"></i>
            </el-button>
            <el-button v-else type="text" @click="isReceiveShow = true">展开
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
          </div>
        </div>
        <el-collapse-transition>
          <div v-show="isReceiveShow" class="card-table-list">
            <vxe-table border resizable show-overflow ref="receiveTable" size="mini" :data="receiveList" align="center"
              :edit-config="{trigger: 'manual', mode: 'row', autoClear: false, showAsterisk: !isDisabled, showIcon: !isDisabled}"
              :valid-config="{ showMessage: false }" empty-text=" " :edit-rules="receiveRules">
              <vxe-column type="seq" width="80" title="序号"></vxe-column>
              <vxe-column field="bizDate" title="财务日期" min-width="150">
              </vxe-column>
              <vxe-column field="agentCompName" title="分公司" min-width="170"></vxe-column>
              <vxe-column field="feeCode" title="费用名称" :edit-render="{}" min-width="130">
                <template #default="{ row }">
                  {{ row.feeName }}
                </template>
                <template #edit="{row}">
                  <el-select v-model="row.feeCode" value-key="feeCode" clearable remote filterable size="small"
                    :remote-method="(v) => getFeeNameList(v, row)" @visible-change="(v) => showFeeNameList(v, row)"
                    @change="(v) => changeFeeName(v, row)">
                    <el-option v-for="(item, index) in feeNameList" :key="item.feeItemId + `${index}`" :label="item.feeName"
                      :value="item.feeCode"></el-option>
                  </el-select>
                </template>
              </vxe-column>
              <vxe-column field="settleCorpCode" title="结算单位" :edit-render="{}" min-width="170">
                <template #default="{ row }">
                  {{ row.settleCorpName }}
                </template>
                <template #edit="{row}">
                  <el-select v-model="row.settleCorpCode" value-key="settleCorpCode" clearable filterable remote size="small"
                    :remote-method="(v) => getSettleCorpList(v, row)" @visible-change="(v) => showSettleCorpList(v, row)"
                    @change="(v) => changeSettleCorp(v, row)">
                    <el-option v-for="(item, index) in settleCorpList" :key="item.settleUnitId + `${index}`" :label="item.unitName"
                      :value="item.unitCode"></el-option>
                  </el-select>
                </template>
              </vxe-column>
              <vxe-column field="feeUnit" title="计费单位" :edit-render="{}" min-width="130">
                <template #default="{ row }">
                  {{ dictMapObj['wmsBillingUnit'][row.feeUnit] }}
                </template>
                <template #edit="{row}">
                  <el-select size="small" v-model="row.feeUnit">
                    <el-option v-for="item in dictMap['wmsBillingUnit']" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </template>
              </vxe-column>
              <vxe-column field="unitCount" title="数量" :edit-render="{}" min-width="130">
                <template #edit="{ row, rowIndex }">
                  <vxe-input v-model="row.unitCount" type="integer" min="0" @change="changeReAmt({ rowIndex })"></vxe-input>
                </template>
              </vxe-column>
              <vxe-column field="unitPrice" title="单价" :edit-render="{}" min-width="130">
                <template #edit="{ row, rowIndex }">
                  <vxe-input v-model="row.unitPrice" type="float" min="0" @change="changeReAmt({ rowIndex })"></vxe-input>
                </template>
              </vxe-column>
              <vxe-column field="feeAmt" title="费用金额" min-width="130"></vxe-column>
              <vxe-column field="currency" title="币种" :edit-render="{}" min-width="150">
                <template #default="{ row }">
                  {{ dictMapObj['wmsCurrency'][row.currency] }}
                </template>
                <template #edit="{ row }">
                  <el-select size="small" v-model="row.currency">
                    <template v-for="item in dictMap['wmsCurrency']">
                      <el-option :key="item.value" :label="item.label" :value="item.value">
                      </el-option>
                    </template>
                  </el-select>
                </template>
              </vxe-column>
              <vxe-column field="taxAmt" title="税额" min-width="130"></vxe-column>
              <vxe-column field="feeAmtWithoutTax" title="不含税金额" min-width="130"></vxe-column>
              <vxe-column field="remark" title="费用备注" :edit-render="{}" min-width="180">
                <template #edit="{ row }">
                  <vxe-input v-model="row.remark" type="text"></vxe-input>
                </template>
              </vxe-column>
              <vxe-column field="cnyExRate" title="折合CNY汇率" min-width="130"></vxe-column>
              <vxe-column field="cnyMoneyAmt" title="折合CNY金额" min-width="130"></vxe-column>
              <vxe-column field="usdExRate" title="折合USD汇率" min-width="130"></vxe-column>
              <vxe-column field="usdMoneyAmt" title="折合USD金额" min-width="130"></vxe-column>
              <vxe-column field="confirmStatus" title="是否确认" min-width="130">
                <template #default="{ row }">
                  <span :class="row.confirmStatus === 'yes' ? `yesText`: `noText`">
                    {{ dictMapObj['yesNo'][row.confirmStatus] }}
                  </span>
                </template>
              </vxe-column>
              <vxe-column field="closeStatus" title="是否关账" min-width="130">
                <template #default="{ row }">
                  <span :class="row.closeStatus === 'yes' ? `yesText`: `noText`">
                    {{ dictMapObj['yesNo'][row.closeStatus] }}
                  </span>
                </template>
              </vxe-column>
              <vxe-column field="closeTime" title="关账时间" min-width="130"></vxe-column>
              <vxe-column field="settleStatus" title="结清状态" min-width="130">
                <template #default="{ row }">
                  <span :class="row.settleStatus === 'finish' ? `yesText`: `noText`">
                    {{ dictMapObj['feeSettleStatus'][row.settleStatus] }}
                  </span>
                </template>
              </vxe-column>
              <vxe-column field="receivePayDates" title="收付日期" min-width="130"></vxe-column>
              <vxe-column field="totalWriteoffAmt" title="已核销金额" min-width="130"></vxe-column>
              <vxe-column field="notWriteoffAmt" title="未核销金额" min-width="130"></vxe-column>
              <!-- <vxe-column field="acctVoucherNos" title="凭证号" min-width="130"></vxe-column> -->
              <vxe-column field="invoiceStatus" title="发票状态" min-width="130">
                <template #default="{ row }">
                  <span :class="row.invoiceStatus === 'finish' ? `yesText`: `noText`">
                    {{ dictMapObj['receiveInvoiceApplyStatus'][row.invoiceStatus] }}
                  </span>
                </template>
              </vxe-column>
              <vxe-column field="invoiceNos" title="发票号" min-width="130">
                <template #default="{ row }">
                  <span v-if="row.invoiceNos && row.invoiceNos.includes('/')">{{row.invoiceNos.split('/')[1]}}</span>
                  <span v-else>{{row.invoiceNos}}</span>
                </template>
              </vxe-column>
              <vxe-column field="invoiceAmt" title="已开票金额" min-width="130"></vxe-column>
              <vxe-column field="notInvoiceAmt" title="未开票金额" min-width="130"></vxe-column>
              <vxe-column field="gedgingAmt" title="对冲金额" min-width="130"></vxe-column>
              <vxe-column field="badAmt" title="坏账金额" min-width="130"></vxe-column>
              <!-- <vxe-column field="payOrderNo" title="付款单号" min-width="130"></vxe-column> -->
              <vxe-column field="writeoffNos" title="核销单号" min-width="130"></vxe-column>
              <vxe-column field="createdName" title="创建人" min-width="130"></vxe-column>
              <vxe-column field="createdTime" title="创建时间" min-width="130"></vxe-column>
              <vxe-column field="confirmName" title="确认人" min-width="130"></vxe-column>
              <vxe-column field="confirmTime" title="确认时间" min-width="130"></vxe-column>
              <vxe-column v-if="((activeName && activeName === 'feesInfo' && !isDisabled) || !activeName)" title="操作" width="100"
                fixed="right">
                <template #default="{ row, rowIndex }">
                  <template v-if="!row.disabled">
                    <template v-if="$refs.receiveTable.isActiveByRow(row)">
                      <el-link type="primary" :underline="false" @click="saveRowEvent(row, 'receiveTable')">保存</el-link>
                    </template>
                    <template v-else>
                      <el-link type="warning" :underline="false" @click="editRowEvent(row, 'receiveTable')">修改</el-link>
                    </template>
                    <el-link type="danger" :underline="false" @click="removeRowEvent(rowIndex, 'receiveList')">删除</el-link>
                  </template>
                </template>
              </vxe-column>
            </vxe-table>
          </div>
        </el-collapse-transition>
      </el-card>
      <el-card class="box-card mt10">
        <div slot="header" class="clearfix">
          <div class="left-title">
            <span class="panel-title">应付费用</span>
          </div>
          <div class="right-title">
            <el-button v-if="!isDisabled" size="mini" type="primary" @click="handleAdd('pay')">新增</el-button>
            <el-button v-if="isPayShow" type="text" @click="isPayShow = false">收起
              <i class="el-icon-arrow-up el-icon--right"></i>
            </el-button>
            <el-button v-else type="text" @click="isPayShow = true">展开
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
          </div>
        </div>
        <el-collapse-transition>
          <div v-show="isPayShow" class="card-table-list">
            <vxe-table border resizable show-overflow ref="payTable" size="mini" :data="payList" align="center"
              :edit-config="{trigger: 'manual', mode: 'row', autoClear: false, showAsterisk: !isDisabled, showIcon: !isDisabled}"
              :valid-config="{ showMessage: false }" empty-text=" " :edit-rules="payRules">
              <vxe-column type="seq" width="80" title="序号"></vxe-column>
              <vxe-column field="bizDate" title="财务日期" min-width="150">
              </vxe-column>
              <vxe-column field="agentCompName" title="分公司" min-width="170"></vxe-column>
              <vxe-column field="feeCode" title="费用名称" :edit-render="{}" min-width="130">
                <template #default="{ row }">
                  {{ row.feeName }}
                </template>
                <template #edit="{row}">
                  <el-select v-model="row.feeCode" value-key="feeCode" clearable filterable remote size="small"
                    :remote-method="(v) => getFeeNameList(v, row)" @visible-change="(v) => showFeeNameList(v, row)"
                    @change="(v) => changeFeeName(v, row)">
                    <el-option v-for="(item, index) in feeNameList" :key="item.feeItemId + `${index}`" :label="item.feeName"
                      :value="item.feeCode"></el-option>
                  </el-select>
                </template>
              </vxe-column>
              <vxe-column field="settleCorpCode" title="结算单位" :edit-render="{}" min-width="170">
                <template #default="{ row }">
                  {{ row.settleCorpName }}
                </template>
                <template #edit="{row}">
                  <el-select v-model="row.settleCorpCode" value-key="settleCorpCode" clearable filterable remote size="small"
                    :remote-method="(v) => getSettleCorpList(v, row)" @visible-change="(v) => showSettleCorpList(v, row)"
                    @change="(v) => changeSettleCorp(v, row)">
                    <el-option v-for="(item, index) in settleCorpList" :key="item.settleUnitId + `${index}`" :label="item.unitName"
                      :value="item.unitCode"></el-option>
                  </el-select>
                </template>
              </vxe-column>
              <vxe-column field="feeUnit" title="计费单位" :edit-render="{}" min-width="130">
                <template #default="{ row }">
                  {{ dictMapObj['wmsBillingUnit'][row.feeUnit] }}
                </template>
                <template #edit="{row}">
                  <el-select size="small" v-model="row.feeUnit">
                    <el-option v-for="item in dictMap['wmsBillingUnit']" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </template>
              </vxe-column>
              <vxe-column field="unitCount" title="数量" :edit-render="{}" min-width="130">
                <template #edit="{ row, rowIndex }">
                  <vxe-input v-model="row.unitCount" type="integer" min="0" @change="changeAmt({rowIndex})"></vxe-input>
                </template>
              </vxe-column>
              <vxe-column field="unitPrice" title="单价" :edit-render="{}" min-width="130">
                <template #edit="{ row, rowIndex }">
                  <vxe-input v-model="row.unitPrice" type="float" min="0" @change="changeAmt({rowIndex})"></vxe-input>
                </template>
              </vxe-column>
              <vxe-column field="feeAmt" title="费用金额" min-width="100">
                <!-- <template #default="{ row }">
                  {{ Number(row.unitCount * row.unitPrice).toFixed(2) }}
                </template> -->
              </vxe-column>
              <vxe-column field="currency" title="币种" :edit-render="{}" min-width="150">
                <template #default="{ row }">
                  {{ dictMapObj['wmsCurrency'][row.currency] }}
                </template>
                <template #edit="{ row }">
                  <el-select size="small" v-model="row.currency">
                    <template v-for="item in dictMap['wmsCurrency']">
                      <el-option :key="item.value" :label="item.label" :value="item.value">
                      </el-option>
                    </template>
                  </el-select>
                </template>
              </vxe-column>
              <vxe-column field="taxRate" title="税率" :edit-render="{}" min-width="130">
                <template #edit="{ row, rowIndex }">
                  <el-select size="small" v-model="row.taxRate" @change="changeAmt({ rowIndex })">
                    <el-option v-for="item in dictMap['taxRateInfo']" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </template>
              </vxe-column>
              <vxe-column field="taxAmt" title="税额" min-width="130"></vxe-column>
              <vxe-column field="feeAmtWithoutTax" title="不含税金额" min-width="130"></vxe-column>
              <vxe-column field="remark" title="费用备注" :edit-render="{}" min-width="180">
                <template #edit="{ row }">
                  <vxe-input v-model="row.remark" type="text"></vxe-input>
                </template>
              </vxe-column>
              <vxe-column field="cnyExRate" title="折合CNY汇率" min-width="130"></vxe-column>
              <vxe-column field="cnyMoneyAmt" title="折合CNY金额" min-width="130"></vxe-column>
              <vxe-column field="usdExRate" title="折合USD汇率" min-width="130"></vxe-column>
              <vxe-column field="usdMoneyAmt" title="折合USD金额" min-width="130"></vxe-column>
              <vxe-column field="confirmStatus" title="是否确认" min-width="130">
                <template #default="{ row }">
                  <span :class="row.confirmStatus === 'yes' ? `yesText`: `noText`">
                    {{ dictMapObj['yesNo'][row.confirmStatus] }}
                  </span>
                </template>
              </vxe-column>
              <vxe-column field="closeStatus" title="是否关账" min-width="130">
                <template #default="{ row }">
                  <span :class="row.closeStatus === 'yes' ? `yesText`: `noText`">
                    {{ dictMapObj['yesNo'][row.closeStatus] }}
                  </span>
                </template>
              </vxe-column>
              <vxe-column field="closeTime" title="关账时间" min-width="130"></vxe-column>
              <vxe-column field="settleStatus" title="结清状态" min-width="130">
                <template #default="{ row }">
                  <span :class="row.settleStatus === 'finish' ? `yesText`: `noText`">
                    {{ dictMapObj['feeSettleStatus'][row.settleStatus] }}
                  </span>
                </template>
              </vxe-column>
              <vxe-column field="receivePayDates" title="收付日期" min-width="130"></vxe-column>
              <vxe-column field="totalWriteoffAmt" title="已核销金额" min-width="130"></vxe-column>
              <vxe-column field="notWriteoffAmt" title="未核销金额" min-width="130"></vxe-column>
              <!-- <vxe-column field="acctVoucherNos" title="凭证号" min-width="130"></vxe-column> -->
              <vxe-column field="invoiceStatus" title="发票状态" min-width="130">
                <template #default="{ row }">
                  <span :class="row.invoiceStatus === 'finish' ? `yesText`: `noText`">
                    {{ dictMapObj['receiveInvoiceApplyStatus'][row.invoiceStatus] }}
                  </span>
                </template>
              </vxe-column>
              <vxe-column field="invoiceNos" title="发票号" min-width="130">
                <template #default="{ row }">
                  <span v-if="row.invoiceNos && row.invoiceNos.includes('/')">{{row.invoiceNos.split('/')[1]}}</span>
                  <span v-else>{{row.invoiceNos}}</span>
                </template>
              </vxe-column>
              <vxe-column field="invoiceAmt" title="已开票金额" min-width="130"></vxe-column>
              <vxe-column field="notInvoiceAmt" title="未开票金额" min-width="130"></vxe-column>
              <vxe-column field="gedgingAmt" title="对冲金额" min-width="130"></vxe-column>
              <vxe-column field="badAmt" title="坏账金额" min-width="130"></vxe-column>
              <vxe-column field="payOrderNos" title="付款单号" min-width="130"></vxe-column>
              <vxe-column field="writeoffNos" title="核销单号" min-width="130"></vxe-column>
              <vxe-column field="createdName" title="创建人" min-width="130"></vxe-column>
              <vxe-column field="createdTime" title="创建时间" min-width="130"></vxe-column>
              <vxe-column field="confirmName" title="确认人" min-width="130"></vxe-column>
              <vxe-column field="confirmTime" title="确认时间" min-width="130"></vxe-column>
              <vxe-column v-if="((activeName && activeName === 'feesInfo' && !isDisabled) || !activeName)" title="操作" width="100"
                fixed="right">
                <template #default="{ row, rowIndex }">
                  <template v-if="!row.disabled">
                    <template v-if="$refs.payTable.isActiveByRow(row)">
                      <el-link type="primary" :underline="false" @click="saveRowEvent(row, 'payTable')">保存</el-link>
                    </template>
                    <template v-else>
                      <el-link type="warning" :underline="false" @click="editRowEvent(row, 'payTable')">修改</el-link>
                    </template>
                    <el-link type="danger" :underline="false" @click="removeRowEvent(rowIndex, 'payList')">删除</el-link>
                  </template>
                </template>
              </vxe-column>
            </vxe-table>
          </div>
        </el-collapse-transition>
      </el-card>
    </el-form>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { saveOutboundFee, getOrderProfit, getFeeList, generateSettleOrder, feeItemList, querySettleUnit } from '@/api/wms/outBound'
import { getCustomerList } from '@/api/wms/inBound.js'

const receiveRules = {
  // bizDate: [{ required: true, message: '财务日期不能为空' }],
  feeCode: [{ required: true, message: '费用名称不能为空' }],
  settleCorpCode: [{ required: true, message: '结算单位不能为空' }],
  feeUnit: [{ required: true, message: '计费单位不能为空' }],
  unitCount: [{ required: true, message: '数量不能为空' }],
  unitPrice: [{ required: true, message: '单价不能为空' }],
  currency: [{ required: true, message: '币种不能为空' }]
}
export default {
  props: {
    options: {
      type: Object,
      default: () => { }
    },
    templateData: {
      type: Object,
      default: () => { }
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    activeName: {
      type: String,
      default: ''
    },
    operType: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      formData: {
        custId: null,
        custName: '',
        workOrderNo: '',
        warehouseName: '',
        outboundTime: '',
        licensePlate: '',
        shippingBookNo: '',
        hasOffsite: "no",
        hasDischargePicture: "no",
        hasCopyNo: "no",
        hasCarrayOverweight: "no",
        hasReturnOverweight: "no",
        hasDisinfect: "no",
        hasDoubleLayerWinch: "no",
        hasSelfVehicle: "no",
        hasThreeLayerWinch: "no",
        goodsName: ''
      },
      isPayShow: true,
      isReceiveShow: true,
      receiveRules: receiveRules,
      payRules: {
        ...receiveRules,
        taxRate: [{ required: true, message: '计费单位不能为空' }],
      },
      payList: [],
      receiveList: [],
      feeNameList: [],
      settleCorpList: [],
      orderProfit: {
        totalGrossProfit: null
      },
      isValidate: false, //是否通过提交校验
      removeList: [],
      isDepartment: false //当前客户是否是分公司
    }
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
    ...mapState({
      userInfo: (state) => state.user
    })
  },
  created () {
    if (this.options.data) {
      this.formData = JSON.parse(JSON.stringify(this.options.data)) 
      this.getCustomerInfo()
      if (this.activeName) {
        let goodsNames = []
        if (this.formData.detailList && this.formData.detailList.length) {
          this.formData.detailList.forEach(item => {
            goodsNames.push(item.goodsName)
          })
        }
        this.formData.goodsName = goodsNames.join(',')
      }
    }
    if (this.operType !== 'add') {
      this.getFeeList()
    }
  },
  mounted () {
    if (this.activeName) {
      this.$forceUpdate()
    }
  },
  watch: {
    templateData (val) {
      if (val.fees && val.fees.length) {
        val.fees.forEach(item => {
          // from frank.he
          // 如果结算单位类型是委托客户：就取套用模板时的出库单的客户名称
          // 如果结算单位类型是车辆供应商：就取套用模板时的出库单里的车队供应商
          // 如果结算单位类型是货物客户（uat之后再视情况处理）
          // ：需要在入库单里加上货物宿主（货物所属客户），数据存到wms_inbound_goods_real_cust表，然后套用费用模板时就取出库单关联入库单的货物宿主。
          if (['customer', 'supplier'].includes(item.settlementType)) {
            if (item.settlementType === 'customer') {
              item.settlementUnitName = this.formData.custName
            } else if (item.settlementType === 'supplier') {
              if (this.formData.supplierName) item.settlementUnitName = this.formData.supplierName
            }
            // 拿到车队供应商或客户信息时，用中文名去结算单位接口查询出对应的结算单位id用于保存费用
            querySettleUnit({ name: item.settlementUnitName, size: 30, unitTypes: '' }).then((res) => {
              item.settlementUnitCode = res.data[0].unitCode
              this.addEmptyData(item)
            }).catch(() => { })
          } else {
            this.addEmptyData(item)
          }
        })
      }
    }
  },
  methods: {
    /**
     * @description: 获取当前客户相关信息
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-10-08 14:31:25
     */
    getCustomerInfo () {
      let data = {
        name: this.formData.custName
      }
      getCustomerList(data).then(({ code, data }) => {
        if (code === 0) {
          let list = data || []
          // 判断当前客户是否是分公司
          let find = list.find(item => item.custid === this.formData.custId)
          if (find) {
            this.isDepartment = find.custClass === 'department'
          }
        }
      }).catch(() => { })
    },
    /**
     * @description: 新增一条空的应收费用数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-10 16:04:41
     */
    addEmptyData (item) {
      this.receiveList.push({
        currency: item.currency,
        unitPrice: item.unitPrince,
        feeCode: item.feeCode,
        feeName: item.feeName,
        feeAmt: null,
        unitCount: null,
        unitPrice: (Number(item.unitPrince) * Number(item.discountRate)).toFixed(2),
        settleCorpCode: item.settlementUnitCode,
        settleCorpName: item.settlementUnitName,
        agentCompName: JSON.parse(localStorage.getItem('userInfo')).settleCompanyName || this.userInfo.userInfo.settleCompanyName,
        feeUnit: item.billingUnit,
        receipayType: 'receive'
      })
    },
    /**
     * @description: 获取费用信息
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-06 11:34:50
     */
    getFeeList (type) {
      let data = {
        orderNo: this.options.data.outboundNo,
        receipayType: type
      }
      getFeeList(data).then(res => {
        if (res.code === 0) {
          this.getOrderProfitInfo(this.options.data?.payFee?.orderProfitToken || res.data?.orderProfitToken || null)
          let list = res.data.list || []
          if (list && list.length) {
            list.forEach(item => {
              this.getFeeNameList(item.feeName, item)
              if (!item.agentCompName) {
                item.agentCompName = JSON.parse(localStorage.getItem('userInfo')).settleCompanyName || this.userInfo.userInfo.settleCompanyName
              }
              // settleLock != unlock 或者 settleStatus != nofinish 时不允许变更
              if (item.settleLock !== 'unlock' || item.settleStatus !== 'nofinish') {
                item.disabled = true
              }
            });
          }
          this.payList = list.filter(item => item.receipayType === 'pay')
          this.receiveList = list.filter(item => item.receipayType === 'receive')
        }
      }).catch(() => { })
    },
    /**
     * @description: 计算利润
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-05 18:07:04
     */
    getOrderProfitInfo (orderProfitToken) {
      let data = {
        orderNo: this.options.data.outboundNo,
        orderProfitToken
      }
      getOrderProfit(data).then(res => {
        if (res.code === 0) {
          this.orderProfit = res.data
          this.orderProfit.totalGrossProfit = this.orderProfit.totalGrossProfit > 0 ? (this.orderProfit.totalGrossProfit * 100).toFixed(2) + '%' : 0
        }
      }).catch(() => { })
    },
    /**
     * @description: 获取费用列表
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-05 10:54:40
     */
    getFeeNameList (name, row) {
      feeItemList(name).then(response => {
        this.feeNameList = response.data
      })
    },
    showFeeNameList (show, row) {
      show && this.getFeeNameList('', row)
    },
    changeFeeName (val, row) {
      let find = this.feeNameList.find(item => item.feeCode === val)
      row.feeName = find?.feeName
    },
    /**
     * @description: 获取结算单位
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-05 11:58:54
     */
    getSettleCorpList (str = '', row) {
      if (!str) {
        str = row.settleCorpName
      }
      querySettleUnit({ name: str, size: 30, unitTypes: '' }).then((res) => {
        this.settleCorpList = res.data || []
      }).catch(() => { })
    },
    showSettleCorpList (show, row) {
      show && this.getSettleCorpList('', row)
    },
    changeSettleCorp (val, row) {
      let find = this.settleCorpList.find(item => item.unitCode === val)
      row.settleCorpName = find?.unitName
      row.unitType = find?.unitType
    },
    /**
     * @description: 新增费用
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 17:31:01
     */
    handleAdd (type) {
      let data = {
        orderFeeId: '',
        bizDate: '',
        agentCompName: JSON.parse(localStorage.getItem('userInfo')).settleCompanyName || this.userInfo.userInfo.settleCompanyName,
        feeCode: '',
        settleCorpCode: '',
        unitCount: null,
        unitPrice: null,
        feeAmt: null,
        currency: 'CNY',
        taxRate: '',
        taxAmt: null,
        feeAmtWithoutTax: null,
        remark: null,
        cnyExRate: null,
        cnyMoneyAmt: null,
        usdExRate: null,
        usdMoneyAmt: null,
        confirmStatus: null,
        closeStatus: null,
        closeTime: null,
        settleStatus: null,
        receivePayDates: null,
        totalWriteoffAmt: null,
        notWriteoffAmt: null,
        acctVoucherNos: null,
        invoiceStatus: null,
        invoiceNos: null,
        invoiceAmt: null,
        notInvoiceAmt: null,
        gedgingAmt: null,
        badAmt: null,
        payOrderNos: null,
        writeoffNos: null,
        createdName: null,
        createdTime: null,
        confirmName: null,
        confirmTime: null,
        prepayType: 'prepay',
        receipayType: type
      }
      this[`${type}List`].push(data)
      this.editRowEvent(this[`${type}List`][this[`${type}List`].length - 1], `${type}Table`)
    },
    /**
     * @description: 编辑【入库单货物明细】行数据
     * @param {*} row
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 17:31:18
     */
    editRowEvent (row, table) {
      const $table = this.$refs[table]
      $table.setActiveRow(row)
      if (table === 'receiveTable') {
        this.getSettleCorpList(row.settleCorpName, row)
      }
    },
    /**
     * @description: 前端保存【入库单货物明细】行数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 17:32:04
     */
    async saveRowEvent (row, table) {
      const $table = this.$refs[table]
      const errMap = await $table.validate(true).catch(errMap => errMap)
      if (errMap) {
        return false
      } else {
        $table.clearActived()
      }
    },
    /**
     * @description: 移除【入库单货物明细】行数据
     * @param {*} index
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-08-17 17:14:47
     */
    removeRowEvent (index, list) {
      // 获取删除的数据
      let deleteData = []
      deleteData = this[`${list}`].splice(index, 1)
      deleteData.forEach(item => {
        if (item.feeId) { //如果有feeId,说明删除的是费用保存过的数据，保存费用时需将这些数据传至后台，operation为delete
          item.operation = 'delete'
          this.removeList.push(item)
        }
      })
    },
    /**
     * @description: 监听金额变化
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-05 14:22:06
     */
    changeAmt ({ rowIndex }) {
      // 税额=费用金额 - 不含税发生额 
      // 不含税发生额 = 费用金额 / (1+税率)
      this.payList[rowIndex].feeAmt = Number(this.payList[rowIndex].unitCount * this.payList[rowIndex].unitPrice).toFixed(2)
      this.payList[rowIndex].feeAmtWithoutTax = this.mathRound(Number(this.payList[rowIndex].feeAmt) / (1 + Number(this.payList[rowIndex].taxRate)))
      this.payList[rowIndex].taxAmt = (Number(this.payList[rowIndex].feeAmt) - Number(this.payList[rowIndex].feeAmtWithoutTax)).toFixed(2)
    },
    /**
     * @description: 监听应收费用金额变化
     * @param {*} rowIndex
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-06 09:57:55
     */
    changeReAmt ({ rowIndex }) {
      this.receiveList[rowIndex].feeAmt = Number(this.receiveList[rowIndex].unitCount * this.receiveList[rowIndex].unitPrice).toFixed(2)
    },
    /**
     * @description: 四舍五入
     * @param {*} num
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-05 14:40:07
     */
    mathRound (num) {
      return Math.round(num * 100) / 100
    },
    /**
     * @description: 生成结算单
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-05 14:56:07
     */
    submitFn () {
      if (!this.receiveList.length && !this.payList.length) {
        this.isValidate = true
        if (!this.activeName) {
          this.submitApi()
        }
        // if (!this.removeList.length) { //没有删除过数据，且无费用数据，视为新增费用，费用列表不能传空
        //   this.isValidate = false
        //   return this.$message.error("应收费用和应付费用至少要填写一个！")
        // } else { //有删除的数据，将这批数据传至后台 operation:delete
        //   this.isValidate = true
        //   if (!this.activeName) {
        //     this.submitApi()
        //   }
        // }
      } else {
        if (this.receiveList.length) {
          this.validReceiveInfo()
        } else {
          if (this.payList.length) {
            this.validPayInfo()
          }
        }
      }
    },
    /**
     * @description: 校验应收费用
     * @param {*} 
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-05 15:19:02
     */
    async validReceiveInfo () {
      let $table = this.$refs.receiveTable
      const errMap = await $table.validate(true).catch(errMap => errMap)
      if (errMap) {
        this.isValidate = false
        return this.$message.error('应收费用信息校验不通过！');
      } else {
        this.isValidate = true
        if (this.payList.length) {
          this.validPayInfo()
        } else {
          this.isValidate = true
          if (!this.activeName) {
            this.submitApi()
          }
        }
      }
    },
    /**
     * @description: 校验应付费用
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-05 15:20:50
     */
    async validPayInfo () {
      let $table = this.$refs.payTable
      const errMap = await $table.validate(true).catch(errMap => errMap)
      if (errMap) {
        this.isValidate = false
        return this.$message.error('应付费用信息校验不通过！');
      } else {
        this.isValidate = true
        if (!this.activeName) {
          this.submitApi()
        }
      }
    },
    /**
     * @description: 调用保存费用接口
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-05 15:21:25
     */
    submitApi () {
      // 提交前需二次确认 1、客户是长帆分公司 2、费用结算单位含长帆分公司 3、出库单未录入长帆工作单号
      let feeList = [...this.payList, ...this.receiveList]
      let isCompany = (feeList || []).some(item => item.unitType === 'company')
      let payCompanyList = (this.payList || []).filter(item => item.unitType === 'company')
      let receiveCompanyList = (this.receiveList || []).filter(item => item.unitType === 'company')
      let [payMsg, receiveMsg, feeMsg, feeMsg1] = ['', '', '', '']
      if (payCompanyList.length) {
        let payCompayNames = payCompanyList.map(item => {
          return item.settleCorpName
        })
        let payCompayNames1 = [...new Set(payCompayNames)]
        payCompayNames1.forEach((item, index) => {
          payMsg += `${item}`
          if (index < payCompayNames1.length - 1) {
            payMsg += '，'
          }
        })
      } else {
        payMsg = ''
      }
      if (receiveCompanyList.length) {
        let receiveCompayNames = receiveCompanyList.map(item => {
          return item.settleCorpName
        })
        let receiveCompayNames1 = [...new Set(receiveCompayNames)]
        receiveCompayNames1.forEach((item, index) => {
          receiveMsg += `${item}`
          if (index < receiveCompayNames1.length - 1) {
            receiveMsg += '，'
          }
        })
      } else {
        receiveMsg = ''
      }
      if (payMsg && receiveMsg) {
        feeMsg = `应收${receiveMsg}费用；应付${payMsg}费用`
        feeMsg1 = `${payMsg}生成同金额应付鼎帆费用；${receiveMsg}生成同金额应收鼎帆费用`
      } else if (payMsg) {
        feeMsg = `应付${payMsg}费用`
        feeMsg1 = `${payMsg}生成同金额应付鼎帆费用`
      } else if (receiveMsg) {
        feeMsg = `应收${receiveMsg}费用`
        feeMsg1 = `${receiveMsg}生成同金额应收鼎帆费用`
      }
      let msg = `该出库单有${feeMsg}且未录入长帆工作单号，费用提交后系统无法自动为${feeMsg1}，请确认提交！`
      if (this.isDepartment && isCompany && !this.formData.lsWorkOrderNo) {
        this.$confirm(msg, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.confirmSubmitApi()
        }).catch(() => { });
      } else {
        this.confirmSubmitApi()
      }
    },
    /**
     * @description: 确定提交
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-10-08 15:22:05
     */
    confirmSubmitApi () {
      let data = {
        orderNo: this.options.data.outboundNo,
        jointNo: '',
        fees: [...this.payList, ...this.receiveList]
      }
      data.fees.forEach(item => {
        item.unitCount = Number(item.unitCount)
        item.feeAmt = Number(item.feeAmt)
        item.taxAmt = Number(item.taxAmt)
        item.taxRate = Number(item.taxRate)
        item.unitPrice = Number(item.unitPrice)
        item.operation = "update"
      })
      if (this.removeList.length) {
        data.fees = [...data.fees, ...this.removeList]
      }
      // 费用没有编辑的不需要传到后台
      data.fees = data.fees.filter(item => !item.disabled)
      saveOutboundFee(data).then(({ code }) => {
        if (code === 0) {
          if (!this.activeName) {
            this.$message.success("操作成功！")
            this.$emit('cancel')
          }

        }
      }).catch(() => {
      })
    },
    /**
     * @description: 生产结算单
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-09-06 16:44:28
     */
    finalFn () {
      // 先查询结算单
      let feeIds = []
      let fees = [...this.payList, ...this.receiveList]
      fees.forEach(item => {
        feeIds.push(item.feeId)
      })
      generateSettleOrder({ feeIds }).then(({ code, data }) => {
        if (code === 0) {
          console.log(`结算单`, data);
          // this.$message.success("操作成功！")
        }
      }).catch(() => {
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/common.scss';
/deep/ .el-form-item {
  width: 285px;
  margin-right: 0 !important;
  .el-form-item__label {
    line-height: 24px !important;
  }
  .el-form-item__content {
    font-size: 12px;
    line-height: 24px !important;
  }
}
.yesText {
  color: #33b18a;
}
.noText {
  color: #cd4130;
}
</style>