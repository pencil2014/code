<template>
	<div class="finance-page">
		<div class="finance-list-container" >
			<div class="money-box money-box-border-bottom">
				<div class="money-box-left">
					<div class="money-title">预付退款</div>
				</div>
				<div class="money-box-right">
					<el-button v-if="checkAuth($route.name, 'btn-refundSubmit')" :loading='loadingSubmit' @click="submit" size="mini" type="primary">确认</el-button>
					<el-button @click="cancel" size="mini">返回</el-button>
				</div>
			</div>
			<div class="order-refund">
				<div class="settlement-detail-form gedging-detail-form">
					<el-form
						:model="refund"
						ref="refund"
						:inline="true"
						size="mini"
						label-width="98px"
					>	
						<el-form-item label="退款金额"  prop="applyPayAmt">
							<el-input
								v-model="refund.applyPayAmt"
								size="mini"
								placeholder="请输入退款金额"
								v-lsNumber="{
									value: 'number',
									obj: refund,
									key: 'applyPayAmt',
								}"
								:maxlength="16"
							></el-input>
						</el-form-item>
						<el-form-item
							label="退款时间"
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
								placeholder="请选择"
								size="mini"
							></el-date-picker>
						</el-form-item>
						<el-form-item
							label="银行流水号"
							prop="bankSeqNo"
							:rules="{
								required: true,
								message: ' ',
								trigger: 'blur',
							}"
						>
							<el-input
								v-model="refund.bankSeqNo"
								:maxlength="32"
								placeholder="请输入银行流水号"
								size="mini"
							></el-input>
						</el-form-item>
						<el-form-item
							label="水单文件"
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
									<el-button type="text">点击上传</el-button>
								</el-upload>
							</template>
							<template v-else>
								<el-button size="mini" type="text" @click="handleBankseqFileNo"
									>点击查看</el-button
								>
								<el-button size="mini" type="text" @click="handleDeleteFileNo"
									>删除</el-button
								>
							</template>
						</el-form-item>
						<el-form-item
							label="退款至"
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
								placeholder="我司付款账号"
							>
								<el-option
									v-for="item in dictMap['payRefundType']"
									:key="item.value"
									:label="item.label"
									:value="item.value"
								></el-option>
							</el-select>
						</el-form-item>
						<el-form-item label="我司银行简称" prop="payAccountShortName" :rules="{	required: true,	message: ' ',	trigger: 'change',}" >
							<el-autocomplete
								style="width:100%"
								clearable
								v-model="refund.payAccountShortName"
								placeholder="请选择我司银行简称"
								:select-when-unmatched="true"
								:fetch-suggestions="(queryString, cb) => {autocomplete2.querySearch && autocomplete2.querySearch(queryString, cb)}"
								@select="(value) => {autocomplete2.select && autocomplete2.select(value)}"
								@change="(value) => {autocomplete2.change && autocomplete2.change(value)}"
								>
							</el-autocomplete>
						</el-form-item>
						<el-form-item label="银行名称" prop="payBankName" >
							<el-input disabled v-model="refund.payBankName" placeholder="请输入银行名称"></el-input>
						</el-form-item>
						<el-form-item label="银行账号" prop="payAccountNo">
							<el-input disabled v-model="refund.payAccountNo" placeholder="请输入银行账号"></el-input>
						</el-form-item>
						<el-form-item label="收款银行账号" prop="recvAccountNo" :rules="{	required: true,	message: ' ',	trigger: 'change',}" >
							<el-autocomplete
								style="width:100%"
								clearable
								v-model="refund.recvAccountNo"
								placeholder="请选择收款银行账号"
								:select-when-unmatched="true"
								:fetch-suggestions="(queryString, cb) => {autocomplete1.querySearch && autocomplete1.querySearch(queryString, cb)}"
								@select="(value) => {autocomplete1.select && autocomplete1.select(value)}"
								@change="(value) => {autocomplete1.change && autocomplete1.change(value)}">
							</el-autocomplete>
						</el-form-item>
						<el-form-item label="收款银行" >
							<el-input disabled v-model="refund.recvBankName"></el-input>
						</el-form-item>
						<el-form-item label="收款账户名" >
							<el-input disabled v-model="refund.recvAccountName"></el-input>
						</el-form-item>
						
						<br />
						<div class="order-refund-detail-form-remark">
							<el-form-item label="退款说明" prop="remark" label-width="70px"  class="el-form-item-invoice-remark" style="width:100%;">
								<el-input
									type="textarea"
									v-model="refund.remark"
									placeholder="请输入说明原因，不超过500个字"
									maxlength="500"
									show-word-limit
								></el-input>
							</el-form-item>
						</div>
					</el-form>
				</div>

				<div class="finance-table-container">
					<div class="money-box" style="background-color: #F8F9FD;">
						<div class="money-box-left">
							<div class="money-title">手续费</div>
						</div>
						<div class="money-box-right">
							<el-button class="finance-btn" @click="add2(null)" size="mini"
								>添加手续费</el-button
							>
							<el-button
								type="text"
								class="collapse-btn"
								@click="handleCollapse('Table1')"
								size="mini"
							>
								收起
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
				<div class="finance-table-container">
					<div class="money-box" style="background-color: #F8F9FD;">
						<div class="money-box-left">
							<div class="money-title">付款信息</div>
						</div>
						<div class="money-box-right">
							<el-button
								type="text"
								class="collapse-btn"
								@click="handleCollapse('Table2')"
								size="mini"
							>
								收起
								<i :class="{'el-icon-arrow-up': showTable2,	'el-icon-arrow-down': !showTable2,}"
								></i>
							</el-button>
						</div>
					</div>
					<div class="settlement-detail-form"  v-if="!showTable2">
						<h3>付款信息</h3>
						<DetailDiv	label="付款单号：" :content="payInfo.payOrderNo"/>
						<DetailDiv	label="付款单类型：" :content="dictMapObj.payOrderType[payInfo.orderType]"/>
						<DetailDiv	label="申请单号：" :content="payInfo.sourceApplyNo"/>
						<DetailDiv	label="受理状态：" :content="payInfo.confirmStatus === 'pass'? '已受理' : '未受理'"/>
						<DetailDiv	label="付款方式：" :content="dictMapObj.payWay[payInfo.payWay]"/>
						<DetailDiv	label="付款币种：" :content="payInfo.currency"/>
						<DetailDiv	label="付款金额：" :content="payInfo.applyAmt"/>
						<DetailDiv	label="付款单状态：" :content="dictMapObj.payStatusType[payInfo.payStatus]"/>
						<DetailDiv	label="付款人：" :content="payInfo.confirmName"/>
						<DetailDiv	label="付款时间：" :content="payInfo.confirmTime"/>
						<DetailDiv	label="收款账户名：" :content="payInfo.recvAccountName" :isTooltip="true"/>
						<DetailDiv	label="收款账号：" :content="payInfo.recvAccountNo"/>
						<DetailDiv	label="付款银行简称：" :content="payInfo.payAccountShortName" :isTooltip="true"/>
						<DetailDiv	label="付款账户名：" :content="payInfo.payAccountName" :isTooltip="true"/>
						<DetailDiv	label="付款账号：" :content="payInfo.payAccountNo"/>
						<DetailDiv	label="所属分公司：" :content="payInfo.payCompName" :isTooltip="true" />
						<DetailDiv	label="创建人：" :content="payInfo.createdName"/>
						<DetailDiv	label="创建时间：" :content="payInfo.createdTime"/>
						<DetailDiv	label="结算单位：" :content="payInfo.recvCorpName" :isTooltip="true"/>
						<DetailDiv	label="收款银行：" :content="payInfo.recvBankName" :isTooltip="true"/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { mapState } from 'vuex'
