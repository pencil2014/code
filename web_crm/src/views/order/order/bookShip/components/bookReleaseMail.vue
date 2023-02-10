<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="mailOnlyForm" :rules="rules" :model="createItem" label-position="right" label-width="90px" class="bookReleaseMail-form">
			<el-form-item label="收件人" prop="mailTo" :show-message="false">
				<el-input @blur="emailBlur('mailTo', createItem.mailTo)" type="text" placeholder="请输入收件人邮箱（多个以英文逗号分隔）" clearable v-model="createItem.mailTo"> </el-input>
			</el-form-item>
			<el-form-item label="抄送人" prop="mailCc" :show-message="false">
				<el-input @blur="emailBlur('mailCc', createItem.mailCc)" type="text" placeholder="请输入抄送人邮箱（多个以英文逗号分隔）" clearable v-model="createItem.mailCc"> </el-input>
			</el-form-item>
			<el-form-item label="邮件主题" prop="mailTitle" :show-message="false">
				<el-input :type="mailOnlyparam.soList.length > 2 ? 'textarea' : 'text'" placeholder="请输入邮件主题" clearable v-model="createItem.mailTitle" maxlength="1024" show-word-limit class="pr80"> </el-input>
			</el-form-item>
			<el-form-item label="邮件内容" prop="mailContent" :show-message="false">
				<tinymce :toolbar="tinymceConfig.toolbar" :menubar="tinymceConfig.menubar" v-model="createItem.mailContent" :height="300" />
			</el-form-item>
			<el-form-item label="附件">
				<el-row>
					<el-col :span="8" v-for="(item, index) in exportFileTypeOptions" :key="index">
						<el-radio size="mini" v-model="createItem.soFileType" :label="item.label">
							{{ item.txt }}
						</el-radio>
					</el-col>
					<el-col :span="24" v-if="soFileNameList.length">
						<div class="init-file" v-for="(item, index) in soFileNameList" :key="index">
							<i class="el-icon-document"></i>
							{{ item }}
						</div>
					</el-col>
					<el-col :span="24">
						<el-form-item label="">
							<el-upload
								ref="upload"
								class="upload-demo"
								drag
								multiple
								action="#"
								:on-preview="handlePreview"
								:before-upload="beforeUpload"
								:on-change="handleChangeFile"
								:on-remove="handleRemove"
								:file-list="fileList"
								:http-request="uploadFile"
								:auto-upload="false"
								:disabled="!canSubmit"
							>
								<div class="el-upload">
									<img src="@/assets/icon-upload.png" />
									<div class="el-upload__text">
										<div>点击或将文件拖拽到这里导入</div>
										<p>支持 doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar 格式文件， 且文件大小限制在100M内</p>
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
			</el-form-item>
			<el-form-item label="邮件签名" prop="mailSign" :show-message="false">
				<tinymce :toolbar="tinymceConfig.toolbar" :menubar="tinymceConfig.menubar" v-model="createItem.mailSign" :height="180" ref="mailSign" />
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import { deptEmployeeInfo } from '@/api/base'
import Tinymce from '@/components/Tinymce'

const defaultCreate = {
	mailTo: '',
	mailCc: '',
	mailTitle: '',
	mailContent: '',
	soFileType: 'SHIP',
	mailSign: ''
}

