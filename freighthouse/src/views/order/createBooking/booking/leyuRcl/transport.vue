<template>
  <div class="transport-cnt">
    <el-form
      :inline="true"
      :model="form"
      :rules="rules"
      class="form"
      label-position="top"
      ref="form"
      size="mini"
    >
      <el-form-item class="flex-item" label="Move Type" prop="transport">
        <el-select
          class="large-select"
          placeholder="Select One"
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
        label="Place of Carrier Receipt"
        prop="placeOfReceipt.locationCode"
      >
        <el-select
          :loading="loading"
          :remote-method="
            (query) => {
              getCityList(query, 1)
            }
          "
          class="large-select"
          filterable
          placeholder="Enter Location..."
          remote
          reserve-keyword
          size="mini"
          v-model="form.placeOfReceipt.locationCode"
          value-key="cityUnCode"
        >
          <el-option
            :key="item.cityUnCode"
            :label="`${item.cityName}, ${item.countryName} (${item.cityUnCode})`"
            :value="item"
            v-for="item in placeOfReceiptCityList"
          ></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item class="small-item" label="最早发运日期">
        <el-date-picker class="large-select" placeholder="选择日期" type="date" v-model="value1"></el-date-picker>
      </el-form-item>-->
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
          class="large-select"
          filterable
          placeholder="Enter Location..."
          remote
          reserve-keyword
          size="mini"
          v-model="form.placeOfDelivery.locationCode"
          value-key="cityUnCode"
        >
          <el-option
            :key="item.cityUnCode"
            :label="`${item.cityName}, ${item.countryName} (${item.cityUnCode})`"
            :value="item"
            v-for="item in placeOfDeliveryCityList"
          ></el-option>
        </el-select>
      </el-form-item>
      <!-- <el-form-item class="small-item" label="最晚交货日期">
        <el-date-picker class="large-select" placeholder="选择日期" type="date" v-model="value1"></el-date-picker>
      </el-form-item>-->
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
          class="large-select"
          filterable
          placeholder="Enter Location..."
          remote
          reserve-keyword
          size="mini"
          v-model="form.pol.locationCode"
          value-key="cityUnCode"
        >
          <el-option
            :key="item.cityUnCode"
            :label="`${item.cityName}, ${item.countryName} (${item.cityUnCode})`"
            :value="item"
            v-for="item in polCityList"
          ></el-option>
        </el-select>
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
          class="large-select"
          filterable
          placeholder="Enter Location..."
          remote
          reserve-keyword
          size="mini"
          v-model="form.pod.locationCode"
          value-key="cityUnCode"
        >
          <el-option
            :key="item.cityUnCode"
            :label="`${item.cityName}, ${item.countryName} (${item.cityUnCode})`"
            :value="item"
            v-for="item in podCityList"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item class="small-item" label="ETD" prop="etd">
        <!-- <span slot="label">ETD <el-button type="text" size="mini" @click="showSchedule"><i class="el-icon-search"></i> ship schedule</el-button></span> -->
        <el-date-picker
          class="large-select"
          placeholder="Select One"
          type="datetime"
          v-model="form.etd"
        ></el-date-picker>
      </el-form-item>
      <el-form-item class="small-item" label="ETA" prop="eta">
        <el-date-picker
          class="large-select"
          placeholder="Select One"
          type="datetime"
          v-model="form.eta"
        ></el-date-picker>
      </el-form-item>
      <el-form-item
        class="middle-item"
        label="Vessel"
        prop="transportDetail.vessel"
      >
        <el-input
          size="mini"
          placeholder="Enter vessel..."
          v-model="form.transportDetail.vessel"
        ></el-input>
      </el-form-item>
      <el-form-item
        class="small-item"
        label="Voyage"
        prop="transportDetail.voyage"
      >
        <el-input
          size="mini"
          v-model="form.transportDetail.voyage"
          placeholder="Enter voyage..."
        ></el-input>
      </el-form-item>
      <el-form-item class="middle-item" label="B/L Type" prop="blType">
        <el-select
          v-model="form.blType"
          placeholder="Select one"
          class="large-select"
        >
          <el-option
            :label="item.label"
            :value="item.value"
            v-for="item in blTypeList"
            :key="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        class="middle-item"
        label="B/L Release office"
        prop="releaseLocation.locationCode"
      >
        <el-select
          :loading="loading"
          :remote-method="
            (query) => {
              getCityList(query, 5)
            }
          "
          class="large-select"
          filterable
          placeholder="Enter Location..."
          remote
          reserve-keyword
          size="mini"
          v-model="form.releaseLocation.locationCode"
          value-key="cityUnCode"
        >
          <el-option
            :key="item.cityUnCode"
            :label="`${item.cityName}, ${item.countryName} (${item.cityUnCode})`"
            :value="item"
            v-for="item in releaseCityList"
          ></el-option>
        </el-select>
      </el-form-item>
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
  },
  data() {
    return {
      loading: false,
      form: {
        blType: '',
        transport: '',
        releaseLocation: {
          locationCode: '',
          locationName: '',
          country: '',
          countryCode: '',
        },
        placeOfDelivery: {
          locationCode: '',
          locationName: '',
          country: '',
          countryCode: '',
        },
        placeOfReceipt: {
          locationCode: '',
          locationName: '',
          country: '',
          countryCode: '',
        },
        etd: '',
        eta: '',
        pol: {
          locationCode: '',
          locationName: '',
          country: '',
          countryCode: '',
        },
        pod: {
          locationCode: '',
          locationName: '',
          country: '',
          countryCode: '',
        },
        transportDetail: {
          vessel: '',
          voyage: '',
        },
      },
      rules: {
        blType: {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        'releaseLocation.locationCode': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        transport: {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        'placeOfReceipt.locationCode': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        'placeOfDelivery.locationCode': {
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
        etd: {
          required: true,
          message: 'ETD is required',
          trigger: 'change',
        },
        'transportDetail.vessel': {
          required: true,
          message: ' Vessel is required',
          trigger: 'change',
        },
        'transportDetail.voyage': {
          required: true,
          message: 'Voyage is required',
          trigger: 'change',
        },
      },
      placeOfReceiptCityList: [],
      placeOfDeliveryCityList: [],
      polCityList: [],
      podCityList: [],
      releaseCityList: [],
      loading: false,
      dictList: [],
      descptList: [],
      blTypeList: [],
    }
  },
  created() {
    this.form = this.transportOption
  },
  watch: {
    dictAll: {
      handler(val) {
        if (val.dictList.length) {
          const source = val.dictList.filter(
            (item) => item.groupCode === 'leyu_transport'
          )[0]
          let descpts = [
            'CY-CY',
            'CY-DOOR',
            'CY-FREE OUT',
            'DOOR-CY',
            'DOOR-DOOR',
            'FREE IN-FREE OUT',
            'CY-BO',
          ]
          let dictItems = source.dictItems.filter((item) =>
            descpts.includes(item.descpt)
          )
          this.descptList = dictItems.map((item) => {
            const { descpt, itemCode } = item
            return {
              label: descpt,
              value: itemCode,
            }
          })
          const source2 = val.dictList.filter(
            (item) => item.groupCode === 'leyu_bl_type'
          )[0]
          let dictItems2 = source2.dictItems.filter(
            (item) => item.descpt !== 'TLX RELEASE'
          )
          this.blTypeList = dictItems2.map((item) => {
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
     // 查船期
    showSchedule () {
      this.$emit('showSchedule')
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
            let result = res.data || []
            if (type === 1) {
              this.placeOfReceiptCityList = result
            }
            if (type === 2) {
              this.placeOfDeliveryCityList = result
            }
            if (type === 3) {
              this.polCityList = result
            }
            if (type === 4) {
              this.podCityList = result
            }
            if (type === 5) {
              this.releaseCityList = result
            }
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
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
        } else {
          this.form.placeOfReceipt.locationCode = ''
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
        } else {
          this.form.placeOfDelivery.locationCode = ''
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
        } else {
          this.form.pol.locationCode = ''
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
        } else {
          this.form.pod.locationCode = ''
        }
      })
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
  updated() {
    this.$refs.form.clearValidate()
  },
}
</script>

<style lang="scss">
.transport-cnt {
  .form {
    padding: 8px 8px 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    .el-form-item {
      margin-bottom: 15px;
    }
  }
  .middle-item {
    width: 45%;
  }
  .small-item {
    width: 45%;
  }
  .flex-item {
    width: 100%;
  }
  .large-select {
    width: 100%;
  }
  .el-date-editor.el-input.el-input--prefix .el-input__inner {
    height: 22px;
    line-height: 22px;
    font-size: 12px;
  }
  .el-input__icon {
    line-height: 22px;
  }
}
</style>
