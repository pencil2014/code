<template>
  <div>
    <CrmForm
      :disabled="!isSelf"
      :formDatas="checkDatas"
      :ruleForm="checkForm"
      :rules="checkRules"
      class="crm-checkbox"
      ref="checkForm"
    >
      <!-- <p slot="tips" class="tips" v-if="isCustomer">
        注：要成为委托客户，必须先创建潜在客户
      </p> -->
    </CrmForm>
    <!-- {{this.isPotential}}--{{customerMode}} -->
    <CrmCard class="crm-baseinfo" title="基本信息">
      <CrmForm
        :disabled="!isSelf"
        :formDatas="formDatas"
        :ruleForm="ruleForm"
        :rules="rules"
        labelWidth="100px"
        ref="form"
      />
    </CrmCard>
    <CrmFile
      :btnHide="!isSelf"
      :ruleForm="ruleForm2"
      :rules="rules2"
      :tableData="ruleForm.attachments"
      @getFile="getFile"
      @submitForm="submitForm"
      ref="crmFile"
    ></CrmFile>
  </div>
</template>

<script>
import { addBaseInfoData } from '@/views/crm/data'
import CrmFile from '@/views/crm/components/crmFile'
import CrmForm from '@/views/crm/components/crmForm'
import CrmCard from '@/views/crm/components/card'
import { mapState, mapGetters } from 'vuex'
import CUSTOMER from '@/api/crm/customer'
import SUPPLIER from '@/api/crm/supplier'
import ATTACH from '@/api/crm/attachment'
import { countrySelectList, industryRelation } from '@/api/base'
export default {
  name: 'baseInfo',
  components: {
    CrmForm,
    CrmFile,
    CrmCard,
  },
  inject: [
    'isCustomer',
    'statePath',
    'defaultRules',
    'foreignCity',
    'domesticCity',
  ],
  props: ['customerMode', 'isSelf'],
  data() {
    const CityArr = []
    const addr = { province: '', city: '', district: '' }
    const ruleForm = {
      ...addr,
      orgid: '',
      attachments: [],
      categoryDtos: [],
      biztypeDtos: [],
      serviceItemDtos: [],
      customerRoles: []
    }
    let formDatas = []
    addBaseInfoData.forEach((v) => {
      ruleForm[v.prop] = ''
      formDatas.push({
        ...v,
        options: v.prop == 'indexAddr' ? CityArr : undefined,
      })
      if (v.prop === 'regCapital' && this.isCustomer) {
        const arr = [
          {
            type: 'select',
            label: '协会会员',
            prop: 'association',
            propInDict: 'associationMembers',
          },
          {
            type: 'input',
            label: '参保人数',
            prop: 'socialStaffNum',
            maxlength: 9
          },
        ]
        formDatas = formDatas.concat(arr)
        ruleForm.socialStaffNum = ''
        ruleForm.association = ''
      }
        if(v.prop === 'regCapital' && !this.isCustomer){
          const arr = [
            {
              type: 'input',
              label: '结算单位简称',
              prop: 'settleShortName',
            },
          ]
          formDatas = formDatas.concat(arr)
          ruleForm.settleShortName = ''
      }
    })
    ruleForm.countryCode = ''
    // 新增字段
    ruleForm.scale = ''
    ruleForm.marketShare = ''
    ruleForm.companyShare = ''
    ruleForm.podServiceAbility = ''
    // console.log(ruleForm)
    const rules = {}
    const rules2 = {}
    // 国外客户，不必填国家、省、统一代码、纳税号
    const arr1 = [
      'custClass',
      'serviceMode',
      'name',
      'uscc',
      'taxId',
      'country',
      'indexAddr',
      'registerAddr',
      'detailAddr',
      'scale',
      // 'podServiceAbility',
      'marketShare',
      'companyShare',
      // 新增三个必填项
      'shortEname',
      'shortName',
      'setupDate',
      'industryArr'
    ]
    const arr2 = ['name', 'type']
    arr1.forEach((v) => (rules[v] = { ...this.defaultRules }))
    arr2.forEach((v) => (rules2[v] = { ...this.defaultRules }))
    return {
      fileName: [],
      ruleForm2: {
        orgid: '',
        type: '',
        typeName: '',
        remark: '',
        fileName: [],
      },
      formLabelWidth: '',
      rules2,
      customerRoles: [],
      ruleForm,
      rules,
      formDatas,
      checkForm: {
        customerRoles: [],
        categoryDtos: [],
        biztypeDtos: [],
        serviceItemDtos: [],
      },
      checkDatas: [],
      checkRules: {},
      supplierCategory: [],
      supplierBizType: [],
      supplierService: [],
      CityArr,
      newSetupDate: '' //要传给后台的成立日期，如果是年份，后面加上"-01-01"
    }
  },
  computed: {
    // ['custid', 'orgid', 'baseInfo', 'searchCustomerDetail']
    ...mapState('crm', {
      customerId: (state) => state.custid,
      customerOrgid: (state) => state.orgid,
      customerBaseInfo: (state) => state.baseInfo,
      customerSearchCustomerDetail: (state) => state.searchCustomerDetail,
    }),
    ...mapState('crm/supplier', {
      supplierId: (state) => state.custid,
      supplierOrgid: (state) => state.orgid,
      supplierBaseInfo: (state) => state.baseInfo,
      supplierSearchCustomerDetail: (state) => state.searchCustomerDetail,
    }),
    ...mapGetters(['dictMap', 'dictMapObj']),
    custid() {
      return this.isCustomer ? this.customerId : this.supplierId
    },
    orgid() {
      return this.isCustomer ? this.customerOrgid : this.supplierOrgid
    },
    isObd() {
      return this.$store.state.user.roles.includes('obd')
    },
    baseInfo() {
      return (
        (this.isCustomer ? this.customerBaseInfo : this.supplierBaseInfo) || {}
      )
    },
    searchCustomerDetail() {
      return this.isCustomer
        ? this.customerSearchCustomerDetail
        : this.supplierSearchCustomerDetail
    },
    isPotential() {
      return this.customerMode == 'potential'
    },
    custClassType () {
      if (!this.ruleForm.countryCode || !this.ruleForm.custClass) {
        return ''
      }
      let companyCountryCode = this.$store.state.user.userInfo.companyCountryCode || 'CN'
      let isSameCountry = companyCountryCode === this.ruleForm.countryCode
      // 中国香港台湾属于国内
      if (companyCountryCode === 'CN' && ['TW','HK', 'MO'].includes(this.ruleForm.countryCode)) {
        isSameCountry = true
      }
      // domestic_cust: "国内直客"// domestic_peer: "国内同行"// foreign_cust: "国外直客"// foreign_peer: "国外同行"
      return ( isSameCountry ? 'domestic_' : 'foreign_' ) + this.ruleForm.custClass
    }
  },
  watch: {
    'ruleForm.name'(val){
      if(/[\u4E00-\u9FA5]/g.test(val)){
        this.rules.shortName.required = true
      }else{
        this.rules.shortName.required = false
      }
    },
    'ruleForm.shortName':{
       handler(val,old) {
        if(/[\u4E00-\u9FA5]/g.test(this.ruleForm.name)){
          if((val !== old) && val){
          CUSTOMER.getEname({name:val
          }).then((res) => {
            this.ruleForm.shortEname = res.data
          })
        }
        }
       }
    },
    'checkForm.biztypeDtos'(val, oldVal) {
      const bType = this.supplierService
      const origin = this.checkForm.serviceItemDtos
      const arr = []
      try {
        bType.splice(0, 1000, ...bType.map((v) => ({ ...v, show: false })))
        // 遍历business已取值，找到服务项内parent值在val内的元素，且未出现过（去重）的元素设置为可见
        const obj = {}
        val.forEach((k) => {
          bType.forEach((item) => {
            if (k == item.parent && !obj[item.value] && item.label) {
              obj[item.value] = true
              item.show = true
              if (origin.indexOf(item.value) > -1) {
                arr.push(item.value)
              }
            }
          })
        })
      } catch (error) {}
      if (oldVal.length > val.length) {
        this.$nextTick(() => {
          origin.splice(0, 100, ...arr)
        })
      }
    },
    'ruleForm.country': {
      handler(val) {
        if (!val) return
        const required = ['中国', '中国大陆', "中国香港", "中国澳门", "香港", "澳门"].includes(val)
        const ChinaRequired = val === "中国"
        if (ChinaRequired) {
          this.CityArr.splice(0, 1000, ...this.dictMap.domesticCity)
        } else {
          this.CityArr.splice(0, 1000, ...this.dictMap.foreignCity)
        }
        this.rules.indexAddr.required = required
        // })
        if ((val === "中国") || (["中国香港", "中国台湾", "中国澳门", "香港", "台湾", "澳门"].includes(val) 
        && (
          // this.checkForm.customerRoles.includes('potential')||
        this.checkForm.customerRoles.includes('client')))) {
          this.rules.uscc.required = true
          this.rules.taxId.required = true
        } else {
          this.rules.uscc.required = false
          this.rules.taxId.required = false
        }
        let pp = this.checkForm.customerRoles.includes('potential') 
        let cc = this.checkForm.customerRoles.includes('client') 
        if(this.checkForm.customerRoles.includes('settlement') && !required && !(pp||cc)){
          //国外的结算单位
          this.rules.scale.required = false
          this.rules.setupDate.required = false
          // this.rules.entType.required = false
          this.rules.industryArr.required = false
        }else{
          this.rules.scale.required = true
          this.rules.setupDate.required = true
        }
        this.$nextTick(() => {
          this.ruleForm.indexAddr = this.ruleForm.indexAddr && [
            ...this.ruleForm.indexAddr,
          ]
          const find = this.formDatas.find((v) => v.prop === 'country')
          const list = find ? find.list : []
          if (list.length) {
            const findCode = list.find((v) => v.value === val)
            const code = findCode ? findCode.countryCode : ''
            this.ruleForm.countryCode = code
          } else {
            countrySelectList({ countryCode: val, state: 'valid' }).then(
              (res) => {
                if (res.data.length) {
                  const findCode = res.data.find((v) => v.cname === val)
                  const code = findCode ? findCode.countryCode : ''
                  this.ruleForm.countryCode = code
                }
              },
            )
          }
        })
        // let required = val == '中国'
        // this.ruleForm.indexAddr = ''
        // if (required) {
        //   this.CityArr.splice(0, 1000, ...this.domesticCity)
        // } else {
        //   this.CityArr.splice(0, 1000, ...this.foreignCity)
        // }
        // this.rules.uscc.required = this.rules.taxId.required = this.rules.indexAddr.required = required
      },
      immediate: true,
    },
    'checkForm.customerRoles':{
      handler(val) {
        if (!val) return
        if ((this.ruleForm.country === "中国") || (["中国香港", "中国台湾", "中国澳门", "香港", "台湾", "澳门"].includes(this.ruleForm.country) 
        && (
          // val.includes('potential')||
         val.includes('client')))) {
          this.rules.uscc.required = true
          this.rules.taxId.required = true
        } else {
          this.rules.uscc.required = false
          this.rules.taxId.required = false
        }
        if(val.includes('settlement') 
          && !((this.ruleForm.country === "中国") || (["中国香港", "中国台湾", "中国澳门", "香港", "台湾", "澳门"].includes(this.ruleForm.country)))
          && !(val.includes('potential') ||val.includes('client'))){
          //国外的结算单位
          this.rules.scale.required = false
          this.rules.setupDate.required = false
          // this.rules.entType.required = false
          this.rules.industryArr.required = false
        }else{
          this.rules.scale.required = true
          this.rules.setupDate.required = true
        }
        if(val.includes('potential')|| val.includes('client')){
          this.rules.marketShare.required = true
          this.rules.companyShare.required = true
        }else{
          this.rules.marketShare.required = false
          this.rules.companyShare.required = false
        }
        if(this.isObd){
          console.log('this.checkDatas',this.checkDatas)
          this.checkDatas.forEach((v) => {
          if (v.value === "potential") {
            this.$set(v, "disabled", true)
          }
        })         
        }
      }
    },
    'custClassType'(val) {
      console.log('val',val)
      if (!this.isCustomer || !val) {
        return
      }
      if(val === 'foreign_peer' && this.isCustomer){
          this.rules.registerAddr.required = false
      }else{
          this.rules.registerAddr.required = true
      }
      if (val === 'domestic_cust') {
        this.$set(this.rules, 'entType', { ...this.defaultRules })
      } else {
        this.$set(this.rules, 'entType', {})
      }
      if (val.includes('cust')) {
        this.rules.industryArr.required = true
      } else {
        this.rules.industryArr.required = false
      }
      // domestic_cust: "国内直客"// domestic_peer: "国内同行"// foreign_cust: "国外直客"// foreign_peer: "国外同行"
      const foreignList = [
        {
          type: 'select',
          label: '公司规模',
          prop: 'scale',
          list: this.dictMap['orgScale'].filter((item) =>
            item.value.includes('fp'),
          ),
        },
        {
          label: '目的港服务能力',
          type: 'select',
          prop: 'podServiceAbility',
          propInDict: 'podServiceAbility',
        },
        {
          type: 'select',
          label: '市场占有率',
          prop: 'marketShare',
          propInDict: 'marketShare',
        },
        {
          type: 'select',
          label: '我司占有率',
          prop: 'companyShare',
          propInDict: 'companyShare',
        },
      ]
      const domesticPeerList = [
        {
          type: 'select',
          label: '公司规模',
          prop: 'scale',
          list: this.dictMap['orgScale'].filter((item) =>
            item.value.includes("dp") || item.value.includes("dc"),
          ),
        },
      ]
      const listObj = {
        foreign_peer: foreignList,
        foreign_cust: foreignList,
        domestic_peer: domesticPeerList,
        domestic_cust: domesticPeerList,
      }
      const arr = listObj[val] || []
      const index = this.formDatas.findIndex(
        (item) => item.prop === 'socialStaffNum',
      )
      const last = this.formDatas.findIndex(
        (item) => item.prop === 'registerAddr',
      )
      const delProp = this.formDatas
        .slice(index + 1, last)
        .map((item) => item.prop)
      if (delProp.length) {
        delProp.forEach((ele) => {
          this.ruleForm[ele] = ''
        })
      }
      const len = last - index - 1 || 0
      this.formDatas.splice(index + 1, len, ...arr)
      // 历史数据scale（公司规模是错误的置空）
      if (this.ruleForm.scale) {
        let find = this.formDatas.find(item => item.prop === 'scale')?.list?.some(ele => ele.value === this.ruleForm.scale)
        if (!find) {
          this.$set(this.ruleForm, 'scale', '')
        }
      }
    },
  },
  async created() {
    let userInfo = this.$store.state.user.userInfo
    this.supplierCategory = this.dictMap.crmCategory.map((item) =>
      Object.assign({}, item),
    )
    this.supplierBizType = this.dictMap.crmBusiness.map((item) =>
      Object.assign({}, item),
    )
    // this.supplierBizType = this.dictMap.crmBusiness.map((v) => ({
    //   ...v,
    // }))
    this.supplierService = this.dictMap.crmService.map((v) => ({
      ...v,
      show: false,
    }))
    this.getIndustry()
    if (this.isCustomer) {
      this.checkRules.customerRoles = { ...this.defaultRules, message: '必选' }
      if(this.isObd){
        this.checkDatas.push({
        label: '企业类别：',
        type: 'checkboxGroup',
        prop: 'customerRoles',
        // propInDict: 'customerRole',
        list: this.dictMap['customerRole'].filter(
          (item) => item.value !== 'client' && item.value !== 'potential',
        ),
      })
      }else{
        this.checkDatas.push({
        label: '企业类别：',
        type: 'checkboxGroup',
        prop: 'customerRoles',
        // propInDict: 'customerRole',
        list: this.dictMap['customerRole'].filter(
          (item) => item.value !== 'client',
        ),
      })
      }

    } else {
      this.formDatas.splice(0, 2, { ...this.formDatas[1], label: '供应商名称' })
      this.checkRules.biztypeDtos = { ...this.defaultRules, message: '必选' }
      this.checkRules.categoryDtos = { ...this.defaultRules, message: '必选' }
      this.checkDatas.push(
        {
          label: '供应商类型：',
          type: 'checkboxGroup',
          prop: 'categoryDtos',
          list: this.supplierCategory,
        },
        {
          label: '可支持业务：',
          type: 'checkboxGroup',
          prop: 'biztypeDtos',
          list: this.supplierBizType,
        },
        {
          label: '服务项类型：',
          type: 'checkboxGroup',
          prop: 'serviceItemDtos',
          list: this.supplierService,
        },
      )
       this.rules.shortEname.required = false
       this.rules.shortName.required = false
       this.rules.setupDate.required = false
       this.rules.industryArr.required = false
    }
    if (this.custid) {
      const fn = (arr1, arr2, type) =>
        arr1.splice(0, 100, ...arr2.map((item) => item[type]))
      const baseInfo = this.baseInfo
      baseInfo.organizationDto = baseInfo.organizationDto || {}
      let setupDate = baseInfo.organizationDto.setupDate
      if (setupDate) {
        let [yearStr, monStr] = []
        if (setupDate.length === 10 && /^\d{4}[-][0,1][0-9][-][0-3][0-9]$/.test(setupDate)) {
          yearStr = setupDate.slice(0, 4) // yyyy
          monStr = setupDate.slice(4, 7) // -MM
          if (baseInfo.organizationDto.setupDateType) {
            let setupDateType = baseInfo.organizationDto.setupDateType
            if (setupDateType === 'year') {
              baseInfo.organizationDto.setupDate = yearStr
            } else if (setupDateType === 'month') {
              baseInfo.organizationDto.setupDate = yearStr + monStr
            }
          }
        }
      }
      Object.keys(this.ruleForm).forEach((key) => {
        if (key === 'usccExpDate') {
          const date = baseInfo.organizationDto.usccExpDate
          this.ruleForm[key] = date === '无固定期限' ? '' : date
        } else if (key === 'customerRoles') {
          fn(this.checkForm[key], baseInfo.roles || [], 'roleType')
        } else if (key === 'categoryDtos') {
          //修改categoryCode
          fn(this.checkForm[key], baseInfo.categoryDtos || [], 'category')
        } else if (key === 'biztypeDtos') {
          setTimeout(() => {
            fn(this.checkForm[key], baseInfo.biztypeDtos || [], 'businessType')
          }, 60)
        } else if (key === 'serviceItemDtos') {
          setTimeout(() => {
            fn(
              this.checkForm[key],
              baseInfo.serviceItemDtos || [],
              'serviceCode',
            )
          }, 100)
        } else if (key === 'attachments') {
          this.ruleForm[key].splice(0, 1000, ...(baseInfo.attachment || []))
        } else if (key === 'custClass' && this.isCustomer) {
          this.ruleForm[key] = baseInfo.customerDto[key]
        } else if (key === 'serviceMode' && this.isCustomer) {
          this.ruleForm[key] = baseInfo.customerDto[key]
        } else if (key === 'entType') {
          if (!['le', 'other', 'soe'].includes(baseInfo.organizationDto[key])) {
            this.ruleForm[key] = ''
          } else {
            this.ruleForm[key] = baseInfo.organizationDto[key]
          }
        } else {
          this.ruleForm[key] =
            baseInfo.organizationDto[key] ||
            (baseInfo.customerDto && baseInfo.customerDto[key])
        }
      })
      const { province, city, district } = this.ruleForm
      this.$set(
        this.ruleForm,
        'indexAddr',
        province
          ? district
            ? [province, city, district]
            : [province, city]
          : [],
      )
      // 渲染所属行业
      let industry = JSON.parse(baseInfo.organizationDto.industry)
      if (industry && industry.length) {
        this.$set(this.ruleForm, 'industryArr', industry.pop())
      }
      
    } else {
      this.ruleForm = { ...this.ruleForm, ...this.searchCustomerDetail }
      const { province, city, district } = this.ruleForm
      this.$set(
        this.ruleForm,
        'indexAddr',
        province
          ? district
            ? [province, city, district]
            : [province, city]
          : [],
      )
      this.$set(this.ruleForm, 'entType', '')
      // 修改所属行业格式
      let industry = this.ruleForm.industry
      let industryArr = []
      if (industry) {
        if (industry.includes('[')) {
          industryArr = JSON.parse(industry)
          this.$set(this.ruleForm, 'industryArr', industryArr.pop())
        } else {
          industryArr.push(industry)
          this.$set(this.ruleForm, 'industryArr', industry)
        }
      } else {
        this.$set(this.ruleForm, 'industryArr', '')
      }

      // let industry = JSON.parse(this.ruleForm.industry)
      // if (industry && industry.length) {
      //   this.$set(this.ruleForm, 'industryArr', industry.pop())
      // }
    }
    // this.CityArr.splice(0, 1000, ...JSON.parse(JSON.stringify(this.CityArr)))
    this.$nextTick(() => {
      if (this.ruleForm.province) {
        this.ruleForm.indexAddr = [this.ruleForm.province, this.ruleForm.city, this.ruleForm.district]
      } else {
        this.ruleForm.indexAddr = []
      }
    })
  },
  methods: {
    // 获取行业数据
    getIndustry () {
      industryRelation({}).then(res => {
        if (res.code === 0) {
          let find = this.formDatas.find(item => item.prop === 'industryArr')
          find.cascaderList.splice(0, 1000, ...this.getTreeData(res.data || []))
        }
      }).catch(()=>{})
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      data.forEach((item) => (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined))
      return data
    },
    // 获取上传的文件
    getFile(fileList) {
      this._childFileList = fileList
      this.fileName = fileList.map((item) => item.raw)
    },
    // 表单提交
    submitForm(refFormName) {
      refFormName.validate((valid) => {
        const formData = new FormData()
        this.fileName.forEach((item, index) =>
          formData.append('fileNames', item),
        )
        this.ruleForm2.typeName = this.dictMapObj.attachmentType[
          this.ruleForm2.type
        ]
        formData.append('orgType', this.isCustomer ? 'customer' : 'supplier')
        formData.append('type', this.ruleForm2.type)
        formData.append('typeName', this.ruleForm2.typeName)
        formData.append('remark', this.ruleForm2.remark)
        const crmFile = this.$refs.crmFile
        const uploadFile = crmFile.$refs.uploadFile
        crmFile.btnLoading = true
        uploadFile.handleProgress()
        ATTACH.attachmentUpload(formData)
          .then((res) => {
            crmFile.showDialog(false)
            this._childFileList.splice(0, 100)
            this.$msgSucClose('新增成功!')
            this.ruleForm.attachments.push(...res.data)
          })
          .finally(() => {
            crmFile.btnLoading = false
            uploadFile.showProcess = false
          })
      })
    },
    saveFormDatas(arg) {
      if (this.ruleForm.setupDate) {
        if (!/^\d{4}$/.test(this.ruleForm.setupDate) && !/^\d{4}[-][0,1][0-9]$/.test(this.ruleForm.setupDate) && !/^\d{4}[-][0,1][0-9][-][0-3][0-9]$/.test(this.ruleForm.setupDate)) {
          return this.$msgErrClose('成立日期输入有误，仅支持yyyy/yyyy-mm/yyyy-mm-dd三种格式！')
        } else if (/^\d{4}$/.test(this.ruleForm.setupDate)) { //只输入了年 yyyy 默认加上“-01-01”
          this.newSetupDate = this.ruleForm.setupDate + '-01-01'
          this.ruleForm.setupDateType = 'year'
        } else if (/^\d{4}[-][0,1][0-9]$/.test(this.ruleForm.setupDate)) { //只输入了年月 yyyy-mm 默认加上 “-01”
          this.newSetupDate = this.ruleForm.setupDate + '-01'
          this.ruleForm.setupDateType = 'month'
        } else if (/^\d{4}[-][0,1][0-9][-][0-3][0-9]$/.test(this.ruleForm.setupDate)) { //输入年月日 yyyy-mm-dd
          this.newSetupDate = this.ruleForm.setupDate
          this.ruleForm.setupDateType = ''
        }
      } else {
        this.newSetupDate = ''
        this.ruleForm.setupDateType = ''
      }
      if (arg == 'save') return this.saveData(arg)
      // if (this.isPotential) return this.validateBase(arg)
        this.$refs.checkForm.$refs.form.validate((valid) => {
          if(this.isCustomer){
            if(!/[\u4E00-\u9FA5]/g.test(this.ruleForm.name)){
              // 英文抬头的限制
              if (this.ruleForm.name.indexOf("  ") !== -1) {
                return this.$msgErrClose('客户名称不能出现两个连续的空格！')
              } 
              if(this.ruleForm.name !== this.ruleForm.name.toUpperCase()){
                return this.$msgErrClose('客户名称只能输入大写字母！')
              }
              if((/[\uff00-\uffff]/g).test(this.ruleForm.name)){
                return this.$msgErrClose('客户名称只能输入半角符号！')
              }
            }
            if(this.ruleForm.name.substr(0,1)===' '){
              return this.$msgErrClose('客户名称开头有空格！')
            }
            if(this.ruleForm.name.substr(this.ruleForm.name.length-1,1)===' '){
              return this.$msgErrClose('客户名称结尾有空格！')
            }
            const txt = /[a-zA-Z]/.test(this.ruleForm.shortName)
            const txt2 = /[\u4E00-\u9FA5\uF900-\uFA2D]/.test(this.ruleForm.shortEname)
            if(!this.ruleForm.country.includes('中国')&&txt && this.ruleForm.shortName){
              return this.$msgErrClose('中文简称禁止填写英文字母，可填写无')
            }
            if(txt2){
              return this.$msgErrClose('英文简称禁止填写中文汉字')
            }
          }
        if (valid) return this.validateBase(arg)
      })
    },
    validateBase(arg) {
      this.$refs.form.$refs.form.validate((valid) => {
        if (!valid) {
          return this.$msgErrClose('请将必填项填写完整！')
        }else{
          return this.saveData(arg)
        }
      })
    },
    saveData(arg) {
      let industry = []
      if (Array.isArray(this.ruleForm.industryArr)) {
        industry = this.ruleForm.industryArr
      } else {
        industry.push(this.ruleForm.industryArr)
      }
      const data = {
        [this.isCustomer ? 'custid' : 'supplierId']: this.custid,
        orgid: this.ruleForm.orgid,
        country: this.ruleForm.country,
        countryCode: this.ruleForm.countryCode,
        custClass: this.ruleForm.custClass,
        serviceMode: this.ruleForm.serviceMode,
        detailAddr: this.ruleForm.detailAddr,
        registerAddr: this.ruleForm.registerAddr,
        ename: this.ruleForm.ename,
        entType: this.ruleForm.entType,
        indexAddr: this.ruleForm.indexAddr,
        province: this.ruleForm.indexAddr && this.ruleForm.indexAddr[0],
        city: this.ruleForm.indexAddr && this.ruleForm.indexAddr[1],
        district: this.ruleForm.indexAddr && this.ruleForm.indexAddr[2],
        industry: industry,
        name: this.ruleForm.name,
        remark: this.ruleForm.remark,
        setupDate: this.newSetupDate,
        setupDateType: this.ruleForm.setupDateType,
        shortName: this.ruleForm.shortName,
        taxId: this.ruleForm.taxId,
        USCC: this.ruleForm.uscc,
        usccExpDate:
          this.ruleForm.usccExpDate === '无固定期限'
            ? ''
            : this.ruleForm.usccExpDate,
        attachments: this.ruleForm.attachments,
        regCapital: this.ruleForm.regCapital,
        legalPerson: this.ruleForm.legalPerson,
        association: this.ruleForm.association,
        socialStaffNum: this.ruleForm.socialStaffNum,
        simpleCode: this.ruleForm.simpleCode,
        shortEname: this.ruleForm.shortEname,
        podServiceAbility: this.ruleForm.podServiceAbility,
        marketShare: this.ruleForm.marketShare, 
        companyShare: this.ruleForm.companyShare,
        scale: this.ruleForm.scale,
        settleShortName: this.ruleForm.settleShortName
      }
      const model = this.isCustomer ? CUSTOMER : SUPPLIER
      if (this.isCustomer) {
        data.custMode = this.isPotential ? 'potential' : 'order'
        // data.customerRoles = this.checkForm.customerRoles.map(val => ({
        //   roleType: val
        // }))
        data.customerRoles = this.checkForm.customerRoles.map((val) => {
          let find = this.baseInfo?.roles?.find((item) => item.roleType === val)
          if (!find) {
            find = {
              custid: this.custid,
              roleType: val,
            }
          }
          return find
        })
      } else {
        data.biztypeDtos = this.checkForm.biztypeDtos.map((val) => ({
          businessType: val,
        }))
        data.categoryDtos = this.checkForm.categoryDtos.map((val) => ({
          //修改categoryCode: val,
          category: val,
        }))
        data.serviceItemDtos = this.checkForm.serviceItemDtos.map((val) => ({
          serviceCode: val,
        }))
      }
      data.saveOrNext = arg === 'nextStep' ? 'next' : 'save'
      model.saveBasicInfo(data).then((res) => {
        if (arg === 'nextStep') {
          this.$store.commit(
            `crm/${this.statePath}setCustid`,
            this.isCustomer ? res.data.custid : res.data.supplierId,
          )
          this.$store.commit(`crm/${this.statePath}setOrgid`, res.data.orgid)
          this.$emit('saveOk', 2)

          // this.$store.commit(`crm/${this.statePath}setBaseInfo`, {
          //   contact: [],
          //   ...this.baseInfo,
          //   roles: data.customerRoles,
          //   ...data,
          //   customerDto: { ...data },
          //   organizationDto: { ...data, uscc: data.USCC },
          //   supplierDto: { ...data },
          // })
        } else {
          this.$msgSucClose('保存成功')
          this.$emit('nextStep', false)
        }
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.crm-checkbox {
  margin: 0 20px 10px;
}
.crm-baseinfo {
  margin-bottom: 10px;
}
.card-title {
  background: #f8f9fd;
  font-size: 18px;
  font-weight: 600;
  color: #222222;
  line-height: 40px;
  text-indent: 25px;
}
.tips {
  color: #999;
  float: right;
  margin-top: -20px;
}
</style>