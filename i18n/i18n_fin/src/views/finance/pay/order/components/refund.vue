<template>
	<div class="finance-page">
		<div class="finance-list-container" >
			<div class="money-box money-box-border-bottom">
				<div class="money-box-left">
					<div class="money-title">{{$t('PayApplyList.prepayRefund')}}</div>
				</div>
				<div class="money-box-right">
					<el-button v-if="checkAuth($route.name, 'btn-refundSubmit')" :loading='loadingSubmit' @click="submit" size="mini" type="primary">{{$t('OrderFee.confirm')}}</el-button><!-- 确认 -->
					<el-button
            v-if="isPayWrongRefund"
            :loading="loadingSubmit"
            @click="getRelate"
            size="mini"
            type="primary"
          >{{$t('PayApplyList.relateReg')}}</el-button>
					<el-button @click="cancel" size="mini">{{$t('Common.back')}}</el-button>
				</div>
			</div>
			<div class="order-refund">
				<div class="settlement-detail-form gedging-detail-form">
					<el-form
						:model="refund"
						ref="refund"
						:inline="true"
						size="mini"
						label-width="174px"
					>
						<el-form-item
							:label="$t('PayApplyList.refundTo')"
							prop="refundType"
							:rules="{
								required: true,
								message: ' ',
								trigger: 'change',
							}"
						>
							<el-select
								style="width: 100%"
								v-model="refund.refundType"
								:placeholder="$t('OrderFee.plsSelect')"
								@change="refundTypeChange"
							><!-- 我司付款账号 -->
								<el-option
									v-for="item in dictMap['payRefundType']"
									:key="item.value"
									:label="item.label"
									:value="item.value"
								></el-option>
							</el-select>
						</el-form-item>
						<el-form-item :label="$t('PayApplyList.refundAmt')"  prop="applyPayAmt">
							<el-input
								v-model="refund.applyPayAmt"
								size="mini"
								:placeholder="$t('OrderFee.plsInput')"
								v-lsNumber="{
									value: 'number',
									obj: refund,
									key: 'applyPayAmt',
								}"
								:maxlength="16"
							></el-input>
						</el-form-item>
						<el-form-item
							:label="$t('PayApplyList.refundDate')"
							prop="refundDate"
							:rules="{
								required: true,
								message: ' ',
								trigger: 'blur',
							}"
						>
							<el-date-picker
								v-model="refund.refundDate"
								value-format="yyyy-MM-dd"
								:placeholder="$t('Common.plSelect')"
								size="mini"
								:disabled="isPayWrongRefund"
							></el-date-picker>
						</el-form-item>
						<el-form-item
							:label="$t('Collect.bankFlowNumber')"
							prop="bankSeqNo"
							:rules="{
								required: !isPayWrongRefund,
								message: ' ',
								trigger: 'blur',
							}"
						><!-- required: true -->
							<el-input
								v-model="refund.bankSeqNo"
								:maxlength="32"
								:placeholder="$t('OrderFee.plsInput')"
								size="mini"
								:disabled="isPayWrongRefund"
							></el-input>
						</el-form-item>
						<el-form-item
							:label="$t('Payment.bankslipFile')"
							prop="bankSeqFileNo"
							class="invoice-payment-add-form-upload"
							style="position: relative"
						>
							<template v-if="!refund.bankseqFileNo">
								<!-- <el-input v-model="refund.bankSeqNo" style="position:absolute;right:0;top:0;width:100%;height:100%;"></el-input> -->
								<el-upload
									class="finance-table-upload"
									action="str"
									:limit="1"
									:on-exceed="handleExceed"
									:on-change="fileChange"
									:http-request="uploadHttpRequest"
									:on-success="uploadSuccess"
								>
									<el-button type="text">{{$t('Hedge.clickUpload')}}</el-button>
								</el-upload>
							</template>
							<template v-else>
								<el-button size="mini" type="text" @click="handleBankseqFileNo"
									>{{$t('Settle.clickView')}}</el-button
								>
								<el-button size="mini" type="text" @click="handleDeleteFileNo"
									>{{$t('Common.del')}}</el-button
								>
							</template>
						</el-form-item>
						<el-form-item :label="$t('PayApplyList.payAccountShortName')" prop="payAccountShortName" :rules="{	required: true,	message: ' ',	trigger: 'change',}" ><!-- 我司银行简称 -->
							<el-autocomplete
								:disabled="isPayWrongRefund"
								style="width:100%"
								clearable
								v-model="refund.payAccountShortName"
								:placeholder="$t('OrderFee.plsSelect')"
								:select-when-unmatched="true"
								:fetch-suggestions="(queryString, cb) => {autocomplete2.querySearch && autocomplete2.querySearch(queryString, cb)}"
								@select="(value) => {autocomplete2.select && autocomplete2.select(value)}"
								@change="(value) => {autocomplete2.change && autocomplete2.change(value)}"
								>
							</el-autocomplete>
						</el-form-item>
						<el-form-item :label="$t('PayApplyList.payBankName')" prop="payBankName" ><!-- 银行名称 -->
							<el-input disabled v-model="refund.payBankName" :placeholder="$t('OrderFee.plsInput')"></el-input>
						</el-form-item>
						<el-form-item :label="$t('PayApplyList.payAccountNo')" prop="payAccountNo"><!-- 银行账号 -->
							<el-input disabled v-model="refund.payAccountNo" :placeholder="$t('OrderFee.plsInput')"></el-input>
						</el-form-item>
						<el-form-item :label="$t('PayApplyList.recvAccountNo')" prop="recvAccountNo" :rules="{	required: true,	message: ' ',	trigger: 'change',}" ><!-- 收款银行账号 -->
							<el-autocomplete
								style="width:100%"
								clearable
								v-model="refund.recvAccountNo"
								:placeholder="$t('OrderFee.plsSelect')"
								:select-when-unmatched="true"
								:fetch-suggestions="(queryString, cb) => {autocomplete1.querySearch && autocomplete1.querySearch(queryString, cb)}"
								@select="(value) => {autocomplete1.select && autocomplete1.select(value)}"
								@change="(value) => {autocomplete1.change && autocomplete1.change(value)}">
							</el-autocomplete>
						</el-form-item>
						<el-form-item :label="$t('PayApplyList.recvBankName')" ><!-- 收款银行 -->
							<el-input disabled v-model="refund.recvBankName"></el-input>
						</el-form-item>
						<el-form-item :label="$t('PayApplyList.recvAccountName')"><!-- 收款账户名 -->
							<el-input disabled v-model="refund.recvAccountName"></el-input>
						</el-form-item>
						
						<br />
						<div class="order-refund-detail-form-remark">
							<el-form-item :label="$t('PayApplyList.refundRemark')" prop="remark" label-width="174px"  class="el-form-item-invoice-remark" style="width:100%;">
								<el-input
									type="textarea"
									v-model="refund.remark"
									:placeholder="$t('OrderFee.plsInput')"
									maxlength="500"
									show-word-limit
								></el-input><!-- 请输入说明原因，不超过500个字 -->
							</el-form-item>
						</div>
					</el-form>
				</div>

				<div class="finance-table-container">
					<div class="money-box" style="background-color: #F8F9FD;">
						<div class="money-box-left">
							<div class="money-title">{{$t('PayApplyList.handlingFee')}}</div><!-- 手续费 -->
						</div>
						<div class="money-box-right">
							<el-button v-if="!isPayWrongRefund" class="finance-btn" @click="add2(null)" size="mini"
								>{{$t('PayApplyList.addHandlingFee')}}</el-button
							>
							<el-button
								type="text"
								class="collapse-btn"
								@click="handleCollapse('Table1')"
								size="mini"
							>
								{{$t('Common.collapse')}}
								<i
									:class="{
										'el-icon-arrow-up': showTable1,
										'el-icon-arrow-down': !showTable1,
									}"
								></i>
							</el-button>
						</div>
					</div>
					<FinanceTable v-if="!showTable1" :option="option1" class="finance-table-container-finance-table"/>
				</div>
				<div class="finance-table-container" v-if="regInfo">
          <div class="money-box" style="background-color: #F8F9FD;">
            <div class="money-box-left">
              <div class="money-title">{{$t('PayApplyList.collRegInfo')}}</div>
            </div>
            <div class="money-box-right">
              <el-button
                type="text"
                class="collapse-btn"
                @click="handleCollapse('Table3')"
                size="mini"
              >
                {{$t('OrderFee.collapse')}}
                <i :class="{'el-icon-arrow-up': showTable3,	'el-icon-arrow-down': !showTable3,}"></i>
              </el-button>
            </div>
          </div>
          <div class="settlement-detail-form" v-if="!showTable3">
            <DetailDiv :label="$t('PayApplyList.receivableRegNo')" :content="regInfo.receivableRegNo" :width="'300'" :labelWidth="'187'" />
            <DetailDiv :label="$t('PayApplyList.recvAccountShortName')" :content="regInfo.accountShortName" :isTooltip="true" :width="'300'" :labelWidth="'187'" />
            <DetailDiv :label="$t('PayApplyList.recvAccountName')" :content="regInfo.recvCompName" :isTooltip="true" :width="'300'" :labelWidth="'187'" /><!-- 收款账户名 -->
            <DetailDiv :label="$t('PayApplyList.recvAccountNo')" :content="regInfo.accountNo" :width="'300'" :labelWidth="'187'" />
            <DetailDiv :label="$t('PayApplyList.realRecvAmt')" :content="regInfo.realAmt" :width="'300'" :labelWidth="'187'" />
            <DetailDiv :label="$t('PayApplyList.recvDate')" :content="regInfo.recvDate" :width="'300'" :labelWidth="'187'" /><!-- 收入日期 -->
            <DetailDiv :label="$t('PayApplyList.bankSeqNo')" :content="regInfo.bankSeqNo" :width="'300'" :labelWidth="'187'" />
            <DetailDiv :label="$t('PayApplyList.bankRemark')" :content="regInfo.remark" :isTooltip="true" :isFull="true" :width="'300'" :labelWidth="'187'" />
          </div>
        </div>
				<div class="finance-table-container">
					<div class="money-box" style="background-color: #F8F9FD;">
						<div class="money-box-left">
							<div class="money-title">{{$t('PayApplyList.payInfo')}}</div>
						</div>
						<div class="money-box-right">
							<el-button
								type="text"
								class="collapse-btn"
								@click="handleCollapse('Table2')"
								size="mini"
							>
								{{$t('Common.collapse')}}
								<i :class="{'el-icon-arrow-up': showTable2,	'el-icon-arrow-down': !showTable2,}"
								></i>
							</el-button>
						</div>
					</div>
					<div class="settlement-detail-form"  v-if="!showTable2">
						<DetailDiv	:label="$t('PayApplyList.payOrderNo')" :content="payInfo.payOrderNo"/>
						<DetailDiv	:label="$t('PayApplyList.payOrderType')" :content="dictMapObj.payOrderType[payInfo.orderType]"/>
						<DetailDiv	:label="$t('PayApplyList.applyNo')" :content="payInfo.sourceApplyNo"/>
						<DetailDiv	:label="$t('PayApplyList.acceptanceStatus')" :content="payInfo.confirmStatus === 'pass'? $t('PayApplyList.accepted') : $t('PayApplyList.waitAccepted')"/>
						<DetailDiv	:label="$t('PayApplyList.payWay')" :content="dictMapObj.payWay[payInfo.payWay]"/>
						<DetailDiv	:label="$t('PayApplyList.payCurrency')" :content="payInfo.currency"/>
						<DetailDiv	:label="$t('PayApplyList.payAmt')" :content="payInfo.applyAmt"/>
						<DetailDiv	:label="$t('PayApplyList.payStatus')" :content="dictMapObj.payStatusType[payInfo.payStatus]"/><!-- 付款单状态 -->
						<DetailDiv	:label="$t('PayApplyList.payer')" :content="payInfo.confirmName"/>
						<DetailDiv	:label="$t('PayApplyList.payTime')" :content="payInfo.confirmTime"/>
						<DetailDiv	:label="$t('PayApplyList.recvAccountName')" :content="payInfo.recvAccountName" :isTooltip="true"/>
						<DetailDiv	:label="$t('PayApplyList.recvAccountNo')" :content="payInfo.recvAccountNo"/>
						<DetailDiv	:label="$t('PayApplyList.payAccountShortName')" :content="payInfo.payAccountShortName" :isTooltip="true"/>
						<DetailDiv	:label="$t('PayApplyList.payAccountName')" :content="payInfo.payAccountName" :isTooltip="true"/><!-- 付款账户名 -->
						<DetailDiv	:label="$t('PayApplyList.payAccountNo')" :content="payInfo.payAccountNo"/>
						<DetailDiv	:label="$t('Settle.branchCompany')" :content="payInfo.payCompName" :isTooltip="true" />
						<DetailDiv	:label="$t('PayApplyList.createdName2')" :content="payInfo.createdName"/>
						<DetailDiv	:label="$t('PayApplyList.createdTime2')" :content="payInfo.createdTime"/><!-- 创建时间 -->
						<DetailDiv	:label="$t('FeeList.settleCorp')" :content="payInfo.recvCorpName" :isTooltip="true"/>
						<DetailDiv	:label="$t('PayApplyList.recvBankName')" :content="payInfo.recvBankName" :isTooltip="true"/>
					</div>
				</div>
			</div>
		</div>
		<el-dialog :title="$t('PayApplyList.relateReg')" :visible.sync="relateRegDialog" width="1130px">
      <div>
        <FinanceSearch :noLabelWidth="true" :searchOption="searchOption" @search="search" />
        <FinanceTableMass :option="option2" @send-multi="sendMulti" v-loading="btnLoading" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="sureRelateReg" size="mini" type="primary">{{$t('PayApplyList.relevant')}}</el-button>
        <el-button @click="relateRegDialog = false" size="mini">{{$t('OrderFee.cancel')}}</el-button>
      </span>
    </el-dialog>
	</div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mapState } from 'vuex'
