<template>
  <div class="seaFreightDetail app-container">
    <div class="components-containe">
      <div class="state-row" :class="createItem.status === 'invalid' ? 'invalid' : ''">
        <div class="title">空运价详情</div>
        <div>
          <span v-if="createItem.status === 'invalid'" class="fl">运价已失效</span>
          <el-button @click="handleCancel" size="mini">返回</el-button>
          <el-button type="primary" v-if="createItem.status ==='published'" @click="handleCreate" size="mini">下单</el-button>
        </div>
      </div>
      <div class="head">
        <div class="title">
          <div class="current">
            <div style="font-size:14px;color:#BFBFBF">起运港</div>
            <span>{{createItem.polPortCode}}</span>
            <span class="action" v-if="createItem.polPortName">( {{createItem.polPortName}} )</span>
          </div>
          <div>
            <div class="center">{{createItem.potPortCode?createItem.potPortCode+'('+createItem.potPortName+')':''}}<i class="triangle-bottomleft"></i>
            </div>
          </div>
          <div class='current'>
            <div style="font-size:14px;color:#BFBFBF">目的地</div>
            <span>{{createItem.podPortCode}}</span>
            <span class="action" v-if="createItem.podPortName">( {{createItem.podPortName}} )</span>
          </div>
        </div>
      </div>
      <div class="content">
        <el-row :gutter="50" style="margin-top:8px;">
          <el-col class='el-col-customer-padding' :span="6">
            <p class="detail"><span>航空公司：</span>{{createItem.airLine ? createItem.airLine :'--'}}</p>
          </el-col>
          <el-col class='el-col-customer-padding' :span="6">
            <p class="detail"><span>航班频率：</span>
              <el-tooltip v-if="createItem.flightRate" class="item" effect="dark" :content="createItem.flightRate" placement="top-start">
                <span class="tooltip-info">{{createItem.flightRate}}</span>
              </el-tooltip>
              <span v-else>--</span>
            </p>
          </el-col>
          <el-col class='el-col-customer-padding' :span="6">
            <p class="detail"><span>包装：</span>{{createItem.packageInfo ? getDictLabel('airChargePackage', createItem.packageInfo) :'--'}}</p>
          </el-col>
          <el-col class='el-col-customer-padding' :span="6">
            <p class="detail"><span>时效：</span>
              <el-tooltip v-if="createItem.prescription" class="item" effect="dark" :content="createItem.prescription" placement="top-start">
                <span class="tooltip-info">{{createItem.prescription}}</span>
              </el-tooltip>
              <span v-else>--</span>
            </p>
          </el-col>
          <el-col class='el-col-customer-padding' :span="6">
            <p class="detail"><span>有效日期：</span>{{createItem.beginDate}}到{{createItem.endDate}}</p>
          </el-col>
        </el-row>
        <el-row :gutter="50" style="margin-top:8px;">
          <el-col class='el-col-customer-padding' :span="12">
            <p class="detail" style="display: flex;">
              <span>附加费说明：</span>
              <span class="air-cost-info">
                <el-input type="textarea" :rows="3" disabled placeholder="" v-model="createItem.surchargeDesc">
                </el-input>
              </span>
            </p>
          </el-col>
          <el-col class='el-col-customer-padding' :span="12">
            <p class="detail" style="display: flex;">
              <span>特别提醒：</span>
              <span class="air-cost-info">
                <el-input type="textarea" :rows="3" disabled placeholder="" v-model="createItem.attention">
                </el-input>
              </span>
            </p>
          </el-col>
          <el-col class='el-col-customer-padding' :span="12">
            <p class="detail" style="display: flex;">
              <span>收货指引：</span>
              <span class="air-cost-info">
                <el-input type="textarea" :rows="3" disabled placeholder="" v-model="createItem.guidanceDesc">
                </el-input>
              </span>
            </p>
          </el-col>
          <el-col class='el-col-customer-padding' :span="12">
            <p class="detail" style="display: flex;">
              <span>备注说明：</span>
              <span class="air-cost-info">
                <el-input type="textarea" :rows="3" disabled placeholder="" v-model="createItem.internalDesc">
                </el-input>
              </span>
            </p>
          </el-col>
        </el-row>
        <div style="margin:20px 0;"></div>
        <h3>价格信息</h3>
        <div style="margin:4px 0;"></div>
        <el-table :data="createItem.chargePrices" border class="content-container-type" :row-class-name="tableRowClassName">
          <el-table-column prop="currency" align="center" label="币种">
          </el-table-column>
          <el-table-column prop="priceCargoType" align="center" label="货物类型">
          </el-table-column>
          <el-table-column prop="priceMin" align="center" label="最低收费">
            <template slot-scope="scope">
              {{scope.row.priceMin?scope.row.priceMin:'---'}}
            </template>
          </el-table-column>
          <el-table-column prop="priceKg45" align="center" label="+45KG">
            <template slot-scope="scope">
              {{scope.row.priceKg45?scope.row.priceKg45:'---'}}
            </template>
          </el-table-column>
          <el-table-column prop="priceKg100" align="center" label="+100KG">
            <template slot-scope="scope">
              {{scope.row.priceKg100?scope.row.priceKg100:'---'}}
            </template>
          </el-table-column>
          <el-table-column prop="priceKg300" align="center" label="+300KG">
            <template slot-scope="scope">
              {{scope.row.priceKg300?scope.row.priceKg300:'---'}}
            </template>
          </el-table-column>
          <el-table-column prop="priceKg500" align="center" label="+500KG">
            <template slot-scope="scope">
              {{scope.row.priceKg500?scope.row.priceKg500:'---'}}
            </template>
          </el-table-column>
          <el-table-column prop="priceKg1000" align="center" label="+1000KG">
            <template slot-scope="scope">
              {{scope.row.priceKg1000?scope.row.priceKg1000:'---'}}
            </template>
          </el-table-column>
          <el-table-column prop="priceKg2000" align="center" label="+2000KG">
            <template slot-scope="scope">
              {{scope.row.priceKg2000?scope.row.priceKg2000:'---'}}
            </template>
          </el-table-column>
        </el-table>
        <div style="margin:20px 0;"></div>
        <h3>附加费</h3>
        <div style="margin:4px 0;"></div>
        <el-table :data="createItem.surcharges" border class="content-container-type" :row-class-name="tableRowClassSurcharges">
          <el-table-column prop="chargeEname" align="center" label="费用英文">
          </el-table-column>
          <el-table-column prop="chargeName" align="center" label="费用中文">
          </el-table-column>
          <el-table-column prop="payMode" align="center" label="付款方式">
            <template slot-scope="scope">
              {{getDictLabel('chargePayType', scope.row.payMode)}}
            </template>
          </el-table-column>
          <el-table-column prop="rateUnit" align="center" label="计费单位">
            <template slot-scope="scope">
              {{getDictLabel('airChargeSurchargeUnit', scope.row.rateUnit)}}
            </template>
          </el-table-column>
          <el-table-column prop="currency" align="center" label="币别">
          </el-table-column>
          <el-table-column prop="unitPrice" align="center" label="单价">
            <template slot-scope="scope">
              {{scope.row.unitPrice?scope.row.unitPrice:'---'}}
            </template>
          </el-table-column>
          <el-table-column prop="priceMin" align="center" label="最低收费">
            <template slot-scope="scope">
              {{scope.row.priceMin?scope.row.priceMin:'---'}}
            </template>
          </el-table-column>
          <el-table-column prop="remark" align="center" label="备注">
            <template slot-scope="scope">
              {{scope.row.remark?scope.row.remark:'---'}}
            </template>
          </el-table-column>
        </el-table>
        <div class="cost-money">
          <div class="left">
            <span>重量（KGS）： <el-input v-model="form.weight" maxlength="8" @input="changeWeight" style="width:80px" size="mini" placeholder="请输入重量"></el-input></span>
            <span>体积（CBM）：<el-input v-model="form.volume" maxlength="8" @input="changeWeight" style="width:80px" size="mini" placeholder="请输入体积"></el-input></span>
            <span>货物类型：{{findPricesItem?findPricesItem.priceCargoType:'--'}}</span>
          </div>
          <div class="right">
            <span>合计:
              <span v-for="(el, index) in totalPrice" :key="index" class="price-item">
                <span class="price-item-currency">{{el.label}}</span>
                <span class="price-item-price">{{el.value}}</span>
              </span>
              <span v-if="totalPrice.length==0">--</span>
            </span>
          </div>
        </div>
      </div>
      <div style="margin:8px 0;"></div>
      <p style="color:#BFBFBF">费用说明：实际费用以最终账单为准， 该费用不含后程限重费用</p>
      <div class="bottom">
        <ul class="left">
          <li>创建人：{{createItem.createdName}}
            <span>{{createItem.createdTime}} </span>
          </li>
          <li>维护人：{{createItem.maintainerName}} </li>
          <li>发布日期：
            <span>{{createItem.publishTime}}</span>
          </li>
        </ul>
        <div class="right">
        </div>
      </div>
    </div>
    <!-- 生成订单弹窗 -->
    <div v-if="createOrderPopShow">
      <CreateOrder @close="createOrderPopClose" />
    </div>
  </div>
