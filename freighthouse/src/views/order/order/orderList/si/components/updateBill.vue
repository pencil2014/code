<template>
	<el-dialog @close="handleClose" title="更新账单" :visible="dialogOrderShow" width="952px">
		<div class="si-import-bill">
			<el-form ref="orderImportForm" :model="orderImportForm" :inline="true" label-width="100px" size="mini" :rules="orderImportRegRules">
				<el-form-item label="账单号:" >
					<el-input v-model="billNo" disabled></el-input>
				</el-form-item>
                	<el-form-item label="账单类型:" >
					<el-select  v-model="updateForm.shBillType" placeholder="请选择" disabled>
						<el-option v-for="(op, i) in dictMap['shBillType']" :key="'shBillType' + i" :label="op.label" :value="op.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="收到账单时间:" >
					<elDatePickerLimit v-model="updateForm.billDate" type="date" value-format="yyyy-MM-dd" placeholder="请选择" disabled> </elDatePickerLimit>
				</el-form-item>
				<el-form-item label="单号类型:" >
					<el-select v-model="updateForm.inputNoType" disabled placeholder="请选择">
						<el-option v-for="(op, j) in dictMap['billInputNoType']" :key="'billInputNoType' + j" :label="op.label" :value="op.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="最晚确认时间:" >
					<elDatePickerLimit v-model="updateForm.billDateCheckLast" type="date" value-format="yyyy-MM-dd" placeholder="请选择" disabled> </elDatePickerLimit>
				</el-form-item>
				<el-form-item :label="labelName" >
					<el-input disabled v-model="updateForm.inputNo"  placeholder="请输入" :trigger-on-focus="false" ></el-input>
				</el-form-item>
				<el-form-item label="附件类型" >
					<el-select v-model="updateForm.dnBillType" placeholder="请选择" filterable disabled>
						<el-option v-for="item in dnBillTypeList" :key="item.value" :label="item.label" :value="item.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item  label="大船船名:" prop="vessel">
					<!-- <el-input v-model="orderImportForm.vessel" ></el-input> -->
					<vessel-select 
						v-model="orderImportForm.vessel" 
						:orderNo="form.orderNo" 
						:shipCarrierCode="form.shipCarrierCode" 
						:polPortCode="form.polPortCode" 
						:podPortCode="form.podPortCode"
					/>
				</el-form-item>
				<el-form-item  label="大船航次:" prop="voyage">
					<!-- <el-input v-model="orderImportForm.voyage" ></el-input> -->
					<voyage-select
						v-model="orderImportForm.voyage" 
						:orderNo="form.orderNo" 
						:vessel="form.vessel" 
						:shipCarrierCode="form.shipCarrierCode" 
						:polPortCode="form.polPortCode" 
						:podPortCode="form.podPortCode"
					/>
				</el-form-item>
				<el-form-item v-show="updateForm.shBillType === 'barge_ship'" label="驳船船名:" >
					<el-input v-model="orderImportForm.bargeVessel" ></el-input>
				</el-form-item>
				<el-form-item v-show="updateForm.shBillType === 'barge_ship'" label="驳船航次:" >
					<el-input v-model="orderImportForm.bargeVoyage" ></el-input>
				</el-form-item>
				<el-form-item class="import-bill-remark" label="备注" >
					<el-input type="textarea" autosize size="mini" placeholder="请输入" v-model="orderImportForm.dnCheckApplyRemark" ></el-input>
				</el-form-item>

				<el-form-item label="拿价人" >
					<el-input size="mini" v-model="updateForm.dnCheckEmployeeName" disabled></el-input>
				</el-form-item>
				<el-form-item label="船公司" >
					<el-input size="mini" v-model="updateForm.shipCarrierCode" disabled></el-input>
				</el-form-item>
				<el-form-item label="订舱代理:" >
					<el-input v-model="updateForm.settleCorpName" disabled></el-input>
				</el-form-item>
				<el-form-item label="工作单号:" >
					<el-input v-model="updateForm.orderNo" disabled></el-input>
				</el-form-item>
				<el-form-item label="驳船收货地:" >
					<el-input v-model="updateForm.podName" disabled></el-input>
				</el-form-item>
				<el-form-item label="大船起运港:" >
					<el-input v-model="updateForm.polName" disabled></el-input>
				</el-form-item>
				<el-form-item label="目的地:">
					<el-input v-model="updateForm.podPortName" disabled></el-input>
				</el-form-item>
				<el-form-item label="导入账单:" prop="fileNo" class="invoice-payment-add-form-upload" style="position: relative;width:100%;">
					<el-input
						v-model="orderImportForm.fileNo"
						style="
								position: absolute;
								right: 0;
								top: 0;
								width: 1px;
								height: 1px;
								opacity: 0;
							"
					></el-input>
					<FinanceUploadEmbed ref="orderUpload" :upload-api="uploadApi" :upload-params="uploadParams" @close="closeDialog" @checkSyncBkgAgent="checkSyncBkgAgent" @getFileList="getFileList" @send-res-file-list="sendResFileList" />
				</el-form-item>
			</el-form>
		</div>
		<span slot="footer" class="dialog-footer">
			<el-button type="primary" @click="submitOrder" size="mini">提交</el-button>
			<el-button size="mini" @click="closeDialog">取消</el-button>
		</span>
	</el-dialog>
