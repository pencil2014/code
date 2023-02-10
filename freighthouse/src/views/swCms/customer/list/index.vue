<template>
  <div
    class="finance-page"
    v-loading="loading"
    :element-loading-text="eLoadingText"
    :element-loading-spinner="eLoadingSpinner"
    :element-loading-background="eLoadingBackground"
  >
    <FinanceSearch :searchOption="searchOption" @search="search" :border="true" />
    <div class="finance-list-container">
      <div class="money-box">
        <div class="money-box-left"></div>
        <div class="money-box-right">
          <el-radio-group size="mini" v-model="auditStatus" @change="search">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="pending">待审核</el-radio-button>
            <el-radio-button label="pass">审核通过</el-radio-button>
            <el-radio-button label="refuse">审核拒绝</el-radio-button>
          </el-radio-group>
          <el-button-group class="refresh-btn">
            <el-button type="primary" size="mini" @click="search">刷新</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTableMass :option="option1" @send-multi="sendMulti" />
    </div>
    <Verify v-if="verifyOption.show" :option="verifyOption" />
    <Edit v-if="editOption.show" :option="editOption" />
    <Priview v-if="previewOption.show" :option="previewOption" />
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import Verify from '../components/verify'
import Edit from '../components/edit'
import Priview from '../components/preview'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { industryRelation } from '@/api/base'
import { groupList, customerList } from '@/api/swcms/index'
export default {
  mixins: [mixin, routerMixin],
  components: {
    FinanceTableMass,
    FinanceSearch,
    Verify,
    Edit,
    Priview,
  },
  data() {
    return {
      loading: false,
      option1: {},
      searchOption: {},
      auditStatus: '',
      multipleSelection1: [],
      cascaderList: [],
      groupList: [],
      verifyOption: {
        show: false,
        isCrm: false,
        data: '',
      },
      editOption: {
        show: false,
        data: '',
      },
      previewOption: {
        show: false,
        title: '营业执照预览',
        src: [],
      },
    }
  },
  created() {
    this.getIndustry()
    this.getGroup()
    let searchInputGroup = ['corpName', 'emplName', 'groupCode']
    this.searchOption = {
      saveShow: true,
      isNotAutoLoad: false,
      addFilter: {
        defaultSearchLength: 3,
        searchInputGroup: searchInputGroup.map((key) => ({
          key,
          value: '',
          range: { min: '', max: '' },
        })),
        filterGroups: {
          corpName: { label: '公司名称', type: 'input' },
          groupCode: { label: '客户群组', type: 'select', selectOptions: this.groupList },
          emplName: { label: '姓名', type: 'input' },
          mobile: { label: '电话', type: 'input' },
          industry: {
            label: '所属行业',
            type: 'cascader',
            cascaderList: this.cascaderList,
            cascaderProps: {
              children: 'childList',
              label: 'industryCname',
              value: 'industryCname',
              checkStrictly: true,
            },
          },
          scale: { label: '公司规模', type: 'select', propInDict: 'orgScale' },
        },
      },
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: '审核',
          showFn: (row) => row.auditStatus === 'pending',
          action: 'verify',
          style: {
            color: '#E9851F'
          }
        },
        {
          label: '编辑',
          show: true,
          action: 'edit',
        },
      ],
      fixed: 'right',
      width: '100px',
      callback: (action, $index, row, option) => {
        if (action === 'verify') {
          this.verify(row)
        } else if (action === 'edit') {
          this.edit(row)
        }
      },
    })
    let pagination = Object.assign({}, this.option.pagination, {
      show: true,
      isNew: true,
    })
    this.option1 = Object.assign({}, this.option, {
      id: 'option1',
      data: [],
      columns: [
        {
          prop: 'corpName',
          label: '公司名称',
          type: 'text',
          width: 150,
        },
        {
          prop: 'corpType',
          label: '客户类型',
          type: 'select',
          propInDict: 'customerClassNew',
          // formatter: ({ cellValue }) => {
          //   let text = {
          //     domestic_cust: '国内直客',
          //     domestic_peer: '国内同行',
          //     foreign_cust: '国外直客',
          //     foreign_peer: '国外同行',
          //     cust: '客户',
          //     peer: '同行',
          //     department: '独立结算部门',
          //   }
          //   return text[cellValue] || ''
          // },
        },
        {
          prop: 'emplName',
          label: '姓名',
          type: 'text',
        },
        {
          prop: 'mobile',
          label: '电话',
          type: 'text',
          width: 150,
        },
        {
          prop: 'email',
          label: '邮箱',
          type: 'text',
          width: 150,
        },
        {
          prop: 'groupCode',
          label: '客户群组',
          type: 'select',
          selectOptions: this.groupList,
        },
        {
          prop: 'tagNameValue',
          label: '标签',
          type: 'text',
          width: 150,
        },
        {
          prop: 'uscc',
          label: '社信统一代码',
          type: 'text',
          width: 150,
        },
        {
          prop: 'docFileNo',
          label: '营业执照复印件',
          type: 'button',
          operationBtns: {
            show: true,
            data: [{ label: '查看' }],
            callback: (action, index, row) => {
              let { docFileNo, docFileName } = row
              if (docFileName.includes('.pdf')) {
                docFileName = 'pdf'
              } else {
                docFileName = 'sowoll'//docFileName.replace(/[\[|\]|\{|\}|\%|`]/g, '')
              }
              let src = `/base/fileView/preview/${docFileNo}/${docFileName}`
              this.previewOption.src = [src]
              this.previewOption.show = true
            },
          },
        },
        {
          prop: 'industry',
          label: '所属行业',
          type: 'text',
        },
        {
          prop: 'scale',
          label: '公司规模',
          type: 'select',
          propInDict: 'orgScale',
        },
        {
          prop: 'address',
          label: '公司地址',
          type: 'text'
        },
        {
          prop: 'auditStatus',
          label: '审核状态',
          type: 'text',
          formatter: ({ cellValue, row }) => {
            let text = {
              approving: '审批中',
              cancel: '已取消',
              pass: '审批通过',
              pending: '等待审批',
              refuse: '审批不通过',
            }
            let label = text[cellValue]
            if (cellValue === 'pass') {
              return `<span class='green'>${label}</span>`
            } else if (cellValue === 'refuse') {
              return `<span class='red'>${label}</span>`
            } else {
              return label
            }
          },
        },
        {
          prop: 'certStatus',
          label: '认证状态',
          type: 'text',
          formatter: ({ cellValue, row }) => {
            if (cellValue === 'yes') {
              return `<span class='green'>已认证</span>`
            } else if (cellValue === 'no') {
              return `<span class='grey'>未认证</span>`
            } else if (cellValue === 'process') {
              return `<span class='orange'>认证中</span>`
            } else if (cellValue === 'fail') {
              return `<span class='red'>认证失败</span>`
            } else {
              return ''
            }
          },
        },
        {
          prop: 'bdEmployeeName',
          label: '维护人',
          type: 'text',
        },
        {
          prop: 'createdTime', 
          label: '创建时间',
          type: 'text',
          width: 100,
        },
      ],
      tips: {
        text: '',
        show: false,
      },
      selection: false,
      operationBtns,
      pagination,
    })
  },
  methods: {
    // 搜索按钮
    search() {
      this.option1.pagination.currPage = 1
      this.getData(true)
    },
    // 封装请求参数并请求列表
    getData(isSearch) {
      this.loading = true
      let data = {
        currPage: this.option1.pagination.currPage,
        pageSize: this.option1.pagination.pageSize,
        query: [],
        descColumns: ['createdTime']
      }
      this.finCommonSearch(data.query, this.searchOption)
      if (this.auditStatus) {
        data.query.push({
          column: 'auditStatus',
          type: 'eq',
          value: this.auditStatus,
        })
      }
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      customerList(data)
        .then((res) => {
          if (res.code === 0) {
            let { list } = res.data
            this.option1.data = list
            Object.assign(this.option1.pagination, res.data)
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    // 审核
    verify(row) {
      this.verifyOption.data = row
      this.verifyOption.show = true
    },
    // 编辑
    edit(row) {
      this.editOption.data = row
      this.editOption.show = true
    },
    // 表格选择
    sendMulti(data, option) {
      this.multipleSelection1 = data
    },
    // 分页
    handleSizeChange(val) {
      this.option1.pagination.pageSize = val
      this.getData()
    },
    // 分页
    handleCurrentChange(val) {
      this.option1.pagination.currPage = val
      this.getData()
    },
    // 获取行业数据
    getIndustry() {
      industryRelation({})
        .then((res) => {
          if (res.code === 0) {
            let base = this.getTreeData(res.data)
            this.cascaderList.splice(0, 100, ...base)
          }
        })
        .catch(() => {})
    },
    // 转化children的空数组为undefined
    getTreeData(data) {
      data.forEach(
        (item) =>
          (item.childList = item.childList.length ? this.getTreeData(item.childList) : undefined)
      )
      return data
    },
    // 群组下拉
    getGroup() {
      let data = {
        enable: 'yes',
      }
      groupList(data)
        .then((res) => {
          let base = res.data.map((item) => {
            let { groupCname, groupCode } = item
            return {
              ...item,
              label: groupCname,
              value: groupCode,
            }
          })
          this.groupList.splice(0, 100, ...base)
        })
        .catch(() => {})
    },
  }
}
</script>

<style lang="scss" scoped>
.refresh-btn {
  margin-left: 10px;
}
</style>
