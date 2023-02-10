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
        <div class="money-box-left">
          <el-button-group>
            <el-button @click="customColumnsPopShow=true" size="mini">自定义表头</el-button>
          </el-button-group>
            <el-button-group  style="margin-left: 10px">
              <el-button size="mini" type="primary" @click="showAdd">新增</el-button>
            </el-button-group>
        </div>
        <div class="money-box-right">
          <el-button-group>
            <el-button size="mini" type="primary" @click="search">刷新</el-button>
          </el-button-group>
        </div>
      </div>
      <FinanceTableMass :option="option1" @send-multi="sendMulti"/>
    </div>
    <div v-if="customColumnsPopShow">
      <CustomColumns
        ref="CustomColumns"
        :columnsBase="selfColumnsBase"
        :configColumns="configColumns"
        :props="{key:'prop',label:'label'}"
        @close="customColumnsPopClose"
      />
    </div>
    <Add v-if="addOption.show" :option="addOption" />
    <Preview v-if="previewOption.show" :option="previewOption" />
    <OrderTag v-if="orderTagOption.show" :option="orderTagOption" />
  </div>
</template>

<script>
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import CustomColumns from '@/views/finance/components/customColumns/index'
import Preview from '../components/preview'
import Add from '../components/addAdvertise'
import OrderTag from '../components/orderTag'
import { mixin } from '@/views/finance/mixins/mixin'
import { mixin2 } from '@/views/finance/mixins/mixin2'
import { adList, adEnable, adDisable } from '@/api/swcms/index'
export default {
  mixins: [mixin, mixin2],
  components: {
    FinanceTableMass,
    FinanceSearch,
    Preview,
    Add,
    OrderTag,
    CustomColumns
  },
  data() {
    return {
      loading: false,
      option1: {},
      searchOption: {},
      multipleSelection1: [],
      orderTagOption: {
        show: false,
        data: {},
      },
      addOption: {
        show: false,
        data: {},
        type: 'add'
      },
      previewOption: {
        show: false,
        title: '图片',
        src: [],
      },
      customColumnsPopShow: false,
      selfColumnsBase: []
    }
  },
  created() {
    let searchInputGroup = ['title', 'type', 'isEnabled']
    this.selfColumnsBase = [
      {
        prop: 'orderTag',
        label: '排序',
        type: 'text',
        width: 150,
        type: 'button',
        operationBtns: {
          show: true,
          callback: (action, index, row) => {
            this.orderTagOption.data = row
            this.orderTagOption.show = true
          },
        },
      },
      {
        prop: 'title',
        label: '标题',
        type: 'text',
      },
      {
        prop: 'fileNo',
        label: '图片',
        width: 100,
        type: 'button',
        operationBtns: {
          show: true,
          data: [{ label: '查看' }],
          callback: (action, index, row) => {
            let { fileNo } = row
            let src = `/base/fileView/preview/${fileNo}/sowoll`
            this.previewOption.src = [src]
            this.previewOption.show = true
          },
        },
      },
      {
        prop: 'jumpUrl',
        label: 'URL',
        type: 'text',
      },
      {
        prop: 'type',
        label: '位置',
        type: 'text',
        width: 120,
        formatter: ({ cellValue, row }) => {
          let text = {
            home: '首页',
            news: '咨询'
          }
          let label = text[cellValue]
          return label
        },
      },
      {
        prop: 'isEnabled',
        label: '状态',
        type: 'text',
        width: 120,
        formatter: ({ cellValue, row }) => {
          let text = {
            yes: '启用',
            no: '禁用'
          }
          let label = text[cellValue]
          return label
        },
      },
      {
        prop: 'effectiveTime',
        label: '生效时间',
        type: 'text',
        width: 240,
        formatter: ({ cellValue, row }) => {
          let label = `${cellValue}~${row.expireTime}`
          return label
        },
      },
      {
        prop: 'createdTime',
        label: '创建时间',
        type: 'text',
        width: 140,
      },
      {
        prop: 'createdName',
        label: '创建人',
        type: 'text',
        width: 120,
      }
    ]
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
          title: { label: '标题', type: 'input' },
          type: { label: '位置', type: 'select', propInDict: 'swMngAdvertiseType' },
          isEnabled: { label: '状态', type: 'select', propInDict: 'swMngAdvertiseIsEnabled' },
        },
      },
    }
    let operationBtns = Object.assign({}, this.option.operationBtns, {
      data: [
        {
          label: '编辑',
          show: true,
          action: 'edit'
        },
        {
          label: '启用',
          showFn: (row) => row.isEnabled === 'no',
          action: 'enable',
          style: {
            color: '#33B18A',
          },
        },
        {
          label: '禁用',
          showFn: (row) => row.isEnabled === 'yes',
          action: 'disabled',
          style: {
            color: '#CD4130'
          }
        }
      ],
      width: 140,
      fixed: 'right',
      callback: (action, $index, row, option) => {
        if (action === 'edit') {
          this.showEdit(row)
        } else if (action === 'enable') {
          this.enableData(row)
        } else if (action === 'disabled') {
          this.disabledData(row)
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
      columns: [...this.selfColumnsBase],
      tips: {
        text: '',
        show: false,
      },
      selection: false,
      operationBtns,
      pagination,
      border: true
    })
    this.configColumns.push(...this.selfColumnsBase.map((item) => item.prop))
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
        descColumns: ['createdTime'],
      }
      if (this.customColumnsKeys && this.customColumnsKeys.length) {
				data.columns = this.customColumnsKeys
			}
      this.finCommonSearch(data.query, this.searchOption)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      adList(data)
        .then((res) => {
          if (res.code === 0) {
            let { list } = res.data
            if (res.data.configColumns && res.data.configColumns.length) {
              let columns = res.data.configColumns
              this.option1.columns = columns.map((prop) => this.selfColumnsBase.find((item) => item.prop === prop))
              this.selfColumnsBase.filter((item) => columns.indexOf(item.prop) > -1)
              this.configColumns = res.data.configColumns
            }
            this.option1.data = list
            Object.assign(this.option1.pagination, res.data)
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    showAdd() {
        this.addOption.type = 'add'
        this.addOption.data = {}
        this.addOption.show = true
    },
    showEdit(row) {
      this.addOption.type = 'edit'
      this.addOption.data = row
      this.addOption.show = true
    },
    enableData(row) {
      this.$confirmWarn('是否确认将此条内容设置为启用?', () => {
        let data = {
          adId: row.adId
        }
        adEnable(data).then(res => {
          if (res.code === 0) {
            this.getData()
            this.$msgSucClose('启用成功！')
          }
        }).catch(()=>{})
      })
    },
    disabledData(row) {
      this.$confirmWarn('是否确认将此条内容设置为禁用?', () => {
        let data = {
          adId: row.adId
        }
        adDisable(data).then(res => {
        if (res.code === 0) {
          this.getData()
          this.$msgSucClose('禁用成功！')
        }
      }).catch(()=>{})
      })
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
    sendMulti(data, option) {
      this.multipleSelection1 = data
    },
  },
}
</script>