import { payOrderPrepayRefund, queryPayOrderInfo } from '@/api/fin/pay'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
export default {
	name: 'payOrderRefund',
	mixins: [mixin, routerMixin],
	data () {
		return {
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
			option1: {},
			showUploadBtn: true,
			file: null,
			uploadParams: {},
			payInfo:{},
			loadingSubmit:false,
		}
	},
	created () {
		//供应商收款账号
		let alias = this
		this.autocomplete1 = {
			querySearch: (queryString, cb) => {
				alias.selectedOptionItem = ''
				if(!this.refund.recvCorpCode){
				this.$message({
					message: '无结算单位',
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
					label: '删除',
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
	},
	methods: {
		add2 () {
			this.option1.data.push({ cutType: 'exter_cut', currency: '', amt: '', edit: true })
		},
		handleDelete ($index, row, option) {
			this.$confirm('是否确认删除？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
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
					this.loadingSubmit = true
					payOrderPrepayRefund(data).then((res) => {
						this.$msgSucClose('提交成功!')
						
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
			
		},
		cancel (refresh) {
			this.routerBack(refresh)
		},
		handleExceed (files, fileList) {
			this.$message.warning(`只能选择 1 个文件！`)
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
					this.$msgSucClose('上传成功!')
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
			this.$confirm('是否确认删除水单文件？', '水单', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
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
	},
	components: {
		FinanceTable,
	},
	computed: {
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
			this.option1.data =[]
			queryPayOrderInfo({ payOrderNo: this.payOrderNo })
				.then((res) => {
					if (!res.data) {
						this.$msgErrClose('没有对应的数据！')
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
					Object.assign(this.payInfo,{},res.data.payOrder.payInfo)
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

<style scoped>
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
	margin-left: 28px;
	.el-form-item-invoice-remark {
		width: calc(100% - 10px);
		display: flex;
		.el-form-item__content {
			flex: 1;
		}
	}
}
</style>