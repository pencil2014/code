<template>
  <div class="particulars-cnt">
    <el-form :inline="true" :model="form" label-position="top" ref="form" size="mini" class="form">
      <div class="description-box">
        <div class="cargo-box">
          <div class="cargo-cnt">
            <el-form-item
              :label= "'Cargo Description' + getLinesTip('cargoDescription', 'label')"
              prop="data.cargoDescription"
              :rules="getFiedleConfigRequired('cargoDescription')"
              class="middle-item"
            >
              <el-input
                placeholder="Enter Cargo Description..."
                show-word-limit
                type="textarea"
                :autosize="{ minRows: 7, maxRows: 7 }"
                v-model="form.data.cargoDescription"
                @blur="handleTextarea('cargoDescription', 'cargoDescription')"
              ></el-input>
            </el-form-item>
            <el-form-item
              :label="'Marks & Numbers' + getLinesTip('marks', 'label')"
              prop="data.marks"
              :rules="getFiedleConfigRequired('marks')"
              class="middle-item"
            >
              <el-input
                placeholder="Enter Marks and Numbers..."
                show-word-limit
                type="textarea"
                v-model="form.data.marks"
                @blur="handleTextarea('marks', 'marks')"
                :autosize="{ minRows: 7, maxRows: 7 }"
              ></el-input>
            </el-form-item>
          </div>
        </div>
      </div>
      <div class="Containers-item-title">
        <div class="left-class">
          <span class="title">Containers</span>
          <span class="total-class">(Total Number of Containers: <span class="red">{{ this.totalsOption.containers }}</span></span>
          <span class="total-class">Total Number of Packages: <span class="red">{{ this.totalsOption.packages }}</span></span>
          <span class="total-class">Total Shipment Weight: <span class="red">{{ this.totalsOption.weight }}</span></span>
          <span class="total-class">Total Shipment Volume: <span class="red">{{ this.totalsOption.volume }}</span>)</span> 
        </div> 
        <div>
          <el-button type="text" size="mini" @click="addItemOuter(0, form.list[0].containers)">+ Add Containers</el-button>
        </div> 
      </div>
      <div
        class="container-box"
        v-for="(item, index) in form.list"
        :key="index"
      >
        <el-table
          :data="item.containers"
          border
          style="width: 100%">
          <el-table-column
            prop="cn"
            label="Container Number / Seal Number / Type"
            >
            <template slot="header">
              <span>
                <span class="red">*</span> 
                <span class="label-title-class">Container Number / Seal Number / Type</span>
              </span>
            </template>
            <template slot-scope="scope">
              <el-form-item
                  :prop="`list.${index}.containers.${scope.$index}.cn`"
                  :show-message="false"
                  class="big-item"
                  :rules="{
                    required: true,
                    message: 'Required Field',
                    trigger: 'change',
                  }"
                >
                  <el-input
                    class="small-input4"
                    placeholder="Enter Number..."
                    size="mini"
                    type="input"
                    v-model="scope.row.cn"
                    @blur="blurTrim('cn', index, scope.$index, scope.row.cn)"
                  ></el-input>
                  <el-input
                    class="small-input4"
                    placeholder="Enter Number..."
                    size="mini"
                    type="input"
                    v-model="scope.row.sn"
                    @blur="blurTrim('sn', index, scope.$index, scope.row.sn)"
                  ></el-input>
                  <el-select
                    class="small-select4"
                    placeholder="Select One"
                    reserve-keyword
                    size="mini"
                    filterable
                    clearable
                    v-model="scope.row.containerType"
                  >
                    <el-option
                      :key="list.value"
                      :label="list.label"
                      :value="list.value"
                      v-for="list in containerTypeList"
                    ></el-option>
                  </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column
            prop="packageType"
            label="Package Count/Type (Outermost)"
             width="350px"
            >
            <template slot="header">
              <span>
                  <span class="red">*</span> 
                  <span class="label-title-class">Package Count/Type (Outermost)</span>
              </span>
            </template>
            <template slot-scope="scope">
              <el-form-item 
                class=""
                :prop="`list.${index}.containers.${scope.$index}.packageType`"
                :show-message="false"
                :rules="{
                  required: true,
                  message: 'Required Field',
                  trigger: 'change',
                }"
              >
                <el-input-number
                  class="small-input2"
                  placeholder="Enter Count..."
                  size="mini"
                  v-model="scope.row.quantity"
                  :min="1"
                  :precision="0"
                  :controls="false"
                ></el-input-number>
                <el-select
                  :loading="loading"
                  :remote-method="getPackageList"
                  class="small-select2"
                  filterable
                  clearable
                  placeholder="Enter Type..."
                  remote
                  reserve-keyword
                  size="mini"
                  v-model="scope.row.packageType"
                  value-key="packageCode"
                  @change="changePackageType('containers', index, scope.$index)"
                >
                  <el-option
                    :key="option.packageCode"
                    :label="option.descpt"
                    :value="option"
                    v-for="option in packageList"
                  ></el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column
            prop="weight"
            label="Cargo Gross Weight (Cargo + Packaging)"
            width="300px"
            >
            <template slot="header">
              <span>
                  <span class="red">*</span> 
                  <span class="label-title-class">Cargo Gross Weight (Cargo + Packaging)</span>
              </span>
            </template>
            <template slot-scope="scope">
              <el-form-item
                :prop="`list.${index}.containers.${scope.$index}.weight`"
                :show-message="false"
                class="small-item"
                :rules="{
                  required: true,
                  message: 'Required Field',
                  trigger: 'change',
                }"
              >
                <el-input-number
                  class="small-input"
                  placeholder="Enter Weight..."
                  size="mini"
                  v-model="scope.row.weight"
                  :min="0.001"
                  :precision="3"
                  :controls="false"
                ></el-input-number>
                <el-select
                  class="small-select"
                  placeholder
                  clearable
                  size="mini"
                  v-model="weightType"
                  disabled
                >
                  <el-option
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                    v-for="option in weightTypeList"
                  ></el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column
            prop="volume"
            label="Cargo Gross Volume (Cargo + Packaging)"
            width="300px"
            >
            <template slot="header">
              <span>
                  <span class="red">*</span> 
                  <span class="label-title-class">Cargo Gross Volume (Cargo + Packaging)</span>
              </span>
            </template>
            <template slot-scope="scope">
              <el-form-item
                :prop="`list.${index}.containers.${scope.$index}.volume`"
                :show-message="false"
                class="small-item"
                :rules="{
                  required: true,
                  message: 'Required Field',
                  trigger: 'change',
                }"
              >
                <el-input-number
                  class="small-input"
                  placeholder="Enter Volume..."
                  size="mini"
                  v-model="scope.row.volume"
                  :min="0.001"
                  :precision="3"
                  :controls="false"
                ></el-input-number>
                <el-select
                  class="small-select"
                  placeholder
                  clearable
                  size="mini"
                  v-model="volumeType"
                  disabled
                >
                  <el-option
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                    v-for="option in volumeTypeList"
                  ></el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="160px"
          >
           <template slot-scope="scope">
             <el-button type="text" size="mini" @click="editCargos(scope)">Cargos</el-button>
             <el-button class="red" type="text" size="mini" v-if="item.containers.length > 1" @click="removeItemOuter(index, scope.$index)">Delete</el-button>
           </template>
          </el-table-column>
        </el-table>
      </div>
    </el-form>
    <CargosDialog 
      v-if="dialogCargosOptions.show"
      :dialogCargosOptions="dialogCargosOptions"
      :shipCarrierCode="shipCarrierCode"
      :dictAll="dictAll"
      @close="dialogCargosClose"
    />
  </div>
