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
        <el-form-item label="Print on B/L as" 
          prop="placeOfReceipt.printName"
          >
          <el-input
            placeholder="Enter B/L Location Name..."
            v-model="form.placeOfReceipt.printName"
            :class="{ 'is-exceed': checkError(form.placeOfReceipt.printName, 'placeOfReceipt.printName')}"
          ></el-input>
          <p
            class="error-tips"
            v-show="checkError(form.placeOfReceipt.printName, 'placeOfReceipt.printName')"
          >
            {{ getErrTip('placeOfReceipt.printName') }}
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
        <el-form-item label="Print on B/L as" prop="pol.printName">
          <el-input
            placeholder="Enter B/L Location Name..."
            v-model="form.pol.printName"
            :class="{ 'is-exceed': checkError(form.pol.printName, 'pol.printName') }"
          ></el-input>
          <p class="error-tips" v-show="checkError(form.pol.printName, 'pol.printName')">
            {{ getErrTip('pol.printName') }}
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
        <el-form-item label="Print on B/L as" prop="pod.printName" >
          <el-input
            placeholder="Enter B/L Location Name..."
            v-model="form.pod.printName"
            :class="{ 'is-exceed': checkError(form.pod.printName, 'pod.printName')}"
          ></el-input>
          <p class="error-tips" v-show="checkError(form.pod.printName, 'pod.printName')">
            {{ getErrTip('pod.printName') }}
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
        <el-form-item label="Print on B/L as"  prop="placeOfDelivery.printName">
          <el-input
            placeholder="Enter B/L Location Name..."
            v-model="form.placeOfDelivery.printName"
            :class="{ 'is-exceed': checkError(form.placeOfDelivery.printName, 'placeOfDelivery.printName')}"
          ></el-input>
          <p
            class="error-tips"
            v-show="checkError(form.placeOfDelivery.printName, 'placeOfDelivery.printName')"
          >
            {{ getErrTip('placeOfDelivery.printName') }}
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
              v-for="item in transportList"
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
        <template v-if="showMore">
          <template v-if="form.pod.locationCode.countryCode === 'IN'">
            <el-form-item
              class="middle-item"
              label="Import Export Code (IEC)"
              prop="indiaData.iecCode"
            >
              <el-input
                size="mini"
                v-model="form.indiaData.iecCode"
                placeholder="Enter Import Export Code (IEC) ..."
              ></el-input>
            </el-form-item>
            <el-form-item
              class="middle-item"
              label="Permanent Account Number of Shipper/Consignor (PAS)"
              prop="indiaData.pasNo"
            >
              <el-input
                size="mini"
                v-model="form.indiaData.pasNo"
                placeholder="Enter Permanent Account Number of Shipper/Consignor (PAS) ..."
              ></el-input>
            </el-form-item>
            <el-form-item
              class="middle-item"
              label="Permanent Account Number of Consignee (PAC)"
              prop="indiaData.pacNo"
            >
              <el-input
                size="mini"
                v-model="form.indiaData.pacNo"
                placeholder="Enter Permanent Account Number of Consignee (PAC) ..."
              ></el-input>
            </el-form-item>
            <el-form-item
              class="middle-item"
              label="Permanent Account Number of Notify party (PAN)"
              prop="indiaData.panNo"
            >
              <el-input
                size="mini"
                v-model="form.indiaData.panNo"
                placeholder="Enter Permanent Account Number of Notify party (PAN) ..."
              ></el-input>
            </el-form-item>
            <el-form-item
              class="middle-item"
              label="Goods Service Tax Identification Number (GST)"
              prop="indiaData.gstNo"
            >
              <el-input
                size="mini"
                v-model="form.indiaData.gstNo"
                placeholder="Enter Goods Service Tax Identification Number (GST) ..."
              ></el-input>
            </el-form-item>
            <el-form-item
              class="middle-item"
              label="Invoice Currency Code (ICC)"
              prop="indiaData.ivc"
            >
              <el-input
                size="mini"
                v-model="form.indiaData.ivc"
                placeholder="Enter Invoice Currency Code (ICC) ..."
              ></el-input>
            </el-form-item>
            <el-form-item
              class="middle-item"
              label="Invoice Value (IVC)"
              prop="indiaData.icc"
            >
              <el-input
                size="mini"
                v-model="form.indiaData.icc"
                placeholder="Enter Invoice Value (IVC) ..."
              ></el-input>
            </el-form-item>
          </template>
          <template v-if="form.pod.locationCode.countryCode === 'EG'">
            <el-form-item
              class="middle-item"
              label="ACID Number"
              prop="egyptData.acidNo"
            >
              <el-input
                size="mini"
                v-model="form.egyptData.acidNo"
                placeholder="Enter ACID Number ..."
              ></el-input>
            </el-form-item>
            <el-form-item
              class="middle-item"
              label="Importer Taxation Number"
              prop="egyptData.imTaxationNo"
            >
              <el-input
                size="mini"
                v-model="form.egyptData.imTaxationNo"
                placeholder="Enter Importer Taxation Number ..."
              ></el-input>
            </el-form-item>
            <el-form-item
              class="middle-item"
              label="Exporter Registration Number"
              prop="egyptData.exRegNo"
            >
              <el-input
                size="mini"
                v-model="form.egyptData.exRegNo"
                placeholder="Enter Exporter Registration Number ..."
              ></el-input>
            </el-form-item>
            <el-form-item
              class="middle-item"
              label="Exporter VAT number"
              prop="egyptData.exVatNo"
            >
              <el-input
                size="mini"
                v-model="form.egyptData.exVatNo"
                placeholder="Enter Exporter VAT number ..."
              ></el-input>
            </el-form-item>
            <el-form-item
              class="middle-item"
              label="Exporter Registration Country Code"
              prop="egyptData.exRegCountryCode"
            >
              <el-input
                size="mini"
                v-model="form.egyptData.exRegCountryCode"
                placeholder="Enter Exporter Registration Country Code ..."
              ></el-input>
            </el-form-item>
          </template>
          <template v-if="['US', 'CA'].includes(form.pod.locationCode.countryCode)">
            <el-form-item
              class="middle-item"
              label="SCAC code of Shipper (NVOCC)"
              prop="usData.scacCode"
            >
              <el-input
                size="mini"
                v-model="form.usData.scacCode"
                placeholder="Enter SCAC code of Shipper (NVOCC) ..."
              ></el-input>
            </el-form-item>
            <el-form-item
              class="middle-item"
              label="Email address of Shipper (NVOCC)"
              prop="usData.nvoccEmail"
            >
              <el-input
                size="mini"
                v-model="form.usData.nvoccEmail"
                placeholder="Enter Email address of Shipper (NVOCC) ..."
              ></el-input>
            </el-form-item>
            <el-form-item
              class="middle-item"
              label="AES ITN # / CAED #"
              prop="usData.itn"
            >
              <el-input
                size="mini"
                v-model="form.usData.itn"
                placeholder="Enter AES ITN # / CAED # ..."
              ></el-input>
            </el-form-item>
          </template>
        </template>
        <div v-if="['IN', 'EG', 'US', 'CA'].includes(form.pod.locationCode.countryCode)" @click="showMore = !showMore" class="showmore">
          <i class="el-icon-arrow-down" v-if="!showMore"></i>
          <i class="el-icon-arrow-up" v-else></i>
          {{ !showMore ? 'More' : 'Hide' }}
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
import { cityList } from '@/api/order/createBooking'
import { mapState } from 'vuex'
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
        transport: '',
        transportDetail: {
          vessel: '',
          voyage: '',
        },
        indiaData: {
          iecCode: '',
          pasNo: '',
          pacNo: '',
          panNo: '',
          gstNo: '',
          ivc: '',
          icc: '',
        },
        egyptData: {
          acidNo: '',
          imTaxationNo: '',
          exRegNo: '',
          exVatNo: '',
          exRegCountryCode: '',
        },
        usData: {
          scacCode: '',
          nvoccEmail: '',
          itn: '',
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
      rules: Object.assign(this.fieldConfigObj, {
       'placeOfDelivery.locationCode': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        'placeOfDelivery.printName': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        'placeOfReceipt.locationCode': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        'placeOfReceipt.printName': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        'pol.locationCode': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        'pol.printName': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        'pod.locationCode': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        'pod.printName': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
       }
      ),
      descptList: [],
      placeOfReceiptCityList: [],
      placeOfDeliveryCityList: [],
      polCityList: [],
      podCityList: [],
      transportList: [],
      loading: false,
      receiptName: '',
      polName: '',
      podName: '',
      deliveryName: '',
      showMore: false,
    }
  },
  created() {
    this.form = this.transportOption
    this.transportList = this.dictMap.shipTerms
    if (this.transportList.every(item => item.value !== this.form.transport)) {
      this.form.transport = ''
    }
  },
  computed: {
    ...mapState({
       dictMap: state => state.dict.dictMap,
    })
  },
  methods: {
    checkError (str, fieldName) {
      let fieldConfig = this.fieldConfigList.find(item => {
        return item.fieldName === fieldName
      }) || {}
      let num = fieldConfig.maxLength || null
      return str && num && (str.length > num)
    },
    getErrTip(fieldName) {
      let fieldConfig = this.fieldConfigList.find(item => {
        return item.fieldName === fieldName
      }) || {}
      let num = fieldConfig.maxLength || null
      if (num) {
         return `This field can accept only ${num} characters`
      }
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
    initData(isDetail) {
      if (isDetail) {
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
    .showmore {
      width: 100%;
      margin: 10px;
      color: #277ab5;
      cursor: pointer;
    }
  }
}
</style>
