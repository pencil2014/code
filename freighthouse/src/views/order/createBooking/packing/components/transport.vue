<template>
  <div class="transports-cnt">
    <el-form
      :inline="true"
      :model="form"
      :rules="rules"
      class="form"
      label-position="top"
      ref="form"
      size="mini"
    >
      <div class="cnt-left">
        <!-- <el-form-item class="middle-item" label="Vessel" prop="transportDetail.vessel">
          <el-input size="mini" v-model="form.transportDetail.vessel"></el-input>
        </el-form-item>
        <el-form-item class="middle-item" label="Voyage" prop="transportDetail.voyage">
          <el-input size="mini" v-model="form.transportDetail.voyage"></el-input>
        </el-form-item>-->
        <el-form-item
          class="middle-item"
          label="Origin (Place of Carrier Receipt)"
          prop="placeOfReceipt.locationCode"
        >
          <el-select
            :loading="loading"
            :remote-method="
              (query) => {
                getCityList(query, 1)
              }
            "
            @change="
              (val) => {
                changeLocation(val, 'placeOfReceipt')
              }
            "
            class="large-select"
            filterable
            clearable
            placeholder="Enter Location..."
            remote
            reserve-keyword
            size="mini"
            v-model="form.placeOfReceipt.locationCode"
            value-key="cityUnCode"
          >
            <el-option
              :key="item.cityUnCode"
              :label="item.cityName ? `${item.cityName}, ${item.countryName} (${item.cityUnCode})` : ''"
              :value="item"
              v-for="item in placeOfReceiptCityList"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Print on B/L as">
          <el-input
            placeholder="Enter B/L Location Name..."
            v-model="form.placeOfReceipt.printName"
            :class="{ 'is-exceed': checkError(form.placeOfReceipt.printName)}"
          ></el-input>
          <p
            class="error-tips"
            v-show="checkError(form.placeOfReceipt.printName)"
          >
            This field can accept only 35 characters
          </p>
        </el-form-item>
        <el-form-item
          class="middle-item"
          label="Port of Load"
          prop="pol.locationCode"
        >
          <el-select
            :loading="loading"
            :remote-method="
              (query) => {
                getCityList(query, 3)
              }
            "
            @change="
              (val) => {
                changeLocation(val, 'pol')
              }
            "
            class="large-select"
            filterable
            clearable
            placeholder="Enter Location..."
            remote
            reserve-keyword
            size="mini"
            v-model="form.pol.locationCode"
            value-key="cityUnCode"
          >
            <el-option
              :key="item.cityUnCode"
              :label="item.cityName ? `${item.cityName}, ${item.countryName} (${item.cityUnCode})` : ''"
              :value="item"
              v-for="item in polCityList"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Print on B/L as">
          <el-input
            placeholder="Enter B/L Location Name..."
            v-model="form.pol.printName"
            :class="{ 'is-exceed': checkError(form.pol.printName) }"
          ></el-input>
          <p class="error-tips" v-show="checkError(form.pol.printName)">
            This field can accept only 35 characters
          </p>
        </el-form-item>
        <el-form-item
          class="middle-item"
          label="Port of Discharge"
          prop="pod.locationCode"
        >
          <el-select
            :loading="loading"
            :remote-method="
              (query) => {
                getCityList(query, 4)
              }
            "
            @change="
              (val) => {
                changeLocation(val, 'pod')
              }
            "
            class="large-select"
            filterable
            clearable
            placeholder="Enter Location..."
            remote
            reserve-keyword
            size="mini"
            v-model="form.pod.locationCode"
            value-key="cityUnCode"
          >
            <el-option
              :key="item.cityUnCode"
              :label="item.cityName ? `${item.cityName}, ${item.countryName} (${item.cityUnCode})` : ''"
              :value="item"
              v-for="item in podCityList"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Print on B/L as">
          <el-input
            placeholder="Enter B/L Location Name..."
            v-model="form.pod.printName"
            :class="{ 'is-exceed': checkError(form.pod.printName)}"
          ></el-input>
          <p class="error-tips" v-show="checkError(form.pod.printName)">
            This field can accept only 35 characters
          </p>
        </el-form-item>
        <el-form-item
          class="middle-item"
          label="Place of Carrier Delivery"
          prop="placeOfDelivery.locationCode"
        >
          <el-select
            :loading="loading"
            :remote-method="
              (query) => {
                getCityList(query, 2)
              }
            "
            @change="
              (val) => {
                changeLocation(val, 'placeOfDelivery')
              }
            "
            class="large-select"
            filterable
            clearable
            placeholder="Enter Location..."
            remote
            reserve-keyword
            size="mini"
            v-model="form.placeOfDelivery.locationCode"
            value-key="cityUnCode"
          >
            <el-option
              :key="item.cityUnCode"
              :label="item.cityName ? `${item.cityName}, ${item.countryName} (${item.cityUnCode})` : ''"
              :value="item"
              v-for="item in placeOfDeliveryCityList"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Print on B/L as">
          <el-input
            placeholder="Enter B/L Location Name..."
            v-model="form.placeOfDelivery.printName"
            :class="{ 'is-exceed': checkError(form.placeOfDelivery.printName)}"
          ></el-input>
          <p
            class="error-tips"
            v-show="checkError(form.placeOfDelivery.printName)"
          >
            This field can accept only 35 characters
          </p>
        </el-form-item>
      </div>
      <div class="cnt-right">
        <el-form-item class="flex-item" label="Move Type" prop="transport">
          <el-select
            class="large-select"
            placeholder="Select One"
            clearable
            size="mini"
            v-model="form.transport"
          >
            <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in descptList"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          class="middle-item"
          label="Vessel"
          prop="transportDetail.vessel"
        >
          <el-input
            size="mini"
            v-model="form.transportDetail.vessel"
            placeholder="enter vessel..."
          ></el-input>
        </el-form-item>
        <el-form-item
          class="middle-item"
          label="Voyage"
          prop="transportDetail.voyage"
        >
          <el-input
            size="mini"
            v-model="form.transportDetail.voyage"
            placeholder="Enter voyage ..."
          ></el-input>
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
    transportOption: {
      required: true,
      type: Object,
      default: () => {},
    },
    carrierScac: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      form: {
        transport: '',
        transportDetail: {
          vessel: '',
          voyage: '',
        },
        placeOfDelivery: {
          locationCode: '',
          locationName: '',
          country: '',
          countryCode: '',
          printName: '',
        },
        placeOfReceipt: {
          locationCode: '',
          locationName: '',
          country: '',
          countryCode: '',
          printName: '',
        },
        pol: {
          locationCode: '',
          locationName: '',
          country: '',
          countryCode: '',
          printName: '',
        },
        pod: {
          locationCode: '',
          locationName: '',
          country: '',
          countryCode: '',
          printName: '',
        },
      },
      rules: {
        'placeOfDelivery.locationCode': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        'placeOfReceipt.locationCode': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        'pol.locationCode': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        'pod.locationCode': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        transport: {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        'transportDetail.vessel': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        'transportDetail.voyage': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
      },
      descptList: [],
      placeOfReceiptCityList: [],
      placeOfDeliveryCityList: [],
      polCityList: [],
      podCityList: [],
      loading: false,
      receiptName: '',
      polName: '',
      podName: '',
      deliveryName: '',
    }
  },
  created() {
    this.form = this.transportOption
  },
  methods: {
    checkError (str) {
      return str.length > 35 && this.carrierScac === 'CMDU'
    },
    // 港口下拉
    getCityList(str = '', type) {
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
            if (type === 1) {
              this.placeOfReceiptCityList = res.data || []
            }
            if (type === 2) {
              this.placeOfDeliveryCityList = res.data || []
            }
            if (type === 3) {
              this.polCityList = res.data || []
            }
            if (type === 4) {
              this.podCityList = res.data || []
            }
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
    // 选择pod、pol、origin、delivery
    changeLocation(val, Type) {
      if (typeof val === 'object') {
        const { cityName, countryName } = val
        this.form[Type].printName = `${cityName}, ${countryName}`
      }
    },
    // 初始化数据
    initData() {
      let shipmentId = this.$route.query.shipmentId
      if (shipmentId) {
        this.placeOfReceiptCityList = [this.form.placeOfReceipt.locationCode]
        this.placeOfDeliveryCityList = [this.form.placeOfDelivery.locationCode]
        this.polCityList = [this.form.pol.locationCode]
        this.podCityList = [this.form.pod.locationCode]
        return 
      }
      const data1 = {
        basePortCode: this.form.placeOfReceipt.locationCode,
        carrierSource: this.carrierSource,
      }
      cityList(data1).then((res) => {
        if (res.code === 0 && res.data?.length === 1) {
          this.placeOfReceiptCityList = res.data
          this.form.placeOfReceipt.locationCode = res.data[0]
          this.changeLocation(res.data[0], 'placeOfReceipt')
        } else {
          this.form.placeOfReceipt.locationCode = ' '
        }
      })
      const data2 = {
        basePortCode: this.form.placeOfDelivery.locationCode,
        carrierSource: this.carrierSource,
      }
      cityList(data2).then((res) => {
        if (res.code === 0 && res.data?.length === 1) {
          this.placeOfDeliveryCityList = res.data
          this.form.placeOfDelivery.locationCode = res.data[0]
          this.changeLocation(res.data[0], 'placeOfDelivery')
        } else {
          this.form.placeOfDelivery.locationCode = ' '
        }
      })
      const data3 = {
        basePortCode:  this.form.pol.locationCode,
        carrierSource: this.carrierSource,
      }
      cityList(data3).then((res) => {
        if (res.code === 0 && res.data?.length === 1) {
          this.polCityList = res.data
          this.form.pol.locationCode = res.data[0]
          this.changeLocation(res.data[0], 'pol')
        } else {
          this.form.pol.locationCode = ' '
        }
      })
      const data4 = {
        basePortCode: this.form.pod.locationCode,
        carrierSource: this.carrierSource,
      }
      cityList(data4).then((res) => {
        if (res.code === 0 && res.data?.length === 1) {
          this.podCityList = res.data
          this.form.pod.locationCode = res.data[0]
          this.changeLocation(res.data[0], 'pod')
        } else {
          this.form.pod.locationCode = ' '
        }
      })
    },
  },
  watch: {
    dictAll: {
      handler(val) {
        if (val.dictList.length) {
          const source = val.dictList.filter(
            (item) => item.groupCode === 'inttra_transport'
          )[0]
          this.descptList = source.dictItems.map((item) => {
            const { descpt, itemCode } = item
            return {
              label: descpt,
              value: itemCode,
            }
          })
        }
      },
      deep: true,
    },
  },
}
</script>

<style lang="scss">
.transports-cnt {
  .form {
    display: flex;
    .cnt-left {
      padding: 8px;
      width: 70%;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      .el-form-item {
        width: 48%;
        .error-tips {
          color: red;
          font-size: 12px;
          line-height: 12px;
        }
      }
    }
    .cnt-right {
      padding: 8px;
      width: 30%;
      border-left: 1px solid #e3e3e3;
      background-color: #fff;
      .el-form-item {
        width: 100%;
      }
    }
  }
}
</style>
