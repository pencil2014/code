<template>
	<el-dialog @close="handleClose" title="copy件客户确认" :visible="dialogOrderShow" width="952px">
		<div class="copy-file-confirm">
			<el-form ref="orderImportForm" :model="orderImportForm" :inline="true" label-width="140px" size="mini" :show-message="false" :rules="orderImportRegRules">
				<el-form-item label="截copy件确认时间:" prop="copyCutDate">
					<elDatePickerLimit v-model="orderImportForm.copyCutDate" type="date" value-format="yyyy-MM-dd" placeholder="请选择"> </elDatePickerLimit>
				</el-form-item>
				<el-form-item class="import-bill-remark" label="备注" prop="copyRemark">
					<el-input :rows="4" type="textarea" maxlength="512" show-word-limit size="mini" placeholder="请输入" v-model="orderImportForm.copyRemark"></el-input>
				</el-form-item>
			</el-form>
		</div>
		<span slot="footer" class="dialog-footer">
			<el-button type="primary" @click="submitOrder" size="mini">确定</el-button>
			<el-button size="mini" @click="closeDialog">取消</el-button>
		</span>
	</el-dialog>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { blBillInfo, blBillUpload, blNoList, getFileBatchNo } from '@/api/order/bl'

export default {
	filters: {},
	data() {
		return {
			orderImportForm: {
				copyRemark: '',
				copyCutDate: ''
			},
			orderImportRegRules: {
				copyCutDate: [
					{
						required: true,
						message: '最晚确认时间不能为空',
						trigger: 'change'
					}
				]
			}
		}
	},
	props: {
		dialogOrderShow: {
			type: Boolean,
			default: false
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
	components: {},
	watch: {
		dialogOrderShow(val) {
			if (val) {
				let date = new Date()
				this.orderImportForm.copyCutDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, 0)}-${date
					.getDate()
					.toString()
					.padStart(2, 0)}`
			}
		}
	},
	methods: {
		handleClose() {
			this.$emit('close')
		},
		// 提交修改新增账单
		submitOrder() {
			this.$refs.orderImportForm.validate(valid => {
				if (valid) {
					this.$emit('close', 'Confirm', this.orderImportForm)
				}
			})
		},

		// 关闭新增账单弹窗
		closeDialog(val) {
			this.$refs.orderImportForm.resetFields()
			this.orderImportForm = {
				copyCutDate: '',
				copyRemark: ''
			}
			this.$emit('close')
		}
	}
}
</script>
<style lang="scss">
.copy-file-confirm {
	.el-form-item {
		width: 100%;
	}
	.import-bill-remark {
		.el-form-item__content {
			width: 708px;
			textarea {
				// max-height: 120px;
				width: 100% !important;
			}
		}
	}

	.el-form-item__label {
		font-weight: 700;
	}
}
</style>
