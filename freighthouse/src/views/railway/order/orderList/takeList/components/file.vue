<template>
	<div class="si-detail">
		<div class="si-bewteen">
			<el-tabs v-model="activeFile" @tab-click="handleClick">
				<el-tab-pane label="附件列表" name="valid"></el-tab-pane>
				<el-tab-pane label="失效附件" name="inValid"></el-tab-pane>
			</el-tabs>

			<div v-if="activeFile === 'valid'" class="row-tit-operate">
				<el-button size="mini" type="primary" @click="handleUploadFile">上传附件</el-button>
			</div>
		</div>
		<div v-if="activeFile === 'valid'" class="si-table">
			<el-table fit highlight-current-row style="width: 100%" key="valid" :data="validData">
				<el-table-column prop="fileType" label="附件类型" align="center">
					<template slot-scope="scope">
						{{ scope.row.fileType | fileTypeFilter }}
					</template>
				</el-table-column>

				<el-table-column prop="fileName" width="200" label="附件名称">
					<template slot-scope="scope">
						<div class="si-file-wrap" v-for="(item, index) in fileNameList(scope.row.fileName)" :key="index">
							<span :title="item" size="mini" @click="handleViewFile(scope.row.fileName, scope.row.fileNo, index)">{{ item }}</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="takeEmployeeName" label="上传人" align="center"></el-table-column>
				<el-table-column prop="retrieveFinishTime" label="上传时间" align="center"></el-table-column>
				<el-table-column prop="paperCode" label="提单纸编码" align="center"></el-table-column>
				<el-table-column prop="pages" label="正本页数" align="center"></el-table-column>
				<el-table-column label="操作" align="center">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button type="text" size="mini" @click="handleDownload(scope.row)" v-if="scope.row.fileName && scope.row.isValid === 'y'">下载</el-button>
							<el-button type="text" size="mini" @click="handleInvalid(scope.row)">失效</el-button>

							<el-button class="red" :disabled="detailData.takeStatus === 'finish' && detailData.blMode === 'original'" type="text" size="mini" @click="handleDelete(scope.row, scope.$index)">删除</el-button>
							<!-- <el-button type="text" size="mini" @click="handleDelete(scope.row, scope.$index)" v-if="scope.row.fileName && !scope.row.noDel && detailData.takeStatus !== 'finish'">删除</el-button> -->
						</div>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<div v-if="activeFile === 'inValid'" class="si-table">
			<el-table fit highlight-current-row style="width: 100%" key="invalid" :data="invalidData">
				<el-table-column prop="fileType" label="附件类型" align="center" width="100">
					<template slot-scope="scope">
						{{ scope.row.fileType | fileTypeFilter }}
					</template>
				</el-table-column>
				<el-table-column prop="fileName" width="200" label="附件名称">
					<template slot-scope="scope">
						<div class="si-file-wrap" v-for="(item, index) in fileNameList(scope.row.fileName)" :key="index">
							<span :title="item" size="mini" @click="handleViewFile(scope.row.fileName, scope.row.fileNo, index)">{{ item }}</span>
						</div>
					</template>
				</el-table-column>

				<el-table-column prop="takeEmployeeName" label="上传人" align="center"></el-table-column>
				<el-table-column prop="retrieveFinishTime" label="上传时间" align="center" width="140"></el-table-column>
				<el-table-column prop="paperCode" label="提单纸编码" align="center"></el-table-column>
				<el-table-column prop="pages" label="正本页数" align="center" width="80"></el-table-column>
				<el-table-column prop="invalidEmployeeName" label="失效人" align="center"></el-table-column>
				<el-table-column prop="invalidTime" label="失效时间" align="center" width="140"></el-table-column>
				<el-table-column prop="invalidReason" label="失效原因" align="center">
					<template slot-scope="scope">
						{{ scope.row.invalidReason | getDictLabelFilter('blFileInvalidReason')}}
					</template>
				</el-table-column>
				<el-table-column prop="invalidRemark" label="失效备注" align="center" show-overflow-tooltip>
					<template slot-scope="scope">
						<div class="si-file-wrap">{{ scope.row.invalidRemark }}</div>
					</template>
				</el-table-column>
				<el-table-column prop="fileName" width="200" label="作废附件">
					<template slot-scope="scope">
						<div class="si-file-wrap" v-for="(item, index) in fileNameList(scope.row.invalidFileName)" :key="index">
							<span :title="item" size="mini" @click="handleViewFile(scope.row.invalidFileName, scope.row.invalidFileNo, index)">{{ item }}</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="100">
					<template slot-scope="scope">
						<el-button v-if="scope.row.invalidReason === 'bl_paper_invalid'" type="text" size="mini" @click="uploadFile(scope.row)">上传作废附件</el-button>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<div v-if="uploadShow">
			<FileUpload @close="uploadPopClose" />
		</div>
		<div v-if="invalidPopShow">
			<invalidPop :blNo="detailData.blNo" :invalidPopRow="invalidPopRow" @close="invalidPopClose" />
		</div>
		<div v-if="uploadFilePopShow">
      <uploadFilePop :requestUrl="'/order/blFile/uploadInvalidFile'" :requestParam="requestParam"  @close="uploadFilePopClose" />
   </div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { takePutFiles, blFileDelete } from '@/api/railway/bl'
