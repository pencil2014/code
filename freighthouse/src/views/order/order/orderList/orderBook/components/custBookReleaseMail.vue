<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="mailOnlyForm" :rules="rules" :model="createItem" label-position="right" label-width="90px" class="bookReleaseMail-form">
			<el-form-item label="收件人" prop="mailTo" :show-message="false">
				<el-input @blur="emailBlur('mailTo', createItem.mailTo)" type="text" placeholder="请输入收件人邮箱（多个以逗号或者分号分隔）" clearable v-model="createItem.mailTo"> </el-input>
			</el-form-item>
			<div class="mailOnly-tip">请输入收件人邮箱（多个以逗号或者分号分隔）</div>
			<el-form-item label="抄送人" prop="mailCc" :show-message="false">
				<el-input @blur="emailBlur('mailCc', createItem.mailCc)" type="text" placeholder="请输入抄送人邮箱（多个以逗号或者分号分隔）" clearable v-model="createItem.mailCc"> </el-input>
			</el-form-item>
			<div class="mailOnly-tip">请输入抄送人邮箱（多个以逗号或者分号分隔）</div>
			<el-form-item label="邮件主题" prop="mailTitle" :show-message="false">
				<el-input type="textarea" :rows="2" placeholder="请输入邮件主题" clearable v-model="createItem.mailTitle" maxlength="200" show-word-limit class="pr80"> </el-input>
			</el-form-item>
			<el-form-item label="邮件内容" prop="mailContent" :show-message="false">
				<tinymce :toolbar="tinymceConfig.toolbar" :menubar="tinymceConfig.menubar" v-model="createItem.mailContent" :height="300" />
			</el-form-item>
			<el-form-item label="附件" prop="soFileType" :show-message="false">
				<el-row>
					<el-col :span="24" v-if="createItem.fileNoList.length">
						<div class="init-file" v-for="(item, index) in createItem.fileNoList" :key="index">
							<i class="el-icon-document"></i>
							<span class="file-name" @click="handleViewFile(item)">{{ item.fileName }}</span>
						</div>
					</el-col>
					<el-col :span="24">
						<el-form-item label="">
							<el-upload
								ref="upload"
								style="margin-top: 10px"
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
								<div class="upload-demo">
									<img src="@/assets/icon-upload.png" />
									<div class="el-upload__text">
										<div>点击或将文件拖拽到这里导入</div>
										<p>支持 doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar 格式文件， 且文件大小限制在100M内</p>
									</div>
								</div>
							</el-upload>
							<el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
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
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { bookReleaseMailOnly, releaseContactInfo } from '@/api/order/list'
import { deptEmployeeInfo } from '@/api/base'
import Tinymce from '@/components/Tinymce'

const defaultCreate = {
	mailTo: '',
	mailCc: '',
	mailTitle: '',
	mailContent: '',
	soFileType: 'SHIP',
	mailSign: '',
	chuandai: '',
	changzhan: '',
	changzhanContact: '',
	url: '',
	fileNoList: []
}

