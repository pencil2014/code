<template>
  <div class="contract-add">
    <div class="top-box">
      <div class="title">新增信控信息</div>
      <div class="but-box">
        <el-button-group>
          <el-button @click="submit" size="mini" type="primary">保存</el-button>
        </el-button-group>
        <el-button-group>
          <el-button @click="cancle" size="mini">返回</el-button>
        </el-button-group>
      </div>
    </div>
    <div class="add-form">
      <el-form
        :inline="true"
        :model="form"
        :rules="rules"
        class="settle-form"
        label-width="110px"
        ref="form"
        size="mini"
      >
        <el-form-item
          label="合同编号:"
          prop="contractNo"
        >
          <el-select
            @change="changeContractNo"
            class="contract-select"
            placeholder="请选择"
            size="mini"
            v-model="form.contractNo"
            value-key="contractId"
            :disabled="disableContractNo"
          >
            <el-option
              :key="item.value"
              :label="item.contractNo"
              :value="item"
              v-for="item in contractNoList"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="业务类型:" prop="creditAccountBusinessList">
          <el-select
            collapse-tags
            multiple
            placeholder="请选择"
            size="mini"
            v-model="form.creditAccountBusinessList"
          >
            <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in baseBusinessTypeList"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="共享公司:" prop="creditAccountRelCustList" class="relcust">
          <el-select
            class="custlist"
            collapse-tags
            filterable
            multiple
            placeholder="请选择"
            size="mini"
            v-model="form.creditAccountRelCustList"
            value-key="custid"
          >
            <el-option
              :key="item.value"
              :label="item.label"
              :value="item"
              v-for="item in relationList"
              :disabled="item.custid === custid"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="使用场景:" prop="deductionScene">
          <el-select
            placeholder="请选择"
            size="mini"
            v-model="form.deductionScene"
          >
            <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in dictMap['recvPayStatType']"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="币种:" prop="currency">
          <el-select
            placeholder="请选择币种"
            size="mini"
            v-model="form.currency"
          >
            <el-option
              :key="item.value"
              :label="item.label"
              :value="item.value"
              v-for="item in currencyList"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="我司分公司:" prop="creditAccountCompanyList">
          <el-select
            class="custlist"
            collapse-tags
            filterable
            multiple
            placeholder="请选择"
            size="mini"
            v-model="form.creditAccountCompanyList"
            @change="changeSettleCompanyList"
          >
            <el-option
              :disabled="item.disabled"
              :key="item.companyCode"
              :label="item.companyName"
              :value="item.companyCode"
              v-for="item in settleCompanyList"
            ></el-option>
          </el-select>
        </el-form-item>
        <div class="flex-item">
          <el-form-item label="合同额度:" prop="creditQuota">
          <el-input v-model="form.creditQuota"></el-input>
        </el-form-item>
        <el-form-item
          prop=""
          label="合同额度有效期:"
          :required="true"
          style="width:60%"
        >
          <el-date-picker
            class="contract-date"
            clearable
            placeholder="请选择"
            size="mini"
            type="daterange"
            v-model="form.cqDate"
            value-format="yyyy-MM-dd"
            v-show="!form.isCqDate"
            :picker-options="pickerOptions"
            disabled
          ></el-date-picker>
          <el-date-picker
            class="contract-date"
            placeholder="请选择开始时间"
            type="date"
            v-model="form.cqStartDate"
            v-show="form.isCqDate"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            disabled
          ></el-date-picker>
          <el-checkbox
            label="长期有效"
            style="margin-left: 5px;"
            v-model="form.isCqDate"
            disabled
          ></el-checkbox>
        </el-form-item>
        </div>
        <div class="flex-item">
          <el-form-item label="内部额度:" prop="innerQuota">
          <el-input v-model="form.innerQuota"></el-input>
        </el-form-item>
        <el-form-item
          prop=""
          label="内部额度有效期:"
          :required="true"
          style="width:60%"
        >
          <el-date-picker
            class="contract-date"
            clearable
            placeholder="请选择"
            size="mini"
            type="daterange"
            v-model="form.iqDate"
            value-format="yyyy-MM-dd"
            v-show="!form.isIqDate"
            :picker-options="pickerOptions"
          ></el-date-picker>
          <el-date-picker
            class="contract-date"
            placeholder="请选择开始时间"
            type="date"
            v-model="form.iqStartDate"
            v-show="form.isIqDate"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
          ></el-date-picker>
          <el-checkbox
            label="长期有效"
            style="margin-left: 5px;"
            v-model="form.isIqDate"
          ></el-checkbox>
        </el-form-item>
        <el-form-item label="归属人:" prop="belongEmployeeName">
          <el-select
            placeholder="请选择"
            size="mini"
            v-model="form.belongEmployeeName"
          >
            <el-option
              :key="item.bdEmployeeId"
              :label="item.bdEmployeeName"
              :value="item.bdEmployeeName"
              v-for="item in OPEmployeeList"
            ></el-option>
          </el-select>
        </el-form-item>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import {companyPageList } from '@/api/base'
