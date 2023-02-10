<template>
  <div class="bl-cnt">
    <el-form
      :inline="true"
      :model="form"
      :rules="rules"
      class="form"
      label-position="top"
      ref="form"
      size="mini"
    >
      <div class="type-box">
        <el-form-item label="B/L Type" prop="blType">
          <el-select
            class="large-select"
            clearable
            placeholder="Select One"
            v-model="form.blType"
          >
            <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in blTypeList"
            ></el-option>
          </el-select>
        </el-form-item>
      </div>
      <div class="count-box">
        <template v-if="!['999','714'].includes(form.blType)">
          <el-form-item label="Freighted" prop="blOriginalCount">
            <el-input
              placeholder="Enter Number..."
              v-model="form.blOriginalCount"
            ></el-input>
          </el-form-item>
          <el-form-item label="Unfreighted" prop="blOriginalUnfreightCount">
            <el-input
              placeholder="Enter Number..."
              v-model="form.blOriginalUnfreightCount"
            ></el-input>
          </el-form-item>
        </template>

        <template v-if="['706', '707'].includes(form.blType)">
          <el-form-item label="Freighted (Non-Negotiable)" prop="blCopyCount">
            <el-input
              placeholder="Enter Number..."
              v-model="form.blCopyCount"
            ></el-input>
          </el-form-item>
          <el-form-item
            label="Unfreighted (Non-Negotiable)"
            prop="blCopyUnfreightCount"
          >
            <el-input
              placeholder="Enter Number..."
              v-model="form.blCopyUnfreightCount"
            ></el-input>
          </el-form-item>
        </template>
        <template v-if="form.blType == '714'">
          <el-form-item label="House Bill Number" prop="hblName">
            <el-input
              placeholder="Enter Number..."
              v-model="form.hblName"
            ></el-input>
          </el-form-item>
        </template>
      </div>
      <div class="remarks-box">
        <el-form-item label="B/L Comments" prop="remarks">
          <el-input
            placeholder="Enter Comments..."
            v-model="form.remarks"
            type="textarea"
            autosize
            @blur="handleTextarea('remarks', 60, 99)"
          ></el-input>
          <p class="error-tips" v-show="remarksError">
              This field can accept only 99 lines of 60 characters
            </p>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
export default {
  inject: ['dictAll'],
  props: {
    blOption: {
      required: true,
      type: Object,
      default: () => {},
    },
    replaceChinese: {
      required: true,
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      form: {
        blType: '',
        blOriginalCount: '',
        blCopyCount: '',
        blOriginalUnfreightCount: '',
        blCopyUnfreightCount: '',
        hblName: '',
        remarks: '',
      },
      rules: {
        blType: {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        remarks: {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
      },
      blTypeList: [],
      remarksError: false,
    }
  },
  created() {
    this.form = this.blOption
  },
  watch: {
    dictAll: {
      handler(val) {
        if (val.dictList.length) {
          const source = val.dictList.filter(
            (item) => item.groupCode === 'emc_bl_type'
          )[0]
          this.blTypeList = source.dictItems.map((item) => {
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
    // 初始化数据
    initData() {
      const blType = this.form.blType
      let source = this.blTypeList.find((item) => item.baseItemCode === blType)
      if (source) {
        this.form.blType = source.value
      } else {
        this.form.blType = ''
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      }
    },
    // textarea格式化
    handleTextarea(type = 'remarks', num = 60, line = 99) {
      let res = []
      const source = this.replaceChinese(this.form.remarks)
      const arr = source.split('\n')
      arr.forEach((item) => {
        const len = item.length
        if (len > num) {
          const str = item.split('')
          const forLen = Math.floor(len / num)
          for (let i = 0; i < forLen; i++) {
            const lsIndex = item.lastIndexOf('\n') + 1
            const lsword = lsIndex + num
            const word = item.slice(lsIndex, lsword)
            if (word.length < num) {
              break
            }
            const spindex = word.lastIndexOf(' ')
            str[lsIndex + spindex] = '\n'
            item = str.join('')
          }
        }
        res.push(item)
      })
      res = res.join('\n').split('\n')
      this[`${type}Error`]= res.length > line
      this.form[type]= res.join('\n')
      // 汉字校验
      const reg =
        /[\u4e00-\u9fa5]|[\uFE30-\uFFA0]|[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/gi
      let chineseIndex = []
      let lengthIndex = []
      res.forEach((item, i) => {
        reg.lastIndex = 0
        if (reg.test(item)) {
          chineseIndex.push(i + 1)
        }
        // 长度超出num未被截断
        if (item.length > num) {
          lengthIndex.push(i + 1)
        }
      })
      if (chineseIndex.length) {
        let text = `There are Chinese characters in lines ${chineseIndex.join(
          ','
        )} please check`
        this.$msgErrClose(text)
      }
      if (lengthIndex.length) {
        this[`${type}Error`] = true
        let text = `The number of characters in lines ${lengthIndex.join(
          ','
        )} exceeds ${num}  please check`
        this.$msgErrClose(text)
      }
    },
  },
}
</script>

<style lang="scss">
.bl-cnt {
  padding: 8px;
  .form {
    width: 100%;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    .type-box,
    .count-box,
    .remarks-box {
      width: 30%;
      .el-form-item {
        width: 100%;
        margin-right: 0;
      }
    }
    .type-box {
      width: 45%;
    }
    .remarks-box {
      width: 100%;
    }
    .count-box {
      width: 45%;
    }
    .count-box {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      .el-form-item {
        width: 45%;
        margin-right: 0;
      }
    }
  }
  .error-tips {
    color: red;
    flex: 1;
    margin-right: 10px;
    font-size: 12px;
  }
}
</style>
