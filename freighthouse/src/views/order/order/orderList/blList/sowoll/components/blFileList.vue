<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-table fit highlight-current-row style="width: 100%" ref="fileListTable" :data="tableData" class="table-cont">
			<el-table-column prop="fileType" label="附件类型" align="center">
				<template slot-scope="scope">
					<div>
						{{ getDictLabelFunc('blFileType', scope.row.fileType) }}
					</div>
				</template>
			</el-table-column>
			<el-table-column prop="fileName" width="200" label="附件名称">
				<template slot-scope="scope">
					{{scope.row.fileName}}
					<!-- <div class="si-file-wrap" v-for="(item, index) in fileNameList(scope.row.fileName)" :key="index">
						<span :title="item" size="mini" @click="handleViewFile(scope.row, index)">{{ item }}</span>
					</div> -->
				</template>
			</el-table-column>
			<el-table-column label="操作" align="center">
				<template slot-scope="scope">
					<div class="operate-group">
						<el-button type="text" size="mini" @click="handleViewFile(scope.row)">预览</el-button>
						<el-button type="text" size="mini" @click="handleDownload(scope.row)">下载</el-button>
					</div>
				</template>
			</el-table-column>
		</el-table>
	</BaseDialog>
</template>
<script>
import BaseDialog from '@/components/Base/Dialog/index'
import { custBlFileList, custBlDictList } from '@/api/order/bl'

export default {
	data() {
		return {
			tableData: [],
			dialogConfig: {
				title: '附件列表',
				show: true,
				size: 'medium',
				width: '800px',
				showBtns: false
			},
			custBlDictMap: {
				blFileType: []
			}
		}
	},
	props: {
		param: {
			type: Object,
			default: () => ({})
		},
	},
	created() {
		this.getFileType()
		this.getFileList()
	},
	mounted() {},
	computed: {
	},
	components: {
		BaseDialog,
	},
	watch: {},
	methods: {
		getFileType() {
			custBlDictList({
				groupCode: 'bl_file_type'
			}).then(res => {
				let { data } = res
				if (data.length) {
					this.custBlDictMap.blFileType = data[0].itemList.map(item => {
						return { ...item, label: item.itemCname, value: item.itemCode }
					})
				}
			})
		},
		getDictLabelFunc(key, val) {
			let dictArr = this.custBlDictMap[key]
			let findItem = dictArr.find(item => item.value === val)
			return (findItem ? findItem.label : '')
		},
		fileNameList(fileName) {
			if (fileName) {
				return fileName.split(',')
			} else {
				return []
			}
		},
		// handleViewFile(row, index) {
		// 	let fileNo = row.fileNo.split(',')[index]
		// 	let fileName = row.fileName.split(',')[index]
		// 	this.$store.dispatch('order/previewFile', { fileNo, fileName })
		// },
		handleViewFile(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
		},
		// 附件列表
		getFileList() {
			custBlFileList(this.param).then(res => {
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
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
		},
		// // 打包下载
		// handleDownload(row) {
		// 	this.$store
		// 		.dispatch('order/downloadBlobFile', {
		// 			uri: '/base/webapi/file/zipDownload',
		// 			params: {
		// 				fileNos: row.fileNo
		// 			}
		// 		})
		// 		.then(res => {
		// 			let link = document.createElement('a')
		// 			link.href = window.URL.createObjectURL(res)
		// 			link.download = '附件.zip'
		// 			link.click()
		// 		})
		// },
		// 下载
		handleDownload(row) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/download',
					params: {
						fileNo: row.fileNo
					}
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = row.fileName
					link.click()
				})
		},
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
