<template>
	<div class="finance-page">
		<div class="finance-payorder-print" v-if="info">
			<div id="printPayOrder">
				<div class="finance-payPrepayPrint-print-cnt">
					<div class="logo">
						<img src="../../../../../assets/bill_logo.png" />
						<h1 class="pay_comp_name">{{info.payCompName}}</h1>
					</div>
					<div class="title">
						<div class="base-item base-item-apply-no-left" >第{{ isPrinting ? info.printCount :  info.printCount - 1 }}次打印</div>
						<h1>预付款申请单</h1>
						<div class="base-item base-item-apply-no">预付款申请号：{{ info.applyNo }}</div>
					</div>
					<div class="print-info-box-div"> 
						<table width="100%" border="0" cellspacing="1" cellpadding="0"> 
							<tr> 
								<td class="item-title-td">结算单位</td> 
								<td class="item-contnet-td">{{ info.recvCorpName }}</td> 
								<td class="item-title-td">付款方式</td> 
								<td class="item-contnet-td">{{ dictMapObj.payWay[info.payWay] }}</td> 
								<td class="item-title-td">付款金额</td> 
								<td class="item-contnet-td">{{info.currency}} {{ info.applyPayAmt }}</td> 
							</tr>  
							<tr> 
								<td class="item-title-td">对方户名</td> 
								<td class="item-contnet-td">{{ info.recvAccountName }}</td> 
								<td class="item-title-td">对方开户行支行</td> 
								<td class="item-contnet-td">{{ info.recvBankBranch }}</td> 
								<td class="item-title-td">对方账号</td> 
								<td class="item-contnet-td">{{info.recvAccountNo}}</td> 
							</tr>  
							<tr> 
								<td class="item-title-td">我司户名</td> 
								<td class="item-contnet-td">{{ info.payAccountName }}</td> 
								<td class="item-title-td">我司开户行支行</td> 
								<td class="item-contnet-td">{{ info.payBankBranch }}</td> 
								<td class="item-title-td">我司账号</td> 
								<td class="item-contnet-td">{{info.payAccountNo}}</td> 
							</tr>  
							<tr> 
								<td class="item-title-td">预付发票</td> 
								<td colspan="5" style="width:11em;word-wrap:break-word;word-break: break-all;">{{ info.invoiceNoJoin }}</td> 
							</tr>
						</table> 
					</div>
					<div class="print-info-box" style="margin-top:24px;">
						<template>
							<div class="base-item">申请日期：{{ info.createdTime }}</div>
							<div class="base-item">审核时间：{{ info.confirmTime }}</div>
							<div class="base-item">推送时间：{{ info.sendPayOrderTime }}</div>
							<div class="base-item">申请人：{{ info.createdName }}</div>
							<div class="base-item">审核人：{{ info.confirmName }}</div>
							<div class="base-item">推送人：{{ info.sendPayOrderUserName }}</div>
						</template>
					</div>
				</div>
				<div v-if="checkedPrint" >
					<div class="finance-payPrepayPrint-print-cnt" style="height: 790px;margin-top:12px" v-for="(it,index) in info.invoiceFileNoList" :key="index">
						<img class="" width="1020" :src="it.completeTask"  style="border:none" />
					</div>
				</div>
				
			</div>
			
			<div class="print-btn-box">
				<el-checkbox v-model="checkedPrint">是否打印发票</el-checkbox>
				<el-button
					class="finance-btn"
					type="primary"
					size="mini"
					v-print="printObj"
					>打印</el-button
				>
				<el-button class="finance-btn" size="mini" @click="cancel"
					>返回</el-button
				>
			</div>
		</div>
	</div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mapGetters } from 'vuex'
