<template>
	<el-dialog class="drop-so-notice" @close="handleClose" title="甩柜通知" :visible="dialogOrderShow" width="800px">
		<div>
			<el-form id="drop-notice" ref="orderImportForm" :model="orderImportForm" :inline="true" label-width="105px" size="mini" :rules="orderImportRegRules">
				<p :title="so" class="drop-so-title">SO号: {{ so }}</p>
				<el-row class="create-so">
					<el-col :span="12">
						<el-form-item style="width: 100%" label="新船名:" prop="vessel" :show-message="false">
							<el-autocomplete
								style="width: 100%"
								size="mini"
								clearable
								v-model="orderImportForm.vessel"
								:fetch-suggestions="(queryString, cb) => querySearchVessel(queryString, cb)"
								placeholder="请输入"
								:maxlength="128"
								@select="value => handleSelectVessel(value)"
								@clear="value => handleClearVessel(value)"
							></el-autocomplete>
							<!-- <el-select style="width: 100%" v-model="orderImportForm.vessel" placeholder="请选择">
								<el-option v-for="op in vesselList" :key="op.value" :label="op.label" :value="op.value"></el-option>
							</el-select> -->
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item style="width: 100%" label="新航次:" prop="voyage" :show-message="false">
							<el-autocomplete
								style="width: 100%"
								size="mini"
								clearable
								v-model="orderImportForm.voyage"
								:fetch-suggestions="(queryString, cb) => querySearchVoyage(queryString, cb, orderImportForm.vessel)"
								placeholder="请输入"
								:maxlength="128"
								@select="value => handleSelectVoyage(value)"
								@clear="value => handleClearVoyage(value)"
							></el-autocomplete>
							<!-- <el-select v-model="orderImportForm.voyage" placeholder="请选择">
								<el-option v-for="op in voyageList" :key="op.value" :label="op.label" :value="op.value"></el-option>
							</el-select> -->
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item style="width: 100%" label="新大船截关时间:" prop="cutOffDate" :show-message="false">
							<elDatePickerLimit :field="'cyCutOff'" v-model="orderImportForm.cutOffDate" type="date" value-format="yyyy-MM-dd" placeholder="请选择"> </elDatePickerLimit>
						</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item style="width: 100%" class="drop-so-remark" label="甩柜备注:" prop="dnCheckApplyRemark">
							<el-input maxlength="512" show-word-limit type="textarea" autosize size="mini" v-model="orderImportForm.dnCheckApplyRemark"></el-input>
						</el-form-item>
					</el-col>

					<el-col :span="24">
						<el-form-item label="甩柜证明:" prop="fileNo" class="invoice-payment-add-form-upload" style="position: relative;width:100%;">
							<el-input
								v-model="orderImportForm.fileNo"
								style="
								position: absolute;
								right: 0;
								top: 0;
								width: 1px;
								height: 1px;
								opacity: 0;
							"
							></el-input>
							<el-upload
								ref="upload"
								drag
								id="upload-file-notice"
								class="upload-file-drop"
								action="#"
								style="width: 100%"
								:limit="2"
								:on-exceed="handleExceed"
								:multiple="true"
								:auto-upload="false"
								:before-upload="getFile"
								:on-change="handleChangeFile"
								:on-remove="handleRemove"
								:http-request="handleImport"
								:file-list="fileList"
								:disabled="!canSubmit"
							>
								<div class="file-upload file-upload-bill">
									<div>
										<img class="file-upload-img file-upload-bill-img" src="@/assets/icon-upload.png" />
									</div>

									<div class="file-upload__text file-upload-bill__text">
										<div id="text-bill" class="txt">点击或将文件拖拽到这里导入</div>
										<p id="info-bill" class="info">支持 {{ this.comTypes.join(',') }} 格式文件， 且文件大小限制在100M内</p>
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
					</el-col>
				</el-row>
			</el-form>
		</div>
		<span slot="footer" class="dialog-footer">
			<el-button type="primary" @click="submitOrder" size="mini">提交</el-button>
			<el-button size="mini" @click="closeDialog">取消</el-button>
		</span>
	</el-dialog>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { getDictLabel } from '@/utils/tools'
