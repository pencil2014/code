<template>
	<BaseDialog :config="dialogConfig" :callback="dialogCallback">
		<el-form ref="mailOnlyForm" :rules="rules" :model="createItem" label-position="right" label-width="90px" class="bookReleaseMail-form">
			<el-form-item label="收件人" prop="noticeEmail" :show-message="false" :required="true">
				<el-input @blur="emailBlur('noticeEmail', createItem.noticeEmail)" type="text" placeholder="请输入收件人" clearable v-model="createItem.noticeEmail"> </el-input>
			</el-form-item>
			<el-form-item label="抄送人" prop="noticeCcEmail" :show-message="false" :required="true">
				<el-input @blur="emailBlur('noticeCcEmail', createItem.noticeCcEmail)" type="text" placeholder="请输入抄送人" clearable v-model="createItem.noticeCcEmail"> </el-input>
			</el-form-item>
			<el-form-item label="邮件主题" prop="noticeTitle" :show-message="false" :required="true">
				<el-input type="text" placeholder="请输入邮件主题" clearable v-model="createItem.noticeTitle" maxlength="200" show-word-limit class="pr80"> </el-input>
			</el-form-item>
			<el-form-item label="邮件内容" prop="noticeContent" :show-message="false" :required="true">
				<tinymce :toolbar="tinymceConfig.toolbar" :menubar="tinymceConfig.menubar" v-model="createItem.noticeContent" :height="300" />
			</el-form-item>
			<el-form-item label="注释">
				<div class="sa-tip-class" v-for="(item, index) in tipTextList" :key="index">
					<div class="title">{{ item.title }}</div>
					<div class="text-item" v-for="(item2, index2) in item.textList" :key="index2">{{ item2 }}</div>
				</div>
			</el-form-item>
			<el-form-item label="附件" prop="soFileType" :show-message="false">
				<el-row>
					<el-col :span="24">
						<div class="sa-mail-file-temp">
							<div>模板下载:</div>
							<div v-if="podType == '2'" class="sa-mail-file-temp-item" title="模板下载" @click="handleTempDownload('plci_nna_temp.xlsx')">PL CI格式（非北美区）.xlsx</div>
							<div v-if="podType == '1'" class="sa-mail-file-temp-item" title="模板下载" @click="handleTempDownload('plci_na_temp.xlsx')">PL CI格式（北美区）.xlsx</div>
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
import { getBlNoByOrderNo, mainCustMblContact } from '@/api/order/list'
import { deptEmployeeInfo, employeeInfo } from '@/api/base'
import Tinymce from '@/components/Tinymce'
import { getDictLabel } from '@/utils/tools'

const defaultCreate = {
	noticeEmail: '',
	noticeCcEmail: '',
	fileNoList: '',
	noticeTitle: '',
	noticeContent: '',
	mailSign: ''
}

