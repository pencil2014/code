<template>
  <div class="shipping-line-class">
    <div class="step-class">
      <div class="step-item" :class="{'step-item-no-last': index !== stepOptions.length - 1, 'step-item-target': activeStep === item.value}"  v-for="(item, index) in stepOptions" :key="index">
        <div @click="selectStep(item.value)" class="txt" :class="{'txt-target': activeStep === item.value}">{{ item.label }}</div>
      </div>
    </div>
    <div class="booking-detail" v-if="activeStep === 1">
      <h2>您的订舱详情</h2>
      <div class="address-detail detail">
          <div class="detail-title">
            地点详情
            <el-tooltip class="item" effect="dark" :content="addressTip" placement="top">
              <i class="el-icon-info"></i>
            </el-tooltip>
          </div>
          <div class="detail-content">
             <div class="detail-item">
               <div class="detail-form">
                  <div class="item-label">发件地址（城市，国家/地区）</div>
                  <el-select v-model="form.originGeoId" 
                    placeholder="请输入城市或港口,至少两个字符"
                    remote
                    clearable
                    filterable
                    :loading="originGeoloading"
                    :remote-method="originGeoRemoteMehod"
                    @change="originGeoChange"
                     >
                    <el-option
                      v-for="item in originGeoList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
               </div>
               <div class="detail-form">
                  <div class="item-label">服务模式（始发地）</div>
                  <el-radio-group v-model="form.originServiceMode">
                    <el-radio :label="'CY'">货方拖运（CY）</el-radio>
                    <el-radio :label="'SD'">承运商拖运（SD）</el-radio>
                  </el-radio-group>
               </div>
             </div>
             <div class="detail-item">
               <div class="detail-form">
                  <div class="item-label">收件地址（城市，国家/地区）</div>
                  <el-select v-model="form.destinationGeoId" 
                      remote
                      filterable
                      clearable
                      :loading="destinationGeoloading"
                      :remote-method="destinationGeoRemoteMehod"
                      @change="destinationGeoChange"
                      placeholder="请输入城市或港口,至少两个字符">
                    <el-option
                      v-for="item in destinationGeoList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
               </div>
               <div class="detail-form">
                  <div class="item-label">服务模式（目的地）</div>
                  <el-radio-group v-model="form.destinationServiceMode">
                    <el-radio :label="'CY'">货方拖运（CY）</el-radio>
                    <el-radio :label="'SD'">承运商拖运（SD）</el-radio>
                  </el-radio-group>
               </div>
             </div>
          </div>
      </div>
      <div class="detail">
          <div class="detail-title">商品细节</div>
           <div class="detail-content">
             <div class="detail-item">
               <div class="detail-form">
                  <div class="item-label">货品名称</div>
                  <el-select v-model="form.cargoId"  
                      remote
                      filterable
                      :remote-method="cargoRemoteMehod"
                      :loading="cargoloading"
                      clearable
                       placeholder="请输入商品,至少两个字符">
                    <el-option
                      v-for="item in cargoList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
               </div>
             </div>
           </div>
      </div>
      <div class="detail">
          <div class="detail-title">商品细节</div>
           <div class="detail-content" v-for="(x, y) in form.containers" :key="y">
             <div class="detail-item">
               <div class="detail-form">
                  <div class="item-label">集装箱类型和尺寸</div>
                  <el-select 
                      v-model="x.sizeType" 
                      filterable 
                      clearable
                      placeholder="选择集装箱类型和尺寸">
                      <el-option-group
                          v-for="group in containersList"
                          :key="group.label"
                          :label="group.label"
                      >
                          <el-option
                            v-for="item in group.options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                          </el-option>
                    </el-option-group>
                  </el-select>
               </div>
              <div class="detail-form">
                  <el-checkbox v-model="x.isShipperOwned" >使用托运人的集装箱，进口退货集装箱或者其他三角集运选项</el-checkbox>
               </div>
             </div>
             <div class="detail-item litter-item">
               <div class="detail-form">
                  <div class="item-label">集装箱数量</div>
                  <el-input-number :min="1" :max="99"  :precision="0" v-model="x.quantity"></el-input-number>
               </div>
             </div>
             <div class="detail-item litter-item">
               <div class="detail-form">
                  <div class="item-label">每个集装箱的重量</div>
                  <el-input-number :min="1"  :controls="false"  :precision="0" v-model="x.weight"></el-input-number> kg
               </div>
             </div>
             <div v-if="form.containers.length !== 1" class="detail-item litter-item icon-delete">
                <i class="el-icon-delete" @click="deleteContainer(y)"></i>
             </div>
           </div>
           <div class="add-btn">
             <el-button type="default" @click="addContainer">+ 添加更多集装箱类型和尺寸</el-button>
             <el-tooltip class="item" effect="dark" :content="addTip" placement="top">
                <i class="el-icon-info"></i>
             </el-tooltip>
           </div>
      </div>
      <div class="detail">
        <div class="detail-title">最早离岗日期</div>
          <div class="detail-content">
            <div class="detail-item">
              <div class="detail-form">
                <el-date-picker
                  v-model="form.departureDate"
                  type="date"
                  value-format="yyyy-MM-dd"
                  :pickerOptions="pickerOptions"
                  placeholder="选择日期">
                </el-date-picker>
              </div>
            </div>
          </div>
      </div>
      <div class="contiumn">
        <el-button type="primary" @click="searchMethod" :loading="searchLoading">继续</el-button>
      </div>
    </div>
    <div v-if="activeStep === 2">
      <shippingDetail :carrierCode="carrierCode" :requestParam="requestParam" :paramForm="paramForm" :detailArr="detailArr" @loadingMore="loadingMore" />
    </div>
  </div>
