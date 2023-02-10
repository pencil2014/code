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
            placeholder="Select One"
            clearable
            v-model="form.blType"
            @change="changeBlType"
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
      <!-- <div class="count-box">
       <el-form-item label="Telex release office" prop="telexReleaseOffice.locationCode" :required="form.blType==='710'">
          <el-select
            :loading="loading"
            :remote-method="getCityList"
            class="large-select"
            filterable
            placeholder="Enter Location..."
            remote
            reserve-keyword
            size="mini"
            v-model="form.telexReleaseOffice.locationCode"
            value-key="cityUnCode"
            :disabled="form.blType==='706'"
          >
            <el-option
              :key="item.cityUnCode"
              :label="`${item.cityName}, ${item.countryName} (${item.cityUnCode})`"
              :value="item"
              v-for="item in releaseCityList"
            ></el-option>
          </el-select>
        </el-form-item>
      </div> -->
      <div class="remarks-box">
        <el-form-item label="B/L Comments" prop="remarks">
          <el-input
            placeholder="Enter Comments..."
            v-model="form.remarks"
            type="textarea"
            autosize
            @blur="handleTextarea(35, 99)"
            :class="{ 'is-exceed': marksErr }"
          ></el-input>
          <p class="error-tips" v-show="marksErr">
            This field can accept only 99 lines of 35 characters
          </p>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>
<script>
import { cityList } from '@/api/order/createBooking'
export default {
  inject: ['dictAll', 'carrierSource'],
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
        blType: '706',
        remarks: '',
        telexReleaseOffice: {
          locationCode: '',
          locationName: '',
          country: '',
          countryCode: '',
        },
      },
      rules: {
        blType: {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
      },
      blTypeList: [],
      releaseCityList: [],
      loading: false,
      marksErr: false,
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
            (item) => item.groupCode === 'leyu_bl_type'
          )[0]
          let dictItems = source.dictItems.filter(
            (item) => item.descpt !== 'TLX RELEASE'
          )
          this.blTypeList = dictItems.map((item) => {
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
    changeBlType(val) {
      if (val === '706') {
        this.form.telexReleaseOffice = {
          locationCode: '',
          locationName: '',
          country: '',
          countryCode: '',
        }
      }
    },
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
            this.releaseCityList = res.data || []
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
    // 初始化数据
    initData() {
      const blType = this.form.blType
      const source = this.blTypeList.find((item) => item.value === blType)
      if (source) {
        this.form.blType = source.value
      } else {
        this.form.blType = ''
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      }
    },
    // 校验
    handleTextarea(num = 35, line = 99) {
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
      this.marksErr = res.length > line
      this.form.remarks = res.join('\n')
      // 汉字校验
      const reg =
        /[\u4e00-\u9fa5]|[\uFE30-\uFFA0]|[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/gi
      const chineseIndex = []
      const lengthIndex = []
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
        const text = `There are Chinese characters in lines ${chineseIndex.join(
          ','
        )} please check`
        this.$msgErrClose(text)
      }
      if (lengthIndex.length) {
        this.marksErr = true
        const text = `The number of characters in lines ${lengthIndex.join(
          ','
        )} exceeds ${num}  please check`
        this.$msgErrClose(text)
      }
    },
  },
}
</script>

<style scoped lang="scss">
.bl-cnt {
  padding: 8px;
  .form {
    width: 100%;
    display: flex;
    justify-content: space-between;
    .type-box,
    // .count-box,
    .remarks-box {
      flex-basis: 45%;
      .el-form-item {
        width: 100%;
        margin-right: 0;
      }
    }
    // .count-box {
    //   display: flex;
    //   justify-content: space-between;
    //   flex-wrap: wrap;
    //   .el-form-item {
    //     width: 100%;
    //     margin-right: 0;
    //   }
    // }
  }
  .error-tips {
    color: red;
    font-size: 12px;
  }
}
</style>