import FinanceUploadEmbed from './financeUploadEmbed'
import { blBillInfo, blBillUpload, blNoList } from '@/api/order/bl'

export default {
	filters: {},
	data() {
		return {
			pasted: false,
			previewImgSrc: '',
			fileListPaste: [],
			fileListEl: [], // 导入的文件列表
			fileListConcat: [],
			resFileList: [],
			clipboardVisible: false,
			showPreviewDelete: false,
			fileUid: 1,
			file: '',
			showProcess: false,
			processLength: 0,
			defaultFileSize: 5,
			overlayLeft: 0,
			overlayTop: 0,

			defaultFileSize: 100,
			processLength: 0,
			showProcess: false,
			comTypes: ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'jpg', 'png', 'jpeg', 'bmp', 'tif', 'image', 'txt', 'zip', 'rar'],
			file: null,
			pickerOptions: {
				disabledDate(time) {
					// return time.getTime() < Date.now()
				}
			},
			vesselList: [],
			voyageList: [],
			orderImportForm: {
				dnCheckApplyRemark: '',
				cutOffDate: '',
				vessel: '',
				voyage: '',
				fileNo: ''
			},
			orderImportRegRules: {
				cutOffDate: [
					{
						required: true,
						message: '新大船截关时间不能为空',
						trigger: 'change'
					}
				],
				vessel: [
					{
						required: true,
						message: '新船名不能为空',
						trigger: 'change'
					}
				],
				voyage: [
					{
						required: true,
						message: '新航次不能为空',
						trigger: 'change'
					}
				],
				fileNo: [
					{
						required: true,
						message: '附件不能为空',
						trigger: 'change'
					}
				]
			},
			uploadApi: '/order/shiporder/spacebook/bkg/drop',
			uploadParams: {},
			fileList: [],
			interval: null,
			canSubmit: true,  // 可提交标识
		}
	},
	props: {
		limit: {
			type: Number,
			default: 1
		},
		width: {
			type: Number,
			default: 160
		},
		dialogOrderShow: {
			type: Boolean,
			default: false
		},
		so: {
			type: String,
			default: ''
		}
	},
	created() {
		//获取船名数据
		this.queryVessleList().then(res => {
			this.vesselList = res
		})
		//获取船次数据
		this.queryVoyageList().then(res => {
			this.voyageList = res
		})
	},
	mounted() {},
	activated() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	components: {
		FinanceUploadEmbed
	},
	watch: {
		clipboardVisible(newVal, oldVal) {
			if (newVal) {
				this.$nextTick(() => {
					let el = document.getElementById('clipboard-input')
					el && el.focus()
				})
				setTimeout(() => {
					let Img = document.getElementsByClassName('clipboard-left-img')[0]
					let rect = Img.getBoundingClientRect()
					this.overlayLeft = rect.left
					this.overlayTop = rect.top
				}, 100)
			} else {
				this.pasted = false
				this.previewImgSrc = ''
				this.fileListPaste = []
				this.fileListEl = []
				this.fileListConcat = []
				this.resFileList = []
				this.clipboardVisible = false
				this.showPreviewDelete = false
				this.fileUid = 1
				this.file = ''
			}
		}
	},
	methods: {
		...mapActions('dict', ['queryVessleList', 'queryVoyageList']),

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
						let index2 = this.resFileList.findIndex(file => file.fileUid == fileUid)
						this.resFileList.splice(index2, 1)
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
			if (this.fileList.length + this.fileListPaste.length > this.limit) {
				this.handleExceed()
				return
			}
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
			this.orderImportForm.fileNo = this.fileUid
			this.file = file
			this.fileListPaste.push(file)
			this.setFileActive(file)
			// this.handleUpload(file)
		},
		setFileActive(file) {
			this.fileListPaste.forEach(file => {
				file.active = false
			})
			file.active = true
			this.$forceUpdate()
		},
		// 水单相关操作
		receiveResFileList(list) {
			console.log('🚀 ~ list', list)
		},
		handleExceed(file, fileList) {
			this.$message.error(`只能选择 ${this.limit} 个文件！`)
		},
		// 上传前钩子获取file名
		getFile(file) {
			this.file = file
			let sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
			if (!sizeLimit) {
				this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制')
			}
			return sizeLimit
		},
		handleChangeFile(file, fileList) {
			this.fileList = []
			this.fileList.push(file)
			this.file = file.raw
			this.orderImportForm.fileNo = file.uid
		},
		handleRemove(file, fileList) {
			this.fileList = fileList
		},
		handleImport(done) {
			console.log('🚀 ~ this.file', this.file)
			this.canSubmit = false
			this.handleProgress()
			this.$store
				.dispatch('order/soUpload', {
					uri: this.uploadApi,
					params: { fileName: this.file, data: this.uploadParams }
				})
				.then(res => {
					this.processLength = 100
					this.showProcess = false
					this.canSubmit = true
					if (res.data && res.data.msg === 'success') {
						this.$emit('close')
						this.$message({
							type: 'success',
							message: '上传成功',
							duration: 1000
						})
					}
				})
				.catch(err => {
					clearInterval(this.interval)
					this.interval = null
					this.processLength=0
					this.showProcess=false
					this.canSubmit = true
				})
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
		handleClose() {
			this.closeDialog()
		},
		// 提交修改新增账单
		submitOrder() {
			if (this.fileList.length == 0 && this.fileListPaste.length == 0) {
				return this.$message.warning('请先上传附件!')
			}
			this.$refs.orderImportForm.validate(valid => {
				if (valid) {
					if (!this.canSubmit) return
					this.uploadParams = {
						vessel: this.orderImportForm.vessel,
						voyage: this.orderImportForm.voyage,
						cutOffDate: this.orderImportForm.cutOffDate,
						remark: this.orderImportForm.dnCheckApplyRemark,
						soList: this.so.split(',')
					}
					// this.$refs.upload.submit()
					this.handleImport()
				}
			})
		},
		// 关闭新增账单弹窗
		closeDialog() {
			this.deleteFile() //清除粘贴的截图
			this.$refs.orderImportForm.resetFields()
			this.fileList = []
			this.fileListPaste = []
			this.orderImportForm = {
				dnCheckApplyRemark: '',
				cutOffDate: '',
				vessel: '',
				voyage: '',
				fileNo: ''
			}
			this.$emit('close')
		},
		// 船名输入建议
		querySearchVessel(queryString, cb) {
			this.$store.dispatch('dict/queryVessleList', { name: queryString }).then(data => {
				cb(data)
			})
		},
		handleSelectVessel(value) {},
		handleClearVessel(value) {},
		// 航次输入建议
		querySearchVoyage(queryString, cb, vessel) {
			this.$store.dispatch('dict/queryVoyageList', { name: queryString, vessel }).then(data => {
				cb(data)
			})
		},
		handleSelectVoyage(value) {},
		handleClearVoyage(value) {}
	}
}
</script>
<style lang="scss">
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
	width: 647px;
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
	width: 266px;
	// padding-top: 96px;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	img {
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
#clipboard-preview img {
	width: 378px;
	height: 252px;
	position: absolute;
	left: 0;
	top: -1000px;
	&.active {
		top: 0;
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

.drop-so-notice {
	.drop-so-title {
		padding-left: 69px;
		height: 20px;
		font-weight: 700;
		font-size: 12px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.el-dialog__body {
		overflow-y: unset;
	}

	.drop-so-remark {
		.el-form-item__content {
			textarea {
				max-height: 120px;
			}
		}
	}
	.el-form-item__content {
		width: calc(100% - 105px);
	}
	.el-form-item__label {
		font-weight: 700;
	}

	.el-input,
	.el-autocomplete,
	.el-select {
		width: 100% !important;
	}
}

#upload-file-notice .file-upload-bill-img {
	padding-right: 10px;
	margin-left: 10px;
}
#upload-file-notice .file-upload-bill__text {
	display: inline-block;
}
#upload-file-notice #text-bill {
	text-align: left;
	padding-left: 10px;
	margin-bottom: 0;
}
#upload-file-notice #info-bill {
	text-align: left;
}

#upload-file-notice .file-upload-bill {
	display: flex;
	align-items: center;
}
#drop-notice .is-required label::before {
	display: unset;
}
#drop-notice .create-so {
	.el-form-item {
		margin-bottom: 4px;
	}
}
</style>