</template>

<script>
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import CreateOrder from './createOrder'
import { getDictLabel } from '@/utils/tools'
import { airChargeCreateOrder, airChargeDetail } from '@/api/charge'
var timer = ''
export default {
  name: 'seaFreighDetail',
  mixins: [routerMixin],
  data() {
    return {
      findPricesItem: null, //匹配到的价格信息
      getDictLabel: getDictLabel,
      textarea: '',
      tabledata: {},
      createOrderPopShow: false,
      routeId: 0,
      oQuery: this.$route.query,
      createItem: {
        routeId: undefined,
        feederRouteId: undefined,
        feederOceanFreight: '',
        mainOceanFreight: ''
      },
      USD: '',
      CNY: '',
      form: {
        weight: '',
        volume: ''
      },
      //合计数量
      totalArr: [],
      tableData: [],
      tableDataList: [],
      employeeInfo: {}
    }
  },
  components: {
    CreateOrder
  },
  computed: {
    totalPrice() {
      let arr = [...this.surchargesCount, ...this.mainPrices]
      let result = []
      for (let i = 0; i < arr.length; i++) {
        if (result.find((el) => el.label == arr[i].currency)) {
          let index = result.findIndex((el) => el.label == arr[i].currency)
          result[index].value = Number(
            result[index].value + arr[i].price
          ).fixed(3)
        } else {
          result.push({
            label: arr[i].currency,
            value: arr[i].price
          })
        }
      }
      return result
    },
    surchargesCount() {
      // 附加费
      let arr = []
      if (
        !isNaN(this.form.weight) &&
        this.form.weight > 0 &&
        this.createItem.surcharges &&
        this.createItem.surcharges.length > 0
      ) {
        for (let i = 0; i < this.createItem.surcharges.length; i++) {
          let obj = {}
          if (this.createItem.surcharges[i].rateUnit === 'kg') {
            obj = {
              currency: this.createItem.surcharges[i].currency,
              price: Math.max(
                this.createItem.surcharges[i].unitPrice * this.form.weight,
                this.createItem.surcharges[i].priceMin
              )
            }
          } else {
            obj = {
              currency: this.createItem.surcharges[i].currency,
              price: this.createItem.surcharges[i].unitPrice
            }
          }
          obj.price = Number(obj.price).fixed(3)
          arr.push(obj)
        }
        return arr
      } else {
        return arr
      }
    },
    mainPrices() {
      // 主要费用-价格信息
      let arr = []
      if (this.findPricesItem) {
        let obj = {
          currency: this.findPricesItem.currency
        }
        if (this.form.weight >= 45 && this.form.weight < 100) {
          obj.price = this.form.weight * this.findPricesItem.priceKg45
        } else if (this.form.weight >= 100 && this.form.weight < 299) {
          obj.price = this.form.weight * this.findPricesItem.priceKg100
        } else if (this.form.weight >= 300 && this.form.weight < 499) {
          obj.price = this.form.weight * this.findPricesItem.priceKg300
        } else if (this.form.weight >= 500 && this.form.weight < 999) {
          obj.price = this.form.weight * this.findPricesItem.priceKg500
        } else if (this.form.weight >= 1000 && this.form.weight < 1999) {
          obj.price = this.form.weight * this.findPricesItem.priceKg1000
        } else if (this.form.weight >= 2000) {
          obj.price = this.form.weight * this.findPricesItem.priceKg2000
        } else {
          obj.price = this.form.weight * this.findPricesItem.priceMin
        }
        obj.price = Number(obj.price).fixed(3)
        arr.push(obj)
        return arr
      } else {
        return arr
      }
    },
    chargePrices() {
      // 恶心的计算价格
      if (this.createItem.chargePrices && this.createItem.chargePrices.length) {
        let arr = []
        for (let i = 0; i < this.createItem.chargePrices.length; i++) {
          // 中英文冒号统一
          let priceCargoType = this.createItem.chargePrices[
            i
          ].priceCargoType.replace(/：/g, ':')
          let priceCargoTypeArr = priceCargoType.split(':')
          if (!priceCargoType || priceCargoTypeArr.length === 2) {
            // 价格货物类型 格式只能 为空  或者 比值格式
            let obj = {}
            if (!priceCargoType) {
              obj = {
                priceCargoType: this.createItem.chargePrices[i].priceCargoType,
                currency: this.createItem.chargePrices[i].currency,
                priceMin: this.createItem.chargePrices[i].priceMin || 0,
                priceKg45: this.createItem.chargePrices[i].priceKg45 || 0,
                priceKg100: this.createItem.chargePrices[i].priceKg100 || 0,
                priceKg300: this.createItem.chargePrices[i].priceKg300 || 0,
                priceKg500: this.createItem.chargePrices[i].priceKg500 || 0,
                priceKg1000: this.createItem.chargePrices[i].priceKg1000 || 0,
                priceKg2000: this.createItem.chargePrices[i].priceKg2000 || 0,
                ratio: 0
              }
            } else {
              obj = {
                priceCargoType: this.createItem.chargePrices[i].priceCargoType,
                currency: this.createItem.chargePrices[i].currency,
                priceMin: this.createItem.chargePrices[i].priceMin || 0,
                priceKg45: this.createItem.chargePrices[i].priceKg45 || 0,
                priceKg100: this.createItem.chargePrices[i].priceKg100 || 0,
                priceKg300: this.createItem.chargePrices[i].priceKg300 || 0,
                priceKg500: this.createItem.chargePrices[i].priceKg500 || 0,
                priceKg1000: this.createItem.chargePrices[i].priceKg1000 || 0,
                priceKg2000: this.createItem.chargePrices[i].priceKg2000 || 0
              }
              if (
                !isNaN(priceCargoTypeArr[0]) &&
                priceCargoTypeArr[0] > 0 &&
                !isNaN(priceCargoTypeArr[1]) &&
                priceCargoTypeArr[1] > 0
              ) {
                console.log(priceCargoTypeArr[0])
                obj.ratio = Number(
                  priceCargoTypeArr[0] / priceCargoTypeArr[1]
                ).fixed(3)
              } else {
                obj.ratio = -1
              }
            }
            arr.push(obj)
          }
        }
        return arr
      } else {
        return []
      }
    }
  },
  activated() {
    this.form = {
      weight: '',
      volume: ''
    }
    this.getInfo()
  },
  created() {
    this.form = {
      weight: '',
      volume: ''
    }
    this.getInfo()
  },
  methods: {
    tableRowClassSurcharges({ row, rowIndex }) {
      console.log(row)
      if (
        !isNaN(this.form.weight) &&
        this.form.weight > 0 &&
        this.createItem.surcharges &&
        this.createItem.surcharges.length > 0
      ) {
        return 'air-freight-rate-select-row'
      }
      return ''
    },
    tableRowClassName({ row, rowIndex }) {
      console.log(row)
      if (
        this.findPricesItem &&
        row.priceCargoType == this.findPricesItem.priceCargoType
      ) {
        return 'air-freight-rate-select-row'
      }
      return ''
    },
    changeWeight(val) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (this.form.weight && this.form.volume) {
          if (isNaN(this.form.weight) || isNaN(this.form.volume)) {
            console.log('重量或体积输入有误')
            this.handlePrice(true)
          } else if (this.form.weight <= 0 || this.form.volume <= 0) {
            console.log('重量应该大于0')
          } else {
            this.handlePrice(false, this.form.weight, this.form.volume)
          }
        } else {
          console.log('请输入重量和体积')
          this.handlePrice(true)
        }
      }, 800)
    },
    handlePrice(isError, weight, volume) {
      // 计算总价格
      if (isError) {
        this.totalArr = []
        this.findPricesItem = null
      } else {
        let ratio = Number(weight / volume).fixed(3)
        console.log(ratio)
        let item = this.chargePrices.find((el) => el.ratio == ratio)
        if (item) {
          this.findPricesItem = item
        } else {
          item = this.chargePrices.find((el) => el.ratio == 0)
          if (item) {
            this.findPricesItem = item
          } else {
            this.findPricesItem = null
          }
        }
      }
    },
    // 取消
    handleCancel() {
      let views = this.$store.state.tagsView.visitedViews.filter(
        (item) => item.name === this.$route.name
      )
      this.$store.commit('tagsView/DEL_SAMEORDER_VISITED_VIEW', views)
      this.$router.push({
        name: 'AirFreightInquiry'
      })
    },
    // 详情
    getInfo() {
      airChargeDetail(this.$route.query.id).then((response) => {
        this.createItem = response.data
      })
    },
    // 新建订单关闭回调
    createOrderPopClose(action, value) {
      this.createOrderPopShow = false

      if (action === 'Confirm') {
        this.handleCreateOrder(value)
      }
    },
    // 新建订单保存
    handleCreateOrder(value) {
      let param = Object.assign(value, {
        chargeId: this.$route.query.id
      })
      airChargeCreateOrder(param).then((res) => {
        let orderNo = res.data
        sessionStorage.setItem('createAirOrderStr', JSON.stringify(res.data))

        let routeUrl = this.$router.resolve({
          name: 'AirTransportOrderDetail',
          params: {
            orderNo
          },
          query: {
            orderNo,
            source: 'AirFreightInquiryDetail',
            action: 'add'
          }
        })
        window.open(routeUrl.href, '_blank')
      })
    },
    // 生成订单
    handleCreate() {
      this.createOrderPopShow = true
      this.routeId = this.createItem.routeId
    }
  }
}
</script>

