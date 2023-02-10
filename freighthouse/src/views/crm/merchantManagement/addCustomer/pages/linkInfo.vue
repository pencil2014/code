<template>
  <div>
    <CrmCard title="企业联系人">
      <CrmForm
        ref="crmForm"
        :rules="rules"
        :ruleForm="ruleForm"
        :formDatas="baseLinkData"
        :disabled="!isSelf"
      ></CrmForm>
    </CrmCard>
    <AccountIndex
      ref="accountIndex"
      :btnHide="!isSelf"
      :tableData="ruleForm.orgBankAccountDtos"
      :orgid="orgid"
      :orgName="orgName"
      :ename="ename"
    ></AccountIndex>
    <CrmCard title="维护人">
      <CrmForm
        ref="crmForm2"
        :rules="rules2"
        :ruleForm="ruleForm2"
        :formDatas="employeeLinkData"
        :disabled="!isSelf"
      ></CrmForm>
    </CrmCard>
    <div v-if="isCustomer" style="padding:8px;">
      <!-- <p style="line-height: 18px; color: #999"><i class="el-icon-info"></i> 当“企业类别”包含“委托人”时，“是否用于下单”为"是"，反之为"否"，不支持手动修改。</p> -->
      <!-- <p style="line-height: 18px;">若企业类别包含委托人，则是否用于下单为是，不可修改。</p>
      <p style="line-height: 18px;">若企业类别不包含委托人，则是否用于下单为否，不可修改。</p> -->
    </div>
  </div>
</template>

