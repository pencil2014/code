<template>
  <div class="edit-container order-book  fullWrap" id="containerList">
    <div class="order-container">
      <div class="tabs-container">
        <div class="detail-container flex">
          <div class="flex1 component-main-cont">
            <div class="service-container">
              <CustInfo :orderInfo="airOrderInfo" :returnDisabled="formSubmiting" />
              <div class="component-cont table-com-layout goods-wrap">
                <div class="goods-title">
                  <div class="title-left">货物信息</div>
                  <div class="title-right">
                    <el-button :disabled="(!isOp && !isBd) || airOrderInfo.orderStatus==='complete'" @click="handleSave" type="primary" size="mini">保存</el-button>
                  </div>
                </div>
                <div class="goodinfo-item">
                  <div class="title-info">
                    <div class="left">
                      <div class="title">预计货物</div>
                      <div class="goods-table-desc">
                        <span class="goods-table-item">预计合计: </span>
                        <span class="goods-table-item">件数: {{ predictCargoStat.totalQuantity?predictCargoStat.totalQuantity:0 }}件</span>
                        <span class="goods-table-item">毛重: {{ predictCargoStat.totalWeight?Number(predictCargoStat.totalWeight).fixed(3):0 }}KGS</span>
                        <span class="goods-table-item">体积: {{ predictCargoStat.totalVolume?Number(predictCargoStat.totalVolume).fixed(3):0 }}CBM</span>
                        <span class="goods-table-item">计费重量：<span>{{ predictCargoStat.chargeWeight?predictCargoStat.chargeWeight:'' }}KGS</span></span>
                      </div>
                    </div>
                    <div class="right">
                      <span class="expand" @click="predictCargoStatShow=!predictCargoStatShow"> {{ predictCargoStatShow ? '收起' : '展开' }}<i :class="predictCargoStatShow ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
                    </div>
                  </div>
                  <div class="goodinfo-main" v-show="predictCargoStatShow">
                    <div class="statistics-data">
                      <div class="goods-table-form">
                        <el-form label-position="right" inline label-width="70px" :model="predictCargoStat" :rules="summerRules" :show-message="false" ref="predictCargoStat" class="no-padding-form">
                          <el-form-item label="分泡比例" style="margin-bottom:6px">
                            <el-select size="mini" style="width:100px" v-model="predictCargoStat.bubblePoint" clearable placeholder="请选择" :disabled="(!isOp && !isBd)  || airOrderInfo.orderStatus==='complete'">
                              <el-option v-for="item in dictMap.airBubblePoint" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                            </el-select>
                          </el-form-item>
                          <el-form-item label="靠级重量" style="margin-bottom:6px" prop="levelWeight">
                            <el-input clearable style="width:100px" @input="validateNum(predictCargoStat, 'levelWeight')" size="mini" class="weight-input" v-model="predictCargoStat.levelWeight" placeholder="请输入" :disabled="(!isOp && !isBd)  || airOrderInfo.orderStatus==='complete'">
                            </el-input>
                          </el-form-item>
                          <!-- <el-form-item label="计费重量" style="margin-bottom:6px">
                            <el-input style="width:100px" size="mini" class="weight-input" disabled v-model="predictCargoStat.chargeWeight" placeholder="请输入">
                            </el-input>
                          </el-form-item> -->
                          <el-form-item label="预计结算重量" label-width="90px" style="margin-bottom:6px">
                            <el-input clearable style="width:100px" size="mini" class="weight-input" @input="validateNum(predictCargoStat, 'settleWeight','预计')" v-model="predictCargoStat.settleWeight" placeholder="请输入" :disabled="(!isOp && !isBd)  || airOrderInfo.orderStatus==='complete'">
                            </el-input>
                          </el-form-item>
                          <el-form-item label="重泡差" style="margin-bottom:6px">
                            <el-input clearable style="width:100px" size="mini" class="weight-input" disabled v-model="predictCargoStatCalBubbleWeight" placeholder="请输入">
                            </el-input>
                          </el-form-item>
                          <el-form-item label="分得比重" style="margin-bottom:6px">
                            <el-input clearable style="width:100px" size="mini" class="weight-input" disabled v-model="predictCargoStat.ratioWeight" placeholder="请输入">
                            </el-input>
                          </el-form-item>
                        </el-form>
                      </div>
                    </div>
                    <el-table header-row-class-name="goods-table-header" fit style="width: 100%" :data="predictCargos" @cell-mouse-enter="showTooltip" @cell-mouse-leave="hiddenTooltip">
                      <el-table-column prop="hscode" label="HS Code" align="center">
                        <template slot-scope="scope">
                          <span class="column-text">{{scope.row.hscode}}</span>
                        </template>
                      </el-table-column>
                      <el-table-column prop="cname" label="中文名称" align="center"> </el-table-column>
                      <el-table-column prop="ename" label="英文名称" align="center"> </el-table-column>
                      <el-table-column prop="quantity" label="件数" align="center"> </el-table-column>
                      <el-table-column prop="weight" label="毛重(KGS)" align="center"> </el-table-column>
                      <el-table-column prop="volume" label="体积(CBM)" align="center"> </el-table-column>
                      <el-table-column prop="packageInfo" label="包装" align="center"> </el-table-column>
                      <el-table-column prop="length" label="长(M)" align="center"> </el-table-column>
                      <el-table-column prop="width" label="宽(M)" align="center"> </el-table-column>
                      <el-table-column prop="height" label="高(M)" align="center" width="100px"> </el-table-column>
                    </el-table>
                    <table-tooltip :tableCellMouse="tableCellMouse"></table-tooltip>
                  </div>
                </div>
                <div class="goodinfo-item">
                  <div class="title-info">
                    <div class="left">
                      <div class="title">实际货物</div>
                      <div class="goods-table-desc">
                        <span class="goods-table-item">实际合计: </span>
                        <span class="goods-table-item">件数: {{ actualCargoStat.totalQuantity?actualCargoStat.totalQuantity:0 }}件</span>
                        <span class="goods-table-item">毛重: {{ actualCargoStat.totalWeight?Number(actualCargoStat.totalWeight).fixed(3):0 }}KGS</span>
                        <span class="goods-table-item">体积: {{ actualCargoStat.totalVolume?Number(actualCargoStat.totalVolume).fixed(3):0 }}CBM</span>
                        <!-- <span class="goods-table-item">订舱结算重量：<span>{{ actualCargoStat.settleWeight?Number(actualCargoStat.settleWeight).fixed(3):0 }}KGS</span></span> -->
                        <span class="goods-table-item">计费重量：<span>{{ actualCargoStat.chargeWeight?Number(actualCargoStat.chargeWeight).fixed(3):0 }}KGS</span></span>
                      </div>
                    </div>
                    <div class="right">
                      <span class="expand" @click="actualCargoStatShow=!actualCargoStatShow"> {{ actualCargoStatShow ? '收起' : '展开' }}<i :class="actualCargoStatShow ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
                    </div>
                  </div>
                  <div class="goodinfo-main" v-show="actualCargoStatShow">
                    <div class="statistics-data">
                      <div class="goods-table-form">
                        <el-form label-position="right" style="margin-right:auto;" inline label-width="70px" :model="actualCargoStat" :rules="summerRules" :show-message="false" ref="actualCargoStat" class="no-padding-form">
                          <el-form-item label="分泡比例" style="margin-bottom:6px">
                            <el-select size="mini" style="width:100px" v-model="actualCargoStat.bubblePoint" @change="actualBubblePointChange" clearable placeholder="请选择" :disabled="!isOp">
                              <el-option v-for="item in dictMap.airBubblePoint" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                            </el-select>
                          </el-form-item>
                          <el-form-item label="靠级重量" style="margin-bottom:6px" prop="levelWeight">
                            <el-input clearable @input="validateNum(actualCargoStat, 'levelWeight')" size="mini" style="width:100px" :disabled="!isOp" class="weight-input" v-model="actualCargoStat.levelWeight" placeholder="请输入">
                            </el-input>
                          </el-form-item>
                          <el-form-item label="订舱结算重量" style="margin-bottom:6px" prop="settleWeight" inline label-width="90px">
                            <el-input clearable :disabled="!isOp" style="width:100px" size="mini" class="weight-input" @input="validateNum(actualCargoStat, 'settleWeight','订舱')" v-model="actualCargoStat.settleWeight" placeholder="请输入">
                            </el-input>
                          </el-form-item>
                          <el-form-item label="重泡差" style="margin-bottom:6px" prop="calBubbleWeight">
                            <el-input clearable :disabled="!isOp" style="width:100px" size="mini" class="weight-input" @input="validateNum(actualCargoStat, 'calBubbleWeight')" v-model="actualCargoStat.calBubbleWeight" placeholder="请输入">
                            </el-input>
                          </el-form-item>
                          <el-form-item label="分得重量" style="margin-bottom:6px" prop="earnWeight">
                            <el-input clearable :disabled="!isOp" style="width:100px" size="mini" class="weight-input" @input="validateNum(actualCargoStat, 'earnWeight')" v-model="actualCargoStat.earnWeight" placeholder="请输入"></el-input>
                          </el-form-item>

                          <el-form-item label="可分泡重量" label-width="70px" style="margin-bottom:6px" prop="inputBubbleWeight">
                            <el-input clearable :disabled="!isOp" size="mini" style="width:100px" @input="validateNum(actualCargoStat, 'inputBubbleWeight','可')" class="weight-input" v-model="actualCargoStat.inputBubbleWeight" placeholder="请输入">
                            </el-input>
                          </el-form-item>
                        </el-form>
                      </div>
                    </div>
                    <div class="goods-table-buttons">
                      <el-button :disabled="!isOp || airOrderInfo.orderStatus==='complete'" @click="addActual" type="primary" size="mini">新增</el-button>
                      <el-button :disabled="!isOp || airOrderInfo.orderStatus==='complete'" @click="copyPredict" type="primary" size="mini">复制预计信息</el-button>
                    </div>
                    <CargoTable @handleDelete="handleDeleteActual" @cargoTableChange="cargoTableChange" :tabelType="'actualCargosTabelData'" :cargosTabelData="actualCargosTabelData" :isDisabled="!isOp || airOrderInfo.orderStatus==='complete'" ref="tabel1" />
                  </div>
                </div>
                <div class="goodinfo-item">
                  <div class="title-info">
                    <div class="left">
                      <div class="title">制单货物</div>
                      <div class="goods-table-desc">
                        <span class="goods-table-item">制单合计: </span>
                        <span class="goods-table-item">件数: {{ blCargoStat.totalQuantity?blCargoStat.totalQuantity:0 }}件</span>
                        <span class="goods-table-item">毛重: {{ blCargoStat.totalWeight?Number(blCargoStat.totalWeight).fixed(3):0 }}KGS</span>
                        <span class="goods-table-item">体积: {{ blCargoStat.totalVolume?Number(blCargoStat.totalVolume).fixed(3):0 }}CBM</span>
                        <span class="goods-table-item">计费重量：<span>{{ blCargoStat.chargeWeight?Number(blCargoStat.chargeWeight).fixed(3):0 }}KGS</span></span>
                      </div>
                    </div>
                    <div class="right">
                      <span class="expand" @click="blCargoStatShow=!blCargoStatShow"> {{ blCargoStatShow ? '收起' : '展开' }}<i :class="blCargoStatShow ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
                    </div>
                  </div>
                  <div class="goodinfo-main" v-show="blCargoStatShow">
                    <div class="statistics-data">
                      <div class="goods-table-form">
                        <el-form label-position="right" style="margin-right:auto;" inline label-width="70px" :model="blCargoStat" :rules="summerRules" :show-message="false" ref="blCargoStat" class="no-padding-form">
                          <el-form-item label="分泡比例" style="margin-bottom:6px">
                            <el-select size="mini" style="width:100px" v-model="blCargoStat.bubblePoint" @change="blBubblePointChange" clearable placeholder="请选择" :disabled="!isOp">
                              <el-option v-for="item in dictMap.airBubblePoint" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                            </el-select>
                          </el-form-item>
                          <el-form-item label="靠级重量" style="margin-bottom:6px" prop="levelWeight">
                            <el-input clearable @input="validateNum(blCargoStat, 'levelWeight')" size="mini" style="width:100px" :disabled="!isOp" class="weight-input" v-model="blCargoStat.levelWeight" placeholder="请输入">
                            </el-input>
                          </el-form-item>
                          <el-form-item label="客户结算重量" style="margin-bottom:6px" label-width="90px" prop="settleWeight">
                            <el-input clearable :disabled="!isOp" style="width:100px" size="mini" class="weight-input" @input="validateNum(blCargoStat, 'settleWeight','客户')" v-model="blCargoStat.settleWeight" placeholder="请输入">
                            </el-input>
                          </el-form-item>
                          <el-form-item label="重泡差" style="margin-bottom:6px" prop="calBubbleWeight">
                            <el-input clearable :disabled="!isOp" style="width:100px" size="mini" class="weight-input" @input="validateNum(blCargoStat, 'calBubbleWeight')" v-model="blCargoStat.calBubbleWeight" placeholder="请输入">
                            </el-input>
                          </el-form-item>
                          <el-form-item label="分得重量" style="margin-bottom:6px" prop="earnWeight">
                            <el-input clearable :disabled="!isOp" style="width:100px" size="mini" class="weight-input" @input="validateNum(blCargoStat, 'earnWeight')" v-model="blCargoStat.earnWeight" placeholder="请输入"></el-input>
                          </el-form-item>

                          <el-form-item label="待分泡重量" label-width="70px" style="margin-bottom:6px" prop="inputBubbleWeight">
                            <el-input clearable :disabled="!isOp" size="mini" style="width:100px" @input="validateNum(blCargoStat, 'inputBubbleWeight','可')" class="weight-input" v-model="blCargoStat.inputBubbleWeight" placeholder="请输入">
                            </el-input>
                          </el-form-item>
                        </el-form>
                      </div>
                    </div>
                    <div class="goods-table-buttons">
                      <el-button :disabled="!isOp || airOrderInfo.orderStatus==='complete'" @click="addBl" type="primary" size="mini">新增</el-button>
                      <el-button :disabled="!isOp || airOrderInfo.orderStatus==='complete'" @click="copyActual" type="primary" size="mini">复制实际信息</el-button>
                    </div>
                    <CargoTable @handleDelete="handleDeleteBl" @cargoTableChange="cargoTableChange" :tabelType="'blCargosTabelData'" :cargosTabelData="blCargosTabelData" :isDisabled="!isOp || airOrderInfo.orderStatus==='complete'" ref="tabel2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
