<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="mailOnlyForm" :rules="rules" :model="createItem" label-position="right" label-width="90px" class="sendMail-form">
			<el-form-item label="收件人" prop="noticeEmail" :show-message="false">
				<el-input @blur="emailBlur('noticeEmail', createItem.noticeEmail)" type="text" placeholder="请输入收件人邮箱（多个以逗号或者分号分隔）" clearable v-model="createItem.noticeEmail"> </el-input>
			</el-form-item>
			<div class="mailOnly-tip">请输入收件人邮箱（多个以逗号或者分号分隔）</div>
			<el-form-item label="抄送人" prop="noticeCcEmail" :show-message="false">
				<el-input @blur="emailBlur('noticeCcEmail', createItem.noticeCcEmail)" type="text" placeholder="请输入抄送人邮箱（多个以逗号或者分号分隔）" clearable v-model="createItem.noticeCcEmail"> </el-input>
			</el-form-item>
			<div class="mailOnly-tip">请输入收件人邮箱（多个以逗号或者分号分隔）</div>
			<el-form-item label="邮件主题" prop="noticeTitle" :show-message="false">
				<el-input type="text" placeholder="请输入邮件主题" clearable v-model="createItem.noticeTitle" maxlength="200" show-word-limit class="pr80"> </el-input>
			</el-form-item>
			<el-form-item label="邮件内容" prop="noticeContent" :show-message="false">
				<tinymce :toolbar="tinymceConfig.toolbar" :menubar="tinymceConfig.menubar" v-model="createItem.noticeContent" :height="300" />
			</el-form-item>
			<el-form-item label="邮件签名" prop="mailSign" :show-message="false">
				<tinymce :toolbar="tinymceConfig.toolbar" :menubar="tinymceConfig.menubar" v-model="createItem.mailSign" :height="180" ref="mailSign" />
			</el-form-item>
		</el-form>
	</BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import Tinymce from '@/components/Tinymce'
