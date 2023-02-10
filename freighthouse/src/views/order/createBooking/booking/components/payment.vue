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
export default {
  inject: ['dictAll'],
  props: {
    paymentOption: {
      required: true,
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      form: {
        chargeType: '',
        chargeTerm: '',
      },
      rules: {},
      dictList: [],
      chargeTermList: [],
      chargeTypeList: [],
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
              label: `${itemCode}-${descpt}`,
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
              label: `${itemCode}-${descpt}`,
              value: itemCode,
            }
          })
        }
      },
      deep: true,
    },
  },
  methods: {
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
    .el-form-item {
      width: 45%;
      margin-right: 0;
    }
  }
  .large-select {
    width: 100%;
  }
  .form-cnt {
    flex: 1;
    display: flex;
    justify-content: space-between;
    margin-right: 40px;
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
</style>