</template>

<script>
import { getMskCityList, getMskCommodityList, getMskSoptOffer } from '@/api/exec/booking'
import { containerList } from '../container.js'
import shippingDetail from './shippingDetail'
import { mapState } from 'vuex'
export default {
   props: {
    carrierCode: {
      type: String,
      default: ''
    }
   },
   components: { shippingDetail },
   data() {
    return {
      stepOptions: [
        {
          label: '订舱信息',
          value: 1
        },
        {
          label: '选择航程',
          value: 2
        }
      ],
      activeStep: 1,
      addressTip: '货方拖运（CY）服务模式是指您将货物交到集装箱堆场，承运人拖运（SD）是指我们从您指定的地点取货。',
      addTip: '当货物需要温度控制或处于危险境地时，目前无法使用不同类型和尺寸的集装箱进行订舱，如果客户希望预定不同类型和尺寸的集装箱，应创建多个订舱单。',
      form: {
        originGeoId: '',
        originServiceMode: 'CY',
        destinationGeoId: '',
        destinationServiceMode: 'CY',
        cargoId: '002001',
        containers: [
          {
            sizeType: '40HDRY-40 Dry High',
            isShipperOwned: false,
            weight: 18000,
            quantity: 1,
          }
        ],
        departureDate: '',
      },
      requestParam: {},
      originGeoList: [],
      originGeoloading: false,
      destinationGeoList: [],
      destinationGeoloading: false,
      cargoList: [{
        cargoTypes: ["DRY", "OOG"],
        value: '002001',
        label: 'Furniture'
      }],
      cargoloading: false,
      containersList: [],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() || time.getTime() > Date.now() + 60*24*3600*1000
        },
      },
      searchLoading: false,
      timerTr: null,
      paramForm: {
        originGeoId: '',
        originGeoName: '',
        destinationGeoId: '',
        destinationGeoName: ''
      },
      detailArr: []
    }
   },
   created() {
     this.init()
   },
   computed: {
     ...mapState({
      userInfo: (state) => state.user.userInfo
    }),
   },
   beforeDestroy() {
     clearImmediate(this.timerTr)
     this.timerTr = null
   },
   methods: {
    init() {
      let timestamp = Date.now() + 10*24*3600*1000
      this.form.departureDate = this.timestampToTime(timestamp)
      this.containersList = containerList.map(item => {
        item.options = item.options.map(item2 => {
          item2.label = item2.sizeTypeDisplayName
          item2.value = item2.sizeCd + item2.typeCd + '-' + item2.sizeTypeDisplayName
          return item2
        })
        return item
      })
      let BookingAddressObj = localStorage.getItem(this.carrierCode + 'BookingAddressObj')
      if (BookingAddressObj) {
        BookingAddressObj = JSON.parse(BookingAddressObj)
        this.originGeoList = BookingAddressObj['originGeo'] || []
        this.destinationGeoList = BookingAddressObj['destinationGeo'] || []
      }
    },
    selectStep(step) {
      if (step === 1) {
        this.$confirm('是否修改报价请求，重新获取航程报价信息？', "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          this.activeStep = step
        })
      }
    },
    timestampToTime(timestamp) {
        var date = timestamp ? new Date(timestamp) : new Date()
        var Y = date.getFullYear() + '-'
        var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-'
        var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
        return Y+M+D
    },
    debounceLxz(fn, time = 800) {
      clearTimeout(this.timerTr)
      this.timerTr = setTimeout(() => {
        if (!fn || !(fn instanceof Function)) {
          this.$message({
            message: '参数错误！',
            type: 'error',
            showClose: true
          })
        } else {
          fn()
        }
      }, time)
    },
    originGeoRemoteMehod(portName) {
      if (!portName || portName.length < 2) return
      this.debounceLxz(() => {
        this.originGeoloading = true
         getMskCityList({
            carrierCode: this.carrierCode,
            portName
         })
         .then(res => {
            if (res.data && res.data.list) {
              this.originGeoList = res.data.list.map(item => {
                item.label = `${item.cityName}${item.uNRegionName ? '(' + item.uNRegionName + ')' : ''}, ${item.countryName}`
                item.value = item.carrierGeoID
                return item
              })
            }
          })
          .finally(() => {
            this.originGeoloading = false
          })
      })
    },
    originGeoChange(id) {
      this.paramForm.originGeoId = id
      let obj = this.originGeoList.find(item => {
        return item.value === id
      })
      this.paramForm.originGeoName = (obj || {}).label || ''
      this.setLocalStorage('originGeo', obj)
    },
    destinationGeoRemoteMehod(portName) {
      if (!portName || portName.length < 2) return
      this.debounceLxz(() => {
        this.destinationGeoloading = true
        getMskCityList({
          carrierCode: this.carrierCode,
          portName
        })
        .then(res => {
          if (res.data && res.data.list) {
            this.destinationGeoList = res.data.list.map(item => {
              item.label = `${item.cityName}${item.uNRegionName ? '(' + item.uNRegionName + ')' : ''}, ${item.countryName}`
              item.value = item.carrierGeoID
              return item
            })
          }
        })
        .finally(() => {
          this.destinationGeoloading = false
        })
      })
    },
    destinationGeoChange(id) {
      this.paramForm.destinationGeoId = id
      let obj = this.destinationGeoList.find(item => {
        return item.value === id
      })
      this.paramForm.destinationGeoName = (obj || {}).label || ''
      this.setLocalStorage('destinationGeo', obj)
    },
    setLocalStorage(type, obj) {
      let storageObj = localStorage.getItem(this.carrierCode + 'BookingAddressObj')
      if (storageObj) {
        storageObj = JSON.parse(storageObj)
        if (storageObj[type]) {
          if (storageObj[type].some(item => item.carrierGeoID === obj.carrierGeoID)) {
            return
          } else {
            storageObj[type].unshift(obj)
            storageObj[type] = storageObj[type].splice(0, 2)
          }
        } else {
          storageObj[type] = []
          storageObj[type].unshift(obj)
        }
      } else {
        storageObj = {}
        storageObj[type] = []
        storageObj[type].unshift(obj)
      }
      localStorage.setItem(this.carrierCode + 'BookingAddressObj', JSON.stringify(storageObj))
    },
    cargoRemoteMehod(commodityName) {
      if (!commodityName || commodityName.length < 2) return
      this.debounceLxz(() => {
        this.cargoloading = true
        getMskCommodityList({
          commodityName
        })
        .then(res => {
          if (res.data) {
            this.cargoList = (res.data || []).map(item => {
              item.label = item.commodityName
              item.value = item.commodityCode
              return item
            })
          }
        })
        .finally(() => {
          this.cargoloading = false
        })
      })
    },
    addContainer() {
      this.form.containers.push({
        sizeType: '40HDRY-40 Dry High',
        isShipperOwned: false,
        weight: 18000,
        quantity: 1,
      })
    },
    deleteContainer(y) {
      this.form.containers.splice(y, 1)
    },
    checkData() {
      let check = true
      if (!this.form.originGeoId) {
        check = false
        this.$message.error('始发地（国家/地区）不能为空')
      } else if (!this.form.destinationGeoId) {
        check = false
        this.$message.error('目的地（城市，国家/地区）不能为空')
      } else if (!this.form.cargoId) {
        check = false
        this.$message.error('货物品名不能为空')
      } else if (this.form.containers.some(item => !item.sizeType)) {
        check = false
        this.$message.error('集装箱类型和尺寸不能为空')
      } else if (this.form.containers.some(item => !item.quantity)) {
        check = false
        this.$message.error('集装箱数量不能为空')
      } else if (this.form.containers.some(item => !item.weight)) {
        check = false
        this.$message.error('每个集装箱的重量不能为空')
      } else if (!this.form.departureDate) {
        check = false
        this.$message.error('最早离岗日期不能为空')
      }
      return check
    },
    getSizeType(sizeType) {
       return sizeType.split('-')[0]
    },
    getContainers() {
      let arr = this.form.containers.map(item => {
        return {
          quantity: item.quantity,
          weight: (item.weight / 1000),
          sizeType: this.getSizeType(item.sizeType)
        }
      })
      return arr
    },
    getISOEquipmentCode(sizeType) {
      let len = this.containersList.length
      let obj = {}
      for (let i = 0; i < len; i++) {
        obj = this.containersList[i].options.find(item => {
          return item.value === sizeType
        })
        if (obj && obj.isoContainerSizeTypeCd) {
          
          return obj.isoContainerSizeTypeCd
        }
      }
      return ''
    },
    getEquipments() {
      return this.form.containers.map(item => {
        return {
          ISOEquipmentCode: this.getISOEquipmentCode(item.sizeType),
          equipmentQuantity: item.quantity,
          isShipperOwned: item.isShipperOwned
        }
      })
    },
    getPlace(type) {
      let obj = {}
      if (type === 'originGeo') {
         obj = this.originGeoList.find(item => {
           return this.form.originGeoId === item.value
         })
      } else if (type === 'destinationGeo') {
        obj = this.destinationGeoList.find(item => {
          return this.form.destinationGeoId === item.value
        })
      }
      if (obj && obj.value) {
        return {
          "UNLocationCode": obj.uNLocationCode,
          "cityName": obj.cityName,
          "regionName": obj.uNRegionName,
          "ISOcountryCode": obj.countryCode,
          "maerskCityGeoId": obj.carrierGeoID,
        }
      }
    },
    getCargoType() {
      let cargoTypes = ((this.cargoList.find(item => {
        return item.value === this.form.cargoId
      }) || {}).cargoTypes) || []
      return cargoTypes[0] || ''
    },
    searchMethod() {
      if (!this.checkData()) return
      this.requestParam = {
        name: 'anna',
        email: 'anna.zheng@longsailing.net',
        carrierCode: this.carrierCode,
        exportMode: this.form.originServiceMode,
        importMode: this.form.destinationServiceMode,
        placeOfReceipt: this.getPlace('originGeo'),
        placeOfDelivery: this.getPlace('destinationGeo'),
        cargo: {
           commodityCode: this.form.cargoId,
           cargoType: this.getCargoType(),
           totalCargoWeight: (this.form.containers[0] && this.form.containers[0].weight) || '',
           totalWeightMeasurementUnit: 'KGS'
        },
        equipments: this.getEquipments()
      }
      console.log('requestParam', this.requestParam)
      this.requestData()
    },
    loadingMore(departureDate) {
      departureDate = new Date(departureDate).getTime()
      departureDate += (1*24*3600*1000)
      departureDate = this.timestampToTime(departureDate)
      this.requestData(departureDate)
    },
    requestData(departureDate) {
      this.searchLoading = true
      getMskSoptOffer({
        carrierCode: this.carrierCode,
        originGeoId: this.form.originGeoId,
        destinationGeoId: this.form.destinationGeoId,
        originServiceMode: this.form.originServiceMode,
        destinationServiceMode: this.form.destinationServiceMode,
        departureDate: departureDate || this.form.departureDate,
        containers: this.getContainers()
      })
      .then(res => {
        console.log('res', res)
        if (res.data) {
          let arr = res.data.map(item => {
            item['routeDetailShow'] = false
            item['priceDetailShow'] = false
            item['bookingLoading'] = false
            item['isRollable'] = false
            item['vasCode'] = ''
            item['remark'] = ''
            item['priceActiveName'] = 'breakdown'
            return item
          })
          if (departureDate) {
            this.detailArr = this.detailArr.concat(arr)
          } else {
            this.detailArr = arr
          }
          this.activeStep = 2
        } else {
          this.$message.error('没有查询到符合条件的船期')
        }
      })
      .finally(() => {
        this.searchLoading = false
      })
    }
   }
}
</script>