<style lang="scss" scoped>
.air-cost-info {
  flex: 1;
  height: 90px;
}
.eight-limit {
  .text {
    position: relative;
    top: 5px;
  }
}
.eight-weight-limit {
  margin-top: -12px;
  margin-left: 72px;
}
.eight-weight-group {
  margin-top: -16px;
  margin-left: 72px;
}
.weight-group {
  overflow: hidden;
  .last-flag + div {
    clear: left;
  }
  div,
  p {
    line-height: 20px;
    margin: 0;
  }
  div {
    float: left;
    padding-right: 10px;
  }
  .weight {
    display: inline-block;
    min-width: 310px;
    p {
      margin-bottom: 0px;
    }
  }
}
.seaFreightDetail {
  padding: 10px;
  .components-containe {
    padding: 10px 2%;
    background-color: #fff;
    .state-row {
      line-height: 28px;
      padding: 6px 10px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #ddd;
      .title {
        font-size: 12px;
        font-family: MicrosoftYaHei-Bold, MicrosoftYaHei;
        font-weight: bold;
        color: #222222;
      }
      .fl {
        font-size: 14px;
        float: left;
        color: #dd0000;
      }
      .btn {
        float: right;
        padding: 2px 5px;
      }
      &.invalid {
        background-color: rgba(230, 57, 35, 0.1);
      }
    }
    .head {
      border-bottom: 1px solid #e9e9e9;
      padding: 18px 0 12px;
      .btn {
        // position: absolute;
        float: right;
      }
      .title {
        font-size: 20px;
        color: #222222;
        display: flex;
        justify-content: center;
        span {
          font-weight: 600;
        }
        .action {
          display: block;
        }
        .center {
          position: relative;
          font-size: 15px;
          padding: 0px 32px 2px;
          color: #bfbfbf;
          border-bottom: 2px solid #bfbfbf;
          margin: 8px 18px;
          .triangle-bottomleft {
            width: 0;
            height: 0;
            position: relative;
            right: -32px;
            top: -3px;
            border-bottom: 4px solid #bfbfbf;
            border-right: 24px solid transparent;
          }
        }
      }
    }
    .content {
      margin-top: 10px;
      .grid-content {
        position: relative;
        // margin-top:10px;
        min-height: 56px;
        background: #3e80f5;
        border-radius: 2px;
        .left {
          width: 48px;
          position: absolute;
          left: 5px;
          top: 5px;
          padding: 7px 8px 10px 8px;
          //white-space:normal;//设置文字换行
          word-wrap: break-word; //设置数字强制换行
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.1);
          text-align: center;
          span {
            font-size: 13px;
            font-weight: 600;
            color: #fff;
          }
        }
        .right {
          position: absolute;
          top: 5px;
          left: 64px;
          width: 72%;
          font-size: 12px;
          p {
            color: #fff;
            line-height: 120%;
          }
          .icon {
            color: #ffffff;
            opacity: 0.5;
          }
        }
      }
      .el-col-customer-padding {
        // height:18px;
        padding-top: 2px;
      }
      .detail {
        margin-bottom: 10px;
        display: flex;
        white-space: nowrap; //强制换行（中英文有效）
        overflow: hidden; //隐藏超出的内容
        text-overflow: ellipsis; //超出的内容设置成省略号
        width: 100%;
        .tooltip-info {
          display: inline-block;
          width: calc(100% - 80px);
          white-space: nowrap; //强制换行（中英文有效）
          overflow: hidden; //隐藏超出的内容
          text-overflow: ellipsis; //超出的内容设置成省略号
        }
        span:first-child {
          color: #4a4a4a;
          width: 90px;
          text-align: right;
        }
        pre {
          width: calc(100% - 90px);
          white-space: pre-wrap;
          word-wrap: break-word;
          border: 1px solid #dedede;
          background-color: #e7eeff;
          padding: 2px;
          border-radius: 2px;
          line-height: 1.5;
        }
      }
      .cost-table {
        h3 {
          color: #222222;
        }
      }
      .cost-money {
        margin-top: 5px;
        background-color: #e7eeff;
        min-height: 32px;
        position: relative;
        display: flex;
        .left {
          display: flex;
          justify-content: center;
          align-items: center;
          position: absolute;
          left: 0px;
          padding: 6px;
          border-right: 1px solid #dfe6ec;
          span {
            margin-right: 32px;
          }
        }
        .right {
          display: flex;
          position: absolute;
          right: 0px;
          line-height: 32px;
          span {
            font-size: 14px;
            padding-right: 8px;
            color: #4a4a4a;
            font-weight: 600;
          }
          .price-item {
            font-size: 12px;
            .price-item-price {
              color: red;
            }
          }
        }
      }
    }
    .bottom {
      position: relative;
      margin-top: 50px;
      min-height: 40px;
      ul,
      li {
        list-style: none;
      }
      ul {
        position: absolute;
        left: 0;
        display: flex;
        line-height: 28px;
        li {
          padding-right: 64px;
        }
      }
      .right {
        position: absolute;
        right: 0;
      }
    }
    th {
      height: 6px;
      .cell {
        color: #222222;
        padding: -5px;
      }
    }
    td .cell {
      color: #4a4a4a;
    }
    .content-container-type td {
      border-right: 1px solid #dfe6ec !important;
    }
  }
  .current {
    text-align: center;
  }
  // el-form组件内label及内容区，各类输入框，行高和高度，
  .el-form-item__label {
    height: 20px !important;
    line-height: 20px !important;
    padding-right: 4px;
  }
  // 不能粗暴的设置.el-form-item__content高度20px, 因为存在多行或者文件上传的情况
  .el-form-item__content {
    line-height: 20px !important;
  }
  .el-input--mini .el-input__icon {
    line-height: 20px;
  }
  .el-input--mini .el-input__inner {
    line-height: 20px;
    height: 20px;
  }
  .stop-box {
    height: 30px;
    background-color: rgb(255, 244, 242);
    color: rgb(205, 65, 48);
    display: flex;
    align-items: center;
    padding: 0 10px;
    .icon {
      width: 16px;
      height: 16px;
      line-height: 16px;
      text-align: center;
      border-radius: 2px;
      background-color: rgb(205, 65, 48);
      color: #fff;
      margin-right: 10px;
    }
  }
}
</style>

<style lang="scss">
.popover-class {
  display: flex;
  align-items: center;
  .el-icon-postcard {
    font-size: 15px;
    margin-left: 5px;
    cursor: pointer;
    color: #409eff;
  }
}
.employeeName-list {
  font-size: 12px;
}
.air-freight-rate-select-row {
  background: #f0f9eb !important;
}
</style>