import {contractList,contractDetail,relation} from '@/api/crm/control'
export default {
  mixins: [mixin, routerMixin],
  props: {
    dataSource: {
      type: Object,
      default: () => {}
    },
    custid: {
      type: [String, Number],
      default: ''
    },
    OPEmployeeList: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      form: {
        contractNo: '',
        creditAccountBusinessList: [],
        creditAccountCompanyList: [],
        creditAccountRelCustList: [],
        deductionScene: '',
        currency:'',
        innerQuota:'',
        creditQuota: '',
        iqDate: [],
        cqDate:[],
        iqStartDate: '',
        cqStartDate: '',
        isCqDate: false,
        isIqDate: false,
        custName: '',
        belongEmployeeName:''
      },
      rules: {
        contractNo: {
          required: true,
          message: '合同编号必选',
          trigger: 'change',
        },
        creditAccountBusinessList: {
          required: true,
          message: '业务类型必选',
          trigger: 'change',
        },
        creditAccountCompanyList: {
          required: true,
          message: '我司分公司必选',
          trigger: 'change',
        },
        deductionScene: {
          required: true,
          message: '使用场景必选',
          trigger: 'change',
        },
        creditAccountRelCustList: {
          required: true,
          message: '共享公司必选',
          trigger: 'change',
        },
        currency: {
          required: true,
          message: '币种必选',
          trigger: 'change',
        },
        creditQuota: {
          required: true,
          message: '合同额度必填',
          trigger: 'change',
        },
        innerQuota: {
          required: true,
          message: '累不额度必填',
          trigger: 'change',
        },
        belongEmployeeName: {
          required: true,
          message: '归属人必填',
          trigger: 'change'
        }
      },
      currencyList: [
        {
          label: 'CNY',
          value: 'CNY'
        },
        {
          label: 'USD',
          value: 'USD'
        }
      ],
      settleCompanyList: [],
      relationList: [],
      contractNoList: [],
      baseBusinessTypeList: [],
      pickerOptions: {
        disabledDate: (time) => {
        }
      },
      disableContractNo: false
    }
  },
  computed: {
    ...mapGetters(['dictMap', 'dictMapObj']),
  },
  created() {
    this.custName = this.$route.query.name
    // this.getCompanyList()
    // this.getRelation()
    this.getContractNoList()
  },
  methods: {
    // 改变我司分公司
    changeSettleCompanyList(val) {
      if (val.includes('000000')) {
        this.form.creditAccountCompanyList = ['000000']
        this.settleCompanyList.forEach((item) => {
          if (item.companyCode !== '000000') {
            item.disabled = true
          }
        })
      } else {
        this.settleCompanyList.forEach((item) => {
          item.disabled = false
        })
      }
    },
    // 获取分公司
    getCompanyList() {
      const data = {
        currPage: 1,
        pageSize: 1000,
        query: [
          {
            column: 'state',
            type: 'eq',
            value: 'valid'
          },
          {
            column: 'selfSettle',
            type: 'eq',
            value: 'yes'
          }
        ]
      }
      companyPageList(data).then((res) => {
        this.settleCompanyList = res.data.list.map((item) =>
          Object.assign({}, item, { disabled: false })
        )
        this.settleCompanyList.unshift({
          companyCode: '000000',
          companyName: '所有分公司',
          companyId: 0,
          disabled: false
        })
      })
    },
     // 关联公司下拉
    getRelation() {
      const data = {
        custid: this.custid
      }
      relation(data)
        .then(res => {
          this.relationList = res.data.map(item => {
            // 新增时把自己选中
            if (item.custid === this.custid) {
              if (!this.dataSource.creditAccountId) {
                this.form.creditAccountRelCustList.push({
                  ...item,
                  label: item.name,
                  value: item.custid
                })
              }
            }
            return {
              ...item,
              label: item.name,
              value: item.custid
            }
          })
        })
        .catch(() => {})
    },
    // 获取编号
    getContractNoList() {
      const data = {
        currPage: 1,
        pageSize: 100,
        custid: this.custid,
        status: 'effect'
      }
      contractList(data).then(res => {
        if (res.code === 0) {
          this.contractNoList = res.data.list.map(item => {
            let {contractNo, contractId, contractInfoNo} = item
            return {
              contractNo,
              contractId,
              contractInfoNo
            }
          })
        }
      }).catch(()=>{})
    },
    // 合同详情
    changeContractNo(row) {
      let {contractId} = row
      let data = {
        contractId,
        custid: this.custid,
      }
      contractDetail(data).then(res => {
        if (res.code === 0) {
          let {contractBusinessTypeList,contractRelCustList,contractCompanyList,effectEndDate,effectStartDate}= res.data
          let businessTypeList = contractBusinessTypeList.map(item => item.businessType)
          let companyListCode = contractCompanyList.map(item => item.companyCode)
          this.baseBusinessTypeList = this.dictMap['baseBusinessType'].filter(item => businessTypeList.includes(item.value)) //业务类型下拉
          this.relationList = contractRelCustList.map(item => {
            let {relCustName,relCustid} = item
            return {
              name: relCustName,
              custid: relCustid,
              label: relCustName,
              value: relCustid
            }
          })
          if (companyListCode.includes('000000')) {
              this.getCompanyList()
            } else {
              this.settleCompanyList = contractCompanyList
            }
          if (!this.dataSource.creditAccountId) {
            this.form.creditAccountBusinessList = businessTypeList
            this.form.creditAccountRelCustList = contractRelCustList.map(item => {
              let {relCustName,relCustid} = item
              return {
                name: relCustName,
                custid: relCustid,
                label: relCustName,
                value: relCustid
              }
            })
            this.form.creditAccountCompanyList = companyListCode
            if (effectEndDate === '9999-12-31') {
              this.form.isCqDate = this.form.isIqDate = true
              this.form.iqStartDate = this.form.cqStartDate = effectStartDate
            } else {
              this.form.iqDate = [effectStartDate, effectEndDate]
              this.form.cqDate = [effectStartDate, effectEndDate]
            }
          }
          this.pickerOptions.disabledDate = (time) => {
            let start = new Date(effectStartDate).getTime() - 86400000
            let end = new Date(effectEndDate).getTime()
            return time.getTime() < start || time.getTime() > end
          }
        }
      }).catch(()=>{})
    },
    // 返回
    cancle() {
      this.$emit('cancle')
    },
    // 提交
    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const { innerQuota, creditQuota, iqDate, cqDate, isCqDate, isIqDate, iqStartDate, cqStartDate } = this.form
          const reg =/^[1-9][0-9]*([\.][0-9]{1,2})?$/
          if (!reg.test(innerQuota)) {
            return this.$msgErrClose('内部额度只能填写数字')
          }
          if (!reg.test(creditQuota)) {
            return this.$msgErrClose('合同额度只能填写数字')
          }
          if (isIqDate && !iqStartDate) {
            return this.$msgErrClose('内部额度有效期开始时间必填')
          }
          if (!iqDate.length && !isIqDate) {
            return this.$msgErrClose('内部额度有效期必填')
          }
          if (isCqDate && !cqStartDate) {
            return this.$msgErrClose('合同额度有效期开始时间必填')
          }
          if (!cqDate.length && !isCqDate) {
            return this.$msgErrClose('合同额度有效期必填')
          }
          // if (Number(innerQuota) < Number(creditQuota)) {
          //   return this.$msgErrClose('内部额度不能小于合同额度')
          // }//不限制了
          this.submitFn()
        }else{
          return this.$msgErrClose('请将必填项填写完整！')
        }
      })
    },
    // 组装数据
    submitFn() {
      let {
        contractNo:contractData,
        creditAccountBusinessList,
        creditAccountCompanyList,
        creditAccountRelCustList,
        deductionScene,
        currency,
        innerQuota,
        creditQuota,
        iqDate,
        cqDate,
        isCqDate,
        isIqDate,
        iqStartDate,
        cqStartDate,
        belongEmployeeName
      } = this.form
      let { contractId, contractNo, contractInfoNo } = contractData
      const creditAccountBusinessListMap = creditAccountBusinessList.map((item) => {
        return {
          businessType: item,
          custid: this.custid,
          contractId
        }
      })
      const creditAccountCompanyListMap = creditAccountCompanyList.map((item) => {
        const source = this.settleCompanyList.filter(
          (ele) => ele.companyCode === item
        )[0]
        const { companyCode, companyName, companyId } = source
        return {
          companyCode,
          companyName,
          companyId
        }
      })
      const creditAccountRelCustListMap = creditAccountRelCustList.map(item => {
        return {
          custid: this.custid,
          custName: this.custName,
          relCustid: item.custid,
          relCustName: item.custName || item.name
        }
      })
      let cqEndDate = isCqDate ? '9999-12-31' : cqDate[1]
      let cqStartDate2 = isCqDate ? cqStartDate : cqDate[0]
      let iqEndDate = isIqDate ? '9999-12-31' : iqDate[1]
      let iqStartDate2 = isIqDate ? iqStartDate : iqDate[0]
      let bdEmployee = this.OPEmployeeList.find(item=>item.bdEmployeeName===belongEmployeeName)
      const data = {
        custid: this.custid,
        contractId,
        contractNo,
        contractInfoNo,
        cqEndDate,
        cqStartDate: cqStartDate2,
        iqEndDate,
        iqStartDate: iqStartDate2,
        creditAccountBusinessList: creditAccountBusinessListMap,
        creditAccountCompanyList: creditAccountCompanyListMap,
        creditAccountRelCustList: creditAccountRelCustListMap,
        deductionScene,
        currency,
        innerQuota,
        creditQuota,
        belongEmployeeName,
        belongEmployeeId:bdEmployee.bdEmployeeId,
        belongDeptCode:bdEmployee.bdDeptCode
      }
      this.$emit('submit', data)
    },
  },
  mounted() {
    // 复制信控信息
    if (this.dataSource.creditAccountId) {
      const { creditAccountBusinessList,creditAccountCompanyList, creditAccountRelCustList, cqEndDate, iqEndDate,cqStartDate,iqStartDate,contractNo,contractId} = this.dataSource
      let creditAccountBusinessListMap = creditAccountBusinessList.map(item => item.businessType)
      let creditAccountCompanyListMap = creditAccountCompanyList.map(item => item.companyCode)
      let creditAccountRelCustListMap = creditAccountRelCustList.map(item => {
        let {relCustName, relCustid} = item
        return {
          custid: relCustid,
          name: relCustName,
          label: relCustName,
          value: relCustid
        }
      })
      const isCqDate = cqEndDate === '9999-12-31'
      const isIqDate = iqEndDate === '9999-12-31'
      let cqDate = []
      if (!isCqDate) {
        cqDate = [cqStartDate, cqEndDate]
      }
      let iqDate = []
      if (!isIqDate) {
        iqDate = [iqStartDate, iqEndDate]
      }
      this.form = Object.assign({}, this.form, this.dataSource, {
        creditAccountBusinessList: creditAccountBusinessListMap,
        creditAccountCompanyList: creditAccountCompanyListMap,
        creditAccountRelCustList: creditAccountRelCustListMap,
        isCqDate,
        isIqDate,
        cqDate,
        iqDate,
        contractNo: {
          contractNo,
          contractId
        }
      })
      this.changeContractNo(this.form.contractNo)
      this.disableContractNo = true
    }
  },
}
</script>

