<template>
	<div class="finance-page">
		<div class="finance-list-container">
			<div class="money-box money-box-border-bottom">
				<div class="money-box-left">
					<div class="money-title">账单确认详情</div>
				</div>
				<div class="money-box-right">
					<el-button-group>
						<el-button class="finance-btn" size="mini" @click="cancel"
							>返回</el-button
						>
					</el-button-group>
				</div>
			</div>
			<div class="confirm-info-box">
				<div class="info-cnt-item">
					<div class="info-cnt-title">账单信息</div>
					<div class="info-cnt-box">
						<DetailDiv style="width:268px" label="账单确认编号：" :content="info.billNo" :isTooltip="true"/>
						<!-- <div class="base-item">
							<span class="sub-title">账单类型：</span
							>{{ info.billType === "SHIP" ? "大船" : "驳船+大船" }}
						</div>
						<div class="base-item">
							<span class="sub-title">收到账单时间：</span>{{ info.billDate }}
						</div> -->
						<DetailDiv style="width:268px" label="工作单号：" :content="info.orderNo" :isTooltip="true"/>
						<!-- <div class="base-item">
							<span class="sub-title">确认状态：</span
							>{{ info.dnCheckStatus | formatConfirm }}
						</div> -->
						<DetailDiv style="width:268px" label="订舱代理：" :content="info.bkgAgentSupplierName" :isTooltip="true"/>
						<DetailDiv style="width:268px" label="商务：" :content="info.dnCheckEmployeeName" :isTooltip="true"/>
						<DetailDiv style="width:268px" label="工号：" :content="info.dnCheckEmployeeId" />
						<!-- <div class="base-item">
							<span class="sub-title">单号类型：</span
							>{{ info.inputNoType | formatBiz }}
						</div>
						<div class="base-item">
							<span class="sub-title">单号：</span
							>{{ info.inputNo }}
						</div> -->
						<!-- <div class="base-item">
							<span class="sub-title">创建人：</span>{{ info.createdName }}
						</div>
						<div class="base-item">
							<span class="sub-title">创建时间：</span>{{ info.createdTime }}
						</div>
						<div class="base-item">
							<span class="sub-title">确认人：</span
							>{{ info.dnCheckEmployeeName }}
						</div>
						<div class="base-item">
							<span class="sub-title">确认时间：</span>{{ info.dnCheckTime }}
						</div> -->
						<!-- <DetailDiv style="width:268px" label="失败原因：" :content="dictMapObj.dnRefuseReason[info.dnRefuseReason]" :isTooltip="true"/>
						<DetailDiv style="width:268px" label="商务备注：" :content="info.dnRefuseRemark" :isTooltip="true"/>
						<DetailDiv style="width:268px" label="单证备注：" :content="info.dnCheckApplyRemark" :isTooltip="true"/> -->

						<!-- <div class="base-item">
							<span class="sub-title">账单：</span
							>
							<div style="display:inline-block;vertical-align:middle;cursor:pointer;width:160px;">
								<ColumnTipIntegration :item="fileNameColumn" :row="fileNameColumnTipRow" />
							</div>
						</div> -->
					</div>
					<FinanceTable :option="option1" />
				</div>
				<div class="info-cnt-item">
					<div class="info-cnt-title">船次信息</div>
					<div class="info-cnt-box">
						<DetailDiv style="width:268px" label="航线：" :content="info.sysLineName" />
						<DetailDiv style="width:268px" label="驳船收货地：" :content="info.porPortName" :isTooltip="true"/>
						<DetailDiv style="width:268px" label="大船截关时间：" :content="info.cyCutOff" />
						<DetailDiv style="width:268px" label="大船船名：" :content="info.vessel" :isTooltip="true"/>
						<DetailDiv style="width:268px" label="大船船次：" :content="info.voyage" />
						<DetailDiv style="width:268px" label="大船起运港：" :content="info.polPortName" :isTooltip="true"/>
						<DetailDiv style="width:268px" label="大船目的港：" :content="info.podPortName" :isTooltip="true"/>
					</div>
					<!-- <FinanceTable :option="option0" /> -->
				</div>
				<div class="info-cnt-item" v-show="info.shBillLienList">
					<div class="info-cnt-title">
						专项费用
					</div>
					<FinanceTable :option="option2" />
				</div>
				<!-- <div class="info-cnt-item" v-show="option3.data.length">
					<div class="info-cnt-title">
						失效的账单附件信息
					</div>
					<FinanceTableMass :option="option3" />
				</div> -->
			</div>
		</div>
	</div>
