<template>
  <div class="info-page">
    <div class="info-title">
      <span :class="{ isBad: false }">基本信息</span>
      <slot></slot>
    </div>
    <ul :class="{ bottomBorder: bottomB }" class="base-info-list">
      <template v-for="(item,index) in baseInfoArr">
        <template v-if="item.key === 'registerAddr' && !isSupplier">
        <li :key="index">
          首次合作时间：{{ updateInfo.firstTime || "--" }}
        </li>
        <li :key="index + 1">
          最近合作时间：{{ updateInfo.nearlyTime || "--" }}
        </li>
        </template>
        <li
          :class="{ 'block-li': item.block, red: verifyBasic[item.key] }"
          :key="item.key"
          v-if="
            custInfo[item.key] === 0 ||
            custInfo[item.key] ||
            verifyBasic[item.key] === 0 ||
            verifyBasic[item.key]
          "
        >
          <!-- <li :key="item.key" :class="{'block-li':item.block}"> -->
          <template v-if="verifyBasic[item.key] || verifyBasic[item.key] === 0">
            <el-tooltip
              :content="beforeBasic[item.key] + ''"
              effect="dark"
              placement="top-start"
            >
            <span>{{ item.label }}：{{ verifyBasic[item.key] }}</span>
            </el-tooltip>
          </template>
          <template v-else>{{ item.label }}：{{ custInfo[item.key] }}</template>
        </li>
      </template>
    </ul>
  </div>
