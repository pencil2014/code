<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="uploadFileForm" :model="createdItem" :rules="rules" label-position="right" label-width="90px" class="upload-form">
			<!-- <el-form-item label="附件类型：" prop="fileType">
				<el-select size="mini" placeholder="请选择" v-model="createdItem.fileType" clearable filterable>
					<el-option v-for="(item, index) in blFileTypeOptions" :key="index" :label="item.label" :value="item.value"></el-option>
				</el-select>
			</el-form-item> -->
			<el-form-item label="上传附件：">
				<el-upload ref="upload" drag class="upload-file-cont" action="#" :multiple="true" :auto-upload="false" :before-upload="getFile" :on-change="handleChangeFile" :on-remove="handleRemove" :file-list="fileList">
					<div class="file-upload">
						<img class="file-upload-img" :src="require('@/assets/icon-upload.png')" />
						<div class="file-upload__text">
							<div class="txt">点击或将文件拖拽到这里导入</div>
							<p class="info">支持 doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar 格式文件， 且文件大小限制在100M内</p>
						</div>
					</div>
				</el-upload>
				<el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
				<!-- 粘贴截图上传 -->
				<div class="clipboard-container">
					<div class="clipboard-upload">
						<div class="clipboard-left" @paste="handlePaste">
							<img class="clipboard-left-img" src="@/assets/icon-upload.png" />
							<div class="clipboard-left-text">
								<div>
									<input id="clipboard-input" placeholder="点击按 Ctrl+V 将截图粘贴到这里" />
								</div>
							</div>
							<div class="clipboard-left-img-overlay" :style="{ left: overlayLeft + 'px', top: overlayTop + 'px' }"></div>
						</div>
						<div class="clipboard-preview-container">
							<div id="clipboard-preview" @mouseenter="handleShowPreviewDelete($event, 'yes')" @mouseleave="handleShowPreviewDelete($event, 'no')" @dragover.prevent="() => {}" @dragleave.prevent="() => {}">
								<div v-show="!pasted" class="clipboard-preview-text">截图预览</div>
								<span v-show="pasted && showPreviewDelete" class="clipboard-preview-delete-wrapper">
									<i class="el-icon el-icon-delete clipboard-preview-delete" @click="deleteFile"></i>
								</span>
							</div>
							<span class="clipboard-split"></span>
						</div>
						<ul v-show="fileListPaste.length > 1" class="clipboard-file-indicator-list">
							<li v-for="(file, index) in fileListPaste" :key="'fileIndicatorList' + index" :class="{ active: file.active }" @click="toggleFile(file.fileUid, index)">
								<span class="clipboard-file-indicator"></span>
							</li>
						</ul>
					</div>
				</div>
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>
<script>
import { mapState } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import BaseDialog from '@/components/Base/Dialog/index'
import { getDocTypeName } from '@/api/order/bl'
import { getFileBatchNo } from '@/api/order/bl'

const defaultCreate = {
	orderNo: '',
	fileName: '',
	oid: '',
	fileType: ''
}