export default {
	data() {
		return {
			podType: '', // 目的港类型，1 北美区，，2，非北美区
			oQuery: this.$route.query,
			dialogConfig: {
				title: '邮件发送',
				show: true,
				notShowClose: !!this.mailOnlyparam.firstJoin,
				size: 'medium',
				width: '1100px',
				btns: [
					{ label: '发送', action: 'Confirm', type: 'primary' },
					{ label: '取消', action: 'Cancel' }
				]
			},
			createItem: Object.assign({}, defaultCreate),
			basicRules: {
				noticeEmail: [{ required: true, message: '请输入收件人', trigger: 'blur' }],
				noticeTitle: [{ required: true, message: '请输入邮件主题', trigger: 'blur' }],
				noticeContent: [{ required: true, message: '请输入邮件内容', trigger: 'blur' }],
				soFileType: [{ required: true, message: '请选择附件', trigger: 'change' }]
			},
			QINGDAO_rules: {
				chuandai: [{ required: true, message: '请输入船代', trigger: 'blur' }],
				changzhan: [{ required: true, message: '请输入场站', trigger: 'blur' }],
				changzhanContact: [{ required: true, message: '请输入场站联系人', trigger: 'blur' }]
			},
			NINGBO_rules: {
				url: [{ required: true, message: '请输入舱单网址', trigger: 'blur' }]
			},
			rules: {},
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
			footerImg: 'http://sowoll-test.oss-cn-shenzhen.aliyuncs.com/sowollmail/logo-a.png',
			headerImg: 'http://sowoll-test.oss-cn-shenzhen.aliyuncs.com/sowollmail/logo-b.png',
			serviceTypeData: {
				st01: '',
				st01: '',
				st01: '',
				st01: '',
				st01: '',
				st01: '',
				st01: '',
				st01: '',
				st01: '',
				st01: ''
			},
			tipTextList: [
				{
					title: '完整发票是指一定要有如下内容：',
					textList: [
						`1、EXPORTER 完整信息（公司名/地址/联系电话）`,
						`2、IMPORTER完整信息（公司名/地址/联系电话/联系人/ TAX NO / EORI NO(欧洲提供)）`,
						`3、SHIPMENT TREMS(贸易条款)：CIF金额（如果是EXW/FOB/FCA离岸价条款，需要发票上表明运费是多少。而且要跟PL一定保持一致）`,
						`4、HS CODE /英文品名/ 单件金额/总金额`,
						`5、其他发票应该显示的内容`
					]
				},
				{
					title: '完整装箱单是指一定要有如下内容：',
					textList: [
						`1、EXPORTER 完整信息（公司名/地址/联系电话）`,
						`2、IMPORTER完整信息（公司名/地址/联系电话/联系人/ TAX NO / EORI NO(欧洲提供)）`,
						`3、SHIPMENT TREMS(贸易条款)：CIF金额（如果是EXW/FOB/FCA离岸价条款，需要发票上表明运费是多少。而且要跟CI一定保持一致）`,
						`4、HS CODE /英文品名/ 件数/毛重/体积`,
						`5、其他装箱单一定要显示的内容`
					]
				},
				{
					title: 'PL CI格式可以按照客户自己的来，但是内容一定要齐全，参考格式如附件'
				}
			],
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
		containerTotal: {
			type: [Object, null],
			default: null
		}
	},
	created() {
		this.setDefaultContent()
	},
	mounted() {},
	computed: {
		...mapState({
			dictMap: state => state.dict.dictMap,
			shipOrderInfoData: state => state.order.orderInfoDataObj,
			railwayOrderInfoData: state => state.railway.orderInfoDataObj,
			airOrderInfoData: state => state.airTransport.airOrderInfo,
			userId: state => state.user.userId
		}),
		orderType() {
			// 海运 || 空运 || 铁路
			if (this.shipOrderInfoData && this.shipOrderInfoData.orderNo && this.shipOrderInfoData.orderNo === this.$route.query.orderNo) {
				if (['US', 'CA'].includes(this.shipOrderInfoData.ship.podPortCountryCode)) {
					this.podType = '1'
				} else {
					this.podType = '2'
				}
				return 'ship'
			} else if (this.airOrderInfoData && this.airOrderInfoData.orderNo && this.airOrderInfoData.orderNo === this.$route.query.orderNo) {
				if (['US', 'CA'].includes(this.airOrderInfoData.podCountryCode)) {
					this.podType = '1'
				} else {
					this.podType = '2'
				}
				return 'air'
			} else {
				if (['US', 'CA'].includes(this.railwayOrderInfoData.rail.podCountryCode)) {
					this.podType = '1'
				} else {
					this.podType = '2'
				}
				return 'railway'
			}
		}
	},
	watch: {},
	components: {
		BaseDialog,
		Tinymce
	},
	methods: {
		handleTempDownload(name) {
			this.$store
				.dispatch('order/downloadBlobFile', {
					uri: '/order/shipping/express/file/temp/download',
					params: {
						folder: 'excel',
						fileName: name
					}
				})
				.then(res => {
					console.log(res)
					let link = document.createElement('a')
					link.href = window.URL.createObjectURL(res)
					if (name === 'plci_nna_temp.xlsx') {
						link.download = 'PL CI格式（非北美区）.xlsx'
					} else {
						link.download = 'PL CI格式（北美区）.xlsx'
					}

					link.click()
				})
		},
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
		getUSServicesTip() {
			return `
        <p style="font-size: 12px;padding-left:24px">1、要具体说清楚是要什么服务：ISF+买BOND+换单+清关+派送+拆柜+仓储+代收款等</p>
        <p style="font-size: 12px;padding-left:24px">2、告知目的港服务项费用收哪边</p>
        <p style="font-size: 12px;padding-left:24px">3、目的港出现的异常费用,费用是收哪一方？</p>
      `
		},
		// 设置默认邮件内容
		async setDefaultContent() {
			if (this.orderType === 'ship') {
				if (['US', 'CA'].includes(this.shipOrderInfoData.ship.podPortCountryCode)) {
					let params = {
						employeeId: this.userId
					}
					// 收件人&抄送人&签名
					deptEmployeeInfo(params)
						.then(res => {
							if (res.code === 0) {
								let infoData = res.data || {}
								let { ename, cname, jobName, telephone, mobileNo, email, emailSign } = infoData
								this.createItem.noticeCcEmail = email // 抄送人邮箱
								if (emailSign) {
									this.createItem.mailSign = emailSign
								} else {
									this.createItem.mailSign = `<p style="font-size: 12px; font-family: Calibri">BestRegards</p>
									<p style="font-size: 12px; font-family: Calibri">${ename} ${cname}<br/>${jobName}</p>
									<p style="font-size: 12px; font-family: Calibri">LONGSAIL INTERNATIONAL LOGISTICS CO., LTD.<br/>Direct: ${telephone}<br/>Mobile:${mobileNo}<br/>Email:${email}<br/>Website: WWW.LONGSAILING.NET</p>`
								}
							}
						})
						.catch(err => {})

					let ecsItem = this.shipOrderInfoData.workAssign.find(el => el.jobCode == 'ecs')
					let ecsData = null //海外客服信息
					let ecsId = ecsItem ? ecsItem.employeeId : ''

					let bdData = null //销售信息
					let bdId = this.shipOrderInfoData.bdEmployeeId

					let blData = null

					// 增加主单还客服邮箱
					if (ecsId) {
						ecsData = await employeeInfo({ employeeId: ecsId })
					}

					bdData = await employeeInfo({ employeeId: bdId })

					blData = await getBlNoByOrderNo({
						orderNo: this.$route.query.orderNo
					})

					if (ecsData && ecsData.data && ecsData.data.email) {
						this.createItem.noticeEmail = ecsData.data.email
					}
					let { transport, ship, serviceList } = this.shipOrderInfoData
					let mbls = ''
					let hbls = ''
					if (blData && blData.data && blData.data.mblNos && blData.data.mblNos.length) {
						mbls = blData.data.mblNos[0]
					}
					if (blData && blData.data && blData.data.hblNos && blData.data.hblNos.length) {
						hbls = blData.data.hblNos.join(',')
					}
					let tradeTermsCode = transport && transport.tradeTermsCode ? `--${getDictLabel('tradeTermsCode', transport.tradeTermsCode)}` : ''

					let containerTotal = this.containerTotal ? `/${this.containerTotal.container}` : ''
					let mblConsigneeFristResData = await mainCustMblContact({ orderNo: this.$route.query.orderNo })
					let mblConsigneeFrist = ''
					if (mblConsigneeFristResData && mblConsigneeFristResData.data && mblConsigneeFristResData.data.consignee) {
						mblConsigneeFrist = mblConsigneeFristResData.data.consignee
					}
					this.createItem.noticeTitle = `S/A, ${this.$route.query.orderNo}${hbls ? '/' + hbls : ''}${mblConsigneeFrist ? '/' + mblConsigneeFrist : ''}${mbls ? '/' + mbls : ''}${ship.podPortName ? '/' + ship.podPortName : ''}`

					let ecsName = ''
					if (ecsData && ecsData.data) {
						ecsName = ecsData.data.ename || ecsData.data.cname
					}

					let container = ''
					if (this.containerTotal) {
						container = this.containerTotal.container
					}
					let bdName = bdData.data.ename || bdData.data.cname
					let consignee = transport ? transport.consignee : ''
					// 内容
					this.createItem.noticeContent = `
            <img src="${this.headerImg}" style="width: 88px; height: 24px;" />
						<p style="font-size: 12px;">Dear ${ecsName},</p>
						<p style="font-size: 12px;padding-left:24px">Please see attached SA (MBL+HBL+ 完整英文装箱单+完整英文发票 +其他清关文件+报价截图),</p>
						<p style="font-size: 12px;padding-left:24px">Destination Services:</p>
            ${this.getUSServicesTip()}
						<p style="font-size: 12px;padding-left:24px">CHARGES COLLECT:</p>
						<p style="font-size: 12px;padding-left:24px">MBL TELEX RELEASE</p>
						<p style="font-size: 12px;padding-left:24px">HBL TELEX RELEASE</p>
						<p style="font-size: 12px;padding-left:24px">CARRIER:${ship.shipCarrierCode || ''}</p>
						<p style="font-size: 12px;padding-left:24px">ETD:${ship.etdTime || ''}</p>
						<p style="font-size: 12px;padding-left:24px">ETA:${ship.etaTime || ''}</p>
						<p style="font-size: 12px;padding-left:24px">MBL#:${mbls}</p>
						<p style="font-size: 12px;padding-left:24px">AMS#:</p>
						<p style="font-size: 12px;padding-left:24px">LCL Container number:${container}</p>
						<p style="font-size: 12px;padding-left:24px">FREE TIME:${ship.freetimeSys || ''}</p>
						<p style="font-size: 12px;padding-left:24px">SALES PERSON NAME:${bdName}</p>
            <p style="font-size: 12px;padding-left:24px">CONSIGNEE COMPANY NAME:</p>
            <p style="font-size: 12px;padding-left:24px">Contact person:</p>
            <p style="font-size: 12px;padding-left:24px">Email:</p>
            <p style="font-size: 12px;padding-left:24px">TEL:</p>
            <p style="font-size: 12px;padding-left:24px">代收款: 金额（代收款是指需要分公司/海外供应商代收费用，需要出具代收款账单 。）</p>
            <p style="font-size: 12px;padding-left:24px">垫付: 金额（垫付是指用我司约号订舱，需要分公司/海外供应商目的港垫付运费给船公司，如果不请出就写不清楚）</p>

						${
							serviceList.includes('pod_ltl_delivery') || serviceList.includes('pod_fcl_delivery') || serviceList.includes('pod_comm_clearance') || serviceList.includes('pod_warehouse')
								? `
						<div>
							<p style="font-size: 12px;padding-left:24px">DELIVERY INFORMATION AS BELOW:</p>
							<p style="font-size: 12px;padding-left:24px">DELIVERY ADDRESS:</p>
							<p style="font-size: 12px;padding-left:24px">CONTACT PERSON:</p>
							<p style="font-size: 12px;padding-left:24px">TEL:</p>
							<p style="font-size: 12px;padding-left:24px">EMAIL:</p>
							<p style="font-size: 12px;padding-left:24px">Consignee name: 真实收货人公司名称（如果用到美国公司的抬头买单清关，需提供真实收货人公司名称.B不需要此服务就不用提供。）</p>
              <p style="font-size: 12px;padding-left:24px"> MARKS: pls reconfirm if delivery address  is correct when you make a appiontment with consignee</p>
							<p style="font-size: 12px;padding-left:24px">其他特殊要求: 按1/2/3/4分别列明：如目的港仓库是否需要提前或者线上预约/收货人的特殊要求（特殊车辆/是否有卸货能力等）/是否垫付税金 / 如果邮件一定要抄送的人员等</p>
						<div>`
								: ''
						}
            <div style="width: 100%; height: 36px; background: #0B318F;text-align: center; padding: 11px 0px; margin-top: 40px;"><img src="${this.footerImg}" style="width:125px; height:34px;"/></div>
						`
				} else {
					let ecsItem = this.shipOrderInfoData.workAssign.find(el => el.jobCode == 'ecs')
					let ecsId = ecsItem ? ecsItem.employeeId : ''
					// 增加主单还客服邮箱
					if (ecsId) {
						employeeInfo({ employeeId: ecsId }).then(res => {
							if (res.data.email) {
								this.createItem.noticeEmail = res.data.email
							}
						})
					}
					let params = {
						employeeId: this.userId
					}
					// 收件人&抄送人&签名
					deptEmployeeInfo(params)
						.then(res => {
							if (res.code === 0) {
								let infoData = res.data || {}
								let { ename, cname, jobName, telephone, mobileNo, email, emailSign } = infoData
								this.createItem.noticeCcEmail = email // 抄送人邮箱
								if (emailSign) {
									this.createItem.mailSign = emailSign
								} else {
									this.createItem.mailSign = `<p style="font-size: 12px; font-family: Calibri">BestRegards</p>
									<p style="font-size: 12px; font-family: Calibri">${ename} ${cname}<br/>${jobName}</p>
									<p style="font-size: 12px; font-family: Calibri">LONGSAIL INTERNATIONAL LOGISTICS CO., LTD.<br/>Direct:${telephone}<br/>Mobile:${mobileNo}<br/>Email:${email}<br/>Website: WWW.LONGSAILING.NET</p>`
								}
							}
						})
						.catch(err => {})
					let { transport, businessType, ship, serviceList, quoteList } = this.shipOrderInfoData
					let tradeTermsCode = transport && transport.tradeTermsCode ? `/${getDictLabel('tradeTermsCode', transport.tradeTermsCode)}` : ''
					let businessTypeCn = getDictLabel('businessType', businessType)
					// let podPortName = ship.podPortName?`/${ship.podPortName.join(',')[0]}`:''
					let podPortName = `/${ship.podPortName}`
					let polPortName = `/${ship.polPortName}`
					let quotationNumber = this.shipOrderInfoData.quotationNumber ? `/${this.shipOrderInfoData.quotationNumber}` : ''
					let quoteStr = (quoteList || [])
						.map(item => {
							return item.enquiryNo
						})
						.join(',')
					// 主题
					this.createItem.noticeTitle = `SA${tradeTermsCode}/${businessTypeCn}${polPortName}${podPortName}${quotationNumber}${quoteStr ? '/' + quoteStr : ''}/${this.$route.query.orderNo}`

					// 内容
					this.createItem.noticeContent = `
            <img src="${this.headerImg}" style="width: 88px; height: 24px;" />
						<p style="font-size: 12px;">Here attached pre-alert docs (MBL+HBL+ 完整英文装箱单+完整英文发票 +其他清关文件+报价截图)of the sub shipment.</p>
						<p style="font-size: 12px;">MBL will issue as TLX ; HBL  will issue as  Original </p>
						<p style="font-size: 12px;">Pls kindly make sure to collect our Original HBL from the cnee before releasing.</p>
						<p style="font-size: 12px;">And pls release the cargo after getting Longsail‘s MBL TLX Bill.</p>
						<p style="font-size: 12px;">Invoice will be later.</p>
						<p style="font-size: 12px;">Tks for your care.</p>
						<p style="font-size: 12px;">PORT OF LOADING:</p>
						<p style="font-size: 12px;">PORT OF DISCHARGE:</p>
						<p style="font-size: 12px;">PORT OF DELIVERY:</p>
						<p style="font-size: 12px;">CARRIER:${ship.shipCarrierCode || ''}</p>
						<p style="font-size: 12px;">ATD:${ship.tdTime || ''}</p>
						<p style="font-size: 12px;">ETA:${ship.etaTime || ''}</p>
						<p style="font-size: 12px;">Free time:${ship.freetimeSys || ''}</p>
            <p style="font-size: 12px;">CONSIGNEE COMPANY NAME:</p>
            <p style="font-size: 12px;">Contact person:</p>
            <p style="font-size: 12px;">Email:</p>
            <p style="font-size: 12px;">TEL:</p>
						${
							serviceList.includes('pod_ltl_delivery') || serviceList.includes('pod_fcl_delivery')
								? `
						<div>
							<p style="font-size: 12px;">DESTINATION SERVICES:（要具体说清楚是要什么服务，费用如何支付 ，DAP确认目的港什么费用是COSIGNEE支付）</p>
							<p style="font-size: 12px;">DELIVERY INFORMATION AS BELOW:</p>
							<p style="font-size: 12px;">ADDRESS:</p>
							<p style="font-size: 12px;">CONTACT PERSON:</p>
							<p style="font-size: 12px;">TEL:</p>
							<p style="font-size: 12px;">EMAIL:</p>
							<p style="font-size: 12px;">其他要求: 如目的港仓库是否需要线上预约/收货人的特殊要求/是否垫付税金等</p>
							<p style="font-size: 12px;">到付金额:（如果有到付需求，提供到付金额（如果需要代收海运费）+经理审批同意做到付邮件）</p>
							<p style="font-size: 12px;">垫付金额:（如果有需要垫付税金给海关或者海运费给目的港船公司或者目的港其他费用）</p>
						<div>`
								: ''
						}
            <div style="width: 100%; height: 36px; background: #0B318F;text-align: center; padding: 11px 0px; margin-top: 40px;"><img src="${this.footerImg}" style="width:125px; height:34px;"/></div>
						`
				}
			} else if (this.orderType === 'air') {
				if (['US', 'CA'].includes(this.airOrderInfoData.podCountryCode)) {
					let params = {
						employeeId: this.userId
					}
					// 收件人&抄送人&签名
					deptEmployeeInfo(params)
						.then(res => {
							if (res.code === 0) {
								let infoData = res.data || {}
								let { ename, cname, jobName, telephone, mobileNo, email, emailSign } = infoData
								this.createItem.noticeCcEmail = email // 抄送人邮箱

								if (emailSign) {
									this.createItem.mailSign = emailSign
								} else {
									this.createItem.mailSign = `<p style="font-size: 12px; font-family: Calibri">BestRegards</p>
									<p style="font-size: 12px; font-family: Calibri">${ename} ${cname}<br/>${jobName}</p>
									<p style="font-size: 12px; font-family: Calibri">LONGSAIL INTERNATIONAL LOGISTICS CO., LTD.<br/>Direct:${telephone}<br/>Mobile:${mobileNo}<br/>Email:${email}<br/>Website: WWW.LONGSAILING.NET</p>`
								}
							}
						})
						.catch(err => {})

					let ecsItem = this.airOrderInfoData.workAssign.find(el => el.jobCode == 'ecs')
					let ecsData = null //海外客服信息
					let ecsId = ecsItem ? ecsItem.employeeId : ''

					let bdData = null //销售信息
					let bdId = this.airOrderInfoData.bdEmployeeId

					let blData = null

					// 增加主单还客服邮箱
					if (ecsId) {
						ecsData = await employeeInfo({ employeeId: ecsId })
					}

					bdData = await employeeInfo({ employeeId: bdId })

					blData = await getBlNoByOrderNo({
						orderNo: this.$route.query.orderNo
					})

					if (ecsData && ecsData.data && ecsData.data.email) {
						this.createItem.noticeEmail = ecsData.data.email
					}
					let { transport, serviceList, planVoyageList } = this.airOrderInfoData
					let mbls = ''
					let hbls = ''
					if (blData && blData.data && blData.data.mblNos && blData.data.mblNos.length) {
						mbls = blData.data.mblNos[0]
					}
					if (blData && blData.data && blData.data.hblNos && blData.data.hblNos.length) {
						hbls = blData.data.hblNos.join(',')
					}
					let tradeTermsCode = transport && transport.tradeTermsCode ? `--${getDictLabel('tradeTermsCode', transport.tradeTermsCode)}` : ''

					let mblConsigneeFristResData = await mainCustMblContact({ orderNo: this.$route.query.orderNo })
					let mblConsigneeFrist = ''
					if (mblConsigneeFristResData && mblConsigneeFristResData.data && mblConsigneeFristResData.data.consignee) {
						mblConsigneeFrist = mblConsigneeFristResData.data.consignee
					}

					this.createItem.noticeTitle = `S/A, ${this.$route.query.orderNo}${hbls ? '/' + hbls : ''}${mblConsigneeFrist ? '/' + mblConsigneeFrist : ''}${mbls ? '/' + mbls : ''}${
						this.airOrderInfoData.podPortCode ? '/' + this.airOrderInfoData.podPortCode : ''
					}`

					let ecsName = ''
					if (ecsData && ecsData.data) {
						ecsName = ecsData.data.ename || ecsData.data.cname
					}

					let bdName = bdData.data.ename || bdData.data.cname
					let consignee = transport ? transport.consignee : ''

					let etdTime = ''
					let etaTime = ''
					if (this.airOrderInfoData.businessType === 'air_export') {
						if (planVoyageList && planVoyageList.length > 1) {
							etaTime = planVoyageList[1].etaTime ? planVoyageList[1].etaTime : ''
							etdTime = planVoyageList[1].etdTime ? planVoyageList[1].etdTime : ''
						}
					} else if (this.airOrderInfoData.businessType === 'air_import') {
						if (planVoyageList && planVoyageList.length > 1) {
							etaTime = planVoyageList[0].etaTime ? planVoyageList[0].etaTime : ''
							etdTime = planVoyageList[0].etdTime ? planVoyageList[0].etdTime : ''
						}
					}
					// 内容
					this.createItem.noticeContent = `
            <img src="${this.headerImg}" style="width: 88px; height: 24px;" />
						<p style="font-size: 12px;">Dear ${ecsName},</p>
						<p style="font-size: 12px;padding-left:24px">Please see attached SA (MBL+HBL+ 完整英文装箱单+完整英文发票 +其他清关文件+报价截图),</p>
						<p style="font-size: 12px;padding-left:24px">Destination Services:</p>
            ${this.getUSServicesTip()}
						<p style="font-size: 12px;padding-left:24px">CHARGES COLLECT:</p>
						<p style="font-size: 12px;padding-left:24px">MBL TELEX RELEASE</p>
						<p style="font-size: 12px;padding-left:24px">HBL TELEX RELEASE</p>
						<p style="font-size: 12px;padding-left:24px">CARRIER:${this.airOrderInfoData.airLine || ''}</p>
						<p style="font-size: 12px;padding-left:24px">ETD：${etdTime}</p>
						<p style="font-size: 12px;padding-left:24px">ETA:${etaTime}</p>
						<p style="font-size: 12px;padding-left:24px">MBL#:${mbls}</p>
						<p style="font-size: 12px;padding-left:24px">AMS#:</p>
						<p style="font-size: 12px;padding-left:24px">LCL Container number:</p>
						<p style="font-size: 12px;padding-left:24px">SALES PERSON NAME:${bdName}</p>
            <p style="font-size: 12px;padding-left:24px">CONSIGNEE COMPANY NAME:</p>
            <p style="font-size: 12px;padding-left:24px">Contact person:</p>
            <p style="font-size: 12px;padding-left:24px">Email:</p>
            <p style="font-size: 12px;padding-left:24px">TEL:</p>
            <p style="font-size: 12px;padding-left:24px">代收款: 金额（代收款是指需要分公司/海外供应商代收费用，需要出具代收款账单 。）</p>
            <p style="font-size: 12px;padding-left:24px">垫付: 金额（垫付是指用我司约号订舱，需要分公司/海外供应商目的港垫付运费给船公司，如果不请出就写不清楚）</p>

						${
							serviceList.includes('pod_ltl_delivery') || serviceList.includes('pod_fcl_delivery') || serviceList.includes('pod_comm_clearance') || serviceList.includes('pod_warehouse')
								? `
						<div>
							<p style="font-size: 12px;padding-left:24px">DELIVERY INFORMATION AS BELOW:</p>
							<p style="font-size: 12px;padding-left:24px">DELIVERY ADDRESS:</p>
							<p style="font-size: 12px;padding-left:24px">CONTACT PERSON:</p>
							<p style="font-size: 12px;padding-left:24px">TEL:</p>
							<p style="font-size: 12px;padding-left:24px">EMAIL:</p>
							<p style="font-size: 12px;padding-left:24px">Consignee name: 真实收货人公司名称（如果用到美国公司的抬头买单清关，需提供真实收货人公司名称.B不需要此服务就不用提供。）</p>
              <p style="font-size: 12px;padding-left:24px"> MARKS: pls reconfirm if delivery address  is correct when you make a appiontment with consignee</p>
							<p style="font-size: 12px;padding-left:24px">其他特殊要求: 按1/2/3/4分别列明：如目的港仓库是否需要提前或者线上预约/收货人的特殊要求（特殊车辆/是否有卸货能力等）/是否垫付税金 / 如果邮件一定要抄送的人员等</p>
						<div>`
								: ''
						}
            <div style="width: 100%; height: 36px; background: #0B318F;text-align: center; padding: 11px 0px; margin-top: 40px;"><img src="${this.footerImg}" style="width:125px; height:34px;"/></div>
						`
				} else {
					let ecsItem = this.airOrderInfoData.workAssign.find(el => el.jobCode == 'ecs')
					let ecsId = ecsItem ? ecsItem.employeeId : ''
					// 增加主单还客服邮箱
					if (ecsId) {
						employeeInfo({ employeeId: ecsId }).then(res => {
							if (res.data.email) {
								this.createItem.noticeEmail = res.data.email
							}
						})
					}
					let params = {
						employeeId: this.userId
					}
					// 收件人&抄送人&签名
					deptEmployeeInfo(params)
						.then(res => {
							if (res.code === 0) {
								let infoData = res.data || {}
								let { ename, cname, jobName, telephone, mobileNo, email, emailSign } = infoData
								this.createItem.noticeCcEmail = email // 抄送人邮箱
								if (emailSign) {
									this.createItem.mailSign = emailSign
								} else {
									this.createItem.mailSign = `<p style="font-size: 12px; font-family: Calibri">BestRegards</p>
									<p style="font-size: 12px; font-family: Calibri">${ename} ${cname}<br/>${jobName}</p>
									<p style="font-size: 12px; font-family: Calibri">LONGSAIL INTERNATIONAL LOGISTICS CO., LTD.<br/>Direct:${telephone}<br/>Mobile:${mobileNo}<br/>Email:${email}<br/>Website:WWW.LONGSAILING.NET</p>`
								}
							}
						})
						.catch(err => {})
					let { businessType, serviceList, planVoyageList, realVoyageList, transport, quoteList } = this.airOrderInfoData

					let businessTypeCn = getDictLabel('businessType', businessType)

					let podPortName = this.airOrderInfoData.podPortCode ? `/${this.airOrderInfoData.podPortCode}` : ''
					let polPortName = this.airOrderInfoData.polPortCode ? `/${this.airOrderInfoData.polPortCode}` : ''
					let quotationNumber = this.airOrderInfoData.quotationNumber ? `/${this.airOrderInfoData.quotationNumber}` : ''
					let tradeTermsCode = transport && transport.tradeTermsCode ? `/${getDictLabel('tradeTermsCode', transport.tradeTermsCode)}` : ''
					let quoteStr = (quoteList || [])
						.map(item => {
							return item.enquiryNo
						})
						.join(',')
					// 主题
					this.createItem.noticeTitle = `SA${tradeTermsCode}/${businessTypeCn}${polPortName}${podPortName}${quotationNumber}${quoteStr ? '/' + quoteStr : ''}/${this.$route.query.orderNo}`

					let atdTime = ''
					let etaTime = ''
					if (this.airOrderInfoData.businessType === 'air_export') {
						if (realVoyageList && realVoyageList.length > 1) {
							atdTime = realVoyageList[1].etdTime ? realVoyageList[1].etdTime : ''
						}
						if (planVoyageList && planVoyageList.length > 1) {
							etaTime = planVoyageList[1].etaTime ? planVoyageList[1].etaTime : ''
						}
					} else if (this.airOrderInfoData.businessType === 'air_import') {
						if (realVoyageList && realVoyageList.length > 1) {
							atdTime = realVoyageList[0].etdTime ? realVoyageList[0].etdTime : ''
						}
						if (planVoyageList && planVoyageList.length > 1) {
							etaTime = planVoyageList[0].etaTime ? planVoyageList[0].etaTime : ''
						}
					}
					// 内容
					this.createItem.noticeContent = `
            <img src="${this.headerImg}" style="width: 88px; height: 24px;" />
						<p style="font-size: 12px;">Here attached pre-alert docs (MBL+HBL+ 完整英文装箱单+完整英文发票 +其他清关文件+报价截图)of the sub shipment.</p>
						<p style="font-size: 12px;">MBL will issue as TLX; HBL  will issue as  Original </p>
						<p style="font-size: 12px;">Pls kindly make sure to collect our Original HBL from the cnee before releasing.</p>
						<p style="font-size: 12px;">And pls release the cargo after getting Longsail‘s MBL TLX Bill.</p>
						<p style="font-size: 12px;">Invoice will be later.</p>
						<p style="font-size: 12px;">Tks for your care.</p>
						<p style="font-size: 12px;">PORT OF LOADING:</p>
						<p style="font-size: 12px;">PORT OF DISCHARGE:</p>
						<p style="font-size: 12px;">PORT OF DELIVERY:</p>
						<p style="font-size: 12px;">CARRIER:${this.airOrderInfoData.airLine || ''}</p>
						<p style="font-size: 12px;">ATD:${atdTime}</p>
						<p style="font-size: 12px;">ETA:${etaTime}</p>
            <p style="font-size: 12px;">CONSIGNEE COMPANY NAME:</p>
            <p style="font-size: 12px;">Contact person:</p>
            <p style="font-size: 12px;">Email:</p>
            <p style="font-size: 12px;">TEL:</p>
						${
							serviceList.includes('pod_ltl_delivery') || serviceList.includes('pod_fcl_delivery')
								? `
						<div>
							<p style="font-size: 12px;">DESTINATION SERVICES:（要具体说清楚是要什么服务，费用如何支付 ，DAP确认目的港什么费用是COSIGNEE支付）</p>
							<p style="font-size: 12px;">DELIVERY INFORMATION AS BELOW:</p>
							<p style="font-size: 12px;">ADDRESS:</p>
							<p style="font-size: 12px;">CONTACT PERSON:</p>
							<p style="font-size: 12px;">TEL:</p>
							<p style="font-size: 12px;">EMAIL:</p>
							<p style="font-size: 12px;">其他要求: 如目的港仓库是否需要线上预约/收货人的特殊要求/是否垫付税金等</p>
							<p style="font-size: 12px;">到付金额:（如果有到付需求，提供到付金额（如果需要代收海运费）+经理审批同意做到付邮件）</p>
							<p style="font-size: 12px;">垫付金额:（如果有需要垫付税金给海关或者海运费给目的港船公司或者目的港其他费用）</p>
						<div>`
								: ''
						}
            <div style="width: 100%; height: 36px; background: #0B318F;text-align: center; padding: 11px 0px; margin-top: 40px;"><img src="${this.footerImg}" style="width:125px; height:34px;"/></div>
						`
				}
			} else {
				if (['US', 'CA'].includes(this.railwayOrderInfoData.rail.podCountryCode)) {
					let params = {
						employeeId: this.userId
					}
					// 收件人&抄送人&签名
					deptEmployeeInfo(params)
						.then(res => {
							if (res.code === 0) {
								let infoData = res.data || {}
								let { ename, cname, jobName, telephone, mobileNo, email, emailSign } = infoData
								this.createItem.noticeCcEmail = email // 抄送人邮箱
								if (emailSign) {
									this.createItem.mailSign = emailSign
								} else {
									this.createItem.mailSign = `<p style="font-size: 12px; font-family: Calibri">BestRegards</p>
									<p style="font-size: 12px; font-family: Calibri">${ename} ${cname}<br/>${jobName}</p>
									<p style="font-size: 12px; font-family: Calibri">LONGSAIL INTERNATIONAL LOGISTICS CO., LTD.<br/>Direct:${telephone}<br/>Mobile:${mobileNo}<br/>Email:${email}<br/>Website:WWW.LONGSAILING.NET</p>`
								}
							}
						})
						.catch(err => {})

					let ecsItem = this.railwayOrderInfoData.workAssign.find(el => el.jobCode == 'ecs')
					let ecsData = null //海外客服信息
					let ecsId = ecsItem ? ecsItem.employeeId : ''

					let bdData = null //销售信息
					let bdId = this.railwayOrderInfoData.main.bdEmployeeId

					let blData = null

					// 增加主单还客服邮箱
					if (ecsId) {
						ecsData = await employeeInfo({ employeeId: ecsId })
					}

					bdData = await employeeInfo({ employeeId: bdId })

					blData = await getBlNoByOrderNo({
						orderNo: this.$route.query.orderNo
					})

					if (ecsData && ecsData.data && ecsData.data.email) {
						this.createItem.noticeEmail = ecsData.data.email
					}
					let { transport, rail, serviceList } = this.railwayOrderInfoData
					let mbls = ''
					let hbls = ''
					if (blData && blData.data && blData.data.mblNos && blData.data.mblNos.length) {
						mbls = blData.data.mblNos[0]
					}
					if (blData && blData.data && blData.data.hblNos && blData.data.hblNos.length) {
						hbls = blData.data.hblNos.join(',')
					}
					let tradeTermsCode = transport && transport.tradeTermsCode ? `--${getDictLabel('tradeTermsCode', transport.tradeTermsCode)}` : ''

					let containerTotal = this.containerTotal ? `/${this.containerTotal.container}` : ''
					let mblConsigneeFristResData = await mainCustMblContact({ orderNo: this.$route.query.orderNo })
					let mblConsigneeFrist = ''
					if (mblConsigneeFristResData && mblConsigneeFristResData.data && mblConsigneeFristResData.data.consignee) {
						mblConsigneeFrist = mblConsigneeFristResData.data.consignee
					}
					this.createItem.noticeTitle = `S/A, ${this.$route.query.orderNo}${hbls ? '/' + hbls : ''}${mblConsigneeFrist ? '/' + mblConsigneeFrist : ''}${mbls ? '/' + mbls : ''}${rail.podPortName ? '/' + rail.podPortName : ''}`

					let ecsName = ''
					if (ecsData && ecsData.data) {
						ecsName = ecsData.data.ename || ecsData.data.cname
					}
					let container = ''
					if (this.containerTotal) {
						container = this.containerTotal.container
					}
					let bdName = bdData.data.ename || bdData.data.cname
					let consignee = transport ? transport.consignee : ''
					// 内容
					this.createItem.noticeContent = `
            <img src="${this.headerImg}" style="width: 88px; height: 24px;" />
						<p style="font-size: 12px;">Dear ${ecsName},</p>
						<p style="font-size: 12px;padding-left:24px">Please see attached SA (MBL+HBL+ 完整英文装箱单+完整英文发票 +其他清关文件+报价截图),</p>
						<p style="font-size: 12px;padding-left:24px">Destination Services:</p>
            ${this.getUSServicesTip()}
						<p style="font-size: 12px;padding-left:24px">CHARGES COLLECT:</p>
						<p style="font-size: 12px;padding-left:24px">MBL TELEX RELEASE</p>
						<p style="font-size: 12px;padding-left:24px">HBL TELEX RELEASE</p>
						<p style="font-size: 12px;padding-left:24px">CARRIER:</p>
						<p style="font-size: 12px;padding-left:24px">ETD:${rail.etdTime || ''}</p>
						<p style="font-size: 12px;padding-left:24px">ETA:${rail.preArriveDate || ''}</p>
						<p style="font-size: 12px;padding-left:24px">MBL#:${mbls}</p>
						<p style="font-size: 12px;padding-left:24px">AMS#:</p>
						<p style="font-size: 12px;padding-left:24px">LCL Container number:${container}</p>
						<p style="font-size: 12px;padding-left:24px">FREE TIME:</p>
						<p style="font-size: 12px;padding-left:24px">SALES PERSON NAME:${bdName}</p>
            <p style="font-size: 12px;padding-left:24px">CONSIGNEE COMPANY NAME:</p>
            <p style="font-size: 12px;padding-left:24px">Contact person:</p>
            <p style="font-size: 12px;padding-left:24px">Email:</p>
            <p style="font-size: 12px;padding-left:24px">TEL:</p>
            <p style="font-size: 12px;padding-left:24px">代收款: 金额（代收款是指需要分公司/海外供应商代收费用，需要出具代收款账单 。）</p>
            <p style="font-size: 12px;padding-left:24px">垫付: 金额（垫付是指用我司约号订舱，需要分公司/海外供应商目的港垫付运费给船公司，如果不请出就写不清楚）</p>

						${
							serviceList.includes('pod_comm_clearance') || serviceList.includes('pod_ltl_delivery') || serviceList.includes('pod_warehouse') || serviceList.includes('pod_fcl_delivery')
								? `
						<div>
							<p style="font-size: 12px;padding-left:24px">DELIVERY INFORMATION AS BELOW:</p>
							<p style="font-size: 12px;padding-left:24px">DELIVERY ADDRESS:</p>
							<p style="font-size: 12px;padding-left:24px">CONTACT PERSON:</p>
							<p style="font-size: 12px;padding-left:24px">TEL:</p>
							<p style="font-size: 12px;padding-left:24px">EMAIL:</p>
							<p style="font-size: 12px;padding-left:24px">Consignee name: 真实收货人公司名称（如果用到美国公司的抬头买单清关，需提供真实收货人公司名称.B不需要此服务就不用提供。）</p>
              <p style="font-size: 12px;padding-left:24px"> MARKS: pls reconfirm if delivery address  is correct when you make a appiontment with consignee</p>
							<p style="font-size: 12px;padding-left:24px">其他特殊要求: 按1/2/3/4分别列明：如目的港仓库是否需要提前或者线上预约/收货人的特殊要求（特殊车辆/是否有卸货能力等）/是否垫付税金 / 如果邮件一定要抄送的人员等</p>
						<div>`
								: ''
						}
            <div style="width: 100%; height: 36px; background: #0B318F;text-align: center; padding: 11px 0px; margin-top: 40px;"><img src="${this.footerImg}" style="width:125px; height:34px;"/></div>
						`
				} else {
					let ecsItem = this.railwayOrderInfoData.workAssign.find(el => el.jobCode == 'ecs')
					let ecsId = ecsItem ? ecsItem.employeeId : ''
					// 增加主单还客服邮箱
					if (ecsId) {
						employeeInfo({ employeeId: ecsId }).then(res => {
							if (res.data.email) {
								this.createItem.noticeEmail = res.data.email
							}
						})
					}
					let params = {
						employeeId: this.userId
					}
					// 收件人&抄送人&签名
					deptEmployeeInfo(params)
						.then(res => {
							if (res.code === 0) {
								let infoData = res.data || {}
								let { ename, cname, jobName, telephone, mobileNo, email, emailSign } = infoData
								this.createItem.noticeCcEmail = email // 抄送人邮箱
								if (emailSign) {
									this.createItem.mailSign = emailSign
								} else {
									this.createItem.mailSign = `<p style="font-size: 12px; font-family: Calibri">BestRegards</p>
									<p style="font-size: 12px; font-family: Calibri">${ename} ${cname}<br/>${jobName}</p>
									<p style="font-size: 12px; font-family: Calibri">LONGSAIL INTERNATIONAL LOGISTICS CO., LTD.<br/>Direct:${telephone}<br/>Mobile:${mobileNo}<br/>Email:${email}<br/>Website:WWW.LONGSAILING.NET</p>`
								}
							}
						})
						.catch(err => {})
					let { transport, main, rail, serviceList, quoteList } = this.railwayOrderInfoData
					let tradeTermsCode = transport && transport.tradeTermsCode ? `/${getDictLabel('tradeTermsCode', transport.tradeTermsCode)}` : ''
					let businessTypeCn = getDictLabel('businessType', main.businessType)
					// let podPortName = rail.podPortName?`/${rail.podPortName.join(',')[0]}`:''
					let podPortName = `/${rail.podPortName}`
					let polPortName = `/${rail.polPortName}`
					let quotationNumber = this.railwayOrderInfoData.main.quotationNumber ? `/${this.railwayOrderInfoData.main.quotationNumber}` : ''
					let quoteStr = (quoteList || [])
						.map(item => {
							return item.enquiryNo
						})
						.join(',')
					// 主题
					this.createItem.noticeTitle = `SA${tradeTermsCode}/${businessTypeCn}${polPortName}${podPortName}${quotationNumber}${quoteStr ? '/' + quoteStr : ''}/${this.$route.query.orderNo}`

					// 内容
					this.createItem.noticeContent = `
            <img src="${this.headerImg}" style="width: 88px; height: 24px;" />
						<p style="font-size: 12px;">Here attached pre-alert docs (MBL+HBL+ 完整英文装箱单+完整英文发票 +其他清关文件+报价截图)of the sub shipment.</p>
						<p style="font-size: 12px;">MBL will issue as TLX ; HBL  will issue as  Original </p>
						<p style="font-size: 12px;">Pls kindly make sure to collect our Original HBL from the cnee before releasing.</p>
						<p style="font-size: 12px;">And pls release the cargo after getting Longsail‘s MBL TLX Bill.</p>
						<p style="font-size: 12px;">Invoice will be later.</p>
						<p style="font-size: 12px;">Tks for your care.</p>
						<p style="font-size: 12px;">PORT OF LOADING:</p>
						<p style="font-size: 12px;">PORT OF DISCHARGE:</p>
						<p style="font-size: 12px;">PORT OF DELIVERY:</p>
						<p style="font-size: 12px;">CARRIER:</p>
						<p style="font-size: 12px;">ATD:${rail.tdTime || ''}</p>
						<p style="font-size: 12px;">ETA:${rail.preArriveDate || ''}</p>
						<p style="font-size: 12px;">Free time:</p>
            <p style="font-size: 12px;">CONSIGNEE COMPANY NAME:</p>
            <p style="font-size: 12px;">Contact person:</p>
            <p style="font-size: 12px;">Email:</p>
            <p style="font-size: 12px;">TEL:</p>
						${
							serviceList.includes('pod_ltl_delivery') || serviceList.includes('pod_fcl_delivery')
								? `
						<div>
							<p style="font-size: 12px;">DESTINATION SERVICES:（要具体说清楚是要什么服务，费用如何支付 ，DAP确认目的港什么费用是COSIGNEE支付）</p>
							<p style="font-size: 12px;">DELIVERY INFORMATION AS BELOW:</p>
							<p style="font-size: 12px;">ADDRESS:</p>
							<p style="font-size: 12px;">CONTACT PERSON:</p>
							<p style="font-size: 12px;">TEL:</p>
							<p style="font-size: 12px;">EMAIL:</p>
							<p style="font-size: 12px;">其他要求: 如目的港仓库是否需要线上预约/收货人的特殊要求/是否垫付税金等</p>
							<p style="font-size: 12px;">到付金额:（如果有到付需求，提供到付金额（如果需要代收海运费）+经理审批同意做到付邮件）</p>
							<p style="font-size: 12px;">垫付金额:（如果有需要垫付税金给海关或者海运费给目的港船公司或者目的港其他费用）</p>
						<div>`
								: ''
						}
            <div style="width: 100%; height: 36px; background: #0B318F;text-align: center; padding: 11px 0px; margin-top: 40px;"><img src="${this.footerImg}" style="width:125px; height:34px;"/></div>
						`
				}
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
			this.fileData = new FormData()
			this.$refs.upload.submit()
			if (this.sizeLimit) {
				const loading = this.$loading({
					lock: true,
					text: '发送中',
					spinner: 'el-icon-loading',
					background: 'rgba(0, 0, 0, 0.5)'
				})

				let data = {
					noticeEmailType: 'SA',
					orderNo: this.$route.query.orderNo,
					noticeEmail: this.createItem.noticeEmail,
					noticeCcEmail: this.createItem.noticeCcEmail,
					fileNoList: this.createItem.fileNoList,
					noticeTitle: this.createItem.noticeTitle,
					noticeContent: this.createItem.noticeContent,
					mailSign: this.createItem.mailSign
				}

				this.canSubmit = false
				this.handleProgress()
				this.$store
					.dispatch('order/soUpload', {
						uri: '/order/main/sendSa',
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
}
.edit-container .bookReleaseMail-form .el-textarea__inner {
	padding: 0 5px;
}
.sa-mail-file-temp {
	display: flex;
	font-size: 12px;
	.sa-mail-file-temp-item {
		cursor: pointer;
		color: #1890ff;
		margin-left: 12px;
		margin-right: 24px;
	}
}
.sa-tip-class {
	font-size: 12px;
}
</style>
