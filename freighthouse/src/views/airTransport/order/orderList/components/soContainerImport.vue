<template>
  <div class="so-container  cargo-container">
    <el-form-item class="so-row-cont">
      <div class="row-cont-tit">
        <span class="tit">客户信息</span>
        <div class="row-cont-rt">
          <span class="expand" @click="handleToogleExpand()"> {{ isShow ? '收起' : '展开' }}<i :class="isShow ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i> </span>
        </div>
      </div>
      <div v-show="isShow" style="padding: 8px 0 5px">
        <el-form :model="soContainerData" ref="airSoContainer" label-width="70px" :show-message="false">
          <div class="row-flex flex-so" v-for="(el,index) in soContainerData.formData" :key="index">
            <i class="el-icon-circle-plus-outline plus-minus-outline" v-if="!disabledState" @click="handleAddContainerList"></i>
            <i class="el-icon-remove-outline plus-minus-outline" v-if="index > 0 && !disabledState" @click="handleDeleteContainerList(index)"></i>
            <div :class="{'form-box':!disabledState,'form-box100':disabledState}">
              <el-col :lg="{span: '4'}">
                <el-form-item class="min-width200" label="收货单位" :prop="'formData.'+index+'.cargoCustId'" :rules="soContainerData.rules.cargoCustId">
                  <el-select v-if="!disabledState" v-model="el.cargoCustId" size="mini" :disabled="disabledState" @change="setCargoCustName(el.cargoCustId,index)" clearable remote :filterable="true" @visible-change="custVisibleChange" :remote-method="custFilterMehod" placeholder="请选择" style="width: 100%">
                    <el-option v-for="(item, a) in shipperCustidOptions" :label="item.label" :value="item.value" :key="a"></el-option>
                  </el-select>
                  <el-input v-else v-model="el.cargoCustName" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :lg="{span: '4'}">
                <el-form-item class="min-width200" label="货好时间" :prop="'formData.'+index+'.cargoReadyTime'" :rules="soContainerData.rules.cargoReadyTime">
                  <elDatePickerLimit size="mini" v-model="el.cargoReadyTime" :disabled="disabledState" type="date" style="width: 100%" clearable placeholder="请选择时间" value-format="yyyy-MM-dd" />
                </el-form-item>
              </el-col>
              <el-col :lg="{span: '4'}">
                <el-form-item class="min-width200" label="单据方式">
                  <el-select size="mini" v-model="el.cargoBillType" style="width: 100%" clearable placeholder="请选择" :disabled="disabledState">
                    <el-option v-for="item in dictMap.airCargoBillType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :lg="{span: '4'}">
                <el-form-item class="min-width200" label="货物方式">
                  <el-select size="mini" v-model="el.cargoType" style="width: 100%" clearable placeholder="请选择" :disabled="disabledState">
                    <el-option v-for="item in dictMap.airCargoType" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </div>
          </div>

        </el-form>
      </div>
    </el-form-item>
    <!-- <el-button @click="validateForm">校验</el-button> -->
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { citySelectList } from '@/api/base'
import { unique } from '@/utils'
const dateObj = {
  formData: [
    {
      cargoCustId: null, //发货单位
      cargoCustName: '', //发货单位名称
      cargoReadyTime: null, //发货时间
      cargoBillType: '', // 单据方式
      cargoType: '', // 货物方式
      poDealAddress: '', // 交仓地点
      poDealTime: '' // 交仓时间
    }
  ]
}
export default {
  name: 'airSoContainerImport',
  data() {
    return {
      oQuery: this.$route.query,
      pickerOptions: {
        disabledDate(date) {
          return date.getTime() < Date.now() - 24 * 60 * 60 * 1000
        }
      },
      isShow: true,
      shipperCustidOptions: [], // 发货单位下拉数据
      cityList: [] // 交仓地点
    }
  },
  props: {
    soContainerData: {
      type: Object,
      default: () => dateObj
    },
    orderStatus: {
      type: String,
      default: ''
    },
    isPricing: {
      type: Boolean,
      default: false
    },
    isBd: {
      type: Boolean,
      default: false
    },
    isOp: {
      type: Boolean,
      default: false
    }
  },
  model: {
    prop: 'soContainerData',
    event: 'update'
  },
  created() {
    this.soContainerData.rules = {
      cargoCustId: [
        { required: true, message: '请选择发货单位', trigger: 'change' }
      ],
      cargoReadyTime: [
        { required: true, message: '请选择发货时间', trigger: 'change' }
      ],
      cargoBillType: [
        { required: true, message: '请选择单据方式', trigger: 'change' }
      ],
      cargoType: [
        { required: true, message: '请选择货物方式', trigger: 'change' }
      ],
      poDealAddress: [
        { required: true, message: '请选择交仓地点', trigger: 'change' }
      ],
      poDealTime: [
        { required: true, message: '请选择交仓时间', trigger: 'change' }
      ]
    }
    // if (this.disabledState) {
    //   // 处理多个客户信息数据远程搜索的调用了重复的接口
    // }
  },
  mounted() {
    console.log(this.soContainerData.formData)
  },
  computed: {
    oldSoContainerData() {
      let arr = []
      for (let i = 0; i < this.soContainerData.formData.length; i++) {
        if (this.soContainerData.formData[i].cargoCustId) {
          arr.push({
            value: this.soContainerData.formData[i].cargoCustId,
            label: this.soContainerData.formData[i].cargoCustName
          })
        }
      }
      return arr
    },
    ...mapState({
      dictMap: (state) => state.dict.dictMap,
      ordDetRole: (state) => state.airTransport.orderList.ordDetRole,
      roles: (state) => state.user.roles,
      airOrderInfo: (state) => state.airTransport.airOrderInfo,
      userId: (state) => state.user.userId
    }),
    
    isView() {
      if (this.airOrderInfo.orderStatus === 'pre_submit') {
        if (this.airOrderInfo.bdManageEmployeeId !== this.userId) {
          return true
        } else {
          return false
        }
      } else {
        if (
          this.isBd &&
          !['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)
        ) {
          return true
        }
        if (this.isOp && !['pass'].includes(this.orderStatus)) {
          return true
        }
        return false
      }
    },
    disabledState() {
      if (this.airOrderInfo.orderStatus === 'pre_submit') {
        if (this.airOrderInfo.bdManageEmployeeId !== this.userId) {
          return true
        } else {
          return false
        }
      } else {
        // 业务可以填写部分的权限
        if (this.isBd) {
          if (!['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)) {
            return true
          } else {
            return false
          }
        } else if (this.isPricing) {
          if (!['draft', 'refuse', 'pre_submit'].includes(this.orderStatus)) {
            return true
          } else {
            return false
          }
        } else {
          return true
        }
      }
    }
  },
  watch: {},
  components: {},
  methods: {
    // 城市下拉数据
    citySelectQuery(queryString, index, code) {
      citySelectList({
        countryCode: '',
        cityCode: queryString || '',
        state: 'valid'
      }).then((data) => {
        let cityArr = data.data.map((ele) => {
          return Object.assign(ele, {
            label: this.$language === 'en' ? ele.ename : ele.cname,
            value: ele.cityCode
          })
        })
        let found = cityArr.find((ele) => ele.cityCode === code)
        if (code && !found && !queryString) {
          citySelectList({
            countryCode: '',
            cityCode: code,
            state: 'valid'
          }).then((res) => {
            let activeArr = res.data.map((ele) => {
              return Object.assign(ele, {
                label: this.$language === 'en' ? ele.ename : ele.cname,
                value: ele.cityCode
              })
            })
            this.$set(this.soContainerData.formData[index], 'cityArr', [
              ...activeArr,
              ...cityArr
            ])
          })
        } else {
          this.$set(this.soContainerData.formData[index], 'cityArr', [
            ...cityArr
          ])
        }
      })
    },
    receiptPlaceFilterMehod(el, index, code) {
      // 交仓地点
      this.citySelectQuery(el, index, code)
    },
    custFilterMehod(val) {
      // 发货单位
      this.getCustList(val)
    },
    custVisibleChange(val) {
      if (val) {
        this.getCustList()
      }
    },
    cityChange(val) {
      if (val) {
        this.receiptPlaceSearch()
      }
    },
    // 获取发货单位
    getCustList(val = '') {
      this.$store.dispatch('dict/queryCustomerList', val).then((data) => {
        let list = data.list.map((o) => {
          return {
            value: o.custid ? Number(o.custid) : '',
            label: o.name
          }
        })
        let newtList = [...list, ...this.oldSoContainerData]
        this.shipperCustidOptions = unique(newtList, 'value')
      })
    },
    setCargoCustName(value, index) {
      // 获取发货单位名称
      for (let i = 0; i < this.shipperCustidOptions.length; i++) {
        if (this.shipperCustidOptions[i].value === value) {
          this.$set(
            this.soContainerData.formData[index],
            'cargoCustName',
            this.shipperCustidOptions[i].label
          )
        }
      }
    },
    validateForm() {
      // 表单验证
      return new Promise((resolve, reject) => {
        this.$refs.airSoContainer.validate((valid) => {
          if (valid) {
            resolve()
          } else {
            reject()
          }
        })
      })
    },
    //选择柜型设置是否重柜
    handleTypeChange(item) {
      if (item.containerType === '20HD' || item.containerType === '40HD') {
        item.isHeavy = 'y'
      } else {
        item.isHeavy = 'n'
      }
    },
    // 展开收起
    handleToogleExpand() {
      this.isShow = !this.isShow
    },
    // 增加一行
    handleAddContainerList() {
      this.soContainerData.formData.push({
        cargoCustId: null, //发货单位
        cargoCustName: '', //发货单位名称
        cargoReadyTime: null, //发货时间
        cargoBillType: '', // 单据方式
        cargoType: '', // 货物方式
        poDealAddress: '', // 交仓地点
        poDealTime: '' // 交仓时间
      })
    },
    // 删除一行
    handleDeleteContainerList(index) {
      this.soContainerData.formData.splice(index, 1)
    },
    // 箱量校验
    checkContainerNum(rule, value, callback) {
      if (!Number.isInteger(value)) {
        callback(new Error('请输入数字值'))
      } else {
        if (value <= 0) {
          callback(new Error('请输入正整数'))
        } else if (value > 200) {
          callback(new Error('请输入200内数字'))
        } else {
          callback()
        }
      }
    },

    checkNum(rule, value, callback) {
      if (!Number.isInteger(value)) {
        callback(new Error('请输入数字值'))
      } else {
        if (value <= 0) {
          callback(new Error('请输入正整数'))
        } else {
          callback()
        }
      }
    },

    checkTemprature(rule, value, callback, item) {
      let reg = /^\-?[0-9]\d*\.?\d*$/
      console.log(item)
      if (!value) {
        callback(new Error('请输入'))
      } else if (!reg.test(value)) {
        callback(new Error('请输入正确的数字'))
      } else {
        callback()
      }
    },
    checkWeight(rule, value, callback, item) {
      let reg = /^\-?[0-9]\d*\.?\d*$/
      console.log(item)
      if (!value) {
        callback(new Error('请输入'))
      } else if (!reg.test(value)) {
        callback(new Error('请输入正确的数字'))
      } else if (Number(value) > 53000) {
        callback(new Error('请输入53吨内数字'))
      } else {
        callback()
      }
    },
    checkVolume(rule, value, callback, item) {
      let reg = /^\-?[0-9]\d*\.?\d*$/
      console.log(item)
      if (!value) {
        callback(new Error('请输入'))
      } else if (!reg.test(value)) {
        callback(new Error('请输入正确的数字'))
      } else if (Number(value) > 100) {
        callback(new Error('请输入100内数字'))
      } else {
        callback()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.cargo-container {
  .el-input__prefix {
    line-height: 30px;
  }
}
.so-container {
  padding-right: 0;
  /deep/ .el-input__suffix {
    right: 5px !important;
  }

  .so-total {
    margin: 15px 10px 0;
    line-height: 28px;
    height: 28px;
  }
  .so-row-cont {
    border: 1px solid #e9e9e9;
    border-radius: 4px;
    margin: 5px 10px 0;
    overflow: hidden;
    &.margin0 {
      margin: 0;
    }
    &.mt10 {
      margin-top: 10px;
    }
    .row-cont-tit {
      background: rgba(248, 249, 253, 1);
      border-radius: 4px 4px 0px 0px;
      height: 32px;
      line-height: 32px;
      .tit {
        font-size: 14px;
        font-weight: bold;
        padding-left: 12px;
      }
      .delete {
        font-size: 20px;
        margin-right: 10px;
        margin-top: 6px;
        color: #999;
        cursor: pointer;
      }
      .row-cont-rt {
        font-size: 12px;
        float: right;
        padding-right: 12px;
        .el-checkbox {
          .el-checkbox__label {
            font-size: 12px;
          }
        }
        .expand {
          margin-left: 15px;
          cursor: pointer;
        }
      }
    }
    .row-flex {
      .btn-minus-search,
      .btn-plus-search {
        float: right;
        margin-right: 6px;
        margin-top: 24px;
      }
      &.flex-so {
        // border-bottom: 1px solid #e0e0e0;
        margin: 0 8px;
        padding-top: 0;
        zoom: 1;
        &:last-child {
          border-bottom: 0;
        }
        // .item-cell {
        //   float: left;
        //   display: flex;
        //   margin-bottom: 15px;
        //   margin-right: 5px;
        .lab {
          line-height: 20px;
          margin-right: 5px;
          text-align: right;
          font-size: 12px;
        }
        .to {
          line-height: 20px;
          margin: 0 5px;
        }
        .el-form-item__label {
          line-height: 20px !important;
          padding-right: 3px;
        }
        .el-form-item__content {
          line-height: 20px !important;
        }
        .el-input {
          line-height: 20px !important;
        }
        .el-form-item__error {
          padding-top: 0;
        }

        .el-input-group__append,
        .el-input-group__prepend {
          line-height: 18px;
        }
        &.is-required {
          // label::before {
          //   display: none;
          // }
          // input,
          // select,
          // textarea,
          // .el-date-editor--daterange {
          //   background: #fef5f4;
          // }
          .is-disabled {
            input,
            select,
            textarea,
            .el-date-editor--daterange {
              background: #f5f7fa;
            }
          }
        }
        // }
        .btn-minus-search,
        .btn-plus-search {
          margin-top: 0;
        }
        .btn-plus-search {
          margin-right: 0;
        }
      }
      &.flex-so::after {
        display: block;
        clear: both;
        content: '';
        visibility: hidden;
        height: 0;
      }
      .flex-item {
        width: 25%;
        padding: 0 10px 0 10px;
        margin-bottom: 4px;
        float: left;
        .item-label {
          font-size: 12px;
          line-height: 20px;
          height: 20px;
          margin-bottom: 0;
          display: flex;
          // justify-content: space-between;
          span {
            display: block;
          }
          .lab {
            display: flex;
            em {
              font-style: normal;
            }
          }
        }
      }
    }
    .el-input--suffix .el-input__inner {
      padding-right: 20px;
    }
  }
  .form-box {
    float: left;
    width: calc(100% - 70px);
    .el-form-item {
      margin-bottom: 4px;
    }
  }
  .form-box100 {
    float: left;
    width: 100%;
    .el-form-item {
      margin-bottom: 4px;
    }
  }
}
@media (min-width: 1600px) {
  .el-col-lg-4 {
    width: 16.66%;
  }
}
@media (max-width: 1599px) and (min-width: 1370px) {
  .el-col-lg-4 {
    width: 20%;
  }
}
@media (max-width: 1369px) {
  .el-col-lg-4 {
    width: 25%;
  }
}
</style>