</template>

<script>
import { containerTypeList, packageList, hscodeList } from '@/api/order/createBooking'
import { cargoHscodeList } from '@/api/base'
import { getPackageList } from '@/api/order/robotSi'
import CargosDialog from './cargosDialog'
export default {
  inject: ['dictAll', 'shipCarrierCode'],
  props: {
    particularsOption: {
      required: true,
      type: Array,
      default: () => [],
    },
    replaceChinese: {
      required: true,
      type: Function,
      default: () => {},
    },
    fieldConfigObj: {
      type: Object,
      default: () => {},
    },
    fieldConfigList: {
      type: Array,
      default: () => [],
    },
    particularsOption2: {
      type: Object,
      default: () => {},
    },
    totalsOption: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    CargosDialog,
  },
  data() {
    return {
      cargoType: false,
      form: {
        list: [],
        data: {
          cargoDescription: '',
          marks: '',
        },
      },
      rules: {},
      packageList: [],
      loading: false,
      weightType: 'KG',
      weightTypeList: [
        {
          label: 'KG',
          value: 'KG',
        },
        {
          label: 'LBS',
          value: 'LBS',
        },
      ],
      volumeType: 'CBM',
      volumeTypeList: [
        {
          label: 'CBM',
          value: 'CBM',
        },
        {
          label: 'CFT',
          value: 'CFT',
        },
      ],
      seperateType: [
        {
          label: 'No',
          value: 'no',
        },
        {
          label: 'Yes',
          value: 'yes',
        },
      ],
      containerTypeList: [],
      dialogCargosOptions: {
        list: [],
        show: false,
        index: '',
      },
      hscodeList: [],
      loading: false,
      descriptionErr: false,
      marksErr: false,
      marksSpaceErr: false,
      isCheck: true,
      carrierSource: this.shipCarrierCode,
    }
  },
  created() {
    this.form.list = this.particularsOption
    this.form.data = this.particularsOption2
    this.getDictData()
    this.getContainerTypeList()
  },
  watch: {
    particularsOption(val) {
      if (val) {
        this.form.list = this.particularsOption
        this.checkChinese()
      }
    },
  },
  methods: {
    getDictData() {
    },
    getFiedleConfigRequired(fieldName) {
      let fieldConfig = this.fieldConfigObj[fieldName]
      if (fieldConfig && fieldConfig.length) {
        return fieldConfig
      } else {
        return null
      }
    },
    getLinesTip(fieldName, type) {
      let fieldConfig = this.fieldConfigList.find(item => {
        return item.fieldName === fieldName
      }) || {}
      let num = fieldConfig.maxLength || null
      let line = fieldConfig.maxRow || null
      if (num && line) {
         if (type === 'label') {
           return `  (${num} X ${line} lines)`
         } else {
           return `This field can accept only ${line} lines of ${num} characters`
         }
      } else {
        return ''
      }
    },
    checkChinese() {
       // 汉字校验
      this.form.list.forEach((item1, index) => {
        (item1.cargos || []).forEach((item2, i) => {
          item2.description && this.handleTextarea('cargoDescription', 'cargoDescription')
          item2.marks && this.handleTextarea('marks', 'marks')
        })
      })
    },
    // 搜索编码
    getHscodeList(str = '') {
      if (!str) return
      const data = {
        keyword: str,
        // carrierSource: this.carrierSource,
      }
      this.loading = true
      cargoHscodeList(data)
        .then((res) => {
          if (res.code === 0) {
            if (res.data) {
              this.hscodeList = res.data.map((item) => {
                const { hscode, cargoDesc } = item
                return {
                  label: `${cargoDesc}`,
                  value: hscode,
                  hsCodeDesc: cargoDesc,
                }
              })
            } else {
              this.hscodeList = []
            }
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    blurTrim(param, index, y, val) {
       if (val) {
         if (val.trim() || param !== 'sn') {
           this.form.list[index].containers[y][param] = val.trim()
         }
       } else {
         this.form.list[index].containers[y][param] = ''
       }
    },
    // textarea格式化
    handleTextarea(type, fieldName) {
      let res = []
      // const reg = new RegExp('(.{' + num + '})', 'g')
      const source = this.replaceChinese(this.form.data[type])
      const arr = source.split('\n')
      let fieldConfig = this.fieldConfigList.find(item => {
        return item.fieldName === fieldName
      }) || {}
      let num = fieldConfig.maxLength || null
      let line = fieldConfig.maxRow || null
      arr.forEach((item) => {
        const len = item.length
        if (num && (len > num)) {
          const str = item.split('')
          const forLen = Math.floor(len / num)
          for (let i = 0; i < forLen; i++) {
            const lsIndex = item.lastIndexOf('\n') + 1
            const lsword = lsIndex + num
            const word = item.slice(lsIndex, lsword)
            if (word.length < num) {
              break
            }
            const spindex = word.lastIndexOf(' ')
            str[lsIndex + spindex] = '\n'
            item = str.join('')
          }
        }
        res.push(item)
      })
      res = res.join('\n').split('\n')
      // this[`${type}Err`].splice(index, 1, res.length > line)
      this[`${type}Err`] = line && (res.length > line)
      this.form.data[type] = res.join('\n')
      // 汉字检测
      if (this.isCheck) {
        // 汉字校验
        const reg =
          /[\u4e00-\u9fa5]|[\uFE30-\uFFA0]|[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/gi
        const chineseIndex = []
        const lengthIndex = []
        res.forEach((item, i) => {
          reg.lastIndex = 0
          if (reg.test(item)) {
            chineseIndex.push(i + 1)
          }
          // 长度超出num未被截断
          if (num && item.length > num) {
            lengthIndex.push(i + 1)
          }
        })
        if (chineseIndex.length) {
          const text = `There are Chinese characters in lines ${chineseIndex.join(
            ','
          )} please check`
          return this.$msgErrClose(text)
        }
        if (lengthIndex.length) {
          // this[`${type}Err`].splice(index, 1, true)
          this[`${type}Err`] = true 
          const text = `The number of characters in lines ${lengthIndex.join(
            ','
          )} exceeds ${num}  please check`
          return this.$msgErrClose(text)
        }
      }
      if (type === 'marks') {
        let haveSpace = res.some((ele) => !ele)
        this[`${type}SpaceErr`] = haveSpace
        haveSpace && this.$msgErrClose('Empty line in Marks')
      }
    },
    addItemOuter(index, containers) {
      let packageType = ''
      if (containers && containers.length) {
        packageType = containers[0].packageType
      }
      this.form.list[index].containers.push(
          {
            containerType: '',
            quantity: undefined,
            packageType,
            packageTypeCode: '',
            volume: undefined,
            weight: undefined,
            sn: '',
            cn: '',
            cargos: [
              {
                hsCode: '',
                description: '',
                marks: '',
                cargoHarmonizedCode: '',
                netWeight: '',
                cargoNature: '',
                quantity: undefined,
                volume: undefined,
                weight: undefined,
              },
            ],
          },
       )
    },
    // 删除数据
    removeItemOuter(index, y) {
      this.$confirmWarn('确定删除此数据吗？', () => this.form.list[index].containers.splice(y, 1))
    },
    editCargos(scope) {
      this.dialogCargosOptions.list = JSON.parse(JSON.stringify(scope.row.cargos))
      this.dialogCargosOptions.show = true
      this.dialogCargosOptions.index = scope.$index
    },
    dialogCargosClose(action, cargos) {
      this.dialogCargosOptions.show = false
      if (action === 'Confirm') {
        let data = this.form.list[0].containers[this.dialogCargosOptions.index]
         let quantity = cargos.reduce((pre, next) => {
          return pre = new LSnum(pre).plus(next.quantity).toNum(3)
        }, 0)
        let weight = cargos.reduce((pre, next) => {
          return pre = new LSnum(pre).plus(next.weight).toNum(3)
        }, 0)
        let volume = cargos.reduce((pre, next) => {
          return pre = new LSnum(pre).plus(next.volume).toNum(3)
        }, 0)
        this.form.list[0].containers.splice(this.dialogCargosOptions.index, 1, {
          ...data,
          quantity,
          weight,
          volume,
          cargos,
        })
      }
    },
    // 获取箱型
    getContainerTypeList(str = '') {
      const data = {
        keyword: str,
        carrierSource: this.carrierSource,
      }
      containerTypeList(data)
        .then((res) => {
          if (res.code === 0) {
            this.containerTypeList = res.data.map((item) => {
              const { containerTypeCode, uiDescription } = item
              return {
                label: uiDescription,
                value: containerTypeCode,
              }
            })
          }
        })
        .catch(() => {})
    },
    // 获取包装类型
    getPackageList(str = '') {
      const data = {
        packageName: str,
        baseCarrierCode: this.shipCarrierCode,
      }
      this.loading = true
      getPackageList(data)
        .then((res) => {
          if (res.code === 0) {
            this.packageList = (res.data || [])
            .map(item => {
              item['descpt'] = item.packageName
              return item
            })
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    // 选择包装类型
    changePackageType(type, index, y) {
      // if (!this.form.list[index][type][y].printPackageType) {
      //   const source = this.form.list[index][type][y].packageType
      //   this.form.list[index][type][y].printPackageType = source.descpt
      // }
    },
    // 数据验证
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
    // 初始化数据
    initData() {
     const data = {
        packageName: '',
        baseCarrierCode: this.shipCarrierCode,
     }
      getPackageList(data).then((res) => {
        if (res.code === 0) {
          let packageList = (res.data || [])
          .map(item => {
            item['descpt'] = item.packageName
            return item
          })
          this.form.list[0].containers.forEach((item) => {
            let packageType = item.packageType
            let find = packageList.find((ele) => ele.packageName === packageType)
            item.packageType = find ? find : ''
            this.$nextTick(() => {
              this.$refs.form.clearValidate()
            })
          })
        }
      })
      const data2 = {
        keyword: '',
        carrierSource: this.carrierSource,
      }
      containerTypeList(data2).then((res) => {
        if (res.code === 0) {
          let containerTypeList = res.data || []
          this.form.list[0].containers.forEach((item) => {
            let containerType = item.containerType
            let find = containerTypeList.find((ele) => (ele.baseContainerType === containerType || ele.containerTypeCode === containerType))
            item.containerType = find ? find.containerTypeCode : ''
            this.$nextTick(() => {
              this.$refs.form.clearValidate()
            })
          })
        }
      })
      this.form.data.cargoDescription && this.handleTextarea('cargoDescription', 'cargoDescription')
      this.form.data.marks && this.handleTextarea('marks', 'marks')
    },
  },
}
</script>

<style lang="scss" scoped>
.particulars-cnt {
  border-radius: 4px;
  overflow: hidden;
  .type-box {
    margin-bottom: 10px;
    background-color: #fff;
    padding: 8px;
  }
  .cnt-border {
    border-bottom: 1px solid #ccc;
  }
  .container-box {
    padding: 10px 15px 0 15px;
    margin-bottom: 10px;
    display: flex;
    .el-form-item {
      margin-bottom: 0px !important;
    }
    .cnt-left {
      flex: 1;
      .el-form-item {
        margin-right: 0;
      }
    }
    .cnt-right {
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: space-around;
    }
    .btn-box {
      width: 40px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: space-around;
      i {
        font-size: 20px;
        cursor: pointer;
        &.el-icon-circle-plus {
          color: #417f90;
          &:hover {
            color: #356572;
          }
        }
        &.el-icon-remove {
          color: #ccc;
          &:hover {
            color: #999;
          }
        }
      }
    }
  }
  .description-box {
    border-bottom: 1px dotted #ccc;
    padding: 8px;
    .cargo-box {
      width: 100%;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      .middle-item {
        width: 45%;
      }
      .cargo-cnt {
        flex: 1;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        .el-row {
          width: 100%;
          .el-col {
            .middle-item {
              width: 100%;
            }
          }
        }
      }
    }
    .flex-item {
      width: 100%;
      .el-button--mini {
        height: 22px;
        line-height: 22px;
        padding: 0 10px;
        font-size: 12px;
        margin-top: 5px;
        &.el-button--primary {
          background-color: #277ab5;
          border: none;
          &:hover {
            background-color: #216697;
          }
        }
      }
    }
    .error-tips {
      color: red;
      font-size: 12px;
    }
  }
  .Containers-item-title {
    padding: 10px 8px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .left-class {
      .title {
        font-size: 14px;
        color: #000;
        font-weight: bold;
      }
      .total-class {
        margin-left: 10px;
      }
    }
  }
  .info-box {
    .form-cnt {
      // display: flex;
      width: 100%;
      // justify-content: flex-start;
      flex-direction: column;
      // flex-wrap: wrap;
    }
    .el-form-item {
      width: 100%;
      margin-bottom: 10px;
      // margin-left: 5px;
    }
    .item-box {
      display: flex;
      .item-cnt {
        flex: 1;
      }
      .btn-box {
        display: flex;
        width: 40px;
        justify-content: space-around;
      }
      &.border {
        border-bottom: 1px solid rgba(0, 0, 0, 0.125);
      }

      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .item-info {
      display: flex;
      .form-cnt {
        display: flex;
      }
    }
    .cargos-item-title {
      font-size: 14px;
      color: #000;
      font-weight: bold;
      cursor: pointer;
      display: inline;
      .cargos-icon-class {
        margin-left: 5px;
      }
    }
    .cargos-item-info {
      margin-top: 5px;
      padding: 0 16px;
      border: 1px solid #ccc;
    }
    .add-btn {
      width: 100%;
      .el-button--mini {
        height: 22px;
        line-height: 22px;
        padding: 0 10px;
        font-size: 12px;
        margin-top: 5px;
        &.el-button--primary {
          background-color: #277ab5;
          border: none;
          &:hover {
            background-color: #216697;
          }
        }
      }
    }
  }
  .small-input2 {
    width: 30%;
  }
  .small-input {
    width: 70%;
  }
  .small-input3 {
    width: 100%;
  }
  .small-input4 {
    width: 30%;
  }
  .small-select {
    width: 30%;
  }
  .small-select2 {
    width: 70%;
  }
  .small-select4 {
    width: 40%;
  }
  /deep/.el-input__icon {
    height: 20px;
    line-height: 20px;
  }
}
</style>
