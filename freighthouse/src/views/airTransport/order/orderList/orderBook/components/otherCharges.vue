<template>
  <div class="other-charges">
    <div class="between">
      <div class="ft12 other-charges-title">Other Charges</div>
      <div class="flex-item-center">
        <el-button v-if="otherChargesformData.otherChargesList.length===0&&(isOp||(isCs&&$route.name==='AirTransportHblList'))" size="mini" type="primary" class="ml10" @click="handleAdd" :disabled="orderStatus==='complete' || isDraftConfirm">新增</el-button>
      </div>
    </div>
    <!-- {{createItem}} -->
    <div class="charges-tabel-box">
      <el-form label-width="auto" :model="otherChargesformData" ref="formData" :show-message="false">
        <el-table fit highlight-current-row style="width: 100%" :data="otherChargesformData.otherChargesList">
          <el-table-column label="费用类型" align="center">
            <template slot-scope="scope">
              <el-form-item :prop="'otherChargesList.'+scope.$index+'.chargeType'" :rules="otherChargesformData.rules.chargeType">
                <el-input placeholder="请输入" size="mini" maxlength="32" :disabled="isDraftConfirm" v-model="scope.row.chargeType" clearable></el-input>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="预付到付" align="center">
            <template slot-scope="scope">
              <el-form-item :prop="'otherChargesList.'+scope.$index+'.collPpd'" :rules="otherChargesformData.rules.collPpd">
                <el-select v-model="scope.row.collPpd" size="mini" :disabled="isDraftConfirm" clearable placeholder="请选择" style="width:100%">
                  <el-option v-for="(item, index) in airChargePpdColl" :label="item.label" :value="item.value" :key="index"> </el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="单价" align="center">
            <template slot-scope="scope">
              <el-form-item :prop="'otherChargesList.'+scope.$index+'.rate'" :rules="otherChargesformData.rules.rate">
                <el-input placeholder="请输入" :disabled="isDraftConfirm" maxlength="11" @input="checkValue('validateNumPoint',scope.row,'rate')" size="mini" v-model="scope.row.rate" clearable></el-input>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="数量" align="center">
            <template slot-scope="scope">
              <el-form-item :prop="'otherChargesList.'+scope.$index+'.quantity'" :rules="otherChargesformData.rules.quantity">
                <el-input placeholder="请输入" :disabled="isDraftConfirm" maxlength="11" @input="checkValue('validateNum',scope.row,'quantity')" size="mini" clearable v-model="scope.row.quantity"></el-input>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="合计" align="center">
            <template slot-scope="scope">
              <el-form-item :prop="'otherChargesList.'+scope.$index+'.totalAmount'" :rules="otherChargesformData.rules.totalAmount">
                <el-input placeholder="请输入" maxlength="11" size="mini" disabled clearable v-model="scope.row.totalAmount"></el-input>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="" width="80" align="left" v-if="!isDraftConfirm">
            <template slot-scope="scope">
              <div class="operate-group">
                <i class="el-icon-remove-outline handle-icon" @click="handleDel(scope.$index)" :disabled="!isBd"></i>
                <i v-if="scope.$index===otherChargesformData.otherChargesList.length-1" class="el-icon-circle-plus-outline handle-icon" @click="handleAdd"></i>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
    </div>
    <div class="signature-tabel">
      <!-- <div class="signature-shipper">
        Signature of Shipper or his Agent
      </div> -->
      <!-- <div class="city">GUANGZHOU</div> -->
      <div class="data-title">
        <div class="title-item">Total Collect Charges</div>
        <div class="title-item">Executed on (date)</div>
      </div>
      <div class="data-value">
        <div class="value-item" style="padding-left:10px">
          <el-input type="text" :disabled="isDraftConfirm" size="mini" @input="checkNumInput(createItem.airBl.totalCollectCharge)" clearable v-model="createItem.airBl.totalCollectCharge" style="width:100%" placeholder="请输入" class="tabel-input-no-border"></el-input>
        </div>
        <div class="value-item">
          <elDatePickerLimit type="datetime" size="mini" :disabled="isDraftConfirm" v-model="createItem.airBl.executedOn" placeholder="选择日期" value-format="yyyy-MM-dd HH:mm" style="width:100%" class="tabel-input-no-border">
          </elDatePickerLimit>
        </div>
      </div>
      <div class="data-title">
        <div class="title-item100"> at (place)</div>
      </div>
      <div class="data-value">
        <div class="value-item100">
          <el-input type="textarea" size="mini" maxlength="128" disabled show-word-limit v-model="createItem.airBl.placeAt" rows="2" style="width:100%" placeholder="请输入" class="tabel-input-no-border"></el-input>
        </div>
      </div>
      <div class="data-title">
        <div class="title-item100"> Signature of Issuing Carrier or its Agent</div>
      </div>
      <div class="data-value">
        <div class="value-item100">
          <el-select class="tabel-input-no-border" style="width:100%" v-model="createItem.airBl.makeBy" :disabled="isDraftConfirm" placeholder="请选择操作" filterable remote size="mini" :remote-method="val => opFilterMehod(val)" @focus="opFilterMehod('')" @change="makeByChange">
            <el-option v-for="(o, index) in employeeOpOptions" :key="index" :label="o.label" :value="o.value"> </el-option>
          </el-select>
        </div>
      </div>
      <!-- <div class="signature-shipper">
        Signature of Issuing Carrier or its Agent
      </div> -->
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { baseEmployeeListName } from '@/api/base'
var timer = ''
const dataObj = {
  chargeType: '',
  collPpd: '',
  rate: '',
  quantity: '',
  totalAmount: ''
}
export default {
  components: {},
  props: {
    orderStatus: {
      type: String,
      default: ''
    },
    otherChargesformData: {
      type: Object,
      default() {
        return {}
      }
    },
    createItem: {
      type: Object,
      default: () => ({})
    },
    blType: {
      type: String,
      default: ''
    },
    isDraftConfirm: {
      type: Boolean,
      default: false
    }
  },
  model: {
    prop: 'otherChargesformData',
    event: 'update'
  },
  data() {
    return {
      createChargeShow: false,
      actionType: '', // 操作类型
      actionIndex: '',
      employeeOpOptions: []
    }
  },
  computed: {
    ...mapState({
      ordDetRole: (state) => state.airTransport.orderList.ordDetRole,
      dictMap: (state) => state.dict.dictMap,
      roles: (state) => state.user.roles,
      userId: (state) => state.user.userId,
      airOrderInfo: (state) => state.airTransport.airOrderInfo,
      userEditRoles: (state) => state.airTransport.orderList.userEditRoles
    }),
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
    isBd() {
      return this.ordDetRole === 'bd' || !this.ordDetRole
    },
    isOp() {
      return this.ordDetRole === 'op' || this.isBd
    },
    isCs() {
      return this.ordDetRole === 'cs'
    },
    airChargePpdColl() {
      if (this.createItem.airBl.otherPpdColl) {
        // 主单费用方式只能选预付
        return this.dictMap.airChargePpdColl.filter(
          (el) => el.value == this.createItem.airBl.otherPpdColl
        )
      } else {
        return this.dictMap.airChargePpdColl
      }
    }
  },
  created() {
    if (!this.createItem.airBl.makeBy) {
      this.createItem.airBl.makeBy = this.$store.state.user.userInfo.sysUserId
      this.createItem.airBl.makeName = this.$store.state.user.userInfo.userName
    }
  },
  methods: {
    changRateOrNum(row) {},
    makeByChange(val) {
      for (let i = 0; i < this.employeeOpOptions.length; i++) {
        if (this.employeeOpOptions[i].value === val) {
          this.createItem.airBl.makeName = this.employeeOpOptions[i].label
        }
      }
    },
    // 操作下拉搜索自定义查询
    opFilterMehod(val) {
      this.getOpEmployeeName(val)
    },
    // 操作
    getOpEmployeeName(val) {
      let data = {
        name: val ? val.replace(/^\s+|\s+$/g, '') : '',
        roleCode: ''
      }
      baseEmployeeListName(data).then((res) => {
        let list = res.data.filter((el) => el.status === 'on')
        this.employeeOpOptions = list.map((item) => {
          return Object.assign(item, {
            label: this.$language == 'en' ? item.ename : item.cname,
            value: item.employeeId
          })
        })
      })
    },
    checkNumInput(value, type, index, prop) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        let reg =
          /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/
        if (!value) {
        } else if (!reg.test(value) || value > 999999999) {
          let lastStr = value.substr(value.length - 1, 1)
          if (isNaN(value)) {
            this.$set(this.createItem.airBl, 'totalCollectCharge', null)
          } else if (value > 999999999) {
            this.$set(this.createItem.airBl, 'totalCollectCharge', 999999999)
          } else if (value < 0) {
            this.$set(this.createItem.airBl, 'totalCollectCharge', null)
          } else if (!value) {
            this.$set(this.createItem.airBl, 'totalCollectCharge', null)
          } else if (lastStr !== '.') {
            this.$set(
              this.createItem.airBl,
              'totalCollectCharge',
              Number(value).fixed(2)
            )
          }
          this.$message({
            message:
              'Total Collect Charges请输入大于等于0，小于等于999999999的数字,小数点最多2位',
            type: 'error',
            duration: 2000
          })
        } else if (value == 0) {
          this.$set(this.createItem.airBl, 'totalCollectCharge', 0)
        }
      }, 800)
    },
    // 员工列表
    employeeSelectlist() {
      let data = {
        state: 'valid',
        name: ''
      }
      this.$store.dispatch('dict/employeeSelectlist', data).then((data) => {
        this.employeeOptions = data
      })
    },
    handleAdd() {
      // let obj={ ...dataObj }
      // obj.collPpd=this.createItem.airBl.otherPpdColl
      this.otherChargesformData.otherChargesList.push(dataObj)
    },
    handleDel(index) {
      this.otherChargesformData.otherChargesList.splice(index, 1)
    },
    submit() {
      let that = this
      return new Promise(function (resolve, reject) {
        that.$refs.formData.validate((valid) => {
          if (valid) {
            resolve()
          } else {
            reject()
          }
        })
      })
    },
    checkValue(type, row, prop) {
      // 单价，数量，合计都不能大于 99999999 ，小数点最多2位
      let value = row[prop]
      let reg = /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/
      if (reg.test(value) && value <= 99999999) {
        row.totalAmount = Number(row.rate * row.quantity).fixed(2)
        if (row.totalAmount > 99999999) {
          this.$message.error(`合计(单价*数量)不能大于99999999`)
          row.totalAmount = null
        }
      } else {
        row.totalAmount = null
      }
      clearTimeout(timer)
      timer = setTimeout(() => {
        // 数字校正
        if (!value) {
          return false
        }
        if (!reg.test(value) || value > 99999999) {
          this.$message.error(
            '单价，数量请输入大于等于0，小于等于99999999的数字,小数点最多2位'
          )
          let lastStr = value.substr(value.length - 1, 1)
          if (!isNaN(value)) {
            if (value > 99999999) {
              row[prop] = 99999999
            } else if (lastStr !== '.') {
              row[prop] = Number(value).fixed(2)
              row.totalAmount = Number(row.rate * row.quantity).fixed(2)
            }
          } else {
            row[prop] = null
          }
        }
      }, 800)
    }
  },
  watch: {
    'createItem.airBl.otherPpdColl': {
      handler(newVal, oldVal) {
        for (
          let i = 0;
          i < this.otherChargesformData.otherChargesList.length;
          i++
        ) {
          this.$set(
            this.otherChargesformData.otherChargesList[i],
            'collPpd',
            newVal
          )
        }
      }
      // immediate: true
    }
  }
}
</script>

