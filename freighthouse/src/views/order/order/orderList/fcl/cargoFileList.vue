<template>
	<div id="blFileList">
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<div v-for="(item, index) in param.fileNameList" :key="item">
				<el-button type="text" size="mini" @click="handleView(item, index)">{{ item }}</el-button>
			</div>
		</BaseDialog>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { hscodeFileList } from '@/api/base'
import { getDictLabel } from '@/utils/tools'

export default {
	filters: {},
	data() {
		return {
			oQuery: this.$route.query,
			tableData: [],
			dialogConfig: {
				title: '查看附件',
				show: true,
				size: 'medium',
				width: '600px',
				showBtns: false
			}
		}
	},
	props: {
		param: {
			type: Object,
			default: () => ({})
		}
	},
	created() {},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	components: {
		BaseDialog
	},
	watch: {},
	methods: {
		close(action, value) {
			this.$emit('close', action, value)
		},

		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.close('Confirm', this.tableData)
			} else {
				this.close('Cancel', this.tableData)
			}
		},
		// 预览
		handleView(fileName, index) {
			let fileNo = this.param.fileNoList[index]
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
		},
		// 打包下载
		handleDownload(row) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: row.fileNo
					}
				})
				.then(res => {
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = row.fileName
					link.click()
				})
		}
	}
}
</script>
<style lang="scss">
.si-file-wrap {
	width: 100%;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
.si-file-wrap span {
	cursor: pointer;
	color: #1890ff;
}
#blFileList .customsClearance-bewteen {
	display: flex;
	justify-content: space-between;
	height: 32px;
	line-height: 32px;
}
#blFileList .table-cont .operate-group .el-button {
	white-space: normal;
}
#blFileList .table-cont .operate-group .el-button--mini span {
	display: block;
}
</style>