</template>

<script>
import { officePreview } from '@/utils/office'
import { mapGetters } from 'vuex'
import FinanceTable from "@/views/finance/components/financeTable/financeTable"
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from "@/views/finance/orderFee/orderFee/mixin"
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { routerMixin } from "@/views/finance/mixins/routerMixin"
import { shBillInfo, listInvalidBillFile } from '@/api/fin/shBill'
import { querySpecialFeeItemList } from '@/api/fin/feeitem'
import Vue from 'vue'
import ColumnTipIntegration from '@/views/finance/components/financeColumnTip/columnTipIntegration'
let FEELIST = [] // 费用
export default {
	components: {
		FinanceTable,
		FinanceTableMass,
		ColumnTipIntegration
	},
	mixins: [mixin, mixin2, routerMixin],
	data () {
		return {
			billNo: '',
			info: {},
			option0: {},
			option1: {},
			option2: {},
			fileNameColumn: {},
			fileNameColumnTipRow: {}
		}
	},
	computed: {
		...mapGetters(['dictMap'])
	},
	created () {
		this.billNo = this.$route.query.billNo
		this.option0 = Object.assign({}, this.option, {
			id: "option0", $name: 'ConfirmBillDetail0',
			tips: {
				text: "",
				show: false,
			},
			index: true,
			selection: false,
			operationBtns: false,
			pagination: false,
		})
		let columns0 = [
			{
				prop: "vessel",
				label: "原船名",
				type: "text",
			},
			{
				prop: "voyage",
				label: "原船次",
				type: "text",
			}
		]
		this.option0.columns = columns0
		this.option1 = Object.assign({}, this.option, {
			id: "option1", $name: 'ConfirmBillDetail1',
			tips: {
				text: "",
				show: false,
			},
			index: true,
			selection: false,
			operationBtns: false,
			pagination: false,
		})
		let columns1 = [
			{
				prop: 'billType',
				label: '账单类型',
				type: 'select',
				propInDict: 'shBillType'
			},
			{
				prop: 'inputNoType',
				label: '单号类型',
				type: 'select',
				propInDict: 'billInputNoType'
			},
			{
				prop: 'billDate',
				label: '收到账单时间',
				type: 'text',
				width: 110
			},
			{
				prop: 'inputNo',
				label: '单号',
				type: 'text', // 'columnTip',
				width: 120,
			},
			{
				prop: 'billTypeStatus',
				label: '账单状态',
				type: 'text',
				formatter: (row) => {
					if (row.billTypeStatus === 'no' ) {
						return '<span style="color:#CD4130">失效</span>'
					}else{
						return '<span style="color:#33B18A">有效</span>'
					}
				},
			},
			{
				prop: 'dnBillType',
				label: '附件类型',
				type: 'select',
				propInDict: 'blFileType'
			},
			{
				prop: 'billDateCheckLast',
				label: '最晚确认时间',
				type: 'text',
				width: 110
			},
			{
				prop: 'fileName',
				label: '账单',
				width: 160,
				type: 'columnTip',
				component: 'ColumnTip',
				componentProps: {
				show: false,
				data: [],
				row: {},
				callback: (no, {row}, index, ) => {
					let fileNo = row.fileNo.split(',')[index]
          let name = row.fileName_multiValue[index]
          officePreview({fileNo,name})
					// this.handleBankseqFileNo(fileNo)
				},}
			},
			{
				prop: 'dnRefuseReason',
				label: '失败原因',
				type: 'select',
				propInDict: 'dnRefuseReason'
			},
			{
				prop: 'dnCheckStatus',
				label: '确认状态',
				type: 'text',
				formatter:(row)=>{
				if (row.dnCheckStatus === 'submit') {
					return '<span style="color:#EDB534">待确认</span>'
					} else if (row.dnCheckStatus === 'pass') {
						return '<span style="color:#33B18A">已通过</span>'
					} else if(row.dnCheckStatus === 'refuse'){
						return '<span style="color:#CD4130">确认失败</span>'
					}else{
						return row.dnCheckStatus
					}
				}
			},
			{
				prop: 'createdName',
				label: '创建人',
				type: 'text'
			},
			{
				prop: 'createdTime',
				label: '创建时间',
				type: 'text',
				width: 150
			},
			{
				prop: 'dnCheckEmployeeName',
				label: '确认人',
				type: 'text',
				width: 90
			},
			{
				prop: 'dnCheckTime',
				label: '确认时间',
				type: 'text',
				width: 150
			},
			{
				prop: 'dnRefuseRemark',
				label: '商务备注',
				type: 'text',
				width: 150
			},
			{
				prop: 'dnCheckApplyRemark',
				label: '单证备注',
				type: 'text',
				width: 150
			},
			{
				prop: 'cancelRemark',
				label: '撤销原因',
				type: 'text',
				width: 130
			},
		]
		this.option1.columns = columns1
		this.option2 = Object.assign({}, this.option, {
			id: 'option2', $name: 'ConfirmBillDetail2',
			data: [],
			tips: false,
			operationBtns: false,
			selection: false,
			columns: [
				{
					prop: "feeCode",
					label: "费用名称",
					type: "select",
					selectOptions: FEELIST,
        			r: true,
				},
				{
					prop: "currency",
					label: "币种",
					type: "text",
				},
				{
					prop: "feeAmt",
					label: "金额",
					type: "text",
				},
				{
					prop: "shLienMonNo",
					label: "月度编号",
					type: "button",
					operationBtns: {
						show: true,
						callback: (fn, index, row, option) => {
							this.goSummaryDetail(row)
						},
					},
				},
			]
		})
		this.option3 = Object.assign({}, this.option, {
			id: 'option3', $name: 'ConfirmBillDetail3',
			data: [],
			tips: false,
			operationBtns: false,
			selection: false,
			columns: [
				{
					prop: 'orderNo',
					label: '工作单号',
					type: 'button',
					width: 125,
						operationBtns: {
						show: true,
						callback: (fn, index, row, option, subItem) => {
							// this.showOneNoDetail('order', row.orderNo, { feeChild: 'specialManagementFee' })
							this.showOneNoDetail('order', row.orderNo, { feeChild: 'specialManagementFee', isFromSea: true })
						}
					}
				},
				{
					prop: "blId",
					label: "提单号",
					type: "text",
				},
				// {
				// 	prop: "fileModule",
				// 	label: "模块",
				// 	type: "text",
				// },
				{
					prop: "retrieveStatus",
					label: "取单状态",
					type: "select",
					propInDict: 'blRetrieveStatus'
				},
				{
					prop: "retrieveFinishTime",
					width:110,
					label: "取单完成时间",
					type: "text",
				},
				{
					prop: "putStatus",
					label: "提单放单状态",
					width:110,
					type: "select",
					propInDict: 'blPutStatus'
				},
				{
					prop: "putFinishTime",
					width:110,
					label: "放单完成时间",
					type: "text",
				},
				{
					prop: "remark",
					label: "备注",
					type: "text",
				},
				{
					prop: "isValid",
					label: "是否有效",
					type: "select",
					formatter: ({ cellValue }) => {
					  const text = {
					    draft: '--',
					    y: '是',
					    n: '否',
					    yes: '是',
					    no: '否',
					  }
					  const key = cellValue
					  return text[key]
					}
				},
				{
					prop: "fileName",
					label: "文件名称",
					width: 160,
					type: 'columnTip',
					component: 'ColumnTip',
					componentProps: {
						show: false,
						data: [],
						row: {},
						callback: (no, componentProps, index, row) => {
							let fileNo = row.fileNo.split(',')[index]
							const href = `/base/fileView/preview/${fileNo}/sowoll`
      						window.open(href)
						},
					},
				},
				{
					prop: "invalidTime",
					label: "失效时间",
					type: "text",
				},
				{
					prop: "invalidReason",
					label: "失效原因",
					type: "text",
				},
				{
					prop: 'createdName',
					label: '创建人',
					type: 'text'
				},
				{
					prop: 'createdTime',
					label: '创建时间',
					type: 'text',
					width: 150
				},
				{
					prop: 'updatedName',
					label: '更新人',
					type: 'text',
					width: 90
				},
				{
					prop: 'updatedTime',
					label: '更新时间',
					type: 'text',
					width: 150
				},

				]
		})
		this.fileNameColumn = {
			prop: 'fileName',
			component: 'ColumnTip',
			componentProps: {
				show: false,
				data: [],
				row: {},
				callback: (no, componentProps, index, row) => {
					let fileNo = row.fileNo.split(',')[index]
          let name = row.fileName_multiValue[index]
					officePreview({fileNo,name})
				},
			}
		}
	},
	filters: {
		formatConfirm (val) {
			let text = {
				'draft': '--',
				'submit': '待确认',
				'pass': '已通过',
				'refuse': '确认失败'
			}
			return text[val]
		},
		formatBiz (val) {
			return val === 'BL' ? '提单号' : 'SO号'
		}
	},
	methods: {
		// 获取账单详情
		getShBillInfo () {
			this.option1.data = []
			let data = {
				billNo: this.billNo
			}
			shBillInfo(data).then(res => {
				this.info = res.data
				let { fileName, fileNo } = res.data
				this.fileNameColumnTipRow = { fileName_multiValue: fileName ? fileName.split(',') : [], fileNo }
				let list = [ Object.assign(res.data,{fileName_multiValue: res.data.fileName.split(',')}) ]
				this.option1.data.push({... res.data })
				this.option0.data = [{... res.data} ]
				this.listInvalidBillFile()
				this.option2.data = res.data.shBillLienList
			}).catch(() => { })
		},
		listInvalidBillFile(){
			let data = this.billNo
			listInvalidBillFile(data).then(res=>{
				res.data.forEach(item => {
					item.fileName_multiValue = item.fileName.split(',')
					item.billTypeStatus = 'no'
					item.dnCheckApplyRemark = item.remark
					item.dnRefuseReason=''
					item.dnCheckStatus=''
					item.createdName=''
					item.createdTime=''
					item.dnCheckEmployeeName=''
					item.dnCheckTime=''
					this.option1.data.push({...this.option1.data[0],...item})
				})
			})
			querySpecialFeeItemList({ feeClassCode: 'supplier_special' }).then((res) => {
				res.data.forEach((item) => {
					FEELIST.push({ ...item, value: item.feeCode, label: item.feeName })
				})
			})
		},
		// 匹配错误原因
		getDnRefuseReason (val) {
			let text = ''
			if (val) {
				let obj = this.dictMap['dnRefuseReason'].find(item => item.value === val)
				text = obj.label || ''
			}
			return text
		},
		// 下载文件
		downloadFile () {
			let { fileName, fileNo } = this.info
			this.$store.dispatch('finance/downloadBlobFile', {
				uri: '/base/webapi/file/download',
				params: {
					fileNo
				}
			}).then(res => {
				let link = document.createElement("a")
				link.href = window.URL.createObjectURL(res)
				link.download = fileName || '账单下载'
				link.click()
			})
		},
		handleBankseqFileNo(fileNo) {
      const href = `/base/fileView/preview/${fileNo}/sowoll`
      window.open(href)
    },
		// 挑战月度账单详情
		goSummaryDetail (item) {
			Vue.prototype.$NotRouteBeforeRouteLeave = (to, from) => {
				this.commonRoute(to, from)
			}
			let query = {
				shLienMonNo: item.shLienMonNo,
			}
			this.routerPush("SummaryBillDetail", query)
		},
		// 返回
		cancel () {
			this.routerBack()
		},
	},
	// mounted () {
	// 	this.getShBillInfo()
	// },
	activated () {
		this.billNo = this.$route.query.billNo
		this.getShBillInfo()
	}
}
</script>

<style lang="scss" scoped>
.money-box-border-bottom {
	border-bottom: 1px solid #e9e9e9;
}
.confirm-info-box {
	.info-cnt-item {
		.info-cnt-title {
			padding: 0 10px;
			font-size: 14px;
			font-weight: 600;
			margin: 20px 0;
		}
		.info-cnt-box {
			padding: 0 10px;
			display: flex;
			flex-wrap: wrap;
			margin-bottom: 20px;
			&.list {
				margin-bottom: 0;
			}
			.base-item {
				flex-basis: calc(25% - 10px);
				margin-bottom: 10px;
				margin-right: 10px;
				.sub-title {
					min-width: 90px;
					text-align: right;
					display: inline-block;
					// text-align-last: justify;
				}
			}
			.link {
				color: #409eff;
				cursor: pointer;
			}
		}
	}
}
.text-over {
	display: inline-block;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
	max-width: 140px;
}
</style>
