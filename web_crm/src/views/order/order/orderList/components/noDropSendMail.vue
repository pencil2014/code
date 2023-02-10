<template>
    <BaseDialog :config="dialogConfig" :callback="dialogCallback" >
    <el-form ref="mailOnlyForm" :rules="rules" :model="createItem" label-position="right" label-width="90px" class="sendMail-form">
      <el-form-item label="收件人" prop="noticeEmail" :show-message="false">
        <el-input @blur="emailBlur('noticeEmail', createItem.noticeEmail)" type="text" placeholder="请输入收件人邮箱（多个以英文逗号分隔）" clearable v-model="createItem.noticeEmail">
        </el-input>
      </el-form-item>
      <el-form-item label="抄送人" prop="noticeCcEmail" :show-message="false">
        <el-input @blur="emailBlur('noticeCcEmail', createItem.noticeCcEmail)" type="text" placeholder="请输入抄送人邮箱（多个以英文逗号分隔）" clearable v-model="createItem.noticeCcEmail">
        </el-input>
      </el-form-item>
      <el-form-item label="邮件主题" prop="noticeTitle" :show-message="false">
        <el-input type="text" placeholder="请输入邮件主题" clearable v-model="createItem.noticeTitle" maxlength="200" show-word-limit class="pr80">
        </el-input>
      </el-form-item>
      <el-form-item label="邮件内容" prop="noticeContent" :show-message="false">
		<tinymce :toolbar="tinymceConfig.toolbar" :menubar="tinymceConfig.menubar" v-model="createItem.noticeContent" :height="300" />
      </el-form-item>
	  <el-form-item label="邮件签名" prop="mailSign" :show-message="false">
		<tinymce :toolbar="tinymceConfig.toolbar" :menubar="tinymceConfig.menubar" v-model="createItem.mailSign" :height="180" ref="mailSign"/>
      </el-form-item>
    </el-form>
  </BaseDialog>
</template>

<script>
import BaseDialog from '@/components/Base/Dialog/index'
import Tinymce from '@/components/Tinymce'
import {deptEmployeeInfo, getEmployeeInfo} from '@/api/base'
import {orderContainerList, noDropSendMailOnly} from '@/api/order/list'
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
          userId: (state) => state.user.userId,
          userInfo: (state) => state.user.userInfo,
          orderDetailCustInfo: (state) => state.order.custInfoObj
       })
  },
  created() {
		this.setDefaultContent()
        this.getEmployeeInfoMail()
        this.setTitle()
          // 邮件内容
        this.setDefaultBasicTable()
  },
  data() {
      return {
        oQuery: this.$route.query,
		  	dialogConfig: {
          title: '邮件发送',
          show: true,
          size: 'medium',
          width: '1100px',
          btns: [
            {label: '发送', action: 'Confirm', type: 'primary'}
          ]
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
        }
      }
  },
  methods: {
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
      setTitle() {
            console.log('客商信息20220224', this.orderDetailCustInfo)
            let {custName, shipCarrierCode, polPortCode, podPortCode, container } = this.orderInfoData
            let whiteName = ''
            if(['YES', 'yes'].includes(this.orderDetailCustInfo.isWhitelist)) {
              // 白名单
              whiteName = '【重要！】公司白名单客户 '
            }
            this.createItem.noticeTitle =  whiteName + `申请不甩柜，${this.orderDetailCustInfo.shortName || custName}，${shipCarrierCode}，${polPortCode}，${podPortCode}，${container}`
      },
      setDefaultContent() {
        const data = {
            employeeId: this.userId
        }
        deptEmployeeInfo(data).then(res => {
            if (res.code === 0) {
                console.log(res.data);
                let infoData = res.data || {}
                let {ename, cname, jobName, telephone, mobileNo, email, emailSign} = infoData
                if(emailSign) {
                  this.createItem.mailSign = emailSign
                } else {
                      this.createItem.mailSign = `<p style="font-size: 12px; font-family: Calibri">BestRegards</p>
                          <p style="font-size: 12px; font-family: Calibri">${ename},${cname}<br/>${jobName}</p>
                          <p style="font-size: 12px; font-family: Calibri">LONGSAIL INTERNATIONAL LOGISTICS CO., LTD.<br/>Direct: ${telephone}<br/>Mobile: ${mobileNo}<br/>Website: WWW.LONGSAILING.NET</p>`
                }
           }
        }).catch(err=>{
                console.log('err', err);
        })
      },
      mapName(name) {
        if (name) {
          return name.split(',')[0]
        } else {
          return ''
        }
      },
      setDefaultBasicTable() {
        let data = {orderNo: this.oQuery.orderNo, jointNo: this.oQuery.jointNo}  
        let cnStr = ''
        orderContainerList(data).then(res => {
            let arr = []
            if(res.data && res.data.length) {
                res.data.forEach(item => {
                    item.cn && arr.push(item.cn)
                })
            }
            cnStr = arr.join(',')
            let { soStr = '', shipVessel = '', shipVoyage = '', polPortName = '', podPortName = '',  container = '', shipCyCutOff = '', shipEtdTime = ''} = this.orderInfoData
            var str = `<p style="font-size: 12px;">Dear:</p>`;
            str += "<p>SO：" + soStr + "</p>"
            str += "<p>V/V：" + shipVessel + ' / ' + shipVoyage + "</p>"
            str += "<p>起运港：" + this.mapName(polPortName) + "</p>"
            str += "<p>目的地：" + this.mapName(podPortName) + "</p>"
            str += "<p>箱型箱量：" + container + "</p>"
            str += "<p>箱号：" + cnStr + "</p>"
            str += "<p>截关时间：" + shipCyCutOff + "</p>"
            str += "<p>预计开船日期：" + shipEtdTime + "</p>"
            str += "<p>不甩柜原因：</p>"
            str += "<p></p>"
            this.createItem.noticeContent = str
        })
      
      },
      getEmployeeInfoMail() {
          // 获取商务角色的邮箱
          if(this.orderInfoData.pricingEmployeeId) {
               getEmployeeInfo({employeeId: this.orderInfoData.pricingEmployeeId})
                .then(res => {
                    if(res.data && res.data.email) {
                      this.createItem.noticeEmail = res.data.email
                    }
                })
          }
          // 获取bkg角色的邮箱
          if(this.orderInfoData.bkgEmployeeId) {
              getEmployeeInfo({employeeId: this.orderInfoData.bkgEmployeeId})
                .then(res => {
                   if(res.data && res.data.email && res.data.email !== this.userInfo.email) {
                     this.createItem.noticeCcEmail = res.data.email + (this.userInfo.email ? (',' + this.userInfo.email) : '')
                   } else {
                     this.createItem.noticeCcEmail = this.userInfo.email
                   }
                })
          }
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
                    if (!this.validateMail('收件人', this.createItem.noticeEmail)) return
                    if (!this.validateMail('抄送人', this.createItem.noticeCcEmail)) return
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
			});
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
      noDropSendMailOnly(data).then(res => {
        loading.close()
        if(res && res.data) {
          this.$message({type: 'success', message: '发送成功'})
          this.close('Confirm')
        } else {
          this.$message({type: 'error', message: '发送失败'})
        }
			
			}).catch(err => {
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
.init-file {
	font-size: 12px;
	i {
		color: #C0C4CC;
	}
}
</style>