const defaultCreateQuery = {
  oid: undefined, // id
  containerType: '', // 箱型
  isHeavy: '', // 是否重柜
  cn: '', // 箱号
  sn: '', // 封号
  so: '', // SO号
  packageInfo: '', // 包装
  quantity: '', // 件数
  weight: '', // 单柜重量
  volume: '', // 单柜体积
  emptyWeight: '', // 空柜重量
  weightMode: '', // 称重方法
  boxRemark: '', // 用箱要求
  boxStatus: '', // 装箱状态
  returnTime: '', // 还重柜时间
  specialLength: '', // 特种长
  specialWidth: '', // 特种宽
  specialHeight: '', // 特种高
  containerOwner: '', // 箱主
  containerCloser: '' // 封箱方
}

import { mapState } from 'vuex'
import { orderMixin } from '@/views/airTransport/order/mixins/orderMixin'
import { routerMixin } from '@/views/order/order/mixins/routerMixin'
import { airCargoList, airCargoSave } from '@/api/airTransport/order-import'
import CancelAlert from '../components/cancelAlert'
import RefuseAlert from '../components/refuseAlert'
import TopNav from '../components/topNav'
import LeftNav from '../components/leftNav'
import CustInfo from '../components/custInfo'
import CargoTable from './components/cargoTable'
import tableTooltip from '@/components/Base/Table/table-tooltip'
import {
  checkQuantityWeightVolume,
  validateNumPointEmpty,
  // validateCntextAndNum,
  validateEntextAndNum,
  validateIntegerQuantity
  // checkCalBubbleWeight
} from '@/utils/validate'
import { newAccAdd } from '@/utils/tools'
const rules = {
  hscode: [{ required: true, message: '请选择', trigger: 'change' }],
  cname: [
    { required: true, message: '请选择', trigger: 'change' }
    // { validator: validateCntextAndNum(), trigger: 'change' }
  ],
  ename: [
    { required: true, message: '请选择', trigger: 'change' },
    { validator: validateEntextAndNum(), trigger: 'change' }
  ],
  quantity: [
    { required: true, message: '请选择', trigger: 'change' },
    { validator: validateIntegerQuantity(), trigger: 'change' }
  ],
  weight: [
    { required: true, message: '请选择', trigger: 'change' },
    { validator: checkQuantityWeightVolume(), trigger: 'change' }
  ],
  volume: [
    { required: true, message: '请选择', trigger: 'change' },
    { validator: checkQuantityWeightVolume(), trigger: 'change' }
  ],
  packageInfo: [{ required: true, message: '请选择', trigger: 'change' }],
  length: [{ validator: validateNumPointEmpty(), trigger: 'change' }],
  width: [{ validator: validateNumPointEmpty(), trigger: 'change' }],
  height: [{ validator: validateNumPointEmpty(), trigger: 'change' }]
}
var timer = ''
export default {
  mixins: [orderMixin, routerMixin],
  data() {
    return {
      tableCellMouse: {
        cellDom: null, // 鼠标移入的cell-dom
        hidden: null, // 是否移除单元格
        row: null // 行数据
      },
      predictCargoStatShow: true,
      actualCargoStatShow: true,
      blCargoStatShow: true,
      summerRules: {
        levelWeight: [
          { required: false, message: '请输入', trigger: 'change' },
          { validator: checkQuantityWeightVolume(999999999), trigger: 'change' }
        ],
        earnWeight: [
          { required: false, message: '请输入', trigger: 'change' },
          { validator: checkQuantityWeightVolume(999999999), trigger: 'change' }
        ],
        chargeWeight: [
          { required: false, message: '请输入', trigger: 'change' },
          { validator: checkQuantityWeightVolume(999999999), trigger: 'change' }
        ],
        inputBubbleWeight: [
          { required: false, message: '请输入', trigger: 'change' },
          { validator: checkQuantityWeightVolume(999999999), trigger: 'change' }
        ],
        calBubbleWeight: [
          { required: false, message: '请输入', trigger: 'change' },
          {
            validator: checkQuantityWeightVolume(999999999),
            trigger: 'change'
          }
        ],
        calBubbleWeight: [
          { required: false, message: '请输入', trigger: 'change' },
          {
            validator: checkQuantityWeightVolume(999999999),
            trigger: 'change'
          }
        ],
        settleWeight: [
          { required: false, message: '请输入', trigger: 'change' },
          {
            validator: checkQuantityWeightVolume(999999999),
            trigger: 'change'
          }
        ]
      },
      predictCargos: [],
      predictCargoStat: {},
      actualCargoStat: {
        bubblePoint: '',
        levelWeight: '',
        inputBubbleWeight: '',
        totalQuantity: '',
        totalWeight: '',
        totalVolume: '',
        chargeWeight: '',
        ratioWeight: '',
        calBubbleWeight: '',
        settleWeight: '',
        earnWeight: ''
      },
      blCargoStat: {
        bubblePoint: '',
        levelWeight: '',
        inputBubbleWeight: '',
        totalQuantity: '',
        totalWeight: '',
        totalVolume: '',
        chargeWeight: '',
        ratioWeight: '',
        calBubbleWeight: '',
        settleWeight: '',
        earnWeight: ''
      },
      bubblePointOptions: [
        {
          value: '5/5',
          label: '半泡'
        },
        {
          value: '6/4',
          label: '6成泡'
        },
        {
          value: '2/8',
          label: '2/8泡'
        },
        {
          value: '2/3',
          label: '2/3泡'
        },
        {
          value: '3/7',
          label: '3/7泡'
        }
      ],
      ratioValue: '',
      oQuery: this.$route.query,
      containerList: [],
      uploadPopShow: false,
      uploadResultShow: false,
      UploadResultValues: {},
      createItem: Object.assign({}, defaultCreateQuery),
      formSubmiting: false,
      activityKey: 'GoodsInfo',
      // multipleSelection: [],
      packageTypeOptions: [],
      actualCargosTabelData: {
        // 实际货物信息
        list: [],
        rules: rules
      },
      blCargosTabelData: {
        list: [],
        rules: rules
      }
    }
  },
  created() {
    this.getAirCargoList()
  },
  mounted() {
    console.log('🚀 ~ this.dictMap.airBubblePoint', this.dictMap.airBubblePoint)
    if (window.history && window.history.pushState) {
      history.pushState(null, null, document.URL)
      window.addEventListener('popstate', this.browserBack, false)
    }
  },

  destroyed() {
    window.removeEventListener('popstate', this.browserBack, false)
  },

  computed: {
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      roles: (state) => state.user.roles,
      userId: (state) => state.user.userId,
      airOrderInfo: (state) => state.airTransport.airOrderInfo,
      userEditRoles: (state) => state.airTransport.orderList.userEditRoles,
      ordDetRole: (state) => state.airTransport.orderList.ordDetRole
    }),
    isBd() {
      return this.ordDetRole === 'bd' || !this.ordDetRole
    },
    bdId() {
      // 当前参与人-业务（建单人的用户id）
      let { workAssign } = this.airOrderInfo
      let bdItem = workAssign && workAssign.find((el) => el.jobCode === 'bd')
      if (bdItem && bdItem.employeeId) {
        return bdItem.employeeId
      }
      return ''
    },
    obdId() {
      // 当前参与人-业务（建单人的用户id）
      let { workAssign } = this.airOrderInfo
      let obdItem = workAssign && workAssign.find((el) => el.jobCode === 'obd')
      if (obdItem && obdItem.employeeId) {
        return obdItem.employeeId
      }
      return ''
    },
    asstId() {
      // 当前参与人-业务（建单人的用户id）
      let { workAssign } = this.airOrderInfo
      let asstItem =
        workAssign && workAssign.find((el) => el.jobCode === 'asst')
      if (asstItem && asstItem.employeeId) {
        return asstItem.employeeId
      }
      return ''
    },
    predictCargoStatSettleWeight() {
      let bub = 1
      let num = ''
      switch (this.predictCargoStat.bubblePoint) {
        case '5/5': // 半泡
          bub = 0.5
          break
        case '4/6': // 6成泡
          bub = 0.4
          break
        case '2/8': // 2/8泡
          bub = 0.2
          break
        case '1/2': // 2/3泡
          bub = 0.3333
          break
        case '3/7': // 3/7泡
          bub = 0.3
          break
        default:
          break
      }
      let calBubbleWeight = this.predictCargoStat.calBubbleWeight
        ? this.predictCargoStat.calBubbleWeight
        : Number(
            this.predictCargoStat.totalVolume * 166.67 -
              this.predictCargoStat.totalWeight
          ).fixed(3)
      if (bub) {
        num = newAccAdd(
          calBubbleWeight * bub,
          this.predictCargoStat.totalWeight * 1
        )
      }
      return num
    },
    predictCargoStatCalBubbleWeight() {
      //预计重泡差
      if (
        !isNaN(this.predictCargoStat.totalVolume) &&
        !isNaN(this.predictCargoStat.totalWeight)
      ) {
        if (
          this.predictCargoStat.totalVolume * 166.67 -
            this.predictCargoStat.totalWeight >
          0
        ) {
          return Number(
            this.predictCargoStat.totalVolume * 166.67 -
              this.predictCargoStat.totalWeight
          ).fixed(3)
        }
      }
    }
  },
  watch: {
    'predictCargoStat.bubblePoint'(newVal) {
      let bub = 1
      let chargeWeight = ''
      switch (newVal) {
        case '5/5': // 半泡
          bub = 0.5
          break
        case '4/6': // 6成泡
          bub = 0.4
          break
        case '2/8': // 2/8泡
          bub = 0.2
          break
        case '1/2': // 2/3泡
          bub = 0.3333
          break
        case '3/7': // 3/7泡
          bub = 0.3
          break
        default:
          break
      }
      console.log(bub)
      // 3.	泡货的成本计费重计算方法 （体积重-实际毛重）*分泡系数+实际毛重
      chargeWeight = this.getChargeWeight(
        this.predictCargoStat.totalVolume,
        this.predictCargoStat.totalWeight,
        bub,
        this.predictCargoStat.levelWeight
      )
      this.$set(this.predictCargoStat, 'chargeWeight', chargeWeight)
      // this.predictCargoStat.chargeWeight=chargeWeight
    },
    'predictCargoStat.levelWeight'() {
      let bub = 1
      let chargeWeight = ''
      switch (this.predictCargoStat.bubblePoint) {
        case '5/5': // 半泡
          bub = 0.5
          break
        case '4/6': // 6成泡
          bub = 0.4
          break
        case '2/8': // 2/8泡
          bub = 0.2
          break
        case '1/2': // 2/3泡
          bub = 0.3333
          break
        case '3/7': // 3/7泡
          bub = 0.3
          break
        default:
          break
      }
      // 3.	泡货的成本计费重计算方法 （体积重-实际毛重）*分泡系数+实际毛重
      chargeWeight = this.getChargeWeight(
        this.predictCargoStat.totalVolume,
        this.predictCargoStat.totalWeight,
        bub,
        this.predictCargoStat.levelWeight
      )
      this.$set(this.predictCargoStat, 'chargeWeight', chargeWeight)
    },
    'actualCargoStat.levelWeight'() {
      let bub = 1
      let chargeWeight = ''
      switch (this.actualCargoStat.bubblePoint) {
        case '5/5': // 半泡
          bub = 0.5
          break
        case '4/6': // 6成泡
          bub = 0.4
          break
        case '2/8': // 2/8泡
          bub = 0.2
          break
        case '1/2': // 2/3泡
          bub = 0.3333
          break
        case '3/7': // 3/7泡
          bub = 0.3
          break
        default:
          break
      }
      // 3.	泡货的成本计费重计算方法 （体积重-实际毛重）*分泡系数+实际毛重
      chargeWeight = this.getChargeWeight(
        this.actualCargoStat.totalVolume,
        this.actualCargoStat.totalWeight,
        bub,
        this.actualCargoStat.levelWeight
      )
      this.$set(this.actualCargoStat, 'chargeWeight', chargeWeight)
    },
    'blCargoStat.levelWeight'() {
      let bub = 1
      let chargeWeight = ''
      switch (this.blCargoStat.bubblePoint) {
        case '5/5': // 半泡
          bub = 0.5
          break
        case '4/6': // 6成泡
          bub = 0.4
          break
        case '2/8': // 2/8泡
          bub = 0.2
          break
        case '1/2': // 2/3泡
          bub = 0.3333
          break
        case '3/7': // 3/7泡
          bub = 0.3
          break
        default:
          break
      }
      // 3.	泡货的成本计费重计算方法 （体积重-实际毛重）*分泡系数+实际毛重
      chargeWeight = this.getChargeWeight(
        this.blCargoStat.totalVolume,
        this.blCargoStat.totalWeight,
        bub,
        this.blCargoStat.levelWeight
      )
      this.$set(this.blCargoStat, 'chargeWeight', chargeWeight)
    }
  },
  components: {
    CancelAlert,
    RefuseAlert,
    TopNav,
    LeftNav,
    CustInfo,
    CargoTable,
    tableTooltip
  },
  methods: {
    // 鼠标移入cell
    showTooltip(row, column, cell) {
      this.tableCellMouse.cellDom = cell
      this.tableCellMouse.row = row
      this.tableCellMouse.hidden = false
    },
    // 鼠标移出cell
    hiddenTooltip() {
      this.tableCellMouse.hidden = true
    },
    getChargeWeight(a = 0, b = 0, c = 1, d) {
      // a体积，b毛重，c分泡系数 ,计算计费重量 无分泡比例，体积重和毛重取大值
      if (isNaN(d)) {
        d = 0
      }
      if (c != 1) {
        let chargeWeight = (a * 166.67 - b) * c + b
        return Number(Math.max(chargeWeight, d * 1)).fixed(3)
      } else {
        return Number(Math.max(a * 166.67, b * 1, d * 1)).fixed(3)
      }
    },
    blBubblePointChange(val) {
      // 制单货物分泡比例改变
      let bub = 1
      switch (val) {
        case '5/5':
          bub = 0.5
          break
        case '4/6':
          bub = 0.4
          break
        case '2/8':
          bub = 0.2
          break
        case '1/2':
          bub = 0.3333
          break
        case '3/7':
          bub = 0.3
          break
        default:
          break
      }
      let chargeWeight = this.getChargeWeight(
        this.blCargoStat.totalVolume,
        this.blCargoStat.totalWeight,
        bub,
        this.blCargoStat.levelWeight
      )
      this.$set(this.blCargoStat, 'chargeWeight', chargeWeight)
    },
    actualBubblePointChange(val) {
      // 实际货物分泡比例发生变化
      let bub = 1
      switch (val) {
        case '5/5':
          bub = 0.5
          break
        case '4/6':
          bub = 0.4
          break
        case '2/8':
          bub = 0.2
          break
        case '1/2':
          bub = 0.3333
          break
        case '3/7':
          bub = 0.3
          break
        default:
          break
      }
      let chargeWeight = this.getChargeWeight(
        this.actualCargoStat.totalVolume,
        this.actualCargoStat.totalWeight,
        bub,
        this.blCargoStat.levelWeight
      )
      this.$set(this.actualCargoStat, 'chargeWeight', chargeWeight)
    },
    validateForm1() {
      return new Promise((resolve, reject) => {
        this.$refs.predictCargoStat.validate((valid) => {
          if (valid) {
            resolve()
          } else {
            reject()
          }
        })
      })
    },
    validateForm2() {
      return new Promise((resolve, reject) => {
        this.$refs.actualCargoStat.validate((valid) => {
          if (valid) {
            resolve()
          } else {
            reject()
          }
        })
      })
    },
    validateForm3() {
      return new Promise((resolve, reject) => {
        this.$refs.blCargoStat.validate((valid) => {
          if (valid) {
            resolve()
          } else {
            reject()
          }
        })
      })
    },
    validateAllForm() {
      // 校验所有表单
      return new Promise((resolve, reject) => {
        let formList = [
          this.$refs.tabel1.validateForm(),
          this.$refs.tabel2.validateForm(),
          this.validateForm1(),
          this.validateForm2(),
          this.validateForm3()
        ]
        Promise.all(formList)
          .then(() => {
            resolve()
          })
          .catch((err) => {
            console.log(err)
            reject()
          })
      })
    },
    handleSave() {
      this.validateAllForm()
        .then(() => {
          if (
            this.actualCargoStat.totalQuantity > 999999999 ||
            this.actualCargoStat.totalWeight > 999999999 ||
            this.actualCargoStat.totalVolume > 999999999 ||
            this.actualCargoStat.chargeWeight > 999999999 ||
            this.actualCargoStat.calBubbleWeight > 999999999 ||
            this.actualCargoStat.earnWeight > 999999999 ||
            this.actualCargoStat.settleWeight > 999999999 ||
            this.blCargoStat.totalQuantity > 999999999 ||
            this.blCargoStat.totalWeight > 999999999 ||
            this.blCargoStat.totalVolume > 999999999 ||
            this.blCargoStat.chargeWeight > 999999999 ||
            this.blCargoStat.calBubbleWeight > 999999999 ||
            this.blCargoStat.earnWeight > 999999999 ||
            this.blCargoStat.settleWeight > 999999999
          ) {
            this.$message.error('货物合计数量不能超过999999999')
            return
          }
          let actualCargosTabelData = this.actualCargosTabelData.list.map(
            // 删除hscode下拉数据
            (item) => {
              return Object.keys(item).reduce((obj, key) => {
                if (key === 'hscodeOptions') return obj
                obj[key] = item[key]
                return obj
              }, {})
            }
          )
          let blCargosTabelData = this.blCargosTabelData.list.map((item) => {
            return Object.keys(item).reduce((obj, key) => {
              if (key === 'hscodeOptions') return obj
              obj[key] = item[key]
              return obj
            }, {})
          })
          let query = {
            orderNo: this.$route.query.orderNo,
            actualCargoStat: this.actualCargoStat, // 实际
            actualCargos: actualCargosTabelData,
            blCargoStat: this.blCargoStat, // 制单货物
            blCargos: blCargosTabelData,
            predictCargoStat: this.predictCargoStat,
            predictCargos: this.predictCargos
          }
          if (this.$route.query.jointNo) {
            query.jointNo = this.$route.query.jointNo
          }
          airCargoSave(query).then(() => {
            this.$message.success('保存成功')
            this.getAirCargoList()
          })
        })
        .catch(() => {
          this.$message.error('请按要求填写数据')
        })
    },
    cargoTableChange(params1, params2) {
      if (params1 === 'actualCargosTabelData') {
        this.actualCargosTabelDataChange(params2)
      }
      if (params1 === 'blCargosTabelData') {
        this.blCargosTabelDataChange(params2)
      }
    },
    actualCargosTabelDataChange(params1) {
      // 实际货物，初始化/删除/复制事操作,params1:是否更改了毛总或者体积
      let newVal = this.actualCargosTabelData.list
      let totalQuantity = 0
      let totalWeight = 0
      let totalVolume = 0
      let bub = 1
      switch (this.actualCargoStat.bubblePoint) {
        case '5/5':
          bub = 0.5
          break
        case '4/6':
          bub = 0.4
          break
        case '2/8':
          bub = 0.2
          break
        case '1/2':
          bub = 0.3333
          break
        case '3/7':
          bub = 0.3
          break
        default:
          break
      }
      for (let i = 0; i < newVal.length; i++) {
        if (!isNaN(newVal[i].quantity)) {
          // 件数
          totalQuantity += newVal[i].quantity * 1
        }
        if (!isNaN(newVal[i].weight)) {
          // 毛重
          totalWeight += newVal[i].weight * 1
        }
        if (!isNaN(newVal[i].volume)) {
          // 体积
          totalVolume += newVal[i].volume * 1
        }
      }
      this.actualCargoStat.totalQuantity = totalQuantity
      this.actualCargoStat.totalWeight = totalWeight
      this.actualCargoStat.totalVolume = totalVolume
      // 重泡差
      if (params1) {
        if (totalVolume * 166.67 - totalWeight > 0) {
          this.actualCargoStat.calBubbleWeight = Number(
            totalVolume * 166.67 - totalWeight
          ).fixed(3)
        } else {
          this.actualCargoStat.calBubbleWeight = ''
        }
        // 计费重量
        this.actualCargoStat.chargeWeight = this.getChargeWeight(
          totalVolume,
          totalWeight,
          bub,
          this.blCargoStat.levelWeight
        )
      }
    },
    blCargosTabelDataChange(params1) {
      // 制单货物，初始化/删除/复制事操作,params1:是否更改了毛总或者体积,需要更新到重泡差等数据
      let newVal = this.blCargosTabelData.list
      let totalQuantity = 0
      let totalWeight = 0
      let totalVolume = 0
      let bub = 1
      switch (this.blCargoStat.bubblePoint) {
        case '5/5':
          bub = 0.5
          break
        case '4/6':
          bub = 0.4
          break
        case '2/8':
          bub = 0.2
          break
        case '1/2':
          bub = 0.3333
          break
        case '3/7':
          bub = 0.3
          break
        default:
          break
      }
      for (let i = 0; i < newVal.length; i++) {
        if (!isNaN(newVal[i].quantity)) {
          // 件数
          totalQuantity += newVal[i].quantity * 1
        }
        if (!isNaN(newVal[i].weight)) {
          // 毛重
          totalWeight += newVal[i].weight * 1
        }
        if (!isNaN(newVal[i].volume)) {
          // 体积
          totalVolume += newVal[i].volume * 1
        }
      }
      this.blCargoStat.totalQuantity = totalQuantity
      this.blCargoStat.totalWeight = totalWeight
      this.blCargoStat.totalVolume = totalVolume
      if (params1) {
        // 重泡差
        if (totalVolume * 166.67 - totalWeight > 0) {
          this.blCargoStat.calBubbleWeight = Number(
            totalVolume * 166.67 - totalWeight
          ).fixed(3)
        } else {
          this.blCargoStat.calBubbleWeight = ''
        }
        // 计费重量
        this.blCargoStat.chargeWeight = this.getChargeWeight(
          totalVolume,
          totalWeight,
          bub,
          this.blCargoStat.levelWeight
        )
      }
    },
    //删除一行-实际货物
    handleDeleteActual(index) {
      let deleteObj = this.actualCargosTabelData.list[index]
      let params = false
      if (deleteObj.volume || deleteObj.weight) {
        params = true
      }
      this.actualCargosTabelData.list.splice(index, 1)
      this.actualCargosTabelDataChange(params)
    },
    //删除一行-制单货物
    handleDeleteBl(index) {
      let deleteObj = this.blCargosTabelData.list[index]
      let params = false
      if (deleteObj.volume || deleteObj.weight) {
        params = true
      }
      this.blCargosTabelData.list.splice(index, 1)
      this.blCargosTabelDataChange(params)
    },
    //复制预计数据到实际数据
    copyPredict() {
      this.predictCargosCopy = JSON.parse(JSON.stringify(this.predictCargos))
      this.predictCargosCopy.map((item) => {
        delete item.oid
        item.cargoPurpose = 'actual'
      })
      this.actualCargoStat.bubblePoint = this.predictCargoStat.bubblePoint
      this.actualCargoStat.levelWeight = this.predictCargoStat.levelWeight
      this.actualCargoStat.settleWeight = this.predictCargoStat.settleWeight

      this.actualCargosTabelData.list = [...this.predictCargosCopy]
      this.actualCargosTabelDataChange(true)
    },
    //复制实际数据到制单数据
    copyActual() {
      this.actualCargosCopy = JSON.parse(
        JSON.stringify(this.actualCargosTabelData.list)
      )
      this.actualCargosCopy.map((item) => {
        delete item.oid
        item.cargoPurpose = 'bl'
      })

      this.blCargoStat.bubblePoint = this.actualCargoStat.bubblePoint
      this.blCargoStat.levelWeight = this.actualCargoStat.levelWeight
      this.blCargoStat.settleWeight = this.actualCargoStat.settleWeight
      this.blCargoStat.earnWeight = this.actualCargoStat.earnWeight
      this.blCargoStat.inputBubbleWeight =
        this.actualCargoStat.inputBubbleWeight

      this.blCargosTabelData.list = [...this.actualCargosCopy]
      this.blCargosTabelDataChange(true)
    },
    //新增一条实际数据
    addActual() {
      this.actualCargosTabelData.list.push({
        cargoPurpose: 'actual',
        cname: '',
        commodityTypeCode: '',
        createdBy: null,
        createdName: '',
        createdTime: null,
        ename: '',
        height: '',
        length: '',
        mark: '',
        orderNo: '',
        packageInfo: '',
        property: '',
        propertyName: '',
        quantity: '',
        revision: null,
        state: 'valid',
        updatedBy: 0,
        updatedName: '',
        updatedTime: '',
        volume: '',
        weight: '',
        width: '',
        hscode: ''
      })
    },
    //新增一条制单数据
    addBl() {
      this.blCargosTabelData.list.push({
        cargoPurpose: 'bl',
        cname: '',
        commodityTypeCode: '',
        createdBy: null,
        createdName: '',
        createdTime: null,
        ename: '',
        height: '',
        length: '',
        mark: '',
        orderNo: '',
        packageInfo: '',
        property: '',
        propertyName: '',
        quantity: '',
        revision: null,
        state: 'valid',
        updatedBy: 0,
        updatedName: '',
        updatedTime: '',
        volume: '',
        weight: '',
        width: '',
        hscode: ''
      })
    },
    // 数字校验
    validateNum(row, prop, text) {
      const reg =
        /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,3}|[1-9][0-9]*\.\d{1,3})))$/
      clearTimeout(timer)
      timer = setTimeout(() => {
        let message = '数字'
        switch (prop) {
          case 'quantity':
            message = '件数'
            break
          case 'volume':
            message = '体积'
            break
          case 'weight':
            message = '毛重'
            break

          case 'length':
            message = '长度'
            break
          case 'width':
            message = '宽度'
            break
          case 'height':
            message = '高度'
            break
          case 'settleWeight':
            message = `${text}结算重量`
            break
          case 'levelWeight':
            message = '靠级重量'
            break
          case 'earnWeight':
            message = '分得重量'
            break
          case 'chargeWeight':
            message = '计费重量'
            break
          case 'calBubbleWeight':
            message = '重泡差'
            break
          case 'inputBubbleWeight':
            message = `${text}分泡重量`
            break
          default:
            break
        }

        if (!row[prop]) {
          return false
        } else if (!reg.test(row[prop]) || row[prop] > 999999999) {
          let lastStr = row[prop].substr(row[prop].length - 1, 1)
          if (isNaN(row[prop])) {
            this.$message({
              message: `${message}请输入0-999999999的数字，小数点最多3位`,
              type: 'error',
              duration: 2000
            })
            row[prop] = ''
          } else if (row[prop] > 999999999) {
            this.$message({
              message: `${message}请输入0-999999999的数字，小数点最多3位`,
              type: 'error',
              duration: 2000
            })
            row[prop] = 999999999
          } else if (lastStr !== '.') {
            this.$message({
              message: `${message}请输入0-999999999的数字，小数点最多3位`,
              type: 'error',
              duration: 2000
            })
            row[prop] = Number(row[prop] * 1).fixed(3)
          }
        }
      }, 800)
    },
    // 获取货物列表
    getAirCargoList() {
      airCargoList({
        orderNo: this.$route.query.orderNo
      }).then((res) => {
        if (!res.data) return
        this.predictCargoStat = res.data.predictCargoStat
          ? res.data.predictCargoStat
          : {}
        if (res.data.actualCargoStat) {
          this.actualCargoStat = res.data.actualCargoStat
        }
        if (res.data.blCargoStat) {
          this.blCargoStat = res.data.blCargoStat
        }
        this.actualCargosTabelData.list = res.data.actualCargos
          ? res.data.actualCargos
          : []
        this.blCargosTabelData.list = res.data.blCargos ? res.data.blCargos : []
        this.predictCargos = res.data.predictCargos
          ? res.data.predictCargos
          : []

        this.actualCargosTabelDataChange(false)
        this.blCargosTabelDataChange(false)
      })
    }
  }
}
</script>

