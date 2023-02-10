<template>
  <div class="particulars-cnt">
    <el-form :inline="true" :model="form" label-position="top" ref="form" size="mini" class="form">
      <div
        class="container-box"
        v-for="(item, index) in form.list"
        :key="index"
        :class="{ 'cnt-border': index !== form.list.length - 1 }"
      >
        <div class="cnt-left">
          <div class="description-box">
            <div class="cargo-box" v-for="(option, i) in item.cargos" :key="i">
              <div class="cargo-cnt">
                <el-form-item
                  label="Cargo Description  (35 X 99 lines)"
                  :prop="`list.${index}.cargos.${i}.description`"
                  :rules="{
                    required: true,
                    message: 'Required Field',
                    trigger: 'change',
                  }"
                  class="middle-item"
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
                  :label="`Marks & Numbers (${marksRowLen} X 99 lines)`"
                  :prop="`list.${index}.cargos.${i}.marks`"
                  :rules="{
                    required: true,
                    message: 'Required Field',
                    trigger: 'change',
                  }"
                  class="middle-item"
                >
                  <el-input
                    placeholder="Enter Marks and Numbers..."
                    show-word-limit
                    type="textarea"
                    v-model="option.marks"
                    @blur="handleTextarea(index, i, 'marks', marksRowLen, 99)"
                    :class="{ 'is-exceed': marksErr[index+`${i}`] }"
                    :autosize="{ minRows: 7, maxRows: 7 }"
                    
                  ></el-input>
                  <p class="error-tips" v-if="marksErr[index+`${i}`]">
                    This field can accept only 99 lines of {{ marksRowLen }} characters
                  </p>
                  <p class="error-tips" v-else-if="marksSpaceErr[index+`${i}`]">
                    Empty line in Marks
                  </p>
                </el-form-item>
                <el-row :gutter="20">
                <el-col :span="6">
                  <el-form-item 
                    label="HS Code" 
                    :prop="`list.${index}.cargos.${i}.hsCode`"
                    class="middle-item"
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
                        :key="x.value"
                        :label="x.label"
                        :value="x.value"
                        v-for="x in hscodeList"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                  <template v-if="item.cargos.length > 1">
                    <el-col :span="6">
                      <el-form-item label="Package Count/Type " class="middle-item">
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
                          @change="changePackageType('cargos', index, i)"
                        >
                          <el-option
                            :key="cp.packageCode"
                            :label="cp.descpt"
                            :value="cp"
                            v-for="cp in packageList"
                          ></el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item label="Cargo Gross Weight" class="middle-item">
                        <el-input-number
                          class="small-input"
                          placeholder="Enter Weight..."
                          size="mini"
                          v-model="option.weight"
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
                            :key="cp.value"
                            :label="cp.label"
                            :value="cp.value"
                            v-for="cp in weightTypeList"
                          ></el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item label="Cargo Gross Volume" class="middle-item">
                        <el-input-number
                          class="small-input"
                          placeholder="Enter Volume..."
                          size="mini"
                          v-model="option.volume"
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
                            :key="cp.value"
                            :label="cp.label"
                            :value="cp.value"
                            v-for="cp in volumeTypeList"
                          ></el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </template>
                </el-row>
                <el-form-item class="flex-item">
                  <el-button
                    @click="showGoodslDialog(index, i)"
                    icon="el-icon-plus"
                    size="mini"
                    type="primary"
                  >
                    Add Hazmat Details
                  </el-button>
                </el-form-item>
              </div>
              <div class="btn-box">
                <i @click="addCargoItem(index)" class="el-icon-circle-plus" v-if="i === 0"></i>
                <i @click="removeCargoItem(index, i)" class="el-icon-remove" v-else></i>
              </div>
            </div>
          </div>
          <div class="info-box">
            <div
              :class="{ border: y !== item.containers.length - 1 }"
              :key="y"
              class="item-box"
              v-for="(ele, y) in item.containers"
            >
              <div class="item-cnt">
                <div class="item-info">
                  <div class="form-cnt">
                    <el-row :gutter="20">
                      <el-col :span="12">
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
                          <el-select
                            @change="changeContainerType(ele)"
                            class="small-select4"
                            placeholder="Select One"
                            reserve-keyword
                            size="mini"
                            filterable
                            clearable
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
                      </el-col>
                      <el-col :span="12">
                        <el-form-item v-show="ele.showReefer" label="Freezer instead of dry cabinet">
                          <el-select
                            v-model="ele.isUsedAsDry"
                            placeholder="Select One"
                            class="large-select"
                            clearable
                          >
                            <el-option
                              v-for="op in seperateType"
                              :key="op.value"
                              :label="op.label"
                              :value="op.value"
                            >
                            </el-option>
                          </el-select>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row :gutter="20">
                      <el-col :span="6">
                        <el-form-item 
                          label="Package Count/Type (Outermost)"
                          class=""
                          :prop="`list.${index}.containers.${y}.packageType`"
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
                            v-model="ele.quantity"
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
                            v-model="ele.packageType"
                            value-key="packageCode"
                            @change="changePackageType('containers', index, y)"
                          >
                            <el-option
                              :key="option.packageCode"
                              :label="option.descpt"
                              :value="option"
                              v-for="option in packageList"
                            ></el-option>
                          </el-select>
                        </el-form-item>
                      </el-col>
                    <el-col :span="6">
                      <el-form-item 
                        label="Print on B/L as" class="middle-item"  
                        :prop="`list.${index}.containers.${y}.printPackageType`"
                        :rules="{
                          required: true,
                          message: 'Required Field',
                          trigger: 'change',
                        }"
                      >
                        <el-input
                          type="text"
                          v-model="ele.printPackageType"
                          placeholder="Enter B/L Package Name..."
                          class="small-input3"
                        ></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item
                        label="Cargo Gross Weight (Cargo + Packaging)"
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
                    </el-col>
                    <el-col :span="6">
                      <el-form-item
                        label="Cargo Gross Volume (Cargo + Packaging)"
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
                    </el-col>
                    </el-row>
                  </div>
                </div>
                <div class="add-btn">
                  <el-button
                    @click="showContainerDialog(index, y)"
                    icon="el-icon-plus"
                    size="mini"
                    type="warning"
                    v-show="ele.showReefer"
                  >
                    Add Reefer Settings
                  </el-button>
                </div>
              </div>

              <div class="btn-box">
                <i @click="addItem(index, item.containers)" class="el-icon-circle-plus" v-if="y === 0"></i>
                <i @click="removeItem(index, y)" class="el-icon-remove" v-else></i>
              </div>
            </div>
          </div>
        </div>
        <div class="cnt-right">
          <div class="btn-box">
            <i @click="addItemOuter" class="el-icon-circle-plus" v-if="index === 0"></i>
            <i @click="removeItemOuter(index)" class="el-icon-remove" v-else></i>
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
import { containerTypeList, packageList, hscodeList } from '@/api/order/createBooking'
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
    carrierScac: {
      type: String,
      default: '',
    },
  },
  components: {
    GoodsDialog,
    ContainerDialog,
  },
  data() {
    return {
      cargoType: false,
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
      dialogGoodsOptions: {
        index: [0, 0],
        show: false,
        form: {},
      },
      dialogContainerOptions: {
        show: false,
        index: [0, 0],
        form: {},
      },
      hscodeList: [],
      loading: false,
      descriptionErr: {},
      marksErr: {},
      marksSpaceErr: {},
      isCheck: true,
      marksRowLen: 35,
    }
  },
  created() {
    let shipmentId = this.$route.query.shipmentId
    if (shipmentId) {
      this.isCheck = true
    }
    this.form.list = this.particularsOption
    this.getContainerTypeList()
  },
  watch: {
    particularsOption(val) {
      if (val) {
        this.form.list = this.particularsOption
        this.form.list.forEach((item) => {
          item.containers.forEach((ele) => {
            ele.containerType.includes('R') && (ele.showReefer = true)
          })
        })
        this.checkChinese()
      }
    },
    carrierScac: {
      handler(val) {
        const list = ['CHNL', 'CMDU', 'ANNU']
        if (val && list.includes(val)) {
          this.marksRowLen = 20
        } else {
          this.marksRowLen = 35
        }
        this.checkChinese()
      },
      deep: true,
    },
  },
  methods: {
    checkChinese() {
       // 汉字校验
      this.form.list.forEach((item1, index) => {
        (item1.cargos || []).forEach((item2, i) => {
          item2.description && this.handleTextarea(index, i, 'description', 35, 99)
          item2.marks && this.handleTextarea(index, i, 'marks', this.marksRowLen, 99)
        })
      })
    },
    // 搜索编码
    getHscodeList(str = '') {
      const data = {
        keyword: str,
        carrierSource: this.carrierSource,
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
      // this[`${type}Err`].splice(index, 1, res.length > line)
       this.$set( this[`${type}Err`], [index+`${i}`], res.length > line )
      this.form.list[index].cargos[i][type] = res.join('\n')
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
          if (item.length > num) {
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
          this.$set( this[`${type}Err`], [index+`${i}`], true )
          const text = `The number of characters in lines ${lengthIndex.join(
            ','
          )} exceeds ${num}  please check`
          return this.$msgErrClose(text)
        }
      }
      if (type === 'marks') {
        let haveSpace = res.some((ele) => !ele)
        this.$set( this[`${type}SpaceErr`], [index+`${i}`], haveSpace )
        haveSpace && this.$msgErrClose('Empty line in Marks')
      }
    },
     // 添加caoge数据
    addCargoItem(index) {
      this.form.list[index].cargos.push({
        hsCode: '',
        description: '',
        marks: '',
        quantity: '',
        volume: '',
        weight: '',
        packageType: '',
        packageTypeCode: '',
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
      })
    },
    // 添加数据
    addItem(index, containers) {
      let packageType = ''
      let printPackageType = ''
      if (containers && containers.length) {
        packageType = containers[0].packageType
        printPackageType = containers[0].printPackageType
      }
      this.form.list[index].containers.push({
        containerType: '',
        quantity: '',
        packageType,
        packageTypeCode: '',
        printPackageType,
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
            packageType: '',
            packageTypeCode: '',
            printPackageType: '',
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
    // 删除数据
    removeItem(index, y) {
      this.$confirmWarn('确定删除此数据吗？', () => this.form.list[index].containers.splice(y, 1))
    },
    removeItemOuter(index) {
      this.$confirmWarn('确定删除此数据吗？', () => this.form.list.splice(index, 1))
    },
    removeCargoItem(index, i) {
      this.$confirmWarn('确定删除此数据吗？', () => this.form.list[index].cargos.splice(i, 1))
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
    changePackageType(type, index, y) {
      if (!this.form.list[index][type][y].printPackageType) {
        const source = this.form.list[index][type][y].packageType
        this.form.list[index][type][y].printPackageType = source.descpt
      }
    },
    // 显示弹窗
    showGoodslDialog(index, y) {
      this.dialogGoodsOptions.index = [index, y]
      this.dialogGoodsOptions.form = this.form.list[index].cargos[y].dangerousDto
      this.dialogGoodsOptions.show = true
    },
    // 提交弹窗
    submitGoodsDialog(data) {
      const [x, y] = this.dialogGoodsOptions.index
      this.form.list[x].cargos[y].dangerousDto = data
      this.closeGoodsDialog()
    },
    // 关闭弹窗
    closeGoodsDialog() {
      this.dialogGoodsOptions.show = false
    },
    // 显示弹窗
    showContainerDialog(index, y) {
      this.dialogContainerOptions.index = [index, y]
      this.dialogContainerOptions.form = this.form.list[index].containers[y].reeferDto
      this.dialogContainerOptions.show = true
    },
    // 提交弹窗
    submitContainerDialog(data) {
      const [index, y] = this.dialogContainerOptions.index
      this.form.list[index].containers[y].reeferDto = data
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
            let find = packageList.find((ele) => ele.basePackageEname === packageType)
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
            let find = containerTypeList.find((ele) => (ele.baseContainerType === containerType || ele.containerTypeCode === containerType))
            item.containerType = find ? find.containerTypeCode : ''
            this.$nextTick(() => {
              this.$refs.form.clearValidate()
            })
          })
        }
      })
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
    padding: 10px 0 0 8px;
    margin-bottom: 10px;
    display: flex;
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
    margin-bottom: 20px;
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
  .info-box {
    .form-cnt {
      display: flex;
      // justify-content: flex-start;
      flex-direction: column;
      flex-wrap: wrap;
    }
    .el-form-item {
      width: 100%;
      margin-bottom: 10px;
      // margin-left: 5px;
    }
    .item-box {
      display: flex;
      // align-items: center;
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
      justify-content: space-between;
      .form-cnt {
        display: flex;
        // align-items: center;
        // flex-wrap: wrap;
        flex: 1;
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
