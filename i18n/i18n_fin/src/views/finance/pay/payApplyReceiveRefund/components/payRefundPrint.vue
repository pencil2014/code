<template>
	<div class="finance-page">
		<div class="finance-payorder-print" v-if="info">
			<div>
				<div class="finance-payRefundPrint-print-cnt">
					<div class="logo">
						<img src="../../../../../assets/bill_logo.png" />
						<h1 class="pay_comp_name"> {{info.settleCompName}} </h1>
					</div>
					<div class="title">
						<div class="base-item base-item-apply-no-left" >{{$t('PayApplyList.nthPrint1')}}{{ info.printCount ? info.printCount - 1 : 0 }}{{$t('PayApplyList.nthPrint2')}}</div>
						<h1>{{$t('PayApplyList.refundApplyOrder')}}</h1><!-- 退款申请单 -->
						<div class="base-item base-item-apply-no">{{$t('PayApplyList.refundApplyNo')}}：{{ info.applyNo }}</div><!-- 退款申请单号 -->
					</div>
					<div class="print-info-box-div"> 
						<table width="100%" border="0" cellspacing="1" cellpadding="0"> 
							<tr> 
								<td class="item-title-td"  style="width:11%">{{$t('OrderFee.settleCorpName')}}</td><!-- 结算单位 -->
								<td class="item-contnet-td">{{ info.settleCorpName }}</td> 
								<td class="item-title-td"  style="width:11%">{{$t('PayApplyList.receivableRegNo')}}</td><!-- 收款登记号 -->
								<td class="item-contnet-td">{{ info.receivableRegNo }}</td> 
								<td class="item-title-td" style="width:11%">{{$t('PayApplyList.transferFeeDeductWay')}}</td><!-- 手续费扣除方式 -->
								<td class="item-contnet-td">{{dictMapObj.changeType[ info.transferChargeType ] }}</td> 
							</tr> 
							<tr> 
								<td class="item-title-td">{{$t('PayApplyList.bdEmployeeName')}}</td><!-- 业务员 -->
								<td class="item-contnet-td">{{ info.employeeName }}</td> 
								<td class="item-title-td">{{$t('PayApplyList.refundCurrency')}}</td><!-- 退款币种 -->
								<td class="item-contnet-td">{{ info.refundCurrency }}</td> 
								<td class="item-title-td">{{$t('PayApplyList.refundAmt')}}</td><!-- 退款金额 -->
								<td class="item-contnet-td">{{ info.receiveRefundAmt }}</td> 
							</tr> 
							<tr> 
								<td class="item-title-td">{{$t('PayApplyList.recvAccountName')}}</td><!-- 对方户名 -->
								<td class="item-contnet-td">{{ info.recvAccountName }}</td> 
								<td class="item-title-td">{{$t('PayApplyList.recvBankName')}}</td><!-- 对方开户行 -->
								<td class="item-contnet-td">{{ info.recvBankName }}</td> 
								<td class="item-title-td">{{$t('PayApplyList.recvAccountNo')}}</td><!-- 对方账号 -->
								<td class="item-contnet-td">{{ info.recvAccountNo }}</td> 
							</tr> 
							<tr> 
								<td class="item-title-td">{{$t('PayApplyList.payAccountName')}}</td><!-- 我司开户行 -->
								<td class="item-contnet-td">{{ info.payAccountName }}</td> 
								<td class="item-title-td">{{$t('PayApplyList.payBankName')}}</td><!-- 我司开户行 -->
								<td class="item-contnet-td">{{ info.payBankName }}</td> 
								<td class="item-title-td">{{$t('PayApplyList.payAccountNo')}}</td><!-- 我司账号 -->
								<td class="item-contnet-td">{{ info.payAccountNo }}</td> 
							</tr> 
							<tr> 
								<td class="item-title-td">{{$t('PayApplyList.refundRemark')}}</td><!-- 退款说明 -->
								<td colspan="5" style="width:11em;word-wrap:break-word;word-break: break-all;">{{ info.remark }}</td> 
							</tr>
						</table> 
					</div>
					<div class="print-info-box" style="margin-top:24px;">
						<template>
							<div class="base-item">{{$t('PayApplyList.createdTime')}}：{{ info.createdTime }}</div><!-- 申请日期 -->
							<div class="base-item">{{$t('OrderFee.approvalTime')}}：{{ info.confirmTime }}</div><!-- 审核时间 -->
							<div class="base-item">{{$t('PayApplyList.supervisorSignature')}}：{{ }}</div><!-- 主管签字 -->
							<div class="base-item">{{$t('PayApplyList.createdName')}}：{{ info.createdName }}</div><!-- 申请人 -->
							<div class="base-item">{{$t('OrderFee.approver')}}：{{ info.confirmName }}</div><!-- 审核人 -->
							<div class="base-item">{{$t('PayApplyList.paymentBankslip')}}：{{ info.payBankseqFile }}</div><!-- 客户付款水单 -->
							<div class="base-item">{{$t('PayApplyList.refundLetter')}}：{{ info.payProxyFile }}</div><!-- 退款委托书 -->
						</template>
					</div>	
				</div>
				<div v-if="checkedPrint">
					<div style="width:1020px;margin-top:32px;" v-for="(it,index) in info.trustImgFileNoList" :key="index">
						<img class="" width="1020" :src="it.completeTask"  style="border:none" />
						<!-- <iframe id="preview" class="" height="790" width="1020" :src="it.completeTask"  style="border:none">
						</iframe> -->
					</div>
				</div>
			</div>
			<div id="printPayOrder" v-show="isPrint">
				<div class="finance-payRefundPrint-print-cnt">
					<div class="logo">
						<img src="../../../../../assets/bill_logo.png" />
						<h1 class="pay_comp_name"> {{info.settleCompName}} </h1>
					</div>
					<div class="title">
						<div class="base-item base-item-apply-no-left" >{{$t('PayApplyList.nthPrint1')}}{{ info.printCount ? info.printCount : 0 }}{{$t('PayApplyList.nthPrint2')}}</div>
						<h1>{{$t('PayApplyList.refundApplyOrder')}}</h1>
						<div class="base-item base-item-apply-no">{{$t('PayApplyList.refundApplyNo')}}：{{ info.applyNo }}</div>
					</div>
					<div class="print-info-box-div"> 
						<table width="100%" border="0" cellspacing="1" cellpadding="0"> 
							<tr> 
								<td class="item-title-td"  style="width:11%">{{$t('PayApplyList.settleCorpName')}}</td><!-- 结算单位 -->
								<td class="item-contnet-td">{{ info.settleCorpName }}</td> 
								<td class="item-title-td"  style="width:11%">{{$t('PayApplyList.receivableRegNo')}}</td><!-- 收款登记号 -->
								<td class="item-contnet-td">{{ info.receivableRegNo }}</td> 
								<td class="item-title-td" style="width:11%">{{$t('PayApplyList.transferFeeDeductWay')}}</td><!-- 手续费扣除方式 -->
								<td class="item-contnet-td">{{dictMapObj.changeType[ info.transferChargeType ] }}</td> 
							</tr> 
							<tr> 
								<td class="item-title-td">{{$t('PayApplyList.bdEmployeeName')}}</td><!-- 业务员 -->
								<td class="item-contnet-td">{{ info.employeeName }}</td> 
								<td class="item-title-td">{{$t('PayApplyList.refundCurrency')}}</td><!-- 退款币种 -->
								<td class="item-contnet-td">{{ info.refundCurrency }}</td> 
								<td class="item-title-td">{{$t('PayApplyList.refundAmt')}}</td><!-- 退款金额 -->
								<td class="item-contnet-td">{{ info.receiveRefundAmt }}</td> 
							</tr> 
							<tr> 
								<td class="item-title-td">{{$t('PayApplyList.recvAccountName')}}</td><!-- 对方户名 -->
								<td class="item-contnet-td">{{ info.recvAccountName }}</td> 
								<td class="item-title-td">{{$t('PayApplyList.recvBankName')}}</td><!-- 对方开户行 -->
								<td class="item-contnet-td">{{ info.recvBankName }}</td> 
								<td class="item-title-td">{{$t('PayApplyList.recvAccountNo')}}</td><!-- 对方账号 -->
								<td class="item-contnet-td">{{ info.recvAccountNo }}</td> 
							</tr> 
							<tr> 
								<td class="item-title-td">{{$t('PayApplyList.payAccountName')}}</td><!-- 我司开户行 -->
								<td class="item-contnet-td">{{ info.payAccountName }}</td> 
								<td class="item-title-td">{{$t('PayApplyList.payBankName')}}</td><!-- 我司开户行 -->
								<td class="item-contnet-td">{{ info.payBankName }}</td> 
								<td class="item-title-td">{{$t('PayApplyList.payAccountNo')}}</td><!-- 我司账号 -->
								<td class="item-contnet-td">{{ info.payAccountNo }}</td> 
							</tr> 
							<tr> 
								<td class="item-title-td">{{$t('PayApplyList.refundRemark')}}</td><!-- 退款说明 -->
								<td colspan="5" style="width:11em;word-wrap:break-word;word-break: break-all;">{{ info.remark }}</td> 
							</tr>
						</table> 
					</div>
					<div class="print-info-box" style="margin-top:24px;">
						<template>
							<div class="base-item">{{$t('PayApplyList.createdTime')}}：{{ info.createdTime }}</div><!-- 申请日期 -->
							<div class="base-item">{{$t('OrderFee.approvalTime')}}：{{ info.confirmTime }}</div><!-- 审核时间 -->
							<div class="base-item">{{$t('PayApplyList.supervisorSignature')}}：{{ }}</div><!-- 主管签字 -->
							<div class="base-item">{{$t('PayApplyList.createdName')}}：{{ info.createdName }}</div><!-- 申请人 -->
							<div class="base-item">{{$t('OrderFee.approver')}}：{{ info.confirmName }}</div><!-- 审核人 -->
							<div class="base-item">{{$t('PayApplyList.bankSlip')}}：{{ info.payBankseqFile }}</div><!-- 客户付款水单 -->
							<div class="base-item">{{$t('PayApplyList.refundLetter')}}：{{ info.payProxyFile }}</div><!-- 退款委托书 -->
						</template>
					</div>	
				</div>
				<div v-if="checkedPrint">
					<div class="finance-payRefundPrint-print-cnt" style="height: 1568px;margin-top:12px" v-for="(it,index) in info.trustImgFileNoList" :key="index">
						<img class="" width="1020" :src="it.completeTask" :alt="it"  style="border:none" />
					</div>
				</div>
			</div>
			<div class="print-btn-box">
				<el-checkbox v-model="checkedPrint">{{$t('PayApplyList.isPrintAttach')}}</el-checkbox><!-- 是否打印附件 -->
				<el-button
					class="finance-btn"
					type="primary"
					size="mini"
					v-print="printObj"
					>{{$t('PayApplyList.print')}}</el-button
				>
				<el-button class="finance-btn" size="mini" @click="cancel"
					>{{$t('Common.back')}}</el-button
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
import { payApplyReceiveRefundQueryPrintInfo, payApplyReceiveRefundPrintConfirm } from '@/api/fin/receivableReg'