<style lang="scss" scoped>
.other-charges {
  padding: 10px;
  .other-charges-title {
    line-height: 24px;
  }

  /deep/.el-table th {
    height: 24px;
  }
  /deep/.el-form-item {
    margin-bottom: 0;
  }
  /deep/.tabel-input-no-border {
    .el-textarea__inner {
      border: none;
    }
    .el-input__inner {
      border: none;
    }
  }
}
.handle-icon {
  font-size: 16px;
  margin: 0 2px;
  cursor: pointer;
}
.handle-icon:hover {
  color: #1890ff;
}
.charges-tabel-box {
  border-radius: 2px;
  border: 1px solid #e9e9e9;
}
.signature-tabel {
  border-radius: 2px;
  border: 1px solid #e9e9e9;
  border-bottom-width: 0;
  border-right-width: 0;
  margin-top: 4px;
  .signature-shipper {
    border-right: 1px solid #e9e9e9;
    border-bottom: 1px solid #e9e9e9;
    height: 57px;
    padding: 4px;
    color: #222222;
  }
  .city {
    border-right: 1px solid #e9e9e9;
    border-bottom: 1px solid #e9e9e9;
    height: 40px;
    padding: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #222222;
  }
  .data-title {
    display: flex;
    .title-item {
      width: 50%;
      height: 20px;
      background: #f8f9fd;
      display: flex;
      align-items: center;
      border-right: 1px solid #e9e9e9;
      border-bottom: 1px solid #e9e9e9;
      padding-left: 4px;
    }
    .title-item100 {
      width: 100%;
      height: 20px;
      background: #f8f9fd;
      display: flex;
      align-items: center;
      border-right: 1px solid #e9e9e9;
      border-bottom: 1px solid #e9e9e9;
      padding-left: 4px;
    }
  }
  .data-value {
    display: flex;
    .value-item {
      width: 50%;
      height: 20px;
      display: flex;
      align-items: center;
      border-right: 1px solid #e9e9e9;
      border-bottom: 1px solid #e9e9e9;
      overflow: hidden;
    }
    .value-item100 {
      width: 100%;
      min-height: 20px;
      display: flex;
      align-items: center;
      border-right: 1px solid #e9e9e9;
      border-bottom: 1px solid #e9e9e9;
    }
  }
}
</style>