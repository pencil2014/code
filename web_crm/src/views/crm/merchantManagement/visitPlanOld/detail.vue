<template>
  <div class="finance-page">
    <div class="detail-title">
      <div class="title-left">拜访计划</div>
      <div class="title-right">
        <el-button @click="cancel" size="mini">取消</el-button>
        <el-button v-if="isShowSave && !isNotSelf" type="primary" @click="save" size="mini">保存</el-button>
      </div>
    </div>
    <div style="padding: 14px 16px 0 16px;">
      <el-form :model="form" ref="form" :rules="rulesForm" :inline="true" size="mini">
        <el-form-item label="年月时间" prop="planMonth">
          <el-date-picker
            :disabled="!isAdd"
            type="month"
            style="width:146px"
            v-model="form.planMonth"
            format="yyyy-MM"
            value-format="yyyy-MM"
            placeholder="选择日期时间"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="姓名" prop="employeeName">
          <el-input v-model="form.employeeName" disabled></el-input>
        </el-form-item>
        <el-form-item label="部门" prop="employeeDeptName">
          <el-input v-model="form.employeeDeptName" disabled></el-input>
        </el-form-item>
        <el-form-item label="职位" prop="employeeTitleName">
          <el-input v-model="form.employeeTitleName" disabled></el-input>
        </el-form-item>
        <el-button v-if="isShowSave && !isNotSelf" style="float:right" @click="add" size="mini">新增计划</el-button>
      </el-form>
      <!-- <div style="overflow:hidden"></div> -->
    </div>
    <FinanceTable :option="option1" />
    <CrmDialog :option="dialogOption" @close="close" />
  </div>
