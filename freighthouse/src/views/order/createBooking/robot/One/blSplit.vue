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
      <el-form-item label="Type of B/L" prop="typeOfBl">
        <el-select
          class="large-select"
          clearable
          placeholder="Select Type of B/L"
          size="mini"
          v-model="form.typeOfBl"
        >
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in typeOfBlList"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Sequence" prop="splitSequence" v-if="form.typeOfBl === 'split'">
        <el-select
          class="large-select"
          clearable
          placeholder="Select Sequence"
          size="mini"
          v-model="form.splitSequence"
        >
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in splitSequenceList"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Count of B/Ls(Optional)" prop="splitCount" v-if="form.typeOfBl === 'split'">
         <el-input-number
            class="large-select"
            placeholder="Enter Count of B/Ls(Optional)"
            size="mini"
            v-model="form.splitCount"
            :precision="0"
            :controls="false"
          ></el-input-number>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { cityList } from '@/api/order/createBooking'
export default {
  inject: ['dictAll', 'carrierSource'],
  props: {
    blSplitOption: {
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
        typeOfBl: '',
        splitSequence: '',
        splitCount: ''
      },
      rules: this.fieldConfigObj,
      dictList: [],
      typeOfBlList: [],
      splitSequenceList: [
        {
          label: 'Continue',
          value: 'Continue',
        },
        {
          label: 'Last',
          value: 'Last',
        },
      ],
      loading: false,
      cityList: [],
    }
  },
  created() {
    this.form = this.blSplitOption
    this.getDictData()
  },
  methods: {
    getDictData() {
      const source1 = this.dictAll.dictList.filter(
        (item) => item.groupCode === 'ai_one_typeofbl'
      )[0]
      this.typeOfBlList = source1.dictItems.map((item) => {
        const { descpt, itemCode, baseItemCode } = item
        return {
          label: `${itemCode}-${descpt}`,
          value: itemCode,
          baseItemCode,
        }
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
