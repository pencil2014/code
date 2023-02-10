<template>
  <BaseDialog :config="dialogConfig" :callback="dialogCallback">
    <el-form ref="mailOnlyForm" :rules="rules" :model="createItem" label-position="right" label-width="90px" class="bookReleaseMail-form">
      <el-form-item label="收件人" prop="noticeEmail" :show-message="false" :required="true">
        <el-input @blur="emailBlur('noticeEmail', createItem.noticeEmail)" type="text" placeholder="请输入收件人" clearable v-model="createItem.noticeEmail">
        </el-input>
      </el-form-item>
      <el-form-item label="抄送人" prop="noticeCcEmail" :show-message="false" :required="true">
        <el-input @blur="emailBlur('noticeEmail', createItem.noticeCcEmail)" type="text" placeholder="请输入抄送人" clearable v-model="createItem.noticeCcEmail">
        </el-input>
      </el-form-item>
      <el-form-item label="邮件主题" prop="noticeTitle" :show-message="false" :required="true">
        <el-input type="text" placeholder="请输入邮件主题" clearable v-model="createItem.noticeTitle" maxlength="200" show-word-limit class="pr80">
        </el-input>
      </el-form-item>
      <el-form-item label="邮件内容" prop="noticeContent" :show-message="false" :required="true">
        <tinymce :toolbar="tinymceConfig.toolbar" :menubar="tinymceConfig.menubar" v-model="createItem.noticeContent" :height="300" />
      </el-form-item>
      <el-form-item label="附件" prop="soFileType" :show-message="false">
        <el-row>
          <el-col :span="24">
            <div class="sa-mail-file-temp">
              <div>模板下载:</div>
              <div v-if="podType=='2'" class="sa-mail-file-temp-item" title="模板下载" @click="handleTempDownload('plci_nna_temp.xlsx')">PL CI格式（非北美区）.xlsx</div>
              <div v-if="podType=='1'" class="sa-mail-file-temp-item" title="模板下载" @click="handleTempDownload('plci_na_temp.xlsx')">PL CI格式（北美区）.xlsx</div>
            </div>
          </el-col>
          <el-col :span="24">
            <el-form-item label="">
              <el-upload ref="upload" style="margin-top:10px;" drag multiple action="#" :on-preview="handlePreview" :before-upload="beforeUpload" :on-change="handleChangeFile" :on-remove="handleRemove" :file-list="fileList" :http-request="uploadFile" :auto-upload="false" :disabled="!canSubmit">
                <div class="upload-demo">
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
      <el-form-item label="邮件签名" prop="mailSign" :show-message="false">
        <tinymce :toolbar="tinymceConfig.toolbar" :menubar="tinymceConfig.menubar" v-model="createItem.mailSign" :height="180" ref="mailSign" />
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import { getBlNoByOrderNo } from '@/api/order/list'
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
        noticeEmail: [
          { required: true, message: '请输入收件人', trigger: 'blur' }
        ],
        noticeTitle: [
          { required: true, message: '请输入邮件主题', trigger: 'blur' }
        ],
        noticeContent: [
          { required: true, message: '请输入邮件内容', trigger: 'blur' }
        ],
        soFileType: [
          { required: true, message: '请选择附件', trigger: 'change' }
        ]
      },
      QINGDAO_rules: {
        chuandai: [{ required: true, message: '请输入船代', trigger: 'blur' }],
        changzhan: [{ required: true, message: '请输入场站', trigger: 'blur' }],
        changzhanContact: [
          { required: true, message: '请输入场站联系人', trigger: 'blur' }
        ]
      },
      NINGBO_rules: {
        url: [{ required: true, message: '请输入舱单网址', trigger: 'blur' }]
      },
      rules: {},
      canSubmit: true, // 可提交标识
      // 补料详情富文本编辑器配置
      tinymceConfig: {
        toolbar: [
          'undo redo | fontselect | fontsizeselect | forecolor backcolor bold italic underline strikethrough alignleft aligncenter alignright outdent indent table removeformat hr charmap preview fullscreen'
        ],
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
      footerImg: require('../../images/sa_mail_footer.png'),
      headerImg: require('../../images/sa_mail_logo1.png'),
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
      }
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
      dictMap: (state) => state.dict.dictMap,
      shipOrderInfoData: (state) => state.order.orderInfoDataObj,
      railwayOrderInfoData: (state) => state.railway.orderInfoDataObj,
      airOrderInfoData: (state) => state.airTransport.airOrderInfo,
      userId: (state) => state.user.userId
    }),
    orderType() {
      // 海运 || 空运 || 铁路
      if (
        this.shipOrderInfoData &&
        this.shipOrderInfoData.orderNo &&
        this.shipOrderInfoData.orderNo === this.$route.query.orderNo
      ) {
        if (
          ['US', 'CA'].includes(this.shipOrderInfoData.ship.podPortCountryCode)
        ) {
          this.podType = '1'
        } else {
          this.podType = '2'
        }
        return 'ship'
      } else if (
        this.airOrderInfoData &&
        this.airOrderInfoData.orderNo &&
        this.airOrderInfoData.orderNo === this.$route.query.orderNo
      ) {
        if (['US', 'CA'].includes(this.airOrderInfoData.countryCode)) {
          this.podType = '1'
        } else {
          this.podType = '2'
        }
        return 'air'
      } else {
        if (
          ['US', 'CA'].includes(this.railwayOrderInfoData.rail.podCountryCode)
        ) {
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
        .then((res) => {
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
        let emailArr = Array.from(new Set(value.split(',')))
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
    async setDefaultContent() {
      if (this.orderType === 'ship') {
        if (
          ['US', 'CA'].includes(this.shipOrderInfoData.ship.podPortCountryCode)
        ) {
          let params = {
            employeeId: this.userId
          }
          // 收件人&抄送人&签名
          deptEmployeeInfo(params)
            .then((res) => {
              if (res.code === 0) {
                let infoData = res.data || {}
                let {
                  ename,
                  cname,
                  jobName,
                  telephone,
                  mobileNo,
                  email,
                  emailSign
                } = infoData
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
            .catch((err) => {})

          let ecsItem = this.shipOrderInfoData.workAssign.find(
            (el) => el.jobCode == 'ecs'
          )
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
          let tradeTermsCode =
            transport && transport.tradeTermsCode
              ? `--${getDictLabel('tradeTermsCode', transport.tradeTermsCode)}`
              : ''

          let containerTotal = this.containerTotal
            ? `/${this.containerTotal.container}`
            : ''
          this.createItem.noticeTitle = `SA${tradeTermsCode} FROM ${ship.polPortName} TO ${ship.podPortName}${containerTotal}/${this.$route.query.orderNo}#`

          let ecsName = ''
          if (ecsData && ecsData.data) {
            ecsName = ecsData.data.ename || ecsData.data.cname
          }
          let mbls = ''
          if (
            blData &&
            blData.data &&
            blData.data.mblNos &&
            blData.data.mblNos.length
          ) {
            mbls = blData.data.mblNos.join(',')
          }
          let container = ''
          if (this.containerTotal) {
            container = this.containerTotal.container
          }
          let bdName = bdData.data.ename || bdData.data.cname
          let consignee = transport ? transport.consignee : ''
          // 内容
          this.createItem.noticeContent = `
            <img src="${window.location.protocol}//${window.location.host}${
            this.headerImg
          }" style="width: 10%;"/>
						<p style="font-size: 12px;">Dear ${ecsName},</p>
						<p style="font-size: 12px;padding-left:24px">Please see attached SA (MBL+HBL+ 完整英文装箱单+完整英文发票 +其他清关文件),</p>
						<p style="font-size: 12px;padding-left:24px">Destination Services:</p>
						<p style="font-size: 12px;padding-left:24px">CHARGES COLLECT:</p>
						<p style="font-size: 12px;padding-left:24px">MBL TELEX RELEASE</p>
						<p style="font-size: 12px;padding-left:24px">HBL TELEX RELEASE</p>
						<p style="font-size: 12px;padding-left:24px">CARRIER:${
              ship.shipCarrierCode || ''
            }</p>
						<p style="font-size: 12px;padding-left:24px">ETD:${ship.etdTime || ''}</p>
						<p style="font-size: 12px;padding-left:24px">ETA:${ship.etaTime || ''}</p>
						<p style="font-size: 12px;padding-left:24px">MBL#:${mbls}</p>
						<p style="font-size: 12px;padding-left:24px">AMS#:</p>
						<p style="font-size: 12px;padding-left:24px">LCL Container number:${container}</p>
						<p style="font-size: 12px;padding-left:24px">FREE TIME:${
              ship.freetimeSys || ''
            }</p>
						<p style="font-size: 12px;padding-left:24px">SALES PERSON NAME:${bdName}</p>
						<p style="font-size: 12px;padding-left:24px">SALES PERSON EMAIL:${
              bdData.data.email
            }</p>
						<p style="font-size: 12px;padding-left:24px">CNEE Name:${consignee}</p>
						<p style="font-size: 12px;padding-left:24px">CNEE EMAIL:</p>
						<p style="font-size: 12px;padding-left:24px">CNEE TEL:</p>
						<p style="font-size: 12px;padding-left:24px">到付:</p>
						<p style="font-size: 12px;padding-left:24px">垫付:</p>

						${
              serviceList.includes('pod_ltl_delivery') ||
              serviceList.includes('pod_fcl_delivery') ||
              serviceList.includes('pod_comm_clearance') ||
              serviceList.includes('pod_warehouse')
                ? `
						<div>
							<p style="font-size: 12px;padding-left:24px">DELIVERY INFORMATION AS BELOW:</p>
							<p style="font-size: 12px;padding-left:24px">DELIVERY ADDRESS:</p>
							<p style="font-size: 12px;padding-left:24px">CONTACT PERSON:</p>
							<p style="font-size: 12px;padding-left:24px">TEL:</p>
							<p style="font-size: 12px;padding-left:24px">EMAIL:</p>
							<p style="font-size: 12px;padding-left:24px">真实收货人公司名称:</p>
							<p style="font-size: 12px;padding-left:24px">其他特殊要求:</p>
						<div>`
                : ''
            }
            <img src="${window.location.protocol}//${window.location.host}${
            this.footerImg
          }" style="width: 100%;margin-top:24px"/>
						`
        } else {
          let ecsItem = this.shipOrderInfoData.workAssign.find(
            (el) => el.jobCode == 'ecs'
          )
          let ecsId = ecsItem ? ecsItem.employeeId : ''
          // 增加主单还客服邮箱
          if (ecsId) {
            employeeInfo({ employeeId: ecsId }).then((res) => {
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
            .then((res) => {
              if (res.code === 0) {
                let infoData = res.data || {}
                let {
                  ename,
                  cname,
                  jobName,
                  telephone,
                  mobileNo,
                  email,
                  emailSign
                } = infoData
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
            .catch((err) => {})
          let { transport, businessType, ship, serviceList } =
            this.shipOrderInfoData
          let tradeTermsCode =
            transport && transport.tradeTermsCode
              ? `/${getDictLabel('tradeTermsCode', transport.tradeTermsCode)}`
              : ''
          let businessTypeCn = getDictLabel('businessType', businessType)
          // let podPortName = ship.podPortName?`/${ship.podPortName.join(',')[0]}`:''
          let podPortName = `/${ship.podPortName}`
          let polPortName = `/${ship.polPortName}`
          let quotationNumber = this.shipOrderInfoData.quotationNumber
            ? `/${this.shipOrderInfoData.quotationNumber}`
            : ''
          // 主题
          this.createItem.noticeTitle = `SA${tradeTermsCode}/${businessTypeCn}${polPortName}${podPortName}${quotationNumber}/${this.$route.query.orderNo}`

          // 内容
          this.createItem.noticeContent = `
            <img src="${window.location.protocol}//${window.location.host}${
            this.headerImg
          }" style="width: 10%;"/>
						<p style="font-size: 12px;">Here attached pre-alert docs (MBL+HBL+ 完整英文装箱单+完整英文发票 +其他清关文件)of the sub shipment.</p>
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
						${
              serviceList.includes('pod_ltl_delivery') ||
              serviceList.includes('pod_fcl_delivery')
                ? `
						<div>
							<p style="font-size: 12px;">DESTINATION SERVICES:</p>
							<p style="font-size: 12px;">DELIVERY INFORMATION AS BELOW:</p>
							<p style="font-size: 12px;">ADDRESS:</p>
							<p style="font-size: 12px;">CONTACT PERSON:</p>
							<p style="font-size: 12px;">TEL:</p>
							<p style="font-size: 12px;">EMAIL:</p>
							<p style="font-size: 12px;">其他要求:</p>
							<p style="font-size: 12px;">到付金额:</p>
							<p style="font-size: 12px;">垫付金额:</p>
						<div>`
                : ''
            }
            <img src="${window.location.protocol}//${window.location.host}${
            this.footerImg
          }" style="width: 100%;margin-top:24px"/>
						`
        }
      } else if (this.orderType === 'air') {
        if (['US', 'CA'].includes(this.airOrderInfoData.countryCode)) {
          let params = {
            employeeId: this.userId
          }
          // 收件人&抄送人&签名
          deptEmployeeInfo(params)
            .then((res) => {
              if (res.code === 0) {
                let infoData = res.data || {}
                let {
                  ename,
                  cname,
                  jobName,
                  telephone,
                  mobileNo,
                  email,
                  emailSign
                } = infoData
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
            .catch((err) => {})

          let ecsItem = this.airOrderInfoData.workAssign.find(
            (el) => el.jobCode == 'ecs'
          )
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
          let tradeTermsCode =
            transport && transport.tradeTermsCode
              ? `--${getDictLabel('tradeTermsCode', transport.tradeTermsCode)}`
              : ''

          this.createItem.noticeTitle = `SA FROM${tradeTermsCode} ${this.airOrderInfoData.polPortCode} TO ${this.airOrderInfoData.podPortCode}/${this.$route.query.orderNo}#`

          let ecsName = ''
          if (ecsData && ecsData.data) {
            ecsName = ecsData.data.ename || ecsData.data.cname
          }
          let mbls = ''
          if (
            blData &&
            blData.data &&
            blData.data.mblNos &&
            blData.data.mblNos.length
          ) {
            mbls = blData.data.mblNos.join(',')
          }

          let bdName = bdData.data.ename || bdData.data.cname
          let consignee = transport ? transport.consignee : ''

          let etdTime=''
          let etaTime=''
          if(this.airOrderInfoData.businessType === 'air_export'){
            if(planVoyageList && planVoyageList.length>1){
              etaTime=planVoyageList[1].etaTime?planVoyageList[1].etaTime:''
              etdTime=planVoyageList[1].etdTime?planVoyageList[1].etdTime:''
            }
          }else if(this.airOrderInfoData.businessType === 'air_import'){
            if(planVoyageList && planVoyageList.length>1){
              etaTime=planVoyageList[0].etaTime?planVoyageList[0].etaTime:''
              etdTime=planVoyageList[0].etdTime?planVoyageList[0].etdTime:''
            }
          }
          // 内容
          this.createItem.noticeContent = `
            <img src="${window.location.protocol}//${window.location.host}${
            this.headerImg
          }" style="width: 10%;"/>
						<p style="font-size: 12px;">Dear ${ecsName},</p>
						<p style="font-size: 12px;padding-left:24px">Please see attached SA (MBL+HBL+ 完整英文装箱单+完整英文发票 +其他清关文件),</p>
						<p style="font-size: 12px;padding-left:24px">Destination Services:</p>
						<p style="font-size: 12px;padding-left:24px">CHARGES COLLECT:</p>
						<p style="font-size: 12px;padding-left:24px">MBL TELEX RELEASE</p>
						<p style="font-size: 12px;padding-left:24px">HBL TELEX RELEASE</p>
						<p style="font-size: 12px;padding-left:24px">CARRIER:${
              this.airOrderInfoData.airLine || ''
            }</p>
						<p style="font-size: 12px;padding-left:24px">ETD：${etdTime}</p>
						<p style="font-size: 12px;padding-left:24px">ETA:${etaTime}</p>
						<p style="font-size: 12px;padding-left:24px">MBL#:${mbls}</p>
						<p style="font-size: 12px;padding-left:24px">AMS#:</p>
						<p style="font-size: 12px;padding-left:24px">LCL Container number:</p>
						<p style="font-size: 12px;padding-left:24px">SALES PERSON NAME:${bdName}</p>
						<p style="font-size: 12px;padding-left:24px">SALES PERSON EMAIL:${
              bdData.data.email
            }</p>
						<p style="font-size: 12px;padding-left:24px">CNEE Name:${consignee}</p>
						<p style="font-size: 12px;padding-left:24px">CNEE EMAIL:</p>
						<p style="font-size: 12px;padding-left:24px">CNEE TEL:</p>
						<p style="font-size: 12px;padding-left:24px">到付:</p>
						<p style="font-size: 12px;padding-left:24px">垫付:</p>

						${
              serviceList.includes('pod_ltl_delivery') ||
              serviceList.includes('pod_fcl_delivery') ||
              serviceList.includes('pod_comm_clearance') ||
              serviceList.includes('pod_warehouse')
                ? `
						<div>
							<p style="font-size: 12px;padding-left:24px">DELIVERY INFORMATION AS BELOW:</p>
							<p style="font-size: 12px;padding-left:24px">DELIVERY ADDRESS:</p>
							<p style="font-size: 12px;padding-left:24px">CONTACT PERSON:</p>
							<p style="font-size: 12px;padding-left:24px">TEL:</p>
							<p style="font-size: 12px;padding-left:24px">EMAIL:</p>
							<p style="font-size: 12px;padding-left:24px">真实收货人公司名称:</p>
							<p style="font-size: 12px;padding-left:24px">其他特殊要求:</p>
						<div>`
                : ''
            }
            <img src="${window.location.protocol}//${window.location.host}${
            this.footerImg
          }" style="width: 100%;margin-top:24px"/>
						`
        } else {
          let ecsItem = this.airOrderInfoData.workAssign.find(
            (el) => el.jobCode == 'ecs'
          )
          let ecsId = ecsItem ? ecsItem.employeeId : ''
          // 增加主单还客服邮箱
          if (ecsId) {
            employeeInfo({ employeeId: ecsId }).then((res) => {
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
            .then((res) => {
              if (res.code === 0) {
                let infoData = res.data || {}
                let {
                  ename,
                  cname,
                  jobName,
                  telephone,
                  mobileNo,
                  email,
                  emailSign
                } = infoData
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
            .catch((err) => {})
          let { businessType, serviceList, planVoyageList, realVoyageList, transport } = this.airOrderInfoData

          let businessTypeCn = getDictLabel('businessType', businessType)

          let podPortName = this.airOrderInfoData.podPortCode
            ? `/${this.airOrderInfoData.podPortCode}`
            : ''
          let polPortName = this.airOrderInfoData.polPortCode
            ? `/${this.airOrderInfoData.polPortCode}`
            : ''
          let quotationNumber = this.airOrderInfoData.quotationNumber
            ? `/${this.airOrderInfoData.quotationNumber}`
            : ''
          let tradeTermsCode =
            transport && transport.tradeTermsCode
              ? `/${getDictLabel('tradeTermsCode', transport.tradeTermsCode)}`
              : ''
          // 主题
          this.createItem.noticeTitle = `SA${tradeTermsCode}/${businessTypeCn}${polPortName}${podPortName}${quotationNumber}/${this.$route.query.orderNo}`

          let atdTime=''
          let etaTime=''
          if(this.airOrderInfoData.businessType === 'air_export'){
            if(realVoyageList && realVoyageList.length>1){
              atdTime=realVoyageList[1].etdTime?realVoyageList[1].etdTime:''
            }
            if(planVoyageList && planVoyageList.length>1){
              etaTime=planVoyageList[1].etaTime?planVoyageList[1].etaTime:''
            }
          }else if(this.airOrderInfoData.businessType === 'air_import'){
            if(realVoyageList && realVoyageList.length>1){
              atdTime=realVoyageList[0].etdTime?realVoyageList[0].etdTime:''
            }
            if(planVoyageList && planVoyageList.length>1){
              etaTime=planVoyageList[0].etaTime?planVoyageList[0].etaTime:''
            }
          }
          // 内容
          this.createItem.noticeContent = `
            <img src="${window.location.protocol}//${window.location.host}${
            this.headerImg
          }" style="width: 10%;"/>
						<p style="font-size: 12px;">Here attached pre-alert docs (MBL+HBL+ 完整英文装箱单+完整英文发票 +其他清关文件)of the sub shipment.</p>
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
						${
              serviceList.includes('pod_ltl_delivery') ||
              serviceList.includes('pod_fcl_delivery')
                ? `
						<div>
							<p style="font-size: 12px;">DESTINATION SERVICES:</p>
							<p style="font-size: 12px;">DELIVERY INFORMATION AS BELOW:</p>
							<p style="font-size: 12px;">ADDRESS:</p>
							<p style="font-size: 12px;">CONTACT PERSON:</p>
							<p style="font-size: 12px;">TEL:</p>
							<p style="font-size: 12px;">EMAIL:</p>
							<p style="font-size: 12px;">其他要求:</p>
							<p style="font-size: 12px;">到付金额:</p>
							<p style="font-size: 12px;">垫付金额:</p>
						<div>`
                : ''
            }
            <img src="${window.location.protocol}//${window.location.host}${
            this.footerImg
          }" style="width: 100%;margin-top:24px"/>
						`
        }
      } else {
        if (
          ['US', 'CA'].includes(this.railwayOrderInfoData.rail.podCountryCode)
        ) {
          let params = {
            employeeId: this.userId
          }
          // 收件人&抄送人&签名
          deptEmployeeInfo(params)
            .then((res) => {
              if (res.code === 0) {
                let infoData = res.data || {}
                let {
                  ename,
                  cname,
                  jobName,
                  telephone,
                  mobileNo,
                  email,
                  emailSign
                } = infoData
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
            .catch((err) => {})

          let ecsItem = this.railwayOrderInfoData.workAssign.find(
            (el) => el.jobCode == 'ecs'
          )
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
          let tradeTermsCode =
            transport && transport.tradeTermsCode
              ? `--${getDictLabel('tradeTermsCode', transport.tradeTermsCode)}`
              : ''

          let containerTotal = this.containerTotal
            ? `/${this.containerTotal.container}`
            : ''

          this.createItem.noticeTitle = `SA${tradeTermsCode} FROM ${rail.polPortName} TO ${rail.podPortName}${containerTotal}/${this.$route.query.orderNo}#/${rail.finalPodPortName}`

          let ecsName = ''
          if (ecsData && ecsData.data) {
            ecsName = ecsData.data.ename || ecsData.data.cname
          }
          let mbls = ''
          if (
            blData &&
            blData.data &&
            blData.data.mblNos &&
            blData.data.mblNos.length
          ) {
            mbls = blData.data.mblNos.join(',')
          }
          let container = ''
          if (this.containerTotal) {
            container = this.containerTotal.container
          }
          let bdName = bdData.data.ename || bdData.data.cname
          let consignee = transport ? transport.consignee : ''
          // 内容
          this.createItem.noticeContent = `
            <img src="${window.location.protocol}//${window.location.host}${
            this.headerImg
          }" style="width: 10%;"/>
						<p style="font-size: 12px;">Dear ${ecsName},</p>
						<p style="font-size: 12px;padding-left:24px">Please see attached SA (MBL+HBL+ 完整英文装箱单+完整英文发票 +其他清关文件),</p>
						<p style="font-size: 12px;padding-left:24px">Destination Services:</p>
						<p style="font-size: 12px;padding-left:24px">CHARGES COLLECT:</p>
						<p style="font-size: 12px;padding-left:24px">MBL TELEX RELEASE</p>
						<p style="font-size: 12px;padding-left:24px">HBL TELEX RELEASE</p>
						<p style="font-size: 12px;padding-left:24px">CARRIER:</p>
						<p style="font-size: 12px;padding-left:24px">ETD:${rail.etdTime || ''}</p>
						<p style="font-size: 12px;padding-left:24px">ETA:${
              rail.preArriveDate || ''
            }</p>
						<p style="font-size: 12px;padding-left:24px">MBL#:${mbls}</p>
						<p style="font-size: 12px;padding-left:24px">AMS#:</p>
						<p style="font-size: 12px;padding-left:24px">LCL Container number:${container}</p>
						<p style="font-size: 12px;padding-left:24px">FREE TIME:</p>
						<p style="font-size: 12px;padding-left:24px">SALES PERSON NAME:${bdName}</p>
						<p style="font-size: 12px;padding-left:24px">SALES PERSON EMAIL:${
              bdData.data.email
            }</p>
						<p style="font-size: 12px;padding-left:24px">CNEE Name:${consignee}</p>
						<p style="font-size: 12px;padding-left:24px">CNEE EMAIL:</p>
						<p style="font-size: 12px;padding-left:24px">CNEE TEL:</p>
						<p style="font-size: 12px;padding-left:24px">到付:</p>
						<p style="font-size: 12px;padding-left:24px">垫付:</p>

						${
              serviceList.includes('pod_comm_clearance') ||
              serviceList.includes('pod_ltl_delivery') ||
              serviceList.includes('pod_warehouse') ||
              serviceList.includes('pod_fcl_delivery')
                ? `
						<div>
							<p style="font-size: 12px;padding-left:24px">DELIVERY INFORMATION AS BELOW:</p>
							<p style="font-size: 12px;padding-left:24px">DELIVERY ADDRESS:</p>
							<p style="font-size: 12px;padding-left:24px">CONTACT PERSON:</p>
							<p style="font-size: 12px;padding-left:24px">TEL:</p>
							<p style="font-size: 12px;padding-left:24px">EMAIL:</p>
							<p style="font-size: 12px;padding-left:24px">真实收货人公司名称:</p>
							<p style="font-size: 12px;padding-left:24px">其他特殊要求:</p>
						<div>`
                : ''
            }
            <img src="${window.location.protocol}//${window.location.host}${
            this.footerImg
          }" style="width: 100%;margin-top:24px"/>
						`
        } else {
          let ecsItem = this.railwayOrderInfoData.workAssign.find(
            (el) => el.jobCode == 'ecs'
          )
          let ecsId = ecsItem ? ecsItem.employeeId : ''
          // 增加主单还客服邮箱
          if (ecsId) {
            employeeInfo({ employeeId: ecsId }).then((res) => {
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
            .then((res) => {
              if (res.code === 0) {
                let infoData = res.data || {}
                let {
                  ename,
                  cname,
                  jobName,
                  telephone,
                  mobileNo,
                  email,
                  emailSign
                } = infoData
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
            .catch((err) => {})
          let { transport, main, rail, serviceList } = this.railwayOrderInfoData
          let tradeTermsCode =
            transport && transport.tradeTermsCode
              ? `/${getDictLabel('tradeTermsCode', transport.tradeTermsCode)}`
              : ''
          let businessTypeCn = getDictLabel('businessType', main.businessType)
          // let podPortName = rail.podPortName?`/${rail.podPortName.join(',')[0]}`:''
          let podPortName = `/${rail.podPortName}`
          let polPortName = `/${rail.polPortName}`
          let quotationNumber = this.railwayOrderInfoData.main.quotationNumber
            ? `/${this.railwayOrderInfoData.main.quotationNumber}`
            : ''
          // 主题
          this.createItem.noticeTitle = `SA${tradeTermsCode}/${businessTypeCn}${polPortName}${podPortName}${quotationNumber}/${this.$route.query.orderNo}`

          // 内容
          this.createItem.noticeContent = `
            <img src="${window.location.protocol}//${window.location.host}${
            this.headerImg
          }" style="width: 10%;"/>
						<p style="font-size: 12px;">Here attached pre-alert docs (MBL+HBL+ 完整英文装箱单+完整英文发票 +其他清关文件)of the sub shipment.</p>
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
						${
              serviceList.includes('pod_ltl_delivery') ||
              serviceList.includes('pod_fcl_delivery')
                ? `
						<div>
							<p style="font-size: 12px;">DESTINATION SERVICES:</p>
							<p style="font-size: 12px;">DELIVERY INFORMATION AS BELOW:</p>
							<p style="font-size: 12px;">ADDRESS:</p>
							<p style="font-size: 12px;">CONTACT PERSON:</p>
							<p style="font-size: 12px;">TEL:</p>
							<p style="font-size: 12px;">EMAIL:</p>
							<p style="font-size: 12px;">其他要求:</p>
							<p style="font-size: 12px;">到付金额:</p>
							<p style="font-size: 12px;">垫付金额:</p>
						<div>`
                : ''
            }
            <img src="${window.location.protocol}//${window.location.host}${
            this.footerImg
          }" style="width: 100%;margin-top:24px"/>
						`
        }
      }
    },
    close(action, value, type) {
      this.$emit('close', action, value, type)
    },
    dialogCallback(action, done) {
      if (action === 'Confirm') {
        this.$refs.mailOnlyForm.validate((valid) => {
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
            uri: '/order/main/send',
            params: { data, fileName: this.fileList }
          })
          .then((res) => {
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
          .catch((err) => {
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
</style>