import FileUpload from './fileUpload'
import invalidPop from './invalidPop'
import { mainInfo } from '@/api/railway/list'
import { blFileInvalid } from '@/api/order/bl'
import uploadFilePop from '../pageManage/page/uploadFile.vue'

export default {
	filters: {
		fileTypeFilter(fileType) {
			let typeTxt = ''
			let { blFileType, tradeDocName } = store.state.dict.dictMap
			let fileTypeOptions = blFileType.concat(tradeDocName)
			let sItem = fileTypeOptions.find(item => item.value === fileType)
			typeTxt = sItem ? sItem.label : ''
			return typeTxt
		}
	},
	data() {
		return {
			takeType: '',
			module: '',
			validData: [],
			invalidData: [],
			activeFile: 'valid',
			tableData: [],
			uploadShow: false,
			defaultFileSize: 100, //文件默认不超过100M
			file: '',
			fileList: [],
			sizeLimit: true,
			invalidPopShow: false,
			uploadFilePopShow: false,
			requestParam: {},
		}
	},
	props: {
		detailData: {
			type: Object,
			default: () => ({})
		}
	},
	async created() {
		if (this.$route.query.routerName == 'RailwayHblTakeList') {
			this.takeType = 'hbl'
		}
		if (this.$route.query.routerName == 'RailwayMblTakeList') {
			this.takeType = 'mbl'
		}
		this.init()
	},
	activated() {
		if (this.$route.query.routerName == 'RailwayHblTakeList') {
			this.takeType = 'hbl'
		}
		if (this.$route.query.routerName == 'RailwayMblTakeList') {
			this.takeType = 'mbl'
		}
		this.init()
	},
	mounted() {},
	computed: {
		...mapState({
			currRole: state => state.user.currRole,
			dictMap: state => state.dict.dictMap
		})
	},
	watch: {},
	components: {
		FileUpload,
		invalidPop,
		uploadFilePop
	},
	methods: {
		fileNameList(fileName) {
			if (fileName) {
				return fileName.split(',')
			} else {
				return []
			}
		},
		handleViewFile(fileName, fileNo, index) {
			fileNo = fileNo.split(',')[index]
			fileName = fileName.split(',')[index]
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
		},
		handleInvalid(row) {
			console.log('🚀 ~ row', row)
			this.invalidPopRow = row
			this.invalidPopShow = true
			// this.$confirm('是否失效该条附件?', '警告', {
			// 	confirmButtonText: '确定',
			// 	cancelButtonText: '取消',
			// 	type: 'warning'
			// })
			// 	.then(() => {
			// 		let param = {
			// 			fileNos: row.fileNo.split(','),
			// 			blId: this.$route.query.blId,
			// 			orderNo: this.$route.query.orderNo
			// 		}
			// 		return blFileInvalid(param)
			// 	})
			// 	.then(response => {
			// 		this.$message({
			// 			message: '失效成功',
			// 			type: 'success',
			// 			duration: 1000,
			// 			onClose: () => {
			// 				this.getFileList()
			// 				this.$emit('getDetail')
			// 			}
			// 		})
			// 	})
			// 	.catch(() => {})
		},
		invalidPopClose(action, value) {
       this.invalidPopShow = false
			 if (action === 'Confirm') {
           this.getFileList()
			     this.$emit('getDetail')
			 }
		},
		handleClick(val) {},
		// 初始化
		init() {
			this.getFileList()
		},

		// 附件列表
		getFileList() {
			let data = {
				orderNo: this.$route.query.orderNo,
				blId: this.$route.query.blId,
				takeType: this.takeType
			}
			takePutFiles(data).then(res => {
				if (this.$route.query.routerName == 'RailwayHblTakeList') {
					this.validData = res.data.validFiles.filter(item => item.fileType === 'hbl_original')
				}
				if (this.$route.query.routerName == 'RailwayMblTakeList') {
					this.validData = res.data.validFiles.filter(item => item.fileType === 'mbl_original')
				}
				this.$emit('changeFileNos', this.validData)
				this.invalidData = res.data.invalidFiles
			})
		},
		// 预览
		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
		},
		// 下载
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
					link.download = '附件.zip'
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
						onClose: () => {
							this.getFileList()
							this.$emit('getDetail')
						}
					})
				})
				.catch(() => {})
		},
		// 打开上传附件弹窗
		handleUploadFile() {
			this.uploadShow = true
		},
		uploadPopClose(action) {
			this.uploadShow = false
			if (action === 'Confirm') {
				this.getFileList()
				this.$emit('getDetail')
			}
		},
		// 上传前钩子获取file名
		getFile(file) {
			this.file = file
			this.sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
			if (!this.sizeLimit) {
				this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制')
			}
			return this.sizeLimit
		},
		uploadFile(row) {
      this.uploadFilePopShow = true
			this.requestParam = {
				blId: row.blId,
				orderNo: row.orderNo,
				blNo: this.$route.query.blNo,
				fileNos: (row.fileNo || '').split(','),
				fileType: row.fileType,
			}
		},
		uploadFilePopClose(action) {
      this.uploadFilePopShow = false
			if (action === 'Confirm') {
				this.getFileList()
				this.$emit('getDetail')
			}
    },
	}
}
</script>
<style>
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
