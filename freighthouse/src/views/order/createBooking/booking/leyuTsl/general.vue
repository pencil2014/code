<template>
  <div class="overall-cnt">
    <el-form
      :inline="true"
      :model="form"
      :rules="rules"
      class="form"
      label-position="top"
      ref="form"
    >
      <!-- :disabled="disabledCarrier" -->
      <el-form-item label="Carrier / NVOCC / Booking Agent" prop="carrierScac">
        <el-select
          @change="changeCarrier"
          filterable
          placeholder="Select One"
          size="mini"
          v-model="form.carrierScac"
        >
          <el-option
            :key="item.value"
            :label="item.label"
            :value="item.value"
            v-for="item in carrierList"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Contract Number" prop="contractNo">
        <el-input
          placeholder="Enter Number..."
          size="mini"
          v-model="form.contractNo"
        ></el-input>
      </el-form-item>
      <!-- <div v-show="showMore"> -->
      <!-- <el-form-item label="承运人订舱号" prop="bookingNo">
          <el-input disabled placeholder="请输入" size="mini" v-model="form.bookingNo"></el-input>
      </el-form-item>-->
      <!-- <el-form-item :prop="referenceNO" class="small-label" label=" ">
          <el-checkbox @change="changeNoFile" size="mini" v-model="noFile">货运公司未提交文件</el-checkbox>
          <el-input
            :disabled="!noFile"
            :required="noFile"
            placeholder="请输入"
            size="mini"
            v-model="form.referenceNO"
          >
            <template slot="prepend">文件ID/SCAC</template>
          </el-input>
      </el-form-item>-->
      <!-- <el-form-item :prop="name3" label=" ">
          <el-checkbox size="mini" v-model="checked">每集装箱的分别放货号</el-checkbox>
      </el-form-item>-->
      <!-- </div> -->
      <!-- <div @click="showMore=!showMore" class="showmore">
        <i class="el-icon-arrow-down" v-if="!showMore"></i>
        <i class="el-icon-arrow-up" v-else></i>
        追加整体详情
      </div>-->
    </el-form>
  </div>
</template>

<script>
import { carrierList, cityList } from '@/api/order/createBooking'
export default {
  inject: ['carrierSource'],
  props: {
    overallOption: {
      required: true,
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      carrierList: [],
      cityList: [],
      form: {
        contractNo: '',
        carrierScac: '',
        carrierName: '',
      },
      noFile: false,
      rules: {
        carrierScac: {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
      },
      options: [],
      loading: false,
      showMore: false,
      disabledCarrier: false,
    }
  },
  created() {
    this.form = this.overallOption
    this.getCarrierList()
  },
  methods: {
    // 改变未提交文件
    changeNoFile(val) {
      if (val) {
      } else {
        this.form.referenceNO = ''
      }
    },
    // 获取船司列表
    getCarrierList(str = '') {
      const data = {
        keyword: str,
        type: 'bk',
        carrierSource: this.carrierSource,
      }
      carrierList(data)
        .then((res) => {
          if (res.code === 0) {
            const source = res.data
            if (source.length) {
              this.carrierList = source.map((item) => {
                const {
                  carrierName,
                  scac,
                  companyId,
                  baseCarrierCode,
                  carrierSource,
                } = item
                return {
                  label: carrierName,
                  value: scac,
                  companyId,
                  baseCarrierCode,
                  carrierSource,
                }
              })
            } else {
              this.carrierList = []
            }
            this.initData()
          }
        })
        .catch(() => {})
    },
    // 选择船司
    changeCarrier(val) {
      if (val) {
        let source = this.carrierList.find((item) => item.value === val)
        this.form.carrierName = source?.label || val
        this.$emit('changeCarrier', source || '')
        this.$EventBus.$emit('carrierScac', val)
      }
    },
    // 预订处下拉
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
    // 初始化数据
    initData() {
      let carrierCode = this.$route.query.carrierCode
      let source = this.carrierList.find(
        (item) => item.baseCarrierCode === carrierCode
      )
      if (!source) {
        this.form.carrierScac = ''
        this.form.carrierName = ''
      } else {
        this.form.carrierScac = source.value
        this.form.carrierName = source.label
        this.changeCarrier(source.value)
        this.disabledCarrier = true
      }
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

<style lang="scss" scoped>
.overall-cnt {
  .el-select {
    width: 100%;
  }
  .form {
    padding: 8px 8px 20px;
    display: flex;
    justify-content: space-between;
    .el-form-item {
      width: 45%;
      vertical-align: bottom;
    }
    .small-label {
      margin-bottom: 0;
      .el-form-item__label {
        display: none;
      }
    }
    .showmore {
      color: #277ab5;
      cursor: pointer;
    }
  }
}
</style>