import { deptEmployeeInfo, getEmployeeInfo } from '@/api/base'
import { orderContainerList, noDropSendMailOnly } from '@/api/order/list'
import { mapState } from 'vuex'
const defaultCreate = {
	noticeEmail: '',
	noticeCcEmail: '',
	noticeTitle: '',
	noticeContent: '',
	mailSign: ''
}
export default {
	props: {
		orderInfoData: {
			type: Object,
			default: () => ({})
		}
	},
	components: {
		BaseDialog,
		Tinymce
	},
	computed: {
		...mapState({
			userId: state => state.user.userId,
			userInfo: state => state.user.userInfo,
			orderDetailCustInfo: state => state.order.custInfoObj
		}),
		isWhiteCust() {
			return ['YES', 'yes'].includes(this.orderDetailCustInfo.isWhitelist)
		},
	},
	created() {
		this.setDefaultContent()
		this.getEmployeeInfoMail()
		this.setTitle()
	},
	data() {
		return {
			pricingEname: '',
			pricingCname: '',
			pricingMail: '',
			bkgMail: '',
			bkgEname: '',
			bkgCname: '',
			bdCname: '',
			bdMail: '',
			obdMail: '',
			asstMail: '',
			oQuery: this.$route.query,
			dialogConfig: {
				title: '邮件发送',
				show: true,
				size: 'medium',
				width: '1400px',
				btns: [{ label: '发送', action: 'Confirm', type: 'primary' }]
			},
			createItem: Object.assign({}, defaultCreate),
			rules: {
				noticeEmail: [{ required: true, message: '请输入收件人', trigger: 'blur' }],
				noticeTitle: [{ required: true, message: '请输入邮件主题', trigger: 'blur' }],
				noticeContent: [{ required: true, message: '请输入邮件内容', trigger: 'blur' }]
			},
			canSubmit: true, // 可提交标识
			// 补料详情富文本编辑器配置
			tinymceConfig: {
				toolbar: ['undo redo | fontselect | fontsizeselect | forecolor backcolor bold italic underline strikethrough alignleft aligncenter alignright outdent indent table removeformat hr charmap preview fullscreen'],
				menubar: ''
			},
			EmailReg: /[,]|[，]|[;]|[；]/,
		}
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
		setTitle() {
			let { custName, shipCarrierCode, polPortCode, podPortCode, container } = this.orderInfoData
			let whiteName = ''
			if (this.isWhiteCust) {
				// 白名单
				whiteName = '【白名单】'
			}
			this.createItem.noticeTitle = whiteName + `【申请不甩柜】${this.orderDetailCustInfo.shortName || custName}，${this.oQuery.orderNo}，${shipCarrierCode}，${polPortCode}，${podPortCode}，${container}`
		},
		setDefaultContent() {
			const data = {
				employeeId: this.userId
			}
			deptEmployeeInfo(data)
				.then(res => {
					if (res.code === 0) {
						console.log(res.data)
						let infoData = res.data || {}
						let { ename, cname, jobName, telephone, mobileNo, email, emailSign } = infoData
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
		mapName(name) {
			if (name) {
				return name.split(',')[0]
			} else {
				return ''
			}
		},
		mapCn(arr) {
			let cnList = arr.map(item => {
				return '<span style="font-size: 12px;">' + item + '</span>'
			})
			return cnList.length > 0 ? cnList.join('，') : ''
		},
		setDefaultBasicTable() {
			let data = { orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo }
			orderContainerList(data).then(res => {
				let arr = []
				let dearName = ''
				if (res.data && res.data.length) {
					res.data.forEach(item => {
						item.cn && arr.push(item.cn)
					})
				}
				if (this.isWhiteCust) {
           dearName = this.pricingEname || this.pricingCname
				} else {
					 dearName = this.bkgEname || this.bkgCname
				}
				let { isWhiteCust = '', custName = '', soStr = '', shipVessel = '', shipVoyage = '', porPortName = '', polPortName = '', podPortName = '', container = '', shipCyCutOff = '', shipEtdTime = '' } = this.orderInfoData
				var str =
					'<div style="text-align:center;position:relative;margin-top:20px;"> <img style="position:absolute;left:0;" src=' +
					require('@/assets/mail-logo.png') +
					' alt=""><span style="font-weight:700;font-size:20px;color:#0B318F;">申请不甩柜</span></div>'
				str += '<p style="font-size: 12px;">Dear ' + dearName + '</p>'
				str += '<p style="font-size: 12px;">工作号' + this.oQuery.orderNo + '申请不甩柜，请及时处理</p>'
				str += '<p style="font-size: 12px;">销售：' + this.bdCname + '</p>'
				str += '<p style="font-size: 12px;">委托单位：' + custName + '</p>'
				str += '<p style="font-size: 12px;">是否白名单：' + isWhiteCust + '</p>'
				str += '<p style="font-size: 12px;">SO：' + soStr + '</p>'
				str += '<p style="font-size: 12px;">V/V：' + shipVessel + ' / ' + shipVoyage + '</p>'
				str += '<p style="font-size: 12px;">起运港：' + this.mapName(polPortName) + '</p>'
				if (porPortName) {
          str += '<p style="font-size: 12px;">驳船收货地：' + this.mapName(porPortName) + '</p>'
				}
				str += '<p style="font-size: 12px;">目的港：' + this.mapName(podPortName) + '</p>'
				str += '<p style="font-size: 12px;">箱型箱量：' + container + '</p>'
				str += '<p style="font-size: 12px;">箱号：' + this.mapCn(arr) + '</p>'
				str += '<p style="font-size: 12px;">大船截关时间：' + shipCyCutOff + '</p>'
				str += '<p style="font-size: 12px;">预计开船时间：' + shipEtdTime + '</p>'
				str += '<div style="background: #0B318F;margin-top:40px;height:58px; display:flex;justify-content:center;align-items:center;"> <img src=' + require('@/assets/mail-bottom.png') + ' alt=""></div>'

				this.createItem.noticeContent = str
			})
		},
		async getEmployeeInfoMail() {
			// 获取商务角色的邮箱
			if (this.orderInfoData.pricingEmployeeId) {
				let res = await getEmployeeInfo({ employeeId: this.orderInfoData.pricingEmployeeId })
				this.pricingMail = res?.data?.email
				this.pricingEname = res?.data?.ename
				this.pricingCname = res?.data?.cname
				console.log('🚀 ~ this.pricingMail', this.pricingMail)
			}
			// 获取bkg角色的邮箱
			if (this.orderInfoData.bkgEmployeeId) {
				let res = await getEmployeeInfo({ employeeId: this.orderInfoData.bkgEmployeeId })
				this.bkgMail = res?.data?.email
				this.bkgEname = res?.data?.ename
				this.bkgCname = res?.data?.cname
				console.log('🚀 ~ this.bkgMail', this.bkgMail)
			}
			// 获取bd角色的邮箱
			if (this.orderInfoData.bdId) {
				let resBd = await getEmployeeInfo({ employeeId: this.orderInfoData.bdId })
				this.bdMail = resBd?.data?.email
				this.bdCname = resBd?.data?.cname
				console.log('🚀 ~ this.bdMail', this.bdMail, this.bdCname)
			}
			// 获取obd角色的邮箱
			if (this.orderInfoData.obdId) {
				let resObd = await getEmployeeInfo({ employeeId: this.orderInfoData.obdId })
				this.obdMail = resObd?.data?.email
				console.log('🚀 ~ this.obdMail', this.obdMail)
			}
			// 获取asst角色的邮箱
			if (this.orderInfoData.asstId) {
				let resAsst = await getEmployeeInfo({ employeeId: this.orderInfoData.asstId })
				this.asstMail = resAsst?.data?.email
				console.log('🚀 ~ this.asstMail', this.asstMail)
			}
			let mailArr = []
			if (this.isWhiteCust) {
				this.createItem.noticeEmail = this.pricingMail
				mailArr = [this.userInfo.email, this.bkgMail, this.bdMail, this.asstMail, this.obdMail].filter(Boolean)
			} else {
				this.createItem.noticeEmail = this.bkgMail
				mailArr = [this.userInfo.email, this.pricingMail, this.bdMail, this.asstMail, this.obdMail].filter(Boolean)
			}
			let uniqArr = [...new Set(mailArr)]
			this.createItem.noticeCcEmail = uniqArr.toString()
      // 邮件内容
	   	this.setDefaultBasicTable()
			console.log('🚀 ~ this.createItem.noticeCcEmail', this.createItem.noticeCcEmail)
		},
		validateMail(text, value) {
			let check = true
			if (value) {
				let arr = value.split(',')
				arr.forEach(item => {
					let Email = item
					const emailrule = /^([a-zA-Z]|[0-9])+\.?(\w|\-|\.)+@([a-zA-Z0-9]|\-)+\.([a-zA-Z]{2,4})$/
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
						// if (!this.validateMail('收件人', this.createItem.noticeEmail)) return
						// if (!this.validateMail('抄送人', this.createItem.noticeCcEmail)) return
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
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		handleToMail() {
			const loading = this.$loading({
				lock: true,
				text: '发送中',
				spinner: 'el-icon-loading',
				background: 'rgba(0, 0, 0, 0.5)'
			})
			let { noticeEmail, noticeCcEmail, noticeTitle, noticeContent, mailSign } = this.createItem
			let data = {
				orderNo: this.$route.query.orderNo,
				noticeEmail,
				noticeCcEmail,
				noticeTitle: `${noticeTitle}【系统发送，请勿直接回复】`,
				noticeContent,
				mailSign
			}
			this.canSubmit = false
			noDropSendMailOnly(data)
				.then(res => {
					loading.close()
					if (res && res.data) {
						this.$message({ type: 'success', message: '发送成功' })
						this.close('Confirm')
					} else {
						this.$message({ type: 'error', message: '发送失败' })
					}
				})
				.catch(err => {
					this.canSubmit = true
					loading.close()
					console.log(err)
				})
		}
	}
}
</script>

<style lang="scss" scoped>
.sendMail-form {
	.mailOnly-tip {
		padding-left: 90px;
		color: #969696;
		margin-bottom: 4px;
		line-height: 20px;
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
