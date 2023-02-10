<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="uploadFileForm" :model="createdItem" label-position="right" label-width="90px" class="document-upload">
			<el-form-item label="贸易单证类别" prop="docName" :rules="[{ required: true, message: '请选择贸易单证类别', trigger: 'change' }]" :show-message="false">
				<el-select v-model="createdItem.docName" size="mini" clearable placeholder="请选择" style="width: 100%">
					<el-option v-for="item in dictMap.tradeDocName" :label="item.label" :value="item.value" :key="item.value"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="提单号" prop="blId"  v-if="!['st02', 'st16', 'st17', 'st04', 'st19'].includes(orderInfo.serviceType)">
				<el-select v-model="createdItem.blId" size="mini" clearable placeholder="请选择" @blur="selectBlur" style="width: 100%">
					<el-option v-for="(item, index) in blIdOptions" :label="item.label" :value="item.value" :key="index">
					</el-option>
				</el-select>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { tradeDocSave, tradeDocSaveNew } from '@/api/order/document'
import { blListBox } from '@/api/order/bl'
import { truckLoadSave } from '@/api/order/shippingTruck'

const defaultCreate = {
	blId: '',
	docName: '',
	docType: 'trade',
	orderNo: ''
}

export default {
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '新增贸易单证',
				show: true,
				size: 'medium',
				width: '560px'
			},
			blIdOptions: [],
			canSubmit: true,
			canUpload: true,
			multiple: true,
			defaultFileSize: 100, //文件默认不超过100M
			sizeLimit: true,
			file: '',
			fileList: [],
			fileData: '',
			showProcess: false,
			processLength: 0,
			createdItem: Object.assign({}, defaultCreate),
			rules: {
				docName: [{ required: true, message: '请选择贸易单证类别', trigger: 'change' }]
			},
			submitDisabled: false,
			interval: null
		}
	},
	props: {
		orderInfo: {
			type: Object,
			default: () => ({})
		}
	},
	created() {
		this.createdItem.documentFiles = []
		this.getBlNoList()
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
		getBlNoList() {
			blListBox({ orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }).then(res => {
				this.blIdOptions = res.data.map(item => {
					let blType = item.blType === 'mbl' ? 'MBL' : item.blType === 'hbl' ? 'HBL': ''
					let label = `${blType}: ${item.blNo} (id: ${item.blId})`
					return Object.assign({}, item, {
						label: label,
						value: item.blId
					})
				})
				// //筛选blNo不为空的数据
				// this.blIdOptions = res.data.filter(item => item.blNo !== '')
			})
		},

		close(action) {
			this.$emit('close', action)
		},

		validate() {
			console.log(this.createdItem)
			if (!this.createdItem.documentFiles.length) {
				this.$message.warning('请上传附件')
				return false
			}
			return true
		},

		selectBlur(e) {
			this.createdItem.blId = e.target.value
		},

		handleDownload(row) {
			let href = `/base/webapi/file/download?fileNo=${row.fileNo}`
			window.open(href)
		},

		handleView(row) {
			this.$store.dispatch('order/previewFile', { fileNo: row.fileNo, fileName: row.fileName })
		},

		// 删除文件
		handleDeleteFile(index) {
			this.createdItem.documentFiles.splice(index, 1)
		},

		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.uploadFileForm.validate(valid => {
					if (valid) {
						if (!this.canSubmit) return
						// this.handleImport()
						this.createdItem.orderNo = this.orderNo || this.oQuery.orderNo
						if (this.oQuery.jointNo) {
							this.createdItem.jointNo = this.oQuery.jointNo
						}
						// 客户自定的blId不传
						if (['st02', 'st16', 'st17'].includes(this.oQuery.serviceType)) {
							delete this.createdItem.blId
						}
						this.canSubmit = false
						this.submitDisabled = true
						tradeDocSaveNew(this.createdItem)
							.then(res => {
								this.$message({
									type: 'success',
									message: '保存成功'
								})
								this.close('Confirm')
								this.canSubmit = true
								this.submitDisabled = false
							})
							.finally(() => {
								this.canSubmit = true
								this.submitDisabled = false
							})
					} else {
						console.log('error submit!!')
						this.canSubmit = true
						return false
					}
				})
			} else {
				this.close('Cancel')
				this.canSubmit = true
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
			this.fileList = fileList
		},

		// 移除文件
		handleRemove(file, fileList) {
			this.fileList = fileList
		},

		uploadFile(file) {
			this.fileData.append('fileName', file.file)
			//this.file = file.file
		},

		// 上传进度条
		handleProgress(file, fileList) {
			this.processLength = 0
			this.showProcess = true
			this.interval = setInterval(() => {
				if (this.processLength >= 99) {
					clearInterval(this.interval)
					return
				}
				this.processLength += 1
			}, 200)
		},

		handleImport(done) {
			if (!this.fileList.length) return this.$message.warning('请上传附件')
			if (!this.canUpload) return
			// 根据后台需求数据格式
			this.fileData = new FormData()
			// 文件对象
			this.fileData.append('orderNo', this.oQuery.orderNo)
			this.oQuery.jointNo && this.fileData.append('jointNo', this.oQuery.jointNo)
			this.fileData.append('docType', this.createdItem.docType)
			this.$refs.upload.submit()

			if (this.sizeLimit) {
				this.canUpload = false
				this.handleProgress()
				this.$store
					.dispatch('user/import', {
						uri: '/order/shipping/tradeDoc/uploadFile',
						params: this.fileData
					})
					.then(res => {
						this.processLength = 100
						this.showProcess = false

						if (res.data.code === 0) {
							this.$message({
								type: 'success',
								message: '导入成功',
								duration: 1000,
								onClose: () => {
									this.fileList = []
									let { data } = res.data
									data.forEach(item => {
										this.createdItem.documentFiles.push(item)
									})
									this.canUpload = true
								}
							})
						} else {
							this.$message({
								type: 'error',
								message: res.data.msg,
								duration: 1000,
								onClose: () => {
									this.fileList = []
									this.canUpload = true
								}
							})
						}
					})
					.catch(err => {
						clearInterval(this.interval)
						this.interval = null
						this.processLength=0
						this.showProcess=false
						this.fileList = []
						this.canUpload = true
					})
			}
		}
	}
}
</script>

<style lang="scss">
.btn-uploadFile {
	width: 300px;
}
.fileNo-list {
	margin: 10px 0;
	padding: 0;
	.link-fileNo {
		cursor: pointer;
		list-style: none;
		line-height: 24px;
		color: #3e80f5;
		font-size: 12px;
		text-decoration: underline;
	}
}
.document-upload .el-form-item {
	margin-bottom: 4px;
}
.document-upload .el-form-item .el-form-item__label{
	padding-right: 4px;
}
.document-upload .el-form-item .el-form-item__label, .document-upload .el-form-item .el-form-item__content{
	line-height: 20px;
}
</style>
