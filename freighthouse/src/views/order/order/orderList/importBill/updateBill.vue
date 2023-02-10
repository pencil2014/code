<template>
	<el-dialog @close="handleClose" title="导入账单" :visible="dialogOrderShow" width="952px">
		<div class="si-import-bill">
			<el-form ref="orderImportForm" :model="orderImportForm" :inline="true" label-width="100px" size="mini" :rules="orderImportRegRules">
				<el-form-item label="账单号:" prop="billNo">
					<el-input v-model="billNo" disabled></el-input>
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
					<FinanceUploadEmbed ref="orderUpload" :upload-api="uploadApi" :upload-params="uploadParams" @close="closeDialog" @getFileList="getFileList" @send-res-file-list="sendResFileList" />
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

export default {
	filters: {},
	data() {
		return {
			orderImportForm: {
				fileNo: '',
				fileName: ''
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
			fileList: []
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
		}
	},
	created() {},
	mounted() {},
	activated() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	components: {
		FinanceUploadEmbed
	},
	watch: {},
	methods: {
		getFileList(val) {
			this.fileList = val
			val && (this.orderImportForm.fileNo = val[0].uid)
		},
		handleClose() {
			this.$emit('close')
		},

		// 提交修改新增账单
		submitOrder() {
			if (this.fileList.length == 0) {
				return this.$message.warning('请先上传附件!')
			}
			this.$refs.orderImportForm.validate(valid => {
				if (valid) {
					this.uploadParams = {
						 billNo: this.billNo
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
			this.$refs.orderImportForm.resetFields()
			this.$refs.orderUpload.fileList = []
			this.fileList = []
			this.orderImportForm = {
				fileNo: '',
				fileName: ''
			}
			if (val === 'success') {
				this.$parent.getData()
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
