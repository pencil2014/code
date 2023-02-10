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
     <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="Split B/L" prop="isSplit">
            <el-select
              class="large-select"
              clearable
              placeholder="Select Split B/L"
              size="mini"
              v-model="form.isSplit"
            >
              <el-option
                :key="item.value"
                :label="item.label"
                :value="item.value"
                v-for="item in isSplitList"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="B/L Issue Place" prop="issuePlaceType">
            <el-select
              class="large-select"
              clearable
              placeholder="Select B/L Issue Place"
              size="mini"
              v-model="form.issuePlaceType"
            >
              <el-option
                :key="item.value"
                :label="item.label"
                :value="item.value"
                v-for="item in issuePlaceTypeList"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="City" prop="issuePlace.locationName" v-if="form.issuePlaceType === 'other'">
            <el-select
                class="large-select"
                clearable
                :loading="loading"
                :remote-method="getCityData"
                remote
                filterable
                placeholder="Select City"
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
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="Original Count Type" prop="blOriginalCountType">
            <el-select
              class="large-select"
              size="mini"
              v-model="form.blOriginalCountType"
            > 
             <el-option 
               v-for="(item, index) in blOriginalCountTypeList"
               :key="index"
               :label="item.label"
               :value="item.value"
             ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6" v-if="form.blOriginalCountType === 'Freight'">
          <el-form-item label="Original(Freight)" prop="blOriginalCount">
            <el-input-number
              class="large-select"
              size="mini"
              v-model="form.blOriginalCount"
              :precision="0"
              :controls="false"
            ></el-input-number>
          </el-form-item>
        </el-col>
        <el-col :span="6" v-if="form.blOriginalCountType === 'Unfreighted'">
          <el-form-item label="Original(UnFreight)" prop="blOriginalUnfreightCount">
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
          <el-form-item label="Copies(Freight)" prop="blCopyCount">
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
          <el-form-item label="Copies(UnFreight)" prop="blCopyUnfreightCount">
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
    </el-form>
  </div>
</template>

<script>
import { getCityList } from '@/api/order/robotSi'
export default {
  inject: ['dictAll', 'carrierSource', 'shipCarrierCode'],
  props: {
    handlingOption: {
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
        isSplit: '',
        issuePlaceType: '',
        issuePlace: {
          locationName: '',
        },
        blOriginalCountType: '',
        blOriginalCount: undefined,
        blOriginalUnfreightCount: undefined,
        blCopyCount: undefined,
        blCopyUnfreightCount: undefined,
      },
      isSplitList: [
        {
          label: 'Y',
          value: 'Y'
        },
        {
          label: 'N',
          value: 'N'
        },
      ],
      rules: this.fieldConfigObj,
      dictList: [],
      issuePlaceTypeList: [
        {
          label: 'sameAsReceipt',
          value: 'sameAsReceipt',
        },
        {
          label: 'other',
          value: 'other',
        },
      ],
      blOriginalCountTypeList: [
        { label: 'Freight', value: 'Freight' },
        { label: 'Unfreighted', value: 'Unfreighted' },
      ],
      loading: false,
      cityList: [],
    }
  },
  created() {
    this.form = this.handlingOption
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
    .el-form-item {
      width: 100%;
    }
  }
}
</style>