export default {
	filters: {},
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '附件上传',
				show: true,
				size: 'medium',
				width: '1100px',
				btns: [
					{ label: '确定并推送文件', action: 'Confirm', type: 'primary' },
					{ label: '取消', action: 'Cancel' }
				]
			},
			canSubmit: true, // 可提交标识
			defaultFileSize: 100, //文件默认不超过100M
			sizeLimit: true,
			file: '',
			fileList: [],
			showProcess: false,
			processLength: 0,
			rules: {
				// fileType: [{ required: true, message: '请选择附件类型', trigger: 'change' }]
			},
			createdItem: Object.assign({}, defaultCreate),
			blFileTypeOptions: [{ label: 'M单正本', value: 'mbl_original' }],
			pasted: false,
			previewImgSrc: '',
			fileListPaste: [],
			showPreviewDelete: false,
			fileUid: 1,
			overlayLeft: 0,
			overlayTop: 0,
		}
	},
	props: {
		// param: {
		//   type: Object,
		//   default: () => ({})
		// },
		fileType: {
			type: String,
			default: ''
		}
	},
	created() {
		console.log('tradeDocName', this.dictMap.tradeDocName)
		this.getFileTypeOption()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			orderNo: state => state.order.orderNo,
			custid: state => state.order.custid,
			role: state => state.user.role
		})
	},
	components: {
		BaseDialog
	},
	watch: {},
	methods: {
		toggleFile(id) {
			let images = this.$el.querySelectorAll('#clipboard-preview img')
			images.forEach((image, index) => {
				image.className = ''
				let fileUid = image.getAttribute('file-uid')
				if (fileUid == id) {
					image.className = 'active'
					let file = this.fileListPaste.find(file => file.fileUid == id)
					this.setFileActive(file)
				}
			})
		},
		deleteFile() {
			let preview = this.$el.querySelector('#clipboard-preview')
			let images = this.$el.querySelectorAll('#clipboard-preview img')
			try {
				images.forEach(image => {
					let className = image.className
					if (className.includes('active')) {
						let fileUid = image.getAttribute('file-uid')
						preview.removeChild(image)
						let index1 = this.fileListPaste.findIndex(file => file.fileUid == fileUid)
						this.fileListPaste.splice(index1, 1)
						// let index2 = this.resFileList.findIndex(file => file.fileUid == fileUid)
						// this.resFileList.splice(index2, 1)
						if (this.fileListPaste[0]) {
							this.setFileActive(this.fileListPaste[0])
						}
						if (this.fileListPaste.length === 0) {
							this.pasted = false
						}
						throw new Error('ending')
					}
				})
			} catch (error) {
				images = this.$el.querySelectorAll('#clipboard-preview img')
				if (images.length) {
					images[0].className = 'active'
				}
			}
		},
		handleShowPreviewDelete(event, val) {
			if (val === 'yes') {
				this.showPreviewDelete = true
			} else {
				this.showPreviewDelete = false
			}
		},
		handlePaste(event) {
			// if (this.fileList.length + this.fileListPaste.length > this.limit) {
			// 	this.handleExceed()
			// 	return
			// }
			const items = (event.clipboardData || window.clipboardData).items
			let file = null
			if (!items || items.length === 0) {
				this.$message.error('无粘贴内容或当前浏览器不支持粘贴操作') // 当前浏览器不支持本地
				return
			}
			for (let i = 0; i < items.length; i++) {
				if (items[i].type.indexOf('image') !== -1) {
					file = items[i].getAsFile()
					break
				}
			}
			if (!file) {
				this.$message.error('粘贴内容非图片')
				return
			}
			const reader = new FileReader()
			reader.onload = event => {
				let preview = this.$el.querySelector('#clipboard-preview') // 使用$el可防止一个页面有多个该组件导致获取元素混乱
				this.pasted = true
				let images = this.$el.querySelectorAll('#clipboard-preview img')
				images.forEach(image => (image.className = ''))
				let image = document.createElement('img')
				image.src = `${event.target.result}`
				image.setAttribute('file-uid', this.fileUid++)
				image.className = 'active'
				preview.appendChild(image)
			}
			reader.readAsDataURL(file)
			file.fileUid = this.fileUid
			// this.file = file
			this.fileListPaste.push(file)
			this.setFileActive(file)
			// this.handleUpload(file)
		},
		// handleExceed(file, fileList) {
		// 	this.$message.error(`只能选择 ${this.limit} 个文件！`)
		// },
		setFileActive(file) {
			this.fileListPaste.forEach(file => {
				file.active = false
			})
			file.active = true
			this.$forceUpdate()
		},
		getFileTypeOption() {
			switch (this.oQuery.routerName) {
				case 'RailwayHblTakeList':
					this.blFileTypeOptions = [{ label: 'HBL单正本', value: 'hbl_original' }]
					break
				case 'RailwayMblTakeList':
					this.blFileTypeOptions = [{ label: 'M单正本', value: 'mbl_original' }]
					break
				default:
					break
			}
		},
		close(action, value) {
			this.$emit('close', action, value)
		},
		validate(fileList) {
			if (!fileList.length) {
				this.$message({
					type: 'error',
					message: '请先上传附件',
					duration: 1000,
					onClose: () => {}
				})
				return false
			}
			return true
		},
		dialogCallback(action, done) {
			let fileList = this.fileList.concat(this.fileListPaste.map(item => {
				return { ...item, raw: item }
			}))
			if (action === 'Confirm') {
				this.$refs.uploadFileForm.validate(valid => {
					if (valid) {
						if (!this.validate(fileList) || !this.canSubmit) return
						this.handleImport()
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
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
			// this.fileList = []
			this.fileList = fileList
		},
		handleRemove(file, fileList) {
			this.fileList = fileList
		},
		handleImport(done) {
			let fileList = this.fileList.concat(this.fileListPaste.map(item => {
				return { ...item, raw: item }
			}))
			let params = {
				data: {
					blId: this.$route.query.blId,
					orderNo: this.$route.query.orderNo,
					fileType: this.fileType
				},
				fileName: fileList
			}
			if (fileList.length > 1) {
				getFileBatchNo().then(res => {
					params.data.fileBatchNo = res.data
					if (this.sizeLimit) {
						this.canSubmit = false
						this.handleProgress()
						this.$store
							.dispatch('order/soUpload', {
								uri: '/order/blFile/upload',
								params: params
							})
							.then(res => {
								this.processLength = 100
								this.showProcess = false
								this.fileList = []
								this.fileListPaste = []
								this.canSubmit = true
								if (res === 'error') return
								this.$message({
									type: 'success',
									message: '导入成功',
									duration: 1000,
									onClose: () => {
										this.close('Confirm')
									}
								})
							})
					}
				})
			} else {
				params.data.fileBatchNo = ''
				if (this.sizeLimit) {
					this.canSubmit = false
					this.handleProgress()
					this.$store
						.dispatch('order/soUpload', {
							uri: '/order/blFile/upload',
							params: params
						})
						.then(res => {
							this.processLength = 100
							this.showProcess = false
							this.fileList = []
							this.fileListPaste = []
							this.canSubmit = true
							if (res === 'error') return
							this.$message({
								type: 'success',
								message: '导入成功',
								duration: 1000,
								onClose: () => {
									this.close('Confirm')
								}
							})
						})
				}
			}
		},

		// 上传进度条
		handleProgress(file, fileList) {
			this.processLength = 0
			this.showProcess = true
			const interval = setInterval(() => {
				if (this.processLength >= 99) {
					clearInterval(interval)
					return
				}
				this.processLength += 1
			}, 200)
		}
	}
}
</script>
<style lang="scss" scoped>
.upload-form{
	/deep/ .el-form-item {
		margin-bottom: 4px;
		.el-form-item__label, .el-form-item__content{
			line-height: 20px;
		}
	}
	/deep/ .el-input--mini {
		.el-input__icon {
			line-height: 20px;
		}
	}
}
.clipboard-container {
	.el-dialog__body {
		padding-bottom: 18px;
	}
	.el-dialog__footer {
		padding-bottom: 21px;
	}
}

.clipboard-upload {
	border: 1px dashed #d9d9d9;
	border-radius: 6px;
	box-sizing: border-box;
	width: 945px;
	height: 260px;
	// margin: 0 10px;
	text-align: center;
	position: relative;
	background: #f8f9fd;
	// overflow: hidden;
	display: flex;
	position: relative;
}
.clipboard-left {
	width: 466px;
	// padding-top: 96px;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	/deep/ img {
		width: 34px;
		height: 34px;
	}
}
#clipboard-input {
	outline: none;
	width: 220px;
	padding-left: 3px;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
	font-size: 12px;
	margin-top: 10px;
}
.clipboard-left-img-overlay {
	position: fixed;
	width: 34px;
	height: 44px;
}
.clipboard-preview-container {
	flex: 1;
	padding: 3px;
	height: 100%;
	position: relative;
}
#clipboard-preview {
	position: relative;
	height: 100%;
	/deep/ img {
		width: 471px;
		height: 252px;
		position: absolute;
		left: 0;
		top: -1000px;
		&.active {
			top: 0;
		}
	}
}
.clipboard-preview-text {
	color: #606266;
	// margin-top: 45px;
	opacity: 0.5;
	font-size: 12px;
	height: 100%;
	vertical-align: middle;
	display: inline-block;
	&::after {
		height: 100%;
		content: '';
		vertical-align: middle;
		display: inline-block;
	}
}
.clipboard-preview-close {
	position: absolute;
	right: 5px;
	top: 5px;
	color: #606266;
	opacity: 0.5;
	cursor: pointer;
}
.clipboard-preview-close:hover {
	transform: scale(1.2);
	opacity: 1;
}
.clipboard-split {
	position: absolute;
	left: 0;
	top: 20px;
	width: 0;
	height: calc(100% - 40px);
	border-left: 1px dashed #d9d9d9;
}
.clipboard-preview-delete-wrapper {
	position: absolute;
	width: 100%;
	height: 100%;
	left: 0;
	top: 0;
	cursor: default;
	text-align: center;
	color: #fff;
	font-size: 20px;
	background-color: rgba(0, 0, 0, 0.1);
	z-index: 100;
}
.clipboard-preview-delete {
	position: absolute;
	left: 50%;
	top: 50%;
	margin-left: -10px;
	margin-top: -10px;
	cursor: pointer;
}
.clipboard-file-indicator-list {
	position: absolute;
	right: -24px;
	top: 0;
	z-index: 101;
	width: 20px;
	display: flex;
	flex-direction: column;
	li {
		padding: 6px 6px;
		.clipboard-file-indicator {
			display: block;
			opacity: 0.5;
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background-color: #ddd;
			border: none;
			outline: none;
			padding: 0;
			margin: 0;
			cursor: pointer;
		}
		&.active {
			.clipboard-file-indicator {
				background-color: #3e80f5;
			}
		}
	}
}
</style>
