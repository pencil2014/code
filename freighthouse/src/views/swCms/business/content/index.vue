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
            <el-button size="mini" type="primary" @click="goDetail('add')">新增</el-button>
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
    <Add v-if="addOption.show" :option="addOption" />
    <Preview v-if="previewOption.show" :option="previewOption" />
    <OrderTag v-if="orderTagOption.show" :option="orderTagOption" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import FinanceTableMass from '@/views/finance/components/financeTableMass/financeTableMass'
import FinanceSearch from '@/views/finance/components/financeSearch/financeSearch'
import Preview from '../components/preview'
import Add from '../components/addAdvertise'
import OrderTag from '../components/orderTag'
import { mixin } from '@/views/finance/orderFee/orderFee/mixin'
import { routerMixin } from '@/views/finance/mixins/routerMixin'
import { newsList, newsEnable, newsDisable } from '@/api/swcms/index'
export default {
  mixins: [mixin, routerMixin],
  components: {
    FinanceTableMass,
    FinanceSearch,
    Preview,
    Add,
    OrderTag
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
    }
  },
  computed: {
    ...mapGetters(['dictMapObj']),
  },
  created() {
    let searchInputGroup = ['newsId','title', 'keywords','type', 'isEnabled']
    this.searchOption = {
      saveShow: true,
      isNotAutoLoad: false,
      addFilter: {
        defaultSearchLength: 5,
        searchInputGroup: searchInputGroup.map((key) => ({
          key,
          value: '',
          range: { min: '', max: '' },
        })),
        filterGroups: {
          newsId: { label: 'id', type: 'input' },
          title: { label: '标题', type: 'input' },
          keywords: { label: '关键词', type: 'input' },
          type: { label: '分类', type: 'select', propInDict: 'swMngNewsType', multiple: true,'collapse-tags': true },
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
          label: '详情',
          show: true,
          action: 'detail'
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
          this.goDetail('edit', row)
        } else if (action === 'enable') {
          this.enableData(row)
        } else if (action === 'disabled') {
          this.disabledData(row)
        } else if (action === 'detail') {
          this.goDetail('detail', row)
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
          prop: 'newsId',
          label: 'id',
          type: 'text',
          width: 150
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
          label: '跳转链接',
          type: 'text',
        },
        {
          prop: 'type',
          label: '分类',
          type: 'text',
          width: 120,
          formatter: ({ cellValue, row }) => {
            console.log(1, cellValue, this.dictMapObj['swMngNewsType'])
            let label = this.dictMapObj['swMngNewsType'][cellValue]
            return label
          },
        },
        {
          prop: 'keywords',
          label: '关键词',
          type: 'text',
        },
        {
          prop: 'relNewsIds',
          label: '相关推荐',
          type: 'text',
          isTool: true,
          newline: true
        },
        {
          prop: 'isHot',
          label: '是否热门',
          type: 'text',
          formatter: ({ cellValue, row }) => {
            return cellValue === 'yes' ? '是' : '否'
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
        descColumns: ['isEnabled','createdTime'],
      }
      this.finCommonSearch(data.query, this.searchOption)
      if (isSearch) {
        this.searchBackup = data.query
      }
      data.query = this.searchBackup || []
      newsList(data)
        .then((res) => {
          if (res.code === 0) {
            let { list } = res.data
            list.forEach(item => {
              if (item.relNewsInfos && item.relNewsInfos !== '') {
                item.relNewsInfos = item.relNewsInfos.split(";")
              }
              item.isTool = item.relNewsInfos
            })
            this.option1.data = list
            Object.assign(this.option1.pagination, res.data)
          }
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    goDetail(type, row) {
        let queryData = {
            type
        }
        if (type === 'edit' || type === 'detail') {
          queryData.newsId = row.newsId
        }
        this.$router.push({
            name: 'contentInfo',
            query: queryData
        })
    },
    enableData(row) {
      this.$confirmWarn('是否确认将此条内容设置为启用?', () => {
        let data = {
          newsId: row.newsId
        }
        newsEnable(data).then(res => {
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
          newsId: row.newsId
        }
        newsDisable(data).then(res => {
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
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.getData()
    })
  },
}
</script>
