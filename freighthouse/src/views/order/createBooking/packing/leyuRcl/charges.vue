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
      <el-form-item label="Charge Type" prop="chargeType">
        <el-select
          class="large-select"
          clearable
          placeholder="Select One"
          size="mini"
          v-model="form.chargeType"
        >
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in chargeTypeList"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Payment Term" prop="chargeTerm">
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
      <!-- <el-form-item label="Payer" prop="payer">
        <el-select
          class="large-select"
          clearable
          placeholder="Select One"
          size="mini"
          v-model="form.payer"
        >
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in chargeTermList"
          ></el-option>
        </el-select>
      </el-form-item>-->
      <el-form-item label="Payment Office" prop="paymentPlace.locationCode">
        <el-select
          :loading="loading"
          :remote-method="getCityList"
          class="large-select"
          filterable
          clearable
          placeholder="Enter Location..."
          remote
          reserve-keyword
          size="mini"
          v-model="form.paymentPlace.locationCode"
          value-key="cityUnCode"
        >
          <el-option
            :key="item.cityUnCode"
            :label="`${item.cityName}, ${item.countryName} (${item.cityUnCode})`"
            :value="item"
            v-for="item in cityList"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="Bill of Lading Release office"
        prop="releaseOffice.locationCode"
      >
        <el-select
          :loading="loading"
          :remote-method="getCityList"
          class="large-select"
          filterable
          clearable
          placeholder="Enter Location..."
          remote
          reserve-keyword
          size="mini"
          v-model="form.releaseOffice.locationCode"
          value-key="cityUnCode"
        >
          <el-option
            :key="item.cityUnCode"
            :label="`${item.cityName}, ${item.countryName} (${item.cityUnCode})`"
            :value="item"
            v-for="item in cityList"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { cityList } from '@/api/order/createBooking'
export default {
  inject: ['dictAll', 'carrierSource'],
  props: {
    chargesOption: {
      required: true,
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      form: {
        chargeType: '4',
        chargeTerm: '',
        // payer: '',
        paymentPlace: {
          locationCode: '',
          locationNmae: '',
          country: '',
          countryCode: '',
        },
        releaseOffice: {
          locationCode: '',
          locationNmae: '',
          country: '',
          countryCode: '',
        },
      },
      rules: {
        chargeType: {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        chargeTerm: {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        'paymentPlace.locationCode': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        'releaseOffice.locationCode': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
      },
      dictList: [],
      chargeTermList: [],
      chargeTypeList: [],
      loading: false,
      cityList: [],
    }
  },
  created() {
    this.form = this.chargesOption
  },
  watch: {
    dictAll: {
      handler(val) {
        if (val.dictList.length) {
          // 初始化费用类型
          const source1 = val.dictList.filter(
            (item) => item.groupCode === 'inttra_bl_charge_type'
          )[0]
          this.chargeTypeList = source1.dictItems.map((item) => {
            const { descpt, itemCode, baseItemCode } = item
            return {
              label: `${itemCode}-${descpt}`,
              value: itemCode,
              baseItemCode,
            }
          })
          // 初始化支付方式
          const source2 = val.dictList.filter(
            (item) => item.groupCode === 'inttra_payment_term'
          )[0]
          this.chargeTermList = source2.dictItems.map((item) => {
            const { descpt, itemCode, baseItemCode } = item
            return {
              label: `${itemCode}-${descpt}`,
              value: itemCode,
              baseItemCode,
            }
          })
        }
      },
      deep: true,
    },
  },
  methods: {
    // 港口下拉
    getCityList(str = '') {
      if (!str) {
        return
      }
      this.loading = true
      const data = {
        keyword: str,
        carrierSource: this.carrierSource,
      }
      cityList(data)
        .then((res) => {
          if (res.code === 0) {
            this.cityList = res.data || []
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
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
    // 初始化数据
    initData() {
      let shipmentId = this.$route.query.shipmentId
      if (shipmentId) {
        this.form.paymentPlace.locationCode && this.cityList.push(this.form.paymentPlace.locationCode)
        this.form.releaseOffice.locationCode && this.cityList.push(this.form.releaseOffice.locationCode)
        this.cityList = this.unique(this.cityList)
        return 
      }
      const chargeTerm = this.form.chargeTerm
      let source = this.chargeTermList.find((item) =>
        item.baseItemCode.includes(chargeTerm)
      )
      if (source) {
        this.form.chargeTerm = source.value
      } else {
        this.form.chargeTerm = ''
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      }
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