<style lang="scss" scoped>
.shipping-line-class {
  .step-class {
    margin-top: 60px;
    display: flex;
    .step-item {
      width: 250px;
      position: relative;
      .txt {
        font-size: 16px;
        line-height: 24px;
        cursor: pointer;
      }
      .txt-target {
        color: #42b0d5
      }
      &::after {
        position: absolute;
        content: '';
        width: 20px;
        height: 20px;
        border-radius: 20px;
        border: 1px solid #cfcfcf;
        top: -35px
      }
      
    }
    .step-item-no-last {
      position: relative;
      &::before {
        position: absolute;
        content: '';
        width: calc(100% - 20px);
        height: 2px;
        background-color: #cfcfcf;
        top: -25px;
        left: 20px;
      }
    }
    .step-item-target {
       position: relative;
       &::after {
        position: absolute;
        content: '';
        width: 20px;
        height: 20px;
        border-radius: 20px;
        border: 1px solid #42b0d5;
        top: -35px
      }
    }
  }
  .booking-detail {
    margin-top: 20px;
    .detail {
      margin-top: 10px;
      position: relative;
      .detail-title {
        font-size: 16px;
        line-height: 24px;
        letter-spacing: 0;
      }
      &::before {
        position: absolute;
        content: '';
        width: calc(100% - 200px);
        height: 1px;
        background-color: #cfcfcf;
        top: 13px;
        left: 150px;
      }
      .detail-content {
        padding: 10px;
        display: flex;
        .detail-item {
          width: 40%;
          .detail-form {
            margin: 10px 0;
            .item-label {
              font-size: 14px;
              line-height: 24px;
              letter-spacing: 0;
              margin-bottom: 10px;
            }
            /deep/.el-select {
              width: 80%;
            }
          }
          .detail-form+.detail-form {
            margin-top: 25px;
          }
          .icon-delete {
            text-align: center
          }
        }
        .litter-item {
          width: 240px;
        }
        .icon-delete {
          display: flex;
          align-items: center;
          i {
            font-size: 24px;
            cursor: pointer;
          }
        }
      }
    }
  }
  .el-icon-info {
    font-size: 14px;
    margin-left: 5px;
  }
  .add-btn {
    margin-bottom: 20px;
    overflow: hidden;
  }
}
</style>