<template>
	<div class="si-detail">
		<div class="si-bewteen">
			<el-tabs v-model="activeFile">
				<el-tab-pane label="附件列表" name="valid"></el-tab-pane>
				<el-tab-pane label="失效附件" name="invalid"></el-tab-pane>
			</el-tabs>
		</div>
		<div v-if="activeFile === 'valid'" class="si-table">
			<el-table key="valid" fit highlight-current-row style="width: 100%" :data="detailData.validFiles">
				<el-table-column prop="fileType" label="附件类型" align="center">
					<template slot-scope="scope"> {{ scope.row.fileType | fileTypeFilter }} </template>
				</el-table-column>
				<el-table-column prop="invoiceNo" label="编号/发票号" align="center"></el-table-column>
				<el-table-column show-overflow-tooltip="" prop="documentRemark" width="200" label="备注" align="center"></el-table-column>
				<el-table-column prop="fileName" label="附件名称" align="center">
					<template slot-scope="scope">
						<div class="file-row" v-if="scope.row.fileName && scope.row.fileName.split(',').length">
							<div :title="item" v-for="(item, index) in scope.row.fileName.split(',')" :key="'file' + index" class="file-name-trade">
								<el-button type="text" size="mini" @click="handleView(item, index, scope.row)">{{ item }}</el-button>
							</div>
						</div>
					</template>
				</el-table-column>

				<el-table-column prop="takeEmployeeName" label="取单人" align="center"></el-table-column>
				<el-table-column prop="retrieveFinishTime" label="取单完成时间" align="center"></el-table-column>
				<el-table-column label="操作" align="center">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button style="margin-right:4px;" type="text" size="mini" @click="handleDownload(scope.row)" v-if="scope.row.fileName && scope.row.isValid != 'n'">下载</el-button>
							<el-button style="margin-right:4px;" type="text" size="mini" @click="handleInvalid(scope.row)" v-if="scope.row.fileName && scope.row.isValid != 'n'">失效</el-button>
							<el-button @click="handleUpload(scope.row)" type="text" size="mini" v-if="detailData.takeStatus !== 'finish'">上传</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<div v-if="activeFile === 'invalid'" class="si-table">
			<el-table key="invalid" fit highlight-current-row style="width: 100%" :data="detailData.invalidFiles">
				<el-table-column prop="fileType" label="附件类型" align="center">
					<template slot-scope="scope">
						{{ scope.row.fileType | fileTypeFilter }}
					</template>
				</el-table-column>
				<el-table-column prop="fileName" label="附件名称" align="center">
					<template slot-scope="scope">
						<div class="file-row" v-if="scope.row.fileName && scope.row.fileName.split(',').length">
							<div v-for="(item, index) in scope.row.fileName.split(',')" :key="'file' + index" class="file-name-trade">
								<el-button type="text" size="mini" @click="handleView(item, index, scope.row)">{{ item }}</el-button>
							</div>
						</div>
					</template>
				</el-table-column>

				<el-table-column prop="takeEmployeeName" label="上传人" align="center"></el-table-column>
				<el-table-column prop="retrieveFinishTime" label="上传时间" align="center"></el-table-column>
				<el-table-column prop="invalidTime" label="失效时间" align="center"></el-table-column>
				<el-table-column prop="invalidReason" label="失效原因" align="center"></el-table-column>
			</el-table>
		</div>
		<div v-if="uploadShow">
			<FileUpload @close="uploadPopClose" />
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { blFileList, blFileDelete } from '@/api/railway/bl'
import FileUpload from './fileUploadTrade'
import { insuranceInvalid } from '@/api/order/list'
import { documentInvalid } from '@/api/order/document'

