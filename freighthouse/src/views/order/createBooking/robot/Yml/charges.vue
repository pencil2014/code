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
      <el-form-item label="Freight Term" prop="chargeTerm">
        <el-select
          class="large-select"
          clearable
          placeholder="Select One"
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
      <el-form-item label="Pay At" prop="paymentPlace.locationName">
        <el-select
            class="large-select"
            clearable
            :loading="loading"
            :remote-method="getCityData"
            remote
            filterable
            placeholder="Select Pay At"
            size="mini"
            v-model="form.paymentPlace.locationName"
          >
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in cityList"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getCityList } from '@/api/order/robotSi'
export default {
  inject: ['dictAll', 'carrierSource', 'shipCarrierCode'],
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
        paymentPlace: {
          locationName: '',
        }
      },
      rules: this.fieldConfigObj,
      dictList: [],
      chargeTermList: [],
      loading: false,
      cityList: []
    }
  },
  created() {
    this.form = this.chargesOption
    this.getDictData()
  },
  methods: {
    getCityData(str = '') {
      let check = str && str.trim() && str.trim().length > 2
      if (!check) return
      const data = {
        keyword: str,
        baseCarrierCode: this.shipCarrierCode,
      }
      this.loading = true
      getCityList(data)
      .then(res => {
        this.cityList = res.data.map(item => {
          item.value = item.cityFullName
          item.label = item.cityFullName
          return item
        })
      })
      .finally(() => {
        this.loading = false
      })
    },
    getDictData() {
      // 初始化支付方式
      const source2 = this.dictAll.dictList.filter(
        (item) => item.groupCode === 'ai_yml_freight_term'
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
    .el-form-item {
      width: 25%;
    }
  }
}
</style>
