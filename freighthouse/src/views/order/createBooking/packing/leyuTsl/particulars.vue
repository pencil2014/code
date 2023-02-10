<template>
  <div class="particulars-cnt">
    <el-form
      :inline="true"
      :model="form"
      label-position="top"
      ref="form"
      size="mini"
      class="form"
    >
      <div
        class="container-box"
        v-for="(item, index) in form.list"
        :key="index"
        :class="{ 'cnt-border': index !== form.list.length }"
      >
        <div class="cnt-left">
          <div class="description-box">
            <div class="cargo-box" v-for="(option, i) in item.cargos" :key="i">
              <el-form-item
                label="Cargo Description  (35 X 99 lines)"
                :prop="`list.${index}.cargos.${i}.description`"
                class="middle-item"
                :rules="{
                  required: true,
                  message: 'Required Field',
                  trigger: 'change',
                }"
              >
                <el-input
                  placeholder="Enter Cargo Description..."
                  show-word-limit
                  type="textarea"
                  :autosize="{ minRows: 7, maxRows: 7 }"
                  
                  v-model="option.description"
                  @blur="handleTextarea(index, i, 'description', 35, 99)"
                  :class="{ 'is-exceed': descriptionErr[index+`${i}`] }"
                ></el-input>
                <p class="error-tips" v-show="descriptionErr[index+`${i}`]">
                  This field can accept only 99 lines of 35 characters
                </p>
              </el-form-item>
              <el-form-item
                label="Marks & Numbers (35 X 99 lines)"
                :prop="`list.${index}.cargos.${i}.marks`"
                class="middle-item"
                :rules="{
                  required: true,
                  message: 'Required Field',
                  trigger: 'change',
                }"
              >
                <el-input
                  placeholder="Enter Marks and Numbers..."
                  show-word-limit
                  type="textarea"
                  v-model="option.marks"
                  @blur="handleTextarea(index, i, 'marks', 35, 99)"
                  :class="{ 'is-exceed': marksErr[index+`${i}`] }"
                  :autosize="{ minRows: 7, maxRows: 7 }"
                  
                ></el-input>
                <p class="error-tips" v-show="marksErr[index+`${i}`]">
                  This field can accept only 99 lines of 35 characters
                </p>
              </el-form-item>
              <el-form-item
                label="HS Code"
                :prop="`list.${index}.cargos.${i}.hsCode`"
                class="small-item"
                :rules="{
                  required: true,
                  message: 'Required Field',
                  trigger: 'change',
                }"
              >
                <el-select
                  :loading="loading"
                  :remote-method="getHscodeList"
                  class="large-select"
                  clearable
                  filterable
                  placeholder="Search Code..."
                  remote
                  reserve-keyword
                  size="mini"
                  v-model="option.hsCode"
                  allow-create
                >
                  <el-option
                    :key="v.value"
                    :label="v.label"
                    :value="v.value"
                    v-for="v in hscodeList"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="Package Count/Type"
                :prop="`list.${index}.cargos.${i}.quantity`"
                class="small-item"
                :rules="{
                  required: true,
                  message: 'Required Field',
                  trigger: 'change',
                }"
              >
                <el-input
                  class="small-input2"
                  placeholder="Enter Count..."
                  size="mini"
                  v-model="option.quantity"
                ></el-input>
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
                  v-model="option.packageType"
                  value-key="packageCode"
                >
                  <el-option
                    :key="one.packageCode"
                    :label="one.descpt"
                    :value="one"
                    v-for="one in packageList"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="Weight"
                :prop="`list.${index}.cargos.${i}.weight`"
                class="small-item"
                :rules="{
                  required: true,
                  message: 'Required Field',
                  trigger: 'change',
                }"
              >
                <el-input-number
                  class="small-input3"
                  placeholder="Enter Weight..."
                  size="mini"
                  v-model="option.weight"
                  :precision="3"
                  :controls="false"
                ></el-input-number>
                <el-select
                  class="small-select3"
                  placeholder
                  clearable
                  size="mini"
                  v-model="weightType"
                  disabled
                >
                  <el-option
                    :key="n.value"
                    :label="n.label"
                    :value="n.value"
                    v-for="n in weightTypeList"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="Volume"
                :prop="`list.${index}.cargos.${i}.volume`"
                class="small-item"
                :rules="{
                  required: true,
                  message: 'Required Field',
                  trigger: 'change',
                }"
              >
                <el-input-number
                  class="small-input3"
                  placeholder="Enter Volume..."
                  size="mini"
                  v-model="option.volume"
                  :precision="3"
                  :controls="false"
                ></el-input-number>
                <el-select
                  class="small-select3"
                  placeholder
                  clearable
                  size="mini"
                  v-model="volumeType"
                  disabled
                >
                  <el-option
                    :key="m.value"
                    :label="m.label"
                    :value="m.value"
                    v-for="m in volumeTypeList"
                  ></el-option>
                </el-select>
              </el-form-item>
              <!-- <el-form-item class="flex-item">
                <el-button
                  @click="showGoodslDialog(index)"
                  icon="el-icon-plus"
                  size="mini"
                  type="primary"
                >
                  Add Hazmat Details
                </el-button>
              </el-form-item> -->
            </div>
          </div>
          <div class="info-box">
            <div
              :class="{ border: y !== item.containers.length - 1 }"
              :key="y"
              class="item-box"
              v-for="(ele, y) in item.containers"
            >
              <div class="item-info">
                <div class="form-cnt">
                  <el-form-item
                    :label="`${y + 1}. Container Number / Seal Number / Type`"
                    :prop="`list.${index}.containers.${y}.cn`"
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
                      v-model="ele.cn"
                      @blur="blurTrim('cn', index, y, ele.cn)"
                    ></el-input>
                    <el-input
                      class="small-input4"
                      placeholder="Enter Number..."
                      size="mini"
                      type="input"
                      v-model="ele.sn"
                      @blur="blurTrim('sn', index, y, ele.sn)"
                    ></el-input>
                    <!-- :remote-method="getContainerTypeList" remote-->
                    <el-select
                      @change="changeContainerType(ele)"
                      class="small-select4"
                      placeholder="Select One"
                      filterable
                      clearable
                      reserve-keyword
                      size="mini"
                      v-model="ele.containerType"
                    >
                      <el-option
                        :key="list.value"
                        :label="list.label"
                        :value="list.value"
                        v-for="list in containerTypeList"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    label="Quantity"
                    :prop="`list.${index}.containers.${y}.quantity`"
                    :rules="{
                      required: true,
                      message: 'Required Field',
                      trigger: 'change',
                    }"
                  >
                    <el-input
                      v-model="ele.quantity"
                      placeholder="Enter Number..."
                      size="mini"
                    ></el-input>
                  </el-form-item>
                  <el-form-item
                    label="Cargo Gross Weight"
                    :prop="`list.${index}.containers.${y}.weight`"
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
                      v-model="ele.weight"
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
                  <el-form-item
                    label="Cargo Gross Volume"
                    :prop="`list.${index}.containers.${y}.volume`"
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
                      v-model="ele.volume"
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
                </div>
              </div>
              <div class="btn-box">
                <i
                  @click="addItem(index)"
                  class="el-icon-circle-plus"
                  v-if="y === 0"
                ></i>
                <i
                  @click="removeItem(index, y)"
                  class="el-icon-remove"
                  v-else
                ></i>
              </div>
              <!-- <div class="add-btn">
                  <el-button
                    @click="showContainerDialog(index)"
                    icon="el-icon-plus"
                    size="mini"
                    type="warning"
                    v-show="item.showReefer"
                  >
                    Add Reefer Settings
                  </el-button>
                </div> -->
            </div>
          </div>
        </div>
        <div class="cnt-right">
          <div class="btn-box">
            <i
              @click="addItemOuter"
              class="el-icon-circle-plus"
              v-if="index === 0"
            ></i>
            <i
              @click="removeItemOuter(index)"
              class="el-icon-remove"
              v-else
            ></i>
          </div>
        </div>
      </div>
    </el-form>
    <GoodsDialog
      :dialogOptions="dialogGoodsOptions"
      @cancle="closeGoodsDialog"
      @submit="submitGoodsDialog"
      v-if="dialogGoodsOptions.show"
    />
    <ContainerDialog
      :dialogOptions="dialogContainerOptions"
      @cancle="closeContainerDialog"
      @submit="submitContainerDialog"
      v-if="dialogContainerOptions.show"
    />
  </div>