import { prepayQueryPrintInfo, prepayPrintConfirm } from '@/api/fin/pay'
export default {
	mixins: [mixin, routerMixin],
	components: {
		FinanceTableMass
	},
	data () {
		return {
      isPrinting: false,
			checkedPrint:false,
			payOrderNo: '',
			applyNo: '',
			info: {},
			printObj: {
				id: "printPayOrder",
				popTitle: '预付款申请单',
				type: "html",
				extraCss: '',
				printCallback: this.printCallback,
				printCallbackBefore: this.printCallbackBefore,
				// extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>'
			},
			option1: {},
			columns1: [
				{
					prop: 'bdName',
					label: '销售',
					type: 'text',
				},
				{
					prop: 'settleCorpName',
					label: '结算单位',
					type: 'text',
					width: 130
				},
				{
					prop: 'receipayType',
					label: '类型',
					type: 'select',
					propInDict: 'receipayType',
				},
				{
					prop: 'orderNo',
					label: '业务编号',
					type: 'text',
					width: 130
				},
				{
					prop: 'putNo',
					label: '提单号',
					type: 'text',
				},
				{
					prop: 'feeName',
					label: '费用名称',
					type: 'text',
				},
				{
					prop: 'originalCurrency',
					label: '结算币种',
					type: 'text',
				}
				,
				{
					prop: 'settleAmt',
					label: '结算金额',
					type: 'text',
				},
				{
					prop: 'invoiceNo',
					label: '发票号',
					type: 'text',
				},
				{
					prop: 'sysLineName',
					label: '航线',
					type: 'text',
				}
				,
				{
					prop: 'reciStatus',
					label: '收款状态',
					type: 'select',
					propInDict: 'feeSettleStatus',

				}
			],
			columns2: [
				{
					prop: 'bdName',
					label: '销售',
					type: 'text',
				},
				{
					prop: 'settleCorpName',
					label: '结算单位',
					type: 'text',
					width: 130
				},
				{
					prop: 'orderNo',
					label: '业务编号',
					type: 'text',
					width: 130
				},
				{
					prop: 'feeName',
					label: '费用名称',
					type: 'text',
				},
				{
					prop: 'originalCurrency',
					label: '币种',
					type: 'text',
				},
				{
					prop: 'settleAmt',
					label: '请款金额',
					type: 'text',
				},
				{
					prop: 'settleExRate',
					label: '结算汇率',
					type: 'text',
				}
				,
				{
					prop: 'exSettleAmt',
					label: '折合金额',
					type: 'text',
				},
				{
					prop: 'sysLineName',
					label: '航线',
					type: 'text',
				},
				{
					prop: 'containerCount',
					label: '箱型箱量',
					type: 'text',
				}
				,
				{
					prop: 'orderProfit',
					label: '利润',
					type: 'text',
				},
				{
					prop: 'reciStatus',
					label: '收款状态',
					type: 'select',
					propInDict: 'feeSettleStatus',
				}
			]
		}
	},
	computed: {
		...mapGetters(['dictMapObj']),
	},
	created () {
		this.option1 = Object.assign({}, this.option, {
			id: 'option1', $name: 'PayPrepayPrint',
			columns: [],
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
			showOverflow: false
		})
	},
	activated () {
		this.applyNo = this.$route.query.applyNo
		this.getData()
	},
	methods: {
		// 返回
		cancel () {
			this.routerBack()
		},
		// 获取数据详情
		getData () {
			let data = {
				applyNo: this.applyNo
			}
			prepayQueryPrintInfo(data).then(res => {
				this.info = res.data
				if (this.info.orderType === 'special_refund') {
					this.option1.columns = this.columns2
				} else {
					this.option1.columns = this.columns1
				}
				let invoiceFileNoList = []
				res.data.invoiceFileNoList.forEach(item=>{
					if(item){
						invoiceFileNoList.push( 
							{ completeTask: `/base/fileView/preview/${item}/sowoll`}
						)
					}
					
				})
				this.info.invoiceFileNoList = invoiceFileNoList
				this.option1.data = res.data.settleOrderFeeList || []
			}).catch(() => {
				this.delVisitedView()
          		this.cancel()
			 })
		},
		// 打印次数统计
		printCallback () {
      this.isPrinting = false
			const applyNos = [ this.info.applyNo ]
			prepayPrintConfirm({ applyNos:applyNos }).then(res => {
				this.getData()
			}).catch(() => { })
		},
    printCallbackBefore(fn){
      this.printCallbackBeforeCommon(this.info.printCount, () => this.isPrinting = true, fn, () => this.isPrinting = false)
    }
	}
}
</script>

