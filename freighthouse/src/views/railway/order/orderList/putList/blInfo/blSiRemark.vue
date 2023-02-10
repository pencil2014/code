<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="siRemark" label-position="right" label-width="75px" class="siRemark-form" :model="remarkData">
			<el-form-item label="补料附件：">
				<el-button v-for="(item, index) in fileNameList(remarkData.siFileName)" :key="index" type="text" class="btn-siRemark-file" @click="handleViewFile(remarkData, index)">{{ item }}</el-button>
			</el-form-item>
			<el-form-item label="补料要求：">
				<div v-html="remarkData.siRemark" class="remark-cont"></div>
			</el-form-item>
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
				title: '补料要求',
				show: true,
				size: 'medium',
				width: '1100px',
				showBtns: false
			},
			remarkData: {}
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
		fileNameList(fileName) {
			if (fileName) {
				return fileName.split('&&')
			} else {
				return []
			}
		},
		handleViewFile(row, index) {
			let fileNo = row.siFileNo.split('&&')[index]
			let fileName = row.siFileName.split('&&')[index]
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
		},
		getSiRemark() {
			let data = {
				orderNo: this.$route.query.orderNo,
				blId: this.siRemarkQuery.blId
			}
			blDraftConfirmFileInfo(data).then(res => {
				this.remarkData = res.data || {}
			})
		},
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
		::v-deep table {
			border-top: 1px solid #dfe6ec;
			border-left: 1px solid #dfe6ec;
			td {
				border-right: 1px solid #dfe6ec;
				border-bottom: 1px solid #dfe6ec;
				padding: 5px 10px;
			}
		}
	}
}
</style>
