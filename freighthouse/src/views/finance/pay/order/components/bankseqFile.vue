<template>
  <div>
    <el-dialog title="发送水单" :visible.sync="tableData.show" width="80%">
      <div>
        <el-button type="primary" size="mini" @click="showContact">批量修改收件人</el-button>
        <FinanceTableMass :option="option1" @send-multi="sendMulti" />
      </div>
      <div slot="footer">
        <el-button type="primary" @click="submit" size="mini" :loading="loading">{{
          !loading ? '发 送' : '发送中...'
        }}</el-button>
        <el-button @click="cancel" size="mini">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog title="批量修改收件人" :visible.sync="dialogVisible" width="80%">
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        size="mini"
        label-width="80px"
        class="change-cnt"
      >
        <el-form-item label="联系人" prop="name">
          <el-select
            v-model="form.name"
            multiple
            filterable
            clearable
            remote
            collapse-tags
            :remote-method="searchQuery"
            @change="changeName"
            placeholder="请搜索选择"
          >
            <el-option
              v-for="(item, index) in employeelist"
              :key="item.value + index"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="联系人邮箱" prop="email">
          <el-input v-model="form.email" clearable placeholder="请输入邮箱"></el-input>
          <p class="tips">请输入联系人邮箱，多个邮箱用英文逗号分隔</p>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="changeCnt" size="mini">修 改</el-button>
        <el-button @click="cancelCnt" size="mini">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { employeeSelectlist } from '@/api/companyResource'
