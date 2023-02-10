<template>
	<div class="markerror-dialog-pay">
		<el-dialog
			:title="$t('PayApplyList.markWrongPay')"
			width="1000px"
			:visible="dialogShow"
			:before-close="cancel"
		>
			<div class="markerror-dialog">
				<el-form
					:model="form"
					:rules="rules"
					ref="form"
					:inline="true"
					size="mini"
					label-width="160px"
				>
					<el-form-item :label="$t('PayApplyList.errorType')" prop="errorType">
						<el-select v-model="form.errorType" :placeholder="$t('OrderFee.plsSelect')">
							<el-option
								v-for="item in dictMap.payErrorType || []"
								:key="item.label"
								:label="item.label"
								:value="item.value"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item :label="$t('PayApplyList.responsibleParty')" prop="responsibleType">
						<el-select
							v-model="form.responsibleType"
							:placeholder="$t('OrderFee.plsSelect')"
							@change="typeChange"
						>
							<el-option
								v-for="item in dictMap.payErrorResponsibleType || []"
								:key="item.label"
								:label="item.label"
								:value="item.value"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item :label="$t('OrderFee.applyPerson')" prop="responsibleName">
						<el-autocomplete
							v-model="form.responsibleName"
							:placeholder="$t('OrderFee.plsInput')"
							clearable
							:select-when-unmatched="true"
							value-key="cname"
							:fetch-suggestions="responsibleFetch"
							@select="responsibleSelect"
							@clear="form.responsibleBy = ''"
						>
							<template slot-scope="scope">
								<span>{{ scope.item.value }}</span>
							</template>
						</el-autocomplete>
					</el-form-item>
					<el-form-item :label="$t('PayApplyList.wrongPayAmt')" prop="applyAmt">
						<el-input
							v-model="form.applyAmt"
							v-lsNumber="{ value: 'number', obj: form, key: 'applyAmt' }"
						></el-input>
					</el-form-item>
					<el-form-item :label="$t('PayApplyList.errorDisposalType')" prop="errorDisposalType">
						<el-select
							v-model="form.errorDisposalType"
							:placeholder="$t('OrderFee.plsSelect')"
						>
							<el-option
								v-for="item in dictMap.payErrorDisposalType || []"
								:key="item.label"
								:label="item.label"
								:value="item.value"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item prop="hasColseSrcOrder" label="  " label-width="40px">
						<el-checkbox
							v-model="form.hasColseSrcOrder"
							true-label="yes"
							false-label="no"
							>{{$t('PayApplyList.closeSrcPayOrder')}}</el-checkbox
						>
					</el-form-item>
					<br/>
					<el-form-item :label="$t('PayApplyList.remark')" prop="errorRemark"><!-- 备注说明 -->
						<el-input
							type="textarea"
							style="width:795px"
							v-model="form.errorRemark"
							:placeholder="$t('OrderFee.plsInput')"
							maxlength="500"
							show-word-limit
						></el-input>
					</el-form-item>
					<div class="finance-table-container" style="margin:12px;">
						<div class="money-box">
							<div class="money-box-left">
								<div class="money-title">{{$t('PayApplyList.actualPayInfo')}}</div>
							</div>
							<div class="money-box-right">
								<el-button
									type="text"
									class="collapse-btn"
									@click="showCollapes = !showCollapes"
									size="mini"
								>
									{{ showCollapes ? $t('Common.collapse') : "" }}
									<i
										:class="[
											!showCollapes ? 'el-icon-arrow-down' : 'el-icon-arrow-up',
										]"
									></i>
								</el-button>
							</div>
						</div>
						<div v-show="showCollapes">
							<div class="child-item">
								<h4>{{$t('PayApplyList.payInfo')}}</h4>

								<el-form-item v-show="form.payWay !== 'cash'" :label="$t('PayApplyList.payBankName')">
									<el-select
										:disabled="isRepeat"
										v-model="form.payBankName"
										value-key="accountNo"
										:placeholder="$t('OrderFee.plsSelect')"
										@change="payBankChange"
									>
										<el-option
											v-for="(op, j) in payBankAccountsList || []"
											:key="'payBankName' + j"
											:label="op.bankName + ' ' + op.accountNo"
											:value="op"
										></el-option>
									</el-select>
								</el-form-item>
								<el-form-item v-show="form.payWay !== 'cash'" :label="$t('PayApplyList.payAccountName')" prop="">
									<el-input
										disabled
										v-model="form.payAccountName"
										:placeholder="$t('Common.plEnter')"
									></el-input>
								</el-form-item>
								<el-form-item v-show="form.payWay !== 'cash'" :label="$t('PayApplyList.payAccountNo')" prop="">
									<el-input
										disabled
										v-model="form.payAccountNo"
										:placeholder="$t('Common.plEnter')"
									></el-input>
								</el-form-item>
								<el-form-item :label="$t('PayApplyList.payWay')" prop="">
									<el-select
										v-model="form.payWay"
										:disabled="isRepeat"
										:placeholder="$t('OrderFee.plsSelect')"
										@change="payWayChange(form)"
									>
										<el-option
											v-for="item in [...(dictMap['payWay'].slice(0, 100).filter(item => item.value !== 'prepay_dedue'))]"
											:key="item.label"
											:label="item.label"
											:value="item.value"
										></el-option>
									</el-select>
								</el-form-item>
								<el-form-item :label="$t('PayApplyList.payCurrency')" prop="currency" >
									<el-select
										v-model="form.currency"
										:placeholder="$t('OrderFee.plsSelect')"
										:disabled="isRepeat"
										@change="currencyList"
									>
										<el-option
											v-for="item in dictMap.validCurrency || []"
											:key="item.label"
											:label="item.label"
											:value="item.value"
											:disabled="item.value === 'ORIGINAL'"
										></el-option>
									</el-select>
								</el-form-item>
							</div>
							<div class="child-item">
								<h4>{{$t('PayApplyList.recvInfo')}}</h4>
								<el-form-item :label="$t('OrderFee.settleCorpName')" prop="" :disabled="isRepeat">
									<el-autocomplete
										:disabled="isRepeat"
										v-model="form.recvCorpName"
										:placeholder="$t('OrderFee.plsInput')"
										clearable
										:select-when-unmatched="true"
										:fetch-suggestions="recvCorpFetch"
										@select="recvCorpSelect"
										@change="recvCorpChange"
									></el-autocomplete>
									<!-- <el-input v-model="form.recvCorpName" :placeholder="$t('Common.plEnter')"></el-input> -->
								</el-form-item>
								<el-form-item :label="$t('PayApplyList.recvBankName')" prop="">
									<el-select
										:disabled="isRepeat"
										v-model="form.recvBankName"
										value-key="accountNo"
										:placeholder="$t('OrderFee.plsSelect')"
										@change="corpBankChange"
									>
										<el-option
											v-for="(op, j) in recvCorpBankAccountsList || []"
											:key="'recvBankName' + j"
											:label="op.bankName + ' ' + op.accountNo"
											:value="op"
										></el-option>
									</el-select>
								</el-form-item>
								<el-form-item :label="$t('PayApplyList.recvAccountName')" prop="">
									<el-input
										disabled
										v-model="form.recvAccountName"
										:placeholder="$t('OrderFee.plsInput')"
									></el-input>
								</el-form-item>
								<el-form-item :label="$t('PayApplyList.recvAccountNo')" prop="">
									<el-input
										disabled
										v-model="form.recvAccountNo"
										:placeholder="$t('OrderFee.plsInput')"
									></el-input>
								</el-form-item>
							</div>
							<div class="child-item">
								<h4>{{$t('PayApplyList.transferInfo')}}</h4>
								<el-form-item
									:label="$t('Payment.bankslipFile')"
									prop=""
									class="invoice-payment-add-form-upload"
									style="position: relative"
								>
									<template v-if="!form.bankseqFileNo && !isRepeat">
										<el-upload
											class="finance-table-upload"
											action="str"
											:limit="1"
											:on-exceed="handleExceed"
											:on-remove="handleRemove"
											:before-remove="beforeRemove"
											:on-change="fileChange"
											:http-request="
												(param) => {
													uploadHttpRequest(param);
												}
											"
											:on-success="uploadSuccess"
										>
											<el-button type="text" v-show="!form.bankseqFileNo"
												>{{$t('PayApplyList.clickToUpload')}}</el-button
											>
										</el-upload>
									</template>
									<template v-else>
										<el-button
											size="mini"
											type="text"
											@click="handleBankseqFileNo"
											v-if="form.bankseqFileNo"
											>{{$t('Settle.clickView')}}</el-button
										>
										<el-button
											size="mini"
											type="text"
											@click="handleDeleteFileNo"
											v-if="form.bankseqFileNo && !isRepeat"
											>{{$t('Common.del')}}</el-button
										>
										<div
											style="width: 152px; display: inline-block; font-size: 12px"
											v-if="!form.bankseqFileNo"
										>
											{{$t('PayApplyList.notHave')}}
										</div>
									</template>
								</el-form-item>
								<el-form-item :label="$t('Collect.bankFlowNumber')" prop="">
									<el-input
										:disabled="isRepeat"
										v-model="form.bankSeqNo"
										:placeholder="$t('Common.plEnter')"
									></el-input>
								</el-form-item>
								<el-form-item :label="$t('FinBill.paymentDate')" prop="">
									<el-date-picker
										:disabled="isRepeat"
										v-model="form.payTime"
										value-format="yyyy-MM-dd"
										:placeholder="$t('Common.plSelect')"
									></el-date-picker>
								</el-form-item>
								<el-form-item :label="$t('PayApplyList.transferDesp')" prop="">
									<el-input
										style="width:795px"
										:disabled="isRepeat"
										type="textarea"
										v-model="form.remark"
										:placeholder="$t('OrderFee.plsInput')"
										maxlength="500"
										show-word-limit
									></el-input>
								</el-form-item>
							</div>
						</div>
					</div>
				</el-form>
			</div>
			<div slot="footer">
				<el-button size="mini" type="primary" :loading='loadingSave' @click="save">{{$t('Common.sure')}}</el-button>
				<el-button size="mini" @click="cancel">{{$t('Common.cancel')}}</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { saveErrorPayOrder } from '@/api/fin/pay'
