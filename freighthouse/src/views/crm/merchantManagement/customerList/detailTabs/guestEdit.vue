<!--
 * @Description: 新增/编辑客情关系
 * @Autor: yinjunying
 * @Date: 2022-04-15 10:03:04
-->
<template>
  <div>
    <el-dialog :before-close="cancel" :appendToBody="true" :visible.sync="options.show" class="follow-add"
      :title="`${options.isEdit ? '编辑' : '新增'}${options.type}联系人`" :width="`${options.type === '我司' ? '650' : '1000'}px`">
      <el-form :inline="true" :model="formData" :rules="rules" label-width="100px" class="guestForm" ref="guestForm" size="mini">
        <div class="outer-box" v-if="options.type === '我司'">
          <div class="company-item-cnt mt10">
            <el-form-item label="姓名:" prop="ourCompanyNameObj" :show-message="false">
              <el-select v-model="formData.ourCompanyNameObj" value-key="employeeNo" filterable clearable placeholder="请选择" remote
                :remote-method="(v) => { getOurContactList(v) }"
                @visible-change="(v) => visibleChangeOurCompanyName(v, formData.ourCompanyNameObj)" @change="changeOurCompanyName">
                <el-option v-for="(item, index) in ourContactList" :key="item.employeeId + index" :label="`${item.cname}`" :value="item">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="英文名:" prop="ourCompanyEname" :show-message="false">
              <el-input v-model="formData.ourCompanyEname" placeholder="请输入英文名" class="middle-item" maxlength="64"></el-input>
            </el-form-item>
          </div>
          <div class="company-item-cnt">
            <el-form-item label="职位:" prop="ourCompanyPosition" :show-message="false">
              <el-select v-model="formData.ourCompanyPosition" placeholder="请选择职位" clearable>
                <el-option v-for="(item, index) in dictMap['customerRelationPosition']" :key="index" :label="item.label" :value="item.label"
                  :disabled="isDisabled"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="电话号码:" prop="ourCompanyPhone" :show-message="false">
              <el-input v-model="formData.ourCompanyPhone" placeholder="请输入电话号码" class="middle-item" maxlength="32"></el-input>
            </el-form-item>
          </div>
        </div>
        <div class="outer-box" v-if="options.type === '客户'">
          <div class="dividingLine">
            <el-form-item>
              <el-radio-group v-model="linkerType">
                <el-radio :label="1">现有联系人</el-radio>
                <el-radio :label="2">新增联系人</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
          <el-form-item v-if="linkerType === 1" label="客户联系人:" prop="contactId" :show-message="false">
            <el-select v-model="formData.contactId" placeholder="请选择客户联系人" @visible-change="(v) => getCustomerNameList(v)" clearable>
              <el-option v-for="item in custContactList" :key="item.oid" :label="item.name + item.ename" :value="item.oid"></el-option>
            </el-select>
          </el-form-item>
          <template v-if="formData.contactId || linkerType === 2">
            <div class="item-cnt">
              <el-form-item label="中文名:" prop="customerName" :show-message="false">
                <el-input v-model="formData.customerName" placeholder="请输入中文名" class="middle-item" maxlength="32" clearable></el-input>
              </el-form-item>
              <el-form-item label="英文名:" prop="customerEname" :show-message="false">
                <el-input v-model="formData.customerEname" placeholder="请输入英文名" class="middle-item" maxlength="64"></el-input>
              </el-form-item>
              <el-form-item label="职位:" prop="custContactPosition" :show-message="false">
                <el-select v-model="formData.custContactPosition" placeholder="请选择职位" clearable>
                  <el-option v-for="(item, index) in dictMap['customerRelationPosition']" :key="index" :label="item.label"
                    :value="item.label" :disabled="isDisabled"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="电话号码:" prop="mobileNo" :show-message="false">
                <el-input v-model="formData.mobileNo" placeholder="请输入电话号码" class="middle-item" maxlength="32"></el-input>
              </el-form-item>
              <el-form-item label="座机电话:" prop="telNo" :show-message="false">
                <el-input v-model="formData.telNo" placeholder="请输入座机电话" class="middle-item" maxlength="32"></el-input>
              </el-form-item>
              <el-form-item label="Email:" prop="email" :show-message="formData.email !== ''" :rules="[
                { required: true, message: '请输入邮箱地址', trigger: 'blur' },
                { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
              ]">
                <el-input v-model="formData.email" placeholder="请输入Email" class="middle-item" maxlength="32"></el-input>
              </el-form-item>
              <el-form-item label="QQ:" prop="qq" :show-message="false">
                <el-input v-model="formData.qq" placeholder="请输入QQ" class="middle-item" maxlength="32"></el-input>
              </el-form-item>
              <el-form-item label="微信号:" prop="wechat" :show-message="false">
                <el-input v-model="formData.wechat" placeholder="请输入微信号" class="middle-item" maxlength="32"></el-input>
              </el-form-item>
              <el-form-item label="WHATSAPP:" prop="whatsapp" :show-message="false">
                <el-input v-model="formData.whatsapp" placeholder="请输入WHATSAPP" class="middle-item" maxlength="32"></el-input>
              </el-form-item>
              <el-form-item label="WECHAT:" prop="wechatEname" :show-message="false">
                <el-input v-model="formData.wechatEname" placeholder="请输入WECHAT" class="middle-item" maxlength="32"></el-input>
              </el-form-item>
              <el-form-item label="Fax No.:" prop="faxNo" :show-message="false">
                <el-input v-model="formData.faxNo" placeholder="请输入Fax No." class="middle-item" maxlength="32"></el-input>
              </el-form-item>
            </div>
            <div class="item-cnt item-cnt-textarea">
              <el-form-item label="职责:" prop="duty" class="textAreaStyle" :show-message="false">
                <el-input v-model="formData.duty" type="textarea" placeholder="请输入职责（限512个字）" maxlength="512" show-word-limit></el-input>
              </el-form-item>
              <el-form-item label="教育背景:" prop="eduBack" class="textAreaStyle" :show-message="false">
                <el-input v-model="formData.eduBack" type="textarea" placeholder="请输入教育背景（限512个字）" maxlength="512" show-word-limit>
                </el-input>
              </el-form-item>
              <el-form-item label="家庭背景:" prop="familyBack" class="textAreaStyle" :show-message="false">
                <el-input v-model="formData.familyBack" type="textarea" placeholder="请输入家庭背景（限512个字）" maxlength="512" show-word-limit>
                </el-input>
              </el-form-item>
              <el-form-item label="从业背景:" prop="professionalBack" class="textAreaStyle" :show-message="false">
                <el-input v-model="formData.professionalBack" type="textarea" placeholder="请输入从业背景（限512个字）" maxlength="512" show-word-limit>
                </el-input>
              </el-form-item>
              <el-form-item label="性格爱好:" prop="hobbies" class="textAreaStyle" :show-message="false">
                <el-input v-model="formData.hobbies" type="textarea" placeholder="请输入性格爱好（限512个字）" maxlength="512" show-word-limit>
                </el-input>
              </el-form-item>
              <el-form-item label="其他特殊情况或要求:" prop="other" class="textAreaStyle" :show-message="false">
                <el-input v-model="formData.other" type="textarea" placeholder="请输入其他特殊情况或要求（限512个字）" maxlength="512" show-word-limit>
                </el-input>
              </el-form-item>
            </div>
            <template v-if="!isForeignPeer">
              <div>
                <el-form-item label="维护频次:" prop="maintenanceFrequency" :show-message="false">
                  <el-select v-model="formData.maintenanceFrequency" placeholder="请选择维护频次" clearable class="longSelect"
                    @change="changeMaint">
                    <el-option v-for="(item, index) in dictMap['maintenancFrequency']" :key="index" :label="item.label" :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </div>
              <div class="item-cnt item-cnt-textarea">
                <el-form-item label="拜访提醒日期:" required>
                  <template v-if="['', 'year_once'].includes(formData.maintenanceFrequency)">
                    <el-date-picker v-model="formData.visitFirstTips" type="date" value-format="yyyy-MM-dd" placeholder="拜访提醒日期"
                      class="middle-item" style="width: 335px;">
                    </el-date-picker>
                  </template>
                  <template v-if="['year_twice', 'quarter_once'].includes(formData.maintenanceFrequency)">
                    <el-date-picker v-for="(item, index) in visitReminderDates1" :key="index" v-model="formData[item]" type="date"
                      value-format="yyyy-MM-dd" :placeholder="`拜访提醒日期${index+1}`" class="middle-item"
                      style="width: 166px; margin-right:3px">
                    </el-date-picker>
                  </template>
                </el-form-item>
                <el-form-item label="电话提醒日期:" required>
                  <template v-if="[''].includes(formData.maintenanceFrequency)">
                    <el-date-picker v-model="formData.telFirstTips" type="date" value-format="yyyy-MM-dd" placeholder="电话提醒日期"
                      class="middle-item" style="width: 335px;">
                    </el-date-picker>
                  </template>
                  <template v-if="['year_once', 'year_twice'].includes(formData.maintenanceFrequency)">
                    <el-date-picker v-for="(item, index) in phoneReminderDates1" :key="index" v-model="formData[item]" type="date"
                      value-format="yyyy-MM-dd" :placeholder="`电话提醒日期${index+1}`" class="middle-item"
                      style="width: 166px; margin-right:3px">
                    </el-date-picker>
                  </template>
                  <template v-if="['quarter_once'].includes(formData.maintenanceFrequency)">
                    <el-select v-model="formData.weeklyTips" placeholder="请选择周数" clearable class="weekSelect">
                      <el-option v-for="(item, index) in dictMap['weeklyTips']" :key="index" :label="item.label" :value="item.value">
                      </el-option>
                    </el-select>
                  </template>
                </el-form-item>
              </div>
              <div class="item-cnt item-cnt-textarea" v-if="['quarter_once', 'year_twice'].includes(formData.maintenanceFrequency)">
                <el-form-item label=" ">
                  <template v-if="['quarter_once'].includes(formData.maintenanceFrequency)">
                    <el-date-picker v-for="(item, index) in visitReminderDates2" :key="index" v-model="formData[item]" type="date"
                      value-format="yyyy-MM-dd" :placeholder="`拜访提醒日期${index+3}`" class="middle-item"
                      style="width: 166px; margin-right:3px">
                    </el-date-picker>
                  </template>
                </el-form-item>
                <el-form-item label=" " v-if="['year_twice'].includes(formData.maintenanceFrequency)">
                  <el-date-picker v-for="(item, index) in phoneReminderDates2" :key="index" v-model="formData[item]" type="date"
                    value-format="yyyy-MM-dd" :placeholder="`电话提醒日期${index+3}`" class="middle-item" style="width: 166px; margin-right:3px">
                  </el-date-picker>
                </el-form-item>
              </div>
            </template>
            <template v-else>
              <div style="display: flex">
                <el-form-item label="维护频次:" required style="margin-right: 0"></el-form-item>
                <div>
                  <div v-for="(mianFreItem, mianFreIndex) in formData.maintenanceFrequencyList" :key="mianFreIndex" class="maint-freq-box">
                    <div class="form-box">
                      <el-form-item label="维护方式:" :show-message="false" required>
                        <el-select v-model="mianFreItem.maintenanceMode" placeholder="请选择维护方式" clearable class="middleSelect">
                          <el-option v-for="(item, index) in dictMap['custForeignPeerCommType']" :key="index" :label="item.label"
                            :value="item.value">
                          </el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item label="维护频率:" :show-message="false" required label-width="122px">
                        <el-input type="number" v-model="mianFreItem.maintFreqForeign" min="1" style="width: 100px">
                        </el-input> 次/年
                      </el-form-item>
                      <el-form-item label="提醒日期:" :show-message="false" required>
                        <el-date-picker v-model="mianFreItem.reminderDate" type="date" value-format="yyyy-MM-dd" placeholder="提醒日期"
                          style="width: 224px">
                        </el-date-picker>
                      </el-form-item>
                    </div>
                    <div class="maint-freq-btn">
                      <i class="el-icon-circle-plus" title="新增" @click="addMaintFreqFn" style="margin-left: 5px"></i>
                      <el-popconfirm v-if="formData.maintenanceFrequencyList.length === 1 ? mianFreIndex : mianFreIndex > -1"
                        title="确定移除该信息吗？" @onConfirm="removeMaintFreqFn(mianFreIndex)">
                        <i slot="reference" class="el-icon-remove" title="移除"></i>
                      </el-popconfirm>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </template>
        </div>
      </el-form>
      <div class="dialog-footer" slot="footer" v-show="isSelf">
        <el-button @click="saveFn" size="mini" type="primary">保存</el-button>
        <el-button @click="cancel" size="mini">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { addGuestInfoApi, getOurContactListApi } from '@/api/crm/guest.js'
