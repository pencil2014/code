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
      
      <div class="type-box type-box-1">
        <el-form-item label="" prop="isAdValorem">
          <el-checkbox v-model="form.isAdValorem" :true-label="'y'" :false-label="'n'">Ad Valorem (subject to premium)</el-checkbox>
        </el-form-item>
      </div>
      <div class="type-box type-box-1">
        <el-form-item label="" prop="isAddCertificatesRequired">
          <el-checkbox v-model="form.isAddCertificatesRequired" :true-label="'y'" :false-label="'n'">Additional Certificate(s) required</el-checkbox>
        </el-form-item>
      </div>
      <div class="type-box type-box-1">
        <el-form-item label="" prop="isPartLoad">
          <el-checkbox v-model="form.isPartLoad" :true-label="'y'" :false-label="'n'">Part load</el-checkbox>
        </el-form-item>
      </div>
      <div class="type-box type-box-1">
        <el-form-item label="" prop="isRequestForCargoCover">
          <el-checkbox v-model="form.isRequestForCargoCover" :true-label="'y'" :false-label="'n'">Request for cargo cover</el-checkbox>
        </el-form-item>
      </div>
      <div class="type-box type-box-1">
        <el-form-item label="" prop="isTransportOrderForCarrierHaulage">
          <el-checkbox v-model="form.isTransportOrderForCarrierHaulage" :true-label="'y'" :false-label="'n'">Transport order (Carrier haulage)</el-checkbox>
        </el-form-item>
      </div>
      <div class="type-box type-box-1">
        <el-form-item label="" prop="isOnDeck">
          <el-checkbox v-model="form.isOnDeck" :true-label="'y'" :false-label="'n'">On deck</el-checkbox>
        </el-form-item>
      </div>
      <div class="type-box type-box-1">
        <el-form-item label="" prop="isSplit">
          <el-checkbox v-model="form.isSplit" :true-label="'y'" :false-label="'n'">Split</el-checkbox>
        </el-form-item>
      </div>
      <div class="type-box type-box-1">
        <el-form-item label="" prop="isMerged">
          <el-checkbox v-model="form.isMerged" :true-label="'y'" :false-label="'n'">Merge</el-checkbox>
        </el-form-item>
      </div>
      <div class="type-box type-box-1">
        <el-form-item label="" prop="isExpressReleased">
          <el-checkbox v-model="form.isExpressReleased" :true-label="'y'" :false-label="'n'">Express release</el-checkbox>
        </el-form-item>
      </div>
      <el-row style="width:100%;" :gutter="20">
        <el-col :span="6">
          <el-form-item style="width:100%;" label="Original(Freight)" prop="blOriginalCount">
            <el-input-number
              class="large-select"
              size="mini"
              v-model="form.blOriginalCount"
              :precision="0"
              :controls="false"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item style="width:100%;" label="Original(UnFreight)" prop="blOriginalUnfreightCount">
            <el-input-number
              class="large-select"
              size="mini"
              v-model="form.blOriginalUnfreightCount"
              :precision="0"
              :controls="false"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item style="width:100%;" label="Copies(Freight)" prop="blCopyCount">
            <el-input-number
              class="large-select"
              size="mini"
              v-model="form.blCopyCount"
              :precision="0"
              :controls="false"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item style="width:100%;" label="Copies(UnFreight)" prop="blCopyUnfreightCount">
            <el-input-number
              class="large-select"
              size="mini"
              v-model="form.blCopyUnfreightCount"
              :precision="0"
              :controls="false"
            ></el-input-number>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row style="width:100%;" :gutter="20">
        <el-col :span="6">
          <el-form-item style="width:100%;" label="B/L Type" prop="blType">
            <el-select
              class="large-select"
              placeholder="Select One"
              clearable
              style="width:100%;"
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
        </el-col>
        <el-col :span="6">
          <el-form-item style="width:100%;" label="Place of issue " prop="issuePlace.locationName">
            <el-select
             style="width:100%;"
              class="large-select"
              clearable
              :loading="loading"
              :remote-method="getCityData"
              remote
              filterable
              placeholder="Select One"
              size="mini"
              v-model="form.issuePlace.locationName"
            >
            <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in cityList"
            ></el-option>
          </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item style="width:100%;" label="Select Clause" prop="selectedClauses">
            <el-select
              style="width:100%;"
              placeholder="Select One"
              clearable
              v-model="form.selectedClauses"
            >
              <el-option
                :key="item.value"
                :label="item.label"
                :value="item.value"
                v-for="item in selectedClausesList"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item style="width:100%;" label="B/L Comments" prop="remarks">
            <el-input
              placeholder="Enter Comments..."
              v-model="form.remarks"
              type="textarea"
              autosize
              @blur="handleTextarea('remarks', 'remarks')"
            ></el-input>
            <p class="error-tips" v-show="remarksError">
              {{ getErrTip('remarks')}}
              </p>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import { getCityList } from '@/api/order/robotSi'
