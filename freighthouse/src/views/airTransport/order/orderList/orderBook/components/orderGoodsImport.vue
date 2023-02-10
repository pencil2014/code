<template>
  <div class="other-charges">
    <div class="mb10 between h32" style="margin-top:12px">
      <div class="goods-form">
        <div class="between h32">
          <div class="ft12 other-charges-title">制单货物</div>
        </div>
      </div>
      <div class="flex-item-center">
        <!-- :disabled="isDraftConfirm" @click="handleSave" v-if="(isOp || (isCs&&currentBlType!=='mawb')) && orderStatus!=='complete'" -->
        <el-button size="mini" type="primary" class="ml10" @click="handleAdd" v-if="(isOp || (isCs&&currentBlType!=='mawb')) && orderStatus!=='complete'" :disabled="isDraftConfirm">新增</el-button>
        <el-button size="mini" type="primary" class="ml10" @click="copyGoods('actualCargos')" v-if="(isOp || (isCs&&currentBlType!=='mawb')) && orderStatus!=='complete'" :disabled="isDraftConfirm">复制实际信息</el-button>
        <el-button size="mini" type="primary" class="ml10" @click="copyGoods('predictCargos')" v-if="(isOp || (isCs&&currentBlType!=='mawb')) && orderStatus!=='complete'" :disabled="isDraftConfirm">复制预计信息</el-button>
      </div>
    </div>
    <el-form label-width="auto" :model="goodsList" :ref="refName" :show-message="false">
      <el-table header-row-class-name="goods-table-header" fit style="width: 100%" :data="goodsList.list">
        <el-table-column prop="hscode" label="HS Code" align="center" width="250">
          <template slot="header">
            <span style="display:inline-block;color: #E63923;margin-right:2px;">*</span>
            <span style="display:inline-block;margin-right:3px">HS Code</span>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.hscode'" :rules="goodsList.rules.hscode" style="margin-bottom:0">
              <el-select size="mini" v-model="scope.row.hscode" clearable style="width: 100%" remote filterable placeholder="请选择HS Code" @change="handleChangeHscode(scope.row.hscode,scope.$index)" :remote-method="(val) => queryCargoHscode(val,scope.$index,scope.row.hscode)" @focus="(val) => queryCargoHscode('',scope.$index,scope.row.hscode)">
                <el-option v-for="(item, index) in scope.row.hscodeOptions || []" :key="index" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="cname" label="中文名称" align="center">
          <template slot="header">
            <span style="display:inline-block;color: #E63923;margin-right:2px;">*</span>
            <span style="display:inline-block;margin-right:3px">中文名称</span>
          </template>
          <template slot-scope="scope">
            <!-- @input="checkCname(scope.row.cname)" @input="checkEname(scope.row.ename,'英文品名')" -->
            <el-form-item :prop="'list.'+scope.$index+'.cname'" :rules="goodsList.rules.cname" style="margin-bottom:0">
              <el-input size="mini" v-model="scope.row.cname" maxlength='1024' clearable placeholder="请输入"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="ename" label="英文名称" align="center">
          <template slot="header">
            <span style="display:inline-block;color: #E63923;margin-right:2px;">*</span>
            <span>英文名称</span>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.ename'" :rules="goodsList.rules.ename" style="margin-bottom:0">
              <el-input size="mini" v-model="scope.row.ename" maxlength='1024' @input="checkEname(scope.row.ename,'英文品名')" clearable placeholder="请输入"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="件数" align="center">
          <template slot="header">
            <span style="display:inline-block;color: #E63923;margin-right:2px;">*</span>
            <span>件数</span>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.quantity'" :rules="goodsList.rules.quantity" style="margin-bottom:0">
              <el-input size="mini" :disabled="isDraftConfirm" v-model="scope.row.quantity" @input="checkIntegerQuantity('quantity', scope.row)" clearable placeholder="请输入"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="毛重(KGS)" align="center">
          <template slot="header">
            <span style="display:inline-block;color: #E63923;margin-right:2px;">*</span>
            <span>毛重(KGS)</span>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.weight'" :rules="goodsList.rules.weight" style="margin-bottom:0">
              <el-input size="mini" :disabled="isDraftConfirm" v-model="scope.row.weight" @input="checkNumInputMaxVal('weight', scope.row,'毛重')" clearable placeholder="请输入"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="volume" label="体积(CBM)" align="center">
          <template slot="header">
            <span style="display:inline-block;color: #E63923;margin-right:2px;">*</span>
            <span>体积(CBM)</span>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.volume'" :rules="goodsList.rules.volume" style="margin-bottom:0">
              <el-input size="mini" :disabled="isDraftConfirm" v-model="scope.row.volume" @input="checkNumInputMaxVal('volume', scope.row,'体积')" clearable placeholder="请输入"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="packageInfo" label="包装" align="center">
          <template slot="header">
            <span style="display:inline-block;color: #E63923;margin-right:2px;">*</span>
            <span>包装</span>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.packageInfo'" :rules="goodsList.rules.packageInfo" style="margin-bottom:0">
              <el-select size="mini" v-model="scope.row.packageInfo" :disabled="isDraftConfirm" filterable clearable placeholder="请选择">
                <el-option v-for="item in dictMap.packageType" :key="item.value" :label="item.label" :value="item.value" clearable> </el-option>
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="length" label="长(M)" align="center">
          <template slot="header">
            <span style="display:inline-block;margin-right:3px">长(M)</span>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.length'" :rules="goodsList.rules.length" style="margin-bottom:0">
              <el-input size="mini" :disabled="isDraftConfirm" v-model="scope.row.length" clearable @input="checkNumInput('length', scope.row)" placeholder="请输入"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="width" label="宽(M)" align="center">
          <template slot="header">
            <span style="display:inline-block;margin-right:3px">宽(M)</span>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.width'" :rules="goodsList.rules.width" style="margin-bottom:0">
              <el-input size="mini" :disabled="isDraftConfirm" v-model="scope.row.width" @input="checkNumInput('width', scope.row)" clearable placeholder="请输入"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column prop="height" label="高(M)" align="center">
          <template slot="header">
            <span style="display:inline-block;margin-right:3px">高(M)</span>
          </template>
          <template slot-scope="scope">
            <el-form-item :prop="'list.'+scope.$index+'.height'" :rules="goodsList.rules.height" style="margin-bottom:0">
              <el-input size="mini" :disabled="isDraftConfirm" v-model="scope.row.height" @input="checkNumInput('height', scope.row)" clearable placeholder="请输入"></el-input>
            </el-form-item>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center" fixed="right" v-if="(isOp || (isCs&&currentBlType!=='mawb')) && orderStatus!=='complete'">
          <template slot-scope="scope">
            <div class="operate-group">
              <el-button @click="handleDelete(scope.$index)" class="red" type="text" :disabled="isDraftConfirm" size="mini">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import BaseDialog from '@/components/Base/Dialog/index'
