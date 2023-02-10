<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="siRemark" label-position="right" label-width="75px" class="siRemark-form">
			<div v-html="siRemarkQuery.siRemark"></div>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { blDraftConfirmFileInfo } from '@/api/order/bl'

export default {
	data() {
		return {
			dialogConfig: {
				title: '异常/备注',
				show: true,
				size: 'medium',
				width: '1000px',
				showBtns: false
			}
		}
	},
	props: {
		siRemarkQuery: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		this.getSiRemark()
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
		getSiRemark() {},
		close(action) {
			this.$emit('close', action)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.close('Confirm')
			} else {
				this.close('Cancel')
			}
		}
	}
}
</script>
<style lang="scss" scoped>
.siRemark-form ::v-deep .el-form-item {
	margin-bottom: 4px;
}
.siRemark-form ::v-deep .el-form-item__label,
.siRemark-form ::v-deep .el-form-item__content {
	line-height: 20px;
}
.siRemark-form {
	.btn-siRemark-file {
		line-height: 20px;
		padding: 0;
		white-space: normal;
		text-align: left;
	}
	.remark-cont {
		min-height: 200px;
	}
	::v-deep table{
		border-top: 1px solid #dfe6ec;
		border-left: 1px solid #dfe6ec;
		td{
			border-right: 1px solid #dfe6ec;
			border-bottom: 1px solid #dfe6ec;
			padding: 5px 10px;
		}
	}
}
</style>
