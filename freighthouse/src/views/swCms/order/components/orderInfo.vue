<template>
  <div class="order-info">
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      inline
      label-width="110px"
      class="order-form"
      size="mini"
      :disabled="type === 'info'"
    >
      <div class="item-box large-item">
        <div class="title">港口信息</div>
        <el-form-item label="驳船收货地" prop="voyage.porPortCode">
          <el-select
            v-model="form.voyage.porPortCode"
            filterable
            clearable
            placeholder="请选择"
            remote
            :remote-method="feederSearch"
            @change="(val) => changePort(val, 'porPort')"
            disabled
          >
            <el-option
              v-for="item in porPortList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="大船起运港" prop="voyage.polPortCode">
          <el-select
            v-model="form.voyage.polPortCode"
            filterable
            clearable
            placeholder="请选择"
            remote
            :remote-method="polSearch"
            @change="(val) => changePort(val, 'polPort')"
            disabled
          >
            <el-option
              v-for="item in polPortList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="卸货港" prop="voyage.unloadingPortCode">
          <el-select
            v-model="form.voyage.unloadingPortCode"
            filterable
            clearable
            placeholder="请选择"
            remote
            :remote-method="unloadingPortSearch"
            @change="(val) => changePort(val, 'unloadingPort')"
            disabled
          >
            <el-option
              v-for="item in unloadingPortList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="目的港" prop="voyage.podPortCode">
          <el-select
            v-model="form.voyage.podPortCode"
            filterable
            clearable
            placeholder="请选择"
            remote
            :remote-method="podSearch"
            @change="(val) => changePort(val, 'podPort')"
            disabled
          >
            <el-option
              v-for="item in podPortList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="系统航线" prop="voyage.sysLineCode">
          <el-select
            v-model="form.voyage.sysLineCode"
            filterable
            clearable
            placeholder="请选择"
            remote
            :remote-method="sysLineQuery"
            @change="changeSysLine"
            disabled
          >
            <el-option
              v-for="item in sysLineList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </div>
      <div class="item-box large-item">
        <div class="title">船司信息</div>
        <el-form-item label="船司" prop="voyage.shipCarrierCode">
          <el-select
            v-model="form.voyage.shipCarrierCode"
            filterable
            clearable
            placeholder="请选择"
            remote
            :remote-method="shipQuery"
            disabled
          >
            <el-option
              v-for="item in shipList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="大船截关时间" prop="voyage.cyCutOff">
          <el-date-picker
            v-model="form.shipowner.cyCutOff"
            type="date"
            placeholder="请选择"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="大船开船时间" prop="voyage.etdTime">
          <el-date-picker
            v-model="form.shipowner.etdTime"
            type="date"
            placeholder="请选择"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="驳船截关时间" prop="shipowner.bargeCyCutOff" v-if="form.voyage.porPortCode">
          <el-date-picker
            v-model="form.shipowner.bargeCyCutOff"
            type="date"
            placeholder="请选择"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="驳船预计开船时间" prop="shipowner.bargeEtdTime" v-if="form.voyage.porPortCode">
          <el-date-picker
            v-model="form.shipowner.bargeEtdTime"
            type="date"
            placeholder="请选择"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
      </div>
      <div class="item-box large-item">
        <div class="title">货运信息</div>
        <el-form-item label="运输条款" prop="transport.transportTerm">
          <el-select
            v-model="form.transport.transportTerm"
            clearable
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="(item, index) in dictMap['shipTerms']"
              :label="item.label"
              :value="item.value"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="出单方式" prop="transport.blMode">
          <el-select v-model="form.transport.blMode" clearable filterable placeholder="请选择">
            <el-option
              v-for="(item, index) in dictMap['blMode']"
              :label="item.label"
              :value="item.value"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="提单类型" prop="transport.blType">
          <el-select v-model="form.transport.blType" clearable filterable placeholder="请选择">
            <el-option
              v-for="(item, index) in dictMap['blType']"
              :label="item.label"
              :value="item.value"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>
      </div>
      <div class="item-box flex-box small-item">
        <div class="title">
          <span>箱型信息</span>
          <p @click="showContainer = !showContainer" v-if="showContainer">收起<i class="el-icon-arrow-up"></i></p>
          <p @click="showContainer = !showContainer" v-else>展开<i class="el-icon-arrow-down"></i></p>
        </div>
        <Transition name="fade" mode="out-in">
          <div class="outer-box" v-show="showContainer">
            <div class="container-box" v-for="(item, index) in form.containers" :key="index">
              <div class="small-box">
                <el-form-item
                  label="箱型"
                  :prop="`containers.${index}.containerType`"
                  :rules="{ required: true, message: ' ', trigger: 'change' }"
                >
                  <el-select v-model="item.containerType" clearable filterable placeholder="请选择">
                    <el-option
                      v-for="(item, index) in dictMap['containerType'].filter(item => item.value !=='40NOR')"
                      :label="item.label"
                      :value="item.value"
                      :key="index"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item
                  label="箱量"
                  :prop="`containers.${index}.containerNum`"
                  :rules="{ required: true, message: ' ', trigger: 'change' }"
                >
                  <el-input v-model="item.containerNum" clearable placeholder="请填写" oninput ="value=value.replace(/[^0-9]/g,'')"></el-input>
                </el-form-item>
                <el-form-item
                  label="单柜重量"
                  :prop="`containers.${index}.weight`"
                  :rules="{ required: true, message: ' ', trigger: 'change' }"
                >
                  <el-input v-model="item.weight" placeholder="请填写" clearable oninput ="value=value.replace(/[^0-9.]/g,'')"
                    ><template slot="append">KGS</template></el-input
                  >
                </el-form-item>
                <el-form-item label="单柜体积" prop="volume">
                  <el-input v-model="item.volume" placeholder="请填写" clearable oninput ="value=value.replace(/[^0-9.]/g,'')"
                    ><template slot="append">CBM</template></el-input
                  >
                </el-form-item>
                <el-form-item
                  label="是否重柜"
                  :prop="`containers.${index}.isHeavy`"
                  :rules="{ required: true, message: ' ', trigger: 'change' }"
                >
                  <el-select v-model="item.isHeavy" clearable filterable placeholder="请选择">
                    <el-option
                      v-for="(item, index) in dictMap['yesNo']"
                      :label="item.label"
                      :value="item.value"
                      :key="index"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </div>
              <div class="btn-box" v-show="type === 'edit'">
                <i class="el-icon-circle-plus plus" v-if="index === 0" @click="addContainer"></i>
                <i class="el-icon-remove remove" v-else @click="removeContainer(index)"></i>
              </div>
            </div>

            <div class="total-box">
              <p>箱型箱量合计：{{ totalContainer }}</p>
              <!-- <p>件数合计：{{ totalNumber }}</p> -->
              <p>重量合计：{{ totalWeight.toFixed(2) }} KGS</p>
              <p>体积合计：{{ totalVolume.toFixed(2) }} CMB</p>
            </div>
          </div>
        </Transition>
      </div>
      <div class="item-box flex-box small-item">
        <div class="title">
          <span>货物信息</span>
          <p @click="showCargos = !showCargos" v-if="showCargos">收起<i class="el-icon-arrow-up"></i></p>
          <p @click="showCargos = !showCargos" v-else>展开<i class="el-icon-arrow-down"></i></p>
        </div>
        <Transition name="fade" mode="out-in">
          <div class="outer-box" v-show="showCargos">
            <div class="container-box" v-for="(item, i) in form.cargos" :key="i" :class="{'border': i != form.cargos.length - 1}">
              <div class="small-box">
                <el-form-item
                  label="货品分类"
                  :prop="`cargos.${i}.commodityTypeCode`"
                  :rules="{ required: true, message: ' ', trigger: 'change' }"
                >
                  <el-select
                    v-model="item.commodityTypeCode"
                    placeholder="请选择"
                    filterable
                    clearable
                  >
                    <el-option
                      v-for="(item, index) in commodityTypeCodeOptions"
                      :key="index"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>

                <el-form-item
                  label="HS Code"
                  :prop="`cargos.${i}.hscode`"
                  :rules="{ required: true, message: ' ', trigger: 'change' }"
                >
                  <!-- <el-input v-model="item.hscode" placeholder="请填写"></el-input> -->
                  <el-select
                    v-model="item.hscode"
                    placeholder="请选择"
                    remote
                    :remote-method="getHscode"
                    filterable
                    clearable
                    @visible-change="getHscode(' ')"
                  >
                    <el-option
                      v-for="(item, index) in hscodeList"
                      :key="index"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item
                  label="中文品名"
                  :prop="`cargos.${i}.cname`"
                  :rules="{ required: true, message: ' ', trigger: 'change' }"
                >
                  <el-input v-model="item.cname" clearable placeholder="请填写"></el-input>
                </el-form-item>
                <el-form-item
                  label="英文品名"
                  :prop="`cargos.${i}.ename`"
                  :rules="{ required: true, message: ' ', trigger: 'change' }"
                >
                  <el-input v-model="item.ename" clearable placeholder="请填写"></el-input>
                </el-form-item>
                <el-form-item
                  label="货物性质"
                  :prop="`cargos.${i}.property`"
                  :rules="{ required: true, message: ' ', trigger: 'change' }"
                >
                  <el-select v-model="item.property" clearable filterable placeholder="请选择">
                    <el-option
                      v-for="(item, index) in dictMap['cargoProperty']"
                      :label="item.label"
                      :value="item.value"
                      :key="index"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <template v-if="item.property === 'dangerous'">
                  <el-form-item label="危险品级别" prop="dangerousGrade">
                    <el-select v-model="item.dangerousGrade" clearable placeholder="请选择危险等级">
                      <el-option
                        v-for="(item, index) in dictMap.dangerousGrade"
                        :key="index"
                        :label="item.label"
                        :value="item.value"
                      >
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="国危编码" prop="dangerousCode">
                    <!-- <el-input v-model="item.dangerousCode"></el-input> -->
                    <el-select
                      v-model="item.dangerousCode"
                      placeholder="请选择"
                      remote
                      :remote-method="getUnno"
                      filterable
                      clearable
                      @visible-change="getUnno(' ')"
                    >
                      <el-option
                        v-for="(item, index) in unnoList"
                        :key="index"
                        :label="item.label"
                        :value="item.value"
                      >
                      </el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="包装组别" prop="packageGroup">
                    <el-input v-model="item.packageGroup" clearable></el-input>
                  </el-form-item>
                </template>
                <!-- <el-form-item label="货好时间" prop="cargoReadyTime">
                  <el-date-picker
                    v-model="item.cargoReadyTime"
                    type="date"
                    placeholder="请选择"
                    value-format="yyyy-MM-dd"
                  ></el-date-picker>
                </el-form-item> -->
                <el-form-item label="装箱要求" prop="boxRemark">
                  <el-input v-model="item.boxRemark" clearable placeholder="请填写"></el-input>
                  <!-- <el-select v-model="item.boxRemark" clearable filterable placeholder="请选择">
                    <el-option
                      v-for="(item, index) in dictMap['boxRemark']"
                      :label="item.label"
                      :value="item.value"
                      :key="index"
                    ></el-option>
                  </el-select> -->
                </el-form-item>
              </div>
              <div class="btn-box" v-show="type === 'edit'">
                <i class="el-icon-circle-plus plus" v-if="i === 0" @click="addCargo"></i>
                <i class="el-icon-remove remove" v-else @click="removeCargo(i)"></i>
              </div>
            </div>
          </div>
        </Transition>
      </div>
      <div class="item-box flex-box">
        <div class="title">
          <span>物流信息</span>
          <p @click="showTransport = !showTransport" v-if="showTransport">收起<i class="el-icon-arrow-up"></i></p>
          <p @click="showTransport = !showTransport" v-else>展开<i class="el-icon-arrow-down"></i></p>
        </div>
        <Transition name="fade" mode="out-in">
          <div class="transport-box" v-show="showTransport">
            <el-form-item label="Shipper(发货人)" prop="transport.shipper">
              <el-input
                type="textarea"
                v-model="form.transport.shipper"
                maxlength="500"
                show-word-limit
                :autosize="{ minRows: 4, maxRows: 4 }"
                resize="none"
                disabled
              ></el-input>
            </el-form-item>
            <el-form-item label="Consignee(收货人)" prop="transport.consignee">
              <el-input
                type="textarea"
                v-model="form.transport.consignee"
                maxlength="500"
                show-word-limit
                :autosize="{ minRows: 4, maxRows: 4 }"
                resize="none"
                disabled
              ></el-input>
            </el-form-item>
            <el-form-item label="Notify Party(通知人)" prop="transport.notify">
              <el-input
                type="textarea"
                v-model="form.transport.notify"
                maxlength="500"
                show-word-limit
                :autosize="{ minRows: 4, maxRows: 4 }"
                resize="none"
                disabled
              ></el-input>
            </el-form-item>
          </div>
        </Transition>
      </div>
    </el-form>
    <div class="table-box">
      <p class="total">
        总费用: <b class="currency">RMB</b><b class="number">{{ fee.totalFee || 0 }}</b>
      </p>
      <p class="detail">
        <span v-if="fee.seaFreightFee"
          >海运费: {{ fee.seaFreightFeeCurrency }} {{ fee.seaFreightFee }}</span
        ><span v-if="fee.additionalFee"
          >附加费: {{ fee.additionalFeeCurrency }} {{ fee.additionalFee }}</span
        >
        <el-button type="text" size="mini" @click="showTable = !showTable" v-if="!showTable"
          >展开详情<i class="el-icon-arrow-down"></i
        ></el-button>
        <el-button type="text" size="mini" @click="showTable = !showTable" v-else
          >收起详情<i class="el-icon-arrow-up"></i
        ></el-button>
      </p>
      <Transition name="fade" mode="out-in">
        <FinanceTableMass :option="option1" v-show="showTable" />
      </Transition>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { cargoHscodeList, cargoUnnoList, cargoTypeList } from '@/api/base'