export default {
	mixins: [mixin, routerMixin],
	components: {
		FinanceTableMass
	},
	data () {
		return {
			checkedPrint:false,
			payOrderNo: '',
			applyNo: '',
			payApplyReceiveRefundIds: [],
			info: {},
			isPrint: false,
			printObj: {
				id: "printPayOrder",
				popTitle: this.$t('PayApplyList.refundApplyOrder'), // '退款申请单',
				type: "html",
				extraCss: '',
				printCallback: this.printCallback,
				printCallbackBefore: this.printCallbackBefore,
				// extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>'
			},
			option1: {},
			columns1: [ // 此页面未使用
				{
					prop: 'bdName',
					label: this.$t('FeeList.bdEmployeeId'),
					type: 'text',
				},
				{
					prop: 'settleCorpName',
					label: this.$t('FeeList.settleCorp'),
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
					prop: 'feeEnName',
					label: this.$t('FeeList.feeEname'),
					type: 'text',
				},
				{
					prop: 'originalCurrency',
					label: this.$t('Settle.settleCurrency'),
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
					label: this.$t('FeeList.invoiceNo'),
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
			columns2: [ // 此页面未使用
				{
					prop: 'bdName',
					label: this.$t('FeeList.bdEmployeeId'),
					type: 'text',
				},
				{
					prop: 'settleCorpName',
					label: this.$t('FeeList.settleCorp'),
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
					prop: 'feeEnName',
					label: this.$t('FeeList.feeEname'),
					type: 'text',
				},
				{
					prop: 'originalCurrency',
					label: this.$t('FeeList.currency'),
					type: 'text',
				},
				{
					prop: 'settleAmt',
					label: '请款金额',
					type: 'text',
				},
				{
					prop: 'settleExRate',
					label: this.$t('Settle.settleExRate'),
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
		this.payApplyReceiveRefundIds = this.$route.query.payApplyReceiveRefundIds
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
				payApplyReceiveRefundIds: [ this.payApplyReceiveRefundIds ]
			}
			payApplyReceiveRefundQueryPrintInfo(data).then(res => {
        let resData = res.data[0]
        let {trustFileList: fileList} = resData
        resData.payBankseqFile = fileList.filter(item => item.trustFileType === 'payBankseqFile').map(v=>v.trustFileName).toString()
        resData.payProxyFile = fileList.filter(item => item.trustFileType === 'payProxyFile').map(v=>v.trustFileName).toString()
				this.info = resData
				let trustFileList = []
				fileList.forEach(item=>{
        // 打标记方便后面改回来,  nameToSowollForViewImg
					if(item.trustImgFileNo){
						trustFileList.push({completeTask:`/base/fileView/preview/${item.trustImgFileNo}/sowoll`})
							// { completeTask:`/base/fileView/preview/${item.trustImgFileNo}/${item.trustFileName}`}
					}
					
				})
				this.info.trustImgFileNoList = trustFileList
				console.log(this.info);
				if (this.info.orderType === 'special_refund') {
					this.option1.columns = this.columns2
				} else {
					this.option1.columns = this.columns1
				}
				this.option1.data = res.data.settleOrderFeeList || []
			}).catch(() => {
				this.delVisitedView()
          		this.cancel()
			 })
		},
		// 打印次数统计
		printCallback () {
			this.isPrint = false
			let payApplyReceiveRefundIds = [ this.info.payApplyReceiveRefundId ]
			payApplyReceiveRefundPrintConfirm({ payApplyReceiveRefundIds: payApplyReceiveRefundIds }).then(res => { 
				this.getData()
			}).catch(() => { })
		},
    printCallbackBefore(fn){
      this.printCallbackBeforeCommon(this.info.printCount, () => this.isPrint = true, fn, () => this.isPrint = false)
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
.finance-payRefundPrint-print-cnt {
  width: 1020px;
  padding-top: 20px;
  font-size: 14px;
  page-break-before: auto;
  page-break-after: always;
}
.finance-payRefundPrint-print-cnt .logo {
  padding-top: 5px;
  padding-bottom: 0px;
  border-bottom: 1px solid #d8d8d8;
  position: relative;
}
.finance-payRefundPrint-print-cnt .logo img{
	position: absolute;
	top: 16px;
    
}
.finance-payRefundPrint-print-cnt .logo .pay_comp_name{
	font-size: 20px;
	font-weight: 500;
	color: #222222;
	text-align: center;
}
.finance-payRefundPrint-print-cnt .title {
  margin: 20px 0;
}
.finance-payRefundPrint-print-cnt .title {
  margin: 20px 0;
}
.finance-payRefundPrint-print-cnt .title h1 {
  font-size: 20px;
  font-weight: 600;
  color: #222222;
  text-align: center;
}
.finance-payRefundPrint-print-cnt .print-info-box {
  display: flex;
  flex-wrap: wrap;
}
.finance-payRefundPrint-print-cnt .print-info-box .base-item {
  flex: 1;
  flex-basis: calc(33% - 24px);
  margin-bottom: 10px;
  margin-right: 24px;
}
.finance-payRefundPrint-print-cnt .print-table {
  /* margin-top: 10px; */
}
.finance-payRefundPrint-print-cnt .print-table .finance-table{
	padding:0
}
.finance-payRefundPrint-print-cnt .print-table-total {
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
.finance-payRefundPrint-print-cnt .print-table-total .text {
  flex: 1;
  text-align: right;
}
.finance-payRefundPrint-print-cnt .print-table-total .total-box {
  min-width: 400;
}
.finance-payRefundPrint-print-cnt .print-table-total .total-box .total-item {
  margin-left: 15px;
}
.finance-payRefundPrint-print-cnt .print-apply-info {
  margin-top: 30px;
  display: flex;
  flex-wrap: wrap;
}
.finance-payRefundPrint-print-cnt .print-apply-info .base-item {
  width: 25%;
  margin-bottom: 10px;
}

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
  padding: 0;
}
</style>

<style lang="scss">
// .finance-payorder-print .el-checkbox .el-checkbox__label{
//   padding-left: 2px !important;
//   font-size: 12px !important;
// }
.finance-payRefundPrint-print-cnt {
	.finance-table {
		.finance-el-table {
			padding: 8px 0;
		}
	}
	.base-item-apply-no{
		float: right;
		margin-top: -32px;
	}
	.finance-table .el-table th {
		-webkit-print-color-adjust: exact !important;
	}
  	.print-info-box-div{ width:100%} 
	.print-info-box-div table{ background:#CCC;} 
	.print-info-box-div table td{ background:#FFF;padding:8px 4px;} 
	.print-info-box-div table .item-title-td{
		width: 12%; // 8%;
		background: #F0F1F3;
	}
	.print-info-box-div table .item-contnet-td{
		width: 21%; // 24%;
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
		background: #F0F1F3 !important;
	}
	.print-info-box-div tr td,
  	.print-info-box-div tr th {
    	border: 1px solid #000;
    	color: #000;
  	}
}
</style>