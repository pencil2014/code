<template>
  <el-dialog
    :title="option.type === 'add' ? '设置运价' : '编辑运价'"
    :visible.sync="option.show"
    width="600px"
    :before-close="cancel"
  >
    <el-form
      :inline="true"
      ref="form"
      :model="form"
      :rules="rules"
      label-width="80px"
      class="price-form"
    >
      <p class="tips">( 价格请输入如 +100 或者 -100 )</p>
      <el-form-item label="20GP" prop="priceGp20">
        <el-input v-model="form.priceGp20" :placeholder="getPlaceholder('priceGp20')"></el-input>
      </el-form-item>
      <el-form-item label="40GP" prop="priceGp40">
        <el-input v-model="form.priceGp40" :placeholder="getPlaceholder('priceGp40')"></el-input>
      </el-form-item>
      <el-form-item label="40HQ" prop="priceHq40">
        <el-input v-model="form.priceHq40" :placeholder="getPlaceholder('priceHq40')"></el-input>
      </el-form-item>
      <el-form-item label="40NOR" prop="priceNor40">
        <el-input v-model="form.priceNor40" :placeholder="getPlaceholder('priceNor40')"></el-input>
      </el-form-item>
      <el-form-item label="有效期" prop="beginDate">
        <el-date-picker
          v-model="form.beginDate"
          type="daterange"
          placeholder="请选择"
          value-format="yyyy-MM-dd"
          :picker-options="pickerOptions"
        ></el-date-picker>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button size="mini" @click="cancel">取 消</el-button>
      <el-button type="primary" size="mini" @click="submit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    option: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      placeholder: '请输入价格',
      form: {
        priceGp20: '',
        priceGp40: '',
        priceHq40: '',
        priceNor40: '',
        beginDate: [],
      },
      rules: {
        priceGp20: { required: true, message: ' ', trigger: 'change' },
        priceGp40: { required: true, message: ' ', trigger: 'change' },
        priceHq40: { required: true, message: ' ', trigger: 'change' },
        priceNor40: { required: true, message: ' ', trigger: 'change' },
        beginDate: { required: true, message: ' ', trigger: 'change' },
      },
      basePrice: {},
      pickerOptions: {
        disabledDate: (time) => this.disabledDate(time),
      },
    }
  },
  created() {
    if (this.option.type === 'edit') {
      let {
        discountBeginDate,
        discountEndDate,
        priceGp20 = 0,
        discountPriceGp20 = 0,
        priceGp40 = 0,
        discountPriceGp40 = 0,
        priceHq40 = 0,
        discountPriceHq40 = 0,
        priceNor40 = 0,
        discountPriceNor40 = 0,
      } = this.option.data
      Object.assign(this.form, {
        beginDate: [discountBeginDate, discountEndDate],
        priceGp20: discountPriceGp20 - priceGp20,
        priceGp40: discountPriceGp40 - priceGp40,
        priceHq40: discountPriceHq40 - priceHq40,
        priceNor40: discountPriceNor40 - priceNor40,
      })
    }
    let { priceGp20 = 0, priceGp40 = 0, priceHq40 = 0, priceNor40 = 0 } = this.option.data
    this.basePrice = {
      priceGp20,
      priceGp40,
      priceHq40,
      priceNor40,
    }
  },
  methods: {
    disabledDate(time) {
      let { beginDate, endDate } = this.option.data
      let oneDay = 1000 * 60 * 60 * 24
      let sta = new Date(beginDate).getTime() - oneDay
      let end = new Date(endDate).getTime()
      // return time.getTime() < sta || time.getTime() > end
      return time.getTime() > end
    },
    getPlaceholder(key) {
      let isAdd = this.option.type === 'add' || true
      return isAdd ? `原价 ${this.basePrice[key]}` : '请输入价格'
    },
    cancel() {
      this.$parent.priceOption.show = false
    },
    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          let reg = /^(\-|\+)?\d+(\.\d+)?$/
          let { priceGp20, priceGp40, priceHq40, priceNor40 } = this.form
          if (
            !reg.test(priceGp20) ||
            !reg.test(priceGp40) ||
            !reg.test(priceHq40) ||
            !reg.test(priceNor40)
          ) {
            return this.$msgErrClose('价格输入不正确，请输入如+100 或 -100')
          }
          if (this.checkNum(priceGp20, 'priceGp20') || this.checkNum(priceGp40, 'priceGp40') || this.checkNum(priceHq40, 'priceHq40') || this.checkNum(priceNor40, 'priceNor40')) {
            return this.$msgErrClose('输入的减价金额不能大于等于原始运价')
          }
          this.$emit('submit', this.form)
        } else {
          return false
        }
      })
    },
    checkNum(num1, key) {
      num1 = Number(num1)
      let num2 = Number(this.basePrice[key])
      if (num1 === 0 || num1 + num2 > 0) {
        return false
      } else {
        return true
      }
    }
  },
}
</script>

<style lang="scss" scoped>
.tips {
  margin-top: -15px;
  color: #bbb;
  margin-bottom: 10px;
}
.price-form {
  .el-form-item {
    width: 100%;
    margin-right: 0;
    margin-bottom: 20px;
    display: flex;
    /deep/.el-form-item__content {
      flex: 1;
      .el-date-editor {
        width: 100%;
        .el-range-input {
          font-size: 12px;
        }
        .el-range-separator {
          line-height: 20px;
        }
      }
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