export default {
	data() {
		return {
			oQuery: this.$route.query,
			dialogConfig: {
				title: '邮件发送',
				show: true,
				size: 'medium',
				width: '1100px',
				btns: [
					{ label: '发送', action: 'Confirm', type: 'primary' },
					{ label: '取消', action: 'Cancel' }
				]
			},
			createItem: Object.assign({}, defaultCreate),
			rules: {
				mailTo: [{ required: true, message: '请输入收件人', trigger: 'blur' }],
				mailTitle: [{ required: true, message: '请输入邮件主题', trigger: 'blur' }],
				mailContent: [{ required: true, message: '请输入邮件内容', trigger: 'blur' }],
				soFileType: [{ required: true, message: '请选择附件', trigger: 'change' }]
			},

			canSubmit: true, // 可提交标识

			// 补料详情富文本编辑器配置
			tinymceConfig: {
				toolbar: ['undo redo | fontselect | fontsizeselect | forecolor backcolor bold italic underline strikethrough alignleft aligncenter alignright outdent indent table removeformat hr charmap preview fullscreen'],
				menubar: ''
			},
			showProcess: false,
			processLength: 0,
			file: '',
			fileList: [],
			fileData: '',
			defaultFileSize: 100,
			sizeLimit: true,
			interval: null,
			EmailReg: /[,]|[，]|[;]|[；]/,
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
		selectedData: {
			type: Array,
			default: () => []
		}
	},
	created() {
		this.setDefaultContent()
		this.getFileList()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		})
	},
	watch: {},
	components: {
		BaseDialog,
		Tinymce
	},
	methods: {
		emailBlur(param, value) {
			// 邮件去重
			let val = ''
			value = value + ''
			if (value) {
				let emailArr = value.split(this.EmailReg).filter(item => {
					return item && item.trim()
				}).map(item => {
					return item.trim() // 清除首尾空格
				})
				emailArr = Array.from(new Set(emailArr)) // 邮件去重
				val = emailArr.join(',')
			}
			this.createItem[param] = val
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
		mapDate(time) {
			if (time) {
				if (time.length > 13) {
					return time.slice(0, 13)
				} else {
					return time
				}
			} else {
				return ''
			}
		},
		// 设置默认邮件内容
		setDefaultContent() {
			console.log('this.selectedData', this.selectedData)
			let { custName, orderNo, ship } = this.orderInfoData
			let soStr = ''
			let polPortName = this.selectedData[0].polPortName
			let podPortName = this.selectedData[0].podPortName
			let porPortName = this.orderInfoData.barge?.porPortName ? `${this.orderInfoData.barge.porPortName} - ` : ''
			let containerInfo = ''

			this.selectedData.map((item, index) => {
				if (index < 5) {
					soStr += index === 4 ? ` ${item.so}等` : index ? ` ${item.so}` : `${item.so}`
				}

				containerInfo += index ? '+' + item.containerInfo : item.containerInfo
			})
			// 合并箱型箱量，并计算数量
			let containerTotalStr = this.getContainerTotal(containerInfo)
			// 邮件主题
			this.createItem.mailTitle = `放舱 ${orderNo} SO：${soStr} ${custName} ${porPortName}${polPortName} - ${podPortName} ${containerTotalStr} CLS：${ship.cyCutOff} ${ship.shipCarrierCode} // ${ship.vessel} - ${ship.voyage}`
			// 邮件内容
			this.createItem.mailContent = `
				<div style="text-align:center;position:relative;margin-top:20px;"> <img style="position:absolute;left:0;" src=${require('@/assets/sowoll-logo.png')} alt=""><span style="font-weight:700;font-size:20px;color:#0092A0;">sowoll订单放舱通知</span></div>
				<p style="font-size: 12px;">尊敬的sowoll客户，您好！</p>
				<p style="font-size: 12px;">您的订单已放舱，请确认不含敏感货（电池/油/液体/粉末/碳墨等）再做柜</p>
				<p style="font-size: 12px;">截单时间如下，请在截止时间前给到资料，如需延截请提前告知</p>
				<p style="font-size: 12px;">截VGM时间：</p>
				<p style="font-size: 12px;">截SI时间：</p>
				<p style="font-size: 12px;">为了避免产生不必要的费用，请您在此时间前提供补料，非常感谢您的配合</p>
				<p style="font-size: 12px;">可前往平台提供补料信息，点击前往：<a style='cursor:pointer;' href='https://www.sowoll.com/'> https://www.sowoll.com/</a></p>
				<p style="font-size: 12px;">补料要求如下：</p>
				<div style="background: #0092A0;margin-top:40px;height:58px; display:flex;justify-content:center;align-items:center;"> <img src=${require('@/assets/sowoll-bottom.png')} alt=""></div>
			`
			// 设置签名
			const data = {
				employeeId: this.mailOnlyparam.opEmployeeId
			}
			// 获取放舱联系人和客户邮箱
			releaseContactInfo({ orderNo: this.$route.query.orderNo }).then(res => {
				if (res.code === 0) {
					let mailToArr = [res.data.releaseContactEmail, res.data.email].filter(Boolean)
					this.createItem.mailTo = [...new Set(mailToArr)].toString().replaceAll(';', ',')
					this.emailBlur('mailTo', this.createItem.mailTo)
				}
			})
			deptEmployeeInfo(data)
				.then(res => {
					if (res.code === 0) {
						console.log(res.data)
						let infoData = res.data || {}
						let { ename, cname, jobName, telephone, mobileNo, email, emailSign } = infoData
						// // 抄送人
						// this.createItem.mailCc = `${email}`
						// 签名
						if (emailSign) {
							this.createItem.mailSign = emailSign
						} else {
							this.createItem.mailSign = `<p style="font-size: 12px; font-family: Calibri">BestRegards</p>
						<p style="font-size: 12px; font-family: Calibri">${ename} ${cname}<br/>${jobName}</p>
						<p style="font-size: 12px; font-family: Calibri">LONGSAIL INTERNATIONAL LOGISTICS CO., LTD.<br/>Direct: ${telephone}<br/>Mobile: ${mobileNo}<br/>Email: ${email}<br/>Website: WWW.LONGSAILING.NET</p>`
						}
					}
				})
				.catch(err => {
					console.log('err', err)
				})
			let { workAssign } = this.orderInfoData
			let jobArr = ['bd', 'obd', 'asst', 'op', 'doc']
			let mailCc = []
			workAssign.forEach((item, index) => {
				if (jobArr.includes(item.jobCode) && item.employeeId) {
					deptEmployeeInfo({
						employeeId: item.employeeId
					}).then(res => {
						let infoData = res.data || {}
						let { email } = infoData
						mailCc.unshift(email)
						mailCc = new Set(mailCc)
						mailCc = Array.from(mailCc)
						this.createItem.mailCc = mailCc.join(',')
						// this.createItem.mailCc += index ? `,${email}` : `${email}`
					})
				}
			})
		},
		// 合并箱型箱量，并计算数量
		getContainerTotal(containerInfo) {
			let splitArr = containerInfo.split('+')
			let containerInfoArr = splitArr.map(item => {
				return {
					containerType: item.split('*')[0],
					num: item.split('*')[1]
				}
			})
			let containerTypeArr = containerInfoArr.map(item => item.containerType)
			containerTypeArr = [...new Set(containerTypeArr)]
			let mergeArr = []
			// console.log('containerInfoArr', containerInfoArr)
			// console.log('containerTypeArr', containerTypeArr)
			containerTypeArr.forEach(item => {
				let arr = containerInfoArr.filter(keys => keys.containerType === item)
				let sum = arr.reduce((a, b) => Number(a) + Number(b.num), 0)
				mergeArr.push({
					containerType: item,
					containerNum: sum
				})
			})
			let totalStr = ''
			mergeArr.forEach((item, index) => {
				if (item.containerType || item.containerNum) {
					totalStr += index ? `+${item.containerType}*${item.containerNum}` : `${item.containerType}*${item.containerNum}`
				}
			})
			return totalStr
		},
		getFileList() {
			this.createItem.fileNoList = this.selectedData.map(item => {
				return {
					fileName: item.soFileName,
					fileNo: item.soFileNo
				}
			})
		},
		handleViewFile(item) {
			this.$store.dispatch('order/previewFile', { fileNo: item.fileNo, fileName: item.fileName })
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		validateMail(text, value) {
			let check = true
			if (value) {
				let arr = value.split(this.EmailReg)
				arr.forEach(item => {
					let Email = item
					const emailrule = /^([a-zA-Z]|[0-9])+\.?(\w|\-|\.)+@([a-zA-Z0-9]|\-)+\.([a-zA-Z]{2,4})$/;
					if (!emailrule.test(Email)) {
						check = false
						this.$message.error(`${text}请输入有效邮箱,多个以逗号或者分号分隔`)
					}
				})
			}
			return check
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.mailOnlyForm.validate(valid => {
					if (valid) {
						// if (!this.validateMail('收件人', this.createItem.mailTo)) return
            // if (!this.validateMail('抄送人', this.createItem.mailCc)) return
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
				let { soFileType, mailTo, mailCc, mailTitle, mailContent, mailSign, chuandai, changzhan, changzhanContact, url, fileNoList } = this.createItem
				let data = {
					orderNo: this.$route.query.orderNo,
					soList: this.mailOnlyparam.soList,
					noticeEmail: mailTo,
					noticeCcEmail: mailCc,
					noticeTitle: `${mailTitle}【系统发送，请勿直接回复】`,
					noticeContent: mailContent,
					mailSign,
					systemType: 'SWMNG',
					defaultFileNoList: fileNoList.map(item => item.fileNo)
				}
				// let data = {}
				// if (soFileType === 'SHIP') {
				// 	data = { ...query }
				// }

				this.canSubmit = false
				this.handleProgress()
				this.$store
					.dispatch('order/soUpload', {
						uri: '/order/main/release/only',
						params: { data, fileName: this.fileList }
					})
					.then(res => {
						this.processLength = 100
						this.showProcess = false
						this.fileList = []
						this.canSubmit = true
						loading.close()
						if (res === 'error') return
						this.$message({
							type: 'success',
							message: '发送成功',
							duration: 1000,
							onClose: () => {
								this.close('Confirm')
							}
						})
					})
					.catch(err => {
						loading.close()
						clearInterval(this.interval)
						this.interval = null
						this.processLength = 0
						this.showProcess = false
						this.fileList = []
						this.canSubmit = true
					})
			}
		}
	}
}
</script>

<style lang="scss">
.bookReleaseMail-form {
	.mailOnly-tip {
		padding-left: 90px;
		color: #969696;
		margin-bottom: 4px;
		line-height: 20px;
	}
	.upload-demo {
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
	.init-file {
		font-size: 12px;
		i {
			color: #c0c4cc;
		}
		.file-name {
			color: #1890ff;
			cursor: pointer;
		}
	}
}
.edit-container .bookReleaseMail-form .el-textarea__inner {
	padding: 0 5px;
}
</style>
