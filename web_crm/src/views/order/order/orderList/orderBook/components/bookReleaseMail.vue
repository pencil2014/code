<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback" >
    <el-form ref="mailOnlyForm" :rules="rules" :model="createItem" label-position="right" label-width="90px" class="bookReleaseMail-form">
			<el-form-item label="收件人" prop="mailTo" :show-message="false">
				<el-input  @blur="emailBlur('noticeEmail', createItem.mailTo)" type="text" placeholder="请输入收件人" clearable v-model="createItem.mailTo">
				</el-input>
			</el-form-item>
			<el-form-item label="抄送人" prop="mailCc" :show-message="false">
				<el-input  @blur="emailBlur('noticeEmail', createItem.mailCc)" type="text" placeholder="请输入抄送人" clearable v-model="createItem.mailCc">
				</el-input>
			</el-form-item>
      <el-form-item label="邮件主题" prop="mailTitle" :show-message="false">
        <el-input type="text" placeholder="请输入邮件主题" clearable v-model="createItem.mailTitle" maxlength="200" show-word-limit class="pr80">
        </el-input>
      </el-form-item>
      <el-form-item label="邮件内容" prop="mailContent" :show-message="false">
				<tinymce :toolbar="tinymceConfig.toolbar" :menubar="tinymceConfig.menubar" v-model="createItem.mailContent" :height="300" />
      </el-form-item>
			<el-form-item label="附件" prop="soFileType" :show-message="false">
				<el-row>
					<el-col :span="8" v-for="(item, index) in exportFileTypeOptions" :key="index">
						<el-radio @change="handleChangeFileType" size="mini" v-model="createItem.soFileType" :label="item.label">
							{{ item.txt }}
						</el-radio>
					</el-col>
					<el-col :span="24">
					<el-form-item label="">
						<el-upload
							ref="upload"
							style="margin-top:10px;"
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
							<div class="upload-demo" >
								<img src="@/assets/icon-upload.png" />
								<div class="el-upload__text">
									<div>点击或将文件拖拽到这里导入</div>
									<p>
										支持 doc、docx、pdf、xls、xlsx、jpg、png、jpeg、bmp、tif、image、txt、zip、rar 格式文件， 且文件大小限制在100M内
									</p>
								</div>
							</div>
						</el-upload>
						<el-progress v-show="showProcess" :percentage="processLength" :stroke-width="2"></el-progress>
					</el-form-item>
				</el-col>
				</el-row>
			</el-form-item>
			<template v-if="createItem.soFileType === 'QINGDAO'">
        <el-form-item label="船代" prop="chuandai" :show-message="false">
          <el-input type="text" size="mini" placeholder="请输入" clearable v-model="createItem.chuandai"></el-input>
        </el-form-item>
        <el-form-item label="场站" prop="changzhan" :show-message="false">
          <el-input type="text" size="mini" placeholder="请输入" clearable v-model="createItem.changzhan"></el-input>
        </el-form-item>
        <el-form-item label="场站联系人" prop="changzhanContact" :show-message="false">
          <el-input type="text" size="mini" placeholder="请输入" clearable v-model="createItem.changzhanContact"></el-input>
        </el-form-item>
      </template>
      <template v-if="createItem.soFileType === 'NINGBO'">
        <el-form-item label="舱单网址" prop="url" :show-message="false">
          <el-input type="text" size="mini" placeholder="请输入" clearable v-model="createItem.url"></el-input>
        </el-form-item>
      </template>
			<el-form-item label="邮件签名" prop="mailSign" :show-message="false">
        <!-- <el-input type="textarea" :rows="6" placeholder="请输入" v-model="createItem.mailSign">
        </el-input> -->
				<tinymce :toolbar="tinymceConfig.toolbar" :menubar="tinymceConfig.menubar" v-model="createItem.mailSign" :height="180" ref="mailSign"/>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { bookReleaseMailOnly } from '@/api/order/list'
