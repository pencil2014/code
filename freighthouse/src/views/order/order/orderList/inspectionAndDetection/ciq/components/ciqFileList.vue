<template>
	<div class="table-com-layout">
		<BaseDialog :config="dialogConfig" :callback="dialogCallback">
			<div class="ciq-bewteen">
				<span class="ft12" v-if="!isBulkRo">箱号：{{ param.cn }}</span>
				<div class="row-tit-operate">
					<el-button size="mini" type="primary" @click="handleDownloadFile">下载</el-button>
					<el-button size="mini" type="primary" @click="handleUploadFile">上传附件</el-button>
				</div>
			</div>
			<el-table fit highlight-current-row style="width: 100%" ref="fileListTable" :data="tableData" @selection-change="handleSelectionChange">
				<el-table-column type="selection" :selectable="selectable"></el-table-column>
				<!-- <el-table-column prop="fileNo" label="附件编号" align="center"></el-table-column> -->
				<el-table-column prop="typeName" label="附件类型" align="center"></el-table-column>
				<el-table-column prop="fileName" label="附件名称" align="center">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-button @click="handleView(scope.row)" type="text" size="mini"
								><el-tooltip class="item" effect="dark" :content="scope.row.fileName" placement="top-start">
									<span class="file-name-style">{{ scope.row.fileName }}</span>
								</el-tooltip></el-button
							>
						</div>
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center">
					<template slot-scope="scope">
						<div class="operate-group">
							<el-upload
								style="display: inline-block"
								ref="upload"
								action="#"
								:auto-upload="true"
								:before-upload="getFile"
								:on-change="handleChangeFile"
								:http-request="content => handleImport(content, scope.row)"
								:show-file-list="false"
								:file-list="fileList"
								v-if="staticType.includes(scope.row.typeCode)"
							>
								<el-button type="text" size="mini" style="text-decoration: underline" class="mr10">上传</el-button>
							</el-upload>
							<!-- 固定附件放开删除 v-if="!staticType.includes(scope.row.typeCode)-->
							<el-button style="color:red;" type="text" size="mini" @click="handleDelete(scope.row)" v-if="scope.row.fileName">删除</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
		</BaseDialog>
		<div v-if="uploadShow">
			<CiqFileUpload :param="param" :attachmentList="attachmentList" :isBulkRo="isBulkRo" @close="uploadPopClose" />
		</div>
	</div>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'
import { ciqFileList, ciqDeleteFile } from '@/api/order/inspectionAndDetection/ciq'
import CiqFileUpload from './ciqFileUpload'

export default {
	filters: {},
	data() {
		return {
			oQuery: this.$route.query,
			tableData: [],
			multipleSelection: [],
			dialogConfig: {
				title: '查看附件',
				show: true,
				size: 'medium',
				width: '800px',
				showBtns: false
			},
			uploadShow: false,
			staticType: ['ciq_box_list', 'ciq_application'], // 固定的附件类别
			defaultFileSize: 100, //文件默认不超过100M
			file: '',
			fileList: [],
			sizeLimit: true
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
		},
		isBulkRo: {
			type: Boolean,
			default: false
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
		BaseDialog,
		CiqFileUpload
	},
	watch: {},
	methods: {
		// 附件列表
		getFileList() {
			let data = {
				orderNo: this.oQuery.orderNo,
				jointNo: this.oQuery.jointNo,
				containerId: this.param.containerId,
				intrustNo: this.param.intrustNo
			}
			ciqFileList(data).then(res => {
				this.tableData = res.data
			})
		},
		selectable(row) {
			return row.fileNo ? true : false
		},
		// 获取多选
		handleSelectionChange(val) {
			this.multipleSelection = val
		},
		// 删除
		handleDelete(row) {
			this.$confirm('是否确认删除该条附件?', '警告', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(() => {
					let data = {
						oid: row.oid,
						orderNo: this.oQuery.orderNo,
						jointNo: this.oQuery.jointNo
					}
					return ciqDeleteFile(data)
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
				.catch(() => {
					this.getFileList()
				})
		},
		close(action, value) {
			this.$emit('close', action, value)
		},
		uploadPopClose(action) {
			this.uploadShow = false
			if (action === 'Confirm') {
				this.getFileList()
			}
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.close('Confirm', this.tableData)
			} else {
				this.close('Cancel', this.tableData)
			}
		},
		// 获取多选的附件编码
		getFileNos() {
			let fileNos = []
			this.multipleSelection.map(item => {
				fileNos.push(item.fileNo)
			})
			return fileNos
		},
		handleDownloadFile() {
			if (!this.multipleSelection.length) {
				return this.$message({
					type: 'warning',
					message: '请选择附件',
					duration: 1000,
					onClose: () => {}
				})
			}
			let fileNos = this.getFileNos()
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/order/shipping/customsClearance/file/zipDownload',
					params: {
						fileNos: fileNos.toString()
					}
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					link.download = 'CIQ附件.zip'
					link.click()
				})
		},
		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
		},
		// 打开上传附件弹窗
		handleUploadFile() {
			this.uploadShow = true
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
			// 根据后台需求数据格式
			const form = new FormData()
			// 文件对象
			form.append('fileName', this.file)
			form.append('intrustNo', this.param.intrustNo)
			if (!this.isBulkRo) {
				form.append('containerId', this.param.containerId)
			}
			form.append('typeCode', row.typeCode)
			form.append('orderNo', this.oQuery.orderNo)
			this.oQuery.jointNo && form.append('jointNo', this.oQuery.jointNo)

			if (this.sizeLimit) {
				this.$store
					.dispatch('user/import', {
						uri: '/order/shipping/ciq/file/upload',
						params: form
					})
					.then(res => {
						this.fileList = []
						this.canSubmit = true
						if (res.data.code === 0) {
							this.$message({
								type: 'success',
								message: '导入成功'
							})
							this.getFileList()
						}
					})
			}
		}
	}
}
</script>
<style lang="scss">
.ciq-bewteen {
	display: flex;
	justify-content: space-between;
	height: 32px;
	line-height: 32px;
}
</style>
