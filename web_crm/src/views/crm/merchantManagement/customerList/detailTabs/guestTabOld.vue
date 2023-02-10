<!--
 * @Description: 客情关系tab
 * @Autor: yinjunying
 * @Date: 2022-04-12 11:47:22
-->
<template>
  <div class="guarantee-cnt" :element-loading-background="eLoadingBackground" :element-loading-spinner="eLoadingSpinner" :element-loading-text="eLoadingText"
    v-loading="guestLoading">
    <div class="top-box">
      <div class="but-left">
        <el-button v-if="isEdit" type="primary" size="mini" @click="addFn">新建</el-button>
      </div>
      <div class="but-right">
        <el-radio-group v-model="listType" size="mini">
          <el-radio-button label="effective">有效</el-radio-button>
          <el-radio-button label="failure">无效</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <div v-if="listType === 'effective'">
      <FinanceTableMass :option="option1" />
    </div>
    <div v-else>
      <FinanceTableMass :option="option2" />
    </div>
    <!-- 新增/编辑客情关系 -->
    <GuestEdit :options="editGuestInfoOpts" v-if="editGuestInfoOpts.show" :custid="custid" :isSelf="isSelf" @getData="getData" />
    <!-- 失效原因 -->
    <CrmDialog :option="failureReasonOpts" @close="confirmFailure" v-if="failureReasonOpts.show" />
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { getGuestListApi, markFailureApi } from '@/api/crm/guest.js'
import CrmDialog from '@/views/crm/components/crmDialog'
import GuestEdit from './guestEdit.vue'
export default {
  name: 'CUSTo',
  supplierShow: true,
  label: '客情关系',
  components: {
    FinanceTableMass,
    CrmDialog,
    GuestEdit
  },
  inject: ['defaultRules'],
  mixins: [mixin],
  props: ['orgid', 'custid', 'isSelf', 'isClient', 'isPotential'],
  data () {
    return {
      guestLoading: false,
      listType: "effective",
      option1: {},
      option2: {},
      // 新增/编辑客情关系弹框配置
      editGuestInfoOpts: {
        show: false,
        isEdit: false,
        form: {}
      },
      // 填写失效原因弹框配置
      failureReasonOpts: {
        show: false,
        showClear: true,
        btnLoading: false,
        title: '填写失效原因',
        text: '失效',
        labelWidth: '100px',
        formItems: [
          {
            label: '失效原因',
            type: 'textarea',
            prop: 'reason',
            rules:
              [
                { ...this.defaultRules, message: '失效原因必填' },
                { max: 512, message: '失效原因最大长度限制512位', trigger: 'blur' }
              ]
          }
        ],
        form: {
          reason: ''
        }
      },
      curRow: {} //当前行数据
    }
  },
  created () {
    // 公共一级表头
    const commonCol1 = [
      {
        prop: 'type',
        label: '类别',
        type: 'text',
        width: 100
      }
    ]
    const commonCol2 = [
      {
        prop: 'numberOfVisit',
        label: '拜访次数',
        type: 'text',
        width: 100
      }
    ]
    // 有效一级表头
    const columns1 = [
      ...commonCol2,
      {
        prop: 'createdName',
        label: '创建人',
        type: 'text',
        width: 130
      },
      {
        prop: 'createdTime',
        label: '创建时间',
        type: 'text',
        width: 130
      }
    ]
    // 无效一级表头
    const columns2 = [
      ...commonCol2,
      {
        prop: 'invalidName',
        label: '失效人',
        type: 'text',
        width: 130
      },
      {
        prop: 'invalidTime',
        label: '失效时间',
        type: 'text',
        width: 130
      },
      {
        prop: 'invalidReason',
        label: '失效原因',
        type: 'text',
        width: 130
      }
    ]
    // 通用二级表头
    this.colgroups = [
      {
        title: '我司',
        columns: [
          { prop: 'ourCompanyPosition', label: '职位', type: 'text' },
          { prop: 'ourCompanyResponsibility', label: '职责', type: 'text' },
          { prop: 'ourCompanyName', label: '姓名', type: 'text' },
          { prop: 'ourCompanyPhone', label: '联系方式', type: 'text' },
          { prop: 'ourCompanyExperience', label: '行业经验', type: 'text', width: 150 }
        ]
      },
      {
        title: '客户',
        columns: [
          { prop: 'customerPosition', label: '职位', type: 'text' },
          { prop: 'customerResponsibility', label: '职责', type: 'text' },
          { prop: 'customerName', label: '姓名', type: 'text' },
          { prop: 'customerPhone', label: '联系方式', type: 'text' }
        ]
      }
    ]
    // 有效列表表头配置
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      $name: 'guestList',
      edit: true,
      operationBtns: {
        show: true,
        fixed: 'right',
        width: '120px',
        data: [],
        callback: (action, $index, row, option) => {
          if (action === 'edit') {
            this.editFn(row)
          } else if (action === 'failure') {
            this.failureFn(row)
          }
        }
      },
      tips: false,
      selection: {
        show: false
      },
      sortable: false,
      data: [],
      columns: commonCol1,
      columns2: columns1,
      colgroups: this.colgroups
    })
    if (this.isEdit) {
      this.option1.operationBtns.data = [
        {
          label: '编辑',
          type: 'text',
          show: true,
          action: 'edit'
        }, {
          label: '失效',
          type: 'text',
          show: true,
          action: 'failure'
        }
      ]
    } else {
      this.option1.operationBtns.show = false
    }
    // 无效列表表头配置
    this.option2 = Object.assign({}, this.option, {
      id: 'option2',
      $name: 'guestList',
      operationBtns: false,
      tips: false,
      selection: {
        show: false
      },
      sortable: false,
      data: [],
      columns: commonCol1,
      columns2: columns2,
      colgroups: this.colgroups
    })
  },
  activated () {
    this.getData()
  },
  computed: {
    // 销售
    isBd () {
      return (
        this.$store.state.user.roles.includes('bd') ||
        this.$store.state.user.roles.includes('obd')
      )
    },
    // 客户部
    isCts () {
      return this.$store.state.user.roles.includes('cts')
    },
    // 管理者
    isManager () {
      return this.$store.state.user.roles.includes('manager')
    },
    // 是否能进行新建、编辑、失效操作
    // 1. “编辑、失效”只能对本人创建的“客情关系”进行操作；
    // 2. 可对“潜在客户、委托人”类型的客户进行“新增、编辑、失效” 客情关系；
    // 3. 销售维护人才能操作
    // 4. 管理者和客户部只能查看
    // 5. 20220526新增：既是管理者又是销售，能新建、编辑、失效，所以不管是不是管理者，只要有bd/obd角色的就可以新建、编辑、失效
    isEdit () {
      return this.isSelf && (this.isClient || this.isPotential) && this.isBd && !this.isCts && (this.listType === 'effective')
    }
  },
  methods: {
    /**
     * @description: 获取有效/无效列表数据
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-13 15:07:06
     */
    getData () {
      this.guestLoading = true
      let data = {
        custid: this.custid
      }
      getGuestListApi(data)
        .then((res) => {
          if (res.code === 0) {
            let list = res.data
            if (list.length) {
              this.option1.data = list.filter(item => item.status === 'effect')
              this.option2.data = list.filter(item => item.status === 'remove')
            }
          }
        })
        .catch(() => { })
        .finally(() => {
          this.guestLoading = false
        })
    },
    /**
     * @description: 新增客情关系
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-15 10:12:33
     */
    addFn () {
      this.editGuestInfoOpts.show = true
      this.editGuestInfoOpts.isEdit = false
    },
    /**
     * @description:编辑客情关系
     * @param {Object} row 行数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-12 16:09:34
     */
    editFn (row) {
      this.editGuestInfoOpts.show = true
      this.editGuestInfoOpts.isEdit = true
      this.editGuestInfoOpts.form = JSON.parse(
        JSON.stringify(Object.assign({}, this.editGuestInfoOpts.form, row))
      )
    },
    /**
     * @description: 标记失效
     * @param {Object} row 行数据
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-13 10:13:22
     */
    failureFn (row) {
      this.failureReasonOpts.show = true
      this.curRow = row
    },
    /**
     * @description: 确定标记失效
     * @param {Boolean} tag false-只做关闭弹框处理 true-调用标记失效接口
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-13 17:16:15
     */
    confirmFailure (tag) {
      if (!tag) {
        return this.closeDialog()
      }
      this.failureReasonOpts.btnLoading = true
      let data = {
        custid: this.custid,
        oid: this.curRow.oid,
        ...this.failureReasonOpts.form
      }
      markFailureApi(data).then((res) => {
        if (res.code === 0) {
          this.$msgSucClose('标记成功！')
          this.closeDialog()
          this.getData()
        }
      })
        .catch(() => { })
        .finally(() => {
          this.failureReasonOpts.btnLoading = false
        })
    },
    /**
     * @description: 关闭填写失效原因弹框
     * @param {*}
     * @return {*}
     * @author: yinjunying
     * @Date: 2022-04-13 17:17:02
     */
    closeDialog () {
      this.failureReasonOpts.show = false
      this.failureReasonOpts.form.reason = ""
    }
  }
}
</script>

<style lang="scss" scope>
.top-box {
  margin: 5px 0;
  display: flex;
  .but-left {
    margin-left: 8px;
  }
  .but-right {
    flex: 1;
    text-align: right;
    margin-right: 8px;
  }
}
</style>