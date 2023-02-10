<template>
	<div class="si-detail">
		<div class="si-bewteen">
			<el-tabs v-model="activeFile">
				<el-tab-pane label="附件列表" name="valid"></el-tab-pane>
				<el-tab-pane label="失效附件" name="invalid"></el-tab-pane>
			</el-tabs>
			<div>
				<el-button v-if="activeFile === 'valid'" size="mini" type="primary" @click="putRelation">关联快递单</el-button>
				<el-button v-if="activeFile === 'valid'" size="mini" type="primary" @click="putCancel">放单撤回</el-button>
				<el-button v-if="activeFile === 'valid'" size="mini" type="primary" @click="handlePost">新增寄单任务</el-button>
			</div>
		</div>
		<div v-if="activeFile === 'valid'" class="si-table">
			<el-table @selection-change="handleSelectionChange" fit highlight-current-row style="width: 100%" key="valid" :data="detailData.validFiles">
				<el-table-column type="selection" width="55"> </el-table-column>
				<el-table-column prop="fileType" label="附件类型" align="center">
					<template slot-scope="scope">
						{{ scope.row.fileType | fileTypeFilter }}
					</template>
				</el-table-column>
				<el-table-column prop="invoiceNo" label="发票号" align="center"></el-table-column>
				<el-table-column prop="fileName" width="200" label="附件名称">
					<template slot-scope="scope">
						<div class="si-file-wrap" v-for="(item, index) in fileNameList(scope.row.fileName)" :key="index">
							<span :title="item" size="mini" @click="handleViewFile(scope.row, index)">{{ item }}</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="takeEmployeeName" label="取单人" align="center"></el-table-column>
				<el-table-column prop="retrieveFinishTime" label="取单完成时间" align="center"></el-table-column>
				<el-table-column prop="putStatus" label="放单状态" align="center">
					<template slot-scope="scope">
						<span>{{ scope.row.putStatus === 'finish' ? '已放单' : '未放单' }}</span>
					</template>
				</el-table-column>
				<el-table-column prop="postStatus" label="寄单状态" align="center">
					<template slot-scope="scope">
						<span>{{ scope.row.postStatus | postStatusFilter }}</span>
					</template>
				</el-table-column>
				<el-table-column
					align="center"
					prop="expressNo"
					label="快递单号" >
				</el-table-column>
				<el-table-column prop="putFinishTime" label="放单完成时间" align="center"></el-table-column>
				<el-table-column label="操作" align="center">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button v-if="scope.row.fileName" type="text" size="mini" @click="handleDownload(scope.row)">下载</el-button>
							<!-- <el-button type="text" size="mini" @click="handleInvalid(scope.row)">失效</el-button> 跟志翔确认:贸易单证放单详情没有失效按钮 20220217 -->
						</div>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<div v-if="activeFile === 'invalid'" class="si-table">
			<el-table fit highlight-current-row style="width: 100%" key="invalid" :data="detailData.invalidFiles">
				<el-table-column type="selection" width="55"> </el-table-column>
				<el-table-column prop="fileType" label="附件类型" align="center">
					<template slot-scope="scope">
						{{ scope.row.fileType | fileTypeFilter }}
					</template>
				</el-table-column>
				<el-table-column prop="fileName" width="200" label="附件名称">
					<template slot-scope="scope">
						<div class="si-file-wrap" v-for="(item, index) in fileNameList(scope.row.fileName)" :key="index">
							<span :title="item" size="mini" @click="handleViewFile(scope.row, index)">{{ item }}</span>
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
		<div v-if="expressRelationShow">
			<expressRelation @close="expressRelationClose" />
		</div>
	</div>
</template>
<script>
import store from '@/store'
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import { takePutFiles, blFileDelete, putFileCancel, saveRelation } from '@/api/railway/bl'
import FileUpload from './fileUpload'
import expressRelation from './expressRelation'

