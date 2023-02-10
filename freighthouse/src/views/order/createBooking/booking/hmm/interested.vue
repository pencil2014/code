<template>
  <div>
    <div class="intereste-cnt">
      <div class="intereste-item">
        <div class="title-box">
          <div class="title"><b style="color: #ff4949">*</b> Shipper</div>
          <div class="btn-box">
            <el-button
              @click="clearData('shipper')"
              icon="el-icon-close"
              size="mini"
              type="text"
              v-show="form.shipper.name"
            >
              Clear
            </el-button>
            <el-button
              @click="copyBooker('shipper')"
              icon="el-icon-s-custom"
              size="mini"
              type="primary"
            >
              My Role
            </el-button>
          </div>
        </div>
        <div class="cnt-box">
          <el-input
            :disabled="disshipper"
            placeholder="Enter Name..."
            show-word-limit
            size="mini"
            type="textarea"
            spellcheck="false"
            v-model="form.shipper.name"
            :autosize="{ minRows: 0, maxRows: 2 }"
            resize="none"
            @blur="handleTextarea('shipper', 'name')"
            :class="{ 'is-exceed': shippernameError }"
          ></el-input>
          <div class="btn-box2">
            <p class="error-tips" v-show="shippernameError">
              This field can accept only 2 lines of 35 characters
            </p>
            <el-button
              @click="showDialog('shipper')"
              size="mini"
              type="text"
              v-show="form.shipper.name"
            >
              Add Party Details
            </el-button>
          </div>
        </div>
      </div>
      <div class="intereste-item">
        <div class="title-box">
          <div class="title"><b style="color: #ff4949">*</b> Booking Agent</div>
          <div class="btn-box">
            <el-button
              @click="clearData('forwarder')"
              icon="el-icon-close"
              size="mini"
              type="text"
              v-show="form.forwarder.name"
            >
              Clear
            </el-button>
            <el-button
              @click="copyBooker('forwarder')"
              icon="el-icon-s-custom"
              size="mini"
              type="primary"
            >
              My Role
            </el-button>
          </div>
        </div>
        <div class="cnt-box">
          <el-input
            placeholder="Enter Name..."
            show-word-limit
            size="mini"
            type="textarea"
            spellcheck="false"
            v-model="form.forwarder.name"
            :autosize="{ minRows: 0, maxRows: 2 }"
            resize="none"
            @blur="handleTextarea('forwarder', 'name')"
            :class="{ 'is-exceed': forwardernameError }"
          ></el-input>
          <div class="btn-box2">
            <p class="error-tips" v-show="forwardernameError">
              This field can accept only 2 lines of 35 characters
            </p>
            <el-button
              @click="showDialog('forwarder')"
              size="mini"
              type="text"
              v-show="form.forwarder.name"
            >
              Add Party Details
            </el-button>
          </div>
        </div>
      </div>
      <div class="intereste-item">
        <div class="title-box">
          <div class="title">Consignee</div>
          <div class="btn-box">
            <el-button
              @click="clearData('consignee')"
              icon="el-icon-close"
              size="mini"
              type="text"
              v-show="form.consignee.name"
            >
              Clear
            </el-button>
            <!-- <el-button @click="copyBooker('consignee')" size="mini" type="primary" icon="el-icon-s-custom">My Role</el-button> -->
          </div>
        </div>
        <div class="cnt-box">
          <el-input
            :disabled="disconsignee"
            placeholder="Enter Name..."
            show-word-limit
            size="mini"
            type="textarea"
            spellcheck="false"
            v-model="form.consignee.name"
            :autosize="{ minRows: 0, maxRows: 2 }"
            resize="none"
            @blur="handleTextarea('consignee', 'name')"
            :class="{ 'is-exceed': consigneenameError }"
          ></el-input>
          <div class="btn-box2">
            <p class="error-tips" v-show="consigneenameError">
              This field can accept only 2 lines of 35 characters
            </p>
            <el-button
              @click="showDialog('consignee')"
              size="mini"
              type="text"
              v-show="form.consignee.name"
            >
              Add Party Details
            </el-button>
          </div>
        </div>
      </div>
      <template>
        <div class="intereste-item">
          <div class="title-box">
            <div class="title">Notify Party</div>
            <div class="btn-box">
              <el-button
                @click="clearData('notifyParty')"
                icon="el-icon-close"
                size="mini"
                type="text"
                v-show="form.notifyParty.name"
              >
                Clear
              </el-button>
              <!-- <el-button type="primary">我的合作伙伴</el-button> -->
            </div>
          </div>
          <div class="cnt-box">
            <el-input
              placeholder="Enter Name..."
              show-word-limit
              size="mini"
              type="textarea"
              spellcheck="false"
              v-model="form.notifyParty.name"
              :autosize="{ minRows: 0, maxRows: 2 }"
              resize="none"
              @blur="handleTextarea('notifyParty', 'name')"
              :class="{ 'is-exceed': notifyPartynameError }"
            ></el-input>
            <div class="btn-box2">
              <p class="error-tips" v-show="notifyPartynameError">
                This field can accept only 2 lines of 35 characters
              </p>
              <el-button
                @click="showDialog('notifyParty')"
                size="mini"
                type="text"
                v-show="form.notifyParty.name"
              >
                Add Party Details
              </el-button>
            </div>
          </div>
        </div>
        <div class="intereste-item">
          <div class="title-box">
            <div class="title">Notify Party 1</div>
            <div class="btn-box">
              <el-button
                @click="clearData('notifyParty2')"
                icon="el-icon-close"
                size="mini"
                type="text"
                v-show="form.notifyParty2.name"
              >
                Clear
              </el-button>
              <!-- <el-button type="primary">我的合作伙伴</el-button> -->
            </div>
          </div>
          <div class="cnt-box">
            <el-input
              placeholder="Enter Name..."
              show-word-limit
              size="mini"
              type="textarea"
              spellcheck="false"
              v-model="form.notifyParty2.name"
              :autosize="{ minRows: 0, maxRows: 2 }"
              resize="none"
              @blur="handleTextarea('notifyParty2', 'name')"
              :class="{ 'is-exceed': notifyParty2nameError }"
            ></el-input>
            <div class="btn-box2">
              <p class="error-tips" v-show="notifyParty2nameError">
                This field can accept only 2 lines of 35 characters
              </p>
              <el-button
                @click="showDialog('notifyParty2')"
                size="mini"
                type="text"
                v-show="form.notifyParty2.name"
              >
                Add Party Details
              </el-button>
            </div>
          </div>
        </div>
      </template>
    </div>
    <InterestedDialog
      :dialogOptions="dialogOptions"
      @cancle="closeDialog"
      @submit="submitDialog"
      v-if="dialogOptions.show"
      :replaceChinese="replaceChinese"
    />
  </div>