<style lang="scss">
@import '../../less/index.scss';
.containerList-cont {
  overflow-y: auto;
}
.goods-wrap {
  .goods-title {
    height: 24px;
    line-height: 24px;
    background: #ffffff;
    // box-shadow: 0px 1px 0px 0px #e9e9e9;
    border-radius: 2px 2px 0px 0px;
    font-size: 14px;
    font-weight: 600;
    color: #222222;
    display: flex;
    justify-content: space-between;
  }
  .goods-table-title {
    font-weight: 600;
    color: #222222;
  }

  .goods-table-form {
    color: #222222;
    padding: 10px 0;
    display: flex;
    gap: 20px;
    .table-form {
      .weight-input {
        width: 170px;
      }
    }
  }
  .goods-table-header {
    font-weight: 600;
    color: #222222;
  }
}
.cnDetail-form {
  .el-form-item__label {
    line-height: 20px;
  }
  .special-item {
    .el-form-item__content {
      margin-top: 20px;
    }
  }
}
.no-padding-form {
  .el-form-item__label {
    padding-right: 4px !important;
  }
}
.goodinfo-item {
  border: 1px solid #e9e9e9;
  border-radius: 4px;
  margin: 5px 0 0;
  overflow: hidden;
  .title-info {
    background: #f8f9fd;
    border-radius: 4px 4px 0px 0px;
    height: 32px;
    line-height: 32px;
    display: flex;
    justify-content: space-between;
    padding: 0 12px;
    .left {
      display: flex;
      align-items: center;
      .title {
        font-size: 14px;
        font-weight: bold;
      }
      .goods-table-desc {
        color: #222222;
        margin-left: 40px;
        .goods-table-item {
          margin-right: 16px;
        }
      }
    }
    .right {
      .expand {
        cursor: pointer;
      }
    }
  }
  .goodinfo-main {
    padding: 0 12px 8px;
    .no-padding-form {
      .el-form-item__label {
        padding-right: 4px !important;
      }
    }
    .statistics-data {
      border-bottom: 1px solid #e9e9e9;
      margin-bottom: 6px;
    }
    .goods-table-buttons {
      margin-bottom: 6px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