</template>

<script>
import GoodsDialog from './goodsDialog'
import ContainerDialog from './containerDialog'
import {
  containerTypeList,
  packageList,
  hscodeList,
} from '@/api/order/createBooking'
export default {
  inject: ['carrierSource'],
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
  },
  components: {
    GoodsDialog,
    ContainerDialog,
  },
  data() {
    return {
      cargoType: true,
      form: {
        list: [],
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
      containerTypeList: [],
      dialogGoodsOptions: {
        index: 0,
        show: false,
        form: {},
      },
      dialogContainerOptions: {
        show: false,
        index: 0,
        form: {},
      },
      hscodeList: [],
      loading: false,
      descriptionErr: {},
      marksErr: {},
      isCheck: true,
      carrierScac: '',
    }
  },
  created() {
    let shipmentId = this.$route.query.shipmentId
    if (shipmentId) {
      this.isCheck = true
    }
    this.form.list = this.particularsOption
  },
  watch: {
    particularsOption (val) {
      if (val) {
        this.form.list = this.particularsOption
        this.form.list.forEach(item => {
          item.containers.forEach(ele => {
            ele.containerType.includes('R') && (ele.showReefer = true)
          })
        })
        this.checkChinese()
      }
    }
  },
  methods: {
    checkChinese() {
      // 开启汉字检测
      this.form.list.forEach((item1, index) => {
        (item1.cargos || []).forEach((item2, i) => {
          item2.description && this.handleTextarea(index, i, 'description', 35, 99)
          item2.marks && this.handleTextarea(index, i, 'marks', 35, 99)
        })
      })
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    // 搜索编码
    getHscodeList(str = '') {
      if (!this.carrierScac) {
        return
      }
      const data = {
        keyword: str,
        carrierSource: this.carrierSource,
        scac: this.carrierScac,
      }
      this.loading = true
      hscodeList(data)
        .then((res) => {
          if (res.code === 0) {
            if (res.data) {
              this.hscodeList = res.data.map((item) => {
                const { hsCode, hsCodeDesc } = item
                return {
                  label: `${hsCode} ${hsCodeDesc}`,
                  value: hsCode,
                  hsCodeDesc,
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
    handleTextarea(index = 0, i = 0, type, num = 35, line = 99) {
      let res = []
      // const reg = new RegExp('(.{' + num + '})', 'g')
      const source = this.replaceChinese(this.form.list[index].cargos[i][type])
      const arr = source.split('\n')
      arr.forEach((item) => {
        const len = item.length
        if (len > num) {
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
      // this[`${type}Err`].splice(i, 1, res.length > line)
      this.$set( this[`${type}Err`], [index+`${i}`], res.length > line )
      this.form.list[index].cargos[i][type] = res.join('\n')
      if ( type==='marks' && res.some(ele => !ele)) {
        this.$msgErrClose('Empty line in Marks')
      }
      // 汉字检测
      if (this.isCheck) {
        // 汉字校验
        const reg =
          /[\u4e00-\u9fa5]|[\uFE30-\uFFA0]|[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/gi
        const chineseIndex = []
        const lengthIndex = []
        res.forEach((item, x) => {
          reg.lastIndex = 0
          if (reg.test(item)) {
            chineseIndex.push(x + 1)
          }
          // 长度超出num未被截断
          if (item.length > num) {
            lengthIndex.push(x + 1)
          }
        })
        if (chineseIndex.length) {
          const text = `There are Chinese characters in lines ${chineseIndex.join(
            ','
          )} please check`
          this.$msgErrClose(text)
        }
        if (lengthIndex.length) {
          // this[`${type}Err`].splice(i, 1, true)
          this.$set( this[`${type}Err`], [index+`${i}`], true )
          const text = `The number of characters in lines ${lengthIndex.join(
            ','
          )} exceeds ${num}  please check`
          this.$msgErrClose(text)
        }
      }
    },
    // 添加数据
    addItem(index) {
      this.form.list[index].containers.push({
        containerType: '',
        quantity: '',
        volume: '',
        weight: '',
        sn: '',
        cn: '',
        reeferDto: {
          humidity: '',
          airFlow: '',
          temperature: '',
          description: '',
        },
      })
    },
    addItemOuter() {
      this.form.list.push({
        containers: [
          {
            containerType: '',
            quantity: '',
            volume: '',
            weight: '',
            sn: '',
            cn: '',
            reeferDto: {
              humidity: '',
              airFlow: '',
              temperature: '',
              description: '',
            },
          },
        ],
        cargos: [
          {
            hsCode: '',
            description: '',
            marks: '',
            quantity: '',
            volume: '',
            weight: '',
            dangerousDto: {
              hazardCode: '',
              undgNo: '',
              flashPoint: '',
              dangerLevel: '',
              contact: {
                email: '',
                name: '',
                telPhone: '',
              },
            },
          },
        ],
      })
    },
    // 删除数据
    removeItem(index, y) {
      this.$confirmWarn('确定删除此数据吗？', () =>
        this.form.list[index].containers.splice(y, 1)
      )
    },
    removeItemOuter(index) {
      this.$confirmWarn('确定删除此数据吗？', () =>
        this.form.list.splice(index, 1)
      )
    },
    // 切换货物类型
    changeCargoType(val) {
      this.form.forEach((item, index) => {
        if (val && index !== 0) {
          item.cargo = null
        } else {
          const { description, marks } = this.form[0].cargo || {}
          item.cargo = item.cargo
            ? item.cargo
            : {
                hsCode: '',
                description,
                marks,
                dangerousDto: {
                  hazardCode: '',
                  undgNo: '',
                  flashPoint: '',
                  dangerLevel: '',
                  contact: {
                    email: '',
                    name: '',
                    telPhone: '',
                  },
                },
              }
        }
        const name = 'form' + index
        if (this.$refs[name]) {
          this.$refs[name][0].clearValidate()
        }
      })
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
    // 显示添加冷藏按钮
    changeContainerType(item) {
      const type = item.containerType
      if (!type) {
        item.showReefer = false
      } else {
        const data = this.containerTypeList.find((item) => item.value === type)
        item.showReefer = data.label.includes('R')
      }
    },
    // 获取包装类型
    getPackageList(str = '') {
      const data = {
        keyword: str,
        carrierSource: this.carrierSource,
      }
      this.loading = true
      packageList(data)
        .then((res) => {
          if (res.code === 0) {
            this.packageList = res.data || []
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    // 选择包装类型
    changePackageType(query, index) {
      const source = this.form.list[index]
      const { descpt } = query
      source.containers.forEach((ele) => {
        if (!ele.printPackageType) {
          ele.printPackageType = descpt
        }
      })
    },
    // 显示弹窗
    showGoodslDialog(index) {
      this.dialogGoodsOptions.index = index
      this.dialogGoodsOptions.form = this.form[index].cargo.dangerousDto
      this.dialogGoodsOptions.show = true
    },
    // 提交弹窗
    submitGoodsDialog(data) {
      const index = this.dialogGoodsOptions.index
      this.form[index].cargo.dangerousDto = data
      this.closeGoodsDialog()
    },
    // 关闭弹窗
    closeGoodsDialog() {
      this.dialogGoodsOptions.show = false
    },
    // 显示弹窗
    showContainerDialog(index) {
      this.dialogContainerOptions.index = index
      this.dialogContainerOptions.form = this.form[index].reeferDto
      this.dialogContainerOptions.show = true
    },
    // 提交弹窗
    submitContainerDialog(data) {
      const { index } = this.dialogContainerOptions
      this.form[index].reeferDto = data
      this.closeContainerDialog()
    },
    // 关闭弹窗
    closeContainerDialog() {
      this.dialogContainerOptions.show = false
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
        keyword: '',
        carrierSource: this.carrierSource,
      }
      packageList(data).then((res) => {
        if (res.code === 0) {
          let packageList = res.data || []
          this.form.list[0].containers.forEach((item) => {
            let packageType = item.packageType
            let find = packageList.find(
              (ele) => ele.basePackageEname === packageType
            )
            item.packageType = find ? find : ''
            this.$nextTick(() => {
              this.$refs.form.clearValidate()
            })
          })
        }
      })
      containerTypeList(data).then((res) => {
        if (res.code === 0) {
          let containerTypeList = res.data || []
          this.form.list[0].containers.forEach((item) => {
            let containerType = item.containerType
            let find = containerTypeList.find(
              (ele) => (ele.baseContainerType === containerType || ele.containerTypeCode === containerType)
            )
            item.containerType = find ? find.containerTypeCode : ''
            this.$nextTick(() => {
              this.$refs.form.clearValidate()
            })
          })
        }
      })
    },
  },
  mounted() {
    this.getContainerTypeList()
    this.$EventBus.$on('carrierScac', (val) => {
      this.carrierScac = val
      this.getHscodeList()
    })
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
    padding: 10px 8px 0;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    .cnt-left {
      flex: 1;
    }
    .cnt-right {
      margin: 0 10px 0 18px;
    }
  }
  .description-box {
    border-bottom: 1px dotted #ccc;
    margin-bottom: 20px;
    .cargo-box {
      width: 100%;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      .middle-item {
        width: 45%;
      }
      .small-item {
        width: 20%;
      }
      .small-input2 {
        width: 30%;
      }
      .small-select2 {
        width: 70%;
      }
      .small-input3 {
        width: 70%;
      }
      .small-select3 {
        width: 30%;
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
  .info-box {
    .el-form-item {
      width: 20%;
    }
    .item-info {
      flex: 1;
    }
    .item-box {
      display: flex;
      align-items: center;
      &.border {
        border-bottom: 1px solid rgba(0, 0, 0, 0.125);
      }
      padding-bottom: 10px;
      margin-bottom: 10px;
    }
    .item-info {
      .form-cnt {
        display: flex;
        justify-content: space-between;
        flex-basis: 1;
      }
      .small-item {
        width: 20%;
      }
      .big-item {
        width: 30%;
      }
      .middle-item {
        width: 15%;
      }
      .form-cnt {
        display: flex;
        align-items: center;
        // flex-wrap: wrap;
        flex: 1;
        .small-input2 {
          width: 30%;
        }
        .small-input {
          width: 60%;
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
      }
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
  .btn-box {
    text-align: center;
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
</style>