<style lang="scss" scoped>
.top-box,
.title-box {
  display: flex;
  margin: 8px;
  .title {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
  }
}
/deep/ .el-form-item{
  margin-bottom: 20px !important;
}
/deep/ .el-form-item--mini .el-form-item__content,
.el-form-item--mini .el-form-item__label {
  font-size: 12px;
  .el-select .el-select--mini,
  .el-input--mini .el-input__inner,
  .el-range-editor--mini.el-input__inner {
    height: 20px;
    width: 220px;
    overflow: hidden;
  }
}
.small-select {
  width: 90px;
  overflow: hidden;
  /deep/.el-input__inner {
    width: 90px !important;
  }
}
.inline-flex {
  /deep/ .el-form-item__content {
    display: inline-flex;
    align-items: center;
  }
}
.small-select2 {
  width: 130px;
  overflow: hidden;
  /deep/.el-input__inner {
    width: 130px !important;
  }
}
.small-select3 {
  width: 110px;
  overflow: hidden;
  /deep/.el-input__inner {
    width: 110px !important;
  }
}
.small-select4 {
  width: 80px;
  overflow: hidden;
  /deep/.el-input__inner {
    width: 80px !important;
  }
}
.fee-period {
  display: inline-flex;
  align-items: center;
  /deep/ .el-form-item__content {
    display: flex;
    align-items: center;
  }
}
.el-form {
  width: 100%;
  .el-form-item {
    width: 30%;
  }
  /deep/.el-checkbox__label {
    font-size: 12px;
    color: #606266;
  }
}

.table-box {
  display: flex;
  align-items: center;
  .table-info {
    flex: 1;
  }
  .btn-box {
    width: 30px;
    text-align: center;
    i {
      font-size: 20px;
      cursor: pointer;
      &:hover {
        color: #1890ff;
      }
    }
  }
}
/deep/ .finance-table .el-input__inner {
  text-align: center;
}
/deep/ .custlist .el-select__tags {
  display: flex;
  align-items: center;
  span {
    span:first-child {
      display: flex;
      align-items: center;
      .el-select__tags-text {
        display: inline-block;
        width: 110px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      i {
        top: 2px;
      }
    }
  }
}
/deep/.finance-table .el-input__icon {
  line-height: 20px !important;
  text-align: center !important;
}
/deep/.el-dialog .el-checkbox__label {
  color: #606266 !important;
}
/deep/ .finance-table-select .el-select {
  width: 100%;
}
/deep/.el-select .el-tag {
  margin: 0 3px;
}
/deep/ .el-select .el-input .el-select__caret {
  line-height: 20px;
  height: 20px;
}
.relcust{
  /deep/.el-tag__close{
    display: none;
  }
}
</style>
