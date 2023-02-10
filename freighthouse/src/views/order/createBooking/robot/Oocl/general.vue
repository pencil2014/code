<template>
  <div class="general-cnt">
    <el-form
      :inline="true"
      :model="form"
      :rules="rules"
      class="form"
      label-position="top"
      ref="form"
      size="mini"
    >
      <div class="address-box">
        <div class="item-box">
          <div class="cnt-info">
            <el-form-item label="Shipper" prop="shipper.name">
              <div class="label-box" slot="label">
                <div class="title">Shipper</div>
                <div class="btn-box">
                  <el-button
                    @click="clearData('shipper')"
                    class="btn-text"
                    icon="el-icon-close"
                    size="mini"
                    type="text"
                  >
                    Clear
                  </el-button>
                  <!-- <el-button
                    @click="copyBooker('shipper')"
                    class="btn-action"
                    icon="el-icon-s-custom"
                    size="mini"
                    type="primary"
                  >
                    My Role
                  </el-button> -->
                </div>
              </div>
              <el-input
                :rows="1"
                placeholder="Enter Name..."
                show-word-limit
                type="textarea"
                spellcheck="false"
                v-model="form.shipper.name"
                @blur="handleTextarea('shipper', 'name', 'shipper.name')"
                :autosize="{ minRows: 0, maxRows: 2 }"
                
              ></el-input>
              <p class="error-tips" v-show="shippernameError">
                {{ getErrTip('shipper.name')}}
                
              </p>
            </el-form-item>
            <el-form-item
              class="addr-item"
              label="Address (Printed on B/L)"
              prop="shipper.address"
            >
              <el-input
                placeholder="Enter Address..."
                show-word-limit
                type="textarea"
                spellcheck="false"
                v-model="form.shipper.address"
                @blur="handleTextarea('shipper', 'address', 'shipper.address')"
                :autosize="{ minRows: 0, maxRows: 4 }"
                
                :class="{ 'is-exceed': shipperaddressError }"
              ></el-input>
            </el-form-item>
          </div>
          <div class="btn-box2">
            <p class="error-tips" v-show="shipperaddressError">
              {{ getErrTip('shipper.address')}}
            </p>
            <el-button @click="showDialog('shipper')" size="mini" type="text">
              Add Party Details
            </el-button>
          </div>
        </div>
        <div class="item-box">
          <div class="cnt-info">
            <el-form-item label="Consignee" prop="consignee.name">
              <div class="label-box" slot="label">
                <div class="title">Consignee</div>
                <div class="btn-box">
                  <el-button
                    @click="clearData('consignee')"
                    class="btn-text"
                    icon="el-icon-close"
                    size="mini"
                    type="text"
                  >
                    Clear
                  </el-button>
                </div>
              </div>
              <el-input
                :rows="1"
                placeholder="Enter Name..."
                show-word-limit
                type="textarea"
                spellcheck="false"
                v-model="form.consignee.name"
                @blur="handleTextarea('consignee', 'name', 'consignee.name')"
                :autosize="{ minRows: 0, maxRows: 2 }"
                
              ></el-input>
              <p class="error-tips" v-show="consigneenameError">
                {{ getErrTip('consignee.name')}}
              </p>
            </el-form-item>
            <el-form-item
              class="addr-item"
              label="Address (Printed on B/L)"
              prop="consignee.address"
            >
              <el-input
                placeholder="Enter Address..."
                show-word-limit
                type="textarea"
                spellcheck="false"
                v-model="form.consignee.address"
                @blur="handleTextarea('consignee', 'address', 'consignee.address')"
                :autosize="{ minRows: 0, maxRows: 4 }"
                
                :class="{ 'is-exceed': consigneeaddressError }"
              ></el-input>
            </el-form-item>
          </div>
          <div class="btn-box2">
            <p class="error-tips" v-show="consigneeaddressError">
              {{ getErrTip('consignee.address')}}
            </p>
            <el-button @click="showDialog('consignee')" size="mini" type="text">
              Add Party Details
            </el-button>
          </div>
        </div>
        <div class="item-box">
          <div class="cnt-info">
            <el-form-item label="Notify Party" prop="notifyParty.name">
              <div class="label-box" slot="label">
                <div class="title">Notify Party</div>
                <div class="btn-box">
                  <el-button
                    @click="clearData('notifyParty')"
                    class="btn-text"
                    icon="el-icon-close"
                    size="mini"
                    type="text"
                  >
                    Clear
                  </el-button>
                </div>
              </div>
              <el-input
                :rows="1"
                placeholder="Enter Name..."
                show-word-limit
                type="textarea"
                spellcheck="false"
                v-model="form.notifyParty.name"
                :autosize="{ minRows: 0, maxRows: 2 }"
                
                @blur="handleTextarea('notifyParty', 'name', 'notifyParty.name')"
              ></el-input>
              <p class="error-tips" v-show="notifyPartynameError">
                {{ getErrTip('notifyParty.name')}}
              </p>
            </el-form-item>
            <el-form-item
              class="addr-item"
              label="Address (Printed on B/L)"
              prop="notifyParty.address"
            >
              <el-input
                placeholder="Enter Address..."
                show-word-limit
                type="textarea"
                spellcheck="false"
                v-model="form.notifyParty.address"
                @blur="handleTextarea('notifyParty', 'address', 'notifyParty.address')"
                :autosize="{ minRows: 0, maxRows: 4 }"
                
                :class="{ 'is-exceed': notifyPartyaddressError }"
              ></el-input>
            </el-form-item>
          </div>
          <div class="btn-box2">
            <p class="error-tips" v-show="notifyPartyaddressError">
              {{ getErrTip('notifyParty.address')}}
            </p>
            <el-button
              @click="showDialog('notifyParty')"
              size="mini"
              type="text"
            >
              Add Party Details
            </el-button>
          </div>
        </div>
        <div class="item-box">
          <div class="cnt-info">
            <el-form-item label="Forwarder" prop="forwarder.name">
              <div class="label-box" slot="label">
                <div class="title">Forwarder</div>
                <div class="btn-box">
                  <el-button
                    @click="clearData('forwarder')"
                    class="btn-text"
                    icon="el-icon-close"
                    size="mini"
                    type="text"
                  >
                    Clear
                  </el-button>
                </div>
              </div>
              <el-input
                :rows="1"
                placeholder="Enter Name..."
                show-word-limit
                type="textarea"
                spellcheck="false"
                v-model="form.forwarder.name"
                @blur="handleTextarea('forwarder', 'name', 'forwarder.name')"
                :autosize="{ minRows: 0, maxRows: 2 }"
                
              ></el-input>
              <p class="error-tips" v-show="forwardernameError">
                {{ getErrTip('forwarder.name')}}
              </p>
            </el-form-item>
            <el-form-item
              class="addr-item"
              label="Address (Printed on B/L)"
              prop="forwarder.address"
            >
              <el-input
                placeholder="Enter Address..."
                show-word-limit
                type="textarea"
                spellcheck="false"
                v-model="form.forwarder.address"
                @blur="handleTextarea('forwarder', 'address', 'forwarder.address')"
                :autosize="{ minRows: 0, maxRows: 4 }"
                
                :class="{ 'is-exceed': forwarderaddressError }"
              ></el-input>
            </el-form-item>
          </div>
          <div class="btn-box2">
            <p class="error-tips" v-show="forwarderaddressError">
              {{ getErrTip('forwarder.address')}}
            </p>
            <el-button @click="showDialog('forwarder')" size="mini" type="text">
              Add Party Details
            </el-button>
          </div>
        </div>
        <template v-if="showMore">
          <div class="item-box">
            <div class="cnt-info">
              <el-form-item label="Notify Party 2" prop="notifyParty2.name">
                <div class="label-box" slot="label">
                  <div class="title">Notify Party 2</div>
                  <div class="btn-box">
                    <el-button
                      @click="clearData('notifyParty2')"
                      class="btn-text"
                      icon="el-icon-close"
                      size="mini"
                      type="text"
                    >
                      Clear
                    </el-button>
                  </div>
                </div>
                <el-input
                  :rows="1"
                  placeholder="Enter Name..."
                  show-word-limit
                  type="textarea"
                  spellcheck="false"
                  v-model="form.notifyParty2.name"
                  :autosize="{ minRows: 0, maxRows: 2 }"
                  
                  @blur="handleTextarea('notifyParty2', 'name', 'notifyParty2.name')"
                ></el-input>
                <p class="error-tips" v-show="notifyParty2nameError">
                  {{ getErrTip('notifyParty2.name')}}
                </p>
              </el-form-item>
              <el-form-item
                class="addr-item"
                label="Address (Printed on B/L)"
                prop="notifyParty2.address"
              >
                <el-input
                  placeholder="Enter Address..."
                  show-word-limit
                  type="textarea"
                  spellcheck="false"
                  v-model="form.notifyParty2.address"
                  @blur="handleTextarea('notifyParty2', 'address', 'notifyParty2.address')"
                  :autosize="{ minRows: 0, maxRows: 4 }"
                  
                  :class="{ 'is-exceed': notifyParty2addressError }"
                ></el-input>
              </el-form-item>
            </div>
            <div class="btn-box2">
              <p class="error-tips" v-show="notifyParty2addressError">
                {{ getErrTip('notifyParty2.address')}}
              </p>
              <el-button
                @click="showDialog('notifyParty2')"
                size="mini"
                type="text"
              >
                Add Party Details
              </el-button>
            </div>
          </div>
          <div class="item-box">
            <div class="cnt-info">
              <el-form-item label="Notify Party 3" prop="notifyParty3.name">
                <div class="label-box" slot="label">
                  <div class="title">Notify Party 3</div>
                  <div class="btn-box">
                    <el-button
                      @click="clearData('notifyParty3')"
                      class="btn-text"
                      icon="el-icon-close"
                      size="mini"
                      type="text"
                    >
                      Clear
                    </el-button>
                  </div>
                </div>
                <el-input
                  :rows="1"
                  placeholder="Enter Name..."
                  show-word-limit
                  type="textarea"
                  spellcheck="false"
                  v-model="form.notifyParty3.name"
                  :autosize="{ minRows: 0, maxRows: 2 }"
                  
                  @blur="handleTextarea('notifyParty3', 'name', 'notifyParty3.name')"
                ></el-input>
                <p class="error-tips" v-show="notifyParty3nameError">
                  {{ getErrTip('notifyParty3.name')}}
                </p>
              </el-form-item>
              <el-form-item
                class="addr-item"
                label="Address (Printed on B/L)"
                prop="notifyParty3.address"
              >
                <el-input
                  placeholder="Enter Address..."
                  show-word-limit
                  type="textarea"
                  spellcheck="false"
                  v-model="form.notifyParty3.address"
                  @blur="handleTextarea('notifyParty3', 'address', 'notifyParty3.address')"
                  :autosize="{ minRows: 0, maxRows: 4 }"
                  
                  :class="{ 'is-exceed': notifyParty3addressError }"
                ></el-input>
              </el-form-item>
            </div>
            <div class="btn-box2">
              <p class="error-tips" v-show="notifyParty3addressError">
                {{ getErrTip('notifyParty3.address')}}
              </p>
              <el-button
                @click="showDialog('notifyParty3')"
                size="mini"
                type="text"
              >
                Add Party Details
              </el-button>
            </div>
          </div>
        </template>
        <div @click="showMore = !showMore" class="showmore">
          <i class="el-icon-arrow-down" v-if="!showMore"></i>
          <i class="el-icon-arrow-up" v-else></i>
          Additional Parties
        </div>
      </div>
      <div class="carrier-box">
        <!-- :disabled="disabledCarrier" -->
        <el-form-item label="Carrier" prop="carrierScac">
          <el-select
            @change="changeCarrier"
            class="large-select"
            placeholder="Select One"
            size="mini"
            v-model="form.carrierScac"
          >
            <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in carrierList"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          class="spec-item"
          label="Carrier Booking Number"
          prop="bookingNos"
        >
          <el-input
            placeholder="Enter Number..."
            type="text"
            v-model="form.bookingNos"
            @blur="checkSpecialChart"
          ></el-input>
          <span class="tips">(multiples allowed ex. 371, 425)</span>
        </el-form-item>

        <el-form-item
          class="spec-item"
          label="Contract Reference Number"
          prop="contractNo"
        >
          <el-input
            placeholder="Enter Number..."
            type="text"
            v-model="form.contractNo"
          ></el-input>
        </el-form-item>
        <el-form-item
          class="spec-item"
          label="B/L Reference Number"
          prop="blNo"
        >
          <el-input
            placeholder="Enter Number..."
            type="text"
            v-model="form.blNo"
          ></el-input>
        </el-form-item>
      </div>
    </el-form>
    <GeneralDialog
      :dialogOptions="dialogOptions"
      @cancle="closeDialog"
      @submit="submitDialog"
      v-if="dialogOptions.show"
      :replaceChinese="replaceChinese"
    />
  </div>