</template>
<script>
import { formatIndustry } from "@/utils/crm"
import { mapGetters } from 'vuex'
function diffData(obj) {
  const result = {}
  Object.keys(obj).forEach((key) => {
    if (
      ["custClass", "_custClass", "serviceMode", "_serviceMode"].indexOf(key) >
      -1
    ) {
      if (!obj[key]) {
        obj[key] = this.custInfo[key]
        return
      }
    }
    if (this.custInfo[key] == obj[key]) return
    // 客户类型、新旧模式暂时更改为可修改
    // if (['custClass', '_custClass', 'serviceMode', '_serviceMode'].indexOf(key) > -1) return
    result[key] = obj[key] || "　"
  })
  return result
}
const info = [
  { label: "中文简称", key: "shortName" },
  { label: "英文名", key: "ename" },
  { label: "英文简称", key: "shortEname" },
  { label: "国家", key: "country" },
  { label: "省/市/区", key: "indexAddr" },
  { label: "所属行业", key: "industryArr" },
  // { label: "所属行业", key: "_industry" },
  { label: "客户性质", key: "_entType" },
  { label: "法人", key: "legalPerson" },
  { label: "社信统一代码", key: "uscc" },
  { label: "纳税人识别号", key: "taxId" },
  { label: "成立日期", key: "setupDate" },
  { label: "营业执照到期日", key: "usccExpDate" },
  { label: "注册资金", key: "regCapital" },
  { label: "协会会员", key: "association" },
  { label: "参保人数", key: "socialStaffNum" },
  { label: "注册地址", key: "registerAddr", block: true },
  { label: "详细地址", key: "detailAddr", block: true },
  { label: "备注", key: "remark", block: true },
]
export default {
  name: "infoList",
  props: ["updateInfo", "custInfo", "bottomB", "isSupplier","differentField","beforeField"],
  computed: {
    ...mapGetters(["dictMapObj"]),
    verifyBasic() {
      if(!this.isSupplier){
        Object.keys(this.differentField).forEach((key) => {		
          if(key === 'roles'||key === 'scale'||key === 'entType'){
            this.differentField['_'+key] = this.custInfo['_'+key]
          }
          else if(key === 'custClass'|| key === 'podServiceAbility'||key === 'marketShare'||
          key === 'companyShare'||key === 'association'){
            this.differentField[key] = this.custInfo['_'+key]
          }	else if(key === 'industry'){//所属行业的转化
          this.differentField.industryArr = formatIndustry(this.differentField.industry)
          }else if(key === 'district'||key === 'province'||key === 'province'){ //省市区的标红
            this.differentField.indexAddr = this.custInfo.province && `${this.custInfo.province}/${this.custInfo.city}/${this.custInfo.district}`
          }
        })
        return this.differentField
      }else{
         return diffData.call(this, this.updateInfo)
      }
    },
    beforeBasic(){
      const {
        customerClassNew = {},
        orgScale,
        associationMembers,
        entType: entTypeDict,
        marketShare: marketShareDict,
        podServiceAbility: podServiceAbilityDict,
        companyShare: companyShareDict,
      } = this.dictMapObj
      if(!this.isSupplier){
        Object.keys(this.beforeField).forEach((key) => {		
          if(key === 'entType'){
            this.beforeField['_'+key] = entTypeDict[this.beforeField[key]] 
          }else if(key === 'scale'){
            this.beforeField['_'+key] =  orgScale[this.beforeField[key]]
          }else if(key === 'custClass'){
            this.beforeField['_'+key] =customerClassNew[this.beforeField[key]]
          }	 else if( key === 'podServiceAbility'){
            this.beforeField['_'+key] = podServiceAbilityDict[this.beforeField[key]]
          }else if(key === 'marketShare'){
            this.beforeField['_'+key] = marketShareDict[this.beforeField[key]]
          }else if(key === 'companyShare'){
            this.beforeField['_'+key] = companyShareDict[this.beforeField[key]]
          }else if(key === 'association'){
            this.beforeField[key] = associationMembers[this.beforeField[key]]
          }else if(key === 'industry'){//所属行业的转化
          this.beforeField.industryArr = formatIndustry(this.beforeField.industry)
          }else if(key === 'district'||key === 'province'||key === 'province'){ //省市区的标红
            this.beforeField.indexAddr = this.custInfo.province && `${this.beforeField.province||this.custInfo.province}/
            ${this.beforeField.city||this.custInfo.city}/
            ${this.beforeField.district||this.custInfo.district}`
          }
          if(this.beforeField[key] === null ||this.beforeField[key] === '' ){
            this.beforeField[key] = '空'
          }
        })
        return this.beforeField
      }else{
        return this.custInfo
      }
    },
    baseInfoArr() {
      let custClass = this.updateInfo.custClass || this.custInfo.backupInfo.updateCustClass ||this.custInfo.backupInfo.custClass
      let arr = []
      if (!this.isSupplier) {
        arr = [
          { label: "客户名称", key: "name" },
          { label: "企业类别", key: "_roles" }, // customerRole 类似下拉框，编辑需用原数据，所有添加_
          { label: "客户类型", key: "_custClass" }, // 'customerClass'
          // { label: '新旧模式', key: '_serviceMode' }, // 'serviceMode'
          ...info,
        ]
        // 判断国内还是国外同行直客
        let countryCode = this.updateInfo.countryCode || this.custInfo.countryCode
        let submitterCountryCode  = this.custInfo.orgVerifyDto.submitterCountryCode || 'CN'
        let isSameCountry = (countryCode === submitterCountryCode) || (submitterCountryCode === 'CN' && ['TW','HK','MO'].includes(countryCode))
        custClass = (isSameCountry ? 'domestic_' : 'foreign_') + custClass
        let index = arr.findIndex((item) => item.key === "socialStaffNum")
        if (custClass === "foreign_peer" || custClass === "foreign_cust") {
          if (!arr.find((item) => item.key === "_marketShare")) {
            arr.splice(
              index + 1,
              0,
              { label: "公司规模", key: "_scale" },
              { label: "目的港服务能力", key: "_podServiceAbility" },
              { label: "市场占有率", key: "_marketShare" },
              { label: "我司占有率", key: "_companyShare" }
            )
          }
        } else if (
          custClass === "domestic_peer" ||
          custClass === "domestic_cust"
        ) {
          if (!arr.find((item) => item.key === "_scale")) {
            arr.splice(index + 1, 0, { label: "公司规模", key: "_scale" })
          }
        }
      } else {
        arr = [
          { label: "供应商名称", key: "name" },
          { label: "供应商类型", key: "_categoryDtos" }, // customerRole 类似下拉框，编辑需用原数据，所有添加_
          { label: "可支持业务", key: "_biztypeDtos" }, // 'customerClass'
          { label: "服务项类型", key: "_serviceItemDtos" }, // 'customerClass'
          ...info,
        ]
         let index = arr.findIndex((item) => item.key === "regCapital")
         if (arr.find((item) => item.key === "regCapital")) {
            arr.splice(
              index + 1,
              0,
          { label: "结算单位简称", key: "settleShortName" }, // 'customerClass'
            )
          }
      }
      return arr
    },
  },
  data() {
    return {
      // baseInfoArr: [],
    }
  }
}
</script>
<style lang="scss" scoped>
.info-title > span.isBad::after {
  content: "（被执行人）";
  color: #cd4130;
}
.red {
  color: #cd4130;
}
// .base-info-list {
//   li {
//     display: inline-block;
//     line-height: 20px;
//     margin-bottom: 4px;
//     width: 320px;
//     font-size: 13px;
//     &.block-li {
//       width: 640px;
//       // display: block;
//       // width: 100%;
//     }
//   }
// }
.bottomBorder {
  position: relative;
  &:after {
    position: absolute;
    left: 0;
    bottom: -10px;
    content: "";
    width: 100%;
    height: 0;
    border-bottom: 1px solid #e6ebf5;
  }
}
</style>
