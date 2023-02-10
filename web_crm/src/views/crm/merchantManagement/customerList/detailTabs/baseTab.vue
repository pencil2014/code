<template>
<div>
  <div class="base-tab">
    <!-- 客户部、供应商部，不能修改基本资料 -->
    <!-- <InfoList
      v-if="reviewInfo"
      :updateInfo="updateInfo"
      :custInfo="custInfo"
      :isSupplier="isSupplier"
    ></InfoList>-->
    <!-- 业务可修改基本资料 -->
    <!-- <template v-else> :disabled="isEdit"-->
    <div class="top-box">
      <el-button
        @click="verifyApply()"
        class="save-btn"
        size="mini"
        type="success"
        v-show="!['submit','pass'].includes(custInfo.verifyStatus) && !reviewInfo && isSelf 
        && (custInfo.roles || []).some(item => ['potential', 'client'].includes(item.roleType)) && !isBlacklist" 
        >提交资质审核</el-button
      >
      <el-button
        @click="saveBaseInfo(true)"
        class="save-btn"
        size="mini"
        type="primary"
        v-show="
          custInfo.verifyStatus != 'submit'  &&
          !reviewInfo &&
          isSelf && !isBlacklist
        "
        >保存</el-button
      >
      <!-- <p
        class="tips"
        v-if="!isSupplier && !isClientOrigin && !isPotentialOrigin && isSelf"
      >
        注：要成为委托客户，必须先成为潜在客户
      </p> -->
    </div>
    <CrmForm
      :disabled="isDisabled"
      :formDatas="formDatas"
      :hideBtn="!isSelf || !!reviewInfo"
      :ruleForm="ruleForm"
      :rules="rules"
      labelWidth="100px"
      ref="form"
    />
    <!-- 潜在客户选择新旧模式弹框  -->
     <!-- <CrmDialog :option="dialogBdServiceMode" @close="bdServiceModeClose" v-if="dialogBdServiceMode.show && !isObd"/> -->
    <!-- </template> -->
  </div>
    <!-- 海外同行基本信息 -->
    <div class="finance-search-list-gap"></div>
    <template v-if="isForeignPeer">
    <div class="top-box">
      <el-button
        @click="saveForPeerBeseInfo(true)"
        class="save-fp-btn"
        size="mini"
        type="primary"
        v-show="
          !reviewInfo &&
          isSelf
        "
        >保存</el-button
      >
    </div>
      <foreignPeerDetail ref="foreignPeerDetail" :isForeignPeer="isForeignPeer"  :isSelf="isSelf" :baseInfo="ruleForm" :isDisabled="isOverDisabled"></foreignPeerDetail>
    </template>
  </div>