import { employeeSelectlist } from '@/api/companyResource'
import { bankAccountList } from '@/api/fin/settleUnit'
import { companyBankAccountList } from '@/api/fin/settleUnitBankAcct'
let backupData = {}
let rules = [{ required: true, message: ' ', trigger: 'change' }]
export default {
	name: 'markError',
	props: {
		info: {
			type: Object,
			default: () => ({})
		},
		dialogShow: {
			type: Boolean,
			default: false
		}
	},
	watch: {
		dialogShow:{
			handler(val){
				clearTimeout(this.timer2)
				this.timer2 = setTimeout(() => {
					if(val){
						let hasIntrabranch = ''
						let countryOrgType = this.form.payWay
						if(val.payWay==='intrabranch'){
							hasIntrabranch = "yes"
							countryOrgType = ''
						}
						let hasChequeAcct = ''
						if(val.payWay==='cheque'){
							hasChequeAcct = 'yes'
							countryOrgType = ''
						}
						let queryString = {'accountShortName':"", hasIntrabranch, hasChequeAcct, "receipayType":"pay",'currency': this.form.currency, countryOrgType, "unitCode":'' }
						this.companyBankAccountListData(queryString)
						
					}
				},500)
			},
			immediate:true
		}
	},
	mixins: [mixin],
	data () {
		let form = {
			applyAmt: '',
			errorType: '',
			responsibleType: '',
			responsibleBy: '',
			responsibleName: '',
			errorDisposalType: '',
			hasColseSrcOrder: 'no',
			errorRemark: '',
			refPayOrderNo: '',
			payBankAccountId: '',
			payAccountNo: '',
			payAccountName: '',
			payBankCode: '',
			payBankName: '',
			payWay: '',
			currency: '',
			applyAmt: '',
			recvCorpCode: '',
			recvCorpName: '',
			recvBankCode: '',
			recvBankName: '',
			recvBankAccountId: '',
			recvAccountNo: '',
			recvAccountName: '',
			bankSeqNo: '',
			bankseqFileNo: '',
			payTime: '',
			remark: '',
		}
		backupData = { ...form }
		let invoicePaymentAddRules = {}
		Object.keys(form).forEach((item) => {
			if (item === 'hasColseSrcOrder') {
				// invoicePaymentAddRules[item] = [{ ...rules[0], message: '必填' }]
			} else if (item === 'responsibleName' || item === 'recvCorpName') {
				invoicePaymentAddRules[item] = [{ ...rules[0], trigger: 'change' }]
			} else if (item !== 'responsibleBy') {
				invoicePaymentAddRules[item] = rules
			}
		})
		return {
			loadingSave: false,
			form: {},
			// 表单参数验证
			rules: invoicePaymentAddRules,
			showCollapes: true,
			recvCorpBankAccounts: null,
			payBankAccounts: [],
			payBankAccountsList:[],
			recvCorpBankAccountsList:[]
		}
	},
	computed: {
		...mapGetters(['dictMap']),
		isRepeat () {
			return this.form.errorType === 'repeat_pay'
		},
	},
	created () {
		this.form = { ...this.info, ...this.info.writeoffPay, ...this.info.payOrder, ...this.info.payOrder.payInfo, applyAmt: this.info.payOrder.payInfo.applyPayAmt, refPayOrderNo: this.info.payOrder.payOrderNo }
		bankAccountList({ unitCode: this.form.recvCorpCode, status: 'effect', receipayType:'receive' }).then((res) => {
			this.recvCorpBankAccounts = res.data || []
			if(this.form.currency){
				this.currencyChange(this.form.currency)
			}
		}),
			companyBankAccountList({receipayType:"pay"}).then((res) => {
				this.payBankAccounts = res.data || []
			})
			
	},
	methods: {
		// 责任人下拉
		responsibleFetch (queryString, cb) {
			this.form.responsibleBy = ''
			employeeSelectlist({ name: queryString }).then((res) => {
				cb(res.data.map((item) => ({ ...item, label: item.employeeId, value: `${item.cname} (${item.employeeNo})` })))
			})
		},
		// 责任人选择
		responsibleSelect (item) {
			this.form.responsibleBy = item.employeeId
		},
		// 结算单位下拉
		recvCorpFetch (queryString, cb) {
			this.querySettleUnit({ queryString, unitTypes: '', isAdd: true }, cb)
		},
		// 结算单位选择
		recvCorpSelect (item) {
			console.log(item)
			this.form.recvCorpCode = item.key
			bankAccountList({ unitCode: item.key, status: 'effect', receipayType:'receive' }).then((res) => {
				if (!res.data) {
					this.corpBankChange({})
					this.recvCorpBankAccounts = null
				} else {
					this.recvCorpBankAccounts = res.data
				}
				if(this.form.currency){
					this.currencyChange(this.form.currency)
				}
			})
		},
		recvCorpChange (val) {
			!val && this.corpBankChange({})
		},
		currencyChange(val){
			let payBankAccounts = []
			this.payBankAccounts.forEach(item=>{
				if(val === item.currency){
					payBankAccounts.push(item)
				}
			})
			if(payBankAccounts.length){
				this.payBankChange(payBankAccounts[0])
			}else{
				this.payBankChange({})
			}
			this.payBankAccountsList = payBankAccounts

			let recvCorpBankAccounts = []
			this.recvCorpBankAccounts.forEach(item=>{
				if(val === item.currency){
					recvCorpBankAccounts.push(item)
				}
			})
			if(recvCorpBankAccounts.length){
				this.corpBankChange(recvCorpBankAccounts[0])
			}else{
				this.corpBankChange({})
			}
			this.recvCorpBankAccountsList = recvCorpBankAccounts

			this.$forceUpdate()
		},
		currencyList(val){
			console.log(val);
			this.currencyChange(val)

		},
		corpBankChange (val) {
			this.form.recvBankName = val.bankName
			this.form.recvBankCode = val.bankCode
			this.form.recvAccountName = val.accountName
			this.form.recvAccountNo = val.accountNo
			this.form.recvBankAccountId = val.settleUnitBankAcctId
		},
		payBankChange (val) {
			this.form.payBankName = val.bankName
			this.form.payBankCode = val.bankCode
			this.form.payAccountName = val.accountName
			this.form.payAccountNo = val.accountNo
			this.form.payBankAccountId = val.settleUnitBankAcctId
		},
		save () {
			let payWriteoffStatus = this.info.payOrder.payWriteoffStatus
			let hasColseSrcOrder = this.form.hasColseSrcOrder
			if (payWriteoffStatus === 'yes' && hasColseSrcOrder === 'yes') {
				return this.$msgErrClose(this.$t('PayApplyList.markPayErrorNotCloseOldPay')) // 已核销的付款单标记付错时，不允许勾选关闭原单
			}
			this.$refs.form.validate((valid) => {
				if (valid) {
					Object.keys(backupData).forEach((key) => (backupData[key] = this.form[key]))
					this.loadingSave = true
					saveErrorPayOrder(backupData).then((res) => {
						this.$msgSucClose(this.$t('FinBill.saveSuc'))
						this.$emit('saveSuc')
						this.cancel()
					}).finally(()=>{
						this.loadingSave = false
					})
				}
			})
		},
		cancel () {
			this.$refs.form.resetFields()
			this.$emit('closeDilog')
		},
		handleRemove () {
			this.form.fileId = this.form.fileNo = this.form.bankseqFileNo = ''
		},
		beforeRemove (file) {
			return this.$confirm(`${this.$t('PayApplyList.sureDelete')}${file.name}？`) // 确定移除
		},
		handleExceed (files, fileList) {
			this.$message.warning(this.$t('Hedge.onlyTips'))
		},
		uploadHttpRequest () {
			const params = new FormData()
			params.append('file', this.file)
			this.$store.dispatch('user/import', { uri: '/base/webapi/file/uploadToTempPath', params }).then((res) => { // '/base/webapi/file/upload', 20220830
				this.$msgSucClose(this.$t('BillList.uploadSuccess'))
				this.form.bankseqFileNo = res.data.data.fileNo
				this.fileList = []
			})
		},
		fileChange (file) {
			this.file = file.raw
		},
		uploadSuccess (response, file, fileList) {
			let fileId = response.data && response.data.fileId
			this.form.fileId = this.form.fileNo = fileId ? fileId : 'test'
		},
		//查看水单文件
		handleBankseqFileNo () {
			let href = `/base/fileView/preview/${this.form.bankseqFileNo}/sowoll`
			window.open(href)
		},
		handleDeleteFileNo () {
			this.$confirm(this.$t('PayApplyList.sureDelete'), this.$t('OrderFee.tip'), { // '是否确认删除水单文件？', '水单'
				confirmButtonText: this.$t('Common.sure'),
				cancelButtonText: this.$t('Common.cancel'),
				type: 'warning',
			})
				.then(() => {
					this.form.bankseqFileNo = ''
				})
				.catch(console.log)
		},
		typeChange (val) {
			if (val == 'inside_employee') {
				this.rules.responsibleName = [{ ...rules[0], trigger: 'change' }]
			} else {
				this.rules.responsibleName = []
			}
		},
		companyBankAccountListData(queryString){
			this.$store.dispatch('dict/companyBankAccountList', queryString).then((data) => {
				this.payBankAccountsList = data || []
				if(data && data.length){
					this.form.payBankName = data[0].bankName
					this.form.payBankCode = data[0].bankCode
					this.form.payAccountName = data[0].accountName
					this.form.payAccountNo = data[0].accountNo
					this.form.payBankAccountId = data[0].settleUnitBankAcctId
				}else{
					this.form.payBankName = ''
					this.form.payAccountName = ''
					this.form.payAccountNo = ''
					this.form.payBankCode = ''
					this.form.payBankAccountId = ''
				}
				this.$forceUpdate()
			})
		},
		//付款方式
		payWayChange(val){
			console.log(val);
			
			let hasIntrabranch = ''
			let countryOrgType = val.payWay
			if(val.payWay==='intrabranch'){
				hasIntrabranch = "yes"
				countryOrgType = ''
			}
			let hasChequeAcct = ''
			if(val.payWay==='cheque'){
				hasChequeAcct = 'yes'
				countryOrgType = ''
			}
			let queryString = {'accountShortName':"", hasIntrabranch, hasChequeAcct, "receipayType":"pay",'currency': val.currency, countryOrgType, "unitCode":'' }
			this.companyBankAccountListData(queryString)
		},
	},
	
}
</script>



<style lang="scss">
.app-wrapper {
	.finance-page {
		.markerror-dialog {
			// textarea {
			// 	width: 100% !important;
			// }
			h4 {
				font-size: 12px;
				margin-bottom: 10px;
				background-color: #eee;
				padding: 5px 8px;
				font-weight: 500;
			}
			.el-input,
			.el-form-item__content,
			.finance-table-upload{
				width:152px;
			}
		}
		.markerror-dialog-pay{
			.el-dialog__body {
				padding: 12px 0 0 0 !important;
			}
		}
	}
}
</style>