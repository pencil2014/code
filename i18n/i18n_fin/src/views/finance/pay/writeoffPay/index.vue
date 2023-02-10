<template>
	<div
		class="finance-tab-page"
		v-loading="loading"
		:element-loading-text="eLoadingText"
		:element-loading-spinner="eLoadingSpinner"
		:element-loading-background="eLoadingBackground"
	>
		<div v-show="!showBillDetail">
			<FinanceSearch :searchOption="searchOption1" @search="search" />
			<div class="finance-search-list-gap"></div>
			<div class="finance-list-container">
        <div class="money-box" v-if="isVoucherRoute">
          <div class="money-box-left">
            <el-button
              v-if="checkAuth($route.name, 'tab-writeoffPayList', 'btn-voucherView')"
              class="finance-btn"
              @click="generateVoucher(true)"
              size="mini"
              type="inner"
            >{{$t('PayApplyList.previewVoucher')}}</el-button>
            <el-button
              v-if="checkAuth($route.name, 'tab-writeoffPayList', 'btn-voucherCreate')"
              class="finance-btn"
              @click="generateVoucher"
              size="mini"
              type="inner"
            >{{$t('PayApplyList.generateVoucher')}}</el-button>
            <el-button
              v-if="checkAuth($route.name, 'tab-writeoffPayList', 'btn-voucherDel')"
              class="finance-btn"
              @click="delVoucher"
              size="mini"
              type="danger"
            >{{$t('PayApplyList.deleteVoucher')}}</el-button>
            <el-button
              class="finance-btn"
              @click="handleExport({label:'', value: 'acctWriteoffPayListExport'})"
              size="mini"
              v-if="checkAuth($route.name, 'tab-writeoffPayList', 'btn-handleExport')"
            >{{$t('Common.export')}}</el-button>
          </div>
          <div class="money-box-right">
            <el-radio-group v-model="hasVoucher" size="mini">
              <el-radio-button label="">{{$t('Common.all')}}</el-radio-button>
              <el-radio-button label="no">{{$t('Common.notGenerated')}}</el-radio-button>
              <el-radio-button label="yes">{{$t('Common.generated')}}</el-radio-button>
            </el-radio-group>
            <el-button-group>
              <el-button class="finance-btn" @click="refreshListPage" size="mini" type="primary">{{$t('Common.refresh')}}</el-button>
            </el-button-group>
          </div>
        </div>
        <div class="money-box" v-else>
					<div class="money-box-left">
						<el-button-group>
							<el-button type="primary" class="finance-btn" v-if="checkAuth($route.name, 'tab-writeoffPayList', 'btn-writeoff')" @click="writeoff" size="mini">{{$t('PayApplyList.confirmReview')}}</el-button>
						</el-button-group>
						<el-button-group>
							<el-button	type="primary" class="finance-btn" v-if="checkAuth($route.name, 'tab-writeoffPayList', 'btn-writeoffUnlock')" @click="handleApplyFor('writeoffUnlock')"	size="mini"	>{{$t('PayApplyList.cancelReview')}}</el-button>
						</el-button-group>
						<el-button-group>
							<el-button
								type="success"
								class="finance-btn"
								v-if="checkAuth($route.name, 'tab-writeoffPayList', 'btn-afreshWriteoff')"
								@click="handleApplyFor('afreshWriteoff')"
								size="mini"
								>{{$t('PayApplyList.ReWriteoff')}}</el-button
							>
						</el-button-group>
						<el-button-group>
							<el-button
								type="warning"
								class="finance-btn"
								v-if="checkAuth($route.name, 'tab-writeoffPayList', 'btn-writeoffRollback')"
								@click="handleApplyFor('writeoffRollback')"
								size="mini"
								>{{$t('PayApplyList.antiWriteoff')}}</el-button
							>
						</el-button-group>
						<el-button-group v-if="checkAuth($route.name, 'tab-writeoffPayList', 'btn-writeoffPayExport')">
							<div class="finance-btn select-template-box">
								<el-dropdown trigger="click" @command="handleExport">
									<span class="el-dropdown-link">
									{{$t('OrderFee.export')}}<i class="el-icon-arrow-down el-icon--right"></i>
									</span>
									<el-dropdown-menu slot="dropdown">
										<el-dropdown-item v-for="(item, index) in exportTypeList" :key="'exportTypeList' + index"
											:command="item">
											{{$t('OrderFee.export')}}{{$t('OrderFee.enspace')}}{{item.label}}
										</el-dropdown-item>
									</el-dropdown-menu>
								</el-dropdown>
							</div>
							<!-- <el-button class="finance-btn" @click="handleExport" size="mini"
								>导出</el-button
							> -->
						</el-button-group>
					</div>
					<div class="money-box-right">
						<el-button-group>
							<el-button class="finance-btn"
							v-if="checkAuth($route.name, 'tab-writeoffPayList', 'btn-handleDownLoadInvoice')"
							 @click="handleDownLoadInvoice" size="mini">{{$t('PayApplyList.batchDownBankSlip')}}</el-button><!-- 批量下载水单 -->
						</el-button-group>
						<el-button-group>
							<el-button
								class="finance-btn"
								v-if="checkAuth($route.name, 'tab-writeoffPayList', 'btn-batchPrintCreate')"
								@click="generateVoucher(true)"
								size="mini"
								>{{$t('PayApplyList.previewVoucher')}}</el-button
							>
						</el-button-group>
						<el-button-group>
							<el-button
								class="finance-btn"
								v-if="checkAuth($route.name, 'tab-writeoffPayList', 'btn-Voucher')"
								@click="generateVoucher"
								size="mini"
								>{{$t('PayApplyList.generateVoucher')}}</el-button
							>
						</el-button-group>
						<el-button-group>
							<el-button
								type="danger"
								class="finance-btn"
								v-if="checkAuth($route.name, 'tab-writeoffPayList', 'btn-delVoucher')"
								@click="delVoucher"
								size="mini"
								>{{$t('PayApplyList.deleteVoucher')}}</el-button
							>
						</el-button-group>
						<el-button-group>
							<el-button
								class="finance-btn"
								@click="refreshListPage"
								size="mini"
								type="primary"
							>{{$t('Common.refresh')}}</el-button>
						</el-button-group>
					</div>
				</div>
				<FinanceTableMass :option="option1" @send-multi="sendMulti" />
			</div>
		</div>
		<div class="finance-bill-detail-container" v-if="showBillDetail">
			<component
				:is="currentComponent"
				:writeoff-receipay-id="writeoffReceipayId"
				:writeoff-receipay-no="writeoffReceipayNo"
				@open-back-detail="closeInvoiceDetail"
			/>
		</div>
		<PreviewDialog ref="PreviewDialog" :dialogOption="previewDialog" @generate="generateVoucher" :bizNo='true'
     :showDel="checkAuth($route.name, 'tab-writeoffPayList', 'btn-delVoucher') || checkAuth($route.name, 'tab-writeoffPayList', 'btn-voucherDel')"
     :showCreate="checkAuth($route.name, 'tab-writeoffPayList', 'btn-Voucher') || checkAuth($route.name, 'tab-writeoffPayList', 'btn-voucherCreate')"/>
		<div v-if="customColumnsPopShow">
			<CustomColumns
				ref="CustomColumns"
				:columnsBase="selfColumnsBase"
				:configColumns="configColumns"
				:props="{ key: 'prop', label: 'label' }"
				@close="customColumnsPopClose"
			/>
		</div>
		<el-dialog
			:title="$t('PayApplyList.generateVoucher')"
			:visible.sync="rejectDialogVisible"
			width="500px"
		>
			<el-form :model="query" ref="query" label-width="80px">
				<el-form-item
					:label="$t('PayApplyList.voucherNo')"
					prop="bizType"
					:rules="{
						required: true,
						message: ' ',
						trigger: 'blur',
					}"
				>
					<el-select
						size="mini"
						v-model="query.bizType"
						:placeholder="$t('Common.plSelect')"
						style="width: 100%"
					>
						<el-option
							v-for="item in dictMap.voucherBizType"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						>
						</el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="rejectSubmit" size="mini"
					>{{$t('OrderFee.confirm')}}</el-button
				>
				<el-button @click="rejectDialogVisible = false" size="mini"
					>{{$t('Common.cancel')}}</el-button
				>
			</span>
		</el-dialog>
	</div>
