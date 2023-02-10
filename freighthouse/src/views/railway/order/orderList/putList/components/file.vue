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
						<div v-if="scope.row.fileType === 'cust_guarantee'">
							{{ scope.row.crmFileType | getDictLabelFilter('custGuaranteeType') }}
						</div>
						<div v-else>
							{{ scope.row.fileType | fileTypeFilter }}
						</div>
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
				<el-table-column prop="putStatus" label="放单状态" align="center">
					<template slot-scope="scope">
						<span>{{ scope.row | putStatusFilter(that) }}</span>
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
				<el-table-column label="操作" align="center">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button v-if="scope.row.fileName" type="text" size="mini" @click="handleDownload(scope.row)">下载</el-button>
							<el-button v-if="!['mbl_original', 'hbl_original'].includes(scope.row.fileType)" type="text" size="mini" @click="handleInvalid(scope.row)">失效</el-button>
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
						<div v-if="scope.row.fileType === 'cust_guarantee'">
							{{ scope.row.crmFileType | getDictLabelFilter('custGuaranteeType') }}
						</div>
						<div v-else>
							{{ scope.row.fileType | fileTypeFilter }}
						</div>
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
import { blFileInvalid } from '@/api/order/bl'
import { insuranceInvalid } from '@/api/order/list'
import { documentInvalid } from '@/api/order/document'
import expressRelation from './expressRelation'

export default {
	filters: {
		putStatusFilter(row, that) {
			let status = ''
			if (['release_guarantee', 'cust_guarantee'].includes(row.fileType) || (['mbl_original', 'hbl_original'].includes(row.fileType) && that.detailData && that.detailData.blMode === 'telex_release')) {
				status = '--'
			} else if (row.putStatus === 'finish') {
				status = '已放单'
			} else {
				status = '未放单'
			}
			return status
		},
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
			that: this,
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
		},
		isTransfer:{
			type:Boolean,
			default:false
		}
	},
	created() {
		// this.init()
	},
	mounted() {
		console.log('🚀 ~ this.dictMap.tradeDocName', this.dictMap.tradeDocName)
	},
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
		putRelation() {
			console.log('详情信息：', this.detailData)
			if(this.isTransfer){
				return this.$message.warning('提单转移中，暂时不能关联快递单！')
			}
			if (this.multipleSelection.length === 0) {
				return this.$message.warning('请至少选择1条数据!')
			}
				// 正本数组
			let originList = ['original', 'jthdlzb', 'thzb']
			// 电放数组
			let telexList = ['mbl_original', 'hbl_original']
			// 贸易单证数组
			let tradeList = this.dictMap.tradeDocName.map(item => item.value)
			// 加上保险
			let tradeBdlist = [...tradeList, 'bd']
			let item = {}
			for (let index = 0; index < this.multipleSelection.length; index++) {
				item = this.multipleSelection[index]

				if (![...telexList, ...tradeBdlist].includes(item.fileType)) {
					// 文件类型不是正本和贸易单证的不可以寄单
					return this.$message.warning('贸易单证和正本才可以关联快递单!')
				} else if (item.putStatus === 'finish' || item.expressNo) {
					// 已放单的正本和贸易单证的不可以寄单 ID1002146 20220211
					return this.$message.warning('所选附件已有关联寄单，不允许再进行关联!')
				} else if (['telex_release'].includes(this.detailData.blMode) && telexList.includes(item.fileType) && this.detailData.auditStatus != 'pass') {
					// 出单方式为“电放”的提单，若“正本”附件进行寄单时， 仅限制需“财务同意”即可 v20220510
					return this.$message.warning('财务审核通过才可以关联快递单!')
				} else if (['telex_release'].includes(this.detailData.blMode) && telexList.includes(item.fileType) && this.detailData.auditStatus === 'pass') {
					// 出单方式为电放 附件为正本 财务同意 && 客户同意放货或者特殊审批通过 不提示 v20220510
				} else if (((originList.includes(this.detailData.blMode) || telexList.includes(item.fileType)) && (['y', 'e'].includes(this.detailData.isAgreeRelease) || this.detailData.agreeReleaseStatus === 'pass') && this.detailData.auditStatus === 'pass') || tradeBdlist.includes(item.fileType)) {
				} else {
					// 不满足条件则弹出提示
					return this.$message.warning('财务审核通过且客户同意放货才可以关联快递单!')
				}
			}
			this.expressRelationShow = true
		},
		getData(obj) {
			let { blFileType, tradeDocName } = store.state.dict.dictMap
			let blList = [], // 提单
			tradeList = [], // 贸易单证
			insuranceList = []  // 保险
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
		getPutStatus(row) {
			let text
			if (row.putStatus != 'finish') {
				if (row.putFinishTime) {
					text = '已撤回'
				} else {
					text = '未放单'
				}
			} else {
				text = '已放单'
			}
			return text
		},
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
			if(this.isTransfer){
				return this.$message.warning('提单转移中，暂时不能新增寄单任务！')
			}
			if (this.multipleSelection.length === 0) return this.$message.warning('请至少勾选一条数据!')
			// 正本数组
			let originList = ['original', 'jthdlzb', 'thzb']
			// 电放数组
			let telexList = ['mbl_original', 'hbl_original']
			// 贸易单证数组
			let tradeList = this.dictMap.tradeDocName.map(item => item.value)
			// 加上保险
			let tradeBdlist = [...tradeList, 'bd']
			for (let index = 0; index < this.multipleSelection.length; index++) {
				const item = this.multipleSelection[index]

				if (![...telexList, ...tradeBdlist].includes(item.fileType)) {
					// 文件类型不是正本和贸易单证的不可以寄单
					return this.$message.warning('贸易单证和正本才可以新增寄单!')
				} else if (item.putStatus === 'finish') {
					// 已放单的正本和贸易单证的不可以寄单 ID1002146 20220211
					return this.$message.warning('已放单的正本和贸易单证不可以寄单!')
				} else if (['telex_release'].includes(this.detailData.blMode) && telexList.includes(item.fileType) && this.detailData.auditStatus != 'pass') {
					// 出单方式为“电放”的提单，若“正本”附件进行寄单时， 仅限制需“财务同意”即可 v20220510
					return this.$message.warning('财务审核通过才可以新增寄单!')
				} else if (['telex_release'].includes(this.detailData.blMode) && telexList.includes(item.fileType) && this.detailData.auditStatus === 'pass') {
					// 出单方式为电放 附件为正本 财务同意 客户同意放货 特殊审批通过 不提示 v20220510
				} else if (((originList.includes(this.detailData.blMode) || telexList.includes(item.fileType)) && (['y', 'e'].includes(this.detailData.isAgreeRelease) || this.detailData.agreeReleaseStatus === 'pass') && this.detailData.auditStatus === 'pass') || tradeBdlist.includes(item.fileType)) {
				} else {
					// 不满足条件则弹出提示
					return this.$message.warning('财务审核通过且客户同意放货才可以新增寄单!')
				}
			}
			// 所选的数据满足条件则跳转
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
<style lang="scss" scoped>
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
	.operate-group{
		/deep/ .el-button--mini{
			padding: 2px 0;
		}
	}
}
</style>