import CONTACT from '@/api/crm/orgContact'
export default {
  props: {
    options: {
      type: Object,
      default: () => { }
    },
    custid: '',
    isSelf: {
      type: Boolean,
      default: () => true
    },
    isForeignPeer: {
      type: Boolean,
      default: false
    }
  },
  data () {
    // 统一设置字段校验规则
    const rules = {}
    const blurRequiredRules = { required: true, message: '', trigger: 'blur' }
    const changeRequiredRules = { required: true, message: '', trigger: 'change' }
    let blurRulesFields = []
    if(this.isForeignPeer){
      blurRulesFields = ['ourCompanyNameObj', 'ourCompanyPhone', 'mobileNo']
    }else{
      blurRulesFields = ['ourCompanyNameObj', 'ourCompanyPhone', 'mobileNo', 'duty', 'eduBack', 'familyBack', 'professionalBack', 'hobbies']
    }
    const changeRulesFields = ['ourCompanyNameObj', 'ourCompanyPosition', 'custContactPosition', 'maintenanceFrequency', 'visitReminderDate', 'contactId']
    blurRulesFields.forEach((v) => (rules[v] = { ...blurRequiredRules }))
    changeRulesFields.forEach((v) => (rules[v] = { ...changeRequiredRules }))
    return {
      rules,
      linkerType: 1, //1-现有联系人 2-新增联系人
      formData: {
        oid: "",
        ourCompanyEmployeeId: "",
        ourCompanyName: "",
        ourCompanyEname: "", //0616新增字段
        ourCompanyPosition: "",
        ourCompanyPhone: "",
        ourCompanyNameObj: {},
        custContactPosition: "",
        duty: "",
        customerName: "",
        mobileNo: "",
        contactId: "", //客户联系人Id
        // 0616新增字段
        customerEname: "",
        telNo: "",
        email: "",
        qq: "",
        wechat: "",
        whatsapp: "",
        wechatEname: "",
        faxNo: "",
        eduBack: "",
        maintenanceFrequency: "",
        visitFirstTips: "",
        visitSecondTips: "",
        visitThirdTips: "",
        visitFourthTips: "",
        telFirstTips: "",
        telSecondTips: "",
        telThirdTips: "",
        telFourthTips: "",
        weeklyTips: "",
        maintenanceFrequencyList: [
          {
            maintenanceMode: "",
            maintFreqForeign: "",
            reminderDate: ""
          }
        ]
      },
      custContactList: [],
      ourContactList: [],
      visitReminderDates1: ['visitFirstTips', 'visitSecondTips'],
      visitReminderDates2: ['visitThirdTips', 'visitFourthTips'],
      phoneReminderDates1: ['telFirstTips', 'telSecondTips'],
      phoneReminderDates2: ['telThirdTips', 'telFourthTips']
    }
  },
  computed: {
    ...mapGetters(['dictMap']),
    isDisabled () {
      return !this.isSelf
    }
  },
  watch: {
    'linkerType' (val) {
      if (val === 2) {
        this.formData = Object.assign({}, this.$options.data.call(this).formData)
        let arr = ['ourCompanyEmployeeId', 'ourCompanyName', 'ourCompanyEname', 'ourCompanyPosition', 'ourCompanyPhone']
        // 修改联系人类型，重置客户联系人所有信息，但是我司联系人除外
        arr.forEach(item => {
          this.formData[item] = this.options[item]
        })
      }
      this.formData.oid = this.options.oid
      this.$refs['guestForm'].clearValidate()
    },
    // 切换客户联系人时，将其它信息代入
    'formData.contactId' (oid) {
      if (oid) {
        let contact = this.custContactList.find(item => item.oid === oid)
        if (contact) { //客户联系人信息 含联系人主键oid
          for (let key in contact) {
            if (key !== 'oid') {
              this.formData[key] = contact[key]
              this.$set(this.formData, 'customerEname', contact.ename)
              this.$set(this.formData, 'customerName', contact.name)
            } else {
              this.formData.contactId = contact[key]
            }
          }
        }
      }
    }
  },
  created () {
    this.formData = Object.assign({}, this.formData, this.options.form)
    if (this.options.type === '我司') {
      this.getOurContactList(this.formData.ourCompanyName)
    }
    if (this.options.type === '客户' && this.options.isEdit) {
      if (this.isForeignPeer && !this.formData.maintenanceFrequencyList.length) {
        this.addMaintFreqFn()
      }
      this.getCustContactList()
    }
  },
  methods: {
    /**
     * @description: 海外同行客户新增维护频次
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-06 15:34:33
     */
    addMaintFreqFn () {
      this.formData.maintenanceFrequencyList.push(this.$options.data.call(this).formData.maintenanceFrequencyList[0])
    },
    /**
     * @description: 海外同行客户移除维护频次
     * @param {*} index 维护频次索引
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-07-06 15:36:59
     */
    removeMaintFreqFn (index) {
      this.formData.maintenanceFrequencyList.splice(index, 1)
    },
    /**
     * @description: 修改我司联系人
     * @param {*} obj
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-22 17:30:54
     */
    visibleChangeOurCompanyName (isShow, obj) {
      if (isShow) {
        if (obj && obj.cname) {
          this.getOurContactList(obj.cname)
        } else {
          this.getOurContactList('')
        }
      }
    },
    /**
     * @description: 选择我司联系人下拉选项回调
     * @param {*} obj
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-23 10:56:20
     */
    changeOurCompanyName (obj) {
      if (obj && obj.employeeId && this.ourContactList.length) {
        let findObj = this.ourContactList.find(item => item.employeeId === obj.employeeId)
        if (findObj) {
          this.$set(this.formData, 'ourCompanyEmployeeId', obj.employeeId)
          this.$set(this.formData, 'ourCompanyName', obj.cname)
          this.$set(this.formData, 'ourCompanyEname', obj.ename)
          this.$set(this.formData, 'ourCompanyPhone', obj.mobileNo)
          if (!this.options.isEdit) {
            this.$set(this.formData, 'ourCompanyPosition', '')
          }
        }
      }
    },
    /**
     * @description: 切换维护频次
     * @param {*} val
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-23 11:26:48
     */
    changeMaint (val) {
      this.formData.visitFirstTips = ""
      this.formData.visitSecondTips = ""
      this.formData.visitThirdTips = ""
      this.formData.visitFourthTips = ""
      this.formData.telFirstTips = ""
      this.formData.telSecondTips = ""
      this.formData.telThirdTips = ""
      this.formData.telFourthTips = ""
      this.formData.weeklyTips = ""
    },
    /**
     * @description: 获取我司联系人
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-17 15:16:04
     */
    getOurContactList (str = '') {
      const data = {
        currPage: 1,
        pageSize: 50,
        name: str
      }
      getOurContactListApi(data)
        .then((res) => {
          if (res.code === 0) {
            this.ourContactList = res.data || []
            // 回显我司联系人的值
            if (this.ourContactList.length) {
              let findObj = this.ourContactList.find(item => item.employeeId === this.formData.ourCompanyEmployeeId)
              if (str !== '') {
                this.$set(this.formData, 'ourCompanyNameObj', findObj)
              }
            }
          }
        })
        .catch(() => { })
    },
    /**
     * @description: 客户联系人下拉框显示/隐藏时回调
     * @param {*} isShow true-显示 false-隐藏
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-17 14:37:19
     */
    getCustomerNameList (isShow) {
      isShow && this.getCustContactList()
    },
    /**
     * @description: 获取已有客户联系人列表
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-06-17 14:14:46
     */
    getCustContactList () {
      this.lsLoading = true
      CONTACT.customerList({ custid: this.custid || this.$route.query.custid }).then((res) => {
        if (res.code === 0) {
          this.custContactList = res.data || []
          if (this.custContactList.length) {
            this.custContactList = this.custContactList.filter(item => item.status === 'effect')
          }
        }
      }).catch(() => { })
        .finally(() => {
          this.lsLoading = false
        })
    },
    /**
     * @description: 保存客情关系信息
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-15 10:47:31
     */
    saveFn () {
      this.$refs['guestForm'].validate((valid) => {
        if (valid) {
          if (this.options.type === '客户') {
            if (this.formData.customerName === '' && this.formData.customerEname === '') {
              return this.$msgErrClose("客户联系人中文名和英文名必须填写一个！")
            }
            // 校验海外同行维护频次必填
            if (this.isForeignPeer) {
              if (this.formData.maintenanceFrequencyList && this.formData.maintenanceFrequencyList.length) {
                const isValid = this.formData.maintenanceFrequencyList.every((mItem, mIndex) => {
                  if (!mItem.maintenanceMode) {
                    this.$msgErrClose(`请选择维护频次${mIndex + 1}的维护方式！`)
                    return false
                  }
                  if (!mItem.maintFreqForeign) {
                    this.$msgErrClose(`请输入维护频次${mIndex + 1}的维护频率！`)
                    return false
                  } else if (mItem.maintFreqForeign <= 0) {
                    this.$msgErrClose(`维护频次${mIndex + 1}的维护频率必须大于0！`)
                    return false
                  }
                  if (!mItem.reminderDate) {
                    this.$msgErrClose(`请选择维护频次${mIndex + 1}的提醒日期！`)
                    return false
                  }
                  return true
                })
                if (!isValid) {
                  return
                }
              }
            }
          } else {
            if (this.formData.ourCompanyName === '') {
              return this.$msgErrClose("请选择我司联系人姓名！")
            }
          }
          // 如果是客户联系人
          // 单独校验【拜访提醒日期】和【电话提醒日期】
          // year_once 当面拜访每年一次，电话交流至少半年一次
          // year_twice 当面拜访每年两次，电话交流至少每季度一次
          // quarter_once 当面拜访每季度一次，电话交流至少每周一次
          if (['year_once'].includes(this.formData.maintenanceFrequency)) {
            if (!this.formData.visitFirstTips) {
              return this.$msgErrClose("请选择拜访提醒日期！")
            }
            for (let i = 0; i < this.phoneReminderDates1.length; i++) {
              if (!this.formData[this.phoneReminderDates1[i]]) {
                return this.$msgErrClose(`请选择电话提醒日期${i + 1}！`)
              }
            }
            // 电话提醒日期不能存在相同的日期
            let phoneReminderDates1Arr = []
            this.phoneReminderDates1.forEach(ele => {
              phoneReminderDates1Arr.push(this.formData[ele])
            });
            if (new Set(phoneReminderDates1Arr).size !== phoneReminderDates1Arr.length) {
              return this.$msgErrClose(`电话提醒日期不能存在相同的日期！`)
            }
          }
          if (['year_twice'].includes(this.formData.maintenanceFrequency)) {
            // 校验拜访提醒日期
            for (let i = 0; i < this.visitReminderDates1.length; i++) {
              if (!this.formData[this.visitReminderDates1[i]]) {
                return this.$msgErrClose(`请选择拜访提醒日期${i + 1}！`)
              }
            }
            // 拜访提醒日期不能存在相同的日期
            let visitReminderDates1Arr = []
            this.visitReminderDates1.forEach(ele => {
              visitReminderDates1Arr.push(this.formData[ele])
            });
            if (new Set(visitReminderDates1Arr).size !== visitReminderDates1Arr.length) {
              return this.$msgErrClose(`拜访提醒日期不能存在相同的日期！`)
            }
            // 校验电话提醒日期
            let phoneReminderDates = [...this.phoneReminderDates1, ...this.phoneReminderDates2]
            for (let i = 0; i < phoneReminderDates.length; i++) {
              if (!this.formData[phoneReminderDates[i]]) {
                return this.$msgErrClose(`请选择电话提醒日期${i + 1}！`)
              }
            }
            // 电话提醒日期不能存在相同的日期
            let phoneReminderDatesArr = []
            phoneReminderDates.forEach(ele => {
              phoneReminderDatesArr.push(this.formData[ele])
            });
            if (new Set(phoneReminderDatesArr).size !== phoneReminderDatesArr.length) {
              return this.$msgErrClose(`电话提醒日期不能存在相同的日期！`)
            }
          }
          if (['quarter_once'].includes(this.formData.maintenanceFrequency)) {
            // 校验拜访提醒日期
            let visitReminderDates = [...this.visitReminderDates1, ...this.visitReminderDates2]
            for (let i = 0; i < visitReminderDates.length; i++) {
              if (!this.formData[visitReminderDates[i]]) {
                return this.$msgErrClose(`请选择拜访提醒日期${i + 1}！`)
              }
            }
            // 电话提醒日期不能存在相同的日期
            let visitReminderDatesArr = []
            visitReminderDates.forEach(ele => {
              visitReminderDatesArr.push(this.formData[ele])
            });
            if (new Set(visitReminderDatesArr).size !== visitReminderDatesArr.length) {
              return this.$msgErrClose(`拜访提醒日期不能存在相同的日期！`)
            }
            // 校验周数
            if (!this.formData.weeklyTips) {
              return this.$msgErrClose("请选择周几作为电话提醒日期！")
            }
          }
          let data = {
            custid: this.custid
          }
          data = Object.assign({}, data, this.formData)
          addGuestInfoApi(data).then((res) => {
            if (res.code === 0) {
              this.$msgSucClose(this.options.isEdit ? '编辑成功！' : '新增成功！')
              this.cancel()
              this.$emit('getData')
            }
          })
            .catch(() => { })
            .finally(() => {
            })
        } else {
          this.$msgErrClose("请将必填项填写完整！")
        }
      })
    },
    /**
     * @description: 关闭弹框
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-15 10:47:17
     */
    cancel () {
      this.options.show = false
    }
  }
}
</script>

