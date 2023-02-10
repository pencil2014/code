<template>
  <div class="shipping-detail">
    <h2>选择航程</h2>
    <div class="voyage">
      <h3 class="start">{{ paramForm.originGeoName }}</h3>
      <i class="el-icon-right"></i>
      <h3 class="start">{{ paramForm.destinationGeoName }}</h3>
    </div>
    <div class="detail-item" v-for="(item, index) in dataList" :key="index">
      <!-- <div class="header-date">{{ getScheduleDetailsLocationData(item, 'start', 'fromLocation').date }}</div> -->
      <div class="route-detail">
        <div class="row-1">
          <div class="route-detail-item">
            <div class="route-detail-item-icon">
              <i class="el-icon-location-outline"></i>
            </div>
            <div class="route-detail-item-data">
              <div class="title">离港</div>
              <div class="date">{{ getScheduleDetailsLocationData(item, 'start', 'fromLocation').date }} {{ getScheduleDetailsLocationData(item, 'start', 'fromLocation').time || '' }}</div>
            </div>
          </div>
          <div class="route-detail-item">
            <div class="route-detail-item-icon">
              <i class="el-icon-location-outline"></i>
            </div>
            <div class="route-detail-item-data">
              <div class="title">到港</div>
              <div class="date">{{ getScheduleDetailsLocationData(item, 'end', 'toLocation').date }} {{ getScheduleDetailsLocationData(item, 'end', 'toLocation').time || '' }}</div>
            </div>
          </div>
          <div class="route-detail-item">
            <div class="route-detail-item-icon">
              <i class="el-icon-time"></i>
            </div>
            <div class="route-detail-item-data">
              <div class="title">进港截止日期</div>
              <div class="date">{{ getScheduleDetailsDeadlinesData(item, 'CY') }}</div>
            </div>
          </div>
          <div class="route-detail-item">
            <div class="route-detail-item-icon">
              <i class="el-icon-time"></i>
            </div>
            <div class="route-detail-item-data">
              <div class="title">运输时间</div>
              <div class="date">{{ item.routeScheduleFull.transitTime | daysMap}}</div>
            </div>
          </div>
          <div class="route-detail-item">
            <div class="route-detail-item-icon">
              <i class="el-icon-ship"></i>
            </div>
            <div class="route-detail-item-data">
              <div class="title">船舶/航次</div>
              <div class="date">{{ (getScheduleDetailsLocationData(item, 'start', 'transport').vessel && getScheduleDetailsLocationData(item, 'start', 'transport').vessel.name) || ''}} / {{getScheduleDetailsLocationData(item, 'start', 'transport').voyageNumber}}</div>
            </div>
          </div>
          <div class="route-detail-item">
            <span @click="doShow('routeDetailShow', index)" class="btn">
              <span class="el-icon-arrow-down" v-if="item.routeDetailShow"></span>
              <span class="el-icon-arrow-up" v-if="!item.routeDetailShow"></span>
              <span>路线及其他详细信息</span>
            </span>
          </div>
        </div>
        <div v-if="item.routeDetailShow" class="row-2">
          <div class="title">
            <i class="el-icon-ship"></i>
            <span class="txt">路线详情</span>
          </div>
          <div class="route-detail-item">
            <div class="port-data">
              <div class="port-data-item" v-for="(x, y) in getScheduleDetailsData(item)" :key="y">
                <div class="port-item">
                  <div class="port-item-name">
                    <div class="line line-1">{{ x.fromLocation.cityName }}</div>
                    <div class="line line-2">{{ x.fromLocation.siteName }}</div>
                    <div class="line line-3">{{ x.fromLocation.type }}</div>
                  </div>
                  <div class="port-item-time">
                    <div class="port-item-time-1">
                      <div class="port-item-time-line port-item-time-line-1"><i class="el-icon-ship"></i></div>
                      <div class="port-item-time-line port-item-time-line-2">离港时间</div>
                      <div class="port-item-time-line port-item-time-line-3">{{ x.transport.vessel .name }} / {{ x.transport.voyageNumber }}</div>
                    </div>
                    <div class="port-item-time-2">{{ x.fromLocation.date }} {{ x.fromLocation.time }}</div>
                    <div class="port-item-time-3">
                      <div class="port-item-time-3-item">
                        <div class="key">IMO编号</div>
                        <div class="value">{{ x.transport.vessel.imoNumber }}</div>
                      </div>
                      <div class="port-item-time-3-item">
                        <div class="key">TEU</div>
                        <div class="value">{{ x.transport.vessel.capacityTEU }}</div>
                      </div>
                      <div class="port-item-time-3-item">
                        <div class="key">船旗</div>
                        <div class="value">{{ x.transport.vessel.flagCode }}</div>
                      </div>
                      <div class="port-item-time-3-item">
                        <div class="key">航线</div>
                        <div class="value">{{ x.transport.vessel.code }}</div>
                      </div>
                      <div class="port-item-time-3-item">
                        <div class="key">呼号</div>
                        <div class="value">{{ x.transport.vessel.callSign }}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="port-item">
                  <div class="port-item-name">
                    <div class="line line-1">{{ x.toLocation.cityName }}</div>
                    <div class="line line-2">{{ x.toLocation.siteName }}</div>
                    <div class="line line-3">{{ x.toLocation.type }}</div>
                  </div>
                  <div class="port-item-time">
                    <div class="port-item-time-1">
                      <div class="port-item-time-line port-item-time-line-1"><i class="el-icon-location-outline"></i></div>
                      <div class="port-item-time-line port-item-time-line-2">到港时间</div>
                    </div>
                    <div class="port-item-time-2">{{ x.toLocation.date }} {{ x.toLocation.time }}</div>
                    <div v-if="y !== getScheduleDetailsData(item).length - 1" class="port-item-time-3-line"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="port-table">
              <div class="port-table-title">
                <span><i class="el-icon-time"></i></span>
                <span class="txt">截止期限</span>
              </div>
              <div class="port-table-data">
                <div class="port-table-data-item">
                  <div class="port-table-data-item-key">集装箱入场截收时间</div>
                  <div class="port-table-data-item-value">{{ getScheduleDetailsDeadlinesData(item, 'CY') }}</div>
                </div>
                <div class="port-table-data-item">
                  <div class="port-table-data-item-key">核实总重量单证截收时间</div>
                  <div class="port-table-data-item-value">{{ getScheduleDetailsDeadlinesData(item, 'VGM') }}</div>
                </div>
                <div class="port-table-data-item">
                  <div class="port-table-data-item-key">提单补料提交截止时间（预报舱单）</div>
                  <div class="port-table-data-item-value">{{ getScheduleDetailsDeadlinesData(item, 'SINONAMS') }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="price-detail">
        <div class="row-1">
          <div class="row-title-btn row-item">
            <div class="row-title">{{ typeTxt }} Spot</div>
            <div class="row-btn" @click="doShow('priceDetailShow', index)">
              <span class="el-icon-arrow-down" v-if="item.priceDetailShow"></span>
              <span class="el-icon-arrow-up" v-if="!item.priceDetailShow"></span>
              <span>价格细目表和详细信息</span>
            </div>
          </div>
          <template v-if="isSaleOut">
            <div class="row-item-saleout row-item">货船售罄</div>
          </template>
          <template v-if="!isSaleOut">
            <div class="row-item-checkbox row-item" v-if="item.rollableOptionEnabled">
              <el-checkbox class="checkbox-class"  v-model="item.isRollable">如延期运送获得赔偿</el-checkbox>
            </div>
            <div class="row-item-total row-item">
              <div class="total-class">{{(getPricesPerContainer(item, 'bas') || {}).currency}} {{ mapCurrent(item.price.total) }}</div>
              <div class="tip-class">{{ getFreeTxt(item) }}</div>
            </div>
            <div class="row-item-book row-item">
              <el-button type="default" :loading="item.bookingLoading" @click="booking(index)">订舱</el-button>
            </div>
          </template>
        </div>
        <div class="row-2" v-if="item.priceDetailShow">
          <div class="row-tab-class">
            <el-tabs v-model="item.priceActiveName">
              <el-tab-pane :label="item.label" :name="item.value"  v-for="(item,index) in tabsList" :key="index"></el-tab-pane>
            </el-tabs>
          </div>
          <div class="row-tab-item" v-if="item.priceActiveName === 'breakdown'">
            <el-table
              :data="getBreakdownData(item)"
              border
              style="width: 100%">
              <el-table-column
                prop="chargedescription"
                label="附加费名称">
              </el-table-column>
              <el-table-column
                prop="ratebasis"
                label="基础">
              </el-table-column>
              <el-table-column
                prop="qty"
                label="数量">
              </el-table-column>
              <el-table-column
                prop="currency"
                label="货币">
              </el-table-column>
              <el-table-column
                prop="rate"
                label="单价">
              </el-table-column>
               <el-table-column
                prop="amount"
                label="总价">
              </el-table-column>
            </el-table>
            <div class="total-price-class">
              <div>总价</div>
              <div>{{(getPricesPerContainer(item, 'bas') || {}).currency}} {{ mapCurrent(item.price.total) }}</div>
            </div>
          </div>
          <div class="row-tab-item" v-if="item.priceActiveName === 'Spot'">
            <el-table
              :data="getSpotData(item)"
              border
              style="width: 100%">
              <el-table-column
                prop="displayName">
                <template slot="header">
                  {{ typeTxt }} Spot费用
                </template>
              </el-table-column>
              <el-table-column
                prop="chargeFee"
                label="成本">
              </el-table-column>
            </el-table>
          </div>
          <div class="row-tab-item" v-if="item.priceActiveName === 'import'">
            <div class="row-tab-item-import">
              <div class="row-tab-item-import-1" v-for="(x,y) in item.importDnDConditions" :key="y">
                <div class="row-tab-item-import-1-left">
                  <div class="icon-class"><i class="el-icon-location-outline"></i></div>
                  <div class="row-tab-item-import-1-left-data">
                    <div>{{ x.commodity }}, {{ x.country }}</div>
                    <div>{{ x.displayName }} 开始日期 {{ x.freetimeStartEvent }}</div>
                  </div>
                </div>
                <div class="row-tab-item-import-1-right" v-if="getFreetimeData(x.chargePerDiemAfterFreetime).length">
                  <div v-if="y===0" class="row-tab-item-import-1-right-title">
                    <div class="key">有效期（天）</div>
                    <div class="key">成本/日（{{ getFreetimeData(x.chargePerDiemAfterFreetime)[0].currencyOfCharge }}）</div>
                   </div>
                   <div class="row-tab-item-import-1-right-item" v-for="(o,i) in getFreetimeData(x.chargePerDiemAfterFreetime)" :key="i">
                     <div class="right-item-row">
                       <div class="key">{{ o.key }}</div>
                       <div class="value">{{ o.value }}</div>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row-tab-item" v-if="['export', 'import'].includes(item.priceActiveName)">
            <div class="row-tab-item-1">
              <span>滞港费和滞箱费出口免费期按日计费的更多详情</span>
              <a href="https://assets.maerskline.com/combined-pricing-assets/maeu/dnd/free_time_offer_for_Maersk_SPOT.xlsx">download free_time_offer_for_Maersk_SPOT.xlsx</a>
            </div>
            <div class="row-tab-item-1">
              <span>美国地区适用美国进口滞港费和美国出口滞港费和滞箱费。</span>
              <a target="_blank" href="https://www.maersk.com.cn/local-information/north-america/united-states-of-america/import">了解关于美国费率的更多信息</a>
            </div>
          </div>
          
        </div>
      </div>
      <div class="service-detail">
        <div class="service-detail-title">增值服务</div>
        <div class="service-detail-item">
          <div class="service-detail-item-row">
            <div class="service-detail-item-key">目的港滞箱费:</div>
            <el-select class="service-detail-item-value" 
              v-model="item.vasCode"
              clearable
              filterable
              size="mini"
               placeholder="">
              <el-option
                v-for="item in vasCodeList"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
        </div>
      </div>
      <div class="remark-detail">
        <div class="remark-detail-title">备注：</div>
        <el-input size="mini" maxlength="100" v-model="item.remark" placeholder=""></el-input>
      </div>
    </div>
    <div class="loading-more">
      <el-button :loading="loadMoreLoading" type="primary" @click="loadMore">加载更多航次选项</el-button>
    </div>
  </div>
</template>

<script>
const vasCodeList = [
  { label: '1天', value: 'F01'},
  { label: '2天', value: 'F02'},
  { label: '3天', value: 'F03'},
  { label: '4天', value: 'F04'},
  { label: '5天', value: 'F05'},
  { label: '6天', value: 'F06'},
  { label: '7天', value: 'F07'},
  { label: '8天', value: 'F08'},
  { label: '9天', value: 'F09'},
  { label: '10天', value: 'F10'},
  { label: '11天', value: 'F11'},
  { label: '12天', value: 'F12'},
  { label: '13天', value: 'F13'},
  { label: '14天', value: 'F14'},
]
import { mskBooking } from '@/api/exec/booking'
export default {
  props: {
    detailArr: {
      type: Array,
      default: () => {
        return []
      }
    },
    paramForm: {
      type: Object,
      default: () => {
        return {}
      }
    },
    requestParam: {
      type: Object,
      default: () => {
        return {}
      }
    },
    carrierCode: {
      type: String,
      default: ''
    },
  },
  filters: {
    daysMap(m) {
      if (m) {
        return Math.ceil(m / (60 * 24)) + '天'
      }
      return ''
    }
  },
  watch: {
    'detailArr'() {
      this.getDataList()
    }
  },
  created() {
    this.getDataList()
    this.init()
  },
  data() {
    return {
      dataList: [],
      isSaleOut: false,
      tabsList: [
        { label: 'Price breakdown', value: 'breakdown' },
        { label: 'Masker Spot费用', value: 'Spot' },
        { label: '出口滞港费和滞箱费', value: 'export' },
        { label: '进口滞港费和滞箱费', value: 'import' },
      ],
      vasCodeList,
      loadMoreLoading: false,
      typeTxt: '',
      bookingFlag: false
    }
  },
  methods: {
    init() {
      if (this.carrierCode === 'MAEU') {
        this.typeTxt = 'Masker'
      } else if (this.carrierCode === 'MCPU') {
        this.typeTxt = 'sealand'
      }
      this.tabsList[1].label = this.typeTxt + ' Spot费用'
    },
    getDataList() {
      this.dataList = this.detailArr
    },
    getScheduleDetailsData(item) {
       return (item.routeScheduleFull && item.routeScheduleFull.scheduleDetails) || []
    },
    getScheduleDetailsLocationData(item, location, objName) {
       let arr = this.getScheduleDetailsData(item)
       let len = arr.length
       if (location === 'start') {
         return arr[0][objName] || {}
       } else {
         return arr[len - 1][objName] || {}
       }
    },
    getScheduleDetailsDeadlinesData(item, deadlineKey) {
       let arr = this.getScheduleDetailsData(item)
       let itemArr = arr[0].deadlines || []
       let obj = itemArr.find(x => {
        return x.deadlineKey === deadlineKey
       })
       return (obj && obj.deadline) || ''
    },
    doShow(type, index) {
      let obj = this.dataList[index]
      let param = {}
      for (let key in  obj) {
        if (key === type) param[key] = !obj[key]
      }
      this.dataList.splice(index, 1, {...obj, ...param})
    },
    mapCurrent(total) {
      if (!total) return ''
      return String(total).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    getFreeTxt(item) {
      let arr = item.importDnDConditions || []
      let DetentionFreeDays = (arr.find(x => {
        return x.chargeType === 'Detention'
      }) || {}).freetimeGrantInDays
      let DemurrageFreeDays = (arr.find(x => {
        return x.chargeType === 'Demurrage'
      }) || {}).freetimeGrantInDays
      if (DetentionFreeDays && DemurrageFreeDays) {
        return `含${DemurrageFreeDays}天滞箱期和${DetentionFreeDays}天滞港免费期`
      } else if (DetentionFreeDays) {
        return `含${DetentionFreeDays}天滞港免费期`
      } else if (DemurrageFreeDays) {
        return `含${DemurrageFreeDays}天滞箱期`
      } else {
        return ''
      }
    },
    getPricesPerContainer(item, param) {
      let arr = (item.price && item.price.prices_per_container) || []
      return arr[0] && arr[0][param]
    },
    getBreakdownData(item) {
      let surcharges_per_doc = (item.price && item.price.surcharges_per_doc) || []
      let surcharges_per_container = this.getPricesPerContainer(item, 'surcharges_per_container') || []
      let bas = this.getPricesPerContainer(item, 'bas') || {}
      return [
        ...surcharges_per_doc,
        ...surcharges_per_container,
        bas
      ]
    },
    getSpotData(item) {
      let charges = []
      if (item.penaltyFees && item.penaltyFees.length) {
         charges = item.penaltyFees[0].charges || []
      }
      return charges
    },
    getFreetimeData(chargePerDiemAfterFreetime) {
      chargePerDiemAfterFreetime = chargePerDiemAfterFreetime || []
      let len = chargePerDiemAfterFreetime.length
      let arr = []
      if (len) {
        let obj = chargePerDiemAfterFreetime[0]
        arr.push({
          ...obj,
          key: `1-${obj.startDayOfCharge - 1}`,
          value: '免费'
        })
        for (let i = 0; i < len; i++) {
          if (i === len - 1) {
            arr.push({
              ...chargePerDiemAfterFreetime[i],
              key: `${chargePerDiemAfterFreetime[i].startDayOfCharge}+`,
              value: chargePerDiemAfterFreetime[i].chargePerDiem
            })
          } else {
            arr.push({
              ...chargePerDiemAfterFreetime[i],
              key: `${chargePerDiemAfterFreetime[i].startDayOfCharge}-${chargePerDiemAfterFreetime[i+1].startDayOfCharge - 1}`,
              value: chargePerDiemAfterFreetime[i].chargePerDiem
             })
          }
        }
        return arr
      } else {
        return []
      }
    },
    getData(index) {
      let obj = this.dataList[index]
      let vasObj = {}
      if (obj.vasCode) {
        vasObj = {
          vas: [{
            vasCode: obj.vasCode
          }]
        }
      }
      return {
        priceId: this.getPricesPerContainer(obj, 'priceid'),
        etd: this.getScheduleDetailsLocationData(obj, 'start', 'fromLocation').date,
        ...vasObj,
        isRollable: obj.isRollable,
        remark: obj.remark,
      }
    },
    booking(index) {
      if (this.bookingFlag) {
        this.$message.error('正在订舱中...，请稍后再试')
        return
      }
      let data = this.getData(index)
      let params = Object.assign({}, this.requestParam, data)
      this.doShow('bookingLoading', index)
      this.bookingFlag = true
      mskBooking(params)
      .then(res => {
        if (res.data && res.data.bookingReference) {
          const h = this.$createElement;
          this.$msgbox({
            title: '提示',
            message: h('p', null, [
              h('span', null, '订舱成功，订舱单号： '),
              h('i', { style: 'color: #000; font-weight: bold; font-size: 16px;' }, res.data.bookingReference)
            ]),
            showCancelButton: false,
            confirmButtonText: '确定'
          })
        }
      })
      .finally(() => {
        this.doShow('bookingLoading', index)
        this.bookingFlag = false
      })
    },
    loadMore() {
      this.loadMoreLoading = true
      let len = this.dataList.length - 1
      let item = this.dataList[len]
      let dateVal = this.getScheduleDetailsLocationData(item, 'end', 'fromLocation').date
      this.$emit('loadingMore', dateVal)
      setTimeout(() => {
        this.loadMoreLoading = false
      }, 3000)
    }
  }
}
</script>

<style lang="scss" scoped>
.shipping-detail {
  margin-top: 20px;
  /deep/.el-table tr {
    height: 40px;
  }
  .voyage {
    margin-top: 20px;
    display: flex;
    align-items: center;
  }
  .detail-item {
    margin-top: 20px;
    padding: 10px;
    border: 2px solid #f7f7f7;
    .header-date {
      font-size: 14px;
      color: #000;
    }
    .route-detail {
      background-color: #f7f7f7;
      margin-top: 10px;
      .row-1 {
        display: flex;
        padding: 20px;
        justify-content: space-between;
        align-items: center;
        .route-detail-item {
          display: flex;
          .route-detail-item-icon {
            i {
              font-size: 21px;
            }
          }
          .route-detail-item-data {
            margin-left: 5px;
            font-size: 16px;
            .date {
              margin-top: 5px;
            }
          }
          .btn {
            text-decoration: underline;
            cursor: pointer;
            font-size: 16px;
            color: #0073ab;
          }
        }
      }
      .row-2 {
        padding: 20px;
        i {
          font-size: 21px;
        }
        .txt {
          font-size: 17px;
          margin-left: 5px;
        }
        .route-detail-item {
          display: flex;
          .port-data {
            width: 55%;
            .port-item {
              margin-top: 20px;
              display: flex;
              justify-content: center;
              .port-item-name {
                width: 40%;
                .line {
                  text-align: right;
                  font-size: 16px;
                }
                .line+.line {
                  margin-top: 5px;
                }
                .line-1 {
                  color: #000;
                }
              }
              .port-item-time {
                width: 60%;
                margin-left: 10px;
                .port-item-time-1 {
                   display: flex;
                   .port-item-time-line {
                    margin-left: 5px;
                    font-size: 16px;
                   }
                   .port-item-time-line-1 {
                     i {
                      font-size: 16px;
                     }
                   }
                   .port-item-time-line-3 {
                    color: #000;
                   }
                }
                .port-item-time-2 {
                  margin: 5px 0 25px 25px;
                  font-size: 16px;
                }
                .port-item-time-3 {
                  margin-left: 25px;
                  border: 1px solid #cfcfcf;
                  background-color: #cfcfcf;
                  padding: 10px;
                  display: flex;
                  justify-content: space-between;
                  font-size: 16px;
                  position: relative;
                  .value {
                    margin-top: 10px;
                  }
                  &::before{
                    position: absolute;
                    content: '';
                    width: 1px;
                    height: 100%;
                    border: 1px dashed #cfcfcf;
                    left: -14px;
                    top: 0;
                  }
                }
                .port-item-time-3-line {
                   width: 1px;
                   height: 80px;
                   margin-left: 12px;
                   border: 1px solid #cfcfcf;
                }
              }
            }
          }
          .port-table {
            width: 40%;
            margin-left: 20px;
            .port-table-data {
              margin-top: 10px;
              border: 1px solid #cfcfcf;
              padding: 20px;
              font-size: 16px;
              .port-table-data-item {
                border-bottom: 1px solid #cfcfcf;
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
              }
            }
          }
        }
      }
    }
    .price-detail {
      margin-top: 10px;
      .row-1 {
        border: 2px solid #f7f7f7;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .row-title-btn {
          .row-title {
            font-size: 16px;
            color: #000;
            font-weight: bold;
          }
          .row-btn {
            margin-top: 10px;
            text-decoration: underline;
            cursor: pointer;
            font-size: 16px;
            color: #0073ab;
          }
        }
        .row-item-saleout {
          font-size: 16px;
          font-weight: bold;
        }
        .row-item-checkbox {
          .checkbox-class {
            zoom: 115%;
          }
        }
        .row-item-total {
          .total-class {
            font-size: 18px;
            color: #000;
            font-weight: bold;
          }
          .tip-class {
            margin-top: 5px;
          }
        }
        .row-item-book {
          .el-button {
            background-color: #363131;
            color: #fff;
            width: 100px;
          }
        }
      }
      .row-2 {
        background-color: #f7f7f7;
        padding: 10px;
        .row-tab-item {
          .total-price-class {
            margin-top: 20px;
            display: flex;
            justify-content: space-between;
            color: #000;
            font-size: 16px;
            font-weight: bold;
          }
          .row-tab-item-1 {
            font-size: 14px;
            a {
              color: #0073ab;
              margin-left: 10px;
              text-decoration: underline;
            }
            &+.row-tab-item-1 {
              margin-top: 20px;
            }
          }
          .row-tab-item-import {
            margin-bottom: 20px;
            .row-tab-item-import-1 {
              display: flex;
              align-items: stretch;
              .row-tab-item-import-1-left {
                width: 60%;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: #ededed;
                border-bottom: 1px solid #dbdbdb;
                .icon-class {
                  margin-top: -20px;
                }
                i {
                  font-size: 18px;
                }
                .row-tab-item-import-1-left-data {
                  width: 50%;
                  font-size: 16px;
                  margin-left: 10px;
                  line-height: 20px;
                }
              }
              .row-tab-item-import-1-right {
                width: 40%;
                .row-tab-item-import-1-right-title {
                  height: 40px;
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  border: 1px solid #dbdbdb;
                  padding: 10px;
                  font-size: 16px;
                  color: #000;
                }
                .row-tab-item-import-1-right-item {
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                  align-items: stretch;
                  .right-item-row {
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border: 1px solid #dbdbdb;
                    border-top: none;
                    padding: 10px;
                    font-size: 16px;
                  }
                }
              }
            }
          }
        }
      }
    }
    .service-detail {
      margin-top: 10px;
      border: 2px solid #f7f7f7;
      padding: 10px 20px;
      .service-detail-title {
        font-size: 16px;
        color: #000;
      }
      .service-detail-item {
        padding: 10px 20px;
        .service-detail-item-row {
          display: flex;
          align-items: center;
          .service-detail-item-key {
            font-size: 14px;
          }
          .service-detail-item-value {
            margin-left: 20px;
          }
        }
      }
    }
    .remark-detail {
      margin-top: 10px;
      border: 2px solid #f7f7f7;
      padding: 5px 20px;
      display: flex;
      align-items: center;
      .remark-detail-title {
        color: #000;
        width: 60px;
        font-size: 14px;
      }
    }
  }
  .loading-more {
    margin-top: 10px;
    text-align: center;
  }
}
</style>