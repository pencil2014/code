<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="createForm" :rules="rules" :model="createItem" label-position="right" label-width="90px" class="blDeliveryApprove-form">
			<el-row :gutter="10">
				<el-col :span="12">
					<el-form-item label="收件人" prop="receiveName" :show-message="false">
						<el-input :disabled="disableIput" type="text" :rows="1" placeholder="请输入收件人" v-model="createItem.receiveName"> </el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item label="收件人电话" prop="receivePhone" :show-message="false">
						<el-input  :disabled="disableIput" type="text" :rows="1" placeholder="请输入收件人电话" v-model="createItem.receivePhone"> </el-input>
					</el-form-item>
				</el-col>
			</el-row>
			<el-form-item label="收件方地址" prop="receiveAddress" :show-message="false">
				<el-input maxlength="512"  :disabled="disableIput" type="textarea" :rows="1" placeholder="请输入收件方地址" v-model="createItem.receiveAddress"> </el-input>
			</el-form-item>
			<el-form-item label="寄送备注" prop="receiveRemark" :show-message="false">
				<el-input :disabled="disableIput" type="textarea" :rows="1" placeholder="请输入寄送备注" v-model="createItem.receiveRemark"> </el-input>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { documentReceiveAddress } from '@/api/order/bl'

const defaultCreate = {
	receiveName: '',
	receivePhone: '',
	receiveAddress: '',
	receiveRemark: ''
}

export default {
	data() {
		return {
			disableIput: false,
			oQuery: this.$route.query,
			dialogConfig: {
				title: '放单申请',
				show: true,
				size: 'medium',
				width: '800px'
			},
			blFileTypeOptions: [{ label: '放单保函', value: 'release_guarantee' }],
			createItem: Object.assign({}, defaultCreate),
			rules: {
				receiveName: [{ required: true, message: '请输入收件人', trigger: 'change' }],
				receivePhone: [{ required: true, message: '请输入收件人电话', trigger: 'change' }],
				receiveAddress: [{ required: true, message: '请输入收件方地址', trigger: 'change' }],
				receiveRemark: [{ required: false, message: '请输入寄送备注', trigger: 'change' }]
			},
			canSubmit: true, // 可提交标识
			defaultFileSize: 100, //文件默认不超过100M
			sizeLimit: true,
			file: '',
			processLength: 0,
			// 为邮寄的出单方式:正本,借同行代理,HBL正本,同行借我司代理HBL正本
			isPost: ['original', 'jthdlzb', 'thzb']
		}
	},
	props: {},
	created() {
		this.getHistoryData()
	},

	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	watch: {},
	components: {
		BaseDialog
	},
	methods: {
		getHistoryData() {
			this.createItem = {
				receiveName: '',
				receivePhone: '',
				receiveAddress: '',
				receiveRemark: ''
			}
			documentReceiveAddress({ orderNo: this.$route.query.orderNo }).then(res => {
				if (res.data) {
					this.disableIput = true
					let { data } = res
					this.createItem.receiveName = data.receiveName
					this.createItem.receivePhone = data.receivePhone
					this.createItem.receiveAddress = data.receiveAddress
					this.createItem.receiveRemark = data.receiveRemark
				} else {
					this.disableIput = false
				}
			})
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},

		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.close('Confirm', this.createItem)
			} else {
				this.close('Cancel')
			}
		}
	}
}
</script>

<style lang="scss">
.blDeliveryApprove-form {
	.el-form-item {
		margin-bottom: 4px;
	}
	.el-form-item__label,
	.el-form-item__content {
		line-height: 20px;
	}
	.el-input,
	.el-textarea {
		font-size: 12px;
	}
}
.edit-container .blDeliveryApprove-form .el-textarea__inner {
	padding: 0 5px;
}
</style>