<style media="print" scoped>
@media print {
  @page {
    /* size: landscape; */
    size: portrait;
    margin: 0 10mm;
  }
}
.finance-payorder-print {
  width: 1020px;
  margin: 0 auto;
  position: relative;
  padding-bottom: 40px;
}
.finance-payPrepayPrint-print-cnt {
  width: 1020px;
  padding-top: 20px;
  font-size: 14px;
  page-break-before: auto;
  page-break-after: always;
}
.finance-payPrepayPrint-print-cnt .logo {
  padding-top: 5px;
  padding-bottom: 0px;
  border-bottom: 1px solid #d8d8d8;
  position: relative;
}
.finance-payPrepayPrint-print-cnt .logo img{
	position: absolute;
	top: 16px;
    
}
.finance-payPrepayPrint-print-cnt .logo .pay_comp_name{
	font-size: 20px;
	font-weight: 500;
	color: #222222;
	text-align: center;
}
.finance-payPrepayPrint-print-cnt .title {
  margin: 20px 0;
}
.finance-payPrepayPrint-print-cnt .title h1 {
  font-size: 20px;
  font-weight: 600;
  color: #222222;
  text-align: center;
}
.finance-payPrepayPrint-print-cnt .print-info-box {
  display: flex;
  flex-wrap: wrap;
}
.finance-payPrepayPrint-print-cnt .print-info-box .base-item {
  flex: 1;
  flex-basis: calc(33% - 24px);
  margin-bottom: 10px;
  margin-right: 24px;
}
.finance-payPrepayPrint-print-cnt .print-table {
  /* margin-top: 10px; */
}
.finance-payPrepayPrint-print-cnt .print-table .finance-table{
	padding:0
}
.finance-payPrepayPrint-print-cnt .print-table-total {
  background: #e7eeff;
  padding: 8px 0;
  margin-top:14px;
  font-size: 14px;
  font-weight: 600;
  color: #222222;
  display: flex;
  padding-right: 15px;
  -webkit-print-color-adjust: exact !important;
}
.finance-payPrepayPrint-print-cnt .print-table-total .text {
  flex: 1;
  text-align: right;
}
.finance-payPrepayPrint-print-cnt .print-table-total .total-box {
  min-width: 400;
}
.finance-payPrepayPrint-print-cnt .print-table-total .total-box .total-item {
  margin-left: 15px;
}
.finance-payPrepayPrint-print-cnt .print-apply-info {
  margin-top: 30px;
  display: flex;
  flex-wrap: wrap;
}
.finance-payPrepayPrint-print-cnt .print-apply-info .base-item {
  width: 25%;
  margin-bottom: 10px;
}
/* .finance-payorder-print .el-checkbox {
  margin-top: 4px;
} */
.finance-payorder-print .print-btn-box {
  display: flex;
  justify-content: flex-end;
  margin-top: 40px;
  vertical-align: middle;
  position: absolute;
  top: 0;
  right: 0px;
}
.finance-payorder-print .print-btn-box .finance-btn {
  margin-left: 10px;
  min-width: 50px;
  /* line-height: 25px; */
  /* height: 25px; */
  padding: 0 4px;
}
</style>

<style lang="scss">
.finance-payPrepayPrint-print-cnt{
	.base-item-apply-no{
		float: right;
		margin-top: -32px;
	}
	.print-info-box-div{ width:100%} 
	.print-info-box-div table{ background:#CCC;} 
	.print-info-box-div table td{ background:#FFF;padding:8px 4px;} 
	.print-info-box-div table .item-title-td{
		width: 8%;
		background: #F0F1F3;
	}
	.print-info-box-div table .item-contnet-td{
		width: 25%;
	}
	.base-item-apply-no-left{
		position: absolute;
		left: 0;
		line-height: 150%;
	}
}

@media print{
	.print-info-box-div table {
		border-collapse: collapse;
		border: none;
		color: #000;
	}
	.print-info-box-div table .item-title-td{
		background: #D9D9D9 !important;
	}
	.print-info-box-div tr td,
  	.print-info-box-div tr th {
    	border: 1px solid #000;
    	color: #000;
  	}
}
</style>