<template>
  <el-dialog
    :before-close="cancle"
    :visible.sync="dialogOptions.show"
    class="general-dialog"
    size="mini"
    title="Details"
    width="800px"
  >
    <el-form
      :inline="true"
      :model="form"
      :rules="rules"
      class="form"
      label-position="top"
      ref="form"
    >
      <div class="cnt-left">
        <el-form-item
          class="middle-item"
          label="Street (35 X 2 lines)"
          prop="street"
        >
          <el-input
            placeholder="Enter Street..."
            show-word-limit
            size="mini"
            type="textarea"
            v-model="form.street"
            @blur="handleTextarea('street')"
            autosize
            :class="{ 'is-exceed': isError }"
          ></el-input>
          <p class="error-tips" v-show="isError">
            This field can accept only 2 lines of 35 characters
          </p>
        </el-form-item>
        <el-form-item class="middle-item" label="City" prop="city">
          <el-input
            placeholder="Enter City..."
            size="mini"
            v-model="form.city"
          ></el-input>
        </el-form-item>
        <el-form-item class="spec-item" label="State/ Province" prop="province">
          <el-input
            placeholder="Enter Province..."
            size="mini"
            v-model="form.province"
          ></el-input>
        </el-form-item>
        <el-form-item class="spec-item" label="Country" prop="country">
          <el-select
            :remote-method="getCountryList"
            class="large-select"
            filterable
            clearable
            placeholder="Select One"
            remote
            size="mini"
            v-model="form.country"
          >
            <el-option
              :key="item.countryCode"
              :label="`${item.ename}(${item.countryCode})`"
              :value="item.countryCode"
              v-for="item in countryList"
            ></el-option>
          </el-select>
        </el-form-item>
      </div>
      <div class="cnt-right">
        <el-form-item class="middle-item" label="Contact Name" prop="name">
          <el-input
            placeholder="Enter Name..."
            size="mini"
            v-model="form.contact.name"
          ></el-input>
        </el-form-item>
        <el-form-item class="middle-item" label="Phone" prop="telPhone">
          <el-input
            placeholder="Enter Number..."
            size="mini"
            v-model="form.contact.telPhone"
          ></el-input>
        </el-form-item>
        <el-form-item class="middle-item" label="Email" prop="email">
          <el-input
            placeholder="Enter Email..."
            size="mini"
            v-model="form.contact.email"
          ></el-input>
        </el-form-item>
        <el-form-item class="middle-item" label="Fax" prop="fax">
          <el-input
            placeholder="Enter Fax..."
            size="mini"
            v-model="form.contact.fax"
          ></el-input>
        </el-form-item>
      </div>
    </el-form>
    <div slot="footer">
      <el-button @click="cancle" size="mini">Cancle</el-button>
      <el-button @click="submit" size="mini" type="primary">Save</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { countrySelectList } from '@/api/base'
export default {
  props: {
    dialogOptions: {
      type: Object,
      default: () => {},
    },
    replaceChinese: {
      required: true,
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      form: {
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
      rules: {},
      countryList: [],
      isError: false,
      isCheck: false,
    }
  },
  created() {
    this.form = this.dialogOptions.form
    this.isCheck = true //开启汉字检测
  },
  methods: {
    // textarea格式化
    handleTextarea(type, num = 35, line = 2) {
      let res = []
      // let reg = new RegExp ("(.{"+num+"})","g")
      const source = this.replaceChinese(this.form[type])
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
      this.isError = res.length > line
      this.form.street = res.join('\n')
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
          this.isError = true
          let text = `The number of characters in lines ${lengthIndex.join(
            ','
          )} exceeds ${num}  please check`
          this.$msgErrClose(text)
        }
      }
    },
    getCountryList(str = '') {
      const data = {
        countryCode: str,
        state: 'valid',
      }
      countrySelectList(data)
        .then((res) => {
          if (res.code === 0) {
            this.countryList = res.data || []
          }
        })
        .catch(() => {})
    },
    cancle() {
      this.$emit('cancle')
    },
    submit() {
      if (this.isError) {
        return this.$msgErrClose('The Street format is incorrect')
      }
      const { email } = this.form.contact
      const reg =
        /^\w+((.\w+)*|(-\w+)*)@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/
      if (email && !reg.test(email)) {
        return this.$msgErrClose('Mailbox format error')
      }
      const data = Object.assign({}, this.form)
      this.$emit('submit', data)
    },
  },
}
</script>

<style lang="scss">
.general-cnt {
  .form {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    .cnt-left,
    .cnt-right {
      flex-basis: 45%;
      display: flex;
      flex-direction: column;
    }
  }
  .error-tips {
    color: red;
    flex: 1;
    margin-right: 10px;
    font-size: 12px;
  }
}
</style>