export default {
  inject: ['dictAll', 'shipCarrierCode'],
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
        blType: '',
        issuePlace: {
          locationName: '',
        },
        isAdValorem: 'n',
        isAddCertificatesRequired: 'n',
        isPartLoad: 'n',
        isRequestForCargoCover: 'n',
        isTransportOrderForCarrierHaulage: 'n',
        isOnDeck: 'n',
        isSplit: 'n',
        isMerged: 'n',
        isExpressReleased: 'n',
        selectedClauses: '',
        remarks: '',
        blOriginalCount: undefined,
        blOriginalUnfreightCount: undefined,
        blCopyCount: undefined,
        blCopyUnfreightCount: undefined,
      },
      rules: this.fieldConfigObj,
      blTypeList: [],
      remarksError: false,
      loading: false,
      cityList: [],
      selectedClausesList: []
    }
  },
  created() {
    this.form = this.blOption
    this.getDictData()
  },
  methods: {
    getDictData() {
      const source = this.dictAll.dictList.filter(
        (item) => item.groupCode === 'ai_cma_bl_type'
      )[0]
      this.blTypeList = source.dictItems.map((item) => {
        const { descpt, itemCode, baseItemCode } = item
        return {
          label: `${itemCode}-${descpt}`,
          value: itemCode,
          baseItemCode,
        }
      })
      if (!this.blTypeList.some(item => item.value === this.form.blType)) {
        this.form.blType = ''
        this.$nextTick(() => {
          this.$refs.form.clearValidate()
        })
      }
      const source3 = this.dictAll.dictList.filter(
        (item) => item.groupCode === 'ai_cma_clauses'
      )[0]
      this.selectedClausesList = source3.dictItems.map((item) => {
        const { descpt, itemCode, baseItemCode } = item
        return {
          label: `${descpt}`,
          value: itemCode,
          baseItemCode,
        }
      })
    },
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
    getErrTip(fieldName) {
      let fieldConfig = this.fieldConfigList.find(item => {
        return item.fieldName === fieldName
      }) || {}
      let num = fieldConfig.maxLength || null
      let line = fieldConfig.maxRow || null
      if (num && line) {
         return `This field can accept only ${line} lines of ${num} characters`
      }
    },
    // textarea格式化
    handleTextarea(type = 'remarks', fieldName) {
      let res = []
      const source = this.replaceChinese(this.form.remarks)
      const arr = source.split('\n')
      let fieldConfig = this.fieldConfigList.find(item => {
        return item.fieldName === fieldName
      }) || {}
      let num = fieldConfig.maxLength || null
      let line = fieldConfig.maxRow || null
      arr.forEach((item) => {
        const len = item.length
        if (num && len > num) {
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
      this[`${type}Error`]= line && (res.length > line)
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
        if (num && item.length > num) {
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
    justify-content: flex-start;
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
      width: 25%;
    }
    .remarks-box {
      width: 50%;
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
    .type-box-1 {
      margin-left: initial !important;
      width: 24%;
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