export default {
	filters: {
		fileTypeFilter(fileType) {
			let typeTxt = ''
			let { blFileType, tradeDocName } = store.state.dict.dictMap
			let fileTypeOptions = blFileType.concat(tradeDocName)
			let sItem = fileTypeOptions.find(item => item.value === fileType)
			typeTxt = sItem ? sItem.label : ''
			if (fileType === 'bd' && typeTxt === '') typeTxt = '保险'
			return typeTxt
		}
	},
	data() {
		return {
			curRow: {},
			activeFile: 'valid',
			uploadShow: false,
			defaultFileSize: 100, //文件默认不超过100M
			file: '',
			fileList: [],
			sizeLimit: true
		}
	},
	props: {
		detailData: {
			type: Object,
			default: () => ({})
		}
	},
	async created() {},
	async activated() {},
	mounted() {},
	computed: {
		...mapState({
			currRole: state => state.user.currRole,
			dictMap: state => state.dict.dictMap
		})
	},
	watch: {},
	components: {
		FileUpload
	},
	methods: {
		handleInvalid(row) {
			console.log('🚀 ~ row', row)
			this.$confirm('是否失效该条附件?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					if (row.fileType === 'bd') {
						return insuranceInvalid({
							oid: row.oid
						})
					} else {
						return documentInvalid({
							docId: row.oid
						})
					}
				})
				.then(response => {
					this.$message({
						message: '失效成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							this.$emit('getDetail')
						}
					})
				})
				.catch(() => {})
		},

		uploadPopClose(action, val) {
			this.uploadShow = false
			if (action === 'Confirm') {
				this.fileList = val
				this.handleImport()
			}
		},
		handleUpload(row) {
			this.curRow = row
			this.uploadShow = true
		},
		// 预览
		handleView(name, index, row) {
			let fileNo = row.fileNo.split(',')[index]
			this.$store.dispatch('order/previewFile', { fileNo: fileNo, fileName: name })
		},
		// 打包下载
		handleDownload(row) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/base/webapi/file/zipDownload',
					params: {
						fileNos: row.fileNo
					}
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = '贸易单证.zip'
					link.click()
				})
		},
		// 附件删除
		handleDelete(row, index) {
			this.$confirm('是否删除该条附件?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let param = {
						fileNos: row.fileNo.split(','),
						blId: this.$route.query.blId,
						orderNo: this.$route.query.orderNo
					}
					return blFileDelete(param)
				})
				.then(response => {
					this.$message({
						message: '删除成功',
						type: 'success',
						duration: 1000,
						onClose: () => {}
					})
				})
				.catch(() => {})
		},

		handleImport() {
			let params = {
				data: {
					blId: this.$route.query.blId,
					orderNo: this.$route.query.orderNo,
					docType: this.curRow.fileType,
					docId: this.curRow.oid
				},
				fileName: this.fileList
			}
			let uri = '/order/document/upload'
			if (this.curRow.fileType === 'bd') {
				params = {
					data: {
						orderNo: this.$route.query.orderNo,
						oid: this.curRow.oid
					},
					fileName: this.fileList
				}
				uri = '/order/insurance/upload'
			}
			if (this.sizeLimit) {
				this.$store
					.dispatch('order/soUpload', {
						uri: uri,
						params: params
					})
					.then(res => {
						this.fileList = []
						if (res === 'error') return
						this.$message({
							type: 'success',
							message: '导入成功',
							duration: 1000,
							onClose: () => {
								this.$emit('getDetail')
							}
						})
					})
			}
		}
	}
}
</script>
<style>
.el-table .cell.el-tooltip {
	overflow: hidden !important;
}
.file-name-trade span {
	display: inline-block;
	width: 100px;
	height: 14px;
	overflow: hidden;
	text-overflow: ellipsis;
}
.si-detail .si-bewteen {
	padding: 0 10px;
	display: flex;
	justify-content: space-between;
	height: 40px;
	line-height: 40px;
}
.si-detail .si-table {
	padding: 0 10px;
}
.si-detail .si-table .operate-group span {
	white-space: normal;
}
.si-detail.invalid {
	pointer-events: none;
}
.si-detail.invalid .el-button {
	background-color: #f5f7fa;
	border-color: #f5f7fa;
	color: #c0c4cc;
}
.si-detail.invalid .el-button.el-button--text {
	background-color: transparent;
	color: #bbb;
	border-color: transparent;
}
</style>