export default {
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '邮件发送',
				show: true,
				notShowClose: !!this.mailOnlyparam.firstJoin,
				size: 'medium',
				width: '1100px',
				btns: [{ label: '发送', action: 'Confirm', type: 'primary' }]
			},
			createItem: Object.assign({}, defaultCreate),
			rules: {
				mailTo: [{ required: true, message: '请输入收件人', trigger: 'blur' }],
				mailTitle: [{ required: true, message: '请输入邮件主题', trigger: 'blur' }],
				mailContent: [{ required: true, message: '请输入邮件内容', trigger: 'blur' }]
			},
			canSubmit: true, // 可提交标识
			exportFileTypeOptions: [{ label: 'SHIP', txt: 'SO附件' }],
			// 补料详情富文本编辑器配置
			tinymceConfig: {
				toolbar: ['undo redo | fontselect | fontsizeselect | forecolor backcolor bold italic underline strikethrough alignleft aligncenter alignright outdent indent table removeformat hr charmap preview fullscreen'],
				menubar: ''
			},
			showProcess: false,
			processLength: 0,
			soFileNameList: [],
			file: '',
			fileList: [],
			fileData: '',
			defaultFileSize: 100,
			sizeLimit: true,
			interval: null,
			pasted: false,
			previewImgSrc: '',
			// resFileList: [],
			fileListPaste: [],
			showPreviewDelete: false,
			fileUid: 1,
			overlayLeft: 0,
			overlayTop: 0,
		}
	},
	props: {
		mailOnlyparam: {
			type: Object,
			default: () => ({})
		},
		orderInfoData: {
			type: Object,
			default: () => ({})
		},
		isAdjust: {
			type: Boolean,
			default: false
		}
	},
	created() {
		this.createItem.mailTo = this.orderInfoData.opEmployeeMail
		this.soFileNameList = this.getSoParamList('soFileName')
		this.setDefaultContent()
	},
	mounted() {},
	watch: {},
	components: {
		BaseDialog,
		Tinymce
	},
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
		emailBlur(param, value) {
			let val = ''
			value = value + ''
			if (value) {
				let emailArr = value.split(',').map(item => {
					return item.trim() // 清除首尾空格
				})
				emailArr = Array.from(new Set(emailArr)) // 邮件去重
				val = emailArr.join(',')
			}
			this.createItem[param] = val
		},
		// 设置默认邮件内容
		setDefaultContent() {
			console.log('详情信息：', this.orderInfoData)
			let { bkgEmployeeName, launchEmployeeName, orderNo } = this.orderInfoData
			// 邮件主题
			let soStr = this.getSoStr()
			if (this.isAdjust) {
				this.createItem.mailTitle = `工作号${orderNo} ，已调整箱型箱量并重新放舱，请根据要求放舱给客户${soStr}`
			} else {
				this.createItem.mailTitle = `工作号${orderNo} ，${bkgEmployeeName}已放舱，请根据要求放舱给客户${soStr}`
			}
			// http://lstest.com/#/order/order/orderBook/NEC22010000020?orderNo=NEC22010000020&source=orderList&action=&showContainer=true&showBl=true&showRelate=false
			let hrefUrl = `${window.location.origin}/#/order/order/orderBook/${orderNo}?orderNo=${orderNo}&source=orderList&action=&showContainer=true&showBl=true&showRelate=false`
			let firstTitle = ''
			if (this.isAdjust) {
				firstTitle = `工作号${orderNo} ，调整箱型箱量后，${bkgEmployeeName}已重新放舱，点击<a href=${hrefUrl} target="_blank" style="color:blue;cursor:pointer;">这里</a>查看详情，请根据要求放舱给客户`
			} else {
				firstTitle = `工作号${orderNo} ，业务建单人${launchEmployeeName}，${bkgEmployeeName}已放舱，点击<a href=${hrefUrl} target="_blank" style="color:blue;cursor:pointer;">这里</a>查看详情，请根据要求放舱给客户`
			}
			// 邮件内容
			let soTableHtml = this.setDefaultSOTable()
			let basicTableHtml = this.setDefaultBasicTable()
			let remarkTableHtml = this.setDefaultRemarkTable()
			this.createItem.mailContent = `<p style="font-size: 12px;">${firstTitle}</p>
             <p>${basicTableHtml}</p>
						 <p>${soTableHtml}</p>
						 <p>${remarkTableHtml}</p>
			 <p></p>
            `
			// 设置签名
			const data = {
				employeeId: this.mailOnlyparam.opEmployeeId
			}
			deptEmployeeInfo(data)
				.then(res => {
					if (res.code === 0) {
						console.log(res.data)
						let infoData = res.data || {}
						let { ename, cname, jobName, telephone, mobileNo, email, emailSign } = infoData
						// 抄送人
						this.createItem.mailCc = `${email}`
						if (emailSign) {
							this.createItem.mailSign = emailSign
						} else {
							this.createItem.mailSign = `<p style="font-size: 12px; font-family: Calibri">BestRegards</p>
							<p style="font-size: 12px; font-family: Calibri">${ename},${cname}<br/>${jobName}</p>
							<p style="font-size: 12px; font-family: Calibri">LONGSAIL INTERNATIONAL LOGISTICS CO., LTD.<br/>Direct: ${telephone}<br/>Mobile: ${mobileNo}<br/>Website: WWW.LONGSAILING.NET</p>`
						}
					}
				})
				.catch(err => {
					console.log('err', err)
				})
		},
		getSoStr() {
			if (this.mailOnlyparam.soList.length) {
				let arr = this.mailOnlyparam.soList.map(item => {
					return item.so
				})
				return `（SO：${arr.join(',')}）`
			} else {
				return ''
			}
		},
		setDefaultBasicTable() {
			let { polPortCode = '', podPortCode = '', custName = '', container = '' } = this.orderInfoData
			var str = '<div>基本信息</div>'
			str += '<table style="border-collapse: collapse; width: 100%;" border="1">'
			str += '<tr><th>委托单位</th><th>起运港</th><th>目的地</th><th>柜型柜量</th></tr>'
			str += '<tr>'
			str += "<td style='width: 25%;text-align: center;'>" + custName + '</td>'
			str += "<td style='width: 25%;text-align: center;'>" + polPortCode + '</td>'
			str += "<td style='width: 25%;text-align: center;'>" + podPortCode + '</td>'
			str += "<td style='width: 25%;text-align: center;'>" + container + '</td>'
			str += '</tr>'
			str += '</table>'
			return str
		},
		setDefaultSOTable() {
			var str = "<div style='margin-top:10px;'>SO信息</div>"
			str += '<table style="border-collapse: collapse; width: 100%;" border="1">'
			str += '<tr><th>so号</th><th>so备注</th></tr>'
			let len = this.mailOnlyparam.soList.length
			console.log('so文件列表：', this.mailOnlyparam.soList)
			if (len) {
				for (let i = 0; i < len; i++) {
					str += '<tr>'
					str += "<td style='width: 50%;text-align: center;'>" + this.mailOnlyparam.soList[i].so + '</td>'
					str += "<td style='width: 50%;text-align: center;'>" + this.mailOnlyparam.soList[i].remark + '</td>'
					str += '</tr>'
				}
			} else {
				str += "<tr><td style='width: 50%;text-align: center;'></td><td style='width: 50%;text-align: center;'></td></tr>"
			}
			str += '</table>'
			return str
		},
		setDefaultRemarkTable() {
			// let { polPortCode = '', podPortCode = '', custName = '', container = '' } = this.orderInfoData
			var str = "<div style='margin-top:10px;'>备注信息</div>"
			str += '<table style="border-collapse: collapse; width: 100%;" border="1">'
			str += '<tr>'
			str += "<td style='width: 25%;text-align: center;'>订舱备注</td>"
			str += "<td style='width: 75%;text-align: left;overflow: hidden;white-space: normal;word-break: break-all;'>" + this.mailOnlyparam.bkgRemark + '</td>'
			str += '</tr>'
			str += '</table>'
			return str
		},
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
		handlePreview(file) {
			let url = ''
			if (window['createObjcectURL'] != undefined) {
				url = window['createObjcectURL'](file.raw)
			} else if (window['URL'] != undefined) {
				url = window['URL'].createObjectURL(file.raw)
			} else if (window['webkitURL'] != undefined) {
				url = window['webkitURL'].createObjectURL(file.raw)
			}
			window.open(url)
		},
		uploadFile(file) {
			this.fileData.append('fileName', file.file)
			//this.file = file.file
		},
		beforeUpload(file) {
			this.file = file
			this.sizeLimit = file.size / 1024 / 1024 < this.defaultFileSize
			if (!this.sizeLimit) {
				this.$message.error('上传文件大小超过' + this.defaultFileSize + 'M限制')
			}
			return this.sizeLimit
		},
		handleChangeFile(file, fileList) {
			this.fileList = fileList
			console.log('this.fileList：', this.fileList)
		},
		handleRemove(file, fileList) {
			this.fileList = fileList
		},
		getSoParamList(type) {
			let list = this.mailOnlyparam.soList
			if (list.length) {
				return list.map(item => {
					return item[type]
				})
			} else {
				return []
			}
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		validateMail(text, value) {
			let check = true
			if (value) {
				let arr = value.split(',')
				arr.forEach(item => {
					let Email = item
					const emailrule = /^([a-zA-Z]|[0-9])+\.?(\w|\-|\.)+@([a-zA-Z0-9]|\-)+\.([a-zA-Z]{2,4})$/;
					if (!emailrule.test(Email)) {
						check = false
						this.$message.error(`${text}请输入有效邮箱,多个以英文逗号分隔`)
					}
				})
			}
			return check
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.mailOnlyForm.validate(valid => {
					if (valid) {
						if (!this.validateMail('收件人', this.createItem.mailTo)) return
            if (!this.validateMail('抄送人', this.createItem.mailCc)) return
						if (!this.canSubmit) return
						this.handleToMail()
					} else {
						console.log('error submit!!')
						return false
					}
				})
			} else {
				this.close('Cancel')
			}
		},
		// 邮件发送
		handleToMail() {
			this.fileData = new FormData()
			this.$refs.upload.submit()
			if (this.sizeLimit) {
				const loading = this.$loading({
					lock: true,
					text: '发送中',
					spinner: 'el-icon-loading',
					background: 'rgba(0, 0, 0, 0.5)'
				})
				let { soFileType, mailTo, mailCc, mailTitle, mailContent, mailSign } = this.createItem
				let params = {
					data: {
						orderNo: this.$route.query.orderNo,
						soList: this.getSoParamList('so'),
						soFileType,
						mailTo,
						mailCc,
						mailTitle: `${mailTitle}【系统发送，请勿直接回复】`,
						mailContent,
						mailSign
					},
					fileName: this.fileList.concat(this.fileListPaste.map(item => {
						return { ...item, raw: item }
					}))
				}
				this.canSubmit = false
				this.handleProgress()
				this.$store
					.dispatch('order/soUpload', {
						uri: '/order/shiporder/book/release/mailToOp',
						params
					})
					.then(res => {
						this.processLength = 100
						this.showProcess = false
						this.fileList = []
						this.canSubmit = true
						loading.close()
						if (res.data.code === 0) {
							this.$message({
								type: 'success',
								message: '发送成功',
								duration: 1000,
								onClose: () => {
									this.close('Confirm')
								}
							})
						}
					})
					.catch(err => {
						loading.close()
						clearInterval(this.interval)
						this.interval = null
						this.processLength=0
						this.showProcess=false
						this.fileList = []
						this.canSubmit = true
					})
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.bookReleaseMail-form {
	/deep/.el-upload {
		padding: 10px 0;
	}
	.el-form-item {
		margin-bottom: 4px !important;
	}
	.el-form-item__label,
	.el-form-item__content {
		line-height: 20px;
	}
	.el-input,
	.el-textarea {
		font-size: 12px;
	}
	.el-form-item.is-error .mce-tinymce {
		border-color: #ff4949;
	}
	.el-radio__label {
		font-size: 12px;
	}
	.pr80 .el-input__inner {
		padding-right: 80px;
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
}
.edit-container .bookReleaseMail-form .el-textarea__inner {
	padding: 0 5px;
}
.init-file {
	font-size: 12px;
	i {
		color: #c0c4cc;
	}
}
</style>
