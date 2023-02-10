<template>
  <div class="finance-page" style="padding-bottom:20px">
    <div class="detail-title">
      <span>{{type}}公司对比</span>
      <OpBtnDialog
        backText="返回"
        :refuseHide="true"
        :custid="custid"
        :isValid="true"
        :closeLevel="2"
      />
    </div>
    <CrmCard :title="`原${type}公司`" style="margin-bottom:10px">
      <template v-if="isStruct">
        <Company :companyInfo="companyInfo.old" :isSubmit="true" :small="true"></Company>
      </template>
      <template v-else>
        <FinanceTable :option="tableOptionOld" />
      </template>
    </CrmCard>
    <CrmCard :title="`现${type}公司`">
      <template v-if="isStruct">
        <Company :companyInfo="companyInfo.new" :isSubmit="true" :small="true"></Company>
      </template>
      <template v-else>
        <FinanceTable :option="tableOptionNew" />
      </template>
    </CrmCard>
  </div>
</template>

<script>
import CrmCard from '@/views/crm/components/card'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import OpBtnDialog from './components/opBtnDialog'
import FinanceTable from '@/views/finance/components/financeTable/financeTable'
import Company from '@/views/crm/components/company'
export default {
  name: 'checkCompany',
  components: { CrmCard, OpBtnDialog, Company, FinanceTable },
  mixins: [mixin],
  provide() {
    return {
      isReview: true,
      relationCfg: {},
    }
  },
  inject: ['telRules', 'emailRules'],
  data() {
    return {
      isStruct: '',
      type: '',
      custid: '',
      tableOptionOld: {},
      tableOptionNew: {},
      companyInfo: { new: null, old: null },
    }
  },
  // activated(){
  //   console.log('!!!!!!!!!!!!!!!!!!!!!activated');
  // },
  created() {
    // console.log('!!!!!!!!!!!!!!!!!!!!!created');
    let isStruct = this.$route.query.company == 'struct'
    this.isStruct = isStruct
    this.type = isStruct ? '母子' : '关联'
    this.custid = this.$route.query.custid
    // 表格配置
    this.tableOptionOld = { ...this.option, id: 'tableOption1', pagination: false, selection: false }
    this.tableOptionNew = { ...this.option, id: 'tableOption2', pagination: false, selection: false }
    this.tableOptionOld.columns = this.tableOptionNew.columns = [
      { label: '公司名称', prop: 'relName', type: 'text' },
      { label: '关联类型', prop: 'relType', type: 'select', propInDict: 'customerRelationType' },
      { label: '附件', prop: 'fileName', type: 'button', width: 200, callback: ({ fileNo, name,suffix }) => {
        name = name.replace(/[\[|\]|\{|\}|\%|`]/g,'')
        const href = `/base/fileView/preview/${fileNo}/${name}`
        window.open(href)
      }},
      { label: '附件有效期', prop: 'time', type: 'timeRange', rangeStr: ['startTime', 'stopTime'], sliceRange: [0, 10] },
    ]
    this.tableOptionOld.operationBtns = this.tableOptionNew.operationBtns = false
    this.tableOptionOld.data = []
    this.tableOptionNew.data = []
  },
  watch: {
    '$store.state.crm.verifyCheckCompany': {
      deep: true,
      immediate: true,
      handler(val) {
        let isStruct = this.$route.query.company == 'struct'
        let custid = this.$route.query.custid
        let companyInfo = this.$store.state.crm.verifyCheckCompany
        // console.log(JSON.stringify(companyInfo))
        let { new: newVal, old: oldVal } = JSON.parse(JSON.stringify(companyInfo))
        if (newVal) {
          if (!isStruct) {
            // 关联公司
            let oldArr = oldVal ? oldVal.map((v) => +v.custid) : []
            newVal = newVal.map((v) => ({ ...v, isDiff: !oldArr.includes(+v.custid) }))
          } else {
            // 母子公司
            let oldObj = this.findEle(oldVal ? oldVal : { childs: [] }, custid)
            let newObj = this.findEle(newVal, custid)
            // console.log(oldVal, newVal)
            // console.log(oldObj, newObj)
            if (oldObj.parentEle.custid !== newObj.parentEle.custid) newObj.parentEle.isDiff = true
            let arr = oldObj.selfEle.childs.map((item) => item.custid)
            newObj.selfEle.childs.forEach((item) => (item.isDiff = !arr.includes(item.custid)))
          }
        }
        // console.log(newVal, oldVal)
        this.companyInfo = { new: newVal, old: oldVal }
        !isStruct &&
          setTimeout(() => {
            this.tableOptionOld.data.splice(0, 100, ...oldVal.map((item) => ({ ...item, redMark: !item.oid })))
            this.tableOptionNew.data.splice(0, 100, ...newVal.map((item) => ({ ...item, redMark: !item.oid })))
          }, 300)
      },
    },
  },
  computed: {
    // oldData() {
    //   if (!this.isStruct) {
    //     return this.companyInfo.old || []
    //   }
    //   return []
    // },
    // newData() {
    //   if (!this.isStruct) {
    //     return this.companyInfo.new || []
    //   }
    //   return []
    // },
    // companyInfo() {
    //   let isStruct = this.isStruct
    //   let custid = this.custid
    //   let companyInfo = this.$store.state.crm.verifyCheckCompany
    //   console.log(companyInfo)
    //   let { new: newVal, old: oldVal } = JSON.parse(JSON.stringify(companyInfo))
    //   if (newVal) {
    //     if (!isStruct) {
    //       // 关联公司
    //       let oldArr = oldVal ? oldVal.map((v) => +v.custid) : []
    //       newVal = newVal.map((v) => ({ ...v, isDiff: !oldArr.includes(+v.custid) }))
    //     } else {
    //       // 母子公司
    //       let oldObj = this.findEle(oldVal ? oldVal : { childs: [] }, custid)
    //       let newObj = this.findEle(newVal, custid)
    //       if (oldObj.parentEle.custid !== newObj.parentEle.custid) newObj.parentEle.isDiff = true
    //       let arr = oldObj.selfEle.childs.map((item) => item.custid)
    //       newObj.selfEle.childs.forEach((item) => (item.isDiff = !arr.includes(item.custid)))
    //     }
    //   }
    //   console.log({ new: newVal, old: oldVal })
    //   return { new: newVal, old: oldVal }
    // },
  },
  methods: {
    // 将树结构平铺为custid为key的对象，找到父节点和自身节点
    findEle(obj, custid) {
      let result = {}
      function flat(obj) {
        if (obj.custid) result[obj.custid] = obj
        obj.childs.length && obj.childs.forEach(flat)
      }
      flat(obj)
      let selfEle = result[custid] || { childs: [] }
      let parentEle = result[selfEle.parentCustid] || {}
      return { parentEle, selfEle }
    },
  },
}
</script>
<style lang="scss" scoped>
.detail-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9e9e9;
  padding: 10px 20px;
  margin-bottom: 20px;
  & > span {
    font-size: 16px;
    font-weight: 600;
    color: #222222;
  }
  .el-button {
    margin-bottom: 0;
  }
}
.company-tree-container {
  overflow: auto;
  box-sizing: content-box;
  // height: 450px;
  // padding: 0 40px;
  user-select: none;
  text-align: center;
}
</style>
