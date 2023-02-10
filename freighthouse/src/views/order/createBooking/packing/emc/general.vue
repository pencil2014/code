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
                  <el-button
                    @click="copyBooker('shipper')"
                    class="btn-action"
                    icon="el-icon-s-custom"
                    size="mini"
                    type="primary"
                  >
                    My Role
                  </el-button>
                </div>
              </div>
            </el-form-item>
            <el-form-item
              class="addr-item"
              label=""
              prop="shipper.name"
            >
              <el-input
                placeholder="Enter Name..."
                show-word-limit
                type="textarea"
                spellcheck="false"
                v-model="form.shipper.name"
                @blur="handleTextarea('shipper','name', 35, 5)"
                :autosize="{ minRows: 0, maxRows: 5 }"
                :class="{ 'is-exceed': shippernameError }"
              ></el-input>
            </el-form-item>
          </div>
          <div class="btn-box2">
            <p class="error-tips" v-show="shippernameError">
              This field can accept only 5 lines of 35 characters
            </p>
            <el-button @click="showDialog('shipper')" size="mini" type="text">
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
                    @click="copyBooker('forwarder')"
                    class="btn-action"
                    icon="el-icon-s-custom"
                    size="mini"
                    type="primary"
                  >
                    My Role
                  </el-button>
                </div>
              </div>
            </el-form-item>
            <el-form-item
              class="addr-item"
              label=""
              prop="forwarder.name"
            >
              <el-input
                placeholder="Enter Name..."
                show-word-limit
                type="textarea"
                spellcheck="false"
                v-model="form.forwarder.name"
                @blur="handleTextarea('forwarder','name', 35, 5)"
                :autosize="{ minRows: 0, maxRows: 5 }"
                :class="{ 'is-exceed': forwardernameError }"
              ></el-input>
            </el-form-item>
          </div>
          <div class="btn-box2">
            <p class="error-tips" v-show="forwardernameError">
              This field can accept only 5 lines of 35 characters
            </p>
            <el-button @click="showDialog('forwarder')" size="mini" type="text">
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
            </el-form-item>
            <el-form-item
              class="addr-item"
              label=""
              prop="consignee.name"
            >
              <el-input
                placeholder="Enter Name..."
                show-word-limit
                type="textarea"
                spellcheck="false"
                v-model="form.consignee.name"
                @blur="handleTextarea('consignee','name', 35, 5)"
                :autosize="{ minRows: 0, maxRows: 5 }"
                :class="{ 'is-exceed': consigneenameError }"
              ></el-input>
            </el-form-item>
          </div>
          <div class="btn-box2">
            <p class="error-tips" v-show="consigneenameError">
              This field can accept only 5 lines of 35 characters
            </p>
            <el-button @click="showDialog('consignee')" size="mini" type="text">
              Add Party Details
            </el-button>
          </div>
        </div>
        <div class="item-box">
          <div class="cnt-info">
            <el-form-item label="" prop="notifyParty.name">
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
            </el-form-item>
            <el-form-item
              class="addr-item"
              label=""
              prop="notifyParty.name"
            >
              <el-input
                placeholder="Enter Name..."
                show-word-limit
                type="textarea"
                spellcheck="false"
                v-model="form.notifyParty.name"
                @blur="handleTextarea('notifyParty','name', 35, 5)"
                :autosize="{ minRows: 0, maxRows: 5 }"
                :class="{ 'is-exceed': notifyPartynameError }"
              ></el-input>
            </el-form-item>
          </div>
          <div class="btn-box2">
            <p class="error-tips" v-show="notifyPartynameError">
              This field can accept only 5 lines of 35 characters
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
              </el-form-item>
              <el-form-item
                class="addr-item"
                label=""
                prop="notifyParty2.name"
              >
                <el-input
                  placeholder="Enter Name..."
                  show-word-limit
                  type="textarea"
                  spellcheck="false"
                  v-model="form.notifyParty2.name"
                  @blur="handleTextarea('notifyParty2','name', 35, 5)"
                  :autosize="{ minRows: 0, maxRows: 5 }"
                  resize="none"
                  :class="{ 'is-exceed': notifyParty2nameError }"
                ></el-input>
              </el-form-item>
            </div>
            <div class="btn-box2">
              <p class="error-tips" v-show="notifyParty2nameError">
                This field can accept only 5 lines of 35 characters
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
      </div>
      <div class="carrier-box">
        <!-- :disabled="disabledCarrier" -->
        <el-form-item label="Carrier" prop="carrierScac">
          <el-select
            @change="changeCarrier"
            class="large-select"
            filterable
            clearable
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
        <el-form-item
          class="spec-item"
          label="HBL SCAC CODE"
          prop="hblScac"
        >
          <el-input
            placeholder="Enter Number..."
            type="text"
            v-model="form.hblScac"
          ></el-input>
        </el-form-item>
        <el-form-item
          class="spec-item"
          label="ACI/FF is reported by NVOCC"
          prop="aciReportedByNvocc"
        >
          <el-select v-model="form.aciReportedByNvocc" placeholder="Select One"  size="mini" clearable class="large-select">
            <el-option
              v-for="item in nvoccList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          class="spec-item"
          label="8000 code(CA)"
          prop="mfsCode"
        >
          <el-input
            placeholder="Enter Number..."
            type="text"
            v-model="form.mfsCode"
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
import GeneralDialog from '../components/generalDialog'
export default {
  inject: ['carrierSource'],
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
        hblScac: '',
        aciReportedByNvocc: '',
        mfsCode: '',
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
        },
        shipTo: {
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
        },
        freightPayer: {
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
        },
      },
      rules: {
        'shipper.name': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        'forwarder.name': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        'consignee.name': {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
        bookingNos: [
          {
            required: true,
            message: 'Required Field',
            trigger: 'change',
          }
        ],
        carrierScac: {
          required: true,
          message: 'Required Field',
          trigger: 'change',
        },
      },
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
      shippernameError: false,
      forwardernameError: false,
      consigneenameError: false,
      notifyPartynameError: false,
      notifyParty2nameError: false,
      disshipper: false,
      disforwarder: false,
      isCheck: false,
      disabledCarrier: false,
      nvoccList: [
        {
          label: 'Yes',
          value: 'yes'
        },
        {
          label: 'No',
          value: 'no'
        }
      ]
    }
  },
  created() {
    this.form = this.generalOption
    this.getCarrierList()
    // this.getBooker()
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
    // textarea格式化
    handleTextarea(type, key = 'name', num = 35, line = 5) {
      let res = []
      // const reg = new RegExp('(.{' + num + '})', 'g')
      const source = this.replaceChinese(this.form[type][key])
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
      this[`${type}${key}Error`] = res.length > line
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
          if (item.length > num) {
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
    // 港口下拉
    getCityList(str = '') {
      if (!str) {
        return
      }
      this.loading = true
      const data = {
        keyword: str,
      }
      cityList(data)
        .then((res) => {
          if (res.code === 0) {
            this.cityList = res.data || []
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    // 显示弹窗
    showDialog(type) {
      if (type) {
        this.dialogOptions.type = type
        const data = this.form[type]
        const { address, name, contact, street, country, province, city } = data
        this.dialogOptions.form = {
          address,
          street,
          country,
          province,
          city,
          contact: { ...contact },
          name,
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
        this.getBooker(source.companyId, source.carrierSource)
      }
    },
    // 获取船司列表
    getCarrierList(str = '') {
      const data = {
        keyword: str,
        type: 'si',
        carrierSource: this.carrierSource,
      }
      carrierList(data)
        .then((res) => {
          if (res.code === 0) {
            const source = res.data
            if (source.length) {
              this.carrierList = source.map((item) => {
                const {
                  carrierName,
                  scac,
                  companyId,
                  baseCarrierCode,
                  carrierSource,
                } = item
                return {
                  label: carrierName,
                  value: scac,
                  companyId,
                  baseCarrierCode,
                  carrierSource,
                }
              })
            } else {
              this.carrierList = []
            }
            this.initData()
          }
        })
        .catch(() => {})
    },
    // 获取货代信息
    getBooker(companyId, carrierSource) {
      const data = { companyId, carrierSource }
      booker(data)
        .then((res) => {
          if (res.code === 0) {
            this.bookerData = res.data || {}
            this.bookerData.name = this.bookerData.name + '\n' + this.bookerData.address
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
      this.handleTextarea(type, 'name', 35, 5)
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
      this.form.shipper.name.length && this.handleTextarea('shipper')
      this.form.consignee.name.length && this.handleTextarea('consignee')
      this.form.notifyParty.name.length && this.handleTextarea('notifyParty')
      this.form.notifyParty2.name.length && this.handleTextarea('notifyParty2')
      this.isCheck = true
      let shipmentId = this.$route.query.shipmentId
      if (shipmentId) {
        return
      }
      let carrierCode = this.$route.query.carrierCode
      let source = this.carrierList.find(
        (item) => item.baseCarrierCode === carrierCode
      )
      if (!source) {
        this.form.carrierScac = ''
        this.form.carrierName = ''
      } else {
        this.form.carrierScac = source.value
        this.form.carrierName = source.label
        this.changeCarrier(source.value)
        this.disabledCarrier = true
      }  
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
      margin-bottom: 0;
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
