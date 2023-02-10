<template>
  <div class="info-page">
    <div class="info-title border-bottom notSelf-hide">
      <span></span>
      <el-button size="mini" @click="save" type="primary">保存</el-button>
    </div>
    <CrmForm
      inputWidth="180px"
      ref="crmForm"
      :rules="rules"
      :ruleForm="ruleForm"
      :formDatas="formDatas"
    ></CrmForm>
  </div>
</template>

<script>
import CrmForm from '@/views/crm/components/crmForm'
import CUSTOMER from '@/api/crm/customer'
const LIST = []
let NUM = 32
while (--NUM) {
  LIST.unshift({ label: NUM, value: NUM })
}
// 统一设置规则提醒
const ruleMsg = { required: true, message: '必填', triggers: 'blur' }
const formDatas = [
  // { label: '结算类型', prop: 'settleMode', type: 'select' },
  { label: '结算类型', prop: 'settleMode', type: 'select', propInDict: 'settleCycle' },
  // { label: '结算日期', prop: 'settleDay', type: 'input' },
  { label: '结算日期', prop: 'settleDay', type: 'select', list: LIST },
]
const formDatasDis = formDatas.map((item) => ({ ...item, disabled: true }))
export default {
  name: 'CUST4',
  label: '结算信息',
  hidden: true,
  props: ['custid', 'orgid', 'isSelf'],
  components: {
    CrmForm,
  },
  data() {
    return {
      // 表格配置
      formDatas: [],
      ruleForm: {},
      rules: { settleMode: { ...ruleMsg } },
    }
  },
  watch: {
    isSelf: {
      handler(val) {
        this.formDatas = !val ? formDatasDis : formDatas
      },
      immediate: true,
    },
  },
  activated() {
    this.getData()
  },
  created() {},
  methods: {
    save() {
      this.$refs.crmForm.$refs.form.validate((valid) => {
        if (!valid) return
        // if (this.ruleForm.settleDay - 28 > 0 || this.ruleForm.settleDay - 1 < 0) {
        //   return this.$msgErrClose('请输入在0~28之间的日期！')
        // }
        CUSTOMER.settleSave({ ...this.ruleForm, custid: this.custid }).then((res) => {
          this.$msgSucClose('结算信息保存成功！')
          this.getData()
        })
      })
    },
    getData() {
      CUSTOMER.settleDetail({ custid: this.custid }).then((res) => {
        this.ruleForm = { ...res.data }
        this.$nextTick(() => this.$refs.crmForm.$refs.form.clearValidate())
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.info-page .info-title.border-bottom {
  height: 28px;
  padding-bottom: 6px !important;
  border-bottom: 1px solid #dfe4ed !important;
  margin-bottom: 6px;
}
</style>