</template>

<script>
import { carrierList, booker, cityList } from '@/api/order/createBooking'
import GeneralDialog from './generalDialog'
export default {
  inject: ['carrierSource', 'dictAll'],
  props: {
    generalOption: {
      required: true,
      type: Object,
      default: () => {},
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
    }
  },
  components: {
    GeneralDialog,
  },
  data() {
    return {
      form: {
        bookingNos: '',
        carrierScac: '',
        carrierName: '',
        contractNo: '',
        blNo: '',
        shipper: {
          address: '',
          street: '',
          city: '',
          province: '',
          country: '',
          companyId: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
          zipCode: '',
          eoriNo: '',
          additionInformation: {
            iecCode: '',
            panNo: '',
          },
          gstNo: '',
          officialEmail: '',
          currencyCode: '',
          invoiceValue: '',
        },
        forwarder: {
          address: '',
          street: '',
          city: '',
          province: '',
          country: '',
          companyId: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
          zipCode: '',
          eoriNo: '',
          additionInformation: {
            iecCode: '',
            panNo: '',
          },
          gstNo: '',
          officialEmail: '',
          currencyCode: '',
          invoiceValue: '',
        },
        consignee: {
          address: '',
          street: '',
          city: '',
          province: '',
          country: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
          zipCode: '',
          eoriNo: '',
          additionInformation: {
            iecCode: '',
            panNo: '',
          },
          gstNo: '',
          officialEmail: '',
          currencyCode: '',
          invoiceValue: '',
        },
        notifyParty: {
          address: '',
          street: '',
          city: '',
          province: '',
          country: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
          zipCode: '',
          eoriNo: '',
          additionInformation: {
            iecCode: '',
            panNo: '',
          },
          gstNo: '',
          officialEmail: '',
          currencyCode: '',
          invoiceValue: '',
        },
        notifyParty2: {
          address: '',
          street: '',
          city: '',
          province: '',
          country: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
          zipCode: '',
          eoriNo: '',
          additionInformation: {
            iecCode: '',
            panNo: '',
          },
          gstNo: '',
          officialEmail: '',
          currencyCode: '',
          invoiceValue: '',
        },
        notifyParty3: {
          address: '',
          street: '',
          city: '',
          province: '',
          country: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
          zipCode: '',
          eoriNo: '',
          additionInformation: {
            iecCode: '',
            panNo: '',
          },
          gstNo: '',
          officialEmail: '',
          currencyCode: '',
          invoiceValue: '',
        },
      },
      rules: this.fieldConfigObj,
      showMore: false,
      carrierList: [],
      bookerData: {},
      dialogOptions: {
        show: false,
        type: '',
        form: {},
      },
      loading: false,
      cityList: [],
      shipperaddressError: false,
      forwarderaddressError: false,
      consigneeaddressError: false,
      notifyPartyaddressError: false,
      notifyParty2addressError: false,
      notifyParty3addressError: false,
      shipToaddressError: false,
      freightPayeraddressError: false,
      shippernameError: false,
      forwardernameError: false,
      consigneenameError: false,
      notifyPartynameError: false,
      notifyParty2nameError: false,
      notifyParty3nameError: false,
      shipTonameError: false,
      freightPayernameError: false,
      disshipper: false,
      disforwarder: false,
      isCheck: true,
      disabledCarrier: false,
    }
  },
  created() {
    this.form = this.generalOption
    // this.getBooker()
  },
  mounted() {
    this.getCarrierList()
  },
  watch: {
    'form.forwarder' (val) {
      if (!this.bookerData.name) {
        this.bookerData = Object.assign(this.bookerData, val)
      }
    }
  },
  methods: {
    checkSpecialChart(){
      let value = this.form.bookingNos
      let reg = /^[A-Za-z0-9,]+$/
      let check = true
      if (value && !reg.test(value)) {
        check = false
        this.$msgErrClose('Special characters are not allowed for Carrier Booking Number')
      }
      return check
    },
    getErrTip(fieldName) {
      let fieldConfig = this.fieldConfigList.find(item => {
        return item.fieldName === fieldName
      }) || {}
      let num = fieldConfig.maxLength || null
      let line = fieldConfig.maxRow || null
      if (num && line) {
         return `This field can accept only ${line} lines of ${num} characters`
      }
    },
    // textarea格式化
    handleTextarea(type, key = 'address', fieldName) {
      let fieldConfig = this.fieldConfigList.find(item => {
        return item.fieldName === fieldName
      }) || {}
      let num = fieldConfig.maxLength || null
      let line = fieldConfig.maxRow || null
      let res = []
      // const reg = new RegExp('(.{' + num + '})', 'g')
      const source = this.replaceChinese(this.form[type][key])
      const arr = source.split('\n')
      arr.forEach((item) => {
        const len = item.length
        if (num && len > num) {
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
      this[`${type}${key}Error`] = (line && res.length > line)
      this.form[type][key] = res.join('\n')
      // 汉字检测
      if (this.isCheck) {
        // 汉字校验
        const reg =
          /[\u4e00-\u9fa5]|[\uFE30-\uFFA0]|[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/gi
        let chineseIndex = []
        let lengthIndex = []
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
          let text = `There are Chinese characters in lines ${chineseIndex.join(
            ','
          )} please check`
          this.$msgErrClose(text)
        }
        if (lengthIndex.length) {
          this[`${type}${key}Error`] = true
          let text = `The number of characters in lines ${lengthIndex.join(
            ','
          )} exceeds ${num}  please check`
          this.$msgErrClose(text)
        }
      }
    },
    // 显示弹窗
    showDialog(type) {
      if (type) {
        this.dialogOptions.type = type
        const data = this.form[type]
        const { 
          address, 
          name, 
          contact, 
          additionInformation,
          street, 
          country, 
          province, 
          city, 
          zipCode,
          eoriNo,
          gstNo,
          officialEmail,
          currencyCode,
          invoiceValue,  } = data
        this.dialogOptions.form = {
          address,
          street,
          country,
          province,
          city,
          contact: { ...contact },
          additionInformation: { ...additionInformation },
          name,
          zipCode,
          eoriNo,
          gstNo,
          officialEmail,
          currencyCode,
          invoiceValue,
        }
        this.dialogOptions.show = true
      }
    },
    // 提交弹窗
    submitDialog(data) {
      const type = this.dialogOptions.type
      this.form[type] = Object.assign(this.form[type], data)
      this.closeDialog()
    },
    // 关闭弹窗
    closeDialog() {
      this.dialogOptions.show = false
    },
    // 选择船司
    changeCarrier(val) {
      if (val) {
        const source = this.carrierList.find((item) => item.value === val)
        this.form.carrierName = source?.label || val
        this.$emit('changeCarrierCb', val)
        // this.getBooker(source.companyId, source.carrierSource)
      }
    },
    // 获取船司列表
    getCarrierList() {
      this.$store.dispatch('robotSi/getCarrierList')
      .then(list => {
        this.carrierList = list
      })
      // this.initData()
    },
    // 获取货代信息
    getBooker(companyId, carrierSource) {
      const data = { companyId, carrierSource }
      booker(data)
        .then((res) => {
          if (res.code === 0) {
            this.bookerData = res.data || {}
            this.copyBooker('forwarder')
            if (this.disshipper) {
              this.copyBooker('shipper')
            }
          }
        })
        .catch(() => {})
    },
    // 复制货代信息
    copyBooker(type) {
      if (!this.form.carrierScac) {
        return this.$msgErrClose('Please select carrier first')
      }
      this.form[type] = Object.assign(
        {},
        { street: '', city: '', province: '', country: '' },
        this.bookerData
      )
      this['dis' + type] = true
      this.handleTextarea(type, 'name', 35, 2)
      this.handleTextarea(type, 'address')
    },
    // Clear信息
    clearData(type) {
      const reset = {
        shipper: {
          address: '',
          code: '',
          companyId: '',
          street: '',
          city: '',
          province: '',
          country: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
          zipCode: '',
          eoriNo: '',
          additionInformation: {
            iecCode: '',
            panNo: '',
          },
          gstNo: '',
          officialEmail: '',
          currencyCode: '',
          invoiceValue: '',
        },
        forwarder: {
          address: '',
          street: '',
          city: '',
          province: '',
          country: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
          zipCode: '',
          eoriNo: '',
          additionInformation: {
            iecCode: '',
            panNo: '',
          },
          gstNo: '',
          officialEmail: '',
          currencyCode: '',
          invoiceValue: '',
        },
        consignee: {
          address: '',
          street: '',
          city: '',
          province: '',
          country: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
          zipCode: '',
          eoriNo: '',
          additionInformation: {
            iecCode: '',
            panNo: '',
          },
          gstNo: '',
          officialEmail: '',
          currencyCode: '',
          invoiceValue: '',
        },
        notifyParty: {
          address: '',
          street: '',
          city: '',
          province: '',
          country: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
          zipCode: '',
          eoriNo: '',
          additionInformation: {
            iecCode: '',
            panNo: '',
          },
          gstNo: '',
          officialEmail: '',
          currencyCode: '',
          invoiceValue: '',
        },
        notifyParty2: {
          address: '',
          street: '',
          city: '',
          province: '',
          country: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
          zipCode: '',
          eoriNo: '',
          additionInformation: {
            iecCode: '',
            panNo: '',
          },
          gstNo: '',
          officialEmail: '',
          currencyCode: '',
          invoiceValue: '',
        },
        notifyParty3: {
          address: '',
          street: '',
          city: '',
          province: '',
          country: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
          zipCode: '',
          eoriNo: '',
          additionInformation: {
            iecCode: '',
            panNo: '',
          },
          gstNo: '',
          officialEmail: '',
          currencyCode: '',
          invoiceValue: '',
        },
      }
      this.form[type] = Object.assign(this.form[type], reset[type])
      this['dis' + type] = false
    },
    // 数据校验
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
     // 格式化数据
      this.form.shipper.address && this.handleTextarea('shipper', 'address', 'shipper.address')
      this.form.shipper.name &&
        this.handleTextarea('shipper', 'name', 'shipper.name')
      this.form.consignee.address && this.handleTextarea('consignee', 'address', 'consignee.address')
      this.form.consignee.name &&
        this.handleTextarea('consignee', 'name', 'consignee.name')
      this.form.notifyParty.address && this.handleTextarea('notifyParty', 'address', 'notifyParty.address')
      this.form.notifyParty.name &&
        this.handleTextarea('notifyParty', 'name', 'notifyParty.name')
      this.form.notifyParty2.address &&
        this.handleTextarea('notifyParty2', 'address', 'notifyParty2.address')
      this.form.notifyParty2.name &&
        this.handleTextarea('notifyParty2', 'name', 'notifyParty2.name')
      this.form.notifyParty3.address &&
        this.handleTextarea('notifyParty3', 'address', 'notifyParty3.address')
      this.form.notifyParty3.name &&
        this.handleTextarea('notifyParty3', 'name', 'notifyParty3.name')
      this.isCheck = true
    },
  },
}
</script>

<style lang="scss">
.general-cnt {
  .form {
    display: flex;
    .el-form-item {
      width: 100%;
      margin-bottom: 10px;
      .el-form-item__label {
        width: 100%;
      }
    }
    .address-box {
      padding: 8px 8px 0;
      width: 70%;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      .item-box {
        flex-basis: 48%;
        border-bottom: 1px solid #e3e3e3;
        margin-bottom: 15px;
        padding-bottom: 10px;
        .cnt-info {
          .el-form-item__label {
            display: flex;
            align-items: center;
          }
          .label-box {
            display: flex;
            align-items: center;
            width: 100%;
            .title {
              height: 30px;
              line-height: 30px;
            }
            .btn-box {
              flex: 1;
              text-align: right;
              height: 20px;
              color: #277ab5;
              .el-button--text {
                height: 20px;
                padding: 0 5px;
                color: #277ab5;
              }
              .el-button--primary {
                height: 20px;
                padding: 0 5px;
                background-color: #277ab5;
                border: none;
                &:hover {
                  background-color: #216697;
                }
              }
            }
          }
          .addr-item {
            margin-bottom: 0;
          }
        }
        .btn-box2 {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          .error-tips {
            color: red;
            flex: 1;
            margin-right: 10px;
          }
          .el-button--text {
            color: #277ab5;
          }
        }
      }
      .showmore {
        width: 100%;
        margin: 10px;
        color: #277ab5;
        cursor: pointer;
      }
    }
    .carrier-box {
      width: 30%;
      background-color: #fff;
      padding: 8px;
      border-radius: 4px;
      .el-form-item__label {
        height: 30px;
        line-height: 30px;
      }
      .large-select {
        width: 100%;
      }
      .bottom-item {
        margin-top: 15px;
      }
      .tips {
        color: #999;
        font-size: 12px;
      }
    }
  }
}
</style>
