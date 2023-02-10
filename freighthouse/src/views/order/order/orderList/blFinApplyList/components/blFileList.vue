<template>
	<div id="blFileList">
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<div class="customsClearance-bewteen">
				<span class="ft12">
					{{ param.blType === 'mbl' ? `MBL单号：${param.blNo}` : `HBL单号：${param.blNo}` }}
				</span>
			</div>
			<el-table fit highlight-current-row style="width: 100%" ref="fileListTable" :data="tableData" class="table-cont">
				<el-table-column show-overflow-tooltip prop="name" width="200" label="附件名称">
					<template slot-scope="scope">
						<div class="si-file-wrap">
							<span size="mini" @click="handleView(scope.row)">{{ scope.row.name }}</span>
						</div>
					</template>
				</el-table-column>

				<el-table-column prop="createdName" label="上传人" align="center"></el-table-column>
				<el-table-column prop="createdTime" label="上传时间" align="center"></el-table-column>
				<el-table-column label="操作" align="center">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button type="text" size="mini" @click="handleDownload(scope.row)" v-if="scope.row.name">下载</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
		</BaseDialog>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { listBaseFile } from '@/api/order/bl'

export default {
	filters: {},
	data() {
		return {
			oQuery: this.$route.query,
			tableData: [],
			dialogConfig: {
				title: '附件列表',
				show: true,
				size: 'medium',
				width: '800px',
				showBtns: false
			}
		}
	},
	props: {
		param: {
			type: Object,
			default: () => ({})
		},
		attachmentList: {
			type: Array,
			default: () => []
		}
	},
	created() {
		this.getFileList()
	},
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
		// 附件列表
		getFileList() {
			let data = this.param.fileNo?.split(',') || []

			listBaseFile(data).then(res => {
				this.tableData = res.data
			})
		},
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
		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.name })
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
					link.download = row.name
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