<script>
import { addBaseLinkData } from '@/views/crm/data'
import { listByRole } from '@/api/base'
import CrmForm from '@/views/crm/components/crmForm'
import CrmCard from '@/views/crm/components/card'
import AccountIndex from './accountIndex.vue'
import CUSTOMER from '@/api/crm/customer'
import SUPPLIER from '@/api/crm/supplier'
import { mapState, mapGetters } from 'vuex'
const LIST = [] //审核人列表
const BDLIST = [] //维护业务列表
const ruleForm = { orgType: '', custid: '', orgid: '', oid: '', orgBankAccountDtos: [] }
addBaseLinkData.forEach((item) => (ruleForm[item.prop] = ''))
export default {
  name: 'linkInfo',
  components: {
    CrmForm,
    CrmCard,
    AccountIndex,
  },
  inject: ['telRules', 'emailRules', 'defaultRules', 'isCustomer', 'statePath'],
  props: ['isSelf'],
  computed: {
    ...mapState('user', ['name', 'deptName', 'deptCode']),
    ...mapGetters(['dictMap', 'dictMapObj']),
    ...mapState('crm', {
      customerId: (state) => state.custid,
      customerOrgid: (state) => state.orgid,
      customerBaseInfo: (state) => state.baseInfo,
    }),
    ...mapState('crm/supplier', {
      supplierId: (state) => state.custid,
      supplierOrgid: (state) => state.orgid,
      supplierBaseInfo: (state) => state.baseInfo,
    }),
    custid() {
      return this.isCustomer ? this.customerId : this.supplierId
    },
    orgid() {
      return this.isCustomer ? this.customerOrgid : this.supplierOrgid
    },
    baseInfo() {
      // console.log(this.isCustomer ? this.customerBaseInfo : this.supplierBaseInfo)
      return this.isCustomer ? this.customerBaseInfo : this.supplierBaseInfo
    },
    orgName() {
      return this.baseInfo?.organizationDto?.name
    },
    ename() {
      return this.baseInfo?.organizationDto?.ename
    },
    isObd() {
      return this.$store.state.user.roles.includes('obd')
    }
  },
  data() {
    return {
      ruleForm: ruleForm,
      rules: { role: this.defaultRules, mobileNo: this.telRules, email: this.emailRules,},
      ruleForm2: { bdEmployeeName: '', bdDeptName: '', verifier: '', bdEmployeeId: '', yesNo: ''},
      rules2: { verifier: this.defaultRules},
      // 企业联系人字段
      baseLinkData: addBaseLinkData.filter(item => item.prop !== 'belongEmployeeName'),
      // 维护人字段
      employeeLinkData: [
        { type: 'input', label: '创建人', prop: 'createdName', disabled: true },
        // { label: '维护业务', key: 'bdEmployeeName', prop: 'bdEmployeeName', type: 'input', disabled: true },
        // { label: '维护部门', key: 'bdDeptName', prop: 'bdDeptName', type: 'input', disabled: true },
      ],
      specialItem1: { type: 'select', label: '是否用于下单', prop: 'yesNo', disabled: true },
      specialItem2: { type: 'input', label: '创建人', prop: 'createdName', disabled: true },
      specialItem: {
        type: 'select',
        label: '审核人',
        prop: 'verifier',
        list: LIST,
        remote: true,
        remoteMethod: (name) => this.getEmployeeList(name, '', '', LIST),
      },
      isClient: false,
      isPotential: false,
    }
  },
  watch: {
    // 委托客户或供应商
    isClient: {
      handler(val) {
        this.ruleForm2.yesNo = val ? 'yes' : 'no'
        if (val) {
          this.employeeLinkData.push(this.specialItem)
        } else if (this.employeeLinkData.find((item) => item.prop === 'verifier')) {
          this.employeeLinkData.pop()
        }
      },
      immediate: true,
    },
    'ruleForm2.yesNo': {
      handler(val) {
        if (val === 'yes') {
          if(!this.isCustomer) return
          // let mode = { type: "select", label: "新旧模式", prop: "bdServiceMode", propInDict: 'customerServiceMode'}
          this.employeeLinkData.push(mode)
          // this.ruleForm2.bdServiceMode = this.baseInfo?.bds[0]?.bdServiceMode || 'new'
        } else {
          //  if (this.employeeLinkData.find((item) => item.prop === 'bdServiceMode')) {
          //   this.employeeLinkData.pop()
            // this.ruleForm2.bdServiceMode = ''
          // }
        }
      }
    },
    'ruleForm2.bdEmployeeId': {
        handler(val) {
          this.ruleForm2.bddeptCname = val.bdDeptCode?val.bdDeptName:val.deptCname
          this.ruleForm2.bdmobileNo = val.mobileNo
        }
    },
    'ruleForm.role'(val,oldV){
        let index = this.baseLinkData.findIndex((item) => item.prop == "role")
        if(!val){
          this.baseLinkData.splice(index+1,1)
        }
        if(val==='other'){  
          this.baseLinkData.splice(
            index + 1,
            0,
            { type: 'input', prop: 'diyRole', label: '岗位',maxlength:32, r:true},
          )
        }else if(oldV==='other'){
            this.baseLinkData.splice(index+1,1)
        }
      // }
    }
    // isPotential:{handler(val) {
    //   if (val) {
    //     this.rules = {}
    //     this.ruleForm2.yesNo = 'no'
    //   } else{
    //     if (this.employeeLinkData.find((item) => item.prop === 'verifier')) {
    //       this.rules = { role: this.defaultRules, mobileNo: this.telRules, email: this.emailRules }
    //     }
    //   }
    // }, immediate: true},
  },
  async created() {
    this.ruleForm2['bdDeptName'] = this.deptName
    this.ruleForm2['createdName'] = this.name
    let baseInfo = this.baseInfo || { contact: [], roles: [] }
    this.isPotential = this.isCustomer && (baseInfo.roles.length === 1 && baseInfo.roles[0].roleType==='potential')
    let hasPotential = this.isCustomer && (baseInfo.roles.filter(item=>item.roleType == 'potential'))
    if (this.isCustomer) {
      this.rules2.bdEmployeeId = this.defaultRules
      this.employeeLinkData = [
        {
          label: '维护人',
          prop: 'bdEmployeeId',
          type: 'select',
          list: BDLIST,
          remote: true,
          remoteMethod: (name) => this.getEmployeeList(name, '', '', BDLIST, [{ column: 'roleCode', type: 'eq', value: 'bd,obd' }]),
        },
        // { type: 'select', label: '是否用于下单', prop: 'yesNo', disabled: true },
        { type: 'input', label: '创建人', prop: 'createdName', disabled: true },
      ]
      if(hasPotential.length>0){  //是潜在客户
        this.employeeLinkData = [
          {
            label: '维护人', prop: 'bdEmployeeId', type: 'select',list: BDLIST, remote: true,
            remoteMethod: (name) => this.getEmployeeList(name, '', '', BDLIST, [{ column: 'roleCode', type: 'eq', value: 'bd,obd' }]),
          },
          { type: 'input', label: '创建人', prop: 'createdName', disabled: true },
          { prop: 'maintainerType',label: '维护人类型',type: 'select',propInDict: 'custMaintainerType',disabled: true},
          { type: 'input', label: '部门', prop: 'bddeptCname', disabled: true },
          { type: 'input', label: '联系方式', prop: 'bdmobileNo', disabled: true },
          // { type: 'select', 
          //   label: '新旧模式',
          //   prop: 'bdServiceMode', 
          //   propInDict: 'customerServiceMode',
          //   disabled: false 
          // },
        ]
         this.ruleForm2.maintainerType = 'potential'
      }
      // this.employeeLinkData.splice(1, 0, this.specialItem1, this.specialItem2)
    }
    if (this.custid) {
      if (!this.isCustomer || baseInfo.roles.find((item) => item.roleType === 'client')) {
        this.isClient = true
      }
      Object.assign(this.ruleForm, baseInfo.contact[0] || {})
      this.ruleForm.orgBankAccountDtos.splice(0, 1000, ...(baseInfo.account || []))
      Object.keys(this.ruleForm).forEach((key) => {
        if (key === 'orgBankAccountDtos') {
          this.ruleForm[key].splice(0, 1000, ...(baseInfo.account || []))
        } else {
          this.ruleForm[key] = (baseInfo.contact[0] || {})[key]
        }
      })
      if (baseInfo.customerDto && baseInfo.customerDto.verifyCode) {
        this.ruleForm.verifyCode = baseInfo.customerDto.verifyCode
      }
      if (this.isClient || !this.isCustomer) {
        this.ruleForm2._verifier = (baseInfo.orgVerifyDto || {}).verifier
        this.ruleForm2.verifier = (baseInfo.orgVerifyDto || {}).verifierName
        this.getEmployeeList('', this.ruleForm2, this.ruleForm2._verifier, LIST)
      }
      this.$nextTick(() => {
        this.$refs.crmForm.$refs.form.clearValidate()
      })
    }
    if (this.isCustomer) {
      let { sysUserId, userName } = this.$store.state.user.userInfo
      this.currBd = (this.baseInfo.bds && this.baseInfo.bds[0]) || { bdEmployeeId: sysUserId, bdEmployeeName: userName }
    }else{
      //客户新增加的，供应商不要
      this.baseLinkData.splice(3, 1) 
      this.baseLinkData.splice(9, 3) 
      this.baseLinkData.splice(11, 6) 
    }
    console.log(this.baseInfo)
  },
  methods: {
    // 获取员工列表
    async getEmployeeList(name, obj, val, list, parmas) {
      // if (!name) return
      let query = name ? [{ column: 'name', type: 'eq', value: name }] : []
      if (parmas) {
        query.push(...parmas)
      } else {
        query.push({ column: 'roleCode', type: 'eq', value: this.isCustomer ? 'cts_verifier' : 'sps_verifier' })
      }
      listByRole({ currPage: 1, pageSize: 100, query }).then((res) => {
        list.splice(0, 1000, ...res.data.list.map((v) => ({ ...v, label: `${v.cname}-${v.employeeNo} (${v.deptCname || '未知'})`, value: v.employeeId })))
        // 维护人处理
        let currBd = this.currBd
        if (currBd && parmas && list === BDLIST) {
          if (!this.ruleForm2.bdEmployeeId) {
            let find = list.find((item) => item.value == currBd.bdEmployeeId)
            if (!find) {
              list.unshift({ ...currBd, label: `${currBd.bdEmployeeName}-${currBd.bdEmployeeId} (${currBd.bdDeptName || '未知'})`, value: currBd.bdEmployeeId })
              this.ruleForm2.bdEmployeeId = list[0]
            } else {
              this.ruleForm2.bdEmployeeId = find
            }
          }
          // this.currBd = ''
        }
        // 审核人默认第一个
        if (obj && (this.isClient || !this.isCustomer) && list === LIST) {
          if (val) {
            obj.verifier = list.find((v) => v.value == val)
          } else {
            obj.verifier = list[0]
          }
        }
        // console.log(list.map(v=>v.value));
      })
    },
    saveFormDatas(next) {
      if (next == 'save' || next == 'prevStep') return this.saveData(next)
      let refObj = this.$refs['crmForm'].$refs['form']
      let refObj2 = this.$refs['crmForm2'].$refs['form']
      refObj.validate(async (valid) => {
        if (!valid) return this.$msgErrClose('请将必填项填写完整！')
        refObj2.validate(async (valid2) => {
          if (!valid2) return this.$msgErrClose('请将必填项填写完整！')
          this.saveData(next)
        })
      })
    },
    saveData(next) {
      // this.$emit('nextStep', next === 'submit' ? 3 : false)
      let data = {
        [this.isCustomer ? 'custid' : 'supplierId']: this.custid,
        orgid: this.orgid,
        oid: this.ruleForm.oid,
        orgType: this.ruleForm.orgType,
        address: this.ruleForm.address,
        email: this.ruleForm.email,
        mobileNo: this.ruleForm.mobileNo,
        telNo: this.ruleForm.telNo,
        name: this.ruleForm.name,
        ename: this.ruleForm.ename,
        role: this.ruleForm.role,
        custContactPosition: this.ruleForm.custContactPosition,
        postCode: this.ruleForm.postCode,
        qq: this.ruleForm.qq,
        wechat: this.ruleForm.wechat,
        remark: this.ruleForm.remark,
        verifier: (this.ruleForm2.verifier && this.ruleForm2.verifier.value) || this.ruleForm2._verifier,
        bdEmployeeId: (this.ruleForm2.bdEmployeeId && this.ruleForm2.bdEmployeeId.value) || this.ruleForm2.bdEmployeeId,
        bdEmployeeName: (this.ruleForm2.bdEmployeeId && this.ruleForm2.bdEmployeeId.cname) || this.ruleForm2.bdEmployeeName,
        verifyCode: this.ruleForm.verifyCode,
        orgBankAccountDtos: this.ruleForm.orgBankAccountDtos,
        // bdServiceMode: this.ruleForm2.bdServiceMode,
        diyRole:this.ruleForm.diyRole,
        whatsapp:this.ruleForm.whatsapp,
        wechatEname:this.ruleForm.wechatEname,
        faxNo:this.ruleForm.faxNo,
        duty:this.ruleForm.duty,
        eduBack:this.ruleForm.eduBack,
        familyBack:this.ruleForm.familyBack,
        professionalBack:this.ruleForm.professionalBack,
        hobbies:this.ruleForm.hobbies,
        other:this.ruleForm.other,
      }
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          if (data[key] === '') delete data[key]
        }
      }
      if ((next == 'submit' || next == 'nextStep') && !this.ruleForm.name && !this.ruleForm.ename) {
        return this.$msgErrClose('姓名和英文名必填一个！')
      }
      let model = this.isCustomer ? CUSTOMER : SUPPLIER
      let method = model[next === 'submit' ? 'submit' : 'saveContactAndAccount']
      method(data).then(() => {
        if (next == 'prevStep') {
          this.$emit('nextStep', 1)
          return
        }
        this.$msgSucClose('操作成功！')
        if (next == 'submit') {
          model.verifyStatusInfo({ [this.isCustomer ? 'custid' : 'supplierId']: this.custid }).then(({ data }) => {
            this.$store.commit(`crm/${this.statePath}setVerifierInfo`, {
              name: data.verifierName,
              entName: data.name,
              op: data.createdName,
              date: data.updatedTime,
            })
            this.$emit('nextStep', 3)
          })
        } else {
          this.$emit('nextStep', false)
        }
      })
    },
  },
}
</script>