export default {
	filters: {
		postStatusFilter(postStatus) {
			return getDictLabel('postStatus', postStatus)
		},
		fileTypeFilter(fileType) {
			let typeTxt = ''
			let { blFileType, tradeDocName } = store.state.dict.dictMap
			let fileTypeOptions = blFileType.concat(tradeDocName)
			let sItem = fileTypeOptions.find(item => item.value === fileType)
			typeTxt = sItem ? sItem.label : ''
			if (fileType === 'bd' && !typeTxt) {
				typeTxt = '保险'
			}
			return typeTxt
		}
	},
	data() {
		return {
			multipleSelection: [],

			activeFile: 'valid',
			tableData: [],
			uploadShow: false,
			defaultFileSize: 100, //文件默认不超过100M
			file: '',
			fileList: [],
			sizeLimit: true,
			expressRelationShow: false
		}
	},
	props: {
		detailData: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		// this.init()
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
		expressRelation
	},
	methods: {
		fileNameList(fileName) {
			if (fileName) {
				return fileName.split(',')
			} else {
				return []
			}
		},
		handleViewFile(row, index) {
			let fileNo = row.fileNo.split(',')[index]
			let fileName = row.fileName.split(',')[index]
			this.$store.dispatch('order/previewFile', { fileNo, fileName })
		},
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
					} else if (this.dictMap.tradeDocName.some(item => item.value === row.fileType)) {
						console.log('🚀 ~ this.dictMap.tradeDocName', this.dictMap.tradeDocName)
						console.log('🚀 ~ row.fileType', row.fileType)
						return documentInvalid({
							docId: row.oid
						})
					} else {
						let param = {
							fileNos: row.fileNo.split(','),
							blId: this.$route.query.blId,
							orderNo: this.$route.query.orderNo
						}

						return blFileInvalid(param)
					}
				})
				.then(response => {
					this.$message({
						message: '失效成功',
						type: 'success',
						duration: 1000,
						onClose: () => {
							this.getFileList()
						}
					})
				})
				.catch(() => {})
		},
		putRelation() {
			console.log('详情信息：', this.detailData)
			// 关联快递单
			if (this.multipleSelection.length === 0) {
				return this.$message.warning('请至少选择1条数据!')
			} else if (this.multipleSelection.some(item => item.putStatus === 'finish' || item.expressNo)) {
				return this.$message.warning('所选附件已有关联寄单，不允许再进行关联!')
			} else {
        this.expressRelationShow = true
			}
		},
		getData(obj) {
			let { blFileType, tradeDocName } = store.state.dict.dictMap
			let blList = [], // 提单
			tradeList = [], // 贸易单证
			insuranceList = []  // 保险
			console.log('blFileType,tradeDocName', blFileType,tradeDocName)
			this.multipleSelection.forEach(item => {
				if (blFileType.some(o => o.value === item.fileType)) {
					blList.push({
						blMode: this.detailData.blMode,
						blId: this.detailData.blId,
						blNo: this.detailData.blNo,
						blType: this.detailData.blType,
						expressId: obj.expressId,
						orderNo: this.$route.query.orderNo
					})
				} else if (item.fileType === 'guarantee_slip' || tradeDocName.some(o => o.value === item.fileType)) {
					// guarantee_slip为以前的贸易单证字典，现在新字典没有了
					tradeList.push({
						docId: item.oid,
						docName: item.fileType,
						docNo: item.docNo,
						docType: 'trade',
						expressId: obj.expressId,
						orderNo: this.$route.query.orderNo
					})
				} else {
					insuranceList.push({
						insuranceId: item.oid,
						docName: item.fileType,
						invoiceNo: item.invoiceNo,
						docType: 'trade',
						expressId: obj.expressId,
						orderNo: this.$route.query.orderNo
					})
				}
			})
			let params = {}
			if (blList.length) params['blList'] = blList
			if (tradeList.length) params['tradeList'] = tradeList
			if (insuranceList.length) params['insuranceList'] = insuranceList
      return {
				expressId: obj.expressId,
				orderNo: this.$route.query.orderNo,
				...params
			}
		},
		expressRelationClose(action, obj) {
      this.expressRelationShow = false
			if (action === 'Confirm') {
				let data = this.getData(obj)
				saveRelation(data)
				.then(res => {
					this.$message.success('关联快递单成功')
          this.getFileList()
				})
			}
		},
		// 放单撤回
		putCancel() {
			if (this.multipleSelection.length === 0) {
				return this.$message.warning('请至少选择1条数据!')
			}
			if (this.multipleSelection.some(item => item.putStatus != 'finish')) {
				return this.$message.warning('包含未放单数据,请重新选择!')
			}
			let data = this.multipleSelection.map(item => {
				return {
					id: item.oid,
					fileType: item.fileType
				}
			})
			putFileCancel(data).then(res => {
				this.$message.success('撤回成功')
				this.$emit('getDetail')
			})
		},
		// 去寄单
		handlePost() {
			for (let index = 0; index < this.multipleSelection.length; index++) {
				const item = this.multipleSelection[index]
				if (item.putStatus === 'finish') {
					// 已放单的不可以寄单  20220221
					return this.$message.warning('已放单的不可以寄单!')
				}
			}
			this.$router.push({
				path: '/order/postDetail',
				query: {
					info: this.detailData,
					ids: this.multipleSelection
				}
			})
		},
		handleSelectionChange(val) {
			this.multipleSelection = val
			console.log('🚀 ~ this.multipleSelection', this.multipleSelection)
		},
		// 初始化
		init() {
			this.getFileList()
		},
		// 附件列表
		getFileList() {
			let data = {
				orderNo: this.$route.query.orderNo,
				blId: this.$route.query.blId
			}
			takePutFiles(data).then(res => {
				this.tableData = res.data
				this.$set(this.detailData, 'validFiles', res.data.validFiles)
				this.$set(this.detailData, 'invalidFiles', res.data.invalidFiles)
			})
		},
		// 预览
		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
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
		// 新添加文件替换之前添加的文件
		handleChangeFile(file, fileList) {
			this.fileList = []
			this.fileList.push(file)
		},
		// 移除文件
		handleRemove(file, fileList) {
			this.fileList = fileList
		},
		handleImport(content, row) {
			console.log(content, row)
			let params = {
				data: {
					blId: this.$route.query.blId,
					orderNo: this.$route.query.orderNo,
					fileType: row.fileType
					// fileModule: 'put'
				},
				fileName: this.file
			}
			if (this.sizeLimit) {
				this.$store
					.dispatch('order/soUpload', {
						uri: '/order/shipping/bl/file/upload',
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
								this.getFileList()
							}
						})
					})
			}
		}
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
	align-items: center;
}
.si-detail .si-table {
	padding: 0 10px;
}
</style>