</template>

<script>
import InterestedDialog from '../components/interestedDialog'
import { booker } from '@/api/order/createBooking'
export default {
  props: {
    interestedOption: {
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
    InterestedDialog,
  },
  data() {
    return {
      form: {
        shipper: {
          address: '',
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
          companyId: '',
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
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
        },
        shipFrom: {
          address: '',
          companyId: '',
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
          companyId: '',
          contact: {
            email: '',
            name: '',
            telPhone: '',
            fax: '',
          },
          name: '',
        },
      },
      bookerData: {},
      disshipper: false,
      disforwarder: false,
      disconsignee: false,
      disshipFrom: false,
      showMore: true,
      dialogOptions: {
        show: false,
        type: '',
        form: {},
      },
      shippernameError: false,
      consigneenameError: false,
      forwardernameError: false,
      notifyPartynameError: false,
      notifyParty2nameError: false,
      notifyParty3nameError: false,
      shipTonameError: false,
      shipFromnameError: false,
      isCheck: false,
    }
  },
  created() {
    this.form = this.interestedOption
    // this.getBooker()
  },
  methods: {
    // 改变船公司
    changeCarrier(companyId, carrierSource) {
      if (companyId) {
        this.getBooker(companyId, carrierSource)
      }
    },
    // textarea格式化
    handleTextarea(type, key = 'name', num = 35, line = 2) {
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
    // 获取货代信息
    getBooker(companyId,carrierSource) {
      const data = {
        companyId,
        carrierSource
      }
      booker(data)
        .then((res) => {
          if (res.code === 0) {
            this.bookerData = res.data || {}
            this.copyBooker('forwarder')
            if (this.disshipper) {
              this.copyBooker('shipper')
            }
            if (this.disconsignee) {
              this.copyBooker('consignee')
            }
            if (this.disshipFrom) {
              this.copyBooker('shipFrom')
            }
          }
        })
        .catch(() => {})
    },
    // 复制货代信息
    copyBooker(type) {
      if (!this.bookerData.name) {
        return this.$msgErrClose('Please select carrier first')
      }
      this.form[type] = Object.assign({}, this.bookerData)
      this['dis' + type] = true
      this.handleTextarea(type, 'name')
      this.handleTextarea(type, 'address', 35, 5)
    },
    // Clear信息
    clearData(type) {
      const reset = {
        shipper: {
          address: '',
          code: '',
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
      this.handleTextarea(type, 'name')
    },
    // 显示弹窗
    showDialog(type) {
      if (type) {
        this.dialogOptions.type = type
        const data = this.form[type]
        const { address, contact } = data
        this.dialogOptions.form = {
          address,
          contact: { ...contact },
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
    // 校验数据
    validateForm() {
      let flag = null
      const { shipper, forwarder } = this.form
      if (!shipper.name || !forwarder.name) {
        flag = false
      } else {
        flag = true
      }
      return flag
    },
    // 初始化数据
    initData() {
      // 格式化数据
      this.form.consignee.name.length && this.handleTextarea('consignee')
      this.form.notifyParty.name.length && this.handleTextarea('notifyParty')
      this.form.notifyParty2.name.length && this.handleTextarea('notifyParty2')
      this.form.notifyParty3.name.length && this.handleTextarea('notifyParty3')
      this.isCheck = true
    },
  },
}
</script>

<style lang="scss" scoped>
.intereste-cnt {
  padding: 8px 8px 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  .intereste-item {
    width: 45%;
    .title-box {
      display: flex;
      align-items: center;
      .title {
        flex: 1;
        height: 30px;
        line-height: 30px;
      }
      .btn-box {
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
    .cnt-box {
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
  }
  &::after {
    content: '';
    width: 30%;
  }
}
.showmore {
  margin: 10px;
  color: #277ab5;
  cursor: pointer;
}
</style>
