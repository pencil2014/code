<template>
  <div>
    <el-dialog :title="this.$t('PayApplyList.sendBankSlip')" :visible.sync="tableData.show" width="80%">
      <div>
        <el-button type="primary" size="mini" @click="showContact">{{this.$t('Settle.batchModifyContact')}}</el-button>
        <FinanceTableMass :option="option1" @send-multi="sendMulti" />
      </div>
      <div slot="footer">
        <el-button type="primary" @click="submit" size="mini" :loading="loading">{{
          !loading ? this.$t('Settle.send') : this.$t('Settle.sending')
        }}</el-button>
        <el-button @click="cancel" size="mini">{{$t('Common.cancel')}}</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="this.$t('Settle.batchModifyContact')" :visible.sync="dialogVisible" width="80%">
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        size="mini"
        label-width="118px"
        class="change-cnt"
      >
        <el-form-item :label="this.$t('Settle.contact')" prop="name">
          <el-select
            v-model="form.name"
            multiple
            filterable
            clearable
            remote
            collapse-tags
            :remote-method="searchQuery"
            @change="changeName"
            :placeholder="this.$t('Common.plSelect')"
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
        <el-form-item :label="this.$t('Settle.contactEamil')" prop="email">
          <el-input v-model="form.email" clearable :placeholder="this.$t('Common.plEnter')"></el-input>
          <p class="tips">{{this.$t('Common.multiComma')}}</p>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="changeCnt" size="mini">{{this.$t('Common.modify')}}</el-button>
        <el-button @click="cancelCnt" size="mini">{{$t('Common.cancel')}}</el-button>
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
          label: this.$t('Settle.payOrderNo'),
          type: 'text',
        },
        {
          prop: 'applyAmt',
          label: this.$t('Settle.applyPayAmt'),
          type: 'text',
        },
        {
          prop: 'realPayAmt',
          label: this.$t('PayApplyList.realPayAmt'),
          type: 'text',
        },
        {
          prop: 'settleCorpName',
          label: this.$t('FeeList.settleCorp'),
          type: 'text',
        },
        {
          prop: 'bankseqFileNo',
          label: this.$t('Settle.bankseqFileNo'),
          type: 'button',
          operationBtns: {
            show: true,
            data: [
              {
                label: this.$t('Common.view'),
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
          label: this.$t('Settle.composeBankseqFileNo'),
          type: 'button',
          operationBtns: {
            show: true,
            data: [
              {
                label: this.$t('Common.view'),
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
          label: this.$t('Settle.contact'),
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
          label: this.$t('Settle.contactEamil'),
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
        return this.$msgErrClose(this.$t('Settle.selectRow'))
      }
      this.dialogVisible = true
    },
    changeCnt() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          let { name, email } = this.form
          email = email.replace(/[\s+,+，+]+/g, ',') //支持中文,号
          let reg = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/
          let sta = email.split(',').some((item) => !reg.test(item))
          if (sta) {
            return this.$msgErrClose(this.$t('Settle.emailErr'))
          }
          this.multipleSelection1.forEach((item) => {
            item.name = [...name]
            item.email = email
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
        return this.$msgErrClose(this.$t('Settle.emailRequired'))
      }
      let reg = /^([a-zA-Z]|[0-9])+\.?(\w|\-|\.)+@([a-zA-Z0-9]|\-)+\.([a-zA-Z]{2,4})$/ // /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/
      let sta2 = this.option1.data.some((item) =>
        item.email.split(',').some((ele) => !reg.test(ele))
      )
      if (sta2) {
        return this.$msgErrClose(this.$t('Settle.emailHasErr'))
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
          this.$msgSucClose(this.$t('Common.sendSuccess'))
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