</template>
<script>
import { mapState } from 'vuex'
import FinanceUploadEmbed from './financeUploadEmbed'
import { blBillInfo, blNoList, getFileBatchNo } from '@/api/order/bl'
import VesselSelect from '@/views/order/order/components/vesselSelect'
import VoyageSelect from '@/views/order/order/components/voyageSelect'

export default {
	filters: {},
	data() {
		return {
			dnBillTypeList: [
				{ label: '海运费账单', value: 'DN' },
				{ label: '亏舱费账单', value: 'DN_BACK' },
				{ label: '返空费账单', value: 'DN_BACK_EMPTY' },
				{ label: '海运改单/柜费账单', value: 'DN_CHANGE' },
				{ label: '本地费用账单', value: 'DN_LOCAL'},
				{ label: '进口账单', value: 'DN_IMPORT_BILL'}
			],
			orderImportForm: {
				fileNo: '',
				fileName: '',
				vessel: '',
				voyage: '',
				bargeVessel: '',
				bargeVoyage: '',
				dnCheckApplyRemark: ''
			},
			rules1: {
                vessel: [
					{
						required: true,
						message: '大船船名不能为空',
						trigger: ['blur', 'change']
					}
				],
				voyage: [
					{
						required: true,
						message: '大船航次不能为空',
						trigger: ['blur', 'change']
					}
				]
			},
			orderImportRegRules: {
				fileNo: [
					{
						required: true,
						message: '附件不能为空',
						trigger: 'change'
					}
				]
			},
			uploadApi: '/order/shipping/bl/bill/updateBillFiles',
			uploadParams: {},
			fileList: [],
			labelName: '',
			updateForm: {
				dnBillType: '',
				shipCarrierCode: '',
				pricingEmployeeId: '',
				dnCheckEmployeeName: '',
				dnCheckApplyRemark: '',
				shBillType: '',
				inputNoType: 'BL',
				inputNo: '',
				billDate: '',
				checkBfDate: '',
				settleCorpName: '',
				orderNo: '',
				polPortName: '',
				podPortName: '',
				podName: '',
				polName: '',
				vessel: '',
				voyage: '',
				bargeVessel: '',
				bargeVoyage: '',
				fileNo: '',
				fileName: '',
				blId: ''
			},
			form: {},
		}
	},
	props: {
		dialogOrderShow: {
			type: Boolean,
			default: false
		},
		billNo: {
			type: String,
			default: ''
		},
		blNo: {
			type: String,
			default: ''
		},
		inputNoType: {
			type: String,
			default: ''
		}
	},
	created() {
		console.log('账单类型：', this.dictMap['shBillType'])
	},
	mounted() {
		this.init()
	},
	activated() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	components: {
		FinanceUploadEmbed,
		VesselSelect,
		VoyageSelect
	},
	watch: {
	
	},
	methods: {
		init() {
			this.updateForm.inputNoType = this.inputNoType
			blBillInfo({ inputNoType: this.updateForm.inputNoType, inputNo: this.blNo, billNo: this.billNo })
			.then(res => {
				let { data } = res
				this.updateForm.shBillType = data.billType === 'SHIP' ? 'ship' : 'barge_ship'
				this.updateForm.dnBillType = data.dnBillType
				this.updateForm.pricingEmployeeId = data.dnCheckEmployeeId
				this.updateForm.dnCheckEmployeeName = data.dnCheckEmployeeName
				this.updateForm.shipCarrierCode = data.shipCarrierCode
				this.updateForm.settleCorpName = data.bkgAgentSupplierName
				this.updateForm.orderNo = data.orderNo
				this.orderImportForm.vessel = data.vessel
				this.orderImportForm.voyage = data.voyage
				this.orderImportForm.bargeVessel = data.bargeVessel
				this.orderImportForm.bargeVoyage = data.bargeVoyage
				this.updateForm.podName = data.porPortName
				this.updateForm.polName = data.polPortName
				this.updateForm.podPortName = data.podPortName
				this.updateForm.blId = data.blId
				this.updateForm.billDate = data.billDate
				this.updateForm.billDateCheckLast = data.billDateCheckLast
				this.updateForm.inputNo = data.inputNo
				this.orderImportForm.dnCheckApplyRemark = data.dnCheckApplyRemark
				if (this.updateForm.inputNoType === 'SO') {
					this.labelName = 'SO号:'
					this.dnBillTypeList = [
						{ label: '亏舱费账单', value: 'DN_BACK' },
						{ label: '船东仓租柜租账单', value: 'DN_WH_CN' },
						{ label: '本地费用账单', value: 'DN_LOCAL'},
					    { label: '进口账单', value: 'DN_IMPORT_BILL'}
					]
				}
				if (this.updateForm.inputNoType === 'BL') {
					this.labelName = '提单号:'
					this.dnBillTypeList = [
						{ label: '海运费账单', value: 'DN' },
						{ label: '亏舱费账单', value: 'DN_BACK' },
						{ label: '返空费账单', value: 'DN_BACK_EMPTY' },
						{ label: '海运改单/柜费账单', value: 'DN_CHANGE' },
						{ label: '本地费用账单', value: 'DN_LOCAL'},
					    { label: '进口账单', value: 'DN_IMPORT_BILL'}
					]
				}
				if(this.updateForm.dnBillType !== 'DN_IMPORT') {
					this.orderImportRegRules = {...this.orderImportRegRules, ...this.rules1}
				}
				this.form = data
			})
			
		},
		getFileList(val) {
			this.fileList = val
			val && (this.orderImportForm.fileNo = val[0].uid)
		},
		handleClose() {
			this.$emit('close')
		},
		trimMethod(val) {
			if (val) {
				return (val + '').trim()
			} else {
				return ''
			}
		},
    checkSyncBkgAgent() {
			this.submitOrder('Y')
		},
		// 提交修改新增账单
		submitOrder(isSyncBkgAgent) {
			if (this.fileList.length == 0) {
				return this.$message.warning('请先上传附件!')
			}
			this.$refs.orderImportForm.validate(valid => {
				if (valid) {
					this.uploadParams = {
						 billNo: this.billNo, 
						 remark: this.orderImportForm.dnCheckApplyRemark,
						 vessel: this.trimMethod(this.orderImportForm.vessel),
						 voyage: this.trimMethod(this.orderImportForm.voyage),
						 bargeVessel: this.trimMethod(this.orderImportForm.bargeVessel),
						 bargeVoyage: this.trimMethod(this.orderImportForm.bargeVoyage),
						 isSyncBkgAgent: isSyncBkgAgent === 'Y' ? 'Y' : 'N'
					}
					setTimeout(() => {
						this.$refs.orderUpload.handleImport()
					}, 500)
					// if (this.fileList.length > 1) {
					// 	getFileBatchNo().then(res => {
					// 		this.uploadParams.fileBatchNo = res.data
					// 		setTimeout(() => {
					// 			this.$refs.orderUpload.handleImport()
					// 		}, 500)
					// 	})
					// } else {
					// 	this.uploadParams.fileBatchNo = ''
					// 	setTimeout(() => {
					// 		this.$refs.orderUpload.handleImport()
					// 	}, 500)
					// }
				}
			})
		},

		// 关闭新增账单弹窗
		closeDialog(val) {
			if (val === 'success') {
				this.$parent.getBillList()
				this.$parent.$refs.fileList.getFileList()
				this.$parent.updateDetail({
                    vessel: this.trimMethod(this.orderImportForm.vessel),
					voyage: this.trimMethod(this.orderImportForm.voyage),
					bargeVessel: this.trimMethod(this.orderImportForm.bargeVessel),
					bargeVoyage: this.trimMethod(this.orderImportForm.bargeVoyage)
				})
			}
			this.$refs.orderImportForm.resetFields()
			this.$refs.orderUpload.fileList = []
			this.fileList = []
			this.orderImportForm = {
				fileNo: '',
				fileName: '',
				vessel: '',
				voyage: '',
				bargeVessel: '',
				bargeVoyage: '',
				dnCheckApplyRemark: ''
			}
			this.$emit('close')
		},
		// 上传附件
		sendResFileList(val) {
			if (val.length) {
				let item = val[0]
				if (item) {
					this.orderImportForm.fileName = item.name
				}
			}
		}
	}
}
</script>
<style lang="scss">
.si-import-bill {
	.el-form-item {
		width: 45%;
	}
	.import-bill-remark {
		width: 90%;
		.el-form-item__content {
			width: 708px;
			textarea {
				max-height: 120px;
				width: calc(100% - 7px) !important;
			}
		}
	}
	.el-form-item__content {
		width: 70%;
	}
	.el-form-item__label {
		font-weight: 700;
	}
	.el-input,
	.el-autocomplete,
	.el-select {
		width: 100% !important;
	}
}
</style>
