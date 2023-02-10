<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="markTradeTermsForm" :rules="rules" :model="createdItem" label-position="right" label-width="70px" class="tradeTerms-form">
			<el-form-item label="贸易条款" prop="tradeTermsCode" :show-message="false">
        <el-select v-model="createdItem.tradeTermsCode" size="mini" clearable placeholder="请选择" @change="handleSelectTradeTerms" style="width: 100%">
          <el-option v-for="(item, index) in dictMap.tradeTermsCode" :label="item.label" :value="item.value" :key="index"></el-option>
        </el-select>
      </el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { blMarkTradeTerms } from '@/api/order/bl'

const defaultCreate = {
	orderNo: '',
	blId: null,
	tradeTermsCode: ''
}

export default {
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '标记条款',
				show: true,
				size: 'medium',
				width: '360px'
			},
			createdItem: Object.assign({}, defaultCreate),
			rules: {
				tradeTermsCode: [{ required: true, message: '请选择贸易条款', trigger: 'change' }],
			}
		}
	},
	props: {
		markTradeTermsPopQuery: {
			type: Object,
			default: () => ({})
		},
	},
	created() {
	},
	mounted() {
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		}),
	},
	watch: {
	},
	components: {
		BaseDialog
	},
	methods: {
		handleSelectTradeTerms(val) {
		},
		close(action, value) {
			this.$emit('close', action, value)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.markTradeTermsForm.validate(valid => {
					if (valid) {
						blMarkTradeTerms({
							blId: this.markTradeTermsPopQuery.blId,
							orderNo: this.$route.query.orderNo,
							tradeTermsCode: this.createdItem.tradeTermsCode
						}).then(res => {
							this.$message.success('标记条款成功!')
							this.close('Confirm')
						}).catch(err => {
							console.log("err", err)
						})
						// this.close('Confirm', this.createdItem)
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.tradeTerms-form {
	/deep/ .el-form-item{
		margin-bottom: 4px;
	}
	/deep/ .el-form-item__label, /deep/ .el-form-item__content{
		line-height: 20px;
	}
}
</style>