</template>
<script>
import FinanceTable from '@/views/finance/components/financeTableMass/financeTableMass'
import CrmDialog from '@/views/crm/components/crmDialog'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import VISITPLAN from '@/api/crm/visitPlan'
export default {
  name: 'invistDetail',
  mixins: [mixin, routerMixin],
  components: {
    FinanceTable,
    CrmDialog,
  },
  inject: ['defaultRules'],
  computed: {
    isAdd() {
      return this.$route.name == 'VisitPlanAdd'
    },
    localUserName() {
      return this.$store.state.user.name
    },
  },
  watch: {
    // wWs7ywMy bd0001
    isNotSelf(val) {
      // console.log(this.localUserName)
      // console.log(this.userName)
      // console.log(val)
      if (val) {
        this.option1.edit = false
      }
    },
  },
  data() {
    return {
      isShowSave: true,
      // 列表页--表格配置
      option1: {},
      form: {
        items: [],
        planMonth: '',
        employeeId: '',
        employeeName: '',
        employeeDeptCode: '',
        employeeDeptName: '',
        employeeTitleCode: '',
        employeeTitleName: '',
      },
      formAdd: {},
      rulesForm: {
        planMonth: [{ required: true, message: ' ', trigger: 'blur' }],
      },
      dialogOption: {
        show: false,
        showClear: true,
        title: '新增拜访计划',
        text: '新增',
        // width: '400px',
        labelWidth: '118px',
        form: { phaseDate: [], planVisitNum: '', remark: '' },
        formItems: [
          { label: '时间区间', prop: 'phaseDate', type: 'date', rules: this.defaultRules, dateType: 'daterange' },
          { label: '计划拜访客户总数', prop: 'planVisitNum', type: 'number', rules: this.defaultRules },
          { label: '情况说明', prop: 'remark', type: 'textarea', maxlength: 200 },
        ],
      },
      isNotSelf: false,
      userName: '',
    }
  },
  created() {
    // pickerOptions: {
    //   disabledDate(time) {
    //     return time.getTime() > Date.now();
    //   },
    // 表格配置
    this.option1 = {
      ...this.option,
      id: 'option1',
      pagination: false,
      operationBtns: false,
      selection: false,
      edit: true,
      data: [],
    }
    let columns = [
      {
        prop: 'phaseDate',
        type: 'text',
        label: '时间区间',
        width: '180',
        formatter: ({ row }) => row.phaseBeginDate + ' ~ ' + row.phaseEndDate,
      },
      { prop: 'planVisitNum', type: 'text', width: '100', label: '计划拜访总数' },
      { prop: 'realVisitNum', type: 'number', width: '100', label: '实际拜访总数', max: 100 },
      { prop: 'remark', label: '情况说明', type: 'input', maxlength: 200, minWidth: '200' },
    ]
    this.option1.columns = columns
    this.init()
  },
  methods: {
    //返回
    cancel() {
      this.routerBack()
    },
    init() {
      let user = this.$store.state.user
      this.userName = user.name
      if (user.name !== this.localUserName) {
        this.isNotSelf = true
      }
      if (this.isAdd) {
        let date = new Date()
        let month = date.getMonth() + 1
        this.form = {
          planMonth: date.getFullYear() + '-' + (month < 10 ? '0' + month : month),
          employeeId: user.userId,
          employeeName: user.name,
          employeeDeptCode: user.deptCode,
          employeeDeptName: user.deptName,
          employeeTitleCode: user.titleCode,
          employeeTitleName: user.titleName,
        }
      } else {
        let row = JSON.parse(this.$route.query.row)
        this.rulesForm.planMonth = []
        // console.log(row)
        if (row.employeeId != user.userId) {
          this.option1.edit = false
          this.isShowSave = false
        }
        Object.assign(this.form, row)
        this.option1.data = row.items.map((item) => ({ ...item, edit: true }))
      }
    },
    save() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          let { employeeId, employeeDeptCode, employeeTitleCode, planMonth } = this.form
          let data = { employeeId, employeeDeptCode, employeeTitleCode, planMonth, items: this.option1.data }
          if (this.form.planId !== undefined) {
            data.planId = this.form.planId
          }
          if (this.option1.data.find(({ realVisitNum }) => realVisitNum - 100 > 0 || realVisitNum - 0 < 0)) {
            return this.$msgErrClose('拜访次数只能是0~100')
          }
          let flag = false
          let planTime = new Date(planMonth)
          let arr = this.option1.data.map(({ phaseBeginDate, phaseEndDate }) => {
            let beginTime = new Date(phaseBeginDate.slice(0, 7))
            let endTime = new Date(phaseEndDate.slice(0, 7))
            if (planTime - beginTime < 0 || planTime - endTime > 0) flag = true
          })
          if (flag) {
            return this.$msgErrClose('年月时间与时间区间不匹配！')
          }
          VISITPLAN.add(data).then((res) => {
            this.$msgSucClose('保存成功！')
            this.routerBack(true)
          })
        }else{
          return this.$msgErrClose('请将必填项填写完整！')
        }
      })
    },
    add() {
      if (this.option1.data.length >= 4) {
        return this.$msgErrClose('每个计划最多四个子计划！')
      }
      this.dialogOption.show = true
      // this.isShowDialog = true
    },
    close(tag) {
      if (tag) {
        let form = this.dialogOption.form
        let phaseBeginDate = form.phaseDate[0]
        let phaseEndDate = form.phaseDate[1]
        let flag = false
        let planTime = new Date(this.form.planMonth)
        let beginTime = new Date(phaseBeginDate.slice(0, 7))
        let endTime = new Date(phaseEndDate.slice(0, 7))
        if (planTime - beginTime < 0 || planTime - endTime > 0) flag = true
        if (flag) {
          return this.$msgErrClose('年月时间与时间区间不匹配！')
        }
        let { planVisitNum, remark } = form
        if (planVisitNum - 100 > 0 || planVisitNum - 0 < 0) {
          return this.$msgErrClose('拜访次数只能是0~100')
        }
        this.option1.data.push({ phaseBeginDate, phaseEndDate, planVisitNum, remark, realVisitNum: 0, edit: true })
      }
      this.dialogOption.show = false
    },
  },
}
</script>
<style scoped lang="scss">
.finance-page ::v-deep {
  .detail-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 36px;
    padding: 0 8px;
    border-radius: 4px 4px 0px 0px;
    border-bottom: 1px solid #e9e9e9;
  }
  .title-left {
    font-size: 13px;
    font-weight: 600;
    color: #222222;
    line-height: 20px;
  }
}
.el-form .el-form-item {
  margin-right: 20px;
}
</style>