import { payOrderPrepayRefund, queryPayOrderInfo, listReceivableRegForPrePayRefund, listTransferFee } from '@/api/fin/pay'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
export default {
	name: 'payOrderRefund',
	mixins: [mixin, routerMixin],
	data () {
		return {
			searchOption: {},
			refund: {
				bankseqFileNo: "",
				bankSeqNo: '',
				remark: '',
				refundType: 'pay_wrong_refund',
				applyPayAmt: "",
				refundDate: "",
				
				payBankAccountId:"",
				payAccountShortName:"",
				payBankName:"",
				payBankCode:"",
				payBankBranch:"",
				payAccountNo:"",
				payAccountName:"",
				
				recvBankAccountId:"",
				recvBankCode:"",
				recvBankName:"",
				recvAccountNo:"",
				recvAccountName:"",
				recvBankBranch:"",
			},
			showTable1: false,
			showTable2: false,
			showTable3: false,
			option1: {},
			option2: {},
			showUploadBtn: true,
			file: null,
			uploadParams: {},
			payInfo:{},
			loadingSubmit:false,
			relateRegDialog: false,
      multipleSelection2: [],
      bankSeqNoRule: { required: true, message: ' ', trigger: 'blur' },
      regInfo: null,
		}
	},
	created () {
		this.searchOption = {
      columns: [{ type: 'input', label: this.$t('PayApplyList.receivableRegNo'), prop: 'receivableRegNo', placeholder: this.$t('OrderFee.plsInput') }], // '收款登记号'
      data: { receivableRegNo: '' },
    }
		//供应商收款账号
		let alias = this
		this.autocomplete1 = {
			querySearch: (queryString, cb) => {
				alias.selectedOptionItem = ''
				if(!this.refund.recvCorpCode){
				this.$message({
					message: this.$t('PayApplyList.noSettleCorp'), // '无结算单位',
					type: 'error',
					showClose: true
				})
				return
				}
				alias.bankAccountList({"accountNo":queryString , "unitCode":this.refund.recvCorpCode,"status":"effect"}, cb)
			},
			select: (optionItem, row) => {
				alias.selectedOptionItem = optionItem
				alias.refund.recvAccountName = optionItem.value
				alias.refund.recvAccountNo = optionItem.key
				this.refund.currency = optionItem.currency

				this.refund.recvAccountNo = optionItem.accountNo
				this.refund.recvAccountName = optionItem.accountName
				this.refund.recvBankCode = optionItem.bankCode
				this.refund.recvBankName = optionItem.bankName
				this.refund.recvBankBranch = optionItem.bankBranch
				this.refund.recvBankAccountId = optionItem.settleUnitBankAcctId
			},
			change: (val, row) => {
			// 延时150ms获取select中的改变
			setTimeout(() => {
				this.refund.currency = ''
				this.refund.recvAccountNo = ''
				this.refund.recvAccountName = ''
				this.refund.recvBankCode = ''
				this.refund.recvBankName = ''
				this.refund.recvBankBranch = ''
				this.refund.recvBankAccountId = ''
				if (alias.selectedOptionItem === '') {
					alias.selectedOptionItem = ''
					alias.refund.recvAccountName = ''
					alias.refund.recvAccountNo = ''
					return
				}
			}, 150)
			}
		}
		//我司付款账号
		let alias2 = this
		this.autocomplete2 = {
			querySearch: (queryString, cb) => {
			alias2.selectedOptionItem = ''
			alias2.companyBankAccountList({'accountNo':queryString,'currency':this.refund.currency, 'receipayType':'pay', "countryOrgType":this.refund.payWay, "unitCode":this.refund.unitCode }, cb)
			},
			select: (optionItem, row) => {
				console.log(optionItem);
				alias2.selectedOptionItem = optionItem
				alias2.refund.payAccountNo = optionItem.value
				alias2.refund.payAccountCode = optionItem.key

				this.refund.payAccountShortName = optionItem.accountShortName
				this.refund.settleCompName = optionItem.unitName
				this.refund.settleCompCode = optionItem.unitCode
				this.refund.payAccountNo = optionItem.accountNo
				this.refund.payAccountName = optionItem.accountName
				this.refund.payBankCode = optionItem.bankCode
				this.refund.payBankName = optionItem.bankName
				this.refund.payBankBranch = optionItem.bankBranch
				this.refund.payBankAccountId = optionItem.settleUnitBankAcctId
			},
			change: (val, row) => {
				// 延时150ms获取select中的改变
				setTimeout(() => {
						alias2.selectedOptionItem = ''
						alias2.refund.payAccountCode = ''
						alias2.refund.payAccountNo = ''
						this.refund.payAccountShortName = ''
						this.refund.payAccountNo = ''
						this.refund.payAccountName = ''
						this.refund.payBankCode = ''
						this.refund.payBankName = ''
						this.refund.payBankBranch = ''
						this.refund.payBankAccountId = ''
						return
				}, 150)
			}
		}
		let operationBtns = Object.assign(this.option.operationBtns, {
			data: [
				{
					label: this.$t('Common.del'),
					type: 'text',
					show: true,
					action: 'Delete',
				},
			],
		})
		this.option1 = Object.assign({}, this.option, {
			id: 'option1', $name: 'OrderRefund',
			edit: true,
			data: [],
			tips: {
				text: '',
				show: false,
			},
			selection: {
				show: false,
			},
			operationBtns,
		})
		let columns1 = ['cutType', 'currency', 'amt']
		this.option1.columns = columns1.map((val) => this.columnsBase.find((item) => item.prop === val))
		this.option2 = Object.assign({}, this.option, {
      id: 'optionOrderRefund2',
      $name: 'OrderRefund2',
      edit: true,
      data: [],
      tips: { text: '', show: false },
      styleCfg: { padding: '0' },
      // selection: {
      //   show: false,
      // },
      operationBtns: { show: false },
    })
    this.option2.columns = [
      { label: this.$t('PayApplyList.receivableRegNo'), prop: 'receivableRegNo', type: 'text', width: 130 }, // '收款登记号'
      { label: this.$t('PayApplyList.recvAccountShortName'), prop: 'accountShortName', type: 'text', width: 150 }, // '收款账户简称'
      { label: this.$t('PayApplyList.recvAccountName'), prop: 'recvCompName', type: 'text', width: 150 }, // '收款账户名'
      { label: this.$t('PayApplyList.recvAccountNo'), prop: 'accountNo', type: 'text', width: 118 }, // '收款账号'
      { label: this.$t('PayApplyList.realRecvAmt'), prop: 'realAmt', type: 'text', width: 100 }, // '实收金额'
      { label: this.$t('PayApplyList.recvDate'), prop: 'recvDate', type: 'text', width: 100 }, // '收入日期'
      { label: this.$t('PayApplyList.bankRemark'), prop: 'remark', type: 'text' }, // '银行备注'
      { label: this.$t('PayApplyList.bankSeqNo'), prop: 'bankSeqNo', type: 'text', width: 130 }, // '银行流水号'
    ]
	},
	methods: {
		add2 () {
			this.option1.data.push({ cutType: 'exter_cut', currency: '', amt: '', edit: true })
		},
		handleDelete ($index, row, option) {
			this.$confirm(this.$t('PayApplyList.sureDelete'), this.$t('Common.tips'), { // '是否确认删除？'
				confirmButtonText: this.$t('Common.sure'),
				cancelButtonText: this.$t('Common.cancel'),
				type: 'warning',
			})
				.then(() => {
					this.option1.data.splice($index, 1)
				})
				.catch(() => { })
		},
		submit () {
			this.$refs.refund.validate((res, rej) => {
				if (res) {
					let data = {
						payOrderNo: this.payOrderNo,
						bankseqFileNo: this.refund.bankseqFileNo,
						bankSeqNo: this.refund.bankSeqNo,
						refundType: this.refund.refundType,
						currency: this.refund.currency,
						refundAmt: this.refund.applyPayAmt,
						refundDate: this.refund.refundDate,

						payBankAccountId:this.refund.recvBankAccountId,
						// payAccountShortName:this.refund.payAccountShortName,
						payBankName:this.refund.recvBankName,
						payBankCode:this.refund.recvBankCode,
						payBankBranch:this.refund.recvBankBranch,
						payAccountNo:this.refund.recvAccountNo,
						payAccountName:this.refund.recvAccountName,
						
						recvBankAccountId:this.refund.payBankAccountId,
						recvBankCode:this.refund.payBankCode,
						recvBankName:this.refund.payBankName,
						recvAccountNo:this.refund.payAccountNo,
						recvAccountName:this.refund.payAccountName,
						recvBankBranch:this.refund.payBankBranch,

						remark: this.refund.remark,
						transferFeeList: this.option1.data ? this.option1.data : [],
					}
					if (this.receivableRegId) {
            data.receivableRegId = this.receivableRegId
          }
					this.loadingSubmit = true
					payOrderPrepayRefund(data).then((res) => {
						this.$msgSucClose(this.$t('OrderFee.successOp')) // '提交成功!'
						
						this.option1.data = []
						this.cancel(true)
					}).finally(()=>{
						this.loadingSubmit = false
					})
				}
			})
		},
		handleCollapse (showTable) {
			if(showTable === "Table1"){
				return	this.showTable1 = !this.showTable1
			}
			if(showTable === "Table2"){
				return this.showTable2 = !this.showTable2
			}
			if (showTable === 'Table3') {
        return (this.showTable3 = !this.showTable3)
      }
		},
		cancel (refresh) {
			this.routerBack(refresh)
		},
		handleExceed (files, fileList) {
			this.$message.warning(this.$t('Hedge.onlyTips'))
		},
		uploadHttpRequest () {
			const form = new FormData()
			form.append('file', this.file)
			// form.append('receivableRegId', this.receivableRegId)
			this.$store
				.dispatch('user/import', {
					uri: '/base/webapi/file/upload',
					params: form,
				})
				.then((res) => {
					this.$msgSucClose(this.$t('BillList.uploadSuccess'))
					this.refund.bankseqFileNo = res.data.data.fileNo
					this.fileList = []
					this.$forceUpdate()
				})
		},
		fileChange (file) {
			this.file = file.raw
		},
		uploadSuccess (response, file, fileList) {
			console.log(response)
			let fileId = response.data && response.data.fileId
			fileId = fileId ? fileId : 'test'
			this.refund.fileId = fileId
			this.refund.bankseqFileNo = fileId
			this.showUploadBtn = false
		},
		//查看水单文件
		handleBankseqFileNo () {
			let href = `/base/fileView/preview/${this.refund.bankseqFileNo}/sowoll`
			window.open(href)
		},
		handleDeleteFileNo () {
			this.$confirm(this.$t('PayApplyList.sureDelete'), this.$t('OrderFee.tip'), { // '是否确认删除水单文件？', '水单'
				confirmButtonText: this.$t('Common.sure'),
				cancelButtonText: this.$t('Common.cancel'),
				type: 'warning',
			})
				.then(() => {
					this.refund.bankseqFileNo = ''
					this.$forceUpdate()
				})
				.catch(console.log)
		},
		companyBankAccountList(queryString, cb) {
			this.$store.dispatch('dict/companyBankAccountList', queryString).then((data) => {
				cb(data)
			})
		},
		bankAccountList(queryString, cb) {
			this.$store.dispatch('dict/bankAccountList', queryString).then((data) => {
				console.log(data);
				cb(data)
			})
		},
		refundTypeChange(val) {
      if (val === 'pay_wrong_refund') {
        this.refund.applyPayAmt =
          this.refund.payAccountNo =
          this.refund.refundDate =
          this.refund.bankSeqNo =
          this.refund.payAccountShortName =
          this.refund.payBankName =
            ''
      } else {
        this.receivableRegId = ''
      }
      this.regInfo = null
      this.option1.data = []
      this.option1.operationBtns.show = !this.isPayWrongRefund
    },
    getRelate() {
      this.searchOption.data.receivableRegNo = ''
      this.lsLoading = true
      listReceivableRegForPrePayRefund({ payOrderNo: this.payOrderNo })
        .then((res) => {
          if (!res.data.length) {
            return this.$msgErrClose(this.$t('PayApplyList.noAssociatedReg')) // 没有可以关联的收款登记！
          }
          this.option2.data = res.data
          this.relateRegDialog = true
        })
        .finally(() => (this.lsLoading = false))
    },
    sureRelateReg() {
      if (this.multipleSelection2.length !== 1) {
        return this.$msgErrClose(this.$t('OrderFee.selectOneRow')) // 请勾选1个需要关联的项！
      }
      let row = this.multipleSelection2[0]
      // this.refund.applyPayAmt = row.realAmt
      this.refund.refundDate = row.recvDate
      this.refund.bankSeqNo = row.bankSeqNo
      this.refund.payAccountShortName = row.accountShortName
      this.refund.payBankName = row.bankName
      this.refund.payAccountNo = row.accountNo
      this.relateRegDialog = false
      this.receivableRegId = row.receivableRegId
      this.regInfo = { ...row }
      listTransferFee({ receivableRegId: row.receivableRegId }).then((res) => {
        this.option1.data = res.data || []
			})
			if (this.refund.refundType === 'pay_wrong_refund') { // 退到我司银行账户，手续费不可修改
				this.option1.operationBtns.show = false
			}
    },
    sendMulti(data) {
      this.multipleSelection2 = data
    },
    search(data) {
      this.btnLoading = true
      listReceivableRegForPrePayRefund({ payOrderNo: this.payOrderNo, receivableRegNo: data.receivableRegNo })
        .then((res) => {
          this.option2.data = res.data
        })
        .finally(() => (this.btnLoading = false))
    },
	},
	components: {
		FinanceTable,
		FinanceTableMass,
		FinanceSearch
	},
	watch: {
    'refund.refundType': {
      handler(val) {
				this.bankSeqNoRule.required = !this.isPayWrongRefund
      },
      immediate: true,
    },
  },
	computed: {
		isPayWrongRefund() {
      return this.refund.refundType === 'pay_wrong_refund'
    },
		...mapState({
			columnsBase: (state) => state.finance.columns.columnsBase2,
		}),
	},
	activated () {
		if (!this.$route.meta.isUseCache) {
			this.payOrderNo = this.$route.query.payOrderNo
			// Object.assign(this.refund, JSON.parse(this.$route.query.refund))
			// this.$nextTick(() => {
			//   this.$refs.refund.clearValidate()
			//   this.getData()
			// })
			// console.log(this.refund)
			Object.assign(this.refund, {}, {
				applyPayAmt: null,
				bankSeqNo: '',
				refundDate: "",
				remark: '',
				bankseqFileNo: '',
				refundType: 'pay_wrong_refund',
			})
			this.$msgWarnClose(this.$t('PayApplyList.refundToSelfPlsAssocReg')) // `'退至我司银行账户'，请关联收款登记！`
      this.regInfo = null
      this.receivableRegId = ''
			this.option1.data =[]
			queryPayOrderInfo({ payOrderNo: this.payOrderNo })
				.then((res) => {
					if (!res.data) {
						this.$msgErrClose(this.$t('OrderFee.noData')) // '没有对应的数据！'
						return this.cancel()
					}
					this.refund.payCompName = res.data.payOrder.payCompName
					this.refund.payAccountNo = res.data.payOrder.payInfo.payAccountNo
					this.refund.currency = res.data.payOrder.currency
					this.refund.applyPayAmt = res.data.payOrder.refundableMaxAmt

					this.refund.payBankAccountId = res.data.payOrder.payInfo.payBankAccountId,
					this.refund.payAccountShortName = res.data.payOrder.payInfo.payAccountShortName,
					this.refund.payBankName = res.data.payOrder.payInfo.payBankName,
					this.refund.payBankCode = res.data.payOrder.payInfo.payBankCode,
					this.refund.payBankBranch = res.data.payOrder.payInfo.payBankBranch,
					this.refund.payAccountNo = res.data.payOrder.payInfo.payAccountNo,
					this.refund.payAccountName = res.data.payOrder.payInfo.payAccountName,

					this.refund.recvBankAccountId = res.data.payOrder.payInfo.recvBankAccountId,
					this.refund.recvBankCode = res.data.payOrder.payInfo.recvBankCode,
					this.refund.recvBankName = res.data.payOrder.payInfo.recvBankName,
					this.refund.recvAccountNo = res.data.payOrder.payInfo.recvAccountNo,
					this.refund.recvAccountName = res.data.payOrder.payInfo.recvAccountName,
					this.refund.recvBankBranch = res.data.payOrder.payInfo.recvBankBranch,

					this.refund.recvCorpCode = res.data.payOrder.payInfo.recvCorpCode

					this.payInfo = res.data.payOrder
					let { createdName, createdTime } =  res.data.payOrder
					Object.assign(this.payInfo, {}, res.data.payOrder.payInfo, { createdName, createdTime })
					// this.refund.refundDate = res.data.refundDate 
					// this.refund.refundType = res.data.refundType
					// this.refund.bankSeqNo = res.data.bankSeqNo
					this.refund.bankseqFileNo = ""
					// this.option1.data = res.data.payOrder.transferFeeList
					this.$nextTick(() => {
						this.$refs.refund.clearValidate()
					})
				})
				.catch((err) => {
					this.delVisitedView()
					this.cancel()
				})
		}
	},
}
</script>

