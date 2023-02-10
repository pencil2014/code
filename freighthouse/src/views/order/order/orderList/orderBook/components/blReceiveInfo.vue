<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="createForm" :rules="rules" :model="createItem" label-position="right" label-width="115px" class="blDeliveryApprove-form">
			<template>
				<el-row :gutter="10">
					<el-col :span="12">
						<el-form-item label="收件人" prop="receiveName" :show-message="false">
							<div class="receive-name-class">
								<el-input :disabled="disInput" maxlength="128" type="text" class="receive-name-input-class" :rows="1" placeholder="请输入收件人" v-model="createItem.receiveName"> </el-input>
								<el-button type="default" size="mini" class="receive-name-btn-class" @click="selectAddress">选择</el-button>
							</div>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="收件人电话" prop="receivePhone" :show-message="false">
							<el-tooltip effect="dark" v-if="createItem.receivePhone.length > 30" :content="createItem.receivePhone" placement="top">
								<el-input :disabled="disInput" maxlength="128" show-word-limit type="text" :rows="1" placeholder="请输入收件人电话" v-model="createItem.receivePhone"> </el-input>
							</el-tooltip>
							<el-input :disabled="disInput" v-else maxlength="128" show-word-limit type="text" :rows="1" placeholder="请输入收件人电话" v-model="createItem.receivePhone"> </el-input>
						</el-form-item>
					</el-col>
				</el-row>
				<el-form-item label="收件方地址" prop="receiveAddress" :show-message="false">
					<el-input :disabled="disInput" maxlength="512" type="textarea" :rows="1" placeholder="请输入收件方地址" v-model="createItem.receiveAddress"> </el-input>
				</el-form-item>
				<el-form-item label="寄送备注" prop="receiveRemark" :show-message="false">
					<el-input :disabled="disInput" type="textarea" :rows="1" placeholder="请输入寄送备注" v-model="createItem.receiveRemark"> </el-input>
				</el-form-item>
			</template>
		</el-form>
		<div v-if="addressPop">
			<addressModulePop @close="addressPopClose" />
		</div>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { blInputReceive } from '@/api/order/bl'
import addressModulePop from './addressModulePop.vue'

const defaultCreate = {
	orderNo: '',
	blId: '',
	receiveName: '',
	receivePhone: '',
	receiveAddress: '',
	receiveRemark: ''
}

export default {
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '收件人信息',
				show: true,
				size: 'medium',
				width: '800px'
			},
			createItem: Object.assign({}, defaultCreate),
			rules: {
				receiveName: [{ required: true, message: '请输入收件人', trigger: 'change' }],
				receivePhone: [{ required: true, message: '请输入收件人电话', trigger: 'change' }],
				receiveAddress: [{ required: true, message: '请输入收件方地址', trigger: 'change' }],
				receiveRemark: [{ required: false, message: '请输入寄送备注', trigger: 'change' }]
			},
			// 正本为邮寄的出单方式:正本,借同行代理,HBL正本,同行借我司代理HBL正本
			isPost: ['original', 'jthdlzb', 'thzb'],
			addressPop: false
		}
	},
	props: {
		blId: {
			type: Number,
			default: 0
		},

		agreePutQuery: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		this.createItem.receiveAddress = this.agreePutQuery.receiveAddress
		this.createItem.receiveName = this.agreePutQuery.receiveName
		this.createItem.receivePhone = this.agreePutQuery.receivePhone
		this.createItem.receiveRemark = this.agreePutQuery.receiveRemark
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			custInfoObj: state => state.order.custInfoObj,
			orderInfoDataObj: state => state.order.orderInfoDataObj
		}),
		// 已放单且已录入 禁用表单
		disInput() {
			return this.agreePutQuery.putStatus === 'finish' && this.agreePutQuery.isInputReceiver === 'Y'
		}
	},
	watch: {},
	components: {
		BaseDialog,
		addressModulePop
	},
	methods: {
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},

		dialogCallback(action, done) {
			if (this.disInput) return this.close('Cancel')
			if (action.startsWith('Confirm')) {
				this.$refs.createForm.validate(valid => {
					if (valid) {
						this.handleImport()
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},

		handleImport() {
			let data = {
				blId: this.blId,
				orderNo: this.$route.query.orderNo,
				receiveName: this.createItem.receiveName,
				receivePhone: this.createItem.receivePhone,
				receiveAddress: this.createItem.receiveAddress,
				receiveRemark: this.createItem.receiveRemark
			}
			blInputReceive(data).then(res => {
				if (res.code === 0) {
					this.$message.success('录入成功!')
					this.close('Confirm')
				}
			})
		},

		selectAddress() {
			this.addressPop = true
		},
		addressPopClose(action, value) {
			this.addressPop = false
			console.log(value)
			if (action === 'Confirm') {
				this.createItem.receiveName = value.name || ''
				this.createItem.receivePhone = value.phone || ''
				this.createItem.receiveAddress = value.address || ''
			}
		}
	}
}
</script>

<style lang="scss">
.blDeliveryApprove-form {
	.relation-file-no {
		position: relative;
		.el-icon-question {
			position: absolute;
			right: -16px;
			top: 3px;
		}
	}
	.el-form-item {
		margin-bottom: 4px;
		.el-radio__label {
			font-size: 12px;
		}
	}
	.el-form-item__label,
	.el-form-item__content {
		line-height: 20px;
	}
	.el-input,
	.el-textarea {
		font-size: 12px;
	}
	.receive-name-class {
		display: flex;
		.receive-name-input-class {
			width: 90%;
		}
		.receive-name-btn-class {
			margin-left: 5px;
		}
	}
}
.edit-container .blDeliveryApprove-form .el-textarea__inner {
	padding: 0 5px;
}
</style>