import {
  checkQuantityWeightVolume,
  validateNumPointEmpty,
  // validateCntextAndNum,
  validateEntextAndNum,
  validateIntegerQuantity
} from '@/utils/validate'
import { cargoHscodeList } from '@/api/base'
import { unique } from '@/utils/index'
import { airCargoList } from '@/api/airTransport/order-import'
var timer = ''
export default {
  components: { BaseDialog },
  props: {
    orderStatus: {
      type: String,
      default: ''
    },
    goodsList: {
      type: Object,
      default() {
        return {}
      }
    },
    isAddBl: {
      type: Boolean,
      default: true
    },
    isDraftConfirm: {
      type: Boolean,
      default: false
    },
    currentBlType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      cargoData: null,
      refName: 'form' + Math.random(),
      goodsInfoform: {
        proportion: '',
        weight: '',
        cTime: '',
        address: '',
        preparedBy: ''
      },
      goodForm: {
        cname: '',
        ename: '',
        quantity: '',
        weight: '',
        volume: '',
        packageInfo: '',
        length: '',
        width: '',
        height: ''
      },
      rules: {
        hscode: [
          { required: true, message: '请输入HS code', trigger: 'change' }
        ],
        cname: [
          { required: true, message: '请输入中文品名', trigger: 'change' }
          // { validator: validateCntextAndNum(), trigger: 'change' }
        ],
        ename: [
          { required: true, message: '请输入英文品名', trigger: 'change' },
          { validator: validateEntextAndNum(), trigger: 'change' }
        ],
        quantity: [
          { required: true, message: '请输入件数', trigger: 'change' },
          { validator: validateIntegerQuantity(), trigger: 'change' }
        ],
        weight: [
          { required: true, message: '请输入毛重', trigger: 'change' },
          { validator: checkQuantityWeightVolume(), trigger: 'change' }
        ],
        volume: [
          { required: true, message: '请输入体积', trigger: 'change' },
          { validator: checkQuantityWeightVolume(), trigger: 'change' }
        ],
        packageInfo: [
          { required: true, message: '请输入包装', trigger: 'change' }
        ],
        length: [{ validator: validateNumPointEmpty(), trigger: 'change' }],
        width: [{ validator: validateNumPointEmpty(), trigger: 'change' }],
        height: [{ validator: validateNumPointEmpty(), trigger: 'change' }]
      },
      createChargeShow: false,
      actionType: '', // 操作类型
      actionIndex: '',
      proportionArr: [],
      addressArr: []
    }
  },
  computed: {
    ...mapState({
      ordDetRole: (state) => state.airTransport.orderList.ordDetRole,
      dictMap: (state) => state.dict.dictMap,
      airOrderInfo: (state) => state.airTransport.airOrderInfo,
      roles: (state) => state.user.roles,
      userId: (state) => state.user.userId,
      userEditRoles: (state) => state.airTransport.orderList.userEditRoles
    }),
    isOp() {
      return this.ordDetRole === 'op' || this.isBd
    },
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
    isCs() {
      this.ordDetRole === 'cs'
    }
  },
  mounted() {
    // if (this.isAddBl) {
    //   // 新增时候，默认那制单货物
    //   this.copyGoods()
    // }
  },
  watch: {
    'goodsList.list': {
      handler(newVal, oldVal) {
        let data = {
          totalQuantity: 0,
          totalWeight: 0,
          totalVolume: 0
        }
        for (let i = 0; i < newVal.length; i++) {
          if (!isNaN(newVal[i].quantity)) {
            // 件数
            data.totalQuantity += newVal[i].quantity * 1
          }
          if (!isNaN(newVal[i].weight)) {
            // 毛重
            data.totalWeight += newVal[i].weight * 1
          }
          if (!isNaN(newVal[i].volume)) {
            // 体积
            data.totalVolume += newVal[i].volume * 1
          }
        }
        this.$emit('changeGoods', { data: data, list: newVal })
      },
      deep: true
    }
  },
  methods: {
    handleChangeHscode(val, index) {
      //goodsList.list
      if (!val) {
        this.$set(this.goodsList.list[index], 'hscodeOptions', [])
      }
    },
    // hscode模糊查询
    queryCargoHscode(queryString, index, value) {
      if (queryString) {
        cargoHscodeList({ keyword: queryString }).then((response) => {
          let hscodeOptions = response.data.map((item) => {
            return Object.assign(item, {
              label: item.cargoDesc,
              value: item.hscode
            })
          })
          hscodeOptions = unique(hscodeOptions, 'label')
          this.$set(
            this.goodsList.list[index],
            'hscodeOptions',
            hscodeOptions || []
          )
        })
      } else {
        this.$set(this.goodsList.list[index], 'hscodeOptions', [])
      }
    },
    handleDelete(index) {
      this.goodsList.list.splice(index, 1)
    },
    copyGoods(prop) {
      // 复制货物信息页面货物 货物信息
      if (this.cargoData) {
        let cargosCopy = JSON.parse(JSON.stringify(this.cargoData[prop]))
        cargosCopy.map((item) => {
          delete item.oid
        })
        this.goodsList.list = [...cargosCopy]
        return
      }
      airCargoList({
        orderNo: this.$route.query.orderNo
      }).then((res) => {
        if (!res.data) return
        this.cargoData = res.data
        let cargosCopy = JSON.parse(JSON.stringify(res.data[prop]))
        cargosCopy.map((item) => {
          delete item.oid
        })
        this.goodsList.list = [...cargosCopy]
      })
    },
    validateForm() {
      // 表单验证
      return new Promise((resolve, reject) => {
        this.$refs[this.refName].validate((valid) => {
          if (valid) {
            resolve()
          } else {
            reject()
          }
        })
      })
    },
    checkCname(value) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (value) {
          let reg = /^[\u4e00-\u9fa50-9]+$/
          if (value) {
            let result = value.replace(/\s+/g, '')
            if (!reg.test(result)) {
              this.$message({
                message: `中文品名请输入中文、空格和数字`,
                type: 'error',
                duration: 2000
              })
            }
          }
        }
      }, 800)
    },
    checkEname(value, type) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        let reg =
          /^[a-z_A-Z0-9-\.!@#\$%\\\^&\*\)\(\+=\{\}\[\]\/",'<>~\·`\?:;|]+$/
        if (value) {
          let result = value.replace(/\s+/g, '')
          if (!reg.test(result)) {
            this.$message({
              message: `${type}请输入英文、数字、空格和英文符号`,
              type: 'error',
              duration: 2000
            })
          }
        }
      }, 800)
    },
    checkNumInput(prop, row) {
      let value = row[prop]
      clearTimeout(timer)
      timer = setTimeout(() => {
        let reg =
          /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,2}|[1-9][0-9]*\.\d{1,2})))$/
        if (!value) {
        } else if (!reg.test(value) || value > 999999) {
          let lastStr = value.substr(value.length - 1, 1)
          if (isNaN(value)) {
            this.$message({
              message: '长、宽、高请输入不超过999999的数字，小数点最多2位',
              type: 'error',
              duration: 2000
            })
            row[prop] = ''
          } else if (value > 999999) {
            this.$message({
              message: '长、宽、高请输入不超过999999的数字，小数点最多2位',
              type: 'error',
              duration: 2000
            })
            row[prop] = 999999
          } else if (lastStr !== '.') {
            this.$message({
              message: '长、宽、高请输入不超过999999的数字，小数点最多2位',
              type: 'error',
              duration: 2000
            })
            row[prop] = Number(value).fixed(2)
          }
        }
        // else {
        if (row.length && row.width && row.height && row.quantity) {
          row.volume = Number(
            row.length * row.width * row.height * row.quantity
          ).fixed(3)
        }
        if (row.length * row.width * row.height * row.quantity > 9999999) {
          this.$message({
            message: `体积不能大于9999999`,
            type: 'error'
          })
        }
        // }
      }, 800)
    },
    checkIntegerQuantity(prop, row) {
      let value = row.quantity
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (value) {
          let reg = /^([1-9][0-9]*)$/
          if (!reg.test(value)) {
            row[prop] = ''
            this.$message({
              message: `件数请输入大于0的整数`,
              type: 'error',
              duration: 2000
            })
          } else if (value > 9999999) {
            row[prop] = 9999999
            this.$message({
              message: `件数不能超过9999999`,
              type: 'error',
              duration: 2000
            })
          }
          if (row.length && row.width && row.height && row.quantity) {
            row.volume = Number(
              row.length * row.width * row.height * row.quantity
            ).fixed(3)
          }
          if (row.length * row.width * row.height * row.quantity > 9999999) {
            this.$message({
              message: `体积不能大于9999999`,
              type: 'error'
            })
          }
        }
      }, 800)
    },
    checkNumInputMaxVal(prop, row, type) {
      let value = row[prop]
      clearTimeout(timer)
      timer = setTimeout(() => {
        let reg =
          /^(([1-9][0-9]*)|([0])|(([0]\.\d{1,3}|[1-9][0-9]*\.\d{1,3})))$/
        if (!value) {
        } else if (!reg.test(value) || value > 999999) {
          let lastStr = value.substr(value.length - 1, 1)
          if (isNaN(value)) {
            this.$message({
              message: `${type}请输入不超过999999的数字，小数点最多3位`,
              type: 'error',
              duration: 2000
            })
            row[prop] = ''
          } else if (value > 999999) {
            this.$message({
              message: `${type}请输入不超过999999的数字，小数点最多3位`,
              type: 'error',
              duration: 2000
            })
            row[prop] = 999999
          } else if (lastStr !== '.') {
            this.$message({
              message: `${type}请输入不超过999999的数字，小数点最多3位`,
              type: 'error',
              duration: 2000
            })
            row[prop] = Number(value).fixed(3)
          }
        }
      }, 800)
    },
    handleAdd() {
      this.goodsList.list.push({
        blId: null,
        cname: '',
        commodityTypeCode: '',
        createdBy: null,
        createdName: '',
        createdTime: '',
        ename: '',
        height: null,
        length: null,
        mark: '',
        oid: '',
        orderNo: this.$route.query.orderNo,
        packageInfo: '',
        property: '',
        propertyName: '',
        quantity: '',
        revision: '',
        state: 'valid',
        updatedBy: null,
        updatedName: '',
        updatedTime: null,
        volume: null,
        weight: null,
        width: null,
        hscode: ''
      })
    },
    handleDel(index) {
      this.$emit('action', {
        type: 'del',
        index: index
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.other-charges {
  padding: 10px;
  .red {
    color: #e63923;
  }
  .other-charges-title {
    font-weight: 600;
  }
  .goods-sum {
    display: flex;
    align-items: center;
    font-size: 12px;
    font-weight: 400;
    color: #222222;
    line-height: 16px;
    .item {
      margin-right: 10px;
    }
  }
  .goods-form {
    display: flex;
    .goods-form-item {
      display: flex;
      align-items: center;
      margin-right: 8px;
      .label-title {
        font-size: 12px;
        font-weight: 400;
        color: #222222;
        width: 75px;
      }
    }
  }
}
</style>