import { sendPayBankseqFile } from '@/api/fin/pay.js'
export default {
  props: {
    tableData: {
      type: Object,
      default: () => {},
    },
  },
  mixins: [mixin],
  components: {
    FinanceTableMass,
  },
  data() {
    return {
      loading: false,
      option1: {},
      multipleSelection1: [],
      dialogVisible: false,
      form: {
        name: [],
        email: '',
      },
      rules: {
        // name: { required: true, message: ' ', trigger: 'blur' },
        email: { required: true, message: ' ', trigger: 'blur' },
      },
      employeelist: [],
    }
  },
  created() {
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      edit: true,
      data: [],
      columns: [
        {
          prop: 'payOrderNo',
          label: '付款单号',
          type: 'text',
        },
        {
          prop: 'applyAmt',
          label: '付款金额',
          type: 'text',
        },
        {
          prop: 'realPayAmt',
          label: '实际付款金额',
          type: 'text',
        },
        {
          prop: 'settleCorpName',
          label: '结算单位',
          type: 'text',
        },
        {
          prop: 'bankseqFileNo',
          label: '水单附件',
          type: 'button',
          operationBtns: {
            show: true,
            data: [
              {
                label: '查看附件',
                action: 'Info',
              },
            ],
            callback: (action, $index, row, item) => {
              if (action === 'Info') {
                this.bankseqFile(row.bankseqFileNo)
              }
            },
          },
        },
        {
          prop: 'composeBankseqFileNo',
          label: '系统生成水单',
          type: 'button',
          operationBtns: {
            show: true,
            data: [
              {
                label: '查看附件',
                action: 'Info',
              },
            ],
            callback: (action, $index, row, item) => {
              if (action === 'Info') {
                this.bankseqFile(row.composeBankseqFileNo)
              }
            },
          },
        },
        {
          prop: 'name',
          label: '联系人',
          type: 'select',
          width: '200px',
          remote: true,
          multiple: true,
          clearable: true,
          remoteMethod: (queryString = ' ', item, row) => {
            this.searchQuery(queryString, item, row)
          },
          visibleChange: (queryString, item, row) => {
            this.searchQuery(' ', item, row)
          },
          change: (value, item, row, option) => {
            let emails = value
              .map((ele) => {
                let reg = /(?<=\()(.+?)(?=\))/g
                let res = ele.match(reg)
                return res ? res[res.length -1] : ele
              })
              .filter((op) => !row.email.includes(op))
            let str = emails.join(',')
            row.email = row.email ? `${row.email}${emails.length ? `,${str}` : str}` : str
          },
          remoteSelectList: [],
        },
        {
          prop: 'email',
          label: '联系人邮箱',
          type: 'input',
          width: '200px',
        },
      ],
      tips: false,
      operationBtns: false,
      pagination: false,
    })
    this.option1.data = this.tableData.data.map((item) => {
      let contactInfoVoList = item.contactInfoVoList
      let name = contactInfoVoList.map((item) => {
        let { name, email } = item
        let val = name ? `${name}(${email})` : `${email}`
        return val
      })
      let email = contactInfoVoList.map((item) => item.email).join(',')
      return { ...item, name, email, edit: true }
    })
  },
  methods: {
    changeName(value) {
      let emails = value
        .map((ele) => {
          let reg = /(?<=\()(.+?)(?=\))/g
          let res = ele.match(reg)
          return res ? res[res.length -1] : ele
        })
        .filter((op) => !this.form.email.includes(op))
      let str = emails.join(',')
      this.form.email = this.form.email ? `${this.form.email}${emails.length ? `,${str}` : str}` : str
    },
    bankseqFile(fileNo) {
      const href = `/base/fileView/preview/${fileNo}/sowoll`
      window.open(href, '_blank')
    },
    searchQuery(queryString, item, row) {
      if (!queryString) {
        return
      }
      let data = {
        state: 'valid',
        name: queryString,
      }
      employeeSelectlist(data).then((res) => {
        let source = res.data.map((item) => {
          let { cname, email } = item
          let val = cname ? `${cname}(${email})` : `${email}`
          return {
            label: val,
            value: val,
            email,
          }
        })
        if (item) {
          item.remoteSelectList = source
        } else {
          this.employeelist = source
        }
      })
    },
    showContact() {
      let len = this.multipleSelection1.length
      if (len < 1) {
        return this.$msgErrClose('请先选择需要修改的数据！')
      }
      this.dialogVisible = true
    },
    changeCnt() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          let { name, email } = this.form
          email = email.replace(/[\s+,+，+]+/g, ',') //支持中文,号
          let reg = /^([\w\d_\.-]+)@([\w\d\.-]+)\.([\w\.]{2,6})$/
          let sta = email.split(',').some((item) => !reg.test(item))
          if (sta) {
            return this.$msgErrClose('联系人邮箱格式不正确，请重新输入！')
          }
          this.multipleSelection1.forEach((item) => {
            item.name = [...name]
            item.email = email.toLowerCase()
          })
          this.cancelCnt()
        } else {
          return false
        }
      })
    },
    cancelCnt() {
      this.dialogVisible = false
    },
    sendMulti(data) {
      this.multipleSelection1 = data
    },
    cancel() {
      this.$emit('cancel')
    },
    submit() {
      let sta = this.option1.data.some((item) => !item.email)
      if (sta) {
        return this.$msgErrClose('联系人邮箱为必填，请检查！')
      }
      let reg = /^([a-zA-Z]|[0-9])+\.?(\w|\-|\.)+@([a-zA-Z0-9]|\-)+\.([a-zA-Z]{2,4})$/ // /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/
      let sta2 = this.option1.data.some((item) =>
        item.email.split(',').some((ele) => !reg.test(ele))
      )
      if (sta2) {
        return this.$msgErrClose('数据中存在联系人邮箱格式不正确的项，请检查！')
      }
      this.loading = true
      let data = this.option1.data.map((item) => {
        let { payOrderNo, email, name } = item
        name = name.map(ele => {
          return ele.includes('(') ? ele.split('(')[0] : ele
        })
        email = email.split(',')
        return {
          payOrderNo,
          contactInfoVoList: email.map((ele, index) => {
            return {
              name: (name[index] ? name[index] : name[0]) || '',
              email: ele,
            }
          }),
        }
      })
      sendPayBankseqFile(data)
        .then((res) => {
          this.$msgSucClose('发送水单成功！')
          this.cancel()
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
}
</script>

<style lang="scss">
.change-cnt {
  .el-select.el-select--mini {
    width: 100%;
  }
  .tips {
    color: #999;
    padding-top: 2px;
  }
}
</style>
