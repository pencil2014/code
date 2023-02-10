<template>
  <div class="payment-cnt">
    <el-form
      :inline="true"
      :model="form"
      :rules="rules"
      class="form"
      label-position="top"
      ref="form"
    >
      <!-- <div :key="index" class="form-item" v-for="(item,index) in form"> -->
      <div class="form-cnt">
        <!-- <el-form-item label="Charge Type" prop="chargeType">
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
        </el-form-item> -->
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
        <el-form-item label="Payment Office" prop="payLocation.locationCode">
          <el-select
            :loading="loading"
            :remote-method="getCityList"
            class="large-select"
            filterable
            placeholder="Enter Office..."
            remote
            reserve-keyword
            size="mini"
            v-model="form.payLocation.locationCode"
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
        <el-form-item label="Booking Office" prop="bookingOffice.locationCode">
          <el-select
            :loading="loading"
            class="large-select"
            :remote-method="getCityList"
            filterable
            placeholder="Enter Location..."
            remote
            reserve-keyword
            size="mini"
            v-model="form.bookingOffice.locationCode"
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
        <!-- <el-form-item :prop="name" label="付款方">
            <el-select class="large-select" placeholder="请选择" size="mini" v-model="item.name">
              <el-option
                :key="item.value"
                :label="item.label"
                :value="item.value"
                v-for="item in options"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :prop="name" label="付款地点">
            <el-input placeholder="请输入" size="mini" v-model="form.name"></el-input>
        </el-form-item>-->
      </div>
      <!-- <div class="btn-box">
          <i @click="addItem" class="el-icon-circle-plus" v-if="index === 0"></i>
          <i @click="removeItem(index)" class="el-icon-remove" v-else></i>
      </div>-->
      <!-- </div> -->
    </el-form>
  </div>
</template>

<script>
import { cityList } from '@/api/order/createBooking'
export default {
  inject: ['dictAll', 'carrierSource'],
  props: {
    paymentOption: {
      required: true,
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      loading: false,
      form: {
        chargeTerm: 'P',
        payLocation: {
          locationCode: '',
          locationNmae: '',
          country: '',
          countryCode: '',
        },
        bookingOffice: {
          locationCode: '',
          locationNmae: '',
          country: '',
          countryCode: '',
        },
      },
      rules: {
        chargeTerm: {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        'payLocation.locationCode': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        'bookingOffice.locationCode': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
      },
      dictList: [],
      chargeTermList: [],
      chargeTypeList: [],
      cityList: [],
    }
  },
  created() {
    this.form = this.paymentOption
  },
  watch: {
    dictAll: {
      handler(val) {
        if (val.dictList.length) {
          // 初始化费用类型
          const source1 = val.dictList.filter(
            (item) => item.groupCode === 'inttra_charge_type'
          )[0]
          this.chargeTypeList = source1.dictItems.map((item) => {
            const { descpt, itemCode } = item
            return {
              label: `${descpt}`,
              value: itemCode,
            }
          })
          // 初始化支付方式
          const source2 = val.dictList.filter(
            (item) => item.groupCode === 'inttra_payment_term'
          )[0]
          this.chargeTermList = source2.dictItems.map((item) => {
            const { descpt, itemCode } = item
            return {
              label: `${descpt}`,
              value: itemCode,
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
    // 添加数据
    addItem() {
      this.form.push({})
    },
    // 删除数据
    removeItem(index) {
      this.$confirmWarn('确定删除此数据吗？', () => this.form.splice(index, 1))
    },
    // 校验数据
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
  },
}
</script>

<style scoped lang="scss">
.payment-cnt {
  .form {
    padding: 10px 8px;
    .form-cnt {
      display: flex;
      justify-content: space-between;
    }
    .el-form-item {
      flex-basis: 30%;
    }
  }
  .large-select {
    width: 100%;
  }
  .form-item {
    display: flex;
    .form-cnt {
      flex: 1;
    }
    .btn-box {
      flex-basis: 60px;
      display: flex;
      align-items: flex-end;
      margin-bottom: 10px;
      i {
        font-size: 20px;
        cursor: pointer;
        &.el-icon-circle-plus {
          color: #417f90;
          &:hover {
            color: #356572;
          }
        }
        &.el-icon-remove {
          color: #ccc;
          &:hover {
            color: #999;
          }
        }
      }
    }
  }
}
</style>
