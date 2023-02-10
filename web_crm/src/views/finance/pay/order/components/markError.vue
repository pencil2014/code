<template>
	<div class="markerror-dialog-pay">
		<el-dialog
			title="标记付错"
			width="800px"
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
					label-width="86px"
				>
					<el-form-item label="付错原因" prop="errorType">
						<el-select v-model="form.errorType" placeholder="请选择付错原因">
							<el-option
								v-for="item in dictMap.payErrorType || []"
								:key="item.label"
								:label="item.label"
								:value="item.value"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="责任方" prop="responsibleType">
						<el-select
							v-model="form.responsibleType"
							placeholder="请选择责任方"
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
					<el-form-item label="责任人" prop="responsibleName">
						<el-autocomplete
							v-model="form.responsibleName"
							placeholder="请输入"
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
					<el-form-item label="付错金额" prop="applyAmt">
						<el-input
							v-model="form.applyAmt"
							v-lsNumber="{ value: 'number', obj: form, key: 'applyAmt' }"
						></el-input>
					</el-form-item>
					<el-form-item label="处理方式" prop="errorDisposalType">
						<el-select
							v-model="form.errorDisposalType"
							placeholder="请选择处理方式"
						>
							<el-option
								v-for="item in dictMap.payErrorDisposalType || []"
								:key="item.label"
								:label="item.label"
								:value="item.value"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item prop="hasColseSrcOrder" label="  ">
						<el-checkbox
							v-model="form.hasColseSrcOrder"
							true-label="yes"
							false-label="no"
							>关闭原付款单</el-checkbox
						>
					</el-form-item>
					<br/>
					<el-form-item label="备注说明" prop="errorRemark">
						<el-input
							type="textarea"
							style="width:648px"
							v-model="form.errorRemark"
							placeholder="请输入"
							maxlength="500"
							show-word-limit
						></el-input>
					</el-form-item>
					<div class="finance-table-container" style="margin:12px;">
						<div class="money-box">
							<div class="money-box-left">
								<div class="money-title">实际付款信息</div>
							</div>
							<div class="money-box-right">
								<el-button
									type="text"
									class="collapse-btn"
									@click="showCollapes = !showCollapes"
									size="mini"
								>
									{{ showCollapes ? "收起" : "" }}
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
								<h4>付款信息</h4>

								<el-form-item v-show="form.payWay !== 'cash'" label="付款银行">
									<el-select
										:disabled="isRepeat"
										v-model="form.payBankName"
										value-key="accountNo"
										placeholder="请选择"
										@change="payBankChange"
									>
										<el-option
											v-for="(op, j) in payBankAccountsList || []"
											:key="'invoiceType' + j"
											:label="op.bankName + ' ' + op.accountNo"
											:value="op"
										></el-option>
									</el-select>
								</el-form-item>
								<el-form-item v-show="form.payWay !== 'cash'" label="付款账户名" prop="">
									<el-input
										disabled
										v-model="form.payAccountName"
										placeholder="请输入"
									></el-input>
								</el-form-item>
								<el-form-item v-show="form.payWay !== 'cash'" label="付款账号" prop="">
									<el-input
										disabled
										v-model="form.payAccountNo"
										placeholder="请输入"
									></el-input>
								</el-form-item>
								<el-form-item label="付款方式" prop="">
									<el-select
										v-model="form.payWay"
										:disabled="isRepeat"
										placeholder="请选择付款方式"
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
								<el-form-item label="付款币种" prop="currency" >
									<el-select
										v-model="form.currency"
										placeholder="请选择付款币种"
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
								<h4>收款信息</h4>
								<el-form-item label="结算单位" prop="" :disabled="isRepeat">
									<el-autocomplete
										:disabled="isRepeat"
										v-model="form.recvCorpName"
										placeholder="请输入"
										clearable
										:select-when-unmatched="true"
										:fetch-suggestions="recvCorpFetch"
										@select="recvCorpSelect"
										@change="recvCorpChange"
									></el-autocomplete>
									<!-- <el-input v-model="form.recvCorpName" placeholder="请输入"></el-input> -->
								</el-form-item>
								<el-form-item label="收款银行" prop="">
									<el-select
										:disabled="isRepeat"
										v-model="form.recvBankName"
										value-key="accountNo"
										placeholder="请选择"
										@change="corpBankChange"
									>
										<el-option
											v-for="(op, j) in recvCorpBankAccountsList || []"
											:key="'invoiceType' + j"
											:label="op.bankName + ' ' + op.accountNo"
											:value="op"
										></el-option>
									</el-select>
								</el-form-item>
								<el-form-item label="收款账户名" prop="">
									<el-input
										disabled
										v-model="form.recvAccountName"
										placeholder="请输入"
									></el-input>
								</el-form-item>
								<el-form-item label="收款账号" prop="">
									<el-input
										disabled
										v-model="form.recvAccountNo"
										placeholder="请输入"
									></el-input>
								</el-form-item>
							</div>
							<div class="child-item">
								<h4>转账信息</h4>
								<el-form-item
									label="水单文件"
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
												>点击上传</el-button
											>
										</el-upload>
									</template>
									<template v-else>
										<el-button
											size="mini"
											type="text"
											@click="handleBankseqFileNo"
											v-if="form.bankseqFileNo"
											>点击查看</el-button
										>
										<el-button
											size="mini"
											type="text"
											@click="handleDeleteFileNo"
											v-if="form.bankseqFileNo && !isRepeat"
											>删除</el-button
										>
										<div
											style="width: 152px; display: inline-block; font-size: 12px"
											v-if="!form.bankseqFileNo"
										>
											无
										</div>
									</template>
								</el-form-item>
								<el-form-item label="银行流水号" prop="">
									<el-input
										:disabled="isRepeat"
										v-model="form.bankSeqNo"
										placeholder="请输入"
									></el-input>
								</el-form-item>
								<el-form-item label="付款时间" prop="">
									<el-date-picker
										:disabled="isRepeat"
										v-model="form.payTime"
										value-format="yyyy-MM-dd"
										placeholder="请选择"
									></el-date-picker>
								</el-form-item>
								<el-form-item label="转账说明" prop="">
									<el-input
										style="width:648px"
										:disabled="isRepeat"
										type="textarea"
										v-model="form.remark"
										placeholder="请输入"
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
				<el-button size="mini" type="primary" :loading='loadingSave' @click="save">确 定</el-button>
				<el-button size="mini" @click="cancel">取 消</el-button>
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
				return this.$msgErrClose('已核销的付款单标记付错时，不允许勾选关闭原单')
			}
			this.$refs.form.validate((valid) => {
				if (valid) {
					Object.keys(backupData).forEach((key) => (backupData[key] = this.form[key]))
					this.loadingSave = true
					saveErrorPayOrder(backupData).then((res) => {
						this.$msgSucClose('保存成功！')
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
			return this.$confirm(`确定移除 ${file.name}？`)
		},
		handleExceed (files, fileList) {
			this.$message.warning(`只能选择 1 个文件！`)
		},
		uploadHttpRequest () {
			const params = new FormData()
			params.append('file', this.file)
			this.$store.dispatch('user/import', { uri: '/base/webapi/file/uploadToTempPath', params }).then((res) => { // '/base/webapi/file/upload', 20220830
				this.$msgSucClose('上传成功!')
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
			this.$confirm('是否确认删除水单文件？', '水单', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
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