<style scoped lang="scss">
.finance-approve-btns-box {
	display: flex;
	justify-content: space-between;
	height: 40px;
	padding: 0 24px;
	border-radius: 4px 4px 0px 0px;
	border-bottom: 1px solid #e9e9e9;
}
.finance-approve-btns-left {
	font-size: 16px;
	font-weight: 600;
	color: #222222;
	line-height: 24px;
	margin-top: 8px;
}
.finance-approve-btns-right {
	margin-top: 6px;
}
.settlement-detail-form {
	.el-form-item {
		width: 338px;
	}
}
</style>
<style>
.order-detail .tips-container {
	display: none !important;
}
/* .order-detail .finance-approve-detail-main .el-form-item {
	width: calc(25% - 20px);
	margin-bottom: 20px !important;
} */

/* .el-form-item{
  width: 250px;
} */

.finance-table-upload .el-upload-list {
	position: absolute;
}
</style>
<style scoped lang="scss">
.order-refund {
	// padding: 10px;
	.modifyfee-h2 {
		font-size: 18px;
		font-weight: 600;
		color: #222222;
		line-height: 25px;
		margin-top: 14px;
	}
	.detail-info-item {
		width: 270px;
	}
	// /deep/ .el-form-item__content{
	// 	width: 162px;
	// }
	.finance-table-container-finance-table{
		margin-top:6px;
	}
	/deep/ .finance-table-container-finance-table .el-input {
		width: 152px;
	}
	.finance-table-upload {
		width: 162px;
	}
}
</style>
<style lang="scss">
.order-refund-detail-form-remark{
	// margin-left: 28px;
	.el-form-item-invoice-remark {
		width: calc(100% - 10px);
		display: flex;
		.el-form-item__content {
			flex: 1;
		}
	}
}
</style>