</template>
<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import Refund from '@/views/finance/pay/order/components/refund'
import PerpayDetail from '@/views/finance/pay/writeoffPay/detail/prepayDetail'
import PrepayWriteOffDetail from '@/views/finance/pay/writeoffPay/detail/prepayWriteOffDetail'
import SettleDetail from '@/views/finance/pay/writeoffPay/detail/settleDetail'
import CustomColumns from '@/components/customColumns/index'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { mapState } from 'vuex'
import { billList, customerConfirm } from '@/api/fin/bill'
import { listPage, createPaperInvoiceBatch, close } from '@/api/fin/invoiceReceivableApply'
import { queryWriteoffPayPageList, acceptancePayOrder, confirmPayWriteoff, writeoffUnlock, writeoffRollback, afreshWriteoff, queryWriteoffPayPageSummary,
  acctWriteoffPayPageList,
  acctWriteoffPayPageSummary,
} from '@/api/fin/pay'
import { receipayWriteOffGenerate, voucherDelete } from '@/api/fin/voucher/'
import { dateFormat } from '@/views/finance/utils/finance'
import Vue from 'vue'
import { bankList, listByRole } from '@/api/base'
import PreviewDialog from '@/views/finance/voucher/components/previewDialog'
import { bankAccountListAll } from '@/api/fin/settleUnitBankAcct'
export default {
  name: "writeoffPayList",
  label: "付款核销",
	name: "WriteoffPayList",
	mixins: [mixin, mixin2],
	props: ['isJumpRouteFromPage'],
	data () {
    let isVoucherRoute = this.$route.name === 'AccountantVoucherWriteoff'
		return {
      pageSizeUrl: isVoucherRoute ? acctWriteoffPayPageList('geturl') : queryWriteoffPayPageList('geturl'),
      keyDownActive: true,
			hasVoucher: '',
      isVoucherRoute,
      writeoffReceipayNo: '',
			writeoffReceipayId: 0,
			query: {
				writeoffReceipayNos: [],
				bizType: "",
			},
			searchBackup: [],
			currentComponent: '',
			rejectDialogVisible: false,
			option1: {},
			option2: {},
			searchOption1: {},
			table1DataBackup: [],
			table2DataBackup: [],
			isAddPay: false,
			multipleSelection1: [],
			multipleSelection2: [],
			form: {
				orderNo: '',
				creationDate: '',
				billNo: '',
				settleCorpName: '',
				settleCorpCode: ''
			},
			orderNo: '',
			refundQuery: {},
			showBillDetail: false,
			autocomplete: {
			},
			selectedOptionItem: '',
			dialogVisible: false,
			previewDialog: {
				show: false,
				title: this.$t('PayApplyList.previewVoucher'), // '凭证预览',
        seqNos: '',
				seqNo: '',
				showData: {},
			},
			// 升序
			ascColumns: [],
			// 降序
			descColumns: [],
			// 初始表头
			selfColumnsBase: [
				{
					disabled: true,
					prop: 'writeoffReceipayNo',
					label: this.$t('Hedge.writeoffNo'),
					width: '150px',
					type: 'button',
					action: 'showDetail',
					operationBtns: {
						show: true,
						callback: (action, $index, row, option) => {
							if (action === 'showDetail') {
								this.showDetail(row)
							}
						}
					}
				},
				{
					prop: 'recvCorpName',
					label: this.$t('FeeList.settleCorp'),
					width: '150px',
					type: 'text',
				},
				{
					prop: 'unitType',
					label: this.$t('OrderFee.settleCorpType'), // '结算单位类型',
					width: '130px',
					type: 'select',
					sortable: false,
					propInDict: "settleUnitType",
					formatter: ({row}, column) => {
						let list = row.unitType.split(',')
						if (list.length) {
							let data = []
							list.forEach(item => {
								data.push(this.dictMapObj.settleUnitType[item])
							})
							return data.toString()
						}
					},
				},
				{
					prop: 'isTemporarySettleUnit',
					label: this.$t('PayApplyList.whetherVirtual'), // '是否虚拟',
					type: 'select',
					propInDict: "yesNo",
					width: 130
				},
				{
					prop: 'payOrderNo',
					label: this.$t('Settle.payOrderNo'),
					width: '150px',
					type: 'button',
					action: 'showDetail',
					operationBtns: {
						show: true,
						callback: (action, $index, row, option) => {
							if (action === 'showDetail') {
								let query = {
									payOrderNo: row.payOrderNo
								}
								// this.routerPush('OrderDetails', query)
								this.$emit('update:isJumpRouteFromPage', true)
								this.$router.push({ name: 'OrderDetails', query })
							}
						}
					}
				},
				{
					prop: 'orderNo',
					label: this.$t('FeeList.orderNo'),
					width:140,
					type: 'columnTip',
					sortable: false,
					component: 'ColumnTip',
					componentProps: {
					show: false,
					data: [],
					callback: (no, { row }, index) => {
						let orderNoList = row.orderNo_multiValue
						let sourceTypeList = row.sourceType_multiValue
						let orderNo = orderNoList[index]
						let sourceType = sourceTypeList[index]
						let sourceBizNo = orderNo
						this.$emit('update:isJumpRouteFromPage', true)
							this.showOneNoDetail(sourceType, sourceBizNo, { feeId: '' })
						},
					},
				},
				{  prop: 'bdEmployeeName',  label: this.$t('FeeList.bdEmployeeId'),  width: 100,  type: 'text', sortable: false},
        {  prop: 'custName',  label: this.$t('PayApplyList.custName'),  width: 150,  type: 'text', sortable: false}, // '委托单位'
				{
					prop: 'mbl',
					label: 'MBL',
					type: 'tooltip',
					sortable: false
				},
				{
					prop: 'hbl',
					label: 'HBL',
					type: 'tooltip',
					sortable: false
				},
				{
					prop: 'payWay',
					label: this.$t('PayApplyList.payWay'), // '付款方式',
					width: 140,
					type: 'select',
					propInDict: "payWay"
				},
				{
					label: this.$t('PayApplyList.settleMode'), // '账户结算方式',
					type: 'select',
					prop: 'settleMode',
					propInDict: 'bankAccountSettleMode',
					width: 140,
					multi: true,
				},
				{
					prop: 'orderType',
					label: this.$t('PayApplyList.payOrderType'), // '付款单类型',
					width: 150,
					type: 'select',
					propInDict: "payOrderType"
				},
				{
					prop: 'settleCompName',
					label: this.$t('PayApplyList.settleCompName'), // this.$t('Settle.branchCompany'),
					type: 'text',
					width: 150,
				},
				{
					prop: this.$t('PayApplyList.differenceType'), // 'differenceType',
					label: this.$t('PayApplyList.differenceType'),
					type: 'select',
					width: 130,
				},
				{
					prop: 'differenceAmt',
					label: this.$t('PayApplyList.differenceAmt'), // '差额',
					type: 'text',
					width: 130,
				},
				{
					prop: 'differenceDealway',
					label: this.$t('PayApplyList.differenceDealway'), // '差额处理方式',
					type: 'select',
					width: 140,
					propInDict:'payDifferenceDealway'
				},
        {
          prop: 'groupSettleCompName',
          label: this.$t('PayApplyList.interSettleBranch'), // '内部往来分公司',
          type: 'text',
          width: 155,
        },
				// {
				// 	prop: 'recheckStatus',
				// 	label: '核销状态',
				// 	type: 'select',
				// 	propInDict: "writeoffRecheckStatus"
				// },
				{
					prop: 'writeoffSubType',
					label: this.$t('PayApplyList.writeoffSubType'), // '核销子类型',
					width: 140,
					type: 'select',
					propInDict: "writeoffSubType"
				},
				{
					prop: 'payBankName',
					label: this.$t('PayApplyList.payBankName'), // '付款银行',
					type: 'text',
					width: 120
				},
				{
					prop: 'payAccountShortName',
					label: this.$t('PayApplyList.payAccountShortName'), // '付款银行简称',
					width: 160,
					type: 'text',
				},
				// {
				// 	prop: 'payAccountShortName',
				// 	label: '付款账户名',
				// 	width:120,
				// 	type: 'text',
				// },
				{
					prop: 'payAccountNo',
					label: this.$t('PayApplyList.payAccountNo'), // '付款账号',
					width: 140,
					type: 'text',
				},
				{ prop: 'recvBankName', label: this.$t('PayApplyList.recvBankName'), width: 130, }, // '收款银行'
				{ prop: 'recvBankBranch',  label: this.$t('PayApplyList.recvBankBranch'),  type: 'text',  width: 155,}, // '收款银行支行'
				{ prop: 'recvAccountName', label: this.$t('PayApplyList.recvAccountName'), width: 170 }, // '收款账户名'
				{ prop: 'recvAccountNo', label: this.$t('PayApplyList.recvAccountNo'), width: 155,}, // '收款账号'
				{
					prop: 'applyAmt',
					label: this.$t('PayApplyList.applyPayAmt'), // '申请金额',
					type: 'text',
					width: 140
				},
				{
					prop: 'realPayAmt',
					label: this.$t('PayApplyList.realPayAmt'), // '实付金额',
					type: 'text',
					width: 120,
				},
				{
					prop: 'totalWirteoffAmt',
					label: this.$t('Charge.writeoffAmt'),
					type: 'text',
					width: 140
				},
				{
					prop: 'currency',
					label: this.$t('FeeList.currency'),
					type: 'text',
					width: 100
				},
				{
					prop: 'receivePayDate',
					label: this.$t('PayApplyList.receivePayDate'), // '收付日期',
					type: 'text',
					width: 130
				},
				{
					prop: 'voucherStatus',
					label: this.$t('PayApplyList.voucherStatus'), // '凭证状态',
          customColumnHide: isVoucherRoute,
          fixed: isVoucherRoute ? 'left' : '',
					sortable:false,
					type: 'select',
					width: 120
					// formatter: ({row}) => {
          //   let yes = row['voucherStatus'] === 'yes'
          //   if (isVoucherRoute) {
          //     return `<span class="ls_${yes ? 'green' : 'red'}">${yes ? '已生成' : '未生成'}</span>`
          //   } else {
          //     return yes ? '已生成' : '未生成'
          //   }
					// }
				},
				{
					prop: 'sourceApplyNo',
					label: this.$t('PayApplyList.applyNo'), // '申请单号',
					type: 'columnTip',
					width: '150px',
					component: 'ColumnTip',
					componentProps: {
						show: false,
						data: [],
						callback: (subItem, componentProps) => {
							this.componentProps = componentProps
              let row = componentProps.row
							console.log(row.orderType);
							this.$emit('update:isJumpRouteFromPage', true)
							//请款类型为【预付付款】跳转到预付款申请详情页
							if (row.orderType === 'prepay') {
								let query = {
									applyNo: subItem,
									source: "createRegPrepayFrom"
								}
								return this.$router.push({
									name: 'PrepayDetail',
									query
								})
							}
							//请款类型为【结算付款|预付抵账】跳转到结算付款申请详情页
							if (row.orderType === 'refund_pay') {
								let query = {
									applyNo: subItem,
									payApplyReceiveRefundId: row.payApplyReceiveRefundId,
									source: "createRegPrepayFrom"
								}
								return this.$router.push({
									name: 'RefundDetail',
									query
								})
							}
							//请款类型为【结算付款|预付抵账】跳转到结算付款申请详情页
							return this.$router.push({
								name: 'SettleDetail', query: {
									applyNo: subItem,
									confirmStatus: row.confirmStatus
								}
							})
						}
					}
				},
				{
					prop: 'voucherNo',
          customColumnHide: isVoucherRoute,
          fixed: isVoucherRoute ? 'left' : '',
					label: this.$t('PayApplyList.voucherNo'), // '凭证号',
					type: 'columnTip',
					component: 'ColumnTip',
					componentProps: {
						show: false,
            			data: [],
						callback: (no, componentProps, index) => {
							this.componentProps = componentProps
              let row = componentProps.row
							let acctVoucherSeqno = row.acctVoucherSeqno_multiValue
							let seqNo = acctVoucherSeqno[index]
							if(!seqNo) return
              this.initShowVoucher(this.previewDialog, seqNo, '', '')
							// this.previewDialog.showData = ''
							// this.previewDialog.seqNos = ''
							// this.previewDialog.seqNo = seqNo
							// this.previewDialog.show = true
						},
					},
					width: 130
				},
				// 海外版不显示
				// {
				// 	prop: 'invoiceNoAppend',
				// 	label: this.$t('FeeList.invoiceNo'),
				// 	type: 'columnTip',
				// 	component: 'ColumnTip',
				// 	componentProps: {
				// 		show: false,
				// 		data: [],
				// 		callback: (subItem, componentProps, index) => {
				// 			this.componentProps = componentProps
        //       let row = componentProps.row
				// 			let invoicePaymentId = row.invoiceNoAppendIds[index]
				// 			this.$emit('update:isJumpRouteFromPage', true)
				// 			this.$router.push({
				// 				name: 'InvoicePaymentListDetail',
				// 				query: {
				// 					invoicePaymentId
				// 				}
				// 			})
				// 		},
				// 	},
				// },
				// {
				// 	prop: 'hasInvoiceAmt',
				// 	label: this.$t('Collect.invoicedAmt'),
				// 	width: 100,
				// 	type: 'text',
				// 	sortable: false
				// },
				// {
				// 	prop: 'noInvoiceAmt',
				// 	label: this.$t('Collect.uninvoicedAmount'),
				// 	width: 100,
				// 	type: 'text',
				// 	sortable: false
				// },
				// {
				// 	disabled: false,
				// 	prop: 'transferDzg',
				// 	sortable:false,
				// 	label: '大掌柜',
				// 	type: 'select',
				// 	propInDict: "yesNo"
				// },
				// {
				// 	disabled: false,
				// 	prop: 'transferDzgAmt',
				// 	sortable:false,
				// 	label: '大掌柜金额',
				// 	type: 'text'
				// },
				{
					prop: 'interTransferFeeStr',
					label: this.$t('PayApplyList.interTransferFeeStr'), // '内扣手续费',
					sortable: false,
					type: 'text',
					width: 160
				},
				{
					prop: 'exterCutTransferFeeStr',
					label: this.$t('PayApplyList.exterCutTransferFeeStr'), // '外扣手续费',
					sortable: false,
					type: 'text',
					width: 160
				},
				// {
				// 	prop: 'writeoffReverseNo',
				// 	label: this.$t('Hedge.writeoffReverseNo'),
				// 	width: 120,
				// 	type: 'text'
				// },
				{
					prop: 'writeoffName',
					label: this.$t('PayApplyList.writeoffName'), // '核销人',
					type: 'text',
					width: 120
				},
				{
					prop: 'writeoffDate',
					label: this.$t('PayApplyList.writeoffDate'), // '核销日期',
					type: 'text',
					width: 130
				},
				{
					prop: 'recheckStatus',
					label: this.$t('PayApplyList.recheckStatus'), // '复核状态',
					type: 'select',
					propInDict:'writeoffRecheckStatus',
					width: 120
				},
				{
					prop: 'recheckName',
					label: this.$t('PayApplyList.recheckName'), // '复核人',
					type: 'text',
					width: 120
				},
				{
					prop: 'recheckTime',
					label: this.$t('PayApplyList.recheckTime'), // '复核时间',
					type: 'text',
					width: 120
				},
        { prop: 'compareStatus', label: this.$t('PayApplyList.compareStatus'), type: 'select', width: 170, propInDict: 'recvPayCompareStatus' }, // '对账状态'
        {
          prop: 'compareTime',
          label: this.$t('PayApplyList.compareTime'), // '对账时间',
          type: 'text',
          sortable: true,
          width: 170,
        },
				{
					prop: 'remark',
					label: this.$t('PayApplyList.remark'), // '核销备注',
					type: 'text',
				},
				// { 
				// 	prop: 'payApplyConfirmName', 
				// 	label: '付款单审核人',
				// 	width: 100, 
				// },
				{
					prop: 'deduePrepayVoucherStatus',
					label: this.$t('PayApplyList.deduePrepayVoucherStatus'), // '预付款凭证生成状态',
					type: 'select',
					key: 'invoiceDate',
					width: 170,
					propInDict: 'voucherYesNoPart'
				}
			],
			rightFilterBtns: [true, false, false, false],
			loading: false,
			exportTypeList: [
				{ label: this.$t('OrderFee.list'), value: 'writeoffPayListExport' }, // '列表'
				{ label: this.$t('OrderFee.detail'), value: 'writeoffPayDetailExport' }, // '明细'
				// { label: this.$t('Collect.desInvoice'), value: 'writeoffPayDetailHasInvoiceExport' } // 海外版不显示
			],
		}
	},
	created () {
		this.searchOption1 = {
			saveShow: true,
			saveName: 'writeoffPayListWriteoff',
			isNotAutoLoad: true,
			listHeightFunc: this.computeFinTableHeight,
			addFilter: {
				// 初始搜索条件数
				defaultSearchLength: 6,
				// 条件数组
				searchInputGroup: [
					{ key: 'allNo', value: '', showType: '1', range: { min: '', max: '' } },
					{ key: 'writeoffSubType', value: '', showType: '2', range: { min: '', max: '' } },
					{ key: 'recvCorpCode', value: '', showType: '3', range: { min: '', max: '' } },
					{ key: 'currency', value: '', showType: '4', range: { min: '', max: '' } },
					{ key: 'writeoffAmt', value: '', showType: '5', range: { min: '', max: '' } },
					{ key: 'writeoffDate', value: '', showType: '6', range: { min: '', max: '' } },

				],
				filterGroups: {
					//1
					allNo: { label: this.$t('PayApplyList.allNo'), type: 'input', showType: '1' }, // placeholder:"多个单号用空格或逗号分隔"
					writeoffReceipayNo: { label: this.$t('Hedge.writeoffNo'), type: 'input', showType: '1' },
					// writeoffReverseNo: { label: this.$t('Hedge.writeoffReverseNo'), type: 'input', showType: '1' },
					orderNo: { label: this.$t('FeeList.orderNo'), type: 'input', showType: '1' },
					payOrderNo: { label: this.$t('Settle.payOrderNo'), type: 'input', showType: '1' },
					sourceApplyNo: { label: this.$t('PayApplyList.applyNo'), type: 'input', showType: '1' }, // '申请单号'
					voucherNo: { label: this.$t('PayApplyList.voucherNo'), type: 'input', showType: '1' }, // '凭证号'
					// invoiceNo: { label: this.$t('PayApplyList.mode'), type: 'input', showType: '1' }, // '发票号' // 海外版不显示
					mbl: { label: 'MBL',  type: 'input',  showType: '1'},
					// payApplyConfirmName: { label: '付款单审核人',  type: 'input',  showType: '1'},
					writeoffName: { label: this.$t('PayApplyList.writeoffName'),  type: 'input',  showType: '1'}, // '核销人'

					//2
					writeoffSubType: { label: this.$t('PayApplyList.writeoffSubType'), multiple: true, type: 'select', prop: "payWriteoffSubType", showType: '2' }, // '核销子类型'
					orderType: { label: this.$t('PayApplyList.payOrderType'), multiple: true, type: 'select', prop: "payOrderType", showType: '2' }, // '付款单类型'
					recheckStatus: { label: this.$t('PayApplyList.recheckStatus'), multiple: true, type: 'select', prop: "writeoffRecheckStatus", showType: '2' }, // '复核状态'
					// transferDzg: { label: '大掌柜', type: 'select', prop: "yesNo", showType: '2' },
					voucherStatus: {
						label: this.$t('PayApplyList.voucherStatus'), type: 'select', prop: 'voucherStatus' // '凭证状态'
					},
					payWay: { label: this.$t('PayApplyList.payWay'), type: 'select', multiple: true, prop: "payWay", showType: '2' }, // '付款方式'
					settleMode:{ label: this.$t('PayApplyList.settleMode'), type: 'select', propInDict: 'bankAccountSettleMode', r: true, multiple: true }, // '账户结算方式'
					//3
					recvCorpCode: {
						label: this.$t('FeeList.settleCorp'),
						type: 'remoteSelect',
						showType: '3',
						remote: true,
						multiple: true,
						remoteMethod: (queryString, item, row) => {
							this.querySettleUnit2({ queryString, 'unitTypes': 'customer,supplier,company' }, item)
						},
						visibleChange: (queryString, item, row) => {
							this.querySettleUnit2({ queryString, 'unitTypes': 'customer,supplier,company' }, item)
						},
						remoteSelectList: []
					},
					bdEmployeeId: {
						label: this.$t('FeeList.bdEmployeeId'),
						type: 'remoteSelect',
						clearable: true,
						remoteSelectList: [],
						remoteMethod: (queryString, item) => {
						this.getSellers(queryString, item, 'bd')
						},
						visibleChange: (queryString, item) => {
						this.getSellers(queryString, item, 'bd')
						},
					},
					payBankCode: {
						label: this.$t('PayApplyList.payBankName'), // '付款银行',
						type: 'remoteSelect',
						showType: '3',
						remote: true,
						multiple: true,
						remoteMethod: (value, item, row) => {
							bankList({
								currPage: 1,
								pageSize: 1000,
								query: [{ column: 'cname', type: 'like', value }],
							}).then((res) => {
								item.remoteSelectList = ((res.data && res.data.list) || []).map((item) => {
								return { ...item, label: item.cname, value: item.bankCode }
								})
							})
						},
						visibleChange: (value, item, row) => {
							bankList({
								currPage: 1,
								pageSize: 1000,
								query: [{ column: 'cname', type: 'like', value }],
							}).then((res) => {
								item.remoteSelectList = ((res.data && res.data.list) || []).map((item) => {
								return { ...item, label: item.cname, value: item.bankCode }
								})
							})
						},
						remoteSelectList: []
					},
					payAccountNo: {
						label: this.$t('PayApplyList.payAccountNo'), // '付款银行简称',
						type: 'remoteSelect',
						showType: '3',
						remote: true,
						multiple: true,
						remoteMethod: (queryString, item, row) => {
							this.bankAccountListAll(queryString, item)
							// this.$store.dispatch('dict/bankAccountList', {"accountName":queryString, "receipayType":"pay","status": "effect"}).then((data) => {
							// 	item.remoteSelectList = ((data) || []).map((item) => {
							// 		return { ...item, label: item.accountShortName, value: item.accountNo }
							// 	})
							// })
						},
						visibleChange: (queryString, item, row) => {
							this.bankAccountListAll(queryString, item)
							// this.$store.dispatch('dict/bankAccountList', {"accountName":queryString, "receipayType":"pay", "status": "effect"}).then((data) => {
							// 	item.remoteSelectList = ((data) || []).map((item) => {
							// 		return { ...item, label: item.accountShortName, value: item.accountNo }
									
							// 	})
							// })
						},
						remoteSelectList: []
					},
					// accountName: { label: '付款账户名',
					// 	type: 'remoteSelect',
					// 	showType: '3',
					// 	remote: true,
					// 	multiple: true,
					// 	remoteMethod: (queryString, item, row) => {
					// 		this.$store.dispatch('dict/bankAccountList', {"accountName":queryString, "receipayType":"pay","status": "effect"}).then((data) => {
					// 			item.remoteSelectList = ((data) || []).map((item) => {
					// 				return { ...item, label: item.accountShortName, value: item.accountShortName }
					// 			})
					// 		})
					// 	},
					// 	visibleChange: (queryString, item, row) => {
					// 		this.$store.dispatch('dict/bankAccountList', {"accountName":queryString, "receipayType":"pay", "status": "effect"}).then((data) => {
					// 			item.remoteSelectList = ((data) || []).map((item) => {
					// 				return { ...item, label: item.accountShortName, value: item.accountShortName }
									
					// 			})
					// 		})
					// 	},
					// 	remoteSelectList: []
					// },
					// accountName: { label: '付款账户名', 
					// 	type: 'input', showType: '3'
					// },
					unitType: { label: this.$t('PayApplyList.unitType'), multiple: true, type: 'select', prop: "settleUnitType", showType: '3' }, // '结算单位类型'
					isTemporarySettleUnit: { label: this.$t('PayApplyList.whetherVirtual'), type: 'select', prop: "yesNo", showType: '3' }, // '是否虚拟'
					// settleCompName: { label: this.$t('Settle.branchCompany'), type: 'input', showType: '3' },
					settleCompCode: {
						label: this.$t('Settle.branchCompany'),
						prop: 'settleCorpCode',
						type: 'remoteSelect',
						remoteMethod: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
						visibleChange: (queryString, item) => this.querySettleUnit2({ queryString, unitTypes: 'company' }, item),
						remoteSelectList: [],
					},
					groupSettleCompCode: {
						label: this.$t('PayApplyList.interSettleBranch'), // '内部往来分公司',
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
					//4
					currency: { label: this.$t('FeeList.currency'), type: 'select', selectOptions: this.dictMap.currency.filter((v) => v.value != 'ORIGINAL'), },
					//5
					writeoffAmt: { label: this.$t('Charge.writeoffAmt'), type: 'range', showType: '5' },
					// transferDzgAmt: { label: '大掌柜金额', type: 'range', showType: '5' },
					payAmt: { label: this.$t('PayApplyList.payAmt'), type: 'range', showType: '5' }, // '申请金额'
					realPayAmt: { label: this.$t('PayApplyList.realPayAmt'), type: 'range', showType: '5' }, // '实付金额'
					// hasInvoiceAmt: { label: this.$t('PayApplyList.mode'), type: 'range', showType: '5' }, // '已开票金额' // 海外版不显示
					// noInvoiceAmt: { label: this.$t('PayApplyList.mode'), type: 'range', showType: '5' }, // '未开票金额' // 海外版不显示
					//6
					receivePayDate: { label: this.$t('PayApplyList.receivePayDate'), type: 'lsDaterange', format: 'yyyy-MM-dd' }, // '收付日期'
					writeoffDate: { label: this.$t('PayApplyList.writeoffDate'), type: 'lsDaterange', format: 'yyyy-MM-dd' }, // '核销日期'
					recheckTime: { label: this.$t('PayApplyList.recheckTime'), type: 'lsDaterange', format: 'yyyy-MM-dd' }, // '复核时间'
          compareStatus: { label: this.$t('PayApplyList.compareStatus'), type: 'select', prop: 'recvPayCompareStatus' }, // '对账状态'
          // compareTime: { label: this.$t('Collect.reconcTime'), type: 'lsDaterange', format: 'yyyy-MM-dd', gle: true, hms: true },
					deduePrepayVoucherStatus: { label: this.$t('PayApplyList.deduePrepayVoucherStatus'), type: 'select', prop: "voucherYesNoPart" }, // '预付款凭证生成状态'
				},
			}
		}
		let _this = this
		this.autocomplete = {
			querySearch: (queryString, cb) => {
				_this.selectedOptionItem = ''
				_this.querySettleUnit(queryString, cb)
			},
			select: (optionItem, row) => {
				_this.selectedOptionItem = optionItem
				_this.form.settleCorpName = optionItem.value
				_this.form.settleCorpCode = optionItem.key
			},
			change: (val, row) => {
				// 延时150ms获取select中的改变
				setTimeout(() => {
					if (_this.selectedOptionItem === '') {
						_this.form.settleCorpName = ''
						_this.form.settleCorpCode = ''
						return
					}
				}, 150)
			}
		}
		let operationBtns = Object.assign({}, this.option.operationBtns, {
			data: [
				{
					label: this.$t('OrderFee.detail'),
					type: 'text',
					showFn: ()=> this.checkAuth(this.$route.name, 'tab-writeoffPayList', 'btn-detail'),
					action: 'showDetail'
				}
			],
			width: 80
		})
		let pagination = Object.assign({}, this.option.pagination, {
			show: true,
      isNew: true,
		})
		let listAmtSummary = Object.assign({}, this.option.listAmtSummary, { show: true })
		this.option1 = Object.assign({}, this.option, {
			id: 'option1', $name: 'writeoffPayList',
			data: [
				... this.option.data
			],
			tips: {
				text: '',
				show: false
			},
			operationBtns,
			pagination,
			listAmtSummary,
			sortable: true,
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
			sortChange: (column, prop, order) => {
				this.descColumns = order == 'descending' ? [prop] : []
				this.ascColumns = order == 'ascending' ? [prop] : []
				this.getData()
			}, needTimeSort: true,
      emptyText: this.$t('OrderFee.showAfterQuery'), // '数据将在查询后显示',
      colorColumns: ['voucherStatus'],
		})
		let columns = [...this.selfColumnsBase]
    if (this.isVoucherRoute) {
      this.configColumns.push(...this.selfColumnsBase.filter((item) => !item.customColumnHide).map((item) => item.prop))
    } else {
      this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
    }
		// this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
		// console.log(this.configColumns)
		// this.selfColumnsBase.forEach((item) => (item.sortable = true))
		this.option1.columns = columns
	},
	methods: {
		querySettleUnit1 (queryString, cb) {
			this.$store.dispatch('dict/querySettleUnit', queryString).then(data => {
				cb(data)
			})
		},
		submit () {
		},
		handleSizeChange (val) {
			this.option1.pagination.pageSize = val
			this.getData && this.getData()
		},
		handleCurrentChange (val) {
			this.option1.pagination.currPage = val
			this.getData && this.getData()
		},
		writeoff () {
			if (this.multipleSelection1.length === 0) {
				this.$message({
					message: this.$t('OrderFee.selectRow'), // '请勾选需要核销复核的项！',
					type: 'error',
					showClose: true
				})
				return
			}
			// if (this.multipleSelection1.length > 1) {
			// 	this.$message({
			// 		message: '请勾选1个核销复核的项！',
			// 		type: 'error',
			// 		showClose: true
			// 	})
			// 	return
			// }
			let writeoffReceipayId = this.multipleSelection1.map(item => {
				return item.writeoffReceipayId
			})
			this.$confirm(this.$t('PayApplyList.sureReview'), this.$t('OrderFee.tip'), { // '您确定要核销复核吗?', "核销复核"
				confirmButtonText: this.$t('OrderFee.confirm'),
				cancelButtonText: this.$t('OrderFee.cancel'),
				lockScroll: "true",
				type: "warning"
			}).then(() => {
				return confirmPayWriteoff({ writeoffReceipayIdList: writeoffReceipayId })
			}).then(() => {
				this.$message({ message: this.$t('OrderFee.successOp'), type: 'success' }); // '核销复核提交成功'
				this.getData()
			}).catch(function () { });
		},
		handleApplyFor (confirmStatus) {
			if (this.multipleSelection1.length === 0) {
				this.$message({
					message: this.$t('OrderFee.selectRow'), // '请勾选需要' + (confirmStatus == 'writeoffUnlock' ? "取消复核" : confirmStatus == 'afreshWriteoff' ? "重复核销" : "反核销") + '的项！',
					type: 'error',
					showClose: true
				})
				return
			}
			if (this.multipleSelection1.length > 1) {
				this.$message({
					message: this.$t('OrderFee.selectOneRow'), // '一次只能勾选一个' + (confirmStatus == 'writeoffUnlock' ? "取消复核" : confirmStatus == 'afreshWriteoff' ? "重复核销" : "反核销") + '！',
					type: 'error',
					showClose: true
				})
				return
			}
			let Id = this.multipleSelection1.map(item => {
				return item.writeoffReceipayId
			})
			let writeoffReceipayId = Id.toString()
			if (confirmStatus === "writeoffUnlock") {
				this.$confirm(this.$t('PayApplyList.sureCancelReview'), this.$t('OrderFee.tip'), { // '您确定要取消复核吗?', "取消复核"
					confirmButtonText: this.$t('OrderFee.confirm'),
					cancelButtonText: this.$t('OrderFee.cancel'),
					lockScroll: "true",
					type: "warning"
				}).then(() => {
					return writeoffUnlock({ writeoffReceipayId: Number(writeoffReceipayId) });
				}).then(() => {
					this.$message({ message: this.$t('OrderFee.successOp'), type: 'success' }); // '取消复核过提交成功'
					this.getData()
				}).catch(function () { });
			}
			if (confirmStatus === "afreshWriteoff") {
				afreshWriteoff({ writeoffReceipayId }).then(res => {
					let query = {
						payOrderNo: res.data.payOrder.payOrderNo,
						orderType: res.data.payOrder.orderType,
					}
					this.$emit('update:isJumpRouteFromPage', true)
					this.$router.push({
						name: 'OrderDetails',
						query
					})
					// this.routerPush('WriteOffPreview', query)
				})
			}
			if (confirmStatus === "writeoffRollback") {
				this.$confirm(this.$t('PayApplyList.sureAntiwriteoff'), this.$t('OrderFee.tip'), { // '您确定要反核销算吗?', "警告"
					confirmButtonText: this.$t('OrderFee.confirm'),
					cancelButtonText: this.$t('OrderFee.cancel'),
					lockScroll: "true",
					type: "warning"
				}).then(() => {
					return writeoffRollback({ writeoffReceipayId: Number(writeoffReceipayId) });
				}).then(() => {
					this.$message({ message: this.$t('OrderFee.successOp'), type: 'success' }); // '反核销提交成功'
					this.getData()
				}).catch(function () { });
			}

		},
		rejectSubmit () {
			this.query.preview = 'yes'
			this.$refs.query.validate(valid => {
				if (valid) {
					receipayWriteOffGenerate(this.query).then(res => {
						this.$message({ message: this.$t('OrderFee.successOp'), type: 'success' }); // '生成凭证提交成功'
						this.getData()
						this.rejectDialogVisible = false
					})
				}
			})
		},
    // 删除凭证
    delVoucher(){ 
      let selectRow = this.multipleSelection1
      if (!selectRow.length) {
        return this.$msgErrClose(this.$t('OrderFee.selectRow')) // `请勾选需要删除凭证的项！`
      }
      let arr = selectRow.filter(item => item.voucherNo)
      if (!arr.length) {
        return this.$msgErrClose(this.$t('OrderFee.selectRow')) // `请勾选已生成凭证的项！`
      }
      let voucherNos = []
      let voucherSeqNos = []
      arr.forEach((val) => {
        voucherNos.push(...val.voucherNo_multiValue)
        voucherSeqNos.push(...val.acctVoucherSeqno_multiValue)
      })
      voucherNos = [...new Set(voucherNos)].filter(v=>v!=='null')
      voucherSeqNos = [...new Set(voucherSeqNos)]
      // return console.log(voucherSeqNos);
      this.$confirmWarn(`${this.$t('PayApplyList.sureDelete')}${voucherNos.join(',')}?`, () => { // this.$t('Hedge.detailsTips', {voucherNos: voucherNos.join(',')})
        voucherDelete({ voucherSeqNos }).then((res) => {
          this.$msgSucClose(this.$t('OrderFee.successOp')) // '删除成功！'
          this.getData()
        })
      })
    },
		generateVoucher (preview, bizNo) {
      // 凭证预览内的删除也走这个回调，refresh表示删除成功，刷新列表
      if(preview === 'refresh'){
        this.getData()
        return 
      }
			let isPreview = preview === true
			if(!bizNo) this.previewDialog.show = false
			let selectRow = this.multipleSelection1
			if (this.multipleSelection1.length === 0) {
				this.$msgErrClose(this.$t('OrderFee.selectRow')) // `请勾选需要${isPreview ? '预览' : '生成'}凭证的项！`
				return
			}
      if(selectRow.length && isPreview){
        let hasVoucher, noVoucher
        selectRow.forEach(v=>{
          if(v.voucherStatus === 'yes' && !(v.noVoucherCompanyCodes||'').split(',').includes(this.storeSettleCode)) {
            hasVoucher = true
          }else{
            noVoucher = true
          }
        })
        if(hasVoucher && noVoucher){
          return this.$msgErrClose(this.$t('PayApplyList.voucherAndUnNotPrev')) // '已生成和未生成凭证的记录不能同时预览！'
        }
      }
			let arr = selectRow.filter((v) => v.voucherStatus !== 'yes' || (v.noVoucherCompanyCodes||'').split(',').includes(this.storeSettleCode))
			if (!arr.length) {
				if (isPreview) {
          console.log(selectRow.map(v=>v.acctVoucherSeqno_multiValue.join(',')).join(','))
          this.initShowVoucher(this.previewDialog, '', selectRow.map(v=>v.acctVoucherSeqno_multiValue.join(',')).join(','),'')
					// this.previewDialog.showData = ''
					// this.previewDialog.seqNo = ''
					// this.previewDialog.seqNos = selectRow.map(v=>v.acctVoucherSeqno).join(',')
					// this.previewDialog.show = true
				} else {
					this.$msgErrClose(this.$t('PayApplyList.selectItemSUNoVoucher')) // '请选择当前结算单位未生成凭证号的记录！'
				}
				return
			}
			let data = {
        writeoffReceipayNos: bizNo && bizNo !== 'all' ? [bizNo] : this.multipleSelection1.map((item) => item.writeoffReceipayNo),
				bizType: 'pay_writeoff',
				preview: 'no',
			}
			if (isPreview) {
				data.preview = 'yes'
        this.loading = true
				receipayWriteOffGenerate(data).then(res => {
          this.initShowVoucher(this.previewDialog, '', '', res.data)
					// this.previewDialog.seqNo = ''
          // this.previewDialog.seqNos = ''
					// this.previewDialog.showData = res.data
					// this.previewDialog.show = true
        }).finally(()=> this.loading = false)
        return
			}
			this.$confirm(this.$t('PayApplyList.confirmGeneVoucher'), this.$t('OrderFee.tip'), { // '确认生成凭证?', "生成凭证"
				confirmButtonText: this.$t('OrderFee.confirm'),
				cancelButtonText: this.$t('OrderFee.cancel'),
				lockScroll: "true",
				type: "warning"
			}).then(() => {
        this.$refs.PreviewDialog.lsLoading = true
				return receipayWriteOffGenerate(data)
			}).then(() => {
        this.$msgSucClose(this.$t('OrderFee.successOp')) // '凭证已经处理！'
        !isPreview && !bizNo && this.getData()
			}).finally(()=> this.$refs.PreviewDialog.lsLoading = false)
			// this.query.writeoffReceipayNos = writeoffReceipayNo
			// this.query.bizType = ""
			// this.rejectDialogVisible = true
		},
		querySettleUnit (queryString, cb) {
			this.$store.dispatch('dict/currencyList', queryString).then(data => {
				cb(data)
			})
		},
    getData(isSearch, customerList) {
      this.isNotFirtGetData = true
      if(this.debounceLsFn()){ return Promise.resolve()}
			this.loading = true
			let data = {
				ascColumns: this.ascColumns,
				descColumns: this.descColumns,
				currPage: this.option1.pagination.currPage,
				pageSize: customerList ? 0 : this.option1.pagination.pageSize,
				query: [],
			}
			if (this.customColumnsKeys && this.customColumnsKeys.length) {
				data.columns = this.customColumnsKeys
			}
			// this.searchOption1.addFilter.searchInputGroup.forEach((item) => {
			// 	let { key, value, range, req, valueReq } = item
			// 	if (range.min || range.max) {
			// 		if (range.min) {
			// 			data.query.push({
			// 				column: key + 'Min',
			// 				type: 'eq',
			// 				value: range.min,
			// 			})
			// 		}
			// 		if (range.max) {
			// 			data.query.push({
			// 				column: key + 'Max',
			// 				type: 'eq',
			// 				value: range.max,
			// 			})
			// 		}
			// 		return
			// 	}
			// 	if (!value) return
			// 	if (typeof value !== 'object') {
      //     let filterGroups = this.searchOption1.addFilter.filterGroups
      //     if(filterGroups[key] && filterGroups[key].type === 'input'){
      //       return data.query.push({column: key,type: 'like',value: value.replace(/[\s+,+，+]+/g, ' '),})
      //     }
      //     // TODO
			// 		//搜索带两值，切换去掉valueReq
			// 		if (valueReq && item[valueReq] && item.key === 'recvCorpName' && item.value !== '') {
			// 			data.query.push({
			// 				column: valueReq,
			// 				type: 'eq',
			// 				value: item[valueReq],
			// 			})
			// 		}
			// 		return data.query.push({
			// 			column: key,
			// 			type: 'eq',
			// 			value: req || value,
			// 		})
			// 	}
			// 	if ( key === 'writeoffSubType' || key === 'orderType' || key === 'recvCorpCode' || key === 'unitType' || key === 'payBankCode' || key === 'payAccountNo') {
			// 		if (!value.length) return
			// 		data.query.push({
			// 			column: key,
			// 			type: 'eq',
			// 			value: value.join(','),
			// 		})
			// 	} else {
			// 		data.query.push({
			// 			column: key + 'Start',
			// 			type: 'eq',
			// 			value: dateFormat('yyyy-mm-dd', value[0]),
			// 		})
			// 		data.query.push({
			// 			column: key + 'End',
			// 			type: 'eq',
			// 			value: dateFormat('yyyy-mm-dd', value[1]),
			// 		})
			// 	}

			// })
      this.finCommonSearch(data.query, this.searchOption1, '', 'rangeMinMax')
      if (this.isVoucherRoute) {
        this.hasVoucher && data.query.push({
          column: 'voucherStatus',
          type: 'like',
          value: this.hasVoucher,
        })
      }
			if (isSearch) {
				this.searchBackup = data.query
			}
			data.query = this.searchBackup || data.query
			if (this.buttonSearch) {
				data.query.push({ column: 'recheckStatus', type: 'eq', value: this.buttonSearch })
			}
      let method = this.isVoucherRoute ? acctWriteoffPayPageList : queryWriteoffPayPageList
			return method(data).then(({ data }) => {
        this.finCommonColumns({data}, undefined, undefined, undefined, {
          configColumns: data.configColumns.filter((v) => {
            return !this.isVoucherRoute || !['voucherStatus', 'voucherNo'].includes(v)
          })
        })
				// if (data.configColumns && data.configColumns.length) {
				// 	let columns = data.configColumns
				// 	this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
				// 	this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
				// 	// this.configColumns = data.configColumns
        //   this.configColumns = data.configColumns.filter((v) => {
        //     return !this.isVoucherRoute || !['voucherStatus', 'voucherNo'].includes(v)
        //   })
				// }
        if (this.isVoucherRoute) {
          let columns = []
          if (data.configColumns && data.configColumns.length) {
            columns = data.configColumns.filter((v) => !['voucherStatus', 'voucherNo'].includes(v))
          } else {
            columns = this.selfColumnsBase.map((v) => v.prop).filter((v) => !['voucherStatus', 'voucherNo'].includes(v))
          }
          columns = ['voucherStatus', 'voucherNo', ...columns]
          if(this.columnsBackup !== columns.toString()){ 
            this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop)).filter((v) => v)
          }
          this.columnsBackup = columns.toString()
        }
        if (customerList) return
				let list = []
				data.list.forEach(item => {
					item.sourceApplyNo_multiValue = item.sourceApplyNo.split(',')
					// 发票号处理
					item.invoiceNoAppendIds = []
					item.invoiceNoAppend_multiValue = item.invoiceNoAppend.split(',').map(ele => {
						let arr = ele.split('/')
						item.invoiceNoAppendIds.push(arr[0])
						return arr[1]
					})
					item.voucherNo_multiValue = item.voucherNo.split(',').map(subItem => {
						let arr = subItem.split('/')
						return arr[1] ? arr[1] : arr[0]
					})
					item.acctVoucherSeqno_multiValue = item.voucherNo.split(',').map(subItem => {
						let arr = subItem.split('/')
						return arr[0]
					})
            		item.sourceType_multiValue = item.orderNo.split(',').map(subItem => {
						let arr = subItem.split('/')
						return arr[1] ? arr[1] : arr[0]
					})
					item.orderNo_multiValue = item.orderNo.split(',').map(subItem => {
						let arr = subItem.split('/')
						return arr[0]
					})
					list.push(item)
				})
				this.option1.data = list
				this.table1DataBackup = [
					... this.option1.data
				]
        this.$set(this.option1, 'emptyText', this.$t('OrderFee.noData')) // '未查询到任何数据'
        Object.assign(this.option1.pagination, data)
				// this.option1.pagination.currPage = data.currPage
				// this.option1.pagination.pageSize = data.pageSize
				// this.option1.pagination.totalCount = data.totalCount
			}).finally(() => {
				this.loading = false
			})
			// this.debounceLs(() => {
			// 	this.getListAmtSummary(data) 
			// },1300)
		},
		sendMulti (data, option) {
			if (option === this.option1) this.multipleSelection1 = data
			if (option === this.option2) this.multipleSelection2 = data
			let data2 = {
				"ascColumns": [],
				"descColumns": [],
				"query": []
			}
			let ids = this.multipleSelection1.map(item => {
				return item.writeoffReceipayNo
			}).join(',')
			if (ids) {
				data2.query.push({
					"column": "writeoffReceipayNoList",
					"type": "eq",
					"value": ids
				})
      } else {
				data2.query = this.searchBackup || []
			}
			if (data.length || this.option1.listAmtSummary.count++ > 0) {
        this.debounceLs(() => {
          this.getListAmtSummary(data2)
        })
      }
		},
		getListAmtSummary (data) {
      let method = this.isVoucherRoute ? acctWriteoffPayPageSummary : queryWriteoffPayPageSummary
			method(data).then(res => {
				if (res.code === 0 && res.data) {
					let data = {
						payAmtSummaryList: [],
						// notInvoiceAmtSummaryList: [] // 海外版不显示
					}
					// data = Object.assign(data, res.data)
					data.payAmtSummaryList = res.data.payAmtSummaryList
					let labelObj = {
						payAmtSummaryListLabel: this.$t('PayApplyList.applyAmt'), // '申请金额',
						// notInvoiceAmtSummaryListLabel: '未开票金额' // 海外版不显示
					}
					let colorObj = {
						payAmtSummaryListColor: 'red', // 支持red, green, black三种值
						notInvoiceAmtSummaryListColor: 'green',
					}
					this.option1.listAmtSummary = Object.assign(this.option1.listAmtSummary, {
						show: true,
						data,
						labelObj,
						colorObj
					})
				}
			})
		},
		search (data, index) {
			this.buttonSearch = data
			this.option1.pagination.currPage = 1
			this.getData(true)
			if (index || index === 0) {
				this.rightFilterBtns = [false, false, false]
				this.rightFilterBtns[index] = true
			}
		},
		//批量下载
		handleDownLoadInvoice(){ 
			if (this.multipleSelection1.length === 0) {
				return this.$msgErrClose(this.$t('OrderFee.selectRow')) // '请勾选需要下载水单的项！'
			}
			// for (let i = 0; i < this.multipleSelection1.length; i++) {
			//   if (this.multipleSelection1[i].status === 'pending') {
			//     return this.$msgErrClose('待审核状态不可批量下载！')
			//   }
			// }
			let data = {
				payOrderNoList : this.multipleSelection1.map((item, index) => {
					return item.payOrderNo 
				}),
			}
			let payOrderNoList = []
			for (let i = 0; i < this.multipleSelection1.length; i++) {
				if(!this.multipleSelection1[i].bankseqFileNo){
					return this.$msgErrClose(this.$t('PayApplyList.notContainNoBankSlip')) // '请勾选有水单的项，请重新选择！'
				}
				if(!this.multipleSelection1[i].bankseqFileNo){
					payOrderNoList.push(this.multipleSelection1[i].payOrderNo)
				}
			}
			this.$confirm(this.$t('PayApplyList.dowloadBankSlipTip'), this.$t('OrderFee.tip'), { // payOrderNoList.length ? '您有'+payOrderNoList.toString()+'付款单号未上传水单，不能被下载，是否确认下载已上传的水单！' : '您是否确定批量下载水单吗?' , "下载水单", {
				showCancelButton: true,
				confirmButtonText: this.$t('OrderFee.confirm'),
				cancelButtonText: this.$t('OrderFee.cancel'),
				type: "warning",
				beforeClose: (action, instance, done) => {
				if (action === 'confirm') {
					instance.confirmButtonLoading = true;
					instance.confirmButtonText = `${this.$t('OrderFee.processing')}...`;
					setTimeout(() => {
						this.$store
						.dispatch('finance/downloadBlobFilePost', {
							uri: '/fin/pay/order/downloadPayBankseqFile',
							data:{data},
						})
						.then((res) => {
							let link = document.createElement('a');
							link.href = window.URL.createObjectURL(res);
							link.download = `${this.$t('PayApplyList.bankSlip')}.zip`; // 水单
							link.click()
							done();
							instance.confirmButtonLoading = false;
						})
						.catch((err)=> {
							done();
							instance.confirmButtonLoading = false;
						})
					}, 500);
						
				} else {
					done();
				}
				}
			}).then((err)=> {
			}).catch(()=> {
			})

		},
		showDetail (row) {
			console.log(row.orderType);
			if (row.orderType === 'prepay_refund') {
				return
			}
			// let orderType = this.dictMapObj.payOrderType[row.orderType]
			// let str =
			// 	orderType == '结算付款' ? 'DetailSettle' : orderType == '预付抵账' ? 'PrepayWriteOffDetail' : 'DetailPrepay'
			this.$emit('update:isJumpRouteFromPage', true)
			this.$router.push({
				name: 'WritePayDetail',
				query: { writeoffReceipayNo: row.writeoffReceipayNo }
			})
			// let query = {
			//   writeoffReceipayNo:row.writeoffReceipayNo,
			//   writeoffReceipayId:row.writeoffReceipayId
			// }
			// this.$emit('update:isJumpRouteFromPage', true)
			// if(row.orderType == 'settle_pay'){
			//   return this.$router.push({  
			//     name: 'DetailSettle',
			//     query
			//   })
			//   // this.routerPush('DetailSettle', query)
			// }else if(row.orderType == 'prepay_to_repay'){
			//   return this.$router.push({  
			//     name: 'PrepayWriteOffDetail',
			//     query
			//   })
			//   // this.routerPush('PrepayWriteOffDetail', query)
			// }else{
			//   return this.$router.push({  
			//     name: 'DetailPrepay',
			//     query
			//   })
			//   // this.routerPush('DetailPrepay', query)
			// }
		},
		detail (row) {
			this.writeoffReceipayNo = row.writeoffReceipayNo
			this.writeoffReceipayId = row.writeoffReceipayId
			this.showBillDetail = true
		},
		closeInvoiceDetail (payload) {
			this.showBillDetail = payload
		},
		// 导出按钮
		handleExport(exportType) {
			const data = {
				ascColumns: this.ascColumns,
				descColumns: this.descColumns,
				currPage: this.option1.pagination.currPage,
				pageSize: this.option1.pagination.pageSize,
				columns:[],
				query: []
			}
			if (this.customColumnsKeys && this.customColumnsKeys.length) {
				data.columns = this.customColumnsKeys
			}
      		this.finCommonSearch(data.query, this.searchOption1, '', 'rangeMinMax')
			if (this.isVoucherRoute) {
				this.hasVoucher && data.query.push({
				column: 'voucherStatus',
				type: 'like',
				value: this.hasVoucher,
				})
			}
			if (this.multipleSelection1.length) {
				data.query = [
					{ column: 'writeoffReceipayNo', type: 'in', value: this.multipleSelection1.map((v) => v.writeoffReceipayNo).join(',') },
				]
			}
			// 查询对象的配置编码
			data.query.push({
				column: 'queryDataModuleCode',
				value: exportType.value
			})
			if( exportType.value !== 'writeoffPayListExport'){
				data.columns = []
			}
			this.$confirm(`${this.$t('PayApplyList.exportPayWriteoffTip')}${exportType.label}?`, this.$t('OrderFee.tip'), { // '是否确认导出'+exportType.label+'付款核销单?', '导出付款核销单'
				confirmButtonText: this.$t('OrderFee.confirm'),
				cancelButtonText: this.$t('OrderFee.cancel'),
				lockScroll: 'true',
				type: 'warning'
			})
				.then(() => {
				this.loading = true
				this.$store
					.dispatch('finance/downloadBlobFilePost', {
					uri: '/fin/common/queryDataExportExcel',
					data: { data }
					})
					.then(res => {
						this.loading = false
						console.log(res)
						const link = document.createElement('a')
						link.href = window.URL.createObjectURL(res)
						link.download = this.$t('PayApplyList.payWriteOffOrder')+exportType.label+'.xlsx' // '付款核销单'
						link.click()
					})
					.catch(() => {
						this.loading = false
						this.$message({ message: this.$t('OrderFee.exportFailed'), type: 'error' }) // '导出失败'
					})
				})
				.catch(() => {})
		},
		bankAccountListAll(accountShortName, item) {
			let data = { currPage: 1, pageSize: 30, accountShortName, currency: '', status: 'effect',unitType:'company' }
			bankAccountListAll(data).then((res) => {
				let data = res.data.map(item=> ({label: `${item.accountShortName}(${item.accountNo})`,value:item.accountNo}))
				this.remoteSelectCommon(item, data)
			})
		},
		// 获取销售
		getSellers(name = '', item, role) {
			let query = [{ column: 'roleCode', type: 'eq', value: role }] // column: 'roleCode', type: 'in', value: 'bd,obd'
			name && query.push({ column: 'name', type: 'eq', value: name })
			listByRole({ currPage: 1, pageSize: 1000, query }).then(({ data: { list } }) => {
				if (
				this.remoteSelectCommon(
					item,
					list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId }))
				)
				)
				return
				item.remoteSelectList = list.map((v) => ({ ...v, label: `${v.cname}(${v.employeeNo})`, value: v.employeeId }))
			})
		},
	},
	activated () {
		if (!this.$route.meta.isUseCache) {
      this.getData()
    }
	},
	watch: {
    'previewDialog.show'(val){
      !val && this.previewDialog._refresh && this.getData()
      this.previewDialog._refresh = false
    },
    hasVoucher(){
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
		//监听点击过来获取数据
		// isJumpRouteFromPage: {
		// 	handler (val) {
		// 		if (!val) {
		// 			this.$nextTick(() => {
		// 				this.getData()
		// 			})
		// 		}
		// 	},
		// 	immediate: true
		// }
	},
  computed:{
    storeSettleCode(){
      return this.$store.state.user?.userInfo?.settleCompanyCode
    }
  },
	components: {
		FinanceTableMass,
		FinanceSearch,
		Refund,
		PerpayDetail,
		PrepayWriteOffDetail,
		PreviewDialog,
		SettleDetail,
		CustomColumns
	}
}
</script>
<style lang="scss" scoped>
// .select-template-box{
//   float: left;
//   // display: inline-block;
// }
// .select-template-box .el-dropdown{
//   margin-left: 0;
//   margin-bottom: 0;
//   border-radius: 0;
//   font-size: 12px;
//   /* line-height: 26px; */
//   border: 1px solid #D9D9D9;
// //   border-right: none;
//   border-radius: 4px;
// }
// .select-template-box:hover .el-dropdown{
//   background: rgb(236, 245, 255);
//   color: rgb(64, 158, 255);
// }
// .select-template-box .el-dropdown-link {
//   cursor: pointer;
//   padding-left: 5px;
//   line-height: 18px;
//   display: inline-block;
// }
// .select-template-box .el-icon--right{
//   margin-left: 0;
// }
// .select-template-box .el-dropdown-link:focus{
//   outline: none;
// }
.batch-print-create .el-dialog__body {
	padding: 40px 80px 22px;
}
.batch-print-create .el-dialog__footer {
	padding-bottom: 32px;
	text-align: center;
}
.batch-print-create .el-form .el-input {
	width: 320px;
}
.manual-regist-invoice .el-form .el-date-editor.el-input {
	width: 162px;
}
.manual-regist-invoice .el-form .el-select {
	width: 162px;
}
</style>
