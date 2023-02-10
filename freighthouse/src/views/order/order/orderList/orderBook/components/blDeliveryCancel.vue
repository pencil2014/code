<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="createForm" :rules="rules" :model="createItem" label-position="right" label-width="70px" class="create-form">
			<el-form-item label="撤回原因" prop="cancelReason" :show-message="false">
				<el-select size="mini" placeholder="请选择" v-model="createItem.cancelReason" clearable style="width:100%">
					<el-option v-for="(item, index) in dictMap.blCancelEditReason" :key="index" :label="item.label" :value="item.value"></el-option>
				</el-select>
				<div class="tip-class" v-show="cancelTip[createItem.cancelReason]">
					<div class="title">注意：</div>
					<div class="item">
						<div class="item-value" v-for="(item, index) in cancelTip[createItem.cancelReason]" :key="index">{{item}}</div>
					</div>
				</div>
			</el-form-item>
			<el-form-item label="撤回备注" prop="cancelRemark" :show-message="false">
				<el-input type="textarea" size="mini" placeholder="请输入" v-model="createItem.cancelRemark" maxlength="512" show-word-limit></el-input>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { blDeliveryCancel, blSetCanEdit } from '@/api/order/bl'

const defaultCreate = {
	orderNo: '',
	blId: '',
	cancelReason: '',
	cancelRemark: ''
}
const cancelTip = {
	'cancel':[
		'1. 实际要改单的，会有额外费用产生，可选择此原因去撤回提单。',
		'2. 撤回后，提单进度都会被重置，需重新进行草单确认、补料、放单申请等。'
	],
	'edit':[
		'1. 仅是系统数据录入错误，不是实际要改单的，可选择此原因去撤回提单。',
		'2. 撤回后，提单将变为可编辑状态，且提单进度不会重置，提单不需重新进行草单确认、补料、放单申请等。'
	]
}

export default {
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '提单撤回',
				show: true,
				size: 'medium'
				// width: "800px"
			},
			createItem: Object.assign({}, defaultCreate),
			rules: {
				cancelReason: [{ required: true, message: '请选择撤回原因', trigger: 'change' }],
				cancelRemark: [{ required: true, message: '请输入撤回备注', trigger: 'blur' }]
			},
			cancelTip
		}
	},
	props: {
		cancelBlIds: {
			type: Array,
			default: () => []
		}
	},
	created() {
		console.log('20220606', this.dictMap.blCancelEditReason)
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
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.createForm.validate(valid => {
					if (valid) {
						this.handleCancel(done)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		// 提单撤回
		handleCancel(done) {
			// this.createItem.orderNo = this.$route.query.orderNo
			// this.createItem.jointNo = this.$route.query.jointNo
			// this.createItem.blId = this.cancelBlIds[0]
			if (this.createItem.cancelReason === 'cancel') {
				let data = this.cancelBlIds.map(item => {
					return {
						blId: item,
						orderNo: this.$route.query.orderNo,
						jointNo: this.$route.query.jointNo,
						cancelReason: this.createItem.cancelReason,
						cancelRemark: this.createItem.cancelRemark
					}
				})
				blDeliveryCancel(data).then(res => {
					this.$message({
						type: 'success',
						message: '提单撤回成功',
						duration: 1000,
						onClose: () => {
							this.close('Confirm')
						}
					})
				})
			} else {
				let data = this.cancelBlIds.map(item => {
					return {
						blId: item,
						orderNo: this.$route.query.orderNo,
						cancelReason: this.createItem.cancelReason,
						cancelRemark: this.createItem.cancelRemark
					}
				})
				blSetCanEdit(data).then(res => {
					this.$message({
						type: 'success',
						message: '提单撤回成功',
						duration: 1000,
						onClose: () => {
							this.close('Confirm')
						}
					})
				})
			}
		}
	}
}
</script>

<style lang="scss">
.tip-class {
	font-size: 12px;
	color: red;
	display: flex;
	align-items: flex-start;
	margin-left: -40px;
	.title {
		line-height: 20px;
		width: 38px
	}
	.item {
		flex: 1;
		.item-value {
			line-height: 20px;
		}
	}
}
</style>