import {deptEmployeeInfo} from '@/api/base'
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
	url: ''
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
					{label: '发送', action: 'Confirm', type: 'primary'},
          {label: '取消', action: 'Cancel'}
        ]
			},
			createItem: Object.assign({}, defaultCreate),
			basicRules: {
				mailTo: [{ required: true, message: '请输入收件人', trigger: 'blur' }],
				mailTitle: [{ required: true, message: '请输入邮件主题', trigger: 'blur' }],
				mailContent: [{ required: true, message: '请输入邮件内容', trigger: 'blur' }],
				soFileType: [{ required: true, message: '请选择附件', trigger: 'change' }]
			},
			QINGDAO_rules: {
        chuandai: [{required: true, message: '请输入船代', trigger: 'blur'}],
        changzhan: [{required: true, message: '请输入场站', trigger: 'blur'}],
        changzhanContact: [{required: true, message: '请输入场站联系人', trigger: 'blur'}]
      },
      NINGBO_rules: {
        url: [{required: true, message: '请输入舱单网址', trigger: 'blur'}],
      },
			rules: {},
			canSubmit: true, // 可提交标识
			exportFileTypeOptions: [
				{ label: 'SHIP', txt: '船东SO附件' },
				{ label: 'QINGDAO', txt: '青岛格式SO附件' },
				{ label: 'NINGBO', txt: '宁波格式SO附件' }
			],
			// 补料详情富文本编辑器配置
      tinymceConfig: {
        toolbar: ['undo redo | fontselect | fontsizeselect | forecolor backcolor bold italic underline strikethrough alignleft aligncenter alignright outdent indent table removeformat hr charmap preview fullscreen'],
        menubar: ''
			},
			showProcess: false,
			processLength: 0,
			file: '',
			fileList: [],
			fileData:'',
			defaultFileSize: 100,
			sizeLimit: true,
			interval: null
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
			default: () => ([])
		}
	},
	created() {
		if (this.createItem.soFileType === 'SHIP') {
			this.rules = {...this.basicRules}
		} else if (this.createItem.soFileType === 'QINGDAO') {
			this.rules = {...this.basicRules, ...this.QINGDAO_rules}
		} else if (this.createItem.soFileType === 'NINGBO'){
			this.rules = {...this.basicRules, ...this.NINGBO_rules}
		}
		this.setDefaultContent()
	},
	mounted() {
	},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap
		}),
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
			if(value) {
			let emailArr = Array.from(new Set(value.split(',')))
			val = emailArr.join(',')
			}
			this.createItem[param] = val
		},
		handleProgress(file, fileList){
			this.processLength=0
			this.showProcess=true
			this.interval=setInterval(()=>{
				if(this.processLength>=99){
					clearInterval(this.interval)
					return 
				}
				this.processLength+=1
			},200)
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
			this.fileData.append('fileName', file.file);
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
			if(time) {
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
			let {custName, orderNo, ship} = this.orderInfoData
			ship['vgmCutOff'] = this.mapDate(ship['vgmCutOff'])
			ship['siCutOff'] = this.mapDate(ship['siCutOff'])
			let {soList} = this.mailOnlyparam
			let soStr = ''
			let polPortName = ''
			let podPortName = ''
			let vesselAndVoyage = ''
			let containerInfo = ''
			soList.map((item, index) => {
				soStr += index ? ','+item : item
			})
			let polPortNameArr = this.selectedData.map(item => item.polPortName)
			polPortNameArr = new Set(polPortNameArr)
			polPortNameArr = Array.from(polPortNameArr)
			polPortName = polPortNameArr.toString()
			let podPortNameArr = this.selectedData.map(item => item.podPortName)
			podPortNameArr = new Set(podPortNameArr)
			podPortNameArr = Array.from(podPortNameArr)
			podPortName = podPortNameArr.toString()
			let vesselAndVoyageArr = this.selectedData.map(item => item.vesselAndVoyage)
			vesselAndVoyageArr = new Set(vesselAndVoyageArr)
			vesselAndVoyageArr = Array.from(vesselAndVoyageArr)
			vesselAndVoyage = vesselAndVoyageArr.toString()
			// console.log('polPortName', polPortNameArr)
			this.selectedData.map((item, index) => {
				// polPortName += index ? ','+item.polPortName : item.polPortName
				// podPortName += index ? ','+item.podPortName : item.podPortName
				// vesselAndVoyage += index ? ','+item.vesselAndVoyage : item.vesselAndVoyage,
				containerInfo += index ? '+'+item.containerInfo : item.containerInfo
			})
			console.log('containerInfo', containerInfo);
			// 邮件主题
			this.createItem.mailTitle = `${custName}  ${orderNo}  ${polPortName}  ${podPortName}  ${vesselAndVoyage}  ${containerInfo}`
			// 邮件内容
			this.createItem.mailContent = `<p style="font-size: 12px;">Dear Customer</p>
			<p style="font-size: 12px;">您好，感谢您向我司订舱哦，很高兴为您服务~</p>
			<p style="font-size: 12px;">请您查收附件的S/O请核对无误再装柜，请务必核对好 SO上的起运港、目的港、柜型柜量等信息：</p>
			<p style="font-size: 12px;">SO号：${soStr}</p>
			<p style="font-size: 12px;">开舱时间：</p>
			<p style="font-size: 12px;">截VGM时间：${ship.vgmCutOff}</p>
			<p style="font-size: 12px;">截SI时间：${ship.siCutOff}</p>
			<p style="font-size: 12px;">截关时间：${ship.cyCutOff || ''}</p>
			<p style="font-size: 12px;">SI请注意：如需核对我司格式的补料草单，请在提供补料的时候说明，否则我司默认只接收一次性补料哈。谢谢~</p>
			<p style="font-size: 12px;">如有您有任何的疑问，请您及时联系我，谢谢~~</p>
			<p></p>
			<p style="font-size: 12px;">温馨提醒：</p>
			<p style="font-size: 12px;">1.品名如含有电池、油类、气体、液体、粉末、制冷剂和含磁性产品，请在装柜前提供资料审核，审核通过后方可做柜。<br/>
			2.货物含木质包装需要熏蒸后再出运，以免中国海关查验不过关而退场,目的港无法清关而退运</p>`
			// 设置签名
			const data = {
        employeeId: this.mailOnlyparam.opEmployeeId
      }
      deptEmployeeInfo(data).then(res => {
        if (res.code === 0) {
					console.log(res.data);
					let infoData = res.data || {}
					let {ename, cname, jobName, telephone, mobileNo, email, emailSign} = infoData
					// 抄送人
					this.createItem.mailCc = `${email}`
					if(emailSign) {
						this.createItem.mailSign = emailSign
					} else {
						this.createItem.mailSign = `<p style="font-size: 12px; font-family: Calibri">BestRegards</p>
						<p style="font-size: 12px; font-family: Calibri">${ename} ${cname}<br/>${jobName}</p>
						<p style="font-size: 12px; font-family: Calibri">LONGSAIL INTERNATIONAL LOGISTICS CO., LTD.<br/>Direct: ${telephone}<br/>Mobile: ${mobileNo}<br/>Email: ${email}<br/>Website: WWW.LONGSAILING.NET</p>`
					}
					
        }
      }).catch(err=>{
				console.log('err', err);
      })
		},
		handleChangeFileType(val) {
			this.$refs.mailOnlyForm.clearValidate()
			if (val === 'SHIP') {
				this.rules = {...this.basicRules}
			} else if (val === 'QINGDAO') {
        this.rules = {...this.basicRules, ...this.QINGDAO_rules}
      } else if (val === 'NINGBO'){
        this.rules = {...this.basicRules, ...this.NINGBO_rules}
      }
		},
		close(action, value, type) {
			this.$emit('close', action, value, type)
		},
		dialogCallback(action, done) {
			if (action === 'Confirm') {
				this.$refs.mailOnlyForm.validate(valid => {
					if (valid) {
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
			this.fileData = new FormData();
			this.$refs.upload.submit()
			if (this.sizeLimit) {
				const loading = this.$loading({
					lock: true,
					text: '发送中',
					spinner: 'el-icon-loading',
					background: 'rgba(0, 0, 0, 0.5)'
				});
				let {soFileType, mailTo, mailCc, mailTitle, mailContent, mailSign, chuandai, changzhan, changzhanContact, url} = this.createItem
				let query = {
					orderNo: this.$route.query.orderNo, 
					soList: this.mailOnlyparam.soList,
					soFileType,
					mailTo,
					mailCc,
					mailTitle: `${mailTitle}【系统发送，请勿直接回复】`,
					mailContent,
					mailSign
				}
				let data = {}
				if (soFileType === 'SHIP') {
					data = {...query}
				}
				if (soFileType === 'QINGDAO') {
					data = {...query, param: {changzhan, changzhanContact, chuandai}}
				}
				if (soFileType === 'NINGBO') {
					data = {...query, param: {url}}
				}
				this.canSubmit = false
				this.handleProgress()
				this.$store.dispatch('order/soUpload', {
					uri: '/order/shiporder/book/release/mailonly',
					params: { data, fileName: this.fileList}
				}).then(res => {
					this.processLength=100
					this.showProcess=false
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
				}).catch(err => {
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

<style lang="scss">
.bookReleaseMail-form {
   .upload-demo {
     padding: 10px 0;
   }
  .el-form-item{
    margin-bottom: 4px !important;
  }
  .el-form-item__label, .el-form-item__content{
    line-height: 20px;
  }
  .el-input, .el-textarea{
    font-size: 12px;
	}
	.el-form-item.is-error .mce-tinymce {
		border-color: #ff4949;
	}
	.el-radio__label{
		font-size: 12px;
	}
	.pr80 .el-input__inner{
		padding-right: 80px;
	}
}
.edit-container .bookReleaseMail-form .el-textarea__inner{
  padding: 0 5px;
}
</style>
