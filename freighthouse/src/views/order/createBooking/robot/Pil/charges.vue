<template>
  <div class="charges-cnt">
    <el-form
      :inline="true"
      :model="form"
      :rules="rules"
      class="form"
      label-position="top"
      ref="form"
      size="mini"
    >
      <el-form-item label="Payment Term" prop="chargeTerm">
        <el-select
          class="large-select"
          clearable
          placeholder="Select Payment Term"
          size="mini"
          v-model="form.chargeTerm"
        >
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in chargeTermList"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Pay At" prop="serviceExtra.displayPaymentPort">
        <el-input
          class="large-select"
          clearable
          placeholder="Select Pay At"
          size="mini"
          v-model="form.serviceExtra.displayPaymentPort"
        ></el-input>
      </el-form-item>
      <el-form-item label="Issue Place" prop="serviceExtra.displayIssuePlace">
        <el-input
          class="large-select"
          clearable
          placeholder="Select Issue Place"
          size="mini"
          v-model="form.serviceExtra.displayIssuePlace"
        ></el-input>
      </el-form-item>
      <el-form-item label="Fax" prop="serviceExtra.notifyTax">
        <el-input
          class="large-select"
          clearable
          placeholder="Select Fax"
          size="mini"
          v-model="form.serviceExtra.notifyTax"
        ></el-input>
      </el-form-item>
      <el-form-item label="Tel" prop="serviceExtra.notifyTel">
        <el-input
          class="large-select"
          clearable
          placeholder="Select Tel"
          size="mini"
          v-model="form.serviceExtra.notifyTel"
        ></el-input>
      </el-form-item>
      <el-form-item label="Email" prop="notifyEmails">
        <el-input
          class="large-select"
          clearable
          placeholder="Select Email"
          size="mini"
          v-model="form.notifyEmails"
        ></el-input>
      </el-form-item>
      <el-form-item label="Contact Name" prop="notifyName">
        <el-input
          class="large-select"
          clearable
          placeholder="Select Contact Name"
          size="mini"
          v-model="form.notifyName"
        ></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  inject: ['dictAll', 'carrierSource'],
  props: {
    chargesOption: {
      required: true,
      type: Object,
      default: () => {},
    },
    fieldConfigObj: {
      type: Object,
      default: () => {},
    },
    fieldConfigList: {
      type: Array,
      default: () => [],
    }
  },
  data() {
    return {
      form: {
        chargeTerm: '',
        serviceExtra: {
          displayPaymentPort: '',
          displayIssuePlace: '',
          notifyTax: '',
          notifyTel: '',
        },
        notifyEmails: '',
        notifyName: '',
      },
      rules: this.fieldConfigObj,
      dictList: [],
      chargeTermList: [],
      loading: false,
    }
  },
  created() {
    this.form = this.chargesOption
    this.getDictData()
  },
  methods: {
    getDictData() {
      // 初始化支付方式
      const source2 = this.dictAll.dictList.filter(
        (item) => item.groupCode === 'ai_tsl_payment_term'
      )[0]
      this.chargeTermList = source2.dictItems.map((item) => {
        const { descpt, itemCode, baseItemCode } = item
        return {
          label: `${itemCode}-${descpt}`,
          value: itemCode,
          baseItemCode,
        }
      })
      if (!this.chargeTermList.some(item => item.value === this.form.chargeTerm)) {
        this.form.chargeTerm = ''
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      }
    },
    // 数据校验
    validateForm() {
      let flag = null
      this.$refs['form'].validate((valid) => {
        if (valid) {
          flag = true
        } else {
          flag = false
        }
      })
      return flag
    },
    // 去重
    unique(arr) {
      const res = new Map()
      return arr.filter((item) => !res.has(item.cityUnCode) && res.set(item.cityUnCode, 1))
    },
  },
}
</script>

<style lang="scss" scoped>
.charges-cnt {
  padding: 8px;
  .form {
    display: flex;
    flex-wrap: wrap;
    .el-form-item {
      width: 24%;
    }
  }
}
</style>