</template>
<script>
import { addBaseInfoData } from "@/views/crm/data"
import { mapState, mapGetters } from "vuex"
import { routerMixin } from "@/views/finance/mixins/routerMixin"
import InfoList from "@/views/crm/components/infoList"
import CrmForm from "@/views/crm/components/crmForm"
import CrmDialog from "@/views/crm/components/crmDialog"
import CUSTOMER from "@/api/crm/customer"
import { industryRelation } from '@/api/base'
import foreignPeerDetail from './components/foreignPeerDetail'
export default {
  name: "CUST1",
  label: "基本信息",
  supplierShow: true,
  mixins: [routerMixin],
  props: [
    "custid",
    "supplierBaseInfo",
    "isSupplier",
    "reviewInfo",
    "isEdit",
    "isClient",
    "isPotential",
    "isPotentialOrigin",
    "isClientOrigin",
    "isManager",
    "isSelf",
    "isForeignPeer",
    "isBlacklist",
  ],
  inject: ["defaultRules", "foreignCity", "domesticCity"],
  components: { InfoList, CrmForm ,CrmDialog, foreignPeerDetail },
  data() {
    // 此处声明的变量，在各处的此组件均共享  ,修改为不能共享，共享会影响其它页面的显示
    // supplier category
    const CLIST = []
    // supplier business
    const BLIST = []
    // supplier service
    const SLIST = []
    // customer role
    const ROLELIST = []
    const CityArr = []
    const ruleForm = { custid: "", orgid: "" }
    const rules = !this.isSupplier
      ? {
          custClass: { ...this.defaultRules },
          serviceMode: { ...this.defaultRules },
          customerRoles: { ...this.defaultRules, message: "必选" },
        }
      : {
          categoryDtos: { ...this.defaultRules, message: "必选" },
          biztypeDtos: { ...this.defaultRules, message: "必选" },
        }
    // let rules = !this.isSupplier
    //   ? {
    //       custClass: { ...this.defaultRules, required: false },
    //       serviceMode: { ...this.defaultRules, required: false },
    //       customerRoles: { ...this.defaultRules, message: '必选' },
    //     }
    //   : { categoryDtos: { ...this.defaultRules, message: '必选' }, biztypeDtos: { ...this.defaultRules, message: '必选' } }
   const arr = [
      ...addBaseInfoData.map((item) => ({
        ...item,
        options: item.prop == "indexAddr" ? CityArr : undefined,
      })),
    ]
    // TODO 客户暂时可以修改客户类型
    if (this.isSupplier) {
      arr[0] = { ...arr[0], disabled: true }
    }
    // arr[0] = { ...arr[0], disabled: true }
    if (this.isSupplier) {
      let index = arr.findIndex((item) => item.prop == "regCapital");
        arr.splice(
        index + 1,
        0,
        {
          type: 'input',
          label: '结算单位简称',
          prop: 'settleShortName',
        },
      )
      const items = [
        {
          label: "供应商类型：",
          type: "checkboxGroup",
          prop: "categoryDtos",
          list: CLIST,
        },
        {
          label: "可支持业务：",
          type: "checkboxGroup",
          prop: "biztypeDtos",
          list: BLIST,
        },
        {
          label: "可支持服务：",
          type: "checkboxGroup",
          prop: "serviceItemDtos",
          list: SLIST,
        },
        { ...arr[1], label: "供应商名称" },
      ]
      arr.splice(0, 2, ...items)
    } else {
      arr.unshift({
        type: "checkboxGroup",
        label: "企业类别",
        prop: "customerRoles",
        list: ROLELIST,
      })
      let index = arr.findIndex((item) => item.prop == "regCapital")
      arr.splice(
        index + 1,
        0,
        {
          type: "select",
          label: "协会会员",
          prop: "association",
          propInDict: "associationMembers",
        },
        {
          type: "input",
          label: "参保人数",
          prop: "socialStaffNum",
          maxlength: 9
        },
        {
          type: "date",
          label: "首次合作时间",
          prop: "firstTime",
          disabled: true,
        },
        {
          type: "date",
          label: "最近合作时间",
          prop: "nearlyTime",
          disabled: true,
        }
      )
    }
    arr.forEach((item) => {
      ruleForm[item.prop] =
        [
          "categoryDtos",
          "biztypeDtos",
          "customerRoles",
          "serviceItemDtos",
        ].indexOf(item.prop) == -1
          ? ""
          : []
    })
    const ruleArr = [
      "custClass",
      "serviceMode",
      "name",
      "uscc",
      "taxId",
      "country",
      "indexAddr",
      "registerAddr",
      "detailAddr",
      "scale",
      // "podServiceAbility",
      "marketShare",
      "companyShare",
      // 新增三个必填项(基本信息修改)
      'shortEname',
      'shortName',
      'setupDate',
      'industryArr'
    ]
    ruleArr.forEach((v) => (rules[v] = { ...this.defaultRules }))
    if (
      this.$route.name == "CustomerDetail" ||
      this.$route.name == "SupplierDetail"
    ) {
      arr[arr.length - 1] = {
        ...arr[arr.length - 1],
        btnCfg: {
          hidden: false,
          text: "保存备注",
          callback: () => {
            this.$confirmWarn("确认保存修改后的备注？", () => this.saveRemark())
          },
        },
      }
    }
    return {
      ruleForm,
      rules,
      formDatas: arr,
      CityArr,
      isReview: [
        "SupplierReviewDetailPass",
        "CustomerReviewDetailPass",
        "PotentialDetail",
      ].includes(this.$route.name),
      CLIST,
      BLIST,
      SLIST,
      ROLELIST,
      isRecycle:'',
      // 潜在客户新旧模式选择 
      // dialogBdServiceMode:{
      //   show: false,
      //   showClear: true,
      //   btnLoading: false,
      //   title: '新旧模式',
      //   text: '确定',
      //   labelWidth: '100px',
      //   formItems: [
      //     {
      //       label: '新旧模式',
      //       type: 'select',
      //       prop: 'bdServiceMode',
      //       propInDict: 'customerServiceMode',
      //       rules: { ...this.defaultRules }
      //     },

      //   ],
      //   form: {
      //     bdServiceMode: '',
      //   }
      // }
    }
  },
  computed: {
    ...mapGetters(["dictMap", "dictMapObj"]),
    ...mapState('user', ['userId', 'deptCode']),
    // 基本信息
    custInfo() {
      if (this.reviewInfo) {
        return this.reviewInfo
      }
      this.isFirst = true
      const info = this.detailBaseInfo
      const notCreateSubmit =
        info.verifyStatus == "submit" && info.status !== "create"
      return notCreateSubmit
        ? { ...info.updateInfo, verifyStatus: "submit" }
        : info
    },
    // 客户
    ...mapState("crm", {
      c_detailBaseInfo: (state) => state.detailBaseInfo,
    }),
    // 供应商
    ...mapState("crm/supplier", {
      s_detailBaseInfo: (state) => state.detailBaseInfo,
    }),
    // 根据是否是供应商，返回对应缓存信息
    detailEditInfo() {
      return this.isSupplier ? this.s_detailEditInfo : this.c_detailEditInfo
    },
    detailBaseInfo() {
      return this.isSupplier ? this.s_detailBaseInfo : this.c_detailBaseInfo
    },
    isDisabled() {
      if(this.isRecycle==='yes'){
        return (!this.isSelf)
      }else{
        return (
          // (this.isEdit && !this.isPotential) ||
          this.custInfo.verifyStatus == "submit" ||
          !!this.reviewInfo ||
          !this.isSelf || this.isBlacklist
        )
      }
    },
    isOverDisabled() {
      if(this.isRecycle==='yes'){
        return (!this.isSelf)
      }else{
        return (
          !!this.reviewInfo ||
          !this.isSelf
        )
      }
    },
    custClassType () {
      if (!this.ruleForm.countryCode || !this.ruleForm.custClass) {
        return ''
      }
      let companyCountryCode = this.$store.state.user.userInfo.companyCountryCode || 'CN'
      let isSameCountry = companyCountryCode === this.ruleForm.countryCode
      // 中国香港台湾属于国内
      if (companyCountryCode==='CN' && ['TW','HK', 'MO'].includes(this.ruleForm.countryCode)) {
        isSameCountry = true
      }
      // domestic_cust: "国内直客"// domestic_peer: "国内同行"// foreign_cust: "国外直客"// foreign_peer: "国外同行"
      return ( isSameCountry ? 'domestic_' : 'foreign_' ) + this.ruleForm.custClass
    },
    isObd(){
      return this.$store.state.user.roles.includes('obd')
    },
  },
  watch: {
    // 监听基本信息，对有关联的项进行特殊处理
    custInfo(val) {
      let data = Object.assign({}, val.backupInfo, val)
      this.CLIST.forEach((v) => (v.disabled = false))
      this.BLIST.forEach((v) => (v.disabled = false))
      if (!this.reviewInfo) this.$refs.form.$refs.form.resetFields()
      this.ruleForm = Object.assign(
        {},
        this.ruleForm,
        JSON.parse(JSON.stringify(data))
      )
      if (this.isSupplier) {
        this.ruleForm.categoryDtos = val.categoryDtos.map((v) => v.category)
        // this.$nextTick(() => {
          this.ruleForm.biztypeDtos = val.biztypeDtos.map((v) => v.businessType)
          this.$nextTick(() => {
            this.ruleForm.serviceItemDtos = val.serviceItemDtos.map(
              (v) => v.serviceCode
            )
          })
        // })
        this.rules.shortEname.required = false
        this.rules.shortName.required = false
        this.rules.setupDate.required = false
       this.rules.industryArr.required = false
      } else {
        if (this.ruleForm.backupInfo && this.ruleForm.backupInfo.isRecycle) {
          this.isRecycle = this.ruleForm.backupInfo.isRecycle
        }
        this.ruleForm.customerRoles =
          val.roles && val.roles.map((v) => v.roleType)
        if (!["le", "other", "soe"].includes(this.ruleForm.entType)) {
          this.ruleForm.entType = ""
        }
        const bdsList = val.bds
        const curMode = bdsList&&bdsList.find(item =>item.bdServiceMode !=='')
        this.ruleForm.bdServiceMode = curMode?curMode.bdServiceMode:''
        // 新建的客户被拒绝后，详情页可以修改客户类型
        // TODO 暂放开修改客户类型和新旧模式
        // let { status, verifyStatus } = val
        // this.formDatas.forEach((item) => {
        //   if (item.prop == 'custClass') {
        //     item.disabled = status == 'create' && verifyStatus == 'refuse' ? false : true
        //   }
        //   if (item.prop == 'serviceMode') {
        //     item.disabled = status == 'create' && verifyStatus == 'refuse' ? false : true
        //   }
        // })
      }
      // this.CityArr.splice(0, 1000, ...JSON.parse(JSON.stringify(this.CityArr)))
      this.$nextTick(() => {
        if (this.ruleForm.province) {
          this.ruleForm.indexAddr = [
            this.ruleForm.province,
            this.ruleForm.city,
            this.ruleForm.district
          ]
          if(!this.ruleForm.district){
            this.ruleForm.indexAddr = [
              this.ruleForm.province,
              this.ruleForm.city,
            ]
          }
        } else {
          this.ruleForm.indexAddr = []
        }
      })
    },
    'ruleForm.name'(val){
       let shortEname = this.formDatas.find((v) => v.prop === "shortEname")
       let shortName = this.formDatas.find((v) => v.prop === "shortName")
      if(/[\u4E00-\u9FA5]/g.test(val)){
        this.rules.shortName.required = true
        shortEname.disabled = true
        shortName.placeholder = '请输入城市+名称关键字'
        shortEname.placeholder = '请输入英文简称'
      }else{
        shortEname.disabled = false
        this.rules.shortName.required = false
        shortName.placeholder = '请输入中文简称'
        shortEname.placeholder = '请输入名称关键字或首字母组合'
      }
    },
    'ruleForm.shortName':{
       handler(val,old) {
        if(/[\u4E00-\u9FA5]/g.test(this.ruleForm.name)){
        //中文
          if((val !== old) && old){
            CUSTOMER.getEname({name:val
            }).then((res) => {
              this.ruleForm.shortEname = res.data
            })
          }
        }
       }
    },
    // 监听可支持业务，处理服务项类型
    "ruleForm.biztypeDtos"(val, oldVal) {
      const origin = this.ruleForm.serviceItemDtos
      const arr = []
      try {
        this.SLIST.splice(
          0,
          1000,
          ...this.SLIST.map((v) => ({ ...v, show: false }))
        )
        // 遍历business已取值，找到服务项内parent值在val内的元素，且未出现过（去重）的元素设置为可见
        const obj = {}
        val.forEach((k) => {
          this.SLIST.forEach((item) => {
            if (k == item.parent && !obj[item.value] && item.label) {
              obj[item.value] = true
              item.show = true
              if (origin.indexOf(item.value) > -1) {
                arr.push(item.value)
              }
            }
          })
        })
      } catch (error) {
        console.log(error)
      }
      // if (oldVal.length > val.length) {
      origin.splice(0, 100, ...arr)
      // }
    },
    // 监听国别，判断uscc， taxId是否必填
    "ruleForm.country": {
      handler(val,old) {
        if (!val) return
        const required = ['中国', '中国大陆', "中国香港", "中国澳门", "香港", "澳门"].includes(val)
        const ChinaRequired = val === "中国"
        if (ChinaRequired) {
          this.CityArr.splice(0, 1000, ...this.dictMap.domesticCity)
        } else {
          this.CityArr.splice(0, 1000, ...this.dictMap.foreignCity)
        }
        if(old && old!==val && (val==='中国' ||old==='中国')){
          this.ruleForm.indexAddr = []
          this.ruleForm.province = ''
          this.ruleForm.city = ''
          this.ruleForm.district = ''
        }
        // this.rules.uscc.required =
        //   this.rules.taxId.required =
        this.rules.indexAddr.required = required
        if ((val === "中国") || (["中国香港", "中国台湾", "中国澳门", "香港", "台湾", "澳门"].includes(val)
         && (// this.ruleForm.customerRoles.includes('potential')||
         this.ruleForm.customerRoles.includes('client')))) {
          this.rules.uscc.required = true
          this.rules.taxId.required = true
        } else {
          this.rules.uscc.required = false
          this.rules.taxId.required = false
        }
       let pp = this.ruleForm.customerRoles.includes('potential') 
       let cc = this.ruleForm.customerRoles.includes('client') 
        if(this.ruleForm.customerRoles.includes('settlement') && !required && !(pp||cc)){
          //国外的结算单位
          this.rules.scale.required = false
          this.rules.setupDate.required = false
          // this.rules.entType.required = false
          this.rules.industryArr.required = false
        }else{
          this.rules.scale.required = true
          this.rules.setupDate.required = true
        }
        // 显示海外同行特有信息
        this.$emit('update:isForeignPeer', !['中国', '中国大陆', "中国香港", "中国澳门", "香港", "澳门"].includes(val) && ['peer'].includes(this.ruleForm.custClass))
        this.$nextTick(() => {
          this.ruleForm.indexAddr = this.ruleForm.indexAddr && [
            ...this.ruleForm.indexAddr,
          ]
          let find = this.formDatas.find((v) => v.prop === "country")
          let list = find ? find.list : []
          if (list.length) {
            let findCode = list.find((v) => v.value === val)
            let code = findCode ? findCode.countryCode : ""
            if (code) {
              this.ruleForm.countryCode = code
            } else {
              find.remoteMethod(this.ruleForm.countryCode, find)
            }
          }
        })
        // })
      },
      immediate: true,
    },
    // 监听客户类别，判断潜在客户、委托客户、收发通
    "ruleForm.customerRoles"(val,old) {
      console.log('isObd',this.isObd)
      console.log('val',val)
      if (!val) return
      this.$nextTick(() => {
        let index = this.ROLELIST.map((item) => item.value).indexOf("potential")
        let cindex = this.ROLELIST.map((item) => item.value).indexOf("client")
        let hasPo =(this.detailBaseInfo.roles || []).some(item => ['potential'].includes(item.roleType)) 
        this.ROLELIST.forEach((v) => {
          if (v.value === "client") {
            this.$set(v, "disabled", true)
          }
          if (v.value === "potential" && (hasPo || this.isObd)) {
            this.$set(v, "disabled", true)
          }
        })

        if (this.isPotentialOrigin) {
          if (!val.length) {
            this.$set(this.ROLELIST[index], "disabled", false)
          }
        } else {
          if (this.isClientOrigin) {
            if (val.includes("potential"))
              val.splice(val.indexOf("potential"), 1)
          }else{

            // if(val.includes("potential")&& this.isSelf){
            //   if(val[val.length-1]=='potential' && (old.length>0&&!old.includes("potential"))){
            //    this.dialogBdServiceMode.show = true;
            //   }
            // }
          }
          
        }
        // 切换企业类别时，判断社信统一代码和纳税识别号是否必填
        // 委托人/潜在客户+港澳台，必填
        // 国内，必填
        // 其它情况不必填
        if ((this.ruleForm.country === "中国") || (["中国香港", "中国台湾", "中国澳门", "香港", "台湾", "澳门"].includes(this.ruleForm.country) 
        && (val.includes('client')
        // ||val.includes('potential')
        ))) {
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
          this.rules.entType.required = false
          this.rules.industryArr.required = false
        }else{
          this.rules.scale.required = true
          this.rules.setupDate.required = true
        }
        this.$emit("update:isClient", val.includes("client"))
        this.$emit("update:isPotential", val.includes("potential"))
        if(val.includes('potential')|| val.includes('client')){
          this.rules.marketShare.required = true
          this.rules.companyShare.required = true
        }else{
          this.rules.marketShare.required = false
          this.rules.companyShare.required = false
        }
      })
    },
    // 原始状态为潜在客户，则需手动给选项添加潜在客户选项
    isPotentialOrigin: {
      handler(val) {
        if (val) {
          this.ROLELIST.splice(
            0,
            100,
            // { label: '潜在客户', value: 'potential' },
            ...JSON.parse(JSON.stringify(this.dictMap.customerRole))
          )
        } else {
          this.ROLELIST.splice(
            0,
            100,
            ...JSON.parse(JSON.stringify(this.dictMap.customerRole))
          )
        }
      },
      immediate: true,
    },
    "custClassType"(val) {
      if (!val) {
        return
      }
      if(val === 'foreign_peer' && !this.isSupplier){
          this.rules.registerAddr.required = false
      }else{
          this.rules.registerAddr.required = true
      }
      if (val === "domestic_cust") { //直接客户
        this.$set(this.rules, "entType", { ...this.defaultRules })
      } else { //货代客户
        this.$set(this.rules, "entType", {})
      }
      if (val.includes('cust')) {
        this.rules.industryArr.required = true
      } else {
        this.rules.industryArr.required = false
      }
      // domestic_cust: "国内直客"// domestic_peer: "国内同行"// foreign_cust: "国外直客"// foreign_peer: "国外同行"
      let foreignList = [
        {
          type: "select",
          label: "公司规模",
          prop: "scale",
          list: this.dictMap["orgScale"].filter((item) =>
            item.value.includes("fp")
          ),
        },
        {
          label: "目的港服务能力",
          type: "select",
          prop: "podServiceAbility",
          propInDict: "podServiceAbility",
        },
        {
          type: "select",
          label: "市场占有率",
          prop: "marketShare",
          propInDict: "marketShare",
        },
        {
          type: "select",
          label: "我司占有率",
          prop: "companyShare",
          propInDict: "companyShare",
        },
      ]
      let domesticPeerList = [
        {
          type: "select",
          label: "公司规模",
          prop: "scale",
          list: this.dictMap["orgScale"].filter((item) =>
            item.value.includes("dp") || item.value.includes("dc"),
          ),
        },
      ]
      let listObj = {
        foreign_peer: foreignList,
        foreign_cust: foreignList,
        domestic_peer: domesticPeerList,
        domestic_cust: domesticPeerList,
      }
      let arr = listObj[val] || []
        arr.forEach((item) => {
          if (!this.ruleForm[item.prop]) {
            this.$set(this.ruleForm, item.prop, "")
          }
        })
        let index = this.formDatas.findIndex(
          (item) => item.prop === "socialStaffNum"
        )
        let last = this.formDatas.findIndex((item) => item.prop === "firstTime")
        let delProp = this.formDatas
          .slice(index + 1, last)
          .map((item) => item.prop)
        if (delProp.length) {
          delProp.forEach((ele) => {
            this.ruleForm[ele] = ""
          })
        }
        let len = last - index - 1 || 0
        this.formDatas.splice(index + 1, len, ...arr)
        // 历史数据scale（公司规模是错误的置空）
        if (this.ruleForm.scale) {
          let find = this.formDatas.find(item => item.prop === 'scale')?.list?.some(ele => ele.value === this.ruleForm.scale)
          if (!find) {
            this.$set(this.ruleForm, 'scale', '')
          }
        }
    },
    "ruleForm.custClass" (val) {
      this.$emit('update:isForeignPeer', !['中国', '中国大陆', "中国香港", "中国澳门", "香港", "澳门"].includes(this.ruleForm.country) && ['peer'].includes(val))
    }
  },
  created() {
    this.getIndustry()
    const crmCategory = this.dictMap.crmCategory.map((item) =>
      Object.assign({}, item)
    )
    const crmBusiness = this.dictMap.crmBusiness.map((item) =>
      Object.assign({}, item)
    )
    this.CLIST.splice(0, 1000, ...crmCategory)
    this.BLIST.splice(0, 1000, ...crmBusiness)
    this.SLIST.splice(
      0,
      1000,
      ...this.dictMap.crmService.map((v) => ({ ...v, show: false }))
    )
      // val.includes("client") && val.splice(val.indexOf("client"), 1)
      // this.$set(this.ROLELIST[index], "disabled", true)
  },
  methods: {
    getBaseInfo () {
      this.$emit('initData', this.$route.query.custid)
    },
    // closeBdmode() {
    //   this.dialogBdServiceMode.show = false
    //   // this.dialogBdServiceMode.form = {
    //   //   // bdServiceMode: '',
    //   // }
    // },
        //新旧模式请求
    // bdServiceModeClose(tag){
    //   if (!tag) {
    //     return this.closeBdmode()
    //   }
    //   this.ruleForm.bdServiceMode = this.dialogBdServiceMode.form.bdServiceMode
    //   this.closeBdmode()
    // },
    //基本信息保存
    saveBaseInfo(flag) {
      if(flag==='order'){
        this.$refs.form.$refs.form.validate(async (valid) => {
          if (!valid) {
            return  this.$msgErrClose('请将必填项填写完整再申请下单维护人！')
          }else{
            this.$emit('toBeOrderMatainerType')
          }
        })
      }else{   
      // if (!this.ruleForm.customerRoles.length) return this.$msgErrClose('企业类别不能为空！')
      this.$refs.form.$refs.form.validate(async (valid) => {
        const txt = /[a-zA-Z]/.test(this.ruleForm.shortName)
        const txt2 = /[\u4E00-\u9FA5\uF900-\uFA2D]/.test(this.ruleForm.shortEname)
        if (!valid) {
          this.$msgErrClose('请将必填项填写完整！')
          return this.$emit("updateSubmit", "no")
        }
        if(flag){
          if(!this.isSupplier){
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
            //中英文的名称都不允许前后有空格
            if(this.ruleForm.name.substr(0,1)===' '){
              return this.$msgErrClose('客户名称开头有空格！')
            }
            if(this.ruleForm.name.substr(this.ruleForm.name.length-1,1)===' '){
              return this.$msgErrClose('客户名称结尾有空格！')
            }
            if (this.ruleForm.uscc !== this.ruleForm.taxId) {
              return this.$msgErrClose('社信统一代码和纳税人识别号保持一致！')
            }
            if(!this.ruleForm.country.includes('中国')&&txt && this.ruleForm.shortName){
              this.$msgErrClose('中文简称禁止填写英文字母，可填写无')
              return  this.$emit("updateSubmit", "no")		       
            }		        
            if(txt2){
              this.$msgErrClose('英文简称禁止填写中文汉字')
              return  this.$emit("updateSubmit", "no")
            }
            //   if(!this.ruleForm.bdServiceMode&&this.isPotential){
            //   return this.dialogBdServiceMode.show = true;
            // }
          }
        }
        // 历史数据有国家没code
        if (!this.ruleForm.countryCode) {
          let list = this.formDatas.find(item => item.prop === 'country')?.list
          if (list) {
            let country = this.ruleForm.country
            let code = list.find(ele => ele.cname === country)?.countryCode
            if (code) {
              this.ruleForm.countryCode = code
            } else {
              this.ruleForm.country = ''
              this.ruleForm.countryCode = ''
              return this.$msgErrClose('国家(行政区)数据异常，请重新选择国家(行政区)!')
            }
          }
        }
        this.saveLocalData()
        if (this.isSupplier && this.custInfo.verifyStatus !== "refuse") {
          this.$emit("update:isEdit", true)
          return
        }
        if (flag === true) {
          this.$emit("updateSubmit", "edit")
          return
        }
        this.$emit("updateSubmit", "yes")
      })
      }
    },
    saveForPeerBeseInfo(){
        let foreignPeerInfo = this.$refs.foreignPeerDetail.foreignPeerInfo
        // 组织海外同行参数
        // 组织contract参数格式
        foreignPeerInfo.contract = [...foreignPeerInfo.prepaidContractList, ...foreignPeerInfo.collectContractList]
        if (foreignPeerInfo.contract.length) {
          foreignPeerInfo.contract.forEach(item => {
            item.aod = item.aodPortCode.length ? item.aodPortCode.join(',') : ''
            item.pod = item.podPortCode.length ? item.podPortCode.join(',') : ''
          })
        }
        //组织shippingInstruction参数格式
        let shipArr = ['preferredCarrierSea', 'preferredCarrierAir']
        shipArr.forEach(sKey => {
          foreignPeerInfo.shippingInstruction[sKey] = foreignPeerInfo.shippingInstruction[`${sKey}Arr`].length ? foreignPeerInfo.shippingInstruction[`${sKey}Arr`].join(',') : ''
        })
        let approvedCoLoaderList = this.$refs.foreignPeerDetail.approvedCoLoaderList
        let approvedCoLoaderListArr = []
        if (approvedCoLoaderList && approvedCoLoaderList.length) {
          approvedCoLoaderList.forEach(aItem => {
            approvedCoLoaderListArr.push(aItem.value)
          })
        }
        foreignPeerInfo.shippingInstruction.approvedCoLoader = approvedCoLoaderListArr.length ? approvedCoLoaderListArr.join(',') : ''
        // 校验必填项
        let validContract = false //校验To be shown as Consignee on MBL信息
        if (foreignPeerInfo.contract.length) { 
          let isValid = foreignPeerInfo.contract.every((cItem, cIndex)  => {
            if (cItem.flag === "prepaid") {
              if (!cItem.countryCode) {
                this.$msgErrClose(`Prepaid contract(rate)${cIndex + 1}的Country不能为空！`)
                return false
              }
              if (!cItem.companyName) {
                this.$msgErrClose(`Prepaid contract(rate)${cIndex + 1}的Country name不能为空！`)
                return false
              }
              if (!cItem.cnpjNumber) {
                this.$msgErrClose(`Prepaid contract(rate)${cIndex + 1}的CNPJ number/RUT number/TAX ID number/other ID number不能为空！`)
                return false
              }
              if (!cItem.aod && !cItem.pod) {
                this.$msgErrClose(`Prepaid contract(rate)${cIndex + 1}的POD和AOD必须填写一个！`)
                return false
              }
              if (!cItem.address) {
                this.$msgErrClose(`Prepaid contract(rate)${cIndex + 1}的Address不能为空！`)
                return false
              }
              return true
            } else {
              return true
            }
          })
          validContract = isValid
        } else {
          this.$msgErrClose(`Prepaid contract(rate)不能为空！`)
          validContract = false
        }
        if (!validContract) return
        // 校验Agent Background
        let validIntroduced = false
        if (foreignPeerInfo.introduced) {
          if (foreignPeerInfo.introduced.isLsbd === 'N' && foreignPeerInfo.introduced.isLsAgent === 'N' && foreignPeerInfo.introduced.isOthers === 'N') {
            this.$msgErrClose(`Agent Background的LS BD、LS Agent、Others必须勾选一个！`)
            validIntroduced = false
          } else if (foreignPeerInfo.introduced.isLsbd === 'Y' && foreignPeerInfo.introduced.namePerson === '') {
            this.$msgErrClose(`Agent Background的Name of Peron不能为空！`)
            validIntroduced = false
          } else if (foreignPeerInfo.introduced.isLsAgent === 'Y' && foreignPeerInfo.introduced.nameAgent === '') {
            this.$msgErrClose(`Agent Background的Name of Agent不能为空！`)
            validIntroduced = false
          } else if (foreignPeerInfo.introduced.isOthers === 'Y' && foreignPeerInfo.introduced.specifySource === '') {
            this.$msgErrClose(`Agent Background的Pls specify the source不能为空！`)
            validIntroduced = false
          } else {
            validIntroduced = true
          }
        }
        if (!validIntroduced) return
        if (validContract && validIntroduced) {
          foreignPeerInfo.custid = this.$route.query.custid
          this.$emit("updateOverSubmit", foreignPeerInfo)
        } else {
          return
        }
    },
    saveLocalData() {
      const data = this.ruleForm
      if (this.isSupplier) {
        data._biztypeDtos = data.biztypeDtos.map((businessType) => ({
          businessType,
        }))
        data._categoryDtos = data.categoryDtos.map((category) => ({ category }))
        data._serviceItemDtos = data.serviceItemDtos.map((serviceCode) => ({
          serviceCode,
        }))
      } else if (!this.isPotential) {
        data._roles = data.customerRoles.map((roleType) => ({ roleType }))
      }
      if (data.indexAddr && data.indexAddr.length) {
        data.province = data.indexAddr[0]
        data.city = data.indexAddr[1]
        data.district = data.indexAddr[2]
      }else{
        data.province = ''
        data.city = ''
        data.district = ''
      }
      if (Array.isArray(data.industry)) {
        let len = data.industry.length
        data.industry = data.industry[len -1]
      }
      this.$store.commit(
        `crm/${this.isSupplier ? "supplier/" : ""}setDetailEditInfo`,
        data
      )
    },
    saveRemark() {
      CUSTOMER.updateOrgRemark({
        orgid: this.ruleForm.orgid,
        remark: this.ruleForm.remark,
      }).then((res) => {
        this.$msgSucClose("保存成功!")
        this.refreshView("CustomerList", "from")
        this.refreshView("SupplierList", "from")
      })
    },
    verifyApply(){
      this.$emit('verifyBtn',false)
    },
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
  },
  deactivated() {
    // 不可编辑状态下直接返回，不进行基本信息自动保存
    if (this.isDisabled) return
    // 供应商非拒绝状态下直接返回，不进行基本信息自动保存，因为有保存按钮
    if (this.custInfo.verifyStatus !== "refuse" && this.isSupplier) return
    this.saveBaseInfo()
  },
  activated() {
    this.$nextTick(() => {
      let taxNo = sessionStorage.getItem('taxNo')
      if (taxNo) {
        this.ruleForm.uscc = taxNo
        this.ruleForm.taxId = taxNo
      }
      // this.getBaseInfo()
    })
    // this.saveBaseInfo()
  },
}
</script>
<style lang="scss" scoped>
.base-tab ::v-deep .crm-form {
  margin: 16px 8px;
}
.base-tab {
  position: relative;
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
  margin-top: 10px;
}
// .base-tab .save-btn {
//   position: absolute;
//   z-index: 1000;
//   top: 0;
//   right: 8px;
// }
.top-box {
  margin: 0 8px 0;
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  .save-btn {
    margin-left: 10px;
  }
  .save-fp-btn{
    margin-top:7px;
  }
  .tips {
    position: absolute;
    color: #999;
    right: 60px;
  }
}
.crm-form {
  margin-top: 0 !important;
}
.crm-checkbox {
  margin: 0 20px 10px;
}
.crm-baseinfo {
  margin-bottom: 10px;
}
</style>