export default {
  props: {
    dataSource: {
      type: Object,
      default: () => {},
    },
    type: {
      type: String,
      default: 'info',
    },
  },
  components: {
    FinanceTableMass,
  },
  mixins: [mixin],
  data() {
    return {
      option1: {},
      isEdit: false,
      form: {
        voyage: {},
        shipowner: {},
        containers: [
          {
            containerNo: '',
            containerNum: '',
            containerType: '',
            isHeavy: '',
            volume: '',
            weight: '',
            cargoReadyTime: '',
          },
        ],
        cargos: [
          {
            boxRemark: '',
            cargoNo: '',
            cargoReadyTime: '',
            cname: '',
            commodityTypeCode: '',
            dangerousCode: '',
            dangerousGrade: '',
            ename: '',
            hscode: '',
            packageGroup: '',
            property: '',
          },
        ],
        transport: {},
      },
      rules: {
        // voyage: {
        //   porPortCode: { required: true, message: ' ', trigger: 'change' },
        //   polPortCode: { required: true, message: ' ', trigger: 'change' },
        //   unloadingPortCode: { required: true, message: ' ', trigger: 'change' },
        //   podPortCode: { required: true, message: ' ', trigger: 'change' },
        //   sysLineCode: { required: true, message: ' ', trigger: 'change' },
        //   shipCarrierCode: { required: true, message: ' ', trigger: 'change' },
        //   cyCutOff: { required: true, message: ' ', trigger: 'change' },
        //   etdTime: { required: true, message: ' ', trigger: 'change' },
        // },
        transport: {
          transportTerm: { required: true, message: ' ', trigger: 'change' },
          blMode: { required: true, message: ' ', trigger: 'change' },
          blType: { required: true, message: ' ', trigger: 'change' },
        },
        shipowner: {
          bargeEtdTime: {required: true, message: ' ', trigger: 'change'}
        }
      },
      totalContainer: '',
      totalNumber: 0,
      totalWeight: 0,
      totalVolume: 0,
      porPortList: [],
      polPortList: [],
      podPortList: [],
      unloadingPortList: [],
      sysLineList: [],
      shipList: [],
      showTransport: true,
      showContainer: true,
      showCargos: true,
      fee: {},
      showTable: false,
      hscodeList: [],
      unnoList: [],
      commodityTypeCodeOptions: []
    }
  },
  created() {
    this.getCommodityType()
    let data = this.dataSource
    if (!data.containers?.length) {
      delete data.containers
    }
    if (!data.cargos?.length) {
      delete data.cargos
    }
    Object.assign(this.form, data)
    this.fee = data.fee || {}
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [],
      columns: [
        {
          prop: 'chargeCode',
          label: '费用编码',
          type: 'text',
        },
        {
          prop: 'chargeName',
          label: '费用名称',
          type: 'text',
          formatter: ({ row }) => {
            let { chargeName, chargeEname } = row
            return `${chargeName}(${chargeEname})`
          },
        },
        {
          prop: 'rateUnit',
          label: '单位',
          type: 'select',
          propInDict: 'rateUnit',
        },
        {
          prop: 'priceGp20',
          label: '20GP',
          type: 'text',
          formatter: ({ cellValue, row }) => {
            let { currency, num20Gp } = row
            return num20Gp ? `${currency} ${cellValue.toFixed(2)} * ${num20Gp}` : 0
          },
        },
        {
          prop: 'priceGp40',
          label: '40GP',
          type: 'text',
          formatter: ({ cellValue, row }) => {
            let { currency, num40Gp } = row
            return num40Gp ? `${currency} ${cellValue.toFixed(2)} * ${num40Gp}` : 0
          },
        },
        {
          prop: 'priceHq40',
          label: '40HQ',
          type: 'text',
          formatter: ({ cellValue, row }) => {
            let { currency, num40Hq } = row
            return num40Hq ? `${currency} ${cellValue.toFixed(2)} * ${num40Hq}` : 0
          },
        },
        {
          prop: 'priceHq45',
          label: '45HQ',
          type: 'text',
          formatter: ({ cellValue, row }) => {
            let { currency, num45Hq } = row
            return num45Hq ? `${currency} ${cellValue.toFixed(2)} * ${num45Hq}` : 0
          },
        },
        {
          prop: 'price',
          label: '单票价格',
          type: 'text',
          formatter: ({ cellValue, row }) => {
            let { currency } = row
            return `${currency} ${cellValue.toFixed(2)}`
          },
        },
      ],
      tips: {
        text: '',
        show: false,
      },
      selection: false,
      operationBtns: false,
      pagination: false,
    })
    this.option1.data = data.fee?.chargeList || []
  },
  computed: {
    ...mapGetters(['dictMap']),
  },
  watch: {
    'form.containers': {
      handler(val) {
        this.totalNumber = 0
        this.totalWeight = 0
        this.totalVolume = 0
        if (val) {
          let str = []
          val.forEach((item) => {
            let { containerType, containerNum, weight, volume } = item
            str.push(`${containerType.toUpperCase()}*${containerNum}`)
            this.totalNumber += Number(containerNum)
            this.totalWeight += Number(weight) * Number(containerNum)
            this.totalVolume += Number(volume) * Number(containerNum)
          })
          this.totalContainer = str.join('+')
        }
      },
      deep: true,
    },
    dataSource (val) {
      this.fee = val.fee || {}
      this.option1.data = val.fee?.chargeList || []
    },
  },
  methods: {
    // 货品分类
    getCommodityType () {
      cargoTypeList().then((response) => {
        this.commodityTypeCodeOptions = response.data.map(item => {
          return Object.assign(item, {
            label: item.chapterName,
            value: item.chapterCode
          })
        })
      })
    },
    getHscode(keyword = ' ') {
      if (!keyword) {
        keyword = ' '
      }
      cargoHscodeList({ keyword })
        .then((res) => {
          this.hscodeList = res.data.map((item) => {
            return Object.assign(item, {
              label: item.cargoDesc,
              value: item.hscode,
            })
          })
        })
        .catch(() => {})
    },
    getUnno(keyword = ' ') {
      if (!keyword) {
        keyword = ' '
      }
      cargoUnnoList({ keyword })
        .then((res) => {
          this.unnoList = res.data.map((item) => {
            return Object.assign(item, {
              label: item.unDesc,
              value: item.unNo,
            })
          })
        })
        .catch(() => {})
    },
    addContainer() {
      this.form.containers.push({
        containerNo: '',
        containerNum: '',
        containerType: '',
        isHeavy: '',
        volume: '',
        weight: '',
        cargoReadyTime: '',
      })
    },
    removeContainer(index) {
      this.form.containers.splice(index, 1)
    },
    addCargo() {
      this.form.cargos.push({
        boxRemark: '',
        cargoNo: '',
        cargoReadyTime: '',
        cname: '',
        commodityTypeCode: '',
        dangerousCode: '',
        dangerousGrade: '',
        ename: '',
        hscode: '',
        packageGroup: '',
        property: '',
      })
    },
    removeCargo(index) {
      this.form.cargos.splice(index, 1)
    },
    changePort(val, type) {
      if (!val) {
        return (this.form.voyage[type + 'Name'] = '')
      }
      let find = this[type + 'List'].find((item) => item.value === val)
      this.form.voyage[type + 'Name'] = find.label
    },
    changeSysLine(val) {
      if (!val) {
        return (this.form.voyage.sysLineName = '')
      }
      let find = this.sysLineList.find((item) => item.value === val)
      this.form.voyage.sysLineName = find.label
    },
    // 船公司
    shipQuery(queryString, item) {
      this.$store
        .dispatch('dict/baseShippingCarrierList', { name: queryString, state: 'valid' })
        .then((data) => {
          this.shipList = data.map((ele) => {
            return Object.assign(ele, {
              label: ele.value,
              value: ele.key,
            })
          })
        })
    },
    // 航线
    sysLineQuery(str = '') {
      this.$store
        .dispatch('dict/baseSystemLineList', { name: str, state: 'valid' })
        .then((data) => {
          this.sysLineList = data.map((ele) => {
            return Object.assign(ele, {
              label: ele.value,
              value: ele.key,
            })
          })
        })
    },
    feederSearch(val = '') {
      this.portSearch(val, 'port_of_feeder', 'porPortList')
    },
    polSearch(val = '') {
      this.portSearch(val, 'port_of_basic', 'polPortList')
    },
    podSearch(val = '') {
      this.portSearch(val, 'port_of_destination', 'podPortList')
    },
    unloadingPortSearch(val = '') {
      this.portSearch(val, 'port_of_discharge', 'unloadingPortList')
    },
    // 远程搜索港口下拉数据 port_of_basic  port_of_destination
    portSearch(queryString, port, list) {
      let data = {
        queryString,
        portAttribute: port,
      }
      this.$store.dispatch('dict/basePortList', data).then((data) => {
        this[list] = data.map((item) => {
          return {
            label: item.value,
            value: item.portCode,
          }
        })
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.order-info {
  .order-form {
    display: flex;
    align-items: stretch;
    flex-wrap: wrap;
    justify-content: space-between;
    // &::after{
    //   content: '';
    //   width: 30%;
    // }
  }
  .outer-box{
    margin: 15px 0;
  }
  .item-box {
    border: 1px solid #d9d9d9;
    border-radius: 2px;
    margin-top: 16px;
    width: 32%;
    .el-form-item {
      width: 100%;
      margin-right: 0; 
      display: flex;
      /deep/ .el-form-item__content {
        margin-right: 16px;
        margin-left: 5px;
        flex: 1;
        .el-select,
        .el-date-editor {
          width: 100%;
        }
      }
    }
    .title {
      height: 32px;
      background-color: #ebeef3;
      font-weight: bolder;
      padding: 0 16px;
      font-size: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      p {
        color: #969696;
        font-weight: normal;
        cursor: pointer;
      }
    }
    &.flex-box {
      width: 100%;
    }
  }
  .large-item {
    .el-form-item {
      width: 100%;
    }
    padding-bottom: 16px;
    .title{
      margin-bottom: 16px;
    }
  }
  .middle-item {
    .el-form-item {
      width: 20%;
    }
  }
  .small-item {
    .el-form-item {
      width: 20%;
    }
    .total-box {
      display: flex;
      align-items: center;
      padding: 16px 60px 0;
      p {
        margin-right: 24px;
      }
    }
  }
  .middle-box,
  .small-box {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }
  .middle-box {
    padding-bottom: 16px;
    .item {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
    }
  }
  .container-box {
    display: flex;
    // align-items: center;
    flex-wrap: wrap;
    .small-box {
      flex: 1;
    }
    .btn-box {
      width: 30px;
      text-align: center;
      i {
        font-size: 20px;
        cursor: pointer;
        &.plus {
          color: #1890ff;
        }
        &.remove {
          color: #999;
        }
      }
    }
    &.border{
      margin-bottom: 10px; 
      border-bottom: 1px solid #eee;
    }
  }
  .transport-box {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    justify-content: space-between;
    padding-bottom: 10px;
    /deep/.el-form-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-top: 10px;
      .el-form-item__label {
        width: 100% !important;
        text-align: left;
        padding-left: 5px;
        margin-bottom: 2px;
      }
    }
  }
}
.table-box {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 8px solid #f4f5f8;
  .total {
    .number {
      color: #e63923;
      margin-left: 2px;
    }
  }
  .detail {
    margin-top: 8px;
    display: flex;
    align-items: center;
    span {
      margin-right: 24px;
    }
  }
}
/deep/.el-input__prefix{
  line-height: 20px;
}
</style>
