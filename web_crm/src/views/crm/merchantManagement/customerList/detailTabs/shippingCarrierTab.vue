<template>
  <div class="base-tab">
    <div class="top-box">
      <!-- <el-button
        @click="saveBaseInfo(true)"
        class="save-btn"
        size="mini"
        type="primary"
        v-show="
          custInfo.verifyStatus != 'submit' &&
          custInfo.verifyStatus != 'refuse' &&
          !reviewInfo &&
          isSelf
        "
        >保存</el-button
      > -->
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
   <!-- </template> -->
  </div>
</template>
<script>
import { shippingCarrierTable } from "@/views/crm/data"
import { mapState, mapGetters } from "vuex"
import { routerMixin } from "@/views/finance/mixins/routerMixin"
import InfoList from "@/views/crm/components/infoList"
import CrmForm from "@/views/crm/components/crmForm"
import CUSTOMER from "@/api/crm/customer"
import CrmDialog from '@/views/crm/components/crmDialog'
export default {
  name: "ASC1",
  label: "基本信息",
  customerHide: true,
  shipperShow: true,
  mixins: [routerMixin],
  props: [
    "custid",
    "supplierBaseInfo",
    "isShipC",
    "reviewInfo",
    "isEdit",
    "isClient",
    "isPotential",
    "isPotentialOrigin",
    "isClientOrigin",
    "isManager",
    "isSelf",
  ],
  inject: ["defaultRules", "foreignCity", "domesticCity"],
  components: { InfoList, CrmForm ,CrmDialog},
  data() {
    // 此处声明的变量，在各处的此组件均共享  ,修改为不能共享，共享会影响其它页面的显示
    // customer role
    const ROLELIST = []
    const CityArr = []
    const ruleForm = { custid: "", orgid: "" }
    const rules = !this.isShipC
      ? {
          custClass: { ...this.defaultRules },
          serviceMode: { ...this.defaultRules },
          customerRoles: { ...this.defaultRules, message: "必选" },
        }
      : {
          categoryDtos: { ...this.defaultRules, message: "必选" },
          biztypeDtos: { ...this.defaultRules, message: "必选" },
        }
     const arr = [
      ...shippingCarrierTable.map((item) => ({
        ...item,
        options: item.prop == "indexAddr" ? CityArr : undefined,
      })),
    ]
    console.log('arr',arr)
    // const ruleArr = [
    //   "custClass",
    //   "serviceMode",
    //   "name",
    //   "uscc",
    //   "taxId",
    //   "country",
    //   "indexAddr",
    //   "registerAddr",
    //   "detailAddr",
    //   "scale",
    //   "podServiceAbility",
    //   "marketShare",
    //   "companyShare",
    //   // 新增三个必填项(基本信息修改)
    //   'shortEname',
    //   'shortName',
    //   'setupDate',
    //   'industry'
    // ]
    // ruleArr.forEach((v) => (rules[v] = { ...this.defaultRules }))
    // if (
    //   this.$route.name == "CustomerDetail" ||
    //   this.$route.name == "SupplierDetail"
    // ) {
    //   arr[arr.length - 1] = {
    //     ...arr[arr.length - 1],
    //     btnCfg: {
    //       hidden: false,
    //       text: "保存备注",
    //       callback: () => {
    //         this.$confirmWarn("确认保存修改后的备注？", () => this.saveRemark())
    //       },
    //     },
    //   }
    // }
    return {
      ruleForm,
      rules,
      formDatas: arr,
      CityArr,
      isReview: [
        "shippingCarrierDetail",
      ].includes(this.$route.name),
      ROLELIST,
      isRecycle:'',

    }
  },
  computed: {
    ...mapGetters(["dictMap", "dictMapObj"]),
    ...mapState('user', ['userId', 'deptCode']),
    // 基本信息
    custInfo() {
      if (this.reviewInfo) {
        // console.log("supplierReviewDetailPass")
        return this.reviewInfo
      }
      const info = this.detailBaseInfo
      const notCreateSubmit =
        info.verifyStatus == "submit" && info.status !== "create"
      // console.log(info.verifyStatus == 'submit' ? { ...info.updateInfo, verifyStatus: 'submit' } : info)
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
      return this.isShipC ? this.s_detailEditInfo : this.c_detailEditInfo
    },
    detailBaseInfo() {
      return this.isShipC ? this.s_detailBaseInfo : this.c_detailBaseInfo
    },
    isDisabled() {
      if(this.isRecycle==='yes'){
        return (!this.isSelf)
      }else{
        return (
          // (this.isEdit && !this.isPotential) ||
          this.custInfo.verifyStatus == "submit" ||
          !!this.reviewInfo ||
          !this.isSelf
        )
      }

    },
  },
  watch: {
    // 监听基本信息，对有关联的项进行特殊处理
    custInfo(val) {

      console.log('val',val)
      console.log('detailBaseInfo',this.detailBaseInfo)

      let data = Object.assign({}, val.backupInfo, val)
      if (!this.reviewInfo) this.$refs.form.$refs.form.resetFields()
      this.ruleForm = Object.assign(
        {},
        this.ruleForm,
        JSON.parse(JSON.stringify(data))
      )
      // if (this.isShipC) {
      //   // this.ruleForm.categoryDtos = val.categoryDtos.map((v) => v.category)
      //   // this.$nextTick(() => {
      //     // this.ruleForm.biztypeDtos = val.biztypeDtos.map((v) => v.businessType)
      //     // this.$nextTick(() => {
      //     //   this.ruleForm.serviceItemDtos = val.serviceItemDtos.map(
      //     //     (v) => v.serviceCode
      //     //   )
      //     // })
      //   // })
      //   this.rules.shortEname.required = false
      //   this.rules.shortName.required = false
      //   this.rules.setupDate.required = false
      //  this.rules.industry.required = false
      // } else {
      //   this.isRecycle = this.ruleForm.backupInfo.isRecycle
      //   this.ruleForm.customerRoles =
      //     val.roles && val.roles.map((v) => v.roleType)
      //   if (!["le", "other", "soe"].includes(this.ruleForm.entType)) {
      //     this.ruleForm.entType = ""
      //   }
      //   const bdsList = val.bds
      //   const curMode = bdsList&&bdsList.find(item =>item.maintainerType =='potential')
      //   this.ruleForm.bdServiceMode = curMode?curMode.bdServiceMode:''
      //   // 新建的客户被拒绝后，详情页可以修改客户类型
      //   // TODO 暂放开修改客户类型和新旧模式
      //   // let { status, verifyStatus } = val
      //   // this.formDatas.forEach((item) => {
      //   //   if (item.prop == 'custClass') {
      //   //     item.disabled = status == 'create' && verifyStatus == 'refuse' ? false : true
      //   //   }
      //   //   if (item.prop == 'serviceMode') {
      //   //     item.disabled = status == 'create' && verifyStatus == 'refuse' ? false : true
      //   //   }
      //   // })
      // }
      // this.CityArr.splice(0, 1000, ...JSON.parse(JSON.stringify(this.CityArr)))
      // this.$nextTick(() => {
      //   if (this.ruleForm.province) {
      //     this.ruleForm.indexAddr = [
      //       this.ruleForm.province,
      //       this.ruleForm.city,
      //       this.ruleForm.district
      //     ]
      //   } else {
      //     this.ruleForm.indexAddr = []
      //   }
      // })
    },
    // 监听国别，判断uscc， taxId是否必填
    "ruleForm.country": {
      handler(val) {
        if (!val) return
        const required = ['中国', '中国大陆', "中国香港", "中国澳门", "香港", "澳门"].includes(val)
        if (required) {
          this.CityArr.splice(0, 1000, ...this.dictMap.domesticCity)
        } else {
          this.CityArr.splice(0, 1000, ...this.dictMap.foreignCity)
        }
        // this.rules.uscc.required =
        //   this.rules.taxId.required =
        this.rules.indexAddr.required = required
        if ((val === "中国") || (["中国香港", "中国台湾", "中国澳门", "香港", "台湾", "澳门"].includes(val) && this.ruleForm.customerRoles.includes('client'))) {
          this.rules.uscc.required = true
          this.rules.taxId.required = true
        } else {
          this.rules.uscc.required = false
          this.rules.taxId.required = false
        }
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
      if (!val) return
      this.$nextTick(() => {
        let index = this.ROLELIST.map((item) => item.value).indexOf("potential")
        let cindex = this.ROLELIST.map((item) => item.value).indexOf("client")
        if (this.isPotentialOrigin) {
          if (!val.length) {
            this.$set(this.ROLELIST[index], "disabled", false)
          }
          if (val.includes("client")) {
            val.includes("potential") && val.splice(val.indexOf("potential"), 1)
            this.$set(this.ROLELIST[index], "disabled", true)
          } else {
            this.$set(this.ROLELIST[index], "disabled", false)
            this.$set(this.ROLELIST[cindex], "disabled", false)
          }
        } else {
          this.ROLELIST.forEach((v) => {
            if (v.value === "client") {
              this.$set(v, "disabled", true)
            }
            // ...v,
            // disabled: (val && index === idx1) || (v.value === 'client' && true && val) || (!val && index === idx2 && !this.isPotentialOrigin)
          })
          if (this.isClientOrigin) {
            if (val.includes("potential"))
              val.splice(val.indexOf("potential"), 1)
          }else{
            if(val.includes("potential")&& this.isSelf){
              if(val[val.length-1]=='potential' && !old.includes("potential")){
            //    this.dialogBdServiceMode.show = true;
              }
            }
          }
          
        }
        // 切换企业类别时，判断社信统一代码和纳税识别号是否必填
        // 委托人+港澳台，必填
        // 国内，必填
        // 其它情况不必填
        if ((this.ruleForm.country === "中国") || (["中国香港", "中国台湾", "中国澳门", "香港", "台湾", "澳门"].includes(this.ruleForm.country) && val.includes('client'))) {
          this.rules.uscc.required = true
          this.rules.taxId.required = true
        } else {
          this.rules.uscc.required = false
          this.rules.taxId.required = false
        }
        this.$emit("update:isClient", val.includes("client"))
        this.$emit("update:isPotential", val.includes("potential"))
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
    // 原始状态为委托客户，则委托选项为禁用
    isClientOrigin: {
      handler(val) {
        // 先执行潜在客户监听，获取字典数据，再执行此监听，判断是否禁用委托客户行
        this.$nextTick(() => {
          let types = this.ROLELIST.map((item) => item.value)
          let idx1 = types.indexOf("potential")
          let idx2 = types.indexOf("client")
          this.ROLELIST.map((v) =>
            console.log(v.value === "client" && true && val)
          )
          const arr = this.ROLELIST.map((v, index) => ({
            ...v,
            disabled:
              (val && index === idx1) ||
              (v.value === "client" && true && val) ||
              (!val && index === idx2 && !this.isPotentialOrigin),
          }))
          this.ROLELIST.splice(0, 100, ...arr)
        })
      },
      immediate: true,
    },
  },
  created() {
    console.log('isDisabled为true不可编辑',this.isDisabled)
    const crmCategory = this.dictMap.crmCategory.map((item) =>
      Object.assign({}, item)
    )
    const crmBusiness = this.dictMap.crmBusiness.map((item) =>
      Object.assign({}, item)
    )
  },
  methods: {
    getBaseInfo () {
      this.$emit('initData', this.$route.query.custid)
    },
    // saveBaseInfo(flag) {
    //   // if (!this.ruleForm.customerRoles.length) return this.$msgErrClose('企业类别不能为空！')
    //   this.$refs.form.$refs.form.validate(async (valid) => {
    //           console.log('valid',valid)
    //     const txt = /[a-zA-Z]/.test(this.ruleForm.shortName)
    //     const txt2 = /[\u4E00-\u9FA5\uF900-\uFA2D]/.test(this.ruleForm.shortEname)
    //     if (!valid) {
    //       return this.$emit("updateSubmit", "no")
    //     }
    //     // 历史数据有国家没code
    //     if (!this.ruleForm.countryCode) {
    //       let list = this.formDatas.find(item => item.prop === 'country')?.list
    //       if (list) {
    //         let country = this.ruleForm.country
    //         let code = list.find(ele => ele.cname === country)?.countryCode
    //         if (code) {
    //           this.ruleForm.countryCode = code
    //         } else {
    //           this.ruleForm.country = ''
    //           this.ruleForm.countryCode = ''
    //           return this.$msgErrClose('国家(行政区)数据异常，请重新选择国家(行政区)!')
    //         }
    //       }
        
    //     }
    //     this.$emit("updateSubmit", "yes")
    //   })
    // },

  },
  deactivated() {
    console.log('this.isDisabled',this.isDisabled)
    // 不可编辑状态下直接返回，不进行基本信息自动保存
    if (this.isDisabled) return
    // 供应商非拒绝状态下直接返回，不进行基本信息自动保存，因为有保存按钮
    if (this.custInfo.verifyStatus !== "refuse" && this.isShipC) return
    // this.saveBaseInfo()
  },
  activated() {
    this.$nextTick(() => {
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