<style lang='scss' scoped>
.mt10 {
  margin-top: 10px;
}
.inputWidth {
  width: 178px !important;
}
.guestForm {
  /deep/ .el-form-item .el-input__inner {
    height: 20px !important;
    width: 100%;
    line-height: 20%;
  }
  /deep/ .el-input__suffix {
    top: 0px !important;
    .el-input__suffix-inner {
      .el-input__icon {
        line-height: 20px !important;
      }
    }
  }
  /deep/ .el-input__prefix {
    top: -4px !important;
  }
  /deep/ .el-form-item--mini.el-form-item {
    margin-bottom: 5px;
    margin-top: 5px;
  }
  /deep/ .el-form-item__error {
    top: 86% !important;
  }
  /deep/ .el-textarea {
    width: 335px !important;
  }
  /deep/ .el-input--mini {
    height: auto;
    width: 177px;
    /deep/ .el-input__icon {
      line-height: 20px !important;
    }
  }
  /deep/ .el-form-item .longSelect .el-input {
    width: 335px !important;
  }
  /deep/ .el-form-item .middleSelect .el-input {
    width: 224px !important;
  }
  /deep/ .weekSelect {
    /deep/ .el-input--mini {
      width: 150px !important;
    }
  }
  .textAreaStyle {
    width: 810px !important;
    min-height: 60px !important;
    /deep/ .el-form-item__content {
      /deep/ .el-input--mini {
        width: 335px;
      }
    }
    /deep/ .el-input__count {
      bottom: 1px !important;
    }
  }
  /deep/ .weekSelect {
    .el-input--mini {
      width: 167px !important;
    }
  }
  /deep/ i.el-icon-circle-plus {
    color: #417f90;
    font-size: 20px;
    cursor: pointer;
    vertical-align: sub;
  }
  /deep/ .el-icon-remove {
    color: #afafaf;
    font-size: 20px;
    cursor: pointer;
    vertical-align: sub;
    margin: 0 5px;
  }
  .form-box {
    background: #f3f3f3;
    padding: 10px 0;
    margin-bottom: 10px;
  }
  .maint-freq-btn {
    width: 83px;
  }
}

.maint-freq-box {
  display: flex;
}

.outer-box {
  border: 1px solid #eee;
  width: 100%;
  padding: 0 10px 5px;
  border-radius: 4px;
  /deep/ .el-radio__label {
    font-size: 12px;
  }
  .dividingLine {
    border-bottom: 1px solid #eee;
    height: 30px;
    padding-left: 35px;
    margin-bottom: 5px;
  }
  .company-item-cnt {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    padding-bottom: 5px;
  }
  .item-cnt {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    margin-top: 3px;
    /deep/ .el-form-item--mini {
      width: 32% !important;
    }
  }
  .item-cnt-textarea {
    /deep/ .el-form-item--mini {
      width: 48% !important;
    }
  }
  .btn-box {
    width: 40px;
    display: flex;
    justify-content: space-around;
    i {
      font-size: 20px;
      cursor: pointer;
      &.el-icon-circle-plus {
        color: #417f90;
        &:hover {
          color: #356572;
        }
      }
      &.el-icon-remove {
        color: #ccc;
        &:hover {
          color: #999;
        }
      }
    }
  }
  .flex-item {
    width: 100%;
  }
  .border {
    border-bottom: 1px dotted #ddd;
  }
}
</style>